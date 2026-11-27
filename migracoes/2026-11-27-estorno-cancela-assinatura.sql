-- Estorno ou chargeback agora cancelam a assinatura, e não só tiram o VIP.
-- Antes, a assinatura continuava "ativa" (com botão Cancelar plano, próxima cobrança e valor na tela) e o Asaas seguia cobrando.
-- Agora: o VIP termina na hora (como antes), a assinatura vira "cancelada" e a função devolve a ação cancel_subscription,
-- que o asaas-webhook executa apagando a assinatura no Asaas.
--
-- ATENÇÃO: esta função parte da versão que está em PRODUÇÃO, que tinha um trecho a mais do que 2026-11-18-assinatura.sql:
-- a cada pagamento confirmado, next_due = o vencimento desta cobrança + 1 ciclo (nunca volta para trás). Esse trecho estava só no
-- banco e não no repositório; ele é mantido aqui e passa a existir também nas migrações.
--
-- Para quem já foi estornado antes desta migração, veja o reparo manual no fim do arquivo.
begin;

CREATE OR REPLACE FUNCTION public._billing_event(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare ev text := p->>'event'; pay jsonb := p->'payment'; sub jsonb := p->'subscription'; chk jsonb := p->'checkout';
  sid uuid; s subscriptions%rowtype; pr payments%rowtype; due date; new_end timestamptz; eid uuid; actions jsonb := '[]'::jsonb;
  grace int := coalesce(app_setting('assinatura_carencia_dias', 3)::int, 3);
begin
  if ev like 'SUBSCRIPTION_%' then
    sid := public._billing_find(sub->>'id', sub->>'customer');
    if sid is null then return jsonb_build_object('ignored', 'assinatura_desconhecida'); end if;
    if ev in ('SUBSCRIPTION_DELETED', 'SUBSCRIPTION_INACTIVATED') then
      update subscriptions set status = case when status = 'aguardando' then 'expirada' else 'cancelada' end,
             canceled_at = coalesce(canceled_at, now()), updated_at = now()
       where id = sid and status in ('aguardando', 'ativa', 'atrasada');
    elsif sub ? 'nextDueDate' then
      update subscriptions set next_due = (sub->>'nextDueDate')::date, updated_at = now() where id = sid;
    end if;
    return jsonb_build_object('subscription', sid);
  end if;

  if ev in ('CHECKOUT_EXPIRED', 'CHECKOUT_CANCELED') then
    update subscriptions set status = 'expirada', updated_at = now() where asaas_checkout_id = chk->>'id' and status = 'aguardando';
    return jsonb_build_object('checkout', chk->>'id');
  end if;

  if ev not like 'PAYMENT_%' or pay is null then return jsonb_build_object('ignored', ev); end if;
  sid := public._billing_find(pay->>'subscription', pay->>'customer');
  if sid is null then return jsonb_build_object('ignored', 'cobranca_sem_assinatura'); end if;
  select * into s from subscriptions where id = sid for update;
  due := (pay->>'dueDate')::date;

  insert into payments(asaas_payment_id, subscription_id, user_id, value, status, billing_type, due_date, invoice_url)
    values (pay->>'id', sid, s.user_id, (pay->>'value')::numeric, pay->>'status', pay->>'billingType', due, pay->>'invoiceUrl')
  on conflict (asaas_payment_id) do update set value = excluded.value, status = excluded.status, billing_type = excluded.billing_type,
    due_date = excluded.due_date, invoice_url = coalesce(excluded.invoice_url, payments.invoice_url), updated_at = now()
  returning * into pr;

  if ev in ('PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED') then
    update payments set paid_at = coalesce(paid_at, now()) where asaas_payment_id = pr.asaas_payment_id;
    if not pr.credited then
      update payments set credited = true where asaas_payment_id = pr.asaas_payment_id;
      -- o VIP vai até o vencimento desta cobrança + 1 ciclo + carência (nunca encolhe)
      new_end := (coalesce(due, current_date) + case s.plan when 'mensal' then interval '1 month' else interval '1 year' end + make_interval(days => grace))::timestamptz;
      if s.entitlement_id is not null then
        update entitlements set ends_at = greatest(ends_at, new_end), revoked_at = null where id = s.entitlement_id;
      else
        insert into entitlements(user_id, source, ends_at, note) values (s.user_id, 'assinatura', new_end, 'Assinatura ' || s.plan)
          returning id into eid;
        update subscriptions set entitlement_id = eid where id = sid;
      end if;
      -- próxima cobrança: o vencimento desta + 1 ciclo (nunca volta para trás; o aviso SUBSCRIPTION_* do Asaas, quando chega, confirma a data)
      update subscriptions set status = 'ativa', paid_cycles = paid_cycles + 1, updated_at = now(),
             next_due = greatest(next_due, (coalesce(due, current_date) + case s.plan when 'mensal' then interval '1 month' else interval '1 year' end)::date)
       where id = sid;
      -- cupom: na 1ª cobrança paga ele passa a "usado"; ao acabarem as cobranças com desconto, o valor volta ao cheio no Asaas
      if s.coupon_code is not null then
        if s.paid_cycles = 0 then
          update coupon_redemptions set status = 'usado' where user_id = s.user_id and code = s.coupon_code and status = 'reservado';
        end if;
        if s.coupon_cycles_left is not null then
          update subscriptions set coupon_cycles_left = greatest(coupon_cycles_left - 1, 0) where id = sid;
          if s.coupon_cycles_left - 1 <= 0 and s.value_now <> s.value_full and s.asaas_subscription_id is not null then
            actions := actions || jsonb_build_object('action', 'update_value', 'id', sid, 'asaas_subscription_id', s.asaas_subscription_id, 'value', s.value_full);
          end if;
        end if;
      end if;
    end if;
  elsif ev = 'PAYMENT_OVERDUE' then
    update subscriptions set status = 'atrasada', updated_at = now() where id = sid and status = 'ativa';
  elsif ev in ('PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED') then
    -- estorno ou chargeback: o VIP desta assinatura termina agora e a assinatura é cancelada (o Asaas não cobra de novo)
    if pr.credited and s.entitlement_id is not null then
      update entitlements set revoked_at = now() where id = s.entitlement_id;
    end if;
    if s.status in ('ativa', 'atrasada') then
      update subscriptions set status = 'cancelada', canceled_at = coalesce(canceled_at, now()), updated_at = now() where id = sid;
      if s.asaas_subscription_id is not null then   -- o webhook apaga a assinatura no Asaas (action cancel_subscription)
        actions := actions || jsonb_build_object('action', 'cancel_subscription', 'id', sid, 'asaas_subscription_id', s.asaas_subscription_id);
      end if;
    end if;
  end if;
  return jsonb_build_object('subscription', sid, 'payment', pr.asaas_payment_id, 'actions', actions);
end $function$;

commit;

-- Reparo manual (rodar uma vez, só se houver assinatura estornada que ficou "ativa"; confira o resultado antes):
--   select s.id, s.status, p.status from subscriptions s join payments p on p.subscription_id = s.id
--    where s.status in ('ativa', 'atrasada') and p.status in ('REFUNDED', 'CHARGEBACK_REQUESTED');
--   update subscriptions set status = 'cancelada', canceled_at = coalesce(canceled_at, now()), updated_at = now() where id in (...);
