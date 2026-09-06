// ============================================================
// Legal / policy page content.
//
// !!! REVIEW: have an attorney review the Privacy Policy and the
// Terms of Service before treating them as final. They are drafted
// as standard business-purpose-lending website policies and
// describe what this site actually does, but they have not been
// reviewed by counsel.
//
// Section 3 of the Terms ("How your loan is funded") describes the
// dual model: SGC lends its own capital on some deals and arranges
// others through a capital partner, acting as an unlicensed
// intermediary on business-purpose, real-property-secured loans.
// Counsel should confirm two things against that description:
//   (a) whether any state SGC lends in requires a licence to ARRANGE
//       such a loan (California is the notable one not on the
//       excluded list), and
//   (b) whether any commercial financing disclosure statute reaches
//       these transactions or requires broker registration — several
//       states enacted these in 2022-2024, including Georgia; most
//       carve out financing secured by real property.
// The excluded states (AZ, NV, ND, OR, SD, UT, VT) already track the
// strictest business-purpose LENDER licensing regimes.
//
// Headings are renumbered by scripts/seo/build.mjs consumers only in
// the sense that they are hand-numbered here — if you insert a
// section, renumber the rest and check the "section N" cross-refs.
// ============================================================

const EFFECTIVE = 'February 1, 2026';

export const LEGAL_PAGES = [
  // ----------------------------------------------------------
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy | Southern Ground Capital',
    description:
      'How Southern Ground Capital collects, uses, and protects the information you submit through sgcapital.io. We do not sell personal information.',
    h1: 'Privacy Policy',
    updated: EFFECTIVE,
    intro:
      'This policy explains what information Southern Ground Capital, LLC collects through sgcapital.io, why we collect it, who we share it with, and the choices you have. It applies to this website and to the loan enquiry, affiliate, and newsletter forms on it.',
    body: `
      <!-- REVIEW: have attorney review before launch -->

      <h2>1. Who we are</h2>
      <p>Southern Ground Capital, LLC ("SGC", "we", "us") is a private lending firm based in Atlanta, Georgia that arranges and funds business-purpose loans secured by investment real estate. This policy is issued by Southern Ground Capital, LLC as the controller of the information described below.</p>
      <p>You can reach us about anything in this policy at <a href="mailto:loans@sgcapital.io">loans@sgcapital.io</a> or (678) 842-8084, or by post at Southern Ground Capital, LLC, Atlanta, Georgia, United States.</p>
      <!-- NOTE: city/state only by owner decision. Add a full street address here
           if one is ever published — it strengthens both the legal position and the
           site's trust signals, and Google Business Profile requires one. -->

      <h2>2. Information we collect</h2>
      <p><strong>Information you give us.</strong> When you submit a loan enquiry, apply, request a resource such as the Fix &amp; Flip checklist, register as an affiliate, or contact us, we collect what you provide. Depending on the form, that may include:</p>
      <ul>
        <li>Your name, email address, phone number, and business or entity name</li>
        <li>Property information — address, purchase price, renovation budget, estimated after-repair value, current loan balance, rent, and occupancy</li>
        <li>Deal information — loan amount sought, programme of interest, timeline, and your investing experience</li>
        <li>Entity documentation you choose to send us, such as articles of organisation or an operating agreement</li>
        <li>Any other information you include in a message to us</li>
      </ul>
      <p><strong>Information collected automatically.</strong> Like most websites, we and our service providers collect limited technical information when you visit: IP address, browser type and version, device type, operating system, referring page, the pages you view, and the dates and times of those visits. This is used for security, aggregate analytics, and to keep the site working.</p>
      <p><strong>Information we do not collect here.</strong> We do not collect Social Security numbers, dates of birth, bank account or card numbers, or credit report data through this website. Where information of that kind becomes necessary for a loan that is proceeding, it is collected through a secure channel outside this website and handled under the disclosures provided at that time.</p>

      <h2>3. Credit</h2>
      <p>Submitting an enquiry through this website does <strong>not</strong> authorise a credit pull, and we do not obtain a consumer credit report as part of quoting a deal. If a loan proceeds to underwriting and a credit report becomes necessary, we will tell you and obtain your authorisation first.</p>

      <h2>4. How we use information</h2>
      <p>We use the information described above to:</p>
      <ul>
        <li>Evaluate your deal, prepare a quote or term sheet, and respond to your enquiry</li>
        <li>Underwrite, document, close, and service a loan if one proceeds</li>
        <li>Send you the resource, checklist, or affiliate materials you requested</li>
        <li>Send you follow-up communications and, where you have opted in, occasional marketing emails</li>
        <li>Calculate and pay affiliate referral compensation where applicable</li>
        <li>Operate, secure, and improve this website</li>
        <li>Comply with legal, regulatory, anti-money-laundering, and recordkeeping obligations</li>
      </ul>

      <h2>5. We do not sell your personal information</h2>
      <p>Southern Ground Capital does not sell personal information, and does not share personal information with third parties for their own independent marketing purposes. We have not sold or shared personal information for cross-context behavioural advertising in the preceding twelve months.</p>

      <h2>6. Who we share information with</h2>
      <p>We share information only as needed to do the work you have asked us to do, or where the law requires it:</p>
      <ul>
        <li><strong>Capital and lending partners.</strong> We are a private lending firm that funds loans in partnership with institutional capital sources. Where your deal is placed with a funding partner, the deal and borrower information necessary to underwrite it is shared with that partner.</li>
        <li><strong>Service providers.</strong> Vendors that operate this site and our business on our behalf — website hosting, form processing, email delivery, customer records, document storage, and analytics — under contracts that limit their use of the information to providing those services.</li>
        <li><strong>Transaction participants.</strong> Where a loan proceeds, the appraiser, title or escrow company, insurance agent, and closing attorney involved in that transaction.</li>
        <li><strong>Legal and safety.</strong> Where required by law, subpoena, or regulator, or where necessary to protect our rights, our borrowers, or the public.</li>
        <li><strong>Business transfer.</strong> In connection with a merger, acquisition, financing, or sale of assets, subject to this policy continuing to apply to the information transferred.</li>
      </ul>

      <h2>7. Cookies and analytics</h2>
      <p>This site uses a small number of cookies and equivalent browser storage. Some are strictly necessary — for example, remembering that you dismissed the Spanish-language banner so it does not reappear on every page. Others support aggregate analytics that tell us which pages are read and where visitors arrive from.</p>
      <p>Most browsers let you refuse or delete cookies through their settings. Blocking cookies will not prevent you from using this site, though minor conveniences such as the dismissed-banner state will not persist. This site does not respond to Do Not Track signals, because no common standard for doing so has been adopted.</p>
      <!-- REVIEW: if a Meta Pixel, Google Ads tag, or other advertising pixel is ever added to this site, this section and section 5 must be revisited — advertising pixels can constitute "sharing" under several state privacy statutes. -->

      <h2>8. Marketing emails</h2>
      <p>If you request a resource or submit an enquiry, we may send you related follow-up communications. Every marketing email includes an unsubscribe link, and you can opt out at any time by using it or by emailing <a href="mailto:loans@sgcapital.io">loans@sgcapital.io</a>. Opting out of marketing does not stop transactional messages about a loan you have in progress.</p>

      <h2>9. Text messages</h2>
      <p>Where you provide a mobile number and consent to be contacted by text, we may send you messages about your enquiry or loan. Message and data rates may apply. Reply STOP to any message to opt out of further texts. Consent to receive texts is not a condition of any loan.</p>

      <h2>10. How long we keep information</h2>
      <p>We keep enquiry information for as long as needed to respond to it and for a reasonable period afterwards in case you return. Where a loan is originated, we keep the loan file for the period required by applicable lending, tax, and recordkeeping law. You may ask us to delete information we are not required to retain.</p>

      <h2>11. Security</h2>
      <p>We use commercially reasonable administrative and technical safeguards to protect the information we hold, including encryption in transit across this website. No method of transmission or storage is completely secure, and we cannot guarantee absolute security. Please do not send sensitive documents by unencrypted email; ask us for a secure upload link instead.</p>

      <h2>12. Your choices and rights</h2>
      <p>You may ask us to access, correct, or delete the personal information we hold about you, or to stop sending you marketing, by emailing <a href="mailto:loans@sgcapital.io">loans@sgcapital.io</a>. Residents of states with comprehensive privacy statutes — including California, Colorado, Connecticut, Virginia, Texas, and others — may have additional statutory rights, including the right to know what information is collected and the right to appeal a refused request. We honour these requests regardless of where you live, and we will not discriminate against you for exercising them. We will verify your identity before acting on a request.</p>

      <h2>13. Children</h2>
      <p>This site is directed to real estate investors and is not intended for anyone under 18. We do not knowingly collect information from children. If you believe a child has provided us information, contact us and we will delete it.</p>

      <h2>14. Third-party links</h2>
      <p>This site links to third-party websites and tools. We are not responsible for their privacy practices, and this policy does not apply to them. Read their policies before providing information.</p>

      <h2>15. Changes to this policy</h2>
      <p>We may update this policy from time to time. The effective date at the top of this page reflects the most recent version. Material changes will be signalled by updating that date and, where appropriate, by direct notice.</p>

      <h2>16. Contact</h2>
      <p>Questions, requests, or complaints about this policy:<br />
      Southern Ground Capital, LLC<br />
      Atlanta, Georgia, United States<br />
      <a href="mailto:loans@sgcapital.io">loans@sgcapital.io</a> &middot; <a href="tel:+16788428084">(678) 842-8084</a></p>
    `,
  },

  // ----------------------------------------------------------
  {
    slug: 'terms-of-service',
    title: 'Terms of Service | Southern Ground Capital',
    description:
      'The terms governing your use of sgcapital.io, including that nothing on this site is a commitment to lend and all loans are business-purpose only.',
    h1: 'Terms of Service',
    updated: EFFECTIVE,
    intro:
      'These terms govern your use of sgcapital.io. By using this website or submitting information through it, you agree to them. If you do not agree, please do not use the site.',
    body: `
      <!-- REVIEW: have attorney review before launch -->

      <h2>1. Who these terms are with</h2>
      <p>This website is operated by Southern Ground Capital, LLC ("SGC", "we", "us"), a private lending firm based in Atlanta, Georgia. "You" means anyone who accesses this site or submits information through it.</p>

      <h2>2. Nothing here is a commitment to lend</h2>
      <p>This is the most important term on this page. Rates, terms, leverage limits, loan amounts, timelines, and programme descriptions published on this website are <strong>illustrative and subject to change without notice</strong>. They are not an offer, a commitment, or a guarantee of credit.</p>
      <p>No loan exists until SGC or its funding partner issues a written commitment and the loan closes. Submitting an enquiry, receiving a quote, or receiving a term sheet does not create a binding obligation on either party. Every loan remains subject to full underwriting, third-party reports including appraisal and title, satisfactory property condition, verification of the information you provided, and final credit approval.</p>

      <h2>3. How your loan is funded</h2>
      <p>Southern Ground Capital funds some loans with its own capital and arranges others through one of its institutional capital partners. Which route a given deal takes depends on the property, the programme, the loan size, and the state — and it is determined during underwriting, not at enquiry.</p>
      <p>Where a loan is funded by a capital partner, SGC arranges and facilitates the transaction between you and that partner and is compensated for that work. <strong>On any given transaction SGC is compensated by one side only</strong> — either through origination points charged to the borrower, or by the funding partner — never by both on the same loan.</p>
      <p>Origination points vary by deal, programme, leverage, credit profile, and funding source. <strong>All points and fees payable by you are set out in the written term sheet and commitment you receive before you incur any third-party cost, and are itemised again on the closing statement.</strong> SGC charges no application fee, no underwriting deposit, and no fee of any kind payable before closing, and adds nothing to the terms you were quoted. The identity of the funding source and the final terms are disclosed to you in the written commitment and the loan documents before closing.</p>
      <p>SGC is not a retail mortgage broker and does not originate consumer mortgage loans. See section 4 below.</p>

      <h2>4. Business-purpose loans on investment property only</h2>
      <p>SGC makes loans <strong>for business and investment purposes only</strong>, secured by non-owner-occupied real property. We do not make consumer loans, and we do not lend on a property that is or will be occupied as the borrower's primary residence or second home.</p>
      <p>Because these are business-purpose loans, they are generally not subject to the consumer mortgage protections that apply to owner-occupied lending, including many disclosure requirements under the Truth in Lending Act and the Real Estate Settlement Procedures Act. You should understand that distinction before borrowing.</p>
      <p>Loans close in a business entity. You represent that any loan you seek is for a genuine business or investment purpose and that the collateral will not be owner-occupied.</p>

      <h2>5. Where we lend</h2>
      <p>SGC lends in 43 U.S. states. We do not currently lend in Arizona, Nevada, North Dakota, Oregon, South Dakota, Utah, or Vermont. Programme availability, terms, and requirements vary by state and by property, and nothing on this site should be read as an offer to lend where we are not authorised to do so.</p>
      <!-- REVIEW: state licensing disclosures. Confirm with counsel whether any state in which SGC lends requires a licence disclosure, an NMLS identifier, or specific advertising language for business-purpose lending, and insert the required text here. -->

      <h2>6. Accuracy of information you provide</h2>
      <p>You agree that the information you submit is true, accurate, and complete, and that you have the authority to submit it. Deal decisions are made in reliance on what you tell us. Material misstatements — an inflated after-repair value, an understated renovation scope, an undisclosed lien, a misrepresented occupancy — are grounds for withdrawing a quote or commitment, and may have legal consequences.</p>

      <h2>7. Use of this website</h2>
      <p>You may use this site for your own legitimate business purposes. You may not: use it unlawfully; attempt to gain unauthorised access to any part of it or to any system connected to it; scrape, harvest, or systematically extract its content; introduce malicious code; interfere with its operation; or use its content to build a competing service.</p>

      <h2>8. Tools and calculators</h2>
      <p>The BRRRR analyzer, checklists, worked examples, and any other calculators or tools on this site are provided for general informational purposes. Their outputs are estimates based on the assumptions you enter, not underwriting decisions, appraisals, or predictions of what any lender will approve. Do not rely on them as the sole basis for an investment decision.</p>

      <h2>9. Not professional advice</h2>
      <p>Content on this site — including articles, guides, market commentary, and worked examples — is general information about real estate finance. It is not legal, tax, accounting, appraisal, or investment advice, and it is not tailored to your circumstances. Real estate investing carries risk, including the loss of your invested capital. Consult your own attorney, CPA, and advisors before acting.</p>

      <h2>10. Testimonials and case studies</h2>
      <p>Borrower testimonials and deal case studies on this site reflect the experience of specific borrowers on specific transactions. They are not typical results, not a guarantee, and not a prediction of what your deal will do. Outcomes depend on the property, the market, the execution, and factors outside anyone's control.</p>

      <h2>11. Affiliate programme</h2>
      <p>Participation in the SGC affiliate or referral programme is governed by the separate terms presented at registration. Referral compensation is payable only on loans that actually close and fund, is calculated as described in those terms, and may be modified or discontinued prospectively. Affiliates are independent, are not agents or employees of SGC, and may not quote rates or terms, make commitments, or represent themselves as speaking for SGC.</p>

      <h2>12. Intellectual property</h2>
      <p>The content, design, text, graphics, logos, and marks on this site are owned by Southern Ground Capital, LLC or its licensors and are protected by copyright and trademark law. You may view and print pages for your own reference. You may not republish, redistribute, or use them commercially without our written permission.</p>

      <h2>13. Third-party links</h2>
      <p>This site links to third-party sites and tools we do not control. We provide those links for convenience and do not endorse or take responsibility for their content, accuracy, or practices.</p>

      <h2>14. Disclaimer of warranties</h2>
      <p>This website and its content are provided "as is" and "as available", without warranties of any kind, express or implied, including implied warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement. We do not warrant that the site will be uninterrupted, error-free, or free of harmful components.</p>

      <h2>15. Limitation of liability</h2>
      <p>To the fullest extent permitted by law, Southern Ground Capital, LLC and its members, officers, employees, and agents will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost opportunities, or lost data, arising out of your use of this website or reliance on its content — even if advised of the possibility. Some jurisdictions do not allow these exclusions, in which case they apply to the maximum extent permitted.</p>

      <h2>16. Indemnity</h2>
      <p>You agree to indemnify and hold harmless Southern Ground Capital, LLC from claims, losses, and expenses (including reasonable legal fees) arising out of your misuse of this site, your breach of these terms, or your submission of inaccurate information.</p>

      <h2>17. Privacy</h2>
      <p>Our handling of information you submit is described in the <a href="/privacy-policy">Privacy Policy</a>, which is incorporated into these terms.</p>

      <h2>18. Governing law</h2>
      <p>These terms are governed by the laws of the State of Georgia, without regard to its conflict-of-laws rules. Any dispute arising out of these terms or your use of this site will be brought exclusively in the state or federal courts located in Fulton County, Georgia, and you consent to their jurisdiction.</p>
      <!-- REVIEW: confirm venue and whether an arbitration clause and class-action waiver should be added. -->

      <h2>19. Changes</h2>
      <p>We may revise these terms at any time by posting an updated version to this page. The effective date at the top reflects the current version. Continuing to use the site after a change means you accept the revised terms.</p>

      <h2>20. Severability and entire agreement</h2>
      <p>If any provision of these terms is held unenforceable, the remainder stays in effect. These terms, together with the Privacy Policy, are the entire agreement between you and SGC regarding this website. They do not govern any loan — a loan is governed by its own executed documents, which control in the event of any conflict.</p>

      <h2>21. Contact</h2>
      <p>Southern Ground Capital, LLC<br />
      Atlanta, Georgia, United States<br />
      <a href="mailto:loans@sgcapital.io">loans@sgcapital.io</a> &middot; <a href="tel:+16788428084">(678) 842-8084</a></p>
    `,
  },

  // ----------------------------------------------------------
  {
    slug: 'accessibility',
    title: 'Accessibility Statement | Southern Ground Capital',
    description:
      'Southern Ground Capital works to keep sgcapital.io usable for everyone, targeting WCAG 2.1 Level AA. Tell us if something is not working for you.',
    h1: 'Accessibility Statement',
    updated: EFFECTIVE,
    intro:
      'Southern Ground Capital wants every real estate investor to be able to use this site, evaluate our loan programmes, and submit a deal — regardless of how they browse the web.',
    body: `
      <h2>Our commitment</h2>
      <p>We aim to meet <strong>WCAG 2.1 Level AA</strong> across sgcapital.io. That standard is the benchmark most widely referenced for web accessibility in the United States, and it is the target we build and review against.</p>

      <h2>What we have done</h2>
      <ul>
        <li><strong>Keyboard access.</strong> Every interactive element — navigation, menus, forms, calculators, and expandable sections — can be reached and operated with a keyboard alone, and a visible focus indicator shows where you are.</li>
        <li><strong>Skip link.</strong> A "Skip to content" link is the first focusable element on every page, so keyboard and screen reader users can bypass the navigation.</li>
        <li><strong>Semantic structure.</strong> Pages use real headings in a logical order, one main heading per page, landmark regions, and list markup, so assistive technology can convey the structure of a page rather than a wall of text.</li>
        <li><strong>Text alternatives.</strong> Meaningful images carry descriptive alternative text; decorative graphics and icons are hidden from assistive technology so they do not add noise.</li>
        <li><strong>Colour and contrast.</strong> Text and interface colours are chosen to meet the AA contrast ratios, and colour is never the only way information is conveyed.</li>
        <li><strong>Forms.</strong> Every field has a visible, programmatically associated label, and validation errors are presented in text next to the field rather than by colour alone.</li>
        <li><strong>Motion.</strong> Animation is limited and decorative. The site respects the operating system's reduced-motion preference, and the hero background video is muted, non-essential, and hidden on small screens.</li>
        <li><strong>Zoom and responsive layout.</strong> Content reflows and remains usable at 200% zoom and on small screens without horizontal scrolling.</li>
        <li><strong>Language.</strong> Pages declare their language, and a full Spanish version of the homepage is available at <a href="/es.html">sgcapital.io/es</a>.</li>
      </ul>

      <h2>Known limitations</h2>
      <p>We test with keyboard navigation, automated tooling, and screen readers, but no site is ever finished. Areas we are actively working on:</p>
      <ul>
        <li>Third-party PDF resources, such as downloadable checklists, are not yet fully tagged for screen readers. If you need one of these in an accessible format, email us and we will provide it.</li>
        <li>The Spanish version of the site currently covers the homepage. Programme, geographic, and article pages are English-only while translation is in progress.</li>
        <li>Some data-dense tables in our articles require horizontal scrolling on very small screens.</li>
      </ul>

      <h2>Tell us if something does not work</h2>
      <p>If you encounter a barrier on this site — a page you cannot navigate, a form you cannot complete, content a screen reader will not read — please tell us. We treat accessibility reports as bugs, not feedback, and we will get back to you.</p>
      <p>Email <a href="mailto:loans@sgcapital.io">loans@sgcapital.io</a> or call <a href="tel:+16788428084">(678) 842-8084</a>. If you can, include the page address, what you were trying to do, and the browser and assistive technology you were using. We aim to respond within two business days.</p>

      <h2>Another way to reach us</h2>
      <p>You never have to use this website to do business with us. If any part of it is not working for you, call <a href="tel:+16788428084">(678) 842-8084</a> or email <a href="mailto:loans@sgcapital.io">loans@sgcapital.io</a> and a loan specialist will take your deal details directly and walk you through the process by phone.</p>
    `,
  },
];
