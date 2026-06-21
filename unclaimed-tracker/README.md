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

It's already Vercel-ready (`vercel.json`). Point a Vercel project's root
directory at `unclaimed-tracker/` (or deploy this folder directly). No
framework, no build command needed — it serves `index.html` statically.

## Data & privacy

In this demo, **all data lives in the browser** (`localStorage`) — nothing is
uploaded. That's deliberate: it ships working with zero backend and zero PII on
a server. For a real launch you'd add accounts + storage (see below).

## Going to production (the real checklist)

1. **Payments** — the pricing/plan buttons call `choosePlan()` in `app.js`,
   which currently just records the plan locally. Replace that with
   [Stripe Checkout](https://stripe.com/docs/payments/checkout): create
   products/prices, redirect to a Checkout Session, and gate the plan on the
   webhook-confirmed subscription.
2. **Accounts + storage** — add auth and a database (e.g. Supabase) so a user's
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
| `app.js` | App logic: people, claims, pipeline, export, plan gating. |
| `vercel.json` | Static hosting config + security headers. |
