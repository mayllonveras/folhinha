-- Estrutura do banco de produção (projeto folhinha-calculo) em 17/11/2026, ANTES da migração 2026-11-17-plano-vip.sql. Sem dados.
-- Gerado por consulta ao catálogo (tabelas, funções, padrões, restrições, índices, gatilhos, RLS, políticas e visões).
create table public.albums (id text not null, name text not null, categoria text not null, ordem integer not null, ativo boolean not null);
create table public.app_settings (key text not null, value numeric not null, updated_at timestamp with time zone not null, updated_by uuid);
create table public.awards (id uuid not null, student_id uuid not null, kind text not null, theme text, slot integer, period_mode text not null, period_start date not null, period_end date not null, earned_at timestamp with time zone not null, earned_day date, source text, seq integer not null, traded_from uuid);
create table public.friendships (id uuid not null, requester uuid not null, addressee uuid not null, status text not null, created_at timestamp with time zone not null, answered_at timestamp with time zone);
create table public.guardians (student_id uuid not null, user_id uuid not null, role text not null, created_at timestamp with time zone not null);
create table public.invites (code text not null, student_id uuid not null, created_by uuid not null, created_at timestamp with time zone not null, expires_at timestamp with time zone not null, used_by uuid);
create table public.level_moves (id uuid not null, student_id uuid not null, at timestamp with time zone not null, day date not null, from_idx integer not null, to_idx integer not null, kind text not null);
create table public.level_videos (id uuid not null, level_code text not null, tipo text not null, publico text not null, topico text, titulo text not null, fonte text not null, url text not null, poster text, duracao_s integer, legenda text, ordem integer not null, ativo boolean not null, created_at timestamp with time zone not null, updated_at timestamp with time zone not null);
create table public.levels (idx integer not null, code text not null, target integer not null, ano integer not null, stamps_needed integer);
create table public.month_settings (student_id uuid not null, month_start date not null, goal integer not null, reward text not null);
create table public.profiles (id uuid not null, name text not null, role text not null, created_at timestamp with time zone not null);
create table public.rarity_weights (tier text not null, weight numeric not null);
create table public.sheet_items (id bigint not null, sheet_id uuid not null, pos integer not null, anon_id uuid not null, student_id uuid, level_idx integer, level_code text, pre text, post text, correta integer, primeira text, acertou_primeira boolean, tentativas integer, ms integer, respostas jsonb, extra jsonb, modo text, ms_inicio integer);
create table public.sheet_log (sheet_id uuid not null, anon_id uuid not null, student_id uuid, level_idx integer, level_code text, study_day date, started_at timestamp with time zone, finished_at timestamp with time zone, secs numeric, first_ok integer, total integer, corrections integer, points integer, stamp boolean, advanced boolean, tier text, gained integer, created_at timestamp with time zone not null, modo text);
create table public.sheets (id uuid not null, student_id uuid not null, level_idx integer not null, study_day date not null, week_end date not null, status text not null, problems jsonb not null, answers jsonb, first_ok integer, total integer not null, secs numeric, corrections integer not null, stamp boolean not null, advanced boolean not null, points integer not null, started_at timestamp with time zone not null, finished_at timestamp with time zone, tier text, gained integer not null);
create table public.sticker_rarity (theme text not null, slot integer not null, tier text not null);
create table public.student_secrets (student_id uuid not null, pin_hash text, failed integer not null, locked_until timestamp with time zone);
create table public.student_sessions (token_hash text not null, student_id uuid not null, created_at timestamp with time zone not null, last_seen timestamp with time zone not null);
create table public.students (id uuid not null, name text not null, link_code text not null, level_idx integer not null, stamps integer not null, start_date date not null, study_days integer[] not null, sheets_per_day integer not null, week_close_dow integer not null, weekly_goal integer not null, reward text not null, created_by uuid not null, created_at timestamp with time zone not null, repeat_mode text not null, stamps_needed integer not null, reward_period text not null, monthly_goal integer not null, reward_system text not null, sticker_theme text not null, sticker_themes text[] not null, streak integer not null, best_streak integer not null, last_streak_day date, friend_code text not null, ano_escolar integer, ano_ref integer, teto_anos integer, reached_by_jump boolean not null, dry_days integer not null, sem_salto_ate date, free_days integer[] not null, welcome_at timestamp with time zone, desk_themes text[] not null, albums_done_at timestamp with time zone, anon_id uuid not null, consent_at timestamp with time zone, consent_by uuid);
create table public.trade_items (trade_id uuid not null, side text not null, theme text not null, slot integer not null);
create table public.trades (id uuid not null, requester uuid not null, addressee uuid not null, give_theme text, give_slot integer, want_theme text, want_slot integer, status text not null, created_at timestamp with time zone not null, expires_at timestamp with time zone not null, answered_at timestamp with time zone, requester_seen boolean not null);
create table public.turbo_attempts (id bigint not null, anon_id uuid not null, student_id uuid, at timestamp with time zone not null, study_day date not null, session_key text, fact_id text not null, kind text not null, ok boolean not null, t1_ms integer, total_ms integer, hint text, counted boolean not null, state_before smallint, device text);
create table public.turbo_days (student_id uuid not null, study_day date not null, status text not null, attempts integer not null, secs numeric not null, promoted integer not null, demoted integer not null, device text, pack_given boolean not null, started_at timestamp with time zone not null, finished_at timestamp with time zone);
create table public.turbo_facts (student_id uuid not null, fact_id text not null, state smallint not null, ok_count integer not null, ok_days integer not null, last_ok_day date, good_sessions smallint not null, review_step smallint not null, due date, recent jsonb not null, lat_ms integer, stubborn boolean not null, reached_consolidating boolean not null, updated_at timestamp with time zone not null);
create table public.turbo_students (student_id uuid not null, unlocked text[] not null, age integer, devices jsonb not null, placement jsonb, skip_placement boolean not null, created_at timestamp with time zone not null, updated_at timestamp with time zone not null);
create table public.usage_events (id bigint not null, anon_id uuid not null, student_id uuid, at timestamp with time zone not null, client_at timestamp with time zone, kind text not null, level_idx integer, level_code text, sheet_id uuid, data jsonb not null, app_version text, device text, screen_w integer, session_key text);
create table public.weak_items (student_id uuid not null, level_idx integer not null, pre text not null, post text not null, ans numeric not null, misses integer not null, streak_ok integer not null, last_miss timestamp with time zone not null, extra jsonb, sig text not null);
create table public.week_settings (student_id uuid not null, week_end date not null, goal integer not null, reward text not null);
CREATE OR REPLACE FUNCTION public.calc_points(p_ok integer, p_secs numeric, p_target integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select round(10 * p_ok * case when p_secs <= p_target then 1.0
    else greatest(0.2, 1 - 0.8 * least(1.0, power((p_secs - p_target) / p_target::numeric, 2))) end)::int $function$
;
CREATE OR REPLACE FUNCTION public.week_end_of(p_day date, p_close integer)
 RETURNS date
 LANGUAGE sql
 IMMUTABLE
AS $function$ select p_day + (((p_close - extract(dow from p_day)::int) + 7) % 7) $function$
;
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
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public._new_session(p_sid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare t text := encode(gen_random_bytes(32),'hex');
begin
  insert into student_sessions(token_hash, student_id) values (encode(digest(t,'sha256'),'hex'), p_sid);
  return t;
end $function$
;
CREATE OR REPLACE FUNCTION public.is_guardian(p_student uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists(select 1 from guardians g where g.student_id=p_student and g.user_id=auth.uid()) $function$
;
CREATE OR REPLACE FUNCTION public.shares_student(p_user uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists(select 1 from guardians a join guardians b on a.student_id=b.student_id
                where a.user_id=auth.uid() and b.user_id=p_user) $function$
;
CREATE OR REPLACE FUNCTION public.reset_pin(p_student uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not is_guardian(p_student) then raise exception 'sem_permissao'; end if;
  delete from student_sessions where student_id = p_student;
  update student_secrets set pin_hash = null, failed = 0, locked_until = null where student_id = p_student;
end $function$
;
CREATE OR REPLACE FUNCTION public.level_target(p_idx integer)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select target from levels where idx = p_idx $function$
;
CREATE OR REPLACE FUNCTION public.sync_week_settings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.weekly_goal is distinct from old.weekly_goal or new.reward is distinct from old.reward then
    update week_settings set goal=new.weekly_goal, reward=new.reward
     where student_id=new.id and week_end >= current_date - 1;
  end if;
  if new.monthly_goal is distinct from old.monthly_goal or new.reward is distinct from old.reward then
    update month_settings set goal=new.monthly_goal, reward=new.reward
     where student_id=new.id and month_start >= date_trunc('month', current_date)::date;
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public._student_from_token(p_token text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; h text := encode(digest(coalesce(p_token,''),'sha256'),'hex');
begin
  select student_id into sid from student_sessions where token_hash = h;
  if sid is null then raise exception 'sessao_invalida' using errcode='28000'; end if;
  update student_sessions set last_seen = now() where token_hash = h;
  return sid;
end $function$
;
CREATE OR REPLACE FUNCTION public.student_info(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare s students%rowtype; hp boolean;
begin
  select * into s from students where link_code = p_code;
  if not found then return null; end if;
  select (pin_hash is not null) into hp from student_secrets where student_id = s.id;
  return jsonb_build_object('name', s.name, 'has_pin', coalesce(hp,false));
end $function$
;
CREATE OR REPLACE FUNCTION public.student_logout(p_token text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  delete from student_sessions where token_hash = encode(digest(coalesce(p_token,''),'sha256'),'hex') $function$
;
CREATE OR REPLACE FUNCTION public._last_study_day(p_sid uuid, p_day date)
 RETURNS date
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare s students%rowtype;
begin
  select * into s from students where id = p_sid;
  if p_day >= s.start_date and extract(dow from p_day)::int = any(s.study_days) then return p_day; end if;
  return public._prev_study_day(p_sid, p_day);
end $function$
;
CREATE OR REPLACE FUNCTION public._streak_view(p_sid uuid, p_day date)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare s students%rowtype; ref date;
begin
  select * into s from students where id = p_sid;
  if s.last_streak_day is null then return 0; end if;
  ref := public._last_study_day(p_sid, p_day);
  if ref is null then return 0; end if;
  if s.last_streak_day = ref then return s.streak; end if;
  -- hoje é dia de estudo e ainda não fechou: a sequência de ontem (dia agendado anterior) segue viva
  if ref = p_day and s.last_streak_day = public._prev_study_day(p_sid, ref) then return s.streak; end if;
  return 0;
end $function$
;
CREATE OR REPLACE FUNCTION public.student_set_pin(p_code text, p_pin text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; hp text;
begin
  select id into sid from students where link_code = p_code;
  if sid is null then return jsonb_build_object('ok',false,'error','link_invalido'); end if;
  if p_pin !~ '^[0-9]{4}$' then return jsonb_build_object('ok',false,'error','pin_invalido'); end if;
  select pin_hash into hp from student_secrets where student_id = sid for update;
  if hp is not null then return jsonb_build_object('ok',false,'error','pin_ja_definido'); end if;
  insert into student_secrets(student_id, pin_hash, failed, locked_until)
    values (sid, crypt(p_pin, gen_salt('bf')), 0, null)
    on conflict (student_id) do update set pin_hash = excluded.pin_hash, failed = 0, locked_until = null;
  return jsonb_build_object('ok',true,'token', public._new_session(sid));
end $function$
;
CREATE OR REPLACE FUNCTION public.student_login(p_code text, p_pin text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; sec student_secrets%rowtype;
begin
  select id into sid from students where link_code = p_code;
  if sid is null then return jsonb_build_object('ok',false,'error','link_invalido'); end if;
  select * into sec from student_secrets where student_id = sid for update;
  if sec.pin_hash is null then return jsonb_build_object('ok',false,'error','sem_pin'); end if;
  if sec.locked_until is not null and sec.locked_until > now() then
    return jsonb_build_object('ok',false,'error','bloqueado','locked_until',sec.locked_until);
  end if;
  if crypt(coalesce(p_pin,''), sec.pin_hash) = sec.pin_hash then
    update student_secrets set failed = 0, locked_until = null where student_id = sid;
    return jsonb_build_object('ok',true,'token', public._new_session(sid));
  end if;
  if sec.failed + 1 >= 5 then
    update student_secrets set failed = 0, locked_until = now() + interval '10 minutes' where student_id = sid;
    return jsonb_build_object('ok',false,'error','bloqueado','locked_until', now() + interval '10 minutes');
  end if;
  update student_secrets set failed = failed + 1 where student_id = sid;
  return jsonb_build_object('ok',false,'error','pin_incorreto','tries_left', 5 - (sec.failed + 1));
end $function$
;
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
  if done_today >= s.sheets_per_day then raise exception 'meta_cumprida'; end if;
  delete from sheets where student_id = sid and status = 'started';
  insert into sheets(student_id, level_idx, study_day, week_end, problems)
    values (sid, s.level_idx, p_day, week_end_of(p_day, s.week_close_dow), p_problems)
    returning id into new_id;
  insert into week_settings(student_id, week_end, goal, reward)
    values (sid, week_end_of(p_day, s.week_close_dow), s.weekly_goal, s.reward)
    on conflict do nothing;
  return new_id;
end $function$
;
CREATE OR REPLACE FUNCTION public.create_invite(p_student uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare code text := upper(substr(encode(gen_random_bytes(6),'hex'),1,8));
begin
  if not exists(select 1 from guardians where student_id=p_student and user_id=auth.uid() and role='owner')
    then raise exception 'sem_permissao'; end if;
  insert into invites(code, student_id, created_by) values (code, p_student, auth.uid());
  return code;
end $function$
;
CREATE OR REPLACE FUNCTION public.redeem_invite(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare inv invites%rowtype; sname text;
begin
  if auth.uid() is null then raise exception 'nao_autenticado' using errcode='28000'; end if;
  select * into inv from invites where code = upper(trim(p_code)) for update;
  if not found or inv.used_by is not null or inv.expires_at < now() then raise exception 'convite_invalido'; end if;
  insert into guardians(student_id, user_id, role) values (inv.student_id, auth.uid(), 'member')
    on conflict do nothing;
  update invites set used_by = auth.uid() where code = inv.code;
  select name into sname from students where id = inv.student_id;
  return jsonb_build_object('student_id', inv.student_id, 'name', sname);
end $function$
;
CREATE OR REPLACE FUNCTION public.delete_student(p_student uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists(select 1 from guardians where student_id=p_student and user_id=auth.uid() and role='owner')
    then raise exception 'sem_permissao'; end if;
  delete from students where id = p_student;
end $function$
;
CREATE OR REPLACE FUNCTION public.regenerate_link(p_student uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare code text := gen_link_code();
begin
  if not is_guardian(p_student) then raise exception 'sem_permissao'; end if;
  update students set link_code = code where id = p_student;
  delete from student_sessions where student_id = p_student;
  return code;
end $function$
;
CREATE OR REPLACE FUNCTION public._ensure_award(p_sid uuid, p_day date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare s students%rowtype; per jsonb; ps date; pe date; room boolean;
begin
  select * into s from students where id = p_sid;
  per := public._period_info(p_sid, p_day);
  if not (per->>'reached')::boolean then return null; end if;
  ps := (per->>'start')::date; pe := (per->>'end')::date;
  if exists(select 1 from awards where student_id=p_sid and kind in ('pacote','figurinha') and period_end=pe) then return null; end if;
  select exists(select 1 from unnest(s.sticker_themes) t(id)
                 where (select count(*) from awards a where a.student_id=p_sid and a.kind='figurinha' and a.theme=t.id) < 52) into room;
  if not room then return null; end if;
  insert into awards(student_id, kind, period_mode, period_start, period_end) values (p_sid, 'pacote', 'semanal', ps, pe) on conflict do nothing;
  if found then return jsonb_build_object('kind','pacote','period_end',pe); end if;
  return null;
end $function$
;
CREATE OR REPLACE FUNCTION public._period_info(p_sid uuid, p_day date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare s students%rowtype; ps date; pe date; pts int; g int; snap boolean := false; reached boolean;
begin
  select * into s from students where id = p_sid;
  pe := week_end_of(p_day, s.week_close_dow); ps := pe - 6;
  select coalesce(sum(points),0) into pts from sheets where student_id=p_sid and status='done' and week_end=pe;
  select goal into g from week_settings where student_id=p_sid and week_end=pe;
  if g is null then g := s.weekly_goal; else snap := true; end if;
  reached := g > 0 and pts >= g;
  return jsonb_build_object('mode','semanal','start',ps,'end',pe,'points',pts,'goal',g,'reached',reached,'reward',null,'snapshot',snap);
end $function$
;
CREATE OR REPLACE FUNCTION public.students_sync_theme()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if tg_op = 'INSERT' or new.sticker_themes is distinct from old.sticker_themes then new.sticker_theme := new.sticker_themes[1]; end if;
  return new;
end $function$
;
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
end $function$
;
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
  day_closed := done_n >= s.sheets_per_day and sh.level_idx = s.level_idx
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
    'free_day', is_free, 'day_closed', day_closed, 'day_done', done_n, 'day_quota', s.sheets_per_day, 'day_ok', day_ok, 'day_total', day_total,
    'day_pct', day_pct, 'day_avg_secs', avg_secs, 'why', why,
    'packs', jsonb_build_object('carimbo', pk_c, 'perseveranca', pk_p, 'marco', pk_m),
    'marco_streak', case when pk_m > 0 then new_streak else null end,
    'streak', stk, 'best_streak', stk_best, 'next_marco', public._next_marco(stk),
    'pending_packs', (select count(*) from awards where student_id = sid and kind = 'pacote'));
end $function$
;
CREATE OR REPLACE FUNCTION public._marco_packs(p_streak integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when p_streak = 3 then 2
    when p_streak = 7 then 3
    when p_streak = 14 then 5
    when p_streak >= 30 and p_streak % 30 = 0 then 5
    else 0 end $function$
;
CREATE OR REPLACE FUNCTION public._next_marco(p_streak integer)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when p_streak < 3  then jsonb_build_object('at', 3,  'packs', 2)
    when p_streak < 7  then jsonb_build_object('at', 7,  'packs', 3)
    when p_streak < 14 then jsonb_build_object('at', 14, 'packs', 5)
    else jsonb_build_object('at', (p_streak / 30 + 1) * 30, 'packs', 5) end $function$
;
CREATE OR REPLACE FUNCTION public._give_packs(p_sid uuid, p_day date, p_source text, p_n integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare s students%rowtype; room boolean; i int; got int := 0;
begin
  select * into s from students where id = p_sid;
  select exists(select 1 from unnest(s.sticker_themes) t(id)
                 where (select count(*) from awards a where a.student_id = p_sid and a.kind = 'figurinha' and a.theme = t.id) < 52) into room;
  if not room then return 0; end if;
  for i in 1..p_n loop
    insert into awards(student_id, kind, period_mode, period_start, period_end, earned_day, source, seq)
      values (p_sid, 'pacote', 'diario', p_day, p_day, p_day, p_source, i)
      on conflict do nothing;
    if found then got := got + 1; end if;
  end loop;
  return got;
end $function$
;
CREATE OR REPLACE FUNCTION public._prev_study_day(p_sid uuid, p_day date)
 RETURNS date
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare s students%rowtype; d date;
begin
  select * into s from students where id = p_sid;
  d := p_day - 1;
  while d >= s.start_date and d >= p_day - 14 loop
    if extract(dow from d)::int = any(s.study_days) then return d; end if;
    d := d - 1;
  end loop;
  return null;
end $function$
;
CREATE OR REPLACE FUNCTION public.students_check_limits()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare dias int;
begin
  if tg_op = 'UPDATE' and new.study_days is not distinct from old.study_days
     and new.sheets_per_day is not distinct from old.sheets_per_day then
    return new;
  end if;
  select count(distinct d) into dias from unnest(new.study_days) d;
  if new.sheets_per_day < 3 then raise exception 'min_folhas'; end if;
  if dias < 3 then raise exception 'min_dias'; end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.students_fixed_rules()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare need int := public.level_stamps(new.level_idx);
begin
  new.stamps_needed := need; new.repeat_mode := 'reforco';
  if new.stamps > need then new.stamps := need; end if;
  return new;
end $function$
;
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
    update friendships set status = 'aceita', answered_at = now() where id = p_id and addressee = sid and status = 'pendente';
  else
    delete from friendships where id = p_id and addressee = sid and status = 'pendente';
  end if;
  if not found then raise exception 'convite_invalido'; end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.student_friend_remove(p_token text, p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  delete from friendships where id = p_id and sid in (requester, addressee);
  if not found then raise exception 'convite_invalido'; end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.student_friend_view(p_token text, p_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; oid uuid; o students%rowtype;
begin
  sid := public._student_from_token(p_token);
  select case when requester = sid then addressee else requester end into oid
    from friendships where id = p_id and status = 'aceita' and sid in (requester, addressee);
  if oid is null then raise exception 'convite_invalido'; end if;
  select * into o from students where id = oid;
  return jsonb_build_object('name', o.name, 'level_idx', o.level_idx, 'stamps', least(o.stamps, 5), 'stamps_needed', 5,
    'sticker_themes', to_jsonb(o.sticker_themes),
    'stickers', coalesce((select jsonb_agg(jsonb_build_object('theme', a.theme, 'slot', a.slot) order by a.earned_at)
        from awards a where a.student_id = oid and a.kind = 'figurinha' and a.theme = any(o.sticker_themes)), '[]'::jsonb));
end $function$
;
CREATE OR REPLACE FUNCTION public.adult_friends(p_student uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists(select 1 from guardians where student_id = p_student and user_id = auth.uid()) then raise exception 'sem_permissao'; end if;
  return jsonb_build_object(
    'code', (select friend_code from students where id = p_student),
    'friends', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name, 'status', f.status,
          'sent', f.requester = p_student) order by f.status, o.name)
        from friendships f join students o on o.id = case when f.requester = p_student then f.addressee else f.requester end
       where p_student in (f.requester, f.addressee)), '[]'::jsonb));
end $function$
;
CREATE OR REPLACE FUNCTION public.adult_friend_remove(p_student uuid, p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists(select 1 from guardians where student_id = p_student and user_id = auth.uid()) then raise exception 'sem_permissao'; end if;
  delete from friendships where id = p_id and p_student in (requester, addressee);
end $function$
;
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
      'friendships', (select count(*) from friendships where status = 'aceita')),
    'accounts', coalesce((
      select jsonb_agg(to_jsonb(a) order by a.created_at desc)
        from (select u.id, u.email, p.name, p.role, u.created_at, u.last_sign_in_at,
                     (select count(*) from guardians g where g.user_id = u.id) as students
                from auth.users u left join profiles p on p.id = u.id) a), '[]'::jsonb),
    'students', coalesce((
      select jsonb_agg(to_jsonb(s) order by s.created_at desc)
        from (select st.id, st.name, st.level_idx, st.stamps, st.streak, st.sticker_themes, st.created_at,
                     (select count(*) from sheets h where h.student_id = st.id and h.status = 'done') as sheets_done,
                     (select max(h.finished_at) from sheets h where h.student_id = st.id and h.status = 'done') as last_study,
                     (select coalesce(jsonb_agg(u.email order by g.created_at), '[]'::jsonb)
                        from guardians g join auth.users u on u.id = g.user_id where g.student_id = st.id) as owners
                from students st) s), '[]'::jsonb));
end $function$
;
CREATE OR REPLACE FUNCTION public._new_friend_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare abc constant text := 'BCDFGHJKMNPQRSTVWXZ26789'; c text; i int;
  vetadas constant text[] := array['PQP','FDP','KKK','XXX','BCT','PNC','VTNC','TNC','XTC','BST','MRD','CRL','PRR','PUT','VSF','FDS','CZ'];
begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(abc, 1 + floor(random() * length(abc))::int, 1); end loop;
    exit when not exists(select 1 from students where friend_code = c)
          and not exists(select 1 from unnest(vetadas) v where position(v in c) > 0);
  end loop;
  return c;
end $function$
;
CREATE OR REPLACE FUNCTION public.student_friends(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; code text;
begin
  sid := public._student_from_token(p_token);
  select friend_code into code from students where id = sid;
  return jsonb_build_object('code', code,
    'friends', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name, 'level_idx', o.level_idx, 'stamps', least(o.stamps, 5)) order by o.name)
        from friendships f join students o on o.id = case when f.requester = sid then f.addressee else f.requester end
       where f.status = 'aceita' and sid in (f.requester, f.addressee)), '[]'::jsonb),
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name) order by f.created_at)
        from friendships f join students o on o.id = f.requester where f.status = 'pendente' and f.addressee = sid), '[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name) order by f.created_at)
        from friendships f join students o on o.id = f.addressee where f.status = 'pendente' and f.requester = sid), '[]'::jsonb));
end $function$
;
CREATE OR REPLACE FUNCTION public.student_friend_invite(p_token text, p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; o students%rowtype; f friendships%rowtype;
begin
  sid := public._student_from_token(p_token);
  select * into o from students where friend_code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then raise exception 'codigo_invalido'; end if;
  if o.id = sid then raise exception 'proprio_codigo'; end if;
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
end $function$
;
CREATE OR REPLACE FUNCTION public.gen_link_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  alphabet constant text := 'abcdefghijkmnpqrstuvwxyz23456789'; -- 32 símbolos (sem l, o, 0, 1): 256 % 32 = 0, sorteio uniforme
  b bytea; c text; i int;
begin
  loop
    b := gen_random_bytes(8); c := '';
    for i in 0..7 loop
      c := c || substr(alphabet, (get_byte(b, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from students where link_code = c);
  end loop;
  return c;
end $function$
;
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists(select 1 from auth.users u
                 where u.id = auth.uid() and lower(u.email) = 'gradematic@gmail.com' and u.email_confirmed_at is not null)
$function$
;
CREATE OR REPLACE FUNCTION public.students_set_ano_ref()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if tg_op = 'INSERT' then
    if new.ano_escolar is not null and new.ano_ref is null then new.ano_ref := ano_letivo(current_date); end if;
  elsif new.ano_escolar is distinct from old.ano_escolar then
    new.ano_ref := case when new.ano_escolar is null then null else ano_letivo(current_date) end;
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.student_go_back(p_token text, p_accept boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; to_idx int;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid for update;
  if not (s.reached_by_jump and s.level_idx > 0 and s.dry_days >= app_setting('dias_sem_carimbo_voltar', 2)::int)
    then raise exception 'sem_oferta'; end if;
  if p_accept then
    to_idx := s.level_idx - 1;
    insert into level_moves(student_id, day, from_idx, to_idx, kind) values (sid, current_date, s.level_idx, to_idx, 'voltou');
    update students set level_idx = to_idx, stamps = 0, reached_by_jump = false, dry_days = 0,
           sem_salto_ate = current_date + app_setting('bloqueio_salto_dias', 7)::int where id = sid;
    delete from weak_items where student_id = sid and level_idx <> to_idx;
    return jsonb_build_object('ok', true, 'level_idx', to_idx, 'went_back', true);
  end if;
  update students set dry_days = 0 where id = sid;
  return jsonb_build_object('ok', true, 'level_idx', s.level_idx, 'went_back', false);
end $function$
;
CREATE OR REPLACE FUNCTION public.app_public()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) from app_settings $function$
;
CREATE OR REPLACE FUNCTION public.admin_get_settings()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  return (select jsonb_object_agg(key, value) from app_settings);
end $function$
;
CREATE OR REPLACE FUNCTION public.app_setting(p_key text, p_default numeric DEFAULT NULL::numeric)
 RETURNS numeric
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select coalesce((select value from app_settings where key = p_key), p_default) $function$
;
CREATE OR REPLACE FUNCTION public.ano_letivo(p_day date)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select extract(year from p_day)::int
       - case when (extract(month from p_day)::int, extract(day from p_day)::int)
                 < (app_setting('virada_mes', 1)::int, app_setting('virada_dia', 1)::int) then 1 else 0 end
$function$
;
CREATE OR REPLACE FUNCTION public.ano_do_aluno(p_ano integer, p_ref integer, p_day date)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case when p_ano is null or p_ref is null then null
              else least(9, greatest(1, p_ano + ano_letivo(p_day) - p_ref)) end
$function$
;
CREATE OR REPLACE FUNCTION public.admin_set_settings(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  limits constant jsonb := '{"stamps_needed":[1,10],"normal_acertos":[50,100],"ouro_acertos":[50,100],"ouro_tempo":[10,100],
    "ouro_carimbos":[1,10],"salto_acertos":[50,100],"salto_tempo":[10,100],"salto_por_semana":[0,14],
    "dias_sem_carimbo_voltar":[1,10],"bloqueio_salto_dias":[0,60],"teto_anos_padrao":[0,9],"virada_mes":[1,12],"virada_dia":[1,28],"limite_mesa":[1,5],"pausas_max":[0,10],"modo_folha":[0,1]}';
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
end $function$
;
CREATE OR REPLACE FUNCTION public._copies(p_sid uuid, p_theme text, p_slot integer)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select count(*)::int from awards where student_id = p_sid and kind = 'figurinha' and theme = p_theme and slot = p_slot $function$
;
CREATE OR REPLACE FUNCTION public._has_album(p_sid uuid, p_theme text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select exists(select 1 from students where id = p_sid and p_theme = any(sticker_themes)) $function$
;
CREATE OR REPLACE FUNCTION public._are_friends(p_a uuid, p_b uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select exists(select 1 from friendships where status = 'aceita'
        and least(requester, addressee) = least(p_a, p_b) and greatest(requester, addressee) = greatest(p_a, p_b)) $function$
;
CREATE OR REPLACE FUNCTION public._ping(p_sid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'realtime'
AS $function$
begin
  begin
    perform realtime.send(jsonb_build_object('t', extract(epoch from now())), 'troca', 'troca-' || p_sid::text, false);
  exception when others then null;
  end;
end $function$
;
CREATE OR REPLACE FUNCTION public._reserved(p_sid uuid, p_theme text, p_slot integer, p_ignore uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select count(*)::int from trade_items i join trades t on t.id = i.trade_id
       where t.status = 'pendente' and t.id is distinct from p_ignore and i.theme = p_theme and i.slot = p_slot
         and ((i.side = 'give' and t.requester = p_sid) or (i.side = 'want' and t.addressee = p_sid)) $function$
;
CREATE OR REPLACE FUNCTION public.student_trade_options(p_token text, p_friendship uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare sid uuid; oid uuid; o students%rowtype; me students%rowtype;
begin
  sid := public._student_from_token(p_token);
  select case when requester = sid then addressee else requester end into oid
    from friendships where id = p_friendship and status = 'aceita' and sid in (requester, addressee);
  if oid is null then raise exception 'amizade_invalida'; end if;
  select * into me from students where id = sid;
  select * into o from students where id = oid;
  return jsonb_build_object('name', o.name,
    'give', coalesce((select jsonb_agg(jsonb_build_object('theme', t.theme, 'slot', t.slot, 'spare', t.n - 1 - public._reserved(sid, t.theme, t.slot, null)) order by t.theme, t.slot)
        from (select theme, slot, count(*) n from awards where student_id = sid and kind = 'figurinha' and theme = any(me.sticker_themes) and theme = any(o.sticker_themes) group by theme, slot having count(*) > 1) t
       where t.n - 1 - public._reserved(sid, t.theme, t.slot, null) > 0
         and not exists(select 1 from awards a where a.student_id = oid and a.kind = 'figurinha' and a.theme = t.theme and a.slot = t.slot)), '[]'::jsonb),
    'get', coalesce((select jsonb_agg(jsonb_build_object('theme', t.theme, 'slot', t.slot, 'spare', t.n - 1 - public._reserved(oid, t.theme, t.slot, null)) order by t.theme, t.slot)
        from (select theme, slot, count(*) n from awards where student_id = oid and kind = 'figurinha' and theme = any(me.sticker_themes) and theme = any(o.sticker_themes) group by theme, slot having count(*) > 1) t
       where t.n - 1 - public._reserved(oid, t.theme, t.slot, null) > 0
         and not exists(select 1 from awards a where a.student_id = sid and a.kind = 'figurinha' and a.theme = t.theme and a.slot = t.slot)), '[]'::jsonb));
end $function$
;
CREATE OR REPLACE FUNCTION public.student_sheet_plan(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; lst sheets%rowtype; rep jsonb; weak jsonb; teto_mode boolean;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid;
  if s.repeat_mode = 'mesma' then
    select * into lst from sheets where student_id=sid and status='done' order by finished_at desc limit 1;
    if found and not lst.stamp and lst.level_idx = s.level_idx then rep := lst.problems; end if;
  end if;
  if s.repeat_mode = 'reforco' then
    select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('pre',pre,'post',post,'a',ans,'extra',extra)) order by misses desc, last_miss desc),'[]'::jsonb)
      into weak from (select * from weak_items where student_id=sid and level_idx=s.level_idx
                      order by misses desc, last_miss desc limit 4) w;
  end if;
  -- no teto (nível concluído e o próximo passaria do ano permitido) a folha é de revisão, e não repete o último nível
  teto_mode := s.stamps >= public.level_stamps(s.level_idx) and public._at_teto(s, current_date);
  return jsonb_build_object('mode', s.repeat_mode, 'repeat', rep, 'weak', coalesce(weak,'[]'::jsonb), 'teto_mode', coalesce(teto_mode,false));
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_levels()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('idx', idx, 'code', code, 'ano', ano, 'target', target,
            'stamps_needed', stamps_needed, 'effective', public.level_stamps(idx)) order by idx), '[]'::jsonb) from levels);
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_set_level_stamps(p_idx integer, p_stamps integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if p_stamps is not null and (p_stamps < 1 or p_stamps > 10) then raise exception 'valor_invalido'; end if;
  update levels set stamps_needed = p_stamps where idx = p_idx;
  if not found then raise exception 'nivel_inexistente'; end if;
  update students set stamps = stamps where level_idx = p_idx;
  return public.admin_levels();
end $function$
;
CREATE OR REPLACE FUNCTION public.student_trades_seen(p_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  update trades set requester_seen = true where requester = sid and status <> 'pendente' and not requester_seen;
end $function$
;
CREATE OR REPLACE FUNCTION public.student_trade_cancel(p_token text, p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare sid uuid; adr uuid;
begin
  sid := public._student_from_token(p_token);
  update trades set status = 'cancelada', answered_at = now(), requester_seen = true where id = p_id and requester = sid and status = 'pendente' returning addressee into adr;
  if adr is null then raise exception 'pedido_invalido'; end if;
  perform public._ping(adr);
end $function$
;
CREATE OR REPLACE FUNCTION public.student_trades(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  update trades set status = 'expirada', answered_at = now(), requester_seen = false where status = 'pendente' and expires_at < now() and sid in (requester, addressee);
  return jsonb_build_object('me', sid,
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', o.name, 'expires_at', t.expires_at,
          'gives', public._trade_side(t.id, 'give'), 'wants', public._trade_side(t.id, 'want')) order by t.created_at)
        from trades t join students o on o.id = t.requester where t.addressee = sid and t.status = 'pendente'), '[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', o.name, 'expires_at', t.expires_at,
          'gives', public._trade_side(t.id, 'give'), 'wants', public._trade_side(t.id, 'want')) order by t.created_at)
        from trades t join students o on o.id = t.addressee where t.requester = sid and t.status = 'pendente'), '[]'::jsonb),
    'answers', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', o.name, 'status', t.status,
          'gives', public._trade_side(t.id, 'give'), 'wants', public._trade_side(t.id, 'want')) order by t.answered_at)
        from trades t join students o on o.id = t.addressee where t.requester = sid and not t.requester_seen and t.status in ('aceita','recusada','invalida','expirada')), '[]'::jsonb));
end $function$
;
CREATE OR REPLACE FUNCTION public.student_trade_history(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  return coalesce((select jsonb_agg(x order by (x->>'at') desc) from (
    select jsonb_build_object('id', t.id, 'friend', o.name, 'at', t.answered_at,
        'gave', public._trade_side(t.id, case when t.requester = sid then 'give' else 'want' end),
        'got',  public._trade_side(t.id, case when t.requester = sid then 'want' else 'give' end)) x
      from trades t join students o on o.id = case when t.requester = sid then t.addressee else t.requester end
     where t.status = 'aceita' and sid in (t.requester, t.addressee)
     order by t.answered_at desc limit 30) q), '[]'::jsonb);
end $function$
;
CREATE OR REPLACE FUNCTION public.adult_trades(p_student uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists(select 1 from guardians where student_id = p_student and user_id = auth.uid()) then raise exception 'sem_permissao'; end if;
  return coalesce((select jsonb_agg(x order by (x->>'at') desc) from (
    select jsonb_build_object('id', t.id, 'status', t.status, 'sent', t.requester = p_student, 'friend', o.name,
        'gave', public._trade_side(t.id, case when t.requester = p_student then 'give' else 'want' end),
        'got',  public._trade_side(t.id, case when t.requester = p_student then 'want' else 'give' end),
        'at', coalesce(t.answered_at, t.created_at)) x
      from trades t join students o on o.id = case when t.requester = p_student then t.addressee else t.requester end
     where p_student in (t.requester, t.addressee) and t.status in ('pendente','aceita','recusada')
     order by coalesce(t.answered_at, t.created_at) desc limit 50) q), '[]'::jsonb);
end $function$
;
CREATE OR REPLACE FUNCTION public._tier_value(p_theme text, p_slot integer)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select case coalesce((select tier from sticker_rarity where theme = p_theme and slot = p_slot), 'comum') when 'ultra' then 3 when 'rara' then 2 else 1 end $function$
;
CREATE OR REPLACE FUNCTION public._trade_side(p_trade uuid, p_side text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select coalesce(jsonb_agg(jsonb_build_object('theme', theme, 'slot', slot) order by theme, slot), '[]'::jsonb)
        from trade_items where trade_id = p_trade and side = p_side $function$
;
CREATE OR REPLACE FUNCTION public._trade_problem(p_req uuid, p_adr uuid, p_gives jsonb, p_wants jsonb, p_ignore uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare r record; vg int := 0; vw int := 0; ng int; nw int;
begin
  if not public._are_friends(p_req, p_adr) then return 'nao_sao_amigos'; end if;
  if jsonb_typeof(p_gives) is distinct from 'array' or jsonb_typeof(p_wants) is distinct from 'array' then return 'troca_vazia'; end if;
  ng := jsonb_array_length(p_gives); nw := jsonb_array_length(p_wants);
  if ng < 1 or nw < 1 then return 'troca_vazia'; end if;
  if ng > 6 or nw > 6 then return 'itens_demais'; end if;
  if (select count(distinct (x->>'theme') || '|' || (x->>'slot')) from jsonb_array_elements(p_gives) x) <> ng
     or (select count(distinct (x->>'theme') || '|' || (x->>'slot')) from jsonb_array_elements(p_wants) x) <> nw then return 'item_repetido'; end if;
  -- o que quem pediu oferece: repetida dele, álbum dos dois, e o amigo ainda não tem
  for r in select x->>'theme' th, (x->>'slot')::int sl from jsonb_array_elements(p_gives) x loop
    if not public._has_album(p_req, r.th) or not public._has_album(p_adr, r.th) then return 'album_invalido'; end if;
    if public._copies(p_req, r.th, r.sl) - 1 <= public._reserved(p_req, r.th, r.sl, p_ignore) then return 'sem_repetida'; end if;
    if public._copies(p_adr, r.th, r.sl) > 0 then return 'amigo_ja_tem'; end if;
    vg := vg + public._tier_value(r.th, r.sl);
  end loop;
  -- o que ele pede: repetida do amigo, álbum dos dois, e ele ainda não tem
  for r in select x->>'theme' th, (x->>'slot')::int sl from jsonb_array_elements(p_wants) x loop
    if not public._has_album(p_req, r.th) or not public._has_album(p_adr, r.th) then return 'album_invalido'; end if;
    if public._copies(p_adr, r.th, r.sl) - 1 <= public._reserved(p_adr, r.th, r.sl, p_ignore) then return 'amigo_sem_repetida'; end if;
    if public._copies(p_req, r.th, r.sl) > 0 then return 'voce_ja_tem'; end if;
    vw := vw + public._tier_value(r.th, r.sl);
  end loop;
  if vg <> vw then return 'valores_diferentes'; end if;
  return null;
end $function$
;
CREATE OR REPLACE FUNCTION public.student_trade_propose(p_token text, p_friendship uuid, p_gives jsonb, p_wants jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare sid uuid; oid uuid; prob text; tid uuid; nm text;
begin
  sid := public._student_from_token(p_token);
  select case when requester = sid then addressee else requester end into oid
    from friendships where id = p_friendship and status = 'aceita' and sid in (requester, addressee);
  if oid is null then raise exception 'amizade_invalida'; end if;
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
end $function$
;
CREATE OR REPLACE FUNCTION public.level_stamps(p_idx integer)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select coalesce((select stamps_needed from levels where idx = p_idx), app_setting('stamps_needed', 5)::int) $function$
;
CREATE OR REPLACE FUNCTION public._at_teto(s students, p_day date)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare ano_now int; max_ano int; next_ano int;
begin
  ano_now := public.ano_do_aluno(s.ano_escolar, s.ano_ref, p_day);
  if ano_now is null then return false; end if;
  max_ano := ano_now + coalesce(s.teto_anos, app_setting('teto_anos_padrao', 1)::int);
  select ano into next_ano from levels where idx = s.level_idx + 1;
  return next_ano is not null and next_ano > max_ano;
end $function$
;
CREATE OR REPLACE FUNCTION public.students_free_days_fix()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.free_days := coalesce((select array_agg(d order by d) from (select distinct d from unnest(new.free_days) d
                              where d between 0 and 6 and d <> all(new.study_days)) x), '{}'::int[]);
  return new;
end $function$
;
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
  if done_today >= s.sheets_per_day then raise exception 'meta_cumprida'; end if;

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
end $function$
;
CREATE OR REPLACE FUNCTION public.student_turbo_get(p_token text, p_day date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; ta turbo_students%rowtype; dr turbo_days%rowtype; ok_day boolean; ano int;
begin
  sid := public._student_from_token(p_token);
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
end $function$
;
CREATE OR REPLACE FUNCTION public.student_turbo_save(p_token text, p_day date, p_session jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; res jsonb; dev text; ok_day boolean; got int := 0; v_status text; prev_status text; n_call int; n_att int; given boolean;
begin
  sid := public._student_from_token(p_token);
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
end $function$
;
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
end $function$
;
CREATE OR REPLACE FUNCTION public._check_albums(p_sid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare full_ text[] := public._full_albums(p_sid);
begin
  update students set
    desk_themes = array(select x from unnest(desk_themes) x where x <> all(full_)),
    albums_done_at = case when sticker_themes <@ full_ then coalesce(albums_done_at, now()) else null end
   where id = p_sid;
end $function$
;
CREATE OR REPLACE FUNCTION public._full_albums(p_sid uuid)
 RETURNS text[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select coalesce(array_agg(theme), '{}'::text[]) from (
        select theme from awards where student_id = p_sid and kind = 'figurinha' group by theme having count(distinct slot) >= 52) x $function$
;
CREATE OR REPLACE FUNCTION public.student_set_desk(p_token text, p_desk text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare sid uuid; s students%rowtype; lim int := coalesce(app_setting('limite_mesa', 2)::int, 2); full_ text[]; d text[]; t text;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid for update;
  if s.welcome_at is null then raise exception 'album_invalido'; end if;
  full_ := public._full_albums(sid); d := '{}';
  foreach t in array coalesce(p_desk, '{}'::text[]) loop
    if t <> all(s.sticker_themes) or t = any(full_) then raise exception 'album_invalido'; end if;
    if t <> all(d) then d := d || t; end if;
  end loop;
  if cardinality(d) > lim then raise exception 'mesa_cheia'; end if;
  if cardinality(d) = 0 and exists(select 1 from unnest(s.sticker_themes) x where x <> all(full_)) then raise exception 'mesa_vazia'; end if;
  update students set desk_themes = d where id = sid;
  return jsonb_build_object('desk', to_jsonb(d), 'limit', lim);
end $function$
;
CREATE OR REPLACE FUNCTION public.student_welcome(p_token text, p_desk text[] DEFAULT NULL::text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; i int; sl int; want text; real_t text; r numeric; got int[]; picks jsonb := '[]'::jsonb;
  p_ultra numeric := app_setting('prob_ultra', 5)::numeric; p_rara numeric := app_setting('prob_rara', 25)::numeric;
  today date := current_date; lim int := coalesce(app_setting('limite_mesa', 2)::int, 2); dsk text[]; tt text; per int; seqn int := 0;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid for update;
  if s.welcome_at is not null then raise exception 'ja_recebeu'; end if;
  -- a mesa: com no máximo "limite" álbuns liberados, todos vão para a mesa; com mais, a criança escolheu (p_desk)
  if cardinality(s.sticker_themes) <= lim then dsk := s.sticker_themes;
  else
    dsk := '{}';
    foreach tt in array coalesce(p_desk, '{}'::text[]) loop
      if tt <> all(s.sticker_themes) then raise exception 'album_invalido'; end if;
      if tt <> all(dsk) then dsk := dsk || tt; end if;
    end loop;
    if cardinality(dsk) < 1 then raise exception 'mesa_vazia'; end if;
    if cardinality(dsk) > lim then raise exception 'mesa_cheia'; end if;
  end if;
  -- 5 figurinhas de cada álbum da mesa (com um álbum só na mesa, 10 dele)
  per := case when cardinality(dsk) = 1 then 10 else 5 end;
  foreach tt in array dsk loop
    got := '{}';
    for i in 1..per loop
      if i = 1 then want := 'rara';      -- pelo menos 1 rara garantida por álbum
      else
        r := random() * 100;
        want := case when r < p_ultra then 'ultra' when r < p_ultra + p_rara then 'rara' else 'comum' end;
      end if;
      real_t := want; sl := null;
      select g into sl from generate_series(0,51) x(g)
       where coalesce((select sr.tier from sticker_rarity sr where sr.theme = tt and sr.slot = x.g), 'comum') = want
         and x.g <> all(got)
         and not exists (select 1 from awards a where a.student_id = sid and a.kind = 'figurinha' and a.theme = tt and a.slot = x.g)
       order by random() limit 1;
      if sl is null then   -- sem figurinha livre dessa raridade: cai para comum e, por fim, para qualquer uma que falte
        real_t := 'comum';
        select g into sl from generate_series(0,51) x(g)
         where coalesce((select sr.tier from sticker_rarity sr where sr.theme = tt and sr.slot = x.g), 'comum') = 'comum'
           and x.g <> all(got)
           and not exists (select 1 from awards a where a.student_id = sid and a.kind = 'figurinha' and a.theme = tt and a.slot = x.g)
         order by random() limit 1;
      end if;
      if sl is null then
        select g into sl from generate_series(0,51) x(g)
         where x.g <> all(got)
           and not exists (select 1 from awards a where a.student_id = sid and a.kind = 'figurinha' and a.theme = tt and a.slot = x.g)
         order by random() limit 1;
        real_t := coalesce((select sr.tier from sticker_rarity sr where sr.theme = tt and sr.slot = sl), 'comum');
      end if;
      exit when sl is null;   -- álbum já tem quase tudo: entrega só as que faltam
      got := got || sl; seqn := seqn + 1;
      insert into awards(student_id, kind, theme, slot, period_mode, period_start, period_end, earned_day, source, seq)
        values (sid, 'figurinha', tt, sl, 'diario', today, today, today, 'boas_vindas', seqn);
      picks := picks || jsonb_build_object('theme', tt, 'slot', sl, 'tier', real_t);
    end loop;
  end loop;
  update students set welcome_at = now(), desk_themes = dsk where id = sid;
  perform public._check_albums(sid);
  -- ordem de abertura embaralhada: a rara não vem sempre primeiro
  return jsonb_build_object('desk', (select to_jsonb(desk_themes) from students where id = sid),
    'stickers', (select coalesce(jsonb_agg(e order by random()), '[]'::jsonb) from jsonb_array_elements(picks) e));
end $function$
;
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
end $function$
;
CREATE OR REPLACE FUNCTION public.students_consent()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if tg_op = 'INSERT' then
    if new.consent_at is not null then new.consent_at := now(); new.consent_by := coalesce(new.consent_by, auth.uid()); end if;
    return new;
  end if;
  if new.consent_at is distinct from old.consent_at then
    if new.consent_at is null then new.consent_by := null;
    else new.consent_at := now(); new.consent_by := auth.uid(); end if;
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.level_videos_touch()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ begin new.updated_at := now(); return new; end $function$
;
CREATE OR REPLACE FUNCTION public.student_level_videos(p_token text, p_level_code text, p_tipo text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  return coalesce((select jsonb_agg(jsonb_build_object('id', v.id, 'tipo', v.tipo, 'topico', v.topico, 'titulo', v.titulo, 'fonte', v.fonte,
                                                       'url', v.url, 'poster', v.poster, 'duracao_s', v.duracao_s, 'legenda', v.legenda) order by v.ordem, v.created_at)
                     from level_videos v where v.ativo and v.publico = 'aluno' and v.level_code = p_level_code and (p_tipo is null or v.tipo = p_tipo)), '[]'::jsonb);
end $function$
;
CREATE OR REPLACE FUNCTION public.sheets_to_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare st students%rowtype; i int; n int; pr jsonb; an jsonb; lc text;
begin
  if new.status <> 'done' then return new; end if;
  select * into st from students where id = new.student_id;
  if st.consent_at is null then return new; end if;
  select code into lc from levels where idx = new.level_idx;
  if old.status is distinct from 'done' then
    insert into sheet_log(sheet_id, anon_id, student_id, level_idx, level_code, study_day, started_at, finished_at, secs, first_ok, total, corrections, points, stamp, advanced, tier, gained, modo)
      values (new.id, st.anon_id, st.id, new.level_idx, lc, new.study_day, new.started_at, new.finished_at, new.secs, new.first_ok, new.total, new.corrections, new.points, new.stamp, new.advanced, new.tier, new.gained,
              case when (new.answers->0)->>'modo' in ('uma','lista') then (new.answers->0)->>'modo' end)
      on conflict (sheet_id) do nothing;
    n := coalesce(jsonb_array_length(new.problems), 0);
    for i in 0..n-1 loop
      pr := new.problems->i; an := coalesce(new.answers->i, '{}'::jsonb);
      insert into sheet_items(sheet_id, pos, anon_id, student_id, level_idx, level_code, pre, post, correta, primeira, acertou_primeira, tentativas, ms, respostas, extra, ms_inicio, modo)
        values (new.id, i, st.anon_id, st.id, new.level_idx, lc, pr->>'pre', coalesce(pr->>'post',''),
                case when pr->>'a' ~ '^-?[0-9]{1,9}$' then (pr->>'a')::int end,
                an->>'v',
                case when an->>'ok' in ('true','false') then (an->>'ok')::boolean end,
                case when an->>'tries' ~ '^[0-9]{1,4}$' then (an->>'tries')::int end,
                case when an->>'ms' ~ '^[0-9]{1,9}$' then (an->>'ms')::int end,
                case when jsonb_typeof(an->'vals') = 'array' and length((an->'vals')::text) <= 300 then an->'vals' end,
                case when jsonb_typeof(pr->'extra') = 'object' then pr->'extra' end,
                case when an->>'ti' ~ '^[0-9]{1,9}$' then (an->>'ti')::int end,
                case when an->>'modo' in ('uma','lista') then an->>'modo' end)
        on conflict (sheet_id, pos) do nothing;
    end loop;
  elsif new.stamp is distinct from old.stamp or new.advanced is distinct from old.advanced or new.tier is distinct from old.tier or new.gained is distinct from old.gained then
    update sheet_log set stamp = new.stamp, advanced = new.advanced, tier = new.tier, gained = new.gained where sheet_id = new.id;
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.student_log_events(p_token text, p_events jsonb, p_app text DEFAULT NULL::text, p_screen integer DEFAULT NULL::integer, p_device text DEFAULT NULL::text, p_session text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; st students%rowtype; e jsonb; saved int := 0; k int := 0; kd text; lv int; lc text; sh uuid; dt jsonb; ca timestamptz; ms numeric;
begin
  sid := public._student_from_token(p_token);
  select * into st from students where id = sid;
  if st.consent_at is null then return jsonb_build_object('saved', 0); end if;
  if p_events is null or jsonb_typeof(p_events) <> 'array' then raise exception 'dados_invalidos'; end if;
  for e in select * from jsonb_array_elements(p_events) loop
    k := k + 1; exit when k > 50;
    kd := e->>'kind';
    continue when kd is null or kd !~ '^[a-z_]{3,30}$';
    lv := case when e->>'level_idx' ~ '^[0-9]{1,4}$' then (e->>'level_idx')::int end;
    select code into lc from levels where idx = lv;
    sh := null;
    if e->>'sheet_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      select id into sh from sheets where id = (e->>'sheet_id')::uuid and student_id = sid;
    end if;
    dt := case when jsonb_typeof(e->'data') = 'object' and length((e->'data')::text) <= 2000 then e->'data' else '{}'::jsonb end;
    ca := null;
    if e->>'at' ~ '^[0-9]{10,14}$' then
      ms := (e->>'at')::numeric;
      if abs(ms - extract(epoch from now()) * 1000) < 172800000 then ca := to_timestamp(ms / 1000.0); end if;
    end if;
    insert into usage_events(anon_id, student_id, client_at, kind, level_idx, level_code, sheet_id, data, app_version, device, screen_w, session_key)
      values (st.anon_id, sid, ca, kd, lv, lc, sh, dt, left(p_app, 30),
              case when p_device in ('celular','tablet','computador') then p_device end,
              case when p_screen between 200 and 10000 then p_screen end, left(p_session, 40));
    saved := saved + 1;
  end loop;
  return jsonb_build_object('saved', saved);
end $function$
;
CREATE OR REPLACE FUNCTION public.create_student(p_name text, p_level integer, p_start date, p_days integer[], p_per_day integer, p_close integer, p_goal integer, p_reward text, p_repeat text DEFAULT 'reforco'::text, p_stamps integer DEFAULT 3, p_period text DEFAULT 'semanal'::text, p_monthly integer DEFAULT 4000, p_system text DEFAULT 'figurinhas'::text, p_theme text DEFAULT 'dinossauros'::text, p_themes text[] DEFAULT NULL::text[], p_ano integer DEFAULT NULL::integer, p_teto integer DEFAULT NULL::integer, p_free integer[] DEFAULT NULL::integer[], p_consent boolean DEFAULT NULL::boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare uid uuid := auth.uid(); sid uuid; code text; th text[];
begin
  if uid is null then raise exception 'nao_autenticado' using errcode='28000'; end if;
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
end $function$
;
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
    if extract(dow from p_day)::int = any(s.study_days) then quota := s.sheets_per_day;
    elsif extract(dow from p_day)::int = any(s.free_days) then quota := s.sheets_per_day; is_free := true; end if;
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
    'pending_packs', packs, 'stickers', stks, 'recent', recent,
    'normal_acertos', app_setting('normal_acertos', 80)::int, 'ouro_acertos', app_setting('ouro_acertos', 95)::int,
    'ouro_tempo', app_setting('ouro_tempo', 80)::int, 'ouro_carimbos', app_setting('ouro_carimbos', 2)::int,
    'offer_back', (s.reached_by_jump and s.level_idx > 0 and s.dry_days >= app_setting('dias_sem_carimbo_voltar', 2)::int));
end $function$
;
CREATE OR REPLACE FUNCTION public.turbo_touch()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ begin new.updated_at := now(); return new; end $function$
;
CREATE OR REPLACE FUNCTION public.adult_turbo_summary(p_student uuid, p_day date)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'today', (select jsonb_build_object('status', d.status, 'attempts', d.attempts, 'pack_given', d.pack_given) from turbo_days d where d.student_id = p_student and d.study_day = p_day),
    'ops', coalesce((select jsonb_object_agg(op, jsonb_build_object('registered', n, 'firm', firm, 'learning', learning))
        from (select case left(fact_id, 1) when '+' then 'soma' when '-' then 'sub' when '×' then 'mult' else 'div' end as op,
                     count(*) as n, count(*) filter (where state >= 4) as firm, count(*) filter (where state between 1 and 3) as learning
                from turbo_facts where student_id = p_student group by 1) t), '{}'::jsonb),
    'stubborn', coalesce((select jsonb_agg(fact_id) from (select fact_id from turbo_facts where student_id = p_student and stubborn order by lat_ms desc nulls last limit 3) t), '[]'::jsonb),
    'slowest', coalesce((select jsonb_agg(fact_id) from (select fact_id from turbo_facts where student_id = p_student and state >= 2 and lat_ms is not null order by lat_ms desc limit 3) t), '[]'::jsonb),
    'devices', (select devices from turbo_students where student_id = p_student),
    'last3_promoted', coalesce((select jsonb_agg(promoted order by study_day desc) from (select promoted, study_day from turbo_days
        where student_id = p_student and status in ('done','guess','started') order by study_day desc limit 3) t), '[]'::jsonb));
$function$
;
alter table public.albums alter column categoria set default 'geral'::text;
alter table public.albums alter column ordem set default 0;
alter table public.albums alter column ativo set default true;
alter table public.profiles alter column name set default ''::text;
alter table public.profiles alter column role set default 'pai'::text;
alter table public.profiles alter column created_at set default now();
alter table public.students alter column id set default gen_random_uuid();
alter table public.students alter column level_idx set default 0;
alter table public.students alter column stamps set default 0;
alter table public.students alter column start_date set default CURRENT_DATE;
alter table public.students alter column study_days set default '{1,2,3,4,5}'::integer[];
alter table public.students alter column sheets_per_day set default 3;
alter table public.students alter column week_close_dow set default 0;
alter table public.students alter column weekly_goal set default 1000;
alter table public.students alter column reward set default ''::text;
alter table public.students alter column created_at set default now();
alter table public.student_secrets alter column failed set default 0;
alter table public.student_sessions alter column created_at set default now();
alter table public.student_sessions alter column last_seen set default now();
alter table public.guardians alter column role set default 'member'::text;
alter table public.guardians alter column created_at set default now();
alter table public.invites alter column created_at set default now();
alter table public.invites alter column expires_at set default (now() + '7 days'::interval);
alter table public.sheets alter column id set default gen_random_uuid();
alter table public.sheets alter column status set default 'started'::text;
alter table public.sheets alter column total set default 10;
alter table public.sheets alter column corrections set default 0;
alter table public.sheets alter column stamp set default false;
alter table public.sheets alter column advanced set default false;
alter table public.sheets alter column points set default 0;
alter table public.sheets alter column started_at set default now();
alter table public.week_settings alter column reward set default ''::text;
alter table public.students alter column desk_themes set default '{}'::text[];
alter table public.weak_items alter column post set default ''::text;
alter table public.weak_items alter column misses set default 1;
alter table public.weak_items alter column streak_ok set default 0;
alter table public.weak_items alter column last_miss set default now();
alter table public.students alter column reward_period set default 'semanal'::text;
alter table public.students alter column monthly_goal set default 4000;
alter table public.month_settings alter column reward set default ''::text;
alter table public.awards alter column id set default gen_random_uuid();
alter table public.awards alter column earned_at set default clock_timestamp();
alter table public.students alter column reward_system set default 'figurinhas'::text;
alter table public.students alter column sticker_themes set default ARRAY['dinossauros'::text];
alter table public.students alter column sticker_theme set default 'dinossauros'::text;
alter table public.students alter column stamps_needed set default 5;
alter table public.students alter column repeat_mode set default 'reforco'::text;
alter table public.turbo_students alter column unlocked set default ARRAY['soma'::text];
alter table public.students alter column streak set default 0;
alter table public.students alter column best_streak set default 0;
alter table public.awards alter column seq set default 1;
alter table public.students alter column friend_code set default _new_friend_code();
alter table public.friendships alter column id set default gen_random_uuid();
alter table public.friendships alter column status set default 'pendente'::text;
alter table public.friendships alter column created_at set default now();
alter table public.app_settings alter column updated_at set default now();
alter table public.students alter column reached_by_jump set default false;
alter table public.students alter column dry_days set default 0;
alter table public.sheets alter column gained set default 0;
alter table public.level_moves alter column id set default gen_random_uuid();
alter table public.level_moves alter column at set default now();
alter table public.turbo_students alter column devices set default '{}'::jsonb;
alter table public.weak_items alter column sig set default ''::text;
alter table public.turbo_students alter column skip_placement set default false;
alter table public.turbo_students alter column created_at set default now();
alter table public.turbo_students alter column updated_at set default now();
alter table public.turbo_facts alter column state set default 0;
alter table public.turbo_facts alter column ok_count set default 0;
alter table public.turbo_facts alter column ok_days set default 0;
alter table public.turbo_facts alter column good_sessions set default 0;
alter table public.turbo_facts alter column review_step set default 0;
alter table public.students alter column anon_id set default gen_random_uuid();
alter table public.level_videos alter column id set default gen_random_uuid();
alter table public.trades alter column id set default gen_random_uuid();
alter table public.trades alter column status set default 'pendente'::text;
alter table public.trades alter column created_at set default now();
alter table public.trades alter column expires_at set default (now() + '7 days'::interval);
alter table public.trades alter column requester_seen set default false;
alter table public.level_videos alter column publico set default 'aluno'::text;
alter table public.level_videos alter column ordem set default 0;
alter table public.level_videos alter column ativo set default false;
alter table public.level_videos alter column created_at set default now();
alter table public.students alter column free_days set default '{0,6}'::integer[];
alter table public.level_videos alter column updated_at set default now();
alter table public.sheet_log alter column created_at set default now();
alter table public.usage_events alter column at set default now();
alter table public.usage_events alter column data set default '{}'::jsonb;
alter table public.turbo_facts alter column recent set default '[]'::jsonb;
alter table public.turbo_facts alter column stubborn set default false;
alter table public.turbo_facts alter column reached_consolidating set default false;
alter table public.turbo_facts alter column updated_at set default now();
alter table public.turbo_days alter column status set default 'started'::text;
alter table public.turbo_days alter column attempts set default 0;
alter table public.turbo_days alter column secs set default 0;
alter table public.turbo_days alter column promoted set default 0;
alter table public.turbo_days alter column demoted set default 0;
alter table public.turbo_days alter column pack_given set default false;
alter table public.turbo_days alter column started_at set default now();
alter table public.turbo_attempts alter column at set default now();
alter table public.turbo_attempts alter column counted set default false;
alter table public.app_settings add constraint app_settings_pkey PRIMARY KEY (key);
alter table public.sheets add constraint sheets_pkey PRIMARY KEY (id);
alter table public.sheets add constraint sheets_status_check CHECK ((status = ANY (ARRAY['started'::text, 'done'::text])));
alter table public.sheets add constraint sheets_tier_check CHECK ((tier = ANY (ARRAY['normal'::text, 'ouro'::text, 'salto'::text])));
alter table public.level_moves add constraint level_moves_kind_check CHECK ((kind = ANY (ARRAY['carimbos'::text, 'salto'::text, 'voltou'::text])));
alter table public.level_moves add constraint level_moves_pkey PRIMARY KEY (id);
alter table public.turbo_students add constraint turbo_students_age_check CHECK (((age >= 5) AND (age <= 12)));
alter table public.turbo_students add constraint turbo_students_devices_check CHECK ((jsonb_typeof(devices) = 'object'::text));
alter table public.turbo_students add constraint turbo_students_pkey PRIMARY KEY (student_id);
alter table public.turbo_students add constraint turbo_students_unlocked_check CHECK (((cardinality(unlocked) >= 1) AND (unlocked <@ ARRAY['soma'::text, 'sub'::text, 'mult'::text, 'div'::text])));
alter table public.turbo_facts add constraint turbo_facts_fact_id_check CHECK ((fact_id ~ '^(\+|-|×|÷):[0-9]{1,2}:[0-9]{1,2}$'::text));
alter table public.turbo_facts add constraint turbo_facts_good_sessions_check CHECK ((good_sessions >= 0));
alter table public.turbo_facts add constraint turbo_facts_lat_ms_check CHECK (((lat_ms IS NULL) OR ((lat_ms >= 0) AND (lat_ms <= 600000))));
alter table public.turbo_facts add constraint turbo_facts_ok_count_check CHECK ((ok_count >= 0));
alter table public.turbo_facts add constraint turbo_facts_ok_days_check CHECK ((ok_days >= 0));
alter table public.turbo_facts add constraint turbo_facts_pkey PRIMARY KEY (student_id, fact_id);
alter table public.turbo_facts add constraint turbo_facts_recent_check CHECK (((jsonb_typeof(recent) = 'array'::text) AND (jsonb_array_length(recent) <= 10)));
alter table public.turbo_facts add constraint turbo_facts_review_step_check CHECK (((review_step >= 0) AND (review_step <= 5)));
alter table public.turbo_facts add constraint turbo_facts_state_check CHECK (((state >= 0) AND (state <= 5)));
alter table public.turbo_days add constraint turbo_days_attempts_check CHECK ((attempts >= 0));
alter table public.turbo_days add constraint turbo_days_demoted_check CHECK ((demoted >= 0));
alter table public.turbo_days add constraint turbo_days_device_check CHECK (((device IS NULL) OR (device ~ '^[a-z0-9_-]{1,30}$'::text)));
alter table public.turbo_days add constraint turbo_days_pkey PRIMARY KEY (student_id, study_day);
alter table public.turbo_days add constraint turbo_days_promoted_check CHECK ((promoted >= 0));
alter table public.turbo_days add constraint turbo_days_secs_check CHECK ((secs >= (0)::numeric));
alter table public.turbo_days add constraint turbo_days_status_check CHECK ((status = ANY (ARRAY['started'::text, 'done'::text, 'no_task'::text, 'guess'::text])));
alter table public.turbo_attempts add constraint turbo_attempts_device_check CHECK (((device IS NULL) OR (device ~ '^[a-z0-9_-]{1,30}$'::text)));
alter table public.turbo_attempts add constraint turbo_attempts_fact_id_check CHECK ((fact_id ~ '^(\+|-|×|÷):[0-9]{1,2}:[0-9]{1,2}$'::text));
alter table public.turbo_attempts add constraint turbo_attempts_hint_check CHECK ((hint = ANY (ARRAY['none'::text, 'before'::text, 'after'::text, 'demand'::text])));
alter table public.turbo_attempts add constraint turbo_attempts_kind_check CHECK ((kind = ANY (ARRAY['revisao'::text, 'novo'::text, 'reinsercao'::text, 'nivelamento'::text, 'aquecimento'::text])));
alter table public.turbo_attempts add constraint turbo_attempts_pkey PRIMARY KEY (id);
alter table public.turbo_attempts add constraint turbo_attempts_session_key_check CHECK (((session_key IS NULL) OR (char_length(session_key) <= 60)));
alter table public.turbo_attempts add constraint turbo_attempts_state_before_check CHECK (((state_before >= 0) AND (state_before <= 5)));
alter table public.turbo_attempts add constraint turbo_attempts_t1_ms_check CHECK (((t1_ms IS NULL) OR ((t1_ms >= 0) AND (t1_ms <= 600000))));
alter table public.turbo_attempts add constraint turbo_attempts_total_ms_check CHECK (((total_ms IS NULL) OR ((total_ms >= 0) AND (total_ms <= 600000))));
alter table public.albums add constraint albums_id_check CHECK ((id ~ '^[a-z0-9_]{2,30}$'::text));
alter table public.albums add constraint albums_pkey PRIMARY KEY (id);
alter table public.trades add constraint trades_check CHECK ((requester <> addressee));
alter table public.trades add constraint trades_give_slot_check CHECK (((give_slot >= 0) AND (give_slot <= 51)));
alter table public.trades add constraint trades_pkey PRIMARY KEY (id);
alter table public.trades add constraint trades_status_check CHECK ((status = ANY (ARRAY['pendente'::text, 'aceita'::text, 'recusada'::text, 'cancelada'::text, 'expirada'::text, 'invalida'::text])));
alter table public.trades add constraint trades_want_slot_check CHECK (((want_slot >= 0) AND (want_slot <= 51)));
alter table public.trade_items add constraint trade_items_pkey PRIMARY KEY (trade_id, side, theme, slot);
alter table public.trade_items add constraint trade_items_side_check CHECK ((side = ANY (ARRAY['give'::text, 'want'::text])));
alter table public.trade_items add constraint trade_items_slot_check CHECK (((slot >= 0) AND (slot <= 51)));
alter table public.student_secrets add constraint student_secrets_pkey PRIMARY KEY (student_id);
alter table public.student_sessions add constraint student_sessions_pkey PRIMARY KEY (token_hash);
alter table public.invites add constraint invites_pkey PRIMARY KEY (code);
alter table public.profiles add constraint profiles_pkey PRIMARY KEY (id);
alter table public.profiles add constraint profiles_role_check CHECK ((role = ANY (ARRAY['pai'::text, 'professor'::text])));
alter table public.guardians add constraint guardians_pkey PRIMARY KEY (student_id, user_id);
alter table public.guardians add constraint guardians_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'member'::text])));
alter table public.week_settings add constraint week_settings_pkey PRIMARY KEY (student_id, week_end);
alter table public.month_settings add constraint month_settings_pkey PRIMARY KEY (student_id, month_start);
alter table public.levels add constraint levels_code_key UNIQUE (code);
alter table public.levels add constraint levels_pkey PRIMARY KEY (idx);
alter table public.levels add constraint levels_stamps_needed_check CHECK (((stamps_needed >= 1) AND (stamps_needed <= 10)));
alter table public.levels add constraint levels_target_check CHECK ((target > 0));
alter table public.students add constraint students_ano_escolar_check CHECK (((ano_escolar >= 1) AND (ano_escolar <= 9)));
alter table public.students add constraint students_best_streak_check CHECK ((best_streak >= 0));
alter table public.students add constraint students_link_code_key UNIQUE (link_code);
alter table public.students add constraint students_monthly_goal_check CHECK ((monthly_goal >= 0));
alter table public.students add constraint students_name_check CHECK (((char_length(name) >= 1) AND (char_length(name) <= 40)));
alter table public.students add constraint students_pkey PRIMARY KEY (id);
alter table public.students add constraint students_repeat_mode_check CHECK ((repeat_mode = ANY (ARRAY['nova'::text, 'reforco'::text, 'mesma'::text])));
alter table public.students add constraint students_reward_check CHECK ((char_length(reward) <= 120));
alter table public.students add constraint students_reward_period_check CHECK ((reward_period = ANY (ARRAY['semanal'::text, 'mensal'::text])));
alter table public.students add constraint students_reward_system_check CHECK ((reward_system = ANY (ARRAY['bau'::text, 'estrelas'::text, 'figurinhas'::text])));
alter table public.students add constraint students_sheets_per_day_check CHECK (((sheets_per_day >= 1) AND (sheets_per_day <= 10)));
alter table public.students add constraint students_stamps_check CHECK (((stamps >= 0) AND (stamps <= 10)));
alter table public.students add constraint students_stamps_needed_check CHECK (((stamps_needed >= 1) AND (stamps_needed <= 10)));
alter table public.students add constraint students_sticker_theme_check CHECK (((char_length(sticker_theme) >= 1) AND (char_length(sticker_theme) <= 30)));
alter table public.students add constraint students_sticker_themes_check CHECK ((cardinality(sticker_themes) >= 1));
alter table public.students add constraint students_streak_check CHECK ((streak >= 0));
alter table public.students add constraint students_teto_anos_check CHECK (((teto_anos >= 0) AND (teto_anos <= 99)));
alter table public.students add constraint students_week_close_dow_check CHECK (((week_close_dow >= 0) AND (week_close_dow <= 6)));
alter table public.students add constraint students_weekly_goal_check CHECK ((weekly_goal >= 0));
alter table public.weak_items add constraint weak_items_pkey PRIMARY KEY (student_id, level_idx, pre, post, sig);
alter table public.sticker_rarity add constraint sticker_rarity_pkey PRIMARY KEY (theme, slot);
alter table public.sticker_rarity add constraint sticker_rarity_slot_check CHECK (((slot >= 0) AND (slot <= 51)));
alter table public.sticker_rarity add constraint sticker_rarity_tier_check CHECK ((tier = ANY (ARRAY['rara'::text, 'ultra'::text])));
alter table public.rarity_weights add constraint rarity_weights_pkey PRIMARY KEY (tier);
alter table public.rarity_weights add constraint rarity_weights_weight_check CHECK ((weight > (0)::numeric));
alter table public.awards add constraint awards_kind_check CHECK ((kind = ANY (ARRAY['estrela'::text, 'figurinha'::text, 'pacote'::text])));
alter table public.awards add constraint awards_pkey PRIMARY KEY (id);
alter table public.awards add constraint awards_seq_check CHECK ((seq >= 1));
alter table public.awards add constraint awards_slot_check CHECK (((slot >= 0) AND (slot <= 51)));
alter table public.awards add constraint awards_source_check CHECK ((source = ANY (ARRAY['carimbo'::text, 'perseveranca'::text, 'marco'::text, 'troca'::text, 'boas_vindas'::text, 'turbo'::text])));
alter table public.friendships add constraint friendships_check CHECK ((requester <> addressee));
alter table public.friendships add constraint friendships_pkey PRIMARY KEY (id);
alter table public.friendships add constraint friendships_status_check CHECK ((status = ANY (ARRAY['pendente'::text, 'aceita'::text])));
alter table public.level_videos add constraint level_videos_duracao_s_check CHECK (((duracao_s IS NULL) OR ((duracao_s >= 1) AND (duracao_s <= 3600))));
alter table public.level_videos add constraint level_videos_fonte_check CHECK ((fonte = ANY (ARRAY['storage'::text, 'youtube'::text, 'url'::text])));
alter table public.level_videos add constraint level_videos_pkey PRIMARY KEY (id);
alter table public.level_videos add constraint level_videos_publico_check CHECK ((publico = ANY (ARRAY['aluno'::text, 'adulto'::text])));
alter table public.level_videos add constraint level_videos_tipo_check CHECK ((tipo ~ '^[a-z_]{3,20}$'::text));
alter table public.level_videos add constraint level_videos_titulo_check CHECK (((char_length(titulo) >= 1) AND (char_length(titulo) <= 120)));
alter table public.usage_events add constraint usage_events_kind_check CHECK ((kind ~ '^[a-z_]{3,30}$'::text));
alter table public.usage_events add constraint usage_events_pkey PRIMARY KEY (id);
alter table public.sheet_items add constraint sheet_items_modo_check CHECK ((modo = ANY (ARRAY['uma'::text, 'lista'::text])));
alter table public.sheet_items add constraint sheet_items_pkey PRIMARY KEY (id);
alter table public.sheet_items add constraint sheet_items_sheet_id_pos_key UNIQUE (sheet_id, pos);
alter table public.sheet_log add constraint sheet_log_modo_check CHECK ((modo = ANY (ARRAY['uma'::text, 'lista'::text])));
alter table public.sheet_log add constraint sheet_log_pkey PRIMARY KEY (sheet_id);
alter table public.sheets add constraint sheets_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.level_moves add constraint level_moves_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.turbo_students add constraint turbo_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.turbo_facts add constraint turbo_facts_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.turbo_days add constraint turbo_days_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.turbo_attempts add constraint turbo_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL;
alter table public.trades add constraint trades_addressee_fkey FOREIGN KEY (addressee) REFERENCES students(id) ON DELETE CASCADE;
alter table public.trades add constraint trades_requester_fkey FOREIGN KEY (requester) REFERENCES students(id) ON DELETE CASCADE;
alter table public.trade_items add constraint trade_items_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE;
alter table public.student_secrets add constraint student_secrets_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.student_sessions add constraint student_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.invites add constraint invites_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.invites add constraint invites_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.invites add constraint invites_used_by_fkey FOREIGN KEY (used_by) REFERENCES auth.users(id);
alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.guardians add constraint guardians_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.guardians add constraint guardians_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.week_settings add constraint week_settings_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.month_settings add constraint month_settings_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.students add constraint students_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
alter table public.students add constraint students_level_fk FOREIGN KEY (level_idx) REFERENCES levels(idx);
alter table public.weak_items add constraint weak_items_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.awards add constraint awards_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
alter table public.awards add constraint awards_traded_from_fkey FOREIGN KEY (traded_from) REFERENCES students(id) ON DELETE SET NULL;
alter table public.friendships add constraint friendships_addressee_fkey FOREIGN KEY (addressee) REFERENCES students(id) ON DELETE CASCADE;
alter table public.friendships add constraint friendships_requester_fkey FOREIGN KEY (requester) REFERENCES students(id) ON DELETE CASCADE;
alter table public.level_videos add constraint level_videos_level_code_fkey FOREIGN KEY (level_code) REFERENCES levels(code) ON UPDATE CASCADE ON DELETE CASCADE;
alter table public.usage_events add constraint usage_events_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL;
alter table public.sheet_items add constraint sheet_items_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL;
alter table public.sheet_log add constraint sheet_log_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX students_anon_id_key ON public.students USING btree (anon_id);
CREATE INDEX sheet_items_anon ON public.sheet_items USING btree (anon_id);
CREATE INDEX turbo_attempts_anon ON public.turbo_attempts USING btree (anon_id, at);
CREATE INDEX turbo_attempts_fato ON public.turbo_attempts USING btree (fact_id);
CREATE INDEX sheets_student_day ON public.sheets USING btree (student_id, study_day);
CREATE INDEX usage_events_tipo ON public.usage_events USING btree (kind, at);
CREATE UNIQUE INDEX awards_pack_once ON public.awards USING btree (student_id, earned_day, source, seq) WHERE (kind = ANY (ARRAY['pacote'::text, 'figurinha'::text]));
CREATE INDEX sheet_items_conta ON public.sheet_items USING btree (level_code, pre, post);
CREATE INDEX trade_items_sticker ON public.trade_items USING btree (theme, slot);
CREATE INDEX turbo_facts_due ON public.turbo_facts USING btree (student_id, due) WHERE (state >= 1);
CREATE INDEX sheets_student_week ON public.sheets USING btree (student_id, week_end);
CREATE INDEX sheet_log_anon ON public.sheet_log USING btree (anon_id, finished_at);
CREATE INDEX level_moves_student_idx ON public.level_moves USING btree (student_id, at DESC);
CREATE INDEX friendships_addressee ON public.friendships USING btree (addressee);
CREATE INDEX trades_requester ON public.trades USING btree (requester);
CREATE INDEX trades_addressee ON public.trades USING btree (addressee) WHERE (status = 'pendente'::text);
CREATE INDEX usage_events_anon ON public.usage_events USING btree (anon_id, at);
CREATE INDEX sheet_log_nivel ON public.sheet_log USING btree (level_code);
CREATE INDEX level_videos_nivel ON public.level_videos USING btree (level_code, tipo, ordem) WHERE ativo;
CREATE UNIQUE INDEX awards_star_once ON public.awards USING btree (student_id, period_mode, period_end) WHERE (kind = 'estrela'::text);
CREATE UNIQUE INDEX friendships_pair ON public.friendships USING btree (LEAST(requester, addressee), GREATEST(requester, addressee));
CREATE UNIQUE INDEX students_friend_code_key ON public.students USING btree (friend_code);
CREATE TRIGGER students_sync_week AFTER UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION sync_week_settings();
CREATE TRIGGER students_sync_theme BEFORE INSERT OR UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION students_sync_theme();
CREATE TRIGGER students_consent BEFORE INSERT OR UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION students_consent();
CREATE TRIGGER students_check_limits BEFORE INSERT OR UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION students_check_limits();
CREATE TRIGGER students_fixed_rules BEFORE INSERT OR UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION students_fixed_rules();
CREATE TRIGGER level_videos_touch BEFORE UPDATE ON public.level_videos FOR EACH ROW EXECUTE FUNCTION level_videos_touch();
CREATE TRIGGER sheets_to_log AFTER UPDATE ON public.sheets FOR EACH ROW EXECUTE FUNCTION sheets_to_log();
CREATE TRIGGER students_set_ano_ref BEFORE INSERT OR UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION students_set_ano_ref();
CREATE TRIGGER turbo_students_touch BEFORE UPDATE ON public.turbo_students FOR EACH ROW EXECUTE FUNCTION turbo_touch();
CREATE TRIGGER students_free_days_fix BEFORE INSERT OR UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION students_free_days_fix();
CREATE TRIGGER turbo_facts_touch BEFORE UPDATE ON public.turbo_facts FOR EACH ROW EXECUTE FUNCTION turbo_touch();
CREATE TRIGGER students_albums_rules BEFORE INSERT OR UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION students_albums_rules();
alter table public.app_settings enable row level security;
alter table public.sheets enable row level security;
alter table public.level_moves enable row level security;
alter table public.turbo_students enable row level security;
alter table public.turbo_facts enable row level security;
alter table public.turbo_days enable row level security;
alter table public.turbo_attempts enable row level security;
alter table public.albums enable row level security;
alter table public.trades enable row level security;
alter table public.trade_items enable row level security;
alter table public.student_secrets enable row level security;
alter table public.student_sessions enable row level security;
alter table public.invites enable row level security;
alter table public.profiles enable row level security;
alter table public.guardians enable row level security;
alter table public.week_settings enable row level security;
alter table public.month_settings enable row level security;
alter table public.levels enable row level security;
alter table public.students enable row level security;
alter table public.weak_items enable row level security;
alter table public.sticker_rarity enable row level security;
alter table public.rarity_weights enable row level security;
alter table public.awards enable row level security;
alter table public.friendships enable row level security;
alter table public.level_videos enable row level security;
alter table public.usage_events enable row level security;
alter table public.sheet_items enable row level security;
alter table public.sheet_log enable row level security;
create policy profiles_read on public.profiles as PERMISSIVE for SELECT to authenticated using (((id = auth.uid()) OR shares_student(id))) ;
create policy profiles_update on public.profiles as PERMISSIVE for UPDATE to authenticated using ((id = auth.uid())) with check ((id = auth.uid()));
create policy students_read on public.students as PERMISSIVE for SELECT to authenticated using (is_guardian(id)) ;
create policy students_update on public.students as PERMISSIVE for UPDATE to authenticated using (is_guardian(id)) with check (is_guardian(id));
create policy guardians_read on public.guardians as PERMISSIVE for SELECT to authenticated using (is_guardian(student_id)) ;
create policy sheets_read on public.sheets as PERMISSIVE for SELECT to authenticated using (is_guardian(student_id)) ;
create policy week_settings_read on public.week_settings as PERMISSIVE for SELECT to authenticated using (is_guardian(student_id)) ;
create policy weak_items_read on public.weak_items as PERMISSIVE for SELECT to authenticated using (is_guardian(student_id)) ;
create policy month_settings_read on public.month_settings as PERMISSIVE for SELECT to authenticated using (is_guardian(student_id)) ;
create policy awards_read on public.awards as PERMISSIVE for SELECT to authenticated using (is_guardian(student_id)) ;
create policy level_moves_read on public.level_moves as PERMISSIVE for SELECT to authenticated using (is_guardian(student_id)) ;
create policy level_videos_admin on public.level_videos as PERMISSIVE for ALL to authenticated using (is_admin()) with check (is_admin());
create policy level_videos_adulto on public.level_videos as PERMISSIVE for SELECT to authenticated using ((ativo AND (publico = 'adulto'::text))) ;
create policy sheet_log_admin on public.sheet_log as PERMISSIVE for SELECT to authenticated using (is_admin()) ;
create policy sheet_items_admin on public.sheet_items as PERMISSIVE for SELECT to authenticated using (is_admin()) ;
create policy usage_events_admin on public.usage_events as PERMISSIVE for SELECT to authenticated using (is_admin()) ;
create policy turbo_students_adulto_sel on public.turbo_students as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM students s
  WHERE (s.id = turbo_students.student_id)))) ;
create policy turbo_students_adulto_ins on public.turbo_students as PERMISSIVE for INSERT to authenticated  with check ((EXISTS ( SELECT 1
   FROM students s
  WHERE (s.id = turbo_students.student_id))));
create policy turbo_students_adulto_upd on public.turbo_students as PERMISSIVE for UPDATE to authenticated using ((EXISTS ( SELECT 1
   FROM students s
  WHERE (s.id = turbo_students.student_id)))) with check ((EXISTS ( SELECT 1
   FROM students s
  WHERE (s.id = turbo_students.student_id))));
create policy turbo_facts_adulto_sel on public.turbo_facts as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM students s
  WHERE (s.id = turbo_facts.student_id)))) ;
create policy turbo_days_adulto_sel on public.turbo_days as PERMISSIVE for SELECT to authenticated using ((EXISTS ( SELECT 1
   FROM students s
  WHERE (s.id = turbo_days.student_id)))) ;
create policy turbo_students_admin on public.turbo_students as PERMISSIVE for SELECT to authenticated using (is_admin()) ;
create policy turbo_facts_admin on public.turbo_facts as PERMISSIVE for SELECT to authenticated using (is_admin()) ;
create policy turbo_days_admin on public.turbo_days as PERMISSIVE for SELECT to authenticated using (is_admin()) ;
create policy turbo_attempts_admin on public.turbo_attempts as PERMISSIVE for SELECT to authenticated using (is_admin()) ;
create view public.v_turbo_uso as  SELECT fact_id,
    device,
    count(*) AS tentativas,
    round(avg((ok)::integer), 3) AS acerto,
    percentile_cont((0.5)::double precision) WITHIN GROUP (ORDER BY ((t1_ms)::double precision)) FILTER (WHERE (ok AND (NOT counted))) AS mediana_t1_ms
   FROM turbo_attempts
  GROUP BY fact_id, device;
create view public.v_uso_nivel as  SELECT level_code,
    count(*) AS folhas,
    count(DISTINCT anon_id) AS alunos,
    round(((100.0 * (sum(first_ok))::numeric) / (NULLIF(sum(total), 0))::numeric), 1) AS acerto_primeira_pct,
    round(avg(secs), 1) AS segundos_medio_folha,
    round(avg(corrections), 2) AS correcoes_medias
   FROM sheet_log l
  GROUP BY level_code;
create view public.v_uso_conta as  SELECT level_code,
    pre,
    post,
    correta,
    count(*) AS vezes,
    count(*) FILTER (WHERE acertou_primeira) AS acertos_primeira,
    round(((100.0 * (count(*) FILTER (WHERE acertou_primeira))::numeric) / (count(*))::numeric), 1) AS acerto_primeira_pct,
    round((avg(ms) / 1000.0), 1) AS segundos_medio,
    round(avg(tentativas), 2) AS tentativas_medias
   FROM sheet_items i
  GROUP BY level_code, pre, post, correta;
create view public.v_uso_video as  SELECT (data ->> 'video_id'::text) AS video_id,
    kind,
    count(*) AS eventos,
    count(DISTINCT anon_id) AS alunos
   FROM usage_events e
  WHERE (kind ~~ 'video%'::text)
  GROUP BY (data ->> 'video_id'::text), kind;
create view public.v_uso_modo as  WITH f AS (
         SELECT sheet_log.level_code,
            COALESCE(sheet_log.modo, 'lista'::text) AS modo,
            count(*) AS folhas,
            count(DISTINCT sheet_log.anon_id) AS alunos,
            round(((100.0 * (sum(sheet_log.first_ok))::numeric) / (NULLIF(sum(sheet_log.total), 0))::numeric), 1) AS acerto,
            round(avg(sheet_log.secs), 1) AS seg_folha
           FROM sheet_log
          GROUP BY sheet_log.level_code, COALESCE(sheet_log.modo, 'lista'::text)
        ), c AS (
         SELECT sheet_items.level_code,
            COALESCE(sheet_items.modo, 'lista'::text) AS modo,
            round((avg(sheet_items.ms) / 1000.0), 1) AS seg_conta
           FROM sheet_items
          GROUP BY sheet_items.level_code, COALESCE(sheet_items.modo, 'lista'::text)
        )
 SELECT f.level_code,
    f.modo,
    f.folhas,
    f.alunos,
    f.acerto AS acerto_primeira_pct,
    f.seg_folha AS segundos_medio_folha,
    c.seg_conta AS segundos_medio_conta
   FROM (f
     LEFT JOIN c USING (level_code, modo));
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
