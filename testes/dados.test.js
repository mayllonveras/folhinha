/* Vídeos por nível e dados de uso: migração, aplicativo e autorização do responsável. Rodar com: node testes/dados.test.js */
const fs=require("fs"),path=require("path");
const root=path.join(__dirname,"..");let falhas=0;const ok=(c,m)=>{if(!c){falhas++;console.log("  FALHA",m)}};
const rd=f=>fs.readFileSync(path.join(root,f),"utf8");
const mig=rd("migracoes/2026-11-15-videos-e-dados-de-uso.sql"),st=rd("student.js"),ad=rd("adult.js"),core=rd("core.js"),sw=rd("sw.js");
// migração
["create table public.level_videos","create table public.sheet_log","create table public.sheet_items","create table public.usage_events","student_level_videos","student_log_events","sheets_to_log",
 "on delete set null","anon_id","consent_at","insert into storage.buckets","v_uso_nivel","v_uso_conta","v_uso_video","security_invoker","enable row level security","p_consent boolean"].forEach(k=>ok(mig.indexOf(k)>=0,"migração tem: "+k));
ok((mig.match(/on delete set null/g)||[]).length>=3,"as 3 tabelas de uso sobrevivem à exclusão do aluno (anonimizam)");
ok(/ativo boolean not null default false/.test(mig),"vídeo começa como rascunho");
ok(/if st\.consent_at is null then return/.test(mig),"nada é gravado sem autorização");
ok(/jsonb_array_elements\(p_events\)/.test(mig)&&/k > 50/.test(mig),"eventos limitados a 50 por chamada");
ok(/drop function public\.create_student\(/.test(mig),"create_student antigo é trocado (sem ambiguidade)");
// aplicativo do aluno
ok(/vals:i\.vals/.test(st)&&/it\.vals\.push\(v\)/.test(st),"todas as tentativas vão para o banco");
["app_aberto","aba","folha_inicio","folha_abandono","pacote_aberto","mesa_trocada","boas_vindas"].forEach(k=>ok(st.indexOf('track("'+k+'"')>=0,"evento registrado: "+k));
ok(/student_log_events/.test(st)&&/p_app:FC\.VERSAO/.test(st),"eventos enviados em lote com a versão do app");
ok(/catch\(e\)\{\/\* o registro nunca atrapalha/.test(st),"falha no registro não atrapalha a criança");
// versão do app = cache do service worker
const v1=/FC\.VERSAO="(folhinha-v\d+)"/.exec(core),v2=/CACHE = "(folhinha-v\d+)"/.exec(sw);
ok(v1&&v2&&v1[1]===v2[1],"FC.VERSAO ("+(v1&&v1[1])+") igual ao cache do sw.js ("+(v2&&v2[1])+")");
// tela dos pais
ok(/id="pConsent"/.test(ad)&&/delete patch\.consent/.test(ad)&&/patch\.consent_at=null/.test(ad),"edição do aluno grava ou retira a autorização (sem mandar coluna inexistente)");
// autorização única do responsável (pop-up no cadastro)
const m2=rd("migracoes/2026-11-19-autorizacao-dos-pais.sql");
["data_consent boolean","data_consent_at timestamptz","raw_user_meta_data->>'consent'","set_data_consent","coalesce(p_consent, (select data_consent from profiles"].forEach(k=>ok(m2.indexOf(k)>=0,"migração 19/11 tem: "+k));
ok(!/askConsent\("Voltar"\)/.test(ad)&&!/consent:cons[,}]/.test(ad)&&/showConfirmEmail\(email\)/.test(ad),"cadastro do responsável não abre o pop-up e vai direto para a tela de confirmar o e-mail");
ok(/offerConsent\(\)/.test(ad)&&/data_consent!=null/.test(ad),"conta sem resposta recebe o pop-up no painel");
ok(!/p_consent:true/.test(ad)&&!/Para cadastrar, marque a autorização/.test(ad),"cadastro de aluno não pede nem força autorização por aluno");
ok(/id="consentChange"/.test(ad)&&/set_data_consent/.test(ad),"Meu perfil permite mudar ou retirar a autorização");
console.log(falhas?"\n"+falhas+" falha(s)":"dados: tudo certo");process.exit(falhas?1:0);
