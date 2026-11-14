/* Área de administração (/adm). Sem link em nenhuma página: só quem digita o endereço chega aqui.
   A trava de verdade é no banco (função admin_overview confere o e-mail da conta); esta tela só mostra o que o banco liberar. */
(function(){
"use strict";
var FC=window.FC,$=FC.$,$$=FC.$$,esc=FC.esc,sb=FC.sb;
var DATA=null,TAB="alunos",FILTER="";

function dt(s){if(!s)return "—";var d=new Date(s);return FC.pad(d.getDate())+"/"+FC.pad(d.getMonth()+1)+"/"+d.getFullYear()+" "+FC.pad(d.getHours())+":"+FC.pad(d.getMinutes())}
function dtDay(s){return s?dt(s).slice(0,10):"—"}
function bar(email){
  return '<header class="appbar"><img src="icons/icon-192.png" alt=""><div class="grow"><b>Folhinha VIP</b><small>Administração</small></div>'+
    (email?'<div class="who"><span class="who-name">'+esc(email)+'</span><button class="btn ghost small" id="logout">Sair</button></div>':'')+'</header>';
}
function bindBar(){var b=$("#logout");if(b)b.onclick=async function(){await sb.auth.signOut();login()}}

FC.adminApp=async function(){
  document.title="Administração · Folhinha VIP";
  var m=document.createElement("meta");m.name="robots";m.content="noindex,nofollow";document.head.appendChild(m);
  var r=await sb.auth.getSession();
  if(!r.data.session)return login();
  load(r.data.session.user);
};

function login(msg){
  FC.render(bar()+'<div class="panel authbox"><form id="admForm" class="form" novalidate><h1>Administração</h1>'+
    '<label class="field">E-mail<input id="aEmail" type="email" autocomplete="email" required></label>'+
    '<label class="field">Senha<input id="aPass" type="password" autocomplete="current-password" required></label>'+
    '<p class="msg bad" id="aMsg" role="alert">'+esc(msg||"")+'</p><button class="btn" type="submit" id="aBtn">Entrar</button></form></div>');
  $("#admForm").onsubmit=async function(e){
    e.preventDefault();
    var email=$("#aEmail").value.trim(),pass=$("#aPass").value;
    if(!email||!pass){$("#aMsg").textContent="Preencha e-mail e senha.";return}
    $("#aBtn").disabled=true;
    var l=await sb.auth.signInWithPassword({email:email,password:pass});
    if(l.error){$("#aBtn").disabled=false;$("#aMsg").textContent=FC.err(l.error);return}
    load(l.data.user);
  };
}

async function load(user){
  FC.render(bar(user.email)+'<p class="loading">Carregando…</p>');bindBar();
  var r=await sb.rpc("admin_overview");
  if(r.error){
    var denied=String(r.error.message||"").indexOf("sem_permissao")>=0||r.error.code==="42501";
    FC.render(bar(user.email)+'<div class="panel center"><h1>'+(denied?"Acesso negado":"Não deu para carregar")+'</h1><p class="muted">'+
      (denied?"Esta conta não é de administrador.":esc(FC.err(r.error)))+'</p>'+(denied?"":'<p><button class="btn" id="retry">Tentar de novo</button></p>')+'</div>');
    bindBar();var rt=$("#retry");if(rt)rt.onclick=function(){load(user)};return;
  }
  DATA=r.data;show(user);
}

function stat(n,label){return '<div class="adm-stat"><b>'+esc(n)+'</b><span>'+esc(label)+'</span></div>'}
function match(txt){return !FILTER||txt.toLowerCase().indexOf(FILTER)>=0}

function table(head,rows){
  return '<div class="adm-wrap"><table class="adm-table"><thead><tr>'+head.map(function(h){return '<th>'+esc(h)+'</th>'}).join("")+'</tr></thead><tbody>'+
    (rows.length?rows.join(""):'<tr><td colspan="'+head.length+'" class="muted">Nada encontrado.</td></tr>')+'</tbody></table></div>';
}

function studentsTable(){
  var rows=DATA.students.filter(function(s){return match(s.name+" "+s.owners.join(" "))}).map(function(s){
    var L=FC.LEVELS[s.level_idx];
    return '<tr><td><b>'+esc(s.name)+'</b></td><td>'+(L?"Nível "+L.id:"?")+'</td><td>'+s.sheets_done+'</td><td>'+s.stamps+'/5</td><td>'+s.streak+'</td>'+
      '<td>'+esc((s.sticker_themes||[]).join(", "))+'</td><td>'+esc(s.owners.join(", "))+'</td><td>'+dt(s.last_study)+'</td><td>'+dtDay(s.created_at)+'</td></tr>'});
  return table(["Aluno","Nível","Folhas feitas","Carimbos","Sequência","Álbuns","Responsáveis","Último estudo","Criado em"],rows);
}
function accountsTable(){
  var rows=DATA.accounts.filter(function(a){return match((a.email||"")+" "+(a.name||""))}).map(function(a){
    return '<tr><td><b>'+esc(a.email||"")+'</b></td><td>'+esc(a.name||"—")+'</td><td>'+esc(a.role||"—")+'</td><td>'+a.students+'</td><td>'+dt(a.last_sign_in_at)+'</td><td>'+dtDay(a.created_at)+'</td></tr>'});
  return table(["E-mail","Nome","Perfil","Alunos","Último acesso","Criada em"],rows);
}

function show(user){
  var t=DATA.totals;
  FC.render(bar(user.email)+'<div class="section-head"><h1>Visão geral</h1><div class="actions"><button class="btn ghost small" id="reload">Atualizar</button></div></div>'+
    '<div class="adm-stats">'+stat(t.accounts,"contas de adultos")+stat(t.students,"alunos")+stat(t.sheets_done,"folhas feitas")+stat(t.sheets_7d,"folhas nos últimos 7 dias")+
      stat(t.active_7d,"alunos ativos em 7 dias")+stat(t.friendships,"amizades")+'</div>'+
    '<div class="panel"><div class="tabs"><button class="tab'+(TAB==="alunos"?" on":"")+'" data-t="alunos">Alunos ('+DATA.students.length+')</button>'+
      '<button class="tab'+(TAB==="contas"?" on":"")+'" data-t="contas">Contas ('+DATA.accounts.length+')</button></div>'+
    '<label class="field">Buscar<input id="aFind" type="search" autocomplete="off" value="'+esc(FILTER)+'" placeholder="nome ou e-mail"></label>'+
    '<div id="admBody">'+(TAB==="alunos"?studentsTable():accountsTable())+'</div></div>');
  bindBar();
  $("#reload").onclick=function(){load(user)};
  $$(".tab").forEach(function(b){b.onclick=function(){TAB=b.getAttribute("data-t");show(user)}});
  $("#aFind").oninput=function(){FILTER=this.value.trim().toLowerCase();$("#admBody").innerHTML=TAB==="alunos"?studentsTable():accountsTable()};
}
})();
