-- Autorização dos dados de estudo dada UMA vez pelo responsável (vale para todos os alunos que ele cadastrar).
--  * profiles.data_consent (nulo = ainda não respondeu, true = autorizou, false = não autorizou) e data_consent_at.
--  * handle_new_user: lê a resposta dada no pop-up do cadastro (raw_user_meta_data->>'consent').
--  * set_data_consent(p_value): grava a resposta; autorizar vale também para os alunos que ele já cadastrou e ainda não tinham
--    autorização; retirar apaga a autorização de todos os alunos que ele cadastrou (o gatilho students_consent carimba data e autor).
--  * create_student: sem p_consent, usa a autorização do perfil.
-- Aplicar ANTES de publicar o site novo.
begin;

alter table public.profiles add column data_consent boolean;
alter table public.profiles add column data_consent_at timestamptz;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare c text := new.raw_user_meta_data->>'consent';
begin
  insert into profiles(id,name,role,data_consent,data_consent_at) values (new.id,
    left(coalesce(new.raw_user_meta_data->>'name',''),60),
    case when new.raw_user_meta_data->>'role'='professor' then 'professor' else 'pai' end,
    case c when 'true' then true when 'false' then false end,
    case when c in ('true','false') then now() end);
  -- teste do VIP para toda conta nova
  insert into entitlements(user_id, source, ends_at, note)
    values (new.id, 'teste', now() + make_interval(days => coalesce(app_setting('plano_teste_dias', 14)::int, 14)), 'Teste de boas-vindas');
  return new;
end $function$;

CREATE OR REPLACE FUNCTION public.set_data_consent(p_value boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'nao_autenticado' using errcode='28000'; end if;
  if p_value is null then raise exception 'valor_invalido'; end if;
  update profiles set data_consent = p_value, data_consent_at = now() where id = uid;
  if p_value then
    update students set consent_at = now() where created_by = uid and consent_at is null;
  else
    update students set consent_at = null where created_by = uid and consent_at is not null;
  end if;
end $function$;
revoke all on function public.set_data_consent(boolean) from public, anon;
grant execute on function public.set_data_consent(boolean) to authenticated;

CREATE OR REPLACE FUNCTION public.create_student(p_name text, p_level integer, p_start date, p_days integer[], p_per_day integer, p_close integer, p_goal integer, p_reward text, p_repeat text DEFAULT 'reforco'::text, p_stamps integer DEFAULT 3, p_period text DEFAULT 'semanal'::text, p_monthly integer DEFAULT 4000, p_system text DEFAULT 'figurinhas'::text, p_theme text DEFAULT 'dinossauros'::text, p_themes text[] DEFAULT NULL::text[], p_ano integer DEFAULT NULL::integer, p_teto integer DEFAULT NULL::integer, p_free integer[] DEFAULT NULL::integer[], p_consent boolean DEFAULT NULL::boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare uid uuid := auth.uid(); sid uuid; code text; th text[]; cons boolean;
begin
  if uid is null then raise exception 'nao_autenticado' using errcode='28000'; end if;
  -- plano: Grátis cadastra 1 aluno, VIP (família) até 4 (ou o limite da concessão)
  if (select count(*) from students where created_by = uid) >= public._plan_max_students(uid) then raise exception 'plano_alunos'; end if;
  -- autorização dos dados de estudo: a do perfil do responsável (p_consent, se vier, vale por cima)
  cons := coalesce(p_consent, (select data_consent from profiles where id = uid), false);
  select coalesce(array_agg(t order by o), '{}'::text[]) into th
    from (select distinct on (t) t, o from unnest(coalesce(nullif(p_themes, '{}'::text[]), array[p_theme])) with ordinality u(t,o)
           where t in (select id from albums where ativo) order by t, o) x;
  if cardinality(th) = 0 then raise exception 'sem_album'; end if;
  code := gen_link_code();
  insert into students(name, link_code, level_idx, start_date, study_days, sheets_per_day, week_close_dow,
                       weekly_goal, monthly_goal, reward_period, reward, repeat_mode, stamps_needed, reward_system, sticker_theme, sticker_themes, created_by,
                       ano_escolar, teto_anos, free_days, consent_at, consent_by)
    values (trim(p_name), code, p_level, p_start, p_days, p_per_day, p_close, p_goal, 4000,
            'semanal', '', coalesce(p_repeat,'reforco'), coalesce(p_stamps,3),
            'figurinhas', th[1], th, uid, p_ano, p_teto, coalesce(p_free, '{0,6}'::int[]), case when cons then now() end, case when cons then uid end)
    returning id into sid;
  insert into guardians(student_id, user_id, role) values (sid, uid, 'owner');
  insert into student_secrets(student_id) values (sid);
  return jsonb_build_object('id', sid, 'link_code', code);
end $function$;

commit;
