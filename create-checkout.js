// AquaBerry — cria uma sessão de pagamento no Stripe (Netlify Function).
// A chave secreta NUNCA fica no site: ela vem da variável de ambiente STRIPE_SECRET_KEY.
// Os preços são calculados AQUI (no servidor), então o cliente não consegue adulterar valores.

const CATALOG = {
  coconut:    "Coconut bikini (lilac)",
  blueberry:  "Blueberry bikini (blue)",
  lemon:      "Lemon bikini (yellow)",
  strawberry: "Strawberry bikini (red)",
  acai:       "Acai bikini (navy)",
  blackberry: "Blackberry bikini (black)",
  raspberry:  "Raspberry bikini (pink)"
};
const PRICE_SINGLE = 4500; // $45.00 em centavos
const PRICE_MULTI  = 4000; // $40.00 quando levar 2 ou mais
const SIZES = ["XS", "S", "M", "L"];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return json(500, { error: "Stripe key not configured. Set STRIPE_SECRET_KEY in Netlify." });
  }

  // 1) Ler e validar o carrinho
  let items;
  try { items = (JSON.parse(event.body || "{}")).items; }
  catch { return json(400, { error: "Bad request." }); }
  if (!Array.isArray(items) || items.length === 0) {
    return json(400, { error: "Empty cart." });
  }

  let totalQty = 0;
  const clean = [];
  for (const it of items) {
    if (!CATALOG[it.id] || !SIZES.includes(it.size)) {
      return json(400, { error: "Invalid item in cart." });
    }
    const qty = Math.max(1, Math.min(20, parseInt(it.qty, 10) || 1));
    totalQty += qty;
    clean.push({ id: it.id, size: it.size, qty });
  }

  // 2) Regra de preço: 1 peça = $45, 2 ou mais = $40 cada
  const unit = totalQty >= 2 ? PRICE_MULTI : PRICE_SINGLE;

  // 3) Montar a sessão do Stripe (form-urlencoded)
  const origin = event.headers.origin || `https://${event.headers.host}`;
  const p = new URLSearchParams();
  p.append("mode", "payment");
  p.append("success_url", `${origin}/?success=1`);
  p.append("cancel_url", `${origin}/?canceled=1`);
  // Coleta endereço de entrega nos EUA:
  p.append("shipping_address_collection[allowed_countries][0]", "US");

  // (Opcional) Frete fixo — descomente e ajuste o valor (em centavos):
  // p.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  // p.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", "600");
  // p.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "usd");
  // p.append("shipping_options[0][shipping_rate_data][display_name]", "USA shipping");

  clean.forEach((it, i) => {
    p.append(`line_items[${i}][quantity]`, String(it.qty));
    p.append(`line_items[${i}][price_data][currency]`, "usd");
    p.append(`line_items[${i}][price_data][unit_amount]`, String(unit));
    p.append(`line_items[${i}][price_data][product_data][name]`, `${CATALOG[it.id]} - size ${it.size}`);
  });

  // 4) Chamar a API do Stripe diretamente (sem dependências)
  try {
    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: p.toString()
    });
    const data = await resp.json();
    if (!resp.ok) {
      return json(resp.status, { error: (data.error && data.error.message) || "Stripe error." });
    }
    return json(200, { url: data.url });
  } catch (e) {
    return json(500, { error: "Could not reach Stripe. Try again." });
  }
};

function json(statusCode, obj) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}
