-- Grade do 5º ano (47 níveis) depois dos 164 dos quatro primeiros anos: a trilha é uma só, com os níveis 165 a 211.
--  * Só acrescenta linhas em public.levels (idx 164 a 210, ano = 5); nenhum aluno, folha ou nível existente é tocado.
--  * Os carimbos por nível (levels.stamps_needed) ficam vazios: valem o padrão geral, editável no /adm.
--  * As funções de avanço (student_submit_sheet, _at_teto, level_target, level_stamps) já leem a tabela levels,
--    então o último nível passa a ser o 211 sem mudar nenhuma função.
--  * Antes de aplicar, aplicar também 2026-11-17-resposta-decimal.sql: sem ela as respostas decimais e as de 5 ou 6 algarismos do 5º ano não seriam conferidas.
-- As metas abaixo vêm de grade5.js; testes/grade.test.js confere que continuam iguais.
begin;

insert into public.levels(idx, code, target, ano) values
  (164, '165', 130, 5),
  (165, '166', 120, 5),
  (166, '167', 120, 5),
  (167, '168', 140, 5),
  (168, '169', 150, 5),
  (169, '170', 170, 5),
  (170, '171', 110, 5),
  (171, '172', 170, 5),
  (172, '173', 180, 5),
  (173, '174', 170, 5),
  (174, '175', 130, 5),
  (175, '176', 170, 5),
  (176, '177', 170, 5),
  (177, '178', 180, 5),
  (178, '179', 170, 5),
  (179, '180', 180, 5),
  (180, '181', 120, 5),
  (181, '182', 130, 5),
  (182, '183', 150, 5),
  (183, '184', 150, 5),
  (184, '185', 150, 5),
  (185, '186', 120, 5),
  (186, '187', 140, 5),
  (187, '188', 130, 5),
  (188, '189', 130, 5),
  (189, '190', 130, 5),
  (190, '191', 130, 5),
  (191, '192', 130, 5),
  (192, '193', 130, 5),
  (193, '194', 130, 5),
  (194, '195', 150, 5),
  (195, '196', 160, 5),
  (196, '197', 150, 5),
  (197, '198', 160, 5),
  (198, '199', 130, 5),
  (199, '200', 150, 5),
  (200, '201', 130, 5),
  (201, '202', 140, 5),
  (202, '203', 130, 5),
  (203, '204', 120, 5),
  (204, '205', 130, 5),
  (205, '206', 150, 5),
  (206, '207', 140, 5),
  (207, '208', 140, 5),
  (208, '209', 130, 5),
  (209, '210', 140, 5),
  (210, '211', 140, 5)
on conflict (idx) do update set code = excluded.code, target = excluded.target, ano = excluded.ano;

do $$
begin
  if (select count(*) from public.levels) <> 211 or (select max(idx) from public.levels) <> 210
     or (select count(*) from public.levels where ano = 5) <> 47 or (select count(*) from public.levels where ano = 4) <> 46
     or (select count(*) from public.levels where ano = 3) <> 42 or (select count(*) from public.levels where ano = 2) <> 41
     or (select count(*) from public.levels where ano = 1) <> 35 then
    raise exception 'grade_5ano_inconsistente';
  end if;
end $$;

commit;
