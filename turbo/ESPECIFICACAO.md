# Trilha Turbo: especificação do motor (rascunho v1)

Estado: **decisões do professor registradas (17/11/2026), motor escrito e testado, ainda não ligado ao app**. O motor está em `turbo.js` e os testes em `testes/turbo.test.js` (`node testes/turbo.test.js`). Faltam banco, telas e painel (item 12). A página de apresentação com dados de exemplo é o artefato "Trilha Turbo" (claude.ai).

A Trilha Turbo é uma trilha **separada** da trilha BNCC. A criança faz as duas no mesmo dia, em qualquer ordem, e cada uma fica marcada como concluída quando a meta do dia dela é cumprida. A Turbo não mexe em carimbos, nível nem sequência de dias da trilha BNCC. **Ao concluir a sessão do dia, a criança ganha 1 figurinha** (item 6.1).

**Objetivo:** que a criança resolva contas de aritmética básica (+, −, ×, ÷) rapidamente ao olhar, isto é, por recuperação direta da memória.

Base científica completa (ciclos 1 e 2 da pesquisa, com fontes): [`docs/BASE-CIENTIFICA-TURBO.md`](../docs/BASE-CIENTIFICA-TURBO.md).

Cada parâmetro abaixo traz o **status da evidência**: *validado*, *heurística* (proposta coerente com a pesquisa, sem estudo específico em fatos aritméticos infantis) ou *a testar* (experimento no app).

## 1. O que é um fato

Um fato é uma conta de um dígito com identificação estável, por exemplo `+:3:7`, `−:10:4`, `×:6:7`, `÷:42:6`.

- Soma e multiplicação: pares com a ordem trocada (3 + 7 e 7 + 3) contam como **um fato só**. A comutatividade é ensinada como regra e as duas ordens aparecem juntas no mapa.
- Subtração e divisão são fatos próprios, tratados como inversos de um fato de soma ou multiplicação.
- Catálogo da v1: soma 66 fatos, subtração 121, multiplicação 66, divisão 110. Total 363.

## 2. Famílias e ordem

Cada operação é uma sequência de **famílias** de 1 a 33 fatos, da mais fácil à mais difícil. A família é a unidade de ensino da estratégia.

| Operação | Famílias, em ordem |
|---|---|
| Soma | somar zero, +1 e +2, dobros, +10, faz 10, +9, quase-dobros, os demais |
| Subtração | tirar 0, 1 ou 2, desfaz o dobro, tirar 10, desfaz o faz 10, tirar 9, os demais |
| Multiplicação | ×0 e ×1, ×2, ×10, ×5, ×4, ×3, ×9, ×6, ×7, ×8 (cada uma é a tabuada do número, só com os fatos que as anteriores ainda não cobriram) |
| Divisão | ÷1, ÷2, ÷10, ÷5, ÷4, ÷3, ÷9, ÷6, ÷7, ÷8 |

Status: a ordem é *heurística*, montada a partir das estratégias listadas pela pesquisa (dobros, faz 10, +10 −1, ×5 via ×10, ×9 via ×10 −1, ×4 como dobro do dobro, inversas). As dicas de ×3, ×6, ×7 e ×8 são sugestão, sem evidência específica.

## 3. Portões entre operações

| Operação | Abre quando |
|---|---|
| Soma | sempre aberta |
| Subtração | Soma com **85%** dos fatos em recuperação provável ou maduro |
| Multiplicação | Soma com 85% firme |
| Divisão | Multiplicação com 85% firme |

Status: *heurística*. O 85% é proposta e deve ser editável.

## 4. Estados de um fato

| Estado | Dica | Sai quando |
|---|---|---|
| Na fila | não apresentado | entra num bloco novo |
| Novo | visual, antes da primeira tentativa | 1ª recuperação válida |
| Aprendendo | visual, antes da tentativa | 3 recuperações corretas |
| Consolidando | só sob demanda ou depois de 5 a 8 s | critério de domínio (abaixo) |
| Recuperação provável | nenhuma | revisões em 3, 7, 14 e 30 dias |
| Maduro | nenhuma | revisão a cada 2 a 4 semanas |

**Critério de domínio** (de consolidando para recuperação provável): resposta correta, **sem contar nos dedos nem estratégia visível**, com o tempo até o primeiro toque dentro da meta, em **duas sessões seguidas**, com acerto de 80% ou mais nas últimas tentativas do fato.

**Rebaixamento:** um erro em recuperação provável ou maduro volta o fato um estado, sem zerar. Erro de um fato em consolidando mantém o estado e agenda reapresentação na mesma sessão. Fato que erra de novo depois de chegar a consolidando é marcado como **teimoso**.

Regras de detalhe que o motor aplica:

- **Aprendendo para consolidando:** 3 recuperações corretas **em pelo menos 2 dias diferentes**. Três acertos na mesma sessão não bastam.
- **Duas sessões boas seguidas:** uma sessão sem erro, mas lenta, com dica antes da tentativa ou contando nos dedos, **zera a sequência**. Sessão em aparelho novo não conta nem zera.
- **Revisão lenta ou com apoio de um fato provável:** não avança o calendário e o fato volta a ser conferido no dia seguinte.
- **Calendário de revisões de um fato provável:** 1, 3, 7, 14 e 30 dias. Passando a de 30 dias, vira maduro (revisão a cada 21 dias). Um erro em maduro volta a provável com revisão em 7 dias ou mais.
- **Teimoso:** erra depois de já ter chegado a consolidando. Sai da marca ao voltar a provável.

Status: *heurística* (a pesquisa sustenta a lógica de acerto, latência e repetições, não os valores exatos).

## 5. Medição de tempo (sem calibração obrigatória)

Em cada tentativa o app grava:

- `t_primeiro_toque_ms`: do aparecimento da conta até o **primeiro toque** na resposta. É a medida usada nas regras de domínio.
- `t_total_ms`: da conta até a confirmação da resposta.
- `t_digitacao_ms`: diferença entre os dois, gravada só como informação.
- `classe_aparelho`: toque pequeno (celular), toque grande (tablet), teclado físico.
- `acertou`, `respostas` (todas as digitadas), `dica` (fase em que a dica apareceu, se apareceu), `sessao`, `origem` (`pratica` ou `nivelamento`).

Motivo: o tempo até o primeiro toque é essencialmente o de perceber, pensar e recuperar. O tempo de digitar vem depois, e a diferença entre aparelhos no primeiro toque é pequena perto da meta. O app atual já grava algo parecido (`ms` e `ms_inicio` em `sheet_items`).

Ressalvas a verificar com dados reais:

1. Em respostas de dois dígitos a criança pode digitar o primeiro dígito e pausar. Registrar o intervalo entre toques.
2. Um toque errado no começo distorce a conta. Guardar o primeiro toque e o toque que valeu.
3. Comparar o tempo até o primeiro toque do mesmo fato em classes de aparelho diferentes. Se houver diferença sistemática, aplicar ajuste automático (item 5.3).

Status: *a testar*.

### 5.1 Meta de tempo

- **Valor inicial:** 2,0 s até o primeiro toque para 6 a 8 anos; 1,5 s para 9 a 11 anos. Vem do limiar prático dos materiais comerciais (≤ 2 s e ≤ 1,5 s), que não é padrão experimental.
- **Meta individual:** depois de cerca de 10 fatos maduros, `1,5 × piso + 0,3 s`, em que o **piso** é a mediana do tempo até o primeiro toque dos fatos mais fáceis e mais firmes da própria criança naquela classe de aparelho. O resultado fica entre 1,0 s e 3,0 s.
- O piso é medido **passivamente**, sem teste.

Status: *heurística*, a calibrar com as primeiras crianças.

### 5.2 Aparelho novo não bloqueia nem promove

Uma sessão numa classe de aparelho com menos de 5 sessões da criança:

- erros contam normalmente e podem rebaixar fatos;
- **não promove** fatos por causa do tempo (os fatos continuam acumulando acertos);
- fica registrada com a classe do aparelho;
- não aparece para a criança como teste. Um aquecimento de cerca de 6 toques ("toque o número que aparece") pode aparecer e é pulável.

O estado de cada fato fica no servidor, preso à criança, então um link aberto em outro aparelho retoma de onde parou.

### 5.3 Ajuste automático entre aparelhos

Depois de pelo menos 30 pares de tentativas no mesmo fato firme em duas classes, se a diferença mediana for de 0,25 s ou mais e consistente, o app aplica o ajuste àquela classe. Valores iniciais *heurística*.

## 6. Sessão do dia

Composição, nesta ordem:

1. **Revisões vencidas** dos fatos já no agendador.
2. **Bloco novo** de 3 a 4 fatos de uma família, sem repetir números dentro do bloco e sem fatos de tabuadas vizinhas na mesma sessão (por exemplo, nunca 6×7, 7×7 e 8×7 juntos). Exceções: se todos os fatos da família têm o mesmo número (somar zero, ×0), o bloco completa o mínimo de 3 mesmo assim; se a família tem menos de 3 fatos novos (faz 10), completa com a seguinte. Cada fato novo aparece 3 vezes na sessão. **Fila de aprendizagem cheia:** com 8 ou mais fatos em novo ou aprendendo, não entra bloco novo.
3. **Reapresentação** dos erros ao fim da sessão.

Limites: **5 minutos** e **40 tentativas**, o que vier primeiro. O dia da Turbo conta como concluído quando as revisões vencidas e o bloco novo do dia foram feitos, ou ao atingir o teto.

Política de resposta e erro:

- A criança produz a resposta **antes** de ver o gabarito (prática de recuperação).
- Em erro: mostra a resposta por 1 a 2 s, pede nova tentativa na hora e reinsere o fato no fim da sessão. Não reinicia o fato do zero.
- Fato teimoso: cover-copy-compare, com dica curta **depois** da tentativa.
- Estratégia: dica visual **antes** da tentativa só na primeira exposição; depois, dica após erro; depois, sob demanda; depois, nenhuma. Pedir dica em fato maduro é sinal de que ele ainda não está maduro.
- Cronômetro **invisível** no início; depois "seu melhor tempo"; nunca ranking nem prova cronometrada de alto risco.

Status: *validado* para prática de recuperação e feedback imediato; *heurística* para tetos, tamanho de bloco e fading da dica.

### 6.1 Recompensa: o Turbo do dia

Decisão do professor (17/11/2026): **concluir a sessão do dia dá uma figurinha.**

Como o app já entrega figurinha a cada abertura que a criança faz, o Turbo do dia dá **1 figurinha** com origem nova, `turbo`:

- **No máximo 1 por dia.** O índice único `awards_pack_once` (aluno, dia, origem, posição) já garante isso.
- **Vale pela sessão concluída, não pela nota.** Concluída quer dizer: a fila do dia acabou, ou bateu o teto de 40 tentativas ou 5 minutos. Acertar menos não tira a figurinha, para a criança não ter motivo para ter pressa.
- **Não ganha** quem parou no meio, quem não tinha nada a fazer naquele dia e quem "chutou" (8 tentativas ou mais com metade ou mais errada e respondida em menos de 0,5 s). Isso é heurística.
- **Não mexe** em carimbos, nível nem sequência de dias da trilha BNCC, e a figurinha da BNCC continua independente.
- A figurinha vem do mesmo álbum e das mesmas regras de abertura que o app já tem (`student_open_pack`).

Efeito no banco: a restrição `awards.source` agora aceita `turbo` (migração `2026-11-17-trilha-turbo.sql`, aplicada em produção em 17/11/2026).

Status: decisão do professor; o efeito da figurinha na motivação e na pressa é *a testar*.

## 7. Revisões (espaçamento)

Fato recém-dominado: revisar no dia seguinte. Depois, em 3, 7, 14 e 30 dias, antecipando se houver erro. Fato maduro: a cada 2 a 4 semanas.

Status: *heurística*. Vem de espaçamento expansivo (Rea e Modigliani, 1985; a regra de 10 a 20% do prazo de Cepeda et al., 2008, é extrapolação de adultos).

## 8. Primeira entrada

Curta (5 a 6 min), com cara de jogo, divisível em dois dias. Os pais podem pular e escolher o ponto de partida.

| Parte | Conteúdo | Quando |
|---|---|---|
| A. Aquecimento | "toque o número que aparece", cerca de 6 toques | sempre |
| B. Pré-requisitos | qual é maior (6 itens), quantidade de 1 a 4 pontos sem contar (4), "7 + 3" contando a partir do 7 (3) | só para os pequenos ou se a parte C for ruim |
| C. Sondagem de fatos | um fato "sentinela" por família, subindo e descendo na ordem das famílias; botão "não sei" sempre disponível | sempre |

- A sondagem é uma **busca binária** pela família mais alta que a criança passa (as famílias estão em ordem de dificuldade). O primeiro palpite é a 2ª família para 6 anos e a família do meio para mais velhos. Cada sentinela dá "rápido" (acertou dentro da meta), "lento" (acertou, passou da meta) ou "falhou" (errou, "não sei" ou passou de 8 s).
- Para após duas famílias seguidas falhadas, 12 itens ou quando acha o limite.
- Resultado: famílias até a mais alta que passou viram **consolidando** (a sentinela lenta, aprendendo), as de cima ficam na fila. As revisões desses fatos são espalhadas, no máximo 15 por dia, a partir do dia seguinte. Nunca se rebaixa fato que já tinha estado.
- Tempo sem pressão visível, sem nota para a criança.
- **O teste nunca declara um fato dominado.** No máximo marca "consolidando". Os fatos só viram "recuperação provável" nas sessões normais.
- O teste **não abre portão**.
- Se B falhar de forma persistente: começar com 1 a 2 fatos por sessão, com mais apoio visual, e avisar os pais de forma neutra. A triagem não é diagnóstico de discalculia.

Status: a triagem de pré-requisitos vem da revisão de McNeil, Jordan, Viegut e Ansari (2025); sentinelas por família, limite de 8 s e parada em 12 itens são *heurística*.

## 9. Dados (para a migração futura)

Tabelas novas com prefixo `turbo_`, no mesmo padrão de token e segurança que o app já usa:

- `turbo_facts`: por aluno e fato, estado, próxima revisão, mediana do tempo, recuperações válidas, marca de teimoso.
- `turbo_attempts`: uma linha por tentativa, com os campos do item 5.
- `turbo_days`: a sessão do dia, com status.

Usar o consentimento e o `anon_id` que o app já tem. Na trilha BNCC nada muda (`sheets`, carimbos, nível, sequência). A única alteração em tabela existente é a do item 6.1: `awards.source` passa a aceitar `turbo`. **Nenhuma migração é aplicada no banco sem autorização do professor.**

## 10. Experimentos que o app pode rodar

| Pergunta | Variável | Métrica | Amostra aproximada |
|---|---|---|---|
| Fatos parecidos juntos prejudicam? | similaridade dentro do bloco | acerto, tempo, erros de vizinho | 50 a 100 crianças |
| Momento da dica | antes, após erro, sob demanda | tempo sem dica, dependência | 50 a 100 por braço |
| O tempo até o primeiro toque difere entre aparelhos? | classe do aparelho | mediana por fato e criança | todas as crianças com 2 ou mais aparelhos |
| Número de recuperações até estabilidade | recuperações corretas espaçadas | retenção em 7 dias | 100 a 200 fatos por criança |
| Leitura em voz alta | "seis vezes sete" ou "seis por sete" | tempo, acerto, tipo de erro | 50 por braço |

São testes internos de produto, não substituem um ensaio controlado externo. Para alegação pública de eficácia será preciso grupo de controle ativo, pré e pós-teste e acompanhamento de retenção.

## 11. Decisões do professor (17/11/2026)

1. **Teste da primeira entrada:** roda por padrão, e os pais podem pular no cadastro. O aquecimento de 6 toques vale para todos.
2. **Parte B (pré-requisitos):** só para os pequenos (até cerca de 7 anos) ou para quem for mal na sondagem de fatos.
3. **Primeiro corte do app:** só a soma liberada. O motor já nasce com as quatro operações; as demais ficam bloqueadas (`liberadas` no estado do aluno) até os dados mostrarem que o portão funciona.
4. **Recompensa:** **1 figurinha ao concluir o Turbo do dia**, no lugar do selo próprio que eu tinha proposto. Detalhes no item 6.1.
5. **Painel dos pais, o mínimo útil:** se a Turbo de hoje foi feita; barra de fatos firmes por operação; os 3 fatos mais teimosos ou lentos; aparelhos usados; aviso neutro quando a criança passa 3 sessões sem progresso. Sem milissegundos crus, sem comparação com outras crianças, sem ranking.

## 12. Estado da implementação

| Parte | Estado |
|---|---|
| Motor (`turbo.js`): catálogo, portões, sessão, promoção e rebaixamento, regra de aparelho novo, meta de tempo, recompensa, nivelamento | feito, com testes (`testes/turbo.test.js`) |
| Ajuste automático entre aparelhos (item 5.3) | **não feito**: depende de dados reais de duas classes de aparelho |
| Ligação do motor ao app (`index.html`, `sw.js` e versão `folhinha-v60`) | feita |
| Migração SQL (`migracoes/2026-11-17-trilha-turbo.sql`): tabelas `turbo_*`, funções `student_turbo_get`, `student_turbo_save`, `adult_turbo_summary`, visão `v_turbo_uso` e origem `turbo` em `awards.source` | **aplicada em produção (`folhinha-calculo`) em 17/11/2026, com autorização do professor.** **Corrigida no mesmo dia** (item 15: `student_turbo_get` passou a volátil). Antes, validada num Postgres local de teste (`testes/banco/turbo.sh`, 39 verificações); depois, conferida no banco real com um teste desfeito. Não reaplicar |
| Telas do aluno (`turbo-aluno.js`): dois cartões na tela inicial, sessão do dia, nivelamento da primeira entrada, resultado e figurinha | **feitas e testadas no navegador** (item 13) |
| Painel dos pais (`adult.js`): resumo da Turbo na aba Resumo, linha "Turbo de hoje" na lista de alunos, opções no cadastro e na aba Programa | **feito e testado** (item 14) |

## 13. Telas do aluno: o que foram e o que ficou de fora

Arquivo `turbo-aluno.js`, ligado ao `student.js` por `FC.turboUi` (o `student.js` só ganhou o contexto, o cartão e o botão voltar).

**Tela inicial:** a trilha BNCC e a Turbo aparecem em dois cartões, lado a lado no tablet e empilhados no celular. A criança escolhe a ordem. O cartão da Turbo muda conforme o dia: convite para o nivelamento, "Turbo do dia" (revisões, fatos novos e minutos), "Continue a Turbo", "concluída" (com a figurinha), "nada para treinar hoje" e "sem Turbo hoje" em dia de descanso. Se o banco não responder, o cartão não aparece e a BNCC segue normal.

**Sessão do dia:** uma conta por vez, com o teclado numérico do PIN (e o teclado do aparelho). O tempo até o primeiro toque é medido no toque do dedo. Não há relógio na tela. Dica antes da tentativa só na primeira exposição; em erro, a resposta aparece por 1,8 s, a dica vem depois e a criança tenta de novo na hora (essa segunda tentativa não conta nas regras); "Dica" sob demanda e "Não sei". Voltar ou sair no meio pergunta antes e guarda o que foi feito. Se sair do aplicativo no meio de uma conta, o tempo daquela conta recomeça.

**Fim da sessão:** resultado, botão **Abrir figurinha** (usa o fluxo de figurinhas que já existe) e volta ao início. Se não houver conexão ao enviar, a sessão fica guardada no aparelho e sobe na próxima vez.

**Nivelamento (primeira entrada):** aquecimento de 6 números; jogos de pré-requisito (6 comparações, 4 de pontinhos, 3 de contagem) só até 7 anos, ou depois da sondagem para quem não passou nem na primeira família; sondagem de fatos por busca binária, sem mostrar acerto ou erro. Falhar nos pré-requisitos (menos de 60% de acertos) liga a carga reduzida de 1 a 2 fatos novos por sessão.

**O que ficou de fora ou é diferente do plano**

- **Os pais ainda não podem pular o nivelamento.** Falta a opção nas telas dos adultos; por enquanto ele aparece para toda criança nova (a criança pode tocar em "Agora não").
- **A dica é só texto.** Ainda não há desenho (pontinhos, dezena fechada).
- **"Contou nos dedos" não é detectado**: o app registra sempre "não contou". O critério de domínio, na prática, só usa acerto e tempo.
- **O aquecimento não é gravado** como tentativa, porque o banco só aceita tentativas ligadas a um fato. A parte de pré-requisitos também não vira tentativa: só o resumo vai no resultado do nivelamento.
- **Nivelamento cria uma linha em `turbo_days`** com 0 tentativas e estado "started". O cartão ignora essa linha.
- O tempo foi testado com navegador emulado, não com um toque real em tablet ou celular.

## 14. Painel dos pais

Em `adult.js`, sem nova aba (o menu do celular já tem 6). Decisão 5 do item 11.

- **Lista de alunos:** uma linha "Turbo de hoje: concluída / em andamento / ainda não feita".
- **Aba Resumo, painel "Trilha Turbo":** se a Turbo de hoje foi feita; para cada operação, a barra de fatos firmes (parte escura) e em treino (parte clara), com "N de total firmes"; operação travada explica por quê ("Abre quando a Soma chegar a 85%, hoje 45%" ou "Não liberada para este aluno"); até 3 **fatos teimosos** e até 3 **fatos mais demorados**, escritos como conta ("7 × 8"); aparelhos usados, com o número de sessões; e se o nivelamento foi feito, quando, ou se foi pulado. Nada de milissegundos, de comparação com outras crianças ou de ranking.
- **Aviso neutro de "sem progresso":** se nos últimos 3 dias de Turbo, com pelo menos 1 tentativa, nenhum fato ficou mais firme, e ainda há fatos em treino. O texto diz que isso acontece em algumas fases e sugere sentar com a criança. O dia do nivelamento (0 tentativas) não conta.
- **Cadastro e aba Programa, seção "Trilha Turbo: nivelamento e operações":** pular o jogo de nivelamento (trava depois de feito) e escolher quais operações a Turbo pode abrir (soma sempre liberada; as outras continuam sujeitas ao portão de 85% e estão marcadas como "em teste"). Quem não mexe fica com o padrão: nivelamento ligado, só a soma.
- Se o banco não tiver as tabelas da Turbo, nada disso aparece e o painel segue normal.

**Verificado no banco de produção** (numa transação desfeita, assumindo a identidade de um responsável cadastrado): ele lê os fatos e o resumo do próprio aluno, cria e altera a configuração, e **não** consegue alterar o nivelamento nem os fatos nem ler as tentativas. Um adulto que não é responsável não vê nenhum dado e não grava nada, e o resumo dele vem vazio.

**Ficou de fora:** não há tela para o responsável informar a idade (a Turbo calcula pela série); o aviso de "sem progresso" usa só os dias de Turbo; e o resumo não mostra o histórico dia a dia.

## 15. Correção de 17/11/2026: o cartão da Turbo não aparecia

**O que o professor viu:** na tela do Samuel, depois de publicar, o cartão "Trilha Turbo" não apareceu ao lado da BNCC. No painel dos pais, a linha "Turbo de hoje" apareceu normalmente.

**Causa:** `student_turbo_get` foi criada como `STABLE`. A API do Supabase roda função estável numa transação **só de leitura**, e a função chama `_student_from_token`, que atualiza `student_sessions.last_seen`. Pela API o resultado era o erro `25006` ("cannot execute UPDATE in a read-only transaction"). O app engolia o erro e escondia o cartão. No teste direto no SQL a transação era de escrita, e por isso o erro não apareceu. As outras funções do aluno que conferem o token já eram voláteis.

**Correção:** `migracoes/2026-11-17-turbo-get-volatil.sql` (`alter function ... volatile`), **aplicada em produção em 17/11/2026**. Conferida chamando a função pela API de verdade, com uma sessão temporária (apagada em seguida): resposta 200 com o estado do aluno.

**O que mudou para não se repetir:**

- O teste de banco (`testes/banco/`) passou a simular a atualização do `last_seen` e a exigir que `student_turbo_get` e `student_turbo_save` sejam voláteis. Com a função estável de volta, o teste falha; com a correção, passa. O script de teste também passou a falhar quando alguma verificação dá `ERROR` (antes ele só contava as que terminavam, e uma verificação com erro de sintaxe passava como sucesso).
- Se a Turbo falhar ao carregar, o cartão agora mostra "A Turbo não carregou" com **Tentar de novo**, em vez de sumir em silêncio. Só some de vez se o banco não tiver a Turbo. Com o consentimento dos pais ligado, o erro também vai para os dados de uso (`turbo_erro`).

## 16. Ajuste de 20/11/2026: revisões do nivelamento previsíveis e tempos impossíveis

**O que o professor viu:** o Samuel, que passou até a última família da soma no nivelamento, fazia só contas de 0 + e 1 +.

**Causa:** o nivelamento espalha as revisões (15 por dia) na ordem do catálogo, então vinham 0+0, 0+1, 0+2… por dias seguidos. Como a ordem era previsível, o tempo até o primeiro toque saía de 0 a 70 ms (mediana de 317 ms), impossível para recuperação de memória, e contaminava o critério de domínio.

**Mudanças (`turbo.js`):**

- **Espalhamento do nivelamento:** as famílias que a criança passou devagar vêm primeiro, depois as mais difíceis; dentro de cada família a ordem é embaralhada.
- **Sessão:** as revisões escolhidas são apresentadas em ordem embaralhada (quais entram continua pela prioridade de antes).
- **`T1_MIN` = 250 ms:** tempo até o primeiro toque abaixo disso não vale. Um acerto só com tempos assim **não conta como sessão boa, não zera a sequência e não promove**; o fato volta a ser conferido no dia seguinte. O tempo não entra na latência do fato. O log de tentativas guarda o tempo cru, para análise.

**Dados do Samuel não foram alterados:** os vencimentos já gravados continuam como estão; só a ordem de apresentação e a validade do tempo mudam daqui para frente.
