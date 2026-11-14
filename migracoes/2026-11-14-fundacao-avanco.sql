-- Fundação da reformulação (etapa 2 do plano em bncc/PLANO.md):
--  * parâmetros do avanço, editáveis no /adm (tabela app_settings, sem acesso direto pelo navegador);
--  * ano escolar e teto de avanço por aluno; o ano atual é CALCULADO (nada é gravado na virada do ano);
--  * ano de cada nível (provisório: vale para os 45 níveis atuais até a grade nova);
--  * regras do dia: normal, ouro (2 carimbos) e salto (sobe direto), com teto e limite de saltos por semana;
--  * oferta de voltar de nível quando o aluno vai mal depois de um salto (nunca automática);
--  * histórico de movimentos de nível (level_moves) para o painel dos pais.
-- Compatível com o site atual: só acrescenta campos e mantém as assinaturas das funções do aluno.
-- Aplicar no Supabase (SQL Editor) ANTES de publicar o site com a fundação.
begin;

-- 1. Parâmetros -------------------------------------------------------------------------------------------------
create table public.app_settings(
  key text primary key,
  value numeric not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
alter table public.app_settings enable row level security;
revoke all on table public.app_settings from anon, authenticated;

insert into public.app_settings(key, value) values
  ('stamps_needed', 5),            -- carimbos para subir de nível
  ('normal_acertos', 80),          -- dia normal: % de acertos de primeira
  ('ouro_acertos', 95),            -- dia ouro: % de acertos de primeira
  ('ouro_tempo', 80),              -- dia ouro: tempo médio, em % da meta do nível
  ('ouro_carimbos', 2),            -- carimbos de um dia ouro
  ('salto_acertos', 98),           -- dia de salto: % de acertos de primeira
  ('salto_tempo', 60),             -- dia de salto: tempo médio, em % da meta do nível
  ('salto_por_semana', 2),         -- máximo de saltos por semana
  ('dias_sem_carimbo_voltar', 2),  -- dias de estudo sem carimbo, após um salto, para oferecer voltar
  ('bloqueio_salto_dias', 7),      -- dias sem poder saltar depois de voltar
  ('teto_anos_padrao', 1),         -- anos à frente do ano escolar que o aluno pode alcançar
  ('virada_mes', 1),               -- virada do ano escolar: mês
  ('virada_dia', 1);               -- virada do ano escolar: dia

create or replace function public.app_setting(p_key text, p_default numeric default null) returns numeric
 language sql stable security definer set search_path to 'public'
as $$ select coalesce((select value from app_settings where key = p_key), p_default) $$;

-- Ano letivo de uma data: o ano civil, menos 1 se a data ainda não chegou à virada.
create or replace function public.ano_letivo(p_day date) returns int
 language sql stable security definer set search_path to 'public'
as $$
  select extract(year from p_day)::int
       - case when (extract(month from p_day)::int, extract(day from p_day)::int)
                 < (app_setting('virada_mes', 1)::int, app_setting('virada_dia', 1)::int) then 1 else 0 end
$$;

-- Ano escolar do aluno numa data: calculado, nunca gravado. null = ano não informado (sem teto).
create or replace function public.ano_do_aluno(p_ano int, p_ref int, p_day date) returns int
 language sql stable security definer set search_path to 'public'
as $$
  select case when p_ano is null or p_ref is null then null
              else least(9, greatest(1, p_ano + ano_letivo(p_day) - p_ref)) end
$$;

-- 2. Alunos e níveis ----------------------------------------------------------------------------------------------
alter table public.students
  add column ano_escolar int check (ano_escolar between 1 and 9),
  add column ano_ref int,                          -- ano letivo em que o ano escolar foi informado
  add column teto_anos int check (teto_anos between 0 and 99),   -- null = padrão; 99 = sem limite
  add column reached_by_jump boolean not null default false,     -- o nível atual foi alcançado por salto
  add column dry_days int not null default 0,                    -- dias fechados sem carimbo no nível alcançado por salto
  add column sem_salto_ate date;                                 -- sem salto até esta data (depois de voltar)

create or replace function public.students_set_ano_ref() returns trigger
 language plpgsql set search_path to 'public'
as $$
begin
  if tg_op = 'INSERT' then
    if new.ano_escolar is not null and new.ano_ref is null then new.ano_ref := ano_letivo(current_date); end if;
  elsif new.ano_escolar is distinct from old.ano_escolar then
    new.ano_ref := case when new.ano_escolar is null then null else ano_letivo(current_date) end;
  end if;
  return new;
end $$;
create trigger students_set_ano_ref before insert or update on public.students
  for each row execute function public.students_set_ano_ref();

-- Os carimbos por nível passam a vir do parâmetro (antes: 5 fixo).
create or replace function public.students_fixed_rules() returns trigger
 language plpgsql set search_path to 'public'
as $$
declare need int := app_setting('stamps_needed', 5)::int;
begin
  new.stamps_needed := need; new.repeat_mode := 'reforco';
  if new.stamps > need then new.stamps := need; end if;
  return new;
end $$;

-- Ano de cada nível. PROVISÓRIO: mapeia os 45 níveis atuais até a grade nova da BNCC.
alter table public.levels add column ano int;
update public.levels set ano = case when idx <= 10 then 1 when idx <= 23 then 2 when idx <= 40 then 3 else 4 end;
alter table public.levels alter column ano set not null;

alter table public.sheets
  add column tier text check (tier in ('normal','ouro','salto')),
  add column gained int not null default 0;

-- Histórico de movimentos de nível (só as funções gravam; os responsáveis leem).
create table public.level_moves(
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  at timestamptz not null default now(),
  day date not null,
  from_idx int not null,
  to_idx int not null,
  kind text not null check (kind in ('carimbos','salto','voltou'))
);
create index level_moves_student_idx on public.level_moves(student_id, at desc);
alter table public.level_moves enable row level security;
create policy level_moves_read on public.level_moves for select to authenticated using (is_guardian(student_id));
revoke all on table public.level_moves from anon, authenticated;
grant select on table public.level_moves to authenticated;

-- 3. student_me: carimbos do parâmetro e oferta de voltar ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.student_me(p_token text, p_day date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; quota int := 0; done_today int; t_ok int; t_total int; packs int; stks jsonb; recent jsonb; stk int;
  need int := app_setting('stamps_needed', 5)::int;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid;
  if extract(dow from p_day)::int = any(s.study_days) and p_day >= s.start_date then quota := s.sheets_per_day; end if;
  select count(*), coalesce(sum(first_ok),0), coalesce(sum(total),0) into done_today, t_ok, t_total
    from sheets where student_id=sid and status='done' and study_day=p_day;
  select count(*) into packs from awards where student_id=sid and kind='pacote';
  select coalesce(jsonb_agg(jsonb_build_object('theme',theme,'slot',slot,'end',period_end) order by earned_at),'[]'::jsonb) into stks
    from awards where student_id=sid and kind='figurinha' and theme = any(s.sticker_themes);
  select coalesce(jsonb_agg(x), '[]'::jsonb) into recent from (
    select jsonb_build_object('day',study_day,'level',level_idx,'ok',first_ok,'total',total,
                              'secs',secs,'stamp',stamp,'advanced',advanced) x
    from sheets where student_id=sid and status='done' order by finished_at desc limit 6) t;
  stk := public._streak_view(sid, p_day);
  return jsonb_build_object(
    'name', s.name, 'level_idx', s.level_idx, 'stamps', s.stamps, 'stamps_needed', need,
    'start_date', s.start_date, 'study_days', to_jsonb(s.study_days), 'sheets_per_day', s.sheets_per_day,
    'quota', quota, 'done_today', done_today, 'today_ok', t_ok, 'today_total', t_total,
    'today_stamp', exists(select 1 from sheets where student_id=sid and study_day=p_day and stamp),
    'streak', stk, 'best_streak', s.best_streak, 'next_marco', public._next_marco(stk),
    'reward_system', 'figurinhas', 'sticker_theme', s.sticker_themes[1], 'sticker_themes', to_jsonb(s.sticker_themes),
    'pending_packs', packs, 'stickers', stks, 'recent', recent,
    'normal_acertos', app_setting('normal_acertos', 80)::int, 'ouro_acertos', app_setting('ouro_acertos', 95)::int,
    'ouro_tempo', app_setting('ouro_tempo', 80)::int, 'ouro_carimbos', app_setting('ouro_carimbos', 2)::int,
    'offer_back', (s.reached_by_jump and s.level_idx > 0 and s.dry_days >= app_setting('dias_sem_carimbo_voltar', 2)::int));
end $function$;

-- 4. Fechamento do dia: normal, ouro e salto, com teto --------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.student_submit_sheet(p_token text, p_sheet uuid, p_first_ok integer, p_secs numeric, p_answers jsonb, p_corrections integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; sh sheets%rowtype; s students%rowtype; tgt int; st boolean := false; pts int;
  adv boolean := false; new_level int; new_stamps int; last_level int;
  n int; ok_count int := 0; i int; good boolean; pr jsonb; an jsonb; pre_t text; post_t text;
  done_n int; day_ok int; day_total int; day_secs numeric; day_closed boolean := false; day_pct numeric := 0; avg_secs numeric := 0; why text := null;
  prev_d date; new_streak int := 0; marco_n int := 0; pk_c int := 0; pk_p int := 0; pk_m int := 0; stk int; stk_best int;
  need int := app_setting('stamps_needed', 5)::int;
  v_tier text := null; v_gained int := 0; at_teto boolean := false; blocked boolean := false; first_day boolean;
  ano_now int; max_ano int; next_ano int; jumps_week int; new_rbj boolean; new_dry int;
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
    good := coalesce(an->>'v','') ~ '^[0-9]{1,4}$' and (an->>'v')::int = (pr->>'a')::int;
    if good then
      ok_count := ok_count + 1;
      update weak_items set streak_ok = streak_ok + 1
        where student_id=sid and level_idx=sh.level_idx and pre=pre_t and post=post_t;
    else
      insert into weak_items(student_id, level_idx, pre, post, ans)
        values (sid, sh.level_idx, pre_t, post_t, (pr->>'a')::int)
        on conflict (student_id, level_idx, pre, post)
        do update set misses = weak_items.misses + 1, streak_ok = 0, last_miss = now();
    end if;
  end loop;
  delete from weak_items where student_id = sid and streak_ok >= 2;
  select * into s from students where id = sid for update;
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
      if s.reached_by_jump then new_dry := s.dry_days + 1; end if;
    end if;
    update students set level_idx = new_level, stamps = new_stamps, reached_by_jump = new_rbj, dry_days = new_dry where id = sid;
    if adv then
      insert into level_moves(student_id, day, from_idx, to_idx, kind)
        values (sid, sh.study_day, s.level_idx, new_level, case when v_tier = 'salto' then 'salto' else 'carimbos' end);
      -- as contas ainda erradas acompanham o aluno no nível novo
      update weak_items w set level_idx = new_level
       where w.student_id = sid and w.level_idx <> new_level
         and not exists(select 1 from weak_items x where x.student_id=sid and x.level_idx=new_level and x.pre=w.pre and x.post=w.post);
      delete from weak_items where student_id = sid and level_idx <> new_level;
    end if;
    if st then update sheets set stamp = true, advanced = adv, tier = v_tier, gained = v_gained where id = p_sheet; end if;

    -- perseverança: cota do dia fechada (com ou sem carimbo). Uma vez por dia de estudo.
    if s.last_streak_day is distinct from sh.study_day then
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
    'day_closed', day_closed, 'day_done', done_n, 'day_quota', s.sheets_per_day, 'day_ok', day_ok, 'day_total', day_total,
    'day_pct', day_pct, 'day_avg_secs', avg_secs, 'why', why,
    'packs', jsonb_build_object('carimbo', pk_c, 'perseveranca', pk_p, 'marco', pk_m),
    'marco_streak', case when pk_m > 0 then new_streak else null end,
    'streak', stk, 'best_streak', stk_best, 'next_marco', public._next_marco(stk),
    'pending_packs', (select count(*) from awards where student_id = sid and kind = 'pacote'));
end $function$;

-- 5. Oferta de voltar: o aluno aceita (volta um nível) ou recusa (a pergunta volta depois de mais dias sem carimbo) ----
create or replace function public.student_go_back(p_token text, p_accept boolean) returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $$
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
end $$;
revoke all on function public.student_go_back(text, boolean) from public;
grant execute on function public.student_go_back(text, boolean) to anon, authenticated;

-- 6. Cadastro do aluno com ano escolar e teto (substitui a função de 15 parâmetros) -----------------------------------
drop function public.create_student(text, integer, date, integer[], integer, integer, integer, text, text, integer, text, integer, text, text, text[]);
CREATE OR REPLACE FUNCTION public.create_student(p_name text, p_level integer, p_start date, p_days integer[], p_per_day integer, p_close integer, p_goal integer, p_reward text, p_repeat text DEFAULT 'reforco'::text, p_stamps integer DEFAULT 3, p_period text DEFAULT 'semanal'::text, p_monthly integer DEFAULT 4000, p_system text DEFAULT 'figurinhas'::text, p_theme text DEFAULT 'dinossauros'::text, p_themes text[] DEFAULT NULL::text[], p_ano integer DEFAULT NULL, p_teto integer DEFAULT NULL)
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
           where t in ('dinossauros','bandeiras','ameacados','pets','espaco') order by t, o) x;
  if cardinality(th) = 0 then th := array['dinossauros']; end if;
  code := gen_link_code();
  insert into students(name, link_code, level_idx, start_date, study_days, sheets_per_day, week_close_dow,
                       weekly_goal, monthly_goal, reward_period, reward, repeat_mode, stamps_needed, reward_system, sticker_theme, sticker_themes, created_by,
                       ano_escolar, teto_anos)
    values (trim(p_name), code, p_level, p_start, p_days, p_per_day, p_close, p_goal, 4000,
            'semanal', '', coalesce(p_repeat,'reforco'), coalesce(p_stamps,3),
            'figurinhas', th[1], th, uid, p_ano, p_teto)
    returning id into sid;
  insert into guardians(student_id, user_id, role) values (sid, uid, 'owner');
  insert into student_secrets(student_id) values (sid);
  return jsonb_build_object('id', sid, 'link_code', code);
end $function$;
revoke all on function public.create_student(text, integer, date, integer[], integer, integer, integer, text, text, integer, text, integer, text, text, text[], integer, integer) from public, anon;
grant execute on function public.create_student(text, integer, date, integer[], integer, integer, integer, text, text, integer, text, integer, text, text, text[], integer, integer) to authenticated;

-- Os responsáveis precisam ler os parâmetros para mostrar as regras, o ano e os avisos (só leitura; não há dado de ninguém aqui).
create or replace function public.app_public() returns jsonb
 language sql stable security definer set search_path to 'public'
as $$ select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) from app_settings $$;
revoke all on function public.app_public() from public, anon;
grant execute on function public.app_public() to authenticated;

-- 7. Parâmetros no /adm (só o administrador; a trava está aqui, no banco) ------------------------------------------------
create or replace function public.admin_get_settings() returns jsonb
 language plpgsql stable security definer set search_path to 'public'
as $$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  return (select jsonb_object_agg(key, value) from app_settings);
end $$;

create or replace function public.admin_set_settings(p jsonb) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
declare
  limits constant jsonb := '{"stamps_needed":[1,10],"normal_acertos":[50,100],"ouro_acertos":[50,100],"ouro_tempo":[10,100],
    "ouro_carimbos":[1,10],"salto_acertos":[50,100],"salto_tempo":[10,100],"salto_por_semana":[0,14],
    "dias_sem_carimbo_voltar":[1,10],"bloqueio_salto_dias":[0,60],"teto_anos_padrao":[0,9],"virada_mes":[1,12],"virada_dia":[1,28]}';
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
  update students set stamps = least(stamps, app_setting('stamps_needed')::int), stamps_needed = app_setting('stamps_needed')::int
   where stamps > app_setting('stamps_needed')::int or stamps_needed <> app_setting('stamps_needed')::int;
  return (select jsonb_object_agg(key, value) from app_settings);
end $$;

revoke all on function public.admin_get_settings() from public, anon;
revoke all on function public.admin_set_settings(jsonb) from public, anon;
grant execute on function public.admin_get_settings() to authenticated;
grant execute on function public.admin_set_settings(jsonb) to authenticated;
revoke all on function public.app_setting(text, numeric) from public, anon;
revoke all on function public.ano_letivo(date) from public, anon;
revoke all on function public.ano_do_aluno(int, int, date) from public, anon;
grant execute on function public.app_setting(text, numeric) to authenticated;
grant execute on function public.ano_letivo(date) to authenticated;
grant execute on function public.ano_do_aluno(int, int, date) to authenticated;

commit;
