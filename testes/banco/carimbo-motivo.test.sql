\set ON_ERROR_STOP 0
\pset tuples_only on
create temp table res(nome text, ok boolean, detalhe text);
grant all on res to public;
create function pg_temp.t(n text, c boolean, d text default '') returns void language sql as $$ insert into res values (n, coalesce(c,false), d) $$;
create function pg_temp.err(q text) returns text language plpgsql as $$ begin execute q; return 'ok'; exception when others then return sqlerrm; end $$;
create function pg_temp.como(u text) returns void language sql as $$ select set_config('app.uid', coalesce(u,''), false) $$;

-- ---------- dias antigos, reconstruídos pela migração ----------
create function pg_temp.dia(d int) returns public.day_stamps language sql as $$
  select * from public.day_stamps where student_id='00000000-0000-0000-0000-0000000000a1' and study_day=current_date-d $$;
select pg_temp.t('antigo: 5 dias reconstruídos', (select count(*)=5 from public.day_stamps where student_id='00000000-0000-0000-0000-0000000000a1'));
select pg_temp.t('antigo: dia do carimbo normal', (select stamp and closed and why='normal' and tier='normal' and gained=1 and day_ok=45 and day_total=50 and day_pct=90 and estimated from pg_temp.dia(5)));
select pg_temp.t('antigo: fechou sem carimbo por acertos', (select not stamp and closed and why='acertos' and day_pct=50 from pg_temp.dia(4)));
select pg_temp.t('antigo: fechou sem carimbo por tempo', (select not stamp and closed and why='tempo' and day_pct=100 and avg_secs=900 from pg_temp.dia(3)));
select pg_temp.t('antigo: dia incompleto', (select not stamp and not closed and why='incompleto' and done=2 and quota=5 from pg_temp.dia(2)));
select pg_temp.t('antigo: dia de ouro', (select stamp and why='ouro' and tier='ouro' and gained=2 from pg_temp.dia(1)));
select pg_temp.t('limites do dia ficam gravados', (select min_pct=80 and ouro_pct=95 and ouro_tempo=80 and target>0 from pg_temp.dia(5)));

-- ---------- dias novos, gravados na entrega da folha ----------
insert into public.students(id, created_by, name, link_code, start_date, study_days, sheets_per_day, level_idx, ano_escolar, consent_at)
  values ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c1', 'Novo', 'cod-novo', current_date - 3, '{0,1,2,3,4,5,6}', 5, 0, 2, now());
insert into student_sessions(token_hash, student_id) values (encode(extensions.digest('tok-Novo', 'sha256'), 'hex'), '00000000-0000-0000-0000-0000000000b1');
create function pg_temp.prob() returns jsonb language sql as $$
  select jsonb_agg(jsonb_build_object('pre', 'a'||i||' + 1 =', 'post', '', 'a', 2)) from generate_series(1,10) i $$;
create function pg_temp.resp(certas int) returns jsonb language sql as $$
  select jsonb_agg(jsonb_build_object('v', case when i <= certas then '2' else '9' end)) from generate_series(1,10) i $$;
create function pg_temp.folha(tk text, dia date, certas int, secs numeric) returns jsonb language plpgsql as $$
declare sid uuid; r jsonb;
begin
  sid := public.student_start_sheet(tk, dia, pg_temp.prob());
  r := public.student_submit_sheet(tk, sid, certas, secs, pg_temp.resp(certas), 0);
  return r;
end $$;
create function pg_temp.novo(d int) returns public.day_stamps language sql as $$
  select * from public.day_stamps where student_id='00000000-0000-0000-0000-0000000000b1' and study_day=current_date-d $$;

create function pg_temp.dia_novo(dia date, n int, certas int, secs numeric, tk text default 'tok-Novo') returns jsonb language plpgsql as $$
declare r jsonb; i int;
begin for i in 1..n loop r := pg_temp.folha(tk, dia, certas, secs); end loop; return r; end $$;

select pg_temp.dia_novo(current_date, 1, 10, 5) as r1 \gset
select pg_temp.t('novo: 1ª folha do dia grava "incompleto"', (select not closed and not stamp and why='incompleto' and done=1 and quota=5 from pg_temp.novo(0)), :'r1');
select pg_temp.dia_novo(current_date, 3, 10, 5) as r1b \gset
select pg_temp.t('novo: 4 de 5 folhas ainda "incompleto"', (select not closed and why='incompleto' and done=4 from pg_temp.novo(0)), :'r1b');
select pg_temp.dia_novo(current_date, 1, 10, 5) as r2 \gset
select pg_temp.t('novo: 1º dia perfeito e rápido no nível vira salto', (select closed and stamp and why='salto' and tier='salto' and done=5 and day_pct=100 and level_idx=0 from pg_temp.novo(0)), :'r2');

select pg_temp.dia_novo(current_date - 1, 5, 3, 5) as r4 \gset
select pg_temp.t('novo: fechar com poucos acertos grava "acertos"', (select closed and not stamp and why='acertos' and day_pct=30 and gained=0 from pg_temp.novo(1)), :'r4');
select pg_temp.t('novo: a resposta da entrega traz o mesmo motivo', (:'r4'::jsonb)->>'why' = 'acertos');


-- dia de ouro: aluno que já tem 1 carimbo no nível (não é o 1º dia, então não salta)
insert into public.students(id, created_by, name, link_code, start_date, study_days, sheets_per_day, level_idx, stamps, ano_escolar, consent_at)
  values ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000c1', 'Ouro', 'cod-ouro', current_date - 3, '{0,1,2,3,4,5,6}', 5, 0, 1, 2, now());
insert into student_sessions(token_hash, student_id) values (encode(extensions.digest('tok-Ouro', 'sha256'), 'hex'), '00000000-0000-0000-0000-0000000000b2');
select pg_temp.dia_novo(current_date, 5, 10, 5, 'tok-Ouro') as r7 \gset
select pg_temp.t('novo: dia perfeito e rápido grava ouro', (select closed and stamp and why='ouro' and tier='ouro' and gained=2 from public.day_stamps where student_id='00000000-0000-0000-0000-0000000000b2' and study_day=current_date), :'r7');

-- dia normal e dia devagar
insert into public.students(id, created_by, name, link_code, start_date, study_days, sheets_per_day, level_idx, stamps, ano_escolar, consent_at)
  values ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000c1', 'Devagar', 'cod-devagar', current_date - 3, '{0,1,2,3,4,5,6}', 5, 0, 1, 2, now());
insert into student_sessions(token_hash, student_id) values (encode(extensions.digest('tok-Devagar', 'sha256'), 'hex'), '00000000-0000-0000-0000-0000000000b3');
select pg_temp.dia_novo(current_date, 5, 9, 5, 'tok-Devagar') as r8 \gset
select pg_temp.t('novo: 90% e no tempo grava normal', (select closed and stamp and why='normal' and tier='normal' and gained=1 and day_pct=90 from public.day_stamps where student_id='00000000-0000-0000-0000-0000000000b3' and study_day=current_date), :'r8');
select pg_temp.dia_novo(current_date - 1, 5, 9, 500, 'tok-Devagar') as r9 \gset
select pg_temp.t('novo: acertou mas devagar grava "tempo"', (select closed and not stamp and why='tempo' and avg_secs=500 and target=90 from public.day_stamps where student_id='00000000-0000-0000-0000-0000000000b3' and study_day=current_date-1), :'r9');

-- um dia ainda sem fechar não sobrescreve um dia fechado
select pg_temp.t('um dia só tem uma linha', (select count(*)=2 from public.day_stamps where student_id='00000000-0000-0000-0000-0000000000b1'));

-- ---------- permissões ----------
select pg_temp.t('só quem acompanha o aluno lê o motivo', has_table_privilege('authenticated', 'public.day_stamps', 'select') and not has_table_privilege('authenticated', 'public.day_stamps', 'insert') and not has_table_privilege('anon', 'public.day_stamps', 'select'));
select pg_temp.t('RLS ligada em day_stamps', (select relrowsecurity from pg_class where oid='public.day_stamps'::regclass));
select pg_temp.t('student_submit_sheet continua volátil e só com a API', (select provolatile='v' from pg_proc where proname='student_submit_sheet'));

select case when ok then 'ok    ' else 'FALHOU' end||' | '||nome||case when detalhe<>'' and not ok then ' ['||detalhe||']' else '' end from res order by ok, nome;
select 'TOTAL: '||count(*)||' verificações, '||count(*) filter (where not ok)||' falha(s)' from res;
