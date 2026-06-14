# AquaBerry 🍓 — site de vendas com checkout no Stripe

Site pronto para publicar no **Netlify** com pagamento por cartão via **Stripe**, direto na página.
O preço já segue a regra da loja: **$45 a unidade** e **$40 cada quando o cliente leva 2 ou mais**.

## O que tem nesta pasta

```
aquaberry-site/
├─ index.html                          → o site (fotos já embutidas)
├─ netlify.toml                        → configuração do Netlify
└─ netlify/functions/
   └─ create-checkout.js               → cria o pagamento no Stripe (servidor)
```

A chave secreta do Stripe **não fica no site** — ela vai numa variável de ambiente do Netlify.
Por isso o checkout passa por uma função serverless, que calcula o preço com segurança.

---

## Passo a passo

### 1. Criar conta no Stripe e pegar a chave
1. Crie/entre em uma conta em https://stripe.com
2. Vá em **Developers → API keys**
3. Para testar primeiro, use a chave de **teste** (começa com `sk_test_...`).
   Para vender de verdade, ative a conta e use a chave **live** (`sk_live_...`).
4. Copie a **Secret key**.

### 2. Publicar no Netlify
Tem dois caminhos — escolha um:

**A) Arrastar a pasta (mais rápido)**
1. Entre em https://app.netlify.com → **Add new site → Deploy manually**
2. Arraste a pasta `aquaberry-site` inteira para a área indicada.

**B) Via GitHub (recomendado para atualizar depois)**
1. Suba esta pasta para um repositório no GitHub.
2. No Netlify: **Add new site → Import an existing project** e selecione o repositório.

### 3. Conectar o Stripe (variável de ambiente)
1. No painel do site no Netlify: **Site configuration → Environment variables**
2. **Add a variable**:
   - Key: `STRIPE_SECRET_KEY`
   - Value: a sua chave do Stripe (`sk_test_...` ou `sk_live_...`)
3. Salve e, em **Deploys**, clique em **Trigger deploy → Deploy site** para aplicar.

### 4. Testar
1. Abra o site publicado, adicione biquínis e clique em **Checkout · pay with card**.
2. Com a chave de **teste**, use o cartão fictício do Stripe:
   - Número: `4242 4242 4242 4242`
   - Validade: qualquer data futura · CVC: qualquer 3 dígitos · CEP: qualquer
3. Após pagar, o cliente volta para o site com a mensagem de pedido confirmado.

Quando estiver tudo certo, troque a chave de teste pela **live** (passo 3) para receber pagamentos reais.

---

## Ajustes úteis

- **Frete:** por padrão o site coleta o endereço nos EUA e não cobra frete.
  Para cobrar um valor fixo, abra `netlify/functions/create-checkout.js` e descomente
  o bloco "Frete fixo", ajustando o valor (em centavos: `600` = $6.00).
- **Preços:** mude `PRICE_SINGLE` e `PRICE_MULTI` (em centavos) no mesmo arquivo
  **e** os valores exibidos no `index.html` (procure por `$45` e `$40`).
- **Confirmação por e-mail:** ative em Stripe → **Settings → Customer emails**
  para o cliente receber o recibo automaticamente.
- **Ver pedidos:** todos os pedidos aparecem no painel do Stripe em **Payments**.

## Recados rápidos
- O site é em inglês e os preços em dólar (USD), igual combinamos.
- Tamanhos: XS · S · M · L.
- Dúvidas dos clientes continuam indo para o Instagram **@aquaberry.sw**.
