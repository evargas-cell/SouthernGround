// ============================================================
// Renders every generated SEO page and regenerates sitemap.xml.
//
//   node scripts/seo/build.mjs
//
// Output is committed static HTML — Netlify has no build step.
// Re-run this after editing programs.mjs, geos.mjs, legal.mjs or
// site.mjs, then commit the changed HTML alongside the source.
// ============================================================

import { writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SITE,
  head,
  header,
  footer,
  breadcrumbs,
  breadcrumbSchema,
  faqSchema,
  faqBlock,
  organizationSchema,
  jsonLd,
  ctaBand,
  testimonialBlock,
  termsTable,
  relatedLinks,
  stripTags,
} from './site.mjs';
import { PROGRAMS, PROGRAM_BY_SLUG } from './programs.mjs';
import { GEOS, TESTIMONIALS } from './geos.mjs';
import { LEGAL_PAGES } from './legal.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const written = [];

// Internal notes live in the generator source, not in shipped page source.
// scripts/seo/check.mjs and the README track what is still outstanding.
function stripInternalNotes(html) {
  return html.replace(/[ \t]*<!--\s*(?:REVIEW|NOTE):[\s\S]*?-->\n?/g, '');
}

function write(relPath, html) {
  if (relPath.endsWith('.html')) html = stripInternalNotes(html);
  const full = resolve(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html, 'utf8');
  written.push(relPath);
}

function serviceSchema(p) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: p.schemaName,
    serviceType: p.schemaName,
    description: stripTags(p.description),
    url: `${SITE.origin}/loans/${p.slug}`,
    provider: organizationSchema(),
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    audience: {
      '@type': 'BusinessAudience',
      name: 'Real estate investors',
    },
  };
}

// ---------- the Atlanta case study, reused on the GA/Atlanta pages ----------

const ATLANTA_DEAL = `        <div class="deal-card deal-card--inline">
          <div class="deal-card-header">
            <div class="deal-badge">Fix &amp; Flip &middot; Atlanta, GA</div>
            <div class="deal-result">Closed in <strong>12 days</strong></div>
          </div>
          <div class="deal-ledger">
            <div class="ledger-row"><span class="ledger-label">Purchase Price</span><span class="ledger-value">$285,000</span></div>
            <div class="ledger-row"><span class="ledger-label">Renovation Budget</span><span class="ledger-value">$65,000</span></div>
            <div class="ledger-row ledger-row--sub"><span class="ledger-label">Total Cost (LTC Basis)</span><span class="ledger-value">$350,000</span></div>
            <div class="ledger-row"><span class="ledger-label">After Repair Value (ARV)</span><span class="ledger-value">$480,000</span></div>
            <div class="ledger-divider"></div>
            <div class="ledger-row ledger-row--highlight"><span class="ledger-label">SGC Loan Amount (88% LTC)</span><span class="ledger-value text-gold">$308,000</span></div>
            <div class="ledger-row"><span class="ledger-label">Rate / Points</span><span class="ledger-value">9.75% / 2 pts</span></div>
            <div class="ledger-divider"></div>
            <div class="ledger-row ledger-row--profit"><span class="ledger-label">Investor Net Profit (est.)</span><span class="ledger-value text-gold">$94,000+</span></div>
          </div>
        </div>
`;

// ============================================================
// 1. Loan program pages
// ============================================================

function renderProgram(p) {
  const path = `/loans/${p.slug}`;
  const trail = [
    ['Home', '/'],
    ['Loan Programs', '/loans/'],
    [stripTags(p.nav), null],
  ];

  const metrics = p.metrics
    .map(
      ([l, v]) =>
        `            <div class="metric"><span class="metric-l">${l}</span><span class="metric-v">${v}</span></div>`
    )
    .join('\n');

  const body = p.sections
    .map((s, i) => {
      const id = `sec-${i + 1}`;
      const inner = s.table
        ? termsTable(`${stripTags(p.nav)} loan terms`, s.table)
        : `        ${s.html.trim()}\n`;
      return `      <section class="prose-section" aria-labelledby="${id}">
        <h2 id="${id}">${s.h2}</h2>
${inner}      </section>`;
    })
    .join('\n\n');

  const cross = p.crossSell
    .map((slug) => {
      const o = PROGRAM_BY_SLUG[slug];
      return `          <li><a href="/loans/${o.slug}">${o.nav}</a><span>${stripTags(o.lede).slice(0, 110)}…</span></li>`;
    })
    .join('\n');

  return (
    head({
      title: p.title,
      description: p.description,
      path,
      schemas: [
        jsonLd(serviceSchema(p)),
        jsonLd(faqSchema(p.faqs)),
        jsonLd(breadcrumbSchema(trail)),
      ],
    }) +
    header() +
    breadcrumbs(trail) +
    `
  <main id="main">

    <section class="page-hero" aria-labelledby="page-h1">
      <div class="container page-hero-inner">
        <p class="section-eyebrow section-eyebrow--light">${p.eyebrow}</p>
        <h1 id="page-h1" class="page-hero-title">${p.h1}</h1>
        <p class="page-hero-lede">${p.lede}</p>
        <div class="program-metrics program-metrics--hero">
${metrics}
        </div>
        <div class="page-hero-ctas">
          <a href="/apply" class="btn btn-gold btn-lg">Get My Free Quote</a>
          <a href="${SITE.phoneHref}" class="btn btn-ghost-gold btn-lg">Call ${SITE.phone}</a>
        </div>
        <p class="page-hero-note">No credit pull to quote &middot; No upfront fees &middot; Approval in 24–48 hours</p>
      </div>
    </section>

    <div class="prose-wrap section--white">
      <div class="container prose-container">
${body}
      </div>
    </div>

` +
    testimonialBlock(p.testimonial) +
    faqBlock(p.faqs) +
    `    <section class="related-links section--white" aria-labelledby="cross-heading">
      <div class="container">
        <h2 id="cross-heading" class="section-heading">Other Programs</h2>
        <ul class="related-links-list" role="list">
${cross}
        </ul>
      </div>
    </section>

` +
    relatedLinks('Keep Reading', p.related) +
    ctaBand(
      `Ready to Fund Your ${stripTags(p.nav)} Deal?`,
      'Submit the property and we will come back with terms in 24–48 hours. No credit pull. No upfront fees.'
    ) +
    `  </main>

` +
    footer()
  );
}

for (const p of PROGRAMS) write(`loans/${p.slug}.html`, renderProgram(p));

// ============================================================
// 2. /loans index
// ============================================================

function renderLoansIndex() {
  const path = '/loans/';
  const trail = [
    ['Home', '/'],
    ['Loan Programs', null],
  ];

  const cards = PROGRAMS.map((p, i) => {
    const metrics = p.metrics
      .map(
        ([l, v]) =>
          `              <div class="metric"><span class="metric-l">${l}</span><span class="metric-v">${v}</span></div>`
      )
      .join('\n');
    return `          <article class="program-card" aria-labelledby="p${i}-h">
            <div class="program-card-top">
              <span class="program-num">0${i + 1}</span>${
                i === 0 ? '\n              <span class="program-tag">Most Popular</span>' : ''
              }
            </div>
            <h3 id="p${i}-h" class="program-name"><a href="/loans/${p.slug}">${p.nav}</a></h3>
            <p class="program-desc">${p.lede}</p>
            <div class="program-metrics">
${metrics}
            </div>
            <a href="/loans/${p.slug}" class="btn btn-outline-gold btn-full">${p.nav} Details &rarr;</a>
          </article>`;
  }).join('\n\n');

  const faqs = [
    {
      q: 'Which loan program is right for my deal?',
      a: 'Buying to renovate and sell — Fix &amp; Flip. Buying or holding a rental long term — DSCR. Need to close fast with a clear exit and no renovation — Bridge. Building from the ground up — New Construction. Two to twenty units — Multi-Family. Pulling equity out of something you already own — Cash-Out Refinance. If your deal spans two of these, call us; the right structure is often a short-term loan that refinances into a long-term one.',
    },
    {
      q: 'Can I have more than one SGC loan at a time?',
      a: 'Yes. Many of our borrowers run several projects concurrently, and portfolio structures that finance multiple properties under one facility are available. There is no cap on the number of properties you finance with us.',
    },
    {
      q: 'What do all of these programs have in common?',
      a: 'No credit pull to get a quote, no upfront fees of any kind, approval decisions in 24–48 hours, closing in a business entity, investment property only, and lending in 43 states — excluding AZ, NV, ND, OR, SD, UT, and VT.',
    },
    {
      q: 'Do rates and terms differ by state?',
      a: 'No. Pricing is driven by leverage, credit, property, and experience — not geography. There is no surcharge for lending outside Georgia and no discount for lending inside it.',
    },
  ];

  return (
    head({
      title: 'Loan Programs &amp; Rates | Southern Ground Capital',
      description:
        'Six hard money loan programs for real estate investors: fix & flip, DSCR, bridge, new construction, multi-family, and cash-out refinance.',
      path,
      schemas: [jsonLd(faqSchema(faqs)), jsonLd(breadcrumbSchema(trail))],
    }) +
    header() +
    breadcrumbs(trail) +
    `
  <main id="main">

    <section class="page-hero" aria-labelledby="page-h1">
      <div class="container page-hero-inner">
        <p class="section-eyebrow section-eyebrow--light">6 Programs &middot; 43 States</p>
        <h1 id="page-h1" class="page-hero-title">Loan Programs for Real Estate Investors</h1>
        <p class="page-hero-lede">Every program below is asset-based, business-purpose, and built around how investors actually operate. Pick the one that matches your deal — or call us and we will tell you which structure fits.</p>
        <div class="page-hero-ctas">
          <a href="/apply" class="btn btn-gold btn-lg">Get My Free Quote</a>
          <a href="${SITE.phoneHref}" class="btn btn-ghost-gold btn-lg">Call ${SITE.phone}</a>
        </div>
        <p class="page-hero-note">No credit pull to quote &middot; No upfront fees &middot; Approval in 24–48 hours</p>
      </div>
    </section>

    <section class="loan-programs section--white" aria-labelledby="programs-heading">
      <div class="container">
        <h2 id="programs-heading" class="section-heading">Compare the Six Programs</h2>
        <div class="programs-grid">

${cards}

        </div>

        <div class="rates-note" id="rates">
          <div class="rates-note-inner">
            <div class="rates-note-text">
              <strong>Typical Rates &amp; Fees</strong>
              <p>Fix &amp; Flip from 7.73%* &middot; Bridge from 8.25% &middot; DSCR from 5.75%. Total points: 2–4% of loan amount. No prepayment penalties on most short-term programs. No upfront fees of any kind. *Rates vary by LTV, credit, and deal profile.</p>
            </div>
            <a href="/apply" class="btn btn-gold">Get My Rate Quote</a>
          </div>
        </div>
      </div>
    </section>

` +
    faqBlock(faqs) +
    `    <section class="related-links section--white" aria-labelledby="geo-heading">
      <div class="container">
        <h2 id="geo-heading" class="section-heading">Where We Lend</h2>
        <ul class="related-links-list" role="list">
${GEOS.map(
  (g) =>
    `          <li><a href="/hard-money-loans/${g.slug}">Hard Money Loans in ${g.location}</a><span>${stripTags(g.lede).slice(0, 120)}…</span></li>`
).join('\n')}
          <li><a href="/apply">Lending in 43 states</a><span>Excludes ${SITE.excludedStates}. Ask us about your market.</span></li>
        </ul>
      </div>
    </section>

` +
    ctaBand(
      'Not Sure Which Program Fits?',
      'Send us the deal. We will tell you which structure works and what the terms look like — in 24–48 hours.'
    ) +
    `  </main>

` +
    footer()
  );
}

write('loans/index.html', renderLoansIndex());

// ============================================================
// 3. Geographic pages
// ============================================================

function renderGeo(g) {
  const path = `/hard-money-loans/${g.slug}`;
  const trail = [
    ['Home', '/'],
    ['Where We Lend', '/loans#geo-heading'],
    [`Hard Money Loans in ${g.location}`, null],
  ];
  const t = TESTIMONIALS[g.testimonialKey];

  const body = g.sections
    .map((s, i) => {
      const id = `sec-${i + 1}`;
      let inner;
      if (s.deal) inner = ATLANTA_DEAL;
      else if (s.testimonialSection)
        inner = `        <blockquote class="pull-quote">
          <p>${t.quote}</p>
          <cite>&mdash; ${t.name}, ${stripTags(t.meta)}</cite>
        </blockquote>
`;
      else inner = `        ${s.html.trim()}\n`;
      return `      <section class="prose-section" aria-labelledby="${id}">
        <h2 id="${id}">${s.h2}</h2>
${inner}      </section>`;
    })
    .join('\n\n');

  const programs = g.programs
    .map((slug) => {
      const p = PROGRAM_BY_SLUG[slug];
      return `          <li><a href="/loans/${p.slug}">${p.nav} in ${g.location}</a><span>${stripTags(p.lede).slice(0, 110)}…</span></li>`;
    })
    .join('\n');

  return (
    head({
      title: g.title,
      description: g.description,
      path,
      schemas: [jsonLd(faqSchema(g.faqs)), jsonLd(breadcrumbSchema(trail))],
    }) +
    header() +
    breadcrumbs(trail) +
    `
  <main id="main">

    <section class="page-hero" aria-labelledby="page-h1">
      <div class="container page-hero-inner">
        <p class="section-eyebrow section-eyebrow--light">${g.eyebrow}</p>
        <h1 id="page-h1" class="page-hero-title">${g.h1}</h1>
        <p class="page-hero-lede">${g.lede}</p>
        <div class="page-hero-ctas">
          <a href="/apply" class="btn btn-gold btn-lg">Get My Free Quote</a>
          <a href="${SITE.phoneHref}" class="btn btn-ghost-gold btn-lg">Call ${SITE.phone}</a>
        </div>
        <p class="page-hero-note">No credit pull to quote &middot; No upfront fees &middot; Approval in 24–48 hours</p>
      </div>
    </section>

    <div class="prose-wrap section--white">
      <div class="container prose-container">
${body}
      </div>
    </div>

` +
    testimonialBlock(t) +
    faqBlock(g.faqs) +
    `    <section class="related-links section--white" aria-labelledby="prog-heading">
      <div class="container">
        <h2 id="prog-heading" class="section-heading">Programs Available in ${g.location}</h2>
        <ul class="related-links-list" role="list">
${programs}
        </ul>
      </div>
    </section>

` +
    relatedLinks('Keep Reading', g.related) +
    ctaBand(
      `Funding Deals in ${g.location}`,
      'Send us the property and we will come back with terms in 24–48 hours. No credit pull. No upfront fees.'
    ) +
    `  </main>

` +
    footer()
  );
}

for (const g of GEOS) write(`hard-money-loans/${g.slug}.html`, renderGeo(g));

// ============================================================
// 4. Legal pages
// ============================================================

function renderLegal(p) {
  const path = `/${p.slug}`;
  const trail = [
    ['Home', '/'],
    [p.h1, null],
  ];

  return (
    head({
      title: p.title,
      description: p.description,
      path,
      schemas: [jsonLd(breadcrumbSchema(trail))],
    }) +
    header() +
    breadcrumbs(trail) +
    `
  <main id="main">

    <section class="legal-page section--white">
      <div class="container legal-container">
        <h1>${p.h1}</h1>
        <p class="legal-updated">Last updated: ${p.updated}</p>
        <p class="legal-intro">${p.intro}</p>
${p.body.trimEnd()}
      </div>
    </section>

  </main>

` +
    footer()
  );
}

for (const p of LEGAL_PAGES) write(`${p.slug}.html`, renderLegal(p));

// ============================================================
// 5. sitemap.xml
// ============================================================

const today = new Date().toISOString().slice(0, 10);

const staticUrls = [
  ['/', 'weekly', '1.0'],
  ['/loans/', 'monthly', '0.9'],
  // /apply is deliberately absent: apply.html is noindex,nofollow, and a
  // sitemap should only list URLs we want indexed.
  ['/escrow-funding', 'monthly', '0.8'],
  ['/brrrr-analyzer', 'monthly', '0.7'],
  ['/es', 'monthly', '0.7'],
  ['/blog/', 'weekly', '0.7'],
  ['/privacy-policy', 'yearly', '0.3'],
  ['/terms-of-service', 'yearly', '0.3'],
  ['/accessibility', 'yearly', '0.3'],
];

const programUrls = PROGRAMS.map((p) => [`/loans/${p.slug}`, 'monthly', '0.9']);
const geoUrls = GEOS.map((g) => [`/hard-money-loans/${g.slug}`, 'monthly', '0.8']);

// Blog posts are discovered from disk so a new article shows up in the
// sitemap on the next build without editing this file. Drafts are skipped.
const blogUrls = readdirSync(resolve(ROOT, 'blog'))
  .filter((f) => f.endsWith('.html') && f !== 'index.html' && !f.startsWith('_draft-'))
  .sort()
  .map((f) => [`/blog/${f.replace(/[.]html$/, '')}`, 'yearly', '0.6']);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...staticUrls, ...programUrls, ...geoUrls, ...blogUrls]
  .map(([loc, freq, pri]) => {
    // The EN homepage and its Spanish counterpart declare each other.
    const alt =
      loc === '/'
        ? `
    <xhtml:link rel="alternate" hreflang="en" href="${SITE.origin}/" />
    <xhtml:link rel="alternate" hreflang="es" href="${SITE.origin}/es" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE.origin}/" />`
        : loc === '/es'
          ? `
    <xhtml:link rel="alternate" hreflang="en" href="${SITE.origin}/" />
    <xhtml:link rel="alternate" hreflang="es" href="${SITE.origin}/es" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE.origin}/" />`
          : '';
    return `  <url>
    <loc>${SITE.origin}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>${alt}
  </url>`;
  })
  .join('\n')}
</urlset>
`;

write('sitemap.xml', sitemap);

console.log(`Wrote ${written.length} files:`);
for (const f of written) console.log('  ' + f);
