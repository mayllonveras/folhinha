/* Fundo das cartas: toda figurinha de todo álbum tem um cenário, e todo cenário tem desenho no CSS. Rodar com: node testes/cenarios.test.js */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
["core.js","stickers.js","dinos.js","pets.js","bandeiras.js","ameacados.js","espaco.js"].forEach(f=>vm.runInThisContext(fs.readFileSync(path.join(root,f),"utf8"),{filename:f}));
const FC=global.FC;let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
const css=fs.readFileSync(path.join(root,"style.css"),"utf8");
const usados={};
FC.THEMES.forEach(t=>{
  const cenas=new Set();
  for(let i=0;i<FC.ALBUM_SIZE;i++){
    const s=FC.sceneOf(t.id,i);
    ok(/^[a-z-]+$/.test(s),t.id+" #"+(i+1)+": tem cenário");
    cenas.add(s);usados[s]=1;
    const h=FC.stickerHtml(t.id,i);
    ok(h.indexOf("sc-"+s)>=0&&h.indexOf('class="st-plate"')>=0,t.id+" #"+(i+1)+": carta com cenário e placa do nome");
  }
  ok(cenas.size>=2,t.id+": cenários diferentes dentro do álbum ("+[...cenas].join(", ")+")");
});
Object.keys(usados).forEach(s=>ok(new RegExp("\\.sc-"+s+"\\{--scene:").test(css),"CSS tem o cenário "+s));
ok(/\.sticker\.tier-rara\{[^}]*0 0 0 4px/.test(css)&&/\.sticker\.tier-ultra\{[^}]*0 0 0 4px/.test(css),"molduras duplas por raridade");
ok(FC.sceneOf("album-novo",0)==="","álbum sem cenário definido continua funcionando (sem classe)");
ok(FC.stickerHtml("dinossauros",3).indexOf("--ang:")>0,"ângulo do degradê varia por figurinha");
console.log(falhas?"\n"+falhas+" falha(s)":"cenarios: tudo certo");process.exit(falhas?1:0);
