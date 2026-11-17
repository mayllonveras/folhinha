# Trilha Turbo: especificação do motor (rascunho v1)

Estado: **decisões do professor registradas (17/11/2026), motor escrito e testado, ainda não ligado ao app**. O motor está em `turbo.js` e os testes em `testes/turbo.test.js` (`node testes/turbo.test.js`). Faltam banco, telas e painel (item 12). A página de apresentação com dados de exemplo é o artefato "Trilha Turbo" (claude.ai).

A Trilha Turbo é uma trilha **separada** da trilha BNCC. A criança faz as duas no mesmo dia, em qualquer ordem, e cada uma fica marcada como concluída quando a meta do dia dela é cumprida. A Turbo não mexe em carimbos, nível nem sequência de dias da trilha BNCC. **Ao concluir a sessão do dia, a criança ganha 1 pacotinho de figurinha** (item 6.1).

**Objetivo:** que a criança resolva contas de aritmética básica (+, −, ×, ÷) rapidamente ao olhar, isto é, por recuperação direta da memória.

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

Como o app já entrega figurinha por "pacotinho" que a criança abre, o Turbo do dia dá **1 pacotinho** com origem nova, `turbo`:

- **No máximo 1 por dia.** O índice único `awards_pack_once` (aluno, dia, origem, posição) já garante isso.
- **Vale pela sessão concluída, não pela nota.** Concluída quer dizer: a fila do dia acabou, ou bateu o teto de 40 tentativas ou 5 minutos. Acertar menos não tira o pacotinho, para a criança não ter motivo para ter pressa.
- **Não ganha** quem parou no meio, quem não tinha nada a fazer naquele dia e quem "chutou" (8 tentativas ou mais com metade ou mais errada e respondida em menos de 0,5 s). Isso é heurística.
- **Não mexe** em carimbos, nível nem sequência de dias da trilha BNCC, e o pacotinho da BNCC continua independente.
- A figurinha vem do mesmo álbum e das mesmas regras de abertura que o app já tem (`student_open_pack`).

Efeito no banco: a restrição `awards.source` (hoje `carimbo`, `perseveranca`, `marco`) precisa aceitar `turbo`. Isso entra na migração, que não é aplicada sem autorização do professor.

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
4. **Recompensa:** **1 figurinha (pacotinho) ao concluir o Turbo do dia**, no lugar do selo próprio que eu tinha proposto. Detalhes no item 6.1.
5. **Painel dos pais, o mínimo útil:** se a Turbo de hoje foi feita; barra de fatos firmes por operação; os 3 fatos mais teimosos ou lentos; aparelhos usados; aviso neutro quando a criança passa 3 sessões sem progresso. Sem milissegundos crus, sem comparação com outras crianças, sem ranking.

## 12. Estado da implementação

| Parte | Estado |
|---|---|
| Motor (`turbo.js`): catálogo, portões, sessão, promoção e rebaixamento, regra de aparelho novo, meta de tempo, recompensa, nivelamento | feito, com testes (`testes/turbo.test.js`) |
| Ajuste automático entre aparelhos (item 5.3) | **não feito**: depende de dados reais de duas classes de aparelho |
| Ligação do motor ao `index.html` e ao `sw.js` | não feita; o app não carrega o `turbo.js` ainda |
| Migração SQL (`migracoes/2026-11-17-trilha-turbo.sql`): tabelas `turbo_*`, funções `student_turbo_get`, `student_turbo_save`, `adult_turbo_summary`, visão `v_turbo_uso` e origem `turbo` em `awards.source` | **escrita e validada num Postgres local de teste** (`testes/banco/turbo.sh`, 39 verificações). **Não aplicada no Supabase**: só com autorização do professor |
| Telas do aluno (dois cartões, sessão, nivelamento, pacotinho) | não feitas |
| Painel dos pais | não feito |
