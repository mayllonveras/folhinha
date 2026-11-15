/* Navegação pelo histórico (FC.nav em core.js): cada tela tem um endereço depois do "#", voltar leva à tela anterior e janelas fecham no voltar.
   Usa um histórico de navegador falso, com os avisos de popstate assíncronos como no navegador de verdade. Rodar com: node testes/navegacao.test.js */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* ---- navegador falso ---- */
const listeners=[];let entries=[{url:"/app",state:null}],pos=0;
global.window=global;
global.addEventListener=(t,f)=>{if(t==="popstate")listeners.push(f)};global.removeEventListener=()=>{};
global.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){},add(){}},appendChild(){}},createElement(){return{setAttribute(){},addEventListener(){},querySelector(){return{}},remove(){}}}};
const loc={get hash(){const u=entries[pos].url,i=u.indexOf("#");return i<0?"":u.slice(i)},get pathname(){return "/app"},get search(){return ""},get href(){return entries[pos].url}};
global.location=loc;
const hist={get state(){return entries[pos].state},
  pushState(s,t,u){entries.length=pos+1;entries.push({url:u,state:s});pos++},
  replaceState(s,t,u){entries[pos]={url:u,state:s}},
  back(){if(pos>0){pos--;setTimeout(()=>listeners.forEach(f=>f({state:entries[pos].state})),5)}},
  forward(){if(pos<entries.length-1){pos++;setTimeout(()=>listeners.forEach(f=>f({state:entries[pos].state})),5)}}};
global.history=hist;
global.navigator={};global.localStorage={};global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
vm.runInThisContext(fs.readFileSync(path.join(root,"core.js"),"utf8"),{filename:"core.js"});
const N=global.FC.nav;const shown=[];N.handler=p=>shown.push(p);
const hash=()=>loc.hash;
(async()=>{
  /* 1. telas empilham e voltar volta */
  N.at("/");ok(hash()==="","a tela inicial fica sem # (entrada atual trocada, nada empilhado)");
  N.at("/aluno/1/resumo");N.at("/aluno/1/programa");N.at("/aluno/1/album");
  ok(hash()==="#/aluno/1/album"&&entries.length===4,"cada tela empurra uma entrada: "+hash()+" ("+entries.length+")");
  N.at("/aluno/1/album");ok(entries.length===4,"a mesma tela de novo não empilha");
  hist.back();await sleep(30);
  ok(shown[shown.length-1]==="/aluno/1/programa","voltar chama a tela anterior: "+shown[shown.length-1]);
  hist.back();await sleep(30);hist.back();await sleep(30);
  ok(shown[shown.length-1]==="/"&&hash()==="","voltar até a tela inicial");
  /* 2. botão "voltar" do app (up) usa o histórico em vez de empilhar */
  N.at("/aluno/2/resumo");
  const n0=entries.length;
  ok(N.up("/")===true,"up volta quando a tela anterior é a pedida");await sleep(30);
  ok(entries.length===n0&&hash()==="","up não empilha: "+entries.length);
  ok(N.up("/")===false,"up devolve false quando não há tela anterior igual");
  /* 3. janelas */
  N.at("/aluno/3/resumo");
  const fecha=[];let closed1=false;
  const o1={id:1,closeByBack(){closed1=true;N.ovs.splice(N.ovs.indexOf(o1),1)}};
  N.openOverlay(o1);await sleep(5);
  ok(entries[pos].state&&entries[pos].state.ov===1&&hash()==="#/aluno/3/resumo","janela entra no histórico sem mudar o endereço");
  const shownAntes=shown.length;
  hist.back();await sleep(30);
  ok(closed1&&shown.length===shownAntes,"voltar fecha a janela e não troca a tela");
  /* fechar pelo botão tira a entrada da janela */
  const o2={id:2,closeByBack(){}};N.openOverlay(o2);await sleep(5);
  const posAntes=pos;N.closedOverlay(o2);await sleep(30);
  ok(pos===posAntes-1&&!(entries[pos].state&&entries[pos].state.ov),"fechar a janela pelo botão tira a entrada do histórico");
  /* fechar a janela e abrir outra logo em seguida (escolha de pacotinho): a segunda não pode ser fechada à toa */
  const o3={id:3,closeByBack(){}};N.openOverlay(o3);await sleep(5);
  const o4={id:4,closeByBack(){}};
  N.closedOverlay(o3);N.openOverlay(o4);await sleep(40);
  ok(N.ovs.indexOf(o4)>=0&&entries[pos].state&&entries[pos].state.ov===4,"janela aberta logo depois de fechar outra continua aberta e no histórico");
  N.closedOverlay(o4);await sleep(40);
  /* 4. entrada por um endereço de dentro do app (recarregar) */
  entries=[{url:"/app#/aluno/9/programa",state:null}];pos=0;
  N.idx=0;N.paths=["/"];N.fresh=true;
  N.seed("/");
  ok(entries.length===2&&entries[0].url==="/app"&&hash()==="#/aluno/9/programa","seed põe a tela inicial embaixo da tela do endereço");
  hist.back();await sleep(30);
  ok(shown[shown.length-1]==="/","voltar depois de recarregar leva à tela inicial, não sai do app");
  /* 5. recuperação de senha do Supabase não é tratada como tela */
  entries=[{url:"/app#access_token=abc&type=recovery",state:null}];pos=0;
  ok(N.path()==="/","#access_token não vira caminho do app");
  /* 6. código das telas */
  const rd=f=>fs.readFileSync(path.join(root,f),"utf8");
  const ad=rd("adult.js"),st=rd("student.js"),am=rd("admin.js"),co=rd("core.js");
  ok(/FC\.nav\.handler=route/.test(ad)&&/FC\.nav\.handler=route/.test(st)&&/FC\.nav\.handler=admRoute/.test(am),"as três áreas (pais, aluno, administração) registram suas rotas");
  ok(/FC\.bindTabs\("pai",null,function\(tab\)/.test(ad)&&/FC\.bindTabs\("aluno"/.test(st),"abas dos pais e da criança entram no histórico");
  ok(/FC\.nav\.at\("\/folha"\)/.test(st)&&/FC\.nav\.at\("\/resultado",true\)/.test(st),"folha e resultado têm endereço (o resultado troca a entrada da folha)");
  ok(/Sair da folha\?/.test(st)&&/FC\.nav\.forward\(\)/.test(st),"voltar na folha com respostas digitadas pergunta antes de sair");
  ok(/FC\.nav\.openOverlay/.test(co)&&/FC\.nav\.closedOverlay/.test(co),"janelas (overlay) entram no histórico");
  ok(/FC\.nav\.reset\(\)/.test(ad)&&/FC\.nav\.reset\(\)/.test(st)&&/FC\.nav\.reset\(\)/.test(am),"telas de entrar e de PIN não ficam no histórico");
  console.log(falhas?"\n"+falhas+" falha(s)":"navegacao: tudo certo");process.exit(falhas?1:0);
})();
