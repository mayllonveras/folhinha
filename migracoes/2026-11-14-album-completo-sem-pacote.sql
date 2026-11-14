-- Álbum completo não oferece mais pacotinho: student_open_pack volta a recusar um álbum com as 52 figurinhas.
-- As repetidas continuam saindo, mas só dos álbuns que ainda não estão completos.
begin;

create or replace function public.student_open_pack(p_token text, p_theme text)
 returns jsonb
 language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare sid uuid; s students%rowtype; pid uuid; pe date; sl int; tr text; left_n int; r numeric; copies int; owned int;
  p_ultra numeric := app_setting('prob_ultra', 5)::numeric; p_rara numeric := app_setting('prob_rara', 25)::numeric;
begin
  sid := public._student_from_token(p_token);
  select * into s from students where id = sid;
  if p_theme is null or not (p_theme = any(s.sticker_themes)) then raise exception 'album_invalido'; end if;
  -- álbum completo não recebe mais pacotinho (as repetidas vêm dos álbuns que ainda faltam)
  select count(distinct slot) into owned from awards where student_id=sid and kind='figurinha' and theme=p_theme;
  if owned >= 52 then raise exception 'album_completo'; end if;
  select id, period_end into pid, pe from awards where student_id=sid and kind='pacote' order by earned_at, id limit 1 for update skip locked;
  if pid is null then raise exception 'sem_pacote'; end if;
  r := random() * 100;
  tr := case when r < p_ultra then 'ultra' when r < p_ultra + p_rara then 'rara' else 'comum' end;
  select g into sl from generate_series(0,51) x(g)
   where coalesce((select tier from sticker_rarity where theme = p_theme and slot = x.g), 'comum') = tr
   order by random() limit 1;
  if sl is null then   -- o álbum não tem figurinha dessa raridade: cai para comum
    tr := 'comum';
    select g into sl from generate_series(0,51) x(g)
     where coalesce((select tier from sticker_rarity where theme = p_theme and slot = x.g), 'comum') = 'comum'
     order by random() limit 1;
  end if;
  select count(*) into copies from awards where student_id=sid and kind='figurinha' and theme=p_theme and slot=sl;
  update awards set kind='figurinha', theme=p_theme, slot=sl where id = pid;
  select count(distinct slot) into owned from awards where student_id=sid and kind='figurinha' and theme=p_theme;
  select count(*) into left_n from awards where student_id=sid and kind='pacote';
  return jsonb_build_object('kind','figurinha','theme',p_theme,'slot',sl,'period_end',pe,'tier',tr,'pending',left_n,
                            'count',owned,'repeated',copies > 0,'copies',copies + 1);
end $function$;

commit;
