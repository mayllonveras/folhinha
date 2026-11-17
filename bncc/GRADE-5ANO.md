# Proposta de grade do 5º ano (47 níveis) — para revisão do professor

> **Estado:** proposta, escrita em 17/11/2026. Ainda **sem código**: depois da revisão do professor vêm as fichas, os geradores (`grade5.js`), a migração e os testes, como nos outros anos.

Base: inventário `inventario-anos-iniciais.csv` (25 habilidades do 5º ano: 24 treináveis, grupos A e B; fica de fora **EF05MA25** (realizar pesquisa e redigir a síntese), grupo C, que é atividade de casa ou de sala)
e as decisões já tomadas: grade **refeita do zero**, cada nível nasce de uma **ficha** revisada antes do código, a dificuldade entra aos poucos, e o número de níveis é uma referência, não um limite
(teto prático de cerca de 40 níveis por ano, com 52 semanas e 5 carimbos por nível; o 4º ano ficou com 46).

O 5º ano começa onde o 4º termina: o aluno chega com números até 99 999, somas e subtrações com reagrupamento, multiplicação até 3 algarismos × 1 e 2 × 2, divisão por um algarismo (com resto) e por dois
(exata), igualdades, frações unitárias (1/2, 1/3, 1/4, 1/5, 1/10), décimos e centésimos, ângulos, simetria, perímetro, área na malha, conversões de massa e capacidade, temperatura, dinheiro, chances e gráficos.
As 2 contas de revisão de cada folha (20%) trazem de volta o que ficou para trás, de qualquer ano anterior.

Coisas que o 4º ano deixou explicitamente para o 5º, e que entram aqui: **a divisão por dois algarismos com resto**, **frações com qualquer numerador (próprias e impróprias)**, **as operações com decimais**
(somar, subtrair, multiplicar e dividir por um número natural) e **a porcentagem**.

Legenda de "Peças": **existe** = há uma peça pronta no app (desenho ou tipo de resposta) que pode servir de material; **novo** = precisa ser escrito. Em todos os casos o nível é feito pela ficha.
No app o aluno vê a numeração corrida da trilha: o 1º nível do 5º ano será o **165** (os números 1 a 47 abaixo são os das fichas) e o último, o **211**.

| Nº | Nível | Habilidades | Peças | Nota |
|---|---|---|---|---|
| **Números até 999 999** | | | | |
| 1 | Ler, escrever e valor posicional até 999 999 | EF05MA01 | existe | centenas de milhar; algarismos, extenso e decomposição (ver pergunta 1) |
| 2 | Comparar e ordenar números até 999 999 | EF05MA01 | existe | maior, menor, ordem crescente e decrescente, sinais |
| 3 | Arredondar e estimar | EF05MA01, EF05MA07 | existe | dezena, centena, milhar e dezena de milhar mais próximos |
| **Adição e subtração** | | | | |
| 4 | Somas até 999 999 | EF05MA07 | existe | com reagrupamento em várias ordens |
| 5 | Subtrações até 999 999 | EF05MA07 | existe | com empréstimo e zeros (300 000 − 124 567) |
| 6 | Problemas de adição e subtração, com estimativa | EF05MA07 | existe | números grandes: população, distâncias, saldos |
| **Multiplicação** | | | | |
| 7 | Multiplicar por 10, 100, 1 000 e por múltiplos | EF05MA08 | existe | 45 × 1 000; 300 × 40; 1 200 × 50 |
| 8 | Multiplicar 3 algarismos por 2 algarismos | EF05MA08 | existe | 134 × 25, por decomposição |
| 9 | Multiplicar 4 algarismos por 2 algarismos | EF05MA08 | existe | 1 258 × 14; resultado de até 6 algarismos |
| 10 | Problemas de multiplicação | EF05MA08 | existe | grupos, fileiras e área retangular |
| 11 | Combinações possíveis: árvore e tabela | EF05MA09 | existe (tabela de possibilidades do 4º ano) + **novo** (diagrama de árvore) | 3 camisas × 4 bermudas × 2 bonés (ver pergunta 7) |
| **Divisão** | | | | |
| 12 | Divisão por um algarismo com dividendo de até 5 algarismos | EF05MA08 | existe | 25 480 ÷ 4; quociente com zeros |
| 13 | Divisão por dois algarismos, exata | EF05MA08 | existe | 1 080 ÷ 24; estimar com a multiplicação |
| 14 | Divisão por dois algarismos, com resto | EF05MA08 | existe | 1 453 ÷ 25 = 58 e sobram 3; tirar a prova |
| 15 | Problemas de divisão | EF05MA08 | existe | repartição, medida, o que sobra, viagens |
| 16 | Problemas com as quatro operações, em várias etapas | EF05MA07, EF05MA08 | existe | escolher a operação; estimar para conferir |
| **Álgebra e proporção** | | | | |
| 17 | Igualdades: operar nos dois lados | EF05MA10 | existe | somar, subtrair, multiplicar e dividir os dois lados pelo mesmo número |
| 18 | O número desconhecido em problemas com enunciado | EF05MA11 | existe | "Pensei num número, somei 15 e deu 40" (ver pergunta 3) |
| 19 | Proporcionalidade direta: preço e receita | EF05MA12 | existe | "3 kg custam R$ 18; quanto custam 5 kg?"; dobrar e reduzir à metade a receita |
| 20 | Proporcionalidade: escala e ampliação | EF05MA12 | existe | "1 cm no mapa = 5 km"; tabelas de proporção |
| 21 | Partilha em duas partes desiguais | EF05MA13 | existe | "Divida 60 em duas partes, uma o dobro da outra"; razão entre as partes |
| **Frações** | | | | |
| 22 | Frações com qualquer numerador (menores que o inteiro) | EF05MA03 | existe (figura de fração, numerador livre) | 3/4, 5/8; ler, pintar, escolher a figura |
| 23 | Frações maiores que o inteiro e números mistos | EF05MA03 | **novo** (figura com mais de um inteiro) | 7/4 = 1 3/4 |
| 24 | A fração como divisão | EF05MA03 | existe | 3 pizzas para 4 pessoas: 3 ÷ 4 = 3/4 |
| 25 | Frações na reta numérica | EF05MA03, EF05MA05 | existe (reta) | entre 0 e 1 e além do 1 |
| 26 | Frações equivalentes | EF05MA04 | existe (figura de fração) | 1/2 = 2/4 = 4/8; achar o termo que falta |
| 27 | Comparar e ordenar frações | EF05MA05 | existe | mesmo denominador, mesmo numerador, com a ajuda das equivalentes |
| **Decimais e porcentagem** | | | | |
| 28 | Decimais: ler, escrever e decompor | EF05MA02 | existe (quadro de 100) | décimos, centésimos e milésimos (ver pergunta 2) |
| 29 | Decimais na reta numérica | EF05MA02, EF05MA05 | existe (reta) | 2,3 entre 2 e 3; 0,45 entre 0,4 e 0,5 |
| 30 | Comparar e ordenar decimais; fração ↔ decimal | EF05MA05 | existe | 0,5 = 1/2; 0,25 = 1/4; qual é maior: 0,8 ou 0,75? |
| 31 | Somar e subtrair decimais | EF05MA07 | existe | com vírgula alinhada, até centésimos |
| 32 | Problemas com decimais: dinheiro e medidas | EF05MA07 | existe (moedas e cédulas) | R$ 12,50 + R$ 7,85; metros e centímetros |
| 33 | Multiplicar decimal por número natural | EF05MA08 | existe | 2,5 × 4; 0,75 × 6; 1,2 × 10 |
| 34 | Dividir decimal por número natural; dividir com quociente decimal | EF05MA08 | existe | 7,5 ÷ 5; 9 ÷ 2 = 4,5 (ver pergunta 4) |
| 35 | Porcentagem: 10%, 25%, 50%, 75% e 100% | EF05MA06 | existe | 25% de 80 é a quarta parte; ligação com fração e decimal |
| 36 | Porcentagem no dinheiro: desconto e acréscimo | EF05MA06, EF05MA07 | existe | "20% de desconto" não entra; só 10%, 25%, 50% (ver pergunta 5) |
| **Geometria** | | | | |
| 37 | Plano cartesiano: localizar pontos | EF05MA14, EF05MA15 | **novo** (figura do plano cartesiano, 1º quadrante) | par ordenado (3, 4); células de planilha (C4); ver pergunta 6 |
| 38 | Plano cartesiano: movimentos e giros | EF05MA15 | **novo** (mesma figura) | "do ponto (2, 1) andou 3 para a direita e 2 para cima"; giro de um quarto de volta |
| 39 | Sólidos: planificações e atributos | EF05MA16 | existe (planificações) | prismas, pirâmides, cilindro e cone; faces, arestas e vértices |
| 40 | Polígonos: lados, vértices e ângulos | EF05MA17 | existe (polígonos, ângulos) | reconhecer, nomear e comparar; o desenho com régua fica para casa |
| 41 | Ampliação e redução na malha | EF05MA18 | existe (malha) | lados dobram, ângulos continuam iguais |
| **Medidas** | | | | |
| 42 | Conversões de comprimento, massa e capacidade em problemas | EF05MA19 | existe | km, m, cm, mm; kg, g; L, mL; com decimais |
| 43 | Tempo e temperatura em problemas | EF05MA19 | existe (relógio, termômetro) | intervalos, calendário e temperaturas |
| 44 | Perímetro e área: mesmo perímetro, áreas diferentes | EF05MA20 | existe (malha) | comparar figuras na malha; ver pergunta 8 |
| 45 | Volume: contar cubos | EF05MA21 | **novo** (pilhas de cubos) | volume em cubinhos; dois blocos, qual cabe mais |
| **Dados e acaso** | | | | |
| 46 | Espaço amostral e probabilidade como fração | EF05MA22, EF05MA23 | existe (dado, moeda e roleta) | resultados possíveis; "1 chance em 6", 3/6 = 1/2 |
| 47 | Tabelas e gráficos de colunas e de linhas | EF05MA24 | existe (tabela e colunas) + **novo** (gráfico de linhas) | ler, comparar e resumir; sem redação de texto |

## Cobertura

- **Habilidades treináveis do 5º ano:** 24 de 24. Todas entram em pelo menos um nível.
- **Fora, por ser atividade de casa ou de sala:** EF05MA25 (pesquisa de campo, tabelas, gráficos e texto de síntese). O desenho de polígonos com régua e compasso (parte de EF05MA17) e o empilhamento de objetos reais
  (parte de EF05MA21) também ficam como sugestão para os pais.
- **Ritmo:** 47 níveis a 1 por semana de estudo (5 dias, 5 carimbos) são 47 semanas, dentro das 52, com folga curta (5 semanas) para quem falta um dia por semana. Alunos fortes passam à frente pelos dias ouro e pelos saltos.
  O 4º ano tem 46; o 5º fica um acima porque junta três blocos grandes (frações, decimais e porcentagem). Se faltar fôlego, os níveis 6 e 16 (problemas), 20 (escala) e 43 (tempo e temperatura) são os que se poderiam juntar a outros.

## Ordem

A trilha vai de números até 999 999 (1–3), adição e subtração (4–6), multiplicação (7–11), divisão (12–16), álgebra e proporção (17–21), frações (22–27), decimais e porcentagem (28–36), geometria (37–41),
medidas (42–45) e dados e acaso (46–47).
A multiplicação vem antes da divisão. As **frações vêm antes dos decimais**, e os decimais antes da porcentagem (10%, 25%, 50% e 75% são a décima parte, a quarta parte, a metade e três quartos).
Os blocos de contas e os de figuras se alternam ao longo do ano para variar o tipo de exercício.

## O que muda em relação ao 4º ano

- **Números maiores:** até seis algarismos (999 999). A caixa de resposta passa a aceitar 6 algarismos, e o espaço fino de milhar continua na tela (`234 567`).
- **Contas mais longas:** multiplicação por dois algarismos com 3 e 4 algarismos, e divisão por dois algarismos com resto; sempre com a conta pronta na tela e a resposta digitada (ver pergunta 4 do 4º ano, mantida).
- **Resposta que não é inteira:** decimais (2,5; 0,75) e frações (3/4). A resposta digitada passa a aceitar **vírgula** nos níveis de decimais, e as frações são respondidas **por escolha entre opções** ou por dois campos
  (numerador e denominador); ver pergunta 2.
- **Peças novas:** plano cartesiano, pilhas de cubos, diagrama de árvore, figura de fração com mais de um inteiro e gráfico de linhas.
- **Coisas que vieram do 4º ano:** a divisão por dois algarismos com resto, as frações com qualquer numerador e as operações com decimais.

## Perguntas para o professor (com a minha sugestão)

1. **Extenso até 999 999 (nível 1):** o 4º ano manteve o extenso até 99 999. **Sugiro** manter no 5º, só no nível 1, na mesma regra do "e" e da vírgula ("duzentos e trinta e quatro mil, quinhentos e sessenta e sete"),
   com a resposta digitada em algarismos.
2. **Como responder frações e decimais:** a tela só tem uma caixa de resposta numérica. **Sugiro:** decimais digitados com vírgula (a caixa aceita só números e uma vírgula, no máximo 2 casas); frações por **escolha entre opções**
   (como no 4º ano) nos níveis de figura e, quando a resposta for uma fração digitada, **dois campos (numerador e denominador)**. Isso é uma peça nova no motor e precisa ser feita antes dos níveis 22 a 36.
3. **Equações (nível 18):** a BNCC pede só o conceito, sem equação formal. **Sugiro** enunciados com "um número", "pensei em um número" ou um quadrado vazio (◻ + 15 = 40), sem a letra x, que fica para o 6º ano.
4. **Decimais com contas (níveis 31, 33 e 34):** **sugiro** limitar a duas casas decimais, multiplicador natural de 1 algarismo (e por 10, 100 e 1 000) e divisor natural de 1 algarismo, sempre com divisão
   que termina (quociente exato com no máximo duas casas), como pede a BNCC ("representação decimal finita"). Multiplicar decimal por decimal e dividir por decimal ficam para o 6º ano.
5. **Porcentagem (níveis 35 e 36):** a BNCC cita só 10%, 25%, 50%, 75% e 100%. **Sugiro** ficar nesses cinco valores, sem 20%, 30% etc., que exigem cálculo além do pedido.
6. **Plano cartesiano (níveis 37 e 38):** só o 1º quadrante (números de 0 a 10), como pede a BNCC. As "células de planilha" (letra da coluna e número da linha) entram como 1 dos tipos do nível 37.
   **Sugiro** manter, usando a figura nova do plano e a mesma figura da planilha do 4º ano (nível 35, localização na malha).
7. **Combinações (nível 11):** a BNCC fala em "combinar cada elemento de uma coleção com todos os de outra". **Sugiro** limitar a 2 coleções no começo e deixar 3 coleções (3 × 4 × 2) só no último tipo do nível,
   com o diagrama de árvore na tela e a resposta digitada.
8. **Perímetro e área (nível 44):** a BNCC pede concluir que perímetros iguais podem ter áreas diferentes e vice-versa. **Sugiro** contas por escolha ("Qual figura tem a maior área?", "Qual tem o mesmo perímetro?"),
   com figuras na malha, e um tipo de contagem digitada de quadradinhos e de lados.
9. **Total de 47 níveis:** fica um acima do 4º ano e sete acima do teto prático de cerca de 40 (o 4º ano ficou com seis acima). **Sugiro** manter os 47; se faltar fôlego mais tarde, juntar os níveis 6 e 16 ou os níveis 19 e 20.

## Decisões do professor

_(a preencher depois da revisão)_
