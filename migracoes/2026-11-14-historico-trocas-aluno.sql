-- Histórico de trocas feitas, para a criança ver na aba Trocas: com quem trocou, o que deu e o que recebeu (últimas 30).
begin;
create or replace function public.student_trade_history(p_token text) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  return coalesce((select jsonb_agg(x order by (x->>'at') desc) from (
    select jsonb_build_object('id', t.id, 'friend', o.name, 'at', t.answered_at,
        'gave_theme', case when t.requester = sid then t.give_theme else t.want_theme end,
        'gave_slot',  case when t.requester = sid then t.give_slot  else t.want_slot  end,
        'got_theme',  case when t.requester = sid then t.want_theme else t.give_theme end,
        'got_slot',   case when t.requester = sid then t.want_slot  else t.give_slot  end) x
      from trades t join students o on o.id = case when t.requester = sid then t.addressee else t.requester end
     where t.status = 'aceita' and sid in (t.requester, t.addressee)
     order by t.answered_at desc limit 30) q), '[]'::jsonb);
end $$;
revoke all on function public.student_trade_history(text) from public;
grant execute on function public.student_trade_history(text) to anon, authenticated;
commit;
