-- Correção da migração 2026-11-17-trilha-turbo.sql: student_turbo_get passa a ser VOLÁTIL.
--
-- Problema: a função foi criada como STABLE. A API do Supabase roda função estável numa transação SÓ DE LEITURA, e a função chama
-- _student_from_token, que atualiza student_sessions.last_seen. Resultado pela API: "cannot execute UPDATE in a read-only transaction" (25006).
-- O app engole o erro e esconde o cartão da Turbo. Num teste direto no SQL (transação de escrita) o erro não aparece.
-- As outras funções do aluno que conferem o token (student_me, student_turbo_save...) já são voláteis.
--
-- Mudança: só o atributo de volatilidade. Mesma assinatura, mesmo corpo, nenhum dado muda. Repetir é inofensivo.
-- Reverter: alter function public.student_turbo_get(text, date) stable;   (traz o erro de volta; não faça)
alter function public.student_turbo_get(text, date) volatile;
