/* Teste da montagem da folha: nenhuma conta repetida na mesma folha. Rodar com: node testes/folha.test.js
   "Repetida" = mesma pergunta, mesma figura (ignorando a cor) e mesma resposta certa, mesmo que as opções estejam em outra ordem.
   Geradores com menos de 10 contas distintas não conseguem encher uma folha sozinhos: precisam ser misturados na grade. */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');
const FC=global.FC;
const sc=f=>f?JSON.stringify(f,(k,v)=>k==="color"?undefined:v):"";
function visual(p){const ex=p.extra||{};if(!ex.opts)return p.pre+"|"+(p.post||"")+"|"+sc(ex.fig);return p.pre+"|"+sc(ex.fig)+"|"+sc(ex.opts[p.a-1])}
let falhas=0;const falha=m=>{falhas++;console.log("  FALHA",m)};
function repetidas(gen,folhas,keep){FC.LEVELS=[{gen}];let n=0;
  for(let s=0;s<folhas;s++){const itens=FC.makeItems(0,keep&&keep());const ks=itens.map(visual);if(new Set(ks).size<ks.length)n++}return n}
console.log("gerador        contas distintas   folhas com repetição (de 1500)");
const pouca=[];
for(const e of FC.EX){
  const set=new Set();for(let i=0;i<6000;i++)set.add(visual(e.gen()));
  const rep=repetidas(e.gen,1500);
  console.log((e.id+"               ").slice(0,14),String(set.size).padStart(8),"            ",String(rep).padStart(5));
  if(set.size>=10&&rep>0)falha(e.id+": tem "+set.size+" contas distintas mas "+rep+" folhas repetiram");
  if(set.size<10)pouca.push(e.id+" ("+set.size+")");
}
console.log("\nPrecisam ser misturados com outros na grade (menos de 10 contas distintas):",pouca.join(", ")||"nenhum");
// misturar resolve: poucos geradores juntos enchem a folha sem repetir
const mist=ids=>()=>{const e=FC.EXBY[ids[Math.floor(Math.random()*ids.length)]];return e.gen()};
const r1=repetidas(mist(["formaPlana","sólidoNome","relogio","acaso"]),1500);
console.log("mistura de 4 geradores pouco variados -> folhas com repetição:",r1,"de 1500");
if(r1>0)falha("a mistura de geradores ainda repete na folha");
// reforço: a conta em reforço volta com as opções na ordem que a criança viu e não é repetida por uma equivalente
const fixa=FC.EXBY.relogio2.gen();
const rk=repetidas(FC.EXBY.relogio2.gen,1500,()=>[FC.plainItem(fixa)]);
console.log("folhas com a conta de reforço repetida por uma equivalente:",rk,"de 1500");
if(rk>0)falha("o reforço foi repetido por conta equivalente");
console.log(falhas?"\n"+falhas+" falha(s)":"\nsem falhas");process.exit(falhas?1:0);
