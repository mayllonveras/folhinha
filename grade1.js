/* Grade do 1º ano — geradores novos, escritos do zero a partir das fichas em bncc/fichas/.
   Cada gerador devolve {pre, post, a, extra?}, como os de exercicios.js, mais campos só para o app e os testes:
   - grp/cap: no máximo cap contas do mesmo grupo (por exemplo, o mesmo número) na mesma folha;
   - key: identidade da conta (quando o desenho muda mas a conta é a mesma);
   - _calc/_why: a resposta, para os testes (nunca vão para o banco).
   Por enquanto os geradores não estão ligados aos níveis do app: aparecem na aba Exercícios do /adm.
   Níveis feitos: 1 a 7 (contagem e comparação). */
(function(){
"use strict";
var FC=window.FC,X=FC.exh,rnd=X.rnd,pick=X.pick,choice=X.choice,typed=X.typed,OBJ=X.OBJ,NAMES=X.NAMES;

function quantos(o){return o.f?"Quantas ":"Quantos "}
function outro(o){var q;do{q=pick(OBJ)}while(q.e===o.e);return q}
/* Em "grupo" o número fica no máximo 2 vezes por folha (ficha dos níveis 1, 4 e 5). */
function limite(it,nivel,n){it.grp="n"+nivel+":"+n;it.cap=2;return it}

/* Nível 1 — Contar objetos até 10, em fileiras de 5 (EF01MA02). */
function gContar10(){
  var n=rnd(1,10),o=pick(OBJ);
  return limite(typed(quantos(o)+o.pl+" têm aqui?",n,{t:"emoji",groups:[{e:o.e,n:n}],per:5}),1,n);
}

/* Nível 2 — Mais, menos ou igual (EF01MA03). Dois grupos lado a lado; 3 opções. */
function gComparar(){
  var o1=pick(OBJ),o2=outro(o1),r=Math.random(),d=r<.25?0:r<.5?1:rnd(2,4);
  var big=rnd(1+d,10),small=big-d,n1=big,n2=small;
  if(Math.random()<.5){n1=small;n2=big}
  var mais=Math.random()<.5,igual="a mesma quantidade",certa;
  if(d===0)certa=igual;else if(mais)certa=n1>n2?o1.e:o2.e;else certa=n1<n2?o1.e:o2.e;
  var wr=[o1.e,o2.e,igual].filter(function(x){return x!==certa});
  var it=choice(mais?"Onde tem mais?":"Onde tem menos?",certa,wr,{t:"emoji",groups:[{e:o1.e,n:n1},{e:o2.e,n:n2}],per:5,side:true});
  it._info={n1:n1,n2:n2,mais:mais};
  return it;
}

/* Nível 3 — Sequências de 1 em 1 até 20 (EF01MA10, EF01MA01). O número que falta fica no meio da fila. */
function gSequencia(){
  var sobe=Math.random()<.7,s=sobe?rnd(1,16):rnd(5,20),v=[],i;
  for(i=0;i<5;i++)v.push(sobe?s+i:s-i);
  var k=rnd(1,3),a=v[k];
  var it=typed("Complete a fila: "+v.slice(0,k).join("  "),a,null,v.slice(k+1).join("  "));
  it._info={fila:v,k:k};
  return it;
}

/* Nível 4 — Contar objetos até 20, em fileiras de 5 (EF01MA02, EF01MA04). 80% de 11 a 20 e 20% de 6 a 10. */
function gContar20(){
  var n=Math.random()<.8?rnd(11,20):rnd(6,10),o=pick(OBJ);
  return limite(typed(quantos(o)+o.pl+" têm aqui?",n,{t:"emoji",groups:[{e:o.e,n:n}],per:5}),4,n);
}

/* Nível 5 — Contar objetos soltos até 20 (EF01MA02, EF01MA04). Cada objeto cai numa célula de uma grade
   invisível de 6 x 4 (célula de 50 x 50 pontos) com um desvio de até 8 pontos: nunca se tocam e nunca saem da caixa. */
function gSolto(){
  var n=Math.random()<.7?rnd(11,20):rnd(6,10),o=pick(OBJ),cel=[],i,j,pts=[];
  for(i=0;i<24;i++)cel.push(i);
  for(i=cel.length-1;i>0;i--){j=rnd(0,i);var t=cel[i];cel[i]=cel[j];cel[j]=t}
  cel.slice(0,n).forEach(function(c){pts.push([25+(c%6)*50+rnd(-8,8),25+Math.floor(c/6)*50+rnd(-8,8)])});
  var it=typed(quantos(o)+o.pl+" têm aqui?",n,{t:"scatter",e:o.e,pts:pts});
  it.key="solto|"+o.e+"|"+n;                    /* o desenho muda a cada sorteio, mas a conta é a mesma */
  return limite(it,5,n);
}

/* Nível 6 — Antes, depois, entre e posição na fila (EF01MA01, EF01MA05). */
function gOrdem(){
  var r=Math.random(),it,n,p,nome,f;
  if(r<.4){                                       /* antes ou depois, de 1 a 20 */
    var depois=Math.random()<.5;n=depois?rnd(1,19):rnd(2,20);
    return typed("Que número vem "+(depois?"depois":"antes")+" do "+n+"?",depois?n+1:n-1);
  }
  if(r<.6){                                       /* entre */
    n=rnd(1,18);
    return typed("Que número está entre o "+n+" e o "+(n+2)+"?",n+1);
  }
  nome=pick(NAMES);f=nome[1]==="f";
  if(Math.random()<.6){                            /* quantas crianças estão na frente */
    p=rnd(2,10);
    it=typed(nome[0]+" é "+(f?"a "+p+"ª":"o "+p+"º")+" da fila. Quantas crianças estão na frente "+(f?"dela":"dele")+"?",p-1);
    it.key="fila|"+p;
  }else{                                          /* o inverso: em que posição está */
    var m=rnd(1,9);
    it=typed("Tem "+m+" "+(m===1?"criança":"crianças")+" na frente "+(f?"da ":"do ")+nome[0]+". "+(f?"A ":"O ")+nome[0]+" é "+(f?"a":"o")+" que posição?",m+1);
    it.key="filai|"+m;
  }
  it.grp="n6:"+nome[0];it.cap=1;                   /* o mesmo nome no máximo uma vez por folha */
  return it;
}

/* Nível 7 — Maior e menor até 20, com 3 opções (EF01MA05). 30% das contas com números próximos,
   40% com números de um e de dois algarismos juntos. */
function gMaiorMenor(){
  var maior=Math.random()<.5,r=Math.random(),v,ord,ok,t=0;
  do{
    var x=rnd(1,20),y=rnd(1,20),z=rnd(1,20);v=[x,y,z];
    ok=x!==y&&y!==z&&x!==z;
    if(ok){
      ord=v.slice().sort(function(a,b){return a-b});
      if(r<.3){ok=maior?ord[2]-ord[1]<=2:ord[1]-ord[0]<=2}
      else if(r<.7){ok=ord[0]<10&&ord[2]>=10}
    }
  }while(!ok&&t++<500);
  if(!ok){v=[6,12,9];ord=[6,9,12]}
  var certa=maior?ord[2]:ord[0];
  var it=choice("Qual é o "+(maior?"maior":"menor")+" número?",String(certa),v.filter(function(n){return n!==certa}).map(String),null);
  it._info={v:v,maior:maior};
  return it;
}

FC.G1=[
  {nivel:1,id:"g1n01",nome:"Nível 1 — Contar objetos até 10",hab:["EF01MA02"],meta:90,gen:gContar10},
  {nivel:2,id:"g1n02",nome:"Nível 2 — Mais, menos ou igual",hab:["EF01MA03"],meta:100,gen:gComparar},
  {nivel:3,id:"g1n03",nome:"Nível 3 — Sequências numéricas até 20",hab:["EF01MA10","EF01MA01"],meta:90,gen:gSequencia},
  {nivel:4,id:"g1n04",nome:"Nível 4 — Contar objetos até 20",hab:["EF01MA02","EF01MA04"],meta:110,gen:gContar20},
  {nivel:5,id:"g1n05",nome:"Nível 5 — Contar objetos soltos até 20",hab:["EF01MA02","EF01MA04"],meta:120,gen:gSolto},
  {nivel:6,id:"g1n06",nome:"Nível 6 — Antes, depois e posição na fila",hab:["EF01MA01","EF01MA05"],meta:100,gen:gOrdem},
  {nivel:7,id:"g1n07",nome:"Nível 7 — Maior e menor até 20",hab:["EF01MA05"],meta:90,gen:gMaiorMenor}
];
FC.G1BY={};FC.G1.forEach(function(e){FC.G1BY[e.id]=e});
})();
