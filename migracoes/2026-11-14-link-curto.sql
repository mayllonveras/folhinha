-- Link do aluno mais curto: o código novo tem 8 caracteres (ex.: ?aluno=K7M3-Q9XW) em vez de 16 hexadecimais.
-- Links já entregues continuam funcionando (a coluna link_code não muda); só os novos (cadastro e "Gerar novo link") ficam curtos.
-- Alfabeto de 32 letras/números sem caracteres confusos (sem 0/o, 1/l): 32^8 ≈ 1,1 trilhão de combinações, e o aluno ainda precisa do PIN.
-- O hífen é só visual: o site mostra A2D5-7THK, mas o banco guarda a2d57thk (o site tira o hífen e põe em minúsculas antes de consultar).
-- Aplicar no Supabase (SQL Editor) ANTES de publicar o site novo (o site novo já mostra o hífen).
begin;

create or replace function public.gen_link_code() returns text
 language plpgsql
 set search_path to 'public', 'extensions'
as $function$
declare
  alphabet constant text := 'abcdefghijkmnpqrstuvwxyz23456789'; -- 32 símbolos (sem l, o, 0, 1): 256 % 32 = 0, sorteio uniforme
  b bytea; c text; i int;
begin
  loop
    b := gen_random_bytes(8); c := '';
    for i in 0..7 loop
      c := c || substr(alphabet, (get_byte(b, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from students where link_code = c);
  end loop;
  return c;
end $function$;

-- create_student: igual à versão anterior, só muda a geração do código.
CREATE OR REPLACE FUNCTION public.create_student(p_name text, p_level integer, p_start date, p_days integer[], p_per_day integer, p_close integer, p_goal integer, p_reward text, p_repeat text DEFAULT 'reforco'::text, p_stamps integer DEFAULT 3, p_period text DEFAULT 'semanal'::text, p_monthly integer DEFAULT 4000, p_system text DEFAULT 'figurinhas'::text, p_theme text DEFAULT 'dinossauros'::text, p_themes text[] DEFAULT NULL::text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare uid uuid := auth.uid(); sid uuid; code text; th text[];
begin
  if uid is null then raise exception 'nao_autenticado' using errcode='28000'; end if;
  select coalesce(array_agg(t order by o), '{}'::text[]) into th
    from (select distinct on (t) t, o from unnest(coalesce(nullif(p_themes, '{}'::text[]), array[p_theme])) with ordinality u(t,o)
           where t in ('dinossauros','bandeiras','ameacados','pets','espaco') order by t, o) x;
  if cardinality(th) = 0 then th := array['dinossauros']; end if;
  code := gen_link_code();
  insert into students(name, link_code, level_idx, start_date, study_days, sheets_per_day, week_close_dow,
                       weekly_goal, monthly_goal, reward_period, reward, repeat_mode, stamps_needed, reward_system, sticker_theme, sticker_themes, created_by)
    values (trim(p_name), code, p_level, p_start, p_days, p_per_day, p_close, p_goal, 4000,
            'semanal', '', coalesce(p_repeat,'reforco'), coalesce(p_stamps,3),
            'figurinhas', th[1], th, uid)
    returning id into sid;
  insert into guardians(student_id, user_id, role) values (sid, uid, 'owner');
  insert into student_secrets(student_id) values (sid);
  return jsonb_build_object('id', sid, 'link_code', code);
end $function$;

-- regenerate_link: igual à versão anterior, só muda a geração do código.
CREATE OR REPLACE FUNCTION public.regenerate_link(p_student uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare code text := gen_link_code();
begin
  if not is_guardian(p_student) then raise exception 'sem_permissao'; end if;
  update students set link_code = code where id = p_student;
  delete from student_sessions where student_id = p_student;
  return code;
end $function$;

-- O helper não deve ser chamável pelo navegador.
revoke all on function public.gen_link_code() from public, anon, authenticated;

commit;
