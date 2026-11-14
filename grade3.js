/* Grade do 3º ano — geradores escritos do zero a partir das fichas em bncc/fichas/3ano-*.md.
   Mesma forma dos geradores do 1º e do 2º ano: {pre, post, a, extra?}, com limits/key/_info só para o app e os testes.
   Por enquanto os geradores não estão ligados aos níveis do app: aparecem na aba Exercícios do /adm.
   Níveis feitos: 1 a 15 (números até 9999, adição e subtração, igualdades). Os números de quatro algarismos aparecem com espaço fino de milhar (3 456). */
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
    s=Math.round(s/mult)*mult;if(sobe&&s+4*passo>hi)s-=mult;if(!sobe&&s-4*passo<lo)s+=mult;
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
  {nivel:15,id:"g3n15",nome:"Nível 15 — Igualdades e sentenças equivalentes",hab:["EF03MA11"],meta:120,gen:gIgual,ano:3}
];
FC.G3BY={};FC.G3.forEach(function(e){FC.G3BY[e.id]=e});
FC.extenso=extenso;
})();
