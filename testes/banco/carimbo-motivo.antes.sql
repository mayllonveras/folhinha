-- Estado de produção ANTES da migração do motivo do carimbo: um aluno com folhas já entregues em vários tipos de dia.
-- Cota de 5 folhas por dia (mínimo do gatilho).
-- D-5 carimbo normal | D-4 fechou sem carimbo (acertos) | D-3 fechou sem carimbo (tempo) | D-2 incompleto | D-1 ouro
insert into auth.users(id, email) values ('00000000-0000-0000-0000-0000000000c1', 'pai@teste.local');
insert into public.students(id, created_by, name, link_code, start_date, study_days, sheets_per_day, level_idx, ano_escolar, consent_at)
  values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000c1', 'Antigo', 'cod-antigo', current_date - 10, '{0,1,2,3,4,5,6}', 5, 0, 2, now());
create sequence if not exists public.sheet_items_id_seq;
alter table public.sheet_items alter column id set default nextval('public.sheet_items_id_seq');   -- a cópia do esquema não traz o default
-- helper: n folhas no dia (ok/total/secs informados); a última é a do carimbo quando st
create function pg_temp.folhas(d int, n int, ok int, secs numeric, st boolean, tr text, g int) returns void language sql as $$
  insert into public.sheets(student_id, level_idx, study_day, week_end, status, problems, answers, first_ok, total, secs, corrections, stamp, advanced, points, finished_at, tier, gained)
  select '00000000-0000-0000-0000-0000000000a1', 0, current_date - d, current_date, 'done', '[]', '[]', ok, 10, secs, 0, st and i = n, false, 0,
         now() - make_interval(days => d) + make_interval(mins => i), case when st and i = n then tr end, case when st and i = n then g else 0 end
    from generate_series(1, n) i $$;
select pg_temp.folhas(5, 5, 9, 10, true, 'normal', 1);
select pg_temp.folhas(4, 5, 5, 10, false, null, 0);
select pg_temp.folhas(3, 5, 10, 900, false, null, 0);
select pg_temp.folhas(2, 2, 10, 10, false, null, 0);
select pg_temp.folhas(1, 5, 10, 30, true, 'ouro', 2);
