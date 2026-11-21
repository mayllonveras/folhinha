-- Mínimo e padrão de 3 folhas por dia (decisão do professor, 21/11/2026): o gatilho students_check_limits passa a recusar menos de 3 folhas por dia
-- (era 5, desde 16/11/2026). O mínimo de 3 dias de estudo por semana continua. Ninguém é alterado: quem já estava com 5 ou mais continua como está.
-- O padrão do formulário dos pais (3) está no adult.js; o padrão da coluna students.sheets_per_day já era 3. A base é a função de 2026-11-16-minimo-5-folhas.sql.
begin;

create or replace function public.students_check_limits() returns trigger
 language plpgsql
as $function$
declare dias int;
begin
  if tg_op = 'UPDATE' and new.study_days is not distinct from old.study_days
     and new.sheets_per_day is not distinct from old.sheets_per_day then
    return new;
  end if;
  select count(distinct d) into dias from unnest(new.study_days) d;
  if new.sheets_per_day < 3 then raise exception 'min_folhas'; end if;
  if dias < 3 then raise exception 'min_dias'; end if;
  return new;
end $function$;

commit;

-- Para desfazer: reaplicar 2026-11-16-minimo-5-folhas.sql (sem o update, se não quiser subir quem ficou com 3 ou 4).
