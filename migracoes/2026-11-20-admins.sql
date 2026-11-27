-- Administradores concedidos pelo /adm.
-- Antes, só a conta gradematic@gmail.com era administradora (e-mail fixo dentro de is_admin()). Agora um administrador pode
-- conceder o privilégio a outra conta já cadastrada. A conta gradematic@gmail.com continua sendo a conta-raiz: sempre é admin e não dá para retirar.
--
-- O que muda
--  * admins: uma linha por conta que recebeu o privilégio. Sem política de acesso: só as funções abaixo leem e escrevem.
--  * is_admin(): continua exigindo e-mail confirmado; passa se for a conta-raiz OU se houver linha em admins.
--    Todas as funções admin_* e as políticas que já usam is_admin() passam a valer para os novos administradores, sem mudar nada nelas.
--  * admin_grant_admin(p_email), admin_revoke_admin(p_user), admin_list_admins(): usadas pela aba Contas do /adm.
--  * O app dos adultos chama is_admin() para decidir se mostra o botão da área administrativa (só ícone, canto superior direito).
--
-- Aplicar no Supabase (SQL Editor). Não altera dados existentes. Reverter: veja o bloco comentado no fim.
begin;

create table public.admins(
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_by uuid,
  granted_at timestamptz not null default now()
);
alter table public.admins enable row level security;   -- sem política: só as funções leem e escrevem
revoke all on table public.admins from anon, authenticated;

create or replace function public.is_admin() returns boolean
 language sql stable security definer set search_path to 'public'
as $$
  select exists(select 1 from auth.users u
                 where u.id = auth.uid() and u.email_confirmed_at is not null
                   and (lower(u.email) = 'gradematic@gmail.com' or exists(select 1 from public.admins a where a.user_id = u.id)))
$$;

create or replace function public.admin_grant_admin(p_email text) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare uid uuid;
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(coalesce(p_email, '')));
  if uid is null then raise exception 'conta_nao_encontrada'; end if;
  insert into admins(user_id, granted_by) values (uid, auth.uid()) on conflict (user_id) do nothing;
  return jsonb_build_object('id', uid, 'email', (select email from auth.users where id = uid));
end $$;

create or replace function public.admin_revoke_admin(p_user uuid) returns void
language plpgsql security definer set search_path to 'public' as $$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if exists(select 1 from auth.users where id = p_user and lower(email) = 'gradematic@gmail.com') then raise exception 'admin_raiz'; end if;
  delete from admins where user_id = p_user;
  if not found then raise exception 'nao_e_admin'; end if;
end $$;

-- ids das contas que são administradoras (inclui a conta-raiz), para marcar na lista de contas
create or replace function public.admin_list_admins() returns jsonb
language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', u.id, 'root', lower(u.email) = 'gradematic@gmail.com'))
                     from auth.users u
                    where lower(u.email) = 'gradematic@gmail.com' or exists(select 1 from public.admins a where a.user_id = u.id)), '[]'::jsonb);
end $$;

revoke all on function public.admin_grant_admin(text), public.admin_revoke_admin(uuid), public.admin_list_admins() from public, anon;
grant execute on function public.admin_grant_admin(text), public.admin_revoke_admin(uuid), public.admin_list_admins() to authenticated;

commit;

-- Reverter (se for preciso):
-- begin;
-- create or replace function public.is_admin() returns boolean language sql stable security definer set search_path to 'public' as $$
--   select exists(select 1 from auth.users u where u.id = auth.uid() and lower(u.email) = 'gradematic@gmail.com' and u.email_confirmed_at is not null) $$;
-- drop function public.admin_grant_admin(text), public.admin_revoke_admin(uuid), public.admin_list_admins();
-- drop table public.admins;
-- commit;
