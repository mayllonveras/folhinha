/* Grade do 2º ano — geradores escritos do zero a partir das fichas em bncc/fichas/2ano-*.md.
   Mesma forma dos geradores do 1º ano (grade1.js): {pre, post, a, extra?}, com limits/key/_info só para o app e os testes.
   Por enquanto os geradores não estão ligados aos níveis do app: aparecem na aba Exercícios do /adm.
   Níveis feitos: 1 a 41, a grade inteira do 2º ano (números até 1000, adição e subtração, multiplicação, dobro, triplo, metade, padrões, geometria, medidas, tempo, dinheiro, acaso e dados). */
(function(){
"use strict";
var FC=window.FC,X=FC.exh,rnd=X.rnd,pick=X.pick,choice=X.choice,typed=X.typed;

function embaralhar(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(0,i),t=a[i];a[i]=a[j];a[j]=t}return a}
function cent(n){return n+(n===1?" centena":" centenas")}
function dez(n){return n+(n===1?" dezena":" dezenas")}
function uni(n){return n+(n===1?" unidade":" unidades")}

/* Fila com um espaço: "De 5 em 5: 15  20 _ 30  35". O espaço fica na 2ª, 3ª ou 4ª posição. */
function fila(passo,v,k){
  var it=typed("De "+passo+" em "+passo+": "+v.slice(0,k).join("  "),v[k],null,v.slice(k+1).join("  "));
  it._info={passo:passo,fila:v,k:k};
  return it;
}

/* Nível 1 — Contar de 2 em 2, de 5 em 5 e de 10 em 10 até 100 (EF02MA09, EF02MA11). Os termos são múltiplos do passo.
   40% das contas são a fila com um espaço; o resto são situações do dia a dia, pulos e "qual não faz parte" (FC.abertura.contagem2). */
function gContarDe(){
  var passo=pick([2,5,10]),sobe=Math.random()<.7,v=[],i,s;
  if(sobe)s=passo*rnd(0,Math.floor((100-4*passo)/passo));else s=passo*rnd(4,Math.floor(100/passo));
  for(i=0;i<5;i++)v.push(sobe?s+i*passo:s-i*passo);
  return fila(passo,v,rnd(1,3));
}

function gContarMisto(){return Math.random()<.4?gContarDe():FC.abertura.contagem2()}

/* Nível 2 — Centenas, dezenas e unidades com o material dourado (EF02MA04). */
function legenda(){return "Cada placa vale 100, cada barra vale 10 e cada quadradinho vale 1. "}
function gMaterial(){
  var r=Math.random(),h=rnd(1,9),t,o,it,fig;
  if(r<.625){                                      /* valor da figura; zero em cerca de 30% */
    if(Math.random()<.3){var z=Math.random();if(z<.4){t=0;o=rnd(1,9)}else if(z<.8){t=rnd(1,9);o=0}else{t=0;o=0}}
    else{t=rnd(1,9);o=rnd(1,9)}
    it=typed(legenda()+"Quanto vale tudo junto?",h*100+t*10+o,{t:"placas",h:h,d:t,o:o});
    it.limits=[["n2:t1",6]];
  }else if(r<.875){                                /* quantas placas, barras ou quadradinhos (casas cheias) */
    t=rnd(1,9);o=rnd(1,9);
    var q=pick(["h","t","o"]),n=h*100+t*10+o,txt={h:"quantas placas de 100?",t:"quantas barras de 10?",o:"quantos quadradinhos soltos?"}[q];
    it=typed("O número "+n+(q==="o"?" tem ":" é formado por ")+txt,{h:h,t:t,o:o}[q],{t:"placas",h:h,d:t,o:o});
    it.limits=[["n2:t2",3]];
  }else{                                           /* a casa vazia: a resposta é zero */
    var vaz=pick(["t","o","t","o","to"]);t=vaz.indexOf("t")>=0?0:rnd(1,9);o=vaz.indexOf("o")>=0?0:rnd(1,9);
    var cas=vaz==="to"?pick(["t","o"]):vaz,n2=h*100+t*10+o;
    it=typed("O número "+n2+(cas==="o"?" tem quantos quadradinhos soltos?":" é formado por quantas barras de 10?"),0,{t:"placas",h:h,d:t,o:o});
    it.limits=[["n2:t3",2]];
  }
  return it;
}

/* Nível 3 — Valor posicional e o zero, números até 999 (EF02MA01, EF02MA04). Dois tipos, em partes iguais. */
function digitos(zero,distintos){
  var h,t,o,c=0;
  do{
    h=rnd(1,9);t=rnd(1,9);o=rnd(1,9);
    if(zero){var z=Math.random();if(z<.45)t=0;else if(z<.9)o=0;else{t=0;o=0}}
    c++;
  }while(distintos&&(h===t||h===o||(t===o&&t!==0))&&c<200);
  return [h,t,o];
}
function gPosicional(){
  var it,d,n;
  if(Math.random()<.5){                            /* montar o número */
    d=digitos(Math.random()<.3,false);n=d[0]*100+d[1]*10+d[2];
    it=typed("Qual número tem "+cent(d[0])+", "+dez(d[1])+" e "+uni(d[2])+"?",n);it.limits=[["n3:t1",5]];
  }else if(Math.random()<.8){                      /* o valor de um algarismo (o algarismo é único no número) */
    d=digitos(Math.random()<.3,true);n=d[0]*100+d[1]*10+d[2];
    var casas=[0,1,2].filter(function(i){return d[i]>0}),i=pick(casas);
    it=typed("No número "+n+", quanto vale o algarismo "+d[i]+"?",d[i]*[100,10,1][i]);it.limits=[["n3:t2",5]];
  }else{                                           /* o zero: que algarismo está numa casa vazia */
    d=digitos(true,false);n=d[0]*100+d[1]*10+d[2];
    var vazias=[1,2].filter(function(i){return d[i]===0}),j=pick(vazias);
    it=typed("Que algarismo está na casa "+(j===1?"das dezenas":"das unidades")+" de "+n+"?",0);it.limits=[["n3:t2",5]];
  }
  return it;
}

/* Nível 4 — Decompor números até 999 (EF02MA04). Cinco tipos; zero em 15% dos tipos 1 a 3. */
function gDecompor3(){
  var r=Math.random(),h=rnd(1,9),t=rnd(1,9),o=rnd(1,9),n,it,zero=Math.random()<.15;
  if(r<.2){                                        /* completar a unidade */
    if(zero)o=0;n=h*100+t*10+o;
    it=typed(n+" = "+(h*100)+" + "+(t*10)+" +",o);it.limits=[["n4:t1",3]];
  }else if(r<.4){                                  /* completar a dezena */
    if(zero)t=0;n=h*100+t*10+o;
    it=typed(n+" = "+(h*100)+" +",t*10,null,"+ "+o);it.limits=[["n4:t2",3]];
  }else if(r<.6){                                  /* completar a centena (o zero aparece como parcela visível) */
    if(zero){if(Math.random()<.5)t=0;else o=0}n=h*100+t*10+o;
    it=typed(n+" =",h*100,null,"+ "+(t*10)+" + "+o);it.limits=[["n4:t3",3]];
  }else if(r<.8){                                  /* compor: só parcelas diferentes de zero */
    n=h*100+t*10+o;
    it=typed("Qual número é "+(h*100)+" + "+(t*10)+" + "+o+"?",n);it.limits=[["n4:t4",3]];
  }else{                                           /* outra adição: uma centena inteira menor que o número */
    n=h*100+t*10+o;var k=rnd(1,h);
    it=typed(n+" = "+(k*100)+" +",n-k*100);it.limits=[["n4:t5",3]];
  }
  return it;
}

/* Nível 5 — Comparar e ordenar números até 999 (EF02MA01). */
function tresNum(){
  var r=Math.random(),m,a,b,c,hs,t=0,x,y,z,ds;
  if(r<.4){                                        /* três centenas diferentes e bem separadas (diferença mínima de 2) */
    do{hs=[rnd(1,9),rnd(1,9),rnd(1,9)].sort(function(p,q){return p-q})}while((hs[1]-hs[0]<2||hs[2]-hs[1]<2)&&t++<500);
    return {modo:"sep",v:embaralhar(hs.map(function(h){return h*100+rnd(0,99)}))};
  }
  if(r<.75){                                       /* duas na mesma centena, dezenas diferentes */
    var h1=rnd(1,9),h2;do{h2=rnd(1,9)}while(h2===h1);
    var t1=rnd(0,9),t2;do{t2=rnd(0,9)}while(t2===t1);
    return {modo:"dez",v:embaralhar([h1*100+t1*10+rnd(0,9),h1*100+t2*10+rnd(0,9),h2*100+rnd(0,99)])};
  }
  if(r<.85){                                       /* mesma centena e mesma dezena: só as unidades decidem */
    var h3=rnd(1,9),t3=rnd(0,9),u1=rnd(0,9),u2;do{u2=rnd(0,9)}while(u2===u1);
    var h4;do{h4=rnd(1,9)}while(h4===h3);
    return {modo:"uni",v:embaralhar([h3*100+t3*10+u1,h3*100+t3*10+u2,h4*100+rnd(0,99)])};
  }
  if(r<.95){                                       /* algarismos trocados: três algarismos diferentes e não nulos, três permutações */
    ds=embaralhar([1,2,3,4,5,6,7,8,9]).slice(0,3);x=ds[0];y=ds[1];z=ds[2];
    return {modo:"troca",v:embaralhar([x*100+y*10+z,x*100+z*10+y,y*100+x*10+z])};
  }
  a=rnd(1,9);b=rnd(1,9);                           /* zero no meio: 305 e 350 */
  var h5;do{h5=rnd(1,9)}while(h5===a);
  return {modo:"zero",v:embaralhar([a*100+b,a*100+b*10,h5*100+rnd(0,99)])};
}
function ordemTexto(v){return v.join(", ")}
function gOrdemNum(){
  var tr,ok,tt=0;
  do{tr=tresNum();ok=new Set(tr.v).size===3}while(!ok&&tt++<500);
  var v=tr.v,it;
  if(Math.random()<.625){
    var maior=Math.random()<.5,certa=maior?Math.max.apply(null,v):Math.min.apply(null,v);
    it=choice("Qual é o "+(maior?"maior":"menor")+" número?",String(certa),v.filter(function(n){return n!==certa}).map(String),null);
    it.limits=[["n5:t1",6]];it._info={v:v,maior:maior,modo:tr.modo};
  }else{
    var cresc=Math.random()<.5,asc=v.slice().sort(function(p,q){return p-q}),ord=cresc?asc:asc.slice().reverse(),certaTxt=ordemTexto(ord);
    var perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]].map(function(p){return ordemTexto(p.map(function(i){return v[i]}))}).filter(function(s){return s!==certaTxt});
    it=choice("Qual é a ordem certa, do "+(cresc?"menor para o maior":"maior para o menor")+"?",certaTxt,embaralhar(perms).slice(0,2),null);
    it.limits=[["n5:t2",4]];it._info={v:v,cresc:cresc,modo:tr.modo};
  }
  if(tr.modo==="troca")it.limits.push(["n5:troca",1]);
  return it;
}

/* Nível 6 — Sequências a partir de qualquer número, de 1, 10 e 100 em 100 (EF02MA09, EF02MA11). Entre 100 e 999. */
function gSequencia3(){
  var r=Math.random(),passo=r<.25?1:r<.65?10:100,sobe=Math.random()<.7,v,t=0,s,i,cruza=passo<100&&Math.random()<.4;
  do{
    if(sobe)s=rnd(100,999-4*passo);else s=rnd(100+4*passo,999);
    v=[];for(i=0;i<5;i++)v.push(sobe?s+i*passo:s-i*passo);
    var f=Math.floor(Math.min(v[0],v[4])/(10*passo)),l=Math.floor(Math.max(v[0],v[4])/(10*passo));
    if(!cruza||f!==l)break;
  }while(t++<200);
  return fila(passo,v,rnd(1,3));
}

/* Nível 7 — Estimar quantidades até 1000 (EF02MA02): mancha de pontos com um quadro de 100. O total deixa o múltiplo
   de 100 mais próximo claro (resto de 0 a 35 ou de 65 a 99). As 4 opções são múltiplos de 100 seguidos. */
function gEstimar(){
  var n,r;
  do{n=rnd(150,950);r=n%100}while(r>35&&r<65);
  var certa=Math.round(n/100)*100,lo=Math.max(100,Math.min(certa-rnd(0,3)*100,700)),opts=[],k;
  while(lo+300>1000||lo>certa)lo-=100;
  if(certa<lo)lo=certa;
  for(k=0;k<4;k++)opts.push(String(lo+k*100));
  var cmin=Math.max(10,Math.ceil(n/25)),cmax=Math.min(40,Math.floor(n/10)),c=rnd(cmin,cmax);
  var it=choice("O quadro marcado tem 100 pontos. Mais ou menos quantos pontos tem aqui?",String(certa),opts.filter(function(x){return x!==String(certa)}),{t:"mancha",n:n,c:c});
  it.key="est|"+n+"|"+c;it._info={n:n,c:c};
  return it;
}

/* ===================== Níveis 8 a 18: adição e subtração ===================== */
var MENOS="−",NAMES=X.NAMES;
function conta(a,op,b){return a+" "+op+" "+b+" ="}
function pj(nivel,a,b){return "p"+nivel+":"+Math.min(a,b)+","+Math.max(a,b)}   /* parcelas trocadas = mesma conta na folha */
function somaIt(a,b,l){var it=typed(conta(a,"+",b),a+b);it.limits=l;it._info={op:"+",a:a,b:b};return it}
function subIt(a,b,l){var it=typed(conta(a,MENOS,b),a-b);it.limits=l;it._info={op:"-",a:a,b:b};return it}

/* Pares de dois algarismos (dezenas e unidades sorteadas, todas as ordens possíveis). */
function parSomaSem(){var t1,t2,u1,u2;do{t1=rnd(1,8);t2=rnd(1,8)}while(t1+t2>9);do{u1=rnd(1,8);u2=rnd(1,8)}while(u1+u2>9);return [t1*10+u1,t2*10+u2]}
function parSomaCom(){var t1,t2,u1,u2;do{t1=rnd(1,7);t2=rnd(1,7)}while(t1+t2>8);do{u1=rnd(1,9);u2=rnd(1,9)}while(u1+u2<10);return [t1*10+u1,t2*10+u2]}
function parSubSem(){var ta=rnd(2,9),tb=rnd(1,ta-1),ua=rnd(1,9),ub=rnd(1,ua);return [ta*10+ua,tb*10+ub]}
function parSubCom(){var ta=rnd(2,9),tb=rnd(1,ta-1),ua=rnd(0,8),ub=rnd(ua+1,9);return [ta*10+ua,tb*10+ub]}

/* Nível 8 — Somas de dois algarismos, sem reagrupar (EF02MA05, EF02MA06). */
function gSomaSem(){var p=parSomaSem();return somaIt(p[0],p[1],[[pj(8,p[0],p[1]),1]])}
/* Nível 9 — Somas de dois algarismos, com reagrupamento. */
function gSomaCom(){var p=parSomaCom();return somaIt(p[0],p[1],[[pj(9,p[0],p[1]),1]])}
/* Nível 10 — Subtrações de dois algarismos, sem reagrupar. */
function gSubSem(){var p=parSubSem();return subIt(p[0],p[1],[])}
/* Nível 11 — Subtrações de dois algarismos, com reagrupamento. */
function gSubCom(){var p=parSubCom();return subIt(p[0],p[1],[])}
/* Nível 12 — As quatro famílias misturadas: 2 de cada nas 8 contas do nível. */
function gMisto2(){
  var f=rnd(1,4),p;
  if(f===1){p=parSomaSem();return somaIt(p[0],p[1],[["n12:f1",2],[pj(12,p[0],p[1]),1]])}
  if(f===2){p=parSomaCom();return somaIt(p[0],p[1],[["n12:f2",2],[pj(12,p[0],p[1]),1]])}
  if(f===3){p=parSubSem();return subIt(p[0],p[1],[["n12:f3",2]])}
  p=parSubCom();return subIt(p[0],p[1],[["n12:f4",2]]);
}

/* Nível 13 — Centenas e dezenas inteiras (EF02MA04, EF02MA05). Famílias 1+1+2+2+2 nas 8 contas. */
function gCentenas(){
  var f=rnd(1,5),a,b,h,k,t,u,it;
  if(f===1){do{a=rnd(1,9);b=rnd(1,9)}while(a+b>10);it=somaIt(a*100,b*100,[["n13:f1",1],[pj(13,a*100,b*100),1]])}
  else if(f===2){a=rnd(2,9);b=rnd(1,a-1);it=subIt(a*100,b*100,[["n13:f2",1]])}
  else if(f===3){h=rnd(1,9);t=rnd(1,9);it=somaIt(h*100,t*10,[["n13:f3",2]])}
  else if(f===4){h=rnd(1,9);t=rnd(1,8);u=rnd(1,9-t);it=somaIt(h*100+t*10,u*10,[["n13:f4",2],[pj(13,h*100+t*10,u*10),1]])}
  else{
    do{h=rnd(1,9);k=rnd(1,h);t=rnd(1,9);u=rnd(1,t)}while(h===k&&t===u);
    it=subIt(h*100+t*10,k*100+u*10,[["n13:f5",2]]);
  }
  it._info.fam=f;
  return it;
}

/* Nível 14 — Três algarismos, sem reagrupar (EF02MA06): 4 somas e 4 subtrações; zero em cerca de 20% das contas. */
function gTres(){
  var soma=Math.random()<.5,z=Math.random()<.2,a,b,h1,h2,t1,t2,u1,u2;
  if(soma){
    do{h1=rnd(1,8);h2=rnd(1,8)}while(h1+h2>9);do{t1=rnd(1,8);t2=rnd(1,8)}while(t1+t2>9);do{u1=rnd(1,8);u2=rnd(1,8)}while(u1+u2>9);
    if(z){var c=rnd(0,3);if(c===0)t1=0;else if(c===1)t2=0;else if(c===2)u1=0;else u2=0}
    a=h1*100+t1*10+u1;b=h2*100+t2*10+u2;return somaIt(a,b,[["n14:+",4],[pj(14,a,b),1]]);
  }
  h1=rnd(2,8);h2=rnd(1,h1-1);t1=rnd(1,8);t2=rnd(1,t1);u1=rnd(1,8);u2=rnd(1,u1);
  if(z){var d=rnd(0,3);if(d===0)t2=0;else if(d===1)u2=0;else if(d===2){t1=0;t2=0}else{u1=0;u2=0}}
  return subIt(h1*100+t1*10+u1,h2*100+t2*10+u2,[["n14:-",4]]);
}

/* Nível 15 — Quanto falta? O número escondido (EF02MA05): quatro formas, 2 de cada nas 8 contas. */
function totalC(){
  var r=Math.random();
  if(r<1/3)return 100;
  if(r<2/3)return 10*rnd(2,9);
  var c;do{c=rnd(21,99)}while(c%10===0);return c;
}
function gEscondido(){
  var f=rnd(1,4),c=totalC(),y=rnd(1,c-1),x=c-y,it;
  if(f===1)it=typed(y+" +",x,null,"= "+c);                        /* y + ? = c */
  else if(f===2)it=typed("",x,null,"+ "+y+" = "+c);               /* ? + y = c */
  else if(f===3)it=typed(c+" "+MENOS,x,null,"= "+y);              /* c − ? = y */
  else it=typed("",c,null,MENOS+" "+y+" = "+x);                    /* ? − y = x (a resposta é c) */
  it.limits=[["n15:f"+f,2]];it._info={f:f};
  return it;
}

/* Nível 16 — Quantos a mais, quantos a menos? (EF02MA03, EF02MA06). Figura (5) e números (3), por folha. */
var OBJ16=[["figurinha","figurinhas",1],["livro","livros",0],["bola","bolas",1],["adesivo","adesivos",0],["carrinho","carrinhos",0],["bala","balas",1]];
function qs(f){return f?"Quantas ":"Quantos "}
function gMaisMenos(){
  var it,mais=Math.random()<.5,a,b,big,small;
  if(Math.random()<.625){
    var o1=pick(X.OBJ),o2;do{o2=pick(X.OBJ)}while(o2.e===o1.e);
    do{a=rnd(6,20);b=rnd(6,20)}while(a===b||Math.abs(a-b)>9);
    var d=Math.abs(a-b),eMais=a>b?o1:o2,eMenos=a>b?o2:o1,alvo=mais?eMais:eMenos,outro=mais?eMenos:eMais;
    it=typed(qs(alvo.f)+alvo.pl+" a "+(mais?"mais":"menos")+" do que "+outro.pl+" há aqui?",d,{t:"emoji",groups:[{e:o1.e,n:a},{e:o2.e,n:b}],per:5,side:true});
    it.limits=[["n16:fig",5]];
    it.key="mm|"+o1.e+a+"|"+o2.e+b+"|"+(mais?"+":"-");it._info={a:a,b:b,mais:mais,fig:true};
    return it;
  }
  var n1=pick(NAMES),n2;do{n2=pick(NAMES)}while(n2[0]===n1[0]);
  var ob=pick(OBJ16);do{a=rnd(10,99);b=rnd(10,99)}while(a===b||Math.abs(a-b)>40);
  var quem=mais?(a>b?n1:n2):(a<b?n1:n2),outra=quem===n1?n2:n1;
  it=typed(n1[0]+" tem "+a+" "+ob[1]+" e "+n2[0]+" tem "+b+". "+qs(ob[2])+ob[1]+" "+quem[0]+" tem a "+(mais?"mais":"menos")+" do que "+outra[0]+"?",Math.abs(a-b));
  it.limits=[["n16:num",3],["nome:"+n1[0],1],["nome:"+n2[0],1]];it._info={a:a,b:b,mais:mais,num:true};
  return it;
}

/* Níveis 17 e 18 — Problemas de adição e subtração, até 100 e até 999 (EF02MA06). Frases de até 18 palavras. */
var OJUNTAR=[["figurinha","figurinhas",1],["livro","livros",0],["bola","bolas",1],["adesivo","adesivos",0],["carrinho","carrinhos",0],["bala","balas",1],["flor","flores",1],["lápis","lápis",0]];
var ODAR=[["figurinha","figurinhas",1],["bala","balas",1],["livro","livros",0],["adesivo","adesivos",0],["bola","bolas",1]];
var OSAIR=[["carro","carros",0],["pássaro","pássaros",0],["balão","balões",0],["aluno","alunos",0],["peixe","peixes",0],["pintinho","pintinhos",0]];
function ele2(n){return n[1]==="f"?"Ela":"Ele"}
/* Pares (a, b): modo 17 usa números de dois algarismos (soma até 100); modo 18, múltiplos de 10 de 100 a 990. regroup: com ou sem "vai um" / "empresta". */
function parProb(modo,soma,regroup){
  var a,b,t=0,lo=modo===17?10:100,hi=modo===17?99:990,passo=modo===17?1:10;
  do{
    a=rnd(lo/passo,hi/passo)*passo;b=rnd(lo/passo,hi/passo)*passo;
    var ua,ub;
    if(modo===17){ua=a%10;ub=b%10}else{ua=Math.floor(a/10)%10;ub=Math.floor(b/10)%10}
    if(soma){if(a+b>(modo===17?100:999)||(ua+ub>=10)!==regroup)continue;return [a,b]}
    if(a<=b||(ua<ub)!==regroup)continue;return [a,b];
  }while(t++<2000);
  return soma?[38,27]:[72,25];
}
function gProb(modo){
  return function(){
    var tipo=pick(["juntar","acrescentar","separar","retirar"]),soma=tipo==="juntar"||tipo==="acrescentar",regroup=Math.random()<.5;
    var pr=parProb(modo,soma,regroup),a=pr[0],b=pr[1],n1=pick(NAMES),n2,pre,o,l=[["n"+modo+":"+tipo,3]];
    if(tipo==="juntar"){
      o=pick(OJUNTAR);do{n2=pick(NAMES)}while(n2[0]===n1[0]);var elas=n1[1]==="f"&&n2[1]==="f";
      pre=n1[0]+" tem "+a+" "+o[1]+" e "+n2[0]+" tem "+b+". "+qs(o[2])+o[1]+" "+(elas?"elas":"eles")+" têm "+(elas?"juntas":"juntos")+"?";
      l.push(["nome:"+n1[0],1],["nome:"+n2[0],1]);
    }else if(tipo==="acrescentar"){
      o=pick(OJUNTAR);pre="Havia "+a+" "+o[1]+". Chegaram "+b+". "+qs(o[2])+o[1]+" há agora?";
    }else if(tipo==="separar"){
      o=pick(ODAR);pre=n1[0]+" tinha "+a+" "+o[1]+". "+ele2(n1)+" deu "+b+" para um amigo. "+qs(o[2])+o[1]+" sobraram?";
      l.push(["nome:"+n1[0],1]);
    }else{
      o=pick(OSAIR);pre="Havia "+a+" "+o[1]+". Foram embora "+b+". "+qs(o[2])+o[1]+" ficaram?";
    }
    var it=typed(pre,soma?a+b:a-b);it.key=tipo+"|"+a+"|"+b+"|"+o[0];it.limits=l;it._info={tipo:tipo,a:a,b:b,regroup:regroup,modo:modo};
    return it;
  };
}

/* ===================== Níveis 19 a 26: multiplicação, dobro, triplo e metade ===================== */
/* `3 × 4` lê-se "3 grupos de 4". Fatores trocados (3 × 4 e 4 × 3) nunca na mesma folha. */
var VEZES="×";
function figGrupos(g,q){
  var o=pick(X.OBJ),it=typed(qs(o.f)+o.pl+" há ao todo?",g*q,{t:"grupos",e:o.e,g:g,q:q});
  it.key="gfig|"+o.e+"|"+g+"|"+q;it._info={tipo:"fig",g:g,q:q};return it;
}
function contaX(k,n){                                  /* k × n ou n × k, na ordem sorteada */
  var dir=Math.random()<.5,it=typed((dir?k+" "+VEZES+" "+n:n+" "+VEZES+" "+k)+" =",k*n);
  it._info={tipo:"conta",k:k,n:n};return it;
}

/* Nível 19 — Parcelas iguais (EF02MA07): figura de grupos e soma de parcelas iguais, 4 + 4. */
function gParcelas(){
  var it,i;
  if(Math.random()<.5){it=figGrupos(rnd(2,5),rnd(2,6));it.limits=[["n19:fig",4]];return it}
  var k=rnd(2,5),p=rnd(2,10),t=[];for(i=0;i<k;i++)t.push(p);
  it=typed(t.join(" + ")+" =",k*p);it.limits=[["n19:som",4]];it._info={tipo:"soma",k:k,p:p};return it;
}

/* Níveis 20 a 23 — Multiplicar por 2, 3, 4 e 5 (EF02MA07, EF02MA08): figura, conta e texto (o dobro, o triplo ou "k vezes n"). */
function gTab(k,nivel){
  return function(){
    var n=rnd(2,10),r=Math.random(),it,l;
    if(r<.375){it=figGrupos(k,n);l=[["n"+nivel+":fig",3]]}
    else if(r<.75){it=contaX(k,n);l=[["n"+nivel+":conta",3],["pm"+nivel+":"+n,1]]}
    else{
      var nome={2:"o dobro",3:"o triplo"}[k];
      it=nome?typed("Qual é "+nome+" de "+n+"?",k*n):typed("Quanto é "+k+" vezes "+n+"?",k*n);
      it._info={tipo:nome?"nome":"vezes",k:k,n:n};l=[["n"+nivel+":txt",2]];
    }
    it.limits=l;return it;
  };
}

/* Nível 24 — As quatro tabuadas misturadas: 2 de cada tabuada nas 8 contas, uma de figura e uma de conta ou texto. */
function gTab24(){
  var k=rnd(2,5),n=rnd(2,10),it,r;
  if(Math.random()<.5){it=figGrupos(k,n);it.limits=[["n24:k"+k,2],["n24:k"+k+"f",1]];return it}
  r=Math.random();
  if(r<.5){it=contaX(k,n);it.limits=[["n24:k"+k,2],["n24:k"+k+"c",1],["pm24:"+Math.min(k,n)+","+Math.max(k,n),1]];return it}
  var nome={2:"o dobro",3:"o triplo"}[k];
  if(nome&&r<.75){it=typed("Qual é "+nome+" de "+n+"?",k*n);it._info={tipo:"nome",k:k,n:n}}
  else{it=typed("Quanto é "+k+" vezes "+n+"?",k*n);it._info={tipo:"vezes",k:k,n:n}}
  it.limits=[["n24:k"+k,2],["n24:k"+k+"c",1]];return it;
}

/* Nível 25 — Metade e terça parte (EF02MA08): repartir objetos em pratos, a metade e a terça parte. */
function gMetade(){
  var r=Math.random(),it,g,q,o;
  if(r<.375){                                       /* repartir com figura, 2 ou 3 pratos */
    g=pick([2,3]);q=rnd(2,10);o=pick(X.OBJ);
    it=typed("Divida igualmente "+(o.f?"as ":"os ")+g*q+" "+o.pl+" em "+g+" pratos. "+qs(o.f)+o.pl+" ficam em cada prato?",q,{t:"reparte",e:o.e,n:g*q,g:g});
    it.key="rep|"+o.e+"|"+g+"|"+q;it._info={tipo:"fig",g:g,q:q};it.limits=[["n25:fig",3]];
  }else if(r<.75){
    q=rnd(2,10);it=typed("Qual é a metade de "+2*q+"?",q);it._info={tipo:"metade",q:q};it.limits=[["n25:metade",3]];
  }else{
    q=rnd(2,10);it=typed("Qual é a terça parte de "+3*q+"?",q);it._info={tipo:"terca",q:q};it.limits=[["n25:terca",3]];
  }
  return it;
}

/* Nível 26 — Problemas de multiplicação, dobro, triplo e metade (EF02MA07, EF02MA08). Frases de até 18 palavras. */
var RECIP=[["caixa","caixas"],["pacote","pacotes"],["saco","sacos"],["cesta","cestas"],["prato","pratos"]];
var OITEM=[["lápis",0],["figurinhas",1],["balas",1],["livros",0],["adesivos",0],["flores",1]];
var OMETADE=[["balas",1],["figurinhas",1],["adesivos",0],["livros",0],["bolinhas",1]];
function gProb26(){
  var tipo=pick(["grupos","dobro","triplo","metade","terca"]),n1=pick(NAMES),n2,it,pre,l=[["n26:"+tipo,2]],o,q;
  if(tipo==="grupos"){
    var rc=pick(RECIP),g=rnd(2,5);q=rnd(2,10);o=pick(OITEM);
    pre="Cada "+rc[0]+" tem "+q+" "+o[0]+". "+qs(o[1])+o[0]+" há em "+g+" "+rc[1]+"?";
    it=typed(pre,g*q);it.key="p26g|"+rc[0]+"|"+g+"|"+q+"|"+o[0];it._info={tipo:tipo,g:g,q:q};
  }else if(tipo==="dobro"||tipo==="triplo"){
    var f=tipo==="dobro"?2:3;q=rnd(2,10);o=pick(OITEM);do{n2=pick(NAMES)}while(n2[0]===n1[0]);
    pre=n1[0]+" tem "+q+" "+o[0]+". "+n2[0]+" tem "+(f===2?"o dobro":"o triplo")+". "+qs(o[1])+o[0]+" "+n2[0]+" tem?";
    it=typed(pre,f*q);it.key="p26"+tipo+"|"+n1[0]+"|"+n2[0]+"|"+q+"|"+o[0];it._info={tipo:tipo,q:q};
    l.push(["nome:"+n1[0],1],["nome:"+n2[0],1]);
  }else{
    var d=tipo==="metade"?2:3;q=rnd(2,10);o=pick(OMETADE);
    pre=n1[0]+" tinha "+d*q+" "+o[0]+" e deu "+(d===2?"a metade":"a terça parte")+" para um amigo. "+qs(o[1])+o[0]+" "+(n1[1]==="f"?"ela":"ele")+" deu?";
    it=typed(pre,q);it.key="p26"+tipo+"|"+n1[0]+"|"+d*q+"|"+o[0];it._info={tipo:tipo,q:q};
    l.push(["nome:"+n1[0],1]);
  }
  it.limits=l;return it;
}

/* ===================== Níveis 27 a 32: padrões e geometria ===================== */
var COR_FIG=["#2457D6","#FFB92B","#F27AB0","#1CA97B"];      /* azul, amarelo, rosa e verde: diferem também em luminosidade */
function sortearCor(){return pick(COR_FIG)}

/* Nível 27 — Padrões de figuras, símbolos e palavras (EF02MA10, EF02MA11). A fila mostra dois períodos completos e o começo do
   terceiro, com um espaço no meio ou no fim; só um elemento completa o padrão. */
var PADROES={AB:"AB",AAB:"AAB",ABB:"ABB",ABC:"ABC",AABB:"AABB"};
var NPAD=Object.keys(PADROES);
var SIMB=["★","●","■","▲","♥","♦"],LETR=["A","B","C","D","E"];
var PALAV=[["sol","lua","estrela"],["gato","cachorro","peixe"],["verde","azul","amarelo"],["segunda","terça","quarta"],["janeiro","fevereiro","março"],["manhã","tarde","noite"]];
var SHP=["círculo","quadrado","triângulo"];
function fig27(c){return {fig:{t:"forma",n:c[0],color:c[1],s:.9,v:0,rot:0}}}
/* A fila é periódica se algum período q repete até o fim, com pelo menos dois períodos inteiros mais um elemento. */
function periodica(a){
  for(var q=1;2*q+1<=a.length;q++){var ok=true;for(var j=0;j+q<a.length;j++)if(a[j]!==a[j+q]){ok=false;break}if(ok)return true}
  return false;
}
function montaPadrao(){
  for(var tent=0;tent<200;tent++){
    var nome=pick(NPAD),pat=PADROES[nome],p=pat.length,e=rnd(1,p-1),S=2*p+e,seq=[],k,i;
    var letras=[];for(k=0;k<pat.length;k++)if(letras.indexOf(pat[k])<0)letras.push(pat[k]);
    var cel=function(i){return letras.indexOf(pat[i%p])};
    for(i=0;i<S;i++)seq.push(cel(i));
    var meio=Math.random()<.5,pos=meio?rnd(1,S-2):S;       /* S = o espaço fica no fim (depois do último) */
    var certa=meio?seq[pos]:cel(S),unico=true;
    for(var c=0;c<Math.max(3,letras.length);c++){
      var f=meio?seq.slice():seq.concat([0]);f[meio?pos:S]=c;
      if(periodica(f)!==(c===certa))unico=false;
    }
    if(unico)return {nome:nome,p:p,S:S,seq:seq,pos:pos,meio:meio,n:letras.length,certa:certa};
  }
  return {nome:"AB",p:2,S:5,seq:[0,1,0,1,0],pos:5,meio:false,n:2,certa:1};
}
function gPadroes(){
  var d=montaPadrao(),r=Math.random(),it,tp;
  var vis=function(el){return d.seq.map(function(k,i){return d.meio&&i===d.pos?"?":el[k]})};
  var fim=function(a){return d.meio?a:a.concat(["?"])};
  if(r<.375){                                        /* figuras */
    var combos=[],t=0;while(combos.length<Math.max(3,d.n)&&t++<300){var cb=[pick(SHP),sortearCor()];if(!combos.some(function(c){return c[0]===cb[0]&&c[1]===cb[1]}))combos.push(cb)}
    var el=combos.slice(0,d.n),certa=el[d.certa],wr=el.filter(function(c){return c!==certa}).concat(combos.slice(d.n)).slice(0,2).map(fig27);
    var items=fim(vis(el).map(function(x){return x==="?"?"?":fig27(x)}));
    it=choice("Qual figura completa o padrão?",fig27(certa),wr,{t:"fila",items:items,dir:"h"});
    it.limits=[["n27:fig",3]];tp="fig";
  }else if(r<.75){                                   /* símbolos e letras */
    var base=Math.random()<.5?SIMB:LETR,ev=embaralhar(base).slice(0,Math.max(3,d.n)),el2=ev.slice(0,d.n);
    var cert2=el2[d.certa],wr2=ev.filter(function(x){return x!==cert2}).slice(0,2);
    it=choice("Qual completa o padrão? "+fim(vis(el2)).join(" "),cert2,wr2,null);it.limits=[["n27:sim",3]];tp="sim";
  }else{                                             /* palavras */
    var conj=pick(PALAV),ev3=embaralhar(conj).slice(0,3),el3=ev3.slice(0,d.n);
    var cert3=el3[d.certa],wr3=ev3.filter(function(x){return x!==cert3}).slice(0,2);
    it=choice("Qual palavra completa o padrão? "+fim(vis(el3)).join(", "),cert3,wr3,null);it.limits=[["n27:pal",2]];tp="pal";
  }
  it._info={nome:d.nome,p:d.p,S:d.S,seq:d.seq,pos:d.pos,meio:d.meio,tipo:tp,certa:d.certa};
  return it;
}

/* Nível 28 — A regra de uma sequência de números (EF02MA10, EF02MA11): de quanto em quanto, o próximo e a regra. */
function seqNum(){
  var passo=pick([2,2,3,3,4,5,5,10,10,100]),sobe=Math.random()<.7,s,i,v=[];
  if(sobe)s=rnd(1,999-5*passo);else s=rnd(5*passo+1,999);
  for(i=0;i<5;i++)v.push(sobe?s+i*passo:s-i*passo);
  return {passo:passo,sobe:sobe,v:v};
}
function gRegra(){
  var q=seqNum(),r=Math.random(),it;
  if(r<.375){                                        /* de quanto em quanto? */
    var m=rnd(4,5),sh=q.v.slice(0,m);
    it=typed(sh.join(", ")+". De quanto em quanto a sequência "+(q.sobe?"cresce":"diminui")+"?",q.passo);it.limits=[["n28:t1",3]];
  }else if(r<.75){                                   /* qual é o próximo? */
    var m2=rnd(4,4);it=typed(q.v.slice(0,m2).join(", ")+",",q.v[m2]);it.limits=[["n28:t2",3]];
  }else{                                             /* qual é a regra? */
    var sh2=q.v.slice(0,rnd(4,5)),txt=function(sobe,p){return (sobe?"soma ":"tira ")+p};
    var certa=txt(q.sobe,q.passo),wr=[txt(!q.sobe,q.passo)],outro=[2,3,4,5,10].filter(function(x){return x!==q.passo});
    wr.push(txt(q.sobe,pick(outro)));
    it=choice(sh2.join(", ")+". Qual é a regra da sequência?",certa,wr,null);it.limits=[["n28:t3",2]];
  }
  it._info={passo:q.passo,sobe:q.sobe,v:q.v};
  return it;
}

/* Nível 29 — Localização com mais de um ponto de referência (EF02MA12): fileiras de objetos frontais e simétricos. */
var POS29=[{e:"🍎",n:"maçã",f:1},{e:"⚽",n:"bola",f:1},{e:"⭐",n:"estrela",f:1},{e:"🌼",n:"flor",f:1},{e:"🎈",n:"balão"},{e:"🍪",n:"biscoito"},{e:"🐶",n:"cachorro"},{e:"🐱",n:"gato"}];
function art(o){return o.f?"a ":"o "}
function cont(o){return o.f?"da ":"do "}
function gLocal(){
  var entre=Math.random()<.5,len=entre?rnd(4,5):5,ps=embaralhar(POS29).slice(0,len),i=rnd(0,len-3),a=ps[i],c=ps[i+2],meio=ps[i+1],it,fig;
  var wr=embaralhar(ps.filter(function(x){return x!==meio})).slice(0,3).map(function(x){return x.e});
  fig={t:"fila",items:ps.map(function(x){return x.e}),dir:"h"};
  if(entre){
    var o1=Math.random()<.5?[a,c]:[c,a];
    it=choice("Quem está entre "+art(o1[0])+o1[0].n+" e "+art(o1[1])+o1[1].n+"?",meio.e,wr,fig);it.limits=[["n29:entre",4]];
  }else if(Math.random()<.5){
    it=choice("Quem está à direita "+cont(a)+a.n+" e à esquerda "+cont(c)+c.n+"?",meio.e,wr,fig);it.limits=[["n29:dois",4]];
  }else{
    it=choice("Quem está à esquerda "+cont(c)+c.n+" e à direita "+cont(a)+a.n+"?",meio.e,wr,fig);it.limits=[["n29:dois",4]];
  }
  it._info={itens:ps.map(function(x){return x.e}),a:a.e,c:c.e,meio:meio.e,entre:entre};
  return it;
}

/* Nível 30 — Deslocamentos em quadriculado (EF02MA12): siga o caminho ou conte as casas. */
var CASA=function(c,r){return "ABCDEFGH".charAt(c-1)+r};
function gQuadro(){
  var n=pick([5,6]),it;
  if(Math.random()<.5){                              /* siga o caminho: um ou dois movimentos */
    var t=0,sx,sy,dx,dy,ex,ey,dir=["direita","esquerda","cima","baixo"],m1,m2,n1,n2;
    do{
      sx=rnd(1,n);sy=rnd(1,n);m1=pick(dir);n1=rnd(1,4);
      m2=Math.random()<.6?pick(dir.filter(function(d){return (m1==="direita"||m1==="esquerda")?(d==="cima"||d==="baixo"):(d==="direita"||d==="esquerda")})):null;n2=m2?rnd(1,4):0;
      dx=(m1==="direita"?n1:m1==="esquerda"?-n1:0)+(m2==="direita"?n2:m2==="esquerda"?-n2:0);
      dy=(m1==="cima"?n1:m1==="baixo"?-n1:0)+(m2==="cima"?n2:m2==="baixo"?-n2:0);
      ex=sx+dx;ey=sy+dy;
    }while((ex<1||ex>n||ey<1||ey>n)&&t++<500);
    var frase=function(m,k){return k+(k===1?" casa":" casas")+" para "+(m==="cima"?"cima":m==="baixo"?"baixo":"a "+m)};
    var certa=CASA(ex,ey),cand=[[ex+1,ey],[ex-1,ey],[ex,ey+1],[ex,ey-1],[sx-dx,sy-dy],[sx+dy,sy+dx],[sx+dx,sy-dy]],wr=[];
    embaralhar(cand).forEach(function(q){if(q[0]>=1&&q[0]<=n&&q[1]>=1&&q[1]<=n&&CASA(q[0],q[1])!==certa&&wr.indexOf(CASA(q[0],q[1]))<0&&wr.length<3)wr.push(CASA(q[0],q[1]))});
    for(var u=0;wr.length<3&&u<50;u++){var cc=CASA(rnd(1,n),rnd(1,n));if(cc!==certa&&wr.indexOf(cc)<0)wr.push(cc)}
    it=choice("Comece em "+CASA(sx,sy)+". Ande "+frase(m1,n1)+(m2?" e "+frase(m2,n2):"")+". Onde você chega?",certa,wr,{t:"quadriculado",c:n,r:n,s:[sx,sy]});
    it.limits=[["n30:t1",4]];it._info={n:n,sx:sx,sy:sy,m1:m1,n1:n1,m2:m2,n2:n2,ex:ex,ey:ey};
  }else{                                             /* quantas casas, para a direita, esquerda, cima ou baixo */
    var ax,ay,bx,by,k=0;
    do{ax=rnd(1,n);ay=rnd(1,n);bx=rnd(1,n);by=rnd(1,n)}while((ax===bx&&ay===by)&&k++<100);
    var eixos=[];if(bx!==ax)eixos.push("x");if(by!==ay)eixos.push("y");var eixo=pick(eixos);
    var palavra=eixo==="x"?(bx>ax?"para a direita":"para a esquerda"):(by>ay?"para cima":"para baixo");
    it=typed("Para ir da ● até a ★, quantas casas "+palavra+"?",Math.abs(eixo==="x"?bx-ax:by-ay),{t:"quadriculado",c:n,r:n,s:[ax,ay],d:[bx,by]});
    it.limits=[["n30:t2",4]];it._info={n:n,ax:ax,ay:ay,bx:bx,by:by,eixo:eixo};
  }
  return it;
}

/* Nível 31 — Sólidos geométricos (EF02MA14): o nome pelo desenho, por uma característica e por um objeto. */
var SOLS=["cubo","bloco retangular","pirâmide","cone","cilindro","esfera"];
function solOpts(certa){                              /* cubo e bloco retangular nunca juntos nas opções: todo cubo também é um bloco */
  var out=[certa],pool=embaralhar(SOLS.filter(function(x){return x!==certa}));
  pool.forEach(function(x){
    var par=x==="cubo"?"bloco retangular":x==="bloco retangular"?"cubo":null;
    if(out.length<4&&!(par&&out.indexOf(par)>=0))out.push(x);
  });
  return out.slice(1);
}
var CARACT=[["Qual sólido tem 6 faces quadradas?","cubo"],["Qual sólido tem 6 faces retangulares?","bloco retangular"],["Qual sólido tem duas faces redondas e rola?","cilindro"],
  ["Qual sólido tem uma ponta e uma face redonda?","cone"],["Qual sólido não tem nenhuma face plana?","esfera"],["Qual sólido tem uma base quadrada e quatro faces triangulares?","pirâmide"]];
var OBJS31=[["uma bola de futebol","esfera"],["uma bola de basquete","esfera"],["o globo terrestre","esfera"],["uma lata de leite","cilindro"],["uma vela","cilindro"],["um tubo de cola","cilindro"],
  ["uma caixa de sapato","bloco retangular"],["um tijolo","bloco retangular"],["um chapéu de festa","cone"],["um dado","cubo"],["um cubo de gelo","cubo"]];
function cap1(t){return t.charAt(0).toUpperCase()+t.slice(1)}
function gSolidos2(){
  var r=Math.random(),it,n;
  if(r<.375){n=pick(SOLS);it=choice("Como se chama este sólido?",n,solOpts(n),{t:"solid",n:n});it.limits=[["n31:t1",3]];it._info={tipo:"nome",n:n}}
  else if(r<.75){var c=pick(CARACT);it=choice(c[0],c[1],solOpts(c[1]),null);it.key="car|"+c[0];it.limits=[["n31:t2",3]];it._info={tipo:"car",n:c[1]}}
  else{var o=pick(OBJS31);it=choice(cap1(o[0])+" tem a forma de qual sólido?",o[1],solOpts(o[1]),null);it.key="obj|"+o[0];it.limits=[["n31:t3",2]];it._info={tipo:"obj",n:o[1]}}
  return it;
}

/* Nível 32 — Figuras planas: lados, vértices e características (EF02MA15). */
var FIGS=["triângulo","quadrado","retângulo","círculo","pentágono","hexágono"];
function fig32(n,cor,ponta){
  if(n==="pentágono"||n==="hexágono")return {t:"shape",n:n,color:cor};
  var f={t:"forma",n:n,color:cor};
  if(n==="retângulo"){f.o=pick(["h","v"]);f.r=+(1.4+Math.random()*1.1).toFixed(2)}
  if(n==="triângulo"){f.v=rnd(0,4);f.rot=pick([0,90,180,270])}
  if(n==="quadrado"&&ponta)f.rot=45;
  return f;
}
var LADOS={"triângulo":3,"quadrado":4,"retângulo":4,"pentágono":5,"hexágono":6};
function gPlanas(){
  var r=Math.random(),cor=sortearCor(),it,n;
  if(r<.375){                                        /* contar lados ou vértices */
    n=pick(Object.keys(LADOS));var lado=Math.random()<.5;
    it=typed("Quantos "+(lado?"lados":"vértices")+" tem esta figura?",LADOS[n],fig32(n,cor,Math.random()<.3));it.limits=[["n32:t1",3]];
    it.key="cont|"+(lado?"l":"v")+"|"+n+"|"+JSON.stringify(it.extra.fig);it._info={tipo:"cont",n:n};
  }else if(r<.75){                                   /* nome da figura (o quadrado pode vir "de ponta"; "retângulo" fica fora das opções do quadrado) */
    n=pick(FIGS);var wr=embaralhar(FIGS.filter(function(x){return x!==n&&!(n==="quadrado"&&x==="retângulo")})).slice(0,3);
    var f=fig32(n,cor,Math.random()<.35);
    it=choice("Como se chama esta figura?",n,wr,f);it.key="nome|"+n+"|"+JSON.stringify(f);it.limits=[["n32:t2",3]];it._info={tipo:"nome",n:n};
  }else{                                             /* qual figura tem… */
    var q=pick([["Qual figura tem 4 lados iguais?","quadrado"],["Qual figura não tem vértices?","círculo"],["Qual figura tem 3 vértices?","triângulo"],["Qual figura tem 5 lados?","pentágono"],["Qual figura tem 6 lados?","hexágono"]]);
    var outros=embaralhar(FIGS.filter(function(x){return x!==q[1]&&!(q[1]==="quadrado"&&x==="quadrado")})).slice(0,rnd(2,3));
    var opts=outros.map(function(x){return {fig:fig32(x,cor,false)}});
    it=choice(q[0],{fig:fig32(q[1],cor,false)},opts,null);it.key="qual|"+q[0]+"|"+outros.join(",");it.limits=[["n32:t3",2]];it._info={tipo:"qual",n:q[1]};
  }
  return it;
}

/* ===================== Níveis 33 a 41: medidas, tempo, dinheiro, acaso e dados ===================== */
var OBREG={lapis:["lápis","o"],fita:["fita","a"],clipe:["clipe","o"],borracha:["borracha","a"]};
var KREG=Object.keys(OBREG);
/* Nível 33 — Medir com a régua e comparar comprimentos (EF02MA16): as peças ficam encostadas no zero, sempre de medida inteira. */
var METRO=["uma sala de aula","o pátio da escola","uma quadra de esportes","um corredor da escola","uma rua"],CENTIM=["um clipe","um lápis","uma borracha","uma formiga","uma moeda","um dedo da mão"];
function gRegua(){
  var r=Math.random(),it;
  if(r<.5){
    var k=pick(KREG),len=rnd(2,15);
    it=typed("Quanto mede "+OBREG[k][1]+" "+OBREG[k][0]+"?",len,{t:"regua",max:15,objs:[{k:k,len:len}]},"cm");
    it.limits=[["n33:t1",4]];it._info={tipo:"medir",k:k,len:len};
  }else if(r<.75){
    var k1=pick(KREG),k2;do{k2=pick(KREG)}while(k2===k1);
    var a,b;do{a=rnd(2,15);b=rnd(2,15)}while(a===b||Math.abs(a-b)>12);
    var big=a>b?k1:k2,small=a>b?k2:k1,maior=Math.random()<.5;
    var pre=maior?"Quantos centímetros "+OBREG[big][1]+" "+OBREG[big][0]+" é maior que "+OBREG[small][1]+" "+OBREG[small][0]+"?":"Quantos centímetros "+OBREG[small][1]+" "+OBREG[small][0]+" é menor que "+OBREG[big][1]+" "+OBREG[big][0]+"?";
    it=typed(pre,Math.abs(a-b),{t:"regua",max:15,objs:[{k:k1,len:a},{k:k2,len:b}]},"cm");it.limits=[["n33:t2",2]];it._info={tipo:"comparar",k1:k1,a:a,k2:k2,b:b,maior:maior};
  }else{
    var metro=Math.random()<.5,obj=pick(metro?METRO:CENTIM);
    var de=/^o /.test(obj)?"do "+obj.slice(2):/^a /.test(obj)?"da "+obj.slice(2):"de "+obj;
    it=choice("Qual unidade é melhor para medir o comprimento "+de+"?",metro?"metro":"centímetro",[metro?"centímetro":"metro"],null);
    it.key="uni33|"+obj;it.limits=[["n33:t3",2]];it._info={tipo:"unidade",obj:obj,metro:metro};
  }
  return it;
}

/* Nível 34 — O contorno (perímetro) de polígonos (EF02MA16). Lados inteiros de 1 a 10, contorno de até 40 cm; todos os lados escritos (menos o que falta). */
function ladosPoli(n){
  var a,b,c,t=0,i,l;
  if(n==="quadrado"){a=rnd(1,10);return [a,a,a,a]}
  if(n==="retângulo"){do{a=rnd(1,10);b=rnd(1,10)}while(a===b);return [a,b,a,b]}
  if(n==="triângulo"){do{a=rnd(1,10);b=rnd(1,10);c=rnd(1,10)}while((a+b<=c||a+c<=b||b+c<=a)&&t++<500);return [a,b,c]}
  l=[];for(i=0;i<5;i++)l.push(rnd(1,8));return l;
}
function gContorno(){
  var it,n,l,tot;
  if(Math.random()<.625){
    n=pick(["triângulo","quadrado","retângulo","pentágono"]);l=ladosPoli(n);tot=l.reduce(function(x,y){return x+y},0);
    it=typed("Qual é a medida do contorno?",tot,{t:"poligono",n:n,lados:l},"cm");it.limits=[["n34:t1",5]];it._info={tipo:"somar",n:n,lados:l};
  }else{
    n=pick(["triângulo","retângulo","quadrado"]);l=ladosPoli(n);tot=l.reduce(function(x,y){return x+y},0);var falta=rnd(0,l.length-1);
    it=typed("O contorno mede "+tot+" cm. Quanto mede o lado que falta?",l[falta],{t:"poligono",n:n,lados:l,falta:falta},"cm");
    it.limits=[["n34:t2",3]];it._info={tipo:"falta",n:n,lados:l,falta:falta,tot:tot};
  }
  return it;
}

/* Nível 35 — Capacidade e massa (EF02MA17): qual unidade, comparar na mesma unidade e a balança de pratos. Sem conversão entre unidades. */
var UNI35=[["massa","quilograma","grama",["uma pessoa","um saco de arroz","uma melancia","um cachorro grande"],["uma moeda","um clipe","uma folha de papel","um anel"]],
  ["capacidade","litro","mililitro",["uma piscina","uma caixa-d'água","um balde","o tanque de um carro"],["uma colher de remédio","uma colher de chá","um frasco de colírio","uma xícara de café"]]];
var BAL=[["🐘","🐜"],["🚗","🍎"],["🍉","🍒"],["🐘","🐭"],["🏠","🎈"],["🚗","🎈"]];
function gGrandezas2(){
  var r=Math.random(),it;
  if(r<.375){
    var g=pick(UNI35),grande=Math.random()<.5,obj=pick(grande?g[3]:g[4]),certa=grande?g[1]:g[2],outra=grande?g[2]:g[1];
    it=choice("Qual unidade é melhor para medir a "+g[0]+" de "+obj+"?",certa,[outra],null);it.key="uni35|"+g[0]+"|"+obj;it.limits=[["n35:t1",3]];it._info={tipo:"unidade",g:g[0],obj:obj,certa:certa};
  }else if(r<.75){
    var cap=Math.random()<.5,peq=Math.random()<.5,mais=Math.random()<.5,a,b;
    do{a=peq?rnd(1,9)*100:rnd(1,9);b=peq?rnd(1,9)*100:rnd(1,9)}while(a===b);
    var un=cap?(peq?"mililitros":"litros"):(peq?"gramas":"quilogramas"),ua=a+" "+un,ub=b+" "+un,maior=a>b?ua:ub,menor=a>b?ub:ua;
    var q=cap?(mais?"Qual tem mais água":"Qual tem menos água"):(mais?"Qual é mais pesado":"Qual é mais leve");
    it=choice(q+": "+ua+" ou "+ub+"?",mais?maior:menor,[mais?menor:maior],null);it.limits=[["n35:t2",3]];it._info={tipo:"comparar",cap:cap,mais:mais,a:a,b:b,un:un};
  }else{
    var par=pick(BAL),pesadoDir=Math.random()<.5,maisp=Math.random()<.5;   /* par[0] é o mais pesado; ângulo positivo: o prato da direita desce */
    var esq=pesadoDir?par[1]:par[0],dir=pesadoDir?par[0]:par[1],ang=pesadoDir?12:-12;
    it=choice("Qual é o mais "+(maisp?"pesado":"leve")+"?",maisp?par[0]:par[1],[maisp?par[1]:par[0]],{t:"balanca",l:esq,r:dir,a:ang});
    it.limits=[["n35:t3",2]];it._info={tipo:"balanca",maisp:maisp};
  }
  return it;
}

/* Nível 36 — Calendário: a duração entre duas datas (EF02MA18). */
var DIAS2=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
var MESES2=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
var FATOS36=[["Quantos dias tem uma semana?",7],["Quantos meses tem um ano?",12],["Quantos dias da semana têm \"feira\" no nome?",5],["Quantos meses do ano começam com a letra J?",3]];
function gCalendario(){
  var r=Math.random(),it;
  if(r<.25){
    var w=rnd(0,6),k=rnd(1,6),certa=DIAS2[(w+k)%7];
    it=choice("Hoje é "+DIAS2[w]+". Que dia da semana será daqui a "+k+(k===1?" dia":" dias")+"?",certa,embaralhar(DIAS2.filter(function(x){return x!==certa})).slice(0,3),null);
    it.limits=[["n36:t1",3]];it._info={tipo:"semana",w:w,k:k};
  }else if(r<.5){
    var y=rnd(2026,2028),m=rnd(0,11),ult=new Date(y,m+1,0).getDate(),d1=rnd(1,ult-2),d2=rnd(d1+2,Math.min(ult,d1+15));
    it=typed("Quantos dias se passam do dia "+d1+" até o dia "+d2+"?",d2-d1,{t:"calendario",y:y,m:m});it.limits=[["n36:t2",3]];it._info={tipo:"datas",y:y,m:m,d1:d1,d2:d2};
  }else if(r<.75){
    var q=Math.random();
    if(q<.5){
      var depois=Math.random()<.5,i=depois?rnd(0,10):rnd(1,11),cert=MESES2[depois?i+1:i-1];
      it=choice("Qual mês vem "+(depois?"depois":"antes")+" de "+MESES2[i]+"?",cert,embaralhar(MESES2.filter(function(x){return x!==cert&&x!==MESES2[i]})).slice(0,3),null);it._info={tipo:"mes",i:i,depois:depois};
    }else{
      var dif=rnd(2,6),i0=rnd(0,11-dif);it=typed("Quantos meses se passam de "+MESES2[i0]+" até "+MESES2[i0+dif]+"?",dif);it._info={tipo:"meses",i0:i0,dif:dif};
    }
    it.limits=[["n36:t3",3]];
  }else{
    var f=pick(FATOS36);it=typed(f[0],f[1]);it.limits=[["n36:t4",2]];it._info={tipo:"fato"};
  }
  return it;
}

/* Nível 37 — Relógio digital: início, fim e duração (EF02MA19). Só horas cheias e meias horas, das 6:00 às 22:00 (24 horas). */
var EVENTOS37=["A aula","O recreio","O filme","O jogo","A festa","O lanche","A visita"];
function hm(h,m){return h+":"+(m<10?"0":"")+m}
function palavras(h,m){return m===0?h+" horas":h+" e meia"}
function gDigital(){
  var r=Math.random(),it,ev=pick(EVENTOS37),h,m,d;
  if(r<.25){
    h=rnd(6,22);m=pick([0,30]);var certa=palavras(h,m),h2=pick([h-1,h+1].filter(function(x){return x>=6&&x<=22}));
    var wr=[palavras(h,m===0?30:0),palavras(h2,m)];
    it=choice("Que horas são?",certa,wr,{t:"digital",h:h,m:m});it.limits=[["n37:t1",2]];it._info={tipo:"ler",h:h,m:m};
  }else if(r<.5){
    m=pick([0,30]);d=rnd(1,4);h=rnd(6,22-d);
    it=typed(ev+" começou às "+hm(h,m)+" e terminou às "+hm(h+d,m)+". Quantas horas durou?",d);it.limits=[["n37:t2",2]];it._info={tipo:"duracao",h:h,m:m,d:d};
  }else if(r<.75){
    m=pick([0,30]);d=rnd(1,3);h=rnd(6,20-d);var fim=hm(h+d,m),alt=[hm(h+d-1,m),hm(h+d+1,m),hm(h+d,m===0?30:0)].filter(function(x){return x!==fim});
    it=choice(ev+" começou às "+hm(h,m)+" e durou "+d+(d===1?" hora":" horas")+". A que horas terminou?",fim,embaralhar(alt).slice(0,2),null);it.limits=[["n37:t3",2]];it._info={tipo:"fim",h:h,m:m,d:d};
  }else{
    var s0=pick([0,30]);h=rnd(6,21);var ini=hm(h,s0),fimm=s0===0?hm(h,30):hm(h+1,0);
    it=typed(ev+" começou às "+ini+" e terminou às "+fimm+". Quantos minutos durou?",30);it.limits=[["n37:t4",2]];it._info={tipo:"meia",h:h,s0:s0};
  }
  return it;
}

/* Níveis 38 e 39 — Moedas e cédulas (EF02MA20): total, equivalência e conjunto com o mesmo valor. */
function ordPecas(a){return a.slice().sort(function(x,y){return y.v-x.v})}
function somaPecas(a,real){return a.reduce(function(t,x){return t+x.v},0)}
/* sorteia peças (de 2 a max) cuja soma é exatamente alvo */
function conjunto(vals,alvo,min,max,mk){
  var t=0;
  while(t++<2000){
    var rest=alvo,pc=[];
    while(rest>0&&pc.length<max){var fit=vals.filter(function(v){return v<=rest});if(!fit.length)break;var v=pick(fit);pc.push(v);rest-=v}
    if(rest===0&&pc.length>=min)return pc.map(mk).sort(function(x,y){return y.v-x.v});
  }
  return null;
}
var MOEDAS38=[5,10,25,50],EQ38=[[5,10,2],[5,25,5],[5,50,10],[10,50,5],[25,50,2],[10,100,10],[25,100,4],[50,100,2],[5,100,20]];
function txtC(v){return v===100?"1 real":v+" centavos"}
function gCentavos(){
  var r=Math.random(),it;
  var mk=function(v){return {k:"moeda",v:v}};
  if(r<.375){
    var pc,t=0,tot;
    do{pc=[];for(var i=rnd(2,5);i>0;i--)pc.push(mk(pick(MOEDAS38)));tot=somaPecas(pc)}while((tot>100||tot<15)&&t++<500);
    pc=ordPecas(pc);it=typed("Quanto vale tudo junto?",tot,{t:"dinheiro",items:pc},"centavos");it.key="c38|"+pc.map(function(x){return x.v}).join(",");
    it.limits=[["n38:t1",3]];it._info={tipo:"total"};
  }else if(r<.75){
    var q=pick(EQ38);it=typed("Quantas moedas de "+q[0]+" centavos valem uma moeda de "+txtC(q[1])+"?",q[2]);it.limits=[["n38:t2",3]];it._info={tipo:"equiv",a:q[0],b:q[1]};
  }else{
    var certa=conjunto(MOEDAS38,50,2,5,mk),sums=embaralhar([35,40,45,55,60,65]).slice(0,2),opts=[];
    sums.forEach(function(sv){var c=conjunto(MOEDAS38,sv,2,5,mk);if(c)opts.push({fig:{t:"dinheiro",items:c}})});
    it=choice("Qual conjunto vale o mesmo que 50 centavos?",{fig:{t:"dinheiro",items:certa}},opts,null);it.key="c38s|"+JSON.stringify(it.extra.opts);it.limits=[["n38:t3",2]];it._info={tipo:"conjunto"};
  }
  return it;
}
var PECAS39=[{k:"moeda",v:1},{k:"cedula",v:2},{k:"cedula",v:5},{k:"cedula",v:10},{k:"cedula",v:20},{k:"cedula",v:50}],EQ39=[[2,10,5],[5,10,2],[5,20,4],[10,20,2],[10,50,5],[5,50,10],[2,20,10],[20,50,0]];
function txtR(v){return v===1?"1 real":v+" reais"}
function gReais(){
  var r=Math.random(),it;
  var mk=function(v){return v===1?{k:"moeda",v:100}:{k:"cedula",v:v}};
  var val=function(x){return x.k==="moeda"?1:x.v};
  if(r<.375){
    var pc,t=0,tot;
    do{pc=[];for(var i=rnd(2,4);i>0;i--)pc.push(pick(PECAS39));tot=pc.reduce(function(a,x){return a+(x.k==="moeda"?1:x.v)},0)}while((tot>100||tot<3)&&t++<500);
    pc=pc.map(function(x){return x.k==="moeda"?{k:"moeda",v:100}:x}).sort(function(x,y){return val(y)-val(x)});
    it=typed("Quanto dinheiro há aqui?",tot,{t:"dinheiro",items:pc},"reais");it.key="r39|"+pc.map(val).join(",");it.limits=[["n39:t1",3]];it._info={tipo:"total"};
  }else if(r<.75){
    var q=pick(EQ39.slice(0,7));it=typed("Quantas cédulas de "+q[0]+" reais valem uma de "+q[1]+" reais?",q[2]);it.limits=[["n39:t2",3]];it._info={tipo:"equiv",a:q[0],b:q[1]};
  }else{
    var T=pick([5,10,20]),vals=[1,2,5,10,20,50].filter(function(v){return v<=T}),certa=conjunto(vals,T,2,5,mk).sort(function(x,y){return val(y)-val(x)});
    var alts=embaralhar([T-2,T-1,T+1,T+2,T+5].filter(function(x){return x>=3})),opts=[];
    for(var j=0;j<alts.length&&opts.length<2;j++){var c=conjunto([1,2,5,10,20,50].filter(function(v){return v<=alts[j]}),alts[j],2,5,mk);if(c)opts.push({fig:{t:"dinheiro",items:c.sort(function(x,y){return val(y)-val(x)})}})}
    it=choice("Qual conjunto vale o mesmo que uma cédula de "+T+" reais?",{fig:{t:"dinheiro",items:certa}},opts,null);it.key="r39s|"+JSON.stringify(it.extra.opts);it.limits=[["n39:t3",2]];it._info={tipo:"conjunto",T:T};
  }
  return it;
}

/* Nível 40 — Provável, improvável e impossível (EF02MA21): saco de bolas e frases do dia a dia. Quatro classes. */
var CLASSES=["impossível","pouco provável","muito provável","certo"];
var FRASES40={
  "certo":["O Sol vai nascer amanhã.","Depois da terça-feira vem a quarta-feira.","Uma semana tem sete dias.","Se hoje é segunda-feira, amanhã é terça-feira.","A água do mar é salgada.","Um ano tem doze meses."],
  "muito provável":["A professora vai chegar à escola amanhã.","Vai fazer calor no verão.","Você vai dormir esta noite.","O ônibus escolar vai passar hoje.","Uma criança sentir fome antes do jantar.","Alguém usar guarda-chuva num dia de chuva forte."],
  "pouco provável":["Amanhã vai chover no deserto do Saara.","Você encontrar um tesouro no quintal.","Ganhar o prêmio de uma rifa com mil bilhetes.","Nevar hoje na cidade de Recife.","Um passarinho pousar na sua mão agora.","Encontrar um trevo de quatro folhas por acaso."],
  "impossível":["Um cachorro falar português.","Uma pessoa viver 300 anos.","Depois da segunda-feira vir a quinta-feira.","Um dado comum mostrar o número 9.","Uma semana ter dez dias.","Uma pedra solta no ar subir sozinha."]
};
function gAcaso2(){
  var cl=pick(CLASSES),it;
  if(Math.random()<.625){
    var cor=pick(["r","a"]),outra=cor==="r"?"a":"r",n=rnd(4,10),k,balls=[],i;
    if(cl==="certo")k=n;else if(cl==="impossível")k=0;
    else if(cl==="pouco provável")k=rnd(1,Math.floor(n*.25));else k=rnd(Math.ceil(n*.75),n-1);
    for(i=0;i<n;i++)balls.push(i<k?cor:outra);balls=embaralhar(balls);
    it=choice("Vou tirar uma bola "+(cor==="r"?"vermelha":"azul")+" sem olhar. Isso é…",cl,CLASSES.filter(function(x){return x!==cl}),{t:"bolas",balls:balls});
    it.key="sc40|"+cor+"|"+balls.join("");it.limits=[["n40:t1",5]];it._info={tipo:"saco",cor:cor,n:n,k:k};
  }else{
    var fr=pick(FRASES40[cl]);
    it=choice(fr+" Isso é…",cl,CLASSES.filter(function(x){return x!==cl}),null);it.key="fr40|"+fr;it.limits=[["n40:t2",3]];it._info={tipo:"frase",fr:fr};
  }
  return it;
}

/* Nível 41 — Tabelas de dupla entrada e gráficos de barras (EF02MA22). */
var TEMAS41=[{t:"Frutas preferidas das turmas",l:["maçã","banana","uva","pera","laranja"]},{t:"Esportes preferidos das turmas",l:["futebol","vôlei","natação","judô","corrida"]},
  {t:"Bichinhos preferidos das turmas",l:["gato","cachorro","peixe","pássaro","coelho"]},{t:"Cores preferidas das turmas",l:["azul","verde","rosa","amarelo","roxo"]}];
function maxUnico(v){var m=Math.max.apply(null,v);return v.filter(function(x){return x===m}).length===1}
function gTabelas(){
  var r=Math.random(),tm=pick(TEMAS41),it,tipo=r<.375?1:r<.75?2:3;
  if(Math.random()<2/3){                           /* tabela de dupla entrada */
    var cols=embaralhar(tm.l).slice(0,3),rows=["Turma A","Turma B"],v,t=0,ri=rnd(0,1),ci=rnd(0,2);
    do{v=[[rnd(1,15),rnd(1,15),rnd(1,15)],[rnd(1,15),rnd(1,15),rnd(1,15)]]}while(tipo===2&&!maxUnico(v[ri])&&t++<500);
    var fig={t:"tabela2",title:tm.t,rows:rows,cols:cols,v:v};
    if(tipo===1)it=typed("Quantas crianças da "+rows[ri]+" escolheram "+cols[ci]+"?",v[ri][ci],fig);
    else if(tipo===2){var mx=Math.max.apply(null,v[ri]),certa=cols[v[ri].indexOf(mx)];it=choice("Qual opção a "+rows[ri]+" mais escolheu?",certa,cols.filter(function(x){return x!==certa}),fig)}
    else if(Math.random()<.5){
      var c2=rnd(0,2),A=v[0][c2],B=v[1][c2];
      if(A===B){v[1][c2]=B>1?B-1:B+1;B=v[1][c2]}
      var mai=A>B?0:1;it=typed("Quantas crianças a mais da "+rows[mai]+" do que da "+rows[1-mai]+" escolheram "+cols[c2]+"?",Math.abs(A-B),fig);
    }else{var c3=rnd(0,2);it=typed("Quantas crianças das duas turmas juntas escolheram "+cols[c3]+"?",v[0][c3]+v[1][c3],fig)}
    it.limits=[["n41:t"+tipo,3]];it._info={tipo:tipo,tab:true,fig:fig};
  }else{                                           /* gráfico de barras */
    var n=rnd(3,5),lab=embaralhar(tm.l).slice(0,n),vals,t2=0;
    do{vals=lab.map(function(){return rnd(1,10)})}while(tipo===2&&!maxUnico(vals)&&t2++<500);
    var f={t:"bars",title:tm.t,labels:lab,values:vals};
    if(tipo===1){var i=rnd(0,n-1);it=typed("Quantas crianças escolheram "+lab[i]+"?",vals[i],f)}
    else if(tipo===2){var mx2=Math.max.apply(null,vals),cer=lab[vals.indexOf(mx2)];it=choice("Qual opção teve mais votos?",cer,embaralhar(lab.filter(function(x){return x!==cer})).slice(0,3),f)}
    else if(Math.random()<.5){
      var a=rnd(0,n-1),b;do{b=rnd(0,n-1)}while(b===a);
      if(vals[a]===vals[b]){vals[b]=vals[a]>1?vals[a]-1:vals[a]+1;f.values=vals}
      var big=vals[a]>vals[b]?a:b,sm=big===a?b:a;it=typed("Quantas crianças a mais escolheram "+lab[big]+" do que "+lab[sm]+"?",vals[big]-vals[sm],f);
    }else{var a2=rnd(0,n-1),b2;do{b2=rnd(0,n-1)}while(b2===a2);it=typed("Quantas crianças escolheram "+lab[a2]+" ou "+lab[b2]+"?",vals[a2]+vals[b2],f)}
    it.limits=[["n41:t"+tipo,3]];it._info={tipo:tipo,tab:false,fig:f};
  }
  return it;
}

FC.G2=[
  {nivel:1,id:"g2n01",nome:"Nível 1 — Contar de 2 em 2, de 5 em 5 e de 10 em 10",hab:["EF02MA09","EF02MA11"],meta:90,gen:gContarMisto,ano:2},
  {nivel:2,id:"g2n02",nome:"Nível 2 — Centenas, dezenas e unidades (material dourado)",hab:["EF02MA04"],meta:100,gen:gMaterial,ano:2},
  {nivel:3,id:"g2n03",nome:"Nível 3 — Valor posicional e o zero",hab:["EF02MA01","EF02MA04"],meta:110,gen:gPosicional,ano:2},
  {nivel:4,id:"g2n04",nome:"Nível 4 — Decompor números até 999",hab:["EF02MA04"],meta:110,gen:gDecompor3,ano:2},
  {nivel:5,id:"g2n05",nome:"Nível 5 — Comparar e ordenar números até 999",hab:["EF02MA01"],meta:100,gen:gOrdemNum,ano:2},
  {nivel:6,id:"g2n06",nome:"Nível 6 — Sequências a partir de qualquer número",hab:["EF02MA09","EF02MA11"],meta:100,gen:gSequencia3,ano:2},
  {nivel:7,id:"g2n07",nome:"Nível 7 — Estimar quantidades até 1000",hab:["EF02MA02"],meta:120,gen:gEstimar,ano:2},
  {nivel:8,id:"g2n08",nome:"Nível 8 — Somas de dois algarismos, sem reagrupar",hab:["EF02MA05","EF02MA06"],meta:100,gen:gSomaSem,ano:2},
  {nivel:9,id:"g2n09",nome:"Nível 9 — Somas de dois algarismos, com reagrupamento",hab:["EF02MA05","EF02MA06"],meta:120,gen:gSomaCom,ano:2},
  {nivel:10,id:"g2n10",nome:"Nível 10 — Subtrações de dois algarismos, sem reagrupar",hab:["EF02MA05","EF02MA06"],meta:100,gen:gSubSem,ano:2},
  {nivel:11,id:"g2n11",nome:"Nível 11 — Subtrações de dois algarismos, com reagrupamento",hab:["EF02MA05","EF02MA06"],meta:120,gen:gSubCom,ano:2},
  {nivel:12,id:"g2n12",nome:"Nível 12 — Contas de dois algarismos, misturadas",hab:["EF02MA05","EF02MA06"],meta:120,gen:gMisto2,ano:2},
  {nivel:13,id:"g2n13",nome:"Nível 13 — Centenas e dezenas inteiras",hab:["EF02MA04","EF02MA05"],meta:100,gen:gCentenas,ano:2},
  {nivel:14,id:"g2n14",nome:"Nível 14 — Somas e subtrações com três algarismos, sem reagrupar",hab:["EF02MA06"],meta:120,gen:gTres,ano:2},
  {nivel:15,id:"g2n15",nome:"Nível 15 — Quanto falta? (o número escondido)",hab:["EF02MA05"],meta:110,gen:gEscondido,ano:2},
  {nivel:16,id:"g2n16",nome:"Nível 16 — Quantos a mais, quantos a menos?",hab:["EF02MA03","EF02MA06"],meta:120,gen:gMaisMenos,ano:2},
  {nivel:17,id:"g2n17",nome:"Nível 17 — Problemas de adição e subtração até 100",hab:["EF02MA06"],meta:140,gen:gProb(17),ano:2},
  {nivel:18,id:"g2n18",nome:"Nível 18 — Problemas de adição e subtração até 999",hab:["EF02MA06"],meta:150,gen:gProb(18),ano:2},
  {nivel:19,id:"g2n19",nome:"Nível 19 — Parcelas iguais",hab:["EF02MA07"],meta:100,gen:gParcelas,ano:2},
  {nivel:20,id:"g2n20",nome:"Nível 20 — Multiplicar por 2 e o dobro",hab:["EF02MA07","EF02MA08"],meta:100,gen:gTab(2,20),ano:2},
  {nivel:21,id:"g2n21",nome:"Nível 21 — Multiplicar por 3 e o triplo",hab:["EF02MA07","EF02MA08"],meta:100,gen:gTab(3,21),ano:2},
  {nivel:22,id:"g2n22",nome:"Nível 22 — Multiplicar por 4",hab:["EF02MA07"],meta:100,gen:gTab(4,22),ano:2},
  {nivel:23,id:"g2n23",nome:"Nível 23 — Multiplicar por 5",hab:["EF02MA07"],meta:100,gen:gTab(5,23),ano:2},
  {nivel:24,id:"g2n24",nome:"Nível 24 — Multiplicar por 2, 3, 4 e 5, misturadas",hab:["EF02MA07"],meta:120,gen:gTab24,ano:2},
  {nivel:25,id:"g2n25",nome:"Nível 25 — Metade e terça parte",hab:["EF02MA08"],meta:110,gen:gMetade,ano:2},
  {nivel:26,id:"g2n26",nome:"Nível 26 — Problemas de multiplicação, dobro, triplo e metade",hab:["EF02MA07","EF02MA08"],meta:140,gen:gProb26,ano:2},
  {nivel:27,id:"g2n27",nome:"Nível 27 — Padrões de figuras, símbolos e palavras",hab:["EF02MA10","EF02MA11"],meta:100,gen:gPadroes,ano:2},
  {nivel:28,id:"g2n28",nome:"Nível 28 — A regra de uma sequência de números",hab:["EF02MA10","EF02MA11"],meta:110,gen:gRegra,ano:2},
  {nivel:29,id:"g2n29",nome:"Nível 29 — Localização com mais de um ponto de referência",hab:["EF02MA12"],meta:110,gen:gLocal,ano:2},
  {nivel:30,id:"g2n30",nome:"Nível 30 — Deslocamentos em quadriculado",hab:["EF02MA12"],meta:120,gen:gQuadro,ano:2},
  {nivel:31,id:"g2n31",nome:"Nível 31 — Sólidos geométricos",hab:["EF02MA14"],meta:110,gen:gSolidos2,ano:2},
  {nivel:32,id:"g2n32",nome:"Nível 32 — Figuras planas: lados, vértices e características",hab:["EF02MA15"],meta:110,gen:gPlanas,ano:2},
  {nivel:33,id:"g2n33",nome:"Nível 33 — Medir com a régua e comparar comprimentos",hab:["EF02MA16"],meta:110,gen:gRegua,ano:2},
  {nivel:34,id:"g2n34",nome:"Nível 34 — O contorno (perímetro) de polígonos",hab:["EF02MA16"],meta:120,gen:gContorno,ano:2},
  {nivel:35,id:"g2n35",nome:"Nível 35 — Capacidade e massa",hab:["EF02MA17"],meta:100,gen:gGrandezas2,ano:2},
  {nivel:36,id:"g2n36",nome:"Nível 36 — Calendário: a duração entre duas datas",hab:["EF02MA18"],meta:120,gen:gCalendario,ano:2},
  {nivel:37,id:"g2n37",nome:"Nível 37 — Relógio digital: início, fim e duração",hab:["EF02MA19"],meta:120,gen:gDigital,ano:2},
  {nivel:38,id:"g2n38",nome:"Nível 38 — Moedas e cédulas: centavos",hab:["EF02MA20"],meta:120,gen:gCentavos,ano:2},
  {nivel:39,id:"g2n39",nome:"Nível 39 — Moedas e cédulas: reais",hab:["EF02MA20"],meta:120,gen:gReais,ano:2},
  {nivel:40,id:"g2n40",nome:"Nível 40 — Provável, improvável e impossível",hab:["EF02MA21"],meta:100,gen:gAcaso2,ano:2},
  {nivel:41,id:"g2n41",nome:"Nível 41 — Tabelas de dupla entrada e gráficos",hab:["EF02MA22"],meta:130,gen:gTabelas,ano:2}
];
FC.G2BY={};FC.G2.forEach(function(e){FC.G2BY[e.id]=e});

/* ===================== Tipos e nota de dificuldade (rodízio e rampa, ver plano.js e bncc/TIPOS-E-DIFICULDADE-2ANO.md) ===================== */
/* tipos: os tipos de conta do nível; tipo(it): o número do tipo da conta; nota(it): quanto maior, mais difícil (relativa ao nível); ordem: tipos do mais fácil ao mais difícil. */
function nums2(it){return (String(it.pre)+" "+String(it.post||"")).replace(/\u202F/g,"").match(/\d+/g)||[]}
function nz2(n){return /0/.test(String(n))&&n>=10?1:0}
function dg2(n){return String(n).length}
function maxN2(it){return Math.max.apply(null,nums2(it).map(Number).concat([0]))}
function cv2(a,b){var x=String(a).split("").reverse().map(Number),y=String(b).split("").reverse().map(Number),c=0,n=0,i;for(i=0;i<Math.max(x.length,y.length);i++){var s=(x[i]||0)+(y[i]||0)+c;if(s>=10){n++;c=1}else c=0}return n}
function br2(a,b){var x=String(a).split("").reverse().map(Number),y=String(b).split("").reverse().map(Number),c=0,n=0,i;for(i=0;i<x.length;i++){var v=x[i]-c-(y[i]||0);if(v<0){n++;c=1}else c=0}return n}
function g02(it,pref){var l=(it.limits||[]).filter(function(x){return x[0].indexOf(pref)===0})[0];return l?l[0]:""}
function unico(rotulo,nota){return {tipos:[rotulo],tipo:function(){return 0},nota:nota}}
function porNome2(nomes,ranks,extra,rotulos){
  return {tipos:rotulos||nomes,tipo:function(it){return nomes.indexOf(it._info.tipo)},
    nota:function(it){var i=nomes.indexOf(it._info.tipo);return (ranks[i]||0)*2+(extra?extra(it,it._info):0)}};
}
/* tipo pelo grupo de limite: "n12:f1", "n12:f2"... (prefixo + número) */
function porGrupo(pref,rotulos,ranks,extra){
  return {tipos:rotulos,tipo:function(it){return +g02(it,pref).slice(pref.length)-1},
    nota:function(it){var i=+g02(it,pref).slice(pref.length)-1;return (ranks[i]||0)*2+(extra?extra(it,it._info||{}):0)}};
}
function porNum2(rotulos,ranks,extra){
  return {tipos:rotulos,tipo:function(it){return it._info.tipo-1},
    nota:function(it){var i=it._info.tipo-1;return (ranks[i]||0)*2+(extra?extra(it,it._info):0)}};
}
function contaNota(it){var i=it._info;return (i.op==="+"?cv2(i.a,i.b):br2(i.a,i.b)+1)*2+nz2(i.a)+nz2(i.b)+dg2(Math.max(i.a,i.b))}
var tabuada=function(nomes){return porNome2(nomes,[0,1,2,2],function(it,i){return (i.k||0)*(i.n||0)/6})};
var ESPEC2={
 1:{tipos:["completar a fila","situação do dia a dia","pulos","qual não faz parte"],tipo:function(it){return ({situacao:1,pulos:2,naofaz:3})[it._info.tipo]||0},
    nota:function(it){var i=it._info;return i.tipo?FC.abertura.nota(it):({2:0,10:2,5:3}[i.passo]||1)+(i.k-1)*.5}},
 2:porGrupo("n2:t",["valor da figura","quantas peças","casa vazia"],[0,1,2],function(it){return nz2(it.a)}),
 3:porGrupo("n3:t",["montar o número","valor do algarismo"],[0,1],function(it){return 2*nz2(maxN2(it))+Math.min(4,maxN2(it)/250)}),
 4:porGrupo("n4:t",["falta a unidade","falta a dezena","falta a centena","montar o número","falta o resto"],[0,2,1,0,1],function(it){return 2*nz2(maxN2(it))}),
 5:{tipos:["maior ou menor","ordem certa"],tipo:function(it){return g02(it,"n5:t")==="n5:t2"?1:0},
    nota:function(it){var i=it._info;return ({sep:0,dez:1,uni:1,cent:2,zero:2,troca:3}[i.modo]||0)*2+(g02(it,"n5:t")==="n5:t2"?1:0)}},
 6:unico("completar a fila",function(it){var i=it._info;return ({1:0,10:2,100:3}[i.passo]||1)+(i.k-1)*.5}),
 7:unico("estimar quantidades",function(it){return Math.min(5,(it._info.n||0)/200)}),
 8:unico("soma sem reagrupar",function(it){var i=it._info;return (i.a%10+i.b%10)/2+(i.a+i.b>=60?1:0)+nz2(i.a)+nz2(i.b)}),
 9:unico("soma com reagrupamento",function(it){var i=it._info;return (i.a%10+i.b%10)/3+(i.a+i.b)/40+nz2(i.a)+nz2(i.b)}),
 10:unico("subtração sem emprestar",function(it){var i=it._info;return (i.a%10+i.b%10)/3+i.a/40+nz2(i.a)+nz2(i.b)}),
 11:unico("subtração com empréstimo",function(it){var i=it._info;return (i.b%10)/2+i.a/30+nz2(i.a)+nz2(i.b)}),
 12:porGrupo("n12:f",["soma sem reagrupar","soma com reagrupamento","subtração sem emprestar","subtração com empréstimo"],[0,0,0,0],function(it){return contaNota(it)}),
 13:porGrupo("n13:f",["centena + centena","centena − centena","centena + dezena","dezena + dezena","dezena − dezena"],[0,1,2,2,3],function(it){return nz2(maxN2(it))}),
 14:{tipos:["soma","subtração"],tipo:function(it){return it._info.op==="+"?0:1},nota:function(it){var i=it._info;return (i.op==="+"?0:2)+nz2(i.a)+nz2(i.b)+(i.a%100+i.b%100)/40+(i.a%10+i.b%10)/5}},
 15:porGrupo("n15:f",["parcela escondida (19 + __ = 59)","parcela escondida na frente (__ + 45 = 100)","subtraendo escondido (30 − __ = 20)","minuendo escondido (__ − 54 = 46)"],[0,1,2,3],function(it){return dg2(maxN2(it))}),
 16:{tipos:["na figura","com números"],tipo:function(it){return g02(it,"n16:")==="n16:num"?1:0},nota:function(it){var i=it._info;return (i.num?2:0)+dg2(Math.max(i.a,i.b))+(i.mais?0:1)}},
 17:porNome2(["juntar","acrescentar","separar","retirar"],[0,0,1,1],function(it,i){return (i.regroup?2:0)+dg2(Math.max(i.a,i.b))}),
 18:porNome2(["juntar","acrescentar","separar","retirar"],[0,0,1,1],function(it,i){return (i.regroup?2:0)+dg2(Math.max(i.a,i.b))}),
 19:porNome2(["fig","soma"],[0,1],function(it,i){return (i.g||0)*(i.q||0)/4}),
 20:tabuada(["fig","conta","nome"]),
 21:tabuada(["fig","conta","nome"]),
 22:tabuada(["fig","conta","vezes"]),
 23:tabuada(["fig","conta","vezes"]),
 24:tabuada(["fig","conta","vezes","nome"]),
 25:porNome2(["fig","metade","terca"],[0,1,2],function(it,i){return (i.q||0)/4}),
 26:porNome2(["dobro","triplo","metade","terca","grupos"],[0,1,2,3,2],function(it,i){return (i.q||0)/4}),
 27:porNome2(["fig","sim","pal"],[0,1,2],function(it,i){return (i.p||0)+(i.meio?2:0)}),
 28:porGrupo("n28:t",["de quanto em quanto","completar a sequência","achar a regra"],[0,1,2],function(it,i){return ({2:0,10:1,5:1,100:2}[i.passo]||2)+(i.sobe===false?1:0)}),
 29:{tipos:["quem está entre","à esquerda e à direita"],tipo:function(it){return g02(it,"n29:")==="n29:dois"?1:0},nota:function(it){return g02(it,"n29:")==="n29:dois"?3:0}},
 30:{tipos:["onde vai parar","quantas casas"],tipo:function(it){return g02(it,"n30:")==="n30:t2"?1:0},
    nota:function(it){var i=it._info;return g02(it,"n30:")==="n30:t2"?2+Math.abs(i.ax-i.bx)+Math.abs(i.ay-i.by):(i.n1||0)+(i.n2||0)+(i.m2?2:0)}},
 31:porNome2(["nome","obj","car"],[0,1,2],null,["nome do sólido","objeto do dia a dia","características"]),
 32:porNome2(["cont","nome","qual"],[0,1,2],null,["contar lados","nome da figura","qual figura"]),
 33:porNome2(["medir","comparar","unidade"],[0,1,2],function(it,i){return (i.len||0)/4},["medir com a régua","comparar comprimentos","unidade certa"]),
 34:porNome2(["somar","falta"],[0,1],function(it,i){return ((i.lados||[]).length)+((i.tot||0)/10)},["medida do contorno","lado que falta"]),
 35:porNome2(["unidade","comparar","balanca"],[0,1,2],null,["unidade certa","comparar","balança"]),
 36:porGrupo("n36:t",["dia da semana","dias entre datas","mês seguinte","meses do ano"],[0,2,1,3]),
 37:porGrupo("n37:t",["ler a hora","duração em horas","hora de término","duração em minutos"],[0,1,2,3],function(it,i){return i.m?1:0}),
 38:porGrupo("n38:t",["valor do conjunto","trocar moedas","conjunto equivalente"],[0,1,2],function(it){return dg2(maxN2(it))}),
 39:porGrupo("n39:t",["valor do conjunto","trocar cédulas","conjunto equivalente"],[0,1,2],function(it){return dg2(maxN2(it))}),
 40:porGrupo("n40:t",["bolas no saco","frases do dia a dia"],[0,1]),
 41:porNum2(["ler um valor","mais ou menos votos","soma de duas turmas"],[0,1,2],function(it,i){return (i.tab?1:0)+dg2(it.a)})
};
/* Ordem dos tipos do mais fácil ao mais difícil (média da nota de cada tipo, medida em 4 000 contas por nível). O rodízio reserva o 1º da lista à folha 1, o 2º à folha 2 e assim por diante: fixa de propósito, para que as 5 folhas do dia sempre cubram todos os tipos. */
var ORDEM2={"1":[1,0,3,2],"2":[0,1,2],"3":[0,1],"4":[0,3,4,2,1],"5":[0,1],"6":[0],"7":[0],"8":[0],"9":[0],"10":[0],"11":[0],"12":[0,1,2,3],"13":[0,1,2,3,4],"14":[0,1],"15":[0,1,2,3],"16":[0,1],"17":[0,1,2,3],"18":[1,0,2,3],"19":[1,0],"20":[0,1,2],"21":[0,1,2],"22":[0,1,2],"23":[0,1,2],"24":[0,1,3,2],"25":[0,1,2],"26":[0,1,4,2,3],"27":[0,1,2],"28":[0,1,2],"29":[0,1],"30":[0,1],"31":[0,1,2],"32":[0,1,2],"33":[1,0,2],"34":[0,1],"35":[0,1,2],"36":[0,2,1,3],"37":[0,1,2,3],"38":[0,1,2],"39":[0,1,2],"40":[0,1],"41":[0,1,2]};
Object.keys(ORDEM2).forEach(function(n){ESPEC2[n].ordem=ORDEM2[n]});
/* ===================== O 2º ano na grade do app: FC.LEVELS (a trilha é uma só: os níveis do 2º ano seguem os 35 do 1º) ===================== */
/* Os números das fichas (1 a 41) são do 2º ano; no app o aluno vê a numeração corrida, de 36 a 76. */
var BASE=FC.LEVELS.length;                          /* 35 */
var BLOCOS2=[[7,"Números até 1000"],[18,"Adição e subtração até 1000"],[26,"Multiplicação, dobro e metade"],[28,"Padrões e regularidades"],[32,"Geometria"],[39,"Medidas, tempo e dinheiro"],[41,"Dados e acaso"]];
var DICAS2={1:"Conte de 2 em 2, de 5 em 5 ou de 10 em 10: complete a fila, resolva as situações e ache o número que não faz parte.",2:"Cada placa vale 100, cada barra vale 10 e cada quadradinho vale 1.",3:"Descubra o valor de cada algarismo e o que o zero faz.",
  4:"Decomponha o número, como 345 = 300 + 40 + 5.",5:"Escolha o maior, o menor ou a ordem certa dos números.",6:"Complete a fila de números, de 1 em 1, de 10 em 10 ou de 100 em 100.",
  7:"Compare a mancha de pontos com o quadro de 100 e escolha o número mais perto.",8:"Somas de dois algarismos sem passar da dezena, como 23 + 45.",9:"Somas de dois algarismos com \"vai um\", como 47 + 38.",
  10:"Subtrações de dois algarismos sem emprestar, como 78 − 45.",11:"Subtrações de dois algarismos com empréstimo, como 82 − 29.",12:"Somas e subtrações de dois algarismos, misturadas.",
  13:"Contas com centenas e dezenas inteiras, como 200 + 300 e 450 − 250.",14:"Somas e subtrações com três algarismos, sem reagrupar.",15:"Descubra o número que falta na conta, como 38 + ? = 50.",
  16:"Quantos a mais e quantos a menos? Compare as quantidades.",17:"Problemas de somar e tirar com números até 100.",18:"Problemas de somar e tirar com números até 999.",
  19:"Conte grupos iguais e some as parcelas, como 4 + 4 + 4.",20:"A tabuada do 2 e o dobro.",21:"A tabuada do 3 e o triplo.",22:"A tabuada do 4.",23:"A tabuada do 5.",
  24:"As tabuadas do 2, 3, 4 e 5, misturadas.",25:"Divida em partes iguais: a metade e a terça parte.",26:"Problemas com grupos iguais, dobro, triplo e metade.",
  27:"Descubra o que completa o padrão de figuras, símbolos e palavras.",28:"Descubra a regra da sequência de números.",29:"Entre, à direita de, à esquerda de: onde cada coisa está?",
  30:"Siga o caminho no quadriculado e conte as casas.",31:"Reconheça cubo, bloco, pirâmide, cone, cilindro e esfera.",32:"Lados, vértices e características das figuras planas.",
  33:"Meça com a régua, sempre a partir do zero.",34:"Some os lados para achar o contorno da figura.",35:"Litro, mililitro, grama e quilograma: qual unidade usar e o que pesa mais.",
  36:"Dias da semana, meses e quantos dias entre duas datas.",37:"Leia o relógio digital e calcule quanto tempo passou.",38:"Moedas em centavos: some e troque.",
  39:"Cédulas e moedas em reais: some e troque.",40:"Impossível, pouco provável, muito provável ou certo?",41:"Leia tabelas e gráficos e compare os números."};
/* Texto de abertura (aparece no começo da folha). */
var INTROS2={29:"Lembrete: a esquerda é o lado da sua mão esquerda, e a direita é o lado da sua mão direita.",
  30:"Lembrete: direita e esquerda são do seu ponto de vista, e para cima é para o alto da tela. A linha 1 é a de baixo.",
  33:"Lembrete: para medir, comece sempre pelo zero da régua e veja onde a peça termina."};
FC.G2.forEach(function(e){
  var grupo=BLOCOS2.filter(function(b){return e.nivel<=b[0]})[0][1];
  var l={group:grupo,id:String(BASE+e.nivel),name:e.nome.replace(/^Nível \d+ — /,""),hint:DICAS2[e.nivel],target:e.meta,gen:e.gen,ano:2,hab:e.hab};
  if(INTROS2[e.nivel])l.intro=INTROS2[e.nivel];
  l.espec=ESPEC2[e.nivel];
  FC.LEVELS.push(l);
});
})();
