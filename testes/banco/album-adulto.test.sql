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
-- a criança abre n pacotinhos no álbum (ganha n pacotinhos de dias diferentes e abre)
create temp sequence dias;
create function pg_temp.abre(nome text, album text, n int) returns void language plpgsql as $$
declare i int; dia date;
begin
  for i in 1..n loop
    dia := current_date - nextval('pg_temp.dias')::int;   -- um dia novo a cada pacotinho (o índice não aceita dois no mesmo dia)
    perform public._give_packs(pg_temp.sid(nome), dia, 'carimbo', 1);
    perform public.student_open_pack(pg_temp.tok(nome), album);
  end loop;
end $$;
create function pg_temp.pend(sid uuid, album text default null) returns int language sql as $$
  select count(*)::int from awards where student_id = sid and kind = 'pacote' and (album is null or theme = album) $$;
create function pg_temp.espelho(nome text) returns uuid language sql as $$ select id from students where mirror_of = pg_temp.sid(nome) $$;
create function pg_temp.temp(nome text) returns text language sql as $$ select 'tok-esp-'||nome $$;

-- contas: P (pai, VIP no teste), F (Grátis, teste vencido), X (outro adulto, sem relação)
insert into auth.users(id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'pai@teste.local', '{"role":"pai","name":"Maria Silva"}'),
  ('00000000-0000-0000-0000-0000000000f1', 'gratis@teste.local', '{"role":"pai","name":"Fátima"}'),
  ('00000000-0000-0000-0000-0000000000b1', 'outro@teste.local', '{"role":"pai","name":"Outro"}');
insert into auth.users(id, email, email_confirmed_at) values ('00000000-0000-0000-0000-0000000000ad', 'gradematic@gmail.com', now());
update entitlements set starts_at = now() - interval '20 days', ends_at = now() - interval '6 days' where user_id='00000000-0000-0000-0000-0000000000f1';

select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.err(pg_temp.aluno('Ana', '{espaco,pets}')) as e1 \gset
select pg_temp.err(pg_temp.aluno('Beto', '{espaco}')) as e2 \gset
select pg_temp.t('alunos de teste cadastrados', :'e1'='ok' and :'e2'='ok', :'e1'||'/'||:'e2');
select pg_temp.sessao('Ana'); select pg_temp.sessao('Beto');
-- a Ana já fez o primeiro acesso, com o álbum espaco na mesa
update students set welcome_at = now(), desk_themes = '{espaco}' where id = pg_temp.sid('Ana');

-- ---------- ligar a opção ----------
select pg_temp.t('antes de ligar não existe espelho', (select count(*)=0 from students where mirror_of is not null));
select pg_temp.abre('Ana', 'espaco', 3);
select pg_temp.t('a criança abriu 3 figurinhas', (select count(*)=3 from awards where student_id=pg_temp.sid('Ana') and kind='figurinha' and theme='espaco'));
select pg_temp.t('conta de abertas: 3', public._opens_of(pg_temp.sid('Ana'), 'espaco')=3);

select pg_temp.como('00000000-0000-0000-0000-0000000000b1');
select pg_temp.t('outro adulto não liga', pg_temp.err(format('select public.adult_mirror_enable(%L)', pg_temp.sid('Ana'))) like '%sem_permissao%');
select pg_temp.t('outro adulto não vê o estado', pg_temp.err(format('select public.adult_mirror_info(%L)', pg_temp.sid('Ana'))) like '%sem_permissao%');
select pg_temp.t('outro adulto não entra', pg_temp.err(format('select public.adult_mirror_enter(%L)', pg_temp.sid('Ana'))) like '%sem_permissao%');
select pg_temp.como(null);
select pg_temp.t('sem login não liga', pg_temp.err(format('select public.adult_mirror_enable(%L)', pg_temp.sid('Ana'))) like '%sem_permissao%');

select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.t('antes de ligar: info diz que não existe', (select not (r->>'exists')::boolean and not (r->>'active')::boolean and (r->>'vip')::boolean and r->>'default_name'='Maria Silva' from (select public.adult_mirror_info(pg_temp.sid('Ana')) r) x));
select pg_temp.t('entrar sem ter ligado é recusado', pg_temp.err(format('select public.adult_mirror_enter(%L)', pg_temp.sid('Ana'))) like '%espelho_inexistente%');
select pg_temp.t('nome vazio usa o nome do perfil', (select r->>'name'='Maria Silva' from (select public.adult_mirror_enable(pg_temp.sid('Ana'), '   ') r) x));
select pg_temp.t('o espelho existe, ativo, escondido e ligado à criança', (select count(*)=1 and bool_and(mirror_active and mirror_user='00000000-0000-0000-0000-0000000000a1') from students where mirror_of = pg_temp.sid('Ana')));
select pg_temp.t('o espelho não aparece para nenhum adulto (sem guardians)', (select count(*)=0 from guardians where student_id = pg_temp.espelho('Ana')) and not public.is_guardian(pg_temp.espelho('Ana')));
select pg_temp.t('catch-up: 3 pacotinhos do mesmo álbum', pg_temp.pend(pg_temp.espelho('Ana'))=3 and pg_temp.pend(pg_temp.espelho('Ana'), 'espaco')=3);
select pg_temp.t('catch-up registrado', (select n=3 from mirror_delivered where mirror_id=pg_temp.espelho('Ana') and theme='espaco'));
select pg_temp.t('pacotinhos do espelho têm origem espelho', (select bool_and(source='espelho') from awards where student_id=pg_temp.espelho('Ana') and kind='pacote'));
select pg_temp.t('amizade já aceita entre criança e espelho', (select count(*)=1 and bool_and(status='aceita') from friendships where pg_temp.sid('Ana') in (requester, addressee) and pg_temp.espelho('Ana') in (requester, addressee)));
select pg_temp.t('ligar de novo não entrega de novo', (select (r->>'delivered')::int=0 and (r->>'packs')::int=3 from (select public.adult_mirror_enable(pg_temp.sid('Ana'), 'Maria') r) x) and (select count(*)=1 from students where mirror_of = pg_temp.sid('Ana')));
select pg_temp.t('ligar de novo troca o nome', (select name='Maria' from students where id=pg_temp.espelho('Ana')));

-- ---------- a criança vê o responsável como amigo ----------
select pg_temp.t('a criança lista o responsável com a marca', (select count(*)=1 and bool_and((f->>'mirror')::boolean) from jsonb_array_elements(public.student_friends(pg_temp.tok('Ana'))->'friends') f));
select pg_temp.t('adult_friends marca o responsável', (select count(*)=1 and bool_and((f->>'mirror')::boolean) from jsonb_array_elements(public.adult_friends(pg_temp.sid('Ana'))->'friends') f));
select id as fid from friendships where pg_temp.sid('Ana') in (requester, addressee) limit 1 \gset
select pg_temp.t('a criança não desfaz a amizade com o responsável', pg_temp.err(format('select public.student_friend_remove(%L, %L)', pg_temp.tok('Ana'), :'fid')) like '%amizade_do_responsavel%');
select pg_temp.t('o painel também não desfaz por aqui', pg_temp.err(format('select public.adult_friend_remove(%L, %L)', pg_temp.sid('Ana'), :'fid')) like '%amizade_do_responsavel%');
select pg_temp.t('a amizade continua', (select count(*)=1 from friendships where id = :'fid'));
select pg_temp.t('a criança vê o álbum do responsável como amigo', (select (v->>'mirror')::boolean and v->>'name'='Maria' from (select public.student_friend_view(pg_temp.tok('Ana'), :'fid') v) x));

-- ---------- entrar no álbum do responsável ----------
select public.adult_mirror_enter(pg_temp.sid('Ana')) as ent \gset
select (:'ent'::jsonb)->>'token' as mtok \gset
select pg_temp.t('entrar devolve link e sessão', (:'ent'::jsonb)->>'code' is not null and length(:'mtok')=64);
select pg_temp.t('a sessão do espelho enxerga o próprio álbum', (select (r->>'mirror')::boolean and r->>'mirror_child'='Ana' and (r->>'pending_packs')::int=3 and (r->'pending_by_theme'->>'espaco')::int=3 and r->'sticker_themes' @> '"espaco"' from (select public.student_me(:'mtok', current_date) r) x));
select pg_temp.t('o link do espelho não deixa criar PIN', (select r->>'error'='pin_ja_definido' from (select public.student_set_pin((select link_code from students where id=pg_temp.espelho('Ana')), '1234') r) x));
select pg_temp.t('nem entrar com PIN chutado', (select (r->>'ok')::boolean is false from (select public.student_login((select link_code from students where id=pg_temp.espelho('Ana')), '0000') r) x));
select pg_temp.t('a criança comum não vê o campo mirror ligado', (select not (r->>'mirror')::boolean and r->'pending_by_theme'='{}'::jsonb from (select public.student_me(pg_temp.tok('Ana'), current_date) r) x));

-- ---------- o responsável abre o pacotinho do mesmo álbum ----------
select pg_temp.t('abrir pacotinho do álbum certo', (select r->>'kind'='figurinha' and r->>'theme'='espaco' and (r->>'pending')::int=2 from (select public.student_open_pack(:'mtok', 'espaco') r) x));
select pg_temp.t('álbum sem pacotinho: não abre', pg_temp.err(format('select public.student_open_pack(%L, %L)', :'mtok', 'pets')) like '%sem_pacote%');
select pg_temp.t('álbum que o espelho não tem: recusado', pg_temp.err(format('select public.student_open_pack(%L, %L)', :'mtok', 'bandeiras')) like '%album_invalido%');
select pg_temp.t('abrir não gera pacotinho para ninguém', pg_temp.pend(pg_temp.sid('Ana'))=0 and pg_temp.pend(pg_temp.espelho('Ana'))=2);

-- ---------- daqui em diante, cada abertura da criança dá 1 pacotinho ao espelho ----------
select pg_temp.abre('Ana', 'espaco', 2);
select pg_temp.t('criança abriu 5 no total, espelho recebeu 5 (abriu 1, restam 4)', public._opens_of(pg_temp.sid('Ana'),'espaco')=5 and pg_temp.pend(pg_temp.espelho('Ana'),'espaco')=4 and (select n=5 from mirror_delivered where mirror_id=pg_temp.espelho('Ana') and theme='espaco'));
-- segundo álbum da criança: o pacotinho do espelho vem do álbum certo e o álbum entra no espelho
update students set desk_themes = '{pets}' where id = pg_temp.sid('Ana');
select pg_temp.abre('Ana', 'pets', 1);
select pg_temp.t('abrir em outro álbum: o espelho ganha desse álbum', pg_temp.pend(pg_temp.espelho('Ana'),'pets')=1 and pg_temp.pend(pg_temp.espelho('Ana'),'espaco')=4);
select pg_temp.t('o álbum novo entra nos álbuns do espelho', (select sticker_themes @> '{pets}' from students where id=pg_temp.espelho('Ana')));
select pg_temp.t('o espelho abre o pacotinho do 2º álbum sem mesa', (select r->>'theme'='pets' from (select public.student_open_pack(:'mtok', 'pets') r) x));

-- ---------- o sorteio do espelho é independente: dá repetida e dá para trocar ----------
-- cenário controlado: a criança tem 2 cópias da figurinha 10, o espelho tem 2 da 11; cada um não tem a do outro
select slot as s1 from generate_series(0,51) g(slot) where not exists(select 1 from sticker_rarity r where r.theme='espaco' and r.slot=g.slot) order by slot limit 1 \gset
select slot as s2 from generate_series(0,51) g(slot) where not exists(select 1 from sticker_rarity r where r.theme='espaco' and r.slot=g.slot) and slot <> :s1 order by slot limit 1 \gset
delete from awards where kind='figurinha' and theme='espaco' and slot in (:s1, :s2) and student_id in (pg_temp.sid('Ana'), pg_temp.espelho('Ana'));
create function pg_temp.dar(sid uuid, sl int, n int) returns void language plpgsql as $$
declare i int;
begin
  for i in 1..n loop
    insert into awards(student_id, kind, theme, slot, period_mode, period_start, period_end, earned_day, source, seq)
      values (sid, 'figurinha', 'espaco', sl, 'diario', current_date, current_date, current_date, 'carimbo', 5000 + sl * 10 + i + (random()*1000000)::int);
  end loop;
end $$;
select public._opens_of(pg_temp.sid('Ana'), 'espaco') as o1 \gset
select pg_temp.dar(pg_temp.sid('Ana'), :s1, 2); select pg_temp.dar(pg_temp.espelho('Ana'), :s2, 2);
select pg_temp.t('opções de troca do espelho: dá a dele, recebe a da criança', (select (o->'give'->0->>'slot')::int=:s2 and (o->'get'->0->>'slot')::int=:s1 from (select public.student_trade_options(:'mtok', :'fid') o) x));
select public.student_trade_propose(:'mtok', :'fid', jsonb_build_array(jsonb_build_object('theme','espaco','slot',:s2)), jsonb_build_array(jsonb_build_object('theme','espaco','slot',:s1))) as tr \gset
select pg_temp.t('o espelho propõe a troca por valor', (:'tr'::jsonb)->>'id' is not null);
select pg_temp.t('a criança tem o pedido para responder', (select jsonb_array_length(public.student_trades(pg_temp.tok('Ana'))->'incoming')=1));
select public.student_trade_answer(pg_temp.tok('Ana'), ((:'tr'::jsonb)->>'id')::uuid, true) as ans \gset
select pg_temp.t('a criança aceita e a troca acontece', (:'ans'::jsonb)->>'state'='aceita'
  and (select count(*)=1 from awards where student_id=pg_temp.sid('Ana') and kind='figurinha' and theme='espaco' and slot=:s2 and traded_from = pg_temp.espelho('Ana'))
  and (select count(*)=1 from awards where student_id=pg_temp.espelho('Ana') and kind='figurinha' and theme='espaco' and slot=:s1));
-- as 2 cópias da cena entraram direto (não vieram de pacotinho): só elas mexem na conta; a troca em si é neutra
select pg_temp.t('trocar não muda a conta de figurinhas abertas', public._opens_of(pg_temp.sid('Ana'),'espaco') = :o1 + 2, public._opens_of(pg_temp.sid('Ana'),'espaco')::text||' vs '||:o1);
update mirror_delivered set n = public._opens_of(pg_temp.sid('Ana'),'espaco') where mirror_id=pg_temp.espelho('Ana') and theme='espaco';   -- as cópias da cena não valem pacotinho

-- ---------- desligar e religar ----------
select public.adult_mirror_disable(pg_temp.sid('Ana'));
select pg_temp.t('desligar: sem amizade e inativo', (select count(*)=0 from friendships where pg_temp.espelho('Ana') in (requester, addressee)) and (select not mirror_active from students where id=pg_temp.espelho('Ana')));
select pg_temp.t('desligar: guarda as figurinhas e os pacotes', (select count(*)>0 from awards where student_id=pg_temp.espelho('Ana')));
select pg_temp.t('desligar duas vezes é inofensivo', pg_temp.err(format('select public.adult_mirror_disable(%L)', pg_temp.sid('Ana')))='ok');
update students set desk_themes = '{espaco}' where id = pg_temp.sid('Ana');
select pg_temp.pend(pg_temp.espelho('Ana'),'espaco') as p0 \gset
select pg_temp.abre('Ana', 'espaco', 2);
select pg_temp.t('desligado: o espelho não recebe', pg_temp.pend(pg_temp.espelho('Ana'),'espaco')=:p0);
select public.adult_mirror_enable(pg_temp.sid('Ana')) as re \gset
select pg_temp.t('religar entrega só o que ficou faltando (2)', ((:'re'::jsonb)->>'delivered')::int=2 and pg_temp.pend(pg_temp.espelho('Ana'),'espaco')=:p0 + 2, :'re');
select pg_temp.t('religar refaz a amizade', (select count(*)=1 and bool_and(status='aceita') from friendships where pg_temp.espelho('Ana') in (requester, addressee)));

-- ---------- plano: sem VIP não liga nem entrega; quando volta, a conta fecha ----------
select pg_temp.como('00000000-0000-0000-0000-0000000000f1');
select pg_temp.err(pg_temp.aluno('Gabi', '{espaco}')) as e3 \gset
select pg_temp.t('Grátis não liga a opção', pg_temp.err(format('select public.adult_mirror_enable(%L)', pg_temp.sid('Gabi'))) like '%plano_vip%');
-- Caio foi cadastrado por outra conta VIP (B) e o pai P também o acompanha: o plano do Caio é o de B; o do espelho é o de P
select pg_temp.como('00000000-0000-0000-0000-0000000000b1');
select pg_temp.err(pg_temp.aluno('Caio', '{espaco}')) as e4 \gset
select pg_temp.sessao('Caio');
update students set welcome_at = now(), desk_themes = '{espaco}' where id = pg_temp.sid('Caio');
insert into guardians(student_id, user_id, role) values (pg_temp.sid('Caio'), '00000000-0000-0000-0000-0000000000a1', 'member');
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select public.adult_mirror_enable(pg_temp.sid('Caio')) as ec \gset
select pg_temp.t('segundo responsável também liga o dele', ((:'ec'::jsonb)->>'active')::boolean);
select pg_temp.como('00000000-0000-0000-0000-0000000000b1');
select public.adult_mirror_enable(pg_temp.sid('Caio'), 'Papai') as ec2 \gset
select pg_temp.t('cada responsável tem o seu espelho', (select count(*)=2 from students where mirror_of=pg_temp.sid('Caio')));
select pg_temp.t('a criança vê os dois responsáveis como amigos', (select count(*)=2 from jsonb_array_elements(public.student_friends(pg_temp.tok('Caio'))->'friends') f where (f->>'mirror')::boolean));
select pg_temp.abre('Caio', 'espaco', 2);
select pg_temp.t('os dois espelhos recebem a mesma quantidade', (select bool_and(pg_temp.pend(id,'espaco')=2) and count(*)=2 from students where mirror_of=pg_temp.sid('Caio')));
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
update entitlements set starts_at = now() - interval '30 days', ends_at = now() - interval '1 day' where user_id='00000000-0000-0000-0000-0000000000a1';
select pg_temp.t('conta do pai P voltou ao Grátis', not public._is_vip('00000000-0000-0000-0000-0000000000a1'));
select pg_temp.abre('Caio', 'espaco', 2);
select pg_temp.t('sem VIP o espelho de P não ganha pacotinho novo (o do B ganha)',
  (select pg_temp.pend(id,'espaco')=2 from students where mirror_of=pg_temp.sid('Caio') and mirror_user='00000000-0000-0000-0000-0000000000a1')
  and (select pg_temp.pend(id,'espaco')=4 from students where mirror_of=pg_temp.sid('Caio') and mirror_user='00000000-0000-0000-0000-0000000000b1'));
select pg_temp.t('sem VIP o que já foi entregue continua abrindo', (select r->>'kind'='figurinha' from (select public.student_open_pack((select token from (select public.adult_mirror_enter(pg_temp.sid('Caio'))->>'token' token) q), 'espaco') r) x));
insert into entitlements(user_id, source, starts_at, ends_at) values ('00000000-0000-0000-0000-0000000000a1', 'concessao', now() - interval '1 hour', null);
select pg_temp.abre('Caio', 'espaco', 1);
-- a criança abriu 5 no total (2 + 2 + 1); P recebeu 2, abriu 1 e agora recebe os 3 que faltavam: restam 1 + 3 = 4
select pg_temp.t('VIP de volta: a próxima abertura entrega o que ficou faltando',
  (select pg_temp.pend(id,'espaco')=4 and (select n=5 from mirror_delivered where mirror_id=students.id and theme='espaco') from students where mirror_of=pg_temp.sid('Caio') and mirror_user='00000000-0000-0000-0000-0000000000a1'),
  (select pg_temp.pend(id,'espaco')::text from students where mirror_of=pg_temp.sid('Caio') and mirror_user='00000000-0000-0000-0000-0000000000a1'));
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');

-- ---------- álbum completo do espelho não recebe mais ----------
select pg_temp.espelho('Beto') is null as sem_espelho_beto \gset
select public.adult_mirror_enable(pg_temp.sid('Beto'), 'Maria do Beto') as eb \gset
select pg_temp.t('Beto ainda não abriu nada: espelho sem pacotes', pg_temp.pend(pg_temp.espelho('Beto'))=0 and ((:'eb'::jsonb)->>'delivered')::int=0);
-- boas-vindas: 10 figurinhas de uma vez dão 10 pacotinhos do mesmo álbum ao espelho
select public.student_welcome(pg_temp.tok('Beto')) as wel \gset
select pg_temp.t('pacote de boas-vindas da criança: 10 viram 10 pacotinhos do espelho', pg_temp.pend(pg_temp.espelho('Beto'),'espaco')=10, pg_temp.pend(pg_temp.espelho('Beto'),'espaco')::text);
select pg_temp.t('boas-vindas contam como abertas', public._opens_of(pg_temp.sid('Beto'),'espaco')=10);
-- completa o álbum do espelho (52 diferentes): para de receber
delete from awards where student_id=pg_temp.espelho('Beto') and kind='pacote';
delete from mirror_delivered where mirror_id=pg_temp.espelho('Beto');
select pg_temp.dar(pg_temp.espelho('Beto'), g, 1) from generate_series(0,51) g;
select pg_temp.t('espelho com álbum completo', (select count(distinct slot)=52 from awards where student_id=pg_temp.espelho('Beto') and kind='figurinha' and theme='espaco'));
update students set desk_themes='{espaco}', sticker_themes='{espaco}' where id=pg_temp.sid('Beto');
select pg_temp.abre('Beto', 'espaco', 1);
select pg_temp.t('álbum completo do espelho: não entrega pacotinho', pg_temp.pend(pg_temp.espelho('Beto'))=0);

-- ---------- responsável removido: o espelho dele para ----------
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select count(*) as pc0 from awards where student_id = (select id from students where mirror_of=pg_temp.sid('Caio') and mirror_user='00000000-0000-0000-0000-0000000000a1') and kind='pacote' \gset
delete from guardians where student_id=pg_temp.sid('Caio') and user_id='00000000-0000-0000-0000-0000000000a1';
select pg_temp.t('removido: espelho inativo e sem amizade', (select not mirror_active from students where mirror_of=pg_temp.sid('Caio') and mirror_user='00000000-0000-0000-0000-0000000000a1')
  and (select count(*)=0 from friendships f join students m on m.id in (f.requester,f.addressee) where m.mirror_user='00000000-0000-0000-0000-0000000000a1' and m.mirror_of=pg_temp.sid('Caio')));
select pg_temp.t('removido: o outro responsável segue ligado', (select mirror_active from students where mirror_of=pg_temp.sid('Caio') and mirror_user='00000000-0000-0000-0000-0000000000b1'));
select pg_temp.abre('Caio', 'espaco', 1);
select pg_temp.t('removido: não recebe mais pacotinho e guarda o que tinha', (select count(*)=:pc0 from awards where student_id=(select id from students where mirror_of=pg_temp.sid('Caio') and mirror_user='00000000-0000-0000-0000-0000000000a1') and kind='pacote'));
select pg_temp.t('removido: não entra mais no álbum', pg_temp.err(format('select public.adult_mirror_enter(%L)', pg_temp.sid('Caio'))) like '%sem_permissao%');

-- ---------- o adulto convida um amigo para a criança ----------
select pg_temp.como('00000000-0000-0000-0000-0000000000b1');
select pg_temp.err(pg_temp.aluno('Duda', '{espaco}')) as e5 \gset
select friend_code as fcd from students where id = pg_temp.sid('Duda') \gset
select public.adult_friend_invite(pg_temp.sid('Caio'), :'fcd') as inv \gset
select pg_temp.t('adulto convida pelo código: fica pendente', (:'inv'::jsonb)->>'state'='enviado' and (select count(*)=1 from friendships where requester=pg_temp.sid('Caio') and addressee=pg_temp.sid('Duda') and status='pendente'));
select pg_temp.t('convite repetido é recusado', pg_temp.err(format('select public.adult_friend_invite(%L, %L)', pg_temp.sid('Caio'), :'fcd')) like '%convite_pendente%');
select pg_temp.t('código do espelho não vale', pg_temp.err(format('select public.adult_friend_invite(%L, %L)', pg_temp.sid('Duda'), (select friend_code from students where mirror_of=pg_temp.sid('Caio') limit 1))) like '%codigo_invalido%');
select pg_temp.t('código inexistente é recusado', pg_temp.err(format('select public.adult_friend_invite(%L, %L)', pg_temp.sid('Caio'), 'ZZZZZZ')) like '%codigo_invalido%');
select pg_temp.t('o próprio código é recusado', pg_temp.err(format('select public.adult_friend_invite(%L, %L)', pg_temp.sid('Caio'), (select friend_code from students where id=pg_temp.sid('Caio')))) like '%proprio_codigo%');
select pg_temp.como('00000000-0000-0000-0000-0000000000f1');
select pg_temp.t('quem não é responsável não convida', pg_temp.err(format('select public.adult_friend_invite(%L, %L)', pg_temp.sid('Caio'), :'fcd')) like '%sem_permissao%');

-- ---------- convites e administração ----------
select friend_code as fcm from students where id = pg_temp.espelho('Ana') \gset
select pg_temp.t('outra criança não consegue convidar o espelho pelo código', pg_temp.err(format('select public.student_friend_invite(%L, %L)', pg_temp.tok('Beto'), :'fcm')) like '%codigo_invalido%');
select pg_temp.t('o espelho não convida crianças', pg_temp.err(format('select public.student_friend_invite(%L, %L)', :'mtok', (select friend_code from students where id=pg_temp.sid('Beto')))) like '%sem_permissao%');
select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select pg_temp.t('admin_overview não conta o espelho como aluno', (public.admin_overview()->'totals'->>'students')::int = (select count(*) from students where mirror_of is null)
  and (select count(*) from jsonb_array_elements(public.admin_overview()->'students') s) = (select count(*) from students where mirror_of is null));

-- ---------- apagar a criança leva o espelho junto ----------
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.err(format('select public.delete_student(%L)', pg_temp.sid('Beto'))) as del \gset
select pg_temp.t('apagar a criança apaga o espelho dela', :'del'='ok' and (select count(*)=0 from students where name in ('Beto') or mirror_of is not null and mirror_of not in (select id from students)), :'del');
select pg_temp.t('e os pacotes dele', (select count(*)=0 from awards a where not exists(select 1 from students s where s.id=a.student_id)));
select pg_temp.t('funções internas fechadas para a API', not has_function_privilege('authenticated','public._mirror_sync(uuid, text)','execute') and not has_function_privilege('anon','public._opens_of(uuid, text)','execute')
  and not has_function_privilege('authenticated','public.awards_mirror_fanout()','execute'));
select pg_temp.t('funções do painel só para quem entrou', has_function_privilege('authenticated','public.adult_mirror_enable(uuid, text)','execute') and not has_function_privilege('anon','public.adult_mirror_enter(uuid)','execute'));
select pg_temp.t('mirror_delivered sem acesso direto pela API', not has_table_privilege('authenticated','public.mirror_delivered','select') and not has_table_privilege('anon','public.mirror_delivered','select'));
select pg_temp.t('funções do aluno alteradas continuam voláteis', (select bool_and(provolatile='v') from pg_proc where proname in ('student_me','student_open_pack','student_friends','student_friend_view','student_friend_remove','student_friend_invite')));

select case when ok then 'ok    ' else 'FALHOU' end||' | '||nome||case when detalhe<>'' and not ok then ' ['||detalhe||']' else '' end from res order by ok, nome;
select 'TOTAL: '||count(*)||' verificações, '||count(*) filter (where not ok)||' falha(s)' from res;
