# Proposta de grade do 1º ano (33 níveis) — para revisão do professor

Base: inventário `inventario-anos-iniciais.csv` (22 habilidades do 1º ano: 20 treináveis, grupos A e B; fora ficam
**EF01MA16** e **EF01MA22**, grupo C, que são atividades de casa) e as decisões da etapa 4.

**Critério:** a dificuldade entra aos poucos. Cada degrau novo (uma operação nova, um intervalo maior, um tipo novo de
exercício) tem o seu nível. Os "30 níveis por ano" são uma **referência de ritmo**, não um limite: com 5 carimbos por nível,
o aluno regular faz 1 nível por semana, e 33 níveis cabem nas cerca de 40 semanas do ano letivo com folga de 7 semanas.
Acima de uns 35 níveis a folga começa a apertar; nesse caso se ajustam os carimbos por nível, e não a progressão.

Legenda de "Gerador": **existe** = já está no app (os 45 níveis atuais ou o catálogo de exercícios da etapa 3);
**ajustar** = existe, mas precisa de uma mudança pequena; **novo** = precisa ser escrito.

| Nº | Nível | Habilidades | Gerador | Nota |
|---|---|---|---|---|
| 1 | Contar objetos até 10 | EF01MA02 | existe (`contar10`) | |
| 2 | Mais, menos ou igual | EF01MA03 | ajustar (`aMais`) | limitar a grupos de até 10 |
| 3 | Sequências numéricas até 20 | EF01MA10, EF01MA01 | existe (nível atual 1) | |
| 4 | Contar objetos até 20 | EF01MA02, EF01MA04 | existe (`contar20`) | |
| 5 | Antes, depois e posição na fila | EF01MA01, EF01MA05 | existe (`vizinho` + `fila`) | dois geradores no mesmo nível |
| 6 | Maior e menor até 20 | EF01MA05 | existe (`maior20`) | |
| 7 | Somar de 1 a 3 | EF01MA06 | existe (nível atual 2) | |
| 8 | **Tirar de 1 a 3** | EF01MA06 | ajustar (subtração até 10, tirando só 1, 2 ou 3) | degrau que faltava: a soma tinha etapa de 1 a 3 e a subtração ia direto para "até 10" |
| 9 | Somas até 10 | EF01MA06 | existe (nível atual 3) | |
| 10 | Subtrações até 10 | EF01MA06 | existe (nível atual 4) | |
| 11 | Somas e subtrações até 10 | EF01MA06, EF01MA08 | existe (nível atual 5) | |
| 12 | Problemas de juntar e tirar, até 10 | EF01MA08 | **novo** | problemas curtos com figura, resposta digitada |
| 13 | Figuras planas | EF01MA14 | existe (`formaPlana` + `qualFigura`) | só círculo, quadrado, retângulo e triângulo; mistura dois geradores porque cada um tem poucas contas distintas |
| 14 | Sólidos e objetos do dia a dia | EF01MA13 | ajustar (`sólidoObjeto`, `sólidoNome`) | a BNCC do 1º ano cita cone, cilindro, esfera e bloco retangular: sem cubo e sem pirâmide |
| 15 | Esquerda, direita, em cima e embaixo | EF01MA11, EF01MA12 | **novo** | figura + escolha |
| 16 | Organizar por cor, forma e tamanho | EF01MA09 | **novo** | figura + escolha ("qual não combina?", "qual é o maior?") |
| 17 | Somas até 20, sem passar da dezena | EF01MA06, EF01MA07 | existe (nível atual 6) | |
| 18 | Somas que passam da dezena | EF01MA06 | existe (nível atual 7) | |
| 19 | Subtrações até 20, sem passar da dezena | EF01MA06 | existe (nível atual 8) | |
| 20 | Subtrações que passam da dezena | EF01MA06 | existe (nível atual 9) | |
| 21 | Somas e subtrações até 20 | EF01MA08 | existe (nível atual 10) | |
| 22 | **Problemas de juntar e tirar, até 20** | EF01MA08 | **novo** (o mesmo gerador do nível 12, com números até 20) | o problema acompanha o intervalo das contas |
| 23 | Dezenas e unidades (barras e cubinhos) | EF01MA07, EF01MA04 | existe (`dezenas`) | |
| 24 | Contar até 100 em grupos de 10 | EF01MA04 | ajustar (`contar20`) | coleções maiores, agrupadas de 10 em 10 |
| 25 | Maior e menor até 99 | EF01MA05 | existe (`maior99`) | |
| 26 | Dezenas inteiras e unidades | EF01MA07 | existe (nível atual 11) | como 30 + 20 e 34 + 5 |
| 27 | Decompor números | EF01MA07 | **novo** | "34 = 30 + ?", resposta digitada |
| 28 | Comparar comprimentos, capacidades e massas | EF01MA15 | **novo** | figura + escolha ("qual é mais comprido?", "qual cabe mais?") |
| 29 | **Períodos do dia, dias da semana e meses** | EF01MA17 | **novo** | calendário + escolha |
| 30 | **Datas no calendário** | EF01MA18 | **novo** (o mesmo gerador do nível 29) | escrever e ler uma data, dia da semana de uma data; vem depois porque exige mais do que reconhecer os dias e os meses |
| 31 | Moedas e cédulas | EF01MA19 | **novo** | figura das moedas e cédulas, valor em reais; o gerador `moedas` atual (centavos) é do 2º ano |
| 32 | Certeza, talvez ou impossível | EF01MA20 | ajustar (`acaso`) | frases mais simples para o 1º ano |
| 33 | Ler gráficos e tabelas | EF01MA21 | ajustar (`graficoLer`) | só gráficos de colunas simples, com valores pequenos |

## O que mudou em relação à primeira versão (30 níveis)

- **Nível 8 (tirar de 1 a 3):** novo, pela observação do professor sobre a assimetria entre soma e subtração.
- **Nível 22 (problemas até 20):** o problema de juntar e tirar passa a acompanhar o intervalo das contas.
- **Níveis 29 e 30:** "dias e meses" e "datas" deixam de ser um nível só, porque escrever uma data é mais difícil do que reconhecer os dias e os meses.

## Cobertura

- **Habilidades treináveis do 1º ano:** 20 de 20. Todas entram em pelo menos um nível.
- **Fora, por serem atividade de casa:** EF01MA16 (relatar sequência de acontecimentos) e EF01MA22 (pesquisa de campo).
- **Níveis com gerador pronto:** 18 dos 33. **Com ajuste pequeno:** 6 (níveis 2, 8, 14, 24, 32 e 33).
  **Com gerador novo:** 9 níveis, que usam 7 geradores (problemas de juntar e tirar, esquerda e direita, atributos, decompor, medidas, calendário, moedas e cédulas).

## Ordem

A trilha vai de contagem e comparação (1–6), soma e subtração até 10 (7–12), geometria e posição (13–16),
soma e subtração até 20 (17–22), dezenas e números até 100 (23–27) e grandezas, tempo, dinheiro, acaso e dados (28–33).
Os níveis de geometria ficam no meio para variar o tipo de exercício entre os blocos de contas.

## O que acontece com os 45 níveis atuais

Os níveis 1 a 16 da grade atual (sequências, somas e subtrações até 20, dezenas e contas de dois algarismos) são reaproveitados aqui
(níveis 3, 7, 9–11, 17–21 e 26) e nos próximos anos (contas de dois algarismos no 2º ano). A tabuada, a divisão e as equações
(níveis 17 a 45) vão para o 3º, 4º e 5º anos, na grade desses anos. Como o app ainda não está em produção, a grade nova substitui a antiga
quando a migração for aplicada.

## Metas de tempo

Os níveis que já existem mantêm a meta de tempo atual (de 90 a 130 segundos por folha). Os novos começam com 120 segundos,
estimados, e são ajustados depois com dados reais de alunos.

## Para o professor decidir

1. A ordem dos níveis está boa, ou prefere mexer em algum bloco?
2. Há outro degrau que falte, como o da subtração? Por exemplo, a adição ou a subtração até 20 pedindo uma etapa a mais.
3. Os sete geradores novos podem ser feitos em qualquer ordem, ou algum é prioridade?
