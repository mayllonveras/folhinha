/* Trilha Turbo: telas do aluno (cartão da tela inicial, sessão do dia e nivelamento da primeira entrada).
   Usa o motor (turbo.js) e as funções student_turbo_get / student_turbo_save do banco (migracoes/2026-11-17-trilha-turbo.sql).
   Regras e parâmetros: turbo/ESPECIFICACAO.md. Se o banco não responder, o cartão simplesmente não aparece e a trilha BNCC segue normal.
   O student.js entrega o contexto (token, funções) em FC.turboUi.load e consulta FC.turboUi.cardHtml / bind / route. */
(function(){
"use strict";
var FC=window.FC,$=FC.$,$$=FC.$$,esc=FC.esc,T=FC.turbo;
var X=null,D=null,run=null;
var PEND="fc_turbo_pend_";

function deviceClass(){var w=window.innerWidth;return w<600?"celular":w<1024?"tablet":"computador"}
function rkey(){return Math.random().toString(36).slice(2,12)+Date.now().toString(36)}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}return null}
/* Hora de um evento em ms desde que a página abriu (a mesma base de performance.now). Eventos sintéticos podem vir com outra base. */
function tsOf(ts){return ts&&ts<1e12?ts:performance.now()}
function shuffle(a){return FC.shuffle(a.slice())}
function errMsg(e){return String(e&&e.message||e||"")}

/* ---------- envio com fila: se não der para enviar, a sessão fica guardada neste aparelho e sobe na próxima vez ---------- */
function pend(){try{return JSON.parse(ls(PEND+X.code)||"[]")}catch(e){return []}}
function setPend(a){ls(PEND+X.code,a.length?JSON.stringify(a):null)}
async function reenviar(){
  var q=pend(),resto=[];
  for(var i=0;i<q.length;i++){
    try{await X.rpc("student_turbo_save",{p_token:X.token,p_day:q[i].p_day,p_session:q[i].p_session})}
    catch(e){
      if(FC.isSessionErr(e))throw e;
      if(/data_invalida|dados_invalidos/.test(errMsg(e)))continue;   // velho demais ou inválido: descarta
      resto=q.slice(i);break;                                          // sem conexão: guarda o resto
    }
  }
  setPend(resto);
}
/* Quebra a sessão em envios de no máximo 80 fatos (limite da função do banco); tentativas e resultado vão no primeiro. */
function pedacos(sess){
  var facts=sess.facts||[],out=[];
  if(facts.length<=80)return [sess];
  for(var i=0;i<facts.length;i+=80){
    var p=i===0?Object.assign({},sess):{device:sess.device,devices:sess.devices,sessionKey:sess.sessionKey};
    p.facts=facts.slice(i,i+80);out.push(p);
  }
  return out;
}
async function salvar(dia,sess){
  var ps=pedacos(sess),res=null;
  try{for(var i=0;i<ps.length;i++)res=await X.rpc("student_turbo_save",{p_token:X.token,p_day:dia,p_session:ps[i]})}
  catch(e){
    setPend(pend().concat(ps.map(function(p){return{p_day:dia,p_session:p}})));
    if(FC.isSessionErr(e)){X.expired();return{expirou:true}}
    return{ok:false,erro:e};
  }
  return{ok:true,res:res};
}

/* ---------- carregar o estado do dia ---------- */
async function load(ctx){
  X=ctx;D=null;
  var hoje=FC.today();
  try{
    await reenviar();
    var raw=await X.rpc("student_turbo_get",{p_token:X.token,p_day:hoje});
    var dia=T.diaDe(hoje);
    D={raw:raw,st:T.deBanco(raw,dia),dia:dia,hoje:hoje};
  }catch(e){
    if(FC.isSessionErr(e))throw e;
    /* Não esconde em silêncio: o cartão mostra que não carregou e deixa tentar de novo. Só some de vez se o banco não tem a Turbo. */
    D={falha:errMsg(e)};
    X.track("turbo_erro",{data:{msg:D.falha.slice(0,120)}});
  }
}
var SEM_TURBO=/does not exist|schema cache|PGRST20|42883|42P01/;

/* ---------- cartão da tela inicial ---------- */
function cardHtml(){
  if(!D||!X||!X.me)return "";
  var head='<span class="eyebrow">Trilha Turbo · Hoje</span>';
  if(D.falha){
    if(SEM_TURBO.test(D.falha))return "";   // o banco ainda não tem a Turbo: nada a mostrar
    return '<section class="hero turbo">'+head+'<h2>A Turbo não carregou</h2><p>Não deu para abrir a Turbo agora. A trilha BNCC continua funcionando. Toque para tentar de novo.</p>'+
      '<button class="btn reward block" data-turbo="retry">Tentar de novo</button></section>';
  }
  var m=X.me,t=D.raw.today||{};
  if(m.quota===0)return '<section class="hero turbo">'+head+'<h2>Sem Turbo hoje</h2><p>Hoje é dia de descanso. A Turbo volta no próximo dia de estudo.</p></section>';
  if(T.precisaNivelamento(D.st))
    return '<section class="hero turbo">'+head+'<h2>Vamos começar a Turbo</h2><p>Primeiro um jogo rápido, de uns 5 minutos, para descobrir por onde começar. Não vale nota.</p>'+
      '<button class="btn reward block" data-turbo="nivel">Começar</button></section>';
  if(t.status==="done")
    return '<section class="hero turbo">'+head+'<h2>Turbo de hoje concluída!</h2><p>'+(t.pack_given?"Você ganhou a figurinha de hoje. ":"")+'Até o próximo dia de estudo.</p></section>';
  var plan=T.planoDoDia(D.st,D.dia,deviceClass());
  if(plan.semTarefa)
    return '<section class="hero turbo">'+head+'<h2>Nada para treinar hoje</h2><p>Seus fatos estão descansando. A Turbo volta quando for hora de revisar.</p></section>';
  var started=t.status==="started"&&(t.attempts||0)>0;
  return '<section class="hero turbo">'+head+'<h2>'+(started?"Continue a Turbo":"Turbo do dia")+'</h2>'+
    '<p>'+(plan.revisoes?plan.revisoes+" revisões":"Sem revisões")+(plan.novos?" · "+plan.novos+" fatos novos":"")+' · cerca de '+plan.minutos+' min.<br>Ao concluir, você ganha 1 figurinha.</p>'+
    '<button class="btn reward block" data-turbo="start">'+(started?"Continuar":"Começar a Turbo")+'</button></section>';
}
function bind(){
  $$("[data-turbo]").forEach(function(b){b.onclick=function(){var k=b.getAttribute("data-turbo");if(k==="start")startSession();else if(k==="nivel")startPlacement();else if(k==="retry"){b.disabled=true;b.textContent="Tentando…";X.reload().catch(X.fail)}}});
}

/* ---------- peças de tela ---------- */
function shell(){
  FC.render('<div class="paper turbo-run"><div class="tr-top"><button type="button" class="btn ghost small" id="trExit">Sair</button>'+
    '<div class="tr-prog" role="progressbar" aria-label="Progresso" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="trBar" style="width:0%"></i></div>'+
    '<span class="tr-count" id="trCount"></span></div><div id="trBody" class="tr-body"></div></div>');
  $("#trExit").onclick=function(){confirmExit(abort)};
}
function progress(done,total,txt){
  var bar=$("#trBar"),c=$("#trCount");if(!bar)return;
  var pct=total>0?Math.round(100*done/total):0;bar.style.width=pct+"%";bar.parentNode.setAttribute("aria-valuenow",pct);
  if(c)c.textContent=txt||"";
}
function keypadHtml(){
  var p="";for(var n=1;n<=9;n++)p+='<button type="button" class="key" data-k="'+n+'">'+n+'</button>';
  return '<div class="keypad tr-pad">'+p+'<button type="button" class="key" data-k="back" aria-label="Apagar">⌫</button><button type="button" class="key" data-k="0">0</button>'+
    '<button type="button" class="key go" data-k="ok" aria-label="Responder">✓</button></div>';
}
function hintBox(t){return '<b>Dica</b> '+esc(t)}
function bodyFato(eq,hint,opts){
  opts=opts||{};
  return '<div class="tr-hint" id="trHint"'+(hint?'':' hidden')+'>'+(hint?hintBox(hint):'')+'</div>'+
    '<div class="tr-q" id="trQ"><span class="tr-eq">'+esc(eq)+'</span><span class="tr-sign">=</span><span class="tr-ans" id="trAns" aria-live="polite">&nbsp;</span></div>'+
    '<div class="tr-fb" id="trFb" aria-live="polite"></div>'+keypadHtml()+
    '<div class="tr-actions">'+(opts.dica?'<button type="button" class="btn ghost" id="trDica">Dica</button>':'')+'<button type="button" class="btn ghost" id="trNao">Não sei</button></div>';
}
/* Controle de digitação: guarda o que foi digitado, a hora do primeiro toque e a hora em que a conta apareceu. */
function entry(max,onSubmit){
  var E={buf:"",first:null,shown:0,t0:0,locked:false};
  function paint(){var a=$("#trAns");if(a)a.innerHTML=E.buf?esc(E.buf):"&nbsp;"}
  E.press=function(k,ts){
    if(E.locked)return;ts=tsOf(ts);
    if(k==="back"){E.buf=E.buf.slice(0,-1);paint();return}
    if(k==="ok"){if(!E.buf)return;E.locked=true;onSubmit(parseInt(E.buf,10),ts);return}
    if(E.buf.length>=max)return;
    if(E.first==null)E.first=ts;
    E.buf+=k;paint();
  };
  E.start=function(){
    E.buf="";E.first=null;E.shown=0;E.locked=false;E.t0=performance.now();paint();
    requestAnimationFrame(function(){requestAnimationFrame(function(){E.shown=performance.now()})});   // conta pintada na tela
  };
  E.t1=function(){return Math.min(600000,Math.max(0,Math.round(E.first-(E.shown||E.t0))))};
  E.total=function(ts){return Math.min(600000,Math.max(E.t1(),Math.round(ts-(E.shown||E.t0))))};
  return E;
}
/* Teclas na tela (pointerdown, para a hora do toque ser a do dedo e não a do clique) e no teclado do aparelho. */
function bindPad(E){
  $$(".tr-pad .key").forEach(function(b){
    var k=b.getAttribute("data-k"),pd=false;
    b.onpointerdown=function(e){e.preventDefault();pd=true;setTimeout(function(){pd=false},500);E.press(k,e.timeStamp)};
    b.onclick=function(e){if(pd){pd=false;return}E.press(k,e.timeStamp)};   // clique sem toque: ativado pelo teclado
  });
  FC.setKeys(function(e){
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(/^[0-9]$/.test(e.key)){e.preventDefault();E.press(e.key,e.timeStamp)}
    else if(e.key==="Backspace"){e.preventDefault();E.press("back",e.timeStamp)}
    else if(e.key==="Enter"){e.preventDefault();E.press("ok",e.timeStamp)}
  });
}
function bindNao(E,fn){var b=$("#trNao");if(b)b.onclick=function(e){if(E.locked)return;E.locked=true;fn(tsOf(e.timeStamp))}}
function clearTimers(){if(run){run.timers.forEach(clearTimeout);run.timers=[]}}
function later(fn,ms){var id=setTimeout(function(){if(run&&!run.fim)fn()},ms);run.timers.push(id);return id}
/* Saiu do aplicativo no meio de uma conta: o tempo daquela conta não vale, recomeça quando voltar. */
document.addEventListener("visibilitychange",function(){
  if(!run||run.fim||!run.E)return;
  if(document.visibilityState==="hidden")run.E.hid=true;
  else if(run.E.hid&&!run.E.locked){run.E.hid=false;run.E.start()}
});

function confirmExit(onGo){
  var ov=FC.overlay('<h2>Sair da Turbo?</h2><p class="muted">O que você já fez fica guardado.</p><div class="actions"><button class="btn ghost" id="trGoOut">Sair</button></div>',{button:"Continuar"});
  $("#trGoOut",ov.el).onclick=function(){ov.close();FC.nav.after(onGo)};
}
async function abort(){
  if(!run||run.fim)return;
  if(run.tipo==="dia"&&run.sess.n>0)await finish(true);
  else{run.fim=true;clearTimers();FC.setKeys(null);run=null}
  try{await X.goHome()}catch(e){X.fail(e)}
}
/* O botão voltar do aparelho: durante a Turbo pergunta antes de sair. Sem nada feito ainda, sai direto. */
function route(path){
  if(!run||run.fim)return false;
  var nada=run.passo==="intro"||(run.tipo==="dia"&&run.sess.n===0);
  if(nada){clearTimers();FC.setKeys(null);run=null;return false}
  FC.nav.forward();
  confirmExit(abort);
  return true;
}
function leave(){clearTimers();if(run){run.fim=true}FC.setKeys(null);run=null;return X.goHome().catch(X.fail)}

/* ================= sessão do dia ================= */
function startSession(){
  if(!D||!D.st||run)return;
  var ap=deviceClass(),sess=T.iniciarSessao(D.st,{dia:D.dia,aparelho:ap,rnd:Math.random});
  if(sess.semTarefa){FC.toast("Hoje não tem nada para treinar na Turbo.");return}
  run={tipo:"dia",ap:ap,sess:sess,key:rkey(),fim:false,E:null,q:null,timers:[]};
  FC.nav.at("/turbo");
  X.track("turbo_inicio",{data:{revisoes:sess.fila.filter(function(r){return r.tipo==="revisao"}).length,novos:sess.bloco.length,aparelho:ap,aparelho_novo:sess.aparelhoNovo}});
  shell();nextQ();
}
function nextQ(){
  clearTimers();
  var it=T.proximo(D.st,run.sess);
  if(!it)return finish(false);
  var f=T.porId(it.id),hint=T.catalogo()[f.op].dicas[f.fam];
  run.q={it:it,f:f,hint:hint,hintShown:it.dica==="before"?"before":null,stage:"ask"};
  var resto=run.sess.fila.length+1,feitas=run.sess.n;
  progress(feitas,feitas+resto,"Faltam "+resto);
  $("#trBody").innerHTML=bodyFato(f.eq,it.dica==="before"?hint:"",{dica:it.dica!=="before"});
  var E=run.E=entry(3,function(val,ts){answer(val,ts,false)});
  bindPad(E);bindNao(E,function(ts){answer(null,ts,true)});
  var d=$("#trDica");if(d)d.onclick=function(){showHint("demand")};
  E.start();
  if(it.dica==="demand")later(function(){if(run.q&&run.q.stage==="ask"&&E.first==null&&!run.q.hintShown)showHint("demand")},8000);   // dica sob demanda: aparece sozinha depois de 8 s
}
function showHint(kind){
  var q=run.q,h=$("#trHint");if(!q||!h)return;
  if(!q.hintShown)q.hintShown=kind;
  h.hidden=false;h.innerHTML=hintBox(q.hint);
  var d=$("#trDica");if(d)d.hidden=true;
}
function answer(val,ts,naoSei){
  var q=run.q,E=run.E,f=q.f,it=q.it;
  if(q.stage==="retype")return retypeDone(!naoSei&&val===f.res);
  var ok=!naoSei&&val===f.res;
  var t1=(naoSei||E.first==null)?null:E.t1(),total=E.total(ts);
  var dicaDepois=it.dica==="after"||!ok;
  var dica=q.hintShown==="before"?"before":q.hintShown==="demand"?"demand":(dicaDepois?"after":"none");
  T.registrar(D.st,run.sess,{id:f.id,tipo:it.tipo,ok:ok,resp:naoSei?null:val,t1:t1,total:total,dica:dica,contou:false});
  q.stage="done";
  var a=$("#trAns"),fb=$("#trFb");
  if(ok){
    a.classList.add("ok");
    if(it.dica==="after"){showHint("after");later(nextQ,1500)}else later(nextQ,380);
    return;
  }
  a.classList.add("bad");
  if(naoSei)a.innerHTML="&nbsp;";
  fb.innerHTML='Era <b class="num">'+f.res+'</b>';
  showHint("after");
  var d=$("#trDica");if(d)d.hidden=true;
  later(retype,1800);
}
/* Depois de um erro: a resposta sai da tela e a criança tenta de novo na hora. Essa tentativa não conta nas regras, só reforça. O fato volta no fim da sessão. */
function retype(){
  var q=run.q,f=q.f;q.stage="retype";
  var a=$("#trAns"),fb=$("#trFb");a.className="tr-ans";fb.innerHTML="Agora você: quanto é?";
  var E=run.E=entry(3,function(val,ts){answer(val,ts,false)});
  bindPad(E);bindNao(E,function(ts){answer(null,ts,true)});
  E.start();
}
function retypeDone(ok){
  var q=run.q,f=q.f,a=$("#trAns"),fb=$("#trFb");
  a.classList.add(ok?"ok":"bad");
  fb.innerHTML=ok?"Isso!":'Era <b class="num">'+f.res+'</b>';
  later(nextQ,ok?600:1400);
}

/* Fim (ou saída antes da hora): fecha a sessão no motor, envia ao banco e mostra o resultado. */
async function finish(sair){
  if(!run||run.fim)return;
  run.fim=true;clearTimers();FC.setKeys(null);
  var sess=run.sess,fin=T.finalizarSessao(D.st,sess);
  var oks=sess.log.filter(function(l){return l.ok}).length;
  X.track("turbo_fim",{data:{tentativas:sess.n,acertos:oks,concluida:fin.concluida,chute:fin.chute,pacote:!!fin.premio,promovidos:fin.promovidos.length,rebaixados:fin.rebaixados.length,saiu:!!sair}});
  var payload={device:run.ap,devices:D.st.aparelhos,sessionKey:run.key,facts:T.fatosParaBanco(D.st,sess.ordemAtt),attempts:sess.log,
    result:{done:fin.concluida,noTask:fin.semTarefa,guess:fin.chute,pack:!!fin.premio,attempts:sess.n,secs:Math.round(sess.ms/1000),promoted:fin.promovidos.length,demoted:fin.rebaixados.length}};
  if(!sair)FC.render('<div class="panel center"><h1>Guardando…</h1></div>');
  var sv=await salvar(D.hoje,payload);
  if(sv.expirou){run=null;return}
  var today=D.raw.today||{};
  today.attempts=(today.attempts||0)+sess.n;
  if(fin.concluida&&!fin.chute)today.status="done";else if(today.status!=="done")today.status="started";
  if(sv.ok&&sv.res){today.pack_given=!!sv.res.pack_given;X.setPacks(sv.res.pending_packs)}
  D.raw.today=today;
  if(sair){run=null;if(!sv.ok)FC.toast("Não deu para enviar agora. Fica guardado e a gente envia depois.");return}
  var info={fin:fin,sv:sv,acertos:oks,total:sess.n,novos:sess.bloco.length};
  run=null;resultado(info);
}
function resultado(r){
  var fin=r.fin,sv=r.sv,m=X.me,ganhou=!!(sv.ok&&sv.res&&sv.res.pack_new);
  FC.nav.at("/resultado",true);
  var nota=fin.chute?"Algumas respostas foram rápidas demais. Da próxima vez, pense um pouquinho antes de responder para ganhar a figurinha."
    :!fin.concluida?"Você parou no meio, e o que você fez ficou guardado."
    :ganhou?"Você concluiu a Turbo de hoje e ganhou uma figurinha!"
    :(sv.ok&&sv.res&&sv.res.pack_given)?"Você já tinha ganhado a figurinha de hoje."
    :sv.ok?"Turbo de hoje concluída!":"Turbo concluída! Não deu para enviar agora: seu resultado fica guardado neste aparelho e sobe quando tiver conexão.";
  FC.render('<div class="res panel turbo-res"><div class="score"><div class="big">'+r.acertos+'/'+r.total+'</div>'+
    '<div class="seal'+(fin.concluida&&!fin.chute?"":" no")+'">Turbo</div>'+
    '<div class="grow"><h2>'+(fin.concluida&&!fin.chute?"Turbo concluída":"Turbo")+', '+esc(m.name)+'</h2><div class="muted">'+esc(nota)+'</div></div></div>'+
    '<div class="kv"><div><b>'+r.total+'</b><span>contas respondidas</span></div><div><b>'+r.novos+'</b><span>fatos novos hoje</span></div>'+
    '<div><b>'+fin.promovidos.length+'</b><span>fatos que ficaram mais firmes</span></div></div>'+
    '<div class="actions">'+(ganhou?'<button class="btn reward" id="trPack">Abrir figurinha</button>':'')+'<button class="btn ghost" id="trHome">Ir ao início</button></div></div>');
  if(ganhou){FC.sfx.pack();FC.confetti();$("#trPack").onclick=function(){X.openPack()}}
  else if(fin.concluida&&!fin.chute)FC.sfx.stamp();
  $("#trHome").onclick=function(){X.goHome().catch(X.fail)};
}

/* ================= nivelamento da primeira entrada ================= */
function startPlacement(){
  if(!D||!D.st||run)return;
  run={tipo:"nivel",passo:"intro",ap:deviceClass(),key:rkey(),fim:false,timers:[],E:null,q:null,log:[],pre:null,nv:null,idade:D.st.idade};
  FC.nav.at("/turbo");
  X.track("turbo_nivelamento",{data:{etapa:"inicio",idade:run.idade}});
  FC.render('<div class="panel turbo-intro center"><span class="eyebrow">Trilha Turbo</span><h1>Vamos descobrir por onde começar</h1>'+
    '<p class="muted">São umas contas rápidas. Responda do seu jeito. Se não souber, toque em <b>Não sei</b>, sem problema. Não vale nota!</p>'+
    '<div class="actions"><button class="btn reward" id="trGo">Vamos lá</button><button class="btn ghost" id="trLater">Agora não</button></div></div>');
  $("#trGo").onclick=function(){run.passo="aquecimento";shell();aquecimento(shuffle([3,7,12,5,18,9]),0)};
  $("#trLater").onclick=leave;
}
/* A. aquecimento: tocar o número que aparece (só para a criança se acostumar com o teclado) */
function aquecimento(nums,i){
  clearTimers();
  if(i>=nums.length)return run.idade<=7?preReq():sondagem();
  progress(i,nums.length,"Aquecimento");
  $("#trBody").innerHTML='<p class="tr-say">Toque este número</p><div class="tr-big">'+nums[i]+'</div>'+
    '<div class="tr-q"><span class="tr-ans" id="trAns" aria-live="polite">&nbsp;</span></div>'+keypadHtml();
  var E=run.E=entry(2,function(){later(function(){aquecimento(nums,i+1)},150)});
  bindPad(E);E.start();
}
/* B. pré-requisitos (só para os pequenos, ou para quem foi mal na sondagem): comparar, ver pontinhos sem contar, contar a partir de um número */
function preItens(){
  var it=[],pares=shuffle([[3,8],[12,9],[6,14],[15,11],[5,7],[18,13]]);
  pares.forEach(function(p){var ab=Math.random()<.5?p:[p[1],p[0]];it.push({tipo:"comparar",a:ab[0],b:ab[1],certa:Math.max(p[0],p[1])})});
  shuffle([2,4,3,1]).forEach(function(n){it.push({tipo:"pontos",n:n,certa:n})});
  shuffle([[5,2],[7,3],[6,2]]).forEach(function(p){it.push({tipo:"contar",a:p[0],b:p[1],certa:p[0]+p[1]})});
  return it;
}
function dots(n,extra){var h='<div class="tdots" aria-hidden="true">';for(var i=0;i<n;i++)h+='<i></i>';for(var j=0;j<(extra||0);j++)h+='<i class="plus"></i>';return h+'</div>'}
function preReq(){
  run.passo="pre";run.preIt=preItens();run.preOk={comparar:0,pontos:0,contar:0};run.preN={comparar:0,pontos:0,contar:0};
  preItem(0);
}
function preItem(i){
  clearTimers();
  var itens=run.preIt;
  if(i>=itens.length){
    var tot=0,ok=0;["comparar","pontos","contar"].forEach(function(k){tot+=run.preN[k];ok+=run.preOk[k]});
    run.pre={comparar:run.preOk.comparar,pontos:run.preOk.pontos,contar:run.preOk.contar,total:tot,falhou:ok<Math.ceil(.6*tot)};
    X.track("turbo_nivelamento",{data:{etapa:"pre",acertos:ok,total:tot,falhou:run.pre.falhou}});
    return run.nv&&run.nv.itens>0?concluirNivel():sondagem();
  }
  var it=itens[i];run.preN[it.tipo]++;
  progress(i,itens.length,"Jogo "+(i+1)+" de "+itens.length);
  function fim(ok){if(ok)run.preOk[it.tipo]++;later(function(){preItem(i+1)},250)}
  var body=$("#trBody");
  if(it.tipo==="comparar"){
    body.innerHTML='<p class="tr-say">Qual número é maior?</p><div class="tcmp"><button type="button" class="tc" data-v="'+it.a+'">'+it.a+'</button><button type="button" class="tc" data-v="'+it.b+'">'+it.b+'</button></div>'+
      '<div class="tr-actions"><button type="button" class="btn ghost" id="trNao">Não sei</button></div>';
    var done=false;
    $$(".tc",body).forEach(function(b){b.onclick=function(){if(done)return;done=true;fim(Number(b.getAttribute("data-v"))===it.certa)}});
    $("#trNao").onclick=function(){if(done)return;done=true;fim(false)};
  }else if(it.tipo==="pontos"){
    body.innerHTML='<p class="tr-say">Olhe bem!</p>'+dots(it.n)+'<div class="tr-fb"></div>';
    later(function(){
      body.innerHTML='<p class="tr-say">Quantos pontinhos você viu?</p><div class="tcmp four">'+[1,2,3,4].map(function(n){return '<button type="button" class="tc" data-v="'+n+'">'+n+'</button>'}).join("")+'</div>'+
        '<div class="tr-actions"><button type="button" class="btn ghost" id="trNao">Não sei</button></div>';
      var done=false;
      $$(".tc",body).forEach(function(b){b.onclick=function(){if(done)return;done=true;fim(Number(b.getAttribute("data-v"))===it.certa)}});
      $("#trNao").onclick=function(){if(done)return;done=true;fim(false)};
    },1400);
  }else{
    body.innerHTML='<p class="tr-say">Tem '+it.a+' bolinhas. Junte mais '+it.b+'. Quantas ficam?</p>'+dots(it.a,it.b)+
      '<div class="tr-q"><span class="tr-ans" id="trAns" aria-live="polite">&nbsp;</span></div>'+keypadHtml()+'<div class="tr-actions"><button type="button" class="btn ghost" id="trNao">Não sei</button></div>';
    var E=run.E=entry(2,function(val){fim(val===it.certa)});
    bindPad(E);bindNao(E,function(){fim(false)});E.start();
  }
}
/* C. sondagem de fatos: uma conta por família, subindo e descendo na ordem; a criança não vê se acertou */
function sondagem(){
  clearTimers();run.passo="sondagem";
  var nv=run.nv||(run.nv=T.nivelamento.inicio("soma",run.idade)),nx=T.nivelamento.proximo(nv);
  if(!nx)return fimSondagem();
  var f=T.porId(nx.id);
  run.q={nx:nx,f:f};
  progress(nv.itens,nv.itens+2,"Contas");
  $("#trBody").innerHTML=bodyFato(f.eq,"",{dica:false});
  function resp(val,ts,naoSei){
    var ok=!naoSei&&val===f.res,t1=(naoSei||E.first==null)?null:E.t1(),total=E.total(ts);
    var r=T.nivelamento.classificar(t1,ok,T.metaDe(D.st));
    T.nivelamento.registrar(nv,nx.fam,r);
    run.log.push({fact:f.id,kind:"nivelamento",ok:ok,answer:naoSei?null:val,t1:t1,total:total,hint:"none",counted:false,stateBefore:0});
    $("#trFb").textContent="Anotado!";
    later(sondagem,350);
  }
  var E=run.E=entry(3,function(val,ts){resp(val,ts,false)});
  bindPad(E);bindNao(E,function(ts){resp(null,ts,true)});
  E.start();
}
function fimSondagem(){
  /* Quem não passou nem na primeira família e já tem mais de 7 anos faz também os jogos de pré-requisito. */
  if(run.idade>7&&run.nv.lo<0&&!run.pre)return preReq();
  concluirNivel();
}
async function concluirNivel(){
  clearTimers();run.fim=true;FC.setKeys(null);
  FC.render('<div class="panel center"><h1>Guardando…</h1></div>');
  var info=T.nivelamento.aplicar(D.st,run.nv,D.dia);
  D.st.nivelamento.pre=run.pre||null;
  D.st.cargaReduzida=!!(run.pre&&run.pre.falhou);
  var payload={device:run.ap,devices:D.st.aparelhos,sessionKey:run.key,placement:D.st.nivelamento,facts:T.fatosParaBanco(D.st,info.ids),attempts:run.log,result:{}};
  var sv=await salvar(D.hoje,payload);
  if(sv.expirou){run=null;return}
  D.raw.placement=D.st.nivelamento;
  X.track("turbo_nivelamento",{data:{etapa:"fim",mais_alta:info.maisAlta,fatos:info.ids.length,carga_reduzida:D.st.cargaReduzida}});
  var cat=T.catalogo()[run.nv.op],H=info.maisAlta;
  run=null;
  var dom=H>=0?cat.fams.slice(0,H+1).join(", "):"";
  var plan=T.planoDoDia(D.st,D.dia,deviceClass()),pode=X.me.quota>0&&!plan.semTarefa;
  FC.nav.at("/resultado",true);
  FC.render('<div class="res panel turbo-res center"><span class="eyebrow">Trilha Turbo</span><h1>Pronto! Já sei por onde começar</h1>'+
    '<p class="muted">'+(H>=0?'Você já sabe bastante coisa: <b>'+esc(dom)+'</b>. Esses fatos vão aparecer só para revisar. Vamos treinar a partir de onde você precisa.':'Vamos começar do começo, com calma, um pouquinho de cada vez.')+'</p>'+
    (D.st.cargaReduzida?'<p class="muted small-t">Vamos devagar: poucos fatos novos por vez.</p>':'')+
    (sv.ok?'':'<p class="muted small-t">Não deu para enviar agora. Seu resultado fica guardado neste aparelho e sobe quando tiver conexão.</p>')+
    '<div class="actions">'+(pode?'<button class="btn reward" id="trNow">Começar a Turbo de hoje</button>':'')+'<button class="btn ghost" id="trHome">Ir ao início</button></div></div>');
  FC.sfx.stamp();
  if(pode)$("#trNow").onclick=startSession;
  $("#trHome").onclick=function(){X.goHome().catch(X.fail)};
}

FC.turboUi={load:load,cardHtml:cardHtml,bind:bind,route:route};
})();
