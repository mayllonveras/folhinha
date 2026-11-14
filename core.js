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
 /* Mistura ponderada: parts = [[gerador, peso], ...]. Serve para a revisão espaçada: o assunto do nível
    vem com o peso maior e o que ele já aprendeu volta "aqui e ali" com peso menor. */
 mix:function(parts){var tot=0;parts.forEach(function(p){tot+=p[1]});
   return function(){var r=Math.random()*tot;for(var i=0;i<parts.length;i++){r-=parts[i][1];if(r<0)return parts[i][0]()}return parts[parts.length-1][0]()}},
 eqAdd:function(){var a=rnd(2,20),x=rnd(2,20);return eq("x + "+a+" = "+(x+a),x)},
 eqSub:function(){var a=rnd(2,20),x=rnd(a+1,a+20);return eq("x − "+a+" = "+(x-a),x)},
 eqMul:function(){var a=rnd(2,9),x=rnd(2,9);return eq(a+" × x = "+(a*x),x)},
 eqMix:function(){return pick([G.eqAdd,G.eqSub,G.eqMul])()}
};
function T(ts){return G.table(ts,2)}   /* tabuada(s) de ts, multiplicando por 2 a 9 (sem a tabuada do 1) */
var A=G.mix2;                          /* revisão de soma e subtração de dois algarismos */
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
 /* Tabuada: começa no 2 e avança uma de cada vez. Entre uma tabuada e a seguinte há um nível que mistura as duas.
    As difíceis (6, 7 e 8) ganham um nível a mais, que mistura a própria tabuada com as anteriores. Em todos os níveis,
    parte das contas é revisão do que já foi aprendido (as outras tabuadas e, no começo, somas e subtrações). */
 L("Tabuada","17","Tabuada do 2","Só o 2, com algumas somas e subtrações de revisão.",90,G.mix([[T([2]),75],[A,25]])),
 L("Tabuada","18","Tabuadas do 2 e do 3, misturadas","Os dois juntos, com um pouco de soma e subtração.",100,G.mix([[T([2,3]),80],[A,20]])),
 L("Tabuada","19","Tabuada do 3","O 3 em destaque. Voltam o 2 e a soma e subtração.",100,G.mix([[T([3]),70],[T([2]),15],[A,15]])),
 L("Tabuada","20","Tabuadas do 3 e do 4, misturadas","Os dois juntos, com revisão do 2.",110,G.mix([[T([3,4]),80],[T([2]),10],[A,10]])),
 L("Tabuada","21","Tabuada do 4","O 4 em destaque. Voltam o 2 e o 3.",110,G.mix([[T([4]),70],[T([2,3]),20],[A,10]])),
 L("Tabuada","22","Tabuadas do 4 e do 5, misturadas","Os dois juntos, com revisão do 2 e do 3.",110,G.mix([[T([4,5]),80],[T([2,3]),12],[A,8]])),
 L("Tabuada","23","Tabuada do 5","O 5 em destaque. Voltam o 2, o 3 e o 4.",100,G.mix([[T([5]),70],[T([2,3,4]),25],[A,5]])),
 L("Tabuada","24","Tabuada do 5, com as anteriores","O 5 misturado com o 2, o 3 e o 4.",100,G.mix([[T([5]),40],[T([2,3,4]),60]])),
 L("Tabuada","25","Tabuadas do 5 e do 6, misturadas","O 6 começa a aparecer.",120,G.mix([[T([5,6]),75],[T([2,3,4]),25]])),
 L("Tabuada","26","Tabuada do 6","O 6 em destaque. Voltam as tabuadas de 2 a 5.",120,G.mix([[T([6]),65],[T([2,3,4,5]),35]])),
 L("Tabuada","27","Tabuada do 6, com as anteriores","Metade das contas é do 6; a outra metade é do 3, 4 e 5.",120,G.mix([[T([6]),40],[T([3,4,5]),60]])),
 L("Tabuada","28","Tabuadas do 6 e do 7, misturadas","O 7 começa a aparecer.",130,G.mix([[T([6,7]),75],[T([2,3,4,5]),25]])),
 L("Tabuada","29","Tabuada do 7","O 7 em destaque. Voltam o 3, o 4, o 5 e o 6.",130,G.mix([[T([7]),60],[T([3,4,5,6]),40]])),
 L("Tabuada","30","Tabuada do 7, com as anteriores","O 7 misturado com o 4, o 5 e o 6.",130,G.mix([[T([7]),40],[T([4,5,6]),60]])),
 L("Tabuada","31","Tabuadas do 7 e do 8, misturadas","O 8 começa a aparecer.",140,G.mix([[T([7,8]),75],[T([3,4,5,6]),25]])),
 L("Tabuada","32","Tabuada do 8","O 8 em destaque. Voltam do 4 ao 7.",130,G.mix([[T([8]),60],[T([4,5,6,7]),40]])),
 L("Tabuada","33","Tabuada do 8, com as anteriores","O 8 misturado com o 6, o 7 e as menores.",140,G.mix([[T([8]),40],[T([6,7]),40],[T([3,4,5]),20]])),
 L("Tabuada","34","Tabuadas do 8 e do 9, misturadas","O 9 começa a aparecer.",130,G.mix([[T([8,9]),70],[T([5,6,7]),30]])),
 L("Tabuada","35","Tabuada do 9","O 9 em destaque. Voltam o 6, o 7 e o 8.",110,G.mix([[T([9]),60],[T([6,7,8]),40]])),
 L("Tabuada","36","Tabuada do 9, com as anteriores","O 9 misturado com o 6, o 7, o 8 e as menores.",120,G.mix([[T([9]),40],[T([6,7,8]),45],[T([3,4,5]),15]])),
 L("Tabuada","37","As tabuadas difíceis: 6, 7, 8 e 9","Só as quatro mais difíceis, com um pouco das menores.",140,G.mix([[T([6,7,8,9]),90],[T([2,3,4,5]),10]])),
 L("Tabuada","38","Tabuada completa","Todas as tabuadas de 2 a 9, misturadas.",130,T([2,3,4,5,6,7,8,9])),
 L("Divisão","39","Divisão por 2, 3, 4 e 5","Divisões exatas, usando a tabuada de trás para frente.",120,G.mix([[G.divs([2,3,4,5]),75],[T([2,3,4,5,6,7,8,9]),25]])),
 L("Divisão","40","Divisão por 6, 7, 8 e 9","Divisões exatas com os divisores maiores.",140,G.mix([[G.divs([6,7,8,9]),75],[T([6,7,8,9]),25]])),
 L("Divisão","41","Divisão exata, misturada","Divisões por 2 a 9, misturadas.",150,G.mix([[G.divs([2,3,4,5,6,7,8,9]),75],[T([2,3,4,5,6,7,8,9]),25]])),
 L("Equações","42","Descubra o x: soma","Como x + 7 = 15.",150,G.eqAdd),
 L("Equações","43","Descubra o x: subtração","Como x − 6 = 12.",160,G.eqSub),
 L("Equações","44","Descubra o x: multiplicação","Como 4 × x = 28.",150,G.eqMul),
 L("Equações","45","Descubra o x: misturado","Os três tipos de equação.",210,G.eqMix)
];
/* Ano da BNCC de cada nível. PROVISÓRIO: vale para os 45 níveis atuais e precisa bater com levels.ano no banco. */
FC.LEVELS.forEach(function(l,i){l.ano=i<=10?1:i<=23?2:i<=40?3:4});
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
FC.makeItems=function(levelIdx,keep){
  var items=(keep||[]).map(FC.plainItem),seen={},g=0;
  items.forEach(function(p){seen[itemKey(p)]=1});
  while(items.length<10&&g++<400){
    var p=FC.LEVELS[levelIdx].gen(),k=itemKey(p);
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
