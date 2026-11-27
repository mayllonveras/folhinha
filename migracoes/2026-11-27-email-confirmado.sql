-- Quem se cadastra entra normalmente, mas só cadastra aluno depois de confirmar o e-mail.
-- O login sem confirmação depende da opção do Supabase "Allow unverified email sign-ins" (Authentication > Providers > Email;
-- na API de configuração: mailer_allow_unverified_email_sign_ins = true). Sem essa opção, o login continua exigindo a confirmação.
-- A trava fica no banco (e não só na tela): vale para a função create_student e para qualquer insert direto em students.
-- Contas já existentes estão todas confirmadas (conferido antes de aplicar): nada muda para elas.
begin;

create or replace function public.students_email_ok() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  -- auth.uid() nulo: chamada de dentro do servidor (service_role, migrações); a trava vale para quem está logado
  if auth.uid() is not null and not exists (
    select 1 from auth.users u where u.id = auth.uid() and u.email_confirmed_at is not null) then
    raise exception 'email_nao_confirmado';
  end if;
  return new;
end $$;

drop trigger if exists students_email_ok on public.students;
create trigger students_email_ok before insert on public.students
  for each row execute function public.students_email_ok();

commit;
