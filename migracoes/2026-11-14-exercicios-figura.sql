-- Exercícios com figura e com escolha (etapa 3): os itens passam a poder trazer "extra" (figura e opções).
-- As contas erradas em reforço guardam o extra e uma assinatura dele, para voltarem idênticas na próxima folha.
--  * weak_items: colunas extra e sig; a chave passa a incluir a assinatura;
--  * student_submit_sheet: grava e confere pela assinatura; student_sheet_plan devolve o extra;
--  * student_open_sheet: recusa folha com mais de 40 mil caracteres (o extra é enviado pelo aparelho).
-- Compatível com o site atual: itens sem extra continuam iguais (assinatura vazia). Aplicar ANTES de publicar o site novo.
begin;

alter table public.weak_items add column extra jsonb, add column sig text not null default '';
alter table public.weak_items drop constraint weak_items_pkey;
alter table public.weak_items add primary key (student_id, level_idx, pre, post, sig);

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
  if not (extract(dow from p_day)::int = any(s.study_days) and p_day >= s.start_date) then raise exception 'sem_folha_hoje'; end if;
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
    sig_t := case when pr ? 'extra' and jsonb_typeof(pr->'extra') = 'object' then md5((pr->'extra')::text) else '' end;
    good := coalesce(an->>'v','') ~ '^[0-9]{1,4}$' and (an->>'v')::int = (pr->>'a')::int;
    if good then
      ok_count := ok_count + 1;
      update weak_items set streak_ok = streak_ok + 1
        where student_id=sid and level_idx=sh.level_idx and pre=pre_t and post=post_t and sig=sig_t;
    else
      insert into weak_items(student_id, level_idx, pre, post, ans, sig, extra)
        values (sid, sh.level_idx, pre_t, post_t, (pr->>'a')::int, sig_t, case when sig_t = '' then null else pr->'extra' end)
        on conflict (student_id, level_idx, pre, post, sig)
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
         and not exists(select 1 from weak_items x where x.student_id=sid and x.level_idx=new_level and x.pre=w.pre and x.post=w.post and x.sig=w.sig);
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

CREATE OR REPLACE FUNCTION public.student_sheet_plan(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; lst sheets%rowtype; rep jsonb; weak jsonb;
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
  return jsonb_build_object('mode', s.repeat_mode, 'repeat', rep, 'weak', coalesce(weak,'[]'::jsonb));
end $function$;

commit;
