\set ON_ERROR_STOP 0
\pset tuples_only on
create temp table res(nome text, ok boolean, detalhe text);
grant all on res to public;
create function pg_temp.t(n text, c boolean, d text default '') returns void language sql as $$ insert into res values (n, coalesce(c,false), d) $$;
create function pg_temp.err(q text) returns text language plpgsql as $$ begin execute q; return 'ok'; exception when others then return sqlerrm; end $$;
create function pg_temp.como(u text) returns void language sql as $$ select set_config('app.uid', coalesce(u,''), false) $$;
-- usa um cupom como a conta u e devolve o motivo da recusa ('ok' quando deu certo)
create function pg_temp.usa(u text, k text) returns text language plpgsql as $$
declare r jsonb; begin perform pg_temp.como(u); r := public.adult_redeem_coupon(k); return case when (r->>'ok')::boolean then 'ok' else r->>'why' end; end $$;

insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-0000000000ad', 'gradematic@gmail.com'),
  ('00000000-0000-0000-0000-0000000000a1', 'a@teste.local'),
  ('00000000-0000-0000-0000-0000000000a2', 'b@teste.local'),
  ('00000000-0000-0000-0000-0000000000a3', 'c@teste.local'),
  ('00000000-0000-0000-0000-0000000000a4', 'd@teste.local');
-- a1 e a2 sem teste (Grátis), para ver o VIP do cupom
delete from entitlements where user_id in ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2');

-- ---------- /adm cria cupons ----------
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.t('quem não é administrador não cria cupom', pg_temp.err($$select public.admin_save_coupon('{"code":"X123","kind":"meses","value":1}')$$) like '%sem_permissao%');
select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select pg_temp.t('cria cupom de 3 meses', pg_temp.err($$select public.admin_save_coupon('{"code":"tres-meses","kind":"meses","value":3}')$$)='ok');
select pg_temp.t('código fica em maiúsculas', exists(select 1 from coupons where code='TRES-MESES'));
select pg_temp.t('cria cupom vitalício', pg_temp.err($$select public.admin_save_coupon('{"code":"AMIGO-VIP","kind":"vitalicio","max_uses":1,"note":"parceria"}')$$)='ok');
select pg_temp.t('cria Black Friday 50% na 1ª cobrança do anual', pg_temp.err(format($$select public.admin_save_coupon('{"code":"BLACKFRIDAY50","kind":"percentual","value":50,"plans":"anual","cycles":1,"valid_from":"%s","valid_until":"%s"}')$$, now() - interval '1 day', now() + interval '10 days'))='ok');
select pg_temp.t('cria desconto de R$ 10 para sempre', pg_temp.err($$select public.admin_save_coupon('{"code":"DEZ","kind":"valor","value":10}')$$)='ok');
select pg_temp.t('cria cupom vencido', pg_temp.err(format($$select public.admin_save_coupon('{"code":"VELHO","kind":"meses","value":1,"valid_until":"%s"}')$$, now() - interval '1 day'))='ok');
select pg_temp.t('cria cupom que ainda não começou', pg_temp.err(format($$select public.admin_save_coupon('{"code":"FUTURO","kind":"meses","value":1,"valid_from":"%s"}')$$, now() + interval '1 day'))='ok');
select pg_temp.t('cria cupom só para contas novas', pg_temp.err($$select public.admin_save_coupon('{"code":"NOVOS","kind":"percentual","value":20,"only_new":true}')$$)='ok');
select pg_temp.t('recusa percentual acima de 100', pg_temp.err($$select public.admin_save_coupon('{"code":"DEMAIS","kind":"percentual","value":150}')$$) like '%coupons_check%');
select pg_temp.t('recusa código com espaço ou curto', pg_temp.err($$select public.admin_save_coupon('{"code":"a b","kind":"meses","value":1}')$$) like '%cupom_codigo_invalido%');
select pg_temp.t('texto do Black Friday', (select text='50% de desconto na 1ª cobrança do plano anual' from jsonb_to_recordset(public.admin_coupons()) x(code text, text text) where code='BLACKFRIDAY50'));
select pg_temp.t('texto do desconto em reais', (select text='R$ 10,00 de desconto em todas as cobranças' from jsonb_to_recordset(public.admin_coupons()) x(code text, text text) where code='DEZ'));

-- ---------- pais usam cupons ----------
select pg_temp.t('conta sem login não usa cupom', (select pg_temp.como(null)) is null and pg_temp.err($$select public.adult_redeem_coupon('DEZ')$$) like '%nao_autenticado%');
select pg_temp.usa('00000000-0000-0000-0000-0000000000a1', ' tres meses ') as r0 \gset
select pg_temp.usa('00000000-0000-0000-0000-0000000000a1', 'tres-meses') as r1 \gset
select pg_temp.t('cupom de 3 meses dá VIP na hora (código com espaço no lugar do hífen é outro)', :'r0'='cupom_invalido' and :'r1'='ok' and public._is_vip('00000000-0000-0000-0000-0000000000a1'), :'r0'||' '||:'r1');
select pg_temp.t('3 meses a partir de agora', (select ends_at between now() + interval '89 days' and now() + interval '93 days' and source='cupom' from entitlements where user_id='00000000-0000-0000-0000-0000000000a1'));
select pg_temp.t('mesmo cupom duas vezes é recusado', pg_temp.usa('00000000-0000-0000-0000-0000000000a1', 'TRES-MESES')='cupom_ja_usado');
select pg_temp.usa('00000000-0000-0000-0000-0000000000a2', 'amigo-vip') as r \gset
select pg_temp.t('vitalício dá VIP para sempre', :'r'='ok' and (public._plan_info('00000000-0000-0000-0000-0000000000a2')->>'lifetime')::boolean, :'r');
select pg_temp.t('vitalício com limite de 1 uso esgota', pg_temp.usa('00000000-0000-0000-0000-0000000000a3', 'AMIGO-VIP')='cupom_esgotado');
select pg_temp.t('cupom vencido é recusado', pg_temp.usa('00000000-0000-0000-0000-0000000000a3', 'VELHO')='cupom_fora_do_prazo');
select pg_temp.t('cupom que não começou é recusado', pg_temp.usa('00000000-0000-0000-0000-0000000000a3', 'FUTURO')='cupom_fora_do_prazo');
select pg_temp.usa('00000000-0000-0000-0000-0000000000a3', 'BLACKFRIDAY50') as r \gset
select pg_temp.t('desconto fica guardado para a assinatura', :'r'='ok'
  and (select status='reservado' from coupon_redemptions where code='BLACKFRIDAY50' and user_id='00000000-0000-0000-0000-0000000000a3'));
select pg_temp.usa('00000000-0000-0000-0000-0000000000a3', 'DEZ') as r \gset
select pg_temp.t('desconto novo substitui o guardado', :'r'='ok'
  and (select status='cancelado' from coupon_redemptions where code='BLACKFRIDAY50' and user_id='00000000-0000-0000-0000-0000000000a3')
  and (select count(*)=1 from coupon_redemptions where user_id='00000000-0000-0000-0000-0000000000a3' and status='reservado'));
select pg_temp.como('00000000-0000-0000-0000-0000000000a3');
select pg_temp.t('adult_coupons mostra só o desconto valendo', (select count(*)=1 and bool_and(code='DEZ' and status='reservado') from jsonb_to_recordset(public.adult_coupons()) x(code text, status text)));
insert into entitlements(user_id, source, ends_at) values ('00000000-0000-0000-0000-0000000000a4', 'assinatura', now() + interval '30 days');
select pg_temp.t('quem já assinou não usa cupom só de contas novas', pg_temp.usa('00000000-0000-0000-0000-0000000000a4', 'NOVOS')='cupom_so_novos');
select pg_temp.t('conta nova usa cupom só de contas novas', pg_temp.usa('00000000-0000-0000-0000-0000000000a2', 'NOVOS')='ok');

-- cupom de meses soma a partir do fim do VIP atual (a4 tem assinatura por 30 dias)
select pg_temp.usa('00000000-0000-0000-0000-0000000000a4', 'TRES-MESES') as r \gset
select pg_temp.t('meses somam a partir do fim do VIP', :'r'='ok'
  and (select ends_at > now() + interval '115 days' from entitlements where user_id='00000000-0000-0000-0000-0000000000a4' and source='cupom'));

-- ---------- tentativa e erro ----------
select pg_temp.usa('00000000-0000-0000-0000-0000000000a2', 'CHUTE' || g) from generate_series(1, 10) g;
select pg_temp.t('10 códigos errados em 1 hora bloqueiam', pg_temp.usa('00000000-0000-0000-0000-0000000000a2', 'DEZ')='cupom_muitas_tentativas');
update coupon_attempts set at = now() - interval '2 hours';
select pg_temp.t('depois de 1 hora volta a aceitar', pg_temp.usa('00000000-0000-0000-0000-0000000000a2', 'DEZ')='ok');

-- ---------- /adm altera cupons ----------
select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select pg_temp.t('cupom usado não muda de valor', pg_temp.err($$select public.admin_save_coupon('{"code":"DEZ","kind":"valor","value":20}')$$) like '%cupom_em_uso%');
select pg_temp.err($$select public.admin_save_coupon('{"code":"DEZ","max_uses":100,"note":"ok"}')$$) as r \gset
select pg_temp.t('cupom usado muda validade e limite', :'r'='ok' and (select max_uses=100 from coupons where code='DEZ'));
select pg_temp.err($$select public.admin_save_coupon('{"code":"FUTURO","value":2}')$$) as r \gset
select pg_temp.t('cupom sem uso muda de valor', :'r'='ok' and (select value=2 from coupons where code='FUTURO'));
select public.admin_set_coupon_active('dez', false);
select pg_temp.t('cupom desativado é recusado', pg_temp.usa('00000000-0000-0000-0000-0000000000a1', 'DEZ')='cupom_invalido');
select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select pg_temp.t('admin_coupons conta os usos', (select uses=2 and reserved=2 from jsonb_to_recordset(public.admin_coupons()) x(code text, uses int, reserved int) where code='DEZ'));

-- ---------- permissões ----------
select pg_temp.t('ninguém de fora lê as tabelas de cupom', not has_table_privilege('authenticated', 'public.coupons', 'select') and not has_table_privilege('anon', 'public.coupon_redemptions', 'select')
  and not has_table_privilege('authenticated', 'public.coupon_attempts', 'insert'));
select pg_temp.t('funções de cupom só para quem entrou', has_function_privilege('authenticated', 'public.adult_redeem_coupon(text)', 'execute')
  and not has_function_privilege('anon', 'public.adult_redeem_coupon(text)', 'execute') and not has_function_privilege('anon', 'public.admin_save_coupon(jsonb)', 'execute'));

select case when ok then 'ok    ' else 'FALHOU' end||' | '||nome||case when detalhe<>'' and not ok then ' ['||detalhe||']' else '' end from res order by ok, nome;
select 'TOTAL: '||count(*)||' verificações, '||count(*) filter (where not ok)||' falha(s)' from res;
