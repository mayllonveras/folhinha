/* Grade do 1º ano — geradores novos, escritos do zero a partir das fichas em bncc/fichas/.
   Cada gerador devolve {pre, post, a, extra?}, como os de exercicios.js, mais campos só para o app e os testes:
   - grp/cap: no máximo cap contas do mesmo grupo (por exemplo, o mesmo número) na mesma folha;
   - key: identidade da conta (quando o desenho muda mas a conta é a mesma);
   - _calc/_why: a resposta, para os testes (nunca vão para o banco).
   Por enquanto os geradores não estão ligados aos níveis do app: aparecem na aba Exercícios do /adm.
   Níveis feitos: 1 a 18 (contagem, comparação, soma e subtração até 10, problemas, formas, sólidos, posição, atributos, dezena mais um). */
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
  {nivel:13,id:"g1n13",nome:"Nível 13 — Problemas de juntar e tirar, até 10",hab:["EF01MA08"],meta:120,gen:gProblema(10)},
  {nivel:14,id:"g1n14",nome:"Nível 14 — Figuras planas",hab:["EF01MA14"],meta:100,gen:gFormas},
  {nivel:15,id:"g1n15",nome:"Nível 15 — Sólidos e objetos do dia a dia",hab:["EF01MA13","EF01MA14"],meta:100,gen:gSolidos},
  {nivel:16,id:"g1n16",nome:"Nível 16 — Esquerda, direita, em cima e embaixo",hab:["EF01MA11","EF01MA12"],meta:100,gen:gPosicao},
  {nivel:17,id:"g1n17",nome:"Nível 17 — Atributos e padrões de figuras",hab:["EF01MA09","EF01MA10"],meta:120,gen:gAtributos},
  {nivel:18,id:"g1n18",nome:"Nível 18 — Dezena mais um número",hab:["EF01MA06","EF01MA07"],meta:80,gen:gDezenaMais}
];
FC.G1BY={};FC.G1.forEach(function(e){FC.G1BY[e.id]=e});
})();
