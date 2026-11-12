/* Ponto de entrada: link com ?aluno=CÓDIGO abre a área do aluno; sem isso, o painel dos adultos.
   No app instalado (sem ?aluno), um aparelho de aluno volta direto para o aluno dele. */
(function(){
"use strict";
if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
(async function(){
  var code=new URLSearchParams(location.search).get("aluno");
  if(code){code=code.trim();ls("fc_last_student",code);FC.studentApp(code);return}
  var last=ls("fc_last_student");
  if(FC.isStandalone()&&last&&ls("fc_tok_"+last)){
    var s=await FC.sb.auth.getSession();
    if(!s.data.session){FC.studentApp(last);return}
  }
  FC.adultApp();
})();
})();
