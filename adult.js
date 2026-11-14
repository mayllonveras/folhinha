/* Painel de pais e professores: cadastro/login, alunos, programa de estudos, sequência de estudo e histórico. */
(function(){
"use strict";
var FC=window.FC,$=FC.$,$$=FC.$$,esc=FC.esc,sb=FC.sb;
var U={user:null,profile:null};
var PUB=null;   /* parâmetros do avanço (leitura): regras, virada do ano, teto padrão */
async function ensurePub(){if(PUB)return;try{var r=await sb.rpc("app_public");if(!r.error&&r.data)PUB=r.data}catch(e){}}
/* Etiqueta do ano: o que o aluno cursa e de que ano é o conteúdo que ele estuda. */
function anoLine(s,L,today){
  var a=FC.anoAluno(s,today,PUB);
  if(!a)return "Conteúdo do "+FC.ordAno(L.ano);
  var d=L.ano-a;
  return "Cursa o "+FC.ordAno(a)+" · estudando o "+FC.ordAno(L.ano)+(d>0?" (+"+d+")":d<0?" (−"+(-d)+")":"");
}
/* Limites mínimos do programa: 3 folhas por dia e 3 dias por semana. */
var MIN_SHEETS=3,MIN_DAYS=3,MAX_THEMES=2;
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
  return '<header class="appbar"><img src="icons/icon-192.png" alt=""><div class="grow"><b>Folhinha VIP</b><small>'+(extra||"Painel para pais e professores")+'</small></div>'+
    (U.user?'<div class="who"><span class="who-name">'+name+'</span><button class="btn ghost small" id="logout">Sair</button></div>':'')+'</header>';
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
function todayDone(s,sheets){var t=FC.today();return sheets.filter(function(x){return x.student_id===s.id&&x.study_day===t}).length}

async function dash(){
  FC.render('<p class="loading">Carregando…</p>');
  var prof,students,sheets;
  try{
    if(!U.user){var g=await sb.auth.getUser();if(g.error||!g.data.user)return showAuth("login");U.user=g.data.user}
    var res=await Promise.all([
      q(sb.from("profiles").select("name,role").eq("id",U.user.id).maybeSingle()),
      q(sb.from("students").select("*").order("created_at")),
      q(sb.from("sheets").select("student_id,study_day").eq("status","done").gte("study_day",FC.addDays(FC.today(),-60)))]);
    prof=res[0];students=res[1];sheets=res[2];
    await ensurePub();
  }catch(e){return errScreen(e,dash)}
  U.profile=prof||{name:"",role:"pai"};
  var today=FC.today(),cards=students.map(function(s){
    var L=FC.LEVELS[s.level_idx],sk=FC.streakNow(s,today),need=(PUB&&PUB.stamps_needed)||5,pct=Math.min(100,Math.round(100*Math.min(s.stamps,need)/need));
    var isStudy=s.study_days.indexOf(FC.dow(today))>=0&&today>=s.start_date,done=todayDone(s,sheets);
    var st=today<s.start_date?"Começa em "+FC.dm(s.start_date):isStudy?"Hoje: "+done+" de "+s.sheets_per_day+" folhas":"Hoje: descanso";
    return '<button class="panel card" data-id="'+s.id+'"><div class="card-top"><b class="card-name">'+esc(s.name)+'</b><span class="lvlchip">Nível '+L.id+'</span></div>'+
      '<div class="muted">'+esc(L.name)+'</div><div class="muted small-t">'+esc(anoLine(s,L,today))+'</div><div class="muted small-t">'+st+'</div>'+
      '<div class="bar"><i style="width:'+pct+'%"></i></div><div class="small-t">'+Math.min(s.stamps,need)+' de '+need+' carimbos · '+sk+' dia'+(sk===1?"":"s")+' seguido'+(sk===1?"":"s")+'</div></button>';
  }).join("");
  FC.render(topbar()+'<div class="section-head"><h1>Meus alunos</h1><div class="actions"><button class="btn" id="newStudent">Cadastrar aluno</button></div></div>'+
    (students.length?'<div class="cards">'+cards+'</div>':'<div class="panel center"><h2>Nenhum aluno ainda</h2><p class="muted">Cadastre o primeiro aluno, informe o nível dele e monte o programa de estudos. O sistema gera um link para ele entrar.</p></div>')+
    '<details class="panel"><summary>Tenho um convite de outro adulto</summary><form id="invForm" class="form inline"><label class="field grow">Código do convite<input id="invCode" maxlength="12" autocomplete="off" placeholder="Ex.: 3F9A1C20"></label><button class="btn" type="submit">Entrar no aluno</button></form><p class="msg bad" id="invMsg" role="alert"></p></details>'+FC.installBox());
  bindTop();FC.refreshInstall();
  $("#newStudent").onclick=function(){showForm(null)};
  $$(".card").forEach(function(c){c.onclick=function(){openStudent(c.getAttribute("data-id"))}});
  $("#invForm").onsubmit=async function(e){
    e.preventDefault();var code=$("#invCode").value.trim();if(!code)return;
    var r=await sb.rpc("redeem_invite",{p_code:code});
    if(r.error){$("#invMsg").textContent=FC.err(r.error);return}
    FC.toast("Agora você acompanha "+r.data.name+".");dash();
  };
}

/* ---------- formulário do programa (cadastro e edição) ---------- */
function programFields(s){
  var v=s||{name:"",level_idx:0,start_date:FC.today(),study_days:[1,2,3,4,5],sheets_per_day:3,sticker_themes:["dinossauros"]};
  var lv="",lastG=null;
  FC.LEVELS.forEach(function(l,i){
    if(l.group!==lastG){if(lastG!==null)lv+="</optgroup>";lv+='<optgroup label="'+esc(l.group)+'">';lastG=l.group}
    lv+='<option value="'+i+'"'+(i===v.level_idx?" selected":"")+'>'+l.id+" · "+esc(l.name)+'</option>';
  });
  lv+="</optgroup>";
  var days=FC.DOW.map(function(d,i){return '<label class="chk"><input type="checkbox" name="days" value="'+i+'"'+(v.study_days.indexOf(i)>=0?" checked":"")+'><span>'+d+'</span></label>'}).join("");
  var chosen=v.sticker_themes||[v.sticker_theme||"dinossauros"];
  var anoNow=s?FC.anoAluno(s,FC.today(),PUB)||s.ano_escolar:null,ao='<option value="">Não informar</option>';
  for(var a=1;a<=9;a++)ao+='<option value="'+a+'"'+(anoNow===a?" selected":"")+'>'+a+'º ano</option>';
  var pad=(PUB&&PUB.teto_anos_padrao!=null)?PUB.teto_anos_padrao:1,tt=v.teto_anos==null?"":String(v.teto_anos);
  var to='<option value=""'+(tt===""?" selected":"")+'>Padrão: até '+pad+' ano'+(pad===1?"":"s")+' à frente</option>';
  [[0,"Só o conteúdo do ano dele"],[1,"Até 1 ano à frente"],[2,"Até 2 anos à frente"],[3,"Até 3 anos à frente"],[99,"Sem limite"]].forEach(function(o){
    to+='<option value="'+o[0]+'"'+(tt===String(o[0])?" selected":"")+'>'+o[1]+'</option>'});
  var per="";for(var i=MIN_SHEETS;i<=10;i++)per+='<option value="'+i+'"'+(i===v.sheets_per_day?" selected":"")+'>'+i+'</option>';
  return '<label class="field">Nome do aluno<input id="pName" maxlength="40" value="'+esc(v.name)+'" required></label>'+
    '<div class="two"><label class="field">Ano escolar<select id="pAno">'+ao+'</select><small>O ano é atualizado sozinho na virada do ano, sem mexer no nível dele.</small></label>'+
    '<label class="field">Quanto ele pode avançar<select id="pTeto">'+to+'</select><small>Limite de conteúdo à frente do ano escolar. Só vale se o ano for informado.</small></label></div>'+
    '<label class="field">Nível em que ele está<select id="pLevel">'+lv+'</select><small>Escolha o nível em que ele resolve as folhas com facilidade, sem ajuda.</small></label>'+
    '<div class="two"><label class="field">Começa a estudar em<input id="pStart" type="date" value="'+v.start_date+'" required></label>'+
    '<label class="field">Folhas por dia de estudo<select id="pPer">'+per+'</select><small>Mínimo: '+MIN_SHEETS+' folhas por dia.</small></label></div>'+
    '<fieldset class="field"><legend>Dias da semana de estudo</legend><div class="chks">'+days+'</div><small id="pDaysHint">Mínimo: '+MIN_DAYS+' dias por semana.</small></fieldset>'+
    '<fieldset class="field"><legend>Álbuns disponíveis para a criança</legend><div class="theme-pick">'+FC.THEMES.map(function(t){
      return '<div class="theme-opt"><input type="checkbox" name="themes" value="'+t.id+'" id="th_'+t.id+'"'+(chosen.indexOf(t.id)>=0?" checked":"")+'><label class="to-art" for="th_'+t.id+'">'+FC.themeCover(t.id)+'</label>'+
        '<label class="to-txt" for="th_'+t.id+'"><b>'+esc(t.name)+'</b><small>'+esc(t.desc)+'</small></label><button type="button" class="btn ghost small" data-view="'+t.id+'">Ver</button></div>'}).join("")+'</div>'+
      '<small id="pThemeHint">Marque 1 ou 2 álbuns. A criança ganha pacotinhos nos dias de estudo e escolhe de qual álbum quer cada figurinha surpresa.</small></fieldset>'+
    rulesBox();
}
function rulesBox(){
  var P=PUB||{},n=P.normal_acertos||80,need=P.stamps_needed||5,sj=P.salto_por_semana!=null?P.salto_por_semana:2;
  return '<div class="rule-box"><b>Como o aluno avança</b><ul>'+
    '<li>Cada dia em que ele acerta <b>'+n+'% ou mais</b> das contas de primeira, com tempo médio por folha dentro da meta do nível, vale <b>1 carimbo</b>. O carimbo sai ao fechar a última folha do dia.</li>'+
    '<li>Com <b>'+need+' carimbos</b> ele sobe de nível.</li>'+
    '<li><b>Dia de ouro:</b> '+(P.ouro_acertos||95)+'% ou mais de acertos de primeira e tempo médio até '+(P.ouro_tempo||80)+'% da meta valem <b>'+(P.ouro_carimbos||2)+' carimbos</b>.</li>'+
    (sj>0?'<li><b>Dia de salto:</b> no 1º dia de um nível, '+(P.salto_acertos||98)+'% ou mais e tempo médio até '+(P.salto_tempo||60)+'% da meta fazem ele <b>subir direto</b> (no máximo '+sj+' por semana). Se for mal no nível novo, o app oferece a ele voltar e treinar mais; ele decide.</li>':'')+
    '<li>O aluno só avança até o <b>limite de anos à frente</b> definido acima. Ao chegar nele, continua praticando e você pode liberar mais.</li>'+
    '<li>As contas que ele erra voltam nas próximas folhas, até 4 por folha, e continuam voltando no nível seguinte até ele acertar 2 vezes seguidas.</li>'+
    '<li>Cada <b>carimbo</b> vale <b>1 pacotinho</b> de figurinhas.</li>'+
    '<li>Fechar <b>todas as folhas do dia</b>, com ou sem carimbo, vale mais <b>1 pacotinho</b> (perseverança). A cota precisa fechar no mesmo dia.</li>'+
    '<li>Dias de estudo seguidos com a cota fechada dão pacotinhos extras aos <b>3, 7 e 14 dias</b> (2, 3 e 5 pacotinhos) e depois <b>a cada 30 dias</b> (5 pacotinhos). Faltar a um dia de estudo zera a sequência.</li></ul></div>';
}
function bindProgram(){
  $$('input[name="themes"]').forEach(function(c){c.addEventListener("change",function(){
    var on=$$('input[name="themes"]:checked'),h=$("#pThemeHint");
    if(on.length>MAX_THEMES){c.checked=false;if(h){h.textContent="Só dá para escolher "+MAX_THEMES+" álbuns por criança. Desmarque um para trocar.";h.className="bad"}}
    else if(h){h.textContent="Marque 1 ou 2 álbuns. A criança ganha pacotinhos nos dias de estudo e escolhe de qual álbum quer cada figurinha surpresa.";h.className=""}
  })});
  function upd(){
    var n=$$('input[name="days"]:checked').length;
    $("#pDaysHint").textContent=n<MIN_DAYS?"Marque pelo menos "+MIN_DAYS+" dias por semana.":"Mínimo: "+MIN_DAYS+" dias por semana.";
    $("#pDaysHint").className=n<MIN_DAYS?"bad":"";
  }
  $$("[data-view]").forEach(function(btn){btn.onclick=function(){
    var th=FC.theme(btn.getAttribute("data-view")),cells="";
    for(var i=0;i<FC.ALBUM_SIZE;i++)cells+=FC.stickerHtml(th.id,i);
    FC.overlay('<h2>'+esc(th.name)+'</h2><p class="muted">'+esc(th.desc)+' A criança só vê cada figurinha quando a ganha.</p>'+FC.rarityLegend(th.id)+'<div class="album">'+cells+'</div>',{wide:true});
  }});
  $$('input[name="days"]').forEach(function(c){c.onchange=upd});
  upd();
}
function readProgram(){
  var days=$$('input[name="days"]:checked').map(function(c){return Number(c.value)}),name=$("#pName").value.trim();
  if(!name)return{error:"Digite o nome do aluno."};
  if(days.length<MIN_DAYS)return{error:"Marque pelo menos "+MIN_DAYS+" dias de estudo por semana."};
  if(Number($("#pPer").value)<MIN_SHEETS)return{error:"O mínimo é de "+MIN_SHEETS+" folhas por dia."};
  if(!$("#pStart").value)return{error:"Informe a data de início."};
  var themes=$$('input[name="themes"]:checked').map(function(c){return c.value});
  if(!themes.length)return{error:"Marque pelo menos um álbum de figurinhas."};
  if(themes.length>MAX_THEMES)return{error:"Escolha no máximo "+MAX_THEMES+" álbuns para a criança."};
  var anoV=$("#pAno").value,tetoV=$("#pTeto").value;
  return{v:{name:name,level_idx:Number($("#pLevel").value),start_date:$("#pStart").value,study_days:days,
    sheets_per_day:Number($("#pPer").value),sticker_themes:themes,sticker_theme:themes[0],
    ano_escolar:anoV===""?null:Number(anoV),teto_anos:tetoV===""?null:Number(tetoV)}};
}

async function showForm(){
  await ensurePub();
  FC.render(topbar("Novo aluno")+'<div class="panel"><form id="stForm" class="form" novalidate><h1>Cadastrar aluno</h1>'+programFields(null)+
    '<p class="msg bad" id="fMsg" role="alert"></p><div class="actions"><button class="btn" type="submit" id="fBtn">Cadastrar e gerar link</button><button class="btn ghost" type="button" id="fBack">Voltar</button></div></form></div>');
  bindTop();bindProgram();$("#fBack").onclick=dash;
  $("#stForm").onsubmit=async function(e){
    e.preventDefault();var r=readProgram();
    if(r.error){$("#fMsg").textContent=r.error;return}
    $("#fBtn").disabled=true;
    var res=await sb.rpc("create_student",{p_name:r.v.name,p_level:r.v.level_idx,p_start:r.v.start_date,p_days:r.v.study_days,
      p_per_day:r.v.sheets_per_day,p_close:0,p_goal:0,p_reward:"",p_repeat:"reforco",p_stamps:5,p_theme:r.v.sticker_theme,p_themes:r.v.sticker_themes,p_ano:r.v.ano_escolar,p_teto:r.v.teto_anos});
    if(res.error){$("#fBtn").disabled=false;$("#fMsg").textContent=FC.err(res.error);return}
    created(r.v.name,res.data.link_code,res.data.id);
  };
}
function openStudent(id){FC.tabState.pai="resumo";try{sessionStorage.setItem("fc_tab_pai","resumo")}catch(e){}detail(id)}
function linkFor(code){return location.origin+location.pathname+"?aluno="+FC.fmtCode(code)}
function created(name,code,id){
  var link=linkFor(code);
  FC.render(topbar("Aluno cadastrado")+'<div class="panel"><h1>'+esc(name)+' foi cadastrado</h1>'+
    '<p>Envie este link para o aluno. Ele abre no aparelho dele e cria um PIN de 4 números no primeiro acesso. Depois o aparelho continua conectado.</p>'+
    '<div class="linkrow"><input id="lnk" readonly value="'+esc(link)+'" aria-label="Link do aluno"><button class="btn" id="cp">Copiar link</button></div>'+
    '<p class="muted small-t">Guarde o link: é a porta de entrada do aluno. Se o link vazar, gere outro na página do aluno.</p>'+
    '<div class="actions"><button class="btn" id="go">Abrir página do aluno</button><button class="btn ghost" id="all">Ver todos os alunos</button></div></div>');
  bindTop();$("#cp").onclick=function(){FC.copy(link,$("#lnk"))};
  $("#go").onclick=function(){openStudent(id)};$("#all").onclick=dash;
}

/* ---------- página do aluno ---------- */
async function detail(id){
  FC.render('<p class="loading">Carregando…</p>');
  var s,sheets,guards,profs,weak,awards,moves=[];
  try{
    var res=await Promise.all([
      q(sb.from("students").select("*").eq("id",id).single()),
      q(sb.from("sheets").select("id,study_day,level_idx,first_ok,total,secs,corrections,stamp,advanced,finished_at").eq("student_id",id).eq("status","done").order("finished_at",{ascending:false}).limit(300)),
      q(sb.from("guardians").select("user_id,role").eq("student_id",id)),
      q(sb.from("weak_items").select("pre,post,ans,misses,level_idx,extra").eq("student_id",id).order("misses",{ascending:false}).limit(12)),
      q(sb.from("awards").select("kind,theme,slot,source,period_end").eq("student_id",id).order("period_end"))]);
    s=res[0];sheets=res[1];guards=res[2];weak=res[3];awards=res[4];
    await ensurePub();
    var mv=await sb.from("level_moves").select("day,from_idx,to_idx,kind").eq("student_id",id).order("at",{ascending:false}).limit(8);
    if(!mv.error)moves=mv.data||[];
    profs=await q(sb.from("profiles").select("id,name,role").in("id",guards.map(function(g){return g.user_id})));
  }catch(e){return errScreen(e,function(){detail(id)})}
  var iAmOwner=guards.some(function(g){return g.user_id===U.user.id&&g.role==="owner"});
  var link=linkFor(s.link_code),today=FC.today(),L=FC.LEVELS[s.level_idx];
  var sk=FC.streakNow(s,today);
  var themeIds=s.sticker_themes&&s.sticker_themes.length?s.sticker_themes:[s.sticker_theme];
  var packsWaiting=awards.filter(function(a){return a.kind==="pacote"}).length;
  var rewardPanel='<div class="panel"><div class="eyebrow gap">Álbuns'+(themeIds.length>1?' ('+themeIds.length+')':'')+'</div>'+
    (packsWaiting?'<p class="small-t"><b>'+packsWaiting+' pacotinho'+(packsWaiting>1?'s':'')+'</b> esperando a criança escolher'+(themeIds.length>1?' o álbum':'')+'.</p>':'')+
    '<p class="muted small-t">As figurinhas apagadas ainda não foram ganhas: a criança só vê as que conquistou. Toque em uma figurinha para ver o verso.</p>'+
    themeIds.map(function(id,i){
      var th=FC.theme(id),seen={},got=awards.filter(function(a){if(a.kind!=="figurinha"||a.theme!==id||seen[a.slot])return false;seen[a.slot]=1;return true}).map(function(a){return{slot:a.slot,end:a.period_end}});
      return '<details class="album-detail gap"'+(i===0?" open":"")+'><summary>'+esc(th.name)+' · '+got.length+' de '+FC.ALBUM_SIZE+'</summary>'+FC.rarityLegend(id)+FC.albumHtml(id,got,{adult:true})+'</details>';
    }).join("")+'</div>';
  var streakHtml=FC.streakHtml({streak:sk,best_streak:s.best_streak,next_marco:FC.nextMarco(sk)},{adult:true});

  /* pacotinhos ganhos, por origem (cada um ainda fechado ou já aberto em figurinha) */
  var by={carimbo:0,perseveranca:0,marco:0};
  awards.forEach(function(a){if(a.source&&by[a.source]!=null)by[a.source]++});
  var packsHtml='<div class="panel"><div class="eyebrow gap">Pacotinhos ganhos</div><ul class="plain">'+
    '<li><b>'+by.carimbo+'</b> pelo carimbo do dia</li><li><b>'+by.perseveranca+'</b> pela perseverança (dia fechado)</li><li><b>'+by.marco+'</b> pelos marcos de sequência</li></ul>'+
    '<p class="muted small-t">Total: <b>'+(by.carimbo+by.perseveranca+by.marco)+'</b>. Melhor sequência: <b>'+s.best_streak+'</b> dia'+(s.best_streak===1?"":"s")+'.</p></div>';

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
    return '<tr><td>'+FC.dayLabel(x.study_day)+'</td><td>'+esc(FC.lv(x.level_idx))+'</td><td>'+x.first_ok+'/'+x.total+'</td><td>'+FC.fmtTime(x.secs)+'</td><td>'+
      (x.advanced?'<span class="tag ok">subiu de nível</span>':x.stamp?'<span class="tag ok">carimbo do dia</span>':'')+'</td><td><button class="btn ghost small" data-sheet="'+x.id+'">Ver</button></td></tr>';
  }).join("");
  var names=guards.map(function(g){
    var p=profs.filter(function(x){return x.id===g.user_id})[0];
    return '<li>'+esc(p?p.name||"Sem nome":"Adulto")+' <span class="muted">· '+(p&&p.role==="professor"?"professor(a)":"responsável")+(g.role==="owner"?" · cadastrou o aluno":"")+(g.user_id===U.user.id?" · você":"")+'</span></li>';
  }).join("");
  var need=(PUB&&PUB.stamps_needed)||5,stamps="";for(var i=0;i<need;i++)stamps+='<span class="stamp'+(i<s.stamps?" on":"")+'">✓</span>';
  var anoNow=FC.anoAluno(s,today,PUB),notices="";
  /* limite de avanço atingido: carimbos completos e o próximo nível é de um ano além do teto */
  var tetoPad=(PUB&&PUB.teto_anos_padrao!=null)?PUB.teto_anos_padrao:1,tetoVal=s.teto_anos!=null?s.teto_anos:tetoPad,nextL=FC.LEVELS[s.level_idx+1];
  var atTeto=anoNow&&nextL&&s.stamps>=need&&nextL.ano>anoNow+tetoVal;
  if(atTeto)notices+='<div class="panel offer"><b>O aluno chegou ao limite do plano</b><p class="small-t">Ele completou os carimbos do nível '+L.id+' e o próximo nível é do '+FC.ordAno(nextL.ano)+', além do limite definido (até '+tetoVal+' ano'+(tetoVal===1?"":"s")+' à frente do '+FC.ordAno(anoNow)+'). Ele continua praticando e ganhando figurinhas.</p><div class="actions"><button class="btn small" id="liberar">Liberar mais 1 ano</button></div></div>';
  if(s.reached_by_jump&&s.dry_days>=((PUB&&PUB.dias_sem_carimbo_voltar)||2))notices+='<div class="panel offer"><b>Nível difícil depois do salto</b><p class="small-t">Depois de pular para o nível '+L.id+', o aluno passou '+s.dry_days+' dias de estudo sem ganhar carimbo. O app ofereceu a ele voltar ao nível anterior e treinar mais; ele escolhe. Você também pode trocar o nível na aba Programa.</p></div>';
  if(s.ano_escolar&&s.ano_ref&&FC.anoLetivo(today,PUB)>s.ano_ref)notices+='<div class="panel offer"><b>O ano escolar foi atualizado</b><p class="small-t">Na virada do ano, o ano escolar passou automaticamente para o <b>'+FC.ordAno(anoNow)+'</b>. O nível do aluno não mudou. Confira se está certo; para corrigir, use a aba Programa.</p><div class="actions"><button class="btn small" id="anoOk">Está certo</button></div></div>';
  var movesHtml='<div class="panel"><div class="eyebrow gap">Mudanças de nível</div>'+(moves.length?'<ul class="plain miss">'+moves.map(function(m){
    var a=FC.LEVELS[m.from_idx],b=FC.LEVELS[m.to_idx];
    return '<li><b>'+FC.dayLabel(m.day)+'</b> '+(m.kind==="salto"?"pulou do nível "+a.id+" para o "+b.id:m.kind==="voltou"?"voltou do nível "+a.id+" para o "+b.id:"subiu do nível "+a.id+" para o "+b.id)+'</li>'}).join("")+'</ul>':'<p class="muted">Nenhuma mudança de nível registrada ainda.</p>')+'</div>';
  var weakHtml='<div class="panel"><div class="eyebrow gap">Contas em reforço</div>'+(weak.length?
    '<ul class="plain miss">'+weak.map(function(w){
      return '<li><span class="q">'+esc(w.pre)+(w.extra&&w.extra.fig?' <span class="muted small-t">(com figura)</span>':'')+' <b>'+esc(FC.answerText({extra:w.extra},w.ans))+'</b>'+esc(w.post)+'</span> <span class="muted small-t">nível '+esc(FC.lv(w.level_idx))+' · errou '+w.misses+' vez'+(w.misses>1?'es':'')+'</span></li>'}).join("")+'</ul>':
    '<p class="muted">Nenhuma conta em reforço agora.</p>')+
    '<p class="muted small-t gap">'+"Estas contas voltam nas próximas folhas, inclusive no nível seguinte, até ele acertar 2 vezes seguidas."+'</p></div>';

  var isStudyToday=s.study_days.indexOf(FC.dow(today))>=0&&today>=s.start_date;
  var todaySheets=sheets.filter(function(x){return x.study_day===today}),tdOk=0,tdTot=0;
  todaySheets.forEach(function(x){tdOk+=x.first_ok;tdTot+=x.total});
  var tdPct=tdTot?Math.round(100*tdOk/tdTot):null;
  var stats='<div class="stats">'+
    '<div class="panel stat"><div class="eyebrow">Nível</div><div class="v">'+L.id+' <small>de '+FC.LEVELS.length+'</small></div><small>'+esc(L.name)+'</small><small class="ano-line">'+esc(anoLine(s,L,today))+'</small></div>'+
    '<div class="panel stat"><div class="eyebrow">Carimbos</div><div class="v">'+Math.min(s.stamps,need)+' <small>de '+need+'</small></div><div class="stamps">'+stamps+'</div></div>'+
    '<div class="panel stat"><div class="eyebrow">Sequência</div><div class="v">'+sk+' <small>dia'+(sk===1?"":"s")+'</small></div><small>melhor: '+s.best_streak+'</small></div>'+
    '<div class="panel stat"><div class="eyebrow">Hoje</div><div class="v">'+todaySheets.length+' <small>de '+(isStudyToday?s.sheets_per_day:0)+' folhas</small></div>'+
      (tdPct!=null?'<span class="tag '+(tdPct>=80?'ok':'warn')+'">'+tdPct+'% de acerto de primeira</span>':'<small>'+(isStudyToday?'ainda sem folhas hoje':'hoje é descanso')+'</small>')+'</div></div>';
  var resumo=notices+stats+'<div class="grid"><div class="col"><div class="panel">'+streakHtml+'</div></div>'+
    '<div class="col"><div class="panel rule"><b>Como o aluno avança</b><p class="small-t">Cada dia com '+((PUB&&PUB.normal_acertos)||80)+'% ou mais de acertos de primeira e tempo médio dentro da meta vale 1 carimbo e 1 pacotinho. Dia de ouro vale '+((PUB&&PUB.ouro_carimbos)||2)+' carimbos, e um dia de salto faz o aluno subir direto de nível. Fechar todas as folhas do dia, com ou sem carimbo, vale mais 1 pacotinho. Com '+need+' carimbos ele sobe de nível sozinho. Você vê o aviso no histórico. Para mudar o nível agora, use a aba Programa.</p></div></div></div>';
  var historico='<div class="grid"><div class="col">'+movesHtml+packsHtml+'<div class="panel"><div class="eyebrow gap">Dias sem estudo (últimos 45 dias)</div>'+(miss.length?'<ul class="plain miss">'+miss.join("")+'</ul>':'<p class="muted">Nenhuma falta no período.</p>')+'</div></div>'+
    '<div class="col">'+weakHtml+'<div class="panel" id="slowBox"><div class="eyebrow gap">Contas mais demoradas</div><p class="muted">Carregando…</p></div></div></div>'+
    '<div class="panel"><div class="eyebrow gap">Folhas feitas</div>'+(rows?'<div class="tablewrap"><table><thead><tr><th>Dia</th><th>Nível</th><th>Acertos</th><th>Tempo</th><th>Resultado</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<p class="muted">Nenhuma folha feita ainda.</p>')+'<div id="sheetView"></div></div>';
  var programa='<div class="panel form-narrow"><form id="edForm" class="form" novalidate><div class="eyebrow">Programa de estudos</div>'+programFields(s)+
    '<p class="msg bad" id="fMsg" role="alert"></p><div class="actions"><button class="btn" id="fBtn" type="submit">Salvar programa</button></div></form></div>';
  var acesso='<div class="grid"><div class="col"><div class="panel"><div class="eyebrow gap">Acesso do aluno</div><div class="linkrow"><input id="lnk" readonly value="'+esc(link)+'" aria-label="Link do aluno"><button class="btn small" id="cp">Copiar</button></div>'+
    '<div class="actions gap"><button class="btn ghost small" id="rstPin">Redefinir PIN</button><button class="btn ghost small" id="newLink">Gerar novo link</button></div>'+
    '<p class="muted small-t">Redefinir o PIN desconecta o aluno; ele cria um novo PIN no mesmo link. Gerar novo link invalida o link antigo.</p></div>'+
    '<div class="panel"><div class="eyebrow gap">Adultos com acesso</div><ul class="plain">'+names+'</ul>'+
    (iAmOwner?'<div class="actions gap"><button class="btn ghost small" id="invite">Convidar outro adulto</button></div><div id="inviteOut"></div>':'')+'</div></div>'+
    '<div class="col"><div class="panel" id="frBox"><div class="eyebrow gap">Amigos do aluno</div><p class="muted">Carregando…</p></div><div class="panel" id="trAdBox"><div class="eyebrow gap">Trocas de figurinhas</div><p class="muted">Carregando…</p></div>'+(iAmOwner?'<div class="panel"><div class="eyebrow gap">Zona de risco</div><p class="muted small-t">Apagar o aluno remove todo o histórico, as figurinhas e os pacotinhos. Isso não tem volta.</p><div class="actions gap"><button class="btn danger small" id="del">Apagar aluno e todo o histórico</button></div></div>':'<div class="panel"><p class="muted">Só quem cadastrou o aluno pode apagá-lo.</p></div>')+'</div></div>';
  var head=topbar("Aluno")+'<div class="pagehead"><button type="button" class="link crumb" id="back">'+FC.icon("back")+'Todos os alunos</button></div>'+
    '<div class="pagehead"><h1>'+esc(s.name)+'</h1><span class="lvlchip">Nível '+L.id+'</span></div>';
  FC.render(FC.tabsShell({scope:"pai",head:head,tabs:[
    {id:"resumo",label:"Resumo",icon:"resumo",html:resumo},
    {id:"album",label:"Álbum",icon:"album",html:rewardPanel},
    {id:"historico",label:"Histórico",icon:"history",html:historico},
    {id:"programa",label:"Programa",icon:"program",html:programa},
    {id:"acesso",label:"Acesso",icon:"key",html:acesso}]}));
  FC.bindTabs("pai");
  bindTop();bindProgram();
  $("#back").onclick=dash;
  var lib=$("#liberar");
  if(lib)lib.onclick=async function(){
    lib.disabled=true;
    var r=await sb.from("students").update({teto_anos:Math.min(99,tetoVal+1)}).eq("id",id);
    if(r.error){lib.disabled=false;return FC.toast(FC.err(r.error),true)}
    FC.toast("Limite liberado: mais 1 ano à frente.");detail(id);
  };
  var anoOk=$("#anoOk");
  if(anoOk)anoOk.onclick=async function(){
    anoOk.disabled=true;
    var r=await sb.from("students").update({ano_escolar:anoNow}).eq("id",id);
    if(r.error){anoOk.disabled=false;return FC.toast(FC.err(r.error),true)}
    FC.toast("Ano escolar confirmado.");detail(id);
  };
  loadSlow(id);loadFriends(id);loadTrades(id);
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
    var patch=r.v;if(patch.level_idx!==s.level_idx){patch.stamps=0;patch.reached_by_jump=false;patch.dry_days=0}
    $("#fBtn").disabled=true;
    var res=await sb.from("students").update(patch).eq("id",id);
    if(res.error){$("#fBtn").disabled=false;$("#fMsg").textContent=FC.err(res.error);return}
    FC.toast("Programa salvo.");detail(id);
  };
  $$("[data-sheet]").forEach(function(b){b.onclick=function(){openSheet(b.getAttribute("data-sheet"),b)}});
}

/* Contas em que o aluno mais demora, nas últimas 20 folhas: média do tempo na conta contra o tempo esperado do nível. */
/* Amigos do aluno: o adulto vê com quem ele é amigo e pode desfazer qualquer amizade. */
async function loadFriends(id){
  var box=$("#frBox");if(!box)return;
  var r=await sb.rpc("adult_friends",{p_student:id});
  if(r.error){box.innerHTML='<div class="eyebrow gap">Amigos do aluno</div><p class="muted">Não deu para carregar.</p>';return}
  var d=r.data,rows=d.friends.map(function(x){
    var st=x.status==="aceita"?"amigo":(x.sent?"convite enviado, esperando resposta":"convidou o aluno, esperando resposta");
    return '<li class="fr-row"><span class="grow"><b>'+esc(x.name)+'</b> <span class="muted small-t">· '+st+'</span></span><button class="btn ghost small" data-unf="'+x.id+'">'+(x.status==="aceita"?"Desfazer":"Remover")+'</button></li>'}).join("");
  box.innerHTML='<div class="eyebrow gap">Amigos do aluno</div>'+(rows?'<ul class="plain">'+rows+'</ul>':'<p class="muted">Ainda sem amigos.</p>')+
    '<p class="muted small-t gap">Código de amigo do aluno: <b class="code">'+esc(FC.fmtCode(d.code))+'</b>. Os amigos veem só o nível, os carimbos e as figurinhas dele.</p>';
  $$("[data-unf]",box).forEach(function(b){FC.confirmClick(b,"Toque de novo para confirmar",async function(){
    var x=await sb.rpc("adult_friend_remove",{p_student:id,p_id:b.getAttribute("data-unf")});
    if(x.error)return FC.toast(FC.err(x.error),true);
    FC.toast("Pronto.");loadFriends(id);
  })});
}
/* Trocas do aluno: só leitura. Mostra as feitas, as recusadas e as que estão esperando resposta. */
async function loadTrades(id){
  var box=$("#trAdBox");if(!box)return;
  var r=await sb.rpc("adult_trades",{p_student:id});
  if(r.error){box.innerHTML='<div class="eyebrow gap">Trocas de figurinhas</div><p class="muted">Não deu para carregar.</p>';return}
  var nm=function(t,sl){return esc(FC.stickerInfo(t,sl).name)+' <span class="muted small-t">('+esc(FC.theme(t).name)+')</span>'};
  var rows=r.data.map(function(x){
    var gave=x.sent?[x.give_theme,x.give_slot]:[x.want_theme,x.want_slot],got=x.sent?[x.want_theme,x.want_slot]:[x.give_theme,x.give_slot];
    var st=x.status==="aceita"?"trocou":x.status==="recusada"?(x.sent?"pedido recusado por":"recusou o pedido de"):(x.sent?"pedido esperando resposta de":"pedido recebido de");
    return '<li class="fr-row"><span class="grow"><b>'+FC.dm(String(x.at).slice(0,10))+'</b> · '+st+' <b>'+esc(x.friend)+'</b><br><span class="small-t">deu '+nm(gave[0],gave[1])+' e '+(x.status==="aceita"?"recebeu ":"queria ")+nm(got[0],got[1])+'</span></span></li>'}).join("");
  box.innerHTML='<div class="eyebrow gap">Trocas de figurinhas</div>'+(rows?'<ul class="plain">'+rows+'</ul>':'<p class="muted">Ainda sem trocas.</p>')+'<p class="muted small-t gap">Últimas 50. Só para consulta.</p>';
}
async function loadSlow(id){
  var box=$("#slowBox");if(!box)return;
  var r=await sb.from("sheets").select("level_idx,problems,answers").eq("student_id",id).eq("status","done").order("finished_at",{ascending:false}).limit(20);
  if(r.error){box.innerHTML='<div class="eyebrow gap">Contas mais demoradas</div><p class="msg bad">'+esc(FC.err(r.error))+'</p>';return}
  var g={};
  r.data.forEach(function(sh){
    var exp=FC.LEVELS[sh.level_idx].target/10*1000;
    (sh.answers||[]).forEach(function(a,i){
      var p=sh.problems[i];if(!p||!a||!(a.ms>0))return;
      var k=sh.level_idx+"|"+p.pre+"|"+(p.post||"")+"|"+(p.extra?JSON.stringify(p.extra):""),x=g[k]||(g[k]={p:p,exp:exp,sum:0,n:0,lv:sh.level_idx});
      x.sum+=a.ms;x.n++;
    });
  });
  var rows=Object.keys(g).map(function(k){var x=g[k];x.avg=x.sum/x.n;x.ratio=x.avg/x.exp;return x})
    .filter(function(x){return x.ratio>1}).sort(function(a,b){return b.ratio-a.ratio}).slice(0,8);
  var any=Object.keys(g).length;
  box.innerHTML='<div class="eyebrow gap">Contas mais demoradas</div>'+(rows.length?
    '<ul class="plain miss">'+rows.map(function(x){
      return '<li><span class="q">'+esc(x.p.pre)+(x.p.extra&&x.p.extra.fig?' <span class="muted small-t">(com figura)</span>':'')+' <b>'+esc(FC.answerText(x.p,x.p.a))+'</b>'+esc(x.p.post||"")+'</span> <span class="muted small-t">nível '+esc(FC.lv(x.lv))+' · média '+FC.fmtSec(x.avg)+' (esperado '+FC.fmtSec(x.exp)+')'+(x.n>1?' · '+x.n+' vezes':'')+'</span></li>'}).join("")+'</ul>':
    '<p class="muted">'+(any?'Nenhuma conta ficou acima do tempo esperado nas últimas folhas.':'Ainda não há tempos por conta. Eles aparecem nas próximas folhas.')+'</p>')+
    '<p class="muted small-t gap">O tempo de cada conta conta enquanto a caixa de resposta dela está selecionada, só na primeira tentativa.</p>';
}

async function openSheet(sid,btn){
  var box=$("#sheetView");box.innerHTML='<p class="loading">Carregando folha…</p>';
  var r=await sb.from("sheets").select("problems,answers,level_idx,study_day,first_ok,secs").eq("id",sid).single();
  if(r.error){box.innerHTML='<p class="msg bad">'+esc(FC.err(r.error))+'</p>';return}
  var sh=r.data,ans=sh.answers||[];
  var exp=FC.LEVELS[sh.level_idx].target/10*1000,msAll=ans.map(function(a){return a&&a.ms>0?a.ms:0}).filter(function(x){return x>0});
  var avg=msAll.length?msAll.reduce(function(a,b){return a+b},0)/msAll.length:0;
  var li=sh.problems.map(function(p,i){
    var a=ans[i]||{},ok=a.ok,ms=a.ms||0;
    var rich=!!p.extra;
    return '<li class="'+(ok?"ok":"bad")+'">'+(rich?FC.itemStatic(p,a.v):'<span class="q">'+esc(p.pre)+' '+esc(a.v===""||a.v==null?"–":a.v)+(p.post?" "+esc(p.post):"")+'</span>')+' '+
      (ok?'<span class="tag ok">certa de primeira</span>':'<span class="tag bad">errou · resposta certa: '+esc(FC.answerText(p,p.a))+(rich&&a.v!==""&&a.v!=null?' · marcou: '+esc(FC.answerText(p,a.v)):'')+'</span>')+
      (ms>0?' <span class="muted small-t">'+FC.fmtSec(ms)+'</span>':'')+(ms>exp*1.5?' <span class="tag warn">lenta</span>':'')+
      (a.tries>1?' <span class="muted small-t">('+a.tries+' tentativas)</span>':'')+'</li>';
  }).join("");
  box.innerHTML='<div class="sheetview"><h3>Folha de '+FC.dayLabel(sh.study_day)+' · nível '+esc(FC.lv(sh.level_idx))+'</h3>'+
    '<p class="muted">'+sh.first_ok+' acertos de primeira em '+FC.fmtTime(sh.secs)+(avg?' · tempo médio por conta '+FC.fmtSec(avg)+' (esperado até '+FC.fmtSec(exp)+')':'')+'</p><ol class="sv">'+li+'</ol></div>';
  box.scrollIntoView({behavior:"smooth",block:"nearest"});
}
})();
