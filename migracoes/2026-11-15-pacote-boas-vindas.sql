-- Pacote de boas-vindas: na primeira vez que a criança entra no jogo, ela ganha 10 figurinhas de uma vez.
--  * students.welcome_at: quando o pacote foi entregue (nulo = ainda não). Quem já existe fica como "já recebeu".
--  * awards.source passa a aceitar 'boas_vindas' (as 10 figurinhas gravam essa origem, seq 1 a 10: não duplica no mesmo dia).
--  * student_welcome(token, álbum): entrega as 10 de uma vez, todas no mesmo álbum, SEM repetidas e com pelo menos 1 rara;
--    o resto segue o sorteio normal de raridade. Só funciona uma vez por aluno (depois: erro 'ja_recebeu').
--  * student_me passa a devolver welcome_pending (parte da definição que está no banco, com dias livres e carimbos por nível).
-- Aplicar ANTES de publicar o site novo.
begin;

alter table public.students add column welcome_at timestamptz;
update public.students set welcome_at = now();

alter table public.awards drop constraint awards_source_check;
alter table public.awards add constraint awards_source_check
  check (source = any (array['carimbo'::text, 'perseveranca'::text, 'marco'::text, 'troca'::text, 'boas_vindas'::text]));

create or replace function public.student_welcome(p_token text, p_theme text)
 returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare sid uuid; s students%rowtype; i int; sl int; want text; real_t text; r numeric; got int[] := '{}'; picks jsonb := '[]'::jsonb;
  p_ultra numeric := app_setting('prob_ultra', 5)::numeric; p_rara numeric := app_setting('prob_rara', 25)::numeric;
  today date := current_date;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid for update;
  if s.welcome_at is not null then raise exception 'ja_recebeu'; end if;
  if p_theme is null or not (p_theme = any(s.sticker_themes)) then raise exception 'album_invalido'; end if;
  for i in 1..10 loop
    if i = 1 then want := 'rara';      -- pelo menos 1 rara garantida
    else
      r := random() * 100;
      want := case when r < p_ultra then 'ultra' when r < p_ultra + p_rara then 'rara' else 'comum' end;
    end if;
    real_t := want;
    select g into sl from generate_series(0,51) x(g)
     where coalesce((select sr.tier from sticker_rarity sr where sr.theme = p_theme and sr.slot = x.g), 'comum') = want
       and x.g <> all(got)
       and not exists (select 1 from awards a where a.student_id = sid and a.kind = 'figurinha' and a.theme = p_theme and a.slot = x.g)
     order by random() limit 1;
    if sl is null then   -- sem figurinha livre dessa raridade: cai para comum e, por fim, para qualquer uma que falte
      real_t := 'comum';
      select g into sl from generate_series(0,51) x(g)
       where coalesce((select sr.tier from sticker_rarity sr where sr.theme = p_theme and sr.slot = x.g), 'comum') = 'comum'
         and x.g <> all(got)
         and not exists (select 1 from awards a where a.student_id = sid and a.kind = 'figurinha' and a.theme = p_theme and a.slot = x.g)
       order by random() limit 1;
    end if;
    if sl is null then
      select g into sl from generate_series(0,51) x(g)
       where x.g <> all(got)
         and not exists (select 1 from awards a where a.student_id = sid and a.kind = 'figurinha' and a.theme = p_theme and a.slot = x.g)
       order by random() limit 1;
      real_t := coalesce((select sr.tier from sticker_rarity sr where sr.theme = p_theme and sr.slot = sl), 'comum');
    end if;
    exit when sl is null;   -- álbum já tem quase tudo: entrega só as que faltam
    got := got || sl;
    insert into awards(student_id, kind, theme, slot, period_mode, period_start, period_end, earned_day, source, seq)
      values (sid, 'figurinha', p_theme, sl, 'diario', today, today, today, 'boas_vindas', i);
    picks := picks || jsonb_build_object('slot', sl, 'tier', real_t);
  end loop;
  update students set welcome_at = now() where id = sid;
  -- ordem de abertura embaralhada: a rara não vem sempre primeiro
  return jsonb_build_object('theme', p_theme,
    'stickers', (select coalesce(jsonb_agg(e order by random()), '[]'::jsonb) from jsonb_array_elements(picks) e));
end $function$;
revoke all on function public.student_welcome(text, text) from public;
grant execute on function public.student_welcome(text, text) to anon, authenticated;

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
    'reward_system', 'figurinhas', 'sticker_theme', s.sticker_themes[1], 'sticker_themes', to_jsonb(s.sticker_themes),
    'pending_packs', packs, 'stickers', stks, 'recent', recent,
    'normal_acertos', app_setting('normal_acertos', 80)::int, 'ouro_acertos', app_setting('ouro_acertos', 95)::int,
    'ouro_tempo', app_setting('ouro_tempo', 80)::int, 'ouro_carimbos', app_setting('ouro_carimbos', 2)::int,
    'offer_back', (s.reached_by_jump and s.level_idx > 0 and s.dry_days >= app_setting('dias_sem_carimbo_voltar', 2)::int));
end $function$;

commit;
