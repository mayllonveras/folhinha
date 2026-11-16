/* Rodízio de tipos e rampa de dificuldade (plano.js), níveis do 3º e do 4º ano. Rodar com: node testes/plano.test.js
   Para cada nível: em cada dia de 5 folhas todos os tipos aparecem (garantido, não sorteado); a dificuldade média nunca desce da folha 1 à 5;
   dentro de cada folha as contas do nível vão do mais fácil ao mais difícil; cada folha tem 10 contas sem repetição e 2 de revisão. */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');require('../grade1.js');require('../grade2.js');require('../grade3.js');require('../grade4.js');require('../plano.js');
const FC=global.FC;let falhas=0;const falha=m=>{falhas++;if(falhas<40)console.log("  FALHA",m)};
const DIAS=Number(process.env.DIAS||120);
const L=FC.LEVELS,idx4=L.map((l,i)=>l.ano>=3?i:-1).filter(i=>i>=0);
if(idx4.length!==88)falha("88 níveis (3º e 4º ano) com espec");
let semTipo=0,resumo=[];
for(const i of idx4){
  const E=L[i].espec;if(!E||!E.tipos.length||typeof E.tipo!=="function"||typeof E.nota!=="function"){falha("nível "+L[i].id+" sem espec");continue}
  if(!E.ordem||E.ordem.length!==E.tipos.length||[...E.ordem].sort((a,b)=>a-b).some((v,j)=>v!==j))falha("nível "+L[i].id+": ordem dos tipos não é uma permutação");
  for(let n=0;n<300;n++){const q=L[i].gen();if(!Number.isFinite(E.nota(q))){falha("nível "+L[i].id+": nota não é um número: "+q.pre);break}}
  const T=E.tipos.length,medias=[0,0,0,0,0];let faltou=0,desceu=0,fora=0,rep=0,revErr=0,tam=0;
  for(let d=0;d<DIAS;d++){
    const vistos=new Set(),pm=[];
    for(let s=0;s<5;s++){
      const it=FC.makeItems(i,null,{sheetNo:s});
      if(it.length!==10)tam++;
      if(new Set(it.map(FC.itemKey)).size<10)rep++;
      if(it.filter(p=>p._rev).length!==2)revErr++;
      if(!it.ordenada)fora++;
      const nivel=it.filter(p=>!p._rev);
      nivel.forEach(p=>{const t=E.tipo(p);if(!(t>=0&&t<T)){semTipo++}else vistos.add(t)});
      const ps=nivel.map(p=>p._p);
      for(let a=1;a<ps.length;a++)if(ps[a]<ps[a-1])fora++;
      pm.push(ps.reduce((a,b)=>a+b,0)/ps.length);
    }
    if(vistos.size!==T)faltou++;
    pm.forEach((v,s)=>medias[s]+=v/DIAS);
  }
  for(let s=1;s<5;s++)if(medias[s]<medias[s-1]-0.02)desceu++;
  if(faltou)falha("nível "+L[i].id+": em "+faltou+" de "+DIAS+" dias algum tipo não apareceu nas 5 folhas");
  if(desceu)falha("nível "+L[i].id+": a dificuldade média desce entre folhas: "+medias.map(x=>Math.round(x*100)).join(" → "));
  if(medias[4]-medias[0]<.25)falha("nível "+L[i].id+": rampa fraca: "+medias.map(x=>Math.round(x*100)).join(" → "));
  if(fora)falha("nível "+L[i].id+": contas fora de ordem ("+fora+")");
  if(rep)falha("nível "+L[i].id+": "+rep+" folhas com conta repetida");
  if(revErr)falha("nível "+L[i].id+": folha sem 2 contas de revisão");
  if(tam)falha("nível "+L[i].id+": folha sem 10 contas");
  resumo.push(L[i].id+": "+medias.map(x=>Math.round(x*100)).join(" → ")+" ("+T+" tipo"+(T>1?"s":"")+")");
}
if(semTipo)falha("contas com tipo fora da lista: "+semTipo);
// níveis sem espec seguem o sorteio livre, sem a ordenação
const f=FC.makeItems(5,null,{sheetNo:0});if(f.ordenada||f.length!==10)falha("nível do 1º ano deve seguir o sorteio livre");
// teto: folha de revisão do 4º ano não usa o rodízio
const t=FC.makeItems(idx4[3],null,{teto:true,sheetNo:2});if(t.ordenada||t.length!==10)falha("folha de revisão do teto não usa o rodízio");
if(process.env.VERBOSO)console.log(resumo.join("\n"));
console.log(falhas?"\n"+falhas+" falha(s)":"plano: tudo certo ("+DIAS+" dias por nível)");process.exit(falhas?1:0);
