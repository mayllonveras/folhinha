/* Troca por número (conversão entre álbuns). Rodar com: node testes/troca-por-numero.test.js
   Confere as regras da tela da criança (valor pelo álbum de destino, nomes, nota de conversão) e os pontos essenciais da migração.
   O comportamento no banco é testado por testes/banco/troca-por-numero.sh (precisa de um Postgres descartável). */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
["core.js","stickers.js","dinos.js","pets.js","bandeiras.js","ameacados.js","espaco.js"].forEach(f=>vm.runInThisContext(fs.readFileSync(path.join(root,f),"utf8"),{filename:f}));
const FC=global.FC;let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};

const src=fs.readFileSync(path.join(root,"student.js"),"utf8");
const blk=src.slice(src.indexOf("var TR_VAL="),src.indexOf("async function trLoad("));
const ctx={FC,esc:FC.esc,stk:function(t,s){return "["+t+"#"+s+"]"}};
vm.createContext(ctx);vm.runInContext(blk+";this.api={valOf,dstOf,sumVal,setHtml,pairHtml,namesOf,convNote}",ctx);
const A=ctx.api;

/* 1. valor = raridade da carta que CHEGA (álbum de destino) */
let U=-1;for(let i=0;i<FC.ALBUM_SIZE;i++)if(FC.tierOf("bandeiras",i)==="ultra"&&FC.tierOf("pets",i)==="comum"){U=i;break}
ok(U>=0,"pré-condição: existe um número ultrarrara em Bandeiras e comum em Gatinhos");
ok(A.valOf({theme:"pets",slot:U})===1,"sem destino: vale a raridade da própria carta (comum = 1)");
ok(A.valOf({theme:"pets",slot:U,to:"bandeiras"})===12,"convertida para Bandeiras (ultrarrara): vale 12");
ok(A.valOf({theme:"bandeiras",slot:U,to:"pets"})===1,"ultrarrara que vira comum no álbum de destino: vale 1");
ok(A.sumVal([{theme:"pets",slot:30,to:"bandeiras"},{theme:"pets",slot:32,to:"bandeiras"}])===2,"soma dos valores");
ok(A.dstOf({theme:"pets",slot:1})==="pets"&&A.dstOf({theme:"pets",slot:1,to:"espaco"})==="espaco","destino padrão = o próprio álbum");

/* 2. o que se recebe aparece no álbum de destino; o que se dá, no de origem */
const recv=A.setHtml([{theme:"pets",slot:30,to:"bandeiras"}],"Você recebe",true);
ok(recv.indexOf("[bandeiras#30]")>=0&&recv.indexOf("[pets#30]")<0,"recebida aparece como carta do álbum de destino");
const give=A.setHtml([{theme:"pets",slot:30,to:"bandeiras"}],"Você dá",false);
ok(give.indexOf("[pets#30]")>=0&&give.indexOf("[bandeiras#30]")<0,"dada aparece como a carta de origem");
ok(/nº 31: .*→/.test(recv),"mostra a nota de conversão (nº 31: Gatinhos → Bandeiras)");
ok(A.convNote([{theme:"pets",slot:3}])==="","sem conversão: sem nota");
ok(A.namesOf([{theme:"pets",slot:30,to:"bandeiras"}],true)===FC.stickerInfo("bandeiras",30).name,"nomes do que se recebe usam o destino");
ok(A.namesOf([{theme:"pets",slot:30,to:"bandeiras"}])===FC.stickerInfo("pets",30).name,"nomes do que se dá usam a origem");

/* 3. fluxo na tela: envia {theme,slot,to}; destino escolhível; confere duplicata de destino */
ok(/p_gives:g,p_wants:w/.test(src),"o pedido leva o destino de cada figurinha");
ok(/data-side=.*Vira no álbum/.test(src)||/Vira no álbum:/.test(src),"seletor de álbum de destino quando há mais de um");
ok(/mesma posição do mesmo álbum/.test(src),"avisa quando duas cartas cairiam na mesma posição");
ok(/vale o <b>número<\/b>/.test(src),"a tela explica que vale o número");
ok(/só entra em álbum que está na <b>mesa<\/b>/.test(src),"a tela explica que só se recebe em álbum da mesa");

/* 4. painel dos pais mostra o álbum de destino do que o aluno recebeu */
const adult=fs.readFileSync(path.join(root,"adult.js"),"utf8");
ok(/nms\(x\.got,1\)/.test(adult),"painel dos pais mostra o destino do que o aluno recebeu");

/* 5. Migração: pontos essenciais */
const mig=fs.readFileSync(path.join(root,"migracoes","2026-11-21-troca-por-numero.sql"),"utf8");
["add column to_theme","coalesce(to_theme, theme)","_tier_value(r.dst, r.sl)","'item_repetido'","update awards set student_id = t.addressee, theme = r.dst","update awards set student_id = t.requester, theme = r.dst","_opens_of","_on_desk(p_adr, r.dst)","_on_desk(p_req, r.dst)","unnest(o.desk_themes)","unnest(me.desk_themes)","destino_fora_da_mesa","_need_vip(sid)","_check_albums(t.requester)","_student_vip(oid)","public._trade_side(uuid, text)"].forEach(k=>ok(mig.indexOf(k)>=0,"migração tem: "+k));
ok(/var CACHE = "folhinha-v\d+"/.test(fs.readFileSync(path.join(root,"sw.js"),"utf8")),"cache do app tem versão");

console.log(falhas?falhas+" falha(s)":"troca por número: ok");process.exit(falhas?1:0);
