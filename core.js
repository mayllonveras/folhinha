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
FC.render=function(html){FC.$("#app").innerHTML=html;window.scrollTo(0,0)};
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
    ["meta_cumprida","A meta de folhas de hoje já foi cumprida."],
    ["convite_invalido","Convite inválido, vencido ou já usado."],
    ["sem_permissao","Você não tem permissão para isso."],
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

FC.copy=function(text,input){
  function fallback(){if(input){input.focus();input.select()}FC.toast("Selecione e copie o link manualmente.",true)}
  try{navigator.clipboard.writeText(text).then(function(){FC.toast("Link copiado.")},fallback)}catch(e){fallback()}
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
   As metas de tempo (segundos para as 10 contas) precisam bater com a tabela public.levels no banco. */
var rnd=function(a,b){return Math.floor(Math.random()*(b-a+1))+a};
var pick=function(a){return a[rnd(0,a.length-1)]};
function add(a,b){return{pre:a+" + "+b+" =",post:"",a:a+b}}
function sub(a,b){return{pre:a+" − "+b+" =",post:"",a:a-b}}
function mul(a,b){return{pre:a+" × "+b+" =",post:"",a:a*b}}
function div(a,b){return{pre:a+" ÷ "+b+" =",post:"",a:a/b}}
function flip(f,a,b){return Math.random()<.5?f(a,b):f(b,a)}
function eq(pre,x){return{pre:pre+" → x =",post:"",a:x}}
var G={
 seq:function(){var s=rnd(1,45),m=rnd(1,3),q=[0,1,2,3,4].map(function(i){return s+i});
   return{pre:q.slice(0,m).join(", ")+",",post:","+q.slice(m+1).join(", "),a:q[m]}},
 add6:function(){return flip(add,rnd(1,9),rnd(1,3))},
 add10:function(){var a=rnd(1,9);return add(a,rnd(1,10-a))},
 sub10:function(){var c=rnd(2,10);return sub(c,rnd(1,c))},
 mix10:function(){return Math.random()<.5?G.add10():G.sub10()},
 add20a:function(){var u=rnd(0,8);return flip(add,10+u,rnd(1,9-u))},          /* 12 + 5: não passa da dezena */
 add20b:function(){var a=rnd(2,9);return add(a,rnd(Math.max(2,11-a),9))},      /* 8 + 7: passa da dezena */
 sub20a:function(){var u=rnd(1,9);return sub(10+u,rnd(1,u))},                  /* 17 − 5: não passa da dezena */
 sub20b:function(){var u=rnd(1,8);return sub(10+u,rnd(u+1,9))},                /* 15 − 8: passa da dezena */
 mix20:function(){
   if(Math.random()<.5){var a=rnd(2,18),b=rnd(2,Math.max(2,20-a));if(a+b>20)b=20-a;return add(a,b)}
   return sub(rnd(11,20),rnd(2,9))},
 tens:function(){
   var t=rnd(0,3),a,b,u;
   if(t===0){a=rnd(1,8);return add(a*10,rnd(1,10-a)*10)}                        /* 30 + 20 */
   if(t===1){a=rnd(3,10);return sub(a*10,rnd(1,a-1)*10)}                        /* 80 − 50 */
   if(t===2){u=rnd(0,8);return flip(add,rnd(1,9)*10+u,rnd(1,9-u))}              /* 34 + 5 */
   u=rnd(1,9);return sub(rnd(1,9)*10+u,rnd(1,u))},                              /* 38 − 5 */
 add2a:function(){var t1=rnd(1,8),t2=rnd(1,9-t1),u1=rnd(0,9),u2=rnd(0,9-u1);return add(10*t1+u1,10*t2+u2)},   /* 23 + 45 */
 add2b:function(){var t1=rnd(1,7),t2=rnd(1,8-t1),u1=rnd(2,9),u2=rnd(10-u1,9);return add(10*t1+u1,10*t2+u2)}, /* 47 + 38 */
 sub2a:function(){var t2=rnd(1,8),t1=rnd(t2+1,9),u1=rnd(1,9),u2=rnd(0,u1);return sub(10*t1+u1,10*t2+u2)},     /* 78 − 45 */
 sub2b:function(){var t2=rnd(1,8),t1=rnd(t2+1,9),u1=rnd(0,8),u2=rnd(u1+1,9);return sub(10*t1+u1,10*t2+u2)},   /* 82 − 29 */
 mix2:function(){
   if(Math.random()<.5){var a=rnd(10,89);return add(a,rnd(10,99-a))}
   var c=rnd(30,99);return sub(c,rnd(10,c-5))},
 table:function(ts,bmin){return function(){return flip(mul,pick(ts),rnd(bmin,9))}},
 divs:function(ds){return function(){var d=pick(ds);return div(d*rnd(2,9),d)}},
 eqAdd:function(){var a=rnd(2,20),x=rnd(2,20);return eq("x + "+a+" = "+(x+a),x)},
 eqSub:function(){var a=rnd(2,20),x=rnd(a+1,a+20);return eq("x − "+a+" = "+(x-a),x)},
 eqMul:function(){var a=rnd(2,9),x=rnd(2,9);return eq(a+" × x = "+(a*x),x)},
 eqMix:function(){return pick([G.eqAdd,G.eqSub,G.eqMul])()}
};
function L(group,id,name,hint,target,gen){return{group:group,id:id,name:name,hint:hint,target:target,gen:gen}}
FC.LEVELS=[
 L("Contagem","1","Sequências numéricas","Complete o número que falta na fila.",90,G.seq),
 L("Primeiras somas","2","Somar de 1 a 3","Adições com 1, 2 ou 3 a mais.",90,G.add6),
 L("Até 10","3","Somas até 10","Adições com resultado de até 10.",90,G.add10),
 L("Até 10","4","Subtrações até 10","Tirar de um número de até 10.",100,G.sub10),
 L("Até 10","5","Somas e subtrações até 10","Adições e subtrações misturadas.",100,G.mix10),
 L("Até 20","6","Somas até 20, sem passar da dezena","Como 12 + 5.",100,G.add20a),
 L("Até 20","7","Somas que passam da dezena","Como 8 + 7.",120,G.add20b),
 L("Até 20","8","Subtrações até 20, sem passar da dezena","Como 17 − 5.",100,G.sub20a),
 L("Até 20","9","Subtrações que passam da dezena","Como 15 − 8.",130,G.sub20b),
 L("Até 20","10","Somas e subtrações até 20","Todas as contas até 20, misturadas.",120,G.mix20),
 L("Dezenas","11","Dezenas inteiras e unidades","Como 30 + 20, 80 − 50, 34 + 5 e 38 − 5.",120,G.tens),
 L("Dezenas","12","Somas de dois algarismos, sem vai-um","Como 23 + 45.",150,G.add2a),
 L("Dezenas","13","Somas de dois algarismos, com vai-um","Como 47 + 38.",180,G.add2b),
 L("Dezenas","14","Subtrações de dois algarismos, sem empréstimo","Como 78 − 45.",150,G.sub2a),
 L("Dezenas","15","Subtrações de dois algarismos, com empréstimo","Como 82 − 29.",180,G.sub2b),
 L("Dezenas","16","Contas com dezenas, misturadas","Somas e subtrações de dois algarismos.",180,G.mix2),
 L("Tabuada","17","Tabuadas do 1, do 2 e do 10","Os primeiros passos da multiplicação.",90,G.table([1,2,10],1)),
 L("Tabuada","18","Tabuadas do 3 e do 4","Multiplicação por 3 e por 4.",110,G.table([3,4],2)),
 L("Tabuada","19","Tabuadas do 5 e do 6","Multiplicação por 5 e por 6.",110,G.table([5,6],2)),
 L("Tabuada","20","Tabuadas do 7 e do 8","Multiplicação por 7 e por 8.",120,G.table([7,8],2)),
 L("Tabuada","21","Tabuada do 9","Multiplicação por 9.",100,G.table([9],2)),
 L("Tabuada","22","Tabuada completa","Todas as tabuadas de 2 a 9, misturadas.",120,G.table([2,3,4,5,6,7,8,9],2)),
 L("Divisão","23","Divisão por 2, 3, 4 e 5","Divisões exatas, usando a tabuada de trás para frente.",120,G.divs([2,3,4,5])),
 L("Divisão","24","Divisão por 6, 7, 8 e 9","Divisões exatas com os divisores maiores.",140,G.divs([6,7,8,9])),
 L("Divisão","25","Divisão exata, misturada","Divisões por 2 a 9, misturadas.",150,G.divs([2,3,4,5,6,7,8,9])),
 L("Equações","26","Descubra o x: soma","Como x + 7 = 15.",150,G.eqAdd),
 L("Equações","27","Descubra o x: subtração","Como x − 6 = 12.",160,G.eqSub),
 L("Equações","28","Descubra o x: multiplicação","Como 4 × x = 28.",150,G.eqMul),
 L("Equações","29","Descubra o x: misturado","Os três tipos de equação.",210,G.eqMix)
];
FC.shuffle=function(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a};
/* 'keep' = contas que já devem estar na folha (reforço); o resto é sorteado sem repetir. */
FC.makeItems=function(levelIdx,keep){
  var items=(keep||[]).map(function(p){return{pre:p.pre,post:p.post||"",a:p.a}}),seen={},g=0;
  items.forEach(function(p){seen[p.pre+"|"+p.post]=1});
  while(items.length<10&&g++<400){
    var p=FC.LEVELS[levelIdx].gen(),k=p.pre+"|"+p.post;
    if(seen[k])continue;seen[k]=1;items.push(p);
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
  chest:function(){   // rangido da tampa + chuva de moedas
    if(!FC.sfx.enabled())return;
    tone(110,0,0.4,"sawtooth",0.09);tone(150,0.1,0.35,"sawtooth",0.08);
    [1046.5,1318.5,1568,2093,2637].forEach(function(f,i){tone(f,0.45+i*0.09,0.3,"sine",0.15)});
    tone(3136,0.95,0.5,"sine",0.08);
  },
  rare:function(){if(!FC.sfx.enabled())return;[1568,1976,2349,3136].forEach(function(f,i){tone(f,i*0.09,0.4,"sine",0.14)});tone(784,0,0.6,"triangle",0.1)},
  ultra:function(){   // fanfarra grande: escala subindo e acorde final brilhante
    if(!FC.sfx.enabled())return;
    [523.25,659.25,783.99,1046.5,1318.5,1568,2093].forEach(function(f,i){tone(f,i*0.1,0.45,"triangle",0.2)});
    [1046.5,1318.5,1568,2093].forEach(function(f){tone(f,0.85,1.1,"sine",0.14)});tone(261.6,0.85,1.1,"sawtooth",0.06);
  },
  star:function(){if(!FC.sfx.enabled())return;[880,1108.7,1318.5,1760].forEach(function(f,i){tone(f,i*0.1,0.3,"triangle",0.2)});tone(2349,0.45,0.6,"sine",0.1)},
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

/* ---------- período do prêmio (semana ou mês), pontos de passagem e baú ---------- */
FC.MONTHS=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
FC.periodOf=function(day,mode,close){
  if(mode==="mensal"){var ms=day.slice(0,7)+"-01",d=FC.date(ms);d.setMonth(d.getMonth()+1);d.setDate(0);return{start:ms,end:FC.ymd(d)}}
  var end=FC.weekEnd(day,close);return{start:FC.addDays(end,-6),end:end};
};
FC.studyDaysIn=function(prog,ps,pe){
  var out=[];
  for(var d=ps;d<=pe;d=FC.addDays(d,1))if(d>=prog.start_date&&prog.study_days.indexOf(FC.dow(d))>=0)out.push(d);
  return out;
};
/* Pontos de passagem do mês: ao fim de cada semana, a parte da meta proporcional aos dias de estudo já passados. */
FC.milestones=function(prog,ps,pe,goal){
  var days=FC.studyDaysIn(prog,ps,pe),out=[];
  if(!days.length||goal<=0)return out;
  for(var d=ps;d<pe;d=FC.addDays(d,1)){
    if(FC.dow(d)!==prog.week_close_dow)continue;
    var cnt=days.filter(function(x){return x<=d}).length;
    if(cnt===0||cnt>=days.length)continue;           // semana sem estudo, ou já é o fim do mês (o baú)
    var t=Math.round(goal*cnt/days.length/10)*10;
    if(t<=0||t>=goal)continue;
    if(out.length&&out[out.length-1].target>=t)continue;
    out.push({date:d,target:t});
  }
  return out;
};
FC.chestSvg=function(){
  var rays="";
  for(var a=-70;a<=70;a+=20){var r=a*Math.PI/180;rays+='<line x1="60" y1="46" x2="'+(60+Math.sin(r)*52).toFixed(1)+'" y2="'+(46-Math.cos(r)*52).toFixed(1)+'"/>'}
  return '<svg viewBox="0 0 120 104" class="chest-svg" aria-hidden="true">'+
    '<ellipse class="c-shadow" cx="60" cy="98" rx="48" ry="5"/><g class="rays">'+rays+'</g>'+
    '<g class="c-inside"><ellipse class="c-gold" cx="60" cy="50" rx="40" ry="9"/><circle class="c-coin" cx="40" cy="45" r="6"/><circle class="c-coin" cx="60" cy="41" r="7"/><circle class="c-coin" cx="80" cy="45" r="6"/></g>'+
    '<rect class="c-wood" x="14" y="48" width="92" height="46" rx="7"/><rect class="c-dark" x="14" y="72" width="92" height="5"/>'+
    '<rect class="c-metal" x="28" y="48" width="10" height="46"/><rect class="c-metal" x="82" y="48" width="10" height="46"/>'+
    '<g class="lid"><path class="c-wood" d="M14 50 V38 C14 14 106 14 106 38 V50 Z"/><path class="c-dark" d="M14 44 H106 V50 H14 Z"/>'+
    '<rect class="c-metal" x="28" y="29" width="10" height="21"/><rect class="c-metal" x="82" y="29" width="10" height="21"/>'+
    '<text class="q" x="60" y="40" text-anchor="middle">?</text></g>'+
    '<g class="lock"><rect class="c-gold" x="52" y="44" width="16" height="17" rx="3"/><circle class="c-dark" cx="60" cy="51" r="2.6"/><rect class="c-dark" x="59" y="52" width="2" height="5"/></g></svg>';
};
FC.starSvg=function(on){
  return '<svg viewBox="0 0 24 24" class="star-svg'+(on===false?"":" on")+'" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
};
FC.packSvg=function(){
  return '<svg viewBox="0 0 100 120" class="pack-svg" aria-hidden="true">'+
    '<path class="pk-body" d="M16 8 L24 14 L32 8 L40 14 L48 8 L56 14 L64 8 L72 14 L80 8 L84 14 V106 L80 112 L72 106 L64 112 L56 106 L48 112 L40 106 L32 112 L24 106 L16 112 L12 106 V14Z"/>'+
    '<path class="pk-shine" d="M22 20 H46 L30 100 H22Z"/>'+
    '<circle class="pk-badge" cx="50" cy="60" r="22"/><path class="pk-star" d="M50 44l4.6 9.6 10.4 1.3-7.7 7.2 2 10.4L50 67.5 40.7 72.5l2-10.4-7.7-7.2 10.4-1.3z"/>'+
    '<text class="pk-q" x="50" y="102" text-anchor="middle">?</text></svg>';
};
/* Aviso no meio da tela (usado ao ganhar estrela ou figurinha e na galeria de figurinhas do adulto). */
FC.overlay=function(html,opts){
  opts=opts||{};
  var ov=document.createElement("div");ov.className="overlay";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
  ov.innerHTML='<div class="ov-card'+(opts.wide?" wide":"")+(opts.cls?" "+opts.cls:"")+'">'+html+'<div class="actions ov-actions"><button class="btn" id="ovClose">'+(opts.button||"Fechar")+'</button></div></div>';
  document.body.appendChild(ov);
  function key(e){if(e.key==="Escape")close()}
  function close(){if(!ov.parentNode)return;ov.remove();document.removeEventListener("keydown",key);if(opts.onClose)opts.onClose()}
  document.addEventListener("keydown",key);
  ov.addEventListener("click",function(e){if(e.target===ov)close()});
  var btn=ov.querySelector("#ovClose");btn.onclick=close;btn.focus();
  return{close:close,el:ov};
};
/* Trilha até a recompensa. p = {mode,start,end,points,goal,reached,reward}. o.system: bau | estrelas | figurinhas.
   No baú, a criança só recebe o texto do prêmio quando ele abre. */
FC.trailHtml=function(p,o){
  o=o||{};
  var sys=o.system||"bau",goal=p.goal||0,pts=p.points||0,from=o.fromPoints!=null?o.fromPoints:pts,miles=o.miles||[],mensal=p.mode==="mensal";
  var pct=function(v){return goal>0?Math.min(100,v/goal*100):0};
  var pins=miles.map(function(m,i){
    return '<span class="pin'+(from>=m.target?" hit":"")+'" data-hit="'+(pts>=m.target?1:0)+'" style="left:'+Math.min(96,pct(m.target)).toFixed(1)+'%" title="Semana '+(i+1)+': '+m.target+' pontos">'+(i+1)+'</span>';
  }).join("");
  var legend=miles.length?'<div class="legend">'+miles.map(function(m,i){
    return '<span class="chip'+(from>=m.target?" hit":"")+'" data-hit="'+(pts>=m.target?1:0)+'">'+(from>=m.target?"✓ ":"")+'Semana '+(i+1)+' · '+m.target+' pontos</span>';
  }).join("")+'</div>':"";
  var left=Math.max(0,goal-pts),next=null;
  for(var i=0;i<miles.length;i++)if(pts<miles[i].target){next=miles[i];break}
  var dest=sys==="bau"?"o baú":sys==="estrelas"?"a estrela":"o pacotinho";
  var hint="";
  if(!p.reached&&mensal&&miles.length)hint=next?'Próximo ponto no caminho: <b>'+next.target+'</b> (faltam '+(next.target-pts)+').':'Você passou por todos os pontos do caminho. Falta só '+dest+'.';
  var closes=sys==="bau"?(mensal?"O baú do mês fecha dia "+FC.dm(p.end)+".":"O baú da semana fecha "+FC.DOW_LONG[FC.dow(p.end)].toLowerCase()+", dia "+FC.dm(p.end)+"."):
    (mensal?"A meta do mês fecha dia "+FC.dm(p.end)+".":"A meta da semana fecha "+FC.DOW_LONG[FC.dow(p.end)].toLowerCase()+", dia "+FC.dm(p.end)+".");
  var rw=p.reward?FC.esc(p.reward):"",box,open;
  if(sys==="bau"){
    if(o.adult){
      open=!!p.reached;
      box='<div class="prizebox'+(p.reached?" show":"")+'"><div class="pz-closed">Prêmio no baú: <b>'+(rw||"nenhum definido")+'</b>. Faltam <b>'+left+'</b> pontos para abrir.</div>'+
        '<div class="pz-open"><div class="pz-title">Baú aberto!</div><div class="pz-name">Prêmio: <b>'+(rw||"nenhum definido")+'</b></div></div></div>';
    }else{
      var show=!!p.reached&&!o.opening;open=show;
      box='<div class="prizebox'+(show?" show":"")+'" id="prizebox"><div class="pz-closed">'+
        (o.opening?'Você chegou ao baú!':'Dentro do baú tem um <b>prêmio escondido</b>. Faltam <b>'+left+'</b> pontos para abrir.')+'</div>'+
        '<div class="pz-open"><div class="pz-title">Baú aberto!</div><div class="pz-name">'+(rw?'Seu prêmio: <b>'+rw+'</b>':'Meta batida! Parabéns!')+'</div></div></div>';
    }
  }else{
    open=!!p.reached;
    box='<div class="prizebox'+(open?" show":"")+'"><div class="pz-closed">Faltam <b>'+left+'</b> pontos para ganhar '+(sys==="estrelas"?"a estrela":"a figurinha")+'.</div>'+
      '<div class="pz-open"><div class="pz-title">Meta batida!</div><div class="pz-name">'+(sys==="estrelas"?"Você ganhou uma estrela.":"Você ganhou uma figurinha nova. Ela está no seu álbum.")+'</div></div></div>';
  }
  var icon=sys==="bau"?'<div class="chest'+(open?" open":"")+'" id="chest">'+FC.chestSvg()+'</div>':
    '<div class="goalicon'+(open?" open":"")+'" id="chest">'+(sys==="estrelas"?FC.starSvg(true):FC.packSvg())+'</div>';
  var title=sys==="bau"?"Baú "+(mensal?"do mês":"da semana"):sys==="estrelas"?"Meta "+(mensal?"do mês":"da semana"):"Figurinha da semana";
  return '<div class="trail" id="trail"><div class="eyebrow">'+title+'</div>'+
    '<div class="big-pts">'+pts+'<span> / '+goal+' pontos</span></div>'+
    '<div class="trail-line"><div class="track" role="progressbar" aria-label="Caminho até a recompensa" aria-valuemin="0" aria-valuemax="'+goal+'" aria-valuenow="'+pts+'">'+
    '<div class="fill" id="trailFill" data-now="'+pct(pts).toFixed(1)+'" style="width:'+pct(from).toFixed(1)+'%"></div>'+pins+'</div>'+icon+'</div>'+
    legend+(hint?'<p class="small-t">'+hint+'</p>':'')+box+'<p class="muted small-t">'+closes+'</p></div>';
};
/* A barra enche até o valor novo e os pontos de passagem alcançados acendem um a um. */
FC.animateTrail=function(){
  var f=FC.$("#trailFill");if(!f)return;
  setTimeout(function(){
    f.style.width=f.getAttribute("data-now")+"%";
    FC.$$("#trail .pin,#trail .chip").forEach(function(el,i){
      if(el.getAttribute("data-hit")==="1"&&!el.classList.contains("hit"))setTimeout(function(){el.classList.add("hit");if(el.classList.contains("chip"))el.textContent="✓ "+el.textContent},700+i*120);
    });
  },350);
};
FC.openChest=function(){
  var c=FC.$("#chest"),b=FC.$("#prizebox");if(!c)return;
  c.classList.add("shake");
  setTimeout(function(){c.classList.remove("shake");c.classList.add("open");if(b)b.classList.add("show");FC.sfx.chest();FC.confetti()},650);
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
