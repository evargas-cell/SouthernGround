// ============================================================
// Shared site chrome + head builders for the generated SEO pages.
// Every generated page (legal, loan program, geographic) renders
// through these so the header, footer, schema and meta stay in one
// place. Output is plain static HTML — there is no build step on
// Netlify, the generated files are committed.
// ============================================================

export const SITE = {
  origin: 'https://sgcapital.io',
  name: 'Southern Ground Capital',
  legalName: 'Southern Ground Capital, LLC',
  phone: '(678) 842-8084',
  phoneHref: 'tel:+16788428084',
  phoneSchema: '+1-678-842-8084',
  email: 'loans@sgcapital.io',
  city: 'Atlanta',
  region: 'GA',
  founder: 'Edgar Vargas',
  founderTitle: 'Founder & Managing Partner',
  excludedStates: 'AZ, NV, ND, OR, SD, UT, VT',
};

export const PROGRAM_LINKS = [
  ['/loans/fix-and-flip', 'Fix &amp; Flip'],
  ['/loans/dscr', 'DSCR Loans'],
  ['/loans/bridge', 'Bridge Loans'],
  ['/loans/new-construction', 'New Construction'],
  ['/loans/multi-family', 'Multi-Family'],
  ['/loans/cash-out-refinance', 'Cash-Out Refinance'],
];

export const GEO_LINKS = [
  ['/hard-money-loans/georgia', 'Georgia'],
  ['/hard-money-loans/atlanta', 'Atlanta'],
  ['/hard-money-loans/north-carolina', 'North Carolina'],
  ['/hard-money-loans/tennessee', 'Tennessee'],
];

// ---------- schema ----------

/** Sitewide Organization / FinancialService node. */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: SITE.name,
    alternateName: 'SGC',
    url: SITE.origin + '/',
    logo: SITE.origin + '/logo.png',
    image: SITE.origin + '/og-image.png',
    description:
      'Direct private hard money lender funding fix & flip, DSCR, bridge, and construction loans in 43 states.',
    telephone: SITE.phoneSchema,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: 'US',
    },
    areaServed: 'US',
    priceRange: '$$',
    openingHours: 'Mo-Fr 08:00-18:00',
    // REVIEW: add the Google Business Profile + LinkedIn URLs here once claimed.
    sameAs: [],
  };
}

/** BreadcrumbList from [[name, url], ...] — url null on the current page. */
export function breadcrumbSchema(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, url], i) => {
      const item = { '@type': 'ListItem', position: i + 1, name };
      if (url) item.item = SITE.origin + url;
      return item;
    }),
  };
}

/** FAQPage from [{q, a}] — `a` may contain inline HTML, which is stripped. */
export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: stripTags(f.q),
      acceptedAnswer: { '@type': 'Answer', text: stripTags(f.a) },
    })),
  };
}

export function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&rarr;/g, '→')
    .replace(/\s+/g, ' ')
    .trim();
}

export function jsonLd(obj) {
  return `  <script type="application/ld+json">\n${JSON.stringify(obj, null, 2)
    .split('\n')
    .map((l) => '  ' + l)
    .join('\n')}\n  </script>`;
}

// ---------- head ----------

/**
 * @param {object} o
 * @param {string} o.title        <title> — keep <= 60 chars
 * @param {string} o.description  meta description — keep <= 155 chars
 * @param {string} o.path         clean path, e.g. "/loans/dscr"
 * @param {string[]} [o.schemas]  pre-rendered <script> blocks
 * @param {string}  [o.ogType]
 * @param {string}  [o.esPath]    Spanish equivalent, when one exists
 * @param {boolean} [o.noindex]
 */
export function head(o) {
  const url = SITE.origin + o.path;
  const schemas = (o.schemas || []).join('\n\n');
  const hreflang = o.esPath
    ? `  <link rel="alternate" hreflang="en" href="${url}" />
  <link rel="alternate" hreflang="es" href="${SITE.origin}${o.esPath}" />
  <link rel="alternate" hreflang="x-default" href="${url}" />`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <link rel="icon" type="image/png" href="/logo.png" />
  <link rel="apple-touch-icon" href="/logo.png" />

  <!-- SEO -->
  <title>${o.title}</title>
  <meta name="description" content="${o.description}" />
  <link rel="canonical" href="${url}" />
${o.noindex ? '  <meta name="robots" content="noindex, follow" />\n' : ''}${hreflang ? hreflang + '\n' : ''}
  <!-- Open Graph -->
  <meta property="og:title" content="${o.title}" />
  <meta property="og:description" content="${o.description}" />
  <meta property="og:type" content="${o.ogType || 'website'}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE.origin}/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="${SITE.name}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${o.title}" />
  <meta name="twitter:description" content="${o.description}" />
  <meta name="twitter:image" content="${SITE.origin}/og-image.png" />

  <!-- Fonts: non-blocking load for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
  <noscript><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" /></noscript>

${schemas}

  <link rel="stylesheet" href="/style.css?v=6" />
</head>
<body>

  <a href="#main" class="skip-nav">Skip to content</a>
`;
}

// ---------- header ----------

export function header() {
  const dropdown = PROGRAM_LINKS.map(
    ([href, label]) => `            <li><a href="${href}">${label}</a></li>`
  ).join('\n');
  const mobilePrograms = PROGRAM_LINKS.map(
    ([href, label]) => `        <li><a href="${href}" class="mobile-menu__sub">${label}</a></li>`
  ).join('\n');

  return `  <header class="site-header" id="site-header">
    <nav class="nav-container" aria-label="Main navigation">
      <a href="/" class="nav-logo" aria-label="Southern Ground Capital — Home">
        <img src="/logo.png" alt="Southern Ground Capital" class="nav-logo-img" width="44" height="44" decoding="async" />
        <span class="nav-logo-name">Southern Ground<br>Capital</span>
      </a>

      <ul class="nav-links" role="list">
        <li class="nav-has-drop">
          <a href="/loans/" aria-haspopup="true" aria-expanded="false">Loan Programs <span class="nav-caret" aria-hidden="true">▾</span></a>
          <ul class="nav-drop" role="list">
${dropdown}
            <li><a href="/#rates">Rates &amp; Terms</a></li>
            <li><a href="/loans/">All Programs &amp; Rates</a></li>
          </ul>
        </li>
        <li><a href="/#how-it-works">How It Works</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/brrrr-analyzer.html">BRRRR Analyzer</a></li>
      </ul>

      <div class="nav-actions">
        <div class="lang-pill" role="group" aria-label="Language">
          <a href="/" class="lang-pill__opt lang-pill__opt--active" aria-current="true">EN</a><span class="lang-pill__div" aria-hidden="true">|</span><a href="/es.html" class="lang-pill__opt">ES</a>
        </div>
        <a href="${SITE.phoneHref}" class="nav-phone">${SITE.phone}</a>
        <a href="/apply.html" class="btn btn-gold nav-cta">Get a Free Quote</a>
      </div>

      <button class="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <ul role="list">
        <li><a href="/loans/">Loan Programs</a></li>
${mobilePrograms}
        <li><a href="/#how-it-works">How It Works</a></li>
        <li><a href="/#rates">Rates &amp; Terms</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/brrrr-analyzer.html">BRRRR Analyzer</a></li>
        <li><a href="/apply.html">Contact</a></li>
        <li><a href="/es.html">Ver en Español →</a></li>
      </ul>
      <a href="/apply.html" class="btn btn-gold btn-full">Get a Free Quote</a>
      <a href="${SITE.phoneHref}" class="mobile-phone-link">${SITE.phone}</a>
    </div>
  </header>
`;
}

// ---------- breadcrumbs ----------

/** Visible breadcrumb trail. Pass the same array used for breadcrumbSchema. */
export function breadcrumbs(trail) {
  const items = trail
    .map(([name, url], i) => {
      const last = i === trail.length - 1;
      return last
        ? `      <li aria-current="page">${name}</li>`
        : `      <li><a href="${url}">${name}</a></li>`;
    })
    .join('\n');
  return `  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="container" role="list">
${items}
    </ol>
  </nav>
`;
}

// ---------- footer ----------

export function footer() {
  const programs = PROGRAM_LINKS.map(
    ([href, label]) => `          <li><a href="${href}">${label}</a></li>`
  ).join('\n');
  const geos = GEO_LINKS.map(
    ([href, label]) => `          <li><a href="${href}">Hard Money Loans in ${label}</a></li>`
  ).join('\n');

  return `  <footer class="site-footer" role="contentinfo">
    <div class="container footer-grid">

      <div class="footer-brand">
        <div class="footer-logo">
          <img src="/logo.png" alt="Southern Ground Capital" class="footer-logo-img" width="80" height="80" loading="lazy" decoding="async" />
        </div>
        <p class="footer-tagline">Direct private lending for real estate investors. 43 states. No banks. No brokers.</p>
        <address class="footer-nap" aria-label="Contact information">
          <span class="footer-addr">${SITE.city}, ${SITE.region} &middot; United States</span>
          <a href="${SITE.phoneHref}">${SITE.phone}</a>
          <a href="mailto:${SITE.email}">${SITE.email}</a>
        </address>
      </div>

      <nav class="footer-nav" aria-label="Loan programs">
        <strong>Loan Programs</strong>
        <ul role="list">
${programs}
          <li><a href="/escrow-funding">Escrow Funding (EMD &amp; Double Close)</a></li>
        </ul>
      </nav>

      <nav class="footer-nav" aria-label="Where we lend">
        <strong>Where We Lend</strong>
        <ul role="list">
${geos}
          <li><a href="/loans/">All Programs &amp; Rates</a></li>
        </ul>
      </nav>

      <nav class="footer-nav" aria-label="Company links">
        <strong>Company</strong>
        <ul role="list">
          <li><a href="/#how-it-works">How It Works</a></li>
          <li><a href="/#rates">Rates &amp; Terms</a></li>
          <li><a href="/#about">About Us</a></li>
          <li><a href="/blog/">Investor Blog</a></li>
          <li><a href="/#affiliates">Affiliates</a></li>
          <li><a href="/apply.html">Contact</a></li>
        </ul>
      </nav>

      <div class="footer-legal">
        <strong>Legal</strong>
        <ul role="list">
          <li><a href="/privacy-policy">Privacy Policy</a></li>
          <li><a href="/terms-of-service">Terms of Service</a></li>
          <li><a href="/accessibility">Accessibility</a></li>
        </ul>
        <p class="footer-states">Lending available in 43 states. Excludes ${SITE.excludedStates}. All loans for investment purposes only. Not owner-occupied.</p>
      </div>

    </div>

    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <p>&copy; <span id="footer-year">${new Date().getFullYear()}</span> ${SITE.legalName} &middot; All rights reserved</p>
        <p>Investment property loans only &middot; Not FDIC insured &middot; Subject to underwriting and property evaluation</p>
      </div>
    </div>
  </footer>

  <script src="/script.js?v=5" defer></script>
</body>
</html>
`;
}

// ---------- shared page furniture ----------

export function ctaBand(heading, sub) {
  return `    <section class="cta-band" aria-labelledby="cta-band-heading">
      <div class="container cta-band-inner">
        <h2 id="cta-band-heading" class="cta-band-heading">${heading}</h2>
        <p class="cta-band-sub">${sub}</p>
        <div class="cta-band-actions">
          <a href="/apply.html" class="btn btn-gold btn-lg">Get My Free Quote</a>
          <a href="${SITE.phoneHref}" class="btn btn-ghost-white btn-lg">Call ${SITE.phone}</a>
        </div>
      </div>
    </section>
`;
}

/** Renders the visible FAQ block. Pair with faqSchema() for the same array. */
export function faqBlock(faqs, headingId = 'faq-heading') {
  const items = faqs
    .map(
      (f) => `          <details class="faq-item">
            <summary><h3>${f.q}</h3></summary>
            <div class="faq-answer">${f.a}</div>
          </details>`
    )
    .join('\n');

  return `    <section class="faq-section section--light" aria-labelledby="${headingId}">
      <div class="container">
        <p class="section-eyebrow">Common Questions</p>
        <h2 id="${headingId}" class="section-heading">Frequently Asked Questions</h2>
        <div class="faq-list">
${items}
        </div>
      </div>
    </section>
`;
}

export function testimonialBlock(t) {
  return `    <section class="program-testimonial section--white" aria-label="Borrower testimonial">
      <div class="container">
        <article class="testimonial-card testimonial-card--featured">
          <div class="testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div>
          <blockquote><p>${t.quote}</p></blockquote>
          <footer>
            <div class="t-meta">
              <div class="t-avatar" aria-hidden="true">${t.initials}</div>
              <div>
                <cite><strong>${t.name}</strong></cite>
                <span>${t.meta}</span>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </section>
`;
}

/** Terms table from [[label, value], ...]. */
export function termsTable(caption, rows) {
  const body = rows
    .map(([l, v]) => `            <tr><th scope="row">${l}</th><td>${v}</td></tr>`)
    .join('\n');
  const id = 'tbl-' + caption.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `        <div class="spec-table-wrap">
          <p class="spec-table-caption" id="${id}">${caption}</p>
          <div class="spec-table-scroll">
            <table class="spec-table" aria-labelledby="${id}">
              <tbody>
${body.replace(/^ {12}/gm, '              ')}
              </tbody>
            </table>
          </div>
        </div>
`;
}

export function relatedLinks(heading, links) {
  const items = links
    .map(([href, label, blurb]) => `          <li><a href="${href}">${label}</a><span>${blurb}</span></li>`)
    .join('\n');
  return `    <section class="related-links section--light" aria-labelledby="related-heading">
      <div class="container">
        <h2 id="related-heading" class="section-heading">Keep Reading</h2>
        <ul class="related-links-list" role="list">
${items}
        </ul>
      </div>
    </section>
`;
}
