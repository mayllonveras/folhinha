// Conversa com a API do Asaas e o que as duas Edge Functions da cobrança compartilham.
// A chave do Asaas vem SÓ dos segredos das Edge Functions (ASAAS_API_KEY). Nunca no código, nunca no navegador.
//
// Segredos (Supabase > Edge Functions > Secrets):
//   ASAAS_API_KEY        chave da API do Asaas (a do Sandbox para testar; a de Produção quando for cobrar de verdade)
//   ASAAS_ENV            "sandbox" (padrão) ou "producao"
//   ASAAS_WEBHOOK_TOKEN  o mesmo texto cadastrado como "Token de autenticação" do Webhook no Asaas (32 caracteres ou mais)
//   SITE_URL             endereço do site, para o Asaas devolver o pai depois do pagamento (padrão: https://www.folhinha.vip)
// O Supabase já entrega SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY às Edge Functions.

export type Env = { apiKey: string; base: string; pageBase: string; siteUrl: string; webhookToken: string };

export function readEnv(get: (k: string) => string | undefined): Env {
  const prod = (get("ASAAS_ENV") || "sandbox").toLowerCase() === "producao";
  return {
    apiKey: get("ASAAS_API_KEY") || "",
    base: prod ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3",
    pageBase: prod ? "https://asaas.com" : "https://sandbox.asaas.com",
    siteUrl: (get("SITE_URL") || "https://www.folhinha.vip").replace(/\/+$/, ""),
    webhookToken: get("ASAAS_WEBHOOK_TOKEN") || "",
  };
}

export class AsaasError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

// Chamada à API do Asaas. Erro do Asaas vira AsaasError com a descrição que ele manda.
export async function asaas(env: Env, f: Fetch, method: string, path: string, body?: unknown): Promise<any> {
  if (!env.apiKey) throw new AsaasError(500, "asaas_sem_chave");
  const r = await f(env.base + path, {
    method,
    headers: { "Content-Type": "application/json", "User-Agent": "folhinha-vip", "access_token": env.apiKey },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const txt = await r.text();
  let data: any = null;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = { raw: txt }; }
  if (!r.ok) {
    const msg = data?.errors?.[0]?.description || data?.errors?.[0]?.code || ("HTTP " + r.status);
    throw new AsaasError(r.status, msg);
  }
  return data;
}

// CPF com os dígitos verificadores certos (só números, 11 dígitos, não todos iguais)
export function cpfValido(v: string): boolean {
  const c = (v || "").replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  for (const n of [9, 10]) {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(c[i]) * (n + 1 - i);
    const d = (s * 10) % 11 % 10;
    if (d !== Number(c[n])) return false;
  }
  return true;
}

// a data de hoje no horário de Brasília (AAAA-MM-DD), que é o que o Asaas espera em nextDueDate
export function hojeSP(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

// comparação que não vaza o tamanho do acerto pelo tempo de resposta
export function igualSeguro(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return d === 0;
}

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
