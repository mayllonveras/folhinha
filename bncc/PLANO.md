# Plano da reformulação da grade com base na BNCC

Estado: **etapa 2 (fundação) implementada neste PR, ainda não aplicada no banco**. As demais etapas seguem em planejamento. O app não está em produção e os alunos atuais são de teste, então o banco pode ser refeito do zero.

Etapa 3 (motor de exercícios) implementada em PR separado: exercícios com **figura** (objetos, dezenas, gráfico de colunas, relógio, reta numérica, malha, formas e sólidos) e de **escolha entre opções**, com 23 geradores ligados às habilidades da BNCC (`exercicios.js`) e prévia na aba **Exercícios** do `/adm`. As contas erradas em reforço passam a guardar a figura e as opções (`weak_items.extra` e `sig`). Migração: `migracoes/2026-11-14-exercicios-figura.sql`. Os geradores ainda não estão em nenhum nível: entram na grade nova (etapa 4).

Etapa 2 entregue: parâmetros editáveis no `/adm`, ano escolar e teto por aluno (ano calculado, sem gravar na virada), regras de dia normal, ouro e salto, oferta de voltar, histórico de mudanças de nível e telas do aluno e dos pais. Migração: `migracoes/2026-11-14-fundacao-avanco.sql`. O ano de cada nível (`levels.ano`) é **provisório** (1 a 4) até a grade nova.

## Decisões já tomadas

| # | Decisão |
|---|---|
| 1 | Escopo: primeiro o 1º ao 5º ano; 6º ao 9º numa segunda fase. |
| 2 | Trilha **única**, ordenada por ano, misturando as unidades temáticas dentro de cada ano. |
| 3 | Habilidades que não cabem em exercício de tela (grupo C do inventário) ficam **de fora** do app. |
| 4 | Cada nível fica ligado a códigos da BNCC; os pais veem o ano e a habilidade, a criança só o número do nível. |
| 5 | Aluno de bom desempenho pode avançar **acima do ano escolar**, com regras de avanço (abaixo). |
| 6 | Salto **direto** de nível. Se o aluno for mal no nível seguinte, o app **oferece** a ele voltar e treinar mais o anterior (não rebaixa sozinho). |
| 7 | Teto de avanço padrão: **+1 ano**, redefinível no `/adm`; os pais podem ajustar por aluno. |
| 8 | Limiares do desempenho (ouro e salto) valem como proposta inicial e são **redefiníveis no `/adm`**. |
| 9 | Teste de nivelamento na entrada: **sim**. |
| 10 | O ano escolar do aluno é **atualizado sozinho na virada do ano**. |

## Regras de avanço (valores iniciais, todos editáveis no `/adm`)

Hoje: o dia fecha ao cumprir a cota de folhas (mínimo 3). Com 80% ou mais de acertos de primeira e tempo médio dentro da meta, ganha 1 carimbo. Com 5 carimbos, sobe 1 nível. Máximo de 1 nível por dia de estudo.

| Tipo de dia | Acertos de primeira | Tempo médio | Efeito |
|---|---|---|---|
| Normal | ≥ 80% | ≤ meta | +1 carimbo |
| Ouro | ≥ 95% | ≤ 80% da meta | +2 carimbos |
| Salto | ≥ 98% | ≤ 60% da meta, **no 1º dia do nível** | sobe direto para o próximo nível |

Outros parâmetros (também no `/adm`):

| Parâmetro | Valor inicial |
|---|---|
| Máximo de saltos por semana | 2 |
| Folha de revisão a cada N níveis | 5 |
| Dias de estudo sem carimbo para oferecer "voltar" | 2 |
| Teto de avanço padrão (anos à frente do ano escolar) | +1 |
| Data da virada do ano escolar | 1º de janeiro |

### Oferta de voltar
Se o aluno estiver num nível alcançado por **salto** e passar 2 dias de estudo seguidos sem carimbo, a tela dele pergunta: "Esse nível está difícil? Quer voltar e treinar mais o anterior?" (Voltar / Continuar). Ao voltar, o aluno volta um nível, os carimbos zeram e ele **não pode saltar** de novo desse nível por 7 dias. Os pais também são avisados no painel. Nunca é automático.

### Teto de avanço
Cada aluno tem ano escolar e um teto (padrão +1 ano). Ao chegar no teto, o aluno continua praticando e ganhando figurinhas, e os pais veem um aviso para liberar mais.

### Revisão
A cada N níveis, uma folha de revisão traz contas dos níveis anteriores. Quem pula níveis e erra a revisão perde o direito ao salto por uma semana.

## Ano escolar sem tarefa agendada

O banco guarda o `ano_escolar` informado e o **ano civil de referência** (`ano_ref`). O ano escolar atual é calculado na hora: `ano_escolar + (ano civil atual − ano_ref)`, limitado ao máximo da grade disponível. Assim não existe rotina de virada para dar errado. Os pais podem corrigir o valor a qualquer momento. A data da virada (1º de janeiro) é parâmetro do `/adm`.

### Princípio: a virada não interfere no andamento do aluno

O ano escolar é só um **rótulo e um limite**. Ele nunca move o aluno na trilha.

- **A virada não grava nada.** Como o ano atual é calculado na hora, nada é atualizado no dia 1º de janeiro: nível, carimbos, sequência de dias, pacotes de figurinhas, contas a reforçar e folhas em andamento ficam exatamente como estavam.
- **O teto só sobe.** O teto é relativo ao ano (por exemplo, ano escolar + 1). Na virada ele sobe um ano e nunca desce, então a virada não bloqueia nem atrasa nenhum aluno. Quem estava parado no teto passa a poder avançar.
- **Sem efeito automático.** A virada não rebaixa, não zera, não promove e não mostra nada novo à criança. Quem estava "1 ano à frente" passa a "no ano" na etiqueta dos pais, e o aluno segue do ponto em que parou.
- **Folha aberta na virada.** Uma folha começada antes da meia-noite do dia 31 termina normalmente. O ano é lido do dia de estudo da própria folha, e o teto só é conferido quando o dia fecha.
- **Sem sequência quebrada.** A sequência de dias de estudo não depende do ano escolar.
- **Aviso só para os pais.** No painel dos pais aparece uma observação discreta ("em janeiro o ano escolar passou para o 4º ano; confira se está certo"), com um clique para corrigir. Nunca bloqueia nada.
- **Fim da grade.** Se o ano escolar passar do último ano que a grade já tem (por exemplo, 6º ano em 2027, antes de os anos finais existirem), o teto é limitado ao que existe, e o aluno continua nos níveis disponíveis.

Consequência: em janeiro de 2027, os alunos que cursam o 5º ano passam ao 6º, e a grade precisa ter o 6º ano. Isso torna a fase 2 necessária ainda no primeiro ano de uso.

## Teste de nivelamento (na entrada)

Opcional, feito na hora do cadastro. Cinco folhas curtas de 5 contas, uma por ano, amostrando o meio da grade de cada ano. O aluno começa no ano mais alto em que acertar 80% ou mais, no primeiro nível desse ano. Os pais podem pular o teste e escolher o ponto de partida.

## Mudanças técnicas

- **Banco:** colunas `ano_escolar`, `ano_ref` e `teto_anos` em `students`; coluna `ano` em `levels` (e a ligação nível → habilidades); tabela de parâmetros editáveis; campo na folha para marcar dia ouro, dia de salto e nível alcançado por salto; reescrita da função `student_submit_sheet`, hoje com 80%, 5 carimbos e a meta de tempo escritos dentro dela.
- **`/adm`:** deixa de ser só leitura. Ganha a tela de parâmetros, com funções no banco que conferem o administrador.
- **Aluno:** tela mostra carimbo duplo e salto; oferta de voltar.
- **Pais:** cadastro com ano escolar e teto; painel com o ano de cada nível, a etiqueta "cursa o 3º ano · estudando o 4º (+1)" e o aviso de nível difícil.
- **Exercícios:** novos tipos de resposta (escolha entre opções, figura, gráfico, reta numérica, malha, relógio, fração, decimal), conforme a coluna "Recurso novo necessário" do inventário.
- **Catálogo:** `habilidades-anos-iniciais.json` vira a fonte dos textos oficiais no app.

## Ordem de trabalho proposta

1. **Revisão do inventário** pelo professor (grupos A, B e C da planilha).
2. **Fundação (feita, PR #23):** parâmetros no `/adm`, ano escolar, teto e a nova regra de fechamento do dia (ouro, salto e oferta de voltar). Dá para construir e testar com os 45 níveis atuais.
3. **Motor de exercícios (feito, PR #24; os geradores ainda não estão ligados a nenhum nível):** os novos tipos de resposta, começando pelos que destravam mais habilidades (escolha e figura).
4. **A grade, um ano por vez**, cada ano num PR revisado pelo professor. Dividida em duas partes (ver "Decisões da etapa 4").
5. **Nivelamento** (depende da grade dos cinco anos).
6. **Telas dos pais:** ano de cada nível, etiquetas e avisos.
7. **Anos finais** (6º ao 9º), necessários a partir de janeiro de 2027.

## Decisões da etapa 4 (14/11/2026)

Conta de ritmo, com os valores atuais (estudo de segunda a sexta, 5 carimbos por nível, dia normal = 1 carimbo, dia ouro = 2, salto = 1 dia, no máximo 2 por semana): aluno regular ≈ 1 nível por semana, aluno forte ≈ 1,7, aluno excepcional ≈ 3. O ano letivo tem cerca de 40 semanas.

- **Cerca de 30 níveis por ano, como referência de ritmo, não como limite:** o professor decidiu que a progressão de dificuldade manda (31, 32 ou 35 níveis são aceitáveis; a conta usa o ano de 52 semanas sem férias, com 5 a 10 minutos por dia, e o teto prático fica em cerca de 40 níveis por ano; acima disso se ajustam os carimbos por nível). A grade do 1º ano proposta tem 33 níveis, ver `GRADE-1ANO.md` (1º ao 5º ≈ 150 níveis; anos finais depois, com a mesma conta). O aluno regular termina o ano em ~30 semanas e sobram ~10 de folga; o aluno forte (ouro todo dia) consome o ano e o teto +1 em ~36 semanas. O ritmo se ajusta pelos parâmetros do `/adm`, não pela quantidade de níveis. Um nível não é uma habilidade: uma habilidade vira de 1 a 3 níveis.
- **No teto,** em vez de repetir o último nível, o aluno recebe folhas de **revisão e de desafio**.
- **Revisão:** cerca de **20% de cada folha** vem de níveis anteriores (a tabuada já tem revisão espaçada).
- **Carimbos por nível** viram campo ajustável no `/adm` (padrão 5), para níveis mais difíceis ou mais fáceis.
- **Teto +2:** quando o aluno estiver perto de bater o teto +1, a tela do responsável mostra a **sugestão de liberar +2**, e o responsável decide (campo `teto_anos` do aluno).
- **Etapa 4 em duas partes:**
  - **4a. Mecanismos:** carimbos por nível, revisão de 20%, folha de revisão/desafio no teto, sugestão de +2 na tela do responsável.
  - **4b. Grade:** os 30 níveis do 1º ano a partir do inventário, ligando cada nível a códigos EF01MA e aos geradores; o professor revisa antes de entrar no app. Depois, 2º ao 5º. A classificação A/B/C do 1º ano é proposta junto com a grade.
- **Lembretes levantados na conversa:** revisão dos níveis saltados (ficaram sem carimbos); meta de tempo inicial estimada para os 150 níveis, ajustada com dados reais; banco de questões escrito à mão para conteúdos que não têm gerador (problemas de texto); aviso de "retomada" depois de um mês parado; teste de nivelamento para aluno novo.

## Decisão: grade refeita do zero (14/11/2026)

Os 45 níveis antigos são descartados, para não herdar vícios do planejamento anterior. Cada nível da grade nova nasce de uma **ficha**
(habilidade, parâmetros de dificuldade, tipos de conta, distratores, meta de tempo, testes) revisada pelo professor antes de virar código.
Vale para o 1º ano (`GRADE-1ANO.md`) e para os seguintes, incluindo tabuada, divisão e equações.

## Etapa 4a (mecanismos): estado

Escrita em 14/11/2026, **migração ainda não aplicada** (`migracoes/2026-11-14-etapa-4a.sql`):

- **Carimbos por nível:** `levels.stamps_needed` opcional (vazio = padrão geral, hoje 5), editável no `/adm` (Parâmetros → Carimbos por nível).
- **Revisão de 20%:** 2 das 10 contas de cada folha vêm de níveis anteriores (60% dos 3 últimos, 40% de qualquer anterior). Sem mudança de banco.
- **Folha de revisão no teto:** com o nível concluído e o próximo além do limite, a folha é toda de revisão (inclui o nível atual). A folha de **desafio**
  fica para depois: ela depende de os geradores da grade nova terem versões mais difíceis.
- **Sugestão de liberar mais um ano:** na tela do responsável, quando faltam até 3 níveis para o limite; ele decide (botão "Liberar mais 1 ano").

## Grade do 1º ano ligada ao app (14/11/2026)

Os 45 níveis antigos saíram de `core.js`. `FC.LEVELS` agora é montado em `grade1.js` com os 35 níveis do 1º ano (grupo, nome, dica, meta de tempo e, no nível 16,
o lembrete das mãos). A migração `migracoes/2026-11-14-grade-1ano.sql` troca a tabela `levels` e apaga os alunos de teste. `testes/grade.test.js` confere
que as metas da migração são as do app. **Faltam** a grade do 2º ao 5º ano (mesmo processo de fichas) e os anos finais; enquanto isso, quem termina o nível 35 fica
nele (como já acontece no último nível).

## 2º ano (grade, fichas, geradores e ligação ao app prontos; falta aplicar a migração)

Grade com 41 níveis em `GRADE-2ANO.md`; as 41 fichas (`fichas/2ano-niveis-*.md`) foram revisadas bloco por bloco, com as decisões do professor registradas em cada arquivo.
Os geradores estão em `grade2.js` (testes em `testes/grade2.test.js`, com folhas reais de 8 contas do nível e 2 de revisão).

**Ligação ao app (14/11/2026):** a trilha é uma só. Os níveis do 2º ano seguem os 35 do 1º e o aluno vê a numeração corrida, **36 a 76** (os números 1 a 41 das fichas
são internos). `FC.LEVELS` ganha os 41 níveis no fim de `grade2.js`, com blocos, dicas, lembretes de abertura (níveis 64, 65 e 68: as mãos, as direções do quadriculado e o zero da régua)
e as habilidades da BNCC (`hab`), que aparecem na tela dos pais junto do ano do conteúdo. A migração `migracoes/2026-11-14-grade-2ano.sql` **só acrescenta** 41 linhas em `levels`
(idx 35 a 75, ano 2), sem tocar em alunos nem em níveis existentes; as funções de avanço já leem a tabela, então o último nível passa a ser o 76. Testada numa transação desfeita
(76 níveis, meta do nível 76 = 130 s, 5 carimbos pelo padrão). `testes/grade.test.js` confere as metas contra as duas migrações.

## 3º ano (grade, fichas, geradores e ligação ao app prontos; falta aplicar a migração)

Grade com 42 níveis em `GRADE-3ANO.md`; as 42 fichas (`fichas/3ano-niveis-*.md`) foram revisadas bloco por bloco, com as decisões do professor registradas em cada arquivo.
Os geradores estão em `grade3.js` (testes em `testes/grade3.test.js`, com folhas reais de 8 contas do nível e 2 de revisão). Ajustes pedidos pelo professor durante a revisão:
o nível 25 (repartir) só usa figura até 30 objetos, em fileiras de 5, e o nível 27 (resto) só usa divisor de 2 a 5.

**Ligação ao app (15/11/2026):** a trilha é uma só. Os níveis do 3º ano seguem os 76 dos dois primeiros anos e o aluno vê a numeração corrida, **77 a 118** (os números 1 a 42 das fichas são internos).
`FC.LEVELS` ganha os 42 níveis no fim de `grade3.js`, com blocos, dicas, lembretes de abertura (extenso, resto, planificações e congruência) e as habilidades da BNCC.
A migração `migracoes/2026-11-15-grade-3ano.sql` **só acrescenta** 42 linhas em `levels` (idx 76 a 117, ano 3), sem tocar em alunos nem em níveis existentes; as funções de avanço já leem a tabela,
então o último nível passa a ser o 118. Testada numa transação desfeita (118 níveis, 42 do 3º ano, meta do nível 118 = 160 s, 5 carimbos pelo padrão).
`testes/grade.test.js` confere as metas contra as três migrações.

## 4º ano (grade, geradores e ligação ao app prontos; falta aplicar a migração)

Grade final com **46 níveis** em `GRADE-4ANO.md`, em 9 blocos (números até 99 999, adição e subtração, multiplicação, divisão, igualdades e problemas, frações e decimais,
ângulos, sólidos e simetria, medidas e dinheiro, acaso e dados). Os geradores estão em `grade4.js` (testes em `testes/grade4.test.js`, com a resposta de cada conta recalculada).

**Por que 46 e não 40 (decisão do professor, 15/11/2026):** a conta pesada do 4º ano não cabe em folhas de 10 contas rápidas. Três mudanças em relação à proposta de 40 níveis:
degraus menores nos blocos de multiplicação e divisão (a multiplicação por um algarismo virou 4 níveis e a por dois algarismos, 2; a divisão ganhou degraus por quantidade de algarismos),
teto de tamanho nas contas (multiplicação até 3 algarismos × 1, e 4 algarismos × 2 a 5; divisão com dividendo de até 4 algarismos e divisor de 2 a 5; resposta sempre até 99 999) e metas
de tempo maiores só nos níveis pesados (150 a 180 s). Todas as folhas continuam com 10 contas (8 do nível e 2 de revisão); o aluno estima antes de calcular no nível 8.

**Decisões das cinco perguntas da proposta (adotadas as sugestões):** extenso até 99 999 só no nível 1; a conta não é "armada" na tela (a dica sugere o papel); frações só unitárias
(1/2, 1/3, 1/4, 1/5, 1/10), com figura e reta, e décimos e centésimos no quadro de 100, sem somar nem multiplicar; divisão por dois algarismos sempre exata (divisor de 10 a 30); temperatura de 0 a 45 °C, só de 5 em 5 no termômetro, sem negativos.
A resposta digitada é sempre inteira, então os decimais viram "quantos décimos", "quantos centésimos" e "quantos centavos" (a escolha de opções mostra o decimal escrito, como 0,23 e R$ 3,50).

**Peças novas** (`exercicios.js`): figura de fração (barra e círculo), quadro de 100, ângulo, termômetro, reta de 0 a 1 dividida em partes e malha com eixo de simetria. A caixa de resposta ficou um pouco mais larga (6 algarismos).

**Ligação ao app:** a trilha é uma só. Os níveis do 4º ano seguem os 118 dos três primeiros anos e o aluno vê a numeração corrida, **119 a 164** (os números 1 a 46 das fichas são internos).
`FC.LEVELS` ganha os 46 níveis no fim de `grade4.js`, com blocos, dicas, lembretes de abertura (extenso, resto, frações, décimos, sólidos, ângulos e simetria) e as 26 habilidades da BNCC
(`habilidades.js` ganhou os textos das habilidades do 4º ano para a tela dos pais). Ficam de fora EF04MA24 e EF04MA28 (atividades de casa ou de sala). A migração
`migracoes/2026-11-15-grade-4ano.sql` **só acrescenta** 46 linhas em `levels` (idx 118 a 163, ano 4), sem tocar em alunos nem em níveis existentes; as funções de avanço já leem a tabela,
então o último nível passa a ser o 164. Testada numa transação desfeita (164 níveis, 46 do 4º ano, meta do nível 164 = 160 s, 5 carimbos pelo padrão). `testes/grade.test.js` confere as metas contra as quatro migrações.
O cadastro com "4º ano" já começa no nível 119 (`primeiroNivelDoAno(4)`).

## Pontos em aberto

- Os valores iniciais da tabela de regras (95/80, 98/60, 2 saltos por semana) são palpites a calibrar com alunos reais.
- Revisão do inventário pelo professor (grupos A, B e C).
- Metas de tempo dos 150 níveis novos (estimativa inicial, ajuste com dados).

## Nível inicial pelo ano escolar (15/11/2026)

Decisão do professor: o cadastro dos pais **não pede mais o nível**. Os pais escolhem só o ano escolar (obrigatório, e só os anos que a grade já tem) e a criança começa no **primeiro nível desse ano**; se dominar o conteúdo, avança mais rápido pelos dias de ouro e saltos. O campo "Nível em que ele está" ficou numa seção recolhida **"Avançado"**: no cadastro vem em "Início do ano escolhido (recomendado)"; na edição mostra o nível atual, e mudar zera os carimbos, como antes. Sem migração: o banco continua recebendo `level_idx`. Ajudantes em `core.js`: `FC.primeiroNivelDoAno(ano)` e `FC.anosComGrade()`; testes em `testes/nivelinicial.test.js`.
O teste de nivelamento (decisão 9) deixa de ser necessário na entrada e fica como opcional para depois.

## Dias livres e cadastro enxuto (15/11/2026)

Decisão do professor: os dias da semana passam a ter **três tipos**. **Dia de estudo** (padrão segunda a sexta): cota de folhas e sequência de perseverança, como antes. **Dia livre** (padrão sábado e domingo): a criança pode jogar, com a **mesma cota** do dia de estudo, mas não precisa; faltar não perde a sequência nem conta como "dia sem carimbo". **Descanso**: o resto, sem jogo.
No dia livre, o carimbo, o salto (conta nos 2 por semana) e os pacotinhos funcionam normalmente: fechar a cota dá o pacotinho do dia fechado e o do carimbo, mas **não soma na sequência nem paga marco**.
Banco: coluna `students.free_days` (padrão `{0,6}`; um dia de estudo nunca é livre) e as funções `student_open_sheet`, `student_me`, `student_submit_sheet` e `create_student` (parâmetro `p_free`), em `migracoes/2026-11-15-dias-livres.sql` (**aplicada no banco em 15/11/2026**, conferida antes num ensaio com transação desfeita; `student_me` e `student_submit_sheet` partem das funções que estavam no banco, com os carimbos por nível).
Tela dos pais: a tela normal ficou com **nome, ano escolar, uma linha-resumo do padrão (com "Mudar") e os álbuns, em lista compacta**. Foram para a seção recolhida **"Avançado"**: nível inicial, limite de avanço, data de início, folhas por dia, dias de estudo e dias livres. A caixa de regras ficou recolhida em "Ver como o aluno avança".
Testes: `testes/dialivre.test.js` (tipo do dia e sequência); a migração foi conferida num PostgreSQL local com folhas reais (dia livre, dia de estudo, descanso, criação e regra de sobreposição).

## Pacote de boas-vindas (15/11/2026)

Decisão do professor: na **primeira vez que a criança entra** no jogo (não no cadastro pelos pais), ela ganha um **pacote de boas-vindas com 10 figurinhas**.
- Todas do **mesmo álbum** (a criança escolhe uma vez, se tiver dois), **sem repetidas** e com **pelo menos 1 rara** (a primeira sorteada é rara; as outras seguem a raridade normal, 5% ultra e 25% rara, e caem para comum se faltar figurinha da raridade). Na média saem cerca de 3 raras e 0,4 ultra por pacote.
- Tela: "Bem-vindo, NOME!", escolha do álbum, abertura das 10 em sequência (com a animação e o confete de cada raridade) e resumo no fim. Se a criança fechar antes de abrir, o pacote continua esperando.
- Banco: `students.welcome_at` (nulo = ainda não recebeu; quem já existe fica como "já recebeu"), `awards.source` aceita `boas_vindas`, função `student_welcome(token, álbum)` (só funciona uma vez) e `student_me` devolve `welcome_pending`. Migração: `migracoes/2026-11-15-pacote-boas-vindas.sql` (**ainda não aplicada**).
- Painel dos pais: "N no pacote de boas-vindas" na lista de pacotinhos ganhos.

## Álbuns liberados, mesa e gaveta (15/11/2026)

Decisão do professor: os pais **liberam** os álbuns no cadastro (grade de capas, **quantos quiserem, no mínimo 1**; busca e filtro por categoria acima de 10 álbuns); a criança mantém alguns **na mesa** (padrão 2, parâmetro `limite_mesa` editável no /adm) e os outros **na gaveta**. Só os álbuns da mesa aparecem na escolha do pacotinho. A criança troca mesa e gaveta quando quiser (não no meio da abertura de um pacotinho); os pais só liberam e retiram.
- **Cadastro:** botão **Detalhes** em cada álbum mostra a descrição, o que aparece nas cartas e uma amostra fixa de 6 cartas **comuns** (nunca raras nem o álbum inteiro: o cadastro é feito no celular do pai).
- **Depois de cadastrado:** a tela dos pais mostra só a capa e as figurinhas **já conquistadas** (antes mostrava as 52 apagadas, e a criança podia ver as que ainda não ganhou).
- **Primeiro acesso** (decisão final do professor): com até `limite_mesa` álbuns liberados, todos vão para a mesa sem a criança escolher; com mais, ela **primeiro escolhe a mesa** e **só depois** aparece o aviso do pacote de boas-vindas e a abertura. O pacote traz **5 figurinhas de cada álbum da mesa** (10 do álbum, se for um só), sem repetidas e com pelo menos 1 rara por álbum (substitui as 10 de um álbum só do pacote anterior). Mesa e pacote numa única chamada ao banco (`student_welcome(token, mesa)`), sem estado intermediário.
- **Álbum completo:** sai sozinho da mesa para "Completos" (a vaga fica livre e a criança é avisada). Álbum retirado pelos pais fica guardado e escondido; volta se for liberado de novo. Trocas valem para qualquer álbum liberado dos dois.
- **Aviso "todos os álbuns completos":** gravado uma vez em `students.albums_done_at`, ligado/desligado pelo banco (ao abrir pacote, boas-vindas, troca aceita e ao mudar os liberados); aparece no painel do aluno (botão "Liberar mais álbuns"), numa etiqueta na lista de alunos e na tela da criança. Some quando os pais liberam um álbum que ela ainda não completou. E-mail e push ficam para depois (a coluna já serve de gatilho).
- **Banco:** tabela `albums` (álbum novo = 1 `insert` + capa, pacote, figurinhas e categoria em `FC.CATS`), colunas `students.desk_themes` e `albums_done_at`, gatilho `students_albums_rules` (valida mínimo 1 e só álbuns do registro; mantém a mesa), `_check_albums`, `student_set_desk`; `student_open_pack` só abre álbum da mesa; `student_me`, `create_student`, `student_trade_answer` e `admin_set_settings` ajustadas. Migração `migracoes/2026-11-15-mesa-gaveta.sql` (**ainda não aplicada**; ensaiada com 31 verificações numa transação desfeita, a partir das definições vivas).
- Correção junto: no painel do aluno (adult.js) o laço do aviso de limite usava a variável `q`, que escondia a função `q()` e quebrava a página; passou a `qi`.
- Testes: `testes/albuns.test.js`.
- **Tela do programa enxuta (15/11/2026):** no cadastro e na edição, os álbuns não aparecem em grade no formulário: só um resumo (capas pequenas, nomes e contagem) e o botão **Ver álbuns**, que abre a tela com a grade de capas, "marcar todos", busca/filtro e **Detalhes**. A escolha só vale ao tocar em **Pronto** (mínimo 1 álbum); **Cancelar** descarta. Cache `folhinha-v39`.
- **QR Code do aluno (15/11/2026):** no cartão do aluno, logo abaixo do botão que abre o link em outra aba, há um botão com o desenho de um QR Code; ao tocar, abre uma janela com o QR Code do link do aluno (e o link para copiar). Biblioteca `vendor/qrcode.js` (qrcode-generator 1.4.4, licença MIT), guardada no cache do app. Teste: `testes/qrcode.test.js`. Cache `folhinha-v40`.
- **Compartilhar o QR Code (15/11/2026):** a janela do QR Code tem o botão **Compartilhar**, que abre as ferramentas do celular (WhatsApp, e-mail, redes sociais...) com o texto "Link da Folhinha VIP de NOME: link" e a figura do QR Code (PNG) quando o aparelho aceita arquivos. Onde o navegador não tem compartilhamento nativo (computador), aparecem os botões WhatsApp e E-mail. Cache `folhinha-v41`.
- **Fundo das cartas (15/11/2026):** em vez de uma cor lisa, cada carta tem um **cenário** que muda com o tipo da figurinha (`FC.sceneOf` em stickers.js; desenhos em CSS, classes `sc-NOME`): dinossauros por período (deserto, floresta com folhas discretas nos cantos, pôr do sol), gatos e cachorros (patinhas), animais ameaçados por bioma (floresta, savana, oceano, lagoa, gelo), espaço (estrela, sistema, nebulosa) e bandeiras por continente. O nome vai numa placa branca (legível em qualquer cenário, claro ou escuro) e o verso usa o mesmo cenário bem clarinho. Molduras por raridade: anel duplo azul-prata (rara) e dourado (ultrarrara), mais o brilho animado de antes. Álbum novo: acrescentar o ramo dele em `sceneOf` e as classes no CSS. Teste: `testes/cenarios.test.js`. Cache `folhinha-v43`.


## Vídeos por nível (preparação) e dados de uso (15/11/2026)

Decisão do professor: deixar o banco **preparado** para micro vídeos por nível (explicação do que é preciso saber e reforço quando o aluno erra), sem vídeo nenhum por enquanto e **sem mudar a tela do aluno**; e guardar **todos os dados de uso** para melhorar o sistema (tempo por conta e por folha, taxa de acerto, qual conta errou e acertou).
- **Vídeos:** tabela `level_videos` (chave `levels.code`, vários por nível, `tipo` `explicacao` ou `reforco` e outros, `topico` opcional, `publico` aluno ou adulto, `fonte` storage, youtube ou url, miniatura, duração, legenda em texto, `ordem`, `ativo` começando como rascunho), balde público `videos` no Storage (escrita só do administrador) e a função `student_level_videos(token, nível, tipo)`. Ainda não há tela; cadastro pelo banco por enquanto (aba "Vídeos" no /adm fica para depois).
- **Dados de uso:** `sheet_log` (uma linha por folha), `sheet_items` (uma linha por conta: a conta, a resposta certa, a primeira resposta, **todas as tentativas**, se acertou de primeira, tentativas e tempo) e `usage_events` (abrir o app, trocar de aba, folha iniciada ou abandonada, pacotinho, mesa, boas-vindas, sair; os vídeos futuros entram aqui como eventos `video_*`). Gatilho em `sheets` copia ao fechar a folha. O app envia eventos em lotes (`student_log_events`, no máximo 50) com versão, tamanho de tela e tipo de aparelho, sem IP.
- **Autorização e privacidade:** só se grava com `students.consent_at` (o cadastro pede a autorização do responsável, desmarcada por padrão e obrigatória para cadastrar; a edição mostra a data e permite retirar). As tabelas de uso não têm nome, só `anon_id`; ao **apagar o aluno** os dados ficam anonimizados (`student_id` vira nulo, `anon_id` continua ligando as linhas do mesmo aluno). Só o administrador lê (RLS). Combinado: confirmar com especialista jurídico (LGPD, dados de crianças) antes de abrir para muitas famílias.
- **Análise:** visões `v_uso_nivel` (folhas, alunos, acerto de primeira, tempo médio), `v_uso_conta` (por conta: vezes, acerto, tempo, tentativas) e `v_uso_video`. Aba "Dados de uso" no /adm e exportar CSV ficam para uma etapa futura. Sem limite de tempo de guarda por enquanto (acompanhar o tamanho: plano gratuito de 500 MB).
- Migração `migracoes/2026-11-15-videos-e-dados-de-uso.sql` (**ainda não aplicada**; ensaiada numa transação desfeita com 27 verificações, a partir das definições vivas). `create_student` ganha `p_consent` (a versão antiga é removida; app antigo continua funcionando, sem autorização, logo sem registro). `FC.VERSAO` (core.js) = nome do cache em sw.js (`folhinha-v44`). Testes: `testes/dados.test.js`.

## Navegação pelo histórico (15/11/2026)

Decisão do professor: cada tela, dos pais e da criança, passa a ter um endereço próprio, para o botão voltar (do celular ou do navegador) voltar à tela anterior em vez de sair do app.
- **Formato:** endereço depois do `#`, sem mexer no servidor nem nos links: criança `?aluno=CÓDIGO#/inicio` (também `#/album`, `#/trocas`, `#/amigos`, `#/progresso`, `#/folha`, `#/resultado`); pais `#/` (lista), `#/novo`, `#/cadastrado`, `#/aluno/ID/ABA`; administração `#/`, `#/contas`, `#/parametros`, `#/exercicios`. Só endereços `#/...` são do app: o `#access_token` da recuperação de senha do Supabase não é tocado.
- **Regras:** abas entram no histórico (voltar leva à aba anterior); **janelas** (QR Code, Detalhes, Ver álbuns, escolha de pacotinho...) entram no histórico e o voltar **fecha a janela**; os botões "voltar" do próprio app (Todos os alunos, Voltar, Sair da folha, ir ao início) usam o histórico em vez de empilhar telas; entrar, PIN e sair não ficam no histórico.
- **Folha em andamento:** voltar sem nada digitado sai direto; com resposta digitada pergunta "Sair da folha?" (as respostas não entregues não ficam guardadas). O resultado troca a entrada da folha: voltar do resultado leva ao início, não à folha entregue.
- **Recarregar** reabre a mesma tela (pais e administração colocam a lista embaixo, para o voltar não sair do app); `#/folha` e `#/resultado` caem na tela inicial.
- Implementação: `FC.nav` em core.js (at, up, seed, reset, janelas, fila de voltas pendentes) e as rotas de cada área. Testes: `testes/navegacao.test.js` (histórico falso) e conferência em 360 px nas três áreas. Sem mudança no banco. Cache `folhinha-v45`.

## Pausa na folha (15/11/2026)

Decisão do professor: a criança pode fazer uma **pausa** durante a folha (banheiro, água, ou algo que demore). **O limite é a quantidade de pausas por folha, não o tempo**: pausa pode durar o quanto for preciso.
- **Botão "Pausa"** ao lado do relógio (mostra quantas restam) e **pausa automática** quando a criança sai do app ou bloqueia o celular (ao voltar, ela vê a tela de pausa e toca em "Continuar a folha"). Na pausa as **contas ficam escondidas** e o **relógio para** (tempo da folha e tempo de cada conta), sem limite de duração. O tempo enviado (`p_secs`) é o tempo líquido, no máximo 14000 s.
- **Limite:** parâmetro `pausas_max` (padrão **2 pausas por folha**, editável no /adm, de 0 a 10; 0 desliga e esconde o botão). Acabaram as pausas: o botão avisa e a pausa automática deixa de acontecer. **Pausa de menos de 10 s** (tela apagando, toque sem querer) é devolvida e não gasta uma pausa. Reabrir a folha do rascunho não gasta pausa.
- **Rascunho no aparelho** (`fc_draft_CÓDIGO`): respostas, tentativas, relógio e pausas; sair da folha ou fechar o app guarda tudo e, ao reabrir a mesma folha (o banco devolve as mesmas contas), ela volta de onde parou, abrindo na tela de pausa. Apagado ao entregar. "Voltar" com resposta digitada oferece **Fazer uma pausa**, **Sair da folha** (o rascunho fica) ou **Continuar a folha**.
- **Dados de uso:** eventos `folha_pausa` (origem manual, auto ou retorno) e `folha_retomada` (duração da pausa e se foi devolvida).
- Migração `migracoes/2026-11-15-pausa-na-folha.sql` (**ainda não aplicada**; ensaiada numa transação desfeita): parâmetro `pausas_max` e `student_me` devolvendo `pausas_max`. Sem a migração o app usa 2 pausas. Testes: `testes/pausa.test.js`. Cache `folhinha-v46`.

## Conta em branco e barra de bolinhas na folha (15/11/2026)

Problema (relato do professor): a criança esqueceu uma conta e, ao entregar, não achou qual era. Antes, conta em branco era tratada como **errada** (vermelha, "Faltam N para corrigir") e gastava a primeira tentativa, sujando a taxa de acerto de primeira.
- **Barra de bolinhas fixa no topo da folha:** uma bolinha numerada por conta; verde = respondida, vazia = ainda sem resposta, amarela = falta responder, vermelha = precisa corrigir; tocar leva à conta. Uma linha de ~57 px (bolinhas de 26 px em 360 px e 22 px em 320 px, com área de toque de 42 px de altura).
- **Ao entregar com conta em branco:** não vale como tentativa, o relógio não para e a rodada não fecha; as contas em branco ficam em amarelo com "Falta responder" (ou "Falta corrigir", se já tinha errado), a mensagem diz o número ("Falta a conta 5" / "Faltam as contas 5 e 9"), a tela rola e o foco vai para a primeira. O vermelho fica só para conta errada. Evento `folha_conta_em_branco` nos dados de uso.
- Sem mudança no banco. Testes: `testes/folha-em-branco.test.js`. Cache `folhinha-v47`.

## Folhas respondidas e dificuldades, na tela dos pais (15/11/2026)

Pedido do professor: como adulto, ver detalhes das folhas respondidas e, nas folhas com erro, **quais contas ele errou** e **em quais assuntos pode estar com dificuldade**. Sem dica pedagógica por enquanto (pode entrar depois, com as frases escritas pelo professor).
- **Histórico:** a lista de folhas ganha a coluna "Contas erradas" (até 5 contas na linha, com o que ele respondeu e a resposta certa; mais que isso, "ver na folha") e o filtro **"Mostrar só as folhas com erro"**. O botão Ver continua abrindo a folha inteira.
- **Aba "Atenção"** (`#/aluno/ID/dificuldades`): por **assunto (nível do app)**, em semáforo pelo acerto de primeira: **Dificuldade** (errou 40% ou mais), **Atenção** (20% a 40%), **Tranquilo** (abaixo de 20%); só entra assunto com pelo menos 5 contas; "poucos dados" fica recolhido. Cada cartão mostra erros de primeira, folhas, tempo médio contra o esperado (**devagar** se passar de 1,5 vez), o padrão ("a 1 de distância da certa"), as contas que mais errou e as habilidades da BNCC do nível (com o texto oficial ao tocar). Seção recolhida "Por habilidade da BNCC" (cada conta conta em todas as habilidades do nível; números aproximados). Período: 7 dias, 30 dias (padrão) ou tudo.
- **Dados:** vem das folhas já guardadas (`problems` e `answers`, últimas 150), então **funciona com as folhas antigas** e **não muda o banco**. Arquivos novos: `analise.js` (análise, com testes) e `habilidades.js` (68 habilidades usadas nos níveis, gerado de `bncc/habilidades-anos-iniciais.json`; o resumo é o começo do texto oficial). Limites do semáforo em `FC.ANALISE`.
- Testes: `testes/dificuldades.test.js`. Cache `folhinha-v48`.

## Folha com uma conta por vez (15/11/2026)

Decisão do professor: medir o tempo de cada conta de forma mais confiável mostrando **uma conta por vez**, com as bolinhas no topo (caminho A).
- **Modo "uma"** (parâmetro `modo_folha` do /adm: **1 = uma conta por vez**, padrão; 0 = todas as contas na tela, como antes). Só a conta atual aparece; **Próxima** (ou Enter) e **Anterior**; as bolinhas levam a qualquer conta (a atual fica destacada); depois da última vem a tela **"Pronto para entregar?"** com as contas sem resposta e botões "Ir para a conta N". Nas correções só passam as contas erradas, uma por vez.
- **Tempo:** o tempo da conta é o tempo em que ela está **na tela** (para na pausa, com o app escondido e ao sair dela; soma as visitas). Também guarda o **tempo até começar a escrever** (primeira visita, só primeira rodada). O relógio do cabeçalho continua o total da folha; o tempo enviado (`p_secs`) é a **soma das contas**. O tempo continua valendo para carimbo, dia de ouro e salto: as metas por nível só serão recalibradas depois de comparar os dois modos com dados reais.
- **Pausa, rascunho, voltar e conta em branco** continuam; o rascunho guarda a conta atual e o modo. Correção junto: folha em que ainda não se escreveu nada não deixa rascunho (antes, sair e voltar abria uma tela de retorno à toa).
- **Banco:** `app_settings.modo_folha`, `sheet_log.modo`, `sheet_items.modo` e `sheet_items.ms_inicio` (copiados das respostas pelo gatilho `sheets_to_log`) e a visão `v_uso_modo` (acerto e tempos por nível e por modo). Migração `migracoes/2026-11-15-folha-uma-por-vez.sql` (**ainda não aplicada**; ensaiada numa transação desfeita). Sem a migração o app já usa uma conta por vez, mas o modo e o tempo até escrever não vão para o banco. Testes: `testes/folha-uma-por-vez.test.js`. Cache `folhinha-v49`.

## Padrão de 5 folhas por dia (16/11/2026)

Pedido do professor: o cadastro de um aluno novo já vem com **5 folhas por dia** (antes, 3). O mínimo continua 3 e os pais mudam em "Avançado". Vale só para alunos novos:
nenhum aluno existente muda e não há migração (o app já enviava o valor escolhido). Com 5 folhas são 50 contas por dia (40 do nível e 10 de revisão) e, no caminho normal de 1 carimbo por dia, 250 contas por nível.
