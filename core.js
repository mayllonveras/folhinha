/* Base comum: cliente Supabase, datas, níveis, geração de folhas e mensagens. */
(function(){
"use strict";
var FC=window.FC={};
var cfg=window.APP_CONFIG;
FC.sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

FC.$=function(s,r){return (r||document).querySelector(s)};
FC.$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
FC.esc=function(t){return String(t==null?"":t).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
FC.render=function(html){document.body.classList.remove("has-nav");FC.$("#app").innerHTML=html;window.scrollTo(0,0)};
FC.setKeys=function(fn){
  if(FC._kh)document.removeEventListener("keydown",FC._kh);
  FC._kh=fn||null;if(fn)document.addEventListener("keydown",fn);
};

/* ---------- datas (sempre no fuso do aparelho) ---------- */
FC.DOW=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
FC.DOW_LONG=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
FC.pad=function(n){return String(n).padStart(2,"0")};
FC.ymd=function(d){return d.getFullYear()+"-"+FC.pad(d.getMonth()+1)+"-"+FC.pad(d.getDate())};
FC.today=function(){return FC.ymd(new Date())};
FC.date=function(s){return new Date(s+"T12:00:00")};
FC.addDays=function(s,n){var d=FC.date(s);d.setDate(d.getDate()+n);return FC.ymd(d)};
FC.dm=function(s){return s.slice(8,10)+"/"+s.slice(5,7)};
FC.dow=function(s){return FC.date(s).getDay()};
FC.weekEnd=function(day,close){return FC.addDays(day,((close-FC.dow(day))+7)%7)};
FC.fmtSec=function(ms){return (ms/1000).toFixed(1).replace(".",",")+" s"};
FC.fmtTime=function(s){s=Math.round(s);return FC.pad(Math.floor(s/60))+":"+FC.pad(s%60)};
FC.dayLabel=function(s){return FC.DOW[FC.dow(s)]+" "+FC.dm(s)};
/* Próximo dia de estudo a partir de 'from' (inclusive se pedido), respeitando a data de início. */
FC.nextStudy=function(from,days,start,inclusive){
  for(var i=inclusive?0:1;i<=21;i++){
    var d=FC.addDays(from,i);
    if(d>=start&&days.indexOf(FC.dow(d))>=0)return d;
  }
  return null;
};

/* ---------- avisos e erros ---------- */
FC.toast=function(msg,bad){
  var t=FC.$("#toast");t.textContent=msg;t.className="show"+(bad?" bad":"");
  clearTimeout(FC._tt);FC._tt=setTimeout(function(){t.className=""},3800);
};
FC.err=function(e){
  var m=(e&&(e.message||e.error_description))||String(e||"");
  var map=[["Invalid login credentials","E-mail ou senha incorretos."],
    ["User already registered","Este e-mail já tem cadastro. Entre com a senha."],
    ["sessao_invalida","Sessão expirada."],
    ["sem_folha_hoje","Hoje não é dia de folha para este aluno."],
    ["min_folhas","O mínimo é de 3 folhas por dia."],
    ["min_dias","O mínimo é de 3 dias de estudo por semana."],
    ["min_meta","A meta precisa ser de pelo menos 70% do máximo de pontos da semana."],
    ["sem_pacote","Você não tem pacotinho para abrir agora."],
    ["album_completo","Este álbum já está completo. Escolha outro."],
    ["album_invalido","Este álbum não está disponível para você."],
    ["album_fora_da_mesa","Este álbum está na gaveta. Coloque-o na mesa para abrir o pacotinho."],
    ["mesa_cheia","A mesa está cheia. Guarde um álbum na gaveta antes."],
    ["mesa_vazia","Escolha pelo menos um álbum para a mesa."],
    ["sem_album","Marque pelo menos um álbum para a criança."],
    ["meta_cumprida","A meta de folhas de hoje já foi cumprida."],
    ["convite_invalido","Convite inválido, vencido ou já usado."],
    ["codigo_invalido","Não existe criança com esse código. Confira se digitou certinho."],
    ["proprio_codigo","Esse é o seu código. Peça o código ao seu amigo."],
    ["ja_sao_amigos","Vocês já são amigos."],
    ["convite_pendente","Você já enviou um convite para essa criança. Agora é só esperar."],
    ["muitos_convites","Você já tem 10 convites esperando resposta. Cancele algum para enviar outro."],
    ["sem_permissao","Você não tem permissão para isso."],
    ["nao_sao_amigos","Vocês não são mais amigos."],
    ["amizade_invalida","Essa amizade não existe mais."],
    ["sem_repetida","Você não tem mais essa figurinha repetida."],
    ["amigo_ja_tem","Seu amigo já conseguiu essa figurinha."],
    ["amigo_sem_repetida","Seu amigo não tem mais essa repetida."],
    ["voce_ja_tem","Você já conseguiu essa figurinha."],
    ["pedido_repetido","Você já fez esse mesmo pedido de troca."],
    ["muitos_pedidos","Você já tem 10 pedidos de troca esperando. Cancele algum para fazer outro."],
    ["pedido_invalido","Esse pedido de troca não existe mais."],
    ["Password should be","A senha precisa ter pelo menos 8 caracteres."],
    ["rate limit","Muitas tentativas. Aguarde alguns minutos."],
    ["Failed to fetch","Sem conexão com a internet. Tente de novo."],
    ["NetworkError","Sem conexão com a internet. Tente de novo."],
    ["valid email","Digite um e-mail válido."],
    ["should be different","A nova senha precisa ser diferente da atual."]];
  for(var i=0;i<map.length;i++)if(m.indexOf(map[i][0])>=0)return map[i][1];
  return "Algo deu errado. Tente de novo.";
};
FC.isSessionErr=function(e){return !!(e&&String(e.message||"").indexOf("sessao_invalida")>=0)};

/* Códigos curtos: o hífen é só visual. O código de amigo (6) vira ABC-DEF; o do link do aluno (8) vira ABCD-EFGH.
   Links antigos (16 caracteres) ficam como estão. normCode devolve o código como o banco guarda (minúsculas, sem hífen). */
FC.fmtCode=function(c){
  c=String(c==null?"":c).replace(/[^A-Za-z0-9]/g,"");
  if(c.length===6)return (c.slice(0,3)+"-"+c.slice(3)).toUpperCase();
  if(c.length===8)return (c.slice(0,4)+"-"+c.slice(4)).toUpperCase();
  return c;
};
/* Versão do app: igual ao nome do cache em sw.js (um teste confere). Vai junto com os eventos de uso. */
FC.VERSAO="folhinha-v44";
FC.normCode=function(c){return String(c==null?"":c).replace(/[^A-Za-z0-9]/g,"").toLowerCase()};

FC.copy=function(text,input,what){
  what=what||"link";
  function fallback(){if(input){input.focus();input.select()}FC.toast("Selecione e copie o "+what+" manualmente.",true)}
  try{navigator.clipboard.writeText(text).then(function(){FC.toast(what==="código"?"Código copiado.":"Link copiado.")},fallback)}catch(e){fallback()}
};
/* Botão que pede um segundo toque para confirmar uma ação destrutiva. */
FC.confirmClick=function(btn,label,action){
  var orig=btn.textContent,armed=false,tm;
  btn.addEventListener("click",function(){
    if(!armed){armed=true;btn.textContent=label;btn.classList.add("danger");
      tm=setTimeout(function(){armed=false;btn.textContent=orig;btn.classList.remove("danger")},4000);return}
    clearTimeout(tm);armed=false;btn.textContent=orig;btn.classList.remove("danger");action();
  });
};

/* ---------- níveis ----------
   A grade (FC.LEVELS) é montada em grade1.js, a partir dos geradores do 1º ano. As metas de tempo (segundos para as 10 contas)
   precisam bater com a tabela public.levels no banco; testes/grade.test.js confere. */
FC.LEVELS=[];
FC.ordAno=function(n){return n+"º ano"};
/* Ano letivo de uma data (a virada vem dos parâmetros: mês e dia). */
FC.anoLetivo=function(day,pub){
  var y=Number(day.slice(0,4)),m=Number(day.slice(5,7)),d=Number(day.slice(8,10)),vm=pub?pub.virada_mes:1,vd=pub?pub.virada_dia:1;
  return y-((m<vm||(m===vm&&d<vd))?1:0);
};
/* Ano escolar do aluno hoje: calculado a partir do ano informado (nada é gravado na virada). null = não informado. */
FC.anoAluno=function(s,today,pub){
  if(!s.ano_escolar||!s.ano_ref)return null;
  return Math.min(9,Math.max(1,s.ano_escolar+FC.anoLetivo(today,pub)-s.ano_ref));
};
/* Nível inicial pelo ano escolar: o primeiro nível da grade daquele ano. -1 = a grade ainda não tem esse ano. */
FC.primeiroNivelDoAno=function(ano){for(var i=0;i<FC.LEVELS.length;i++)if(FC.LEVELS[i].ano===ano)return i;return -1};
/* Anos que já têm nível na grade (para o cadastro só oferecer o que existe). */
FC.anosComGrade=function(){var r=[];FC.LEVELS.forEach(function(l){if(r.indexOf(l.ano)<0)r.push(l.ano)});return r.sort(function(a,b){return a-b})};
FC.shuffle=function(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a};
/* 'keep' = contas que já devem estar na folha (reforço); o resto é sorteado sem repetir. */
/* Item como vai para o banco: só pre, post, a e (se houver) extra (figura e opções). */
FC.plainItem=function(p){var o={pre:p.pre,post:p.post||"",a:p.a};if(p.extra)o.extra=p.extra;return o};
/* Identidade de uma conta, para não repetir na mesma folha: a mesma pergunta com a mesma figura e a mesma resposta certa é a mesma conta,
   mesmo que as opções erradas, a ordem das opções ou a cor do desenho sejam outras. */
function figKey(f){return f?JSON.stringify(f,function(k,v){return k==="color"?undefined:v}):""}
function itemKey(p){
  if(p.key)return p.key;   /* o gerador pode definir a identidade (não vai para o banco) */
  var ex=p.extra;
  if(!ex)return p.pre+"|"+(p.post||"");
  if(ex.opts)return p.pre+"|"+figKey(ex.fig)+"|"+figKey(ex.opts[p.a-1]||null);
  return p.pre+"|"+(p.post||"")+"|"+figKey(ex.fig);
}
FC.itemKey=itemKey;
/* Revisão (etapa 4a): 2 das 10 contas de cada folha vêm de níveis anteriores; no teto, a folha inteira é de revisão.
   Sorteio do nível: 60% entre os 3 últimos níveis concluídos (30%, 20% e 10%) e 40% em qualquer um dos anteriores.
   No teto o próprio nível atual entra também (20%), depois os 3 anteriores (15% cada) e o resto (35%). */
function reviewLevel(levelIdx,teto){
  var r=Math.random(),k;
  if(teto){
    if(r<.2)return levelIdx;
    if(r<.65){k=r<.35?1:r<.5?2:3;if(levelIdx-k>=0)return levelIdx-k}
    return Math.floor(Math.random()*(levelIdx+1));
  }
  if(r<.6){k=r<.3?1:r<.5?2:3;if(levelIdx-k>=0)return levelIdx-k}
  return Math.floor(Math.random()*levelIdx);
}
FC.reviewLevel=reviewLevel;
/* levelIdx: nível atual; keep: contas de reforço (até 4); opts.teto: folha de revisão do teto. */
FC.makeItems=function(levelIdx,keep,opts){
  opts=opts||{};
  var teto=!!opts.teto&&levelIdx>0,revN=teto?10:(levelIdx>0?2:0);
  var items=(keep||[]).slice(0,teto?4:10-revN-2).map(FC.plainItem),seen={},g=0,tries=0;
  items.forEach(function(p){seen[itemKey(p)]=1});
  var added=0;
  while(added<revN&&items.length<10&&g++<revN*40){
    var lv=reviewLevel(levelIdx,teto),q=FC.LEVELS[lv].gen(),kq=itemKey(q);
    if(seen[kq])continue;seen[kq]=1;q._rev=true;items.push(q);added++;
  }
  var cnt={},capTries=0;
  /* p.limits = [[grupo, máximo], ...]: no máximo "máximo" contas do mesmo grupo na folha (por exemplo, o mesmo número,
     ou 5 somas). Serve também p.grp/p.cap, para um grupo só. */
  function lims(p){return p.limits||(p.grp?[[p.grp,p.cap]]:[])}
  function conta(p){lims(p).forEach(function(l){cnt[l[0]]=(cnt[l[0]]||0)+1})}
  items.forEach(conta);
  while(items.length<10&&tries++<400){
    var p=FC.LEVELS[levelIdx].gen(),k=itemKey(p);
    if(seen[k])continue;
    if(lims(p).some(function(l){return (cnt[l[0]]||0)>=l[1]})&&capTries++<200)continue;
    seen[k]=1;conta(p);items.push(p);
  }
  /* Se os limites e as tentativas acabaram e ainda faltam contas (nível de poucas combinações, ou revisão que ocupa vagas dos mesmos grupos),
     tenta de novo sem os limites, mas ainda sem repetir conta: repetir só como último recurso. */
  tries=0;
  while(items.length<10&&tries++<400){
    var p2=FC.LEVELS[levelIdx].gen(),k2=itemKey(p2);
    if(seen[k2])continue;
    seen[k2]=1;items.push(p2);
  }
  while(items.length<10)items.push(FC.LEVELS[levelIdx].gen());
  return items;
};
/* Mesma curva do banco: 100% até a meta; depois cai em ritmo crescente até o piso de 20% (no dobro da meta). */
FC.timeFactor=function(secs,target){
  if(secs<=target)return 1;
  var x=(secs-target)/target;return Math.max(.2,1-.8*Math.min(1,x*x));
};
/* Nome curto de um nível pelo índice. */
FC.lv=function(i){var l=FC.LEVELS[i];return l?l.id:"?"};

/* ---------- sons (sintetizados, sem arquivos) e confete ---------- */
var actx=null;
function audio(){
  try{
    if(!actx){var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;actx=new C()}
    if(actx.state==="suspended")actx.resume();
    return actx;
  }catch(e){return null}
}
function tone(freq,t0,dur,type,gain){
  var c=audio();if(!c)return;
  var o=c.createOscillator(),g=c.createGain(),t=c.currentTime+t0;
  o.type=type||"sine";o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(gain||0.2,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+0.05);
}
/* O navegador só libera o som depois de um toque; preparamos o áudio no primeiro toque do aluno. */
["pointerdown","keydown","touchstart"].forEach(function(ev){
  window.addEventListener(ev,function unlock(){audio();window.removeEventListener(ev,unlock)},{passive:true});
});
FC.sfx={
  enabled:function(){try{return localStorage.getItem("fc_sound")!=="off"}catch(e){return true}},
  set:function(on){try{localStorage.setItem("fc_sound",on?"on":"off")}catch(e){}},
  stamp:function(){if(!FC.sfx.enabled())return;tone(150,0,0.2,"triangle",0.4);tone(85,0.02,0.25,"sine",0.45);tone(880,0.14,0.14,"sine",0.12)},
  levelUp:function(){
    if(!FC.sfx.enabled())return;
    [523.25,659.25,783.99,1046.5].forEach(function(f,i){tone(f,i*0.13,0.35,"triangle",0.22)});
    tone(1318.5,0.58,0.7,"sine",0.18);tone(1568,0.66,0.8,"sine",0.12);
  },
  rare:function(){if(!FC.sfx.enabled())return;[1568,1976,2349,3136].forEach(function(f,i){tone(f,i*0.09,0.4,"sine",0.14)});tone(784,0,0.6,"triangle",0.1)},
  ultra:function(){   // fanfarra grande: escala subindo e acorde final brilhante
    if(!FC.sfx.enabled())return;
    [523.25,659.25,783.99,1046.5,1318.5,1568,2093].forEach(function(f,i){tone(f,i*0.1,0.45,"triangle",0.2)});
    [1046.5,1318.5,1568,2093].forEach(function(f){tone(f,0.85,1.1,"sine",0.14)});tone(261.6,0.85,1.1,"sawtooth",0.06);
  },
  flip:function(){if(!FC.sfx.enabled())return;tone(420,0,0.09,"triangle",0.1);tone(760,0.07,0.12,"sine",0.09)},
  pack:function(){   // rasgar o pacotinho e revelar
    if(!FC.sfx.enabled())return;
    tone(260,0,0.1,"sawtooth",0.08);tone(420,0.06,0.1,"sawtooth",0.07);tone(640,0.12,0.1,"sawtooth",0.06);
    [1318.5,1568,2093,2637].forEach(function(f,i){tone(f,0.5+i*0.08,0.3,"sine",0.15)});
  }
};
FC.confetti=function(o){
  o=o||{};
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  var wrap=document.createElement("div");wrap.className="confetti";
  var cols=o.gold?["#FFD45A","#F5C432","#FFF3B0","#E0A21F","#ffffff"]:["var(--accent)","var(--mark)","var(--ok)","var(--warn)","var(--ink)"];
  for(var i=0;i<(o.n||48);i++){
    var p=document.createElement("i");
    p.style.left=Math.random()*100+"%";p.style.background=cols[i%cols.length];
    p.style.setProperty("--dx",(Math.random()*180-90)+"px");p.style.setProperty("--rot",(Math.random()*900-450)+"deg");
    p.style.animationDuration=(1.8+Math.random()*1.6)+"s";p.style.animationDelay=(Math.random()*0.5)+"s";
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);setTimeout(function(){wrap.remove()},4400);
};

/* ---------- período da meta (sempre a semana) ---------- */
FC.periodOf=function(day,close){
  var end=FC.weekEnd(day,close);return{start:FC.addDays(end,-6),end:end};
};
FC.packSvg=function(){
  return '<svg viewBox="0 0 64 76" class="pack-svg" aria-hidden="true"><path d="M8 4l5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5v62l-5 5-5-5-5 5-5-5-5 5-5-5-5 5-5-5z" fill="#1B47BD"/>'+
    '<path d="M12 8h14L18 66h-6z" fill="#fff" opacity=".18"/><circle cx="32" cy="36" r="14" fill="#FFB92B"/>'+
    '<path d="M32 27l3 6.4 7 .8-5.2 4.8 1.4 6.9L32 42.4l-6.2 3.5 1.4-6.9-5.2-4.8 7-.8z" fill="#fff"/></svg>';
};
/* Aviso no meio da tela (usado ao ganhar figurinha, no verso da figurinha e na galeria do adulto). */
FC.overlay=function(html,opts){
  opts=opts||{};
  var ov=document.createElement("div");ov.className="overlay";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
  ov.innerHTML='<div class="ov-card'+(opts.wide?" wide":"")+(opts.cls?" "+opts.cls:"")+'">'+html+'<div class="actions ov-actions"><button class="btn" id="ovClose">'+(opts.button||"Fechar")+'</button></div></div>';
  document.body.appendChild(ov);
  function key(e){if(e.key!=="Escape")return;var all=document.querySelectorAll(".overlay");if(all[all.length-1]===ov)close()}   // Esc fecha só a janela de cima
  function close(){if(!ov.parentNode)return;ov.remove();document.removeEventListener("keydown",key);if(opts.onClose)opts.onClose()}
  document.addEventListener("keydown",key);
  ov.addEventListener("click",function(e){if(e.target===ov)close()});
  var btn=ov.querySelector("#ovClose");btn.onclick=close;btn.focus();
  return{close:close,el:ov};
};
/* Próximo marco de sequência: 3, 7, 14 e depois a cada 30 dias. Precisa bater com public._next_marco no banco. */
FC.nextMarco=function(st){
  if(st<3)return{at:3,packs:2};
  if(st<7)return{at:7,packs:3};
  if(st<14)return{at:14,packs:5};
  return{at:(Math.floor(st/30)+1)*30,packs:5};
};
/* Tipo do dia para um aluno: "study" (dia de estudo: cota e sequência), "free" (dia livre: joga se quiser, sem perder a sequência) ou "rest". */
FC.dayKind=function(s,day){
  if(day<s.start_date)return "rest";
  var d=FC.dow(day);
  if(s.study_days.indexOf(d)>=0)return "study";
  return (s.free_days||[]).indexOf(d)>=0?"free":"rest";
};
/* Sequência que vale hoje para um aluno (linha de students). Mesma regra de public._streak_view:
   só contam dias de estudo, e faltar a um deles zera. */
FC.streakNow=function(s,today){
  if(!s.last_streak_day)return 0;
  function isStudy(d){return s.study_days.indexOf(FC.dow(d))>=0&&d>=s.start_date}
  function prev(d){for(var i=1;i<=14;i++){var x=FC.addDays(d,-i);if(x<s.start_date)return null;if(isStudy(x))return x}return null}
  var ref=isStudy(today)?today:prev(today);
  if(!ref)return 0;
  if(s.last_streak_day===ref)return s.streak;
  if(ref===today&&s.last_streak_day===prev(ref))return s.streak;
  return 0;
};
/* Perseverança: sequência de dias de estudo com a cota fechada e o caminho até o próximo marco.
   i = {streak,best_streak,next_marco}. */
FC.streakHtml=function(i,o){
  o=o||{};
  var st=i.streak||0,best=i.best_streak||0,nx=i.next_marco||FC.nextMarco(st);
  var base=nx.at<=3?0:nx.at<=7?3:nx.at<=14?7:nx.at<=30?14:nx.at-30;
  var pct=Math.max(0,Math.min(100,(st-base)/(nx.at-base)*100)),left=nx.at-st;
  var msg=o.adult?"Próximo marco: "+nx.at+" dias seguidos, com "+nx.packs+" pacotinhos extras.":
    "Faltam <b>"+left+"</b> dia"+(left>1?"s":"")+" de estudo para ganhar "+nx.packs+" pacotinhos extras.";
  return '<div class="trail"><div class="eyebrow">Perseverança</div>'+
    '<div class="big-pts">'+st+'<span> '+(st===1?"dia seguido":"dias seguidos")+'</span></div>'+
    '<div class="trail-line"><div class="track" role="progressbar" aria-label="Caminho até o próximo marco de sequência" aria-valuemin="0" aria-valuemax="'+nx.at+'" aria-valuenow="'+st+'">'+
    '<div class="fill" style="width:'+pct.toFixed(1)+'%"></div></div><div class="goalicon">'+FC.packSvg()+'</div></div>'+
    '<p class="small-t">'+msg+'</p>'+
    '<p class="muted small-t">Melhor sequência: <b>'+best+'</b> dia'+(best===1?"":"s")+'. '+
    (o.adult?"Fechar todas as folhas de um dia de estudo soma 1 dia. Faltar a um dia de estudo zera a sequência.":
      "Fechou todas as folhas do dia? Soma 1 dia. Faltar a um dia de estudo zera a sequência.")+'</p></div>';
};

/* ---------- ícones, abas (topo) e menu inferior (celular) ---------- */
FC.icon=function(name,cls){return '<svg class="i'+(cls?" "+cls:"")+'" aria-hidden="true"><use href="#i-'+name+'"/></svg>'};
FC.tabState={};
function tabKey(scope){return "fc_tab_"+scope}
/* Monta o cabeçalho, as abas e os painéis. Todos os painéis ficam na página; trocar de aba só mostra um e esconde os outros.
   o: {scope, head, tabs:[{id,label,icon,html}], active} */
FC.tabsShell=function(o){
  var saved=FC.tabState[o.scope];
  if(!saved){try{saved=sessionStorage.getItem(tabKey(o.scope))}catch(e){}}
  var ids=o.tabs.map(function(t){return t.id});
  var active=ids.indexOf(saved)>=0?saved:(o.active||ids[0]);
  FC.tabState[o.scope]=active;
  var top=o.tabs.map(function(t){
    return '<button type="button" class="ntab'+(t.id===active?" on":"")+'" role="tab" aria-selected="'+(t.id===active)+'" data-tab="'+t.id+'">'+FC.icon(t.icon)+'<span>'+t.label+'</span></button>';
  }).join("");
  var bottom=o.tabs.map(function(t){
    return '<button type="button" class="nbtn'+(t.id===active?" on":"")+'" data-tab="'+t.id+'" aria-label="'+t.label+'"'+(t.id===active?' aria-current="page"':'')+'><span class="pill">'+FC.icon(t.icon)+'</span><span>'+(t.short||t.label)+'</span></button>';
  }).join("");
  var panes=o.tabs.map(function(t){
    return '<section class="pane" role="tabpanel" data-pane="'+t.id+'"'+(t.id===active?"":" hidden")+'>'+t.html+'</section>';
  }).join("");
  return '<div class="shell" data-scope="'+o.scope+'">'+o.head+'<nav class="navtop" role="tablist" aria-label="Seções">'+top+'</nav><div class="panes">'+panes+'</div><nav class="navbottom" aria-label="Menu">'+bottom+'</nav></div>';
};
/* Liga os botões das abas. Chame depois de FC.render. onChange(id) é opcional. */
FC.bindTabs=function(scope,onChange){
  var root=FC.$('.shell[data-scope="'+scope+'"]');if(!root)return;
  document.body.classList.add("has-nav");
  function go(id,noScroll){
    FC.tabState[scope]=id;try{sessionStorage.setItem(tabKey(scope),id)}catch(e){}
    FC.$$("[data-tab]",root).forEach(function(b){
      var on=b.getAttribute("data-tab")===id;b.classList.toggle("on",on);
      if(b.classList.contains("ntab"))b.setAttribute("aria-selected",on);else{if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")}
    });
    FC.$$(".pane",root).forEach(function(p){p.hidden=p.getAttribute("data-pane")!==id});
    if(!noScroll)window.scrollTo(0,0);
    if(onChange)onChange(id);
  }
  FC.$$("[data-tab]",root).forEach(function(b){b.onclick=function(){go(b.getAttribute("data-tab"))}});
  FC.gotoTab=go;
};

/* ---------- instalação como app (PWA) ---------- */
var deferredInstall=null;
FC.isStandalone=function(){return window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true};
FC.installBox=function(){return '<div id="installBox" hidden></div>'};
FC.refreshInstall=function(){
  var box=FC.$("#installBox");if(!box)return;
  if(FC.isStandalone()){box.hidden=true;return}
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  if(deferredInstall){
    box.hidden=false;
    box.innerHTML='<div class="panel installbox"><img src="icons/icon-192.png" width="48" height="48" alt=""><div class="grow"><b>Instalar no aparelho</b><div class="muted small-t">Abre direto da tela inicial, como um app.</div></div><button class="btn small" id="doInstall">Instalar</button></div>';
    FC.$("#doInstall").onclick=async function(){
      try{deferredInstall.prompt();await deferredInstall.userChoice}catch(e){}
      deferredInstall=null;FC.refreshInstall();
    };
  }else if(ios){
    box.hidden=false;
    box.innerHTML='<div class="panel installbox"><img src="icons/icon-192.png" width="48" height="48" alt=""><div class="grow"><b>Instalar no iPhone ou iPad</b><div class="muted small-t">Toque em Compartilhar e depois em “Adicionar à Tela de Início”.</div></div></div>';
  }else box.hidden=true;
};
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferredInstall=e;FC.refreshInstall()});
window.addEventListener("appinstalled",function(){deferredInstall=null;FC.refreshInstall()});

/* Cada link de aluno vira um app próprio: o manifesto é refeito com o link dele como página inicial. */
FC.studentManifest=async function(code){
  try{
    var m=await (await fetch("manifest.webmanifest")).json();
    var base=location.origin+location.pathname.replace(/[^/]*$/,"");
    var start=base+"?aluno="+encodeURIComponent(code);
    m.id=start;m.start_url=start;m.scope=base;
    m.icons=m.icons.map(function(i){i.src=base+i.src;return i});
    var link=document.querySelector('link[rel="manifest"]');
    link.href=URL.createObjectURL(new Blob([JSON.stringify(m)],{type:"application/manifest+json"}));
  }catch(e){}
};
})();
