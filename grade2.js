/* Grade do 2º ano — geradores escritos do zero a partir das fichas em bncc/fichas/2ano-*.md.
   Mesma forma dos geradores do 1º ano (grade1.js): {pre, post, a, extra?}, com limits/key/_info só para o app e os testes.
   Por enquanto os geradores não estão ligados aos níveis do app: aparecem na aba Exercícios do /adm.
   Níveis feitos: 1 a 7 (números até 1000). */
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

FC.G2=[
  {nivel:1,id:"g2n01",nome:"Nível 1 — Contar de 2 em 2, de 5 em 5 e de 10 em 10",hab:["EF02MA09","EF02MA11"],meta:90,gen:gContarDe,ano:2},
  {nivel:2,id:"g2n02",nome:"Nível 2 — Centenas, dezenas e unidades (material dourado)",hab:["EF02MA04"],meta:100,gen:gMaterial,ano:2},
  {nivel:3,id:"g2n03",nome:"Nível 3 — Valor posicional e o zero",hab:["EF02MA01","EF02MA04"],meta:110,gen:gPosicional,ano:2},
  {nivel:4,id:"g2n04",nome:"Nível 4 — Decompor números até 999",hab:["EF02MA04"],meta:110,gen:gDecompor3,ano:2},
  {nivel:5,id:"g2n05",nome:"Nível 5 — Comparar e ordenar números até 999",hab:["EF02MA01"],meta:100,gen:gOrdemNum,ano:2},
  {nivel:6,id:"g2n06",nome:"Nível 6 — Sequências a partir de qualquer número",hab:["EF02MA09","EF02MA11"],meta:100,gen:gSequencia3,ano:2},
  {nivel:7,id:"g2n07",nome:"Nível 7 — Estimar quantidades até 1000",hab:["EF02MA02"],meta:120,gen:gEstimar,ano:2}
];
FC.G2BY={};FC.G2.forEach(function(e){FC.G2BY[e.id]=e});
})();
