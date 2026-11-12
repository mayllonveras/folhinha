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
FC.GROUP_NAMES={"7A":"7A · Contagem","6A":"6A · Primeiras somas","5A":"5A · Até 10","4A":"4A · Até 20","3A":"3A · Dezenas","2A":"2A · Multiplicação","A":"A · Divisão","B":"B · Equações"};
FC.LEVELS=[
 L("7A","7A","Sequências numéricas","Complete o número que falta na fila.",90,G.seq),
 L("6A","6A","Somar de 1 a 3","Adições com 1, 2 ou 3 a mais.",90,G.add6),
 L("5A","5A-1","Somas até 10","Adições com resultado de até 10.",90,G.add10),
 L("5A","5A-2","Subtrações até 10","Tirar de um número de até 10.",100,G.sub10),
 L("5A","5A-3","Somas e subtrações até 10","Adições e subtrações misturadas.",100,G.mix10),
 L("4A","4A-1","Somas até 20, sem passar da dezena","Como 12 + 5.",100,G.add20a),
 L("4A","4A-2","Somas que passam da dezena","Como 8 + 7.",120,G.add20b),
 L("4A","4A-3","Subtrações até 20, sem passar da dezena","Como 17 − 5.",100,G.sub20a),
 L("4A","4A-4","Subtrações que passam da dezena","Como 15 − 8.",130,G.sub20b),
 L("4A","4A-5","Somas e subtrações até 20","Todas as contas até 20, misturadas.",120,G.mix20),
 L("3A","3A-1","Dezenas inteiras e unidades","Como 30 + 20, 80 − 50, 34 + 5 e 38 − 5.",120,G.tens),
 L("3A","3A-2","Somas de dois algarismos, sem vai-um","Como 23 + 45.",150,G.add2a),
 L("3A","3A-3","Somas de dois algarismos, com vai-um","Como 47 + 38.",180,G.add2b),
 L("3A","3A-4","Subtrações de dois algarismos, sem empréstimo","Como 78 − 45.",150,G.sub2a),
 L("3A","3A-5","Subtrações de dois algarismos, com empréstimo","Como 82 − 29.",180,G.sub2b),
 L("3A","3A-6","Contas com dezenas, misturadas","Somas e subtrações de dois algarismos.",180,G.mix2),
 L("2A","2A-1","Tabuadas do 1, do 2 e do 10","Os primeiros passos da multiplicação.",90,G.table([1,2,10],1)),
 L("2A","2A-2","Tabuadas do 3 e do 4","Multiplicação por 3 e por 4.",110,G.table([3,4],2)),
 L("2A","2A-3","Tabuadas do 5 e do 6","Multiplicação por 5 e por 6.",110,G.table([5,6],2)),
 L("2A","2A-4","Tabuadas do 7 e do 8","Multiplicação por 7 e por 8.",120,G.table([7,8],2)),
 L("2A","2A-5","Tabuada do 9","Multiplicação por 9.",100,G.table([9],2)),
 L("2A","2A-6","Tabuada completa","Todas as tabuadas de 2 a 9, misturadas.",120,G.table([2,3,4,5,6,7,8,9],2)),
 L("A","A-1","Divisão por 2, 3, 4 e 5","Divisões exatas, usando a tabuada de trás para frente.",120,G.divs([2,3,4,5])),
 L("A","A-2","Divisão por 6, 7, 8 e 9","Divisões exatas com os divisores maiores.",140,G.divs([6,7,8,9])),
 L("A","A-3","Divisão exata, misturada","Divisões por 2 a 9, misturadas.",150,G.divs([2,3,4,5,6,7,8,9])),
 L("B","B-1","Descubra o x: soma","Como x + 7 = 15.",150,G.eqAdd),
 L("B","B-2","Descubra o x: subtração","Como x − 6 = 12.",160,G.eqSub),
 L("B","B-3","Descubra o x: multiplicação","Como 4 × x = 28.",150,G.eqMul),
 L("B","B-4","Descubra o x: misturado","Os três tipos de equação.",210,G.eqMix)
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
})();
