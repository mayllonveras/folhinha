-- Figurinhas repetidas e trocas entre amigos.
--
--  * Cada linha de "awards" com kind='figurinha' é UMA cópia. Ter 2 linhas iguais (mesmo aluno, álbum e número) = 1 repetida.
--    Por isso sai a regra que impedia figurinha repetida no mesmo álbum.
--  * Sorteio do pacotinho: primeiro a raridade (padrão 70% comum, 25% rara, 5% ultrarrara; ajustável em app_setting
--    'prob_rara' e 'prob_ultra'), depois uma figurinha daquela raridade. Álbum completo continua rendendo repetidas.
--  * Troca: só entre amigos. Quem pede escolhe uma repetida sua que o amigo AINDA NÃO TEM (e cujo álbum o amigo tem)
--    e uma repetida do amigo que falta para si (e cujo álbum a pessoa tem). O amigo aceita ou recusa; vale 7 dias.
--  * Ao aceitar, o servidor confere tudo de novo e troca as duas cópias. Nada passa pelo navegador.
--  * O aviso em tempo real é só um "toque" (broadcast sem dados) no canal do destinatário; os dados vêm de student_trades.
--  * Seguro para aplicar com dados em produção: só acrescenta coisas e relaxa a regra de unicidade das figurinhas.
begin;

-- 1. Repetidas permitidas.
drop index if exists public.awards_sticker_slot;
do $$ declare c text;
begin
  for c in select conname from pg_constraint where conrelid = 'public.awards'::regclass and contype = 'u' and conname like '%sticker%'
  loop execute format('alter table public.awards drop constraint %I', c); end loop;
end $$;

-- 2. Origem 'troca' para as cópias que mudam de dono.
alter table public.awards drop constraint if exists awards_source_check;
alter table public.awards add constraint awards_source_check check (source in ('carimbo','perseveranca','marco','troca'));

-- 3. Pedidos de troca.
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references students(id) on delete cascade,
  addressee uuid not null references students(id) on delete cascade,
  give_theme text not null, give_slot int not null check (give_slot between 0 and 51),
  want_theme text not null, want_slot int not null check (want_slot between 0 and 51),
  status text not null default 'pendente' check (status in ('pendente','aceita','recusada','cancelada','expirada','invalida')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  answered_at timestamptz,
  requester_seen boolean not null default false,
  check (requester <> addressee)
);
create index trades_addressee on trades (addressee) where status = 'pendente';
create index trades_requester on trades (requester);
create unique index trades_pending_once on trades (requester, addressee, give_theme, give_slot, want_theme, want_slot) where status = 'pendente';
alter table public.trades enable row level security;   -- sem política: só as funções abaixo mexem
revoke all on table public.trades from anon, authenticated;

-- 4. Auxiliares (não ficam expostos).
create or replace function public._copies(p_sid uuid, p_theme text, p_slot int) returns int
 language sql stable security definer set search_path to 'public'
as $$ select count(*)::int from awards where student_id = p_sid and kind = 'figurinha' and theme = p_theme and slot = p_slot $$;

create or replace function public._has_album(p_sid uuid, p_theme text) returns boolean
 language sql stable security definer set search_path to 'public'
as $$ select exists(select 1 from students where id = p_sid and p_theme = any(sticker_themes)) $$;

create or replace function public._are_friends(p_a uuid, p_b uuid) returns boolean
 language sql stable security definer set search_path to 'public'
as $$ select exists(select 1 from friendships where status = 'aceita'
        and least(requester, addressee) = least(p_a, p_b) and greatest(requester, addressee) = greatest(p_a, p_b)) $$;

-- Confere uma troca. Devolve null se está tudo certo, ou o motivo.
create or replace function public._trade_problem(p_req uuid, p_adr uuid, gt text, gs int, wt text, ws int, p_ignore uuid) returns text
 language plpgsql stable security definer set search_path to 'public'
as $$
declare reservadas int;
begin
  if not public._are_friends(p_req, p_adr) then return 'nao_sao_amigos'; end if;
  -- o que eu ofereço: repetida minha, álbum do amigo, e o amigo ainda não tem
  if not public._has_album(p_req, gt) or not public._has_album(p_adr, gt) then return 'album_invalido'; end if;
  if not public._has_album(p_req, wt) or not public._has_album(p_adr, wt) then return 'album_invalido'; end if;
  if public._copies(p_req, gt, gs) < 2 then return 'sem_repetida'; end if;
  if public._copies(p_adr, gt, gs) > 0 then return 'amigo_ja_tem'; end if;
  if public._copies(p_adr, wt, ws) < 2 then return 'amigo_sem_repetida'; end if;
  if public._copies(p_req, wt, ws) > 0 then return 'voce_ja_tem'; end if;
  -- não prometer a mesma repetida duas vezes
  select count(*) into reservadas from trades where requester = p_req and status = 'pendente' and give_theme = gt and give_slot = gs and id is distinct from p_ignore;
  if public._copies(p_req, gt, gs) - 1 <= reservadas then return 'sem_repetida'; end if;
  return null;
end $$;

-- Toque em tempo real. Se o Realtime não estiver disponível, nada acontece (o app também consulta de tempos em tempos).
create or replace function public._ping(p_sid uuid) returns void
 language plpgsql security definer set search_path to 'public', 'realtime'
as $$
begin
  begin
    perform realtime.send(jsonb_build_object('t', extract(epoch from now())), 'troca', 'troca-' || p_sid::text, false);
  exception when others then null;
  end;
end $$;

-- 5. Sorteio do pacotinho com raridade (substitui o da etapa anterior).
create or replace function public.student_open_pack(p_token text, p_theme text)
 returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare sid uuid; s students%rowtype; pid uuid; pe date; sl int; tr text; left_n int; r numeric; copies int; owned int;
  p_ultra numeric := app_setting('prob_ultra', 5)::numeric; p_rara numeric := app_setting('prob_rara', 25)::numeric;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid;
  if p_theme is null or not (p_theme = any(s.sticker_themes)) then raise exception 'album_invalido'; end if;
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
  return jsonb_build_object('kind','figurinha','theme',p_theme,'slot',sl,'period_end',pe,'tier',tr,'pending',left_n,
                            'count',owned,'repeated',copies > 0,'copies',copies + 1);
end $function$;

-- 6. Opções de troca com um amigo (id da amizade): o que eu posso dar e o que posso pedir.
create or replace function public.student_trade_options(p_token text, p_friendship uuid) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
declare sid uuid; oid uuid; o students%rowtype; me students%rowtype;
begin
  sid := public._student_from_token(p_token);
  select case when requester = sid then addressee else requester end into oid
    from friendships where id = p_friendship and status = 'aceita' and sid in (requester, addressee);
  if oid is null then raise exception 'amizade_invalida'; end if;
  select * into me from students where id = sid;
  select * into o from students where id = oid;
  return jsonb_build_object('name', o.name,
    'give', coalesce((select jsonb_agg(jsonb_build_object('theme', t.theme, 'slot', t.slot, 'spare', t.n - 1 - coalesce(rs.n, 0)) order by t.theme, t.slot)
        from (select theme, slot, count(*) n from awards where student_id = sid and kind = 'figurinha' and theme = any(me.sticker_themes) and theme = any(o.sticker_themes) group by theme, slot having count(*) > 1) t
        left join (select give_theme, give_slot, count(*) n from trades where requester = sid and status = 'pendente' group by 1, 2) rs on rs.give_theme = t.theme and rs.give_slot = t.slot
       where t.n - 1 - coalesce(rs.n, 0) > 0
         and not exists(select 1 from awards a where a.student_id = oid and a.kind = 'figurinha' and a.theme = t.theme and a.slot = t.slot)), '[]'::jsonb),
    'get', coalesce((select jsonb_agg(jsonb_build_object('theme', t.theme, 'slot', t.slot, 'spare', t.n - 1) order by t.theme, t.slot)
        from (select theme, slot, count(*) n from awards where student_id = oid and kind = 'figurinha' and theme = any(me.sticker_themes) and theme = any(o.sticker_themes) group by theme, slot having count(*) > 1) t
       where not exists(select 1 from awards a where a.student_id = sid and a.kind = 'figurinha' and a.theme = t.theme and a.slot = t.slot)), '[]'::jsonb));
end $$;

-- 7. Pedir a troca.
create or replace function public.student_trade_propose(p_token text, p_friendship uuid, gt text, gs int, wt text, ws int) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
declare sid uuid; oid uuid; prob text; tid uuid; nm text;
begin
  sid := public._student_from_token(p_token);
  select case when requester = sid then addressee else requester end into oid
    from friendships where id = p_friendship and status = 'aceita' and sid in (requester, addressee);
  if oid is null then raise exception 'amizade_invalida'; end if;
  update trades set status = 'expirada', answered_at = now() where status = 'pendente' and expires_at < now();
  if (select count(*) from trades where requester = sid and status = 'pendente') >= 10 then raise exception 'muitos_pedidos'; end if;
  prob := public._trade_problem(sid, oid, gt, gs, wt, ws, null);
  if prob is not null then raise exception '%', prob; end if;
  begin
    insert into trades(requester, addressee, give_theme, give_slot, want_theme, want_slot) values (sid, oid, gt, gs, wt, ws) returning id into tid;
  exception when unique_violation then raise exception 'pedido_repetido';
  end;
  select name into nm from students where id = oid;
  perform public._ping(oid);
  return jsonb_build_object('id', tid, 'name', nm);
end $$;

-- 8. Pedidos: recebidos, enviados e respostas ainda não vistas. 'me' é o canal do aviso em tempo real.
create or replace function public.student_trades(p_token text) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  update trades set status = 'expirada', answered_at = now(), requester_seen = false where status = 'pendente' and expires_at < now() and sid in (requester, addressee);
  return jsonb_build_object('me', sid,
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', o.name, 'give_theme', t.give_theme, 'give_slot', t.give_slot,
          'want_theme', t.want_theme, 'want_slot', t.want_slot, 'expires_at', t.expires_at) order by t.created_at)
        from trades t join students o on o.id = t.requester where t.addressee = sid and t.status = 'pendente'), '[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', o.name, 'give_theme', t.give_theme, 'give_slot', t.give_slot,
          'want_theme', t.want_theme, 'want_slot', t.want_slot, 'expires_at', t.expires_at) order by t.created_at)
        from trades t join students o on o.id = t.addressee where t.requester = sid and t.status = 'pendente'), '[]'::jsonb),
    'answers', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', o.name, 'status', t.status, 'give_theme', t.give_theme, 'give_slot', t.give_slot,
          'want_theme', t.want_theme, 'want_slot', t.want_slot) order by t.answered_at)
        from trades t join students o on o.id = t.addressee where t.requester = sid and not t.requester_seen and t.status in ('aceita','recusada','invalida','expirada')), '[]'::jsonb));
end $$;

create or replace function public.student_trades_seen(p_token text) returns void
 language plpgsql security definer set search_path to 'public'
as $$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  update trades set requester_seen = true where requester = sid and status <> 'pendente' and not requester_seen;
end $$;

-- 9. Responder (quem recebeu). Devolve {state: aceita|recusada|invalida, why}.
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
  update awards set student_id = t.addressee, earned_day = d, source = 'troca', seq = n1 where id = a1;
  update awards set student_id = t.requester, earned_day = d, source = 'troca', seq = n2 where id = a2;
  update trades set status = 'aceita', answered_at = now() where id = t.id;
  -- pedidos que dependiam dessas cópias e deixaram de valer
  update trades set status = 'invalida', answered_at = now()
   where status = 'pendente' and id <> t.id and (requester in (t.requester, t.addressee) or addressee in (t.requester, t.addressee))
     and public._trade_problem(requester, addressee, give_theme, give_slot, want_theme, want_slot, id) is not null;
  perform public._ping(t.requester);
  return jsonb_build_object('state', 'aceita');
end $$;

-- 10. Cancelar um pedido enviado.
create or replace function public.student_trade_cancel(p_token text, p_id uuid) returns void
 language plpgsql security definer set search_path to 'public'
as $$
declare sid uuid; adr uuid;
begin
  sid := public._student_from_token(p_token);
  update trades set status = 'cancelada', answered_at = now(), requester_seen = true where id = p_id and requester = sid and status = 'pendente' returning addressee into adr;
  if adr is null then raise exception 'pedido_invalido'; end if;
  perform public._ping(adr);
end $$;

-- 11. Permissões.
revoke all on function public._copies(uuid, text, int), public._has_album(uuid, text), public._are_friends(uuid, uuid),
  public._trade_problem(uuid, uuid, text, int, text, int, uuid), public._ping(uuid) from public, anon, authenticated;
revoke all on function public.student_trade_options(text, uuid), public.student_trade_propose(text, uuid, text, int, text, int),
  public.student_trades(text), public.student_trades_seen(text), public.student_trade_answer(text, uuid, boolean),
  public.student_trade_cancel(text, uuid) from public;
grant execute on function public.student_trade_options(text, uuid), public.student_trade_propose(text, uuid, text, int, text, int),
  public.student_trades(text), public.student_trades_seen(text), public.student_trade_answer(text, uuid, boolean),
  public.student_trade_cancel(text, uuid) to anon, authenticated;

commit;
