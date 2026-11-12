/* Ponto de entrada: link com ?aluno=CÓDIGO abre a área do aluno; sem isso, o painel dos adultos. */
(function(){
"use strict";
var code=new URLSearchParams(location.search).get("aluno");
if(code){FC.studentApp(code.trim())}else{FC.adultApp()}
})();
