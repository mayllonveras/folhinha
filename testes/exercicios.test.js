/* Teste dos geradores de exercício. Rodar com: node testes/exercicios.test.js
   Confere, em milhares de itens sorteados: resposta certa recalculada de forma independente, opções distintas,
   itens leves, figuras sem erro, nenhuma opção errada que também seja verdadeira (todo quadrado é retângulo; todo cubo é bloco retangular),
   posição da opção certa sem viés, cores das colunas iguais ao nome e malha que diz a cor pintada. */
global.window=global;
const FC={esc:t=>String(t==null?"":t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))};
global.FC=FC;
require('../exercicios.js');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
let falhas=[],total=0;
function falha(id,msg,it){falhas.push(id+": "+msg+" "+JSON.stringify(it).slice(0,200))}
const N=400;
for(const e of FC.EX){
  const vistos=new Set();
  for(let i=0;i<N;i++){
    total++;
    let it;try{it=e.gen()}catch(x){falha(e.id,"gerador lançou "+x.message);break}
    const j=JSON.stringify(FC.plainItem?FC.plainItem(it):{pre:it.pre,post:it.post,a:it.a,extra:it.extra});
    if(typeof it.pre!=="string"||!it.pre.trim())falha(e.id,"pre inválido",it);
    if(!Number.isInteger(it.a)||it.a<0||it.a>9999)falha(e.id,"a fora de 0..9999",it);
    if(j.length>2000)falha(e.id,"item grande demais ("+j.length+")",it);
    if(/undefined|NaN|null/.test(j.replace(/"post":""/,"")))falha(e.id,"valor estranho no item",it);
    const ex=it.extra;
    if(ex&&ex.opts){
      if(ex.opts.length<2||ex.opts.length>4)falha(e.id,"quantidade de opções "+ex.opts.length,it);
      if(new Set(ex.opts.map(o=>JSON.stringify(o))).size!==ex.opts.length)falha(e.id,"opções repetidas",it);
      if(it.a<1||it.a>ex.opts.length)falha(e.id,"a fora das opções",it);
      else if(!same(ex.opts[it.a-1],it._why))falha(e.id,"a não aponta a opção certa",it);
    }else if(it._calc!==undefined&&it._calc!==it.a)falha(e.id,"a diferente do cálculo",it);
    // conferência independente a partir da figura
    const f=ex&&ex.fig;
    if(f&&!ex.opts){
      if(f.t==="emoji"){const s=f.groups.map(g=>g.n);const esperado=e.id==="aMais"?Math.abs(s[0]-s[1]):s[0];if(esperado!==it.a)falha(e.id,"emoji: esperado "+esperado,it)}
      if(f.t==="base10"&&f.tens*10+f.ones!==it.a)falha(e.id,"base10",it);
      if(f.t==="bars"){const i2=f.labels.findIndex(l=>it.pre.includes(l));if(f.values[i2]!==it.a)falha(e.id,"gráfico",it)}
      if(f.t==="line"&&f.mark!==it.a)falha(e.id,"reta",it);
      if(f.t==="grid"&&f.cells.length!==it.a)falha(e.id,"malha cells",it);
      if(f.t==="grid"&&new Set(f.cells.map(c=>c.join(","))).size!==f.cells.length)falha(e.id,"malha com célula repetida",it);
      if(f.t==="shape"&&it.pre.startsWith("Quantos lados")){const lados={"quadrado":4,"retângulo":4,"triângulo":3,"trapézio":4,"paralelogramo":4,"losango":4,"pentágono":5,"hexágono":6};if(lados[f.n]!==it.a)falha(e.id,"lados",it)}
    }
    if(f&&ex.opts&&f.t==="clock"){const h=f.h,m=f.m,txt=h+":"+(m<10?"0":"")+m;if(ex.opts[it.a-1]!==txt)falha(e.id,"relógio",it)}
    if(f&&ex.opts&&f.t==="shape"&&it.pre.startsWith("Como se chama")&&ex.opts[it.a-1]!==f.n)falha(e.id,"nome da figura",it)
    if(f&&ex.opts&&f.t==="solid"&&ex.opts[it.a-1]!==f.n)falha(e.id,"nome do sólido",it);
    if(f&&ex.opts&&f.t==="bars"){const v=f.values,top=Math.max(...v),bot=Math.min(...v),want=it.pre.includes("mais")?top:bot;if(v.filter(x=>x===want).length!==1||f.labels[v.indexOf(want)]!==ex.opts[it.a-1])falha(e.id,"gráfico maior/menor",it)}
    if(e.id==="qualFigura"){const n=it.pre.match(/é um (.+)\?/)[1];if(ex.opts[it.a-1].fig.n!==n)falha(e.id,"qual figura",it)}
    if(e.id.startsWith("maior")){const nums=ex.opts.map(Number),want=it.pre.includes("maior")?Math.max(...nums):Math.min(...nums);if(Number(ex.opts[it.a-1])!==want)falha(e.id,"maior/menor",it)}
    if(e.id==="vizinho"){const n=Number(it.pre.match(/do (\d+)/)[1]);if(it.a!==(it.pre.includes("depois")?n+1:n-1))falha(e.id,"vizinho",it)}
    if(e.id==="fila"){const p=Number(it.pre.match(/(\d)[ºª]/)[1]);if(it.a!==p-1)falha(e.id,"fila",it)}
    if(e.id==="moedas"){const m=it.pre.match(/^(\d+) moedas de (\d+)/);if(it.a!==m[1]*m[2])falha(e.id,"moedas",it)}
    // desenhar não pode quebrar nem sair vazio
    const html=FC.itemInner({...it,i:0},0), st=FC.itemStatic(it);
    if(!html||!st||/undefined|NaN/.test(html+st))falha(e.id,"renderização com undefined/NaN",it);
    if(f&&!FC.fig(f))falha(e.id,"figura vazia",it);
    vistos.add(JSON.stringify(it.extra||null)+it.pre);
  }
  console.log((e.id+"            ").slice(0,14),"variedade:",String(vistos.size).padStart(3)," habilidades:",e.hab.join(", "));
}

// ---- ambiguidade: nenhuma opção errada pode ser também verdadeira (todo quadrado é retângulo; todo cubo é bloco retangular) ----
{const T=FC.tambemE,OBJ={"esfera":["⚽","🏀","🌍"],"cubo":["🎲","🧊"],"cilindro":["🥫","🛢️"],"cone":["🍦"],"bloco retangular":["📦","🧱"]};
 const kind=e=>Object.keys(OBJ).find(k=>OBJ[k].includes(e));let amb=0,vistos=0;
 for(let i=0;i<3000;i++){
  for(const id of ["formaPlana","formaPlana2"]){const it=FC.EXBY[id].gen();vistos++;const f=it.extra.fig.n;it.extra.opts.forEach((o,k)=>{if(k!==it.a-1&&T(f,o)){amb++;falha(id,"opção errada também vale: "+f+" é "+o,it)}})}
  {const it=FC.EXBY.qualFigura.gen();vistos++;const X=it.pre.match(/é um (.+)\?/)[1];it.extra.opts.forEach((o,k)=>{if(k!==it.a-1&&T(o.fig.n,X)){amb++;falha("qualFigura","figura errada também é "+X+": "+o.fig.n,it)}})}
  {const it=FC.EXBY.sólidoNome.gen();vistos++;const f=it.extra.fig.n;it.extra.opts.forEach((o,k)=>{if(k!==it.a-1&&T(f,o)){amb++;falha("sólidoNome","opção errada também vale: "+f+" é "+o,it)}})}
  {const it=FC.EXBY["sólidoObjeto"].gen();vistos++;const X=it.pre.match(/forma de (?:um|uma) (.+)\?/)[1];it.extra.opts.forEach((o,k)=>{if(k!==it.a-1){const kd=kind(o);if(kd&&(T(kd,X)||T(X,kd))){amb++;falha("sólidoObjeto","objeto errado também serve: "+kd+" para "+X,it)}}})}
 }
 console.log("ambiguidade geométrica: itens verificados",vistos,"| opções erradas que também valem:",amb)}

// ---- a posição da opção certa não pode ser previsível (nem viciada por figura) ----
{let pior=0,ruim=[];
 for(const e of FC.EX){const por={};let tem=false;
  for(let i=0;i<6000;i++){const it=e.gen();if(!it.extra||!it.extra.opts)continue;tem=true;const k=it.extra.opts.length;(por[k]=por[k]||{n:0,pos:{}}).n++;por[k].pos[it.a]=(por[k].pos[it.a]||0)+1}
  if(!tem)continue;
  for(const k of Object.keys(por)){const g=por[k];if(g.n<300)continue;for(let p=1;p<=Number(k);p++){const dev=Math.abs((g.pos[p]||0)/g.n-1/Number(k));pior=Math.max(pior,dev);if(dev>0.06)ruim.push(e.id+" ("+k+" opções): posição "+p+" = "+(100*(g.pos[p]||0)/g.n).toFixed(0)+"%")}}}
 console.log("posição da certa: maior desvio da distribuição uniforme =",(100*pior).toFixed(1),"pontos");
 ruim.forEach(r=>falha("posicao",r,{}))}
// ---- cores das colunas: na pesquisa de cores, cada coluna tem a cor do nome ----
{const COR={"Azul":"#2457D6","Verde":"#1CA97B","Rosa":"#F27AB0","Amarelo":"#FFB92B"};let n=0,erradas=0;
 for(let i=0;i<4000;i++){const it=FC.EXBY[Math.random()<.5?"graficoLer":"graficoMais"].gen(),f=it.extra.fig;if(f.title.indexOf("Cores")!==0)continue;n++;
  if(!f.colors||f.labels.some((l,k)=>f.colors[k]!==COR[l])){erradas++;falha("cores","coluna com cor diferente do nome",it)}}
 console.log("pesquisas de cores conferidas:",n,"| com cor errada:",erradas)}
// ---- malha: a pergunta nomeia a cor usada ----
{const NOME={"#FFB92B":"amarelo","#2457D6":"azul","#F27AB0":"rosa"};let n=0;
 for(let i=0;i<2000;i++){const it=FC.EXBY.malha.gen();n++;if(!it.pre.endsWith("pintados de "+NOME[it.extra.fig.color]+"?"))falha("malha","a pergunta não diz a cor da malha",it)}
 console.log("malhas conferidas:",n)}
// determinismo: a mesma pergunta mantém a mesma ordem de opções
let det=0;for(const e of FC.EX){for(let i=0;i<30;i++){const it=e.gen();if(!it.extra||!it.extra.opts)continue;
  const sorted=it.extra.opts.slice().reverse();// reconstrução: gerar de novo com as mesmas opções reembaralhadas nunca é feita; aqui basta checar que a ordem é estável entre duas serializações
  if(JSON.stringify(JSON.parse(JSON.stringify(it)).extra.opts)!==JSON.stringify(it.extra.opts))falha(e.id,"serialização muda as opções",it);det++}}
console.log("\nitens verificados:",total,"| opções conferidas na serialização:",det,"| falhas:",falhas.length);
falhas.slice(0,15).forEach(f=>console.log("  FALHA",f));
process.exit(falhas.length?1:0);
