/* Testes dos geradores da grade do 2º ano (níveis 1 a 7), conforme bncc/fichas/2ano-niveis-01-07.md. Rodar com: node testes/grade2.test.js
   A resposta é sempre recalculada a partir do que está no desenho ou no texto, nunca do campo que o gerador devolve. */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');require('../grade1.js');require('../grade2.js');
const FC=global.FC,G=FC.G2BY;
let falhas=0;const falha=(n,m)=>{falhas++;if(falhas<40)console.log("  FALHA",n,m)};
/* Uma folha real: nível 1 do array (levelIdx 1) tem 8 contas do nível e 2 de revisão do nível anterior. */
const niv=g=>{FC.LEVELS=[{gen:G.g2n08.gen},{gen:g.gen}];return FC.makeItems(1).filter(p=>!p._rev)};
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

/* ---- Níveis 8 a 14: contas de dois e de três algarismos ---- */
const parseConta=p=>{const m=p.pre.match(/^(\d+) ([+−]) (\d+) =$/);return m?{a:+m[1],op:m[2]==="+"?"+":"-",b:+m[3]}:null};
const d=(n,i)=>Math.floor(n/10**i)%10;
const classe=c=>c.op==="+"?((d(c.a,0)+d(c.b,0)>=10)?"soma com":"soma sem"):((d(c.a,0)<d(c.b,0))?"sub com":"sub sem");
function contas2(nivel,confere,extra){
  const its=draw(G["g2n"+String(nivel).padStart(2,"0")]),cl={};
  for(const p of its){const c=parseConta(p);if(!c){falha(nivel,"conta fora do formato: "+p.pre);continue}
   const r=c.op==="+"?c.a+c.b:c.a-c.b;if(p.a!==r)falha(nivel,"resposta errada: "+p.pre+" "+p.a);
   if(c.op==="-"&&r<=0)falha(nivel,"subtração zero ou negativa: "+p.pre);
   if(p.a<=0)falha(nivel,"resposta zero");
   const k=confere(c,r,p);cl[k||"?"]=(cl[k||"?"]||0)+1;}
  console.log("nível "+nivel+":",JSON.stringify(cl));return {its,cl};
}
contas2(8,(c,r)=>{if(c.a<10||c.a>99||c.b<10||c.b>99)falha(8,"parcela sem dois algarismos");
 for(const x of [c.a,c.b])for(const i of[0])if(d(x,i)<1||d(x,i)>8)falha(8,"unidade fora de 1 a 8");
 if(d(c.a,0)+d(c.b,0)>9||d(c.a,1)+d(c.b,1)>9)falha(8,"há reagrupamento: "+c.a+"+"+c.b);if(c.op!=="+")falha(8,"não é soma");return "ok"});
contas2(9,(c,r)=>{const us=d(c.a,0)+d(c.b,0);if(us<10||us>18)falha(9,"soma das unidades fora de 10 a 18: "+c.a+"+"+c.b);
 if(r<21||r>99)falha(9,"resultado fora de 21 a 99");if(d(c.a,1)+d(c.b,1)>8)falha(9,"dezenas somam mais de 8");return "ok"});
contas2(10,(c,r)=>{if(d(c.a,1)<=d(c.b,1))falha(10,"dezena de a não é maior");if(d(c.a,0)<d(c.b,0))falha(10,"precisa emprestar: "+c.a+"-"+c.b);
 if(d(c.b,0)<1)falha(10,"unidade zero na parcela");if(r<10||r>89)falha(10,"resultado fora de 10 a 89");return "ok"});
contas2(11,(c,r)=>{if(d(c.a,1)<=d(c.b,1))falha(11,"dezena de a não é maior");if(d(c.a,0)>=d(c.b,0))falha(11,"não precisa emprestar: "+c.a+"-"+c.b);
 if(r<1||r>79)falha(11,"resultado fora de 1 a 79");return "ok"});
{const {cl}=contas2(12,(c)=>classe(c));for(const k of["soma sem","soma com","sub sem","sub com"])if(Math.abs((cl[k]||0)/N-.25)>.04)falha(12,"família "+k+" fora de 25%");
 if(Object.keys(cl).length!==4)falha(12,"classes inesperadas")}
{ // nível 13: cinco famílias
 const fam=c=>{const m=x=>x%10===0;if(!m(c.a)||!m(c.b))return "?";
  if(c.op==="+"){if(c.a%100===0&&c.b%100===0)return 1;if(c.a%100===0&&c.b<100)return 3;return 4}
  if(c.a%100===0&&c.b%100===0)return 2;return 5};
 const {its,cl}=contas2(13,(c,r)=>{const f=fam(c);if(f==="?")falha(13,"parcela que não é múltiplo de 10");
  if(r>1000||r<=0)falha(13,"resultado fora de 1 a 1000");
  if(f===4&&(d(c.a,1)+d(c.b,1)>9))falha(13,"família 4 passa da centena: "+c.a+"+"+c.b);
  if(f===5&&(d(c.a,1)<d(c.b,1)||d(c.a,2)<d(c.b,2)))falha(13,"família 5 precisa emprestar: "+c.a+"-"+c.b);
  if(f===3&&(c.b>90))falha(13,"família 3");return String(f)});
 for(const k of[1,2,3,4,5])if(Math.abs((cl[k]||0)/N-.2)>.04)falha(13,"família "+k+" fora de 20% nas contas sorteadas");
 let ruim=0;
 for(let i=0;i<1500;i++){const it=niv(G.g2n13),c={};it.forEach(p=>{const f=fam(parseConta(p));c[f]=(c[f]||0)+1});
  if(it.length!==8||c[1]!==1||c[2]!==1||c[3]!==2||c[4]!==2||c[5]!==2)ruim++}
 console.log("nível 13: folhas sem 1+1+2+2+2",ruim);if(ruim)falha(13,ruim+" folhas fora de 1+1+2+2+2")}
{const {its}=contas2(14,(c,r)=>{if(c.a<100||c.a>999||c.b<100||c.b>999)falha(14,"parcela sem três algarismos");
  for(let i=0;i<3;i++){if(c.op==="+"&&d(c.a,i)+d(c.b,i)>9)falha(14,"reagrupa: "+c.a+"+"+c.b);if(c.op==="-"&&d(c.a,i)<d(c.b,i))falha(14,"empresta: "+c.a+"-"+c.b)}
  if(c.op==="+"&&(r<100||r>999))falha(14,"soma fora de 100 a 999");if(c.op==="-"&&(r<1||r>899))falha(14,"subtração fora de 1 a 899");
  return c.op==="+"?"soma":"sub"});
 let z=0;for(const p of its){const c=parseConta(p);if(/0/.test(String(c.a).slice(1)+String(c.b).slice(1)))z++}
 console.log("nível 14: contas com zero nas dezenas ou unidades",(100*z/N).toFixed(0)+"%");if(z/N<.12||z/N>.35)falha(14,"zeros fora de 12% a 35%");
 let ruim=0;
 for(let i=0;i<1500;i++){const it=niv(G.g2n14),s=it.filter(p=>parseConta(p).op==="+").length;if(it.length!==8||s!==4)ruim++}
 console.log("nível 14: folhas sem 4 somas e 4 subtrações",ruim);if(ruim)falha(14,ruim+" folhas sem 4 e 4")}
{ // parcelas trocadas nunca na mesma folha (somas dos níveis 8, 9, 12, 13, 14)
 for(const nivel of [8,9,12,13,14]){const gg=G["g2n"+String(nivel).padStart(2,"0")];let ruim=0;
  for(let i=0;i<1500;i++){const it=niv(gg).filter(p=>parseConta(p)&&parseConta(p).op==="+"),k=it.map(p=>{const c=parseConta(p);return Math.min(c.a,c.b)+","+Math.max(c.a,c.b)});if(new Set(k).size<k.length)ruim++}
  console.log("nível "+nivel+": folhas com parcelas trocadas",ruim);if(ruim)falha(nivel,ruim+" folhas com parcelas trocadas")}}

/* ---- Nível 15: o número escondido ---- */
{const its=draw(G.g2n15),fs={1:0,2:0,3:0,4:0},tot={100:0,red:0,out:0};
 for(const p of its){
  const L=(p.pre+" "+p.a+" "+p.post).replace(/−/g,"-").trim(),m=L.split("=");if(m.length!==2){falha(15,"formato: "+L);continue}
  if(!/^[\d\s+\-]+$/.test(L.replace("=",""))){falha(15,"formato: "+L);continue}
  if(Function("return ("+m[0]+")===("+m[1]+")")()!==true)falha(15,"a conta não fecha com a resposta: "+L);
  if(!(p.a>0))falha(15,"resposta zero");
  const f=p._info.f;fs[f]++;
  const nums2=nums(L),c=f===1||f===2?nums2[2]:f===3?nums2[0]:p.a;       /* o total: soma ou primeiro número da subtração */
  if(f===1&&!/^\d+ \+$/.test(p.pre)||f===2&&p.pre!==""||f===3&&!/^\d+ −$/.test(p.pre)||f===4&&p.pre!=="")falha(15,"posição do espaço: "+JSON.stringify(p.pre));
  if(c>100||c<2)falha(15,"total fora de 2 a 100: "+L);
  if(f===1&&nums2.some(x=>x>100)||[nums2[0],nums2[1],nums2[2]].some(x=>x>100))falha(15,"número maior que 100");
  if(c===100)tot[100]++;else if(c%10===0)tot.red++;else tot.out++;
 }
 console.log("nível 15: formas",JSON.stringify(fs),"totais 100/redondo/outro",(100*tot[100]/N).toFixed(0)+"%",(100*tot.red/N).toFixed(0)+"%",(100*tot.out/N).toFixed(0)+"%");
 for(const k in fs)if(Math.abs(fs[k]/N-.25)>.04)falha(15,"forma "+k+" fora de 25%");
 for(const k of[100,"red","out"])if(Math.abs(tot[k]/N-1/3)>.04)falha(15,"total "+k+" fora de 1/3");
 let ruim=0;
 for(let i=0;i<1500;i++){const it=niv(G.g2n15),c={};it.forEach(p=>{c[p._info.f]=(c[p._info.f]||0)+1});if(it.length!==8||[1,2,3,4].some(k=>c[k]!==2))ruim++}
 console.log("nível 15: folhas sem 2 de cada forma",ruim);if(ruim)falha(15,ruim+" folhas sem 2 de cada forma")}

/* ---- Nível 16: quantos a mais, quantos a menos ---- */
{const its=draw(G.g2n16);let fig=0,num=0,mais=0;
 for(const p of its){
  if(p.extra&&p.extra.fig){fig++;const f=p.extra.fig,[A,B]=f.groups,m=p.pre.match(/^(Quantas|Quantos) (\S+) a (mais|menos) do que (\S+) há aqui\?$/);
   if(!m){falha(16,"pergunta fora do formato: "+p.pre);continue}
   const oa=FC.exh.OBJ.find(o=>o.pl===m[2]),ob=FC.exh.OBJ.find(o=>o.pl===m[4]);
   if(!oa||!ob||oa.e===ob.e){falha(16,"objetos da pergunta: "+p.pre);continue}
   const na=[A,B].find(g=>g.e===oa.e).n,nb=[A,B].find(g=>g.e===ob.e).n;
   if(m[1]!==(oa.f?"Quantas":"Quantos"))falha(16,"concordância: "+p.pre);
   if(A.e===B.e||A.n<6||A.n>20||B.n<6||B.n>20||A.n===B.n)falha(16,"grupos fora do formato");
   const ok=m[3]==="mais"?na>nb:na<nb;if(!ok)falha(16,"o grupo perguntado não é o "+m[3]+": "+p.pre+" "+na+" "+nb);
   if(p.a!==Math.abs(na-nb)||p.a<1||p.a>9)falha(16,"diferença errada: "+p.pre+" → "+p.a);if(m[3]==="mais")mais++;
  }else{num++;const m=p.pre.match(/^(\S+) tem (\d+) (\S+) e (\S+) tem (\d+)\. (Quantas|Quantos) (\S+) (\S+) tem a (mais|menos) do que (\S+)\?$/);
   if(!m){falha(16,"pergunta fora do formato: "+p.pre);continue}
   const [,n1,a,ob,n2,b,q,ob2,quem,mm,outra]=m;if(ob!==ob2)falha(16,"objeto diferente na pergunta");
   if(n1===n2||quem===outra||![n1,n2].includes(quem)||![n1,n2].includes(outra))falha(16,"nomes: "+p.pre);
   const va=+a,vb=+b,vq=quem===n1?va:vb,vo=quem===n1?vb:va;
   if((mm==="mais"?vq>vo:vq<vo)!==true)falha(16,"a pessoa perguntada não tem "+mm+": "+p.pre);
   if(p.a!==Math.abs(va-vb)||p.a<1||p.a>40||va>99||vb>99||va<10||vb<10)falha(16,"números: "+p.pre+" → "+p.a);
   if(mm==="mais")mais++;}
 }
 console.log("nível 16: figura",(100*fig/N).toFixed(0)+"%, números",(100*num/N).toFixed(0)+"%, \"a mais\"",(100*mais/N).toFixed(0)+"%");
 if(Math.abs(fig/N-.625)>.04)falha(16,"proporção figura");if(Math.abs(mais/N-.5)>.04)falha(16,"a mais / a menos");}

/* ---- Níveis 17 e 18: problemas ---- */
function problemas(nivel,modo){
 const its=draw(G["g2n"+nivel]),tp={},rg={sim:0,nao:0};
 for(const p of its){
  const w=p.pre.trim().split(/\s+/).length;if(w>18)falha(nivel,"enunciado com "+w+" palavras: "+p.pre);
  const ns=nums(p.pre),[a,b]=ns,soma=/ têm (juntos|juntas)\?$|há agora\?$/.test(p.pre);
  if(ns.length!==2)falha(nivel,"número de valores no texto: "+p.pre);
  const tipo=/ tem \d+ .* e \S+ tem \d+\./.test(p.pre)?"juntar":/^Havia \d+ .*Chegaram/.test(p.pre)?"acrescentar":/ deu \d+ para um amigo/.test(p.pre)?"separar":/Foram embora/.test(p.pre)?"retirar":"?";
  if(tipo==="?"){falha(nivel,"tipo desconhecido: "+p.pre);continue}
  tp[tipo]=(tp[tipo]||0)+1;
  const sm=tipo==="juntar"||tipo==="acrescentar",r=sm?a+b:a-b;
  if(p.a!==r)falha(nivel,"resposta errada: "+p.pre+" → "+p.a);
  if(p.a<=0)falha(nivel,"resultado zero ou negativo");
  if(modo===17){if(a<10||a>99||b<10||b>99)falha(nivel,"números fora de dois algarismos");if(sm&&r>100)falha(nivel,"soma passa de 100")}
  else{if(a%10||b%10||a<100||b<100||a>990||b>990)falha(nivel,"quantidade que não é múltiplo de 10 de 100 a 990: "+p.pre);if(r>999)falha(nivel,"total passa de 999")}
  const ua=modo===17?a%10:d(a,1),ub=modo===17?b%10:d(b,1),rg0=sm?(ua+ub>=10):(ua<ub);rg[rg0?"sim":"nao"]++;
  const mf=p.pre.match(/(Quantas|Quantos) (\S+)/),objs=[["figurinhas",1],["livros",0],["bolas",1],["adesivos",0],["carrinhos",0],["balas",1],["flores",1],["lápis",0],["carros",0],["pássaros",0],["balões",0],["alunos",0],["peixes",0],["pintinhos",0]].find(o=>o[0]===mf[2]);
  if(!objs||mf[1]!==(objs[1]?"Quantas":"Quantos"))falha(nivel,"concordância: "+p.pre);
  if(tipo==="juntar"){const mm=p.pre.match(/^(\S+) tem \d+ \S+ e (\S+) tem/);if(mm[1]===mm[2])falha(nivel,"mesmo nome duas vezes");
   const elas=FC.exh.NAMES.find(n=>n[0]===mm[1])[1]==="f"&&FC.exh.NAMES.find(n=>n[0]===mm[2])[1]==="f";
   if(!p.pre.includes(" "+(elas?"elas têm juntas":"eles têm juntos")+"?"))falha(nivel,"concordância elas/eles: "+p.pre)}
 }
 console.log("nível "+nivel+": tipos",JSON.stringify(tp),"com reagrupamento",(100*rg.sim/N).toFixed(0)+"%");
 for(const k of["juntar","acrescentar","separar","retirar"])if(Math.abs((tp[k]||0)/N-.25)>.04)falha(nivel,"tipo "+k+" fora de 25%");
 if(Math.abs(rg.sim/N-.5)>.05)falha(nivel,"reagrupamento fora de 50%");
}
problemas("17",17);problemas("18",18);

/* ---- Níveis 19 a 26: multiplicação, dobro, triplo e metade ---- */
const OBJS=FC.exh.OBJ;
const conta=(pre)=>{const m=pre.match(/^(\d+) × (\d+) =$/);return m?[+m[1],+m[2]]:null};
function figGrupos(p,nivel,g,qmin,qmax){
  const f=p.extra.fig;if(f.t!=="grupos"){falha(nivel,"figura de outro tipo");return null}
  const html=FC.fig(f),caixas=html.split('class="gbox"').slice(1).map(c=>(c.match(/<i>/g)||[]).length);
  if(caixas.length!==f.g||caixas.some(c=>c!==f.q))falha(nivel,"as caixas não têm todas "+f.q+" objetos: "+caixas);
  if(g&&f.g!==g)falha(nivel,"número de grupos "+f.g+" em vez de "+g);
  if(f.q<qmin||f.q>qmax)falha(nivel,"objetos por caixa fora de "+qmin+" a "+qmax);
  const o=OBJS.find(o=>o.e===f.e),m=p.pre.match(/^(Quantas|Quantos) (\S+) há ao todo\?$/);
  if(!m||m[1]!==(o.f?"Quantas":"Quantos")||m[2]!==o.pl)falha(nivel,"pergunta/concordância: "+p.pre);
  if(p.a!==caixas.reduce((a,b)=>a+b,0))falha(nivel,"resposta diferente do total desenhado: "+p.pre+" → "+p.a);
  return f;
}
{const its=draw(G.g2n19);let fg=0,sm=0;
 for(const p of its){
  if(p.extra){fg++;const f=figGrupos(p,19,0,2,6);if(f&&(f.g<2||f.g>5))falha(19,"grupos fora de 2 a 5")}
  else{sm++;const v=nums(p.pre),k=v.length;if(!/^\d+( \+ \d+)+ =$/.test(p.pre)||k<2||k>5||new Set(v).size!==1||v[0]<2||v[0]>10)falha(19,"soma de parcelas: "+p.pre);
   if(p.a!==v.reduce((a,b)=>a+b,0)||p.a>50)falha(19,"resposta: "+p.pre+" → "+p.a)}}
 console.log("nível 19: figura",(100*fg/N).toFixed(0)+"%, soma",(100*sm/N).toFixed(0)+"%");if(Math.abs(fg/N-.5)>.04)falha(19,"proporção figura/soma")}
function tabuada(nivel,ks){
 const its=draw(G["g2n"+nivel]),tp={fig:0,conta:0,txt:0},ps={};
 for(const p of its){
  if(p.extra){tp.fig++;const f=figGrupos(p,nivel,ks.length===1?ks[0]:0,2,10);if(f&&!ks.includes(f.g))falha(nivel,"tabuada fora do nível: "+f.g);ps[f&&f.g]=(ps[f&&f.g]||0)+1;continue}
  const c=conta(p.pre);
  if(c){tp.conta++;const [a,b]=c;if(!(ks.includes(a)&&b>=2&&b<=10)&&!(ks.includes(b)&&a>=2&&a<=10))falha(nivel,"conta fora da tabuada: "+p.pre);if(p.a!==a*b)falha(nivel,"resposta: "+p.pre+" → "+p.a);ps[a]=(ps[a]||0)+1;continue}
  let m=p.pre.match(/^Qual é o (dobro|triplo) de (\d+)\?$/);
  if(m){tp.txt++;const k=m[1]==="dobro"?2:3;if(!ks.includes(k)||p.a!==k*+m[2]||+m[2]<2||+m[2]>10)falha(nivel,"dobro/triplo: "+p.pre+" → "+p.a);continue}
  m=p.pre.match(/^Quanto é (\d+) vezes (\d+)\?$/);
  if(m){tp.txt++;if(!ks.includes(+m[1])||+m[2]<2||+m[2]>10||p.a!==m[1]*m[2])falha(nivel,"vezes: "+p.pre+" → "+p.a);continue}
  falha(nivel,"pergunta desconhecida: "+p.pre);
 }
 console.log("nível "+nivel+":",JSON.stringify(tp));
 for(const k of["fig","conta"])if(Math.abs(tp[k]/N-.375)>.04)falha(nivel,k+" fora de 37,5%");if(Math.abs(tp.txt/N-.25)>.04)falha(nivel,"texto fora de 25%");
 return ps;
}
tabuada(20,[2]);tabuada(21,[3]);tabuada(22,[4]);tabuada(23,[5]);
{ // fatores trocados nunca na mesma folha (níveis 20 a 24)
 for(const nivel of [20,21,22,23,24]){const gg=G["g2n"+nivel];let ruim=0;
  for(let i=0;i<1500;i++){const it=niv(gg).map(p=>conta(p.pre)).filter(Boolean).map(([a,b])=>Math.min(a,b)+","+Math.max(a,b));if(new Set(it).size<it.length)ruim++}
  console.log("nível "+nivel+": folhas com fatores trocados",ruim);if(ruim)falha(nivel,ruim+" folhas com fatores trocados")}}
{const its=draw(G.g2n24),ks={2:0,3:0,4:0,5:0};
 for(const p of its){let k;
  if(p.extra){const f=figGrupos(p,24,0,2,10);k=f&&f.g}
  else{const c=conta(p.pre);if(c){const [a,b]=c;k=[2,3,4,5].includes(a)?a:b;if(p.a!==a*b)falha(24,"resposta: "+p.pre)}
   else{let m=p.pre.match(/^Qual é o (dobro|triplo) de (\d+)\?$/);if(m){k=m[1]==="dobro"?2:3;if(p.a!==k*+m[2])falha(24,p.pre)}
    else{m=p.pre.match(/^Quanto é (\d+) vezes (\d+)\?$/);if(!m){falha(24,"pergunta: "+p.pre);continue}k=+m[1];if(p.a!==m[1]*m[2])falha(24,p.pre)}}}
  if(k)ks[k]++}
 console.log("nível 24: tabuadas",JSON.stringify(ks));for(const k in ks)if(Math.abs(ks[k]/N-.25)>.04)falha(24,"tabuada "+k)
 let ruim=0;for(let i=0;i<1500;i++){const it=niv(G.g2n24),c={2:[0,0],3:[0,0],4:[0,0],5:[0,0]};
  it.forEach(p=>{const fg=!!p.extra,k=fg?p.extra.fig.g:p._info.k;c[k][fg?0:1]++});
  if(it.length!==8||[2,3,4,5].some(k=>c[k][0]!==1||c[k][1]!==1))ruim++}
 console.log("nível 24: folhas sem 2 de cada tabuada (1 figura + 1 conta ou texto)",ruim);if(ruim)falha(24,ruim+" folhas fora do esperado")}
{const its=draw(G.g2n25);let fg=0,me=0,te=0,div={2:0,3:0};
 for(const p of its){
  if(p.extra){fg++;const f=p.extra.fig;if(f.t!=="reparte"){falha(25,"figura de outro tipo");continue}
   const html=FC.fig(f),band=html.split('class="bandeja"')[1].split('class="pratos"')[0],soltos=(band.match(/<i>/g)||[]).length,pratos=(html.match(/class="prato"/g)||[]).length;
   if(soltos!==f.n||pratos!==f.g)falha(25,"desenho: "+[soltos,pratos]+" vs "+[f.n,f.g]);
   const m=p.pre.match(/^Divida igualmente (as|os) (\d+) (\S+) em (\d+) pratos\. (Quantas|Quantos) (\S+) ficam em cada prato\?$/);
   if(!m){falha(25,"pergunta: "+p.pre);continue}
   const o=OBJS.find(o=>o.e===f.e);if(m[1]!==(o.f?"as":"os")||m[5]!==(o.f?"Quantas":"Quantos")||m[3]!==o.pl||m[6]!==o.pl)falha(25,"concordância: "+p.pre);
   if(+m[2]!==f.n||+m[4]!==f.g||f.n%f.g!==0||p.a!==f.n/f.g||p.a<2||p.a>10)falha(25,"conta: "+p.pre+" → "+p.a);div[f.g]++}
  else{let m=p.pre.match(/^Qual é a metade de (\d+)\?$/);
   if(m){me++;if(+m[1]%2||p.a!==m[1]/2||m[1]<4||m[1]>20)falha(25,p.pre+" → "+p.a);continue}
   m=p.pre.match(/^Qual é a terça parte de (\d+)\?$/);
   if(m){te++;if(+m[1]%3||p.a!==m[1]/3||m[1]<6||m[1]>30)falha(25,p.pre+" → "+p.a);continue}
   falha(25,"pergunta: "+p.pre)}}
 console.log("nível 25: figura",(100*fg/N).toFixed(0)+"%, metade",(100*me/N).toFixed(0)+"%, terça parte",(100*te/N).toFixed(0)+"%, pratos",JSON.stringify(div));
 if(Math.abs(fg/N-.375)>.04||Math.abs(me/N-.375)>.04||Math.abs(te/N-.25)>.04)falha(25,"proporções");if(Math.abs(div[2]/(div[2]+div[3])-.5)>.05)falha(25,"2 e 3 pratos")}
{const its=draw(G.g2n26),tp={};
 for(const p of its){
  const w=p.pre.trim().split(/\s+/).length;if(w>18)falha(26,"enunciado com "+w+" palavras: "+p.pre);
  let m,tipo;
  if((m=p.pre.match(/^Cada (\S+) tem (\d+) (\S+)\. (Quantas|Quantos) (\S+) há em (\d+) (\S+)\?$/))){tipo="grupos";
   if(m[3]!==m[5]||!["lápis","figurinhas","balas","livros","adesivos","flores"].includes(m[3]))falha(26,"objeto: "+p.pre);
   const fem=["figurinhas","balas","flores"].includes(m[3]);if(m[4]!==(fem?"Quantas":"Quantos"))falha(26,"concordância: "+p.pre);
   if(m[7]!==m[1]+"s"&&m[7]!==m[1]+"es")falha(26,"plural do recipiente: "+p.pre);if(+m[6]<2||+m[6]>5||+m[2]<2||+m[2]>10||p.a!==m[2]*m[6])falha(26,p.pre+" → "+p.a)}
  else if((m=p.pre.match(/^(\S+) tem (\d+) (\S+)\. (\S+) tem (o dobro|o triplo)\. (Quantas|Quantos) (\S+) (\S+) tem\?$/))){tipo=m[5]==="o dobro"?"dobro":"triplo";
   const f=tipo==="dobro"?2:3;if(m[1]===m[4]||m[8]!==m[4]||m[3]!==m[7])falha(26,"nomes/objeto: "+p.pre);if(+m[2]<2||+m[2]>10||p.a!==f*m[2])falha(26,p.pre+" → "+p.a);
   const fem=["figurinhas","balas","flores"].includes(m[3]);if(m[6]!==(fem?"Quantas":"Quantos"))falha(26,"concordância: "+p.pre)}
  else if((m=p.pre.match(/^(\S+) tinha (\d+) (\S+) e deu (a metade|a terça parte) para um amigo\. (Quantas|Quantos) (\S+) (ela|ele) deu\?$/))){tipo=m[4]==="a metade"?"metade":"terca";
   const d=tipo==="metade"?2:3;if(+m[2]%d||p.a!==m[2]/d||m[3]!==m[6]||+m[2]/d<2||+m[2]/d>10)falha(26,p.pre+" → "+p.a);
   const fem=["balas","figurinhas","bolinhas"].includes(m[3]);if(m[5]!==(fem?"Quantas":"Quantos"))falha(26,"concordância: "+p.pre);
   const nome=FC.exh.NAMES.find(n=>n[0]===m[1]);if(!nome||m[7]!==(nome[1]==="f"?"ela":"ele"))falha(26,"ela/ele: "+p.pre)}
  else{falha(26,"pergunta desconhecida: "+p.pre);continue}
  if(p.a<=0||p.a>50)falha(26,"resultado fora de 1 a 50");tp[tipo]=(tp[tipo]||0)+1}
 console.log("nível 26: tipos",JSON.stringify(tp));for(const k of["grupos","dobro","triplo","metade","terca"])if(Math.abs((tp[k]||0)/N-.2)>.04)falha(26,"tipo "+k+" fora de 20%")}

/* ---- Níveis 27 a 32: padrões e geometria ---- */
const periodica=a=>{for(let q=1;2*q+1<=a.length;q++){let ok=true;for(let j=0;j+q<a.length;j++)if(a[j]!==a[j+q]){ok=false;break}if(ok)return true}return false};
{const its=draw(G.g2n27),tp={fig:0,sim:0,pal:0},pt={};let meio=0;
 for(const p of its){
  const opts=p.extra.opts;let toks,cand;
  if(p.extra.fig){tp.fig++;const it=p.extra.fig.items;toks=it.map(x=>x==="?"?"?":x.fig.n+"|"+x.fig.color);cand=opts.map(o=>o.fig.n+"|"+o.fig.color)}
  else if(/^Qual completa o padrão\? /.test(p.pre)){tp.sim++;toks=p.pre.replace(/^Qual completa o padrão\? /,"").split(" ");cand=opts.slice()}
  else if(/^Qual palavra completa o padrão\? /.test(p.pre)){tp.pal++;toks=p.pre.replace(/^Qual palavra completa o padrão\? /,"").split(", ");cand=opts.slice()}
  else{falha(27,"pergunta: "+p.pre);continue}
  const b=toks.indexOf("?");if(b<0||toks.lastIndexOf("?")!==b)falha(27,"precisa de exatamente um espaço: "+toks);
  const fim=b===toks.length-1;if(!fim)meio++;
  if(b===0)falha(27,"o espaço não pode ser o primeiro");
  const L=toks.length,per=pt[p._info.nome]=(pt[p._info.nome]||0)+1;
  if(L<2*p._info.p+1||L>2*p._info.p+p._info.p)falha(27,"fila sem dois períodos mais o começo do terceiro: "+L+" "+p._info.nome);
  if(new Set(cand).size!==3)falha(27,"opções repetidas: "+cand);
  const certa=cand[p.a-1],vals=cand.map(c=>{const f=toks.slice();f[b]=c;return periodica(f)});
  if(vals.filter(Boolean).length!==1||!vals[p.a-1])falha(27,"não há um único elemento que completa o padrão: "+toks+" → "+cand+" "+vals);
  if(!toks.filter(x=>x!=="?").some(x=>x===certa))falha(27,"o elemento certo nem aparece na fila");
 }
 console.log("nível 27: figuras",(100*tp.fig/N).toFixed(0)+"%, símbolos",(100*tp.sim/N).toFixed(0)+"%, palavras",(100*tp.pal/N).toFixed(0)+"%, espaço no meio",(100*meio/N).toFixed(0)+"%, padrões",JSON.stringify(pt));
 if(Math.abs(tp.fig/N-.375)>.04||Math.abs(tp.sim/N-.375)>.04||Math.abs(tp.pal/N-.25)>.04)falha(27,"proporções");if(Math.abs(meio/N-.5)>.05)falha(27,"meio/fim");
 for(const k of["AB","AAB","ABB","ABC","AABB"])if(Math.abs((pt[k]||0)/N-.2)>.04)falha(27,"padrão "+k)}
{const its=draw(G.g2n28),tp={1:0,2:0,3:0};
 for(const p of its){
  let m=p.pre.match(/^([\d, ]+)\. De quanto em quanto a sequência (cresce|diminui)\?$/);
  if(m){tp[1]++;const v=nums(m[1]);if(v.length<4||v.length>5)falha(28,"quantidade de termos");const d=v[1]-v[0];for(let i=1;i<v.length;i++)if(v[i]-v[i-1]!==d)falha(28,"fila fora da regra");
   if(p.a!==Math.abs(d)||(m[2]==="cresce")!==(d>0)||![2,3,4,5,10,100].includes(p.a))falha(28,"passo errado: "+p.pre+" → "+p.a);if(v.some(x=>x<1||x>999))falha(28,"fora de 1 a 999");continue}
  m=p.pre.match(/^([\d, ]+),$/);
  if(m){tp[2]++;const v=nums(m[1]);if(v.length!==4)falha(28,"termos");const d=v[1]-v[0];for(let i=1;i<v.length;i++)if(v[i]-v[i-1]!==d)falha(28,"fila fora da regra");
   if(p.a!==v[3]+d||p.a<1||p.a>999)falha(28,"próximo errado: "+p.pre+" → "+p.a);continue}
  m=p.pre.match(/^([\d, ]+)\. Qual é a regra da sequência\?$/);
  if(m){tp[3]++;const v=nums(m[1]),d=v[1]-v[0];for(let i=1;i<v.length;i++)if(v[i]-v[i-1]!==d)falha(28,"fila fora da regra");
   const op=p.extra.opts,reg=(d>0?"soma ":"tira ")+Math.abs(d);if(op[p.a-1]!==reg||op.filter(o=>o===reg).length!==1||op.length!==3||new Set(op).size!==3)falha(28,"regra: "+op+" → "+p.a+" ("+reg+")");continue}
  falha(28,"pergunta: "+p.pre)}
 console.log("nível 28:",JSON.stringify(tp));for(const k in tp)if(Math.abs(tp[k]/N-(k==="3"?.25:.375))>.04)falha(28,"tipo "+k)}
const POSN={"maçã":"🍎","bola":"⚽","estrela":"⭐","flor":"🌼","balão":"🎈","biscoito":"🍪","cachorro":"🐶","gato":"🐱"};
{const its=draw(G.g2n29),tp={entre:0,dois:0};
 for(const p of its){
  const it=p.extra.fig.items,opts=p.extra.opts;
  if(new Set(it).size!==it.length||it.length<4||it.length>5||p.extra.fig.dir!=="h")falha(29,"fila: "+it);
  let m=p.pre.match(/^Quem está entre (?:a|o) (\S+) e (?:a|o) (\S+)\?$/),a,c,r;
  if(m){tp.entre++;a=it.indexOf(POSN[m[1]]);c=it.indexOf(POSN[m[2]]);if(a<0||c<0||Math.abs(a-c)!==2)falha(29,"referências do 'entre': "+p.pre+" "+it);r=it[(a+c)/2]}
  else if((m=p.pre.match(/^Quem está à (direita|esquerda) (?:da|do) (\S+) e à (direita|esquerda) (?:da|do) (\S+)\?$/))){tp.dois++;
   if(m[1]===m[3])falha(29,"duas direções iguais");const i1=it.indexOf(POSN[m[2]]),i2=it.indexOf(POSN[m[4]]);if(i1<0||i2<0)falha(29,"objeto fora da fila");
   const ok=it.filter((x,i)=>{const c1=m[1]==="direita"?i>i1:i<i1,c2=m[3]==="direita"?i>i2:i<i2;return c1&&c2});
   if(ok.length!==1)falha(29,"não há um único objeto que satisfaz as duas condições: "+p.pre+" "+it+" → "+ok);r=ok[0];
   if(it.length!==5)falha(29,"fila do 'dois pontos' deveria ter 5")}
  else{falha(29,"pergunta: "+p.pre);continue}
  if(opts[p.a-1]!==r||!opts.every(o=>it.includes(o))||new Set(opts).size!==opts.length||opts.length<3)falha(29,"resposta: "+p.pre+" → "+opts[p.a-1]+" (certa "+r+")");
  for(const e of it)if(!Object.values(POSN).includes(e))falha(29,"emoji fora da lista frontal");
 }
 console.log("nível 29:",JSON.stringify(tp));if(Math.abs(tp.entre/N-.5)>.04)falha(29,"entre / dois pontos")}
{const its=draw(G.g2n30),tp={1:0,2:0},L="ABCDEFGH";
 for(const p of its){
  const f=p.extra.fig;if(f.t!=="quadriculado"||![5,6].includes(f.c)||f.c!==f.r)falha(30,"quadriculado fora do formato");
  const html=FC.fig(f);if((html.match(/class="start"/g)||[]).length!==1)falha(30,"falta o ponto de partida");
  const parse=c=>[L.indexOf(c[0])+1,+c.slice(1)];
  let m=p.pre.match(/^Comece em ([A-F]\d)\. Ande (\d+) casas? para (a direita|a esquerda|cima|baixo)(?: e (\d+) casas? para (a direita|a esquerda|cima|baixo))?\. Onde você chega\?$/);
  if(m){tp[1]++;let [x,y]=parse(m[1]);if(f.s[0]!==x||f.s[1]!==y)falha(30,"a partida da figura não é a do texto");
   const mv=(n,d)=>{if(d==="a direita")x+=n;else if(d==="a esquerda")x-=n;else if(d==="cima")y+=n;else y-=n};
   mv(+m[2],m[3]);if(m[4]){mv(+m[4],m[5]);const h1=/direita|esquerda/.test(m[3]),h2=/direita|esquerda/.test(m[5]);if(h1===h2)falha(30,"os dois movimentos são do mesmo eixo")}
   if(x<1||x>f.c||y<1||y>f.r)falha(30,"o trajeto sai do quadriculado: "+p.pre);
   const opts=p.extra.opts;if(opts[p.a-1]!==L[x-1]+y||new Set(opts).size!==4||opts.length!==4)falha(30,"destino: "+p.pre+" → "+opts[p.a-1]+" certo "+L[x-1]+y);
   if(!opts.every(o=>{const q=parse(o);return q[0]>=1&&q[0]<=f.c&&q[1]>=1&&q[1]<=f.r}))falha(30,"opção fora do quadriculado")}
  else if((m=p.pre.match(/^Para ir da ● até a ★, quantas casas (para a direita|para a esquerda|para cima|para baixo)\?$/))){tp[2]++;
   if(!f.s||!f.d||(html.match(/class="dest"/g)||[]).length!==1)falha(30,"faltam ● e ★");
   const dx=f.d[0]-f.s[0],dy=f.d[1]-f.s[1];if(!dx&&!dy)falha(30,"partida igual ao destino");
   const r=m[1]==="para a direita"?dx:m[1]==="para a esquerda"?-dx:m[1]==="para cima"?dy:-dy;
   if(r<1||p.a!==r||p.a>5)falha(30,"casas: "+p.pre+" → "+p.a+" certo "+r);
   if(f.d[0]<1||f.d[0]>f.c||f.d[1]<1||f.d[1]>f.r)falha(30,"destino fora da grade")}
  else falha(30,"pergunta: "+p.pre)}
 console.log("nível 30:",JSON.stringify(tp));if(Math.abs(tp[1]/N-.5)>.04)falha(30,"tipos")}
{const its=draw(G.g2n31),tp={nome:0,car:0,obj:0};const SOLS=["cubo","bloco retangular","pirâmide","cone","cilindro","esfera"];
 for(const p of its){
  const opts=p.extra.opts;tp[p._info.tipo]++;let certa;
  if(p.extra.fig){certa=p.extra.fig.n;if(p.pre!=="Como se chama este sólido?"||!SOLS.includes(certa))falha(31,"desenho")}
  else if(p._info.tipo==="car"){certa=p._info.n}
  else{const m=p.pre.match(/^(.+) tem a forma de qual sólido\?$/);if(!m){falha(31,"pergunta: "+p.pre);continue}certa=p._info.n}
  if(opts[p.a-1]!==certa||opts.length!==4||new Set(opts).size!==4||opts.some(o=>!SOLS.includes(o)))falha(31,"opções: "+opts+" → "+p.a);
  if(opts.includes("cubo")&&opts.includes("bloco retangular"))falha(31,"cubo e bloco retangular juntos: "+opts);
  if(p._info.tipo==="car"){const regras={"6 faces quadradas":"cubo","6 faces retangulares":"bloco retangular","duas faces redondas e rola":"cilindro","uma ponta e uma face redonda":"cone","nenhuma face plana":"esfera","base quadrada e quatro faces triangulares":"pirâmide"};
   const k=Object.keys(regras).find(k=>p.pre.includes(k));if(!k||regras[k]!==certa)falha(31,"característica: "+p.pre+" → "+certa)}
  if(p._info.tipo==="obj"){const obj={"bola":"esfera","globo":"esfera","lata":"cilindro","vela":"cilindro","tubo":"cilindro","caixa de sapato":"bloco retangular","tijolo":"bloco retangular","chapéu":"cone","dado":"cubo","cubo de gelo":"cubo"};
   const k=Object.keys(obj).find(k=>p.pre.toLowerCase().includes(k));if(!k||obj[k]!==certa)falha(31,"objeto: "+p.pre+" → "+certa);if(!/^[A-ZÁ-Ú]/.test(p.pre))falha(31,"frase sem maiúscula")}
 }
 console.log("nível 31:",JSON.stringify(tp));if(Math.abs(tp.nome/N-.375)>.04||Math.abs(tp.car/N-.375)>.04||Math.abs(tp.obj/N-.25)>.04)falha(31,"proporções")}
{ // figuras planas: classificadas pela geometria desenhada
 const cls=f=>{
  if(f.t==="shape"){const m=FC.fig(f).match(/points="([^"]+)"/);return m[1].trim().split(/\s+/).length===5?"pentágono":"hexágono"}
  const g=FC.exh.formaGeom(f);if(g.circle)return "círculo";const P=g.pts;
  if(P.length===3)return "triângulo";
  const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]),lados=P.map((q,i)=>dist(q,P[(i+1)%4])),ang=P.map((q,i)=>{const a=P[(i+3)%4],b=P[(i+1)%4];return (a[0]-q[0])*(b[0]-q[0])+(a[1]-q[1])*(b[1]-q[1])});
  if(ang.some(x=>Math.abs(x)>1))return "outro";return Math.abs(lados[0]-lados[1])<.1?"quadrado":"retângulo"};
 const NL={"triângulo":3,"quadrado":4,"retângulo":4,"círculo":0,"pentágono":5,"hexágono":6};
 const its=draw(G.g2n32),tp={cont:0,nome:0,qual:0};let ponta=0;
 for(const p of its){const t=p._info.tipo;tp[t]++;
  if(t==="cont"){const f=p.extra.fig,n=cls(f),m=p.pre.match(/^Quantos (lados|vértices) tem esta figura\?$/);if(!m||n==="círculo"||n==="outro")falha(32,"contagem: "+p.pre+" "+n);
   if(p.a!==NL[n])falha(32,"número de "+m[1]+" de um "+n+" é "+NL[n]+", não "+p.a)}
  else if(t==="nome"){const f=p.extra.fig,n=cls(f),opts=p.extra.opts;if(n==="outro")falha(32,"figura irreconhecível");if(opts[p.a-1]!==n)falha(32,"nome: "+n+" ≠ "+opts[p.a-1]);
   if(n==="quadrado"&&opts.includes("retângulo"))falha(32,"retângulo entre as opções de um quadrado");if(new Set(opts).size!==4)falha(32,"opções repetidas");
   if(n==="quadrado"&&f.rot===45)ponta++;
   if(n==="retângulo"){const g=FC.exh.formaGeom(f),P=g.pts,w=Math.hypot(P[1][0]-P[0][0],P[1][1]-P[0][1]),h=Math.hypot(P[2][0]-P[1][0],P[2][1]-P[1][1]),r=Math.max(w,h)/Math.min(w,h);if(r<1.39||r>2.51)falha(32,"proporção do retângulo "+r)}}
  else{const opts=p.extra.opts,nomes=opts.map(o=>cls(o.fig)),q={"Qual figura tem 4 lados iguais?":n=>n==="quadrado","Qual figura não tem vértices?":n=>n==="círculo","Qual figura tem 3 vértices?":n=>n==="triângulo","Qual figura tem 5 lados?":n=>n==="pentágono","Qual figura tem 6 lados?":n=>n==="hexágono"}[p.pre];
   if(!q){falha(32,"pergunta: "+p.pre);continue}if(nomes.filter(q).length!==1||!q(nomes[p.a-1]))falha(32,"mais de uma figura certa: "+p.pre+" "+nomes);
   if(opts.length<3||opts.length>4||new Set(nomes).size!==nomes.length)falha(32,"opções: "+nomes);if(new Set(opts.map(o=>o.fig.color)).size!==1)falha(32,"cores diferentes")}
 }
 console.log("nível 32:",JSON.stringify(tp),"quadrados de ponta",ponta);if(Math.abs(tp.cont/N-.375)>.04||Math.abs(tp.nome/N-.375)>.04||Math.abs(tp.qual/N-.25)>.04)falha(32,"proporções");if(!ponta)falha(32,"nenhum quadrado de ponta")}

/* ---- Níveis 33 a 41: medidas, tempo, dinheiro, acaso e dados ---- */
const ART={"o lápis":"lapis","a borracha":"borracha","a fita":"fita","o clipe":"clipe"};
const artKey=t=>{const m=Object.keys(ART).find(k=>t.includes(k));return m?ART[m]:null};
{const its=draw(G.g2n33),tp={medir:0,comparar:0,unidade:0};
 for(const p of its){
  const t=p._info.tipo;tp[t]++;
  if(t==="unidade"){const op=p.extra.opts;if(op.length!==2||!op.includes("metro")||!op.includes("centímetro")||op[p.a-1]!==(p._info.metro?"metro":"centímetro"))falha(33,"unidade: "+p.pre+" → "+op[p.a-1]);continue}
  const f=p.extra.fig,html=FC.fig(f),objs=[...html.matchAll(/class="obj" x="([\d.]+)" y="[\d.]+" width="([\d.]+)"/g)];
  if(f.t!=="regua"||objs.length!==f.objs.length||p.post!=="cm")falha(33,"figura/post");
  f.objs.forEach((o,i)=>{if(+objs[i][1]!==10||+objs[i][2]!==o.len*18)falha(33,"objeto fora do zero ou do tamanho: "+JSON.stringify(o)+" "+objs[i].slice(1));if(!Number.isInteger(o.len)||o.len<2||o.len>15)falha(33,"medida fora de 2 a 15")});
  if(f.max!==15||(10+15*18+10)>340)falha(33,"régua");
  if(t==="medir"){if(p.a!==f.objs[0].len)falha(33,"medida: "+p.a+" vs "+f.objs[0].len);const k=artKey(p.pre);if(k!==f.objs[0].k)falha(33,"objeto da pergunta não é o da figura: "+p.pre)}
  else{const [A,B]=f.objs,m=p.pre.match(/^Quantos centímetros (.+) é (maior|menor) que (.+)\?$/);if(!m){falha(33,"pergunta: "+p.pre);continue}
   const k1=artKey(m[1]),k2=artKey(m[3]),la=[A,B].find(o=>o.k===k1),lb=[A,B].find(o=>o.k===k2);if(!la||!lb||k1===k2)falha(33,"objetos: "+p.pre);
   if((m[2]==="maior")!==(la.len>lb.len)||p.a!==Math.abs(la.len-lb.len)||p.a<1||p.a>12)falha(33,"comparação: "+p.pre+" → "+p.a+" "+la.len+" "+lb.len)}
 }
 console.log("nível 33:",JSON.stringify(tp));if(Math.abs(tp.medir/N-.5)>.04||Math.abs(tp.comparar/N-.25)>.04)falha(33,"proporções")}
{const its=draw(G.g2n34),tp={somar:0,falta:0};
 for(const p of its){
  const f=p.extra.fig,t=p._info.tipo;tp[t]++;const html=FC.fig(f),labs=[...html.matchAll(/class="lab"[^>]*>([^<]+)</g)].map(m=>m[1]);
  const N_={"triângulo":3,"quadrado":4,"retângulo":4,"pentágono":5}[f.n];
  if(f.lados.length!==N_||labs.length!==N_||p.post!=="cm")falha(34,"lados/rótulos: "+f.n+" "+f.lados+" "+labs);
  f.lados.forEach((l,i)=>{if(l<1||l>10)falha(34,"lado fora de 1 a 10");const esp=i===f.falta?"?":l+" cm";if(labs[i]!==esp)falha(34,"rótulo "+labs[i]+" ≠ "+esp)});
  const tot=f.lados.reduce((a,b)=>a+b,0);if(tot>40)falha(34,"contorno acima de 40");
  if(f.n==="quadrado"&&new Set(f.lados).size!==1)falha(34,"quadrado com lados diferentes");if(f.n==="retângulo"&&(f.lados[0]!==f.lados[2]||f.lados[1]!==f.lados[3]||f.lados[0]===f.lados[1]))falha(34,"retângulo");
  if(f.n==="triângulo"){const [a,b,c]=f.lados;if(a+b<=c||a+c<=b||b+c<=a)falha(34,"triângulo impossível: "+f.lados)}
  if(t==="somar"){if(p.pre!=="Qual é a medida do contorno?"||p.a!==tot||f.falta!==undefined)falha(34,"soma: "+p.a+" vs "+tot)}
  else{const m=p.pre.match(/^O contorno mede (\d+) cm\. Quanto mede o lado que falta\?$/);if(!m||+m[1]!==tot||p.a!==f.lados[f.falta]||f.n==="pentágono")falha(34,"lado que falta: "+p.pre+" → "+p.a)}
 }
 console.log("nível 34:",JSON.stringify(tp));if(Math.abs(tp.somar/N-.625)>.04)falha(34,"proporções")}
{const its=draw(G.g2n35),tp={unidade:0,comparar:0,balanca:0};
 const PESO=[["🐘","🐜"],["🚗","🍎"],["🍉","🍒"],["🐘","🐭"],["🏠","🎈"],["🚗","🎈"]];
 for(const p of its){const t=p._info.tipo;tp[t]++;const op=p.extra.opts;
  if(t==="unidade"){const m=p.pre.match(/^Qual unidade é melhor para medir a (massa|capacidade) de (.+)\?$/);if(!m){falha(35,"pergunta: "+p.pre);continue}
   const U={massa:["quilograma","grama"],capacidade:["litro","mililitro"]}[m[1]];if(op.length!==2||!U.every(u=>op.includes(u)))falha(35,"opções de outra grandeza: "+op);
   const grande=["uma pessoa","um saco de arroz","uma melancia","um cachorro grande","uma piscina","uma caixa-d'água","um balde","o tanque de um carro"].includes(m[2]);
   if(op[p.a-1]!==(grande?U[0]:U[1]))falha(35,"unidade errada: "+p.pre+" → "+op[p.a-1])}
  else if(t==="comparar"){const m=p.pre.match(/^(Qual tem mais água|Qual tem menos água|Qual é mais pesado|Qual é mais leve): (\d+) (\S+) ou (\d+) \3\?$/);if(!m){falha(35,"pergunta: "+p.pre);continue}
   const a=+m[2],b=+m[4],mais=/tem mais|mais pesado/.test(m[1]),r=(mais?Math.max(a,b):Math.min(a,b))+" "+m[3];if(op[p.a-1]!==r||op.length!==2||a===b)falha(35,"comparação: "+p.pre+" → "+op[p.a-1]);
   const gr=m[3];if(!(["litros","quilogramas"].includes(gr)&&a<=9&&b<=9||["mililitros","gramas"].includes(gr)&&a%100===0&&b%100===0&&a>=100&&b<=900))falha(35,"números fora do esperado: "+p.pre);
   if(/água/.test(m[1])!==["litros","mililitros"].includes(gr))falha(35,"unidade não combina com a pergunta: "+p.pre)}
  else{const f=p.extra.fig,par=PESO.find(q=>q.includes(f.l)&&q.includes(f.r));if(!par||f.l===f.r){falha(35,"par da balança");continue}
   const heavy=f.a>0?f.r:f.l,esp=/mais pesado/.test(p.pre)?heavy:(heavy===f.l?f.r:f.l);if(heavy!==par[0])falha(35,"o prato que desce deve ter o mais pesado: "+JSON.stringify(f));
   if(op[p.a-1]!==esp||op.length!==2)falha(35,"balança: "+p.pre+" → "+op[p.a-1]+" esperado "+esp)}
 }
 console.log("nível 35:",JSON.stringify(tp));if(Math.abs(tp.unidade/N-.375)>.04||Math.abs(tp.comparar/N-.375)>.04)falha(35,"proporções")}
{const its=draw(G.g2n36),tp={semana:0,datas:0,mes:0,meses:0,fato:0};
 const D=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],M=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
 for(const p of its){const t=p._info.tipo;tp[t]++;
  if(t==="semana"){const m=p.pre.match(/^Hoje é (\S+)\. Que dia da semana será daqui a (\d) (dia|dias)\?$/);const w=D.indexOf(m[1]),k=+m[2],op=p.extra.opts;
   if(w<0||k<1||k>6||(k===1)!==(m[3]==="dia")||op[p.a-1]!==D[(w+k)%7]||op.length!==4||new Set(op).size!==4)falha(36,"semana: "+p.pre+" → "+op[p.a-1])}
  else if(t==="datas"){const f=p.extra.fig,m=p.pre.match(/^Quantos dias se passam do dia (\d+) até o dia (\d+)\?$/),ult=new Date(f.y,f.m+1,0).getDate();
   if(f.t!=="calendario"||!m||+m[2]>ult||+m[1]<1||p.a!==+m[2]-+m[1]||p.a<2||p.a>15)falha(36,"datas: "+p.pre+" → "+p.a)}
  else if(t==="mes"){const m=p.pre.match(/^Qual mês vem (depois|antes) de (\S+)\?$/),i=M.indexOf(m[2]),op=p.extra.opts;if(i<0||op[p.a-1]!==M[m[1]==="depois"?i+1:i-1]||new Set(op).size!==4||op.includes(m[2]))falha(36,"mês: "+p.pre+" → "+op[p.a-1])}
  else if(t==="meses"){const m=p.pre.match(/^Quantos meses se passam de (\S+) até (\S+)\?$/),a=M.indexOf(m[1]),b=M.indexOf(m[2]);if(a<0||b<=a||p.a!==b-a||p.a<2||p.a>6)falha(36,"meses: "+p.pre+" → "+p.a)}
  else{const F={"Quantos dias tem uma semana?":7,"Quantos meses tem um ano?":12,'Quantos dias da semana têm "feira" no nome?':5,"Quantos meses do ano começam com a letra J?":3};if(F[p.pre]!==p.a)falha(36,"fato: "+p.pre+" → "+p.a)}
 }
 console.log("nível 36:",JSON.stringify(tp));for(const k of["semana","datas"])if(Math.abs(tp[k]/N-.25)>.04)falha(36,"proporção "+k)}
{const its=draw(G.g2n37),tp={ler:0,duracao:0,fim:0,meia:0};
 const mm=t=>{const x=t.split(":");return +x[0]*60+ +x[1]};const fmt=m=>Math.floor(m/60)+":"+String(m%60).padStart(2,"0");
 const pal=(h,m)=>m===0?h+" horas":h+" e meia";
 for(const p of its){const t=p._info.tipo;tp[t]++;
  if(t==="ler"){const f=p.extra.fig,op=p.extra.opts;if(f.t!=="digital"||![0,30].includes(f.m)||f.h<6||f.h>22)falha(37,"relógio");
   if(op[p.a-1]!==pal(f.h,f.m)||new Set(op).size!==3||op.length!==3)falha(37,"leitura: "+JSON.stringify(f)+" → "+op[p.a-1]);const html=FC.fig(f);if(!html.includes(f.h+":"+String(f.m).padStart(2,"0")))falha(37,"html")}
  else if(t==="duracao"){const m=p.pre.match(/^.+ começou às (\d+:\d\d) e terminou às (\d+:\d\d)\. Quantas horas durou\?$/);if(!m){falha(37,"pergunta: "+p.pre);continue}
   const a=mm(m[1]),b=mm(m[2]);if(b<=a||(b-a)%60!==0||p.a!==(b-a)/60||p.a<1||p.a>4||a<360||b>22*60+30)falha(37,"duração: "+p.pre+" → "+p.a)}
  else if(t==="fim"){const m=p.pre.match(/^.+ começou às (\d+:\d\d) e durou (\d) (hora|horas)\. A que horas terminou\?$/);if(!m){falha(37,"pergunta: "+p.pre);continue}
   const a=mm(m[1]),d=+m[2],op=p.extra.opts;if(d<1||d>3||(d===1)!==(m[3]==="hora")||op[p.a-1]!==fmt(a+d*60)||new Set(op).size!==3||op.length!==3)falha(37,"hora final: "+p.pre+" → "+op[p.a-1])}
  else{const m=p.pre.match(/^.+ começou às (\d+:\d\d) e terminou às (\d+:\d\d)\. Quantos minutos durou\?$/);if(!m){falha(37,"pergunta: "+p.pre);continue}
   const a=mm(m[1]),b=mm(m[2]);if(b-a!==30||p.a!==30||a<360||b>22*60)falha(37,"meia hora: "+p.pre+" → "+p.a)}
  if(!/^(A aula|O recreio|O filme|O jogo|A festa|O lanche|A visita) /.test(p.pre)&&t!=="ler")falha(37,"evento: "+p.pre);
 }
 console.log("nível 37:",JSON.stringify(tp));for(const k of Object.keys(tp))if(Math.abs(tp[k]/N-.25)>.04)falha(37,"tipo "+k)}
const valorCent=x=>x.k==="moeda"?x.v:x.v*100;
{const its=draw(G.g2n38),tp={total:0,equiv:0,conjunto:0};
 for(const p of its){const t=p._info.tipo;tp[t]++;
  if(t==="total"){const it=p.extra.fig.items,tot=it.reduce((a,x)=>a+x.v,0);if(it.length<2||it.length>5||it.some(x=>x.k!=="moeda"||![5,10,25,50].includes(x.v))||tot>100||tot<15||p.a!==tot||p.post!=="centavos")falha(38,"total: "+JSON.stringify(it)+" → "+p.a)}
  else if(t==="equiv"){const m=p.pre.match(/^Quantas moedas de (\d+) centavos valem uma moeda de (\d+ centavos|1 real)\?$/);if(!m){falha(38,"pergunta: "+p.pre);continue}const a=+m[1],b=m[2]==="1 real"?100:parseInt(m[2]);if(b%a||p.a!==b/a||![5,10,25,50].includes(a)||b<=a)falha(38,"equivalência: "+p.pre+" → "+p.a)}
  else{const op=p.extra.opts,sums=op.map(o=>o.fig.items.reduce((a,x)=>a+x.v,0));if(sums[p.a-1]!==50||sums.filter(x=>x===50).length!==1||op.length!==3||op.some(o=>o.fig.items.length<2||o.fig.items.length>5||o.fig.items.some(x=>x.k!=="moeda"||x.v===100))||sums.some(x=>x>100))falha(38,"conjunto: "+sums+" → "+p.a)}
 }
 console.log("nível 38:",JSON.stringify(tp));for(const k of["total","equiv"])if(Math.abs(tp[k]/N-.375)>.04)falha(38,"proporção "+k)}
{const its=draw(G.g2n39),tp={total:0,equiv:0,conjunto:0};const reais=x=>x.k==="moeda"?1:x.v;
 for(const p of its){const t=p._info.tipo;tp[t]++;
  if(t==="total"){const it=p.extra.fig.items,tot=it.reduce((a,x)=>a+reais(x),0);if(it.length<2||it.length>4||it.some(x=>!(x.k==="moeda"&&x.v===100)&&!(x.k==="cedula"&&[2,5,10,20,50].includes(x.v)))||tot>100||tot<3||p.a!==tot||p.post!=="reais")falha(39,"total: "+JSON.stringify(it)+" → "+p.a)}
  else if(t==="equiv"){const m=p.pre.match(/^Quantas cédulas de (\d+) reais valem uma de (\d+) reais\?$/);if(!m){falha(39,"pergunta: "+p.pre);continue}const a=+m[1],b=+m[2];if(b%a||p.a!==b/a||b<=a)falha(39,"equivalência: "+p.pre+" → "+p.a)}
  else{const T=p._info.T,m=p.pre.match(/^Qual conjunto vale o mesmo que uma cédula de (\d+) reais\?$/);if(!m||+m[1]!==T){falha(39,"pergunta: "+p.pre);continue}const op=p.extra.opts,sums=op.map(o=>o.fig.items.reduce((a,x)=>a+reais(x),0));
   if(sums[p.a-1]!==T||sums.filter(x=>x===T).length!==1||op.length!==3||op.some(o=>o.fig.items.length<2||o.fig.items.length>5))falha(39,"conjunto: "+sums+" → "+p.a+" T="+T)}
 }
 console.log("nível 39:",JSON.stringify(tp));for(const k of["total","equiv"])if(Math.abs(tp[k]/N-.375)>.04)falha(39,"proporção "+k)}
{const FR={"certo":["O Sol vai nascer amanhã.","Depois da terça-feira vem a quarta-feira.","Uma semana tem sete dias.","Se hoje é segunda-feira, amanhã é terça-feira.","A água do mar é salgada.","Um ano tem doze meses."],
  "muito provável":["A professora vai chegar à escola amanhã.","Vai fazer calor no verão.","Você vai dormir esta noite.","O ônibus escolar vai passar hoje.","Uma criança sentir fome antes do jantar.","Alguém usar guarda-chuva num dia de chuva forte."],
  "pouco provável":["Amanhã vai chover no deserto do Saara.","Você encontrar um tesouro no quintal.","Ganhar o prêmio de uma rifa com mil bilhetes.","Nevar hoje na cidade de Recife.","Um passarinho pousar na sua mão agora.","Encontrar um trevo de quatro folhas por acaso."],
  "impossível":["Um cachorro falar português.","Uma pessoa viver 300 anos.","Depois da segunda-feira vir a quinta-feira.","Um dado comum mostrar o número 9.","Uma semana ter dez dias.","Uma pedra solta no ar subir sozinha."]};
 const its=draw(G.g2n40),tp={saco:0,frase:0},cl={},CLS=["impossível","pouco provável","muito provável","certo"];
 for(const p of its){const op=p.extra.opts,t=p._info.tipo;tp[t]++;
  if(op.length!==4||CLS.some(c=>!op.includes(c)))falha(40,"as quatro classes devem ser as opções: "+op);
  const dada=op[p.a-1];cl[dada]=(cl[dada]||0)+1;
  if(t==="saco"){const f=p.extra.fig,m=p.pre.match(/^Vou tirar uma bola (vermelha|azul) sem olhar\. Isso é…$/);if(!m||f.t!=="bolas"){falha(40,"pergunta: "+p.pre);continue}
   const cor=m[1]==="vermelha"?"r":"a",n=f.balls.length,k=f.balls.filter(b=>b===cor).length;
   if(n<4||n>10)falha(40,"bolas fora de 4 a 10");
   const esp=k===0?"impossível":k===n?"certo":k/n<=.25?"pouco provável":k/n>=.75?"muito provável":"?";
   if(esp==="?"||dada!==esp)falha(40,"classe: "+k+"/"+n+" → "+dada+" (esperado "+esp+")");
   const html=FC.fig(f);if((html.match(/<circle/g)||[]).length!==n)falha(40,"bolas desenhadas")}
  else{const fr=p.pre.replace(/ Isso é…$/,""),c=Object.keys(FR).filter(k=>FR[k].includes(fr));if(c.length!==1||c[0]!==dada)falha(40,"frase: "+fr+" → "+dada+" (banco "+c+")")}
 }
 console.log("nível 40: saco",(100*tp.saco/N).toFixed(0)+"%, frase",(100*tp.frase/N).toFixed(0)+"%, classes",JSON.stringify(cl));
 for(const c of CLS)if(Math.abs((cl[c]||0)/N-.25)>.04)falha(40,"classe "+c+" fora de 25%");if(Math.abs(tp.saco/N-.625)>.04)falha(40,"proporção saco")}
{const its=draw(G.g2n41),tp={1:0,2:0,3:0};let tab=0;
 for(const p of its){const f=p.extra.fig,t=p._info.tipo;tp[t]++;
  if(f.t==="tabela2"){tab++;
   if(f.rows.length!==2||f.cols.length!==3||f.v.length!==2||f.v.some(r=>r.length!==3||r.some(x=>x<1||x>15)))falha(41,"tabela fora do formato");
   const html=FC.fig(f);if(((html.match(/<td>/g)||[]).length)!==6)falha(41,"células da tabela");
   let m;
   if(t===1){m=p.pre.match(/^Quantas crianças da (Turma [AB]) escolheram (\S+)\?$/);if(!m||p.a!==f.v[f.rows.indexOf(m[1])][f.cols.indexOf(m[2])])falha(41,"célula: "+p.pre+" → "+p.a)}
   else if(t===2){m=p.pre.match(/^Qual opção a (Turma [AB]) mais escolheu\?$/);const row=f.v[f.rows.indexOf(m[1])],mx=Math.max(...row);if(row.filter(x=>x===mx).length!==1||p.extra.opts[p.a-1]!==f.cols[row.indexOf(mx)]||p.extra.opts.length!==3)falha(41,"maior: "+p.pre)}
   else if((m=p.pre.match(/^Quantas crianças a mais da (Turma [AB]) do que da (Turma [AB]) escolheram (\S+)\?$/))){const c=f.cols.indexOf(m[3]),a=f.v[f.rows.indexOf(m[1])][c],b=f.v[f.rows.indexOf(m[2])][c];if(a<=b||p.a!==a-b)falha(41,"diferença: "+p.pre+" → "+p.a+" "+a+" "+b)}
   else if((m=p.pre.match(/^Quantas crianças das duas turmas juntas escolheram (\S+)\?$/))){const c=f.cols.indexOf(m[1]);if(p.a!==f.v[0][c]+f.v[1][c]||p.a>30)falha(41,"soma: "+p.pre)}
   else falha(41,"pergunta: "+p.pre)}
  else{if(f.t!=="bars"||f.labels.length<3||f.labels.length>5||f.values.some(x=>x<1||x>10))falha(41,"gráfico fora do formato");let m;
   if(t===1){m=p.pre.match(/^Quantas crianças escolheram (\S+)\?$/);if(!m||p.a!==f.values[f.labels.indexOf(m[1])])falha(41,"barra: "+p.pre+" → "+p.a)}
   else if(t===2){const mx=Math.max(...f.values),op=p.extra.opts;if(f.values.filter(x=>x===mx).length!==1||op[p.a-1]!==f.labels[f.values.indexOf(mx)]||op.length<3||op.length>4||new Set(op).size!==op.length)falha(41,"maior barra: "+op)}
   else if((m=p.pre.match(/^Quantas crianças a mais escolheram (\S+) do que (\S+)\?$/))){const a=f.values[f.labels.indexOf(m[1])],b=f.values[f.labels.indexOf(m[2])];if(a<=b||p.a!==a-b)falha(41,"diferença: "+p.pre+" → "+p.a)}
   else if((m=p.pre.match(/^Quantas crianças escolheram (\S+) ou (\S+)\?$/))){const a=f.values[f.labels.indexOf(m[1])],b=f.values[f.labels.indexOf(m[2])];if(m[1]===m[2]||p.a!==a+b)falha(41,"soma: "+p.pre)}
   else falha(41,"pergunta: "+p.pre)}
 }
 console.log("nível 41: tipos",JSON.stringify(tp),"tabela",(100*tab/N).toFixed(0)+"%");if(Math.abs(tab/N-2/3)>.04)falha(41,"tabela x gráfico");
 if(Math.abs(tp[1]/N-.375)>.04||Math.abs(tp[2]/N-.375)>.04)falha(41,"proporções")}

/* ---- Folhas: 10 contas, sem repetição, com os limites de cada nível ---- */
for(const g of FC.G2){
  let rep=0,estouro=0,tam=0;
  for(let i=0;i<1500;i++){
    FC.LEVELS=[{gen:G.g2n08.gen},{gen:g.gen}];const todas=FC.makeItems(1),it=todas.filter(p=>!p._rev);
    if(todas.length!==10||it.length!==8)tam++;
    if(new Set(todas.map(FC.itemKey)).size<10)rep++;
    const c={};for(const p of it)for(const l of (p.limits||(p.grp?[[p.grp,p.cap]]:[]))){c[l[0]]=(c[l[0]]||0)+1;if(c[l[0]]>l[1])estouro++}
  }
  console.log("nível "+g.nivel+": folhas sem 8+2 contas "+tam+"; com conta repetida "+rep+"; acima de um limite "+estouro+" (de 1500)");
  if(tam)falha(g.nivel,tam+" folhas sem 8 contas do nível e 2 de revisão");
  if(rep)falha(g.nivel,rep+" folhas com conta repetida");
  if(estouro)falha(g.nivel,estouro+" estouros de limite");
}
{ // nível 5: no máximo 1 par de algarismos trocados por folha
 let ruim=0;
 for(let i=0;i<1500;i++){const it=niv(G.g2n05).filter(p=>p._info&&p._info.modo==="troca");if(it.length>1)ruim++}
 console.log("nível 5: folhas com mais de 1 par de algarismos trocados",ruim);if(ruim)falha(5,ruim+" folhas com 2 ou mais pares trocados")}
for(const g of FC.G2)if(!(g.meta>=60&&g.meta<=180))falha(g.nivel,"meta de tempo fora do esperado");

console.log(falhas?("\n"+falhas+" falha(s)"):"\nsem falhas");process.exit(falhas?1:0);
