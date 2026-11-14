-- Amigos: uma criança convida outra por um código curto; a outra aceita.
-- Na amizade, cada uma vê SÓ o nível, os carimbos e as figurinhas da outra. Nada de acertos, tempos, folhas ou sequência.
-- O adulto responsável vê a lista de amigos do aluno e pode desfazer qualquer amizade.
--
--  * Cada aluno ganha um código de 6 caracteres (sem 0, O, 1, I, L, para ninguém confundir ao digitar).
--  * Só o servidor mexe nas tabelas (RLS ligada, sem política). Tudo passa por funções que conferem a sessão do aluno.
--  * Seguro para aplicar com dados em produção: só acrescenta coisas.
begin;

-- 1. Código de amizade.
create or replace function public._new_friend_code() returns text
 language plpgsql volatile security definer set search_path to 'public', 'extensions'
as $$
declare abc constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; c text; i int;
begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(abc, 1 + floor(random() * length(abc))::int, 1); end loop;
    exit when not exists(select 1 from students where friend_code = c);
  end loop;
  return c;
end $$;

alter table students add column friend_code text;
update students set friend_code = public._new_friend_code() where friend_code is null;
alter table students alter column friend_code set default public._new_friend_code();
alter table students alter column friend_code set not null;
create unique index students_friend_code_key on students (friend_code);

-- 2. Amizades. Um par só existe uma vez (a ordem não importa).
create table friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references students(id) on delete cascade,
  addressee uuid not null references students(id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente','aceita')),
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  check (requester <> addressee)
);
create unique index friendships_pair on friendships (least(requester, addressee), greatest(requester, addressee));
create index friendships_addressee on friendships (addressee);
alter table friendships enable row level security;   -- sem política: ninguém lê direto

-- 3. Lista da criança: o código dela, os amigos, os convites recebidos e os enviados.
create or replace function public.student_friends(p_token text) returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $$
declare sid uuid; code text;
begin
  sid := public._student_from_token(p_token);
  select friend_code into code from students where id = sid;
  return jsonb_build_object('code', code,
    'friends', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name, 'level_idx', o.level_idx, 'stamps', least(o.stamps, 5)) order by o.name)
        from friendships f join students o on o.id = case when f.requester = sid then f.addressee else f.requester end
       where f.status = 'aceita' and sid in (f.requester, f.addressee)), '[]'::jsonb),
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name) order by f.created_at)
        from friendships f join students o on o.id = f.requester where f.status = 'pendente' and f.addressee = sid), '[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name) order by f.created_at)
        from friendships f join students o on o.id = f.addressee where f.status = 'pendente' and f.requester = sid), '[]'::jsonb));
end $$;

-- 4. Convidar pelo código. Se a outra criança já tinha convidado esta, a amizade é aceita na hora.
--    Devolve {name, state}: 'enviado', 'aceito' (cruzou com um convite recebido). Erros: codigo_invalido, proprio_codigo,
--    ja_sao_amigos, convite_pendente, muitos_convites.
create or replace function public.student_friend_invite(p_token text, p_code text) returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $$
declare sid uuid; o students%rowtype; f friendships%rowtype;
begin
  sid := public._student_from_token(p_token);
  select * into o from students where friend_code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then raise exception 'codigo_invalido'; end if;
  if o.id = sid then raise exception 'proprio_codigo'; end if;
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
end $$;

-- 5. Responder a um convite recebido.
create or replace function public.student_friend_answer(p_token text, p_id uuid, p_accept boolean) returns void
 language plpgsql security definer set search_path to 'public', 'extensions'
as $$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  if p_accept then
    update friendships set status = 'aceita', answered_at = now() where id = p_id and addressee = sid and status = 'pendente';
  else
    delete from friendships where id = p_id and addressee = sid and status = 'pendente';
  end if;
  if not found then raise exception 'convite_invalido'; end if;
end $$;

-- 6. Desfazer a amizade ou cancelar um convite enviado (qualquer lado).
create or replace function public.student_friend_remove(p_token text, p_id uuid) returns void
 language plpgsql security definer set search_path to 'public', 'extensions'
as $$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  delete from friendships where id = p_id and sid in (requester, addressee);
  if not found then raise exception 'convite_invalido'; end if;
end $$;

-- 7. Ver o amigo: nível, carimbos e figurinhas dos álbuns dele. Só isso.
create or replace function public.student_friend_view(p_token text, p_id uuid) returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $$
declare sid uuid; oid uuid; o students%rowtype;
begin
  sid := public._student_from_token(p_token);
  select case when requester = sid then addressee else requester end into oid
    from friendships where id = p_id and status = 'aceita' and sid in (requester, addressee);
  if oid is null then raise exception 'convite_invalido'; end if;
  select * into o from students where id = oid;
  return jsonb_build_object('name', o.name, 'level_idx', o.level_idx, 'stamps', least(o.stamps, 5), 'stamps_needed', 5,
    'sticker_themes', to_jsonb(o.sticker_themes),
    'stickers', coalesce((select jsonb_agg(jsonb_build_object('theme', a.theme, 'slot', a.slot) order by a.earned_at)
        from awards a where a.student_id = oid and a.kind = 'figurinha' and a.theme = any(o.sticker_themes)), '[]'::jsonb));
end $$;

-- 8. Adulto: lista os amigos do aluno e desfaz amizades.
create or replace function public.adult_friends(p_student uuid) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
begin
  if not exists(select 1 from guardians where student_id = p_student and user_id = auth.uid()) then raise exception 'sem_permissao'; end if;
  return jsonb_build_object(
    'code', (select friend_code from students where id = p_student),
    'friends', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', o.name, 'status', f.status,
          'sent', f.requester = p_student) order by f.status, o.name)
        from friendships f join students o on o.id = case when f.requester = p_student then f.addressee else f.requester end
       where p_student in (f.requester, f.addressee)), '[]'::jsonb));
end $$;

create or replace function public.adult_friend_remove(p_student uuid, p_id uuid) returns void
 language plpgsql security definer set search_path to 'public'
as $$
begin
  if not exists(select 1 from guardians where student_id = p_student and user_id = auth.uid()) then raise exception 'sem_permissao'; end if;
  delete from friendships where id = p_id and p_student in (requester, addressee);
end $$;

-- 9. Permissões: as funções do aluno são públicas (a sessão é conferida dentro delas); as do adulto exigem login.
revoke all on function public._new_friend_code() from public, anon, authenticated;
revoke all on function public.student_friends(text), public.student_friend_invite(text, text), public.student_friend_answer(text, uuid, boolean),
  public.student_friend_remove(text, uuid), public.student_friend_view(text, uuid),
  public.adult_friends(uuid), public.adult_friend_remove(uuid, uuid) from public;
grant execute on function public.student_friends(text), public.student_friend_invite(text, text), public.student_friend_answer(text, uuid, boolean),
  public.student_friend_remove(text, uuid), public.student_friend_view(text, uuid) to anon, authenticated;
grant execute on function public.adult_friends(uuid), public.adult_friend_remove(uuid, uuid) to authenticated;

commit;
