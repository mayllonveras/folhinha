/* Vídeo de boas-vindas: arquivos leves, aparece antes de tudo na primeira entrada, a criança pode pular e rever. Rodar com: node testes/onboarding.test.js */
const fs=require("fs"),path=require("path");
const root=path.join(__dirname,"..");let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
const rd=f=>fs.readFileSync(path.join(root,f),"utf8");
const st=rd("student.js"),sw=rd("sw.js"),html=rd("index.html"),css=rd("style.css"),core=rd("core.js");

/* arquivos do vídeo */
["boas-vindas.mp4","boas-vindas.jpg","boas-vindas.vtt"].forEach(f=>ok(fs.existsSync(path.join(root,"video",f)),"falta video/"+f));
const mb=fs.statSync(path.join(root,"video/boas-vindas.mp4")).size/1048576;
ok(mb>0.3&&mb<4,"vídeo com "+mb.toFixed(1)+" MB (esperado entre 0,3 e 4: leve para o celular)");
const vtt=rd("video/boas-vindas.vtt");
ok(/^WEBVTT/.test(vtt),"legenda começa com WEBVTT");
ok((vtt.match(/-->/g)||[]).length>=6,"legenda com as falas do vídeo");
["mesa","gaveta","BNCC","Turbo","figurinha"].forEach(w=>ok(vtt.indexOf(w)>=0,"a legenda fala de "+w));

/* aparece antes de qualquer coisa: o início da criança chama firstSteps, e é ele que decide entre vídeo e pacote de boas-vindas */
const lh=/async function loadHome\(\)\{[\s\S]*?\n\}/.exec(st);
ok(lh&&/firstSteps\(\)/.test(lh[0]),"loadHome chama firstSteps");
ok(lh&&!/showWelcome\(\)/.test(lh[0]),"loadHome não abre o pacote de boas-vindas direto (o vídeo vem antes)");
const fsx=/function firstSteps\(\)\{[\s\S]*?\n\}/.exec(st);
ok(fsx&&/obSeen\(\)/.test(fsx[0])&&/showOnboarding\(\{first:true,then:then\}\)/.test(fsx[0]),"só mostra o vídeo a quem ainda não viu");
ok(fsx&&/welcome_pending/.test(fsx[0])&&/showWelcome\(\)/.test(fsx[0]),"o pacote de boas-vindas vem depois do vídeo");
ok(/S\.obShown/.test(st),"uma vez por abertura do app, mesmo se a tela inicial recarregar");

/* assistir ou pular, e rever */
ok(/button:o\.first\?"Pular":"Fechar"/.test(st),"primeira vez tem o botão Pular");
ok(/onClose:function\(\)\{[\s\S]*?obMark\(\)[\s\S]*?if\(o\.then\)o\.then\(\)/.test(st),"fechar (de qualquer jeito) marca como visto e segue para o pacote de boas-vindas");
ok(/Ver de novo/.test(st),"no fim há Ver de novo");
ok(/id="helpBtn"/.test(st)&&/showOnboarding\(\{auto:true\}\)/.test(st),"botão ? do topo abre o vídeo de novo");
ok(/localStorage\.getItem\(obKey\(\)\)/.test(st)&&/catch\(e\)\{return false\}/.test(st),"a marca de visto fica no aparelho e não quebra se o armazenamento falhar");
ok(/textTracks\[0\]\.mode="showing"/.test(st),"sem som no app, a legenda já vem ligada");
ok(/addEventListener\("error"/.test(st)&&/Não deu para carregar o vídeo/.test(st),"se o vídeo não carregar, a criança pode seguir");
ok(/track\("onboarding"/.test(st),"registra se assistiu ou pulou");

/* arquivos do app */
ok(/id="i-help"/.test(html)&&/id="i-play"/.test(html),"ícones de ajuda e play");
ok(/\.onb-video/.test(css)&&/\.onb-play/.test(css),"estilos do vídeo");
ok(/indexOf\("\/video\/"\) === 0\) return/.test(sw),"o service worker deixa o vídeo para o navegador (pedaços do arquivo)");
const v1=/FC\.VERSAO="(folhinha-v\d+)"/.exec(core),v2=/CACHE = "(folhinha-v\d+)"/.exec(sw);
ok(v1&&v2&&v1[1]===v2[1],"versão do app igual ao cache do sw.js");
console.log(falhas?"onboarding: "+falhas+" falha(s)":"onboarding: tudo certo");process.exit(falhas?1:0);
