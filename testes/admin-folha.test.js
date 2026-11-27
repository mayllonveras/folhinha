/* Gerador de folhas da administração (aba Folhas do /adm). Rodar com: node testes/admin-folha.test.js
   Confere o que a tela usa: a folha sem revisão tem 10 contas do próprio nível, em rampa (do mais fácil ao mais difícil),
   as 5 folhas do dia sobem de faixa, e a opção nova não muda a folha do aluno (que continua com 2 contas de revisão). */
const fs=require("fs"),path=require("path");
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
["core","exercicios","grade1","grade2","grade3","grade4","grade5","plano"].forEach(f=>require("../"+f+".js"));
const FC=global.FC;let falhas=0;const ok=(c,m)=>{if(!c){falhas++;if(falhas<30)console.log("  FALHA",m)}};
const media=a=>a.reduce((x,y)=>x+y,0)/a.length;
let semNota=0,desordem=0,comRev=0,curtas=0;const subida=[[],[],[],[],[]];
FC.LEVELS.forEach((L,i)=>{
  if(!L.espec)semNota++;
  for(let k=0;k<FC.plano.CICLO;k++){
    const it=FC.makeItems(i,null,{sheetNo:k,semRevisao:true});
    if(it.length!==10)curtas++;
    if(it.some(x=>x._rev))comRev++;
    const p=it.map(x=>x._p);
    if(p.some(v=>typeof v!=="number"))semNota++;
    else{for(let j=1;j<p.length;j++)if(p[j]<p[j-1])desordem++;subida[k].push(media(p))}
  }
});
ok(FC.LEVELS.length===211,"211 níveis");
ok(semNota===0,"todo nível e toda conta tem nota de dificuldade ("+semNota+" sem)");
ok(curtas===0,"toda folha tem 10 contas");
ok(comRev===0,"sem revisão: nenhuma conta de outro nível");
ok(desordem===0,"as contas vão do mais fácil ao mais difícil ("+desordem+" fora de ordem)");
const m=subida.map(media);
ok(m.every((v,k)=>k===0||v>m[k-1]),"a dificuldade média sobe da folha 1 à folha 5: "+m.map(v=>Math.round(v*100)+"%").join(" < "));
// com revisão (como no app): 2 contas de outro nível a partir do nível 2; o nível 1 não tem anterior
let erradas=0;
for(const i of [1,10,60,150,210])for(let k=0;k<5;k++){const it=FC.makeItems(i,null,{sheetNo:k});if(it.length!==10||it.filter(x=>x._rev).length!==2)erradas++}
ok(erradas===0,"folha do app continua com 10 contas, 2 de revisão");
ok(FC.makeItems(0,null,{sheetNo:0}).every(x=>!x._rev),"nível 1 não tem revisão");
// sem a opção "sheetNo" o sorteio livre (1º ano sem rampa) também respeita semRevisao
ok(!FC.makeItems(30,null,{semRevisao:true}).some(x=>x._rev)&&FC.makeItems(30,null,{}).filter(x=>x._rev).length===2,"sorteio livre: semRevisao tira a revisão, o padrão mantém");
// a tela
const root=path.join(__dirname,".."),ad=fs.readFileSync(path.join(root,"admin.js"),"utf8"),css=fs.readFileSync(path.join(root,"style.css"),"utf8");
ok(/TABS_ADM=\[[^\]]*"folhas"/.test(ad)&&/data-t="folhas"/.test(ad)&&/TAB==="folhas"\?folhasHtml\(\)/.test(ad),"aba Folhas no /adm");
ok(/id="fLv"/.test(ad)&&/id="fGo"/.test(ad)&&/semRevisao:!rev/.test(ad),"seletor de nível, botão Gerar folha e folha sem revisão por padrão");
ok(/FC\.itemStatic\(it\)/.test(ad)&&/it\._p/.test(ad)&&/FC\.plano\.BANDAS/.test(ad),"mostra a resposta certa, a dificuldade de cada conta e a faixa da folha");
ok(/\.adm-strip/.test(css)&&/\.adm-q\{/.test(css),"estilos da rampa e dos cartões");
console.log(falhas?"\n"+falhas+" falha(s)":"admin-folha: tudo certo");process.exit(falhas?1:0);
