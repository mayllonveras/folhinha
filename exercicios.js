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
/* Número com espaço fino de milhar (3º ano): 3456 → "3 456". */
function milh(v){return String(v).replace(/\B(?=(\d{3})+(?!\d))/g,"\u202F")}
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
  "losango":{sides:4,svg:function(f){return '<polygon points="50,16 94,50 50,84 6,50" fill="'+f+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'}},
  "pentágono":{sides:5,svg:function(f){return '<polygon points="50,8 92,38 76,88 24,88 8,38" fill="'+f+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'}},
  "hexágono":{sides:6,svg:function(f){return '<polygon points="28,12 72,12 94,50 72,88 28,88 6,50" fill="'+f+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'}}
};

/* Geometria da figura plana (para desenhar e para os testes). Devolve {circle:true} ou {pts:[[x,y],...]} numa caixa de 100 x 100. */
var TRI=[[[50,14],[86,76],[14,76]],[[50,8],[78,86],[22,86]],[[50,32],[90,78],[10,78]],[[20,82],[88,70],[62,16]],[[16,16],[16,84],[84,84]]];
function formaGeom(f){
  var n=f.n,w,h,pts;
  if(n==="círculo")return {circle:true};
  if(n==="quadrado")return {pts:f.rot===45?[[50,14],[86,50],[50,86],[14,50]]:[[14,14],[86,14],[86,86],[14,86]]};   /* rot 45: quadrado "de ponta" (2º ano) */
  if(n==="retângulo"){
    var r=f.r||1.8;if(f.o==="v"){h=84;w=84/r}else{w=84;h=84/r}
    return {pts:[[50-w/2,50-h/2],[50+w/2,50-h/2],[50+w/2,50+h/2],[50-w/2,50+h/2]].map(function(q){return[+q[0].toFixed(2),+q[1].toFixed(2)]})};
  }
  var a=(f.rot||0)*Math.PI/180,co=Math.cos(a),si=Math.sin(a);
  return {pts:TRI[f.v||0].map(function(q){var x=q[0]-50,y=q[1]-50;return[+(50+x*co-y*si).toFixed(2),+(50+x*si+y*co).toFixed(2)]})};
}
var SHAPE_COLORS=[C.sky,C.sun,"#7EE0BE","#FFA99E","#C6B4FF"];
function shapeFig(n,color){var s=SHAPES[n];return svg(100,100,s.svg(color||C.sky),"fig-shape")}

var DRAW={
  /* grupos de objetos (emoji), em linhas de 'per' */
  emoji:function(f){
    var per=f.per||5;
    function linha(g,i,n){var h="",j;for(j=0;j<n;j++){var k=i+j,r=g.x&&k>=g.n-g.x;h+=r?'<span class="x"><i>'+g.e+'</i></span>':g.e}return h}
    var gs=f.groups.map(function(g){
      var rows=[],i=0;while(i<g.n){var m=Math.min(per,g.n-i);rows.push(g.x?linha(g,i,m):new Array(m+1).join(g.e));i+=per}
      return '<div class="eg" aria-hidden="true">'+rows.map(function(r){return '<div>'+r+'</div>'}).join("")+'</div>'});
    return '<div class="fig-emoji'+(f.side?" side":"")+'">'+(f.sep?gs.join('<div class="sep" aria-hidden="true">'+f.sep+'</div>'):gs.join(""))+'</div>';
  },
  /* três barras rotuladas A, B e C, só o tamanho muda: orient "h" (comprimento), "v" (altura) ou "w" (largura) */
  barras:function(f){
    var inner="",i,col="#2457D6",L=["A","B","C"];
    if(f.orient==="h"){
      f.sizes.forEach(function(z,i){var y=14+i*44;
        inner+='<text x="12" y="'+(y+23)+'" font-size="18" font-weight="800" text-anchor="middle" fill="'+INK+'">'+L[i]+'</text><rect x="30" y="'+y+'" width="'+(z*250).toFixed(1)+'" height="30" rx="4" fill="'+col+'" stroke="'+INK+'" stroke-width="2"/>'});
      return svg(300,150,inner,"fig-barras");
    }
    f.sizes.forEach(function(z,i){var cx=60+i*90,h=f.orient==="v"?z*130:110,w=f.orient==="w"?z*70:36;
      inner+='<rect x="'+(cx-w/2).toFixed(1)+'" y="'+(150-h).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="4" fill="'+col+'" stroke="'+INK+'" stroke-width="2"/><text x="'+cx+'" y="174" font-size="18" font-weight="800" text-anchor="middle" fill="'+INK+'">'+L[i]+'</text>'});
    return svg(300,184,inner,"fig-barras");
  },
  /* três potes do mesmo formato em escalas diferentes (cabe mais no maior) */
  potes:function(f){
    var inner="",L=["A","B","C"];
    f.sizes.forEach(function(z,i){var cx=55+i*95;
      inner+='<g transform="translate('+cx+' 140) scale('+z+')"><path d="M-30,-95 L-30,-8 Q-30,0 -22,0 L22,0 Q30,0 30,-8 L30,-95 Q30,-102 22,-102 L-22,-102 Q-30,-102 -30,-95 Z" fill="#CFE3FF" stroke="'+INK+'" stroke-width="'+(2.5/z).toFixed(2)+'" stroke-linejoin="round"/><rect x="-34" y="-114" width="68" height="14" rx="4" fill="#8FB0FF" stroke="'+INK+'" stroke-width="'+(2.5/z).toFixed(2)+'"/></g>'+
        '<text x="'+cx+'" y="166" font-size="18" font-weight="800" text-anchor="middle" fill="'+INK+'">'+L[i]+'</text>'});
    return svg(300,176,inner,"fig-potes");
  },
  /* balança de dois pratos: a>0 = o prato da direita está mais baixo (o objeto de lá é o mais pesado) */
  balanca:function(f){
    var a=f.a*Math.PI/180,dx=Math.cos(a)*74,dy=Math.sin(a)*74,lx=100-dx,ly=44-dy,rx=100+dx,ry=44+dy,inner="";
    inner+='<polygon points="100,44 86,112 114,112" fill="#CFD8E8" stroke="'+INK+'" stroke-width="2.5" stroke-linejoin="round"/><line x1="'+lx+'" y1="'+ly+'" x2="'+rx+'" y2="'+ry+'" stroke="'+INK+'" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="44" r="6" fill="'+INK+'"/>';
    [[lx,ly,f.l],[rx,ry,f.r]].forEach(function(p){
      inner+='<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+(p[0]-22)+'" y2="'+(p[1]+34)+'" stroke="'+INK+'" stroke-width="2"/><line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+(p[0]+22)+'" y2="'+(p[1]+34)+'" stroke="'+INK+'" stroke-width="2"/>'+
        '<path d="M'+(p[0]-28)+','+(p[1]+34)+' L'+(p[0]+28)+','+(p[1]+34)+' Q'+(p[0]+24)+','+(p[1]+46)+' '+p[0]+','+(p[1]+46)+' Q'+(p[0]-24)+','+(p[1]+46)+' '+(p[0]-28)+','+(p[1]+34)+' Z" fill="#8FB0FF" stroke="'+INK+'" stroke-width="2.5" stroke-linejoin="round"/>'+
        '<text x="'+p[0]+'" y="'+(p[1]+30)+'" font-size="30" text-anchor="middle">'+p[2]+'</text>'});
    return svg(200,132,inner,"fig-balanca");
  },
  /* folha de um mês (D S T Q Q S S): f.y = ano, f.m = mês de 0 a 11 */
  calendario:function(f){
    var MES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
      ult=new Date(f.y,f.m+1,0).getDate(),pri=new Date(f.y,f.m,1).getDay(),h="",i;
    ["D","S","T","Q","Q","S","S"].forEach(function(d){h+='<b>'+d+'</b>'});
    for(i=0;i<pri;i++)h+='<span></span>';
    for(i=1;i<=ult;i++)h+='<span>'+i+'</span>';
    return '<div class="fig-cal" aria-hidden="true"><div class="cal-t">'+MES[f.m]+' de '+f.y+'</div><div class="cal-g">'+h+'</div></div>';
  },
  /* moedas e cédulas desenhadas de forma genérica (sem a arte oficial): cada valor tem sempre a mesma cor */
  dinheiro:function(f){
    var CO={5:"#D9A066",10:"#E7C45A",25:"#E8B07A",50:"#CBD3DD",100:"#EBD08A"},CE={2:"#9CC3F5",5:"#C7AEF0",10:"#F29A9A",20:"#F7CF73",50:"#E9A15B"},K="#14213D";
    return '<div class="fig-din" aria-hidden="true">'+f.items.map(function(it){
      if(it.k==="moeda"){var u=it.v===100?["1","real"]:[String(it.v),"centavos"];
        return svg(64,64,'<circle cx="32" cy="32" r="29" fill="'+CO[it.v]+'" stroke="'+K+'" stroke-width="3"/>'+(it.v===100?'<circle cx="32" cy="32" r="21" fill="none" stroke="'+K+'" stroke-width="2"/>':'')+'<text x="32" y="'+(u[1]==="real"?36:33)+'" font-size="'+(u[0].length>1?22:26)+'" font-weight="800" text-anchor="middle" fill="'+K+'">'+u[0]+'</text><text x="32" y="48" font-size="'+(u[1]==="real"?11:9)+'" font-weight="700" text-anchor="middle" fill="'+K+'">'+u[1]+'</text>',"fig-moeda");}
      return svg(110,60,'<rect x="3" y="3" width="104" height="54" rx="7" fill="'+CE[it.v]+'" stroke="'+K+'" stroke-width="3"/><rect x="9" y="9" width="92" height="42" rx="4" fill="none" stroke="'+K+'" stroke-width="1.4" stroke-dasharray="3 3"/><text x="55" y="38" font-size="26" font-weight="800" text-anchor="middle" fill="'+K+'">'+it.v+'</text><text x="55" y="50" font-size="9" font-weight="700" text-anchor="middle" fill="'+K+'">reais</text>',"fig-cedula");
    }).join("")+'</div>';
  },
  /* caixa de bolas vermelhas ("r") e azuis ("a") */
  bolas:function(f){
    var H=Math.max(130,Math.ceil(f.balls.length/4)*50+30),inner='<rect x="3" y="3" width="294" height="'+(H-6)+'" rx="14" fill="none" stroke="'+INK+'" stroke-width="3"/>';
    f.balls.forEach(function(b,i){var cx=45+(i%4)*70,cy=42+Math.floor(i/4)*50;
      inner+='<circle cx="'+cx+'" cy="'+cy+'" r="20" fill="'+(b==="r"?"#D93B3B":"#2457D6")+'" stroke="'+INK+'" stroke-width="2.5"/><ellipse cx="'+(cx-7)+'" cy="'+(cy-8)+'" rx="5" ry="3" fill="#fff" opacity=".55"/>'});
    return svg(300,H,inner,"fig-bolas");
  },
  /* tabela simples de duas colunas */
  tabela:function(f){
    return '<table class="fig-tab"><caption>'+esc(f.title)+'</caption><thead><tr><th>Escolha</th><th>Crianças</th></tr></thead><tbody>'+
      f.labels.map(function(l,i){return '<tr><td>'+esc(l)+'</td><td>'+f.values[i]+'</td></tr>'}).join("")+'</tbody></table>';
  },
  /* pacotes de 10 objetos (cada um numa moldura) e alguns soltos, sem moldura */
  pacotes:function(f){
    function fila(n,box){return '<div class="pk'+(box?' box':'')+'">'+new Array(n+1).join(f.e)+'</div>'}
    var h="",i;for(i=0;i<f.packs;i++)h+=fila(10,true);if(f.loose>0)h+=fila(f.loose,false);
    return '<div class="fig-pacotes" aria-hidden="true">'+h+'</div>';
  },
  /* objetos espalhados numa caixa (pts em pontos de uma caixa de 300 x 200; o tamanho se ajusta à largura) */
  scatter:function(f){
    return '<div class="fig-scatter" aria-hidden="true">'+f.pts.map(function(q){
      return '<span style="left:'+(q[0]/3).toFixed(2)+'%;top:'+(q[1]/2).toFixed(2)+'%">'+f.e+'</span>'}).join("")+'</div>';
  },
  /* figura plana da grade do 1º ano (níveis 14 e 17): forma, cor, tamanho (f.s) e variações:
     retângulo deitado ou em pé (f.o, proporção f.r), triângulo de vários formatos (f.v) e posições (f.rot) */
  forma:function(f){
    var g=formaGeom(f),col=f.color||C.sky,sc=f.s||1,body=g.circle?
      '<circle cx="50" cy="50" r="38" fill="'+col+'" stroke="'+INK+'" stroke-width="3" vector-effect="non-scaling-stroke"/>':
      '<polygon points="'+g.pts.map(function(q){return q[0]+","+q[1]}).join(" ")+'" fill="'+col+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>';
    return svg(100,100,'<g transform="translate(50 50) scale('+sc+') translate(-50 -50)">'+body+'</g>',"fig-shape");
  },
  /* fila de coisas (emojis ou figuras), na horizontal ou na vertical; f.q acrescenta uma casa com "?" */
  fila:function(f){
    return '<div class="fig-fila '+(f.dir==="v"?"v":"h")+'" aria-hidden="true">'+f.items.map(function(it){
      return '<span class="fi">'+(typeof it==="string"?it:FC.fig(it.fig||it))+'</span>'}).join("")+(f.q?'<span class="fi q">?</span>':"")+'</div>';
  },
  /* uma caixa com um objeto de um lado (esquerda, direita, meio ou em cima) */
  caixa:function(f){return '<div class="fig-caixa" aria-hidden="true"><span class="p-'+f.pos+'">'+f.e+'</span></div>'},
  /* objetos desenhados do dia a dia: lata, tubo, vela e caixa de sapato */
  obj:function(f){
    var id="g"+(++uid),s=INK,sw=' stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"',inner;
    var gr='<defs><linearGradient id="'+id+'" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#CFD8E8"/><stop offset="1" stop-color="#8FA0BC"/></linearGradient></defs>';
    if(f.k==="lata")inner=gr+'<path d="M22,26 L22,76 A28,9 0 0 0 78,76 L78,26" fill="url(#'+id+')"'+sw+'/><rect x="22" y="40" width="56" height="26" fill="#F2503F"/><ellipse cx="50" cy="26" rx="28" ry="9" fill="#E6EDF9"'+sw+'/>';
    else if(f.k==="tubo")inner=gr+'<path d="M12,34 L12,66 A9,16 0 0 0 12,34" fill="#CFD8E8"'+sw+'/><path d="M12,34 L82,34 L82,66 L12,66 A9,16 0 0 1 12,34" fill="url(#'+id+')"'+sw+'/><ellipse cx="82" cy="50" rx="9" ry="16" fill="#E6EDF9"'+sw+'/>';
    else if(f.k==="vela")inner='<path d="M34,36 L34,86 L66,86 L66,36" fill="#FFD36B"'+sw+'/><ellipse cx="50" cy="36" rx="16" ry="6" fill="#FFE9A8"'+sw+'/><line x1="50" y1="36" x2="50" y2="26" stroke="'+s+'" stroke-width="2.5" stroke-linecap="round"/><path d="M50,8 C58,16 56,24 50,26 C44,24 42,16 50,8 Z" fill="#F2503F"/>';
    else inner='<polygon points="10,40 70,40 70,80 10,80" fill="#E8B56B"'+sw+'/><polygon points="10,40 30,24 90,24 70,40" fill="#F3CD94"'+sw+'/><polygon points="70,40 90,24 90,64 70,80" fill="#C98F42"'+sw+'/><line x1="10" y1="48" x2="70" y2="48" stroke="'+s+'" stroke-width="1.6"/>';
    return svg(100,100,inner,"fig-solid");
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
  /* placas de 100, barras de 10 e quadradinhos de 1 (material dourado, 2º ano): f.h placas, f.d barras, f.o quadradinhos */
  placas:function(f){
    var milhar=f.m!==undefined,inner="",pw=milhar?36:44,gap=4,per=milhar?7:6,y=4,i,j,x,py,d;
    if(milhar){                                      /* cubos de 1000 (3º ano), em perspectiva */
      for(i=0;i<f.m;i++){
        var cx=18+i*32;
        inner+='<polygon class="cb" points="'+cx+','+y+' '+(cx+14)+','+(y+7)+' '+cx+','+(y+14)+' '+(cx-14)+','+(y+7)+'" fill="#D9CCFF" stroke="'+INK+'" stroke-width="1.6" stroke-linejoin="round"/>'+
          '<polygon points="'+(cx-14)+','+(y+7)+' '+cx+','+(y+14)+' '+cx+','+(y+30)+' '+(cx-14)+','+(y+23)+'" fill="#A58BF0" stroke="'+INK+'" stroke-width="1.6" stroke-linejoin="round"/>'+
          '<polygon points="'+(cx+14)+','+(y+7)+' '+cx+','+(y+14)+' '+cx+','+(y+30)+' '+(cx+14)+','+(y+23)+'" fill="#7B5FD1" stroke="'+INK+'" stroke-width="1.6" stroke-linejoin="round"/>';
      }
      if(f.m>0)y+=38;
    }
    for(i=0;i<f.h;i++){
      x=4+(i%per)*(pw+gap);py=y+Math.floor(i/per)*(pw+gap);
      inner+='<rect class="pl" x="'+x+'" y="'+py+'" width="'+pw+'" height="'+pw+'" fill="#7EE0BE" stroke="'+INK+'" stroke-width="1.6"/>';
      for(j=1;j<10;j++){d=+(j*pw/10).toFixed(1);
        inner+='<line x1="'+(x+d)+'" x2="'+(x+d)+'" y1="'+py+'" y2="'+(py+pw)+'" stroke="'+INK+'" stroke-width=".5" opacity=".6"/>'+
          '<line x1="'+x+'" x2="'+(x+pw)+'" y1="'+(py+d)+'" y2="'+(py+d)+'" stroke="'+INK+'" stroke-width=".5" opacity=".6"/>'}
    }
    if(f.h>0)y+=Math.ceil(f.h/per)*(pw+gap)+4;
    for(i=0;i<f.d;i++){
      x=4+i*15;
      inner+='<rect class="br" x="'+x+'" y="'+y+'" width="10" height="'+pw+'" fill="'+C.sky+'" stroke="'+INK+'" stroke-width="1.4"/>';
      for(j=1;j<10;j++)inner+='<line x1="'+x+'" x2="'+(x+10)+'" y1="'+(y+j*pw/10)+'" y2="'+(y+j*pw/10)+'" stroke="'+INK+'" stroke-width=".7"/>';
    }
    if(f.d>0)y+=pw+10;
    for(i=0;i<f.o;i++)inner+='<rect class="un" x="'+(4+i*16)+'" y="'+y+'" width="12" height="12" fill="'+C.sun+'" stroke="'+INK+'" stroke-width="1.4"/>';
    if(f.o>0)y+=16;
    return svg(300,Math.max(y,24),inner,"fig-b100");
  },
  /* mancha de pontos em linhas e colunas (estimativa, 2º ano): f.n pontos em f.c colunas, com um quadro marcado "100" (10 x 10 pontos) no canto */
  mancha:function(f){
    var sp=6,pad=6,top=16,rows=Math.ceil(f.n/f.c),W=f.c*sp+pad*2,H=rows*sp+top+pad,inner="",k;
    for(k=0;k<f.n;k++)inner+='<circle class="pt" cx="'+(pad+(k%f.c)*sp+sp/2)+'" cy="'+(top+Math.floor(k/f.c)*sp+sp/2)+'" r="1.7" fill="'+INK+'"/>';
    inner+='<rect class="q100" x="'+pad+'" y="'+top+'" width="'+(10*sp)+'" height="'+(10*sp)+'" fill="none" stroke="'+C.coral+'" stroke-width="2.2"/>'+
      '<text x="'+(pad+5*sp)+'" y="'+(top-4)+'" text-anchor="middle" font-size="11" font-weight="700" fill="'+C.coral+'">100</text>';
    return '<svg class="figsvg fig-mancha" viewBox="0 0 '+W+' '+H+'" role="img" aria-hidden="true" focusable="false" style="width:'+Math.round(W*1.4)+'px">'+inner+'</svg>';
  },
  /* grupos iguais (multiplicação, 2º ano): f.g caixas com f.q objetos cada uma */
  grupos:function(f){
    var h="",i,j,c=Math.min(f.q,5);
    for(i=0;i<f.g;i++){var o="";for(j=0;j<f.q;j++)o+="<i>"+f.e+"</i>";h+='<span class="gbox" style="--c:'+c+'">'+o+"</span>"}
    return '<div class="fig-grupos" aria-hidden="true">'+h+"</div>";
  },
  /* repartir em partes iguais (2º ano): f.n objetos soltos numa bandeja e f.g pratos vazios */
  reparte:function(f){
    var o="",p="",i;
    for(i=0;i<f.n;i++)o+="<i>"+f.e+"</i>";
    for(i=0;i<f.g;i++)p+='<span class="prato"></span>';
    return '<div class="fig-reparte" aria-hidden="true"><div class="bandeja">'+o+'</div><div class="pratos">'+p+"</div></div>";
  },
  /* quadriculado com letras nas colunas e números nas linhas (a linha 1 fica embaixo); f.c colunas, f.r linhas,
     f.s = [coluna, linha] do ponto de partida (●) e f.d = [coluna, linha] do destino (★), se houver */
  quadriculado:function(f){
    var cs=38,ml=20,top=6,W=ml+f.c*cs+6,H=top+f.r*cs+22,inner="",i,j;
    for(i=0;i<=f.c;i++)inner+='<line x1="'+(ml+i*cs)+'" x2="'+(ml+i*cs)+'" y1="'+top+'" y2="'+(top+f.r*cs)+'" stroke="'+C.line+'" stroke-width="1.4"/>';
    for(j=0;j<=f.r;j++)inner+='<line x1="'+ml+'" x2="'+(ml+f.c*cs)+'" y1="'+(top+j*cs)+'" y2="'+(top+j*cs)+'" stroke="'+C.line+'" stroke-width="1.4"/>';
    for(i=0;i<f.c;i++)inner+='<text x="'+(ml+i*cs+cs/2)+'" y="'+(top+f.r*cs+16)+'" text-anchor="middle" font-size="13" font-weight="700" fill="'+INK+'">'+"ABCDEFGH".charAt(i)+'</text>';
    for(j=0;j<f.r;j++)inner+='<text x="'+(ml-6)+'" y="'+(top+j*cs+cs/2+5)+'" text-anchor="end" font-size="13" font-weight="700" fill="'+INK+'">'+(f.r-j)+'</text>';
    function cx(col){return ml+(col-.5)*cs}function cy(row){return top+(f.r-row+.5)*cs}
    if(f.d)inner+='<text class="dest" x="'+cx(f.d[0])+'" y="'+(cy(f.d[1])+9)+'" text-anchor="middle" font-size="28" fill="'+C.sun+'" stroke="'+INK+'" stroke-width="1" paint-order="stroke">★</text>';
    if(f.s)inner+='<circle class="start" cx="'+cx(f.s[0])+'" cy="'+cy(f.s[1])+'" r="11" fill="'+C.blue+'" stroke="#fff" stroke-width="2.5"/>';
    return svg(W,H,inner,"fig-quad");
  },
  /* régua de 0 a f.max cm (as peças ficam encostadas no zero): f.objs = [{k:"lapis"|"fita"|"clipe"|"borracha", len}] */
  regua:function(f){
    var sc=18,x0=10,oh=22,gap=8,rows=f.objs.length,y0=rows*(oh+gap)+8,W=x0*2+f.max*sc,H=y0+44,inner="",i;
    f.objs.forEach(function(o,r){
      var y=4+r*(oh+gap),w=o.len*sc,fill={lapis:"#FFD36B",fita:"#7EE0BE",clipe:"#CFD8E8",borracha:"#F7A8C4"}[o.k],yy=o.k==="clipe"?y+5:y,hh=o.k==="clipe"?oh-10:oh;
      inner+='<rect class="obj" x="'+x0+'" y="'+yy+'" width="'+w+'" height="'+hh+'" rx="'+(o.k==="lapis"?2:o.k==="clipe"?5:6)+'" fill="'+fill+'" stroke="'+INK+'" stroke-width="1.8"/>';
      if(o.k==="lapis")inner+='<polygon points="'+(x0+w-12)+','+y+' '+(x0+w)+','+(y+oh/2)+' '+(x0+w-12)+','+(y+oh)+'" fill="#E8B56B" stroke="'+INK+'" stroke-width="1.8" stroke-linejoin="round"/><rect x="'+x0+'" y="'+y+'" width="9" height="'+oh+'" fill="#F2503F" stroke="'+INK+'" stroke-width="1.8"/>';
      if(o.k==="borracha")inner+='<rect x="'+(x0+w*.55)+'" y="'+y+'" width="'+(w*.45)+'" height="'+oh+'" rx="6" fill="#8FB0FF" stroke="'+INK+'" stroke-width="1.8"/>';
      if(o.k==="fita")for(i=1;i*10<w-4;i++)inner+='<line x1="'+(x0+i*10)+'" x2="'+(x0+i*10)+'" y1="'+(y+4)+'" y2="'+(y+oh-4)+'" stroke="'+INK+'" stroke-width="1.2" opacity=".5"/>';
    });
    inner+='<rect x="'+x0+'" y="'+y0+'" width="'+(f.max*sc)+'" height="34" fill="#F7E9B4" stroke="'+INK+'" stroke-width="1.8"/>';
    for(i=0;i<=f.max;i++)inner+='<line x1="'+(x0+i*sc)+'" x2="'+(x0+i*sc)+'" y1="'+y0+'" y2="'+(y0+12)+'" stroke="'+INK+'" stroke-width="1.4"/><text x="'+(x0+i*sc)+'" y="'+(y0+27)+'" text-anchor="middle" font-size="10" font-weight="700" fill="'+INK+'">'+i+'</text>';
    return svg(W,H,inner,"fig-regua");
  },
  /* relógio digital: f.h e f.m (a hora fica sem zero à esquerda, os minutos com dois algarismos) */
  digital:function(f){return '<div class="fig-dig" aria-hidden="true">'+f.h+":"+(f.m<10?"0":"")+f.m+"</div>"},
  /* polígono com a medida de cada lado escrita (f.lados em cm; f.falta = índice do lado escondido, escrito "?") */
  poligono:function(f){
    var PTS={"triângulo":[[110,18],[196,142],[24,142]],"quadrado":[[60,22],[160,22],[160,122],[60,122]],"retângulo":[[28,32],[192,32],[192,122],[28,122]],"pentágono":[[110,12],[170,56],[148,126],[72,126],[50,56]]},
      P=PTS[f.n].map(function(q){return [q[0]+36,q[1]]}),n=P.length,cx=0,cy=0,inner="",i;   /* margem à esquerda e à direita para os rótulos */
    P.forEach(function(q){cx+=q[0]/n;cy+=q[1]/n});
    inner+='<polygon points="'+P.map(function(q){return q.join(",")}).join(" ")+'" fill="'+C.sky+'" fill-opacity=".55" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>';
    for(i=0;i<n;i++){
      var a=P[i],b=P[(i+1)%n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=mx-cx,dy=my-cy,d=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/d,uy=dy/d,
        tx=mx+ux*10,ty=my+uy*10+(uy>.4?12:uy<-.4?-2:4),an=ux<-.4?"end":ux>.4?"start":"middle";
      inner+='<text class="lab" x="'+tx.toFixed(1)+'" y="'+ty.toFixed(1)+'" text-anchor="'+an+'" font-size="14" font-weight="700" fill="'+INK+'">'+(i===f.falta?"?":f.lados[i]+" cm")+'</text>';
    }
    return svg(290,176,inner,"fig-poli");
  },
  /* tabela de dupla entrada: f.rows (linhas), f.cols (colunas), f.v[linha][coluna] */
  tabela2:function(f){
    return '<table class="fig-tab"><caption>'+esc(f.title)+'</caption><thead><tr><th></th>'+f.cols.map(function(c){return '<th>'+esc(c)+'</th>'}).join("")+'</tr></thead><tbody>'+
      f.rows.map(function(r,i){return '<tr><th>'+esc(r)+'</th>'+f.v[i].map(function(x){return '<td>'+x+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table>';
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
      if(lab&&v!==f.mark)inner+='<text x="'+x+'" y="106" text-anchor="middle" font-size="16" font-weight="700" fill="'+INK+'">'+(f.milh?milh(v):v)+'</text>'}
    var mx=x0+(x1-x0)*((f.mark-f.min)/f.step)/n;
    inner+='<polygon points="'+mx+',62 '+(mx-11)+',38 '+(mx+11)+',38" fill="'+C.coral+'"/><text x="'+mx+'" y="30" text-anchor="middle" font-size="22" font-weight="800" fill="'+C.coral+'">?</text>';
    return svg(W,114,inner,"fig-line");
  },
  /* reta numérica com pontos marcados por letras (3º ano): f.min, f.max, f.step, f.labelEvery, f.pts = [{v, l}]; o número dos pontos não é escrito */
  reta2:function(f){
    var W=360,x0=26,x1=334,n=(f.max-f.min)/f.step,inner='<line x1="'+(x0-12)+'" x2="'+(x1+12)+'" y1="68" y2="68" stroke="'+INK+'" stroke-width="4" stroke-linecap="round"/>',k;
    var isPt=function(v){return f.pts.some(function(p){return p.v===v})};
    for(k=0;k<=n;k++){var v=f.min+k*f.step,x=x0+(x1-x0)*k/n,lab=(f.labelEvery?(v-f.min)%f.labelEvery===0:true);
      inner+='<line x1="'+x+'" x2="'+x+'" y1="'+(lab?52:58)+'" y2="'+(lab?84:78)+'" stroke="'+INK+'" stroke-width="'+(lab?3.6:2.4)+'" stroke-linecap="round"/>';
      if(lab&&!isPt(v))inner+='<text x="'+x+'" y="106" text-anchor="middle" font-size="16" font-weight="700" fill="'+INK+'">'+milh(v)+'</text>'}
    f.pts.forEach(function(p){var px=x0+(x1-x0)*((p.v-f.min)/f.step)/n;
      inner+='<circle class="pt2" cx="'+px+'" cy="68" r="8" fill="'+C.coral+'" stroke="'+INK+'" stroke-width="2"/><text x="'+px+'" y="42" text-anchor="middle" font-size="22" font-weight="800" fill="'+C.coral+'">'+p.l+'</text>'});
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
  /* objeto em forma de cone: chapéu de festa (não existe emoji de cone inteiro) */
  hat:function(){
    var id="g"+(++uid),s=INK;
    return svg(100,100,'<defs><linearGradient id="'+id+'" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#FFD36B"/><stop offset=".45" stop-color="#F2A33A"/><stop offset="1" stop-color="#C46A12"/></linearGradient></defs><path d="M16,80 L50,12 L84,80 A34,10 0 0 1 16,80 Z" fill="url(#'+id+')" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/><circle cx="44" cy="52" r="4" fill="#fff"/><circle cx="58" cy="64" r="4" fill="#E8456B"/><circle cx="36" cy="70" r="3.5" fill="#2457D6"/><circle cx="50" cy="12" r="6" fill="#E8456B" stroke="'+s+'" stroke-width="2"/>',"fig-hat");
  },
  solid:function(f){
    var id="g"+(++uid),s=INK,inner="";
    if(f.n==="cubo")inner='<polygon points="50,8 88,26 50,44 12,26" fill="'+C.sky+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/><polygon points="12,26 50,44 50,92 12,72" fill="'+C.blue+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/><polygon points="88,26 50,44 50,92 88,72" fill="#173F9F" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/>';
    else if(f.n==="bloco retangular")inner='<polygon points="30,16 94,16 70,34 6,34" fill="'+C.sky+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/><polygon points="6,34 70,34 70,84 6,84" fill="'+C.blue+'" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/><polygon points="94,16 70,34 70,84 94,66" fill="#173F9F" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/>';
    else if(f.n==="esfera")inner='<defs><radialGradient id="'+id+'" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="'+C.blue+'"/></radialGradient></defs><circle cx="50" cy="50" r="40" fill="url(#'+id+')" stroke="'+s+'" stroke-width="2.5"/>';
    else if(f.n==="cilindro")inner='<defs><linearGradient id="'+id+'" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#7FA2FF"/><stop offset=".35" stop-color="'+C.blue+'"/><stop offset="1" stop-color="#173F9F"/></linearGradient></defs><path d="M20,24 L20,76 A30,10 0 0 0 80,76 L80,24" fill="url(#'+id+')" stroke="'+s+'" stroke-width="2.5"/><ellipse cx="50" cy="24" rx="30" ry="10" fill="'+C.sky+'" stroke="'+s+'" stroke-width="2.5"/>';
    else if(f.n==="cone")inner='<defs><linearGradient id="'+id+'" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#7FA2FF"/><stop offset=".4" stop-color="'+C.blue+'"/><stop offset="1" stop-color="#173F9F"/></linearGradient></defs><path d="M18,74 L50,10 L82,74 A32,11 0 0 1 18,74 Z" fill="url(#'+id+')" stroke="'+s+'" stroke-width="2.5" stroke-linejoin="round"/>';
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
/* f: palavra feminina (Quantas maçãs…), senão Quantos peixes… */
var OBJ=[{e:"🍎",pl:"maçãs",f:1},{e:"🐟",pl:"peixes"},{e:"⭐",pl:"estrelas",f:1},{e:"🎈",pl:"balões"},{e:"🐶",pl:"cachorros"},{e:"🌼",pl:"flores",f:1},{e:"⚽",pl:"bolas",f:1},{e:"🍪",pl:"biscoitos"},{e:"🚗",pl:"carros"},{e:"🐥",pl:"pintinhos"}];
var NAMES=[["Ana","f"],["Bia","f"],["Caio","m"],["Davi","m"],["Eva","f"],["Gui","m"],["Isa","f"],["Léo","m"],["Lia","f"],["Nina","f"],["Pedro","m"],["Rita","f"]];
var FIG2D=["círculo","quadrado","retângulo","triângulo"],FIG2D_MAIS=["círculo","quadrado","retângulo","triângulo","trapézio","paralelogramo","losango","pentágono","hexágono"];

function gCount(lo,hi,per){return function(){var n=rnd(lo,hi),o=pick(OBJ);
  return typed((o.f?"Quantas ":"Quantos ")+o.pl+" têm aqui?",n,{t:"emoji",groups:[{e:o.e,n:n}],per:per||5})}}
function gMoreBy(){var o1=pick(OBJ),o2;do{o2=pick(OBJ)}while(o2.e===o1.e);
  var n2=rnd(2,10),n1=Math.random()<.12?n2:n2+rnd(1,6),menos=n1!==n2&&Math.random()<.5;
  var grupos=[{e:o1.e,n:n1},{e:o2.e,n:n2}];if(Math.random()<.5)grupos.reverse();
  /* "a mais": pergunta sobre o grupo maior; "a menos": sobre o grupo menor. A resposta é a mesma diferença. */
  return typed(menos?"Quantos "+o2.e+" a menos do que "+o1.e+" há aqui?":"Quantos "+o1.e+" a mais do que "+o2.e+" há aqui?",n1-n2,{t:"emoji",groups:grupos,per:5});}
function gTens(){var t=rnd(1,9),o=rnd(0,9);return typed("Cada barra vale 10 e cada quadradinho vale 1. Quanto vale tudo junto?",t*10+o,{t:"base10",tens:t,ones:o})}
function gBigger(lo,hi,which){return function(){var x=rnd(lo,hi),y,z;do{y=rnd(lo,hi)}while(y===x||(y>9&&x>9&&String(y).split("").reverse().join("")===String(x)&&Math.random()<.7));
  do{z=rnd(lo,hi)}while(z===x||z===y);
  /* três opções: chutar acerta 1 em 3, não 1 em 2 */
  var v=[x,y,z],big=Math.max.apply(null,v),small=Math.min.apply(null,v),w=which||pick(["maior","menor"]),good=w==="maior"?big:small;
  return choice("Qual é o "+w+" número?",String(good),v.filter(function(n){return n!==good}).map(String),null)}}
function gNeighbor(lo,hi){return function(){var n=rnd(lo,hi),after=Math.random()<.5;
  return typed("Que número vem "+(after?"depois":"antes")+" do "+n+"?",after?n+1:n-1)}}
function gOrdinal(){var n=pick(NAMES),p=rnd(2,15),f=n[1]==="f";
  var it=typed(n[0]+" é "+(f?"a "+p+"ª":"o "+p+"º")+" da fila. Quantas crianças estão na frente "+(f?"dela":"dele")+"?",p-1);
  it.key="fila|"+p;return it}   /* key: identidade para não repetir na folha (só trocar o nome não é conta nova) */
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
  /* lados e vértices (cantos) são sempre em mesmo número nos polígonos */
  return typed(Math.random()<.5?"Quantos lados tem esta figura?":"Quantos vértices (cantos) tem esta figura?",SHAPES[n].sides,{t:"shape",n:n,color:pick(SHAPE_COLORS)})}}
var SOLIDOBJ={"esfera":["⚽","🏀","🌍"],"cubo":["🎲","🧊"],"cilindro":["🥫","🛢️"],"cone":[{fig:{t:"hat"}}],"bloco retangular":["📦","🧱"]};
function gSolidObject(){var names=Object.keys(SOLIDOBJ),n=pick(names),good=pick(SOLIDOBJ[n]),wr=[];
  /* cubo e bloco retangular não aparecem juntos: o dado também é um bloco retangular, e a caixa pode parecer um cubo */
  seededShuffle(names.filter(function(x){return x!==n&&!tambemE(x,n)&&!tambemE(n,x)&&!(n==="esfera"&&x==="cone")}),"s"+n+rnd(0,999999)).slice(0,3).forEach(function(x){wr.push(SOLIDOBJ[x][0])});
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
var CHANCE=[["O Sol vai aparecer amanhã de manhã.",0],["Tirar uma bola azul de uma caixa que só tem bolas vermelhas.",2],["Vai chover no sábado.",1],["Lançar um dado e sair o número 7.",2],["Lançar um dado e sair um número de 1 a 6.",0],["Sortear um menino numa turma de meninos e meninas.",1],["Depois da segunda-feira vem a terça-feira.",0],["Um gato falar português.",2],["Sair cara ao lançar uma moeda.",1],["Uma pessoa viva ter 300 anos de idade.",2],["Depois do sábado vem o domingo.",0],["Sortear uma bola vermelha de um saco com bolas vermelhas e azuis.",1],["Tirar uma bola verde de um saco que só tem bolas verdes.",0],["Um cachorro voar sem ajuda de nada.",2],["Sair o número 3 ao lançar um dado.",1],["A água de uma panela ferver no fogo aceso, se esperarmos bastante.",0]];
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
  {id:"lados",nome:"Quantos lados e vértices tem a figura",hab:["EF03MA15"],gen:gSides()},
  {id:"sólidoObjeto",nome:"Objeto com a forma do sólido",hab:["EF01MA13","EF02MA14","EF03MA13"],gen:gSolidObject},
  {id:"sólidoNome",nome:"Nome do sólido geométrico",hab:["EF02MA14","EF03MA13"],gen:gSolidName},
  {id:"relogio",nome:"Ler o relógio (horas e meias horas)",hab:["EF03MA22","EF03MA23"],gen:gClock([0,30])},
  {id:"relogio2",nome:"Ler o relógio (de 5 em 5 minutos)",hab:["EF03MA22","EF03MA23"],gen:gClock([0,5,10,15,20,25,30,35,40,45,50,55])},
  {id:"graficoLer",nome:"Ler um gráfico de colunas",hab:["EF01MA21","EF02MA22","EF03MA26"],gen:gBarRead},
  {id:"graficoMais",nome:"Qual coluna é a maior ou a menor",hab:["EF03MA27"],gen:gBarTop},
  {id:"reta20",nome:"Número na reta numérica (de 1 em 1)",hab:["EF03MA04"],gen:gLine([[0,20,1,5],[10,30,1,5],[20,40,1,5],[0,10,1,5]])},
  {id:"reta100",nome:"Número na reta numérica (de 5 em 5, de 10 em 10, de 20 em 20)",hab:["EF03MA04"],gen:gLine([[0,100,10,20],[0,50,5,10],[0,200,20,40],[100,200,10,20],[0,100,5,25]])},
  {id:"malha",nome:"Contar quadradinhos na malha (área)",hab:["EF04MA21"],gen:gGrid},
  {id:"acaso",nome:"Certeza, talvez ou impossível",hab:["EF01MA20","EF02MA21"],gen:gChance},
  {id:"moedas",nome:"Moedas em centavos",hab:["EF02MA20"],gen:gCoins}
];
FC.EXBY={};FC.EX.forEach(function(e){FC.EXBY[e.id]=e});
/* Auxiliares para os geradores da grade nova (grade1.js). */
FC.exh={milh:milh,rnd:rnd,pick:pick,choice:choice,typed:typed,uniq:uniq,OBJ:OBJ,NAMES:NAMES,formaGeom:formaGeom,TRI:TRI,same:same};
FC.SHAPE_NAMES=Object.keys(SHAPES);
})();
