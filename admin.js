/* Área de administração (/adm). Sem link em nenhuma página: só quem digita o endereço chega aqui.
   A trava de verdade é no banco (função admin_overview confere o e-mail da conta); esta tela só mostra o que o banco liberar. */
(function(){
"use strict";
var FC=window.FC,$=FC.$,$$=FC.$$,esc=FC.esc,sb=FC.sb;
function catalogo(){return (FC.EX||[]).concat(FC.G1||[],FC.G2||[],FC.G3||[])}
function porId(id){return catalogo().filter(function(e){return e.id===id})[0]}
var DATA=null,SET=null,SETERR=null,LEV=null,TAB="alunos",FILTER="";

function dt(s){if(!s)return "—";var d=new Date(s);return FC.pad(d.getDate())+"/"+FC.pad(d.getMonth()+1)+"/"+d.getFullYear()+" "+FC.pad(d.getHours())+":"+FC.pad(d.getMinutes())}
function dtDay(s){return s?dt(s).slice(0,10):"—"}
function bar(email){
  return '<header class="appbar"><img src="icons/icon-192.png" alt=""><div class="grow"><b>Folhinha VIP</b><small>Administração</small></div>'+
    (email?'<div class="who"><span class="who-name">'+esc(email)+'</span><button class="btn ghost small" id="logout">Sair</button></div>':'')+'</header>';
}
function bindBar(){var b=$("#logout");if(b)b.onclick=async function(){await sb.auth.signOut();login()}}

/* Endereços da administração: #/ (alunos), #/contas, #/parametros, #/exercicios. */
var TABS_ADM=["alunos","contas","parametros","exercicios"],ADMU=null;
function admPath(tab){return tab==="alunos"?"/":"/"+tab}
function admRoute(path){
  var t=path==="/"?"alunos":path.slice(1);
  TAB=TABS_ADM.indexOf(t)>=0?t:"alunos";
  if(ADMU&&DATA)show(ADMU);
}
FC.adminApp=async function(){
  FC.nav.handler=admRoute;
  admRoute(FC.nav.path());
  if(FC.nav.path()!=="/")FC.nav.seed("/");
  document.title="Administração · Folhinha VIP";
  var m=document.createElement("meta");m.name="robots";m.content="noindex,nofollow";document.head.appendChild(m);
  var r=await sb.auth.getSession();
  if(!r.data.session)return login();
  load(r.data.session.user);
};

function login(msg){
  FC.nav.reset();
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
  ADMU=user;
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
  var lr=await sb.rpc("admin_levels");   /* só existe depois da migração da etapa 4a */
  LEV=lr.error?null:lr.data;
  show(user);
}

/* ---------- pré-visualização dos exercícios novos (para revisão pedagógica) ---------- */
function exCard(e){
  var a=e.gen(),b=e.gen(),t=0;
  while(FC.itemKey(b)===FC.itemKey(a)&&t++<40)b=e.gen();   /* dois exemplos diferentes (quando o gerador tem variedade) */
  return '<div class="eyebrow">'+esc(e.nome)+'</div><div class="small-t muted">'+esc(e.hab.join(" · "))+'</div>'+FC.itemStatic(a)+FC.itemStatic(b)+
    '<button class="btn ghost small" data-again="'+esc(e.id)+'">Outros exemplos</button>';
}
function exHtml(){
  if(!FC.EX)return '<p class="msg bad">A biblioteca de exercícios não carregou.</p>';
  return '<p class="muted small-t">Cada cartão mostra 2 exemplos sorteados do gerador, com a resposta certa. Toque em “Outros exemplos” para sortear de novo. As habilidades são as da BNCC que o exercício treina.</p>'+
    '<div class="adm-extools"><label class="field">Exemplos por gerador<select id="exN"><option value="3">3</option><option value="5" selected>5</option><option value="10">10</option></select></label>'+
      '<button class="btn small" id="exCopy" type="button">Sortear e copiar os dados</button></div>'+
    '<p class="muted small-t">Copia, em texto, os exercícios sorteados (pergunta, figura, opções e resposta certa), para colar numa conversa e conferir.</p><div id="exOut"></div>'+
    '<div class="adm-ex">'+catalogo().map(function(e){return '<section class="panel adm-excard" data-ex="'+esc(e.id)+'">'+exCard(e)+'</section>'}).join("")+'</div>';
}
/* Dados dos exercícios em texto (JSON, um exercício por linha): perguntas, figuras, opções e resposta certa. */
function exDump(n){
  var out=[];
  catalogo().forEach(function(e){
    var itens=[],seen={},t=0;
    while(itens.length<n&&t++<n*60){
      var it=e.gen(),k=FC.itemKey(it);if(seen[k])continue;seen[k]=1;
      var o={pre:it.pre};if(it.post)o.post=it.post;o.a=it.a;
      if(it.extra&&it.extra.opts)o.certa=FC.answerText(it,it.a);
      if(it.extra)o.extra=it.extra;
      itens.push("  "+JSON.stringify(o));
    }
    out.push('{"gerador":'+JSON.stringify(e.id)+',"nome":'+JSON.stringify(e.nome)+',"habilidades":'+JSON.stringify(e.hab)+',"itens":[\n'+itens.join(",\n")+'\n]}');
  });
  return "[\n"+out.join(",\n")+"\n]";
}
function bindEx(){
  var cp=$("#exCopy");
  if(cp)cp.onclick=function(){
    var n=Number($("#exN").value)||5,txt=exDump(n),box=$("#exOut");
    function manual(){
      box.innerHTML='<textarea id="exTxt" class="adm-dump" readonly rows="8" aria-label="Dados dos exercícios"></textarea>';
      var ta=$("#exTxt");ta.value=txt;ta.focus();ta.select();
      FC.toast("Não consegui copiar sozinho: o texto está selecionado, é só copiar (Ctrl+C).",true);
    }
    var msg="Copiado: "+catalogo().length+" geradores, até "+n+" exemplos de cada ("+Math.round(txt.length/1024)+" KB).";
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){box.innerHTML="";FC.toast(msg)},manual);
    else manual();
  };
  $$("[data-again]").forEach(function(b){b.onclick=function(){
    var e=porId(b.getAttribute("data-again"));if(!e)return;
    b.closest(".adm-excard").innerHTML=exCard(e);bindEx();
  }});
}

/* ---------- parâmetros do avanço (valem para todos os alunos) ---------- */
var DEFAULTS={stamps_needed:5,normal_acertos:80,ouro_acertos:95,ouro_tempo:80,ouro_carimbos:2,salto_acertos:98,salto_tempo:60,
  salto_por_semana:2,dias_sem_carimbo_voltar:2,bloqueio_salto_dias:7,teto_anos_padrao:1,virada_mes:1,virada_dia:1,limite_mesa:2,pausas_max:2,modo_folha:1};
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
  {t:"Pausa na folha",d:"A criança pode pausar a folha (banheiro, água). Durante a pausa o relógio para e as contas ficam escondidas, sem limite de tempo; o que se limita é a quantidade de pausas por folha (0 desliga a pausa). Pausa de menos de 10 segundos, como a tela do celular apagando, não conta.",f:[
    ["pausas_max","Pausas por folha",0,10,"pausas"]]},
  {t:"Modo da folha",d:"1 = uma conta por vez na tela (o tempo de cada conta é o tempo em que ela está visível, bem mais confiável); 0 = todas as contas na tela, como era antes. Cada folha guarda o modo em que foi feita, para comparar acertos e tempos.",f:[
    ["modo_folha","Modo da folha (0 ou 1)",0,1,""]]},
  {t:"Álbuns de figurinhas",d:"Os pais liberam quantos álbuns quiserem. A criança mantém alguns na mesa (são os álbuns de onde ela escolhe a figurinha ao abrir um pacotinho) e os outros ficam na gaveta.",f:[
    ["limite_mesa","Álbuns na mesa ao mesmo tempo",1,5,"álbuns"]]},
  {t:"Ano escolar",d:"O ano de cada aluno é calculado a partir do ano informado pelos pais; a virada não muda o nível do aluno.",f:[
    ["teto_anos_padrao","Anos à frente do ano escolar que o aluno pode alcançar (padrão)",0,9,"anos"],
    ["virada_mes","Virada do ano escolar: mês",1,12,"mês"],
    ["virada_dia","Virada do ano escolar: dia",1,28,"dia"]]}];
function paramsHtml(){
  if(!SET)return '<p class="msg bad">'+esc(SETERR||"Não deu para carregar os parâmetros.")+'</p>';
  return '<form id="parForm" class="form" novalidate>'+GROUPS.map(function(g){
    return '<fieldset class="adm-group"><legend>'+esc(g.t)+'</legend><p class="muted small-t">'+esc(g.d)+'</p><div class="adm-params">'+g.f.map(function(f){
      return '<label class="field">'+esc(f[1])+'<span class="adm-in"><input type="number" inputmode="numeric" step="1" min="'+f[2]+'" max="'+f[3]+'" name="'+f[0]+'" value="'+esc(SET[f[0]]!=null?SET[f[0]]:DEFAULTS[f[0]])+'"><em>'+esc(f[4])+'</em></span></label>'}).join("")+'</div></fieldset>'}).join("")+
    '<p class="msg" id="parMsg" role="alert"></p><div class="actions"><button class="btn" type="submit" id="parSave">Salvar parâmetros</button>'+
    '<button class="btn ghost" type="button" id="parDef">Voltar aos valores iniciais</button></div>'+
    '<p class="muted small-t">As mudanças valem para todos os alunos, a partir do próximo dia de estudo.</p></form>'+levelsHtml();
}
/* Carimbos por nível: vazio = o padrão geral. Níveis mais difíceis podem pedir mais carimbos; os fáceis, menos. */
function levelsHtml(){
  if(!LEV)return "";
  var rows=LEV.map(function(l){
    var L=FC.LEVELS[l.idx];
    return '<tr><td>'+esc(L?L.id:l.code)+'</td><td>'+esc(L?L.name:"")+'</td><td>'+esc(l.ano)+'º</td><td><input class="adm-lv" type="number" inputmode="numeric" step="1" min="1" max="10" data-idx="'+l.idx+'" data-was="'+(l.stamps_needed==null?"":l.stamps_needed)+'" value="'+(l.stamps_needed==null?"":l.stamps_needed)+'" placeholder="'+esc(SET?SET.stamps_needed:5)+'" aria-label="Carimbos do nível '+esc(L?L.id:l.code)+'"></td></tr>'}).join("");
  return '<fieldset class="adm-group"><legend>Carimbos por nível</legend><p class="muted small-t">Quantos carimbos concluem cada nível. Deixe em branco para usar o padrão geral ('+esc(SET?SET.stamps_needed:5)+'). Vale de 1 a 10.</p>'+
    '<div class="adm-wrap"><table class="adm-table"><thead><tr><th>Nível</th><th>Nome</th><th>Ano</th><th>Carimbos</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<p class="msg" id="lvMsg" role="alert"></p><div class="actions"><button class="btn" type="button" id="lvSave">Salvar carimbos dos níveis</button></div></fieldset>';
}
function bindLevels(){
  var b=$("#lvSave");if(!b)return;
  b.onclick=async function(){
    var msg=$("#lvMsg"),ch=[],bad=null;
    $$(".adm-lv").forEach(function(i){
      var v=i.value.trim(),was=i.getAttribute("data-was");
      if(v===was)return;
      if(v!==""&&(!/^\d+$/.test(v)||Number(v)<1||Number(v)>10))bad=bad||"Os carimbos de um nível precisam ser um número inteiro de 1 a 10, ou ficar em branco.";
      ch.push([Number(i.getAttribute("data-idx")),v===""?null:Number(v)])});
    if(bad){msg.textContent=bad;msg.className="msg bad";return}
    if(!ch.length){msg.textContent="Nada mudou.";msg.className="msg";return}
    b.disabled=true;
    for(var k=0;k<ch.length;k++){
      var r=await sb.rpc("admin_set_level_stamps",{p_idx:ch[k][0],p_stamps:ch[k][1]});
      if(r.error){b.disabled=false;msg.textContent=parErr(r.error);msg.className="msg bad";return}
      LEV=r.data;
    }
    b.disabled=false;
    $$(".adm-lv").forEach(function(i){i.setAttribute("data-was",i.value.trim())});
    msg.textContent="Carimbos dos níveis salvos.";msg.className="msg good";FC.toast("Carimbos dos níveis salvos.");
  };
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
  FC.nav.at(admPath(TAB));
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
  bindParams(user);bindLevels();bindEx();
  if($("#aFind"))$("#aFind").oninput=function(){FILTER=this.value.trim().toLowerCase();$("#admBody").innerHTML=TAB==="alunos"?studentsTable():accountsTable()};
}
})();
