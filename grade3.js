/* Grade do 3º ano — geradores escritos do zero a partir das fichas em bncc/fichas/3ano-*.md.
   Mesma forma dos geradores do 1º e do 2º ano: {pre, post, a, extra?}, com limits/key/_info só para o app e os testes.
   Por enquanto os geradores não estão ligados aos níveis do app: aparecem na aba Exercícios do /adm.
   Níveis feitos: 1 a 42, a grade inteira do 3º ano (números até 9999, adição e subtração, igualdades, multiplicação, divisão, geometria, medidas, tempo, dinheiro, acaso e dados). Os números de quatro algarismos aparecem com espaço fino de milhar (3 456). */
(function(){
"use strict";
var FC=window.FC,X=FC.exh,rnd=X.rnd,pick=X.pick,choice=X.choice,typed=X.typed,fmt=X.milh;

function embaralhar(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(0,i),t=a[i];a[i]=a[j];a[j]=t}return a}
function digs(n){return [Math.floor(n/1000),Math.floor(n/100)%10,Math.floor(n/10)%10,n%10]}
function junta(d){return d[0]*1000+d[1]*100+d[2]*10+d[3]}

/* Número por extenso (1 a 9999), pelas regras dos livros didáticos: "mil" (nunca "um mil"); depois do mil vai "e" quando o resto
   é uma centena inteira ou menor que 100 ("mil e cem", "dois mil e quarenta"), e vírgula nos outros casos ("mil, cento e dez"). */
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
  var m=Math.floor(n/1000),r=n%1000,milhar=m===1?"mil":UN[m]+" mil";
  if(r===0)return milhar;
  return milhar+((r<100||r%100===0)?" e ":", ")+ate999(r);
}

/* Nível 1 — Ler e escrever números até 9999 (EF03MA01): do extenso para os algarismos e dos algarismos para o extenso. */
function numero1(){
  var d=[rnd(1,9),rnd(1,9),rnd(1,9),rnd(1,9)];
  if(Math.random()<.3){var k=rnd(1,6),z=[[1],[2],[3],[1,2],[1,3],[2,3]][k-1];z.forEach(function(i){d[i]=0})}
  return junta(d);
}
function parecidos(n){                               /* números que diferem do certo em um só detalhe */
  var d=digs(n),out=[],i,v,x;
  for(i=0;i<3;i++)if(d[i]!==d[i+1]){x=d.slice();var t=x[i];x[i]=x[i+1];x[i+1]=t;if(x[0]>0)out.push(junta(x))}
  for(i=0;i<4;i++)for(v=0;v<=9;v++)if(v!==d[i]&&!(i===0&&v===0)){x=d.slice();x[i]=v;out.push(junta(x))}
  return out.filter(function(q,k){return q!==n&&out.indexOf(q)===k});
}
function gLer(){
  var n=numero1(),it;
  if(Math.random()<.5){
    it=typed("Escreva em algarismos: "+extenso(n)+".",n);it.limits=[["n1:t1",4]];it._info={tipo:"algarismos",n:n};
  }else{
    var wr=embaralhar(parecidos(n)),outros=[],ext=[extenso(n)];
    wr.forEach(function(q){if(outros.length<2&&ext.indexOf(extenso(q))<0){outros.push(q);ext.push(extenso(q))}});
    it=choice("Como se lê o número "+fmt(n)+"?",extenso(n),outros.map(extenso),null);it.limits=[["n1:t2",4]];it._info={tipo:"extenso",n:n};
  }
  return it;
}

/* Nível 2 — Milhares, centenas, dezenas e unidades com o material dourado (EF03MA02). */
function legenda3(){return "Cada cubo grande vale 1000, cada placa vale 100, cada barra vale 10 e cada quadradinho vale 1. "}
function gMaterial3(){
  var r=Math.random(),d=[rnd(1,9),rnd(1,9),rnd(1,9),rnd(1,9)],it,fig,n;
  var figura=function(x){return {t:"placas",m:x[0],h:x[1],d:x[2],o:x[3]}};
  if(r<.625){                                          /* valor da figura; zero em cerca de 30% */
    if(Math.random()<.3){var z=pick([[1],[2],[3],[1,2],[1,3],[2,3]]);z.forEach(function(i){d[i]=0})}
    it=typed(legenda3()+"Quanto vale tudo junto?",junta(d),figura(d));it.limits=[["n2:t1",6]];
  }else if(r<.875){                                    /* quantas peças de cada tipo (casas cheias) */
    var q=pick([0,1,2,3]),txt=["quantos cubos de 1000?","quantas placas de 100?","quantas barras de 10?","quantos quadradinhos soltos?"][q];
    it=typed("O número "+fmt(junta(d))+(q===3?" tem ":" é formado por ")+txt,d[q],figura(d));it.limits=[["n2:t2",3]];
  }else{                                               /* a casa vazia: a resposta é zero */
    var vazia=pick([[1],[2],[3],[1,2],[1,3],[2,3]]);vazia.forEach(function(i){d[i]=0});
    var cas=pick(vazia),txt2=["","quantas placas de 100?","quantas barras de 10?","quantos quadradinhos soltos?"][cas];
    it=typed("O número "+fmt(junta(d))+(cas===3?" tem ":" é formado por ")+txt2,0,figura(d));it.limits=[["n2:t3",2]];
  }
  return it;
}

/* Nível 3 — Valor posicional e o zero (EF03MA01, EF03MA02): montar, valor, ordem e casa vazia, 2 de cada. */
function mil(n){return n+(n===1?" milhar":" milhares")}
function cen(n){return n+(n===1?" centena":" centenas")}
function dez(n){return n+(n===1?" dezena":" dezenas")}
function uni(n){return n+(n===1?" unidade":" unidades")}
function digitos3(zero,distintos){
  var d,t=0;
  do{
    d=[rnd(1,9),rnd(1,9),rnd(1,9),rnd(1,9)];
    if(zero){var z=pick([[1],[2],[3],[1,2],[1,3],[2,3]]);z.forEach(function(i){d[i]=0})}
    var nz=d.filter(function(x){return x>0});
  }while(distintos&&new Set(nz).size!==nz.length&&t++<500);
  return d;
}
var ORDEM=["milhar","centena","dezena","unidade"];
function gPosicional3(){
  var k=rnd(1,4),it,d,n;
  if(k===1){
    d=digitos3(Math.random()<.3,false);
    it=typed("Qual número tem "+mil(d[0])+", "+cen(d[1])+", "+dez(d[2])+" e "+uni(d[3])+"?",junta(d));it.limits=[["n3:t1",2]];
  }else if(k===2){
    d=digitos3(Math.random()<.3,true);n=junta(d);var i=pick([0,1,2,3].filter(function(x){return d[x]>0}));
    it=typed("No número "+fmt(n)+", quanto vale o algarismo "+d[i]+"?",d[i]*[1000,100,10,1][i]);it.limits=[["n3:t2",2]];
  }else if(k===3){
    d=digitos3(Math.random()<.3,true);n=junta(d);var j=pick([0,1,2,3].filter(function(x){return d[x]>0}));
    it=choice("Em "+fmt(n)+", o algarismo "+d[j]+" está em que ordem?",ORDEM[j],ORDEM.filter(function(x){return x!==ORDEM[j]}),null);it.limits=[["n3:t3",2]];
  }else{
    d=digitos3(true,false);var vz=[1,2,3].filter(function(x){return d[x]===0}),c=pick(vz);n=junta(d);
    it=typed("Que algarismo está na casa "+["","das centenas","das dezenas","das unidades"][c]+" de "+fmt(n)+"?",0);it.limits=[["n3:t4",2]];
  }
  it._info={tipo:k};
  return it;
}

/* Nível 4 — Decompor números até 9999 (EF03MA02): seis tipos, no máximo 2 de cada por folha. Zero em 15% dos tipos 1 a 3. */
function gDecompor4(){
  var k=rnd(1,6),d=[rnd(1,9),rnd(1,9),rnd(1,9),rnd(1,9)],it,n;
  if(k<=3&&Math.random()<.15){
    var oculto=k===1?3:k===2?2:1,outros=[1,2,3].filter(function(x){return x!==oculto});
    if(Math.random()<.5)d[oculto]=0;else d[pick(outros)]=0;
  }
  n=junta(d);var P=[d[0]*1000,d[1]*100,d[2]*10,d[3]],S=fmt(n);
  if(k===1)it=typed(S+" = "+fmt(P[0])+" + "+P[1]+" + "+P[2]+" +",P[3]);
  else if(k===2)it=typed(S+" = "+fmt(P[0])+" + "+P[1]+" +",P[2],null,"+ "+P[3]);
  else if(k===3)it=typed(S+" = "+fmt(P[0])+" +",P[1],null,"+ "+P[2]+" + "+P[3]);
  else if(k===4)it=typed(S+" =",P[0],null,"+ "+P[1]+" + "+P[2]+" + "+P[3]);
  else if(k===5){
    var partes=P.filter(function(x){return x>0}).map(fmt);
    it=typed("Qual número é "+partes.join(" + ")+"?",n);
  }else{
    var v=rnd(1,3),prim=v===1?P[0]:v===2&&d[0]>1?(d[0]-1)*1000:P[0]+P[1];
    it=typed(S+" = "+fmt(prim)+" +",n-prim);
  }
  it.limits=[["n4:t"+k,2]];it._info={tipo:k,n:n};
  return it;
}

/* Nível 5 — Comparar e ordenar números até 9999 (EF03MA01): maior/menor, ordem e sinal. */
function tres4(){
  var r=Math.random(),h,t=0,ms,c1,c2,t1;
  if(r<.35){                                           /* milhares diferentes e bem separados (diferença mínima de 2) */
    do{h=[rnd(1,9),rnd(1,9),rnd(1,9)].sort(function(a,b){return a-b})}while((h[1]-h[0]<2||h[2]-h[1]<2)&&t++<500);
    return {modo:"sep",v:embaralhar(h.map(function(x){return x*1000+rnd(0,999)}))};
  }
  if(r<.65){                                           /* mesmo milhar, centenas diferentes */
    var m1=rnd(1,9),m2;do{m2=rnd(1,9)}while(m2===m1);
    do{c1=rnd(0,9);c2=rnd(0,9)}while(c1===c2);
    return {modo:"cent",v:embaralhar([m1*1000+c1*100+rnd(0,99),m1*1000+c2*100+rnd(0,99),m2*1000+rnd(0,999)])};
  }
  if(r<.80){                                           /* mesmo milhar e mesma centena, dezenas diferentes */
    var m3=rnd(1,9),m4;do{m4=rnd(1,9)}while(m4===m3);var cc=rnd(0,9);
    do{c1=rnd(0,9);c2=rnd(0,9)}while(c1===c2);
    return {modo:"dez",v:embaralhar([m3*1000+cc*100+c1*10+rnd(0,9),m3*1000+cc*100+c2*10+rnd(0,9),m4*1000+rnd(0,999)])};
  }
  if(r<.90){                                           /* algarismos trocados: três permutações */
    var ds=embaralhar([1,2,3,4,5,6,7,8,9]).slice(0,4);
    return {modo:"troca",v:embaralhar([junta([ds[0],ds[1],ds[2],ds[3]]),junta([ds[0],ds[1],ds[3],ds[2]]),junta([ds[1],ds[0],ds[2],ds[3]])])};
  }
  if(r<.95){                                           /* zero no meio: m00d, m0d0, md00 */
    var m5=rnd(1,9),d5=rnd(1,9);
    return {modo:"zero",v:embaralhar([m5*1000+d5,m5*1000+d5*10,m5*1000+d5*100])};
  }
  var m6=rnd(1,9),cc2=rnd(0,9),dd2=rnd(0,9),us=embaralhar([0,1,2,3,4,5,6,7,8,9]).slice(0,3);   /* só as unidades decidem */
  return {modo:"uni",v:us.map(function(u){return m6*1000+cc2*100+dd2*10+u})};
}
function gOrdem4(){
  var tr,ok,tt=0;
  do{tr=tres4();ok=new Set(tr.v).size===3}while(!ok&&tt++<500);
  var v=tr.v,r=Math.random(),it;
  if(r<.5){
    var maior=Math.random()<.5,certa=maior?Math.max.apply(null,v):Math.min.apply(null,v);
    it=choice("Qual é o "+(maior?"maior":"menor")+" número?",fmt(certa),v.filter(function(n){return n!==certa}).map(fmt),null);
    it.limits=[["n5:t1",4]];it._info={tipo:"mm",v:v,maior:maior,modo:tr.modo};
  }else if(r<.75){
    var cresc=Math.random()<.5,asc=v.slice().sort(function(a,b){return a-b}),ord=cresc?asc:asc.slice().reverse(),txt=function(a){return a.map(fmt).join(", ")},certaTxt=txt(ord);
    var perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]].map(function(p){return txt(p.map(function(i){return v[i]}))}).filter(function(s){return s!==certaTxt});
    it=choice("Qual é a ordem certa, do "+(cresc?"menor para o maior":"maior para o menor")+"?",certaTxt,embaralhar(perms).slice(0,2),null);
    it.limits=[["n5:t2",2]];it._info={tipo:"ordem",v:v,cresc:cresc,modo:tr.modo};
  }else{
    var a,b,igual=Math.random()<.15,esq,dir,sinal;
    if(igual){                                          /* igual, com um lado decomposto: 3 400 ○ 3 000 + 400 */
      var m=rnd(1,9),c=rnd(1,9),n=m*1000+c*100,dec=fmt(m*1000)+" + "+c*100;
      esq=Math.random()<.5?fmt(n):dec;dir=esq===fmt(n)?dec:fmt(n);sinal="=";a=n;b=n;
    }else{
      a=v[0];b=v[1];esq=fmt(a);dir=fmt(b);sinal=a>b?">":"<";
    }
    it=choice("Qual sinal completa: "+esq+" ○ "+dir+"?",sinal,[">","<","="].filter(function(x){return x!==sinal}),null);
    it.limits=[["n5:t3",2]];it._info={tipo:"sinal",a:a,b:b,igual:igual,modo:igual?"igual":tr.modo};
  }
  if(tr.modo==="troca"&&it._info.tipo!=="sinal"||(tr.modo==="troca"&&it._info.tipo==="sinal"&&!it._info.igual))it.limits.push(["n5:troca",1]);
  return it;
}

/* Nível 6 — A reta numérica (EF03MA04): ler o ponto, achar o número e quanto falta. */
var RETAS=[[0,100,10,50],[100,200,10,50],[500,600,10,50],[0,500,50,250],[0,1000,100,500],[1000,2000,100,500],[3000,4000,100,500],[0,10000,1000,5000]];
function ticksLivres(r){                              /* marcas sem número escrito (nem as pontas nem as marcas rotuladas) */
  var out=[],n=(r[1]-r[0])/r[2];
  for(var k=1;k<n;k++)if((k*r[2])%r[3]!==0)out.push(r[0]+k*r[2]);
  return out;
}
function gReta(){
  var r=pick(RETAS),livres=ticksLivres(r),q=Math.random(),it,base={min:r[0],max:r[1],step:r[2],labelEvery:r[3],milh:true};
  if(q<.375){
    var m=pick(livres);
    it=typed("Que número a seta está mostrando na reta?",m,{t:"line",min:r[0],max:r[1],step:r[2],labelEvery:r[3],mark:m,milh:true});
    it.limits=[["n6:t1",3]];it._info={tipo:"ler",r:r,m:m};
  }else if(q<.75){
    var pts=embaralhar(livres).slice(0,4).sort(function(a,b){return a-b}),alvo=pick(pts);
    var fig={t:"reta2",min:r[0],max:r[1],step:r[2],labelEvery:r[3],pts:pts.map(function(v,i){return {v:v,l:"ABCD".charAt(i)}})};
    it=choice("Em que ponto da reta fica o número "+fmt(alvo)+"?","ABCD".charAt(pts.indexOf(alvo)),"ABCD".split("").filter(function(l){return l!=="ABCD".charAt(pts.indexOf(alvo))}),fig);
    it.limits=[["n6:t2",3]];it._info={tipo:"onde",r:r,pts:pts,alvo:alvo};
  }else{
    var dois=embaralhar(livres).slice(0,2).sort(function(a,b){return a-b});
    it=typed("Quanto falta para ir do ponto A ao ponto B?",dois[1]-dois[0],{t:"reta2",min:r[0],max:r[1],step:r[2],labelEvery:r[3],pts:[{v:dois[0],l:"A"},{v:dois[1],l:"B"}]});
    it.limits=[["n6:t3",2]];it._info={tipo:"falta",r:r,dois:dois};
  }
  return it;
}

/* Nível 7 — Sequências e regularidades (EF03MA10): completar, descobrir a regra e achar o número errado. */
function seq7(){
  var passo=Math.random()<.6?pick([1,10,100,1000]):pick([2,5,20,25,50]),sobe=Math.random()<.7,v,t=0,s,i,cruza=(passo===1||passo===10||passo===100)&&Math.random()<.4;
  do{
    var lo=100,hi=9999,mult=(passo===5||passo>=20&&passo<100)?5:1;
    if(sobe)s=rnd(lo,hi-4*passo);else s=rnd(lo+4*passo,hi);
    s=Math.round(s/mult)*mult;while(s>hi)s-=mult;if(sobe&&s+4*passo>hi)s-=mult;if(!sobe&&s-4*passo<lo)s+=mult;
    v=[];for(i=0;i<5;i++)v.push(sobe?s+i*passo:s-i*passo);
    var f=Math.floor(Math.min(v[0],v[4])/(10*passo)),l=Math.floor(Math.max(v[0],v[4])/(10*passo));
    if(!cruza||f!==l)break;
  }while(t++<300);
  return {passo:passo,sobe:sobe,v:v};
}
function ajustaPA(a,pulo){                             /* a sequência sem o índice "pulo" é uma progressão aritmética? */
  var k=[],i;for(i=0;i<a.length;i++)if(i!==pulo)k.push(i);
  var d=(a[k[1]]-a[k[0]])/(k[1]-k[0]);if(d!==Math.floor(d)||d===0)return false;
  for(i=0;i<k.length;i++)if(a[k[i]]-a[k[0]]!==d*(k[i]-k[0]))return false;
  return true;
}
function gSeq4(){
  var q=seq7(),r=Math.random(),it,sob=q.sobe,passo=q.passo,v=q.v;
  if(r<.5){
    var k=rnd(1,3);
    it=typed("De "+fmt(passo)+" em "+fmt(passo)+": "+v.slice(0,k).map(fmt).join("  "),v[k],null,v.slice(k+1).map(fmt).join("  "));
    it.limits=[["n7:t1",4]];it._info={tipo:"completar",passo:passo,sobe:sob,v:v,k:k};
  }else if(r<.75){
    var sh=v.slice(0,rnd(4,5)),txt=function(s,p){return (s?"soma ":"tira ")+fmt(p)};
    var outros=[1,2,5,10,20,25,50,100,1000].filter(function(x){return x!==passo});
    it=choice(sh.map(fmt).join(", ")+". Qual é a regra?",txt(sob,passo),[txt(!sob,passo),txt(sob,pick(outros))],null);
    it.limits=[["n7:t2",2]];it._info={tipo:"regra",passo:passo,sobe:sob,v:v};
  }else{
    var w,errado,tt=0,seqE;
    do{
      w=rnd(1,3);var delta=pick([passo,-passo,passo>=2&&passo%2===0?passo/2:passo,passo>=10?10:1,-1,1]);
      errado=v[w]+delta;seqE=v.slice();seqE[w]=errado;
      var unico=errado!==v[w]&&errado>=100&&errado<=9999&&v.indexOf(errado)<0&&ajustaPA(seqE,w);
      for(var s=0;s<5&&unico;s++)if(s!==w&&ajustaPA(seqE,s))unico=false;
    }while(!unico&&tt++<500);
    if(!unico){seqE=[2500,2600,2700,2750,2900];w=3;errado=2750;passo=100;sob=true}
    var opts=[errado],resto=embaralhar(seqE.filter(function(x,i){return i!==w}));while(opts.length<4)opts.push(resto.pop());
    it=choice(seqE.map(fmt).join(", ")+". Qual número está errado?",fmt(errado),opts.filter(function(x){return x!==errado}).map(fmt),null);
    it.limits=[["n7:t3",2]];it._info={tipo:"errado",seq:seqE,w:w,errado:errado};
  }
  return it;
}

/* ===================== Níveis 8 a 15: adição e subtração ===================== */
var MENOS="−",NAMES=X.NAMES;
function conta3(a,op,b){return fmt(a)+" "+op+" "+fmt(b)+" ="}
function pj(nivel,a,b){return "p"+nivel+":"+Math.min(a,b)+","+Math.max(a,b)}   /* parcelas trocadas = mesma conta na folha */
function vaiUm(a,b){var x=digs(a),y=digs(b),car=0,f=[0,0,0,0],i;for(i=3;i>=0;i--){var s=x[i]+y[i]+car;if(s>=10){f[i]=1;car=1}else car=0}return {f:f,over:car}}
function empresta(a,b){var x=digs(a),y=digs(b),bor=0,f=[0,0,0,0],i;for(i=3;i>=0;i--){var v=x[i]-bor-y[i];if(v<0){f[i]=1;bor=1}else bor=0}return f}
function temZero(n){var d=digs(n);return (n>=1000&&(d[1]===0||d[2]===0||d[3]===0))||(n<1000&&(d[2]===0||d[3]===0))}
function ate(fn,max){for(var t=0;t<(max||6000);t++){var r=fn();if(r)return r}return null}
function somaIt(a,b,l,info){var it=typed(conta3(a,"+",b),a+b);it.limits=l;it._info=info||{};it._info.op="+";it._info.a=a;it._info.b=b;return it}
function subIt(a,b,l,info){var it=typed(conta3(a,MENOS,b),a-b);it.limits=l;it._info=info||{};it._info.op="-";it._info.a=a;it._info.b=b;return it}

/* Nível 8 — Complementos: quanto falta para 100 e para 1000 (EF03MA03, EF03MA05). Quatro formas, a resposta é sempre o x de x + y = T. */
function gComplemento(){
  var T=Math.random()<.5?100:1000,y;
  if(T===100)y=Math.random()<.3?10*rnd(1,9):rnd(1,99);else y=Math.random()<.3?100*rnd(1,9):10*rnd(1,99);
  var x=T-y,f=rnd(1,4),it,t=fmt(T),Y=fmt(y);
  if(f===1)it=typed(Y+" +",x,null,"= "+t);
  else if(f===2)it=typed("",x,null,"+ "+Y+" = "+t);
  else if(f===3)it=typed(t+" "+MENOS+" "+Y+" =",x);
  else it=typed(t+" "+MENOS,x,null,"= "+Y);
  it.limits=[["n8:f"+f,2]];if(f<=2)it.limits.push([pj(8,y,T),1]);it._info={f:f,T:T,y:y,x:x};
  return it;
}

/* Níveis 9 a 11 — somas e subtrações de três algarismos. */
function parSomaCom3(){                             /* famílias: 1 só unidades, 2 só dezenas, 3 em cadeia; zero em 20% */
  var r=Math.random(),fam=r<.35?1:r<.65?2:3,zero=Math.random()<.2;
  return ate(function(){
    var a=rnd(100,899),b=rnd(100,899),v=vaiUm(a,b);
    if(a+b>999||v.over||v.f[1])return null;
    var ok=fam===1?(v.f[3]&&!v.f[2]):fam===2?(!v.f[3]&&v.f[2]):(v.f[3]&&v.f[2]);
    if(!ok)return null;var temZ=digs(a)[2]===0||digs(a)[3]===0||digs(b)[2]===0||digs(b)[3]===0;
    if(zero!==temZ)return null;                      /* o zero aparece em ~20% das contas, de propósito (e só nelas) */
    return {a:a,b:b,fam:fam};
  });
}
function parSomaSem3(){
  return ate(function(){var a=rnd(100,899),b=rnd(100,899),v=vaiUm(a,b);if(a+b>999||v.over||v.f.some(Boolean))return null;return {a:a,b:b}});
}
function parSubCom3(){                              /* 1 só unidades, 2 só dezenas, 3 as duas, 4 com zero no número maior */
  var r=Math.random(),fam=r<.3?1:r<.55?2:r<.75?3:4;
  return ate(function(){
    var a=rnd(100,999),b=rnd(100,a-1),f=empresta(a,b);if(f[1]||f[0])return null;
    var bu=f[3],bt=f[2];
    var zA=digs(a)[2]===0||digs(a)[3]===0,zB=digs(b)[2]===0||digs(b)[3]===0;
    if(fam<4&&(zA||zB))return null;                  /* só a família 4 tem zero no número maior */
    var ok=fam===1?(bu&&!bt):fam===2?(!bu&&bt):fam===3?(bu&&bt):((bu||bt)&&zA);
    return ok?{a:a,b:b,fam:fam}:null;
  });
}
function parSubSem3(){
  return ate(function(){var a=rnd(101,999),b=rnd(100,a-1),f=empresta(a,b);return f.some(Boolean)?null:{a:a,b:b}});
}
function gSoma3(){var p=parSomaCom3();return somaIt(p.a,p.b,[[pj(9,p.a,p.b),1]],{fam:p.fam})}
function gSub3(){var p=parSubCom3();return subIt(p.a,p.b,[],{fam:p.fam})}
function gMisto3(){
  var k=rnd(1,4),p,it;
  if(k===1){p=parSomaSem3();it=somaIt(p.a,p.b,[["n11:f1",2],[pj(11,p.a,p.b),1]],{fam:1})}
  else if(k===2){p=parSomaCom3();it=somaIt(p.a,p.b,[["n11:f2",2],[pj(11,p.a,p.b),1]],{fam:2})}
  else if(k===3){p=parSubSem3();it=subIt(p.a,p.b,[["n11:f3",2]],{fam:3})}
  else{p=parSubCom3();it=subIt(p.a,p.b,[["n11:f4",2]],{fam:4})}
  return it;
}

/* Nível 12 — Somas e subtrações com quatro algarismos (EF03MA05): 2 de cada família por folha. */
function gQuatro(){
  var k=rnd(1,4),p,it;
  if(k===1){                                         /* milhares e centenas inteiras, sem reagrupar */
    p=ate(function(){var a=100*rnd(10,89),b=100*rnd(1,89),v=vaiUm(a,b);return(a+b<=9900&&!v.over&&!v.f.some(Boolean))?{a:a,b:b}:null});
    it=somaIt(p.a,p.b,[["n12:f1",2],[pj(12,p.a,p.b),1]],{fam:1});
  }else if(k===2){                                   /* quatro algarismos, com "vai um" */
    p=ate(function(){var a=rnd(1000,8999),b=rnd(Math.random()<.5?100:1000,8999),v=vaiUm(a,b);
      return(a+b<=9999&&!v.over&&v.f.some(Boolean)&&!(a%100===0&&b%100===0))?{a:a,b:b}:null});
    it=somaIt(p.a,p.b,[["n12:f2",2],[pj(12,p.a,p.b),1]],{fam:2});
  }else if(k===3){                                   /* centenas inteiras, com empréstimo na centena */
    p=ate(function(){var a=100*rnd(10,99),b=100*rnd(1,98);return(a>b&&empresta(a,b)[1]&&!empresta(a,b)[0])?{a:a,b:b}:null});
    it=subIt(p.a,p.b,[["n12:f3",2]],{fam:3});
  }else{                                             /* quatro algarismos, com empréstimo; em 30% o número maior tem zeros */
    var zero=Math.random()<.3;
    p=ate(function(){
      var a=rnd(1000,9999);if(zero){var d=[rnd(1,9),0,0,0],i=pick([1,2,3]);d[i]=rnd(0,9)<4?0:rnd(1,9);a=junta(d);if(a<1000)return null}
      var b=rnd(100,a-1),f=empresta(a,b);
      if(!f.some(Boolean)||f[0])return null;if(zero&&(digs(a).filter(function(x,i){return i>0&&x===0}).length<2))return null;
      return {a:a,b:b};
    });
    it=subIt(p.a,p.b,[["n12:f4",2]],{fam:4,zero:zero});
  }
  return it;
}

/* Níveis 13 e 14 — Problemas de adição e subtração (EF03MA06): os seis significados, no máximo 2 de cada por folha. */
var OJ3=[["figurinha","figurinhas",1],["livro","livros",0],["bola","bolas",1],["adesivo","adesivos",0],["carrinho","carrinhos",0],["bala","balas",1],["flor","flores",1],["lápis","lápis",0]];
var OJ4=[["ingresso","ingressos",0],["página","páginas",1],["tijolo","tijolos",0],["moeda","moedas",1],["figurinha","figurinhas",1],["adesivo","adesivos",0]];
var OD3=[["figurinha","figurinhas",1],["bala","balas",1],["livro","livros",0],["adesivo","adesivos",0],["bola","bolas",1]];
var OD4=[["ingresso","ingressos",0],["moeda","moedas",1],["figurinha","figurinhas",1],["adesivo","adesivos",0]];
var OS3=[["carro","carros",0],["pássaro","pássaros",0],["balão","balões",0],["aluno","alunos",0],["peixe","peixes",0],["pintinho","pintinhos",0]];
var OS4=[["carro","carros",0],["balão","balões",0],["aluno","alunos",0],["passageiro","passageiros",0]];
function qs3(f){return f?"Quantas ":"Quantos "}
function ele3(n){return n[1]==="f"?"Ela":"Ele"}
function parProb(modo,soma,reg,zero){
  var lo=modo===13?100:1000,hi=modo===13?999:9999;
  return ate(function(){
    var a=rnd(lo,hi),b=rnd(lo,hi),f;
    if(soma){if(a+b>hi)return null;var v=vaiUm(a,b);if(v.over)return null;f=v.f.some(Boolean)}
    else{if(a<=b)return null;f=empresta(a,b).some(Boolean)}
    if(f!==reg)return null;if(modo===14&&zero!==(temZero(a)||temZero(b)))return null;
    return [a,b];
  })||(soma?[lo+247,lo+138]:[hi-111,lo+155]);
}
function gProb3(modo){
  return function(){
    var tipo=pick(["juntar","acrescentar","separar","retirar","comparar","completar"]),soma=tipo==="juntar"||tipo==="acrescentar",
      reg=Math.random()<(modo===13?.6:.5),zero=modo===14&&Math.random()<.25,pr=parProb(modo,soma,reg,zero),a=pr[0],b=pr[1],n1=pick(NAMES),n2,pre,o,resp,l=[["n"+modo+":"+tipo,2]];
    var OJ=modo===13?OJ3:OJ4,OD=modo===13?OD3:OD4,OS=modo===13?OS3:OS4;
    if(tipo==="juntar"){
      o=pick(OJ);do{n2=pick(NAMES)}while(n2[0]===n1[0]);var elas=n1[1]==="f"&&n2[1]==="f";
      pre=n1[0]+" tem "+fmt(a)+" "+o[1]+" e "+n2[0]+" tem "+fmt(b)+" "+o[1]+". "+qs3(o[2])+o[1]+" "+(elas?"elas":"eles")+" têm "+(elas?"juntas":"juntos")+"?";
      resp=a+b;l.push(["nome:"+n1[0],1],["nome:"+n2[0],1]);
    }else if(tipo==="acrescentar"){
      o=pick(OJ);pre="Havia "+fmt(a)+" "+o[1]+". Chegaram "+fmt(b)+". "+qs3(o[2])+o[1]+" há agora?";resp=a+b;
    }else if(tipo==="separar"){
      o=pick(OD);pre=n1[0]+" tinha "+fmt(a)+" "+o[1]+". "+ele3(n1)+" deu "+fmt(b)+" para um amigo. "+qs3(o[2])+o[1]+" sobraram?";resp=a-b;l.push(["nome:"+n1[0],1]);
    }else if(tipo==="retirar"){
      o=pick(OS);pre="Havia "+fmt(a)+" "+o[1]+". Foram embora "+fmt(b)+". "+qs3(o[2])+o[1]+" ficaram?";resp=a-b;
    }else if(tipo==="comparar"){
      o=pick(OJ);do{n2=pick(NAMES)}while(n2[0]===n1[0]);var mais=Math.random()<.5,quem=mais?n1:n2,outra=mais?n2:n1;
      pre=quem[0]+" tem "+fmt(a)+" "+o[1]+" e "+outra[0]+" tem "+fmt(b)+". "+qs3(o[2])+o[1]+" "+quem[0]+" tem a "+(mais?"mais":"menos")+" do que "+outra[0]+"?";
      if(!mais){pre=outra[0]+" tem "+fmt(a)+" "+o[1]+" e "+quem[0]+" tem "+fmt(b)+". "+qs3(o[2])+o[1]+" "+quem[0]+" tem a menos do que "+outra[0]+"?"}
      resp=a-b;l.push(["nome:"+n1[0],1],["nome:"+n2[0],1]);
    }else{
      o=pick(OJ);pre=n1[0]+" quer juntar "+fmt(a)+" "+o[1]+". "+ele3(n1)+" já tem "+fmt(b)+". "+qs3(o[2])+o[1]+" faltam?";resp=a-b;l.push(["nome:"+n1[0],1]);
    }
    var it=typed(pre,resp);it.key=tipo+"|"+a+"|"+b+"|"+o[0]+"|"+pre;it.limits=l;it._info={tipo:tipo,a:a,b:b,reg:reg,modo:modo};
    return it;
  };
}

/* Nível 15 — Igualdades e sentenças equivalentes (EF03MA11). */
function exprVal(a,op,b){return op==="+"?a+b:a-b}
function gIgual(){
  var r=Math.random(),it,op=Math.random()<.5?"+":MENOS,grande=Math.random()<.25,K=grande?100:1,a,b,c,d,s,t=0;
  var gera=function(){
    if(op==="+"){a=rnd(2,grande?8:50)*K;b=rnd(2,grande?8:50)*K;s=a+b;c=rnd(1,Math.floor(s/K)-1)*K;d=s-c}
    else{a=rnd(3,grande?9:60)*K;b=rnd(1,Math.floor(a/K)-1)*K;s=a-b;d=rnd(1,grande?8:40)*K;c=s+d}
  };
  do{gera()}while(((c===a&&d===b)||(c===b&&d===a)||c<=0||d<=0||s<=0||c>1000&&false)&&t++<500);
  var F=function(x,o,y){return fmt(x)+" "+o+" "+fmt(y)};
  if(r<.5){
    var pos=rnd(1,4),v=[a,b,c,d][pos-1],ans=v;
    if(pos===1)it=typed("",ans,null,op+" "+fmt(b)+" = "+F(c,op,d));
    else if(pos===2)it=typed(fmt(a)+" "+op,ans,null,"= "+F(c,op,d));
    else if(pos===3)it=typed(F(a,op,b)+" =",ans,null,op+" "+fmt(d));
    else it=typed(F(a,op,b)+" = "+fmt(c)+" "+op,ans);
    it.limits=[["n15:t1",4]];it._info={tipo:1,pos:pos};
  }else if(r<.75){                                  /* qual conta tem o mesmo resultado */
    var certa,ws=[],opts;
    certa=F(c,op,d);
    var tr=0;
    while(ws.length<2&&tr++<300){
      var e=rnd(1,2)*K*(Math.random()<.5?1:-1),tot=s+e,w;if(tot<=0)continue;
      if(op==="+"){var cc=rnd(1,Math.max(1,Math.floor(tot/K)-1))*K;if(tot-cc<=0)continue;w=F(cc,"+",tot-cc)}
      else{var dd=rnd(1,grande?8:40)*K;w=F(tot+dd,MENOS,dd)}
      if(w!==certa&&ws.indexOf(w)<0)ws.push(w);
    }
    it=choice("Qual conta tem o mesmo resultado que "+F(a,op,b)+"?",certa,ws,null);it.limits=[["n15:t2",2]];it._info={tipo:2,a:a,b:b,op:op};
  }else{                                            /* verdadeira ou falsa */
    var verd=Math.random()<.5,rhs=c,rd=d;
    if(!verd){                                      /* a falsa erra por 1 ou 2 (ou 100 e 200) no primeiro número do lado direito */
      var delta=rnd(1,2)*K,cand=[c+delta,c-delta].filter(function(x){return x>0&&(op==="+"||x>d)});rhs=pick(cand);
    }
    it=choice("A igualdade "+F(a,op,b)+" = "+F(rhs,op,rd)+" é…",verd?"verdadeira":"falsa",[verd?"falsa":"verdadeira"],null);
    it.limits=[["n15:t3",2]];it._info={tipo:3,verd:verd};
  }
  return it;
}

/* ===================== Níveis 16 a 24: multiplicação ===================== */
/* `3 × 5` lê-se "3 fileiras de 5" (ou "3 grupos de 5"); fatores trocados (7 × 6 e 6 × 7) nunca na mesma folha. */
function fato(nivel,a,b){return "pf"+nivel+":"+Math.min(a,b)+","+Math.max(a,b)}
function itArranjo(R,C,l){
  var o=pick(X.OBJ),it=typed(qs3(o.f)+o.pl+" há ao todo?",R*C,{t:"arranjo",e:o.e,r:R,c:C});
  it.key="arr|"+o.e+"|"+R+"|"+C;it.limits=l;it._info={tipo:"arranjo",r:R,c:C};return it;
}
/* Nível 16 — Tabuadas do 2, 3, 4 e 5 (fluência): conta direta (5) e fator escondido (3). */
function gTab16(){
  var k=rnd(2,5),n=rnd(2,10),esc=Math.random()<.375,dir=Math.random()<.5,it;
  if(!esc){it=typed((dir?k+" × "+n:n+" × "+k)+" =",k*n);it.limits=[["n16:dir",5],[fato(16,k,n),1]];it._info={tipo:"direta",k:k,n:n}}
  else{
    it=dir?typed(k+" ×",n,null,"= "+k*n):typed("",n,null,"× "+k+" = "+k*n);
    it.limits=[["n16:esc",3],[fato(16,k,n),1]];it._info={tipo:"escondido",k:k,n:n};
  }
  return it;
}
/* Nível 17 — Multiplicar por 10 (EF03MA07). */
function gPor10(){
  var r=Math.random(),n=Math.random()<.7?rnd(2,99):rnd(100,999),it;
  if(r<.5){
    it=typed((Math.random()<.5?"10 × "+fmt(n):fmt(n)+" × 10")+" =",n*10);it.limits=[["n17:dir",4],["pf17:"+n,1]];it._info={tipo:"direta",n:n};
  }else if(r<.75){
    it=typed("Quanto é 10 vezes "+fmt(n)+"?",n*10);it.limits=[["n17:txt",2]];it._info={tipo:"texto",n:n};
  }else{
    n=rnd(2,99);it=typed("Quantos reais há em "+n+" cédulas de 10 reais?",n*10);it.limits=[["n17:din",2]];it._info={tipo:"dinheiro",n:n};
  }
  return it;
}
/* Nível 18 — Disposição retangular (EF03MA07). */
var SALAS=[["A sala tem","cadeiras",1],["O pomar tem","árvores",1],["A estante tem","livros",0],["A caixa tem","ovos",0]];
function gArranjo(){
  var r=Math.random(),R,C,it;
  do{R=rnd(2,9);C=rnd(2,10)}while(R===2&&C===2);
  if(r<.5){it=itArranjo(R,C,[["n18:t1",4]])}
  else if(r<.75){
    while(R===C)C=rnd(2,10);                        /* em arranjo quadrado as opções erradas se repetiriam */
    var cand=[[R+C,R+" + "+C],[2*C,C+" + "+C],[R*R,R+" × "+R],[C*C,C+" × "+C],[2*R,R+" + "+R]].filter(function(x){return x[0]!==R*C}),ws=[];
    embaralhar(cand).forEach(function(x){if(ws.length<2&&ws.indexOf(x[1])<0&&x[1]!==R+" × "+C)ws.push(x[1])});
    var o=pick(X.OBJ);
    it=choice("Qual conta mostra quantos há ao todo?",R+" × "+C,ws,{t:"arranjo",e:o.e,r:R,c:C});it.key="arrconta|"+o.e+"|"+R+"|"+C;it.limits=[["n18:t2",2]];it._info={tipo:"conta",r:R,c:C};
  }else{
    var sc=pick(SALAS);
    it=typed(sc[0]+" "+R+" fileiras de "+C+" "+sc[1]+". "+qs3(sc[2])+sc[1]+" há?",R*C);it.limits=[["n18:t3",2],["o18:"+sc[1],1]];it._info={tipo:"texto",r:R,c:C};
  }
  return it;
}
/* Níveis 19 a 22 — uma tabuada nova por nível: em média 3 diretas, 2 com o fator escondido, 2 com a figura e 1 por texto
   (os limites por folha são um pouco folgados, porque só há 9 fatos para 8 contas e o fato não pode se repetir). */
function gTabK(k,nivel){
  return function(){
    var n=rnd(2,10),r=Math.random(),it,fk=[fato(nivel,k,n),1];
    if(r<.375){
      it=typed((Math.random()<.5?k+" × "+n:n+" × "+k)+" =",k*n);it.limits=[["n"+nivel+":dir",4],fk];it._info={tipo:"direta",k:k,n:n};
    }else if(r<.625){
      it=Math.random()<.5?typed(k+" ×",n,null,"= "+k*n):typed("",n,null,"× "+k+" = "+k*n);it.limits=[["n"+nivel+":esc",3],fk];it._info={tipo:"escondido",k:k,n:n};
    }else if(r<.875){
      var rows=Math.random()<.5;it=itArranjo(rows?k:n,rows?n:k,[["n"+nivel+":fig",3],fk]);it._info.k=k;it._info.n=n;
    }else{
      it=typed("Quanto é "+k+" vezes "+n+"?",k*n);it.limits=[["n"+nivel+":txt",2],fk];it._info={tipo:"texto",k:k,n:n};
    }
    return it;
  };
}
/* Nível 23 — Todas as tabuadas misturadas: as do 6 ao 9 pesam o dobro. 4 diretas, 2 com o fator escondido e 2 com a figura. */
function gTodas(){
  var k=pick([2,3,4,5,6,6,7,7,8,8,9,9]),n=rnd(2,10),r=Math.random(),it,fk=[fato(23,k,n),1];
  if(r<.5){it=typed((Math.random()<.5?k+" × "+n:n+" × "+k)+" =",k*n);it.limits=[["n23:dir",4],fk];it._info={tipo:"direta",k:k,n:n}}
  else if(r<.75){it=Math.random()<.5?typed(k+" ×",n,null,"= "+k*n):typed("",n,null,"× "+k+" = "+k*n);it.limits=[["n23:esc",2],fk];it._info={tipo:"escondido",k:k,n:n}}
  else{var rows=Math.random()<.5;it=itArranjo(rows?k:n,rows?n:k,[["n23:fig",2],fk]);it._info.k=k;it._info.n=n}
  return it;
}
/* Nível 24 — Problemas de multiplicação (EF03MA07): parcelas iguais (3), disposição retangular (2), compra (2) e por 10 (1). */
var RECIP3=[["caixa","caixas"],["pacote","pacotes"],["saco","sacos"],["cesta","cestas"],["prato","pratos"],["estante","estantes"]];
var OIT3=[["lápis",0],["figurinhas",1],["balas",1],["livros",0],["adesivos",0],["flores",1]];
var COMPRA=[["caderno","cadernos","Um"],["borracha","borrachas","Uma"],["livro","livros","Um"],["bola","bolas","Uma"],["camiseta","camisetas","Uma"],["boneca","bonecas","Uma"]];
var FIL=[["O pátio tem","cadeiras",1],["O pomar tem","árvores",1],["A estante tem","livros",0],["A caixa tem","ovos",0]];
function gProbMult(){
  var r=Math.random(),it,k=rnd(2,10),n=rnd(2,10),rc,o;
  if(r<.375){
    rc=pick(RECIP3);o=pick(OIT3);
    it=typed("Cada "+rc[0]+" tem "+k+" "+o[0]+". "+qs3(o[1])+o[0]+" há em "+n+" "+rc[1]+"?",k*n);it.limits=[["n24:t1",3],["o24a:"+o[0],1]];it._info={tipo:"parcelas",k:k,n:n};
  }else if(r<.625){
    var sc=pick(FIL);
    it=typed(sc[0]+" "+n+" fileiras com "+k+" "+sc[1]+" em cada uma. "+qs3(sc[2])+sc[1]+" há?",k*n);it.limits=[["n24:t2",2],["o24b:"+sc[1],1]];it._info={tipo:"fileiras",k:k,n:n};
  }else if(r<.875){
    var c=pick(COMPRA);
    it=typed(c[2]+" "+c[0]+" custa "+k+" reais. Quanto custam "+n+" "+c[1]+"?",k*n,null,"reais");it.limits=[["n24:t3",2],["o24c:"+c[1],1]];it._info={tipo:"compra",k:k,n:n};
  }else{
    rc=pick(RECIP3);o=pick(OIT3);n=rnd(11,99);
    it=typed("Cada "+rc[0]+" tem 10 "+o[0]+". "+qs3(o[1])+o[0]+" há em "+n+" "+rc[1]+"?",10*n);it.limits=[["n24:t4",1],["o24a:"+o[0],1]];it._info={tipo:"por10",k:10,n:n};
  }
  return it;
}

/* ===================== Níveis 25 a 33: divisão e geometria ===================== */
var DIV="÷";
var OIT2=[["figurinhas",1],["balas",1],["livros",0],["adesivos",0],["bolas",1],["lápis",0]];
function cap(t){return t.charAt(0).toUpperCase()+t.slice(1)}

/* Nível 25 — Repartir em partes iguais (EF03MA08): repartição com figura (4), medida com figura (2) e por texto (2).
   Com figura o dividendo vai até 30 (objetos em fileiras de 5, fáceis de contar); só no texto vai até 50. */
function gRepartir(){
  var r=Math.random(),it,o,d,q,n;
  if(r<.5){
    do{d=rnd(2,5);q=rnd(2,10);n=d*q}while(n>30);o=pick(X.OBJ);
    it=typed("Divida igualmente "+(o.f?"as ":"os ")+n+" "+o.pl+" em "+d+" pratos. "+qs3(o.f)+o.pl+" ficam em cada prato?",q,{t:"reparte",e:o.e,n:n,g:d,per:5});
    it.key="rep25|"+o.e+"|"+d+"|"+q;it.limits=[["n25:t1",4]];it._info={tipo:"reparte",n:n,d:d,q:q};
  }else if(r<.75){
    var k,m;do{k=rnd(2,5);m=rnd(2,10);n=k*m}while(n>30);o=pick(X.OBJ);
    it=typed("Há "+n+" "+o.pl+". Cada prato recebe "+k+". Quantos pratos são necessários?",m,{t:"reparte",e:o.e,n:n,g:0,per:5});
    it.key="med25|"+o.e+"|"+k+"|"+m;it.limits=[["n25:t2",2]];it._info={tipo:"medida",n:n,k:k,m:m};
  }else{
    do{d=rnd(2,5);q=rnd(2,10);n=d*q}while(n>50);var ob=pick(OIT2);
    it=typed("Reparta "+n+" "+ob[0]+" igualmente entre "+d+" amigos. "+qs3(ob[1])+ob[0]+" cada um recebe?",q);
    it.limits=[["n25:t3",2],["o25:"+ob[0],1]];it._info={tipo:"texto",n:n,d:d,q:q};
  }
  return it;
}

/* Nível 26 — A divisão como inverso da multiplicação (EF03MA08): direta (4), dividendo escondido (2) e pela multiplicação (2). */
function gDivInv(){
  var d=rnd(2,10),q=rnd(2,10),n=d*q,r=Math.random(),it,fk=["pf26:"+Math.min(d,q)+","+Math.max(d,q),1];
  if(r<.5){it=typed(n+" "+DIV+" "+d+" =",q);it.limits=[["n26:dir",4],fk];it._info={tipo:"direta",n:n,d:d,q:q}}
  else if(r<.75){it=typed("",n,null,DIV+" "+d+" = "+q);it.limits=[["n26:esc",2],fk];it._info={tipo:"escondido",n:n,d:d,q:q}}
  else{var w=Math.random()<.5;it=typed(d+" × "+q+" = "+n+", então "+n+" "+DIV+" "+(w?d:q)+" =",w?q:d);it.limits=[["n26:inv",2],fk];it._info={tipo:"inverso",n:n,d:d,q:q}}
  return it;
}

/* Nível 27 — Divisão com resto (EF03MA08): o quociente (3), o resto (3) e a verificação (2).
   Primeiro contato com o resto: divisor de 2 a 5, quociente de 2 a 8, dividendo até 40; a figura só aparece até 30 objetos. */
var RECIP27=[["pacotes","pacote",0],["caixas","caixa",1],["sacos","saco",0]];
function gResto(){
  var d,q,rr,n,t=0;
  do{d=rnd(2,5);q=rnd(2,8);rr=rnd(1,d-1);n=d*q+rr}while((n>40||n<5)&&t++<200);
  var r=Math.random(),o=pick(X.OBJ),rc=pick(RECIP27),it;
  if(r<.375){
    it=typed("Com "+n+" "+o.pl+", "+(rc[2]?"quantas ":"quantos ")+rc[0]+" de "+d+" "+o.pl+" dá para encher?",q,n<=30?{t:"reparte",e:o.e,n:n,g:0,per:5}:null);it.limits=[["n27:t1",3]];it._info={tipo:"quociente",n:n,d:d,q:q,r:rr};
  }else if(r<.75){
    it=typed("Com "+n+" "+o.pl+", enchendo "+rc[0]+" de "+d+", "+qs3(o.f).toLowerCase()+o.pl+" sobram?",rr);it.limits=[["n27:t2",3]];it._info={tipo:"resto",n:n,d:d,q:q,r:rr};
  }else{
    it=typed(n+" "+DIV+" "+d+" dá "+q+" e sobram "+rr+". Quanto vale "+d+" × "+q+" + "+rr+"?",n);it.limits=[["n27:t3",2]];it._info={tipo:"verificacao",n:n,d:d,q:q,r:rr};
  }
  it.key=it._info.tipo+"|"+n+"|"+d+"|"+(o.e);
  return it;
}

/* Nível 28 — Metade, terça, quarta, quinta e décima partes (EF03MA09). */
var PARTES=[[2,"a metade"],[3,"a terça parte"],[4,"a quarta parte"],[5,"a quinta parte"],[10,"a décima parte"]];
function gPartes(){
  var pt=pick(PARTES),d=pt[0],q=d===10?rnd(1,10):rnd(2,10),todo=d*q,r=Math.random(),it;
  if(r<.5){it=typed("Qual é "+pt[1]+" de "+todo+"?",q);it.limits=[["n28:t1",4]];it._info={tipo:"parte",d:d,q:q,todo:todo}}
  else if(r<.75){it=typed(cap(pt[1])+" de um número é "+q+". Que número é esse?",todo);it.limits=[["n28:t2",2]];it._info={tipo:"todo",d:d,q:q,todo:todo}}
  else{
    var n1=pick(NAMES),o=pick(OIT2);
    it=typed(n1[0]+" tem "+todo+" "+o[0]+" e deu "+pt[1]+" para o irmão. "+qs3(o[1])+o[0]+" "+(n1[1]==="f"?"ela":"ele")+" deu?",q);
    it.limits=[["n28:t3",2],["nome:"+n1[0],1]];it._info={tipo:"situacao",d:d,q:q,todo:todo};
  }
  return it;
}

/* Nível 29 — Problemas de divisão (EF03MA08): repartição (3), medida (3) e com resto (2). */
var REC29=[["pacote","pacotes",0],["caixa","caixas",1],["saco","sacos",0],["cesta","cestas",1]];
function gProbDiv(){
  var r=Math.random(),it,o=pick(OIT2),d=rnd(2,10),q=rnd(2,10),n1=pick(NAMES);
  if(r<.375){
    it=typed(n1[0]+" tem "+d*q+" "+o[0]+" e quer repartir igualmente entre "+d+" amigos. "+qs3(o[1])+o[0]+" cada um recebe?",q);
    it.limits=[["n29:t1",3],["o29:"+o[0],2],["nome:"+n1[0],1]];it._info={tipo:"reparticao",d:d,q:q};
  }else if(r<.75){
    var rc=pick(REC29);
    it=typed((rc[2]?"Quantas ":"Quantos ")+rc[1]+" de "+d+" "+o[0]+" se formam com "+d*q+" "+o[0]+"?",q);
    it.limits=[["n29:t2",3],["o29:"+o[0],2]];it._info={tipo:"medida",d:d,q:q};
  }else{
    d=rnd(2,9);q=rnd(2,9);var rr=rnd(1,d-1),n=d*q+rr,rc2=pick(REC29);
    if(Math.random()<.5)it=typed("Com "+n+" "+o[0]+", "+(rc2[2]?"quantas ":"quantos ")+rc2[1]+" de "+d+" "+o[0]+" dá para encher?",q);
    else it=typed("Com "+n+" "+o[0]+", enchendo "+rc2[1]+" de "+d+", "+qs3(o[1]).toLowerCase()+o[0]+" sobram?",rr);
    it.limits=[["n29:t3",2],["o29:"+o[0],2]];it._info={tipo:"resto",d:d,q:q,r:rr,n:n};
  }
  return it;
}

/* Nível 30 — Problemas com as quatro operações (EF03MA06, EF03MA07, EF03MA08): 2 problemas de cada operação. */
var OJ30=[["figurinhas",1],["livros",0],["bolas",1],["adesivos",0],["balas",1],["flores",1]];
var OS30=[["carros",0],["pássaros",0],["balões",0],["alunos",0],["peixes",0]];
var REC30=[["caixa","caixas"],["pacote","pacotes"],["saco","sacos"],["cesta","cestas"]];
function gQuatroOp(){
  var op=rnd(1,4),it,n1=pick(NAMES),a,b,o;
  if(op===1){
    do{a=rnd(100,899);b=rnd(100,899)}while(a+b>999);o=pick(OJ30);
    it=typed(n1[0]+" tem "+a+" "+o[0]+" e ganhou mais "+b+". "+qs3(o[1])+o[0]+" "+(n1[1]==="f"?"ela":"ele")+" tem agora?",a+b);it.limits=[["n30:soma",2],["nome:"+n1[0],1]];it._info={op:"soma",a:a,b:b};
  }else if(op===2){
    do{a=rnd(100,999);b=rnd(100,999)}while(a<=b);o=pick(OS30);
    it=typed("Havia "+a+" "+o[0]+" e foram embora "+b+". "+qs3(o[1])+o[0]+" ficaram?",a-b);it.limits=[["n30:subtracao",2]];it._info={op:"subtracao",a:a,b:b};
  }else if(op===3){
    a=rnd(2,10);b=rnd(2,10);var rc=pick(REC30);o=pick(OJ30);
    it=typed("Cada "+rc[0]+" tem "+a+" "+o[0]+". "+qs3(o[1])+o[0]+" há em "+b+" "+rc[1]+"?",a*b);it.limits=[["n30:multiplicacao",2],["o30:"+o[0],1]];it._info={op:"multiplicacao",a:a,b:b};
  }else{
    a=rnd(2,10);b=rnd(2,10);o=pick(OJ30);
    it=typed("Reparta "+a*b+" "+o[0]+" igualmente entre "+a+" amigos. "+qs3(o[1])+o[0]+" cada um recebe?",b);it.limits=[["n30:divisao",2],["o30:"+o[0],1]];it._info={op:"divisao",a:a,b:b};
  }
  return it;
}

/* Nível 31 — Sólidos e planificações (EF03MA13, EF03MA14). */
var SOL31=[["cubo-a","cubo"],["cubo-b","cubo"],["bloco","bloco retangular"],["piramide","pirâmide"],["cilindro","cilindro"],["cone","cone"]];
function opcoes31(certa){
  var todos=["cubo","bloco retangular","pirâmide","cilindro","cone"],out=[certa];
  embaralhar(todos.filter(function(x){return x!==certa})).forEach(function(x){
    var par=x==="cubo"?"bloco retangular":x==="bloco retangular"?"cubo":null;
    if(out.length<4&&!(par&&out.indexOf(par)>=0))out.push(x);
  });
  return out.slice(1);
}
var FACES31=[["um cubo",6,"cubo"],["um bloco retangular",6,"bloco retangular"],["uma pirâmide de base quadrada",5,"pirâmide"]];
var APAR=[["o cubo","seis quadrados","cubo"],["o bloco retangular","seis retângulos","bloco retangular"],["a pirâmide de base quadrada","um quadrado e quatro triângulos","pirâmide"],["o cilindro","dois círculos e um retângulo","cilindro"]];
function gPlanif(){
  var r=Math.random(),it;
  if(r<.5){
    var s=pick(SOL31);it=choice("Qual sólido tem esta planificação?",s[1],opcoes31(s[1]),{t:"planif",n:s[0]});it.key="pl31|"+s[0];it.limits=[["n31:t1",5]];it._info={tipo:"nome",n:s[0],certa:s[1]};
  }else if(r<.75){
    var f=pick(FACES31);it=typed("Quantas faces tem "+f[0]+"?",f[1]);it.limits=[["n31:t2",3]];it._info={tipo:"faces",n:f[2]};
  }else{
    var a=pick(APAR),erradas=APAR.filter(function(x){return x!==a&&!(a[2]==="cubo"&&x[2]==="bloco retangular")&&!(a[2]==="bloco retangular"&&x[2]==="cubo")});
    var ws=embaralhar(erradas).slice(0,2).map(function(x){return x[1]});
    it=choice("Na planificação d"+(a[0].charAt(0)==="o"?"o ":"a ")+a[0].replace(/^(o|a) /,"")+" aparecem…",a[1],ws,null);it.key="ap31|"+a[2];it.limits=[["n31:t3",3]];it._info={tipo:"aparecem",n:a[2]};
  }
  return it;
}

/* Nível 32 — Figuras planas: trapézio e paralelogramo (EF03MA15). */
var PL32=["triângulo","quadrado","retângulo","trapézio","paralelogramo"];
var CONFL32={"quadrado":["retângulo","paralelogramo"],"retângulo":["quadrado","paralelogramo"],"paralelogramo":["quadrado","retângulo"],"triângulo":[],"trapézio":[]};
function figPlana(n,cor){
  if(n==="trapézio"||n==="paralelogramo")return {t:"shape",n:n,color:cor};
  var f={t:"forma",n:n,color:cor};
  if(n==="retângulo"){f.o=pick(["h","v"]);f.r=+(1.4+Math.random()*1.1).toFixed(2)}
  if(n==="triângulo"){f.v=rnd(0,4);f.rot=pick([0,90,180,270])}
  return f;
}
var PARES={"triângulo":0,"trapézio":1,"quadrado":2,"retângulo":2,"paralelogramo":2};
function gPlanas3(){
  var r=Math.random(),cor=pick(["#2457D6","#FFB92B","#F27AB0","#1CA97B"]),it,n;
  if(r<.375){
    n=pick(PL32);var wr=embaralhar(PL32.filter(function(x){return x!==n&&CONFL32[n].indexOf(x)<0})).slice(0,3),f=figPlana(n,cor);
    it=choice("Como se chama esta figura?",n,wr,f);it.key="n32|"+n+"|"+JSON.stringify(f);it.limits=[["n32:t1",3]];it._info={tipo:"nome",n:n};
  }else if(r<.75){
    var q=pick([["Qual figura tem só um par de lados paralelos?","trapézio"],["Qual figura tem quatro lados iguais e quatro ângulos retos?","quadrado"],["Qual figura tem dois pares de lados paralelos e nenhum ângulo reto?","paralelogramo"],["Qual figura tem 3 vértices?","triângulo"]]);
    var outros=embaralhar(PL32.filter(function(x){return x!==q[1]&&CONFL32[q[1]].indexOf(x)<0})).slice(0,rnd(2,3));
    it=choice(q[0],{fig:figPlana(q[1],cor)},outros.map(function(x){return {fig:figPlana(x,cor)}}),null);it.key="q32|"+q[0]+"|"+outros.join(",");it.limits=[["n32:t2",3]];it._info={tipo:"qual",n:q[1]};
  }else{
    n=pick(PL32);it=typed("Quantos pares de lados paralelos tem esta figura?",PARES[n],figPlana(n,cor));it.key="p32|"+n+"|"+JSON.stringify(it.extra.fig);it.limits=[["n32:t3",2]];it._info={tipo:"pares",n:n};
  }
  return it;
}

/* Nível 33 — Figuras congruentes na malha (EF03MA16): só rotação e deslocamento, nunca espelho. */
function normCells(c){var mx=Math.min.apply(null,c.map(function(x){return x[0]})),my=Math.min.apply(null,c.map(function(x){return x[1]}));return c.map(function(x){return [x[0]-mx,x[1]-my]}).sort(function(a,b){return a[0]-b[0]||a[1]-b[1]})}
function chaveCells(c){return normCells(c).map(function(x){return x.join(",")}).join(";")}
function giraCells(c){return c.map(function(x){return [-x[1],x[0]]})}
function espelhaCells(c){return c.map(function(x){return [-x[0],x[1]]})}
function orientacoes(c,espelho){var out=[],cur=c,i;for(i=0;i<4;i++){out.push(chaveCells(cur));cur=giraCells(cur)}if(espelho){cur=espelhaCells(c);for(i=0;i<4;i++){out.push(chaveCells(cur));cur=giraCells(cur)}}return out}
function caixa(c){var n=normCells(c);return [Math.max.apply(null,n.map(function(x){return x[0]}))+1,Math.max.apply(null,n.map(function(x){return x[1]}))+1]}
function conexa(c){
  var set={},i;c.forEach(function(x){set[x.join(",")]=1});var vis={},pilha=[c[0]];vis[c[0].join(",")]=1;
  while(pilha.length){var p=pilha.pop();[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var k=(p[0]+d[0])+","+(p[1]+d[1]);if(set[k]&&!vis[k]){vis[k]=1;pilha.push([p[0]+d[0],p[1]+d[1]])}})}
  return Object.keys(vis).length===c.length;
}
function poliomino(n){
  var t=0;
  while(t++<500){
    var c=[[rnd(0,3),rnd(0,3)]],g=0;
    while(c.length<n&&g++<200){var b=pick(c),d=pick([[1,0],[-1,0],[0,1],[0,-1]]),x=b[0]+d[0],y=b[1]+d[1];
      if(x>=0&&x<=3&&y>=0&&y<=3&&!c.some(function(q){return q[0]===x&&q[1]===y}))c.push([x,y])}
    if(c.length===n){var bx=caixa(c);if(bx[0]<=4&&bx[1]<=4)return normCells(c)}
  }
  return [[0,0],[1,0],[1,1],[2,1]];
}
function trocaUma(c){                                  /* tira um quadradinho e põe outro em outro lugar: mesma área, forma diferente */
  var t=0,base=orientacoes(c,true);
  while(t++<400){
    var i=rnd(0,c.length-1),resto=c.filter(function(x,k){return k!==i}),b=pick(resto),d=pick([[1,0],[-1,0],[0,1],[0,-1]]),x=b[0]+d[0],y=b[1]+d[1];
    if(x<0||y<0||x>5||y>5||resto.some(function(q){return q[0]===x&&q[1]===y})||(x===c[i][0]&&y===c[i][1]))continue;
    var novo=resto.concat([[x,y]]);if(!conexa(novo))continue;var bx=caixa(novo);if(bx[0]>4||bx[1]>4)continue;
    if(base.indexOf(chaveCells(novo))>=0)continue;
    return normCells(novo);
  }
  return null;
}
function centraCells(c){var b=caixa(c),ox=Math.floor((5-b[0])/2),oy=Math.floor((5-b[1])/2);return normCells(c).map(function(x){return [x[0]+ox,x[1]+oy]})}
function gonga(c){var k=rnd(0,3),cur=c,i;for(i=0;i<k;i++)cur=giraCells(cur);return cur}
function gCongruente(){
  var n=rnd(4,6),base=poliomino(n),cor=pick(["#2457D6","#FFB92B","#F27AB0","#1CA97B"]),it;
  var fig=function(c){return {t:"malha2",shapes:[{cells:centraCells(c),color:cor}]}};
  if(Math.random()<.625){
    var igual=gonga(base),erradas=[],t=0;
    while(erradas.length<2&&t++<100){var e=trocaUma(base);if(e&&erradas.every(function(x){return chaveCells(x)!==chaveCells(e)&&orientacoes(x,true).indexOf(chaveCells(e))<0}))erradas.push(e)}
    if(erradas.length<2)return gCongruente();
    var A={t:"malha2",labels:true,shapes:[{cells:centraCells(base),color:cor}]};
    it=choice("Qual figura é congruente à figura A?",{fig:fig(igual)},erradas.map(function(e){return {fig:fig(e)}}),A);
    it.limits=[["n33:t1",5]];it._info={tipo:"qual",base:base,n:n};
  }else{
    var sim=Math.random()<.5,B=sim?gonga(base):trocaUma(base);if(!B)return gCongruente();
    var F={t:"malha2",labels:true,shapes:[{cells:centraCells(base),color:cor},{cells:centraCells(B),color:"#8FB0FF"}]};
    it=choice("Estas figuras são congruentes?",sim?"sim":"não",[sim?"não":"sim"],F);it.limits=[["n33:t2",3]];it._info={tipo:"sim",sim:sim,base:base,B:B,n:n};
  }
  it.key="cg33|"+chaveCells(base)+"|"+it._info.tipo+"|"+JSON.stringify(it.extra.opts);
  return it;
}

/* ===================== Níveis 34 a 42: medidas, dinheiro, acaso e dados ===================== */
function hhmm(h,m){return h+":"+(m<10?"0":"")+m}
function min24(t){return hhmm(Math.floor(t/60),t%60)}

/* Nível 34 — Medir com a régua: centímetro e milímetro (EF03MA19). */
var OB34={lapis:["lápis","o"],fita:["fita","a"],clipe:["clipe","o"],borracha:["borracha","a"]},KOB34=Object.keys(OB34);
function gRegua34(){
  var r=Math.random(),it,k;
  if(r<.5){
    k=pick(KOB34);var mm=rnd(15,98);
    it=typed("Quanto mede "+OB34[k][1]+" "+OB34[k][0]+"?",mm,{t:"regua2",objs:[{k:k,mm:mm}]},"mm");it.limits=[["n34:t1",4]];it._info={tipo:"medir",k:k,mm:mm};
  }else if(r<.75){
    k=pick(KOB34);var cm=rnd(1,9),m=rnd(1,9);
    it=typed(cap(OB34[k][1]+" "+OB34[k][0])+" mede "+cm+" cm e "+m+" mm. Quantos milímetros "+(OB34[k][1]==="a"?"ela":"ele")+" mede?",cm*10+m,null,"mm");it.limits=[["n34:t2",2]];it._info={tipo:"cm_mm",cm:cm,mm:m};
  }else{
    var c,mm2;do{c=rnd(2,9);mm2=rnd(15,95)}while(Math.abs(10*c-mm2)<3);
    var a=c+" cm",b=mm2+" mm",maior=10*c>mm2?a:b,menor=maior===a?b:a;
    it=choice("Qual é maior: "+(Math.random()<.5?a+" ou "+b:b+" ou "+a)+"?",maior,[menor],null);it.key="cmp34|"+c+"|"+mm2;it.limits=[["n34:t3",2]];it._info={tipo:"comparar",cm:c,mm:mm2};
  }
  return it;
}

/* Nível 35 — A unidade e o instrumento certos (EF03MA17, EF03MA18). */
var UC35=[["a formiga","milímetro"],["um grão de arroz","milímetro"],["uma sala de aula","metro"],["o corredor da escola","metro"],["o pátio da escola","metro"],["uma quadra de esportes","metro"],["uma rua","quilômetro"],["uma estrada entre duas cidades","quilômetro"]];
var INS35=[["o tempo que dura o recreio","relógio"],["o comprimento da lousa","fita métrica"],["o comprimento de um lápis","régua"],["a quantidade de suco que cabe numa jarra","copo medidor"],["a massa de uma melancia","balança"]];
var DEP35=[["Medimos o mesmo corredor com passos grandes e com passos pequenos. Com qual passo o número de passos é maior?","pequenos","grandes"],
  ["Medimos a mesma mesa em palmos e em metros. Em qual unidade o número é maior?","palmos","metros"],
  ["Enchemos a mesma jarra com um copo grande e com um copo pequeno. Com qual copo usamos mais copos?","pequeno","grande"]];
function gUnidInstr(){
  var r=Math.random(),it;
  if(r<.375){
    var u=pick(UC35);
    it=choice("Qual unidade é melhor para medir o comprimento "+(/^(o|a) /.test(u[0])?"d"+u[0].charAt(0)+" "+u[0].slice(2):"de "+u[0])+"?",u[1],["milímetro","metro","quilômetro"].filter(function(x){return x!==u[1]}),null);
    it.key="u35|"+u[0];it.limits=[["n35:t1",3]];it._info={tipo:"unidade",obj:u[0],certa:u[1]};
  }else if(r<.75){
    var q=pick(INS35),todos=["régua","fita métrica","relógio","copo medidor","balança"].filter(function(x){return x!==q[1]&&!(q[1]==="régua"&&x==="fita métrica")&&!(q[1]==="fita métrica"&&x==="régua")});
    it=choice("Que instrumento usamos para medir "+q[0]+"?",q[1],embaralhar(todos).slice(0,2),null);it.key="i35|"+q[0];it.limits=[["n35:t2",3]];it._info={tipo:"instrumento",obj:q[0],certa:q[1]};
  }else{
    var d=pick(DEP35);it=choice(d[0],d[1],[d[2]],null);it.key="d35|"+d[0];it.limits=[["n35:t3",2]];it._info={tipo:"depende",certa:d[1]};
  }
  return it;
}

/* Nível 36 — Capacidade e massa (EF03MA20): unidade, soma na mesma unidade e comparação. Sem conversão. */
var UN36=[["massa",["quilograma","grama","miligrama"],[["uma pessoa",0],["um saco de arroz",0],["uma melancia",0],["uma moeda",1],["um clipe",1],["uma folha de papel",1],["um comprimido de remédio",2],["um grão de areia",2]]],
  ["capacidade",["litro","mililitro"],[["uma piscina",0],["uma caixa-d'água",0],["um balde",0],["uma colher de remédio",1],["uma colher de chá",1],["um frasco de colírio",1],["uma xícara de café",1]]]];
var SOMA36=[["Um pacote de arroz tem {A} quilogramas e outro tem {B} quilogramas. Quantos quilogramas há nos dois?",2,9,1],["Uma garrafa tem {A} litros e outra tem {B} litros. Quantos litros há nas duas?",2,9,1],
  ["Um pacote de farinha tem {A} gramas e outro tem {B} gramas. Quantos gramas há nos dois?",100,900,100],["Um copo tem {A} mililitros de suco e outro tem {B} mililitros. Quantos mililitros há nos dois?",100,900,100]];
function gCapMassa(){
  var r=Math.random(),it;
  if(r<.375){
    var g=pick(UN36),o=pick(g[2]);
    it=choice("Qual unidade é melhor para medir a "+g[0]+" de "+o[0]+"?",g[1][o[1]],g[1].filter(function(x,i){return i!==o[1]}),null);it.key="u36|"+g[0]+"|"+o[0];it.limits=[["n36:t1",3]];it._info={tipo:"unidade",g:g[0],obj:o[0],certa:g[1][o[1]]};
  }else if(r<.75){
    var t=pick(SOMA36),a,b,tt=0;do{a=rnd(t[1]/t[3],t[2]/t[3])*t[3];b=rnd(t[1]/t[3],t[2]/t[3])*t[3]}while(a+b>(t[3]===100?1000:99)&&tt++<500);
    it=typed(t[0].replace("{A}",a).replace("{B}",b),a+b);it.limits=[["n36:t2",3]];it._info={tipo:"soma",a:a,b:b};
  }else{
    var cap2=Math.random()<.5,peq=Math.random()<.5,mais=Math.random()<.5,x,y;
    do{x=peq?rnd(1,9)*100:rnd(2,9);y=peq?rnd(1,9)*100:rnd(2,9)}while(x===y);
    var un=cap2?(peq?"mililitros":"litros"):(peq?"gramas":"quilogramas"),ux=x+" "+un,uy=y+" "+un,maior=x>y?ux:uy,menor=x>y?uy:ux;
    var q2=cap2?(mais?"Qual tem mais água":"Qual tem menos água"):(mais?"Qual é mais pesado":"Qual é mais leve");
    it=choice(q2+": "+ux+" ou "+uy+"?",mais?maior:menor,[mais?menor:maior],null);it.key="c36|"+x+"|"+y+"|"+un+"|"+mais;it.limits=[["n36:t3",2]];it._info={tipo:"comparar",cap:cap2,mais:mais,x:x,y:y,un:un};
  }
  return it;
}

/* Nível 37 — Comparar áreas na malha (EF03MA21). */
function poliomino5(k){
  var t=0;
  while(t++<500){
    var c=[[rnd(0,4),rnd(0,4)]],g=0;
    while(c.length<k&&g++<400){var b=pick(c),d=pick([[1,0],[-1,0],[0,1],[0,-1]]),x=b[0]+d[0],y=b[1]+d[1];if(x>=0&&x<=4&&y>=0&&y<=4&&!c.some(function(q){return q[0]===x&&q[1]===y}))c.push([x,y])}
    if(c.length===k)return c;
  }
  var base=[];for(var i=0;i<k;i++)base.push([i%5,Math.floor(i/5)]);return base;
}
function figArea(c,cor){return {t:"malha2",shapes:[{cells:c,color:cor}]}}
function gAreas(){
  var r=Math.random(),cor=pick(["#2457D6","#FFB92B","#F27AB0","#1CA97B"]),it;
  if(r<.75){
    var mais=r<.5,n=rnd(2,3),as=[],t=0;
    while(as.length<n&&t++<500){var a=rnd(4,12);if(as.every(function(x){return Math.abs(x-a)>=2}))as.push(a)}
    var fs=as.map(function(a){return {cells:poliomino5(a),area:a}}),alvo=mais?Math.max.apply(null,as):Math.min.apply(null,as),cert=fs.filter(function(f){return f.area===alvo})[0];
    it=choice("Qual figura ocupa "+(mais?"mais":"menos")+" espaço?",{fig:figArea(cert.cells,cor)},fs.filter(function(f){return f!==cert}).map(function(f){return {fig:figArea(f.cells,cor)}}),null);
    it.key="a37|"+(mais?"+":"-")+"|"+fs.map(function(f){return f.cells.map(function(c){return c.join(",")}).join(";")}).join("|");it.limits=[["n37:"+(mais?"t1":"t2"),mais?4:2]];it._info={tipo:mais?"mais":"menos",areas:as};
  }else{
    var igual=Math.random()<.5,k=igual?rnd(4,10):rnd(6,10),A=poliomino5(k),B,k2=igual?k:k+pick([-2,-1,1,2]);   /* "não": difere em 1 ou 2 quadradinhos, sempre de 4 a 12 */
    var ch=function(c){return normCells(c).map(function(x){return x.join(",")}).join(";")},tt=0;
    do{B=poliomino5(k2)}while(igual&&orientacoes(A,true).indexOf(chaveCells(B))>=0&&tt++<200);
    var F={t:"malha2",labels:true,shapes:[{cells:A,color:cor},{cells:B,color:"#8FB0FF"}]};
    it=choice("As duas figuras ocupam o mesmo espaço?",igual?"sim":"não",[igual?"não":"sim"],F);it.key="s37|"+igual+"|"+ch(A)+"|"+ch(B);it.limits=[["n37:t3",2]];it._info={tipo:"mesma",igual:igual,ka:A.length,kb:B.length};
  }
  return it;
}

/* Nível 38 — Relógio: horas, minutos e segundos (EF03MA23). */
var REL38=[["Quantos minutos tem 1 hora?",60],["Quantos segundos tem 1 minuto?",60],["Quantos minutos tem meia hora?",30],["Quantos minutos têm 2 horas?",120]];
function gRelogio38(){
  var r=Math.random(),it,h=rnd(1,12),m=5*rnd(0,11),good=hhmm(h,m);
  if(r<.5){
    var pool=[hhmm(h%12+1,m),hhmm(((h+10)%12)+1,m),hhmm(h,m===0?30:(m+15)%60),hhmm(h,(m+55)%60)];
    if(m!==0)pool.push(hhmm(m/5,(h*5)%60));
    var wr=embaralhar(pool.filter(function(x,i){return x!==good&&pool.indexOf(x)===i})).slice(0,2);
    it=choice("Que horas são?",good,wr,{t:"clock",h:h,m:m});it.key="l38|"+good;it.limits=[["n38:t1",4]];it._info={tipo:"ler",h:h,m:m};
  }else if(r<.75){
    var q=pick(REL38);it=typed(q[0],q[1]);it.limits=[["n38:t2",2]];it._info={tipo:"relacao"};
  }else{
    var cand=[[h%12+1,m],[((h+10)%12)+1,m],[h,m===0?30:(m+15)%60],[h,(m+55)%60]];if(m!==0)cand.push([m/5,(h*5)%60]);
    var ws=embaralhar(cand.filter(function(x){return hhmm(x[0],x[1])!==good})).slice(0,2);
    it=choice("Qual relógio marca "+good+"?",{fig:{t:"clock",h:h,m:m}},ws.map(function(x){return {fig:{t:"clock",h:x[0],m:x[1]}}}),null);it.key="r38|"+good+"|"+JSON.stringify(ws);it.limits=[["n38:t3",2]];it._info={tipo:"escolher",h:h,m:m};
  }
  return it;
}

/* Nível 39 — Duração: início, fim e quanto tempo passou (EF03MA22). Horários de 15 em 15 minutos, das 6:00 às 22:00. */
var EV39=["A aula","O recreio","O filme","O jogo","A festa","O lanche","A visita"];
function durTxt(d){return d%60===0?(d/60)+(d===60?" hora":" horas"):d+" minutos"}
function gDuracao(){
  var r=Math.random(),it,ev=pick(EV39),ini,dur,fim;
  var sorteia=function(){do{ini=360+15*rnd(0,64);dur=15*rnd(1,12);fim=ini+dur}while(fim>1320)};
  sorteia();
  if(r<.375){
    it=typed(ev+" começou às "+min24(ini)+" e terminou às "+min24(fim)+". Quantos minutos durou?",dur);it.limits=[["n39:t1",3]];it._info={tipo:"duracao",ini:ini,fim:fim,dur:dur};
  }else if(r<.75){
    var ws=[];[15,-15,30,-30,60,-60].forEach(function(dl){var x=fim+dl;if(x>=360&&x<=1320&&x!==fim)ws.push(min24(x))});
    it=choice(ev+" começou às "+min24(ini)+" e durou "+durTxt(dur)+". A que horas terminou?",min24(fim),embaralhar(ws).slice(0,2),null);it.limits=[["n39:t2",3]];it._info={tipo:"fim",ini:ini,dur:dur,fim:fim};
  }else{
    var wi=[];[15,-15,30,-30,60,-60].forEach(function(dl){var x=ini+dl;if(x>=360&&x<=1320&&x!==ini)wi.push(min24(x))});
    it=choice(ev+" terminou às "+min24(fim)+", depois de "+durTxt(dur)+". A que horas começou?",min24(ini),embaralhar(wi).slice(0,2),null);it.limits=[["n39:t3",2]];it._info={tipo:"inicio",ini:ini,dur:dur,fim:fim};
  }
  it.key=it._info.tipo+"|"+ini+"|"+dur+"|"+ev;
  return it;
}

/* Nível 40 — Dinheiro: compra, venda e troco (EF03MA24). */
var BENS40=[["caderno","Um"],["caneta","Uma"],["livro","Um"],["borracha","Uma"],["mochila","Uma"],["bola","Uma"],["camiseta","Uma"],["boné","Um"]];
var DOCES40=[["chiclete","Um"],["bala","Uma"],["pirulito","Um"],["bombom","Um"]];
function gDinheiro40(){
  var r=Math.random(),it;
  if(r<.375){
    var tres=Math.random()<.3,bs=embaralhar(BENS40).slice(0,tres?3:2),ps=bs.map(function(){return rnd(2,60)}),tot=ps.reduce(function(a,b){return a+b},0),txt;
    var low=function(b){return b[1].toLowerCase()};
    if(!tres)txt=bs[0][1]+" "+bs[0][0]+" custa "+ps[0]+" reais e "+low(bs[1])+" "+bs[1][0]+" custa "+ps[1]+" reais. Quanto custa tudo?";
    else txt=bs[0][1]+" "+bs[0][0]+" custa "+ps[0]+" reais, "+low(bs[1])+" "+bs[1][0]+" custa "+ps[1]+" reais e "+low(bs[2])+" "+bs[2][0]+" custa "+ps[2]+" reais. Quanto custa tudo?";
    it=typed(txt,tot,null,"reais");it.limits=[["n40:t1",3]];it._info={tipo:"total",ps:ps};
  }else if(r<.75){
    var n1=pick(NAMES),pag=pick([5,10,20,50]),pr=rnd(1,pag-1);
    it=typed(n1[0]+" pagou "+pag+" reais por uma compra de "+pr+" reais. Quanto "+(n1[1]==="f"?"ela":"ele")+" recebeu de troco?",pag-pr,null,"reais");it.limits=[["n40:t2",3],["nome:"+n1[0],1]];it._info={tipo:"troco",pag:pag,pr:pr};
  }else{
    if(Math.random()<.5){var d=pick(DOCES40),pc=5*rnd(1,19);it=typed(d[1]+" "+d[0]+" custa "+pc+" centavos. Com 1 real, qual é o troco, em centavos?",100-pc,null,"centavos");it._info={tipo:"centavos_troco",pc:pc}}
    else{var d2=pick(DOCES40),v,nn;do{v=5*rnd(1,10);nn=rnd(2,4)}while(v*nn>100);it=typed("Quantos centavos custam "+nn+" "+d2[0]+"s de "+v+" centavos?",nn*v,null,"centavos");it._info={tipo:"centavos_vezes",n:nn,v:v}}
    it.limits=[["n40:t3",2]];
  }
  return it;
}

/* Nível 41 — Resultados possíveis e chances (EF03MA25). */
var COR41=["azul","amarelo","rosa","roxo","vermelho","verde"];
function coresRoleta(n){var t=0,c;do{c=embaralhar(COR41).slice(0,n)}while(c.indexOf("vermelho")>=0&&c.indexOf("verde")>=0&&t++<100);return c}
function gChances(){
  var r=Math.random(),it;
  if(r<.375){
    var k=pick(["dado","moeda","roleta"]);
    if(k==="dado")it=typed("Ao lançar um dado comum, quantos resultados são possíveis?",6,{t:"dado",n:6});
    else if(k==="moeda")it=typed("Ao lançar uma moeda, quantos resultados são possíveis?",2,{t:"moeda"});
    else{var n=rnd(3,5),cs=coresRoleta(n);it=typed("Esta roleta tem partes iguais. Quantas cores podem sair?",n,{t:"roleta",parts:cs});it.key="rol41|"+cs.join(",")}
    it.limits=[["n41:t1",3]];it._info={tipo:"resultados",k:k};
  }else{
    var mais=r<.75,nc=rnd(3,5),np=rnd(6,8),cs2=coresRoleta(nc),cont,t=0,ok=false;
    while(!ok&&t++<500){cont=cs2.map(function(){return 1});for(var i=nc;i<np;i++)cont[rnd(0,nc-1)]++;
      var ex=mais?Math.max.apply(null,cont):Math.min.apply(null,cont);ok=cont.filter(function(x){return x===ex}).length===1}
    if(!ok){cs2=coresRoleta(3);cont=[4,2,1]}
    var parts=[];cs2.forEach(function(c,i){for(var j=0;j<cont[i];j++)parts.push(c)});
    var ex2=mais?Math.max.apply(null,cont):Math.min.apply(null,cont),cert=cs2[cont.indexOf(ex2)];
    parts=embaralhar(parts);
    it=choice("Em qual cor a seta tem "+(mais?"mais":"menos")+" chance de parar?",cert,cs2.filter(function(c){return c!==cert}).slice(0,3),{t:"roleta",parts:parts});it.key="ch41|"+mais+"|"+parts.join(",");it.limits=[["n41:"+(mais?"t2":"t3"),mais?3:2]];it._info={tipo:mais?"mais":"menos",parts:parts};
  }
  return it;
}

/* Nível 42 — Tabelas de dupla entrada e gráficos (EF03MA26, EF03MA27). */
var TEMAS42=[{t:"Esportes preferidos das turmas",l:["futebol","vôlei","natação","judô","corrida"]},{t:"Frutas preferidas das turmas",l:["maçã","banana","uva","pera","laranja"]},
  {t:"Bichinhos preferidos das turmas",l:["gato","cachorro","peixe","pássaro","coelho"]},{t:"Cores preferidas das turmas",l:["azul","verde","rosa","amarelo","roxo"]}];
function unicoExtremo(v,mais){var e=mais?Math.max.apply(null,v):Math.min.apply(null,v);return v.filter(function(x){return x===e}).length===1}
function gTabGraf(){
  var r=Math.random(),tm=pick(TEMAS42),tipo=r<.375?1:r<.75?2:3,it;
  if(Math.random()<2/3){
    var cols=embaralhar(tm.l).slice(0,4),rows=["Turma A","Turma B","Turma C"],v,t=0,ri=rnd(0,2),mais=Math.random()<.7;
    do{v=rows.map(function(){return cols.map(function(){return rnd(1,30)})})}while(tipo===2&&!unicoExtremo(v[ri],mais)&&t++<500);
    var fig={t:"tabela2",title:tm.t,rows:rows,cols:cols,v:v},ci=rnd(0,3);
    if(tipo===1)it=typed("Quantas crianças da "+rows[ri]+" escolheram "+cols[ci]+"?",v[ri][ci],fig);
    else if(tipo===2){var ex=mais?Math.max.apply(null,v[ri]):Math.min.apply(null,v[ri]),cer=cols[v[ri].indexOf(ex)];it=choice("Qual opção a "+rows[ri]+" "+(mais?"mais":"menos")+" escolheu?",cer,cols.filter(function(x){return x!==cer}),fig)}
    else if(Math.random()<.5){it=typed("Quantas crianças ao todo escolheram "+cols[ci]+"?",v[0][ci]+v[1][ci]+v[2][ci],fig)}
    else{var A=v[0][ci],B=v[1][ci];if(A===B){v[1][ci]=B>1?B-1:B+1;B=v[1][ci]}var big=A>B?0:1;it=typed("Quantas crianças a mais da "+rows[big]+" do que da "+rows[1-big]+" escolheram "+cols[ci]+"?",Math.abs(A-B),fig)}
    it.limits=[["n42:t"+tipo,tipo===3?2:3]];it._info={tipo:tipo,tab:true,fig:fig,mais:mais};
  }else{
    var n=rnd(4,5),lab=embaralhar(tm.l).slice(0,n),step=pick([5,10]),vals,t2=0,mais2=Math.random()<.5;
    do{vals=lab.map(function(){return step*rnd(1,Math.floor(50/step))})}while(tipo===2&&!unicoExtremo(vals,mais2)&&t2++<500);
    var f={t:"bars",title:tm.t,labels:lab,values:vals,step:step},i2=rnd(0,n-1);
    if(tipo===1)it=typed("Quantas crianças escolheram "+lab[i2]+"?",vals[i2],f);
    else if(tipo===2){var e2=mais2?Math.max.apply(null,vals):Math.min.apply(null,vals),c2=lab[vals.indexOf(e2)];it=choice("Qual opção teve "+(mais2?"mais":"menos")+" votos?",c2,embaralhar(lab.filter(function(x){return x!==c2})).slice(0,3),f)}
    else if(Math.random()<.5){var a=rnd(0,n-1),b;do{b=rnd(0,n-1)}while(b===a);if(vals[a]===vals[b]){vals[b]=vals[a]>step?vals[a]-step:vals[a]+step;f.values=vals}var bg=vals[a]>vals[b]?a:b,sm=bg===a?b:a;it=typed("Quantas crianças a mais escolheram "+lab[bg]+" do que "+lab[sm]+"?",vals[bg]-vals[sm],f)}
    else{it=typed("Qual é o dobro dos votos de "+lab[i2]+"?",2*vals[i2],f)}
    it.limits=[["n42:t"+tipo,tipo===3?2:3]];it._info={tipo:tipo,tab:false,fig:f,mais:mais2};
  }
  return it;
}

FC.G3=[
  {nivel:1,id:"g3n01",nome:"Nível 1 — Ler e escrever números até 9999",hab:["EF03MA01"],meta:130,gen:gLer,ano:3},
  {nivel:2,id:"g3n02",nome:"Nível 2 — Milhares, centenas, dezenas e unidades (material dourado)",hab:["EF03MA02"],meta:120,gen:gMaterial3,ano:3},
  {nivel:3,id:"g3n03",nome:"Nível 3 — Valor posicional e o zero",hab:["EF03MA01","EF03MA02"],meta:120,gen:gPosicional3,ano:3},
  {nivel:4,id:"g3n04",nome:"Nível 4 — Decompor números até 9999",hab:["EF03MA02"],meta:120,gen:gDecompor4,ano:3},
  {nivel:5,id:"g3n05",nome:"Nível 5 — Comparar e ordenar números até 9999",hab:["EF03MA01"],meta:110,gen:gOrdem4,ano:3},
  {nivel:6,id:"g3n06",nome:"Nível 6 — A reta numérica",hab:["EF03MA04"],meta:120,gen:gReta,ano:3},
  {nivel:7,id:"g3n07",nome:"Nível 7 — Sequências e regularidades",hab:["EF03MA10"],meta:120,gen:gSeq4,ano:3},
  {nivel:8,id:"g3n08",nome:"Nível 8 — Complementos: quanto falta para 100 e para 1000",hab:["EF03MA03","EF03MA05"],meta:100,gen:gComplemento,ano:3},
  {nivel:9,id:"g3n09",nome:"Nível 9 — Somas de três algarismos com reagrupamento",hab:["EF03MA05"],meta:120,gen:gSoma3,ano:3},
  {nivel:10,id:"g3n10",nome:"Nível 10 — Subtrações de três algarismos com reagrupamento",hab:["EF03MA05"],meta:130,gen:gSub3,ano:3},
  {nivel:11,id:"g3n11",nome:"Nível 11 — Somas e subtrações até 999, misturadas",hab:["EF03MA05"],meta:120,gen:gMisto3,ano:3},
  {nivel:12,id:"g3n12",nome:"Nível 12 — Somas e subtrações com quatro algarismos",hab:["EF03MA05"],meta:140,gen:gQuatro,ano:3},
  {nivel:13,id:"g3n13",nome:"Nível 13 — Problemas de adição e subtração até 999",hab:["EF03MA06"],meta:160,gen:gProb3(13),ano:3},
  {nivel:14,id:"g3n14",nome:"Nível 14 — Problemas de adição e subtração até 9999",hab:["EF03MA06"],meta:170,gen:gProb3(14),ano:3},
  {nivel:15,id:"g3n15",nome:"Nível 15 — Igualdades e sentenças equivalentes",hab:["EF03MA11"],meta:120,gen:gIgual,ano:3},
  {nivel:16,id:"g3n16",nome:"Nível 16 — Tabuadas do 2, 3, 4 e 5 (fluência)",hab:["EF03MA03","EF03MA07"],meta:90,gen:gTab16,ano:3},
  {nivel:17,id:"g3n17",nome:"Nível 17 — Multiplicar por 10",hab:["EF03MA07"],meta:100,gen:gPor10,ano:3},
  {nivel:18,id:"g3n18",nome:"Nível 18 — Disposição retangular (linhas e colunas)",hab:["EF03MA07"],meta:110,gen:gArranjo,ano:3},
  {nivel:19,id:"g3n19",nome:"Nível 19 — Tabuada do 6",hab:["EF03MA03"],meta:100,gen:gTabK(6,19),ano:3},
  {nivel:20,id:"g3n20",nome:"Nível 20 — Tabuada do 7",hab:["EF03MA03"],meta:100,gen:gTabK(7,20),ano:3},
  {nivel:21,id:"g3n21",nome:"Nível 21 — Tabuada do 8",hab:["EF03MA03"],meta:100,gen:gTabK(8,21),ano:3},
  {nivel:22,id:"g3n22",nome:"Nível 22 — Tabuada do 9",hab:["EF03MA03"],meta:100,gen:gTabK(9,22),ano:3},
  {nivel:23,id:"g3n23",nome:"Nível 23 — Todas as tabuadas, misturadas",hab:["EF03MA03"],meta:110,gen:gTodas,ano:3},
  {nivel:24,id:"g3n24",nome:"Nível 24 — Problemas de multiplicação",hab:["EF03MA07"],meta:140,gen:gProbMult,ano:3},
  {nivel:25,id:"g3n25",nome:"Nível 25 — Repartir em partes iguais",hab:["EF03MA08"],meta:110,gen:gRepartir,ano:3},
  {nivel:26,id:"g3n26",nome:"Nível 26 — A divisão como inverso da multiplicação",hab:["EF03MA08"],meta:100,gen:gDivInv,ano:3},
  {nivel:27,id:"g3n27",nome:"Nível 27 — Divisão com resto",hab:["EF03MA08"],meta:120,gen:gResto,ano:3},
  {nivel:28,id:"g3n28",nome:"Nível 28 — Metade, terça, quarta, quinta e décima partes",hab:["EF03MA09"],meta:110,gen:gPartes,ano:3},
  {nivel:29,id:"g3n29",nome:"Nível 29 — Problemas de divisão",hab:["EF03MA08"],meta:150,gen:gProbDiv,ano:3},
  {nivel:30,id:"g3n30",nome:"Nível 30 — Problemas com as quatro operações",hab:["EF03MA06","EF03MA07","EF03MA08"],meta:150,gen:gQuatroOp,ano:3},
  {nivel:31,id:"g3n31",nome:"Nível 31 — Sólidos e planificações",hab:["EF03MA13","EF03MA14"],meta:120,gen:gPlanif,ano:3},
  {nivel:32,id:"g3n32",nome:"Nível 32 — Figuras planas: trapézio e paralelogramo",hab:["EF03MA15"],meta:120,gen:gPlanas3,ano:3},
  {nivel:33,id:"g3n33",nome:"Nível 33 — Figuras congruentes (malha)",hab:["EF03MA16"],meta:120,gen:gCongruente,ano:3},
  {nivel:34,id:"g3n34",nome:"Nível 34 — Medir com a régua: centímetro e milímetro",hab:["EF03MA19"],meta:110,gen:gRegua34,ano:3},
  {nivel:35,id:"g3n35",nome:"Nível 35 — A unidade e o instrumento certos",hab:["EF03MA17","EF03MA18"],meta:110,gen:gUnidInstr,ano:3},
  {nivel:36,id:"g3n36",nome:"Nível 36 — Capacidade e massa",hab:["EF03MA20"],meta:110,gen:gCapMassa,ano:3},
  {nivel:37,id:"g3n37",nome:"Nível 37 — Comparar áreas na malha",hab:["EF03MA21"],meta:110,gen:gAreas,ano:3},
  {nivel:38,id:"g3n38",nome:"Nível 38 — Relógio: horas, minutos e segundos",hab:["EF03MA23"],meta:120,gen:gRelogio38,ano:3},
  {nivel:39,id:"g3n39",nome:"Nível 39 — Duração: início, fim e quanto tempo passou",hab:["EF03MA22"],meta:150,gen:gDuracao,ano:3},
  {nivel:40,id:"g3n40",nome:"Nível 40 — Dinheiro: compra, venda e troco",hab:["EF03MA24"],meta:150,gen:gDinheiro40,ano:3},
  {nivel:41,id:"g3n41",nome:"Nível 41 — Resultados possíveis e chances",hab:["EF03MA25"],meta:120,gen:gChances,ano:3},
  {nivel:42,id:"g3n42",nome:"Nível 42 — Tabelas de dupla entrada e gráficos",hab:["EF03MA26","EF03MA27"],meta:160,gen:gTabGraf,ano:3}
];
FC.G3BY={};FC.G3.forEach(function(e){FC.G3BY[e.id]=e});
FC.extenso=extenso;

/* ===================== O 3º ano na grade do app: FC.LEVELS (a trilha é uma só: os níveis do 3º ano seguem os 76 dos dois primeiros anos) ===================== */
/* Os números das fichas (1 a 42) são do 3º ano; no app o aluno vê a numeração corrida, de 77 a 118. */
var BASE3=FC.LEVELS.length;                          /* 76 */
var BLOCOS3=[[7,"Números até 9999"],[15,"Adição e subtração até 9999"],[24,"Multiplicação e tabuadas"],[30,"Divisão e problemas"],[33,"Sólidos, figuras e congruência"],[40,"Medidas, horas e dinheiro"],[42,"Chances, tabelas e gráficos"]];
var DICAS3={1:"Leia e escreva números até 9999, inclusive por extenso.",2:"Cada cubo grande vale 1000, cada placa vale 100, cada barra vale 10 e cada quadradinho vale 1.",3:"Descubra o valor de cada algarismo, a ordem em que ele está e o que o zero faz.",
  4:"Decomponha o número, como 3 456 = 3 000 + 400 + 50 + 6.",5:"Compare números de quatro algarismos: maior, menor, ordem e sinais.",6:"Leia os números na reta, ache o ponto certo e veja quanto falta de um ponto ao outro.",
  7:"Descubra a regra da sequência, complete-a e ache o número errado.",8:"Quanto falta para 100 e para 1000? Faça de cabeça.",9:"Somas de três algarismos com \"vai um\", como 358 + 267.",10:"Subtrações de três algarismos com \"empresta\", como 502 − 247.",
  11:"Somas e subtrações até 999, misturadas.",12:"Somas e subtrações com quatro algarismos, como 6 000 − 2 348.",13:"Problemas de juntar, acrescentar, separar, retirar, comparar e completar, até 999.",14:"Os mesmos problemas, com números até 9999.",
  15:"Igualdades: os dois lados valem o mesmo, como 7 + 5 = 6 + ?",16:"As tabuadas do 2, 3, 4 e 5, de memória e rápido.",17:"Multiplicar por 10 é colocar um zero no fim do número.",18:"Fileiras e colunas: 3 fileiras de 5 é 3 × 5.",
  19:"A tabuada do 6 é o dobro da tabuada do 3.",20:"Para não esquecer: 56 = 7 × 8 (5, 6, 7, 8).",21:"A tabuada do 8 é o dobro do dobro do dobro: 8 × 3 = 3 × 2 × 2 × 2.",22:"Na tabuada do 9, os algarismos do resultado somam 9.",
  23:"Todas as tabuadas, até 10 × 10, misturadas.",24:"Problemas com grupos iguais, fileiras, compras e multiplicação por 10.",25:"Divida em partes iguais: quantos ficam em cada prato e quantos pratos são necessários.",
  26:"Para dividir, pense na tabuada: 21 ÷ 3 é 3 vezes quanto dá 21? O sinal ÷ lê-se \"dividido por\".",27:"Quantos grupos dá para formar e quantos sobram.",28:"A metade, a terça, a quarta, a quinta e a décima parte de um número.",
  29:"Problemas de dividir em partes iguais, de ver quantos cabem e de ver quantos sobram.",30:"Leia o problema e escolha a operação certa: somar, tirar, multiplicar ou dividir.",31:"Qual sólido se forma com esta planificação? Quantas faces tem?",
  32:"Trapézio e paralelogramo: lados paralelos, ângulos retos e vértices.",33:"Figuras congruentes têm o mesmo tamanho e a mesma forma, mesmo giradas.",34:"1 centímetro tem 10 milímetros.",35:"Qual unidade e qual instrumento usar para cada medida?",
  36:"Litro, mililitro, quilograma, grama e miligrama: qual unidade usar e quem é mais pesado.",37:"Qual figura ocupa mais espaço na malha?",38:"1 hora tem 60 minutos e 1 minuto tem 60 segundos.",39:"Quanto tempo passou? Quando começou e quando terminou?",
  40:"Total da compra e troco, em reais e em centavos.",41:"Quantos resultados são possíveis? Qual tem mais chance?",42:"Leia tabelas e gráficos, compare e calcule."};
/* Texto de abertura (aparece no começo da folha). */
var INTROS3={1:"Lembrete: \"mil\" sozinho vale 1000. Depois do mil usamos \"e\" quando sobra uma centena inteira ou menos de 100 (mil e cem, dois mil e cinco) e vírgula nos outros casos (mil, cento e dez).",
  27:"Lembrete: o resto é o que sobra quando não dá mais para formar grupos iguais. Ele é sempre menor que o número que divide.",
  31:"Lembrete: a planificação é o sólido aberto sobre a mesa; as dobras viram as arestas.",
  33:"Lembrete: figuras congruentes podem estar giradas, mas nunca viradas como no espelho."};
FC.G3.forEach(function(e){
  var grupo=BLOCOS3.filter(function(b){return e.nivel<=b[0]})[0][1];
  var l={group:grupo,id:String(BASE3+e.nivel),name:e.nome.replace(/^Nível \d+ — /,""),hint:DICAS3[e.nivel],target:e.meta,gen:e.gen,ano:3,hab:e.hab};
  if(INTROS3[e.nivel])l.intro=INTROS3[e.nivel];
  FC.LEVELS.push(l);
});
})();
