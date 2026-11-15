/* Conta em branco na entrega da folha: não é erro, não gasta tentativa, é destacada e a barra de bolinhas mostra qual falta. Rodar com: node testes/folha-em-branco.test.js */
const fs=require("fs"),path=require("path");
const root=path.join(__dirname,"..");let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
const st=fs.readFileSync(path.join(root,"student.js"),"utf8"),css=fs.readFileSync(path.join(root,"style.css"),"utf8");
const sub=st.slice(st.indexOf("function submit(){"),st.indexOf("async function finish()"));
const bl=sub.slice(0,sub.indexOf("if(cur.round===0){"));
ok(/var blanks=cur\.items\.filter\(rowBlank\)/.test(bl)&&sub.indexOf("var blanks")<sub.indexOf("it.tries++"),"submit confere as contas em branco antes de contar qualquer tentativa");
ok(bl.indexOf("return;")>0&&bl.indexOf("blanks.length")>0&&bl.indexOf("cur.round++")<0&&bl.indexOf("stopDwell")<0&&bl.indexOf("cur.secs=")<0,"com conta em branco a entrega volta sem contar tentativa, sem parar o relógio e sem fechar a rodada");
ok(/Falta responder/.test(sub)&&/Falta corrigir/.test(sub)&&/Faltam as contas/.test(sub)&&/Falta a conta/.test(sub),"a mensagem diz qual conta falta (uma ou várias)");
ok(/goItem\(blanks\[0\]\.i\)/.test(sub),"rola e leva o foco até a primeira conta em branco");
ok(/folha_conta_em_branco/.test(sub),"o aviso fica registrado nos dados de uso");
ok(/id="mapa"/.test(st)&&/class="mapa-b"/.test(st)&&/function updateMapa\(\)/.test(st)&&/function goItem\(/.test(st),"barra de bolinhas com toque para ir à conta");
ok(/clearMiss\(it\.i\);updateMapa\(\)/.test(st),"a bolinha e o destaque se atualizam ao responder");
ok(/updateMapa\(\);saveDraft\(\);\n  if\(wrong===0\)/.test(st),"a barra se atualiza depois de conferir (vermelha para conta errada)");
ok(/\.mapa\{position:sticky;top:0/.test(css)&&/\.row\.miss\{/.test(css)&&/\.mapa-b\.miss i/.test(css)&&/\.mapa-b\.on i/.test(css),"barra fixa no topo e cores: verde, amarela e vermelha");
ok(/aria-label","Conta "/.test(st),"cada bolinha diz o estado da conta para leitor de tela");
console.log(falhas?"\n"+falhas+" falha(s)":"folha-em-branco: tudo certo");process.exit(falhas?1:0);
