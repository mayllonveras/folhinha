\set ON_ERROR_STOP 0
\pset tuples_only on
create temp table res(nome text, ok boolean, detalhe text);
grant all on res to public;
create function pg_temp.t(n text, c boolean, d text default '') returns void language sql as $$ insert into res values (n, coalesce(c,false), d) $$;

-- funções do aluno que conferem o token têm de ser voláteis (erro 25006 pela API, achado em produção em 17/11/2026)
select pg_temp.t('student_turbo_get e student_turbo_save são voláteis', (select count(*)=2 and bool_and(provolatile='v') from pg_proc where proname in ('student_turbo_get','student_turbo_save')), (select string_agg(proname||'='||provolatile::text,',') from pg_proc where proname in ('student_turbo_get','student_turbo_save')));

-- sessão com 2 fatos, 3 tentativas, concluída, com pacotinho (aluno A, com consentimento)
select pg_temp.t('get inicial: padrões', (select r->'unlocked'='["soma"]'::jsonb and (r->>'age')::int=7 and r->'facts'='[]'::jsonb and r->'today'->>'status'='none' from (select public.student_turbo_get('tokA', current_date) r) x));
select public.student_turbo_save('tokA', current_date, jsonb_build_object(
  'device','tablet','devices','{"tablet":1}'::jsonb,'sessionKey','s1',
  'facts', jsonb_build_array(
     jsonb_build_object('id','+:0:0','s',2,'n',1,'daysOk',1,'lastOkDay',current_date,'good',0,'rev',0,'due',current_date+1,'recent','[{"ok":true,"t1":900}]'::jsonb,'lat',900,'stub',false,'reached',false),
     jsonb_build_object('id','×:6:7','s',3,'n',4,'daysOk',2,'good',0,'rev',0,'due',current_date+1,'recent','[]'::jsonb,'lat',1800,'stub',true,'reached',true)),
  'attempts', jsonb_build_array(
     jsonb_build_object('fact','+:0:0','kind','novo','ok',true,'answer',0,'t1',900,'total',1500,'hint','before','counted',false,'stateBefore',1),
     jsonb_build_object('fact','×:6:7','kind','revisao','ok',false,'answer',41,'t1',3000,'total',3600,'hint','after','counted',false,'stateBefore',3),
     jsonb_build_object('fact','+:0:0','kind','novo','ok',true,'answer',0,'t1',700,'total',1200,'hint','before','counted',true,'stateBefore',2)),
  'result', '{"done":true,"pack":true,"attempts":6,"secs":95,"promoted":1,"demoted":0}'::jsonb)) as salvou \gset
select pg_temp.t('save devolve ok', :'salvou'::jsonb->>'ok'='true');
select pg_temp.t('pacotinho turbo criado (1)', (select count(*) from awards where source='turbo' and kind='pacote' and earned_day=current_date)=1);
select pg_temp.t('turbo_days: done, 6 tentativas, pack_given', (select status='done' and attempts=6 and pack_given and promoted=1 from turbo_days where study_day=current_date));
select pg_temp.t('fatos gravados (2)', (select count(*) from turbo_facts)=2);
select pg_temp.t('tentativas gravadas com consentimento (3)', (select count(*) from turbo_attempts)=3);
select pg_temp.t('histórico dos pais: 3 linhas com acerto, erro e resposta digitada', (select count(*)=3 and count(*) filter (where ok)=2 and count(*) filter (where not ok and answer=41 and fact_id='×:6:7')=1 from turbo_log));
select pg_temp.t('tentativa tem anon_id e aparelho', (select bool_and(anon_id is not null and device='tablet') from turbo_attempts));
select pg_temp.t('aparelhos atualizados', (select devices->>'tablet'='1' from turbo_students));

-- segunda chamada no mesmo dia: não duplica o pacotinho, soma tentativas
select public.student_turbo_save('tokA', current_date, '{"device":"tablet","result":{"done":true,"pack":true,"attempts":4,"secs":30}}'::jsonb) as segundo \gset
select pg_temp.t('2ª sessão no dia: sem 2º pacotinho', (select count(*) from awards where source='turbo')=1 and :'segundo'::jsonb->>'pack_new'='false');
select pg_temp.t('2ª sessão soma tentativas (10)', (select attempts=10 from turbo_days where study_day=current_date));

-- get depois de salvar
select pg_temp.t('get devolve fatos e pacotinho do dia', (select jsonb_array_length(r->'facts')=2 and (r->'today'->>'pack_given')='true' and (r->>'pending_packs')::int=1 from (select public.student_turbo_get('tokA', current_date) r) x));
select pg_temp.t('get devolve datas como texto e campos do motor', (select (f->>'due')=to_char(current_date+1,'YYYY-MM-DD') and f->>'stub'='true' and (f->>'lat')::int=1800 from (select jsonb_array_elements(public.student_turbo_get('tokA', current_date)->'facts') f) x where f->>'id'='×:6:7'));

-- aluno B: sem consentimento, sem tentativas; sem pacote se "chute" ou parcial
select public.student_turbo_save('tokB', current_date, '{"device":"celular","result":{"done":true,"guess":true,"pack":true,"attempts":10},"attempts":[{"fact":"+:1:1","kind":"novo","ok":false,"t1":200,"total":300}]}'::jsonb);
select pg_temp.t('B sem consentimento: 0 tentativas gravadas', (select count(*) from turbo_attempts a join students s on s.id=a.student_id where s.token='tokB')=0);
select pg_temp.t('B sem consentimento: o histórico dos pais grava mesmo assim (1 erro, "não sei")', (select count(*)=1 and bool_and(not ok and answer is null) from turbo_log l join students s on s.id=l.student_id where s.token='tokB'));
select pg_temp.t('chute: sem pacotinho e status guess', (select count(*)=0 from awards a join students s on s.id=a.student_id where s.token='tokB') and (select status='guess' from turbo_days d join students s on s.id=d.student_id where s.token='tokB'));
select public.student_turbo_save('tokB', current_date, '{"result":{"done":true,"pack":true,"attempts":2}}'::jsonb);
select pg_temp.t('menos de 3 tentativas: sem pacotinho', (select count(*)=0 from awards a join students s on s.id=a.student_id where s.token='tokB'));

-- pausa e volta no mesmo dia (aluno A, dia sem pacotinho ainda)
delete from awards where source='turbo'; delete from turbo_days;
select public.student_turbo_save('tokA', current_date, '{"result":{"done":false,"attempts":20,"secs":120}}'::jsonb);
select pg_temp.t('pausou no meio: sem pacotinho', (select count(*)=0 from awards where source='turbo'));
select public.student_turbo_save('tokA', current_date, '{"result":{"done":true,"pack":true,"attempts":2,"secs":20}}'::jsonb);
select pg_temp.t('voltou e concluiu com 2 tentativas: leva o pacotinho', (select count(*)=1 from awards where source='turbo'));
delete from awards where source='turbo'; delete from turbo_days;

-- validações (cada uma deve falhar)
do $$ begin perform public.student_turbo_save('tokA', current_date+5, '{}'::jsonb); perform pg_temp.t('dia fora da janela deve falhar', false); exception when others then perform pg_temp.t('dia fora da janela falha', sqlerrm='data_invalida', sqlerrm); end $$;
do $$ begin perform public.student_turbo_save('tokA', current_date, '[]'::jsonb); perform pg_temp.t('payload que não é objeto deve falhar', false); exception when others then perform pg_temp.t('payload inválido falha', sqlerrm='dados_invalidos', sqlerrm); end $$;
do $$ begin perform public.student_turbo_save('tokA', current_date, '{"facts":[{"id":"x:1:1","s":1}]}'::jsonb); perform pg_temp.t('id de fato inválido deve falhar', false); exception when others then perform pg_temp.t('id de fato inválido falha (check)', sqlstate='23514', sqlerrm); end $$;
do $$ begin perform public.student_turbo_save('tokA', current_date, '{"facts":[{"id":"+:1:1","s":9}]}'::jsonb); perform pg_temp.t('estado fora de 0..5 deve falhar', false); exception when others then perform pg_temp.t('estado fora de 0..5 falha', sqlstate='23514', sqlerrm); end $$;
do $$ begin perform public.student_turbo_save('tokX', current_date, '{}'::jsonb); perform pg_temp.t('token inválido deve falhar', false); exception when others then perform pg_temp.t('token inválido falha', sqlerrm='token_invalido', sqlerrm); end $$;
do $$ declare big jsonb; begin select jsonb_build_object('facts', jsonb_agg(jsonb_build_object('id','+:1:1','s',1))) into big from generate_series(1,81); perform public.student_turbo_save('tokA', current_date, big); perform pg_temp.t('mais de 80 fatos deve falhar', false); exception when others then perform pg_temp.t('mais de 80 fatos falha', sqlerrm='dados_invalidos', sqlerrm); end $$;

-- dia de descanso: sem pacotinho
update students set study_days='{}', free_days='{}' where token='tokA';
delete from awards where source='turbo'; delete from turbo_days;
select public.student_turbo_save('tokA', current_date, '{"result":{"done":true,"pack":true,"attempts":8}}'::jsonb);
select pg_temp.t('dia de descanso: sem pacotinho', (select count(*)=0 from awards where source='turbo'));
update students set study_days='{0,1,2,3,4,5,6}' where token='tokA';

-- permissões
set role anon;
do $$ begin perform count(*) from public.turbo_facts; perform pg_temp.t('anon lê turbo_facts (não deveria)', false); exception when insufficient_privilege then perform pg_temp.t('anon sem acesso direto às tabelas', true); end $$;
reset role;
set role authenticated; select set_config('app.uid','00000000-0000-0000-0000-00000000000a',false);
select pg_temp.t('adulto A vê os fatos do aluno A', (select count(*) from turbo_facts)=2);
select pg_temp.t('adulto A vê o histórico do aluno A (3 linhas)', (select count(*)=3 from turbo_log));
select pg_temp.t('adulto A vê tentativas? (não)', true) where false;
do $$ begin perform count(*) from turbo_attempts; perform pg_temp.t('adulto A sem policy de tentativas: 0 linhas', (select count(*) from turbo_attempts)=0); end $$;
insert into turbo_students(student_id, unlocked, age) values ('00000000-0000-0000-0000-0000000000a1', '{soma,sub}', 8) on conflict (student_id) do update set unlocked=excluded.unlocked, age=excluded.age;
select pg_temp.t('adulto A configura o próprio aluno', (select unlocked='{soma,sub}' and age=8 from turbo_students));
do $$ begin insert into turbo_students(student_id) values ('00000000-0000-0000-0000-0000000000b1'); perform pg_temp.t('adulto A inserindo aluno de B (não deveria)', false); exception when others then perform pg_temp.t('adulto A não configura aluno de outro adulto', sqlstate in ('42501','23505'), sqlstate); end $$;
do $$ begin update turbo_students set placement='{"x":1}'::jsonb; perform pg_temp.t('adulto atualizando placement (não deveria)', false); exception when insufficient_privilege then perform pg_temp.t('adulto não altera o nivelamento (coluna sem permissão)', true); end $$;
do $$ begin update turbo_facts set state=5; perform pg_temp.t('adulto atualizando fatos (não deveria)', false); exception when insufficient_privilege then perform pg_temp.t('adulto não escreve em turbo_facts', true); end $$;
select pg_temp.t('adulto A: resumo mínimo', (select (r->'ops'->'soma'->>'registered')::int=1 and (r->'ops'->'mult'->>'registered')::int=1 and r->'stubborn'='["×:6:7"]'::jsonb and r->'slowest'->>0='×:6:7' from (select public.adult_turbo_summary('00000000-0000-0000-0000-0000000000a1', current_date) r) x));
select set_config('app.uid','00000000-0000-0000-0000-00000000000b',false);
select pg_temp.t('adulto B não vê fatos do aluno A', (select count(*) from turbo_facts)=0);
select pg_temp.t('adulto B não vê o histórico do aluno A', (select count(*)=0 from turbo_log where student_id='00000000-0000-0000-0000-0000000000a1'));
select pg_temp.t('adulto B recebe resumo vazio do aluno A', (select r->'ops'='{}'::jsonb and r->>'today' is null from (select public.adult_turbo_summary('00000000-0000-0000-0000-0000000000a1', current_date) r) x));
select set_config('app.admin','1',false);
select pg_temp.t('admin lê as tentativas (3)', (select count(*) from turbo_attempts)=3);
select pg_temp.t('visão v_turbo_uso para o admin', (select count(*)>=1 from v_turbo_uso));
reset role; select set_config('app.admin','',false);
set role authenticated; select pg_temp.t('sem ser admin, v_turbo_uso vem vazia', (select count(*)=0 from v_turbo_uso)); reset role;

-- apagar o aluno: dados do aluno somem, tentativas ficam anonimizadas
delete from students where token='tokA';
select pg_temp.t('apagar aluno: remove fatos, dias e config', (select count(*) from turbo_facts)=0 and (select count(*) from turbo_days)=(select count(*) from turbo_days where student_id is not null) and (select count(*) from turbo_students where student_id='00000000-0000-0000-0000-0000000000a1')=0);
select pg_temp.t('apagar aluno: tentativas ficam sem student_id', (select count(*)=3 and bool_and(student_id is null) from turbo_attempts));
select pg_temp.t('apagar aluno: o histórico dele some', (select count(*)=0 from turbo_log where student_id='00000000-0000-0000-0000-0000000000a1'));

select case when ok then 'ok    ' else 'FALHOU' end||' | '||nome||case when detalhe<>'' and not ok then ' ['||detalhe||']' else '' end from res order by ok, nome;
select 'TOTAL: '||count(*)||' verificações, '||count(*) filter (where not ok)||' falha(s)' from res;
