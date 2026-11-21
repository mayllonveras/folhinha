-- Troca por número ("conversão"): dois amigos com álbuns diferentes podem trocar repetidas.
-- O que vale é o NÚMERO da figurinha. Se a Ana tem a nº 15 repetida no álbum Gatinhos e cachorrinhos e o Beto não tem a nº 15
-- no álbum Bandeiras, ela pode dar a dela e ele a recebe como a nº 15 de Bandeiras (a carta é "convertida" para o álbum dele).
--
--  * trade_items ganha to_theme: o álbum de DESTINO da figurinha na mão de quem recebe. Nulo = o mesmo álbum de origem
--    (trocas antigas e trocas dentro do mesmo álbum continuam iguais).
--  * Valor de cada figurinha na troca = raridade da carta que CHEGA (a do álbum de destino): comum 1, rara 2, ultrarrara 3.
--    Assim os dois lados medem o mesmo que cada criança vê no próprio álbum. A soma dos dois lados continua precisando ser igual.
--  * Cada um só RECEBE figurinha em álbum que está na MESA (students.desk_themes), nunca na gaveta. Vale para toda troca (convertida ou
--    do mesmo álbum). Para DAR, a repetida pode ser de qualquer álbum liberado, até da gaveta.
--  * Regras de sempre: só amigos, só repetidas (sobra além da primeira cópia e fora de pedidos pendentes), quem recebe não pode ter
--    o número no álbum de destino, até 6 figurinhas por lado, pedido vale 7 dias, tudo conferido de novo ao aceitar.
--  * Ao aceitar, a cópia que muda de dono muda também de álbum (update em awards.theme).
--  * _opens_of (conta de pacotinhos abertos, usada no álbum do responsável) passa a contar o álbum de destino de quem recebeu.
-- Desfazer: no final do arquivo.
begin;

alter table public.trade_items add column to_theme text;

-- Um lado de um pedido: [{theme, slot, to}]. 'to' é sempre preenchido (álbum onde a carta cai em quem recebe).
create or replace function public._trade_side(p_trade uuid, p_side text) returns jsonb
 language sql stable security definer set search_path to 'public'
as $$ select coalesce(jsonb_agg(jsonb_build_object('theme', theme, 'slot', slot, 'to', coalesce(to_theme, theme)) order by theme, slot), '[]'::jsonb)
        from trade_items where trade_id = p_trade and side = p_side $$;

-- O álbum está na mesa de quem vai receber?
create or replace function public._on_desk(p_sid uuid, p_theme text) returns boolean
 language sql stable security definer set search_path to 'public'
as $$ select exists(select 1 from students where id = p_sid and p_theme = any(desk_themes)) $$;

-- Confere uma troca. Devolve null se está tudo certo, ou o motivo. Cada item é {theme, slot, to?}.
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
  -- a mesma carta de origem não entra duas vezes, nem duas cartas caem na mesma posição do mesmo álbum de destino
  if (select count(distinct (x->>'theme') || '|' || (x->>'slot')) from jsonb_array_elements(p_gives) x) <> ng
     or (select count(distinct (x->>'theme') || '|' || (x->>'slot')) from jsonb_array_elements(p_wants) x) <> nw then return 'item_repetido'; end if;
  if (select count(distinct coalesce(x->>'to', x->>'theme') || '|' || (x->>'slot')) from jsonb_array_elements(p_gives) x) <> ng
     or (select count(distinct coalesce(x->>'to', x->>'theme') || '|' || (x->>'slot')) from jsonb_array_elements(p_wants) x) <> nw then return 'item_repetido'; end if;
  -- o que quem pediu oferece: repetida dele (álbum de origem dele); o amigo tem o álbum de destino e ainda não tem o número lá
  for r in select x->>'theme' th, coalesce(x->>'to', x->>'theme') dst, (x->>'slot')::int sl from jsonb_array_elements(p_gives) x loop
    if r.sl is null or r.sl not between 0 and 51 then return 'item_invalido'; end if;
    if not public._has_album(p_req, r.th) or not public._has_album(p_adr, r.dst) then return 'album_invalido'; end if;
    if not public._on_desk(p_adr, r.dst) then return 'destino_fora_da_mesa'; end if;
    if public._copies(p_req, r.th, r.sl) - 1 <= public._reserved(p_req, r.th, r.sl, p_ignore) then return 'sem_repetida'; end if;
    if public._copies(p_adr, r.dst, r.sl) > 0 then return 'amigo_ja_tem'; end if;
    vg := vg + public._tier_value(r.dst, r.sl);
  end loop;
  -- o que ele pede: repetida do amigo (álbum de origem do amigo); ele tem o álbum de destino e ainda não tem o número lá
  for r in select x->>'theme' th, coalesce(x->>'to', x->>'theme') dst, (x->>'slot')::int sl from jsonb_array_elements(p_wants) x loop
    if r.sl is null or r.sl not between 0 and 51 then return 'item_invalido'; end if;
    if not public._has_album(p_adr, r.th) or not public._has_album(p_req, r.dst) then return 'album_invalido'; end if;
    if not public._on_desk(p_req, r.dst) then return 'destino_fora_da_mesa'; end if;
    if public._copies(p_adr, r.th, r.sl) - 1 <= public._reserved(p_adr, r.th, r.sl, p_ignore) then return 'amigo_sem_repetida'; end if;
    if public._copies(p_req, r.dst, r.sl) > 0 then return 'voce_ja_tem'; end if;
    vw := vw + public._tier_value(r.dst, r.sl);
  end loop;
  if vg <> vw then return 'valores_diferentes'; end if;
  return null;
end $$;

-- Opções de troca com um amigo: o que eu posso dar e o que posso pedir, já com os álbuns de destino possíveis.
--   give: minhas repetidas (qualquer álbum meu) cujo NÚMERO falta ao amigo em algum álbum da MESA dele. 'to' lista esses álbuns (o mesmo álbum vem primeiro).
--   get:  repetidas dele cujo número me falta em algum álbum da minha MESA.
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
    'give', coalesce((select jsonb_agg(jsonb_build_object('theme', t.theme, 'slot', t.slot, 'spare', t.sp, 'to', t.dst) order by t.theme, t.slot)
        from (select c.theme, c.slot, c.n - 1 - public._reserved(sid, c.theme, c.slot, null) sp,
                     (select jsonb_agg(d order by (d <> c.theme), d) from unnest(o.desk_themes) d
                       where not exists(select 1 from awards a where a.student_id = oid and a.kind = 'figurinha' and a.theme = d and a.slot = c.slot)) dst
                from (select theme, slot, count(*) n from awards where student_id = sid and kind = 'figurinha' and theme = any(me.sticker_themes) group by theme, slot having count(*) > 1) c) t
       where t.sp > 0 and t.dst is not null), '[]'::jsonb),
    'get', coalesce((select jsonb_agg(jsonb_build_object('theme', t.theme, 'slot', t.slot, 'spare', t.sp, 'to', t.dst) order by t.theme, t.slot)
        from (select c.theme, c.slot, c.n - 1 - public._reserved(oid, c.theme, c.slot, null) sp,
                     (select jsonb_agg(d order by (d <> c.theme), d) from unnest(me.desk_themes) d
                       where not exists(select 1 from awards a where a.student_id = sid and a.kind = 'figurinha' and a.theme = d and a.slot = c.slot)) dst
                from (select theme, slot, count(*) n from awards where student_id = oid and kind = 'figurinha' and theme = any(o.sticker_themes) group by theme, slot having count(*) > 1) c) t
       where t.sp > 0 and t.dst is not null), '[]'::jsonb));
end $$;

-- Pedir a troca (itens {theme, slot, to?}).
create or replace function public.student_trade_propose(p_token text, p_friendship uuid, p_gives jsonb, p_wants jsonb) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
declare sid uuid; oid uuid; prob text; tid uuid; nm text;
begin
  sid := public._student_from_token(p_token);
  perform public._need_vip(sid);
  select case when requester = sid then addressee else requester end into oid
    from friendships where id = p_friendship and status = 'aceita' and sid in (requester, addressee);
  if oid is null then raise exception 'amizade_invalida'; end if;
  if not public._student_vip(oid) then raise exception 'amigo_sem_vip'; end if;
  update trades set status = 'expirada', answered_at = now() where status = 'pendente' and expires_at < now();
  if (select count(*) from trades where requester = sid and status = 'pendente') >= 10 then raise exception 'muitos_pedidos'; end if;
  prob := public._trade_problem(sid, oid, p_gives, p_wants, null);
  if prob is not null then raise exception '%', prob; end if;
  insert into trades(requester, addressee) values (sid, oid) returning id into tid;
  insert into trade_items(trade_id, side, theme, slot, to_theme)
    select tid, 'give', x->>'theme', (x->>'slot')::int, nullif(coalesce(x->>'to', x->>'theme'), x->>'theme') from jsonb_array_elements(p_gives) x;
  insert into trade_items(trade_id, side, theme, slot, to_theme)
    select tid, 'want', x->>'theme', (x->>'slot')::int, nullif(coalesce(x->>'to', x->>'theme'), x->>'theme') from jsonb_array_elements(p_wants) x;
  select name into nm from students where id = oid;
  perform public._ping(oid);
  return jsonb_build_object('id', tid, 'name', nm);
end $$;

-- Responder (quem recebeu). A cópia que muda de dono muda também para o álbum de destino.
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
  perform public._need_vip(sid);
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
  for r in select theme, slot, coalesce(to_theme, theme) dst from trade_items where trade_id = t.id and side = 'give' loop
    select id into a from awards where student_id = t.requester and kind = 'figurinha' and theme = r.theme and slot = r.slot order by earned_at desc, id limit 1 for update;
    n := n + 1;
    update awards set student_id = t.addressee, theme = r.dst, earned_day = d, source = 'troca', seq = n, traded_from = t.requester where id = a;
  end loop;
  -- e o que ele pede vai para ele
  n := coalesce((select max(seq) from awards where student_id = t.requester and earned_day = d and source = 'troca'), 0);
  for r in select theme, slot, coalesce(to_theme, theme) dst from trade_items where trade_id = t.id and side = 'want' loop
    select id into a from awards where student_id = t.addressee and kind = 'figurinha' and theme = r.theme and slot = r.slot order by earned_at desc, id limit 1 for update;
    n := n + 1;
    update awards set student_id = t.requester, theme = r.dst, earned_day = d, source = 'troca', seq = n, traded_from = t.addressee where id = a;
  end loop;
  update trades set status = 'aceita', answered_at = now() where id = t.id;
  -- pedidos que dependiam dessas cópias e deixaram de valer
  update trades tt set status = 'invalida', answered_at = now()
   where tt.status = 'pendente' and tt.id <> t.id and (tt.requester in (t.requester, t.addressee) or tt.addressee in (t.requester, t.addressee))
     and public._trade_problem(tt.requester, tt.addressee, public._trade_side(tt.id, 'give'), public._trade_side(tt.id, 'want'), tt.id) is not null;
  perform public._check_albums(t.requester); perform public._check_albums(t.addressee);   -- a troca pode completar um álbum
  perform public._ping(t.requester);
  return jsonb_build_object('state', 'aceita');
end $$;

-- Pacotinhos abertos num álbum = figurinhas que tem agora, menos as que CHEGARAM por troca neste álbum (álbum de destino),
-- mais as que SAÍRAM por troca deste álbum (álbum de origem). Troca só move figurinha, não abre pacotinho.
create or replace function public._opens_of(p_sid uuid, p_theme text) returns integer
  language sql stable security definer set search_path to 'public' as $$
  select ((select count(*) from awards where student_id = p_sid and kind = 'figurinha' and theme = p_theme)
        - (select count(*) from trade_items i join trades t on t.id = i.trade_id
            where t.status = 'aceita' and coalesce(i.to_theme, i.theme) = p_theme
              and ((i.side = 'give' and t.addressee = p_sid) or (i.side = 'want' and t.requester = p_sid)))
        + (select count(*) from trade_items i join trades t on t.id = i.trade_id
            where t.status = 'aceita' and i.theme = p_theme
              and ((i.side = 'give' and t.requester = p_sid) or (i.side = 'want' and t.addressee = p_sid))))::integer $$;

revoke all on function public._on_desk(uuid, text), public._trade_side(uuid, text), public._trade_problem(uuid, uuid, jsonb, jsonb, uuid), public._opens_of(uuid, text) from public, anon, authenticated;
revoke all on function public.student_trade_options(text, uuid), public.student_trade_propose(text, uuid, jsonb, jsonb), public.student_trade_answer(text, uuid, boolean) from public;
grant execute on function public.student_trade_options(text, uuid), public.student_trade_propose(text, uuid, jsonb, jsonb), public.student_trade_answer(text, uuid, boolean) to anon, authenticated;
grant execute on function public._opens_of(uuid, text) to service_role;

commit;

-- Desfazer (só se NENHUMA troca com conversão foi aceita; do contrário as cartas já mudaram de álbum e isso não se desfaz):
--   1. recriar _trade_side, _trade_problem, student_trade_options, student_trade_propose, student_trade_answer e _opens_of
--      a partir de 2026-11-14-troca-por-valor.sql / 2026-11-14-repetidas-e-trocas.sql / 2026-11-17-plano-vip.sql / 2026-11-21-album-do-adulto.sql;
--   2. alter table public.trade_items drop column to_theme;  drop function public._on_desk(uuid, text);
