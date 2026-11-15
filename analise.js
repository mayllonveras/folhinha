/* Análise das folhas feitas: onde a criança está com dificuldade. Só leitura das folhas que já estão guardadas (problems e answers),
   então funciona com as folhas antigas. Usada na aba "Dificuldades" dos pais. */
(function(){
"use strict";
var FC=window.FC;
/* Limites do semáforo (acerto de primeira): vermelho a partir de 40% de erro, amarelo a partir de 20%; só vale com pelo menos 5 contas.
   "Devagar": tempo médio por conta acima de 1,5 vez o esperado do nível. */
FC.ANALISE={minContas:5,vermelho:40,amarelo:20,lentoX:1.5};
function chave(p){return (p.pre||"")+"|"+(p.post||"")+"|"+(p.extra?JSON.stringify(p.extra):"")}
function ehNumero(v){return /^[0-9]{1,4}$/.test(String(v))}
/* sheets: [{level_idx, study_day, problems, answers}]. o.target(level_idx) = segundos esperados para 10 contas; o.hab(level_idx) = códigos da BNCC. */
FC.analisar=function(sheets,o){
  o=o||{};var C=FC.ANALISE,target=o.target||function(){return 90},habOf=o.hab||function(){return[]};
  var lv={};
  sheets.forEach(function(sh){
    var L=lv[sh.level_idx]||(lv[sh.level_idx]={level:sh.level_idx,folhas:0,n:0,erros:0,msSoma:0,msN:0,porUm:0,semResposta:0,numericos:0,contas:{}});
    L.folhas++;
    (sh.problems||[]).forEach(function(p,i){
      var a=(sh.answers||[])[i];if(!p||!a)return;
      var bom=a.ok===true,k=chave(p),c=L.contas[k]||(L.contas[k]={p:p,vezes:0,erros:0,resp:[]});
      L.n++;c.vezes++;
      if(a.ms>0){L.msSoma+=a.ms;L.msN++}
      if(bom)return;
      L.erros++;c.erros++;
      var v=a.v;
      if(v===""||v==null){L.semResposta++;return}
      c.resp.push(String(v));
      if(!(p.extra&&p.extra.opts)&&ehNumero(v)&&ehNumero(p.a)){L.numericos++;if(Math.abs(Number(v)-Number(p.a))===1)L.porUm++}
    });
  });
  var rows=Object.keys(lv).map(function(k){
    var L=lv[k],esperado=target(L.level)/10*1000,media=L.msN?L.msSoma/L.msN:0;
    var taxa=L.n?L.erros*100/L.n:0,pouco=L.n<C.minContas;
    var sem=pouco?"poucos":taxa>=C.vermelho?"vermelho":taxa>=C.amarelo?"amarelo":"verde";
    return{level:L.level,folhas:L.folhas,n:L.n,erros:L.erros,taxa:taxa,semaforo:sem,
      msMedio:media,esperadoMs:esperado,devagar:!pouco&&media>0&&media>esperado*C.lentoX,
      porUm:L.porUm,semResposta:L.semResposta,numericos:L.numericos,hab:habOf(L.level),
      contas:Object.keys(L.contas).map(function(c){return L.contas[c]}).filter(function(c){return c.erros>0}).sort(function(a,b){return b.erros-a.erros||b.vezes-a.vezes})};
  });
  var ordem={vermelho:0,amarelo:1,verde:2,poucos:3};
  rows.sort(function(a,b){return ordem[a.semaforo]-ordem[b.semaforo]||b.taxa-a.taxa||a.level-b.level});
  return rows;
};
/* Por habilidade da BNCC: cada conta conta em todas as habilidades do nível dela (aproximação: um nível pode treinar mais de uma). */
FC.analisarHab=function(rows){
  var h={};
  rows.forEach(function(r){r.hab.forEach(function(c){
    var x=h[c]||(h[c]={cod:c,n:0,erros:0,niveis:[]});
    x.n+=r.n;x.erros+=r.erros;x.niveis.push(r.level);
  })});
  var C=FC.ANALISE;
  return Object.keys(h).map(function(c){var x=h[c];x.taxa=x.n?x.erros*100/x.n:0;x.semaforo=x.n<C.minContas?"poucos":x.taxa>=C.vermelho?"vermelho":x.taxa>=C.amarelo?"amarelo":"verde";return x})
    .sort(function(a,b){var o={vermelho:0,amarelo:1,verde:2,poucos:3};return o[a.semaforo]-o[b.semaforo]||b.taxa-a.taxa});
};
})();
