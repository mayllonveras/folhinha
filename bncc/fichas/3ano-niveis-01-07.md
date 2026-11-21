# Fichas do 3º ano — níveis 1 a 7 (números até 9999)

Primeiro bloco de fichas do 3º ano, para revisão do professor antes de qualquer código. Valem as **regras comuns** de `1ano-niveis-01-07.md` (folha de 10 contas, 2 de revisão por folha,
nada repetido na mesma folha, concordância, emojis inequívocos, testes com a resposta recalculada) e as do 2º ano (`2ano-niveis-01-07.md`), com estas mudanças próprias do 3º ano:

- **Números de até quatro algarismos** (de 1000 a 9999), digitados **sem separador** (a caixa de resposta aceita até 4 algarismos).
- **Na tela, os números de quatro algarismos aparecem com um espaço fino de milhar** (`3 456`), como na BNCC e no IBGE; quem digita escreve `3456` (ver pergunta 1).
- **O zero pode ser resposta** quando a própria pergunta é sobre o zero (como no 2º ano); fora desses casos, a resposta continua nunca sendo zero.
- **O número por extenso entra só no nível 1** (decisão do professor), nas duas direções.
- **Meta de tempo** de 100 a 130 segundos por folha neste bloco.

A numeração do app para estes níveis é 77 a 83 (os números 1 a 7 abaixo são os das fichas).

---

## Nível 1 — Ler e escrever números até 9999

- **Habilidade:** EF03MA01 (ler, escrever e comparar números naturais até a unidade de milhar, relacionando o registro numérico com a língua materna).
- **Dois tipos de conta**, em partes iguais (4 + 4 nas 8 do nível):
  1. **Do extenso para os algarismos:** "Escreva em algarismos: **dois mil, trezentos e quarenta e cinco**." → 2345 (digitada).
  2. **Dos algarismos para o extenso:** "Como se lê o número **2 345**?" → **3 opções**, cada uma o extenso de um número.
- **Números:** de 1000 a 9999; **zero em cerca de 30%** das contas (`2 005`, `2 040`, `2 400`, `3 000`, `1 100`), porque é onde está a dificuldade da leitura.
- **Regras de leitura** (usadas no gerador e nos testes):
  - **mil**, nunca "um mil": 1 000 = "mil"; 1 234 = "mil, duzentos e trinta e quatro"; 2 000 = "dois mil".
  - O que vem depois do mil leva **"e"** quando é só uma centena inteira ou um número menor que 100 (`2 005` = "dois mil e cinco"; `2 040` = "dois mil e quarenta"; `2 045` = "dois mil e quarenta e cinco";
    `2 400` = "dois mil e quatrocentos"; `1 100` = "mil e cem"); nos outros casos leva **vírgula** (`2 345` = "dois mil, trezentos e quarenta e cinco"; `1 110` = "mil, cento e dez").
  - **cem** para 100 exato e **cento** para o resto (`1 100` = "mil e cem"; `1 101` = "mil, cento e um").
  - Entre a centena e o resto, **"e"** ("trezentos e quarenta e cinco"); 11 a 19 e as dezenas têm nome próprio (onze, doze… vinte, trinta…).
- **Opções erradas (tipo 2):** extensos de números que diferem do certo em **um só detalhe**: dois algarismos vizinhos trocados (`2 354`), um algarismo trocado (`2 845`) ou o zero deslocado (`2 450`).
  As três opções são extensos diferentes, e nenhuma tem erro de escrita.
- **Resposta:** digitada (tipo 1) e escolha (tipo 2).
- **Contas diferentes:** milhares.
- **Meta de tempo:** 130 s.
- **Exemplos:** "Escreva em algarismos: mil e cem." → 1100. "Como se lê 3 050?" → "três mil e cinquenta".
- **Testes específicos:** o extenso é gerado por uma regra independente e convertido de volta ao número (ida e volta); os três extensos do tipo 2 são distintos; a resposta é recalculada; o zero aparece em 20% a 40% das contas;
  "mil" nunca vem como "um mil"; a regra do "e" e da vírgula é respeitada em todos os números.

## Nível 2 — Milhares, centenas, dezenas e unidades (material dourado)

- **Habilidade:** EF03MA02 (composição e decomposição de números de até quatro ordens, com material manipulável).
- **Figura:** **cubos** de 1000 (peça nova, um cubo grande em perspectiva), **placas** de 100, **barras** de 10 e **quadradinhos** de 1, em quatro grupos separados, com legenda no começo da folha:
  "Cada cubo grande vale 1000, cada placa vale 100, cada barra vale 10 e cada quadradinho vale 1."
  Até 9 de cada peça; as peças são um pouco menores que no 2º ano para caber no celular, e quebram de linha.
- **Três tipos de conta**, entre as 8 do nível (5, 2 e 1):
  1. **Valor da figura:** "Quanto vale tudo junto?" → o número (de 1000 a 9999).
  2. **Cubos, placas, barras ou quadradinhos:** "O número **3 456** é formado por quantas placas de 100?" → 4 (a figura mostra 3 456); também "quantos cubos de 1000", "quantas barras de 10" e "quantos quadradinhos soltos".
  3. **O zero:** números com zero em alguma casa (`3 005`, `3 450`, `3 000`) em cerca de 30% das contas; nesses casos a pergunta pode ter o zero como resposta ("quantas placas de 100 tem o 3 005?" → 0).
- **Resposta:** digitada.
- **Contas diferentes:** milhares.
- **Meta de tempo:** 130 s (era 120; subiu em 21/11/2026 porque o aluno-piloto fez média de 126 e 127 s com 94% e 88% de acertos).
- **Testes específicos:** o desenho tem exatamente os cubos, placas, barras e quadradinhos do número; cada placa tem 100 divisões e cada barra, 10; a resposta é recalculada; o zero só é resposta quando a pergunta é sobre a casa vazia;
  nada passa da largura do celular.

## Nível 3 — Valor posicional e o zero (números até 9999)

- **Habilidades:** EF03MA01 e EF03MA02 (características do sistema de numeração decimal).
- **Quatro tipos de conta**, 2 de cada nas 8 do nível:
  1. **Montar o número:** "Qual número tem **3 milhares, 4 centenas, 5 dezenas e 6 unidades**?" → 3456 (digitada); com zero em 30% das contas ("3 milhares, 0 centenas, 5 dezenas e 6 unidades" → 3056). Singular quando é 1 ("1 milhar").
  2. **O valor do algarismo:** "No número **3 456**, quanto vale o algarismo **4**?" → 400 (digitada); o algarismo aparece uma só vez no número, e nunca é o zero.
  3. **A ordem do algarismo:** "Em **4 258**, o algarismo **5** está em que ordem?" → **dezena** (4 opções: unidade, dezena, centena e milhar; o algarismo aparece uma só vez).
  4. **O zero:** "Que algarismo está na casa das **centenas** de **3 056**?" → 0 (digitada); a casa perguntada é sempre uma casa com zero.
- **Resposta:** digitada (tipos 1, 2 e 4) e escolha (tipo 3).
- **Contas diferentes:** milhares.
- **Meta de tempo:** 120 s.
- **Testes específicos:** o número montado confere com os milhares, centenas, dezenas e unidades da pergunta; o valor e a ordem do algarismo são recalculados; o zero só é resposta no tipo 4;
  a concordância ("1 milhar", "2 milhares") está certa; a posição da certa é uniforme no tipo 3.

## Nível 4 — Decompor números até 9999

- **Habilidade:** EF03MA02 (composição e decomposição por meio de diferentes adições).
- **Seis tipos de conta**, entre as 8 do nível (no máximo 2 de cada tipo por folha):
  1. **Completar a unidade:** `3 456 = 3 000 + 400 + 50 +` [ ] → 6.
  2. **Completar a dezena:** `3 456 = 3 000 + 400 +` [ ] `+ 6` → 50.
  3. **Completar a centena:** `3 456 = 3 000 +` [ ] `+ 50 + 6` → 400.
  4. **Completar o milhar:** `3 456 =` [ ] `+ 400 + 50 + 6` → 3000.
  5. **Compor:** "Qual número é **3 000 + 400 + 50 + 6**?" → 3456 (só parcelas diferentes de zero: `3 000 + 50` para 3 050).
  6. **Outra adição:** `3 456 = 3 000 +` [ ] → 456, `3 456 = 2 000 +` [ ] → 1456 ou `3 456 = 3 400 +` [ ] → 56 (a primeira parcela é um milhar inteiro ou uma centena inteira, menor que o número).
- **Zero:** números com zero em 15% das contas dos tipos 1 a 3 (`3 450 = 3 000 + 400 + 50 +` [ ] → 0); a resposta zero só aparece aí. No tipo 4 a resposta nunca é zero.
- **Resposta:** digitada.
- **Contas diferentes:** milhares.
- **Meta de tempo:** 120 s.
- **Testes específicos:** a soma das parcelas é sempre o número; a resposta é recalculada; no tipo 6 a primeira parcela é menor que o número e múltipla de 100; o zero só aparece nos tipos 1 a 3.

## Nível 5 — Comparar e ordenar números até 9999

- **Habilidade:** EF03MA01 (comparar e ordenar números até a unidade de milhar).
- **Três tipos de conta**, entre as 8 do nível (4 + 2 + 2):
  1. **Maior ou menor:** "Qual é o **maior** número?" com **3 opções** de quatro algarismos.
  2. **Pôr em ordem:** "Qual é a ordem certa, do **menor para o maior**?" (ou do maior para o menor) com **3 opções**, cada uma uma lista de 3 números; as erradas são outras ordens dos mesmos números.
  3. **O sinal:** "Qual sinal completa: **3 456 ○ 3 546**?" → **3 opções** (`>`, `<` e `=`); em cerca de 15% das contas o segundo número vem decomposto (`3 400 ○ 3 000 + 400` → `=`), para mostrar que são o mesmo número.
- **Dificuldade dentro do nível (tipos 1 e 2, e os pares do tipo 3):** 35% com milhares diferentes e bem separados (2 345, 6 180, 8 052); 30% com o mesmo milhar e centenas diferentes (3 245, 3 780, 3 612);
  15% com o mesmo milhar e a mesma centena (3 245, 3 281, 3 267); 10% com algarismos trocados (3 456, 3 465, 4 356), **no máximo 1 por folha**; 5% com zero no meio (3 005, 3 050, 3 500); 5% com os algarismos todos iguais menos o último (3 452, 3 453, 3 459).
- **Resposta:** escolha.
- **Contas diferentes:** centenas de milhares.
- **Meta de tempo:** 110 s.
- **Testes específicos:** o maior, o menor, a ordem certa e o sinal são recalculados; as listas erradas são sempre ordens diferentes da certa; os números das opções são distintos; no máximo 1 conta com algarismos trocados por folha; a posição da certa é uniforme.

## Nível 6 — A reta numérica

- **Habilidade:** EF03MA04 (relacionar números naturais a pontos da reta numérica, para ordenar e para construir fatos da adição e da subtração).
- **Figura:** uma **reta** com marcas igualmente espaçadas (de 4 a 10 intervalos), com os números escritos em algumas marcas (as pontas e, quando as marcas são muitas, uma sim e outra não). Retas: de 10 em 10 (0 a 100, 100 a 200, 500 a 600),
  de 50 em 50 (0 a 500), de 100 em 100 (0 a 1000, 1000 a 2000, 3000 a 4000) e de 1000 em 1000 (0 a 10 000).
  **Novidade:** pontos marcados com **letras** (A, B, C, D) em cima da reta, além da seta com "?" que já existe no app.
- **Três tipos de conta**, entre as 8 do nível (3 + 3 + 2):
  1. **Ler o ponto:** a seta com "?" aponta uma marca sem número; "Que número a seta está mostrando?" → o número (digitada, até 9999).
  2. **Onde fica o número?:** a reta tem 4 pontos com letras, "Em que ponto da reta fica o número **700**?" → A, B, C ou D (escolha de 4 letras).
  3. **Quanto falta?:** a reta tem dois pontos, A e B; "Quanto falta para ir do ponto **A** ao ponto **B**?" → B − A (digitada); constrói o fato da subtração.
- **Resposta:** digitada (tipos 1 e 3) e escolha (tipo 2).
- **Contas diferentes:** centenas.
- **Meta de tempo:** 120 s.
- **Testes específicos:** o número lido é recalculado pela posição da seta; o ponto certo do tipo 2 é o único que tem o número pedido; a diferença do tipo 3 é recalculada pelas posições; os pontos ficam sobre marcas;
  a reta cabe na largura do celular e as respostas não passam de 9999.

## Nível 7 — Sequências e regularidades

- **Habilidade:** EF03MA10 (identificar regularidades em sequências de adições ou subtrações sucessivas por um mesmo número e descrever a regra).
- **Regras:** de 1, 10, 100 e 1000 (60%) e de 2, 5, 20, 25 e 50 (40%), somando ou subtraindo (70% somando); os termos ficam entre 100 e 9999. A regra **não** vem escrita na pergunta (é o aluno que descobre), exceto no tipo 1.
- **Três tipos de conta**, entre as 8 do nível (4 + 2 + 2):
  1. **Completar o espaço:** "**De 50 em 50:** 1 200  1 250  [ ]  1 350  1 400" → 1300 (digitada; o espaço fica na 2ª, 3ª ou 4ª posição; a regra vem escrita).
  2. **Qual é a regra?:** "1 200, 1 250, 1 300, 1 350. Qual é a regra?" → "soma 50" (escolha entre 3 opções: a certa, a operação contrária e outro passo).
  3. **Qual número está errado?:** "2 500, 2 600, 2 700, 2 750, 2 900. Qual número está errado?" → 2750 (escolha entre 4 números da sequência; só um quebra a regra).
- **Travessias:** em parte das contas a sequência atravessa uma centena ou um milhar (de 100 em 100: 2 800, 2 900, [ ], 3 100), para a criança ver que o milhar muda.
- **Resposta:** digitada (tipo 1) e escolha (tipos 2 e 3).
- **Contas diferentes:** milhares.
- **Meta de tempo:** 120 s.
- **Testes específicos:** a sequência segue a regra; todos os termos ficam entre 100 e 9999; no tipo 1 o espaço nunca está nas pontas; no tipo 3 só um número quebra a regra e a regra pode ser recuperada pelos outros; as regras aparecem nas proporções;
  pelo menos 30% das contas de 10, 100 e 1000 têm travessia.

---

## Resumo do bloco

| Nível | Habilidades | Resposta | Meta |
|---|---|---|---|
| 1. Ler e escrever números até 9999 | EF03MA01 | digitada e escolha | 130 s |
| 2. Milhares, centenas, dezenas e unidades | EF03MA02 | digitada | 120 s |
| 3. Valor posicional e o zero | EF03MA01, EF03MA02 | digitada e escolha | 120 s |
| 4. Decompor números até 9999 | EF03MA02 | digitada | 120 s |
| 5. Comparar e ordenar números até 9999 | EF03MA01 | escolha | 110 s |
| 6. A reta numérica | EF03MA04 | digitada e escolha | 120 s |
| 7. Sequências e regularidades | EF03MA10 | digitada e escolha | 120 s |

Tempo por dia (3 folhas): de 5,5 a 6,5 minutos.

## Decisões do professor (14/11/2026)

Espaço fino de milhar (`3 456`) em todas as telas, com o aluno digitando sem espaço; regra do "e" e da vírgula no extenso dos livros didáticos ("mil e cem", "mil, cento e dez"); reta até 10 000 mantida (o rótulo "10 000" só aparece escrito na reta); regra escondida nos tipos 2 e 3 do nível 7.
