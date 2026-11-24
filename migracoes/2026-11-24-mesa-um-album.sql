-- A mesa passa a ter um álbum só.
--  * app_settings.limite_mesa = 1 (as funções do banco que montam a mesa usam esse limite).
--  * Quem já tinha mais de um álbum na mesa fica só com o primeiro; os outros continuam liberados, na gaveta.
-- O app (student.js e adult.js) também trava em 1, e o parâmetro saiu do painel de administração.
insert into public.app_settings(key, value) values ('limite_mesa', 1)
  on conflict (key) do update set value = excluded.value;

update public.students
   set desk_themes = desk_themes[1:1]
 where desk_themes is not null and cardinality(desk_themes) > 1;
