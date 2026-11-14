# Folhinha VIP — como publicar no Netlify

1. Acesse https://app.netlify.com/drop e arraste a pasta `folhinha-site` (ou o .zip descompactado).
2. O Netlify devolve um endereço como `https://nome-aleatorio.netlify.app`. Anote.
3. No painel do Supabase (projeto `folhinha-calculo`), vá em Authentication → URL Configuration:
   - Site URL: o endereço do Netlify
   - Redirect URLs: o mesmo endereço (necessário para o link “Esqueci minha senha”)
4. Abra o endereço, cadastre-se como pai ou professor, cadastre o aluno e envie o link gerado.

Atualizar o site depois: no Netlify, aba Deploys, arraste a pasta de novo.

Tudo que é secreto fica no Supabase. O arquivo `config.js` só tem a chave pública “anon”, feita para ficar no navegador.
