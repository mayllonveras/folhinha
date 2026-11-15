-- Grade do 3º ano (42 níveis) depois dos 76 dos dois primeiros anos: a trilha é uma só, com os níveis 77 a 118.
--  * Só acrescenta linhas em public.levels (idx 76 a 117, ano = 3); nenhum aluno, folha ou nível existente é tocado.
--  * Os carimbos por nível (levels.stamps_needed) ficam vazios: valem o padrão geral, editável no /adm.
--  * As funções de avanço (student_submit_sheet, _at_teto, level_target, level_stamps) já leem a tabela levels,
--    então o último nível passa a ser o 118 sem mudar nenhuma função.
-- As metas abaixo vêm de grade3.js; testes/grade.test.js confere que continuam iguais.
begin;

insert into public.levels(idx, code, target, ano) values
  (76, '77', 130, 3),
  (77, '78', 120, 3),
  (78, '79', 120, 3),
  (79, '80', 120, 3),
  (80, '81', 110, 3),
  (81, '82', 120, 3),
  (82, '83', 120, 3),
  (83, '84', 100, 3),
  (84, '85', 120, 3),
  (85, '86', 130, 3),
  (86, '87', 120, 3),
  (87, '88', 140, 3),
  (88, '89', 160, 3),
  (89, '90', 170, 3),
  (90, '91', 120, 3),
  (91, '92', 90, 3),
  (92, '93', 100, 3),
  (93, '94', 110, 3),
  (94, '95', 100, 3),
  (95, '96', 100, 3),
  (96, '97', 100, 3),
  (97, '98', 100, 3),
  (98, '99', 110, 3),
  (99, '100', 140, 3),
  (100, '101', 110, 3),
  (101, '102', 100, 3),
  (102, '103', 120, 3),
  (103, '104', 110, 3),
  (104, '105', 150, 3),
  (105, '106', 150, 3),
  (106, '107', 120, 3),
  (107, '108', 120, 3),
  (108, '109', 120, 3),
  (109, '110', 110, 3),
  (110, '111', 110, 3),
  (111, '112', 110, 3),
  (112, '113', 110, 3),
  (113, '114', 120, 3),
  (114, '115', 150, 3),
  (115, '116', 150, 3),
  (116, '117', 120, 3),
  (117, '118', 160, 3)
on conflict (idx) do update set code = excluded.code, target = excluded.target, ano = excluded.ano;

do $$
begin
  if (select count(*) from public.levels) <> 118 or (select max(idx) from public.levels) <> 117
     or (select count(*) from public.levels where ano = 3) <> 42 or (select count(*) from public.levels where ano = 2) <> 41
     or (select count(*) from public.levels where ano = 1) <> 35 then
    raise exception 'grade_3ano_inconsistente';
  end if;
end $$;

commit;
