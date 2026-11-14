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

- **30 níveis por ano** (1º ao 5º = 150 níveis; anos finais depois, com a mesma conta). O aluno regular termina o ano em ~30 semanas e sobram ~10 de folga; o aluno forte (ouro todo dia) consome o ano e o teto +1 em ~36 semanas. O ritmo se ajusta pelos parâmetros do `/adm`, não pela quantidade de níveis. Um nível não é uma habilidade: uma habilidade vira de 1 a 3 níveis.
- **No teto,** em vez de repetir o último nível, o aluno recebe folhas de **revisão e de desafio**.
- **Revisão:** cerca de **20% de cada folha** vem de níveis anteriores (a tabuada já tem revisão espaçada).
- **Carimbos por nível** viram campo ajustável no `/adm` (padrão 5), para níveis mais difíceis ou mais fáceis.
- **Teto +2:** quando o aluno estiver perto de bater o teto +1, a tela do responsável mostra a **sugestão de liberar +2**, e o responsável decide (campo `teto_anos` do aluno).
- **Etapa 4 em duas partes:**
  - **4a. Mecanismos:** carimbos por nível, revisão de 20%, folha de revisão/desafio no teto, sugestão de +2 na tela do responsável.
  - **4b. Grade:** os 30 níveis do 1º ano a partir do inventário, ligando cada nível a códigos EF01MA e aos geradores; o professor revisa antes de entrar no app. Depois, 2º ao 5º. A classificação A/B/C do 1º ano é proposta junto com a grade.
- **Lembretes levantados na conversa:** revisão dos níveis saltados (ficaram sem carimbos); meta de tempo inicial estimada para os 150 níveis, ajustada com dados reais; banco de questões escrito à mão para conteúdos que não têm gerador (problemas de texto); aviso de "retomada" depois de um mês parado; teste de nivelamento para aluno novo.

## Pontos em aberto

- Os valores iniciais da tabela de regras (95/80, 98/60, 2 saltos por semana) são palpites a calibrar com alunos reais.
- Revisão do inventário pelo professor (grupos A, B e C).
- Metas de tempo dos 150 níveis novos (estimativa inicial, ajuste com dados).
