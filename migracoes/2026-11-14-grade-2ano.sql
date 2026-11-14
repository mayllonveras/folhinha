-- Grade do 2º ano (41 níveis) depois dos 35 do 1º: a trilha é uma só, com os níveis 36 a 76.
--  * Só acrescenta linhas em public.levels (idx 35 a 75, ano = 2); nenhum aluno, folha ou nível existente é tocado.
--  * Os carimbos por nível (levels.stamps_needed) ficam vazios: valem o padrão geral, editável no /adm.
--  * As funções de avanço (student_submit_sheet, _at_teto, level_target, level_stamps) já leem a tabela levels,
--    então o último nível passa a ser o 76 sem mudar nenhuma função.
-- As metas abaixo vêm de grade2.js; testes/grade.test.js confere que continuam iguais.
begin;

insert into public.levels(idx, code, target, ano) values
  (35, '36', 90, 2),
  (36, '37', 100, 2),
  (37, '38', 110, 2),
  (38, '39', 110, 2),
  (39, '40', 100, 2),
  (40, '41', 100, 2),
  (41, '42', 120, 2),
  (42, '43', 100, 2),
  (43, '44', 120, 2),
  (44, '45', 100, 2),
  (45, '46', 120, 2),
  (46, '47', 120, 2),
  (47, '48', 100, 2),
  (48, '49', 120, 2),
  (49, '50', 110, 2),
  (50, '51', 120, 2),
  (51, '52', 140, 2),
  (52, '53', 150, 2),
  (53, '54', 100, 2),
  (54, '55', 100, 2),
  (55, '56', 100, 2),
  (56, '57', 100, 2),
  (57, '58', 100, 2),
  (58, '59', 120, 2),
  (59, '60', 110, 2),
  (60, '61', 140, 2),
  (61, '62', 100, 2),
  (62, '63', 110, 2),
  (63, '64', 110, 2),
  (64, '65', 120, 2),
  (65, '66', 110, 2),
  (66, '67', 110, 2),
  (67, '68', 110, 2),
  (68, '69', 120, 2),
  (69, '70', 100, 2),
  (70, '71', 120, 2),
  (71, '72', 120, 2),
  (72, '73', 120, 2),
  (73, '74', 120, 2),
  (74, '75', 100, 2),
  (75, '76', 130, 2)
on conflict (idx) do update set code = excluded.code, target = excluded.target, ano = excluded.ano;

do $$
begin
  if (select count(*) from public.levels) <> 76 or (select max(idx) from public.levels) <> 75
     or (select count(*) from public.levels where ano = 2) <> 41 or (select count(*) from public.levels where ano = 1) <> 35 then
    raise exception 'grade_2ano_inconsistente';
  end if;
end $$;

commit;
