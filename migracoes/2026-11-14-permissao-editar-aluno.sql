-- Corrige o erro 403 ao editar um aluno. O formulário grava estas quatro colunas direto na tabela students,
-- mas o adulto logado (authenticated) não tinha permissão de atualizá-las (o RLS já limita a quem é responsável pelo aluno).
--  * ano_escolar, teto_anos: ano escolar e quanto o aluno pode avançar (formulário do programa e botões do painel)
--  * reached_by_jump, dry_days: zeradas quando o adulto troca o nível do aluno
begin;
grant update (ano_escolar, teto_anos, reached_by_jump, dry_days) on table public.students to authenticated;
commit;
