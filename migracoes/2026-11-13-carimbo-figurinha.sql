-- Nova mecânica: carimbo = figurinha, perseverança = figurinha, sem pontos e sem meta semanal.
--
--   Fechou a cota do dia COM carimbo ........ 1 pacotinho (source 'carimbo')
--   Fechou a cota do dia, com ou sem carimbo . 1 pacotinho (source 'perseveranca')
--   Sequência de dias agendados cumpridos ... marcos 3, 7, 14 e a cada 30 dias: 2, 3, 5 e 5 pacotinhos (source 'marco')
--
-- A sequência zera ao faltar um dia agendado (sem perdão) e a cota precisa fechar no mesmo dia.
-- Sem job agendado: a sequência é conferida na leitura (_streak_view) e atualizada ao fechar o dia.
--
-- ATENÇÃO
--  * Esta migração APAGA todos os dados de teste (folhas, pacotes, figurinhas, contas fracas, metas).
--    Nível e programa de cada aluno ficam; os carimbos voltam a 0. Só aplique enquanto não houver produção.
--  * Aplicar no Supabase (SQL Editor) JUNTO com a publicação do site novo: o site antigo depende de
--    student_me.period / student_submit_sheet.period, que deixam de existir.
--  * Não remove _ensure_award, _period_info, week_settings nem month_settings (student_open_sheet ainda grava nelas).
--    Ficam sem uso e podem sair numa limpeza posterior.
begin;

-- 0. Zera os dados de teste.
delete from awards;
delete from sheets;
delete from weak_items;
delete from week_settings;
delete from month_settings;
update students set stamps = 0;

-- 1. Colunas novas.
alter table students
  add column streak int not null default 0 check (streak >= 0),
  add column best_streak int not null default 0 check (best_streak >= 0),
  add column last_streak_day date;

alter table awards
  add column earned_day date,
  add column source text check (source in ('carimbo','perseveranca','marco')),
  add column seq int not null default 1 check (seq >= 1);

-- 2. Vários pacotes por semana: sai a regra "um por semana", entra "um por dia, origem e posição".
drop index if exists awards_pack_week;
drop index if exists awards_sticker_week;
create unique index awards_pack_once on awards (student_id, earned_day, source, seq)
  where kind in ('pacote','figurinha');
-- (awards_sticker_slot, que impede figurinha repetida no mesmo álbum, continua valendo.)

-- 3. Auxiliares (só o servidor chama; nada disso fica exposto na API).

-- Último dia de estudo estritamente antes de p_day (olha até 14 dias para trás).
create or replace function public._prev_study_day(p_sid uuid, p_day date) returns date
 language plpgsql stable security definer set search_path to 'public'
as $$
declare s students%rowtype; d date;
begin
  select * into s from students where id = p_sid;
  d := p_day - 1;
  while d >= s.start_date and d >= p_day - 14 loop
    if extract(dow from d)::int = any(s.study_days) then return d; end if;
    d := d - 1;
  end loop;
  return null;
end $$;

-- Dia de estudo mais recente até p_day, inclusive.
create or replace function public._last_study_day(p_sid uuid, p_day date) returns date
 language plpgsql stable security definer set search_path to 'public'
as $$
declare s students%rowtype;
begin
  select * into s from students where id = p_sid;
  if p_day >= s.start_date and extract(dow from p_day)::int = any(s.study_days) then return p_day; end if;
  return public._prev_study_day(p_sid, p_day);
end $$;

-- Sequência que vale hoje: zera sozinha se um dia agendado passou sem a cota fechada.
create or replace function public._streak_view(p_sid uuid, p_day date) returns int
 language plpgsql stable security definer set search_path to 'public'
as $$
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
end $$;

-- Pacotinhos de bônus ao atingir uma sequência: 3 dias = 2, 7 = 3, 14 = 5, e a cada 30 dias = 5.
create or replace function public._marco_packs(p_streak int) returns int
 language sql immutable
as $$
  select case
    when p_streak = 3 then 2
    when p_streak = 7 then 3
    when p_streak = 14 then 5
    when p_streak >= 30 and p_streak % 30 = 0 then 5
    else 0 end $$;

-- Próximo marco depois da sequência atual: {at, packs}.
create or replace function public._next_marco(p_streak int) returns jsonb
 language sql immutable
as $$
  select case
    when p_streak < 3  then jsonb_build_object('at', 3,  'packs', 2)
    when p_streak < 7  then jsonb_build_object('at', 7,  'packs', 3)
    when p_streak < 14 then jsonb_build_object('at', 14, 'packs', 5)
    else jsonb_build_object('at', (p_streak / 30 + 1) * 30, 'packs', 5) end $$;

-- Cria até p_n pacotinhos para o dia. Não cria se todos os álbuns do aluno já estão completos.
-- Devolve quantos foram criados (idempotente: repetir o mesmo dia e origem não duplica).
create or replace function public._give_packs(p_sid uuid, p_day date, p_source text, p_n int) returns int
 language plpgsql security definer set search_path to 'public'
as $$
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
end $$;

revoke all on function public._prev_study_day(uuid, date), public._last_study_day(uuid, date), public._streak_view(uuid, date),
  public._marco_packs(int), public._next_marco(int), public._give_packs(uuid, date, text, int) from public, anon, authenticated;
grant execute on function public._prev_study_day(uuid, date), public._last_study_day(uuid, date), public._streak_view(uuid, date),
  public._marco_packs(int), public._next_marco(int), public._give_packs(uuid, date, text, int) to service_role;

-- 4. Sem meta semanal: o gatilho de limites deixa de exigir meta mínima de pontos.
create or replace function public.students_check_limits() returns trigger
 language plpgsql
as $$
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
end $$;

-- 5. Entrega da folha: o fechamento do dia agora paga os pacotinhos e atualiza a sequência.
--    (Regras de carimbo, nível e contas fracas iguais às de antes; mudou o bloco "perseverança" e o retorno.)
create or replace function public.student_submit_sheet(p_token text, p_sheet uuid, p_first_ok integer, p_secs numeric, p_answers jsonb, p_corrections integer)
 returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare sid uuid; sh sheets%rowtype; s students%rowtype; tgt int; st boolean := false; pts int;
  adv boolean := false; new_level int; new_stamps int; last_level int;
  n int; ok_count int := 0; i int; good boolean; pr jsonb; an jsonb; pre_t text; post_t text;
  done_n int; day_ok int; day_total int; day_secs numeric; day_closed boolean := false; day_pct numeric := 0; avg_secs numeric := 0; why text := null;
  prev_d date; new_streak int := 0; marco_n int := 0; pk_c int := 0; pk_p int := 0; pk_m int := 0; stk int; stk_best int;
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
  new_level := s.level_idx; new_stamps := s.stamps;
  if day_closed then
    st := day_total > 0 and day_ok * 100 >= 80 * day_total and day_secs / done_n <= tgt;
    if st then
      new_stamps := s.stamps + 1;
      if new_stamps >= 5 then
        if s.level_idx < last_level then new_level := s.level_idx + 1; new_stamps := 0; adv := true;
        else new_stamps := 5; end if;
      end if;
      update students set level_idx = new_level, stamps = new_stamps where id = sid;
      if adv then
        -- as contas ainda erradas acompanham o aluno no nível novo
        update weak_items w set level_idx = new_level
         where w.student_id = sid and w.level_idx <> new_level
           and not exists(select 1 from weak_items x where x.student_id=sid and x.level_idx=new_level and x.pre=w.pre and x.post=w.post);
        delete from weak_items where student_id = sid and level_idx <> new_level;
      end if;
      update sheets set stamp = true, advanced = adv where id = p_sheet;
    else
      why := case when day_ok * 100 < 80 * day_total and day_secs / done_n > tgt then 'acertos_tempo'
                  when day_ok * 100 < 80 * day_total then 'acertos' else 'tempo' end;
    end if;

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
    'target',tgt,'first_ok',ok_count,'stamps_needed',5,
    'shown_stamps', least(5, s.stamps + (case when st then 1 else 0 end)),
    'day_closed', day_closed, 'day_done', done_n, 'day_quota', s.sheets_per_day, 'day_ok', day_ok, 'day_total', day_total,
    'day_pct', day_pct, 'day_avg_secs', avg_secs, 'why', why,
    'packs', jsonb_build_object('carimbo', pk_c, 'perseveranca', pk_p, 'marco', pk_m),
    'marco_streak', case when pk_m > 0 then new_streak else null end,
    'streak', stk, 'best_streak', stk_best, 'next_marco', public._next_marco(stk),
    'pending_packs', (select count(*) from awards where student_id = sid and kind = 'pacote'));
end $function$;

-- 6. Tela inicial do aluno: sequência e próximo marco no lugar de pontos e meta semanal.
create or replace function public.student_me(p_token text, p_day date)
 returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare sid uuid; s students%rowtype; quota int := 0; done_today int; t_ok int; t_total int; packs int; stks jsonb; recent jsonb; stk int;
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
    'name', s.name, 'level_idx', s.level_idx, 'stamps', s.stamps, 'stamps_needed', 5,
    'start_date', s.start_date, 'study_days', to_jsonb(s.study_days), 'sheets_per_day', s.sheets_per_day,
    'quota', quota, 'done_today', done_today, 'today_ok', t_ok, 'today_total', t_total,
    'today_stamp', exists(select 1 from sheets where student_id=sid and study_day=p_day and stamp),
    'streak', stk, 'best_streak', s.best_streak, 'next_marco', public._next_marco(stk),
    'reward_system', 'figurinhas', 'sticker_theme', s.sticker_themes[1], 'sticker_themes', to_jsonb(s.sticker_themes),
    'pending_packs', packs, 'stickers', stks, 'recent', recent);
end $function$;

-- 7. Abrir pacotinho: ordem pelo momento em que o pacotinho foi ganho (antes era pelo fim da semana).
create or replace function public.student_open_pack(p_token text, p_theme text)
 returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare sid uuid; s students%rowtype; pid uuid; pe date; k int; sl int; tr text; left_n int;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid;
  if p_theme is null or not (p_theme = any(s.sticker_themes)) then raise exception 'album_invalido'; end if;
  select id, period_end into pid, pe from awards where student_id=sid and kind='pacote' order by earned_at, id limit 1 for update skip locked;
  if pid is null then raise exception 'sem_pacote'; end if;
  select count(*) into k from awards where student_id=sid and kind='figurinha' and theme=p_theme;
  if k >= 52 then raise exception 'album_completo'; end if;
  select r.g into sl from generate_series(0,51) r(g)
    left join sticker_rarity sr on sr.theme = p_theme and sr.slot = r.g
    join rarity_weights w on w.tier = coalesce(sr.tier,'comum')
   where not exists (select 1 from awards a where a.student_id=sid and a.kind='figurinha' and a.theme=p_theme and a.slot=r.g)
   order by -ln(1 - random()) / w.weight limit 1;
  tr := coalesce((select tier from sticker_rarity where theme = p_theme and slot = sl), 'comum');
  update awards set kind='figurinha', theme=p_theme, slot=sl where id = pid;
  select count(*) into left_n from awards where student_id=sid and kind='pacote';
  return jsonb_build_object('kind','figurinha','theme',p_theme,'slot',sl,'period_end',pe,'tier',tr,'pending',left_n,'count',k+1);
end $function$;

commit;
