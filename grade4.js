/* Grade do 4º ano — geradores escritos do zero a partir de bncc/GRADE-4ANO.md (46 níveis).
   Mesma forma dos geradores dos anos anteriores: {pre, post, a, extra?}, com limits/key/_info só para o app e os testes.
   Decisões: contas com tamanho limitado (multiplicação até 3 algarismos × 1 e 2 × 2; divisão com dividendo de até 4 algarismos), degraus pequenos nos blocos de contas,
   frações só unitárias, divisão por dois algarismos sempre exata e temperaturas de 0 a 45 °C. A resposta digitada é sempre um número inteiro (até 99 999). */
(function(){
"use strict";
var FC=window.FC,X=FC.exh,rnd=X.rnd,pick=X.pick,choice=X.choice,typed=X.typed,fmt=X.milh,NAMES=X.NAMES;
var MENOS="−",VEZES="×",DIV="÷";

function emb(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(0,i),t=a[i];a[i]=a[j];a[j]=t}return a}
function ate(fn,max){for(var t=0;t<(max||6000);t++){var r=fn();if(r)return r}return null}
function ds(n){return String(n).split("").map(Number)}                       /* algarismos, da esquerda para a direita */
function pj(nivel,a,b){return "p"+nivel+":"+Math.min(a,b)+","+Math.max(a,b)}   /* parcelas trocadas = mesma conta na folha */
function conta(a,op,b){return fmt(a)+" "+op+" "+fmt(b)+" ="}
function qs(f){return f?"Quantas ":"Quantos "}
function ele(n){return n[1]==="f"?"Ela":"Ele"}
function vaiUm(a,b){var x=ds(a).reverse(),y=ds(b).reverse(),car=0,n=0,i,k=Math.max(x.length,y.length);for(i=0;i<k;i++){var s=(x[i]||0)+(y[i]||0)+car;if(s>=10){n++;car=1}else car=0}return n}
function empresta(a,b){var x=ds(a).reverse(),y=ds(b).reverse(),bor=0,n=0,i;for(i=0;i<x.length;i++){var v=x[i]-bor-(y[i]||0);if(v<0){n++;bor=1}else bor=0}return n}
function temZero(n){return /0/.test(String(n))&&n>=100}

/* Número por extenso (1 a 99 999), pelas mesmas regras do 3º ano: "mil" nunca "um mil"; "e" quando o resto é uma centena inteira ou menor que 100, vírgula nos outros casos. */
var UN=["zero","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove"];
var DZ=["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];
var CT=["","cento","duzentos","trezentos","quatrocentos","quinhentos","seiscentos","setecentos","oitocentos","novecentos"];
function ate999(n){
  var c=Math.floor(n/100),r=n%100,p=[];
  if(c)p.push(n===100?"cem":CT[c]);
  if(r)p.push(r<20?UN[r]:DZ[Math.floor(r/10)]+(r%10?" e "+UN[r%10]:""));
  return p.join(" e ");
}
function extenso(n){
  var m=Math.floor(n/1000),r=n%1000,milhar=m===0?"":(m===1?"mil":ate999(m)+" mil");
  if(!m)return ate999(r);
  if(r===0)return milhar;
  return milhar+((r<100||r%100===0)?" e ":", ")+ate999(r);
}
FC.extenso4=extenso;

/* ===================== NÚMEROS ATÉ 99 999 ===================== */
/* Nível 1 — Ler e escrever números até 99 999 (EF04MA01). */
function num5(zero){
  var d=[rnd(1,9),rnd(1,9),rnd(1,9),rnd(1,9),rnd(1,9)];
  if(zero){var z=pick([[1],[2],[3],[4],[1,2],[1,3],[2,3],[2,4],[3,4],[1,2,3]]);z.forEach(function(i){d[i]=0})}
  return +d.join("");
}
function parecidos(n){
  var d=ds(n),out=[],i,v,x;
  for(i=0;i<4;i++)if(d[i]!==d[i+1]){x=d.slice();var t=x[i];x[i]=x[i+1];x[i+1]=t;if(x[0]>0)out.push(+x.join(""))}
  for(i=0;i<5;i++)for(v=0;v<=9;v++)if(v!==d[i]&&!(i===0&&v===0)){x=d.slice();x[i]=v;out.push(+x.join(""))}
  return out.filter(function(q,k){return q!==n&&out.indexOf(q)===k});
}
function gLer(){
  var n=num5(Math.random()<.3),it;
  if(Math.random()<.5){
    it=typed("Escreva em algarismos: "+extenso(n)+".",n);it.limits=[["n1:t1",4]];it._info={tipo:"algarismos",n:n};
  }else{
    var wr=emb(parecidos(n)),outros=[],ext=[extenso(n)];
    wr.forEach(function(q){if(outros.length<2&&ext.indexOf(extenso(q))<0){outros.push(q);ext.push(extenso(q))}});
    it=choice("Como se lê o número "+fmt(n)+"?",extenso(n),outros.map(extenso),null);it.limits=[["n1:t2",4]];it._info={tipo:"extenso",n:n};
  }
  return it;
}

/* Nível 2 — Valor posicional e decomposição com potências de dez (EF04MA02). */
var POT=["10\u202F000","1\u202F000","100","10","1"];
function gDecompor(){
  var k=pick([1,1,2,3,4]),d,n,it,t;
  if(k===1){                                            /* o algarismo que falta num dos termos */
    d=ds(num5(Math.random()<.25));n=+d.join("");var i=pick([0,1,2,3,4].filter(function(x){return d[x]>0}));
    it=typed(fmt(n)+" = "+d.map(function(v,j){return (j===i?"__":v)+" "+VEZES+" "+POT[j]}).join(" + ")+". Qual número vai no lugar do __?",d[i]);it.limits=[["n2:t1",3]];
  }else if(k===2){                                      /* valor do algarismo, que aparece uma só vez */
    t=0;do{d=ds(num5(Math.random()<.2))}while(new Set(d.filter(function(x){return x>0})).size!==d.filter(function(x){return x>0}).length&&t++<500);
    n=+d.join("");var j=pick([0,1,2,3,4].filter(function(x){return d[x]>0}));
    it=typed("No número "+fmt(n)+", quanto vale o algarismo "+d[j]+"?",d[j]*Math.pow(10,4-j));it.limits=[["n2:t2",2]];
  }else if(k===3){                                      /* o algarismo de uma casa */
    d=ds(num5(false));n=+d.join("");var q=pick([0,1,2,3]);
    it=typed("Que algarismo está na casa "+["das dezenas de milhar","das unidades de milhar","das centenas","das dezenas"][q]+" de "+fmt(n)+"?",d[q]);it.limits=[["n2:t3",2]];
  }else{                                                /* montar o número */
    d=ds(num5(Math.random()<.3));n=+d.join("");
    it=typed("Qual é o número "+d.map(function(v,j){return v+" "+VEZES+" "+POT[j]}).join(" + ")+"?",n);it.limits=[["n2:t4",2]];
  }
  it.key="d2|"+k+"|"+it.pre;it._info={tipo:k};
  return it;
}

/* Nível 3 — Comparar e ordenar números até 99 999 (EF04MA01). */
function parecidosOrdem(){
  var base=rnd(10,99)*1000,tipo=pick([0,1,2]),out=[],t=0;
  while(out.length<3&&t++<200){
    var v=tipo===0?base+rnd(100,999):tipo===1?base+100*rnd(1,9)+rnd(1,99):rnd(11,98)*1000+rnd(0,999);
    if(v<10000||v>99999||out.indexOf(v)>=0)continue;out.push(v);
  }
  while(out.length<3)out.push(rnd(10000,99999));
  return out;
}
function gOrdem(){
  var r=Math.random(),it,v=parecidosOrdem(),ord=v.slice().sort(function(x,y){return x-y}).join(",");
  if(r<.35){var mx=Math.max.apply(null,v);it=choice("Qual é o maior número?",fmt(mx),v.filter(function(x){return x!==mx}).map(fmt),null);it.key="o3|mx|"+ord;it.limits=[["n3:t1",3]]}
  else if(r<.6){var mn=Math.min.apply(null,v);it=choice("Qual é o menor número?",fmt(mn),v.filter(function(x){return x!==mn}).map(fmt),null);it.key="o3|mn|"+ord;it.limits=[["n3:t2",2]]}
  else if(r<.85){
    var a=v[0],b=Math.random()<.15?v[0]:v[1],s=a<b?"<":a>b?">":"=";
    it=choice("Qual sinal completa? "+fmt(a)+" ◻ "+fmt(b),s,["<",">","="].filter(function(x){return x!==s}),null);it.key="s3|"+a+"|"+b;it.limits=[["n3:t3",2]];
  }else{
    var depois=Math.random()<.5,ref=Math.random()<.4?rnd(11,98)*1000:rnd(10001,99998);
    it=typed("Que número vem logo "+(depois?"depois":"antes")+" de "+fmt(ref)+"?",depois?ref+1:ref-1);it.key="v3|"+depois+"|"+ref;it.limits=[["n3:t4",2]];
  }
  it._info={};
  return it;
}

/* Nível 4 — Arredondar para a dezena, a centena e o milhar mais próximos (EF04MA03). */
function gArredonda(){
  var k=pick([10,100,1000]),n,t=0,nome={10:"dezena",100:"centena",1000:"milhar"}[k];
  do{n=rnd(10101,94989)}while((n%k===0)&&t++<200);
  var a=Math.floor(n/k)*k;if(n-a>=k/2)a+=k;
  var it=typed("Arredonde "+fmt(n)+" para a "+nome+" mais próxima.",a);it.limits=[["n4:"+k,3]];it._info={n:n,k:k,a:a};
  return it;
}

/* ===================== ADIÇÃO E SUBTRAÇÃO ===================== */
function somaIt(a,b,l,info){var it=typed(conta(a,"+",b),a+b);it.key="+|"+Math.min(a,b)+"|"+Math.max(a,b);it.limits=l;it._info=info||{};it._info.op="+";it._info.a=a;it._info.b=b;return it}
function subIt(a,b,l,info){var it=typed(conta(a,MENOS,b),a-b);it.key="-|"+a+"|"+b;it.limits=l;it._info=info||{};it._info.op="-";it._info.a=a;it._info.b=b;return it}
/* Nível 5 — Somas de quatro algarismos, com reagrupamento em pelo menos duas ordens. */
function gSoma5(){var p=ate(function(){var a=rnd(1000,8999),b=rnd(1000,9999-0);return vaiUm(a,b)>=2&&a+b<=19999?[a,b]:null})||[3478,2685];return somaIt(p[0],p[1],[["n5:"+p[0]%10,2]],{})}
/* Nível 6 — Subtrações de quatro algarismos, com empréstimo e zeros. */
function gSub6(){
  var z=Math.random()<.4,p=ate(function(){var a=rnd(2000,9999),b=rnd(1000,a-1);if(empresta(a,b)<2)return null;if(z&&!(temZero(a)||temZero(b)))return null;return [a,b]})||[5002,2347];
  return subIt(p[0],p[1],[["n6:"+(z?"z":"s"),3]],{z:z});
}
/* Nível 7 — Somas e subtrações até 99 999. */
function gMisto7(){
  var soma=Math.random()<.5,it;
  if(soma){var p=ate(function(){var a=rnd(10000,89999),b=rnd(1000,99999-a);return b>=1000&&vaiUm(a,b)>=2?[a,b]:null})||[34678,25786];it=somaIt(p[0],p[1],[["n7:s",4]],{})}
  else{var q=ate(function(){var a=rnd(12000,99999),b=rnd(1000,a-1000);return empresta(a,b)>=2&&b>=1000?[a,b]:null})||[50203,21547];it=subIt(q[0],q[1],[["n7:d",4]],{})}
  return it;
}
/* Nível 8 — Estimar: qual resultado é razoável? Arredondar as parcelas para a centena ou o milhar mais próximo. */
function gEstima(){
  var soma=Math.random()<.6,k=pick([100,1000]),a,b,t=0;
  do{a=rnd(1200,9800);b=rnd(1200,9800);if(!soma&&a<b){var x=a;a=b;b=x}}while(((!soma&&a-b<2*k)||Math.abs(a%k-k/2)<k/10||Math.abs(b%k-k/2)<k/10)&&t++<400);
  var ra=Math.round(a/k)*k,rb=Math.round(b/k)*k,est=soma?ra+rb:ra-rb,exato=soma?a+b:a-b;
  var wr=[est+k,est-k,est+2*k,est*10===0?est+3*k:Math.round(est/10)].filter(function(x){return x>0&&x!==est});
  var it=choice("É mais ou menos quanto? "+fmt(a)+" "+(soma?"+":MENOS)+" "+fmt(b),fmt(est),emb(wr).slice(0,2).map(fmt),null);
  it.pre="Sem fazer a conta exata, "+fmt(a)+" "+(soma?"+":MENOS)+" "+fmt(b)+" dá mais ou menos quanto? (arredonde para a "+(k===100?"centena":"unidade de milhar")+" mais próxima)";
  it.key="e8|"+soma+"|"+a+"|"+b+"|"+k;it.limits=[["n8:"+(soma?"s":"d"),4]];it._info={a:a,b:b,k:k,est:est,exato:exato,soma:soma};
  return it;
}
/* Nível 9 — Problemas de adição e subtração (até 99 999), com estimativa antes: o enunciado já pede o resultado exato. */
var OJ9=[["ingresso","ingressos",0],["página","páginas",1],["tijolo","tijolos",0],["moeda","moedas",1],["figurinha","figurinhas",1],["pessoa","pessoas",1]];
var OS9=[["carro","carros",0],["aluno","alunos",0],["passageiro","passageiros",0],["torcedor","torcedores",0]];
function gProb9(){
  var tipo=pick(["juntar","acrescentar","separar","retirar","comparar","completar"]),soma=tipo==="juntar"||tipo==="acrescentar",pre,o,resp,n1=pick(NAMES),n2,l=[["n9:"+tipo,2]];
  var par=ate(function(){var a=rnd(1200,89999),b=rnd(1200,89999);if(soma){return a+b<=99999?[a,b]:null}return a>b+1000?[a,b]:null})||[21400,13250],a=par[0],b=par[1];
  if(tipo==="juntar"){o=pick(OJ9);do{n2=pick(NAMES)}while(n2[0]===n1[0]);pre=n1[0]+" tem "+fmt(a)+" "+o[1]+" e "+n2[0]+" tem "+fmt(b)+". "+qs(o[2])+o[1]+" os dois têm juntos?";resp=a+b;l.push(["nome:"+n1[0],1],["nome:"+n2[0],1])}
  else if(tipo==="acrescentar"){o=pick(OJ9);pre="Havia "+fmt(a)+" "+o[1]+". Chegaram mais "+fmt(b)+". "+qs(o[2])+o[1]+" há agora?";resp=a+b}
  else if(tipo==="separar"){o=pick(OJ9);pre=n1[0]+" tinha "+fmt(a)+" "+o[1]+" e deu "+fmt(b)+". "+qs(o[2])+o[1]+" sobraram?";resp=a-b;l.push(["nome:"+n1[0],1])}
  else if(tipo==="retirar"){o=pick(OS9);pre="Havia "+fmt(a)+" "+o[1]+" no estádio. Foram embora "+fmt(b)+". "+qs(o[2])+o[1]+" ficaram?";resp=a-b}
  else if(tipo==="comparar"){o=pick(OJ9);do{n2=pick(NAMES)}while(n2[0]===n1[0]);pre=n1[0]+" tem "+fmt(a)+" "+o[1]+" e "+n2[0]+" tem "+fmt(b)+". "+qs(o[2])+o[1]+" "+n1[0]+" tem a mais do que "+n2[0]+"?";resp=a-b;l.push(["nome:"+n1[0],1],["nome:"+n2[0],1])}
  else{o=pick(OJ9);pre=n1[0]+" quer juntar "+fmt(a)+" "+o[1]+" e já tem "+fmt(b)+". "+qs(o[2])+o[1]+" faltam?";resp=a-b;l.push(["nome:"+n1[0],1])}
  var it=typed(pre,resp);it.key=tipo+"|"+a+"|"+b+"|"+pre;it.limits=l;it._info={tipo:tipo,a:a,b:b};
  return it;
}
/* Nível 10 — Operações inversas: tirar a prova (EF04MA04, EF04MA13). */
function gInversa(){
  var k=rnd(1,3),it,a,b,s;
  if(k===1){a=rnd(1200,8900);b=rnd(1200,8900);s=a+b;it=typed(fmt(a)+" + "+fmt(b)+" = "+fmt(s)+", então "+fmt(s)+" "+MENOS+" "+fmt(b)+" =",a);it.key="i10|1|"+a+"|"+b}
  else if(k===2){a=rnd(5000,9900);b=rnd(1200,a-1200);s=a-b;it=typed(fmt(a)+" "+MENOS+" "+fmt(b)+" = "+fmt(s)+", então "+fmt(s)+" + "+fmt(b)+" =",a);it.key="i10|2|"+a+"|"+b}
  else{a=rnd(1200,8900);b=rnd(1200,8900);s=a+b;it=typed("",a,null,"+ "+fmt(b)+" = "+fmt(s));it.key="i10|3|"+a+"|"+b}
  it.limits=[["n10:t"+k,3]];it._info={tipo:k,a:a,b:b};
  return it;
}

/* ===================== MULTIPLICAÇÃO ===================== */
function mulIt(a,b,l,info){var it=typed(conta(a,VEZES,b),a*b);it.key="x|"+Math.min(a,b)+"|"+Math.max(a,b);it.limits=l;it._info=info||{};it._info.op="x";it._info.a=a;it._info.b=b;return it}
function reagrupa(a,b){var x=ds(a).reverse(),car=0,n=0,i;for(i=0;i<x.length;i++){var v=x[i]*b+car;car=Math.floor(v/10);if(car>0)n++}return n}   /* ordens em que "vai" para a seguinte */
/* Nível 11 — Propriedades da multiplicação (EF04MA05): comutativa, associativa e distributiva. */
function gProp(){
  var k=pick([1,1,1,2,3,3,4,4]),it,a,b,c;
  if(k===1){a=rnd(3,9);b=pick([12,13,14,15,16,17,18,21,22,24,25]);var d=b>20?20:10;it=typed(a+" "+VEZES+" "+b+" = "+a+" "+VEZES+" "+d+" + "+a+" "+VEZES+" __. Qual número vai no lugar do __?",b-d);it.key="p11|1|"+a+"|"+b;it.limits=[["n11:t1",3]]}
  else if(k===2){a=pick([12,15,20,25,30,35]);b=rnd(3,9);it=typed(a+" "+VEZES+" "+b+" = __ "+VEZES+" "+a+". Qual número vai no lugar do __?",b);it.key="p11|2|"+a+"|"+b;it.limits=[["n11:t2",1]]}
  else if(k===3){a=pick([2,4,5]);b=pick([5,10,25].filter(function(x){return x!==a}));c=rnd(3,9);
    it=typed("("+a+" "+VEZES+" "+b+") "+VEZES+" "+c+" = "+a+" "+VEZES+" ("+b+" "+VEZES+" __). Qual número vai no lugar do __?",c);it.key="p11|3|"+a+"|"+b+"|"+c;it.limits=[["n11:t3",2]]}
  else{a=rnd(3,9);b=pick([12,13,14,15,16,17,18,19]);it=typed(a+" "+VEZES+" "+b+" = "+a+" "+VEZES+" 10 + "+a+" "+VEZES+" "+(b-10)+" = "+(a*10)+" + "+(a*(b-10))+" = __",a*b);it.key="p11|4|"+a+"|"+b;it.limits=[["n11:t4",2]]}
  it._info={tipo:k};
  return it;
}
/* Nível 12 — Multiplicar por 10, 100 e 1000 (EF04MA06). O resultado nunca passa de 99 999. */
function gPor10(){
  var k=pick([10,100,1000]),n=k===10?rnd(11,9999):k===100?rnd(11,999):rnd(2,99),f=rnd(1,3),it;
  if(f===1)it=typed(fmt(n)+" "+VEZES+" "+fmt(k)+" =",n*k);
  else if(f===2)it=typed(fmt(k)+" "+VEZES+" "+fmt(n)+" =",n*k);
  else it=typed("__ "+VEZES+" "+fmt(k)+" = "+fmt(n*k)+". Qual número vai no lugar do __?",n);
  it.key="m12|"+f+"|"+k+"|"+n;it.limits=[["n12:"+k,3]];it._info={n:n,k:k,f:f};
  return it;
}
/* Nível 13 — Multiplicar dezenas e centenas inteiras (30 × 40, 200 × 5). */
function gInteiras(){
  var k=rnd(1,3),a,b,it;
  if(k===1){a=10*rnd(2,9);b=10*rnd(2,9)}else if(k===2){a=100*rnd(2,9);b=rnd(2,9)}else{a=10*rnd(2,9);b=100*rnd(2,9)}
  it=Math.random()<.5?typed(fmt(a)+" "+VEZES+" "+fmt(b)+" =",a*b):typed(fmt(b)+" "+VEZES+" "+fmt(a)+" =",a*b);
  it.key="i13|"+Math.min(a,b)+"|"+Math.max(a,b);it.limits=[["n13:"+k,3]];it._info={a:a,b:b};
  return it;
}
/* Níveis 14 a 17 — multiplicar por um algarismo: sem reagrupar (14), 2 algarismos (15), 3 algarismos (16), 4 algarismos (17). */
function gPor1sem(){
  var b=rnd(2,4),m=Math.floor(9/b),dg=rnd(2,3),d=[],i;
  for(i=0;i<dg;i++)d.push(rnd(1,m));
  var a=+d.join("");return mulIt(a,b,[["n14:"+b,3]],{a:a,b:b});
}
function gPor1(dig,nivel,bmax){
  return function(){
    var padrao=dig===2?[47,6]:dig===3?[234,4]:[1285,4];
    var p=ate(function(){
      var lo=Math.pow(10,dig-1),a=rnd(lo,lo*10-1),b=rnd(2,bmax);
      if(dig===4&&a>2999)return null;
      return reagrupa(a,b)>=(dig===2?1:2)?[a,b]:null;
    })||padrao;
    return mulIt(p[0],p[1],[["n"+nivel+":"+p[1],3]],{a:p[0],b:p[1]});
  };
}
/* Níveis 18 e 19 — multiplicar por dois algarismos (12 × 15 por decomposição; depois 32 × 21). */
function gPor2(nivel){
  return function(){
    var a=nivel===18?rnd(11,19):rnd(12,49),b=nivel===18?rnd(11,19):rnd(11,29),it;
    if(nivel===18&&Math.random()<.4){var q=b-b%10,r=b%10;it=typed(a+" "+VEZES+" "+b+" = "+a+" "+VEZES+" "+q+" + "+a+" "+VEZES+" "+r+" = "+(a*q)+" + "+(a*r)+" = __",a*b);it.key="x|"+Math.min(a,b)+"|"+Math.max(a,b);it.limits=[["n18:d",2]];it._info={a:a,b:b}}
    else it=mulIt(a,b,[["n"+nivel+":"+b%10,3]],{a:a,b:b});
    return it;
  };
}
/* Nível 20 — Problemas de multiplicação: grupos, fileiras e proporção (EF04MA06). */
var COISAS20=[["caixa","caixas","lápis"],["pacote","pacotes","biscoitos"],["estante","estantes","livros"],["saco","sacos","laranjas"],["vaso","vasos","flores"],["prateleira","prateleiras","latas"]];
function gProbMult20(){
  var k=pick([1,1,2,3]),it,n1=pick(NAMES);
  if(k===1){var c=pick(COISAS20),a=rnd(6,25),b=rnd(3,15);it=typed("Em cada "+c[0]+" cabem "+a+" "+c[2]+". Quantos(as) "+c[2]+" cabem em "+b+" "+c[1]+"?",a*b);it.pre="Em cada "+c[0]+" cabem "+a+" "+c[2]+". Quantos "+c[2]+" cabem em "+b+" "+c[1]+"?";it.key="k20|1|"+c[0]+"|"+a+"|"+b;it.limits=[["n20:1",3],["c20:"+c[0],1]]}
  else if(k===2){var pa=rnd(2,6),pc=rnd(3,15);it=typed(pa+" cadernos custam "+(pa*pc)+" reais. Quanto custam "+(pa*2)+" cadernos iguais a esses?",pa*pc*2);it.key="k20|2|"+pa+"|"+pc;it.limits=[["n20:2",2]]}
  else{var f=rnd(4,9),cc=rnd(5,12);it=typed("Num auditório há "+f+" fileiras com "+cc+" cadeiras cada uma. "+n1[0]+" contou todas as cadeiras. Quantas são?",f*cc);it.key="k20|3|"+f+"|"+cc;it.limits=[["n20:3",2],["nome:"+n1[0],1]]}
  it._info={tipo:k};
  return it;
}
/* Nível 21 — Combinações possíveis (EF04MA08). */
var COMB=[["camisas","bermudas","conjuntos diferentes ela pode montar"],["sabores de sorvete","coberturas","sorvetes diferentes podem ser pedidos"],["pratos principais","sobremesas","refeições diferentes podem ser escolhidas"],["blusas","saias","roupas diferentes ela pode usar"]];
function gCombina(){
  var c=pick(COMB),a=rnd(2,6),b=rnd(2,6),k=pick([1,1,2]),it,n=pick(NAMES);
  if(k===1)it=typed(n[0]+" tem "+a+" "+c[0]+" e "+b+" "+c[1]+". Quantos "+c[2]+"?",a*b);
  else it=typed("Com "+a+" "+c[0]+" e algumas "+c[1]+" dá para fazer "+(a*b)+" combinações. Quantas são as "+c[1]+"?",b);
  it.key="c21|"+k+"|"+c[0]+"|"+a+"|"+b;it.limits=[["n21:"+k,3],["c21:"+c[0],2]];it._info={a:a,b:b,k:k};
  return it;
}

/* ===================== DIVISÃO ===================== */
var DIVS=[2,3,4,5,6,7,8,9];
function divIt(n,d,q,l,info){var it=typed(fmt(n)+" "+DIV+" "+d+" =",q);it.key="d|"+n+"|"+d;it.limits=l;it._info=info||{};it._info.n=n;it._info.d=d;it._info.q=q;return it}
/* Nível 22 — Divisão por um algarismo, sem resto (dividendo de 3 algarismos; quociente às vezes com zero). */
function gDiv22(){
  var d=pick(DIVS),zero=Math.random()<.35,lo=Math.ceil(100/d),hi=Math.floor(999/d);
  var q=ate(function(){var x=rnd(lo,hi);return (String(x).indexOf("0")>0)===zero?x:null},400)||rnd(lo,hi);
  return divIt(d*q,d,q,[["n22:"+d,2]],{});
}
/* Nível 23 — Divisão com resto (dividendo de 3 algarismos): quociente, resto e verificação. */
function gDiv23(){
  var k=pick([1,1,2,2,3]),d=pick(DIVS),q=rnd(Math.ceil(100/d),Math.floor(990/d)),r=rnd(1,d-1),n=d*q+r,it;
  if(k===1)it=typed(fmt(n)+" "+DIV+" "+d+": qual é o quociente?",q);
  else if(k===2)it=typed(fmt(n)+" "+DIV+" "+d+": qual é o resto?",r);
  else it=typed(fmt(n)+" "+DIV+" "+d+" dá "+q+" e sobram "+r+". Quanto vale "+d+" "+VEZES+" "+q+" + "+r+"?",n);
  it.key="d23|"+k+"|"+n+"|"+d;it.limits=[["n23:"+k,3]];it._info={n:n,d:d,q:q,r:r,k:k};
  return it;
}
/* Nível 24 — Divisão de números de 4 algarismos por 2, 3, 4 ou 5 (exata ou com resto). */
function gDiv24(){
  var k=pick([1,1,2,3]),d=pick([2,3,4,5]),q=rnd(Math.ceil(1000/d),Math.floor(9990/d)),r=k===1?0:rnd(1,d-1),n=d*q+r,it;
  if(k===1)it=typed(fmt(n)+" "+DIV+" "+d+" =",q);
  else if(k===2)it=typed(fmt(n)+" "+DIV+" "+d+": qual é o quociente?",q);
  else it=typed(fmt(n)+" "+DIV+" "+d+": qual é o resto?",r);
  it.key="d24|"+k+"|"+n+"|"+d;it.limits=[["n24:"+k,3]];it._info={n:n,d:d,q:q,r:r,k:k};
  return it;
}
/* Nível 25 — Divisão por dois algarismos, sempre exata (divisor de 10 a 30, quociente de 2 a 30). */
function gDiv25(){
  var d=rnd(10,30),q=rnd(2,Math.min(30,Math.floor(900/d))),n=d*q,it;
  if(Math.random()<.35)it=typed(d+" "+VEZES+" "+q+" = "+fmt(n)+", então "+fmt(n)+" "+DIV+" "+d+" =",q);
  else it=divIt(n,d,q,[],{});
  it.key="d25|"+n+"|"+d;it.limits=[["n25:d"+d,1]];it._info={n:n,d:d,q:q};
  return it;
}
/* Nível 26 — Problemas de divisão: repartir, ver quantas caixas, o que sobra e quantas viagens. */
function gProbDiv26(){
  var k=pick([1,2,3,4]),it,n1=pick(NAMES),o=pick([["figurinha","figurinhas",1],["bala","balas",1],["moeda","moedas",1],["livro","livros",0],["ingresso","ingressos",0]]);
  var d,q,r;
  if(k===1){d=rnd(3,9);q=rnd(12,99);it=typed(n1[0]+" repartiu "+fmt(d*q)+" "+o[1]+" igualmente entre "+d+" amigos. "+qs(o[2])+o[1]+" cada amigo recebeu?",q);it.limits=[["n26:1",2],["nome:"+n1[0],1]]}
  else if(k===2){d=rnd(10,30);q=rnd(3,25);it=typed("Cada caixa leva "+d+" "+o[1]+". Quantas caixas cheias dá para formar com "+fmt(d*q)+" "+o[1]+"?",q);it.limits=[["n26:2",2]]}
  else if(k===3){d=rnd(3,9);q=rnd(12,60);r=rnd(1,d-1);it=typed("Há "+(d*q+r)+" "+o[1]+" para dividir em grupos de "+d+". "+qs(o[2])+o[1]+" sobram?",r);it.limits=[["n26:3",2]]}
  else{d=rnd(3,9);q=rnd(12,60);r=rnd(1,d-1);it=typed("Uma van leva "+d+" pessoas por viagem. Para levar "+(d*q+r)+" pessoas, quantas viagens são necessárias?",q+1);it.limits=[["n26:4",2]]}
  it.key="p26|"+k+"|"+it.pre;it._info={k:k};
  return it;
}
/* Nível 27 — Múltiplos e restos (EF04MA11, EF04MA12). */
function gMultiplos(){
  var k=pick([1,1,1,2,2,3,3,3,4,4]),it,m,t;
  if(k===1){m=rnd(3,9);var cert=m*rnd(4,15),outros=[];t=0;while(outros.length<2&&t++<200){var x=rnd(20,150);if(x%m!==0&&outros.indexOf(x)<0)outros.push(x)}
    it=choice("Qual destes números é múltiplo de "+m+"?",cert,outros,null);it.key="mu27|1|"+m+"|"+cert;it.limits=[["n27:t1",3]]}
  else if(k===2){m=rnd(3,12);var s=rnd(1,4),seq=[0,1,2,3].map(function(i){return m*(s+i)}),h=rnd(1,3);
    it=typed("Os números formam uma sequência de múltiplos de "+m+": "+seq.map(function(v,i){return i===h?"__":v}).join(", ")+". Qual número falta?",seq[h]);it.key="mu27|2|"+m+"|"+s+"|"+h;it.limits=[["n27:t2",2]]}
  else if(k===3){m=rnd(3,9);var n=m*rnd(3,12)+rnd(1,m-1);it=typed("Qual é o resto da divisão de "+n+" por "+m+"?",n%m);it.key="mu27|3|"+n+"|"+m;it.limits=[["n27:t3",3]]}
  else{m=rnd(3,9);var r=rnd(1,m-1),b=m*rnd(1,4)+r;it=typed("Os números "+b+", "+(b+m)+" e "+(b+2*m)+" dão o mesmo resto quando divididos por "+m+". Qual é esse resto?",r);it.key="mu27|4|"+m+"|"+b;it.limits=[["n27:t4",2]]}
  it._info={k:k};
  return it;
}

/* ===================== ÁLGEBRA ===================== */
/* Nível 28 — Igualdades: somar ou tirar o mesmo número dos dois lados (EF04MA14). */
function gIgual28(){
  var k=pick([1,1,2,2,3]),it,a=rnd(12,98),b=rnd(12,98),s=a+b,c;
  if(k===1){c=rnd(3,30);it=typed(a+" + "+b+" = "+s+", então "+a+" + "+b+" + "+c+" = "+s+" + __. Qual número vai no lugar do __?",c)}
  else if(k===2){c=rnd(3,Math.min(30,a+b-1));it=typed(a+" + "+b+" = "+s+", então "+a+" + "+b+" "+MENOS+" "+c+" = "+s+" "+MENOS+" __. Qual número vai no lugar do __?",c)}
  else{var x=pick([10,20,30,40].filter(function(v){return v<s}));c=s-x;it=typed(a+" + "+b+" = "+c+" + __. Qual número vai no lugar do __?",x)}
  it.key="g28|"+k+"|"+it.pre;it.limits=[["n28:"+k,3]];it._info={k:k};
  return it;
}
/* Nível 29 — O número desconhecido nas quatro operações (EF04MA15). */
function gDesconhecido(){
  var f=pick([1,2,3,4,5]),it,a,b;
  if(f===1){a=rnd(20,400);b=rnd(20,500);it=typed("__ + "+a+" = "+(a+b)+". Qual é o __?",b);it.key="a29|1|"+a+"|"+b}
  else if(f===2){a=rnd(20,400);b=rnd(20,600);it=typed("__ "+MENOS+" "+a+" = "+b+". Qual é o __?",a+b);it.key="a29|2|"+a+"|"+b}
  else if(f===3){a=rnd(3,9);b=rnd(6,15);it=typed(a+" "+VEZES+" __ = "+(a*b)+". Qual é o __?",b);it.key="a29|3|"+a+"|"+b}
  else if(f===4){a=rnd(3,9);b=rnd(6,40);it=typed("__ "+DIV+" "+a+" = "+b+". Qual é o __?",a*b);it.key="a29|4|"+a+"|"+b}
  else{a=rnd(3,9);b=rnd(6,40);it=typed(fmt(a*b)+" "+DIV+" __ = "+b+". Qual é o __?",a);it.key="a29|5|"+a+"|"+b}
  it.limits=[["n29:"+f,2]];it._info={f:f,a:a,b:b};
  return it;
}
/* Nível 30 — Problemas com mais de uma etapa e as quatro operações. */
function gProb30(){
  var k=pick([1,2,3]),n=pick(NAMES),it,a,p,c,v,d;
  if(k===1){a=rnd(40,300);p=rnd(2,6);c=rnd(6,20);it=typed(n[0]+" tinha "+a+" figurinhas e comprou "+p+" pacotes com "+c+" figurinhas cada. Quantas figurinhas "+(n[1]==="f"?"ela":"ele")+" tem agora?",a+p*c);it.limits=[["n30:1",2],["nome:"+n[0],1]]}
  else if(k===2){p=rnd(2,6);c=rnd(8,40);a=p*c+rnd(10,90);it=typed(n[0]+" tinha "+a+" reais e comprou "+p+" cadernos de "+c+" reais cada. Quantos reais sobraram?",a-p*c);it.limits=[["n30:2",2],["nome:"+n[0],1]]}
  else{d=rnd(3,9);c=rnd(10,40);v=rnd(10,200);it=typed("Uma loja tinha "+(d*c+v)+" bombons e vendeu "+v+". O resto foi dividido igualmente em "+d+" caixas. Quantos bombons ficaram em cada caixa?",c);it.limits=[["n30:3",2]]}
  it.key="q30|"+k+"|"+it.pre;it._info={k:k};
  return it;
}

/* ===================== FRAÇÕES E DECIMAIS ===================== */
function fr(d){return "1/"+d}
var DEN=[2,3,4,5,10];
function figFr(d,forma){return {t:"fracao",d:d,n:1,forma:forma||pick(["barra","circulo"])}}
/* Nível 31 — Frações unitárias e partes do inteiro (EF04MA09): 1/2, 1/3, 1/4, 1/5 e 1/10. */
function gFracao(){
  var k=pick([1,1,2,3,4,5]),d=pick(DEN),it,forma=pick(["barra","circulo"]);
  if(k===1){var ws=emb(DEN.filter(function(x){return x!==d})).slice(0,2);it=choice("Que fração do inteiro está pintada?",fr(d),ws.map(fr),figFr(d,forma));it.limits=[["n31:t1",3]]}
  else if(k===2){it=typed("O inteiro foi dividido em quantas partes iguais?",d,figFr(d,forma));it.limits=[["n31:t2",2]]}
  else if(k===3){it=typed("Quantas partes iguais a 1/"+d+" formam o inteiro?",d);it.limits=[["n31:t3",2]]}
  else if(k===4){var ws2=emb(DEN.filter(function(x){return x!==d})).slice(0,2);
    it=choice("Qual figura tem 1/"+d+" do inteiro pintado?",{fig:figFr(d,forma)},ws2.map(function(x){return {fig:figFr(x,forma)}}),null);it.limits=[["n31:t4",2]]}
  else{var p=emb(DEN).slice(0,2),mn=Math.max(p[0],p[1]),mx=Math.min(p[0],p[1]);
    it=choice("Qual é maior: 1/"+p[0]+" ou 1/"+p[1]+"?",fr(mx),[fr(mn)],null);it.key="f31|5|"+mx+"|"+mn;it.limits=[["n31:t5",2]]}
  it._info={k:k,d:d};
  return it;
}
/* Nível 32 — Frações na reta numérica entre 0 e 1. */
function gFrReta(){
  var k=pick([1,1,2,3]),d=pick(DEN),it;
  if(k===1){var ws=emb(DEN.filter(function(x){return x!==d})).slice(0,2);it=choice("Que fração está no ponto A?",fr(d),ws.map(fr),{t:"retafr",d:d,k:1});it.limits=[["n32:t1",3]]}
  else if(k===2){it=typed("A reta de 0 a 1 foi dividida em quantas partes iguais?",d,{t:"retafr",d:d,k:1});it.limits=[["n32:t2",2]]}
  else{var o=emb(DEN.filter(function(x){return x!==d})).slice(0,2);
    it=choice("Em qual reta o ponto A está em 1/"+d+"?",{fig:{t:"retafr",d:d,k:1}},[{fig:{t:"retafr",d:d,k:2}},{fig:{t:"retafr",d:o[0],k:1}}].concat(Math.random()<.5?[{fig:{t:"retafr",d:o[1],k:1}}]:[]),null);it.limits=[["n32:t3",2]]}
  it._info={k:k,d:d};
  return it;
}
function dec(n){            /* n centésimos como decimal: 7 → 0,07; 30 → 0,3; 23 → 0,23 */
  if(n%100===0)return String(n/100);
  var i=Math.floor(n/100),r=n%100,f=r<10?"0"+r:(r%10===0?String(r/10):String(r));
  return i+","+f;
}
/* Nível 33 — Décimos e centésimos no quadro de 100 (EF04MA10). */
function gDecimal(){
  var k=pick([1,1,2,2,3,4]),it,n;
  if(k===1){var q=rnd(1,9);n=10*q;it=typed("O quadro tem 100 quadradinhos. Quantos décimos do quadro estão pintados? (cada fileira inteira é 1 décimo)",q,{t:"quadro100",n:n},"décimos");it.limits=[["n33:t1",3]]}
  else if(k===2){do{n=rnd(1,99)}while(n%10===0);it=typed("Quantos centésimos do quadro estão pintados?",n,{t:"quadro100",n:n},"centésimos");it.limits=[["n33:t2",3]]}
  else if(k===3){n=rnd(1,99);var inv=+(String(n).split("").reverse().join("")),ws=[];
    [dec(inv),dec(n*10),dec(Math.floor(n/10)*10+(n%10))].forEach(function(x){if(x!==dec(n)&&ws.indexOf(x)<0)ws.push(x)});
    if(ws.length<2)ws.push(dec(n)+"0");
    it=choice("Que número decimal representa a parte pintada do quadro?",dec(n),ws.slice(0,2),{t:"quadro100",n:n});it.limits=[["n33:t3",2]]}
  else{var pdz=Math.random()<.5;if(pdz){n=rnd(1,9);it=typed("O decimal 0,"+n+" é o mesmo que quantos décimos?",n,null,"décimos")}else{n=rnd(11,99);if(n%10===0)n++;it=typed("O decimal "+dec(n)+" é o mesmo que quantos centésimos?",n,null,"centésimos")}it.limits=[["n33:t4",2]]}
  it.key="y33|"+k+"|"+it.pre+"|"+n;it._info={k:k,n:n};
  return it;
}
/* Nível 34 — Decimais e dinheiro: reais e centavos (EF04MA10). */
function real(c){return "R$ "+(Math.floor(c/100))+","+(c%100<10?"0":"")+(c%100)}
function gDecDinheiro(){
  var k=pick([1,1,2,2,3,4]),it,c;
  if(k===1){c=100*rnd(1,9)+5*rnd(1,19);if(c%100===0)c+=50;it=typed(real(c)+" são quantos centavos?",c,null,"centavos");it.limits=[["n34:t1",3]]}
  else if(k===2){c=100*rnd(1,9)+5*rnd(1,19);if(c%100===0)c+=25;var ws=[real(c/10<100?c:c),real(c*10),"R$ "+(c/1000).toString().replace(".",",")];
    ws=[real(Math.round(c/10)),real(c*10),"R$ 0,"+c].filter(function(x,i,a){return x!==real(c)&&a.indexOf(x)===i});
    it=choice(c+" centavos são quantos reais?",real(c),ws.slice(0,2),null);it.limits=[["n34:t2",3]]}
  else if(k===3){var r1=rnd(1,9),r2=rnd(1,9),m=pick([25,50,75]),m2=100-m;it=typed("Você tem "+real(100*r1+m)+" e ganhou mais "+real(100*r2+m2)+". Quantos reais você tem agora?",r1+r2+1,null,"reais");it.limits=[["n34:t3",2]]}
  else{var tot=100*rnd(1,5),mo=pick([25,50]);it=typed("Quantas moedas de "+mo+" centavos formam "+real(tot)+"?",tot/mo,null,"moedas");it.limits=[["n34:t4",2]]}
  it.key="r34|"+k+"|"+it.pre;it._info={k:k};
  return it;
}

/* ===================== GEOMETRIA ===================== */
var COLS="ABCDEF";
function casa(c,r){return COLS.charAt(c-1)+r}
/* Nível 35 — Localização e deslocamentos na malha (EF04MA16). */
function gLocal(){
  var C=6,R=5,k=pick([1,2,3,4]),it,s,d;
  if(k===1){var r0=rnd(1,R),c0=rnd(1,C-2),c1=rnd(c0+2,C);s=[c0,r0];d=[c1,r0];it=typed("Andando só para a direita, quantas casas faltam para chegar à ★?",c1-c0,{t:"quadriculado",c:C,r:R,s:s,d:d});it.limits=[["n35:t1",2]]}
  else if(k===2){d=[rnd(1,C),rnd(1,R)];var ok=casa(d[0],d[1]),ws=[casa(d[1]>C?1:d[1],d[0]>R?1:d[0]),casa(d[0],d[1]%R+1),casa(d[0]%C+1,d[1])].filter(function(x,i,a){return x!==ok&&a.indexOf(x)===i});
    it=choice("Em que casa está a ★?",ok,ws.slice(0,2),{t:"quadriculado",c:C,r:R,d:d});it.limits=[["n35:t2",2]]}
  else if(k===3){var dx=rnd(1,3),dy=rnd(1,2);s=[rnd(1,C-dx),rnd(1,R-dy)];var e=[s[0]+dx,s[1]+dy],ok2=casa(e[0],e[1]),ws2=[casa(e[0]-1,e[1]),casa(e[0],e[1]-1),casa(e[0]+(e[0]<C?1:-1),e[1])].filter(function(x,i,a){return x!==ok2&&a.indexOf(x)===i&&!/^.0|^@/.test(x)});
    it=choice("Saindo do ponto azul, ande "+dx+" casa"+(dx>1?"s":"")+" para a direita e "+dy+" para cima. Em que casa você chega?",ok2,ws2.slice(0,2),{t:"quadriculado",c:C,r:R,s:s});it.limits=[["n35:t3",3]]}
  else{var dx2=rnd(1,4),dy2=rnd(1,3);s=[rnd(1,C-dx2),rnd(1,R-dy2)];d=[s[0]+dx2,s[1]+dy2];it=typed("Quantas casas, ao todo, você anda da bolinha azul até a ★, só para a direita e para cima?",dx2+dy2,{t:"quadriculado",c:C,r:R,s:s,d:d});it.limits=[["n35:t4",2]]}
  it.key="l35|"+k+"|"+it.pre+"|"+JSON.stringify(it.extra&&it.extra.fig);it._info={k:k};
  return it;
}
/* Nível 36 — Prismas e pirâmides: faces, arestas e vértices (EF04MA17). */
var BASES=[[3,"triangular"],[4,"quadrada"],[5,"pentagonal"],[6,"hexagonal"]];
function gPrisma(){
  var k=pick([1,1,1,2]),b=pick(BASES),n=b[0],it;
  if(k===1){var prisma=Math.random()<.5,el=pick([0,1,2]),nome=["faces","arestas","vértices"][el],cont=prisma?[n+2,3*n,2*n][el]:[n+1,2*n,n+1][el];
    it=typed("Um"+(prisma?" prisma":"a pirâmide")+" de base "+b[1]+" tem quantas "+nome+"?",cont);it.key="s36|1|"+prisma+"|"+n+"|"+el;it.limits=[["n36:t1",4],["n36:"+(prisma?"p":"q")+n,2]]}
  else{var prisma2=Math.random()<.5,desc=prisma2?"duas bases "+b[1]+"s e as faces laterais retangulares":"uma base "+b[1]+" e as faces laterais triangulares",
      cert=(prisma2?"prisma":"pirâmide")+" de base "+b[1],w1=(prisma2?"pirâmide":"prisma")+" de base "+b[1],o=pick(BASES.filter(function(x){return x[0]!==n})),w2=(prisma2?"prisma":"pirâmide")+" de base "+o[1];
    it=choice("Um sólido tem "+desc+". Qual é o nome dele?",cert,[w1,w2],null);it.pre="Um sólido tem "+desc.replace("bases quadradas","bases quadradas")+". Qual é o nome dele?";it.key="s36|2|"+cert;it.limits=[["n36:t2",2]]}
  it._info={k:k,n:n};
  return it;
}
/* Nível 37 — Ângulos retos, agudos e obtusos (EF04MA18). */
var RETOS=[["um retângulo",4],["um quadrado",4],["um triângulo retângulo",1],["a letra L",1],["uma folha de papel retangular",4],["o canto de uma mesa quadrada",4]];
function gAngulo(){
  var k=pick([1,1,1,2,3]),it;
  if(k===1){var tipo=pick(["reto","agudo","obtuso"]),g=tipo==="reto"?90:tipo==="agudo"?10*rnd(2,8):10*rnd(10,16);
    it=choice("Este ângulo é reto, agudo ou obtuso?",tipo,["reto","agudo","obtuso"].filter(function(x){return x!==tipo}),{t:"angulo",g:g});it.key="n37|1|"+g;it.limits=[["n37:t1",4],["n37:"+tipo,3]]}
  else if(k===2){var gs=[],t=0;while(gs.length<3&&t++<200){var x=10*rnd(2,16);if(x!==90&&gs.every(function(y){return Math.abs(y-x)>=20}))gs.push(x)}
    var mx=Math.max.apply(null,gs);it=choice("Qual ângulo é o maior?",{fig:{t:"angulo",g:mx}},gs.filter(function(x){return x!==mx}).map(function(x){return {fig:{t:"angulo",g:x}}}),null);it.key="n37|2|"+gs.slice().sort().join(",");it.limits=[["n37:t2",2]]}
  else{var r=pick(RETOS);it=typed("Quantos ângulos retos tem "+r[0]+"?",r[1]);it.key="n37|3|"+r[0];it.limits=[["n37:t3",2]]}
  it._info={k:k};
  return it;
}
/* Nível 38 — Simetria de reflexão (EF04MA19). */
function metade(){var c=[],i,j;for(i=0;i<4;i++)for(j=0;j<5;j++)if(Math.random()<.35)c.push([i,j]);return c}
var EIXOS=[["um quadrado",4],["um retângulo que não é quadrado",2],["um triângulo com os três lados iguais",3],["um hexágono regular",6],["um pentágono regular",5],["a letra H",2],["uma estrela de cinco pontas",5]];
function gSimetria(){
  var k=pick([1,1,2,3]),it,cel,t=0;
  if(k===1){do{cel=metade()}while((cel.length<3||cel.length>9)&&t++<200);
    it=typed("A linha tracejada é o eixo de simetria. Quantos quadradinhos faltam pintar do outro lado para a figura ficar simétrica?",cel.length,{t:"espelho",cells:cel});it.limits=[["n38:t1",3]]}
  else if(k===2){do{cel=metade()}while((cel.length<3||cel.length>9)&&t++<200);
    var simetrica=Math.random()<.5,dir=cel.map(function(c){return [3-c[0],c[1]]});
    if(!simetrica){var i=rnd(0,dir.length-1),n2=[dir[i][0],(dir[i][1]+1)%5];if(!dir.some(function(c){return c[0]===n2[0]&&c[1]===n2[1]}))dir[i]=n2;else dir.splice(i,1)}
    var certa=simetrica||false;
    it=choice("A figura é simétrica em relação à linha tracejada?",simetrica?"sim":"não",[simetrica?"não":"sim"],{t:"espelho",cells:cel,right:dir});it.limits=[["n38:t2",2]]}
  else{var e=pick(EIXOS);it=typed("Quantos eixos de simetria tem "+e[0]+"?",e[1]);it.key="n38|3|"+e[0];it.limits=[["n38:t3",2]]}
  if(!it.key)it.key="n38|"+k+"|"+JSON.stringify(it.extra&&it.extra.fig);
  it._info={k:k};
  return it;
}

/* ===================== MEDIDAS ===================== */
/* Nível 39 — Perímetro e comprimento (EF04MA20). */
function ladosDe(n){
  if(n==="triângulo"){var a=rnd(3,15),b=rnd(3,15),c;do{c=rnd(3,15)}while(c>=a+b||a>=b+c||b>=a+c);return [a,b,c]}
  if(n==="quadrado"){var l=rnd(3,20);return [l,l,l,l]}
  if(n==="retângulo"){var x=rnd(3,20),y;do{y=rnd(3,20)}while(y===x);return [x,y,x,y]}
  var s=[];for(var i=0;i<5;i++)s.push(rnd(3,15));return s;
}
var CONV39=[["m","cm",100],["cm","mm",10],["km","m",1000],["m","mm",1000]];
function gPerim(){
  var k=pick([1,1,2,3]),it,n=pick(["triângulo","quadrado","retângulo","pentágono"]),L=ladosDe(n),P=L.reduce(function(a,b){return a+b},0);
  if(k===1){it=typed("Qual é o perímetro da figura, em centímetros?",P,{t:"poligono",n:n,lados:L},"cm");it.limits=[["n39:t1",3],["n39:"+n,2]]}
  else if(k===2){var f=rnd(0,L.length-1);it=typed("O perímetro da figura é "+P+" cm. Quanto mede o lado marcado com ?",L[f],{t:"poligono",n:n,lados:L,falta:f},"cm");it.limits=[["n39:t2",2],["n39:"+n,2]]}
  else{var c=pick(CONV39),v=c[0]==="km"?rnd(2,9):c[0]==="cm"?rnd(2,9)*5:rnd(2,9);it=typed(v+" "+c[0]+" = __ "+c[1]+". Qual número vai no lugar do __?",v*c[2]);it.key="c39|"+v+c[0];it.limits=[["n39:t3",3]]}
  if(!it.key)it.key="p39|"+k+"|"+JSON.stringify(it.extra.fig);
  it._info={k:k};
  return it;
}
/* Nível 40 — Área na malha: contar quadradinhos (EF04MA21). */
function conexa(k,R,C){
  var t=0;
  while(t++<500){
    var c=[[rnd(0,R-1),rnd(0,C-1)]],g=0;
    while(c.length<k&&g++<400){var b=pick(c),d=pick([[1,0],[-1,0],[0,1],[0,-1]]),r=b[0]+d[0],q=b[1]+d[1];if(r>=0&&r<R&&q>=0&&q<C&&!c.some(function(z){return z[0]===r&&z[1]===q}))c.push([r,q])}
    if(c.length===k)return c;
  }
  var base=[];for(var i=0;i<k;i++)base.push([Math.floor(i/C),i%C]);return base;
}
function gArea40(){
  var k=pick([1,1,2,3]),it;
  if(k===1){var n=rnd(6,16),cel=conexa(n,5,7);it=typed("Cada quadradinho vale 1 unidade de área. Qual é a área da figura pintada?",n,{t:"grid",rows:5,cols:7,cells:cel});it.limits=[["n40:t1",3]]}
  else if(k===2){var a=rnd(3,9),b=rnd(3,9);it=typed("Um retângulo tem "+a+" quadradinhos de largura e "+b+" de altura. Quantos quadradinhos cobrem o retângulo todo?",a*b);it.key="a40|2|"+Math.min(a,b)+"|"+Math.max(a,b);it.limits=[["n40:t2",2]]}
  else{var as=[],t=0;while(as.length<3&&t++<500){var x=rnd(4,14);if(as.every(function(y){return Math.abs(y-x)>=2}))as.push(x)}
    var mais=Math.random()<.5,al=mais?Math.max.apply(null,as):Math.min.apply(null,as),shapes=as.map(function(a){return {a:a,c:conexa(a,5,5).map(function(z){return [z[1],z[0]]})}}),cert=shapes.filter(function(s){return s.a===al})[0],cor=pick(["#2457D6","#FFB92B","#1CA97B"]);
    var fg=function(s){return {t:"malha2",shapes:[{cells:s.c,color:cor}]}};
    it=choice("Qual figura tem "+(mais?"a maior":"a menor")+" área?",{fig:fg(cert)},shapes.filter(function(s){return s!==cert}).map(function(s){return {fig:fg(s)}}),null);it.limits=[["n40:t3",2]]}
  if(!it.key)it.key="a40|"+k+"|"+JSON.stringify(it.extra.fig||it.extra.opts);
  it._info={k:k};
  return it;
}
/* Nível 41 — Massa e capacidade: conversões (EF04MA20). */
function gConv41(){
  var k=pick([1,1,2,2,3,4]),it,v;
  if(k===1){v=rnd(2,9);it=typed(v+" kg = __ g. Qual número vai no lugar do __?",v*1000);it.limits=[["n41:t1",3]]}
  else if(k===2){v=rnd(2,9);it=typed(v+" L = __ mL. Qual número vai no lugar do __?",v*1000);it.limits=[["n41:t2",3]]}
  else if(k===3){v=rnd(2,9);var g=Math.random()<.5;it=typed((v*1000)+" "+(g?"g":"mL")+" = __ "+(g?"kg":"L")+". Qual número vai no lugar do __?",v);it.limits=[["n41:t3",2]]}
  else{var q=pick([[1,500,"1 kg e 500 g","g"],[2,500,"2 kg e 500 g","g"],[1,250,"1 L e 250 mL","mL"],[3,750,"3 L e 750 mL","mL"],[2,250,"2 kg e 250 g","g"],[1,750,"1 kg e 750 g","g"]]);
    it=typed(q[2]+" = __ "+q[3]+". Qual número vai no lugar do __?",q[0]*1000+q[1]);it.limits=[["n41:t4",2]]}
  it.key="c41|"+k+"|"+it.pre;it._info={k:k};
  return it;
}
/* Nível 42 — Tempo: horas, minutos e segundos (EF04MA22). */
function hhmm(h,m){return h+":"+(m<10?"0":"")+m}
function min24(t){return hhmm(Math.floor(t/60),t%60)}
function gTempo42(){
  var k=pick([1,1,2,2,3,4]),it,h,m;
  if(k===1){h=rnd(1,12);m=rnd(1,59);var bom=hhmm(h,m),pool=[hhmm(m%12||12,h),hhmm(h,(m+10)%60),hhmm(h%12+1,m),hhmm(h,(m+5)%60===m?m:(m+55)%60)].filter(function(x,i,a){return x!==bom&&a.indexOf(x)===i});
    it=choice("Que horas o relógio marca?",bom,emb(pool).slice(0,2),{t:"clock",h:h,m:m});it.key="t42|1|"+bom;it.limits=[["n42:t1",3]]}
  else if(k===2){var ini=360+5*rnd(0,120),dur=5*rnd(5,30);if(ini+dur>1320)ini-=dur;it=typed("O filme começou às "+min24(ini)+" e terminou às "+min24(ini+dur)+". Quantos minutos durou?",dur);it.key="t42|2|"+ini+"|"+dur;it.limits=[["n42:t2",3]]}
  else if(k===3){var i2=360+5*rnd(0,100),d2=5*rnd(6,30),fim=i2+d2,ws=[15,-15,10,-10,30].map(function(x){return min24(fim+x)}).filter(function(x){return x!==min24(fim)});
    it=choice("A aula começou às "+min24(i2)+" e durou "+(d2>=60?Math.floor(d2/60)+" h ":"")+(d2%60?d2%60+" min":"").trim()+". A que horas terminou?",min24(fim),emb(ws).slice(0,2),null);it.key="t42|3|"+i2+"|"+d2;it.limits=[["n42:t3",2]]}
  else{var f=pick([1,2,3,4]),mm=rnd(2,9);if(f===1)it=typed("Quantos segundos tem "+mm+" minutos?",mm*60);else if(f===2)it=typed((mm*60)+" segundos são quantos minutos?",mm);else if(f===3)it=typed(mm+" horas são quantos minutos?",mm*60);else it=typed((mm*60)+" minutos são quantas horas?",mm);
    it.key="t42|4|"+it.pre;it.limits=[["n42:t4",2]]}
  it._info={k:k};
  return it;
}
/* Nível 43 — Temperatura em graus Celsius, de 0 a 45 (EF04MA23). */
function gTemp(){
  var k=pick([1,1,2,3,4]),it,t;
  if(k===1){t=5*rnd(1,9);it=typed("Que temperatura o termômetro marca?",t,{t:"termo",g:t},"°C");it.key="te43|1|"+t;it.limits=[["n43:t1",4]]}
  else if(k===2){var a=rnd(8,24),b=rnd(a+3,Math.min(a+20,44));it=typed("De manhã fazia "+a+" °C e, à tarde, "+b+" °C. Quantos graus a temperatura subiu?",b-a,null,"graus");it.key="te43|2|"+a+"|"+b;it.limits=[["n43:t2",2]]}
  else if(k===3){var s=Math.random()<.5,x=rnd(10,30),d=rnd(3,9);it=typed("A temperatura estava em "+x+" °C e "+(s?"subiu":"desceu")+" "+d+" graus. Quanto marca agora?",s?x+d:x-d,null,"°C");it.key="te43|3|"+x+"|"+d+"|"+s;it.limits=[["n43:t3",2]]}
  else{var ts=[],z=0;while(ts.length<3&&z++<200){var y=rnd(8,40);if(ts.indexOf(y)<0)ts.push(y)}
    var mx=Math.max.apply(null,ts);it=choice("Em qual cidade fez mais calor? Temperaturas: "+ts.map(function(y,i){return "cidade "+"ABC".charAt(i)+" "+y+" °C"}).join(", ")+".","cidade "+"ABC".charAt(ts.indexOf(mx)),["A","B","C"].filter(function(l,i){return i!==ts.indexOf(mx)}).map(function(l){return "cidade "+l}),null);it.key="te43|4|"+ts.join(",");it.limits=[["n43:t4",2]]}
  it._info={k:k};
  return it;
}
/* Nível 44 — Dinheiro: compra, troco, desconto e parcelas (EF04MA25). */
function gDinheiro44(){
  var k=pick([1,1,2,2,3,4]),it,n=pick(NAMES),p,c;
  if(k===1){p=rnd(12,189);var pag=pick([50,100,200].filter(function(x){return x>p}));it=typed(n[0]+" fez uma compra de "+p+" reais e pagou com uma nota de "+pag+" reais. Quanto "+(n[1]==="f"?"ela":"ele")+" recebeu de troco?",pag-p,null,"reais");it.limits=[["n44:t1",3],["nome:"+n[0],1]]}
  else if(k===2){p=5*rnd(10,50);var ds2=5*rnd(2,Math.floor(p/10));it=typed("Um tênis custava "+p+" reais e está com desconto de "+ds2+" reais. Quanto custa agora?",p-ds2,null,"reais");it.limits=[["n44:t2",3]]}
  else if(k===3){var np=rnd(2,6);c=rnd(12,80);it=typed("Uma bicicleta pode ser paga em "+np+" parcelas de "+c+" reais. Quanto ela custa no total?",np*c,null,"reais");it.limits=[["n44:t3",2]]}
  else{var np2=rnd(3,5),c2=rnd(20,60),av=np2*c2-5*rnd(2,8);it=typed("Um brinquedo custa "+av+" reais à vista ou "+np2+" parcelas de "+c2+" reais. Quantos reais a mais se paga no parcelado?",np2*c2-av,null,"reais");it.limits=[["n44:t4",2]]}
  it.key="d44|"+k+"|"+it.pre;it._info={k:k};
  return it;
}

/* ===================== DADOS E ACASO ===================== */
var COR45=["azul","amarelo","rosa","roxo","vermelho","verde"];
function partesRoleta(mais,n){
  var cs=emb(COR45).slice(0,n),cont,t=0,np=rnd(6,8),ok=false;
  while(!ok&&t++<500){cont=cs.map(function(){return 1});for(var i=n;i<np;i++)cont[rnd(0,n-1)]++;var ex=mais?Math.max.apply(null,cont):Math.min.apply(null,cont);ok=cont.filter(function(x){return x===ex}).length===1}
  if(!ok){cs=emb(COR45).slice(0,3);cont=[4,2,1]}
  var parts=[];cs.forEach(function(c,i){for(var j=0;j<cont[i];j++)parts.push(c)});
  var alvo=mais?Math.max.apply(null,cont):Math.min.apply(null,cont);
  return {cs:cs,parts:emb(parts),cert:cs[cont.indexOf(alvo)]};
}
var FRASES45=[["Ao lançar um dado comum, sair um número maior que 7 é","impossível"],["Ao lançar um dado comum, sair um número maior que 0 é","certo"],["Ao lançar um dado comum, sair o número 4 é","possível"],["Numa caixa só com bolas azuis, tirar uma bola vermelha é","impossível"],["Numa caixa só com bolas azuis, tirar uma bola azul é","certo"],["Ao lançar uma moeda, sair cara é","possível"],["Amanhã o sol nascer em algum horário é","certo"]];
function gChances45(){
  var k=pick([1,1,1,2,2,3]),it;
  if(k===1){var mais=Math.random()<.65,r=partesRoleta(mais,rnd(3,5));it=choice("Em qual cor a seta tem "+(mais?"mais":"menos")+" chance de parar?",r.cert,r.cs.filter(function(c){return c!==r.cert}).slice(0,3),{t:"roleta",parts:r.parts});it.key="ch45|1|"+mais+"|"+r.parts.join(",");it.limits=[["n45:t1",3]]}
  else if(k===2){var f=pick(FRASES45);it=choice(f[0]+"…",f[1],["certo","possível","impossível"].filter(function(x){return x!==f[1]}),null);it.key="ch45|2|"+f[0];it.limits=[["n45:t2",2]]}
  else{var a=rnd(1,3),b=rnd(5,7),ra=[],rb=[],i;for(i=0;i<8;i++){ra.push(i<a+2?"azul":"amarelo");rb.push(i<b-1&&i<b?"azul":"amarelo")}
    var A=emb(ra.slice(0,8)),B=emb(rb.slice(0,8)),na=A.filter(function(c){return c==="azul"}).length,nb=B.filter(function(c){return c==="azul"}).length;
    if(na===nb){B[B.indexOf("amarelo")]="azul"}
    var fa={t:"roleta",parts:A},fb={t:"roleta",parts:B},ca=A.filter(function(c){return c==="azul"}).length,cb=B.filter(function(c){return c==="azul"}).length,bom=ca>cb?fa:fb,ruim=ca>cb?fb:fa;
    it=choice("Em qual roleta a seta tem mais chance de parar no azul?",{fig:bom},[{fig:ruim}],null);it.key="ch45|3|"+A.join(",")+"|"+B.join(",");it.limits=[["n45:t3",2]]}
  it._info={k:k};
  return it;
}
/* Nível 46 — Tabelas e gráficos: ler, comparar e resumir (EF04MA27). */
var TEMAS46=[{t:"Esportes preferidos das turmas",l:["futebol","vôlei","natação","judô","corrida"]},{t:"Frutas preferidas das turmas",l:["maçã","banana","uva","pera","laranja"]},
  {t:"Bichinhos preferidos das turmas",l:["gato","cachorro","peixe","pássaro","coelho"]},{t:"Cores preferidas das turmas",l:["azul","verde","rosa","amarelo","roxo"]}];
function gTabGraf46(){
  var tm=pick(TEMAS46),k=pick([1,1,2,2,3,4]),it;
  if(Math.random()<.6){
    var cols=emb(tm.l).slice(0,4),rows=["Turma A","Turma B","Turma C"],v=rows.map(function(){return cols.map(function(){return rnd(5,60)})}),fig={t:"tabela2",title:tm.t,rows:rows,cols:cols,v:v},ri=rnd(0,2),ci=rnd(0,3);
    if(k===1)it=typed("Quantas crianças da "+rows[ri]+" escolheram "+cols[ci]+"?",v[ri][ci],fig);
    else if(k===2)it=typed("Quantas crianças ao todo escolheram "+cols[ci]+"?",v[0][ci]+v[1][ci]+v[2][ci],fig);
    else if(k===3){var A=v[0][ci],B=v[1][ci];if(A===B){v[1][ci]=B+1;B++}var gd=A>B?0:1;it=typed("Quantas crianças a mais da "+rows[gd]+" do que da "+rows[1-gd]+" escolheram "+cols[ci]+"?",Math.abs(A-B),fig)}
    else{var tot=v[ri].reduce(function(a,b){return a+b},0);it=typed("Quantas crianças tem a "+rows[ri]+" ao todo, somando todas as escolhas?",tot,fig)}
    it.limits=[["n46:t"+k,3]];
  }else{
    var n=rnd(4,5),lab=emb(tm.l).slice(0,n),step=pick([10,20]),vals=lab.map(function(){return step*rnd(1,Math.floor(80/step))}),f={t:"bars",title:tm.t,labels:lab,values:vals,step:step},i2=rnd(0,n-1);
    if(k===1)it=typed("Quantas crianças escolheram "+lab[i2]+"?",vals[i2],f);
    else if(k===2){var a=rnd(0,n-1),b;do{b=rnd(0,n-1)}while(b===a);it=typed("Quantas crianças escolheram "+lab[a]+" e "+lab[b]+" juntas?",vals[a]+vals[b],f)}
    else if(k===3){if(vals.every(function(x){return x===vals[0]}))vals[0]+=step;var a3=rnd(0,n-1),b3,t3=0;do{b3=rnd(0,n-1)}while((b3===a3||vals[b3]===vals[a3])&&t3++<200);if(b3===a3||vals[b3]===vals[a3]){a3=vals.indexOf(Math.max.apply(null,vals));b3=vals.indexOf(Math.min.apply(null,vals))}var g3=vals[a3]>vals[b3]?a3:b3,p3=g3===a3?b3:a3;it=typed("Quantas crianças a mais escolheram "+lab[g3]+" do que "+lab[p3]+"?",vals[g3]-vals[p3],f)}
    else{var tot2=vals.reduce(function(x,y){return x+y},0);it=typed("Quantas crianças responderam à pesquisa, ao todo?",tot2,f)}
    it.limits=[["n46:t"+k,3]];
  }
  it._info={k:k};
  return it;
}

/* ===================== A GRADE ===================== */
FC.G4=[
  {nivel:1,id:"g4n01",nome:"Nível 1 — Ler e escrever números até 99 999",hab:["EF04MA01"],meta:130,gen:gLer,ano:4},
  {nivel:2,id:"g4n02",nome:"Nível 2 — Valor posicional e decomposição",hab:["EF04MA02"],meta:120,gen:gDecompor,ano:4},
  {nivel:3,id:"g4n03",nome:"Nível 3 — Comparar e ordenar números até 99 999",hab:["EF04MA01"],meta:120,gen:gOrdem,ano:4},
  {nivel:4,id:"g4n04",nome:"Nível 4 — Arredondar para a dezena, a centena e o milhar",hab:["EF04MA03"],meta:120,gen:gArredonda,ano:4},
  {nivel:5,id:"g4n05",nome:"Nível 5 — Somas com quatro algarismos",hab:["EF04MA03"],meta:130,gen:gSoma5,ano:4},
  {nivel:6,id:"g4n06",nome:"Nível 6 — Subtrações com quatro algarismos",hab:["EF04MA03"],meta:140,gen:gSub6,ano:4},
  {nivel:7,id:"g4n07",nome:"Nível 7 — Somas e subtrações até 99 999",hab:["EF04MA03"],meta:150,gen:gMisto7,ano:4},
  {nivel:8,id:"g4n08",nome:"Nível 8 — Estimar o resultado",hab:["EF04MA03"],meta:130,gen:gEstima,ano:4},
  {nivel:9,id:"g4n09",nome:"Nível 9 — Problemas de adição e subtração",hab:["EF04MA03"],meta:170,gen:gProb9,ano:4},
  {nivel:10,id:"g4n10",nome:"Nível 10 — Operações inversas: tirar a prova",hab:["EF04MA04","EF04MA13"],meta:120,gen:gInversa,ano:4},
  {nivel:11,id:"g4n11",nome:"Nível 11 — Propriedades da multiplicação",hab:["EF04MA05"],meta:130,gen:gProp,ano:4},
  {nivel:12,id:"g4n12",nome:"Nível 12 — Multiplicar por 10, 100 e 1000",hab:["EF04MA06"],meta:100,gen:gPor10,ano:4},
  {nivel:13,id:"g4n13",nome:"Nível 13 — Multiplicar dezenas e centenas inteiras",hab:["EF04MA06"],meta:110,gen:gInteiras,ano:4},
  {nivel:14,id:"g4n14",nome:"Nível 14 — Multiplicar por um algarismo, sem reagrupar",hab:["EF04MA06"],meta:110,gen:gPor1sem,ano:4},
  {nivel:15,id:"g4n15",nome:"Nível 15 — Multiplicar números de dois algarismos por um algarismo",hab:["EF04MA06"],meta:120,gen:gPor1(2,15,9),ano:4},
  {nivel:16,id:"g4n16",nome:"Nível 16 — Multiplicar números de três algarismos por um algarismo",hab:["EF04MA06"],meta:140,gen:gPor1(3,16,9),ano:4},
  {nivel:17,id:"g4n17",nome:"Nível 17 — Multiplicar números de quatro algarismos por 2, 3, 4 ou 5",hab:["EF04MA06"],meta:170,gen:gPor1(4,17,5),ano:4},
  {nivel:18,id:"g4n18",nome:"Nível 18 — Multiplicar por dois algarismos (de 11 a 19)",hab:["EF04MA06"],meta:150,gen:gPor2(18),ano:4},
  {nivel:19,id:"g4n19",nome:"Nível 19 — Multiplicar por dois algarismos",hab:["EF04MA06"],meta:180,gen:gPor2(19),ano:4},
  {nivel:20,id:"g4n20",nome:"Nível 20 — Problemas de multiplicação",hab:["EF04MA06"],meta:170,gen:gProbMult20,ano:4},
  {nivel:21,id:"g4n21",nome:"Nível 21 — Combinações possíveis",hab:["EF04MA08"],meta:120,gen:gCombina,ano:4},
  {nivel:22,id:"g4n22",nome:"Nível 22 — Divisão por um algarismo, sem resto",hab:["EF04MA07"],meta:130,gen:gDiv22,ano:4},
  {nivel:23,id:"g4n23",nome:"Nível 23 — Divisão com resto",hab:["EF04MA07"],meta:150,gen:gDiv23,ano:4},
  {nivel:24,id:"g4n24",nome:"Nível 24 — Dividir números de quatro algarismos",hab:["EF04MA07"],meta:150,gen:gDiv24,ano:4},
  {nivel:25,id:"g4n25",nome:"Nível 25 — Divisão por dois algarismos",hab:["EF04MA07"],meta:150,gen:gDiv25,ano:4},
  {nivel:26,id:"g4n26",nome:"Nível 26 — Problemas de divisão",hab:["EF04MA07"],meta:170,gen:gProbDiv26,ano:4},
  {nivel:27,id:"g4n27",nome:"Nível 27 — Múltiplos e restos",hab:["EF04MA11","EF04MA12"],meta:130,gen:gMultiplos,ano:4},
  {nivel:28,id:"g4n28",nome:"Nível 28 — Igualdades: somar ou tirar o mesmo número",hab:["EF04MA14"],meta:110,gen:gIgual28,ano:4},
  {nivel:29,id:"g4n29",nome:"Nível 29 — O número desconhecido nas quatro operações",hab:["EF04MA15"],meta:130,gen:gDesconhecido,ano:4},
  {nivel:30,id:"g4n30",nome:"Nível 30 — Problemas com as quatro operações",hab:["EF04MA03","EF04MA06","EF04MA07"],meta:180,gen:gProb30,ano:4},
  {nivel:31,id:"g4n31",nome:"Nível 31 — Frações unitárias e partes do inteiro",hab:["EF04MA09"],meta:120,gen:gFracao,ano:4},
  {nivel:32,id:"g4n32",nome:"Nível 32 — Frações na reta numérica",hab:["EF04MA09"],meta:120,gen:gFrReta,ano:4},
  {nivel:33,id:"g4n33",nome:"Nível 33 — Décimos e centésimos",hab:["EF04MA10"],meta:120,gen:gDecimal,ano:4},
  {nivel:34,id:"g4n34",nome:"Nível 34 — Decimais e dinheiro",hab:["EF04MA10"],meta:130,gen:gDecDinheiro,ano:4},
  {nivel:35,id:"g4n35",nome:"Nível 35 — Localização e deslocamentos na malha",hab:["EF04MA16"],meta:140,gen:gLocal,ano:4},
  {nivel:36,id:"g4n36",nome:"Nível 36 — Prismas e pirâmides",hab:["EF04MA17"],meta:130,gen:gPrisma,ano:4},
  {nivel:37,id:"g4n37",nome:"Nível 37 — Ângulos retos, agudos e obtusos",hab:["EF04MA18"],meta:110,gen:gAngulo,ano:4},
  {nivel:38,id:"g4n38",nome:"Nível 38 — Simetria de reflexão",hab:["EF04MA19"],meta:130,gen:gSimetria,ano:4},
  {nivel:39,id:"g4n39",nome:"Nível 39 — Perímetro e comprimento",hab:["EF04MA20"],meta:140,gen:gPerim,ano:4},
  {nivel:40,id:"g4n40",nome:"Nível 40 — Área na malha",hab:["EF04MA21"],meta:130,gen:gArea40,ano:4},
  {nivel:41,id:"g4n41",nome:"Nível 41 — Massa e capacidade: conversões",hab:["EF04MA20"],meta:120,gen:gConv41,ano:4},
  {nivel:42,id:"g4n42",nome:"Nível 42 — Tempo: horas, minutos e segundos",hab:["EF04MA22"],meta:150,gen:gTempo42,ano:4},
  {nivel:43,id:"g4n43",nome:"Nível 43 — Temperatura: o grau Celsius",hab:["EF04MA23"],meta:110,gen:gTemp,ano:4},
  {nivel:44,id:"g4n44",nome:"Nível 44 — Dinheiro: troco, desconto e parcelas",hab:["EF04MA25"],meta:150,gen:gDinheiro44,ano:4},
  {nivel:45,id:"g4n45",nome:"Nível 45 — Chances: o mais provável",hab:["EF04MA26"],meta:120,gen:gChances45,ano:4},
  {nivel:46,id:"g4n46",nome:"Nível 46 — Tabelas e gráficos",hab:["EF04MA27"],meta:160,gen:gTabGraf46,ano:4}
];
FC.G4BY={};FC.G4.forEach(function(e){FC.G4BY[e.id]=e});

/* ===================== Tipos e nota de dificuldade (rodízio e rampa, ver plano.js e bncc/TIPOS-E-DIFICULDADE-4ANO.md) ===================== */
/* tipos: os tipos de conta do nível, na ordem em que o rodízio os reserva às folhas; tipo(it): o número do tipo da conta (0, 1, ...); nota(it): quanto maior, mais difícil (relativa ao nível). */
function nums(it){return (String(it.pre)+" "+String(it.post||"")).replace(/\u202F/g,"").match(/\d+/g)||[]}
function nz(n){return /0/.test(String(n))?1:0}                          /* tem zero */
function dg(n){return String(n).length}
function maxN(it){return Math.max.apply(null,nums(it).map(Number).concat([0]))}
function grupo0(it,pref){var l=(it.limits||[]).filter(function(x){return x[0].indexOf(pref)===0})[0];return l?l[0]:""}
function kk(it){return (it._info.k||it._info.tipo||it._info.f)-1}
var ESPEC={
 1:{tipos:["extenso → algarismos","algarismos → extenso"],tipo:function(it){return it._info.tipo==="algarismos"?0:1},
    nota:function(it){var n=it._info.n,r=n%1000;return 2*String(n).replace(/[^0]/g,"").length+((r&&!(r<100||r%100===0))?1:0)+(it._info.tipo==="extenso"?1:0)}},
 2:{tipos:["termo escondido","valor do algarismo","algarismo da casa","montar o número"],tipo:kk,
    nota:function(it){var n=it._info.tipo===4?it.a:+(nums(it).filter(function(x){return x.length>=5})[0]||it.a);return 2*String(n).replace(/[^0]/g,"").length+(it._info.tipo===1?1:0)}},
 3:{tipos:["maior","menor","sinal","número vizinho"],tipo:function(it){return +grupo0(it,"n3:t").slice(4)-1},
    nota:function(it){var t=+grupo0(it,"n3:t").slice(4),n=nums(it).map(String);
      if(t===1||t===2){var o=it.extra.opts.map(function(x){return String(x).replace(/\u202F/g,"")}),c=0;while(c<5&&o.every(function(x){return x[c]===o[0][c]}))c++;return c}
      if(t===3){var a=n[0],b=n[1],c2=0;while(c2<5&&a[c2]===b[c2])c2++;return c2+(a===b?2:0)}
      var ref=n[n.length-1];return /000$/.test(ref)||/999$/.test(ref)?4:1}},
 4:{tipos:["dezena","centena","milhar"],tipo:function(it){return {10:0,100:1,1000:2}[it._info.k]},
    nota:function(it){var i=it._info,r=i.n%i.k;return ({10:0,100:2,1000:4})[i.k]+(i.a>i.n?1:0)+(r>=i.k/2&&r<i.k/2+i.k/10?1:0)}},
 5:{tipos:["soma"],tipo:function(){return 0},nota:function(it){var i=it._info;return vaiUm(i.a,i.b)*2+nz(i.a)+nz(i.b)+(i.a+i.b>9999?1:0)}},
 6:{tipos:["sem zero","com zero"],tipo:function(it){return it._info.z?1:0},nota:function(it){var i=it._info;return empresta(i.a,i.b)*2+nz(i.a)+nz(i.b)}},
 7:{tipos:["soma","subtração"],tipo:function(it){return it._info.op==="+"?0:1},nota:function(it){var i=it._info;return (i.op==="+"?vaiUm(i.a,i.b):empresta(i.a,i.b)+1)*2+nz(i.a)+nz(i.b)}},
 8:{tipos:["soma","subtração"],tipo:function(it){return it._info.soma?0:1},nota:function(it){var i=it._info;return (i.k===1000?2:0)+(i.soma?0:1)+Math.round(3*(1-Math.min(1,Math.abs(i.a%i.k-i.k/2)/(i.k/2)))+3*(1-Math.min(1,Math.abs(i.b%i.k-i.k/2)/(i.k/2))))}},
 9:{tipos:["juntar","acrescentar","separar","retirar","comparar","completar"],tipo:function(it){return ["juntar","acrescentar","separar","retirar","comparar","completar"].indexOf(it._info.tipo)},
    nota:function(it){var i=it._info,r={juntar:0,acrescentar:0,separar:1,retirar:1,comparar:2,completar:2}[i.tipo];return 2*r+dg(Math.max(i.a,i.b))+(i.tipo==="juntar"||i.tipo==="acrescentar"?vaiUm(i.a,i.b):empresta(i.a,i.b))}},
 10:{tipos:["soma → subtração","subtração → soma","lacuna"],tipo:kk,nota:function(it){var i=it._info;return [0,1,2][kk(it)]*2+dg(Math.max(i.a,i.b))+nz(i.a)+nz(i.b)}},
 11:{tipos:["distributiva","comutativa","associativa","decomposição completa"],tipo:kk,nota:function(it){return [1,0,2,3][kk(it)]*2+dg(maxN(it))}},
 12:{tipos:["por 10","por 100","por 1000"],tipo:function(it){return {10:0,100:1,1000:2}[it._info.k]},nota:function(it){var i=it._info;return ({10:0,100:2,1000:4})[i.k]+(i.f===3?2:0)+nz(i.n)}},
 13:{tipos:["dezena × dezena","centena × unidade","dezena × centena"],tipo:function(it){var i=it._info;return i.a%10===0&&i.b%10===0&&Math.max(i.a,i.b)<100?0:Math.min(i.a,i.b)<10?1:2},nota:function(it){var i=it._info;return dg(i.a*i.b)+(Math.min(i.a,i.b)>=10&&Math.max(i.a,i.b)>=100?2:0)}},
 14:{tipos:["multiplicação sem reagrupar"],tipo:function(){return 0},nota:function(it){var i=it._info;return i.b+dg(i.a)}},
 15:{tipos:["2 algarismos × 1"],tipo:function(){return 0},nota:function(it){var i=it._info;return reagrupa(i.a,i.b)*2+i.b/3+nz(i.a)}},
 16:{tipos:["3 algarismos × 1"],tipo:function(){return 0},nota:function(it){var i=it._info;return reagrupa(i.a,i.b)*2+i.b/3+nz(i.a)}},
 17:{tipos:["4 algarismos × 2 a 5"],tipo:function(){return 0},nota:function(it){var i=it._info;return reagrupa(i.a,i.b)*2+i.b/3+nz(i.a)}},
 18:{tipos:["direta","decomposição guiada"],tipo:function(it){return grupo0(it,"n18:d")?1:0},nota:function(it){var i=it._info;return (i.a%10+i.b%10)/4+(grupo0(it,"n18:d")?0:1)+(i.a*i.b>250?1:0)}},
 19:{tipos:["2 algarismos × 2 algarismos"],tipo:function(){return 0},nota:function(it){var i=it._info;return (i.a%10+i.b%10)/4+(i.a*i.b>600?2:0)+reagrupa(i.a,i.b%10)}},
 20:{tipos:["grupos","proporção","fileiras"],tipo:function(it){return [0,1,2][kk(it)]},nota:function(it){return [1,2,0][kk(it)]*2+dg(it.a)}},
 21:{tipos:["contar combinações","achar o fator que falta"],tipo:kk,nota:function(it){var i=it._info;return (i.k===2?2:0)+i.a*i.b/12}},
 22:{tipos:["quociente sem zero","quociente com zero"],tipo:function(it){return nz(it._info.q)},nota:function(it){var i=it._info;return i.d/2+nz(i.q)*2+(i.q>=100?1:0)}},
 23:{tipos:["quociente","resto","verificação"],tipo:kk,nota:function(it){var i=it._info;return [1,0,2][kk(it)]*2+i.d/2+nz(i.q)}},
 24:{tipos:["exata","quociente com resto","resto"],tipo:kk,nota:function(it){var i=it._info;return i.d/2+dg(i.q)+(i.k===1?0:1)+nz(i.q)}},
 25:{tipos:["direta","com pista da multiplicação"],tipo:function(it){return /então/.test(it.pre)?1:0},nota:function(it){var i=it._info;return i.d/3+i.q/5+(/então/.test(it.pre)?0:1)}},
 26:{tipos:["repartir","quantas caixas","o que sobra","viagens necessárias"],tipo:kk,nota:function(it){return kk(it)*2+dg(maxN(it))}},
 27:{tipos:["reconhecer múltiplo","sequência de múltiplos","resto","mesmo resto"],tipo:kk,nota:function(it){var n=nums(it).map(Number);return kk(it)*2+Math.min.apply(null,n.filter(function(x){return x>=3}).concat([9]))/3}},
 28:{tipos:["somar o mesmo número","tirar o mesmo número","equivalência"],tipo:kk,nota:function(it){return [0,1,2][kk(it)]*2+dg(maxN(it))}},
 29:{tipos:["adição","subtração","multiplicação","dividendo escondido","divisor escondido"],tipo:kk,nota:function(it){return kk(it)*2+dg(maxN(it))}},
 30:{tipos:["soma depois de multiplicar","subtração depois de multiplicar","divisão depois de subtração"],tipo:kk,nota:function(it){return kk(it)*2+dg(it.a)}},
 31:{tipos:["fração pintada","partes iguais","quantos 1/n formam o inteiro","escolher a figura","qual é maior"],tipo:kk,nota:function(it){var i=it._info;return [0,0,1,1,2][kk(it)]*2+(i.d>=5?2:0)+(it.extra&&it.extra.fig&&it.extra.fig.forma==="circulo"?1:0)}},
 32:{tipos:["fração no ponto","quantas partes","escolher a reta"],tipo:kk,nota:function(it){var i=it._info;return [0,0,2][kk(it)]*2+(i.d>=5?2:0)+i.d/5}},
 33:{tipos:["décimos","centésimos","qual decimal","converter"],tipo:kk,nota:function(it){return [0,2,3,1][kk(it)]*2+(it._info.n%10===0?0:1)}},
 34:{tipos:["reais → centavos","centavos → reais","soma","moedas"],tipo:kk,nota:function(it){return [0,2,2,1][kk(it)]*2+(it.a%100!==0&&kk(it)===0?1:0)}},
 35:{tipos:["casas para a direita","casa da estrela","deslocamento","total de casas"],tipo:kk,nota:function(it){var f=it.extra&&it.extra.fig,d=0;if(f&&f.s&&f.d)d=Math.abs(f.d[0]-f.s[0])+Math.abs(f.d[1]-f.s[1]);return [0,1,3,2][kk(it)]*2+d/2}},
 36:{tipos:["contar faces, arestas, vértices","dar o nome do sólido"],tipo:kk,nota:function(it){var n=it._info.n;return (kk(it)===1?3:0)+n+(/arestas|vértices/.test(it.pre)?2:0)}},
 37:{tipos:["reto, agudo ou obtuso","qual é o maior","ângulos retos de uma figura"],tipo:kk,nota:function(it){if(kk(it)===0)return 6-Math.min(6,Math.abs(it.extra.fig.g-90)/10);if(kk(it)===1){var g=it.extra.opts.map(function(o){return o.fig.g}).sort(function(a,b){return a-b});return 6-Math.min(6,(g[2]-g[1])/10)}return 2}},
 38:{tipos:["quadradinhos que faltam","a figura é simétrica?","eixos de simetria"],tipo:kk,nota:function(it){var f=it.extra&&it.extra.fig;return kk(it)===0?f.cells.length:kk(it)===1?4+f.cells.length/2:it.a}},
 39:{tipos:["perímetro","lado que falta","conversão de unidades"],tipo:kk,nota:function(it){var f=it.extra&&it.extra.fig;return [0,2,1][kk(it)]*2+(f?f.lados.length:/km|mm/.test(it.pre)?4:2)}},
 40:{tipos:["contar quadradinhos","retângulo","comparar figuras"],tipo:kk,nota:function(it){var f=it.extra&&it.extra.fig;if(kk(it)===0)return f.cells.length/2;if(kk(it)===1)return (+nums(it)[0])*(+nums(it)[1])/10;var a=it.extra.opts.map(function(o){return o.fig.shapes[0].cells.length}).sort(function(x,y){return x-y});return 8-Math.min(6,Math.min(a[1]-a[0],a[2]-a[1]))}},
 41:{tipos:["kg → g e L → mL","g → kg e mL → L","misto"],tipo:function(it){var k=kk(it);return k<=1?0:k===2?1:2},nota:function(it){var k=kk(it);return k<=1?0:k===2?2:4}},
 42:{tipos:["ler o relógio","minutos de duração","hora de término","conversões"],tipo:kk,nota:function(it){return [1,2,2,0][kk(it)]*2+(kk(it)===0&&it.extra.fig.m%5!==0?2:0)+(kk(it)===1?(it.a>60?1:0):0)}},
 43:{tipos:["ler o termômetro","diferença","subiu ou desceu","cidade mais quente"],tipo:kk,nota:function(it){return [0,1,2,0][kk(it)]*2+dg(maxN(it))}},
 44:{tipos:["troco","desconto","parcelas","à vista ou parcelado"],tipo:kk,nota:function(it){return [0,1,2,3][kk(it)]*2+dg(maxN(it))}},
 45:{tipos:["cor mais ou menos provável","certo, possível ou impossível","comparar roletas"],tipo:kk,nota:function(it){return [1,0,2][kk(it)]*2+(kk(it)===0&&/menos/.test(it.pre)?2:0)}},
 46:{tipos:["ler um valor","soma de valores","diferença entre dois","total"],tipo:kk,nota:function(it){var f=it.extra.fig;return kk(it)*2+(f.t==="tabela2"?1:0)+dg(it.a)}}
};
/* Ordem dos tipos do mais fácil ao mais difícil (média da nota de cada tipo, medida em 4 000 contas por nível). O rodízio reserva o 1º da lista à folha 1, o 2º à folha 2 e assim por diante: fixa de propósito, para que as 5 folhas do dia, montadas em momentos diferentes, sempre cubram todos os tipos. */
var ORDEM={"1":[0,1],"2":[2,3,1,0],"3":[0,1,3,2],"4":[0,1,2],"5":[0],"6":[0,1],"7":[0,1],"8":[0,1],"9":[1,0,2,3,4,5],"10":[0,1,2],"11":[1,0,2,3],"12":[0,1,2],"13":[0,1,2],"14":[0],"15":[0],"16":[0],"17":[0],"18":[1,0],"19":[0],"20":[2,0,1],"21":[0,1],"22":[0,1],"23":[1,0,2],"24":[0,2,1],"25":[1,0],"26":[0,1,2,3],"27":[0,1,2,3],"28":[0,1,2],"29":[0,1,2,3,4],"30":[0,1,2],"31":[0,1,3,2,4],"32":[1,0,2],"33":[0,3,1,2],"34":[0,3,1,2],"35":[0,1,2,3],"36":[0,1],"37":[1,2,0],"38":[2,0,1],"39":[0,2,1],"40":[0,1,2],"41":[0,1,2],"42":[3,0,2,1],"43":[0,3,1,2],"44":[0,1,2,3],"45":[1,0,2],"46":[0,1,2,3]};
Object.keys(ORDEM).forEach(function(n){ESPEC[n].ordem=ORDEM[n]});
/* ===================== O 4º ano na grade do app: FC.LEVELS (os níveis seguem os 118 dos três primeiros anos; o aluno vê a numeração corrida, de 119 a 164) ===================== */
var BASE4=FC.LEVELS.length;                          /* 118 */
var BLOCOS4=[[4,"Números até 99 999"],[10,"Adição e subtração até 99 999"],[21,"Multiplicação"],[27,"Divisão, múltiplos e restos"],[30,"Igualdades e problemas"],[34,"Frações e decimais"],[38,"Ângulos, sólidos e simetria"],[44,"Perímetro, área, tempo e dinheiro"],[46,"Acaso, tabelas e gráficos"]];
var DICAS4={1:"Leia e escreva números até 99 999, inclusive por extenso.",2:"34 567 = 3 × 10 000 + 4 × 1 000 + 5 × 100 + 6 × 10 + 7.",3:"Compare números de cinco algarismos: comece pela maior ordem.",4:"Arredonde olhando o algarismo da direita: 5 ou mais sobe, menos de 5 fica.",
  5:"Somas de quatro algarismos com \"vai um\". Se quiser, faça no papel.",6:"Subtrações de quatro algarismos, com \"empresta\" e zeros. Se quiser, faça no papel.",7:"Somas e subtrações até 99 999.",8:"Arredonde os números antes e faça a conta de cabeça: é só uma estimativa.",
  9:"Leia o problema, escolha somar ou subtrair e confira se o resultado é razoável.",10:"Para tirar a prova, use a operação inversa: se 4 500 + 2 300 = 6 800, então 6 800 − 2 300 = 4 500.",11:"8 × 15 = 8 × 10 + 8 × 5. Trocar a ordem ou o agrupamento não muda o resultado.",
  12:"Multiplicar por 10, 100 ou 1000 é acrescentar zeros ao número.",13:"30 × 40: faça 3 × 4 = 12 e acrescente os dois zeros: 1 200.",14:"Multiplique cada algarismo por vez, como 312 × 3.",15:"47 × 6: 40 × 6 = 240 e 7 × 6 = 42; some tudo.",
  16:"234 × 4: centenas, dezenas e unidades, uma de cada vez. Faça no papel se precisar.",17:"Com milhares, vá devagar: 1 285 × 4. O papel ajuda.",18:"12 × 15 = 12 × 10 + 12 × 5. Separe a dezena e a unidade.",19:"32 × 21 = 32 × 20 + 32 × 1. Faça no papel se precisar.",
  20:"Grupos iguais, fileiras e proporção: ache quanto vale cada grupo.",21:"3 camisas e 2 bermudas dão 3 × 2 = 6 conjuntos diferentes.",22:"Para dividir, pense na tabuada: 846 ÷ 2, depois 8, 4 e 6 centenas, dezenas e unidades.",
  23:"O resto é o que sobra e é sempre menor que o divisor. Para conferir: divisor × quociente + resto = dividendo.",24:"Divida o milhar, depois as centenas, dezenas e unidades. Faça no papel se precisar.",25:"96 ÷ 12: pense em 12 × 8 = 96. A multiplicação ajuda a dividir.",
  26:"Repartir, ver quantos grupos cabem, o que sobra e quantas viagens: leia com atenção.",27:"Múltiplos de 7: 7, 14, 21, 28… Números com o mesmo resto formam uma sequência regular.",28:"Se somar (ou tirar) o mesmo número dos dois lados, a igualdade continua verdadeira.",
  29:"Ache o número que falta usando a operação inversa: 6 × __ = 54, então 54 ÷ 6.",30:"Problemas de duas etapas: faça uma operação por vez e confira.",31:"1/4 lê-se um quarto: o inteiro foi dividido em 4 partes iguais e pegamos uma.",
  32:"Entre 0 e 1, a reta foi dividida em partes iguais. O ponto A está em 1/ o número de partes.",33:"Um décimo é 1 de 10 partes iguais (0,1); um centésimo é 1 de 100 partes (0,01).",34:"1 real tem 100 centavos. R$ 3,50 é 350 centavos.",
  35:"A letra diz a coluna e o número diz a linha. Ande para a direita e para cima.",36:"Prisma tem duas bases iguais; pirâmide tem uma base e faces laterais triangulares.",37:"Ângulo reto mede 90°, agudo é menor que o reto e obtuso é maior que o reto.",
  38:"Dobrando pela linha tracejada, as duas metades têm que coincidir.",39:"Perímetro é a soma de todos os lados. 1 m = 100 cm; 1 cm = 10 mm; 1 km = 1 000 m.",40:"Área é quantos quadradinhos cobrem a figura.",41:"1 kg = 1 000 g e 1 L = 1 000 mL.",
  42:"1 hora tem 60 minutos e 1 minuto tem 60 segundos. Conte o tempo de hora em hora.",43:"O termômetro mostra a temperatura em graus Celsius (°C). Quanto mais alto o líquido, maior a temperatura.",44:"Troco é o que sobra do pagamento; desconto é o que se tira do preço; parcelas somadas dão o total.",
  45:"A cor com mais partes tem mais chance. Certo, possível ou impossível?",46:"Leia as tabelas e os gráficos com atenção: ache a linha ou a barra certa e calcule."};
var INTROS4={1:"Lembrete: \"mil\" sozinho vale 1000. Depois do mil usamos \"e\" quando sobra uma centena inteira ou menos de 100 (vinte mil e cinco) e vírgula nos outros casos (vinte mil, cento e dez).",
  23:"Lembrete: o resto é o que sobra quando não dá mais para formar grupos iguais. Ele é sempre menor que o número que divide.",
  31:"Lembrete: 1/2 lê-se um meio, 1/3 um terço, 1/4 um quarto, 1/5 um quinto e 1/10 um décimo. O número de baixo diz em quantas partes iguais o inteiro foi dividido.",
  33:"Lembrete: o quadro tem 100 quadradinhos. Cada fileira de 10 é 1 décimo (0,1) e cada quadradinho é 1 centésimo (0,01).",
  36:"Lembrete: o prisma tem duas bases iguais e faces laterais retangulares; a pirâmide tem uma base e faces laterais triangulares.",
  37:"Lembrete: o ângulo reto mede 90° e tem o formato do canto de uma folha; o agudo é menor que o reto e o obtuso é maior.",
  38:"Lembrete: a figura é simétrica quando as duas metades se encaixam ao dobrar pela linha tracejada."};
FC.G4.forEach(function(e){
  var grupo=BLOCOS4.filter(function(b){return e.nivel<=b[0]})[0][1];
  var l={group:grupo,id:String(BASE4+e.nivel),name:e.nome.replace(/^Nível \d+ — /,""),hint:DICAS4[e.nivel],target:e.meta,gen:e.gen,ano:4,hab:e.hab};
  if(INTROS4[e.nivel])l.intro=INTROS4[e.nivel];
  l.espec=ESPEC[e.nivel];
  FC.LEVELS.push(l);
});
})();
