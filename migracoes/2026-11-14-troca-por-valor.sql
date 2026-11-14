-- Troca por valor: comum vale 1, rara vale 2, ultrarrara vale 3.
-- Cada lado da troca pode ter várias figurinhas (até 6), e a soma dos valores dos dois lados precisa ser IGUAL.
-- Exemplos: 1 rara por 2 comuns; 1 ultrarrara por 1 rara + 1 comum; 1 comum por 1 comum.
--
--  * As figurinhas de cada pedido passam a ficar em trade_items (side 'give' = o que quem pediu oferece; 'want' = o que ele pede).
--    As colunas give_* e want_* de trades ficam só como legado (opcionais). As trocas já feitas foram copiadas para trade_items.
--  * Todas as demais regras continuam: só amigos, só álbuns que os dois têm, só repetidas, a figurinha precisa faltar a quem recebe,
--    cópias prometidas em pedidos pendentes ficam reservadas nos dois lados, o pedido vale 7 dias.
--  * Pedidos pendentes feitos pela regra antiga são cancelados (a criança refaz pela regra nova).
begin;

-- 1. Itens de cada pedido.
create table public.trade_items (
  trade_id uuid not null references trades(id) on delete cascade,
  side text not null check (side in ('give','want')),
  theme text not null,
  slot int not null check (slot between 0 and 51),
  primary key (trade_id, side, theme, slot)
);
create index trade_items_sticker on trade_items (theme, slot);
alter table public.trade_items enable row level security;   -- sem política: só as funções abaixo mexem
revoke all on table public.trade_items from anon, authenticated;

insert into trade_items(trade_id, side, theme, slot) select id, 'give', give_theme, give_slot from trades where give_theme is not null;
insert into trade_items(trade_id, side, theme, slot) select id, 'want', want_theme, want_slot from trades where want_theme is not null;

alter table public.trades alter column give_theme drop not null, alter column give_slot drop not null,
                          alter column want_theme drop not null, alter column want_slot drop not null;
drop index if exists public.trades_pending_once;

update trades set status = 'cancelada', answered_at = now(), requester_seen = true where status = 'pendente';

-- 2. Auxiliares (não ficam expostos).
create or replace function public._tier_value(p_theme text, p_slot int) returns int
 language sql stable security definer set search_path to 'public'
as $$ select case coalesce((select tier from sticker_rarity where theme = p_theme and slot = p_slot), 'comum') when 'ultra' then 3 when 'rara' then 2 else 1 end $$;

-- Um lado de um pedido, como lista [{theme, slot}].
create or replace function public._trade_side(p_trade uuid, p_side text) returns jsonb
 language sql stable security definer set search_path to 'public'
as $$ select coalesce(jsonb_agg(jsonb_build_object('theme', theme, 'slot', slot) order by theme, slot), '[]'::jsonb)
        from trade_items where trade_id = p_trade and side = p_side $$;

-- Cópias já prometidas em pedidos pendentes (como oferta de quem pediu ou como pedido a quem recebeu).
create or replace function public._reserved(p_sid uuid, p_theme text, p_slot int, p_ignore uuid) returns int
 language sql stable security definer set search_path to 'public'
as $$ select count(*)::int from trade_items i join trades t on t.id = i.trade_id
       where t.status = 'pendente' and t.id is distinct from p_ignore and i.theme = p_theme and i.slot = p_slot
         and ((i.side = 'give' and t.requester = p_sid) or (i.side = 'want' and t.addressee = p_sid)) $$;

-- Confere uma troca. Devolve null se está tudo certo, ou o motivo.
create or replace function public._trade_problem(p_req uuid, p_adr uuid, p_gives jsonb, p_wants jsonb, p_ignore uuid) returns text
 language plpgsql stable security definer set search_path to 'public'
as $$
declare r record; vg int := 0; vw int := 0; ng int; nw int;
begin
  if not public._are_friends(p_req, p_adr) then return 'nao_sao_amigos'; end if;
  if jsonb_typeof(p_gives) is distinct from 'array' or jsonb_typeof(p_wants) is distinct from 'array' then return 'troca_vazia'; end if;
  ng := jsonb_array_length(p_gives); nw := jsonb_array_length(p_wants);
  if ng < 1 or nw < 1 then return 'troca_vazia'; end if;
  if ng > 6 or nw > 6 then return 'itens_demais'; end if;
  if (select count(distinct (x->>'theme') || '|' || (x->>'slot')) from jsonb_array_elements(p_gives) x) <> ng
     or (select count(distinct (x->>'theme') || '|' || (x->>'slot')) from jsonb_array_elements(p_wants) x) <> nw then return 'item_repetido'; end if;
  -- o que quem pediu oferece: repetida dele, álbum dos dois, e o amigo ainda não tem
  for r in select x->>'theme' th, (x->>'slot')::int sl from jsonb_array_elements(p_gives) x loop
    if not public._has_album(p_req, r.th) or not public._has_album(p_adr, r.th) then return 'album_invalido'; end if;
    if public._copies(p_req, r.th, r.sl) - 1 <= public._reserved(p_req, r.th, r.sl, p_ignore) then return 'sem_repetida'; end if;
    if public._copies(p_adr, r.th, r.sl) > 0 then return 'amigo_ja_tem'; end if;
    vg := vg + public._tier_value(r.th, r.sl);
  end loop;
  -- o que ele pede: repetida do amigo, álbum dos dois, e ele ainda não tem
  for r in select x->>'theme' th, (x->>'slot')::int sl from jsonb_array_elements(p_wants) x loop
    if not public._has_album(p_req, r.th) or not public._has_album(p_adr, r.th) then return 'album_invalido'; end if;
    if public._copies(p_adr, r.th, r.sl) - 1 <= public._reserved(p_adr, r.th, r.sl, p_ignore) then return 'amigo_sem_repetida'; end if;
    if public._copies(p_req, r.th, r.sl) > 0 then return 'voce_ja_tem'; end if;
    vw := vw + public._tier_value(r.th, r.sl);
  end loop;
  if vg <> vw then return 'valores_diferentes'; end if;
  return null;
end $$;

-- 3. Pedir a troca (substitui a versão de 1 por 1).
drop function if exists public.student_trade_propose(text, uuid, text, int, text, int);
create or replace function public.student_trade_propose(p_token text, p_friendship uuid, p_gives jsonb, p_wants jsonb) returns jsonb
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
  prob := public._trade_problem(sid, oid, p_gives, p_wants, null);
  if prob is not null then raise exception '%', prob; end if;
  insert into trades(requester, addressee) values (sid, oid) returning id into tid;
  insert into trade_items(trade_id, side, theme, slot) select tid, 'give', x->>'theme', (x->>'slot')::int from jsonb_array_elements(p_gives) x;
  insert into trade_items(trade_id, side, theme, slot) select tid, 'want', x->>'theme', (x->>'slot')::int from jsonb_array_elements(p_wants) x;
  select name into nm from students where id = oid;
  perform public._ping(oid);
  return jsonb_build_object('id', tid, 'name', nm);
end $$;

-- 4. Pedidos: recebidos, enviados e respostas ainda não vistas ('gives' = o que quem pediu oferece; 'wants' = o que ele pede).
create or replace function public.student_trades(p_token text) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  update trades set status = 'expirada', answered_at = now(), requester_seen = false where status = 'pendente' and expires_at < now() and sid in (requester, addressee);
  return jsonb_build_object('me', sid,
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', o.name, 'expires_at', t.expires_at,
          'gives', public._trade_side(t.id, 'give'), 'wants', public._trade_side(t.id, 'want')) order by t.created_at)
        from trades t join students o on o.id = t.requester where t.addressee = sid and t.status = 'pendente'), '[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', o.name, 'expires_at', t.expires_at,
          'gives', public._trade_side(t.id, 'give'), 'wants', public._trade_side(t.id, 'want')) order by t.created_at)
        from trades t join students o on o.id = t.addressee where t.requester = sid and t.status = 'pendente'), '[]'::jsonb),
    'answers', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', o.name, 'status', t.status,
          'gives', public._trade_side(t.id, 'give'), 'wants', public._trade_side(t.id, 'want')) order by t.answered_at)
        from trades t join students o on o.id = t.addressee where t.requester = sid and not t.requester_seen and t.status in ('aceita','recusada','invalida','expirada')), '[]'::jsonb));
end $$;

-- 5. Responder (quem recebeu). Devolve {state: aceita|recusada|invalida, why}.
create or replace function public.student_trade_answer(p_token text, p_id uuid, p_accept boolean) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
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
  perform public._ping(t.requester);
  return jsonb_build_object('state', 'aceita');
end $$;

-- 6. Histórico da criança ('gave' = o que ela deu; 'got' = o que recebeu).
create or replace function public.student_trade_history(p_token text) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  return coalesce((select jsonb_agg(x order by (x->>'at') desc) from (
    select jsonb_build_object('id', t.id, 'friend', o.name, 'at', t.answered_at,
        'gave', public._trade_side(t.id, case when t.requester = sid then 'give' else 'want' end),
        'got',  public._trade_side(t.id, case when t.requester = sid then 'want' else 'give' end)) x
      from trades t join students o on o.id = case when t.requester = sid then t.addressee else t.requester end
     where t.status = 'aceita' and sid in (t.requester, t.addressee)
     order by t.answered_at desc limit 30) q), '[]'::jsonb);
end $$;

-- 7. Adulto: histórico de trocas do aluno (só leitura).
create or replace function public.adult_trades(p_student uuid) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
begin
  if not exists(select 1 from guardians where student_id = p_student and user_id = auth.uid()) then raise exception 'sem_permissao'; end if;
  return coalesce((select jsonb_agg(x order by (x->>'at') desc) from (
    select jsonb_build_object('id', t.id, 'status', t.status, 'sent', t.requester = p_student, 'friend', o.name,
        'gave', public._trade_side(t.id, case when t.requester = p_student then 'give' else 'want' end),
        'got',  public._trade_side(t.id, case when t.requester = p_student then 'want' else 'give' end),
        'at', coalesce(t.answered_at, t.created_at)) x
      from trades t join students o on o.id = case when t.requester = p_student then t.addressee else t.requester end
     where p_student in (t.requester, t.addressee) and t.status in ('pendente','aceita','recusada')
     order by coalesce(t.answered_at, t.created_at) desc limit 50) q), '[]'::jsonb);
end $$;

-- 8. A versão de 1 por 1 da conferência não é mais usada.
drop function if exists public._trade_problem(uuid, uuid, text, int, text, int, uuid);

-- 9. Permissões.
revoke all on function public._tier_value(text, int), public._trade_side(uuid, text), public._reserved(uuid, text, int, uuid),
  public._trade_problem(uuid, uuid, jsonb, jsonb, uuid) from public, anon, authenticated;
revoke all on function public.student_trade_propose(text, uuid, jsonb, jsonb) from public;
grant execute on function public.student_trade_propose(text, uuid, jsonb, jsonb) to anon, authenticated;

commit;
