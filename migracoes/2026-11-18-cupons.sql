-- Plano VIP, fase 2: cupons. Especificação: planos/PLANOS.md.
--
-- *** APLICADA EM PRODUÇÃO em 17/11/2026 (projeto folhinha-calculo), com autorização do professor. NÃO REAPLIQUE: ela cria tabelas. ***
-- Conferido depois: tabelas criadas sem acesso direto pela API; adult_redeem_coupon liberada só para quem entrou.
--
-- Tipos de cupom
--  * meses: dá N meses de VIP na hora (entitlements, source 'cupom'). Soma a partir do fim do VIP atual.
--  * vitalicio: dá VIP para sempre na hora.
--  * percentual / valor: desconto na assinatura (R$ ou %), em 1 cobrança, em N cobranças ou para sempre, no plano mensal, anual ou nos dois.
--    Como a assinatura só chega na fase 3, o desconto fica GUARDADO na conta (coupon_redemptions.status = 'reservado') e a fase 3 aplica
--    na hora de assinar. Um desconto novo substitui o guardado.
--
-- Regras de cada cupom: período de validade, limite total de usos, uma vez por conta, só para quem nunca assinou, ativo ou não.
-- Um cupom usado não é apagado: o /adm desativa (o histórico fica).
--
-- Contra tentativa e erro de códigos: no máximo 10 códigos errados por conta em 1 hora (coupon_attempts). Por isso adult_redeem_coupon
-- não levanta erro: devolve {ok:false, why:...} e a tentativa errada fica gravada.
--
-- Funções novas: adult_redeem_coupon(código), adult_coupons() para o painel dos pais; admin_coupons(), admin_save_coupon(jsonb),
-- admin_set_coupon_active(código, ativo) para o /adm.
--
-- Reverter: drop das funções e das tabelas coupon_attempts, coupon_redemptions e coupons (as concessões já dadas ficam em entitlements, com source 'cupom').
begin;

create table public.coupons(
  code text primary key check (code ~ '^[A-Z0-9-]{3,30}$'),
  kind text not null check (kind in ('percentual','valor','meses','vitalicio')),
  value numeric(8,2) not null default 0,
  plans text not null default 'ambos' check (plans in ('mensal','anual','ambos')),
  cycles int check (cycles between 1 and 120),          -- desconto: nulo = para sempre; 1 = só a 1ª cobrança
  valid_from timestamptz,
  valid_until timestamptz,
  max_uses int check (max_uses >= 1),
  only_new boolean not null default false,
  active boolean not null default true,
  note text not null default '',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_until is null or valid_from is null or valid_until > valid_from),
  check (case kind when 'percentual' then value between 1 and 100
                   when 'valor' then value between 0.01 and 9999
                   when 'meses' then value between 1 and 120 and value = trunc(value)
                   else value = 0 end)
);

create table public.coupon_redemptions(
  id uuid primary key default gen_random_uuid(),
  code text not null references public.coupons(code) on update cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('aplicado','reservado','usado','cancelado')),
  entitlement_id uuid references public.entitlements(id) on delete set null,
  redeemed_at timestamptz not null default now(),
  unique (code, user_id)
);
create index coupon_redemptions_user on public.coupon_redemptions(user_id);

create table public.coupon_attempts(
  user_id uuid not null references auth.users(id) on delete cascade,
  at timestamptz not null default now()
);
create index coupon_attempts_user on public.coupon_attempts(user_id, at);

alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.coupon_attempts enable row level security;
revoke all on table public.coupons, public.coupon_redemptions, public.coupon_attempts from anon, authenticated;

-- texto do cupom para as telas (pais e /adm)
create or replace function public._coupon_text(c public.coupons) returns text
language sql stable set search_path to 'public' as $$
  select case c.kind
    when 'vitalicio' then 'VIP vitalício'
    when 'meses' then c.value::int || case when c.value = 1 then ' mês' else ' meses' end || ' de VIP'
    else (case when c.kind = 'percentual' then trim(to_char(c.value, 'FM990')) || '% de desconto'
               else 'R$ ' || replace(trim(to_char(c.value, 'FM9990.00')), '.', ',') || ' de desconto' end)
         || case when c.cycles is null then ' em todas as cobranças'
                 when c.cycles = 1 then ' na 1ª cobrança'
                 else ' nas ' || c.cycles || ' primeiras cobranças' end
         || case c.plans when 'mensal' then ' do plano mensal' when 'anual' then ' do plano anual' else '' end
  end
$$;

-- ---------- pais: usar um cupom ----------
create or replace function public.adult_redeem_coupon(p_code text) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare uid uuid := auth.uid(); k text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9-]', '', 'g'));
  c coupons%rowtype; base timestamptz; eid uuid; used int; why text;
begin
  if uid is null then raise exception 'nao_autenticado' using errcode = '28000'; end if;
  if (select count(*) from coupon_attempts where user_id = uid and at > now() - interval '1 hour') >= 10 then
    return jsonb_build_object('ok', false, 'why', 'cupom_muitas_tentativas');
  end if;
  select * into c from coupons where code = k for update;   -- trava o cupom: o limite de usos vale mesmo com dois pais ao mesmo tempo
  if not found or not c.active then why := 'cupom_invalido';
  elsif (c.valid_from is not null and now() < c.valid_from) or (c.valid_until is not null and now() >= c.valid_until) then why := 'cupom_fora_do_prazo';
  elsif exists(select 1 from coupon_redemptions where code = c.code and user_id = uid) then why := 'cupom_ja_usado';
  elsif c.only_new and exists(select 1 from entitlements where user_id = uid and source = 'assinatura') then why := 'cupom_so_novos';
  else
    select count(*) into used from coupon_redemptions where code = c.code and status <> 'cancelado';
    if c.max_uses is not null and used >= c.max_uses then why := 'cupom_esgotado'; end if;
  end if;
  if why is not null then
    if why = 'cupom_invalido' then insert into coupon_attempts(user_id) values (uid); end if;
    return jsonb_build_object('ok', false, 'why', why);
  end if;

  if c.kind in ('meses', 'vitalicio') then
    base := public._vip_until(uid);
    if base is null or base = 'infinity'::timestamptz or base < now() then base := now(); end if;
    insert into entitlements(user_id, source, ends_at, note)
      values (uid, 'cupom', case when c.kind = 'vitalicio' then null else base + make_interval(months => c.value::int) end, 'Cupom ' || c.code)
      returning id into eid;
    insert into coupon_redemptions(code, user_id, status, entitlement_id) values (c.code, uid, 'aplicado', eid);
  else
    -- desconto: fica guardado para a assinatura; um desconto novo substitui o que estava guardado
    update coupon_redemptions set status = 'cancelado' where user_id = uid and status = 'reservado';
    insert into coupon_redemptions(code, user_id, status) values (c.code, uid, 'reservado');
  end if;
  return jsonb_build_object('ok', true, 'code', c.code, 'kind', c.kind, 'value', c.value, 'plans', c.plans, 'cycles', c.cycles,
                            'text', public._coupon_text(c), 'reserved', c.kind in ('percentual', 'valor'), 'plan', public._plan_info(uid));
end $$;

-- cupons da conta (o desconto guardado e os já usados)
create or replace function public.adult_coupons() returns jsonb
language plpgsql stable security definer set search_path to 'public' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'nao_autenticado' using errcode = '28000'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('code', c.code, 'kind', c.kind, 'status', r.status, 'text', public._coupon_text(c),
                                                       'plans', c.plans, 'at', r.redeemed_at) order by r.redeemed_at desc)
                     from coupon_redemptions r join coupons c on c.code = r.code
                    where r.user_id = uid and r.status <> 'cancelado'), '[]'::jsonb);
end $$;

-- ---------- /adm ----------
create or replace function public.admin_coupons() returns jsonb
language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(to_jsonb(c) || jsonb_build_object('text', public._coupon_text(c),
           'uses', (select count(*) from coupon_redemptions r where r.code = c.code and r.status <> 'cancelado'),
           'reserved', (select count(*) from coupon_redemptions r where r.code = c.code and r.status = 'reservado'))
           order by c.created_at desc) from coupons c), '[]'::jsonb);
end $$;

-- cria ou altera um cupom. Cupom já usado só muda validade, limite, "só contas novas", ativo e observação (tipo e valor ficam).
create or replace function public.admin_save_coupon(p jsonb) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare k text := upper(trim(coalesce(p->>'code', ''))); old coupons%rowtype; n int; c coupons%rowtype;
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if jsonb_typeof(p) <> 'object' then raise exception 'parametros_invalidos'; end if;
  if k !~ '^[A-Z0-9-]{3,30}$' then raise exception 'cupom_codigo_invalido'; end if;
  select * into old from coupons where code = k;
  if found then
    select count(*) into n from coupon_redemptions where code = k;
    if n > 0 and (coalesce(p->>'kind', old.kind) <> old.kind or coalesce((p->>'value')::numeric, old.value) <> old.value
                  or coalesce(p->>'plans', old.plans) <> old.plans or (p ? 'cycles' and (p->>'cycles')::int is distinct from old.cycles)) then
      raise exception 'cupom_em_uso';
    end if;
    update coupons set kind = coalesce(p->>'kind', kind), value = coalesce((p->>'value')::numeric, value), plans = coalesce(p->>'plans', plans),
           cycles = case when p ? 'cycles' then (p->>'cycles')::int else cycles end,
           valid_from = case when p ? 'valid_from' then (p->>'valid_from')::timestamptz else valid_from end,
           valid_until = case when p ? 'valid_until' then (p->>'valid_until')::timestamptz else valid_until end,
           max_uses = case when p ? 'max_uses' then (p->>'max_uses')::int else max_uses end,
           only_new = coalesce((p->>'only_new')::boolean, only_new), active = coalesce((p->>'active')::boolean, active),
           note = left(coalesce(p->>'note', note), 200), updated_at = now()
     where code = k returning * into c;
  else
    insert into coupons(code, kind, value, plans, cycles, valid_from, valid_until, max_uses, only_new, active, note, created_by)
      values (k, p->>'kind', coalesce((p->>'value')::numeric, 0), coalesce(p->>'plans', 'ambos'), (p->>'cycles')::int,
              (p->>'valid_from')::timestamptz, (p->>'valid_until')::timestamptz, (p->>'max_uses')::int,
              coalesce((p->>'only_new')::boolean, false), coalesce((p->>'active')::boolean, true), left(coalesce(p->>'note', ''), 200), auth.uid())
      returning * into c;
  end if;
  return to_jsonb(c) || jsonb_build_object('text', public._coupon_text(c));
end $$;

create or replace function public.admin_set_coupon_active(p_code text, p_active boolean) returns void
language plpgsql security definer set search_path to 'public' as $$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  update coupons set active = p_active, updated_at = now() where code = upper(trim(p_code));
  if not found then raise exception 'cupom_invalido'; end if;
end $$;

-- ---------- permissões ----------
revoke all on function public._coupon_text(public.coupons) from public, anon, authenticated;
revoke all on function public.adult_redeem_coupon(text), public.adult_coupons(), public.admin_coupons(), public.admin_save_coupon(jsonb),
  public.admin_set_coupon_active(text, boolean) from public, anon;
grant execute on function public.adult_redeem_coupon(text), public.adult_coupons(), public.admin_coupons(), public.admin_save_coupon(jsonb),
  public.admin_set_coupon_active(text, boolean) to authenticated;

commit;
