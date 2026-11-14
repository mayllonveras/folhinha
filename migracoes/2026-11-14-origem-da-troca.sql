-- Origem da figurinha trocada: cada cópia que muda de dono guarda quem a deu (traded_from).
-- O álbum mostra um ícone de setinhas nessas figurinhas; ao tocar, aparece o nome do amigo que a deu.
begin;
alter table public.awards add column if not exists traded_from uuid references students(id) on delete set null;

-- Responder (quem recebeu). Devolve {state: aceita|recusada|invalida, why}.
create or replace function public.student_trade_answer(p_token text, p_id uuid, p_accept boolean) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
declare sid uuid; t trades%rowtype; prob text; a1 uuid; a2 uuid; d date := current_date; n1 int; n2 int;
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
  prob := public._trade_problem(t.requester, t.addressee, t.give_theme, t.give_slot, t.want_theme, t.want_slot, t.id);
  if prob is not null then
    update trades set status = 'invalida', answered_at = now() where id = t.id;
    perform public._ping(t.requester);
    return jsonb_build_object('state', 'invalida', 'why', prob);
  end if;
  -- uma cópia de cada lado (a mais recente, para a original ficar no álbum)
  select id into a1 from awards where student_id = t.requester and kind = 'figurinha' and theme = t.give_theme and slot = t.give_slot order by earned_at desc, id limit 1 for update;
  select id into a2 from awards where student_id = t.addressee and kind = 'figurinha' and theme = t.want_theme and slot = t.want_slot order by earned_at desc, id limit 1 for update;
  select coalesce(max(seq), 0) + 1 into n1 from awards where student_id = t.addressee and earned_day = d and source = 'troca';
  select coalesce(max(seq), 0) + 1 into n2 from awards where student_id = t.requester and earned_day = d and source = 'troca';
  update awards set student_id = t.addressee, earned_day = d, source = 'troca', seq = n1, traded_from = t.requester where id = a1;
  update awards set student_id = t.requester, earned_day = d, source = 'troca', seq = n2, traded_from = t.addressee where id = a2;
  update trades set status = 'aceita', answered_at = now() where id = t.id;
  -- pedidos que dependiam dessas cópias e deixaram de valer
  update trades set status = 'invalida', answered_at = now()
   where status = 'pendente' and id <> t.id and (requester in (t.requester, t.addressee) or addressee in (t.requester, t.addressee))
     and public._trade_problem(requester, addressee, give_theme, give_slot, want_theme, want_slot, id) is not null;
  perform public._ping(t.requester);
  return jsonb_build_object('state', 'aceita');
end $$;

-- student_me: cada figurinha passa a trazer 'from' (nome de quem deu, ou nulo).
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
  select coalesce(jsonb_agg(jsonb_build_object('theme',theme,'slot',slot,'end',period_end,'from',(select f.name from students f where f.id = awards.traded_from)) order by earned_at),'[]'::jsonb) into stks
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

commit;
