# SEO page generator

The loan program pages, geographic landing pages, legal pages and `sitemap.xml`
are generated from source files here and **committed as static HTML** — Netlify
publishes `.` with no build step, so nothing runs at deploy time.

## Commands

```bash
node scripts/seo/build.mjs     # regenerate the pages + sitemap.xml
node scripts/seo/check.mjs     # audit every HTML page (exits non-zero on errors)
node scripts/seo/render-og.mjs # regenerate /og-image.png from og-image.html
```

Run `build.mjs` after editing anything under `scripts/seo/`, then commit both
the source and the regenerated HTML.

## What lives where

| File | Contents |
|---|---|
| `site.mjs` | Shared chrome — `<head>`, header/nav, breadcrumbs, footer, FAQ block, schema helpers, site constants (phone, email, founder, excluded states) |
| `programs.mjs` | Copy, terms tables and FAQs for the six `/loans/*` pages |
| `geos.mjs` | Copy and FAQs for the four `/hard-money-loans/*` pages, plus the shared testimonials |
| `legal.mjs` | Privacy policy, terms of service, accessibility statement |
| `build.mjs` | Renders everything and rewrites `sitemap.xml` |
| `check.mjs` | Static audit: one H1 per page, no skipped heading levels, one canonical, title/description length, valid JSON-LD, no `AggregateRating`, no broken internal links, sitemap coverage |
| `og-image.html` + `render-og.mjs` | Source and renderer for the 1200×630 social share card |

## Adding a state page

Add an entry to `GEOS` in `geos.mjs` and re-run `build.mjs`. The footer, the
`/loans` index and the sitemap pick it up automatically.

**Write genuinely local content.** Cloning an existing entry and swapping the
state name produces a thin doorway page, which is worse for rankings than
having no page at all. Each entry needs real market context, the cities
actually served, which programs get used there, and state-specific FAQs.

## Published terms and where they come from

Three programs are aligned to **Crebrid**'s published terms (a capital
partner). Three are not, because Crebrid has no equivalent product — their
"Refinance" is a 6/12/18-month short-term loan, not a 30-year cash-out, so
mapping it would introduce an error rather than fix one.

| Program | Source | Rate | Leverage | Min |
|---|---|---|---|---|
| Fix & Flip | Crebrid | 7.73% | 90% LTC / 70% ARV | $75K |
| DSCR | Crebrid | 5.75% | 80% LTV | $75K |
| New Construction | Crebrid | 8.99% | 85% LTC / 70% as-completed | $75K |
| Multi-Family | Crebrid | — | 75% LTV, 2–10 units | $75K |
| Bridge | other partners | 8.25% | 75% LTV | — |
| Cash-Out Refi (30-yr) | partly Crebrid DSCR | — | 80% LTV | — |

Sitewide underwriting rules, all from the Crebrid Broker Deal Qualification
Guide (v. 3/4/2026) — keep these in sync if a newer version arrives:

- **Minimum FICO 660** on every program. 700+ or a returning borrower reaches
  90% LTC with 10% down; below 700 requires documented value-add experience in
  the last 24 months, else 80% LTC with 20% down.
- **Total project cost ≤ $125K requires 20% down** regardless of profile.
- **9 months of payment reserves** on the subject property, and 9 months per
  open loan for borrowers carrying several.
- **Interest is non-Dutch only on rehabs over $100K.** Below that it accrues on
  the full loan amount from closing — the site says so explicitly.
- **Comps must be within 6 months and a 2-mile radius.**
- **Portfolio loans: max 5 properties, all in the same county**, each with a
  defined lien release value.
- **Up to 10 units** — this is what caps Multi-Family at 2–10, not 2–20.

Bridge runs on other capital partners, not Crebrid (their "Refinance" is
refinance-only at 7.73% / 75% LTV and does not cover acquisition bridges), so
its 8.25% / 75% LTV is intentionally independent of the Crebrid figures.

Still unverified against any partner:
"foreclosure bailouts and mid-construction scenarios", the rural eligibility
screen ("city must have at least 5,000 people per square mile"), and the
ineligible Florida markets (Cape Coral, Lehigh Acres, St. James City).

## Keeping the numbers in sync

Rates, LTV/LTC limits, FICO minimums, loan sizes and terms appear in four
places. When one changes, change all four:

1. `scripts/seo/programs.mjs` (metrics + terms tables + FAQ answers)
2. `scripts/seo/geos.mjs` (the Georgia pricing FAQ) and `build.mjs` (the
   `/loans` index rates note)
3. `index.html` — the program cards, the "Typical Rates & Fees" note, **and
   the FAQPage schema, which is generated alongside the visible FAQ**
4. `es.html` — the Spanish program cards
5. `llms.txt` — the Loan Programs section and Key Facts

The homepage FAQ schema and the visible FAQ accordion must stay identical —
Google requires marked-up FAQ content to be present on the page. They were out
of sync (8 schema vs 6 visible) until 2026-09-05; both are now written from one
list of eight questions.

## Things deliberately not done

- **No `AggregateRating` or `Review` schema anywhere.** The testimonials are
  first-party and unverifiable by a third party; marking them up as review
  schema violates Google's guidelines and risks a manual action. `check.mjs`
  fails the build if any appears.
- **No mass-generated state pages.** Four hand-written geographic pages beat
  43 templated ones.

## Outstanding placeholders

Search the generated HTML for `REVIEW:` — each marks something only the owner
or their attorney can fill in:

- **state license disclosures** in the terms of service — see the header
  comment in `legal.mjs` for the two specific questions to put to counsel
- the **`sameAs` array** in the Organization schema (`site.mjs`), once the
  Google Business Profile and LinkedIn company page exist
- **venue and arbitration** in the terms of service — currently Georgia law,
  Fulton County courts, no arbitration clause
- **attorney review** of the privacy policy and terms of service
- the **founder bio** in `index.html` — a placeholder paragraph is in place
  (the note was moved here; internal `REVIEW:` comments are stripped from
  shipped HTML by `build.mjs` so they never appear in public page source)

Resolved 2026-09-05 by owner decision:

- The NMLS placeholder was **removed sitewide**. SGC holds no state lending or
  broker license with a displayable ID; business-purpose loans on
  non-owner-occupied property fall outside the SAFE Act, so there is no NMLS
  number to show. Do not reintroduce a placeholder — an unfilled license
  number reads as a license claim.
- The mailing address stays at **city/state level** ("Atlanta, Georgia, United
  States"). Add a street address if one is ever published; Google Business
  Profile will require one.
- Terms **section 3, "How your loan is funded"**, discloses the dual model and
  that **SGC is compensated by one side only on any given deal** — origination
  points from the borrower, or the funding partner, never both.
- **Origination points are 2–4%, and that is the borrower's total** — not
  SGC's share stacked on a lender's. Corrected from the 1–3% the site
  previously advertised across nine pages plus `llms.txt`, and labeled
  "Total points" everywhere so it cannot be misread. This number is
  load-bearing: a borrower can rely on it, so it must match what you quote.
- **Fix & Flip leverage is 90% LTC on the senior loan.** 100% of cost is real
  but is a *two-loan structure* — the senior loan plus a separate third-party
  gap lender in second position — and it is selective. The site previously
  headlined "up to 100% LTC" and described it as one loan, which also broke
  the unqualified 2–4% points claim (gap capital carries its own pricing).
  `/loans/fix-and-flip` now headlines 90% and carries a dedicated section,
  "Getting to 100% of cost", explaining the structure and its cost. **If you
  re-raise the headline to 100%, the points claim and the rate floor have to
  be qualified in the same edit.**
- Price-level claims ("no added fees", "no added broker fees", "no middlemen")
  were replaced with disclosure-and-timing claims, which hold on every deal:
  no upfront fees, no credit pull to quote, everything payable appears in the
  term sheet before any third-party cost, nothing added afterwards. **Do not
  reintroduce a "no added fees" claim** — points vary by deal, so a claim
  about price level cannot be true all the time.
