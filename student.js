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

FC.studentApp=async function(code){
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
    try{await loadHome();return}
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
      if(r.ok){setTok(r.token);S.token=r.token;S.info.has_pin=true;await loadHome();return}
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
async function loadHome(){
  S.me=await rpc("student_me",{p_token:S.token,p_day:FC.today()});
  home();
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
    canStart=true;status="Hoje: <b>"+m.done_today+" de "+m.quota+"</b> folhas feitas."+(m.today_total>0?" Acertos de primeira hoje: <b>"+m.today_ok+" de "+m.today_total+"</b> ("+Math.round(100*m.today_ok/m.today_total)+"%).":"");
  }
  var need=m.stamps_needed||5,stamps="";for(var i=0;i<need;i++)stamps+='<span class="stamp'+(i<m.stamps?" on":"")+'">✓</span>';
  var hero;
  if(canStart)hero='<section class="hero"><span class="eyebrow">Hoje · folha '+(m.done_today+1)+' de '+m.quota+'</span><h2>'+esc(L.name)+'</h2><p>'+status+'</p><button class="btn reward block" id="start">Começar folha '+(m.done_today+1)+'</button></section>';
  else hero='<section class="hero"><span class="eyebrow">Hoje</span><h2>'+(m.quota===0?"Sem folha hoje":"Meta de hoje cumprida!")+'</h2><p>'+status+'</p></section>';
  var rows=m.recent.map(function(r){
    return "<tr><td>"+FC.dm(r.day)+"</td><td>"+esc(FC.lv(r.level))+"</td><td>"+r.ok+"/"+r.total+"</td><td>"+FC.fmtTime(r.secs)+"</td><td>"+(r.advanced?'<span class="tag ok">subiu de nível</span>':r.stamp?'<span class="tag ok">carimbo do dia</span>':'')+"</td></tr>"}).join("");
  var inicio=offerHtml(m,L)+hero+packPanel(m)+
    '<section class="panel"><div class="split"><b>Carimbos do nível '+L.id+'</b><span class="muted small-t">'+Math.min(m.stamps,need)+' de '+need+'</span></div><div class="stamps gap">'+stamps+'</div>'+
    '<p class="muted small-t gap">Um carimbo por dia, com '+(m.normal_acertos||80)+'% ou mais de acertos de primeira. Cada carimbo vale um pacotinho de figurinhas. Com '+need+' carimbos você sobe de nível.</p></section>'+
    '<section class="panel">'+FC.streakHtml(m)+'</section>'+FC.installBox();
  var progresso='<section class="panel now"><span class="eyebrow">Nível atual</span><div class="lvl">'+L.id+'</div>'+
    '<div><div class="nm">'+esc(L.name)+'</div><div class="muted">'+esc(L.hint)+'</div></div>'+
    '<div class="stamps">'+stamps+'<span>'+Math.min(m.stamps,need)+' de '+need+'</span></div></section>'+
    '<section class="panel rule"><b>Como ganhar o carimbo</b><p class="small-t">Cada dia em que você acerta <b>'+(m.normal_acertos||80)+'% ou mais</b> das contas de primeira, com tempo médio de até <b>'+FC.fmtTime(L.target)+'</b> por folha, vale <b>1 carimbo</b>. Com '+need+' carimbos você sobe de nível. As contas que você errar voltam nas próximas folhas, até no nível seguinte.</p>'+
      '<p class="small-t"><b>Dia de ouro:</b> acertando <b>'+(m.ouro_acertos||95)+'% ou mais</b> de primeira, com tempo médio de até <b>'+FC.fmtTime(Math.round(L.target*(m.ouro_tempo||80)/100))+'</b> por folha, o dia vale <b>'+(m.ouro_carimbos||2)+' carimbos</b>. E quem já sabe o assunto pode até <b>pular direto</b> para o próximo nível.</p></section>'+
    '<section class="panel rule"><b>Como ganhar pacotinhos de figurinhas</b><ul class="plain small-t">'+
      '<li><b>Carimbo do dia:</b> 1 pacotinho.</li>'+
      '<li><b>Perseverança:</b> fechou todas as folhas do dia, mesmo sem carimbo? 1 pacotinho.</li>'+
      '<li><b>Dias seguidos de estudo:</b> pacotinhos extras com 3, 7 e 14 dias, e depois a cada 30 dias. Faltar a um dia de estudo zera a sequência.</li></ul></section>'+
    '<section class="panel"><div class="eyebrow">Suas últimas folhas</div>'+(rows?'<div class="tablewrap gap"><table><thead><tr><th>Dia</th><th>Nível</th><th>Acertos</th><th>Tempo</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<p class="muted gap">Você ainda não fez nenhuma folha.</p>')+'</section>';
  var head='<header class="appbar"><img src="icons/icon-192.png" alt=""><div class="grow"><small>Oi,</small><b>'+esc(m.name)+'</b></div>'+
    '<button type="button" class="iconbtn" id="sndBtn"></button><button type="button" class="iconbtn" id="logout" aria-label="Sair">'+FC.icon("logout")+'</button></header>';
  FC.render('<div class="tone-aluno">'+FC.tabsShell({scope:"aluno",head:head,tabs:[
    {id:"inicio",label:"Início",icon:"home",html:inicio},
    {id:"album",label:"Álbum",icon:"album",html:albumPane(m)},
    {id:"trocas",label:"Trocas",icon:"swap",html:tradesPane()},
    {id:"amigos",label:"Amigos",icon:"friends",html:'<div id="frBox"><p class="loading">Carregando…</p></div>'},
    {id:"progresso",label:"Progresso",icon:"progress",html:progresso}]})+'</div>');
  FC.bindTabs("aluno");FC.refreshInstall();
  $("#logout").onclick=logout;
  function sndLabel(){var on=FC.sfx.enabled(),b=$("#sndBtn");b.innerHTML=FC.icon(on?"sound":"soundoff");b.setAttribute("aria-label",on?"Som ligado. Tocar para desligar":"Som desligado. Tocar para ligar")}
  sndLabel();
  $("#sndBtn").onclick=function(){var on=!FC.sfx.enabled();FC.sfx.set(on);sndLabel();if(on)FC.sfx.stamp()};
  if(canStart){$("#start").onclick=startSheet;prepare()}
  bindOffer(m);
  bindPack();bindAlbum();friendsLoad();TR.step="home";trLoad();
  if(m.pending_packs>0&&!S.packAsked){S.packAsked=true;setTimeout(openPackFlow,500)}
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
  var L=FC.LEVELS[v.level_idx],stamps="";for(var i=0;i<5;i++)stamps+='<span class="stamp'+(i<v.stamps?" on":"")+'">✓</span>';
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
var TR={step:"home",fid:null,fname:"",opts:null,give:null,want:null,data:null,ch:null,poll:null,announced:{}};
function stk(t,sl,badge){return FC.stickerHtml(t,sl,{noflip:true,badge:badge||0})}
function tradesPane(){return '<div id="trBox"><p class="loading">Carregando…</p></div>'}
function canNotify(){return !busy&&(!cur||cur.secs!=null)}
function pairHtml(recv,give){
  return '<div class="tr-swap"><div><div class="muted small-t center">Você recebe</div>'+stk(recv[0],recv[1])+'</div>'+FC.icon("swap")+
    '<div><div class="muted small-t center">Você dá</div>'+stk(give[0],give[1])+'</div></div>';
}
function nameOf(t,sl){return FC.stickerInfo(t,sl).name}
async function trLoad(){
  if(!S.token)return;
  try{
    TR.data=await rpc("student_trades",{p_token:S.token});
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
  TR.ch=null;if(TR.poll)clearInterval(TR.poll);TR.poll=null;TR.data=null;TR.announced={};TR.step="home";
}
function goTrocas(){
  FC.tabState.aluno="trocas";try{sessionStorage.setItem("fc_tab_aluno","trocas")}catch(e){}
  var b=$('.navtop [data-tab="trocas"]');
  if(b&&$('.shell[data-scope="aluno"]'))b.click();else loadHome().catch(fail);
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
      if(a.status==="aceita"){got++;FC.toast(a.name+" aceitou a troca! Você ganhou "+nameOf(a.want_theme,a.want_slot)+".")}
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
    return '<div class="tr-req"><b>'+esc(x.name)+'</b> quer trocar com você'+pairHtml([x.give_theme,x.give_slot],[x.want_theme,x.want_slot])+
      '<div class="actions"><button class="btn" data-tans="'+x.id+'" data-ok="1">Aceitar a troca</button><button class="btn ghost" data-tans="'+x.id+'">Agora não</button></div></div>'}).join("");
  var out=d.outgoing.map(function(x){
    return '<div class="tr-req"><div class="split"><span>Pedido para <b>'+esc(x.name)+'</b></span><button class="btn ghost small" data-tcancel="'+x.id+'">Cancelar</button></div>'+
      pairHtml([x.want_theme,x.want_slot],[x.give_theme,x.give_slot])+'<div class="muted small-t center">Esperando a resposta</div></div>'}).join("");
  var total=dups.reduce(function(a,x){return a+x.spare},0);
  var rep=dups.length?'<div class="album gap">'+dups.map(function(x){return stk(x.theme,x.slot,x.spare)}).join("")+'</div>':
    '<p class="muted small-t gap">Você ainda não tem repetidas. Quando um pacotinho trouxer uma figurinha que você já tem, ela aparece aqui, pronta para trocar.</p>';
  box.innerHTML=
    (inc?'<section class="panel"><b>Pedidos de troca para você</b>'+inc+'</section>':'')+
    '<section class="panel"><b>Trocar com um amigo</b><p class="muted small-t">Escolha um amigo e veja quais das suas repetidas ele ainda não tem.</p>'+
      (friends.length?(dups.length?'<button class="btn" id="trNew">Nova troca</button>':'<p class="muted small-t gap">Você precisa de pelo menos uma figurinha repetida.</p>'):'<p class="muted small-t gap">Primeiro faça amigos na aba Amigos.</p>')+'</section>'+
    (out?'<section class="panel"><b>Pedidos que você fez</b>'+out+'</section>':'')+
    '<section class="panel"><div class="split"><b>Minhas repetidas</b><span class="muted small-t num">'+total+'</span></div>'+rep+'</section>';
  var nb=$("#trNew");if(nb)nb.onclick=function(){TR.step="friend";TR.give=TR.want=TR.opts=null;trFlow()};
  $$("[data-tans]",box).forEach(function(b){b.onclick=function(){trAnswer(b.getAttribute("data-tans"),!!b.getAttribute("data-ok"),b)}});
  $$("[data-tcancel]",box).forEach(function(b){b.onclick=async function(){
    b.disabled=true;
    try{await rpc("student_trade_cancel",{p_token:S.token,p_id:b.getAttribute("data-tcancel")});FC.toast("Pedido cancelado.")}catch(e){FC.toast(FC.err(e),true)}
    trLoad()}});
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
      TR.step="give";trFlow()}});
    return;
  }
  var o=TR.opts,nm=esc(TR.fname);
  if(TR.step==="give"){
    if(!o.give.length||!o.get.length){
      box.innerHTML=back("Escolher outro amigo")+'<section class="panel"><b>Ainda não dá para trocar com '+nm+'</b><p class="muted small-t gap">'+
        (!o.give.length?'Nenhuma das suas repetidas serve para '+nm+': ele já tem todas, ou não tem o álbum delas. ':'')+
        (!o.get.length?nm+' não tem repetidas que faltam para você, nos álbuns que vocês dois têm. ':'')+'Volte depois de abrir mais pacotinhos.</p></section>';
      $("#trBack").onclick=function(){TR.step="friend";trFlow()};return;
    }
    box.innerHTML=back("Escolher outro amigo")+'<section class="panel"><b>1. Qual repetida sua você oferece a '+nm+'?</b><p class="muted small-t">Só aparecem as que '+nm+' ainda não tem.</p>'+
      '<div class="album gap">'+o.give.map(function(x,i){return '<button type="button" class="tr-pick" data-i="'+i+'" aria-label="Oferecer '+esc(nameOf(x.theme,x.slot))+'">'+stk(x.theme,x.slot,x.spare)+'</button>'}).join("")+'</div></section>';
    $("#trBack").onclick=function(){TR.step="friend";trFlow()};
    $$(".tr-pick",box).forEach(function(b){b.onclick=function(){TR.give=o.give[Number(b.getAttribute("data-i"))];TR.step="want";trFlow()}});
    return;
  }
  if(TR.step==="want"){
    box.innerHTML=back("Mudar a minha figurinha")+'<section class="panel"><b>2. O que você quer de '+nm+'?</b><p class="muted small-t">Só aparecem as repetidas dele que ainda faltam para você.</p>'+
      '<div class="album gap">'+o.get.map(function(x,i){return '<button type="button" class="tr-pick" data-i="'+i+'" aria-label="Pedir '+esc(nameOf(x.theme,x.slot))+'">'+stk(x.theme,x.slot,x.spare)+'</button>'}).join("")+'</div></section>';
    $("#trBack").onclick=function(){TR.step="give";trFlow()};
    $$(".tr-pick",box).forEach(function(b){b.onclick=function(){TR.want=o.get[Number(b.getAttribute("data-i"))];TR.step="confirm";trFlow()}});
    return;
  }
  if(TR.step==="confirm"){
    box.innerHTML=back("Mudar o que eu quero")+'<section class="panel center"><b>Pedir esta troca a '+nm+'?</b>'+pairHtml([TR.want.theme,TR.want.slot],[TR.give.theme,TR.give.slot])+
      '<p class="muted small-t">'+nm+' vai receber o aviso e pode aceitar ou recusar. O pedido vale por 7 dias.</p><button class="btn reward" id="trSend">Pedir a troca</button></section>';
    $("#trBack").onclick=function(){TR.step="want";trFlow()};
    $("#trSend").onclick=async function(){
      this.disabled=true;
      try{
        await rpc("student_trade_propose",{p_token:S.token,p_friendship:TR.fid,gt:TR.give.theme,gs:TR.give.slot,wt:TR.want.theme,ws:TR.want.slot});
        FC.toast("Pedido enviado para "+TR.fname+"!");TR.step="home";
      }catch(e){FC.toast(FC.err(e),true);TR.step="friend"}
      trLoad();trFlow();
      if(TR.step==="home")trRender();
    };
  }
}
/* ---------- álbuns e pacotinhos ---------- */
function themesOf(m){return (m.sticker_themes&&m.sticker_themes.length)?m.sticker_themes:[m.sticker_theme||"dinossauros"]}
/* Cada cópia ganha é uma linha em m.stickers. gotOf = as figurinhas diferentes do álbum (sem contar repetidas). */
function gotOf(m,id){var seen={};return (m.stickers||[]).filter(function(g){if((g.theme||m.sticker_theme)!==id||seen[g.slot])return false;seen[g.slot]=1;return true})}
/* Repetidas: cópias além da primeira de cada figurinha. */
function dupsOf(m){
  var c={},out=[];
  (m.stickers||[]).forEach(function(g){var k=(g.theme||m.sticker_theme)+"|"+g.slot;c[k]=(c[k]||0)+1});
  Object.keys(c).forEach(function(k){if(c[k]>1){var p=k.split("|");if(themesOf(m).indexOf(p[0])>=0)out.push({theme:p[0],slot:Number(p[1]),spare:c[k]-1})}});
  return out;
}
function isFull(m,id){return gotOf(m,id).length>=FC.ALBUM_SIZE}
function packPanel(m){
  var n=m.pending_packs||0;if(n<1)return "";
  return '<section class="panel packbox"><div class="goalicon open">'+FC.packSvg()+'</div><div class="grow"><b>Você tem '+n+' pacotinho'+(n>1?'s':'')+' para abrir!</b>'+
    '<div class="muted small-t">'+(themesOf(m).length>1?'Escolha de qual álbum você quer a figurinha.':'Toque para descobrir a figurinha.')+'</div></div>'+
    '<button class="btn reward" data-pack>Abrir pacotinho</button></section>';
}
/* Aba Álbum: com mais de um álbum, a criança escolhe qual ver pelas etiquetas. */
function albumPane(m){
  var ids=themesOf(m),id=ids.indexOf(S.albumTheme)>=0?S.albumTheme:ids[0];S.albumTheme=id;
  var th=FC.theme(id),got=gotOf(m,id);
  function chip(x){return '<button type="button" class="chip-btn'+(x===id?" on":"")+'" data-album="'+x+'">'+(isFull(m,x)?"✔ ":"")+esc(FC.theme(x).name)+'</button>'}
  var going=ids.filter(function(x){return !isFull(m,x)}),full=ids.filter(function(x){return isFull(m,x)});
  var tabs=ids.length>1?'<div class="album-tabs">'+going.map(chip).join("")+'</div>'+(full.length?'<div class="album-tabs"><span class="muted small-t">Completos:</span>'+full.map(chip).join("")+'</div>':""):"";
  return packPanel(m)+'<section class="panel" id="albumBox">'+tabs+'<div class="split"><b>'+esc(th.name)+'</b><span class="muted small-t num">'+got.length+' de '+FC.ALBUM_SIZE+'</span></div>'+
    '<div class="bar"><i style="width:'+Math.round(got.length/FC.ALBUM_SIZE*100)+'%"></i></div>'+
    '<p class="muted small-t gap">'+(got.length>=FC.ALBUM_SIZE?'Álbum completo! Parabéns! As repetidas ficam na aba Trocas.':got.length?'Toque em uma figurinha para virar e ver os detalhes.':'Feche as folhas do dia para ganhar o primeiro pacotinho. Você só vê qual é a figurinha quando abrir!')+'</p>'+
    '<div class="gap">'+FC.albumHtml(id,got)+'</div></section>';
}
function bindPack(){$$("[data-pack]").forEach(function(b){b.onclick=openPackFlow})}
function bindAlbum(){$$("[data-album]").forEach(function(b){b.onclick=function(){
  S.albumTheme=b.getAttribute("data-album");
  var pane=$('.pane[data-pane="album"]');pane.innerHTML=albumPane(S.me);bindPack();bindAlbum();
}})}
/* Ganhou pacotinho: com mais de um álbum disponível, a criança escolhe de qual quer a figurinha. */
function openPackFlow(){
  var m=S.me;if(!(m.pending_packs>0))return;
  var ids=themesOf(m);
  if(ids.length===1)return openPack(ids[0]);
  var ov=FC.overlay('<h2>Escolha o seu pacotinho!</h2><p class="muted">Cada pacotinho tem uma figurinha surpresa. De qual álbum você quer?</p>'+
    '<div class="pack-choices">'+ids.map(function(id){
      var th=FC.theme(id),n=gotOf(m,id).length,full=n>=FC.ALBUM_SIZE;
      return '<button class="pack-choice" data-t="'+id+'"><span class="pc-art">'+FC.themeCover(id)+'</span><b>'+esc(th.name)+'</b><small>'+(full?"Completo! Só repetidas":n+" de "+FC.ALBUM_SIZE)+'</small></button>';
    }).join("")+'</div>',{button:"Agora não"});
  $$(".pack-choice",ov.el).forEach(function(b){b.onclick=function(){ov.close();openPack(b.getAttribute("data-t"))}});
}
async function openPack(theme){
  var m=S.me,res;
  try{res=await rpc("student_open_pack",{p_token:S.token,p_theme:theme})}
  catch(e){FC.toast(FC.err(e),true);try{await loadHome()}catch(x){}return}
  m.pending_packs=res.pending;
  m.stickers=(m.stickers||[]).concat([{theme:res.theme,slot:res.slot,end:res.period_end}]);
  showAward(res);
}
/* Figurinha nova: aviso no meio da tela, com o pacotinho abrindo e a figurinha aparecendo. */
function showAward(aw){
  var m=S.me;
  var th=FC.theme(aw.theme),n=aw.count||gotOf(m,aw.theme).length,tier=aw.tier||FC.tierOf(aw.theme,aw.slot);
  var rep_=!!aw.repeated;
  var titulo=tier==="ultra"?(rep_?"ULTRARRARA repetida!":"Figurinha ULTRARRARA!"):tier==="rara"?(rep_?"Rara repetida!":"Figurinha RARA!"):(rep_?"Figurinha repetida":"Figurinha nova!");
  var linha=tier==="comum"?"":'<p class="tier-msg">'+(tier==="ultra"?"Uma das mais difíceis do álbum inteiro!":"Uma figurinha difícil de conseguir!")+'</p>';
  FC.overlay('<div class="pack-reveal" id="packReveal"><div class="pack-closed">'+FC.packSvg()+'</div><div class="pack-card">'+FC.stickerHtml(th.id,aw.slot,{big:true})+'</div></div>'+
    '<h2 class="'+(tier==="comum"?"":"tier-title tier-"+tier)+'">'+titulo+'</h2>'+linha+'<p class="muted">Você já tem <b>'+n+' de '+FC.ALBUM_SIZE+'</b> no álbum '+esc(th.name)+'.</p>'+(rep_?'<p class="tier-msg">Você já tinha esta! Ela foi para as suas repetidas, na aba Trocas, e dá para trocar com um amigo.</p>':'')+(m.pending_packs>0?'<p class="muted small-t">Você ainda tem '+m.pending_packs+' pacotinho'+(m.pending_packs>1?'s':'')+' para abrir.</p>':''),{button:m.pending_packs>0?"Abrir o próximo":(rep_?"Guardar nas repetidas":"Colar no álbum"),cls:tier==="comum"?"":"tier-"+tier,onClose:function(){if(m.pending_packs>0)openPackFlow();else if(!cur&&S.me===m&&document.querySelector('.shell[data-scope="aluno"]'))home()}});
  setTimeout(function(){
    FC.sfx.pack();var el=$("#packReveal");if(el)el.classList.add("opened");
    if(tier==="comum"){FC.confetti();return}
    setTimeout(function(){FC.sfx[tier==="ultra"?"ultra":"rare"]();FC.confetti({gold:true,n:tier==="ultra"?90:64});
      if(tier==="ultra")setTimeout(function(){FC.confetti({gold:true,n:70})},700)},350);
  },800);
}
async function logout(){
  try{await rpc("student_logout",{p_token:S.token})}catch(e){}
  trStop();S.fr=null;setTok(null);S.token=null;prep=null;pinScreen("login",null);
}

/* ---------- folha ---------- */
/* A folha é preparada em segundo plano assim que a tela inicial abre (e logo depois de entregar uma folha):
   plano de reforço, contas sorteadas e registro da folha no banco. Ao tocar em "Começar", ela só abre. */
var prep=null;
function prepKey(){var m=S.me;return [FC.today(),m.level_idx,m.stamps,m.done_today].join("|")}
async function buildSheet(){
  var m=S.me,day=FC.today(),items,base="Preencha as 10 contas. O relógio já está correndo. Enter passa para a próxima.",intro=base;
  var plan=null;
  try{plan=await rpc("student_sheet_plan",{p_token:S.token})}catch(e){if(FC.isSessionErr(e))throw e}
  if(plan&&plan.mode==="mesma"&&plan.repeat&&plan.repeat.length===10){
    items=plan.repeat.map(FC.plainItem);
    intro="Esta é a mesma folha da última vez. Agora dá para acertar tudo! "+intro;
  }else if(plan&&plan.mode==="reforco"&&plan.weak&&plan.weak.length){
    items=FC.shuffle(FC.makeItems(m.level_idx,plan.weak));
    var w=plan.weak.length;
    intro="Esta folha traz "+w+" conta"+(w>1?"s":"")+" que você errou antes, para treinar. "+intro;
  }else{items=FC.makeItems(m.level_idx)}
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
  r.items.forEach(function(it,i){it.i=i;it.tries=0;it.ok=false;it.first=false;it.firstVal=""});
  cur={id:r.id,level:r.level,items:r.items,t0:Date.now(),secs:null,round:0,intro:r.intro,dwell:r.items.map(function(){return 0}),active:null,since:0};
  renderSheet();
}
/* Tempo por conta: soma dos períodos em que a caixa de resposta daquela conta ficou em foco (só na 1ª tentativa). */
function startDwell(i){if(!cur||cur.round>0)return;stopDwell();cur.active=i;cur.since=performance.now()}
function stopDwell(){if(cur&&cur.active!=null){cur.dwell[cur.active]+=performance.now()-cur.since;cur.active=null}}
function renderSheet(){
  var L=FC.LEVELS[cur.level],d=new Date();
  FC.render('<div class="paper"><div class="sh-head">'+
    '<div><span class="k">Folha</span><span class="v">Nível '+L.id+'</span></div>'+
    '<div><span class="k">Aluno</span><span class="v">'+esc(S.me.name)+'</span></div>'+
    '<div><span class="k">Data</span><span class="v">'+FC.pad(d.getDate())+'/'+FC.pad(d.getMonth()+1)+'</span></div>'+
    '<div class="timer" id="timerBox"><span class="k">Tempo / meta '+FC.fmtTime(L.target)+'</span><span class="v" id="timer">00:00</span></div></div>'+
    '<ol class="items" id="items">'+cur.items.map(function(it){
      return '<li class="row'+(FC.isRich(it)?' rich-row':'')+'" id="r'+it.i+'">'+FC.itemInner(it,it.i)+'</li>'}).join("")+'</ol>'+
    '<div class="sh-foot"><div class="msg" id="shMsg">'+esc(cur.intro)+'</div>'+
    '<div class="actions"><button class="btn ghost small" id="btnExit">Sair da folha</button><button class="btn" id="btnSubmit">Entregar folha</button></div></div></div>');
  cur.items.forEach(function(it){
    var inp=$("#in"+it.i);
    if(it.extra&&it.extra.opts){
      /* exercício de escolha: os botões gravam o número da opção no campo escondido */
      $$("#r"+it.i+" .opt").forEach(function(btn){
        btn.addEventListener("click",function(){
          if(it.ok)return;
          inp.value=btn.getAttribute("data-k");
          $$("#r"+it.i+" .opt").forEach(function(o){o.classList.toggle("sel",o===btn)});
          $("#r"+it.i).classList.remove("bad");
          for(var k=it.i+1;k<cur.items.length;k++)if(!cur.items[k].ok){focusItem(k);return}
        });
        btn.addEventListener("focus",function(){startDwell(it.i)});
        btn.addEventListener("blur",stopDwell);
      });
      return;
    }
    inp.addEventListener("input",function(){inp.value=inp.value.replace(/[^0-9]/g,"");$("#r"+it.i).classList.remove("bad")});
    inp.addEventListener("focus",function(){startDwell(it.i)});
    inp.addEventListener("blur",stopDwell);
    inp.addEventListener("keydown",function(e){
      if(e.key!=="Enter")return;e.preventDefault();
      for(var k=it.i+1;k<cur.items.length;k++)if(!cur.items[k].ok){focusItem(k);return}
      submit();
    });
  });
  $("#btnSubmit").onclick=submit;
  $("#btnExit").onclick=async function(){clearInterval(timerId);cur=null;try{await loadHome()}catch(e){fail(e)}};
  clearInterval(timerId);cur.t0=Date.now();
  timerId=setInterval(function(){
    if(!cur||cur.secs!=null)return;
    var s=(Date.now()-cur.t0)/1000;$("#timer").textContent=FC.fmtTime(s);
    $("#timerBox").classList.toggle("over",s>FC.LEVELS[cur.level].target);
  },250);
  focusItem(0);
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
  if(cur.round===0){stopDwell();cur.secs=(Date.now()-cur.t0)/1000;clearInterval(timerId);$("#timer").textContent=FC.fmtTime(cur.secs)}
  cur.round++;
  var wrong=0,focus=null;
  cur.items.forEach(function(it){
    if(it.ok)return;
    var inp=$("#in"+it.i),row=$("#r"+it.i),v=inp.value.trim(),good=v!==""&&Number(v)===it.a,isChoice=!!(it.extra&&it.extra.opts);
    it.tries++;
    if(it.tries===1){it.first=good;it.firstVal=v}
    if(good){
      it.ok=true;inp.readOnly=true;row.classList.remove("bad");row.classList.add("ok");var tp=row.querySelector(".tip");if(tp)tp.remove();
      if(isChoice)$$("#r"+it.i+" .opt").forEach(function(o){o.disabled=true;o.classList.toggle("right",o.classList.contains("sel"))});
    }else{
      wrong++;row.classList.add("bad");inp.value="";if(focus==null)focus=it.i;
      if(isChoice)$$("#r"+it.i+" .opt").forEach(function(o){o.classList.remove("sel")});
      if(it.tries>=3&&!row.querySelector(".tip")){var tip=document.createElement("div");tip.className="tip";
        tip.textContent=isChoice?"Dica: a resposta certa é a opção "+it.a+". Olhe com calma e tente entender o porquê.":"Dica: a resposta é "+it.a+". Escreva e tente entender o caminho.";row.appendChild(tip)}
    }
  });
  if(wrong===0)return finish();
  setMsg("Faltam "+wrong+" para corrigir. Refaça só as contas em vermelho; as certas já foram marcadas.",true);
  $("#btnSubmit").textContent="Conferir correções";
  focusItem(focus);
}

async function finish(){
  clearInterval(timerId);
  var items=cur.items,score=items.filter(function(i){return i.first}).length;
  var payload={p_token:S.token,p_sheet:cur.id,p_first_ok:score,p_secs:Math.round(cur.secs*10)/10,
    p_answers:items.map(function(i){return{v:i.firstVal,ok:i.first,tries:i.tries,ms:Math.round(cur.dwell[i.i]||0)}}),
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
      FC.render('<div class="panel center"><h1>Esta folha já foi entregue</h1><p class="muted">Ela foi entregue em outro aparelho, então esta cópia não vale nada. Volte ao início para ver a sua folha de hoje.</p><p><button class="btn" id="goHome">Ir ao início</button></p></div>');
      $("#goHome").onclick=async function(){try{await loadHome()}catch(x){fail(x)}};return;
    }
    FC.render('<div class="panel center"><h1>Não consegui enviar</h1><p class="muted">'+esc(FC.err(e))+' Seu resultado está guardado nesta tela.</p><p><button class="btn" id="again">Enviar de novo</button></p></div>');
    $("#again").onclick=function(){send(payload,score)};return;
  }
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
  var left=S.me.quota-S.me.done_today,need=res.stamps_needed,shown=res.shown_stamps,row="";
  for(var i=0;i<need;i++)row+='<span class="stamp'+(i<shown?" on":"")+((res.stamp&&!res.advanced&&i>=shown-(res.gained||1)&&i<shown)?" pop":"")+'">✓</span>';
  var seal=res.day_closed?(res.tier==="salto"?"Salto!":res.tier==="ouro"?"Ouro!":res.stamp?"Carimbo":"Sem carimbo"):"Folha "+res.day_done+" de "+res.day_quota;
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
    if(pk.perseveranca)why.push("1 pela perseverança (dia fechado)");
    if(pk.marco)why.push(pk.marco+" pelos "+res.marco_streak+" dias seguidos");
    setTimeout(function(){
      FC.sfx.pack();FC.confetti(pk.marco?{gold:true,n:70}:undefined);
      FC.overlay('<div class="pack-reveal opened"><div class="goalicon open" style="width:120px;margin:0 auto">'+FC.packSvg()+'</div></div><h2>'+(got>1?"Você ganhou "+got+" pacotinhos!":"Você ganhou um pacotinho!")+'</h2><p class="muted">'+why.join(", ")+'.'+(themesOf(S.me).length>1?' Você escolhe de qual álbum quer cada figurinha.':'')+'</p>',
        {button:got>1?"Abrir os pacotinhos":"Abrir o pacotinho",onClose:openPackFlow});
    },res.advanced?3600:2300);
  }
  if(res.stamp)FC.sfx.stamp();
  setTimeout(trAnnounce,2500);   // entre uma folha e outra a criança pode receber o aviso de troca
  if(res.advanced)setTimeout(function(){if($("#levelup")){FC.sfx.levelUp();FC.confetti()}},1000);
  if(left>0){$("#resNext").onclick=startSheet;prepare()}
  $("#resHome").onclick=async function(){try{await loadHome()}catch(e){fail(e)}};
}
})();
