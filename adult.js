/* Painel de pais e professores: cadastro/login, alunos, programa de estudos, pontos e histórico. */
(function(){
"use strict";
var FC=window.FC,$=FC.$,$$=FC.$$,esc=FC.esc,sb=FC.sb;
var U={user:null,profile:null};
/* Limites mínimos do programa: 3 folhas por dia, 3 dias por semana e meta de pelo menos 70% do máximo de pontos da semana. */
var MIN_SHEETS=3,MIN_DAYS=3,MIN_PCT=0.7;
function maxWeek(days,per){return days*per*100}
function minGoal(days,per){return Math.ceil(MIN_PCT*maxWeek(days,per)/10)*10}
var MODES={
  reforco:["Reforço dos erros (recomendado)","A folha seguinte traz de volta até 4 contas que ele errou, misturadas com contas novas. Cada conta sai da lista depois de 2 acertos seguidos."],
  mesma:["Repetir a mesma folha","Se a folha não deu carimbo, ele refaz exatamente a mesma folha até dominar."],
  nova:["Sempre folha nova","Cada folha é sorteada do zero. As contas erradas não voltam."]
};

async function q(p){var r=await p;if(r.error)throw r.error;return r.data}

FC.adultApp=async function(){
  sb.auth.onAuthStateChange(function(ev){
    if(ev==="SIGNED_OUT"){U.user=null;showAuth("login")}
    if(ev==="PASSWORD_RECOVERY")showNewPassword();
  });
  var recovery=/type=recovery/.test(location.hash);
  var r=await sb.auth.getSession();
  if(recovery&&r.data.session){U.user=r.data.session.user;return showNewPassword()}
  if(r.data.session){U.user=r.data.session.user;return dash()}
  showAuth("login");
};

function topbar(extra){
  var name=U.profile?esc(U.profile.name||"")+(U.profile.role==="professor"?" · professor(a)":" · responsável"):"";
  return '<header class="top"><div class="brand">Folhinha de Cálculo<small>'+(extra||"Painel para pais e professores")+'</small></div>'+
    (U.user?'<div class="who">'+name+' <button class="btn ghost small" id="logout">Sair</button></div>':'')+'</header>';
}
function bindTop(){var b=$("#logout");if(b)b.onclick=function(){sb.auth.signOut()}}
function errScreen(e,retry){
  FC.render(topbar()+'<div class="panel center"><h1>Não deu para carregar</h1><p class="muted">'+esc(FC.err(e))+'</p><p><button class="btn" id="retry">Tentar de novo</button></p></div>');
  bindTop();$("#retry").onclick=retry||dash;
}

/* ---------- entrar / cadastrar ---------- */
function showAuth(tab,msg,ok){
  U.profile=null;
  FC.render(topbar()+'<div class="panel authbox"><div class="tabs"><button class="tab'+(tab==="login"?" on":"")+'" data-t="login">Entrar</button>'+
    '<button class="tab'+(tab==="reg"?" on":"")+'" data-t="reg">Cadastrar</button></div>'+
    '<form id="authForm" class="form" novalidate>'+
    (tab==="reg"?'<label class="field">Seu nome<input id="fName" maxlength="60" autocomplete="name" required></label>'+
      '<fieldset class="field"><legend>Você é</legend><label class="radio"><input type="radio" name="role" value="pai" checked> Pai ou mãe</label>'+
      '<label class="radio"><input type="radio" name="role" value="professor"> Professor(a)</label></fieldset>':'')+
    '<label class="field">E-mail<input id="fEmail" type="email" autocomplete="email" required></label>'+
    '<label class="field">Senha<input id="fPass" type="password" autocomplete="'+(tab==="reg"?"new-password":"current-password")+'" required><small>Mínimo de 8 caracteres</small></label>'+
    '<p class="msg'+(ok?" good":" bad")+'" id="authMsg" role="alert">'+esc(msg||"")+'</p>'+
    '<button class="btn" type="submit" id="authBtn">'+(tab==="reg"?"Criar conta":"Entrar")+'</button>'+
    (tab==="login"?'<button type="button" class="link" id="forgot">Esqueci minha senha</button>':'')+'</form></div>'+
    '<p class="foot-note">Aluno? Abra o link que seu pai ou professor enviou.</p>');
  $$(".tab").forEach(function(b){b.onclick=function(){showAuth(b.getAttribute("data-t"))}});
  var msgEl=$("#authMsg");
  function say(t,good){msgEl.textContent=t;msgEl.className="msg "+(good?"good":"bad")}
  $("#authForm").onsubmit=async function(e){
    e.preventDefault();
    var email=$("#fEmail").value.trim(),pass=$("#fPass").value;
    if(!email||!pass)return say("Preencha e-mail e senha.");
    if(pass.length<8)return say("A senha precisa ter pelo menos 8 caracteres.");
    var btn=$("#authBtn");btn.disabled=true;
    try{
      if(tab==="reg"){
        var name=$("#fName").value.trim();if(!name){btn.disabled=false;return say("Digite seu nome.")}
        var role=$('input[name="role"]:checked').value;
        var r=await sb.auth.signUp({email:email,password:pass,options:{data:{name:name,role:role}}});
        if(r.error)throw r.error;
        if(r.data.session){U.user=r.data.session.user;return dash()}
        btn.disabled=false;return say("Conta criada. Confirme pelo link enviado ao seu e-mail e depois entre.",true);
      }
      var l=await sb.auth.signInWithPassword({email:email,password:pass});
      if(l.error)throw l.error;U.user=l.data.user;dash();
    }catch(err){btn.disabled=false;say(FC.err(err))}
  };
  var fg=$("#forgot");
  if(fg)fg.onclick=async function(){
    var email=$("#fEmail").value.trim();
    if(!email)return say("Digite seu e-mail e toque de novo em “Esqueci minha senha”.");
    var r=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
    if(r.error)return say(FC.err(r.error));
    say("Se este e-mail tiver cadastro, enviamos um link para criar uma nova senha.",true);
  };
}
function showNewPassword(msg){
  FC.render(topbar("Nova senha")+'<div class="panel authbox"><form id="npForm" class="form"><h1>Crie uma nova senha</h1>'+
    '<label class="field">Nova senha<input id="np" type="password" autocomplete="new-password" required><small>Mínimo de 8 caracteres</small></label>'+
    '<p class="msg bad" id="npMsg" role="alert">'+esc(msg||"")+'</p><button class="btn" type="submit">Salvar senha</button></form></div>');
  $("#npForm").onsubmit=async function(e){
    e.preventDefault();var p=$("#np").value;
    if(p.length<8){$("#npMsg").textContent="A senha precisa ter pelo menos 8 caracteres.";return}
    var r=await sb.auth.updateUser({password:p});
    if(r.error){$("#npMsg").textContent=FC.err(r.error);return}
    history.replaceState(null,"",location.pathname);FC.toast("Senha alterada.");dash();
  };
}

/* ---------- lista de alunos ---------- */
function weekPoints(s,sheets){
  var p=FC.periodOf(FC.today(),s.week_close_dow),n=0;
  sheets.forEach(function(x){if(x.student_id===s.id&&x.week_end===p.end)n+=x.points});
  return n;
}
function todayDone(s,sheets){var t=FC.today();return sheets.filter(function(x){return x.student_id===s.id&&x.study_day===t}).length}

async function dash(){
  FC.render('<p class="loading">Carregando…</p>');
  var prof,students,sheets;
  try{
    if(!U.user){var g=await sb.auth.getUser();if(g.error||!g.data.user)return showAuth("login");U.user=g.data.user}
    var res=await Promise.all([
      q(sb.from("profiles").select("name,role").eq("id",U.user.id).maybeSingle()),
      q(sb.from("students").select("*").order("created_at")),
      q(sb.from("sheets").select("student_id,study_day,week_end,points").eq("status","done").gte("study_day",FC.addDays(FC.today(),-60)))]);
    prof=res[0];students=res[1];sheets=res[2];
  }catch(e){return errScreen(e,dash)}
  U.profile=prof||{name:"",role:"pai"};
  var today=FC.today(),cards=students.map(function(s){
    var L=FC.LEVELS[s.level_idx],wp=weekPoints(s,sheets),pg=s.weekly_goal,pct=pg>0?Math.min(100,Math.round(wp/pg*100)):100;
    var isStudy=s.study_days.indexOf(FC.dow(today))>=0&&today>=s.start_date,done=todayDone(s,sheets);
    var st=today<s.start_date?"Começa em "+FC.dm(s.start_date):isStudy?"Hoje: "+done+" de "+s.sheets_per_day+" folhas":"Hoje: descanso";
    return '<button class="panel card" data-id="'+s.id+'"><div class="card-top"><b class="card-name">'+esc(s.name)+'</b><span class="lvlchip">Nível '+L.id+'</span></div>'+
      '<div class="muted">'+esc(L.name)+'</div><div class="muted small-t">'+st+'</div>'+
      '<div class="bar"><i style="width:'+pct+'%"></i></div><div class="small-t">'+wp+' de '+pg+' pontos na semana</div></button>';
  }).join("");
  FC.render(topbar()+'<div class="section-head"><h1>Meus alunos</h1><div class="actions"><button class="btn" id="newStudent">Cadastrar aluno</button></div></div>'+
    (students.length?'<div class="cards">'+cards+'</div>':'<div class="panel center"><h2>Nenhum aluno ainda</h2><p class="muted">Cadastre o primeiro aluno, informe o nível dele e monte o programa de estudos. O sistema gera um link para ele entrar.</p></div>')+
    '<details class="panel"><summary>Tenho um convite de outro adulto</summary><form id="invForm" class="form inline"><label class="field grow">Código do convite<input id="invCode" maxlength="12" autocomplete="off" placeholder="Ex.: 3F9A1C20"></label><button class="btn" type="submit">Entrar no aluno</button></form><p class="msg bad" id="invMsg" role="alert"></p></details>'+FC.installBox());
  bindTop();FC.refreshInstall();
  $("#newStudent").onclick=function(){showForm(null)};
  $$(".card").forEach(function(c){c.onclick=function(){detail(c.getAttribute("data-id"))}});
  $("#invForm").onsubmit=async function(e){
    e.preventDefault();var code=$("#invCode").value.trim();if(!code)return;
    var r=await sb.rpc("redeem_invite",{p_code:code});
    if(r.error){$("#invMsg").textContent=FC.err(r.error);return}
    FC.toast("Agora você acompanha "+r.data.name+".");dash();
  };
}

/* ---------- formulário do programa (cadastro e edição) ---------- */
function programFields(s){
  var v=s||{name:"",level_idx:0,start_date:FC.today(),study_days:[1,2,3,4,5],sheets_per_day:3,week_close_dow:0,weekly_goal:minGoal(5,3),sticker_themes:["dinossauros"],repeat_mode:"reforco",stamps_needed:3};
  var lv="",lastG=null;
  FC.LEVELS.forEach(function(l,i){
    if(l.group!==lastG){if(lastG!==null)lv+="</optgroup>";lv+='<optgroup label="'+esc(l.group)+'">';lastG=l.group}
    lv+='<option value="'+i+'"'+(i===v.level_idx?" selected":"")+'>'+l.id+" · "+esc(l.name)+'</option>';
  });
  lv+="</optgroup>";
  var days=FC.DOW.map(function(d,i){return '<label class="chk"><input type="checkbox" name="days" value="'+i+'"'+(v.study_days.indexOf(i)>=0?" checked":"")+'><span>'+d+'</span></label>'}).join("");
  var close=FC.DOW_LONG.map(function(d,i){return '<option value="'+i+'"'+(i===v.week_close_dow?" selected":"")+'>'+d+'</option>'}).join("");
  var chosen=v.sticker_themes||[v.sticker_theme||"dinossauros"];
  var per="";for(var i=MIN_SHEETS;i<=10;i++)per+='<option value="'+i+'"'+(i===v.sheets_per_day?" selected":"")+'>'+i+'</option>';
  return '<label class="field">Nome do aluno<input id="pName" maxlength="40" value="'+esc(v.name)+'" required></label>'+
    '<label class="field">Nível em que ele está<select id="pLevel">'+lv+'</select><small>Escolha o nível em que ele resolve as folhas com facilidade, sem ajuda.</small></label>'+
    '<div class="two"><label class="field">Começa a estudar em<input id="pStart" type="date" value="'+v.start_date+'" required></label>'+
    '<label class="field">Folhas por dia de estudo<select id="pPer">'+per+'</select><small>Mínimo: '+MIN_SHEETS+' folhas por dia.</small></label></div>'+
    '<fieldset class="field"><legend>Dias da semana de estudo</legend><div class="chks">'+days+'</div><small id="pDaysHint">Mínimo: '+MIN_DAYS+' dias por semana.</small></fieldset>'+
    '<fieldset class="field"><legend>Álbuns disponíveis para a criança</legend><div class="theme-pick">'+FC.THEMES.map(function(t){
      return '<div class="theme-opt"><input type="checkbox" name="themes" value="'+t.id+'" id="th_'+t.id+'"'+(chosen.indexOf(t.id)>=0?" checked":"")+'><label class="to-art" for="th_'+t.id+'">'+FC.themeCover(t.id)+'</label>'+
        '<label class="to-txt" for="th_'+t.id+'"><b>'+esc(t.name)+'</b><small>'+esc(t.desc)+'</small></label><button type="button" class="btn ghost small" data-view="'+t.id+'">Ver</button></div>'}).join("")+'</div>'+
      '<small>Marque um ou mais. Ao bater a meta da semana, a criança ganha um pacotinho e escolhe de qual álbum quer a figurinha surpresa.</small></fieldset>'+
    '<label class="field">A semana fecha na<select id="pClose">'+close+'</select><small>Os pontos de cada semana somam até este dia. Bater a meta dá um pacotinho com uma figurinha (até 52 por ano em cada álbum).</small></label>'+
    '<label class="field">Meta de pontos da semana<input id="pGoal" type="number" min="0" max="1000000" step="10" value="'+v.weekly_goal+'"><small id="pMax"></small></label>'+
    '<label class="field">Quando ele erra ou não ganha o carimbo<select id="pRepeat">'+Object.keys(MODES).map(function(k){return '<option value="'+k+'"'+(k===v.repeat_mode?" selected":"")+'>'+MODES[k][0]+'</option>'}).join("")+'</select><small id="pRepeatDesc"></small></label>'+
    '<label class="field">Carimbos para subir de nível<select id="pStamps">'+[1,2,3,4,5,6,7,8,9,10].map(function(n){return '<option value="'+n+'"'+(n===v.stamps_needed?" selected":"")+'>'+n+'</option>'}).join("")+'</select><small id="pStampsDesc"></small></label>';
}
function bindProgram(){
  var g=$("#pGoal");
  var adjusted=false;
  function limits(){var per=Number($("#pPer").value),n=$$('input[name="days"]:checked').length;return{per:per,n:n,max:maxWeek(n,per),min:minGoal(n,per)}}
  function upd(fix){
    var L=limits(),goal=Number(g.value)||0;
    $("#pDaysHint").textContent=L.n<MIN_DAYS?"Marque pelo menos "+MIN_DAYS+" dias por semana.":"Mínimo: "+MIN_DAYS+" dias por semana.";
    $("#pDaysHint").className=L.n<MIN_DAYS?"bad":"";
    if(L.n>=MIN_DAYS){
      g.min=L.min;
      if(fix===true&&goal<L.min){g.value=L.min;goal=L.min;adjusted=true}
      $("#pMax").textContent="Mínimo para ganhar o pacotinho: "+L.min+" pontos ("+Math.round(MIN_PCT*100)+"% do máximo de "+L.max+": "+L.n+" dias × "+L.per+" folhas × 100)."+(adjusted?" A meta foi ajustada ao mínimo.":"");
      $("#pMax").className=goal<L.min?"bad":"";
    }else{$("#pMax").textContent="";$("#pMax").className=""}
  }
  $$("[data-view]").forEach(function(btn){btn.onclick=function(){
    var th=FC.theme(btn.getAttribute("data-view")),cells="";
    for(var i=0;i<FC.ALBUM_SIZE;i++)cells+=FC.stickerHtml(th.id,i);
    FC.overlay('<h2>'+esc(th.name)+'</h2><p class="muted">'+esc(th.desc)+' A criança só vê cada figurinha quando a ganha.</p>'+FC.rarityLegend(th.id)+'<div class="album">'+cells+'</div>',{wide:true});
  }});
  g.addEventListener("input",function(){adjusted=false;upd()});
  g.addEventListener("change",function(){upd(true)});
  $$('input[name="days"]').forEach(function(c){c.onchange=function(){upd(true)}});
  $("#pPer").addEventListener("change",function(){upd(true)});
  upd(true);
  function rep(){$("#pRepeatDesc").textContent=MODES[$("#pRepeat").value][1]}
  $("#pRepeat").onchange=rep;rep();
  function stp(){var per=Number($("#pPer").value),need=Number($("#pStamps").value);
    $("#pStampsDesc").textContent="Cada carimbo exige 10 acertos de primeira dentro da meta de tempo. Com "+per+" folha"+(per>1?"s":"")+" por dia, ele pode ganhar até "+per+" carimbo"+(per>1?"s":"")+" num dia. Com "+need+", sobe de nível em, no mínimo, "+Math.ceil(need/per)+" dia"+(Math.ceil(need/per)>1?"s":"")+".";}
  $("#pStamps").onchange=stp;$("#pPer").addEventListener("change",stp);stp();
}
function readProgram(){
  var days=$$('input[name="days"]:checked').map(function(c){return Number(c.value)}),name=$("#pName").value.trim();
  if(!name)return{error:"Digite o nome do aluno."};
  if(days.length<MIN_DAYS)return{error:"Marque pelo menos "+MIN_DAYS+" dias de estudo por semana."};
  if(Number($("#pPer").value)<MIN_SHEETS)return{error:"O mínimo é de "+MIN_SHEETS+" folhas por dia."};
  if(!$("#pStart").value)return{error:"Informe a data de início."};
  var themes=$$('input[name="themes"]:checked').map(function(c){return c.value});
  if(!themes.length)return{error:"Marque pelo menos um álbum de figurinhas."};
  var wk=Math.max(0,Math.round(Number($("#pGoal").value)||0)),mg=minGoal(days.length,Number($("#pPer").value));
  if(wk<mg)return{error:"A meta precisa ser de pelo menos "+mg+" pontos ("+Math.round(MIN_PCT*100)+"% do máximo da semana)."};
  return{v:{name:name,level_idx:Number($("#pLevel").value),start_date:$("#pStart").value,study_days:days,
    sheets_per_day:Number($("#pPer").value),week_close_dow:Number($("#pClose").value),weekly_goal:wk,sticker_themes:themes,sticker_theme:themes[0],
    repeat_mode:$("#pRepeat").value,stamps_needed:Number($("#pStamps").value)}};
}

function showForm(){
  FC.render(topbar("Novo aluno")+'<div class="panel"><form id="stForm" class="form" novalidate><h1>Cadastrar aluno</h1>'+programFields(null)+
    '<p class="msg bad" id="fMsg" role="alert"></p><div class="actions"><button class="btn" type="submit" id="fBtn">Cadastrar e gerar link</button><button class="btn ghost" type="button" id="fBack">Voltar</button></div></form></div>');
  bindTop();bindProgram();$("#fBack").onclick=dash;
  $("#stForm").onsubmit=async function(e){
    e.preventDefault();var r=readProgram();
    if(r.error){$("#fMsg").textContent=r.error;return}
    $("#fBtn").disabled=true;
    var res=await sb.rpc("create_student",{p_name:r.v.name,p_level:r.v.level_idx,p_start:r.v.start_date,p_days:r.v.study_days,
      p_per_day:r.v.sheets_per_day,p_close:r.v.week_close_dow,p_goal:r.v.weekly_goal,p_reward:"",p_repeat:r.v.repeat_mode,p_stamps:r.v.stamps_needed,p_theme:r.v.sticker_theme,p_themes:r.v.sticker_themes});
    if(res.error){$("#fBtn").disabled=false;$("#fMsg").textContent=FC.err(res.error);return}
    created(r.v.name,res.data.link_code,res.data.id);
  };
}
function linkFor(code){return location.origin+location.pathname+"?aluno="+code}
function created(name,code,id){
  var link=linkFor(code);
  FC.render(topbar("Aluno cadastrado")+'<div class="panel"><h1>'+esc(name)+' foi cadastrado</h1>'+
    '<p>Envie este link para o aluno. Ele abre no aparelho dele e cria um PIN de 4 números no primeiro acesso. Depois o aparelho continua conectado.</p>'+
    '<div class="linkrow"><input id="lnk" readonly value="'+esc(link)+'" aria-label="Link do aluno"><button class="btn" id="cp">Copiar link</button></div>'+
    '<p class="muted small-t">Guarde o link: é a porta de entrada do aluno. Se o link vazar, gere outro na página do aluno.</p>'+
    '<div class="actions"><button class="btn" id="go">Abrir página do aluno</button><button class="btn ghost" id="all">Ver todos os alunos</button></div></div>');
  bindTop();$("#cp").onclick=function(){FC.copy(link,$("#lnk"))};
  $("#go").onclick=function(){detail(id)};$("#all").onclick=dash;
}

/* ---------- página do aluno ---------- */
async function detail(id){
  FC.render('<p class="loading">Carregando…</p>');
  var s,sheets,weeks,guards,profs,weak,awards;
  try{
    var res=await Promise.all([
      q(sb.from("students").select("*").eq("id",id).single()),
      q(sb.from("sheets").select("id,study_day,week_end,level_idx,first_ok,total,secs,corrections,stamp,advanced,points,finished_at").eq("student_id",id).eq("status","done").order("finished_at",{ascending:false}).limit(300)),
      q(sb.from("week_settings").select("*").eq("student_id",id)),
      q(sb.from("guardians").select("user_id,role").eq("student_id",id)),
      q(sb.from("weak_items").select("pre,post,ans,misses,level_idx").eq("student_id",id).order("misses",{ascending:false}).limit(12)),
      q(sb.from("awards").select("kind,theme,slot,period_mode,period_end").eq("student_id",id).order("period_end"))]);
    s=res[0];sheets=res[1];weeks=res[2];guards=res[3];weak=res[4];awards=res[5];
    profs=await q(sb.from("profiles").select("id,name,role").in("id",guards.map(function(g){return g.user_id})));
  }catch(e){return errScreen(e,function(){detail(id)})}
  var iAmOwner=guards.some(function(g){return g.user_id===U.user.id&&g.role==="owner"});
  var link=linkFor(s.link_code),today=FC.today(),L=FC.LEVELS[s.level_idx];
  var per=FC.periodOf(today,s.week_close_dow),weekEnd=per.end,curPts=0;
  sheets.forEach(function(x){if(x.week_end===per.end)curPts+=x.points});
  var curSet=weeks.filter(function(w){return w.week_end===per.end})[0];
  var goal=curSet?curSet.goal:s.weekly_goal;
  var themeIds=s.sticker_themes&&s.sticker_themes.length?s.sticker_themes:[s.sticker_theme];
  var packsWaiting=awards.filter(function(a){return a.kind==="pacote"}).length;
  var rewardPanel='<div class="panel"><div class="eyebrow gap">Álbuns'+(themeIds.length>1?' ('+themeIds.length+')':'')+'</div>'+
    (packsWaiting?'<p class="small-t"><b>'+packsWaiting+' pacotinho'+(packsWaiting>1?'s':'')+'</b> esperando a criança escolher'+(themeIds.length>1?' o álbum':'')+'.</p>':'')+
    '<p class="muted small-t">As figurinhas apagadas ainda não foram ganhas: a criança só vê as que conquistou. Toque em uma figurinha para ver o verso.</p>'+
    themeIds.map(function(id,i){
      var th=FC.theme(id),got=awards.filter(function(a){return a.kind==="figurinha"&&a.theme===id}).map(function(a){return{slot:a.slot,end:a.period_end}});
      return '<details class="album-detail gap"'+(i===0?" open":"")+'><summary>'+esc(th.name)+' · '+got.length+' de '+FC.ALBUM_SIZE+'</summary>'+FC.rarityLegend(id)+FC.albumHtml(id,got,{adult:true})+'</details>';
    }).join("")+'</div>';
  var trailHtml=FC.trailHtml({start:per.start,end:per.end,points:curPts,goal:goal,reached:goal>0&&curPts>=goal},{adult:true});

  /* semanas */
  var by={};
  sheets.forEach(function(x){var w=by[x.week_end]||(by[x.week_end]={pts:0,n:0});w.pts+=x.points;w.n++});
  weeks.forEach(function(w){by[w.week_end]=by[w.week_end]||{pts:0,n:0}});
  by[weekEnd]=by[weekEnd]||{pts:0,n:0};
  var wk=Object.keys(by).sort().reverse().slice(0,12).map(function(end){
    var set=weeks.filter(function(w){return w.week_end===end})[0],g=set?set.goal:s.weekly_goal,w=by[end];
    var open=end>=today,hit=g>0&&w.pts>=g;
    return "<tr><td>até "+FC.dayLabel(end)+"</td><td>"+w.n+"</td><td>"+w.pts+"</td>"+"<td>"+g+"</td><td>"+(hit?'<span class="tag ok">meta batida</span>':open?'<span class="tag">em andamento</span>':'<span class="tag bad">não batida</span>')+"</td></tr>";
  }).join("");
  var weeksHtml='<div class="panel"><div class="eyebrow gap">Semanas</div><div class="tablewrap"><table><thead><tr><th>Semana</th><th>Folhas</th><th>Pontos</th><th>Meta</th><th>Situação</th></tr></thead><tbody>'+wk+'</tbody></table></div></div>';

  /* faltas */
  var doneBy={};sheets.forEach(function(x){doneBy[x.study_day]=(doneBy[x.study_day]||0)+1});
  var miss=[],from=FC.addDays(today,-45);if(from<s.start_date)from=s.start_date;
  for(var d=from;d<today;d=FC.addDays(d,1)){
    if(s.study_days.indexOf(FC.dow(d))<0)continue;
    var n=doneBy[d]||0;
    if(n<s.sheets_per_day)miss.push('<li><b>'+FC.dayLabel(d)+'</b> '+(n===0?'não estudou':'fez '+n+' de '+s.sheets_per_day+' folhas')+'</li>');
  }
  miss.reverse();

  var rows=sheets.slice(0,40).map(function(x){
    return '<tr><td>'+FC.dayLabel(x.study_day)+'</td><td>'+esc(FC.lv(x.level_idx))+'</td><td>'+x.first_ok+'/'+x.total+'</td><td>'+FC.fmtTime(x.secs)+'</td><td>'+x.points+'</td><td>'+
      (x.advanced?'<span class="tag ok">subiu de nível</span>':x.stamp?'<span class="tag ok">carimbo</span>':'<span class="tag">repetir</span>')+'</td><td><button class="btn ghost small" data-sheet="'+x.id+'">Ver</button></td></tr>';
  }).join("");
  var names=guards.map(function(g){
    var p=profs.filter(function(x){return x.id===g.user_id})[0];
    return '<li>'+esc(p?p.name||"Sem nome":"Adulto")+' <span class="muted">· '+(p&&p.role==="professor"?"professor(a)":"responsável")+(g.role==="owner"?" · cadastrou o aluno":"")+(g.user_id===U.user.id?" · você":"")+'</span></li>';
  }).join("");
  var need=s.stamps_needed||3,stamps="";for(var i=0;i<need;i++)stamps+='<span class="stamp'+(i<s.stamps?" on":"")+'">✓</span>';
  var weakHtml='<div class="panel"><div class="eyebrow gap">Contas em reforço</div>'+(weak.length?
    '<ul class="plain miss">'+weak.map(function(w){
      return '<li><span class="q">'+esc(w.pre)+' <b>'+esc(w.ans)+'</b>'+esc(w.post)+'</span> <span class="muted small-t">nível '+esc(FC.lv(w.level_idx))+' · errou '+w.misses+' vez'+(w.misses>1?'es':'')+'</span></li>'}).join("")+'</ul>':
    '<p class="muted">Nenhuma conta em reforço agora.</p>')+
    '<p class="muted small-t gap">'+(s.repeat_mode==="reforco"?"Estas contas voltam nas próximas folhas até ele acertar 2 vezes seguidas.":"Modo atual: “"+esc(MODES[s.repeat_mode][0])+"”. As contas erradas são registradas, mas não voltam sozinhas.")+'</p></div>';

  FC.render(topbar("Aluno")+
    '<div class="section-head"><div><button class="link" id="back">← Todos os alunos</button><h1>'+esc(s.name)+'</h1></div></div>'+
    '<div class="grid"><div class="col">'+
    '<div class="panel now"><span class="eyebrow">Nível atual</span><div class="lvl">'+L.id+'<span class="of"> de '+FC.LEVELS.length+'</span></div><div class="nm">'+esc(L.name)+'</div>'+
    '<div class="stamps"><span>Carimbos</span><span class="row-gap">'+stamps+'</span><span>'+Math.min(s.stamps,need)+' de '+need+'</span></div>'+
    '<p class="muted small-t">O aluno sobe de nível sozinho ao juntar '+need+' carimbo'+(need>1?'s':'')+'. Você vê o aviso no histórico. Para mudar o nível agora, use o programa abaixo.</p></div>'+
    '<div class="panel">'+trailHtml+'</div>'+rewardPanel+
    '<div class="panel"><div class="eyebrow gap">Acesso do aluno</div><div class="linkrow"><input id="lnk" readonly value="'+esc(link)+'" aria-label="Link do aluno"><button class="btn small" id="cp">Copiar</button></div>'+
    '<div class="actions gap"><button class="btn ghost small" id="rstPin">Redefinir PIN</button><button class="btn ghost small" id="newLink">Gerar novo link</button></div>'+
    '<p class="muted small-t">Redefinir o PIN desconecta o aluno; ele cria um novo PIN no mesmo link. Gerar novo link invalida o link antigo.</p></div>'+
    '<div class="panel"><div class="eyebrow gap">Adultos com acesso</div><ul class="plain">'+names+'</ul>'+
    (iAmOwner?'<div class="actions gap"><button class="btn ghost small" id="invite">Convidar outro adulto</button></div><div id="inviteOut"></div>':'')+'</div>'+
    '</div><div class="col">'+
    '<div class="panel"><form id="edForm" class="form" novalidate><div class="eyebrow">Programa de estudos</div>'+programFields(s)+
    '<p class="msg bad" id="fMsg" role="alert"></p><div class="actions"><button class="btn" id="fBtn" type="submit">Salvar programa</button></div></form></div>'+
    '<div class="panel"><div class="eyebrow gap">Dias sem estudo (últimos 45 dias)</div>'+(miss.length?'<ul class="plain miss">'+miss.join("")+'</ul>':'<p class="muted">Nenhuma falta no período.</p>')+'</div>'+weakHtml+'<div class="panel" id="slowBox"><div class="eyebrow gap">Contas mais demoradas</div><p class="muted">Carregando…</p></div>'+
    '</div></div>'+
    weeksHtml+
    '<div class="panel"><div class="eyebrow gap">Folhas feitas</div>'+(rows?'<div class="tablewrap"><table><thead><tr><th>Dia</th><th>Nível</th><th>Acertos</th><th>Tempo</th><th>Pontos</th><th>Resultado</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<p class="muted">Nenhuma folha feita ainda.</p>')+'<div id="sheetView"></div></div>'+
    (iAmOwner?'<div class="panel"><div class="eyebrow gap">Zona de risco</div><button class="btn ghost small" id="del">Apagar aluno e todo o histórico</button></div>':''));
  bindTop();bindProgram();
  $("#back").onclick=dash;
  loadSlow(id);
  $("#cp").onclick=function(){FC.copy(link,$("#lnk"))};
  FC.confirmClick($("#rstPin"),"Toque de novo para confirmar",async function(){
    var r=await sb.rpc("reset_pin",{p_student:id});
    FC.toast(r.error?FC.err(r.error):"PIN redefinido. O aluno cria um novo no link.",!!r.error);
  });
  FC.confirmClick($("#newLink"),"Toque de novo para confirmar",async function(){
    var r=await sb.rpc("regenerate_link",{p_student:id});
    if(r.error)return FC.toast(FC.err(r.error),true);
    FC.toast("Novo link gerado. O antigo parou de funcionar.");detail(id);
  });
  var inv=$("#invite");
  if(inv)inv.onclick=async function(){
    var r=await sb.rpc("create_invite",{p_student:id});
    if(r.error)return FC.toast(FC.err(r.error),true);
    $("#inviteOut").innerHTML='<p>Código do convite: <b class="code">'+esc(r.data)+'</b></p><p class="muted small-t">Vale por 7 dias e uma única vez. O outro adulto cadastra-se, toca em “Tenho um convite” e digita o código.</p>';
  };
  var del=$("#del");
  if(del)FC.confirmClick(del,"Toque de novo: isso não tem volta",async function(){
    var r=await sb.rpc("delete_student",{p_student:id});
    if(r.error)return FC.toast(FC.err(r.error),true);
    FC.toast("Aluno apagado.");dash();
  });
  $("#edForm").onsubmit=async function(e){
    e.preventDefault();var r=readProgram();
    if(r.error){$("#fMsg").textContent=r.error;return}
    var patch=r.v;if(patch.level_idx!==s.level_idx)patch.stamps=0;
    else if(s.stamps>=patch.stamps_needed)patch.stamps=Math.max(0,patch.stamps_needed-1);
    $("#fBtn").disabled=true;
    var res=await sb.from("students").update(patch).eq("id",id);
    if(res.error){$("#fBtn").disabled=false;$("#fMsg").textContent=FC.err(res.error);return}
    FC.toast("Programa salvo.");detail(id);
  };
  $$("[data-sheet]").forEach(function(b){b.onclick=function(){openSheet(b.getAttribute("data-sheet"),b)}});
}

/* Contas em que o aluno mais demora, nas últimas 20 folhas: média do tempo na conta contra o tempo esperado do nível. */
async function loadSlow(id){
  var box=$("#slowBox");if(!box)return;
  var r=await sb.from("sheets").select("level_idx,problems,answers").eq("student_id",id).eq("status","done").order("finished_at",{ascending:false}).limit(20);
  if(r.error){box.innerHTML='<div class="eyebrow gap">Contas mais demoradas</div><p class="msg bad">'+esc(FC.err(r.error))+'</p>';return}
  var g={};
  r.data.forEach(function(sh){
    var exp=FC.LEVELS[sh.level_idx].target/10*1000;
    (sh.answers||[]).forEach(function(a,i){
      var p=sh.problems[i];if(!p||!a||!(a.ms>0))return;
      var k=sh.level_idx+"|"+p.pre+"|"+(p.post||""),x=g[k]||(g[k]={p:p,exp:exp,sum:0,n:0,lv:sh.level_idx});
      x.sum+=a.ms;x.n++;
    });
  });
  var rows=Object.keys(g).map(function(k){var x=g[k];x.avg=x.sum/x.n;x.ratio=x.avg/x.exp;return x})
    .filter(function(x){return x.ratio>1}).sort(function(a,b){return b.ratio-a.ratio}).slice(0,8);
  var any=Object.keys(g).length;
  box.innerHTML='<div class="eyebrow gap">Contas mais demoradas</div>'+(rows.length?
    '<ul class="plain miss">'+rows.map(function(x){
      return '<li><span class="q">'+esc(x.p.pre)+' <b>'+esc(x.p.a)+'</b>'+esc(x.p.post||"")+'</span> <span class="muted small-t">nível '+esc(FC.lv(x.lv))+' · média '+FC.fmtSec(x.avg)+' (esperado '+FC.fmtSec(x.exp)+')'+(x.n>1?' · '+x.n+' vezes':'')+'</span></li>'}).join("")+'</ul>':
    '<p class="muted">'+(any?'Nenhuma conta ficou acima do tempo esperado nas últimas folhas.':'Ainda não há tempos por conta. Eles aparecem nas próximas folhas.')+'</p>')+
    '<p class="muted small-t gap">O tempo de cada conta conta enquanto a caixa de resposta dela está selecionada, só na primeira tentativa.</p>';
}

async function openSheet(sid,btn){
  var box=$("#sheetView");box.innerHTML='<p class="loading">Carregando folha…</p>';
  var r=await sb.from("sheets").select("problems,answers,level_idx,study_day,first_ok,secs,points").eq("id",sid).single();
  if(r.error){box.innerHTML='<p class="msg bad">'+esc(FC.err(r.error))+'</p>';return}
  var sh=r.data,ans=sh.answers||[];
  var exp=FC.LEVELS[sh.level_idx].target/10*1000,msAll=ans.map(function(a){return a&&a.ms>0?a.ms:0}).filter(function(x){return x>0});
  var avg=msAll.length?msAll.reduce(function(a,b){return a+b},0)/msAll.length:0;
  var li=sh.problems.map(function(p,i){
    var a=ans[i]||{},ok=a.ok,ms=a.ms||0;
    return '<li class="'+(ok?"ok":"bad")+'"><span class="q">'+esc(p.pre)+' '+esc(a.v===""||a.v==null?"–":a.v)+(p.post?" "+esc(p.post):"")+'</span> '+
      (ok?'<span class="tag ok">certa de primeira</span>':'<span class="tag bad">errou · resposta certa: '+esc(p.a)+'</span>')+
      (ms>0?' <span class="muted small-t">'+FC.fmtSec(ms)+'</span>':'')+(ms>exp*1.5?' <span class="tag warn">lenta</span>':'')+
      (a.tries>1?' <span class="muted small-t">('+a.tries+' tentativas)</span>':'')+'</li>';
  }).join("");
  box.innerHTML='<div class="sheetview"><h3>Folha de '+FC.dayLabel(sh.study_day)+' · nível '+esc(FC.lv(sh.level_idx))+'</h3>'+
    '<p class="muted">'+sh.first_ok+' acertos de primeira em '+FC.fmtTime(sh.secs)+' · '+sh.points+' pontos'+(avg?' · tempo médio por conta '+FC.fmtSec(avg)+' (esperado até '+FC.fmtSec(exp)+')':'')+'</p><ol class="sv">'+li+'</ol></div>';
  box.scrollIntoView({behavior:"smooth",block:"nearest"});
}
})();
