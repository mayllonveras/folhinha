-- Esquema mínimo do Supabase que o esquema de produção usa (auth, realtime, extensões, papéis). Só para testes locais.
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin; exception when duplicate_object then null; end $$;
create schema auth; create schema extensions; create schema realtime;
create extension pgcrypto schema extensions;
create table auth.users(id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}', email_confirmed_at timestamptz default now(),
  created_at timestamptz default now(), last_sign_in_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true),'')::uuid $$;
create function realtime.send(jsonb, text, text, boolean) returns void language sql as $$ select $$;
grant usage on schema public, auth, extensions, realtime to anon, authenticated, service_role;
grant select on auth.users to service_role;
set check_function_bodies = off;
