-- Plano VIP, fase 3: assinatura pelo Asaas (cartão com renovação automática; Pix ou boleto com fatura a cada ciclo). Especificação: planos/PLANOS.md.
--
-- *** AINDA NÃO APLICADA EM PRODUÇÃO. Aplicar só com autorização do professor, DEPOIS de 2026-11-18-cupons.sql. Não é repetível (cria tabelas). ***
--
-- Quem fala com o Asaas são as Edge Functions (supabase/functions): "assinatura" (o pai assina ou cancela) e "asaas-webhook" (o Asaas avisa
-- pagamentos). A chave do Asaas fica só nos segredos das Edge Functions. Toda a regra fica aqui no banco, nas funções billing_*, que só o
-- service_role chama (as Edge Functions), e é testada em testes/banco/assinatura.sh.
--
-- O que muda
--  * app_settings: preco_mensal_centavos (2490), preco_anual_centavos (19900), assinatura_carencia_dias (3). O /adm edita.
--  * billing_customers: a conta do pai e o cliente dela no Asaas (o CPF fica só no Asaas).
--  * subscriptions: uma linha por tentativa de assinatura. Status: aguardando (link gerado, ainda sem pagamento), ativa, atrasada,
--    cancelada (o VIP vale até o fim do período pago) e expirada (o link venceu sem pagamento).
--  * payments: as cobranças do Asaas, para o painel dos pais mostrar o histórico e o link da fatura em aberto.
--  * billing_events: todo aviso do Asaas, gravado antes de processar (o Asaas pode mandar o mesmo aviso mais de uma vez: o id do evento
--    garante que cada um vale uma vez só). Um erro ao processar fica gravado em billing_events.error e o aviso pode ser reprocessado.
--  * Cada pagamento confirmado estende o VIP (entitlements, source 'assinatura') até o vencimento + 1 ciclo + carência. Estorno ou
--    chargeback encerram o VIP na hora.
--  * Cupom de desconto guardado (fase 2) vale na assinatura: o 1º valor já vem com desconto; depois das cobranças do cupom, o banco pede
--    para a Edge Function voltar o valor da assinatura ao preço cheio no Asaas.
--  * adult_billing(): o que o painel dos pais mostra (preços, desconto do cupom, assinatura atual, cobranças).
--
-- Reverter: drop das funções billing_* e adult_billing, das tabelas billing_events, payments, subscriptions, billing_customers e das
-- chaves de app_settings (as linhas de entitlements com source 'assinatura' ficam: apague-as se for o caso).
begin;

insert into public.app_settings(key, value) values
  ('preco_mensal_centavos', 2490), ('preco_anual_centavos', 19900), ('assinatura_carencia_dias', 3)
  on conflict (key) do nothing;

create table public.billing_customers(
  user_id uuid primary key references auth.users(id) on delete cascade,
  asaas_customer_id text not null unique,
  created_at timestamptz not null default now()
);

create table public.subscriptions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('mensal','anual')),
  method text not null check (method in ('cartao','pix_boleto')),
  status text not null default 'aguardando' check (status in ('aguardando','ativa','atrasada','cancelada','expirada')),
  asaas_customer_id text not null,
  asaas_checkout_id text unique,
  asaas_subscription_id text unique,
  pay_url text,
  value_full numeric(8,2) not null check (value_full > 0),
  value_now numeric(8,2) not null check (value_now > 0),
  coupon_code text,
  coupon_cycles_left int,          -- com cupom: cobranças com desconto que ainda faltam (nulo = desconto para sempre)
  paid_cycles int not null default 0,
  entitlement_id uuid references public.entitlements(id) on delete set null,
  next_due date,
  cancel_requested_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user on public.subscriptions(user_id, created_at desc);
create index subscriptions_customer on public.subscriptions(asaas_customer_id);

create table public.payments(
  asaas_payment_id text primary key,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  value numeric(8,2),
  status text,
  billing_type text,
  due_date date,
  paid_at timestamptz,
  invoice_url text,
  credited boolean not null default false,   -- já estendeu o VIP (CONFIRMED e RECEIVED chegam para o mesmo pagamento)
  updated_at timestamptz not null default now()
);
create index payments_sub on public.payments(subscription_id, due_date desc);

create table public.billing_events(
  id text primary key,
  event text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  result jsonb,
  error text
);

alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.billing_events enable row level security;
revoke all on table public.billing_customers, public.subscriptions, public.payments, public.billing_events from anon, authenticated;

-- ---------- preço e desconto ----------
-- preço do plano em reais e o desconto do cupom guardado (se valer para o plano). A Asaas não cobra menos de R$ 5,00.
create or replace function public.billing_quote(p_user uuid, p_plan text) returns jsonb
language plpgsql stable security definer set search_path to 'public' as $$
declare full_ numeric; first_ numeric; c coupons%rowtype;
begin
  if p_plan not in ('mensal', 'anual') then raise exception 'plano_invalido'; end if;
  full_ := round(coalesce(app_setting(case p_plan when 'mensal' then 'preco_mensal_centavos' else 'preco_anual_centavos' end, null),
                          case p_plan when 'mensal' then 2490 else 19900 end) / 100.0, 2);
  select co.* into c from coupon_redemptions r join coupons co on co.code = r.code
   where r.user_id = p_user and r.status = 'reservado' and co.kind in ('percentual', 'valor') and co.plans in ('ambos', p_plan)
   order by r.redeemed_at desc limit 1;
  if c.code is null then
    return jsonb_build_object('plan', p_plan, 'full', full_, 'first', full_, 'coupon', null);
  end if;
  first_ := case c.kind when 'percentual' then round(full_ * (100 - c.value) / 100, 2) else full_ - c.value end;
  first_ := greatest(first_, 5.00);
  return jsonb_build_object('plan', p_plan, 'full', full_, 'first', first_, 'coupon', c.code, 'coupon_text', public._coupon_text(c),
                            'cycles', c.cycles);
end $$;

-- ---------- início da assinatura (Edge Function "assinatura") ----------
create or replace function public.billing_customer(p_user uuid) returns text
language sql stable security definer set search_path to 'public' as $$ select asaas_customer_id from billing_customers where user_id = p_user $$;

create or replace function public.billing_set_customer(p_user uuid, p_customer text) returns void
language sql security definer set search_path to 'public' as $$
  insert into billing_customers(user_id, asaas_customer_id) values (p_user, p_customer)
  on conflict (user_id) do update set asaas_customer_id = excluded.asaas_customer_id
$$;

-- pode assinar? (não pode ter outra assinatura valendo)
create or replace function public.billing_can_start(p_user uuid) returns void
language plpgsql stable security definer set search_path to 'public' as $$
begin
  if exists(select 1 from subscriptions where user_id = p_user and status in ('ativa', 'atrasada')) then raise exception 'assinatura_ativa'; end if;
end $$;

-- grava a assinatura criada no Asaas. Assinatura "aguardando" anterior da mesma conta deixa de valer (o pai trocou de ideia).
-- Devolve as assinaturas do Asaas que a Edge Function deve apagar lá (as aguardando de Pix/boleto antigas).
create or replace function public.billing_start(p_user uuid, p_plan text, p_method text, p_customer text, p_checkout text, p_asaas_sub text,
  p_pay_url text, p_quote jsonb) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare sid uuid; old_subs text[];
begin
  perform public.billing_can_start(p_user);
  select coalesce(array_agg(asaas_subscription_id) filter (where asaas_subscription_id is not null), '{}') into old_subs
    from subscriptions where user_id = p_user and status = 'aguardando';
  update subscriptions set status = 'expirada', updated_at = now() where user_id = p_user and status = 'aguardando';
  insert into subscriptions(user_id, plan, method, asaas_customer_id, asaas_checkout_id, asaas_subscription_id, pay_url, value_full, value_now,
                            coupon_code, coupon_cycles_left)
    values (p_user, p_plan, p_method, p_customer, p_checkout, p_asaas_sub, p_pay_url, (p_quote->>'full')::numeric, (p_quote->>'first')::numeric,
            p_quote->>'coupon', case when p_quote->>'coupon' is null then null else (p_quote->>'cycles')::int end)
    returning id into sid;
  return jsonb_build_object('id', sid, 'delete_asaas_subscriptions', to_jsonb(old_subs));
end $$;

-- cancelar: devolve a assinatura do Asaas a apagar. A aguardando só deixa de valer.
create or replace function public.billing_cancel(p_user uuid) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s subscriptions%rowtype;
begin
  select * into s from subscriptions where user_id = p_user and status in ('ativa', 'atrasada', 'aguardando') order by created_at desc limit 1 for update;
  if not found then raise exception 'sem_assinatura'; end if;
  if s.status = 'aguardando' then
    update subscriptions set status = 'expirada', updated_at = now() where id = s.id;
  else
    update subscriptions set cancel_requested_at = now(), updated_at = now() where id = s.id;
  end if;
  return jsonb_build_object('id', s.id, 'status', s.status, 'asaas_subscription_id', s.asaas_subscription_id);
end $$;

-- a Edge Function apagou a assinatura no Asaas (o webhook SUBSCRIPTION_DELETED também chega e dá no mesmo)
create or replace function public.billing_canceled(p_id uuid) returns void
language sql security definer set search_path to 'public' as $$
  update subscriptions set status = 'cancelada', canceled_at = coalesce(canceled_at, now()), updated_at = now()
   where id = p_id and status in ('ativa', 'atrasada')
$$;

-- a Edge Function voltou o valor ao preço cheio no Asaas (fim das cobranças com desconto)
create or replace function public.billing_value_updated(p_id uuid, p_value numeric) returns void
language sql security definer set search_path to 'public' as $$
  update subscriptions set value_now = p_value, updated_at = now() where id = p_id
$$;

-- ---------- avisos do Asaas (Edge Function "asaas-webhook") ----------
-- acha a nossa assinatura de um objeto do Asaas: pelo id da assinatura; senão (cartão: a assinatura nasce no Checkout e o aviso pode chegar
-- antes do SUBSCRIPTION_CREATED) pela assinatura de cartão aguardando do mesmo cliente, que passa a ter esse id.
create or replace function public._billing_find(p_asaas_sub text, p_customer text) returns uuid
language plpgsql security definer set search_path to 'public' as $$
declare sid uuid;
begin
  if p_asaas_sub is null then return null; end if;
  select id into sid from subscriptions where asaas_subscription_id = p_asaas_sub;
  if sid is null and p_customer is not null then
    select id into sid from subscriptions
     where asaas_customer_id = p_customer and method = 'cartao' and asaas_subscription_id is null and status = 'aguardando'
     order by created_at desc limit 1 for update;
    if sid is not null then update subscriptions set asaas_subscription_id = p_asaas_sub, updated_at = now() where id = sid; end if;
  end if;
  return sid;
end $$;

create or replace function public._billing_event(p jsonb) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare ev text := p->>'event'; pay jsonb := p->'payment'; sub jsonb := p->'subscription'; chk jsonb := p->'checkout';
  sid uuid; s subscriptions%rowtype; pr payments%rowtype; due date; new_end timestamptz; eid uuid; actions jsonb := '[]'::jsonb;
  grace int := coalesce(app_setting('assinatura_carencia_dias', 3)::int, 3);
begin
  if ev like 'SUBSCRIPTION_%' then
    sid := public._billing_find(sub->>'id', sub->>'customer');
    if sid is null then return jsonb_build_object('ignored', 'assinatura_desconhecida'); end if;
    if ev in ('SUBSCRIPTION_DELETED', 'SUBSCRIPTION_INACTIVATED') then
      update subscriptions set status = case when status = 'aguardando' then 'expirada' else 'cancelada' end,
             canceled_at = coalesce(canceled_at, now()), updated_at = now()
       where id = sid and status in ('aguardando', 'ativa', 'atrasada');
    elsif sub ? 'nextDueDate' then
      update subscriptions set next_due = (sub->>'nextDueDate')::date, updated_at = now() where id = sid;
    end if;
    return jsonb_build_object('subscription', sid);
  end if;

  if ev in ('CHECKOUT_EXPIRED', 'CHECKOUT_CANCELED') then
    update subscriptions set status = 'expirada', updated_at = now() where asaas_checkout_id = chk->>'id' and status = 'aguardando';
    return jsonb_build_object('checkout', chk->>'id');
  end if;

  if ev not like 'PAYMENT_%' or pay is null then return jsonb_build_object('ignored', ev); end if;
  sid := public._billing_find(pay->>'subscription', pay->>'customer');
  if sid is null then return jsonb_build_object('ignored', 'cobranca_sem_assinatura'); end if;
  select * into s from subscriptions where id = sid for update;
  due := (pay->>'dueDate')::date;

  insert into payments(asaas_payment_id, subscription_id, user_id, value, status, billing_type, due_date, invoice_url)
    values (pay->>'id', sid, s.user_id, (pay->>'value')::numeric, pay->>'status', pay->>'billingType', due, pay->>'invoiceUrl')
  on conflict (asaas_payment_id) do update set value = excluded.value, status = excluded.status, billing_type = excluded.billing_type,
    due_date = excluded.due_date, invoice_url = coalesce(excluded.invoice_url, payments.invoice_url), updated_at = now()
  returning * into pr;

  if ev in ('PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED') then
    update payments set paid_at = coalesce(paid_at, now()) where asaas_payment_id = pr.asaas_payment_id;
    if not pr.credited then
      update payments set credited = true where asaas_payment_id = pr.asaas_payment_id;
      -- o VIP vai até o vencimento desta cobrança + 1 ciclo + carência (nunca encolhe)
      new_end := (coalesce(due, current_date) + case s.plan when 'mensal' then interval '1 month' else interval '1 year' end + make_interval(days => grace))::timestamptz;
      if s.entitlement_id is not null then
        update entitlements set ends_at = greatest(ends_at, new_end), revoked_at = null where id = s.entitlement_id;
      else
        insert into entitlements(user_id, source, ends_at, note) values (s.user_id, 'assinatura', new_end, 'Assinatura ' || s.plan)
          returning id into eid;
        update subscriptions set entitlement_id = eid where id = sid;
      end if;
      update subscriptions set status = 'ativa', paid_cycles = paid_cycles + 1, updated_at = now() where id = sid;
      -- cupom: na 1ª cobrança paga ele passa a "usado"; ao acabarem as cobranças com desconto, o valor volta ao cheio no Asaas
      if s.coupon_code is not null then
        if s.paid_cycles = 0 then
          update coupon_redemptions set status = 'usado' where user_id = s.user_id and code = s.coupon_code and status = 'reservado';
        end if;
        if s.coupon_cycles_left is not null then
          update subscriptions set coupon_cycles_left = greatest(coupon_cycles_left - 1, 0) where id = sid;
          if s.coupon_cycles_left - 1 <= 0 and s.value_now <> s.value_full and s.asaas_subscription_id is not null then
            actions := actions || jsonb_build_object('action', 'update_value', 'id', sid, 'asaas_subscription_id', s.asaas_subscription_id, 'value', s.value_full);
          end if;
        end if;
      end if;
    end if;
  elsif ev = 'PAYMENT_OVERDUE' then
    update subscriptions set status = 'atrasada', updated_at = now() where id = sid and status = 'ativa';
  elsif ev in ('PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED') then
    -- estorno ou chargeback: o VIP desta assinatura termina agora
    if pr.credited and s.entitlement_id is not null then
      update entitlements set revoked_at = now() where id = s.entitlement_id;   -- um pagamento novo depois disso reativa (revoked_at volta a nulo)
    end if;
  end if;
  return jsonb_build_object('subscription', sid, 'payment', pr.asaas_payment_id, 'actions', actions);
end $$;

-- grava o aviso e processa uma vez só. Um erro ao processar fica gravado e NÃO derruba a resposta ao Asaas (a fila dele não trava).
create or replace function public.billing_webhook(p jsonb) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare eid text := p->>'id'; r jsonb; done timestamptz;
begin
  if eid is null or p->>'event' is null then raise exception 'evento_invalido'; end if;
  insert into billing_events(id, event, payload) values (eid, p->>'event', p) on conflict (id) do nothing;
  select processed_at into done from billing_events where id = eid for update;
  if done is not null then return jsonb_build_object('duplicate', true); end if;
  begin
    r := public._billing_event(p);
    update billing_events set processed_at = now(), result = r, error = null where id = eid;
  exception when others then
    update billing_events set error = sqlerrm where id = eid;
    return jsonb_build_object('error', sqlerrm);
  end;
  return r;
end $$;

-- ---------- painel dos pais ----------
create or replace function public.adult_billing() returns jsonb
language plpgsql stable security definer set search_path to 'public' as $$
declare uid uuid := auth.uid(); s subscriptions%rowtype; open_pay payments%rowtype;
begin
  if uid is null then raise exception 'nao_autenticado' using errcode = '28000'; end if;
  select * into s from subscriptions where user_id = uid and status in ('aguardando', 'ativa', 'atrasada', 'cancelada')
   order by (status in ('ativa', 'atrasada')) desc, created_at desc limit 1;
  if s.id is not null then
    select * into open_pay from payments where subscription_id = s.id and status in ('PENDING', 'OVERDUE') order by due_date limit 1;
  end if;
  return jsonb_build_object(
    'quote', jsonb_build_object('mensal', public.billing_quote(uid, 'mensal'), 'anual', public.billing_quote(uid, 'anual')),
    'subscription', case when s.id is null then null else jsonb_build_object(
      'plan', s.plan, 'method', s.method, 'status', s.status, 'value_now', s.value_now, 'value_full', s.value_full, 'coupon', s.coupon_code,
      'next_due', coalesce(s.next_due, open_pay.due_date), 'pay_url', coalesce(open_pay.invoice_url, case when s.status = 'aguardando' then s.pay_url end),
      'open_due', open_pay.due_date, 'cancel_requested', s.cancel_requested_at is not null, 'created_at', s.created_at) end,
    'payments', coalesce((select jsonb_agg(jsonb_build_object('due', p.due_date, 'value', p.value, 'status', p.status, 'paid_at', p.paid_at,
                                                              'url', p.invoice_url) order by p.due_date desc)
                            from (select * from payments where user_id = uid order by due_date desc limit 12) p), '[]'::jsonb));
end $$;

-- ---------- /adm: os preços e a carência em Parâmetros ----------
-- (admin_set_settings aceita só as chaves da lista; a fase 3 acrescenta as do preço)
create or replace function public.admin_set_settings(p jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  limits constant jsonb := '{"stamps_needed":[1,10],"normal_acertos":[50,100],"ouro_acertos":[50,100],"ouro_tempo":[10,100],
    "ouro_carimbos":[1,10],"salto_acertos":[50,100],"salto_tempo":[10,100],"salto_por_semana":[0,14],
    "dias_sem_carimbo_voltar":[1,10],"bloqueio_salto_dias":[0,60],"teto_anos_padrao":[0,9],"virada_mes":[1,12],"virada_dia":[1,28],"limite_mesa":[1,5],"pausas_max":[0,10],"modo_folha":[0,1],
    "plano_folhas_gratis":[1,10],"plano_albuns_gratis":[1,5],"plano_alunos_gratis":[1,10],"plano_alunos_vip":[1,20],"plano_teste_dias":[0,60],
    "preco_mensal_centavos":[500,99900],"preco_anual_centavos":[500,999900],"assinatura_carencia_dias":[0,15]}';
  k text; v jsonb; num numeric; lo numeric; hi numeric;
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if jsonb_typeof(p) <> 'object' then raise exception 'parametros_invalidos'; end if;
  for k, v in select * from jsonb_each(p) loop
    if not limits ? k or jsonb_typeof(v) <> 'number' then raise exception 'parametro_invalido: %', k; end if;
    num := (v #>> '{}')::numeric;
    lo := (limits->k->>0)::numeric; hi := (limits->k->>1)::numeric;
    if num <> trunc(num) or num < lo or num > hi then raise exception 'valor_invalido: %', k; end if;
    update app_settings set value = num, updated_at = now(), updated_by = auth.uid() where key = k;
  end loop;
  -- coerência: salto exige mais que ouro, que exige mais que normal; salto é mais rápido que ouro
  if app_setting('ouro_acertos') < app_setting('normal_acertos') or app_setting('salto_acertos') < app_setting('ouro_acertos')
     or app_setting('salto_tempo') > app_setting('ouro_tempo') then raise exception 'limiares_incoerentes'; end if;
  -- o gatilho dos alunos recalcula os carimbos necessários do nível (padrão ou próprio do nível)
  update students set stamps = stamps
   where stamps > public.level_stamps(level_idx) or stamps_needed <> public.level_stamps(level_idx);
  return (select jsonb_object_agg(key, value) from app_settings);
end $function$;

-- ---------- permissões ----------
revoke all on function public.billing_quote(uuid, text), public.billing_customer(uuid), public.billing_set_customer(uuid, text),
  public.billing_can_start(uuid), public.billing_start(uuid, text, text, text, text, text, text, jsonb), public.billing_cancel(uuid),
  public.billing_canceled(uuid), public.billing_value_updated(uuid, numeric), public._billing_find(text, text), public._billing_event(jsonb),
  public.billing_webhook(jsonb) from public, anon, authenticated;
grant execute on function public.billing_quote(uuid, text), public.billing_customer(uuid), public.billing_set_customer(uuid, text),
  public.billing_can_start(uuid), public.billing_start(uuid, text, text, text, text, text, text, jsonb), public.billing_cancel(uuid),
  public.billing_canceled(uuid), public.billing_value_updated(uuid, numeric), public.billing_webhook(jsonb) to service_role;
revoke all on function public.adult_billing() from public, anon;
grant execute on function public.adult_billing() to authenticated;

commit;
