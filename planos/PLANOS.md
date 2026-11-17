# Planos, pagamento, cupons e indicação

Decisões do professor (17/11/2026) e a ordem de implementação.

## Decisões

- **Plano por família**, com até 4 crianças. Professores ficam para depois, num plano "Turma" separado; até lá, o /adm pode dar VIP com um limite de alunos maior.
- **Grátis:** 1 criança, 2 folhas por dia, 1 álbum, pacotinhos só de boas-vindas e de dias seguidos, sem amigos/trocas, sem Trilha Turbo, painel dos pais sem a aba Atenção. Todos os anos e vídeos ficam liberados.
- **VIP:** R$ 24,90 por mês ou R$ 199 por ano (33% de desconto).
- **Teste:** toda conta nova começa com 14 dias de VIP, sem cartão.
- **Fundador:** só a conta do professor, com VIP vitalício. As outras contas de hoje são de teste e ficam no Grátis.
- **Pagamento:** Asaas (Pix Automático, cartão e boleto, com nota fiscal automática).
- **Indicação:** quem indica ganha 1 mês grátis quando o indicado paga e passam 7 dias (prazo de arrependimento). Cada filho de quem indicou ganha um pacote especial. O indicado ganha 30 dias de teste em vez de 14.
- Quando o VIP acaba, **nada se perde**: figurinhas, amigos e histórico ficam guardados. Só param de crescer.

## Fases

| Fase | O que entra | Situação |
|---|---|---|
| 1 | `entitlements`, limites do Grátis no banco, teste de 14 dias, Fundador, "Dar VIP" no /adm, tela Planos | `migracoes/2026-11-17-plano-vip.sql` |
| 2 | Cupons (% de desconto, valor fixo, meses grátis, vitalício), tela de cupons no /adm | a fazer |
| 3 | Asaas: assinatura mensal e anual, webhook numa Edge Function do Supabase, histórico de pagamentos | a fazer |
| 4 | Indicação: link, 1 mês grátis, pacote especial das crianças, painel de indicações | a fazer |

## Como a fase 1 funciona

- `entitlements` é a única fonte de verdade de "esta conta é VIP até tal data". Cupom, assinatura e indicação (fases 2 a 4) vão só **inserir linhas** nela, com a sua `source`.
- O aluno segue o plano de quem o cadastrou (`students.created_by`).
- Toda trava é no banco. As telas só explicam o plano e evitam mandar o adulto a um erro.
- Os números do plano ficam em `app_settings` (`plano_*`) e o /adm edita em Parâmetros.
- A aba Atenção do painel dos pais é trancada **só na tela**: os dados vêm da tabela `sheets`, que os pais leem pelo RLS (e são dados do próprio filho).

Testes do banco: `testes/banco/planos.sh` (usa a cópia da estrutura de produção em `testes/banco/replica/`).
