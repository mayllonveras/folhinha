-- Motivo do carimbo do dia, guardado no banco.
-- No painel dos pais (Histórico, dia a dia), cada dia mostra o carimbo redondo (carimbado ou só o lugar tracejado) e,
-- ao tocar no dia, um "?" explica por que o aluno ganhou ou não ganhou o carimbo daquele dia.
--
-- O que muda
--  * day_stamps: uma linha por aluno e dia de estudo, com o resultado do dia (carimbo, categoria, acertos, tempo, meta) e o motivo (why):
--      normal | ouro | salto   -> ganhou (a categoria do dia)
--      acertos | tempo | acertos_tempo -> fechou a cota, mas não alcançou o mínimo
--      incompleto              -> ainda não fechou todas as folhas da cota
--    Os limites do dia (80%, 95%, ...) ficam gravados junto, para a explicação não mudar se o administrador mexer nos limites depois.
--  * student_submit_sheet: igual à versão anterior (plano-vip), mais a gravação de day_stamps ao entregar cada folha.
--  * Dias antigos: preenchidos aqui mesmo a partir das folhas já entregues (estimated = true). Os limites usados são os de hoje
--    e a cota é a atual do plano; por isso é uma reconstrução, não o registro do momento.
--
-- Aplicar no Supabase (SQL Editor). Não apaga nem altera dados existentes. Reverter: veja o bloco comentado no fim.
begin;

create table public.day_stamps(
  student_id uuid not null references public.students(id) on delete cascade,
  study_day date not null,
  level_idx int not null,
  quota int not null,
  done int not null,
  closed boolean not null,
  stamp boolean not null,
  tier text check (tier in ('normal','ouro','salto')),
  gained int not null default 0,
  why text not null check (why in ('normal','ouro','salto','acertos','tempo','acertos_tempo','incompleto')),
  day_ok int not null default 0,
  day_total int not null default 0,
  day_pct int not null default 0,
  avg_secs numeric not null default 0,
  target int not null,
  min_pct int not null,
  ouro_pct int not null,
  ouro_tempo int not null,
  salto_pct int not null,
  salto_tempo int not null,
  free_day boolean not null default false,
  estimated boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (student_id, study_day)
);
alter table public.day_stamps enable row level security;
create policy day_stamps_read on public.day_stamps for select to authenticated using (public.is_guardian(student_id));
grant select on public.day_stamps to authenticated;
grant all on public.day_stamps to service_role;

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
  v_why text; is_free boolean; ano_now int; max_ano int; next_ano int; jumps_week int; new_rbj boolean; new_dry int;
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
    -- motivo do dia, guardado para o painel dos pais explicar por que ganhou ou não ganhou o carimbo
    v_why := case when st then v_tier else why end;
    insert into day_stamps(student_id, study_day, level_idx, quota, done, closed, stamp, tier, gained, why,
                           day_ok, day_total, day_pct, avg_secs, target, min_pct, ouro_pct, ouro_tempo, salto_pct, salto_tempo, free_day)
      values (sid, sh.study_day, s.level_idx, public._sheets_quota(s), done_n, true, st, v_tier, case when st then v_gained else 0 end, v_why,
              day_ok, day_total, day_pct, avg_secs, tgt,
              app_setting('normal_acertos', 80)::int, app_setting('ouro_acertos', 95)::int, app_setting('ouro_tempo', 80)::int,
              app_setting('salto_acertos', 98)::int, app_setting('salto_tempo', 60)::int, is_free)
      on conflict (student_id, study_day) do update set
        level_idx = excluded.level_idx, quota = excluded.quota, done = excluded.done, closed = true, stamp = excluded.stamp,
        tier = excluded.tier, gained = excluded.gained, why = excluded.why, day_ok = excluded.day_ok, day_total = excluded.day_total,
        day_pct = excluded.day_pct, avg_secs = excluded.avg_secs, target = excluded.target, min_pct = excluded.min_pct,
        ouro_pct = excluded.ouro_pct, ouro_tempo = excluded.ouro_tempo, salto_pct = excluded.salto_pct, salto_tempo = excluded.salto_tempo,
        free_day = excluded.free_day, estimated = false, updated_at = now();

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

  -- dia ainda sem a cota fechada: guarda quantas folhas faltam (nunca sobrescreve um dia já fechado)
  if not day_closed and sh.level_idx = s.level_idx and done_n < public._sheets_quota(s) then
    insert into day_stamps(student_id, study_day, level_idx, quota, done, closed, stamp, why,
                           day_ok, day_total, day_pct, avg_secs, target, min_pct, ouro_pct, ouro_tempo, salto_pct, salto_tempo, free_day)
      values (sid, sh.study_day, s.level_idx, public._sheets_quota(s), done_n, false, false, 'incompleto',
              day_ok, day_total, day_pct, avg_secs, tgt,
              app_setting('normal_acertos', 80)::int, app_setting('ouro_acertos', 95)::int, app_setting('ouro_tempo', 80)::int,
              app_setting('salto_acertos', 98)::int, app_setting('salto_tempo', 60)::int, is_free)
      on conflict (student_id, study_day) do update set
        level_idx = excluded.level_idx, quota = excluded.quota, done = excluded.done, day_ok = excluded.day_ok, day_total = excluded.day_total,
        day_pct = excluded.day_pct, avg_secs = excluded.avg_secs, target = excluded.target, updated_at = now()
      where not day_stamps.closed;
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

-- Dias já registrados: reconstrói o resultado de cada dia a partir das folhas entregues.
-- Dia com carimbo: usa a categoria (tier) e os carimbos (gained) gravados na folha do carimbo.
-- Dia sem carimbo: usa o nível da última folha do dia; fechou a cota? então calcula o motivo pelos limites de hoje; senão, incompleto.
insert into public.day_stamps(student_id, study_day, level_idx, quota, done, closed, stamp, tier, gained, why,
                              day_ok, day_total, day_pct, avg_secs, target, min_pct, ouro_pct, ouro_tempo, salto_pct, salto_tempo, free_day, estimated)
select r.student_id, r.study_day, r.level_idx,
       case when r.stamp then least(r.quota, r.done) else r.quota end, r.done,
       r.stamp or r.done >= r.quota, r.stamp, case when r.stamp then coalesce(r.tier, 'normal') end, case when r.stamp then greatest(r.gained, 1) else 0 end,
       case when r.stamp then coalesce(r.tier, 'normal')
            when r.done < r.quota then 'incompleto'
            when r.ok * 100 < r.minp * r.total and r.secs / r.done > r.target then 'acertos_tempo'
            when r.ok * 100 < r.minp * r.total then 'acertos'
            else 'tempo' end,
       r.ok, r.total, case when r.total > 0 then round(100.0 * r.ok / r.total) else 0 end::int,
       case when r.done > 0 then round(r.secs / r.done, 1) else 0 end, r.target,
       r.minp, r.ouro_pct, r.ouro_tempo, r.salto_pct, r.salto_tempo, r.free_day, true
  from (
    select g.student_id, g.study_day, g.level_idx, g.stamp, g.tier, g.gained, g.done, g.ok, g.total, g.secs,
           public._sheets_quota(s) as quota, public.level_target(g.level_idx) as target,
           app_setting('normal_acertos', 80)::int as minp, app_setting('ouro_acertos', 95)::int as ouro_pct, app_setting('ouro_tempo', 80)::int as ouro_tempo,
           app_setting('salto_acertos', 98)::int as salto_pct, app_setting('salto_tempo', 60)::int as salto_tempo,
           (not (extract(dow from g.study_day)::int = any(s.study_days)) and extract(dow from g.study_day)::int = any(s.free_days)) as free_day
      from (
        -- um nível por dia: o do carimbo, se houve; senão o da última folha entregue
        select x.student_id, x.study_day, x.level_idx,
               bool_or(x.stamp) as stamp, max(x.tier) filter (where x.stamp) as tier, coalesce(max(x.gained) filter (where x.stamp), 0) as gained,
               count(*)::int as done, sum(x.first_ok)::int as ok, sum(x.total)::int as total, sum(x.secs) as secs
          from public.sheets x
          join lateral (
            select y.level_idx from public.sheets y
             where y.student_id = x.student_id and y.study_day = x.study_day and y.status = 'done'
             order by y.stamp desc, y.finished_at desc limit 1) pick on pick.level_idx = x.level_idx
         where x.status = 'done'
         group by x.student_id, x.study_day, x.level_idx) g
      join public.students s on s.id = g.student_id
  ) r
on conflict (student_id, study_day) do nothing;

commit;

-- Reverter:
--   drop table public.day_stamps;
--   e reaplicar student_submit_sheet de migracoes/2026-11-17-plano-vip.sql.
