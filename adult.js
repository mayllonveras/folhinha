/* Painel de pais e professores: cadastro/login, alunos, programa de estudos, sequência de estudo e histórico. */
(function(){
"use strict";
var FC=window.FC,$=FC.$,$$=FC.$$,esc=FC.esc,sb=FC.sb;
var U={user:null,profile:null};
var PUB=null;   /* parâmetros do avanço (leitura): regras, virada do ano, teto padrão */
async function ensurePub(){if(PUB)return;try{var r=await sb.rpc("app_public");if(!r.error&&r.data)PUB=r.data}catch(e){}}
/* Etiqueta do ano: o que o aluno cursa e de que ano é o conteúdo que ele estuda. */
function anoLine(s,L,today,semHab){
  var a=FC.anoAluno(s,today,PUB),h=!semHab&&L.hab&&L.hab.length?" · "+L.hab.join(", "):"";   /* habilidades da BNCC do nível */
  if(!a)return "Conteúdo do "+FC.ordAno(L.ano)+h;
  var d=L.ano-a;
  return "Cursa o "+FC.ordAno(a)+" · estudando o "+FC.ordAno(L.ano)+(d>0?" (+"+d+")":d<0?" (−"+(-d)+")":"")+h;
}
/* Limites mínimos do programa: 5 folhas por dia e 3 dias por semana. */
var MIN_SHEETS=5,MIN_DAYS=3,THEME_SEARCH_FROM=10;   // acima de 10 álbuns aparecem a busca e o filtro por categoria
function deskLimit(){return (PUB&&PUB.limite_mesa)||2}
async function q(p){var r=await p;if(r.error)throw r.error;return r.data}

/* ---------- plano (Grátis ou VIP) ----------
   A trava de verdade é no banco (migracoes/2026-11-17-plano-vip.sql). Aqui o painel só explica o plano e evita mandar o adulto a um erro.
   Se adult_plan falhar (banco sem a migração), PLAN fica nulo e o painel segue como antes, sem nada trancado. */
var PLAN=null;
async function loadPlan(){try{var r=await sb.rpc("adult_plan");PLAN=r.error?null:r.data}catch(e){PLAN=null}return PLAN}
function planLim(k,d){return PLAN&&PLAN.limits&&PLAN.limits[k]!=null?PLAN.limits[k]:d}
/* O aluno segue o plano de quem o cadastrou. Aluno de outro adulto (convite): o painel não sabe o plano dele, então não tranca nada. */
function studentFree(s){return !!(PLAN&&s&&s.created_by===U.user.id&&!PLAN.vip)}
function quotaOf(s){return studentFree(s)?Math.min(s.sheets_per_day,planLim("folhas_gratis",2)):s.sheets_per_day}
function daysLeft(iso){return Math.max(0,Math.ceil((new Date(iso)-Date.now())/864e5))}
function planName(){
  if(!PLAN)return "";
  if(!PLAN.vip)return "Plano Grátis";
  if(PLAN.lifetime)return PLAN.source==="fundador"?"VIP Fundador vitalício":"VIP vitalício";
  var n=daysLeft(PLAN.until);
  if(PLAN.source==="teste")return "Teste do VIP: "+(n<=1?"último dia":"faltam "+n+" dias");
  if(PLAN.source==="fundador")return "VIP Fundador até "+FC.dm(String(PLAN.until).slice(0,10));
  return "VIP até "+FC.dm(String(PLAN.until).slice(0,10));
}
function vipLock(title,text){
  return '<div class="panel vip-lock"><span class="vip-tag">VIP</span><b>'+esc(title)+'</b><p class="small-t muted">'+esc(text)+'</p><div class="actions"><button type="button" class="btn small" data-plans>Ver planos</button></div></div>';
}
function bindLocks(){$$("[data-plans]").forEach(function(b){b.onclick=showPlans})}
var PLAN_ROWS=[["Crianças por conta","1","até 4 (família)"],["Folhas do dia","2 por dia","as do programa (5 ou mais)"],["Todos os anos (1º ao 5º) e vídeos","✓","✓"],
  ["Álbuns de figurinhas","1","todos"],["Pacotinhos","boas-vindas e dias seguidos","+ carimbo, perseverança e Turbo"],
  ["Amigos e trocas de figurinhas","—","✓"],["Trilha Turbo","—","✓"],["Painel dos pais","resumo e histórico","completo, com a aba Atenção"]];
/* ---------- assinatura (migracoes/2026-11-18-assinatura.sql e supabase/functions/assinatura) ----------
   Sem a migração (adult_billing falha), a tela segue com "a assinatura chega em breve". */
var BILL=null;
async function loadBilling(){try{var r=await sb.rpc("adult_billing");BILL=r.error?null:r.data}catch(e){BILL=null}return BILL}
function brl(v){return "R$ "+Number(v||0).toFixed(2).replace(".",",")}
function priceOf(plan){var q=BILL&&BILL.quote&&BILL.quote[plan];return q?Number(q.full):plan==="mensal"?24.9:199}
var SUB_STATUS={aguardando:["Aguardando o pagamento",""],ativa:["Ativa","ok"],atrasada:["Pagamento atrasado","bad"],cancelada:["Cancelada",""]};
function payStatus(st){return {PENDING:"em aberto",OVERDUE:"vencida",RECEIVED:"paga",CONFIRMED:"paga",REFUNDED:"estornada",RECEIVED_IN_CASH:"paga"}[st]||String(st||"").toLowerCase()}
function subscribeHtml(){
  var q=BILL.quote||{},cards=["mensal","anual"].map(function(pl){
    var x=q[pl]||{},disc=x.coupon&&Number(x.first)<Number(x.full);
    return '<button type="button" class="btn'+(pl==="anual"?"":" ghost")+' block" data-sub="'+pl+'">Assinar '+pl+' · '+brl(x.full)+(pl==="mensal"?"/mês":"/ano")+'</button>'+
      (disc?'<p class="small-t ok-t">Com o cupom '+esc(x.coupon)+': '+brl(x.first)+' '+(x.cycles===1?'na 1ª cobrança':x.cycles?'nas '+x.cycles+' primeiras cobranças':'em todas as cobranças')+'.</p>':'');
  }).join("");
  return '<div class="panel"><div class="eyebrow">Assinar o VIP</div><div class="sub-btns gap">'+cards+'</div>'+
    '<p class="small-t muted gap">Pagamento pelo Asaas: cartão de crédito (renova sozinho) ou Pix e boleto (fatura a cada mês ou ano). Cancele quando quiser: o VIP vale até o fim do período pago.</p></div>';
}
function billingHtml(){
  if(!BILL)return '<div class="panel center"><b>A assinatura online chega em breve</b><p class="small-t muted">Pix, cartão e boleto. Avisamos por aqui assim que abrir.</p></div>';
  if(PLAN&&PLAN.lifetime)return '<div class="panel center"><b>Sua conta é VIP para sempre</b><p class="small-t muted">Não precisa assinar.</p></div>';
  var s=BILL.subscription;
  if(s&&(s.status==="ativa"||s.status==="atrasada"))
    return '<div class="panel"><div class="eyebrow">Minha assinatura</div><p class="gap">Você assina o <b>VIP '+esc(s.plan)+'</b>.'+(s.status==="atrasada"?' <span class="tag bad">Pagamento atrasado</span>':'')+'</p>'+
      '<p class="small-t muted">Vencimento, cobranças e cancelamento ficam em Meu perfil.</p><div class="actions gap"><button type="button" class="btn small" data-perfil>Abrir meu perfil</button></div></div>';
  return (s&&s.status==="aguardando"&&s.pay_url?'<div class="panel"><div class="eyebrow">Pagamento em aberto</div><p class="small-t gap">O link de pagamento está pronto. Se já pagou, a confirmação chega em instantes.</p><div class="actions"><a class="btn small" href="'+esc(s.pay_url)+'" rel="noopener">Continuar pagamento</a></div></div>':'')+subscribeHtml();
}
/* Campos dos dados de pagamento (perfil e assinar). Ficam só no Asaas; o CPF nunca volta inteiro para a tela. */
function payFieldsHtml(pf){
  pf=pf||{};
  return '<label class="field">Nome completo de quem paga<input id="sNome" maxlength="100" autocomplete="name" value="'+esc(pf.nome||(U.profile&&U.profile.name)||"")+'"></label>'+
    '<label class="field">CPF de quem paga<input id="sCpf" inputmode="numeric" autocomplete="off" maxlength="14" placeholder="'+(pf.cpf?"Digite de novo para confirmar":"000.000.000-00")+'"><small>O Asaas pede o CPF para emitir a cobrança e a nota fiscal. A Folhinha não guarda o seu CPF.</small></label>'+
    '<label class="field">Celular com DDD<input id="sCel" inputmode="tel" autocomplete="tel-national" maxlength="15" placeholder="(00) 00000-0000" value="'+esc(fmtCel(pf.celular||""))+'"><small>O Asaas usa para avisos da cobrança.</small></label>'+
    '<div class="two"><label class="field">CEP<input id="sCep" inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="00000-000" value="'+esc(fmtCep(pf.cep||""))+'"></label>'+
    '<label class="field">Número<input id="sNum" maxlength="10" autocomplete="off" placeholder="Ex.: 120" value="'+esc(pf.numero||"")+'"></label></div>';
}
function fmtCel(v){var d=String(v).replace(/\D/g,"").slice(0,11);return d.length<3?d:d.length<7?"("+d.slice(0,2)+") "+d.slice(2):d.length<11?"("+d.slice(0,2)+") "+d.slice(2,6)+"-"+d.slice(6):"("+d.slice(0,2)+") "+d.slice(2,7)+"-"+d.slice(7)}
function fmtCep(v){var d=String(v).replace(/\D/g,"").slice(0,8);return d.length>5?d.slice(0,5)+"-"+d.slice(5):d}
function bindPayFields(root){
  var cpf=$("#sCpf",root),cel=$("#sCel",root),cep=$("#sCep",root);
  cel.oninput=function(){cel.value=fmtCel(cel.value)};
  cep.oninput=function(){cep.value=fmtCep(cep.value)};
  cpf.oninput=function(){var d=cpf.value.replace(/\D/g,"").slice(0,11);cpf.value=d.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2")};
}
/* Lê e confere os campos; devolve {dados} ou {erro} */
function readPayFields(root){
  var nome=$("#sNome",root).value.trim(),c=$("#sCpf",root).value.replace(/\D/g,""),celN=$("#sCel",root).value.replace(/\D/g,""),
    cepN=$("#sCep",root).value.replace(/\D/g,""),num=$("#sNum",root).value.trim();
  if(nome.length<3)return{erro:"Digite o nome completo."};
  if(c.length!==11)return{erro:"Digite os 11 números do CPF."};
  if(!/^[1-9]{2}9?\d{8}$/.test(celN))return{erro:celN.length===11?"Celular tem 9 dígitos começando com 9 depois do DDD. Ex.: (86) 99999-8888.":"Digite o celular com DDD. Ex.: (86) 99999-8888."};
  if(cepN.length!==8)return{erro:"Digite o CEP com 8 números."};
  if(!num)return{erro:"Digite o número do endereço (ou S/N)."};
  return{dados:{nome:nome,cpf:c,celular:celN,cep:cepN,numero:num}};
}
function payDataHtml(pf){
  var end=[[pf.rua,pf.numero].filter(Boolean).join(", "),pf.bairro,[pf.cidade,pf.uf].filter(Boolean).join("/"),pf.cep?"CEP "+fmtCep(pf.cep):""].filter(Boolean).join(" · ");
  return '<dl class="pkv"><dt>Nome</dt><dd>'+esc(pf.nome||"—")+'</dd><dt>CPF</dt><dd>'+esc(pf.cpf||"—")+'</dd><dt>Celular</dt><dd>'+esc(fmtCel(pf.celular||"")||"—")+'</dd>'+
    '<dt>Endereço</dt><dd>'+esc(end||"—")+'</dd></dl>';
}
var PERFIL;   /* dados de pagamento do Asaas: undefined = ainda não lidos; null = não tem */
async function loadPerfil(){var r=await callBilling({acao:"perfil"});PERFIL=r.error?null:(r.perfil||null);return PERFIL}
async function subscribeForm(plan){
  var x=(BILL.quote||{})[plan]||{},v=x.first||priceOf(plan);
  if(PERFIL===undefined){FC.toast("Carregando seus dados…");await loadPerfil()}
  var pf=PERFIL;
  var ov=FC.overlay('<h2>Assinar o VIP '+esc(plan)+'</h2><p class="muted">'+brl(v)+(x.coupon&&Number(x.first)<Number(x.full)?' na 1ª cobrança, com o cupom '+esc(x.coupon)+'. Depois, '+brl(x.full):'')+(plan==="mensal"?" por mês.":" por ano.")+'</p>'+
    '<form id="subForm" class="form" novalidate>'+
    (pf?'<div id="sUsar"><div class="eyebrow">Dados de pagamento</div>'+payDataHtml(pf)+'<button type="button" class="link small-t" id="sOutros">Usar outros dados</button></div><div id="sCampos" hidden>'+payFieldsHtml(pf)+'</div>':payFieldsHtml(null))+
    '<fieldset class="field"><legend>Forma de pagamento</legend><label class="radio"><input type="radio" name="sForma" value="cartao" checked> Cartão de crédito: renova sozinho</label>'+
    '<label class="radio"><input type="radio" name="sForma" value="pix_boleto"> Pix ou boleto: fatura a cada '+(plan==="mensal"?"mês":"ano")+'</label></fieldset>'+
    '<p class="msg bad" id="sMsg" role="alert"></p><button class="btn block" type="submit" id="sBtn">Ir para o pagamento</button>'+
    '<p class="small-t muted">Você vai para a página segura do Asaas. Os dados do cartão são digitados lá, nunca na Folhinha.</p></form>',{button:"Voltar"});
  bindPayFields(ov.el);
  var usarPerfil=!!pf,outros=$("#sOutros",ov.el);
  if(outros)outros.onclick=function(){usarPerfil=false;$("#sUsar",ov.el).hidden=true;$("#sCampos",ov.el).hidden=false;$("#sCpf",ov.el).focus()};
  $("#subForm",ov.el).onsubmit=async function(e){
    e.preventDefault();
    var msg=$("#sMsg",ov.el),btn=$("#sBtn",ov.el),body={acao:"assinar",plano:plan,forma:$('input[name="sForma"]:checked',ov.el).value};
    if(usarPerfil)body.usar_perfil=true;
    else{var f=readPayFields(ov.el);if(f.erro){msg.textContent=f.erro;return}Object.keys(f.dados).forEach(function(k){body[k]=f.dados[k]});PERFIL=undefined}
    btn.disabled=true;msg.textContent="";
    var r=await callBilling(body);
    if(r.error){btn.disabled=false;msg.textContent=r.error;return}
    btn.textContent="Abrindo o pagamento…";location.href=r.url;
  };
}
/* Chama a Edge Function "assinatura" com o login do adulto. Devolve {url} ou {error: texto para a tela}. */
async function callBilling(body){
  try{
    var r=await sb.functions.invoke("assinatura",{body:body});
    if(r.error){
      var d=null;try{d=await r.error.context.json()}catch(x){}
      if(d&&d.error==="asaas")return{error:"O Asaas recusou: "+(d.detail||"tente de novo.")};
      return{error:FC.err({message:(d&&d.error)||r.error.message})};
    }
    if(r.data&&r.data.error)return{error:FC.err({message:r.data.error})};
    return r.data||{};
  }catch(e){return{error:FC.err(e)}}
}
function bindBilling(){
  $$("[data-sub]").forEach(function(b){b.onclick=function(){subscribeForm(b.getAttribute("data-sub"))}});
  $$("[data-perfil]").forEach(function(b){b.onclick=showProfile});
}
function paidReturn(){   // volta do Asaas depois de pagar
  if(!/[?&]pagamento=ok/.test(location.search))return;
  try{history.replaceState(null,"",location.pathname+location.hash)}catch(e){}
  FC.toast("Pagamento enviado! O VIP é liberado assim que o Asaas confirmar, em instantes.");
}
/* ---------- Meu perfil: conta, dados de pagamento (do Asaas) e o plano, com cancelamento ---------- */
var ORIGEM_PLANO={teste:"Teste do VIP",fundador:"VIP Fundador",concessao:"VIP (concedido)",cupom:"VIP (cupom)",assinatura:"Assinatura VIP",indicacao:"VIP (indicação)"};
function planHtml(){
  var s=BILL&&BILL.subscription,ativa=s&&(s.status==="ativa"||s.status==="atrasada"),h='';
  var tipo=!PLAN?"—":!PLAN.vip?"Grátis":s&&ativa?"Assinatura VIP "+s.plan:(ORIGEM_PLANO[PLAN.source]||"VIP");
  var venc=!PLAN?"—":!PLAN.vip?"—":PLAN.lifetime?"Sem vencimento (vitalício)":PLAN.until?FC.dm(String(PLAN.until).slice(0,10))+"/"+String(PLAN.until).slice(0,4):"—";
  h+='<dl class="pkv"><dt>Plano</dt><dd><b>'+esc(tipo)+'</b>'+(s&&ativa?' <span class="tag '+(s.status==="ativa"?"ok":"bad")+'">'+(s.status==="ativa"?"Ativa":"Pagamento atrasado")+'</span>':'')+'</dd>'+
    '<dt>'+(s&&ativa?'VIP pago até':'Vencimento')+'</dt><dd>'+esc(venc)+'</dd>';
  if(s&&ativa){
    var per=s.plan==="mensal"?"por mês":"por ano";
    h+='<dt>Valor</dt><dd>'+brl(s.value_now)+' '+per+(s.value_now<s.value_full?' <span class="muted small-t">(cupom '+esc(s.coupon||"")+'; depois '+brl(s.value_full)+')</span>':'')+'</dd>'+
      '<dt>Pagamento</dt><dd>'+(s.method==="cartao"?"Cartão de crédito (renova sozinho)":"Pix ou boleto (fatura por e-mail)")+'</dd>'+
      (s.next_due?'<dt>Próxima cobrança</dt><dd>'+FC.dm(s.next_due)+'</dd>':'');
  }
  h+='</dl>';
  if(s&&s.status==="atrasada")h+='<p class="small-t bad">A última cobrança venceu. Pague a fatura para o VIP continuar.</p>';
  if(s&&s.status==="cancelada")h+='<p class="small-t muted">Assinatura cancelada'+(PLAN&&PLAN.vip&&PLAN.until?': o VIP vale até '+FC.dm(String(PLAN.until).slice(0,10))+'.':'.')+'</p>';
  h+='<div class="actions gap">'+(s&&s.pay_url&&(s.status==="atrasada"||s.status==="aguardando")?'<a class="btn small" href="'+esc(s.pay_url)+'" rel="noopener">'+(s.status==="aguardando"?"Continuar pagamento":"Pagar fatura")+'</a>':'')+
    (ativa?'<button type="button" class="btn danger small" id="planCancel">Cancelar plano</button>':'')+
    (!ativa&&!(PLAN&&PLAN.lifetime)?'<button type="button" class="btn small" data-planos>'+(PLAN&&PLAN.vip?"Assinar o VIP":"Ver planos e assinar")+'</button>':'')+'</div>'+
    (ativa?'<p class="small-t muted">Ao cancelar, não há novas cobranças e o VIP continua até o fim do período já pago.</p>':'');
  if(BILL&&(BILL.payments||[]).length)h+='<details class="gap"><summary>Cobranças</summary><ul class="plain small-t">'+BILL.payments.map(function(p){
    return '<li>'+FC.dm(p.due)+' · '+brl(p.value)+' · '+esc(payStatus(p.status))+(p.url?' · <a href="'+esc(p.url)+'" target="_blank" rel="noopener">fatura</a>':'')+'</li>'}).join("")+'</ul></details>';
  return h;
}
async function showProfile(){
  FC.render('<p class="loading">Carregando…</p>');
  if(!U.profile){try{U.profile=await q(sb.from("profiles").select("name,role").eq("id",U.user.id).maybeSingle())}catch(e){}}
  await Promise.all([loadPlan(),loadBilling(),loadPerfil()]);
  paidReturn();
  var pf=PERFIL;
  FC.render(topbar("Meu perfil")+'<div class="pagehead"><button type="button" class="link crumb" id="back">'+FC.icon("back")+'Meus alunos</button></div>'+
    '<div class="section-head"><h1>Meu perfil</h1></div>'+
    '<div class="panel"><div class="eyebrow">Conta</div><dl class="pkv gap"><dt>Nome</dt><dd>'+esc((U.profile&&U.profile.name)||"—")+'</dd><dt>E-mail</dt><dd>'+esc(U.user.email||"—")+'</dd>'+
      '<dt>Perfil</dt><dd>'+((U.profile&&U.profile.role)==="professor"?"Professor(a)":"Pai, mãe ou responsável")+'</dd></dl></div>'+
    '<div class="panel" id="payBox"><div class="eyebrow">Dados de pagamento</div>'+
      (pf?payDataHtml(pf)+'<div class="actions gap"><button type="button" class="btn ghost small" id="payEdit">Editar dados</button></div>':
        '<p class="small-t muted gap">Ainda sem dados de pagamento. Eles são pedidos na primeira assinatura, ou cadastre agora.</p><div class="actions"><button type="button" class="btn ghost small" id="payEdit">Cadastrar dados</button></div>')+
      '<p class="small-t muted gap">Nome, CPF, celular e endereço são exigidos pelo Asaas, que faz a cobrança. Eles ficam guardados no Asaas, não na Folhinha.</p></div>'+
    '<div class="panel"><div class="eyebrow">Meu plano</div><div class="gap">'+planHtml()+'</div></div>');
  FC.nav.at("/perfil");bindTop();
  $("#back").onclick=function(){if(!FC.nav.up("/"))dash()};
  $$("[data-planos]").forEach(function(b){b.onclick=showPlans});
  $("#payEdit").onclick=function(){editPayData(pf)};
  var c=$("#planCancel");
  if(c)FC.confirmClick(c,"Toque de novo para cancelar",async function(){
    c.disabled=true;
    var r=await callBilling({acao:"cancelar"});
    if(r.error){c.disabled=false;return FC.toast(r.error,true)}
    FC.toast("Plano cancelado. O VIP vale até o fim do período pago.");showProfile();
  });
}
function editPayData(pf){
  var ov=FC.overlay('<h2>Dados de pagamento</h2><form id="pfForm" class="form" novalidate>'+payFieldsHtml(pf)+
    '<p class="msg bad" id="pfMsg" role="alert"></p><button class="btn block" type="submit" id="pfBtn">Salvar</button></form>',{button:"Voltar"});
  bindPayFields(ov.el);
  $("#pfForm",ov.el).onsubmit=async function(e){
    e.preventDefault();
    var msg=$("#pfMsg",ov.el),btn=$("#pfBtn",ov.el),f=readPayFields(ov.el);
    if(f.erro){msg.textContent=f.erro;return}
    btn.disabled=true;msg.textContent="";
    var body={acao:"salvar_perfil"};Object.keys(f.dados).forEach(function(k){body[k]=f.dados[k]});
    var r=await callBilling(body);
    if(r.error){btn.disabled=false;msg.textContent=r.error;return}
    PERFIL=r.perfil||null;ov.close();FC.toast("Dados de pagamento salvos.");showProfile();
  };
}
async function showPlans(){
  FC.render('<p class="loading">Carregando…</p>');
  await Promise.all([loadPlan(),loadBilling()]);
  paidReturn();
  var used=PLAN?PLAN.students+" de "+PLAN.max_students+" aluno"+(PLAN.max_students===1?"":"s"):"";
  FC.render(topbar("Planos")+'<div class="pagehead"><button type="button" class="link crumb" id="back">'+FC.icon("back")+'Meus alunos</button></div>'+
    '<div class="section-head"><h1>Planos</h1></div>'+
    (PLAN?'<div class="panel plan-now"><div class="eyebrow">Seu plano agora</div><div class="v">'+esc(planName())+'</div><small class="muted">'+esc(used)+'</small></div>':'')+
    '<div class="plan-cards">'+
      '<div class="panel plan-card"><div class="eyebrow">Grátis</div><div class="price">R$ 0</div><p class="small-t muted">Para começar e conhecer.</p></div>'+
      '<div class="panel plan-card best"><div class="eyebrow">VIP mensal</div><div class="price">'+brl(priceOf("mensal"))+'<small>/mês</small></div><p class="small-t muted">Família inteira, até 4 crianças.</p></div>'+
      '<div class="panel plan-card best"><span class="vip-tag">'+Math.round(100-100*priceOf("anual")/(12*priceOf("mensal")))+'% off</span><div class="eyebrow">VIP anual</div><div class="price">'+brl(priceOf("anual"))+'<small>/ano</small></div><p class="small-t muted">Sai a '+brl(priceOf("anual")/12)+' por mês.</p></div></div>'+
    billingHtml()+
    '<div class="panel"><div class="tablewrap"><table class="plan-table"><thead><tr><th></th><th>Grátis</th><th>VIP</th></tr></thead><tbody>'+
      PLAN_ROWS.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td><b>'+esc(r[2])+'</b></td></tr>'}).join("")+'</tbody></table></div>'+
      '<p class="small-t muted gap">Conta nova começa com '+planLim("teste_dias",14)+' dias de VIP, sem cartão. Quando o VIP acaba, nada do que a criança conquistou se perde: figurinhas, amigos e histórico ficam guardados.</p></div>'+
    '<div class="panel" id="cupBox"><div class="eyebrow">Tem um cupom?</div>'+
      '<form id="cupForm" class="form inline" novalidate><label class="field grow">Código do cupom<input id="cupCode" maxlength="30" autocomplete="off" autocapitalize="characters" placeholder="Ex.: BLACKFRIDAY50"></label><button class="btn" type="submit" id="cupBtn">Usar cupom</button></form>'+
      '<p class="msg" id="cupMsg" role="alert"></p><div id="cupList"></div></div>');
  FC.nav.at("/planos");bindTop();
  $("#back").onclick=function(){if(!FC.nav.up("/"))dash()};
  bindCoupons();bindBilling();
}
/* ---------- cupons (migracoes/2026-11-18-cupons.sql) ----------
   Cupom de meses ou vitalício vira VIP na hora. Cupom de desconto fica guardado e vale quando a assinatura abrir. */
async function loadCoupons(){
  var box=$("#cupList");if(!box)return;
  var r;try{r=await sb.rpc("adult_coupons")}catch(e){return}
  if(r.error||!r.data||!r.data.length){box.innerHTML="";return}
  box.innerHTML='<ul class="plain small-t gap">'+r.data.map(function(c){
    return '<li><b>'+esc(c.code)+'</b>: '+esc(c.text)+(c.status==="reservado"?' <span class="tag ok">guardado para a assinatura</span>':c.status==="usado"?' <span class="tag">já usado na assinatura</span>':' <span class="tag ok">aplicado</span>')+'</li>'}).join("")+'</ul>';
}
function bindCoupons(){
  var f=$("#cupForm");if(!f)return;
  loadCoupons();
  f.onsubmit=async function(e){
    e.preventDefault();
    var code=$("#cupCode").value.trim(),msg=$("#cupMsg"),btn=$("#cupBtn");
    if(!code){msg.textContent="Digite o código do cupom.";msg.className="msg bad";return}
    btn.disabled=true;
    var r=await sb.rpc("adult_redeem_coupon",{p_code:code});
    btn.disabled=false;
    if(r.error){msg.textContent=FC.err(r.error);msg.className="msg bad";return}
    if(!r.data.ok){msg.textContent=FC.err({message:r.data.why});msg.className="msg bad";return}
    if(r.data.reserved){
      FC.toast("Cupom guardado: "+r.data.text+". Ele vale quando você assinar o VIP.");showPlans();
    }else{
      FC.toast("Cupom aplicado: "+r.data.text+"!");showPlans();
    }
  };
}

/* ---------- Trilha Turbo (resumo para os pais e configuração) ----------
   Só o que ajuda o adulto: se a Turbo de hoje foi feita, quantos fatos já estão firmes em cada operação, quais fatos pedem atenção e quais aparelhos
   a criança usa. Sem tempos em milissegundos, sem comparar com outras crianças, sem ranking. Regras em turbo/ESPECIFICACAO.md.
   Se o banco não tiver as tabelas da Turbo, nada disto aparece e o resto do painel segue normal. */
var TURBO_OK=null;
async function turboLoad(id){
  if(!FC.turbo)return null;
  try{
    var r=await Promise.all([
      sb.rpc("adult_turbo_summary",{p_student:id,p_day:FC.today()}),
      sb.from("turbo_students").select("unlocked,age,skip_placement,placement,devices").eq("student_id",id).maybeSingle(),
      sb.from("turbo_days").select("study_day,status,attempts,promoted").eq("student_id",id).order("study_day",{ascending:false}).limit(14)]);
    if(r[0].error||r[1].error||r[2].error){TURBO_OK=false;return null}
    TURBO_OK=true;
    return{sum:r[0].data||{},cfg:r[1].data,days:r[2].data||[]};
  }catch(e){TURBO_OK=false;return null}
}
var DEV_NOME={celular:"Celular",tablet:"Tablet",computador:"Computador"};
function turboPanel(t,s,today){
  if(!t||!FC.turbo)return "";
  var T=FC.turbo,cat=T.catalogo(),sum=t.sum||{},cfg=t.cfg||{},ops=sum.ops||{},unl=cfg.unlocked||["soma"],gate=Math.round(T.P.GATE*100);
  var row=t.days.filter(function(d){return d.study_day===today})[0],kind=FC.dayKind(s,today);
  var tag=row&&row.status==="done"?'<span class="tag ok">Turbo de hoje concluída</span>'
    :row&&row.attempts>0?'<span class="tag warn">Turbo de hoje em andamento</span>'
    :kind==="rest"?'<span class="tag">Hoje é descanso</span>':'<span class="tag">Turbo de hoje ainda não feita</span>';
  var niv=cfg.placement?"Nivelamento feito"+(cfg.placement.dia!=null?" em "+FC.dm(T.dataDe(cfg.placement.dia)):""):cfg.skip_placement?"Nivelamento pulado pelos pais":"Nivelamento ainda não feito";
  var pct={},bloq={},learning=0;
  T.ORDEM.forEach(function(o){var f=(ops[o]&&ops[o].firm)||0;pct[o]=f/cat[o].facts.length;learning+=(ops[o]&&ops[o].learning)||0});
  T.ORDEM.forEach(function(o){var req=T.REQ[o];bloq[o]=(o!=="soma"&&unl.indexOf(o)<0)||(!!req&&(bloq[req]||pct[req]<T.P.GATE))});
  var rows=T.ORDEM.filter(function(o){return !bloq[o]}).map(function(o){
    var total=cat[o].facts.length,x=ops[o]||{},firm=x.firm||0,lrn=x.learning||0;
    return '<div class="tp-row"><div class="split"><b>'+esc(cat[o].nome)+'</b><span class="muted small-t num">'+firm+' de '+total+' firmes'+(lrn?' · '+lrn+' em treino':'')+'</span></div>'+
      '<div class="tp-bar" role="img" aria-label="'+esc(cat[o].nome)+': '+firm+' fatos firmes e '+lrn+' em treino, de '+total+'"><i class="f" style="width:'+(100*firm/total).toFixed(1)+'%"></i><i class="l" style="width:'+(100*lrn/total).toFixed(1)+'%"></i></div></div>';
  }).join("");
  /* operações fechadas: as que os pais não liberaram e as que esperam a base ficar firme, numa linha cada grupo */
  function nomes(l){l=l.map(function(o){return cat[o].nome.toLowerCase()});return l.length>1?l.slice(0,-1).join(", ")+" e "+l[l.length-1]:l[0]}
  var naoLib=T.ORDEM.filter(function(o){return bloq[o]&&o!=="soma"&&unl.indexOf(o)<0}),espera=T.ORDEM.filter(function(o){return bloq[o]&&naoLib.indexOf(o)<0});
  var fechadas=(espera.length?'<p class="muted small-t gap">'+esc(nomes(espera).replace(/^./,function(c){return c.toUpperCase()}))+' '+(espera.length>1?'abrem':'abre')+' quando a operação de base chegar a '+gate+'% de fatos firmes.</p>':'')+
    (naoLib.length?'<p class="muted small-t'+(espera.length?'':' gap')+'">'+esc(nomes(naoLib).replace(/^./,function(c){return c.toUpperCase()}))+': não '+(naoLib.length>1?'liberadas':'liberada')+' para este aluno (aba Programa).</p>':'');
  var recent=t.days.filter(function(d){return d.attempts>0}).slice(0,3);
  var alerta=recent.length===3&&learning>0&&recent.every(function(d){return d.promoted===0})
    ?'<div class="panel offer"><b>Nos últimos 3 dias de Turbo, nenhum fato novo ficou firme</b><p class="small-t">Isso acontece em algumas fases e não é motivo de preocupação. Se continuar por mais alguns dias, vale sentar com ele numa sessão e ver onde ele trava.</p></div>':"";
  var devs=Object.keys(cfg.devices||{}).map(function(k){return esc(DEV_NOME[k]||k)+' ('+cfg.devices[k]+')'}).join(", ");
  var comecou=T.ORDEM.some(function(o){return ops[o]&&ops[o].registered>0});
  return '<div class="panel" id="turboBox"><div class="split"><div class="eyebrow">Trilha Turbo</div>'+tag+'</div>'+alerta+
    (comecou?rows+fechadas:'<p class="muted gap">'+(cfg.placement||cfg.skip_placement?'Ele ainda não treinou nenhum fato na Turbo.':'Ele ainda não começou a Turbo. Na primeira vez, ela abre com um jogo rápido para descobrir por onde começar.')+'</p>')+
    '<details class="gap tp-more"><summary>Como ler este quadro</summary><p class="muted small-t">Fato firme é a conta que ele já responde sem pensar muito e que acertou em dias diferentes. Na barra, a parte escura são os firmes; a clara, os que estão em treino. As contas de cada dia ficam no Histórico, e os fatos que pedem ajuda, na aba Atenção.</p>'+
    '<p class="muted small-t">'+esc(niv)+'.'+(devs?' Aparelhos usados (sessões): '+devs+'.':'')+'</p></details></div>';
}
/* ---------- Trilha Turbo no Histórico e na Atenção ----------
   Histórico: as contas de cada dia entram na página do dia. Lê turbo_log (migracoes/2026-11-18-turbo-historico.sql), gravado sempre, sem depender
   do consentimento. Sem a tabela, o Histórico segue só com as folhas.
   Atenção: fatos teimosos, fatos mais demorados e o que está em treino agora. */
var TURBO_ESTADO=["Na fila","Novo","Aprendendo","Consolidando","Quase firme","Firme"];
var TURBO_OP={"+":"soma","-":"sub","×":"mult","÷":"div"};
function turboConta(fid,ans,ok){
  var f=FC.turbo.porId(fid);if(!f)return esc(fid);
  return '<span class="num">'+esc(f.eq)+' = '+(ok?'<b>'+f.res+'</b> <span class="turbo-ok" aria-label="acertou">✓</span>':'<s>'+(ans==null?"–":ans)+'</s> <b>'+f.res+'</b>'+(ans==null?' <span class="muted small-t">(não sei)</span>':''))+'</span>';
}
/* Devolve {dia: {rows:[contas na ordem em que ele fez], ok:acertos}} ou null se não houver registro da Turbo. */
async function loadTurboLog(id){
  if(!FC.turbo||TURBO_OK===false)return null;
  try{
    var r=await sb.from("turbo_log").select("id,study_day,fact_id,kind,ok,answer").eq("student_id",id).order("id",{ascending:false}).limit(1000);
    if(r.error)return null;
    var by={};
    r.data.slice().reverse().forEach(function(x){var d=by[x.study_day]||(by[x.study_day]={rows:[],ok:0});d.rows.push(x);if(x.ok)d.ok++});
    return by;
  }catch(e){return null}
}
function turboAtencao(t){
  if(!t||!FC.turbo)return "";
  var T=FC.turbo,sum=t.sum||{};
  function chips(ids){return ids.map(function(id){var f=T.porId(id);return f?'<span class="tag num">'+esc(f.eq)+'</span>':""}).join(" ")}
  var stub=sum.stubborn||[],slow=(sum.slowest||[]).filter(function(id){return stub.indexOf(id)<0});
  return '<div class="panel" id="turboAt"><div class="eyebrow">Trilha Turbo</div>'+
    (stub.length?'<div class="gap"><b>Fatos teimosos</b><p class="muted small-t">Ele já tinha aprendido e voltou a errar. A Turbo traz de volta com uma dica.</p><div class="tp-chips">'+chips(stub)+'</div></div>':'')+
    (slow.length?'<div class="gap"><b>Fatos mais demorados</b><p class="muted small-t">Os que ele ainda leva mais tempo para responder.</p><div class="tp-chips">'+chips(slow)+'</div></div>':'')+
    (!stub.length&&!slow.length?'<p class="muted gap">Nenhum fato da Turbo pede atenção agora.</p>':'')+
    '<div id="turboNow"></div></div>';
}
/* O que ele treina agora na Turbo (novas, aprendendo, consolidando), por operação. Fica fechado: é consulta, não alerta. */
async function loadTurboNow(id){
  var box=$("#turboNow");if(!box)return;
  var r;try{r=await sb.from("turbo_facts").select("fact_id,state,due").eq("student_id",id).gte("state",1).lte("state",3).order("due",{ascending:true})}catch(e){return}
  if(r.error||!r.data||!r.data.length)return;
  var T=FC.turbo,cat=T.catalogo(),now={};
  r.data.forEach(function(x){var op=TURBO_OP[x.fact_id.charAt(0)];if(op)(now[op]=now[op]||[]).push(x)});
  var html=T.ORDEM.filter(function(o){return now[o]}).map(function(o){
    var l=now[o],shown=l.slice(0,24).map(function(x){var f=T.porId(x.fact_id);return f?'<span class="tag num">'+esc(f.eq)+' <small class="muted">· '+esc(TURBO_ESTADO[x.state].toLowerCase())+'</small></span>':""}).join(" ");
    return '<div class="gap"><b>'+esc(cat[o].nome)+'</b> <span class="muted small-t">· '+l.length+' em treino</span><div class="tp-chips">'+shown+(l.length>24?' <span class="muted small-t">+'+(l.length-24)+'</span>':'')+'</div></div>';
  }).join("");
  box.innerHTML='<details class="gap"><summary>Fatos em treino agora ('+r.data.length+')</summary>'+html+'</details>';
}
/* Configuração no cadastro e no programa: pular o jogo de nivelamento e escolher quais operações podem abrir. */
function turboFields(s){
  if(TURBO_OK===false||!FC.turbo)return "";
  var T=FC.turbo,cfg=s&&s._turbo,unl=(cfg&&cfg.unlocked)||["soma"],feito=!!(cfg&&cfg.placement),pula=!!(cfg&&cfg.skip_placement);
  var ops=T.ORDEM.map(function(o){
    return '<label class="chk"><input type="checkbox" name="tops" value="'+o+'"'+(o==="soma"||unl.indexOf(o)>=0?" checked":"")+(o==="soma"?" disabled":"")+'><span>'+esc(T.catalogo()[o].nome)+'</span></label>'}).join("");
  return '<details class="adv" id="pTurbo"><summary>Trilha Turbo: nivelamento e operações</summary><div class="adv-body">'+
    '<label class="consent-chk"><input type="checkbox" id="pTurboSkip"'+(pula?" checked":"")+(feito?" disabled":"")+'><span>Pular o jogo de nivelamento da primeira entrada</span></label>'+
    '<small>'+(feito?"O nivelamento já foi feito.":"O jogo leva uns 5 minutos e descobre por onde a criança começa na Turbo. Se pular, ela começa do primeiro fato.")+'</small>'+
    '<fieldset class="field"><legend>Operações que a Turbo pode abrir</legend><div class="chks">'+ops+'</div>'+
    '<small>A soma é sempre liberada. Cada operação só abre quando a base dela está firme (85% dos fatos). Subtração, multiplicação e divisão ainda estão em teste.</small></fieldset></div></details>';
}
function readTurbo(){
  var box=$("#pTurbo");if(!box)return null;
  var skip=$("#pTurboSkip"),unl=["soma"].concat($$('input[name="tops"]:checked',box).map(function(c){return c.value}).filter(function(o){return o!=="soma"}));
  return{unlocked:unl,skip:skip&&!skip.disabled?skip.checked:null};
}
async function saveTurbo(id,t){
  if(!t)return true;
  try{
    var ex=await sb.from("turbo_students").select("student_id").eq("student_id",id).maybeSingle();
    if(ex.error)return false;
    var patch={unlocked:t.unlocked};if(t.skip!=null)patch.skip_placement=t.skip;
    var r=ex.data?await sb.from("turbo_students").update(patch).eq("student_id",id):await sb.from("turbo_students").insert(Object.assign({student_id:id},patch));
    return !r.error;
  }catch(e){return false}
}

/* Endereços da área dos pais: #/ (lista), #/novo, #/cadastrado, #/aluno/ID/ABA e #/aluno/ID/historico/AAAA-MM-DD (um dia do Histórico). */
var PAI_TABS=["resumo","album","historico","dificuldades","programa","acesso"];
function route(path){
  if(!U.user)return;
  var m=/^\/aluno\/([A-Za-z0-9_-]{1,64})(?:\/([a-z]+)(?:\/(\d{4}-\d\d-\d\d))?)?$/.exec(path);
  if(path==="/novo")return showForm();
  if(path==="/planos")return showPlans();
  if(path==="/perfil")return showProfile();
  if(m){
    var tab=m[2];
    if(PAI_TABS.indexOf(tab)>=0){FC.tabState.pai=tab;try{sessionStorage.setItem("fc_tab_pai",tab)}catch(e){}}
    var day=FC.tabState.pai==="historico"&&m[3]?m[3]:null;
    if(U.detail===m[1]&&FC.$('.shell[data-scope="pai"]')){
      FC.gotoTab(FC.tabState.pai,true);
      if(U.hist&&U.hist.id===m[1]&&U.hist.day!==day){U.hist.day=day;U.hist.render()}
      return;
    }
    return detail(m[1],day);
  }
  dash();   // "/", "/cadastrado" e qualquer endereço desconhecido
}
function start(){
  var p=FC.nav.path();
  if(p!=="/")FC.nav.seed("/");   // entrou por um endereço de dentro do app: o voltar leva para a lista
  route(p);
}
FC.adultApp=async function(){
  FC.nav.handler=route;
  sb.auth.onAuthStateChange(function(ev){
    if(ev==="SIGNED_OUT"){U.user=null;showAuth("login")}
    if(ev==="PASSWORD_RECOVERY")showNewPassword();
  });
  var recovery=/type=recovery/.test(location.hash);
  var r=await sb.auth.getSession();
  if(recovery&&r.data.session){U.user=r.data.session.user;return showNewPassword()}
  if(r.data.session){U.user=r.data.session.user;return start()}
  showAuth("login");
};

function topbar(extra){
  var name=U.profile?esc(U.profile.name||"")+(U.profile.role==="professor"?" · professor(a)":" · responsável"):"";
  return '<header class="appbar"><img src="icons/icon-192.png" alt=""><div class="grow"><b>Folhinha VIP</b><small>'+(extra||"Painel para pais e professores")+'</small></div>'+
    (U.user?'<div class="who"><span class="who-name">'+name+'</span><button type="button" class="iconbtn" id="profileBtn" aria-label="Meu perfil" title="Meu perfil">'+FC.icon("user")+'</button><button class="btn ghost small" id="logout">Sair</button></div>':'')+'</header>';
}
function bindTop(){var b=$("#logout");if(b)b.onclick=function(){sb.auth.signOut()};var pf=$("#profileBtn");if(pf)pf.onclick=showProfile}
function errScreen(e,retry){
  FC.render(topbar()+'<div class="panel center"><h1>Não deu para carregar</h1><p class="muted">'+esc(FC.err(e))+'</p><p><button class="btn" id="retry">Tentar de novo</button></p></div>');
  bindTop();$("#retry").onclick=retry||dash;
}

/* ---------- entrar / cadastrar ---------- */
function showAuth(tab,msg,ok){
  FC.nav.reset();
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
  FC.nav.reset();
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
  var prof,students,sheets,tdays=null;
  try{
    if(!U.user){var g=await sb.auth.getUser();if(g.error||!g.data.user)return showAuth("login");U.user=g.data.user}
    var res=await Promise.all([
      q(sb.from("profiles").select("name,role").eq("id",U.user.id).maybeSingle()),
      q(sb.from("students").select("*").order("created_at")),
      q(sb.from("sheets").select("student_id,study_day").eq("status","done").gte("study_day",FC.addDays(FC.today(),-60)))]);
    prof=res[0];students=res[1];sheets=res[2];
    await Promise.all([ensurePub(),loadPlan()]);
    if(FC.turbo){try{var tdr=await sb.from("turbo_days").select("student_id,status,attempts").eq("study_day",FC.today());if(!tdr.error)tdays=tdr.data||[]}catch(e){}}   // a linha da Turbo é um extra: se falhar, a lista abre igual
  }catch(e){return errScreen(e,dash)}
  U.profile=prof||{name:"",role:"pai"};
  var today=FC.today(),cards=students.map(function(s){
    var L=FC.LEVELS[s.level_idx],sk=FC.streakNow(s,today),need=(PUB&&PUB.stamps_needed)||5,pct=Math.min(100,Math.round(100*Math.min(s.stamps,need)/need));
    var kind=FC.dayKind(s,today),done=todayDone(s,sheets);
    var st=today<s.start_date?"Começa em "+FC.dm(s.start_date):kind!=="rest"?"Hoje"+(kind==="free"?" (dia livre)":"")+": "+done+" de "+quotaOf(s)+" folhas":"Hoje: descanso";
    var tl="";
    if(tdays&&kind!=="rest"&&today>=s.start_date&&!studentFree(s)){   // no Grátis a Turbo é trancada: a linha não aparece
      var tr=tdays.filter(function(x){return x.student_id===s.id})[0];
      tl=tr&&tr.status==="done"?"Turbo de hoje: concluída":tr&&tr.attempts>0?"Turbo de hoje: em andamento":"Turbo de hoje: ainda não feita";
    }
    return '<div class="cardwrap"><button type="button" class="card-qr" data-qr="'+s.id+'" title="Mostrar o QR Code do aluno" aria-label="Mostrar o QR Code de '+esc(s.name)+'">'+FC.icon("qr")+'</button><a class="card-open" href="'+esc(linkFor(s.link_code))+'" target="_blank" rel="noopener" title="Abrir a página do aluno em outra aba" aria-label="Abrir a página de '+esc(s.name)+' em outra aba">'+FC.icon("external")+'</a>'+
      '<button class="panel card" data-id="'+s.id+'"><div class="card-top"><b class="card-name">'+esc(s.name)+'</b><span class="lvlchip">Nível '+L.id+'</span></div>'+
      '<div class="muted">'+esc(L.name)+'</div><div class="muted small-t">'+esc(anoLine(s,L,today))+'</div><div class="muted small-t">'+st+'</div>'+(tl?'<div class="muted small-t">'+tl+'</div>':'')+
      '<div class="bar"><i style="width:'+pct+'%"></i></div><div class="small-t">'+Math.min(s.stamps,need)+' de '+need+' carimbos · '+sk+' dia'+(sk===1?"":"s")+' seguido'+(sk===1?"":"s")+'</div>'+
      (s.albums_done_at?'<div class="tag ok card-done">Álbuns completos: liberar mais?</div>':'')+'</button></div>';
  }).join("");
  FC.render(topbar()+'<div class="section-head"><h1>Meus alunos</h1><div class="actions"><button class="btn" id="newStudent">Cadastrar aluno</button></div></div>'+
    (students.length?'<div class="cards">'+cards+'</div>':'<div class="panel center"><h2>Nenhum aluno ainda</h2><p class="muted">Cadastre o primeiro aluno, informe o nível dele e monte o programa de estudos. O sistema gera um link para ele entrar.</p></div>')+
    '<details class="panel"><summary>Tenho um convite de outro adulto</summary><form id="invForm" class="form inline"><label class="field grow">Código do convite<input id="invCode" maxlength="12" autocomplete="off" placeholder="Ex.: 3F9A1C20"></label><button class="btn" type="submit">Entrar no aluno</button></form><p class="msg bad" id="invMsg" role="alert"></p></details>'+FC.installBox());
  U.detail=null;FC.nav.at("/");
  bindTop();FC.refreshInstall();
  $("#newStudent").onclick=function(){
    /* Limite de alunos do plano: explica antes de abrir o formulário (o banco recusa do mesmo jeito) */
    if(PLAN&&PLAN.students>=PLAN.max_students){
      var ov=FC.overlay('<h2>Limite de alunos do plano</h2><p class="muted">'+(PLAN.vip?'Seu plano permite '+PLAN.max_students+' aluno'+(PLAN.max_students===1?'':'s')+'.':'No plano Grátis você cadastra 1 criança. No VIP, a família cadastra até '+planLim("alunos_vip",4)+'.')+'</p>'+
        '<div class="actions"><button class="btn" id="ovPlans">Ver planos</button></div>',{button:"Fechar"});
      $("#ovPlans",ov.el).onclick=function(){ov.close();showPlans()};return;
    }
    showForm(null);
  };
  $$(".card").forEach(function(c){c.onclick=function(){openStudent(c.getAttribute("data-id"))}});
  $$("[data-qr]").forEach(function(b){b.onclick=function(){
    var s=students.filter(function(x){return x.id===b.getAttribute("data-qr")})[0];if(s)showQr(s.name,linkFor(s.link_code));
  }});
  $("#invForm").onsubmit=async function(e){
    e.preventDefault();var code=$("#invCode").value.trim();if(!code)return;
    var r=await sb.rpc("redeem_invite",{p_code:code});
    if(r.error){$("#invMsg").textContent=FC.err(r.error);return}
    FC.toast("Agora você acompanha "+r.data.name+".");dash();
  };
}

/* ---------- formulário do programa (cadastro e edição) ---------- */
/* Tempo aproximado de estudo por dia: de (folhas × tempo do dia de ouro) a (folhas × meta do nível), em minutos. */
function studyMinutes(levelIdx,perDay){
  var L=FC.LEVELS[levelIdx]||FC.LEVELS[0],fast=((PUB&&PUB.ouro_tempo)||80)/100;
  var lo=Math.max(1,Math.round(perDay*L.target*fast/60));
  return{L:L,lo:lo,hi:Math.max(lo,Math.round(perDay*L.target/60))};
}
function studyTimeText(levelIdx,perDay){
  var m=studyMinutes(levelIdx,perDay),L=m.L,lo=m.lo,hi=m.hi;
  return 'Tempo aproximado: '+(lo===hi?'<b>cerca de '+lo+' minuto'+(lo===1?'':'s')+'</b>':'de <b>'+lo+' a '+hi+' minutos</b>')+' de estudo por dia, no nível '+L.id+' (meta de '+FC.fmtTime(L.target)+' por folha). Muda conforme o nível dele.';
}
/* Nível escolhido no formulário: o do campo "Avançado" ou, se ficou em "Início do ano", o primeiro nível do ano escolhido. -1 = ainda sem ano. */
function chosenLevel(){
  var lv=FC.$("#pLevel"),ano=FC.$("#pAno");if(!lv)return -1;
  if(lv.value!=="")return Number(lv.value);
  return ano&&ano.value!==""?FC.primeiroNivelDoAno(Number(ano.value)):-1;
}
/* Dias da semana por extenso: "de segunda a sexta", "no fim de semana" ou a lista. */
function diasTxt(a){
  var k=a.slice().sort(function(x,y){return x-y}),j=k.join();
  if(j==="1,2,3,4,5")return "de segunda a sexta";
  if(j==="0,6")return "no fim de semana";
  if(k.length===7)return "todos os dias";
  return k.map(function(i){return FC.DOW[i]}).join(", ");
}
/* Linha-resumo da tela normal: o que o padrão (ou a escolha da seção Avançado) significa na prática. */
function resumoHtml(lv,per,sd,fd){
  var m=studyMinutes(Math.max(0,lv),per);
  return 'Estuda <b>'+diasTxt(sd)+'</b>, <b>'+per+' folhas</b> por dia (cerca de '+(m.lo===m.hi?m.lo+' min':m.lo+' a '+m.hi+' min')+'). '+
    (fd.length?'<b>'+(fd.slice().sort(function(x,y){return x-y}).join()==="0,6"?"Fim de semana livre":"Dias livres: "+fd.slice().sort(function(x,y){return x-y}).map(function(i){return FC.DOW[i]}).join(", "))+'</b>: joga se quiser, sem perder a sequência. ':'Sem dias livres. ')+
    '<button type="button" class="linkbtn" id="pMudar">Mudar</button>';
}
function checkedVals(name){return FC.$$('input[name="'+name+'"]:checked').map(function(c){return Number(c.value)})}
function refreshProgramInfo(){
  var h=FC.$("#pTime"),per=FC.$("#pPer"),lv=chosenLevel(),r=FC.$("#pResumo");
  if(!per)return;
  if(h&&lv>=0)h.innerHTML=studyTimeText(lv,Number(per.value));
  if(r){
    r.innerHTML=resumoHtml(lv,Number(per.value),checkedVals("days"),checkedVals("free"));
    var b=FC.$("#pMudar");if(b)b.onclick=function(){var d=FC.$("#pAdv");d.open=true;d.scrollIntoView({block:"start",behavior:"smooth"})};
  }
}
document.addEventListener("change",function(e){
  var t=e.target;if(!t)return;
  /* um dia é de estudo OU livre: marcar em uma lista desmarca na outra */
  if((t.name==="days"||t.name==="free")&&t.checked){
    var o=FC.$('input[name="'+(t.name==="days"?"free":"days")+'"][value="'+t.value+'"]');if(o)o.checked=false;
  }
  if(t.id==="pPer"||t.id==="pLevel"||t.id==="pAno"||t.name==="days"||t.name==="free")refreshProgramInfo();
});
var PF_FREE=false,PF_ORIG=0;   /* o formulário aberto é de um aluno do plano Grátis? e quantos álbuns ele já tinha */
function albunsTxt(){var n=planLim("albuns_gratis",1);return n+" álbum"+(n===1?"":"s")}
function programFields(s){
  PF_FREE=s?studentFree(s):!!(PLAN&&!PLAN.vip);PF_ORIG=s&&s.sticker_themes?s.sticker_themes.length:0;
  var v=s||{name:"",level_idx:0,start_date:FC.today(),study_days:[1,2,3,4,5],sheets_per_day:5,sticker_themes:["dinossauros"]};
  var lv=s?"":'<option value="" selected>Início do ano escolhido (recomendado)</option>',lastG=null;
  FC.LEVELS.forEach(function(l,i){
    if(l.group!==lastG){if(lastG!==null)lv+="</optgroup>";lv+='<optgroup label="'+esc(l.group)+'">';lastG=l.group}
    lv+='<option value="'+i+'"'+(s&&i===v.level_idx?" selected":"")+'>'+l.id+" · "+esc(l.name)+'</option>';
  });
  lv+="</optgroup>";
  var fr=(v.free_days||(s?[]:[0,6])).filter(function(d){return v.study_days.indexOf(d)<0});
  var days=FC.DOW.map(function(d,i){return '<label class="chk"><input type="checkbox" name="days" value="'+i+'"'+(v.study_days.indexOf(i)>=0?" checked":"")+'><span>'+d+'</span></label>'}).join("");
  var free=FC.DOW.map(function(d,i){return '<label class="chk"><input type="checkbox" name="free" value="'+i+'"'+(fr.indexOf(i)>=0?" checked":"")+'><span>'+d+'</span></label>'}).join("");
  var chosen=v.sticker_themes||[v.sticker_theme||"dinossauros"];
  var anoNow=s?FC.anoAluno(s,FC.today(),PUB)||s.ano_escolar:null,ao='<option value=""'+(anoNow?"":" selected")+' disabled>Escolha o ano</option>',anosOk=FC.anosComGrade();
  for(var a=1;a<=9;a++)if(anosOk.indexOf(a)>=0||anoNow===a)ao+='<option value="'+a+'"'+(anoNow===a?" selected":"")+'>'+a+'º ano</option>';
  var pad=(PUB&&PUB.teto_anos_padrao!=null)?PUB.teto_anos_padrao:1,tt=v.teto_anos==null?"":String(v.teto_anos);
  var to='<option value=""'+(tt===""?" selected":"")+'>Padrão: até '+pad+' ano'+(pad===1?"":"s")+' à frente</option>';
  [[0,"Só o conteúdo do ano dele"],[1,"Até 1 ano à frente"],[2,"Até 2 anos à frente"],[3,"Até 3 anos à frente"],[99,"Sem limite"]].forEach(function(o){
    to+='<option value="'+o[0]+'"'+(tt===String(o[0])?" selected":"")+'>'+o[1]+'</option>'});
  var per="";for(var i=MIN_SHEETS;i<=10;i++)per+='<option value="'+i+'"'+(i===v.sheets_per_day?" selected":"")+'>'+i+'</option>';
  var lv0=s?v.level_idx:Math.max(0,FC.primeiroNivelDoAno(anosOk[0]));
  /* Tela normal: só o essencial. O resto vai para a seção "Avançado", já com o padrão certo. */
  return '<label class="field">Nome do aluno<input id="pName" maxlength="40" value="'+esc(v.name)+'" required></label>'+
    '<label class="field">Ano escolar<select id="pAno" required>'+ao+'</select><small>'+(s?'O ano é atualizado sozinho na virada do ano, sem mexer no nível dele.':'Ele começa pelo início desse ano e avança mais rápido se for dominando o conteúdo. O ano é atualizado sozinho na virada do ano.')+'</small></label>'+
    '<p class="resumo" id="pResumo">'+resumoHtml(lv0,v.sheets_per_day,v.study_days,fr)+'</p>'+
    '<fieldset class="field" id="pThemes"><legend>Álbuns liberados para a criança</legend>'+
      '<div class="alb-sum" id="pThemeSum"></div>'+
      '<div class="actions"><button type="button" class="btn ghost" id="thOpen">Ver álbuns</button></div>'+
      '<small id="pThemeHint"></small>'+(PF_FREE?'<small class="plan-note">No plano Grátis a criança tem '+albunsTxt()+'. Com o VIP, todos os álbuns.</small>':'')+
      '<div id="thStore" hidden>'+FC.THEMES.map(function(t){return '<input type="checkbox" name="themes" value="'+t.id+'"'+(chosen.indexOf(t.id)>=0?" checked":"")+'>'}).join("")+'</div></fieldset>'+
    '<fieldset class="field consent" id="pConsentBox"><legend>Dados de estudo</legend>'+
      '<label class="consent-chk"><input type="checkbox" id="pConsent"'+(s&&s.consent_at?" checked":"")+'><span>Autorizo guardar os dados de estudo do aluno (tempo e acertos em cada conta, folhas feitas e uso do aplicativo) para melhorar o sistema.</span></label>'+
      '<small>Os dados ficam sem o nome do aluno, só o administrador do sistema os vê, e a autorização pode ser retirada a qualquer momento nesta tela.'+(s&&s.consent_at?' Autorizado em '+esc(new Date(s.consent_at).toLocaleDateString("pt-BR"))+'.':'')+'</small></fieldset>'+
    '<details class="adv" id="pAdv"><summary>Avançado: nível, limite, dias e folhas por dia</summary><div class="adv-body">'+
      '<label class="field">Nível em que ele está<select id="pLevel">'+lv+'</select><small>'+(s?'Só mude para corrigir o ponto em que ele está. Ao mudar, os carimbos do nível voltam a zero.':'Deixe em "Início do ano" na maioria dos casos. Só escolha outro nível se souber que ele já domina o conteúdo anterior.')+'</small></label>'+
      '<label class="field">Quanto ele pode avançar<select id="pTeto">'+to+'</select><small>Limite de conteúdo à frente do ano escolar. Só vale se o ano for informado.</small></label>'+
      '<div class="two"><label class="field">Começa a estudar em<input id="pStart" type="date" value="'+v.start_date+'" required></label>'+
      '<label class="field">Folhas por dia<select id="pPer">'+per+'</select><small>Mínimo: '+MIN_SHEETS+' folhas por dia.'+(PF_FREE?' No plano Grátis valem '+planLim("folhas_gratis",2)+' por dia; o programa completo volta com o VIP.':'')+'</small></label></div>'+
      '<small id="pTime">'+studyTimeText(lv0,v.sheets_per_day)+'</small>'+
      '<fieldset class="field"><legend>Dias de estudo</legend><div class="chks">'+days+'</div><small id="pDaysHint">Têm a cota de folhas e contam para a sequência de perseverança. Mínimo: '+MIN_DAYS+' dias por semana.</small></fieldset>'+
      '<fieldset class="field"><legend>Dias livres</legend><div class="chks">'+free+'</div><small>Nesses dias a criança pode jogar, com a mesma cota, mas não precisa: faltar não perde a sequência. Carimbo e pacotinhos valem normalmente.</small></fieldset>'+
    '</div></details>'+turboFields(s)+
    '<details class="adv"><summary>Ver como o aluno avança</summary>'+rulesBox()+'</details>';
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
/* Resumo dos álbuns liberados na tela do programa (a escolha fica na tela "Ver álbuns", para não poluir o formulário). */
function themeSummary(){
  var on=$$('#thStore input[name="themes"]:checked').map(function(c){return c.value}),box=$("#pThemeSum"),h=$("#pThemeHint");
  if(!box)return;
  box.innerHTML=on.length?'<div class="alb-thumbs">'+on.slice(0,6).map(function(id){return FC.themeCapa(id)}).join("")+(on.length>6?'<span class="muted">+'+(on.length-6)+'</span>':"")+'</div>'+
      '<p class="small-t"><b>'+on.length+(on.length>1?" álbuns liberados":" álbum liberado")+'</b>: '+on.map(function(id){return esc(FC.theme(id).name)}).join(", ")+'.</p>':'<p class="small-t bad">Nenhum álbum liberado.</p>';
  var over=PF_FREE&&on.length>planLim("albuns_gratis",1)&&on.length>PF_ORIG;
  if(h&&over){h.textContent="No plano Grátis a criança tem "+albunsTxt()+": deixe só "+(planLim("albuns_gratis",1)===1?"um marcado":"esses marcados")+".";h.className="bad";return}
  if(h){h.textContent=on.length===0?"Marque pelo menos 1 álbum.":on.length>deskLimit()?"A criança escolhe "+deskLimit()+" para começar na mesa; os outros esperam na gaveta.":"";h.className=on.length===0?"bad":""}
}
/* Detalhes do álbum: descrição, o que aparece nas cartas e uma amostra fixa de cartas comuns. Nunca mostra o álbum inteiro nem as raras. */
function albumDetail(id){
  var th=FC.theme(id),cells=FC.sampleSlots(th.id).map(function(sl){return FC.stickerHtml(th.id,sl)}).join("");
  FC.overlay('<h2>'+esc(th.name)+'</h2><div class="album-head">'+FC.themeCapa(th.id)+'<p class="grow">'+esc(th.desc)+'</p></div>'+
    '<h3 class="gap">O que aparece em cada carta</h3><ul class="plain">'+FC.cardFields(th.id).map(function(f){return '<li>'+esc(f)+'</li>'}).join("")+'</ul>'+
    '<h3 class="gap">Algumas cartas de exemplo</h3><div class="album sample">'+cells+'</div>'+
    '<p class="muted small-t gap">O álbum tem '+FC.ALBUM_SIZE+' figurinhas. Estas são só uma amostra: a criança descobre as outras, inclusive as raras, ao ganhar os pacotinhos.</p>',{wide:true});
}
/* Tela "Ver álbuns": grade de capas para marcar os álbuns liberados (quantos quiser, pelo menos 1). Só vale ao tocar em Pronto. */
function openAlbums(){
  var cur=$$('#thStore input[name="themes"]:checked').map(function(c){return c.value});
  var ov=FC.overlay('<h2>Álbuns da criança</h2><p class="muted small-t">Marque os álbuns que a criança poderá conquistar, quantos quiser (pelo menos 1). Ela escolhe quais ficam na mesa (até '+deskLimit()+' por vez) e os outros esperam na gaveta. Toque em Detalhes para entender cada álbum.</p>'+
    (FC.THEMES.length>THEME_SEARCH_FROM?'<div class="theme-filter"><input type="search" id="thQ" placeholder="Buscar álbum" aria-label="Buscar álbum"><select id="thCat" aria-label="Categoria"><option value="">Todas as categorias</option>'+
      FC.THEMES.map(function(t){return FC.catOf(t.id)}).filter(function(c,i,a){return a.indexOf(c)===i}).map(function(c){return '<option>'+esc(c)+'</option>'}).join("")+'</select></div>':"")+
    '<div class="album-grid" id="thGrid">'+FC.THEMES.map(function(t){
      return '<div class="alb-opt" data-name="'+esc(t.name.toLowerCase())+'" data-cat="'+esc(FC.catOf(t.id))+'"><input type="checkbox" class="thx" value="'+t.id+'" id="thx_'+t.id+'"'+(cur.indexOf(t.id)>=0?" checked":"")+'>'+
        '<label class="alb-capa" for="thx_'+t.id+'">'+FC.themeCapa(t.id)+'<span class="alb-check" aria-hidden="true">✓</span></label>'+
        '<label class="alb-name" for="thx_'+t.id+'">'+esc(t.name)+'</label><button type="button" class="btn ghost small" data-view="'+t.id+'">Detalhes</button></div>'}).join("")+'</div>'+
    '<div class="alb-tools"><button type="button" class="btn ghost small" id="thAll">Marcar todos</button><button type="button" class="btn ghost small" id="thNone">Desmarcar todos</button></div>'+
    '<p class="small-t" id="thxHint"></p><div class="actions"><button type="button" class="btn" id="thDone">Pronto</button></div>',{wide:true,button:"Cancelar"});
  var el=ov.el;
  function marked(){return $$("input.thx:checked",el)}
  function hint(){var n=marked().length,h=$("#thxHint",el);h.textContent=n===0?"Marque pelo menos 1 álbum.":n+(n>1?" álbuns marcados.":" álbum marcado.");h.className="small-t"+(n===0?" bad":"")}
  $$("input.thx",el).forEach(function(c){c.addEventListener("change",hint)});
  function shown(){return $$("#thGrid .alb-opt",el).filter(function(o){return !o.hidden})}
  function setAll(on){shown().forEach(function(o){o.querySelector("input").checked=on});hint()}
  $("#thAll",el).onclick=function(){setAll(true)};$("#thNone",el).onclick=function(){setAll(false)};
  function filt(){
    var s=($("#thQ",el)?$("#thQ",el).value:"").trim().toLowerCase(),c=$("#thCat",el)?$("#thCat",el).value:"";
    $$("#thGrid .alb-opt",el).forEach(function(o){o.hidden=!!((s&&o.getAttribute("data-name").indexOf(s)<0)||(c&&o.getAttribute("data-cat")!==c))});
  }
  if($("#thQ",el)){$("#thQ",el).oninput=filt;$("#thCat",el).onchange=filt}
  $$("[data-view]",el).forEach(function(b){b.onclick=function(){albumDetail(b.getAttribute("data-view"))}});
  $("#thDone",el).onclick=function(){
    var ids=marked().map(function(c){return c.value});
    if(!ids.length){hint();return}
    $$('#thStore input[name="themes"]').forEach(function(c){c.checked=ids.indexOf(c.value)>=0});
    themeSummary();ov.close();
  };
  hint();
}
function bindProgram(){
  themeSummary();
  if($("#thOpen"))$("#thOpen").onclick=openAlbums;
  function upd(){
    var n=$$('input[name="days"]:checked').length;
    $("#pDaysHint").textContent=n<MIN_DAYS?"Marque pelo menos "+MIN_DAYS+" dias de estudo por semana.":"Têm a cota de folhas e contam para a sequência de perseverança. Mínimo: "+MIN_DAYS+" dias por semana.";
    $("#pDaysHint").className=n<MIN_DAYS?"bad":"";
  }
  $$('input[name="days"]').forEach(function(c){c.onchange=upd});
  upd();refreshProgramInfo();
}
function readProgram(){
  var days=$$('input[name="days"]:checked').map(function(c){return Number(c.value)}),name=$("#pName").value.trim();
  if(!name)return{error:"Digite o nome do aluno."};
  if(days.length<MIN_DAYS)return{error:"Marque pelo menos "+MIN_DAYS+" dias de estudo por semana."};
  if(Number($("#pPer").value)<MIN_SHEETS)return{error:"O mínimo é de "+MIN_SHEETS+" folhas por dia."};
  if(!$("#pStart").value)return{error:"Informe a data de início."};
  var themes=$$('input[name="themes"]:checked').map(function(c){return c.value});
  if(!themes.length)return{error:"Marque pelo menos um álbum de figurinhas."};
  if(PF_FREE&&themes.length>planLim("albuns_gratis",1)&&themes.length>PF_ORIG)return{error:"No plano Grátis a criança tem "+albunsTxt()+". Com o VIP, todos os álbuns ficam liberados."};
  var consent=!!($("#pConsent")&&$("#pConsent").checked);
  var anoV=$("#pAno").value,tetoV=$("#pTeto").value;
  if(anoV==="")return{error:"Escolha o ano escolar."};
  var lvl=chosenLevel();
  if(lvl<0)return{error:"A grade ainda não tem o "+anoV+"º ano. Escolha outro ano."};
  return{v:{name:name,level_idx:lvl,start_date:$("#pStart").value,study_days:days,free_days:checkedVals("free").filter(function(d){return days.indexOf(d)<0}),
    sheets_per_day:Number($("#pPer").value),sticker_themes:themes,sticker_theme:themes[0],
    ano_escolar:anoV===""?null:Number(anoV),teto_anos:tetoV===""?null:Number(tetoV),consent:consent},turbo:readTurbo()};
}

async function showForm(){
  await ensurePub();
  FC.render(topbar("Novo aluno")+'<div class="panel"><form id="stForm" class="form" novalidate><h1>Cadastrar aluno</h1>'+programFields(null)+
    '<p class="msg bad" id="fMsg" role="alert"></p><div class="actions"><button class="btn" type="submit" id="fBtn">Cadastrar e gerar link</button><button class="btn ghost" type="button" id="fBack">Voltar</button></div></form></div>');
  FC.nav.at("/novo");
  bindTop();bindProgram();$("#fBack").onclick=function(){if(!FC.nav.up("/"))dash()};
  $("#stForm").onsubmit=async function(e){
    e.preventDefault();var r=readProgram();
    if(r.error){$("#fMsg").textContent=r.error;return}
    if(!r.v.consent){$("#fMsg").textContent="Para cadastrar, marque a autorização dos dados de estudo.";return}
    $("#fBtn").disabled=true;
    var res=await sb.rpc("create_student",{p_name:r.v.name,p_level:r.v.level_idx,p_start:r.v.start_date,p_days:r.v.study_days,
      p_per_day:r.v.sheets_per_day,p_close:0,p_goal:0,p_reward:"",p_repeat:"reforco",p_stamps:5,p_theme:r.v.sticker_theme,p_themes:r.v.sticker_themes,p_ano:r.v.ano_escolar,p_teto:r.v.teto_anos,p_free:r.v.free_days,p_consent:true});
    if(res.error){$("#fBtn").disabled=false;$("#fMsg").textContent=FC.err(res.error);return}
    if(r.turbo&&!(await saveTurbo(res.data.id,r.turbo)))FC.toast("Aluno cadastrado, mas não deu para salvar a opção da Turbo. Ajuste na aba Programa.",true);
    created(r.v.name,res.data.link_code,res.data.id);
  };
}
/* QR Code do link do aluno: o aluno aponta a câmera do celular e abre a página dele. */
/* Desenha o QR Code (SVG) numa imagem PNG de fundo branco, para compartilhar como figura. */
function qrPng(svg){
  return new Promise(function(res){
    try{
      var img=new Image(),u=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));
      img.onload=function(){
        var c=document.createElement("canvas");c.width=c.height=720;var x=c.getContext("2d");
        x.fillStyle="#fff";x.fillRect(0,0,720,720);x.drawImage(img,0,0,720,720);URL.revokeObjectURL(u);
        try{c.toBlob(function(b){res(b)},"image/png")}catch(e){res(null)}
      };
      img.onerror=function(){res(null)};img.src=u;
    }catch(e){res(null)}
  });
}
function showQr(name,link){
  var svg="";
  try{var qr=qrcode(0,"M");qr.addData(link);qr.make();svg=qr.createSvgTag({cellSize:6,margin:4,alt:"QR Code do link de "+name,title:"QR Code"})}
  catch(e){svg=""}
  var text="Link da Folhinha VIP de "+name+": "+link,canShare=!!navigator.share;
  FC.overlay('<h2>QR Code de '+esc(name)+'</h2>'+(svg?'<div class="qr-box">'+svg+'</div>':'<p class="msg bad">Não deu para gerar o QR Code. Use o link.</p>')+
    '<p class="muted small-t">O aluno aponta a câmera do celular para o QR Code e abre a página dele (depois digita o PIN). Quem tiver este QR Code chega à página do aluno, então mostre só a quem deve usar.</p>'+
    '<div class="actions">'+(canShare?'<button class="btn" id="qrShare">'+FC.icon("share")+' Compartilhar</button>':
      '<a class="btn" id="qrWa" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(text)+'">WhatsApp</a><a class="btn ghost" id="qrMail" href="mailto:?subject='+encodeURIComponent("Folhinha VIP: "+name)+'&body='+encodeURIComponent(text)+'">E-mail</a>')+'</div>'+
    '<div class="linkrow"><input id="qrLnk" readonly value="'+esc(link)+'" aria-label="Link do aluno"><button class="btn small" id="qrCp">Copiar link</button></div>',{button:"Fechar"});
  $("#qrCp").onclick=function(){FC.copy(link,$("#qrLnk"))};
  if(canShare){
    /* Compartilhar pelo celular (WhatsApp, e-mail, redes sociais...): manda a figura do QR Code junto, quando o aparelho aceita arquivos. */
    var file=null;
    if(svg)qrPng(svg).then(function(b){if(b)try{file=new File([b],"qrcode-"+name.replace(/[^A-Za-z0-9]+/g,"-")+".png",{type:"image/png"})}catch(e){}});
    $("#qrShare").onclick=async function(){
      var data={title:"Folhinha VIP: "+name,text:text};
      if(file&&navigator.canShare&&navigator.canShare({files:[file]}))data.files=[file];
      try{await navigator.share(data)}
      catch(e){if(e&&e.name==="AbortError")return;   // a pessoa fechou a janela de compartilhar
        try{await navigator.share({title:data.title,text:text})}catch(x){if(!x||x.name!=="AbortError")FC.copy(link,$("#qrLnk"))}}
    };
  }
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
  FC.nav.at("/cadastrado",true);   // troca a entrada do formulário: voltar não reabre o formulário já enviado
  $("#go").onclick=function(){openStudent(id)};$("#all").onclick=function(){if(!FC.nav.up("/"))dash()};
}

/* ---------- página do aluno ---------- */
async function detail(id,day){
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
    await Promise.all([ensurePub(),loadPlan()]);
    var mv=await sb.from("level_moves").select("day,from_idx,to_idx,kind").eq("student_id",id).order("at",{ascending:false}).limit(8);
    if(!mv.error)moves=mv.data||[];
    profs=await q(sb.from("profiles").select("id,name,role").in("id",guards.map(function(g){return g.user_id})));
  }catch(e){return errScreen(e,function(){detail(id)})}
  var turbo=await turboLoad(id);s._turbo=turbo&&turbo.cfg;   // a Turbo nunca impede o painel de abrir
  var iAmOwner=guards.some(function(g){return g.user_id===U.user.id&&g.role==="owner"});
  var link=linkFor(s.link_code),today=FC.today(),L=FC.LEVELS[s.level_idx];
  var sk=FC.streakNow(s,today);
  var themeIds=s.sticker_themes&&s.sticker_themes.length?s.sticker_themes:[s.sticker_theme];
  var packsWaiting=awards.filter(function(a){return a.kind==="pacote"}).length;
  /* Os pais veem só a capa de cada álbum liberado e as figurinhas que a criança já conquistou: nunca as que ainda faltam
     (a criança pode pegar o celular do adulto e descobrir figurinhas antes de ganhar). */
  var doneNotice=s.albums_done_at?'<div class="panel offer"><b>'+esc(s.name)+' completou todos os álbuns!</b><p class="small-t">Ele não vai mais receber figurinhas, porque todos os álbuns liberados estão completos. Quer liberar outro álbum?</p><div class="actions"><button class="btn small" data-more="1">Liberar mais álbuns</button></div></div>':"";
  /* Mesmo formato da criança: capas com "3 de 52", abas Mesa e Gaveta; tocar na capa abre o álbum (capa grande + só as já conquistadas). */
  var gotBy={};
  themeIds.forEach(function(id){var seen={};gotBy[id]=awards.filter(function(a){if(a.kind!=="figurinha"||a.theme!==id||seen[a.slot])return false;seen[a.slot]=1;return true}).map(function(a){return{slot:a.slot,end:a.period_end}})});
  var fullIds=themeIds.filter(function(id){return gotBy[id].length>=FC.ALBUM_SIZE});
  var deskIds=(s.desk_themes&&s.desk_themes.length?s.desk_themes:themeIds.slice(0,2)).filter(function(id){return themeIds.indexOf(id)>=0&&fullIds.indexOf(id)<0});
  var drawerIds=themeIds.filter(function(id){return deskIds.indexOf(id)<0&&fullIds.indexOf(id)<0});
  var AL={sub:"mesa",open:null};
  function cap(id){return '<button type="button" class="cover-card" data-aopen="'+id+'" aria-label="'+esc(FC.theme(id).name)+', '+gotBy[id].length+' de '+FC.ALBUM_SIZE+'">'+FC.themeCapa(id)+'<span class="cover-badge num">'+gotBy[id].length+' de '+FC.ALBUM_SIZE+'</span></button>'}
  function grid(list,empty){return list.length?'<div class="cover-grid">'+list.map(cap).join("")+'</div>':'<p class="muted small-t">'+empty+'</p>'}
  function albPaneHtml(){
    if(AL.open){
      var id=AL.open,th=FC.theme(id),got=gotBy[id];
      return '<div class="pagehead"><button type="button" class="link crumb" data-aback>'+FC.icon("back")+'Álbuns</button></div>'+
        '<div class="album-big">'+FC.themeCapa(id)+'</div>'+
        '<div class="split gap"><b>'+esc(th.name)+'</b><span class="muted small-t num">'+got.length+' de '+FC.ALBUM_SIZE+(got.length>=FC.ALBUM_SIZE?' ✔':'')+'</span></div>'+
        '<div class="bar"><i style="width:'+Math.round(got.length/FC.ALBUM_SIZE*100)+'%"></i></div>'+
        '<p class="muted small-t gap">'+esc(th.desc)+'</p>'+
        (got.length?'<p class="muted small-t">Aqui aparecem só as figurinhas que a criança já conquistou. Toque em uma figurinha para ver o verso.</p><div class="gap">'+FC.albumHtml(id,got,{adult:true,only:true})+'</div>':'<p class="muted small-t gap">A criança ainda não conquistou nenhuma figurinha deste álbum.</p>');
    }
    var tabs='<div class="album-tabs" role="tablist">'+[["mesa","Mesa ("+deskIds.length+")"],["gaveta","Gaveta ("+(drawerIds.length+fullIds.length)+")"]].map(function(t){
      return '<button type="button" class="chip-btn'+(AL.sub===t[0]?" on":"")+'" role="tab" aria-selected="'+(AL.sub===t[0])+'" data-asub="'+t[0]+'">'+t[1]+'</button>'}).join("")+'</div>';
    return tabs+(AL.sub==="mesa"?grid(deskIds,"A mesa está vazia."):grid(drawerIds,"Nenhum álbum na gaveta.")+(fullIds.length?'<div class="eyebrow gap">Completos ('+fullIds.length+')</div>'+grid(fullIds,""):""));
  }
  var rewardPanel=doneNotice+'<div class="panel"><div class="eyebrow gap">Álbuns'+(themeIds.length>1?' ('+themeIds.length+')':'')+'</div>'+
    (packsWaiting?'<p class="small-t"><b>'+packsWaiting+' pacotinho'+(packsWaiting>1?'s':'')+'</b> esperando a criança escolher'+(themeIds.length>1?' o álbum':'')+'.</p>':'')+
    '<div id="albPane">'+albPaneHtml()+'</div></div>';

  /* pacotinhos ganhos, por origem (cada um ainda fechado ou já aberto em figurinha) */
  var by={carimbo:0,perseveranca:0,marco:0,boas_vindas:0};
  awards.forEach(function(a){if(a.source&&by[a.source]!=null)by[a.source]++});
  var packsHtml='<div class="panel"><div class="eyebrow gap">Pacotinhos ganhos</div><ul class="plain">'+
    '<li><b>'+by.carimbo+'</b> pelo carimbo do dia</li><li><b>'+by.perseveranca+'</b> pela perseverança (dia fechado)</li><li><b>'+by.marco+'</b> pelos marcos de sequência</li>'+(by.boas_vindas?'<li><b>'+by.boas_vindas+'</b> no pacote de boas-vindas</li>':'')+'</ul>'+
    '<p class="muted small-t">Total: <b>'+(by.carimbo+by.perseveranca+by.marco+by.boas_vindas)+'</b>. Melhor sequência: <b>'+s.best_streak+'</b> dia'+(s.best_streak===1?"":"s")+'.</p></div>';

  /* ---------- Histórico: um cartão por dia; tocar abre a página do dia, com as folhas, as contas erradas e a Turbo ---------- */
  var byDay={},moveBy={},oldest=sheets.length>=300?sheets[sheets.length-1].study_day:s.start_date;   // antes disso as folhas não foram baixadas
  sheets.forEach(function(x){
    var d=byDay[x.study_day]||(byDay[x.study_day]={sheets:[],ok:0,tot:0,secs:0,stamp:false,adv:false});
    d.sheets.unshift(x);d.ok+=x.first_ok;d.tot+=x.total;d.secs+=Number(x.secs)||0;if(x.stamp)d.stamp=true;if(x.advanced)d.adv=true;
  });
  moves.forEach(function(m){(moveBy[m.day]=moveBy[m.day]||[]).push(m)});
  var H=U.hist={id:id,day:day||null,span:30,tlog:null,cache:{},render:renderHist};
  function pl(n,um,varios){return n+" "+(n===1?um:varios)}
  function dayTags(d){
    var x=byDay[d],t=H.tlog&&H.tlog[d],mv=moveBy[d]||[],h="";
    if(x&&x.stamp)h+='<span class="tag ok">carimbo do dia</span>';
    if(mv.length)h+=mv.map(function(m){var b=FC.LEVELS[m.to_idx];return '<span class="tag '+(m.kind==="voltou"?"warn":"ok")+'">'+(m.kind==="salto"?"pulou para o nível ":m.kind==="voltou"?"voltou para o nível ":"subiu para o nível ")+esc(b?b.id:"?")+'</span>'}).join("");
    else if(x&&x.adv)h+='<span class="tag ok">subiu de nível</span>';
    if(x&&d<today&&s.study_days.indexOf(FC.dow(d))>=0&&x.sheets.length<quotaOf(s))h+='<span class="tag warn">'+(quotaOf(s)-x.sheets.length===1?"faltou 1 folha":"faltaram "+(quotaOf(s)-x.sheets.length)+" folhas")+'</span>';
    if(t)h+='<span class="tag">Turbo: '+t.ok+' de '+t.rows.length+'</span>';
    return h;
  }
  function weekOf(d){return FC.addDays(d,-((FC.dow(d)+6)%7))}
  function histList(){
    var from=FC.addDays(today,-(H.span-1)),more=from>oldest;if(!more)from=oldest;
    var st={dias:0,previstos:0,folhas:0,ok:0,tot:0,faltas:0,parciais:0},list="",wk=null,thisWk=weekOf(today);
    for(var d=today;d>=from;d=FC.addDays(d,-1)){
      var x=byDay[d],t=H.tlog&&H.tlog[d],study=d>=s.start_date&&s.study_days.indexOf(FC.dow(d))>=0,past=d<today;
      if(study&&(past||x))st.previstos++;
      if(x){st.dias++;st.folhas+=x.sheets.length;st.ok+=x.ok;st.tot+=x.tot;if(study&&past&&x.sheets.length<quotaOf(s))st.parciais++}
      else if(study&&past&&!t)st.faltas++;
      if(!x&&!t&&!(study&&past))continue;
      var w=weekOf(d);
      if(w!==wk){wk=w;list+='<div class="eyebrow hweek">'+(w===thisWk?"Esta semana":w===FC.addDays(thisWk,-7)?"Semana passada":"Semana de "+FC.dm(w))+'</div>'}
      var dia='<span class="hday-d"><b>'+FC.DOW[FC.dow(d)]+'</b><small class="num">'+FC.dm(d)+'</small></span>';
      if(!x&&!t){list+='<div class="hday off">'+dia+'<span class="hday-m"><span class="muted">Não estudou</span></span></div>';continue}
      var pct=x&&x.tot?Math.round(100*x.ok/x.tot):null;
      list+='<button type="button" class="hday" data-day="'+d+'" aria-label="Abrir o dia '+esc(FC.dayLabel(d))+'">'+dia+
        '<span class="hday-m"><b>'+(x?pl(x.sheets.length,"folha","folhas")+' <span class="muted small-t num">· '+FC.fmtTime(x.secs)+'</span>':'Só a Trilha Turbo')+'</b><span class="hday-tags">'+dayTags(d)+'</span></span>'+
        (pct!=null?'<span class="hday-pct '+(pct>=80?"ok":"warn")+'"><b class="num">'+pct+'%</b><small>de primeira</small></span>':'')+FC.icon("back","hday-go")+'</button>';
    }
    var stats='<div class="stats fit">'+
      '<div class="panel stat"><div class="eyebrow">Dias com estudo</div><div class="v">'+st.dias+' <small>de '+st.previstos+'</small></div><small>dias previstos no programa</small></div>'+
      '<div class="panel stat"><div class="eyebrow">Folhas feitas</div><div class="v">'+st.folhas+'</div></div>'+
      '<div class="panel stat"><div class="eyebrow">Acertos de primeira</div><div class="v">'+(st.tot?Math.round(100*st.ok/st.tot)+"%":"–")+'</div></div>'+
      '<div class="panel stat"><div class="eyebrow">Faltas</div><div class="v">'+st.faltas+'</div>'+(st.parciais?'<small>e '+pl(st.parciais,"dia incompleto","dias incompletos")+'</small>':'')+'</div></div>';
    return '<div class="eyebrow">'+(more?"Últimos "+H.span+" dias":"Desde o começo")+'</div>'+stats+
      '<div class="panel hdays"><div class="split"><b>Dia a dia</b><span class="muted small-t">Toque em um dia para ver as folhas e as contas</span></div>'+
      (list||'<p class="muted gap">Nenhum dia de estudo ainda.</p>')+
      (more?'<div class="actions gap"><button type="button" class="btn ghost small" id="histMore">Mostrar dias mais antigos</button></div>':'')+'</div>';
  }
  function histDay(d){
    var x=byDay[d],t=H.tlog&&H.tlog[d],turboOn=!!FC.turbo&&TURBO_OK!==false&&!free;
    var pct=x&&x.tot?Math.round(100*x.ok/x.tot):null;
    var head='<div class="pagehead"><button type="button" class="link crumb" data-hback>'+FC.icon("back")+'Todos os dias</button></div>'+
      '<div class="pagehead"><h2 class="hd-title">'+esc(FC.dayLabel(d))+'</h2><span class="hday-tags">'+dayTags(d).replace(/<span class="tag">Turbo:[^<]*<\/span>/,"")+'</span></div>';
    if(!x&&!t)return head+'<div class="panel"><p class="muted">'+(H.tlog===null&&turboOn?"Carregando…":"Nenhum registro de estudo neste dia.")+'</p></div>';
    var stats='<div class="stats fit">'+
      '<div class="panel stat"><div class="eyebrow">Folhas</div><div class="v">'+(x?x.sheets.length:0)+'</div></div>'+
      '<div class="panel stat"><div class="eyebrow">Acertos de primeira</div><div class="v">'+(x?x.ok+' <small>de '+x.tot+'</small>':"–")+'</div>'+(pct!=null?'<span class="tag '+(pct>=80?"ok":"warn")+'">'+pct+'%</span>':'')+'</div>'+
      '<div class="panel stat"><div class="eyebrow">Tempo nas folhas</div><div class="v">'+(x?FC.fmtTime(x.secs):"–")+'</div></div>'+
      (turboOn?'<div class="panel stat"><div class="eyebrow">Trilha Turbo</div><div class="v">'+(t?t.ok+' <small>de '+t.rows.length+'</small>':"–")+'</div><small>'+(t?"contas certas":H.tlog===null?"carregando…":"não fez neste dia")+'</small></div>':'')+'</div>';
    var folhas=x?'<div class="panel"><b>Folhas do dia</b>'+x.sheets.map(function(sh,i){
      var er=sh.total-sh.first_ok;
      return '<div class="hsheet" data-sid="'+sh.id+'"><div class="split"><span><b>Folha '+(i+1)+'</b> <span class="muted small-t">· nível '+esc(FC.lv(sh.level_idx))+' · '+FC.fmtTime(sh.secs)+'</span></span>'+
        '<span class="hday-tags">'+(sh.advanced?'<span class="tag ok">subiu de nível</span>':sh.stamp?'<span class="tag ok">carimbo do dia</span>':'')+(er?'<span class="tag bad">'+pl(er,"erro","erros")+'</span>':'<span class="tag ok">tudo certo</span>')+'</span></div>'+
        '<div class="hs-err"></div><details class="hs-full"><summary>Ver a folha inteira</summary><div class="hs-body"><p class="muted small-t">Carregando…</p></div></details></div>';
    }).join("")+'</div>':'';
    var turbo="";
    if(t){
      var bad=t.rows.filter(function(r){return !r.ok}),li=function(r){return '<li>'+turboConta(r.fact_id,r.answer,r.ok)+(r.kind==="nivelamento"?' <span class="muted small-t">· nivelamento</span>':'')+'</li>'};
      turbo='<div class="panel"><div class="split"><b>Trilha Turbo</b>'+(bad.length?'<span class="tag bad">'+pl(bad.length,"erro","erros")+'</span>':'<span class="tag ok">tudo certo</span>')+'</div>'+
        '<p class="muted small-t">'+t.ok+' de '+t.rows.length+' contas certas ('+Math.round(100*t.ok/t.rows.length)+'%).'+(bad.length?' A resposta dele aparece riscada.':'')+'</p>'+
        (bad.length?'<ul class="errlist cols">'+bad.map(li).join("")+'</ul>':'')+
        '<details class="hs-full"><summary>Ver todas as '+t.rows.length+' contas, na ordem em que ele fez</summary><ul class="errlist cols">'+t.rows.map(li).join("")+'</ul></details></div>';
    }
    return head+stats+folhas+turbo;
  }
  /* Contas e respostas das folhas do dia: baixa uma vez por dia aberto. */
  async function fillDay(d){
    var x=byDay[d];if(!x)return;
    var data=H.cache[d];
    if(!data){
      var r=await sb.from("sheets").select("id,problems,answers,level_idx,study_day,first_ok,secs").eq("student_id",id).eq("status","done").eq("study_day",d);
      if(r.error){$$("#histBox .hs-body").forEach(function(b){b.innerHTML='<p class="msg bad">'+esc(FC.err(r.error))+'</p>'});return}
      data=H.cache[d]={};r.data.forEach(function(sh){data[sh.id]=sh});
    }
    if(H.day!==d)return;
    $$("#histBox .hsheet").forEach(function(el){
      var sh=data[el.getAttribute("data-sid")];if(!sh)return;
      var bad=[];(sh.problems||[]).forEach(function(p,i){var a=(sh.answers||[])[i];if(p&&a&&a.ok!==true)bad.push({n:i+1,p:p,a:a})});
      $(".hs-err",el).innerHTML=bad.length?'<ul class="errlist cols">'+bad.map(function(b){
        var plain=!(b.p.extra&&(b.p.extra.fig||b.p.extra.opts));
        return '<li>'+(plain?esc(String(b.p.pre||"").replace(/\s*=\s*$/,""))+' = <s>'+esc(b.a.v===""||b.a.v==null?"–":b.a.v)+'</s> <b>'+esc(FC.answerText(b.p,b.p.a))+'</b>':'conta '+b.n+' <span class="muted small-t">(com figura)</span>')+'</li>'}).join("")+'</ul>':'';
      $(".hs-body",el).innerHTML=sheetHtml(sh);
    });
  }
  function renderHist(){
    var box=$("#histBox");if(!box)return;
    box.innerHTML=H.day?histDay(H.day):histList();
    $$("[data-day]",box).forEach(function(b){b.onclick=function(){H.day=b.getAttribute("data-day");renderHist();window.scrollTo(0,0);FC.nav.at("/aluno/"+id+"/historico/"+H.day)}});
    var bk=$("[data-hback]",box);
    if(bk)bk.onclick=function(){if(FC.nav.up("/aluno/"+id+"/historico"))return;H.day=null;renderHist();window.scrollTo(0,0);FC.nav.at("/aluno/"+id+"/historico")};
    var mo=$("#histMore",box);if(mo)mo.onclick=function(){H.span+=30;renderHist()};
    if(H.day)fillDay(H.day);
  }
  var names=guards.map(function(g){
    var p=profs.filter(function(x){return x.id===g.user_id})[0];
    return '<li>'+esc(p?p.name||"Sem nome":"Adulto")+' <span class="muted">· '+(p&&p.role==="professor"?"professor(a)":"responsável")+(g.role==="owner"?" · cadastrou o aluno":"")+(g.user_id===U.user.id?" · você":"")+'</span></li>';
  }).join("");
  var need=s.stamps_needed||(PUB&&PUB.stamps_needed)||5,stamps=FC.stampSet(need,s.stamps);
  var anoNow=FC.anoAluno(s,today,PUB),notices="";
  /* limite de avanço atingido: carimbos completos e o próximo nível é de um ano além do teto */
  var tetoPad=(PUB&&PUB.teto_anos_padrao!=null)?PUB.teto_anos_padrao:1,tetoVal=s.teto_anos!=null?s.teto_anos:tetoPad,nextL=FC.LEVELS[s.level_idx+1];
  var atTeto=anoNow&&nextL&&s.stamps>=need&&nextL.ano>anoNow+tetoVal;
  if(atTeto)notices+='<div class="panel offer"><b>O aluno chegou ao limite do plano</b><p class="small-t">Ele completou os carimbos do nível '+L.id+' e o próximo nível é do '+FC.ordAno(nextL.ano)+', além do limite definido (até '+tetoVal+' ano'+(tetoVal===1?"":"s")+' à frente do '+FC.ordAno(anoNow)+'). Ele continua praticando e ganhando figurinhas.</p><div class="actions"><button class="btn small" id="liberar">Liberar mais 1 ano</button></div></div>';
  /* perto do limite: faltam poucos níveis (até 3) dentro do limite atual; sugere liberar mais um ano (o professor decide) */
  if(anoNow&&!atTeto){
    var maxAno=anoNow+tetoVal,firstBeyond=-1;
    for(var qi=0;qi<FC.LEVELS.length;qi++)if(FC.LEVELS[qi].ano>maxAno){firstBeyond=qi;break}
    var left=firstBeyond>=0?firstBeyond-1-s.level_idx:-1;
    if(firstBeyond>=0&&left>=0&&left<=3)notices+='<div class="panel offer"><b>O aluno está chegando ao limite do plano</b><p class="small-t">'+(left===0?'Falta só terminar o nível '+L.id+' para chegar':'Faltam '+left+' nível'+(left===1?'':'s')+' depois deste para ele chegar')+' ao limite definido (até '+tetoVal+' ano'+(tetoVal===1?"":"s")+' à frente do '+FC.ordAno(anoNow)+'). Se ele está indo bem, você pode liberar mais um ano à frente (até '+(tetoVal+1)+'), e ele continua avançando sem parar. Quando chegar ao limite, ele faz folhas de revisão.</p><div class="actions"><button class="btn small" id="liberar">Liberar mais 1 ano</button></div></div>';
  }
  if(s.reached_by_jump&&s.dry_days>=((PUB&&PUB.dias_sem_carimbo_voltar)||2))notices+='<div class="panel offer"><b>Nível difícil depois do salto</b><p class="small-t">Depois de pular para o nível '+L.id+', o aluno passou '+s.dry_days+' dias de estudo sem ganhar carimbo. O app ofereceu a ele voltar ao nível anterior e treinar mais; ele escolhe. Você também pode trocar o nível na aba Programa.</p></div>';
  if(s.ano_escolar&&s.ano_ref&&FC.anoLetivo(today,PUB)>s.ano_ref)notices+='<div class="panel offer"><b>O ano escolar foi atualizado</b><p class="small-t">Na virada do ano, o ano escolar passou automaticamente para o <b>'+FC.ordAno(anoNow)+'</b>. O nível do aluno não mudou. Confira se está certo; para corrigir, use a aba Programa.</p><div class="actions"><button class="btn small" id="anoOk">Está certo</button></div></div>';
  var weakHtml='<div class="panel"><div class="eyebrow gap">Contas em reforço</div>'+(weak.length?
    '<ul class="plain miss">'+weak.map(function(w){
      return '<li><span class="q">'+esc(w.pre)+(w.extra&&w.extra.fig?' <span class="muted small-t">(com figura)</span>':'')+' <b>'+esc(FC.answerText({extra:w.extra},w.ans))+'</b>'+esc(w.post)+'</span> <span class="muted small-t">nível '+esc(FC.lv(w.level_idx))+' · errou '+w.misses+' vez'+(w.misses>1?'es':'')+'</span></li>'}).join("")+'</ul>':
    '<p class="muted">Nenhuma conta em reforço agora.</p>')+
    '<p class="muted small-t gap">'+"Estas contas voltam nas próximas folhas, inclusive no nível seguinte, até ele acertar 2 vezes seguidas."+'</p></div>';

  var todayKind=FC.dayKind(s,today),isStudyToday=todayKind!=="rest";
  var todaySheets=sheets.filter(function(x){return x.study_day===today}),tdOk=0,tdTot=0;
  todaySheets.forEach(function(x){tdOk+=x.first_ok;tdTot+=x.total});
  var tdPct=tdTot?Math.round(100*tdOk/tdTot):null;
  var nx=FC.nextMarco(sk);
  var stats='<div class="stats">'+
    '<div class="panel stat"><div class="eyebrow">Hoje</div><div class="v">'+todaySheets.length+' <small>de '+(isStudyToday?quotaOf(s):0)+' folhas</small></div>'+
      (tdPct!=null?'<span class="tag '+(tdPct>=80?'ok':'warn')+'">'+tdPct+'% de acerto de primeira</span>':'<small>'+(isStudyToday?(todayKind==='free'?'dia livre, ainda sem folhas':'ainda sem folhas hoje'):'hoje é descanso')+'</small>')+'</div>'+
    '<div class="panel stat"><div class="eyebrow">Nível</div><div class="v">'+L.id+' <small>de '+FC.LEVELS.length+'</small></div><small>'+esc(L.name)+'</small><small class="ano-line">'+esc(anoLine(s,L,today,true))+'</small></div>'+
    '<div class="panel stat"><div class="eyebrow">Carimbos</div><div class="v">'+Math.min(s.stamps,need)+' <small>de '+need+'</small></div><div class="stamps">'+stamps+'</div><small>com '+need+' ele sobe de nível</small></div>'+
    '<div class="panel stat"><div class="eyebrow">Dias seguidos</div><div class="v">'+sk+' <small>dia'+(sk===1?"":"s")+'</small></div><small>próximo marco: '+nx.at+' dias ('+nx.packs+' pacotinhos)</small><small>melhor: '+s.best_streak+'</small></div></div>';
  var free=studentFree(s);
  var planNote=free?'<div class="panel plan-banner plan-free"><div class="grow"><b>Plano Grátis</b><p class="small-t">'+esc(s.name)+' faz '+quotaOf(s)+' folhas por dia, com 1 álbum. Trocas com amigos, Trilha Turbo e a aba Atenção são do VIP.</p></div><button type="button" class="btn small" data-plans>Ver planos</button></div>':'';
  var resumo=planNote+doneNotice+notices+stats+(free?'':turboPanel(turbo,s,today))+   // no Grátis a Turbo é trancada: o quadro não aparece
    
    '<details class="panel rule how"><summary><b>Como o aluno avança</b></summary><p class="small-t">Cada dia com '+((PUB&&PUB.normal_acertos)||80)+'% ou mais de acertos de primeira e tempo médio dentro da meta vale 1 carimbo e 1 pacotinho. Dia de ouro vale '+((PUB&&PUB.ouro_carimbos)||2)+' carimbos, e um dia de salto faz o aluno subir direto de nível. Fechar todas as folhas do dia, com ou sem carimbo, vale mais 1 pacotinho. Com '+need+' carimbos ele sobe de nível sozinho; a mudança aparece no Histórico. Fechar todas as folhas de um dia de estudo soma 1 dia seguido; faltar a um dia de estudo zera a contagem. Para mudar o nível agora, use a aba Programa.</p></details>';
  var historico='<div id="histBox"></div>';
  /* Atenção: tudo o que pede ajuda fica aqui (assuntos com mais erro, contas em reforço, contas demoradas e fatos da Turbo). A aba inteira é do VIP. */
  var apoio='<div class="grid"><div class="col">'+weakHtml+'</div><div class="col"><div class="panel" id="slowBox"><div class="eyebrow gap">Contas mais demoradas</div><p class="muted">Carregando…</p></div></div></div>';
  var dificuldades=free?vipLock("Onde a criança está com dificuldade","Com o VIP você vê, assunto por assunto, onde a criança erra mais, as contas que ela está reforçando, as que mais demoram e o que vale treinar em casa."):'<div class="panel"><div class="split"><div class="eyebrow">Assuntos que pedem atenção</div>'+
    '<label class="field inline dif-per"><span class="sr">Período</span><select id="difPer"><option value="7">Últimos 7 dias</option><option value="30" selected>Últimos 30 dias</option><option value="0">Tudo</option></select></label></div>'+
    '<div id="difBox"><p class="loading">Carregando…</p></div></div>'+apoio+turboAtencao(turbo);
  var programa='<div class="panel form-narrow"><form id="edForm" class="form" novalidate><div class="eyebrow">Programa de estudos</div>'+programFields(s)+
    '<p class="msg bad" id="fMsg" role="alert"></p><div class="actions"><button class="btn" id="fBtn" type="submit">Salvar programa</button></div></form></div>';
  var acesso='<div class="grid"><div class="col"><div class="panel"><div class="eyebrow gap">Acesso do aluno</div><div class="linkrow"><input id="lnk" readonly value="'+esc(link)+'" aria-label="Link do aluno"><button class="btn small" id="cp">Copiar</button></div>'+
    '<div class="actions gap"><button class="btn ghost small" id="rstPin">Redefinir PIN</button><button class="btn ghost small" id="newLink">Gerar novo link</button></div>'+
    '<p class="muted small-t">Redefinir o PIN desconecta o aluno; ele cria um novo PIN no mesmo link. Gerar novo link invalida o link antigo.</p></div>'+
    '<div class="panel"><div class="eyebrow gap">Adultos com acesso</div><ul class="plain">'+names+'</ul>'+
    (iAmOwner?'<div class="actions gap"><button class="btn ghost small" id="invite">Convidar outro adulto</button></div><div id="inviteOut"></div>':'')+'</div></div>'+
    '<div class="col">'+(free?vipLock("Amigos e trocas","No VIP a criança faz amigos pelo código e troca figurinhas repetidas com eles. As amizades que já existem continuam guardadas."):'')+'<div class="panel" id="frBox"><div class="eyebrow gap">Amigos do aluno</div><p class="muted">Carregando…</p></div><div class="panel" id="trAdBox"><div class="eyebrow gap">Trocas de figurinhas</div><p class="muted">Carregando…</p></div>'+(iAmOwner?'<div class="panel"><div class="eyebrow gap">Zona de risco</div><p class="muted small-t">Apagar o aluno remove todo o histórico, as figurinhas e os pacotinhos. Isso não tem volta.</p><div class="actions gap"><button class="btn danger small" id="del">Apagar aluno e todo o histórico</button></div></div>':'<div class="panel"><p class="muted">Só quem cadastrou o aluno pode apagá-lo.</p></div>')+'</div></div>';
  var head=topbar("Aluno")+'<div class="pagehead"><button type="button" class="link crumb" id="back">'+FC.icon("back")+'Todos os alunos</button></div>'+
    '<div class="pagehead"><h1>'+esc(s.name)+'</h1><span class="lvlchip">Nível '+L.id+'</span></div>';
  FC.render(FC.tabsShell({scope:"pai",head:head,tabs:[
    {id:"resumo",label:"Resumo",icon:"resumo",html:resumo},
    {id:"album",label:"Álbum",icon:"album",html:rewardPanel+packsHtml},
    {id:"historico",label:"Histórico",icon:"history",html:historico},
    {id:"dificuldades",label:"Atenção",icon:"progress",html:dificuldades},
    {id:"programa",label:"Programa",icon:"program",html:programa},
    {id:"acesso",label:"Acesso",icon:"key",html:acesso}]}));
  U.detail=id;
  if(FC.tabState.pai!=="historico")H.day=null;
  FC.nav.at("/aluno/"+id+"/"+FC.tabState.pai+(H.day?"/"+H.day:""));
  FC.bindTabs("pai",function(tab){if(tab==="historico"&&H.day){H.day=null;renderHist()}},function(tab){return "/aluno/"+id+"/"+tab});   // tocar na aba Histórico volta para a lista de dias
  renderHist();
  loadTurboLog(id).then(function(by){if(U.hist!==H)return;H.tlog=by||{};renderHist()});
  bindTop();bindProgram();bindLocks();
  $("#back").onclick=function(){if(!FC.nav.up("/"))dash()};
  var lib=$("#liberar");
  if(lib)lib.onclick=async function(){
    lib.disabled=true;
    var r=await sb.from("students").update({teto_anos:Math.min(99,tetoVal+1)}).eq("id",id);
    if(r.error){lib.disabled=false;return FC.toast(FC.err(r.error),true)}
    FC.toast("Limite liberado: mais 1 ano à frente.");detail(id);
  };
  function bindAlb(){
    var box=$("#albPane");if(!box)return;
    function redraw(){box.innerHTML=albPaneHtml();bindAlb()}
    $$("[data-asub]",box).forEach(function(b){b.onclick=function(){AL.sub=b.getAttribute("data-asub");redraw()}});
    $$("[data-aopen]",box).forEach(function(b){b.onclick=function(){AL.open=b.getAttribute("data-aopen");redraw()}});
    $$("[data-aback]",box).forEach(function(b){b.onclick=function(){AL.open=null;redraw()}});
  }
  bindAlb();
  $$("[data-more]").forEach(function(b){b.onclick=function(){
    FC.tabState.pai="programa";try{sessionStorage.setItem("fc_tab_pai","programa")}catch(e){}
    detail(id).then(function(){var el=$("#pThemes");if(el)el.scrollIntoView({behavior:"smooth",block:"center"})});
  }});
  var anoOk=$("#anoOk");
  if(anoOk)anoOk.onclick=async function(){
    anoOk.disabled=true;
    var r=await sb.from("students").update({ano_escolar:anoNow}).eq("id",id);
    if(r.error){anoOk.disabled=false;return FC.toast(FC.err(r.error),true)}
    FC.toast("Ano escolar confirmado.");detail(id);
  };
  loadSlow(id);loadTurboNow(id);loadFriends(id);loadTrades(id);loadAnalise(id);
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
    FC.toast("Aluno apagado.");if(!FC.nav.up("/"))dash();
  });
  $("#edForm").onsubmit=async function(e){
    e.preventDefault();var r=readProgram();
    if(r.error){$("#fMsg").textContent=r.error;return}
    var patch=r.v;if(patch.level_idx!==s.level_idx){patch.stamps=0;patch.reached_by_jump=false;patch.dry_days=0}
    var cons=patch.consent;delete patch.consent;   // autorização dos dados de estudo: grava a data (o banco carimba) ou retira
    if(cons&&!s.consent_at)patch.consent_at=new Date().toISOString();else if(!cons&&s.consent_at)patch.consent_at=null;
    $("#fBtn").disabled=true;
    var res=await sb.from("students").update(patch).eq("id",id);
    if(res.error){$("#fBtn").disabled=false;$("#fMsg").textContent=FC.err(res.error);return}
    var turboOk=await saveTurbo(id,r.turbo);
    FC.toast(turboOk?"Programa salvo.":"Programa salvo, mas não deu para salvar a opção da Turbo.",!turboOk);detail(id);
  };
}

/* ---------- folhas feitas e dificuldades ---------- */
var SEM_TXT={vermelho:"Dificuldade",amarelo:"Atenção",verde:"Tranquilo",poucos:"Poucos dados"};
function contaTxt(p){
  var pre=String(p.pre||"").replace(/\s*=\s*$/,"");
  return p.extra&&(p.extra.fig||p.extra.opts)?pre+' <span class="muted small-t">(com figura)</span>':esc(pre)+(p.post?" "+esc(p.post):"");
}
function respTxt(c){
  var cnt={};c.resp.forEach(function(v){cnt[v]=(cnt[v]||0)+1});
  var ks=Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a]}).slice(0,3);
  return ks.length?"respondeu "+ks.map(esc).join(", "):"sem resposta";
}
/* Baixa as últimas folhas com as contas e respostas para a análise por assunto da aba Atenção. */
async function loadAnalise(id){
  var box=$("#difBox");
  var r=await sb.from("sheets").select("id,level_idx,study_day,problems,answers,first_ok,total").eq("student_id",id).eq("status","done").order("finished_at",{ascending:false}).limit(150);
  if(r.error){if(box)box.innerHTML='<p class="msg bad">'+esc(FC.err(r.error))+'</p>';return}
  U.an={id:id,sheets:r.data};
  if($("#difPer"))$("#difPer").onchange=renderDif;
  renderDif();
}
function renderDif(){
  var box=$("#difBox");if(!box||!U.an)return;
  var per=Number($("#difPer")?$("#difPer").value:30),from=per?FC.addDays(FC.today(),-per):"";
  var list=U.an.sheets.filter(function(sh){return !from||sh.study_day>=from});
  if(!list.length){box.innerHTML='<p class="muted">Nenhuma folha feita '+(per?'nos últimos '+per+' dias':'ainda')+'.</p>';return}
  var rows=FC.analisar(list,{target:function(i){return FC.LEVELS[i].target},hab:function(i){return FC.LEVELS[i].hab||[]}});
  var n=0,e=0;rows.forEach(function(r){n+=r.n;e+=r.erros});
  function card(r){
    var L=FC.LEVELS[r.level];
    return '<div class="dif-card sem-'+r.semaforo+'"><div class="dif-head"><b>Nível '+esc(L.id)+' · '+esc(L.name)+'</b><span class="tag sem">'+SEM_TXT[r.semaforo]+'</span></div>'+
      '<p>Errou de primeira <b>'+r.erros+' de '+r.n+'</b> contas ('+Math.round(r.taxa)+'%), em '+r.folhas+' folha'+(r.folhas>1?'s':'')+'.</p>'+
      (r.devagar?'<p class="small-t">Está devagar: leva em média '+FC.fmtSec(r.msMedio)+' por conta (esperado até '+FC.fmtSec(r.esperadoMs)+').</p>':'')+
      (r.numericos>=3&&r.porUm*2>=r.numericos?'<p class="small-t">Em '+r.porUm+' dos '+r.numericos+' erros a resposta ficou a <b>1 de distância</b> da certa.</p>':'')+
      (r.semResposta?'<p class="small-t">'+r.semResposta+' conta'+(r.semResposta>1?'s':'')+' ficou sem resposta.</p>':'')+
      (r.contas.length?'<details><summary>Contas que mais errou ('+r.contas.length+')</summary><ul class="errlist">'+r.contas.slice(0,8).map(function(c){
        return '<li>'+contaTxt(c.p)+' = <b>'+esc(FC.answerText(c.p,c.p.a))+'</b> <span class="muted small-t">· errou '+c.erros+' de '+c.vezes+' vez'+(c.vezes>1?'es':'')+' · '+respTxt(c)+'</span></li>'}).join("")+'</ul></details>':'')+
      (r.hab.length?'<div class="hab-chips">'+r.hab.map(function(c){var h=FC.HAB&&FC.HAB[c];return '<span class="chip" title="'+esc(h?h[2]:c)+'">'+esc(c)+(h?' · '+esc(h[1]):'')+'</span>'}).join("")+'</div>':'')+'</div>';
  }
  var alerta=rows.filter(function(r){return r.semaforo==="vermelho"||r.semaforo==="amarelo"}),bem=rows.filter(function(r){return r.semaforo==="verde"}),poucos=rows.filter(function(r){return r.semaforo==="poucos"});
  var hab=FC.analisarHab(rows).filter(function(h){return h.semaforo!=="poucos"});
  box.innerHTML='<p class="muted">'+list.length+' folha'+(list.length>1?'s':'')+' · acertou de primeira '+Math.round(100-(n?e*100/n:0))+'% das contas.</p>'+
    (alerta.length?alerta.map(card).join(""):bem.length?'<div class="dif-card sem-verde"><b>Nenhum assunto pede atenção neste período</b><p>Ele errou de primeira menos de 20% das contas em todos os assuntos que estudou.</p></div>':'<p class="muted">Ainda não há contas suficientes em nenhum assunto neste período.</p>')+
    (bem.length?'<details class="gap"><summary>Assuntos em que ele vai bem ('+bem.length+')</summary><ul class="plain gap">'+bem.map(function(r){var L=FC.LEVELS[r.level];return '<li>Nível '+esc(L.id)+' · '+esc(L.name)+' <span class="muted small-t">· errou '+r.erros+' de '+r.n+' ('+Math.round(r.taxa)+'%)</span>'+(r.devagar?' <span class="tag warn">devagar</span>':'')+'</li>'}).join("")+'</ul></details>':'')+
    (hab.length?'<details class="gap"><summary>Por habilidade da BNCC ('+hab.length+')</summary><div class="tablewrap"><table class="hab"><thead><tr><th>Habilidade</th><th>Erros de primeira</th><th></th></tr></thead><tbody>'+hab.map(function(h){
      var d=FC.HAB&&FC.HAB[h.cod];
      return '<tr><td><b>'+esc(h.cod)+'</b>'+(d?'<br><span class="muted small-t" title="'+esc(d[2])+'">'+esc(d[1])+'</span>':'')+'</td><td>'+h.erros+' de '+h.n+' ('+Math.round(h.taxa)+'%)</td><td><span class="tag sem sem-'+h.semaforo+'">'+SEM_TXT[h.semaforo]+'</span></td></tr>'}).join("")+'</tbody></table></div>'+
      '<p class="muted small-t">Cada conta conta em todas as habilidades do nível dela; por isso os números são aproximados quando um nível treina mais de uma habilidade.</p></details>':'')+
    (poucos.length?'<details class="gap"><summary>Assuntos com poucos dados ('+poucos.length+')</summary><ul class="plain">'+poucos.map(function(r){var L=FC.LEVELS[r.level];return '<li>Nível '+esc(L.id)+' · '+esc(L.name)+' <span class="muted small-t">· '+r.erros+' de '+r.n+' contas erradas</span></li>'}).join("")+'</ul></details>':'')+
    '<p class="muted small-t gap">Dificuldade: errou de primeira 40% ou mais das contas. Atenção: de 20% a 40%. Só entra assunto com pelo menos 5 contas feitas.</p>';
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
    var nms=function(l){return (l||[]).map(function(y){return nm(y.theme,y.slot)}).join(", ")};
    var st=x.status==="aceita"?"trocou":x.status==="recusada"?(x.sent?"pedido recusado por":"recusou o pedido de"):(x.sent?"pedido esperando resposta de":"pedido recebido de");
    return '<li class="fr-row"><span class="grow"><b>'+FC.dm(String(x.at).slice(0,10))+'</b> · '+st+' <b>'+esc(x.friend)+'</b><br><span class="small-t">deu '+nms(x.gave)+' e '+(x.status==="aceita"?"recebeu ":"queria ")+nms(x.got)+'</span></span></li>'}).join("");
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

/* Folha inteira, conta por conta, para a página do dia no Histórico. */
function sheetHtml(sh){
  var ans=sh.answers||[];
  var exp=FC.LEVELS[sh.level_idx].target/10*1000,msAll=ans.map(function(a){return a&&a.ms>0?a.ms:0}).filter(function(x){return x>0});
  var avg=msAll.length?msAll.reduce(function(a,b){return a+b},0)/msAll.length:0;
  var li=(sh.problems||[]).map(function(p,i){
    var a=ans[i]||{},ok=a.ok,ms=a.ms||0;
    var rich=!!p.extra;
    return '<li class="'+(ok?"ok":"bad")+'">'+(rich?FC.itemStatic(p,a.v):'<span class="q">'+esc(p.pre)+' '+esc(a.v===""||a.v==null?"–":a.v)+(p.post?" "+esc(p.post):"")+'</span>')+' '+
      (ok?'<span class="tag ok">certa de primeira</span>':'<span class="tag bad">errou · resposta certa: '+esc(FC.answerText(p,p.a))+(rich&&a.v!==""&&a.v!=null?' · marcou: '+esc(FC.answerText(p,a.v)):'')+'</span>')+
      (ms>0?' <span class="muted small-t">'+FC.fmtSec(ms)+'</span>':'')+(ms>exp*1.5?' <span class="tag warn">lenta</span>':'')+
      (a.tries>1?' <span class="muted small-t">('+a.tries+' tentativas)</span>':'')+'</li>';
  }).join("");
  return (avg?'<p class="muted small-t">Tempo médio por conta: '+FC.fmtSec(avg)+' (esperado até '+FC.fmtSec(exp)+').</p>':'')+'<ol class="sv">'+li+'</ol>';
}
})();
