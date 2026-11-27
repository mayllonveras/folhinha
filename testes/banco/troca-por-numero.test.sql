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
create function pg_temp.copias(nome text, album text, slot int) returns int language sql as $$
  select count(*)::int from awards where student_id = pg_temp.sid(nome) and kind = 'figurinha' and theme = album and slot = $3 $$;
create function pg_temp.amigos(a text, b text) returns uuid language sql as $$
  insert into friendships(id, requester, addressee, status, created_at, answered_at)
    values (gen_random_uuid(), pg_temp.sid(a), pg_temp.sid(b), 'aceita', now(), now()) returning id $$;

insert into auth.users(id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'pai@teste.local', '{"role":"pai","name":"Maria Silva"}');
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
-- Ana: Gatinhos e cachorrinhos (pets) e Espaço | Beto: Bandeiras | Caio: Bandeiras e pets
select pg_temp.err(pg_temp.aluno('Ana', '{pets,espaco}')) as e1 \gset
select pg_temp.err(pg_temp.aluno('Beto', '{bandeiras}')) as e2 \gset
select pg_temp.err(pg_temp.aluno('Caio', '{bandeiras,pets}')) as e3 \gset
select pg_temp.t('alunos de teste cadastrados', :'e1'='ok' and :'e2'='ok' and :'e3'='ok', :'e1'||'/'||:'e2'||'/'||:'e3');
select pg_temp.sessao('Ana'); select pg_temp.sessao('Beto'); select pg_temp.sessao('Caio');
-- mesas: Ana só pets (espaço fica na gaveta), Beto e Caio só bandeiras (o pets do Caio fica na gaveta)
update students set welcome_at = now(), desk_themes = '{pets}' where id = pg_temp.sid('Ana');
update students set welcome_at = now(), desk_themes = '{bandeiras}' where id = pg_temp.sid('Beto');
update students set welcome_at = now(), desk_themes = '{bandeiras}' where id = pg_temp.sid('Caio');
select pg_temp.t('mesas configuradas', (select desk_themes = '{pets}' from students where id = pg_temp.sid('Ana')) and (select desk_themes = '{bandeiras}' from students where id = pg_temp.sid('Caio')));
select pg_temp.amigos('Ana', 'Beto') as f_ab \gset
select pg_temp.amigos('Ana', 'Caio') as f_ac \gset

-- números escolhidos são comuns nos dois álbuns (30, 31, 32, 33); o 0 de Bandeiras é ultrarrara
select pg_temp.t('números 30 a 33 são comuns em pets e bandeiras', (select bool_and(public._tier_value(a, s) = 1) from unnest('{pets,bandeiras}'::text[]) a, generate_series(30,33) s));
select pg_temp.t('o nº 1 de Bandeiras (slot 0) vale 12', public._tier_value('bandeiras', 0) = 12);

-- Ana: pets nº30 e nº32 repetidas, espaço nº30 repetida (gaveta) | Beto: bandeiras nº31 e nº33 repetidas
select pg_temp.da('Ana', 'espaco', 30, 2); select pg_temp.da('Ana', 'pets', 30, 2); select pg_temp.da('Ana', 'pets', 32, 2); select pg_temp.da('Ana', 'pets', 36, 1);
select pg_temp.da('Beto', 'bandeiras', 31, 2); select pg_temp.da('Beto', 'bandeiras', 33, 2); select pg_temp.da('Beto', 'bandeiras', 35, 1); select pg_temp.da('Beto', 'bandeiras', 36, 2);

-- ---------- opções ----------
select public.student_trade_options(pg_temp.tok('Ana'), :'f_ab') as op \gset
select pg_temp.t('opções: dou pets nº30, que o Beto converte para bandeiras', :'op'::jsonb->'give' @> '[{"theme":"pets","slot":30,"to":["bandeiras"]}]'::jsonb, :'op');
select pg_temp.t('opções: dou nº32 também', :'op'::jsonb->'give' @> '[{"theme":"pets","slot":32,"to":["bandeiras"]}]'::jsonb);
select pg_temp.t('opções: não ofereço o pets nº36 (só 1 cópia)', not (:'op'::jsonb->'give' @> '[{"theme":"pets","slot":36}]'::jsonb));
select pg_temp.t('opções: repetida da gaveta (espaço nº30) pode ser dada', :'op'::jsonb->'give' @> '[{"theme":"espaco","slot":30,"to":["bandeiras"]}]'::jsonb);
select pg_temp.t('opções: posso pedir bandeiras nº31 e nº33 do Beto, que viram pets (a mesa da Ana)', :'op'::jsonb->'get' @> '[{"theme":"bandeiras","slot":31,"to":["pets"]}]'::jsonb and :'op'::jsonb->'get' @> '[{"theme":"bandeiras","slot":33,"to":["pets"]}]'::jsonb);
select pg_temp.t('opções: o espaço (gaveta da Ana) nunca é destino', not (:'op'::jsonb::text like '%espaco"]%') and (select count(*) = 0 from jsonb_array_elements(:'op'::jsonb->'get') x, jsonb_array_elements_text(x->'to') d where d = 'espaco'));
select pg_temp.t('opções: não pede bandeiras nº36 (a Ana já tem pets nº36)', not (:'op'::jsonb->'get' @> '[{"theme":"bandeiras","slot":36}]'::jsonb));

-- ---------- pedir a troca (sem VIP não, mas o pai é VIP no teste) ----------
-- 1 por 1: Ana dá pets nº30 (vira bandeiras nº30, comum, vale 1) e quer bandeiras nº31 (vira pets nº31? ela já tem o 31 em pets) -> convertida para espaço
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"pets","slot":30,"to":"bandeiras"}]', '[{"theme":"bandeiras","slot":36,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ab')) as r_ja_tem \gset
select pg_temp.t('não pede um número que já tem no álbum de destino (pets nº36)', :'r_ja_tem' like '%voce_ja_tem%', :'r_ja_tem');
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"pets","slot":30,"to":"pets"}]', '[{"theme":"bandeiras","slot":33,"to":"espaco"}]')$q$, pg_temp.tok('Ana'), :'f_ab')) as r_album \gset
select pg_temp.t('o Beto não tem o álbum pets: não dá para entregar nele', :'r_album' like '%album_invalido%', :'r_album');
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"pets","slot":30,"to":"bandeiras"}]', '[{"theme":"bandeiras","slot":33,"to":"espaco"}]')$q$, pg_temp.tok('Ana'), :'f_ab')) as r_gav \gset
select pg_temp.t('a Ana não recebe no espaço: ele está na gaveta dela', :'r_gav' like '%destino_fora_da_mesa%', :'r_gav');
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"pets","slot":30,"to":"bandeiras"}]', '[{"theme":"bandeiras","slot":33,"to":"pets"},{"theme":"bandeiras","slot":31,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ab')) as r_valor \gset
select pg_temp.t('valores diferentes (1 por 2) é recusado', :'r_valor' like '%valores_diferentes%', :'r_valor');
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"pets","slot":36,"to":"bandeiras"}]', '[{"theme":"bandeiras","slot":33,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ab')) as r_rep \gset
select pg_temp.t('carta sem repetida não pode ser dada', :'r_rep' like '%sem_repetida%', :'r_rep');
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"pets","slot":30,"to":"bandeiras"}]', '[{"theme":"bandeiras","slot":35,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ab')) as r_amg \gset
select pg_temp.t('o amigo só entrega repetida (bandeiras nº35 tem 1 cópia)', :'r_amg' like '%amigo_sem_repetida%', :'r_amg');
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"pets","slot":30,"to":"bandeiras"},{"theme":"espaco","slot":30,"to":"bandeiras"}]', '[{"theme":"bandeiras","slot":33,"to":"pets"},{"theme":"bandeiras","slot":31,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ab')) as r_dest \gset
select pg_temp.t('duas cartas não caem na mesma posição do mesmo álbum', :'r_dest' like '%item_repetido%', :'r_dest');
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"pets","slot":99,"to":"bandeiras"}]', '[{"theme":"bandeiras","slot":33,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ab')) as r_slot \gset
select pg_temp.t('posição fora de 0 a 51 é recusada', :'r_slot' like '%item_invalido%', :'r_slot');

-- a troca boa: Ana dá pets nº30 e nº32 (viram bandeiras nº30 e nº32) e recebe bandeiras nº31 e nº33 (viram pets nº31 e nº33)
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"pets","slot":30,"to":"bandeiras"},{"theme":"pets","slot":32,"to":"bandeiras"}]', '[{"theme":"bandeiras","slot":31,"to":"pets"},{"theme":"bandeiras","slot":33,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ab')) as r_ok \gset
select pg_temp.t('troca por número entre álbuns diferentes é pedida', :'r_ok' = 'ok', :'r_ok');
select id as tid from trades where requester = pg_temp.sid('Ana') and status = 'pendente' \gset
select pg_temp.t('itens guardam o álbum de destino', (select count(*)=2 and bool_and(to_theme = 'bandeiras') from trade_items where trade_id = :'tid' and side = 'give')
  and (select count(*)=2 from trade_items where trade_id = :'tid' and side = 'want' and to_theme = 'pets'));
select pg_temp.t('o Beto vê o pedido com o destino de cada carta', (select (v->'incoming'->0->'gives'->0->>'to') = 'bandeiras' and (v->'incoming'->0->'wants'->0->>'to') = 'pets' from (select public.student_trades(pg_temp.tok('Beto')) v) x));

-- cópias prometidas ficam reservadas: a Ana não oferece o nº30 de novo em outro pedido
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"pets","slot":30,"to":"bandeiras"}]', '[{"theme":"bandeiras","slot":31,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ab')) as r_res \gset
select pg_temp.t('cópia já prometida em pedido pendente fica reservada', :'r_res' like '%sem_repetida%' or :'r_res' like '%amigo_sem_repetida%', :'r_res');

-- ---------- aceitar ----------
select pg_temp.err(format('select public.student_trade_answer(%L, %L, true)', pg_temp.tok('Ana'), :'tid')) as r_quem \gset
select pg_temp.t('só quem recebeu responde', :'r_quem' like '%pedido_invalido%', :'r_quem');
select public.student_trade_answer(pg_temp.tok('Beto'), :'tid', true) as ans \gset
select pg_temp.t('o Beto aceita', :'ans'::jsonb->>'state' = 'aceita', :'ans');
select pg_temp.t('Beto: ganhou bandeiras nº30 e nº32', pg_temp.copias('Beto','bandeiras',30) = 1 and pg_temp.copias('Beto','bandeiras',32) = 1);
select pg_temp.t('Beto: deu bandeiras nº31 e nº33 (ficou com 1 de cada)', pg_temp.copias('Beto','bandeiras',31) = 1 and pg_temp.copias('Beto','bandeiras',33) = 1);
select pg_temp.t('Ana: ficou com 1 de pets nº30 e nº32 (a original) e nada de bandeiras', pg_temp.copias('Ana','pets',30) = 1 and pg_temp.copias('Ana','pets',32) = 1 and pg_temp.copias('Ana','bandeiras',30) = 0);
select pg_temp.t('Ana: recebeu pets nº31 e nº33 (convertidos para o álbum da mesa dela)', pg_temp.copias('Ana','pets',31) = 1 and pg_temp.copias('Ana','pets',33) = 1 and pg_temp.copias('Ana','bandeiras',31) = 0 and pg_temp.copias('Ana','espaco',31) = 0);
select pg_temp.t('as cartas recebidas guardam quem deu', (select count(*)=2 from awards where student_id = pg_temp.sid('Ana') and source = 'troca' and traded_from = pg_temp.sid('Beto'))
  and (select count(*)=2 from awards where student_id = pg_temp.sid('Beto') and source = 'troca' and traded_from = pg_temp.sid('Ana')));
select pg_temp.t('ninguém perdeu nem ganhou carta no total (4 cartas só mudaram de dono e de álbum)', (select count(*) from awards where kind = 'figurinha') = 14);
select pg_temp.t('a troca ficou aceita', (select status from trades where id = :'tid') = 'aceita');

-- pacotinhos abertos (conta do álbum do responsável): a troca não cria nem apaga abertura
select pg_temp.t('abertas de pets (Ana): 5 antes = 5 depois', public._opens_of(pg_temp.sid('Ana'), 'pets') = 5, public._opens_of(pg_temp.sid('Ana'), 'pets')::text);
select pg_temp.t('abertas de espaço (Ana): 2 (as que abriu)', public._opens_of(pg_temp.sid('Ana'), 'espaco') = 2, public._opens_of(pg_temp.sid('Ana'), 'espaco')::text);
select pg_temp.t('abertas de bandeiras (Beto): 7', public._opens_of(pg_temp.sid('Beto'), 'bandeiras') = 7, public._opens_of(pg_temp.sid('Beto'), 'bandeiras')::text);
select pg_temp.t('abertas: soma de todos os álbuns = cartas que existem', (select sum(public._opens_of(s.id, t)) from students s, unnest(s.sticker_themes) t where s.mirror_of is null) = 14 + 0, (select sum(public._opens_of(s.id, t)) from students s, unnest(s.sticker_themes) t where s.mirror_of is null)::text);

-- histórico
select pg_temp.t('histórico da Ana traz o destino', (select (h->0->'got'->0->>'to') = 'pets' and (h->0->'gave'->0->>'to') = 'bandeiras' from (select public.student_trade_history(pg_temp.tok('Ana')) h) x));
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.t('painel dos pais mostra a troca com destino', (select (h->0->'gave'->0->>'to') = 'bandeiras' from (select public.adult_trades(pg_temp.sid('Ana')) h) x));

-- ---------- mesmo álbum continua igual (sem "to") ----------
select pg_temp.da('Caio', 'bandeiras', 40, 2); select pg_temp.da('Beto', 'bandeiras', 41, 2);
select pg_temp.amigos('Beto', 'Caio') as f_bc \gset
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"bandeiras","slot":41}]', '[{"theme":"bandeiras","slot":40}]')$q$, pg_temp.tok('Beto'), :'f_bc')) as r_igual \gset
select pg_temp.t('mesmo álbum, sem to: pedido normal', :'r_igual' = 'ok', :'r_igual');
select pg_temp.t('mesmo álbum: to fica nulo no banco', (select bool_and(to_theme is null) from trade_items i join trades t on t.id = i.trade_id where t.requester = pg_temp.sid('Beto') and t.status = 'pendente'));
select id as tid2 from trades where requester = pg_temp.sid('Beto') and status = 'pendente' \gset
select public.student_trade_answer(pg_temp.tok('Caio'), :'tid2', true) as ans2 \gset
select pg_temp.t('mesmo álbum: aceita e as cartas trocam', :'ans2'::jsonb->>'state' = 'aceita' and pg_temp.copias('Caio','bandeiras',41) = 1 and pg_temp.copias('Beto','bandeiras',40) = 1 and pg_temp.copias('Caio','bandeiras',40) = 1);
select pg_temp.t('mesmo álbum: abertas de bandeiras (Caio) = 2', public._opens_of(pg_temp.sid('Caio'), 'bandeiras') = 2, public._opens_of(pg_temp.sid('Caio'), 'bandeiras')::text);

-- ---------- o destino pode ser escolhido entre vários álbuns; o pedido vale se o álbum escolhido não tiver o número ----------
select pg_temp.da('Caio', 'pets', 20, 2); select pg_temp.da('Ana', 'pets', 25, 1); select pg_temp.da('Ana', 'espaco', 25, 2); select pg_temp.da('Ana', 'espaco', 26, 2);
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"espaco","slot":25,"to":"bandeiras"}]', '[{"theme":"pets","slot":20,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ac')) as r_ac \gset
select pg_temp.t('Ana dá espaço nº25 (vira bandeiras do Caio) e quer pets nº20 dele (pets dela): comum por comum', public._tier_value('bandeiras',25) = public._tier_value('pets',20) and :'r_ac' = 'ok', :'r_ac');
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"espaco","slot":25,"to":"bandeiras"}]', '[{"theme":"pets","slot":20,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ac')) as r_ac2 \gset
select pg_temp.t('depois do pedido anterior a carta espaço nº25 já está reservada', :'r_ac2' like '%sem_repetida%' or :'r_ac2' like '%amigo_sem_repetida%', :'r_ac2');
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"espaco","slot":26,"to":"pets"}]', '[{"theme":"pets","slot":20,"to":"pets"}]')$q$, pg_temp.tok('Ana'), :'f_ac')) as r_ac3 \gset
select pg_temp.t('o pets do Caio está na gaveta dele: ele não recebe nele', :'r_ac3' like '%destino_fora_da_mesa%', :'r_ac3');

-- ---------- o pedido deixa de valer se, antes de aceitar, o destino já tem o número ----------
select id as tid3 from trades where requester = pg_temp.sid('Ana') and addressee = pg_temp.sid('Caio') and status = 'pendente' \gset
select pg_temp.da('Caio', 'bandeiras', 25, 1);
select public.student_trade_answer(pg_temp.tok('Caio'), :'tid3', true) as ans3 \gset
select pg_temp.t('ao aceitar, confere de novo: o Caio já ganhou o nº25 de bandeiras', :'ans3'::jsonb->>'state' = 'invalida' and :'ans3'::jsonb->>'why' = 'amigo_ja_tem', :'ans3');

-- ---------- se a mesa mudar antes de aceitar, o pedido deixa de valer ----------
select pg_temp.da('Beto', 'bandeiras', 44, 2); select pg_temp.da('Caio', 'bandeiras', 45, 2); select pg_temp.da('Beto', 'bandeiras', 45, 0);
select pg_temp.err(format($q$select public.student_trade_propose(%L, %L, '[{"theme":"bandeiras","slot":44}]', '[{"theme":"bandeiras","slot":45}]')$q$, pg_temp.tok('Beto'), :'f_bc')) as r_m1 \gset
select id as tid4 from trades where requester = pg_temp.sid('Beto') and addressee = pg_temp.sid('Caio') and status = 'pendente' \gset
update students set desk_themes = '{pets}' where id = pg_temp.sid('Caio');
select public.student_trade_answer(pg_temp.tok('Caio'), :'tid4', true) as ans4 \gset
select pg_temp.t('o Caio tirou bandeiras da mesa: ao aceitar, a troca não vale mais', :'r_m1' = 'ok' and :'ans4'::jsonb->>'state' = 'invalida' and :'ans4'::jsonb->>'why' = 'destino_fora_da_mesa', :'r_m1'||' '||:'ans4');

-- ---------- segurança ----------
select pg_temp.t('funções internas fechadas para a API', not has_function_privilege('authenticated','public._trade_problem(uuid, uuid, jsonb, jsonb, uuid)','execute') and not has_function_privilege('anon','public._trade_side(uuid, text)','execute')
  and not has_function_privilege('authenticated','public._opens_of(uuid, text)','execute'));
select pg_temp.t('funções da criança abertas para a API', has_function_privilege('anon','public.student_trade_options(text, uuid)','execute') and has_function_privilege('anon','public.student_trade_propose(text, uuid, jsonb, jsonb)','execute') and has_function_privilege('anon','public.student_trade_answer(text, uuid, boolean)','execute'));
select pg_temp.t('trade_items continua sem acesso direto', not has_table_privilege('anon','public.trade_items','select') and not has_table_privilege('authenticated','public.trade_items','select'));
select pg_temp.t('sem token, nada funciona', pg_temp.err(format('select public.student_trade_options(%L, %L)', 'tok-invalido', :'f_ab')) <> 'ok');
select pg_temp.t('amizade de outro não serve', pg_temp.err(format('select public.student_trade_options(%L, %L)', pg_temp.tok('Beto'), :'f_ac')) like '%amizade_invalida%');

select case when ok then 'ok    ' else 'FALHOU' end||' | '||nome||case when detalhe<>'' and not ok then ' ['||detalhe||']' else '' end from res order by ok, nome;
select 'TOTAL: '||count(*)||' verificações, '||count(*) filter (where not ok)||' falha(s)' from res;
