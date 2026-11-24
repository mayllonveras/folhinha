/* Grade do 1º ano — geradores novos, escritos do zero a partir das fichas em bncc/fichas/.
   Cada gerador devolve {pre, post, a, extra?}, como os de exercicios.js, mais campos só para o app e os testes:
   - grp/cap: no máximo cap contas do mesmo grupo (por exemplo, o mesmo número) na mesma folha;
   - key: identidade da conta (quando o desenho muda mas a conta é a mesma);
   - _calc/_why: a resposta, para os testes (nunca vão para o banco).
   Por enquanto os geradores não estão ligados aos níveis do app: aparecem na aba Exercícios do /adm.
   Níveis feitos: 1 a 35, a grade inteira do 1º ano (contagem, comparação, soma e subtração até 10, problemas, formas, sólidos, posição, atributos, dezena mais um). */
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
/* As 45 somas ordenadas até 10, agrupadas pela menor parcela: 1 ("um"), 2 ou 3 ("dois3") e 4 ou mais ("grande").
   Sorteia a classe antes (35%, 40%, 25%) para a folha conseguir se encher respeitando os limites de cada classe. */
var PARES10={um:[],dois3:[],grande:[]};
(function(){for(var a=1;a<=9;a++)for(var b=1;a+b<=10;b++){var m=Math.min(a,b);PARES10[m===1?"um":m<=3?"dois3":"grande"].push([a,b])}})();
function par10(){
  var r=Math.random(),c=r<.35?"um":r<.75?"dois3":"grande";
  return pick(PARES10[c]);
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
function uni(n){return n%10}
/* Pares (a, b) de um problema de soma ou de subtração dentro dos limites do nível. pCruza (níveis acima de 10): fração de problemas
   em que a conta passa da dezena (soma de dois números de um algarismo; subtração em que b é maior que a unidade de a). */
function parSoma(lo,hi,pCruza){
  var s,a,b;
  if(pCruza===undefined){s=rnd(lo,hi);a=rnd(1,s-1);return [a,s-a]}
  if(Math.random()<pCruza){a=rnd(2,9);b=rnd(Math.max(2,11-a),9);return [a,b]}
  var x=rnd(10,18),u=uni(x);b=rnd(1,9-u);return Math.random()<.5?[x,b]:[b,x];
}
function parSub(lo,hi,pCruza){
  var s,b,u;
  if(pCruza===undefined){s=rnd(lo,hi);b=rnd(1,s-1);return [s,b]}
  var t=0;
  do{
    s=rnd(lo,hi);u=uni(s);
    if(Math.random()<pCruza){if(u>=9)continue;b=rnd(u+1,9);return [s,b]}
    if(u>=1){b=rnd(1,u);return [s,b]}
  }while(t++<200);
  return [15,7];
}
function gProblema(lo,hi,pCruza){
  return function(){
    var tipo=pick(["juntar","acrescentar","separar","retirar"]),a,b,e,it,n1=pick(NAMES),n2,fig,pre,l=[],s;
    if(tipo==="juntar"||tipo==="acrescentar"){
      var pr=parSoma(lo,hi,pCruza);a=pr[0];b=pr[1];s=a+b;e=pick(Object.keys(PROB));
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
      var ps=parSub(lo,hi,pCruza);a=ps[0];b=ps[1];
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

/* ===================== Níveis 14 a 18: formas, sólidos, posição, atributos e padrões, dezena mais um ===================== */
var FORMAS4=["círculo","quadrado","retângulo","triângulo"];
var COR_FIG=["#2457D6","#FFB92B","#F27AB0","#1CA97B"];      /* azul, amarelo, rosa e verde: diferem também em luminosidade */
function sortearCor(){return pick(COR_FIG)}
/* Figura plana com as variações da ficha: retângulo deitado ou em pé (proporção 1,4 a 2,5); triângulo de 5 formatos em 4 posições. */
function formaFig(n,cor){
  var f={t:"forma",n:n,color:cor};
  if(n==="retângulo"){f.o=pick(["h","v"]);f.r=+(1.4+Math.random()*1.1).toFixed(2)}
  if(n==="triângulo"){f.v=rnd(0,4);f.rot=pick([0,90,180,270])}
  return f;
}
function idForma(f){return f.n+(f.n==="retângulo"?f.o:f.n==="triângulo"?f.v+"."+f.rot:"")}

/* Nível 14 — Figuras planas (EF01MA14): o nome da figura, ou qual destas figuras é um X.
   Todo quadrado é também retângulo: com um quadrado na figura, "retângulo" não é opção; e "qual é um retângulo?" nunca tem um quadrado. */
function gFormas(){
  var n=pick(FORMAS4),cor=sortearCor();
  if(Math.random()<.5){
    var f=formaFig(n,cor),wr=FORMAS4.filter(function(x){return x!==n&&!(n==="quadrado"&&x==="retângulo")});
    var it=choice("Como se chama esta figura?",n,wr,f);
    it.key="forma1|"+idForma(f);it.limits=[["n14:t1",5]];
    return it;
  }
  var outros=FORMAS4.filter(function(x){return x!==n&&!(n==="retângulo"&&x==="quadrado")});
  var c=formaFig(n,cor),w=outros.map(function(x){return {fig:formaFig(x,cor)}});
  var it2=choice("Qual destas figuras é um "+n+"?",{fig:c},w,null);
  it2.key="forma2|"+n+"|"+outros.join(",")+"|"+idForma(c);it2.limits=[["n14:t2",5]];
  return it2;
}

/* Nível 15 — Sólidos e objetos (EF01MA13, faces: EF01MA14). Sem cubo e sem pirâmide. */
var SOL={
  "esfera":{art:"uma esfera",obj:["⚽","🏀","🌍"],txt:["uma bola de futebol","uma bola de basquete","o globo terrestre"]},
  "cilindro":{art:"um cilindro",obj:["🥫",{fig:{t:"obj",k:"lata"}},{fig:{t:"obj",k:"tubo"}},{fig:{t:"obj",k:"vela"}}],txt:["uma lata de leite","uma vela","um tubo de cola"]},
  "bloco retangular":{art:"um bloco retangular",obj:["📦","🧱",{fig:{t:"obj",k:"caixa"}}],txt:["uma caixa de sapato","um tijolo"]},
  "cone":{art:"um cone",obj:[{fig:{t:"hat"}}],txt:["um chapéu de festa","uma casquinha de sorvete"]}
};
var SOLIDOS=Object.keys(SOL);
var FACES=[["A tampa de uma lata","círculo"],["A tampa de um tubo","círculo"],["A face de uma caixa de sapato","retângulo"],["A face maior de um tijolo","retângulo"]];
function cap1(t){return t.charAt(0).toUpperCase()+t.slice(1)}
function gSolidos(){
  var r=Math.random(),n=pick(SOLIDOS),it;
  if(r<.4){                                        /* objeto → sólido */
    var certa=pick(SOL[n].obj),wr=SOLIDOS.filter(function(x){return x!==n}).map(function(x){return pick(SOL[x].obj)});
    it=choice("Qual objeto tem a forma de "+SOL[n].art+"?",certa,wr,null);it.limits=[["n15:t1",4]];
  }else if(r<.7){                                  /* desenho do sólido → nome */
    it=choice("Como se chama este sólido?",n,SOLIDOS.filter(function(x){return x!==n}),{t:"solid",n:n});it.limits=[["n15:t2",3]];
  }else if(r<.9){                                  /* objeto por escrito → nome do sólido */
    var tx=pick(SOL[n].txt);
    it=choice(cap1(tx)+" tem a forma de qual sólido?",n,SOLIDOS.filter(function(x){return x!==n}),null);it.key="solt|"+tx;it.limits=[["n15:t3",2]];
  }else{                                           /* face do sólido → figura plana */
    var fc=pick(FACES),resp=fc[1],wr2=FORMAS4.filter(function(x){return x!==resp&&!(resp==="retângulo"&&x==="quadrado")});
    it=choice(fc[0]+" tem a forma de qual figura?",resp,wr2,null);it.key="face|"+fc[0];it.limits=[["n15:t4",1]];
  }
  return it;
}

/* Nível 16 — Esquerda, direita, em cima e embaixo (EF01MA11, EF01MA12). Só emojis frontais (nada que olhe para um lado). */
var POS=[{e:"🍎",n:"maçã",f:1},{e:"⚽",n:"bola",f:1},{e:"⭐",n:"estrela",f:1},{e:"🌼",n:"flor",f:1},{e:"🎈",n:"balão"},{e:"🍪",n:"biscoito"},{e:"🐶",n:"cachorro"},{e:"🐱",n:"gato"}];
function embaralhar(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(0,i),t=a[i];a[i]=a[j];a[j]=t}return a}
function gPosicao(){
  var r=Math.random(),it,ps,ref,viz,i;
  if(r<.4){                                        /* fileira: quem está logo à direita/esquerda */
    var len=rnd(3,5);ps=embaralhar(POS).slice(0,len);i=rnd(1,len-2);ref=ps[i];
    var dir=Math.random()<.5;viz=ps[dir?i+1:i-1];
    var wr=ps.filter(function(x){return x!==viz}).map(function(x){return x.e});
    it=choice("Quem está logo à "+(dir?"direita ":"esquerda ")+(ref.f?"da ":"do ")+ref.n+"?",viz.e,wr,{t:"fila",items:ps.map(function(x){return x.e}),dir:"h"});
    it._info={tipo:"h",itens:ps.map(function(x){return x.e}),ref:ref.e,dir:dir?"direita":"esquerda"};
  }else if(r<.7){                                  /* coluna de 3: em cima / embaixo */
    ps=embaralhar(POS).slice(0,3);ref=ps[1];var cima=Math.random()<.5;viz=ps[cima?0:2];
    it=choice("Quem está "+(cima?"em cima ":"embaixo ")+(ref.f?"da ":"do ")+ref.n+"?",viz.e,ps.filter(function(x){return x!==viz}).map(function(x){return x.e}),{t:"fila",items:ps.map(function(x){return x.e}),dir:"v"});
    it._info={tipo:"v",itens:ps.map(function(x){return x.e}),ref:ref.e,dir:cima?"cima":"baixo"};
  }else{                                           /* uma caixa com um objeto: onde está? */
    var o=pick(POS),pos=pick(["esq","dir","meio","cima"]),TX={esq:"à esquerda",dir:"à direita",meio:"no meio",cima:"em cima"};
    it=choice("Onde está "+(o.f?"a ":"o ")+o.n+" na caixa?",TX[pos],Object.keys(TX).filter(function(k){return k!==pos}).map(function(k){return TX[k]}),{t:"caixa",e:o.e,pos:pos});
    it._info={tipo:"caixa",pos:pos};
  }
  return it;
}

/* Nível 17 — Organizar por atributos e padrões de figuras (EF01MA09, EF01MA10). */
var SH17=["círculo","quadrado","triângulo"];
function fig17(n,cor,s){var f={t:"forma",n:n,color:cor,s:s};if(n==="triângulo"){f.v=0;f.rot=0}return f}
function gAtributos(){
  var r=Math.random(),it;
  if(r<.4){                                        /* qual não combina: só um atributo varia, e só uma figura é diferente */
    var attr=pick(["cor","forma","tamanho"]),sh=pick(SH17),co=sortearCor(),sz=pick([.55,1]);
    var x,y;
    if(attr==="cor"){x=co;do{y=sortearCor()}while(y===x)}
    else if(attr==="forma"){x=sh;do{y=pick(SH17)}while(y===x)}
    else{x=sz;y=sz===1?.55:1}
    function fg(v,k){var f=fig17(attr==="forma"?v:sh,attr==="cor"?v:co,attr==="tamanho"?v:sz);f.k=k;return {fig:f}}
    var ids=embaralhar([1,2,3,4]),igual=[fg(x,ids[0]),fg(x,ids[1]),fg(x,ids[2])],dif=fg(y,ids[3]);
    it=choice("Qual figura não combina com as outras?",dif,igual,null);
    it.key="nc|"+attr+"|"+x+"|"+y+"|"+sh+"|"+co+"|"+sz;it.limits=[["n17:t1",4]];it._info={attr:attr};
  }else if(r<.6){                                  /* a maior ou a menor entre 3 */
    var s0,s1,s2,t=0;
    do{s0=pick([.35,.4,.45]);s1=+(s0*(1.45+Math.random()*.25)).toFixed(2);s2=+(s1*(1.45+Math.random()*.2)).toFixed(2)}while(s2>1&&t++<200);
    var f3=pick(SH17),c3=sortearCor(),maior=Math.random()<.5,tam=embaralhar([s0,s1,s2]);
    var opts=tam.map(function(sz){return {fig:fig17(f3,c3,sz)}}),certa=opts.filter(function(o){return o.fig.s===(maior?s2:s0)})[0];
    it=choice("Qual é a figura mais "+(maior?"grande":"pequena")+"?",certa,opts.filter(function(o){return o!==certa}),null);
    it.key="tam|"+f3+"|"+c3+"|"+s0+","+s1+","+s2+"|"+maior;it.limits=[["n17:t2",2]];
  }else{                                           /* padrão: qual vem depois? (dois períodos completos e o começo do terceiro) */
    var pad=pick(["AB","AAB","ABC"]),combos=[],t2=0;
    while(combos.length<(pad==="ABC"?3:2)&&t2++<200){var cb=[pick(SH17),sortearCor()];if(!combos.some(function(c){return c[0]===cb[0]&&c[1]===cb[1]}))combos.push(cb)}
    var seq=[],ix={A:0,B:1,C:2},tot=pad.length*2+1;
    for(var i=0;i<tot;i++)seq.push(combos[ix[pad[i%pad.length]]]);
    var prox=combos[ix[pad[tot%pad.length]]];
    var fa=function(c){return {fig:fig17(c[0],c[1],.9)}};
    var wrongs=combos.filter(function(c){return c!==prox}).map(fa);
    while(wrongs.length<2){var nv=[pick(SH17),sortearCor()];if(!(nv[0]===prox[0]&&nv[1]===prox[1])&&!wrongs.some(function(w){return w.fig.n===nv[0]&&w.fig.color===nv[1]}))wrongs.push(fa(nv))}
    wrongs=wrongs.slice(0,2);
    it=choice("Qual figura vem depois?",fa(prox),wrongs,{t:"fila",items:seq.map(fa),q:true,dir:"h"});
    it.key="pad|"+pad+"|"+combos.map(function(c){return c.join(":")}).join(",");it.limits=[["n17:t3",4]];it._info={pad:pad};
  }
  return it;
}

/* Nível 18 — Dezena mais um número (EF01MA06, EF01MA07): 10 + 4, 4 + 10, 14 − 4, 14 − 10. */
function gDezenaMais(){
  var n=rnd(1,9);
  if(Math.random()<.5){
    var it=Math.random()<.5?soma(10,n,18):soma(n,10,18);
    return lims(it,[["n18:op+",5],[parc(18,10,n),1]]);
  }
  var it2=Math.random()<.5?sub(10+n,n,18):sub(10+n,10,18);
  return lims(it2,[["n18:op-",5]]);
}


/* ===================== Níveis 19 a 24: somas e subtrações até 20, problemas até 20 ===================== */
/* Famílias de contas (fichas 19 a 22). vinte = a conta chega a 20 (soma) ou tira de 20 (subtração): no máximo 1 por folha. */
function ordem(a,b){return Math.random()<.5?[a,b]:[b,a]}
function famSomaSemPassar(){var a=rnd(11,18),b=rnd(1,9-uni(a)),o=ordem(a,b);return {op:"+",x:o[0],y:o[1],vinte:false}}
function famSomaPassando(){
  if(Math.random()<.15){var a=rnd(11,19),o=ordem(a,20-a);return {op:"+",x:o[0],y:o[1],vinte:true}}
  var a2=rnd(2,9),b2=rnd(Math.max(2,11-a2),9);return {op:"+",x:a2,y:b2,vinte:false};
}
function famSubSemPassar(){var a=rnd(12,19);return {op:"-",x:a,y:rnd(1,uni(a)-1),vinte:false}}
function famSubPassando(){
  if(Math.random()<.15)return {op:"-",x:20,y:rnd(1,9),vinte:true};
  var a=rnd(11,18);return {op:"-",x:a,y:rnd(uni(a)+1,9),vinte:false};
}
function daFamilia(f,nivel,limitesBase){
  var it=f.op==="+"?soma(f.x,f.y,nivel):sub(f.x,f.y,nivel),l=limitesBase.slice();
  if(f.op==="+")l.push([parc(nivel,f.x,f.y),1]);
  it.limits=l;return it;
}
function gSomaSem19(){var f=famSomaSemPassar();return daFamilia(f,19,[])}
function gSomaPass20(){var f=famSomaPassando();return daFamilia(f,20,f.vinte?[["n20:vinte",1]]:[])}
function gSubSem21(){var f=famSubSemPassar();return daFamilia(f,21,[])}
function gSubPass22(){var f=famSubPassando();return daFamilia(f,22,f.vinte?[["n22:vinte",1]]:[])}
/* Nível 23 — as quatro famílias misturadas: 2 de cada por folha (das 8 contas do nível), 1 "vinte" no máximo. */
function gMisto20(){
  var k=rnd(1,4),f=k===1?famSomaSemPassar():k===2?famSomaPassando():k===3?famSubSemPassar():famSubPassando();
  var it=daFamilia(f,23,[["n23:f"+k,2]]);
  if(f.vinte)it.limits.push(["n23:vinte",1]);
  it._info={fam:k,vinte:f.vinte,op:f.op,a:f.x,b:f.y};
  return it;
}


/* ===================== Níveis 25 a 29: dezenas e números até 100 ===================== */
function numTexto(n){return String(n)}
/* Nível 25 — Dezenas e unidades com barras e quadradinhos (EF01MA07, EF01MA04). 3 tipos: valor da figura, dezenas, unidades. */
function gBarras(){
  var r=Math.random(),t=rnd(1,9),o,it;
  if(r<.625){
    o=(t>=2&&Math.random()<.15)?0:rnd(1,9);
    it=typed("Cada barra vale 10 e cada quadradinho vale 1. Quanto vale tudo junto?",t*10+o,{t:"base10",tens:t,ones:o});
    it.limits=[["n25:t1",7]];
  }else if(r<.875){
    o=rnd(1,9);
    it=typed("O número "+(t*10+o)+" é formado por quantas barras de 10?",t,{t:"base10",tens:t,ones:o});
    it.limits=[["n25:t2",3]];
  }else{
    o=rnd(1,9);
    it=typed("O número "+(t*10+o)+" tem quantos quadradinhos soltos?",o,{t:"base10",tens:t,ones:o});
    it.limits=[["n25:t3",2]];
  }
  return it;
}

/* Nível 26 — Contar até 100, em pacotes de 10 e soltos (EF01MA04). 21 a 100; 20% só de pacotes. */
function gPacotes(){
  var o=pick(OBJ),k,r,n;
  if(Math.random()<.2){k=rnd(3,10);r=0}else{k=rnd(2,9);r=rnd(1,9)}
  n=k*10+r;
  var it=typed(quantos(o)+o.pl+" têm aqui?",n,{t:"pacotes",e:o.e,packs:k,loose:r});
  it.key="pac|"+o.e+"|"+n;
  return limite(it,26,n);
}

/* Nível 27 — Maior e menor até 99, com 3 opções (EF01MA05). 50% com dezenas diferentes e bem separadas, 40% com dois números
   da mesma dezena, 10% com um par de algarismos trocados (34 e 43), no máximo 1 por folha. */
function trio27(){
  var r=Math.random(),v,t=0;
  if(r<.5){
    do{var a=rnd(1,9),b=rnd(1,9),c=rnd(1,9),d=[a,b,c].sort(function(x,y){return x-y});v=d[1]-d[0]>=2&&d[2]-d[1]>=2?[a*10+rnd(0,9),b*10+rnd(0,9),c*10+rnd(0,9)]:null}while(!v&&t++<500);
    return {v:v||[23,61,87],modo:"sep"};
  }
  if(r<.9){
    do{var t1=rnd(1,9),u1=rnd(0,9),u2=rnd(0,9),t3=rnd(1,9)}while((u1===u2||t3===t1)&&t++<500);
    return {v:[t1*10+u1,t1*10+u2,t3*10+rnd(0,9)],modo:"mesma"};
  }
  var x=rnd(1,9),y=rnd(1,9),z;while(y===x)y=rnd(1,9);
  do{z=rnd(10,99)}while(z===x*10+y||z===y*10+x);
  return {v:[x*10+y,y*10+x,z],modo:"troca"};
}
function gMaiorMenor99(){
  var tr,ok,tt=0;
  do{tr=trio27();ok=new Set(tr.v).size===3}while(!ok&&tt++<500);
  var v=tr.v,maior=Math.random()<.5,mx=Math.max.apply(null,v),mn=Math.min.apply(null,v),certa=maior?mx:mn;
  var it=choice("Qual é o "+(maior?"maior":"menor")+" número?",String(certa),v.filter(function(n){return n!==certa}).map(String),null);
  it._info={v:v,maior:maior,modo:tr.modo};
  if(tr.modo==="troca")it.limits=[["n27:troca",1]];
  return it;
}

/* Nível 28 — Dezenas inteiras e unidades, sem passar da dezena (EF01MA07). Seis famílias. */
function gDezUni(){
  var r=Math.random(),it,t,u,b;
  if(r<.125){                                     /* dezena + dezena (resultado até 100) */
    var x=rnd(1,9),y=rnd(1,10-x);
    it=typed((x*10)+" + "+(y*10)+" =",(x+y)*10);it.limits=[["n28:f1",2],["p28:"+Math.min(x,y)+","+Math.max(x,y),1]];
  }else if(r<.25){                                /* dezena − dezena */
    var x2=rnd(2,10),y2=rnd(1,x2-1);
    it=typed((x2*10)+" "+MENOS+" "+(y2*10)+" =",(x2-y2)*10);it.limits=[["n28:f2",2]];
  }else if(r<.5){                                 /* número + unidade, sem passar da dezena */
    t=rnd(1,9);u=rnd(1,8);b=rnd(1,9-u);
    it=typed((t*10+u)+" + "+b+" =",t*10+u+b);it.limits=[["n28:f3",4]];
  }else if(r<.75){                                /* número − unidade, sem passar da dezena */
    t=rnd(1,9);u=rnd(2,9);b=rnd(1,u-1);
    it=typed((t*10+u)+" "+MENOS+" "+b+" =",t*10+u-b);it.limits=[["n28:f4",4]];
  }else if(r<.875){                               /* dezena + unidade: compor */
    t=rnd(1,9);u=rnd(1,9);
    it=typed((t*10)+" + "+u+" =",t*10+u);it.limits=[["n28:f5",2]];
  }else{                                          /* tirar para achar a dezena ou a unidade */
    t=rnd(1,9);u=rnd(1,9);
    it=Math.random()<.5?typed((t*10+u)+" "+MENOS+" "+u+" =",t*10):typed((t*10+u)+" "+MENOS+" "+(t*10)+" =",u);
    it.limits=[["n28:f6",2]];
  }
  return it;
}

/* Nível 29 — Decompor números, sem desenho (EF01MA07). Unidade de 1 a 9; a resposta nunca é zero. */
function gDecompor(){
  var r=Math.random(),t=rnd(1,9),u=rnd(1,9),n=t*10+u,it;
  if(r<.25){it=typed(n+" = "+(t*10)+" +",u);it.limits=[["n29:t1",4]]}
  else if(r<.5){it=typed(n+" =",t*10,null,"+ "+u);it.limits=[["n29:t2",4]]}
  else if(r<.75){it=typed("Qual número tem "+t+" dezenas e "+u+" unidades?",n);it.limits=[["n29:t3",4]]}
  else if(Math.random()<.5){it=typed("O número "+n+" tem quantas dezenas?",t);it.limits=[["n29:t4",4]]}
  else{it=typed("O número "+n+" tem quantas unidades?",u);it.limits=[["n29:t4",4]]}
  return it;
}


/* ===================== Níveis 30 a 35: medidas, tempo, dinheiro, acaso e dados ===================== */
var LETRAS=["A","B","C"];
/* três tamanhos com razão de pelo menos 1,25 entre vizinhos, em ordem aleatória */
function tres(lo,hi){
  var t=0,v,ok;
  do{
    v=[0,0,0].map(function(){return +(lo+Math.random()*(hi-lo)).toFixed(3)});
    var o=v.slice().sort(function(x,y){return x-y});ok=o[1]/o[0]>=1.25&&o[2]/o[1]>=1.25;
  }while(!ok&&t++<500);
  return embaralhar(ok?v:[.3,.55,.95]);
}
/* Nível 30 — Comparar comprimentos, capacidades e massas (EF01MA15): barras e potes (A, B, C) e balança de pratos. */
function gGrandezas(){
  var r=Math.random(),it,sz,maior;
  if(r<.375){
    var o=pick(["h","v","w"]);sz=tres(.3,1);maior=Math.random()<.5;
    var pal={h:["comprida","curta"],v:["alta","baixa"],w:["larga","estreita"]}[o],ord=sz.slice().sort(function(a,b){return a-b}),alvo=maior?ord[2]:ord[0];
    it=choice("Qual é a barra mais "+(maior?pal[0]:pal[1])+"?",LETRAS[sz.indexOf(alvo)],LETRAS.filter(function(l,i){return sz[i]!==alvo}),{t:"barras",orient:o,sizes:sz});
    it.limits=[["n30:t1",5]];it._info={sz:sz,maior:maior,orient:o};
  }else if(r<.75){
    sz=tres(.45,1);maior=Math.random()<.5;var ord2=sz.slice().sort(function(a,b){return a-b}),alvo2=maior?ord2[2]:ord2[0];
    it=choice("Em qual pote "+(maior?"cabe mais":"cabe menos")+"?",LETRAS[sz.indexOf(alvo2)],LETRAS.filter(function(l,i){return sz[i]!==alvo2}),{t:"potes",sizes:sz});
    it.limits=[["n30:t2",5]];it._info={sz:sz,maior:maior};
  }else{
    var par=embaralhar(["🍎","🍉","⚽","📚","🎒","🍌","🍪","🧸"]).slice(0,2),a=pick([-12,12]);maior=Math.random()<.5;
    var pesado=a>0?par[1]:par[0],leve=a>0?par[0]:par[1];
    it=choice("Qual é o mais "+(maior?"pesado":"leve")+"?",maior?pesado:leve,[maior?leve:pesado],{t:"balanca",l:par[0],r:par[1],a:a});
    it.limits=[["n30:t3",3]];it._info={maior:maior};
  }
  return it;
}

/* Nível 31 — Períodos do dia, dias da semana e meses (EF01MA17). */
var EVENTOS=[["tomar o café da manhã","de manhã"],["acordar para ir à escola","de manhã"],["tomar o lanche da tarde","de tarde"],["brincar depois do almoço","de tarde"],["jantar","de noite"],["ver as estrelas no céu","de noite"],["escovar os dentes antes de dormir","de noite"]];
var DIAS=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
var MESES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
function dia(i){return DIAS[(i+7)%7]}
function artigoDia(i){var n=(i+7)%7;return (n===0||n===6)?"do ":"da "}
function tresOutros(lista,certa){return embaralhar(lista.filter(function(x){return x!==certa})).slice(0,3)}
function gTempo(){
  var r=Math.random(),it;
  if(r<.375){
    var ev=pick(EVENTOS);
    it=choice(cap1(ev[0])+" é de manhã, de tarde ou de noite?",ev[1],["de manhã","de tarde","de noite"].filter(function(x){return x!==ev[1]}),null);
    it.limits=[["n31:t1",5]];it._info={ev:ev[0]};
  }else if(r<.75){
    if(Math.random()<.12){it=typed("Quantos dias tem a semana?",7);it.key="semana7";it.limits=[["n31:t2",5]];return it}
    var i=rnd(0,6),depois=Math.random()<.5,cert=dia(depois?i+1:i-1);
    it=choice("Que dia vem "+(depois?"depois ":"antes ")+artigoDia(i)+dia(i)+"?",cert,tresOutros(DIAS,cert),null);
    it.limits=[["n31:t2",5]];it._info={i:i,depois:depois};
  }else{
    if(Math.random()<.12){it=typed("O ano tem quantos meses?",12);it.key="ano12";it.limits=[["n31:t3",3]];return it}
    var j=rnd(0,11),dep=Math.random()<.5,cm=MESES[(j+(dep?1:11))%12];
    it=choice("Que mês vem "+(dep?"depois":"antes")+" de "+MESES[j]+"?",cm,tresOutros(MESES,cm),null);
    it.limits=[["n31:t3",3]];it._info={j:j,dep:dep};
  }
  return it;
}

/* Nível 32 — Datas no calendário (EF01MA18): dia da semana de uma data, contar dias e escrever a data em dd/mm/aaaa. */
function pad2(n){return (n<10?"0":"")+n}
function ordinalDia(w){return w===0||w===6?"primeiro":"primeira"}
function gData(){
  var r=Math.random(),y=rnd(2026,2028),m=rnd(0,11),ult=new Date(y,m+1,0).getDate(),it;
  var fig={t:"calendario",y:y,m:m};
  if(r<.375){
    var d=rnd(1,ult),w=new Date(y,m,d).getDay();
    it=choice("Neste calendário, o dia "+d+" cai em que dia da semana?",DIAS[w],tresOutros(DIAS,DIAS[w]),fig);
    it.limits=[["n32:t1",5]];it._info={y:y,m:m,d:d};
  }else if(r<.625){
    var wd=rnd(0,6),primeiro=Math.random()<.5;
    if(primeiro){
      var a=1;while(new Date(y,m,a).getDay()!==wd)a++;
      it=typed("Qual é o dia do mês d"+(wd===0||wd===6?"o primeiro ":"a primeira ")+DIAS[wd]+"?",a,fig);
    }else{
      var q=0;for(var k=1;k<=ult;k++)if(new Date(y,m,k).getDay()===wd)q++;
      var masc=wd===0||wd===6;
      it=typed((masc?"Quantos ":"Quantas ")+(masc?DIAS[wd]+"s":DIAS[wd].replace("-feira","")+"s-feiras")+" tem este mês?",q,fig);
    }
    it.limits=[["n32:t2",3]];it._info={y:y,m:m,wd:wd,primeiro:primeiro};
  }else{
    var d3=rnd(1,ult),M=m+1,DD=pad2(d3),MM=pad2(M),certa=DD+"/"+MM+"/"+y;
    var wr=[y+"/"+MM+"/"+DD,d3+"/"+M+"/"+String(y).slice(2)];
    wr.push(d3<=12&&d3!==M?MM+"/"+DD+"/"+y:DD+"/"+y+"/"+MM);
    it=choice("Como se escreve "+d3+" de "+MESES[m]+" de "+y+" em números?",certa,wr,null);
    it.limits=[["n32:t3",5]];it._info={y:y,m:m,d:d3};
  }
  return it;
}

/* Nível 33 — Moedas e cédulas (EF01MA19), desenhadas de forma genérica. Sem somar centavos. */
var MOEDAS=[5,10,25,50,100],CEDULAS=[2,5,10,20];
function txtMoeda(v){return v===100?"1 real":v+" centavos"}
function txtCedula(v){return v+" reais"}
function gDinheiro(){
  var r=Math.random(),it;
  if(r<.375){
    var v=pick(CEDULAS);it=choice("Quanto vale esta cédula?",txtCedula(v),CEDULAS.filter(function(x){return x!==v}).map(txtCedula),{t:"dinheiro",items:[{k:"cedula",v:v}]});
    it.limits=[["n33:t1",5]];
  }else if(r<.625){
    var m=pick(MOEDAS);it=choice("Quanto vale esta moeda?",txtMoeda(m),MOEDAS.filter(function(x){return x!==m}).slice(0,4).map(txtMoeda),{t:"dinheiro",items:[{k:"moeda",v:m}]});
    it.limits=[["n33:t2",3]];
  }else if(r<.875){
    var pecas=[],tot=0,n=rnd(2,3),t=0;
    while(pecas.length<n&&t++<200){var pc=pick([{k:"cedula",v:2},{k:"cedula",v:5},{k:"cedula",v:10},{k:"cedula",v:20},{k:"moeda",v:100}]),val=pc.k==="cedula"?pc.v:1;
      if(tot+val<=20){pecas.push(pc);tot+=val}}
    if(pecas.length<2){pecas=[{k:"cedula",v:5},{k:"cedula",v:2}];tot=7}
    it=typed("Quantos reais?",tot,{t:"dinheiro",items:pecas});it.key="din3|"+pecas.map(function(x){return x.k+x.v}).join(",");
    it.limits=[["n33:t3",3]];
  }else{
    var ps=[],t2=0;
    while(ps.length<2&&t2++<200){var pc2=Math.random()<.5?{k:"cedula",v:pick(CEDULAS)}:{k:"moeda",v:pick(MOEDAS)},cv=pc2.k==="cedula"?pc2.v*100:pc2.v;
      if(!ps.some(function(x){return (x.k==="cedula"?x.v*100:x.v)===cv}))ps.push(pc2)}
    var vals=ps.map(function(x){return x.k==="cedula"?x.v*100:x.v}),maior=Math.max(vals[0],vals[1]),mf={fig:{t:"dinheiro",items:[ps[vals.indexOf(maior)]]}},of=ps.filter(function(x,i){return vals[i]!==maior})[0];
    it=choice("Qual vale mais?",mf,[{fig:{t:"dinheiro",items:[of]}}],null);it.limits=[["n33:t4",2]];
  }
  return it;
}

/* Nível 34 — Certeza, talvez ou impossível (EF01MA20): 24 frases revisadas e caixas de bolas. */
var FRASES={
  "Com certeza":["Depois do sábado vem o domingo.","Lançar um dado comum e sair um número de 1 a 6.","Uma semana tem sete dias.","Todo ano tem doze meses.","Se hoje é segunda-feira, amanhã é terça-feira.","Ao soltar uma pedra do alto, ela cai.","A noite vem depois da tarde.","Dois mais dois é igual a quatro."],
  "Impossível":["Uma pessoa viva ter 300 anos de idade.","Uma pessoa nascer com 10 anos de idade.","Uma semana ter dez dias.","Sair o número 7 ao lançar um dado comum.","Um dado comum mostrar o número zero.","Depois da segunda-feira vir a quinta-feira.","O dia ter trinta e cinco horas.","Um mês do calendário ter 40 dias."],
  "Talvez":["Chover amanhã.","Sair cara ao lançar uma moeda.","Sortear um menino numa turma de meninos e meninas.","Encontrar um amigo no parque.","Sair o número 3 ao lançar um dado.","Ganhar um jogo de cartas.","Fazer sol no sábado.","Tirar uma figurinha repetida do pacote."]
};
var ACASO=["Com certeza","Talvez","Impossível"];
function gAcaso(){
  var res=pick(ACASO),it;
  if(Math.random()<.5){
    var fr=pick(FRASES[res]);
    it=choice(fr+" Isso é…",res,ACASO.filter(function(x){return x!==res}),null);it.key="fr|"+fr;it.limits=[["n34:fr",5]];
  }else{
    var cor=pick(["r","a"]),outra=cor==="r"?"a":"r",total=rnd(3,8),balls=[],k;
    if(res==="Com certeza")for(k=0;k<total;k++)balls.push(cor);
    else if(res==="Impossível")for(k=0;k<total;k++)balls.push(outra);
    else{var nc=rnd(1,total-1);for(k=0;k<total;k++)balls.push(k<nc?cor:outra)}
    balls=embaralhar(balls);
    it=choice("Vai tirar uma bola "+(cor==="r"?"vermelha":"azul")+", sem olhar. Isso é…",res,ACASO.filter(function(x){return x!==res}),{t:"bolas",balls:balls});
    it.key="cx|"+cor+"|"+balls.join("");it.limits=[["n34:cx",5]];
  }
  return it;
}

/* Nível 35 — Ler gráficos e tabelas (EF01MA21). */
var TEMAS=[
  {t:"Cores preferidas da turma",l:["Azul","Verde","Rosa","Amarelo"],c:["#2457D6","#1CA97B","#F27AB0","#FFB92B"]},
  {t:"Frutas preferidas da turma",l:["Maçã","Uva","Banana","Pera"]},
  {t:"Bichinhos preferidos da turma",l:["Gato","Cão","Peixe","Pássaro"]},
  {t:"Esportes preferidos da turma",l:["Futebol","Vôlei","Natação","Judô"]}
];
function valores(n,distintos){
  var v=[],t=0;
  do{v=[];for(var i=0;i<n;i++)v.push(rnd(1,9))}while(distintos&&new Set(v).size<n&&t++<500);
  return v;
}
function gGrafico(){
  var r=Math.random(),tm=pick(TEMAS),it,fig;
  var barras=function(v){var f={t:"bars",title:tm.t,labels:tm.l,values:v};if(tm.c)f.colors=tm.c;return f};
  if(r<.375){
    var v=valores(4,false),i=rnd(0,3);
    it=typed("Quantas crianças escolheram "+tm.l[i]+"?",v[i],barras(v));it.limits=[["n35:t1",5]];
  }else if(r<.625){
    var v2=valores(4,true),mais=Math.random()<.5,alvo=mais?Math.max.apply(null,v2):Math.min.apply(null,v2);
    it=choice("Qual teve "+(mais?"mais":"menos")+" votos?",tm.l[v2.indexOf(alvo)],tm.l.filter(function(x,k){return v2[k]!==alvo}),barras(v2));it.limits=[["n35:t2",3]];
  }else if(r<.875){
    var v3=valores(4,false),i3=rnd(0,3);
    it=typed("Quantas crianças escolheram "+tm.l[i3]+"?",v3[i3],{t:"tabela",title:tm.t,labels:tm.l,values:v3});it.key="tab|"+tm.t+"|"+i3+"|"+v3.join(",");it.limits=[["n35:t3",3]];
  }else{
    var v4=valores(4,false),a=rnd(0,3),b=rnd(0,3);while(b===a)b=rnd(0,3);
    it=typed("Quantas crianças escolheram "+tm.l[a]+" ou "+tm.l[b]+"?",v4[a]+v4[b],barras(v4));it.limits=[["n35:t4",2]];
  }
  return it;
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
  {nivel:13,id:"g1n13",nome:"Nível 13 — Problemas de juntar e tirar, até 10",hab:["EF01MA08"],meta:120,gen:gProblema(3,10)},
  {nivel:14,id:"g1n14",nome:"Nível 14 — Figuras planas",hab:["EF01MA14"],meta:100,gen:gFormas},
  {nivel:15,id:"g1n15",nome:"Nível 15 — Sólidos e objetos do dia a dia",hab:["EF01MA13","EF01MA14"],meta:100,gen:gSolidos},
  {nivel:16,id:"g1n16",nome:"Nível 16 — Esquerda, direita, em cima e embaixo",hab:["EF01MA11","EF01MA12"],meta:100,gen:gPosicao},
  {nivel:17,id:"g1n17",nome:"Nível 17 — Atributos e padrões de figuras",hab:["EF01MA09","EF01MA10"],meta:120,gen:gAtributos},
  {nivel:18,id:"g1n18",nome:"Nível 18 — Dezena mais um número",hab:["EF01MA06","EF01MA07"],meta:80,gen:gDezenaMais},
  {nivel:19,id:"g1n19",nome:"Nível 19 — Somas até 20, sem passar da dezena",hab:["EF01MA06","EF01MA07"],meta:90,gen:gSomaSem19},
  {nivel:20,id:"g1n20",nome:"Nível 20 — Somas que passam da dezena",hab:["EF01MA06","EF01MA07"],meta:100,gen:gSomaPass20},
  {nivel:21,id:"g1n21",nome:"Nível 21 — Subtrações até 20, sem passar da dezena",hab:["EF01MA06","EF01MA07"],meta:90,gen:gSubSem21},
  {nivel:22,id:"g1n22",nome:"Nível 22 — Subtrações que passam da dezena",hab:["EF01MA06","EF01MA07"],meta:110,gen:gSubPass22},
  {nivel:23,id:"g1n23",nome:"Nível 23 — Somas e subtrações até 20",hab:["EF01MA06","EF01MA08"],meta:110,gen:gMisto20},
  {nivel:24,id:"g1n24",nome:"Nível 24 — Problemas de juntar e tirar, até 20",hab:["EF01MA08"],meta:140,gen:gProblema(11,20,.55)},
  {nivel:25,id:"g1n25",nome:"Nível 25 — Dezenas e unidades (barras e quadradinhos)",hab:["EF01MA07","EF01MA04"],meta:100,gen:gBarras},
  {nivel:26,id:"g1n26",nome:"Nível 26 — Contar até 100, de 10 em 10",hab:["EF01MA04"],meta:120,gen:gPacotes},
  {nivel:27,id:"g1n27",nome:"Nível 27 — Maior e menor até 99",hab:["EF01MA05"],meta:90,gen:gMaiorMenor99},
  {nivel:28,id:"g1n28",nome:"Nível 28 — Dezenas inteiras e unidades",hab:["EF01MA07"],meta:100,gen:gDezUni},
  {nivel:29,id:"g1n29",nome:"Nível 29 — Decompor números",hab:["EF01MA07"],meta:100,gen:gDecompor},
  {nivel:30,id:"g1n30",nome:"Nível 30 — Comparar comprimentos, capacidades e massas",hab:["EF01MA15"],meta:100,gen:gGrandezas},
  {nivel:31,id:"g1n31",nome:"Nível 31 — Períodos do dia, dias da semana e meses",hab:["EF01MA17"],meta:100,gen:gTempo},
  {nivel:32,id:"g1n32",nome:"Nível 32 — Datas no calendário",hab:["EF01MA18"],meta:120,gen:gData},
  {nivel:33,id:"g1n33",nome:"Nível 33 — Moedas e cédulas",hab:["EF01MA19"],meta:120,gen:gDinheiro},
  {nivel:34,id:"g1n34",nome:"Nível 34 — Certeza, talvez ou impossível",hab:["EF01MA20"],meta:100,gen:gAcaso},
  {nivel:35,id:"g1n35",nome:"Nível 35 — Ler gráficos e tabelas",hab:["EF01MA21"],meta:120,gen:gGrafico}
];
FC.G1BY={};FC.G1.forEach(function(e){FC.G1BY[e.id]=e});

/* ===================== A grade do app: FC.LEVELS ===================== */
var BLOCOS=[[7,"Contagem e comparação"],[13,"Soma e subtração até 10"],[17,"Formas, posição e padrões"],[24,"Contas até 20"],[29,"Dezenas e números até 100"],[35,"Medidas, tempo, dinheiro e dados"]];
var DICAS={1:"Conte os objetos e digite quantos são.",2:"Olhe os dois grupos: onde tem mais, onde tem menos, ou é igual?",3:"Complete o número que falta na fila.",4:"Conte os objetos, de 5 em 5, até 20.",
  5:"Conte os objetos espalhados. Dá para agrupar de 2 em 2 ou de 5 em 5.",6:"Que número vem antes, depois ou entre? E em que posição está na fila?",7:"Escolha o maior ou o menor número.",
  8:"Somas e subtrações pequenas, com desenhos para ajudar.",9:"Somar e tirar 1, 2 ou 3, até 10.",10:"Somas com resultado até 10.",11:"Subtrações até 10.",12:"Somas e subtrações até 10, misturadas.",
  13:"Problemas curtos de juntar, acrescentar, separar e retirar.",14:"Descubra o nome das figuras planas.",15:"Sólidos e objetos do dia a dia.",16:"Esquerda, direita, em cima e embaixo.",
  17:"Qual não combina? Qual é maior? E o que vem depois no padrão?",18:"Como 10 + 4 e 14 − 4.",19:"Como 12 + 5, sem passar da dezena.",20:"Como 8 + 7, que passam da dezena.",
  21:"Como 17 − 5, sem passar da dezena.",22:"Como 15 − 8, que passam da dezena.",23:"Somas e subtrações até 20, misturadas.",24:"Problemas de juntar e tirar com números até 20.",
  25:"Cada barra vale 10 e cada quadradinho vale 1.",26:"Conte até 100, de 10 em 10.",27:"Escolha o maior ou o menor número de dois algarismos.",28:"Como 30 + 20, 34 + 5 e 38 − 5.",
  29:"Como 34 = 30 + ?",30:"Compare comprimentos, capacidades e pesos.",31:"Manhã, tarde e noite; dias da semana; meses.",32:"Leia o calendário e escreva datas.",
  33:"Moedas e cédulas do dinheiro brasileiro.",34:"Com certeza, talvez ou impossível?",35:"Leia gráficos e tabelas."};
/* ===================== Tipos e nota de dificuldade (rodízio e rampa, ver plano.js e bncc/TIPOS-E-DIFICULDADE-1ANO.md) ===================== */
/* tipos: os tipos de conta do nível; tipo(it): o número do tipo da conta; nota(it): quanto maior, mais difícil (relativa ao nível); ordem: tipos do mais fácil ao mais difícil. */
function g01(it,pref){var l=(it.limits||[]).filter(function(x){return x[0].indexOf(pref)===0})[0];return l?l[0]:""}
function unico1(rotulo,nota){return {tipos:[rotulo],tipo:function(){return 0},nota:nota}}
function porGrupo1(pref,rotulos,ranks,extra){
  return {tipos:rotulos,tipo:function(it){return +g01(it,pref).slice(pref.length)-1},
    nota:function(it){var i=+g01(it,pref).slice(pref.length)-1;return (ranks[i]||0)*2+(extra?extra(it,it._info||{}):0)}};
}
function porNome1(nomes,ranks,extra,rotulos){
  return {tipos:rotulos||nomes,tipo:function(it){return nomes.indexOf(it._info.tipo)},
    nota:function(it){var i=nomes.indexOf(it._info.tipo);return (ranks[i]||0)*2+(extra?extra(it,it._info):0)}};
}
function porOp1(extra){return {tipos:["soma","subtração"],tipo:function(it){return it._info.op==="+"?0:1},nota:function(it){var i=it._info;return (i.op==="+"?0:2)+extra(it,i)}}}
function gap1(v){var s=v.slice().sort(function(a,b){return a-b}),d=99,k;for(k=1;k<s.length;k++)d=Math.min(d,s[k]-s[k-1]);return d}
var FORMA1={"círculo":0,"quadrado":1,"triângulo":1,"retângulo":2,"pentágono":3,"hexágono":3,"losango":3};
function formaNota(it){var t=String(it.pre),k,best=0;for(k in FORMA1)if(t.indexOf(k)>=0)best=Math.max(best,FORMA1[k]);var f=it.extra&&it.extra.fig;if(f&&f.n&&FORMA1[f.n]!=null)best=Math.max(best,FORMA1[f.n]);return best}
var ESPEC1={
 1:unico1("contar objetos até 10",function(it){return it.a}),
 2:{tipos:["onde tem mais","onde tem menos"],tipo:function(it){return it._info.mais?0:1},nota:function(it){var i=it._info;return (10-Math.min(9,Math.abs(i.n1-i.n2)))+(i.mais?0:2)+Math.max(i.n1,i.n2)/3}},
 3:{tipos:["fila que sobe","fila que desce"],tipo:function(it){var f=it._info.fila;return f[1]>f[0]?0:1},nota:function(it){var i=it._info,d=i.fila[1]<i.fila[0];return (d?3:0)+(i.k-1)*.7+i.fila[0]/10}},
 4:unico1("contar objetos até 20",function(it){return it.a}),
 5:unico1("contar objetos soltos até 20",function(it){return it.a}),
 6:{tipos:["que número vem depois","que número vem antes","que número está entre","posição na fila"],
    tipo:function(it){var p=String(it.pre);return /fila/.test(p)?3:/entre/.test(p)?2:/antes/.test(p)?1:0},
    nota:function(it){var p=String(it.pre),r=/fila/.test(p)?3:/entre/.test(p)?2:/antes/.test(p)?1:0;return r*2+it.a/6}},
 7:{tipos:["o maior","o menor"],tipo:function(it){return it._info.maior?0:1},nota:function(it){var i=it._info;return 8-Math.min(8,gap1(i.v))+(i.maior?0:1)+Math.max.apply(null,i.v)/10}},
 8:{tipos:["soma","subtração"],tipo:function(it){return g01(it,"n8:op")==="n8:op-"?1:0},nota:function(it){var i=it._info;return (i.op==="+"?0:2)+(i.a+i.b)/2}},
 9:{tipos:["soma","subtração"],tipo:function(it){return g01(it,"n9:op")==="n9:op-"?1:0},nota:function(it){var i=it._info;return (i.op==="+"?0:2)+(i.a+i.b)/3}},
 10:{tipos:["somar 1","somar 2 ou 3"],tipo:function(it){return g01(it,"n10:")==="n10:um"?0:1},nota:function(it){var i=it._info;return (g01(it,"n10:")==="n10:um"?0:2)+i.b+i.a/3}},
 11:unico1("subtração até 10",function(it){var i=it._info;return i.a/2+i.b}),
 12:porOp1(function(it,i){return i.a/2+i.b}),
 13:porNome1(["juntar","acrescentar","separar","retirar"],[0,0,1,1],function(it,i){return (i.a+i.b)/3}),
 14:{tipos:["como se chama a figura","qual destas é a figura"],tipo:function(it){return g01(it,"n14:t")==="n14:t2"?1:0},nota:function(it){return (g01(it,"n14:t")==="n14:t2"?2:0)+formaNota(it)}},
 15:porGrupo1("n15:t",["objeto com a forma do sólido","nome do sólido","sólido de um objeto","face do sólido"],[1,0,1,2]),
 16:{tipos:["em cima e embaixo","esquerda e direita","na caixa"],tipo:function(it){return ({v:0,h:1,caixa:2})[it._info.tipo]},nota:function(it){var i=it._info;return ({v:0,h:1,caixa:2})[i.tipo]*2+(i.itens?i.itens.length:0)}},
 17:porGrupo1("n17:t",["a figura que não combina","a maior ou a menor figura","a figura que vem depois"],[1,0,2]),
 18:{tipos:["dezena + número","dezena − número"],tipo:function(it){return g01(it,"n18:op")==="n18:op-"?1:0},nota:function(it){var i=it._info;return (i.op==="+"?0:2)+i.b/3}},
 19:unico1("soma até 20, sem passar da dezena",function(it){var i=it._info;return (i.a%10+i.b)/2}),
 20:unico1("soma que passa da dezena",function(it){var i=it._info;return (i.a%10+i.b%10)/2+(g01(it,"n20:vinte")?2:0)}),
 21:unico1("subtração até 20, sem passar da dezena",function(it){var i=it._info;return i.b/2+i.a/6}),
 22:unico1("subtração que passa da dezena",function(it){var i=it._info;return (i.b-i.a%10)/2+(g01(it,"n22:vinte")?2:0)}),
 23:{tipos:["soma sem passar da dezena","soma que passa da dezena","subtração sem passar da dezena","subtração que passa da dezena"],tipo:function(it){return it._info.fam-1},nota:function(it){var i=it._info;return (i.fam-1)*2+(i.vinte?1:0)+i.b/4}},
 24:porNome1(["juntar","acrescentar","separar","retirar"],[0,0,1,1],function(it,i){return (i.a+i.b)/6}),
 25:porGrupo1("n25:t",["valor das barras e quadradinhos","quantas barras","quantos soltos"],[0,1,1],function(it){return it.a/20}),
 26:unico1("contar pacotes de 10 e soltos",function(it){return Math.floor(it.a/10)/2+(it.a%10?3:0)}),
 27:{tipos:["o maior","o menor"],tipo:function(it){return /menor/.test(String(it.pre))?1:0},nota:function(it){var i=it._info;return ({sep:0,mesma:2,troca:3})[i.modo]*2+8-Math.min(8,gap1(i.v)/2)}},
 28:porGrupo1("n28:f",["dezena + dezena","dezena − dezena","dezena + unidade","dezena e unidade, tirando","dezena + 1","tirar para ficar dezena"],[0,1,2,3,2,3],function(it){return it.a/40}),
 29:porGrupo1("n29:t",["unidade que falta","dezena que falta","montar o número","quantas dezenas"],[0,2,1,1],function(it){return it.a/10}),
 30:porGrupo1("n30:t",["comparar barras","comparar potes","comparar pesos"],[0,1,2],function(it,i){return i.sz?6-Math.min(6,gap1(i.sz)*20):2}),
 31:porGrupo1("n31:t",["período do dia","dias da semana","meses do ano"],[0,1,2]),
 32:porGrupo1("n32:t",["dia da semana no calendário","dia do mês","escrever a data"],[0,1,2]),
 33:porGrupo1("n33:t",["valor da cédula","valor da moeda","quantos reais","qual vale mais"],[0,0,1,2]),
 34:{tipos:["bola no saco","frase do dia a dia"],tipo:function(it){return g01(it,"n34:")==="n34:fr"?1:0},nota:function(it){return g01(it,"n34:")==="n34:fr"?2:0}},
 35:porGrupo1("n35:t",["ler um valor (gráfico)","qual teve menos votos","ler um valor (tabela)","somar dois valores"],[0,1,0,2])
};
/* Ordem dos tipos do mais fácil ao mais difícil (média da nota de cada tipo, medida em 4 000 contas por nível). O rodízio reserva o 1º da lista à folha 1, o 2º à folha 2 e assim por diante: fixa de propósito, para que as 5 folhas do dia sempre cubram todos os tipos. */
var ORDEM1={"1":[0],"2":[0,1],"3":[0,1],"4":[0],"5":[0],"6":[0,1,2,3],"7":[0,1],"8":[0,1],"9":[0,1],"10":[0,1],"11":[0],"12":[0,1],"13":[1,0,3,2],"14":[0,1],"15":[1,0,2,3],"16":[0,2,1],"17":[1,0,2],"18":[0,1],"19":[0],"20":[0],"21":[0],"22":[0],"23":[0,1,2,3],"24":[0,1,2,3],"25":[1,2,0],"26":[0],"27":[0,1],"28":[0,1,4,2,5,3],"29":[0,3,2,1],"30":[0,1,2],"31":[0,1,2],"32":[0,1,2],"33":[0,1,2,3],"34":[0,1],"35":[0,2,1,3]};
Object.keys(ORDEM1).forEach(function(n){ESPEC1[n].ordem=ORDEM1[n]});
/* Texto de abertura de um nível (aparece no começo da folha). */
var INTROS={16:"Lembrete: a esquerda é o lado da sua mão esquerda, e a direita é o lado da sua mão direita."};
FC.LEVELS=FC.G1.map(function(e){
  var grupo=BLOCOS.filter(function(b){return e.nivel<=b[0]})[0][1];
  var l={group:grupo,id:String(e.nivel),name:e.nome.replace(/^Nível \d+ — /,""),hint:DICAS[e.nivel],target:e.meta,gen:e.gen,ano:1,hab:e.hab};
  if(INTROS[e.nivel])l.intro=INTROS[e.nivel];
  l.espec=ESPEC1[e.nivel];
  return l;
});
})();
