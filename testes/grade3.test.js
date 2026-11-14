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
