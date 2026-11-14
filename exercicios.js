/* Exercícios com figura e com escolha de opções.
   Cada gerador devolve {pre, post, a, extra?}:
   - a é sempre um número inteiro: a resposta digitada, ou o número (1, 2, 3…) da opção certa;
   - extra.fig: a figura a desenhar (FC.fig);
   - extra.opts: as opções (texto ou {fig}), para exercício de escolha.
   Os geradores também devolvem _calc e _why, só para os testes (nunca vão para o banco). */
(function(){
"use strict";
var FC=window.FC,esc=FC.esc;
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(a){return a[rnd(0,a.length-1)]}

/* Embaralhar com semente: só para escolher quais opções erradas entram. */
function hashStr(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function seededShuffle(arr,seed){var r=mulberry(hashStr(seed)),a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function same(x,y){return JSON.stringify(x)===JSON.stringify(y)}
function uniq(arr){var out=[];arr.forEach(function(x){if(!out.some(function(y){return same(x,y)}))out.push(x)});return out}

/* Exercício de escolha: junta a opção certa e as erradas e acha o número da certa. */
function choice(pre,correct,wrongs,fig,why){
  var opts=uniq([correct].concat(wrongs)),i,j,t;
  /* Ordem sorteada de verdade: a posição da certa não pode ser previsível (antes dependia só da figura).
     O reforço não precisa de ordem fixa: ele guarda e reenvia o item exato, com as opções na ordem em que a criança viu. */
  for(i=opts.length-1;i>0;i--){j=Math.floor(Math.random()*(i+1));t=opts[i];opts[i]=opts[j];opts[j]=t}
  var a=0;opts.forEach(function(o,i){if(same(o,correct))a=i+1});
  var extra={opts:opts};if(fig)extra.fig=fig;
  return{pre:pre,post:"",a:a,extra:extra,_why:correct};
}
function typed(pre,a,fig,post){var it={pre:pre,post:post||"",a:a,_calc:a};if(fig)it.extra={fig:fig};return it}

/* ================== FIGURAS ================== */
var uid=0;
/* INK: cor do texto do tema (escuro no tema claro, claro no tema escuro); o SVG herda de .figsvg{color:var(--ink)} */
var INK="currentColor";
var C={blue:"#2457D6",sky:"#8FB0FF",sun:"#FFB92B",coral:"#F2503F",mint:"#1CA97B",ink:"#14213D",soft:"#E6EDF9",line:"#9DB0CC"};
function svg(w,h,inner,cls){return '<svg class="figsvg'+(cls?" "+cls:"")+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-hidden="true" focusable="false">'+inner+'</svg>'}

var SHAPES={
  "círculo":{sides:0,svg:function(f){return '<circle cx="50" cy="50" r="38" fill="'+f+'" stroke="'+INK+'" stroke-width="3"/>'}},
  "quadrado":{sides:4,svg:function(f){return '<rect x="14" y="14" width="72" height="72" fill="'+f+'" stroke="'+INK+'" stroke-width="3"/>'}},
  "retângulo":{sides:4,svg:function(f){return '<rect x="6" y="26" width="88" height="48" fill="'+f+'" stroke="'+INK+'" stroke-width="3"/>'}},
  "triângulo":{sides:3,svg:function(f){return '<polygon points="50,12 92,84 8,84" fill="'+f+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'}},
  "trapézio":{sides:4,svg:function(f){return '<polygon points="30,22 70,22 94,80 6,80" fill="'+f+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'}},
  "paralelogramo":{sides:4,svg:function(f){return '<polygon points="28,24 94,24 72,76 6,76" fill="'+f+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'}},
  "losango":{sides:4,svg:function(f){return '<polygon points="50,8 92,50 50,92 8,50" fill="'+f+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'}},
  "pentágono":{sides:5,svg:function(f){return '<polygon points="50,8 92,38 76,88 24,88 8,38" fill="'+f+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'}},
  "hexágono":{sides:6,svg:function(f){return '<polygon points="28,12 72,12 94,50 72,88 28,88 6,50" fill="'+f+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'}}
};
var SHAPE_COLORS=[C.sky,C.sun,"#7EE0BE","#FFA99E","#C6B4FF"];
function shapeFig(n,color){var s=SHAPES[n];return svg(100,100,s.svg(color||C.sky),"fig-shape")}

var DRAW={
  /* grupos de objetos (emoji), em linhas de 'per' */
  emoji:function(f){
    var per=f.per||5;
    return '<div class="fig-emoji">'+f.groups.map(function(g){
      var rows=[],i=0;while(i<g.n){rows.push(new Array(Math.min(per,g.n-i)+1).join(g.e));i+=per}
      return '<div class="eg" aria-hidden="true">'+rows.map(function(r){return '<div>'+r+'</div>'}).join("")+'</div>'}).join("")+'</div>';
  },
  /* dezenas (barras de 10) e unidades (cubinhos) */
  base10:function(f){
    var tw=16,x=6,inner="",i,j;
    for(i=0;i<f.tens;i++){inner+='<rect x="'+x+'" y="6" width="12" height="110" fill="'+C.sky+'" stroke="'+INK+'" stroke-width="1.6"/>';
      for(j=1;j<10;j++)inner+='<line x1="'+x+'" x2="'+(x+12)+'" y1="'+(6+j*11)+'" y2="'+(6+j*11)+'" stroke="'+INK+'" stroke-width="1"/>';x+=tw+2}
    x+=10;var ox=x;
    for(i=0;i<f.ones;i++){var cx=ox+(i%5)*16,cy=6+Math.floor(i/5)*16;
      inner+='<rect x="'+cx+'" y="'+cy+'" width="13" height="13" fill="'+C.sun+'" stroke="'+INK+'" stroke-width="1.6"/>'}
    var w=Math.max(x+(f.ones>0?(Math.min(f.ones,5)*16+6):6),60);
    return svg(w,122,inner,"fig-b10");
  },
  /* gráfico de colunas */
  bars:function(f){
    var n=f.values.length,max=Math.max.apply(null,f.values),top=max<=6?6:(max<=10?10:Math.ceil(max/2)*2),stepY=top<=10?1:2;
    var W=60+n*50,H=170,x0=38,y0=134,ph=104,inner="",t;
    if(f.title)inner+='<text x="'+(W/2)+'" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="'+INK+'">'+esc(f.title)+'</text>';
    for(t=0;t<=top;t+=stepY){var y=y0-ph*t/top;
      inner+='<line x1="'+x0+'" x2="'+(W-8)+'" y1="'+y+'" y2="'+y+'" stroke="'+C.line+'" stroke-width="'+(t===0?1.6:.7)+'"/>'+
        '<text x="'+(x0-6)+'" y="'+(y+4)+'" text-anchor="end" font-size="10" fill="'+INK+'">'+t+'</text>'}
    f.values.forEach(function(v,i){var bx=x0+10+i*50,bh=ph*v/top;
      inner+='<rect x="'+bx+'" y="'+(y0-bh)+'" width="32" height="'+bh+'" fill="'+((f.colors&&f.colors[i])||C.blue)+'" stroke="'+INK+'" stroke-width="1.4"/>'+
        '<text x="'+(bx+16)+'" y="'+(y0+14)+'" text-anchor="middle" font-size="10.5" fill="'+INK+'">'+esc(f.labels[i])+'</text>'});
    return svg(W,H,inner,"fig-bars");
  },
  /* relógio analógico */
  clock:function(f){
    var inner='<circle cx="100" cy="100" r="88" fill="#fff" stroke="'+C.ink+'" stroke-width="4"/>',i,a;
    for(i=0;i<60;i++){a=i*6*Math.PI/180;var big=i%5===0,r1=big?74:80;
      inner+='<line x1="'+(100+r1*Math.sin(a))+'" y1="'+(100-r1*Math.cos(a))+'" x2="'+(100+84*Math.sin(a))+'" y2="'+(100-84*Math.cos(a))+'" stroke="'+C.ink+'" stroke-width="'+(big?2.4:1)+'"/>'}
    var ha=((f.h%12)*30+f.m*.5)*Math.PI/180,ma=f.m*6*Math.PI/180;
    inner+='<line x1="100" y1="100" x2="'+(100+46*Math.sin(ha))+'" y2="'+(100-46*Math.cos(ha))+'" stroke="'+C.ink+'" stroke-width="6" stroke-linecap="round"/>'+
      '<line x1="100" y1="100" x2="'+(100+70*Math.sin(ma))+'" y2="'+(100-70*Math.cos(ma))+'" stroke="'+C.blue+'" stroke-width="4" stroke-linecap="round"/>'+
      '<circle cx="100" cy="100" r="5" fill="'+C.ink+'"/>';
    /* os números ficam por cima dos ponteiros, com contorno branco, para nunca ficarem escondidos */
    for(i=1;i<=12;i++){a=i*30*Math.PI/180;inner+='<text x="'+(100+62*Math.sin(a))+'" y="'+(100-62*Math.cos(a)+6)+'" text-anchor="middle" font-size="17" font-weight="700" fill="'+C.ink+'" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">'+i+'</text>'}
    return svg(200,200,inner,"fig-clock");
  },
  /* reta numérica com uma seta no número escondido */
  line:function(f){
    var W=360,x0=26,x1=334,n=(f.max-f.min)/f.step,inner='<line x1="'+(x0-12)+'" x2="'+(x1+12)+'" y1="68" y2="68" stroke="'+INK+'" stroke-width="4" stroke-linecap="round"/>',k;
    for(k=0;k<=n;k++){var v=f.min+k*f.step,x=x0+(x1-x0)*k/n,lab=(f.labelEvery?(v-f.min)%f.labelEvery===0:true);
      inner+='<line x1="'+x+'" x2="'+x+'" y1="'+(lab?52:58)+'" y2="'+(lab?84:78)+'" stroke="'+INK+'" stroke-width="'+(lab?3.6:2.4)+'" stroke-linecap="round"/>';
      if(lab&&v!==f.mark)inner+='<text x="'+x+'" y="106" text-anchor="middle" font-size="16" font-weight="700" fill="'+INK+'">'+v+'</text>'}
    var mx=x0+(x1-x0)*((f.mark-f.min)/f.step)/n;
    inner+='<polygon points="'+mx+',62 '+(mx-11)+',38 '+(mx+11)+',38" fill="'+C.coral+'"/><text x="'+mx+'" y="30" text-anchor="middle" font-size="22" font-weight="800" fill="'+C.coral+'">?</text>';
    return svg(W,114,inner,"fig-line");
  },
  /* malha quadriculada com quadradinhos pintados */
  grid:function(f){
    var s=26,W=f.cols*s+4,H=f.rows*s+4,inner="",r,c;
    for(r=0;r<f.rows;r++)for(c=0;c<f.cols;c++){
      var on=f.cells.some(function(p){return p[0]===r&&p[1]===c});
      inner+='<rect x="'+(2+c*s)+'" y="'+(2+r*s)+'" width="'+s+'" height="'+s+'" fill="'+(on?(f.color||C.sun):"#fff")+'" stroke="'+C.line+'" stroke-width="1.2"/>'}
    return svg(W,H,inner,"fig-grid");
  },
  shape:function(f){return shapeFig(f.n,f.color)},
  /* sólidos geométricos */
  solid:function(f){
    var id="g"+(++uid),s=INK,inner="";
    if(f.n==="cubo")inner='<polygon points="50,8 88,26 50,44 12,26" fill="'+C.sky+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/><polygon points="12,26 50,44 50,92 12,72" fill="'+C.blue+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/><polygon points="88,26 50,44 50,92 88,72" fill="#173F9F" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/>';
    else if(f.n==="bloco retangular")inner='<polygon points="30,16 94,16 70,34 6,34" fill="'+C.sky+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/><polygon points="6,34 70,34 70,84 6,84" fill="'+C.blue+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/><polygon points="94,16 70,34 70,84 94,66" fill="#173F9F" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/>';
    else if(f.n==="esfera")inner='<defs><radialGradient id="'+id+'" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="'+C.blue+'"/></radialGradient></defs><circle cx="50" cy="50" r="40" fill="url(#'+id+')" stroke="'+s+'" stroke-width="2.5"/>';
    else if(f.n==="cilindro")inner='<path d="M20,24 L20,76 A30,10 0 0 0 80,76 L80,24" fill="'+C.blue+'" stroke="'+s+'" stroke-width="2.5"/><ellipse cx="50" cy="24" rx="30" ry="10" fill="'+C.sky+'" stroke="'+s+'" stroke-width="2.5"/>';
    else if(f.n==="cone")inner='<path d="M18,74 L50,10 L82,74 A32,11 0 0 1 18,74 Z" fill="'+C.blue+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/>';
    else if(f.n==="pirâmide")inner='<polygon points="50,8 8,72 50,90" fill="'+C.sky+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/><polygon points="50,8 50,90 92,72" fill="'+C.blue+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/>';
    return svg(100,100,inner,"fig-solid");
  }
};
FC.fig=function(f){var d=f&&DRAW[f.t];return d?'<div class="fig" aria-hidden="true">'+d(f)+'</div>':""};

/* ================== MOSTRAR UM ITEM ================== */
function optHtml(o){return o&&typeof o==="object"&&o.fig?FC.fig(o.fig):'<span class="otx">'+esc(o)+'</span>'}
FC.optText=function(o,i){return o&&typeof o==="object"&&o.fig?"figura "+(i+1):String(o)};
/* Texto da resposta certa ou da resposta dada, para listas simples (pais, reforço). */
FC.answerText=function(p,v){
  var n=Number(v);
  if(p&&p.extra&&p.extra.opts&&n>=1&&n<=p.extra.opts.length)return FC.optText(p.extra.opts[n-1],n-1);
  return v===""||v==null?"(em branco)":String(v);
};
FC.isRich=function(p){return !!(p&&p.extra)};

/* Linha de uma folha. Itens simples mantêm o desenho de sempre. */
FC.itemInner=function(it,i){
  var ex=it.extra;
  if(!ex)return '<span class="n">'+(i+1)+')</span><span class="q">'+esc(it.pre)+'</span><span class="ans"><input id="in'+i+'" inputmode="numeric" autocomplete="off" maxlength="4" aria-label="Resposta da conta '+(i+1)+'"></span>'+(it.post?'<span class="q">'+esc(it.post)+'</span>':'');
  var body='<span class="n">'+(i+1)+')</span><div class="rich"><div class="rq">'+esc(it.pre)+'</div>'+(ex.fig?FC.fig(ex.fig):"");
  if(ex.opts){
    body+='<div class="opts" role="group" aria-label="Opções da conta '+(i+1)+'">'+ex.opts.map(function(o,k){
      return '<button type="button" class="opt" data-i="'+i+'" data-k="'+(k+1)+'" aria-label="Opção '+(k+1)+': '+esc(FC.optText(o,k))+'">'+optHtml(o)+'</button>'}).join("")+'</div><input type="hidden" id="in'+i+'">';
  }else{
    body+='<div class="rans"><span class="ans"><input id="in'+i+'" inputmode="numeric" autocomplete="off" maxlength="4" aria-label="Resposta da conta '+(i+1)+'"></span>'+(it.post?'<span class="q">'+esc(it.post)+'</span>':'')+'</div>';
  }
  return body+'</div>';
};
/* Versão só para olhar (pré-visualização e telas dos pais): mostra a opção certa. */
FC.itemStatic=function(p,v){
  var ex=p.extra||{},out='<div class="sitem"><div class="rq">'+esc(p.pre)+(p.post?" … "+esc(p.post):"")+'</div>'+(ex.fig?FC.fig(ex.fig):"");
  if(ex.opts)out+='<div class="opts static">'+ex.opts.map(function(o,k){
    var right=k+1===p.a,mine=v!=null&&v!==""&&Number(v)===k+1;
    return '<span class="opt'+(right?" right":"")+(mine&&!right?" wrong":"")+'">'+optHtml(o)+(right?'<i>certa</i>':mine?'<i>resposta</i>':'')+'</span>'}).join("")+'</div>';
  else out+='<div class="rans static"><span class="muted">resposta:</span> <b>'+esc(p.a)+'</b>'+(v!=null&&v!==""&&Number(v)!==p.a?' <span class="muted">(respondeu '+esc(v)+')</span>':'')+'</div>';
  return out+'</div>';
};

/* ================== GERADORES ================== */
var OBJ=[{e:"🍎",pl:"maçãs"},{e:"🐟",pl:"peixes"},{e:"⭐",pl:"estrelas"},{e:"🎈",pl:"balões"},{e:"🐶",pl:"cachorros"},{e:"🌼",pl:"flores"},{e:"⚽",pl:"bolas"},{e:"🍪",pl:"biscoitos"},{e:"🚗",pl:"carros"},{e:"🐥",pl:"pintinhos"}];
var NAMES=[["Ana","f"],["Bia","f"],["Caio","m"],["Davi","m"],["Eva","f"],["Gui","m"],["Isa","f"],["Léo","m"],["Lia","f"],["Nina","f"],["Pedro","m"],["Rita","f"]];
var FIG2D=["círculo","quadrado","retângulo","triângulo"],FIG2D_MAIS=["círculo","quadrado","retângulo","triângulo","trapézio","paralelogramo","losango","pentágono","hexágono"];

function gCount(lo,hi,per){return function(){var n=rnd(lo,hi),o=pick(OBJ);
  return typed("Quantos "+o.pl+" têm aqui?",n,{t:"emoji",groups:[{e:o.e,n:n}],per:per||5})}}
function gMoreBy(){var o1=pick(OBJ),o2;do{o2=pick(OBJ)}while(o2.e===o1.e);
  var n2=rnd(2,10),n1=Math.random()<.12?n2:n2+rnd(1,6);
  return typed("Quantos "+o1.e+" a mais do que "+o2.e+" há aqui?",n1-n2,{t:"emoji",groups:[{e:o1.e,n:n1},{e:o2.e,n:n2}],per:5});}
function gTens(){var t=rnd(1,9),o=rnd(0,9);return typed("Cada barra vale 10 e cada quadradinho vale 1. Quanto vale tudo junto?",t*10+o,{t:"base10",tens:t,ones:o})}
function gBigger(lo,hi,which){return function(){var x=rnd(lo,hi),y;do{y=rnd(lo,hi)}while(y===x||(y>9&&x>9&&String(y).split("").reverse().join("")===String(x)&&Math.random()<.7));
  var big=Math.max(x,y),small=Math.min(x,y),w=which||pick(["maior","menor"]);
  return choice("Qual é o "+w+" número?",String(w==="maior"?big:small),[String(w==="maior"?small:big)],null)}}
function gNeighbor(lo,hi){return function(){var n=rnd(lo,hi),after=Math.random()<.5;
  return typed("Que número vem "+(after?"depois":"antes")+" do "+n+"?",after?n+1:n-1)}}
function gOrdinal(){var n=pick(NAMES),p=rnd(2,9),f=n[1]==="f";
  return typed(n[0]+" é "+(f?"a "+p+"ª":"o "+p+"º")+" da fila. Quantas crianças estão na frente "+(f?"dela":"dele")+"?",p-1)}
/* Em geometria, alguns nomes valem também para os casos particulares: todo quadrado é retângulo, losango e paralelogramo;
   todo cubo é um bloco retangular. Uma opção errada nunca pode ser também verdadeira, senão a criança certa leva um erro. */
var TAMBEM={"retângulo":["quadrado"],"losango":["quadrado"],"paralelogramo":["retângulo","losango","quadrado"],
  "trapézio":["paralelogramo","retângulo","losango","quadrado"],"bloco retangular":["cubo"]};
function tambemE(especial,geral){return (TAMBEM[geral]||[]).indexOf(especial)>=0}   /* 'especial' também é 'geral'? */
FC.TAMBEM=TAMBEM;FC.tambemE=tambemE;
function gShapeName(list){return function(){var n=pick(list),wr=seededShuffle(list.filter(function(x){return x!==n&&!tambemE(n,x)}),"w"+n+rnd(0,999999)).slice(0,3);
  return choice("Como se chama esta figura?",n,wr,{t:"shape",n:n,color:pick(SHAPE_COLORS)})}}
function gWhichShape(list){return function(){var n=pick(list),others=seededShuffle(list.filter(function(x){return x!==n&&!tambemE(x,n)}),"o"+n+rnd(0,999999)).slice(0,3),col=pick(SHAPE_COLORS);
  var mk=function(s){return{fig:{t:"shape",n:s,color:col}}};
  return choice("Qual destas figuras é um "+n+"?",mk(n),others.map(mk),null)}}
function gSides(){return function(){var list=FIG2D_MAIS.filter(function(n){return SHAPES[n].sides>0}),n=pick(list);
  return typed("Quantos lados tem esta figura?",SHAPES[n].sides,{t:"shape",n:n,color:pick(SHAPE_COLORS)})}}
var SOLIDOBJ={"esfera":["⚽","🏀","🌍"],"cubo":["🎲","🧊"],"cilindro":["🥫","🛢️"],"cone":["🍦"],"bloco retangular":["📦","🧱"]};
function gSolidObject(){var names=Object.keys(SOLIDOBJ),n=pick(names),good=pick(SOLIDOBJ[n]),wr=[];
  /* cubo e bloco retangular não aparecem juntos: o dado também é um bloco retangular, e a caixa pode parecer um cubo */
  seededShuffle(names.filter(function(x){return x!==n&&!tambemE(x,n)&&!tambemE(n,x)}),"s"+n+rnd(0,999999)).slice(0,3).forEach(function(x){wr.push(SOLIDOBJ[x][0])});
  return choice("Qual objeto tem a forma de "+(n==="esfera"||n==="pirâmide"?"uma ":"um ")+n+"?",good,wr,null)}
function gSolidName(){var list=["cubo","bloco retangular","esfera","cilindro","cone","pirâmide"],n=pick(list),wr=seededShuffle(list.filter(function(x){return x!==n&&!tambemE(n,x)}),"n"+n+rnd(0,999999)).slice(0,3);
  return choice("Como se chama este sólido?",n,wr,{t:"solid",n:n})}
function pad2(n){return(n<10?"0":"")+n}
function gClock(mins){return function(){var h=rnd(1,12),m=pick(mins),good=h+":"+pad2(m),wr=[];
  wr.push((h%12+1)+":"+pad2(m));wr.push(h+":"+pad2(pick(mins.filter(function(x){return x!==m})||[0])));
  if(m%5===0&&m!==0)wr.push((m/5)+":"+pad2(h*5%60));
  wr.push(((h+10)%12+1)+":"+pad2(m));
  return choice("Que horas o relógio marca?",good,wr.filter(function(x){return x!==good}).slice(0,3),{t:"clock",h:h,m:m})}}
var COR={"Azul":C.blue,"Verde":C.mint,"Rosa":"#F27AB0","Amarelo":C.sun};
var POLL=[{t:"Bichinhos preferidos da turma",l:["Gato","Cão","Peixe","Pássaro"]},{t:"Frutas preferidas da turma",l:["Maçã","Uva","Banana","Pera"]},{t:"Esportes preferidos da turma",l:["Futebol","Vôlei","Natação","Judô"]},{t:"Cores preferidas da turma",l:["Azul","Verde","Rosa","Amarelo"],cores:true}];
/* Pesquisa de cores: cada coluna tem a cor do nome. Nas outras, uma cor só (cor diferente por coluna não quer dizer nada). */
function pollFig(d){var f={t:"bars",title:d.p.t,labels:d.labels,values:d.vals};if(d.p.cores)f.colors=d.labels.map(function(l){return COR[l]});return f}
function pollData(n){var p=pick(POLL),vals=[],labels=p.l.slice(0,n||4);while(vals.length<labels.length)vals.push(rnd(1,9));return{p:p,labels:labels,vals:vals}}
function gBarRead(){var d=pollData(4),i=rnd(0,d.labels.length-1);
  return typed("Quantas crianças escolheram "+d.labels[i]+"?",d.vals[i],pollFig(d))}
function gBarTop(){var d,top;do{d=pollData(4);top=Math.max.apply(null,d.vals)}while(d.vals.filter(function(v){return v===top}).length>1);
  var ask=Math.random()<.5,target=ask?top:Math.min.apply(null,d.vals),ties=d.vals.filter(function(v){return v===target}).length;
  if(ties>1){ask=true;target=top}
  return choice(ask?"Qual teve mais votos?":"Qual teve menos votos?",d.labels[d.vals.indexOf(target)],d.labels.filter(function(l,i){return d.vals[i]!==target}),pollFig(d))}
function gLine(min,max,step,labelEvery){return function(){
  if(Array.isArray(min)){var v=pick(min);return gLine(v[0],v[1],v[2],v[3])()}   /* várias retas: escolhe uma */
  var n=(max-min)/step,k=rnd(1,n-1),m=min+k*step;
  if(labelEvery&&(m-min)%labelEvery===0&&n>2){m=min+(k===1?2:k-1)*step}
  return typed("Que número a seta está mostrando na reta?",m,{t:"line",min:min,max:max,step:step,labelEvery:labelEvery,mark:m})}}
var TINTAS=[["amarelo","#FFB92B"],["azul","#2457D6"],["rosa","#F27AB0"]];
function gGrid(){var rows=rnd(3,5),cols=rnd(4,7),all=[],r,c,tinta=pick(TINTAS);for(r=0;r<rows;r++)for(c=0;c<cols;c++)all.push([r,c]);
  var k=rnd(4,Math.min(14,rows*cols-2)),cells=seededShuffle(all.map(function(p){return p.join(",")}),"g"+rnd(0,999999)).slice(0,k).map(function(s){return s.split(",").map(Number)});
  return typed("Cada quadradinho vale 1. Quantos quadradinhos estão pintados de "+tinta[0]+"?",k,{t:"grid",rows:rows,cols:cols,cells:cells,color:tinta[1]})}
var CHANCE=[["O Sol vai aparecer amanhã de manhã.",0],["Tirar uma bola azul de uma caixa que só tem bolas vermelhas.",2],["Vai chover no sábado.",1],["Lançar um dado e sair o número 7.",2],["Lançar um dado e sair um número de 1 a 6.",0],["Sortear um menino numa turma de meninos e meninas.",1],["Depois da segunda-feira vem a terça-feira.",0],["Um gato falar português.",2],["Sair cara ao lançar uma moeda.",1],["Uma pessoa viva ter 300 anos de idade.",2],["Na semana, o domingo vir depois do sábado.",0],["Sortear uma bola vermelha de um saco com bolas vermelhas e azuis.",1],["Tirar uma bola verde de um saco que só tem bolas verdes.",0],["Um cachorro voar sem ajuda de nada.",2],["Sair o número 3 ao lançar um dado.",1],["A água de uma panela ferver no fogo aceso, se esperarmos bastante.",0]];
var CH_OPTS=["Com certeza","Talvez","Impossível"];
function gChance(){var e=pick(CHANCE);return choice(e[0]+" Isso é…",CH_OPTS[e[1]],CH_OPTS.filter(function(_,i){return i!==e[1]}),null)}
function gCoins(){var v=pick([10,25,50]),n=rnd(2,7),m=pick([5,10,25,50,100].filter(function(x){return x!==v}));
  return typed(n+" moedas de "+v+" centavos valem quantos centavos?",n*v)}

/* Catálogo: cada gerador com o nome e as habilidades da BNCC que ele treina. */
FC.EX=[
  {id:"contar10",nome:"Contar objetos até 10",hab:["EF01MA02"],gen:gCount(2,10,5)},
  {id:"contar20",nome:"Contar objetos até 20, em grupos de 5",hab:["EF01MA02","EF01MA04"],gen:gCount(8,20,5)},
  {id:"dezenas",nome:"Dezenas e unidades (barras e cubinhos)",hab:["EF01MA04","EF01MA07","EF02MA04"],gen:gTens},
  {id:"aMais",nome:"Quantos a mais?",hab:["EF01MA03","EF02MA03"],gen:gMoreBy},
  {id:"maior20",nome:"Qual é o maior ou o menor (até 20)",hab:["EF01MA05"],gen:gBigger(2,20)},
  {id:"maior99",nome:"Qual é o maior ou o menor (até 99)",hab:["EF01MA05","EF02MA01"],gen:gBigger(10,99)},
  {id:"vizinho",nome:"O número que vem antes e depois",hab:["EF01MA01","EF01MA05"],gen:gNeighbor(2,99)},
  {id:"fila",nome:"Posição na fila (ordem)",hab:["EF01MA01"],gen:gOrdinal},
  {id:"formaPlana",nome:"Nome da figura plana",hab:["EF01MA14","EF02MA15"],gen:gShapeName(FIG2D)},
  {id:"formaPlana2",nome:"Nome da figura plana (mais figuras)",hab:["EF03MA15"],gen:gShapeName(FIG2D_MAIS)},
  {id:"qualFigura",nome:"Qual destas figuras é…",hab:["EF01MA14","EF02MA15"],gen:gWhichShape(FIG2D)},
  {id:"lados",nome:"Quantos lados tem a figura",hab:["EF03MA15"],gen:gSides()},
  {id:"sólidoObjeto",nome:"Objeto com a forma do sólido",hab:["EF01MA13","EF02MA14","EF03MA13"],gen:gSolidObject},
  {id:"sólidoNome",nome:"Nome do sólido geométrico",hab:["EF02MA14","EF03MA13"],gen:gSolidName},
  {id:"relogio",nome:"Ler o relógio (horas e meias horas)",hab:["EF03MA22","EF03MA23"],gen:gClock([0,30])},
  {id:"relogio2",nome:"Ler o relógio (de 5 em 5 minutos)",hab:["EF03MA22","EF03MA23"],gen:gClock([0,5,10,15,20,25,30,35,40,45,50,55])},
  {id:"graficoLer",nome:"Ler um gráfico de colunas",hab:["EF01MA21","EF02MA22","EF03MA26"],gen:gBarRead},
  {id:"graficoMais",nome:"Qual coluna é a maior ou a menor",hab:["EF03MA27"],gen:gBarTop},
  {id:"reta20",nome:"Número na reta numérica (até 20)",hab:["EF03MA04"],gen:gLine([[0,20,1,5],[10,30,1,5],[20,40,1,5],[0,10,1,5]])},
  {id:"reta100",nome:"Número na reta numérica (de 5 em 5, de 10 em 10, de 20 em 20)",hab:["EF03MA04"],gen:gLine([[0,100,10,20],[0,50,5,10],[0,200,20,40],[100,200,10,20],[0,100,5,25]])},
  {id:"malha",nome:"Contar quadradinhos na malha (área)",hab:["EF04MA21"],gen:gGrid},
  {id:"acaso",nome:"Certeza, talvez ou impossível",hab:["EF01MA20","EF02MA21"],gen:gChance},
  {id:"moedas",nome:"Moedas em centavos",hab:["EF02MA20"],gen:gCoins}
];
FC.EXBY={};FC.EX.forEach(function(e){FC.EXBY[e.id]=e});
FC.SHAPE_NAMES=Object.keys(SHAPES);
})();
