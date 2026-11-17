# 5º ano — tipos de conta e nota de dificuldade, por nível

> **Estado:** implementada junto com os geradores do 5º ano (`grade5.js`, `ESPEC` e `ORDEM`), por decisão do professor de 17/11/2026 (rodízio e rampa já nascem com o ano; nos anos anteriores vieram em PR separado). Os "tipos" abaixo são os da lista de cada nível em `grade5.js`; a ordem em que o rodízio os reserva às folhas segue a dificuldade medida de cada tipo (`ORDEM`), e não a ordem da tabela.

O motor é o mesmo do 4º ano (`plano.js`, ver `TIPOS-E-DIFICULDADE-4ANO.md`): 5 folhas por dia, as 40 contas do nível cobrem **todos os tipos** pelo menos uma vez por dia, a **nota de dificuldade** (0 a 100, relativa ao nível) sobe da folha 1 à 5 e, dentro de cada folha, as contas vão da mais fácil à mais difícil.
`testes/plano.test.js` cobre os níveis 165 a 211 (todos os tipos nas 5 folhas em 120 dias, dificuldade média que nunca desce e sobe pelo menos 10 pontos, contas em ordem, 2 contas de revisão).
A nota é regra minha, ainda sem validar com crianças; depois dos primeiros dados de uso (tempo e acerto por conta) se calibra.

Legenda: a coluna "Ordem do rodízio" lista os números dos tipos do mais fácil ao mais difícil, **medida** em 4 000 contas por nível (é o `ORDEM` de `grade5.js`); a última coluna resume, em palavras, o que a regra de `nota` de cada nível pontua (">" separa do mais fácil para o mais difícil) e pode diferir um pouco da ordem medida.

## Números até 999 999

| Nível | Tipos (cada um aparece nas 5 folhas) | Ordem do rodízio (folha 1 → 5, medida) | O que torna a conta mais difícil |
|---|---|---|---|
| 165 Ler, escrever e valor posicional até 999 999 | 1 extenso → algarismos · 2 algarismos → extenso · 3 valor do algarismo · 4 algarismo da casa | 4 → 1 → 2 → 3 | zeros no número · vírgula em vez de "e" no extenso · opções parecidas |
| 166 Comparar e ordenar números até 999 999 | 1 maior · 2 menor · 3 sinal · 4 número vizinho · 5 lista em ordem | 2 → 1 → 4 → 3 → 5 | muitos algarismos iguais no começo · vizinho que "vira" (180 999, 200 000) · sinal "=" · lista em ordem |
| 167 Arredondar e estimar | 1 dezena · 2 centena · 3 unidade de milhar · 4 dezena de milhar | 1 → 2 → 3 → 4 | dezena de milhar > milhar > centena > dezena · algarismo 5 perto do meio · arredondar para cima virando a casa |

## Adição e subtração

| Nível | Tipos (cada um aparece nas 5 folhas) | Ordem do rodízio (folha 1 → 5, medida) | O que torna a conta mais difícil |
|---|---|---|---|
| 168 Somas até 999 999 | 1 5 algarismos · 2 6 algarismos | 1 → 2 | quantidade de "vai um" · zeros · resultado de 6 algarismos |
| 169 Subtrações até 999 999 | 1 sem zero · 2 com zero | 1 → 2 | quantidade de "empresta" · zeros no número |
| 170 Problemas de adição e subtração | 1 juntar · 2 acrescentar · 3 separar · 4 retirar · 5 comparar · 6 completar | 2 → 1 → 3 → 4 → 5 → 6 | comparar e completar > separar e retirar > juntar e acrescentar · números maiores |

## Multiplicação

| Nível | Tipos (cada um aparece nas 5 folhas) | Ordem do rodízio (folha 1 → 5, medida) | O que torna a conta mais difícil |
|---|---|---|---|
| 171 Multiplicar por 10, 100, 1 000 e por múltiplos | 1 por 10 · 2 por 100 · 3 por 1 000 · 4 por múltiplos de 10 e 100 | 1 → 2 → 3 → 4 | por 1 000 > por 100 > por 10 · zeros no número · múltiplos de 10 e 100 |
| 172 Multiplicar 3 algarismos por 2 algarismos | 1 direta · 2 decomposição guiada | 2 → 1 | quantidade de reagrupamentos · zeros · direta > decomposição guiada |
| 173 Multiplicar 4 algarismos por 2 algarismos | 1 direta · 2 estimativa | 2 → 1 | reagrupamentos nas duas ordens · direta > estimativa |
| 174 Problemas de multiplicação | 1 caixas · 2 fileiras · 3 área · 4 por hora | 2 → 1 → 4 → 3 | área e velocidade > fileiras e caixas · resultado com mais algarismos |
| 175 Combinações possíveis: árvore e tabela | 1 árvore, 2 coleções · 2 contar sem figura · 3 fator que falta · 4 árvore, 3 coleções | 1 → 2 → 4 → 3 | três coleções > fator que falta > contar sem figura > árvore de duas coleções · mais combinações |

## Divisão

| Nível | Tipos (cada um aparece nas 5 folhas) | Ordem do rodízio (folha 1 → 5, medida) | O que torna a conta mais difícil |
|---|---|---|---|
| 176 Divisão com dividendo de até 5 algarismos | 1 quociente exato · 2 quociente com zero · 3 quociente com resto · 4 resto | 1 → 2 → 3 → 4 | divisor maior · zero no quociente · resto grande |
| 177 Divisão por dois algarismos, exata | 1 quociente de 2 algarismos · 2 quociente de 3 algarismos · 3 com a pista da multiplicação | 3 → 1 → 2 | divisor maior · quociente de 3 algarismos · sem a pista da multiplicação |
| 178 Divisão por dois algarismos, com resto | 1 quociente · 2 resto · 3 dividendo (verificação) | 2 → 1 → 3 | dividendo (verificação) > quociente > resto · resto perto do divisor |
| 179 Problemas de divisão | 1 repartir · 2 caixas completas · 3 o que sobra · 4 viagens | 1 → 2 → 3 → 4 | viagens > o que sobra > caixas > repartir · divisor maior |
| 180 Problemas com as quatro operações | 1 soma depois de multiplicar · 2 subtração depois de multiplicar · 3 divisão depois da soma · 4 estimativa | 4 → 1 → 2 → 3 | estimativa é a mais fácil · divisão depois da soma é a mais difícil |

## Álgebra e proporção

| Nível | Tipos (cada um aparece nas 5 folhas) | Ordem do rodízio (folha 1 → 5, medida) | O que torna a conta mais difícil |
|---|---|---|---|
| 181 Igualdades: operar nos dois lados | 1 somar nos dois lados · 2 subtrair nos dois lados · 3 multiplicar os dois lados · 4 dividir os dois lados · 5 equilíbrio | 1 → 2 → 3 → 5 → 4 | dividir e multiplicar os dois lados > somar e subtrair · números maiores |
| 182 O número desconhecido em problemas | 1 somar · 2 subtrair · 3 multiplicar · 4 dividir | 1 → 2 → 3 → 4 | dividir > multiplicar > subtrair > somar · enunciado em palavras > quadrado ◻ · número maior |
| 183 Proporcionalidade: preço e receita | 1 preço de mais unidades · 2 quantas unidades · 3 receita: ampliar · 4 receita: reduzir | 1 → 2 → 3 → 4 | receita reduzida > receita ampliada > mais unidades · números maiores |
| 184 Proporcionalidade: escala e ampliação | 1 mapa: distância real · 2 mapa: distância no papel · 3 ampliar ou reduzir · 4 tabela de proporção | 1 → 2 → 3 → 4 | tabela de proporção > ampliar ou reduzir > mapa · escala maior |
| 185 Partilha em duas partes desiguais | 1 parte menor · 2 parte maior · 3 maior de duas partes · 4 razão (fração) | 1 → 2 → 3 → 4 | razão (fração) > parte maior e menor · o triplo > o dobro |

## Frações

| Nível | Tipos (cada um aparece nas 5 folhas) | Ordem do rodízio (folha 1 → 5, medida) | O que torna a conta mais difícil |
|---|---|---|---|
| 186 Frações com qualquer numerador | 1 fração pintada · 2 partes pintadas · 3 escolher a figura · 4 fração não pintada | 2 → 1 → 3 → 4 | denominador 8 e 10 · fração não pintada > fração pintada · numerador maior que a metade |
| 187 Frações maiores que o inteiro e números mistos | 1 fração das figuras · 2 inteiros e resto · 3 misto → fração (escolha) · 4 misto → fração (digitar) | 1 → 2 → 3 → 4 | número misto → fração (digitar) > escolha > inteiros e resto > fração das figuras · denominador maior · mais inteiros |
| 188 A fração como divisão | 1 divisão → fração · 2 fração → divisão · 3 fração igual a inteiro | 2 → 1 → 3 | fração igual a inteiro > divisão → fração · numerador maior que o denominador |
| 189 Frações na reta numérica | 1 ponto entre 0 e 1 · 2 ponto além do 1 · 3 escolher a reta · 4 quantas partes | 4 → 1 → 3 → 2 | ponto além do 1 > escolher a reta > ponto entre 0 e 1 · denominador maior |
| 190 Frações equivalentes | 1 escolher a fração · 2 numerador que falta · 3 denominador que falta · 4 escolher a figura | 2 → 3 → 1 → 4 | figura equivalente > escolha > denominador/numerador que falta · multiplicador maior |
| 191 Comparar e ordenar frações | 1 mesmo denominador · 2 mesmo numerador · 3 com equivalentes · 4 ordenar três | 1 → 2 → 3 → 4 | ordenar três > com equivalentes > mesmo numerador > mesmo denominador · denominador maior |

## Decimais e porcentagem

| Nível | Tipos (cada um aparece nas 5 folhas) | Ordem do rodízio (folha 1 → 5, medida) | O que torna a conta mais difícil |
|---|---|---|---|
| 192 Decimais: ler, escrever e decompor | 1 quadro de 100 · 2 valor do algarismo · 3 decomposição · 4 como se lê | 1 → 2 → 3 → 4 | como se lê > decomposição e valor do algarismo > quadro de 100 · mais casas decimais |
| 193 Decimais na reta numérica | 1 decimal entre 0 e 1 · 2 decimal entre inteiros · 3 centésimos na reta · 4 escolher a reta | 1 → 2 → 4 → 3 | centésimos na reta > escolher a reta > decimais entre inteiros > entre 0 e 1 |
| 194 Comparar e ordenar decimais | 1 qual é maior · 2 ordenar três · 3 fração ↔ decimal · 4 sinal | 1 → 3 → 2 → 4 | sinal (0,5 ◻ 0,50) > ordenar três > fração ↔ decimal > comparar dois · números com casas diferentes |
| 195 Somar e subtrair decimais | 1 soma de décimos · 2 subtração de décimos · 3 soma de centésimos · 4 subtração de centésimos | 1 → 2 → 3 → 4 | centésimos > décimos · subtração > soma · números maiores |
| 196 Problemas com decimais: dinheiro e medidas | 1 dinheiro: soma · 2 dinheiro: troco · 3 medidas: soma · 4 dinheiro: diferença | 2 → 1 → 3 → 4 | medidas e diferença > soma de compras > troco · números maiores |
| 197 Multiplicar decimal por número natural | 1 por 10, 100 e 1 000 · 2 decimal × natural · 3 natural × decimal · 4 problema de preço | 1 → 2 → 3 → 4 | problema de preço > natural × decimal > decimal × natural > por 10, 100 e 1 000 · multiplicador maior |
| 198 Dividir decimal por número natural | 1 decimal ÷ natural · 2 natural ÷ natural · 3 ÷ 10, 100 e 1 000 · 4 problema | 3 → 1 → 2 → 4 | natural ÷ natural e problema > decimal ÷ natural > ÷ 10, 100 e 1 000 |
| 199 Porcentagem: 10%, 25%, 50%, 75% e 100% | 1 10% · 2 50% · 3 25% · 4 75% · 5 associar | 1 → 5 → 2 → 3 → 4 | 75% > 25% > 50% > 10% · número maior · associar é o mais fácil depois do 10% |
| 200 Porcentagem no dinheiro: desconto e acréscimo | 1 valor do desconto · 2 preço com desconto · 3 preço com acréscimo · 4 comparar ofertas | 1 → 2 → 3 → 4 | comparar ofertas > acréscimo e preço com desconto > valor do desconto · 25% > 10% e 50% · preço maior |

## Geometria

| Nível | Tipos (cada um aparece nas 5 folhas) | Ordem do rodízio (folha 1 → 5, medida) | O que torna a conta mais difícil |
|---|---|---|---|
| 201 Plano cartesiano: localizar pontos | 1 coordenadas do ponto · 2 qual ponto · 3 célula da planilha · 4 distância entre pontos | 1 → 2 → 4 → 3 | planilha e distância > qual ponto > coordenadas · número maior |
| 202 Plano cartesiano: movimentos e giros | 1 um movimento · 2 passos de A até B · 3 giros · 4 dois movimentos | 3 → 2 → 1 → 4 | dois movimentos > giros > um movimento > passos até B · mais unidades |
| 203 Sólidos: planificações e atributos | 1 nome pela planificação · 2 contar faces, arestas e vértices · 3 círculos da planificação · 4 nome pela descrição | 3 → 1 → 4 → 2 | nome pela descrição e contar > nome pela planificação > círculos · base com mais lados |
| 204 Polígonos: lados, vértices e ângulos | 1 quantos lados · 2 nome pelo número de lados · 3 ângulos retos · 4 nome pela descrição | 1 → 3 → 2 → 4 | nome pela descrição > nome pelo número de lados e ângulos retos > quantos lados · pentágono e hexágono |
| 205 Ampliação e redução na malha | 1 quantas vezes ampliou · 2 quantas vezes reduziu · 3 os ângulos · 4 escolher a ampliação | 3 → 1 → 2 → 4 | escolher a ampliação > reduzir > ampliar > ângulos · escala 3 e 4 |

## Medidas

| Nível | Tipos (cada um aparece nas 5 folhas) | Ordem do rodízio (folha 1 → 5, medida) | O que torna a conta mais difícil |
|---|---|---|---|
| 206 Conversões de unidades em problemas | 1 comprimento · 2 massa · 3 capacidade · 4 problema com conversão | 2 → 3 → 1 → 4 | problema > conversões com decimais · de pequena para grande unidade |
| 207 Tempo e temperatura em problemas | 1 duração em minutos · 2 horas e minutos · 3 temperatura · 4 semanas e dias | 4 → 2 → 3 → 1 | duração em minutos > temperatura > horas e minutos e semanas e dias · números maiores |
| 208 Perímetro e área na malha | 1 área · 2 perímetro · 3 maior área · 4 mesmo perímetro | 1 → 3 → 2 → 4 | mesmo perímetro > maior área > perímetro > área · figura com mais quadradinhos |
| 209 Volume: contar cubinhos | 1 volume do bloco · 2 camadas · 3 maior volume · 4 medidas do bloco | 1 → 2 → 3 → 4 | maior volume > camadas e medidas > volume do bloco · bloco maior |

## Dados e acaso

| Nível | Tipos (cada um aparece nas 5 folhas) | Ordem do rodízio (folha 1 → 5, medida) | O que torna a conta mais difícil |
|---|---|---|---|
| 210 Espaço amostral e probabilidade | 1 resultados possíveis · 2 mesma chance? · 3 fração da roleta · 4 fração do dado | 1 → 2 → 4 → 3 | fração da roleta > fração do dado > mesma chance? > resultados possíveis · mais partes |
| 211 Tabelas e gráficos de colunas e de linhas | 1 colunas · 2 linhas · 3 maior valor · 4 diferença | 1 → 2 → 3 → 4 | diferença > maior valor e linhas > colunas · valores maiores |
