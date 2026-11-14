/* Testes dos geradores da grade do 1º ano (níveis 1 a 7), conforme bncc/fichas/. Rodar com: node testes/grade1.test.js
   A resposta é sempre recalculada a partir do que está no desenho ou no texto, nunca do campo que o gerador devolve. */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');require('../grade1.js');
const FC=global.FC,G=FC.G1BY,OBJ=FC.exh.OBJ,NAMES=FC.exh.NAMES;
let falhas=0;const falha=(n,m)=>{falhas++;if(falhas<40)console.log("  FALHA",n,m)};
const N=6000,fra=(c,t)=>c/t;
const draw=g=>{const a=[];for(let i=0;i<N;i++)a.push(g.gen());return a};
const tem=(v,lo,hi)=>Number.isInteger(v)&&v>=lo&&v<=hi;
const gen=n=>n.length===1?(OBJ.find(o=>o.pl===n[0])||{}):{};

/* ---- Nível 1 ---- */
{const g=G.g1n01,its=draw(g),vistos=new Set();let por5=0;
 for(const p of its){const f=p.extra.fig,n=f.groups[0].n;vistos.add(p.a);
  if(f.groups.length!==1||f.per!==5)falha(1,"figura fora do formato");
  if(p.a!==n)falha(1,"resposta diferente do que está desenhado");
  if(!tem(p.a,1,10))falha(1,"quantidade fora de 1 a 10");
  const o=OBJ.find(x=>x.e===f.groups[0].e);
  if(!p.pre.startsWith(o.f?"Quantas ":"Quantos "))falha(1,"concordância: "+p.pre);
  if(!p.pre.includes(o.pl))falha(1,"objeto da pergunta não é o da figura");
  const html=FC.fig(f);if((html.match(new RegExp(f.groups[0].e,"g"))||[]).length!==n)falha(1,"html com número errado de objetos");
 }
 if(vistos.size!==10)falha(1,"nem todas as quantidades de 1 a 10 aparecem");
 console.log("nível 1: quantidades vistas",[...vistos].sort((a,b)=>a-b).join(","));}

/* ---- Nível 2 ---- */
{const g=G.g1n02,its=draw(g);let eq=0,d1=0,d24=0,pos=[0,0,0,0];
 for(const p of its){const f=p.extra.fig,[a,b]=f.groups,opts=p.extra.opts;
  if(!f.side||f.per!==5)falha(2,"grupos precisam ficar lado a lado");
  if(a.e===b.e)falha(2,"os dois grupos têm o mesmo emoji");
  if(!tem(a.n,1,10)||!tem(b.n,1,10))falha(2,"grupo fora de 1 a 10");
  const mais=/mais/.test(p.pre),igual="a mesma quantidade";let certa;
  if(a.n===b.n)certa=igual;else certa=((a.n>b.n)===mais)?a.e:b.e;
  if(opts[p.a-1]!==certa)falha(2,"resposta errada: "+JSON.stringify([a,b,p.pre,opts,p.a]));
  if(new Set(opts).size!==3||opts.length!==3)falha(2,"opções repetidas");
  if(!opts.includes(a.e)||!opts.includes(b.e)||!opts.includes(igual))falha(2,"opções erradas");
  if(a.n!==b.n&&opts.filter(o=>o===certa).length!==1)falha(2,"duas certas");
  const d=Math.abs(a.n-b.n);if(d===0)eq++;else if(d===1)d1++;else d24++;
  if(d>4)falha(2,"diferença maior que 4");pos[p.a]++;}
 console.log("nível 2: empate",(100*eq/N).toFixed(1)+"%, diferença 1",(100*d1/N).toFixed(1)+"%, 2 a 4",(100*d24/N).toFixed(1)+"%");
 if(Math.abs(fra(eq,N)-.25)>.04||Math.abs(fra(d1,N)-.25)>.04)falha(2,"proporção de empate ou diferença 1 fora do esperado");
 for(let k=1;k<=3;k++)if(Math.abs(pos[k]/N-1/3)>.04)falha(2,"posição da certa não é uniforme");}

/* ---- Nível 3 ---- */
{const g=G.g1n03,its=draw(g);let sobe=0;
 for(const p of its){
  const esq=(p.pre.replace("Complete a fila: ","").trim().split(/\s+/)).filter(Boolean).map(Number),dir=(p.post.trim().split(/\s+/)).filter(Boolean).map(Number);
  const fila=[...esq,p.a,...dir];
  if(fila.length!==5)falha(3,"fila sem 5 números");
  if(esq.length<1||dir.length<1)falha(3,"o espaço não pode estar nas pontas");
  const d=fila[1]-fila[0];if(Math.abs(d)!==1)falha(3,"não é de 1 em 1");
  for(let i=1;i<5;i++)if(fila[i]-fila[i-1]!==d)falha(3,"a fila não segue a regra: "+fila);
  if(fila.some(x=>x<1||x>20))falha(3,"fila fora de 1 a 20");
  if(d===1)sobe++;}
 console.log("nível 3: crescentes",(100*sobe/N).toFixed(1)+"%");
 if(Math.abs(sobe/N-.7)>.04)falha(3,"proporção de crescentes");}

/* ---- Nível 4 ---- */
{const g=G.g1n04,its=draw(g);let alto=0;
 for(const p of its){const f=p.extra.fig,n=f.groups[0].n;
  if(p.a!==n||!tem(n,6,20))falha(4,"quantidade");if(f.per!==5)falha(4,"fileiras de 5");
  if(n>=11)alto++;
  const o=OBJ.find(x=>x.e===f.groups[0].e);if(!p.pre.startsWith(o.f?"Quantas ":"Quantos "))falha(4,"concordância");}
 console.log("nível 4: de 11 a 20",(100*alto/N).toFixed(1)+"%");
 if(Math.abs(alto/N-.8)>.04)falha(4,"proporção de 11 a 20");}

/* ---- Nível 5 ---- */
{const g=G.g1n05,its=draw(g);let alto=0,dmin=1e9;
 for(const p of its){const f=p.extra.fig,n=f.pts.length;
  if(p.a!==n)falha(5,"resposta diferente do número de objetos");
  if(!tem(n,6,20))falha(5,"quantidade fora de 6 a 20");
  if(n>=11)alto++;
  for(const [x,y] of f.pts)if(x<14||x>286||y<14||y>186)falha(5,"objeto perto demais da borda: "+x+","+y);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const d=Math.hypot(f.pts[i][0]-f.pts[j][0],f.pts[i][1]-f.pts[j][1]);if(d<dmin)dmin=d}
  const html=FC.fig(f);if((html.match(/<span /g)||[]).length!==n)falha(5,"html com número errado de objetos");
  if(!p.key||!p.key.startsWith("solto|"))falha(5,"sem identidade da conta");}
 console.log("nível 5: menor distância entre objetos",dmin.toFixed(1),"(emoji de ~27); de 11 a 20",(100*alto/N).toFixed(1)+"%");
 if(dmin<=30)falha(5,"objetos se sobrepõem (distância "+dmin+")");
 if(Math.abs(alto/N-.7)>.04)falha(5,"proporção de 11 a 20");}

/* ---- Nível 6 ---- */
{const g=G.g1n06,its=draw(g),tipos={ad:0,entre:0,fila:0,inv:0};
 for(const p of its){let m;
  if((m=p.pre.match(/^Que número vem (antes|depois) do (\d+)\?$/))){tipos.ad++;const n=+m[2];
    if(m[1]==="depois"){if(!tem(n,1,19)||p.a!==n+1)falha(6,"depois: "+p.pre)}else{if(!tem(n,2,20)||p.a!==n-1)falha(6,"antes: "+p.pre)}}
  else if((m=p.pre.match(/^Que número está entre o (\d+) e o (\d+)\?$/))){tipos.entre++;
    if(+m[2]!==+m[1]+2||p.a!==+m[1]+1||!tem(+m[1],1,18))falha(6,"entre: "+p.pre)}
  else if((m=p.pre.match(/^(\S+) é (a|o) (\d+)(ª|º) da fila\. Quantas crianças estão na frente (dela|dele)\?$/))){tipos.fila++;
    const nm=NAMES.find(x=>x[0]===m[1]),f=nm[1]==="f",pos=+m[3];
    if(!tem(pos,2,10)||p.a!==pos-1)falha(6,"fila: "+p.pre);
    if(m[2]!==(f?"a":"o")||m[4]!==(f?"ª":"º")||m[5]!==(f?"dela":"dele"))falha(6,"concordância: "+p.pre)}
  else if((m=p.pre.match(/^Tem (\d+) (criança|crianças) na frente (da|do) (\S+)\. (A|O) \4 é (a|o) que posição\?$/))){tipos.inv++;
    const nm=NAMES.find(x=>x[0]===m[4]),f=nm[1]==="f",k=+m[1];
    if(!tem(k,1,9)||p.a!==k+1)falha(6,"inverso: "+p.pre);
    if(m[2]!==(k===1?"criança":"crianças")||m[3]!==(f?"da":"do")||m[5]!==(f?"A":"O")||m[6]!==(f?"a":"o"))falha(6,"concordância: "+p.pre)}
  else falha(6,"pergunta desconhecida: "+p.pre);}
 console.log("nível 6: antes/depois",(100*tipos.ad/N).toFixed(0)+"%, entre",(100*tipos.entre/N).toFixed(0)+"%, fila",(100*(tipos.fila+tipos.inv)/N).toFixed(0)+"% (inverso "+(100*tipos.inv/N).toFixed(0)+"%)");
 if(Math.abs(tipos.ad/N-.4)>.04||Math.abs(tipos.entre/N-.2)>.04)falha(6,"proporção dos tipos");}

/* ---- Nível 7 ---- */
{const g=G.g1n07,its=draw(g);let close=0,mixed=0,pos=[0,0,0,0],mais=0;
 for(const p of its){const v=p.extra.opts.map(Number),ehMaior=/maior/.test(p.pre);
  if(v.length!==3||new Set(v).size!==3||v.some(x=>!tem(x,1,20)))falha(7,"opções: "+v);
  const certa=ehMaior?Math.max(...v):Math.min(...v);if(v[p.a-1]!==certa)falha(7,"resposta errada: "+p.pre+" "+v+" "+p.a);
  pos[p.a]++;if(ehMaior)mais++;
  const o=v.slice().sort((a,b)=>a-b);if((ehMaior?o[2]-o[1]:o[1]-o[0])<=2)close++;if(o[0]<10&&o[2]>=10)mixed++;}
 console.log("nível 7: próximos",(100*close/N).toFixed(0)+"%, um e dois algarismos juntos",(100*mixed/N).toFixed(0)+"%, maior",(100*mais/N).toFixed(0)+"%");
 for(let k=1;k<=3;k++)if(Math.abs(pos[k]/N-1/3)>.04)falha(7,"posição da certa não é uniforme");
 if(close/N<.28)falha(7,"poucos números próximos");if(mixed/N<.38)falha(7,"poucos números de um e dois algarismos juntos");}

/* ---- Folhas: 10 contas, sem repetição, com os limites de cada nível ---- */
for(const g of FC.G1){
  FC.LEVELS=[{gen:g.gen}];let rep=0,estouro=0;
  for(let i=0;i<1500;i++){
    const it=FC.makeItems(0);
    if(it.length!==10)falha(g.nivel,"folha sem 10 contas");
    if(new Set(it.map(FC.itemKey)).size<10)rep++;
    const c={};for(const p of it)if(p.grp){c[p.grp]=(c[p.grp]||0)+1;if(c[p.grp]>p.cap)estouro++}
  }
  console.log("nível "+g.nivel+": folhas com conta repetida "+rep+" de 1500; folhas acima do limite do grupo "+estouro);
  if(rep)falha(g.nivel,rep+" folhas com conta repetida");
  if(estouro)falha(g.nivel,estouro+" estouros do limite por grupo");
}
// metas de tempo
for(const g of FC.G1)if(!(g.meta>=60&&g.meta<=180))falha(g.nivel,"meta de tempo fora do esperado");

console.log(falhas?("\n"+falhas+" falha(s)"):"\nsem falhas");process.exit(falhas?1:0);
