// Edge Function "assinatura": o pai assina o VIP ou cancela. Chamada pelo painel com o login do pai (verify_jwt ligado).
//   { acao: "assinar", plano: "mensal" | "anual", forma: "cartao" | "pix_boleto", nome, cpf, celular }  ->  { url }  (página de pagamento do Asaas)
//   { acao: "cancelar" }                                                                       ->  { ok: true }
// Cartão: Asaas Checkout recorrente (o pai digita o cartão na página do Asaas e a assinatura renova sozinha).
// Pix ou boleto: assinatura do Asaas com fatura a cada ciclo (o pai escolhe Pix ou boleto na fatura).
// A regra (preço, cupom, quem pode assinar, VIP) fica no banco: funções billing_* (migracoes/2026-11-18-assinatura.sql).
import { createClient } from "npm:@supabase/supabase-js@2";
import { asaas, AsaasError, cpfValido, CORS, Env, Fetch, hojeSP, json, readEnv } from "../_shared/asaas.ts";

export type Deps = {
  env: Env;
  fetch: Fetch;
  user: (jwt: string) => Promise<{ id: string; email?: string } | null>;
  rpc: (fn: string, args: Record<string, unknown>) => Promise<any>;
};

const ERROS_DO_BANCO = ["assinatura_ativa", "sem_assinatura", "plano_invalido"];

export async function handle(req: Request, d: Deps): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "metodo" });
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const u = jwt ? await d.user(jwt) : null;
  if (!u) return json(401, { error: "nao_autenticado" });
  let b: any;
  try { b = await req.json(); } catch { return json(400, { error: "dados_invalidos" }); }
  try {
    if (b?.acao === "assinar") { const r = await assinar(d, u, b); return json(r.error ? 400 : 200, r); }
    if (b?.acao === "cancelar") return json(200, await cancelar(d, u.id));
    return json(400, { error: "acao_invalida" });
  } catch (e) {
    const m = String((e as Error)?.message || e);
    const code = ERROS_DO_BANCO.find((k) => m.includes(k));
    if (code) return json(409, { error: code });
    if (e instanceof AsaasError) { console.error("asaas", e.status, m); return json(502, { error: "asaas", detail: m }); }
    console.error("assinatura", m);
    return json(500, { error: "falha" });
  }
}

async function assinar(d: Deps, u: { id: string; email?: string }, b: any): Promise<{ url?: string; error?: string }> {
  const plano = b.plano, forma = b.forma, nome = String(b.nome || "").trim().slice(0, 100), cpf = String(b.cpf || "").replace(/\D/g, ""),
    celular = String(b.celular || "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (plano !== "mensal" && plano !== "anual") throw new Error("plano_invalido");
  if (forma !== "cartao" && forma !== "pix_boleto") return { error: "forma_invalida" };
  if (nome.length < 3) return { error: "nome_invalido" };
  if (!cpfValido(cpf)) return { error: "cpf_invalido" };
  if (!/^[1-9]{2}9?\d{8}$/.test(celular)) return { error: "celular_invalido" };   // DDD + 8 ou 9 dígitos (o Checkout do Asaas exige telefone)

  await d.rpc("billing_can_start", { p_user: u.id });
  const quote = await d.rpc("billing_quote", { p_user: u.id, p_plan: plano });

  // telefone: vai sempre em phone; em mobilePhone só quando é celular (DDD + 9 dígitos começando com 9), senão o Asaas recusa
  const fones: Record<string, string> = { phone: celular };
  if (/^[1-9]{2}9\d{8}$/.test(celular)) fones.mobilePhone = celular;
  // cliente do Asaas: um por conta; o nome e o CPF podem mudar a cada assinatura
  let customer: string | null = await d.rpc("billing_customer", { p_user: u.id });
  if (customer) {
    await asaas(d.env, d.fetch, "PUT", "/customers/" + customer, { name: nome, cpfCnpj: cpf, ...fones });
  } else {
    const c = await asaas(d.env, d.fetch, "POST", "/customers", { name: nome, cpfCnpj: cpf, email: u.email, ...fones, externalReference: u.id });
    customer = c.id as string;
    await d.rpc("billing_set_customer", { p_user: u.id, p_customer: customer });
  }

  const cycle = plano === "mensal" ? "MONTHLY" : "YEARLY", desc = "Folhinha VIP " + plano, hoje = hojeSP();
  const voltar = d.env.siteUrl + "/#/planos";
  let start: any;
  if (forma === "cartao") {
    const chk = await asaas(d.env, d.fetch, "POST", "/checkouts", {
      billingTypes: ["CREDIT_CARD"], chargeTypes: ["RECURRENT"], minutesToExpire: 120, customer, externalReference: u.id,
      callback: { successUrl: d.env.siteUrl + "/?pagamento=ok#/planos", cancelUrl: voltar, expiredUrl: voltar },
      items: [{ name: desc, description: "Família, até 4 crianças", quantity: 1, value: Number(quote.first) }],
      subscription: { cycle, nextDueDate: hoje },
    });
    const url = chk.link || (d.env.pageBase + "/checkoutSession/show?id=" + chk.id);
    start = await d.rpc("billing_start", { p_user: u.id, p_plan: plano, p_method: "cartao", p_customer: customer, p_checkout: chk.id,
      p_asaas_sub: null, p_pay_url: url, p_quote: quote });
    start.url = url;
  } else {
    const sub = await asaas(d.env, d.fetch, "POST", "/subscriptions", {
      customer, billingType: "UNDEFINED", nextDueDate: hoje, value: Number(quote.first), cycle, description: desc, externalReference: u.id,
      callback: { successUrl: d.env.siteUrl + "/?pagamento=ok#/planos", autoRedirect: true },
    });
    let url: string | null = null;
    try {
      const pays = await asaas(d.env, d.fetch, "GET", "/subscriptions/" + sub.id + "/payments");
      url = pays?.data?.[0]?.invoiceUrl || null;
    } catch (e) { console.error("faturas", (e as Error).message); }
    try {
      start = await d.rpc("billing_start", { p_user: u.id, p_plan: plano, p_method: "pix_boleto", p_customer: customer, p_checkout: null,
        p_asaas_sub: sub.id, p_pay_url: url, p_quote: quote });
    } catch (e) {
      // o banco recusou (outra assinatura ficou ativa no meio do caminho): desfaz no Asaas
      await asaas(d.env, d.fetch, "DELETE", "/subscriptions/" + sub.id).catch(() => {});
      throw e;
    }
    start.url = url;
  }
  // assinaturas de Pix/boleto que ainda aguardavam pagamento e foram trocadas por esta: apaga no Asaas (para não gerar fatura)
  for (const old of (start.delete_asaas_subscriptions || []) as string[]) {
    await asaas(d.env, d.fetch, "DELETE", "/subscriptions/" + old).catch((e) => console.error("apagar antiga", old, e.message));
  }
  if (!start.url) return { error: "sem_link" };
  return { url: start.url };
}

async function cancelar(d: Deps, user: string) {
  const c = await d.rpc("billing_cancel", { p_user: user });
  if (c.asaas_subscription_id) {
    await asaas(d.env, d.fetch, "DELETE", "/subscriptions/" + c.asaas_subscription_id).catch((e) => {
      if (!(e instanceof AsaasError && e.status === 404)) throw e;   // já não existia no Asaas: segue
    });
  }
  if (c.status === "ativa" || c.status === "atrasada") await d.rpc("billing_canceled", { p_id: c.id });
  return { ok: true };
}

if (import.meta.main) {
  const url = Deno.env.get("SUPABASE_URL")!, service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const deps: Deps = {
    env: readEnv((k) => Deno.env.get(k)),
    fetch: (i, init) => fetch(i, init),
    user: async (jwt) => { const r = await admin.auth.getUser(jwt); return r.error || !r.data.user ? null : { id: r.data.user.id, email: r.data.user.email }; },
    rpc: async (fn, args) => { const r = await admin.rpc(fn, args); if (r.error) throw new Error(r.error.message); return r.data; },
  };
  Deno.serve((req) => handle(req, deps));
}
