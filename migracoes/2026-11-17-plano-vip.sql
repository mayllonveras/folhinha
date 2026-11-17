-- Plano VIP, fase 1: quem é VIP, os limites do plano Grátis, o teste de 14 dias, o selo Fundador e a concessão de VIP pelo /adm.
-- Ainda NÃO tem pagamento (fase 3) nem cupons (fase 2): aqui fica a base que os dois vão usar.
--
-- *** AINDA NÃO APLICADA EM PRODUÇÃO. Aplicar só com autorização do professor. Não é repetível (cria tabela e concede o Fundador). ***
--
-- O que muda
--  * entitlements: a única fonte de verdade de "esta conta é VIP até tal data". Uma linha por concessão: origem (teste, fundador, concessao,
--    cupom, assinatura, indicacao), início, fim (nulo = vitalício), limite de alunos próprio (nulo = o padrão do VIP) e revogação.
--    O VIP vale enquanto houver uma linha ativa; várias linhas não se somam, vale a que termina por último.
--  * O aluno herda o plano do adulto que o cadastrou (students.created_by).
--  * app_settings ganha os números do plano (o /adm edita): plano_folhas_gratis (2), plano_albuns_gratis (1), plano_alunos_gratis (1),
--    plano_alunos_vip (4), plano_teste_dias (14).
--  * Limites do Grátis, conferidos no banco:
--      - folhas do dia: no máximo plano_folhas_gratis (o programa guardado continua com o mínimo de 5; o limite só vale enquanto for Grátis)
--      - alunos: create_student recusa acima do limite (plano_alunos)
--      - álbuns: o gatilho de students recusa liberar mais de 1 (plano_albuns); quem já tinha mais pode diminuir ou trocar
--      - pacotinhos: só os de boas-vindas e os de marco (dias seguidos); os de carimbo, perseverança e Turbo são do VIP.
--        No Grátis os pacotinhos abrem só no álbum principal (o primeiro liberado): plano_album
--      - amigos e trocas: convidar, aceitar convite, propor e aceitar troca exigem VIP (plano_vip); o amigo também precisa ser VIP (amigo_sem_vip)
--      - Trilha Turbo: student_turbo_get e student_turbo_save exigem VIP (plano_vip)
--    Nada é apagado quando o VIP acaba: figurinhas, amigos e o histórico ficam; só param de crescer.
--  * Conta nova ganha o teste do VIP (handle_new_user). As contas que já existem ganham o Fundador: 3 meses de VIP.
--  * Funções novas: adult_plan() para o painel dos pais; admin_grant_vip, admin_revoke_vip para o /adm; admin_overview passa a mostrar o plano.
--
-- As funções alteradas foram copiadas da definição em produção (17/11/2026) e mudam só nas linhas marcadas acima.
--
-- Reverter: veja o bloco comentado no fim do arquivo.
begin;

-- ---------- tabela ----------
create table public.entitlements(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('teste','fundador','concessao','cupom','assinatura','indicacao')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,                       -- nulo = vitalício
  max_students int check (max_students between 1 and 200),
  note text not null default '',
  created_by uuid,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid,
  check (ends_at is null or ends_at > starts_at)
);
create index entitlements_user on public.entitlements(user_id);
alter table public.entitlements enable row level security;   -- sem política: só as funções leem e escrevem
revoke all on table public.entitlements from anon, authenticated;

insert into public.app_settings(key, value) values
  ('plano_folhas_gratis', 2), ('plano_albuns_gratis', 1), ('plano_alunos_gratis', 1), ('plano_alunos_vip', 4), ('plano_teste_dias', 14)
  on conflict (key) do nothing;

-- ---------- quem é VIP ----------
create or replace function public._vip_until(p_uid uuid) returns timestamptz
language sql stable security definer set search_path to 'public' as $$
  select case when bool_or(ends_at is null) then 'infinity'::timestamptz else max(ends_at) end
    from entitlements
   where user_id = p_uid and revoked_at is null and starts_at <= now() and (ends_at is null or ends_at > now())
$$;

create or replace function public._is_vip(p_uid uuid) returns boolean
language sql stable security definer set search_path to 'public' as $$
  select coalesce(public._vip_until(p_uid) > now(), false)
$$;

create or replace function public._student_vip(p_sid uuid) returns boolean
language sql stable security definer set search_path to 'public' as $$
  select public._is_vip((select created_by from students where id = p_sid))
$$;

create or replace function public._need_vip(p_sid uuid) returns void
language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public._student_vip(p_sid) then raise exception 'plano_vip'; end if;
end $$;

create or replace function public._plan_max_students(p_uid uuid) returns int
language sql stable security definer set search_path to 'public' as $$
  select case when public._is_vip(p_uid) then
           coalesce((select max(max_students) from entitlements
                      where user_id = p_uid and revoked_at is null and starts_at <= now() and (ends_at is null or ends_at > now())),
                    app_setting('plano_alunos_vip', 4)::int, 4)
         else coalesce(app_setting('plano_alunos_gratis', 1)::int, 1) end
$$;

-- folhas por dia que valem hoje: o programa do aluno, limitado no plano Grátis
create or replace function public._sheets_quota(s public.students) returns int
language sql stable security definer set search_path to 'public' as $$
  select case when public._is_vip(s.created_by) then s.sheets_per_day
              else least(s.sheets_per_day, coalesce(app_setting('plano_folhas_gratis', 2)::int, 2)) end
$$;

-- resumo do plano de uma conta (painel dos pais e /adm)
create or replace function public._plan_info(p_uid uuid) returns jsonb
language plpgsql stable security definer set search_path to 'public' as $$
declare u timestamptz := public._vip_until(p_uid); src text;
begin
  -- a origem que vale é a da linha ativa que termina por último (vitalício primeiro)
  select source into src from entitlements
   where user_id = p_uid and revoked_at is null and starts_at <= now() and (ends_at is null or ends_at > now())
   order by ends_at desc nulls first, created_at desc limit 1;
  return jsonb_build_object(
    'vip', coalesce(u > now(), false),
    'lifetime', u = 'infinity'::timestamptz,
    'until', case when u is null or u = 'infinity'::timestamptz then null else u end,
    'source', src,
    'trial_used', exists(select 1 from entitlements where user_id = p_uid and source = 'teste'),
    'fundador', exists(select 1 from entitlements where user_id = p_uid and source = 'fundador' and revoked_at is null),
    'students', (select count(*) from students where created_by = p_uid),
    'max_students', public._plan_max_students(p_uid));
end $$;

create or replace function public.adult_plan() returns jsonb
language plpgsql stable security definer set search_path to 'public' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'nao_autenticado' using errcode = '28000'; end if;
  return public._plan_info(uid) || jsonb_build_object('limits', jsonb_build_object(
    'folhas_gratis', app_setting('plano_folhas_gratis', 2)::int, 'albuns_gratis', app_setting('plano_albuns_gratis', 1)::int,
    'alunos_gratis', app_setting('plano_alunos_gratis', 1)::int, 'alunos_vip', app_setting('plano_alunos_vip', 4)::int,
    'teste_dias', app_setting('plano_teste_dias', 14)::int));
end $$;

-- ---------- /adm: dar e tirar VIP ----------
-- p_days nulo = vitalício. Com dias, o VIP vai até (o fim do VIP atual, ou agora) + p_days.
create or replace function public.admin_grant_vip(p_email text, p_days int default null, p_max_students int default null, p_note text default '')
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare uid uuid; base timestamptz; eid uuid;
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(coalesce(p_email, '')));
  if uid is null then raise exception 'conta_nao_encontrada'; end if;
  if p_days is not null and (p_days < 1 or p_days > 3650) then raise exception 'dias_invalidos'; end if;
  if p_max_students is not null and (p_max_students < 1 or p_max_students > 200) then raise exception 'alunos_invalidos'; end if;
  base := public._vip_until(uid);
  if base is null or base = 'infinity'::timestamptz or base < now() then base := now(); end if;
  insert into entitlements(user_id, source, ends_at, max_students, note, created_by)
    values (uid, 'concessao', case when p_days is null then null else base + make_interval(days => p_days) end,
            p_max_students, left(coalesce(p_note, ''), 200), auth.uid())
    returning id into eid;
  return public._plan_info(uid) || jsonb_build_object('id', eid);
end $$;

create or replace function public.admin_revoke_vip(p_id uuid) returns void
language plpgsql security definer set search_path to 'public' as $$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  update entitlements set revoked_at = now(), revoked_by = auth.uid() where id = p_id and revoked_at is null;
  if not found then raise exception 'concessao_invalida'; end if;
end $$;

-- ---------- pacotinhos: no Grátis só boas-vindas e marco, e só se o álbum principal tiver espaço ----------
create or replace function public._give_packs(p_sid uuid, p_day date, p_source text, p_n integer) returns integer
language plpgsql security definer set search_path to 'public' as $$
declare s students%rowtype; room boolean; i int; got int := 0;
begin
  select * into s from students where id = p_sid;
  if public._student_vip(p_sid) then
    select exists(select 1 from unnest(s.sticker_themes) t(id)
                   where (select count(*) from awards a where a.student_id = p_sid and a.kind = 'figurinha' and a.theme = t.id) < 52) into room;
  else
    if p_source not in ('boas_vindas', 'marco') then return 0; end if;
    room := (select count(*) from awards a where a.student_id = p_sid and a.kind = 'figurinha' and a.theme = s.sticker_themes[1]) < 52;
  end if;
  if not room then return 0; end if;
  for i in 1..p_n loop
    insert into awards(student_id, kind, period_mode, period_start, period_end, earned_day, source, seq)
      values (p_sid, 'pacote', 'diario', p_day, p_day, p_day, p_source, i)
      on conflict do nothing;
    if found then got := got + 1; end if;
  end loop;
  return got;
end $$;

-- ---------- funções existentes, com as travas do plano ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into profiles(id,name,role) values (new.id,
    left(coalesce(new.raw_user_meta_data->>'name',''),60),
    case when new.raw_user_meta_data->>'role'='professor' then 'professor' else 'pai' end);
  -- teste do VIP para toda conta nova
  insert into entitlements(user_id, source, ends_at, note)
    values (new.id, 'teste', now() + make_interval(days => coalesce(app_setting('plano_teste_dias', 14)::int, 14)), 'Teste de boas-vindas');
  return new;
end $function$;

CREATE OR REPLACE FUNCTION public.create_student(p_name text, p_level integer, p_start date, p_days integer[], p_per_day integer, p_close integer, p_goal integer, p_reward text, p_repeat text DEFAULT 'reforco'::text, p_stamps integer DEFAULT 3, p_period text DEFAULT 'semanal'::text, p_monthly integer DEFAULT 4000, p_system text DEFAULT 'figurinhas'::text, p_theme text DEFAULT 'dinossauros'::text, p_themes text[] DEFAULT NULL::text[], p_ano integer DEFAULT NULL::integer, p_teto integer DEFAULT NULL::integer, p_free integer[] DEFAULT NULL::integer[], p_consent boolean DEFAULT NULL::boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare uid uuid := auth.uid(); sid uuid; code text; th text[];
begin
  if uid is null then raise exception 'nao_autenticado' using errcode='28000'; end if;
  -- plano: Grátis cadastra 1 aluno, VIP (família) até 4 (ou o limite da concessão)
  if (select count(*) from students where created_by = uid) >= public._plan_max_students(uid) then raise exception 'plano_alunos'; end if;
  select coalesce(array_agg(t order by o), '{}'::text[]) into th
    from (select distinct on (t) t, o from unnest(coalesce(nullif(p_themes, '{}'::text[]), array[p_theme])) with ordinality u(t,o)
           where t in (select id from albums where ativo) order by t, o) x;
  if cardinality(th) = 0 then raise exception 'sem_album'; end if;
  code := gen_link_code();
  insert into students(name, link_code, level_idx, start_date, study_days, sheets_per_day, week_close_dow,
                       weekly_goal, monthly_goal, reward_period, reward, repeat_mode, stamps_needed, reward_system, sticker_theme, sticker_themes, created_by,
                       ano_escolar, teto_anos, free_days, consent_at, consent_by)
    values (trim(p_name), code, p_level, p_start, p_days, p_per_day, p_close, p_goal, 4000,
            'semanal', '', coalesce(p_repeat,'reforco'), coalesce(p_stamps,3),
            'figurinhas', th[1], th, uid, p_ano, p_teto, coalesce(p_free, '{0,6}'::int[]), case when p_consent then now() end, case when p_consent then uid end)
    returning id into sid;
  insert into guardians(student_id, user_id, role) values (sid, uid, 'owner');
  insert into student_secrets(student_id) values (sid);
  return jsonb_build_object('id', sid, 'link_code', code);
end $function$;

CREATE OR REPLACE FUNCTION public.students_albums_rules()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare lim int := coalesce(app_setting('limite_mesa', 2)::int, 2); t text; full_ text[]; added text[]; d text[] := '{}';
begin
  if tg_op = 'UPDATE' and new.sticker_themes is not distinct from old.sticker_themes and new.desk_themes is not distinct from old.desk_themes then
    return new;
  end if;
  -- plano Grátis: no máximo 1 álbum liberado (quem já tinha mais, de quando era VIP, só pode diminuir ou trocar)
  if cardinality(coalesce(new.sticker_themes, '{}'::text[])) > coalesce(app_setting('plano_albuns_gratis', 1)::int, 1)
     and (tg_op = 'INSERT' or cardinality(new.sticker_themes) > cardinality(old.sticker_themes))
     and not public._is_vip(new.created_by) then
    raise exception 'plano_albuns';
  end if;
  if new.sticker_themes is null or cardinality(new.sticker_themes) < 1 then raise exception 'sem_album'; end if;
  if (select count(distinct x) from unnest(new.sticker_themes) x) <> cardinality(new.sticker_themes) then raise exception 'album_invalido'; end if;
  -- só álbuns do registro (um álbum já liberado antes continua valendo mesmo se for desativado depois)
  if exists(select 1 from unnest(new.sticker_themes) x
             where not exists(select 1 from albums a where a.id = x and (a.ativo or (tg_op = 'UPDATE' and x = any(old.sticker_themes))))) then
    raise exception 'album_invalido';
  end if;
  -- mesa: só álbuns liberados, sem repetir
  foreach t in array coalesce(new.desk_themes, '{}'::text[]) loop
    if t = any(new.sticker_themes) and t <> all(d) then d := d || t; end if;
  end loop;
  if tg_op = 'INSERT' then d := '{}'; end if;
  if tg_op = 'UPDATE' then
    full_ := public._full_albums(new.id);
    added := array(select x from unnest(new.sticker_themes) x where x <> all(old.sticker_themes));
    -- álbum recém-liberado entra na mesa se houver vaga (e se já houve o primeiro acesso)
    if new.welcome_at is not null then
      foreach t in array added loop
        if cardinality(d) < lim and t <> all(full_) then d := d || t; end if;
      end loop;
    end if;
    -- completos não ficam na mesa
    d := array(select x from unnest(d) x where x <> all(full_));
    if cardinality(d) > lim and cardinality(d) > cardinality(old.desk_themes) then raise exception 'mesa_cheia'; end if;
    new.albums_done_at := case when new.sticker_themes <@ full_ then coalesce(old.albums_done_at, now()) else null end;
  end if;
  new.desk_themes := d;
  return new;
end $function$;

CREATE OR REPLACE FUNCTION public.student_me(p_token text, p_day date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; quota int := 0; is_free boolean := false; done_today int; t_ok int; t_total int; packs int; stks jsonb; recent jsonb; stk int;
  need int;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid;
  need := public.level_stamps(s.level_idx);
  if p_day >= s.start_date then
    if extract(dow from p_day)::int = any(s.study_days) then quota := public._sheets_quota(s);
    elsif extract(dow from p_day)::int = any(s.free_days) then quota := public._sheets_quota(s); is_free := true; end if;
  end if;
  select count(*), coalesce(sum(first_ok),0), coalesce(sum(total),0) into done_today, t_ok, t_total
    from sheets where student_id=sid and status='done' and study_day=p_day;
  select count(*) into packs from awards where student_id=sid and kind='pacote';
  select coalesce(jsonb_agg(jsonb_build_object('theme',theme,'slot',slot,'end',period_end,'from',(select f.name from students f where f.id = awards.traded_from)) order by earned_at),'[]'::jsonb) into stks
    from awards where student_id=sid and kind='figurinha' and theme = any(s.sticker_themes);
  select coalesce(jsonb_agg(x), '[]'::jsonb) into recent from (
    select jsonb_build_object('day',study_day,'level',level_idx,'ok',first_ok,'total',total,
                              'secs',secs,'stamp',stamp,'advanced',advanced) x
    from sheets where student_id=sid and status='done' order by finished_at desc limit 6) t;
  stk := public._streak_view(sid, p_day);
  return jsonb_build_object(
    'name', s.name, 'welcome_pending', (s.welcome_at is null), 'level_idx', s.level_idx, 'stamps', s.stamps, 'stamps_needed', need,
    'start_date', s.start_date, 'study_days', to_jsonb(s.study_days), 'free_days', to_jsonb(s.free_days), 'free_day', is_free, 'sheets_per_day', s.sheets_per_day,
    'quota', quota, 'done_today', done_today, 'today_ok', t_ok, 'today_total', t_total,
    'today_stamp', exists(select 1 from sheets where student_id=sid and study_day=p_day and stamp),
    'streak', stk, 'best_streak', s.best_streak, 'next_marco', public._next_marco(stk),
    'reward_system', 'figurinhas', 'sticker_theme', s.sticker_themes[1], 'sticker_themes', to_jsonb(s.sticker_themes), 'desk_themes', to_jsonb(s.desk_themes), 'albums_done', (s.albums_done_at is not null), 'desk_limit', app_setting('limite_mesa', 2)::int, 'pausas_max', app_setting('pausas_max', 2)::int, 'modo_folha', app_setting('modo_folha', 1)::int,
    'vip', public._student_vip(sid), 'free_album', s.sticker_themes[1], 'plan_sheets', app_setting('plano_folhas_gratis', 2)::int,
    'pending_packs', packs, 'stickers', stks, 'recent', recent,
    'normal_acertos', app_setting('normal_acertos', 80)::int, 'ouro_acertos', app_setting('ouro_acertos', 95)::int,
    'ouro_tempo', app_setting('ouro_tempo', 80)::int, 'ouro_carimbos', app_setting('ouro_carimbos', 2)::int,
    'offer_back', (s.reached_by_jump and s.level_idx > 0 and s.dry_days >= app_setting('dias_sem_carimbo_voltar', 2)::int));
end $function$;

CREATE OR REPLACE FUNCTION public.student_open_sheet(p_token text, p_day date, p_problems jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; done_today int; ex sheets%rowtype; new_id uuid;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid for update;
  if abs(p_day - current_date) > 1 then raise exception 'data_invalida'; end if;
  if not ((extract(dow from p_day)::int = any(s.study_days) or extract(dow from p_day)::int = any(s.free_days)) and p_day >= s.start_date) then raise exception 'sem_folha_hoje'; end if;
  select count(*) into done_today from sheets where student_id=sid and status='done' and study_day=p_day;
  if done_today >= public._sheets_quota(s) then raise exception 'meta_cumprida'; end if;

  select * into ex from sheets
   where student_id=sid and status='started' and study_day=p_day and level_idx=s.level_idx
     and started_at > now() - interval '12 hours'
   order by started_at desc limit 1;
  if found then
    delete from sheets where student_id=sid and status='started' and id <> ex.id;
    return jsonb_build_object('id', ex.id, 'problems', ex.problems, 'reused', true);
  end if;

  if jsonb_typeof(p_problems) <> 'array' or jsonb_array_length(p_problems) <> 10 or length(p_problems::text) > 40000 then raise exception 'folha_invalida'; end if;
  delete from sheets where student_id = sid and status = 'started';
  insert into sheets(student_id, level_idx, study_day, week_end, problems)
    values (sid, s.level_idx, p_day, week_end_of(p_day, s.week_close_dow), p_problems)
    returning id into new_id;
  insert into week_settings(student_id, week_end, goal, reward)
    values (sid, week_end_of(p_day, s.week_close_dow), s.weekly_goal, s.reward)
    on conflict do nothing;
  insert into month_settings(student_id, month_start, goal, reward)
    values (sid, date_trunc('month', p_day)::date, s.monthly_goal, s.reward)
    on conflict do nothing;
  return jsonb_build_object('id', new_id, 'problems', p_problems, 'reused', false);
end $function$;

CREATE OR REPLACE FUNCTION public.student_start_sheet(p_token text, p_day date, p_problems jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; done_today int; new_id uuid;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid;
  if abs(p_day - current_date) > 1 then raise exception 'data_invalida'; end if;
  if jsonb_typeof(p_problems) <> 'array' or jsonb_array_length(p_problems) <> 10 then raise exception 'folha_invalida'; end if;
  if not (extract(dow from p_day)::int = any(s.study_days) and p_day >= s.start_date) then raise exception 'sem_folha_hoje'; end if;
  select count(*) into done_today from sheets where student_id=sid and status='done' and study_day=p_day;
  if done_today >= public._sheets_quota(s) then raise exception 'meta_cumprida'; end if;
  delete from sheets where student_id = sid and status = 'started';
  insert into sheets(student_id, level_idx, study_day, week_end, problems)
    values (sid, s.level_idx, p_day, week_end_of(p_day, s.week_close_dow), p_problems)
    returning id into new_id;
  insert into week_settings(student_id, week_end, goal, reward)
    values (sid, week_end_of(p_day, s.week_close_dow), s.weekly_goal, s.reward)
    on conflict do nothing;
  return new_id;
end $function$;

CREATE OR REPLACE FUNCTION public.student_submit_sheet(p_token text, p_sheet uuid, p_first_ok integer, p_secs numeric, p_answers jsonb, p_corrections integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; sh sheets%rowtype; s students%rowtype; tgt int; st boolean := false; pts int;
  adv boolean := false; new_level int; new_stamps int; last_level int;
  n int; ok_count int := 0; i int; good boolean; pr jsonb; an jsonb; pre_t text; post_t text; sig_t text;
  done_n int; day_ok int; day_total int; day_secs numeric; day_closed boolean := false; day_pct numeric := 0; avg_secs numeric := 0; why text := null;
  prev_d date; new_streak int := 0; marco_n int := 0; pk_c int := 0; pk_p int := 0; pk_m int := 0; stk int; stk_best int;
  need int;
  v_tier text := null; v_gained int := 0; at_teto boolean := false; blocked boolean := false; first_day boolean;
  is_free boolean; ano_now int; max_ano int; next_ano int; jumps_week int; new_rbj boolean; new_dry int;
begin
  sid := public._student_from_token(p_token);
  select * into sh from sheets where id = p_sheet and student_id = sid for update;
  if not found or sh.status <> 'started' then raise exception 'folha_invalida'; end if;
  n := jsonb_array_length(sh.problems);
  if p_secs < 3 or p_secs > 14400 or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> n
    then raise exception 'dados_invalidos'; end if;
  for i in 0..n-1 loop
    pr := sh.problems->i; an := p_answers->i;
    pre_t := pr->>'pre'; post_t := coalesce(pr->>'post','');
    sig_t := case when pr ? 'extra' and jsonb_typeof(pr->'extra') = 'object' then md5((pr->'extra')::text) else '' end;
    -- resposta digitada: até 7 algarismos e, nos decimais, vírgula ou ponto com até 3 casas ("2,5"); compara como número
    good := coalesce(an->>'v','') ~ '^[0-9]{1,7}([.,][0-9]{1,3})?$'
            and replace(an->>'v', ',', '.')::numeric = (pr->>'a')::numeric;
    if good then
      ok_count := ok_count + 1;
      update weak_items set streak_ok = streak_ok + 1
        where student_id=sid and level_idx=sh.level_idx and pre=pre_t and post=post_t and sig=sig_t;
    else
      insert into weak_items(student_id, level_idx, pre, post, ans, sig, extra)
        values (sid, sh.level_idx, pre_t, post_t, (pr->>'a')::numeric, sig_t, case when sig_t = '' then null else pr->'extra' end)
        on conflict (student_id, level_idx, pre, post, sig)
        do update set misses = weak_items.misses + 1, streak_ok = 0, last_miss = now();
    end if;
  end loop;
  delete from weak_items where student_id = sid and streak_ok >= 2;
  select * into s from students where id = sid for update;
  is_free := not (extract(dow from sh.study_day)::int = any(s.study_days)) and extract(dow from sh.study_day)::int = any(s.free_days);
  need := public.level_stamps(s.level_idx);
  select max(idx) into last_level from levels;
  tgt := level_target(sh.level_idx);
  pts := calc_points(ok_count, p_secs, tgt);
  update sheets set status='done', answers=p_answers, first_ok=ok_count, total=n, secs=p_secs,
    corrections=greatest(0, coalesce(p_corrections,0)), stamp=false, advanced=false, points=pts, finished_at=clock_timestamp()
   where id = p_sheet;
  -- fechamento do dia: soma as folhas do dia no nível atual
  select count(*), coalesce(sum(first_ok),0), coalesce(sum(total),0), coalesce(sum(secs),0)
    into done_n, day_ok, day_total, day_secs
    from sheets where student_id=sid and status='done' and study_day=sh.study_day and level_idx=s.level_idx;
  if day_total > 0 then day_pct := round(100.0 * day_ok / day_total); avg_secs := round(day_secs / done_n, 1); end if;
  day_closed := done_n >= public._sheets_quota(s) and sh.level_idx = s.level_idx
                and not exists(select 1 from sheets where student_id=sid and study_day=sh.study_day and stamp);
  new_level := s.level_idx; new_stamps := s.stamps; new_rbj := s.reached_by_jump; new_dry := s.dry_days;
  if day_closed then
    -- teto: o ano do próximo nível não pode passar do ano escolar + teto (só confere se o ano foi informado)
    ano_now := public.ano_do_aluno(s.ano_escolar, s.ano_ref, sh.study_day);
    if ano_now is not null then
      max_ano := ano_now + coalesce(s.teto_anos, app_setting('teto_anos_padrao', 1)::int);
      select ano into next_ano from levels where idx = s.level_idx + 1;
      at_teto := next_ano is not null and next_ano > max_ano;
    end if;
    -- salto: só no 1º dia do nível, sem carimbos ainda, respeitando o bloqueio e o limite semanal
    first_day := s.stamps = 0 and not exists(select 1 from sheets where student_id=sid and status='done'
                   and level_idx=s.level_idx and study_day < sh.study_day);
    select count(*) into jumps_week from level_moves
      where student_id = sid and kind = 'salto' and day >= date_trunc('week', sh.study_day)::date;
    if day_total > 0 then
      if day_ok * 100 >= app_setting('salto_acertos', 98) * day_total
         and avg_secs <= tgt * app_setting('salto_tempo', 60) / 100
         and first_day and not at_teto and s.level_idx < last_level
         and (s.sem_salto_ate is null or s.sem_salto_ate < sh.study_day)
         and jumps_week < app_setting('salto_por_semana', 2)::int
      then v_tier := 'salto';
      elsif day_ok * 100 >= app_setting('ouro_acertos', 95) * day_total
         and avg_secs <= tgt * app_setting('ouro_tempo', 80) / 100
      then v_tier := 'ouro'; v_gained := app_setting('ouro_carimbos', 2)::int;
      elsif day_ok * 100 >= app_setting('normal_acertos', 80) * day_total and avg_secs <= tgt
      then v_tier := 'normal'; v_gained := 1;
      end if;
    end if;
    st := v_tier is not null;
    if v_tier = 'salto' then
      new_level := s.level_idx + 1; new_stamps := 0; adv := true; v_gained := need; new_rbj := true; new_dry := 0;
    elsif st then
      new_stamps := s.stamps + v_gained;
      if new_stamps >= need then
        if s.level_idx < last_level and not at_teto then new_level := s.level_idx + 1; new_stamps := 0; adv := true;
        else new_stamps := need; blocked := at_teto and s.level_idx < last_level; end if;
      end if;
      new_rbj := false; new_dry := 0;          -- carimbo ganho: o nível está confirmado
    else
      why := case when day_ok * 100 < app_setting('normal_acertos', 80) * day_total and avg_secs > tgt then 'acertos_tempo'
                  when day_ok * 100 < app_setting('normal_acertos', 80) * day_total then 'acertos' else 'tempo' end;
      if s.reached_by_jump and not is_free then new_dry := s.dry_days + 1; end if;
    end if;
    update students set level_idx = new_level, stamps = new_stamps, reached_by_jump = new_rbj, dry_days = new_dry where id = sid;
    if adv then
      insert into level_moves(student_id, day, from_idx, to_idx, kind)
        values (sid, sh.study_day, s.level_idx, new_level, case when v_tier = 'salto' then 'salto' else 'carimbos' end);
      -- as contas ainda erradas acompanham o aluno no nível novo
      update weak_items w set level_idx = new_level
       where w.student_id = sid and w.level_idx <> new_level
         and not exists(select 1 from weak_items x where x.student_id=sid and x.level_idx=new_level and x.pre=w.pre and x.post=w.post and x.sig=w.sig);
      delete from weak_items where student_id = sid and level_idx <> new_level;
    end if;
    if st then update sheets set stamp = true, advanced = adv, tier = v_tier, gained = v_gained where id = p_sheet; end if;

    -- perseverança: cota do dia fechada (com ou sem carimbo). Uma vez por dia de estudo.
    if is_free then
      -- dia livre: não mexe na sequência nem nos marcos; o dia fechado e o carimbo valem pacotinho
      pk_p := public._give_packs(sid, sh.study_day, 'perseveranca', 1);
      if st then pk_c := public._give_packs(sid, sh.study_day, 'carimbo', 1); end if;
    elsif s.last_streak_day is distinct from sh.study_day then
      prev_d := public._prev_study_day(sid, sh.study_day);
      new_streak := case when prev_d is not null and s.last_streak_day = prev_d then s.streak + 1 else 1 end;
      update students set streak = new_streak, best_streak = greatest(best_streak, new_streak), last_streak_day = sh.study_day
       where id = sid;
      pk_p := public._give_packs(sid, sh.study_day, 'perseveranca', 1);
      if st then pk_c := public._give_packs(sid, sh.study_day, 'carimbo', 1); end if;
      marco_n := public._marco_packs(new_streak);
      if marco_n > 0 then pk_m := public._give_packs(sid, sh.study_day, 'marco', marco_n); end if;
    end if;
  end if;

  stk := public._streak_view(sid, sh.study_day);
  select best_streak into stk_best from students where id = sid;
  return jsonb_build_object('stamp',st,'advanced',adv,'level_idx',new_level,'stamps',new_stamps,
    'target',tgt,'first_ok',ok_count,'stamps_needed',need,'normal_acertos',app_setting('normal_acertos', 80)::int,
    'shown_stamps', case when adv then need else least(need, s.stamps + v_gained) end,
    'tier', v_tier, 'gained', case when st then v_gained else 0 end, 'jumped', coalesce(v_tier = 'salto', false), 'teto', blocked,
    'offer_back', (new_rbj and new_level > 0 and new_dry >= app_setting('dias_sem_carimbo_voltar', 2)::int),
    'free_day', is_free, 'day_closed', day_closed, 'day_done', done_n, 'day_quota', public._sheets_quota(s), 'day_ok', day_ok, 'day_total', day_total,
    'day_pct', day_pct, 'day_avg_secs', avg_secs, 'why', why,
    'packs', jsonb_build_object('carimbo', pk_c, 'perseveranca', pk_p, 'marco', pk_m),
    'marco_streak', case when pk_m > 0 then new_streak else null end,
    'streak', stk, 'best_streak', stk_best, 'next_marco', public._next_marco(stk),
    'pending_packs', (select count(*) from awards where student_id = sid and kind = 'pacote'));
end $function$;

CREATE OR REPLACE FUNCTION public.student_open_pack(p_token text, p_theme text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; pid uuid; pe date; sl int; tr text; left_n int; r numeric; copies int; owned int;
  p_ultra numeric := app_setting('prob_ultra', 5)::numeric; p_rara numeric := app_setting('prob_rara', 25)::numeric;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid;
  if p_theme is null or not (p_theme = any(s.sticker_themes)) then raise exception 'album_invalido'; end if;
  if p_theme <> all(s.desk_themes) then raise exception 'album_fora_da_mesa'; end if;
  -- no plano Grátis os pacotinhos abrem só no álbum principal (o primeiro liberado)
  if p_theme <> s.sticker_themes[1] and not public._student_vip(sid) then raise exception 'plano_album'; end if;
  -- álbum completo não recebe mais pacotinho (as repetidas vêm dos álbuns que ainda faltam)
  select count(distinct slot) into owned from awards where student_id=sid and kind='figurinha' and theme=p_theme;
  if owned >= 52 then raise exception 'album_completo'; end if;
  select id, period_end into pid, pe from awards where student_id=sid and kind='pacote' order by earned_at, id limit 1 for update skip locked;
  if pid is null then raise exception 'sem_pacote'; end if;
  r := random() * 100;
  tr := case when r < p_ultra then 'ultra' when r < p_ultra + p_rara then 'rara' else 'comum' end;
  select g into sl from generate_series(0,51) x(g)
   where coalesce((select tier from sticker_rarity where theme = p_theme and slot = x.g), 'comum') = tr
   order by random() limit 1;
  if sl is null then   -- o álbum não tem figurinha dessa raridade: cai para comum
    tr := 'comum';
    select g into sl from generate_series(0,51) x(g)
     where coalesce((select tier from sticker_rarity where theme = p_theme and slot = x.g), 'comum') = 'comum'
     order by random() limit 1;
  end if;
  select count(*) into copies from awards where student_id=sid and kind='figurinha' and theme=p_theme and slot=sl;
  update awards set kind='figurinha', theme=p_theme, slot=sl where id = pid;
  select count(distinct slot) into owned from awards where student_id=sid and kind='figurinha' and theme=p_theme;
  select count(*) into left_n from awards where student_id=sid and kind='pacote';
  perform public._check_albums(sid);
  select * into s from students where id = sid;
  return jsonb_build_object('kind','figurinha','theme',p_theme,'slot',sl,'period_end',pe,'tier',tr,'pending',left_n,
                            'count',owned,'repeated',copies > 0,'copies',copies + 1,
                            'desk',to_jsonb(s.desk_themes),'albums_done',(s.albums_done_at is not null));
end $function$;

CREATE OR REPLACE FUNCTION public.student_friend_invite(p_token text, p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; o students%rowtype; f friendships%rowtype;
begin
  sid := public._student_from_token(p_token);
  perform public._need_vip(sid);
  select * into o from students where friend_code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then raise exception 'codigo_invalido'; end if;
  if o.id = sid then raise exception 'proprio_codigo'; end if;
  if not public._student_vip(o.id) then raise exception 'amigo_sem_vip'; end if;
  select * into f from friendships where least(requester, addressee) = least(sid, o.id) and greatest(requester, addressee) = greatest(sid, o.id) for update;
  if found then
    if f.status = 'aceita' then raise exception 'ja_sao_amigos'; end if;
    if f.requester = sid then raise exception 'convite_pendente'; end if;
    update friendships set status = 'aceita', answered_at = now() where id = f.id;
    return jsonb_build_object('name', o.name, 'state', 'aceito');
  end if;
  if (select count(*) from friendships where requester = sid and status = 'pendente') >= 10 then raise exception 'muitos_convites'; end if;
  insert into friendships(requester, addressee) values (sid, o.id);
  return jsonb_build_object('name', o.name, 'state', 'enviado');
end $function$;

CREATE OR REPLACE FUNCTION public.student_friend_answer(p_token text, p_id uuid, p_accept boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  if p_accept then
    perform public._need_vip(sid);
    update friendships set status = 'aceita', answered_at = now() where id = p_id and addressee = sid and status = 'pendente';
  else
    delete from friendships where id = p_id and addressee = sid and status = 'pendente';
  end if;
  if not found then raise exception 'convite_invalido'; end if;
end $function$;

CREATE OR REPLACE FUNCTION public.student_trade_propose(p_token text, p_friendship uuid, p_gives jsonb, p_wants jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare sid uuid; oid uuid; prob text; tid uuid; nm text;
begin
  sid := public._student_from_token(p_token);
  perform public._need_vip(sid);
  select case when requester = sid then addressee else requester end into oid
    from friendships where id = p_friendship and status = 'aceita' and sid in (requester, addressee);
  if oid is null then raise exception 'amizade_invalida'; end if;
  if not public._student_vip(oid) then raise exception 'amigo_sem_vip'; end if;
  update trades set status = 'expirada', answered_at = now() where status = 'pendente' and expires_at < now();
  if (select count(*) from trades where requester = sid and status = 'pendente') >= 10 then raise exception 'muitos_pedidos'; end if;
  prob := public._trade_problem(sid, oid, p_gives, p_wants, null);
  if prob is not null then raise exception '%', prob; end if;
  insert into trades(requester, addressee) values (sid, oid) returning id into tid;
  insert into trade_items(trade_id, side, theme, slot) select tid, 'give', x->>'theme', (x->>'slot')::int from jsonb_array_elements(p_gives) x;
  insert into trade_items(trade_id, side, theme, slot) select tid, 'want', x->>'theme', (x->>'slot')::int from jsonb_array_elements(p_wants) x;
  select name into nm from students where id = oid;
  perform public._ping(oid);
  return jsonb_build_object('id', tid, 'name', nm);
end $function$;

CREATE OR REPLACE FUNCTION public.student_trade_answer(p_token text, p_id uuid, p_accept boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare sid uuid; t trades%rowtype; prob text; r record; a uuid; n int; d date := current_date;
begin
  sid := public._student_from_token(p_token);
  select * into t from trades where id = p_id and addressee = sid and status = 'pendente' for update;
  if not found then raise exception 'pedido_invalido'; end if;
  if not p_accept then
    update trades set status = 'recusada', answered_at = now() where id = t.id;
    perform public._ping(t.requester);
    return jsonb_build_object('state', 'recusada');
  end if;
  perform public._need_vip(sid);
  if t.expires_at < now() then
    update trades set status = 'expirada', answered_at = now() where id = t.id;
    return jsonb_build_object('state', 'invalida', 'why', 'expirada');
  end if;
  prob := public._trade_problem(t.requester, t.addressee, public._trade_side(t.id, 'give'), public._trade_side(t.id, 'want'), t.id);
  if prob is not null then
    update trades set status = 'invalida', answered_at = now() where id = t.id;
    perform public._ping(t.requester);
    return jsonb_build_object('state', 'invalida', 'why', prob);
  end if;
  -- o que quem pediu oferece vai para quem recebeu (uma cópia de cada, a mais recente, para a original ficar no álbum)
  n := coalesce((select max(seq) from awards where student_id = t.addressee and earned_day = d and source = 'troca'), 0);
  for r in select theme, slot from trade_items where trade_id = t.id and side = 'give' loop
    select id into a from awards where student_id = t.requester and kind = 'figurinha' and theme = r.theme and slot = r.slot order by earned_at desc, id limit 1 for update;
    n := n + 1;
    update awards set student_id = t.addressee, earned_day = d, source = 'troca', seq = n, traded_from = t.requester where id = a;
  end loop;
  -- e o que ele pede vai para ele
  n := coalesce((select max(seq) from awards where student_id = t.requester and earned_day = d and source = 'troca'), 0);
  for r in select theme, slot from trade_items where trade_id = t.id and side = 'want' loop
    select id into a from awards where student_id = t.addressee and kind = 'figurinha' and theme = r.theme and slot = r.slot order by earned_at desc, id limit 1 for update;
    n := n + 1;
    update awards set student_id = t.requester, earned_day = d, source = 'troca', seq = n, traded_from = t.addressee where id = a;
  end loop;
  update trades set status = 'aceita', answered_at = now() where id = t.id;
  -- pedidos que dependiam dessas cópias e deixaram de valer
  update trades tt set status = 'invalida', answered_at = now()
   where tt.status = 'pendente' and tt.id <> t.id and (tt.requester in (t.requester, t.addressee) or tt.addressee in (t.requester, t.addressee))
     and public._trade_problem(tt.requester, tt.addressee, public._trade_side(tt.id, 'give'), public._trade_side(tt.id, 'want'), tt.id) is not null;
  perform public._check_albums(t.requester); perform public._check_albums(t.addressee);   -- a troca pode completar um álbum
  perform public._ping(t.requester);
  return jsonb_build_object('state', 'aceita');
end $function$;

CREATE OR REPLACE FUNCTION public.student_turbo_get(p_token text, p_day date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; ta turbo_students%rowtype; dr turbo_days%rowtype; ok_day boolean; ano int;
begin
  sid := public._student_from_token(p_token);
  perform public._need_vip(sid);
  if abs(p_day - current_date) > 1 then raise exception 'data_invalida'; end if;
  select * into s from students where id = sid;
  select * into ta from turbo_students where student_id = sid;
  select * into dr from turbo_days where student_id = sid and study_day = p_day;
  ok_day := p_day >= s.start_date and (extract(dow from p_day)::int = any(s.study_days) or extract(dow from p_day)::int = any(s.free_days));
  ano := public.ano_do_aluno(s.ano_escolar, s.ano_ref, p_day);
  return jsonb_build_object(
    'unlocked', coalesce(ta.unlocked, array['soma']::text[]),
    'age', coalesce(ta.age, ano + 5, 7),
    'devices', coalesce(ta.devices, '{}'::jsonb),
    'placement', ta.placement,
    'skip_placement', coalesce(ta.skip_placement, false),
    'study_day', ok_day,
    'today', jsonb_build_object('status', coalesce(dr.status, 'none'), 'attempts', coalesce(dr.attempts, 0),
      'pack_given', exists (select 1 from awards a where a.student_id = sid and a.source = 'turbo' and a.earned_day = p_day and a.kind in ('pacote','figurinha'))),
    'pending_packs', (select count(*) from awards where student_id = sid and kind = 'pacote'),
    'facts', coalesce((select jsonb_agg(jsonb_build_object('id', f.fact_id, 's', f.state, 'n', f.ok_count, 'daysOk', f.ok_days, 'lastOkDay', f.last_ok_day,
        'good', f.good_sessions, 'rev', f.review_step, 'due', f.due, 'recent', f.recent, 'lat', f.lat_ms, 'stub', f.stubborn, 'reached', f.reached_consolidating))
        from turbo_facts f where f.student_id = sid), '[]'::jsonb));
end $function$;

CREATE OR REPLACE FUNCTION public.student_turbo_save(p_token text, p_day date, p_session jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; res jsonb; dev text; ok_day boolean; got int := 0; v_status text; prev_status text; n_call int; n_att int; given boolean;
begin
  sid := public._student_from_token(p_token);
  perform public._need_vip(sid);
  if abs(p_day - current_date) > 1 then raise exception 'data_invalida'; end if;
  if jsonb_typeof(p_session) <> 'object' then raise exception 'dados_invalidos'; end if;
  if jsonb_typeof(coalesce(p_session->'facts', '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_session->'facts', '[]'::jsonb)) > 80
     or jsonb_typeof(coalesce(p_session->'attempts', '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_session->'attempts', '[]'::jsonb)) > 80
     or jsonb_typeof(coalesce(p_session->'result', '{}'::jsonb)) <> 'object'
     or (p_session ? 'devices' and jsonb_typeof(p_session->'devices') <> 'object')
  then raise exception 'dados_invalidos'; end if;
  select * into s from students where id = sid;
  res := coalesce(p_session->'result', '{}'::jsonb);
  dev := lower(coalesce(p_session->>'device', ''));
  if dev !~ '^[a-z0-9_-]{1,30}$' then dev := null; end if;

  insert into turbo_students(student_id) values (sid) on conflict do nothing;

  -- fatos que mudaram
  insert into turbo_facts(student_id, fact_id, state, ok_count, ok_days, last_ok_day, good_sessions, review_step, due, recent, lat_ms, stubborn, reached_consolidating)
  select sid, f->>'id', (f->>'s')::smallint, coalesce((f->>'n')::int, 0), coalesce((f->>'daysOk')::int, 0), (f->>'lastOkDay')::date,
         coalesce((f->>'good')::smallint, 0), coalesce((f->>'rev')::smallint, 0), (f->>'due')::date, coalesce(f->'recent', '[]'::jsonb),
         (f->>'lat')::numeric::int, coalesce((f->>'stub')::boolean, false), coalesce((f->>'reached')::boolean, false)
    from jsonb_array_elements(coalesce(p_session->'facts', '[]'::jsonb)) f
  on conflict (student_id, fact_id) do update set
    state = excluded.state, ok_count = excluded.ok_count, ok_days = excluded.ok_days, last_ok_day = excluded.last_ok_day,
    good_sessions = excluded.good_sessions, review_step = excluded.review_step, due = excluded.due, recent = excluded.recent,
    lat_ms = excluded.lat_ms, stubborn = excluded.stubborn, reached_consolidating = excluded.reached_consolidating;

  -- configuração do aluno (aparelhos e nivelamento vêm do motor)
  update turbo_students set
    devices = case when p_session ? 'devices' then p_session->'devices' else devices end,
    placement = case when p_session ? 'placement' then p_session->'placement' else placement end
   where student_id = sid;

  -- o dia
  v_status := case when coalesce((res->>'done')::boolean, false) and not coalesce((res->>'guess')::boolean, false) then 'done'
                   when coalesce((res->>'guess')::boolean, false) then 'guess'
                   when coalesce((res->>'noTask')::boolean, false) then 'no_task'
                   else 'started' end;
  n_call := least(greatest(coalesce((res->>'attempts')::int, 0), 0), 200);
  select status into prev_status from turbo_days where student_id = sid and study_day = p_day;
  insert into turbo_days(student_id, study_day, status, attempts, secs, promoted, demoted, device, finished_at)
    values (sid, p_day, v_status, n_call, least(greatest(coalesce((res->>'secs')::numeric, 0), 0), 14400),
            least(greatest(coalesce((res->>'promoted')::int, 0), 0), 80), least(greatest(coalesce((res->>'demoted')::int, 0), 0), 80), dev,
            case when v_status = 'started' then null else now() end)
  on conflict (student_id, study_day) do update set
    status = case when turbo_days.status = 'done' then 'done' else excluded.status end,
    attempts = turbo_days.attempts + excluded.attempts,
    secs = turbo_days.secs + excluded.secs,
    promoted = turbo_days.promoted + excluded.promoted,
    demoted = turbo_days.demoted + excluded.demoted,
    device = coalesce(excluded.device, turbo_days.device),
    finished_at = coalesce(excluded.finished_at, turbo_days.finished_at);

  -- pacotinho do Turbo do dia (1 por dia: o índice awards_pack_once garante)
  ok_day := p_day >= s.start_date and (extract(dow from p_day)::int = any(s.study_days) or extract(dow from p_day)::int = any(s.free_days));
  select attempts into n_att from turbo_days where student_id = sid and study_day = p_day;
  -- "pelo menos 3 tentativas" vale para esta chamada; só quem pausou e voltou no mesmo dia (dia ainda "started") soma com as anteriores.
  -- Assim uma sessão de chute não deixa a seguinte, curta, levar o pacotinho.
  if coalesce((res->>'pack')::boolean, false) and ok_day and v_status = 'done' and n_att >= 3
     and (n_call >= 3 or coalesce(prev_status, '') = 'started') then
    got := public._give_packs(sid, p_day, 'turbo', 1);
  end if;
  given := exists (select 1 from awards a where a.student_id = sid and a.source = 'turbo' and a.earned_day = p_day and a.kind in ('pacote','figurinha'));
  update turbo_days set pack_given = given where student_id = sid and study_day = p_day;

  -- tentativas, só com consentimento dos responsáveis
  if s.consent_at is not null then
    insert into turbo_attempts(anon_id, student_id, study_day, session_key, fact_id, kind, ok, t1_ms, total_ms, hint, counted, state_before, device)
    select s.anon_id, sid, p_day, left(p_session->>'sessionKey', 60), a->>'fact', a->>'kind', (a->>'ok')::boolean,
           (a->>'t1')::numeric::int, (a->>'total')::numeric::int, coalesce(a->>'hint', 'none'), coalesce((a->>'counted')::boolean, false),
           (a->>'stateBefore')::smallint, dev
      from jsonb_array_elements(coalesce(p_session->'attempts', '[]'::jsonb)) a;
  end if;

  return jsonb_build_object('ok', true, 'pack_given', given, 'pack_new', got > 0,
    'pending_packs', (select count(*) from awards where student_id = sid and kind = 'pacote'));
end $function$;

CREATE OR REPLACE FUNCTION public.admin_overview()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  return jsonb_build_object(
    'totals', jsonb_build_object(
      'accounts',    (select count(*) from auth.users),
      'students',    (select count(*) from students),
      'sheets_done', (select count(*) from sheets where status = 'done'),
      'sheets_7d',   (select count(*) from sheets where status = 'done' and finished_at >= now() - interval '7 days'),
      'active_7d',   (select count(distinct student_id) from sheets where status = 'done' and finished_at >= now() - interval '7 days'),
      'friendships', (select count(*) from friendships where status = 'aceita'),
      'vip',         (select count(*) from auth.users u where public._is_vip(u.id))),
    'accounts', coalesce((
      select jsonb_agg(to_jsonb(a) order by a.created_at desc)
        from (select u.id, u.email, p.name, p.role, u.created_at, u.last_sign_in_at,
                     (select count(*) from guardians g where g.user_id = u.id) as students,
                     public._plan_info(u.id) as plan,
                     (select coalesce(jsonb_agg(jsonb_build_object('id', e.id, 'source', e.source, 'ends_at', e.ends_at, 'max_students', e.max_students, 'note', e.note) order by e.ends_at nulls first), '[]'::jsonb)
                        from entitlements e where e.user_id = u.id and e.revoked_at is null and (e.ends_at is null or e.ends_at > now())) as ents
                from auth.users u left join profiles p on p.id = u.id) a), '[]'::jsonb),
    'students', coalesce((
      select jsonb_agg(to_jsonb(s) order by s.created_at desc)
        from (select st.id, st.name, st.level_idx, st.stamps, st.streak, st.sticker_themes, st.created_at,
                     (select count(*) from sheets h where h.student_id = st.id and h.status = 'done') as sheets_done,
                     (select max(h.finished_at) from sheets h where h.student_id = st.id and h.status = 'done') as last_study,
                     (select coalesce(jsonb_agg(u.email order by g.created_at), '[]'::jsonb)
                        from guardians g join auth.users u on u.id = g.user_id where g.student_id = st.id) as owners
                from students st) s), '[]'::jsonb));
end $function$;

CREATE OR REPLACE FUNCTION public.admin_set_settings(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  limits constant jsonb := '{"stamps_needed":[1,10],"normal_acertos":[50,100],"ouro_acertos":[50,100],"ouro_tempo":[10,100],
    "ouro_carimbos":[1,10],"salto_acertos":[50,100],"salto_tempo":[10,100],"salto_por_semana":[0,14],
    "dias_sem_carimbo_voltar":[1,10],"bloqueio_salto_dias":[0,60],"teto_anos_padrao":[0,9],"virada_mes":[1,12],"virada_dia":[1,28],"limite_mesa":[1,5],"pausas_max":[0,10],"modo_folha":[0,1],
    "plano_folhas_gratis":[1,10],"plano_albuns_gratis":[1,5],"plano_alunos_gratis":[1,10],"plano_alunos_vip":[1,20],"plano_teste_dias":[0,60]}';
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

-- ---------- Fundador: as contas que já existem ganham 3 meses de VIP ----------
insert into public.entitlements(user_id, source, ends_at, note)
  select u.id, 'fundador', now() + interval '3 months', 'Fundador: 3 meses de VIP'
    from auth.users u
   where not exists (select 1 from public.entitlements e where e.user_id = u.id and e.source = 'fundador');

-- ---------- permissões ----------
revoke all on function public._vip_until(uuid), public._is_vip(uuid), public._student_vip(uuid), public._need_vip(uuid),
  public._plan_max_students(uuid), public._sheets_quota(public.students), public._plan_info(uuid), public._give_packs(uuid, date, text, int)
  from public, anon, authenticated;
revoke all on function public.adult_plan(), public.admin_grant_vip(text, int, int, text), public.admin_revoke_vip(uuid) from public, anon;
grant execute on function public.adult_plan(), public.admin_grant_vip(text, int, int, text), public.admin_revoke_vip(uuid) to authenticated;

commit;

-- Reverter (se for preciso):
-- begin;
--   recriar as 16 funções alteradas e public._give_packs a partir das migrações anteriores (ou da cópia de produção de 17/11/2026);
--   drop function public.adult_plan(), public.admin_grant_vip(text, int, int, text), public.admin_revoke_vip(uuid), public._plan_info(uuid),
--     public._sheets_quota(public.students), public._plan_max_students(uuid), public._need_vip(uuid), public._student_vip(uuid),
--     public._is_vip(uuid), public._vip_until(uuid);
--   drop table public.entitlements;
--   delete from public.app_settings where key like 'plano\_%';
-- commit;
