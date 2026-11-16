-- Mínimo de 5 folhas por dia (decisão do professor, 16/11/2026): o gatilho students_check_limits passa a recusar menos de 5 folhas por dia
-- (era 3). O mínimo de 3 dias de estudo por semana continua. Quem já tinha menos de 5 sobe para 5. A base é a função em produção em 16/11/2026.
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
  if new.sheets_per_day < 5 then raise exception 'min_folhas'; end if;
  if dias < 3 then raise exception 'min_dias'; end if;
  return new;
end $function$;

update public.students set sheets_per_day = 5 where sheets_per_day < 5;

commit;
