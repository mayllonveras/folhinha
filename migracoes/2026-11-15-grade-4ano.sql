-- Grade do 4º ano (46 níveis) depois dos 118 dos três primeiros anos: a trilha é uma só, com os níveis 119 a 164.
--  * Só acrescenta linhas em public.levels (idx 118 a 163, ano = 4); nenhum aluno, folha ou nível existente é tocado.
--  * Os carimbos por nível (levels.stamps_needed) ficam vazios: valem o padrão geral, editável no /adm.
--  * As funções de avanço (student_submit_sheet, _at_teto, level_target, level_stamps) já leem a tabela levels,
--    então o último nível passa a ser o 164 sem mudar nenhuma função.
-- As metas abaixo vêm de grade4.js; testes/grade.test.js confere que continuam iguais.
begin;

insert into public.levels(idx, code, target, ano) values
  (118, '119', 130, 4),
  (119, '120', 120, 4),
  (120, '121', 120, 4),
  (121, '122', 120, 4),
  (122, '123', 130, 4),
  (123, '124', 140, 4),
  (124, '125', 150, 4),
  (125, '126', 130, 4),
  (126, '127', 170, 4),
  (127, '128', 120, 4),
  (128, '129', 130, 4),
  (129, '130', 100, 4),
  (130, '131', 110, 4),
  (131, '132', 110, 4),
  (132, '133', 120, 4),
  (133, '134', 140, 4),
  (134, '135', 170, 4),
  (135, '136', 150, 4),
  (136, '137', 180, 4),
  (137, '138', 170, 4),
  (138, '139', 120, 4),
  (139, '140', 130, 4),
  (140, '141', 150, 4),
  (141, '142', 150, 4),
  (142, '143', 150, 4),
  (143, '144', 170, 4),
  (144, '145', 130, 4),
  (145, '146', 110, 4),
  (146, '147', 130, 4),
  (147, '148', 180, 4),
  (148, '149', 120, 4),
  (149, '150', 120, 4),
  (150, '151', 120, 4),
  (151, '152', 130, 4),
  (152, '153', 140, 4),
  (153, '154', 130, 4),
  (154, '155', 110, 4),
  (155, '156', 130, 4),
  (156, '157', 140, 4),
  (157, '158', 130, 4),
  (158, '159', 120, 4),
  (159, '160', 150, 4),
  (160, '161', 110, 4),
  (161, '162', 150, 4),
  (162, '163', 120, 4),
  (163, '164', 160, 4)
on conflict (idx) do update set code = excluded.code, target = excluded.target, ano = excluded.ano;

do $$
begin
  if (select count(*) from public.levels) <> 164 or (select max(idx) from public.levels) <> 163
     or (select count(*) from public.levels where ano = 4) <> 46 or (select count(*) from public.levels where ano = 3) <> 42
     or (select count(*) from public.levels where ano = 2) <> 41 or (select count(*) from public.levels where ano = 1) <> 35 then
    raise exception 'grade_4ano_inconsistente';
  end if;
end $$;

commit;
