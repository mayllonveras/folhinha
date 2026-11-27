\set ON_ERROR_STOP 0
\pset tuples_only on
create temp table res(nome text, ok boolean, detalhe text);
grant all on res to public;
create function pg_temp.t(n text, c boolean, d text default '') returns void language sql as $$ insert into res values (n, coalesce(c,false), d) $$;
create function pg_temp.err(q text) returns text language plpgsql as $$ begin execute q; return 'ok'; exception when others then return sqlerrm; end $$;
create function pg_temp.como(u text) returns void language sql as $$ select set_config('app.uid', coalesce(u,''), false) $$;
create function pg_temp.aluno(nome text) returns text language sql as $$
  select format('select public.create_student(p_name => %L, p_level => 0, p_start => current_date - 1, p_days => ''{0,1,2,3,4,5,6}'', p_per_day => 5, p_close => 0, p_goal => 0, p_reward => '''', p_themes => ''{}''::text[], p_free => ''{}'', p_consent => true)', nome) $$;

-- C = e-mail confirmado; N = e-mail ainda não confirmado
insert into auth.users(id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-0000000000c1', 'confirmado@teste.local', now()),
  ('00000000-0000-0000-0000-0000000000a1', 'nao-confirmado@teste.local', null);
delete from entitlements where user_id in ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1');

select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.t('sem confirmar o e-mail, não cadastra aluno', pg_temp.err(pg_temp.aluno('Sem Confirmar')) like '%email_nao_confirmado%');
select pg_temp.t('nenhum aluno foi criado para quem não confirmou', (select count(*) from students where name = 'Sem Confirmar') = 0);

select pg_temp.como('00000000-0000-0000-0000-0000000000c1');
select pg_temp.t('com o e-mail confirmado, cadastra o aluno', pg_temp.err(pg_temp.aluno('Com Confirmar')) = 'ok');
select pg_temp.t('o aluno do confirmado foi criado', (select count(*) from students where name = 'Com Confirmar') = 1);

-- a conta que confirma depois passa a poder cadastrar
update auth.users set email_confirmed_at = now() where id = '00000000-0000-0000-0000-0000000000a1';
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.t('depois de confirmar, a mesma conta cadastra', pg_temp.err(pg_temp.aluno('Depois')) = 'ok');
select pg_temp.t('a trava é um gatilho de insert em students', (select count(*) from pg_trigger where tgname = 'students_email_ok' and tgrelid = 'public.students'::regclass) = 1);

select case when ok then 'ok    ' else 'FALHOU' end||' | '||nome||case when detalhe<>'' and not ok then ' ['||detalhe||']' else '' end from res order by ok, nome;
select 'TOTAL: '||count(*)||' verificações, '||count(*) filter (where not ok)||' falha(s)' from res;
