// Render a sample affiliate flyer for local review.
//   node scripts/preview-flyer.js ["Affiliate Name"] [ref-slug]
// Writes preview-flyer.pdf (untracked, like the other preview-* files).
const fs = require('fs');
const path = require('path');
const { buildFlyer } = require(path.join(__dirname, '..', 'netlify', 'functions', 'lib', 'flyer-pdf.js'));

const name = process.argv[2] || 'Duc Nguyen';
const slug = process.argv[3] || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const url = `https://sgcapital.io/?ref=${slug}`;

const pdf = buildFlyer({ name, url });
const out = path.join(__dirname, '..', 'preview-flyer.pdf');
fs.writeFileSync(out, pdf);
console.log(`${name} -> ${url}`);
console.log(`wrote ${out} (${(pdf.length / 1024).toFixed(1)} KB)`);
