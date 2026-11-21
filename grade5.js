/* Grade do 5º ano — geradores escritos do zero a partir de bncc/GRADE-5ANO.md (47 níveis).
   Mesma forma dos geradores dos anos anteriores: {pre, post, a, extra?}, com limits/key/_info só para o app e os testes.
   Decisões do professor (17/11/2026): números até 999 999; decimais com até 2 casas nas contas (3 só na leitura), digitados com vírgula; frações por escolha entre opções;
   multiplicador e divisor naturais de 1 algarismo nos decimais; porcentagem só em 10%, 25%, 50%, 75% e 100%; plano cartesiano no 1º quadrante (0 a 10);
   o rodízio de tipos e a rampa de dificuldade (ESPEC, no fim do arquivo) nascem junto com os geradores. A resposta digitada é um número (inteiro ou decimal exato). */
(function(){
"use strict";
var FC=window.FC,X=FC.exh,rnd=X.rnd,pick=X.pick,choice=X.choice,typed=X.typed,fmt=X.milh,NAMES=X.NAMES;
var MENOS="−",VEZES="×",DIV="÷";

function emb(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(0,i),t=a[i];a[i]=a[j];a[j]=t}return a}
function ate(fn,max){for(var t=0;t<(max||6000);t++){var r=fn();if(r)return r}return null}
function ds(n){return String(n).split("").map(Number)}
function conta(a,op,b){return fmt(a)+" "+op+" "+fmt(b)+" ="}
function qs(f){return f?"Quantas ":"Quantos "}
function ele(n){return n[1]==="f"?"Ela":"Ele"}
function vaiUm(a,b){var x=ds(a).reverse(),y=ds(b).reverse(),car=0,n=0,i,k=Math.max(x.length,y.length);for(i=0;i<k;i++){var s=(x[i]||0)+(y[i]||0)+car;if(s>=10){n++;car=1}else car=0}return n}
function empresta(a,b){var x=ds(a).reverse(),y=ds(b).reverse(),bor=0,n=0,i;for(i=0;i<x.length;i++){var v=x[i]-bor-(y[i]||0);if(v<0){n++;bor=1}else bor=0}return n}
function reagrupa(a,b){var x=ds(a).reverse(),car=0,n=0,i;for(i=0;i<x.length;i++){var v=x[i]*b+car;car=Math.floor(v/10);if(car>0)n++}return n}
function temZero(n){return /0/.test(String(n))&&n>=100}
/* Decimais: o gerador sempre devolve o número "bonito" (0,1 + 0,2 → 0,3), com no máximo 3 casas, para a conferência do banco bater com a da tela. */
function R(x,c){return +(+x).toFixed(c==null?3:c)}
function dt(x){var s=String(R(x)),p=s.split(".");return fmt(p[0])+(p[1]?","+p[1]:"")}                 /* 12345,5 → "12 345,5" */
function dtf(x,c){var s=R(x,c).toFixed(c).split(".");return fmt(s[0])+","+s[1]}                      /* com casas fixas: 2,5 → "2,50" */
function real(c){return "R$ "+fmt(Math.floor(c/100))+","+(c%100<10?"0":"")+(c%100)}                  /* centavos → R$ 12,50 */
function dg(n){return String(Math.floor(Math.abs(n))).length}
function nz(n){return /0/.test(String(n))?1:0}
function frs(n,d){return n+"/"+d}
function mdc(a,b){return b?mdc(b,a%b):a}
var ext=function(n){return FC.extenso4(n)};

/* ===================== NÚMEROS ATÉ 999 999 ===================== */
/* Nível 1 — Ler, escrever e valor posicional (EF05MA01). */
function num6(zero){
  var d=[rnd(1,9),rnd(1,9),rnd(1,9),rnd(1,9),rnd(1,9),rnd(1,9)];
  if(zero){var z=pick([[1],[2],[3],[4],[5],[1,2],[2,3],[3,4],[4,5],[1,3],[2,4],[2,5],[3,5],[1,2,3],[3,4,5]]);z.forEach(function(i){d[i]=0})}
  return +d.join("");
}
function parecidos6(n){
  var d=ds(n),out=[],i,v,x;
  for(i=0;i<5;i++)if(d[i]!==d[i+1]){x=d.slice();var t=x[i];x[i]=x[i+1];x[i+1]=t;if(x[0]>0)out.push(+x.join(""))}
  for(i=0;i<6;i++)for(v=0;v<=9;v++)if(v!==d[i]&&!(i===0&&v===0)){x=d.slice();x[i]=v;out.push(+x.join(""))}
  return out.filter(function(q,k){return q!==n&&out.indexOf(q)===k});
}
var CASAS6=["das centenas de milhar","das dezenas de milhar","das unidades de milhar","das centenas","das dezenas","das unidades"];
function gLer(){
  /* 40% ler e escrever por extenso (k 1 e 2), 20% valor posicional (k 3 e 4), 40% desafios (k 5 a 8: FC.abertura.numeros) */
  var k=pick([1,1,2,2,3,4,5,6,7,8]),n,it,d,t;
  if(k>=5){it=FC.abertura.numeros(6);it._info.k=k;it._info.k=5+FC.abertura.NOVOS.indexOf(it._info.tipo);return it}
  if(k===1){n=num6(Math.random()<.3);it=typed("Escreva em algarismos: "+ext(n)+".",n);it.limits=[["n1:t1",3]]}
  else if(k===2){
    n=num6(Math.random()<.3);var wr=emb(parecidos6(n)),outros=[],ex=[ext(n)];
    wr.forEach(function(q){if(outros.length<2&&ex.indexOf(ext(q))<0){outros.push(q);ex.push(ext(q))}});
    it=choice("Como se lê o número "+fmt(n)+"?",ext(n),outros.map(ext),null);it.limits=[["n1:t2",3]];
  }else if(k===3){
    t=0;do{d=ds(num6(Math.random()<.25));var nn=d.filter(function(x){return x>0});}while(new Set(nn).size!==nn.length&&t++<800);
    n=+d.join("");var j=pick([0,1,2,3,4,5].filter(function(x){return d[x]>0&&d.filter(function(y){return y===d[x]}).length===1}));
    it=typed("No número "+fmt(n)+", quanto vale o algarismo "+d[j]+"?",d[j]*Math.pow(10,5-j));it.limits=[["n1:t3",2]];
  }else{
    d=ds(num6(false));n=+d.join("");var q=pick([0,1,2,3,4]);
    it=typed("Que algarismo está na casa "+CASAS6[q]+" de "+fmt(n)+"?",d[q]);it.limits=[["n1:t4",2]];
  }
  it.key="n1|"+k+"|"+it.pre;it._info={k:k,n:n};
  return it;
}

/* Nível 2 — Comparar e ordenar números até 999 999. */
function proximos6(){
  var base=rnd(10,99)*10000,tipo=pick([0,1,2]),out=[],t=0;
  while(out.length<3&&t++<300){
    var v=tipo===0?base+rnd(1000,9999):tipo===1?base+10000*rnd(1,9)+rnd(1,999):rnd(11,98)*10000+rnd(0,9999);
    if(v<100000||v>999999||out.indexOf(v)>=0)continue;out.push(v);
  }
  while(out.length<3){var w=rnd(100000,999999);if(out.indexOf(w)<0)out.push(w)}
  return out;
}
function gOrdem(){
  var k=pick([1,2,3,4,5]),it,v=proximos6(),srt=v.slice().sort(function(x,y){return x-y});
  if(k===1){var mx=srt[2];it=choice("Qual é o maior número?",fmt(mx),v.filter(function(x){return x!==mx}).map(fmt),null);it.key="o2|1|"+srt.join(",")}
  else if(k===2){var mn=srt[0];it=choice("Qual é o menor número?",fmt(mn),v.filter(function(x){return x!==mn}).map(fmt),null);it.key="o2|2|"+srt.join(",")}
  else if(k===3){var a=v[0],b=Math.random()<.15?v[0]:v[1],s=a<b?"<":a>b?">":"=";
    it=choice("Qual sinal completa? "+fmt(a)+" ◻ "+fmt(b),s,["<",">","="].filter(function(x){return x!==s}),null);it.key="o2|3|"+a+"|"+b}
  else if(k===4){var depois=Math.random()<.5,ref=Math.random()<.4?rnd(101,998)*1000+(depois?999:0):rnd(100001,999998);if(!depois&&ref%1000===999&&Math.random()<.5)ref++;
    if(ref<=100000&&!depois)ref=100002;it=typed("Que número vem logo "+(depois?"depois":"antes")+" de "+fmt(ref)+"?",depois?ref+1:ref-1);it.key="o2|4|"+depois+"|"+ref}
  else{var cres=Math.random()<.6,lst=function(arr){return arr.map(fmt).join("; ")},cert=cres?srt:srt.slice().reverse(),perms=[[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0],[0,1,2]],ws=[];
    emb(perms).forEach(function(p){var l=lst(p.map(function(i){return cert[i]}));if(l!==lst(cert)&&ws.indexOf(l)<0&&ws.length<2)ws.push(l)});
    it=choice("Qual lista está em ordem "+(cres?"crescente (do menor para o maior)":"decrescente (do maior para o menor)")+"?",lst(cert),ws,null);it.key="o2|5|"+cres+"|"+srt.join(",")}
  it.limits=[["n2:t"+k,2]];it._info={k:k,v:v};
  return it;
}

/* Nível 3 — Arredondar: dezena, centena, milhar e dezena de milhar mais próximos (EF05MA01, EF05MA07). */
function gArredonda(){
  var k=pick([10,100,1000,10000]),n,t=0,nome={10:"dezena",100:"centena",1000:"unidade de milhar",10000:"dezena de milhar"}[k];
  do{n=rnd(100001,949999)}while((n%k===0)&&t++<200);
  var a=Math.floor(n/k)*k;if(n-a>=k/2)a+=k;
  var it=typed("Arredonde "+fmt(n)+" para a "+nome+" mais próxima.",a);it.key="a3|"+k+"|"+n;it.limits=[["n3:"+k,3]];it._info={n:n,k:k,a:a};
  return it;
}

/* ===================== ADIÇÃO E SUBTRAÇÃO ===================== */
function somaIt(a,b,l,info){var it=typed(conta(a,"+",b),a+b);it.key="+|"+Math.min(a,b)+"|"+Math.max(a,b);it.limits=l;it._info=info||{};it._info.op="+";it._info.a=a;it._info.b=b;return it}
function subIt(a,b,l,info){var it=typed(conta(a,MENOS,b),a-b);it.key="-|"+a+"|"+b;it.limits=l;it._info=info||{};it._info.op="-";it._info.a=a;it._info.b=b;return it}
/* Nível 4 — Somas até 999 999, com reagrupamento em várias ordens. */
function gSoma6(){
  var seis=Math.random()<.5,p=ate(function(){
    var a=seis?rnd(100000,899999):rnd(10000,99999),b=seis?rnd(10000,999999-a):rnd(10000,99999);
    return vaiUm(a,b)>=(seis?2:3)&&a+b<=999999?[a,b]:null})||(seis?[342678,125786]:[48679,57985]);
  return somaIt(p[0],p[1],[["n4:"+(seis?"s":"c"),3]],{seis:seis});
}
/* Nível 5 — Subtrações até 999 999, com empréstimo e zeros. */
function gSub6(){
  var z=Math.random()<.45,p=ate(function(){var a=rnd(100000,999999),b=rnd(10000,a-1000);if(empresta(a,b)<2)return null;if(z&&!(temZero(a)||temZero(b)))return null;return[a,b]})||[500203,121547];
  return subIt(p[0],p[1],[["n5:"+(z?"z":"s"),3]],{z:z});
}
/* Nível 6 — Problemas de adição e subtração com números grandes. */
var OJ6=[["ingresso","ingressos",0],["livro","livros",0],["tijolo","tijolos",0],["moeda","moedas",1],["figurinha","figurinhas",1],["visitante","visitantes",0]];
var OS6=[["torcedor","torcedores",0],["passageiro","passageiros",0],["aluno","alunos",0],["carro","carros",0]];
function gProb6(){
  var tipo=pick(["juntar","acrescentar","separar","retirar","comparar","completar"]),soma=tipo==="juntar"||tipo==="acrescentar",pre,o,resp,n1=pick(NAMES),n2,l=[["n6:"+tipo,2]];
  var par=ate(function(){var a=rnd(12000,899999),b=rnd(12000,899999);if(soma)return a+b<=999999?[a,b]:null;return a>b+10000?[a,b]:null})||[214000,132500],a=par[0],b=par[1];
  if(tipo==="juntar"){o=pick(OJ6);do{n2=pick(NAMES)}while(n2[0]===n1[0]);pre=n1[0]+" tem "+fmt(a)+" "+o[1]+" e "+n2[0]+" tem "+fmt(b)+". "+qs(o[2])+o[1]+" os dois têm juntos?";resp=a+b;l.push(["nome:"+n1[0],1],["nome:"+n2[0],1])}
  else if(tipo==="acrescentar"){o=pick(OJ6);pre="Havia "+fmt(a)+" "+o[1]+". Chegaram mais "+fmt(b)+". "+qs(o[2])+o[1]+" há agora?";resp=a+b}
  else if(tipo==="separar"){o=pick(OJ6);pre=n1[0]+" tinha "+fmt(a)+" "+o[1]+" e deu "+fmt(b)+". "+qs(o[2])+o[1]+" sobraram?";resp=a-b;l.push(["nome:"+n1[0],1])}
  else if(tipo==="retirar"){o=pick(OS6);pre="Havia "+fmt(a)+" "+o[1]+" no estádio. Foram embora "+fmt(b)+". "+qs(o[2])+o[1]+" ficaram?";resp=a-b}
  else if(tipo==="comparar"){o=pick(OJ6);do{n2=pick(NAMES)}while(n2[0]===n1[0]);pre=n1[0]+" tem "+fmt(a)+" "+o[1]+" e "+n2[0]+" tem "+fmt(b)+". "+qs(o[2])+o[1]+" "+n1[0]+" tem a mais do que "+n2[0]+"?";resp=a-b;l.push(["nome:"+n1[0],1],["nome:"+n2[0],1])}
  else{o=pick(OJ6);pre=n1[0]+" quer juntar "+fmt(a)+" "+o[1]+" e já tem "+fmt(b)+". "+qs(o[2])+o[1]+" faltam?";resp=a-b;l.push(["nome:"+n1[0],1])}
  var it=typed(pre,resp);it.key=tipo+"|"+a+"|"+b+"|"+pre;it.limits=l;it._info={tipo:tipo,a:a,b:b};
  return it;
}

/* ===================== MULTIPLICAÇÃO ===================== */
function mulIt(a,b,l,info){var it=typed(conta(a,VEZES,b),a*b);it.key="x|"+Math.min(a,b)+"|"+Math.max(a,b);it.limits=l;it._info=info||{};it._info.op="x";it._info.a=a;it._info.b=b;return it}
/* Nível 7 — Multiplicar por 10, 100, 1 000 e por múltiplos (300 × 40). O resultado nunca passa de 999 999. */
function gPor10(){
  var k=pick([1,2,3,4]),it,n,f=rnd(1,3),m;
  if(k<=3){m=[10,100,1000][k-1];n=m===10?rnd(11,99999):m===100?rnd(11,9999):rnd(2,999);
    it=f===1?typed(fmt(n)+" "+VEZES+" "+fmt(m)+" =",n*m):f===2?typed(fmt(m)+" "+VEZES+" "+fmt(n)+" =",n*m):typed("__ "+VEZES+" "+fmt(m)+" = "+fmt(n*m)+". Qual número vai no lugar do __?",n);
    it.key="m7|"+k+"|"+f+"|"+n;it.limits=[["n7:"+m,3]];it._info={k:k,n:n,m:m,f:f};
  }else{
    var p=ate(function(){var a=rnd(2,99)*pick([10,100]),b=rnd(2,9)*pick([10,100]);return a*b<=999999&&!(a%100===0&&b%100===0&&a*b>99999)?[a,b]:null})||[300,40];
    it=Math.random()<.5?typed(fmt(p[0])+" "+VEZES+" "+fmt(p[1])+" =",p[0]*p[1]):typed(fmt(p[1])+" "+VEZES+" "+fmt(p[0])+" =",p[0]*p[1]);
    it.key="m7|4|"+p[0]+"|"+p[1];it.limits=[["n7:t4",3]];it._info={k:4,a:p[0],b:p[1],n:p[0]*p[1]};
  }
  return it;
}
/* Nível 8 — Três algarismos por dois algarismos (direta e por decomposição). */
function gMul32(){
  var guiada=Math.random()<.35,a=rnd(101,999),t=rnd(1,4),u=rnd(1,9),b=t*10+u,it;
  if(guiada){it=typed(a+" "+VEZES+" "+b+" = "+a+" "+VEZES+" "+t*10+" + "+a+" "+VEZES+" "+u+" = "+fmt(a*t*10)+" + __. Qual número vai no lugar do __?",a*u);it.key="m8|g|"+a+"|"+b;it.limits=[["n8:g",2]]}
  else{var p=ate(function(){var x=rnd(101,999),y=rnd(11,49);return x%100===0?null:[x,y]})||[234,25];a=p[0];b=p[1];it=mulIt(a,b,[["n8:d",4]],{});it.pre=conta(a,VEZES,b)}
  it._info=it._info||{};it._info.guiada=guiada;it._info.a=a;it._info.b=b;it._info.u=u;
  return it;
}
/* Nível 9 — Quatro algarismos por dois algarismos (direta e estimativa). */
function gMul42(){
  var est=Math.random()<.3,a=rnd(1100,4999),b=rnd(11,40),it;
  if(est){var ra=Math.round(a/1000)*1000,rb=Math.round(b/10)*10,e=ra*rb;
    it=choice("Sem fazer a conta exata, "+fmt(a)+" "+VEZES+" "+b+" dá mais ou menos quanto? (arredonde os dois números)",fmt(e),[fmt(e/10),fmt(e*10)],null);it.key="m9|e|"+a+"|"+b;it.limits=[["n9:e",2]];it._info={est:true,a:a,b:b,e:e}}
  else{it=mulIt(a,b,[["n9:d",4]],{});it._info.est=false}
  return it;
}
/* Nível 10 — Problemas de multiplicação: grupos, fileiras, área e proporção. */
function gProbMul(){
  var k=pick([1,2,3,4]),it,n=pick(NAMES),a,b;
  if(k===1){a=rnd(12,48);b=rnd(12,96);it=typed("Uma fábrica enche "+a+" caixas por dia e em cada caixa cabem "+b+" lápis. Quantos lápis ela usa por dia?",a*b);it.limits=[["n10:t1",2]]}
  else if(k===2){a=rnd(15,60);b=rnd(12,50);it=typed("O teatro tem "+a+" fileiras com "+b+" cadeiras cada uma. Quantas cadeiras ele tem?",a*b);it.limits=[["n10:t2",2]]}
  else if(k===3){a=rnd(12,48);b=rnd(12,45);it=typed("Quantos metros quadrados tem o piso de uma quadra retangular de "+a+" m por "+b+" m?",a*b,null,"m²");it.limits=[["n10:t3",2]]}
  else{a=rnd(45,95);b=rnd(12,48);it=typed("Um ônibus anda "+a+" quilômetros em 1 hora. Quantos quilômetros ele anda em "+b+" horas, sempre nessa velocidade?",a*b,null,"km");it.limits=[["n10:t4",2]]}
  it.key="p10|"+k+"|"+a+"|"+b;it._info={k:k,a:a,b:b};
  return it;
}
/* Nível 11 — Combinações possíveis: árvore e tabela (EF05MA09). Duas coleções; três só no último tipo. */
var COLEC=[
  {l:["azul","verde","amarela","branca"],m:["preta","cinza","jeans"],n1:"camisas",n2:"bermudas",t1:"cor da camisa",t2:"cor da bermuda"},
  {l:["morango","chocolate","baunilha","coco"],m:["calda","granulado","confete"],n1:"sabores de sorvete",n2:"coberturas",t1:"sabor",t2:"cobertura"},
  {l:["francês","integral","de forma"],m:["queijo","presunto","ovo","frango"],n1:"tipos de pão",n2:"recheios",t1:"pão",t2:"recheio"}];
function gCombina(){
  var k=pick([1,1,2,3,4]),it,c=pick(COLEC),a,b;
  if(k===1){
    var par=pick([[2,2],[2,3],[3,2],[2,4],[4,2],[3,3],[3,4],[4,3]].filter(function(p){return p[0]<=c.l.length&&p[1]<=c.m.length})),niv=[emb(c.l).slice(0,par[0]),emb(c.m).slice(0,par[1])];
    it=typed("A árvore mostra as escolhas possíveis ("+c.t1+" e "+c.t2+"). Quantas combinações diferentes existem? (conte as pontas da árvore)",par[0]*par[1],{t:"arvore",niv:niv});
    it.key="c11|1|"+JSON.stringify(niv);it.limits=[["n11:t1",2]];it._info={k:1,tot:par[0]*par[1]};
  }else if(k===2){
    a=rnd(2,9);b=rnd(2,9);it=typed("Com "+a+" "+c.n1+" e "+b+" "+c.n2+", quantas combinações diferentes dá para formar, escolhendo uma de cada?",a*b);
    it.key="c11|2|"+c.n1+"|"+a+"|"+b;it.limits=[["n11:t2",3]];it._info={k:2,a:a,b:b,tot:a*b};
  }else if(k===3){
    a=rnd(2,9);b=rnd(2,9);it=typed("Com "+a+" "+c.n1+" e __ "+c.n2+", é possível formar "+(a*b)+" combinações diferentes. Quanto vale o __?",b);
    it.key="c11|3|"+c.n1+"|"+a+"|"+b;it.limits=[["n11:t3",2]];it._info={k:3,a:a,b:b,tot:a*b};
  }else{
    var p3=pick([[2,2,2],[2,2,3],[2,3,2],[3,2,2]]),n3=[emb(["francês","integral","de forma"]).slice(0,p3[0]),emb(["queijo","presunto","ovo"]).slice(0,p3[1]),emb(["laranja","uva","maçã","limão"]).slice(0,p3[2])];
    it=typed("A árvore mostra as escolhas de um lanche: pão, recheio e suco. Quantos lanches diferentes existem? (conte as pontas da árvore)",p3[0]*p3[1]*p3[2],{t:"arvore",niv:n3});
    it.key="c11|4|"+JSON.stringify(n3);it.limits=[["n11:t4",2]];it._info={k:4,tot:p3[0]*p3[1]*p3[2]};
  }
  return it;
}

/* ===================== DIVISÃO ===================== */
/* Nível 12 — Divisão com dividendo de até 5 algarismos por um algarismo (EF05MA08). */
function gDiv5(){
  var k=pick([1,2,3,4]),d=rnd(2,9),lo=Math.ceil(10000/d)+1,hi=Math.floor(99998/d)-1,q,r=0,n,it;
  q=ate(function(){var x=rnd(lo,hi);return k===2?(nz(x)?x:null):(k===1?(!nz(x)?x:null):x)})||lo;
  if(k>=3)r=rnd(1,d-1);
  n=d*q+r;
  if(k===1||k===2)it=typed(fmt(n)+" "+DIV+" "+d+" =",q);
  else if(k===3)it=typed("Na divisão de "+fmt(n)+" por "+d+", qual é o quociente?",q);
  else it=typed("Na divisão de "+fmt(n)+" por "+d+", qual é o resto?",r);
  it.key="d12|"+k+"|"+n+"|"+d;it.limits=[["n12:t"+k,3]];it._info={k:k,d:d,q:q,r:r,n:n};
  return it;
}
/* Nível 13 — Divisão por dois algarismos, exata: estimar com a multiplicação. */
function gDiv2Exata(){
  var k=pick([1,2,3]),d=rnd(11,45),q,n,it;
  if(k===1){q=rnd(11,99);n=d*q;it=typed(fmt(n)+" "+DIV+" "+d+" =",q)}
  else if(k===2){q=rnd(101,299);n=d*q;it=typed(fmt(n)+" "+DIV+" "+d+" =",q)}
  else{q=rnd(12,99);n=d*q;it=typed(d+" "+VEZES+" "+q+" = "+fmt(n)+", então "+fmt(n)+" "+DIV+" "+d+" =",q)}
  it.key="d13|"+k+"|"+n+"|"+d;it.limits=[["n13:t"+k,3]];it._info={k:k,d:d,q:q,n:n};
  return it;
}
/* Nível 14 — Divisão por dois algarismos, com resto. */
function gDiv2Resto(){
  var k=pick([1,2,3]),d=rnd(11,35),q=rnd(10,99),r=rnd(1,d-1),n=d*q+r,it;
  if(k===1)it=typed("Na divisão de "+fmt(n)+" por "+d+", qual é o quociente?",q);
  else if(k===2)it=typed("Na divisão de "+fmt(n)+" por "+d+", qual é o resto?",r);
  else it=typed("Numa divisão, o divisor é "+d+", o quociente é "+q+" e o resto é "+r+". Qual é o dividendo?",n);
  it.key="d14|"+k+"|"+n+"|"+d;it.limits=[["n14:t"+k,3]];it._info={k:k,d:d,q:q,r:r,n:n};
  return it;
}
/* Nível 15 — Problemas de divisão: repartir, caixas, o que sobra e viagens. */
function gProbDiv(){
  var k=pick([1,2,3,4]),d=rnd(12,48),q=rnd(12,150),r=rnd(1,d-1),n,it,nm=pick(NAMES);
  if(k===1)r=0;
  if(k===1){n=d*q;it=typed("Uma escola dividiu "+fmt(n)+" cadernos igualmente entre "+d+" turmas. Quantos cadernos cada turma recebeu?",q)}
  else if(k===2){n=d*q+r;it=typed("Numa fábrica, "+fmt(n)+" bombons são colocados em caixas de "+d+" bombons. Quantas caixas ficam completas?",q)}
  else if(k===3){n=d*q+r;it=typed(fmt(n)+" figurinhas foram repartidas em pacotes de "+d+". Quantas figurinhas sobraram, sem formar um pacote completo?",r)}
  else{n=d*q+r;it=typed(fmt(n)+" pessoas vão viajar em ônibus que levam "+d+" pessoas cada um. Quantos ônibus são necessários, no mínimo?",q+1)}
  it.key="d15|"+k+"|"+n+"|"+d;it.limits=[["n15:t"+k,2]];it._info={k:k,d:d,q:q,r:r,n:n};
  return it;
}
/* Nível 16 — Problemas com as quatro operações, em várias etapas, e a estimativa para conferir. */
function gProb4op(){
  var k=pick([1,2,3,4]),it,a,b,c,d;
  if(k===1){a=rnd(12,48);b=rnd(12,60);c=rnd(15,90);it=typed("Uma papelaria vendeu "+a+" caixas com "+b+" lápis cada uma e mais "+c+" lápis soltos. Quantos lápis foram vendidos ao todo?",a*b+c)}
  else if(k===2){a=rnd(6,15);b=rnd(25,95);c=a*b+rnd(40,400);it=typed("Ana tinha "+c+" reais e comprou "+a+" cadernos de "+b+" reais cada um. Quantos reais sobraram?",c-a*b)}
  else if(k===3){d=rnd(6,24);var q1=rnd(3,12),q2=rnd(3,12);a=d*q1;b=d*q2;it=typed("Duas turmas, uma com "+a+" alunos e outra com "+b+", vão formar equipes de "+d+" alunos. Quantas equipes serão formadas?",q1+q2)}
  else{a=rnd(21,89);b=rnd(21,89);var e=Math.round(a/10)*Math.round(b/10)*100,w=[fmt(e*10),fmt(Math.round(e/10))];
    it=choice("Qual é o resultado mais razoável para "+a+" "+VEZES+" "+b+"? (arredonde antes de calcular)",fmt(e),w,null);it.pre="Sem fazer a conta exata, qual é o resultado mais razoável para "+a+" "+VEZES+" "+b+"? (arredonde as dezenas)"}
  it.key="p16|"+k+"|"+it.pre;it.limits=[["n16:t"+k,2]];it._info={k:k,a:a,b:b,c:c,d:d};
  return it;
}

/* ===================== ÁLGEBRA E PROPORÇÃO ===================== */
/* Nível 17 — Igualdades: o que acontece quando se opera nos dois lados (EF05MA10). */
function gIgual(){
  var k=pick([1,2,3,4,5]),a,b,c,t,it;
  if(k===1){a=rnd(5,40);b=rnd(5,40);t=rnd(2,30);it=typed(a+" + "+b+" = "+(a+b)+", então "+a+" + "+b+" + "+t+" = "+(a+b)+" + __. Qual número vai no lugar do __?",t)}
  else if(k===2){a=rnd(20,60);b=rnd(20,60);t=rnd(2,19);it=typed(a+" + "+b+" = "+(a+b)+", então "+a+" + "+b+" "+MENOS+" "+t+" = "+(a+b)+" "+MENOS+" __. Qual número vai no lugar do __?",t)}
  else if(k===3){a=rnd(3,12);b=rnd(3,12);t=rnd(2,9);it=typed(a+" + "+b+" = "+(a+b)+", então ("+a+" + "+b+") "+VEZES+" "+t+" = "+(a+b)+" "+VEZES+" __. Qual número vai no lugar do __?",t)}
  else if(k===4){t=rnd(2,9);a=rnd(2,9);b=t*rnd(2,9);c=a*b;it=typed(a+" "+VEZES+" "+b+" = "+c+", então ("+a+" "+VEZES+" "+b+") "+DIV+" "+t+" = "+c+" "+DIV+" __. Qual número vai no lugar do __?",t)}
  else{a=rnd(10,60);b=rnd(10,60);c=rnd(5,Math.min(a+b-5,70));it=typed(a+" + "+b+" = "+c+" + __. Qual número vai no lugar do __?",a+b-c)}
  it.key="i17|"+k+"|"+it.pre;it.limits=[["n17:t"+k,2]];it._info={k:k,t:t,a:a,b:b,c:c};
  return it;
}
/* Nível 18 — O número desconhecido em problemas com enunciado (EF05MA11), com "um número" ou o quadrado ◻; sem a letra x. */
function gEnunciado(){
  var k=pick([1,2,3,4]),sent=Math.random()<.45,x,v,n,it,txt;
  if(k===1){n=rnd(5,60);x=rnd(5,90);v=x+n;txt=sent?"◻ + "+n+" = "+v:"Pensei em um número, somei "+n+" e o resultado foi "+v+"."}
  else if(k===2){n=rnd(5,60);x=rnd(n+5,150);v=x-n;txt=sent?"◻ "+MENOS+" "+n+" = "+v:"Pensei em um número, tirei "+n+" e o resultado foi "+v+"."}
  else if(k===3){n=rnd(2,9);x=rnd(3,30);v=x*n;txt=sent?"◻ "+VEZES+" "+n+" = "+v:"Pensei em um número, multipliquei por "+n+" e o resultado foi "+v+"."}
  else{n=rnd(2,9);v=rnd(4,40);x=v*n;txt=sent?"◻ "+DIV+" "+n+" = "+v:"Pensei em um número, dividi por "+n+" e o resultado foi "+v+"."}
  it=typed(sent?txt+". Qual número vai no quadrado?":txt+" Em que número pensei?",x);
  it.key="e18|"+k+"|"+sent+"|"+n+"|"+x;it.limits=[["n18:t"+k,2],["n18:"+(sent?"q":"h"),4]];it._info={k:k,x:x,n:n,v:v,sent:sent};
  return it;
}
/* Nível 19 — Proporcionalidade direta: preço e receita (EF05MA12). */
var PROD19=[["kg de arroz","kg"],["metros de fita","metros"],["pacotes de bolacha","pacotes"],["cadernos","cadernos"],["litros de suco","litros"],["canetas","canetas"]];
function gProporcao(){
  var k=pick([1,2,3,4]),it,p=rnd(2,25),n1=rnd(2,6),n2,o=pick(PROD19),m,q,r;
  if(k===1){n2=rnd(n1+1,12);it=typed(n1+" "+o[0]+" custam "+(n1*p)+" reais. Quanto custam "+n2+" "+o[0]+"?",n2*p,null,"reais")}
  else if(k===2){n2=rnd(n1+1,12);it=typed("Com "+(n1*p)+" reais, uma pessoa compra "+n1+" "+o[0]+". Quantos "+o[0]+" ela compra com "+(n2*p)+" reais, ao mesmo preço?",n2)}
  else{m=pick([2,3,4,5]);r=pick([2,4,6,8]);q=rnd(2,6);var ing=pick([["ovos","bolinhos",0],["xícaras de farinha","pães",1],["colheres de açúcar","tortas",1],["copos de leite","vitaminas",0]]);
    if(k===3)it=typed("Uma receita de "+(r*1)+" "+ing[1]+" usa "+q+" "+ing[0]+". Para fazer "+(r*m)+" "+ing[1]+", "+qs(ing[2]).toLowerCase()+ing[0]+" serão necessári"+(ing[2]?"as":"os")+"?",q*m);
    else it=typed("Uma receita de "+(r*m)+" "+ing[1]+" usa "+(q*m)+" "+ing[0]+". Para fazer "+r+" "+ing[1]+", "+qs(ing[2]).toLowerCase()+ing[0]+" serão necessári"+(ing[2]?"as":"os")+"?",q)}
  it.key="r19|"+k+"|"+it.pre;it.limits=[["n19:t"+k,2]];it._info={k:k,p:p,n1:n1,n2:n2,m:m,q:q,r:r};
  return it;
}
/* Nível 20 — Proporcionalidade: escala em mapas, ampliação e tabelas. */
function gEscala(){
  var k=pick([1,2,3,4]),it,e=pick([2,5,10,20,50]),n=rnd(2,12),lado,f;
  if(k===1)it=typed("No mapa, 1 centímetro representa "+e+" quilômetros. Dois pontos estão a "+n+" cm no mapa. Qual é a distância real entre eles?",e*n,null,"km");
  else if(k===2)it=typed("No mapa, 1 centímetro representa "+e+" quilômetros. A distância real entre duas cidades é de "+(e*n)+" km. Quantos centímetros elas ficam distantes no mapa?",n,null,"cm");
  else if(k===3){lado=rnd(2,9)*2;f=pick([["dobro",2,1],["triplo",3,1],["metade",1,2]]);var res=f[2]===2?lado/2:lado*f[1];
    it=typed("Uma foto de "+lado+" cm de largura será "+(f[2]===2?"reduzida para a metade":"ampliada para o "+f[0])+". Quantos centímetros de largura ela terá?",res,null,"cm")}
  else{var pr=rnd(2,15),cols=[1,2,3,rnd(5,10)],tab={t:"tabela2",title:"Preço de pacotes de figurinhas",rows:["Preço (reais)"],cols:cols.map(function(c){return c+(c===1?" pacote":" pacotes")}),v:[[pr,2*pr,3*pr,"?"]]};
    it=typed("A tabela mostra o preço de pacotes iguais. Quantos reais vão no lugar do ? da tabela?",cols[3]*pr,tab);n=cols[3];e=pr}
  it.key="s20|"+k+"|"+it.pre+(k===4?JSON.stringify(it.extra.fig.cols):"");it.limits=[["n20:t"+k,2]];it._info={k:k,e:e,n:n,lado:lado};
  return it;
}
/* Nível 21 — Partilha em duas partes desiguais: o dobro e o triplo (EF05MA13), com a ideia de razão. */
function gPartilha(){
  var k=pick([1,2,3,4]),r=pick([2,2,3]),u=rnd(2,40),tot=(r+1)*u,n1=pick(NAMES),n2,it,nome=r===2?"o dobro":"o triplo",un=pick(["reais","figurinhas","balas","livros"]);
  do{n2=pick(NAMES)}while(n2[0]===n1[0]);
  if(k===1)it=typed(n1[0]+" e "+n2[0]+" vão dividir "+tot+" "+un+" de modo que "+n1[0]+" receba "+nome+" do que "+n2[0]+" recebe. Quanto recebe "+n2[0]+"?",u);
  else if(k===2)it=typed(n1[0]+" e "+n2[0]+" vão dividir "+tot+" "+un+" de modo que "+n1[0]+" receba "+nome+" do que "+n2[0]+" recebe. Quanto recebe "+n1[0]+"?",r*u);
  else if(k===3){it=typed("Divida "+tot+" em duas partes, de modo que uma seja "+nome+" da outra. Qual é a parte maior?",r*u)}
  else{var cer=frs(1,r+1),ws=emb(["1/2","1/3","1/4","1/5","2/3","3/4"].filter(function(x){return x!==cer})).slice(0,2);
    it=choice("Duas partes de um todo são tais que uma é "+nome+" da outra. A parte menor é que fração do todo?",cer,ws,null);it.pre="Duas partes de um todo são tais que uma é "+nome+" da outra. A parte menor é que fração do todo?"}
  it.key="pa21|"+k+"|"+it.pre+"|"+tot;it.limits=[["n21:t"+k,2],["nome:"+n1[0],1]];it._info={k:k,r:r,u:u,tot:tot};
  return it;
}

/* ===================== FRAÇÕES ===================== */
function figF(d,n,forma){return {t:"fracao",d:d,n:n,forma:forma}}
function val(n,d){return n/d}
function distintas(lista,cert,max){var out=[];lista.forEach(function(x){if(x!==cert&&out.indexOf(x)<0)out.push(x)});return emb(out).slice(0,max||2)}
/* Nível 22 — Frações com qualquer numerador, menores que o inteiro (EF05MA03). */
function gFrac(){
  var k=pick([1,1,2,3,4]),d=pick([3,4,5,6,8,10]),n=rnd(1,d-1),forma=pick(["barra","circulo"]),it,cert;
  if(k===1){cert=frs(n,d);it=choice("Que fração do inteiro está pintada?",cert,distintas([frs(d-n,d),frs(n,d+1),frs(n+1,d),frs(d,n)].filter(function(x){return x.split("/").join(" ")&&true}).filter(function(x){var p=x.split("/");return val(+p[0],+p[1])!==val(n,d)}),cert,2),figF(d,n,forma));it.limits=[["n22:t1",3]]}
  else if(k===2){it=typed("Quantas partes iguais estão pintadas?",n,figF(d,n,forma));it.limits=[["n22:t2",2]]}
  else if(k===3){var cand=[[d,n+1],[d,n-1],[d+1,n],[d,d-n]].filter(function(p){return p[1]>=1&&p[1]<p[0]&&val(p[1],p[0])!==val(n,d)}),ws=[],seen={};
    emb(cand).forEach(function(p){var key=p[1]/p[0];if(!seen[key]&&ws.length<2){seen[key]=1;ws.push(p)}});
    it=choice("Qual figura tem "+frs(n,d)+" do inteiro pintado?",{fig:figF(d,n,forma)},ws.map(function(p){return {fig:figF(p[0],p[1],forma)}}),null)}
  else{cert=frs(d-n,d);it=choice("Que fração do inteiro NÃO está pintada?",cert,distintas([frs(n,d),frs(d-n,d+1),frs(d-n+1,d),frs(d,d-n)].filter(function(x){var p=x.split("/");return val(+p[0],+p[1])!==val(d-n,d)}),cert,2),figF(d,n,forma));it.limits=[["n22:t4",2]]}
  it.key="f22|"+k+"|"+d+"|"+n+"|"+forma;if(!it.limits)it.limits=[["n22:t"+k,2]];it._info={k:k,d:d,n:n};
  return it;
}
/* Nível 23 — Frações maiores que o inteiro e números mistos. */
function mista(q,r,d){return q+" inteiro"+(q>1?"s":"")+" e "+frs(r,d)}
function gMista(){
  var k=pick([1,2,3,4]),d=pick([2,3,4,5,6,8]),q=rnd(1,3),r=rnd(1,d-1),n=q*d+r,forma=pick(["barra","circulo"]),it,cert;
  if(k===1){cert=frs(n,d);it=choice("Que fração das figuras está pintada? (cada figura é um inteiro)",cert,distintas([frs(d,n),frs(r,d),frs(n,d+1),frs(n+d,d)],cert,2),{t:"fracaoM",d:d,n:n,forma:forma});it.limits=[["n23:t1",3]]}
  else if(k===2){it=typed(frs(n,d)+" = "+q+" inteiro"+(q>1?"s":"")+" e __/"+d+". Qual número vai no lugar do __?",r);it.limits=[["n23:t2",2]]}
  else if(k===3){cert=frs(n,d);it=choice("Qual fração é igual a "+mista(q,r,d)+"?",cert,distintas([frs(q+r,d),frs(q*d-r,d),frs(n+1,d),frs(q*r+d,d)],cert,2),null);it.limits=[["n23:t3",2]]}
  else{it=typed(mista(q,r,d)+" = __/"+d+". Qual número vai no lugar do __?",n);it.limits=[["n23:t4",2]]}
  it.key="m23|"+k+"|"+d+"|"+n+"|"+forma;it._info={k:k,d:d,q:q,r:r,n:n};
  return it;
}
/* Nível 24 — A fração como divisão. */
function gFrDiv(){
  var k=pick([1,1,2,3]),it,a,b,cert,o=pick([["pizzas","pizza"],["barras de chocolate","barra de chocolate"],["tortas","torta"],["folhas de papel","folha de papel"]]);
  if(k===1){b=rnd(2,9);do{a=rnd(1,b+3)}while(a===b||mdc(a,b)>1&&false);cert=frs(a,b);
    it=choice("Dividindo "+a+" "+o[0]+" igualmente entre "+b+" pessoas, que fração de "+o[1]+" cada pessoa recebe? ("+a+" "+DIV+" "+b+")",cert,distintas([frs(b,a),frs(1,b),frs(a,a+b),frs(a+1,b)],cert,2),null)}
  else if(k===2){b=rnd(2,9);a=rnd(1,b+4);it=typed("A fração "+frs(a,b)+" é o mesmo que "+a+" "+DIV+" __. Qual número vai no lugar do __?",b)}
  else{b=rnd(2,9);a=b*rnd(2,9);it=typed("A fração "+frs(a,b)+" é igual a quantos inteiros?",a/b)}
  it.key="fd24|"+k+"|"+a+"|"+b+"|"+it.pre;it.limits=[["n24:t"+k,2]];it._info={k:k,a:a,b:b};
  return it;
}
/* Nível 25 — Frações na reta numérica: entre 0 e 1 e além do 1. */
function gFrReta(){
  var k=pick([1,2,3,4]),d=pick([3,4,5,6,8,10]),it,j,cert;
  if(k===1){j=rnd(1,d-1);cert=frs(j,d);it=choice("Que fração está no ponto A?",cert,distintas([frs(d-j,d),frs(j,d+1),frs(j+1,d),frs(1,j)].filter(function(x){var p=x.split("/");return val(+p[0],+p[1])!==val(j,d)}),cert,2),{t:"retaG",d:d,lab:{0:"0"},pts:[{k:j,l:"A"}]});it.extra.fig.lab[d]="1"}
  else if(k===2){j=rnd(d+1,2*d-1);cert=frs(j,d);var lab={0:"0"};lab[d]="1";lab[2*d]="2";
    it=choice("Que fração está no ponto A?",cert,distintas([frs(j-d,d),frs(d,j),frs(j,d+1),frs(j+1,d),frs(j-1,d)],cert,2),{t:"retaG",d:2*d,lab:lab,pts:[{k:j,l:"A"}]})}
  else if(k===3){j=rnd(1,d-1);var o=emb([2,3,4,5,6,8,10].filter(function(x){return x!==d})),ws=[{fig:{t:"retaG",d:d,lab:{0:"0"},pts:[{k:j===1?2:j-1,l:"A"}]}},{fig:{t:"retaG",d:o[0],lab:{0:"0"},pts:[{k:Math.min(j,o[0]-1),l:"A"}]}}];
    ws.forEach(function(w){w.fig.lab[w.fig.d]="1"});
    var main={t:"retaG",d:d,lab:{0:"0"},pts:[{k:j,l:"A"}]};main.lab[d]="1";
    ws=ws.filter(function(w){return w.fig.d*j!==d*w.fig.pts[0].k});
    it=choice("Em qual reta o ponto A está em "+frs(j,d)+"?",{fig:main},ws,null)}
  else{var l4={0:"0"};l4[d]="1";it=typed("A reta de 0 a 1 foi dividida em quantas partes iguais?",d,{t:"retaG",d:d,lab:l4,pts:[{k:rnd(1,d-1),l:"A"}]})}
  it.key="fr25|"+k+"|"+d+"|"+JSON.stringify(it.extra.fig||"");it.limits=[["n25:t"+k,2]];it._info={k:k,d:d,j:j};
  return it;
}
/* Nível 26 — Frações equivalentes. */
var BASE26=[[1,2],[1,3],[2,3],[1,4],[3,4],[2,5],[1,5],[3,5],[4,5],[1,6],[5,6]];
function gEquiv(){
  var k=pick([1,2,3,4]),b=pick(BASE26),n=b[0],d=b[1],m=pick([2,3,4]),it,cert,forma=pick(["barra","circulo"]);
  if(d*m>12&&k===4)m=2;
  if(k===1){cert=frs(n*m,d*m);it=choice("Qual fração é equivalente a "+frs(n,d)+"?",cert,distintas([frs(n+m,d+m),frs(n*m,d*m+1),frs(n*m+1,d*m),frs(d*m,n*m)].filter(function(x){var p=x.split("/");return val(+p[0],+p[1])!==val(n,d)}),cert,2),null)}
  else if(k===2)it=typed(frs(n,d)+" = __/"+(d*m)+". Qual número vai no lugar do __?",n*m);
  else if(k===3)it=typed(frs(n,d)+" = "+(n*m)+"/__. Qual número vai no lugar do __?",d*m);
  else{var ws=[[d*m,n*m+1],[d*m,n*m-1],[d*m+1,n*m]].filter(function(p){return p[1]>=1&&val(p[1],p[0])!==val(n,d)});
    it=choice("Qual figura mostra uma fração equivalente à da figura de cima?",{fig:figF(d*m,n*m,forma)},emb(ws).slice(0,2).map(function(p){return {fig:figF(p[0],p[1],forma)}}),figF(d,n,forma))}
  it.key="eq26|"+k+"|"+n+"|"+d+"|"+m;it.limits=[["n26:t"+k,2]];it._info={k:k,n:n,d:d,m:m};
  return it;
}
/* Nível 27 — Comparar e ordenar frações. */
function gCompFr(){
  var k=pick([1,2,3,4]),it,cert,a,b,d,x,y;
  if(k===1){d=rnd(4,12);do{x=rnd(1,d-1);y=rnd(1,d-1)}while(x===y);var mx=Math.max(x,y),mn=Math.min(x,y);it=choice("Qual é maior: "+frs(x,d)+" ou "+frs(y,d)+"?",frs(mx,d),[frs(mn,d)],null)}
  else if(k===2){x=rnd(1,5);var d1=rnd(x+1,9),d2;do{d2=rnd(x+1,9)}while(d2===d1);var pq=Math.min(d1,d2),gd=Math.max(d1,d2);it=choice("Qual é maior: "+frs(x,d1)+" ou "+frs(x,d2)+"?",frs(x,pq),[frs(x,gd)],null)}
  else if(k===3){var bb=pick([2,3,4,5]),mm=pick([2,3]),dd=bb*mm,p1,p2,t=0;
    do{p1=rnd(1,bb-1);p2=rnd(1,dd-1)}while((val(p1,bb)===val(p2,dd))&&t++<100);
    var ma=val(p1,bb)>val(p2,dd);it=choice("Qual é maior: "+frs(p1,bb)+" ou "+frs(p2,dd)+"?",ma?frs(p1,bb):frs(p2,dd),[ma?frs(p2,dd):frs(p1,bb)],null);x=p1;y=p2;d=bb}
  else{d=rnd(5,12);var s=emb([1,2,3,4,5,6,7,8,9,10].filter(function(v){return v<d})).slice(0,3).sort(function(u,v){return u-v}),cres=Math.random()<.6,ord=cres?s:s.slice().reverse(),lst=function(arr){return arr.map(function(v){return frs(v,d)}).join("; ")},ws=[];
    emb([[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0],[0,1,2]]).forEach(function(p){var l=lst(p.map(function(i){return ord[i]}));if(l!==lst(ord)&&ws.indexOf(l)<0&&ws.length<2)ws.push(l)});
    it=choice("Qual lista de frações está em ordem "+(cres?"crescente":"decrescente")+"?",lst(ord),ws,null);x=s[0];y=s[2]}
  it.key="cf27|"+k+"|"+it.pre;it.limits=[["n27:t"+k,2]];it._info={k:k,x:x,y:y,d:d};
  return it;
}

/* ===================== DECIMAIS E PORCENTAGEM ===================== */
function decC(n){if(n%100===0)return String(n/100);var i=Math.floor(n/100),r=n%100,f=r<10?"0"+r:(r%10===0?String(r/10):String(r));return i+","+f}   /* n centésimos como decimal */
/* Nível 28 — Decimais: ler, escrever e decompor (EF05MA02). */
function gDecim(){
  var k=pick([1,2,3,4]),it,n,d,i,t;
  if(k===1){n=rnd(11,99);if(n%10===0)n++;var inv=+(String(n).split("").reverse().join("")),cert=decC(n);
    it=choice("Que número decimal representa a parte pintada do quadro?",cert,distintas([decC(inv),decC(n*10),"0,0"+n,decC(Math.floor(n/10)*10)],cert,2),{t:"quadro100",n:n})}
  else if(k===2){t=0;var dd;do{dd=[rnd(1,9),rnd(1,9),rnd(1,9),rnd(1,9)]}while(new Set(dd).size<4&&t++<300);
    var casas=pick([1,2,3]),j=rnd(0,casas);          /* j: 0 = parte inteira; 1..casas = casas decimais */
    var numero=dd[0]+(casas>=1?dd[1]/10:0)+(casas>=2?dd[2]/100:0)+(casas>=3?dd[3]/1000:0);numero=R(numero);
    var algo=dd[j],valor=R(j===0?algo:algo/Math.pow(10,j));
    it=typed("No número "+dt(numero)+", quanto vale o algarismo "+algo+"?",valor);n=numero;d=j}
  else if(k===3){i=rnd(1,9);var d1=rnd(1,9),d2=rnd(1,9),esc=Math.random()<.5;n=R(i+d1/10+d2/100);
    it=typed(dt(n)+" = "+i+" + "+(esc?"0,__":"0,"+d1)+" + "+(esc?"0,0"+d2:"0,0__")+". Qual algarismo vai no lugar do __?",esc?d1:d2);d=esc?1:2}
  else{var cas=pick([1,2,3]),ip=rnd(0,9),fr=cas===1?rnd(1,9):cas===2?rnd(11,99):rnd(101,999);if(fr%10===0)fr++;
    var un=["","décimo","centésimo","milésimo"][cas],un2=["","décimos","centésimos","milésimos"][cas],txt=function(c,u,a){return (ip>0?ip+" inteiro"+(ip>1?"s":"")+" e ":"")+a+" "+(a===1?["","décimo","centésimo","milésimo"][c]:["","décimos","centésimos","milésimos"][c])};
    var numeroTxt=ip+","+("000"+fr).slice(-cas);n=R(ip+fr/Math.pow(10,cas));
    var cert2=txt(cas,un,fr),outros=[1,2,3].filter(function(c){return c!==cas}).map(function(c){return txt(c,"",fr)});
    it=choice("Como se lê o número "+dt(n)+"?",cert2,outros.slice(0,2),null);d=cas}
  it.key="dc28|"+k+"|"+it.pre;it.limits=[["n28:t"+k,2]];it._info={k:k,n:n,d:d};
  return it;
}
/* Nível 29 — Decimais na reta numérica. */
function gRetaDec(){
  var k=pick([1,2,3,4]),it,j=rnd(1,9),m=rnd(0,8),lab;
  if(k===1){lab={0:"0",10:"1"};var cert=decC(j*10);it=choice("Que número decimal está no ponto A?",cert,distintas([decC(j),decC(100-j*10),decC(j*10+100)],cert,2),{t:"retaG",d:10,lab:lab,pts:[{k:j,l:"A"}]})}
  else if(k===2){lab={0:String(m),10:String(m+1)};it=typed("Que número decimal está no ponto A?",R(m+j/10),{t:"retaG",d:10,lab:lab,pts:[{k:j,l:"A"}]})}
  else if(k===3){var t0=rnd(1,8);lab={0:decC(t0*10),10:decC(t0*10+10)};it=typed("O ponto A está entre "+lab[0]+" e "+lab[10]+". Que número decimal ele marca?",R(t0/10+j/100),{t:"retaG",d:10,lab:lab,pts:[{k:j,l:"A"}]})}
  else{var v=R(m+j/10),mk=function(mm,jj){var l={0:String(mm),10:String(mm+1)};return {fig:{t:"retaG",d:10,lab:l,pts:[{k:jj,l:"A"}]}}},wj=j===5?4:5;
    it=choice("Em qual reta o ponto A está em "+dt(v)+"?",mk(m,j),[mk(m,wj),mk(m>0?m-1:m+1,j)],null)}
  it.key="rd29|"+k+"|"+j+"|"+m+"|"+it.pre;it.limits=[["n29:t"+k,2]];it._info={k:k,j:j,m:m};
  return it;
}
/* Nível 30 — Comparar e ordenar decimais; fração ↔ decimal. */
var FD30=[["1/2","0,5"],["1/4","0,25"],["3/4","0,75"],["1/5","0,2"],["2/5","0,4"],["3/5","0,6"],["4/5","0,8"],["1/10","0,1"],["3/10","0,3"],["7/10","0,7"],["9/10","0,9"]];
function dec2(c){return decC(c)}                                    /* c em centésimos */
function gCompDec(){
  var k=pick([1,2,3,4]),it,a,b,x,y;
  if(k===1){var t=0;do{a=rnd(11,99);b=rnd(11,99);if(Math.random()<.6)a=Math.round(a/10)*10}while((a===b||Math.abs(a-b)<2)&&t++<300);
    var mx=Math.max(a,b),mn=Math.min(a,b);it=choice("Qual é maior: "+dec2(a)+" ou "+dec2(b)+"?",dec2(mx),[dec2(mn)],null);x=a;y=b}
  else if(k===2){var s=emb([5,12,20,25,30,37,40,45,50,60,75,80,90,99,105,110,120,150,205]).slice(0,3).sort(function(u,v){return u-v}),cres=Math.random()<.6,ord=cres?s:s.slice().reverse(),lst=function(arr){return arr.map(dec2).join("; ")},ws=[];
    emb([[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0],[0,1,2]]).forEach(function(p){var l=lst(p.map(function(i){return ord[i]}));if(l!==lst(ord)&&ws.indexOf(l)<0&&ws.length<2)ws.push(l)});
    it=choice("Qual lista de decimais está em ordem "+(cres?"crescente":"decrescente")+"?",lst(ord),ws,null);x=s[0];y=s[2]}
  else if(k===3){var par=pick(FD30),dir=Math.random()<.5;x=par[0];y=par[1];
    if(dir)it=choice("Qual número decimal é igual a "+par[0]+"?",par[1],distintas(FD30.map(function(p){return p[1]}),par[1],2),null);
    else it=choice("Qual fração é igual a "+par[1]+"?",par[0],distintas(FD30.map(function(p){return p[0]}),par[0],2),null)}
  else{var c=pick([20,30,40,50,60,70,80,90]),alvo=Math.random()<.5,r=alvo?"=":null,v1,v2,sinal;
    v1=dec2(c);v2=Math.random()<.4?dec2(c)+"0":dec2(c+pick([5,10,-5,-10]));
    if(c%10===0&&v2===dec2(c)+"0"){}else if(v2===dec2(c)+"0")v2=dec2(c+10);
    var nv1=+v1.replace(",","."),nv2=+v2.replace(",","."),sg=nv1<nv2?"<":nv1>nv2?">":"=";
    it=choice("Qual sinal completa? "+v1+" ◻ "+v2,sg,["<",">","="].filter(function(z){return z!==sg}),null);x=v1;y=v2}
  it.key="cd30|"+k+"|"+it.pre;it.limits=[["n30:t"+k,2]];it._info={k:k,x:x,y:y};
  return it;
}
/* Nível 31 — Somar e subtrair decimais (até centésimos). */
function gSomaDec(){
  var k=pick([1,2,3,4]),casas=k<=2?1:2,soma=k===1||k===3,A,B,t=0;
  /* k1: soma com décimos; k2: subtração com décimos; k3: soma com centésimos; k4: subtração com centésimos (valores em centésimos) */
  soma=k===1||k===3;casas=k<=2?1:2;
  function g(){var v=casas===1?rnd(11,999)*10:rnd(101,9999);if(casas===2&&v%10===0)v++;if(casas===1&&v%100===0)v+=10;return v}
  do{A=g();B=g()}while(((!soma&&A-B<100)||(soma&&A+B>99999))&&t++<500);
  if(!soma&&A<B){var tmp=A;A=B;B=tmp}
  var res=soma?A+B:A-B,it=typed(dt(A/100)+" "+(soma?"+":MENOS)+" "+dt(B/100)+" =",R(res/100,2));
  it.key="sd31|"+k+"|"+A+"|"+B;it.limits=[["n31:t"+k,3]];it._info={k:k,A:A,B:B,res:res};
  return it;
}
/* Nível 32 — Problemas com decimais: dinheiro e medidas. */
function gProbDec(){
  var k=pick([1,2,3,4]),it,n=pick(NAMES),A,B,P;
  function preco(){return 5*rnd(60,900)}                           /* R$ 3,00 a R$ 45,00, de 5 em 5 centavos */
  if(k===1){A=preco();B=preco();it=typed(n[0]+" comprou um caderno de "+real(A)+" e uma caneta de "+real(B)+". Quantos reais "+(n[1]==="f"?"ela":"ele")+" gastou ao todo?",R((A+B)/100,2),null,"reais")}
  else if(k===2){A=preco();P=pick([50,100,200].filter(function(x){return x*100>A+500}));it=typed(n[0]+" pagou uma compra de "+real(A)+" com uma nota de "+P+" reais. Quantos reais "+(n[1]==="f"?"ela":"ele")+" recebeu de troco?",R((P*100-A)/100,2),null,"reais")}
  else if(k===3){A=rnd(11,499)*5;B=rnd(11,499)*5;it=typed("Uma fita tem "+dt(A/100)+" m e outra tem "+dt(B/100)+" m. Quantos metros têm as duas fitas juntas?",R((A+B)/100,2),null,"m")}
  else{A=preco();B=preco();if(A===B)B+=5;var g=Math.max(A,B),p=Math.min(A,B);it=typed("Um suco custa "+real(g)+" e outro custa "+real(p)+". Quantos reais o primeiro é mais caro que o segundo?",R((g-p)/100,2),null,"reais")}
  it.key="pd32|"+k+"|"+it.pre;it.limits=[["n32:t"+k,2],["nome:"+n[0],1]];it._info={k:k,A:A,B:B,P:P};
  return it;
}
/* Nível 33 — Multiplicar decimal por número natural (e por 10, 100 e 1 000). */
function gMulDec(){
  var k=pick([1,2,3,4]),it,A,m,t=0;
  if(k===1){m=pick([10,100,1000]);A=rnd(11,999);if(A%10===0)A++;it=typed(dt(A/100)+" "+VEZES+" "+fmt(m)+" =",R(A*m/100,3))}
  else if(k===2){m=rnd(2,9);A=pick([rnd(11,99)*10,rnd(101,999)]);if(A%10===0&&Math.random()<.5)A++;it=typed(dt(A/100)+" "+VEZES+" "+m+" =",R(A*m/100,2))}
  else if(k===3){m=rnd(2,9);A=pick([rnd(11,99)*10,rnd(101,499)]);it=typed(m+" "+VEZES+" "+dt(A/100)+" =",R(A*m/100,2))}
  else{m=rnd(2,9);A=5*rnd(40,400);it=typed("Cada caderno custa "+real(A)+". Quantos reais custam "+m+" cadernos?",R(A*m/100,2),null,"reais")}
  it.key="md33|"+k+"|"+A+"|"+m;it.limits=[["n33:t"+k,2]];it._info={k:k,A:A,m:m};
  return it;
}
/* Nível 34 — Dividir decimal por número natural, e quociente decimal. */
function gDivDec(){
  var k=pick([1,2,3,4]),it,d,Q,N,m;
  if(k===1){d=rnd(2,9);Q=rnd(11,999);if(Q%10===0)Q++;N=Q*d;it=typed(dt(N/100)+" "+DIV+" "+d+" =",R(Q/100,2))}
  else if(k===2){d=pick([2,4,5]);var t=0;do{N=rnd(3,99)}while(N%d===0&&t++<100);it=typed(N+" "+DIV+" "+d+" =",R(N/d,2))}
  else if(k===3){m=pick([10,100,1000]);N=m===1000?10*rnd(11,999):rnd(11,999);if(m===1000&&N%100===0)N+=10;it=typed(fmt(N)+" "+DIV+" "+fmt(m)+" =",R(N/m,2))}
  else{d=rnd(2,9);Q=5*rnd(40,400);N=Q*d;it=typed(d+" amigos dividem igualmente uma conta de "+real(N)+". Quantos reais cada um paga?",R(Q/100,2),null,"reais")}
  it.key="dd34|"+k+"|"+it.pre;it.limits=[["n34:t"+k,2]];it._info={k:k,d:d,Q:Q,N:N,m:m};
  return it;
}
/* Nível 35 — Porcentagem: 10%, 25%, 50%, 75% e 100% (EF05MA06). */
var COISAS35=[["camisetas",1],["bolas",1],["livros",0],["carros",0],["balões",0],["bonecas",1]],ASSOC=[["10%","a décima parte"],["25%","a quarta parte"],["50%","a metade"],["75%","três quartos"],["100%","o inteiro"]];
function gPorc(){
  var k=pick([1,2,3,4,5]),it,p,n,hist=Math.random()<.5,c=pick(COISAS35);
  if(k===1){p=10;n=10*rnd(2,40)}else if(k===2){p=50;n=2*rnd(5,200)}else if(k===3){p=25;n=4*rnd(3,60)}else if(k===4){p=75;n=4*rnd(3,60)}
  if(k<=4){var res=n*p/100;it=hist?typed("Uma loja tinha "+n+" "+c[0]+" e vendeu "+p+"% delas. "+qs(c[1])+"foram vendid"+(c[1]?"as":"os")+"?",res):typed(p+"% de "+n+" =",res)}
  else{var a=pick(ASSOC),dir=Math.random()<.5;
    if(dir)it=choice("Qual porcentagem é o mesmo que "+a[1]+"?",a[0],distintas(ASSOC.map(function(x){return x[0]}),a[0],2),null);
    else it=choice("A porcentagem "+a[0]+" é o mesmo que…",a[1],distintas(ASSOC.map(function(x){return x[1]}),a[1],2),null);p=a[0]}
  it.key="pc35|"+k+"|"+it.pre;it.limits=[["n35:t"+k,2]];it._info={k:k,p:p,n:n};
  return it;
}
/* Nível 36 — Porcentagem no dinheiro: desconto e acréscimo (10%, 25% e 50%). */
function gPorcDin(){
  var k=pick([1,2,3,4]),pr=20*rnd(2,25),pc=pick([10,25,50]),it,desc=pr*pc/100;
  if(k===1)it=typed("Uma bicicleta custa "+pr+" reais e está com "+pc+"% de desconto. De quantos reais é o desconto?",desc,null,"reais");
  else if(k===2)it=typed("Uma bicicleta custa "+pr+" reais e está com "+pc+"% de desconto. Quanto ela custa agora?",pr-desc,null,"reais");
  else if(k===3)it=typed("Um produto custava "+pr+" reais e subiu "+pc+"%. Quanto ele custa agora?",pr+desc,null,"reais");
  else{var fixo=5*rnd(Math.ceil(desc/5)-3>1?Math.ceil(desc/5)-3:1,Math.ceil(desc/5)+3);if(fixo===desc)fixo+=5;var mel=desc>fixo?"A":"B";
    it=choice("A loja A dá "+pc+"% de desconto em um produto de "+pr+" reais. A loja B dá "+fixo+" reais de desconto no mesmo produto. Qual loja tem o menor preço?","loja "+mel,["loja "+(mel==="A"?"B":"A")],null);it._info={fixo:fixo}}
  it.key="pd36|"+k+"|"+it.pre;it.limits=[["n36:t"+k,2]];it._info=it._info||{};it._info.k=k;it._info.pr=pr;it._info.pc=pc;it._info.desc=desc;
  return it;
}

/* ===================== GEOMETRIA ===================== */
function par(x,y){return "("+x+", "+y+")"}
/* Nível 37 — Plano cartesiano: localizar pontos, coordenadas e células de planilha (EF05MA14, EF05MA15). 1º quadrante, de 0 a 10. */
function gCart(){
  var k=pick([1,2,3,4]),it,x,y,cert;
  if(k===1){x=rnd(1,9);y=rnd(1,9);cert=par(x,y);it=choice("Quais são as coordenadas do ponto A? (primeiro o número do eixo horizontal, depois o do vertical)",cert,distintas([par(y,x),par(x,y+1),par(x+1,y),par(x,y-1)].filter(function(s){return s!==cert}),cert,2),{t:"cartesiano",pts:[{x:x,y:y,l:"A"}]})}
  else if(k===2){var pts=[],t=0;while(pts.length<3&&t++<200){var px=rnd(1,9),py=rnd(1,9);if(pts.every(function(p){return p.x!==px&&p.y!==py&&!(p.x===py&&p.y===px)}))pts.push({x:px,y:py,l:"ABC".charAt(pts.length)})}
    var alvo=rnd(0,2),ptsF=pts.slice();x=ptsF[alvo].x;y=ptsF[alvo].y;
    it=choice("Qual ponto está em "+par(x,y)+"? (primeiro o número do eixo horizontal, depois o do vertical)","ABC".charAt(alvo),["A","B","C"].filter(function(l,i){return i!==alvo}),{t:"cartesiano",pts:ptsF})}
  else if(k===3){x=rnd(1,8);y=rnd(1,8);cert="ABCDEFGH".charAt(x-1)+y;it=choice("Numa planilha, a letra indica a coluna e o número indica a linha. Em que célula está o ponto?",cert,distintas(["ABCDEFGH".charAt(x-1)+(y%8+1),"ABCDEFGH".charAt(x%8)+y,"ABCDEFGH".charAt(y-1)+x,"ABCDEFGH".charAt(x-1)+(y>1?y-1:y+1)],cert,2),{t:"cartesiano",sheet:true,max:8,pts:[{x:x,y:y}]})}
  else{var h=Math.random()<.5,a=rnd(1,5),b=rnd(a+2,9),c=rnd(1,9);var p1=h?{x:a,y:c,l:"A"}:{x:c,y:a,l:"A"},p2=h?{x:b,y:c,l:"B"}:{x:c,y:b,l:"B"};
    it=typed("Os pontos A e B estão "+(h?"na mesma linha":"na mesma coluna")+". Quantas unidades separam A de B?",b-a,{t:"cartesiano",pts:[p1,p2]});x=a;y=b}
  it.key="ct37|"+k+"|"+it.pre+"|"+JSON.stringify(it.extra.fig.pts);it.limits=[["n37:t"+k,2]];it._info={k:k,x:x,y:y};
  return it;
}
/* Nível 38 — Plano cartesiano: movimentos, mudanças de direção e giros (EF05MA15). */
var DIRS=["norte (para cima)","leste (para a direita)","sul (para baixo)","oeste (para a esquerda)"];
function gMov(){
  var k=pick([1,2,3,4]),it,x,y,dx,dy,cert;
  if(k===1){dx=rnd(1,4);dy=rnd(1,4);x=rnd(0,10-dx);y=rnd(0,10-dy);cert=par(x+dx,y+dy);
    it=choice("Do ponto A, ande "+dx+" unidade"+(dx>1?"s":"")+" para a direita e "+dy+" para cima. Em que ponto você chega?",cert,distintas([par(x+dy,y+dx),par(x+dx,y),par(x,y+dy),par(x+dx+1,y+dy)].filter(function(s){return s!==cert}),cert,2),{t:"cartesiano",pts:[{x:x,y:y,l:"A"}]})}
  else if(k===2){dx=rnd(1,5);dy=rnd(1,5);x=rnd(0,10-dx);y=rnd(0,10-dy);it=typed("Quantas unidades você anda, ao todo, de A até B, indo só para a direita e para cima?",dx+dy,{t:"cartesiano",pts:[{x:x,y:y,l:"A"},{x:x+dx,y:y+dy,l:"B"}]})}
  else if(k===3){var d0=rnd(0,3),giro=pick([[1,"um quarto de volta para a direita"],[3,"um quarto de volta para a esquerda"],[2,"meia volta"]]),d1=(d0+giro[0])%4;
    it=choice("Você está virado para o "+DIRS[d0]+". Depois de dar "+giro[1]+", para onde você fica virado?",DIRS[d1],DIRS.filter(function(s,i){return i!==d1&&i!==d0}).slice(0,2),null);x=d0;y=giro[0]}
  else{dx=rnd(1,4);dy=rnd(1,3);var vl=rnd(1,Math.min(3,dx+1));x=rnd(vl,10-dx);y=rnd(0,10-dy);cert=par(x+dx-vl,y+dy);
    it=choice("Do ponto A, ande "+dx+" unidade"+(dx>1?"s":"")+" para a direita, "+dy+" para cima e depois "+vl+" para a esquerda. Em que ponto você chega?",cert,distintas([par(x+dx+vl,y+dy),par(x+dx,y+dy),par(x+dx-vl,y+dy+1),par(x+dx-vl,y)].filter(function(s){return s!==cert}),cert,2),{t:"cartesiano",pts:[{x:x,y:y,l:"A"}]})}
  it.key="mv38|"+k+"|"+it.pre+"|"+JSON.stringify((it.extra&&it.extra.fig)||"");it.limits=[["n38:t"+k,2]];it._info={k:k,x:x,y:y,dx:dx,dy:dy};
  return it;
}
/* Nível 39 — Sólidos: planificações e atributos (EF05MA16). */
var PLAN39=[["cubo-a","cubo",6],["bloco","bloco retangular",6],["piramide","pirâmide de base quadrada",5],["cilindro","cilindro",3],["cone","cone",2]];
var ATRIB39=[["cilindro","duas bases circulares e uma superfície curva"],["cone","uma base circular e uma ponta, o vértice"],["pirâmide de base quadrada","uma base quadrada e quatro faces triangulares"],["prisma de base triangular","duas bases triangulares e três faces retangulares"],["cubo","seis faces quadradas"],["esfera","nenhuma face plana"]];
var BASES39=[[3,"triangular"],[4,"quadrada"],[5,"pentagonal"],[6,"hexagonal"]];
function gSolidos(){
  var k=pick([1,2,3,4]),it,p=pick(PLAN39),b=pick(BASES39),n=b[0];
  if(k===1)it=choice("Esta planificação forma qual sólido?",p[1],distintas(PLAN39.map(function(x){return x[1]}),p[1],2),{t:"planif",n:p[0]});
  else if(k===2){var prisma=Math.random()<.5,el=pick([0,1,2]),cont=prisma?[n+2,3*n,2*n][el]:[n+1,2*n,n+1][el];
    it=typed("Um"+(prisma?" prisma":"a pirâmide")+" de base "+b[1]+" tem "+["quantas faces","quantas arestas","quantos vértices"][el]+"?",cont);p=[prisma,el,n]}
  else{var pl=pick([["cilindro",2],["cone",1]]);it=typed("Quantos círculos aparecem na planificação de um "+pl[0]+"?",pl[1],{t:"planif",n:pl[0]});p=pl}
  if(k===4){var a=pick(ATRIB39);it=choice("Qual sólido tem "+a[1]+"?",a[0],distintas(ATRIB39.map(function(x){return x[0]}),a[0],2),null);p=a}
  it.key="s39|"+k+"|"+it.pre+"|"+JSON.stringify((it.extra&&it.extra.fig)||"");it.limits=[["n39:t"+k,2]];it._info={k:k,p:p};
  return it;
}
/* Nível 40 — Polígonos: lados, vértices e ângulos (EF05MA17). */
var LADOS40={"triângulo":3,"quadrado":4,"retângulo":4,"trapézio":4,"paralelogramo":4,"losango":4,"pentágono":5,"hexágono":6};
var RETOS40={"triângulo":0,"quadrado":4,"retângulo":4,"trapézio":0,"paralelogramo":0,"losango":0,"pentágono":0,"hexágono":0};
var DESC40=[["quadrado","4 lados iguais e 4 ângulos retos",["retângulo","losango","trapézio"]],["retângulo","4 ângulos retos e os lados opostos iguais, mas nem todos os lados iguais",["quadrado","losango","paralelogramo"]],
  ["triângulo","3 lados e 3 vértices",["quadrado","pentágono","hexágono"]],["pentágono","5 lados e 5 vértices",["triângulo","hexágono","quadrado"]],["hexágono","6 lados e 6 vértices",["pentágono","triângulo","retângulo"]]];
function gPoligono(){
  var k=pick([1,1,2,3,4]),it,nome=pick(Object.keys(LADOS40)),f={t:"shape",n:nome,color:pick(["#8FB0FF","#FFB92B","#7EE0BE","#FFA99E"])};
  if(k===1)it=typed("Quantos lados tem este polígono?",LADOS40[nome],f);
  else if(k===2){var nn=pick([3,5,6]),nm={3:"triângulo",5:"pentágono",6:"hexágono"}[nn];it=choice("Como se chama o polígono que tem "+nn+" lados?",nm,["triângulo","pentágono","hexágono","quadrado"].filter(function(x){return x!==nm}).slice(0,2),null);nome=nm}
  else if(k===3)it=typed("Quantos ângulos retos tem este polígono?",RETOS40[nome],f);
  else{var d=pick(DESC40);it=choice("Qual polígono tem "+d[1]+"?",d[0],d[2].slice(0,2),null);nome=d[0]}
  it.key="pg40|"+k+"|"+it.pre+"|"+nome+(it.extra&&it.extra.fig?it.extra.fig.color:"");it.limits=[["n40:t"+k,2]];it._info={k:k,nome:nome};
  return it;
}
/* Nível 41 — Ampliação e redução na malha (EF05MA18). Caixas de 5 x 5. */
var BASE41=[[[0,0],[0,1],[1,1]],[[0,0],[1,0],[1,1]],[[0,0],[1,0]],[[0,0],[0,1]],[[0,0],[1,0],[0,1],[1,1]],[[0,0],[0,1],[1,0]]];
function escala(cells,sx,sy){var out=[];cells.forEach(function(c){for(var i=0;i<sx;i++)for(var j=0;j<sy;j++)out.push([c[0]*sx+i,c[1]*sy+j])});return out}
function gAmplia(){
  var k=pick([1,2,3,4]),it,base=pick(BASE41),s=pick([2,2,2,2]),A=base,B=escala(base,s,s),it2;
  var unit=Math.random()<.25;if(unit){base=[[0,0]];s=pick([2,3,4]);A=base;B=escala(base,s,s)}
  if(k===1)it=typed("A figura B é uma ampliação da figura A. Quantas vezes cada lado ficou maior?",s,{t:"malha2",labels:true,shapes:[{cells:A},{cells:B}]});
  else if(k===2)it=typed("A figura B é uma redução da figura A. Cada lado de A é quantas vezes maior que o lado de B?",s,{t:"malha2",labels:true,shapes:[{cells:B},{cells:A}]});
  else if(k===3)it=choice("Quando uma figura é ampliada ou reduzida na malha, o que acontece com os ângulos?","os ângulos continuam iguais",["os ângulos ficam maiores","os ângulos ficam menores"],{t:"malha2",labels:true,shapes:[{cells:A},{cells:B}]});
  else{var ws=[escala(base,2,1),escala(base,1,2)].filter(function(c){return JSON.stringify(c.slice().sort())!==JSON.stringify(B.slice().sort())&&c.every(function(q){return q[0]<5&&q[1]<5})});
    if(!ws.length||unit){ws=[escala(base,s,1),escala(base,1,s)]}
    ws=ws.filter(function(c){return JSON.stringify(c.slice().sort())!==JSON.stringify(B.slice().sort())&&c.every(function(q){return q[0]<5&&q[1]<5})});
    it=choice("Qual figura é uma ampliação da figura A?",{fig:{t:"malha2",shapes:[{cells:B}]}},ws.slice(0,2).map(function(c){return {fig:{t:"malha2",shapes:[{cells:c}]}}}),{t:"malha2",shapes:[{cells:A}]})}
  it.key="am41|"+k+"|"+JSON.stringify(A)+"|"+s;it.limits=[["n41:t"+k,2]];it._info={k:k,s:s,A:A,B:B,unit:unit};
  return it;
}

/* ===================== MEDIDAS ===================== */
/* Nível 42 — Conversões de comprimento, massa e capacidade, com decimais (EF05MA19). */
var CONV42=[["km","m",1000,"c"],["m","cm",100,"c"],["cm","mm",10,"c"],["kg","g",1000,"m"],["L","mL",1000,"v"]];
function gConv5(){
  var k=pick([1,2,3,4]),it,c,v,f,baixo=Math.random()<.55;
  if(k<=3){c=pick(CONV42.filter(function(x){return x[3]===["c","m","v"][k-1]}));f=c[2];
    if(baixo){v=pick([R(rnd(11,99)/10,1),R(rnd(11,999)/100,2),rnd(2,9)]);if(v===Math.floor(v)&&Math.random()<.5)v=R(v+0.5,1);it=typed(dt(v)+" "+c[0]+" = __ "+c[1]+". Qual número vai no lugar do __?",R(v*f,3))}
    else{var m=pick([f/100,f/10,f/10]);m=Math.max(m,1);v=Math.round(rnd(11,999)*m);if(f===10)v=rnd(11,199);it=typed(fmt(v)+" "+c[1]+" = __ "+c[0]+". Qual número vai no lugar do __?",R(v/f,2));
      var tt=0;while(R(v/f,2)*f!==v&&tt++<50){v=Math.round(rnd(11,999)*m);it=typed(fmt(v)+" "+c[1]+" = __ "+c[0]+". Qual número vai no lugar do __?",R(v/f,2))}}
  }else{
    var q=pick([1,2,3,4]);
    if(q===1){var l=pick([1.5,2.5,0.5,1.25]),n=rnd(2,6);it=typed("Uma garrafa tem "+dt(l)+" L de suco. Quantos mL há em "+n+" garrafas?",R(l*n*1000,3),null,"mL");v=l;f=n}
    else if(q===2){var mm=pick([0.5,1.5,2.5,0.25,0.75]),n2=rnd(2,8);it=typed("Cada pacote de arroz pesa "+dt(mm)+" kg. Quantos gramas pesam "+n2+" pacotes?",R(mm*n2*1000,3),null,"g");v=mm;f=n2}
    else if(q===3){var mt=pick([2.5,3,4.5,6]),pe=pick([50,25,10,30].filter(function(x){return (mt*100)%x===0}));it=typed("Uma corda de "+dt(mt)+" m foi cortada em pedaços de "+pe+" cm. Quantos pedaços foram feitos?",mt*100/pe);v=mt;f=pe}
    else{var kmv=rnd(2,9),tr=pick([3,4,5,8]);it=typed("Uma trilha de "+kmv+" km será percorrida em "+tr+" dias, com o mesmo percurso a cada dia. Quantos metros por dia?",kmv*1000/tr,null,"m");v=kmv;f=tr;if((kmv*1000)%tr!==0){it=typed("Uma trilha de "+kmv+" km será percorrida em 4 dias, com o mesmo percurso a cada dia. Quantos metros por dia?",kmv*250,null,"m");f=4}}
    c=["prob",q]}
  it.key="cv42|"+k+"|"+it.pre;it.limits=[["n42:t"+k,2]];it._info={k:k,v:v,f:f,c:c,baixo:baixo};
  return it;
}
/* Nível 43 — Tempo e temperatura em problemas (EF05MA19). */
function hm(m){return Math.floor(m/60)+":"+(m%60<10?"0":"")+(m%60)}
function gTempoTemp(){
  var k=pick([1,2,3,4]),it,a,b,t;
  if(k===1){a=60*rnd(8,17)+5*rnd(0,11);b=a+rnd(35,230);it=typed("O filme começou às "+hm(a)+" e terminou às "+hm(b)+". Quantos minutos ele durou?",b-a,null,"min")}
  else if(k===2){var h=rnd(1,5),m=5*rnd(1,11);it=typed(h+" h "+m+" min = __ min. Qual número vai no lugar do __?",60*h+m)}
  else if(k===3){t=5*rnd(2,8);var sobe=Math.random()<.5,d=sobe?rnd(3,Math.min(12,45-t)):rnd(3,Math.min(12,t));b=sobe?t+d:t-d;
    it=typed("O termômetro mostra a temperatura de agora. Daqui a algumas horas ela "+(sobe?"vai subir ":"vai descer ")+d+" graus. Que temperatura estará marcando?",b,{t:"termo",g:t},"°C");a=t}
  else{var sem=rnd(2,6),di=rnd(1,6),ao=Math.random()<.65;
    if(ao)it=typed(sem+" semana"+(sem>1?"s":"")+" e "+di+" dia"+(di>1?"s":"")+" = __ dias. Qual número vai no lugar do __?",7*sem+di);
    else{var s2=rnd(2,8);it=typed((7*s2)+" dias = __ semanas. Qual número vai no lugar do __?",s2)}a=sem;b=di}
  it.key="tt43|"+k+"|"+it.pre;it.limits=[["n43:t"+k,2]];it._info={k:k,a:a,b:b,t:t};
  return it;
}
/* Nível 44 — Perímetro e área na malha: figuras de mesmo perímetro e áreas diferentes (EF05MA20). */
function poli(k){
  var cells=[[rnd(0,4),rnd(0,4)]],t=0;
  while(cells.length<k&&t++<500){var c=pick(cells),d=pick([[1,0],[-1,0],[0,1],[0,-1]]),n=[c[0]+d[0],c[1]+d[1]];
    if(n[0]<0||n[0]>4||n[1]<0||n[1]>4||cells.some(function(q){return q[0]===n[0]&&q[1]===n[1]}))continue;cells.push(n)}
  return cells;
}
function areaP(cells){return cells.length}
function perimP(cells){var adj=0;cells.forEach(function(a,i){cells.forEach(function(b,j){if(j>i&&Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])===1)adj++})});return 4*cells.length-2*adj}
function fig44(c){return {t:"malha2",shapes:[{cells:c}]}}
function gAreaPerim(){
  var k=pick([1,2,3,4]),it,c,t=0;
  if(k===1){c=poli(rnd(4,10));it=typed("Cada quadradinho tem 1 unidade de área. Qual é a área da figura?",areaP(c),fig44(c),"quadradinhos");it._info={k:k,area:areaP(c),per:perimP(c)}}
  else if(k===2){c=poli(rnd(4,9));it=typed("O lado de cada quadradinho mede 1 unidade. Qual é o perímetro da figura?",perimP(c),fig44(c),"unidades");it._info={k:k,area:areaP(c),per:perimP(c)}}
  else if(k===3){var fs=[],as=[];while(fs.length<3&&t++<400){var q=poli(rnd(3,10)),a=areaP(q);if(as.indexOf(a)<0){as.push(a);fs.push(q)}}
    var mx=Math.max.apply(null,as),im=as.indexOf(mx);it=choice("Qual figura tem a maior área?",{fig:fig44(fs[im])},fs.filter(function(f,i){return i!==im}).map(function(f){return {fig:fig44(f)}}),null);it._info={k:k,areas:as,per:fs.map(perimP)}}
  else{var res=ate(function(){var A=poli(rnd(4,9)),pa=perimP(A),B=poli(rnd(3,10));if(perimP(B)!==pa||areaP(B)===areaP(A))return null;
      var wr=[];for(var z=0;z<60&&wr.length<2;z++){var W=poli(rnd(3,10));if(perimP(W)!==pa&&wr.every(function(w){return JSON.stringify(w)!==JSON.stringify(W)}))wr.push(W)}return wr.length===2?[A,B,wr]:null},4000);
    if(!res){var A0=[[0,0],[1,0],[2,0],[3,0]],B0=[[0,0],[1,0],[0,1],[1,1]];res=[A0,[[0,0],[1,0],[2,0],[2,1]].concat([]),[B0,[[0,0],[1,0],[2,0],[1,1],[1,2]]]]}
    it=choice("Qual figura tem o mesmo perímetro da figura de cima, mas uma área diferente?",{fig:fig44(res[1])},res[2].map(function(w){return {fig:fig44(w)}}),fig44(res[0]));it._info={k:k,per:perimP(res[0]),area:areaP(res[0])}}
  it.key="ap44|"+k+"|"+JSON.stringify(it.extra.fig)+"|"+(it.extra.opts?it.extra.opts.length+JSON.stringify(it.extra.opts[it.a-1]):"");it.limits=[["n44:t"+k,2]];
  return it;
}
/* Nível 45 — Volume: contar cubinhos (EF05MA21). */
function gVolume(){
  var k=pick([1,2,3,4]),it,a,b,c;
  if(k===1){a=rnd(2,4);b=rnd(2,3);c=rnd(1,3);it=typed("Cada cubinho tem volume de 1 cm³. Quantos cubinhos formam o bloco?",a*b*c,{t:"cubos",a:a,b:b,c:c},"cubinhos")}
  else if(k===2){var cam=pick([6,8,9,12,15]);c=rnd(2,5);it=typed("Uma caixa é preenchida com camadas de "+cam+" cubinhos cada uma. Ela tem "+c+" camadas. Quantos cubinhos há na caixa?",cam*c,null,"cubinhos");a=cam;b=1}
  else if(k===3){var bl=[],vs=[],t=0;while(bl.length<3&&t++<300){var x=rnd(1,4),y=rnd(1,3),z=rnd(1,3),v=x*y*z;if(vs.indexOf(v)<0){vs.push(v);bl.push({a:x,b:y,c:z})}}
    var mx=Math.max.apply(null,vs),im=vs.indexOf(mx);it=choice("Qual bloco tem o maior volume? (cada cubinho vale 1 unidade)",{fig:{t:"cubos",a:bl[im].a,b:bl[im].b,c:bl[im].c}},bl.filter(function(q,i){return i!==im}).map(function(q){return {fig:{t:"cubos",a:q.a,b:q.b,c:q.c}}}),null);a=bl[im].a;b=bl[im].b;c=bl[im].c}
  else{a=rnd(2,6);b=rnd(2,5);c=rnd(2,4);it=typed("Um bloco tem "+a+" cubinhos de comprimento, "+b+" de largura e "+c+" de altura. Quantos cubinhos ele tem ao todo?",a*b*c,null,"cubinhos")}
  it.key="vo45|"+k+"|"+it.pre+"|"+JSON.stringify((it.extra&&it.extra.fig)||"")+"|"+(it.extra&&it.extra.opts?JSON.stringify(it.extra.opts[it.a-1]):"");it.limits=[["n45:t"+k,2]];it._info={k:k,a:a,b:b,c:c};
  return it;
}

/* ===================== DADOS E ACASO ===================== */
var COR46=["azul","amarelo","rosa","roxo","vermelho","verde"];
function roleta5(n,desigual){
  var cs=emb(COR46).slice(0,n),np=pick([6,8]),cont;
  if(!desigual){np=n*rnd(2,3);if(np>8)np=n*2;cont=cs.map(function(){return np/n})}
  else{cont=cs.map(function(){return 1});for(var i=n;i<np;i++)cont[rnd(0,n-1)]++;if(cont.every(function(x){return x===cont[0]}))cont[0]++}
  var parts=[];cs.forEach(function(c,i){for(var j=0;j<cont[i];j++)parts.push(c)});
  return {cs:cs,cont:cont,parts:emb(parts)};
}
var DADO46=[["sair um número par",3],["sair um número ímpar",3],["sair o número 5",1],["sair um número maior que 4",2],["sair um número menor que 3",2],["sair um múltiplo de 3",2],["sair um número maior que 6",0]];
function gProbab(){
  var k=pick([1,2,3,4]),it,r,cert;
  if(k===1){var tipo=pick([0,1,2]);if(tipo===0)it=typed("Quantos resultados diferentes podem sair ao lançar um dado comum?",6);else if(tipo===1)it=typed("Quantos resultados diferentes podem sair ao lançar uma moeda?",2);else{r=roleta5(rnd(3,5),true);it=typed("A seta da roleta pode parar em quantas cores diferentes?",r.cs.length,{t:"roleta",parts:r.parts})}
    r=r||{parts:[tipo]}}
  else if(k===2){var ig=Math.random()<.5;r=roleta5(rnd(2,4),!ig);var eq=r.cont.every(function(x){return x===r.cont[0]});
    it=choice("Os resultados da roleta (cada cor) têm a mesma chance de acontecer?",eq?"sim":"não",[eq?"não":"sim"],{t:"roleta",parts:r.parts})}
  else if(k===3){r=roleta5(rnd(2,4),true);var i=rnd(0,r.cs.length-1),c=r.cont[i],t=r.parts.length;cert=frs(c,t);
    it=choice("A seta da roleta vai parar em uma das partes. Qual é a chance de ela parar em "+r.cs[i]+"?",cert,distintas([frs(t-c,t),frs(1,t),frs(c,t+1),frs(c+1,t)].filter(function(x){var p=x.split("/");return val(+p[0],+p[1])!==val(c,t)}),cert,2),{t:"roleta",parts:r.parts})}
  else{var e=pick(DADO46.filter(function(x){return x[1]>0}));cert=frs(e[1],6);it=choice("Ao lançar um dado comum, qual é a chance de "+e[0]+"?",cert,distintas(["1/6","2/6","3/6","4/6","5/6"].filter(function(x){var p=x.split("/");return val(+p[0],+p[1])!==val(e[1],6)}),cert,2),null);r={parts:[e[0]]}}
  it.key="pb46|"+k+"|"+it.pre+"|"+JSON.stringify((it.extra&&it.extra.fig)||"");it.limits=[["n46:t"+k,2]];it._info={k:k,n:r&&r.parts&&r.parts.length};
  return it;
}
/* Nível 47 — Tabelas e gráficos de colunas e de linhas (EF05MA24). */
var TEMAS47=[{t:"Chuva na semana (mm)",u:"mm de chuva",ymax:40,ystep:10,min:5,max:40,d:["Seg","Ter","Qua","Qui","Sex"]},{t:"Visitantes do museu por dia",u:"visitantes",ymax:100,ystep:20,min:20,max:100,d:["Seg","Ter","Qua","Qui","Sex"]},
  {t:"Temperatura ao longo do dia (°C)",u:"°C",ymax:40,ystep:10,min:10,max:40,d:["6 h","9 h","12 h","15 h","18 h"]},{t:"Livros vendidos por mês",u:"livros",ymax:60,ystep:10,min:10,max:60,d:["Jan","Fev","Mar","Abr","Mai"]}];
function valores47(tm){var v=[],t=0;while(v.length<5&&t++<300){var x=tm.ystep*rnd(Math.ceil(tm.min/tm.ystep),Math.floor(tm.max/tm.ystep));if(v.indexOf(x)<0||v.length>=tm.max/tm.ystep-1)v.push(x)}while(v.length<5)v.push(tm.ystep*rnd(1,tm.max/tm.ystep));return v}
function gGraf5(){
  var tm=pick(TEMAS47),k=pick([1,2,3,4]),it,v=valores47(tm),i,j;
  if(k===1){var tb={t:"bars",title:tm.t,labels:tm.d,values:v,step:tm.ystep};i=rnd(0,4);it=typed("No gráfico de colunas, qual é o valor de "+tm.d[i]+"?",v[i],tb,tm.u===tm.u?"":"")}
  else{var ln={t:"linhas",title:tm.t,labels:tm.d,values:v,ymax:tm.ymax,ystep:tm.ystep};
    if(k===2){i=rnd(0,4);it=typed("No gráfico de linhas, qual é o valor de "+tm.d[i]+"?",v[i],ln)}
    else if(k===3){var mx=Math.max.apply(null,v),tt=0;while(v.filter(function(x){return x===mx}).length>1&&tt++<200){v=valores47(tm);mx=Math.max.apply(null,v)}
      ln.values=v;var im=v.indexOf(mx);it=choice("Em qual momento o valor foi o maior?",tm.d[im],tm.d.filter(function(x,z){return z!==im}).slice(0,2),ln)}
    else{i=rnd(0,3);j=i+1;if(v[i]===v[j])v[j]+=tm.ystep>0&&v[j]+tm.ystep<=tm.ymax?tm.ystep:-tm.ystep;ln.values=v;
      it=typed("De "+tm.d[i]+" para "+tm.d[j]+", quanto o valor "+(v[j]>v[i]?"aumentou":"diminuiu")+"?",Math.abs(v[j]-v[i]),ln)}}
  it.key="gr47|"+k+"|"+it.pre+"|"+JSON.stringify(it.extra.fig.values)+tm.t;it.limits=[["n47:t"+k,2]];it._info={k:k,v:v,i:i,j:j};
  return it;
}

/* ===================== Tipos e nota de dificuldade (rodízio e rampa, ver plano.js e bncc/TIPOS-E-DIFICULDADE-5ANO.md) ===================== */
/* tipos: os tipos de conta do nível; tipo(it): o número do tipo da conta (0, 1, ...); nota(it): quanto maior, mais difícil (relativa ao nível); ordem: dos tipos do mais fácil ao mais difícil. */
function nums(it){return (String(it.pre)+" "+String(it.post||"")).replace(/ /g,"").match(/\d+/g)||[]}
function maxN(it){return Math.max.apply(null,nums(it).map(Number).concat([0]))}
function kk(it){return it._info.k-1}
function cpLen(a,b){a=String(a);b=String(b);var c=0;while(c<a.length&&a[c]===b[c])c++;return c}
function dec3(c,d){return d>=8?2:0}
var ESPEC={
 1:{tipos:["extenso → algarismos","algarismos → extenso","valor do algarismo","algarismo da casa","pistas","formar com cartões","quanto falta","saltos"],tipo:kk,
    nota:function(it){if(kk(it)>=4)return FC.abertura.nota(it);var n=it._info.n,z=(String(n).match(/0/g)||[]).length,r=n%1000;return 2*z+((kk(it)<=1&&r&&!(r<100||r%100===0))?1:0)+[0,1,1,0][kk(it)]}},
 2:{tipos:["maior","menor","sinal","número vizinho","lista em ordem"],tipo:kk,
    nota:function(it){var k=kk(it),v=it._info.v.slice().sort(function(x,y){return x-y}),cp=Math.max(cpLen(v[0],v[1]),cpLen(v[1],v[2])),n=nums(it);
      if(k===2)return cpLen(n[0],n[1])+(n[0]===n[1]?2:0);
      if(k===3){var ref=n[n.length-1];return /000$/.test(ref)||/999$/.test(ref)?4:1}
      return cp+(k===4?2:0)}},
 3:{tipos:["dezena","centena","unidade de milhar","dezena de milhar"],tipo:function(it){return {10:0,100:1,1000:2,10000:3}[it._info.k]},
    nota:function(it){var i=it._info,r=i.n%i.k,t={10:0,100:2,1000:4,10000:6}[i.k];return t+(i.a>i.n?1:0)+(r>=i.k/2&&r<i.k/2+i.k/10?1:0)}},
 4:{tipos:["5 algarismos","6 algarismos"],tipo:function(it){return it._info.seis?1:0},nota:function(it){var i=it._info;return vaiUm(i.a,i.b)*2+nz(i.a)+nz(i.b)+(i.a+i.b>99999?1:0)+(i.seis?1:0)}},
 5:{tipos:["sem zero","com zero"],tipo:function(it){return it._info.z?1:0},nota:function(it){var i=it._info;return empresta(i.a,i.b)*2+nz(i.a)+nz(i.b)}},
 6:{tipos:["juntar","acrescentar","separar","retirar","comparar","completar"],tipo:function(it){return ["juntar","acrescentar","separar","retirar","comparar","completar"].indexOf(it._info.tipo)},
    nota:function(it){var i=it._info,r={juntar:0,acrescentar:0,separar:1,retirar:1,comparar:2,completar:2}[i.tipo];return 2*r+dg(Math.max(i.a,i.b))+(i.tipo==="juntar"||i.tipo==="acrescentar"?vaiUm(i.a,i.b):empresta(i.a,i.b))}},
 7:{tipos:["por 10","por 100","por 1 000","por múltiplos de 10 e 100"],tipo:kk,
    nota:function(it){var i=it._info;return i.k===4?6+dg(i.n)/2:[0,2,4][i.k-1]+(i.f===3?2:0)+nz(i.n)}},
 8:{tipos:["direta","decomposição guiada"],tipo:function(it){return it._info.guiada?1:0},
    nota:function(it){var i=it._info,t=Math.floor(i.b/10),u=i.b%10;return i.guiada?1+reagrupa(i.a,i.u):2+reagrupa(i.a,u)+reagrupa(i.a,t)+nz(i.a)}},
 9:{tipos:["direta","estimativa"],tipo:function(it){return it._info.est?1:0},
    nota:function(it){var i=it._info,t=Math.floor(i.b/10),u=i.b%10;return i.est?2+(i.a%1000>400&&i.a%1000<600?1:0):2+reagrupa(i.a,u)+reagrupa(i.a,t)+nz(i.a)}},
 10:{tipos:["caixas","fileiras","área","por hora"],tipo:kk,nota:function(it){var i=it._info;return [0,0,2,1][kk(it)]*2+dg(i.a*i.b)}},
 11:{tipos:["árvore, 2 coleções","contar sem figura","fator que falta","árvore, 3 coleções"],tipo:kk,nota:function(it){return [1,0,2,3][kk(it)]*2+it._info.tot/6}},
 12:{tipos:["quociente exato","quociente com zero","quociente com resto","resto"],tipo:kk,nota:function(it){var i=it._info;return i.d/2+[0,2,2,3][kk(it)]+(i.k>=3?(i.r>i.d/2?1:0):0)}},
 13:{tipos:["quociente de 2 algarismos","quociente de 3 algarismos","com a pista da multiplicação"],tipo:kk,nota:function(it){var i=it._info;return i.d/3+[2,4,0][kk(it)]}},
 14:{tipos:["quociente","resto","dividendo (verificação)"],tipo:kk,nota:function(it){var i=it._info;return i.d/4+[1,0,3][kk(it)]+(i.r>i.d/2?1:0)}},
 15:{tipos:["repartir","caixas completas","o que sobra","viagens"],tipo:kk,nota:function(it){var i=it._info;return kk(it)*2+i.d/8+dg(i.n)/2}},
 16:{tipos:["soma depois de multiplicar","subtração depois de multiplicar","divisão depois da soma","estimativa"],tipo:kk,nota:function(it){return [1,2,3,0][kk(it)]*2+dg(maxN(it))}},
 17:{tipos:["somar nos dois lados","subtrair nos dois lados","multiplicar os dois lados","dividir os dois lados","equilíbrio"],tipo:kk,nota:function(it){return [0,1,2,3,2][kk(it)]*2+dg(maxN(it))}},
 18:{tipos:["somar","subtrair","multiplicar","dividir"],tipo:kk,nota:function(it){var i=it._info;return kk(it)*2+(i.sent?0:1)+dg(i.x)}},
 19:{tipos:["preço de mais unidades","quantas unidades","receita: ampliar","receita: reduzir"],tipo:kk,nota:function(it){return kk(it)*2+dg(maxN(it))}},
 20:{tipos:["mapa: distância real","mapa: distância no papel","ampliar ou reduzir","tabela de proporção"],tipo:kk,nota:function(it){var i=it._info;return [0,1,1,2][kk(it)]*2+(i.e>=20?1:0)+i.n/6}},
 21:{tipos:["parte menor","parte maior","maior de duas partes","razão (fração)"],tipo:kk,nota:function(it){var i=it._info;return [0,1,1,2][kk(it)]*2+(i.r===3?2:0)+dg(i.tot)}},
 22:{tipos:["fração pintada","partes pintadas","escolher a figura","fração não pintada"],tipo:kk,nota:function(it){var i=it._info;return [0,0,1,2][kk(it)]*2+(i.d>=8?2:0)+(i.n>i.d/2?1:0)}},
 23:{tipos:["fração das figuras","inteiros e resto","misto → fração (escolha)","misto → fração (digitar)"],tipo:kk,nota:function(it){var i=it._info;return [0,1,2,3][kk(it)]*2+(i.d>=6?2:0)+i.q}},
 24:{tipos:["divisão → fração","fração → divisão","fração igual a inteiro"],tipo:kk,nota:function(it){var i=it._info;return [1,0,2][kk(it)]*2+(i.a>i.b?1:0)+i.b/4}},
 25:{tipos:["ponto entre 0 e 1","ponto além do 1","escolher a reta","quantas partes"],tipo:kk,nota:function(it){var i=it._info;return [0,3,1,0][kk(it)]*2+i.d/3}},
 26:{tipos:["escolher a fração","numerador que falta","denominador que falta","escolher a figura"],tipo:kk,nota:function(it){var i=it._info;return [1,0,1,2][kk(it)]*2+i.m}},
 27:{tipos:["mesmo denominador","mesmo numerador","com equivalentes","ordenar três"],tipo:kk,nota:function(it){var i=it._info;return kk(it)*2+((i.d||0)>=8?1:0)}},
 28:{tipos:["quadro de 100","valor do algarismo","decomposição","como se lê"],tipo:kk,nota:function(it){var i=it._info;return [0,1,1,2][kk(it)]*2+(kk(it)>0?(i.d||0):0)}},
 29:{tipos:["decimal entre 0 e 1","decimal entre inteiros","centésimos na reta","escolher a reta"],tipo:kk,nota:function(it){return [0,1,3,2][kk(it)]*2+(it._info.j%5===0?0:1)}},
 30:{tipos:["qual é maior","ordenar três","fração ↔ decimal","sinal"],tipo:kk,nota:function(it){var n=nums(it);return [0,2,1,3][kk(it)]*2+(n.length?Math.min(3,n.join("").length/6):0)}},
 31:{tipos:["soma de décimos","subtração de décimos","soma de centésimos","subtração de centésimos"],tipo:kk,nota:function(it){var i=it._info;return kk(it)*2+dg(Math.max(i.A,i.B))/2}},
 32:{tipos:["dinheiro: soma","dinheiro: troco","medidas: soma","dinheiro: diferença"],tipo:kk,nota:function(it){return [1,0,2,2][kk(it)]*2+dg(maxN(it))/2}},
 33:{tipos:["por 10, 100 e 1 000","decimal × natural","natural × decimal","problema de preço"],tipo:kk,nota:function(it){var i=it._info;return kk(it)*2+(i.m>=6?1:0)+dg(i.A)/2}},
 34:{tipos:["decimal ÷ natural","natural ÷ natural","÷ 10, 100 e 1 000","problema"],tipo:kk,nota:function(it){var i=it._info;return [2,3,0,3][kk(it)]*2+(i.d||0)/3}},
 35:{tipos:["10%","50%","25%","75%","associar"],tipo:kk,nota:function(it){var i=it._info;return [0,1,2,3,1][kk(it)]*2+dg(i.n||0)}},
 36:{tipos:["valor do desconto","preço com desconto","preço com acréscimo","comparar ofertas"],tipo:kk,nota:function(it){var i=it._info;return [0,1,1,3][kk(it)]*2+(i.pc===25?1:0)+dg(i.pr)}},
 37:{tipos:["coordenadas do ponto","qual ponto","célula da planilha","distância entre pontos"],tipo:kk,nota:function(it){return [0,1,2,2][kk(it)]*2+(it._info.x>5?1:0)}},
 38:{tipos:["um movimento","passos de A até B","giros","dois movimentos"],tipo:kk,nota:function(it){var i=it._info;return [1,0,1,3][kk(it)]*2+((i.dx||0)+(i.dy||0))/3}},
 39:{tipos:["nome pela planificação","contar faces, arestas e vértices","círculos da planificação","nome pela descrição"],tipo:kk,nota:function(it){return [1,2,0,2][kk(it)]*2+(kk(it)===1?(it._info.p[2]>=5?2:0)+(it._info.p[1]===1?1:0):0)}},
 40:{tipos:["quantos lados","nome pelo número de lados","ângulos retos","nome pela descrição"],tipo:kk,nota:function(it){var n=it._info.nome;return [0,1,1,2][kk(it)]*2+(LADOS40[n]>=5?2:0)}},
 41:{tipos:["quantas vezes ampliou","quantas vezes reduziu","os ângulos","escolher a ampliação"],tipo:kk,nota:function(it){var i=it._info;return [0,1,0,2][kk(it)]*2+(i.s>2?2:0)+i.A.length/3}},
 42:{tipos:["comprimento","massa","capacidade","problema com conversão"],tipo:kk,nota:function(it){var i=it._info;return [0,0,0,3][kk(it)]*2+(i.baixo===false?1:0)+(String(i.v||"").indexOf(".")>=0?1:0)}},
 43:{tipos:["duração em minutos","horas e minutos","temperatura","semanas e dias"],tipo:kk,nota:function(it){return [2,0,1,0][kk(it)]*2+dg(maxN(it))/2}},
 44:{tipos:["área","perímetro","maior área","mesmo perímetro"],tipo:kk,nota:function(it){var i=it._info;return [0,1,1,3][kk(it)]*2+(i.area||0)/4}},
 45:{tipos:["volume do bloco","camadas","maior volume","medidas do bloco"],tipo:kk,nota:function(it){var i=it._info;return [0,1,2,1][kk(it)]*2+(i.a*i.b*i.c)/12}},
 46:{tipos:["resultados possíveis","mesma chance?","fração da roleta","fração do dado"],tipo:kk,nota:function(it){return [0,1,3,2][kk(it)]*2+(it._info.n||0)/4}},
 47:{tipos:["colunas","linhas","maior valor","diferença"],tipo:kk,nota:function(it){return [0,1,1,3][kk(it)]*2+(it._info.v?Math.max.apply(null,it._info.v)/40:0)}}
};
/* Ordem dos tipos do mais fácil ao mais difícil (média da nota de cada tipo, medida em 4 000 contas por nível). O rodízio reserva o 1º da lista à folha 1, o 2º à folha 2 e assim por diante: fixa de propósito, para que as 5 folhas do dia, montadas em momentos diferentes, sempre cubram todos os tipos. */
var ORDEM={"1":[3,0,1,2,5,4,7,6],"2":[1,0,3,2,4],"3":[0,1,2,3],"4":[0,1],"5":[0,1],"6":[1,0,2,3,4,5],"7":[0,1,2,3],"8":[1,0],"9":[1,0],"10":[1,0,3,2],"11":[0,1,3,2],"12":[0,1,2,3],"13":[2,0,1],"14":[1,0,2],"15":[0,1,2,3],"16":[3,0,1,2],"17":[0,1,2,4,3],"18":[0,1,2,3],"19":[0,1,2,3],"20":[0,1,2,3],"21":[0,1,2,3],"22":[1,0,2,3],"23":[0,1,2,3],"24":[1,0,2],"25":[3,0,2,1],"26":[1,2,0,3],"27":[0,1,2,3],"28":[0,1,2,3],"29":[0,1,3,2],"30":[0,2,1,3],"31":[0,1,2,3],"32":[1,0,2,3],"33":[0,1,2,3],"34":[2,0,1,3],"35":[0,4,1,2,3],"36":[0,1,2,3],"37":[0,1,3,2],"38":[2,1,0,3],"39":[2,0,3,1],"40":[0,2,1,3],"41":[2,0,1,3],"42":[1,2,0,3],"43":[3,1,2,0],"44":[0,2,1,3],"45":[0,1,2,3],"46":[0,1,3,2],"47":[0,1,2,3]};
Object.keys(ORDEM).forEach(function(n){ESPEC[n].ordem=ORDEM[n]});

/* ===================== A GRADE ===================== */
FC.G5=[
  {nivel:1,id:"g5n01",nome:"Nível 1 — Números até 999 999: ler, escrever e desafios",hab:["EF05MA01"],meta:130,gen:gLer,ano:5},
  {nivel:2,id:"g5n02",nome:"Nível 2 — Comparar e ordenar números até 999 999",hab:["EF05MA01"],meta:120,gen:gOrdem,ano:5},
  {nivel:3,id:"g5n03",nome:"Nível 3 — Arredondar e estimar",hab:["EF05MA01","EF05MA07"],meta:120,gen:gArredonda,ano:5},
  {nivel:4,id:"g5n04",nome:"Nível 4 — Somas até 999 999",hab:["EF05MA07"],meta:140,gen:gSoma6,ano:5},
  {nivel:5,id:"g5n05",nome:"Nível 5 — Subtrações até 999 999",hab:["EF05MA07"],meta:150,gen:gSub6,ano:5},
  {nivel:6,id:"g5n06",nome:"Nível 6 — Problemas de adição e subtração",hab:["EF05MA07"],meta:170,gen:gProb6,ano:5},
  {nivel:7,id:"g5n07",nome:"Nível 7 — Multiplicar por 10, 100, 1 000 e por múltiplos",hab:["EF05MA08"],meta:110,gen:gPor10,ano:5},
  {nivel:8,id:"g5n08",nome:"Nível 8 — Multiplicar 3 algarismos por 2 algarismos",hab:["EF05MA08"],meta:170,gen:gMul32,ano:5},
  {nivel:9,id:"g5n09",nome:"Nível 9 — Multiplicar 4 algarismos por 2 algarismos",hab:["EF05MA08"],meta:180,gen:gMul42,ano:5},
  {nivel:10,id:"g5n10",nome:"Nível 10 — Problemas de multiplicação",hab:["EF05MA08"],meta:170,gen:gProbMul,ano:5},
  {nivel:11,id:"g5n11",nome:"Nível 11 — Combinações possíveis: árvore e tabela",hab:["EF05MA09"],meta:130,gen:gCombina,ano:5},
  {nivel:12,id:"g5n12",nome:"Nível 12 — Divisão com dividendo de até 5 algarismos",hab:["EF05MA08"],meta:170,gen:gDiv5,ano:5},
  {nivel:13,id:"g5n13",nome:"Nível 13 — Divisão por dois algarismos, exata",hab:["EF05MA08"],meta:170,gen:gDiv2Exata,ano:5},
  {nivel:14,id:"g5n14",nome:"Nível 14 — Divisão por dois algarismos, com resto",hab:["EF05MA08"],meta:180,gen:gDiv2Resto,ano:5},
  {nivel:15,id:"g5n15",nome:"Nível 15 — Problemas de divisão",hab:["EF05MA08"],meta:170,gen:gProbDiv,ano:5},
  {nivel:16,id:"g5n16",nome:"Nível 16 — Problemas com as quatro operações",hab:["EF05MA07","EF05MA08"],meta:180,gen:gProb4op,ano:5},
  {nivel:17,id:"g5n17",nome:"Nível 17 — Igualdades: operar nos dois lados",hab:["EF05MA10"],meta:120,gen:gIgual,ano:5},
  {nivel:18,id:"g5n18",nome:"Nível 18 — O número desconhecido em problemas",hab:["EF05MA11"],meta:130,gen:gEnunciado,ano:5},
  {nivel:19,id:"g5n19",nome:"Nível 19 — Proporcionalidade: preço e receita",hab:["EF05MA12"],meta:150,gen:gProporcao,ano:5},
  {nivel:20,id:"g5n20",nome:"Nível 20 — Proporcionalidade: escala e ampliação",hab:["EF05MA12"],meta:150,gen:gEscala,ano:5},
  {nivel:21,id:"g5n21",nome:"Nível 21 — Partilha em duas partes desiguais",hab:["EF05MA13"],meta:150,gen:gPartilha,ano:5},
  {nivel:22,id:"g5n22",nome:"Nível 22 — Frações com qualquer numerador",hab:["EF05MA03"],meta:120,gen:gFrac,ano:5},
  {nivel:23,id:"g5n23",nome:"Nível 23 — Frações maiores que o inteiro e números mistos",hab:["EF05MA03"],meta:140,gen:gMista,ano:5},
  {nivel:24,id:"g5n24",nome:"Nível 24 — A fração como divisão",hab:["EF05MA03"],meta:130,gen:gFrDiv,ano:5},
  {nivel:25,id:"g5n25",nome:"Nível 25 — Frações na reta numérica",hab:["EF05MA03","EF05MA05"],meta:130,gen:gFrReta,ano:5},
  {nivel:26,id:"g5n26",nome:"Nível 26 — Frações equivalentes",hab:["EF05MA04"],meta:130,gen:gEquiv,ano:5},
  {nivel:27,id:"g5n27",nome:"Nível 27 — Comparar e ordenar frações",hab:["EF05MA05"],meta:130,gen:gCompFr,ano:5},
  {nivel:28,id:"g5n28",nome:"Nível 28 — Decimais: ler, escrever e decompor",hab:["EF05MA02"],meta:130,gen:gDecim,ano:5},
  {nivel:29,id:"g5n29",nome:"Nível 29 — Decimais na reta numérica",hab:["EF05MA02","EF05MA05"],meta:130,gen:gRetaDec,ano:5},
  {nivel:30,id:"g5n30",nome:"Nível 30 — Comparar e ordenar decimais",hab:["EF05MA05"],meta:130,gen:gCompDec,ano:5},
  {nivel:31,id:"g5n31",nome:"Nível 31 — Somar e subtrair decimais",hab:["EF05MA07"],meta:150,gen:gSomaDec,ano:5},
  {nivel:32,id:"g5n32",nome:"Nível 32 — Problemas com decimais: dinheiro e medidas",hab:["EF05MA07"],meta:160,gen:gProbDec,ano:5},
  {nivel:33,id:"g5n33",nome:"Nível 33 — Multiplicar decimal por número natural",hab:["EF05MA08"],meta:150,gen:gMulDec,ano:5},
  {nivel:34,id:"g5n34",nome:"Nível 34 — Dividir decimal por número natural",hab:["EF05MA08"],meta:160,gen:gDivDec,ano:5},
  {nivel:35,id:"g5n35",nome:"Nível 35 — Porcentagem: 10%, 25%, 50%, 75% e 100%",hab:["EF05MA06"],meta:130,gen:gPorc,ano:5},
  {nivel:36,id:"g5n36",nome:"Nível 36 — Porcentagem no dinheiro: desconto e acréscimo",hab:["EF05MA06","EF05MA07"],meta:150,gen:gPorcDin,ano:5},
  {nivel:37,id:"g5n37",nome:"Nível 37 — Plano cartesiano: localizar pontos",hab:["EF05MA14","EF05MA15"],meta:130,gen:gCart,ano:5},
  {nivel:38,id:"g5n38",nome:"Nível 38 — Plano cartesiano: movimentos e giros",hab:["EF05MA15"],meta:140,gen:gMov,ano:5},
  {nivel:39,id:"g5n39",nome:"Nível 39 — Sólidos: planificações e atributos",hab:["EF05MA16"],meta:130,gen:gSolidos,ano:5},
  {nivel:40,id:"g5n40",nome:"Nível 40 — Polígonos: lados, vértices e ângulos",hab:["EF05MA17"],meta:120,gen:gPoligono,ano:5},
  {nivel:41,id:"g5n41",nome:"Nível 41 — Ampliação e redução na malha",hab:["EF05MA18"],meta:130,gen:gAmplia,ano:5},
  {nivel:42,id:"g5n42",nome:"Nível 42 — Conversões de unidades em problemas",hab:["EF05MA19"],meta:150,gen:gConv5,ano:5},
  {nivel:43,id:"g5n43",nome:"Nível 43 — Tempo e temperatura em problemas",hab:["EF05MA19"],meta:140,gen:gTempoTemp,ano:5},
  {nivel:44,id:"g5n44",nome:"Nível 44 — Perímetro e área na malha",hab:["EF05MA20"],meta:140,gen:gAreaPerim,ano:5},
  {nivel:45,id:"g5n45",nome:"Nível 45 — Volume: contar cubinhos",hab:["EF05MA21"],meta:130,gen:gVolume,ano:5},
  {nivel:46,id:"g5n46",nome:"Nível 46 — Espaço amostral e probabilidade",hab:["EF05MA22","EF05MA23"],meta:140,gen:gProbab,ano:5},
  {nivel:47,id:"g5n47",nome:"Nível 47 — Tabelas e gráficos de colunas e de linhas",hab:["EF05MA24"],meta:140,gen:gGraf5,ano:5}
];
FC.G5BY={};FC.G5.forEach(function(e){FC.G5BY[e.id]=e});
/* ===================== O 5º ano na grade do app: FC.LEVELS (os níveis seguem os 164 dos quatro primeiros anos; o aluno vê a numeração corrida, de 165 a 211) ===================== */
var BASE5=FC.LEVELS.length;                          /* 164 */
var BLOCOS5=[[3,"Números até 999 999"],[6,"Adição e subtração até 999 999"],[11,"Multiplicação por dois algarismos"],[16,"Divisão por dois algarismos"],[21,"Álgebra e proporção"],[27,"Frações maiores e menores que 1"],[36,"Decimais e porcentagem"],[41,"Plano cartesiano, sólidos e polígonos"],[45,"Unidades, tempo, área e volume"],[47,"Probabilidade e gráficos de linhas"]];
var DICAS5={1:"Números até 999 999: leia e escreva, diga o valor dos algarismos, ache o número pelas pistas, forme números com cartões, veja quanto falta e complete as sequências.",2:"Compare números de seis algarismos: comece pela maior ordem, a das centenas de milhar.",3:"Arredonde olhando o algarismo da direita: 5 ou mais sobe, menos de 5 fica.",
  4:"Somas com \"vai um\" em várias ordens. Faça no papel se precisar.",5:"Subtrações com \"empresta\" e zeros. Faça no papel se precisar.",6:"Leia o problema, escolha somar ou subtrair e confira se o resultado é razoável.",
  7:"Multiplicar por 10, 100 ou 1 000 é acrescentar zeros. 300 × 40: faça 3 × 4 = 12 e acrescente os três zeros.",8:"234 × 25 = 234 × 20 + 234 × 5. Multiplique pela dezena e pela unidade e some.",9:"Com milhares, vá devagar: 1 258 × 14 = 1 258 × 10 + 1 258 × 4. O papel ajuda.",
  10:"Grupos iguais, fileiras, área de retângulo e velocidade: tudo é multiplicação.",11:"3 camisas e 2 bermudas dão 3 × 2 = 6 combinações. Na árvore, conte as pontas.",12:"Divida o dezena de milhar, o milhar, a centena, a dezena e a unidade, uma de cada vez.",
  13:"96 ÷ 12: pense em 12 × 8 = 96. A multiplicação ajuda a dividir.",14:"O resto é o que sobra e é sempre menor que o divisor. Para conferir: divisor × quociente + resto = dividendo.",15:"Repartir, quantas caixas completas, o que sobra e quantas viagens: leia com atenção.",
  16:"Problemas com mais de uma operação: faça uma de cada vez e confira com uma estimativa.",17:"Se somar (ou tirar, multiplicar, dividir) o mesmo número dos dois lados, a igualdade continua verdadeira.",18:"Desfaça a operação: se somou 15 e deu 40, tire 15 de 40.",
  19:"Descubra quanto vale 1 unidade e depois multiplique. Na receita, tudo cresce ou diminui junto.",20:"Na escala, 1 cm no mapa vale sempre a mesma distância real: multiplique ou divida.",21:"Se uma parte é o dobro da outra, o todo tem 3 partes iguais. Divida o total por 3.",
  22:"O número de baixo diz em quantas partes iguais o inteiro foi dividido; o de cima, quantas partes foram pintadas.",23:"7/4 é maior que 1: 4/4 formam 1 inteiro, e sobram 3/4. Então 7/4 = 1 inteiro e 3/4.",24:"3 ÷ 4 = 3/4: dividir 3 inteiros em 4 partes iguais dá 3/4 para cada um.",
  25:"Entre dois números inteiros a reta foi dividida em partes iguais. Conte as partes de cada inteiro.",26:"Frações equivalentes representam a mesma parte: multiplique o de cima e o de baixo pelo mesmo número.",27:"Mesmo denominador: o maior numerador é maior. Mesmo numerador: o menor denominador é maior.",
  28:"1 décimo é 0,1; 1 centésimo é 0,01; 1 milésimo é 0,001. O quadro de 100 ajuda a ver.",29:"Entre dois inteiros a reta tem 10 partes: cada marca é 1 décimo (0,1).",30:"Compare da esquerda para a direita: primeiro a parte inteira, depois os décimos, os centésimos…",
  31:"Alinhe as vírgulas e some ou subtraia como nos números inteiros. Complete com zero se precisar.",32:"Reais e centavos, metros e centímetros: some, subtraia e escreva o resultado com vírgula.",33:"Multiplique como se não houvesse vírgula e coloque a vírgula depois, com o mesmo número de casas.",
  34:"Divida como se não houvesse vírgula. Dividindo por 10, 100 ou 1 000, a vírgula anda para a esquerda.",35:"10% é a décima parte, 25% é a quarta parte, 50% é a metade e 75% são três quartos.",36:"Calcule quanto é o desconto (ou o acréscimo) e depois tire (ou some) do preço.",
  37:"No par (3, 5), o primeiro número diz a posição no eixo horizontal e o segundo, no vertical.",38:"Para a direita e para cima os números aumentam; para a esquerda e para baixo, diminuem. Um quarto de volta é um ângulo reto.",39:"Prisma tem duas bases iguais; pirâmide tem uma base e faces laterais triangulares; cilindro e cone têm círculos.",
  40:"Polígono tem lados retos e fechados. O número de lados é o mesmo número de vértices e de ângulos.",41:"Ampliar ou reduzir muda o tamanho dos lados, mas os ângulos continuam iguais.",42:"1 km = 1 000 m; 1 m = 100 cm; 1 cm = 10 mm; 1 kg = 1 000 g; 1 L = 1 000 mL.",
  43:"1 hora tem 60 minutos; 1 semana tem 7 dias. Na temperatura, calcule o quanto subiu ou desceu.",44:"Área é quantos quadradinhos cobrem a figura; perímetro é a soma dos lados. Figuras com o mesmo perímetro podem ter áreas diferentes.",45:"Volume é quantos cubinhos cabem no bloco: multiplique comprimento × largura × altura.",
  46:"A chance de um resultado é uma fração: partes que servem sobre o total de partes iguais.",47:"Leia o título, os eixos e os valores. No gráfico de linhas, olhe a altura de cada ponto."};
var INTROS5={11:"Lembrete: na árvore, cada ramo se divide em todas as opções do nível seguinte. O número de combinações é o número de pontas.",
  22:"Lembrete: o número de baixo (denominador) diz em quantas partes iguais o inteiro foi dividido, e o de cima (numerador), quantas partes foram pintadas.",
  28:"Lembrete: o decimal usa vírgula (2,5). Digite a vírgula no teclado. 1 décimo = 0,1; 1 centésimo = 0,01; 1 milésimo = 0,001.",
  35:"Lembrete: 10% é a décima parte, 25% é a quarta parte, 50% é a metade, 75% são três quartos e 100% é o inteiro.",
  37:"Lembrete: no plano, o primeiro número do par diz o quanto andar para a direita e o segundo, o quanto andar para cima, a partir do zero.",
  45:"Lembrete: o cubinho de aresta 1 cm tem volume de 1 cm³. Volume é quantos cubinhos formam o bloco."};
FC.G5.forEach(function(e){
  var grupo=BLOCOS5.filter(function(b){return e.nivel<=b[0]})[0][1];
  var l={group:grupo,id:String(BASE5+e.nivel),name:e.nome.replace(/^Nível \d+ — /,""),hint:DICAS5[e.nivel],target:e.meta,gen:e.gen,ano:5,hab:e.hab};
  if(INTROS5[e.nivel])l.intro=INTROS5[e.nivel];
  l.espec=ESPEC[e.nivel];
  FC.LEVELS.push(l);
});
})();
