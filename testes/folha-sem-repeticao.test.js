/* Folha sem conta repetida em níveis de poucas combinações (nível 111: 3 tipos com limite 3, 3 e 2 e só 16 contas possíveis, com a revisão ocupando vagas dos mesmos grupos).
   Antes, ~0,13% das folhas caíam no último recurso e repetiam conta. Rodar com: node testes/folha-sem-repeticao.test.js */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');require('../grade1.js');require('../grade2.js');require('../grade3.js');require('../grade4.js');require('../plano.js');
const FC=global.FC;let rep=0;const N=60000,IDX=FC.LEVELS.findIndex(l=>l.id==="111");
if(IDX<0){console.log("  FALHA nível 111 não encontrado");process.exit(1)}
for(let k=0;k<N;k++){const it=FC.makeItems(IDX);if(it.length!==10||new Set(it.map(FC.itemKey)).size<10)rep++}
console.log(rep?"  FALHA "+rep+" de "+N+" folhas do nível 111 com conta repetida":"folha-sem-repeticao: tudo certo");process.exit(rep?1:0);
