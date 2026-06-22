# Find the Money the Government Owes You

Billions of dollars sit unclaimed in state accounts — old deposits, refunds,
final paychecks, insurance payouts, forgotten utility deposits, and more. This
guide shows how to use the **Claude in Chrome** browser tool to search every
state's unclaimed-property database for your whole family, build a spreadsheet
of what you're owed, and pre-fill each claim — leaving only the private parts
for you to enter and submit.

> **It's your own money and claiming it is always free.** Never pay a "we'll
> find your money" finder service — they just charge you for this exact search.

---

## What Claude actually does

This is honest — there is no "it submitted everything for you" step. Using the
Claude in Chrome tool, Claude:

1. Opens `missingmoney.com` in **your own browser**.
2. Searches every state's unclaimed-property database for you and your family.
3. Builds a spreadsheet of every dollar you're owed, with a direct claim link
   for each item.
4. Opens a tab for each claim and fills in everything it can.
5. **Stops at your private information** and hands it back to you to enter and
   submit. You stay in control of anything sensitive.

---

## One-time setup: turn on the Chrome tool

Claude needs the browser tool for this, and it runs inside Claude Cowork.

1. In Claude, open **Customize**.
2. Go to **Connectors**.
3. Enable the **Claude in Chrome** connector.

That one toggle is what lets Claude open the sites and fill the forms for you.
Do it once and you're set.

> **Note:** This workflow requires the Claude desktop/web app with the Chrome
> connector. It does **not** work from a headless environment (such as Claude
> Code on the web), which has no access to your browser.

---

## Step 1 — Find every dollar you're owed

Open a fresh Claude chat and paste the prompt below. Claude will ask for your
details (your name, past/maiden names, your family's names, the states you've
lived in), then search the database and build your spreadsheet.

```
Act as an unclaimed property expert. Use the Claude in Chrome tool to go to
missingmoney.com and search it for me and everyone in my family. Build a
spreadsheet showing the name, amount, type, and state of every claim we're
owed, with the direct claim link for each.
```

---

## Step 2 — Let Claude pre-fill every claim

Once the spreadsheet looks right, paste this. Claude opens a tab for each claim
and fills in everything that isn't your private info, then stops and tells you
exactly what's left for you to enter.

```
Now open a new tab for each claim and fill in every field you can, everything
except my personal identifying information. When you're done, stop and report
back the exact list of fields I need to provide manually to submit each claim.
```

---

## What you get back

- A **spreadsheet** of every claim with the amounts and links.
- A **pre-filled claim form** open in its own tab for each one.
- A **clean checklist** of the few private fields (your SSN, ID, signature) you
  finish yourself.

You review, add the sensitive parts, and hit submit. That's the whole job.

---

## The rules — read this

- **It's your own money and claiming it is always free.** Never pay a finder
  service.
- **Only ever enter your own information.**
- **Search your family's names and old addresses too** — that's where most of
  it hides. Most people have something sitting there.

---

## Where the money actually lives

- **[missingmoney.com](https://www.missingmoney.com)** — the official NAUPA
  (National Association of Unclaimed Property Administrators) database, covering
  most states.
- **[unclaimed.org](https://www.unclaimed.org)** — for anything `missingmoney.com`
  misses, open your own state's official unclaimed-property site from here.
  Claude can search those the same way; just point it there.
