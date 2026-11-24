\set ON_ERROR_STOP 0
\pset tuples_only on
create temp table res(nome text, ok boolean, detalhe text);
grant all on res to public;
create function pg_temp.t(n text, c boolean, d text default '') returns void language sql as $$ insert into res values (n, coalesce(c,false), d) $$;
create function pg_temp.err(q text) returns text language plpgsql as $$ begin execute q; return 'ok'; exception when others then return sqlerrm; end $$;
create function pg_temp.como(u text) returns void language sql as $$ select set_config('app.uid', coalesce(u,''), false) $$;
create function pg_temp.aluno(nome text, temas text) returns text language sql as $$
  select format('select public.create_student(p_name => %L, p_level => 0, p_start => current_date - 1, p_days => ''{0,1,2,3,4,5,6}'', p_per_day => 5, p_close => 0, p_goal => 0, p_reward => '''', p_themes => %L::text[], p_free => ''{}'', p_consent => true)', nome, temas) $$;
create function pg_temp.sid(nome text) returns uuid language sql as $$ select id from students where name = nome and mirror_of is null $$;
create function pg_temp.tok(nome text) returns text language sql as $$ select 'tok-'||nome $$;
create function pg_temp.sessao(nome text) returns void language sql as $$
  insert into student_sessions(token_hash, student_id) values (encode(extensions.digest('tok-'||nome, 'sha256'), 'hex'), pg_temp.sid(nome)) $$;
-- dá n cópias de uma figurinha (direto na tabela; cada cópia com um número de ordem novo)
create temp sequence ordem;
create function pg_temp.da(nome text, album text, slot int, n int default 1) returns void language plpgsql as $$
declare i int;
begin
  for i in 1..n loop
    insert into awards(student_id, kind, theme, slot, period_mode, period_start, period_end, earned_at, earned_day, source, seq)
      values (pg_temp.sid(nome), 'figurinha', album, slot, 'diario', current_date - 1, current_date - 1, now() - (nextval('pg_temp.ordem') || ' minutes')::interval, current_date - 1, 'carimbo', nextval('pg_temp.ordem')::int);
  end loop;
end $$;
-- a criança abre n pacotinhos no álbum (um pacotinho de dia novo por abertura: o índice não aceita dois no mesmo dia)
create temp sequence dias;
create function pg_temp.abre(nome text, album text) returns jsonb language plpgsql as $$
begin
  perform public._give_packs(pg_temp.sid(nome), current_date - nextval('pg_temp.dias')::int, 'carimbo', 1);
  return public.student_open_pack(pg_temp.tok(nome), album);
end $$;

insert into auth.users(id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'pai@teste.local', '{"role":"pai","name":"Maria Silva"}');
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.err(pg_temp.aluno('Ana', '{bandeiras}')) as e1 \gset
select pg_temp.err(pg_temp.aluno('Beto', '{bandeiras,pets}')) as e2 \gset
select pg_temp.t('alunos de teste cadastrados', :'e1'='ok' and :'e2'='ok', :'e1'||'/'||:'e2');
select pg_temp.sessao('Ana'); select pg_temp.sessao('Beto');
update students set welcome_at = now(), desk_themes = '{bandeiras}' where id = pg_temp.sid('Ana');

-- Bandeiras: ultras = 0, 11, 34; raras = 12, 17, 18, 19, 20; as outras 44 são comuns
select pg_temp.t('valor na troca: comum 1, rara 4, ultra 12',
  public._tier_value('bandeiras', 30) = 1 and public._tier_value('bandeiras', 12) = 4 and public._tier_value('bandeiras', 0) = 12);

-- sorteio por peso: 20.000 sorteios (esperado: ultra ~0,65%, rara ~3,3%, cada comum ~2,2%)
create temp table sorteio as select public._draw_slot(pg_temp.sid('Ana'), 'bandeiras') s from generate_series(1, 20000);
select count(*) filter (where s in (0, 11, 34)) as n_ultra, count(*) filter (where s in (12, 17, 18, 19, 20)) as n_rara,
       (count(*) filter (where s not in (0, 11, 34, 12, 17, 18, 19, 20)))::numeric / 44 as por_comum from sorteio \gset
select pg_temp.t('ultra é rara: ~0,65% dos sorteios (não 5%)', :n_ultra between 60 and 230, :n_ultra::text);
select pg_temp.t('rara: ~3,3% dos sorteios (não 25%)', :n_rara between 450 and 900, :n_rara::text);
select pg_temp.t('por carta: ultra e rara saem bem menos que uma comum', (:n_ultra / 3.0) < :por_comum / 4 and (:n_rara / 5.0) < :por_comum / 2, :n_ultra||'/'||:n_rara||'/'||:por_comum);
select pg_temp.t('só cartas de 0 a 51', (select min(s) >= 0 and max(s) <= 51 from sorteio));

-- os pesos ajustam sem migração
update app_settings set value = 100 where key = 'peso_rara';
select (count(*) filter (where s in (12, 17, 18, 19, 20)))::numeric / 2000 as f_rara from (select public._draw_slot(pg_temp.sid('Ana'), 'bandeiras') s from generate_series(1, 2000)) q \gset
select pg_temp.t('peso_rara alto: quase só raras', :f_rara > 0.8, :f_rara::text);
update app_settings set value = 0.30 where key = 'peso_rara';

-- filtros do sorteio
select pg_temp.t('só rara, evitando 12 e 17, sem ter nenhuma: sai 18, 19 ou 20', (select bool_and(s in (18, 19, 20)) from (select public._draw_slot(pg_temp.sid('Ana'), 'bandeiras', 'rara', '{12,17}', true) s from generate_series(1, 200)) q));

-- proteção contra azar: 60 pacotinhos sem rara -> a próxima é uma rara que falta; cada uma diferente
update students set sem_rara = 60 where id = pg_temp.sid('Ana');
select pg_temp.abre('Ana', 'bandeiras') as p1 \gset
select pg_temp.t('com 60 sem rara, o pacotinho traz uma rara', :'p1'::jsonb->>'tier' = 'rara', :'p1');
select pg_temp.t('e o contador volta a zero', (select sem_rara = 0 from students where id = pg_temp.sid('Ana')));
do $$ begin for i in 1..4 loop update students set sem_rara = 60 where id = pg_temp.sid('Ana'); perform pg_temp.abre('Ana', 'bandeiras'); end loop; end $$;
select pg_temp.t('5 forçadas = as 5 raras diferentes', (select count(distinct slot) = 5 and bool_and(slot in (12, 17, 18, 19, 20)) from awards where student_id = pg_temp.sid('Ana') and kind = 'figurinha'));
-- já tem as 5 raras: a proteção não força repetida (o contador segue subindo enquanto sair comum)
update students set sem_rara = 60 where id = pg_temp.sid('Ana');
select pg_temp.abre('Ana', 'bandeiras') as p2 \gset
select pg_temp.t('sem rara faltando, nada é forçado (carta qualquer, sem erro)', :'p2'::jsonb->>'kind' = 'figurinha');
select pg_temp.t('contador coerente: zera se saiu rara/ultra, senão soma 1', (select sem_rara = case when :'p2'::jsonb->>'tier' in ('rara','ultra') then 0 else 61 end from students where id = pg_temp.sid('Ana')), :'p2');
-- desligada
update app_settings set value = 0 where key = 'pity_rara';
update students set sem_rara = 5000 where id = pg_temp.sid('Ana');
select pg_temp.t('pity_rara = 0 desliga a proteção (abre sem erro)', pg_temp.err(format('select pg_temp.abre(%L, %L)', 'Ana', 'bandeiras')) = 'ok');
update app_settings set value = 60 where key = 'pity_rara';

-- boas-vindas: 10 de um álbum só, sem repetida, pelo menos 1 rara, contador zerado
update students set sem_rara = 30 where id = pg_temp.sid('Beto');
select public.student_welcome(pg_temp.tok('Beto'), '{bandeiras}') as w \gset
select pg_temp.t('boas-vindas: 10 figurinhas, todas diferentes', (select count(*) = 10 and count(distinct slot) = 10 from awards where student_id = pg_temp.sid('Beto') and kind = 'figurinha' and source = 'boas_vindas'), :'w');
select pg_temp.t('boas-vindas: pelo menos 1 rara', (select count(*) >= 1 from jsonb_array_elements(:'w'::jsonb->'stickers') e where e->>'tier' = 'rara'));
select pg_temp.t('boas-vindas: zera o contador de azar', (select sem_rara = 0 from students where id = pg_temp.sid('Beto')));
select pg_temp.t('boas-vindas: só uma vez', pg_temp.err(format('select public.student_welcome(%L, %L)', pg_temp.tok('Beto'), '{bandeiras}'::text)) like '%ja_recebeu%');

-- bordas
select pg_temp.t('_draw_slot e coluna sem_rara fechadas para a API', not has_function_privilege('anon', 'public._draw_slot(uuid, text, text, int[], boolean)', 'execute')
  and not has_function_privilege('authenticated', 'public._draw_slot(uuid, text, text, int[], boolean)', 'execute'));
select pg_temp.t('funções do aluno continuam voláteis', (select bool_and(provolatile = 'v') from pg_proc where proname in ('student_open_pack', 'student_welcome')));
select pg_temp.t('parâmetros semeados', (select count(*) = 3 from app_settings where key in ('peso_rara', 'peso_ultra', 'pity_rara')));

select case when ok then 'ok    ' else 'FALHOU' end||' | '||nome||case when detalhe<>'' and not ok then ' ['||detalhe||']' else '' end from res order by ok, nome;
select 'TOTAL: '||count(*)||' verificações, '||count(*) filter (where not ok)||' falha(s)' from res;
