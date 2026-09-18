// ============================================================
// Copy for the /affiliates partner-program page.
//
// Owner decisions (2026-09-17), do not soften without asking:
//   - the share is a FLAT 30% of the origination fee, never a range
//     and never tiered. The 30% cap is enforced server-side in
//     netlify/functions/admin-update-lead.js.
//   - repeat business pays for as long as the borrower keeps coming
//     back to SGC. No expiry window.
//   - NO dollar examples anywhere on the page. A worked example would
//     show borrowers exactly what their referrer earned.
//
// REVIEW: Terms of Service section 11 reserves the right to modify or
// discontinue the program prospectively, which is what keeps the
// open-ended repeat promise workable. Counsel should confirm the two
// read together before this page is advertised.
// REVIEW: state-by-state licensing for PAYING referral fees is part of
// the open counsel question in legal.mjs. Real estate licensees are
// handled on-page (paid through the broker of record where required).
// ============================================================

export const AFFILIATE_FAQS = [
  {
    q: 'How much do I earn on a referral?',
    a: '<p>A flat 30% of the origination fee we collect on the loan. It is the same 30% on your first referral and on every one after it — there is no tier to climb and no volume you have to hit first.</p>',
  },
  {
    q: 'When do I get paid?',
    a: '<p>After the loan closes, funds, and the origination fee is collected. Referral compensation is earned on funded loans only — not on applications, approvals, or deals that fall apart before closing.</p>',
  },
  {
    q: 'Do I still get paid when my borrower comes back for another deal?',
    a: '<p>Yes. Investors rarely stop at one project. Every loan that borrower closes with us pays you the same 30%, for as long as they keep coming back.</p>',
  },
  {
    q: 'What if my borrower returns without using my link?',
    a: '<p>Returning borrowers usually come straight to us, and that is fine — we match a repeat borrower back to the partner who introduced them. If you think a deal was missed, tell us and we will check it against your referrals.</p>',
  },
  {
    q: 'Do I need a licence to refer deals?',
    a: '<p>No licence is required to introduce someone to us. If you already hold a real estate licence, we pay your broker of record wherever your state requires compensation to run through the brokerage. Affiliates never quote rates, negotiate terms, or take applications — you make the introduction, we handle the loan.</p>',
  },
  {
    q: 'What kind of deals can I send?',
    a: '<p>Business-purpose loans on investment property: fix and flip, DSCR rentals, bridge, new construction, multi-family up to ten units, and cash-out refinance. We lend in 43 states. We cannot help with a loan on the borrower\'s own home.</p>',
  },
  {
    q: 'Is there a limit on how many deals I can refer?',
    a: '<p>No. There is no cap on referrals and no cap on what you can earn in a year.</p>',
  },
];

export const AFFILIATE_PAGE = {
  path: '/affiliates',
  title: 'Affiliate Program | Southern Ground Capital',
  description:
    'Earn a flat 30% of our origination fee on every investment-property loan you refer — and on that borrower\'s repeat deals, as long as they come back.',
  h1: 'Send Us a Deal. Earn 30% of the Origination.',
  lede: 'Agents, wholesalers, brokers and anyone else with investors in their phone: introduce them to us, and you earn a flat 30% of the origination fee on every loan that closes — including the next one that borrower does, and the one after that.',

  metrics: [
    ['Your share', '30% flat'],
    ['Repeat deals', 'Paid again'],
    ['Paid', 'On funding'],
    ['Cost to join', 'Nothing'],
  ],

  sections: [
    {
      h2: 'What you earn',
      html: `        <p><strong>A flat 30% of the origination fee we collect on the funded loan.</strong> Not a range that depends on how the deal shakes out, and not a starter rate you have to earn your way out of. The same 30% applies to your first referral and your hundredth.</p>
        <p>Your compensation is a share of our origination — Southern Ground Capital is paid by one side of a deal, never both. What the borrower pays in points is set by the deal itself, exactly as it would be without a referral.</p>
        <p>Referral compensation is earned on loans that actually close and fund. Nothing is owed on an application, an approval, or a deal that dies at the closing table, and there is no cap on how many deals you send.</p>`,
    },
    {
      h2: 'Repeat business keeps paying',
      html: `        <p>Most referral programs pay you once and forget you. This one does not.</p>
        <p>An investor who finishes a flip starts looking for the next one, and the lender who closed the last deal on time usually gets the call. <strong>Every loan that borrower closes with us pays you the same 30%, for as long as they keep coming back.</strong> One introduction can pay for years.</p>
        <p>You do not have to police it. Repeat borrowers almost never click a referral link the second time, so we match a returning borrower to the partner who introduced them and credit the deal to you.</p>`,
    },
    {
      h2: 'How it works',
      html: `        <ol>
          <li><strong>Join.</strong> One short form below. It costs nothing, there is no volume commitment, and we send your referral link as soon as you are registered.</li>
          <li><strong>Share your link.</strong> Text it, email it, put it in a newsletter or a listing packet. Anyone who reaches us through it is tagged as yours. Prefer to introduce someone directly? Send them to us by name and we will tie the deal to you.</li>
          <li><strong>We take it from there.</strong> We quote without a credit pull, underwrite, and close. Your borrower deals with us, not a call centre, and you are never asked to explain a rate sheet.</li>
          <li><strong>You get paid.</strong> Once the loan funds and the origination is collected, your 30% is due. Your portal shows every click, lead, and closed deal, so you always know what is coming.</li>
        </ol>`,
    },
    {
      h2: 'Who this is for',
      html: `        <p>The partners who do best with us already talk to investors all day:</p>
        <ul>
          <li><strong>Real estate agents</strong> whose investor clients keep losing deals to cash offers</li>
          <li><strong>Wholesalers</strong> who need their buyers to actually close</li>
          <li><strong>Mortgage brokers</strong> whose borrowers fall outside conventional guidelines</li>
          <li><strong>Title and closing agents</strong> who see funding fall through</li>
          <li><strong>Contractors and GCs</strong> whose clients run out of rehab capital mid-project</li>
          <li><strong>Investors</strong> with a network, who already get asked where the money comes from</li>
        </ul>
        <p>If you hold a real estate licence, we pay your broker of record wherever your state requires compensation to run through the brokerage — tell us at registration and we will set it up that way.</p>`,
    },
    {
      h2: 'You will know where every deal stands',
      html: `        <p>Registered partners get a portal login. It shows the clicks on your link, every lead that came from it, where each one stands in underwriting, and what has closed. Nothing is hidden behind a monthly statement, and you never have to ask us for a status update.</p>
        <p><a href="/portal">Sign in to the partner portal</a> if you are already registered.</p>`,
    },
    {
      h2: 'The fine print, up front',
      html: `        <ul>
          <li>Compensation is earned on loans that close and fund, and is calculated as a flat 30% of the origination fee we collect.</li>
          <li>We need a W-9 before the first payout, and we issue a 1099-NEC once you pass $600 in a calendar year.</li>
          <li>Affiliates are independent. You are not an agent or employee of SGC, and you cannot quote rates, commit to terms, or speak for us.</li>
          <li>Business-purpose loans on non-owner-occupied property only. We cannot pay a referral fee on a loan secured by the borrower's own residence.</li>
          <li>We lend in 43 states — not in Arizona, Nevada, North Dakota, Oregon, South Dakota, Utah, or Vermont.</li>
          <li>The affiliate terms presented at registration govern the program, alongside our <a href="/terms-of-service">Terms of Service</a>.</li>
        </ul>`,
    },
  ],
};
