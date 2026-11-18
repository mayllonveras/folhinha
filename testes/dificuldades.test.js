/* Análise de dificuldades (analise.js) e habilidades da BNCC (habilidades.js). Rodar com: node testes/dificuldades.test.js */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
global.window=global;global.FC={};
["habilidades.js","analise.js"].forEach(f=>vm.runInThisContext(fs.readFileSync(path.join(root,f),"utf8"),{filename:f}));
const FC=global.FC;let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
const plano=(a,v,ok,ms)=>[{pre:String(a),post:"",a:a},{v:String(v),ok:ok,tries:ok?1:2,ms:ms||5000}];
function folha(level,spec){const problems=[],answers=[];spec.forEach(s=>{const x=plano(...s);problems.push(x[0]);answers.push(x[1])});return{level_idx:level,study_day:"2026-11-10",problems:problems,answers:answers}}
const T={target:()=>90,hab:l=>l===0?["EF01MA02"]:["EF01MA02","EF01MA05"]};
// nível 0: 10 contas, 5 erradas de 1 de distância (50% -> vermelho)
let r=FC.analisar([folha(0,[[3,4,false],[4,5,false],[5,6,false],[6,7,false],[7,8,false],[8,8,true],[9,9,true],[1,1,true],[2,2,true],[10,10,true]])],T);
ok(r.length===1&&r[0].semaforo==="vermelho"&&r[0].erros===5&&r[0].n===10&&Math.round(r[0].taxa)===50,"50% de erro de primeira: vermelho");
ok(r[0].porUm===5&&r[0].numericos===5,"detecta erro a 1 de distância do certo");
ok(r[0].contas.length===5&&r[0].contas[0].erros===1,"lista as contas erradas");
// 25% -> amarelo, 10% -> verde, abaixo de 5 contas -> poucos dados
const mk=(erros,total)=>{const s=[];for(let i=0;i<total;i++)s.push([i+1,i<erros?i+9:i+1,i>=erros]);return s};
ok(FC.analisar([folha(0,mk(5,20))],T)[0].semaforo==="amarelo","25%: amarelo");
ok(FC.analisar([folha(0,mk(2,20))],T)[0].semaforo==="verde","10%: verde");
ok(FC.analisar([folha(0,mk(2,4))],T)[0].semaforo==="poucos","menos de 5 contas: poucos dados (mesmo com 50% de erro)");
ok(FC.analisar([folha(0,mk(8,20))],T)[0].semaforo==="vermelho"&&FC.analisar([folha(0,mk(7,20))],T)[0].semaforo==="amarelo","limite do vermelho em 40% (8 de 20 sim, 7 de 20 não)");
// ordem: vermelho antes de amarelo antes de verde
r=FC.analisar([folha(0,mk(10,20)),folha(1,mk(1,20)),folha(2,mk(5,20))],T);
ok(r.map(x=>x.semaforo).join()==="vermelho,amarelo,verde","ordena pelos mais graves primeiro: "+r.map(x=>x.semaforo));
// devagar
const lenta=[];for(let i=0;i<10;i++)lenta.push([i+1,i+1,true,20000]);
ok(FC.analisar([folha(0,lenta)],T)[0].devagar===true,"tempo médio acima de 1,5x o esperado (9 s): devagar");
const rapida=[];for(let i=0;i<10;i++)rapida.push([i+1,i+1,true,5000]);
ok(FC.analisar([folha(0,rapida)],T)[0].devagar===false,"dentro do esperado: não é devagar");
// conta sem resposta (folhas antigas)
const vazio=folha(0,mk(0,10));vazio.answers[0]={v:"",ok:false,tries:1,ms:1000};
ok(FC.analisar([vazio],T)[0].semResposta===1,"conta em branco de folha antiga conta como sem resposta");
// mesma conta errada em várias folhas agrupa
const a1=folha(0,[[7,5,false],[1,1,true],[2,2,true],[3,3,true],[4,4,true]]),a2=folha(0,[[7,6,false],[1,1,true],[2,2,true],[3,3,true],[4,4,true]]);
r=FC.analisar([a1,a2],T);
ok(r[0].contas.length===1&&r[0].contas[0].erros===2&&r[0].contas[0].vezes===2&&r[0].contas[0].resp.join()==="5,6","a mesma conta errada em folhas diferentes é agrupada");
// por habilidade
const h=FC.analisarHab(FC.analisar([folha(0,mk(10,20)),folha(1,mk(1,20))],T));
const h2=h.filter(x=>x.cod==="EF01MA02")[0],h5=h.filter(x=>x.cod==="EF01MA05")[0];
ok(h2&&h2.n===40&&h2.erros===11&&h5&&h5.n===20&&h5.erros===1,"habilidade soma os níveis que a treinam (EF01MA02: 11 de 40; EF01MA05: 1 de 20)");
// habilidades da BNCC: todo código usado pelos níveis tem texto
const usados=new Set();
["grade1.js","grade2.js","grade3.js","grade4.js","grade5.js","exercicios.js"].forEach(f=>{for(const m of fs.readFileSync(path.join(root,f),"utf8").matchAll(/hab:\[([^\]]*)\]/g))for(const c of m[1].matchAll(/"(EF\d\dMA\d\d)"/g))usados.add(c[1])});
const faltam=[...usados].filter(c=>!FC.HAB[c]);
ok(usados.size>=60&&faltam.length===0,"todo código da BNCC usado nos níveis tem descrição ("+usados.size+" códigos; faltam: "+faltam.join(",")+")");
ok(Object.values(FC.HAB).every(x=>x[1].length<=100&&x[2].length>=x[1].length-1),"resumo curto e texto oficial completo");
// código da tela
const ad=fs.readFileSync(path.join(root,"adult.js"),"utf8"),idx=fs.readFileSync(path.join(root,"index.html"),"utf8"),sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
ok(/id:"dificuldades"/.test(ad)&&/function renderDif\(/.test(ad)&&/FC\.analisar\(/.test(ad),"aba Dificuldades usa a análise");
ok(/id="histBox"/.test(ad)&&/function histDay\(/.test(ad)&&/class="hs-err"/.test(ad)&&/Ver a folha inteira/.test(ad),"Histórico: um cartão por dia, e a página do dia mostra as contas erradas e a folha inteira");
ok(/id="difPer"/.test(ad),"período escolhido pelos pais (7 dias, 30 dias, tudo)");
ok(/habilidades\.js/.test(idx)&&/analise\.js/.test(idx)&&/habilidades\.js/.test(sw)&&/analise\.js/.test(sw),"arquivos carregados e guardados no cache");
ok(!/dica/i.test(ad.slice(ad.indexOf("function renderDif("),ad.indexOf("/* Contas em que o aluno mais demora"))),"sem dica pedagógica por enquanto");
// Histórico em cartões (um por dia) e endereço próprio para cada dia
const css=fs.readFileSync(path.join(root,"style.css"),"utf8");
ok(/class="hday" data-day=/.test(ad)&&/\.hday\{display:flex/.test(css)&&!/table class="hist"/.test(ad),"Histórico: cartões por dia no lugar da tabela de folhas");
ok(/historico\/"\+H\.day/.test(ad)&&/\\d\{4\}-\\d\\d-\\d\\d/.test(ad),"cada dia do Histórico tem endereço (voltar do navegador funciona)");
ok(/apoio\+turboAtencao\(turbo\)/.test(ad)&&!/Fatos teimosos[\s\S]*function turboAtencao/.test(ad),"contas em reforço, contas demoradas e fatos da Turbo ficam só na aba Atenção");
ok(/table\.hab tr\{display:grid/.test(css),"tabela de habilidades também empilha no celular");
console.log(falhas?"\n"+falhas+" falha(s)":"dificuldades: tudo certo");process.exit(falhas?1:0);
