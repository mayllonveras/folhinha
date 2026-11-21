/* Desafios dos níveis de abertura (2º ao 5º ano: níveis 36, 77, 119 e 165). Rodar com: node testes/aberturas.test.js
   Cada resposta é recalculada por uma regra independente a partir do texto da conta. Confere também a proporção (cerca de 40% do estilo antigo)
   e a variedade de tipos em cada folha do dia, que é o motivo de existirem. */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
["core","exercicios","grade1","grade2","grade3","grade4","grade5","plano"].forEach(f=>require("../"+f+".js"));
const FC=global.FC,A=FC.abertura;let falhas=0;const falha=m=>{falhas++;if(falhas<40)console.log("  FALHA",m)};const ok=(c,m)=>{if(!c)falha(m)};
const N=Number(process.env.N||1500);
const num=s=>+String(s).replace(/[\s ]/g,"");
const nums=s=>(String(s).match(/\d[\d  ]*\d|\d/g)||[]).map(num);
const CASA={"unidade":0,"unidades":0,"dezena":1,"dezenas":1,"centena":2,"centenas":2,"milhar":3,"milhares":3,"unidade de milhar":3,"unidades de milhar":3,"dezena de milhar":4,"dezenas de milhar":4,"centena de milhar":5,"centenas de milhar":5};
function perms(a){if(a.length<2)return[a];const out=[];a.forEach((x,i)=>perms(a.slice(0,i).concat(a.slice(i+1))).forEach(p=>out.push([x].concat(p))));return out}

for(const nd of [4,5,6]){
  const min=Math.pow(10,nd-1),max=Math.pow(10,nd)-1,vistos={pistas:0,formar:0,problema:0,saltos:0};
  for(let i=0;i<N;i++){
    const it=A.numeros(nd),t=it._info.tipo;vistos[t]++;
    ok(Number.isInteger(it.a)&&it.a>0&&!it.extra,"nd"+nd+" "+t+": resposta inteira positiva e digitada: "+it.pre);
    ok(typeof A.nota(it)==="number"&&isFinite(A.nota(it)),"nota de "+it.pre);
    if(t==="pistas"){
      const m=[...it.pre.matchAll(/(\d) (unidades? de milhar|dezenas? de milhar|centenas? de milhar|milhar(?:es)?|unidades?|dezenas?|centenas?)/g)],v={};let n=0;
      m.forEach(x=>{const q=+x[1],p=CASA[x[2]];ok(p!==undefined&&v[p]===undefined,"casa repetida: "+it.pre);v[p]=q;n+=q*Math.pow(10,p);
        ok((q===1)===/^(unidade|dezena|centena|milhar)( de milhar)?$/.test(x[2]),"singular e plural: "+x[0]);ok(q>=1,"zero nunca vira pista: "+it.pre)});
      ok(n===it.a&&String(n).length===nd,"pistas "+it.pre+" → "+it.a+" (recalculado "+n+")");
      ok(m.length===String(n).replace(/0/g,"").length,"toda casa cheia aparece, e só ela: "+it.pre);
    }else if(t==="formar"){
      const c=it.pre.match(/cartões (.+), qual é o (maior|menor) número de (\d) algarismos/),cards=c[1].replace(" e ",", ").split(", ").map(Number);
      ok(cards.length===nd&&+c[3]===nd&&new Set(cards).size===nd,"cartões distintos: "+it.pre);
      const todos=perms(cards).filter(p=>p[0]!==0).map(p=>+p.join(""));
      ok(it.a===(c[2]==="maior"?Math.max(...todos):Math.min(...todos)),"formar "+it.pre+" → "+it.a);
    }else if(t==="problema"){
      const [n,T]=nums(it.pre);ok(it.a===T-n&&it.a>0&&String(n).length===nd,"problema "+it.pre+" → "+it.a);
      ok(T%100===0&&it.a<it._info.u&&T%it._info.u===0,"o alvo é redondo e a distância menor que o passo: "+it.pre);
    }else{
      const e=nums(it.pre.replace(/^De .*? em .*?: /,"")),d=nums(it.post),v=e.concat([it.a],d),p=nums(it.pre.match(/^De (.*?) em/)[1])[0];
      ok(v.length===5&&e.length>=1&&d.length>=1,"o espaço fica no meio da fila: "+it.pre+"|"+it.post);
      const dif=v[1]-v[0];ok(Math.abs(dif)===p&&v.every((x,k)=>k===0||x-v[k-1]===dif)&&v.every(x=>x>=min&&x<=max),"saltos "+v.join(","));
    }
  }
  ok(Object.values(vistos).every(x=>x>N/4-N*.06&&x<N/4+N*.06),"os 4 desafios saem em proporção igual (nd "+nd+"): "+JSON.stringify(vistos));
}

/* 2º ano */
const PASSO=[[/meias|duplas|olhos/,2],[/dedos|centavos|figurinhas/,5],[/lápis|reais|dezena/,10]];
const vi2={situacao:0,pulos:0,naofaz:0};
for(let i=0;i<N*2;i++){
  const it=A.contagem2(),t=it._info.tipo;vi2[t]++;
  ok(typeof A.nota(it)==="number"&&isFinite(A.nota(it)),"nota de "+it.pre);
  if(t==="situacao"){const nn=nums(it.pre),p=PASSO.filter(x=>x[0].test(it.pre))[0],esperado=nn.length===2?nn[0]*nn[1]:p[1]*nn[0];ok(p&&it.a===esperado&&it.a<=100,"situação "+it.pre+" → "+it.a)}
  else if(t==="pulos"){const nn=nums(it.pre),s=nn[0],p=nn[1],k=nn[3],sobe=/pula/.test(it.pre);ok(nn[2]===p&&it.a===(sobe?s+p*k:s-p*k)&&it.a>=0&&it.a<=100&&[2,5,10].includes(p),"pulos "+it.pre+" → "+it.a);ok(s%p===0,"o começo é múltiplo do passo: "+it.pre)}
  else{
    const nn=nums(it.pre),p=nn[0],ini=nn[2],seq=[0,1,2,3,4].map(k=>ini+k*p),o=it.extra.opts.map(Number),certa=o[it.a-1];
    ok(o.length===4&&new Set(o).size===4&&!seq.includes(certa)&&o.filter(x=>seq.includes(x)).length===3,"não faz parte "+it.pre+" "+o);ok(certa>=1&&certa<=100,"fora de 1 a 100: "+certa)}
}
ok(Object.values(vi2).every(x=>x>N*2/3-N*.2),"os 3 tipos do 2º ano saem: "+JSON.stringify(vi2));

/* nos níveis: proporção do estilo antigo (40%), tipos válidos e variedade em cada folha do dia */
const NIVEIS=[{idx:35,velhos:t=>t===0,ntip:4},{idx:76,velhos:t=>t<=1,ntip:6},{idx:118,velhos:t=>t<=1,ntip:6},{idx:164,velhos:t=>t<=1,ntip:8}];
for(const {idx,velhos,ntip} of NIVEIS){
  const L=FC.LEVELS[idx],E=L.espec;ok(E.tipos.length===ntip&&E.ordem.length===ntip&&new Set(E.ordem).size===ntip,"nível "+L.id+": tipos e ordem do rodízio completos");
  let v=0,M=4000;for(let i=0;i<M;i++){const it=L.gen(),t=E.tipo(it);ok(Number.isInteger(t)&&t>=0&&t<ntip,"tipo inválido "+t);ok(isFinite(E.nota(it)),"nota");if(velhos(t))v++}
  ok(Math.abs(v/M-.4)<.04,"nível "+L.id+": o estilo antigo deve ser ~40% ("+(100*v/M).toFixed(0)+"%)");
  const uniao=new Set(),medTipos=[];
  for(let s=0;s<5;s++){let soma=0;for(let r=0;r<60;r++){const it=FC.makeItems(idx,null,{sheetNo:s,semRevisao:true}),ts=new Set(it.map(x=>E.tipo(x)));soma+=ts.size;ts.forEach(x=>uniao.add(x));
      ok(it.length===10&&new Set(it.map(FC.itemKey)).size===10,"nível "+L.id+": folha de 10 contas sem repetir")}
    medTipos.push(soma/60)}
  ok(uniao.size===ntip,"nível "+L.id+": as 5 folhas do dia cobrem todos os tipos ("+uniao.size+" de "+ntip+")");
  ok(Math.min(...medTipos)>=(ntip===4?2.5:3),"nível "+L.id+": cada folha do dia tem em média "+(ntip===4?"2,5":"3")+" tipos de conta ou mais ("+medTipos.map(x=>x.toFixed(1))+")");
  console.log("nível "+L.id+": estilo antigo "+(100*v/M).toFixed(0)+"%, tipos diferentes por folha, em média (1ª a 5ª): "+medTipos.map(x=>x.toFixed(1)).join(" "));
}
console.log(falhas?"\n"+falhas+" falha(s)":"aberturas: tudo certo");process.exit(falhas?1:0);
