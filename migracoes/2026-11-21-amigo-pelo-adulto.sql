-- O adulto convida um amigo para a criança, pelo painel dos pais (aba Amigos), usando o código de amigo da outra criança.
-- Mesmas regras de student_friend_invite: exige VIP dos dois lados, convite fica pendente até a outra criança aceitar (ou, se ela já
-- tinha convidado esta, a amizade se forma), no máximo 10 convites esperando, e o responsável (espelho) não entra nessa conta.
begin;

create or replace function public.adult_friend_invite(p_student uuid, p_code text) returns jsonb
  language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare o students%rowtype; f friendships%rowtype;
begin
  if auth.uid() is null or not exists(select 1 from guardians where student_id = p_student and user_id = auth.uid()) then raise exception 'sem_permissao' using errcode = '42501'; end if;
  perform public._need_vip(p_student);
  select * into o from students where friend_code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found or o.mirror_of is not null then raise exception 'codigo_invalido'; end if;
  if o.id = p_student then raise exception 'proprio_codigo'; end if;
  if not public._student_vip(o.id) then raise exception 'amigo_sem_vip'; end if;
  select * into f from friendships where least(requester, addressee) = least(p_student, o.id) and greatest(requester, addressee) = greatest(p_student, o.id) for update;
  if found then
    if f.status = 'aceita' then raise exception 'ja_sao_amigos'; end if;
    if f.requester = p_student then raise exception 'convite_pendente'; end if;
    update friendships set status = 'aceita', answered_at = now() where id = f.id;
    return jsonb_build_object('name', o.name, 'state', 'aceito');
  end if;
  if (select count(*) from friendships where requester = p_student and status = 'pendente') >= 10 then raise exception 'muitos_convites'; end if;
  insert into friendships(requester, addressee) values (p_student, o.id);
  return jsonb_build_object('name', o.name, 'state', 'enviado');
end $$;
revoke all on function public.adult_friend_invite(uuid, text) from public, anon;
grant execute on function public.adult_friend_invite(uuid, text) to authenticated;

commit;
-- Desfazer: drop function public.adult_friend_invite(uuid, text);
