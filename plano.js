/* Montagem da folha com rodízio de tipos e rampa de dificuldade (4º ano em diante: os níveis que têm "espec").
   - Cada nível com espec lista seus tipos de conta e sabe dar uma nota de dificuldade (espec.nota) a uma conta.
   - A nota vira um percentil (0 a 1) dentro do próprio nível: 0 = a mais fácil que o nível sorteia, 1 = a mais difícil.
   - As folhas do dia (opts.sheetNo = 0 a n-1, com n = opts.folhas, 5 se não vier): o tipo j é reservado para a folha j mod n (com menos de 5 folhas, os tipos se repartem em blocos do mais fácil ao mais difícil), então as n folhas cobrem todos os tipos; as outras contas são
     sorteadas dentro da faixa de dificuldade da folha, que sobe de 0-40% na primeira até 60-100% na última (com 5 folhas: 0-40, 15-55, 30-70, 45-85, 60-100; com 3: 0-40, 30-70, 60-100) e as contas do nível vão do mais fácil ao mais difícil.
   - As contas de revisão e de reforço ficam em posições sorteadas no meio das contas do nível.
   Níveis sem espec (1º ao 3º ano) seguem o sorteio livre de FC.makeItems. */
(function(){
"use strict";
var FC=window.FC,base=FC.makeItems;
var CICLO=5,AMOSTRA=1200;
/* Faixa de dificuldade da folha k de n: a primeira vai de 0 a 40% e a última de 60 a 100%, as do meio em degraus iguais. Com n=5 dá as faixas de sempre. */
function banda(k,n){if(n<2)return[0,1];var t=k/(n-1);return[Math.round(.6*t*100)/100,Math.round((.4+.6*t)*100)/100]}
function bandas(n){var o=[];for(var k=0;k<n;k++)o.push(banda(k,n));return o}
var BANDAS=bandas(CICLO);
var cache={};
function lims(p){return p.limits||(p.grp?[[p.grp,p.cap]]:[])}
/* Distribuição das notas do nível (calculada uma vez, com sorteios do próprio gerador). */
function dist(levelIdx){
  var c=cache[levelIdx];if(c)return c;
  var L=FC.LEVELS[levelIdx],raws=[],i;
  for(i=0;i<AMOSTRA;i++)raws.push(L.espec.nota(L.gen()));
  raws.sort(function(a,b){return a-b});
  return cache[levelIdx]={raws:raws};
}
function limite(raws,v,estrito){var lo=0,hi=raws.length;while(lo<hi){var m=(lo+hi)>>1;(estrito?raws[m]<v:raws[m]<=v)?lo=m+1:hi=m}return lo}
function percentil(levelIdx,it){
  var r=dist(levelIdx).raws,v=FC.LEVELS[levelIdx].espec.nota(it);
  return (limite(r,v,true)+limite(r,v,false))/2/r.length;
}
FC.plano={BANDAS:BANDAS,CICLO:CICLO,banda:banda,bandas:bandas,percentil:percentil,dist:dist};

FC.makeItems=function(levelIdx,keep,opts){
  opts=opts||{};
  var L=FC.LEVELS[levelIdx];
  if(!L||!L.espec||opts.teto||typeof opts.sheetNo!=="number")return base(levelIdx,keep,opts);
  var E=L.espec,T=E.tipos.length,N=Math.max(1,Math.min(10,Math.round(opts.folhas)||CICLO)),k=((opts.sheetNo%N)+N)%N,fx=banda(k,N),itemKey=FC.itemKey;
  var revN=levelIdx>0&&!opts.semRevisao?2:0,extras=(keep||[]).slice(0,10-revN-2).map(FC.plainItem),seen={},cnt={},g=0;
  extras.forEach(function(p){seen[itemKey(p)]=1});
  var rev=[];
  while(rev.length<revN&&g++<revN*40){
    var lv=FC.reviewLevel(levelIdx,false),q=FC.LEVELS[lv].gen(),kq=itemKey(q);
    if(seen[kq])continue;seen[kq]=1;q._rev=true;rev.push(q);
  }
  var vagas=10-extras.length-rev.length,nivel=[];
  function conta(p){lims(p).forEach(function(l){cnt[l[0]]=(cnt[l[0]]||0)+1})}
  /* Os limites por grupo de tipo ("n15:6") seguram o sorteio livre; com a rampa a faixa de dificuldade já varia a folha, então eles se abrem até 5 por folha (nome, número repetido etc. continuam como estão). */
  function cabe(p){return !lims(p).some(function(l){return (cnt[l[0]]||0)>=(/^n\d+:/.test(l[0])?Math.max(l[1],5):l[1])})}
  function aceita(p,pc){p._p=pc;seen[itemKey(p)]=1;conta(p);nivel.push(p)}
  extras.concat(rev).forEach(conta);
  /* 1) um tipo reservado a esta folha: o rodízio (tipo j na folha j mod 5), escolhendo a conta mais perto do alvo da faixa */
  if(T>1){
    for(var j=0;j<T&&nivel.length<vagas;j++){
      /* com menos de 5 folhas e mais tipos que folhas, os tipos (do mais fácil ao mais difícil) se repartem em blocos: os mais fáceis nas primeiras folhas, os mais difíceis nas últimas; senão a folha 1 receberia o tipo mais difícil e a rampa se embolaria */
      if((N<CICLO&&T>N?Math.floor(j*N/T):j%N)!==k)continue;
      var tj=E.ordem?E.ordem[j]:j;
      var alvo=fx[0]+Math.random()*(fx[1]-fx[0]),melhor=null,dm=9,tent=0,achou=0;
      while(tent++<600&&achou<12){
        var p=L.gen();if(E.tipo(p)!==tj||seen[itemKey(p)]||!cabe(p))continue;
        achou++;var pc=percentil(levelIdx,p),d=Math.abs(pc-alvo);if(d<dm){dm=d;melhor={p:p,pc:pc}}
      }
      if(melhor)aceita(melhor.p,melhor.pc);
    }
  }
  /* 2) o resto, sorteado dentro da faixa de dificuldade (a faixa se abre um pouco se o nível não tiver contas nela) */
  var tent2=0,folga=0;
  while(nivel.length<vagas&&tent2++<1500){
    if(tent2%250===0)folga+=.1;
    var p2=L.gen(),pc2=percentil(levelIdx,p2);
    if(seen[itemKey(p2)]||!cabe(p2))continue;
    if(pc2<fx[0]-folga||pc2>fx[1]+folga)continue;
    aceita(p2,pc2);
  }
  tent2=0;
  while(nivel.length<vagas&&tent2++<600){var p3=L.gen();if(seen[itemKey(p3)])continue;aceita(p3,percentil(levelIdx,p3))}
  while(nivel.length<vagas){var p4=L.gen();p4._p=percentil(levelIdx,p4);nivel.push(p4)}
  /* 3) do mais fácil ao mais difícil; revisão e reforço entram em posições sorteadas */
  nivel.sort(function(a,b){return a._p-b._p});
  var fora=extras.concat(rev),out=nivel.slice();
  FC.shuffle(fora).forEach(function(p){out.splice(Math.floor(Math.random()*(out.length+1)),0,p)});
  out.ordenada=true;
  return out;
};
})();
