/* Tipo do dia (core.js): de estudo, livre ou descanso, conforme os dias do aluno. Rodar com: node testes/dialivre.test.js */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');
const FC=global.FC;let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
// 2026-11-14 é sábado, 15 domingo, 16 segunda
const s={start_date:"2026-11-01",study_days:[1,2,3,4,5],free_days:[0,6]};
ok(FC.dayKind(s,"2026-11-16")==="study","segunda é de estudo");
ok(FC.dayKind(s,"2026-11-14")==="free","sábado é livre");
ok(FC.dayKind(s,"2026-11-15")==="free","domingo é livre");
ok(FC.dayKind({...s,free_days:[]},"2026-11-15")==="rest","sem dias livres, domingo é descanso");
ok(FC.dayKind({...s,free_days:undefined},"2026-11-15")==="rest","aluno sem a coluna (banco antigo): descanso");
ok(FC.dayKind(s,"2026-10-31")==="rest","antes do início é descanso");
ok(FC.dayKind({...s,study_days:[0,1,2,3,4,5],free_days:[0,6]},"2026-11-15")==="study","dia de estudo vence o livre");
ok(FC.streakNow({...s,last_streak_day:"2026-11-13",streak:4},"2026-11-15")===4,"fim de semana livre não zera a sequência (sexta fechada, domingo ainda vale)");
ok(FC.streakNow({...s,last_streak_day:"2026-11-12",streak:4},"2026-11-15")===0,"faltar a um dia de estudo zera");
console.log(falhas?"\n"+falhas+" falha(s)":"dialivre: tudo certo");process.exit(falhas?1:0);
