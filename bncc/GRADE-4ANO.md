# Grade do 4º ano (46 níveis, implementada em `grade4.js`)

> **Estado:** implementada em 15/11/2026. A proposta original tinha 40 níveis; ficaram **46**, com degraus menores nas contas pesadas (ver a seção abaixo e `PLANO.md`). A tabela original segue como referência de conteúdo.

Base: inventário `inventario-anos-iniciais.csv` (28 habilidades do 4º ano: 26 treináveis, grupos A e B; ficam de fora **EF04MA24** (registrar temperaturas diárias e fazer gráficos) e
**EF04MA28** (realizar pesquisa), grupo C, que são atividades de casa ou de sala) e as decisões já tomadas: grade **refeita do zero**, cada nível nasce de uma **ficha** revisada
antes do código, a dificuldade entra aos poucos, e o número de níveis é uma referência, não um limite (teto prático de cerca de 40 níveis por ano, com 52 semanas e 5 carimbos por nível).

O 4º ano começa onde o 3º termina: o aluno chega com números até 9999, somas e subtrações com reagrupamento, todas as tabuadas, a divisão por um algarismo (exata e com resto, pelas tabuadas),
a ideia de metade, terça, quarta e quinta parte e a leitura de relógio, dinheiro, tabelas e gráficos. As 2 contas de revisão de cada folha (20%) trazem de volta o que ficou para trás, de qualquer ano anterior.

Coisas que o 3º ano deixou explicitamente para o 4º, e que entram aqui: **a notação de fração (1/4) e os decimais** (só o nome das partes foi visto), **a conversão entre unidades** (quilograma e grama, litro e mililitro),
**o relógio com minutos exatos** e **a divisão por mais de um algarismo**.

Legenda de "Peças": **existe** = há uma peça pronta no app (desenho ou tipo de resposta) que pode servir de material; **novo** = precisa ser escrito. Em todos os casos o nível é feito pela ficha.
No app o aluno vê a numeração corrida da trilha: o 1º nível do 4º ano será o **119** (os números 1 a 40 abaixo são os das fichas).

| Nº | Nível | Habilidades | Peças | Nota |
|---|---|---|---|---|
| **Números até 99 999** | | | | |
| 1 | Ler e escrever números até 99 999 | EF04MA01 | existe | dezenas de milhar, em algarismos e por extenso (ver pergunta 1) |
| 2 | Valor posicional e decomposição com potências de dez | EF04MA02 | existe | 34 567 = 3 × 10 000 + 4 × 1 000 + 5 × 100 + 6 × 10 + 7 |
| 3 | Comparar e ordenar números até 99 999 | EF04MA01 | existe | maior, menor, ordem e sinais |
| 4 | Estimar e arredondar | EF04MA03 | existe | arredondar para a dezena, a centena e o milhar mais próximos |
| **Adição e subtração** | | | | |
| 5 | Somas até 99 999 | EF04MA03 | existe | com reagrupamento em várias ordens |
| 6 | Subtrações até 99 999 | EF04MA03 | existe | com empréstimo e zeros (30 000 − 12 345) |
| 7 | Somas e subtrações até 99 999, misturadas | EF04MA03 | existe | as quatro famílias |
| 8 | Problemas de adição e subtração, com estimativa | EF04MA03 | existe | "é mais ou menos quanto?" antes do cálculo exato |
| 9 | Operações inversas: tirar a prova | EF04MA04, EF04MA13 | existe | 4 500 + 2 300 = 6 800, então 6 800 − 2 300 = ? |
| **Multiplicação** | | | | |
| 10 | Propriedades da multiplicação | EF04MA05 | existe | comutativa, associativa e distributiva: 8 × 15 = 8 × 10 + 8 × 5 |
| 11 | Multiplicar por 10, 100 e 1000 | EF04MA06 | existe | e por dezenas e centenas inteiras (30 × 40) |
| 12 | Multiplicar por um algarismo, sem reagrupar | EF04MA06 | existe | 32 × 3; 412 × 2 |
| 13 | Multiplicar por um algarismo, com reagrupamento | EF04MA06 | existe | 47 × 6; 1 285 × 4 |
| 14 | Multiplicar por dois algarismos | EF04MA06 | existe | 12 × 15, por decomposição: 12 × 10 + 12 × 5 |
| 15 | Problemas de multiplicação: grupos, fileiras e proporção | EF04MA06 | existe | "3 pacotes custam 12 reais; quanto custam 6?" |
| 16 | Combinações possíveis | EF04MA08 | **novo** (tabela e árvore de possibilidades) | 3 camisas × 2 bermudas |
| **Divisão** | | | | |
| 17 | Divisão por um algarismo, sem resto | EF04MA07, EF04MA04 | existe | 846 ÷ 2; 3 600 ÷ 4 |
| 18 | Divisão por um algarismo, com resto | EF04MA07 | existe | 1 453 ÷ 5 = 290 e sobram 3 |
| 19 | Divisão por dois algarismos | EF04MA07 | existe | estimar: 96 ÷ 12; 450 ÷ 15 (ver pergunta 4) |
| 20 | Problemas de divisão | EF04MA07 | existe | repartição equitativa e medida, com estimativa |
| 21 | Múltiplos e restos | EF04MA11, EF04MA12 | existe | sequências de múltiplos; números que dão o mesmo resto |
| **Álgebra** | | | | |
| 22 | Igualdades: somar ou tirar o mesmo número | EF04MA14 | existe | se 7 + 5 = 12, então 7 + 5 + 3 = 12 + 3 |
| 23 | O número desconhecido nas quatro operações | EF04MA15 | existe | 6 × ? = 54; ? ÷ 4 = 12; ? − 25 = 60 |
| 24 | Problemas com as quatro operações | EF04MA03, EF04MA06, EF04MA07 | existe | escolher a operação, com mais de uma etapa |
| **Frações e decimais** | | | | |
| 25 | Frações unitárias e partes do inteiro | EF04MA09 | **novo** (figuras de frações) | 1/2, 1/3, 1/4, 1/5, 1/10 em barras e círculos |
| 26 | Frações na reta numérica | EF04MA09 | existe (reta) | 1/4 entre 0 e 1 |
| 27 | Décimos e centésimos | EF04MA10 | **novo** (quadro de 100) | 0,1 e 0,01; ler e escrever |
| 28 | Decimais e dinheiro | EF04MA10 | existe (moedas e cédulas) | R$ 3,50; centavos como centésimos |
| **Geometria** | | | | |
| 29 | Localização e deslocamentos em mapas e malhas | EF04MA16 | existe (quadriculado) | direita, esquerda, mudança de direção, ruas que se cruzam |
| 30 | Prismas e pirâmides: planificações e atributos | EF04MA17 | existe (planificações) | faces, arestas e vértices |
| 31 | Ângulos retos e não retos | EF04MA18 | **novo** (ângulos) | reto, agudo e obtuso, com esquadro |
| 32 | Simetria de reflexão | EF04MA19 | existe (malha) | a figura espelhada; eixo de simetria |
| **Medidas** | | | | |
| 33 | Perímetro e comprimento | EF04MA20 | existe (polígonos) | somar os lados; metro, centímetro e milímetro |
| 34 | Área na malha | EF04MA21 | existe (malha) | quadradinhos inteiros e metades |
| 35 | Massa e capacidade: conversões | EF04MA20 | existe | quilograma e grama, litro e mililitro |
| 36 | Tempo: horas, minutos e segundos | EF04MA22 | existe (relógio) | minutos exatos; intervalos que passam da hora |
| 37 | Temperatura: o grau Celsius | EF04MA23 | **novo** (termômetro) | ler e comparar temperaturas (ver pergunta 5) |
| 38 | Dinheiro: compra, venda, troco e desconto | EF04MA25 | existe | reais e centavos; o desconto |
| **Dados e acaso** | | | | |
| 39 | Chances: o mais provável | EF04MA26 | existe (roleta e sacos) | sem frações |
| 40 | Tabelas e gráficos: ler e resumir | EF04MA27 | existe (tabela e gráfico) | colunas e pictogramas |

## Cobertura

- **Habilidades treináveis do 4º ano:** 26 de 26. Todas entram em pelo menos um nível.
- **Fora, por serem atividade de casa ou de sala:** EF04MA24 (registrar temperaturas e fazer gráficos) e EF04MA28 (pesquisa).
- **Ritmo:** 40 níveis a 1 por semana de estudo (5 dias, 5 carimbos) são 40 semanas, dentro das 52, com folga mesmo para quem falta um dia por semana. Alunos fortes passam à frente pelos dias ouro e pelos saltos.

## Ordem

A trilha vai de números até 99 999 (1–4), adição e subtração (5–9), multiplicação (10–16), divisão (17–21), álgebra (22–24), frações e decimais (25–28), geometria (29–32), medidas (33–38) e dados e acaso (39–40).
A multiplicação vem antes da divisão (a divisão usa a tabuada e a multiplicação por um algarismo). Os blocos de contas e os de figuras se alternam ao longo do ano para variar o tipo de exercício.

## O que muda em relação ao 3º ano

- **Números maiores:** até cinco algarismos (99 999). A caixa de resposta passa a aceitar 5 algarismos, e o espaço fino de milhar continua na tela (`34 567`).
- **Contas mais longas:** multiplicação por mais de um algarismo e divisão com divisor de dois algarismos, sempre com a conta pronta na tela e a resposta digitada (ver pergunta 2).
- **Peças novas:** figuras de frações, quadro de 100 para os décimos e centésimos, ângulos, termômetro e a tabela de possibilidades.
- **Coisas que vieram do 3º ano:** a notação de fração e os decimais, as conversões de unidades e o relógio com minutos exatos.

## Perguntas para o professor (com a minha sugestão)

1. **Extenso até 99 999 (nível 1):** o 3º ano ensinou o extenso até 9999. **Sugiro** manter no 4º ano, só no nível 1, com a mesma regra do "e" e da vírgula ("trinta e quatro mil, quinhentos e sessenta e sete"). A resposta digitada continua em algarismos.
2. **Multiplicar e dividir "armando a conta":** a tela só tem uma caixa de resposta, então o aluno vê `47 × 6` e digita o resultado; armar a conta no papel é por conta dele. **Sugiro** manter assim, com a dica do nível sugerindo fazer no papel. Os passos intermediários não são cobrados.
3. **Frações e decimais (níveis 25 a 28):** só as frações unitárias que a BNCC pede (1/2, 1/3, 1/4, 1/5, 1/10 e 1/100), com figura, e os décimos e centésimos, sem somar nem multiplicar (isso é do 5º ano). **Sugiro** manter.
4. **Dividir por dois algarismos (nível 19):** a BNCC fala em "divisor de no máximo dois algarismos". **Sugiro** começar com divisores de 10 a 30 e quociente de até dois algarismos, sempre exatos, com a estimativa como estratégia ("96 ÷ 12: 12 × 8 = 96"); o resto com divisor de dois algarismos fica para o 5º ano.
5. **Temperatura (nível 37):** **sugiro** só temperaturas de 0 a 45 °C, sem números negativos, que são do 6º ano.

## Grade implementada (46 níveis, numeração do app entre parênteses)

| Bloco | Níveis (ficha → app) |
|---|---|
| Números até 99 999 | 1 Ler e escrever (119) · 2 Valor posicional e decomposição (120) · 3 Comparar e ordenar (121) · 4 Arredondar (122) |
| Adição e subtração | 5 Somas com 4 algarismos (123) · 6 Subtrações com 4 algarismos (124) · 7 Somas e subtrações até 99 999 (125) · 8 Estimar (126) · 9 Problemas (127) · 10 Operações inversas (128) |
| Multiplicação | 11 Propriedades (129) · 12 Por 10, 100 e 1000 (130) · 13 Dezenas e centenas inteiras (131) · 14 Por um algarismo, sem reagrupar (132) · 15 2 algarismos × 1 (133) · 16 3 algarismos × 1 (134) · 17 4 algarismos × 2 a 5 (135) · 18 Por 11 a 19 (136) · 19 Por dois algarismos (137) · 20 Problemas (138) · 21 Combinações (139) |
| Divisão, múltiplos e restos | 22 Sem resto (140) · 23 Com resto (141) · 24 Quatro algarismos (142) · 25 Por dois algarismos (143) · 26 Problemas (144) · 27 Múltiplos e restos (145) |
| Igualdades e problemas | 28 Igualdades (146) · 29 Número desconhecido (147) · 30 Problemas com as quatro operações (148) |
| Frações e decimais | 31 Frações unitárias (149) · 32 Frações na reta (150) · 33 Décimos e centésimos (151) · 34 Decimais e dinheiro (152) |
| Ângulos, sólidos e simetria | 35 Localização na malha (153) · 36 Prismas e pirâmides (154) · 37 Ângulos (155) · 38 Simetria (156) |
| Medidas, tempo e dinheiro | 39 Perímetro e comprimento (157) · 40 Área na malha (158) · 41 Massa e capacidade (159) · 42 Tempo (160) · 43 Temperatura (161) · 44 Dinheiro: troco, desconto e parcelas (162) |
| Acaso, tabelas e gráficos | 45 Chances (163) · 46 Tabelas e gráficos (164) |
