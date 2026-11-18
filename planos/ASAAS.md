# Cobrança pelo Asaas: como ligar

A cobrança tem três partes:

- **Banco:** `migracoes/2026-11-18-assinatura.sql`, que guarda a regra (preço, cupom, quando o pai vira VIP).
- **Edge Function `assinatura`:** o pai assina ou cancela.
- **Edge Function `asaas-webhook`:** o Asaas avisa os pagamentos.

A chave do Asaas fica só nos segredos das Edge Functions. Nunca vai para o site nem para o repositório.

## Como o pai paga

- **Cartão de crédito:** o pai vai para o Asaas Checkout, digita o cartão na página do Asaas e a assinatura **renova sozinha** todo mês ou todo ano.
- **Pix ou boleto:** o Asaas cria uma assinatura e manda uma **fatura** a cada mês ou ano. O pai escolhe Pix ou boleto na própria fatura.
- **Quando o VIP é liberado:** cada pagamento confirmado libera o VIP até o vencimento da cobrança + 1 ciclo + 3 dias de carência. Estorno ou chargeback encerram o VIP na hora.
- **Cancelamento:** cancelar apaga a assinatura no Asaas, e o VIP vale até o fim do que já foi pago.

## Passo a passo (primeiro no Sandbox, que é o ambiente de teste)

1. **Criar a conta de teste:** crie uma conta em https://sandbox.asaas.com.
2. **Gerar a chave:** no Asaas Sandbox, vá em *Integrações → Chaves de API* e gere uma chave.
3. **Guardar os segredos no Supabase:** no painel do Supabase (projeto folhinha-calculo), vá em *Edge Functions → Secrets* e cadastre:
   - `ASAAS_API_KEY`: a chave do passo 2;
   - `ASAAS_ENV`: `sandbox`;
   - `ASAAS_WEBHOOK_TOKEN`: um texto aleatório com 32 caracteres ou mais (anote; ele vai de novo no passo 5);
   - `SITE_URL`: `https://www.folhinha.vip`.
4. **Publicar o código:** aplicar a migração e publicar as duas Edge Functions. O Claude faz isso pela API do Supabase, com a sua autorização. A `asaas-webhook` vai com a verificação de login (JWT) desligada, porque quem chama é o Asaas, e ele prova quem é pelo token.
5. **Cadastrar o Webhook:** no Asaas, vá em *Integrações → Webhooks → Adicionar* e preencha:
   - **URL:** `https://uutfdvmdodkvbepvlkul.supabase.co/functions/v1/asaas-webhook`
   - **Token de autenticação:** o mesmo `ASAAS_WEBHOOK_TOKEN`
   - **Versão da API:** v3
   - **Tipo de envio:** sequencial
   - **Eventos:** todos de **Cobranças**, de **Assinaturas** e de **Checkout**
6. **Testar:**
   - assine com o cartão de teste do Sandbox e confira se o VIP aparece;
   - assine com Pix, pague a fatura pelo painel do Sandbox e confira de novo;
   - cancele uma assinatura e confira que o VIP continua até o fim do período pago.
7. **Passar para a produção:**
   - troque `ASAAS_API_KEY` pela chave de Produção e `ASAAS_ENV` por `producao`;
   - cadastre o Webhook também na conta de Produção;
   - ative a **nota fiscal automática** no Asaas (*Notas fiscais → Configurações*).

## Pontos de atenção

- **Cupom com desconto em algumas cobranças (cartão):** quando acabam as cobranças com desconto, o sistema volta o valor da assinatura ao preço cheio no Asaas. Em produção, mudar o valor de uma assinatura de **cartão** exige que o Asaas habilite a *tokenização* na conta. Peça isso ao atendimento do Asaas antes de usar cupons desse tipo com cartão. Em Pix ou boleto não é preciso.
- **O mesmo aviso mais de uma vez:** o Asaas pode repetir um aviso. Cada aviso é gravado em `billing_events` e vale uma vez só.
- **Erro ao processar um aviso:** o erro fica em `billing_events.error` e o Asaas recebe 200, para a fila dele não travar.
- **Mudar os preços:** os preços (`preco_mensal_centavos`, `preco_anual_centavos`) e a carência (`assinatura_carencia_dias`) mudam no /adm, em Parâmetros. O preço novo vale para quem assinar depois da mudança.
