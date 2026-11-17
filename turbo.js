/* Trilha Turbo: motor do agendador. Puro: sem tela, sem banco, sem relógio. Especificação: turbo/ESPECIFICACAO.md. Testes: node testes/turbo.test.js
   O estado do aluno é um objeto simples (cabe em JSON). Os dias são números inteiros (dias de calendário); quem chama diz qual é o dia de hoje.
   Fluxo: iniciarSessao → (proximo → registrar)* → finalizarSessao. Todos os parâmetros são heurísticas editáveis em FC.turbo.P. */
(function(root){
"use strict";
var FC=root.FC=root.FC||{};
var P={
  GATE:.85,                       /* fatos firmes (provável ou maduro) que a base precisa ter para abrir a operação seguinte */
  META_6_8:2000,META_9_11:1500,   /* meta inicial do tempo até o primeiro toque, em ms, por faixa de idade */
  META_MIN:1000,META_MAX:3000,PISO_FATOR:1.5,PISO_MARGEM:300,PISO_MIN_FATOS:10,
  TETO_TENT:40,TETO_SEG:300,      /* a sessão acaba em 40 tentativas ou 5 minutos */
  BLOCO_MIN:3,BLOCO_MAX:4,REPS_NOVO:3,REINSERCOES:4,APRENDENDO_MAX:8,
  CORRETAS_APRENDENDO:3,DIAS_APRENDENDO:2,SESSOES_BOAS:2,ACERTO_MIN:.8,
  REVISOES:[1,3,7,14,30],MADURO:21,
  APARELHO_MIN_SESSOES:5,
  CHUTE_MS:500,CHUTE_FRAC:.5,CHUTE_MIN_TENT:8,
  NIVELAMENTO_MAX:12,NIVELAMENTO_LENTO_MS:8000,NIVELAMENTO_POR_DIA:15
};
var ORDEM=["soma","sub","mult","div"];
var REQ={sub:"soma",mult:"soma",div:"mult"};

/* ---------- catálogo de fatos ---------- */
var CAT=null,IDX=null;
function catalogo(){
  if(CAT)return CAT;
  var c={};
  (function(){
    var fam=function(x,y){return x==0?0:x<=2?1:x==y?2:y==10?3:x+y==10?4:y==9?5:y-x==1?6:7},facts=[];
    for(var x=0;x<=10;x++)for(var y=x;y<=10;y++)facts.push({id:"+:"+x+":"+y,op:"soma",eq:x+" + "+y,res:x+y,whole:x+y,fam:fam(x,y),cells:x==y?[[x,y]]:[[x,y],[y,x]],nums:[x,y]});
    c.soma={nome:"Soma",facts:facts,
      fams:["Somar zero","+1 e +2","Dobros","+10","Faz 10","+9","Quase-dobros","Os demais"],
      dicas:["Somar zero não muda o número.","Conte para a frente, 1 ou 2 passos.","Dobro: duas fileiras iguais.","10 + n: o 1 da dezena e o n da unidade.","Complete 10 primeiro e some o que sobrou.","Some 10 e tire 1.","Dobro do menor mais 1.","Decomponha em 10 e o que sobra."]};
  })();
  (function(){
    var fam=function(s,r){return s<=2?0:r==s?1:s==10?2:s+r==10?3:s==9?4:5},facts=[];
    for(var s=0;s<=10;s++)for(var r=0;r<=10;r++)facts.push({id:"-:"+s+":"+r,op:"sub",eq:(s+r)+" − "+s,res:r,whole:s+r,fam:fam(s,r),cells:[[s,r]],nums:[s,r]});
    c.sub={nome:"Subtração",facts:facts,
      fams:["Tirar 0, 1 ou 2","Desfaz o dobro","Tirar 10","Desfaz o faz 10","Tirar 9","Os demais"],
      dicas:["Volte 0, 1 ou 2 passos.","Se sobra o mesmo que se tira, o todo é o dobro.","Tire a dezena: sobra o resto.","Pense na soma: 10 − 4 → 4 + ? = 10.","Tire 10 e devolva 1.","Pense na soma que falta."]};
  })();
  (function(){
    var prio=[[0,1],[2],[10],[5],[4],[3],[9],[6],[7],[8]],facts=[];
    var idx=function(n){for(var i=0;i<prio.length;i++)if(prio[i].indexOf(n)>=0)return i;return -1};
    for(var x=0;x<=10;x++)for(var y=x;y<=10;y++)facts.push({id:"×:"+x+":"+y,op:"mult",eq:x+" × "+y,res:x*y,whole:x*y,fam:Math.min(idx(x),idx(y)),cells:x==y?[[x,y]]:[[x,y],[y,x]],nums:[x,y]});
    c.mult={nome:"Multiplicação",facts:facts,
      fams:["×0 e ×1","×2","×10","×5","×4","×3","×9","×6","×7","×8"],
      dicas:["Por 0 dá 0. Por 1 não muda.","Dobro.","Acrescente um zero.","Metade do ×10.","Dobro do dobro.","Dobro mais um grupo.","×10 menos um grupo.","×5 mais um grupo.","Separe em 5 + 2.","Dobro do ×4."]};
  })();
  (function(){
    var prio=[[1],[2],[10],[5],[4],[3],[9],[6],[7],[8]],facts=[];
    var idx=function(n){for(var i=0;i<prio.length;i++)if(prio[i].indexOf(n)>=0)return i;return -1};
    for(var d=1;d<=10;d++)for(var q=0;q<=10;q++)facts.push({id:"÷:"+d+":"+q,op:"div",eq:(d*q)+" ÷ "+d,res:q,whole:d*q,fam:idx(d),cells:[[d-1,q]],nums:[d,q]});
    c.div={nome:"Divisão",facts:facts,
      fams:["÷1","÷2","÷10","÷5","÷4","÷3","÷9","÷6","÷7","÷8"],
      dicas:["Dividir por 1 não muda.","Metade.","Tire o zero.","Dobre e tire o zero.","Metade da metade.","Pense: 3 × ? = o número.","Pense: 9 × ? = o número.","Pense: 6 × ? = o número.","Pense: 7 × ? = o número.","Pense: 8 × ? = o número."]};
  })();
  IDX={};
  ORDEM.forEach(function(o){c[o].facts.forEach(function(f,i){f.ordem=i;IDX[f.id]=f})});
  return CAT=c;
}
function porId(id){catalogo();return IDX[id]||null}

/* ---------- utilidades ---------- */
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function embaralhar(a,rnd){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function mediana(v){if(!v.length)return null;v=v.slice().sort(function(a,b){return a-b});var m=v.length>>1;return v.length%2?v[m]:(v[m-1]+v[m])/2}

/* ---------- estado ---------- */
/* liberadas: operações abertas ao aluno nesta versão (primeiro corte: só a soma). O portão continua valendo para as demais. */
function novoAluno(o){
  o=o||{};
  return {idade:o.idade||7,liberadas:o.liberadas||["soma"],fatos:{},aparelhos:{},premios:{},nivelamento:null};
}
function fato(st,id){
  var f=st.fatos[id];
  if(!f)f=st.fatos[id]={s:0,n:0,diasOk:0,ultimoDiaOk:null,boas:0,rev:0,due:null,recent:[],stub:false,atingiu:false,lat:null};
  return f;
}
function estado(st,id){var f=st.fatos[id];return f?f.s:0}

/* ---------- portões ---------- */
function portoes(st){
  var c=catalogo(),r={};
  ORDEM.forEach(function(o){
    var fs=c[o].facts,firm=0;
    fs.forEach(function(f){if(estado(st,f.id)>=4)firm++});
    r[o]={firmes:firm,total:fs.length,pct:firm/fs.length};
  });
  ORDEM.forEach(function(o){
    var req=REQ[o];
    r[o].requer=req||null;
    r[o].portaoAberto=!req||(!r[req].bloqueada&&r[req].pct>=P.GATE);
    r[o].liberada=st.liberadas.indexOf(o)>=0;
    r[o].bloqueada=!r[o].portaoAberto||!r[o].liberada;
  });
  return r;
}

/* ---------- meta de tempo (até o primeiro toque, em ms) ---------- */
function metaDe(st){
  var base=st.idade<=8?P.META_6_8:P.META_9_11,c=catalogo(),lats=[];
  ORDEM.forEach(function(o){c[o].facts.forEach(function(f){var s=st.fatos[f.id];if(s&&s.s>=4&&s.lat!=null)lats.push(s.lat)})});
  if(lats.length<P.PISO_MIN_FATOS)return base;
  lats.sort(function(a,b){return a-b});
  var piso=mediana(lats.slice(0,5)),m=P.PISO_FATOR*piso+P.PISO_MARGEM;
  return Math.max(P.META_MIN,Math.min(P.META_MAX,m));
}

/* ---------- dica ---------- */
function dicaPara(f){
  if(f.stub)return "after";
  if(f.s<=2)return "before";
  if(f.s===3)return "demand";
  return "none";
}

/* ---------- sessão ---------- */
function proximoBloco(st,portoesAgora){
  var c=catalogo(),pt=portoesAgora||portoes(st),aprendendo=0;
  ORDEM.forEach(function(o){c[o].facts.forEach(function(f){var e=estado(st,f.id);if(e===1||e===2)aprendendo++})});
  if(aprendendo>=P.APRENDENDO_MAX)return [];
  for(var i=0;i<ORDEM.length;i++){
    var o=ORDEM[i];if(pt[o].bloqueada)continue;
    var pool=c[o].facts.filter(function(f){return estado(st,f.id)===0}).sort(function(a,b){return a.fam-b.fam||a.ordem-b.ordem});
    if(!pool.length)continue;
    /* Uma família por vez, na ordem. Dentro dela, sem número repetido entre os fatos do bloco quando a família permite
       (em "Somar zero" ou "×0" todos os fatos têm o mesmo número, então completa até o mínimo mesmo assim).
       Só passa para a família seguinte se a atual tem menos fatos novos do que o mínimo do bloco. */
    var bloco=[],usados={},fams=[];
    pool.forEach(function(f){if(fams.indexOf(f.fam)<0)fams.push(f.fam)});
    for(var k=0;k<fams.length&&bloco.length<P.BLOCO_MIN;k++){
      var daFam=pool.filter(function(f){return f.fam===fams[k]}),ini=bloco.length;
      daFam.forEach(function(f){
        if(bloco.length>=P.BLOCO_MAX)return;
        var meus=f.nums.filter(function(v,i){return f.nums.indexOf(v)===i});
        if(meus.some(function(v){return usados[v]}))return;
        bloco.push(f);meus.forEach(function(v){usados[v]=1});
      });
      daFam.forEach(function(f){if(bloco.length-ini<Math.min(P.BLOCO_MIN,daFam.length)&&bloco.indexOf(f)<0)bloco.push(f)});
    }
    return bloco;
  }
  return [];
}
function iniciarSessao(st,o){
  var dia=o.dia,rnd=o.rnd||Math.random,pt=portoes(st),c=catalogo();
  var vencidas=[];
  ORDEM.forEach(function(op){
    if(pt[op].bloqueada)return;
    c[op].facts.forEach(function(f){
      var s=st.fatos[f.id];
      if(s&&s.s>=1&&s.due!=null&&s.due<=dia)vencidas.push(f);
    });
  });
  vencidas.sort(function(a,b){var x=st.fatos[a.id],y=st.fatos[b.id];return (x.due-y.due)||((y.stub?1:0)-(x.stub?1:0))||(x.s-y.s)});
  var bloco=proximoBloco(st,pt);
  var vagas=Math.max(0,P.TETO_TENT-bloco.length*P.REPS_NOVO-P.REINSERCOES);
  var fila=[];
  vencidas.slice(0,vagas).forEach(function(f){fila.push({id:f.id,tipo:"revisao"})});
  bloco.forEach(function(f){fila.push({id:f.id,tipo:"novo",rep:0})});
  for(var r=1;r<P.REPS_NOVO;r++)embaralhar(bloco,rnd).forEach(function(f){fila.push({id:f.id,tipo:"novo",rep:r})});
  var aparelho=o.aparelho||"desconhecido";
  return {dia:dia,aparelho:aparelho,aparelhoNovo:(st.aparelhos[aparelho]||0)<P.APARELHO_MIN_SESSOES,meta:metaDe(st),
    fila:fila,semTarefa:fila.length===0,bloco:bloco.map(function(f){return f.id}),att:{},ordemAtt:[],n:0,ms:0,reinseridos:{}};
}
/* Próximo item da fila (com a dica que deve aparecer), ou null quando acabou ou bateu o teto. */
function proximo(st,sess){
  if(sess.n>=P.TETO_TENT||sess.ms>=P.TETO_SEG*1000||!sess.fila.length)return null;
  var it=sess.fila.shift(),f=fato(st,it.id);
  return {id:it.id,tipo:it.tipo,rep:it.rep,dica:dicaPara(f)};
}
/* a: {id, ok, t1 (ms até o primeiro toque), total (ms até confirmar), dica ('none'|'before'|'after'|'demand'), contou (bool)} */
function registrar(st,sess,a){
  var f=fato(st,a.id),dia=sess.dia;
  if(f.s===0){f.s=1;f.due=dia}
  var reg={ok:!!a.ok,t1:a.t1==null?null:a.t1,dica:a.dica||"none",contou:!!a.contou,aparelho:sess.aparelho};
  f.recent.push(reg);if(f.recent.length>10)f.recent.shift();
  var lista=sess.att[a.id]||(sess.att[a.id]=[],sess.ordemAtt.push(a.id),sess.att[a.id]);
  lista.push(reg);
  sess.n++;sess.ms+=(a.total!=null?a.total:(a.t1||0));
  if(reg.ok){
    f.n++;
    if(f.ultimoDiaOk!==dia){f.diasOk++;f.ultimoDiaOk=dia}
    if(f.s===1)f.s=2;
    if(f.s===2&&f.n>=P.CORRETAS_APRENDENDO&&f.diasOk>=P.DIAS_APRENDENDO){f.s=3;f.atingiu=true;f.boas=0}
    var limpas=f.recent.filter(function(r){return r.ok&&r.t1!=null&&!r.contou&&r.dica!=="before"}).map(function(r){return r.t1});
    f.lat=limpas.length?mediana(limpas):f.lat;
  }else if(!sess.reinseridos[a.id]&&sess.fila.length+sess.n<P.TETO_TENT){
    sess.reinseridos[a.id]=true;sess.fila.push({id:a.id,tipo:"reinsercao"});
  }
}
function concluida(sess){return !sess.fila.length||sess.n>=P.TETO_TENT||sess.ms>=P.TETO_SEG*1000}
function ehChute(sess){
  if(sess.n<P.CHUTE_MIN_TENT)return false;
  var ruins=0,total=0;
  sess.ordemAtt.forEach(function(id){sess.att[id].forEach(function(a){total++;if(!a.ok&&a.t1!=null&&a.t1<P.CHUTE_MS)ruins++})});
  return ruins/total>=P.CHUTE_FRAC;
}
function precisaRevisar(f,dia,s){
  if(s===3||s===2||s===1)f.due=dia+1;
  else if(s===4)f.due=dia+P.REVISOES[Math.min(f.rev,P.REVISOES.length-1)];
  else f.due=dia+P.MADURO;
}
function finalizarSessao(st,sess){
  var dia=sess.dia,promovidos=[],rebaixados=[],c=catalogo();
  sess.ordemAtt.forEach(function(id){
    var f=fato(st,id),atts=sess.att[id],antes=f.s;
    var errou=atts.some(function(a){return !a.ok});
    var limpa=atts.every(function(a){return !a.contou&&a.dica!=="before"});
    var tempos=atts.filter(function(a){return a.ok&&a.t1!=null}).map(function(a){return a.t1});
    var med=mediana(tempos),noTempo=med!=null&&med<=sess.meta;
    var acertoRecente=f.recent.length?f.recent.filter(function(r){return r.ok}).length/f.recent.length:0;
    if(errou){
      if(f.s>=4){f.s--;f.boas=0;f.rev=f.s===4?Math.min(f.rev,2):0;rebaixados.push(id);if(f.s<=3&&f.atingiu)f.stub=true}
      else if(f.s===3){f.boas=0;if(f.atingiu)f.stub=true}
      precisaRevisar(f,dia,f.s);
    }else if(f.s===3){
      /* "duas sessões boas seguidas": uma sessão sem erro mas lenta, com dica ou contando zera a sequência.
         Sessão em aparelho novo não conta nem zera. */
      if(!sess.aparelhoNovo){
        if(limpa&&noTempo&&acertoRecente>=P.ACERTO_MIN){
          f.boas++;
          if(f.boas>=P.SESSOES_BOAS){f.s=4;f.rev=0;f.stub=false;promovidos.push(id)}
        }else f.boas=0;
      }
      precisaRevisar(f,dia,f.s);
    }else if(f.s===4){
      if(!sess.aparelhoNovo){
        if(limpa&&noTempo){
          f.rev++;
          if(f.rev>=P.REVISOES.length){f.s=5;promovidos.push(id)}
          precisaRevisar(f,dia,f.s);
        }else f.due=dia+1;          /* revisão lenta ou com apoio: confere de novo amanhã, sem avançar o calendário */
      }else precisaRevisar(f,dia,f.s);
    }else if(f.s===5){
      precisaRevisar(f,dia,5);
    }else{
      precisaRevisar(f,dia,f.s);
    }
    if(f.s>antes&&f.s===3&&antes<3&&promovidos.indexOf(id)<0)promovidos.push(id);
  });
  st.aparelhos[sess.aparelho]=(st.aparelhos[sess.aparelho]||0)+1;
  var concl=concluida(sess),chute=ehChute(sess),premio=null;
  if(concl&&!chute&&!sess.semTarefa&&!st.premios[dia]){st.premios[dia]=1;premio={tipo:"pacote",fonte:"turbo",dia:dia}}
  return {concluida:concl,semTarefa:sess.semTarefa,chute:chute,premio:premio,promovidos:promovidos,rebaixados:rebaixados};
}

/* ---------- resumo (painel) ---------- */
function resumo(st){
  var c=catalogo(),pt=portoes(st),r={ops:{},teimosos:[],aparelhos:st.aparelhos,meta:metaDe(st)};
  ORDEM.forEach(function(o){
    var cont={0:0,1:0,2:0,3:0,4:0,5:0};
    c[o].facts.forEach(function(f){var s=st.fatos[f.id];cont[s?s.s:0]++;if(s&&s.stub)r.teimosos.push(f.id)});
    r.ops[o]={estados:cont,firmes:pt[o].firmes,total:pt[o].total,pct:pt[o].pct,bloqueada:pt[o].bloqueada,liberada:pt[o].liberada,portaoAberto:pt[o].portaoAberto};
  });
  return r;
}

/* ---------- nivelamento da primeira entrada (sondagem de fatos) ----------
   Uma sentinela por família (o primeiro fato dela). As famílias estão em ordem de dificuldade, então a sondagem é uma busca binária pela família mais alta que a criança passa.
   Nunca marca fato como dominado (no máximo consolidando) e não abre portão. */
function sentinelas(op){
  var c=catalogo(),r=[];
  c[op].facts.forEach(function(f){if(!r[f.fam])r[f.fam]=f.id});
  return r;
}
function nivelamentoInicio(op,idade){
  var n=catalogo()[op].fams.length;
  return {op:op,n:n,lo:-1,hi:n,resultados:{},itens:0,falhasSeguidas:0,
          palpite:idade<=6?Math.min(1,n-1):Math.min(Math.floor(n/2),n-1)};
}
function nivelamentoProximo(nv){
  if(nv.itens>=P.NIVELAMENTO_MAX||nv.falhasSeguidas>=2||nv.hi-nv.lo<=1)return null;
  var fam=nv.itens===0?nv.palpite:Math.floor((nv.lo+nv.hi)/2);
  if(fam<=nv.lo)fam=nv.lo+1;if(fam>=nv.hi)fam=nv.hi-1;
  return {fam:fam,id:sentinelas(nv.op)[fam]};
}
/* r: 'rapido' (acertou dentro da meta), 'lento' (acertou, passou da meta) ou 'falhou' (errou, "não sei" ou passou de 8 s) */
function nivelamentoRegistrar(nv,fam,r){
  nv.resultados[fam]=r;nv.itens++;
  if(r==="falhou"){nv.hi=Math.min(nv.hi,fam);nv.falhasSeguidas++}
  else{nv.lo=Math.max(nv.lo,fam);nv.falhasSeguidas=0}
}
function classificar(t1,ok,meta){
  if(!ok||t1==null||t1>P.NIVELAMENTO_LENTO_MS)return "falhou";
  return t1<=meta?"rapido":"lento";
}
function nivelamentoAplicar(st,nv,dia){
  var c=catalogo(),H=nv.lo,j=0;
  if(H>=0){
    c[nv.op].facts.filter(function(f){return f.fam<=H&&estado(st,f.id)===0}).forEach(function(f){
      var alvo=nv.resultados[f.fam]==="lento"?2:3,x=fato(st,f.id);
      x.s=alvo;x.atingiu=alvo===3;x.boas=0;x.due=dia+1+Math.floor(j++/P.NIVELAMENTO_POR_DIA);
    });
  }
  st.nivelamento={op:nv.op,dia:dia,resultados:nv.resultados,maisAlta:H};
  return st.nivelamento;
}

FC.turbo={P:P,ORDEM:ORDEM,REQ:REQ,catalogo:catalogo,porId:porId,rng:rng,novoAluno:novoAluno,estado:estado,fato:fato,portoes:portoes,metaDe:metaDe,
  dicaPara:dicaPara,proximoBloco:proximoBloco,iniciarSessao:iniciarSessao,proximo:proximo,registrar:registrar,concluida:concluida,ehChute:ehChute,
  finalizarSessao:finalizarSessao,resumo:resumo,
  nivelamento:{sentinelas:sentinelas,inicio:nivelamentoInicio,proximo:nivelamentoProximo,registrar:nivelamentoRegistrar,classificar:classificar,aplicar:nivelamentoAplicar}};
})(typeof window!=="undefined"?window:globalThis);
