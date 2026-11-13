/* Tema Dinossauros: 52 espécies reais, catalogadas por período e alimentação, desenhadas em vetor.
   Cada desenho é montado a partir do tipo do corpo (tiranossauro, saurópode, tricerátops...) mais cor e detalhes da espécie. */
(function(){
"use strict";
var FC=window.FC,G=84;   // G = altura do chão no desenho
function P(p){return p[0].toFixed(1)+" "+p[1].toFixed(1)}
function qcurve(a,c,b,n){var o=[];for(var i=0;i<=n;i++){var t=i/n,u=1-t;o.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]])}return o}
function ribbon(pts,ws){
  var L=[],R=[];
  for(var i=0;i<pts.length;i++){
    var a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1,w=ws[i]/2;
    L.push([pts[i][0]-dy/n*w,pts[i][1]+dx/n*w]);R.push([pts[i][0]+dy/n*w,pts[i][1]-dx/n*w]);
  }
  return "M"+L.map(P).join(" L")+" L"+R.reverse().map(P).join(" L")+"Z";
}
function lerpW(a,b,n){var o=[];for(var i=0;i<=n;i++)o.push(a+(b-a)*i/n);return o}

/* Tipos de corpo. bx,by,rx,ry = corpo; tl,td = comprimento e queda da cauda; hd = onde fica a cabeça em relação ao peito;
   hk = tipo de cabeça; hr = tamanho da cabeça; lw = grossura das pernas. */
var ARCH={
  trex:   {bi:1,bx:46,by:50,rx:19,ry:14,tl:30,td:5, hd:[16,-9], hk:"theo", hr:[11,6.5],lw:8,arm:"tiny",teeth:1},
  raptor: {bi:1,bx:48,by:55,rx:14,ry:9, tl:34,td:2, hd:[12,-9], hk:"theo", hr:[7.5,4.2],lw:5,arm:"claw",teeth:1},
  ostrich:{bi:1,bx:46,by:54,rx:15,ry:10,tl:20,td:4, hd:[10,-24],hk:"bird", hr:[5,3.2], lw:4.5,arm:"thin"},
  theriz: {bi:1,bx:44,by:52,rx:19,ry:15,tl:20,td:4, hd:[14,-24],hk:"bird", hr:[5.5,3.4],lw:7,arm:"long"},
  sauro:  {bi:0,bx:42,by:50,rx:24,ry:15,tl:34,td:4, hd:[17,-34],hk:"sauro",hr:[6,3.8],lw:8},
  diplo:  {bi:0,bx:42,by:57,rx:20,ry:10,tl:38,td:-3,hd:[24,-32],hk:"sauro",hr:[5.5,3.2],lw:6},
  prosauro:{bi:1,bx:44,by:54,rx:18,ry:11,tl:26,td:3,hd:[14,-22],hk:"sauro",hr:[6,3.6], lw:6,arm:"thin"},
  stego:  {bi:0,bx:46,by:56,rx:23,ry:14,tl:24,td:4, hd:[17,12], hk:"sauro",hr:[6,3.5], lw:7},
  anky:   {bi:0,bx:46,by:62,rx:25,ry:11,tl:26,td:2, hd:[19,6],  hk:"beak", hr:[7,4.5], lw:6},
  trice:  {bi:0,bx:42,by:58,rx:23,ry:13,tl:22,td:4, hd:[20,3],  hk:"beak", hr:[9,6],   lw:7},
  pachy:  {bi:1,bx:46,by:53,rx:16,ry:11,tl:28,td:3, hd:[13,-12],hk:"dome", hr:[6,4.5], lw:6,arm:"thin"},
  hadro:  {bi:1,bx:44,by:52,rx:20,ry:12,tl:30,td:4, hd:[15,-12],hk:"duck", hr:[7,4.3], lw:7,arm:"thin"},
  iguano: {bi:1,bx:44,by:53,rx:19,ry:12,tl:28,td:4, hd:[14,-14],hk:"duck", hr:[6.5,4], lw:7,arm:"thumb"}
};
/* Espécies: [nome, período, alimentação, tipo de corpo, matiz, escala, detalhes] */
var T="Triássico",J="Jurássico",C="Cretáceo";
var D=[
 ["Eoraptor",T,"onívoro","raptor",30,.8,[]],
 ["Coelofise",T,"carnívoro","raptor",95,.85,[]],
 ["Herrerassauro",T,"carnívoro","raptor",15,.95,[]],
 ["Plateossauro",T,"herbívoro","prosauro",70,1,[]],
 ["Estaurikossauro",T,"carnívoro","raptor",45,.85,[]],
 ["Dilofossauro",J,"carnívoro","raptor",160,1,["crest2"]],
 ["Criolofossauro",J,"carnívoro","trex",190,.9,["crest1"]],
 ["Ceratossauro",J,"carnívoro","trex",5,.95,["hornnose"]],
 ["Alossauro",J,"carnívoro","trex",25,1,[]],
 ["Megalossauro",J,"carnívoro","trex",50,.95,[]],
 ["Compsognato",J,"carnívoro","raptor",120,.6,[]],
 ["Estegossauro",J,"herbívoro","stego",100,1,["plates","tailspikes"]],
 ["Kentrossauro",J,"herbívoro","stego",75,.85,["plates","tailspikes"]],
 ["Braquiossauro",J,"herbívoro","sauro",140,1,[]],
 ["Diplodoco",J,"herbívoro","diplo",200,1,[]],
 ["Apatossauro",J,"herbívoro","sauro",215,.95,[]],
 ["Brontossauro",J,"herbívoro","sauro",260,.95,[]],
 ["Camarassauro",J,"herbívoro","sauro",110,.9,[]],
 ["Mamenchissauro",J,"herbívoro","diplo",330,1,[]],
 ["Escelidossauro",J,"herbívoro","anky",85,.7,["bumps"]],
 ["Tiranossauro rex",C,"carnívoro","trex",18,1,[]],
 ["Albertossauro",C,"carnívoro","trex",35,.9,[]],
 ["Giganotossauro",C,"carnívoro","trex",350,1,[]],
 ["Carcarodontossauro",C,"carnívoro","trex",235,1,[]],
 ["Carnotauro",C,"carnívoro","trex",8,.95,["hornbrow","tinyarm"]],
 ["Espinossauro",C,"carnívoro","trex",170,1,["sail","croc"]],
 ["Baryonyx",C,"carnívoro","trex",150,.9,["croc"]],
 ["Irritador",C,"carnívoro","trex",195,.85,["croc","crest1"]],
 ["Velociraptor",C,"carnívoro","raptor",28,.8,["feathers","sickle"]],
 ["Deinonico",C,"carnívoro","raptor",12,.85,["sickle"]],
 ["Utahraptor",C,"carnívoro","raptor",40,.95,["sickle","feathers"]],
 ["Microraptor",C,"carnívoro","raptor",200,.6,["feathers"]],
 ["Troodonte",C,"onívoro","raptor",270,.75,["sickle"]],
 ["Oviraptor",C,"onívoro","ostrich",330,.85,["crestovi"]],
 ["Galimimo",C,"onívoro","ostrich",60,.95,[]],
 ["Terizinossauro",C,"herbívoro","theriz",90,1,["claws"]],
 ["Argentinossauro",C,"herbívoro","sauro",20,1,[]],
 ["Patagotitã",C,"herbívoro","sauro",310,1,[]],
 ["Maxakalisauro",C,"herbívoro","sauro",140,.95,[]],
 ["Saltassauro",C,"herbívoro","sauro",55,.8,["bumps"]],
 ["Amargassauro",C,"herbívoro","diplo",175,.85,["spines"]],
 ["Tricerátops",C,"herbívoro","trice",25,1,["frill","horns3"]],
 ["Protocerátops",C,"herbívoro","trice",45,.7,["frill"]],
 ["Estiracossauro",C,"herbívoro","trice",280,.85,["frill","frillspikes","hornnose2"]],
 ["Anquilossauro",C,"herbívoro","anky",65,1,["bumps","club"]],
 ["Euoplocéfalo",C,"herbívoro","anky",150,.9,["bumps","club"]],
 ["Paquicefalossauro",C,"herbívoro","pachy",340,.9,[]],
 ["Parassaurolofo",C,"herbívoro","hadro",160,1,["crestlong"]],
 ["Edmontossauro",C,"herbívoro","hadro",35,1,[]],
 ["Maiassaura",C,"herbívoro","hadro",100,.95,[]],
 ["Coritossauro",C,"herbívoro","hadro",205,.95,["crestdome"]],
 ["Iguanodonte",C,"herbívoro","iguano",120,1,[]]
];
var SKY={}; SKY[T]=["#f8d9a8","#e9a56d"]; SKY[J]=["#c4ebcf","#7fc8a4"]; SKY[C]=["#c6e6ff","#8fc2f0"];

function art(i){
  var d=D[i],A=ARCH[d[3]],F=d[6],h=d[4],has=function(k){return F.indexOf(k)>=0};
  var col="hsl("+h+" 50% 48%)",dark="hsl("+h+" 48% 28%)",light="hsl("+h+" 55% 74%)",acc="hsl("+((h+50)%360)+" 78% 58%)",bone="#f4ead2",ink="#2a1f2d";
  var bx=A.bx,by=A.by,rx=A.rx,ry=A.ry,o="",k;
  var sky=SKY[d[1]];
  o+='<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img">'+
    '<defs><linearGradient id="dg'+i+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sky[0]+'"/><stop offset="1" stop-color="'+sky[1]+'"/></linearGradient></defs>'+
    '<rect width="100" height="100" rx="14" fill="url(#dg'+i+')"/><circle cx="'+(18+(i*13)%60)+'" cy="18" r="8" fill="#fff6c8" opacity=".85"/>'+
    '<path d="M0 82 Q25 70 50 80 T100 76 V100 H0Z" fill="hsl('+((h+120)%360)+' 25% 40%)" opacity=".55"/><rect x="0" y="'+(G-2)+'" width="100" height="18" fill="hsl('+((h+120)%360)+' 30% 34%)" opacity=".7"/>';
  o+='<g transform="translate(50 '+G+') scale('+d[5]+') translate(-50 -'+G+')" stroke-linejoin="round" stroke-linecap="round">';
  o+='<ellipse cx="'+bx+'" cy="'+(G+1)+'" rx="'+(rx+18)+'" ry="3.2" fill="#000" opacity=".18"/>';
  // cauda
  var t0=[bx-rx*0.7,by-ry*0.1],t2=[bx-rx-A.tl,by+A.td],t1=[bx-rx-A.tl*0.55,by+A.td*0.15+3];
  var tail=qcurve(t0,t1,t2,10);
  // pernas do lado de trás (mais escuras)
  function leg(x,c,dx){
    if(A.bi){var hip=[x,by+ry*0.55],knee=[x+7,(by+ry*0.55+G)/2],ank=[x-1,G-5],toe=[x+8,G];
      return '<polyline points="'+P(hip)+' '+P(knee)+' '+P(ank)+' '+P(toe)+'" fill="none" stroke="'+c+'" stroke-width="'+A.lw+'"/>';}
    return '<line x1="'+x+'" y1="'+(by+ry*0.3)+'" x2="'+(x+dx)+'" y2="'+(G-1)+'" stroke="'+c+'" stroke-width="'+A.lw+'"/><ellipse cx="'+(x+dx+1.5)+'" cy="'+(G-1)+'" rx="'+(A.lw*0.75)+'" ry="2.4" fill="'+c+'"/>';
  }
  if(A.bi)o+=leg(bx-5,dark);else o+=leg(bx-rx*0.28,dark,0)+leg(bx+rx*0.32,dark,0);
  // cauda (desenhada antes do corpo)
  o+='<path d="'+ribbon(tail,lerpW(ry*1.35,1.6,10))+'" fill="'+col+'" stroke="'+col+'" stroke-width="1"/>';
  if(has("tailspikes")){for(k=6;k<=9;k++){var q=tail[k];o+='<path d="M'+P([q[0]-2,q[1]-2])+' L'+P([q[0]-6,q[1]-11])+' L'+P([q[0]+1.5,q[1]-3])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width=".8"/>'}}
  if(has("club")){var e=tail[10];o+='<circle cx="'+e[0]+'" cy="'+e[1]+'" r="6.5" fill="'+light+'" stroke="'+dark+'" stroke-width="1.2"/>'}
  // placas e vela atrás do corpo
  if(has("plates")){
    for(k=0;k<7;k++){var x=bx-rx*0.72+k*(rx*1.5/6),ye=by-ry*Math.sqrt(Math.max(0,1-Math.pow((x-bx)/rx,2))),hh=5+8*Math.sin(Math.PI*(k+.5)/7);
      o+='<path d="M'+P([x-4.2,ye+1.5])+' L'+P([x-.5,ye-hh])+' L'+P([x+4.2,ye+1.5])+'Z" fill="'+acc+'" stroke="'+dark+'" stroke-width="1"/>'}
  }
  if(has("sail")){
    o+='<path d="M'+P([bx-rx*0.55,by-ry*0.65])+' C'+P([bx-rx*0.45,by-ry-26])+' '+P([bx+rx*0.35,by-ry-28])+' '+P([bx+rx*0.6,by-ry*0.6])+'Z" fill="'+acc+'" stroke="'+dark+'" stroke-width="1.2"/>';
    for(k=0;k<5;k++){var sx=bx-rx*0.4+k*rx*0.25;o+='<line x1="'+sx+'" y1="'+(by-ry*0.7)+'" x2="'+(sx+0.5)+'" y2="'+(by-ry-20+Math.abs(k-2)*3)+'" stroke="'+dark+'" stroke-width=".9" opacity=".6"/>'}
  }
  // corpo
  o+='<ellipse cx="'+bx+'" cy="'+by+'" rx="'+rx+'" ry="'+ry+'" fill="'+col+'" stroke="'+dark+'" stroke-width="1.4"/>';
  o+='<ellipse cx="'+bx+'" cy="'+(by+ry*0.35)+'" rx="'+(rx*0.78)+'" ry="'+(ry*0.5)+'" fill="'+light+'" opacity=".6"/>';
  if(has("bumps"))for(k=0;k<8;k++){var bxx=bx-rx*0.75+k*(rx*1.5/7),by2=by-ry*Math.sqrt(Math.max(0,1-Math.pow((bxx-bx)/rx,2)))+1;o+='<circle cx="'+bxx.toFixed(1)+'" cy="'+by2.toFixed(1)+'" r="2.4" fill="'+acc+'" stroke="'+dark+'" stroke-width=".9"/>'}
  // pescoço e cabeça
  var Fp=[bx+rx*0.8,by-ry*0.35],H=[Fp[0]+A.hd[0],Fp[1]+A.hd[1]],C=[Fp[0]+A.hd[0]*0.15,Fp[1]+A.hd[1]*0.85];
  if(A.hd[1]>8)C=[Fp[0]+A.hd[0]*0.6,Fp[1]+A.hd[1]*0.2];
  var neck=qcurve(Fp,C,H,9);
  o+='<path d="'+ribbon(neck,lerpW(ry*1.05,A.hr[1]*1.2,9))+'" fill="'+col+'" stroke="'+col+'" stroke-width="1"/>';
  if(has("spines"))for(k=1;k<9;k+=1){var nq=neck[k];o+='<path d="M'+P([nq[0]-2,nq[1]-3])+' L'+P([nq[0]-1,nq[1]-10])+' L'+P([nq[0]+2,nq[1]-3])+'Z" fill="'+acc+'" stroke="'+dark+'" stroke-width=".7"/>'}
  // atrás da cabeça: babado e cristas
  var hx=H[0],hy=H[1],hr0=A.hr[0],hr1=A.hr[1];
  if(has("frill")){
    o+='<ellipse cx="'+(hx-hr0*0.9)+'" cy="'+(hy-hr1*0.5)+'" rx="'+(hr0*0.95)+'" ry="'+(hr1*2.1)+'" fill="'+acc+'" stroke="'+dark+'" stroke-width="1.3"/>';
    o+='<circle cx="'+(hx-hr0*1.1)+'" cy="'+(hy-hr1*1.2)+'" r="1.6" fill="'+light+'"/><circle cx="'+(hx-hr0*1.1)+'" cy="'+(hy+hr1*0.3)+'" r="1.6" fill="'+light+'"/>';
    if(has("frillspikes"))for(k=0;k<6;k++){var an=(110+k*30)*Math.PI/180,sx2=hx-hr0*0.9+Math.cos(an)*hr0*0.95,sy2=hy-hr1*0.5-Math.sin(an)*hr1*2.1;o+='<path d="M'+P([sx2,sy2])+' L'+P([sx2+Math.cos(an)*9,sy2-Math.sin(an)*9])+' L'+P([sx2+3,sy2+2])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width=".8"/>'}
  }
  if(has("crestlong"))o+='<path d="'+ribbon(qcurve([hx-1,hy-hr1*0.8],[hx-14,hy-hr1*3.6],[hx-24,hy-hr1*0.4],8),lerpW(4.2,2.6,8))+'" fill="'+acc+'" stroke="'+dark+'" stroke-width="1.1"/>';
  if(has("crestdome"))o+='<path d="M'+P([hx-hr0*0.9,hy-hr1*0.4])+' Q'+P([hx-hr0*0.4,hy-hr1*3.8])+' '+P([hx+hr0*0.5,hy-hr1*0.6])+'Z" fill="'+acc+'" stroke="'+dark+'" stroke-width="1.1"/>';
  if(has("crest2")){for(k=0;k<2;k++)o+='<path d="M'+P([hx-hr0*0.2+k*2.5,hy-hr1*0.8])+' Q'+P([hx+hr0*0.4+k*2.5,hy-hr1*3.4])+' '+P([hx+hr0*1.0+k*2.5,hy-hr1*0.9])+'Z" fill="'+acc+'" stroke="'+dark+'" stroke-width="1"/>'}
  if(has("crest1"))o+='<path d="M'+P([hx-hr0*0.3,hy-hr1*0.8])+' Q'+P([hx+hr0*0.2,hy-hr1*3.2])+' '+P([hx+hr0*0.9,hy-hr1*0.9])+'Z" fill="'+acc+'" stroke="'+dark+'" stroke-width="1"/>';
  if(has("crestovi"))o+='<path d="M'+P([hx-hr0*0.4,hy-hr1*0.8])+' Q'+P([hx+hr0*0.2,hy-hr1*3.6])+' '+P([hx+hr0*1.0,hy-hr1*0.7])+'Z" fill="'+acc+'" stroke="'+dark+'" stroke-width="1"/>';
  // cabeça
  var hk=has("croc")?"croc":A.hk,carn=A.teeth||has("croc");
  if(hk==="theo"){
    o+='<ellipse cx="'+hx+'" cy="'+hy+'" rx="'+hr0+'" ry="'+hr1+'" fill="'+col+'" stroke="'+dark+'" stroke-width="1.3"/><ellipse cx="'+(hx+hr0*0.55)+'" cy="'+(hy+hr1*0.12)+'" rx="'+(hr0*0.68)+'" ry="'+(hr1*0.75)+'" fill="'+col+'" stroke="'+dark+'" stroke-width="1.3"/>';
  }else if(hk==="croc"){
    o+='<ellipse cx="'+(hx+hr0*0.35)+'" cy="'+(hy+hr1*0.1)+'" rx="'+(hr0*1.45)+'" ry="'+(hr1*0.62)+'" fill="'+col+'" stroke="'+dark+'" stroke-width="1.3"/><ellipse cx="'+(hx-hr0*0.3)+'" cy="'+hy+'" rx="'+(hr0*0.6)+'" ry="'+(hr1*0.85)+'" fill="'+col+'" stroke="'+dark+'" stroke-width="1.3"/>';
  }else if(hk==="sauro"){
    o+='<ellipse cx="'+hx+'" cy="'+hy+'" rx="'+hr0+'" ry="'+hr1+'" fill="'+col+'" stroke="'+dark+'" stroke-width="1.3"/><circle cx="'+(hx+hr0*0.55)+'" cy="'+(hy-hr1*0.1)+'" r=".9" fill="'+dark+'"/>';
  }else if(hk==="duck"){
    o+='<ellipse cx="'+hx+'" cy="'+hy+'" rx="'+hr0+'" ry="'+hr1+'" fill="'+col+'" stroke="'+dark+'" stroke-width="1.3"/><ellipse cx="'+(hx+hr0*0.95)+'" cy="'+(hy+hr1*0.4)+'" rx="'+(hr0*0.9)+'" ry="'+(hr1*0.55)+'" fill="'+light+'" stroke="'+dark+'" stroke-width="1.2"/>';
  }else if(hk==="beak"){
    o+='<ellipse cx="'+hx+'" cy="'+hy+'" rx="'+hr0+'" ry="'+hr1+'" fill="'+col+'" stroke="'+dark+'" stroke-width="1.3"/><path d="M'+P([hx+hr0*0.5,hy-hr1*0.5])+' L'+P([hx+hr0*1.55,hy+hr1*0.35])+' L'+P([hx+hr0*0.4,hy+hr1*0.85])+'Z" fill="#e8d28a" stroke="'+dark+'" stroke-width="1.1"/>';
  }else if(hk==="dome"){
    o+='<ellipse cx="'+hx+'" cy="'+hy+'" rx="'+hr0+'" ry="'+hr1+'" fill="'+col+'" stroke="'+dark+'" stroke-width="1.3"/><circle cx="'+(hx-hr0*0.1)+'" cy="'+(hy-hr1*0.85)+'" r="'+(hr1*1.05)+'" fill="'+light+'" stroke="'+dark+'" stroke-width="1.3"/>';
    for(k=0;k<3;k++)o+='<circle cx="'+(hx-hr0*0.9+k*2.6)+'" cy="'+(hy+hr1*0.2)+'" r="1.3" fill="'+bone+'" stroke="'+dark+'" stroke-width=".6"/>';
  }else{ // bird
    o+='<ellipse cx="'+hx+'" cy="'+hy+'" rx="'+hr0+'" ry="'+hr1+'" fill="'+col+'" stroke="'+dark+'" stroke-width="1.3"/><path d="M'+P([hx+hr0*0.6,hy-hr1*0.5])+' L'+P([hx+hr0*2.2,hy+hr1*0.1])+' L'+P([hx+hr0*0.5,hy+hr1*0.7])+'Z" fill="#e8c46a" stroke="'+dark+'" stroke-width="1"/>';
  }
  // olho, boca e dentes
  o+='<circle cx="'+(hx+hr0*0.05)+'" cy="'+(hy-hr1*0.3)+'" r="'+Math.max(1.8,hr1*0.38)+'" fill="#fff" stroke="'+ink+'" stroke-width=".7"/><circle cx="'+(hx+hr0*0.12)+'" cy="'+(hy-hr1*0.28)+'" r="'+Math.max(.9,hr1*0.2)+'" fill="'+ink+'"/>';
  if(carn){
    var mx=hx+hr0*(hk==="croc"?1.7:1.15),my=hy+hr1*0.45;
    o+='<path d="M'+P([hx-hr0*0.1,my])+' L'+P([mx,my-0.5])+'" stroke="'+ink+'" stroke-width="1.1" fill="none"/>';
    for(k=0;k<5;k++){var tx=hx+hr0*0.25+k*(mx-hx-hr0*0.3)/5;o+='<path d="M'+P([tx,my-0.3])+' L'+P([tx+1.3,my+2.6])+' L'+P([tx+2.6,my-0.3])+'Z" fill="#fff" stroke="'+ink+'" stroke-width=".4"/>'}
  }
  // chifres
  if(has("hornnose"))o+='<path d="M'+P([hx+hr0*0.9,hy-hr1*0.3])+' L'+P([hx+hr0*1.0,hy-hr1*2.1])+' L'+P([hx+hr0*1.4,hy-hr1*0.2])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width="1"/>';
  if(has("hornnose2"))o+='<path d="M'+P([hx+hr0*1.0,hy-hr1*0.4])+' L'+P([hx+hr0*1.2,hy-hr1*2.0])+' L'+P([hx+hr0*1.5,hy-hr1*0.2])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width="1"/>';
  if(has("hornbrow")){for(k=0;k<2;k++)o+='<path d="M'+P([hx-hr0*0.1+k*3,hy-hr1*0.7])+' L'+P([hx+hr0*0.1+k*3+2,hy-hr1*2.2])+' L'+P([hx+hr0*0.5+k*3,hy-hr1*0.6])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width="1"/>'}
  if(has("horns3")){
    o+='<path d="M'+P([hx+hr0*0.1,hy-hr1*0.8])+' L'+P([hx+hr0*1.5,hy-hr1*3.3])+' L'+P([hx+hr0*0.7,hy-hr1*0.5])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width="1.1"/>';
    o+='<path d="M'+P([hx-hr0*0.3,hy-hr1*0.8])+' L'+P([hx+hr0*0.8,hy-hr1*3.2])+' L'+P([hx+hr0*0.2,hy-hr1*0.5])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width="1.1" opacity=".9"/>';
    o+='<path d="M'+P([hx+hr0*1.2,hy-hr1*0.1])+' L'+P([hx+hr0*1.5,hy-hr1*1.6])+' L'+P([hx+hr0*1.7,hy+hr1*0.2])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width="1"/>';
  }
  // pernas da frente / braços
  if(A.bi)o+=leg(bx+3,col);else o+=leg(bx-rx*0.55,col,0)+leg(bx+rx*0.6,col,0);
  var ax=bx+rx*0.7,ay=by+ry*0.1;
  if(A.arm==="tiny"||has("tinyarm"))o+='<polyline points="'+P([ax,ay])+' '+P([ax+5,ay+5])+' '+P([ax+8,ay+3.5])+'" fill="none" stroke="'+col+'" stroke-width="3"/><circle cx="'+(ax+8.5)+'" cy="'+(ay+3.5)+'" r="1.2" fill="'+bone+'"/>';
  else if(A.arm==="claw")o+='<polyline points="'+P([ax,ay])+' '+P([ax+6,ay+5])+' '+P([ax+11,ay+3])+'" fill="none" stroke="'+col+'" stroke-width="3"/><path d="M'+P([ax+10,ay+1.5])+' L'+P([ax+15,ay+3])+' L'+P([ax+10,ay+5])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width=".6"/>';
  else if(A.arm==="thin")o+='<polyline points="'+P([ax,ay])+' '+P([ax+5,ay+7])+' '+P([ax+9,ay+9])+'" fill="none" stroke="'+col+'" stroke-width="3"/>';
  else if(A.arm==="long")o+='<polyline points="'+P([ax,ay])+' '+P([ax+8,ay+8])+' '+P([ax+15,ay+10])+'" fill="none" stroke="'+col+'" stroke-width="4.4"/>';
  else if(A.arm==="thumb")o+='<polyline points="'+P([ax,ay])+' '+P([ax+5,ay+7])+' '+P([ax+9,ay+9])+'" fill="none" stroke="'+col+'" stroke-width="3.4"/><path d="M'+P([ax+7,ay+7])+' L'+P([ax+11,ay+3])+' L'+P([ax+9,ay+9.5])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width=".7"/>';
  if(has("claws"))for(k=0;k<3;k++)o+='<path d="M'+P([ax+14,ay+9+k*1.2])+' L'+P([ax+24,ay+12+k*2.6])+' L'+P([ax+14,ay+11.2+k*1.2])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width=".7"/>';
  if(has("sickle")){var fx=bx+3+8,fy=G;o+='<path d="M'+P([fx-1,fy-3])+' Q'+P([fx+7,fy-10])+' '+P([fx+8,fy-15])+' L'+P([fx+5,fy-12])+' Q'+P([fx+2,fy-6])+' '+P([fx-3,fy-1])+'Z" fill="'+bone+'" stroke="'+dark+'" stroke-width=".7"/>'}
  if(has("feathers")){for(k=0;k<7;k++){var fq=tail[2+k];o+='<line x1="'+fq[0]+'" y1="'+(fq[1]-1)+'" x2="'+(fq[0]-3)+'" y2="'+(fq[1]-8)+'" stroke="'+acc+'" stroke-width="1.6"/>'}
    for(k=0;k<4;k++)o+='<line x1="'+(ax+k*2)+'" y1="'+(ay+3)+'" x2="'+(ax+k*2-4)+'" y2="'+(ay+11)+'" stroke="'+acc+'" stroke-width="1.5"/>'}
  return o+'</g></svg>';
}
FC.THEMES.push({id:"dinossauros",name:"Dinossauros",desc:"52 dinossauros de verdade, catalogados por período e alimentação.",kind:"dino",
  nameOf:function(i){return D[i][0]},subOf:function(i){return D[i][1]+" · "+D[i][2]},art:art});
FC.DINOS=D;
})();
