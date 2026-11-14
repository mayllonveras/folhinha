-- Grade nova do 1º ano (35 níveis) no lugar dos 45 níveis antigos.
--  * O app ainda não está em produção: os alunos existentes eram de teste e o professor autorizou apagá-los
--    (a cascata leva folhas, reforço, prêmios, histórico de níveis, amizades, trocas, convites e sessões dos alunos;
--    as contas dos adultos ficam).
--  * public.levels passa a ter 35 linhas (idx 0 a 34), com a meta de tempo de cada nível e ano = 1.
--  * Os carimbos por nível (levels.stamps_needed) ficam vazios: valem o padrão geral, editável no /adm.
-- As metas abaixo vêm de grade1.js; testes/grade.test.js confere que continuam iguais.
begin;

delete from public.students;
delete from public.levels;
insert into public.levels(idx, code, target, ano) values
  (0, '1', 90, 1),
  (1, '2', 100, 1),
  (2, '3', 90, 1),
  (3, '4', 110, 1),
  (4, '5', 120, 1),
  (5, '6', 100, 1),
  (6, '7', 90, 1),
  (7, '8', 80, 1),
  (8, '9', 80, 1),
  (9, '10', 90, 1),
  (10, '11', 100, 1),
  (11, '12', 100, 1),
  (12, '13', 120, 1),
  (13, '14', 100, 1),
  (14, '15', 100, 1),
  (15, '16', 100, 1),
  (16, '17', 120, 1),
  (17, '18', 80, 1),
  (18, '19', 90, 1),
  (19, '20', 100, 1),
  (20, '21', 90, 1),
  (21, '22', 110, 1),
  (22, '23', 110, 1),
  (23, '24', 140, 1),
  (24, '25', 100, 1),
  (25, '26', 120, 1),
  (26, '27', 90, 1),
  (27, '28', 100, 1),
  (28, '29', 100, 1),
  (29, '30', 100, 1),
  (30, '31', 100, 1),
  (31, '32', 120, 1),
  (32, '33', 120, 1),
  (33, '34', 100, 1),
  (34, '35', 120, 1);

commit;
