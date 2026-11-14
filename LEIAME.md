# Folhinha VIP — como publicar na Vercel

Site estático: não precisa de build. A pasta raiz é publicada como está.

1. Na Vercel, importe este repositório do GitHub como um projeto novo. Deixe "Framework Preset" em "Other" e não preencha build nem pasta de saída.
2. Cada push na `main` publica a versão de produção. Cada branch ou PR ganha um endereço de prévia.
3. Em Settings → Domains do projeto na Vercel, adicione o domínio (por exemplo `www.folhinha.vip`) e aponte o DNS como a Vercel indicar.
4. No painel do Supabase (projeto `folhinha-calculo`), vá em Authentication → URL Configuration:
   - Site URL: o endereço de produção (por exemplo `https://www.folhinha.vip`)
   - Redirect URLs: o mesmo endereço, com e sem `/**` (necessário para os links de e-mail, como “Esqueci minha senha”)
5. Abra o endereço, cadastre-se como pai ou professor, cadastre o aluno e envie o link gerado.

O arquivo `vercel.json` cuida de duas coisas: o endereço `/adm` (área de administração, sem link no site) e o cache do `sw.js` e do manifesto, que precisam ser sempre revalidados para o app atualizar.

Tudo que é secreto fica no Supabase. O arquivo `config.js` só tem a chave pública “anon”, feita para ficar no navegador.
