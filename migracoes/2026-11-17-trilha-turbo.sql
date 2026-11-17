-- Trilha Turbo: tabelas, funções e origem 'turbo' para o pacotinho de figurinha. Especificação: turbo/ESPECIFICACAO.md. Motor: turbo.js.
--
-- *** APLICADA EM PRODUÇÃO em 17/11/2026 (projeto folhinha-calculo), com autorização do professor. NÃO REAPLIQUE: ela cria tabelas e não é repetível. ***
-- Conferência feita no banco real: objetos e permissões criados como projetado; um teste das funções foi rodado numa transação desfeita
-- (get e save, pacotinho 'turbo' uma vez por dia, tentativas só com consentimento) e não deixou dado nenhum.
--
-- O que muda
--  * awards.source passa a aceitar 'turbo' (Turbo do dia = 1 pacotinho por dia, aberto pelo fluxo de sempre, student_open_pack).
--  * turbo_students: configuração por aluno (operações liberadas, idade, contagem de sessões por tipo de aparelho, nivelamento).
--  * turbo_facts: estado de cada fato por aluno (o que o motor precisa para montar a próxima sessão).
--  * turbo_days: a sessão do dia por aluno (uma linha por dia de estudo).
--  * turbo_attempts: uma linha por tentativa, para melhorar o sistema. SÓ com consentimento (students.consent_at), anonimizada ao apagar o aluno,
--    no mesmo padrão de sheet_items.
--  * student_turbo_get(token, dia): devolve tudo que o motor precisa para o dia.
--  * student_turbo_save(token, dia, sessão): grava o resultado da sessão e, se for o caso, entrega o pacotinho.
--  * adult_turbo_summary(aluno, dia): resumo mínimo para o painel dos pais (respeita o RLS de students).
--  * v_turbo_uso: acerto e tempo mediano por fato e aparelho (só o administrador lê).
--
-- O que NÃO muda: sheets, carimbos, nível, sequência de dias, regras de avanço da trilha BNCC.
--
-- Pressupostos a conferir antes de aplicar (estão fora desta pasta de migrações)
--  * O RLS da tabela students já limita o adulto autenticado aos alunos pelos quais ele é responsável (como diz 2026-11-14-permissao-editar-aluno.sql).
--    As políticas dos adultos abaixo reaproveitam isso: "existe o aluno para mim em students".
--  * Existem public._student_from_token(text), public._give_packs(uuid, date, text, int), public.ano_do_aluno(int, int, date) e public.is_admin().
--  * O último awards_source_check é o de 2026-11-15-pacote-boas-vindas.sql (carimbo, perseveranca, marco, troca, boas_vindas).
--
-- Reverter (se for preciso): drop das funções e tabelas turbo_* e da visão v_turbo_uso, apagar os awards com source = 'turbo' e recolocar o
-- awards_source_check sem 'turbo'. Veja o bloco comentado no fim do arquivo.
begin;

-- ===== 1. Origem 'turbo' nos pacotinhos =====
-- O índice único awards_pack_once (aluno, dia, origem, posição) já impede mais de 1 pacotinho 'turbo' por dia.
alter table public.awards drop constraint if exists awards_source_check;
alter table public.awards add constraint awards_source_check
  check (source = any (array['carimbo'::text, 'perseveranca'::text, 'marco'::text, 'troca'::text, 'boas_vindas'::text, 'turbo'::text]));

-- ===== 2. Tabelas =====
create or replace function public.turbo_touch() returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;

create table public.turbo_students (
  student_id uuid primary key references public.students(id) on delete cascade,
  unlocked text[] not null default array['soma']::text[]
    check (cardinality(unlocked) >= 1 and unlocked <@ array['soma','sub','mult','div']::text[]),   -- primeiro corte: só a soma
  age int check (age between 5 and 12),                         -- nulo = o app calcula pelo ano escolar
  devices jsonb not null default '{}'::jsonb check (jsonb_typeof(devices) = 'object'),   -- sessões por tipo de aparelho: {"tablet": 12, "celular": 3}
  placement jsonb,                                              -- resultado do nivelamento da primeira entrada
  skip_placement boolean not null default false,                -- os pais pularam o nivelamento no cadastro
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger turbo_students_touch before update on public.turbo_students for each row execute function public.turbo_touch();

create table public.turbo_facts (
  student_id uuid not null references public.students(id) on delete cascade,
  fact_id text not null check (fact_id ~ '^(\+|-|×|÷):[0-9]{1,2}:[0-9]{1,2}$'),   -- ex.: +:3:7, -:10:4, ×:6:7, ÷:42:6 (ids do turbo.js)
  state smallint not null default 0 check (state between 0 and 5),   -- 0 na fila, 1 novo, 2 aprendendo, 3 consolidando, 4 provável, 5 maduro
  ok_count int not null default 0 check (ok_count >= 0),             -- recuperações corretas
  ok_days int not null default 0 check (ok_days >= 0),               -- dias diferentes com recuperação correta
  last_ok_day date,
  good_sessions smallint not null default 0 check (good_sessions >= 0),   -- sessões boas seguidas em consolidando
  review_step smallint not null default 0 check (review_step between 0 and 5),   -- revisões já passadas no calendário 1, 3, 7, 14, 30
  due date,                                                          -- próxima revisão
  recent jsonb not null default '[]'::jsonb check (jsonb_typeof(recent) = 'array' and jsonb_array_length(recent) <= 10),   -- últimas 10 tentativas
  lat_ms int check (lat_ms is null or lat_ms between 0 and 600000),  -- mediana do tempo até o primeiro toque, em ms
  stubborn boolean not null default false,
  reached_consolidating boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (student_id, fact_id)
);
create index turbo_facts_due on public.turbo_facts(student_id, due) where state >= 1;
create trigger turbo_facts_touch before update on public.turbo_facts for each row execute function public.turbo_touch();

create table public.turbo_days (
  student_id uuid not null references public.students(id) on delete cascade,
  study_day date not null,
  status text not null default 'started' check (status in ('started','done','no_task','guess')),
  attempts int not null default 0 check (attempts >= 0),
  secs numeric not null default 0 check (secs >= 0),
  promoted int not null default 0 check (promoted >= 0),   -- fatos que subiram de estado no dia (alerta de "3 sessões sem progresso")
  demoted int not null default 0 check (demoted >= 0),
  device text check (device is null or device ~ '^[a-z0-9_-]{1,30}$'),
  pack_given boolean not null default false,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  primary key (student_id, study_day)
);

create table public.turbo_attempts (
  id bigint generated always as identity primary key,
  anon_id uuid not null,
  student_id uuid references public.students(id) on delete set null,
  at timestamptz not null default now(),
  study_day date not null,
  session_key text check (session_key is null or char_length(session_key) <= 60),
  fact_id text not null check (fact_id ~ '^(\+|-|×|÷):[0-9]{1,2}:[0-9]{1,2}$'),
  kind text not null check (kind in ('revisao','novo','reinsercao','nivelamento','aquecimento')),
  ok boolean not null,
  t1_ms int check (t1_ms is null or t1_ms between 0 and 600000),        -- até o primeiro toque
  total_ms int check (total_ms is null or total_ms between 0 and 600000),   -- até confirmar a resposta
  hint text check (hint in ('none','before','after','demand')),
  counted boolean not null default false,                                -- contou nos dedos
  state_before smallint check (state_before between 0 and 5),
  device text check (device is null or device ~ '^[a-z0-9_-]{1,30}$')
);
create index turbo_attempts_anon on public.turbo_attempts(anon_id, at);
create index turbo_attempts_fato on public.turbo_attempts(fact_id);

-- ===== 3. Acesso =====
alter table public.turbo_students enable row level security;
alter table public.turbo_facts enable row level security;
alter table public.turbo_days enable row level security;
alter table public.turbo_attempts enable row level security;
revoke all on table public.turbo_students, public.turbo_facts, public.turbo_days, public.turbo_attempts from anon, authenticated;

-- Adulto: lê os dados dos alunos pelos quais é responsável (o RLS de students faz o filtro) e configura o programa Turbo do aluno.
grant select on table public.turbo_students, public.turbo_facts, public.turbo_days to authenticated;
grant insert (student_id, unlocked, age, skip_placement), update (unlocked, age, skip_placement) on table public.turbo_students to authenticated;
create policy turbo_students_adulto_sel on public.turbo_students for select to authenticated using (exists (select 1 from public.students s where s.id = turbo_students.student_id));
create policy turbo_students_adulto_ins on public.turbo_students for insert to authenticated with check (exists (select 1 from public.students s where s.id = turbo_students.student_id));
create policy turbo_students_adulto_upd on public.turbo_students for update to authenticated
  using (exists (select 1 from public.students s where s.id = turbo_students.student_id))
  with check (exists (select 1 from public.students s where s.id = turbo_students.student_id));
create policy turbo_facts_adulto_sel on public.turbo_facts for select to authenticated using (exists (select 1 from public.students s where s.id = turbo_facts.student_id));
create policy turbo_days_adulto_sel on public.turbo_days for select to authenticated using (exists (select 1 from public.students s where s.id = turbo_days.student_id));

-- Administrador: lê tudo, inclusive as tentativas. Ninguém escreve direto; a criança escreve só pelas funções student_turbo_*.
grant select on table public.turbo_attempts to authenticated;
create policy turbo_students_admin on public.turbo_students for select to authenticated using (public.is_admin());
create policy turbo_facts_admin on public.turbo_facts for select to authenticated using (public.is_admin());
create policy turbo_days_admin on public.turbo_days for select to authenticated using (public.is_admin());
create policy turbo_attempts_admin on public.turbo_attempts for select to authenticated using (public.is_admin());

-- ===== 4. Aluno: ler o estado do dia =====
-- Devolve o que o motor (turbo.js) precisa: configuração, fatos e como está o dia. Datas voltam como texto AAAA-MM-DD.
create or replace function public.student_turbo_get(p_token text, p_day date)
 returns jsonb
 language plpgsql stable security definer set search_path to 'public', 'extensions'
as $$
declare sid uuid; s students%rowtype; ta turbo_students%rowtype; dr turbo_days%rowtype; ok_day boolean; ano int;
begin
  sid := public._student_from_token(p_token);
  if abs(p_day - current_date) > 1 then raise exception 'data_invalida'; end if;
  select * into s from students where id = sid;
  select * into ta from turbo_students where student_id = sid;
  select * into dr from turbo_days where student_id = sid and study_day = p_day;
  ok_day := p_day >= s.start_date and (extract(dow from p_day)::int = any(s.study_days) or extract(dow from p_day)::int = any(s.free_days));
  ano := public.ano_do_aluno(s.ano_escolar, s.ano_ref, p_day);
  return jsonb_build_object(
    'unlocked', coalesce(ta.unlocked, array['soma']::text[]),
    'age', coalesce(ta.age, ano + 5, 7),
    'devices', coalesce(ta.devices, '{}'::jsonb),
    'placement', ta.placement,
    'skip_placement', coalesce(ta.skip_placement, false),
    'study_day', ok_day,
    'today', jsonb_build_object('status', coalesce(dr.status, 'none'), 'attempts', coalesce(dr.attempts, 0),
      'pack_given', exists (select 1 from awards a where a.student_id = sid and a.source = 'turbo' and a.earned_day = p_day and a.kind in ('pacote','figurinha'))),
    'pending_packs', (select count(*) from awards where student_id = sid and kind = 'pacote'),
    'facts', coalesce((select jsonb_agg(jsonb_build_object('id', f.fact_id, 's', f.state, 'n', f.ok_count, 'daysOk', f.ok_days, 'lastOkDay', f.last_ok_day,
        'good', f.good_sessions, 'rev', f.review_step, 'due', f.due, 'recent', f.recent, 'lat', f.lat_ms, 'stub', f.stubborn, 'reached', f.reached_consolidating))
        from turbo_facts f where f.student_id = sid), '[]'::jsonb));
end $$;

-- ===== 5. Aluno: gravar a sessão =====
-- p_session = {
--   facts:   [{id, s, n, daysOk, lastOkDay, good, rev, due, recent, lat, stub, reached}]   só os fatos que mudaram (no máximo 80)
--   devices: {"tablet": 12, ...}  (contagem atualizada)           placement: {...} ou nulo
--   device:  "tablet"             attempts: [{fact, kind, ok, t1, total, hint, counted, stateBefore}] (no máximo 80)
--   result:  {done, noTask, guess, pack, attempts, secs, promoted, demoted}
-- }
-- Pode ser chamada mais de uma vez no mesmo dia (pausa e retorno). O pacotinho só sai se: o dia é de estudo ou dia livre, a sessão foi concluída,
-- não foi "chute", teve pelo menos 3 tentativas e ainda não saiu naquele dia. O servidor confia no cliente para "concluída", como já faz
-- com os acertos e o tempo da folha em student_submit_sheet.
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

revoke all on function public.student_turbo_get(text, date), public.student_turbo_save(text, date, jsonb) from public;
grant execute on function public.student_turbo_get(text, date), public.student_turbo_save(text, date, jsonb) to anon, authenticated;

-- ===== 6. Painel dos pais (resumo mínimo) =====
-- security invoker: o adulto só enxerga os alunos que o RLS de students deixa. Devolve o necessário para: sessão de hoje feita?, fatos firmes por
-- operação, fatos teimosos e mais lentos, aparelhos usados, e os fatos promovidos nos últimos 3 dias com sessão (alerta de "sem progresso").
create or replace function public.adult_turbo_summary(p_student uuid, p_day date)
 returns jsonb
 language sql stable security invoker set search_path to 'public'
as $$
  select jsonb_build_object(
    'today', (select jsonb_build_object('status', d.status, 'attempts', d.attempts, 'pack_given', d.pack_given) from turbo_days d where d.student_id = p_student and d.study_day = p_day),
    'ops', coalesce((select jsonb_object_agg(op, jsonb_build_object('registered', n, 'firm', firm, 'learning', learning))
        from (select case left(fact_id, 1) when '+' then 'soma' when '-' then 'sub' when '×' then 'mult' else 'div' end as op,
                     count(*) as n, count(*) filter (where state >= 4) as firm, count(*) filter (where state between 1 and 3) as learning
                from turbo_facts where student_id = p_student group by 1) t), '{}'::jsonb),
    'stubborn', coalesce((select jsonb_agg(fact_id) from (select fact_id from turbo_facts where student_id = p_student and stubborn order by lat_ms desc nulls last limit 3) t), '[]'::jsonb),
    'slowest', coalesce((select jsonb_agg(fact_id) from (select fact_id from turbo_facts where student_id = p_student and state >= 2 and lat_ms is not null order by lat_ms desc limit 3) t), '[]'::jsonb),
    'devices', (select devices from turbo_students where student_id = p_student),
    'last3_promoted', coalesce((select jsonb_agg(promoted order by study_day desc) from (select promoted, study_day from turbo_days
        where student_id = p_student and status in ('done','guess','started') order by study_day desc limit 3) t), '[]'::jsonb));
$$;
revoke all on function public.adult_turbo_summary(uuid, date) from public, anon;
grant execute on function public.adult_turbo_summary(uuid, date) to authenticated;

-- ===== 7. Visão para o administrador =====
-- Acerto e tempo mediano até o primeiro toque, por fato e aparelho (base dos experimentos do item 10 da especificação).
create or replace view public.v_turbo_uso with (security_invoker = true) as
  select fact_id, device, count(*) as tentativas, round(avg(ok::int)::numeric, 3) as acerto,
         percentile_cont(0.5) within group (order by t1_ms) filter (where ok and not counted) as mediana_t1_ms
    from public.turbo_attempts group by fact_id, device;
revoke all on public.v_turbo_uso from public, anon;
grant select on public.v_turbo_uso to authenticated;

commit;

-- ===== REVERTER (rode só se precisar desfazer; apaga os dados da Turbo) =====
-- begin;
-- drop view if exists public.v_turbo_uso;
-- drop function if exists public.adult_turbo_summary(uuid, date);
-- drop function if exists public.student_turbo_save(text, date, jsonb);
-- drop function if exists public.student_turbo_get(text, date);
-- drop table if exists public.turbo_attempts, public.turbo_days, public.turbo_facts, public.turbo_students;
-- drop function if exists public.turbo_touch();
-- delete from public.awards where source = 'turbo';
-- alter table public.awards drop constraint awards_source_check;
-- alter table public.awards add constraint awards_source_check
--   check (source = any (array['carimbo'::text, 'perseveranca'::text, 'marco'::text, 'troca'::text, 'boas_vindas'::text]));
-- commit;
