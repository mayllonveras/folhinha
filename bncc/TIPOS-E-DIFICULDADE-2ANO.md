# 2º ano — tipos de conta e nota de dificuldade, por nível (para revisão do professor)

Mesma ideia do 3º e do 4º ano (ver `TIPOS-E-DIFICULDADE-3ANO.md` e `TIPOS-E-DIFICULDADE-4ANO.md`), agora para os níveis **36 a 76** (as fichas 1 a 41 do 2º ano). Já está implementada em `grade2.js` (`ESPEC2`), pelo mesmo motor (`plano.js`); só entra no app depois da sua aprovação.

## Como funciona

- **Rodízio:** as 5 folhas do dia cobrem **todos os tipos** da lista de cada nível, todo dia. O tipo mais fácil vai à folha 1, o seguinte à folha 2, e assim por diante (a ordem é medida, não a da tabela).
- **Rampa:** cada conta tem nota de dificuldade relativa ao nível. A folha 1 usa as mais fáceis e a folha 5 as mais difíceis (faixas de 0–40%, 15–55%, 30–70%, 45–85% e 60–100%). Dentro da folha, as contas do nível vão do mais fácil ao mais difícil.
- **Medido** (100 dias simulados por nível): a dificuldade média da folha 1 à 5 vai de cerca de 15–35 até 65–89, em escala de 0 a 100, e nunca desce. Nos níveis 64 (quem está entre) e 75 (provável e impossível) a subida é pequena (uns 12 pontos), porque quase não há graus de dificuldade dentro deles.
- **A nota é regra nossa**, ainda sem calibrar com crianças.

Legenda: "**mais difícil**" = o que sobe a nota; ">" quer dizer "mais difícil que".

## Números até 1000

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 36 Contar de 2 em 2, de 5 em 5 e de 10 em 10 | 1 contar de 2 em 2, 5 em 5, 10 em 10 | passo maior (de 5 em 5 e de 10 em 10 > de 2 em 2) · posição do número que falta |
| 37 Centenas, dezenas e unidades (material dourado) | 1 valor da figura · 2 quantas peças · 3 casa vazia | número com zero · casa vazia > quantas peças > valor da figura |
| 38 Valor posicional e o zero | 1 montar o número · 2 valor do algarismo | número com zero · valor do algarismo > montar o número · números maiores |
| 39 Decompor números até 999 | 1 falta a unidade · 2 falta a dezena · 3 falta a centena · 4 montar o número · 5 falta o resto | número com zero · falta a dezena > falta a centena > falta a unidade ou monta o número |
| 40 Comparar e ordenar números até 999 | 1 maior ou menor · 2 ordem certa | números que começam igual · número com zero · ordem certa > maior ou menor · troca de algarismos |
| 41 Sequências a partir de qualquer número | 1 completar a fila | passo de 100 em 100 > de 10 em 10 > de 1 em 1 · posição do número que falta |
| 42 Estimar quantidades até 1000 | 1 estimar quantidades | quantidades maiores |

## Adição e subtração até 1000

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 43 Somas de dois algarismos, sem reagrupar | 1 soma sem reagrupar | unidades maiores · soma maior que 60 · zeros |
| 44 Somas de dois algarismos, com reagrupamento | 1 soma com reagrupamento | unidades maiores · soma maior · zeros |
| 45 Subtrações de dois algarismos, sem reagrupar | 1 subtração sem emprestar | unidades maiores · número maior · zeros |
| 46 Subtrações de dois algarismos, com reagrupamento | 1 subtração com empréstimo | unidade do número de baixo maior · número maior · zeros |
| 47 Contas de dois algarismos, misturadas | 1 soma sem reagrupar · 2 soma com reagrupamento · 3 subtração sem emprestar · 4 subtração com empréstimo | subtração com empréstimo > subtração sem emprestar > soma com reagrupamento > soma sem reagrupar · zeros |
| 48 Centenas e dezenas inteiras | 1 centena + centena · 2 centena − centena · 3 centena + dezena · 4 dezena + dezena · 5 dezena − dezena | dezena − dezena > centena + dezena > centena − centena > centena + centena · número com zero |
| 49 Somas e subtrações com três algarismos, sem reagrupar | 1 soma · 2 subtração | subtração > soma · números com zero · unidades maiores |
| 50 Quanto falta? (o número escondido) | 1 parcela escondida (19 + __ = 59) · 2 parcela escondida na frente (__ + 45 = 100) · 3 subtraendo escondido (30 − __ = 20) · 4 minuendo escondido (__ − 54 = 46) | minuendo escondido > subtraendo escondido > parcela escondida na frente > parcela escondida · números maiores |
| 51 Quantos a mais, quantos a menos? | 1 na figura · 2 com números | com números > na figura · números de 3 algarismos · "a menos" > "a mais" |
| 52 Problemas de adição e subtração até 100 | 1 juntar · 2 acrescentar · 3 separar · 4 retirar | retirar e separar > acrescentar e juntar · com reagrupamento · números maiores |
| 53 Problemas de adição e subtração até 999 | 1 juntar · 2 acrescentar · 3 separar · 4 retirar | retirar e separar > acrescentar e juntar · com reagrupamento · números maiores |

## Multiplicação, dobro e metade

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 54 Parcelas iguais | 1 fig · 2 soma | soma de parcelas iguais > contar na figura · mais grupos e parcelas maiores |
| 55 Multiplicar por 2 e o dobro | 1 fig · 2 conta · 3 nome | o dobro > conta > figura · fatores maiores |
| 56 Multiplicar por 3 e o triplo | 1 fig · 2 conta · 3 nome | o triplo > conta > figura · fatores maiores |
| 57 Multiplicar por 4 | 1 fig · 2 conta · 3 vezes | "quanto é 4 vezes" > conta > figura · fatores maiores |
| 58 Multiplicar por 5 | 1 fig · 2 conta · 3 vezes | "quanto é 5 vezes" > conta > figura · fatores maiores |
| 59 Multiplicar por 2, 3, 4 e 5, misturadas | 1 fig · 2 conta · 3 vezes · 4 nome | "quanto é" e o dobro/triplo > conta > figura · fatores maiores |
| 60 Metade e terça parte | 1 fig · 2 metade · 3 terca | terça parte > metade > dividir figura · números maiores |
| 61 Problemas de multiplicação, dobro, triplo e metade | 1 dobro · 2 triplo · 3 metade · 4 terca · 5 grupos | terça parte > metade > grupos > triplo > dobro · números maiores |

## Padrões e regularidades

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 62 Padrões de figuras, símbolos e palavras | 1 fig · 2 sim · 3 pal | palavras > símbolos > figuras · padrão mais longo · o espaço está no meio |
| 63 A regra de uma sequência de números | 1 de quanto em quanto · 2 completar a sequência · 3 achar a regra | achar a regra > completar > de quanto em quanto · passo maior · sequência que desce |

## Geometria

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 64 Localização com mais de um ponto de referência | 1 quem está entre · 2 à esquerda e à direita | à esquerda e à direita > quem está entre (poucos graus de dificuldade) |
| 65 Deslocamentos em quadriculado | 1 onde vai parar · 2 quantas casas | quantas casas > onde vai parar · mais casas · dois deslocamentos |
| 66 Sólidos geométricos | 1 nome do sólido · 2 objeto do dia a dia · 3 características | características > objeto do dia a dia > nome do sólido |
| 67 Figuras planas: lados, vértices e características | 1 contar lados · 2 nome da figura · 3 qual figura | qual figura > nome da figura > contar lados |

## Medidas, tempo e dinheiro

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 68 Medir com a régua e comparar comprimentos | 1 medir com a régua · 2 comparar comprimentos · 3 unidade certa | unidade certa > comparar > medir com a régua · medida maior |
| 69 O contorno (perímetro) de polígonos | 1 medida do contorno · 2 lado que falta | lado que falta > medida do contorno · mais lados · contorno maior |
| 70 Capacidade e massa | 1 unidade certa · 2 comparar · 3 balança | balança > comparar > unidade certa |
| 71 Calendário: a duração entre duas datas | 1 dia da semana · 2 dias entre datas · 3 mês seguinte · 4 meses do ano | meses do ano > dias entre datas > mês seguinte > dia da semana |
| 72 Relógio digital: início, fim e duração | 1 ler a hora · 2 duração em horas · 3 hora de término · 4 duração em minutos | duração em minutos > hora de término > duração em horas > ler a hora · minutos diferentes de zero |
| 73 Moedas e cédulas: centavos | 1 valor do conjunto · 2 trocar moedas · 3 conjunto equivalente | conjunto equivalente > trocar moedas > valor do conjunto · valores maiores |
| 74 Moedas e cédulas: reais | 1 valor do conjunto · 2 trocar cédulas · 3 conjunto equivalente | conjunto equivalente > trocar cédulas > valor do conjunto · valores maiores |

## Dados e acaso

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 75 Provável, improvável e impossível | 1 bolas no saco · 2 frases do dia a dia | frases do dia a dia > bolas no saco (poucos graus de dificuldade) |
| 76 Tabelas de dupla entrada e gráficos | 1 ler um valor · 2 mais ou menos votos · 3 soma de duas turmas | soma de duas turmas > mais ou menos votos > ler um valor · tabela mais difícil que o gráfico · números maiores |

## O que preciso que o senhor revise

1. **Tipos:** falta ou sobra algum tipo em algum nível?
2. **Níveis com um tipo só** (36, 41, 42 e 43 a 46): o rodízio não faz nada; a rampa é a única coisa que muda a folha.
3. **A ordem do "mais difícil"** que escolhi em cada linha.
4. **Tabuadas (níveis 55 a 59):** deixei a conta com figura como a mais fácil, depois a conta direta e, por último, a pergunta em palavras ("o dobro de 3", "4 vezes 8"). Concorda?
