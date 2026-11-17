-- Uma conta que já existia antes da migração do plano: ela deve ganhar o Fundador (e não o teste).
insert into auth.users(id, email) values ('00000000-0000-0000-0000-00000000a000', 'antiga@teste.local');
