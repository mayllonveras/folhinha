-- Vídeos por nível (preparação) e dados de uso para melhorar o sistema.
-- VÍDEOS
--  * level_videos: vários vídeos por nível (chave: levels.code), tipo 'explicacao' ou 'reforco' (aberto a outros), tópico opcional, fonte
--    (storage, youtube ou url), miniatura, duração, legenda/transcrição, ordem e ativo (começa como rascunho). Só o administrador escreve.
--  * Balde público "videos" no Storage (escrita só do administrador).
--  * student_level_videos(token, código do nível, tipo): o aluno lê os vídeos ativos do nível. A tela do aluno ainda NÃO usa isto.
-- DADOS DE USO (só com o consentimento do responsável: students.consent_at)
--  * students.anon_id (código sem identificação), consent_at e consent_by (gatilho grava data e quem autorizou).
--  * sheet_log (uma linha por folha), sheet_items (uma linha por conta, com todas as tentativas e o tempo) e usage_events (eventos do app).
--    Ao apagar o aluno, student_id vira nulo e os dados ficam anonimizados (anon_id continua ligando as linhas do mesmo aluno, sem nome).
--  * Gatilho em sheets: ao fechar a folha, copia para sheet_log e sheet_items; depois atualiza carimbo, subida de nível, categoria e ganho.
--  * student_log_events(token, eventos, ...): o app grava eventos (no máximo 50 por chamada), ignorados sem consentimento.
--  * Visões v_uso_nivel, v_uso_conta e v_uso_video (security_invoker: só o administrador lê).
--  * create_student ganha p_consent (o cadastro dos pais pede a autorização).
-- Parte das definições que estão no banco (pg_get_functiondef). Aplicar ANTES de publicar o site novo.
begin;

-- ===== alunos: código anônimo e consentimento =====
alter table public.students add column anon_id uuid not null default gen_random_uuid();
create unique index students_anon_id_key on public.students(anon_id);
alter table public.students add column consent_at timestamptz;
alter table public.students add column consent_by uuid;

create or replace function public.students_consent() returns trigger
 language plpgsql security definer set search_path to 'public'
as $$
begin
  if tg_op = 'INSERT' then
    if new.consent_at is not null then new.consent_at := now(); new.consent_by := coalesce(new.consent_by, auth.uid()); end if;
    return new;
  end if;
  if new.consent_at is distinct from old.consent_at then
    if new.consent_at is null then new.consent_by := null;
    else new.consent_at := now(); new.consent_by := auth.uid(); end if;
  end if;
  return new;
end $$;
create trigger students_consent before insert or update on public.students for each row execute function public.students_consent();

-- ===== vídeos por nível =====
create table public.level_videos (
  id uuid primary key default gen_random_uuid(),
  level_code text not null references public.levels(code) on update cascade on delete cascade,
  tipo text not null check (tipo ~ '^[a-z_]{3,20}$'),            -- explicacao, reforco... (aberto a outros tipos)
  publico text not null default 'aluno' check (publico in ('aluno','adulto')),
  topico text,                                                   -- nulo = vídeo geral do nível; preenchido = um tipo de erro
  titulo text not null check (char_length(titulo) between 1 and 120),
  fonte text not null check (fonte in ('storage','youtube','url')),
  url text not null,                                             -- caminho no balde "videos", id/endereço do YouTube ou endereço completo
  poster text,
  duracao_s int check (duracao_s is null or duracao_s between 1 and 3600),
  legenda text,                                                  -- transcrição em texto
  ordem int not null default 0,
  ativo boolean not null default false,                          -- rascunho até o administrador publicar
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index level_videos_nivel on public.level_videos(level_code, tipo, ordem) where ativo;
alter table public.level_videos enable row level security;
create policy level_videos_admin on public.level_videos for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy level_videos_adulto on public.level_videos for select to authenticated using (ativo and publico = 'adulto');
create or replace function public.level_videos_touch() returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
create trigger level_videos_touch before update on public.level_videos for each row execute function public.level_videos_touch();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('videos', 'videos', true, 52428800, array['video/mp4','video/webm','image/webp','image/jpeg','image/png','text/vtt'])
  on conflict (id) do nothing;
create policy videos_escrita_admin on storage.objects for all to authenticated
  using (bucket_id = 'videos' and public.is_admin()) with check (bucket_id = 'videos' and public.is_admin());

create or replace function public.student_level_videos(p_token text, p_level_code text, p_tipo text default null)
 returns jsonb language plpgsql stable security definer set search_path to 'public', 'extensions'
as $$
declare sid uuid;
begin
  sid := public._student_from_token(p_token);
  return coalesce((select jsonb_agg(jsonb_build_object('id', v.id, 'tipo', v.tipo, 'topico', v.topico, 'titulo', v.titulo, 'fonte', v.fonte,
                                                       'url', v.url, 'poster', v.poster, 'duracao_s', v.duracao_s, 'legenda', v.legenda) order by v.ordem, v.created_at)
                     from level_videos v where v.ativo and v.publico = 'aluno' and v.level_code = p_level_code and (p_tipo is null or v.tipo = p_tipo)), '[]'::jsonb);
end $$;
revoke all on function public.student_level_videos(text, text, text) from public;
grant execute on function public.student_level_videos(text, text, text) to anon, authenticated;

-- ===== dados de uso =====
create table public.sheet_log (
  sheet_id uuid primary key,
  anon_id uuid not null,
  student_id uuid references public.students(id) on delete set null,
  level_idx int, level_code text, study_day date,
  started_at timestamptz, finished_at timestamptz,
  secs numeric, first_ok int, total int, corrections int, points int,
  stamp boolean, advanced boolean, tier text, gained int,
  created_at timestamptz not null default now()
);
create index sheet_log_nivel on public.sheet_log(level_code);
create index sheet_log_anon on public.sheet_log(anon_id, finished_at);

create table public.sheet_items (
  id bigint generated always as identity primary key,
  sheet_id uuid not null,
  pos int not null,
  anon_id uuid not null,
  student_id uuid references public.students(id) on delete set null,
  level_idx int, level_code text,
  pre text, post text, correta int,
  primeira text, acertou_primeira boolean, tentativas int, ms int,
  respostas jsonb,                                               -- todas as respostas digitadas, na ordem
  extra jsonb,
  unique (sheet_id, pos)
);
create index sheet_items_conta on public.sheet_items(level_code, pre, post);
create index sheet_items_anon on public.sheet_items(anon_id);

create table public.usage_events (
  id bigint generated always as identity primary key,
  anon_id uuid not null,
  student_id uuid references public.students(id) on delete set null,
  at timestamptz not null default now(),
  client_at timestamptz,
  kind text not null check (kind ~ '^[a-z_]{3,30}$'),
  level_idx int, level_code text, sheet_id uuid,
  data jsonb not null default '{}'::jsonb,
  app_version text, device text, screen_w int, session_key text
);
create index usage_events_tipo on public.usage_events(kind, at);
create index usage_events_anon on public.usage_events(anon_id, at);

alter table public.sheet_log enable row level security;
alter table public.sheet_items enable row level security;
alter table public.usage_events enable row level security;
create policy sheet_log_admin on public.sheet_log for select to authenticated using (public.is_admin());
create policy sheet_items_admin on public.sheet_items for select to authenticated using (public.is_admin());
create policy usage_events_admin on public.usage_events for select to authenticated using (public.is_admin());

-- Ao fechar a folha (e quando o carimbo/subida são definidos), copia para as tabelas de uso. Só com consentimento.
create or replace function public.sheets_to_log() returns trigger
 language plpgsql security definer set search_path to 'public'
as $$
declare st students%rowtype; i int; n int; pr jsonb; an jsonb; lc text;
begin
  if new.status <> 'done' then return new; end if;
  select * into st from students where id = new.student_id;
  if st.consent_at is null then return new; end if;
  select code into lc from levels where idx = new.level_idx;
  if old.status is distinct from 'done' then
    insert into sheet_log(sheet_id, anon_id, student_id, level_idx, level_code, study_day, started_at, finished_at, secs, first_ok, total, corrections, points, stamp, advanced, tier, gained)
      values (new.id, st.anon_id, st.id, new.level_idx, lc, new.study_day, new.started_at, new.finished_at, new.secs, new.first_ok, new.total, new.corrections, new.points, new.stamp, new.advanced, new.tier, new.gained)
      on conflict (sheet_id) do nothing;
    n := coalesce(jsonb_array_length(new.problems), 0);
    for i in 0..n-1 loop
      pr := new.problems->i; an := coalesce(new.answers->i, '{}'::jsonb);
      insert into sheet_items(sheet_id, pos, anon_id, student_id, level_idx, level_code, pre, post, correta, primeira, acertou_primeira, tentativas, ms, respostas, extra)
        values (new.id, i, st.anon_id, st.id, new.level_idx, lc, pr->>'pre', coalesce(pr->>'post',''),
                case when pr->>'a' ~ '^-?[0-9]{1,9}$' then (pr->>'a')::int end,
                an->>'v',
                case when an->>'ok' in ('true','false') then (an->>'ok')::boolean end,
                case when an->>'tries' ~ '^[0-9]{1,4}$' then (an->>'tries')::int end,
                case when an->>'ms' ~ '^[0-9]{1,9}$' then (an->>'ms')::int end,
                case when jsonb_typeof(an->'vals') = 'array' and length((an->'vals')::text) <= 300 then an->'vals' end,
                case when jsonb_typeof(pr->'extra') = 'object' then pr->'extra' end)
        on conflict (sheet_id, pos) do nothing;
    end loop;
  elsif new.stamp is distinct from old.stamp or new.advanced is distinct from old.advanced or new.tier is distinct from old.tier or new.gained is distinct from old.gained then
    update sheet_log set stamp = new.stamp, advanced = new.advanced, tier = new.tier, gained = new.gained where sheet_id = new.id;
  end if;
  return new;
end $$;
create trigger sheets_to_log after update on public.sheets for each row execute function public.sheets_to_log();

-- Eventos do app (abrir, trocar de aba, folha iniciada ou abandonada, pacotinho, mesa, vídeo...). Ignorados sem consentimento.
create or replace function public.student_log_events(p_token text, p_events jsonb, p_app text default null, p_screen int default null, p_device text default null, p_session text default null)
 returns jsonb language plpgsql security definer set search_path to 'public', 'extensions'
as $$
declare sid uuid; st students%rowtype; e jsonb; saved int := 0; k int := 0; kd text; lv int; lc text; sh uuid; dt jsonb; ca timestamptz; ms numeric;
begin
  sid := public._student_from_token(p_token);
  select * into st from students where id = sid;
  if st.consent_at is null then return jsonb_build_object('saved', 0); end if;
  if p_events is null or jsonb_typeof(p_events) <> 'array' then raise exception 'dados_invalidos'; end if;
  for e in select * from jsonb_array_elements(p_events) loop
    k := k + 1; exit when k > 50;
    kd := e->>'kind';
    continue when kd is null or kd !~ '^[a-z_]{3,30}$';
    lv := case when e->>'level_idx' ~ '^[0-9]{1,4}$' then (e->>'level_idx')::int end;
    select code into lc from levels where idx = lv;
    sh := null;
    if e->>'sheet_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      select id into sh from sheets where id = (e->>'sheet_id')::uuid and student_id = sid;
    end if;
    dt := case when jsonb_typeof(e->'data') = 'object' and length((e->'data')::text) <= 2000 then e->'data' else '{}'::jsonb end;
    ca := null;
    if e->>'at' ~ '^[0-9]{10,14}$' then
      ms := (e->>'at')::numeric;
      if abs(ms - extract(epoch from now()) * 1000) < 172800000 then ca := to_timestamp(ms / 1000.0); end if;
    end if;
    insert into usage_events(anon_id, student_id, client_at, kind, level_idx, level_code, sheet_id, data, app_version, device, screen_w, session_key)
      values (st.anon_id, sid, ca, kd, lv, lc, sh, dt, left(p_app, 30),
              case when p_device in ('celular','tablet','computador') then p_device end,
              case when p_screen between 200 and 10000 then p_screen end, left(p_session, 40));
    saved := saved + 1;
  end loop;
  return jsonb_build_object('saved', saved);
end $$;
revoke all on function public.student_log_events(text, jsonb, text, int, text, text) from public;
grant execute on function public.student_log_events(text, jsonb, text, int, text, text) to anon, authenticated;

-- ===== visões de análise (só o administrador lê) =====
create view public.v_uso_nivel with (security_invoker = on) as
  select l.level_code, count(*) folhas, count(distinct l.anon_id) alunos,
         round(100.0 * sum(l.first_ok) / nullif(sum(l.total), 0), 1) acerto_primeira_pct,
         round(avg(l.secs), 1) segundos_medio_folha, round(avg(l.corrections), 2) correcoes_medias
    from public.sheet_log l group by l.level_code;
create view public.v_uso_conta with (security_invoker = on) as
  select i.level_code, i.pre, i.post, i.correta, count(*) vezes,
         count(*) filter (where i.acertou_primeira) acertos_primeira,
         round(100.0 * count(*) filter (where i.acertou_primeira) / count(*), 1) acerto_primeira_pct,
         round(avg(i.ms) / 1000.0, 1) segundos_medio, round(avg(i.tentativas), 2) tentativas_medias
    from public.sheet_items i group by i.level_code, i.pre, i.post, i.correta;
create view public.v_uso_video with (security_invoker = on) as
  select e.data->>'video_id' video_id, e.kind, count(*) eventos, count(distinct e.anon_id) alunos
    from public.usage_events e where e.kind like 'video%' group by 1, 2;

-- ===== cadastro: autorização do responsável =====

drop function public.create_student(p_name text, p_level integer, p_start date, p_days integer[], p_per_day integer, p_close integer, p_goal integer, p_reward text, p_repeat text, p_stamps integer, p_period text, p_monthly integer, p_system text, p_theme text, p_themes text[], p_ano integer, p_teto integer, p_free integer[]);
CREATE OR REPLACE FUNCTION public.create_student(p_name text, p_level integer, p_start date, p_days integer[], p_per_day integer, p_close integer, p_goal integer, p_reward text, p_repeat text DEFAULT 'reforco'::text, p_stamps integer DEFAULT 3, p_period text DEFAULT 'semanal'::text, p_monthly integer DEFAULT 4000, p_system text DEFAULT 'figurinhas'::text, p_theme text DEFAULT 'dinossauros'::text, p_themes text[] DEFAULT NULL::text[], p_ano integer DEFAULT NULL::integer, p_teto integer DEFAULT NULL::integer, p_free integer[] DEFAULT NULL::integer[], p_consent boolean DEFAULT NULL::boolean)
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
           where t in (select id from albums where ativo) order by t, o) x;
  if cardinality(th) = 0 then raise exception 'sem_album'; end if;
  code := gen_link_code();
  insert into students(name, link_code, level_idx, start_date, study_days, sheets_per_day, week_close_dow,
                       weekly_goal, monthly_goal, reward_period, reward, repeat_mode, stamps_needed, reward_system, sticker_theme, sticker_themes, created_by,
                       ano_escolar, teto_anos, free_days, consent_at, consent_by)
    values (trim(p_name), code, p_level, p_start, p_days, p_per_day, p_close, p_goal, 4000,
            'semanal', '', coalesce(p_repeat,'reforco'), coalesce(p_stamps,3),
            'figurinhas', th[1], th, uid, p_ano, p_teto, coalesce(p_free, '{0,6}'::int[]), case when p_consent then now() end, case when p_consent then uid end)
    returning id into sid;
  insert into guardians(student_id, user_id, role) values (sid, uid, 'owner');
  insert into student_secrets(student_id) values (sid);
  return jsonb_build_object('id', sid, 'link_code', code);
end $function$;
revoke all on function public.create_student(text, integer, date, integer[], integer, integer, integer, text, text, integer, text, integer, text, text, text[], integer, integer, integer[], boolean) from public;
grant execute on function public.create_student(text, integer, date, integer[], integer, integer, integer, text, text, integer, text, integer, text, text, text[], integer, integer, integer[], boolean) to authenticated;

commit;
