// Edge Function "asaas-webhook": o Asaas avisa aqui cada mudança de cobrança, assinatura e Checkout.
// Sem login do Supabase (verify_jwt desligado): quem prova que é o Asaas é o header asaas-access-token, igual a ASAAS_WEBHOOK_TOKEN.
// O banco (billing_webhook) grava o aviso, processa uma vez só e devolve o que ainda precisa ser feito no Asaas
// (voltar o valor da assinatura ao preço cheio quando acabam as cobranças com desconto do cupom, e apagar a assinatura
// no Asaas quando um pagamento é estornado ou vira chargeback, para o Asaas não cobrar de novo).
// Responde 200 mesmo quando o processamento dá erro (o erro fica em billing_events.error): assim a fila do Asaas não trava.
// Só responde erro quando o banco não grava o aviso, para o Asaas tentar de novo.
import { createClient } from "npm:@supabase/supabase-js@2";
import { asaas, AsaasError, Env, Fetch, igualSeguro, readEnv } from "../_shared/asaas.ts";

export type Deps = { env: Env; fetch: Fetch; rpc: (fn: string, args: Record<string, unknown>) => Promise<any> };

export async function handle(req: Request, d: Deps): Promise<Response> {
  if (req.method !== "POST") return new Response("metodo", { status: 405 });
  const tok = (req.headers.get("asaas-access-token") || "").trim(), esperado = d.env.webhookToken.trim();
  if (!esperado || !igualSeguro(tok, esperado)) {
    // só os tamanhos vão para o log, nunca o token
    console.warn("webhook recusado: token", JSON.stringify({ recebido: tok.length, esperado: esperado.length, temHeader: req.headers.has("asaas-access-token") }));
    return new Response("token", { status: 401 });
  }
  let p: any;
  try { p = await req.json(); } catch { console.warn("webhook recusado: corpo não é JSON"); return new Response("json", { status: 400 }); }
  if (!p?.id || !p?.event) { console.warn("webhook recusado: sem id ou event"); return new Response("evento", { status: 400 }); }
  let r: any;
  try { r = await d.rpc("billing_webhook", { p }); }
  catch (e) { console.error("webhook banco", (e as Error).message); return new Response("banco", { status: 500 }); }
  for (const a of (r?.actions || []) as any[]) {
    if (a.action === "update_value") {
      try {
        await asaas(d.env, d.fetch, "PUT", "/subscriptions/" + a.asaas_subscription_id, { value: Number(a.value), updatePendingPayments: false });
        await d.rpc("billing_value_updated", { p_id: a.id, p_value: Number(a.value) });
      } catch (e) {
        // fica registrado no log da função; o /adm mostra o valor ainda com desconto e dá para corrigir no painel do Asaas
        console.error("update_value", a.asaas_subscription_id, (e as Error).message);
      }
    } else if (a.action === "cancel_subscription") {
      // o banco já marcou a assinatura como cancelada; aqui ela é apagada no Asaas. Se ela já não existe lá (404), está certo.
      try {
        await asaas(d.env, d.fetch, "DELETE", "/subscriptions/" + a.asaas_subscription_id);
      } catch (e) {
        if (!(e instanceof AsaasError && e.status === 404)) console.error("cancel_subscription", a.asaas_subscription_id, (e as Error).message);   // corrigir no painel do Asaas
      }
    }
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}

if (import.meta.main) {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const deps: Deps = {
    env: readEnv((k) => Deno.env.get(k)),
    fetch: (i, init) => fetch(i, init),
    rpc: async (fn, args) => { const r = await admin.rpc(fn, args); if (r.error) throw new Error(r.error.message); return r.data; },
  };
  Deno.serve((req) => handle(req, deps));
}
