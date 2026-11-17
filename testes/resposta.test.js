/* Testes da resposta digitada: 6 algarismos e vírgula (decimais do 5º ano). Rodar com: node testes/resposta.test.js */
global.window=global;global.addEventListener=function(){};global.removeEventListener=function(){};
global.document={querySelector(){return null},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
global.navigator={};global.location={search:"",hash:"",origin:"",pathname:""};global.localStorage={};
global.supabase={createClient(){return{auth:{}}}};global.APP_CONFIG={SUPABASE_URL:"x",SUPABASE_ANON_KEY:"y"};global.matchMedia=()=>({matches:false});
require('../core.js');require('../exercicios.js');
const FC=global.FC,fs=require('fs');let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
// conferência da resposta
ok(FC.sameAns("34567",34567)&&FC.sameAns("999999",999999)&&FC.sameAns(" 12 ",12),"inteiros de até 6 algarismos");
ok(FC.sameAns("2,5",2.5)&&FC.sameAns("2.5",2.5)&&FC.sameAns("2,50",2.5)&&FC.sameAns("6,0",6)&&FC.sameAns("6",6),"decimais com vírgula ou ponto; 2,50 = 2,5; 6,0 = 6");
ok(!FC.sameAns("2,4",2.5)&&!FC.sameAns("",5)&&!FC.sameAns(",5",0.5)&&!FC.sameAns("2,",2)&&!FC.sameAns("1,2,3",1.2)&&!FC.sameAns("abc",1)&&!FC.sameAns("12345678",12345678),"respostas inválidas ou erradas");
ok(FC.sameAns("0,75",0.75)&&FC.sameAns("0,1",0.1)&&FC.sameAns("0,3",0.1+0.2),"sem erro de ponto flutuante (0,1 + 0,2)");
ok(FC.numBR(2.5)==="2,5"&&FC.numBR(7)==="7"&&FC.answerText({},2.5)==="2,5","número na tela com vírgula");
ok(FC.ansMode({pre:"3 × 4 =",a:12})==="numeric"&&FC.ansMode({pre:"2,5 × 4 =",a:10})==="decimal"&&FC.ansMode({pre:"9 ÷ 2 =",a:4.5})==="decimal","teclado decimal só quando há vírgula");
// a tela
const ex=FC.itemInner({pre:"2,5 × 4 =",post:"",a:10},0);
ok(/maxlength="9"/.test(ex)&&/inputmode="decimal"/.test(ex)&&!/maxlength="4"/.test(ex),"caixa de resposta com 9 caracteres e teclado decimal");
// o banco: mesma regra, escrita em SQL (a migração é conferida pelo texto)
const sql=fs.readFileSync(__dirname+'/../migracoes/2026-11-17-resposta-decimal.sql','utf8');
ok(/\^\[0-9\]\{1,7\}\(\[\.,\]\[0-9\]\{1,3\}\)\?\$/.test(sql)&&/replace\(an->>'v', ',', '\.'\)::numeric = \(pr->>'a'\)::numeric/.test(sql)&&/alter column ans type numeric/.test(sql),"a migração confere a resposta como número");
const re=/^[0-9]{1,7}([.,][0-9]{1,3})?$/;
ok(re.test("34567")&&re.test("2,5")&&re.test("2.5")&&re.test("999999")&&!re.test("2,")&&!re.test(",5")&&!re.test("12345678")&&!re.test("1,2345"),"a regex do banco aceita o mesmo que a tela");
console.log(falhas?"\n"+falhas+" falha(s)":"resposta: tudo certo");process.exit(falhas?1:0);
