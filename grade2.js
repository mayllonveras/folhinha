/* Grade do 2º ano — geradores escritos do zero a partir das fichas em bncc/fichas/2ano-*.md.
   Mesma forma dos geradores do 1º ano (grade1.js): {pre, post, a, extra?}, com limits/key/_info só para o app e os testes.
   Por enquanto os geradores não estão ligados aos níveis do app: aparecem na aba Exercícios do /adm.
   Níveis feitos: 1 a 26 (números até 1000, adição e subtração, multiplicação, dobro, triplo e metade). */
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

/* Nível 1 — Contar de 2 em 2, de 5 em 5 e de 10 em 10 até 100 (EF02MA09, EF02MA11). Os termos são múltiplos do passo. */
function gContarDe(){
  var passo=pick([2,5,10]),sobe=Math.random()<.7,v=[],i,s;
  if(sobe)s=passo*rnd(0,Math.floor((100-4*passo)/passo));else s=passo*rnd(4,Math.floor(100/passo));
  for(i=0;i<5;i++)v.push(sobe?s+i*passo:s-i*passo);
  return fila(passo,v,rnd(1,3));
}

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

FC.G2=[
  {nivel:1,id:"g2n01",nome:"Nível 1 — Contar de 2 em 2, de 5 em 5 e de 10 em 10",hab:["EF02MA09","EF02MA11"],meta:90,gen:gContarDe,ano:2},
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
  {nivel:26,id:"g2n26",nome:"Nível 26 — Problemas de multiplicação, dobro, triplo e metade",hab:["EF02MA07","EF02MA08"],meta:140,gen:gProb26,ano:2}
];
FC.G2BY={};FC.G2.forEach(function(e){FC.G2BY[e.id]=e});
})();
