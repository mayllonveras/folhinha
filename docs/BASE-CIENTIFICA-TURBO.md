# Base científica da Trilha Turbo

Relatório de pesquisa bibliográfica (ciclos 1 e 2) que fundamenta a Trilha Turbo. Guardado aqui para consulta em qualquer sessão. Texto original, sem edição de conteúdo; só foram retirados os logotipos da ferramenta de pesquisa.

**Como usar:** os parâmetros da especificação (`turbo/ESPECIFICACAO.md`) trazem o status *validado*, *heurística* ou *a testar*. Este documento é a origem desses status. Onde o relatório diz "heurística, sem estudo", não há evidência específica em fatos aritméticos infantis e a decisão é de produto ou de teste próprio no app.

**Pontos-chave:**
- Evidência forte: prática de recuperação, feedback imediato, espaçamento, treino estruturado de fatos.
- Sem estudo: nº exato de repetições por fato, limiar de latência (≤ 2 s / ≤ 1,5 s é heurística), sequência ótima, intervalos exatos de revisão, streaks e gamificação.
- Kumon: sem estudo elegível no WWC (até 2009); só referência de formato.
- Cronômetro: risco de ansiedade sob pressão; começar invisível, depois só meta pessoal.

---


# CONTEXTO

Estou desenhando a "Trilha Turbo", um módulo de treino de FLUÊNCIA/AUTOMATIZAÇÃO de aritmética básica (+, −, ×, ÷ com fatos de um dígito, estendendo depois a dezenas). O objetivo é que a criança resolva a conta RAPIDAMENTE AO OLHAR, ou seja, por recuperação direta da memória, sem contar, sem estratégia consciente e com baixa latência. O público é criança do ensino fundamental (confirmarei a faixa etária; trate 6–11 anos como padrão e sinalize quando o achado só vale para uma faixa). A entrega é em app e/ou folhas impressas, em sessões curtas e diárias.

O QUE JÁ SEI (não repita; só confirme, refute ou refine)

- Kumon: passos muito pequenos, uma variação por folha (ex.: 10+0, 10+1, 10+2...), repetição diária até acerto total dentro de um tempo-alvo. Não sei a ordem exata das folhas nem o critério oficial de domínio.
- Revisão de McNeil, Jordan, Viegut e Ansari (2025), resumida pelo EdWeek: sessões de 2–10 min, várias vezes por semana; 3–4 fatos novos por vez até a recuperação ser automática; ensinar estratégia explícita antes de cobrar o fato; prática cronometrada só depois de a criança acertar com confiança e nunca como prova de alto risco.
- Espaçamento: Rea \& Modigliani (1985) mostram vantagem de intervalos crescentes na tabuada; Cepeda et al. (2008) sugerem intervalo ideal de cerca de 10–20% do prazo de retenção desejado. Quero verificar ambos nas fontes primárias.
- Não achei estudo que defina "N repetições com tal espaçamento" para fatos aritméticos.

PERGUNTAS DE PESQUISA (responda cada uma separadamente)

1. TRANSIÇÃO CÁLCULO → RECUPERAÇÃO. Como se dá a passagem de estratégias de contagem/decomposição para recuperação direta da memória (Siegler, Ashcraft, Campbell, Geary, Lemaire, Logan: "instance theory")? Quantas exposições ou que sinais comportamentais (latência, taxa de erro, autorrelato de estratégia) indicam que um fato foi automatizado? Existe um critério de domínio com respaldo (tempo de resposta em ms ou s por fato, acerto, número de sessões)?
2. "AO OLHAR". Há evidência sobre reconhecimento visual imediato de contas ou padrões (efeito de tamanho do problema, efeito de empate, confusão entre tabuadas vizinhas, interferência)? Isso inclui efeitos de formato (horizontal vs. vertical), de fonte e de organização visual na velocidade de recuperação.
3. SEQUÊNCIA E RAMPA DE DIFICULDADE. Qual ordem de introdução tem melhor respaldo: por família (+0,+1,+2; ×2,×5,×10...), por dificuldade empírica (efeito de tamanho), pelos fatos "âncora" (dobros, +10, faz-10) ou em blocos mistos (interleaving)? Compare a prática em bloco (massed) com a intercalada em fatos aritméticos. Qual a carga ideal de fatos novos por sessão?
4. ESPAÇAMENTO E DOSAGEM. Quais intervalos de revisão, expansivos ou fixos, têm evidência específica em fatos aritméticos ou em material semelhante (pares associados) em crianças? Quantas recuperações bem-sucedidas por fato são necessárias para retenção de longo prazo? Qual a duração e a frequência ideais das sessões? Compare modelos adaptativos (ACT-R, Leitner, Mnemosyne/SM-2, "half-life regression") em termos de evidência em educação.
5. PRÁTICA DE RECUPERAÇÃO E FEEDBACK. Qual a vantagem de testar versus reestudar (testing effect) para fatos? O feedback deve ser imediato, com a resposta correta mostrada após o erro? Como tratar erros: voltar o fato ao início do ciclo, reapresentar na mesma sessão (errorless learning, "cover-copy-compare")?
6. CRONÔMETRO E MOTIVAÇÃO. Efeito de tempo-alvo, limites por conta e prática cronometrada na velocidade, na ansiedade matemática e na motivação. Há risco de ansiedade? Como graduar a pressão? Há evidência sobre gamificação, metas de velocidade pessoais (superar o próprio tempo) e contagem de streaks?
7. OPERAÇÕES INVERSAS E TRANSFERÊNCIA. Subtração e divisão se apoiam nos fatos de soma e multiplicação (famílias de fatos)? Treinar o inverso junto ou depois? O ganho de fluência transfere para cálculo multi-dígito, resolução de problemas e desempenho escolar? Quais os limites e as críticas (ex.: Kumon, "drill and kill", estudos de Boaler)?
8. PRÉ-REQUISITOS E DIAGNÓSTICO. Que habilidades (cardinalidade, subitizing, comparação de magnitude, counting-on) devem estar presentes antes de iniciar a trilha? Quais testes rápidos de triagem existem (ex.: Number Sense Screener, CBM de fatos)? Como tratar crianças com dificuldades (discalculia, memória de trabalho baixa)?
9. DIFERENÇAS INDIVIDUAIS. Idade, nível inicial, memória de trabalho e velocidade de processamento alteram os parâmetros acima? A trilha deve se adaptar em tempo real ao desempenho de cada criança, e que métricas coletar (acerto, latência, hesitações, tipo de erro)?
10. INTERVENÇÕES COM DADOS. Quais programas ou ensaios (Rocket Math, Reflex, Fluency Zone da Innovamat, Kumon, ensaios do tipo "Math Facts" em SCD/RCT) reportam tamanhos de efeito, e em que condições? Separe o que é ensaio controlado do que é material de fornecedor.

FORMATO DA RESPOSTA

- Para cada pergunta, entregue: (a) conclusão em 2–3 linhas; (b) lista de achados com autor, ano, revista, amostra (n, idade), desenho (RCT, quase-experimental, caso único, revisão/meta-análise) e tamanho do efeito quando disponível; (c) grau de confiança (alto/médio/baixo) justificado; (d) implicação PRÁTICA para a trilha, como regra operacional (ex.: "critério de domínio = acertar em ≤ X s em 2 sessões seguidas").
- Ao final, uma tabela de parâmetros recomendados: tamanho do bloco de fatos novos, duração da sessão, frequência semanal, critério de domínio, intervalos de revisão, política de erro, uso de cronômetro, e para cada um o grau de evidência e as fontes.
- Separe com clareza: evidência EM FATOS ARITMÉTICOS EM CRIANÇAS vs. evidência EXTRAPOLADA de outras áreas (memória, vocabulário, adultos). Não misture.
- Aponte divergências entre estudos e lacunas, ou seja, onde NÃO existe evidência e teremos de decidir por julgamento ou por teste próprio.

REGRAS DE QUALIDADE

- Priorize meta-análises, revisões sistemáticas e estudos experimentais revisados por pares; evite blogs e material de fornecedor como prova de eficácia (cite apenas como contexto, rotulado).
- Cite cada afirmação com fonte verificável (DOI ou link). Se não conseguir abrir a fonte primária, diga explicitamente e não reconstrua números de memória.
- Nunca invente valores, intervalos ou tamanhos de efeito. Quando só houver estimativa de bom senso, rotule como "heurística, sem estudo".
- Responda em português do Brasil, mantendo os termos técnicos em inglês entre parênteses na primeira ocorrência.

Abaixo está uma síntese orientada a decisão de produto. A evidência é forte para **prática de recuperação distribuída, feedback e treino estruturado de fatos**, mas é **fraca ou inexistente** para vários parâmetros específicos que a Trilha Turbo exige — sobretudo número exato de exposições, limiar universal de latência e sequência ótima de introdução. Onde não há estudo, eu rotulo como heurística e proponho um critério interno testável.

**Nota de escopo:** a maior parte das evidências citadas envolve crianças do ensino fundamental, mas muitas amostras são pequenas, clínicas ou de caso único; estudos de espaçamento e intercalação frequentemente usam adolescentes/adultos ou conteúdo mais complexo que fatos isolados. Não encontrei, nas fontes acessadas, uma meta-análise que estabeleça “N recuperações bem-sucedidas por fato” para aritmética básica.

______________________________________________________________________

## 1. Transição cálculo → recuperação

**(a) Conclusão.** A criança começa usando contagem, dedos ou decomposição e, com prática repetida e bem-sucedida, passa a recuperar associações problema–resposta da memória de longo prazo. A transição é gradual e depende de frequência de exposição, sucesso na recuperação e interferência entre fatos parecidos; não existe um número universal de repetições que garanta automatização.

**(b) Achados.**

- Siegler (1989) propõe que a escolha de estratégia depende de associações memória–resposta formadas por uso de estratégias de apoio, frequência de apresentação e conexões entre operações; fatos maiores tendem a ser mais difíceis, enquanto empates (por exemplo, 6 × 6) e problemas com 5 como multiplicando tendem a ser relativamente mais fáceis.[^1_1]
- Em crianças, o efeito de tamanho do problema (*problem-size effect*) reflete diferenças na seleção de estratégia, eficiência de recuperação e eficiência procedural, semelhantemente ao padrão observado em adultos.[^1_2]
- A revisão de McNeil, Jordan, Viegut e Ansari (2025), em *Psychological Science in the Public Interest*, posiciona a prática de recuperação (*retrieval practice*) e a prática distribuída (*spaced practice*) como mecanismos centrais para desenvolver automaticidade, recomendando prática curta e cronometrada após a construção inicial das bases.[^1_3]
- A metanálise de Codding, Burns e Lukito (2011), em *Learning Disabilities Research \& Practice*, reuniu 17 estudos de caso único com 55 participantes; “drill and practice” com modelagem produziu os maiores efeitos, e intervenções com mais de três componentes tenderam a superar as de menos componentes.[^1_4][^1_5]
- A metanálise de 2026 sobre intervenções de fluência em alunos com dificuldades matemáticas sintetizou 35 estudos grupais e 178 tamanhos de efeito, encontrando efeito médio *g* = 0,76 (IC 95%: 0,46–1,06). Isso sustenta a eficácia global de intervenções de fatos, mas não fixa um número de repetições por fato.[^1_6][^1_7]

**(c) Confiança: alta** para a existência da transição e para a eficácia média de treino estruturado; **baixa** para qualquer limiar universal de exposições ou tempo por fato.

**(d) Implicação prática.** Não prometa “após X repetições o fato fica automático”. Use um critério individual: um fato é considerado em recuperação quando a criança responde corretamente sem estratégia visível e dentro de uma janela de latência definida pelo app — como heurística inicial, ≤ 2 s para 6–8 anos e ≤ 1,5 s para 9–11 anos — em duas sessões consecutivas. Isso é **heurística de produto, não critério validado**; valide com dados próprios. A referência de 30–40 problemas por minuto, ou até 1 s de atraso, aparece em materiais práticos, mas não é um padrão experimental robusto o suficiente para ser tratado como lei.[^1_8]

**Sinais comportamentais úteis:** latência mediana decrescente; respostas corretas consecutivas; ausência de contagem nos dedos/labialização; autorrelato “já sei”; menor proporção de erros de tabela vizinha. Autorrelato deve ser coletado de forma lúdica e não como única medida.

______________________________________________________________________

## 2. “Ao olhar”: reconhecimento visual e formato

**(a) Conclusão.** “Ao olhar” não é um mecanismo visual separado: é recuperação rápida a partir de uma representação visual muito familiar do problema. O formato e a organização visual podem reduzir custo perceptual, mas a evidência específica sobre fonte, horizontal versus vertical e layout em fatos aritméticos infantis é limitada.

**(b) Achados.**

- O efeito de tamanho do problema é robusto: problemas maiores produzem respostas mais lentas e menos precisas; isso é consistente com maior dificuldade de recuperação e maior interferência na memória aritmética.[^1_9][^1_2]
- Empates — como 6 × 6 — e problemas com 5 como multiplicando são mais fáceis do que seu tamanho numérico preveria, provavelmente por maior frequência de apresentação e conexões numéricas.[^1_1]
- Erros de “quase acerto” e confusões com fatos relacionados, por exemplo 4 × 3 = 7, são previstos pela teoria de associações e conexões entre operações.[^1_1]
- Não encontrei, nas fontes acessadas, um experimento revisado por pares que isole fonte tipográfica, cor, horizontal versus vertical e espaçamento visual especificamente para latência de fatos aritméticos em crianças de 6–11 anos.

**(c) Confiança: alta** para efeito de tamanho, empates e interferência entre fatos; **baixa** para escolhas finas de tipografia, cor e orientação.

**(d) Implicação prática.** Padronize o estímulo desde o início: mesma fonte legível, alto contraste, um problema por vez, orientação horizontal consistente e espaço visual limpo. Depois de estabilizar o formato, não mude aleatoriamente a apresentação durante a fase de automatização. Teste A/B interno apenas para legibilidade e latência; não assuma que uma fonte “mais bonita” acelera a recuperação.

______________________________________________________________________

## 3. Sequência e rampa de dificuldade

**(a) Conclusão.** A melhor rampa parece combinar famílias estratégicas — dobros, +0/+1/+2, faz-10, ×2/×5/×10 — com exposição gradual dos fatos mais difíceis, seguida de mistura controlada. Prática totalmente em bloco facilita o desempenho imediato, mas a intercalação tende a favorecer retenção e discriminação; não há evidência suficiente para declarar uma sequência única ótima para fatos aritméticos em 6–11 anos.

**(b) Achados.**

- A estrutura empírica de dificuldade favorece começar por fatos pequenos, empates e famílias com 5; fatos maiores e vizinhos de tabuada têm maior risco de interferência.[^1_2][^1_9][^1_1]
- Rohrer e colegas, em estudo com crianças praticando quatro tipos de problemas matemáticos, encontraram que a prática intercalada piorou o desempenho durante a sessão, mas dobrou a pontuação em teste no dia seguinte; a amostra e o conteúdo não são fatos aritméticos isolados.[^1_10]
- Em álgebra, um estudo do WWC comparou prática intercalada e em bloco em 63 estudantes e encontrou vantagem da intercalação na avaliação de grafagem após 30 dias.[^1_11]
- Um ensaio randomizado de um ano em 62 salas na Nigéria encontrou ganho de 0,29 DP para intercalação em retenção de curto prazo, mas não encontrou efeito médio em avaliação cumulativa de retenção anual.[^1_12]
- A metanálise de Codding et al. (2011) indica que treino com modelagem e múltiplos componentes tende a produzir maiores efeitos, mas não estabelece uma ordem universal de fatos.[^1_5][^1_4]

**(c) Confiança: média** para começar por famílias estratégicas e dificuldade empírica; **média** para introduzir mistura após consolidação inicial; **baixa** para uma sequência única “ótima”.

**(d) Implicação prática.** Estruture em três camadas:

1. **Ensino/âncora:** apresente 3–4 fatos novos ligados a uma família ou estratégia, por exemplo dobros, +10, ×2, ×5, ×10.
2. **Consolidação em bloco curto:** nas primeiras apresentações, repita os novos fatos em pequenos blocos para reduzir carga inicial.
3. **Mistura progressiva:** após acerto confiável, intercale os novos fatos com 3–6 fatos já dominados, aumentando gradualmente a proporção de itens misturados.

Para a carga nova, **3–4 fatos por sessão** é uma recomendação coerente com a síntese que você já possui e com a lógica de reduzir interferência; não encontrei um ensaio que valide precisamente “3–4” para todas as idades. Trate como ponto de partida adaptativo, não como constante.

______________________________________________________________________

## 4. Espaçamento e dosagem

**(a) Conclusão.** A prática distribuída supera a prática massificada para retenção, e intervalos que crescem conforme o fato é dominado são a escolha mais defensável. Porém, os intervalos exatos — por exemplo, 1, 3, 7, 14 dias — são extrapolados principalmente de memória e vocabulário; não há uma tabela validada específica para fatos aritméticos em crianças.

**(b) Achados.**

- Rea e Modigliani demonstraram o efeito de espaçamento em crianças de 4 a 9 anos; o estudo é frequentemente citado como evidência de que espaçamento melhora a recordação de material recém-ensinado, incluindo fatos matemáticos.[^1_13][^1_14]
- Cepeda et al. (2008) estudaram aprendizes adultos em uma tarefa de pares associados e sugerem que o intervalo ótimo depende do intervalo até o teste de retenção; a regra aproximada de 10–20% do prazo de retenção desejado é uma generalização dessa linha de trabalho, não uma lei para aritmética infantil.[^1_14]
- A revisão de McNeil et al. (2025) destaca prática distribuída e recuperação como componentes centrais da fluência aritmética.[^1_3]
- A metanálise de 2026 com alunos com dificuldades matemáticas identifica prática distribuída como parte das abordagens eficazes, mas não reporta um intervalo universal.[^1_7][^1_6]
- A metanálise de tecnologia para prática de fatos encontrou efeito moderado geral, *g* = 0,43; contra “business as usual”, *g* = 0,54; e *g* = 0,25 quando comparada a prática não tecnológica. A dose total — sessões × semanas — previu efeito, mas nenhuma variável isolada o previu.[^1_15]

**(c) Confiança: alta** para espaçamento superar massificação; **média** para intervalos expansivos; **baixa** para valores exatos de intervalo, número de recuperações e duração ótima.

**(d) Implicação prática.** Use um agendador adaptativo, mas simples:

- Fato novo: reapresentar na mesma sessão após erro ou hesitação.
- Fato recém-dominado: revisar no dia seguinte.
- Depois: revisar aproximadamente em 3, 7, 14 e 30 dias, com antecipação se houver erro.
- Fato maduro: revisar a cada 2–4 semanas, ajustando pela latência e erro.

Esses intervalos são **heurística de produto**, coerentes com espaçamento expansivo, mas não derivam de um ensaio específico em fatos aritméticos. Para retenção em 30 dias, a regra de 10–20% sugeriria intervalos iniciais de cerca de 3–6 dias; para retenção em 90 dias, cerca de 9–18 dias. Isso é uma extrapolação de Cepeda et al., não uma prescrição validada para crianças.[^1_14]

**Sessões:** 5–10 minutos diários ou quase diários são compatíveis com a recomendação de sessões curtas e frequentes; não há evidência que determine 5 em vez de 7 minutos.[^1_3]

**Modelos adaptativos:** ACT-R, Leitner, SM-2/Mnemosyne e *half-life regression* são arquiteturas plausíveis, mas não encontrei evidência comparativa robusta mostrando que um deles produz melhores resultados educacionais em fatos aritméticos infantis. Para a Trilha Turbo, um modelo híbrido é defensável: Leitner/SM-2 para agendar revisão + regra de latência e erro para rebaixar o fato. Isso é decisão de engenharia, não achado experimental.

______________________________________________________________________

## 5. Prática de recuperação e feedback

**(a) Conclusão.** Testar a criança — pedir que ela recupere a resposta — é mais eficaz do que apenas reapresentar a resposta. O feedback deve ser imediato, especialmente após erro, e erros devem gerar nova oportunidade de recuperação, não apenas exposição passiva ao gabarito.

**(b) Achados.**

- Em multiplicação, um estudo publicado em *Applied Cognitive Psychology* em 2023 comparou prática de recuperação e reestudo; a recuperação produziu aumento maior e mais duradouro na fluência de recuperação dos fatos.[^1_16]
- A revisão de McNeil et al. (2025) destaca explicitamente a prática de recuperação como estratégia central para automaticidade.[^1_3]
- A metanálise de Codding et al. (2011) encontrou que treino com modelagem e prática estruturada teve os maiores efeitos entre os componentes analisados.[^1_4][^1_5]
- A metanálise de 2026 identifica *cover-copy-compare* (CCC), programas computacionais e *incremental rehearsal* entre intervenções eficazes para alunos com dificuldades matemáticas.[^1_6][^1_7]
- O *incremental rehearsal* pareia itens desconhecidos com um conjunto crescente de itens conhecidos; é uma abordagem coerente para reduzir sobrecarga, mas sua superioridade sobre outras formas de prática não está estabelecida para todos os perfis.[^1_17]

**(c) Confiança: alta** para prática de recuperação; **alta** para feedback imediato em tarefas de recuperação; **média** para CCC e *incremental rehearsal* como métodos específicos.

**(d) Implicação prática.** Regra operacional:

- Mostre o problema; espere a resposta; só então revele o gabarito.
- Em erro, mostre a resposta correta por 1–2 segundos, peça uma repetição imediata da recuperação e reinsira o fato no fim da sessão.
- Não reinicie o fato “do zero” após um único erro; isso pode desperdiçar progresso. Rebaixe o item um nível no agendador e aumente a frequência de revisão.
- Para fatos persistentemente errados, use *cover-copy-compare*: a criança vê o fato, cobre, escreve/diz a resposta e compara; é útil principalmente para consolidar associação e reduzir erro, não para substituir recuperação sem apoio.
- Evite “errorless learning” contínuo depois que a criança já consegue produzir a resposta: ela precisa praticar a recuperação, não apenas reconhecer a resposta.

______________________________________________________________________

## 6. Cronômetro e motivação

**(a) Conclusão.** Tempo-alvo pode ajudar a desenvolver fluência, mas pressão excessiva pode reduzir desempenho e elevar ansiedade, sobretudo em crianças já ansiosas. O desenho mais seguro é cronômetro como feedback privado e meta pessoal, nunca como ranking, punição ou prova de alto risco.

**(b) Achados.**

- A revisão de McNeil et al. (2025) recomenda sessões curtas cronometradas depois que as bases estão estabelecidas, em torno de 6–7 anos.[^1_3]
- Um estudo com participantes submetidos a condição cronometrada e não cronometrada encontrou pior desempenho na condição cronometrada, especialmente quando ela precedia a condição sem tempo.[^1_18]
- Em crianças, pressão de tempo aumentou ansiedade de estado em leitura e matemática; crianças com maior ansiedade basal mostraram menor ajuste situacional.[^1_19]
- Uma revisão sobre estresse, pressão de tempo e ansiedade concluiu que crianças com ansiedade média ou alta tendem a piorar sob pressão, mas a heterogeneidade dos estudos impede concluir que o efeito é diferente por nível de ansiedade.[^1_20]
- A associação entre ansiedade matemática e desempenho é negativa em meta-análise, embora isso não prove causalidade simples nem determine o limiar de pressão seguro.[^1_21]
- Não encontrei evidência experimental robusta, nas fontes acessadas, que valide streaks, badges ou metas de “superar o próprio tempo” especificamente para fatos aritméticos em crianças.

**(c) Confiança: média** para risco de ansiedade sob pressão; **baixa** para gamificação específica, streaks e metas pessoais de tempo.

**(d) Implicação prática.** Gradue assim:

- Fase 1 — sem cronômetro visível; meça latência em segundo plano.
- Fase 2 — cronômetro visível apenas como “seu melhor tempo”, sem comparação entre crianças.
- Fase 3 — meta individual de reduzir o próprio tempo, com folga e sem punição.
- Nunca use tempo como critério único de aprovação nem exponha ranking público.

Para 6–8 anos, prefira cronômetro invisível ou muito suave. Para 9–11 anos, permita metas de tempo pessoal somente após a criança demonstrar acerto estável sem pressão.

______________________________________________________________________

## 7. Operações inversas e transferência

**(a) Conclusão.** Subtração e divisão se beneficiam das famílias de fatos e das relações inversas com adição e multiplicação, mas não são automaticamente dominadas só porque a operação direta foi treinada. Ensine a relação explicitamente, depois pratique o inverso; a transferência para cálculo mult-dígito e resolução de problemas é plausível, porém não automática.

**(b) Achados.**

- A teoria de associações de Siegler prevê conexões entre operações e erros relacionados à operação, como confundir produto com soma; isso apoia ensinar relações entre famílias de fatos, mas não prova que treinar 3 × 4 elimine a necessidade de praticar 12 ÷ 3.[^1_1]
- A metanálise de intervenções de fluência mostra efeito positivo global, mas os desfechos são predominantemente medidas de fatos ou fluência; não estabelece que o ganho se transfira integralmente para resolução de problemas.[^1_7][^1_6]
- A metanálise de prática tecnológica encontrou efeito moderado em resultados matemáticos gerais, *g* = 0,43, mas os estudos incluídos não permitem afirmar transferência forte e uniforme para raciocínio ou resolução de problemas.[^1_15]
- O WWC concluiu que, até 2009, não havia estudos do programa Kumon dentro do escopo de matemática elementar que atendesse aos padrões de evidência; portanto, não é possível atribuir eficácia causal ao método Kumon com base nesse repositório.[^1_22]
- A crítica “drill and kill” é pertinente quando a repetição substitui compreensão, sentido numérico e estratégias; a evidência disponível apoia treino de fatos como complemento, não como currículo matemático completo.

**(c) Confiança: média** para famílias de fatos como organização; **baixa** para transferência automática ampla; **alta** para a limitação de que fluência isolada não garante compreensão.

**(d) Implicação prática.** Depois de dominar um cluster de multiplicação, introduza as divisões correspondentes em uma microlição explícita: “12 ÷ 3 pergunta: 3 vezes quanto dá 12?”. Depois pratique a divisão como recuperação. Não misture adição, subtração, multiplicação e divisão desde o primeiro dia; misture apenas fatos já consolidados e relações já ensinadas.

______________________________________________________________________

## 8. Pré-requisitos e diagnóstico

**(a) Conclusão.** Antes de cobrar recuperação rápida, a criança precisa de sentido numérico inicial: cardinalidade, comparação de magnitude, subitizing e estratégias iniciais de contagem. Uma triagem breve identifica risco, mas não substitui observação clínica ou avaliação psicopedagógica quando há sinais persistentes de dificuldade.

**(b) Achados.**

- O *Number Sense Brief* (NSB) mostrou consistência interna de pelo menos 0,80 em kindergarten e 1º ano; correlaciona-se positivamente com medidas de desempenho matemático, mas sua validade preditiva ainda não estava estabelecida em uma das fontes.[^1_23][^1_24][^1_25]
- Em outro estudo longitudinal com 204 crianças, o NSB aplicado do início do kindergarten ao meio do 1º ano previu proficiência matemática no 3º ano; as áreas sob a curva ROC ficaram entre 0,78 e 0,88.[^1_26]
- Uma revisão sistemática de instrumentos de triagem matemática inicial concluiu que, entre nove instrumentos com validade preditiva avaliada, apenas o NSS teve validade preditiva considerada aceitável.[^1_27]
- O *Number Sense Screener* (NSS) é um instrumento comercial; seu relatório técnico indica validade de construto, mas deve ser tratado como material de fornecedor para fins de decisão de compra.[^1_28]

**(c) Confiança: média** para triagem de sentido numérico; **baixa** para usar um único escore como diagnóstico de discalculia.

**(d) Implicação prática.** Antes da Trilha Turbo, aplique uma triagem de 3–5 minutos:

- Contar objetos até 10–20, conforme a idade.
- Reconhecimento rápido de pequenas quantidades, sem contar.
- Comparar “qual é maior?” entre dois números.
- Resolver 2–3 problemas simples com apoio de material concreto.
- Cronometrar discretamente 10 fatos já conhecidos, para estimar linha de base.

Se houver falha persistente em contagem, comparação, subitizing ou memória de trabalho, não comece por “decore 100 fatos”. Reduza o conjunto novo para 1–2 fatos, aumente apoio visual e considere encaminhamento para avaliação especializada. Isso é recomendação de bom senso educacional, não um protocolo validado específico para discalculia.

______________________________________________________________________

## 9. Diferenças individuais

**(a) Conclusão.** Idade, repertório inicial, memória de trabalho e velocidade de processamento devem alterar carga, tempo-limite e ritmo de revisão. A trilha deve se adaptar ao desempenho observado, mas as métricas mais defensáveis são acerto, latência, consistência entre sessões e tipo de erro — não apenas “nível” ou streak.

**(b) Achados.**

- O efeito de tamanho do problema em crianças reflete diferenças de estratégia, eficiência de recuperação e eficiência procedural; portanto, um mesmo conjunto de fatos não terá a mesma dificuldade para todas as crianças.[^1_2]
- A pressão de tempo interage com ansiedade: crianças com ansiedade média ou alta tendem a apresentar pior desempenho sob pressão.[^1_20]
- A metanálise de prática tecnológica mostrou que a dose total explicou 23% da variância do efeito, mas nem número de sessões nem número de semanas, isoladamente, previu o efeito. Isso reforça que dosagem rígida e uniforme é uma suposição frágil.[^1_15]
- Não encontrei um estudo que valide um algoritmo adaptativo específico para fatos aritméticos infantis que use latência, hesitações e tipo de erro em tempo real.

**(c) Confiança: média** para adaptar por desempenho; **baixa** para parâmetros adaptativos precisos.

**(d) Implicação prática.** Colete por fato:

- Acerto imediato: sim/não.
- Latência: tempo até primeira resposta.
- Hesitação: pausa longa, correção após resposta, uso de dedos ou contagem.
- Tipo de erro: tabela vizinha, inversão de operação, erro de dezena, resposta plausível.
- Histórico: acertos consecutivos, intervalo desde a última revisão, número de falhas.

Regras adaptativas iniciais:

- Dois erros ou latência acima da meta em uma sessão: reduzir intervalo e reapresentar com apoio.
- Cinco acertos consecutivos dentro da meta: aumentar intervalo.
- Três sessões seguidas sem progresso: reduzir carga nova e reintroduzir estratégia explícita.
- Não use “streak” como medida de domínio.

______________________________________________________________________

## 10. Intervenções com dados

**(a) Conclusão.** A evidência mais forte disponível favorece intervenções estruturadas de prática de fatos, com modelagem, prática de recuperação, feedback e distribuição temporal. Programas comerciais podem ser úteis como entrega, mas não devem ser usados como prova de eficácia sem ensaios independentes.

**(b) Achados.**


| Intervenção/evidência | Tipo de evidência | Resultado principal | Leitura para a Trilha Turbo |
| :-- | :-- | :-- | :-- |
| Metanálise de intervenções de fluência em alunos com dificuldades matemáticas, 2026 | Meta-análise de 35 estudos grupais, 178 efeitos | *g* = 0,76; IC 95%: 0,46–1,06 | Treino estruturado de fatos funciona em média, sobretudo com estratégia, CCC, software e prática distribuída. [^1_6][^1_7] |
| Codding, Burns \& Lukito, 2011 | Meta-análise de 17 estudos de caso único, 55 participantes | “Drill and practice” com modelagem teve maiores efeitos; mais de 3 componentes foi melhor | Inclua modelagem, prática, feedback e monitoramento; não aposte em drill puro. [^1_4][^1_5] |
| Burns et al., 2025 | Meta-análise de 17 efeitos em 12 estudos | Tecnologia para prática de fatos: *g* = 0,43; contra business as usual, *g* = 0,54; contra prática não tecnológica, *g* = 0,25 | O app é um veículo, não o ingrediente ativo; a qualidade da prática importa mais que a tecnologia. [^1_15] |
| Recuperação versus reestudo em multiplicação, 2023 | Estudo experimental | Recuperação superou reestudo em fluência de curto e longo prazo | Faça a criança produzir a resposta antes de revelar o gabarito. [^1_16] |
| Rohrer et al., intercalação | Experimento com crianças; conteúdo matemático mais amplo | Intercalação piorou na sessão, mas dobrou acerto no teste de 1 dia depois | Use mistura após consolidação inicial, não como primeira exposição. [^1_10] |
| Intercalação em álgebra, WWC | Estudo comparativo, 63 alunos | Intercalado superou bloqueado em grafagem após 30 dias | Evidência indireta para fatos; favorece mistura posterior. [^1_11] |
| Kumon | WWC: nenhum estudo elegível até 2009 | Sem conclusão causal de eficácia no repositório | Não use Kumon como evidência de eficácia; use como referência de formato de repetição. [^1_22] |
| Rocket Math, Reflex, Fluency Zone | Materiais de fornecedor / estudos próprios | Não tratar como evidência independente sem ensaio controlado externo | Podem inspirar mecânica, mas não definem a eficácia da Trilha Turbo. |

**(c) Confiança: alta** para a categoria geral de intervenção; **média** para componentes específicos; **baixa** para alegações de fornecedores.

**(d) Implicação prática.** Construa a Trilha Turbo como um pacote de componentes com evidência separada: ensino explícito breve, prática de recuperação, feedback imediato, espaçamento, mistura progressiva e monitoramento individual. Não venda “gamificação” ou “IA adaptativa” como mecanismo causal sem ensaio próprio.

______________________________________________________________________

## Parâmetros recomendados

| Parâmetro | Recomendação operacional | Status da evidência | Fontes |
| :-- | :-- | :-- | :-- |
| Fatos novos por sessão | 3–4 fatos novos; 1–2 para crianças com dificuldade ou alta interferência | Heurística coerente com revisões; não validada como número exato | [^1_3][^1_6] |
| Duração da sessão | 5–10 minutos, diária ou quase diária | Evidência moderada para sessões curtas e frequentes | [^1_3] |
| Frequência semanal | 4–7 sessões | Heurística; dose total importa mais que número isolado de sessões | [^1_15] |
| Primeira exposição | Ensino explícito breve + modelagem + 1–3 recuperações apoiadas | Evidência de que modelagem e componentes múltiplos ajudam | [^1_4][^1_5] |
| Consolidação inicial | Pequeno bloco do mesmo fato/família antes de misturar | Evidência indireta; intercalação precoce pode prejudicar desempenho imediato | [^1_10] |
| Mistura | Após acerto confiável, intercalar com 3–6 fatos dominados | Evidência indireta favorável à intercalação para retenção | [^1_11][^1_10] |
| Critério de domínio | Correto, sem apoio e dentro da meta de latência em 2 sessões consecutivas | Heurística de produto; não é critério validado universal | [^1_8] |
| Meta de latência inicial | ≤ 2 s para 6–8 anos; ≤ 1,5 s para 9–11 anos | Heurística; calibrar com linha de base individual | [^1_8] |
| Revisão após domínio | 1, 3, 7, 14 e 30 dias; expandir se estável | Heurística baseada em espaçamento expansivo; não validada especificamente | [^1_14][^1_3] |
| Política de erro | Feedback imediato, repetição imediata e rebaixamento de um nível; não reinício total | Evidência favorável a feedback e prática de recuperação; detalhe operacional é decisão própria | [^1_16][^1_6] |
| Cronômetro | Invisível no início; depois, meta pessoal; nunca ranking ou punição | Evidência de risco de ansiedade sob pressão | [^1_18][^1_19][^1_20] |
| Gamificação | Metas pessoais e progresso visível; sem depender de streaks | Sem evidência robusta específica | — |
| Operações inversas | Ensinar relação explicitamente e praticar o inverso depois da operação direta | Plausível e coerente; transferência não automática | [^1_1][^1_6] |
| Triagem | Sentido numérico, subitizing, comparação, contagem e linha de base de fatos | Evidência moderada para triagem de sentido numérico | [^1_27][^1_26] |


______________________________________________________________________

## Divergências e lacunas

- **Exposições necessárias:** não há número validado de repetições ou recuperações bem-sucedidas por fato aritmético. Qualquer promessa do tipo “20 repetições garantem automatização” é especulativa.
- **Limiar de tempo:** “1 segundo” e “30–40 problemas por minuto” aparecem em materiais práticos, mas não constituem um padrão experimental universal; use como referência inicial, calibrada por idade e perfil.[^1_8]
- **Sequência ótima:** não há ensaio que compare, na mesma amostra, família estratégica, dificuldade empírica, âncoras e mistura como sequências completas para 6–11 anos.
- **Intervalos de revisão:** a regra de 10–20% do prazo de retenção vem sobretudo de memória/pares associados em adultos; aplicá-la diretamente a fatos aritméticos infantis é extrapolação.[^1_14]
- **Formato visual:** a evidência não permite afirmar que uma fonte, cor ou orientação específica acelera a recuperação; trate isso como hipótese de UX a testar.
- **Gamificação:** streaks, badges e metas de velocidade têm forte apelo de produto, mas pouca evidência causal específica em fatos aritméticos infantis.
- **Kumon:** o WWC não encontrou estudos elegíveis que permitissem concluir eficácia para matemática elementar até 2009; portanto, a lógica de folhas pequenas e repetição pode inspirar o design, mas não serve como evidência de eficácia.[^1_22]

<span style="display:none">[^1_29][^1_30][^1_31][^1_32][^1_33][^1_34][^1_35][^1_36][^1_37][^1_38][^1_39][^1_40][^1_41][^1_42][^1_43]</span>

<div align="center">⁂</div>

[^1_1]: https://siegler.tc.columbia.edu/wp-content/uploads/2020/10/1989strat-choice-procedures.pdf

[^1_2]: https://link.springer.com/article/10.1007/s00426-007-0112-8

[^1_3]: https://journals.sagepub.com/doi/10.1177/15291006241287726

[^1_4]: https://journals.sagepub.com/doi/abs/10.1111/j.1540-5826.2010.00323.x

[^1_5]: https://onlinelibrary.wiley.com/doi/epdf/10.1111/j.1540-5826.2010.00323.x

[^1_6]: https://pmc.ncbi.nlm.nih.gov/articles/PMC13069136/

[^1_7]: https://sage.cnpereading.com/doi/10.1177/00222194261424914

[^1_8]: https://mrbartonmaths.com/resourcesnew/8. Research/Fluency/Mastering Math Facts Research and Results.pdf

[^1_9]: https://pmc.ncbi.nlm.nih.gov/articles/PMC9054599/

[^1_10]: https://onlinelibrary.wiley.com/doi/10.1002/acp.1598/abstract

[^1_11]: https://ies.ed.gov/ncee/WWC/Study/89950

[^1_12]: https://edworkingpapers.com/sites/default/files/ai23-876.pdf

[^1_13]: https://files.eric.ed.gov/fulltext/ED505699.pdf

[^1_14]: https://www.yorku.ca/ncepeda/publications/CCRKP2012.pdf

[^1_15]: https://journals.sagepub.com/doi/10.1177/01626434241288199?int.sj-full-text.similar-articles.2

[^1_16]: https://onlinelibrary.wiley.com/doi/10.1002/acp.4141

[^1_17]: https://www.interventioncentral.org/academic-interventions/math-facts

[^1_18]: https://pmc.ncbi.nlm.nih.gov/articles/PMC2806671/

[^1_19]: https://pmc.ncbi.nlm.nih.gov/articles/PMC13199927/

[^1_20]: https://pmc.ncbi.nlm.nih.gov/articles/PMC5585192/

[^1_21]: https://pmc.ncbi.nlm.nih.gov/articles/PMC6692457/pdf/fpsyg-10-01613.pdf

[^1_22]: https://ies.ed.gov/ncee/WWC/InterventionReport/258

[^1_23]: https://pmc.ncbi.nlm.nih.gov/articles/PMC2855153/

[^1_24]: https://pmc.ncbi.nlm.nih.gov/articles/PMC2855153/pdf/nihms-132126.pdf

[^1_25]: https://www.sciencedirect.com/science/article/abs/pii/S1041608009000533

[^1_26]: https://eric.ed.gov/?id=EJ891847

[^1_27]: https://link.springer.com/article/10.1007/s10648-024-09950-6?fromPaywallRec=true

[^1_28]: https://brookespublishing.com/wp-content/uploads/2021/06/NSS-technical-report.pdf

[^1_29]: https://link.springer.com/article/10.1007/s10648-026-10225-5

[^1_30]: https://www.preprints.org/manuscript/202510.1341

[^1_31]: https://iejee.com/index.php/IEJEE/article/view/325

[^1_32]: https://www.nber.org/system/files/working_papers/w31853/w31853.pdf

[^1_33]: https://blog.lboro.ac.uk/cmc/2024/04/09/spaced-and-interleaved-practice-what-are-they-and-what-are-their-roles-in-improving-mathematics-performance/

[^1_34]: https://openresearch.okstate.edu/server/api/core/bitstreams/bccf02f5-6fe7-441b-b8a3-6ae16f95b160/content

[^1_35]: https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-spaced-and-interleaved-mathematics-practice-rohrer-hartwig.pdf

[^1_36]: https://files.eric.ed.gov/fulltext/EJ1249794.pdf

[^1_37]: https://pmc.ncbi.nlm.nih.gov/articles/PMC4389641/pdf/nihms671085.pdf

[^1_38]: https://www.crepe.e.u-tokyo.ac.jp/results/2020/CREPEDP85.pdf

[^1_39]: https://www.nber.org/system/files/working_papers/w35671/w35671.pdf

[^1_40]: https://www.kumon.co.uk/epi-findings

[^1_41]: https://research.abo.fi/ws/files/25231203/Reliability and validity evidence of the EN-test_Hellstrand%20et%20al%202020.pdf

[^1_42]: https://www1.udel.edu/cmp2/jordan_LDRP2007.pdf

[^1_43]: https://www.academia.edu/38652123/Validity_and_Reliability_Study_for_the_Turkish_Version_of_Number_Sense_Screener_for_60_71_Months_Old_Children


---

# CONTEXTO

Estou desenhando a "Trilha Turbo", um módulo de treino de FLUÊNCIA/AUTOMATIZAÇÃO de aritmética básica (+, −, ×, ÷ com fatos de um dígito, estendendo depois a dezenas). O objetivo é que a criança resolva a conta RAPIDAMENTE AO OLHAR, por recuperação direta da memória, sem contar e com baixa latência. Público: crianças do ensino fundamental (trate 6–11 anos como padrão e sinalize quando o achado só vale para uma faixa). Entrega em app e/ou folhas impressas, em sessões curtas e diárias. Falantes de português do Brasil.

ESTE É O SEGUNDO CICLO DE PESQUISA. O primeiro já foi feito. Não repita o que está estabelecido; só aprofunde, refute ou refine quando houver evidência nova.

JÁ ESTABELECIDO NO CICLO 1 (aceite como ponto de partida)

- Prática de recuperação (a criança produz a resposta antes de ver o gabarito) com feedback imediato supera reestudo. Em erro: mostrar a resposta, pedir nova recuperação e reinserir o fato no fim da sessão, sem reiniciar do zero.
- Prática distribuída supera massificada. Intervalos crescentes são a escolha mais defensável, mas os valores exatos para fatos aritméticos infantis NÃO têm validação. Os valores 1/3/7/14/30 dias são heurística de produto, extrapolada de memória/vocabulário (Cepeda et al. 2008, adultos, pares associados).
- Sessões curtas (2–10 min) e frequentes; 3–4 fatos novos por vez; ensino explícito de estratégia antes de cobrar o fato (McNeil, Jordan, Viegut e Ansari, 2025).
- Cronômetro: invisível no início, depois só como meta pessoal; nunca ranking nem prova de alto risco; risco de ansiedade sob pressão com evidência média.
- Intercalação (mistura) só depois de consolidação inicial.
- Meta-análise 2026 de fluência em alunos com dificuldade (g = 0,76), Codding et al. (2011) e meta-análise de tecnologia de prática (Burns et al., 2025, g = 0,43).
- LACUNAS já reconhecidas: não existe número validado de repetições por fato; o limiar "≤ 2 s / ≤ 1,5 s" vem de material prático de professor, não de experimento; não existe sequência ótima validada; não há evidência sobre fonte, cor ou orientação.
- Kumon: o WWC não encontrou estudo elegível (até 2009). Use-o só como referência de formato, nunca como prova de eficácia.

PERGUNTAS DE PESQUISA DO CICLO 2 (responda cada uma separadamente)

1. MEDIDA DE AUTOMATIZAÇÃO E LATÊNCIA CONFIÁVEL.
O tempo medido no app inclui o gesto de responder (tocar, digitar, escrever, falar). Que evidência existe para separar o tempo de recuperar o fato do tempo de motor/entrada? O critério de latência muda conforme a modalidade de resposta (teclado numérico, escolha múltipla, escrita, voz)? Como calibrar uma linha de base individual (tarefa de controle, como digitar o número escrito) e descontá-la? Que medidas distinguem recuperação de cálculo rápido: latência mediana, variabilidade (desvio/CV), curva de aprendizado, autorrelato de estratégia, padrão de erros? Há critérios de domínio baseados em tempo de resposta com respaldo em crianças?
2. CURVA DE PRÁTICA E INSTANCE THEORY (Logan).
O que se sabe sobre a lei de potência do ganho de velocidade em fatos aritméticos em crianças? É possível estimar, por perfil (idade, nível inicial), quantas exposições bem-sucedidas levam à recuperação estável? Existem parâmetros publicados (expoente da curva, taxa de aprendizado) que possamos usar como ponto de partida e depois calibrar com dados do app? Comparar com modelos ACT-R de fatos aritméticos.
3. TREINO VISUAL E CÁLCULO MENTAL RÁPIDO.
Que evidência existe sobre soroban, anzan e abacus mental (e métodos de "ver e responder") em crianças: eficácia em velocidade e precisão, mecanismo (imagem visuoespacial vs. recuperação verbal), transferência para aritmética escrita, tempo de treino necessário, durabilidade após interrupção? Que elementos desses métodos poderiam ser aproveitados em um app, e quais dependem de tutor ou de instrumento físico? Separe ensaios controlados de relatos de programa.
4. EVIDÊNCIA EM PORTUGUÊS E NO BRASIL.
Há estudos de intervenção ou de desenvolvimento de fatos aritméticos com crianças brasileiras ou portuguesas (currículo, tabuada, avaliação nacional)? O idioma e a forma de ler a conta em voz alta ("seis vezes sete", "seis por sete") alteram recuperação, interferência ou erros em português? Há dados normativos de tempo e acerto para crianças brasileiras? Inclua a literatura nacional (SciELO, periódicos de psicologia e educação matemática).
5. FALHAS DE AUTOMATIZAÇÃO E INTERFERÊNCIA.
O que fazer quando a criança estaciona em fatos teimosos? Quais fatos são mais confundidos (×6/×7/×8/×9, tabuadas vizinhas, soma vs. produto: 4×3=7)? Que desenho do conjunto de itens reduz a interferência (ordem de apresentação, separação de fatos parecidos, contrastes explícitos)? Existe evidência para trabalhar fatos parecidos em conjunto ou separados? Como diagnosticar o tipo de erro (tabela vizinha, inversão de operação, erro de dezena) e como agir sobre cada tipo? Cobrir também leitura em voz alta e subvocalização.
6. ESTRATÉGIAS E DICAS.
Quais estratégias de cálculo têm evidência de melhorar a aprendizagem e depois a recuperação direta de fatos em crianças de 6–11 anos? Avaliar: faz-10 e decomposição em 10, dobros e quase-dobros, comutatividade, ×5 via ×10 (metade), ×9 via ×10 menos um grupo, ×4 como dobro do dobro, +9 como +10−1, subtração como soma inversa e divisão como multiplicação inversa. Para cada operação, qual o conjunto mínimo de estratégias a ensinar e em que ordem? Qual o momento ideal da dica (antes da tentativa, após erro, sob demanda) e que formato funciona (visual com pontos ou dezena fechada, verbal, passo a passo)? Existe evidência sobre retirada gradual (fading) da dica para que ela não vire muleta e atrapalhe a automatização? Como tratar a criança que usa estratégia própria lenta (contar nos dedos): corrigir ou guiar? A escolha adaptativa de estratégia (Siegler) sugere algo prático para um app? Separe evidência em fatos aritméticos de crianças da evidência extrapolada.

FORMATO DA RESPOSTA

- Para cada pergunta: (a) conclusão em 2–3 linhas; (b) achados com autor, ano, revista, amostra (n, idade), desenho (RCT, quase-experimental, caso único, revisão/meta-análise) e tamanho do efeito quando houver; (c) grau de confiança (alto/médio/baixo) justificado; (d) implicação PRÁTICA para a trilha, como regra operacional testável.
- Ao final, uma tabela "O que muda nos parâmetros do ciclo 1", dizendo para cada parâmetro (critério de domínio, meta de latência, número de exposições, intervalos de revisão, política de erro, uso de dica) se o ciclo 2 CONFIRMA, REFINA ou REFUTA o valor anterior, com a fonte.
- Separe com clareza: evidência EM FATOS ARITMÉTICOS EM CRIANÇAS vs. evidência EXTRAPOLADA (adultos, memória, vocabulário, outras áreas da matemática).
- Aponte divergências entre estudos e lacunas, ou seja, onde NÃO existe evidência e teremos de decidir por julgamento ou por teste próprio no app. Para cada lacuna, sugira um experimento simples de coleta de dados que o app possa rodar (variável, métrica, tamanho mínimo de amostra aproximado).

REGRAS DE QUALIDADE

- Priorize meta-análises, revisões sistemáticas e estudos experimentais revisados por pares; blogs e material de fornecedor só como contexto, rotulados.
- Cite cada afirmação com fonte verificável (DOI ou link) e use apenas fontes que você abriu. TODA fonte listada deve ser citada no texto, e toda afirmação importante deve ter fonte numerada. Não deixe referências órfãs.
- Se não conseguir abrir a fonte primária, diga explicitamente e não reconstrua números de memória. Confira faixa etária e amostra de cada estudo citado antes de resumir (por exemplo, Rea \& Modigliani, 1985).
- Nunca invente valores, intervalos ou tamanhos de efeito. Quando só houver estimativa de bom senso, rotule como "heurística, sem estudo".
- Responda em português do Brasil, mantendo os termos técnicos em inglês entre parênteses na primeira ocorrência.

Abaixo está o segundo ciclo. Ele **refina** principalmente três pontos do ciclo 1: (1) a latência deve ser corrigida pelo custo de entrada; (2) a ordem de apresentação deve reduzir similaridade entre fatos novos; (3) dicas devem ser ensinadas como estratégias de construção e retiradas gradualmente para dar lugar à recuperação. Não encontrei evidência que valide um número fixo de exposições, um limiar universal de latência ou uma sequência única de fatos.

______________________________________________________________________

## 1. Medida de automatização e latência

**(a) Conclusão.** O tempo registrado pelo app é **tempo total de resposta**, não tempo puro de recuperação: inclui percepção do estímulo, decisão, recuperação/cálculo e resposta motora. Para comparar modalidades ou calibrar metas, meça separadamente uma linha de base motora e use métricas distribucionais, não apenas a média.

**(b) Achados.**

- Em estudos de tempo de reação, o tempo total é composto por componentes sensoriais, cognitivos e motores; a separação fina exige métodos como EMG, que não são práticos em um app educacional.[^2_1]
- Estudos de multiplicação usam teclado para respostas de verificação e calculam tempo de reação a partir de respostas corretas; isso mostra que a medida usual é o tempo total até a resposta, não uma medida isolada de recuperação.[^2_2]
- Em pesquisa com ábaco mental, o tempo de reação foi calculado como média das respostas corretas, com resposta dada por teclado; novamente, a medida incorpora o ato motor.[^2_3]
- Uma avaliação digital de fluência aritmética combinou velocidade e acerto em respostas corretas por minuto (*responses per minute*, RPM), uma medida composta, não uma medida pura de latência cognitiva.[^2_4]
- A *instance theory* de Logan prevê que toda a distribuição dos tempos de reação diminui com a prática, não apenas a média; a recuperação direta corresponde a acesso em uma etapa à solução armazenada.[^2_5][^2_6]
- A formulação usual é $RT = a + bN^{-c}$, em que $RT$ é o tempo de resposta, $N$ o número de tentativas de prática, $a$ o assíntota e $c$ o expoente que descreve o formato da curva.[^2_7]

**(c) Confiança: alta** para separar conceitualmente recuperação e resposta motora; **média** para usar linha de base individual; **baixa** para limiares absolutos por modalidade em crianças de 6–11 anos.

**(d) Implicação prática.** Implemente três tempos:

- $T_{\text{total}}$: aparecimento do problema até resposta final.
- $T_{\text{entrada}}$: início do primeiro toque/tecla/voz até confirmação.
- $T_{\text{cognitivo estimado}}$: $T_{\text{total}} - T_{\text{entrada}}$, apenas como aproximação.

Calibre por criança uma tarefa de controle: “digite o número que aparece”, “toque o número indicado” ou “diga o número mostrado”. Estime $T_{\text{entrada}}$ pela mediana de 10–20 tentativas e desconte-a da latência do fato. Não compare latência bruta entre voz, teclado e escrita sem essa correção.

**Métricas recomendadas:**

- Mediana de latência correta, não média: reduz influência de respostas muito lentas.
- Variabilidade: desvio-padrão ou coeficiente de variação; queda de variabilidade é sinal mais informativo de estabilização do que média isolada.
- Curva individual: ajuste $RT = a + bN^{-c}$ por fato ou por família, mas não use o modelo para prever número exato de exposições.
- Autorrelato: após itens selecionados, pergunte “Você lembrou ou calculou?”; trate como dado complementar, não como verdade absoluta.
- Padrão de erro: classifique erro de operação, tabela vizinha, erro de dezena e resposta plausível.

**Regra operacional testável:** um fato entra em “recuperação provável” quando, após correção pelo custo de entrada, a mediana de latência fica abaixo da meta individual em duas sessões consecutivas, com pelo menos 80% de acerto e sem uso visível de contagem. A meta individual pode ser definida como, por exemplo, 1,5 vezes a linha de base motora da criança acrescida de uma margem fixa; isso é **heurística de produto**, não critério validado.

______________________________________________________________________

## 2. Curva de prática e *instance theory*

**(a) Conclusão.** A *instance theory* apoia a ideia de que a repetição bem-sucedida cria representações específicas problema–resposta e produz ganhos rápidos iniciais, seguidos de ganhos menores. Ela permite modelar a curva individual, mas não fornece uma tabela universal de “X exposições = automatização”.

**(b) Achados.**

- Logan (1988) formula a automatização como transição de algoritmo para recuperação direta de soluções específicas armazenadas na memória.[^2_5]
- Logan (1990) ilustra exatamente esse processo com fatos de adição: inicialmente a criança usa contagem; com prática, recupera a soma diretamente.[^2_8]
- Logan (1992) deduz que a distribuição inteira de tempos de reação diminui como função de potência da prática e que a distribuição assintótica de recuperação segue uma distribuição de Weibull.[^2_6]
- Um estudo publicado em *Frontiers in Psychology* em 2021 encontrou curvas de aquisição compatíveis com função de potência tanto no grupo quanto no nível individual, em uma tarefa visuomotora; não é um estudo de fatos aritméticos infantis.[^2_9]
- A formulação quantitativa prevê que os maiores ganhos ocorrem nas primeiras tentativas e diminuem progressivamente.[^2_10][^2_7]
- Não encontrei, nas fontes abertas, parâmetros publicados e replicados de expoente $c$ ou taxa de aprendizado específicos para fatos aritméticos em crianças brasileiras ou em uma faixa etária ampla de 6–11 anos.

**(c) Confiança: alta** para a forma qualitativa da curva; **baixa** para parâmetros numéricos universais.

**(d) Implicação prática.** Não use “número de exposições” como critério de avanço. Use **exposições bem-sucedidas** e **recuperações corretas espaçadas**:

- Conte apenas tentativas em que a criança produziu a resposta antes do feedback.
- Não conte exposições passivas, leitura do gabarito ou resposta imediatamente após ver a resposta.
- Para cada fato, registre: número de recuperações corretas, latência mediana corrigida, variabilidade e intervalo desde a última recuperação.
- Ajuste um modelo por criança somente após pelo menos 20–30 tentativas válidas por fato; antes disso, use regras simples de agendamento.

**Experimento interno sugerido:** em uma coorte de 50–100 crianças, meça latência mediana corrigida por tentativa de recuperação correta em 20 fatos-alvo. Compare um modelo de potência ajustado individualmente com uma regra fixa de 10 exposições. Métrica: proporção de fatos que atingem o critério de domínio em 2 sessões e retenção após 7 dias. Isso é um ensaio de produto, não um estudo experimental controlado.

______________________________________________________________________

## 3. Treino visual e cálculo mental rápido

**(a) Conclusão.** O treino com ábaco/soroban e cálculo mental pode melhorar aritmética em crianças, mas não é uma via comprovadamente superior para automatizar fatos de um dígito em um app. Seus ganhos parecem depender de prática extensa, representação visuoespacial e, em parte, de habilidades iniciais de memória de trabalho.

**(b) Achados.**

- Barner et al. (2016), em *Child Development*, conduziram um ensaio randomizado controlado de três anos com 204 estudantes, de 5–7 anos no início, em escolas na Índia. O grupo de ábaco mental recebeu três horas semanais de instrução adicional; o grupo-controle recebeu três horas semanais de matemática suplementar. Os alunos do ábaco superaram os controles em tarefas aritméticas.[^2_11][^2_12]
- O mesmo estudo não encontrou mudanças nas capacidades cognitivas básicas atribuíveis ao treino; diferenças iniciais em memória de trabalho espacial mediaram a aprendizagem do ábaco mental.[^2_13]
- Uma revisão de literatura sobre treino cognitivo com ábaco reúne evidência de que a prática pode melhorar habilidades matemáticas e aspectos cognitivos, mas a heterogeneidade dos estudos limita generalizações.[^2_14]
- Um estudo com 7–11 anos relatou ensaio clínico randomizado de oito semanas de exercícios de soroban, com desfechos de atenção, memória e outras funções cognitivas; não é evidência específica de fatos aritméticos nem de transferência para recuperação direta.[^2_15]
- O material de divulgação do estudo de Barner et al. relata efeitos grandes em habilidades matemáticas e vantagens modestas em notas, mas essa síntese secundária não substitui a leitura do artigo original.[^2_16]

**(c) Confiança: média** para benefício aritmético do ábaco mental em contexto intensivo; **baixa** para uso como método de automatização de fatos em app; **baixa** para durabilidade após interrupção.

**(d) Implicação prática.** Não transforme a Trilha Turbo em um curso de soroban. Aproveite apenas princípios transferíveis:

- Representação visual rápida de quantidades pequenas, por exemplo pontos organizados, barras de dezena ou retângulos para multiplicação.
- Prática de conversão imediata entre representação visual e numeral.
- Treino de decomposição em dezenas e unidades.
- Não exija manipulação mental de ábaco como pré-requisito.

O que depende de tutor/instrumento físico é a sequência motora do soroban e a correção de procedimento; isso não se replica bem em um app sem suporte humano. O que pode ser aproveitado é a prática repetida de representações visuais e decomposição, mas sua contribuição adicional sobre recuperação direta de fatos não está demonstrada.

______________________________________________________________________

## 4. Evidência em português e no Brasil

**(a) Conclusão.** Há estudos brasileiros mostrando que muitos alunos do 3º ao 5º ano ainda não dominam fluentemente operações básicas, inclusive multiplicação de um dígito. Porém, não encontrei evidência experimental brasileira suficiente para afirmar que a forma de ler a conta em português altera de modo mensurável a recuperação, a interferência ou o padrão de erros.

**(b) Achados.**

- Gomides et al. (2021), publicado na *Dementia \& Neuropsychologia* via SciELO, avaliaram 706 crianças brasileiras do 3º ao 5º ano em adição, subtração e multiplicação. Menos de 20% dos alunos do 5º ano alcançaram pontuação máxima em multiplicação; menos de 50% atingiram 80% ou mais de acerto em adição, subtração ou multiplicação.[^2_17][^2_18]
- Um estudo brasileiro com 81 estudantes do 3º ao 5º ano, em escolas públicas e privadas de Goiás, publicado na *Revista Brasileira de Educação*, encontrou uso frequente de soma repetida e apoio empírico, com dificuldades na multiplicação e na antecipação mental de “n vezes x”.[^2_19][^2_20][^2_21]
- Um estudo brasileiro sobre heterogeneidade de dificuldades matemáticas descreveu treino conceitual e prática extensiva com produção repetida de fatos de multiplicação seguida de feedback imediato, associando essa prática à automatização e à prevenção do fortalecimento de associações incorretas.[^2_22][^2_23]
- Um estudo com 127 alunos do 3º e 4º anos, publicado na *Ciência \& Educação*, examinou memória de trabalho, consciência fonêmica, transcodificação numérica e estimativa numérica como preditores de compreensão de conceitos aritméticos; não é uma intervenção de fatos.[^2_24]
- Não encontrei, nas fontes abertas, normas brasileiras de tempo de resposta e acerto para fatos aritméticos por idade, nem experimento que compare “seis vezes sete”, “seis por sete” e outras formulações em português quanto à latência ou interferência.

**(c) Confiança: média** para a existência de dificuldade generalizada no Brasil; **baixa** para efeitos linguísticos específicos do português.

**(d) Implicação prática.** Use português brasileiro consistente e curto na interface: “6 × 7” na tela; áudio opcional “seis vezes sete”. Não alterne “vezes”, “por” e “multiplicado por” durante a fase de automatização. Registre se a criança usa áudio e compare latência entre itens apresentados com e sem áudio, mas trate isso como hipótese interna.

**Experimento interno sugerido:** em 100–200 crianças, randomize a leitura em voz alta entre “seis vezes sete” e “seis por sete” para o mesmo conjunto de fatos. Métricas: latência mediana corrigida, acerto e tipo de erro. Tamanho aproximado: pelo menos 50 crianças por braço para detectar diferenças moderadas; o tamanho exato depende da variabilidade real dos dados.

______________________________________________________________________

## 5. Falhas de automatização e interferência

**(a) Conclusão.** Fatos teimosos costumam falhar por interferência de similaridade, não por falta de esforço. A evidência mais direta disponível indica que ensinar fatos parecidos ao mesmo tempo piora a aprendizagem; separe fatos semelhantes no início e só os aproxime depois de estabilizados.

**(b) Achados.**

- De Visscher e Noël (2016), em *Memory \& Cognition*, mostraram que a interferência proativa de problemas previamente aprendidos é um determinante substancial do desempenho em multiplicação, em crianças e adultos: problemas muito semelhantes a outros já aprendidos são mais difíceis de recordar.[^2_25]
- Um estudo de 2022, publicado em *Cognitive Research: Principles and Implications*, treinou crianças do 1º ano em 16 fatos de multiplicação, quatro por semana, durante 16 sessões curtas em quatro semanas. Semanas com fatos dissimilares produziram melhor aprendizagem do que semanas com fatos similares.[^2_26][^2_27][^2_28]
- O mesmo estudo concluiu que a principal fonte de interferência é a aprendizagem simultânea ou próxima no tempo de fatos semelhantes, e não apenas a similaridade com fatos aprendidos anteriormente.[^2_26]
- Um estudo sobre intervenção em multiplicação relatou que, após treino, uma participante produziu menos erros de “quase acerto” (*close miss*) e outra menos omissões, mas mais erros de operando; isso mostra que o tipo de erro muda com o perfil e exige análise individual.[^2_23]
- A literatura de interferência enfatiza que recuperar um fato exige suprimir respostas incorretas relacionadas, especialmente de fatos próximos.[^2_29]

**(c) Confiança: alta** para similaridade como fonte de interferência; **alta** para separar fatos semelhantes na introdução; **média** para diagnóstico fino de tipo de erro.

**(d) Implicação prática.** Refine a fila de fatos novos:

- Não introduza na mesma sessão fatos que compartilham operandos e produzem respostas próximas, por exemplo 6 × 7 e 7 × 6, ou 6 × 7 e 6 × 8.
- Separe no tempo fatos de tabuadas vizinhas: por exemplo, não ensine 6 × 7, 7 × 7 e 8 × 7 juntos.
- Use comutatividade como regra explícita, mas não apresente as duas ordens como itens independentes logo no início.
- Para um fato teimoso, identifique o concorrente mais frequente: “7 × 8 = 54” sugere confusão com 6 × 9 ou com uma resposta vizinha; registre a resposta dada, não apenas “errado”.
- Após erro, mostre o par correto e um contraste visual breve: “7 × 8 = 56; 6 × 9 = 54”, mas evite criar novos pares confusos na mesma sessão.
- Não leia em voz alta uma sequência de fatos parecidos em rápida sucessão; isso pode reforçar a coativação de respostas concorrentes. Isso é heurística coerente com a teoria de interferência, não um experimento específico.

**Classificação de erro:**


| Tipo de erro | Exemplo | Ação no app |
| :-- | :-- | :-- |
| Tabela vizinha | 7 × 8 = 54 | Reapresentar com contraste e espaçar do concorrente |
| Inversão de operação | 4 × 3 = 7 | Reensinar significado de multiplicação e separar soma de produto |
| Erro de dezena | 7 × 8 = 46 | Revisar decomposição e valor posicional antes de mais drill |
| Resposta plausível | 6 × 7 = 43 | Feedback imediato e nova recuperação; não apenas mostrar gabarito |
| Omissão/hesitação | Sem resposta em 5–8 s | Reduzir carga, oferecer dica e reapresentar no fim da sessão |


______________________________________________________________________

## 6. Estratégias e dicas

**(a) Conclusão.** Estratégias explícitas ajudam a construir significado e a gerar a resposta quando a recuperação falha; depois, a prática de recuperação sem dica é necessária para automatização. O objetivo não é eliminar toda estratégia, mas garantir que a dica seja retirada gradualmente e não substitua a memória.

**(b) Achados.**

- A *instance theory* prevê que, após prática suficiente, a criança abandona o algoritmo e recupera a solução diretamente da memória.[^2_8][^2_5]
- A revisão de evidências sobre multiplicação destaca que a aquisição de fatos depende de alguma forma de prática de recuperação, mas que oportunidades baseadas em estratégia complementam o treino cronometrado, incluindo dobrar e dividir por dois e perceber padrões de contagem em 5 e 10.[^2_29]
- O estudo brasileiro com 81 alunos encontrou uso frequente de soma repetida e apoio empírico na multiplicação, indicando que estratégias iniciais são comuns e devem ser levadas em conta no desenho.[^2_21][^2_19]
- Um estudo brasileiro sobre dificuldades em multiplicação descreveu treino conceitual para compreensão de operações e estratégias, além de prática extensiva com feedback imediato.[^2_22][^2_23]
- Instrução sistemática com *prompt fading* e feedback é descrita como procedimento baseado em evidência para ensino de matemática em uma revisão citada por um estudo de 2025 sobre fluência de adição em crianças com deficiência intelectual leve.[^2_30]
- Não encontrei, nas fontes abertas, um ensaio que compare diretamente momento e formato de dica — antes da tentativa, após erro ou sob demanda — para fatos aritméticos em crianças de 6–11 anos.

**(c) Confiança: média** para estratégias como ponte; **média** para retirada gradual de dica; **baixa** para a melhor forma exata de dica em app.

**(d) Implicação prática.** Ensine um conjunto mínimo por operação, nesta ordem sugerida:


| Operação | Estratégias mínimas | Ordem sugerida |
| :-- | :-- | :-- |
| Adição | Dobros, +1/+2, faz-10, +10−1 para +9 | Dobros e +1/+2; depois faz-10; depois +9 |
| Subtração | Relação inversa com adição, subtração de 10, contagem para cima quando apropriado | Relação inversa; depois dezenas |
| Multiplicação | Comutatividade, ×2, ×5, ×10, ×4 como dobro do dobro, ×9 como ×10−1 grupo | Comutatividade e ×2/×5/×10; depois ×4 e ×9 |
| Divisão | Relação inversa com multiplicação, metade/metade para ÷2 e ÷4 | Relação inversa; depois divisões por 2 e 10 |

**Momento da dica:**

- **Primeira exposição:** dica explícita antes da tentativa, com representação visual.
- **Erro:** dica curta após a tentativa, nunca antes, para preservar a oportunidade de recuperação.
- **Fato teimoso:** dica sob demanda, acionada pela criança ou após 5–8 segundos.
- **Fato em consolidação:** sem dica automática; dica disponível apenas como recurso.
- **Fato maduro:** sem dica; se a criança pedir, registre o evento como sinal de que o fato ainda não está maduro.

**Retirada gradual:** comece com dica visual completa, depois dica parcial, depois pergunta (“Você lembra de um dobro próximo?”) e, por fim, apenas o problema. Isso é coerente com *prompt fading*, mas não é um protocolo validado para fatos aritméticos em todas as idades.[^2_30]

**Criança que conta nos dedos:** não corrija de forma punitiva. Primeiro registre a latência e o padrão; depois ofereça uma estratégia mais eficiente e pratique a recuperação do fato. A escolha adaptativa de Siegler sugere que a criança pode manter uma estratégia lenta quando ela é confiável; portanto, o app deve reduzir gradualmente a necessidade da estratégia, em vez de proibi-la abruptamente. Isso é inferência prática, não uma regra experimental validada.

______________________________________________________________________

## O que muda nos parâmetros do ciclo 1

| Parâmetro | Decisão do ciclo 2 | Mudança em relação ao ciclo 1 | Fonte |
| :-- | :-- | :-- | :-- |
| Critério de domínio | Confirma a lógica de acerto + baixa latência, mas exige correção pelo custo de entrada e duas sessões consecutivas | **Refina**: não use tempo bruto; use latência corrigida e variabilidade | [^2_2][^2_3][^2_4] |
| Meta de latência | Não há limiar universal; calibre por linha de base motora individual | **Refina**: substitua “≤ 2 s / ≤ 1,5 s” por meta relativa à linha de base | [^2_1][^2_4] |
| Número de exposições | Não há número validado; conte apenas recuperações corretas | **Confirma a lacuna**; não adote “X repetições” | [^2_5][^2_6][^2_7] |
| Curva de aprendizado | Modele latência por função de potência individual, mas não use para prever exposições | **Novo parâmetro**: mediana, variabilidade e ajuste individual | [^2_6][^2_9][^2_7] |
| Intervalos de revisão | Mantenha espaçamento expansivo; não há validação dos valores exatos | **Confirma**: 1/3/7/14/30 dias permanecem heurística | — |
| Política de erro | Confirma feedback imediato, nova recuperação e reinserção; acrescente classificação de erro | **Refina**: trate erro de interferência, operação e dezena de modo diferente | [^2_23][^2_29] |
| Ordem de fatos | Confirma introdução em pequenos conjuntos, mas exige baixa similaridade interna | **Refina**: não apresente fatos parecidos juntos; separe tabuadas vizinhas | [^2_26][^2_25][^2_27] |
| Uso de dica | Confirma ensino explícito antes da cobrança; exige retirada gradual | **Refina**: dica antes da primeira tentativa; após erro, dica curta; depois, sob demanda | [^2_5][^2_30][^2_29] |
| Cronômetro | Confirma uso cauteloso; cronômetro invisível no início e meta pessoal depois | **Confirma** | — |
| Ábaco/soroban | Não adotar como método central de fatos | **Novo parâmetro**: usar apenas princípios visuais e de decomposição | [^2_11][^2_14][^2_13] |
| Português | Padronizar leitura e não alternar formulações durante automatização | **Novo parâmetro**: hipótese interna, sem evidência brasileira específica | [^2_17][^2_19] |


______________________________________________________________________

## Lacunas e experimentos no app

| Lacuna | Experimento simples | Variável | Métrica | Amostra mínima aproximada |
| :-- | :-- | :-- | :-- | :-- |
| Limiar de latência por modalidade | Medir linha de base motora e latência de fatos em teclado, voz e escrita | Modalidade de resposta | Latência mediana corrigida, acerto | 50–100 crianças |
| Número de recuperações até estabilidade | Acompanhar fatos até domínio e revisão de 7 dias | Recuperações corretas espaçadas | Probabilidade de retenção em 7 dias | 100–200 fatos por criança |
| Similaridade entre fatos novos | Randomizar blocos de fatos novos em alta versus baixa similaridade | Similaridade dentro do bloco | Acerto, latência, erros de vizinho | 50–100 crianças |
| Momento da dica | Randomizar dica antes, após erro ou sob demanda | Momento da dica | Latência sem dica, acerto, dependência da dica | 50–100 crianças por braço |
| Leitura em português | Comparar “vezes” e “por” na leitura em voz alta | Formulação verbal | Latência, acerto, tipo de erro | 50 crianças por braço |
| Gamificação | Comparar meta pessoal de tempo, streak e nenhuma gamificação | Tipo de reforço | Retenção, motivação autorrelatada, abandono | 50–100 crianças por braço |

Estes experimentos são testes internos de produto, não substituem um ensaio randomizado controlado externo. Para qualquer alegação pública de eficácia, será necessário um estudo com grupo-controle ativo, pré/pós-teste, cegamento do avaliador quando possível e acompanhamento de retenção.

<span style="display:none">[^2_31][^2_32][^2_33][^2_34][^2_35][^2_36][^2_37][^2_38][^2_39][^2_40][^2_41][^2_42][^2_43][^2_44][^2_45]</span>

<div align="center">⁂</div>

[^2_1]: https://reference-global.com/download/article/10.2478/pjst-2013-0023.pdf

[^2_2]: https://link.springer.com/content/pdf/10.1007/s00426-024-02036-6.pdf?error=cookies_not_supported\&code=c3a29280-d2d7-4ce8-9a7f-b1366fc8cddb

[^2_3]: https://www.jneurosci.org/content/jneuro/early/2019/06/17/JNEUROSCI.3195-18.2019.full.pdf

[^2_4]: https://link.springer.com/article/10.1038/s41539-025-00314-5

[^2_5]: http://www.psy.vanderbilt.edu/faculty/logan/1988LoganPR.pdf

[^2_6]: http://www.psy.vanderbilt.edu/faculty/logan/1992LoganJEPLMC.pdf

[^2_7]: https://cdn.vanderbilt.edu/t2-main/lab-prd/wp-content/uploads/sites/242/2025/09/ServantCasseyWoodmanLogan2018.pdf

[^2_8]: http://www.psy.vanderbilt.edu/faculty/logan/1990LoganCP.pdf

[^2_9]: https://public-pages-files-2025.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.761696/pdf

[^2_10]: https://www.frontiersin.org/journals/behavioral-neuroscience/articles/10.3389/fnbeh.2025.1560362/xml

[^2_11]: https://academic.oup.com/chidev/article/87/4/1146/8258418

[^2_12]: https://escholarship.org/content/qt0691p7tp/qt0691p7tp.pdf

[^2_13]: https://www.studocu.com/ph/document/saint-columban-college/maed-science/barner-et-al-2016/102435250

[^2_14]: https://pmc.ncbi.nlm.nih.gov/articles/PMC8283869/

[^2_15]: https://www.mdpi.com/2227-7102/11/2/83

[^2_16]: https://www.bps.org.uk/research-digest/teaching-children-ancient-mental-abacus-technique-boosted-their-maths-abilities

[^2_17]: https://www.scielo.br/j/dn/a/qWXtpJ95CKHfHwFmSb4Kxxv/?lang=en

[^2_18]: https://www.scielo.br/j/dn/a/qWXtpJ95CKHfHwFmSb4Kxxv/?format=pdf\&lang=en\&ilang=pt_BR

[^2_19]: http://www.scielo.br/j/rbeped/a/rTDb3DS4rkTvxQ4KD6HHCTF/abstract/?lang=pt\&ilang=en

[^2_20]: https://www.scielo.br/j/rbeped/a/rTDb3DS4rkTvxQ4KD6HHCTF/abstract/?format=html\&lang=pt\&ilang=pt_BR

[^2_21]: https://new.scielo.br/j/rbeped/a/rTDb3DS4rkTvxQ4KD6HHCTF/abstract/?lang=en\&ilang=pt_BR

[^2_22]: https://www.scielo.br/j/dn/a/7MgNJxXQrmWRxjtTDD4M54v/?lang=en\&ilang=es

[^2_23]: https://www.scielo.br/j/dn/a/7MgNJxXQrmWRxjtTDD4M54v/?lang=en\&ilang=en

[^2_24]: https://new.scielo.br/j/ciedu/a/thrwnM9xDmSPg5rYj7hrVgR/?lang=en

[^2_25]: https://pubmed.ncbi.nlm.nih.gov/27339011/

[^2_26]: https://link.springer.com/article/10.1186/s41235-022-00451-0?error=cookies_not_supported\&code=2e84c83d-a10c-4414-a418-70f108cfe31e

[^2_27]: https://pmc.ncbi.nlm.nih.gov/articles/PMC9716515/pdf/41235_2022_Article_451.pdf

[^2_28]: https://pmc.ncbi.nlm.nih.gov/articles/PMC9716515/

[^2_29]: https://my.chartered.college/impact_article/learning-using-and-applying-multiplication-facts-insights-from-research/

[^2_30]: https://pmc.ncbi.nlm.nih.gov/articles/PMC12360014/

[^2_31]: http://www.scielo.br/j/ep/a/PvtmpHR4JYHXQKctLqBTfKC/?lang=en\&format=pdf\&ilang=pt_BR

[^2_32]: http://www.scielo.br/j/ep/a/PvtmpHR4JYHXQKctLqBTfKC/?lang=en\&format=pdf\&ilang=es

[^2_33]: http://www.scielo.org.co/scielo.php?script=sci_arttext\&pid=S2011-30802023000200046\&lng=en\&nrm=iso\&tlng=en

[^2_34]: https://scielo.isciii.es/scielo.php?script=sci_arttext\&pid=S0212-97282019000300007\&lng=e\&nrm=iso\&tlng=e

[^2_35]: https://new.scielo.br/j/bolema/a/xSWxmXQMXXh8cP577PdZVnn/?format=pdf\&lang=pt\&ilang=pt_BR

[^2_36]: https://www.talamo.co.uk/wiki/using-known-facts-to-build-arithmetic-fluency

[^2_37]: https://cris.tau.ac.il/en/publications/reducing-interference-improves-the-memorization-of-multiplication/

[^2_38]: https://dial.uclouvain.be/pr/boreal/object/boreal:264161/datastream/PDF_01/view

[^2_39]: https://conservancy.umn.edu/server/api/core/bitstreams/3dd50318-b3be-4cbb-b669-0004cb56aba0/content

[^2_40]: https://www.rocketmath.com/wp-content/uploads/2015/05/Math-Facts-research.doc

[^2_41]: https://scholarworks.calstate.edu/downloads/cv43nx365

[^2_42]: https://irbe.library.vanderbilt.edu/server/api/core/bitstreams/3fef5da1-617c-4fd5-85b2-096331304799/content

[^2_43]: https://www.talamo.co.uk/wiki/using-and-fading-worked-examples-in-mathematics

[^2_44]: https://journals.sagepub.com/doi/10.1177/15291006241287726

[^2_45]: https://mrbartonmaths.com/resourcesnew/8. Research/Fluency/Mastering Math Facts Research and Results.pdf

