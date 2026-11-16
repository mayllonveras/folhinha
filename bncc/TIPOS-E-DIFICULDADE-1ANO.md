# 1º ano — tipos de conta e nota de dificuldade, por nível (para revisão do professor)

Mesma ideia do 2º, 3º e 4º ano (ver `TIPOS-E-DIFICULDADE-2ANO.md`, `-3ANO.md` e `-4ANO.md`), agora para os níveis **1 a 35** do 1º ano. Já está implementada em `grade1.js` (`ESPEC1`), pelo mesmo motor (`plano.js`); só entra no app depois da sua aprovação.

## Como funciona

- **Rodízio:** as 5 folhas do dia cobrem **todos os tipos** da lista de cada nível, todo dia. O tipo mais fácil vai à folha 1, o seguinte à folha 2, e assim por diante (a ordem é medida, não a da tabela).
- **Rampa:** cada conta tem nota de dificuldade relativa ao nível. A folha 1 usa as mais fáceis e a folha 5 as mais difíceis (faixas de 0–40%, 15–55%, 30–70%, 45–85% e 60–100%). Dentro da folha, as contas do nível vão do mais fácil ao mais difícil.
- **Medido** (100 dias simulados por nível): a dificuldade média da folha 1 à 5 vai de cerca de 15–40 até 55–84, em escala de 0 a 100, e nunca desce. Os níveis 8, 14, 15, 17 e 34, com poucos graus de dificuldade, sobem menos (de 13 a 30 pontos).
- **Níveis de figuras** (formas, posição, sólidos, comparar barras e potes): a nota usa o que a figura tem de difícil: o nome da forma (círculo, quadrado e triângulo antes de retângulo, pentágono, hexágono e losango), o número de itens na fila e quão parecidos são os tamanhos.
- **A nota é regra nossa**, ainda sem calibrar com crianças. Como são crianças que estão começando, a folha 1 é a mais leve possível dentro do que o nível sorteia, mas o nível inteiro continua sendo o do dia.

Legenda: "**mais difícil**" = o que sobe a nota; ">" quer dizer "mais difícil que".

## Contagem e comparação

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 1 Contar objetos até 10 | 1 contar objetos até 10 | mais objetos (de 1 a 10) |
| 2 Mais, menos ou igual | 1 onde tem mais · 2 onde tem menos | quantidades parecidas · onde tem menos > onde tem mais · mais objetos |
| 3 Sequências numéricas até 20 | 1 fila que sobe · 2 fila que desce | fila que desce > fila que sobe · o número que falta mais para o fim · números maiores |
| 4 Contar objetos até 20 | 1 contar objetos até 20 | mais objetos (de 11 a 20) |
| 5 Contar objetos soltos até 20 | 1 contar objetos soltos até 20 | mais objetos soltos (de 10 a 20) |
| 6 Antes, depois e posição na fila | 1 que número vem depois · 2 que número vem antes · 3 que número está entre · 4 posição na fila | posição na fila > que número está entre > antes > depois · números maiores |
| 7 Maior e menor até 20 | 1 o maior · 2 o menor | números próximos · o menor > o maior · números maiores |

## Soma e subtração até 10

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 8 Somas e subtrações até 5 | 1 soma · 2 subtração | subtração > soma · números maiores |
| 9 Somar e tirar de 1 a 3, até 10 | 1 soma · 2 subtração | subtração > soma · números maiores |
| 10 Somas até 10 | 1 somar 1 · 2 somar 2 ou 3 | somar 2 ou 3 > somar 1 · parcela maior |
| 11 Subtrações até 10 | 1 subtração até 10 | minuendo e subtraendo maiores (poucos graus de dificuldade) |
| 12 Somas e subtrações até 10 | 1 soma · 2 subtração | subtração > soma · números maiores |
| 13 Problemas de juntar e tirar, até 10 | 1 juntar · 2 acrescentar · 3 separar · 4 retirar | retirar e separar > juntar e acrescentar · números maiores |

## Formas, posição e padrões

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 14 Figuras planas | 1 como se chama a figura · 2 qual destas é a figura | qual destas é a figura > como se chama · retângulo, pentágono, hexágono e losango > círculo, quadrado e triângulo |
| 15 Sólidos e objetos do dia a dia | 1 objeto com a forma do sólido · 2 nome do sólido · 3 sólido de um objeto · 4 face do sólido | face do sólido > objeto com a forma do sólido e sólido de um objeto > nome do sólido |
| 16 Esquerda, direita, em cima e embaixo | 1 em cima e embaixo · 2 esquerda e direita · 3 na caixa | na caixa > esquerda e direita > em cima e embaixo · mais itens na fila |
| 17 Atributos e padrões de figuras | 1 a figura que não combina · 2 a maior ou a menor figura · 3 a figura que vem depois | a figura que vem depois > a que não combina > a maior ou a menor |

## Contas até 20

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 18 Dezena mais um número | 1 dezena + número · 2 dezena − número | subtração > soma · número maior |
| 19 Somas até 20, sem passar da dezena | 1 soma até 20, sem passar da dezena | unidades maiores (poucos graus de dificuldade) |
| 20 Somas que passam da dezena | 1 soma que passa da dezena | unidades maiores · somas que chegam a 20 |
| 21 Subtrações até 20, sem passar da dezena | 1 subtração até 20, sem passar da dezena | número subtraído maior · número maior |
| 22 Subtrações que passam da dezena | 1 subtração que passa da dezena | número subtraído maior que as unidades · subtrações a partir de 20 |
| 23 Somas e subtrações até 20 | 1 soma sem passar da dezena · 2 soma que passa da dezena · 3 subtração sem passar da dezena · 4 subtração que passa da dezena | subtração que passa da dezena > subtração sem passar > soma que passa da dezena > soma sem passar · subtrações a partir de 20 |
| 24 Problemas de juntar e tirar, até 20 | 1 juntar · 2 acrescentar · 3 separar · 4 retirar | retirar e separar > juntar e acrescentar · números maiores |

## Dezenas e números até 100

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 25 Dezenas e unidades (barras e quadradinhos) | 1 valor das barras e quadradinhos · 2 quantas barras · 3 quantos soltos | quantas barras e quantos soltos > valor das barras e quadradinhos · números maiores |
| 26 Contar até 100, de 10 em 10 | 1 contar pacotes de 10 e soltos | pacotes com soltos > só pacotes · mais pacotes |
| 27 Maior e menor até 99 | 1 o maior · 2 o menor | números que ficam próximos · troca de algarismos > mesma dezena > dezenas separadas · o menor > o maior |
| 28 Dezenas inteiras e unidades | 1 dezena + dezena · 2 dezena − dezena · 3 dezena + unidade · 4 dezena e unidade, tirando · 5 dezena + 1 · 6 tirar para ficar dezena | tirar para ficar dezena e dezena e unidade tirando > dezena + unidade e dezena + 1 > dezena − dezena > dezena + dezena · números maiores |
| 29 Decompor números | 1 unidade que falta · 2 dezena que falta · 3 montar o número · 4 quantas dezenas | quantas dezenas e montar o número > dezena que falta > unidade que falta · números maiores |

## Medidas, tempo, dinheiro e dados

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 30 Comparar comprimentos, capacidades e massas | 1 comparar barras · 2 comparar potes · 3 comparar pesos | comparar pesos > comparar potes > comparar barras · valores próximos |
| 31 Períodos do dia, dias da semana e meses | 1 período do dia · 2 dias da semana · 3 meses do ano | meses do ano > dias da semana > período do dia |
| 32 Datas no calendário | 1 dia da semana no calendário · 2 dia do mês · 3 escrever a data | escrever a data > dia do mês > dia da semana no calendário |
| 33 Moedas e cédulas | 1 valor da cédula · 2 valor da moeda · 3 quantos reais · 4 qual vale mais | qual vale mais > quantos reais > valor da cédula e da moeda |
| 34 Certeza, talvez ou impossível | 1 bola no saco · 2 frase do dia a dia | frase do dia a dia > bola no saco (poucos graus de dificuldade) |
| 35 Ler gráficos e tabelas | 1 ler um valor (gráfico) · 2 qual teve menos votos · 3 ler um valor (tabela) · 4 somar dois valores | somar dois valores > qual teve menos votos > ler um valor (gráfico e tabela) |

## O que preciso que o senhor revise

1. **Tipos:** falta ou sobra algum tipo em algum nível?
2. **Níveis de um tipo só** (1, 4, 5, 11, 19, 20, 21, 22 e 26): o rodízio não faz nada; a rampa é a única coisa que muda a folha. Em contagem (1, 4 e 5), a conta mais difícil é a de mais objetos.
3. **A ordem do "mais difícil"** que escolhi em cada linha.
4. **Níveis de figuras:** concorda em tratar círculo, quadrado e triângulo como as formas mais fáceis (nível 14)?
