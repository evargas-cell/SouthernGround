// ============================================================
// Content for the six dedicated loan program pages.
// Rate/term numbers here must stay in sync with the homepage
// program cards and the rates note in index.html.
// ============================================================

const T_MARCUS = {
  initials: 'MT',
  name: 'Marcus T.',
  meta: 'Atlanta, GA · Fix &amp; Flip Investor',
  quote:
    'Southern Ground Capital funded my fix and flip in 6 days. I had another lender fall through at the last minute, and SGC stepped in and saved the deal. Their team was responsive, professional, and delivered exactly what they promised. I\'ve done 4 deals with them since.',
};

const T_JENNIFER = {
  initials: 'JR',
  name: 'Jennifer R.',
  meta: 'Charlotte, NC · DSCR / Rental Portfolio',
  quote:
    'As a rental portfolio investor, the DSCR loan program was exactly what I needed. No W-2s, no tax returns — just the property\'s cash flow. SGC made it simple and closed in under 5 weeks. I\'ve already refinanced two more properties through them.',
};

const T_DAVID = {
  initials: 'DK',
  name: 'David K.',
  meta: 'Nashville, TN · New Construction',
  quote:
    'I\'ve worked with a lot of hard money lenders over the years. Southern Ground Capital is different — they actually understand construction draws and timelines. The draw process was smooth, communication was excellent, and they funded every draw on schedule.',
};

export const PROGRAMS = [
  // ----------------------------------------------------------
  {
    slug: 'fix-and-flip',
    nav: 'Fix &amp; Flip',
    schemaName: 'Fix & Flip Loans',
    title: 'Fix &amp; Flip Loans — Up to 90% LTC, Rehab Financed | SGC',
    description:
      'Fix and flip loans up to 90% LTC with rehab financing. $75K–$3.5M, from 7.73%, min FICO 660, close in 2–3 weeks. 43 states.',
    h1: 'Fix &amp; Flip Loans: Up to 90% LTC, Funded in 2–3 Weeks',
    eyebrow: 'Program 01 · Most Popular',
    lede:
      'Purchase and rehab financing for investors buying distressed residential property. We lend on the deal — purchase price, scope of work, and after-repair value — not on your W-2.',
    metrics: [
      ['Max LTC', '90%'],
      ['From', '7.73%*'],
      ['Close', '2–3 wks'],
      ['Term', '6–18 mo'],
    ],
    sections: [
      {
        h2: 'Who this program is for',
        html: `<p>The Fix &amp; Flip program is built for investors who buy a property below market, renovate it, and sell it inside a year. That covers the full range of flip profiles we see every week: the investor buying a foreclosure at auction with fourteen days to close, the wholesaler who needs to take down an assignment they can no longer flip on paper, the contractor buying their own inventory, and the experienced operator running four or five projects at once who needs a lender that can keep up.</p>
        <p>It also covers the situations most lenders quietly decline. We fund <strong>foreclosure bailouts</strong>, where a borrower needs to refinance out of a maturing loan before a sale date. We fund <strong>mid-construction takeouts</strong>, where another lender stopped funding draws and the project is sitting half-finished. And we fund <strong>portfolio deals</strong> — up to five properties under one facility instead of five separate closings, provided they sit in the same county and each carries a defined lien release value.</p>
        <p>The minimum credit score is 660. Above that, credit shapes your leverage rather than your eligibility: at <strong>700 or above</strong> — or as a returning borrower — you can go to 90% of cost with as little as 10% down. <strong>Below 700</strong>, you need documented value-add experience within the last 24 months; without it, the deal is written at 80% of cost with 20% down.</p>
        <p>What matters just as much is whether the numbers work: is the purchase price genuinely below market, is the rehab budget realistic for the scope, and does the after-repair value support the exit?</p>`,
      },
      {
        h2: 'How the loan is structured',
        html: `<p>A fix and flip loan from SGC has two parts. The first is the acquisition advance, funded at closing, which covers a percentage of the purchase price. The second is the rehab holdback — the renovation budget, held by the lender and released to you in draws as the work is completed and inspected.</p>
        <p>Leverage is quoted against <strong>loan-to-cost (LTC)</strong>, which is purchase price plus rehab budget. Our senior loan goes up to 90% of cost for an experienced borrower on a strong deal; most first-time borrowers land between 80% and 85% and bring the balance to closing. Leverage is also capped against <strong>after-repair value (ARV)</strong> at 70%, so a deal has to clear both tests. Covering the last 10% of cost through a gap lender is possible on select deals — see <a href="#sec-3">Getting to 100% of cost</a> below.</p>
        <p>On rehab budgets over $100,000, interest is charged on the drawn balance rather than the full commitment, so you are not paying interest on rehab dollars still sitting in the holdback. <strong>Below that threshold interest accrues on the full loan amount from closing</strong>, which is worth modelling before you size a smaller rehab. Terms run 6, 12, or 18 months with extension options, and there is no prepayment penalty on most fix and flip loans — if you sell in month five, you stop paying in month five.</p>`,
      },
      {
        h2: 'Getting to 100% of cost',
        html: `<p>You can close a deal with none of your own capital in it, but it is worth being precise about how: <strong>it is two loans, not one.</strong> SGC's senior loan covers up to 90% of cost. On selected deals we arrange the remaining basis through a separate gap lender who sits behind us in the capital stack.</p>
        <p>This is genuinely selective rather than a headline with fine print attached. The deal has to carry both positions, which in practice means a documented track record of completed flips, a purchase price well below market, and an after-repair value with enough room that the combined debt still sits comfortably beneath it. Most deals do not qualify. We will tell you inside the first conversation if yours does not, rather than after you have paid for an appraisal.</p>
        <p><strong>Gap capital is priced separately, and it costs materially more than the senior loan.</strong> It is in second position and takes more risk, so it is priced for that — with its own rate, its own points, or in some structures a share of the profit. The rates and the 2–4% total points quoted elsewhere on this page describe the senior loan on a standard single-lender structure. They do not include gap pricing.</p>
        <p>If closing with nothing down is your goal, say so at the start. We will model the blended cost against a conventional 90% structure before you go under contract. Often the arithmetic favours bringing the 10% and keeping the cheaper capital — but not always, and it depends on how much of your money is already committed elsewhere. Either way, that is a conversation to have before you make the offer.</p>`,
      },
      {
        h2: 'Terms at a glance',
        table: [
          ['Loan amount', '$75,000 – $3,500,000'],
          ['Maximum LTC', 'Up to 90% senior loan (purchase + rehab)'],
          ['100% of cost', 'Select deals only, via a separate gap lender'],
          ['Maximum ARV', '70% of after-repair value'],
          ['Rates from', '7.73%* — varies by leverage, credit, and experience'],
          ['Total points', '2–4% of loan amount on the senior loan; gap financing priced separately'],
          ['Term', '6, 12, or 18 months; extensions available'],
          ['Minimum FICO', '660'],
          ['Projects ≤ $125K', '20% down required (80% LTC)'],
          ['Rehab financing', 'Yes — draw-based holdback'],
          ['Prepayment penalty', 'None on most fix &amp; flip loans'],
          ['Property types', 'Single-family, 2–4 unit, townhome, condo'],
          ['Closing timeline', '2–3 weeks from a complete file'],
          ['States', '43 — excludes AZ, NV, ND, OR, SD, UT, VT'],
        ],
      },
      {
        h2: 'What you need to qualify',
        html: `<p>There is no credit pull to get a quote and no upfront fee of any kind. To issue terms we need five things:</p>
        <ul>
          <li><strong>The property address and purchase price.</strong> If you are under contract, send the executed contract.</li>
          <li><strong>A line-item scope of work.</strong> Not "full gut — $65,000." Break it into trades with dollar amounts. A vague budget is the single most common reason a file stalls in underwriting.</li>
          <li><strong>Your ARV opinion with comparables.</strong> Sales from the <strong>last six months</strong>, within a <strong>two-mile radius</strong> of the subject, at similar square footage and finish level — those are the limits the appraisal will be held to, so build your number the same way. We order the appraisal, but your comps tell us whether the number is defensible before anyone spends money.</li>
          <li><strong>Your track record.</strong> A short list of prior flips with addresses and dates. Experience moves your leverage more than your credit score does.</li>
          <li><strong>Photographs of the whole property</strong>, interior and exterior. If it is listed online, send the listing link too.</li>
          <li><strong>Entity documents.</strong> These loans close in an LLC. Articles, operating agreement, EIN letter, and a certificate of good standing.</li>
        </ul>
        <p>Approval decisions are issued within 24–48 hours of a complete submission. From there, most files close in two to three weeks — title work and the appraisal are usually the long pole, not underwriting.</p>`,
      },
      {
        h2: 'How the draw process works',
        html: `<p>Rehab money is released in draws. You complete a stage of work, submit a draw request with photos and the line items you are drawing against, and an inspector verifies the work. Funds are wired on approval. Most borrowers run three to five draws over the life of a project.</p>
        <p>Two practical notes that save borrowers real money. First, <strong>front-load your own capital into the first stage</strong> — demo and rough trades are done before the first inspection, so you carry that cost until the first draw funds. Second, <strong>request draws by completed line item, not by percentage</strong>. "Kitchen cabinets installed, $8,400" is verified in one visit. "Project 40% complete" invites a conversation.</p>`,
      },
    ],
    faqs: [
      {
        q: 'Can I really get 100% of my purchase and rehab financed?',
        a: 'On select deals, yes — but it is two loans rather than one. Our senior loan covers up to 90% of cost, and a separate gap lender takes the remaining basis behind us. That structure is genuinely selective: it needs a documented track record of completed flips, a purchase price well below market, and an ARV that comfortably carries both positions. Gap capital is priced separately and costs materially more than the senior loan, so ask us to model the blended cost against a standard 90% structure before you decide. Most borrowers are approved between 80% and 90% LTC and bring the remaining basis plus closing costs to the table.',
      },
      {
        q: 'What credit score do I need for a fix and flip loan?',
        a: 'The minimum is a 660 FICO. Above that, credit sets your leverage rather than your eligibility. At 700 or above — or as a returning borrower — you can reach 90% of cost with as little as 10% down. Below 700 you need documented value-add experience from the last 24 months; without it the deal is written at 80% of cost with 20% down. Experience and the quality of the deal still move your terms more than the score alone does.',
      },
      {
        q: 'How fast can Southern Ground Capital close a fix and flip loan?',
        a: 'Two to three weeks from a complete file is typical, and approval decisions are issued in 24–48 hours. Faster closings happen regularly when the borrower is responsive and the file is clean — we have funded flips in under a week when title was already open and the appraisal could be expedited.',
      },
      {
        q: 'Do you charge any upfront fees?',
        a: 'No. There are no application fees, no underwriting deposits, and no fees of any kind to get a quote or a term sheet. You pay third-party costs — appraisal, title, insurance — and points at closing, out of loan proceeds.',
      },
      {
        q: 'Is there a prepayment penalty if I sell early?',
        a: 'There is no prepayment penalty on most fix and flip loans. Interest is charged on the outstanding balance for the months you hold the loan. If the property sells in month five of a twelve-month term, you stop paying interest at payoff.',
      },
      {
        q: 'Can you refinance a project I have already started?',
        a: 'Yes. Mid-construction takeouts are one of our most common scenarios — typically when another lender stopped funding draws or a hard money loan is coming due before the project is finished. We underwrite the remaining scope, the cost already in the ground, and the ARV, and we can pay off the existing lender at closing.',
      },
    ],
    testimonial: T_MARCUS,
    related: [
      ['/blog/rehab-budget-guide.html', 'How to Scope Your Rehab Budget So Your Lender Says Yes', 'Build a scope of work that gets approved quickly and funded fully.'],
      ['/blog/arv-explained.html', 'ARV 101: How Lenders Calculate After-Repair Value', 'The number that drives your leverage — and how underwriters check it.'],
      ['/blog/llc-docs-checklist.html', 'The LLC Doc Checklist', 'Every entity document your lender needs before you apply.'],
    ],
    crossSell: ['bridge', 'new-construction', 'cash-out-refinance'],
  },

  // ----------------------------------------------------------
  {
    slug: 'dscr',
    nav: 'DSCR Loans',
    schemaName: 'DSCR Rental Property Loans',
    title: 'DSCR Loans — Qualify on Rental Income, No W-2s | SGC',
    description:
      'DSCR loans up to 80% LTV from 5.75%. Qualify on rental income — no W-2s or tax returns. $75K–$2MM, 30-year fixed, min FICO 660.',
    h1: 'DSCR Loans: Qualify on Rental Income, Not Your W-2',
    eyebrow: 'Program 02 · Rental Portfolio',
    lede:
      'Long-term financing for rental property, underwritten on the property\'s cash flow. No W-2s, no tax returns, no personal debt-to-income test, and no cap on how many properties you own.',
    metrics: [
      ['Max LTV', '80%'],
      ['From', '5.75%'],
      ['Term', '30-yr fixed'],
      ['Min FICO', '660'],
    ],
    sections: [
      {
        h2: 'Who this program is for',
        html: `<p>DSCR stands for Debt Service Coverage Ratio, and the entire product exists to solve one problem: conventional mortgage underwriting was designed for a salaried employee buying a house to live in, and it breaks down the moment you start building a portfolio.</p>
        <p>It breaks down if you are self-employed and your Schedule E deductions make your taxable income look modest. It breaks down if you hold property in LLCs, where the income never reaches a personal return in a form Fannie Mae recognizes. And it breaks down hard at the tenth financed property, where conventional lenders simply stop.</p>
        <p>A DSCR loan asks a different question. Not "how much do you earn?" but "does this property cover its own debt?" If the rent covers the payment, the loan works — whether it is your first rental or your fortieth.</p>`,
      },
      {
        h2: 'How DSCR is calculated',
        html: `<p>The ratio is net operating income divided by annual debt service. Net operating income is gross rent minus operating expenses — taxes, insurance, HOA dues, a management fee, and a vacancy reserve. It does not include the mortgage payment. Annual debt service is twelve months of principal and interest.</p>
        <p>A DSCR of 1.00 means the property breaks even. 1.25 means it produces 25% more income than the debt requires, which is where the best pricing lives. Our minimum on this program is <strong>1.05x</strong>, and ratios below that can still work at reduced leverage.</p>
        <p>Two things borrowers consistently get wrong when they run their own numbers. They use gross rent instead of net — which always overstates the ratio — and they assume zero vacancy and zero management fee because they self-manage. Underwriting deducts both regardless, because the ratio has to hold if you are not the one managing the property. Market rent comes from the appraiser's 1007 rent schedule; where a property is already leased we use the lease rate or appraised market rent, whichever the program allows.</p>`,
      },
      {
        h2: 'Terms at a glance',
        table: [
          ['Loan amount', '$75,000 – $2,000,000'],
          ['Maximum LTV', '80% (purchase); lower on cash-out'],
          ['Rates from', '5.75% — varies by DSCR, FICO, and LTV'],
          ['Minimum DSCR', '1.05x'],
          ['Minimum FICO', '660'],
          ['Projects ≤ $125K', '20% down required (80% LTC)'],
          ['Term', '30-year fixed; 5/6 and 7/6 ARMs available'],
          ['Income documentation', 'None — no W-2s, tax returns, or DTI test'],
          ['Property limit', 'No cap on financed properties'],
          ['Closing entity', 'LLC (standard) or individual'],
          ['Reserves', '9 months PITIA on the subject property'],
          ['Closing timeline', '4–5 weeks from a complete file'],
          ['States', '43 — excludes AZ, NV, ND, OR, SD, UT, VT'],
        ],
      },
      {
        h2: 'What qualifies as collateral',
        html: `<p>Single-family rentals, 2–4 unit properties, townhomes, warrantable condos, and small multi-family are all eligible. The property must be <strong>rent-ready or already tenanted</strong> — this is a long-term product, not a renovation loan. A property that needs work goes through a Fix &amp; Flip or Bridge loan first and refinances into DSCR once it is stabilized and leased. That two-step sequence is the backbone of the BRRRR strategy, and it is one of the most common paths our borrowers take.</p>
        <p>Short-term rentals are considered on a case-by-case basis, generally using documented trailing revenue rather than a long-term market rent estimate. Rural properties, unique construction, and anything with a thin comparable set take longer to underwrite and may see reduced leverage.</p>`,
      },
      {
        h2: 'Prepayment structure',
        html: `<p>DSCR loans carry a prepayment penalty in exchange for the long fixed term and the lower rate. The standard structures are a five-year step-down (5-4-3-2-1) or a three-year step-down. Buy-down options with no prepayment penalty are available at a higher rate.</p>
        <p>Choose deliberately. If the property is a genuine long-term hold, take the prepay and the lower rate. If you expect to sell or refinance inside three years, price the no-prepay option — a penalty on a $400,000 loan in year two costs far more than the rate difference.</p>`,
      },
    ],
    faqs: [
      {
        q: 'What DSCR ratio do I need to qualify?',
        a: 'Our minimum is 1.05x, meaning the property\'s net operating income covers 105% of the annual debt service. Ratios of 1.25x and above unlock the best rates and the highest leverage. Deals below 1.05x can sometimes be structured at reduced LTV, or by lowering the loan amount until the ratio clears.',
      },
      {
        q: 'Do you verify my personal income at all?',
        a: 'No. There are no W-2s, no tax returns, no pay stubs, and no personal debt-to-income calculation. We verify credit, liquid reserves, and the property\'s rental income. That is the whole point of the product.',
      },
      {
        q: 'Is there a limit on how many properties I can finance?',
        a: 'No. Conventional lending caps most investors at ten financed properties. DSCR lending has no such cap — each loan is underwritten against its own collateral, so portfolio size does not disqualify you.',
      },
      {
        q: 'Can I close a DSCR loan in my LLC?',
        a: 'Yes, and it is the standard. Most DSCR loans close in an LLC or other business entity. We will need your articles of organization, operating agreement, EIN letter, and a certificate of good standing from the state.',
      },
      {
        q: 'How long does a DSCR loan take to close?',
        a: 'Four to five weeks from a complete file. DSCR takes longer than our short-term products because it requires a full appraisal with a 1007 rent schedule, title work, and an insurance binder — the same third-party items a conventional loan needs, without the income documentation.',
      },
      {
        q: 'Can I use a DSCR loan to cash out equity?',
        a: 'Yes. Cash-out refinances are available at reduced leverage compared with a purchase. If cash-out is your primary goal, look at our dedicated Cash-Out Refinance program, which is built around that use case.',
      },
    ],
    testimonial: T_JENNIFER,
    related: [
      ['/blog/dscr-loans-explained.html', 'DSCR Loans Explained: How to Qualify Without W-2s', 'The full walkthrough, with a worked DSCR calculation.'],
      ['/brrrr-analyzer.html', 'BRRRR Analyzer', 'Model the buy-rehab-rent-refinance sequence before you make an offer.'],
      ['/blog/llc-docs-checklist.html', 'The LLC Doc Checklist', 'Every entity document your lender needs before you apply.'],
    ],
    crossSell: ['cash-out-refinance', 'fix-and-flip', 'multi-family'],
  },

  // ----------------------------------------------------------
  {
    slug: 'bridge',
    nav: 'Bridge Loans',
    schemaName: 'Bridge Loans for Real Estate Investors',
    title: 'Bridge Loans for Real Estate Investors | SGC',
    description:
      'Short-term bridge loans up to 75% LTV, 3–24 month terms, no prepayment penalty on most. Close in 2–3 weeks in 43 states.',
    h1: 'Bridge Loans for Real Estate Investors',
    eyebrow: 'Program 03 · Short-Term Capital',
    lede:
      'Short-term financing that closes on your timeline, not a bank\'s. Use it to take down a property now and put permanent financing in place once the situation is stable.',
    metrics: [
      ['Max LTV', '75%'],
      ['From', '8.25%'],
      ['Term', '3–24 mo'],
      ['Prepay', 'None on most'],
    ],
    sections: [
      {
        h2: 'When a bridge loan is the right tool',
        html: `<p>A bridge loan solves a timing problem. The deal is good, the exit is clear, but permanent financing cannot be in place by the closing date. Rather than lose the property, you close with short-term capital and refinance or sell on the other side.</p>
        <p>The recurring scenarios we fund:</p>
        <ul>
          <li><strong>Buy before you sell.</strong> You have equity in a property under contract but the sale has not closed. A bridge loan against the existing asset funds the new acquisition now.</li>
          <li><strong>Auction and short-fuse closings.</strong> Foreclosure auctions, tax sales, and estate sales routinely demand a 10–21 day close. No conventional lender operates on that clock.</li>
          <li><strong>Stabilizing before permanent debt.</strong> A partially vacant rental or a property mid-lease-up will not qualify for a DSCR loan yet. Bridge financing carries it through stabilization.</li>
          <li><strong>Loan maturity.</strong> An existing note is coming due and the takeout is not ready. A bridge refinance buys the months needed to execute properly instead of under duress.</li>
          <li><strong>Repositioning.</strong> A light value-add play — cosmetic work, re-tenanting, correcting a title or zoning issue — that makes the asset financeable at a better rate.</li>
        </ul>`,
      },
      {
        h2: 'How the loan is structured',
        html: `<p>Bridge loans are interest-only and secured by a first lien on the property. Leverage runs to <strong>75% of value</strong>, quoted against purchase price on an acquisition or against current appraised value on a refinance. Terms run three to twenty-four months — you pick the horizon that matches the exit, and there is no benefit to taking more term than you need since there is no prepayment penalty on most bridge loans.</p>
        <p>Unlike the Fix &amp; Flip program, a standard bridge loan does not include a rehab holdback. If your plan involves significant renovation, a fix and flip or construction loan is the better structure — it finances the work rather than only the acquisition.</p>
        <p>The single most important part of a bridge file is the <strong>exit</strong>. Underwriting spends most of its attention there: if the exit is a sale, we look at comparables and days on market; if it is a refinance, we look at whether the property will actually qualify for the takeout loan at the leverage you are counting on. A bridge loan with a vague exit is the one we decline.</p>`,
      },
      {
        h2: 'Terms at a glance',
        table: [
          ['Maximum LTV', '75% of purchase price or appraised value'],
          ['Rates from', '8.25% — varies by leverage, credit, and exit strength'],
          ['Total points', '2–4% of loan amount'],
          ['Term', '3–24 months'],
          ['Payment structure', 'Interest-only'],
          ['Lien position', 'First lien'],
          ['Prepayment penalty', 'None on most bridge loans'],
          ['Rehab financing', 'Not included — see Fix &amp; Flip'],
          ['Property types', 'Residential investment, 1–4 unit, small multi-family'],
          ['Closing timeline', '2–3 weeks from a complete file'],
          ['States', '43 — excludes AZ, NV, ND, OR, SD, UT, VT'],
        ],
      },
      {
        h2: 'What we need to issue terms',
        html: `<p>A bridge quote takes very little. Send the property address, what you are paying or what you owe, current condition and occupancy, and — most importantly — one paragraph describing the exit and its timeline. If the exit is a refinance, tell us the product you expect to refinance into and at what leverage.</p>
        <p>From there the file needs entity documents, a payoff statement if we are refinancing an existing lien, and evidence you can carry the interest payments through the term. There is no credit pull to get a quote and no upfront fee.</p>`,
      },
      {
        h2: 'Cost of a bridge loan, honestly',
        html: `<p>Bridge capital costs more than a bank loan, and it should — you are paying for speed and certainty. On a $300,000 bridge loan at 9.5% with 2 points held for six months, the all-in cost is roughly $6,000 in points plus about $14,250 in interest, before title and closing costs.</p>
        <p>Whether that is expensive depends entirely on the alternative. If the deal produces $70,000 in profit and the only other option was losing it to a cash buyer, twenty thousand dollars of capital cost is an excellent trade. If the margin is thin and the timeline is uncertain, it is not. Run that arithmetic before you close, not after.</p>`,
      },
    ],
    faqs: [
      {
        q: 'How is a bridge loan different from a fix and flip loan?',
        a: 'A fix and flip loan includes a rehab holdback and funds renovation draws; leverage is quoted against purchase plus rehab. A bridge loan finances acquisition or refinance only, with no construction component. If you are renovating, take the fix and flip product — it finances the work.',
      },
      {
        q: 'How fast can a bridge loan close?',
        a: 'Two to three weeks from a complete file is typical, with approval decisions in 24–48 hours. Bridge loans are our most frequently expedited product because the borrower is usually working against a hard deadline; when title is already open we have closed considerably faster.',
      },
      {
        q: 'Is there a prepayment penalty on a bridge loan?',
        a: 'There is no prepayment penalty on most bridge loans. Interest accrues on the outstanding balance for the months the loan is held, so paying off early genuinely reduces your cost. Take the term that matches your exit with some cushion — the longer term costs you nothing if you pay off sooner.',
      },
      {
        q: 'What loan-to-value can I get on a bridge loan?',
        a: 'Up to 75%, measured against the purchase price on an acquisition or the current appraised value on a refinance. Leverage depends on the property, your credit profile, and how clean the exit is.',
      },
      {
        q: 'Can I bridge a property I already own to buy another one?',
        a: 'Yes. A cash-out bridge against an existing property, using the proceeds to fund a new acquisition, is one of the most common uses of the product. Leverage is measured against the existing property\'s current value.',
      },
      {
        q: 'Do I need to have my permanent financing lined up first?',
        a: 'You do not need it approved, but you do need a credible plan. Underwriting evaluates whether the property will realistically qualify for your intended takeout at the leverage you are counting on. A bridge loan without a defensible exit is the file we decline most often.',
      },
    ],
    testimonial: T_MARCUS,
    related: [
      ['/blog/close-in-5-days.html', 'How to Close a Hard Money Loan Fast', 'What prepared borrowers do differently when the clock is running.'],
      ['/blog/llc-docs-checklist.html', 'The LLC Doc Checklist', 'Have these ready and a fast close becomes realistic.'],
      ['/blog/arv-explained.html', 'ARV 101: After-Repair Value', 'How underwriters test the value your exit depends on.'],
    ],
    crossSell: ['fix-and-flip', 'dscr', 'multi-family'],
  },

  // ----------------------------------------------------------
  {
    slug: 'new-construction',
    nav: 'New Construction',
    schemaName: 'New Construction Loans',
    title: 'New Construction Loans, On-Schedule Draws | SGC',
    description:
      'Ground-up construction loans to 85% LTC from 8.99%, with draws that fund on schedule. 6–18 month terms for residential builders in 43 states.',
    h1: 'New Construction Loans With On-Schedule Draws',
    eyebrow: 'Program 04 · Ground-Up',
    lede:
      'Ground-up residential construction financing to 85% of cost, structured around a real draw schedule — because a build stops the day a draw is late.',
    metrics: [
      ['Max LTC', '85%'],
      ['From', '8.99%'],
      ['Term', '6–18 mo'],
      ['Draws', 'On-schedule'],
    ],
    sections: [
      {
        h2: 'Who this program is for',
        html: `<p>Ground-up construction financing for investors and small builders putting up single-family homes, townhomes, and small multi-family. It covers the spec builder doing three to ten homes a year, the investor who bought a teardown or an infill lot, and the operator converting entitled land into a finished, saleable product.</p>
        <p>It is not a homeowner construction-to-permanent product. These are business-purpose loans on investment property, closed in an entity.</p>`,
      },
      {
        h2: 'How the loan is structured',
        html: `<p>Leverage is quoted against <strong>loan-to-cost</strong>: land basis plus hard costs plus eligible soft costs. Up to 85% LTC, capped separately at 70% of the appraised as-completed value. If you already own the lot free and clear, that equity typically counts toward your contribution, which is often what gets a builder to the maximum leverage.</p>
        <p>The loan funds in two parts. Land and closing costs fund at closing. Construction costs sit in a holdback and release in draws as work is completed and verified. Interest is charged only on the drawn balance, so the carrying cost ramps up with the build rather than starting at the full loan amount on day one.</p>
        <p>Terms run 6, 12, or 18 months. Choose the term against a realistic schedule including permit and inspection lag, not the contractor's optimistic one. Extensions are available but they cost money and attention; building in three months of cushion at closing is cheaper.</p>`,
      },
      {
        h2: 'Terms at a glance',
        table: [
          ['Maximum LTC', '85% (land + hard costs + eligible soft costs)'],
          ['Maximum as-completed LTV', '70% of as-completed value'],
          ['Total points', '2–4% of loan amount'],
          ['Rates from', '8.99% — varies by leverage, experience, and scope'],
          ['Loan amount', 'From $75,000'],
          ['Term', '6, 12, or 18 months; extensions available'],
          ['Structure', 'Draw-based holdback with inspection'],
          ['Interest', 'Charged on the drawn balance only'],
          ['Land equity', 'Owned lot equity counts toward borrower contribution'],
          ['Property types', 'Single-family, townhome, small multi-family'],
          ['Builder experience', 'Preferred — affects leverage and pricing'],
          ['Closing timeline', '2–3 weeks from a complete file'],
          ['States', '43 — excludes AZ, NV, ND, OR, SD, UT, VT'],
        ],
      },
      {
        h2: 'The draw schedule, and why it is the whole program',
        html: `<p>Every construction lender advertises draws. The difference is whether they fund on time. A late draw does not just delay a payment — it stops the job. Subs leave for another site, and getting them back can cost weeks even after the money arrives.</p>
        <p>Our draws are tied to defined completion milestones rather than a percentage guess. A typical residential schedule runs: site work and foundation, framing and dry-in, mechanical rough-in, insulation and drywall, interior finish and trim, final and certificate of occupancy. You submit a request against completed line items, an inspector verifies, and funds are wired.</p>
        <p>What keeps a draw on schedule from your side: request against <strong>completed, inspectable line items</strong>; submit dated photographs and the relevant invoices or lien waivers; and schedule the inspection before the work is finished rather than after. Builders who batch these steps get funded reliably; builders who submit a percentage and wait get questions.</p>`,
      },
      {
        h2: 'What we need to underwrite the file',
        html: `<p>A construction file is heavier than a flip file. Expect to provide the plans and specifications, a line-item budget with a contingency, the executed builder or general contractor agreement, evidence of permits (or the permit application status), the appraisal basis for as-completed value, and your build history with addresses and completion dates.</p>
        <p>Two things carry disproportionate weight. First, the <strong>budget contingency</strong> — a construction budget with no contingency line signals inexperience more clearly than anything else in the file. Five to ten percent is normal. Second, your <strong>completed build history</strong>. A builder with four finished homes gets materially better leverage and pricing than a first-time builder with the same plans on the same lot.</p>`,
      },
    ],
    faqs: [
      {
        q: 'How much of the construction cost will you finance?',
        a: 'Up to 85% of total cost — land basis, hard costs, and eligible soft costs — capped against 70% of the appraised as-completed value. Both tests have to clear. If you already own the lot, that equity typically counts toward your required contribution.',
      },
      {
        q: 'How often can I request a draw?',
        a: 'Most residential builds run five to seven draws over the term, tied to completion milestones rather than a calendar. There is no arbitrary limit — you request when a milestone is genuinely complete and inspectable, and requests are processed as they come in.',
      },
      {
        q: 'Do I pay interest on the full loan amount during construction?',
        a: 'No. Interest is charged only on the drawn balance. At closing you are carrying the land and closing costs; the payment increases as construction draws fund. That structure meaningfully lowers your carrying cost in the early months.',
      },
      {
        q: 'Do I need to be an experienced builder?',
        a: 'Experience is strongly preferred and it directly affects your leverage and rate. First-time builders can be funded, generally at lower LTC, and a strong licensed general contractor with a documented track record substantially offsets a thin personal build history.',
      },
      {
        q: 'What happens if the build runs past the loan term?',
        a: 'Extensions are available and are common on construction loans — weather, permits, and inspections rarely cooperate. They carry a fee, so the cheaper move is to take a longer term at closing than the schedule technically requires. Tell us early if the timeline is slipping; an extension arranged in advance is straightforward, one requested at maturity is not.',
      },
      {
        q: 'Can I refinance into a rental loan when the build is finished?',
        a: 'Yes. Builders who intend to hold the finished property routinely refinance the construction loan into our DSCR program once the home is complete and leased. Model that takeout before you close the construction loan so you know the as-completed value supports the permanent leverage you need.',
      },
    ],
    testimonial: T_DAVID,
    related: [
      ['/blog/construction-draw-schedule.html', 'Construction Draw Schedules: What to Expect', 'How draws are structured and how to keep your build on track.'],
      ['/blog/rehab-budget-guide.html', 'Scoping a Budget Your Lender Will Approve', 'Line-item budgeting that survives underwriting.'],
      ['/blog/llc-docs-checklist.html', 'The LLC Doc Checklist', 'Entity documents to have ready before you apply.'],
    ],
    crossSell: ['fix-and-flip', 'dscr', 'bridge'],
  },

  // ----------------------------------------------------------
  {
    slug: 'multi-family',
    nav: 'Multi-Family',
    schemaName: 'Multi-Family Bridge Loans (2–10 Units)',
    title: 'Multi-Family Loans, 2–10 Units | Southern Ground Capital',
    description:
      'Multi-family bridge loans for 2–10 unit properties. Up to 75% LTV, 6–24 month terms, asset-based underwriting in 43 states.',
    h1: 'Multi-Family Loans for 2–10 Unit Properties',
    eyebrow: 'Program 05 · Small Multi-Family',
    lede:
      'Flexible short-term financing for small multi-family, underwritten on the asset and its income — including properties that are vacant, mid-lease-up, or being repositioned.',
    metrics: [
      ['Max LTV', '75%'],
      ['Units', '2–10'],
      ['Term', '6–24 mo'],
      ['Type', 'Residential'],
    ],
    sections: [
      {
        h2: 'The gap this program fills',
        html: `<p>Small multi-family sits in an awkward place. Above four units, conventional residential lending stops. Below roughly twenty units, most agency and commercial lenders are not interested — the loan is too small to be worth their process. Meanwhile the asset itself is often exactly what a value-add investor wants: a twelve-unit building with rents thirty percent under market, or an eight-unit that has been half-vacant for a year.</p>
        <p>That is the gap this program fills. We underwrite the asset and its income potential, not a stabilized trailing twelve that a distressed building does not have yet.</p>`,
      },
      {
        h2: 'What we finance',
        html: `<p>Residential multi-family from two to twenty units: duplexes and fourplexes, small apartment buildings, townhome and rowhouse clusters under one ownership, and small portfolios of up to five single-family rentals financed together under one facility, provided they are in the same county.</p>
        <p>Occupancy is not a gate. We fund <strong>fully vacant buildings</strong> where the plan is to renovate and lease, <strong>partially occupied buildings</strong> mid-lease-up, and <strong>stabilized buildings</strong> where the borrower needs speed rather than the lowest rate. What matters is that the business plan and the timeline are coherent, and that the exit — sale or refinance into permanent debt — is realistic at the value the plan produces.</p>
        <p>Mixed-use with a substantial commercial component and true commercial multi-family above twenty units fall outside this program.</p>`,
      },
      {
        h2: 'Terms at a glance',
        table: [
          ['Unit count', '2–10 units'],
          ['Maximum LTV', '75%'],
          ['Total points', '2–4% of loan amount'],
          ['Term', '6–24 months'],
          ['Payment structure', 'Interest-only'],
          ['Occupancy', 'Vacant, partially occupied, or stabilized'],
          ['Underwriting basis', 'Asset value and income potential'],
          ['Property type', 'Residential multi-family'],
          ['Exit', 'Sale or refinance into permanent debt'],
          ['Closing timeline', '2–3 weeks from a complete file'],
          ['States', '43 — excludes AZ, NV, ND, OR, SD, UT, VT'],
        ],
      },
      {
        h2: 'How multi-family underwriting differs',
        html: `<p>A single-family flip is underwritten on comparable sales. A multi-family building is underwritten on <strong>income</strong>, and that changes what matters in your file.</p>
        <p>We look at the rent roll and lease expirations, the current versus market rent gap, actual operating expenses rather than a rule of thumb, the capital plan for bringing units to market rent, and where the property lands on both a cap-rate valuation and a comparable-sales basis. On a value-add deal, the underwriting question is whether your rent assumptions are supportable — a proforma showing every unit at market rent within six months invites scrutiny that a staged, realistic lease-up plan does not.</p>
        <p>The strongest small multi-family files we see share one trait: a unit-by-unit plan. Which units turn first, what each turn costs, what the new rent is, and when it is leased. That level of specificity moves leverage more than any other single thing you can send us.</p>`,
      },
      {
        h2: 'The typical path to permanent financing',
        html: `<p>Most borrowers use this program as the first half of a two-step. Short-term multi-family capital acquires and stabilizes the building; once it is leased and the income is documented, the property refinances into long-term debt. For two-to-four unit properties that permanent takeout is frequently our DSCR program. Above four units it is usually agency or a commercial lender, and the property needs several months of stabilized operating history to qualify.</p>
        <p>Plan that sequence before you close the short-term loan. The most common mistake on small multi-family is taking a twelve-month bridge on a building that realistically needs eighteen months to stabilize and season.</p>`,
      },
    ],
    faqs: [
      {
        q: 'Do you lend on vacant multi-family buildings?',
        a: 'Yes. Vacant and partially occupied buildings are core to this program — most value-add multi-family deals are distressed on the income side, which is exactly why conventional lenders pass on them. We underwrite the asset and the business plan rather than a stabilized trailing twelve.',
      },
      {
        q: 'What is the maximum number of units you will finance?',
        a: 'Twenty units under this program. Larger properties move into true commercial multi-family lending, which is a different product with different underwriting. If your deal is just over the line, send it anyway — we would rather look at it than have you guess.',
      },
      {
        q: 'How is leverage calculated on a value-add multi-family deal?',
        a: 'Up to 75% LTV. On an acquisition that is measured against purchase price; on a refinance, against current appraised value. Where a renovation budget is included, leverage is also tested against the as-stabilized value your plan produces, so both the entry and the exit have to support the loan.',
      },
      {
        q: 'Can I finance several single-family rentals under one loan?',
        a: 'Yes, up to five properties under one facility. They must all sit in the same county, and each property carries a defined lien release value so you can sell them off individually. It is considerably cleaner than running five separate closings — one set of documents, one closing cost, one payment.',
      },
      {
        q: 'What documents do you need on a multi-family deal?',
        a: 'The rent roll with lease expirations, trailing twelve-month operating statements where they exist, your renovation and lease-up plan with a unit-by-unit budget, entity documents, and your track record on similar assets. Where a building is vacant, the plan and the budget carry most of the file.',
      },
      {
        q: 'What happens when the term ends?',
        a: 'You either sell or refinance into permanent debt. For two-to-four unit properties that is often our DSCR program; above four units it is typically agency or a commercial lender, which will want several months of stabilized operating history. Build that seasoning requirement into the term you choose at closing.',
      },
    ],
    testimonial: T_JENNIFER,
    related: [
      ['/blog/dscr-loans-explained.html', 'DSCR Loans Explained', 'The most common permanent takeout for 2–4 unit properties.'],
      ['/blog/rehab-budget-guide.html', 'Scoping a Renovation Budget', 'Unit-by-unit budgeting that underwriting can verify.'],
      ['/blog/arv-explained.html', 'ARV 101: After-Repair Value', 'How as-stabilized value is tested on a value-add deal.'],
    ],
    crossSell: ['bridge', 'dscr', 'fix-and-flip'],
  },

  // ----------------------------------------------------------
  {
    slug: 'cash-out-refinance',
    nav: 'Cash-Out Refinance',
    schemaName: 'Cash-Out Refinance for Investment Properties',
    title: 'Cash-Out Refinance for Investment Property | SGC',
    description:
      'Cash-out refinance on investment property up to 80% LTV, 30-year fixed, min FICO 660, min DSCR 1.05x. No W-2s or tax returns.',
    h1: 'Cash-Out Refinance for Investment Properties',
    eyebrow: 'Program 06 · Unlock Equity',
    lede:
      'Pull equity out of a property you already own without selling it — underwritten on rental income, closed on a 30-year fixed, with no personal income documentation.',
    metrics: [
      ['Max LTV', '80%'],
      ['Min FICO', '660'],
      ['Term', '30-yr fixed'],
      ['Min DSCR', '1.05x'],
    ],
    sections: [
      {
        h2: 'What this program does',
        html: `<p>You own a rental with meaningful equity. You want that equity working in your next acquisition, not sitting idle in a property you have no intention of selling. A cash-out refinance replaces the existing loan with a larger one and hands you the difference at closing, in cash, tax-deferred — because loan proceeds are not income.</p>
        <p>Because this is investment-property lending, qualification runs on the property's cash flow rather than your personal finances. No W-2s, no tax returns, no debt-to-income test. The property has to carry the new, larger payment at a minimum DSCR of <strong>1.05x</strong>, and it has to appraise.</p>`,
      },
      {
        h2: 'How much cash you can actually take out',
        html: `<p>Leverage goes to <strong>80% of appraised value</strong>. What lands in your pocket is that figure minus the existing loan payoff and closing costs.</p>
        <p>A worked example. Your rental appraises at $400,000 and you owe $180,000. At 80% LTV the new loan is $320,000. Subtract the $180,000 payoff and roughly $9,000 in points and closing costs, and you net about <strong>$131,000</strong> at the table.</p>
        <p>Now check the DSCR, because the appraisal is only half the test. The new loan has to service itself. At 7% on a 30-year fixed, $320,000 carries a principal-and-interest payment near $2,130 a month, or about $25,560 a year. If the property's net operating income after taxes, insurance, vacancy, and management is $30,000, the DSCR is 1.17x and the deal clears comfortably. If NOI is $25,000, the ratio is 0.98x and the loan amount has to come down until it clears 1.05x — which means less cash out than the LTV alone suggested.</p>
        <p>Run both tests before you order an appraisal. Borrowers who only check LTV are the ones surprised at underwriting.</p>`,
      },
      {
        h2: 'Terms at a glance',
        table: [
          ['Maximum LTV', '80% of appraised value'],
          ['Minimum FICO', '660'],
          ['Projects ≤ $125K', '20% down required (80% LTC)'],
          ['Minimum DSCR', '1.05x on the new payment'],
          ['Term', '30-year fixed; ARM options available'],
          ['Rates', 'Priced off DSCR, FICO, and LTV'],
          ['Income documentation', 'None — no W-2s or tax returns'],
          ['Seasoning', 'Typically 6 months of ownership'],
          ['Property condition', 'Rent-ready or tenanted'],
          ['Closing entity', 'LLC (standard) or individual'],
          ['Use of proceeds', 'Unrestricted — business purpose'],
          ['Closing timeline', '4–5 weeks from a complete file'],
          ['States', '43 — excludes AZ, NV, ND, OR, SD, UT, VT'],
        ],
      },
      {
        h2: 'Seasoning and the BRRRR exit',
        html: `<p>Seasoning is how long you must have owned the property before we will refinance against its current appraised value rather than what you paid for it. Our standard is roughly six months of ownership.</p>
        <p>That number matters most to BRRRR investors. The strategy — buy, rehab, rent, refinance, repeat — depends on refinancing against the post-renovation value, not the distressed purchase price. Buy a house for $150,000, put $50,000 into it, and get it appraised at $280,000: at 80% LTV the refinance is $224,000 against a $200,000 basis, which returns your capital and then some. But that only works once the seasoning requirement is met and the property is leased with a signed lease in hand.</p>
        <p>Sequence it deliberately: acquire and renovate on a Fix &amp; Flip loan, lease the property, let the seasoning clock run, then refinance here. Our <a href="/brrrr-analyzer.html">BRRRR analyzer</a> models the whole sequence, including whether the refinance actually returns your capital, before you make the offer.</p>`,
      },
      {
        h2: 'What we need',
        html: `<p>The property address and current loan payoff, the lease or leases in place, the last twelve months of operating expenses, entity documents, and evidence of reserves — nine months of principal, interest, taxes, insurance, and association dues on the subject property. If you already carry open loans with us, plan on nine months of reserves for each of those as well as the new one. We order the appraisal, which includes a 1007 rent schedule establishing market rent.</p>
        <p>There is no credit pull to get a quote and no upfront fee. Send the numbers and we will tell you what the property supports before anyone spends money on third-party reports.</p>`,
      },
    ],
    faqs: [
      {
        q: 'How much equity can I take out of my rental property?',
        a: 'Up to 80% of appraised value, less the existing loan payoff and closing costs. The loan also has to clear a 1.05x minimum DSCR on the new payment, so on a lower-yielding property the cash-flow test — not the LTV — is often what caps your proceeds.',
      },
      {
        q: 'Do I have to document my personal income?',
        a: 'No. This is investment-property lending underwritten on the property\'s rental income. No W-2s, no tax returns, and no personal debt-to-income calculation. We verify credit, reserves, and the property\'s cash flow.',
      },
      {
        q: 'How long do I have to own the property before I can cash out?',
        a: 'Roughly six months of ownership seasoning is standard before we will lend against current appraised value rather than your purchase price. This is the constraint that sets the pace of a BRRRR strategy, so plan your timeline around it from the acquisition.',
      },
      {
        q: 'Is the cash I receive taxable?',
        a: 'Loan proceeds are not income, so a cash-out refinance is generally not a taxable event — which is precisely why investors prefer it to selling. This is general information, not tax advice; confirm the treatment of your specific situation with your CPA.',
      },
      {
        q: 'What can I use the money for?',
        a: 'Anything with a business purpose — most commonly the down payment on the next acquisition, a renovation on another property, or paying off higher-cost short-term debt. These are business-purpose loans, so the collateral property must be an investment property and cannot be your primary residence.',
      },
      {
        q: 'What credit score do I need?',
        a: 'A 660 minimum FICO. Higher scores improve both your rate and your maximum leverage. Credit matters more on this program than on our short-term products because it is a thirty-year loan being priced for the long term.',
      },
    ],
    testimonial: T_JENNIFER,
    related: [
      ['/blog/dscr-loans-explained.html', 'DSCR Loans Explained', 'How the cash-flow ratio behind this program is calculated.'],
      ['/brrrr-analyzer.html', 'BRRRR Analyzer', 'Model whether your refinance actually returns your capital.'],
      ['/blog/arv-explained.html', 'ARV 101: After-Repair Value', 'The valuation your cash-out amount depends on.'],
    ],
    crossSell: ['dscr', 'fix-and-flip', 'multi-family'],
  },
];

export const PROGRAM_BY_SLUG = Object.fromEntries(PROGRAMS.map((p) => [p.slug, p]));
