-- A tabela friendships só é acessada por funções do banco (todas SECURITY DEFINER). O navegador não precisa de acesso direto.
-- Remove as permissões da chave pública (anon) e de quem está logado (authenticated), que vinham do padrão do Supabase.
-- Com RLS ligada e sem política, o acesso já era negado; isto tira também TRUNCATE e as demais permissões que não servem a nada.
begin;
revoke all on table public.friendships from anon, authenticated;
commit;
