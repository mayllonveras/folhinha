-- Pausa na folha: parâmetro pausas_max (padrão 2), o máximo de pausas por folha. A pausa não tem limite de tempo: o relógio fica parado enquanto durar.
--  * app_settings.pausas_max = 2, editável no /adm (admin_set_settings aceita de 0 a 10; 0 desliga a pausa).
--  * student_me devolve pausas_max para a tela da criança.
-- Parte das definições que estão no banco (pg_get_functiondef). Sem a migração o app usa 2 pausas.
begin;
insert into public.app_settings(key, value) values ('pausas_max', 2) on conflict (key) do nothing;

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
    'reward_system', 'figurinhas', 'sticker_theme', s.sticker_themes[1], 'sticker_themes', to_jsonb(s.sticker_themes), 'desk_themes', to_jsonb(s.desk_themes), 'albums_done', (s.albums_done_at is not null), 'desk_limit', app_setting('limite_mesa', 2)::int, 'pausas_max', app_setting('pausas_max', 2)::int,
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
    "dias_sem_carimbo_voltar":[1,10],"bloqueio_salto_dias":[0,60],"teto_anos_padrao":[0,9],"virada_mes":[1,12],"virada_dia":[1,28],"limite_mesa":[1,5],"pausas_max":[0,10]}';
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

commit;
