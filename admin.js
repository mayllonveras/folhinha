/* Área de administração (/adm). Sem link em nenhuma página: só quem digita o endereço chega aqui.
   A trava de verdade é no banco (função admin_overview confere o e-mail da conta); esta tela só mostra o que o banco liberar. */
(function(){
"use strict";
var FC=window.FC,$=FC.$,$$=FC.$$,esc=FC.esc,sb=FC.sb;
function catalogo(){return (FC.EX||[]).concat(FC.G1||[],FC.G2||[],FC.G3||[],FC.G4||[],FC.G5||[])}
function porId(id){return catalogo().filter(function(e){return e.id===id})[0]}
var DATA=null,ADMS=[],SET=null,SETERR=null,LEV=null,CUP=null,CUPEDIT=null,TAB="alunos",FILTER="";

function dt(s){if(!s)return "—";var d=new Date(s);return FC.pad(d.getDate())+"/"+FC.pad(d.getMonth()+1)+"/"+d.getFullYear()+" "+FC.pad(d.getHours())+":"+FC.pad(d.getMinutes())}
function dtDay(s){return s?dt(s).slice(0,10):"—"}
function bar(email){
  return '<header class="appbar"><img src="icons/icon-192.png" alt=""><div class="grow"><b>Folhinha VIP</b><small>Administração</small></div>'+
    (email?'<div class="who"><span class="who-name">'+esc(email)+'</span><button class="btn ghost small" id="logout">Sair</button></div>':'')+'</header>';
}
function bindBar(){var b=$("#logout");if(b)b.onclick=async function(){await sb.auth.signOut();login()}}

/* Endereços da administração: #/ (alunos), #/contas, #/cupons, #/parametros, #/exercicios, #/folhas. */
var TABS_ADM=["alunos","contas","cupons","parametros","exercicios","folhas"],ADMU=null;
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
  var ar=await sb.rpc("admin_list_admins");   /* só existe depois da migração dos administradores */
  ADMS=ar.error?null:ar.data;
  var cr=await sb.rpc("admin_coupons");   /* só existe depois da migração dos cupons */
  CUP=cr.error?null:cr.data;
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
/* Copia um texto para a área de transferência; se o navegador não deixar, mostra o texto já selecionado. */
function copiar(txt,box,msg){
  function manual(){
    box.innerHTML='<textarea id="exTxt" class="adm-dump" readonly rows="8" aria-label="Texto para copiar"></textarea>';
    var ta=$("#exTxt");ta.value=txt;ta.focus();ta.select();
    FC.toast("Não consegui copiar sozinho: o texto está selecionado, é só copiar (Ctrl+C).",true);
  }
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){box.innerHTML="";FC.toast(msg)},manual);
  else manual();
}
function bindEx(){
  var cp=$("#exCopy");
  if(cp)cp.onclick=function(){
    var n=Number($("#exN").value)||5,txt=exDump(n);
    copiar(txt,$("#exOut"),"Copiado: "+catalogo().length+" geradores, até "+n+" exemplos de cada ("+Math.round(txt.length/1024)+" KB).");
  };
  $$("[data-again]").forEach(function(b){b.onclick=function(){
    var e=porId(b.getAttribute("data-again"));if(!e)return;
    b.closest(".adm-excard").innerHTML=exCard(e);bindEx();
  }});
}

/* ---------- gerador de folhas: as contas de cada nível, como o aluno vai ver, e a rampa de dificuldade ----------
   Usa FC.makeItems, o mesmo motor da folha do aluno. Cada conta tem uma nota de dificuldade em percentil dentro do próprio nível
   (0% = a mais fácil que o nível sorteia, 100% = a mais difícil). A folha do dia vai de 1 a 5 e cada uma tem uma faixa de dificuldade:
   a 1ª sorteia das mais fáceis, a 5ª das mais difíceis (FC.plano.BANDAS). Dentro da folha as contas vão do mais fácil ao mais difícil. */
var FOLHA={lv:0,rev:false,sheet:0,sheets:null};
function pcN(p){return Math.round(p*100)}
function bandaTxt(k){var b=FC.plano.BANDAS[k];return pcN(b[0])+"% a "+pcN(b[1])+"%"}
function nivelTipo(L,it){try{var t=L.espec.tipos[L.espec.tipo(it)];return t||""}catch(e){return ""}}
function gerarFolhas(idx,rev){
  var out=[];
  for(var k=0;k<FC.plano.CICLO;k++)out.push(FC.makeItems(idx,null,{sheetNo:k,semRevisao:!rev}));
  return out;
}
/* Colunas da rampa: altura = dificuldade. Conta de revisão (de outro nível) fica tracejada, sem altura. */
function rampa(items,alto,numerar){
  return '<span class="adm-strip'+(numerar?" big":"")+'" style="height:'+alto+'px">'+items.map(function(it,i){
    var h=it._p==null?null:Math.max(3,Math.round(it._p*(alto-(numerar?18:0))));
    return '<span class="adm-col"><i'+(h==null?' class="rev" style="height:'+Math.round(alto*.3)+'px"':' style="height:'+h+'px"')+' title="'+(i+1)+'ª conta: '+(h==null?"revisão":pcN(it._p)+"%")+'"></i>'+(numerar?'<em>'+(i+1)+'</em>':'')+'</span>'}).join("")+'</span>';
}
function folhasOpcoes(){
  var out="",ano=null;
  FC.LEVELS.forEach(function(l,i){
    if(l.ano!==ano){out+=(ano!==null?'</optgroup>':'')+'<optgroup label="'+esc(FC.ordAno(l.ano))+'">';ano=l.ano}
    out+='<option value="'+i+'"'+(i===FOLHA.lv?" selected":"")+'>Nível '+esc(l.id)+' — '+esc(l.name)+'</option>';
  });
  return out+'</optgroup>';
}
function folhasHtml(){
  if(!FC.LEVELS.length||!FC.plano)return '<p class="msg bad">A grade de níveis não carregou.</p>';
  return '<p class="muted small-t">Escolha o nível e toque em “Gerar folha”: aparecem as 10 contas, com a resposta certa, a dificuldade de cada uma e a rampa da folha. '+
    'A dificuldade é um percentil dentro do próprio nível: 0% é a conta mais fácil que o nível sorteia e 100% a mais difícil. '+
    'No app a folha do dia vai de 1 a 5, cada vez mais difícil; por isso o botão gera as 5 de uma vez e você alterna entre elas.</p>'+
    '<div class="adm-extools"><label class="field">Nível<select id="fLv">'+folhasOpcoes()+'</select></label>'+
      '<label class="inline-chk"><input type="checkbox" id="fRev"'+(FOLHA.rev?" checked":"")+'> Com 2 contas de revisão, como no app</label>'+
      '<button class="btn" id="fGo" type="button">Gerar folha</button></div>'+
    '<div id="fOut">'+folhaSaida()+'</div>';
}
function folhaSaida(){
  if(!FOLHA.sheets)return "";
  var L=FC.LEVELS[FOLHA.lv],k=FOLHA.sheet,items=FOLHA.sheets[k];
  var nav=FOLHA.sheets.map(function(s,i){
    return '<button type="button" class="adm-sheetrow'+(i===k?" on":"")+'" data-fs="'+i+'" aria-pressed="'+(i===k)+'" aria-label="Folha '+(i+1)+' do dia, faixa '+bandaTxt(i)+'">'+
      '<b>Folha '+(i+1)+'</b>'+rampa(s,34,false)+'<small class="muted">faixa '+bandaTxt(i)+'</small></button>'}).join("");
  var cards=items.map(function(it,i){
    var tipo=it._rev?"":nivelTipo(L,it);
    return '<section class="panel adm-q"><div class="adm-qh"><b class="adm-qn">'+(i+1)+'</b>'+
      (it._rev?'<span class="tag">revisão de nível anterior</span>':(tipo?'<span class="tag">'+esc(tipo)+'</span>':''))+
      (it._p==null?'':'<span class="adm-diff" title="Dificuldade dentro do nível"><span class="adm-bar"><i style="width:'+pcN(it._p)+'%"></i></span><em>'+pcN(it._p)+'%</em></span>')+'</div>'+
      FC.itemStatic(it)+'</section>'}).join("");
  return '<div class="panel adm-folha"><div class="eyebrow">Nível '+esc(L.id)+' · '+esc(FC.ordAno(L.ano))+' · '+esc(L.group)+'</div><h2>'+esc(L.name)+'</h2>'+
    '<p class="small-t muted">Meta de tempo: '+L.target+' s para as 10 contas'+(L.hab&&L.hab.length?' · Habilidades: '+esc(L.hab.join(" · ")):'')+'</p>'+
    (L.hint?'<p class="small-t">Dica que o aluno vê: '+esc(L.hint)+'</p>':'')+
    (L.intro?'<p class="small-t">Texto de abertura da folha: '+esc(L.intro)+'</p>':'')+'</div>'+
    '<h3>Rampa de dificuldade</h3><p class="muted small-t">Cada coluna é uma conta, na ordem da folha; quanto mais alta, mais difícil dentro do nível. Toque numa folha para ver as contas dela.</p>'+
    '<div class="adm-sheets">'+nav+'</div>'+
    '<div class="panel adm-folha"><div class="adm-qtop"><div><b>Folha '+(k+1)+' do dia</b> <span class="muted small-t">faixa de dificuldade sorteada: '+bandaTxt(k)+'</span></div>'+
      '<div class="actions"><button class="btn ghost small" id="fAgain" type="button">Gerar de novo</button><button class="btn ghost small" id="fCopy" type="button">Copiar em texto</button></div></div>'+
      rampa(items,110,true)+'</div><div id="fTxt"></div><div class="adm-qs">'+cards+'</div>';
}
/* Dados da folha em texto (JSON, uma conta por linha), para colar numa conversa e conferir. */
function folhaDump(){
  var L=FC.LEVELS[FOLHA.lv],items=FOLHA.sheets[FOLHA.sheet];
  return '{"nivel":'+JSON.stringify(L.id)+',"nome":'+JSON.stringify(L.name)+',"folha":'+(FOLHA.sheet+1)+',"faixa":'+JSON.stringify(bandaTxt(FOLHA.sheet))+',"contas":[\n'+items.map(function(it,i){
    var o={n:i+1};
    if(it._rev)o.revisao=true;else{var t=nivelTipo(L,it);if(t)o.tipo=t;if(it._p!=null)o.dificuldade=pcN(it._p)+"%"}
    o.pre=it.pre;if(it.post)o.post=it.post;o.a=it.a;
    if(it.extra&&it.extra.opts)o.certa=FC.answerText(it,it.a);
    if(it.extra)o.extra=it.extra;
    return "  "+JSON.stringify(o)}).join(",\n")+'\n]}';
}
function bindFolhas(){
  var go=$("#fGo");if(!go)return;
  function pinta(){$("#fOut").innerHTML=folhaSaida();bindFolhas()}
  function gera(){
    FOLHA.lv=Number($("#fLv").value)||0;FOLHA.rev=$("#fRev").checked;
    FOLHA.sheets=gerarFolhas(FOLHA.lv,FOLHA.rev);pinta();
  }
  go.onclick=function(){FOLHA.sheet=0;gera()};
  $$("[data-fs]").forEach(function(b){b.onclick=function(){FOLHA.sheet=Number(b.getAttribute("data-fs"));pinta()}});
  var ag=$("#fAgain");if(ag)ag.onclick=gera;
  var cp=$("#fCopy");if(cp)cp.onclick=function(){var txt=folhaDump();copiar(txt,$("#fTxt"),"Folha copiada ("+Math.round(txt.length/1024*10)/10+" KB).")};
}

/* ---------- parâmetros do avanço (valem para todos os alunos) ---------- */
var DEFAULTS={stamps_needed:5,normal_acertos:80,ouro_acertos:95,ouro_tempo:80,ouro_carimbos:2,salto_acertos:98,salto_tempo:60,
  salto_por_semana:2,dias_sem_carimbo_voltar:2,bloqueio_salto_dias:7,teto_anos_padrao:1,virada_mes:1,virada_dia:1,limite_mesa:1,pausas_max:2,modo_folha:1,
  plano_folhas_gratis:2,plano_albuns_gratis:1,plano_alunos_gratis:1,plano_alunos_vip:4,plano_teste_dias:14,
  preco_mensal_centavos:2490,preco_anual_centavos:19900,assinatura_carencia_dias:3};
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
  {t:"Álbuns de figurinhas",d:"Os pais liberam quantos álbuns quiserem. A criança mantém alguns na mesa (são os álbuns de onde sai a figurinha que ela vai abrir) e os outros ficam na gaveta.",f:[
    ["limite_mesa","Álbuns na mesa ao mesmo tempo",1,5,"álbuns"]]},
  {t:"Ano escolar",d:"O ano de cada aluno é calculado a partir do ano informado pelos pais; a virada não muda o nível do aluno.",f:[
    ["teto_anos_padrao","Anos à frente do ano escolar que o aluno pode alcançar (padrão)",0,9,"anos"],
    ["virada_mes","Virada do ano escolar: mês",1,12,"mês"],
    ["virada_dia","Virada do ano escolar: dia",1,28,"dia"]]},
  {t:"Plano Grátis e VIP",d:"Limites do plano Grátis e o tamanho do VIP. A trava é no banco; mudar aqui vale na hora para todas as contas.",f:[
    ["plano_folhas_gratis","Folhas por dia no Grátis",1,10,"folhas"],
    ["plano_albuns_gratis","Álbuns no Grátis",1,5,"álbuns"],
    ["plano_alunos_gratis","Alunos por conta no Grátis",1,10,"alunos"],
    ["plano_alunos_vip","Alunos por conta no VIP (família)",1,20,"alunos"],
    ["plano_teste_dias","Dias de teste do VIP para conta nova (0 desliga)",0,60,"dias"]]},
  {t:"Preço da assinatura",d:"Em centavos (2490 = R$ 24,90). Vale para quem assinar depois da mudança; quem já assinou continua com o valor de quando assinou. A carência são os dias de VIP depois do vencimento, enquanto o pagamento não chega.",f:[
    ["preco_mensal_centavos","VIP mensal",500,99900,"centavos"],
    ["preco_anual_centavos","VIP anual",500,999900,"centavos"],
    ["assinatura_carencia_dias","Carência depois do vencimento",0,15,"dias"]]}];
function paramsHtml(){
  if(!SET)return '<p class="msg bad">'+esc(SETERR||"Não deu para carregar os parâmetros.")+'</p>';
  return '<form id="parForm" class="form" novalidate>'+GROUPS.filter(function(g){return g.f.every(function(f){return SET[f[0]]!=null})}).map(function(g){   // grupo sem os parâmetros no banco (migração ainda não aplicada) não aparece

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
      var i=f.elements[x[0]];if(!i)return;   // parâmetro que não está na tela (grupo escondido)
      var v=i.value.trim();
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
/* Plano de cada conta (migração 2026-11-17-plano-vip.sql). Sem a migração, a coluna mostra só um traço. */
var ORIGEM={teste:"teste",fundador:"Fundador",concessao:"concessão",cupom:"cupom",assinatura:"assinatura",indicacao:"indicação"};
function planCell(a){
  var p=a.plan;if(!p)return "—";
  var t=!p.vip?'<span class="tag">Grátis</span>':'<span class="tag ok">VIP'+(p.lifetime?' vitalício':' até '+dtDay(p.until))+'</span>';
  var ents=(a.ents||[]).map(function(e){
    return '<li>'+esc(ORIGEM[e.source]||e.source)+(e.ends_at?' até '+dtDay(e.ends_at):' vitalício')+(e.max_students?' · '+e.max_students+' alunos':'')+(e.note?' · '+esc(e.note):'')+
      (e.source!=="assinatura"?' <button type="button" class="link small-t" data-revoke="'+e.id+'">tirar</button>':'')+'</li>'}).join("");
  return t+(ents?'<ul class="plain small-t">'+ents+'</ul>':'');
}
function accountsTable(){
  var rows=DATA.accounts.filter(function(a){return match((a.email||"")+" "+(a.name||""))}).map(function(a){
    var ad=admOf(a.id);
    return '<tr><td><b>'+esc(a.email||"")+'</b>'+(ad?' <span class="tag ok">admin</span>'+(ad.root?'':' <button type="button" class="link small-t" data-unadmin="'+a.id+'">tirar admin</button>'):'')+'</td><td>'+esc(a.name||"—")+'</td><td>'+esc(a.role||"—")+'</td><td>'+a.students+'</td><td>'+planCell(a)+'</td><td>'+dt(a.last_sign_in_at)+'</td><td>'+dtDay(a.created_at)+'</td></tr>'});
  return grantForm()+adminForm()+table(["E-mail","Nome","Perfil","Alunos","Plano","Último acesso","Criada em"],rows);
}
function admOf(id){return (ADMS||[]).filter(function(x){return x.id===id})[0]}
function adminForm(){
  if(ADMS===null)return "";
  return '<details class="panel"><summary>Dar acesso de administrador</summary><form id="admGrantForm" class="form" novalidate>'+
    '<p class="small-t muted">A conta precisa já estar cadastrada. Quem recebe passa a ver o botão da área administrativa e tem os mesmos poderes que você, inclusive dar e tirar admin.</p>'+
    '<label class="field">E-mail da conta<input id="gaEmail" type="email" autocomplete="off" required></label>'+
    '<p class="msg bad" id="gaMsg" role="alert"></p><button class="btn" type="submit" id="gaBtn">Tornar administrador</button></form></details>';
}
function grantForm(){
  return '<details class="panel"><summary>Dar VIP para uma conta</summary><form id="vipForm" class="form" novalidate>'+
    '<label class="field">E-mail da conta<input id="vEmail" type="email" autocomplete="off" required></label>'+
    '<div class="two"><label class="field">Dias de VIP<input id="vDays" type="number" min="1" max="3650" inputmode="numeric" placeholder="vazio = vitalício"><small>Somam a partir do fim do VIP atual.</small></label>'+
    '<label class="field">Limite de alunos<input id="vMax" type="number" min="1" max="200" inputmode="numeric" placeholder="padrão do VIP"><small>Para professor ou escola, aumente.</small></label></div>'+
    '<label class="field">Observação<input id="vNote" maxlength="200" placeholder="Ex.: parceria, sorteio, professor"></label>'+
    '<p class="msg bad" id="vMsg" role="alert"></p><button class="btn" type="submit" id="vBtn">Dar VIP</button></form></details>';
}
function bindAccounts(user){
  var ga=$("#admGrantForm");
  if(ga)ga.onsubmit=async function(e){
    e.preventDefault();
    var email=$("#gaEmail").value.trim();
    if(!email){$("#gaMsg").textContent="Digite o e-mail da conta.";return}
    $("#gaBtn").disabled=true;
    var r=await sb.rpc("admin_grant_admin",{p_email:email});
    if(r.error){$("#gaBtn").disabled=false;$("#gaMsg").textContent=String(r.error.message||"").indexOf("conta_nao_encontrada")>=0?"Não há conta cadastrada com esse e-mail.":FC.err(r.error);return}
    FC.toast(r.data.email+" agora é administrador.");load(user);
  };
  $$("[data-unadmin]").forEach(function(b){
    FC.confirmClick(b,"tocar de novo para tirar",async function(){
      var r=await sb.rpc("admin_revoke_admin",{p_user:b.getAttribute("data-unadmin")});
      if(r.error)return FC.toast(FC.err(r.error),true);
      FC.toast("Acesso de administrador retirado.");load(user);
    });
  });
  var f=$("#vipForm");
  if(f)f.onsubmit=async function(e){
    e.preventDefault();
    var email=$("#vEmail").value.trim(),days=$("#vDays").value.trim(),mx=$("#vMax").value.trim();
    if(!email){$("#vMsg").textContent="Digite o e-mail da conta.";return}
    $("#vBtn").disabled=true;
    var r=await sb.rpc("admin_grant_vip",{p_email:email,p_days:days?Number(days):null,p_max_students:mx?Number(mx):null,p_note:$("#vNote").value.trim()});
    if(r.error){$("#vBtn").disabled=false;$("#vMsg").textContent=FC.err(r.error);return}
    FC.toast(r.data.lifetime?"VIP vitalício concedido.":"VIP concedido até "+dtDay(r.data.until)+".");load(user);
  };
  $$("[data-revoke]").forEach(function(b){
    FC.confirmClick(b,"tocar de novo para tirar",async function(){
      var r=await sb.rpc("admin_revoke_vip",{p_id:b.getAttribute("data-revoke")});
      if(r.error)return FC.toast(FC.err(r.error),true);
      FC.toast("Concessão retirada.");load(user);
    });
  });
}

/* ---------- cupons (migracoes/2026-11-18-cupons.sql) ----------
   Tipos: meses e vitalício viram VIP na hora; percentual e valor são desconto na assinatura (guardado até a fase 3).
   Cupom usado não muda de tipo nem de valor; para parar de valer, desative (o histórico fica). */
var CUP_KIND={percentual:"% de desconto",valor:"R$ de desconto",meses:"Meses de VIP",vitalicio:"VIP vitalício"};
function isoLocal(v,endOfDay){if(!v)return null;var d=new Date(v+(endOfDay?"T23:59:59":"T00:00:00"));return isNaN(d)?null:d.toISOString()}
function dayInput(iso){if(!iso)return "";var d=new Date(iso);return d.getFullYear()+"-"+FC.pad(d.getMonth()+1)+"-"+FC.pad(d.getDate())}
function cupStatus(c){
  var now=Date.now();
  if(!c.active)return '<span class="tag">desativado</span>';
  if(c.valid_from&&new Date(c.valid_from)>now)return '<span class="tag">começa '+dtDay(c.valid_from)+'</span>';
  if(c.valid_until&&new Date(c.valid_until)<=now)return '<span class="tag">vencido</span>';
  if(c.max_uses&&c.uses>=c.max_uses)return '<span class="tag">esgotado</span>';
  return '<span class="tag ok">valendo</span>';
}
function cuponsHtml(){
  var e=CUPEDIT||{kind:"percentual",plans:"ambos"},editing=!!CUPEDIT,used=editing&&e.uses>0,dis=used?" disabled":"";
  function opt(v,l,cur){return '<option value="'+v+'"'+(cur===v?" selected":"")+'>'+l+'</option>'}
  var form='<form id="cupForm" class="form" novalidate><h2>'+(editing?"Editar cupom "+esc(e.code):"Novo cupom")+'</h2>'+
    (used?'<p class="small-t muted">Este cupom já foi usado: dá para mudar validade, limite, “só contas novas” e observação.</p>':'')+
    '<div class="two"><label class="field">Código<input id="cCode" maxlength="30" autocomplete="off" autocapitalize="characters" value="'+esc(e.code||"")+'"'+(editing?" disabled":"")+' placeholder="Ex.: BLACKFRIDAY50"><small>Letras, números e hífen.</small></label>'+
    '<label class="field">Tipo<select id="cKind"'+dis+'>'+Object.keys(CUP_KIND).map(function(k){return opt(k,CUP_KIND[k],e.kind)}).join("")+'</select></label></div>'+
    '<div class="two"><label class="field" id="cValBox">Valor<input id="cVal" type="number" min="0" step="0.01" inputmode="decimal" value="'+(e.value!=null&&e.kind!=="vitalicio"?esc(e.value):"")+'"'+dis+'><small id="cValHint"></small></label>'+
    '<label class="field" id="cPlansBox">Vale no plano<select id="cPlans"'+dis+'>'+opt("ambos","Mensal e anual",e.plans)+opt("mensal","Só mensal",e.plans)+opt("anual","Só anual",e.plans)+'</select></label></div>'+
    '<label class="field" id="cCyclesBox">Quantas cobranças<input id="cCycles" type="number" min="1" max="120" inputmode="numeric" value="'+(e.cycles||"")+'"'+dis+' placeholder="vazio = todas"><small>1 = só a primeira cobrança.</small></label>'+
    '<div class="two"><label class="field">Começa em<input id="cFrom" type="date" value="'+dayInput(e.valid_from)+'"><small>Vazio = já vale.</small></label>'+
    '<label class="field">Termina em (inclusive)<input id="cUntil" type="date" value="'+dayInput(e.valid_until)+'"><small>Vazio = sem prazo.</small></label></div>'+
    '<div class="two"><label class="field">Limite de usos<input id="cMax" type="number" min="1" inputmode="numeric" value="'+(e.max_uses||"")+'" placeholder="vazio = sem limite"></label>'+
    '<label class="field">Observação<input id="cNote" maxlength="200" value="'+esc(e.note||"")+'" placeholder="Ex.: Black Friday 2026"></label></div>'+
    '<label class="inline-chk"><input type="checkbox" id="cNew"'+(e.only_new?" checked":"")+'> Só para quem ainda não assinou</label>'+
    '<p class="msg bad" id="cMsg" role="alert"></p><div class="actions"><button class="btn" type="submit" id="cSave">'+(editing?"Salvar":"Criar cupom")+'</button>'+
    (editing?'<button class="btn ghost" type="button" id="cCancel">Cancelar</button>':'')+'</div></form>';
  var rows=(CUP||[]).map(function(c){
    return '<tr><td><b>'+esc(c.code)+'</b>'+(c.note?'<div class="muted small-t">'+esc(c.note)+'</div>':'')+'</td><td>'+esc(c.text)+(c.only_new?'<div class="muted small-t">só quem não assinou</div>':'')+'</td>'+
      '<td>'+(c.valid_from?dtDay(c.valid_from):"—")+' a '+(c.valid_until?dtDay(c.valid_until):"—")+'</td><td>'+c.uses+(c.max_uses?' de '+c.max_uses:'')+(c.reserved?'<div class="muted small-t">'+c.reserved+' guardado'+(c.reserved>1?'s':'')+'</div>':'')+'</td>'+
      '<td>'+cupStatus(c)+'</td><td><button type="button" class="link small-t" data-cedit="'+esc(c.code)+'">editar</button> · <button type="button" class="link small-t" data-ctog="'+esc(c.code)+'" data-on="'+(c.active?0:1)+'">'+(c.active?"desativar":"ativar")+'</button></td></tr>'});
  return '<div class="panel">'+form+'</div>'+(rows.length?table(["Código","O que dá","Validade","Usos","Situação",""],rows):'<p class="muted gap">Nenhum cupom ainda.</p>');
}
function bindCupons(user){
  var f=$("#cupForm");if(!f)return;
  function kindUi(){
    var k=$("#cKind").value,disc=k==="percentual"||k==="valor";
    $("#cValBox").hidden=k==="vitalicio";$("#cPlansBox").hidden=!disc;$("#cCyclesBox").hidden=!disc;
    $("#cValHint").textContent=k==="percentual"?"De 1 a 100 (%).":k==="valor"?"Em reais, por cobrança.":k==="meses"?"Quantos meses de VIP (1 a 120).":"";
  }
  $("#cKind").onchange=kindUi;kindUi();
  var cc=$("#cCancel");if(cc)cc.onclick=function(){CUPEDIT=null;show(user)};
  f.onsubmit=async function(e){
    e.preventDefault();
    var k=$("#cKind").value,disc=k==="percentual"||k==="valor",msg=$("#cMsg");
    var p={code:(CUPEDIT?CUPEDIT.code:$("#cCode").value).trim().toUpperCase(),valid_from:isoLocal($("#cFrom").value,false),valid_until:isoLocal($("#cUntil").value,true),
      max_uses:$("#cMax").value?Number($("#cMax").value):null,only_new:$("#cNew").checked,note:$("#cNote").value.trim()};
    if(!(CUPEDIT&&CUPEDIT.uses>0)){
      p.kind=k;p.value=k==="vitalicio"?0:Number($("#cVal").value||0);
      p.plans=disc?$("#cPlans").value:"ambos";p.cycles=disc&&$("#cCycles").value?Number($("#cCycles").value):null;
      if(k!=="vitalicio"&&!(p.value>0)){msg.textContent="Informe o valor do cupom.";return}
    }
    $("#cSave").disabled=true;
    var r=await sb.rpc("admin_save_coupon",{p:p});
    if(r.error){$("#cSave").disabled=false;msg.textContent=FC.err(r.error);return}
    FC.toast((CUPEDIT?"Cupom salvo: ":"Cupom criado: ")+r.data.code+" ("+r.data.text+").");CUPEDIT=null;load(user);
  };
  $$("[data-cedit]").forEach(function(b){b.onclick=function(){CUPEDIT=(CUP||[]).filter(function(c){return c.code===b.getAttribute("data-cedit")})[0]||null;show(user);window.scrollTo(0,0)}});
  $$("[data-ctog]").forEach(function(b){b.onclick=async function(){
    var on=b.getAttribute("data-on")==="1";b.disabled=true;
    var r=await sb.rpc("admin_set_coupon_active",{p_code:b.getAttribute("data-ctog"),p_active:on});
    if(r.error){b.disabled=false;return FC.toast(FC.err(r.error),true)}
    FC.toast(on?"Cupom ativado.":"Cupom desativado.");load(user);
  }});
}

function show(user){
  FC.nav.at(admPath(TAB));
  var t=DATA.totals;
  FC.render(bar(user.email)+'<div class="section-head"><h1>Visão geral</h1><div class="actions"><button class="btn ghost small" id="reload">Atualizar</button></div></div>'+
    '<div class="adm-stats">'+stat(t.accounts,"contas de adultos")+stat(t.students,"alunos")+stat(t.sheets_done,"folhas feitas")+stat(t.sheets_7d,"folhas nos últimos 7 dias")+
      stat(t.active_7d,"alunos ativos em 7 dias")+stat(t.friendships,"amizades")+(t.vip!=null?stat(t.vip,"contas VIP agora"):"")+'</div>'+
    '<div class="panel"><div class="tabs"><button class="tab'+(TAB==="alunos"?" on":"")+'" data-t="alunos">Alunos ('+DATA.students.length+')</button>'+
      '<button class="tab'+(TAB==="contas"?" on":"")+'" data-t="contas">Contas ('+DATA.accounts.length+')</button>'+
      (CUP?'<button class="tab'+(TAB==="cupons"?" on":"")+'" data-t="cupons">Cupons ('+CUP.length+')</button>':'')+
      '<button class="tab'+(TAB==="parametros"?" on":"")+'" data-t="parametros">Parâmetros</button>'+
      '<button class="tab'+(TAB==="exercicios"?" on":"")+'" data-t="exercicios">Exercícios</button>'+
      '<button class="tab'+(TAB==="folhas"?" on":"")+'" data-t="folhas">Folhas</button></div>'+
    (TAB==="parametros"?paramsHtml():TAB==="exercicios"?exHtml():TAB==="folhas"?folhasHtml():TAB==="cupons"?cuponsHtml():
    '<label class="field">Buscar<input id="aFind" type="search" autocomplete="off" value="'+esc(FILTER)+'" placeholder="nome ou e-mail"></label>'+
    '<div id="admBody">'+(TAB==="alunos"?studentsTable():accountsTable())+'</div>')+'</div>');
  bindBar();
  $("#reload").onclick=function(){load(user)};
  $$(".tab").forEach(function(b){b.onclick=function(){TAB=b.getAttribute("data-t");show(user)}});
  bindParams(user);bindLevels();bindEx();bindFolhas();bindAccounts(user);bindCupons(user);
  if($("#aFind"))$("#aFind").oninput=function(){FILTER=this.value.trim().toLowerCase();$("#admBody").innerHTML=TAB==="alunos"?studentsTable():accountsTable();bindAccounts(user)};
}
})();
