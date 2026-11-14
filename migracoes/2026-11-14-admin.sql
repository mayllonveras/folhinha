-- Área de administração (/adm). Só a conta gradematic@gmail.com (com e-mail confirmado) passa.
-- A trava está AQUI, no banco: a página /adm é só a tela. Quem não for o admin recebe "sem_permissao", mesmo chamando a função direto.
-- Somente leitura: não altera nenhum dado. Aplicar no Supabase (SQL Editor) ANTES de publicar o site com /adm.
-- Antes de usar: cadastre gradematic@gmail.com normalmente na página inicial (Cadastrar) e confirme o e-mail.
begin;

create or replace function public.is_admin() returns boolean
 language sql stable security definer set search_path to 'public'
as $$
  select exists(select 1 from auth.users u
                 where u.id = auth.uid() and lower(u.email) = 'gradematic@gmail.com' and u.email_confirmed_at is not null)
$$;

create or replace function public.admin_overview() returns jsonb
 language plpgsql stable security definer set search_path to 'public'
as $$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  return jsonb_build_object(
    'totals', jsonb_build_object(
      'accounts',    (select count(*) from auth.users),
      'students',    (select count(*) from students),
      'sheets_done', (select count(*) from sheets where status = 'done'),
      'sheets_7d',   (select count(*) from sheets where status = 'done' and finished_at >= now() - interval '7 days'),
      'active_7d',   (select count(distinct student_id) from sheets where status = 'done' and finished_at >= now() - interval '7 days'),
      'friendships', (select count(*) from friendships where status = 'aceita')),
    'accounts', coalesce((
      select jsonb_agg(to_jsonb(a) order by a.created_at desc)
        from (select u.id, u.email, p.name, p.role, u.created_at, u.last_sign_in_at,
                     (select count(*) from guardians g where g.user_id = u.id) as students
                from auth.users u left join profiles p on p.id = u.id) a), '[]'::jsonb),
    'students', coalesce((
      select jsonb_agg(to_jsonb(s) order by s.created_at desc)
        from (select st.id, st.name, st.level_idx, st.stamps, st.streak, st.sticker_themes, st.created_at,
                     (select count(*) from sheets h where h.student_id = st.id and h.status = 'done') as sheets_done,
                     (select max(h.finished_at) from sheets h where h.student_id = st.id and h.status = 'done') as last_study,
                     (select coalesce(jsonb_agg(u.email order by g.created_at), '[]'::jsonb)
                        from guardians g join auth.users u on u.id = g.user_id where g.student_id = st.id) as owners
                from students st) s), '[]'::jsonb));
end $$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_overview() to authenticated;

commit;
