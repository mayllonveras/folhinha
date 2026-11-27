-- Assinatura: a próxima cobrança passa a ser calculada na confirmação do pagamento.
--
-- *** APLICADA EM PRODUÇÃO em 18/11/2026 (projeto folhinha-calculo), com autorização do professor. Pode ser reaplicada. ***
-- Conferido depois: a assinatura de teste ativa ficou com a próxima cobrança em 18/12/2026.
--
-- Antes, subscriptions.next_due só era preenchida pelo aviso SUBSCRIPTION_CREATED/UPDATED do Asaas, que nem sempre chega (assinatura de
-- cartão criada pelo Checkout). Agora cada pagamento confirmado leva a próxima cobrança para o vencimento dele + 1 ciclo, sem nunca voltar
-- para trás. As assinaturas ativas sem data recebem a data a partir da última cobrança paga.
-- _billing_event é a mesma de 2026-11-18-assinatura.sql, só com a linha da próxima cobrança.
begin;

create or replace function public._billing_event(p jsonb) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
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
    -- estorno ou chargeback: o VIP desta assinatura termina agora
    if pr.credited and s.entitlement_id is not null then
      update entitlements set revoked_at = now() where id = s.entitlement_id;   -- um pagamento novo depois disso reativa (revoked_at volta a nulo)
    end if;
  end if;
  return jsonb_build_object('subscription', sid, 'payment', pr.asaas_payment_id, 'actions', actions);
end $$;

-- assinaturas que já estão valendo e ficaram sem a data
update public.subscriptions s set next_due = (p.due + case s.plan when 'mensal' then interval '1 month' else interval '1 year' end)::date, updated_at = now()
  from (select subscription_id, max(due_date) due from public.payments where credited group by subscription_id) p
 where p.subscription_id = s.id and s.next_due is null and s.status in ('ativa', 'atrasada');

revoke all on function public._billing_event(jsonb) from public, anon, authenticated;

commit;
