-- Folha com uma conta por vez (modo "uma") e comparação com a lista (modo "lista").
--  * app_settings.modo_folha = 1 (1 = uma conta por vez, 0 = todas as contas na tela), editável no /adm (0 ou 1).
--  * student_me devolve modo_folha. Sem a migração o app usa uma conta por vez.
--  * sheet_log.modo e sheet_items.modo guardam o modo em que a folha foi feita; sheet_items.ms_inicio guarda quanto a criança
--    demorou para começar a escrever (primeira visita à conta). O gatilho sheets_to_log copia os dois das respostas (campos modo e ti).
--  * Visão v_uso_modo: folhas, acerto de primeira e tempos por nível e por modo, para comparar e recalibrar as metas.
-- Parte das definições que estão no banco (pg_get_functiondef).
begin;
insert into public.app_settings(key, value) values ('modo_folha', 1) on conflict (key) do nothing;
alter table public.sheet_log add column modo text check (modo in ('uma','lista'));
alter table public.sheet_items add column modo text check (modo in ('uma','lista'));
alter table public.sheet_items add column ms_inicio int;

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
end $function$;

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
end $function$;

create view public.v_uso_modo with (security_invoker = on) as
  with f as (select level_code, coalesce(modo, 'lista') modo, count(*) folhas, count(distinct anon_id) alunos,
                    round(100.0 * sum(first_ok) / nullif(sum(total), 0), 1) acerto, round(avg(secs), 1) seg_folha
               from public.sheet_log group by 1, 2),
       c as (select level_code, coalesce(modo, 'lista') modo, round(avg(ms) / 1000.0, 1) seg_conta
               from public.sheet_items group by 1, 2)
  select f.level_code, f.modo, f.folhas, f.alunos, f.acerto acerto_primeira_pct, f.seg_folha segundos_medio_folha, c.seg_conta segundos_medio_conta
    from f left join c using (level_code, modo);

commit;
