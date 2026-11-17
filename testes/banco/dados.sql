insert into public.students(id, created_by, token, start_date, study_days, ano_escolar, consent_at) values
 ('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-00000000000a','tokA', current_date-30, '{0,1,2,3,4,5,6}', 2, now()),
 ('00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-00000000000b','tokB', current_date-30, '{0,1,2,3,4,5,6}', 1, null);
insert into public.student_sessions(student_id) select id from public.students;
