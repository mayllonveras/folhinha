-- Trilha Turbo: histórico de acertos e erros visível para os pais (aba Histórico do painel).
--
-- *** NÃO APLICADA ainda em produção: precisa de autorização do professor. Aplique uma vez só. ***
-- (Testada com testes/banco/turbo.sh num Postgres descartável.)
--
-- Antes: as tentativas só eram gravadas com consentimento (students.consent_at), de forma anônima, e só o administrador lia (turbo_attempts).
-- Agora: turbo_log guarda, SEMPRE, cada conta feita na Turbo (acerto ou erro, e a resposta digitada), legível pelos adultos responsáveis do aluno.
--  * student_turbo_save passa a gravar em turbo_log (o resto da função é igual à de 2026-11-17-trilha-turbo.sql).
--  * Quem já tinha tentativas em turbo_attempts (com consentimento) ganha essas linhas em turbo_log, sem a resposta digitada.
--  * Apagar o aluno apaga o histórico (on delete cascade).
-- Reverter: drop table public.turbo_log; e recolocar student_turbo_save da migração 2026-11-17-trilha-turbo.sql.
begin;

create table public.turbo_log (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  study_day date not null,
  at timestamptz not null default now(),
  fact_id text not null check (fact_id ~ '^(\+|-|×|÷):[0-9]{1,2}:[0-9]{1,2}$'),
  kind text not null check (kind in ('revisao','novo','reinsercao','nivelamento','aquecimento')),
  ok boolean not null,
  answer smallint check (answer is null or answer between 0 and 9999)   -- nulo = "não sei" (ou tentativa antiga, sem a resposta guardada)
);
create index turbo_log_aluno on public.turbo_log(student_id, study_day desc, id desc);

alter table public.turbo_log enable row level security;
revoke all on table public.turbo_log from anon, authenticated;
grant select on table public.turbo_log to authenticated;
create policy turbo_log_adulto_sel on public.turbo_log for select to authenticated using (exists (select 1 from public.students s where s.id = turbo_log.student_id));
create policy turbo_log_admin on public.turbo_log for select to authenticated using (public.is_admin());

insert into public.turbo_log(student_id, study_day, at, fact_id, kind, ok)
  select student_id, study_day, at, fact_id, kind, ok from public.turbo_attempts where student_id is not null order by id;

create or replace function public.student_turbo_save(p_token text, p_day date, p_session jsonb)
 returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $$
declare sid uuid; s students%rowtype; res jsonb; dev text; ok_day boolean; got int := 0; v_status text; prev_status text; n_call int; n_att int; given boolean;
begin
  sid := public._student_from_token(p_token);
  if abs(p_day - current_date) > 1 then raise exception 'data_invalida'; end if;
  if jsonb_typeof(p_session) <> 'object' then raise exception 'dados_invalidos'; end if;
  if jsonb_typeof(coalesce(p_session->'facts', '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_session->'facts', '[]'::jsonb)) > 80
     or jsonb_typeof(coalesce(p_session->'attempts', '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_session->'attempts', '[]'::jsonb)) > 80
     or jsonb_typeof(coalesce(p_session->'result', '{}'::jsonb)) <> 'object'
     or (p_session ? 'devices' and jsonb_typeof(p_session->'devices') <> 'object')
  then raise exception 'dados_invalidos'; end if;
  select * into s from students where id = sid;
  res := coalesce(p_session->'result', '{}'::jsonb);
  dev := lower(coalesce(p_session->>'device', ''));
  if dev !~ '^[a-z0-9_-]{1,30}$' then dev := null; end if;

  insert into turbo_students(student_id) values (sid) on conflict do nothing;

  -- fatos que mudaram
  insert into turbo_facts(student_id, fact_id, state, ok_count, ok_days, last_ok_day, good_sessions, review_step, due, recent, lat_ms, stubborn, reached_consolidating)
  select sid, f->>'id', (f->>'s')::smallint, coalesce((f->>'n')::int, 0), coalesce((f->>'daysOk')::int, 0), (f->>'lastOkDay')::date,
         coalesce((f->>'good')::smallint, 0), coalesce((f->>'rev')::smallint, 0), (f->>'due')::date, coalesce(f->'recent', '[]'::jsonb),
         (f->>'lat')::numeric::int, coalesce((f->>'stub')::boolean, false), coalesce((f->>'reached')::boolean, false)
    from jsonb_array_elements(coalesce(p_session->'facts', '[]'::jsonb)) f
  on conflict (student_id, fact_id) do update set
    state = excluded.state, ok_count = excluded.ok_count, ok_days = excluded.ok_days, last_ok_day = excluded.last_ok_day,
    good_sessions = excluded.good_sessions, review_step = excluded.review_step, due = excluded.due, recent = excluded.recent,
    lat_ms = excluded.lat_ms, stubborn = excluded.stubborn, reached_consolidating = excluded.reached_consolidating;

  -- configuração do aluno (aparelhos e nivelamento vêm do motor)
  update turbo_students set
    devices = case when p_session ? 'devices' then p_session->'devices' else devices end,
    placement = case when p_session ? 'placement' then p_session->'placement' else placement end
   where student_id = sid;

  -- o dia
  v_status := case when coalesce((res->>'done')::boolean, false) and not coalesce((res->>'guess')::boolean, false) then 'done'
                   when coalesce((res->>'guess')::boolean, false) then 'guess'
                   when coalesce((res->>'noTask')::boolean, false) then 'no_task'
                   else 'started' end;
  n_call := least(greatest(coalesce((res->>'attempts')::int, 0), 0), 200);
  select status into prev_status from turbo_days where student_id = sid and study_day = p_day;
  insert into turbo_days(student_id, study_day, status, attempts, secs, promoted, demoted, device, finished_at)
    values (sid, p_day, v_status, n_call, least(greatest(coalesce((res->>'secs')::numeric, 0), 0), 14400),
            least(greatest(coalesce((res->>'promoted')::int, 0), 0), 80), least(greatest(coalesce((res->>'demoted')::int, 0), 0), 80), dev,
            case when v_status = 'started' then null else now() end)
  on conflict (student_id, study_day) do update set
    status = case when turbo_days.status = 'done' then 'done' else excluded.status end,
    attempts = turbo_days.attempts + excluded.attempts,
    secs = turbo_days.secs + excluded.secs,
    promoted = turbo_days.promoted + excluded.promoted,
    demoted = turbo_days.demoted + excluded.demoted,
    device = coalesce(excluded.device, turbo_days.device),
    finished_at = coalesce(excluded.finished_at, turbo_days.finished_at);

  -- pacotinho do Turbo do dia (1 por dia: o índice awards_pack_once garante)
  ok_day := p_day >= s.start_date and (extract(dow from p_day)::int = any(s.study_days) or extract(dow from p_day)::int = any(s.free_days));
  select attempts into n_att from turbo_days where student_id = sid and study_day = p_day;
  -- "pelo menos 3 tentativas" vale para esta chamada; só quem pausou e voltou no mesmo dia (dia ainda "started") soma com as anteriores.
  -- Assim uma sessão de chute não deixa a seguinte, curta, levar o pacotinho.
  if coalesce((res->>'pack')::boolean, false) and ok_day and v_status = 'done' and n_att >= 3
     and (n_call >= 3 or coalesce(prev_status, '') = 'started') then
    got := public._give_packs(sid, p_day, 'turbo', 1);
  end if;
  given := exists (select 1 from awards a where a.student_id = sid and a.source = 'turbo' and a.earned_day = p_day and a.kind in ('pacote','figurinha'));
  update turbo_days set pack_given = given where student_id = sid and study_day = p_day;

  -- histórico para os pais: SEMPRE gravado (acertos e erros, com a resposta digitada), sem depender do consentimento.
  -- É dado do próprio aluno, visível só aos adultos responsáveis (RLS de students). turbo_attempts continua só com consentimento e anônima.
  insert into turbo_log(student_id, study_day, fact_id, kind, ok, answer)
  select sid, p_day, a->>'fact', a->>'kind', (a->>'ok')::boolean,
         case when a->>'answer' ~ '^[0-9]{1,4}$' then (a->>'answer')::smallint end
    from jsonb_array_elements(coalesce(p_session->'attempts', '[]'::jsonb)) a;

  -- tentativas, só com consentimento dos responsáveis
  if s.consent_at is not null then
    insert into turbo_attempts(anon_id, student_id, study_day, session_key, fact_id, kind, ok, t1_ms, total_ms, hint, counted, state_before, device)
    select s.anon_id, sid, p_day, left(p_session->>'sessionKey', 60), a->>'fact', a->>'kind', (a->>'ok')::boolean,
           (a->>'t1')::numeric::int, (a->>'total')::numeric::int, coalesce(a->>'hint', 'none'), coalesce((a->>'counted')::boolean, false),
           (a->>'stateBefore')::smallint, dev
      from jsonb_array_elements(coalesce(p_session->'attempts', '[]'::jsonb)) a;
  end if;

  return jsonb_build_object('ok', true, 'pack_given', given, 'pack_new', got > 0,
    'pending_packs', (select count(*) from awards where student_id = sid and kind = 'pacote'));
end $$;

revoke all on function public.student_turbo_save(text, date, jsonb) from public;
grant execute on function public.student_turbo_save(text, date, jsonb) to anon, authenticated;

commit;
