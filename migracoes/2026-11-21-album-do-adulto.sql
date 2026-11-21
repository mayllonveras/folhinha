-- Álbum do responsável: o adulto pode virar amigo da criança no app e ganhar os mesmos pacotinhos dela, do mesmo álbum.
--
--  Como funciona
--  * O adulto liga a opção no painel dos pais (aba Acesso). O banco cria um "aluno espelho" escondido (students.mirror_of = a criança,
--    students.mirror_user = o adulto, sem linha em guardians, então nenhum painel o lista) e uma amizade já aceita entre ele e a criança.
--    O espelho usa as mesmas tabelas e as mesmas funções de álbum, amigos e trocas dos alunos: nada de regra duplicada.
--  * A cada figurinha que a criança abre (pacotinho aberto, ou as 10 do pacote de boas-vindas), o espelho ganha 1 pacotinho DO MESMO ÁLBUM.
--    O sorteio do espelho é independente do da criança, então saem repetidas nos dois e eles trocam entre si.
--  * Ao ligar a opção, o espelho recebe de uma vez a mesma quantidade que a criança já abriu em cada álbum (as figurinhas que ela
--    deu ou recebeu em trocas não mudam a conta: conta-se o que ela ABRIU). Ao desligar e ligar de novo, recebe só o que ficou faltando.
--    A conta fica em mirror_delivered (quantos pacotinhos o espelho já recebeu por álbum).
--  * Pacotinho do espelho é guardado já com o álbum (awards.theme preenchido enquanto kind = 'pacote', source = 'espelho').
--    student_open_pack, para o espelho, abre o pacotinho do álbum pedido e não exige mesa nem a regra do álbum único do Grátis.
--  * Só entrega pacotinho enquanto o adulto for VIP (mesmo critério de amigos e trocas) e o álbum dele não estiver completo.
--    Nada é apagado quando o VIP acaba: o que já foi entregue continua com ele.
--  * O adulto entra no álbum dele por adult_mirror_enter, que devolve o link e uma sessão do espelho (sem PIN: o espelho tem PIN
--    aleatório que ninguém conhece). A tela é a do próprio app do aluno, em modo "responsável" (só Álbum, Trocas e Amigos).
--  * A criança vê o adulto como amigo (marcado como responsável) e troca por valor, como com qualquer amigo.
--    A amizade com o responsável só se desfaz pelo painel dos pais (adult_mirror_disable).
--
--  Funções novas: adult_mirror_info, adult_mirror_enable, adult_mirror_disable, adult_mirror_enter (painel dos pais);
--  _opens_of, _mirror_sync, awards_mirror_fanout (internas).
--  Alteradas: student_open_pack, student_me (mirror, mirror_child, pending_by_theme), student_friends e student_friend_view (mirror),
--  student_friend_invite (espelho não convida nem é convidado), student_friend_remove e adult_friend_remove (não desfazem a amizade com o
--  responsável), adult_friends (mirror), admin_overview (não conta o espelho como aluno).
begin;

-- ---------- estrutura ----------
alter table public.students
  add column mirror_of uuid references public.students(id) on delete cascade,
  add column mirror_user uuid references auth.users(id) on delete cascade,
  add column mirror_active boolean not null default false;
alter table public.students add constraint students_mirror_ck check ((mirror_of is null) = (mirror_user is null));
create unique index students_mirror_uq on public.students (mirror_of, mirror_user) where mirror_of is not null;
create index students_mirror_of_idx on public.students (mirror_of) where mirror_of is not null;

alter table public.awards drop constraint awards_source_check;
alter table public.awards add constraint awards_source_check
  check (source = any (array['carimbo'::text, 'perseveranca'::text, 'marco'::text, 'troca'::text, 'boas_vindas'::text, 'turbo'::text, 'espelho'::text]));

create table public.mirror_delivered (
  mirror_id uuid not null references public.students(id) on delete cascade,
  theme text not null,
  n integer not null default 0 check (n >= 0),
  primary key (mirror_id, theme));
alter table public.mirror_delivered enable row level security;
revoke all on table public.mirror_delivered from anon, authenticated;

-- ---------- quantas figurinhas a criança já ABRIU num álbum ----------
-- = as que tem agora, menos as que recebeu em trocas, mais as que deu em trocas (troca só move figurinha, não abre pacotinho).
create or replace function public._opens_of(p_sid uuid, p_theme text) returns integer
  language sql stable security definer set search_path to 'public' as $$
  select ((select count(*) from awards where student_id = p_sid and kind = 'figurinha' and theme = p_theme)
        - (select count(*) from trade_items i join trades t on t.id = i.trade_id
            where t.status = 'aceita' and i.theme = p_theme
              and ((i.side = 'give' and t.addressee = p_sid) or (i.side = 'want' and t.requester = p_sid)))
        + (select count(*) from trade_items i join trades t on t.id = i.trade_id
            where t.status = 'aceita' and i.theme = p_theme
              and ((i.side = 'give' and t.requester = p_sid) or (i.side = 'want' and t.addressee = p_sid))))::integer $$;

-- ---------- entrega ao espelho: quantos pacotinhos faltam receber neste álbum ----------
create or replace function public._mirror_sync(p_mirror uuid, p_theme text) returns integer
  language plpgsql security definer set search_path to 'public' as $$
declare m students%rowtype; opens int; got int; owed int; seqn int; i int; d date := current_date;
begin
  select * into m from students where id = p_mirror and mirror_of is not null;
  if not found or not m.mirror_active or p_theme is null then return 0; end if;
  if not public._is_vip(m.mirror_user) then return 0; end if;   -- sem VIP não cresce; quando voltar, a conta fecha sozinha
  perform pg_advisory_xact_lock(hashtext('espelho:' || p_mirror::text));   -- evita dois pacotinhos com o mesmo número no mesmo dia
  if p_theme <> all(m.sticker_themes) then
    begin update students set sticker_themes = sticker_themes || p_theme where id = p_mirror;
    exception when others then return 0; end;
  end if;
  if (select count(distinct slot) from awards where student_id = p_mirror and kind = 'figurinha' and theme = p_theme) >= 52 then return 0; end if;
  opens := public._opens_of(m.mirror_of, p_theme);
  select n into got from mirror_delivered where mirror_id = p_mirror and theme = p_theme;
  owed := opens - coalesce(got, 0);
  if owed <= 0 then return 0; end if;
  select coalesce(max(seq), 0) into seqn from awards where student_id = p_mirror and earned_day = d and source = 'espelho';
  for i in 1..owed loop
    seqn := seqn + 1;
    insert into awards(student_id, kind, theme, period_mode, period_start, period_end, earned_day, source, seq)
      values (p_mirror, 'pacote', p_theme, 'diario', d, d, d, 'espelho', seqn);
  end loop;
  insert into mirror_delivered(mirror_id, theme, n) values (p_mirror, p_theme, opens)
    on conflict (mirror_id, theme) do update set n = excluded.n;
  return owed;
end $$;

-- A criança abriu uma figurinha: o espelho recebe o pacotinho correspondente. Um erro aqui NUNCA pode atrapalhar a criança
-- (o pacotinho que faltou é entregue na próxima abertura ou quando a opção for religada, porque a conta é refeita sempre).
create or replace function public.awards_mirror_fanout() returns trigger
  language plpgsql security definer set search_path to 'public' as $$
declare m uuid;
begin
  if (tg_op = 'UPDATE' and old.kind = 'pacote' and new.kind = 'figurinha')
     or (tg_op = 'INSERT' and new.source = 'boas_vindas') then
    for m in select id from students where mirror_of = new.student_id and mirror_active loop
      begin perform public._mirror_sync(m, new.theme);
      exception when others then raise warning 'espelho: %', sqlerrm; end;
    end loop;
  end if;
  return null;
end $$;
create trigger awards_mirror after insert or update on public.awards
  for each row when (new.kind = 'figurinha') execute function public.awards_mirror_fanout();

-- ---------- painel dos pais ----------
create or replace function public.adult_mirror_info(p_student uuid) returns jsonb
  language plpgsql security definer set search_path to 'public' as $$
declare uid uuid := auth.uid(); m students%rowtype; has boolean;
begin
  if uid is null or not exists(select 1 from guardians where student_id = p_student and user_id = uid) then raise exception 'sem_permissao' using errcode = '42501'; end if;
  select * into m from students where mirror_of = p_student and mirror_user = uid;
  has := found;
  return jsonb_build_object('vip', public._is_vip(uid), 'exists', has, 'active', coalesce(m.mirror_active, false), 'name', m.name,
    'default_name', (select name from profiles where id = uid),
    'packs', case when has then (select count(*) from awards where student_id = m.id and kind = 'pacote') else 0 end,
    'stickers', case when has then (select count(distinct (theme, slot)) from awards where student_id = m.id and kind = 'figurinha') else 0 end);
end $$;

create or replace function public.adult_mirror_enable(p_student uuid, p_name text default null) returns jsonb
  language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare uid uuid := auth.uid(); c students%rowtype; m students%rowtype; nm text; th text[]; t text; n int := 0;
begin
  if uid is null or not exists(select 1 from guardians where student_id = p_student and user_id = uid) then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if not public._is_vip(uid) then raise exception 'plano_vip'; end if;
  select * into c from students where id = p_student and mirror_of is null;
  if not found then raise exception 'sem_permissao' using errcode = '42501'; end if;
  nm := left(btrim(coalesce(nullif(btrim(p_name), ''), (select name from profiles where id = uid), '')), 40);
  if char_length(nm) < 1 then raise exception 'nome_invalido'; end if;
  th := array(select u.t from unnest(c.sticker_themes) with ordinality u(t, o) where u.t in (select id from albums where ativo) order by u.o);
  select * into m from students where mirror_of = p_student and mirror_user = uid for update;
  if not found then
    if cardinality(th) < 1 then raise exception 'sem_album'; end if;
    -- o espelho não estuda: programa fixo só para satisfazer as regras da tabela; nunca aparece em lista nenhuma
    insert into students(name, link_code, level_idx, start_date, study_days, sheets_per_day, week_close_dow, weekly_goal, monthly_goal,
                         reward_period, reward, repeat_mode, stamps_needed, reward_system, sticker_theme, sticker_themes, created_by,
                         free_days, welcome_at, mirror_of, mirror_user, mirror_active)
      values (nm, gen_link_code(), c.level_idx, c.start_date, '{1,2,3,4,5}', 5, 0, c.weekly_goal, 4000,
              'semanal', '', 'reforco', 3, 'figurinhas', th[1], th, uid,
              '{0,6}', now(), p_student, uid, true)
      returning * into m;
    -- PIN aleatório que ninguém conhece: ninguém consegue criar um PIN para entrar no espelho pelo link
    insert into student_secrets(student_id, pin_hash, failed) values (m.id, crypt(gen_random_uuid()::text, gen_salt('bf')), 0);
  else
    update students set name = nm, mirror_active = true where id = m.id;
  end if;
  if exists(select 1 from friendships where least(requester, addressee) = least(p_student, m.id) and greatest(requester, addressee) = greatest(p_student, m.id)) then
    update friendships set status = 'aceita', answered_at = coalesce(answered_at, now())
     where least(requester, addressee) = least(p_student, m.id) and greatest(requester, addressee) = greatest(p_student, m.id);
  else
    insert into friendships(requester, addressee, status, answered_at) values (m.id, p_student, 'aceita', now());
  end if;
  -- a mesma quantidade que a criança já abriu, álbum por álbum
  foreach t in array th loop n := n + public._mirror_sync(m.id, t); end loop;
  perform public._ping(p_student);
  return public.adult_mirror_info(p_student) || jsonb_build_object('delivered', n);
end $$;

create or replace function public.adult_mirror_disable(p_student uuid) returns void
  language plpgsql security definer set search_path to 'public' as $$
declare uid uuid := auth.uid(); m students%rowtype;
begin
  if uid is null or not exists(select 1 from guardians where student_id = p_student and user_id = uid) then raise exception 'sem_permissao' using errcode = '42501'; end if;
  select * into m from students where mirror_of = p_student and mirror_user = uid for update;
  if not found then return; end if;
  update students set mirror_active = false where id = m.id;
  delete from friendships where least(requester, addressee) = least(p_student, m.id) and greatest(requester, addressee) = greatest(p_student, m.id);
  update trades set status = 'invalida', answered_at = now()
   where status = 'pendente' and requester in (p_student, m.id) and addressee in (p_student, m.id);
  perform public._ping(p_student);
end $$;

-- Entrar no álbum do responsável: devolve o código do link e uma sessão do espelho (a tela abre em /?aluno=CÓDIGO com esse token).
create or replace function public.adult_mirror_enter(p_student uuid) returns jsonb
  language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare uid uuid := auth.uid(); m students%rowtype;
begin
  if uid is null or not exists(select 1 from guardians where student_id = p_student and user_id = uid) then raise exception 'sem_permissao' using errcode = '42501'; end if;
  select * into m from students where mirror_of = p_student and mirror_user = uid;
  if not found then raise exception 'espelho_inexistente'; end if;
  delete from student_sessions where student_id = m.id and created_at < now() - interval '30 days';
  return jsonb_build_object('code', m.link_code, 'token', public._new_session(m.id), 'name', m.name);
end $$;

revoke all on function public._opens_of(uuid, text), public._mirror_sync(uuid, text), public.awards_mirror_fanout() from public, anon, authenticated;
grant execute on function public._opens_of(uuid, text), public._mirror_sync(uuid, text) to service_role;
revoke all on function public.adult_mirror_info(uuid), public.adult_mirror_enable(uuid, text), public.adult_mirror_disable(uuid), public.adult_mirror_enter(uuid) from public, anon;
grant execute on function public.adult_mirror_info(uuid), public.adult_mirror_enable(uuid, text), public.adult_mirror_disable(uuid), public.adult_mirror_enter(uuid) to authenticated;

-- ---------- funções que já existiam, agora cientes do espelho ----------
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
  -- o álbum do responsável (espelho) não tem mesa nem limite do Grátis: cada pacotinho dele já nasce com o álbum do pacotinho da criança
  if s.mirror_of is null then
    if p_theme <> all(s.desk_themes) then raise exception 'album_fora_da_mesa'; end if;
    -- no plano Grátis os pacotinhos abrem só no álbum principal (o primeiro liberado)
    if p_theme <> s.sticker_themes[1] and not public._student_vip(sid) then raise exception 'plano_album'; end if;
  end if;
  -- álbum completo não recebe mais pacotinho (as repetidas vêm dos álbuns que ainda faltam)
  select count(distinct slot) into owned from awards where student_id=sid and kind='figurinha' and theme=p_theme;
  if owned >= 52 then raise exception 'album_completo'; end if;
  select id, period_end into pid, pe from awards where student_id=sid and kind='pacote' and (s.mirror_of is null or theme = p_theme) order by earned_at, id limit 1 for update skip locked;
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
    'mirror', (s.mirror_of is not null), 'mirror_child', (select c.name from students c where c.id = s.mirror_of),
    'pending_by_theme', (select coalesce(jsonb_object_agg(x.theme, x.n), '{}'::jsonb) from (select theme, count(*) n from awards where student_id = sid and kind = 'pacote' and theme is not null group by theme) x),
    'pending_packs', packs, 'stickers', stks, 'recent', recent,
    'normal_acertos', app_setting('normal_acertos', 80)::int, 'ouro_acertos', app_setting('ouro_acertos', 95)::int,
    'ouro_tempo', app_setting('ouro_tempo', 80)::int, 'ouro_carimbos', app_setting('ouro_carimbos', 2)::int,
    'offer_back', (s.reached_by_jump and s.level_idx > 0 and s.dry_days >= app_setting('dias_sem_carimbo_voltar', 2)::int));
end $function$;

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
    'friends', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name, 'level_idx', o.level_idx, 'stamps', least(o.stamps, 5), 'mirror', (o.mirror_of is not null)) order by o.name)
        from friendships f join students o on o.id = case when f.requester = sid then f.addressee else f.requester end
       where f.status = 'aceita' and sid in (f.requester, f.addressee)), '[]'::jsonb),
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name) order by f.created_at)
        from friendships f join students o on o.id = f.requester where f.status = 'pendente' and f.addressee = sid), '[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name) order by f.created_at)
        from friendships f join students o on o.id = f.addressee where f.status = 'pendente' and f.requester = sid), '[]'::jsonb));
end $function$;

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
  return jsonb_build_object('name', o.name, 'mirror', (o.mirror_of is not null), 'level_idx', o.level_idx, 'stamps', least(o.stamps, 5), 'stamps_needed', 5,
    'sticker_themes', to_jsonb(o.sticker_themes),
    'stickers', coalesce((select jsonb_agg(jsonb_build_object('theme', a.theme, 'slot', a.slot) order by a.earned_at)
        from awards a where a.student_id = oid and a.kind = 'figurinha' and a.theme = any(o.sticker_themes)), '[]'::jsonb));
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
  if exists(select 1 from students where id = sid and mirror_of is not null) then raise exception 'sem_permissao'; end if;   -- o responsável não convida outras crianças
  select * into o from students where friend_code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found or o.mirror_of is not null then raise exception 'codigo_invalido'; end if;
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

CREATE OR REPLACE FUNCTION public.student_friend_remove(p_token text, p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  -- a amizade com o responsável só se desfaz pelo painel dos pais (o responsável deixa de ser amigo)
  if exists(select 1 from friendships f join students m on m.id in (f.requester, f.addressee) and m.mirror_of is not null where f.id = p_id and sid in (f.requester, f.addressee)) then raise exception 'amizade_do_responsavel'; end if;
  delete from friendships where id = p_id and sid in (requester, addressee);
  if not found then raise exception 'convite_invalido'; end if;
end $function$;

CREATE OR REPLACE FUNCTION public.adult_friend_remove(p_student uuid, p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists(select 1 from guardians where student_id = p_student and user_id = auth.uid()) then raise exception 'sem_permissao'; end if;
  if exists(select 1 from friendships f join students m on m.id in (f.requester, f.addressee) and m.mirror_of is not null where f.id = p_id and p_student in (f.requester, f.addressee)) then raise exception 'amizade_do_responsavel'; end if;
  delete from friendships where id = p_id and p_student in (requester, addressee);
end $function$;

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
          'sent', f.requester = p_student, 'mirror', (o.mirror_of is not null)) order by f.status, o.name)
        from friendships f join students o on o.id = case when f.requester = p_student then f.addressee else f.requester end
       where p_student in (f.requester, f.addressee)), '[]'::jsonb));
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
      'students',    (select count(*) from students where mirror_of is null),
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
                from students st where st.mirror_of is null) s), '[]'::jsonb));
end $function$;

commit;

-- Desfazer (só se ainda não houver nenhum espelho; depois de usada, apagar o espelho apaga as figurinhas dele):
--   drop trigger awards_mirror on public.awards;
--   drop function public.awards_mirror_fanout(), public._mirror_sync(uuid, text), public._opens_of(uuid, text),
--     public.adult_mirror_info(uuid), public.adult_mirror_enable(uuid, text), public.adult_mirror_disable(uuid), public.adult_mirror_enter(uuid);
--   drop table public.mirror_delivered;
--   delete from public.students where mirror_of is not null;
--   alter table public.students drop column mirror_active, drop column mirror_user, drop column mirror_of;
--   (e recriar as funções alteradas a partir da migração anterior de cada uma: student_open_pack e student_friend_invite em 2026-11-17-plano-vip,
--    student_me em 2026-11-17-plano-vip e posteriores, student_friends/student_friend_view/student_friend_remove/adult_friends/adult_friend_remove
--    em 2026-11-14-amigos, admin_overview em 2026-11-17-plano-vip e posteriores)
