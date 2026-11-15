-- Álbuns liberados, mesa e gaveta.
--  * Tabela albums: registro dos álbuns que existem (álbum novo = 1 insert, sem mexer em check nem em create_student).
--  * students.sticker_themes = álbuns LIBERADOS pelos pais (agora de 1 até quantos quiserem). O limite de 2 e a lista fixa saem do check.
--  * students.desk_themes = a MESA da criança (até app_settings.limite_mesa, padrão 2); os outros liberados ficam na gaveta.
--  * students.albums_done_at = aviso gravado uma vez: a criança completou TODOS os álbuns liberados (some quando os pais liberam outro).
--  * Gatilho students_albums_rules valida os liberados (mínimo 1, só álbuns do registro), mantém a mesa dentro dos liberados e do limite,
--    põe álbum recém-liberado na mesa se houver vaga e liga/desliga o aviso.
--  * _check_albums(aluno): tira da mesa o álbum completo e liga/desliga o aviso (chamada ao abrir pacote, boas-vindas e troca aceita).
--  * student_set_desk(token, lista): a criança troca mesa e gaveta quando quiser.
--  * student_open_pack só abre pacotinho de álbum que está na mesa; student_welcome recebe também a mesa escolhida (uma chamada só).
--  * student_me devolve desk_themes e albums_done_at; create_student valida pelo registro e exige 1 álbum no mínimo.
-- Parte das definições que estão no banco (pg_get_functiondef). Aplicar ANTES de publicar o site novo.
begin;

create table public.albums (
  id text primary key check (id ~ '^[a-z0-9_]{2,30}$'),
  name text not null,
  categoria text not null default 'geral',
  ordem int not null default 0,
  ativo boolean not null default true
);
alter table public.albums enable row level security;   -- sem política: só as funções do banco leem
insert into public.albums(id, name, categoria, ordem) values
  ('dinossauros','Dinossauros','Animais',1),
  ('pets','Gatinhos e cachorrinhos','Animais',2),
  ('ameacados','Animais ameaçados','Animais',3),
  ('bandeiras','Bandeiras do mundo','Geografia',4),
  ('espaco','Corpos do espaço','Ciência',5);

insert into public.app_settings(key, value) values ('limite_mesa', 2) on conflict (key) do nothing;

alter table public.students drop constraint students_sticker_themes_check;
alter table public.students add constraint students_sticker_themes_check check (cardinality(sticker_themes) >= 1);
alter table public.students add column desk_themes text[] not null default '{}';
alter table public.students add column albums_done_at timestamptz;
-- quem já existe: a mesa começa com os álbuns liberados atuais (no máximo o limite)
update public.students set desk_themes = sticker_themes[1:2];

-- álbuns completos do aluno (52 figurinhas diferentes) entre todos
create or replace function public._full_albums(p_sid uuid) returns text[]
 language sql stable security definer set search_path to 'public'
as $$ select coalesce(array_agg(theme), '{}'::text[]) from (
        select theme from awards where student_id = p_sid and kind = 'figurinha' group by theme having count(distinct slot) >= 52) x $$;

create or replace function public.students_albums_rules() returns trigger
 language plpgsql security definer set search_path to 'public'
as $$
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
end $$;
create trigger students_albums_rules before insert or update on public.students for each row execute function public.students_albums_rules();

create or replace function public._check_albums(p_sid uuid) returns void
 language plpgsql security definer set search_path to 'public'
as $$
declare full_ text[] := public._full_albums(p_sid);
begin
  update students set
    desk_themes = array(select x from unnest(desk_themes) x where x <> all(full_)),
    albums_done_at = case when sticker_themes <@ full_ then coalesce(albums_done_at, now()) else null end
   where id = p_sid;
end $$;
revoke all on function public._check_albums(uuid) from public;
revoke all on function public._full_albums(uuid) from public;

create or replace function public.student_set_desk(p_token text, p_desk text[])
 returns jsonb language plpgsql security definer set search_path to 'public'
as $$
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
end $$;
revoke all on function public.student_set_desk(text, text[]) from public;
grant execute on function public.student_set_desk(text, text[]) to anon, authenticated;

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
end $function$;

drop function public.student_welcome(text, text);
CREATE OR REPLACE FUNCTION public.student_welcome(p_token text, p_theme text, p_desk text[] DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; i int; sl int; want text; real_t text; r numeric; got int[] := '{}'; picks jsonb := '[]'::jsonb;
  p_ultra numeric := app_setting('prob_ultra', 5)::numeric; p_rara numeric := app_setting('prob_rara', 25)::numeric;
  today date := current_date; lim int := coalesce(app_setting('limite_mesa', 2)::int, 2); dsk text[]; tt text;
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
  if p_theme is null or p_theme <> all(dsk) then raise exception 'album_invalido'; end if;
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
  update students set welcome_at = now(), desk_themes = dsk where id = sid;
  perform public._check_albums(sid);
  -- ordem de abertura embaralhada: a rara não vem sempre primeiro
  return jsonb_build_object('theme', p_theme, 'desk', (select to_jsonb(desk_themes) from students where id = sid),
    'stickers', (select coalesce(jsonb_agg(e order by random()), '[]'::jsonb) from jsonb_array_elements(picks) e));
end $function$;
revoke all on function public.student_welcome(text, text, text[]) from public;
grant execute on function public.student_welcome(text, text, text[]) to anon, authenticated;

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
    'reward_system', 'figurinhas', 'sticker_theme', s.sticker_themes[1], 'sticker_themes', to_jsonb(s.sticker_themes), 'desk_themes', to_jsonb(s.desk_themes), 'albums_done', (s.albums_done_at is not null), 'desk_limit', app_setting('limite_mesa', 2)::int,
    'pending_packs', packs, 'stickers', stks, 'recent', recent,
    'normal_acertos', app_setting('normal_acertos', 80)::int, 'ouro_acertos', app_setting('ouro_acertos', 95)::int,
    'ouro_tempo', app_setting('ouro_tempo', 80)::int, 'ouro_carimbos', app_setting('ouro_carimbos', 2)::int,
    'offer_back', (s.reached_by_jump and s.level_idx > 0 and s.dry_days >= app_setting('dias_sem_carimbo_voltar', 2)::int));
end $function$;

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
end $function$;

CREATE OR REPLACE FUNCTION public.create_student(p_name text, p_level integer, p_start date, p_days integer[], p_per_day integer, p_close integer, p_goal integer, p_reward text, p_repeat text DEFAULT 'reforco'::text, p_stamps integer DEFAULT 3, p_period text DEFAULT 'semanal'::text, p_monthly integer DEFAULT 4000, p_system text DEFAULT 'figurinhas'::text, p_theme text DEFAULT 'dinossauros'::text, p_themes text[] DEFAULT NULL::text[], p_ano integer DEFAULT NULL::integer, p_teto integer DEFAULT NULL::integer, p_free integer[] DEFAULT NULL::integer[])
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
                       ano_escolar, teto_anos, free_days)
    values (trim(p_name), code, p_level, p_start, p_days, p_per_day, p_close, p_goal, 4000,
            'semanal', '', coalesce(p_repeat,'reforco'), coalesce(p_stamps,3),
            'figurinhas', th[1], th, uid, p_ano, p_teto, coalesce(p_free, '{0,6}'::int[]))
    returning id into sid;
  insert into guardians(student_id, user_id, role) values (sid, uid, 'owner');
  insert into student_secrets(student_id) values (sid);
  return jsonb_build_object('id', sid, 'link_code', code);
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
    "dias_sem_carimbo_voltar":[1,10],"bloqueio_salto_dias":[0,60],"teto_anos_padrao":[0,9],"virada_mes":[1,12],"virada_dia":[1,28],"limite_mesa":[1,5]}';
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
