\set ON_ERROR_STOP 0
\pset tuples_only on
create temp table res(nome text, ok boolean, detalhe text);
grant all on res to public;
create function pg_temp.t(n text, c boolean, d text default '') returns void language sql as $$ insert into res values (n, coalesce(c,false), d) $$;
create function pg_temp.err(q text) returns text language plpgsql as $$ begin execute q; return 'ok'; exception when others then return sqlerrm; end $$;
create function pg_temp.como(u text) returns void language sql as $$ select set_config('app.uid', coalesce(u,''), false) $$;
-- aviso do Asaas sobre uma cobrança
create function pg_temp.pay(evid text, ev text, pid text, sub text, cus text, val numeric, due date, st text, url text default null) returns jsonb language sql as $$
  select public.billing_webhook(jsonb_build_object('id', evid, 'event', ev, 'dateCreated', now()::text,
    'payment', jsonb_build_object('id', pid, 'subscription', sub, 'customer', cus, 'value', val, 'dueDate', due::text, 'status', st,
                                  'billingType', 'PIX', 'invoiceUrl', coalesce(url, 'https://sandbox.asaas.com/i/' || pid)))) $$;

-- P = pai que paga com Pix (anual, com cupom de 50% na 1ª cobrança); C = pai que paga com cartão (mensal)
insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-0000000000ad', 'gradematic@gmail.com'),
  ('00000000-0000-0000-0000-0000000000b1', 'pix@teste.local'),
  ('00000000-0000-0000-0000-0000000000c1', 'cartao@teste.local');
delete from entitlements where user_id in ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c1');   -- sem teste: Grátis
select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select public.admin_save_coupon('{"code":"BLACKFRIDAY50","kind":"percentual","value":50,"plans":"anual","cycles":1}');
select public.admin_save_coupon('{"code":"DEZ","kind":"valor","value":10}');
select pg_temp.como('00000000-0000-0000-0000-0000000000b1');
select public.adult_redeem_coupon('BLACKFRIDAY50');

-- ---------- preço ----------
select pg_temp.t('preço do mensal sem cupom', (select (q->>'full')::numeric=24.90 and (q->>'first')::numeric=24.90 and q->>'coupon' is null from (select public.billing_quote('00000000-0000-0000-0000-0000000000b1', 'mensal') q) x));
select pg_temp.t('anual com 50% na 1ª cobrança', (select (q->>'full')::numeric=199 and (q->>'first')::numeric=99.50 and q->>'coupon'='BLACKFRIDAY50' and (q->>'cycles')::int=1 from (select public.billing_quote('00000000-0000-0000-0000-0000000000b1', 'anual') q) x));
select pg_temp.como('00000000-0000-0000-0000-0000000000c1');
select public.adult_redeem_coupon('DEZ');
select pg_temp.t('desconto em reais para sempre, sem passar do mínimo de R$ 5', (select (q->>'first')::numeric=14.90 and q->>'cycles' is null from (select public.billing_quote('00000000-0000-0000-0000-0000000000c1', 'mensal') q) x));
update coupons set value = 50 where code = 'DEZ';
select pg_temp.t('desconto maior que o preço cobra o mínimo de R$ 5', (public.billing_quote('00000000-0000-0000-0000-0000000000c1', 'mensal')->>'first')::numeric=5.00);
update coupons set value = 10 where code = 'DEZ';
select pg_temp.t('adult_billing mostra os preços com o cupom', (select (b->'quote'->'mensal'->>'first')::numeric=14.90 and b->'subscription'='null'::jsonb from (select public.adult_billing() b) x));

-- ---------- Pix/boleto: assinatura criada pela Edge Function ----------
select public.billing_set_customer('00000000-0000-0000-0000-0000000000b1', 'cus_pix');
select public.billing_start('00000000-0000-0000-0000-0000000000b1', 'anual', 'pix_boleto', 'cus_pix', null, 'sub_pix', 'https://sandbox.asaas.com/i/pay1',
  public.billing_quote('00000000-0000-0000-0000-0000000000b1', 'anual')) as st \gset
select pg_temp.t('assinatura aguardando com o valor do cupom', (select status='aguardando' and value_now=99.50 and value_full=199 and coupon_cycles_left=1 from subscriptions where asaas_subscription_id='sub_pix'));
select pg_temp.pay('evt1', 'PAYMENT_CREATED', 'pay1', 'sub_pix', 'cus_pix', 99.50, current_date, 'PENDING');
select pg_temp.como('00000000-0000-0000-0000-0000000000b1');
select pg_temp.t('painel mostra a fatura em aberto', (select b->'subscription'->>'status'='aguardando' and b->'subscription'->>'pay_url' like '%pay1' from (select public.adult_billing() b) x));
select pg_temp.t('ainda não é VIP antes de pagar', not public._is_vip('00000000-0000-0000-0000-0000000000b1'));
select pg_temp.pay('evt2', 'PAYMENT_RECEIVED', 'pay1', 'sub_pix', 'cus_pix', 99.50, current_date, 'RECEIVED') as r2 \gset
select pg_temp.t('pagamento recebido: assinatura ativa', (select status='ativa' and paid_cycles=1 from subscriptions where asaas_subscription_id='sub_pix'));
select pg_temp.t('VIP até 1 ano + 3 dias', public._is_vip('00000000-0000-0000-0000-0000000000b1')
  and (select ends_at::date = current_date + interval '1 year' + interval '3 days' and source='assinatura' from entitlements where user_id='00000000-0000-0000-0000-0000000000b1'));
select pg_temp.t('cupom passa a usado', (select status='usado' from coupon_redemptions where code='BLACKFRIDAY50' and user_id='00000000-0000-0000-0000-0000000000b1'));
select pg_temp.t('fim do desconto: pede para voltar ao preço cheio no Asaas', (:'r2'::jsonb->'actions'->0->>'action')='update_value' and (:'r2'::jsonb->'actions'->0->>'value')::numeric=199
  and (:'r2'::jsonb->'actions'->0->>'asaas_subscription_id')='sub_pix', :'r2');
select public.billing_value_updated((select id from subscriptions where asaas_subscription_id='sub_pix'), 199);
select pg_temp.t('aviso repetido vale uma vez só', (public.billing_webhook((select payload from billing_events where id='evt2'))->>'duplicate')='true'
  and (select paid_cycles=1 from subscriptions where asaas_subscription_id='sub_pix'));
select pg_temp.pay('evt3', 'PAYMENT_CONFIRMED', 'pay1', 'sub_pix', 'cus_pix', 99.50, current_date, 'CONFIRMED');
select pg_temp.t('CONFIRMED depois de RECEIVED da mesma cobrança não conta de novo', (select paid_cycles=1 from subscriptions where asaas_subscription_id='sub_pix'));
select pg_temp.t('com assinatura ativa não assina de novo', pg_temp.err($$select public.billing_can_start('00000000-0000-0000-0000-0000000000b1')$$) like '%assinatura_ativa%');
-- 2ª anuidade, paga no vencimento: o VIP passa a ir até 2 anos + 3 dias
select pg_temp.pay('evt4', 'PAYMENT_RECEIVED', 'pay2', 'sub_pix', 'cus_pix', 199, (current_date + interval '1 year')::date, 'RECEIVED') as r4 \gset
select pg_temp.t('Pix: próxima cobrança vai para depois do 2º pagamento', (select next_due = (current_date + interval '2 years')::date from subscriptions where asaas_subscription_id='sub_pix'));
select pg_temp.t('2º pagamento estende o VIP e não pede mais troca de valor', (select ends_at::date = current_date + interval '2 years' + interval '3 days' from entitlements where user_id='00000000-0000-0000-0000-0000000000b1')
  and jsonb_array_length(:'r4'::jsonb->'actions')=0 and (select paid_cycles=2 from subscriptions where asaas_subscription_id='sub_pix'));
select pg_temp.pay('evt5', 'PAYMENT_OVERDUE', 'pay3', 'sub_pix', 'cus_pix', 199, (current_date + interval '2 years')::date, 'OVERDUE');
select pg_temp.t('cobrança vencida: assinatura atrasada', (select status='atrasada' from subscriptions where asaas_subscription_id='sub_pix'));
select pg_temp.pay('evt6', 'PAYMENT_REFUNDED', 'pay2', 'sub_pix', 'cus_pix', 199, (current_date + interval '1 year')::date, 'REFUNDED');
select pg_temp.t('estorno encerra o VIP na hora', not public._is_vip('00000000-0000-0000-0000-0000000000b1'));

-- ---------- cartão: a assinatura nasce no Checkout ----------
select public.billing_set_customer('00000000-0000-0000-0000-0000000000c1', 'cus_card');
select public.billing_start('00000000-0000-0000-0000-0000000000c1', 'mensal', 'cartao', 'cus_card', 'chk_old', null, 'https://sandbox.asaas.com/checkoutSession/show/chk_old',
  public.billing_quote('00000000-0000-0000-0000-0000000000c1', 'mensal'));
select public.billing_start('00000000-0000-0000-0000-0000000000c1', 'mensal', 'cartao', 'cus_card', 'chk1', null, 'https://sandbox.asaas.com/checkoutSession/show/chk1',
  public.billing_quote('00000000-0000-0000-0000-0000000000c1', 'mensal'));
select pg_temp.t('novo link substitui o antigo que ainda aguardava', (select status='expirada' from subscriptions where asaas_checkout_id='chk_old')
  and (select status='aguardando' from subscriptions where asaas_checkout_id='chk1'));
-- o pagamento chega antes do SUBSCRIPTION_CREATED: a assinatura é achada pelo cliente
select pg_temp.pay('evt7', 'PAYMENT_CONFIRMED', 'payc1', 'sub_card', 'cus_card', 14.90, current_date, 'CONFIRMED');
select pg_temp.t('cartão confirmado liga a assinatura do Checkout e dá VIP', (select status='ativa' and asaas_subscription_id='sub_card' from subscriptions where asaas_checkout_id='chk1')
  and public._is_vip('00000000-0000-0000-0000-0000000000c1'));
select pg_temp.t('cartão: próxima cobrança calculada na confirmação (sem esperar o SUBSCRIPTION_CREATED)', (select next_due = (current_date + interval '1 month')::date from subscriptions where asaas_subscription_id='sub_card'));
select pg_temp.t('VIP do mensal: 1 mês + 3 dias', (select ends_at::date = current_date + interval '1 month' + interval '3 days' from entitlements where user_id='00000000-0000-0000-0000-0000000000c1' and source='assinatura'));
select public.billing_webhook(jsonb_build_object('id', 'evt8', 'event', 'SUBSCRIPTION_CREATED', 'subscription', jsonb_build_object('id', 'sub_card', 'customer', 'cus_card', 'nextDueDate', (current_date + interval '1 month')::date::text)));
select pg_temp.t('SUBSCRIPTION_CREATED atualiza o próximo vencimento', (select next_due = (current_date + interval '1 month')::date from subscriptions where asaas_subscription_id='sub_card'));
select pg_temp.t('desconto para sempre não pede troca de valor', (select result->'actions'='[]'::jsonb from billing_events where id='evt7'));
select pg_temp.t('expirar um Checkout já pago não mexe', (select (public.billing_webhook(jsonb_build_object('id','evt9','event','CHECKOUT_EXPIRED','checkout',jsonb_build_object('id','chk1'))))->>'checkout'='chk1')
  and (select status='ativa' from subscriptions where asaas_checkout_id='chk1'));

-- ---------- cancelar ----------
select public.billing_cancel('00000000-0000-0000-0000-0000000000c1') as cx \gset
select pg_temp.t('cancelar devolve a assinatura do Asaas', :'cx'::jsonb->>'asaas_subscription_id'='sub_card');
select public.billing_canceled((:'cx'::jsonb->>'id')::uuid);
select pg_temp.t('cancelada, mas o VIP vale até o fim do mês pago', (select status='cancelada' from subscriptions where asaas_subscription_id='sub_card') and public._is_vip('00000000-0000-0000-0000-0000000000c1'));
select public.billing_webhook(jsonb_build_object('id', 'evt10', 'event', 'SUBSCRIPTION_DELETED', 'subscription', jsonb_build_object('id', 'sub_card', 'customer', 'cus_card')));
select pg_temp.t('SUBSCRIPTION_DELETED depois do cancelamento não muda nada', (select status='cancelada' from subscriptions where asaas_subscription_id='sub_card'));
select pg_temp.t('sem assinatura não cancela', pg_temp.err($$select public.billing_cancel('00000000-0000-0000-0000-0000000000c1')$$) like '%sem_assinatura%');
select pg_temp.t('depois de cancelar pode assinar de novo', pg_temp.err($$select public.billing_can_start('00000000-0000-0000-0000-0000000000c1')$$)='ok');

-- ---------- avisos estranhos ----------
select pg_temp.pay('evt11', 'PAYMENT_RECEIVED', 'payx', 'sub_x', 'cus_x', 10, current_date, 'RECEIVED') as r11 \gset
select pg_temp.t('cobrança de assinatura desconhecida é ignorada e marcada como processada', (:'r11'::jsonb->>'ignored')='cobranca_sem_assinatura'
  and (select processed_at is not null from billing_events where id='evt11'));
select public.billing_webhook(jsonb_build_object('id','evt12','event','PAYMENT_RECEIVED','payment',jsonb_build_object('id','pay1','subscription','sub_pix','dueDate','data-errada'))) as r12 \gset
select pg_temp.t('erro ao processar fica gravado e não derruba a resposta', (:'r12'::jsonb->>'error') is not null
  and (select error is not null and processed_at is null from billing_events where id='evt12'));
select pg_temp.t('aviso sem id é recusado', pg_temp.err($$select public.billing_webhook('{"event":"PAYMENT_RECEIVED"}')$$) like '%evento_invalido%');

-- ---------- painel, parâmetros e permissões ----------
select pg_temp.como('00000000-0000-0000-0000-0000000000b1');
select pg_temp.t('painel lista as cobranças', (select jsonb_array_length(b->'payments')=3 and b->'subscription'->>'status'='atrasada' from (select public.adult_billing() b) x));
select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select pg_temp.err($$select public.admin_set_settings('{"preco_mensal_centavos":2990,"assinatura_carencia_dias":5}')$$) as rs \gset
select pg_temp.t('admin muda o preço', :'rs'='ok' and (public.billing_quote('00000000-0000-0000-0000-0000000000ad', 'mensal')->>'full')::numeric=29.90, :'rs');
select pg_temp.t('funções de cobrança fechadas para o site', not has_function_privilege('authenticated', 'public.billing_webhook(jsonb)', 'execute')
  and not has_function_privilege('anon', 'public.billing_start(uuid, text, text, text, text, text, text, jsonb)', 'execute')
  and not has_function_privilege('authenticated', 'public.billing_quote(uuid, text)', 'execute')
  and has_function_privilege('service_role', 'public.billing_webhook(jsonb)', 'execute') and has_function_privilege('authenticated', 'public.adult_billing()', 'execute'));
select pg_temp.t('tabelas de cobrança fechadas para o site', not has_table_privilege('authenticated', 'public.subscriptions', 'select') and not has_table_privilege('anon', 'public.billing_events', 'select')
  and not has_table_privilege('authenticated', 'public.payments', 'select'));

select case when ok then 'ok    ' else 'FALHOU' end||' | '||nome||case when detalhe<>'' and not ok then ' ['||detalhe||']' else '' end from res order by ok, nome;
select 'TOTAL: '||count(*)||' verificações, '||count(*) filter (where not ok)||' falha(s)' from res;
