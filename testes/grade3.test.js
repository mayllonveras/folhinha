/* Testes dos geradores da grade do 3º ano (níveis 1 a 7), conforme bncc/fichas/3ano-niveis-01-07.md. Rodar com: node testes/grade3.test.js
   A resposta é sempre recalculada a partir do que está no desenho ou no texto, nunca do campo que o gerador devolve. */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');require('../grade1.js');require('../grade2.js');require('../grade3.js');
const FC=global.FC,G=FC.G3BY;
let falhas=0;const falha=(n,m)=>{falhas++;if(falhas<40)console.log("  FALHA",n,m)};
const N=6000,draw=g=>{const a=[];for(let i=0;i<N;i++)a.push(g.gen());return a};
const SP=" ",num=s=>Number(String(s).replace(/ /g,""));          // "3 456" → 3456
const temSep=(n)=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,SP);
const cnt=(html,cls)=>(html.match(new RegExp('class="'+cls+'"','g'))||[]).length;
const niv=g=>{FC.LEVELS=[{gen:FC.G2BY.g2n08.gen},{gen:g.gen}];return FC.makeItems(1).filter(p=>!p._rev)};

/* Leitor de extenso, independente do gerador: soma as palavras e multiplica por mil na palavra "mil". */
const VAL={zero:0,um:1,dois:2,"três":3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,onze:11,doze:12,treze:13,quatorze:14,quinze:15,dezesseis:16,dezessete:17,dezoito:18,dezenove:19,
 vinte:20,trinta:30,quarenta:40,cinquenta:50,sessenta:60,setenta:70,oitenta:80,noventa:90,cem:100,cento:100,duzentos:200,trezentos:300,quatrocentos:400,quinhentos:500,seiscentos:600,setecentos:700,oitocentos:800,novecentos:900};
function lerExtenso(t){let total=0,cur=0;for(const w of t.split(/[ ,]+/)){if(w==="e"||w==="")continue;if(w==="mil"){total+=(cur||1)*1000;cur=0}else if(w in VAL)cur+=VAL[w];else return NaN}return total+cur}
const regraE=(txt,n)=>{                                            // vírgula ou "e" depois do mil, conforme o resto
 const r=n%1000;if(n<1000||n>9999)return "fora";
 if(r===0)return /mil$/.test(txt);
 const e=(r<100||r%100===0);return e?/mil e /.test(txt)&&!/mil, /.test(txt):/mil, /.test(txt)&&!/mil e /.test(txt)};

/* ---- Nível 1 ---- */
{const its=draw(G.g3n01);let t1=0,t2=0,zero=0;
 for(const p of its){
  let n,m;
  if((m=p.pre.match(/^Escreva em algarismos: (.+)\.$/))){t1++;n=lerExtenso(m[1]);if(n!==p.a)falha(1,"extenso "+m[1]+" → "+p.a+" (lido "+n+")");
   if(!regraE(m[1],p.a))falha(1,"regra do e/vírgula: "+m[1]);if(/\bum mil\b/.test(m[1]))falha(1,"'um mil'");
   if(/\bcem\b/.test(m[1])!==(p.a%1000===100))falha(1,"cem/cento: "+m[1]);if(/\bcento\b/.test(m[1])!==(Math.floor(p.a%1000/100)===1&&p.a%100!==0))falha(1,"cento: "+m[1])}
  else if((m=p.pre.match(/^Como se lê o número ([\d ]+)\?$/))){t2++;n=num(m[1]);if(m[1]!==temSep(n))falha(1,"separador de milhar: "+m[1]);
   const op=p.extra.opts,vals=op.map(lerExtenso);if(op.length!==3||new Set(op).size!==3||vals.some(x=>!(x>=1000&&x<=9999)))falha(1,"opções: "+op);
   if(vals[p.a-1]!==n)falha(1,"extenso errado: "+n+" → "+op[p.a-1]);op.forEach((o,i)=>{if(!regraE(o,vals[i]))falha(1,"regra do e/vírgula na opção: "+o)});
   vals.forEach((v,i)=>{if(i===p.a-1)return;const a=String(n),b=String(v);let dif=0;for(let k=0;k<4;k++)if(a[k]!==b[k])dif++;
    const perm=[...a].sort().join("")===[...b].sort().join("");if(dif!==1&&!perm)falha(1,"opção errada que não é parecida: "+n+" vs "+v)})}
  else{falha(1,"pergunta: "+p.pre);continue}
  if(/0/.test(String(n)))zero++;if(n<1000||n>9999)falha(1,"fora de 1000 a 9999");
 }
 console.log("nível 1: algarismos",(100*t1/N).toFixed(0)+"%, extenso",(100*t2/N).toFixed(0)+"%, com zero",(100*zero/N).toFixed(0)+"%");
 if(Math.abs(t1/N-.5)>.04)falha(1,"proporção dos tipos");if(zero/N<.2||zero/N>.45)falha(1,"zero fora de 20% a 45%")}
{ // ida e volta de todos os números de 1 a 9999
 let ruim=0;for(let n=1000;n<=9999;n++){const t=FC.extenso(n);if(lerExtenso(t)!==n||!regraE(t,n))ruim++}
 console.log("extenso de 1000 a 9999: erros de ida e volta",ruim);if(ruim)falha(1,ruim+" números com extenso errado")}

/* ---- Nível 2 ---- */
{const its=draw(G.g3n02);let t1=0,t2=0,t3=0,zero=0;const LEG="Cada cubo grande vale 1000, cada placa vale 100, cada barra vale 10 e cada quadradinho vale 1. ";
 for(const p of its){
  const f=p.extra.fig,html=FC.fig(f);if(f.t!=="placas"||f.m===undefined){falha(2,"figura");continue}
  const c=[cnt(html,"cb"),cnt(html,"pl"),cnt(html,"br"),cnt(html,"un")];
  if(c[0]!==f.m||c[1]!==f.h||c[2]!==f.d||c[3]!==f.o||c.some(x=>x>9))falha(2,"peças desenhadas: "+c+" vs "+[f.m,f.h,f.d,f.o]);
  const n=c[0]*1000+c[1]*100+c[2]*10+c[3];if(n<1000||n>9999)falha(2,"número fora de 1000 a 9999");
  if(p.pre.startsWith(LEG)){t1++;if(p.pre!==LEG+"Quanto vale tudo junto?"||p.a!==n)falha(2,"valor: "+p.a+" vs "+n);if(c.slice(1).includes(0))zero++}
  else{const m=p.pre.match(/^O número ([\d ]+) (?:é formado por|tem) (quantos cubos de 1000|quantas placas de 100|quantas barras de 10|quantos quadradinhos soltos)\?$/);
   if(!m){falha(2,"pergunta: "+p.pre);continue}if(num(m[1])!==n||m[1]!==temSep(n))falha(2,"o número da pergunta não é o do desenho");
   const k=["cubos","placas","barras","quadradinhos"].findIndex(x=>m[2].includes(x));if(p.a!==c[k])falha(2,"resposta: "+p.pre+" → "+p.a+" (desenho "+c+")");
   if(/tem quantos/.test(p.pre)!==(k===3)&&/^O número \S+ tem /.test(p.pre)!==(k===3))falha(2,"verbo");
   if(p.a===0){t3++;zero++;if(k===0)falha(2,"zero em cubos")}else t2++}
 }
 console.log("nível 2: valor",(100*t1/N).toFixed(0)+"%, casas cheias",(100*t2/N).toFixed(0)+"%, casa vazia",(100*t3/N).toFixed(0)+"%, com zero",(100*zero/N).toFixed(0)+"%");
 if(Math.abs(t3/N-.125)>.03)falha(2,"casa vazia deveria ser ~12%");if(zero/N<.2||zero/N>.45)falha(2,"zeros fora de 20% a 45%")}

/* ---- Nível 3 ---- */
{const its=draw(G.g3n03),tp={1:0,2:0,3:0,4:0};let zero=0,zr=0;const ORD=["milhar","centena","dezena","unidade"];
 for(const p of its){
  let m=p.pre.match(/^Qual número tem (\d+) milhar(?:es)?, (\d+) centenas?, (\d+) dezenas? e (\d+) unidades?\?$/);
  if(m){tp[1]++;const d=m.slice(1,5).map(Number);if(p.a!==d[0]*1000+d[1]*100+d[2]*10+d[3]||d[0]<1)falha(3,"montar: "+p.pre+" → "+p.a);
   if(!p.pre.includes(d[0]===1?"1 milhar,":d[0]+" milhares,")||(d[1]===1&&!p.pre.includes("1 centena,"))||(d[2]===1&&!p.pre.includes("1 dezena "))||(d[3]===1&&!p.pre.includes("1 unidade?")))falha(3,"concordância: "+p.pre);
   if(d.includes(0))zero++;continue}
  m=p.pre.match(/^No número ([\d ]+), quanto vale o algarismo (\d)\?$/);
  if(m){tp[2]++;const n=num(m[1]),a=m[2];if(a==="0"||m[1]!==temSep(n))falha(3,"valor");const pos=[...String(n)].map((c,i)=>c===a?i:-1).filter(i=>i>=0);
   if(pos.length!==1||p.a!==Number(a)*10**(3-pos[0]))falha(3,"valor errado: "+p.pre+" → "+p.a);if(/0/.test(String(n)))zero++;continue}
  m=p.pre.match(/^Em ([\d ]+), o algarismo (\d) está em que ordem\?$/);
  if(m){tp[3]++;const n=num(m[1]),a=m[2],pos=[...String(n)].map((c,i)=>c===a?i:-1).filter(i=>i>=0),op=p.extra.opts;
   if(pos.length!==1||a==="0"||op[p.a-1]!==ORD[pos[0]]||op.length!==4||new Set(op).size!==4)falha(3,"ordem: "+p.pre+" → "+op[p.a-1]);if(/0/.test(String(n)))zero++;continue}
  m=p.pre.match(/^Que algarismo está na casa (das centenas|das dezenas|das unidades) de ([\d ]+)\?$/);
  if(m){tp[4]++;zr++;zero++;const n=String(num(m[2])),i={"das centenas":1,"das dezenas":2,"das unidades":3}[m[1]];if(n[i]!=="0"||p.a!==0)falha(3,"casa vazia: "+p.pre+" → "+p.a);continue}
  falha(3,"pergunta: "+p.pre)}
 console.log("nível 3: tipos",JSON.stringify(tp),"com zero",(100*zero/N).toFixed(0)+"%");for(const k in tp)if(Math.abs(tp[k]/N-.25)>.04)falha(3,"tipo "+k+" fora de 25%");
 if(zero/N<.25||zero/N>.6)falha(3,"zero fora do esperado")}

/* ---- Nível 4 ---- */
{const its=draw(G.g3n04),tp={1:0,2:0,3:0,4:0,5:0,6:0};let zero=0,z13=0;
 for(const p of its){
  const k=p._info.tipo;tp[k]++;let m;const pre=p.pre,post=p.post,S=n=>String(n).replace(/ /g,"");
  const nums=t=>(S(t).match(/\d+/g)||[]).map(Number);
  if(k===1){m=pre.match(/^([\d ]+) = ([\d ]+) \+ (\d+) \+ (\d+) \+$/);const[n,a,b,c]=[m[1],m[2],m[3],m[4]].map(Number.constructor===Number?Number:Number).map((x,i)=>i===0?num(m[1]):num(m[i+1]));
   if(!m||a+b+c+p.a!==num(m[1])||p.a>9||a%1000||b%100||c%10)falha(4,"tipo 1: "+pre+" → "+p.a);if(p.a===0){zero++;z13++}}
  else if(k===2){m=pre.match(/^([\d ]+) = ([\d ]+) \+ (\d+) \+$/);const o=nums(post)[0];if(!m||num(m[2])+num(m[3])+p.a+o!==num(m[1])||p.a%10||p.a>90)falha(4,"tipo 2: "+pre+" "+post+" → "+p.a);if(p.a===0){zero++;z13++}}
  else if(k===3){m=pre.match(/^([\d ]+) = ([\d ]+) \+$/);const[b,c]=nums(post);if(!m||num(m[2])+p.a+b+c!==num(m[1])||p.a%100||p.a>900)falha(4,"tipo 3: "+pre+" "+post+" → "+p.a);if(p.a===0){zero++;z13++}}
  else if(k===4){m=pre.match(/^([\d ]+) =$/);const[a,b,c]=nums(post);if(!m||p.a+a+b+c!==num(m[1])||p.a%1000||p.a<1000)falha(4,"tipo 4: "+pre+" "+post+" → "+p.a)}
  else if(k===5){m=pre.match(/^Qual número é (.+)\?$/);const parts=m[1].split(" + ").map(num);if(p.a!==parts.reduce((a,b)=>a+b,0)||parts.some(x=>x===0))falha(4,"tipo 5: "+pre+" → "+p.a)}
  else{m=pre.match(/^([\d ]+) = ([\d ]+) \+$/);if(!m||num(m[2])>=num(m[1])||num(m[2])%100||p.a!==num(m[1])-num(m[2])||p.a<=0)falha(4,"tipo 6: "+pre+" → "+p.a);if(!(num(m[2])%1000===0||num(m[2])%100===0))falha(4,"primeira parcela")}
  if(k>=4&&/(^|\D)0(\D|$)/.test(S(pre)+" "+S(post)))falha(4,"zero fora dos tipos 1 a 3: "+pre+" "+post);
  if(pre.match(/\d{4}/))falha(4,"número de 4 algarismos sem espaço de milhar: "+pre);
 }
 console.log("nível 4: tipos",JSON.stringify(tp),"zeros nos tipos 1 a 3",(100*z13/(tp[1]+tp[2]+tp[3])).toFixed(0)+"%");for(const k in tp)if(Math.abs(tp[k]/N-1/6)>.035)falha(4,"tipo "+k)}

/* ---- Nível 5 ---- */
{const its=draw(G.g3n05),tp={mm:0,ordem:0,sinal:0},modos={};let pos=[0,0,0,0];
 for(const p of its){const i=p._info,op=p.extra.opts;tp[i.tipo]++;
  if(i.tipo==="mm"){const ns=op.map(num),certa=i.maior?Math.max(...ns):Math.min(...ns);if(ns[p.a-1]!==certa||new Set(ns).size!==3||ns.some(x=>x<1000||x>9999)||op.length!==3)falha(5,"maior/menor: "+op+" → "+p.a);
   if(op.some((o,k)=>o!==temSep(ns[k])))falha(5,"separador")}
  else if(i.tipo==="ordem"){const L=op.map(o=>o.split(", ").map(num)),asc=/menor para o maior/.test(p.pre),certa=L[p.a-1],ord=[...certa].sort((a,b)=>asc?a-b:b-a);
   if(ord.join()!==certa.join())falha(5,"ordem: "+op+" → "+p.a);const base=[...certa].sort((a,b)=>a-b).join();L.forEach((l,k)=>{if([...l].sort((a,b)=>a-b).join()!==base)falha(5,"outros números");if(k!==p.a-1&&l.join()===certa.join())falha(5,"duas certas")});
   if(new Set(op).size!==3)falha(5,"listas repetidas")}
  else{const m=p.pre.match(/^Qual sinal completa: (.+) ○ (.+)\?$/);if(!m){falha(5,"pergunta: "+p.pre);continue}
   const val=t=>t.split(" + ").map(num).reduce((a,b)=>a+b,0),a=val(m[1]),b=val(m[2]),s=a>b?">":a<b?"<":"=";
   if(op[p.a-1]!==s||new Set(op).size!==3||op.length!==3)falha(5,"sinal: "+p.pre+" → "+op[p.a-1]+" esperado "+s);
   if(i.igual&&(!(/ \+ /.test(m[1])||/ \+ /.test(m[2]))||s!=="="))falha(5,"igualdade decomposta: "+p.pre);if(!i.igual&&(/ \+ /.test(p.pre)||s==="="))falha(5,"sinal sem decomposição: "+p.pre)}
  modos[i.modo]=(modos[i.modo]||0)+1;pos[p.a]++;
 }
 console.log("nível 5:",JSON.stringify(tp),"modos",JSON.stringify(modos));
 for(const k of[1,2,3])if(Math.abs(pos[k]/N-1/3)>.04)falha(5,"posição da certa não é uniforme");
 if(Math.abs(tp.mm/N-.5)>.04||Math.abs(tp.ordem/N-.25)>.04)falha(5,"proporção dos tipos")}
{ const its=draw(G.g3n05);let tr=0,trOk=0,ze=0,zeOk=0,sep=0,sepOk=0;
 for(const p of its){const i=p._info;if(i.tipo==="sinal"||!i.modo)continue;const v=i.v;
  if(i.modo==="troca"){tr++;if(new Set(v.map(n=>[...String(n)].sort().join(""))).size===1)trOk++}
  if(i.modo==="zero"){ze++;const s=v.map(n=>[...String(n)].filter(c=>c!=="0").join("")+"|"+(String(n).match(/0/g)||[]).length);if(new Set(s).size===1)zeOk++}
  if(i.modo==="sep"){sep++;const hs=v.map(n=>Math.floor(n/1000)).sort((a,b)=>a-b);if(hs[1]-hs[0]>=2&&hs[2]-hs[1]>=2)sepOk++}}
 console.log("nível 5: trocados",trOk+"/"+tr+", zero no meio",zeOk+"/"+ze+", separados",sepOk+"/"+sep);
 if(trOk!==tr||zeOk!==ze||sepOk!==sep)falha(5,"modos mal formados")}

/* ---- Nível 6 ---- */
{const its=draw(G.g3n06),tp={ler:0,onde:0,falta:0};
 for(const p of its){const i=p._info;tp[i.tipo]++;const f=p.extra.fig,r=i.r,n=(r[1]-r[0])/r[2];
  if(f.min!==r[0]||f.max!==r[1]||f.step!==r[2]||n<4||n>10)falha(6,"reta fora do formato");
  const livre=v=>v>r[0]&&v<r[1]&&(v-r[0])%r[2]===0&&(v-r[0])%r[3]!==0;
  if(i.tipo==="ler"){if(f.t!=="line"||!f.milh||!livre(f.mark)||p.a!==f.mark||p.a>9999)falha(6,"ler: "+JSON.stringify(f)+" → "+p.a);if(/ /.test(FC.fig(f))!==(r[1]>=1000))falha(6,"separador de milhar nos rótulos")}
  else if(i.tipo==="onde"){const m=p.pre.match(/^Em que ponto da reta fica o número ([\d ]+)\?$/),op=p.extra.opts,pts=f.pts;
   if(f.t!=="reta2"||!m||pts.length!==4||pts.some(q=>!livre(q.v)))falha(6,"onde: "+p.pre);
   const alvo=num(m[1]),ach=pts.filter(q=>q.v===alvo);if(ach.length!==1||op[p.a-1]!==ach[0].l||op.join("")!=="ABCD".split("").sort(()=>0).join("")&&op.slice().sort().join("")!=="ABCD")falha(6,"ponto certo: "+p.pre+" → "+op[p.a-1]);
   const html=FC.fig(f);if(cnt(html,"pt2")!==4)falha(6,"pontos desenhados");pts.forEach((q,k)=>{if(q.l!=="ABCD"[k])falha(6,"letras fora de ordem")})}
  else{const pts=f.pts;if(f.t!=="reta2"||pts.length!==2||pts[0].l!=="A"||pts[1].l!=="B"||!pts.every(q=>livre(q.v))||pts[1].v<=pts[0].v)falha(6,"falta: "+JSON.stringify(pts));
   if(p.pre!=="Quanto falta para ir do ponto A ao ponto B?"||p.a!==pts[1].v-pts[0].v||p.a%r[2]||p.a<=0)falha(6,"diferença: "+p.a)}
 }
 console.log("nível 6:",JSON.stringify(tp));if(Math.abs(tp.ler/N-.375)>.04||Math.abs(tp.onde/N-.375)>.04)falha(6,"proporção dos tipos")}

/* ---- Nível 7 ---- */
{const its=draw(G.g3n07),tp={completar:0,regra:0,errado:0},ps={};let cruz={},tot={};
 const ehPA=a=>{const d=a[1]-a[0];return d!==0&&a.every((x,i)=>i===0||x-a[i-1]===d)};
 for(const p of its){const i=p._info;tp[i.tipo]++;
  if(i.tipo==="completar"){const m=p.pre.match(/^De ([\d ]+) em ([\d ]+): (.*)$/);if(!m||m[1]!==m[2]){falha(7,"pergunta: "+p.pre);continue}
   const passo=num(m[1]),esq=m[3].split("  ").filter(Boolean).map(num),dir=p.post.split("  ").filter(Boolean).map(num),v=[...esq,p.a,...dir];
   if(v.length!==5||esq.length<1||dir.length<1)falha(7,"o espaço não pode estar nas pontas: "+v);const d=v[1]-v[0];
   if(Math.abs(d)!==passo||!ehPA(v)||v.some(x=>x<100||x>9999))falha(7,"fila fora da regra: "+v+" passo "+passo);
   ps[passo]=(ps[passo]||0)+1;if([1,10,100].includes(passo)){tot[passo]=(tot[passo]||0)+1;if(Math.floor(v[0]/(10*passo))!==Math.floor(v[4]/(10*passo)))cruz[passo]=(cruz[passo]||0)+1}}
  else if(i.tipo==="regra"){const m=p.pre.match(/^(.+)\. Qual é a regra\?$/),v=m[1].split(", ").map(num),op=p.extra.opts,d=v[1]-v[0];
   if(!ehPA(v)||v.length<4||v.length>5||op[p.a-1]!==(d>0?"soma ":"tira ")+temSep(Math.abs(d))||new Set(op).size!==3||op.length!==3)falha(7,"regra: "+p.pre+" → "+op[p.a-1])}
  else{const m=p.pre.match(/^(.+)\. Qual número está errado\?$/),v=m[1].split(", ").map(num),op=p.extra.opts.map(num);
   const ajusta=s=>{const k=[0,1,2,3,4].filter(x=>x!==s),d=(v[k[1]]-v[k[0]])/(k[1]-k[0]);return Number.isInteger(d)&&d!==0&&k.every(x=>v[x]-v[k[0]]===d*(x-k[0]))};
   const unic=[0,1,2,3,4].filter(ajusta);if(v.length!==5||unic.length!==1||unic[0]===0||unic[0]===4)falha(7,"errado: "+p.pre+" candidatos "+unic);
   if(op.length!==4||new Set(op).size!==4||op[p.a-1]!==v[unic[0]]||!op.every(x=>v.includes(x)))falha(7,"opções do errado: "+op+" → "+op[p.a-1])}
 }
 console.log("nível 7:",JSON.stringify(tp),"passos",JSON.stringify(ps),"travessias",Object.keys(tot).map(k=>k+":"+((cruz[k]||0)/tot[k]*100).toFixed(0)+"%").join(" "));
 if(Math.abs(tp.completar/N-.5)>.04||Math.abs(tp.regra/N-.25)>.04)falha(7,"proporção dos tipos");for(const k of Object.keys(tot))if((cruz[k]||0)/tot[k]<.3)falha(7,"travessias abaixo de 30% no passo "+k)}

/* ---- Níveis 8 a 15: adição e subtração ---- */
const strip=t=>String(t).replace(/ /g,"");
const vaium=(a,b)=>{const x=[...String(a).padStart(4,"0")].map(Number),y=[...String(b).padStart(4,"0")].map(Number);let c=0;const f=[0,0,0,0];for(let i=3;i>=0;i--){const s=x[i]+y[i]+c;if(s>=10){f[i]=1;c=1}else c=0}return {f,over:c}};
const emp=(a,b)=>{const x=[...String(a).padStart(4,"0")].map(Number),y=[...String(b).padStart(4,"0")].map(Number);let c=0;const f=[0,0,0,0];for(let i=3;i>=0;i--){const v=x[i]-c-y[i];if(v<0){f[i]=1;c=1}else c=0}return f};
const parseC=p=>{const m=strip(p.pre).match(/^(\d+) ([+−]) (\d+) =$/);return m?{a:+m[1],op:m[2]==="+"?"+":"-",b:+m[3]}:null};
const temZ=n=>{const s=String(n);return s.slice(1).includes("0")};
{const its=draw(G.g3n08),f={1:0,2:0,3:0,4:0},tots={100:0,1000:0};
 for(const p of its){
  const L=strip(p.pre+" "+p.a+" "+p.post).replace(/−/g,"-").trim(),m=L.split("=");if(m.length!==2||!/^[\d\s+\-]+$/.test(L.replace("=",""))){falha(8,"formato: "+L);continue}
  if(Function("return ("+m[0]+")===("+m[1]+")")()!==true)falha(8,"a conta não fecha com a resposta: "+L);
  if(!(p.a>0))falha(8,"resposta zero");const ns=L.match(/\d+/g).map(Number),T=Math.max(...ns.filter((x,i)=>i!==ns.indexOf(p.a)||true));
  const tot=ns.includes(1000)?1000:100;tots[tot]++;const y=p._info.y;
  if(tot===1000&&y%10)falha(8,"parcela do 1000 que não é múltiplo de 10: "+L);if(y<1||y>=tot)falha(8,"parcela fora do esperado");
  f[p._info.f]++;if(strip(p.pre).replace(/ /g,"")===""&&p._info.f!==2)falha(8,"espaço no começo fora da forma 2");
 }
 console.log("nível 8: formas",JSON.stringify(f),"totais",JSON.stringify(tots));for(const k in f)if(Math.abs(f[k]/N-.25)>.04)falha(8,"forma "+k);if(Math.abs(tots[100]/N-.5)>.04)falha(8,"100 e 1000")}
{const its=draw(G.g3n09),fam={1:0,2:0,3:0};let zero=0;
 for(const p of its){const c=parseC(p);if(!c||c.op!=="+"){falha(9,"conta: "+p.pre);continue}
  const v=vaium(c.a,c.b);if(c.a<100||c.a>899||c.b<100||c.b>899||c.a+c.b>999||p.a!==c.a+c.b)falha(9,"números/resposta: "+p.pre);
  if(v.over||v.f[1]||!(v.f[2]||v.f[3]))falha(9,"reagrupamento: "+p.pre);const fm=v.f[3]&&!v.f[2]?1:!v.f[3]&&v.f[2]?2:3;fam[fm]++;if(fm!==p._info.fam)falha(9,"família "+p._info.fam+" vs "+fm);
  if(/^(\d\d)?0|0$/.test(String(c.a).slice(1))||String(c.a).slice(1).includes("0")||String(c.b).slice(1).includes("0"))zero++}
 console.log("nível 9: famílias",JSON.stringify(fam),"zero",(100*zero/N).toFixed(0)+"%");
 if(Math.abs(fam[1]/N-.35)>.04||Math.abs(fam[2]/N-.3)>.04||Math.abs(fam[3]/N-.35)>.04)falha(9,"famílias");if(zero/N<.15||zero/N>.4)falha(9,"zero fora de 15% a 40%")}
{const its=draw(G.g3n10),fam={1:0,2:0,3:0,4:0};let zero=0;
 for(const p of its){const c=parseC(p);if(!c||c.op!=="-"){falha(10,"conta: "+p.pre);continue}
  const f=emp(c.a,c.b),r=c.a-c.b;if(c.a<100||c.a>999||c.b<100||c.b>=c.a||p.a!==r||r<1)falha(10,"números/resposta: "+p.pre);
  if(!(f[2]||f[3])||f[1]||f[0])falha(10,"empréstimo: "+p.pre);
  const k=p._info.fam;fam[k]++;
  if(k===1&&!(f[3]&&!f[2])||k===2&&!(!f[3]&&f[2])||k===3&&!(f[3]&&f[2]))falha(10,"família "+k+": "+p.pre);
  if(k===4&&!(String(c.a)[1]==="0"||String(c.a)[2]==="0"))falha(10,"família 4 sem zero: "+p.pre);
  if(String(c.a)[1]==="0"||String(c.a)[2]==="0")zero++}
 console.log("nível 10: famílias",JSON.stringify(fam),"número maior com zero",(100*zero/N).toFixed(0)+"%");
 if(Math.abs(fam[1]/N-.3)>.04||Math.abs(fam[2]/N-.25)>.04||Math.abs(fam[3]/N-.2)>.04||Math.abs(fam[4]/N-.25)>.04)falha(10,"famílias");if(zero/N<.2||zero/N>.35)falha(10,"zero fora de 20% a 35%")}
{const its=draw(G.g3n11),fam={1:0,2:0,3:0,4:0};
 for(const p of its){const c=parseC(p);if(!c){falha(11,"conta: "+p.pre);continue}const r=c.op==="+"?c.a+c.b:c.a-c.b;if(p.a!==r||r<1||r>999||c.a<100||c.b<100)falha(11,"resposta: "+p.pre);
  let k;if(c.op==="+"){const v=vaium(c.a,c.b);k=v.f.some(Boolean)?2:1;if(v.over)falha(11,"estouro")}else{const f=emp(c.a,c.b);k=f.some(Boolean)?4:3}
  fam[k]++;if(k!==p._info.fam)falha(11,"família "+p._info.fam+" vs "+k+": "+p.pre)}
 console.log("nível 11: famílias",JSON.stringify(fam));for(const k in fam)if(Math.abs(fam[k]/N-.25)>.04)falha(11,"família "+k);
 let ruim=0;for(let i=0;i<1500;i++){const it=niv(G.g3n11),c={};it.forEach(p=>{c[p._info.fam]=(c[p._info.fam]||0)+1});if(it.length!==8||[1,2,3,4].some(k=>c[k]!==2))ruim++}
 console.log("nível 11: folhas sem 2 de cada família",ruim);if(ruim)falha(11,ruim+" folhas fora de 2 de cada")}
{const its=draw(G.g3n12),fam={1:0,2:0,3:0,4:0};let zero=0,f4=0;
 for(const p of its){const c=parseC(p);if(!c){falha(12,"conta: "+p.pre);continue}const r=c.op==="+"?c.a+c.b:c.a-c.b,k=p._info.fam;fam[k]++;
  if(p.a!==r||r<1||r>9999||c.a>9999)falha(12,"resposta: "+p.pre+" → "+p.a);
  if(k===1&&(c.a%100||c.b%100||c.a<1000||vaium(c.a,c.b).f.some(Boolean)||c.a+c.b>9900))falha(12,"família 1: "+p.pre);
  if(k===2&&(!vaium(c.a,c.b).f.some(Boolean)||c.a<1000||(c.a%100===0&&c.b%100===0)))falha(12,"família 2: "+p.pre);
  if(k===3&&(c.a%100||c.b%100||c.a<1000||!emp(c.a,c.b)[1]))falha(12,"família 3: "+p.pre);
  if(k===4){f4++;const f=emp(c.a,c.b);if(!f.some(Boolean)||c.a<1000)falha(12,"família 4: "+p.pre);if(p._info.zero){zero++;if(String(c.a).slice(1).split("").filter(x=>x==="0").length<2)falha(12,"zeros na família 4: "+p.pre)}}
  if(/\d{4}/.test(p.pre.replace(/ /g,"")&&p.pre)&&/\d{4}/.test(p.pre))falha(12,"número de 4 algarismos sem espaço de milhar: "+p.pre)}
 console.log("nível 12: famílias",JSON.stringify(fam),"zeros na família 4",(100*zero/f4).toFixed(0)+"%");for(const k in fam)if(Math.abs(fam[k]/N-.25)>.04)falha(12,"família "+k);if(Math.abs(zero/f4-.3)>.05)falha(12,"zeros na família 4 fora de 30%");
 let ruim=0;for(let i=0;i<1500;i++){const it=niv(G.g3n12),c={};it.forEach(p=>{c[p._info.fam]=(c[p._info.fam]||0)+1});if(it.length!==8||[1,2,3,4].some(k=>c[k]!==2))ruim++}
 console.log("nível 12: folhas sem 2 de cada família",ruim);if(ruim)falha(12,ruim+" folhas fora de 2 de cada")}
{ // parcelas trocadas nunca na mesma folha (somas dos níveis 9, 11 e 12)
 for(const nivel of ["g3n09","g3n11","g3n12"]){let ruim=0;for(let i=0;i<1500;i++){const k=niv(G[nivel]).map(parseC).filter(c=>c&&c.op==="+").map(c=>Math.min(c.a,c.b)+","+Math.max(c.a,c.b));if(new Set(k).size<k.length)ruim++}
  console.log(nivel+": folhas com parcelas trocadas",ruim);if(ruim)falha(nivel,ruim+" folhas com parcelas trocadas")}
 let ruim=0;for(let i=0;i<1500;i++){const k=niv(G.g3n08).filter(p=>p._info.f<=2).map(p=>p._info.y+","+p._info.T);if(new Set(k).size<k.length)ruim++}
 console.log("nível 8: folhas com a mesma parcela nas formas 1 e 2",ruim);if(ruim)falha(8,ruim+" folhas com parcelas trocadas")}
function problemas3(nivel,modo){
 const its=draw(G["g3n"+nivel]),tp={},rg={sim:0,nao:0};let zero=0;const maxw=modo===13?22:24;
 const OBJ=[["figurinhas",1],["livros",0],["bolas",1],["adesivos",0],["carrinhos",0],["balas",1],["flores",1],["lápis",0],["ingressos",0],["páginas",1],["tijolos",0],["moedas",1],["carros",0],["pássaros",0],["balões",0],["alunos",0],["peixes",0],["pintinhos",0],["passageiros",0]];
 for(const p of its){
  const w=p.pre.trim().split(/ +/).length;if(w>maxw)falha(nivel,"enunciado com "+w+" palavras: "+p.pre);
  const ns=(strip(p.pre).match(/\d+/g)||[]).map(Number),[a,b]=ns,pre=p.pre;let tipo,r;
  if(ns.length!==2){falha(nivel,"valores no texto: "+pre);continue}
  if(/ tem [\d ]+ .* e \S+ tem [\d ]+ \S+\. \S+ \S+ (eles|elas) têm (juntos|juntas)\?$/.test(pre)){tipo="juntar";r=a+b}
  else if(/^Havia [\d ]+ .*Chegaram/.test(pre)){tipo="acrescentar";r=a+b}
  else if(/ deu [\d ]+ para um amigo/.test(pre)){tipo="separar";r=a-b}
  else if(/Foram embora/.test(pre)){tipo="retirar";r=a-b}
  else if(/ tem a (mais|menos) do que /.test(pre)){tipo="comparar";r=Math.abs(a-b);const m=pre.match(/^(\S+) tem [\d ]+ (\S+) e (\S+) tem [\d ]+\. (Quantas|Quantos) (\S+) (\S+) tem a (mais|menos) do que (\S+)\?$/);
   if(!m)falha(nivel,"comparar: "+pre);else{const [,n1,o1,n2,q,o2,quem,mm,outra]=m;if(o1!==o2||n1===n2||quem===outra||![n1,n2].includes(quem)||![n1,n2].includes(outra))falha(nivel,"nomes/objeto: "+pre);
    const va=a,vb=b,vq=quem===n1?va:vb,vo=quem===n1?vb:va;if((mm==="mais"?vq>vo:vq<vo)!==true)falha(nivel,"quem tem "+mm+": "+pre)}}
  else if(/quer juntar/.test(pre)){tipo="completar";r=a-b}
  else{falha(nivel,"tipo desconhecido: "+pre);continue}
  tp[tipo]=(tp[tipo]||0)+1;if(p.a!==r||r<=0)falha(nivel,"resposta errada: "+pre+" → "+p.a+" (esperado "+r+")");
  if(["separar","retirar","completar"].includes(tipo)||tipo==="comparar"){if(Math.max(a,b)<=Math.min(a,b)&&tipo!=="comparar")falha(nivel,"números")}
  const lo=modo===13?100:1000,hi=modo===13?999:9999;if(a<lo||a>hi||b<lo||b>hi)falha(nivel,"números fora de "+lo+" a "+hi+": "+pre);
  if(["juntar","acrescentar"].includes(tipo)&&a+b>hi)falha(nivel,"total acima de "+hi);
  const mf=pre.match(/(Quantas|Quantos) (\S+)/),ob=OBJ.find(o=>o[0]===mf[2]);if(!ob||mf[1]!==(ob[1]?"Quantas":"Quantos"))falha(nivel,"concordância: "+pre);
  const big=tipo==="acrescentar"||tipo==="juntar"?vaium(a,b).f.some(Boolean):emp(Math.max(a,b),Math.min(a,b)).some(Boolean);rg[big?"sim":"nao"]++;
  if(temZ(a)||temZ(b))zero++;if(p._info.reg!==big)falha(nivel,"reagrupamento diferente do sorteado: "+pre);
  if(tipo==="juntar"){const mm=pre.match(/^(\S+) tem .* e (\S+) tem/),na=FC.exh.NAMES.find(n=>n[0]===mm[1]),nb=FC.exh.NAMES.find(n=>n[0]===mm[2]);if(mm[1]===mm[2])falha(nivel,"mesmo nome");
   const elas=na[1]==="f"&&nb[1]==="f";if(!pre.includes(elas?"elas têm juntas?":"eles têm juntos?"))falha(nivel,"elas/eles: "+pre)}
 }
 console.log("nível "+nivel+": tipos",JSON.stringify(tp),"reagrupamento",(100*rg.sim/N).toFixed(0)+"%, com zero",(100*zero/N).toFixed(0)+"%");
 for(const k of["juntar","acrescentar","separar","retirar","comparar","completar"])if(Math.abs((tp[k]||0)/N-1/6)>.035)falha(nivel,"tipo "+k);
 if(Math.abs(rg.sim/N-(modo===13?.6:.5))>.05)falha(nivel,"reagrupamento fora do esperado");if(modo===14&&(zero/N<.15||zero/N>.5))falha(nivel,"zeros fora de 15% a 50%");
}
problemas3("13",13);problemas3("14",14);
{const its=draw(G.g3n15),tp={1:0,2:0,3:0};let verd=0,v3=0;
 const val=t=>{const m=strip(t).replace(/−/g,"-");return Function("return ("+m+")")()};
 for(const p of its){const t=p._info.tipo;tp[t]++;
  if(t===1){const L=strip(p.pre+" "+p.a+" "+p.post).replace(/−/g,"-").trim(),m=L.split("=");if(m.length!==2||!/^[\d\s+\-=]+$/.test(L)){falha(15,"formato: "+L);continue}
   const l=Function("return ("+m[0]+")")(),r=Function("return ("+m[1]+")")();
   if(l!==r||!(p.a>0))falha(15,"a igualdade não fecha: "+L)}
  else if(t===2){const m=p.pre.match(/^Qual conta tem o mesmo resultado que (.+)\?$/),op=p.extra.opts,vals=op.map(val),alvo=val(m[1]);
   if(op.length!==3||new Set(op).size!==3||vals.filter(x=>x===alvo).length!==1||vals[p.a-1]!==alvo||vals.some(x=>x<=0))falha(15,"mesmo resultado: "+p.pre+" "+op+" → "+op[p.a-1]);if(op.includes(m[1]))falha(15,"a própria conta entre as opções")}
  else{const m=p.pre.match(/^A igualdade (.+) = (.+) é…$/),vv=val(m[1])===val(m[2]),op=p.extra.opts;if(op[p.a-1]!==(vv?"verdadeira":"falsa")||op.length!==2||val(m[2])<=0)falha(15,"verdadeira ou falsa: "+p.pre+" → "+op[p.a-1]);
   if(!vv&&Math.abs(val(m[1])-val(m[2]))>2*(/\d{3}/.test(m[1])?100:1))falha(15,"a falsa erra por mais de 2: "+p.pre);v3++;if(vv)verd++}
 }
 console.log("nível 15: tipos",JSON.stringify(tp),"verdadeiras",(100*verd/v3).toFixed(0)+"%");if(Math.abs(tp[1]/N-.5)>.04||Math.abs(tp[2]/N-.25)>.04)falha(15,"proporção dos tipos");if(Math.abs(verd/v3-.5)>.05)falha(15,"verdadeiras e falsas em partes iguais")}

/* ---- Níveis 16 a 24: multiplicação ---- */
const OBJN=FC.exh.OBJ;
const lerConta=p=>{                                                   // devolve {a,b,c} da igualdade a × b = c (qualquer posição do espaço)
 const L=strip(p.pre+" "+p.a+" "+p.post).trim(),m=L.match(/^(\d+) × (\d+) =(?: (\d+))?$/);if(m)return {a:+m[1],b:+m[2],c:m[3]!==undefined?+m[3]:null,L};return null};
function arranjoOk(p,nivel){
 const f=p.extra.fig;if(f.t!=="arranjo"){falha(nivel,"figura de outro tipo");return null}
 const html=FC.fig(f),linhas=html.split('class="arr-r"').slice(1).map(c=>(c.match(/<i>/g)||[]).length);
 if(linhas.length!==f.r||linhas.some(x=>x!==f.c))falha(nivel,"o arranjo não tem "+f.r+" fileiras de "+f.c+": "+linhas);if(f.r<2||f.r>10||f.c<2||f.c>10)falha(nivel,"arranjo fora de 2 a 10");
 return {R:f.r,C:f.c,e:f.e};
}
function perguntaArranjo(p,nivel,f){const o=OBJN.find(o=>o.e===f.e),m=p.pre.match(/^(Quantas|Quantos) (\S+) há ao todo\?$/);if(!m||m[1]!==(o.f?"Quantas":"Quantos")||m[2]!==o.pl)falha(nivel,"pergunta/concordância: "+p.pre);if(p.a!==f.R*f.C)falha(nivel,"resposta do arranjo: "+p.pre+" → "+p.a+" vs "+f.R*f.C)}
function foliaFatos(nivel,gg){let ruim=0;for(let i=0;i<1500;i++){const k=niv(gg).filter(p=>p._info&&p._info.k!==undefined&&p._info.n!==undefined&&p._info.tipo!=="por10").map(p=>Math.min(p._info.k,p._info.n)+","+Math.max(p._info.k,p._info.n));if(new Set(k).size<k.length)ruim++}
 console.log("nível "+nivel+": folhas com o mesmo fato (ou fatores trocados)",ruim);if(ruim)falha(nivel,ruim+" folhas com fatos repetidos")}
{const its=draw(G.g3n16),tp={direta:0,escondido:0},ks={2:0,3:0,4:0,5:0};
 for(const p of its){const c=lerConta(p);if(!c){falha(16,"formato: "+p.pre);continue}
  const i=p._info;tp[i.tipo]++;
  if(i.tipo==="direta"){if(c.c!==c.a*c.b||p.a!==c.c)falha(16,"direta: "+c.L)}else{if(c.c!==c.a*c.b||p.a<2||p.a>10)falha(16,"escondido: "+c.L)}
  const [f1,f2]=[c.a,c.b];const k=[2,3,4,5].includes(i.k)?i.k:0;if(!k||i.n<2||i.n>10)falha(16,"fatores: "+c.L);if(!((f1===i.k&&f2===i.n)||(f1===i.n&&f2===i.k)))falha(16,"fatores diferentes dos da conta: "+c.L);ks[i.k]++}
 console.log("nível 16:",JSON.stringify(tp),JSON.stringify(ks));if(Math.abs(tp.direta/N-.625)>.04)falha(16,"proporção");for(const k in ks)if(Math.abs(ks[k]/N-.25)>.04)falha(16,"tabuada "+k);foliaFatos(16,G.g3n16)}
{const its=draw(G.g3n17),tp={direta:0,texto:0,dinheiro:0};let grande=0,tot=0;
 for(const p of its){const i=p._info;tp[i.tipo]++;let n;
  if(i.tipo==="direta"){const m=strip(p.pre).match(/^(?:10 × (\d+)|(\d+) × 10) =$/);if(!m){falha(17,"conta: "+p.pre);continue}n=+(m[1]||m[2])}
  else if(i.tipo==="texto"){const m=strip(p.pre).match(/^Quanto é 10 vezes (\d+)\?$/);if(!m){falha(17,"texto: "+p.pre);continue}n=+m[1]}
  else{const m=p.pre.match(/^Quantos reais há em (\d+) cédulas de 10 reais\?$/);if(!m||+m[1]<2){falha(17,"dinheiro: "+p.pre);continue}n=+m[1]}
  if(p.a!==n*10||p.a%10||p.a<20||p.a>9990)falha(17,"resposta: "+p.pre+" → "+p.a);if(/\d{4}/.test(p.pre))falha(17,"número de quatro algarismos sem espaço: "+p.pre);
  if(i.tipo!=="dinheiro"){tot++;if(n>=100)grande++}}
 console.log("nível 17:",JSON.stringify(tp),"fator de 100 a 999",(100*grande/tot).toFixed(0)+"%");if(Math.abs(tp.direta/N-.5)>.04)falha(17,"proporção");if(Math.abs(grande/tot-.3)>.05)falha(17,"fatores grandes fora de 30%")}
{const its=draw(G.g3n18),tp={arranjo:0,conta:0,texto:0};
 for(const p of its){const i=p._info;tp[i.tipo]++;
  if(i.tipo==="arranjo"){const f=arranjoOk(p,18);if(f)perguntaArranjo(p,18,f)}
  else if(i.tipo==="conta"){const f=arranjoOk(p,18);if(!f)continue;const op=p.extra.opts,val=t=>{const m=t.match(/^(\d+) ([+×]) (\d+)$/);return m[2]==="+"?+m[1]+ +m[3]:+m[1]*+m[3]};
   if(p.pre!=="Qual conta mostra quantos há ao todo?"||op.length!==3||new Set(op).size!==3||val(op[p.a-1])!==f.R*f.C||op.filter(o=>val(o)===f.R*f.C).length!==1)falha(18,"conta do desenho: "+op+" → "+p.a+" ("+f.R+"x"+f.C+")");
   if(op.includes(f.C+" × "+f.R)&&f.R!==f.C)falha(18,"conta com fatores trocados entre as opções")}
  else{const m=p.pre.match(/^(?:A sala tem|O pomar tem|A estante tem|A caixa tem) (\d+) fileiras de (\d+) (\S+)\. (Quantas|Quantos) (\S+) há\?$/);if(!m||m[3]!==m[5]){falha(18,"texto: "+p.pre);continue}
   const fem=["cadeiras","árvores"].includes(m[3]);if(m[4]!==(fem?"Quantas":"Quantos")||p.a!==m[1]*m[2])falha(18,"texto: "+p.pre+" → "+p.a)}}
 console.log("nível 18:",JSON.stringify(tp));if(Math.abs(tp.arranjo/N-.5)>.04||Math.abs(tp.conta/N-.25)>.04)falha(18,"proporção")}
for(const [nivel,k] of [[19,6],[20,7],[21,8],[22,9]]){
 const its=draw(G["g3n"+nivel]),tp={direta:0,escondido:0,arranjo:0,texto:0};
 for(const p of its){const i=p._info;tp[i.tipo]++;if(i.k!==k||i.n<2||i.n>10)falha(nivel,"tabuada: "+JSON.stringify(i));
  if(i.tipo==="arranjo"){const f=arranjoOk(p,nivel);if(f){perguntaArranjo(p,nivel,f);if(!((f.R===k&&f.C===i.n)||(f.C===k&&f.R===i.n)))falha(nivel,"arranjo fora da tabuada: "+f.R+"x"+f.C)}}
  else if(i.tipo==="texto"){const m=p.pre.match(/^Quanto é (\d+) vezes (\d+)\?$/);if(!m||+m[1]!==k||p.a!==k*m[2]||+m[2]<2||+m[2]>10)falha(nivel,"texto: "+p.pre+" → "+p.a)}
  else{const c=lerConta(p);if(!c){falha(nivel,"formato: "+p.pre);continue}if(!(c.a===k||c.b===k)||c.c!==c.a*c.b||(i.tipo==="direta"&&p.a!==c.c)||(i.tipo==="escondido"&&(p.a<2||p.a>10||(p.a!==c.a&&p.a!==c.b))))falha(nivel,"conta: "+c.L)}
  if(nivel===22&&[...String(p.a===0?0:i.k*i.n)].reduce((a,x)=>a+ +x,0)!==9)falha(22,"os algarismos do resultado da tabuada do 9 deveriam somar 9: "+i.k*i.n)}
 console.log("nível "+nivel+":",JSON.stringify(tp));if(Math.abs(tp.direta/N-.375)>.04||Math.abs(tp.escondido/N-.25)>.04||Math.abs(tp.arranjo/N-.25)>.04||Math.abs(tp.texto/N-.125)>.04)falha(nivel,"proporção dos tipos");foliaFatos(nivel,G["g3n"+nivel]);
 let ruim=0;for(let i=0;i<1500;i++){const it=niv(G["g3n"+nivel]),c={};it.forEach(p=>{c[p._info.tipo]=(c[p._info.tipo]||0)+1});if(it.length!==8||c.direta>4||c.escondido>3||c.arranjo>3||c.texto>2)ruim++}
 if(ruim)falha(nivel,ruim+" folhas fora da distribuição dos tipos")}
{const its=draw(G.g3n23),tp={direta:0,escondido:0,arranjo:0},ks={};
 for(const p of its){const i=p._info;tp[i.tipo]++;ks[i.k]=(ks[i.k]||0)+1;if(i.k<2||i.k>9||i.n<2||i.n>10)falha(23,"fatores");
  if(i.tipo==="arranjo"){const f=arranjoOk(p,23);if(f)perguntaArranjo(p,23,f)}else{const c=lerConta(p);if(!c){falha(23,"formato: "+p.pre);continue}if(c.c!==c.a*c.b||(i.tipo==="direta"&&p.a!==c.c))falha(23,"conta: "+c.L)}}
 const novas=[6,7,8,9].reduce((a,k)=>a+(ks[k]||0),0);console.log("nível 23:",JSON.stringify(tp),"tabuadas do 6 ao 9",(100*novas/N).toFixed(0)+"%");
 if(Math.abs(tp.direta/N-.5)>.04)falha(23,"proporção");if(Math.abs(novas/N-2/3)>.04)falha(23,"as tabuadas do 6 ao 9 deveriam pesar o dobro");foliaFatos(23,G.g3n23);
 let ruim=0;for(let i=0;i<1500;i++){const it=niv(G.g3n23),c={};it.forEach(p=>{c[p._info.tipo]=(c[p._info.tipo]||0)+1});if(it.length!==8||c.direta!==4||c.escondido!==2||c.arranjo!==2)ruim++}
 console.log("nível 23: folhas sem 4 diretas, 2 escondidas e 2 com figura",ruim);if(ruim)falha(23,ruim+" folhas fora da distribuição")}
{const its=draw(G.g3n24),tp={parcelas:0,fileiras:0,compra:0,por10:0};
 const OIT=[["lápis",0],["figurinhas",1],["balas",1],["livros",0],["adesivos",0],["flores",1]],COMP=[["cadernos",0],["borrachas",1],["livros",0],["bolas",1],["camisetas",1],["bonecas",1]];
 for(const p of its){const i=p._info;tp[i.tipo]++;const w=p.pre.trim().split(/ +/).length;if(w>20)falha(24,"enunciado com "+w+" palavras: "+p.pre);let m;
  if(i.tipo==="parcelas"){m=p.pre.match(/^Cada (\S+) tem (\d+) (\S+)\. (Quantas|Quantos) (\S+) há em (\d+) (\S+)\?$/);
   if(!m||m[3]!==m[5]){falha(24,"parcelas: "+p.pre);continue}const o=OIT.find(x=>x[0]===m[3]);if(!o||m[4]!==(o[1]?"Quantas":"Quantos")||p.a!==m[2]*m[6]||m[7]!==m[1]+"s")falha(24,"parcelas: "+p.pre+" → "+p.a)}
  else if(i.tipo==="fileiras"){m=p.pre.match(/^(?:O pátio tem|O pomar tem|A estante tem|A caixa tem) (\d+) fileiras com (\d+) (\S+) em cada uma\. (Quantas|Quantos) (\S+) há\?$/);
   if(!m||m[3]!==m[5]){falha(24,"fileiras: "+p.pre);continue}const fem=["cadeiras","árvores"].includes(m[3]);if(m[4]!==(fem?"Quantas":"Quantos")||p.a!==m[1]*m[2])falha(24,"fileiras: "+p.pre+" → "+p.a)}
  else if(i.tipo==="compra"){m=p.pre.match(/^(Um|Uma) (\S+) custa (\d+) reais\. Quanto custam (\d+) (\S+)\?$/);
   const g=m&&COMP.find(x=>x[0]===m[5]);if(!m||!g||p.post!=="reais"||m[1]!==(g[1]?"Uma":"Um")||p.a!==m[3]*m[4]||m[2]+"s"!==m[5])falha(24,"compra: "+p.pre+" → "+p.a)}
  else{m=p.pre.match(/^Cada (\S+) tem 10 (\S+)\. (Quantas|Quantos) (\S+) há em (\d+) (\S+)\?$/);
   const o=m&&OIT.find(x=>x[0]===m[2]);if(!m||m[2]!==m[4]||!o||m[3]!==(o[1]?"Quantas":"Quantos")||p.a!==10*m[5]||+m[5]<11||+m[5]>99)falha(24,"por 10: "+p.pre+" → "+p.a)}
 }
 console.log("nível 24:",JSON.stringify(tp));if(Math.abs(tp.parcelas/N-.375)>.04||Math.abs(tp.fileiras/N-.25)>.04||Math.abs(tp.compra/N-.25)>.04)falha(24,"proporção dos tipos")}

/* ---- Níveis 25 a 33: divisão e geometria ---- */
const bandeja=(f)=>{const html=FC.fig(f),band=html.split('class="bandeja"')[1].split('class="pratos"')[0];return {soltos:(band.match(/<i>/g)||[]).length,pratos:(html.match(/class="prato"/g)||[]).length}};
const OBJ25=[["figurinhas",1],["balas",1],["livros",0],["adesivos",0],["bolas",1],["lápis",0]];
{const its=draw(G.g3n25),tp={reparte:0,medida:0,texto:0};
 for(const p of its){const i=p._info;tp[i.tipo]++;let m;
  if(i.tipo==="reparte"){m=p.pre.match(/^Divida igualmente (as|os) (\d+) (\S+) em (\d+) pratos\. (Quantas|Quantos) (\S+) ficam em cada prato\?$/);
   if(!m||m[3]!==m[6]){falha(25,"pergunta: "+p.pre);continue}const f=p.extra.fig,o=OBJN.find(o=>o.pl===m[3]),b=bandeja(f);
   if(f.t!=="reparte"||f.e!==o.e||b.soltos!==+m[2]||b.pratos!==+m[4]||+m[2]%+m[4]||p.a!==m[2]/m[4]||m[1]!==(o.f?"as":"os")||m[5]!==(o.f?"Quantas":"Quantos"))falha(25,"repartição: "+p.pre+" → "+p.a+" "+JSON.stringify(b));
   if(+m[4]<2||+m[4]>5||p.a<2||p.a>10||+m[2]>50)falha(25,"números fora do esperado: "+p.pre)}
  else if(i.tipo==="medida"){m=p.pre.match(/^Há (\d+) (\S+)\. Cada prato recebe (\d+)\. Quantos pratos são necessários\?$/);
   if(!m){falha(25,"pergunta: "+p.pre);continue}const f=p.extra.fig,b=bandeja(f);if(b.soltos!==+m[1]||b.pratos!==0||+m[1]%+m[3]||p.a!==m[1]/m[3]||+m[3]<2||+m[3]>5||p.a<2||p.a>10)falha(25,"medida: "+p.pre+" → "+p.a)}
  else{m=p.pre.match(/^Reparta (\d+) (\S+) igualmente entre (\d+) amigos\. (Quantas|Quantos) (\S+) cada um recebe\?$/);
   const ob=m&&OBJ25.find(o=>o[0]===m[2]);if(!m||m[2]!==m[5]||!ob||m[4]!==(ob[1]?"Quantas":"Quantos")||+m[1]%+m[3]||p.a!==m[1]/m[3]||+m[3]<2||+m[3]>5)falha(25,"texto: "+p.pre+" → "+p.a)}}
 console.log("nível 25:",JSON.stringify(tp));if(Math.abs(tp.reparte/N-.5)>.04||Math.abs(tp.medida/N-.25)>.04)falha(25,"proporção")}
{const its=draw(G.g3n26),tp={direta:0,escondido:0,inverso:0};
 for(const p of its){const i=p._info;tp[i.tipo]++;const L=strip(p.pre+" "+p.a+" "+p.post).trim();let m;
  if(i.tipo==="direta"){m=L.match(/^(\d+) ÷ (\d+) = (\d+)$/);if(!m||+m[1]!==m[2]*m[3]||p.a!==+m[3])falha(26,"direta: "+L)}
  else if(i.tipo==="escondido"){m=L.match(/^(\d+) ÷ (\d+) = (\d+)$/);if(!m||+m[1]!==m[2]*m[3]||p.a!==+m[1]||p.pre!=="")falha(26,"escondido: "+L)}
  else{m=p.pre.match(/^(\d+) × (\d+) = (\d+), então (\d+) ÷ (\d+) =$/);if(!m||+m[3]!==m[1]*m[2]||+m[4]!==+m[3]||![m[1],m[2]].includes(m[5])||p.a!==+m[3]/m[5])falha(26,"inverso: "+p.pre+" → "+p.a)}
  if(!m)continue;const d=i.d,q=i.q;if(d<2||d>10||q<2||q>10||i.n!==d*q||p.a<2||p.a>100)falha(26,"números: "+JSON.stringify(i))}
 console.log("nível 26:",JSON.stringify(tp));if(Math.abs(tp.direta/N-.5)>.04||Math.abs(tp.escondido/N-.25)>.04)falha(26,"proporção");
 let ruim=0;for(let i=0;i<1500;i++){const k=niv(G.g3n26).map(p=>Math.min(p._info.d,p._info.q)+","+Math.max(p._info.d,p._info.q));if(new Set(k).size<k.length)ruim++}
 console.log("nível 26: folhas com o mesmo fato",ruim);if(ruim)falha(26,ruim+" folhas com fatos repetidos")}
{const its=draw(G.g3n27),tp={quociente:0,resto:0,verificacao:0};
 for(const p of its){const i=p._info;tp[i.tipo]++;let m;const {n,d,q,r}=i;
  if(n!==d*q+r||r<1||r>=d||d<2||d>9||q<2||q>9||n<7||n>80)falha(27,"números: "+JSON.stringify(i));
  if(i.tipo==="quociente"){m=p.pre.match(/^Com (\d+) (\S+), (quantos|quantas) (\S+) de (\d+) \2 dá para encher\?$/);const o=m&&OBJN.find(o=>o.pl===m[2]),b=m&&bandeja(p.extra.fig);
   if(!m||!o||+m[1]!==n||+m[5]!==d||p.a!==Math.floor(n/d)||b.soltos!==n||b.pratos!==0||p.extra.fig.e!==o.e)falha(27,"quociente: "+p.pre+" → "+p.a);
   if(m&&m[3]!==({pacotes:"quantos",caixas:"quantas",sacos:"quantos"}[m[4]]))falha(27,"concordância: "+p.pre)}
  else if(i.tipo==="resto"){m=p.pre.match(/^Com (\d+) (\S+), enchendo (\S+) de (\d+), (quantas|quantos) (\S+) sobram\?$/);const o=m&&OBJN.find(o=>o.pl===m[2]);
   if(!m||!o||m[2]!==m[6]||+m[1]!==n||+m[4]!==d||p.a!==n%d||m[5]!==(o.f?"quantas":"quantos"))falha(27,"resto: "+p.pre+" → "+p.a)}
  else{m=p.pre.match(/^(\d+) ÷ (\d+) dá (\d+) e sobram (\d+)\. Quanto vale (\d+) × (\d+) \+ (\d+)\?$/);if(!m||+m[2]*+m[3]+ +m[4]!==+m[1]||p.a!==+m[1]||+m[5]!==+m[2]||+m[6]!==+m[3]||+m[7]!==+m[4]||+m[4]>=+m[2]||+m[4]<1)falha(27,"verificação: "+p.pre+" → "+p.a)}}
 console.log("nível 27:",JSON.stringify(tp));if(Math.abs(tp.quociente/N-.375)>.04||Math.abs(tp.resto/N-.375)>.04)falha(27,"proporção")}
{const its=draw(G.g3n28),tp={parte:0,todo:0,situacao:0},nomes={2:"a metade",3:"a terça parte",4:"a quarta parte",5:"a quinta parte",10:"a décima parte"};
 for(const p of its){const i=p._info;tp[i.tipo]++;let m;const {d,q,todo}=i;
  if(todo!==d*q||todo>100||q<1||q>10||(d!==10&&q<2)||!nomes[d])falha(28,"números: "+JSON.stringify(i));
  if(i.tipo==="parte"){m=p.pre.match(/^Qual é (a metade|a terça parte|a quarta parte|a quinta parte|a décima parte) de (\d+)\?$/);if(!m||m[1]!==nomes[d]||+m[2]!==todo||p.a!==q||todo%d)falha(28,"parte: "+p.pre+" → "+p.a)}
  else if(i.tipo==="todo"){m=p.pre.match(/^(A metade|A terça parte|A quarta parte|A quinta parte|A décima parte) de um número é (\d+)\. Que número é esse\?$/);if(!m||m[1].toLowerCase()!==nomes[d]||+m[2]!==q||p.a!==todo)falha(28,"todo: "+p.pre+" → "+p.a)}
  else{m=p.pre.match(/^(\S+) tem (\d+) (\S+) e deu (a metade|a terça parte|a quarta parte|a quinta parte|a décima parte) para o irmão\. (Quantas|Quantos) (\S+) (ela|ele) deu\?$/);const ob=m&&OBJ25.find(o=>o[0]===m[3]),nome=m&&FC.exh.NAMES.find(n=>n[0]===m[1]);
   if(!m||!ob||!nome||m[3]!==m[6]||m[4]!==nomes[d]||+m[2]!==todo||p.a!==q||m[5]!==(ob[1]?"Quantas":"Quantos")||m[7]!==(nome[1]==="f"?"ela":"ele"))falha(28,"situação: "+p.pre+" → "+p.a)}
  if(!(p.a>0))falha(28,"resultado zero")}
 console.log("nível 28:",JSON.stringify(tp));if(Math.abs(tp.parte/N-.5)>.04||Math.abs(tp.todo/N-.25)>.04)falha(28,"proporção")}
{const its=draw(G.g3n29),tp={reparticao:0,medida:0,resto:0};const REC={pacotes:0,caixas:1,sacos:0,cestas:1};
 for(const p of its){const i=p._info;tp[i.tipo]++;const w=p.pre.trim().split(/ +/).length;if(w>22)falha(29,"enunciado com "+w+" palavras: "+p.pre);let m;
  if(i.tipo==="reparticao"){m=p.pre.match(/^(\S+) tem (\d+) (\S+) e quer repartir igualmente entre (\d+) amigos\. (Quantas|Quantos) (\S+) cada um recebe\?$/);const ob=m&&OBJ25.find(o=>o[0]===m[3]);
   if(!m||!ob||m[3]!==m[6]||m[2]%m[4]||p.a!==m[2]/m[4]||m[5]!==(ob[1]?"Quantas":"Quantos")||+m[4]<2||+m[4]>10||p.a<2||p.a>10)falha(29,"repartição: "+p.pre+" → "+p.a)}
  else if(i.tipo==="medida"){m=p.pre.match(/^(Quantas|Quantos) (\S+) de (\d+) (\S+) se formam com (\d+) \4\?$/);
   if(!m||!(m[2] in REC)||m[1]!==(REC[m[2]]?"Quantas":"Quantos")||m[5]%m[3]||p.a!==m[5]/m[3]||+m[3]<2||+m[3]>10||p.a<2||p.a>10)falha(29,"medida: "+p.pre+" → "+p.a)}
  else{m=p.pre.match(/^Com (\d+) (\S+), (?:(quantas|quantos) (\S+) de (\d+) \2 dá para encher|enchendo (\S+) de (\d+), (quantas|quantos) \2 sobram)\?$/);
   if(!m){falha(29,"resto: "+p.pre);continue}const n=+m[1],d=+(m[5]||m[7]),ob=OBJ25.find(o=>o[0]===m[2]),rec=m[4]||m[6],gen=m[3]||m[8];
   if(!ob||!(rec in REC)||(m[4]&&gen!==(REC[rec]?"quantas":"quantos"))||(m[6]&&gen!==(ob[1]?"quantas":"quantos")))falha(29,"concordância: "+p.pre);
   const esp=m[4]?Math.floor(n/d):n%d;if(p.a!==esp||n%d===0||p.a<1)falha(29,"resto: "+p.pre+" → "+p.a+" esperado "+esp)}}
 console.log("nível 29:",JSON.stringify(tp));if(Math.abs(tp.reparticao/N-.375)>.04||Math.abs(tp.medida/N-.375)>.04)falha(29,"proporção")}
{const its=draw(G.g3n30),tp={soma:0,subtracao:0,multiplicacao:0,divisao:0};
 for(const p of its){const i=p._info,pre=p.pre,w=pre.trim().split(/ +/).length;if(w>22)falha(30,"enunciado com "+w+" palavras: "+pre);const ns=(strip(pre).match(/\d+/g)||[]).map(Number);let op,r;
  if(/ ganhou mais /.test(pre)){op="soma";r=ns[0]+ns[1]}else if(/foram embora/.test(pre)){op="subtracao";r=ns[0]-ns[1]}else if(/^Cada .* há em /.test(pre)){op="multiplicacao";r=ns[0]*ns[1]}else if(/^Reparta /.test(pre)){op="divisao";r=ns[0]/ns[1]}else{falha(30,"tipo: "+pre);continue}
  tp[op]++;if(op!==i.op)falha(30,"operação "+i.op+" vs "+op);if(p.a!==r||!(r>0)||!Number.isInteger(r))falha(30,"resposta: "+pre+" → "+p.a+" (esperado "+r+")");
  if(op==="soma"&&(ns[0]+ns[1]>999||ns[0]<100||ns[1]<100))falha(30,"soma fora de 100 a 999");if(op==="subtracao"&&(ns[0]<=ns[1]||ns[1]<100||ns[0]>999))falha(30,"subtração fora do esperado");
  if(["multiplicacao","divisao"].includes(op)){const [a,b]=op==="divisao"?[ns[1],r]:ns;if(a<2||a>10||b<2||b>10)falha(30,"tabuada fora de 2 a 10")}}
 console.log("nível 30:",JSON.stringify(tp));for(const k in tp)if(Math.abs(tp[k]/N-.25)>.04)falha(30,"operação "+k);
 let ruim=0;for(let i=0;i<1500;i++){const it=niv(G.g3n30),c={};it.forEach(p=>{c[p._info.op]=(c[p._info.op]||0)+1});if(it.length!==8||["soma","subtracao","multiplicacao","divisao"].some(k=>c[k]!==2))ruim++}
 console.log("nível 30: folhas sem 2 de cada operação",ruim);if(ruim)falha(30,ruim+" folhas fora de 2 de cada")}
{const its=draw(G.g3n31),tp={nome:0,faces:0,aparecem:0};
 const FACE={"cubo-a":{sq:6},"cubo-b":{sq:6},bloco:{rc:6},piramide:{sq:1,tr:4},cilindro:{rc:1,ci:2},cone:{se:1,ci:1}},SOLN={"cubo-a":"cubo","cubo-b":"cubo",bloco:"bloco retangular",piramide:"pirâmide",cilindro:"cilindro",cone:"cone"};
 for(const p of its){const i=p._info;tp[i.tipo]++;
  if(i.tipo==="nome"){const f=p.extra.fig,html=FC.fig(f),ks=[...html.matchAll(/data-k="(\w+)"/g)].map(m=>m[1]),c={};ks.forEach(k=>c[k]=(c[k]||0)+1);const esp=FACE[f.n],op=p.extra.opts;
   if(JSON.stringify(Object.entries(c).sort())!==JSON.stringify(Object.entries(esp).sort())||cnt(html,"fc")!==ks.length)falha(31,"faces desenhadas de "+f.n+": "+JSON.stringify(c));
   if(op[p.a-1]!==SOLN[f.n]||op.length!==4||new Set(op).size!==4||(op.includes("cubo")&&op.includes("bloco retangular")))falha(31,"nome: "+f.n+" → "+op[p.a-1]+" "+op)}
  else if(i.tipo==="faces"){const m=p.pre.match(/^Quantas faces tem (um cubo|um bloco retangular|uma pirâmide de base quadrada)\?$/);const esp={"um cubo":6,"um bloco retangular":6,"uma pirâmide de base quadrada":5};if(!m||p.a!==esp[m[1]])falha(31,"faces: "+p.pre+" → "+p.a)}
  else{const m=p.pre.match(/^Na planificação d(?:o|a) (cubo|bloco retangular|pirâmide de base quadrada|cilindro) aparecem…$/),op=p.extra.opts,T={cubo:"seis quadrados","bloco retangular":"seis retângulos","pirâmide de base quadrada":"um quadrado e quatro triângulos",cilindro:"dois círculos e um retângulo"};
   if(!m||op[p.a-1]!==T[m[1]]||op.length!==3||new Set(op).size!==3)falha(31,"aparecem: "+p.pre+" → "+op[p.a-1]);
   if(m&&m[1]==="cubo"&&op.includes("seis retângulos")||m&&m[1]==="bloco retangular"&&op.includes("seis quadrados"))falha(31,"quadrados e retângulos juntos: "+op)}}
 console.log("nível 31:",JSON.stringify(tp));if(Math.abs(tp.nome/N-.5)>.04||Math.abs(tp.faces/N-.25)>.04)falha(31,"proporção")}
{ // figuras planas medidas pela geometria desenhada
 const pontos=f=>{if(f.t==="shape"){return FC.fig(f).match(/points="([^"]+)"/)[1].trim().split(/\s+/).map(q=>q.split(",").map(Number))}const g=FC.exh.formaGeom(f);return g.circle?null:g.pts};
 const analisa=P=>{const n=P.length,lados=P.map((q,i)=>[P[(i+1)%n][0]-q[0],P[(i+1)%n][1]-q[1]]);let pares=0;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const c=lados[i][0]*lados[j][1]-lados[i][1]*lados[j][0];if(Math.abs(c)<1e-6*Math.hypot(...lados[i])*Math.hypot(...lados[j])+1e-6)pares++}
  let retos=0;for(let i=0;i<n;i++){const a=lados[i],b=lados[(i+1)%n];if(Math.abs(a[0]*b[0]+a[1]*b[1])<1e-6*Math.hypot(...a)*Math.hypot(...b)+1e-6)retos++}
  const len=lados.map(l=>Math.hypot(...l)),iguais=len.every(x=>Math.abs(x-len[0])<.05);return {n,pares,retos,iguais}};
 const nomeDe=P=>{const a=analisa(P);if(a.n===3)return "triângulo";if(a.n===4){if(a.retos===4)return a.iguais?"quadrado":"retângulo";if(a.pares===2)return "paralelogramo";if(a.pares===1)return "trapézio"}return "outro"};
 const its=draw(G.g3n32),tp={nome:0,qual:0,pares:0};
 for(const p of its){const i=p._info;tp[i.tipo]++;
  if(i.tipo==="nome"){const f=p.extra.fig,nm=nomeDe(pontos(f)),op=p.extra.opts;if(nm!==i.n||op[p.a-1]!==nm||op.length<3||op.length>4||new Set(op).size!==op.length)falha(32,"nome: "+nm+" vs "+i.n+" → "+op[p.a-1]);
   const c={"quadrado":["retângulo","paralelogramo"],"retângulo":["quadrado","paralelogramo"],"paralelogramo":["quadrado","retângulo"]}[nm]||[];if(c.some(x=>op.includes(x)))falha(32,"opção que também descreve a figura: "+nm+" "+op)}
  else if(i.tipo==="qual"){const op=p.extra.opts,nomes=op.map(o=>nomeDe(pontos(o.fig))),prop={"Qual figura tem só um par de lados paralelos?":P=>analisa(P).pares===1&&analisa(P).n===4,"Qual figura tem quatro lados iguais e quatro ângulos retos?":P=>{const a=analisa(P);return a.n===4&&a.retos===4&&a.iguais},
    "Qual figura tem dois pares de lados paralelos e nenhum ângulo reto?":P=>{const a=analisa(P);return a.n===4&&a.pares===2&&a.retos===0},"Qual figura tem 3 vértices?":P=>P.length===3}[p.pre];
   if(!prop){falha(32,"pergunta: "+p.pre);continue}const ok=op.map(o=>prop(pontos(o.fig)));if(ok.filter(Boolean).length!==1||!ok[p.a-1]||op.length<3||op.length>4||new Set(nomes).size!==nomes.length)falha(32,"qual: "+p.pre+" "+nomes+" → "+p.a)}
  else{const f=p.extra.fig,P=pontos(f);if(p.pre!=="Quantos pares de lados paralelos tem esta figura?"||!P){falha(32,"pares: "+p.pre);continue}const a=analisa(P),esp=a.n===3?0:a.pares;if(p.a!==esp)falha(32,"pares de lados paralelos: "+nomeDe(P)+" → "+p.a+" (medido "+esp+")")}}
 console.log("nível 32:",JSON.stringify(tp));if(Math.abs(tp.nome/N-.375)>.04||Math.abs(tp.qual/N-.375)>.04)falha(32,"proporção")}
{ const cel=f=>f.shapes.map(sh=>sh.cells);
 const norm=c=>{const mx=Math.min(...c.map(x=>x[0])),my=Math.min(...c.map(x=>x[1]));return c.map(x=>[x[0]-mx,x[1]-my]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map(x=>x.join(",")).join(";")};
 const rots=c=>{const o=[];let cur=c;for(let i=0;i<4;i++){o.push(norm(cur));cur=cur.map(x=>[-x[1],x[0]])}return o},refl=c=>rots(c.map(x=>[-x[0],x[1]]));
 const its=draw(G.g3n33),tp={qual:0,sim:0},pos=[0,0,0,0];let simSim=0;
 for(const p of its){const i=p._info;tp[i.tipo]++;const f=p.extra.fig,html=FC.fig(f);
  if(i.tipo==="qual"){const A=cel(f)[0],op=p.extra.opts,Ls=op.map(o=>cel(o.fig)[0]);if(p.pre!=="Qual figura é congruente à figura A?"||op.length!==3)falha(33,"pergunta/opções");
   const rA=rots(A),eA=refl(A),ok=Ls.map(L=>rA.includes(norm(L)));if(ok.filter(Boolean).length!==1||!ok[p.a-1])falha(33,"só uma opção deveria ser a figura girada: "+ok+" → "+p.a);
   Ls.forEach((L,k)=>{if(L.length!==A.length)falha(33,"área diferente: "+L.length+" vs "+A.length);if(!ok[k]&&(eA.includes(norm(L))))falha(33,"opção errada que é o espelho da figura");if(!ok[k]&&rA.includes(norm(L)))falha(33,"opção errada igual")});
   if(new Set(Ls.map(norm)).size!==3)falha(33,"opções repetidas");pos[p.a]++;
   [A,...Ls].forEach(c=>{const xs=c.map(x=>x[0]),ys=c.map(x=>x[1]);if(Math.min(...xs)<0||Math.max(...xs)>4||Math.min(...ys)<0||Math.max(...ys)>4)falha(33,"figura fora da malha 5 x 5")});
   if(cnt(html,"cel")!==A.length)falha(33,"quadradinhos desenhados")}
  else{const [A,B]=cel(f),op=p.extra.opts,cong=rots(A).includes(norm(B));if(op.length!==2||op[p.a-1]!==(cong?"sim":"não")||A.length!==B.length)falha(33,"congruentes: "+op+" → "+p.a+" cong "+cong);if(!cong&&refl(A).includes(norm(B)))falha(33,"figura espelhada entre as 'não'");if(cong)simSim++;if(cnt(html,"cel")!==A.length+B.length)falha(33,"quadradinhos desenhados")}
  const n=cel(f)[0].length;if(n<4||n>6)falha(33,"quadradinhos fora de 4 a 6: "+n)}
 console.log("nível 33:",JSON.stringify(tp),"posição da certa",pos.slice(1,4).map(x=>(100*x/tp.qual).toFixed(0)+"%").join(" "),"sim",(100*simSim/tp.sim).toFixed(0)+"%");
 if(Math.abs(tp.qual/N-.625)>.04)falha(33,"proporção");for(let k=1;k<=3;k++)if(Math.abs(pos[k]/tp.qual-1/3)>.04)falha(33,"posição da certa não é uniforme");if(Math.abs(simSim/tp.sim-.5)>.05)falha(33,"sim e não em partes iguais")}

/* ---- Folhas reais: 8 contas do nível + 2 de revisão, sem repetição e dentro dos limites ---- */
for(const g of FC.G3){
  let rep=0,estouro=0,tam=0;
  for(let i=0;i<1500;i++){
    FC.LEVELS=[{gen:FC.G2BY.g2n08.gen},{gen:g.gen}];const todas=FC.makeItems(1),it=todas.filter(p=>!p._rev);
    if(todas.length!==10||it.length!==8)tam++;
    if(new Set(todas.map(FC.itemKey)).size<10)rep++;
    const c={};for(const p of it)for(const l of (p.limits||[])){c[l[0]]=(c[l[0]]||0)+1;if(c[l[0]]>l[1])estouro++}
  }
  console.log("nível "+g.nivel+": folhas sem 8+2 contas "+tam+"; com conta repetida "+rep+"; acima de um limite "+estouro+" (de 1500)");
  if(tam)falha(g.nivel,tam+" folhas sem 8 contas do nível e 2 de revisão");if(rep)falha(g.nivel,rep+" folhas com conta repetida");if(estouro)falha(g.nivel,estouro+" estouros de limite");
}
{let ruim=0;for(let i=0;i<1500;i++){const it=niv(G.g3n05).filter(p=>p._info&&p._info.modo==="troca"&&p._info.tipo!=="sinal");if(it.length>1)ruim++}
 console.log("nível 5: folhas com mais de 1 par de algarismos trocados",ruim);if(ruim)falha(5,ruim+" folhas com 2 ou mais")}
for(const g of FC.G3)if(!(g.meta>=60&&g.meta<=180))falha(g.nivel,"meta de tempo fora do esperado");

console.log(falhas?("\n"+falhas+" falha(s)"):"\nsem falhas");process.exit(falhas?1:0);
