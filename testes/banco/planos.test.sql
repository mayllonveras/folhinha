\set ON_ERROR_STOP 0
\pset tuples_only on
create temp table res(nome text, ok boolean, detalhe text);
grant all on res to public;
create function pg_temp.t(n text, c boolean, d text default '') returns void language sql as $$ insert into res values (n, coalesce(c,false), d) $$;
-- roda o comando e devolve 'ok' ou a mensagem de erro
create function pg_temp.err(q text) returns text language plpgsql as $$ begin execute q; return 'ok'; exception when others then return sqlerrm; end $$;
create function pg_temp.como(u text) returns void language sql as $$ select set_config('app.uid', coalesce(u,''), false) $$;
create function pg_temp.aluno(nome text, temas text) returns text language sql as $$
  select format('select public.create_student(p_name => %L, p_level => 0, p_start => current_date - 1, p_days => ''{0,1,2,3,4,5,6}'', p_per_day => 5, p_close => 0, p_goal => 0, p_reward => '''', p_themes => %L::text[], p_free => ''{}'', p_consent => true)', nome, temas) $$;
create function pg_temp.sid(nome text) returns uuid language sql as $$ select id from students where name = nome $$;
create function pg_temp.tok(nome text) returns void language sql as $$
  insert into student_sessions(token_hash, student_id) values (encode(extensions.digest('tok-'||nome, 'sha256'), 'hex'), pg_temp.sid(nome)) $$;

-- contas: F (teste vencido = Grátis), V (VIP vitalício), N (conta nova, no teste), A (administrador)
insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-0000000000f1', 'gratis@teste.local'),
  ('00000000-0000-0000-0000-0000000000b1', 'vip@teste.local'),
  ('00000000-0000-0000-0000-0000000000c1', 'nova@teste.local'),
  ('00000000-0000-0000-0000-0000000000ad', 'gradematic@gmail.com');
insert into auth.users(id, email, raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000e1', 'prof@teste.local', '{"role":"professor","name":"Prof"}');

-- ---------- teste, Fundador, quem é VIP ----------
select pg_temp.t('conta nova ganha o teste do VIP (14 dias)', (select count(*)=1 and bool_and(ends_at between now() + interval '13 days 23 hours' and now() + interval '14 days 1 hour') from entitlements where user_id='00000000-0000-0000-0000-0000000000c1' and source='teste'));
select pg_temp.t('conta nova é VIP no teste', public._is_vip('00000000-0000-0000-0000-0000000000c1'));
select pg_temp.t('cadastro de professor segue funcionando (perfil e teste)', (select role='professor' from profiles where id='00000000-0000-0000-0000-0000000000e1') and public._is_vip('00000000-0000-0000-0000-0000000000e1'));
select pg_temp.t('conta antiga ganha Fundador de 3 meses e não ganha teste',
  (select count(*)=1 and bool_and(source='fundador' and ends_at between now() + interval '89 days' and now() + interval '93 days') from entitlements where user_id='00000000-0000-0000-0000-00000000a000'));
select pg_temp.t('adult_plan da conta antiga: fundador, VIP', (select (r->>'fundador')::boolean and (r->>'vip')::boolean and r->>'source'='fundador' from (select public._plan_info('00000000-0000-0000-0000-00000000a000') r) x));
select pg_temp.t('conta sem login não lê adult_plan', (select pg_temp.como(null)) is null and pg_temp.err('select public.adult_plan()') like '%nao_autenticado%');

-- F: teste vencido
update entitlements set starts_at = now() - interval '20 days', ends_at = now() - interval '6 days' where user_id='00000000-0000-0000-0000-0000000000f1';
select pg_temp.t('teste vencido = Grátis', not public._is_vip('00000000-0000-0000-0000-0000000000f1') and public._vip_until('00000000-0000-0000-0000-0000000000f1') is null);
select pg_temp.como('00000000-0000-0000-0000-0000000000f1');
select pg_temp.t('adult_plan do Grátis: 1 aluno, limites', (select not (r->>'vip')::boolean and (r->>'max_students')::int=1 and (r->>'trial_used')::boolean and (r->'limits'->>'folhas_gratis')::int=2 from (select public.adult_plan() r) x));

-- ---------- administrador: dar e tirar VIP ----------
select pg_temp.t('quem não é administrador não dá VIP', pg_temp.err($$select public.admin_grant_vip('vip@teste.local', null)$$) like '%sem_permissao%');
select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select pg_temp.t('admin dá VIP vitalício', (select (r->>'lifetime')::boolean and r->>'until' is null and r->>'source'='concessao' from (select public.admin_grant_vip('VIP@teste.local', null, null, 'teste') r) x));
select pg_temp.t('e-mail sem conta é recusado', pg_temp.err($$select public.admin_grant_vip('ninguem@teste.local', 30)$$) like '%conta_nao_encontrada%');
select pg_temp.t('dias fora do limite são recusados', pg_temp.err($$select public.admin_grant_vip('gratis@teste.local', 0)$$) like '%dias_invalidos%');
select public.admin_grant_vip('gratis@teste.local', 30) as g1 \gset
select pg_temp.t('admin dá 30 dias', (:'g1'::jsonb->>'until')::timestamptz between now() + interval '29 days 23 hours' and now() + interval '30 days 1 hour');
select public.admin_grant_vip('gratis@teste.local', 30) as g2 \gset
select pg_temp.t('mais 30 dias somam a partir do fim do VIP atual', (:'g2'::jsonb->>'until')::timestamptz between now() + interval '59 days 23 hours' and now() + interval '60 days 1 hour');
select pg_temp.t('admin_overview mostra o plano das contas', (select bool_and(a ? 'plan' and a ? 'ents') from jsonb_array_elements(public.admin_overview()->'accounts') a) and (public.admin_overview()->'totals'->>'vip')::int >= 3);
select public.admin_revoke_vip((:'g1'::jsonb->>'id')::uuid);
select public.admin_revoke_vip((:'g2'::jsonb->>'id')::uuid);
select pg_temp.t('revogar as concessões volta para o Grátis', not public._is_vip('00000000-0000-0000-0000-0000000000f1'));
select pg_temp.t('revogar duas vezes é recusado', pg_temp.err(format('select public.admin_revoke_vip(%L)', :'g1'::jsonb->>'id')) like '%concessao_invalida%');

-- ---------- alunos por conta ----------
select pg_temp.como('00000000-0000-0000-0000-0000000000f1');
select pg_temp.t('Grátis cadastra o 1º aluno', pg_temp.err(pg_temp.aluno('Fabi', '{espaco}'))='ok');
select pg_temp.t('Grátis não cadastra o 2º aluno', pg_temp.err(pg_temp.aluno('Fabi2', '{espaco}')) like '%plano_alunos%');
select pg_temp.como('00000000-0000-0000-0000-0000000000c1');
select pg_temp.t('no teste, cadastro com 2 álbuns passa', pg_temp.err(pg_temp.aluno('Nina', '{espaco,pets}'))='ok');
select pg_temp.como('00000000-0000-0000-0000-0000000000b1');
select pg_temp.t('VIP cadastra 4 alunos', pg_temp.err(pg_temp.aluno('Vivi', '{espaco,pets}'))='ok' and pg_temp.err(pg_temp.aluno('Vito', '{dinossauros}'))='ok'
  and pg_temp.err(pg_temp.aluno('Vera', '{espaco}'))='ok' and pg_temp.err(pg_temp.aluno('Vane', '{espaco}'))='ok');
select pg_temp.t('VIP não cadastra o 5º aluno', pg_temp.err(pg_temp.aluno('Vick', '{espaco}')) like '%plano_alunos%');
select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select public.admin_grant_vip('vip@teste.local', 365, 10);
select pg_temp.como('00000000-0000-0000-0000-0000000000b1');
select pg_temp.t('concessão com limite de 10 alunos libera o 5º', pg_temp.err(pg_temp.aluno('Vick', '{espaco}'))='ok' and (public.adult_plan()->>'max_students')::int=10);

-- ---------- álbuns no Grátis ----------
select pg_temp.t('Grátis não libera um 2º álbum', pg_temp.err($$update students set sticker_themes='{espaco,pets}' where name='Fabi'$$) like '%plano_albuns%');
select pg_temp.t('Grátis pode trocar o álbum', pg_temp.err($$update students set sticker_themes='{pets}' where name='Fabi'$$)='ok' and pg_temp.err($$update students set sticker_themes='{espaco}' where name='Fabi'$$)='ok');

select pg_temp.tok('Fabi'); select pg_temp.tok('Vivi'); select pg_temp.tok('Vito');

-- ---------- folhas do dia ----------
select pg_temp.t('student_me do Grátis: 2 folhas, sem VIP, álbum principal', (select (r->>'quota')::int=2 and not (r->>'vip')::boolean and r->>'free_album'='espaco' and (r->>'plan_sheets')::int=2 from (select public.student_me('tok-Fabi', current_date) r) x));
select pg_temp.t('student_me do VIP: as 5 folhas do programa', (select (r->>'quota')::int=5 and (r->>'vip')::boolean from (select public.student_me('tok-Vivi', current_date) r) x));
insert into sheets(student_id, level_idx, study_day, week_end, problems, status, finished_at)
  select pg_temp.sid('Fabi'), 0, current_date, current_date, '[]'::jsonb, 'done', now() from generate_series(1,2);
select pg_temp.t('Grátis: 3ª folha do dia é recusada', pg_temp.err($$select public.student_open_sheet('tok-Fabi', current_date, (select jsonb_agg(jsonb_build_object('a',1)) from generate_series(1,10)))$$) like '%meta_cumprida%');
insert into sheets(student_id, level_idx, study_day, week_end, problems, status, finished_at)
  select pg_temp.sid('Vivi'), 0, current_date, current_date, '[]'::jsonb, 'done', now() from generate_series(1,2);
select pg_temp.t('VIP: 3ª folha do dia abre', pg_temp.err($$select public.student_open_sheet('tok-Vivi', current_date, (select jsonb_agg(jsonb_build_object('a',1)) from generate_series(1,10)))$$)='ok');
select pg_temp.t('submit_sheet fecha o dia pela cota do plano', (select prosrc like '%done_n >= public._sheets_quota(s)%' and prosrc like '%''day_quota'', public._sheets_quota(s)%' and prosrc not like '%sheets_per_day%' from pg_proc where proname='student_submit_sheet'));
update app_settings set value = 3 where key = 'plano_folhas_gratis';
select pg_temp.t('o número de folhas do Grátis vem dos parâmetros', (public.student_me('tok-Fabi', current_date)->>'quota')::int=3);
update app_settings set value = 2 where key = 'plano_folhas_gratis';

-- ---------- pacotinhos ----------
select pg_temp.t('Grátis: carimbo, perseverança e Turbo não dão pacotinho', public._give_packs(pg_temp.sid('Fabi'), current_date, 'carimbo', 1)=0
  and public._give_packs(pg_temp.sid('Fabi'), current_date, 'perseveranca', 1)=0 and public._give_packs(pg_temp.sid('Fabi'), current_date, 'turbo', 1)=0);
select pg_temp.t('Grátis: marco dá pacotinho', public._give_packs(pg_temp.sid('Fabi'), current_date, 'marco', 2)=2);
select pg_temp.t('VIP: carimbo dá pacotinho', public._give_packs(pg_temp.sid('Vivi'), current_date, 'carimbo', 1)=1);
-- Fabi foi VIP com 2 álbuns e voltou ao Grátis: o pacotinho abre só no principal
select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select public.admin_grant_vip('gratis@teste.local', 1) as g3 \gset
update students set welcome_at = now() where name = 'Fabi';
update students set sticker_themes = '{espaco,pets}', desk_themes = '{espaco,pets}' where name = 'Fabi';
select public.admin_revoke_vip((:'g3'::jsonb->>'id')::uuid);
select pg_temp.t('Grátis: pacotinho no 2º álbum é recusado', pg_temp.err($$select public.student_open_pack('tok-Fabi', 'pets')$$) like '%plano_album%');
select pg_temp.t('Grátis: pacotinho no álbum principal abre', pg_temp.err($$select public.student_open_pack('tok-Fabi', 'espaco')$$)='ok');
select pg_temp.t('Grátis que tinha 2 álbuns pode ficar com 1', pg_temp.err($$update students set sticker_themes='{espaco}' where name='Fabi'$$)='ok');

-- ---------- amigos, trocas e Turbo ----------
select pg_temp.t('Grátis não convida amigo', pg_temp.err(format('select public.student_friend_invite(%L, %L)', 'tok-Fabi', (select friend_code from students where name='Vivi'))) like '%plano_vip%');
select pg_temp.t('VIP não convida amigo Grátis', pg_temp.err(format('select public.student_friend_invite(%L, %L)', 'tok-Vivi', (select friend_code from students where name='Fabi'))) like '%amigo_sem_vip%');
select pg_temp.t('VIP convida VIP', pg_temp.err(format('select public.student_friend_invite(%L, %L)', 'tok-Vivi', (select friend_code from students where name='Vito')))='ok');
select pg_temp.t('VIP aceita convite', pg_temp.err(format('select public.student_friend_answer(%L, %L, true)', 'tok-Vito', (select id from friendships where status='pendente' limit 1)))='ok');
insert into friendships(requester, addressee, status) values (pg_temp.sid('Vito'), pg_temp.sid('Fabi'), 'pendente');
select pg_temp.t('Grátis não aceita convite (destinatário)', pg_temp.err(format('select public.student_friend_answer(%L, %L, true)', 'tok-Fabi', (select id from friendships where addressee=pg_temp.sid('Fabi')))) like '%plano_vip%');
select pg_temp.t('Grátis pode recusar convite', pg_temp.err(format('select public.student_friend_answer(%L, %L, false)', 'tok-Fabi', (select id from friendships where addressee=pg_temp.sid('Fabi'))))='ok');
select pg_temp.t('Grátis não propõe troca', pg_temp.err(format('select public.student_trade_propose(%L, %L, ''[]'', ''[]'')', 'tok-Fabi', gen_random_uuid())) like '%plano_vip%');
insert into friendships(requester, addressee, status) values (pg_temp.sid('Vivi'), pg_temp.sid('Fabi'), 'aceita');
select pg_temp.t('VIP não propõe troca a amigo Grátis', pg_temp.err(format('select public.student_trade_propose(%L, %L, ''[]'', ''[]'')', 'tok-Vivi', (select id from friendships where addressee=pg_temp.sid('Fabi')))) like '%amigo_sem_vip%');
insert into trades(requester, addressee) values (pg_temp.sid('Vivi'), pg_temp.sid('Fabi'));
select pg_temp.t('Grátis não aceita troca', pg_temp.err(format('select public.student_trade_answer(%L, %L, true)', 'tok-Fabi', (select id from trades where addressee=pg_temp.sid('Fabi')))) like '%plano_vip%');
select pg_temp.t('Grátis pode recusar troca', pg_temp.err(format('select public.student_trade_answer(%L, %L, false)', 'tok-Fabi', (select id from trades where addressee=pg_temp.sid('Fabi'))))='ok');
select pg_temp.t('Grátis não abre a Turbo', pg_temp.err($$select public.student_turbo_get('tok-Fabi', current_date)$$) like '%plano_vip%'
  and pg_temp.err($$select public.student_turbo_save('tok-Fabi', current_date, '{}')$$) like '%plano_vip%');
select pg_temp.t('VIP abre a Turbo', pg_temp.err($$select public.student_turbo_get('tok-Vivi', current_date)$$)='ok');

-- ---------- parâmetros e permissões ----------
select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select pg_temp.err($$select public.admin_set_settings('{"plano_folhas_gratis":3,"plano_teste_dias":7}')$$) as eset \gset
select pg_temp.t('admin edita os números do plano', :'eset'='ok' and public.app_setting('plano_teste_dias', 0)=7, :'eset');
select pg_temp.t('admin não põe número fora do limite', pg_temp.err($$select public.admin_set_settings('{"plano_folhas_gratis":0}')$$) like '%valor_invalido%');
select pg_temp.t('ninguém de fora lê a tabela de planos', not has_table_privilege('authenticated', 'public.entitlements', 'select') and not has_table_privilege('anon', 'public.entitlements', 'select'));
select pg_temp.t('funções internas do plano não são chamáveis pela API', not has_function_privilege('authenticated', 'public._is_vip(uuid)', 'execute') and not has_function_privilege('anon', 'public._plan_info(uuid)', 'execute')
  and not has_function_privilege('anon', 'public._give_packs(uuid, date, text, int)', 'execute') and not has_function_privilege('authenticated', 'public._vip_until(uuid)', 'execute'));
select pg_temp.t('adult_plan e admin_* só para quem entrou', has_function_privilege('authenticated', 'public.adult_plan()', 'execute') and not has_function_privilege('anon', 'public.adult_plan()', 'execute')
  and not has_function_privilege('anon', 'public.admin_grant_vip(text, int, int, text)', 'execute'));
select pg_temp.t('funções do aluno alteradas continuam voláteis', (select bool_and(provolatile='v') from pg_proc where proname in ('student_me','student_open_sheet','student_start_sheet','student_submit_sheet','student_open_pack','student_friend_invite','student_friend_answer','student_trade_propose','student_trade_answer','student_turbo_get','student_turbo_save')));

select case when ok then 'ok    ' else 'FALHOU' end||' | '||nome||case when detalhe<>'' and not ok then ' ['||detalhe||']' else '' end from res order by ok, nome;
select 'TOTAL: '||count(*)||' verificações, '||count(*) filter (where not ok)||' falha(s)' from res;
