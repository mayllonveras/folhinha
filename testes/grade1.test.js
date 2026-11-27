/* Testes dos geradores da grade do 1º ano (níveis 1 a 7), conforme bncc/fichas/. Rodar com: node testes/grade1.test.js
   A resposta é sempre recalculada a partir do que está no desenho ou no texto, nunca do campo que o gerador devolve. */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');require('../grade1.js');
const FC=global.FC,G=FC.G1BY,OBJ=FC.exh.OBJ,NAMES=FC.exh.NAMES;
let falhas=0;const falha=(n,m)=>{falhas++;if(falhas<40)console.log("  FALHA",n,m)};
const FRASES34={"Com certeza":["Depois do sábado vem o domingo.","Lançar um dado comum e sair um número de 1 a 6.","Uma semana tem sete dias.","Todo ano tem doze meses.","Se hoje é segunda-feira, amanhã é terça-feira.","Ao soltar uma pedra do alto, ela cai.","A noite vem depois da tarde.","Dois mais dois é igual a quatro."],"Impossível":["Uma pessoa viva ter 300 anos de idade.","Uma pessoa nascer com 10 anos de idade.","Uma semana ter dez dias.","Sair o número 7 ao lançar um dado comum.","Um dado comum mostrar o número zero.","Depois da segunda-feira vir a quinta-feira.","O dia ter trinta e cinco horas.","Um mês do calendário ter 40 dias."],"Talvez":["Chover amanhã.","Sair cara ao lançar uma moeda.","Sortear um menino numa turma de meninos e meninas.","Encontrar um amigo no parque.","Sair o número 3 ao lançar um dado.","Ganhar um jogo de cartas.","Fazer sol no sábado.","Tirar uma figurinha repetida do pacote."]};
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
 if(dez/N<.17||dez/N>.30)falha(10,"proporção de somas 10: "+dez/N);}
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
function problemas(g,nivel,lo,hi,maxPal,minCruza){let cruzam=0;const its=draw(g),tipos={juntar:0,acrescentar:0,separar:0,retirar:0};const SING={},PLUR={};
 const lex={"maçã":"maçãs","peixe":"peixes","estrela":"estrelas","balão":"balões","cachorro":"cachorros","flor":"flores","bola":"bolas","biscoito":"biscoitos","carro":"carros","pintinho":"pintinhos"};
 const fem=new Set(["maçãs","estrelas","flores","bolas"]);
 for(const p of its){const t=p.pre,pal=t.split(/\s+/).length;let m,res=null,tipo=null,A=0,B=0;
  if(pal>maxPal)falha(nivel,"enunciado com "+pal+" palavras: "+t);
  if((m=t.match(/^(\S+) tem (\d+) (\S+) e (\S+) tem (\d+) (\S+)\. (Quantas|Quantos) (\S+) (elas|eles) têm (juntas|juntos)\?$/))){tipo="juntar";A=+m[2];B=+m[5];res=A+B;
    const n1=NAMES.find(x=>x[0]===m[1]),n2=NAMES.find(x=>x[0]===m[4]);
    if(m[1]===m[4])falha(nivel,"mesmo nome duas vezes");
    const elas=n1[1]==="f"&&n2[1]==="f";if(m[9]!==(elas?"elas":"eles")||m[10]!==(elas?"juntas":"juntos"))falha(nivel,"concordância das crianças: "+t);
    if(m[3]!==m[6]&&!(+m[2]===1||+m[5]===1))falha(nivel,"objetos diferentes: "+t);}
  else if((m=t.match(/^Havia (\d+) (\S+)\. (Chegou|Chegaram) (\d+)\. (Quantas|Quantos) (\S+) há agora\?$/))){tipo="acrescentar";A=+m[1];B=+m[4];res=A+B;
    if((m[3]==="Chegou")!==(+m[4]===1))falha(nivel,"verbo chegar: "+t);}
  else if((m=t.match(/^(\S+) tinha (\d+) (\S+)\. (Ela|Ele) deu (\d+) para um amigo\. (Quantas|Quantos) (\S+) sobraram\?$/))){tipo="separar";A=+m[2];B=+m[5];res=A-B;
    const nm=NAMES.find(x=>x[0]===m[1]);if(m[4]!==(nm[1]==="f"?"Ela":"Ele"))falha(nivel,"ele/ela: "+t);}
  else if((m=t.match(/^Havia (\d+) (\S+)\. (Foi|Foram) embora (\d+)\. (Quantas|Quantos) (\S+) ficaram\?$/))){tipo="retirar";A=+m[1];B=+m[4];res=A-B;
    if((m[3]==="Foi")!==(+m[4]===1))falha(nivel,"verbo ir embora: "+t);}
  else{falha(nivel,"enunciado desconhecido: "+t);continue}
  tipos[tipo]++;
  {const tot=(tipo==='juntar'||tipo==='acrescentar')?A+B:A;if(tot<lo||tot>hi)falha(nivel,'total fora de '+lo+' a '+hi+': '+t);
   const cruza=(tipo==='juntar'||tipo==='acrescentar')?(A<=9&&B<=9):(B>A%10);if(cruza)cruzam++;}
  if(res!==p.a)falha(nivel,"resposta diferente do texto: "+t+" => "+p.a+" (texto dá "+res+")");
  if(res<1)falha(nivel,"resultado zero ou negativo: "+t);
  const f=p.extra.fig;
  const qm=t.match(/(Quantas|Quantos) (\S+) /),noun=qm[2];
  if(!Object.values(lex).includes(noun))falha(nivel,"a pergunta deveria estar no plural: "+t);
  if((qm[1]==="Quantas")!==fem.has(noun))falha(nivel,"Quantas/Quantos: "+t);
  if(tipo!=="separar"&&tipo!=="retirar"||true){const e0=f.groups[0].e;const [sg,pl]=[...Object.entries(lex)].find(([s,pp])=>pp===noun);if(!t.includes(" "+pl)&&!t.includes(" "+sg))falha(nivel,"objeto da pergunta não aparece no enunciado")}
  // singular e plural dos números
  for(const x of t.matchAll(/(\d+) (maçãs?|peixes?|estrelas?|balões?|balão|cachorros?|flores?|flor|bolas?|biscoitos?|carros?|pintinhos?)/g)){
    const n=+x[1],pal=x[2],plural=Object.values(lex).includes(pal);if((n===1)===plural)falha(nivel,"singular/plural de '"+x[0]+"' em: "+t)}
  const somaFig=f.groups.map(g=>g.n);
  if(tipo==="juntar"||tipo==="acrescentar"){if(somaFig[0]+somaFig[1]!==p.a)falha(nivel,"figura de soma não bate com a resposta");}
  else if(somaFig[0]-p.a<1||somaFig[0]>hi||somaFig[0]<lo)falha(nivel,"figura inicial fora de "+lo+" a "+hi)}
 console.log("nível "+nivel+": passam da dezena "+(100*cruzam/N).toFixed(0)+"%; tipos",JSON.stringify(Object.fromEntries(Object.entries(tipos).map(([k,v])=>[k,(100*v/N).toFixed(0)+"%"]))));
 for(const k in tipos)if(Math.abs(tipos[k]/N-.25)>.04)falha(nivel,"proporção de "+k);
 if(cruzam/N<minCruza)falha(nivel,"poucos problemas passam da dezena: "+cruzam/N)}
problemas(G.g1n13,13,3,10,14,0);
problemas(G.g1n24,24,11,20,16,.5);

/* ---- Níveis 14 a 18 ---- */
const GEO=FC.exh.formaGeom;
const bbox=pts=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)}};
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
/* Reconhece a figura só pelo que foi desenhado (pontos): devolve o nome */
function nomeDaForma(f){
  const g=GEO(f);if(g.circle)return "círculo";
  const p=g.pts,b=bbox(p);
  if(b.x0<1||b.y0<1||b.x1>99||b.y1>99)falha(14,"figura sai da caixa: "+JSON.stringify(f));
  if(p.length===3){const a=Math.abs((p[1][0]-p[0][0])*(p[2][1]-p[0][1])-(p[2][0]-p[0][0])*(p[1][1]-p[0][1]))/2;
    if(a<300)falha(14,"triângulo pequeno ou achatado demais (área "+a+")");
    for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(dist(p[i],p[j])<30)falha(14,"triângulo com dois vértices muito próximos");
    return "triângulo"}
  if(p.length!==4){falha(14,"polígono inesperado");return "?"}
  const w=dist(p[0],p[1]),h=dist(p[1],p[2]);
  if(p[0][1]!==p[1][1]||p[1][0]!==p[2][0])falha(14,"quadrilátero girado");
  const r=Math.max(w,h)/Math.min(w,h);
  if(Math.abs(w-h)<.01)return "quadrado";
  if(r<1.39||r>2.51)falha(14,"retângulo com proporção "+r.toFixed(2));
  return "retângulo";
}
{ // nível 14
 const its=draw(G.g1n14),NN=["círculo","quadrado","retângulo","triângulo"];let t1=0,t2=0;
 for(const p of its){
  if(/^Como se chama esta figura\?$/.test(p.pre)){t1++;const n=nomeDaForma(p.extra.fig),opts=p.extra.opts;
    if(opts[p.a-1]!==n)falha(14,"nome errado para "+JSON.stringify(p.extra.fig));
    if(n==="quadrado"&&opts.includes("retângulo"))falha(14,"retângulo como opção para um quadrado");
    if(new Set(opts).size!==opts.length||opts.length<3||opts.length>4||opts.some(o=>!NN.includes(o)))falha(14,"opções: "+opts)}
  else{const m=p.pre.match(/^Qual destas figuras é um (\S+)\?$/);if(!m){falha(14,"pergunta desconhecida: "+p.pre);continue}t2++;
    const opts=p.extra.opts,nomes=opts.map(o=>nomeDaForma(o.fig));
    if(nomes[p.a-1]!==m[1])falha(14,"figura certa não é um "+m[1]);
    if(nomes.filter(n=>n===m[1]).length!==1)falha(14,"duas figuras do mesmo nome");
    if(m[1]==="retângulo"&&nomes.includes("quadrado"))falha(14,"quadrado entre as opções de 'qual é um retângulo?'");
    if(new Set(nomes).size!==nomes.length||nomes.length<3||nomes.length>4)falha(14,"opções: "+nomes);
    if(new Set(opts.map(o=>o.fig.color)).size!==1)falha(14,"as figuras deviam ter a mesma cor")}}
 console.log("nível 14: nome da figura",(100*t1/N).toFixed(0)+"%, qual é?",(100*t2/N).toFixed(0)+"%");}
{ // nível 15
 const its=draw(G.g1n15);const proib=["🎲","🧊","🍦","🛢️","🔺"];const por={t1:0,t2:0,t3:0,t4:0};
 const SOLOB={"⚽":"esfera","🏀":"esfera","🌍":"esfera","🥫":"cilindro","📦":"bloco retangular","🧱":"bloco retangular"};
 const OBJK={lata:"cilindro",tubo:"cilindro",vela:"cilindro",caixa:"bloco retangular"};
 const solidoDe=o=>typeof o==="string"?SOLOB[o]:(o.fig.t==="hat"?"cone":OBJK[o.fig.k]);
 const SOLT={"uma bola de futebol":"esfera","uma bola de basquete":"esfera","o globo terrestre":"esfera","uma lata de leite":"cilindro","uma vela":"cilindro","um tubo de cola":"cilindro","uma caixa de sapato":"bloco retangular","um tijolo":"bloco retangular","um chapéu de festa":"cone","uma casquinha de sorvete":"cone"};
 const FACE={"A tampa de uma lata":"círculo","A tampa de um tubo":"círculo","A face de uma caixa de sapato":"retângulo","A face maior de um tijolo":"retângulo"};
 for(const p of its){let m;const o=p.extra.opts;
  if((m=p.pre.match(/^Qual objeto tem a forma de (?:uma?) (.+)\?$/))){por.t1++;
    const sol=o.map(solidoDe);if(sol.some(x=>!x))falha(15,"objeto desconhecido nas opções: "+JSON.stringify(o));
    if(sol[p.a-1]!==m[1])falha(15,"objeto certo não é "+m[1]);if(new Set(sol).size!==o.length)falha(15,"dois objetos do mesmo sólido");
    if(o.some(x=>typeof x==="string"&&proib.includes(x)))falha(15,"objeto proibido")}
  else if(p.pre==="Como se chama este sólido?"){por.t2++;
    if(o[p.a-1]!==p.extra.fig.n)falha(15,"nome do sólido errado");if(o.some(x=>x==="cubo"||x==="pirâmide"))falha(15,"cubo ou pirâmide no 1º ano");if(new Set(o).size!==4)falha(15,"opções")}
  else if((m=p.pre.match(/^(.+) tem a forma de qual sólido\?$/))){por.t3++;
    const tx=m[1].charAt(0).toLowerCase()+m[1].slice(1);if(SOLT[tx]===undefined)falha(15,"objeto por escrito desconhecido: "+tx);
    if(o[p.a-1]!==SOLT[tx])falha(15,"sólido errado para "+tx)}
  else if((m=p.pre.match(/^(.+) tem a forma de qual figura\?$/))){por.t4++;
    if(FACE[m[1]]===undefined)falha(15,"face desconhecida: "+m[1]);if(o[p.a-1]!==FACE[m[1]])falha(15,"figura errada para "+m[1]);
    if(FACE[m[1]]==="retângulo"&&o.includes("quadrado"))falha(15,"quadrado como opção para um retângulo")}
  else falha(15,"pergunta desconhecida: "+p.pre)}
 console.log("nível 15: tipos",JSON.stringify(Object.fromEntries(Object.entries(por).map(([k,v])=>[k,(100*v/N).toFixed(0)+"%"]))));}
{ // nível 16
 const its=draw(G.g1n16),PERM=["🍎","⚽","⭐","🌼","🎈","🍪","🐶","🐱"],tipos={h:0,v:0,caixa:0};
 const TX={esq:"à esquerda",dir:"à direita",meio:"no meio",cima:"em cima"};
 for(const p of its){const i=p._info,f=p.extra.fig,o=p.extra.opts;tipos[i.tipo]++;
  if(i.tipo==="caixa"){if(o[p.a-1]!==TX[f.pos])falha(16,"posição da caixa errada");if(new Set(o).size!==4)falha(16,"opções")}
  else{
   if(f.items.some(e=>!PERM.includes(e)))falha(16,"emoji fora da lista frontal: "+f.items);
   if(new Set(f.items).size!==f.items.length)falha(16,"emoji repetido na fila");
   const pos=f.items.indexOf(i.ref);if(pos<1||pos>f.items.length-2)falha(16,"referência na ponta da fila");
   let viz;if(i.tipo==="h")viz=f.items[i.dir==="direita"?pos+1:pos-1];else{if(f.items.length!==3||pos!==1)falha(16,"coluna precisa ter 3 e a referência no meio");viz=f.items[i.dir==="cima"?pos-1:pos+1]}
   if(o[p.a-1]!==viz)falha(16,"vizinho errado: "+p.pre+" "+f.items+" => "+o[p.a-1]+" (esperado "+viz+")");
   if(new Set(o).size!==o.length||o.length<3)falha(16,"opções");
   if(!/(direita|esquerda|em cima|embaixo)/.test(p.pre))falha(16,"pergunta sem direção")}}
 console.log("nível 16: tipos",JSON.stringify(Object.fromEntries(Object.entries(tipos).map(([k,v])=>[k,(100*v/N).toFixed(0)+"%"]))));}
{ // nível 17
 const its=draw(G.g1n17),tp={nc:0,tam:0,pad:0};
 for(const p of its){const o=p.extra.opts;
  if(p.pre==="Qual figura não combina com as outras?"){tp.nc++;
   const fs=o.map(x=>x.fig),at=f=>[f.n,f.color,f.s];if(fs.length!==4)falha(17,"4 figuras");
   let variam=0,onde=null;for(let k=0;k<3;k++){const vals=fs.map(f=>JSON.stringify(at(f)[k]));if(new Set(vals).size>1){variam++;onde=k}}
   if(variam!==1)falha(17,"mais de um atributo varia: "+JSON.stringify(fs.map(at)));
   const vals=fs.map(f=>JSON.stringify(at(f)[onde])),cont={};vals.forEach(v=>cont[v]=(cont[v]||0)+1);
   const unico=vals.findIndex(v=>cont[v]===1);if(!Object.values(cont).includes(3)||unico!==p.a-1)falha(17,"a figura que não combina não é a resposta")}
  else if(/^Qual é a figura mais (grande|pequena)\?$/.test(p.pre)){tp.tam++;const fs=o.map(x=>x.fig),ss=fs.map(f=>f.s).sort((a,b)=>a-b),grande=/grande/.test(p.pre);
   if(fs.some(f=>f.n!==fs[0].n||f.color!==fs[0].color))falha(17,"só o tamanho pode variar");
   if(ss[1]/ss[0]<1.4||ss[2]/ss[1]<1.4)falha(17,"tamanhos próximos demais: "+ss);
   if(fs[p.a-1].s!==(grande?ss[2]:ss[0]))falha(17,"maior ou menor errado")}
  else if(p.pre==="Qual figura vem depois?"){tp.pad++;const seq=p.extra.fig.items.map(x=>x.fig.n+"|"+x.fig.color),L=seq.length,ok=per=>seq.every((v,i)=>i<per||v===seq[i-per]);
   let per=[2,3].filter(ok);if(per.length!==1)falha(17,"o período da fila não é único: "+seq);
   const pp=per[0],prox=seq[L-pp],ops=o.map(x=>x.fig.n+"|"+x.fig.color);
   if(L<2*pp+1)falha(17,"fila curta demais para o padrão");
   if(ops[p.a-1]!==prox)falha(17,"próxima figura errada: esperado "+prox+" veio "+ops[p.a-1]);
   if(new Set(ops).size!==3)falha(17,"opções repetidas");if(!p.extra.fig.q)falha(17,"sem a casa do ponto de interrogação")}
  else falha(17,"pergunta desconhecida: "+p.pre)}
 console.log("nível 17: tipos",JSON.stringify(Object.fromEntries(Object.entries(tp).map(([k,v])=>[k,(100*v/N).toFixed(0)+"%"]))));}
{ // nível 18
 const its=draw(G.g1n18);const d=new Set();
 for(const p of its){const c=conta(p);if(!c){falha(18,"formato");continue}d.add(p.pre);
  if(c.op==="+"){if(!((c.a===10&&c.b>=1&&c.b<=9)||(c.b===10&&c.a>=1&&c.a<=9)))falha(18,"soma: "+p.pre);if(p.a!==c.a+c.b)falha(18,"soma errada")}
  else{const n=c.a-10;if(!(n>=1&&n<=9&&(c.b===n||c.b===10)))falha(18,"subtração: "+p.pre);if(p.a!==c.a-c.b||p.a<1)falha(18,"subtração errada")}}
 console.log("nível 18: contas diferentes",d.size);if(d.size!==36)falha(18,"esperadas 36 contas, vieram "+d.size);}

/* ---- Níveis 19 a 23 ---- */
const un=n=>n%10;
function fam(c){ // a que família da ficha a conta pertence, só pelos números
  if(c.op==="+"){const maiorPar=Math.max(c.a,c.b),menor=Math.min(c.a,c.b);
    if(c.a+c.b===20&&maiorPar>=11&&menor>=1)return "somaVinte";
    if(maiorPar>=11&&un(maiorPar)+menor<=9&&maiorPar!==10)return "somaSem";
    if(c.a>=2&&c.a<=9&&c.b>=2&&c.b<=9&&c.a+c.b>=11)return "somaPassa";return "?"}
  if(c.a===20&&c.b>=1&&c.b<=9)return "subVinte";
  if(c.a>=12&&c.a<=19&&c.b>=1&&c.b<un(c.a))return "subSem";
  if(c.a>=11&&c.a<=18&&c.b>=2&&c.b<=9&&c.b>un(c.a))return "subPassa";return "?"}
for(const [nivel,permitidas,total] of [[19,["somaSem"],72],[20,["somaPassa","somaVinte"],54],[21,["subSem"],36],[22,["subPassa","subVinte"],45],[23,["somaSem","somaPassa","somaVinte","subSem","subPassa","subVinte"],207]]){
 const g=G["g1n"+nivel],its=draw(g),d=new Set();let vinte=0;
 for(const p of its){const c=conta(p);if(!c){falha(nivel,"formato: "+p.pre);continue}d.add(p.pre);
  const f=fam(c);if(!permitidas.includes(f))falha(nivel,"conta fora da família: "+p.pre+" ("+f+")");
  const esperado=c.op==="+"?c.a+c.b:c.a-c.b;if(p.a!==esperado||p.a<1||p.a>20)falha(nivel,"resposta: "+p.pre+" "+p.a);
  if(f==="somaSem"&&(p.a<12||p.a>19))falha(nivel,"soma sem passar fora de 12 a 19");
  if(f==="subSem"&&(p.a<11||p.a>18))falha(nivel,"subtração sem passar fora de 11 a 18");
  if(f==="subPassa"&&(p.a<2||p.a>9))falha(nivel,"subtração que passa fora de 2 a 9");
  if(f==="subVinte"&&(p.a<11||p.a>19))falha(nivel,"tirar de 20 fora de 11 a 19");
  if(f.endsWith("Vinte"))vinte++;
  if(p.extra)falha(nivel,"sem figura")}
 console.log("nível "+nivel+": contas diferentes",d.size,"; 'vinte'",(100*vinte/N).toFixed(0)+"%");
 if(d.size!==total)falha(nivel,"esperadas "+total+" contas, vieram "+d.size);
 if(nivel===19||nivel===21){/* nenhuma repete as do nível 18 (10 + n, n + 10, 10+n−n, 10+n−10) */}
}
{ // sem as contas do nível 18 nos níveis 19 e 21
 for(const nivel of [19,21]){const its=draw(G["g1n"+nivel]);for(const p of its){const c=conta(p);
  if(c.op==="+"&&(c.a===10||c.b===10))falha(nivel,"conta do nível 18: "+p.pre);
  if(c.op==="-"&&(c.a-c.b===10||c.b===10))falha(nivel,"conta do nível 18: "+p.pre)}}}
{ // nível 23 numa folha real: 2 contas de revisão e 8 do nível: 2 de cada família, no máximo 1 "vinte"
 const g=G.g1n23;FC.LEVELS=[{gen:()=>({pre:"R"+Math.floor(Math.random()*1e5),post:"",a:1})},{gen:g.gen}];let ruim=0,vinteRuim=0,troc=0;
 for(let i=0;i<1500;i++){const it=FC.makeItems(1).filter(p=>!p._rev),cont={1:0,2:0,3:0,4:0};let v=0;
  for(const p of it){cont[p._info.fam]++;if(p._info.vinte)v++}
  if(!(cont[1]===2&&cont[2]===2&&cont[3]===2&&cont[4]===2))ruim++;if(v>1)vinteRuim++;
  const ks=it.filter(p=>p._info.op==="+").map(p=>Math.min(p._info.a,p._info.b)+","+Math.max(p._info.a,p._info.b));if(new Set(ks).size<ks.length)troc++}
 console.log("nível 23: folhas sem 2 de cada família",ruim,"; com mais de 1 'vinte'",vinteRuim,"; com parcelas trocadas",troc);
 if(troc)falha(23,troc+" folhas com parcelas trocadas");
 if(ruim)falha(23,ruim+" folhas sem 2 de cada família");if(vinteRuim)falha(23,vinteRuim+" folhas com mais de 1 'vinte'")}

/* ---- Níveis 25 a 29 ---- */
{ // nível 25
 const its=draw(G.g1n25);const tp={t1:0,t2:0,t3:0};let zeros=0,t1z=0;
 for(const p of its){const f=p.extra.fig;if(f.t!=="base10"){falha(25,"figura");continue}
  if(!tem(f.tens,1,9)||!tem(f.ones,0,9))falha(25,"barras ou quadradinhos fora de 1 a 9 / 0 a 9");
  const h=FC.fig(f),rects=(h.match(/<rect/g)||[]).length;if(rects!==f.tens+f.ones)falha(25,"html com "+rects+" formas, esperadas "+(f.tens+f.ones));
  let m;
  if(/^Cada barra vale 10 e cada quadradinho vale 1\. Quanto vale tudo junto\?$/.test(p.pre)){tp.t1++;
    if(p.a!==f.tens*10+f.ones)falha(25,"valor da figura errado");if(p.a<11||p.a>99)falha(25,"fora de 11 a 99: "+p.a);if(f.ones===0){t1z++;if(f.tens<2)falha(25,"10 não entra")}}
  else if((m=p.pre.match(/^O número (\d+) é formado por quantas barras de 10\?$/))){tp.t2++;
    if(+m[1]!==f.tens*10+f.ones||p.a!==f.tens||f.ones<1)falha(25,"dezenas: "+p.pre)}
  else if((m=p.pre.match(/^O número (\d+) tem quantos quadradinhos soltos\?$/))){tp.t3++;
    if(+m[1]!==f.tens*10+f.ones||p.a!==f.ones||f.ones<1)falha(25,"unidades: "+p.pre)}
  else falha(25,"pergunta desconhecida: "+p.pre)}
 console.log("nível 25: tipos",(100*tp.t1/N).toFixed(0)+"/"+(100*tp.t2/N).toFixed(0)+"/"+(100*tp.t3/N).toFixed(0)+"%; valor redondo no tipo 1:",(100*t1z/tp.t1).toFixed(0)+"%");
 if(Math.abs(tp.t1/N-.625)>.04||Math.abs(tp.t2/N-.25)>.04)falha(25,"proporção dos tipos");if(t1z/tp.t1>.2)falha(25,"muitos números redondos");}
{ // nível 26
 const its=draw(G.g1n26);let soPacotes=0,ate=new Set();
 for(const p of its){const f=p.extra.fig,n=f.packs*10+f.loose;
  if(p.a!==n||!tem(n,21,100))falha(26,"total: "+n+" resposta "+p.a);if(!tem(f.loose,0,9)||!tem(f.packs,2,10))falha(26,"pacotes ou soltos fora da faixa");
  const h=FC.fig(f),emo=(h.match(new RegExp(f.e,"g"))||[]).length;if(emo!==n)falha(26,"html com "+emo+" objetos, esperados "+n);
  if((h.match(/class="pk box"/g)||[]).length!==f.packs)falha(26,"pacotes sem moldura");
  if(f.loose===0)soPacotes++;ate.add(n);
  const o=OBJ.find(x=>x.e===f.e);if(!p.pre.startsWith(o.f?"Quantas ":"Quantos "))falha(26,"concordância")}
 console.log("nível 26: só pacotes",(100*soPacotes/N).toFixed(0)+"%; totais distintos",ate.size);
 if(Math.abs(soPacotes/N-.2)>.04)falha(26,"proporção de só pacotes");if(ate.size!==80)falha(26,"esperados 80 totais, vieram "+ate.size);}
{ // nível 27
 const its=draw(G.g1n27);const modos={sep:0,mesma:0,troca:0},pos=[0,0,0,0];
 const troca=v=>v.some(a=>v.some(b=>a!==b&&Math.floor(a/10)===b%10&&a%10===Math.floor(b/10)));
 for(const p of its){const v=p.extra.opts.map(Number),maior=/maior/.test(p.pre);
  if(v.length!==3||new Set(v).size!==3||v.some(x=>!tem(x,10,99)))falha(27,"opções: "+v);
  if(v[p.a-1]!==(maior?Math.max(...v):Math.min(...v)))falha(27,"resposta errada");pos[p.a]++;
  const d=v.map(x=>Math.floor(x/10)),dist=new Set(d).size;
  if(troca(v))modos.troca++;else if(dist<3)modos.mesma++;else{modos.sep++;const s=[...d].sort((a,b)=>a-b);if(s[1]-s[0]<2||s[2]-s[1]<2)falha(27,"dezenas pouco separadas: "+v)}}
 console.log("nível 27: dezenas separadas",(100*modos.sep/N).toFixed(0)+"%, mesma dezena",(100*modos.mesma/N).toFixed(0)+"%, algarismos trocados",(100*modos.troca/N).toFixed(0)+"%");
 if(Math.abs(modos.sep/N-.5)>.06||Math.abs(modos.mesma/N-.4)>.06||modos.troca/N<.05||modos.troca/N>.18)falha(27,"proporção dos modos");
 for(let k=1;k<=3;k++)if(Math.abs(pos[k]/N-1/3)>.04)falha(27,"posição da certa");}
{ // nível 28
 const its=draw(G.g1n28),d=new Set(),fam={};
 for(const p of its){let m,f=null;d.add(p.pre);
  if((m=p.pre.match(/^(\d+) \+ (\d+) =$/))){const a=+m[1],b=+m[2];
    if(a%10===0&&b%10===0&&b>0){f="f1";if(a+b>100||a<10||b<10)falha(28,"dezena + dezena: "+p.pre)}
    else if(a%10===0&&b>=1&&b<=9){f="f5";if(a<10)falha(28,"dezena + unidade: "+p.pre)}
    else if(a%10>=1&&b>=1&&b<=9){f="f3";if(a%10+b>9)falha(28,"soma passa da dezena: "+p.pre)}
    else falha(28,"formato: "+p.pre);
    if(p.a!==a+b)falha(28,"soma errada: "+p.pre)}
  else if((m=p.pre.match(/^(\d+) − (\d+) =$/))){const a=+m[1],b=+m[2];
    if(a%10===0&&b%10===0&&b>0){f="f2";if(a-b<10)falha(28,"dezena − dezena: "+p.pre)}
    else if(b>=1&&b<=9&&a%10>=2&&b<a%10){f="f4"}
    else if(b===a%10&&b>=1&&a>10){f="f6a"}
    else if(b%10===0&&b===a-a%10&&a%10>=1){f="f6b"}
    else falha(28,"formato: "+p.pre);
    if(p.a!==a-b||p.a<1)falha(28,"subtração errada: "+p.pre)}
  else falha(28,"formato desconhecido: "+p.pre);
  fam[f]=(fam[f]||0)+1;if(p.extra)falha(28,"sem figura")}
 console.log("nível 28: contas diferentes",d.size,"; famílias",JSON.stringify(Object.fromEntries(Object.entries(fam).map(([k,v])=>[k,(100*v/N).toFixed(0)+"%"]))));
 {const g2=new Set();for(let i=0;i<80000;i++)g2.add(G.g1n28.gen().pre);console.log("nível 28: contas diferentes em 80000 sorteios",g2.size);if(g2.size!==981)falha(28,"esperadas 981 contas, vieram "+g2.size)}
 if(Math.abs(fam.f3/N-.25)>.04||Math.abs(fam.f4/N-.25)>.04||Math.abs((fam.f1||0)/N-.125)>.04)falha(28,"proporção das famílias");}
{ // nível 29
 const its=draw(G.g1n29),tp={a:0,b:0,c:0,d:0};
 for(const p of its){let m;
  if((m=p.pre.match(/^(\d+) = (\d+) \+$/))&&p.post===""){tp.a++;if(+m[1]!==+m[2]+p.a||+m[2]%10!==0)falha(29,"completar a unidade: "+p.pre)}
  else if((m=p.pre.match(/^(\d+) =$/))&&(m=[m[1],p.post.match(/^\+ (\d+)$/)])&&m[1]){tp.b++;const n=+m[0],u=+m[1][1];if(n!==p.a+u||p.a%10!==0)falha(29,"completar a dezena: "+p.pre+" "+p.post)}
  else if((m=p.pre.match(/^Qual número tem (\d) dezenas e (\d) unidades\?$/))){tp.c++;if(p.a!==+m[1]*10+ +m[2])falha(29,"dezenas e unidades: "+p.pre)}
  else if((m=p.pre.match(/^O número (\d+) tem quantas (dezenas|unidades)\?$/))){tp.d++;const n=+m[1];if(p.a!==(m[2]==="dezenas"?Math.floor(n/10):n%10))falha(29,"quantas: "+p.pre)}
  else falha(29,"pergunta desconhecida: "+p.pre+" | "+p.post);
  if(p.a<1)falha(29,"resposta zero");}
 console.log("nível 29: tipos",JSON.stringify(Object.fromEntries(Object.entries(tp).map(([k,v])=>[k,(100*v/N).toFixed(0)+"%"]))));
 for(const k in tp)if(Math.abs(tp[k]/N-.25)>.04)falha(29,"proporção do tipo "+k);}

/* ---- Níveis 30 a 35 ---- */
const DIAS=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
const MESES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const dist3=(its,fn,alvo,nome,nivel,tol=.05)=>{const c={};its.forEach(p=>{const k=fn(p);c[k]=(c[k]||0)+1});
  console.log("nível "+nivel+": "+nome,JSON.stringify(Object.fromEntries(Object.entries(c).map(([k,v])=>[k,(100*v/N).toFixed(0)+"%"]))));
  for(const [k,v] of Object.entries(alvo))if(Math.abs((c[k]||0)/N-v)>tol)falha(nivel,"proporção de "+k+": "+((c[k]||0)/N).toFixed(2)+" (esperado "+v+")")};
{ // nível 30
 const its=draw(G.g1n30);
 const razaoOk=sz=>{const o=[...sz].sort((a,b)=>a-b);return o[1]/o[0]>=1.249&&o[2]/o[1]>=1.249};
 for(const p of its){const f=p.extra.fig,o=p.extra.opts;let m;
  if(f.t==="barras"){
   m=p.pre.match(/^Qual é a barra mais (comprida|curta|alta|baixa|larga|estreita)\?$/);if(!m){falha(30,"pergunta: "+p.pre);continue}
   const par={h:["comprida","curta"],v:["alta","baixa"],w:["larga","estreita"]}[f.orient];if(!par.includes(m[1]))falha(30,"palavra "+m[1]+" não combina com a orientação "+f.orient);
   if(!razaoOk(f.sizes))falha(30,"tamanhos próximos: "+f.sizes);
   const alvo=m[1]===par[0]?Math.max(...f.sizes):Math.min(...f.sizes);
   if(o[p.a-1]!=="ABC"[f.sizes.indexOf(alvo)])falha(30,"letra errada");if(o.join("")!=="ABC".split("").filter((x,i)=>true).sort().join("")&&new Set(o).size!==3)falha(30,"opções");
   if(f.orient==="h"&&Math.max(...f.sizes)*250>262)falha(30,"barra passa da caixa");if(f.sizes.some(x=>x<=0||x>1))falha(30,"tamanho fora de 0 a 1")}
  else if(f.t==="potes"){
   m=p.pre.match(/^Em qual pote (cabe mais|cabe menos)\?$/);if(!m){falha(30,"pergunta: "+p.pre);continue}
   if(!razaoOk(f.sizes))falha(30,"potes parecidos: "+f.sizes);
   const alvo=m[1]==="cabe mais"?Math.max(...f.sizes):Math.min(...f.sizes);if(o[p.a-1]!=="ABC"[f.sizes.indexOf(alvo)])falha(30,"pote errado")}
  else if(f.t==="balanca"){
   m=p.pre.match(/^Qual é o mais (pesado|leve)\?$/);if(!m){falha(30,"pergunta: "+p.pre);continue}
   if(Math.abs(f.a)!==12||f.l===f.r)falha(30,"balança: "+JSON.stringify(f));
   const baixo=f.a>0?f.r:f.l,alto=f.a>0?f.l:f.r;if(o[p.a-1]!==(m[1]==="pesado"?baixo:alto))falha(30,"a resposta não vem da inclinação");
   if(new Set(o).size!==2||!o.includes(f.l)||!o.includes(f.r))falha(30,"opções da balança");
   const h=FC.fig(f);if(!h.includes(f.l)||!h.includes(f.r))falha(30,"objetos fora do desenho")}
  else falha(30,"figura desconhecida")}
 dist3(its,p=>p.extra.fig.t,{barras:.375,potes:.375,balanca:.25},"tipos",30);}
{ // nível 31
 const its=draw(G.g1n31),EV={"tomar o café da manhã":"de manhã","acordar para ir à escola":"de manhã","tomar o lanche da tarde":"de tarde","brincar depois do almoço":"de tarde","jantar":"de noite","ver as estrelas no céu":"de noite","escovar os dentes antes de dormir":"de noite"};
 for(const p of its){let m;const o=p.extra&&p.extra.opts;
  if((m=p.pre.match(/^(.+) é de manhã, de tarde ou de noite\?$/))){const ev=m[1].charAt(0).toLowerCase()+m[1].slice(1);
    if(EV[ev]===undefined)falha(31,"acontecimento desconhecido: "+ev);else if(o[p.a-1]!==EV[ev])falha(31,"período errado para "+ev);if(new Set(o).size!==3)falha(31,"opções")}
  else if((m=p.pre.match(/^Que dia vem (depois|antes) (do|da) (.+)\?$/))){const i=DIAS.indexOf(m[3]);
    if(i<0)falha(31,"dia desconhecido: "+m[3]);else{if(m[2]!==((i===0||i===6)?"do":"da"))falha(31,"artigo: "+p.pre);
      const cert=DIAS[(i+(m[1]==="depois"?1:6))%7];if(o[p.a-1]!==cert)falha(31,"dia errado: "+p.pre);
      if(new Set(o).size!==4||o.some(x=>!DIAS.includes(x)))falha(31,"opções de dias")}}
  else if((m=p.pre.match(/^Que mês vem (depois|antes) de (.+)\?$/))){const j=MESES.indexOf(m[2]);
    if(j<0)falha(31,"mês desconhecido");else{const cert=MESES[(j+(m[1]==="depois"?1:11))%12];if(o[p.a-1]!==cert)falha(31,"mês errado: "+p.pre);
      if(new Set(o).size!==4||o.some(x=>!MESES.includes(x)))falha(31,"opções de meses")}}
  else if(p.pre==="Quantos dias tem a semana?"){if(p.a!==7)falha(31,"semana")}
  else if(p.pre==="O ano tem quantos meses?"){if(p.a!==12)falha(31,"ano")}
  else falha(31,"pergunta desconhecida: "+p.pre)}
 dist3(its,p=>/manhã/.test(p.pre)?"periodo":/Que dia|dias tem/.test(p.pre)?"dias":"meses",{periodo:.375,dias:.375,meses:.25},"tipos",31);}
{ // nível 32
 const its=draw(G.g1n32);
 for(const p of its){const f=p.extra&&p.extra.fig;let m;
  if(f){if(f.t!=="calendario"){falha(32,"figura");continue}
   const ult0=new Date(f.y,f.m+1,0).getDate(),h=FC.fig(f),dias=(h.match(/<span>\d+<\/span>/g)||[]).length,vazios=(h.match(/<span><\/span>/g)||[]).length;
   if(dias!==ult0)falha(32,"calendário com "+dias+" dias, esperados "+ult0);if(vazios!==new Date(f.y,f.m,1).getDay())falha(32,"espaços antes do dia 1: "+vazios);
   if(f.y<2026||f.y>2028)falha(32,"ano fora de 2026 a 2028")}
  const ult=f?new Date(f.y,f.m+1,0).getDate():31;
  if((m=p.pre.match(/^Neste calendário, o dia (\d+) cai em que dia da semana\?$/))){const d=+m[1];if(d<1||d>ult)falha(32,"dia fora do mês");
    if(p.extra.opts[p.a-1]!==DIAS[new Date(f.y,f.m,d).getDay()])falha(32,"dia da semana errado");if(new Set(p.extra.opts).size!==4)falha(32,"opções")}
  else if((m=p.pre.match(/^Qual é o dia do mês d(o primeiro|a primeira) (.+)\?$/))){const wd=DIAS.indexOf(m[2]);
    if(wd<0)falha(32,"dia desconhecido");let a=1;while(new Date(f.y,f.m,a).getDay()!==wd)a++;if(p.a!==a||a>7)falha(32,"primeiro dia errado: "+p.pre);
    if(m[1]!==((wd===0||wd===6)?"o primeiro":"a primeira"))falha(32,"concordância: "+p.pre)}
  else if((m=p.pre.match(/^(Quantos|Quantas) (.+) tem este mês\?$/))){
    let wd=DIAS.findIndex(d=>m[2]===(d==="domingo"||d==="sábado"?d+"s":d.replace("-feira","")+"s-feiras"));if(wd<0){falha(32,"plural desconhecido: "+m[2]);continue}
    if(m[1]!==((wd===0||wd===6)?"Quantos":"Quantas"))falha(32,"Quantos/Quantas: "+p.pre);
    let q=0;for(let k=1;k<=ult;k++)if(new Date(f.y,f.m,k).getDay()===wd)q++;if(p.a!==q||(q!==4&&q!==5))falha(32,"contagem: "+p.pre+" => "+p.a+" (esperado "+q+")")}
  else if((m=p.pre.match(/^Como se escreve (\d+) de (\S+) de (\d+) em números\?$/))){const d=+m[1],mm=MESES.indexOf(m[2])+1,y=+m[3];
    if(mm<1||y<2026||y>2028||d<1||d>new Date(y,mm,0).getDate())falha(32,"data inválida");
    const certa=String(d).padStart(2,"0")+"/"+String(mm).padStart(2,"0")+"/"+y,o=p.extra.opts;
    if(o[p.a-1]!==certa)falha(32,"data certa errada");if(new Set(o).size!==4)falha(32,"opções repetidas: "+o);
    const trocada=String(mm).padStart(2,"0")+"/"+String(d).padStart(2,"0")+"/"+y;if(o.filter(x=>x!==certa).includes(trocada)&&!(d<=12&&d!==mm))falha(32,"dia e mês trocados em data ambígua")}
  else falha(32,"pergunta desconhecida: "+p.pre)}
 dist3(its,p=>/Neste calendário/.test(p.pre)?"semana":/Como se escreve/.test(p.pre)?"data":"contar",{semana:.375,data:.375,contar:.25},"tipos",32);}
{ // nível 33
 const its=draw(G.g1n33),CED=["2 reais","5 reais","10 reais","20 reais"],MOE=["5 centavos","10 centavos","25 centavos","50 centavos","1 real"];
 const valor=it=>it.k==="cedula"?it.v*100:it.v,txtOk=(it,h)=>it.k==="cedula"?h.includes(">"+it.v+"<")&&h.includes("reais"):(it.v===100?h.includes(">1<")&&h.includes("real"):h.includes(">"+it.v+"<")&&h.includes("centavos"));
 for(const p of its){const f=p.extra&&p.extra.fig;if(f?f.t!=="dinheiro":!(p.extra&&p.extra.opts&&p.extra.opts[0].fig)){falha(33,"figura");continue}
  if(p.pre==="Quanto vale esta cédula?"){const v=f.items[0].v,o=p.extra.opts;if(f.items.length!==1||f.items[0].k!=="cedula"||!txtOk(f.items[0],FC.fig(f)))falha(33,"cédula");
    if(o[p.a-1]!==v+" reais"||new Set(o).size!==4||o.some(x=>!CED.includes(x)))falha(33,"opções de cédula")}
  else if(p.pre==="Quanto vale esta moeda?"){const it=f.items[0],o=p.extra.opts;if(it.k!=="moeda"||!txtOk(it,FC.fig(f)))falha(33,"moeda");
    if(o[p.a-1]!==(it.v===100?"1 real":it.v+" centavos")||new Set(o).size!==o.length||o.some(x=>!MOE.includes(x)))falha(33,"opções de moeda")}
  else if(p.pre==="Quantos reais?"){const tot=f.items.reduce((a,x)=>a+(x.k==="cedula"?x.v:(x.v===100?1:NaN)),0);
    if(!(f.items.length>=2&&f.items.length<=3)||p.a!==tot||tot>20||!Number.isInteger(tot))falha(33,"soma em reais: "+JSON.stringify(f.items)+" => "+p.a)}
  else if(p.pre==="Qual vale mais?"){const o=p.extra.opts.map(x=>x.fig.items[0]);if(o.length!==2||valor(o[0])===valor(o[1]))falha(33,"valores iguais");
    if(valor(o[p.a-1])!==Math.max(valor(o[0]),valor(o[1])))falha(33,"o maior não é a resposta");o.forEach(x=>{if(!txtOk(x,FC.fig({t:"dinheiro",items:[x]})))falha(33,"valor desenhado")})}
  else falha(33,"pergunta desconhecida: "+p.pre)}
 dist3(its,p=>p.pre==="Quanto vale esta cédula?"?"cedula":p.pre==="Quanto vale esta moeda?"?"moeda":p.pre==="Quantos reais?"?"soma":"mais",{cedula:.375,moeda:.25,soma:.25,mais:.125},"tipos",33);}
{ // nível 34
 const its=draw(G.g1n34),BANCO={};for(const [k,v] of Object.entries({
  "Com certeza":8,"Impossível":8,"Talvez":8}))BANCO[k]=v;
 const lista=[];
 let frases=0,caixas=0;const c={};
 for(const p of its){const o=p.extra.opts;let m;
  if(!(o.length===3&&new Set(o).size===3&&o.every(x=>["Com certeza","Talvez","Impossível"].includes(x))))falha(34,"opções: "+o);
  const resp=o[p.a-1];c[resp]=(c[resp]||0)+1;
  if((m=p.pre.match(/^Vai tirar uma bola (vermelha|azul), sem olhar\. Isso é…$/))){caixas++;
    const cor=m[1]==="vermelha"?"r":"a",b=p.extra.fig.balls,n=b.filter(x=>x===cor).length;
    if(b.length<3||b.length>8)falha(34,"número de bolas");
    const esp=n===b.length?"Com certeza":n===0?"Impossível":"Talvez";if(resp!==esp)falha(34,"caixa: "+b+" "+m[1]+" => "+resp+" (esperado "+esp+")")}
  else if(/ Isso é…$/.test(p.pre)){frases++;const fr=p.pre.replace(/ Isso é…$/,"");
    const classes=["Com certeza","Impossível","Talvez"].filter(k=>FRASES34[k].includes(fr));
    if(classes.length!==1)falha(34,"frase fora do banco: "+fr);else if(resp!==classes[0])falha(34,"frase com resposta errada: "+fr)}
  else falha(34,"pergunta desconhecida: "+p.pre)}
 console.log("nível 34: frases",(100*frases/N).toFixed(0)+"%, caixas",(100*caixas/N).toFixed(0)+"%; respostas",JSON.stringify(Object.fromEntries(Object.entries(c).map(([k,v])=>[k,(100*v/N).toFixed(0)+"%"]))));
 for(const k of ["Com certeza","Talvez","Impossível"])if(Math.abs((c[k]||0)/N-1/3)>.04)falha(34,"as três respostas deviam ser parecidas: "+k)}
{ // nível 35
 const its=draw(G.g1n35),TEM={"Cores preferidas da turma":{l:["Azul","Verde","Rosa","Amarelo"],c:["#2457D6","#1CA97B","#F27AB0","#FFB92B"]},"Frutas preferidas da turma":{l:["Maçã","Uva","Banana","Pera"]},"Bichinhos preferidos da turma":{l:["Gato","Cão","Peixe","Pássaro"]},"Esportes preferidos da turma":{l:["Futebol","Vôlei","Natação","Judô"]}};
 for(const p of its){const f=p.extra.fig,tm=TEM[f.title];let m;
  if(!tm){falha(35,"tema desconhecido");continue}
  if(f.values.length!==4||f.values.some(x=>!tem(x,1,9))||JSON.stringify(f.labels)!==JSON.stringify(tm.l))falha(35,"valores ou nomes: "+JSON.stringify(f));
  if(tm.c&&f.t==="bars"&&JSON.stringify(f.colors)!==JSON.stringify(tm.c))falha(35,"cores das colunas não combinam com os nomes");
  if(f.t==="tabela"){const h=FC.fig(f);f.values.forEach((v,i)=>{if(!h.includes("<td>"+f.labels[i]+"</td><td>"+v+"</td>"))falha(35,"tabela sem a linha de "+f.labels[i])})}
  if((m=p.pre.match(/^Quantas crianças escolheram (\S+)\?$/))){const i=tm.l.indexOf(m[1]);if(i<0||p.a!==f.values[i])falha(35,"valor lido errado: "+p.pre)}
  else if((m=p.pre.match(/^Qual teve (mais|menos) votos\?$/))){const alvo=m[1]==="mais"?Math.max(...f.values):Math.min(...f.values);
    if(f.values.filter(x=>x===alvo).length!==1)falha(35,"empate no "+m[1]+": "+f.values);if(p.extra.opts[p.a-1]!==tm.l[f.values.indexOf(alvo)])falha(35,"nome errado");if(new Set(p.extra.opts).size!==4)falha(35,"opções")}
  else if((m=p.pre.match(/^Quantas crianças escolheram (\S+) ou (\S+)\?$/))){const a=tm.l.indexOf(m[1]),b=tm.l.indexOf(m[2]);if(a<0||b<0||a===b||p.a!==f.values[a]+f.values[b]||p.a>18)falha(35,"soma errada: "+p.pre)}
  else falha(35,"pergunta desconhecida: "+p.pre)}
 dist3(its,p=>p.extra.fig.t==="tabela"?"tabela":/ ou /.test(p.pre)?"soma":/Qual teve/.test(p.pre)?"extremo":"coluna",{tabela:.25,soma:.125,extremo:.25,coluna:.375},"tipos",35);}

/* ---- Limites de cada folha dos níveis 8 a 13 ---- */
for(const nivel of [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,31,32,33,34,35]){
  const g=G["g1n"+String(nivel).padStart(2,"0")];FC.LEVELS=[{gen:g.gen}];let viol=0;
  for(let i=0;i<1500;i++){const it=FC.makeItems(0);const v=limitesOk(nivel,it);if(v){viol++;if(viol<3)console.log("   limite estourado:",v)}}
  console.log("nível "+nivel+": folhas que estouram um limite do grupo",viol,"de 1500");
  if(viol)falha(nivel,viol+" folhas estouraram um limite");
}
{ // 5 somas e 5 subtrações por folha nos níveis 8, 9 e 12
 for(const nivel of [8,9,12,18]){const g=G["g1n"+String(nivel).padStart(2,"0")];FC.LEVELS=[{gen:g.gen}];let ruim=0;
  for(let i=0;i<1500;i++){const it=FC.makeItems(0),s=it.filter(p=>conta(p).op==="+").length;if(s!==5)ruim++}
  console.log("nível "+nivel+": folhas sem exatamente 5 somas e 5 subtrações",ruim);if(ruim)falha(nivel,ruim+" folhas sem 5 e 5")}
 // parcelas trocadas nunca na mesma folha (níveis 8, 9, 10, 12)
 for(const nivel of [8,9,10,12,18,19,20,21,22]){const g=G["g1n"+String(nivel).padStart(2,"0")];FC.LEVELS=[{gen:g.gen}];let ruim=0;
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
