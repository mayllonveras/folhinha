/* Motor da Trilha Turbo (turbo.js). Rodar com: node testes/turbo.test.js
   Cobre: catálogo e famílias, portões, montagem da sessão, promoção e rebaixamento dos fatos, critério de tempo, regra de aparelho novo,
   meta de tempo, recompensa do dia, nivelamento da primeira entrada e uma simulação de 120 dias. */
global.window=global;
require('../turbo.js');
const T=global.FC.turbo,P=T.P;
let falhas=0;const falha=m=>{falhas++;if(falhas<40)console.log("  FALHA",m)};
const ok=(c,m)=>{if(!c)falha(m)};
const igual=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))falha(m+": esperado "+JSON.stringify(b)+", veio "+JSON.stringify(a))};

/* ---------- ajudantes ---------- */
function aluno(o){const st=T.novoAluno(o);st.aparelhos.tablet=20;return st}
function pôr(st,id,campos){const f=T.fato(st,id);Object.assign(f,campos);return f}
/* sessão com respostas escolhidas à mão (a fila fica vazia, só as tentativas dadas contam) */
function sessaoCom(st,dia,aparelho,tentativas){
  const sess=T.iniciarSessao(st,{dia,aparelho,rnd:T.rng(1)});
  sess.fila=[];
  tentativas.forEach(a=>T.registrar(st,sess,Object.assign({total:(a.t1||0)+500,dica:"none",contou:false},a)));
  return {sess,res:T.finalizarSessao(st,sess)};
}
/* criança simulada: p(acerto) e tempo por fato */
function jogar(st,dia,o){
  const rnd=o.rnd||T.rng(dia+7),sess=T.iniciarSessao(st,{dia,aparelho:o.aparelho||"tablet",rnd});
  let it,n=0;
  while((it=T.proximo(st,sess))){
    const acerta=rnd()<(o.acerto==null?1:typeof o.acerto==="function"?o.acerto(it,st):o.acerto);
    const t1=typeof o.t1==="function"?o.t1(it,st):(o.t1||800);
    T.registrar(st,sess,{id:it.id,ok:acerta,t1,total:t1+600,dica:it.dica,contou:false});
    if(++n>200){falha("sessão sem fim");break}
  }
  return {sess,res:T.finalizarSessao(st,sess),n:sess.n};
}

/* ---------- 1. catálogo ---------- */
{
  const c=T.catalogo(),tam={soma:66,sub:121,mult:66,div:110},ids=new Set();
  T.ORDEM.forEach(o=>{
    igual(c[o].facts.length,tam[o],"fatos de "+o);
    c[o].facts.forEach(f=>{
      if(ids.has(f.id))falha("id repetido "+f.id);ids.add(f.id);
      if(!(f.fam>=0&&f.fam<c[o].fams.length))falha("família fora da faixa em "+f.id);
      if(T.porId(f.id)!==f)falha("porId não acha "+f.id);
    });
    c[o].fams.forEach((n,k)=>{if(!c[o].facts.some(f=>f.fam===k))falha("família vazia: "+o+" "+n)});
    igual(c[o].fams.length,c[o].dicas.length,"uma dica por família em "+o);
  });
  igual(ids.size,363,"total de fatos");
  const tf=o=>c[o].fams.map((_,k)=>c[o].facts.filter(f=>f.fam===k).length);
  igual(tf("soma"),[11,19,8,7,2,6,5,8],"tamanho das famílias da soma");
  igual(tf("mult"),[21,9,8,7,6,5,4,3,2,1],"tamanho das famílias da multiplicação");
  igual(tf("sub"),[33,8,10,6,9,55],"tamanho das famílias da subtração");
  ["soma","mult"].forEach(o=>{igual(c[o].facts.reduce((a,f)=>a+f.cells.length,0),121,"células do mapa de "+o)});
  /* a resposta confere com a conta */
  c.soma.facts.forEach(f=>{const[x,y]=f.nums;if(f.res!==x+y)falha("soma errada "+f.id)});
  c.sub.facts.forEach(f=>{const[s,r]=f.nums;if(f.res!==r||f.whole!==s+r)falha("subtração errada "+f.id)});
  c.mult.facts.forEach(f=>{const[x,y]=f.nums;if(f.res!==x*y)falha("produto errado "+f.id)});
  c.div.facts.forEach(f=>{const[d,q]=f.nums;if(f.res!==q||f.whole!==d*q)falha("divisão errada "+f.id)});
}

/* ---------- 2. portões ---------- */
{
  const c=T.catalogo(),st=aluno();
  let p=T.portoes(st);
  ok(!p.soma.bloqueada,"soma começa liberada");
  ok(p.sub.bloqueada&&p.mult.bloqueada&&p.div.bloqueada,"as outras operações começam bloqueadas");
  c.soma.facts.slice(0,56).forEach(f=>pôr(st,f.id,{s:4}));      /* 56/66 = 84,8% */
  p=T.portoes(st);ok(!p.sub.portaoAberto&&!p.mult.portaoAberto,"84,8% não abre o portão");
  pôr(st,c.soma.facts[56].id,{s:5});                            /* 57/66 = 86,4% */
  p=T.portoes(st);
  ok(p.sub.portaoAberto&&p.mult.portaoAberto,"86,4% abre o portão de subtração e multiplicação");
  ok(p.sub.bloqueada&&p.mult.bloqueada,"portão aberto, mas operação não liberada nesta versão continua bloqueada");
  st.liberadas=["soma","sub","mult","div"];
  p=T.portoes(st);
  ok(!p.sub.bloqueada&&!p.mult.bloqueada,"com a operação liberada, o portão aberto basta");
  ok(p.div.bloqueada,"divisão pede multiplicação firme");
  c.mult.facts.slice(0,57).forEach(f=>pôr(st,f.id,{s:4}));
  p=T.portoes(st);ok(!p.div.bloqueada,"divisão abre com multiplicação firme");
  /* a soma perde a base: o portão da divisão cai junto (cadeia) */
  c.soma.facts.forEach(f=>pôr(st,f.id,{s:3}));
  p=T.portoes(st);ok(p.mult.bloqueada&&p.div.bloqueada,"sem a soma firme, multiplicação e divisão voltam a bloquear");
}

/* ---------- 3. primeira sessão e bloco novo ---------- */
{
  const st=aluno(),sess=T.iniciarSessao(st,{dia:0,aparelho:"tablet",rnd:T.rng(3)});
  ok(sess.bloco.length>=3&&sess.bloco.length<=4,"bloco novo de 3 a 4 fatos: "+sess.bloco.length);
  ok(sess.bloco.every(id=>T.porId(id).op==="soma"&&T.porId(id).fam===0),"o primeiro bloco é da primeira família da soma");
  igual(sess.fila.length,sess.bloco.length*P.REPS_NOVO,"cada fato novo aparece "+P.REPS_NOVO+" vezes");
  ok(sess.fila.slice(0,sess.bloco.length).every(i=>i.tipo==="novo"&&i.rep===0),"primeiro todas as exposições");
  igual(T.proximo(st,sess).dica,"before","primeira exposição com dica antes da tentativa");
  ok(!sess.semTarefa,"há tarefa na primeira sessão");
  /* blocos de famílias seguintes não repetem número, quando a família permite */
  const st2=aluno();T.catalogo().soma.facts.filter(f=>f.fam<2).forEach(f=>pôr(st2,f.id,{s:3,due:99}));
  const b=T.proximoBloco(st2);
  ok(b.every(f=>f.fam===2||f.fam===3),"o bloco segue a ordem das famílias");
  const vistos={};let rep=0;
  b.forEach(f=>[...new Set(f.nums)].forEach(v=>{if(vistos[v])rep++;vistos[v]=1}));
  igual(rep,0,"nenhum número aparece em dois fatos do bloco: "+b.map(f=>f.eq).join(", "));
  /* família em que todos os fatos têm o mesmo número: completa o mínimo mesmo assim, sem misturar outra família */
  const b0=T.proximoBloco(aluno());ok(b0.length===P.BLOCO_MIN&&b0.every(f=>f.fam===0),"Somar zero: bloco mínimo da própria família");
  /* família pequena (Faz 10 tem 2 fatos novos): completa com a família seguinte */
  const st4=aluno();T.catalogo().soma.facts.filter(f=>f.fam<4).forEach(f=>pôr(st4,f.id,{s:3,due:99}));
  const b4=T.proximoBloco(st4);ok(b4.length>=P.BLOCO_MIN&&b4[0].fam===4&&b4.some(f=>f.fam===5),"família pequena completa com a seguinte: "+b4.map(f=>f.eq).join(", "));
  /* fila de aprendizagem cheia: não entra fato novo */
  const st3=aluno();T.catalogo().soma.facts.slice(0,8).forEach(f=>pôr(st3,f.id,{s:2,due:5}));
  igual(T.proximoBloco(st3).length,0,"com 8 fatos aprendendo, nenhum fato novo entra");
  /* nunca traz fato de operação bloqueada */
  ok(T.proximoBloco(aluno()).every(f=>f.op==="soma"),"só soma no primeiro corte");
}

/* ---------- 4. teto da sessão e revisões vencidas ---------- */
{
  const st=aluno(),c=T.catalogo();
  c.soma.facts.slice(0,60).forEach(f=>pôr(st,f.id,{s:4,rev:1,due:0}));
  const sess=T.iniciarSessao(st,{dia:0,aparelho:"tablet",rnd:T.rng(5)});
  ok(sess.fila.length<=P.TETO_TENT-P.REINSERCOES,"fila respeita o teto, com folga para reinserções: "+sess.fila.length);
  const {n,res}=jogar(aluno(),0,{acerto:.5});ok(n<=P.TETO_TENT,"nunca passa de "+P.TETO_TENT+" tentativas: "+n);
  /* revisões de operação bloqueada não entram */
  const st2=aluno();pôr(st2,"-:3:4",{s:3,due:0});pôr(st2,"+:1:2",{s:3,due:0});
  const s2=T.iniciarSessao(st2,{dia:0,aparelho:"tablet",rnd:T.rng(5)});
  ok(s2.fila.filter(i=>i.tipo==="revisao").every(i=>T.porId(i.id).op==="soma"),"revisão só das operações liberadas");
  ok(s2.fila.some(i=>i.id==="+:1:2"&&i.tipo==="revisao"),"a revisão vencida da soma entra");
  /* tempo: 5 minutos fecham a sessão */
  const st3=aluno(),s3=T.iniciarSessao(st3,{dia:0,aparelho:"tablet",rnd:T.rng(5)});
  T.registrar(st3,s3,{id:s3.bloco[0],ok:true,t1:900,total:P.TETO_SEG*1000+1});
  igual(T.proximo(st3,s3),null,"passou de 5 minutos: sessão fecha");
  ok(T.concluida(s3),"tempo estourado conta como sessão concluída");
}

/* ---------- 5. dica por estado ---------- */
{
  igual(["before","before","before","demand","none","none"],[{s:0},{s:1},{s:2},{s:3},{s:4},{s:5}].map(T.dicaPara),"dica por estado");
  igual(T.dicaPara({s:3,stub:true}),"after","fato teimoso: dica depois da tentativa");
}

/* ---------- 6. promoção ---------- */
{
  const st=aluno(),id="+:2:5",f=pôr(st,id,{s:1,due:0});
  sessaoCom(st,0,"tablet",[{id,ok:true,t1:900,dica:"before"}]);
  igual(f.s,2,"1ª recuperação correta: aprendendo");
  sessaoCom(st,0,"tablet",[{id,ok:true,t1:900,dica:"before"},{id,ok:true,t1:900,dica:"before"}]);
  igual(f.s,2,"3 acertos no mesmo dia ainda não consolidam (precisa de 2 dias)");
  sessaoCom(st,1,"tablet",[{id,ok:true,t1:900,dica:"before"}]);
  igual(f.s,3,"acertos em 2 dias: consolidando");
  ok(f.atingiu,"marca que já chegou a consolidando");
  sessaoCom(st,2,"tablet",[{id,ok:true,t1:900}]);igual(f.s,3,"1 sessão boa ainda não promove");igual(f.boas,1,"conta 1 sessão boa");
  sessaoCom(st,3,"tablet",[{id,ok:true,t1:900}]);igual(f.s,4,"2 sessões boas seguidas: recuperação provável");
  igual(f.due,3+P.REVISOES[0],"primeira revisão em 1 dia");
  sessaoCom(st,4,"tablet",[{id,ok:true,t1:900}]);igual(f.rev,1,"revisão 1 passou");igual(f.due,4+3,"depois, 3 dias");
  sessaoCom(st,7,"tablet",[{id,ok:true,t1:900}]);igual(f.due,7+7,"depois, 7 dias");
  sessaoCom(st,14,"tablet",[{id,ok:true,t1:900}]);igual(f.due,14+14,"depois, 14 dias");
  sessaoCom(st,28,"tablet",[{id,ok:true,t1:900}]);igual(f.due,28+30,"depois, 30 dias");igual(f.s,4,"ainda não é maduro antes da revisão de 30 dias");
  sessaoCom(st,58,"tablet",[{id,ok:true,t1:900}]);igual(f.s,5,"passou a revisão de 30 dias: maduro");igual(f.due,58+P.MADURO,"maduro: revisão a cada 3 semanas");
}

/* ---------- 7. critério de tempo, contagem e dica ---------- */
{
  const lento=(extra)=>{
    const st=aluno(),id="+:3:4";pôr(st,id,{s:3,atingiu:true,boas:0,due:0,n:5,diasOk:3});
    const meta=T.metaDe(st);
    for(let d=0;d<4;d++)sessaoCom(st,d,"tablet",[Object.assign({id,ok:true,t1:meta+1},extra)]);
    return T.fato(st,id);
  };
  igual(lento({}).s,3,"acerta sempre, mas passa da meta: não promove");
  const st=aluno(),id="+:3:4";pôr(st,id,{s:3,atingiu:true,due:0,n:5,diasOk:3});
  for(let d=0;d<4;d++)sessaoCom(st,d,"tablet",[{id,ok:true,t1:700,contou:true}]);
  igual(T.fato(st,id).s,3,"contando nos dedos não promove");
  const st2=aluno();pôr(st2,id,{s:3,atingiu:true,due:0,n:5,diasOk:3});
  for(let d=0;d<4;d++)sessaoCom(st2,d,"tablet",[{id,ok:true,t1:700,dica:"before"}]);
  igual(T.fato(st2,id).s,3,"com a dica antes da tentativa não promove");
  const st3=aluno();pôr(st3,id,{s:3,atingiu:true,due:0,n:5,diasOk:3});
  sessaoCom(st3,0,"tablet",[{id,ok:true,t1:700}]);sessaoCom(st3,1,"tablet",[{id,ok:true,t1:9000}]);sessaoCom(st3,2,"tablet",[{id,ok:true,t1:700}]);
  igual(T.fato(st3,id).s,3,"uma sessão lenta no meio não conta como boa");
  /* a sessão boa só conta se o acerto recente é de 80% ou mais */
  const st4=aluno();const f4=pôr(st4,id,{s:3,atingiu:true,due:0,n:5,diasOk:3,recent:Array.from({length:10},(_,i)=>({ok:i<5,t1:800,dica:"none",contou:false}))});
  sessaoCom(st4,0,"tablet",[{id,ok:true,t1:700}]);sessaoCom(st4,1,"tablet",[{id,ok:true,t1:700}]);
  ok(f4.s===3||f4.recent.filter(r=>r.ok).length/f4.recent.length>=P.ACERTO_MIN,"acerto recente baixo segura a promoção");
}

/* ---------- 8. erros: rebaixamento e fato teimoso ---------- */
{
  let st=aluno(),id="×:6:7";
  let f=pôr(st,id,{s:5,rev:5,due:0,atingiu:true});
  let r=sessaoCom(st,10,"tablet",[{id,ok:false,t1:1500}]);
  igual(f.s,4,"erro em maduro: volta um estado");ok(f.rev<=2,"e revisa de novo em breve");ok(f.due-10>=7,"em 7 dias ou mais");
  igual(r.res.rebaixados,[id],"informa o rebaixamento");
  st=aluno();f=pôr(st,id,{s:4,rev:2,due:0,atingiu:true});
  sessaoCom(st,10,"tablet",[{id,ok:false,t1:1500}]);
  igual(f.s,3,"erro em provável: volta a consolidando");ok(f.stub,"e vira teimoso");igual(f.due,11,"volta amanhã");igual(f.boas,0,"zera as sessões boas");
  st=aluno();f=pôr(st,id,{s:3,atingiu:true,due:0});
  sessaoCom(st,10,"tablet",[{id,ok:false,t1:1500}]);
  igual(f.s,3,"erro em consolidando: continua consolidando");ok(f.stub,"e marca teimoso, porque já tinha chegado lá");
  st=aluno();f=pôr(st,id,{s:2,due:0});
  sessaoCom(st,10,"tablet",[{id,ok:false,t1:1500}]);
  igual(f.s,2,"erro em aprendendo: continua aprendendo");ok(!f.stub,"sem marca de teimoso");
  /* o fato errado volta no fim da própria sessão, uma vez só */
  st=aluno();const sess=T.iniciarSessao(st,{dia:0,aparelho:"tablet",rnd:T.rng(2)});
  const it=T.proximo(st,sess);T.registrar(st,sess,{id:it.id,ok:false,t1:1200,total:1800});
  igual(sess.fila[sess.fila.length-1],{id:it.id,tipo:"reinsercao"},"erro é reinserido no fim da sessão");
  const antes=sess.fila.length;T.registrar(st,sess,{id:it.id,ok:false,t1:1200,total:1800});
  igual(sess.fila.length,antes,"mas só uma reinserção por fato");
  /* teimoso recebe a dica depois da tentativa */
  igual(T.dicaPara(pôr(aluno(),"+:1:1",{s:3,stub:true})),"after","teimoso: dica depois");
}

/* ---------- 9. aparelho novo não promove por tempo, mas erro conta ---------- */
{
  const st=aluno(),id="+:4:5";st.aparelhos.celular=0;
  pôr(st,id,{s:3,atingiu:true,due:0,n:6,diasOk:3});
  for(let d=0;d<4;d++)sessaoCom(st,d,"celular",[{id,ok:true,t1:600}]);
  igual(T.fato(st,id).s,3,"no celular novo, tempo perfeito não promove");
  igual(st.aparelhos.celular,4,"cada sessão conta para o aparelho");
  /* mesmo fato, no tablet de sempre, promove */
  for(let d=4;d<6;d++)sessaoCom(st,d,"tablet",[{id,ok:true,t1:600}]);
  igual(T.fato(st,id).s,4,"no aparelho de sempre promove");
  /* depois de 5 sessões a classe deixa de ser nova */
  const st2=aluno(),id2="+:5:5";st2.aparelhos.celular=5;pôr(st2,id2,{s:3,atingiu:true,due:0,n:6,diasOk:3});
  for(let d=0;d<2;d++)sessaoCom(st2,d,"celular",[{id:id2,ok:true,t1:600}]);
  igual(T.fato(st2,id2).s,4,"com 5 sessões no celular, ele promove");
  /* erro no aparelho novo conta normalmente */
  const st3=aluno(),id3="+:6:6";st3.aparelhos.celular=0;pôr(st3,id3,{s:4,rev:1,due:0,atingiu:true});
  sessaoCom(st3,0,"celular",[{id:id3,ok:false,t1:2500}]);
  igual(T.fato(st3,id3).s,3,"erro em aparelho novo rebaixa");
  /* revisão de provável feita no aparelho novo não avança */
  const st4=aluno(),id4="+:7:7";st4.aparelhos.celular=0;pôr(st4,id4,{s:4,rev:1,due:0});
  sessaoCom(st4,0,"celular",[{id:id4,ok:true,t1:600}]);
  igual(T.fato(st4,id4).rev,1,"revisão em aparelho novo não avança o calendário");
  /* o estado é do aluno: uma sessão em aparelho novo enxerga o que o tablet fez */
  const st5=aluno();pôr(st5,"+:1:3",{s:2,due:0,n:2});
  const sess=T.iniciarSessao(st5,{dia:0,aparelho:"celular-da-avo",rnd:T.rng(1)});
  ok(sess.aparelhoNovo&&sess.fila.some(i=>i.id==="+:1:3"),"aparelho novo continua de onde parou");
}

/* ---------- 10. meta de tempo ---------- */
{
  igual(T.metaDe(aluno({idade:7})),P.META_6_8,"6 a 8 anos: meta inicial");
  igual(T.metaDe(aluno({idade:10})),P.META_9_11,"9 a 11 anos: meta inicial");
  const mk=lat=>{const st=aluno({idade:7});T.catalogo().soma.facts.slice(0,12).forEach(f=>pôr(st,f.id,{s:4,lat}));return st};
  igual(T.metaDe(mk(700)),1.5*700+300,"meta individual = 1,5 × piso + 300 ms");
  igual(T.metaDe(mk(200)),P.META_MIN,"meta tem piso de 1 s");
  igual(T.metaDe(mk(2500)),P.META_MAX,"meta tem teto de 3 s");
  const st=aluno({idade:7});T.catalogo().soma.facts.slice(0,9).forEach(f=>pôr(st,f.id,{s:4,lat:700}));
  igual(T.metaDe(st),P.META_6_8,"com menos de 10 fatos firmes, vale a meta por idade");
}

/* ---------- 11. recompensa do Turbo do dia ---------- */
{
  const st=aluno(),a=jogar(st,0,{acerto:1,t1:900});
  ok(a.res.concluida&&a.res.premio&&a.res.premio.tipo==="pacote"&&a.res.premio.fonte==="turbo","sessão concluída dá 1 pacotinho de origem 'turbo'");
  const b=jogar(st,0,{acerto:1,t1:900});ok(b.res.premio===null,"só 1 pacotinho por dia");
  const c=jogar(st,1,{acerto:1,t1:900});ok(c.res.premio&&c.res.premio.dia===1,"no dia seguinte, outro pacotinho");
  /* parou no meio: sem prêmio, mas o progresso fica */
  const st2=aluno(),s2=T.iniciarSessao(st2,{dia:0,aparelho:"tablet",rnd:T.rng(9)});
  const it=T.proximo(st2,s2);T.registrar(st2,s2,{id:it.id,ok:true,t1:900,total:1500});
  const r2=T.finalizarSessao(st2,s2);ok(!r2.concluida&&r2.premio===null,"parou no meio: sem pacotinho");
  igual(T.fato(st2,it.id).s,2,"mas o fato avançou");
  /* sessão de chute: muitas respostas erradas e rápidas demais */
  const st3=aluno(),s3=T.iniciarSessao(st3,{dia:0,aparelho:"tablet",rnd:T.rng(9)});
  let x;while((x=T.proximo(st3,s3)))T.registrar(st3,s3,{id:x.id,ok:false,t1:200,total:300});
  const r3=T.finalizarSessao(st3,s3);ok(r3.chute&&r3.premio===null,"chute não dá pacotinho");
  /* nada a fazer: sem pacotinho */
  const st4=aluno();T.catalogo().soma.facts.forEach(f=>pôr(st4,f.id,{s:5,due:999,rev:5}));
  const s4=T.iniciarSessao(st4,{dia:0,aparelho:"tablet",rnd:T.rng(1)});
  const r4=T.finalizarSessao(st4,s4);ok(s4.semTarefa&&r4.semTarefa&&r4.premio===null,"sem tarefa: sem pacotinho");
  /* a recompensa não depende de acertar tudo */
  const st5=aluno(),r5=jogar(st5,0,{acerto:.5,t1:1500}).res;ok(r5.concluida&&r5.premio,"o pacotinho vale pela sessão feita, não pela nota");
}

/* ---------- 12. nivelamento da primeira entrada ---------- */
{
  const N=T.nivelamento,n=T.catalogo().soma.fams.length;
  ok(N.sentinelas("soma").length===n&&N.sentinelas("soma").every(Boolean),"uma sentinela por família");
  /* criança que passa até a família k (lo = k): o nivelamento acha k e nunca superestima */
  for(let k=-1;k<n;k++){
    const nv=N.inicio("soma",7);let it,guard=0;
    while((it=N.proximo(nv))&&guard++<30)N.registrar(nv,it.fam,it.fam<=k?"rapido":"falhou");
    ok(nv.itens<=P.NIVELAMENTO_MAX,"k="+k+": mais de "+P.NIVELAMENTO_MAX+" itens");
    ok(nv.lo<=k,"k="+k+": superestimou ("+nv.lo+")");
    if(k>=3||k===-1)igual(nv.lo,k,"k="+k+": acha a família mais alta que passa");
  }
  /* duas famílias seguidas falhadas encerram a sondagem */
  const nv0=N.inicio("soma",7);N.registrar(nv0,N.proximo(nv0).fam,"falhou");N.registrar(nv0,N.proximo(nv0).fam,"falhou");
  igual(N.proximo(nv0),null,"duas falhas seguidas: para");
  /* aplicar: no máximo consolidando, sem abrir portão, vencimentos espalhados */
  const st=aluno(),nv=N.inicio("soma",7);let it;
  while((it=N.proximo(nv)))N.registrar(nv,it.fam,it.fam<=4?(it.fam===4?"lento":"rapido"):"falhou");
  const info=N.aplicar(st,nv,0);
  igual(info.maisAlta,4,"família mais alta que passou");
  const fs=T.catalogo().soma.facts;
  ok(fs.every(f=>T.estado(st,f.id)<=3),"nivelamento nunca passa de consolidando");
  ok(fs.filter(f=>f.fam<4).every(f=>T.estado(st,f.id)===3),"famílias abaixo da mais alta: consolidando");
  ok(fs.filter(f=>f.fam===4).every(f=>T.estado(st,f.id)===2),"sentinela lenta: aprendendo");
  ok(fs.filter(f=>f.fam>4).every(f=>T.estado(st,f.id)===0),"acima da mais alta: na fila");
  const p=T.portoes(st);ok(p.soma.pct===0&&p.sub.bloqueada&&p.mult.bloqueada,"não abre portão");
  const porDia={};fs.forEach(f=>{const x=st.fatos[f.id];if(x&&x.s>0)porDia[x.due]=(porDia[x.due]||0)+1});
  ok(Object.values(porDia).every(v=>v<=P.NIVELAMENTO_POR_DIA),"vencimentos espalhados: "+JSON.stringify(porDia));
  ok(Object.keys(porDia).every(d=>+d>=1),"nada vence no próprio dia do teste");
  /* idempotente: o que já tinha estado não é sobrescrito */
  const st2=aluno();pôr(st2,"+:0:0",{s:5,due:50});const nv2=N.inicio("soma",7);let i2;while((i2=N.proximo(nv2)))N.registrar(nv2,i2.fam,"rapido");N.aplicar(st2,nv2,0);
  igual(T.estado(st2,"+:0:0"),5,"não rebaixa fato que já era maduro");
  igual(N.classificar(900,true,2000),"rapido","classifica rápido");igual(N.classificar(2500,true,2000),"lento","classifica lento");
  igual(N.classificar(9000,true,2000),"falhou","passou de 8 s: falhou");igual(N.classificar(900,false,2000),"falhou","errou: falhou");
}

/* ---------- 13. estado serializável e determinismo ---------- */
{
  const a=aluno(),b=aluno();
  for(let d=0;d<10;d++){jogar(a,d,{acerto:.9,rnd:T.rng(d)});jogar(b,d,{acerto:.9,rnd:T.rng(d)})}
  igual(a,b,"mesma semente, mesmo estado");
  const c=JSON.parse(JSON.stringify(a));
  const sa=T.iniciarSessao(a,{dia:10,aparelho:"tablet",rnd:T.rng(1)}),sc=T.iniciarSessao(c,{dia:10,aparelho:"tablet",rnd:T.rng(1)});
  igual(sa.fila,sc.fila,"o estado volta do JSON e gera a mesma sessão");
  const r=T.resumo(a);
  igual(T.ORDEM.reduce((s,o)=>s+Object.values(r.ops[o].estados).reduce((x,y)=>x+y,0),0),363,"o resumo soma os 363 fatos");
}

/* ---------- 14. simulação de 120 dias ---------- */
{
  const st=aluno({liberadas:["soma","sub","mult","div"]}),rnd=T.rng(42);
  const hist={},premios=[];let maxTent=0,minutos=0,sessoes=0;
  for(let d=0;d<120;d++){
    /* criança boa: acerta mais nos fatos fáceis, fica mais rápida com a prática */
    const r=jogar(st,d,{rnd,aparelho:d%11===0?"celular":"tablet",
      acerto:(it,s)=>{const e=T.fato(s,it.id).s;return e<=1?.85:e===2?.9:.96},
      t1:(it,s)=>{const e=T.fato(s,it.id).s;return (e<=2?4500:e===3?1700:e===4?1300:900)*(.8+.4*rnd())}});
    if(r.res.premio)premios.push(d);
    maxTent=Math.max(maxTent,r.n);sessoes++;
    ["soma","sub","mult","div"].forEach(o=>{const m=T.catalogo()[o].facts;m.forEach(f=>{const e=T.estado(st,f.id);const h=hist[f.id]||(hist[f.id]={});if(e>=3&&h[3]==null)h[3]=d;if(e>=4&&h[4]==null)h[4]=d;if(e>=5&&h[5]==null)h[5]=d})});
    if(d===119)console.log("  simulação:",JSON.stringify(Object.fromEntries(T.ORDEM.map(o=>[o,Math.round(100*T.resumo(st).ops[o].pct)+"% firmes"]))),"| prêmios:",premios.length,"| máx tentativas:",maxTent);
  }
  ok(maxTent<=P.TETO_TENT,"nenhuma sessão passou de "+P.TETO_TENT+" tentativas");
  ok(premios.length>100,"quase todo dia dá o pacotinho (dias com tarefa): "+premios.length);
  const rs=T.resumo(st);
  ok(rs.ops.soma.pct>=.5,"em 120 dias a criança boa leva a soma a pelo menos 50% firme: "+Math.round(rs.ops.soma.pct*100)+"%");
  /* intervalos respeitados: de provável a maduro leva ao menos 1+3+7+14+30 dias */
  let violou=0,medidos=0;
  Object.keys(hist).forEach(id=>{const h=hist[id];if(h[4]!=null&&h[5]!=null){medidos++;if(h[5]-h[4]<P.REVISOES.reduce((a,b)=>a+b,0))violou++}if(h[3]!=null&&h[4]!=null&&h[4]-h[3]<1)violou++});
  igual(violou,0,"nenhum fato salta etapas ("+medidos+" fatos maduros medidos)");
  /* portões: operação nova só tem fato aprendido depois que o portão abriu */
  const pt=T.portoes(st);
  T.ORDEM.forEach(o=>{if(pt[o].bloqueada&&T.catalogo()[o].facts.some(f=>T.estado(st,f.id)>0))falha("fato de "+o+" aprendido com o portão fechado")});
  /* nenhum fato fica sem data de revisão */
  const semData=Object.keys(st.fatos).filter(id=>st.fatos[id].s>=1&&st.fatos[id].due==null);
  igual(semData.length,0,"todo fato em treino tem data de revisão");
}

console.log(falhas?"\n"+falhas+" falha(s)":"turbo: tudo certo");process.exit(falhas?1:0);
