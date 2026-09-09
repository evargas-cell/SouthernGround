// ============================================================
// Static audit of the built site.
//
//   node scripts/seo/check.mjs
//
// Checks every HTML page for: a single <h1>, no skipped heading levels,
// exactly one canonical, title/description length, valid JSON-LD, no
// AggregateRating/Review schema, and internal links that resolve to a
// real file (accounting for the clean-URL rewrites in netlify.toml).
// Also verifies every page is reachable from the sitemap.
// ============================================================

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ORIGIN = 'https://sgcapital.io';

// Clean URL -> file on disk, mirroring the [[redirects]] in netlify.toml.
const REWRITES = new Map(
  Object.entries({
    '/': 'index.html',
    '/loans/': 'loans/index.html',
    '/blog/': 'blog/index.html',
    '/es': 'es.html',
    '/apply': 'apply.html',
    '/brrrr-analyzer': 'brrrr-analyzer.html',
    '/escrow': 'escrow.html',
    '/escrow-funding': 'escrow-funding.html',
    '/transactional-funding': 'escrow-funding.html',
    '/emd': 'escrow.html',
    '/fundmydeal': 'escrow.html',
    '/portal': 'portal.html',
    '/admin': 'admin.html',
    '/flyer': null, // netlify function
    '/privacy-policy': 'privacy-policy.html',
    '/terms-of-service': 'terms-of-service.html',
    '/accessibility': 'accessibility.html',
  })
);
for (const slug of ['fix-and-flip', 'dscr', 'bridge', 'new-construction', 'multi-family', 'cash-out-refinance'])
  REWRITES.set(`/loans/${slug}`, `loans/${slug}.html`);
for (const slug of ['georgia', 'atlanta', 'north-carolina', 'tennessee'])
  REWRITES.set(`/hard-money-loans/${slug}`, `hard-money-loans/${slug}.html`);
// Blog posts are served extensionless too; discover them from disk.
for (const f of readdirSync(resolve(ROOT, 'blog')))
  if (f.endsWith('.html') && f !== 'index.html')
    REWRITES.set(`/blog/${f.replace(/[.]html$/, '')}`, `blog/${f}`);

function walk(dir, out = []) {
  for (const e of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
    const rel = dir ? posix.join(dir, e.name) : e.name;
    if (e.isDirectory()) {
      if (['node_modules', '.git', 'scripts', 'netlify', 'supabase', 'docs'].includes(e.name)) continue;
      walk(rel, out);
    } else if (e.name.endsWith('.html')) {
      out.push(rel);
    }
  }
  return out;
}

const pages = walk('').sort();
// Pages that are app surfaces or transactional email previews, not public content.
const PRIVATE = /^(admin|portal|preview-)/;

const problems = [];
const warn = [];

function fail(page, msg) { problems.push(`${page}: ${msg}`); }
function note(page, msg) { warn.push(`${page}: ${msg}`); }

for (const page of pages) {
  const s = readFileSync(resolve(ROOT, page), 'utf8');
  const isPublic = !PRIVATE.test(page);

  // --- headings ---
  const heads = [...s.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  const h1s = heads.filter((h) => h === 1).length;
  if (isPublic && h1s !== 1) fail(page, `${h1s} <h1> elements (want exactly 1)`);
  let prev = 0;
  for (const h of heads) {
    if (prev && h > prev + 1) { fail(page, `heading level skips h${prev} -> h${h}`); break; }
    prev = h;
  }

  // --- canonical / title / description ---
  const canon = [...s.matchAll(/<link rel="canonical" href="([^"]*)"/g)];
  if (isPublic && canon.length !== 1) fail(page, `${canon.length} canonical tags (want 1)`);

  const title = (s.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const plainTitle = title.replace(/&amp;/g, '&').replace(/&middot;/g, '·').trim();
  if (isPublic && !plainTitle) fail(page, 'no <title>');
  else if (isPublic && plainTitle.length > 60) note(page, `title is ${plainTitle.length} chars (target <= 60)`);

  const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (isPublic && !desc) fail(page, 'no meta description');
  else if (isPublic && desc.length > 155) note(page, `meta description is ${desc.length} chars (target <= 155)`);

  // --- JSON-LD ---
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const o = JSON.parse(m[1]);
      const blob = JSON.stringify(o);
      if (/"@type"\s*:\s*"(AggregateRating|Review)"/.test(blob))
        fail(page, 'contains AggregateRating/Review schema — not permitted (self-serving)');
    } catch (e) {
      fail(page, `invalid JSON-LD: ${e.message}`);
    }
  }

  // --- images ---
  for (const m of s.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\balt=/.test(tag)) fail(page, `<img> with no alt: ${tag.slice(0, 70)}`);
    if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag))
      note(page, `<img> without width/height: ${tag.slice(0, 70)}`);
  }

  // --- internal links resolve ---
  for (const m of s.matchAll(/\b(?:href|src)="([^"#][^"]*)"/g)) {
    let href = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(href)) continue;
    href = href.split('#')[0].split('?')[0];
    if (!href) continue;

    let target;
    if (href.startsWith('/')) {
      target = REWRITES.has(href) ? REWRITES.get(href) : href.slice(1);
      if (target === null) continue; // netlify function
    } else {
      target = posix.normalize(posix.join(posix.dirname(page), href));
    }
    if (!target) continue;

    const abs = resolve(ROOT, target);
    const ok = existsSync(abs) &&
      (statSync(abs).isFile() || existsSync(join(abs, 'index.html')));
    if (!ok) fail(page, `broken link -> ${m[1]}`);
  }
}

// --- sitemap coverage ---
const sitemap = readFileSync(resolve(ROOT, 'sitemap.xml'), 'utf8');
const listed = new Set([...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]));

for (const url of listed) {
  const path = url.replace(ORIGIN, '') || '/';
  const target = REWRITES.has(path) ? REWRITES.get(path) : path.slice(1);
  if (target && !existsSync(resolve(ROOT, target)))
    fail('sitemap.xml', `lists a URL with no file: ${url}`);
}

// Public content pages that no sitemap entry covers.
const SITEMAP_EXEMPT = new Set([
  'fix-flip-checklist.html', // gated thank-you page, intentionally not indexed
  'escrow.html',             // intake form; the marketing page /escrow-funding is listed
  'apply.html',              // noindex,nofollow application form
]);
for (const page of pages) {
  if (!PRIVATE.test(page) && !SITEMAP_EXEMPT.has(page)) {
    const clean = [...REWRITES.entries()].find(([, f]) => f === page)?.[0];
    const candidates = [ORIGIN + '/' + page, clean ? ORIGIN + clean : null].filter(Boolean);
    if (!candidates.some((c) => listed.has(c)))
      note(page, 'not listed in sitemap.xml');
  }
}

console.log(`Checked ${pages.length} HTML pages.\n`);
if (problems.length) {
  console.log(`ERRORS (${problems.length}):`);
  for (const p of problems) console.log('  ✗ ' + p);
  console.log('');
}
if (warn.length) {
  console.log(`WARNINGS (${warn.length}):`);
  for (const w of warn) console.log('  ! ' + w);
  console.log('');
}
if (!problems.length && !warn.length) console.log('All clear.');
process.exit(problems.length ? 1 : 0);
