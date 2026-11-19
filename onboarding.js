/* Primeiros passos do adulto (pais e professores): checklist na tela inicial, passeio guiado com destaque na tela e vídeo curto opcional.
   A ideia é aprender fazendo: o checklist leva à ação real (cadastrar, enviar o link, ver a primeira folha) e o passeio dura poucos passos, pode ser pulado e refeito.
   O vídeo só aparece se config.js tiver ONBOARDING_VIDEO. O progresso fica neste aparelho (localStorage), por conta. Teste: node testes/onboarding.test.js */
(function(){
"use strict";
var FC=window.FC,OB=FC.onboarding={};
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return FC.esc?FC.esc(s):String(s)}

/* ---------- estado salvo (por conta, neste aparelho) ---------- */
function key(uid){return "fc_ob_"+uid}
OB.load=function(uid){try{var v=JSON.parse(localStorage.getItem(key(uid))||"{}");return v&&typeof v==="object"?v:{}}catch(e){return{}}};
OB.save=function(uid,patch){var v=OB.load(uid);for(var k in patch)v[k]=patch[k];try{localStorage.setItem(key(uid),JSON.stringify(v))}catch(e){}return v};
/* Marca que o adulto já enviou o link ou o QR Code ao aluno (chamado pelo painel quando ele copia o link ou abre o QR). */
OB.mark=function(uid,what){if(!uid||!what)return;var o={};o[what]=true;OB.save(uid,o)};

/* ---------- passos do checklist (função pura) ----------
   c = {n: alunos cadastrados, sheets: folhas feitas nos últimos 60 dias, shared: já enviou o link ou o QR} */
OB.steps=function(c){
  var aluno=c.n>0,folha=c.sheets>0,link=aluno&&(!!c.shared||folha);
  return [
    {id:"aluno",done:aluno,title:"Cadastre o primeiro aluno",text:"Informe o nome e o nível. O programa de estudos já vem pronto, e você ajusta depois.",go:"Cadastrar aluno"},
    {id:"link",done:link,title:"Envie o link ao aluno",text:"Mostre o QR Code ou copie o link. Ele abre no aparelho da criança e cria um PIN no primeiro acesso.",go:"Mostrar QR Code"},
    {id:"folha",done:folha,title:"Veja a primeira folha feita",text:"Quando a criança terminar uma folha, o resultado aparece aqui, com acertos e tempo.",go:"Abrir o aluno"}
  ];
};
OB.next=function(steps){for(var i=0;i<steps.length;i++)if(!steps[i].done)return steps[i];return null};
OB.progress=function(steps){var d=steps.filter(function(s){return s.done}).length;return{done:d,total:steps.length,pct:Math.round(100*d/steps.length)}};

/* ---------- passos do passeio (função pura) ----------
   sel vazio = cartão no centro da tela. Passos cujo elemento não existe na tela são pulados. */
OB.tour=function(hasStudents,name){
  var first=String(name||"").trim().split(/\s+/)[0];
  var t=[{title:"Bem-vindo"+(first?", "+first:"")+"!",text:"Um passeio de menos de 1 minuto mostra onde fica o essencial. Você pode pular agora e refazer quando quiser."},
    {sel:".section-head h1",title:"Seus alunos ficam aqui",text:"Cada criança tem um cartão com o nível, o que fez hoje e a sequência de dias de estudo."},
    {sel:"#newStudent",title:"Comece por aqui",text:"Cadastre a criança, escolha o nível e os dias de estudo. O sistema monta as folhas sozinho."}];
  if(hasStudents)t.push(
    {sel:".card",title:"Toque no cartão para acompanhar",text:"Dentro dele há o resumo, o histórico de folhas, as dificuldades e o programa de estudos."},
    {sel:"[data-qr]",title:"O QR Code é a porta de entrada",text:"A criança aponta a câmera do celular para ele e abre a página dela. Sem senha para decorar."});
  t.push({sel:"#profileBtn",title:"Seu perfil e seu plano",text:"Aqui você vê o plano, os dados de pagamento e a autorização dos dados de estudo."},
    {title:"Pronto!",text:"Para rever este passeio, use “Fazer o passeio guiado” no fim da tela. Os primeiros passos continuam na tela inicial até você concluir."});
  return t;
};

/* ---------- vídeo opcional ---------- */
function videoUrl(){var u=window.APP_CONFIG&&window.APP_CONFIG.ONBOARDING_VIDEO;return typeof u==="string"&&/^https:\/\//.test(u)?u:""}
OB.videoUrl=videoUrl;
function openVideo(){
  var u=videoUrl();if(!u)return;
  if(/\.(mp4|webm)(\?|$)/i.test(u)){FC.overlay('<h2>Como funciona</h2><video class="ob-video" src="'+esc(u)+'" controls playsinline preload="metadata"></video>',{button:"Fechar",wide:true});return}
  window.open(u,"_blank","noopener");
}

/* ---------- checklist na tela inicial ---------- */
/* ctx = {user, name, students (lista), sheets (folhas feitas, lista)}; os botões acionam os da própria tela. */
OB.mount=function(ctx){
  var box=$("#obBox");if(!box||!ctx.user)return;
  var st=OB.load(ctx.user.id),steps=OB.steps({n:ctx.students.length,sheets:ctx.sheets.length,shared:!!st.shared}),pr=OB.progress(steps),nx=OB.next(steps);
  if(!nx&&!st.oculto)OB.save(ctx.user.id,{oculto:true});   // tudo feito: o cartão some sozinho
  if(!nx||st.oculto){box.innerHTML="";}
  else{
    var li=steps.map(function(s){
      var cur=s===nx;
      return '<li class="'+(s.done?"done":cur?"next":"")+'"><span class="ob-dot" aria-hidden="true">'+(s.done?FC.icon("check"):"")+'</span><div class="grow"><b>'+esc(s.title)+(s.done?' <span class="sr-only">(feito)</span>':'')+'</b>'+
        (cur?'<p class="small-t muted">'+esc(s.text)+'</p><button type="button" class="btn small" data-ob-go="'+s.id+'">'+esc(s.go)+'</button>':'')+'</div></li>';
    }).join("");
    box.innerHTML='<section class="panel ob-card" aria-labelledby="obH"><div class="split"><h2 id="obH">Primeiros passos</h2><span class="small-t muted">'+pr.done+' de '+pr.total+'</span></div>'+
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+pr.total+'" aria-valuenow="'+pr.done+'"><i style="width:'+pr.pct+'%"></i></div>'+
      '<ol class="ob-list">'+li+'</ol>'+
      '<div class="actions">'+(videoUrl()?'<button type="button" class="btn ghost small" id="obVideo">Ver vídeo de 1 minuto</button>':'')+
      '<button type="button" class="link small-t" id="obHide">Ocultar</button></div></section>';
    var go={aluno:"#newStudent",link:"[data-qr]",folha:".card"};
    Array.prototype.forEach.call(box.querySelectorAll("[data-ob-go]"),function(b){b.onclick=function(){var t=$(go[b.getAttribute("data-ob-go")]);if(t)t.click()}});
    var v=$("#obVideo",box);if(v)v.onclick=openVideo;
    $("#obHide",box).onclick=function(){OB.save(ctx.user.id,{oculto:true});box.innerHTML="";FC.toast("Os primeiros passos ficam em “Fazer o passeio guiado”, no fim da tela.")};
  }
  var again=$("#obTour");if(again)again.onclick=function(){OB.save(ctx.user.id,{oculto:false});OB.mount(ctx);OB.start(ctx)};
  if(!st.passeio&&!ctx.students.length&&!box.dataset.auto){box.dataset.auto="1";setTimeout(function(){if($("#obBox")===box)OB.start(ctx)},600)}   // só abre sozinho na primeira vez e sem alunos
};
/* Botões que o painel coloca no fim da tela inicial. */
OB.footerHtml=function(){return '<p class="center"><button type="button" class="link small-t" id="obTour">Fazer o passeio guiado</button></p>'};
OB.boxHtml=function(){return '<div id="obBox"></div>'};

/* ---------- passeio guiado (destaca o elemento e explica) ---------- */
var live=null;
OB.start=function(ctx){
  if(live)live.end();
  var list=OB.tour(ctx.students.length>0,ctx.name).filter(function(s){return !s.sel||$(s.sel)});
  if(!list.length)return;
  var i=0,opener=document.activeElement,layer=document.createElement("div");
  layer.className="ob-layer";
  layer.innerHTML='<div class="ob-spot" hidden></div><div class="ob-tip" role="dialog" aria-modal="true" aria-labelledby="obTitle" tabindex="-1"></div>';
  document.body.appendChild(layer);
  var spot=$(".ob-spot",layer),tip=$(".ob-tip",layer);
  function place(){
    var s=list[i],el=s.sel&&$(s.sel);
    if(!el){spot.hidden=true;tip.classList.add("center");tip.style.cssText="";return}
    var r=el.getBoundingClientRect(),pad=6;
    spot.hidden=false;spot.style.cssText="top:"+(r.top-pad)+"px;left:"+(r.left-pad)+"px;width:"+(r.width+2*pad)+"px;height:"+(r.height+2*pad)+"px";
    tip.classList.remove("center");
    var vw=window.innerWidth,vh=window.innerHeight,w=Math.min(340,vw-24),h=tip.offsetHeight||190;
    var below=r.bottom+pad+12+h<=vh,top=below?r.bottom+pad+12:Math.max(12,r.top-pad-12-h);
    var left=Math.min(Math.max(12,r.left+r.width/2-w/2),vw-w-12);
    tip.style.cssText="width:"+w+"px;top:"+top+"px;left:"+left+"px";
  }
  function show(){
    var s=list[i],el=s.sel&&$(s.sel),last=i===list.length-1;
    if(el&&el.scrollIntoView)el.scrollIntoView({block:"center"});
    tip.innerHTML='<div class="small-t muted">'+(i+1)+' de '+list.length+'</div><h2 id="obTitle">'+esc(s.title)+'</h2><p>'+esc(s.text)+'</p>'+
      (i===0&&videoUrl()?'<p><button type="button" class="link" id="obTipVideo">Prefiro ver um vídeo de 1 minuto</button></p>':'')+
      '<div class="actions"><button type="button" class="btn" id="obNext">'+(last?"Concluir":i===0?"Começar o passeio":"Próximo")+'</button>'+
      (i>0&&!last?'<button type="button" class="btn ghost" id="obPrev">Voltar</button>':'')+
      (!last?'<button type="button" class="link small-t" id="obSkip">'+(i===0?"Agora não":"Pular passeio")+'</button>':'')+'</div>';
    $("#obNext",tip).onclick=function(){if(last)end(true);else{i++;show()}};
    var p=$("#obPrev",tip);if(p)p.onclick=function(){i--;show()};
    var k=$("#obSkip",tip);if(k)k.onclick=function(){end(false)};
    var v=$("#obTipVideo",tip);if(v)v.onclick=function(){end(false);openVideo()};
    place();$("#obNext",tip).focus({preventScroll:true});
  }
  function onKey(e){
    if(e.key==="Escape")end(false);
    else if(e.key==="ArrowRight"&&i<list.length-1){i++;show()}
    else if(e.key==="ArrowLeft"&&i>0){i--;show()}
  }
  function end(done){
    if(!layer.parentNode)return;
    layer.remove();document.removeEventListener("keydown",onKey);window.removeEventListener("resize",place);window.removeEventListener("popstate",stop);live=null;
    if(ctx.user)OB.save(ctx.user.id,{passeio:done?"feito":"pulado"});
    if(opener&&opener.focus&&document.contains(opener))opener.focus({preventScroll:true});
  }
  function stop(){end(false)}
  document.addEventListener("keydown",onKey);window.addEventListener("resize",place);window.addEventListener("popstate",stop);
  live={end:stop};show();
};
})();
