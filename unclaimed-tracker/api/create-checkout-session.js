// Vercel serverless function: create a Stripe Checkout Session.
//
// This is the "real" dynamic Checkout path. It runs server-side so the Stripe
// secret key is never exposed to the browser.
//
// Required environment variables (set in Vercel project settings):
//   STRIPE_SECRET_KEY    - sk_live_... or sk_test_...
//   STRIPE_PRICE_FAMILY  - price_... for the $9/mo Family plan
//   STRIPE_PRICE_PRO     - price_... for the $29/mo Pro plan
//
// Front-end posts { plan: "family" | "pro" }; we return { url } to redirect to.

const PRICE_ENV = {
  family: "STRIPE_PRICE_FAMILY",
  pro: "STRIPE_PRICE_PRO",
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    // Not configured yet — tell the client so it can fall back to a Payment Link.
    return res.status(501).json({ error: "stripe_not_configured" });
  }

  // Parse body (Vercel usually parses JSON, but be defensive).
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const plan = (body && body.plan) || "";
  const priceEnv = PRICE_ENV[plan];
  if (!priceEnv) {
    return res.status(400).json({ error: "unknown_plan" });
  }
  const price = process.env[priceEnv];
  if (!price) {
    return res.status(501).json({ error: "price_not_configured", plan });
  }

  // Derive the origin so success/cancel URLs point back at this site.
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `${proto}://${host}`;

  try {
    const stripe = require("stripe")(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/?checkout=success&plan=${encodeURIComponent(plan)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: "stripe_error", message: String(err && err.message || err) });
  }
};
