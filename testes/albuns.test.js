/* Álbuns liberados, mesa e gaveta. Rodar com: node testes/albuns.test.js
   Confere: amostra do "Detalhes" (sem raras, fixa), tela dos pais só com figurinhas conquistadas, regras da mesa e a migração. */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
["core.js","stickers.js","dinos.js","pets.js","bandeiras.js","ameacados.js","espaco.js"].forEach(f=>vm.runInThisContext(fs.readFileSync(path.join(root,f),"utf8"),{filename:f}));
const FC=global.FC;let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};

/* 1. Amostra do "Detalhes": 4 a 6 cartas comuns, fixas, sem repetir; campos das cartas existem */
ok(FC.THEMES.length===5,"5 álbuns");
FC.THEMES.forEach(t=>{
  const a=FC.sampleSlots(t.id),b=FC.sampleSlots(t.id);
  ok(a.length>=4&&a.length<=6,t.id+": amostra de 4 a 6 cartas ("+a.length+")");
  ok(JSON.stringify(a)===JSON.stringify(b),t.id+": amostra fixa");
  ok(new Set(a).size===a.length,t.id+": sem repetir");
  ok(a.every(s=>FC.tierOf(t.id,s)==="comum"),t.id+": só cartas comuns (sem rara nem ultra)");
  ok(a.every(s=>s>=0&&s<FC.ALBUM_SIZE),t.id+": posições válidas");
  ok(FC.cardFields(t.id).length>=2,t.id+": lista o que aparece nas cartas");
  ok(typeof FC.catOf(t.id)==="string"&&FC.catOf(t.id).length>0,t.id+": tem categoria");
});

/* 2. Tela dos pais: albumHtml com only mostra só as conquistadas */
const got=[{slot:3},{slot:10},{slot:40}];
const h=FC.albumHtml("dinossauros",got,{adult:true,only:true});
ok((h.match(/class="sticker/g)||[]).length===3,"só 3 figurinhas conquistadas aparecem para os pais");
ok(!/dim/.test(h)&&!/locked/i.test(h),"nenhuma figurinha apagada/bloqueada na tela dos pais");
ok(FC.albumHtml("dinossauros",[],{adult:true,only:true}).indexOf("sticker")<0,"álbum sem conquistas: nenhuma figurinha");
const hAntigo=FC.albumHtml("dinossauros",got,{adult:true});
ok((hAntigo.match(/class="sticker/g)||[]).length===FC.ALBUM_SIZE,"sem only (modo antigo) mostraria as 52: por isso a tela dos pais usa only");

/* 3. Código da tela dos pais: sem limite de 2, sem legenda das raras, sem álbum inteiro */
const adult=fs.readFileSync(path.join(root,"adult.js"),"utf8");
ok(adult.indexOf("MAX_THEMES")<0,"adult.js não tem mais limite de 2 álbuns");
ok(/only:true/.test(adult),"painel do aluno usa só as conquistadas");
ok(adult.indexOf("rarityLegend")<0,"adult.js não mostra a lista das raras");
ok(!/for\(var i=0;i<FC\.ALBUM_SIZE;i\+\+\)cells\+=FC\.stickerHtml\(th\.id,i\)/.test(adult),"Detalhes não monta o álbum inteiro");
ok(/sampleSlots/.test(adult),"Detalhes usa a amostra");
ok(/themes\.length\)return\{error/.test(adult),"cadastro exige pelo menos 1 álbum");
ok(/albums_done_at/.test(adult),"aviso de álbuns completos nos pais");
ok(/id="thOpen">Ver álbuns</.test(adult),"tela do programa tem o botão Ver álbuns");
const fm=adult.slice(adult.indexOf("function programFields("),adult.indexOf("function rulesBox("));
ok(fm.indexOf("album-grid")<0&&fm.indexOf("alb-opt")<0,"a grade de capas não aparece direto no formulário (só na tela Ver álbuns)");
ok(/function openAlbums\(/.test(adult)&&/id="thDone">Pronto</.test(adult),"tela Ver álbuns tem a grade e o botão Pronto");

/* 4. Regras da mesa e da gaveta (funções puras da tela da criança, extraídas do arquivo) */
const src=fs.readFileSync(path.join(root,"student.js"),"utf8");
const blk=src.slice(src.indexOf("function themesOf("),src.indexOf("function deskRow("));
const ctx={FC:{ALBUM_SIZE:52}};
vm.createContext(ctx);vm.runInContext(blk+";this.api={themesOf,gotOf,isFull,deskLimit,deskOf,drawerOf,doneAlbums}",ctx);
const A=ctx.api;
const mk=(lib,desk,full,extra)=>{const st=[];(full||[]).forEach(t=>{for(let i=0;i<52;i++)st.push({theme:t,slot:i})});return Object.assign({sticker_themes:lib,desk_themes:desk,stickers:st},extra||{})};
let m=mk(["a","b","c","d"],["a","b"]);
ok(JSON.stringify(A.deskOf(m))==='["a","b"]',"mesa");
ok(JSON.stringify(A.drawerOf(m))==='["c","d"]',"gaveta");
m=mk(["a","b","c","d"],["a","b"],["a"]);
ok(JSON.stringify(A.deskOf(m))==='["b"]',"álbum completo sai da mesa");
ok(JSON.stringify(A.drawerOf(m))==='["c","d"]',"completo não vai para a gaveta");
ok(JSON.stringify(A.doneAlbums(m))==='["a"]',"completos separados");
m=mk(["a","b","c"],["a","x"]);
ok(JSON.stringify(A.deskOf(m))==='["a"]',"álbum retirado (não liberado) some da mesa");
m=mk(["a","b"],undefined);
ok(JSON.stringify(A.deskOf(m))==='["a","b"]',"banco antigo (sem desk_themes): usa os liberados até o limite");
m=mk(["a","b","c"],undefined,[],{desk_limit:1});
ok(JSON.stringify(A.deskOf(m))==='["a"]',"limite vindo do banco (1 na mesa)");
ok(A.deskLimit({})===2,"limite padrão 2");
ok(/p_desk:desk/.test(src)&&/student_set_desk/.test(src),"boas-vindas e troca de mesa chamam o banco");
ok(src.indexOf("if(desk)gift();else pickDesk();")>=0&&src.indexOf("ok.onclick=function(){desk=sel.slice();gift()}")>=0,"primeiro acesso: escolhe a mesa e só depois mostra o pacote de boas-vindas");
const pk=src.slice(src.indexOf("function pickDesk()"),src.indexOf("/* 2) só depois"));
ok(pk.indexOf("pacote de boas-vindas")<0&&pk.indexOf("figurinhas")<0,"a tela de escolher a mesa não fala do pacote nem das figurinhas");
ok(/5 figurinhas de cada álbum/.test(src),"boas-vindas: 5 figurinhas de cada álbum da mesa");
ok(/S\.opening/.test(src),"troca da mesa bloqueada durante a abertura do pacotinho");

/* 5. Migração: pontos essenciais */
const mig=fs.readFileSync(path.join(root,"migracoes","2026-11-15-mesa-gaveta.sql"),"utf8");
["create table public.albums","desk_themes","albums_done_at","students_albums_rules","student_set_desk","album_fora_da_mesa","sem_album","limite_mesa","_check_albums(t.requester)","drop function public.student_welcome(text, text)","student_welcome(p_token text, p_desk text[]","per := case when cardinality(dsk) = 1 then 10 else 5 end"].forEach(k=>ok(mig.indexOf(k)>=0,"migração tem: "+k));
ok(mig.indexOf("'dinossauros','bandeiras','ameacados','pets','espaco')")<0,"create_student não tem mais a lista fixa de 5 temas");
FC.THEMES.forEach(t=>ok(mig.indexOf("('"+t.id+"',")>=0,"álbum "+t.id+" registrado na tabela albums"));

/* 6. Cache do service worker subiu */
ok(/folhinha-v39/.test(fs.readFileSync(path.join(root,"sw.js"),"utf8")),"sw.js em folhinha-v39");
console.log(falhas?"\n"+falhas+" falha(s)":"albuns: tudo certo");process.exit(falhas?1:0);
