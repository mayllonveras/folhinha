/* Área do aluno: PIN, tela inicial, folha de exercícios e resultado. */
(function(){
"use strict";
var FC=window.FC,$=FC.$,$$=FC.$$,esc=FC.esc,sb=FC.sb;
var S={code:null,token:null,me:null,info:null};
var cur=null,timerId=null,busy=false;

function tokKey(){return "fc_tok_"+S.code}
function getTok(){try{return localStorage.getItem(tokKey())}catch(e){return null}}
function setTok(t){try{if(t)localStorage.setItem(tokKey(),t);else localStorage.removeItem(tokKey())}catch(e){}}
async function rpc(name,args){var r=await sb.rpc(name,args);if(r.error)throw r.error;return r.data}

/* ---------- registro de uso (para melhorar o sistema) ----------
   Eventos vão em lotes para student_log_events. O banco só guarda se o responsável autorizou no cadastro (students.consent_at). */
var LOG={q:[],timer:null,sess:Math.random().toString(36).slice(2,12)+Date.now().toString(36)};
function track(kind,o){
  if(!S.token)return;
  var e={kind:kind,at:Date.now()};
  if(o){if(o.level!=null)e.level_idx=o.level;if(o.sheet)e.sheet_id=o.sheet;if(o.data)e.data=o.data}
  LOG.q.push(e);
  if(LOG.q.length>=20)flush();else if(!LOG.timer)LOG.timer=setTimeout(flush,15000);
}
async function flush(){
  clearTimeout(LOG.timer);LOG.timer=null;
  if(!LOG.q.length||!S.token)return;
  var w=window.innerWidth,batch=LOG.q.splice(0,50);
  try{await rpc("student_log_events",{p_token:S.token,p_events:batch,p_app:FC.VERSAO,p_screen:w,p_device:w<600?"celular":w<1024?"tablet":"computador",p_session:LOG.sess})}
  catch(e){/* o registro nunca atrapalha a criança: se falhar, esse lote se perde */}
}
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"){track("app_oculto",cur&&cur.secs==null?{level:cur.level,sheet:cur.id}:null);if(cur&&$("#items")){startPause("auto");if(cur.modo==="uma")stopDwell()}flush()}
  else if(cur&&cur.modo==="uma"&&$("#items")&&!cur.pauseAt&&cur.q<cur.items.length)startDwell(cur.q)});
window.addEventListener("pagehide",function(){saveDraft();flush()});

/* Endereços da criança: #/inicio, #/album, #/trocas, #/amigos, #/progresso (abas), #/folha e #/resultado. Voltar durante a folha pergunta antes de sair. */
var TABS=["inicio","album","trocas","amigos","progresso"];
function homePath(){return "/"+(FC.tabState.aluno||"inicio")}
function goHome(){if(FC.nav.up(homePath()))return Promise.resolve();return loadHome()}
function leaveSheet(path){
  saveDraft();
  if(cur&&cur.secs==null)track("folha_abandono",{level:cur.level,sheet:cur.id,data:{respondidas:cur.items.filter(function(i){return i.tries>0}).length,itens:cur.items.length,segundos:Math.round((Date.now()-cur.t0)/1000)}});
  clearInterval(timerId);cur=null;route(path);
}
function route(path){
  if(!S.token)return;
  if(FC.turboUi&&FC.turboUi.route(path))return;   // Turbo em andamento: o voltar pergunta antes de sair
  if(cur&&cur.secs==null){   // folha em andamento: o botão voltar não pode jogar fora o que a criança escreveu sem perguntar
    var typed=cur.items.some(function(i){var el=$("#in"+i.i);return i.tries>0||(el&&el.value.trim()!=="")});
    if(!typed)return leaveSheet(path);
    FC.nav.forward();   // volta para a folha enquanto a criança decide
    var ov=FC.overlay('<h2>Sair da folha?</h2><p class="muted">O que você escreveu fica guardado neste aparelho e a folha espera por você. O relógio só para se você fizer uma pausa.</p>'+
      '<div class="actions"><button class="btn ghost" id="lvPause">Fazer uma pausa</button><button class="btn ghost" id="lvGo">Sair da folha</button></div>',{button:"Continuar a folha"});
    $("#lvPause",ov.el).onclick=function(){ov.close();FC.nav.after(function(){startPause("manual")})};
    $("#lvGo",ov.el).onclick=function(){ov.close();FC.nav.after(function(){saveDraft();if(!FC.nav.up(path))leaveSheet(path);else if(cur){track("folha_abandono",{level:cur.level,sheet:cur.id,data:{saiu:"voltar"}});clearInterval(timerId);cur=null}})};
    return;
  }
  var m=/^\/([a-z]+)$/.exec(path),tab=m&&TABS.indexOf(m[1])>=0?m[1]:null;
  if(!tab){tab=FC.tabState.aluno||"inicio";FC.nav.at("/"+tab,true)}   // "/folha" ou "/resultado" ao avançar ou recarregar, ou endereço desconhecido: tela inicial
  FC.tabState.aluno=tab;try{sessionStorage.setItem("fc_tab_aluno",tab)}catch(e){}
  if(FC.$('.shell[data-scope="aluno"]'))return FC.gotoTab(tab,true);
  loadHome().catch(fail);
}
FC.studentApp=async function(code){
  FC.nav.handler=route;
  var p0=/^\/([a-z]+)$/.exec(FC.nav.path());
  if(p0&&TABS.indexOf(p0[1])>=0){FC.tabState.aluno=p0[1];try{sessionStorage.setItem("fc_tab_aluno",p0[1])}catch(e){}}
  S.code=code;FC.setKeys(null);FC.studentManifest(code);
  FC.render('<p class="loading">Carregando…</p>');
  var info;
  try{info=await rpc("student_info",{p_code:code})}catch(e){return fail(e)}
  if(!info){
    FC.render('<div class="panel center"><h1>Link não encontrado</h1><p class="muted">Confira se o link foi copiado inteiro. Se o problema continuar, peça um novo link ao seu pai ou professor.</p></div>');
    return;
  }
  S.info=info;
  var t=getTok();
  if(t){
    S.token=t;
    try{await loadHome();track("app_aberto",{data:{como:"retorno"}});return}
    catch(e){if(!FC.isSessionErr(e))return fail(e);setTok(null);S.token=null}
  }
  pinScreen(info.has_pin?"login":"create",null);
};

function fail(e){
  FC.render('<div class="panel center"><h1>Não deu para carregar</h1><p class="muted">'+esc(FC.err(e))+'</p><p><button class="btn" id="retry">Tentar de novo</button></p></div>');
  $("#retry").onclick=function(){FC.studentApp(S.code)};
}

/* ---------- PIN ---------- */
function pinScreen(mode,first,msg){
  FC.nav.reset();
  FC.setKeys(null);
  var create=mode==="create";
  var title=create?(first!=null?"Digite o PIN de novo":"Crie o seu PIN"):"Digite o seu PIN";
  var sub=create?(first!=null?"Os mesmos 4 números, para confirmar.":"Escolha 4 números que só você sabe. Você vai usar para entrar."):"Olá, "+esc(S.info.name)+"!";
  var pad="";for(var n=1;n<=9;n++)pad+='<button type="button" class="key" data-k="'+n+'">'+n+'</button>';
  pad+='<span></span><button type="button" class="key" data-k="0">0</button><button type="button" class="key" data-k="back" aria-label="Apagar">⌫</button>';
  FC.render('<div class="pinbox panel"><img class="pin-logo" src="icons/icon-192.png" alt=""><div class="brand center">Folhinha VIP</div><h1>'+title+'</h1><p class="muted">'+sub+'</p>'+
    '<div class="dots4" id="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'+
    '<p class="msg bad" id="pinMsg" role="alert">'+esc(msg||"")+'</p><div class="keypad">'+pad+'</div></div>');
  var buf="";
  function paint(){FC.$$("#dots i").forEach(function(d,i){d.className=i<buf.length?"on":""})}
  async function press(k){
    if(busy)return;
    if(k==="back"){buf=buf.slice(0,-1);paint();return}
    if(buf.length>=4)return;
    buf+=k;paint();
    if(buf.length<4)return;
    var pin=buf;
    if(create&&first==null){setTimeout(function(){pinScreen("create",pin)},150);return}
    if(create&&first!==pin){pinScreen("create",null,"Os dois PINs são diferentes. Vamos de novo.");return}
    busy=true;
    try{
      var r=create?await rpc("student_set_pin",{p_code:S.code,p_pin:pin}):await rpc("student_login",{p_code:S.code,p_pin:pin});
      busy=false;
      if(r.ok){setTok(r.token);S.token=r.token;S.info.has_pin=true;await loadHome();track("app_aberto",{data:{como:create?"pin_criado":"login"}});return}
      if(r.error==="sem_pin"){pinScreen("create",null);return}
      if(r.error==="pin_ja_definido"){pinScreen("login",null,"Este link já tem PIN. Digite o seu PIN.");return}
      if(r.error==="bloqueado"){
        var t=new Date(r.locked_until);
        pinScreen(mode,first,"Muitas tentativas. Tente de novo às "+FC.pad(t.getHours())+":"+FC.pad(t.getMinutes())+".");return;
      }
      if(r.error==="pin_incorreto"){pinScreen("login",null,"PIN incorreto. Restam "+r.tries_left+" tentativa"+(r.tries_left===1?"":"s")+".");return}
      pinScreen(mode,null,"Não foi possível entrar. Tente de novo.");
    }catch(e){busy=false;pinScreen(mode,null,FC.err(e))}
  }
  FC.$$(".key").forEach(function(b){b.onclick=function(){press(b.getAttribute("data-k"))}});
  FC.setKeys(function(e){
    if(/^[0-9]$/.test(e.key))press(e.key);else if(e.key==="Backspace")press("back");
  });
}

/* ---------- início ---------- */
/* Plano: student_me diz se a família é VIP (sem o campo, banco antigo, tudo segue liberado). No Grátis a Turbo, os amigos e as trocas
   aparecem trancados com um recado para a criança; a trava de verdade é no banco. */
function isVip(){return !S.me||S.me.vip!==false}
function vipLockKid(title,text){
  return '<section class="panel vip-lock kid"><span class="vip-tag">VIP</span><b>'+esc(title)+'</b><p class="small-t muted">'+esc(text)+'</p></section>';
}
/* Trilha Turbo (turbo-aluno.js): o que ela precisa de cá. Se o banco não responder, o cartão da Turbo não aparece e o resto segue normal. */
function turboCtx(){
  return{get token(){return S.token},get code(){return S.code},get me(){return S.me},rpc:rpc,track:track,fail:fail,
    goHome:function(){return goHome()},reload:function(){return loadHome()},
    setPacks:function(n){if(S.me){S.me.pending_packs=n;refreshPacks()}},
    openPack:function(){openPackFlow()},
    expired:function(){setTok(null);S.token=null;pinScreen("login",null,"Sua sessão acabou. Digite o PIN.")}};
}
async function loadHome(){
  S.me=await rpc("student_me",{p_token:S.token,p_day:FC.today()});
  if(FC.turboUi&&isVip()){try{await FC.turboUi.load(turboCtx())}catch(e){if(FC.isSessionErr(e))throw e}}
  home();
  if(S.me.welcome_pending)showWelcome();
}
function home(){
  FC.setKeys(null);cur=null;clearInterval(timerId);
  var m=S.me,L=FC.LEVELS[m.level_idx],today=FC.today(),left=m.quota-m.done_today;
  var status,canStart=false;
  if(m.quota===0){
    if(today<m.start_date){
      var f=FC.nextStudy(m.start_date>today?m.start_date:today,m.study_days,m.start_date,true);
      status="Seu programa começa em <b>"+(f?FC.dayLabel(f):FC.dm(m.start_date))+"</b>.";
    }else{
      var n=FC.nextStudy(today,m.study_days,m.start_date,false);
      status="Hoje é dia de descanso."+(n?" Próxima folha: <b>"+FC.dayLabel(n)+"</b>.":"");
    }
  }else if(left<=0){
    var n2=FC.nextStudy(today,m.study_days,m.start_date,false);
    status="Meta de hoje cumprida: <b>"+m.done_today+" de "+m.quota+"</b> folhas."+(n2?" Próxima folha: <b>"+FC.dayLabel(n2)+"</b>.":"");
  }else{
    canStart=true;status=(m.free_day?"Hoje é <b>dia livre</b>: jogue se quiser, sem perder sua sequência. ":"")+"Hoje: <b>"+m.done_today+" de "+m.quota+"</b> folhas feitas."+(m.today_total>0?" Acertos de primeira hoje: <b>"+m.today_ok+" de "+m.today_total+"</b> ("+Math.round(100*m.today_ok/m.today_total)+"%).":"");
  }
  var need=m.stamps_needed||5,stamps=FC.stampSet(need,m.stamps);
  var hero;
  if(canStart)hero='<section class="hero"><span class="eyebrow">Trilha BNCC · Hoje'+(m.free_day?" · dia livre":"")+' · folha '+(m.done_today+1)+' de '+m.quota+'</span><h2>'+esc(L.name)+'</h2><p>'+status+'</p><button class="btn reward block" id="start">Começar folha '+(m.done_today+1)+'</button></section>';
  else hero='<section class="hero"><span class="eyebrow">Trilha BNCC · Hoje</span><h2>'+(m.quota===0?"Sem folha hoje":"Meta de hoje cumprida!")+'</h2><p>'+status+'</p></section>';
  var rows=m.recent.map(function(r){
    return "<tr><td>"+FC.dm(r.day)+"</td><td>"+esc(FC.lv(r.level))+"</td><td>"+r.ok+"/"+r.total+"</td><td>"+FC.fmtTime(r.secs)+"</td><td>"+(r.advanced?'<span class="tag ok">subiu de nível</span>':r.stamp?'<span class="tag ok">carimbo do dia</span>':'')+"</td></tr>"}).join("");
  var vip=isVip(),turboCard=!FC.turboUi?"":vip?FC.turboUi.cardHtml():vipLockKid("Trilha Turbo","Treino rápido de mais, menos, vezes e dividir, com pacotinho todo dia. Faz parte do plano VIP: peça para seu responsável conhecer!");
  var inicio=offerHtml(m,L)+'<div class="duo">'+hero+turboCard+'</div>'+packPanel(m)+
    '<section class="panel"><div class="split"><b>Carimbos do nível '+L.id+'</b><span class="muted small-t">'+Math.min(m.stamps,need)+' de '+need+'</span></div><div class="stamps gap">'+stamps+'</div>'+
    '<p class="muted small-t gap">Um carimbo por dia, com '+(m.normal_acertos||80)+'% ou mais de acertos de primeira. '+(vip?'Cada carimbo vale um pacotinho de figurinhas. ':'')+'Com '+need+' carimbos você sobe de nível.</p></section>'+
    '<section class="panel">'+FC.streakHtml(m)+'</section>'+FC.installBox();
  var progresso='<section class="panel now"><span class="eyebrow">Nível atual</span><div class="lvl">'+L.id+'</div>'+
    '<div><div class="nm">'+esc(L.name)+'</div><div class="muted">'+esc(L.hint)+'</div></div>'+
    '<div class="stamps">'+stamps+'<span>'+Math.min(m.stamps,need)+' de '+need+'</span></div></section>'+
    '<section class="panel rule"><b>Como ganhar o carimbo</b><p class="small-t">Cada dia em que você acerta <b>'+(m.normal_acertos||80)+'% ou mais</b> das contas de primeira, com tempo médio de até <b>'+FC.fmtTime(L.target)+'</b> por folha, vale <b>1 carimbo</b>. Com '+need+' carimbos você sobe de nível. As contas que você errar voltam nas próximas folhas, até no nível seguinte.</p>'+
      '<p class="small-t"><b>Dia de ouro:</b> acertando <b>'+(m.ouro_acertos||95)+'% ou mais</b> de primeira, com tempo médio de até <b>'+FC.fmtTime(Math.round(L.target*(m.ouro_tempo||80)/100))+'</b> por folha, o dia vale <b>'+(m.ouro_carimbos||2)+' carimbos</b>. E quem já sabe o assunto pode até <b>pular direto</b> para o próximo nível.</p></section>'+
    '<section class="panel rule"><b>Como ganhar pacotinhos de figurinhas</b><ul class="plain small-t">'+
      (vip?'<li><b>Carimbo do dia:</b> 1 pacotinho.</li>'+
      '<li><b>Perseverança:</b> fechou todas as folhas do dia, mesmo sem carimbo? 1 pacotinho.</li>':'<li>No plano Grátis, os pacotinhos vêm dos <b>dias seguidos</b> de estudo. Com o VIP, o carimbo e a perseverança também dão pacotinho.</li>')+
      '<li><b>Dias seguidos de estudo:</b> pacotinhos extras com 3, 7 e 14 dias, e depois a cada 30 dias. Faltar a um dia de estudo zera a sequência.</li></ul></section>'+
    '<section class="panel"><div class="eyebrow">Suas últimas folhas</div>'+(rows?'<div class="tablewrap gap"><table><thead><tr><th>Dia</th><th>Nível</th><th>Acertos</th><th>Tempo</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<p class="muted gap">Você ainda não fez nenhuma folha.</p>')+'</section>';
  var head='<header class="appbar"><img src="icons/icon-192.png" alt=""><div class="grow"><small>Oi,</small><b>'+esc(m.name)+'</b></div>'+
    '<button type="button" class="iconbtn" id="sndBtn"></button><button type="button" class="iconbtn" id="logout" aria-label="Sair">'+FC.icon("logout")+'</button></header>';
  FC.render('<div class="tone-aluno">'+FC.tabsShell({scope:"aluno",head:head,tabs:[
    {id:"inicio",label:"Início",icon:"home",html:inicio},
    {id:"album",label:"Álbum",icon:"album",html:albumPane(m)},
    {id:"trocas",label:"Trocas",icon:"swap",html:vip?tradesPane():vipLockKid("Trocas de figurinhas","Troque suas repetidas com os amigos e complete o álbum mais rápido. Faz parte do plano VIP: peça para seu responsável conhecer!")},
    {id:"amigos",label:"Amigos",icon:"friends",html:vip?'<div id="frBox"><p class="loading">Carregando…</p></div>':vipLockKid("Amigos","Adicione amigos pelo código e veja os álbuns deles. Faz parte do plano VIP: peça para seu responsável conhecer!")},
    {id:"progresso",label:"Progresso",icon:"progress",html:progresso}]})+'</div>');
  FC.nav.at("/"+FC.tabState.aluno);
  FC.bindTabs("aluno",function(id){if(S.tabSeen)track("aba",{data:{para:id}});S.tabSeen=true},function(id){return "/"+id});FC.refreshInstall();
  $("#logout").onclick=logout;
  function sndLabel(){var on=FC.sfx.enabled(),b=$("#sndBtn");b.innerHTML=FC.icon(on?"sound":"soundoff");b.setAttribute("aria-label",on?"Som ligado. Tocar para desligar":"Som desligado. Tocar para ligar")}
  sndLabel();
  $("#sndBtn").onclick=function(){var on=!FC.sfx.enabled();FC.sfx.set(on);sndLabel();if(on)FC.sfx.stamp()};
  if(canStart){$("#start").onclick=startSheet;prepare()}
  if(FC.turboUi&&vip)FC.turboUi.bind();
  bindOffer(m);
  bindPack();bindAlbum();
  if(vip){friendsLoad();TR.step="home";trLoad()}
}
/* ---------- oferta de voltar: depois de um salto sem carimbo, a criança escolhe (nunca é automático) ---------- */
function offerHtml(m,L){
  if(!m.offer_back||m.level_idx<1)return "";
  var prev=FC.LEVELS[m.level_idx-1];
  return '<section class="panel offer"><b>Esse nível está difícil?</b><p class="muted small-t">Você pulou para o nível '+L.id+' e ainda não ganhou carimbo. Sem problema! Você pode voltar para o nível '+prev.id+' e treinar mais um pouquinho, ou continuar aqui.</p>'+
    '<div class="actions"><button class="btn" id="offBack">Voltar ao nível '+prev.id+'</button><button class="btn ghost" id="offStay">Continuar aqui</button></div></section>';
}
function bindOffer(m){
  var b=$("#offBack"),k=$("#offStay");if(!b)return;
  async function answer(accept){
    b.disabled=true;k.disabled=true;
    try{
      var r=await rpc("student_go_back",{p_token:S.token,p_accept:accept});
      if(r.went_back){var nl=FC.LEVELS[r.level_idx];FC.toast("Tudo bem! Você voltou para o nível "+nl.id+".")}
      else FC.toast("Certo, vamos continuar aqui.");
      await loadHome();
    }catch(e){b.disabled=false;k.disabled=false;FC.toast(FC.err(e),true)}
  }
  b.onclick=function(){answer(true)};k.onclick=function(){answer(false)};
}
/* ---------- amigos: cada criança vê só o nível, os carimbos e as figurinhas do outro ---------- */
async function friendsLoad(){
  var box=$("#frBox");if(!box)return;
  try{S.fr=await rpc("student_friends",{p_token:S.token})}
  catch(e){box.innerHTML='<div class="panel"><p class="muted">Não deu para carregar os amigos.</p><button class="btn ghost small" id="frRetry">Tentar de novo</button></div>';$("#frRetry").onclick=friendsLoad;return}
  friendsList();
}
async function friendsAct(name,args,ok){
  try{var r=await rpc(name,args);if(ok)FC.toast(typeof ok==="function"?ok(r):ok)}catch(e){FC.toast(FC.err(e),true)}
  friendsLoad();
}
function friendsList(){
  var box=$("#frBox"),f=S.fr;if(!box||!f)return;
  var inc=f.incoming.map(function(x){
    return '<div class="fr-row"><div class="grow"><b>'+esc(x.name)+'</b><div class="muted small-t">convidou você para ser amigo</div></div>'+
      '<button class="btn small" data-ans="'+x.id+'" data-ok="1">Aceitar</button><button class="btn ghost small" data-ans="'+x.id+'">Recusar</button></div>'}).join("");
  var out=f.outgoing.map(function(x){
    return '<div class="fr-row"><div class="grow"><b>'+esc(x.name)+'</b><div class="muted small-t">esperando a resposta</div></div><button class="btn ghost small" data-rm="'+x.id+'">Cancelar</button></div>'}).join("");
  var fr=f.friends.map(function(x){
    var L=FC.LEVELS[x.level_idx];
    return '<div class="fr-row"><div class="grow"><b>'+esc(x.name)+'</b><div class="muted small-t">Nível '+L.id+' · '+x.stamps+' de 5 carimbos</div></div><button class="btn small" data-see="'+x.id+'">Ver álbum</button></div>'}).join("");
  box.innerHTML=
    '<section class="panel center"><div class="eyebrow">Seu código de amigo</div><div class="fr-code" id="frCode">'+esc(FC.fmtCode(f.code))+'</div>'+
      '<p class="muted small-t">Passe este código para quem você quer como amigo.</p><button class="btn ghost small" id="frCopy">Copiar código</button></section>'+
    '<section class="panel"><b>Convidar um amigo</b><p class="muted small-t">Digite o código que ele passou para você.</p>'+
      '<form class="fr-add" id="frForm" novalidate><input id="frIn" maxlength="8" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Código do amigo" placeholder="ABC-DEF"><button class="btn" type="submit">Enviar convite</button></form></section>'+
    (inc?'<section class="panel"><b>Convites para você</b>'+inc+'</section>':'')+
    '<section class="panel"><b>Seus amigos</b>'+(fr||'<p class="muted small-t gap">Ainda não há amigos por aqui.</p>')+
      '<p class="muted small-t gap">Amigos veem só o seu nível, os seus carimbos e as suas figurinhas. Mais nada.</p></section>'+
    (out?'<section class="panel"><b>Convites enviados</b>'+out+'</section>':'');
  $("#frCopy").onclick=function(){var i=document.createElement("input");var fc=FC.fmtCode(f.code);i.value=fc;FC.copy(fc,i,"código")};
  $("#frForm").onsubmit=function(e){
    e.preventDefault();var c=$("#frIn").value.trim();if(!c)return;
    friendsAct("student_friend_invite",{p_token:S.token,p_code:c},function(r){return r.state==="aceito"?"Agora você e "+r.name+" são amigos!":"Convite enviado para "+r.name+"."});
  };
  $$("[data-ans]",box).forEach(function(b){b.onclick=function(){
    var ok=!!b.getAttribute("data-ok");
    friendsAct("student_friend_answer",{p_token:S.token,p_id:b.getAttribute("data-ans"),p_accept:ok},ok?"Amizade feita!":"Convite recusado.")}});
  $$("[data-rm]",box).forEach(function(b){b.onclick=function(){friendsAct("student_friend_remove",{p_token:S.token,p_id:b.getAttribute("data-rm")},"Convite cancelado.")}});
  $$("[data-see]",box).forEach(function(b){b.onclick=function(){friendView(b.getAttribute("data-see"))}});
}
async function friendView(id){
  var box=$("#frBox"),v;if(!box)return;
  try{v=await rpc("student_friend_view",{p_token:S.token,p_id:id})}catch(e){FC.toast(FC.err(e),true);return friendsLoad()}
  var L=FC.LEVELS[v.level_idx],stamps=FC.stampSet(5,v.stamps);
  var ids=themesOf(v),tid=ids.indexOf(S.frTheme)>=0?S.frTheme:ids[0];S.frTheme=tid;
  var got=gotOf(v,tid),th=FC.theme(tid);
  var tabs=ids.length>1?'<div class="album-tabs">'+ids.map(function(x){return '<button type="button" class="chip-btn'+(x===tid?" on":"")+'" data-ft="'+x+'">'+esc(FC.theme(x).name)+'</button>'}).join("")+'</div>':"";
  box.innerHTML='<div class="pagehead"><button type="button" class="link crumb" id="frBack">'+FC.icon("back")+'Amigos</button></div>'+
    '<section class="panel"><h2>'+esc(v.name)+'</h2><div class="muted">Nível '+L.id+' · '+esc(L.name)+'</div>'+
      '<div class="stamps gap">'+stamps+'<span>'+v.stamps+' de 5</span></div></section>'+
    '<section class="panel">'+tabs+'<div class="split"><b>'+esc(th.name)+'</b><span class="muted small-t num">'+got.length+' de '+FC.ALBUM_SIZE+'</span></div>'+
      '<div class="bar"><i style="width:'+Math.round(got.length/FC.ALBUM_SIZE*100)+'%"></i></div>'+
      '<div class="gap">'+FC.albumHtml(tid,got)+'</div>'+
      '<p class="muted small-t gap"><button type="button" class="btn ghost small" id="frUn">Desfazer amizade</button></p></section>';
  $("#frBack").onclick=friendsLoad;
  $$("[data-ft]",box).forEach(function(b){b.onclick=function(){S.frTheme=b.getAttribute("data-ft");friendView(id)}});
  FC.confirmClick($("#frUn"),"Toque de novo para confirmar",function(){friendsAct("student_friend_remove",{p_token:S.token,p_id:id},"Amizade desfeita.")});
}
/* ---------- trocas de figurinhas repetidas ---------- */
/* Fluxo: Trocas > Nova troca > escolher o amigo > escolher uma repetida minha que ele ainda não tem (e cujo álbum ele tem)
   > escolher uma repetida dele que ainda não tenho (e cujo álbum eu tenho) > pedir. O amigo aceita ou recusa na aba Trocas.
   O aviso chega em tempo real, mas só aparece ENTRE as folhas (nunca com a folha aberta). */
var TR={sub:"repetidas",step:"home",fid:null,fname:"",opts:null,give:null,want:null,data:null,ch:null,poll:null,announced:{}};
function stk(t,sl,badge){return FC.stickerHtml(t,sl,{noflip:true,badge:badge||0})}
function tradesPane(){return '<div id="trBox"><p class="loading">Carregando…</p></div>'}
function canNotify(){return !busy&&(!cur||cur.secs!=null)}
/* Valor de cada figurinha na troca: comum 1, rara 2, ultrarrara 3. Precisa bater com public._tier_value no banco. */
var TR_VAL={comum:1,rara:2,ultra:3};
function valOf(x){return TR_VAL[FC.tierOf(x.theme,x.slot)]||1}
function sumVal(list){return (list||[]).reduce(function(a,x){return a+valOf(x)},0)}
function setHtml(list,label){
  return '<div class="tr-set"><div class="muted small-t center">'+label+' · valor '+sumVal(list)+'</div><div class="tr-set-row">'+list.map(function(x){return stk(x.theme,x.slot)}).join("")+'</div></div>';
}
/* recv e give são listas de {theme,slot}. */
function pairHtml(recv,give){
  return '<div class="tr-swap">'+setHtml(recv,"Você recebe")+FC.icon("swap")+setHtml(give,"Você dá")+'</div>';
}
function namesOf(list){return (list||[]).map(function(x){return nameOf(x.theme,x.slot)}).join(", ")}
function nameOf(t,sl){return FC.stickerInfo(t,sl).name}
async function trLoad(){
  if(!S.token)return;
  try{
    var got=await Promise.all([rpc("student_trades",{p_token:S.token}),rpc("student_trade_history",{p_token:S.token}).catch(function(e){if(FC.isSessionErr(e))throw e;return TR.hist||[]})]);
    TR.data=got[0];TR.hist=got[1];
    if(!S.fr)S.fr=await rpc("student_friends",{p_token:S.token});
  }catch(e){
    if(FC.isSessionErr(e))return;
    var box=$("#trBox");if(box&&!TR.data){box.innerHTML='<div class="panel"><p class="muted">Não deu para carregar as trocas.</p><button class="btn ghost small" id="trRetry">Tentar de novo</button></div>';$("#trRetry").onclick=trLoad}
    return;
  }
  trStart();trBadge();
  if(TR.step==="home"&&$("#trBox"))trRender();
  trAnnounce();
}
function trBadge(){
  var n=TR.data?TR.data.incoming.length:0;
  $$('[data-tab="trocas"]').forEach(function(b){
    var d=b.querySelector(".tr-dot");
    if(n>0){if(!d){d=document.createElement("span");d.className="tr-dot";b.appendChild(d)}d.textContent=n}
    else if(d)d.remove();
  });
}
/* Tempo real: o servidor só "toca" o canal do aluno; os dados vêm de student_trades. Se o Realtime falhar, a consulta a cada 30 s cobre. */
function trStart(){
  if(!TR.data||TR.ch)return;
  try{
    TR.ch=sb.channel("troca-"+TR.data.me).on("broadcast",{event:"troca"},function(){trLoad()}).subscribe();
  }catch(e){TR.ch=null}
  if(!TR.poll){
    TR.poll=setInterval(function(){if(document.visibilityState==="visible"&&S.token)trLoad()},30000);
    document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"&&S.token)trLoad()});
  }
}
function trStop(){
  try{if(TR.ch)sb.removeChannel(TR.ch)}catch(e){}
  TR.ch=null;if(TR.poll)clearInterval(TR.poll);TR.poll=null;TR.data=null;TR.hist=null;TR.announced={};TR.step="home";
}
function goTrocas(){
  TR.sub="pedidos";
  FC.tabState.aluno="trocas";try{sessionStorage.setItem("fc_tab_aluno","trocas")}catch(e){}
  var b=$('.navtop [data-tab="trocas"]');
  if(b&&$('.shell[data-scope="aluno"]')){b.click();TR.step="home";trRender()}else loadHome().catch(fail);
}
function trBanner(html){
  var old=$("#trBanner");if(old)old.remove();
  var el=document.createElement("div");el.id="trBanner";el.className="tr-banner";el.setAttribute("role","status");
  el.innerHTML='<div class="grow">'+html+'</div><button class="btn small" id="trSee">Ver</button><button class="btn ghost small" id="trLater" aria-label="Fechar">×</button>';
  document.body.appendChild(el);
  function close(){el.remove()}
  $("#trSee").onclick=function(){close();goTrocas()};$("#trLater").onclick=close;
  setTimeout(close,15000);
}
/* Avisa pedidos novos e respostas, mas só quando a criança NÃO está com a folha aberta. */
async function trAnnounce(){
  var d=TR.data;if(!d||!canNotify())return;
  var fresh=d.incoming.filter(function(x){return !TR.announced[x.id]});
  if(fresh.length){
    fresh.forEach(function(x){TR.announced[x.id]=1});
    trBanner(fresh.length===1?'<b>'+esc(fresh[0].name)+'</b> quer trocar figurinhas com você!':'<b>'+fresh.length+' amigos</b> querem trocar figurinhas com você!');
  }
  if(d.answers.length){
    var got=0;
    d.answers.forEach(function(a){
      if(a.status==="aceita"){got++;FC.toast(a.name+" aceitou a troca! Você ganhou "+namesOf(a.wants)+".")}
      else if(a.status==="recusada")FC.toast(a.name+" não quis trocar desta vez.");
      else FC.toast("A troca com "+a.name+" não valeu mais.",true);
    });
    d.answers=[];
    try{await rpc("student_trades_seen",{p_token:S.token})}catch(e){}
    if(got)await trRefreshMe();
  }
}
async function trRefreshMe(){
  try{S.me=await rpc("student_me",{p_token:S.token,p_day:FC.today()})}catch(e){return}
  var pane=$('.pane[data-pane="album"]');if(pane){pane.innerHTML=albumPane(S.me);bindPack();bindAlbum()}
  if(TR.step==="home")trRender();
}
function trRender(){
  var box=$("#trBox"),d=TR.data;if(!box||!d)return;
  if(TR.step!=="home")return trFlow();
  var m=S.me,dups=dupsOf(m),friends=(S.fr&&S.fr.friends)||[];
  var inc=d.incoming.map(function(x){
    return '<div class="tr-req"><b>'+esc(x.name)+'</b> quer trocar com você'+pairHtml(x.gives,x.wants)+
      '<div class="actions"><button class="btn" data-tans="'+x.id+'" data-ok="1">Aceitar a troca</button><button class="btn ghost" data-tans="'+x.id+'">Agora não</button></div></div>'}).join("");
  var out=d.outgoing.map(function(x){
    return '<div class="tr-req"><div class="split"><span>Pedido para <b>'+esc(x.name)+'</b></span><button class="btn ghost small" data-tcancel="'+x.id+'">Cancelar</button></div>'+
      pairHtml(x.wants,x.gives)+'<div class="muted small-t center">Esperando a resposta</div></div>'}).join("");
  var total=dups.reduce(function(a,x){return a+x.spare},0);
  var rep=dups.length?'<div class="album gap">'+dups.map(function(x){return stk(x.theme,x.slot,x.spare)}).join("")+'</div>':
    '<p class="muted small-t gap">Você ainda não tem repetidas. Quando um pacotinho trouxer uma figurinha que você já tem, ela aparece aqui, pronta para trocar.</p>';
  box.innerHTML=
    '<section class="panel"><b>Trocar com um amigo</b><p class="muted small-t">Escolha um amigo e veja quais das suas repetidas ele ainda não tem.</p>'+
      (friends.length?(dups.length?'<button class="btn" id="trNew">Nova troca</button>':'<p class="muted small-t gap">Você precisa de pelo menos uma figurinha repetida.</p>'):'<p class="muted small-t gap">Primeiro faça amigos na aba Amigos.</p>')+'</section>'+
    '<section class="panel"><div class="album-tabs" role="tablist">'+
      '<button type="button" class="chip-btn'+(TR.sub==="pedidos"?" on":"")+'" role="tab" aria-selected="'+(TR.sub==="pedidos")+'" data-trsub="pedidos">Pedidos ('+(d.incoming.length+d.outgoing.length)+')'+(d.incoming.length?'<span class="tr-dot">'+d.incoming.length+'</span>':'')+'</button>'+
      '<button type="button" class="chip-btn'+(TR.sub==="repetidas"?" on":"")+'" role="tab" aria-selected="'+(TR.sub==="repetidas")+'" data-trsub="repetidas">Minhas repetidas ('+total+')</button>'+
      '<button type="button" class="chip-btn'+(TR.sub==="feitas"?" on":"")+'" role="tab" aria-selected="'+(TR.sub==="feitas")+'" data-trsub="feitas">Trocas feitas ('+(TR.hist||[]).length+')</button></div>'+
      (TR.sub==="pedidos"?reqHtml(inc,out):TR.sub==="feitas"?histHtml():rep)+'</section>';
  $$("[data-trsub]",box).forEach(function(b){b.onclick=function(){TR.sub=b.getAttribute("data-trsub");trRender()}});
  var nb=$("#trNew");if(nb)nb.onclick=function(){TR.step="friend";TR.sel=null;TR.opts=null;trFlow()};
  $$("[data-tans]",box).forEach(function(b){b.onclick=function(){trAnswer(b.getAttribute("data-tans"),!!b.getAttribute("data-ok"),b)}});
  $$("[data-tcancel]",box).forEach(function(b){b.onclick=async function(){
    b.disabled=true;
    try{await rpc("student_trade_cancel",{p_token:S.token,p_id:b.getAttribute("data-tcancel")});FC.toast("Pedido cancelado.")}catch(e){FC.toast(FC.err(e),true)}
    trLoad()}});
}
/* Aba Pedidos: os que chegaram para a criança e os que ela fez. */
function reqHtml(inc,out){
  if(!inc&&!out)return '<p class="muted small-t gap">Nenhum pedido de troca por enquanto.</p>';
  return (inc?'<div class="gap"><b>Para você</b>'+inc+'</div>':'')+(out?'<div class="gap"><b>Que você fez</b>'+out+'</div>':'');
}
/* Trocas já feitas: com quem, o que a criança deu e o que recebeu. */
function histHtml(){
  var h=TR.hist||[];
  if(!h.length)return '<p class="muted small-t gap">Você ainda não fez nenhuma troca. Quando um amigo aceitar um pedido seu (ou você aceitar o dele), a troca aparece aqui.</p>';
  return h.map(function(x){
    return '<div class="tr-req"><div class="muted small-t">'+FC.dm(String(x.at).slice(0,10))+' · com <b>'+esc(x.friend)+'</b></div>'+
      pairHtml(x.got,x.gave)+
      '<div class="muted small-t center">Você deu '+esc(namesOf(x.gave))+' e recebeu '+esc(namesOf(x.got))+'.</div></div>'}).join("");
}
async function trAnswer(id,ok,btn){
  $$("#trBox button").forEach(function(b){b.disabled=true});
  var r;
  try{r=await rpc("student_trade_answer",{p_token:S.token,p_id:id,p_accept:ok})}
  catch(e){FC.toast(FC.err(e),true);return trLoad()}
  if(r.state==="aceita"){FC.sfx.pack();FC.confetti();FC.toast("Troca feita! As figurinhas já estão com você.");await trRefreshMe()}
  else if(r.state==="recusada")FC.toast("Pedido recusado.");
  else FC.toast(r.why==="expirada"?"Esse pedido venceu.":"Essa troca não vale mais. "+FC.err({message:r.why}),true);
  trLoad();
}
function trBack(step){TR.step=step;trRender()}
function trFlow(){
  var box=$("#trBox");if(!box)return;
  var back=function(label,step){return '<div class="pagehead"><button type="button" class="link crumb" id="trBack">'+FC.icon("back")+label+'</button></div>'};
  if(TR.step==="friend"){
    var fr=(S.fr&&S.fr.friends)||[];
    box.innerHTML=back("Trocas")+'<section class="panel"><b>Com quem você quer trocar?</b>'+fr.map(function(x){
      var L=FC.LEVELS[x.level_idx];return '<div class="fr-row"><div class="grow"><b>'+esc(x.name)+'</b><div class="muted small-t">Nível '+L.id+'</div></div><button class="btn small" data-tf="'+x.id+'" data-nm="'+esc(x.name)+'">Escolher</button></div>'}).join("")+'</section>';
    $("#trBack").onclick=function(){trBack("home")};
    $$("[data-tf]",box).forEach(function(b){b.onclick=async function(){
      b.disabled=true;TR.fid=b.getAttribute("data-tf");TR.fname=b.getAttribute("data-nm");
      try{TR.opts=await rpc("student_trade_options",{p_token:S.token,p_friendship:TR.fid})}
      catch(e){b.disabled=false;FC.toast(FC.err(e),true);return}
      TR.sel=null;TR.step="build";trFlow()}});
    return;
  }
  var o=TR.opts,nm=esc(TR.fname);
  if(TR.step==="friend"||!o)return;
  if(!o.give.length||!o.get.length){
    box.innerHTML=back("Escolher outro amigo")+'<section class="panel"><b>Ainda não dá para trocar com '+nm+'</b><p class="muted small-t gap">'+
      (!o.give.length?'Nenhuma das suas repetidas serve para '+nm+': ele já tem todas, ou não tem o álbum delas. ':'')+
      (!o.get.length?nm+' não tem repetidas que faltam para você, nos álbuns que vocês dois têm. ':'')+'Volte depois de abrir mais pacotinhos.</p></section>';
    $("#trBack").onclick=function(){TR.step="friend";trFlow()};return;
  }
  /* Monta a troca: escolhe-se 1 ou mais figurinhas de cada lado (até 6); os dois lados precisam valer o mesmo. */
  TR.sel=TR.sel||{give:{},want:{}};
  function grid(side,list){
    return '<div class="album gap">'+list.map(function(x,i){
      var on=TR.sel[side][x.theme+"|"+x.slot];
      return '<button type="button" class="tr-pick'+(on?" on":"")+'" data-side="'+side+'" data-i="'+i+'" aria-pressed="'+(on?"true":"false")+'" aria-label="'+(side==="give"?"Oferecer ":"Pedir ")+esc(nameOf(x.theme,x.slot))+', valor '+valOf(x)+'">'+stk(x.theme,x.slot,x.spare)+'</button>'}).join("")+'</div>';
  }
  box.innerHTML=back("Escolher outro amigo")+
    '<section class="panel"><b>Monte a troca com '+nm+'</b><p class="muted small-t">Valores: <b>comum vale 1</b>, <b>rara vale 2</b> e <b>ultrarrara vale 3</b>. Os dois lados precisam valer o mesmo. Por exemplo, 1 rara por 2 comuns.</p></section>'+
    '<section class="panel"><b>1. O que você oferece</b><p class="muted small-t">Suas repetidas que '+nm+' ainda não tem.</p>'+grid("give",o.give)+'</section>'+
    '<section class="panel"><b>2. O que você quer de '+nm+'</b><p class="muted small-t">Repetidas dele que ainda faltam para você.</p>'+grid("want",o.get)+'</section>'+
    '<section class="panel center tr-sum" id="trSum"></section>';
  $("#trBack").onclick=function(){TR.sel=null;TR.step="friend";trFlow()};
  function chosen(side,list){return list.filter(function(x){return TR.sel[side][x.theme+"|"+x.slot]})}
  function summary(){
    var g=chosen("give",o.give),w=chosen("want",o.get),vg=sumVal(g),vw=sumVal(w),ok=vg>0&&vg===vw,msg;
    if(!g.length&&!w.length)msg="Escolha as figurinhas dos dois lados.";
    else if(!g.length)msg="Escolha o que você oferece.";
    else if(!w.length)msg="Escolha o que você quer.";
    else if(vg>vw)msg="Você oferece "+(vg-vw)+" ponto"+(vg-vw>1?"s":"")+" a mais. Peça mais figurinhas para igualar.";
    else if(vg<vw)msg="Você pede "+(vw-vg)+" ponto"+(vw-vg>1?"s":"")+" a mais. Ofereça mais figurinhas para igualar.";
    else msg="Valores iguais. Pode pedir a troca!";
    var el=$("#trSum");if(!el)return;
    el.innerHTML='<div class="split"><span>Você dá: <b class="num">'+vg+'</b> ponto'+(vg===1?"":"s")+'</span><span>Você recebe: <b class="num">'+vw+'</b> ponto'+(vw===1?"":"s")+'</span></div>'+
      '<p class="'+(ok?"":"muted ")+'small-t">'+msg+'</p><button class="btn reward" id="trSend"'+(ok?"":" disabled")+'>Pedir a troca</button>'+
      '<p class="muted small-t">'+nm+' vai receber o aviso e pode aceitar ou recusar. O pedido vale por 7 dias.</p>';
    $("#trSend").onclick=async function(){
      this.disabled=true;
      var pick=function(l){return l.map(function(x){return{theme:x.theme,slot:x.slot}})};
      try{
        await rpc("student_trade_propose",{p_token:S.token,p_friendship:TR.fid,p_gives:pick(g),p_wants:pick(w)});
        FC.toast("Pedido enviado para "+TR.fname+"!");TR.step="home";TR.sel=null;
      }catch(e){FC.toast(FC.err(e),true);this.disabled=false;return}
      trLoad();trRender();
    };
  }
  $$(".tr-pick",box).forEach(function(b){b.onclick=function(){
    var side=b.getAttribute("data-side"),x=(side==="give"?o.give:o.get)[Number(b.getAttribute("data-i"))],k=x.theme+"|"+x.slot;
    if(TR.sel[side][k]){delete TR.sel[side][k]}
    else if(Object.keys(TR.sel[side]).length>=6){FC.toast("No máximo 6 figurinhas de cada lado.",true);return}
    else TR.sel[side][k]=1;
    b.classList.toggle("on",!!TR.sel[side][k]);b.setAttribute("aria-pressed",TR.sel[side][k]?"true":"false");
    summary();
  }});
  summary();
}
/* ---------- álbuns e pacotinhos ---------- */
function themesOf(m){return (m.sticker_themes&&m.sticker_themes.length)?m.sticker_themes:[m.sticker_theme||"dinossauros"]}
/* Cada cópia ganha é uma linha em m.stickers. gotOf = as figurinhas diferentes do álbum (sem contar repetidas). */
function gotOf(m,id){
  var by={},out=[];
  (m.stickers||[]).forEach(function(g){
    if((g.theme||m.sticker_theme)!==id)return;
    var cur=by[g.slot];
    if(!cur){by[g.slot]=g;out.push(g)}
    else if(g.from&&!cur.from)out[out.indexOf(cur)]=by[g.slot]=g;   // a cópia que veio de troca é a que aparece marcada
  });
  return out;
}
/* Repetidas: cópias além da primeira de cada figurinha. */
function dupsOf(m){
  var c={},out=[];
  (m.stickers||[]).forEach(function(g){var k=(g.theme||m.sticker_theme)+"|"+g.slot;c[k]=(c[k]||0)+1});
  Object.keys(c).forEach(function(k){if(c[k]>1){var p=k.split("|");if(themesOf(m).indexOf(p[0])>=0)out.push({theme:p[0],slot:Number(p[1]),spare:c[k]-1})}});
  return out;
}
function isFull(m,id){return gotOf(m,id).length>=FC.ALBUM_SIZE}
/* Mesa e gaveta. Liberados (themesOf) = o que os pais liberaram; mesa = até "desk_limit" deles (os ativos, de onde sai o pacotinho); gaveta = o resto que ainda não está completo. */
function deskLimit(m){return m.desk_limit||2}
function deskOf(m){
  var lib=themesOf(m);
  var d=(m.desk_themes||lib.slice(0,deskLimit(m))).filter(function(x){return lib.indexOf(x)>=0&&!isFull(m,x)});
  return d;
}
function drawerOf(m){var d=deskOf(m);return themesOf(m).filter(function(x){return d.indexOf(x)<0&&!isFull(m,x)})}
function doneAlbums(m){return themesOf(m).filter(function(x){return isFull(m,x)})}
/* Capa do álbum com a etiqueta "3 de 52" (ou, nas repetidas, "4 repetidas"). Tocar abre o álbum. */
function coverCard(attr,id,label){
  var th=FC.theme(id);
  return '<button type="button" class="cover-card" '+attr+'="'+id+'" aria-label="'+esc(th.name)+', '+esc(label)+'">'+FC.themeCapa(id)+'<span class="cover-badge num">'+esc(label)+'</span></button>';
}
/* Troca mesa e gaveta (a criança pode a qualquer momento, menos no meio da abertura de um pacotinho). */
async function setDesk(list){
  if(S.opening)return false;
  try{var r=await rpc("student_set_desk",{p_token:S.token,p_desk:list});S.me.desk_themes=r.desk;if(r.limit)S.me.desk_limit=r.limit;track("mesa_trocada",{data:{mesa:r.desk}});return true}
  catch(e){FC.toast(FC.err(e),true);return false}
}
function afterDesk(){refreshPacks()}
async function moveAlbum(id,to){
  var m=S.me,d=deskOf(m),lim=deskLimit(m);
  if(to==="gaveta"){
    if(d.length<=1){FC.toast("Deixe pelo menos um álbum na mesa.",true);return}
    if(await setDesk(d.filter(function(x){return x!==id})))afterDesk();return;
  }
  if(d.length<lim){if(await setDesk(d.concat([id])))afterDesk();return}
  /* mesa cheia: a criança escolhe qual álbum vai para a gaveta */
  var ov=FC.overlay('<h2>A mesa está cheia</h2><p class="muted">A mesa cabe '+lim+' álbum'+(lim>1?'s':'')+'. Qual álbum vai para a gaveta para dar lugar ao <b>'+esc(FC.theme(id).name)+'</b>?</p><div class="pack-choices">'+d.map(function(x){
    return '<button class="pack-choice" data-out="'+x+'"><span class="pc-art">'+FC.themeCapa(x)+'</span><b>'+esc(FC.theme(x).name)+'</b></button>'}).join("")+'</div>',{button:"Cancelar"});
  $$("[data-out]",ov.el).forEach(function(b){b.onclick=async function(){
    var out=b.getAttribute("data-out");ov.close();
    if(await setDesk(d.filter(function(x){return x!==out}).concat([id])))afterDesk();
  }});
}
function packPanel(m){
  var n=m.pending_packs||0;
  var open=deskOf(m);
  if(m.albums_done&&themesOf(m).every(function(x){return isFull(m,x)}))
    return '<section class="panel packbox"><div class="grow"><b>Você completou todos os álbuns! 🎉</b><div class="muted small-t">'+(n?'Seus '+n+' pacotinho'+(n>1?'s ficam':' fica')+' guardado'+(n>1?'s':'')+'. ':'')+'Peça aos seus pais para liberarem um álbum novo e você volta a ganhar figurinhas.</div></div></section>';
  if(n<1)return "";
  if(!open.length&&drawerOf(m).length)
    return '<section class="panel packbox"><div class="goalicon open">'+FC.packSvg()+'</div><div class="grow"><b>Você tem '+n+' pacotinho'+(n>1?'s':'')+' para abrir!</b>'+
      '<div class="muted small-t">Sua mesa está vazia. Coloque um álbum da gaveta na mesa para abrir.</div></div><button class="btn reward" data-pack>Arrumar a mesa</button></section>';
  return '<section class="panel packbox"><div class="goalicon open">'+FC.packSvg()+'</div><div class="grow"><b>Você tem '+n+' pacotinho'+(n>1?'s':'')+' para abrir!</b>'+
    '<div class="muted small-t">'+(open.length>1?'Escolha de qual álbum da mesa você quer a figurinha.':'Toque para descobrir a figurinha.')+'</div></div>'+
    '<button class="btn reward" data-pack>Abrir pacotinho</button></section>';
}
/* Aba Álbum: três abas. Mesa e Gaveta mostram só as capas (com "3 de 52"); tocar numa capa abre o álbum grande com todas as figurinhas.
   Repetidas mostra, por álbum, quantas repetidas há; tocar abre só as repetidas, com um único botão Trocar. */
function dupsBy(m){var by={};dupsOf(m).forEach(function(x){(by[x.theme]=by[x.theme]||[]).push(x)});return by}
function spareOf(list){return list.reduce(function(a,x){return a+x.spare},0)}
function albumPane(m){
  var ids=themesOf(m),sub=S.albSub||"mesa";
  if(["mesa","gaveta","repetidas"].indexOf(sub)<0)sub=S.albSub="mesa";
  if(S.albOpen&&ids.indexOf(S.albOpen)<0)S.albOpen=null;
  if(S.repOpen&&!(dupsBy(m)[S.repOpen]||[]).length)S.repOpen=null;
  var d=deskOf(m),g=drawerOf(m),fu=doneAlbums(m),by=dupsBy(m),lim=deskLimit(m);
  var total=Object.keys(by).reduce(function(a,k){return a+spareOf(by[k])},0);
  var head=packPanel(m);
  /* álbum aberto (de Mesa ou Gaveta): capa grande e todas as figurinhas, as ganhas e as que faltam */
  if(sub!=="repetidas"&&S.albOpen){
    var id=S.albOpen,th=FC.theme(id),got=gotOf(m,id),onDesk=d.indexOf(id)>=0,full=isFull(m,id);
    var mv=full?"":onDesk?'<button type="button" class="btn ghost small" data-move="'+id+'" data-to="gaveta">Guardar na gaveta</button>':'<button type="button" class="btn small" data-move="'+id+'" data-to="mesa">Pôr na mesa</button>';
    return head+'<section class="panel" id="albumBox"><div class="pagehead"><button type="button" class="link crumb" data-albback>'+FC.icon("back")+'Álbuns</button></div>'+
      '<div class="album-big">'+FC.themeCapa(id)+'</div>'+
      '<div class="split gap"><b>'+esc(th.name)+'</b><span class="muted small-t num">'+got.length+' de '+FC.ALBUM_SIZE+'</span></div>'+
      '<div class="bar"><i style="width:'+Math.round(got.length/FC.ALBUM_SIZE*100)+'%"></i></div>'+
      '<div class="split gap"><span class="muted small-t">'+(full?"Álbum completo!":onDesk?"Está na mesa":"Está na gaveta")+'</span>'+mv+'</div>'+
      '<p class="muted small-t gap">'+(full?'Álbum completo! Parabéns! As repetidas ficam na aba Repetidas.':got.length?'Toque em uma figurinha para virar e ver os detalhes.':'Feche as folhas do dia para ganhar o primeiro pacotinho. As figurinhas que faltam aparecem com um ponto de interrogação.')+'</p>'+
      '<div class="gap">'+FC.albumHtml(id,got)+'</div></section>';
  }
  var tabs='<div class="album-tabs" role="tablist">'+
    [["mesa","Mesa ("+d.length+")"],["gaveta","Gaveta ("+(g.length+fu.length)+")"],["repetidas","Repetidas ("+total+")"]].map(function(t){
      return '<button type="button" class="chip-btn'+(sub===t[0]?" on":"")+'" role="tab" aria-selected="'+(sub===t[0])+'" data-albsub="'+t[0]+'">'+t[1]+'</button>'}).join("")+'</div>';
  var body;
  if(sub==="mesa"){
    body=(d.length?'<div class="cover-grid">'+d.map(function(x){return coverCard("data-album",x,gotOf(m,x).length+" de "+FC.ALBUM_SIZE)}).join("")+'</div>':'<p class="muted small-t">A mesa está vazia. Coloque um álbum da gaveta aqui.</p>')+
      '<p class="muted small-t gap">A mesa cabe '+lim+' álbum'+(lim>1?'s':'')+'. É dela que saem os seus pacotinhos.'+(d.length<lim&&g.length?' Tem lugar! Escolha um álbum na gaveta.':'')+'</p>';
  }else if(sub==="gaveta"){
    body=(g.length?'<div class="cover-grid">'+g.map(function(x){return coverCard("data-album",x,gotOf(m,x).length+" de "+FC.ALBUM_SIZE)}).join("")+'</div>':'<p class="muted small-t">Nenhum álbum na gaveta.</p>')+
      (fu.length?'<div class="eyebrow gap">Completos ('+fu.length+')</div><div class="cover-grid">'+fu.map(function(x){return coverCard("data-album",x,gotOf(m,x).length+" de "+FC.ALBUM_SIZE)}).join("")+'</div>':"");
  }else if(!S.repOpen){
    var withDup=ids.filter(function(x){return by[x]});
    body=withDup.length?'<p class="muted small-t">Toque no álbum para ver as repetidas e trocar com um amigo.</p><div class="cover-grid gap">'+withDup.map(function(x){var n=spareOf(by[x]);return coverCard("data-rep",x,n+(n>1?" repetidas":" repetida"))}).join("")+'</div>':
      '<p class="muted small-t">Você ainda não tem repetidas. Quando um pacotinho trouxer uma figurinha que você já tem, ela aparece aqui, pronta para trocar.</p>';
  }else{
    var rid=S.repOpen,list=by[rid],n=spareOf(list);
    body='<div class="pagehead"><button type="button" class="link crumb" data-repback>'+FC.icon("back")+'Repetidas</button></div>'+
      '<div class="album-head">'+FC.themeCapa(rid)+'<div class="grow"><b>'+esc(FC.theme(rid).name)+'</b><div class="muted small-t">'+n+(n>1?' repetidas':' repetida')+' neste álbum</div>'+
        '<div class="gap"><button type="button" class="btn reward small" data-trocar>'+FC.icon("swap")+' Trocar</button></div></div></div>'+
      '<div class="album gap">'+list.map(function(x){return stk(x.theme,x.slot,x.spare)}).join("")+'</div>';
  }
  return head+'<section class="panel" id="albumBox">'+tabs+body+'</section>';
}
/* Botão Trocar: leva para a aba Trocas já na lista de amigos; dali segue o fluxo de troca de sempre. */
function startTrade(){
  if(!isVip()){FC.toast(FC.err({message:"plano_vip"}),true);return}
  var fr=(S.fr&&S.fr.friends)||[];
  if(!S.fr){FC.toast("Carregando os amigos. Toque de novo em um instante.");friendsLoad();return}
  if(!fr.length){FC.toast("Primeiro faça amigos na aba Amigos.",true);return}
  TR.step="friend";TR.sel=null;TR.opts=null;
  var b=$('.navtop [data-tab="trocas"]');if(b)b.click();
  trFlow();
}
/* Atualiza na tela, na hora, o aviso de pacotinhos (Início) e o álbum (Álbum) com os dados atuais de S.me. */
function refreshPacks(){
  var m=S.me;if(!m)return;
  $$(".packbox").forEach(function(el){
    var h=packPanel(m);
    if(!h){el.remove();return}
    var t=document.createElement("div");t.innerHTML=h;el.replaceWith(t.firstChild);
  });
  var pane=$('.pane[data-pane="album"]');
  if(pane){pane.innerHTML=albumPane(m);bindAlbum()}
  bindPack();
}
function bindPack(){$$("[data-pack]").forEach(function(b){b.onclick=openPackFlow})}
function bindAlbum(){
  var pane=$('.pane[data-pane="album"]');if(!pane)return;
  function redraw(){pane.innerHTML=albumPane(S.me);bindPack();bindAlbum();window.scrollTo(0,0)}
  $$("[data-albsub]",pane).forEach(function(b){b.onclick=function(){S.albSub=b.getAttribute("data-albsub");S.albOpen=null;S.repOpen=null;redraw()}});
  $$("[data-album]",pane).forEach(function(b){b.onclick=function(){S.albOpen=b.getAttribute("data-album");redraw()}});
  $$("[data-albback]",pane).forEach(function(b){b.onclick=function(){S.albOpen=null;redraw()}});
  $$("[data-rep]",pane).forEach(function(b){b.onclick=function(){S.repOpen=b.getAttribute("data-rep");redraw()}});
  $$("[data-repback]",pane).forEach(function(b){b.onclick=function(){S.repOpen=null;redraw()}});
  $$("[data-trocar]",pane).forEach(function(b){b.onclick=startTrade});
  $$("[data-move]",pane).forEach(function(b){b.onclick=function(){moveAlbum(b.getAttribute("data-move"),b.getAttribute("data-to"))}});
}
/* Ganhou pacotinho: com mais de um álbum disponível, a criança escolhe de qual quer a figurinha. */
function openPackFlow(){
  var m=S.me;if(!(m.pending_packs>0))return;
  var open=deskOf(m);
  if(!isVip()&&m.free_album){   // plano Grátis: o pacotinho abre só no álbum principal
    open=open.filter(function(x){return x===m.free_album});
    if(!open.length){FC.toast("No plano Grátis os pacotinhos abrem no álbum "+FC.theme(m.free_album).name+". Coloque-o na mesa.");var at=$$('[data-tab="album"]')[0];if(at)at.click();return}
  }
  if(!open.length){
    if(drawerOf(m).length){   // mesa vazia: leva a criança para arrumar a mesa
      var tab=$$('[data-tab="album"]')[0];
      if(tab)tab.click();
      FC.toast("Coloque um álbum na mesa para abrir o pacotinho.");return;
    }
    FC.toast("Seus álbuns já estão completos!");return;
  }
  if(open.length===1)return openPack(open[0]);
  var ov=FC.overlay('<h2>Escolha o seu pacotinho!</h2><p class="muted">Cada pacotinho tem uma figurinha surpresa. De qual álbum da mesa você quer?</p>'+
    '<div class="pack-choices">'+open.map(function(id){
      var th=FC.theme(id),n=gotOf(m,id).length;
      return '<button class="pack-choice" data-t="'+id+'"><span class="pc-art">'+FC.themePack(id)+'</span><b>'+esc(th.name)+'</b><small>'+n+' de '+FC.ALBUM_SIZE+'</small></button>';
    }).join("")+'</div>',{button:"Agora não"});
  $$(".pack-choice",ov.el).forEach(function(b){b.onclick=function(){ov.close();openPack(b.getAttribute("data-t"))}});
}
async function openPack(theme){
  var m=S.me,res;
  if(S.opening)return;S.opening=true;
  try{res=await rpc("student_open_pack",{p_token:S.token,p_theme:theme})}
  catch(e){S.opening=false;FC.toast(FC.err(e),true);try{await loadHome()}catch(x){}return}
  S.opening=false;
  m.pending_packs=res.pending;
  track("pacote_aberto",{data:{album:res.theme,raridade:res.tier,repetida:!!res.repeated}});
  if(res.desk)m.desk_themes=res.desk;if(res.albums_done!=null)m.albums_done=res.albums_done;
  m.stickers=(m.stickers||[]).concat([{theme:res.theme,slot:res.slot,end:res.period_end}]);
  refreshPacks();   // a contagem e o álbum já aparecem certos por trás, sem precisar recarregar a página
  showAward(res);
}
/* Pacote de boas-vindas: na primeira entrada a criança ganha 10 figurinhas de uma vez, todas do mesmo álbum (sem repetidas, com pelo menos 1 rara).
   Ela escolhe o álbum uma vez (se tiver dois) e as 10 abrem em sequência; no fim aparece o resumo. Se fechar antes de abrir, o pacote continua esperando. */
function showWelcome(){
  var m=S.me,lib=themesOf(m),lim=deskLimit(m),busy=false,desk=lib.length>lim?null:lib;
  var ov=FC.overlay('<div id="wTop"></div><div id="wBody"></div>',{button:"Agora não"});
  function top(h){ov.el.querySelector("#wTop").innerHTML=h}
  function body(h){ov.el.querySelector("#wBody").innerHTML=h}
  /* 1) com mais álbuns liberados do que cabem na mesa, a criança escolhe primeiro com quais começa */
  function pickDesk(){
    var sel=[];
    top('<h2>Bem-vindo, '+esc(m.name)+'!</h2>');
    body('<p class="muted">Seus pais liberaram '+lib.length+' álbuns. Primeiro escolha até '+lim+' para começar na <b>mesa</b>; os outros esperam na <b>gaveta</b> e você troca quando quiser.</p>'+
      '<div class="pack-choices">'+lib.map(function(id){return '<button type="button" class="pack-choice" data-d="'+id+'" aria-pressed="false"><span class="pc-art">'+FC.themeCapa(id)+'</span><b>'+esc(FC.theme(id).name)+'</b></button>'}).join("")+'</div>'+
      '<div class="actions"><button class="btn" id="wDesk" disabled>Continuar</button></div>');
    var ok=ov.el.querySelector("#wDesk");
    $$("[data-d]",ov.el).forEach(function(b){b.onclick=function(){
      var id=b.getAttribute("data-d"),k=sel.indexOf(id);
      if(k>=0)sel.splice(k,1);else if(sel.length<lim)sel.push(id);else{FC.toast("A mesa cabe "+lim+" álbum"+(lim>1?"s":"")+". Desmarque um para trocar.",true)}
      $$("[data-d]",ov.el).forEach(function(c){var on=sel.indexOf(c.getAttribute("data-d"))>=0;c.classList.toggle("on",on);c.setAttribute("aria-pressed",on?"true":"false")});
      ok.disabled=!sel.length;
    }});
    ok.onclick=function(){desk=sel.slice();gift()};
  }
  /* 2) só depois da mesa escolhida aparece o pacote de boas-vindas: 5 figurinhas de cada álbum da mesa (10, se for um só) */
  function gift(){
    var nomes=desk.map(function(id){return '<b>'+esc(FC.theme(id).name)+'</b>'}).join(" e ");
    top('<div class="pack-reveal"><div class="pack-closed">'+FC.themePack(desk[0])+'</div></div><h2>'+(lib.length>lim?'Sua mesa está pronta!':'Bem-vindo, '+esc(m.name)+'!')+'</h2>'+
      '<p>Você ganhou um <b>pacote de boas-vindas</b>!</p>');
    body('<p class="muted">'+(desk.length>1?'Vêm <b>5 figurinhas de cada álbum</b> da sua mesa: '+nomes+'.':'Vêm <b>10 figurinhas</b> do álbum '+nomes+'.')+'</p>'+
      '<button class="btn reward block" id="wOpen">Abrir agora</button>');
    ov.el.querySelector("#wOpen").onclick=function(){if(busy)return;busy=true;go()};
  }
  if(desk)gift();else pickDesk();
  async function go(){
    var res;
    try{res=await rpc("student_welcome",{p_token:S.token,p_desk:desk})}
    catch(e){busy=false;if(/ja_recebeu/.test(String(e&&e.message||e))){ov.close();try{await loadHome()}catch(x){}return}FC.toast(FC.err(e),true);return}
    m.welcome_pending=false;track("boas_vindas",{data:{mesa:res.desk,figurinhas:res.stickers.length}});
    if(res.desk)m.desk_themes=res.desk;
    m.stickers=(m.stickers||[]).concat(res.stickers.map(function(x){return{theme:x.theme,slot:x.slot,end:FC.today()}}));
    refreshPacks();
    step(res,0);
  }
  function step(res,i){
    if(!ov.el.isConnected)return;
    var card=ov.el.querySelector(".ov-card"),n=res.stickers.length;
    if(i>=n){
      var temas=[];res.stickers.forEach(function(x){if(temas.indexOf(x.theme)<0)temas.push(x.theme)});
      var blocos=temas.map(function(id){
        var cells="";res.stickers.filter(function(x){return x.theme===id}).sort(function(a,b){return a.slot-b.slot}).forEach(function(x){cells+=FC.stickerHtml(id,x.slot,{noflip:true})});
        return '<h3 class="gap">'+esc(FC.theme(id).name)+'</h3><div class="album welcome-grid" style="max-height:none;overflow:visible">'+cells+'</div><p class="muted small-t">Você já tem <b>'+gotOf(S.me,id).length+' de '+FC.ALBUM_SIZE+'</b> neste álbum.</p>';
      }).join("");
      card.innerHTML='<h2>Suas '+n+' figurinhas!</h2>'+blocos+'<p class="muted gap">Para ganhar mais, feche as folhas do dia: cada carimbo vale um pacotinho!</p><div class="actions ov-actions"><button class="btn reward" id="wEnd">Começar</button></div>';
      card.querySelector("#wEnd").onclick=ov.close;FC.confetti({gold:true,n:70});return;
    }
    var st=res.stickers[i],th=FC.theme(st.theme),tier=st.tier||"comum";
    var titulo=tier==="ultra"?"Figurinha ULTRARRARA!":tier==="rara"?"Figurinha RARA!":"Figurinha nova!";
    var linha=tier==="comum"?"":'<p class="tier-msg">'+(tier==="ultra"?"Uma das mais difíceis do álbum inteiro!":"Uma figurinha difícil de conseguir!")+'</p>';
    card.innerHTML='<div class="pack-reveal" id="packReveal"><div class="pack-closed">'+FC.themePack(th.id)+'</div><div class="pack-card">'+FC.stickerHtml(th.id,st.slot,{big:true})+'</div></div>'+
      '<h2 class="'+(tier==="comum"?"":"tier-title tier-"+tier)+'">'+titulo+'</h2>'+linha+'<p class="muted">'+esc(th.name)+' · figurinha '+(i+1)+' de '+n+'</p>'+
      '<div class="actions ov-actions"><button class="btn" id="wNext" style="visibility:hidden">'+(i+1<n?"Próxima":"Ver todas")+'</button></div>';
    var nb=card.querySelector("#wNext");nb.onclick=function(){step(res,i+1)};
    setTimeout(function(){
      if(!ov.el.isConnected)return;
      FC.sfx.pack();var el=ov.el.querySelector("#packReveal");if(el)el.classList.add("opened");
      if(tier==="comum"){FC.confetti();return}
      setTimeout(function(){if(!ov.el.isConnected)return;FC.sfx[tier==="ultra"?"ultra":"rare"]();FC.confetti({gold:true,n:tier==="ultra"?90:64})},350);
    },800);
    setTimeout(function(){if(ov.el.isConnected){nb.style.visibility="";nb.focus()}},1700);
  }
}
/* Álbum que acabou de ficar completo: sai da mesa sozinho. Avisa a criança do que fazer agora. */
function completedMsg(m,id){
  var th=FC.theme(id),all=themesOf(m).every(function(x){return isFull(m,x)});
  return '<p class="tier-msg">🎉 Você completou o álbum '+esc(th.name)+'! Ele saiu da mesa e foi para os completos.'+
    (all?' Você completou TODOS os seus álbuns! Peça aos seus pais para liberarem um álbum novo.':drawerOf(m).length?' Na aba Álbum, escolha outro álbum da gaveta para colocar na mesa.':'')+'</p>';
}
/* Figurinha nova: aviso no meio da tela, com o pacotinho abrindo e a figurinha aparecendo. */
function showAward(aw){
  var m=S.me;
  var th=FC.theme(aw.theme),n=aw.count||gotOf(m,aw.theme).length,tier=aw.tier||FC.tierOf(aw.theme,aw.slot);
  var rep_=!!aw.repeated;
  var titulo=tier==="ultra"?(rep_?"ULTRARRARA repetida!":"Figurinha ULTRARRARA!"):tier==="rara"?(rep_?"Rara repetida!":"Figurinha RARA!"):(rep_?"Figurinha repetida":"Figurinha nova!");
  var linha=tier==="comum"?"":'<p class="tier-msg">'+(tier==="ultra"?"Uma das mais difíceis do álbum inteiro!":"Uma figurinha difícil de conseguir!")+'</p>';
  var ov=FC.overlay('<div class="pack-reveal" id="packReveal"><div class="pack-closed">'+FC.themePack(th.id)+'</div><div class="pack-card">'+FC.stickerHtml(th.id,aw.slot,{big:true})+'</div></div>'+
    '<h2 class="'+(tier==="comum"?"":"tier-title tier-"+tier)+'">'+titulo+'</h2>'+linha+'<p class="muted">Você já tem <b>'+n+' de '+FC.ALBUM_SIZE+'</b> no álbum '+esc(th.name)+'.</p>'+(!rep_&&n>=FC.ALBUM_SIZE?completedMsg(m,aw.theme):'')+(rep_?'<p class="tier-msg">Você já tinha esta! Ela foi para as suas repetidas, na aba Trocas, e dá para trocar com um amigo.</p>':'')+(m.pending_packs>0?'<p class="muted small-t">Você ainda tem '+m.pending_packs+' pacotinho'+(m.pending_packs>1?'s':'')+' para abrir.</p>':''),{button:rep_?"Guardar nas repetidas":"Colar no álbum",cls:tier==="comum"?"":"tier-"+tier,onClose:function(){if(!cur&&S.me===m&&document.querySelector('.shell[data-scope="aluno"]'))home()}});
  /* O botão (Colar no álbum / Guardar nas repetidas) só aparece quando a figurinha termina de aparecer.
     Até lá, nem o clique fora da janela nem o Esc fecham a janela. */
  var acts=ov.el.querySelector(".ov-actions"),ready=false;
  if(acts)acts.style.visibility="hidden";
  function lock(e){if(ready)return;if(e.type==="keydown"&&e.key!=="Escape")return;if(e.type==="click"&&e.target!==ov.el)return;e.stopPropagation();e.preventDefault()}
  ov.el.addEventListener("click",lock,true);document.addEventListener("keydown",lock,true);
  setTimeout(function(){
    ready=true;document.removeEventListener("keydown",lock,true);
    if(acts)acts.style.visibility="";
    var b=ov.el.querySelector("#ovClose");if(b&&ov.el.isConnected)b.focus();
  },1700);   // 800 ms do pacote chacoalhando + 700 ms da figurinha aparecendo + folga
  setTimeout(function(){
    FC.sfx.pack();var el=$("#packReveal");if(el)el.classList.add("opened");
    if(tier==="comum"){FC.confetti();return}
    setTimeout(function(){FC.sfx[tier==="ultra"?"ultra":"rare"]();FC.confetti({gold:true,n:tier==="ultra"?90:64});
      if(tier==="ultra")setTimeout(function(){FC.confetti({gold:true,n:70})},700)},350);
  },800);
}
async function logout(){
  track("sair");await flush();
  try{await rpc("student_logout",{p_token:S.token})}catch(e){}
  trStop();S.fr=null;setTok(null);S.token=null;prep=null;pinScreen("login",null);
}

/* ---------- folha ---------- */
/* A folha é preparada em segundo plano assim que a tela inicial abre (e logo depois de entregar uma folha):
   plano de reforço, contas sorteadas e registro da folha no banco. Ao tocar em "Começar", ela só abre. */
var prep=null;
function prepKey(){var m=S.me;return [FC.today(),m.level_idx,m.stamps,m.done_today].join("|")}
/* Níveis com rodízio e rampa já devolvem as contas na ordem certa (do mais fácil ao mais difícil); os demais são embaralhados. */
function ordena(items){return items.ordenada?items:FC.shuffle(items)}
async function buildSheet(){
  var m=S.me,day=FC.today(),items,base="Preencha as 10 contas. O relógio já está correndo. Enter passa para a próxima.",intro=base;
  var plan=null;
  try{plan=await rpc("student_sheet_plan",{p_token:S.token})}catch(e){if(FC.isSessionErr(e))throw e}
  var teto=!!(plan&&plan.teto_mode)&&m.level_idx>0;
  if(plan&&plan.mode==="mesma"&&plan.repeat&&plan.repeat.length===10){
    items=plan.repeat.map(FC.plainItem);
    intro="Esta é a mesma folha da última vez. Agora dá para acertar tudo! "+intro;
  }else if(plan&&plan.mode==="reforco"&&plan.weak&&plan.weak.length){
    items=ordena(FC.makeItems(m.level_idx,plan.weak,{teto:teto,sheetNo:m.done_today}));
    var w=plan.weak.length;
    intro="Esta folha traz "+w+" conta"+(w>1?"s":"")+" que você errou antes, para treinar. "+intro;
  }else{items=ordena(FC.makeItems(m.level_idx,null,{teto:teto,sheetNo:m.done_today}))}
  var Lv=FC.LEVELS[m.level_idx];if(Lv&&Lv.intro)intro=Lv.intro+" "+intro;
  if(teto)intro="Você já concluiu tudo o que dá para avançar por enquanto. Hoje é folha de revisão: contas dos níveis que você já fez. "+intro;
  /* Se o aluno já tinha uma folha aberta hoje (saiu e voltou, ou outro aparelho), o banco devolve a mesma. */
  var o=await rpc("student_open_sheet",{p_token:S.token,p_day:day,
    p_problems:items.map(FC.plainItem)});
  if(o.reused){
    items=o.problems.map(FC.plainItem);
    intro="Esta é a folha que você deixou aberta. "+base;
  }
  return{id:o.id,items:items,intro:intro,level:m.level_idx,day:day};
}
function prepare(){
  if(!S.me||!S.token||S.me.quota-S.me.done_today<=0)return null;
  var key=prepKey();
  if(prep&&prep.key===key&&!prep.err)return prep.promise;
  var p={key:key,ok:false,err:null};
  p.promise=buildSheet().then(function(r){p.ok=true;return r},function(e){p.err=e;throw e});
  p.promise.catch(function(){});
  prep=p;return p.promise;
}
async function startSheet(){
  var tb=$("#trBanner");if(tb)tb.remove();   // nenhum aviso de troca com a folha aberta
  var b=$("#start")||$("#resNext"),r;
  if(!(prep&&prep.ok&&prep.key===prepKey())&&b){b.disabled=true;b.textContent="Preparando…"}
  try{
    var pr=prepare();
    if(!pr)throw new Error("meta_cumprida");
    r=await pr;
    if(r.day!==FC.today())r=await prepare();   // passou da meia-noite com a tela aberta
  }catch(e){
    prep=null;
    if(FC.isSessionErr(e)){setTok(null);return pinScreen("login",null,"Sua sessão acabou. Digite o PIN.")}
    FC.toast(FC.err(e),true);try{await loadHome()}catch(x){}return;
  }
  prep=null;
  r.items.forEach(function(it,i){it.i=i;it.tries=0;it.ok=false;it.first=false;it.firstVal="";it.vals=[]});
  cur={id:r.id,level:r.level,items:r.items,modo:modoDaFolha(),q:0,tfi:[],t0:Date.now(),secs:null,round:0,intro:r.intro,dwell:r.items.map(function(){return 0}),active:null,since:0};
  renderSheet();FC.nav.at("/folha");
  track("folha_inicio",{level:cur.level,sheet:cur.id,data:{itens:cur.items.length,modo:cur.modo}});
}
/* Tempo por conta: soma dos períodos em que a caixa de resposta daquela conta ficou em foco (só na 1ª tentativa). */
function startDwell(i){if(!cur||cur.round>0)return;stopDwell();cur.active=i;cur.since=performance.now()}
function stopDwell(){if(cur&&cur.active!=null){cur.dwell[cur.active]+=performance.now()-cur.since;cur.active=null}}
/* ---------- pausa e rascunho da folha ----------
   Pausa (botão ou sozinha, ao sair do app/bloquear o celular): esconde as contas e para o relógio, sem limite de tempo; o que limita é a
   quantidade de pausas por folha (parâmetro pausas_max, padrão 2; pausa de menos de 10 s, como a tela apagando, não conta).
   O que foi escrito fica guardado neste aparelho (rascunho), então dá para sair e continuar a mesma folha depois. */
function maxPausas(){var n=S.me&&S.me.pausas_max;return n==null?2:n}
function elapsedMs(){return FC.elapsedMs(cur,Date.now())}
function draftKey(){return "fc_draft_"+S.code}
function loadDraft(){try{return JSON.parse(localStorage.getItem(draftKey())||"null")}catch(e){return null}}
function clearDraft(){try{localStorage.removeItem(draftKey())}catch(e){}}
function saveDraft(){
  if(!cur||!$("#items"))return;
  /* folha em que ainda não se escreveu nada não precisa de rascunho: ao voltar, começa limpa, sem tela de retorno */
  var algo=cur.round>0||cur.items.some(function(it){var inp=$("#in"+it.i);return it.tries>0||(inp&&inp.value!=="")});
  if(!algo){clearDraft();return}
  try{localStorage.setItem(draftKey(),JSON.stringify({sheet:cur.id,t0:cur.t0,pauseMs:cur.pauseMs||0,pauseAt:cur.pauseAt||null,pauses:cur.pauses||0,round:cur.round,secs:cur.secs,
    modo:cur.modo,q:cur.q||0,tfi:cur.tfi||[],items:cur.items.map(function(it){var inp=$("#in"+it.i);return{t:it.tries,ok:it.ok,f:it.first,fv:it.firstVal,vals:it.vals,val:inp?inp.value:"",d:Math.round(cur.dwell[it.i]||0)}})}))}catch(e){}
}
var draftTimer=null;
function saveDraftSoon(){clearTimeout(draftTimer);draftTimer=setTimeout(saveDraft,500)}
function pausasLeft(){return Math.max(0,maxPausas()-((cur&&cur.pauses)||0))}
function startPause(origem){
  if(!cur||cur.pauseAt||!$("#items"))return;
  if(pausasLeft()<1){   // acabaram as pausas desta folha: o botão avisa e a pausa automática não acontece
    if(origem==="manual")FC.toast("Você já usou as "+maxPausas()+" pausas desta folha.",true);
    return;
  }
  stopDwell();cur.pauseAt=Date.now();cur.pauses=(cur.pauses||0)+1;cur.pauseOrigem=origem;
  showPauseScreen();saveDraft();
  track("folha_pausa",{level:cur.level,sheet:cur.id,data:{origem:origem,n:cur.pauses}});
}
function endPause(){
  if(!cur||!cur.pauseAt)return;
  var now=Date.now(),dur=now-cur.pauseAt;
  cur.pauseMs=(cur.pauseMs||0)+dur;cur.pauseAt=null;
  var curta=dur<10000&&cur.pauseOrigem!=="retorno";   // a tela apagando ou um toque sem querer: não gasta uma pausa
  if(curta&&cur.pauses>0)cur.pauses--;
  track("folha_retomada",{level:cur.level,sheet:cur.id,data:{origem:cur.pauseOrigem||"manual",pausa_s:Math.round(dur/1000),devolvida:curta}});
  hidePauseScreen();updatePauseBtn();updateMapa();saveDraft();
  if(cur.modo==="uma"){showQ(cur.q);return}
  for(var k=0;k<cur.items.length;k++)if(!cur.items[k].ok){focusItem(k);break}
}
function showPauseScreen(){
  if($("#pauseScreen"))return;
  var el=document.createElement("div");el.className="pause-screen";el.id="pauseScreen";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");
  el.innerHTML='<div class="pause-card"><div class="pause-ic">'+FC.icon("pause")+'</div><h2>Pausa</h2>'+
    '<p>O relógio está parado e as contas estão escondidas. Quando voltar, toque em Continuar.</p>'+
    '<p class="muted small-t">'+(pausasLeft()>0?'Você ainda tem '+pausasLeft()+' pausa'+(pausasLeft()>1?'s':'')+' nesta folha. ':'Esta foi a sua última pausa desta folha. ')+'O que você escreveu fica guardado neste aparelho.</p>'+
    '<button type="button" class="btn reward block" id="pauseGo">Continuar a folha</button>'+
    '<button type="button" class="link" id="pauseOut">Sair da folha</button></div>';
  document.body.appendChild(el);
  var pa=$(".paper");if(pa)pa.classList.add("paused");
  $("#pauseGo").onclick=endPause;$("#pauseOut").onclick=exitSheet;
  $("#pauseGo").focus();
}
function updatePauseBtn(){
  var b=$("#btnPause");if(!b||!cur)return;
  var left=pausasLeft();
  b.hidden=maxPausas()<1;b.classList.toggle("used",left<1);
  b.setAttribute("aria-label",left<1?"As pausas desta folha acabaram":"Fazer uma pausa. Restam "+left);
  var n=$("#pauseLeft");if(n)n.textContent=left<1?"":String(left);
}
function hidePauseScreen(){var el=$("#pauseScreen");if(el)el.remove();var pa=$(".paper");if(pa)pa.classList.remove("paused")}
/* Sair da folha sem entregar: o rascunho fica guardado e a folha espera. */
async function exitSheet(){
  if(cur&&cur.secs==null)track("folha_abandono",{level:cur.level,sheet:cur.id,data:{respondidas:cur.items.filter(function(i){return i.tries>0}).length,itens:cur.items.length,segundos:Math.round(elapsedMs()/1000)}});
  saveDraft();hidePauseScreen();clearInterval(timerId);cur=null;
  try{await goHome()}catch(e){fail(e)}
}
/* Volta a folha ao ponto em que a criança parou (respostas, tentativas, relógio) e abre na tela de pausa. */
function restoreDraft(){
  var d=loadDraft();
  if(d&&d.sheet!==cur.id)clearDraft();   // rascunho de outra folha (já entregue ou trocada)
  if(!d||d.sheet!==cur.id||!d.items||d.items.length!==cur.items.length)return false;
  if(d.modo&&d.modo!==cur.modo)return false;   // rascunho de outro modo de folha: não serve
  cur.q=d.q||0;cur.tfi=d.tfi||[];
  cur.t0=d.t0;cur.pauseMs=d.pauseMs||0;cur.pauseAt=d.pauseAt||null;cur.pauses=d.pauses||0;cur.round=d.round||0;cur.secs=d.secs==null?null:d.secs;
  cur.items.forEach(function(it,i){
    var s=d.items[i],inp=$("#in"+i),row=$("#r"+i),choice=!!(it.extra&&it.extra.opts);
    it.tries=s.t||0;it.ok=!!s.ok;it.first=!!s.f;it.firstVal=s.fv||"";it.vals=s.vals||[];cur.dwell[i]=s.d||0;
    if(s.val!=null&&s.val!==""){inp.value=s.val;if(choice)$$("#r"+i+" .opt").forEach(function(o){o.classList.toggle("sel",o.getAttribute("data-k")===String(s.val))})}
    if(it.ok){inp.readOnly=true;row.classList.add("ok");if(choice)$$("#r"+i+" .opt").forEach(function(o){o.disabled=true;o.classList.toggle("right",o.classList.contains("sel"))})}
    else if(it.tries>0)row.classList.add("bad");
  });
  if(cur.secs!=null){$("#timer").textContent=FC.fmtTime(cur.secs);$("#btnSubmit").textContent="Conferir correções"}
  setMsg("Você voltou! Sua folha continua de onde parou.");
  if(!cur.pauseAt){cur.pauseAt=Date.now();cur.pauseOrigem="retorno"}   // voltar à folha abre na tela de pausa, sem gastar outra pausa
  if(cur.modo==="uma"){var n=cur.items.length;cur.items.forEach(function(it){var row=$("#r"+it.i);if(row)row.hidden=(it.i!==cur.q)});var rv=$("#review");if(rv)rv.hidden=(cur.q!==n);if(cur.q===n)updateReview();var nx=$("#btnNext");if(nx)nx.hidden=(cur.q===n&&cur.round===0)}
  showPauseScreen();updatePauseBtn();
  return true;
}
/* Mapa de contas: uma bolinha por conta, fixa no topo. Verde = respondida, amarela = falta responder (depois de tentar entregar),
   vermelha = precisa corrigir, vazia = ainda não respondida. Tocar leva à conta. */
function rowBlank(it){var inp=$("#in"+it.i);return !it.ok&&(!inp||inp.value.trim()==="")}
function updateMapa(){
  if(!cur||!$("#mapa"))return;
  cur.items.forEach(function(it){
    var b=$('#mapa [data-i="'+it.i+'"]'),row=$("#r"+it.i);if(!b||!row)return;
    var blank=rowBlank(it),miss=row.classList.contains("miss"),bad=row.classList.contains("bad")&&blank;
    b.classList.toggle("cur",cur.modo==="uma"&&cur.q===it.i);b.classList.toggle("on",!blank);b.classList.toggle("miss",blank&&miss);b.classList.toggle("bad",bad&&!miss);
    b.setAttribute("aria-label","Conta "+(it.i+1)+": "+(it.ok?"certa":!blank?"respondida":miss?"falta responder":bad?"precisa corrigir":"ainda sem resposta"));
  });
}
function goItem(i){
  if(cur&&cur.modo==="uma")return showQ(i);
  var row=$("#r"+i);if(!row)return;
  row.scrollIntoView({behavior:"smooth",block:"center"});
  setTimeout(function(){focusItem(i)},250);
}
function clearMiss(i){var row=$("#r"+i);if(!row)return;row.classList.remove("miss");var tg=row.querySelector(".miss-tag");if(tg)tg.remove()}
/* ---------- uma conta por vez ----------
   Modo "uma" (parâmetro modo_folha do /adm): só a conta atual aparece e o tempo dela é o tempo em que ela está na tela (sem pausa, com o app aberto).
   As bolinhas do topo levam a qualquer conta; depois da última vem a tela "Pronto para entregar?". Nas correções só passam as contas erradas.
   Modo "lista": todas as contas na tela, como antes. */
function modoDaFolha(){return S.me&&S.me.modo_folha===0?"lista":"uma"}
function dwellNow(i){return (cur.dwell[i]||0)+(cur.active===i?performance.now()-cur.since:0)}
/* tempo até começar a escrever, só na primeira visita à conta e só na primeira rodada */
function noteFirstInput(i){if(cur&&cur.modo==="uma"&&cur.round===0&&cur.tfi[i]==null)cur.tfi[i]=Math.round(dwellNow(i))}
function pendentes(){return cur.items.filter(function(it){return !it.ok})}
function showQ(i){
  if(!cur||cur.modo!=="uma")return;
  var n=cur.items.length;if(i<0)i=0;if(i>n)i=n;
  stopDwell();cur.q=i;
  cur.items.forEach(function(it){var row=$("#r"+it.i);if(row)row.hidden=(it.i!==i)});
  var rv=$("#review");if(rv)rv.hidden=(i!==n);
  if(i===n)updateReview();
  var corr=cur.round>0,pend=pendentes().map(function(x){return x.i}),pos=pend.indexOf(i);
  var prev=$("#btnPrev"),next=$("#btnNext");
  if(prev){prev.hidden=corr?(pos<=0):(i===0)}
  if(next){
    next.hidden=(i===n)&&!corr;
    next.textContent=corr?(pos>=pend.length-1||pos<0?"Conferir correções":"Próxima"):(i>=n-1?"Revisar":"Próxima");
  }
  updateMapa();saveDraftSoon();window.scrollTo(0,0);
  if(i<n){startDwell(i);setTimeout(function(){if(cur&&cur.q===i&&!cur.pauseAt)focusItem(i)},30)}
}
function stepNext(){
  if(!cur||cur.modo!=="uma")return;
  if(cur.round>0){
    var pend=pendentes().map(function(x){return x.i}),pos=pend.indexOf(cur.q);
    if(pos<0||pos>=pend.length-1)return submit();
    return showQ(pend[pos+1]);
  }
  showQ(cur.q+1);
}
function stepPrev(){
  if(!cur||cur.modo!=="uma")return;
  if(cur.round>0){var pend=pendentes().map(function(x){return x.i}),pos=pend.indexOf(cur.q);if(pos>0)showQ(pend[pos-1]);return}
  showQ(cur.q-1);
}
function updateReview(){
  var miss=cur.items.filter(rowBlank);
  var m=$("#revMsg"),box=$("#revMiss");if(!m||!box)return;
  m.textContent=miss.length?(miss.length>1?"Faltam "+miss.length+" contas sem resposta:":"Falta 1 conta sem resposta:"):"Todas as contas têm resposta. Pode entregar!";
  box.innerHTML=miss.map(function(it){return '<button type="button" class="btn ghost small rev-go" data-i="'+it.i+'">Ir para a conta '+(it.i+1)+'</button>'}).join("");
  $$("#revMiss [data-i]").forEach(function(b){b.onclick=function(){showQ(Number(b.getAttribute("data-i")))}});
}
function renderSheet(){
  var L=FC.LEVELS[cur.level],d=new Date(),uma=cur.modo==="uma";
  FC.render('<div class="paper"><div class="sh-head">'+
    '<div><span class="k">Folha</span><span class="v">Nível '+L.id+'</span></div>'+
    '<div><span class="k">Aluno</span><span class="v">'+esc(S.me.name)+'</span></div>'+
    '<div><span class="k">Data</span><span class="v">'+FC.pad(d.getDate())+'/'+FC.pad(d.getMonth()+1)+'</span></div>'+
    '<div class="timer" id="timerBox"><span class="k">Tempo / meta '+FC.fmtTime(L.target)+'</span><span class="v" id="timer">00:00</span><button type="button" class="pause-mini" id="btnPause" aria-label="Fazer uma pausa">'+FC.icon("pause")+' Pausa <b id="pauseLeft"></b></button></div></div>'+
    '<div class="mapa" id="mapa" role="group" aria-label="Contas da folha">'+cur.items.map(function(it){
      return '<button type="button" class="mapa-b" data-i="'+it.i+'"><i>'+(it.i+1)+'</i></button>'}).join("")+'</div>'+
    '<ol class="items" id="items">'+cur.items.map(function(it){
      return '<li class="row'+(FC.isRich(it)?' rich-row':'')+'" id="r'+it.i+'">'+FC.itemInner(it,it.i)+'</li>'}).join("")+'</ol>'+
    (uma?'<div class="review" id="review" hidden><h2>Pronto para entregar?</h2><p id="revMsg" class="muted"></p><div id="revMiss"></div>'+
      '<button class="btn reward block" id="btnSubmit">Entregar folha</button></div>':"")+
    '<div class="sh-foot"><div class="msg" id="shMsg">'+esc(cur.intro)+'</div>'+
    (uma?'<div class="actions step-nav"><button class="btn ghost small" id="btnExit">Sair da folha</button><span class="grow"></span><button class="btn ghost" id="btnPrev">Anterior</button><button class="btn" id="btnNext">Próxima</button></div>'
        :'<div class="actions"><button class="btn ghost small" id="btnExit">Sair da folha</button><button class="btn" id="btnSubmit">Entregar folha</button></div>')+'</div></div>');
  cur.items.forEach(function(it){
    var inp=$("#in"+it.i);
    if(it.extra&&it.extra.opts){
      /* exercício de escolha: os botões gravam o número da opção no campo escondido */
      $$("#r"+it.i+" .opt").forEach(function(btn){
        btn.addEventListener("click",function(){
          if(it.ok)return;
          inp.value=btn.getAttribute("data-k");
          $$("#r"+it.i+" .opt").forEach(function(o){o.classList.toggle("sel",o===btn)});
          $("#r"+it.i).classList.remove("bad");clearMiss(it.i);updateMapa();saveDraftSoon();noteFirstInput(it.i);
          if(uma)return;
          for(var k=it.i+1;k<cur.items.length;k++)if(!cur.items[k].ok){focusItem(k);return}
        });
        if(!uma){btn.addEventListener("focus",function(){startDwell(it.i)});
        btn.addEventListener("blur",stopDwell)}
      });
      return;
    }
    inp.addEventListener("input",function(){inp.value=inp.value.replace(/[^0-9,.]/g,"").replace(/\./g,",").replace(/,/g,function(m,o,t){return t.indexOf(",")===o?m:""});$("#r"+it.i).classList.remove("bad");clearMiss(it.i);updateMapa();saveDraftSoon();noteFirstInput(it.i)});
    if(!uma){inp.addEventListener("focus",function(){startDwell(it.i)});
    inp.addEventListener("blur",stopDwell)}
    inp.addEventListener("keydown",function(e){
      if(e.key!=="Enter")return;e.preventDefault();
      if(uma)return stepNext();
      for(var k=it.i+1;k<cur.items.length;k++)if(!cur.items[k].ok){focusItem(k);return}
      submit();
    });
  });
  $("#btnSubmit").onclick=submit;
  if(uma){$("#btnNext").onclick=stepNext;$("#btnPrev").onclick=stepPrev}
  $$("#mapa [data-i]").forEach(function(b){b.onclick=function(){goItem(Number(b.getAttribute("data-i")))}});
  $("#btnExit").onclick=exitSheet;
  $("#btnPause").onclick=function(){startPause("manual")};updatePauseBtn();
  clearInterval(timerId);cur.t0=Date.now();cur.pauseMs=0;cur.pauseAt=null;cur.pauses=0;
  timerId=setInterval(function(){
    if(!cur||cur.secs!=null||!$("#timer"))return;
    var s=elapsedMs()/1000;$("#timer").textContent=FC.fmtTime(s);
    $("#timerBox").classList.toggle("over",s>FC.LEVELS[cur.level].target);
  },250);
  if(!restoreDraft()){if(uma)showQ(0);else focusItem(0)}
  updateMapa();
}
/* Leva o foco para a conta: a caixa de resposta, ou a primeira opção nos exercícios de escolha. */
function focusItem(i){
  var it=cur&&cur.items[i];if(!it)return;
  var el=(it.extra&&it.extra.opts)?$("#r"+i+" .opt"):$("#in"+i);
  if(el&&el.focus)el.focus();
}
function setMsg(t,bad){var m=$("#shMsg");m.textContent=t;m.classList.toggle("bad",!!bad)}
function submit(){
  if(!cur||busy)return;
  /* Conta sem resposta não é erro e não gasta tentativa: avisa qual falta, destaca e leva até ela, sem parar o relógio. */
  var blanks=cur.items.filter(rowBlank);
  if(blanks.length){
    blanks.forEach(function(it){
      var row=$("#r"+it.i),prevBad=row.classList.contains("bad");
      row.classList.add("miss");
      if(!row.querySelector(".miss-tag")){var tg=document.createElement("div");tg.className="miss-tag";tg.textContent=prevBad?"Falta corrigir":"Falta responder";row.insertBefore(tg,row.firstChild)}
    });
    var nums=blanks.map(function(it){return it.i+1}),lista=nums.length>1?nums.slice(0,-1).join(", ")+" e "+nums[nums.length-1]:String(nums[0]);
    var corrigir=blanks.every(function(it){return $("#r"+it.i).classList.contains("bad")});
    setMsg(nums.length>1?"Faltam as contas "+lista+". Elas estão marcadas em amarelo.":"Falta a conta "+lista+". Ela está marcada em amarelo.",true);
    updateMapa();goItem(blanks[0].i);
    track("folha_conta_em_branco",{level:cur.level,sheet:cur.id,data:{contas:nums}});
    return;
  }
  if(cur.round===0){stopDwell();cur.secs=cur.modo==='uma'?Math.min(Math.max(3,cur.dwell.reduce(function(a,b){return a+b},0)/1000),elapsedMs()/1000,14000):Math.min(elapsedMs()/1000,14000);clearInterval(timerId);$("#timer").textContent=FC.fmtTime(cur.secs)}
  cur.round++;
  var wrong=0,focus=null;
  cur.items.forEach(function(it){
    if(it.ok)return;
    var inp=$("#in"+it.i),row=$("#r"+it.i),v=inp.value.trim(),good=v!==""&&(it.extra&&it.extra.opts?Number(v)===it.a:FC.sameAns(v,it.a)),isChoice=!!(it.extra&&it.extra.opts);
    it.tries++;
    if(it.tries===1){it.first=good;it.firstVal=v}
    if(it.vals.length<6)it.vals.push(v);
    if(good){
      it.ok=true;inp.readOnly=true;row.classList.remove("bad");row.classList.add("ok");var tp=row.querySelector(".tip");if(tp)tp.remove();
      if(isChoice)$$("#r"+it.i+" .opt").forEach(function(o){o.disabled=true;o.classList.toggle("right",o.classList.contains("sel"))});
    }else{
      wrong++;row.classList.add("bad");inp.value="";if(focus==null)focus=it.i;
      if(isChoice)$$("#r"+it.i+" .opt").forEach(function(o){o.classList.remove("sel")});
      if(it.tries>=3&&!row.querySelector(".tip")){var tip=document.createElement("div");tip.className="tip";
        tip.textContent=isChoice?"Dica: a resposta certa é a opção "+it.a+". Olhe com calma e tente entender o porquê.":"Dica: a resposta é "+FC.numBR(it.a)+". Escreva e tente entender o caminho.";row.appendChild(tip)}
    }
  });
  updateMapa();saveDraft();
  if(wrong===0)return finish();
  setMsg("Faltam "+wrong+" para corrigir. Refaça só as contas em vermelho; as certas já foram marcadas.",true);
  $("#btnSubmit").textContent="Conferir correções";
  if(cur.modo==="uma")showQ(focus);else focusItem(focus);
}

async function finish(){
  clearInterval(timerId);
  var items=cur.items,score=items.filter(function(i){return i.first}).length;
  var payload={p_token:S.token,p_sheet:cur.id,p_first_ok:score,p_secs:Math.round(cur.secs*10)/10,
    p_answers:items.map(function(i){return{v:i.firstVal,ok:i.first,tries:i.tries,ms:Math.round(cur.dwell[i.i]||0),vals:i.vals,ti:cur.tfi[i.i]==null?null:cur.tfi[i.i],modo:cur.modo}}),
    p_corrections:items.filter(function(i){return i.tries>1}).length};
  await send(payload,score);
}
async function send(payload,score){
  FC.render('<div class="panel center"><h1>Enviando sua folha…</h1></div>');
  var res;
  try{res=await rpc("student_submit_sheet",payload)}
  catch(e){
    if(FC.isSessionErr(e)){setTok(null);return pinScreen("login",null,"Sua sessão acabou. Digite o PIN.")}
    if(String(e.message||"").indexOf("folha_invalida")>=0){
      clearDraft();
      FC.render('<div class="panel center"><h1>Esta folha já foi entregue</h1><p class="muted">Ela foi entregue em outro aparelho, então esta cópia não vale nada. Volte ao início para ver a sua folha de hoje.</p><p><button class="btn" id="goHome">Ir ao início</button></p></div>');
      $("#goHome").onclick=async function(){try{await goHome()}catch(x){fail(x)}};return;
    }
    FC.render('<div class="panel center"><h1>Não consegui enviar</h1><p class="muted">'+esc(FC.err(e))+' Seu resultado está guardado nesta tela.</p><p><button class="btn" id="again">Enviar de novo</button></p></div>');
    $("#again").onclick=function(){send(payload,score)};return;
  }
  clearDraft();
  FC.tabState.aluno="inicio";try{sessionStorage.setItem("fc_tab_aluno","inicio")}catch(e){}
  var L=FC.LEVELS[cur.level],secs=payload.p_secs,fixes=payload.p_corrections;
  var npct=res.normal_acertos||80;
  var rules=npct+"% ou mais de acertos de primeira no dia e tempo médio de até "+FC.fmtTime(L.target)+" por folha";
  var note;
  if(res.day_closed&&res.tier==="salto")note="Que dia! Você acertou "+res.day_ok+" de "+res.day_total+" contas de primeira ("+res.day_pct+"%), bem rápido, e pulou direto para o próximo nível, sem esperar os carimbos.";
  else if(res.day_closed&&res.tier==="ouro")note="Dia de ouro! Você acertou "+res.day_ok+" de "+res.day_total+" contas de primeira ("+res.day_pct+"%), com tempo médio de "+FC.fmtTime(res.day_avg_secs)+" por folha, e ganhou "+res.gained+" carimbos de uma vez, além da perseverança.";
  else if(res.day_closed&&res.stamp)note="Dia fechado com carimbo e perseverança! Você acertou "+res.day_ok+" de "+res.day_total+" contas de primeira ("+res.day_pct+"%), com tempo médio de "+FC.fmtTime(res.day_avg_secs)+" por folha.";
  else if(res.day_closed){
    var acertos="Hoje você acertou "+res.day_pct+"% de primeira (o carimbo pede "+npct+"% ou mais)",tempo="o tempo médio de "+FC.fmtTime(res.day_avg_secs)+" por folha passou da meta de "+FC.fmtTime(L.target);
    note=(res.why==="tempo"?"Você acertou "+res.day_pct+"% de primeira, mas "+tempo+".":res.why==="acertos_tempo"?acertos+", e "+tempo+".":acertos+".")+" Sem carimbo hoje, mas você fechou o dia e ganhou o pacotinho da perseverança. Amanhã tem outra chance. As contas que você errou voltam nas próximas folhas.";
  }else note="Acertos de primeira hoje: "+res.day_ok+" de "+res.day_total+" ("+res.day_pct+"%). O carimbo e os pacotinhos do dia saem ao fechar a última folha. O carimbo pede "+rules+"."+(fixes>0?" As contas que você errou voltam nas próximas folhas.":"");
  var newL=FC.LEVELS[res.level_idx];
  S.me.level_idx=res.level_idx;S.me.stamps=res.stamps;S.me.done_today++;S.me.today_ok=res.day_ok;S.me.today_total=res.day_total;
  S.me.offer_back=res.offer_back;S.me.streak=res.streak;S.me.best_streak=res.best_streak;S.me.next_marco=res.next_marco;S.me.pending_packs=res.pending_packs;
  var pk=res.packs||{},got=(pk.carimbo||0)+(pk.perseveranca||0)+(pk.marco||0);
  var left=S.me.quota-S.me.done_today,need=res.stamps_needed,shown=res.shown_stamps,row=FC.stampSet(need,shown,(res.stamp&&!res.advanced)?shown-(res.gained||1):null);
  var seal=res.day_closed?(res.tier==="salto"?"Salto!":res.tier==="ouro"?"Ouro!":res.stamp?"Carimbo":"Sem carimbo"):"Folha "+res.day_done+" de "+res.day_quota;
  FC.nav.at("/resultado",true);   // a folha vira o resultado: voltar leva para a tela inicial, não para a folha entregue
  FC.render('<div class="res panel">'+
    '<div class="score"><div class="big">'+score+'/10</div><div class="seal'+(res.day_closed&&res.stamp?"":" no")+'">'+seal+'</div>'+
    '<div class="grow"><h2>'+(res.tier==="salto"?"Salto de nível":res.tier==="ouro"?"Dia de ouro":res.stamp?"Muito bem":"Folha entregue")+', '+esc(S.me.name)+'</h2><div class="muted">'+note+'</div></div></div>'+
    '<div class="kv"><div><b>'+FC.fmtTime(secs)+'</b><span>seu tempo (meta '+FC.fmtTime(L.target)+')</span></div>'+
    '<div><b>'+(res.day_closed?"+"+got:"–")+'</b><span>'+(res.day_closed?"pacotinho"+(got===1?"":"s")+" ganho"+(got===1?"":"s")+" hoje":"pacotinhos saem ao fechar o dia")+'</span></div>'+
    '<div><b>'+res.streak+'</b><span>dia'+(res.streak===1?"":"s")+' seguido'+(res.streak===1?"":"s")+' de estudo</span></div></div>'+
    '<div class="stamprow"><span>'+(res.advanced?"Nível "+L.id+" concluído":"Carimbos do nível "+L.id)+'</span><span class="row-gap">'+row+'</span><span>'+shown+' de '+need+'</span></div>'+
    (res.teto?'<div class="panel offer"><b>Você completou os carimbos deste nível!</b><div class="muted small-t">Peça ao seu responsável para liberar os próximos níveis. Enquanto isso, continue treinando e ganhando figurinhas.</div></div>':'')+
    (res.advanced?'<div class="levelup" id="levelup"><div class="lu-badge">'+newL.id+'</div><div><div class="lu-title">'+(res.tier==="salto"?"Você pulou direto de nível!":"Você subiu de nível!")+'</div><div class="muted">Agora você está no nível '+newL.id+' · '+esc(newL.name)+'. As contas que você ainda errou vêm junto para as próximas folhas.</div></div></div>':'')+
    '<div class="trailbox">'+FC.streakHtml(res)+'</div>'+
    '<p class="muted">'+(left>0?"Faltam "+left+" folha"+(left>1?"s":"")+" para fechar o dia.":"Dia fechado. Até o próximo dia de estudo!")+'</p>'+
    '<div class="actions">'+(left>0?'<button class="btn" id="resNext">Próxima folha</button>':'')+'<button class="btn ghost" id="resHome">Ir ao início</button></div></div>');
  if(got>0){
    var why=[];
    if(pk.carimbo)why.push("1 pelo carimbo do dia");
    if(pk.perseveranca)why.push(res.free_day?"1 por fechar o dia livre":"1 pela perseverança (dia fechado)");
    if(pk.marco)why.push(pk.marco+" pelos "+res.marco_streak+" dias seguidos");
    setTimeout(function(){
      FC.sfx.pack();FC.confetti(pk.marco?{gold:true,n:70}:undefined);
      FC.overlay('<div class="pack-reveal opened"><div class="goalicon open" style="width:120px;margin:0 auto">'+FC.packSvg()+'</div></div><h2>'+(got>1?"Você ganhou "+got+" pacotinhos!":"Você ganhou um pacotinho!")+'</h2><p class="muted">'+why.join(", ")+'.</p><p class="muted small-t">Seus pacotinhos estão esperando na tela inicial. Toque em <b>Abrir pacotinho</b> quando quiser'+(deskOf(S.me).length>1?' e escolha de qual álbum da mesa quer a figurinha':'')+'.</p>',
        {button:"Entendi"});
    },res.advanced?3600:2300);
  }
  if(res.stamp)FC.sfx.stamp();
  setTimeout(trAnnounce,2500);   // entre uma folha e outra a criança pode receber o aviso de troca
  if(res.advanced)setTimeout(function(){if($("#levelup")){FC.sfx.levelUp();FC.confetti()}},1000);
  if(left>0){$("#resNext").onclick=startSheet;prepare()}
  $("#resHome").onclick=async function(){try{await goHome()}catch(e){fail(e)}};
}
})();
