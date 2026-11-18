// Edge Functions da cobrança com o Asaas e o banco simulados. Rodar com: deno test testes/funcoes/
import { assert, assertEquals } from "jsr:@std/assert@1";
import { handle as assinatura, Deps as DA } from "../../supabase/functions/assinatura/index.ts";
import { handle as webhook, Deps as DW } from "../../supabase/functions/asaas-webhook/index.ts";
import { cpfValido, hojeSP, igualSeguro, readEnv } from "../../supabase/functions/_shared/asaas.ts";

const env = readEnv((k) => ({ ASAAS_API_KEY: "chave-teste", ASAAS_WEBHOOK_TOKEN: "token-com-mais-de-32-caracteres-xyz" } as Record<string, string>)[k]);
type Call = { method: string; url: string; body: any; headers: Record<string, string> };

function asaasFake(resp: Record<string, any>) {
  const calls: Call[] = [];
  const f = async (url: string, init?: RequestInit) => {
    const method = init?.method || "GET", path = url.replace(env.base, "");
    calls.push({ method, url: path, body: init?.body ? JSON.parse(String(init.body)) : null, headers: init?.headers as Record<string, string> });
    const r = resp[method + " " + path] ?? resp[method + " " + path.replace(/\/[^/]+$/, "/*")];
    if (r instanceof Error) return new Response(JSON.stringify({ errors: [{ description: r.message }] }), { status: 400 });
    return new Response(JSON.stringify(r ?? {}), { status: 200 });
  };
  return { f, calls };
}
function rpcFake(answers: Record<string, any>) {
  const calls: { fn: string; args: any }[] = [];
  const rpc = async (fn: string, args: any) => {
    calls.push({ fn, args });
    const a = answers[fn];
    if (a instanceof Error) throw a;
    return typeof a === "function" ? a(args) : a ?? null;
  };
  return { rpc, calls };
}
const req = (body: unknown, jwt = "jwt-ok") => new Request("https://x/assinatura", { method: "POST", headers: { Authorization: "Bearer " + jwt }, body: JSON.stringify(body) });
const user = async (jwt: string) => (jwt === "jwt-ok" ? { id: "u1", email: "pai@teste.local" } : null);
const QUOTE = { plan: "anual", full: 199, first: 99.5, coupon: "BLACKFRIDAY50", cycles: 1 };

Deno.test("CPF, data de Brasília e comparação do token", () => {
  assert(cpfValido("529.982.247-25"));
  assert(!cpfValido("529.982.247-24"));
  assert(!cpfValido("111.111.111-11"));
  assertEquals(hojeSP(new Date("2026-11-18T02:30:00Z")), "2026-11-17");   // 23h30 em Brasília ainda é dia 17
  assert(igualSeguro("abc", "abc") && !igualSeguro("abc", "abd") && !igualSeguro("abc", "ab"));
  assertEquals(readEnv(() => undefined).base, "https://api-sandbox.asaas.com/v3");
  assertEquals(readEnv((k) => (k === "ASAAS_ENV" ? "producao" : undefined)).base, "https://api.asaas.com/v3");
});

Deno.test("sem login não assina", async () => {
  const a = asaasFake({}), r = rpcFake({});
  const res = await assinatura(req({ acao: "assinar" }, "jwt-ruim"), { env, fetch: a.f, user, rpc: r.rpc } as DA);
  assertEquals(res.status, 401);
  assertEquals(a.calls.length, 0);
});

Deno.test("CPF inválido não chega ao Asaas", async () => {
  const a = asaasFake({}), r = rpcFake({});
  const res = await assinatura(req({ acao: "assinar", plano: "anual", forma: "cartao", nome: "Maria Silva", cpf: "123" }), { env, fetch: a.f, user, rpc: r.rpc });
  assertEquals(res.status, 400);
  assertEquals((await res.json()).error, "cpf_invalido");
  assertEquals(a.calls.length, 0);
});

Deno.test("celular sem DDD não chega ao Asaas", async () => {
  const a = asaasFake({}), r = rpcFake({});
  const res = await assinatura(req({ acao: "assinar", plano: "anual", forma: "cartao", nome: "Maria Silva", cpf: "52998224725", celular: "99998888" }), { env, fetch: a.f, user, rpc: r.rpc });
  assertEquals((await res.json()).error, "celular_invalido");
  assertEquals(a.calls.length, 0);
});

Deno.test("cartão: cria o cliente e o Checkout recorrente com o valor do cupom", async () => {
  const a = asaasFake({ "POST /customers": { id: "cus_1" }, "POST /checkouts": { id: "chk_1", link: "https://sandbox.asaas.com/checkoutSession/show/chk_1" } });
  const r = rpcFake({ billing_quote: QUOTE, billing_customer: null, billing_start: { id: "s1", delete_asaas_subscriptions: [] } });
  const res = await assinatura(req({ acao: "assinar", plano: "anual", forma: "cartao", nome: "Maria Silva", cpf: "529.982.247-25", celular: "(86) 99999-8888" }), { env, fetch: a.f, user, rpc: r.rpc });
  assertEquals(res.status, 200);
  assertEquals((await res.json()).url, "https://sandbox.asaas.com/checkoutSession/show/chk_1");
  const cus = a.calls.find((c) => c.url === "/customers")!;
  assertEquals(cus.body, { name: "Maria Silva", cpfCnpj: "52998224725", email: "pai@teste.local", phone: "86999998888", mobilePhone: "86999998888", externalReference: "u1" });
  assertEquals(cus.headers["access_token"], "chave-teste");
  assertEquals(cus.headers["User-Agent"], "folhinha-vip");
  const chk = a.calls.find((c) => c.url === "/checkouts")!.body;
  assertEquals(chk.billingTypes, ["CREDIT_CARD"]);
  assertEquals(chk.chargeTypes, ["RECURRENT"]);
  assertEquals(chk.customer, "cus_1");
  assertEquals(chk.items[0].value, 99.5);
  assertEquals(chk.subscription.cycle, "YEARLY");
  assertEquals(chk.callback.successUrl, "https://www.folhinha.vip/?pagamento=ok#/planos");
  assertEquals(r.calls.map((c) => c.fn), ["billing_can_start", "billing_quote", "billing_customer", "billing_set_customer", "billing_start"]);
  const st = r.calls.find((c) => c.fn === "billing_start")!.args;
  assertEquals([st.p_method, st.p_checkout, st.p_asaas_sub, st.p_customer], ["cartao", "chk_1", null, "cus_1"]);
});

Deno.test("Pix/boleto: assinatura com fatura e apaga a antiga que aguardava", async () => {
  const a = asaasFake({
    "PUT /customers/cus_1": { id: "cus_1" },
    "POST /subscriptions": { id: "sub_2" },
    "GET /subscriptions/sub_2/payments": { data: [{ id: "pay_1", invoiceUrl: "https://sandbox.asaas.com/i/pay_1" }] },
    "DELETE /subscriptions/sub_velha": { deleted: true },
  });
  const r = rpcFake({ billing_quote: { plan: "mensal", full: 24.9, first: 24.9, coupon: null }, billing_customer: "cus_1",
                      billing_start: { id: "s2", delete_asaas_subscriptions: ["sub_velha"] } });
  const res = await assinatura(req({ acao: "assinar", plano: "mensal", forma: "pix_boleto", nome: "Maria Silva", cpf: "52998224725", celular: "86999998888" }), { env, fetch: a.f, user, rpc: r.rpc });
  assertEquals(await res.json(), { url: "https://sandbox.asaas.com/i/pay_1" });
  const sub = a.calls.find((c) => c.method === "POST" && c.url === "/subscriptions")!.body;
  assertEquals([sub.customer, sub.billingType, sub.cycle, sub.value], ["cus_1", "UNDEFINED", "MONTHLY", 24.9]);
  assert(a.calls.some((c) => c.method === "PUT" && c.url === "/customers/cus_1"), "atualiza nome e CPF do cliente que já existe");
  assert(a.calls.some((c) => c.method === "DELETE" && c.url === "/subscriptions/sub_velha"), "apaga a assinatura antiga");
});

Deno.test("Pix/boleto: se o banco recusar, desfaz a assinatura no Asaas", async () => {
  const a = asaasFake({ "PUT /customers/cus_1": {}, "POST /subscriptions": { id: "sub_3" }, "GET /subscriptions/sub_3/payments": { data: [] }, "DELETE /subscriptions/sub_3": {} });
  const r = rpcFake({ billing_quote: QUOTE, billing_customer: "cus_1", billing_start: new Error('P0001: assinatura_ativa') });
  const res = await assinatura(req({ acao: "assinar", plano: "anual", forma: "pix_boleto", nome: "Maria Silva", cpf: "52998224725", celular: "86999998888" }), { env, fetch: a.f, user, rpc: r.rpc });
  assertEquals(res.status, 409);
  assertEquals((await res.json()).error, "assinatura_ativa");
  assert(a.calls.some((c) => c.method === "DELETE" && c.url === "/subscriptions/sub_3"));
});

Deno.test("com assinatura ativa, nem chama o Asaas", async () => {
  const a = asaasFake({}), r = rpcFake({ billing_can_start: new Error("assinatura_ativa") });
  const res = await assinatura(req({ acao: "assinar", plano: "anual", forma: "cartao", nome: "Maria Silva", cpf: "52998224725", celular: "86999998888" }), { env, fetch: a.f, user, rpc: r.rpc });
  assertEquals(res.status, 409);
  assertEquals(a.calls.length, 0);
});

Deno.test("erro do Asaas vira 502 com a descrição", async () => {
  const a = asaasFake({ "POST /customers": new Error("O CPF informado é inválido.") });
  const r = rpcFake({ billing_quote: QUOTE, billing_customer: null });
  const res = await assinatura(req({ acao: "assinar", plano: "anual", forma: "cartao", nome: "Maria Silva", cpf: "52998224725", celular: "86999998888" }), { env, fetch: a.f, user, rpc: r.rpc });
  assertEquals(res.status, 502);
  assertEquals((await res.json()).detail, "O CPF informado é inválido.");
});

Deno.test("cancelar apaga no Asaas e marca cancelada", async () => {
  const a = asaasFake({ "DELETE /subscriptions/sub_9": { deleted: true } });
  const r = rpcFake({ billing_cancel: { id: "s9", status: "ativa", asaas_subscription_id: "sub_9" } });
  const res = await assinatura(req({ acao: "cancelar" }), { env, fetch: a.f, user, rpc: r.rpc });
  assertEquals(await res.json(), { ok: true });
  assertEquals(r.calls.map((c) => c.fn), ["billing_cancel", "billing_canceled"]);
});

Deno.test("webhook: token errado é recusado e não chega ao banco", async () => {
  const r = rpcFake({});
  const res = await webhook(new Request("https://x", { method: "POST", headers: { "asaas-access-token": "errado" }, body: "{}" }), { env, fetch: asaasFake({}).f, rpc: r.rpc } as DW);
  assertEquals(res.status, 401);
  assertEquals(r.calls.length, 0);
});

Deno.test("webhook: grava o aviso e volta o valor ao preço cheio", async () => {
  const a = asaasFake({ "PUT /subscriptions/sub_pix": { id: "sub_pix" } });
  const r = rpcFake({ billing_webhook: { actions: [{ action: "update_value", id: "s1", asaas_subscription_id: "sub_pix", value: 199 }] } });
  const body = { id: "evt_1", event: "PAYMENT_RECEIVED", payment: { id: "pay_1" } };
  const res = await webhook(new Request("https://x", { method: "POST", headers: { "asaas-access-token": env.webhookToken }, body: JSON.stringify(body) }), { env, fetch: a.f, rpc: r.rpc });
  assertEquals(res.status, 200);
  assertEquals(r.calls[0], { fn: "billing_webhook", args: { p: body } });
  assertEquals(a.calls[0].body, { value: 199, updatePendingPayments: false });
  assertEquals(r.calls[1], { fn: "billing_value_updated", args: { p_id: "s1", p_value: 199 } });
});

Deno.test("webhook: banco fora do ar responde 500 para o Asaas tentar de novo", async () => {
  const r = rpcFake({ billing_webhook: new Error("conexão") });
  const res = await webhook(new Request("https://x", { method: "POST", headers: { "asaas-access-token": env.webhookToken }, body: JSON.stringify({ id: "e", event: "X" }) }), { env, fetch: asaasFake({}).f, rpc: r.rpc });
  assertEquals(res.status, 500);
});
