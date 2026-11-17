/* Testes dos geradores da grade do 5º ano (47 níveis), conforme bncc/GRADE-5ANO.md. Rodar com: node testes/grade5.test.js
   Cada conta tem a resposta recalculada por uma regra independente, a partir do texto da conta e das figuras; conferem-se limites de tamanho,
   respostas decimais "bonitas" (até 3 casas, sem erro de ponto flutuante), opções sem repetição e uma só certa, e as figuras novas. */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');require('../grade1.js');require('../grade2.js');require('../grade3.js');require('../grade4.js');require('../grade5.js');
const FC=global.FC;let falhas=0;const falha=m=>{falhas++;if(falhas<40)console.log("  FALHA",m)};
const ok=(c,m)=>{if(!c)falha(m)};
const G={};FC.G5.forEach(e=>G[e.nivel]=e);
const N=Number(process.env.N||500);
function gera(n,f){for(let i=0;i<N;i++){const it=G[n].gen();f(it,i)}}
const eq=(a,b)=>Math.abs(a-b)<1e-9;
const sem=s=>String(s).replace(/ /g,"");
const num=s=>+sem(s).replace(",",".");
const nums=s=>(sem(s).match(/\d+(?:,\d+)?/g)||[]).map(num);
const calc=pre=>{const m=sem(pre).match(/^(\d+(?:,\d+)?) ([+−×÷]) (\d+(?:,\d+)?) =$/);if(!m)return null;const a=num(m[1]),b=num(m[3]);return {a,b,op:m[2],r:m[2]==="+"?a+b:m[2]==="−"?a-b:m[2]==="×"?a*b:a/b}};
const ds=n=>String(n).split("").map(Number);
const carries=(a,b)=>{let x=ds(a).reverse(),y=ds(b).reverse(),c=0,n=0;for(let i=0;i<Math.max(x.length,y.length);i++){const s=(x[i]||0)+(y[i]||0)+c;if(s>=10){n++;c=1}else c=0}return n};
const borrows=(a,b)=>{let x=ds(a).reverse(),y=ds(b).reverse(),c=0,n=0;for(let i=0;i<x.length;i++){const v=x[i]-c-(y[i]||0);if(v<0){n++;c=1}else c=0}return n};
const opt=it=>it.extra.opts[it.a-1];
const valFr=s=>{const [n,d]=String(s).split("/").map(Number);return n/d};
const bonito=a=>eq(a,+a.toFixed(3))&&String(a).replace(/^\d+\.?/,"").length<=3&&!/e/.test(String(a));

// grade: 47 níveis, numeração, habilidades do 5º ano, metas, ESPEC
ok(FC.G5.length===47,"47 níveis");
ok(FC.LEVELS.length===211&&FC.LEVELS[164].id==="165"&&FC.LEVELS[210].id==="211","níveis 165 a 211");
const hab=new Set();FC.G5.forEach(e=>e.hab.forEach(h=>hab.add(h)));
ok(hab.size===24,"24 habilidades do 5º ano cobertas ("+hab.size+")");
ok(!hab.has("EF05MA25"),"EF05MA25 fica de fora");
for(let c=1;c<=24;c++)ok(hab.has("EF05MA"+(c<10?"0":"")+c),"EF05MA"+c+" sem nível");
ok(FC.G5.every(e=>FC.LEVELS[163+e.nivel].espec&&FC.LEVELS[163+e.nivel].espec.tipos.length>=2),"todo nível tem espec com 2 ou mais tipos");

// nível 1
const ext=new Map();for(let n=1;n<=999999;n++){const e=FC.extenso4(n);if(ext.has(e))falha("extenso repetido: "+n+" e "+ext.get(e));ext.set(e,n);if(/^um mil/.test(e))falha("um mil em "+n)}
ok(FC.extenso4(234567)==="duzentos e trinta e quatro mil, quinhentos e sessenta e sete"&&FC.extenso4(100000)==="cem mil"&&FC.extenso4(200005)==="duzentos mil e cinco"&&FC.extenso4(101000)==="cento e um mil"&&FC.extenso4(999999)==="novecentos e noventa e nove mil, novecentos e noventa e nove","exemplos do extenso");
let zeros=0;
gera(1,it=>{const i=it._info;ok(i.n>=100000&&i.n<=999999,"n1 fora de 100 000 a 999 999");if(/0/.test(String(i.n)))zeros++;
  if(i.k===1){const e=it.pre.replace(/^Escreva em algarismos: /,"").replace(/\.$/,"");ok(ext.get(e)===it.a&&it.a===i.n,"n1 ida e volta "+it.pre)}
  else if(i.k===2){ok(num(it.pre.match(/número ([\d ]+)\?/)[1])===i.n&&opt(it)===FC.extenso4(i.n),"n1 extenso certo");ok(new Set(it.extra.opts).size===3||new Set(it.extra.opts).size===it.extra.opts.length,"n1 opções repetidas")}
  else if(i.k===3){const m=it.pre.match(/^No número ([\d ]+), quanto vale o algarismo (\d)\?$/),n=num(m[1]),d=+m[2],s=String(n);ok(s.split(String(d)).length===2,"n1 algarismo repetido");ok(d*Math.pow(10,s.length-1-s.indexOf(String(d)))===it.a,"n1 valor "+it.pre)}
  else{const m=it.pre.match(/^Que algarismo está na casa (.*) de ([\d ]+)\?$/),casas=["das centenas de milhar","das dezenas de milhar","das unidades de milhar","das centenas","das dezenas","das unidades"];ok(+String(num(m[2]))[casas.indexOf(m[1])]===it.a,"n1 casa "+it.pre)}});
ok(zeros/N>.15&&zeros/N<.6,"n1: zero em 15% a 60% dos números ("+(zeros/N).toFixed(2)+")");
// nível 2
gera(2,it=>{const i=it._info,p=sem(it.pre);
  if(i.k===1||i.k===2){const o=it.extra.opts.map(num);ok(o.length===3&&new Set(o).size===3,"n2 opções");ok(num(opt(it))===(i.k===1?Math.max(...o):Math.min(...o)),"n2 maior/menor")}
  else if(i.k===3){const m=p.match(/(\d+) ◻ (\d+)/),s=+m[1]<+m[2]?"<":+m[1]>+m[2]?">":"=";ok(opt(it)===s,"n2 sinal "+p)}
  else if(i.k===4){const m=p.match(/logo (depois|antes) de (\d+)/);ok(it.a===(m[1]==="depois"?+m[2]+1:+m[2]-1)&&it.a>=100000&&it.a<=1000000,"n2 vizinho "+p)}
  else{const cres=/crescente/.test(p)&&!/decrescente/.test(p),lst=s=>sem(s).split("; ").map(Number),c=lst(opt(it));ok(c.length===3&&c.every((x,j)=>j===0||(cres?x>c[j-1]:x<c[j-1])),"n2 lista certa");
    it.extra.opts.forEach((o,j)=>{if(j+1!==it.a){const l=lst(o),s=l.every((x,k)=>k===0||(cres?x>l[k-1]:x<l[k-1]));ok(!s,"n2 duas listas certas")}})}});
// nível 3
gera(3,it=>{const m=sem(it.pre).match(/^Arredonde (\d+) para a (dezena de milhar|unidade de milhar|centena|dezena) mais próxima\.$/),k={"dezena":10,"centena":100,"unidade de milhar":1000,"dezena de milhar":10000}[m[2]],n=+m[1];
  ok(it.a===Math.floor((n+k/2)/k)*k&&n%k!==0&&n>=100001&&n<=949999,"n3 "+it.pre)});
// níveis 4 a 6
gera(4,it=>{const c=calc(it.pre);ok(c&&c.op==="+"&&c.r===it.a&&c.r<=999999&&c.a>=10000&&c.b>=10000&&carries(c.a,c.b)>=2,"n4 "+it.pre);if(it._info.seis)ok(Math.max(c.a,c.b)>=100000,"n4 seis algarismos");else ok(c.a<100000&&c.b<100000&&carries(c.a,c.b)>=3,"n4 cinco algarismos")});
gera(5,it=>{const c=calc(it.pre);ok(c&&c.op==="−"&&c.r===it.a&&c.a<=999999&&c.a>c.b&&c.r>=1000&&borrows(c.a,c.b)>=2,"n5 "+it.pre);if(it._info.z)ok(/0/.test(String(c.a))||/0/.test(String(c.b)),"n5 sem zero no ramo com zero")});
gera(6,it=>{const i=it._info,esperado=(i.tipo==="juntar"||i.tipo==="acrescentar")?i.a+i.b:i.a-i.b,n=nums(it.pre);ok(it.a===esperado&&it.a>0&&it.a<=999999&&n.includes(i.a)&&n.includes(i.b),"n6 "+it.pre)});
// multiplicação
gera(7,it=>{const i=it._info;let c=calc(it.pre);
  if(c){ok(c.r===it.a&&c.r<=999999,"n7 "+it.pre);if(i.k<=3)ok([c.a,c.b].includes(i.m)&&[c.a,c.b].includes(i.n),"n7 fator");else ok(c.a%10===0&&c.b%10===0&&c.a>=20&&c.b>=20,"n7 múltiplos")}
  else{const m=sem(it.pre).match(/^__ × (\d+) = (\d+)\./);ok(m&&it.a*+m[1]===+m[2]&&+m[2]<=999999,"n7 escondido "+it.pre)}});
gera(8,it=>{const i=it._info;if(i.guiada){const m=sem(it.pre).match(/^(\d+) × (\d+) = (\d+) × (\d+) \+ (\d+) × (\d+) = (\d+) \+ __\./);ok(m&&+m[1]*+m[2]===+m[1]*+m[4]+ +m[5]*+m[6]&&+m[7]===+m[1]*+m[4]&&it.a===+m[5]*+m[6]&&+m[4]+ +m[6]===+m[2],"n8 guiada "+it.pre)}else{const c=calc(it.pre);ok(c&&c.r===it.a&&c.a>=101&&c.a<=999&&c.b>=11&&c.b<=49,"n8 "+it.pre)}});
gera(9,it=>{const i=it._info;if(i.est){const m=sem(it.pre).match(/(\d+) × (\d+) dá/),a=+m[1],b=+m[2],e=Math.round(a/1000)*1000*Math.round(b/10)*10;ok(num(opt(it))===e&&it.extra.opts.map(num).includes(e*10)&&it.extra.opts.map(num).includes(e/10),"n9 estimativa "+it.pre)}else{const c=calc(it.pre);ok(c&&c.r===it.a&&c.a>=1100&&c.a<=4999&&c.b>=11&&c.b<=40,"n9 "+it.pre)}});
gera(10,it=>{const i=it._info,n=nums(it.pre);ok(it.a===i.a*i.b&&n.includes(i.a)&&n.includes(i.b)&&it.a<=999999,"n10 "+it.pre)});
gera(11,it=>{const i=it._info;if(i.k===1||i.k===4){const f=it.extra.fig,leaves=f.niv.reduce((a,l)=>a*l.length,1),html=FC.fig(f);ok(it.a===leaves&&(html.match(/class="lf"/g)||[]).length===leaves&&leaves<=12,"n11 pontas da árvore");ok(i.k===1?f.niv.length===2:f.niv.length===3,"n11 níveis da árvore")}
  else if(i.k===2){const n=nums(it.pre);ok(it.a===n[0]*n[1],"n11 contar "+it.pre)}else{const m=sem(it.pre).match(/Com (\d+) .* e __ .*, é possível formar (\d+) combinações/);ok(+m[1]*it.a===+m[2],"n11 fator "+it.pre)}});
// divisão
gera(12,it=>{const i=it._info,m=sem(it.pre).match(/(\d+)(?: ÷ | por )(\d)/);const n=+m[1],d=+m[2];ok(n>=10000&&n<=99999&&d>=2&&d<=9&&n===d*i.q+i.r,"n12 relação "+it.pre);
  if(i.k===4)ok(it.a===n%d&&i.r>=1,"n12 resto");else ok(it.a===Math.floor(n/d),"n12 quociente");if(i.k<=2)ok(n%d===0,"n12 exata");if(i.k===2)ok(/0/.test(String(i.q)),"n12 zero no quociente");if(i.k===1)ok(!/0/.test(String(i.q)),"n12 sem zero")});
gera(13,it=>{const i=it._info,m=sem(it.pre).match(/(\d+) (?:÷|por) ?(\d+) =?|(\d+) ÷ (\d+) =$/),t=sem(it.pre),r=t.match(/(\d+) ÷ (\d+) =$/)||t.match(/por (\d+)/);
  const n=i.n,d=i.d;ok(n%d===0&&it.a===n/d&&d>=11&&d<=45,"n13 "+it.pre);if(i.k===1)ok(it.a>=11&&it.a<=99,"n13 q2");if(i.k===2)ok(it.a>=101&&it.a<=299,"n13 q3");if(i.k===3)ok(/^\d+ × \d+ = \d+, então/.test(t),"n13 pista")});
gera(14,it=>{const i=it._info,t=sem(it.pre);ok(i.n===i.d*i.q+i.r&&i.r>=1&&i.r<i.d&&i.d>=11&&i.d<=35&&i.q>=10&&i.q<=99,"n14 relação "+t);ok(it.a===[i.q,i.r,i.n][i.k-1],"n14 resposta "+t);
  const n=nums(it.pre);if(i.k<3)ok(n[0]===i.n&&n[1]===i.d,"n14 texto");else ok(n.includes(i.d)&&n.includes(i.q)&&n.includes(i.r),"n14 texto 3")});
gera(15,it=>{const i=it._info;ok(i.n===i.d*i.q+i.r&&it.a===[i.q,i.q,i.r,i.q+1][i.k-1],"n15 "+it.pre);ok(i.k===1?i.r===0:i.r>=1,"n15 resto")});
gera(16,it=>{const i=it._info;if(i.k===1)ok(it.a===i.a*i.b+i.c,"n16 a");else if(i.k===2)ok(it.a===i.c-i.a*i.b&&it.a>0,"n16 b");else if(i.k===3)ok(Number.isInteger(it.a)&&it.a>0,"n16 c");else{const m=sem(it.pre).match(/(\d+) × (\d+)\?/),e=Math.round(m[1]/10)*Math.round(m[2]/10)*100;ok(num(opt(it))===e&&it.extra.opts.length===3,"n16 d")}});
// álgebra
gera(17,it=>{const i=it._info,t=sem(it.pre);let m;
  if(i.k===1){m=t.match(/^(\d+) \+ (\d+) = (\d+), então \1 \+ \2 \+ (\d+) = \3 \+ __/);ok(m&&+m[1]+ +m[2]===+m[3]&&it.a===+m[4],"n17 a "+t)}
  else if(i.k===2){m=t.match(/^(\d+) \+ (\d+) = (\d+), então \1 \+ \2 − (\d+) = \3 − __/);ok(m&&+m[1]+ +m[2]===+m[3]&&it.a===+m[4]&&+m[4]<+m[3],"n17 b "+t)}
  else if(i.k===3){m=t.match(/^(\d+) \+ (\d+) = (\d+), então \((\d+) \+ (\d+)\) × (\d+) = \3 × __/);ok(m&&+m[1]+ +m[2]===+m[3]&&it.a===+m[6],"n17 c "+t)}
  else if(i.k===4){m=t.match(/^(\d+) × (\d+) = (\d+), então \((\d+) × (\d+)\) ÷ (\d+) = \3 ÷ __/);ok(m&&+m[1]*+m[2]===+m[3]&&it.a===+m[6]&&+m[3]%+m[6]===0,"n17 d "+t)}
  else{m=t.match(/^(\d+) \+ (\d+) = (\d+) \+ __/);ok(m&&+m[1]+ +m[2]===+m[3]+it.a&&it.a>0,"n17 e "+t)}});
gera(18,it=>{const i=it._info;ok(it.a===i.x&&Number.isInteger(i.x)&&i.x>0&&!/\bx\b/.test(it.pre),"n18 sem a letra x");
  const op=[(x,n)=>x+n,(x,n)=>x-n,(x,n)=>x*n,(x,n)=>x/n][i.k-1];ok(op(i.x,i.n)===i.v&&nums(it.pre).includes(i.v)&&nums(it.pre).includes(i.n),"n18 "+it.pre)});
gera(19,it=>{const i=it._info;if(i.k===1)ok(it.a===i.n2*i.p&&i.n2>i.n1,"n19 a");else if(i.k===2)ok(it.a===i.n2&&Number.isInteger(i.n2),"n19 b");else if(i.k===3)ok(it.a===i.q*i.m,"n19 c");else ok(it.a===i.q,"n19 d");ok(Number.isInteger(it.a)&&it.a>0,"n19 inteira")});
gera(20,it=>{const i=it._info;if(i.k===1||i.k===2){const n=nums(it.pre);ok(i.k===1?it.a===i.e*i.n:it.a===i.n&&n.includes(i.e*i.n),"n20 mapa "+it.pre)}else if(i.k===3){const m=sem(it.pre).match(/de (\d+) cm de largura será (reduzida para a metade|ampliada para o (dobro|triplo))/);const l=+m[1],f=m[2]==="reduzida para a metade"?.5:m[3]==="dobro"?2:3;ok(it.a===l*f,"n20 foto "+it.pre)}
  else{const f=it.extra.fig;ok(f.t==="tabela2"&&f.v[0][3]==="?"&&f.v[0][1]===2*f.v[0][0]&&f.v[0][2]===3*f.v[0][0]&&it.a===nums(f.cols[3])[0]*f.v[0][0]&&f.cols.map(c=>nums(c)[0]).join()===[1,2,3,nums(f.cols[3])[0]].join(),"n20 tabela")}});
gera(21,it=>{const i=it._info;if(i.k===4){ok(opt(it)==="1/"+(i.r+1)&&it.extra.opts.every((o,j)=>j+1===it.a||valFr(o)!==valFr(opt(it))),"n21 razão")}else{const p=i.k===2||i.k===3?i.r*i.u:i.u;ok(it.a===(i.k===1?i.u:i.r*i.u)&&i.tot===(i.r+1)*i.u&&nums(it.pre).includes(i.tot),"n21 "+it.pre)}});
// frações
const figVal=f=>f.n/f.d;
gera(22,it=>{const i=it._info,f=it.extra&&it.extra.fig;
  if(i.k===1){const d=f.d,n=f.n;ok(opt(it)===n+"/"+d&&it.extra.opts.every((o,j)=>j+1===it.a||valFr(o)!==n/d),"n22 pintada");const h=FC.fig(f);ok((h.match(/class="fp"/g)||[]).length===d&&(h.match(/data-on="1"/g)||[]).length===n,"n22 desenho")}
  else if(i.k===2)ok(it.a===f.n&&f.n<f.d,"n22 numerador");
  else if(i.k===3){const m=it.pre.match(/(\d+)\/(\d+) do inteiro/),v=+m[1]/+m[2];ok(figVal(opt(it).fig)===v&&it.extra.opts.every((o,j)=>j+1===it.a||figVal(o.fig)!==v),"n22 figura")}
  else ok(opt(it)===(f.d-f.n)+"/"+f.d&&it.extra.opts.every((o,j)=>j+1===it.a||valFr(o)!==(f.d-f.n)/f.d),"n22 não pintada")});
gera(23,it=>{const i=it._info,t=it.pre;
  if(i.k===1){const f=it.extra.fig,h=FC.fig(f);ok(f.n>f.d&&opt(it)===f.n+"/"+f.d&&(h.match(/data-on="1"/g)||[]).length===f.n&&(h.match(/class="fp"/g)||[]).length===Math.ceil(f.n/f.d)*f.d&&it.extra.opts.every((o,j)=>j+1===it.a||valFr(o)!==f.n/f.d),"n23 figuras")}
  else if(i.k===2){const m=t.match(/^(\d+)\/(\d+) = (\d+) inteiros? e __\/(\d+)/);ok(m&&+m[2]===+m[4]&&+m[3]*+m[2]+it.a===+m[1]&&it.a<+m[2],"n23 b "+t)}
  else if(i.k===3){const m=t.match(/igual a (\d+) inteiros? e (\d+)\/(\d+)\?/),v=+m[1]+ +m[2]/+m[3];ok(eq(valFr(opt(it)),v)&&it.extra.opts.every((o,j)=>j+1===it.a||!eq(valFr(o),v)),"n23 c "+t)}
  else{const m=t.match(/^(\d+) inteiros? e (\d+)\/(\d+) = __\/(\d+)/);ok(m&&it.a===+m[1]*+m[3]+ +m[2],"n23 d "+t)}});
gera(24,it=>{const i=it._info;if(i.k===1)ok(opt(it)===i.a+"/"+i.b&&nums(it.pre).includes(i.a)&&nums(it.pre).includes(i.b)&&it.extra.opts.every((o,j)=>j+1===it.a||valFr(o)!==i.a/i.b),"n24 a "+it.pre);else if(i.k===2)ok(it.a===i.b,"n24 b");else ok(it.a===i.a/i.b&&Number.isInteger(it.a)&&it.a>=2,"n24 c")});
gera(25,it=>{const i=it._info,f=it.extra.fig,h=FC.fig(f);
  if(i.k===1){ok(f.d===i.d&&f.pts[0].k===i.j&&f.lab[0]==="0"&&f.lab[i.d]==="1"&&opt(it)===i.j+"/"+i.d&&it.extra.opts.every((o,j)=>j+1===it.a||valFr(o)!==i.j/i.d),"n25 a");ok((h.match(/class="tk"/g)||[]).length===i.d+1,"n25 marcas")}
  else if(i.k===2){const d=f.d/2;ok(f.lab[d]==="1"&&f.lab[2*d]==="2"&&f.pts[0].k>d&&opt(it)===f.pts[0].k+"/"+d&&it.extra.opts.every((o,j)=>j+1===it.a||valFr(o)!==f.pts[0].k/d),"n25 b")}
  else if(i.k===3){const m=it.pre.match(/em (\d+)\/(\d+)\?/),v=+m[1]/+m[2],ret=o=>o.fig.pts[0].k/o.fig.d;ok(eq(ret(opt(it)),v)&&it.extra.opts.every((o,j)=>j+1===it.a||!eq(ret(o),v)),"n25 c "+it.pre)}
  else ok(it.a===f.d,"n25 d")});
gera(26,it=>{const i=it._info,t=it.pre;
  if(i.k===1){const m=t.match(/equivalente a (\d+)\/(\d+)\?/),v=+m[1]/+m[2];ok(eq(valFr(opt(it)),v)&&it.extra.opts.every((o,j)=>j+1===it.a||!eq(valFr(o),v)),"n26 a "+t)}
  else if(i.k===2){const m=t.match(/^(\d+)\/(\d+) = __\/(\d+)/);ok(it.a/+m[3]===+m[1]/+m[2],"n26 b "+t)}
  else if(i.k===3){const m=t.match(/^(\d+)\/(\d+) = (\d+)\/__/);ok(+m[3]/it.a===+m[1]/+m[2],"n26 c "+t)}
  else{const f=it.extra.fig,v=f.n/f.d;ok(eq(figVal(opt(it).fig),v)&&it.extra.opts.every((o,j)=>j+1===it.a||!eq(figVal(o.fig),v)),"n26 d")}});
gera(27,it=>{const i=it._info,t=it.pre;
  if(i.k<=3){const m=t.match(/maior: (\d+)\/(\d+) ou (\d+)\/(\d+)\?/),a=+m[1]/+m[2],b=+m[3]/+m[4];ok(a!==b&&valFr(opt(it))===Math.max(a,b),"n27 "+t);if(i.k===1)ok(m[2]===m[4],"n27 mesmo denominador");if(i.k===2)ok(m[1]===m[3],"n27 mesmo numerador")}
  else{const cres=!/decrescente/.test(t),l=s=>s.split("; ").map(valFr),c=l(opt(it));ok(c.every((x,j)=>j===0||(cres?x>c[j-1]:x<c[j-1])),"n27 ordem");it.extra.opts.forEach((o,j)=>{if(j+1!==it.a){const q=l(o);ok(!q.every((x,k)=>k===0||(cres?x>q[k-1]:x<q[k-1])),"n27 duas ordens certas")}})}});
// decimais
const decC=n=>n%100===0?String(n/100):Math.floor(n/100)+","+(n%100<10?"0"+n%100:n%10===0?String(n%100/10):String(n%100));
gera(28,it=>{const i=it._info,t=sem(it.pre);
  if(i.k===1){const f=it.extra.fig,h=FC.fig(f);ok(opt(it)===decC(f.n)&&(h.match(/data-on="1"/g)||[]).length===f.n&&it.extra.opts.length===3,"n28 quadro")}
  else if(i.k===2){const m=t.match(/^No número ([\d,]+), quanto vale o algarismo (\d)\?$/),n=m[1],d=m[2],i0=n.indexOf(","),s=n.replace(",","");ok(s.split(d).length===2,"n28 algarismo repetido");const pos=n.indexOf(d),casas=i0<0?0:i0-pos;ok(eq(it.a,+d*Math.pow(10,casas>0?casas-1:-(pos-i0))),"n28 valor "+t)}
  else if(i.k===3){const m=t.match(/^([\d,]+) = (\d+) \+ 0,(__|\d) \+ 0,0(__|\d)\./),n=num(m[1]);ok(m,"n28 formato");const d1=Math.floor(Math.round(n*100)/10)%10,d2=Math.round(n*100)%10;ok(m[3]==="__"?it.a===d1&&+m[4]===d2:it.a===d2&&+m[3]===d1,"n28 decomposição "+t);ok(+m[2]===Math.floor(n),"n28 inteiro")}
  else{const m=t.match(/^Como se lê o número ([\d,]+)\?$/),n=m[1],p=n.split(","),ipt=+p[0],f=p[1]||"",un=["","décimo","centésimo","milésimo"],un2=["","décimos","centésimos","milésimos"],a=+f,c=f.length;
    const cert=(ipt>0?ipt+" inteiro"+(ipt>1?"s":"")+" e ":"")+a+" "+(a===1?un[c]:un2[c]);ok(opt(it)===cert&&it.extra.opts.length===3,"n28 leitura "+t+" -> "+opt(it))}});
gera(29,it=>{const i=it._info,f=it.extra.fig;
  if(i.k===1)ok(f.d===10&&opt(it)===decC(f.pts[0].k*10),"n29 a");
  else if(i.k===2)ok(eq(it.a,num(f.lab[0])+f.pts[0].k/10)&&+f.lab[10]===+f.lab[0]+1,"n29 b");
  else if(i.k===3)ok(eq(it.a,num(f.lab[0])+f.pts[0].k/100)&&eq(num(f.lab[10]),num(f.lab[0])+.1),"n29 c "+JSON.stringify(f.lab));
  else{const v=num(it.pre.match(/em ([\d,]+)\?/)[1]),val=o=>num(o.fig.lab[0])+o.fig.pts[0].k/10;ok(eq(val(opt(it)),v)&&it.extra.opts.every((o,j)=>j+1===it.a||!eq(val(o),v)),"n29 d")}});
const FD=[["1/2","0,5"],["1/4","0,25"],["3/4","0,75"],["1/5","0,2"],["2/5","0,4"],["3/5","0,6"],["4/5","0,8"],["1/10","0,1"],["3/10","0,3"],["7/10","0,7"],["9/10","0,9"]];
gera(30,it=>{const i=it._info,t=sem(it.pre);
  if(i.k===1){const m=t.match(/maior: ([\d,]+) ou ([\d,]+)\?/),a=num(m[1]),b=num(m[2]);ok(a!==b&&num(opt(it))===Math.max(a,b),"n30 a")}
  else if(i.k===2){const cres=!/decrescente/.test(t),l=s=>s.split("; ").map(num),c=l(opt(it));ok(c.every((x,j)=>j===0||(cres?x>c[j-1]:x<c[j-1])),"n30 ordem");it.extra.opts.forEach((o,j)=>{if(j+1!==it.a){const q=l(o);ok(!q.every((x,k)=>k===0||(cres?x>q[k-1]:x<q[k-1])),"n30 duas ordens certas")}})}
  else if(i.k===3){const m=t.match(/igual a ([\d,\/]+)\?/),par=FD.find(p=>p[0]===m[1]||p[1]===m[1]);ok(par&&opt(it)===(m[1]===par[0]?par[1]:par[0]),"n30 c "+t);ok(it.extra.opts.every((o,j)=>j+1===it.a||(valFr(o.includes("/")?o:"1/1")!==undefined&&o!==opt(it))),"n30 c opções")}
  else{const m=t.match(/completa\? ([\d,]+) ◻ ([\d,]+)/),a=num(m[1]),b=num(m[2]),s=a<b?"<":a>b?">":"=";ok(opt(it)===s,"n30 sinal "+t)}});
gera(31,it=>{const i=it._info,c=calc(it.pre),soma=i.k===1||i.k===3;ok(c&&(c.op==="+")===soma&&eq(c.r,it.a)&&bonito(it.a)&&it.a>0&&it.a<1000,"n31 "+it.pre);ok(c.a>=1&&c.b>=1,"n31 operandos");const casas=s=>(s.split(",")[1]||"").length;
  const ops=sem(it.pre).match(/([\d,]+) [+−] ([\d,]+) =/);if(i.k<=2)ok(casas(ops[1])<=1&&casas(ops[2])<=1,"n31 décimos");else ok(casas(ops[1])<=2&&casas(ops[2])<=2&&(casas(ops[1])===2||casas(ops[2])===2),"n31 centésimos")});
gera(32,it=>{const i=it._info,n=nums(it.pre);ok(bonito(it.a)&&it.a>0,"n32 bonito "+it.a);
  if(i.k===1)ok(eq(it.a,(i.A+i.B)/100)&&n.includes(i.A/100)&&n.includes(i.B/100),"n32 a "+it.pre);else if(i.k===2)ok(eq(it.a,i.P-i.A/100)&&n.includes(i.A/100)&&n.includes(i.P),"n32 b "+it.pre);
  else if(i.k===3)ok(eq(it.a,(i.A+i.B)/100),"n32 c");else ok(eq(it.a,Math.abs(i.A-i.B)/100)&&i.A!==i.B,"n32 d")});
gera(33,it=>{const i=it._info,t=sem(it.pre);ok(bonito(it.a),"n33 bonito "+it.a);
  const c=calc(it.pre);if(i.k===1){ok(c&&eq(c.r,it.a)&&[10,100,1000].includes(c.b),"n33 a "+t)}else if(i.k===2){ok(c&&eq(c.r,it.a)&&c.b>=2&&c.b<=9&&c.a%1!==0||c&&eq(c.r,it.a),"n33 b "+t);ok(String(it.a).replace(/^\d+\.?/,"").length<=2,"n33 casas")}else if(i.k===3){ok(c&&eq(c.r,it.a)&&c.a>=2&&c.a<=9,"n33 c "+t)}else{const n=nums(it.pre);ok(eq(it.a,i.A*i.m/100)&&n.includes(i.m),"n33 d "+t)}});
gera(34,it=>{const i=it._info,t=sem(it.pre);ok(bonito(it.a)&&String(it.a).replace(/^\d+\.?/,"").length<=2,"n34 bonito "+it.a);
  if(i.k<=3){const c=calc(it.pre);ok(c&&c.op==="÷"&&eq(c.r,it.a),"n34 "+t);if(i.k===1)ok(c.b>=2&&c.b<=9&&c.a%1!==0||c.b>=2,"n34 a divisor");if(i.k===2)ok([2,4,5].includes(c.b)&&c.a%c.b!==0&&Number.isInteger(c.a),"n34 b");if(i.k===3)ok([10,100,1000].includes(c.b),"n34 c")}
  else ok(eq(it.a,i.Q/100)&&i.Q*i.d===i.N&&nums(it.pre).includes(i.N/100)&&nums(it.pre).includes(i.d),"n34 d "+t)});
gera(35,it=>{const i=it._info,t=sem(it.pre);if(i.k<=4){const p=[10,50,25,75][i.k-1],m=t.match(/(\d+)% de (\d+) =/)||t.match(/tinha (\d+) .* e vendeu (\d+)% delas/);const n=m[1]===String(p)?+m[2]:+m[1];ok(it.a===n*p/100&&Number.isInteger(it.a)&&it._info.p===p,"n35 "+t)}else{const A=[["10%","a décima parte"],["25%","a quarta parte"],["50%","a metade"],["75%","três quartos"],["100%","o inteiro"]],par=A.find(x=>t.includes(x[0])||t.includes(x[1])),certo=opt(it);ok(par&&(certo===par[0]||certo===par[1])&&it.extra.opts.length===3,"n35 associar "+t)}});
gera(36,it=>{const i=it._info,n=nums(it.pre);ok([10,25,50].includes(i.pc)&&i.desc===i.pr*i.pc/100&&Number.isInteger(i.desc)&&n.includes(i.pr)&&n.includes(i.pc),"n36 base "+it.pre);
  if(i.k===1)ok(it.a===i.desc,"n36 a");else if(i.k===2)ok(it.a===i.pr-i.desc,"n36 b");else if(i.k===3)ok(it.a===i.pr+i.desc,"n36 c");else{const loja=i.desc>i.fixo?"A":"B";ok(opt(it)==="loja "+loja&&i.desc!==i.fixo,"n36 d "+it.pre)}});
// geometria
const par=(x,y)=>"("+x+", "+y+")";
gera(37,it=>{const i=it._info,f=it.extra.fig,h=FC.fig(f);ok((h.match(/class="pt"/g)||[]).length===f.pts.length,"n37 pontos desenhados");f.pts.forEach(p=>ok(p.x>=0&&p.x<=(f.max||10)&&p.y>=0&&p.y<=(f.max||10),"n37 fora do plano"));
  if(i.k===1)ok(opt(it)===par(f.pts[0].x,f.pts[0].y)&&it.extra.opts.length===3,"n37 a");
  else if(i.k===2){const m=it.pre.match(/está em \((\d+), (\d+)\)\?/),p=f.pts.find(q=>q.x===+m[1]&&q.y===+m[2]);ok(p&&opt(it)===p.l&&f.pts.filter(q=>q.x===+m[1]&&q.y===+m[2]).length===1,"n37 b")}
  else if(i.k===3){ok(f.sheet&&opt(it)==="ABCDEFGH".charAt(f.pts[0].x-1)+f.pts[0].y&&it.extra.opts.length===3,"n37 c")}
  else ok(f.pts.length===2&&(f.pts[0].x===f.pts[1].x||f.pts[0].y===f.pts[1].y)&&it.a===Math.abs(f.pts[0].x-f.pts[1].x)+Math.abs(f.pts[0].y-f.pts[1].y)&&it.a>=2,"n37 d")});
gera(38,it=>{const i=it._info,t=it.pre,f=it.extra&&it.extra.fig;
  if(i.k===1){const m=t.match(/ande (\d+) unidades? para a direita e (\d+) para cima/),p=f.pts[0];ok(opt(it)===par(p.x+ +m[1],p.y+ +m[2])&&p.x+ +m[1]<=10&&p.y+ +m[2]<=10,"n38 a "+t)}
  else if(i.k===2){const[a,b]=f.pts;ok(b.x>a.x&&b.y>a.y&&it.a===b.x-a.x+b.y-a.y&&b.x<=10&&b.y<=10,"n38 b")}
  else if(i.k===3){const m=t.match(/virado para o (norte|leste|sul|oeste).* dar (um quarto de volta para a direita|um quarto de volta para a esquerda|meia volta)/),dd=["norte","leste","sul","oeste"],d0=dd.indexOf(m[1]),g={"um quarto de volta para a direita":1,"um quarto de volta para a esquerda":3,"meia volta":2}[m[2]];ok(opt(it).startsWith(dd[(d0+g)%4])&&it.extra.opts.length===3,"n38 giro "+t)}
  else{const m=t.match(/ande (\d+) unidades? para a direita, (\d+) para cima e depois (\d+) para a esquerda/),p=f.pts[0];ok(opt(it)===par(p.x+ +m[1]-+m[3],p.y+ +m[2])&&p.x+ +m[1]<=10&&p.y+ +m[2]<=10&&p.x+ +m[1]-+m[3]>=0,"n38 d "+t)}
  if(it.extra.opts)ok(new Set(it.extra.opts).size===it.extra.opts.length,"n38 opções repetidas")});
const BASES={triangular:3,quadrada:4,pentagonal:5,hexagonal:6};
gera(39,it=>{const i=it._info;
  if(i.k===1){const m={"cubo-a":"cubo","bloco":"bloco retangular","piramide":"pirâmide de base quadrada","cilindro":"cilindro","cone":"cone"};ok(opt(it)===m[it.extra.fig.n],"n39 a")}
  else if(i.k===2){const m=it.pre.match(/^Um(a)? (prisma|pirâmide) de base (\w+) tem quant(?:as|os) (faces|arestas|vértices)\?$/),n=BASES[m[3]],pr=m[2]==="prisma";ok(it.a===(pr?{faces:n+2,arestas:3*n,"vértices":2*n}:{faces:n+1,arestas:2*n,"vértices":n+1})[m[4]],"n39 b "+it.pre)}
  else if(i.k===3){const h=FC.fig(it.extra.fig),c=(h.match(/data-k="ci"/g)||[]).length;ok(it.a===c&&c>=1,"n39 c")}
  else{const A={"cilindro":"duas bases circulares e uma superfície curva","cone":"uma base circular e uma ponta, o vértice","pirâmide de base quadrada":"uma base quadrada e quatro faces triangulares","prisma de base triangular":"duas bases triangulares e três faces retangulares","cubo":"seis faces quadradas","esfera":"nenhuma face plana"};ok(it.pre.includes(A[opt(it)])&&it.extra.opts.length===3,"n39 d")}});
const L40={"triângulo":3,"quadrado":4,"retângulo":4,"trapézio":4,"paralelogramo":4,"losango":4,"pentágono":5,"hexágono":6};
gera(40,it=>{const i=it._info;if(i.k===1)ok(it.a===L40[it.extra.fig.n],"n40 a");else if(i.k===2){const n=+it.pre.match(/tem (\d+) lados/)[1];ok(L40[opt(it)]===n&&it.extra.opts.every((o,j)=>j+1===it.a||L40[o]!==n),"n40 b")}
  else if(i.k===3)ok(it.a===({"quadrado":4,"retângulo":4})[it.extra.fig.n]||(it.a===0&&!["quadrado","retângulo"].includes(it.extra.fig.n)),"n40 c");else ok(typeof opt(it)==="string"&&it.extra.opts.length===3&&it.extra.opts.every((o,j)=>j+1===it.a||o!==opt(it)),"n40 d")});
const norm=c=>JSON.stringify(c.map(q=>q.join(",")).sort());
gera(41,it=>{const i=it._info,f=it.extra.fig;ok(i.A.length*i.s*i.s===i.B.length,"n41 área cresce com o quadrado da escala");ok(i.B.every(q=>q[0]<5&&q[1]<5),"n41 cabe na caixa");
  if(i.k===1){ok(it.a===i.s&&norm(f.shapes[1].cells)===norm(i.B)&&norm(f.shapes[0].cells)===norm(i.A),"n41 a")}else if(i.k===2){ok(it.a===i.s&&norm(f.shapes[0].cells)===norm(i.B),"n41 b")}
  else if(i.k===3)ok(opt(it)==="os ângulos continuam iguais","n41 c");else{ok(norm(opt(it).fig.shapes[0].cells)===norm(i.B)&&it.extra.opts.length>=2,"n41 d");it.extra.opts.forEach((o,j)=>{if(j+1!==it.a)ok(norm(o.fig.shapes[0].cells)!==norm(i.B),"n41 d errada igual à certa")})}});
// medidas
gera(42,it=>{const i=it._info,t=sem(it.pre);ok(bonito(it.a)&&it.a>0,"n42 bonito "+it.a);
  if(i.k<=3){const m=t.match(/^([\d,]+) (km|m|cm|mm|kg|g|L|mL) = __ (km|m|cm|mm|kg|g|L|mL)\./),F={"km>m":1000,"m>cm":100,"cm>mm":10,"kg>g":1000,"L>mL":1000},a=num(m[1]);const dir=F[m[2]+">"+m[3]],inv=F[m[3]+">"+m[2]];ok(dir?eq(it.a,a*dir):eq(it.a,a/inv),"n42 "+t);ok(String(it.a).replace(/^\d+\.?/,"").length<=3,"n42 casas")}
  else{ok(Number.isInteger(it.a)&&it.a>0,"n42 d "+t)}});
gera(43,it=>{const i=it._info,t=sem(it.pre);
  if(i.k===1){const m=t.match(/às (\d+:\d\d) e terminou às (\d+:\d\d)/),h=s=>{const[a,b]=s.split(":").map(Number);return a*60+b};ok(h(m[2])-h(m[1])===it.a&&it.a>=35,"n43 a")}
  else if(i.k===2){const m=t.match(/^(\d+) h (\d+) min = __ min/);ok(it.a===60*+m[1]+ +m[2],"n43 b")}
  else if(i.k===3){const g=it.extra.fig.g,d=+t.match(/(?:subir|descer) (\d+) graus/)[1],sobe=/subir/.test(t);ok(it.a===(sobe?g+d:g-d)&&it.a>=0&&it.a<=45&&g%5===0,"n43 c "+t)}
  else{let m=t.match(/^(\d+) semanas? e (\d+) dias? = __ dias/);if(m)ok(it.a===7*+m[1]+ +m[2],"n43 d1");else{m=t.match(/^(\d+) dias = __ semanas/);ok(m&&it.a*7===+m[1],"n43 d2 "+t)}}});
const poliOk=c=>{const s=new Set(c.map(q=>q.join(",")));if(s.size!==c.length)return false;const seen=new Set([c[0].join(",")]),fila=[c[0]];while(fila.length){const q=fila.pop();[[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>{const k=(q[0]+d[0])+","+(q[1]+d[1]);if(s.has(k)&&!seen.has(k)){seen.add(k);fila.push([q[0]+d[0],q[1]+d[1]])}})}return seen.size===s.size&&c.every(q=>q[0]>=0&&q[0]<5&&q[1]>=0&&q[1]<5)};
const perim=c=>{const s=new Set(c.map(q=>q.join(",")));let p=0;c.forEach(q=>[[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>{if(!s.has((q[0]+d[0])+","+(q[1]+d[1])))p++}));return p};
gera(44,it=>{const i=it._info,f=it.extra.fig;if(f)ok(poliOk(f.shapes[0].cells),"n44 polígono conexo e dentro da caixa");
  if(i.k===1)ok(it.a===f.shapes[0].cells.length,"n44 área");else if(i.k===2)ok(it.a===perim(f.shapes[0].cells),"n44 perímetro");
  else if(i.k===3){const a=it.extra.opts.map(o=>o.fig.shapes[0].cells.length),mx=Math.max(...a);ok(a[it.a-1]===mx&&a.filter(x=>x===mx).length===1,"n44 maior área");it.extra.opts.forEach(o=>ok(poliOk(o.fig.shapes[0].cells),"n44 opção"))}
  else{const P=perim(f.shapes[0].cells),A=f.shapes[0].cells.length,c=opt(it).fig.shapes[0].cells;ok(poliOk(c)&&perim(c)===P&&c.length!==A,"n44 certa: mesmo perímetro e área diferente");it.extra.opts.forEach((o,j)=>{const w=o.fig.shapes[0].cells;ok(poliOk(w),"n44 opção válida");if(j+1!==it.a)ok(perim(w)!==P,"n44 errada com o mesmo perímetro")})}});
gera(45,it=>{const i=it._info;
  if(i.k===1){const f=it.extra.fig,h=FC.fig(f);ok(it.a===f.a*f.b*f.c&&(h.match(/class="cq"/g)||[]).length===f.a*f.b+f.a*f.c+f.b*f.c,"n45 a")}
  else if(i.k===2){const n=nums(it.pre);ok(it.a===n[0]*n[1],"n45 b "+it.pre)}
  else if(i.k===3){const v=it.extra.opts.map(o=>o.fig.a*o.fig.b*o.fig.c),mx=Math.max(...v);ok(v[it.a-1]===mx&&v.filter(x=>x===mx).length===1,"n45 c")}
  else{const n=nums(it.pre);ok(it.a===n[0]*n[1]*n[2],"n45 d "+it.pre)}});
// dados e acaso
gera(46,it=>{const i=it._info;
  if(i.k===1){if(it.extra&&it.extra.fig)ok(it.a===new Set(it.extra.fig.parts).size,"n46 cores");else ok(/dado/.test(it.pre)?it.a===6:it.a===2,"n46 a")}
  else if(i.k===2){const c={};it.extra.fig.parts.forEach(p=>c[p]=(c[p]||0)+1);const igual=Object.values(c).every(x=>x===Object.values(c)[0]);ok(opt(it)===(igual?"sim":"não"),"n46 b")}
  else if(i.k===3){const cor=it.pre.match(/parar em (\w+)\?/)[1],c=it.extra.fig.parts.filter(p=>p===cor).length,t=it.extra.fig.parts.length;ok(valFr(opt(it))===c/t&&opt(it)===c+"/"+t&&it.extra.opts.every((o,j)=>j+1===it.a||valFr(o)!==c/t),"n46 c "+it.pre)}
  else{const e={"sair um número par":3,"sair um número ímpar":3,"sair o número 5":1,"sair um número maior que 4":2,"sair um número menor que 3":2,"sair um múltiplo de 3":2},ev=Object.keys(e).find(k=>it.pre.includes(k));ok(opt(it)===e[ev]+"/6"&&it.extra.opts.every((o,j)=>j+1===it.a||valFr(o)!==e[ev]/6),"n46 d "+it.pre)}});
gera(47,it=>{const i=it._info,f=it.extra.fig,h=FC.fig(f),lab=f.labels;
  if(i.k===1){ok(f.t==="bars"&&it.a===f.values[lab.findIndex(l=>it.pre.includes("valor de "+l+"?"))],"n47 a "+it.pre)}
  else{ok(f.t==="linhas"&&(h.match(/class="pt"/g)||[]).length===lab.length&&f.values.every(v=>v>=0&&v<=f.ymax),"n47 linhas");
    if(i.k===2)ok(it.a===f.values[lab.findIndex(l=>it.pre.includes("valor de "+l+"?"))],"n47 b");
    else if(i.k===3){const mx=Math.max(...f.values);ok(f.values.filter(v=>v===mx).length===1&&opt(it)===lab[f.values.indexOf(mx)],"n47 c")}
    else{const m=it.pre.match(/De (.+) para (.+), quanto o valor (aumentou|diminuiu)/),a=f.values[lab.indexOf(m[1])],b=f.values[lab.indexOf(m[2])];ok(it.a===Math.abs(b-a)&&it.a>0&&(m[3]==="aumentou")===(b>a),"n47 d "+it.pre)}}});
// geral: respostas bonitas, sem repetição de opções e uma só certa
FC.G5.forEach(e=>{for(let r=0;r<150;r++){const it=e.gen();ok(typeof it.a==="number"&&bonito(it.a)&&it.a>=0&&it.a<=999999,"nível "+e.nivel+": resposta fora do formato: "+it.a);
  if(it.extra&&it.extra.opts){ok(it.a>=1&&it.a<=it.extra.opts.length&&new Set(it.extra.opts.map(o=>JSON.stringify(o))).size===it.extra.opts.length,"nível "+e.nivel+": opções");}
  if(!(it.extra&&it.extra.opts)&&it.a>999999)falha("resposta passa de 6 algarismos");
  ok(!/undefined|NaN|\[object/.test(it.pre+JSON.stringify(it.extra||"")),"nível "+e.nivel+": texto com undefined ou NaN: "+it.pre)}});
// o desenho das figuras novas
{const h=FC.fig({t:"fracaoM",d:4,n:7,forma:"barra"});ok((h.match(/class="fp"/g)||[]).length===8&&(h.match(/data-on="1"/g)||[]).length===7,"fracaoM barras");
 const hc=FC.fig({t:"fracaoM",d:3,n:5,forma:"circulo"});ok((hc.match(/class="fp"/g)||[]).length===6&&(hc.match(/data-on="1"/g)||[]).length===5,"fracaoM círculos");
 const c=FC.fig({t:"cubos",a:3,b:2,c:2});ok((c.match(/class="cq"/g)||[]).length===3*2+3*2+2*2,"cubos: faces visíveis");
 const a=FC.fig({t:"arvore",niv:[["a","b"],["x","y","z"]]});ok((a.match(/class="lf"/g)||[]).length===6,"árvore: pontas");
 const l=FC.fig({t:"linhas",title:"t",labels:["a","b"],values:[1,2],ymax:4,ystep:2});ok((l.match(/class="pt"/g)||[]).length===2,"linhas: pontos");
 const p=FC.fig({t:"cartesiano",pts:[{x:1,y:2,l:"A"}]});ok(/data-x="1" data-y="2"/.test(p),"cartesiano: ponto");}
console.log(falhas?"\n"+falhas+" falha(s)":"grade5: tudo certo");process.exit(falhas?1:0);
