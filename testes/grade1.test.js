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

/* ---- Contas dos níveis 8 a 12 ---- */
const MEN="−";
function conta(p){const m=p.pre.match(/^(\d+) ([+−]) (\d+) =$/);if(!m)return null;return {a:+m[1],op:m[2]==="+"?"+":"-",b:+m[3]}}
function limitesOk(nivel,it){const c={};for(const p of it)for(const [g,m] of (p.limits||[])){c[g]=(c[g]||0)+1;if(c[g]>m)return g}return null}
{ // nível 8
 const its=draw(G.g1n08);let s=0,sub=0;
 for(const p of its){const c=conta(p);if(!c){falha(8,"formato: "+p.pre);continue}
  const f=p.extra.fig;
  if(c.op==="+"){s++;
   if(!(c.a>=1&&c.b>=1&&c.a+c.b<=5))falha(8,"soma fora de até 5: "+p.pre);
   if(p.a!==c.a+c.b)falha(8,"soma errada");
   if(f.groups.length!==2||f.groups[0].n!==c.a||f.groups[1].n!==c.b||f.sep!=="+")falha(8,"figura da soma não bate");}
  else{sub++;
   if(!(c.a<=5&&c.b>=1&&c.b<c.a))falha(8,"subtração fora de até 5: "+p.pre);
   if(p.a!==c.a-c.b||p.a<1)falha(8,"subtração errada");
   if(f.groups.length!==1||f.groups[0].n!==c.a||f.groups[0].x!==c.b)falha(8,"figura da subtração não bate (riscados)");
   const h=FC.fig(f);if((h.match(/class="x"/g)||[]).length!==c.b)falha(8,"html com número errado de riscados");}}
 console.log("nível 8: somas",(100*s/N).toFixed(0)+"%, subtrações",(100*sub/N).toFixed(0)+"%");
 const d=new Set(its.map(p=>p.pre));console.log("nível 8: contas diferentes",d.size);if(d.size!==20)falha(8,"esperadas 20 contas diferentes, vieram "+d.size);}
{ // nível 9
 const its=draw(G.g1n09);let k1=0,k=0;const d=new Set();
 for(const p of its){const c=conta(p);if(!c){falha(9,"formato");continue}d.add(p.pre);
  if(c.op==="+"){const peq=Math.min(c.a,c.b),gr=Math.max(c.a,c.b);if(peq<1||peq>3||c.a+c.b>10||p.a!==c.a+c.b)falha(9,"soma: "+p.pre);
    if(c.a<=3&&c.b<=3){}k++;if(peq===1)k1++}
  else{if(c.b<1||c.b>3||c.b>=c.a||c.a>10||p.a!==c.a-c.b)falha(9,"subtração: "+p.pre)}
  if(p.extra)falha(9,"não deve ter figura")}
 console.log("nível 9: contas diferentes",d.size);if(d.size!==63)falha(9,"esperadas 63, vieram "+d.size);
 const maior=its.filter(p=>conta(p).op==="+").some(p=>conta(p).a+conta(p).b>10);if(maior)falha(9,"soma passa de 10 (o vício do gerador antigo)");}
{ // nível 10
 const its=draw(G.g1n10);let dez=0;const d=new Set();
 for(const p of its){const c=conta(p);if(!c||c.op!=="+"){falha(10,"formato");continue}d.add(p.pre);
  if(c.a<1||c.b<1||c.a+c.b>10||p.a!==c.a+c.b)falha(10,"soma: "+p.pre);if(c.a+c.b===10)dez++;if(p.extra)falha(10,"sem figura")}
 console.log("nível 10: contas diferentes",d.size,"; soma 10 em",(100*dez/N).toFixed(0)+"%");if(d.size!==45)falha(10,"esperadas 45 contas, vieram "+d.size);
 if(dez/N<.16||dez/N>.26)falha(10,"proporção de somas 10: "+dez/N);}
{ // nível 11
 const its=draw(G.g1n11);let a6=0,dez=0;const d=new Set();
 for(const p of its){const c=conta(p);if(!c||c.op!=="-"){falha(11,"formato");continue}d.add(p.pre);
  if(c.a>10||c.b<1||c.b>=c.a||p.a!==c.a-c.b||p.a<1)falha(11,"subtração: "+p.pre);if(c.a>=6)a6++;if(c.a===10)dez++}
 console.log("nível 11: contas diferentes",d.size,"; a de 6 a 10:",(100*a6/N).toFixed(0)+"%; 10 − b:",(100*dez/N).toFixed(0)+"%");if(d.size!==45)falha(11,"esperadas 45 contas, vieram "+d.size);
 if(a6/N<.55)falha(11,"a de 6 a 10 abaixo de 55%");}
{ // nível 12
 const its=draw(G.g1n12);let s=0;const d=new Set();
 for(const p of its){const c=conta(p);if(!c){falha(12,"formato");continue}d.add(p.pre);
  if(c.op==="+"){s++;if(c.a<1||c.b<1||c.a+c.b>10||p.a!==c.a+c.b)falha(12,"soma")}else if(c.b<1||c.b>=c.a||c.a>10||p.a!==c.a-c.b)falha(12,"subtração")}
 console.log("nível 12: contas diferentes",d.size,"; somas",(100*s/N).toFixed(0)+"%");if(d.size!==90)falha(12,"esperadas 90 contas, vieram "+d.size);}

/* ---- Nível 13: problemas, a resposta é recalculada a partir do texto ---- */
{const g=G.g1n13,its=draw(g),tipos={juntar:0,acrescentar:0,separar:0,retirar:0};const SING={},PLUR={};
 const lex={"maçã":"maçãs","peixe":"peixes","estrela":"estrelas","balão":"balões","cachorro":"cachorros","flor":"flores","bola":"bolas","biscoito":"biscoitos","carro":"carros","pintinho":"pintinhos"};
 const fem=new Set(["maçãs","estrelas","flores","bolas"]);
 for(const p of its){const t=p.pre,pal=t.split(/\s+/).length;let m,res=null,tipo=null;
  if(pal>14)falha(13,"enunciado com "+pal+" palavras: "+t);
  if((m=t.match(/^(\S+) tem (\d+) (\S+) e (\S+) tem (\d+) (\S+)\. (Quantas|Quantos) (\S+) (elas|eles) têm (juntas|juntos)\?$/))){tipo="juntar";res=+m[2]+ +m[5];
    const n1=NAMES.find(x=>x[0]===m[1]),n2=NAMES.find(x=>x[0]===m[4]);
    if(m[1]===m[4])falha(13,"mesmo nome duas vezes");
    const elas=n1[1]==="f"&&n2[1]==="f";if(m[9]!==(elas?"elas":"eles")||m[10]!==(elas?"juntas":"juntos"))falha(13,"concordância das crianças: "+t);
    if(m[3]!==m[6]&&!(+m[2]===1||+m[5]===1))falha(13,"objetos diferentes: "+t);}
  else if((m=t.match(/^Havia (\d+) (\S+)\. (Chegou|Chegaram) (\d+)\. (Quantas|Quantos) (\S+) há agora\?$/))){tipo="acrescentar";res=+m[1]+ +m[4];
    if((m[3]==="Chegou")!==(+m[4]===1))falha(13,"verbo chegar: "+t);}
  else if((m=t.match(/^(\S+) tinha (\d+) (\S+)\. (Ela|Ele) deu (\d+) para um amigo\. (Quantas|Quantos) (\S+) sobraram\?$/))){tipo="separar";res=+m[2]-+m[5];
    const nm=NAMES.find(x=>x[0]===m[1]);if(m[4]!==(nm[1]==="f"?"Ela":"Ele"))falha(13,"ele/ela: "+t);}
  else if((m=t.match(/^Havia (\d+) (\S+)\. (Foi|Foram) embora (\d+)\. (Quantas|Quantos) (\S+) ficaram\?$/))){tipo="retirar";res=+m[1]-+m[4];
    if((m[3]==="Foi")!==(+m[4]===1))falha(13,"verbo ir embora: "+t);}
  else{falha(13,"enunciado desconhecido: "+t);continue}
  tipos[tipo]++;
  if(res!==p.a)falha(13,"resposta diferente do texto: "+t+" => "+p.a+" (texto dá "+res+")");
  if(res<1)falha(13,"resultado zero ou negativo: "+t);
  const f=p.extra.fig;
  const qm=t.match(/(Quantas|Quantos) (\S+) /),noun=qm[2];
  if(!Object.values(lex).includes(noun))falha(13,"a pergunta deveria estar no plural: "+t);
  if((qm[1]==="Quantas")!==fem.has(noun))falha(13,"Quantas/Quantos: "+t);
  if(tipo!=="separar"&&tipo!=="retirar"||true){const e0=f.groups[0].e;const [sg,pl]=[...Object.entries(lex)].find(([s,pp])=>pp===noun);if(!t.includes(" "+pl)&&!t.includes(" "+sg))falha(13,"objeto da pergunta não aparece no enunciado")}
  // singular e plural dos números
  for(const x of t.matchAll(/(\d+) (maçãs?|peixes?|estrelas?|balões?|balão|cachorros?|flores?|flor|bolas?|biscoitos?|carros?|pintinhos?)/g)){
    const n=+x[1],pal=x[2],plural=Object.values(lex).includes(pal);if((n===1)===plural)falha(13,"singular/plural de '"+x[0]+"' em: "+t)}
  const somaFig=f.groups.map(g=>g.n);
  if(tipo==="juntar"||tipo==="acrescentar"){if(somaFig[0]+somaFig[1]!==p.a)falha(13,"figura de soma não bate com a resposta");}
  else if(somaFig[0]-p.a<1||somaFig[0]>10)falha(13,"figura inicial fora de 3 a 10")}
 console.log("nível 13: tipos",JSON.stringify(Object.fromEntries(Object.entries(tipos).map(([k,v])=>[k,(100*v/N).toFixed(0)+"%"]))));
 for(const k in tipos)if(Math.abs(tipos[k]/N-.25)>.04)falha(13,"proporção de "+k);}

/* ---- Limites de cada folha dos níveis 8 a 13 ---- */
for(const nivel of [8,9,10,11,12,13]){
  const g=G["g1n"+String(nivel).padStart(2,"0")];FC.LEVELS=[{gen:g.gen}];let viol=0;
  for(let i=0;i<1500;i++){const it=FC.makeItems(0);const v=limitesOk(nivel,it);if(v){viol++;if(viol<3)console.log("   limite estourado:",v)}}
  console.log("nível "+nivel+": folhas que estouram um limite do grupo",viol,"de 1500");
  if(viol)falha(nivel,viol+" folhas estouraram um limite");
}
{ // 5 somas e 5 subtrações por folha nos níveis 8, 9 e 12
 for(const nivel of [8,9,12]){const g=G["g1n"+String(nivel).padStart(2,"0")];FC.LEVELS=[{gen:g.gen}];let ruim=0;
  for(let i=0;i<1500;i++){const it=FC.makeItems(0),s=it.filter(p=>conta(p).op==="+").length;if(s!==5)ruim++}
  console.log("nível "+nivel+": folhas sem exatamente 5 somas e 5 subtrações",ruim);if(ruim)falha(nivel,ruim+" folhas sem 5 e 5")}
 // parcelas trocadas nunca na mesma folha (níveis 8, 9, 10, 12)
 for(const nivel of [8,9,10,12]){const g=G["g1n"+String(nivel).padStart(2,"0")];FC.LEVELS=[{gen:g.gen}];let ruim=0;
  for(let i=0;i<1500;i++){const it=FC.makeItems(0).filter(p=>conta(p).op==="+"),k=it.map(p=>{const c=conta(p);return Math.min(c.a,c.b)+","+Math.max(c.a,c.b)});if(new Set(k).size<k.length)ruim++}
  console.log("nível "+nivel+": folhas com parcelas trocadas",ruim);if(ruim)falha(nivel,ruim+" folhas com parcelas trocadas")}}

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
