/* Catálogo de figurinhas: temas com 52 figurinhas cada (uma por semana do ano).
   Por enquanto são quatro: Bandeiras (aqui), Dinossauros (dinos.js), Gatinhos e cachorrinhos (pets.js) e Animais ameaçados (ameacados.js). Os outros temas voltam quando tiverem imagens boas, raridade e verso. */
(function(){
"use strict";
var FC=window.FC;
FC.ALBUM_SIZE=52;

var BANDEIRAS=[["br","Brasil","América do Sul"],["ar","Argentina","América do Sul"],["uy","Uruguai","América do Sul"],["py","Paraguai","América do Sul"],["cl","Chile","América do Sul"],["bo","Bolívia","América do Sul"],["pe","Peru","América do Sul"],["co","Colômbia","América do Sul"],["ve","Venezuela","América do Sul"],["ec","Equador","América do Sul"],["mx","México","América do Norte"],["us","Estados Unidos","América do Norte"],["ca","Canadá","América do Norte"],["cu","Cuba","América Central"],["jm","Jamaica","América Central"],["pt","Portugal","Europa"],["es","Espanha","Europa"],["fr","França","Europa"],["it","Itália","Europa"],["de","Alemanha","Europa"],["gb","Reino Unido","Europa"],["ie","Irlanda","Europa"],["nl","Países Baixos","Europa"],["be","Bélgica","Europa"],["ch","Suíça","Europa"],["se","Suécia","Europa"],["no","Noruega","Europa"],["dk","Dinamarca","Europa"],["fi","Finlândia","Europa"],["gr","Grécia","Europa"],["ru","Rússia","Europa e Ásia"],["pl","Polônia","Europa"],["ua","Ucrânia","Europa"],["tr","Turquia","Ásia e Europa"],["jp","Japão","Ásia"],["cn","China","Ásia"],["kr","Coreia do Sul","Ásia"],["in","Índia","Ásia"],["id","Indonésia","Ásia"],["th","Tailândia","Ásia"],["vn","Vietnã","Ásia"],["il","Israel","Ásia"],["sa","Arábia Saudita","Ásia"],["eg","Egito","África"],["za","África do Sul","África"],["ng","Nigéria","África"],["ma","Marrocos","África"],["ke","Quênia","África"],["ao","Angola","África"],["mz","Moçambique","África"],["au","Austrália","Oceania"],["nz","Nova Zelândia","Oceania"]];

FC.THEMES=[
  {id:"bandeiras",name:"Bandeiras do mundo",desc:"As bandeiras de 52 países bem conhecidos, com o continente de cada um.",kind:"flag",items:BANDEIRAS,fields:["Bandeira","Nome do país","Continente"]}
];
/* Categoria de cada álbum (para filtrar quando houver muitos) e dados que a tela dos pais mostra em "Detalhes".
   Álbum novo: acrescente a categoria aqui e registre o id na tabela albums do banco. */
FC.CATS={dinossauros:"Animais",pets:"Animais",ameacados:"Animais",bandeiras:"Geografia",espaco:"Ciência"};
FC.catOf=function(id){return FC.CATS[id]||"Outros"};
/* Amostra FIXA de 4 a 6 cartas comuns (espalhadas pelo álbum): serve para os pais entenderem o álbum sem ver as raras nem o álbum todo. */
FC.sampleSlots=function(id){
  var c=[],i;for(i=0;i<FC.ALBUM_SIZE;i++)if(FC.tierOf(id,i)==="comum")c.push(i);
  var n=Math.min(6,c.length),out=[];for(i=0;i<n;i++)out.push(c[Math.floor(i*c.length/n)]);
  return out;
};
/* O que aparece em cada carta (frente e verso), sem revelar nenhuma figurinha. */
FC.cardFields=function(id){
  var t=FC.theme(id);if(t.fields)return t.fields;
  var out=["Nome"];if(t.backOf){t.backOf(0).facts.forEach(function(f){out.push(f[1])});if(t.backOf(0).fun)out.push("Você sabia?")}
  return out;
};
/* Imagem de capa de um tema (para escolher o álbum). O tema pode indicar qual figurinha usar em "cover". */
FC.themeCover=function(id){
  var t=FC.theme(id);return FC.stickerInfo(id,t.cover||0).art;
};
/* Capa e pacote de cada álbum (imagens em stickers/capas e stickers/pacotes, uma por tema). Sem a imagem, usa o desenho genérico. */
FC.themeCapa=function(id){
  var t=FC.theme(id);
  return '<img class="capa" src="stickers/capas/'+id+'.webp" alt="Capa do álbum '+FC.esc(t.name)+'" loading="lazy">';
};
FC.themePack=function(id){
  var t=FC.theme(id);
  return '<img class="pack-img" src="stickers/pacotes/'+id+'.webp" alt="Pacotinho do álbum '+FC.esc(t.name)+'" onerror="this.outerHTML=FC.packSvg()">';
};
FC.tierOf=function(themeId,slot){var t=FC.theme(themeId);return (t.rarity&&t.rarity[slot])||"comum"};
FC.tierName=function(tier){return tier==="ultra"?"Ultrarrara":tier==="rara"?"Rara":"Comum"};
/* Quais figurinhas são raras, para o painel dos adultos. */
FC.rarityLegend=function(themeId){
  var t=FC.theme(themeId);if(!t.rarity)return "";
  var u=[],r=[];Object.keys(t.rarity).forEach(function(k){var nm=FC.stickerInfo(themeId,Number(k)).name;(t.rarity[k]==="ultra"?u:r).push(nm)});
  return '<p class="muted small-t rarity-legend"><b>Ultrarraras:</b> '+u.map(FC.esc).join(", ")+'. <b>Raras:</b> '+r.map(FC.esc).join(", ")+'. As outras '+(FC.ALBUM_SIZE-u.length-r.length)+' são comuns. As raras e as ultrarraras são difíceis de sair: saem bem menos que as comuns, e a ultrarrara é a mais difícil de todas.</p>';
};
FC.theme=function(id){for(var i=0;i<FC.THEMES.length;i++)if(FC.THEMES[i].id===id)return FC.THEMES[i];return FC.THEMES[0]};
FC.stickerInfo=function(themeId,slot){
  var t=FC.theme(themeId);
  if(t.kind==="emoji"){var it=t.items[slot];return{name:it[1],art:'<span class="emo" aria-hidden="true">'+it[0]+'</span>'}}
  if(t.kind==="flag"){var c=t.items[slot];return{name:c[1],sub:c[2],art:'<img class="flag" src="flags/'+c[0]+'.svg" alt="Bandeira: '+FC.esc(c[1])+'" loading="lazy">'}}
  return{name:t.nameOf(slot),sub:t.subOf?t.subOf(slot):"",art:t.art(slot)};
};
/* Cenário do fundo da carta: muda com o tipo da figurinha (período do dinossauro, bioma do animal, tipo de astro, continente...).
   Os desenhos estão no style.css (classes sc-NOME). Álbum novo: acrescente o ramo dele aqui e as classes lá. */
FC.sceneOf=function(themeId,slot){
  var t=FC.theme(themeId),s;
  if(themeId==="dinossauros"){s=(FC.DINOS&&FC.DINOS[slot]&&FC.DINOS[slot][1])||"";return s==="Triássico"?"triassico":s==="Jurássico"?"jurassico":"cretaceo"}
  if(themeId==="pets")return slot<26?"gato":"cachorro";
  if(themeId==="ameacados")return slot<12?"floresta":slot<24?"savana":slot<36?"oceano":slot<48?"lagoa":"gelo";
  if(themeId==="espaco"){s=t.subOf?t.subOf(slot):"";return /^Estrela/.test(s)?"estrela":/^(Planeta|Lua|Asteroide|Cometa)/.test(s)?"sistema":"nebulosa"}
  if(themeId==="bandeiras"){s=(t.items&&t.items[slot]&&t.items[slot][2])||"";
    return /Sul/.test(s)?"am-sul":/Norte|Central/.test(s)?"am-norte":/^Europa/.test(s)?"europa":/África/.test(s)?"africa":/Oceania/.test(s)?"oceania":"asia"}
  return "";
};
/* Cartão de uma figurinha. opts.dim deixa a figurinha apagada (visão do adulto para as que ainda não foram ganhas). */
FC.stickerHtml=function(themeId,slot,opts){
  var it=FC.stickerInfo(themeId,slot),hue=(slot*37+20)%360,tier=FC.tierOf(themeId,slot);
  var flip=!(opts&&(opts.big||opts.noflip))&&FC.theme(themeId).backOf;   // figurinha com verso: ao tocar, vira
  var sc=FC.sceneOf(themeId,slot);
  return '<div class="sticker'+(sc?" sc sc-"+sc:"")+(opts&&opts.dim?" dim":"")+(opts&&opts.big?" big":"")+(tier!=="comum"?" tier-"+tier:"")+(flip?" flippable":"")+'" style="--sh:'+hue+';--ang:'+((slot*47)%360)+'deg" title="'+FC.esc(it.name)+'"'+
    (flip?' data-theme="'+themeId+'" data-slot="'+slot+'" role="button" tabindex="0" aria-label="'+FC.esc(it.name)+': tocar para ver o verso"':'')+'>'+
    '<div class="st-art">'+it.art+'</div>'+(tier!=="comum"?'<div class="st-tier">'+FC.tierName(tier)+'</div>':'')+'<div class="st-plate"><div class="st-name'+(it.name.length>10?" long":"")+'">'+FC.esc(it.name)+'</div>'+(it.sub?'<div class="st-sub">'+FC.esc(it.sub)+'</div>':'')+'<div class="st-no">nº '+(slot+1)+'</div></div>'+(opts&&opts.from?'<button type="button" class="st-trade" data-from="'+FC.esc(opts.from)+'" aria-label="Veio de uma troca com '+FC.esc(opts.from)+'. Toque para ver quem deu.">'+FC.icon("swap")+'</button>':'')+(opts&&opts.badge?'<span class="st-x" aria-label="'+opts.badge+(opts.badge>1?' repetidas':' repetida')+'">+'+opts.badge+'</span>':'')+'</div>';
};
/* Verso da figurinha: o cartão cresce no meio da tela, vira sozinho e mostra os detalhes. Tocar nele vira de novo. */
FC.flipCard=function(themeId,slot){
  var t=FC.theme(themeId);if(!t.backOf)return;
  var it=FC.stickerInfo(themeId,slot),b=t.backOf(slot),tier=FC.tierOf(themeId,slot),hue=(slot*37+20)%360;
  var facts=b.facts.map(function(f){return '<div class="fb-row"><span class="fb-ic" aria-hidden="true">'+f[0]+'</span><div><small>'+FC.esc(f[1])+'</small><span>'+FC.esc(f[2])+'</span></div></div>'}).join("");
  var sc=FC.sceneOf(themeId,slot);
  var back='<div class="fc-back'+(sc?" sc sc-"+sc:"")+'" style="--sh:'+hue+';--ang:'+((slot*47)%360)+'deg"><div class="fb-head"><b class="fb-name">'+FC.esc(it.name)+'</b>'+(it.sub?'<span class="fb-sub">'+FC.esc(it.sub)+'</span>':'')+
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
document.addEventListener("click",function(e){
  var tb=e.target.closest&&e.target.closest(".st-trade");
  if(!tb)return;
  e.stopPropagation();e.preventDefault();
  FC.overlay('<div class="center">'+FC.icon("swap")+'<h2>Figurinha de troca</h2><p>Esta figurinha veio de uma troca. Quem deu foi <b>'+FC.esc(tb.getAttribute("data-from"))+'</b>.</p></div>',{button:"Fechar"});
},true);
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
    if(have[i])cells+=FC.stickerHtml(themeId,i,have[i].from?{from:have[i].from}:null);
    else if(!opts.only)cells+=opts.adult?FC.stickerHtml(themeId,i,{dim:true}):FC.lockedHtml(i);   // opts.only: tela dos pais mostra só as já conquistadas
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
