/* Primeiros passos do adulto (onboarding.js): passos do checklist, passeio guiado, estado salvo por conta e vídeo opcional. Rodar com: node testes/onboarding.test.js */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};
const mem={};global.localStorage={getItem:k=>k in mem?mem[k]:null,setItem:(k,v)=>{mem[k]=String(v)}};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../onboarding.js');
const OB=global.FC.onboarding;let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
const ids=s=>s.filter(x=>x.done).map(x=>x.id).join(",");
/* checklist */
let s=OB.steps({n:0,sheets:0,shared:false});
ok(ids(s)==="","conta nova: nada feito");ok(OB.next(s).id==="aluno","o primeiro passo é cadastrar o aluno");
s=OB.steps({n:1,sheets:0,shared:false});ok(ids(s)==="aluno","com aluno: só o cadastro feito");ok(OB.next(s).id==="link","depois vem enviar o link");
s=OB.steps({n:1,sheets:0,shared:true});ok(ids(s)==="aluno,link","link enviado conta");ok(OB.next(s).id==="folha","depois vem a primeira folha");
s=OB.steps({n:1,sheets:3,shared:false});ok(ids(s)==="aluno,link,folha","folha feita implica link enviado (o aluno já entrou)");ok(OB.next(s)===null,"tudo feito: sem próximo passo");
s=OB.steps({n:0,sheets:2,shared:true});ok(ids(s)==="folha","sem aluno, link não conta como feito");
const p=OB.progress(OB.steps({n:1,sheets:0,shared:false}));ok(p.done===1&&p.total===3&&p.pct===33,"progresso 1 de 3: "+JSON.stringify(p));
/* passeio */
const t0=OB.tour(false,"Mayllon Veras"),t1=OB.tour(true,"");
ok(t0.length<=6&&t1.length<=7,"passeio curto: "+t0.length+" e "+t1.length+" passos");
ok(t0[0].title==="Bem-vindo, Mayllon!"&&t1[0].title==="Bem-vindo!","saudação com o primeiro nome, se houver");
ok(!t0.some(x=>x.sel===".card"||x.sel==="[data-qr]"),"sem alunos, o passeio não aponta cartão nem QR");
ok(t1.some(x=>x.sel===".card")&&t1.some(x=>x.sel==="[data-qr]"),"com alunos, aponta cartão e QR");
ok(!t0[0].sel&&!t0[t0.length-1].sel,"abre e fecha com cartão central");
ok(t1.every(x=>x.title&&x.text&&x.text.length<=160),"cada passo tem título e texto curto (até 160 letras)");
/* estado por conta */
ok(JSON.stringify(OB.load("a"))==="{}","estado vazio no começo");
OB.save("a",{passeio:"pulado"});OB.mark("a","shared");OB.save("a",{oculto:true});
const e=OB.load("a");ok(e.passeio==="pulado"&&e.shared===true&&e.oculto===true,"salvar acumula campos: "+JSON.stringify(e));
ok(JSON.stringify(OB.load("b"))==="{}","outra conta não herda o estado");
OB.mark(null,"shared");ok(Object.keys(mem).length===1,"mark sem conta não grava nada");
mem["fc_ob_c"]="{quebrado";ok(JSON.stringify(OB.load("c"))==="{}","estado corrompido volta vazio");
/* vídeo */
ok(OB.videoUrl()==="","sem ONBOARDING_VIDEO: sem vídeo");
APP_CONFIG.ONBOARDING_VIDEO="http://x/v.mp4";ok(OB.videoUrl()==="","só aceita https");
APP_CONFIG.ONBOARDING_VIDEO="https://x/v.mp4";ok(OB.videoUrl()==="https://x/v.mp4","aceita https");
console.log(falhas?"\n"+falhas+" falha(s)":"onboarding: tudo certo");process.exit(falhas?1:0);
