# Identidade visual da Folhinha VIP

Regras fixas para tudo que levar o nome ou a logo: aplicativo, capas de álbum, pacotes de figurinha, material de divulgação. Decididas com o professor.

## Logo (ícone)
Cinco bolas em forma de cruz sobre um quadrado arredondado azul-marinho: bola de cima e de baixo em coral, bolas laterais em amarelo, bola do centro em verde. O arquivo-fonte é `icons/icon.svg`. Não redesenhar nem pedir a uma IA para desenhar: usar sempre o arquivo.

## Nome
- Texto: **Folhinha VIP** (F e V maiúsculos, P maiúsculo; sem hífen).
- Fonte: **Fredoka Bold** (700), da Google Fonts, licença OFL. Nos arquivos de `marca/` o texto já está convertido em desenho (curvas), então não depende de fonte instalada.
- Cores:
  - Fundo claro: "Folhinha" em azul-marinho `#1B2A52`, "VIP" em coral `#F2503F`.
  - Fundo escuro: "Folhinha" em branco `#FFFFFF`, "VIP" em amarelo `#FFB92B`.
- Espaço entre as duas palavras: 30% do tamanho da fonte.

## Arquivos
| Arquivo | Uso |
|---|---|
| `marca/logo-claro.svg` | Ícone + nome, para fundo claro |
| `marca/logo-escuro.svg` | Ícone + nome, para fundo escuro (capas, pacotes) |
| `marca/nome-claro.svg` | Só o nome, fundo claro |
| `marca/nome-escuro.svg` | Só o nome, fundo escuro |
| `marca/logo-escuro.png`, `marca/logo-claro.png` | Versões em PNG com fundo transparente, para sobrepor em imagens |

## Proporção do conjunto
Altura do ícone = 1,55 × o tamanho da fonte; espaço entre o ícone e o texto = 0,28 × o tamanho da fonte; texto centralizado na vertical em relação ao ícone.

## Em capas e pacotes
A imagem de fundo é gerada sem logo e sem o nome, com uma área calma na parte de baixo. A logo oficial (`marca/logo-escuro.png`) é sobreposta por cima, centralizada, com largura de cerca de 55% da largura da arte. Nunca pedir a uma IA para escrever o nome.

## Margem de segurança
Deixar ao redor da logo pelo menos a metade da altura do ícone de espaço livre.

## Capas e pacotes dos álbuns
Cada álbum tem `stickers/capas/<id>.webp` (capa em retrato, 640 px de largura) e `stickers/pacotes/<id>.webp` (pacote com fundo transparente, 520 px de altura). O `<id>` é o mesmo do tema: bandeiras, dinossauros, pets, ameacados, espaco. O teste `testes/capas.test.js` exige as duas imagens para todo álbum novo.

Receita para um álbum novo:
1. Gerar a arte (capa 3:4 e pacote 1:1) em desenho animado, sem borda branca nos personagens, com uma área calma na parte de baixo (14% na capa, 18% no pacote), sem logo e sem o nome Folhinha VIP.
2. Sobrepor `marca/logo-escuro.png` na área calma, com largura de cerca de 55% da capa e 55% do pacote. Em fundo claro (como o céu das Bandeiras) usar `marca/logo-claro.png`.
3. Converter para WebP e, no pacote, deixar o fundo branco transparente.
