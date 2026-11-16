# 4º ano — tipos de conta e nota de dificuldade, por nível

> **Estado:** aprovada pelo professor em 16/11/2026 e implementada (`plano.js`, `grade4.js`, `testes/plano.test.js`). Os "tipos" abaixo são os da lista de cada nível em `grade4.js` (`ESPEC`); a ordem em que o rodízio os reserva às folhas segue a dificuldade medida de cada tipo (`ORDEM`), e não a ordem da tabela.

Proposta para o **rodízio de tipos** e a **rampa de dificuldade** (caminho A, aprovado em 16/11/2026). Vale para os níveis 119 a 164 (as fichas 1 a 46).

## Como vai funcionar

- **Folhas do dia:** 5 folhas, cada uma com 8 contas do nível e 2 de revisão. As 40 contas do nível cobrem **todos os tipos da lista** do nível pelo menos uma vez por dia.
- **Rodízio de tipos:** o tipo vem primeiro. A folha 1 reserva contas para certos tipos, a folha 2 para outros, e assim até a folha 5. Nos níveis com muitos tipos, cada folha reserva até 8 contas; as demais contas da folha seguem sorteadas.
- **Nota de dificuldade (0 a 100):** cada conta recebe uma nota por regra do nível, que mede a dificuldade **dentro do próprio nível** (0 = a mais fácil que o nível sorteia; 100 = a mais difícil).
- **Rampa no dia:** a folha 1 usa contas com nota baixa (cerca de 0 a 40), a folha 3 contas médias (30 a 70) e a folha 5 contas altas (60 a 100). Dentro de cada folha as contas vão da mais fácil à mais difícil. Cada dia começa de novo.
- **Níveis com poucos graus de dificuldade** (subtração, por exemplo) terão degraus planos: a regra é "nunca desce", e não "sempre sobe".
- **Teste automático:** falha se algum nível deixar um tipo da lista sem aparecer nas 5 folhas, ou se a nota média descer de uma folha para a seguinte.
- **A nota é regra minha**, ainda sem validar com crianças. Depois dos primeiros dados de uso (tempo e acerto por conta), calibramos.

Legenda: "**mais difícil**" = o que sobe a nota.

## Números até 99 999

| Nível | Tipos (cada um aparece nas 5 folhas) | O que torna a conta mais difícil |
|---|---|---|
| 119 Ler e escrever | 1 extenso → algarismos · 2 algarismos → extenso | zeros no número · vírgula em vez de "e" ("vinte mil, cento e dez") · opções parecidas |
| 120 Decomposição | 1 termo escondido · 2 valor do algarismo · 3 algarismo da casa · 4 montar o número | zeros no número · casa mais à esquerda |
| 121 Comparar e ordenar | 1 maior · 2 menor · 3 sinal (<, >, =) · 4 número vizinho | muitos algarismos iguais no começo · vizinho que "vira" (29 999, 50 000) · sinal "=" |
| 122 Arredondar | 1 dezena · 2 centena · 3 milhar | milhar mais que centena mais que dezena · algarismo terminado em 5 · arredondar para cima virando a casa |

## Adição e subtração

| Nível | Tipos | O que torna a conta mais difícil |
|---|---|---|
| 123 Somas, 4 algarismos | 1 tipo (soma com reagrupamento em 2 ou mais ordens) | quantidade de "vai um" · zeros · resultado de 5 algarismos |
| 124 Subtrações, 4 algarismos | 1 tipo, com dois ramos: sem zero e com zero | quantidade de "empresta" · zeros no número |
| 125 Somas e subtrações até 99 999 | 1 soma · 2 subtração | "vai um" ou "empresta" · zeros · subtração mais que soma |
| 126 Estimar | 1 soma · 2 subtração | arredondar para o milhar (mais difícil que a centena) · parcela perto do meio do intervalo |
| 127 Problemas de adição e subtração | 1 juntar · 2 acrescentar · 3 separar · 4 retirar · 5 comparar · 6 completar | comparar e completar > separar e retirar > juntar e acrescentar · números maiores |
| 128 Operações inversas | 1 soma → subtração · 2 subtração → soma · 3 lacuna ("__ + 2 300 = 6 800") | lacuna > subtração → soma > soma → subtração · números maiores |

## Multiplicação

| Nível | Tipos | O que torna a conta mais difícil |
|---|---|---|
| 129 Propriedades | 1 distributiva · 2 comutativa · 3 associativa · 4 decomposição completa | associativa e decomposição > distributiva > comutativa · números maiores |
| 130 Por 10, 100 e 1000 | 1 por 10 · 2 por 100 · 3 por 1000 | 1000 > 100 > 10 · número com zero · forma com lacuna |
| 131 Dezenas e centenas inteiras | 1 dezena × dezena · 2 centena × unidade · 3 dezena × centena | produto com mais zeros · dezena × centena |
| 132 Por um algarismo, sem reagrupar | 1 tipo (multiplicador 2, 3 ou 4) | multiplicador maior · 3 algarismos |
| 133 2 algarismos × 1 | 1 tipo (com reagrupamento) | multiplicador maior · reagrupa mais de uma ordem |
| 134 3 algarismos × 1 | 1 tipo | reagrupamentos · multiplicador maior · zero no meio |
| 135 4 algarismos × 2 a 5 | 1 tipo | reagrupamentos · multiplicador maior |
| 136 Por 11 a 19 | 1 direta · 2 decomposição guiada ("12 × 10 + 12 × 5") | direta > decomposição guiada · fatores maiores |
| 137 Por dois algarismos | 1 tipo | fatores maiores · reagrupamentos |
| 138 Problemas de multiplicação | 1 grupos · 2 proporção · 3 fileiras | proporção > grupos > fileiras · números maiores |
| 139 Combinações | 1 contar combinações · 2 achar o fator que falta | fator que falta > contar · números maiores |

## Divisão

| Nível | Tipos | O que torna a conta mais difícil |
|---|---|---|
| 140 Sem resto | 1 quociente sem zero · 2 quociente com zero | divisor maior · quociente com zero · dividendo de 3 algarismos |
| 141 Com resto | 1 quociente · 2 resto · 3 verificação | divisor maior · quociente com zero · verificação > quociente > resto |
| 142 Quatro algarismos | 1 exata · 2 quociente com resto · 3 resto | divisor maior · quociente maior · com resto > exata |
| 143 Por dois algarismos | 1 direta · 2 com pista da multiplicação | divisor maior (10 a 30) · quociente maior · direta > com pista |
| 144 Problemas de divisão | 1 repartir · 2 quantas caixas cabem · 3 o que sobra · 4 viagens necessárias | viagens (resto +1) > sobra > caixas > repartir · números maiores |
| 145 Múltiplos e restos | 1 reconhecer o múltiplo · 2 sequência de múltiplos · 3 resto · 4 mesmo resto | mesmo resto > resto > sequência > múltiplo · divisor maior |

## Igualdades e problemas

| Nível | Tipos | O que torna a conta mais difícil |
|---|---|---|
| 146 Igualdades | 1 somar o mesmo número · 2 tirar o mesmo número · 3 equivalência ("36 + 14 = 40 + __") | equivalência > tirar > somar · números maiores |
| 147 Número desconhecido | 1 + · 2 − · 3 × · 4 ÷ (dividendo escondido) · 5 ÷ (divisor escondido) | divisor escondido > dividendo escondido > × > − > + · números maiores |
| 148 Problemas de duas etapas | 1 soma depois de multiplicar · 2 subtração depois de multiplicar · 3 divisão depois de subtração | divisão depois de subtração > subtração > soma · números maiores |

## Frações e decimais

| Nível | Tipos | O que torna a conta mais difícil |
|---|---|---|
| 149 Frações unitárias | 1 que fração está pintada · 2 em quantas partes · 3 quantos 1/n formam o inteiro · 4 escolher a figura de 1/n · 5 qual é maior | denominador 10 e 5 > 4, 3 e 2 · comparar frações > as demais · círculo > barra |
| 150 Frações na reta | 1 que fração está no ponto A · 2 quantas partes · 3 escolher a reta | denominador maior · escolher a reta > as demais |
| 151 Décimos e centésimos | 1 quantos décimos · 2 quantos centésimos · 3 qual decimal é · 4 converter 0,7 → décimos / 0,45 → centésimos | centésimos > décimos · decimal escrito > quantidade · opções parecidas |
| 152 Decimais e dinheiro | 1 reais → centavos · 2 centavos → reais · 3 soma de reais e centavos · 4 moedas de 25 ou 50 | centavos → reais > reais → centavos · valores com centavos diferentes de zero |

## Ângulos, sólidos e simetria

| Nível | Tipos | O que torna a conta mais difícil |
|---|---|---|
| 153 Localização na malha | 1 casas para a direita · 2 em que casa está a estrela · 3 deslocamento (direita e cima) · 4 total de casas | deslocamento > total > casa > direita · mais casas |
| 154 Prismas e pirâmides | 1 contar faces/arestas/vértices · 2 dar o nome do sólido | arestas e vértices > faces · base com mais lados · pirâmide pouco usual |
| 155 Ângulos | 1 reto, agudo ou obtuso · 2 qual é o maior · 3 ângulos retos de uma figura | ângulos perto de 90° · maior entre três parecidos |
| 156 Simetria | 1 quantos quadradinhos faltam · 2 a figura é simétrica? · 3 eixos de simetria | mais quadradinhos na figura · eixos de figuras com 5 ou 6 lados |

## Medidas, tempo e dinheiro

| Nível | Tipos | O que torna a conta mais difícil |
|---|---|---|
| 157 Perímetro | 1 perímetro · 2 lado que falta · 3 conversão de unidades | lado que falta > perímetro · pentágono e triângulo > quadrado e retângulo · conversão de km e mm |
| 158 Área na malha | 1 contar quadradinhos · 2 retângulo (largura × altura) · 3 comparar figuras | mais quadradinhos · figuras de áreas parecidas |
| 159 Massa e capacidade | 1 kg → g e L → mL · 2 g → kg e mL → L · 3 misto (1 kg e 500 g) | misto > g → kg > kg → g |
| 160 Tempo | 1 ler o relógio · 2 minutos de duração · 3 hora de término · 4 conversões | duração que passa da hora · relógio com minutos não múltiplos de 5 · término com horas e minutos |
| 161 Temperatura | 1 ler o termômetro · 2 diferença · 3 subiu ou desceu · 4 a cidade mais quente | subiu e desceu > diferença > leitura · números maiores |
| 162 Dinheiro | 1 troco · 2 desconto · 3 parcelas · 4 comparar à vista e parcelado | comparar > parcelas > desconto > troco · valores maiores |

## Acaso, tabelas e gráficos

| Nível | Tipos | O que torna a conta mais difícil |
|---|---|---|
| 163 Chances | 1 cor mais ou menos provável · 2 certo, possível ou impossível · 3 comparar duas roletas | menos provável > mais provável · comparar roletas com chances parecidas |
| 164 Tabelas e gráficos | 1 ler um valor · 2 soma de valores · 3 diferença entre dois · 4 total (tabela ou gráfico) | tabela com 3 linhas > gráfico · total > diferença > soma > leitura |

## O que preciso que o senhor revise

1. **Tipos:** falta algum tipo importante em algum nível? Algum tipo da lista é pouco útil e pode sair?
2. **Níveis com um tipo só** (123, 124, 132 a 135, 137): o rodízio não faz nada; a rampa é a única coisa que muda a folha.
3. **A ordem "mais difícil"** que escolhi em cada linha. Por exemplo, "viagens necessárias" mais difícil que "repartir" na divisão.
4. **Rampa:** folha 1 de 0 a 40, folha 3 de 30 a 70, folha 5 de 60 a 100 (a minha sugestão). Se o senhor preferir uma subida mais suave ou mais forte, é só dizer.
