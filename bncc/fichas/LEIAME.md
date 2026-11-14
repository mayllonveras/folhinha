# Fichas dos níveis

Cada nível da grade nasce de uma **ficha**: habilidade BNCC, o que a criança faz, figura, parâmetros de dificuldade, opções erradas,
quantidade de contas diferentes, meta de tempo, exemplos e testes automáticos. As fichas são revisadas pelo professor antes de virar código.

## 1º ano (35 níveis, ordem em `../GRADE-1ANO.md`)

| Arquivo | Níveis | Conteúdo |
|---|---|---|
| `1ano-niveis-01-07.md` | 1 a 7 | contagem e comparação |
| `1ano-niveis-08-13.md` | 8 a 13 | soma e subtração até 10, problemas |
| `1ano-niveis-14-18.md` | 14 a 18 | figuras planas, sólidos, posição, atributos e padrões, dezena mais um número |
| `1ano-niveis-19-24.md` | 19 a 24 | somas e subtrações até 20, problemas até 20 |
| `1ano-niveis-25-29.md` | 25 a 29 | dezenas e números até 100 |
| `1ano-niveis-30-35.md` | 30 a 35 | medidas, tempo, dinheiro, acaso e dados |

As regras comuns a todos os níveis ficam no começo de `1ano-niveis-01-07.md`.

## Código dos geradores (`grade1.js`, testes em `testes/grade1.test.js`)

| Níveis | Estado |
|---|---|
| 1 a 35 | **grade inteira do 1º ano**: gerador e testes prontos (14/11/2026); aparecem na aba Exercícios do `/adm`; **ainda não ligados aos níveis do app** |

Os 35 níveis do 1º ano estão prontos e ligados ao app (`FC.LEVELS` em `grade1.js`; migração `2026-11-14-grade-1ano.sql`).

## Próximos passos

1. Revisão do professor do último bloco (níveis 30 a 35).
2. Etapa 4a (mecanismos: carimbos por nível, revisão de 20%, folha de revisão e desafio no teto, sugestão de teto +2).
3. Código dos geradores, por bloco, com os testes das fichas.
4. 2º ao 5º ano, com o mesmo processo.
