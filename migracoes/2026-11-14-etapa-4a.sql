-- Etapa 4a: carimbos por nível, folha de revisão no teto e folhas de revisão no teto.
--  * levels.stamps_needed (opcional): carimbos para concluir o nível; vazio = o parâmetro geral (padrão 5);
--  * level_stamps(idx): carimbos do nível; usados no gatilho dos alunos, em student_me e em student_submit_sheet;
--  * admin_levels / admin_set_level_stamps: o /adm lê e altera os carimbos de cada nível (só o administrador);
--  * _at_teto: o próximo nível passaria do ano permitido; student_sheet_plan devolve teto_mode (nível concluído + teto);
-- Compatível com o site atual: sem novos campos o comportamento é o mesmo. Aplicar ANTES de publicar o site novo.
begin;

alter table public.levels add column stamps_needed int check (stamps_needed between 1 and 10);

create or replace function public.level_stamps(p_idx int) returns int
 language sql stable security definer set search_path to 'public'
as $$ select coalesce((select stamps_needed from levels where idx = p_idx), app_setting('stamps_needed', 5)::int) $$;

create or replace function public.students_fixed_rules() returns trigger
 language plpgsql set search_path to 'public'
as $$
declare need int := public.level_stamps(new.level_idx);
begin
  new.stamps_needed := need; new.repeat_mode := 'reforco';
  if new.stamps > need then new.stamps := need; end if;
  return new;
end $$;

-- Ano permitido: o próximo nível não pode passar do ano escolar + teto (só confere se o ano foi informado).
create or replace function public._at_teto(s students, p_day date) returns boolean
 language plpgsql stable security definer set search_path to 'public'
as $$
declare ano_now int; max_ano int; next_ano int;
begin
  ano_now := public.ano_do_aluno(s.ano_escolar, s.ano_ref, p_day);
  if ano_now is null then return false; end if;
  max_ano := ano_now + coalesce(s.teto_anos, app_setting('teto_anos_padrao', 1)::int);
  select ano into next_ano from levels where idx = s.level_idx + 1;
  return next_ano is not null and next_ano > max_ano;
end $$;

create or replace function public.admin_levels() returns jsonb
 language plpgsql stable security definer set search_path to 'public'
as $$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('idx', idx, 'code', code, 'ano', ano, 'target', target,
            'stamps_needed', stamps_needed, 'effective', public.level_stamps(idx)) order by idx), '[]'::jsonb) from levels);
end $$;

-- p_stamps null = volta ao padrão geral.
create or replace function public.admin_set_level_stamps(p_idx int, p_stamps int) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $$
begin
  if not public.is_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if p_stamps is not null and (p_stamps < 1 or p_stamps > 10) then raise exception 'valor_invalido'; end if;
  update levels set stamps_needed = p_stamps where idx = p_idx;
  if not found then raise exception 'nivel_inexistente'; end if;
  update students set stamps = stamps where level_idx = p_idx;
  return public.admin_levels();
end $$;

revoke all on function public.admin_levels() from public, anon;
revoke all on function public.admin_set_level_stamps(int, int) from public, anon;
grant execute on function public.admin_levels() to authenticated;
grant execute on function public.admin_set_level_stamps(int, int) to authenticated;

commit;
