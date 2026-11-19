-- Mesa com um álbum só: o limite da mesa passa a 1 (o restante dos álbuns liberados fica na gaveta).
--  * app_settings.limite_mesa = 1 (continua editável em /adm, de 1 a 5).
--  * Quem já tinha 2 álbuns na mesa fica só com o primeiro; o outro vai para a gaveta (nada se perde: as figurinhas continuam valendo).
-- Aplicar ANTES de publicar o site novo.
begin;

insert into public.app_settings(key, value) values ('limite_mesa', 1)
  on conflict (key) do update set value = 1, updated_at = now();

update public.students set desk_themes = desk_themes[1:1] where cardinality(desk_themes) > 1;

commit;
