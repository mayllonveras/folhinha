/* Testes da grade ligada ao app (FC.LEVELS). Rodar com: node testes/grade.test.js
   Confere os 35 níveis, as metas de tempo contra a migração do banco, e que cada nível monta folhas completas e sem repetição
   (com as 2 contas de revisão dos níveis anteriores). */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');require('../grade1.js');
const FC=global.FC,fs=require('fs');
let falhas=0;const falha=m=>{falhas++;if(falhas<30)console.log("  FALHA",m)};
const L=FC.LEVELS;
if(L.length!==35)falha("a grade deveria ter 35 níveis, tem "+L.length);
L.forEach((l,i)=>{
  if(l.id!==String(i+1))falha("id do nível "+i+" é "+l.id);
  if(!l.group||!l.name||!l.hint)falha("nível "+l.id+" sem grupo, nome ou dica");
  if(!(l.target>=60&&l.target<=180))falha("meta do nível "+l.id+": "+l.target);
  if(typeof l.gen!=="function")falha("nível "+l.id+" sem gerador");
  if(l.ano!==1)falha("nível "+l.id+" não é do 1º ano");
  if(/^Nível/.test(l.name))falha("nome com prefixo: "+l.name);
});
// os blocos ficam na ordem e juntos
const grupos=L.map(l=>l.group);for(let i=1;i<grupos.length;i++)if(grupos[i]!==grupos[i-1]&&grupos.indexOf(grupos[i])<i)falha("grupo "+grupos[i]+" aparece em dois pedaços");
if(!L[15].intro||!/mão esquerda/.test(L[15].intro))falha("o nível 16 precisa do lembrete das mãos");
// metas iguais às da migração do banco
const sql=fs.readFileSync(__dirname+'/../migracoes/2026-11-14-grade-1ano.sql','utf8');
const linhas=[...sql.matchAll(/\((\d+), '(\d+)', (\d+), (\d+)\)/g)].map(m=>({idx:+m[1],code:m[2],target:+m[3],ano:+m[4]}));
if(linhas.length!==35)falha("a migração tem "+linhas.length+" níveis");
linhas.forEach(r=>{const l=L[r.idx];if(!l||l.id!==r.code||l.target!==r.target||l.ano!==r.ano)falha("migração diverge no nível "+r.code+": "+JSON.stringify(r)+" x "+(l&&l.id+","+l.target+","+l.ano))});
// cada nível monta folhas completas e sem repetição, sozinho e com revisão
const visual=p=>p.key||(p.pre+"|"+(p.post||"")+"|"+JSON.stringify(p.extra||"",(k,v)=>k==="color"||k==="k"?undefined:v));
for(let i=0;i<L.length;i++){
  let rep=0,rev=0,tot=0;
  for(let n=0;n<200;n++){
    const it=FC.makeItems(i);
    if(it.length!==10)falha("nível "+L[i].id+": folha sem 10 contas");
    if(new Set(it.map(FC.itemKey)).size<10)rep++;
    const r=it.filter(p=>p._rev).length;rev+=r;tot++;
    if(i===0&&r)falha("o nível 1 não tem revisão");
    if(i>0&&r!==2)falha("nível "+L[i].id+": "+r+" contas de revisão (esperado 2)");
    for(const p of it){const q=FC.plainItem(p);if(!Number.isInteger(q.a))falha("resposta não inteira no nível "+L[i].id);
      if(q.extra&&q.extra.opts&&!(q.a>=1&&q.a<=q.extra.opts.length))falha("resposta fora das opções no nível "+L[i].id);
      if(q.extra&&q.extra.fig)FC.fig(q.extra.fig)}
  }
  if(rep)falha("nível "+L[i].id+": "+rep+" folhas com conta repetida");
}
console.log("níveis conferidos:",L.length,"; metas iguais às da migração:",linhas.length);
console.log(falhas?("\n"+falhas+" falha(s)"):"\nsem falhas");process.exit(falhas?1:0);
