# 3º ano — tipos de conta e nota de dificuldade, por nível (para revisão do professor)

Mesma ideia do 4º ano (ver `TIPOS-E-DIFICULDADE-4ANO.md`), agora para os níveis **77 a 118** (as fichas 1 a 42 do 3º ano). Já está implementada em `grade3.js` (`ESPEC3`), pelo mesmo motor (`plano.js`); só entra no app depois da sua aprovação.

## Como funciona

- **Rodízio:** as 5 folhas do dia cobrem **todos os tipos** da lista de cada nível, todo dia. O tipo mais fácil vai à folha 1, o seguinte à folha 2, e assim por diante (a ordem é medida, não a da tabela).
- **Rampa:** cada conta tem nota de dificuldade relativa ao nível. A folha 1 usa as mais fáceis e a folha 5 as mais difíceis (faixas de 0–40%, 15–55%, 30–70%, 45–85% e 60–100%). Dentro da folha, as contas do nível vão do mais fácil ao mais difícil.
- **Medido** (120 dias simulados por nível): a dificuldade média da folha 1 à 5 vai de cerca de 20–35 até 70–87, em escala de 0 a 100, nos 42 níveis; o teste confere que nunca desce.
- **A nota é regra nossa**, ainda sem calibrar com crianças.

Legenda: "**mais difícil**" = o que sobe a nota; ">" quer dizer "mais difícil que".

## Números até 9999

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 77 Ler e escrever números até 9999 | 1 extenso → algarismos · 2 algarismos → extenso | zeros no número · vírgula em vez de "e" · opções parecidas |
| 78 Milhares, centenas, dezenas e unidades (material dourado) | 1 valor da figura · 2 quantas peças · 3 casa vazia | número com zero · mais peças na figura · casa vazia |
| 79 Valor posicional e o zero | 1 montar o número · 2 valor do algarismo · 3 ordem do algarismo · 4 casa vazia | zero no número · ordem e casa vazia > valor > montar |
| 80 Decompor números até 9999 | 1 falta a unidade · 2 falta a dezena (com zero) · 3 falta a centena · 4 falta o milhar · 5 montar o número · 6 soma que falta no fim | número com zero · falta a dezena com zero > falta o milhar > falta a unidade |
| 81 Comparar e ordenar números até 9999 | 1 maior ou menor · 2 ordem certa · 3 sinal | números que começam igual · ordem (do maior ao menor) · sinal "=" · troca de algarismos |
| 82 A reta numérica | 1 ler o número na reta · 2 achar o ponto · 3 quanto falta | dois pontos > um ponto · escala maior · quanto falta > achar o ponto > ler |
| 83 Sequências e regularidades | 1 completar a sequência · 2 achar a regra · 3 achar o número errado | passo maior (de 100 em 100) · sequência que desce · achar o número errado > achar a regra > completar |

## Adição e subtração até 9999

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 84 Complementos: quanto falta para 100 e para 1000 | 1 x + y = T · 2 x + _ = T · 3 T − x = · 4 T − _ = x | para 1000 mais difícil que para 100 · número que não termina em zero · lacuna depois do sinal |
| 85 Somas de três algarismos com reagrupamento | 1 soma com reagrupamento | quantidade de "vai um" · zeros no número |
| 86 Subtrações de três algarismos com reagrupamento | 1 subtração com reagrupamento | quantidade de "empresta" · zeros no número |
| 87 Somas e subtrações até 999, misturadas | 1 soma sem reagrupar · 2 soma com reagrupamento · 3 subtração sem emprestar · 4 subtração com empréstimo | subtração com empréstimo > soma com reagrupamento > sem reagrupar · zeros |
| 88 Somas e subtrações com quatro algarismos | 1 soma de centenas inteiras · 2 soma com reagrupamento · 3 subtração de centenas inteiras · 4 subtração com empréstimo | empréstimo com zero · quatro algarismos com reagrupamento · centenas inteiras são as mais fáceis |
| 89 Problemas de adição e subtração até 999 | 1 juntar · 2 acrescentar · 3 separar · 4 retirar · 5 comparar · 6 completar | comparar e completar > separar e retirar > juntar e acrescentar · números maiores · com reagrupamento |
| 90 Problemas de adição e subtração até 9999 | 1 juntar · 2 acrescentar · 3 separar · 4 retirar · 5 comparar · 6 completar | comparar e completar > separar e retirar > juntar e acrescentar · números de 4 algarismos · com reagrupamento |
| 91 Igualdades e sentenças equivalentes | 1 lacuna · 2 conta equivalente · 3 verdadeira ou falsa | verdadeira ou falsa > conta equivalente > lacuna · números maiores |

## Multiplicação e tabuadas

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 92 Tabuadas do 2, 3, 4 e 5 (fluência) | 1 direta · 2 escondido | tabuada escondida (3 × __ = 15) > direta · fatores maiores |
| 93 Multiplicar por 10 | 1 direta · 2 texto · 3 dinheiro | dinheiro > texto > direta · número maior de cédulas ou de unidades |
| 94 Disposição retangular (linhas e colunas) | 1 arranjo · 2 conta · 3 texto | conta que mostra o total > texto > contar na figura · mais objetos |
| 95 Tabuada do 6 | 1 direta · 2 arranjo · 3 escondido · 4 texto | escondido > arranjo e texto > direta · fatores maiores |
| 96 Tabuada do 7 | 1 direta · 2 arranjo · 3 escondido · 4 texto | escondido > arranjo e texto > direta · fatores maiores |
| 97 Tabuada do 8 | 1 direta · 2 arranjo · 3 escondido · 4 texto | escondido > arranjo e texto > direta · fatores maiores |
| 98 Tabuada do 9 | 1 direta · 2 arranjo · 3 escondido · 4 texto | escondido > arranjo e texto > direta · fatores maiores |
| 99 Todas as tabuadas, misturadas | 1 direta · 2 arranjo · 3 escondido | escondido > arranjo > direta · fatores maiores |
| 100 Problemas de multiplicação | 1 por 10 · 2 fileiras · 3 compra · 4 parcelas | parcelas > compra > fileiras > por 10 · números maiores |

## Divisão e problemas

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 101 Repartir em partes iguais | 1 reparte · 2 texto · 3 medida | quantos grupos (medida) > texto > repartir · mais objetos (acima de 20) |
| 102 A divisão como inverso da multiplicação | 1 direta · 2 escondido · 3 inverso | escondido > inverso > direta · divisor maior |
| 103 Divisão com resto | 1 quociente · 2 resto · 3 verificação | verificação > quociente > resto · divisor maior |
| 104 Metade, terça, quarta, quinta e décima partes | 1 a parte de um número · 2 situação · 3 o todo a partir da parte | o todo a partir da parte > situação > a parte de um número · quinta e décima partes · números maiores |
| 105 Problemas de divisão | 1 repartir · 2 quantos grupos · 3 o que sobra | o que sobra > quantos grupos > repartir · números maiores |
| 106 Problemas com as quatro operações | 1 soma · 2 subtração · 3 multiplicação · 4 divisão | divisão > multiplicação > subtração > soma · números maiores |

## Sólidos, figuras e congruência

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 107 Sólidos e planificações | 1 nome do sólido · 2 contar faces · 3 faces na planificação | faces na planificação > contar faces > nome do sólido |
| 108 Figuras planas: trapézio e paralelogramo | 1 nome da figura · 2 qual figura · 3 pares de lados paralelos | pares de lados paralelos > qual figura > nome da figura |
| 109 Figuras congruentes (malha) | 1 são congruentes? · 2 qual é congruente | qual é congruente > são congruentes? · figuras com mais quadradinhos |

## Medidas, horas e dinheiro

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 110 Medir com a régua: centímetro e milímetro | 1 medir com a régua · 2 cm e mm · 3 comparar medidas | comparar medidas > cm e mm > medir com a régua · medida que não é múltipla de 10 |
| 111 A unidade e o instrumento certos | 1 unidade certa · 2 instrumento certo · 3 o resultado depende da unidade | o resultado depende da unidade > instrumento certo > unidade certa |
| 112 Capacidade e massa | 1 unidade certa · 2 comparar · 3 somar massas | somar massas > comparar > unidade certa · números maiores |
| 113 Comparar áreas na malha | 1 qual ocupa mais · 2 qual ocupa menos · 3 ocupam o mesmo espaço? | ocupam o mesmo espaço? > qual ocupa menos > qual ocupa mais · figuras de áreas parecidas |
| 114 Relógio: horas, minutos e segundos | 1 relação entre unidades · 2 ler o relógio · 3 escolher o relógio | escolher o relógio > ler o relógio > relação entre unidades · minutos diferentes de zero |
| 115 Duração: início, fim e quanto tempo passou | 1 quanto durou · 2 hora de término · 3 hora de início | hora de início > hora de término > quanto durou · duração que não é hora cheia |
| 116 Dinheiro: compra, venda e troco | 1 total da compra · 2 troco · 3 centavos | centavos > troco > total da compra · valores maiores |

## Chances, tabelas e gráficos

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 117 Resultados possíveis e chances | 1 quantos resultados · 2 mais provável · 3 menos provável | menos provável > mais provável > quantos resultados |
| 118 Tabelas de dupla entrada e gráficos | 1 ler um valor · 2 mais ou menos votos · 3 diferença entre dois | diferença entre dois > mais ou menos votos > ler um valor · tabela mais difícil que o gráfico · números maiores |

## O que preciso que o senhor revise

1. **Tipos:** falta ou sobra algum tipo em algum nível?
2. **Níveis com um tipo só** (86 e 87): o rodízio não faz nada; a rampa é a única coisa que muda a folha.
3. **A ordem do "mais difícil"** que escolhi em cada linha.
4. **Níveis de tabuada (93 a 100):** o tipo "escondido" (3 × __ = 15) é o mais difícil, depois a figura e o texto, e a conta direta é a mais fácil. Concorda?
