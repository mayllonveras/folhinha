# Proposta de grade do 1º ano (30 níveis) — para revisão do professor

Base: inventário `inventario-anos-iniciais.csv` (22 habilidades do 1º ano: 20 treináveis, grupos A e B; fora ficam
**EF01MA16** e **EF01MA22**, grupo C, que são atividades de casa) e as decisões da etapa 4 (30 níveis por ano,
5 carimbos por nível, 20% de cada folha como revisão de níveis anteriores).

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
| 8 | Somas até 10 | EF01MA06 | existe (nível atual 3) | |
| 9 | Subtrações até 10 | EF01MA06 | existe (nível atual 4) | |
| 10 | Somas e subtrações até 10 | EF01MA06, EF01MA08 | existe (nível atual 5) | |
| 11 | Problemas de juntar e tirar | EF01MA08 | **novo** | problemas curtos com figura, resposta digitada, até 10 |
| 12 | Figuras planas | EF01MA14 | existe (`formaPlana` + `qualFigura`) | só círculo, quadrado, retângulo e triângulo; mistura dois geradores porque cada um tem poucas contas distintas |
| 13 | Sólidos e objetos do dia a dia | EF01MA13 | ajustar (`sólidoObjeto`, `sólidoNome`) | a BNCC do 1º ano cita cone, cilindro, esfera e bloco retangular: sem cubo e sem pirâmide |
| 14 | Esquerda, direita, em cima e embaixo | EF01MA11, EF01MA12 | **novo** | figura + escolha |
| 15 | Organizar por cor, forma e tamanho | EF01MA09 | **novo** | figura + escolha ("qual não combina?", "qual é o maior?") |
| 16 | Somas até 20, sem passar da dezena | EF01MA06, EF01MA07 | existe (nível atual 6) | |
| 17 | Somas que passam da dezena | EF01MA06 | existe (nível atual 7) | |
| 18 | Subtrações até 20, sem passar da dezena | EF01MA06 | existe (nível atual 8) | |
| 19 | Subtrações que passam da dezena | EF01MA06 | existe (nível atual 9) | |
| 20 | Somas e subtrações até 20 | EF01MA08 | existe (nível atual 10) | |
| 21 | Dezenas e unidades (barras e cubinhos) | EF01MA07, EF01MA04 | existe (`dezenas`) | |
| 22 | Contar até 100 em grupos de 10 | EF01MA04 | ajustar (`contar20`) | coleções maiores, agrupadas de 10 em 10 |
| 23 | Maior e menor até 99 | EF01MA05 | existe (`maior99`) | |
| 24 | Dezenas inteiras e unidades | EF01MA07 | existe (nível atual 11) | como 30 + 20 e 34 + 5 |
| 25 | Decompor números | EF01MA07 | **novo** | "34 = 30 + ?", resposta digitada |
| 26 | Comparar comprimentos, capacidades e massas | EF01MA15 | **novo** | figura + escolha ("qual é mais comprido?", "qual cabe mais?") |
| 27 | Dias, meses e datas | EF01MA17, EF01MA18 | **novo** | calendário + escolha; períodos do dia, dias da semana, meses |
| 28 | Moedas e cédulas | EF01MA19 | **novo** | figura das moedas e cédulas, valor em reais; o gerador `moedas` atual (centavos) é do 2º ano |
| 29 | Certeza, talvez ou impossível | EF01MA20 | ajustar (`acaso`) | frases mais simples para o 1º ano |
| 30 | Ler gráficos e tabelas | EF01MA21 | ajustar (`graficoLer`) | só gráficos de colunas simples, com valores pequenos |

## Cobertura

- **Habilidades treináveis do 1º ano:** 20 de 20. Todas entram em pelo menos um nível.
- **Fora, por serem atividade de casa:** EF01MA16 (relatar sequência de acontecimentos) e EF01MA22 (pesquisa de campo).
- **Níveis com gerador pronto:** 18 dos 30. **Com ajuste pequeno:** 5 (níveis 2, 13, 22, 29 e 30). **Com gerador novo:** 7 (níveis 11, 14, 15, 25, 26, 27 e 28).

## Ordem

A trilha vai de contagem e comparação (1–6), soma e subtração até 10 (7–11), geometria e posição (12–15), soma e subtração até 20 (16–20),
dezenas e números até 100 (21–25) e grandezas, dinheiro, acaso e dados (26–30). Os níveis de geometria ficam no meio
para variar o tipo de exercício entre os blocos de contas.

## O que acontece com os 45 níveis atuais

Os níveis 1 a 16 da grade atual (sequências, somas e subtrações até 20, dezenas e contas de dois algarismos) são reaproveitados aqui
(níveis 3, 7–10, 16–20 e 24) e nos próximos anos (contas de dois algarismos no 2º ano). A tabuada, a divisão e as equações
(níveis 17 a 45) vão para o 3º, 4º e 5º anos, na grade desses anos. Como o app ainda não está em produção, a grade nova substitui a antiga
quando a migração for aplicada.

## Metas de tempo

Os níveis que já existem mantêm a meta de tempo atual (de 90 a 130 segundos por folha). Os sete novos começam com 120 segundos,
estimados, e são ajustados depois com dados reais de alunos.

## Para o professor decidir

1. A ordem dos níveis está boa, ou prefere mexer em algum bloco?
2. Algum nível que o senhor queira dividir em dois, ou juntar com outro?
3. Os sete geradores novos podem ser feitos em qualquer ordem, ou algum é prioridade?
