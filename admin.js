/* Área de administração (/adm). Sem link em nenhuma página: só quem digita o endereço chega aqui.
   A trava de verdade é no banco (função admin_overview confere o e-mail da conta); esta tela só mostra o que o banco liberar. */
(function(){
"use strict";
var FC=window.FC,$=FC.$,$$=FC.$$,esc=FC.esc,sb=FC.sb;
var DATA=null,SET=null,SETERR=null,TAB="alunos",FILTER="";

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
  DATA=r.data;
  var sr=await sb.rpc("admin_get_settings");
  SET=sr.error?null:sr.data;SETERR=sr.error?FC.err(sr.error):null;
  show(user);
}

/* ---------- pré-visualização dos exercícios novos (para revisão pedagógica) ---------- */
function exCard(e){
  return '<div class="eyebrow">'+esc(e.nome)+'</div><div class="small-t muted">'+esc(e.hab.join(" · "))+'</div>'+FC.itemStatic(e.gen())+FC.itemStatic(e.gen())+
    '<button class="btn ghost small" data-again="'+esc(e.id)+'">Outros exemplos</button>';
}
function exHtml(){
  if(!FC.EX)return '<p class="msg bad">A biblioteca de exercícios não carregou.</p>';
  return '<p class="muted small-t">Cada cartão mostra 2 exemplos sorteados do gerador, com a resposta certa. Toque em “Outros exemplos” para sortear de novo. As habilidades são as da BNCC que o exercício treina.</p>'+
    '<div class="adm-ex">'+FC.EX.map(function(e){return '<section class="panel adm-excard" data-ex="'+esc(e.id)+'">'+exCard(e)+'</section>'}).join("")+'</div>';
}
function bindEx(){
  $$("[data-again]").forEach(function(b){b.onclick=function(){
    var e=FC.EXBY[b.getAttribute("data-again")];if(!e)return;
    b.closest(".adm-excard").innerHTML=exCard(e);bindEx();
  }});
}

/* ---------- parâmetros do avanço (valem para todos os alunos) ---------- */
var DEFAULTS={stamps_needed:5,normal_acertos:80,ouro_acertos:95,ouro_tempo:80,ouro_carimbos:2,salto_acertos:98,salto_tempo:60,
  salto_por_semana:2,dias_sem_carimbo_voltar:2,bloqueio_salto_dias:7,teto_anos_padrao:1,virada_mes:1,virada_dia:1};
var GROUPS=[
  {t:"Carimbos e subida de nível",d:"O dia fecha quando o aluno faz a cota de folhas. Cumprindo o dia normal, ganha 1 carimbo.",f:[
    ["stamps_needed","Carimbos para subir de nível",1,10,"carimbos"],
    ["normal_acertos","Dia normal: acertos de primeira",50,100,"%"]]},
  {t:"Dia de ouro",d:"Desempenho melhor que o normal vale mais carimbos.",f:[
    ["ouro_acertos","Acertos de primeira",50,100,"%"],
    ["ouro_tempo","Tempo médio por folha",10,100,"% da meta do nível"],
    ["ouro_carimbos","Carimbos ganhos",1,10,"carimbos"]]},
  {t:"Dia de salto",d:"No 1º dia de um nível, desempenho excelente faz o aluno subir direto, sem esperar os carimbos.",f:[
    ["salto_acertos","Acertos de primeira",50,100,"%"],
    ["salto_tempo","Tempo médio por folha",10,100,"% da meta do nível"],
    ["salto_por_semana","Máximo de saltos por semana (0 desliga o salto)",0,14,"saltos"]]},
  {t:"Oferta de voltar",d:"Depois de um salto, se o aluno não ganha carimbo, o app oferece voltar ao nível anterior. Nunca é automático.",f:[
    ["dias_sem_carimbo_voltar","Dias de estudo sem carimbo para oferecer",1,10,"dias"],
    ["bloqueio_salto_dias","Dias sem poder saltar depois de voltar",0,60,"dias"]]},
  {t:"Ano escolar",d:"O ano de cada aluno é calculado a partir do ano informado pelos pais; a virada não muda o nível do aluno.",f:[
    ["teto_anos_padrao","Anos à frente do ano escolar que o aluno pode alcançar (padrão)",0,9,"anos"],
    ["virada_mes","Virada do ano escolar: mês",1,12,"mês"],
    ["virada_dia","Virada do ano escolar: dia",1,28,"dia"]]}];
function paramsHtml(){
  if(!SET)return '<p class="msg bad">'+esc(SETERR||"Não deu para carregar os parâmetros.")+'</p>';
  return '<form id="parForm" class="form" novalidate>'+GROUPS.map(function(g){
    return '<fieldset class="adm-group"><legend>'+esc(g.t)+'</legend><p class="muted small-t">'+esc(g.d)+'</p><div class="adm-params">'+g.f.map(function(f){
      return '<label class="field">'+esc(f[1])+'<span class="adm-in"><input type="number" inputmode="numeric" step="1" min="'+f[2]+'" max="'+f[3]+'" name="'+f[0]+'" value="'+esc(SET[f[0]])+'"><em>'+esc(f[4])+'</em></span></label>'}).join("")+'</div></fieldset>'}).join("")+
    '<p class="msg" id="parMsg" role="alert"></p><div class="actions"><button class="btn" type="submit" id="parSave">Salvar parâmetros</button>'+
    '<button class="btn ghost" type="button" id="parDef">Voltar aos valores iniciais</button></div>'+
    '<p class="muted small-t">As mudanças valem para todos os alunos, a partir do próximo dia de estudo.</p></form>';
}
function parErr(e){
  var m=String(e&&e.message||"");
  if(m.indexOf("limiares_incoerentes")>=0)return "Os limiares não fazem sentido: o salto precisa exigir mais acertos que o ouro, o ouro mais que o dia normal, e o tempo do salto deve ser menor que o do ouro.";
  if(m.indexOf("valor_invalido")>=0)return "Há um valor fora do limite permitido.";
  if(m.indexOf("sem_permissao")>=0)return "Esta conta não é de administrador.";
  return FC.err(e);
}
function bindParams(user){
  var f=$("#parForm");if(!f)return;
  function fill(o){Object.keys(o).forEach(function(k){var i=f.elements[k];if(i)i.value=o[k]})}
  $("#parDef").onclick=function(){fill(DEFAULTS);$("#parMsg").textContent="Valores iniciais carregados. Toque em Salvar para aplicar.";$("#parMsg").className="msg"};
  f.onsubmit=async function(e){
    e.preventDefault();
    var out={},bad=null;
    GROUPS.forEach(function(g){g.f.forEach(function(x){
      var i=f.elements[x[0]],v=i.value.trim();
      if(v===""||!/^-?\d+$/.test(v)||Number(v)<x[2]||Number(v)>x[3])bad=bad||("“"+x[1]+"” precisa ser um número inteiro de "+x[2]+" a "+x[3]+".");
      out[x[0]]=Number(v)})});
    var msg=$("#parMsg");
    if(bad){msg.textContent=bad;msg.className="msg bad";return}
    $("#parSave").disabled=true;
    var r=await sb.rpc("admin_set_settings",{p:out});
    $("#parSave").disabled=false;
    if(r.error){msg.textContent=parErr(r.error);msg.className="msg bad";return}
    SET=r.data;msg.textContent="Parâmetros salvos.";msg.className="msg good";FC.toast("Parâmetros salvos.");
  };
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
    return '<tr><td><b>'+esc(s.name)+'</b></td><td>'+(L?"Nível "+L.id:"?")+'</td><td>'+s.sheets_done+'</td><td>'+s.stamps+'/'+(SET?SET.stamps_needed:5)+'</td><td>'+s.streak+'</td>'+
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
      '<button class="tab'+(TAB==="contas"?" on":"")+'" data-t="contas">Contas ('+DATA.accounts.length+')</button>'+
      '<button class="tab'+(TAB==="parametros"?" on":"")+'" data-t="parametros">Parâmetros</button>'+
      '<button class="tab'+(TAB==="exercicios"?" on":"")+'" data-t="exercicios">Exercícios</button></div>'+
    (TAB==="parametros"?paramsHtml():TAB==="exercicios"?exHtml():
    '<label class="field">Buscar<input id="aFind" type="search" autocomplete="off" value="'+esc(FILTER)+'" placeholder="nome ou e-mail"></label>'+
    '<div id="admBody">'+(TAB==="alunos"?studentsTable():accountsTable())+'</div>')+'</div>');
  bindBar();
  $("#reload").onclick=function(){load(user)};
  $$(".tab").forEach(function(b){b.onclick=function(){TAB=b.getAttribute("data-t");show(user)}});
  bindParams(user);bindEx();
  if($("#aFind"))$("#aFind").oninput=function(){FILTER=this.value.trim().toLowerCase();$("#admBody").innerHTML=TAB==="alunos"?studentsTable():accountsTable()};
}
})();
