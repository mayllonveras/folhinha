/* Pausa na folha: o relógio para durante a pausa até o limite por folha; depois volta a contar. Rodar com: node testes/pausa.test.js */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
global.history={state:null,pushState(){},replaceState(){},back(){},forward(){}};
vm.runInThisContext(fs.readFileSync(path.join(root,"core.js"),"utf8"),{filename:"core.js"});
const FC=global.FC;let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
const MIN=60000,CAP=15*MIN;
// sem pausa: tempo corrido
let o={t0:0,pauseMs:0,pauseAt:null};
ok(FC.elapsedMs(o,5*MIN,CAP)===5*MIN,"sem pausa o tempo corre");
// pausa de 4 min no minuto 2: em andamento, o relógio fica parado em 2 min
o={t0:0,pauseMs:0,pauseAt:2*MIN};
ok(FC.elapsedMs(o,3*MIN,CAP)===2*MIN&&FC.elapsedMs(o,6*MIN,CAP)===2*MIN,"durante a pausa o relógio fica parado");
// depois de retomar com 4 min descontados, aos 10 min corridos valem 6 min
o={t0:0,pauseMs:4*MIN,pauseAt:null};
ok(FC.elapsedMs(o,10*MIN,CAP)===6*MIN,"pausa terminada desconta o tempo parado");
// pausa maior que o limite: depois de 15 min o relógio volta a contar
o={t0:0,pauseMs:0,pauseAt:2*MIN};
ok(FC.pauseCredit(o,2*MIN+20*MIN,CAP)===CAP,"o desconto da pausa não passa do limite");
ok(FC.elapsedMs(o,2*MIN+20*MIN,CAP)===2*MIN+5*MIN,"passou do limite: o relógio volta a contar (20 min de pausa = 15 descontados + 5 contados)");
// limite por folha vale somando as pausas
o={t0:0,pauseMs:10*MIN,pauseAt:30*MIN};
ok(FC.pauseCredit(o,60*MIN,CAP)===5*MIN,"o limite é por folha: já havia 10 min descontados, só restam 5");
ok(FC.elapsedMs({t0:0,pauseMs:CAP,pauseAt:null},CAP+MIN,CAP)===MIN,"com o limite todo usado, a pausa seguinte não desconta mais nada");
// nunca negativo
ok(FC.elapsedMs({t0:100,pauseMs:0,pauseAt:50},120,CAP)===0,"nunca negativo");
// código do aplicativo
const st=fs.readFileSync(path.join(root,"student.js"),"utf8"),am=fs.readFileSync(path.join(root,"admin.js"),"utf8"),mig=fs.readFileSync(path.join(root,"migracoes","2026-11-15-pausa-na-folha.sql"),"utf8");
ok(/id="btnPause"/.test(st)&&/function startPause\(/.test(st)&&/function endPause\(/.test(st),"botão de pausa, pausar e continuar");
ok(/startPause\("auto"\)/.test(st),"sair do app ou bloquear o celular pausa sozinho");
ok(/classList\.add\("paused"\)/.test(st)&&/\.paper\.paused\{visibility:hidden\}/.test(fs.readFileSync(path.join(root,"style.css"),"utf8")),"na pausa as contas ficam escondidas");
ok(/fc_draft_/.test(st)&&/function restoreDraft\(/.test(st)&&/function saveDraft\(/.test(st),"rascunho da folha guardado no aparelho");
ok(/clearDraft\(\);\n  FC\.tabState\.aluno="inicio"/.test(st),"rascunho apagado quando a folha é entregue");
ok(/cur\.secs=Math\.min\(elapsedMs\(\)\/1000,14000\)/.test(st),"tempo enviado é o líquido (sem pausa) e nunca passa de 14000 s");
ok(/folha_pausa/.test(st)&&/folha_retomada/.test(st)&&/descontada_s/.test(st),"pausas registradas nos dados de uso");
ok(/Fazer uma pausa/.test(st)&&/lvPause/.test(st),"voltar na folha oferece fazer uma pausa");
ok(/pausa_max_min/.test(am)&&/pausa_max_min/.test(mig)&&/pausa_max_s/.test(mig),"limite de pausa editável no /adm e devolvido pelo banco");
ok(/capMs\(\)\{return \(\(S\.me&&S\.me\.pausa_max_s\)\|\|900\)/.test(st),"sem a migração o app usa 15 minutos");
console.log(falhas?"\n"+falhas+" falha(s)":"pausa: tudo certo");process.exit(falhas?1:0);
