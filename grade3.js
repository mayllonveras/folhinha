/* Grade do 3º ano — geradores escritos do zero a partir das fichas em bncc/fichas/3ano-*.md.
   Mesma forma dos geradores do 1º e do 2º ano: {pre, post, a, extra?}, com limits/key/_info só para o app e os testes.
   Por enquanto os geradores não estão ligados aos níveis do app: aparecem na aba Exercícios do /adm.
   Níveis feitos: 1 a 7 (números até 9999). Os números de quatro algarismos aparecem com espaço fino de milhar (3 456). */
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

FC.G3=[
  {nivel:1,id:"g3n01",nome:"Nível 1 — Ler e escrever números até 9999",hab:["EF03MA01"],meta:130,gen:gLer,ano:3},
  {nivel:2,id:"g3n02",nome:"Nível 2 — Milhares, centenas, dezenas e unidades (material dourado)",hab:["EF03MA02"],meta:120,gen:gMaterial3,ano:3},
  {nivel:3,id:"g3n03",nome:"Nível 3 — Valor posicional e o zero",hab:["EF03MA01","EF03MA02"],meta:120,gen:gPosicional3,ano:3},
  {nivel:4,id:"g3n04",nome:"Nível 4 — Decompor números até 9999",hab:["EF03MA02"],meta:120,gen:gDecompor4,ano:3},
  {nivel:5,id:"g3n05",nome:"Nível 5 — Comparar e ordenar números até 9999",hab:["EF03MA01"],meta:110,gen:gOrdem4,ano:3},
  {nivel:6,id:"g3n06",nome:"Nível 6 — A reta numérica",hab:["EF03MA04"],meta:120,gen:gReta,ano:3},
  {nivel:7,id:"g3n07",nome:"Nível 7 — Sequências e regularidades",hab:["EF03MA10"],meta:120,gen:gSeq4,ano:3}
];
FC.G3BY={};FC.G3.forEach(function(e){FC.G3BY[e.id]=e});
FC.extenso=extenso;
})();
