# ClaimTrail — unclaimed-property tracker (SaaS)

A small, honest web app that **organizes and tracks** an unclaimed-property
search for a whole family across all 50 states. It is the paid-SaaS,
value-add model: you charge a flat software subscription for convenience —
**never a cut of recovered money**, and the underlying government search stays
free.

> **Important positioning:** ClaimTrail is *not* a finder/locator service.
> Searching and claiming unclaimed property is always free at
> [missingmoney.com](https://www.missingmoney.com) and
> [unclaimed.org](https://www.unclaimed.org). The app keeps a banner saying so
> on every screen. This keeps you clear of the licensing/fee-cap laws that
> regulate paid finder services in most US states.

## What it does

- **Family roster** — track yourself, spouse, kids, parents, maiden/old names, estates.
- **Per-person state checklist** — quick links to the official free search sites.
- **Claim pipeline** — each claim moves through *Found → Filing → Submitted → Paid* (click the status pill to advance).
- **Totals** — tracked / recovered / still owed, live.
- **CSV export** — your data, anytime.
- **Plans** — Free (1 person), Family ($9/mo, unlimited), Pro/Estates ($29/mo).

## Run locally

It's a static site — no build step.

```bash
cd unclaimed-tracker
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

It's Vercel-ready. Create a **dedicated Vercel project** with its **Root
Directory** set to `unclaimed-tracker/` (Vercel **Settings → General → Root
Directory**). Vercel serves `index.html` statically and auto-detects the
`api/` folder as Node serverless functions (installing `stripe` from
`package.json`). No framework preset or build command is required.

Then add the Stripe env vars from the **Payments** section below to make the
plan buttons charge for real.

## Data & privacy

In this demo, **all data lives in the browser** (`localStorage`) — nothing is
uploaded. That's deliberate: it ships working with zero backend and zero PII on
a server. For a real launch you'd add accounts + storage (see below).

## Payments (Stripe Checkout) — already wired

The plan buttons call `choosePlan()` → `startCheckout()` in `app.js`, which tries
three paths in order:

1. **Serverless Stripe Checkout** (recommended). `api/create-checkout-session.js`
   creates a real Checkout Session server-side. To turn it on, set these env vars
   in your Vercel project (**Settings → Environment Variables**):

   | Variable | Value |
   | --- | --- |
   | `STRIPE_SECRET_KEY` | `sk_live_...` (or `sk_test_...`) |
   | `STRIPE_PRICE_FAMILY` | the `price_...` ID for the $9/mo plan |
   | `STRIPE_PRICE_PRO` | the `price_...` ID for the $29/mo plan |

   Create the two recurring Prices at
   <https://dashboard.stripe.com/products>. On success Stripe redirects to
   `/?checkout=success&plan=family`, and the app unlocks that plan.

2. **Stripe Payment Links** (zero backend). If you'd rather not run the function,
   create two [Payment Links](https://dashboard.stripe.com/payment-links), set each
   link's *after-payment redirect* to `https://YOURSITE/?checkout=success&plan=family`
   (or `plan=pro`), and paste the URLs into the `PAYMENT_LINKS` object at the top of
   `app.js`.

3. **Demo mode** — if neither is configured, buttons unlock the plan locally with
   no charge (handy for trying the UI).

> For production you should also confirm the subscription via a Stripe
> [webhook](https://stripe.com/docs/webhooks) before granting access, rather than
> trusting the success redirect alone. The redirect unlock here is fine for an MVP.

## Going to production (the rest of the checklist)

1. **Accounts + storage** — add auth and a database (e.g. Supabase) so a user's
   roster/claims sync across devices. Keep sensitive PII (SSN, ID images) **out**
   of your DB — the app intentionally only tracks *that* a field is needed, not
   its value.
3. **Compliance copy** — keep the "search is always free / we are not a finder
   service / flat fee only" disclosures. Add Terms and a Privacy Policy. If you
   ever pivot to doing the filing *for* people for a success fee, you must
   register as an unclaimed-property locator and follow each state's fee caps
   (commonly ~10%), contract, and waiting-period rules.
4. **Analytics & support** — wire your preferred analytics and a support inbox.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Marketing page + the dashboard app (single page). |
| `styles.css` | All styling. |
| `app.js` | App logic: people, claims, pipeline, export, plan gating, checkout. |
| `api/create-checkout-session.js` | Vercel serverless function for Stripe Checkout. |
| `package.json` | Declares the `stripe` dependency for the function. |
| `vercel.json` | Static hosting config + security headers. |
