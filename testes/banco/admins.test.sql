\set ON_ERROR_STOP 0
\pset tuples_only on
create temp table res(nome text, ok boolean, detalhe text);
grant all on res to public;
create function pg_temp.t(n text, c boolean, d text default '') returns void language sql as $$ insert into res values (n, coalesce(c,false), d) $$;
create function pg_temp.err(q text) returns text language plpgsql as $$ begin execute q; return 'ok'; exception when others then return sqlerrm; end $$;
create function pg_temp.como(u text) returns void language sql as $$ select set_config('app.uid', coalesce(u,''), false) $$;

insert into auth.users(id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-0000000000ad', 'gradematic@gmail.com', now()),
  ('00000000-0000-0000-0000-0000000000a1', 'a@teste.local', now()),
  ('00000000-0000-0000-0000-0000000000a2', 'b@teste.local', now()),
  ('00000000-0000-0000-0000-0000000000a3', 'c@teste.local', null);

select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select pg_temp.t('a conta-raiz é admin', public.is_admin());
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.t('conta comum não é admin', not public.is_admin());
select pg_temp.t('conta comum não concede admin', pg_temp.err($$select public.admin_grant_admin('b@teste.local')$$) like '%sem_permissao%');
select pg_temp.t('conta comum não lista admins', pg_temp.err($$select public.admin_list_admins()$$) like '%sem_permissao%');
reset role;

select pg_temp.como('00000000-0000-0000-0000-0000000000ad');
select pg_temp.t('admin concede a outra conta (e-mail em outra caixa)', pg_temp.err($$select public.admin_grant_admin(' A@Teste.local ')$$)='ok');
select pg_temp.t('conceder de novo não duplica', pg_temp.err($$select public.admin_grant_admin('a@teste.local')$$)='ok' and (select count(*) from admins)=1);
select pg_temp.t('e-mail desconhecido é recusado', pg_temp.err($$select public.admin_grant_admin('nao@existe.local')$$) like '%conta_nao_encontrada%');
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.t('a conta concedida passa a ser admin', public.is_admin());
select pg_temp.t('e ganha acesso às funções admin_*', pg_temp.err($$select public.admin_overview()$$)='ok');
select pg_temp.t('e pode conceder a outra', pg_temp.err($$select public.admin_grant_admin('b@teste.local')$$)='ok');
select pg_temp.como('00000000-0000-0000-0000-0000000000a3');
reset role;
insert into admins(user_id) values ('00000000-0000-0000-0000-0000000000a3');
select pg_temp.como('00000000-0000-0000-0000-0000000000a3');
select pg_temp.t('e-mail não confirmado não é admin mesmo com linha na tabela', not public.is_admin());

select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.t('a conta-raiz não perde o acesso', pg_temp.err($$select public.admin_revoke_admin('00000000-0000-0000-0000-0000000000ad')$$) like '%admin_raiz%');
select pg_temp.t('admin retira outro admin', pg_temp.err($$select public.admin_revoke_admin('00000000-0000-0000-0000-0000000000a2')$$)='ok');
select pg_temp.como('00000000-0000-0000-0000-0000000000a2');
select pg_temp.t('quem perdeu o acesso deixa de ser admin', not public.is_admin());
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select pg_temp.t('retirar quem não é admin é recusado', pg_temp.err($$select public.admin_revoke_admin('00000000-0000-0000-0000-0000000000a2')$$) like '%nao_e_admin%');
select pg_temp.t('a lista traz a raiz marcada', (select bool_or((x->>'root')::boolean) from jsonb_array_elements(public.admin_list_admins()) x));

select 'FALHOU: ' || nome || ' ' || detalhe from res where not ok;
select 'TOTAL: ' || count(*) || ' verificações, ' || count(*) filter (where not ok) || ' falha(s)' from res;
