-- Álbum do responsável: se o adulto deixa de ser responsável pela criança (linha apagada de guardians), o espelho dele para.
-- Desliga a opção (mirror_active = false), desfaz a amizade com a criança e invalida os pedidos de troca que estavam esperando.
-- O álbum do adulto continua guardado; se ele voltar a ser responsável, pode ligar de novo e recebe só o que ficou faltando.
-- (Hoje o app não tem botão para remover responsável; isto cobre remoção feita direto no banco.)
begin;

create or replace function public.guardians_mirror_off() returns trigger
  language plpgsql security definer set search_path to 'public' as $$
declare m students%rowtype;
begin
  select * into m from students where mirror_of = old.student_id and mirror_user = old.user_id;
  if not found then return null; end if;
  update students set mirror_active = false where id = m.id;
  delete from friendships where least(requester, addressee) = least(old.student_id, m.id) and greatest(requester, addressee) = greatest(old.student_id, m.id);
  update trades set status = 'invalida', answered_at = now()
   where status = 'pendente' and requester in (old.student_id, m.id) and addressee in (old.student_id, m.id);
  perform public._ping(old.student_id);
  return null;
end $$;
revoke all on function public.guardians_mirror_off() from public, anon, authenticated;
create trigger guardians_mirror_off after delete on public.guardians for each row execute function public.guardians_mirror_off();

commit;
-- Desfazer: drop trigger guardians_mirror_off on public.guardians; drop function public.guardians_mirror_off();
