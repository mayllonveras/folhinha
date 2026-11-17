-- Contas que já existiam antes da migração: a do professor ganha o Fundador vitalício; as outras (de teste) não ganham nada.
insert into auth.users(id, email) values ('7b696275-c979-40a9-bebb-8a6f0d5f2978', 'professor@teste.local'), ('00000000-0000-0000-0000-00000000a000', 'antiga@teste.local');
