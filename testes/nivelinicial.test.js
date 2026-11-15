/* Nível inicial pelo ano escolar (core.js): o cadastro dos pais só pede o ano e começa pelo primeiro nível dele. Rodar com: node testes/nivelinicial.test.js */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');require('../grade1.js');require('../grade2.js');require('../grade3.js');
const FC=global.FC;let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
const anos=FC.anosComGrade();
ok(anos.join()==="1,2,3","anos com grade: "+anos);
anos.forEach(a=>{
  const i=FC.primeiroNivelDoAno(a);
  ok(i>=0&&FC.LEVELS[i].ano===a,"nível inicial do "+a+"º ano");
  ok(i===0||FC.LEVELS[i-1].ano<a,"é o primeiro nível do "+a+"º ano");
});
ok(FC.primeiroNivelDoAno(1)===0,"1º ano começa no índice 0");
ok(FC.primeiroNivelDoAno(2)===35&&FC.primeiroNivelDoAno(3)===76,"2º no índice 35 e 3º no 76");
ok(FC.primeiroNivelDoAno(4)===-1&&FC.primeiroNivelDoAno(9)===-1,"anos sem grade devolvem -1");
console.log(falhas?"\n"+falhas+" falha(s)":"nivelinicial: tudo certo");process.exit(falhas?1:0);
