-- Álbum "Corpos do espaço" (tema espaco). Só adiciona o tema novo; não mexe em dados existentes.
-- Aplicar no Supabase (SQL Editor) ANTES de publicar o site com o álbum novo.
begin;

-- 1. Permite o tema novo nos álbuns da criança (máximo de 2 por criança continua valendo).
alter table students drop constraint students_sticker_themes_check;
alter table students add constraint students_sticker_themes_check check (
  cardinality(sticker_themes) >= 1 and cardinality(sticker_themes) <= 2
  and sticker_themes <@ array['dinossauros','bandeiras','ameacados','pets','espaco']::text[]);

-- 2. create_student passa a aceitar o tema novo (única mudança: 'espaco' na lista de temas válidos).
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
  code := encode(gen_random_bytes(8),'hex');
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

-- 3. Raridade (índice = número do catálogo - 1; precisa bater com espaco.js).
--    Ultrarraras: Saturno, Terra, Sagitário A*. Raras: Sol, Marte, Júpiter, Lua, Pilares da Criação.
insert into sticker_rarity(theme, slot, tier) values
  ('espaco', 10, 'ultra'), ('espaco', 7, 'ultra'), ('espaco', 42, 'ultra'),
  ('espaco', 0, 'rara'), ('espaco', 8, 'rara'), ('espaco', 9, 'rara'), ('espaco', 18, 'rara'), ('espaco', 48, 'rara');

commit;
