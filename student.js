/* Área do aluno: PIN, tela inicial, folha de exercícios e resultado. */
(function(){
"use strict";
var FC=window.FC,$=FC.$,esc=FC.esc,sb=FC.sb;
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
    canStart=true;status="Hoje: <b>"+m.done_today+" de "+m.quota+"</b> folhas feitas.";
  }
  var stamps="";for(var i=0;i<3;i++)stamps+='<span class="stamp'+(i<m.stamps?" on":"")+'">✓</span>';
  var pct=m.week_goal>0?Math.min(100,Math.round(m.week_points/m.week_goal*100)):100;
  var reached=m.week_points>=m.week_goal&&m.week_goal>0;
  var goalTxt=reached?"Meta batida! 🎉":"Faltam "+Math.max(0,m.week_goal-m.week_points)+" pontos";
  var prev="";
  if(m.prev_week){var pw=m.prev_week,ok=pw.points>=pw.goal;
    prev='<p class="muted">Semana passada: <b>'+pw.points+' de '+pw.goal+'</b> pontos. '+(ok?'Meta batida'+(pw.reward?': '+esc(pw.reward):''):'Meta não batida')+'.</p>'}
  var rows=m.recent.map(function(r){
    return "<tr><td>"+FC.dm(r.day)+"</td><td>"+esc(FC.lv(r.level))+"</td><td>"+r.ok+"/"+r.total+"</td><td>"+FC.fmtTime(r.secs)+"</td><td>"+r.points+"</td><td>"+(r.stamp?'<span class="tag ok">carimbo</span>':'<span class="tag">repetir</span>')+"</td></tr>"}).join("");
  FC.render(
   '<header class="top"><div class="brand">Folhinha de Cálculo<small>Oi, '+esc(m.name)+'</small></div><button class="btn ghost small" id="logout">Sair</button></header>'+
   '<div class="grid"><div class="col">'+
   '<div class="panel now"><span class="eyebrow">Nível atual</span><div class="lvl">'+L.id+'</div>'+
   '<div><div class="nm">'+esc(L.name)+'</div><div class="muted">'+esc(L.hint)+'</div></div>'+
   '<div class="stamps"><span>Carimbos</span><span class="row-gap">'+stamps+'</span><span>'+m.stamps+' de 3</span></div>'+
   '<p class="muted small-t">Acerte as 10 contas de primeira dentro de <b>'+FC.fmtTime(L.target)+'</b> para ganhar um carimbo. Com 3 carimbos você sobe de nível.</p>'+
   '<p class="today">'+status+'</p>'+
   (canStart?'<div class="actions"><button class="btn" id="start">Começar folha '+(m.done_today+1)+' de '+m.quota+'</button></div>':'')+
   '</div>'+
   (rows?'<div class="panel"><div class="eyebrow gap">Suas últimas folhas</div><div class="tablewrap"><table><thead><tr><th>Dia</th><th>Nível</th><th>Acertos</th><th>Tempo</th><th>Pontos</th><th>Resultado</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>':'')+
   '</div><div class="col"><div class="panel"><div class="eyebrow">Pontos da semana</div>'+
   '<div class="big-pts">'+m.week_points+'<span> / '+m.week_goal+'</span></div>'+
   '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+m.week_goal+'" aria-valuenow="'+m.week_points+'"><i style="width:'+pct+'%"></i></div>'+
   '<p class="today">'+goalTxt+'</p>'+
   (m.week_reward?'<p class="reward">Prêmio: <b>'+esc(m.week_reward)+'</b></p>':'')+
   '<p class="muted small-t">A semana fecha '+FC.DOW_LONG[FC.dow(m.week_end)].toLowerCase()+', dia '+FC.dm(m.week_end)+'.</p>'+prev+
   '<p class="muted small-t">Total de pontos: <b>'+m.total_points+'</b></p></div></div></div>'+FC.installBox());
  FC.refreshInstall();
  $("#logout").onclick=logout;
  if(canStart)$("#start").onclick=startSheet;
}
async function logout(){
  try{await rpc("student_logout",{p_token:S.token})}catch(e){}
  setTok(null);S.token=null;pinScreen("login",null);
}

/* ---------- folha ---------- */
async function startSheet(){
  var m=S.me,id,items,intro="Preencha as 10 contas. O relógio já está correndo. Enter passa para a próxima.";
  var btn=$("#start");if(btn){btn.disabled=true;btn.textContent="Preparando…"}
  var plan=null;
  try{plan=await rpc("student_sheet_plan",{p_token:S.token})}catch(e){
    if(FC.isSessionErr(e)){setTok(null);return pinScreen("login",null,"Sua sessão acabou. Digite o PIN.")}
  }
  if(plan&&plan.mode==="mesma"&&plan.repeat&&plan.repeat.length===10){
    items=plan.repeat.map(function(p){return{pre:p.pre,post:p.post||"",a:p.a}});
    intro="Esta é a mesma folha da última vez. Agora dá para acertar tudo! "+intro;
  }else if(plan&&plan.mode==="reforco"&&plan.weak&&plan.weak.length){
    items=FC.shuffle(FC.makeItems(m.level_idx,plan.weak));
    var w=plan.weak.length;
    intro="Esta folha traz "+w+" conta"+(w>1?"s":"")+" que você errou antes, para treinar. "+intro;
  }else{items=FC.makeItems(m.level_idx)}
  try{
    id=await rpc("student_start_sheet",{p_token:S.token,p_day:FC.today(),
      p_problems:items.map(function(i){return{pre:i.pre,post:i.post,a:i.a}})});
  }catch(e){
    if(FC.isSessionErr(e)){setTok(null);return pinScreen("login",null,"Sua sessão acabou. Digite o PIN.")}
    FC.toast(FC.err(e),true);try{await loadHome()}catch(x){}return;
  }
  items.forEach(function(it,i){it.i=i;it.tries=0;it.ok=false;it.first=false;it.firstVal=""});
  cur={id:id,level:m.level_idx,items:items,t0:Date.now(),secs:null,round:0,intro:intro};
  renderSheet();
}
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
  if(cur.round===0){cur.secs=(Date.now()-cur.t0)/1000;clearInterval(timerId);$("#timer").textContent=FC.fmtTime(cur.secs)}
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
    p_answers:items.map(function(i){return{v:i.firstVal,ok:i.first,tries:i.tries}}),
    p_corrections:items.filter(function(i){return i.tries>1}).length};
  await send(payload,score);
}
async function send(payload,score){
  FC.render('<div class="panel center"><h1>Enviando sua folha…</h1></div>');
  var res;
  try{res=await rpc("student_submit_sheet",payload)}
  catch(e){
    if(FC.isSessionErr(e)){setTok(null);return pinScreen("login",null,"Sua sessão acabou. Digite o PIN.")}
    FC.render('<div class="panel center"><h1>Não consegui enviar</h1><p class="muted">'+esc(FC.err(e))+' Seu resultado está guardado nesta tela.</p><p><button class="btn" id="again">Enviar de novo</button></p></div>');
    $("#again").onclick=function(){send(payload,score)};return;
  }
  var L=FC.LEVELS[cur.level],secs=payload.p_secs,fixes=payload.p_corrections;
  var fac=Math.round(FC.timeFactor(secs,L.target)*100);
  var note=res.stamp?"Folha aprovada: 10 acertos de primeira, dentro da meta de tempo.":
    score===10?"Nenhum erro, mas o tempo passou da meta. Repita a folha para ganhar o carimbo.":
    fixes+" conta"+(fixes>1?"s":"")+" precisaram de correção. Releia essas contas e repita a folha.";
  var newL=FC.LEVELS[res.level_idx];
  S.me.level_idx=res.level_idx;S.me.stamps=res.stamps;S.me.done_today++;
  var left=S.me.quota-S.me.done_today;
  FC.render('<div class="res panel">'+
    '<div class="score"><div class="big">'+score+'/10</div><div class="seal'+(res.stamp?"":" no")+'">'+(res.stamp?"Aprovada":"Repetir")+'</div>'+
    '<div class="grow"><h2>'+(res.stamp?"Muito bem":"Folha entregue")+', '+esc(S.me.name)+'</h2><div class="muted">'+note+'</div></div></div>'+
    '<div class="kv"><div><b>'+FC.fmtTime(secs)+'</b><span>seu tempo (meta '+FC.fmtTime(L.target)+')</span></div>'+
    '<div><b>+'+res.points+'</b><span>pontos ('+score+' acertos × 10 × '+fac+'% do tempo)</span></div>'+
    '<div><b>'+Math.min(res.stamps,3)+'/3</b><span>carimbos no nível '+newL.id+'</span></div></div>'+
    (res.advanced?'<div class="up">Nível concluído! Você subiu para o '+newL.id+' · '+esc(newL.name)+'.</div>':'')+
    '<p class="muted">'+(left>0?"Faltam "+left+" folha"+(left>1?"s":"")+" para a meta de hoje.":"Meta de hoje cumprida. Até o próximo dia de estudo!")+'</p>'+
    '<div class="actions">'+(left>0?'<button class="btn" id="resNext">Próxima folha</button>':'')+'<button class="btn ghost" id="resHome">Ir ao início</button></div></div>');
  if(left>0)$("#resNext").onclick=startSheet;
  $("#resHome").onclick=async function(){try{await loadHome()}catch(e){fail(e)}};
}
})();
