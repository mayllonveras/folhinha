do $$ begin create role anon nologin; exception when duplicate_object then null; end $$; do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$; do $$ begin create role service_role nologin; exception when duplicate_object then null; end $$;
create schema auth; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true),'')::uuid $$;
grant usage on schema public, auth to anon, authenticated, service_role;
create function public.is_admin() returns boolean language sql stable as $$ select coalesce(current_setting('app.admin', true),'')='1' $$;
create table public.students(id uuid primary key default gen_random_uuid(), created_by uuid, token text unique, start_date date not null, study_days int[] not null,
  free_days int[] not null default '{}', ano_escolar int, ano_ref int, consent_at timestamptz, anon_id uuid not null default gen_random_uuid(), sticker_themes text[] not null default '{espaco}');
alter table public.students enable row level security;
create policy st_dono on public.students for select to authenticated using (created_by = auth.uid());
grant select on public.students to authenticated;
create table public.awards(id uuid primary key default gen_random_uuid(), student_id uuid references public.students(id) on delete cascade, kind text not null, theme text, slot int,
  period_mode text, period_start date, period_end date, earned_day date, source text, seq int not null default 1, earned_at timestamptz default now());
alter table public.awards add constraint awards_source_check check (source = any (array['carimbo'::text,'perseveranca'::text,'marco'::text,'troca'::text,'boas_vindas'::text]));
create unique index awards_pack_once on public.awards (student_id, earned_day, source, seq) where kind in ('pacote','figurinha');
create function public._student_from_token(p_token text) returns uuid language plpgsql stable security definer as $$ declare i uuid; begin select id into i from students where token=p_token; if i is null then raise exception 'token_invalido'; end if; return i; end $$;
create function public.ano_do_aluno(p_ano int, p_ref int, p_day date) returns int language sql immutable as $$ select p_ano $$;
