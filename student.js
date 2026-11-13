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
  FC.render('<div class="pinbox panel"><div class="brand center">Folhinha de Cálculo</div><h1>'+title+'</h1><p class="muted">'+sub+'</p>'+
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
  var per=m.period,prev="";
  if(m.prev_period){var pw=m.prev_period;
    prev='<p class="muted small-t">Semana passada: <b>'+pw.points+' de '+pw.goal+'</b> pontos. '+(pw.reached?'Você ganhou um pacotinho.':'A meta não foi batida.')+'</p>'}
  var extra=packPanel(m)+albumsPanel(m);
  var rows=m.recent.map(function(r){
    return "<tr><td>"+FC.dm(r.day)+"</td><td>"+esc(FC.lv(r.level))+"</td><td>"+r.ok+"/"+r.total+"</td><td>"+FC.fmtTime(r.secs)+"</td><td>"+r.points+"</td><td>"+(r.advanced?'<span class="tag ok">subiu de nível</span>':r.stamp?'<span class="tag ok">carimbo do dia</span>':'')+"</td></tr>"}).join("");
  FC.render(
   '<header class="top"><div class="brand">Folhinha de Cálculo<small>Oi, '+esc(m.name)+'</small></div><div class="actions"><button class="btn ghost small" id="sndBtn"></button><button class="btn ghost small" id="logout">Sair</button></div></header>'+
   '<div class="grid"><div class="col">'+
   '<div class="panel now"><span class="eyebrow">Nível atual</span><div class="lvl">'+L.id+'<span class="of"> de '+FC.LEVELS.length+'</span></div>'+
   '<div><div class="nm">'+esc(L.name)+'</div><div class="muted">'+esc(L.hint)+'</div></div>'+
   '<div class="stamps"><span>Carimbos</span><span class="row-gap">'+stamps+'</span><span>'+Math.min(m.stamps,need)+' de '+need+'</span></div>'+
   '<p class="muted small-t">Cada dia em que você acerta <b>80% ou mais</b> das contas de primeira, com tempo médio de até <b>'+FC.fmtTime(L.target)+'</b> por folha, vale <b>1 carimbo</b>. Com '+need+' carimbos você sobe de nível. As contas que você errar voltam nas próximas folhas, até no nível seguinte.</p>'+
   '<p class="today">'+status+'</p>'+
   (canStart?'<div class="actions"><button class="btn" id="start">Começar folha '+(m.done_today+1)+' de '+m.quota+'</button></div>':'')+
   '</div>'+
   (rows?'<div class="panel"><div class="eyebrow gap">Suas últimas folhas</div><div class="tablewrap"><table><thead><tr><th>Dia</th><th>Nível</th><th>Acertos</th><th>Tempo</th><th>Pontos</th><th>Resultado</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>':'')+
   '</div><div class="col"><div class="panel">'+FC.trailHtml(per)+prev+
   '<p class="muted small-t">Total de pontos: <b>'+m.total_points+'</b></p></div>'+extra+'</div></div>'+FC.installBox());
  FC.refreshInstall();
  $("#logout").onclick=logout;
  function sndLabel(){$("#sndBtn").textContent=FC.sfx.enabled()?"Som ligado":"Som desligado"}
  sndLabel();
  $("#sndBtn").onclick=function(){var on=!FC.sfx.enabled();FC.sfx.set(on);sndLabel();if(on)FC.sfx.stamp()};
  if(canStart){$("#start").onclick=startSheet;prepare()}
  $$("[data-album]").forEach(function(b){b.onclick=function(){albumScreen(b.getAttribute("data-album"))}});
  if($("#packBtn"))$("#packBtn").onclick=openPackFlow;
  if(m.pending_packs>0&&!S.packAsked){S.packAsked=true;setTimeout(openPackFlow,500)}
}
/* ---------- álbuns e pacotinhos ---------- */
function themesOf(m){return (m.sticker_themes&&m.sticker_themes.length)?m.sticker_themes:[m.sticker_theme||"dinossauros"]}
function gotOf(m,id){return (m.stickers||[]).filter(function(g){return (g.theme||m.sticker_theme)===id})}
function packPanel(m){
  var n=m.pending_packs||0;if(n<1)return "";
  return '<div class="panel packbox"><div class="goalicon open">'+FC.packSvg()+'</div><div class="grow"><b>Você tem '+n+' pacotinho'+(n>1?'s':'')+' para abrir!</b>'+
    '<div class="muted small-t">'+(themesOf(m).length>1?'Escolha de qual álbum você quer a figurinha.':'Toque para descobrir a figurinha.')+'</div></div>'+
    '<button class="btn" id="packBtn">Abrir pacotinho</button></div>';
}
function albumsPanel(m){
  var ids=themesOf(m);
  if(ids.length===1){
    var th=FC.theme(ids[0]),got=gotOf(m,th.id);
    return '<div class="panel"><div class="eyebrow">Meu álbum · '+esc(th.name)+'</div><div class="big-pts">'+got.length+'<span> de '+FC.ALBUM_SIZE+' figurinhas</span></div>'+
      '<div class="bar"><i style="width:'+Math.round(got.length/FC.ALBUM_SIZE*100)+'%"></i></div>'+
      (got.length?'<div class="recent-stk">'+got.slice(-3).reverse().map(function(g){return FC.stickerHtml(th.id,g.slot)}).join("")+'</div>':'<p class="muted small-t">Bata a meta da semana para ganhar o primeiro pacotinho. Você só vê qual é a figurinha quando abrir!</p>')+
      '<p class="actions"><button class="btn" data-album="'+th.id+'">Abrir o álbum</button></p></div>';
  }
  return '<div class="panel"><div class="eyebrow">Meus álbuns</div><div class="albums-list">'+ids.map(function(id){
    var th=FC.theme(id),got=gotOf(m,id);
    return '<button class="album-row" data-album="'+id+'"><span class="al-art">'+FC.themeCover(id)+'</span><span class="grow"><b>'+esc(th.name)+'</b>'+
      '<span class="small-t muted"> '+got.length+' de '+FC.ALBUM_SIZE+'</span><span class="bar"><i style="width:'+Math.round(got.length/FC.ALBUM_SIZE*100)+'%"></i></span></span></button>';
  }).join("")+'</div></div>';
}
/* Ganhou pacotinho: com mais de um álbum disponível, a criança escolhe de qual quer a figurinha. */
function openPackFlow(){
  var m=S.me;if(!(m.pending_packs>0))return;
  var open=themesOf(m).filter(function(id){return gotOf(m,id).length<FC.ALBUM_SIZE});
  if(!open.length){FC.toast("Seus álbuns já estão completos!");return}
  if(open.length===1)return openPack(open[0]);
  var ids=themesOf(m);
  var ov=FC.overlay('<h2>Escolha o seu pacotinho!</h2><p class="muted">Cada pacotinho tem uma figurinha surpresa. De qual álbum você quer?</p>'+
    '<div class="pack-choices">'+ids.map(function(id){
      var th=FC.theme(id),n=gotOf(m,id).length,full=n>=FC.ALBUM_SIZE;
      return '<button class="pack-choice" data-t="'+id+'"'+(full?" disabled":"")+'><span class="pc-art">'+FC.themeCover(id)+'</span><b>'+esc(th.name)+'</b><small>'+(full?"Álbum completo!":n+" de "+FC.ALBUM_SIZE)+'</small></button>';
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
function albumScreen(id){
  FC.setKeys(null);
  var m=S.me,ids=themesOf(m);id=ids.indexOf(id)>=0?id:ids[0];
  var th=FC.theme(id),got=gotOf(m,id);
  var tabs=ids.length>1?'<div class="album-tabs">'+ids.map(function(x){return '<button class="chip-btn'+(x===id?" on":"")+'" data-t="'+x+'">'+esc(FC.theme(x).name)+'</button>'}).join("")+'</div>':"";
  FC.render('<header class="top"><div class="brand">Meu álbum<small>'+esc(th.name)+' · '+got.length+' de '+FC.ALBUM_SIZE+'</small></div><div class="actions">'+((m.pending_packs>0)?'<button class="btn small" id="albumPack">Abrir pacotinho ('+m.pending_packs+')</button>':'')+'<button class="btn ghost small" id="albumBack">Voltar</button></div></header>'+
    '<div class="panel">'+tabs+'<p class="muted small-t">Toque em uma figurinha para virar e ver os detalhes.</p>'+FC.albumHtml(th.id,got)+'</div>');
  $("#albumBack").onclick=home;
  if($("#albumPack"))$("#albumPack").onclick=openPackFlow;
  $$(".album-tabs [data-t]").forEach(function(b){b.onclick=function(){albumScreen(b.getAttribute("data-t"))}});
}
/* Figurinha nova: aviso no meio da tela, com o pacotinho abrindo e a figurinha aparecendo. */
function showAward(aw){
  var m=S.me;
  var th=FC.theme(aw.theme),n=aw.count||gotOf(m,aw.theme).length,tier=aw.tier||FC.tierOf(aw.theme,aw.slot);
  var titulo=tier==="ultra"?"Figurinha ULTRARRARA!":tier==="rara"?"Figurinha RARA!":"Figurinha nova!";
  var linha=tier==="comum"?"":'<p class="tier-msg">'+(tier==="ultra"?"Uma das mais difíceis do álbum inteiro!":"Uma figurinha difícil de conseguir!")+'</p>';
  FC.overlay('<div class="pack-reveal" id="packReveal"><div class="pack-closed">'+FC.packSvg()+'</div><div class="pack-card">'+FC.stickerHtml(th.id,aw.slot,{big:true})+'</div></div>'+
    '<h2 class="'+(tier==="comum"?"":"tier-title tier-"+tier)+'">'+titulo+'</h2>'+linha+'<p class="muted">Você já tem <b>'+n+' de '+FC.ALBUM_SIZE+'</b> no álbum '+esc(th.name)+'.</p>'+(m.pending_packs>0?'<p class="muted small-t">Você ainda tem '+m.pending_packs+' pacotinho'+(m.pending_packs>1?'s':'')+' para abrir.</p>':''),{button:m.pending_packs>0?"Abrir o próximo":"Colar no álbum",cls:tier==="comum"?"":"tier-"+tier,onClose:function(){if(m.pending_packs>0)openPackFlow();else if(!cur&&S.me===m&&document.querySelector(".panel.now"))home()}});
  setTimeout(function(){
    FC.sfx.pack();var el=$("#packReveal");if(el)el.classList.add("opened");
    if(tier==="comum"){FC.confetti();return}
    setTimeout(function(){FC.sfx[tier==="ultra"?"ultra":"rare"]();FC.confetti({gold:true,n:tier==="ultra"?90:64});
      if(tier==="ultra")setTimeout(function(){FC.confetti({gold:true,n:70})},700)},350);
  },800);
}
async function logout(){
  try{await rpc("student_logout",{p_token:S.token})}catch(e){}
  setTok(null);S.token=null;prep=null;pinScreen("login",null);
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
    items=plan.repeat.map(function(p){return{pre:p.pre,post:p.post||"",a:p.a}});
    intro="Esta é a mesma folha da última vez. Agora dá para acertar tudo! "+intro;
  }else if(plan&&plan.mode==="reforco"&&plan.weak&&plan.weak.length){
    items=FC.shuffle(FC.makeItems(m.level_idx,plan.weak));
    var w=plan.weak.length;
    intro="Esta folha traz "+w+" conta"+(w>1?"s":"")+" que você errou antes, para treinar. "+intro;
  }else{items=FC.makeItems(m.level_idx)}
  /* Se o aluno já tinha uma folha aberta hoje (saiu e voltou, ou outro aparelho), o banco devolve a mesma. */
  var o=await rpc("student_open_sheet",{p_token:S.token,p_day:day,
    p_problems:items.map(function(i){return{pre:i.pre,post:i.post,a:i.a}})});
  if(o.reused){
    items=o.problems.map(function(p){return{pre:p.pre,post:p.post||"",a:p.a}});
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
      return '<li class="row" id="r'+it.i+'"><span class="n">'+(it.i+1)+')</span><span class="q">'+esc(it.pre)+'</span><span class="ans"><input id="in'+it.i+'" inputmode="numeric" autocomplete="off" maxlength="4" aria-label="Resposta da conta '+(it.i+1)+'"></span>'+(it.post?'<span class="q">'+esc(it.post)+'</span>':'')+'</li>'}).join("")+'</ol>'+
    '<div class="sh-foot"><div class="msg" id="shMsg">'+esc(cur.intro)+'</div>'+
    '<div class="actions"><button class="btn ghost small" id="btnExit">Sair da folha</button><button class="btn" id="btnSubmit">Entregar folha</button></div></div></div>');
  cur.items.forEach(function(it){
    var inp=$("#in"+it.i);
    inp.addEventListener("input",function(){inp.value=inp.value.replace(/[^0-9]/g,"");$("#r"+it.i).classList.remove("bad")});
    inp.addEventListener("focus",function(){startDwell(it.i)});
    inp.addEventListener("blur",stopDwell);
    inp.addEventListener("keydown",function(e){
      if(e.key!=="Enter")return;e.preventDefault();
      for(var k=it.i+1;k<cur.items.length;k++)if(!cur.items[k].ok){$("#in"+k).focus();return}
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
  $("#in0").focus();
}
function setMsg(t,bad){var m=$("#shMsg");m.textContent=t;m.classList.toggle("bad",!!bad)}
function submit(){
  if(!cur||busy)return;
  if(cur.round===0){stopDwell();cur.secs=(Date.now()-cur.t0)/1000;clearInterval(timerId);$("#timer").textContent=FC.fmtTime(cur.secs)}
  cur.round++;
  var wrong=0,focus=null;
  cur.items.forEach(function(it){
    if(it.ok)return;
    var inp=$("#in"+it.i),row=$("#r"+it.i),v=inp.value.trim(),good=v!==""&&Number(v)===it.a;
    it.tries++;
    if(it.tries===1){it.first=good;it.firstVal=v}
    if(good){it.ok=true;inp.readOnly=true;row.classList.remove("bad");row.classList.add("ok");var tp=row.querySelector(".tip");if(tp)tp.remove()}
    else{
      wrong++;row.classList.add("bad");inp.value="";if(focus==null)focus=it.i;
      if(it.tries>=3&&!row.querySelector(".tip")){var tip=document.createElement("div");tip.className="tip";
        tip.textContent="Dica: a resposta é "+it.a+". Escreva e tente entender o caminho.";row.appendChild(tip)}
    }
  });
  if(wrong===0)return finish();
  setMsg("Faltam "+wrong+" para corrigir. Refaça só as contas em vermelho; as certas já foram marcadas.",true);
  $("#btnSubmit").textContent="Conferir correções";
  $("#in"+focus).focus();
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
      FC.render('<div class="panel center"><h1>Esta folha já foi entregue</h1><p class="muted">Ela foi entregue em outro aparelho, então esta cópia não vale pontos. Volte ao início para ver a sua folha de hoje.</p><p><button class="btn" id="goHome">Ir ao início</button></p></div>');
      $("#goHome").onclick=async function(){try{await loadHome()}catch(x){fail(x)}};return;
    }
    FC.render('<div class="panel center"><h1>Não consegui enviar</h1><p class="muted">'+esc(FC.err(e))+' Seu resultado está guardado nesta tela.</p><p><button class="btn" id="again">Enviar de novo</button></p></div>');
    $("#again").onclick=function(){send(payload,score)};return;
  }
  var L=FC.LEVELS[cur.level],secs=payload.p_secs,fixes=payload.p_corrections;
  var fac=Math.round(FC.timeFactor(secs,L.target)*100);
  var rules="80% ou mais de acertos de primeira no dia e tempo médio de até "+FC.fmtTime(L.target)+" por folha";
  var note;
  if(res.day_closed&&res.stamp)note="Dia fechado com carimbo! Você acertou "+res.day_ok+" de "+res.day_total+" contas de primeira ("+res.day_pct+"%), com tempo médio de "+FC.fmtTime(res.day_avg_secs)+" por folha.";
  else if(res.day_closed){
    var acertos="Hoje você acertou "+res.day_pct+"% de primeira (o carimbo pede 80% ou mais)",tempo="o tempo médio de "+FC.fmtTime(res.day_avg_secs)+" por folha passou da meta de "+FC.fmtTime(L.target);
    note=(res.why==="tempo"?"Você acertou "+res.day_pct+"% de primeira, mas "+tempo+".":res.why==="acertos_tempo"?acertos+", e "+tempo+".":acertos+".")+" Sem carimbo hoje. Amanhã tem outra chance. As contas que você errou voltam nas próximas folhas.";
  }else note="Acertos de primeira hoje: "+res.day_ok+" de "+res.day_total+" ("+res.day_pct+"%). O carimbo do dia sai ao fechar a última folha, com "+rules+"."+(fixes>0?" As contas que você errou voltam nas próximas folhas.":"");
  var newL=FC.LEVELS[res.level_idx];
  S.me.level_idx=res.level_idx;S.me.stamps=res.stamps;S.me.done_today++;S.me.today_ok=res.day_ok;S.me.today_total=res.day_total;
  var before=S.me.period?S.me.period.points:0,np=res.period;
  S.me.period=np;S.me.week_points=np.points;S.me.total_points=(S.me.total_points||0)+res.points;
  var left=S.me.quota-S.me.done_today,need=res.stamps_needed,shown=res.shown_stamps,row="";
  for(var i=0;i<need;i++)row+='<span class="stamp'+(i<shown?" on":"")+((res.stamp&&i===shown-1)?" pop":"")+'">✓</span>';
  var seal=res.day_closed?(res.stamp?"Carimbo":"Sem carimbo"):"Folha "+res.day_done+" de "+res.day_quota;
  FC.render('<div class="res panel">'+
    '<div class="score"><div class="big">'+score+'/10</div><div class="seal'+(res.day_closed&&res.stamp?"":" no")+'">'+seal+'</div>'+
    '<div class="grow"><h2>'+(res.stamp?"Muito bem":"Folha entregue")+', '+esc(S.me.name)+'</h2><div class="muted">'+note+'</div></div></div>'+
    '<div class="kv"><div><b>'+FC.fmtTime(secs)+'</b><span>seu tempo (meta '+FC.fmtTime(L.target)+')</span></div>'+
    '<div><b>+'+res.points+'</b><span>pontos ('+score+' acertos × 10 × '+fac+'% do tempo)</span></div>'+
    '<div><b>'+np.points+'</b><span>pontos na semana (meta '+np.goal+')</span></div></div>'+
    '<div class="stamprow"><span>'+(res.advanced?"Nível "+L.id+" concluído":"Carimbos do nível "+L.id)+'</span><span class="row-gap">'+row+'</span><span>'+shown+' de '+need+'</span></div>'+
    (res.advanced?'<div class="levelup" id="levelup"><div class="lu-badge">'+newL.id+'</div><div><div class="lu-title">Você subiu de nível!</div><div class="muted">Agora você está no nível '+newL.id+' · '+esc(newL.name)+'. As contas que você ainda errou vêm junto para as próximas folhas.</div></div></div>':'')+
    '<div class="trailbox">'+FC.trailHtml(np,{fromPoints:before})+'</div>'+
    '<p class="muted">'+(left>0?"Faltam "+left+" folha"+(left>1?"s":"")+" para fechar o dia.":"Dia fechado. Até o próximo dia de estudo!")+'</p>'+
    '<div class="actions">'+(left>0?'<button class="btn" id="resNext">Próxima folha</button>':'')+'<button class="btn ghost" id="resHome">Ir ao início</button></div></div>');
  FC.animateTrail();
  if(res.award&&res.award.kind==="pacote"){
    S.me.pending_packs=(S.me.pending_packs||0)+1;
    setTimeout(function(){
      FC.sfx.pack();FC.confetti();
      FC.overlay('<div class="pack-reveal opened"><div class="goalicon open" style="width:120px;margin:0 auto">'+FC.packSvg()+'</div></div><h2>Meta batida!</h2><p class="muted">Você ganhou um pacotinho de figurinhas'+(themesOf(S.me).length>1?'. Você escolhe de qual álbum quer a figurinha.':'.')+'</p>',
        {button:"Abrir o pacotinho",onClose:openPackFlow});
    },res.advanced?3600:2300);
  }
  if(res.stamp)FC.sfx.stamp();
  if(res.advanced)setTimeout(function(){if($("#levelup")){FC.sfx.levelUp();FC.confetti()}},1000);
  if(left>0){$("#resNext").onclick=startSheet;prepare()}
  $("#resHome").onclick=async function(){try{await loadHome()}catch(e){fail(e)}};
}
})();
