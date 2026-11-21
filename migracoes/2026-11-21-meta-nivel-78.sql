-- Meta de tempo do nível 78 (material dourado, 3º ano): de 120 para 130 s por folha, igual à do nível 77.
-- Motivo: no piloto o aluno fez média de 126 s e 127 s por folha, com 94% e 88% de acertos de primeira, e ficava sem carimbo só por tempo.
-- Só muda levels.target do idx 77. Não altera folhas já entregues nem day_stamps já gravados (eles guardam a meta do dia).
update public.levels set target = 130 where idx = 77 and code = '78' and target = 120;
