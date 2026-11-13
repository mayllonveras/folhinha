/* Catálogo de figurinhas: temas com 52 figurinhas cada (uma por semana do ano).
   Temas com emoji (reconhecíveis em qualquer aparelho) e temas desenhados em vetor pelo próprio app (cada figurinha é única). */
(function(){
"use strict";
var FC=window.FC;
FC.ALBUM_SIZE=52;

function rng(seed){var a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}

/* ---------- temas com emoji ---------- */
var ANIMAIS=[["🦁","Leão"],["🐯","Tigre"],["🐘","Elefante"],["🦒","Girafa"],["🦓","Zebra"],["🦛","Hipopótamo"],["🦏","Rinoceronte"],["🐒","Macaco"],["🦍","Gorila"],["🐻","Urso"],["🐼","Panda"],["🐨","Coala"],["🦘","Canguru"],["🐫","Camelo"],["🦙","Lhama"],["🦊","Raposa"],["🐺","Lobo"],["🦉","Coruja"],["🦅","Águia"],["🐧","Pinguim"],["🦩","Flamingo"],["🦚","Pavão"],["🦜","Papagaio"],["🦢","Cisne"],["🐊","Crocodilo"],["🐢","Tartaruga"],["🐍","Cobra"],["🐸","Sapo"],["🐙","Polvo"],["🐳","Baleia"],["🐬","Golfinho"],["🦈","Tubarão"],["🦀","Caranguejo"],["🦞","Lagosta"],["🐠","Peixe-tropical"],["🦋","Borboleta"],["🐞","Joaninha"],["🐝","Abelha"],["🐜","Formiga"],["🕷️","Aranha"],["🐌","Caracol"],["🐿️","Esquilo"],["🐰","Coelho"],["🐴","Cavalo"],["🐮","Vaca"],["🐷","Porco"],["🐑","Ovelha"],["🐔","Galinha"],["🦆","Pato"],["🐱","Gato"],["🐶","Cachorro"],["🦔","Ouriço"]];
var FRUTAS=[["🍎","Maçã"],["🍐","Pera"],["🍊","Laranja"],["🍋","Limão"],["🍌","Banana"],["🍉","Melancia"],["🍇","Uva"],["🍓","Morango"],["🍈","Melão"],["🍒","Cereja"],["🍑","Pêssego"],["🥭","Manga"],["🍍","Abacaxi"],["🥥","Coco"],["🥝","Kiwi"],["🍅","Tomate"],["🍆","Berinjela"],["🥑","Abacate"],["🥦","Brócolis"],["🥕","Cenoura"],["🌽","Milho"],["🥒","Pepino"],["🥔","Batata"],["🍠","Batata-doce"],["🍄","Cogumelo"],["🥜","Amendoim"],["🍞","Pão"],["🥐","Croissant"],["🥖","Baguete"],["🥨","Pretzel"],["🧀","Queijo"],["🥚","Ovo"],["🥞","Panqueca"],["🍔","Hambúrguer"],["🍟","Batata frita"],["🍕","Pizza"],["🌭","Cachorro-quente"],["🌮","Taco"],["🍝","Espaguete"],["🍜","Lámen"],["🍣","Sushi"],["🍙","Onigiri"],["🍦","Sorvete"],["🍩","Rosquinha"],["🍪","Biscoito"],["🎂","Bolo"],["🧁","Cupcake"],["🍫","Chocolate"],["🍬","Bala"],["🍭","Pirulito"],["🍿","Pipoca"],["🍯","Mel"]];
var VEICULOS=[["🚗","Carro"],["🚕","Táxi"],["🚙","Utilitário"],["🚌","Ônibus"],["🚎","Trólebus"],["🏎️","Carro de corrida"],["🚓","Viatura"],["🚑","Ambulância"],["🚒","Bombeiros"],["🚐","Van"],["🚚","Caminhão de entrega"],["🚛","Carreta"],["🚜","Trator"],["🏍️","Moto"],["🛵","Lambreta"],["🚲","Bicicleta"],["🛴","Patinete"],["🛹","Skate"],["🚂","Locomotiva"],["🚆","Trem"],["🚄","Trem-bala"],["🚅","Trem-bala veloz"],["🚇","Metrô"],["🚊","Bonde"],["🚝","Monotrilho"],["🚞","Trem de montanha"],["🚋","Vagão de bonde"],["✈️","Avião"],["🛩️","Avião pequeno"],["🛫","Decolagem"],["🛬","Aterrissagem"],["🚁","Helicóptero"],["🚀","Foguete"],["🛸","Disco voador"],["🛰️","Satélite"],["🚡","Teleférico"],["🚠","Bondinho de montanha"],["🚟","Trem suspenso"],["⛵","Veleiro"],["🚤","Lancha"],["🛥️","Barco a motor"],["🚢","Navio"],["⛴️","Balsa"],["🛶","Canoa"],["🎈","Balão"],["🪂","Paraquedas"],["🛷","Trenó"],["🛺","Tuk-tuk"],["🚔","Carro de polícia"],["🚃","Vagão de trem"],["🚈","Trem leve"],["🛳️","Transatlântico"]];

/* ---------- temas desenhados em vetor ---------- */
var planetCounter=0;
function planetName(slot){
  var S=["Zor","Kel","Mar","Tho","Vyn","Qua","Nex","Lum","Ost","Pry","Dra","Fen","Gal","Hel","Ixo","Jur","Kyr","Lor"],E=["bus","aria","on"];
  return cap(S[slot%18]+E[(slot%18+Math.floor(slot/18))%3]);
}
function planetArt(slot){
  var R=rng(5000+slot*104729),P=function(a){return a[Math.floor(R()*a.length)]},id="pl"+(++planetCounter),i;
  var h1=(slot*31+Math.floor(R()*40))%360,h2=(h1+P([30,60,140,180,200]))%360;
  var ring=R()<.45,bands=P([0,0,3,4,6]),moons=P([0,1,1,2]),craters=P([0,3,5]),tilt=P([-25,-15,0,15,25]);
  var s='<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img"><defs>'+
    '<radialGradient id="'+id+'g" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="hsl('+h1+' 85% 72%)"/><stop offset="1" stop-color="hsl('+h2+' 70% 35%)"/></radialGradient>'+
    '<clipPath id="'+id+'c"><circle cx="50" cy="50" r="24"/></clipPath></defs><rect width="100" height="100" rx="14" fill="#15133a"/>';
  for(i=0;i<16;i++)s+='<circle cx="'+(R()*96+2).toFixed(1)+'" cy="'+(R()*96+2).toFixed(1)+'" r="'+(0.6+R()*1.1).toFixed(2)+'" fill="#fff" opacity="'+(0.5+R()*0.5).toFixed(2)+'"/>';
  s+='<g transform="rotate('+tilt+' 50 50)">';
  var ringColor='hsl('+h2+' 60% 78%)';
  if(ring)s+='<path d="M10 50 A40 11 0 0 1 90 50" stroke="'+ringColor+'" stroke-width="5" fill="none" opacity=".9"/>';
  s+='<circle cx="50" cy="50" r="24" fill="url(#'+id+'g)"/><g clip-path="url(#'+id+'c)">';
  for(i=0;i<bands;i++)s+='<rect x="24" y="'+(30+i*(40/bands)).toFixed(1)+'" width="52" height="3.2" fill="hsl('+h2+' 60% 85%)" opacity=".35"/>';
  for(i=0;i<craters;i++)s+='<circle cx="'+(36+R()*28).toFixed(1)+'" cy="'+(36+R()*28).toFixed(1)+'" r="'+(2+R()*3.5).toFixed(1)+'" fill="hsl('+h2+' 50% 22%)" opacity=".28"/>';
  s+='</g>';
  if(ring)s+='<path d="M10 50 A40 11 0 0 0 90 50" stroke="'+ringColor+'" stroke-width="5" fill="none"/>';
  s+='</g>';
  var pos=[[80,24],[20,76]];
  for(i=0;i<moons;i++)s+='<circle cx="'+pos[i][0]+'" cy="'+pos[i][1]+'" r="'+(3+i)+'" fill="#d9d9e6"/>';
  return s+'</svg>';
}

var BANDEIRAS=[["br","Brasil","América do Sul"],["ar","Argentina","América do Sul"],["uy","Uruguai","América do Sul"],["py","Paraguai","América do Sul"],["cl","Chile","América do Sul"],["bo","Bolívia","América do Sul"],["pe","Peru","América do Sul"],["co","Colômbia","América do Sul"],["ve","Venezuela","América do Sul"],["ec","Equador","América do Sul"],["mx","México","América do Norte"],["us","Estados Unidos","América do Norte"],["ca","Canadá","América do Norte"],["cu","Cuba","América Central"],["jm","Jamaica","América Central"],["pt","Portugal","Europa"],["es","Espanha","Europa"],["fr","França","Europa"],["it","Itália","Europa"],["de","Alemanha","Europa"],["gb","Reino Unido","Europa"],["ie","Irlanda","Europa"],["nl","Países Baixos","Europa"],["be","Bélgica","Europa"],["ch","Suíça","Europa"],["se","Suécia","Europa"],["no","Noruega","Europa"],["dk","Dinamarca","Europa"],["fi","Finlândia","Europa"],["gr","Grécia","Europa"],["ru","Rússia","Europa e Ásia"],["pl","Polônia","Europa"],["ua","Ucrânia","Europa"],["tr","Turquia","Ásia e Europa"],["jp","Japão","Ásia"],["cn","China","Ásia"],["kr","Coreia do Sul","Ásia"],["in","Índia","Ásia"],["id","Indonésia","Ásia"],["th","Tailândia","Ásia"],["vn","Vietnã","Ásia"],["il","Israel","Ásia"],["sa","Arábia Saudita","Ásia"],["eg","Egito","África"],["za","África do Sul","África"],["ng","Nigéria","África"],["ma","Marrocos","África"],["ke","Quênia","África"],["ao","Angola","África"],["mz","Moçambique","África"],["au","Austrália","Oceania"],["nz","Nova Zelândia","Oceania"]];

FC.THEMES=[
  {id:"animais",name:"Animais do mundo",desc:"Leão, panda, pinguim, golfinho e mais 48 bichos.",kind:"emoji",items:ANIMAIS},
  {id:"frutas",name:"Frutas e comidas",desc:"Das frutas aos doces, 52 delícias para colecionar.",kind:"emoji",items:FRUTAS},
  {id:"veiculos",name:"Veículos",desc:"Carros, trens, barcos, aviões e foguetes.",kind:"emoji",items:VEICULOS},
  {id:"planetas",name:"Planetas misteriosos",desc:"52 mundos imaginários, com anéis, luas e crateras.",kind:"svg",art:planetArt,nameOf:planetName},
  {id:"bandeiras",name:"Bandeiras do mundo",desc:"As bandeiras de 52 países bem conhecidos, com o continente de cada um.",kind:"flag",items:BANDEIRAS}
];
/* Imagem de capa de um tema (para escolher o álbum). O tema pode indicar qual figurinha usar em "cover". */
FC.themeCover=function(id){
  var t=FC.theme(id);return FC.stickerInfo(id,t.cover||0).art;
};
FC.tierOf=function(themeId,slot){var t=FC.theme(themeId);return (t.rarity&&t.rarity[slot])||"comum"};
FC.tierName=function(tier){return tier==="ultra"?"Ultrarrara":tier==="rara"?"Rara":"Comum"};
/* Quais figurinhas são raras, para o painel dos adultos. */
FC.rarityLegend=function(themeId){
  var t=FC.theme(themeId);if(!t.rarity)return "";
  var u=[],r=[];Object.keys(t.rarity).forEach(function(k){var nm=FC.stickerInfo(themeId,Number(k)).name;(t.rarity[k]==="ultra"?u:r).push(nm)});
  return '<p class="muted small-t rarity-legend"><b>Ultrarraras:</b> '+u.map(FC.esc).join(", ")+'. <b>Raras:</b> '+r.map(FC.esc).join(", ")+'. As outras '+(FC.ALBUM_SIZE-u.length-r.length)+' são comuns. A figurinha da semana é sorteada, e as raras saem com menos chance.</p>';
};
FC.theme=function(id){for(var i=0;i<FC.THEMES.length;i++)if(FC.THEMES[i].id===id)return FC.THEMES[i];return FC.THEMES[0]};
FC.stickerInfo=function(themeId,slot){
  var t=FC.theme(themeId);
  if(t.kind==="emoji"){var it=t.items[slot];return{name:it[1],art:'<span class="emo" aria-hidden="true">'+it[0]+'</span>'}}
  if(t.kind==="flag"){var c=t.items[slot];return{name:c[1],sub:c[2],art:'<img class="flag" src="flags/'+c[0]+'.svg" alt="Bandeira: '+FC.esc(c[1])+'" loading="lazy">'}}
  return{name:t.nameOf(slot),sub:t.subOf?t.subOf(slot):"",art:t.art(slot)};
};
/* Cartão de uma figurinha. opts.dim deixa a figurinha apagada (visão do adulto para as que ainda não foram ganhas). */
FC.stickerHtml=function(themeId,slot,opts){
  var it=FC.stickerInfo(themeId,slot),hue=(slot*37+20)%360,tier=FC.tierOf(themeId,slot);
  var flip=!(opts&&opts.big)&&FC.theme(themeId).backOf;   // figurinha com verso: ao tocar, vira
  return '<div class="sticker'+(opts&&opts.dim?" dim":"")+(opts&&opts.big?" big":"")+(tier!=="comum"?" tier-"+tier:"")+(flip?" flippable":"")+'" style="--sh:'+hue+'" title="'+FC.esc(it.name)+'"'+
    (flip?' data-theme="'+themeId+'" data-slot="'+slot+'" role="button" tabindex="0" aria-label="'+FC.esc(it.name)+': tocar para ver o verso"':'')+'>'+
    '<div class="st-art">'+it.art+'</div>'+(tier!=="comum"?'<div class="st-tier">'+FC.tierName(tier)+'</div>':'')+'<div class="st-name'+(it.name.length>10?" long":"")+'">'+FC.esc(it.name)+'</div>'+(it.sub?'<div class="st-sub">'+FC.esc(it.sub)+'</div>':'')+'<div class="st-no">nº '+(slot+1)+'</div></div>';
};
/* Verso da figurinha: o cartão cresce no meio da tela, vira sozinho e mostra os detalhes. Tocar nele vira de novo. */
FC.flipCard=function(themeId,slot){
  var t=FC.theme(themeId);if(!t.backOf)return;
  var it=FC.stickerInfo(themeId,slot),b=t.backOf(slot),tier=FC.tierOf(themeId,slot),hue=(slot*37+20)%360;
  var facts=b.facts.map(function(f){return '<div class="fb-row"><span class="fb-ic" aria-hidden="true">'+f[0]+'</span><div><small>'+FC.esc(f[1])+'</small><span>'+FC.esc(f[2])+'</span></div></div>'}).join("");
  var back='<div class="fc-back" style="--sh:'+hue+'"><div class="fb-head"><b class="fb-name">'+FC.esc(it.name)+'</b>'+(it.sub?'<span class="fb-sub">'+FC.esc(it.sub)+'</span>':'')+
    (tier!=="comum"?'<span class="fb-tier tier-'+tier+'">'+FC.tierName(tier)+'</span>':'')+'</div>'+
    '<div class="fb-facts">'+facts+'</div>'+
    (b.fun?'<div class="fb-fun"><b>⭐ Você sabia?</b><p>'+FC.esc(b.fun)+'</p></div>':'')+
    '<div class="fb-no">nº '+(slot+1)+' de '+FC.ALBUM_SIZE+'</div></div>';
  var html='<div class="flip" role="button" tabindex="0" aria-label="Figurinha '+FC.esc(it.name)+'. Toque para virar."><div class="flip-in">'+
    '<div class="flip-face flip-front">'+FC.stickerHtml(themeId,slot,{big:true})+'</div>'+
    '<div class="flip-face flip-back">'+back+'</div></div></div><p class="muted small-t flip-hint">Toque na figurinha para virar</p>';
  var ov=FC.overlay(html,{cls:"flip-ov"+(tier!=="comum"?" tier-"+tier:"")});
  var card=ov.el.querySelector(".flip");
  ov.el.scrollTop=0;   // o foco no botão Fechar pode ter rolado a tela; o cartão deve aparecer inteiro
  function toggle(){card.classList.toggle("flipped");if(FC.sfx&&FC.sfx.flip)FC.sfx.flip()}
  card.onclick=toggle;
  card.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}};
  setTimeout(function(){if(card.isConnected&&!card.classList.contains("flipped"))toggle()},380);
};
function openFlip(el){
  if(!el||el.classList.contains("locked"))return;
  FC.flipCard(el.getAttribute("data-theme"),Number(el.getAttribute("data-slot")));
}
document.addEventListener("click",function(e){var el=e.target.closest&&e.target.closest(".sticker.flippable");if(el)openFlip(el)});
document.addEventListener("keydown",function(e){
  if(e.key!=="Enter"&&e.key!==" ")return;
  var el=document.activeElement;if(el&&el.classList&&el.classList.contains("flippable")){e.preventDefault();openFlip(el)}
});
FC.lockedHtml=function(slot){
  return '<div class="sticker locked" aria-label="Figurinha '+(slot+1)+' ainda não conquistada"><div class="st-art"><span class="st-q">?</span></div><div class="st-name">&nbsp;</div><div class="st-no">nº '+(slot+1)+'</div></div>';
};
/* Álbum completo. earned = [{slot,end}]. Para o adulto (opts.adult) as figurinhas que faltam aparecem apagadas, mas visíveis. */
FC.albumHtml=function(themeId,earned,opts){
  opts=opts||{};
  var have={};earned.forEach(function(e){have[e.slot]=e});
  var cells="";
  for(var i=0;i<FC.ALBUM_SIZE;i++){
    cells+=have[i]?FC.stickerHtml(themeId,i):(opts.adult?FC.stickerHtml(themeId,i,{dim:true}):FC.lockedHtml(i));
  }
  return '<div class="album">'+cells+'</div>';
};
/* Nomes de figurinha nunca quebram no meio da palavra: se uma palavra não couber na largura do cartão,
   a fonte diminui até caber. Roda sozinho sempre que aparece um cartão novo na tela. */
function fitName(el){
  if(!el.clientWidth)return;                 // ainda escondido: não dá para medir
  el.style.fontSize="";
  var size=parseFloat(getComputedStyle(el).fontSize),guard=0;
  while(el.scrollWidth>el.clientWidth+0.5&&size>7&&guard++<40){size-=0.4;el.style.fontSize=size+"px"}
}
FC.fitNames=function(root){
  var list=(root||document).querySelectorAll(".st-name");
  for(var i=0;i<list.length;i++)fitName(list[i]);
};
var fitPending=false;
function scheduleFit(){if(fitPending)return;fitPending=true;requestAnimationFrame(function(){fitPending=false;FC.fitNames()})}
if(typeof MutationObserver!=="undefined"&&document.body){
  new MutationObserver(scheduleFit).observe(document.body,{childList:true,subtree:true});
  window.addEventListener("resize",scheduleFit);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(scheduleFit);
}
})();
