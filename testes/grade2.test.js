/* Testes dos geradores da grade do 2º ano (níveis 1 a 7), conforme bncc/fichas/2ano-niveis-01-07.md. Rodar com: node testes/grade2.test.js
   A resposta é sempre recalculada a partir do que está no desenho ou no texto, nunca do campo que o gerador devolve. */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');require('../grade1.js');require('../grade2.js');
const FC=global.FC,G=FC.G2BY;
let falhas=0;const falha=(n,m)=>{falhas++;if(falhas<40)console.log("  FALHA",n,m)};
const N=6000,draw=g=>{const a=[];for(let i=0;i<N;i++)a.push(g.gen());return a};
const nums=s=>(s.match(/\d+/g)||[]).map(Number);
const cnt=(html,cls)=>(html.match(new RegExp('class="'+cls+'"','g'))||[]).length;

/* ---- Níveis 1 e 6: filas com um espaço ---- */
function filaTest(nivel,passos,lo,hi,pesos,min30){
  const its=draw(G["g2n0"+nivel]);let sobe=0,cruza={},tot={};const porPasso={};
  for(const p of its){
    const m=p.pre.match(/^De (\d+) em (\d+): ([\d ]*)$/);if(!m||m[1]!==m[2]){falha(nivel,"pergunta fora do formato: "+p.pre);continue}
    const passo=Number(m[1]),esq=nums(m[3]),dir=nums(p.post),v=[...esq,p.a,...dir];
    if(!passos.includes(passo))falha(nivel,"passo inesperado "+passo);
    if(v.length!==5||esq.length<1||dir.length<1)falha(nivel,"o espaço não pode estar nas pontas: "+v);
    const d=v[1]-v[0];if(Math.abs(d)!==passo)falha(nivel,"a regra escrita não confere com a fila: "+passo+" / "+v);
    for(let i=1;i<5;i++)if(v[i]-v[i-1]!==d)falha(nivel,"fila fora da regra: "+v);
    if(v.some(x=>x<lo||x>hi))falha(nivel,"fila fora de "+lo+" a "+hi+": "+v);
    if(nivel===1&&v.some(x=>x%passo!==0))falha(nivel,"termo que não é múltiplo do passo: "+v);
    if(!(p.a>0))falha(nivel,"resposta zero");
    porPasso[passo]=(porPasso[passo]||0)+1;if(d>0)sobe++;
    if(nivel===6&&passo<100){tot[passo]=(tot[passo]||0)+1;if(Math.floor(v[0]/(10*passo))!==Math.floor(v[4]/(10*passo)))cruza[passo]=(cruza[passo]||0)+1}
  }
  console.log("nível "+nivel+": passos",JSON.stringify(porPasso),"crescentes",(100*sobe/N).toFixed(0)+"%",nivel===6?"travessias "+JSON.stringify(cruza):"");
  if(Math.abs(sobe/N-.7)>.04)falha(nivel,"proporção de crescentes");
  for(const k of Object.keys(pesos))if(Math.abs((porPasso[k]||0)/N-pesos[k])>.04)falha(nivel,"proporção do passo "+k);
  if(min30)for(const k of Object.keys(tot))if((cruza[k]||0)/tot[k]<.3)falha(nivel,"travessias abaixo de 30% no passo "+k);
}
filaTest(1,[2,5,10],0,100,{2:1/3,5:1/3,10:1/3},false);
filaTest(6,[1,10,100],100,999,{1:.25,10:.4,100:.35},true);

/* ---- Nível 2 ---- */
{const its=draw(G.g2n02);let t1=0,t2=0,t3=0,zero=0;
 for(const p of its){
  const f=p.extra.fig;if(f.t!=="placas"){falha(2,"figura de outro tipo");continue}
  const html=FC.fig(f),pl=cnt(html,"pl"),br=cnt(html,"br"),un=cnt(html,"un");
  if(pl!==f.h||br!==f.d||un!==f.o)falha(2,"o desenho não tem as peças do número: "+JSON.stringify(f)+" "+[pl,br,un]);
  if(f.h<1||f.h>9||f.d<0||f.d>9||f.o<0||f.o>9)falha(2,"peças fora de 0 a 9");
  const n=pl*100+br*10+un;
  if((html.match(/<rect class="pl"/g)||[]).length!==pl)falha(2,"placas");
  if(html.split('class="pl"')[0].length&&false)falha(2,"");
  if(/^Cada placa vale 100/.test(p.pre)){t1++;if(p.pre!=="Cada placa vale 100, cada barra vale 10 e cada quadradinho vale 1. Quanto vale tudo junto?")falha(2,"legenda: "+p.pre);
    if(p.a!==n)falha(2,"valor errado "+n+" vs "+p.a);if(br===0||un===0)zero++;if(n<100||n>999)falha(2,"valor fora de 100 a 999")}
  else{const m=p.pre.match(/^O número (\d+) (?:é formado por|tem) (quantas placas de 100|quantas barras de 10|quantos quadradinhos soltos)\?$/);
    if(!m){falha(2,"pergunta desconhecida: "+p.pre);continue}
    if(Number(m[1])!==n)falha(2,"o número da pergunta não é o do desenho");
    const certo=/placas/.test(m[2])?pl:/barras/.test(m[2])?br:un;
    if(p.a!==certo)falha(2,"resposta errada: "+p.pre+" → "+p.a+" (desenho "+[pl,br,un]+")");
    if(p.a===0){t3++;zero++;if(/placas/.test(m[2]))falha(2,"zero em placas")}else t2++;
    if(/é formado por/.test(p.pre)&&/quadradinhos/.test(m[2]))falha(2,"concordância")}
 }
 console.log("nível 2: valor da figura",(100*t1/N).toFixed(0)+"%, casas cheias",(100*t2/N).toFixed(0)+"%, casa vazia (resposta 0)",(100*t3/N).toFixed(0)+"%, com zero",(100*zero/N).toFixed(0)+"%");
 if(zero/N<.2||zero/N>.45)falha(2,"proporção de números com zero fora de 20% a 45%");
 if(Math.abs(t3/N-.125)>.03)falha(2,"casa vazia deveria ser ~12%");}

/* ---- Nível 3 ---- */
{const its=draw(G.g2n03);let t1=0,t2=0,z=0,zr=0;
 for(const p of its){
  let m=p.pre.match(/^Qual número tem (\d+) centenas?, (\d+) dezenas? e (\d+) unidades?\?$/);
  if(m){t1++;const[h,t,o]=[m[1],m[2],m[3]].map(Number);
   if(p.a!==h*100+t*10+o)falha(3,"número montado errado: "+p.pre);
   if(h<1)falha(3,"zero centenas");
   if(!(p.pre.includes(h===1?"1 centena,":h+" centenas,"))||(t===1&&!p.pre.includes("1 dezena "))||(o===1&&!p.pre.includes("1 unidade?")))falha(3,"concordância: "+p.pre);
   if(t===0||o===0)z++;continue}
  m=p.pre.match(/^No número (\d{3}), quanto vale o algarismo (\d)\?$/);
  if(m){t2++;const n=m[1],d=m[2];if(d==="0")falha(3,"valor do zero");
   const pos=[...n].map((c,i)=>c===d?i:-1).filter(i=>i>=0);if(pos.length!==1)falha(3,"algarismo repetido no número: "+p.pre);
   if(p.a!==Number(d)*[100,10,1][pos[0]])falha(3,"valor errado: "+p.pre+" → "+p.a);
   if(n.includes("0"))z++;continue}
  m=p.pre.match(/^Que algarismo está na casa (das dezenas|das unidades) de (\d{3})\?$/);
  if(m){t2++;zr++;z++;const n=m[2],c=n[m[1]==="das dezenas"?1:2];if(c!=="0"||p.a!==0)falha(3,"casa vazia: "+p.pre+" → "+p.a);continue}
  falha(3,"pergunta desconhecida: "+p.pre);
 }
 console.log("nível 3: montar",(100*t1/N).toFixed(0)+"%, valor e casa vazia",(100*t2/N).toFixed(0)+"%, com zero",(100*z/N).toFixed(0)+"%, resposta zero",(100*zr/N).toFixed(1)+"%");
 if(Math.abs(t1/N-.5)>.04)falha(3,"os dois tipos deviam ser metade e metade");
 if(z/N<.2||z/N>.45)falha(3,"números com zero fora de 20% a 45%");}

/* ---- Nível 4 ---- */
{const its=draw(G.g2n04),tipos={1:0,2:0,3:0,4:0,5:0};let zero=0,zeroTipos45=0,tipos13=0;
 for(const p of its){
  let m;const pre=p.pre,post=p.post;
  if((m=pre.match(/^(\d{3}) = (\d+) \+ (\d+) \+$/))){tipos[1]++;tipos13++;const n=+m[1];if(+m[2]+ +m[3]+p.a!==n)falha(4,"tipo 1: "+pre+" ? → "+p.a);if(p.a===0)zero++;if(+m[2]%100!==0||+m[3]%10!==0)falha(4,"tipo 1 parcelas")}
  else if((m=pre.match(/^(\d{3}) = (\d+) \+$/))&&/^\+ \d$/.test(post)){tipos[2]++;tipos13++;const n=+m[1];if(+m[2]+p.a+nums(post)[0]!==n)falha(4,"tipo 2: "+pre+" "+post+" → "+p.a);if(p.a===0)zero++;if(p.a%10!==0)falha(4,"tipo 2: dezena")}
  else if((m=pre.match(/^(\d{3}) =$/))){tipos[3]++;tipos13++;const[a,b]=nums(post);if(p.a+a+b!==+m[1])falha(4,"tipo 3: "+pre+" "+post+" → "+p.a);if(p.a%100!==0||p.a<100)falha(4,"tipo 3: centena")}
  else if((m=pre.match(/^Qual número é (\d+) \+ (\d+) \+ (\d+)\?$/))){tipos[4]++;if(p.a!==+m[1]+ +m[2]+ +m[3])falha(4,"tipo 4: "+pre);if(+m[2]===0||+m[3]===0)falha(4,"tipo 4 com zero");}
  else if((m=pre.match(/^(\d{3}) = (\d+) \+$/))){tipos[5]++;const n=+m[1],k=+m[2];if(k%100!==0||k>=n||p.a!==n-k)falha(4,"tipo 5: "+pre+" → "+p.a);if(p.a===0)falha(4,"tipo 5 com zero")}
  else falha(4,"pergunta desconhecida: "+pre+" | "+post);
 }
 console.log("nível 4: tipos",JSON.stringify(tipos),"respostas zero",(100*zero/tipos13).toFixed(0)+"% dos tipos 1 a 3");
 for(const k of [1,2,3,4,5])if(Math.abs(tipos[k]/N-.2)>.04)falha(4,"tipo "+k+" fora de 20%");
 if(zero/tipos13<.03||zero/tipos13>.15)falha(4,"zeros nos tipos 1 a 3 fora do esperado");}

/* ---- Nível 5 ---- */
{const its=draw(G.g2n05),modos={};let t1=0,t2=0,pos=[0,0,0,0];
 for(const p of its){
  const opts=p.extra.opts,v=p.extra.opts.length;
  if(opts.length!==3||new Set(opts).size!==3)falha(5,"opções repetidas");
  if(/^Qual é o (maior|menor) número\?$/.test(p.pre)){t1++;const maior=/maior/.test(p.pre),ns=opts.map(Number),certa=maior?Math.max(...ns):Math.min(...ns);
   if(ns[p.a-1]!==certa)falha(5,"maior/menor errado: "+opts+" → "+p.a);if(ns.some(n=>n<100||n>999))falha(5,"fora de 100 a 999");
   modos[p._info.modo]=(modos[p._info.modo]||0)+1;if(new Set(ns).size!==3)falha(5,"números repetidos")}
  else{const m=p.pre.match(/^Qual é a ordem certa, do (menor para o maior|maior para o menor)\?$/);if(!m){falha(5,"pergunta desconhecida: "+p.pre);continue}t2++;
   const listas=opts.map(o=>o.split(", ").map(Number)),asc=m[1]==="menor para o maior",certa=listas[p.a-1];
   const ord=[...certa].sort((a,b)=>asc?a-b:b-a);if(ord.join()!==certa.join())falha(5,"ordem certa errada: "+opts+" → "+p.a);
   const base=[...certa].sort((a,b)=>a-b).join();listas.forEach((l,i)=>{if([...l].sort((a,b)=>a-b).join()!==base)falha(5,"lista com outros números");
     if(i!==p.a-1&&l.join()===certa.join())falha(5,"duas listas certas")});
   modos[p._info.modo]=(modos[p._info.modo]||0)+1}
  pos[p.a]++;
 }
 console.log("nível 5: maior/menor",(100*t1/N).toFixed(0)+"%, ordem",(100*t2/N).toFixed(0)+"%, modos",JSON.stringify(modos));
 for(const k of [1,2,3])if(Math.abs(pos[k]/N-1/3)>.04)falha(5,"posição da certa não é uniforme");
 if(Math.abs(t1/N-.625)>.04)falha(5,"proporção maior/menor");
 const esp={sep:.4,dez:.35,uni:.1,troca:.1,zero:.05};for(const k in esp)if(Math.abs((modos[k]||0)/N-esp[k])>.04)falha(5,"modo "+k+" fora do esperado");}
{ // algarismos trocados e 305/350: verificação dos modos pelos números
 const its=draw(G.g2n05);let trocaOk=0,trocas=0,zeroOk=0,zeros=0;
 for(const p of its){const m=p._info.modo,v=p._info.v;
  if(m==="troca"){trocas++;const ds=v.map(n=>[...String(n)].sort().join(""));if(new Set(ds).size===1)trocaOk++}
  if(m==="zero"){zeros++;const a=v.find(n=>v.some(x=>x!==n&&x>=100&&String(x).length===3&&[...String(x)].sort().join("")===[...String(n)].sort().join("")&&String(x)[1]==="0"!==(String(n)[1]==="0")));if(a)zeroOk++}
  if(m==="sep"){const hs=v.map(n=>Math.floor(n/100)).sort((a,b)=>a-b);if(hs[1]-hs[0]<2||hs[2]-hs[1]<2)falha(5,"centenas pouco separadas: "+v)}
  if(m==="dez"){const hs=v.map(n=>Math.floor(n/100));const rep=hs.find((h,i)=>hs.indexOf(h)!==i);const dois=v.filter(n=>Math.floor(n/100)===rep);if(dois.length!==2||Math.floor(dois[0]/10)===Math.floor(dois[1]/10))falha(5,"modo dez: "+v)}
  if(m==="uni"){const hs=v.map(n=>Math.floor(n/10));const rep=hs.find((h,i)=>hs.indexOf(h)!==i);if(rep===undefined)falha(5,"modo uni: "+v)}}
 console.log("nível 5: trocados que são permutações",trocaOk+"/"+trocas+", pares 305/350",zeroOk+"/"+zeros);
 if(trocaOk!==trocas)falha(5,"troca sem permutação");if(zeroOk!==zeros)falha(5,"zero sem par 305/350");}

/* ---- Nível 7 ---- */
{const its=draw(G.g2n07);const restos={};let pos=[0,0,0,0,0];
 for(const p of its){
  const f=p.extra.fig,html=FC.fig(f),pts=cnt(html,"pt"),n=pts,opts=p.extra.opts.map(Number);
  if(f.t!=="mancha")falha(7,"figura de outro tipo");
  if(pts!==f.n)falha(7,"pontos desenhados diferentes do total");
  if(n<150||n>950)falha(7,"total fora de 150 a 950: "+n);
  const r=n%100;if(r>35&&r<65)falha(7,"resto perto de 50: "+n);
  const rows=Math.ceil(n/f.c);if(f.c<10||f.c>40||rows<10||rows>25)falha(7,"grade fora de 10 a 40 colunas e 10 a 25 linhas: "+f.c+"x"+rows);
  if(Math.floor(n/f.c)<10)falha(7,"o quadro de 100 precisa de 10 linhas cheias: "+n+"/"+f.c);
  if(cnt(html,"q100")!==1||!/>100</.test(html))falha(7,"falta o quadro marcado 100");
  const lado=html.match(/class="q100" x="[\d.]+" y="[\d.]+" width="(\d+)" height="(\d+)"/);if(!lado||lado[1]!==lado[2]||lado[1]!=="60")falha(7,"o quadro não cobre 10 x 10 pontos");
  if(opts.length!==4||new Set(opts).size!==4||opts.some(o=>o%100!==0||o<100||o>1000))falha(7,"opções: "+opts);
  const certa=Math.round(n/100)*100,proxima=opts.reduce((a,b)=>Math.abs(b-n)<Math.abs(a-n)?b:a);
  if(opts[p.a-1]!==certa||proxima!==certa)falha(7,"a certa não é a mais próxima: "+n+" "+opts+" → "+p.a);
  const os=[...opts].sort((a,b)=>a-b);for(let i=1;i<4;i++)if(os[i]-os[i-1]!==100)falha(7,"opções não consecutivas");
  restos[r<50?"abaixo":"acima"]=(restos[r<50?"abaixo":"acima"]||0)+1;pos[p.a]++;
 }
 console.log("nível 7: arredonda para baixo/cima",JSON.stringify(restos),"posição da certa",pos.slice(1).map(x=>(100*x/N).toFixed(0)+"%").join(" "));
 for(let k=1;k<=4;k++)if(Math.abs(pos[k]/N-.25)>.04)falha(7,"posição da certa não é uniforme");}

/* ---- Folhas: 10 contas, sem repetição, com os limites de cada nível ---- */
for(const g of FC.G2){
  FC.LEVELS=[{gen:g.gen}];let rep=0,estouro=0;
  for(let i=0;i<1500;i++){
    const it=FC.makeItems(0);
    if(it.length!==10)falha(g.nivel,"folha sem 10 contas");
    if(new Set(it.map(FC.itemKey)).size<10)rep++;
    const c={};for(const p of it)for(const l of (p.limits||(p.grp?[[p.grp,p.cap]]:[]))){c[l[0]]=(c[l[0]]||0)+1;if(c[l[0]]>l[1])estouro++}
  }
  console.log("nível "+g.nivel+": folhas com conta repetida "+rep+" de 1500; folhas acima de um limite "+estouro);
  if(rep)falha(g.nivel,rep+" folhas com conta repetida");
  if(estouro)falha(g.nivel,estouro+" estouros de limite");
}
{ // nível 5: no máximo 1 par de algarismos trocados por folha
 FC.LEVELS=[{gen:G.g2n05.gen}];let ruim=0;
 for(let i=0;i<1500;i++){const it=FC.makeItems(0).filter(p=>p._info&&p._info.modo==="troca");if(it.length>1)ruim++}
 console.log("nível 5: folhas com mais de 1 par de algarismos trocados",ruim);if(ruim)falha(5,ruim+" folhas com 2 ou mais pares trocados")}
for(const g of FC.G2)if(!(g.meta>=60&&g.meta<=180))falha(g.nivel,"meta de tempo fora do esperado");

console.log(falhas?("\n"+falhas+" falha(s)"):"\nsem falhas");process.exit(falhas?1:0);
