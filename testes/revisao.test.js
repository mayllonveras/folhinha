/* Teste da revisão da folha (etapa 4a). Rodar com: node testes/revisao.test.js
   - fora do nível 0, 2 das 10 contas vêm de níveis anteriores (60% dos 3 últimos, 40% de qualquer anterior);
   - no teto, a folha é toda de revisão (inclui o nível atual); o reforço (até 4) é mantido;
   - nunca repete conta na folha; a marca de revisão não vai para o banco. */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');
const FC=global.FC;
let falhas=0;const falha=m=>{falhas++;console.log("  FALHA",m)};
FC.LEVELS=Array.from({length:12},(_,i)=>({gen:()=>({pre:"N"+i+" #"+Math.floor(Math.random()*100000),post:"",a:1})}));
const nivel=p=>Number(p.pre.slice(1).split(" ")[0]);
const weak=n=>Array.from({length:n},(_,i)=>({pre:"W"+i,post:"",a:1}));
const folhas=3000;

// nível 0: sem revisão
for(let i=0;i<200;i++){const it=FC.makeItems(0);if(it.length!==10||it.some(p=>p._rev))falha("nível 0 não deveria ter revisão")}
for(let i=0;i<200;i++){const it=FC.makeItems(0,null,{teto:true});if(it.some(p=>p._rev))falha("nível 0 no teto não tem o que revisar")}

// folha comum no nível 8
let dist={1:0,2:0,3:0,antes:0},total=0;
for(let i=0;i<folhas;i++){
  const it=FC.makeItems(8);
  if(it.length!==10)falha("folha sem 10 contas");
  const rev=it.filter(p=>p._rev);
  if(rev.length!==2)falha("folha com "+rev.length+" contas de revisão (esperado 2)");
  for(const p of rev){const lv=nivel(p);total++;if(lv>=8)falha("revisão do nível "+lv+" no nível 8");const k=8-lv;if(k<=3)dist[k]++;else dist.antes++}
  if(it.filter(p=>!p._rev&&nivel(p)!==8).length)falha("conta fora do nível e fora da revisão");
  if(new Set(it.map(FC.itemKey)).size<10)falha("conta repetida na folha");
}
const share3=(dist[1]+dist[2]+dist[3])/total;
console.log("revisão dos 3 últimos níveis:",(100*share3).toFixed(1)+"% (esperado ~75%: 60% + 3/8 dos 40% restantes)");
if(share3<.65||share3>.82)falha("distribuição dos 3 últimos fora do esperado: "+share3);
if(dist[1]<dist[3])falha("o nível anterior deveria ser mais sorteado que o terceiro anterior");

// reforço: até 4 contas de reforço, e o resto se ajusta
for(const w of [0,2,4]){
  const it=FC.makeItems(8,weak(w));
  if(it.length!==10)falha("folha com reforço de "+w+" sem 10 contas");
  if(it.filter(p=>p.pre[0]==="W").length!==w)falha("reforço de "+w+" perdido");
  if(it.filter(p=>p._rev).length!==2)falha("revisão perdida com reforço de "+w);
}
const capado=FC.makeItems(8,weak(9));
if(capado.filter(p=>p.pre[0]==="W").length>6)falha("reforço passou do limite que deixa 2 contas do nível");

// teto: toda de revisão, com o nível atual incluído
let atual=0,tot=0;
for(let i=0;i<folhas;i++){
  const it=FC.makeItems(8,null,{teto:true});
  if(it.length!==10||it.some(p=>!p._rev))falha("folha do teto deveria ser toda de revisão");
  if(new Set(it.map(FC.itemKey)).size<10)falha("conta repetida na folha do teto");
  for(const p of it){tot++;if(nivel(p)===8)atual++;if(nivel(p)>8)falha("revisão do teto de nível futuro")}
}
console.log("teto: contas do próprio nível:",(100*atual/tot).toFixed(1)+"% (esperado ~20% + uma fatia dos 35% restantes)");
if(atual/tot<.15||atual/tot>.35)falha("parcela do nível atual no teto fora do esperado: "+atual/tot);
const tw=FC.makeItems(8,weak(4),{teto:true});
if(tw.filter(p=>p.pre[0]==="W").length!==4||tw.length!==10)falha("reforço no teto");

// a marca de revisão não vai para o banco
if("_rev" in FC.plainItem({pre:"x",post:"",a:1,_rev:true}))falha("plainItem deixou a marca de revisão");

console.log(falhas?("\n"+falhas+" falha(s)"):"\nsem falhas");process.exit(falhas?1:0);
