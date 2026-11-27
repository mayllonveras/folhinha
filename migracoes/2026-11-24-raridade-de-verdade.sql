-- Raridade de verdade: rara e ultrarrara passam a ser difíceis POR CARTA, não só por nível.
--
--  Problema: o pacotinho sorteava o nível (70% comum, 25% rara, 5% ultra) e depois uma carta dentro dele. Com 44 comuns, 5 raras e
--  3 ultras por álbum, cada carta tinha 1,6% (comum), 5% (rara) e 1,7% (ultra) de chance: a ultra não era mais difícil que uma comum.
--  Quem abre muito completava as raras em ~42 pacotinhos e as ultras em ~94, antes das comuns (~262). A troca (rara = 2 comuns,
--  ultra = 3) ainda deixava comprar raridade com repetidas comuns.
--
--  O que muda
--  * Sorteio por PESO DA CARTA (_draw_slot): comum 1, rara 0,30 (app_setting 'peso_rara'), ultra 0,10 ('peso_ultra').
--    Por álbum: ~300 pacotinhos para as 5 raras e ~730 para as 3 ultras (mediana); as comuns completam antes (~190).
--    Os pesos se ajustam em app_settings, sem nova migração. 'prob_rara' e 'prob_ultra' deixam de ser usadas.
--  * Proteção contra azar: depois de 'pity_rara' (60) pacotinhos seguidos sem rara nem ultra, o próximo traz uma rara que a criança
--    ainda NÃO tem (se não falta nenhuma rara no álbum, não força nada). 0 desliga. Contador por aluno: students.sem_rara.
--  * Troca por valor: comum 1, rara 4, ultrarrara 12. Com o limite de 6 cartas por lado, uma ultra só se troca por rara/ultra.
--    Pedidos de troca pendentes são cancelados (foram combinados com os valores antigos).
--  * Pacote de boas-vindas: continua com 1 rara garantida por álbum (uma vez só por aluno); o resto usa o sorteio por peso e não repete.
--    A mesa/gaveta NÃO dá figurinha (só o pacote de boas-vindas dava garantia), então não há garantia repetível.
--  * Álbum completo continua exigindo as 52 cartas.
-- Desfazer: no final do arquivo.
begin;

insert into public.app_settings(key, value) values
  ('peso_rara', 0.30),    -- peso de cada carta rara no sorteio (comum = 1)
  ('peso_ultra', 0.10),   -- peso de cada carta ultrarrara
  ('pity_rara', 60)       -- pacotinhos sem rara/ultra até a próxima rara vir garantida (0 = desligado)
on conflict do nothing;

alter table public.students add column sem_rara integer not null default 0;

-- Sorteia uma carta do álbum pelo peso da raridade.
--   p_only: sortear só entre cartas desse nível ('rara', 'ultra', 'comum'); nulo = qualquer.
--   p_avoid: cartas a evitar (já sorteadas na mesma entrega).
--   p_new_only: só cartas que o aluno ainda não tem. Devolve nulo se não sobrar nenhuma.
create or replace function public._draw_slot(p_sid uuid, p_theme text, p_only text default null, p_avoid int[] default '{}', p_new_only boolean default false)
 returns int language plpgsql stable security definer set search_path to 'public'
as $$
declare wr numeric := greatest(app_setting('peso_rara', 0.30), 0.0001); wu numeric := greatest(app_setting('peso_ultra', 0.10), 0.0001); sl int;
begin
  select x.g into sl
    from generate_series(0, 51) x(g)
    left join sticker_rarity sr on sr.theme = p_theme and sr.slot = x.g
   where (p_only is null or coalesce(sr.tier, 'comum') = p_only)
     and x.g <> all(coalesce(p_avoid, '{}'))
     and (not p_new_only or not exists (select 1 from awards a where a.student_id = p_sid and a.kind = 'figurinha' and a.theme = p_theme and a.slot = x.g))
   order by -ln(1 - random()) / case coalesce(sr.tier, 'comum') when 'ultra' then wu when 'rara' then wr else 1 end   -- sorteio ponderado (tempo exponencial)
   limit 1;
  return sl;
end $$;
revoke all on function public._draw_slot(uuid, text, text, int[], boolean) from public, anon, authenticated;
grant execute on function public._draw_slot(uuid, text, text, int[], boolean) to service_role;

-- Valor na troca.
create or replace function public._tier_value(p_theme text, p_slot int) returns int
 language sql stable security definer set search_path to 'public'
as $$ select case coalesce((select tier from sticker_rarity where theme = p_theme and slot = p_slot), 'comum') when 'ultra' then 12 when 'rara' then 4 else 1 end $$;

update trades set status = 'cancelada', answered_at = now(), requester_seen = true where status = 'pendente';

-- Abrir pacotinho (base: 2026-11-21-album-do-adulto.sql).
CREATE OR REPLACE FUNCTION public.student_open_pack(p_token text, p_theme text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; pid uuid; pe date; sl int; tr text; left_n int; copies int; owned int;
  pity int := app_setting('pity_rara', 60)::int;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid;
  if p_theme is null or not (p_theme = any(s.sticker_themes)) then raise exception 'album_invalido'; end if;
  -- o álbum do responsável (espelho) não tem mesa nem limite do Grátis: cada pacotinho dele já nasce com o álbum do pacotinho da criança
  if s.mirror_of is null then
    if p_theme <> all(s.desk_themes) then raise exception 'album_fora_da_mesa'; end if;
    -- no plano Grátis os pacotinhos abrem só no álbum principal (o primeiro liberado)
    if p_theme <> s.sticker_themes[1] and not public._student_vip(sid) then raise exception 'plano_album'; end if;
  end if;
  -- álbum completo não recebe mais pacotinho (as repetidas vêm dos álbuns que ainda faltam)
  select count(distinct slot) into owned from awards where student_id=sid and kind='figurinha' and theme=p_theme;
  if owned >= 52 then raise exception 'album_completo'; end if;
  select id, period_end into pid, pe from awards where student_id=sid and kind='pacote' and (s.mirror_of is null or theme = p_theme) order by earned_at, id limit 1 for update skip locked;
  if pid is null then raise exception 'sem_pacote'; end if;
  -- proteção contra azar: muitos pacotinhos sem rara/ultra e ainda falta uma rara neste álbum -> vem uma rara que falta
  if pity > 0 and s.sem_rara >= pity then
    sl := public._draw_slot(sid, p_theme, 'rara', '{}', true);
  end if;
  if sl is null then sl := public._draw_slot(sid, p_theme); end if;
  tr := coalesce((select tier from sticker_rarity where theme = p_theme and slot = sl), 'comum');
  update students set sem_rara = case when tr in ('rara', 'ultra') then 0 else sem_rara + 1 end where id = sid;
  select count(*) into copies from awards where student_id=sid and kind='figurinha' and theme=p_theme and slot=sl;
  update awards set kind='figurinha', theme=p_theme, slot=sl where id = pid;
  select count(distinct slot) into owned from awards where student_id=sid and kind='figurinha' and theme=p_theme;
  select count(*) into left_n from awards where student_id=sid and kind='pacote';
  perform public._check_albums(sid);
  select * into s from students where id = sid;
  return jsonb_build_object('kind','figurinha','theme',p_theme,'slot',sl,'period_end',pe,'tier',tr,'pending',left_n,
                            'count',owned,'repeated',copies > 0,'copies',copies + 1,
                            'desk',to_jsonb(s.desk_themes),'albums_done',(s.albums_done_at is not null));
end $function$;

-- Boas-vindas (base: 2026-11-15-mesa-gaveta.sql): a 1ª carta de cada álbum é uma rara que ele não tem; as outras, por peso.
CREATE OR REPLACE FUNCTION public.student_welcome(p_token text, p_desk text[] DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare sid uuid; s students%rowtype; i int; sl int; real_t text; got int[]; picks jsonb := '[]'::jsonb;
  today date := current_date; lim int := coalesce(app_setting('limite_mesa', 2)::int, 2); dsk text[]; tt text; per int; seqn int := 0;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid for update;
  if s.welcome_at is not null then raise exception 'ja_recebeu'; end if;
  -- a mesa: com no máximo "limite" álbuns liberados, todos vão para a mesa; com mais, a criança escolheu (p_desk)
  if cardinality(s.sticker_themes) <= lim then dsk := s.sticker_themes;
  else
    dsk := '{}';
    foreach tt in array coalesce(p_desk, '{}'::text[]) loop
      if tt <> all(s.sticker_themes) then raise exception 'album_invalido'; end if;
      if tt <> all(dsk) then dsk := dsk || tt; end if;
    end loop;
    if cardinality(dsk) < 1 then raise exception 'mesa_vazia'; end if;
    if cardinality(dsk) > lim then raise exception 'mesa_cheia'; end if;
  end if;
  -- 5 figurinhas de cada álbum da mesa (com um álbum só na mesa, 10 dele)
  per := case when cardinality(dsk) = 1 then 10 else 5 end;
  foreach tt in array dsk loop
    got := '{}';
    for i in 1..per loop
      sl := null;
      if i = 1 then sl := public._draw_slot(sid, tt, 'rara', got, true); end if;   -- 1 rara garantida por álbum (só aqui, uma vez por aluno)
      if sl is null then sl := public._draw_slot(sid, tt, null, got, true); end if;
      exit when sl is null;   -- álbum já tem quase tudo: entrega só as que faltam
      real_t := coalesce((select sr.tier from sticker_rarity sr where sr.theme = tt and sr.slot = sl), 'comum');
      got := got || sl; seqn := seqn + 1;
      insert into awards(student_id, kind, theme, slot, period_mode, period_start, period_end, earned_day, source, seq)
        values (sid, 'figurinha', tt, sl, 'diario', today, today, today, 'boas_vindas', seqn);
      picks := picks || jsonb_build_object('theme', tt, 'slot', sl, 'tier', real_t);
    end loop;
  end loop;
  update students set welcome_at = now(), desk_themes = dsk, sem_rara = 0 where id = sid;
  perform public._check_albums(sid);
  -- ordem de abertura embaralhada: a rara não vem sempre primeiro
  return jsonb_build_object('desk', (select to_jsonb(desk_themes) from students where id = sid),
    'stickers', (select coalesce(jsonb_agg(e order by random()), '[]'::jsonb) from jsonb_array_elements(picks) e));
end $function$;

commit;

-- Desfazer:
--   1. recriar _tier_value (3/2/1) a partir de 2026-11-14-troca-por-valor.sql, student_open_pack a partir de 2026-11-21-album-do-adulto.sql
--      e student_welcome a partir de 2026-11-15-mesa-gaveta.sql;
--   2. drop function public._draw_slot(uuid, text, text, int[], boolean);
--      alter table public.students drop column sem_rara;
--      delete from public.app_settings where key in ('peso_rara', 'peso_ultra', 'pity_rara');
