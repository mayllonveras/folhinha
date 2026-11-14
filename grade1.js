/* Grade do 1º ano — geradores novos, escritos do zero a partir das fichas em bncc/fichas/.
   Cada gerador devolve {pre, post, a, extra?}, como os de exercicios.js, mais campos só para o app e os testes:
   - grp/cap: no máximo cap contas do mesmo grupo (por exemplo, o mesmo número) na mesma folha;
   - key: identidade da conta (quando o desenho muda mas a conta é a mesma);
   - _calc/_why: a resposta, para os testes (nunca vão para o banco).
   Por enquanto os geradores não estão ligados aos níveis do app: aparecem na aba Exercícios do /adm.
   Níveis feitos: 1 a 13 (contagem, comparação, soma e subtração até 10, problemas). */
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


/* ===================== Níveis 8 a 13: soma e subtração até 10, problemas ===================== */
var MENOS="−";
function conta(a,op,b){return a+" "+op+" "+b+" ="}
function parc(nivel,a,b){return "p"+nivel+":"+Math.min(a,b)+","+Math.max(a,b)}   /* parcelas trocadas = mesma conta na folha */
function soma(a,b,nivel,extra){var it=typed(conta(a,"+",b),a+b,extra&&extra.fig||null);it._info={op:"+",a:a,b:b};return it}
function sub(a,b,nivel,extra){var it=typed(conta(a,MENOS,b),a-b,extra&&extra.fig||null);it._info={op:"-",a:a,b:b};return it}
function lims(it,l){it.limits=l;return it}

/* Nível 8 — Somas e subtrações até 5, com figura de apoio (EF01MA06). Subtração: os últimos b emojis aparecem riscados. */
function gAte5(){
  var o=pick(OBJ),a,b;
  if(Math.random()<.5){
    a=rnd(1,4);b=rnd(1,5-a);
    return lims(soma(a,b,8,{fig:{t:"emoji",groups:[{e:o.e,n:a},{e:o.e,n:b}],per:5,side:true,sep:"+"}}),[["n8:op+",5],[parc(8,a,b),1]]);
  }
  a=rnd(2,5);b=rnd(1,a-1);
  return lims(sub(a,b,8,{fig:{t:"emoji",groups:[{e:o.e,n:a,x:b}],per:5}}),[["n8:op-",5]]);
}

/* Nível 9 — Somar e tirar de 1 a 3, com números até 10, só com números (EF01MA06). */
function gUmATres(){
  var k=rnd(1,3),a;
  if(Math.random()<.5){
    a=rnd(1,10-k);
    var it=Math.random()<.5?soma(a,k,9):soma(k,a,9);
    return lims(it,[["n9:op+",5],[parc(9,a,k),1]]);
  }
  a=rnd(k+1,10);
  return lims(sub(a,k,9),[["n9:op-",5]]);
}

/* Nível 10 — Somas até 10 (EF01MA06): parcelas de 1 a 9, soma até 10. 20% dão exatamente 10. Parcela 1 no máximo 3 por folha;
   parcela 2 ou 3 no máximo 4 por folha (já foram treinadas no nível 9). */
function par10(){
  var a=rnd(1,9),b;
  if(Math.random()<.2)b=10-a;else b=rnd(1,10-a);
  return [a,b];
}
function classe10(a,b){var m=Math.min(a,b);return m===1?"um":m<=3?"dois3":"grande"}
function gSomaAte10(){
  var p=par10(),a=p[0],b=p[1],c=classe10(a,b),l=[[parc(10,a,b),1]];
  if(c==="um")l.push(["n10:um",3]);else if(c==="dois3")l.push(["n10:dois3",4]);
  return lims(soma(a,b,10),l);
}

/* Nível 11 — Subtrações até 10 (EF01MA06): a até 10, b menor que a (nunca dá zero). b de 1 a 3 no máximo 3 por folha;
   a de 6 a 10 em cerca de 60%; 10 − b em cerca de 2 por folha. */
function gSubAte10(){
  var a,b,r=Math.random();
  if(r<.2){a=10;b=rnd(1,9)}
  else if(r<.62){a=rnd(6,10);b=rnd(1,a-1)}
  else{a=rnd(2,5);b=rnd(1,a-1)}
  var l=[];if(b<=3)l.push(["n11:b13",3]);
  return lims(sub(a,b,11),l);
}

/* Nível 12 — Somas e subtrações até 10, misturadas, 5 de cada por folha (EF01MA06, EF01MA08). */
function gMistoAte10(){
  if(Math.random()<.5){
    var p=par10(),a=p[0],b=p[1],c=classe10(a,b),l=[["n12:op+",5],[parc(12,a,b),1]];
    if(c==="um")l.push(["n12:um",3]);else if(c==="dois3")l.push(["n12:dois3",4]);
    return lims(soma(a,b,12),l);
  }
  var a2,b2,r=Math.random();
  if(r<.2){a2=10;b2=rnd(1,9)}else if(r<.62){a2=rnd(6,10);b2=rnd(1,a2-1)}else{a2=rnd(2,5);b2=rnd(1,a2-1)}
  var l2=[["n12:op-",5]];if(b2<=3)l2.push(["n12:b13",3]);
  return lims(sub(a2,b2,12),l2);
}

/* Nível 13 — Problemas de juntar, acrescentar, separar e retirar, até 10, com figura (EF01MA08). */
var PROB={"🍎":["maçã","maçãs",1],"🐟":["peixe","peixes",0],"⭐":["estrela","estrelas",1],"🎈":["balão","balões",0],"🐶":["cachorro","cachorros",0],
  "🌼":["flor","flores",1],"⚽":["bola","bolas",1],"🍪":["biscoito","biscoitos",0],"🚗":["carro","carros",0],"🐥":["pintinho","pintinhos",0]};
var DAR=["⚽","🍎","🍪","🎈","🌼","⭐"],SAIR=["🐥","🐟","🐶","🚗","🎈"];
function sq(n,e){var o=PROB[e];return n+" "+(n===1?o[0]:o[1])}
function pl(e){return PROB[e][1]}
function qs(e){return PROB[e][2]?"Quantas ":"Quantos "}
function ele(n){return n[1]==="f"?"Ela":"Ele"}
function gProblema(maxTotal){
  return function(){
    var tipo=pick(["juntar","acrescentar","separar","retirar"]),s=rnd(3,maxTotal),a,b,e,it,n1=pick(NAMES),n2,fig,pre,l=[];
    if(tipo==="juntar"||tipo==="acrescentar"){
      a=rnd(1,s-1);b=s-a;e=pick(Object.keys(PROB));
      if(tipo==="juntar"){
        do{n2=pick(NAMES)}while(n2[0]===n1[0]);
        var elas=n1[1]==="f"&&n2[1]==="f";
        pre=n1[0]+" tem "+sq(a,e)+" e "+n2[0]+" tem "+sq(b,e)+". "+qs(e)+pl(e)+" "+(elas?"elas":"eles")+" têm "+(elas?"juntas":"juntos")+"?";
        l.push(["nome:"+n1[0],1],["nome:"+n2[0],1]);
      }else{
        pre="Havia "+sq(a,e)+". "+(b===1?"Chegou ":"Chegaram ")+b+". "+qs(e)+pl(e)+" há agora?";
      }
      fig={t:"emoji",groups:[{e:e,n:a},{e:e,n:b}],per:5,side:true,sep:"+"};
      it=typed(pre,s,fig);it._info={tipo:tipo,a:a,b:b};
    }else{
      b=rnd(1,s-1);a=s;
      if(tipo==="separar"){
        e=pick(DAR);
        pre=n1[0]+" tinha "+sq(a,e)+". "+ele(n1)+" deu "+b+" para um amigo. "+qs(e)+pl(e)+" sobraram?";
        l.push(["nome:"+n1[0],1]);
      }else{
        e=pick(SAIR);
        pre="Havia "+sq(a,e)+". "+(b===1?"Foi":"Foram")+" embora "+b+". "+qs(e)+pl(e)+" ficaram?";
      }
      fig={t:"emoji",groups:[{e:e,n:a}],per:5};
      it=typed(pre,a-b,fig);it._info={tipo:tipo,a:a,b:b};
    }
    it.key=tipo+"|"+a+"|"+b+"|"+e;
    it.limits=l;
    return it;
  };
}

FC.G1=[
  {nivel:1,id:"g1n01",nome:"Nível 1 — Contar objetos até 10",hab:["EF01MA02"],meta:90,gen:gContar10},
  {nivel:2,id:"g1n02",nome:"Nível 2 — Mais, menos ou igual",hab:["EF01MA03"],meta:100,gen:gComparar},
  {nivel:3,id:"g1n03",nome:"Nível 3 — Sequências numéricas até 20",hab:["EF01MA10","EF01MA01"],meta:90,gen:gSequencia},
  {nivel:4,id:"g1n04",nome:"Nível 4 — Contar objetos até 20",hab:["EF01MA02","EF01MA04"],meta:110,gen:gContar20},
  {nivel:5,id:"g1n05",nome:"Nível 5 — Contar objetos soltos até 20",hab:["EF01MA02","EF01MA04"],meta:120,gen:gSolto},
  {nivel:6,id:"g1n06",nome:"Nível 6 — Antes, depois e posição na fila",hab:["EF01MA01","EF01MA05"],meta:100,gen:gOrdem},
  {nivel:7,id:"g1n07",nome:"Nível 7 — Maior e menor até 20",hab:["EF01MA05"],meta:90,gen:gMaiorMenor},
  {nivel:8,id:"g1n08",nome:"Nível 8 — Somas e subtrações até 5",hab:["EF01MA06"],meta:80,gen:gAte5},
  {nivel:9,id:"g1n09",nome:"Nível 9 — Somar e tirar de 1 a 3, até 10",hab:["EF01MA06"],meta:80,gen:gUmATres},
  {nivel:10,id:"g1n10",nome:"Nível 10 — Somas até 10",hab:["EF01MA06"],meta:90,gen:gSomaAte10},
  {nivel:11,id:"g1n11",nome:"Nível 11 — Subtrações até 10",hab:["EF01MA06"],meta:100,gen:gSubAte10},
  {nivel:12,id:"g1n12",nome:"Nível 12 — Somas e subtrações até 10",hab:["EF01MA06","EF01MA08"],meta:100,gen:gMistoAte10},
  {nivel:13,id:"g1n13",nome:"Nível 13 — Problemas de juntar e tirar, até 10",hab:["EF01MA08"],meta:120,gen:gProblema(10)}
];
FC.G1BY={};FC.G1.forEach(function(e){FC.G1BY[e.id]=e});
})();
