// End-to-end dry run of the welcome email + attached flyer, with no network.
//   node scripts/preview-welcome-flyer.js ["Affiliate Name"]
// Writes preview-welcome.html and preview-flyer.pdf (both untracked).
const fs = require('fs');
const path = require('path');

const FN = path.join(__dirname, '..', 'netlify', 'functions');
const register = require(path.join(FN, 'affiliate-register.js'));
const flyerFn = require(path.join(FN, 'flyer.js'));

const name = process.argv[2] || 'Duc Nguyen';
const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const email = 'affiliate@example.com';
const link = `https://sgcapital.io/?ref=${slug}`;

// 1. The welcome email body.
const html = register.buildWelcomeEmail(name, email, '(678) 842-8084', 'Real Estate Agent', link, true);
const htmlOut = path.join(__dirname, '..', 'preview-welcome.html');
fs.writeFileSync(htmlOut, html);
console.log(`wrote ${htmlOut} (${(html.length / 1024).toFixed(1)} KB)`);
console.log(`  mentions flyer: ${/Your Deal Flyer/.test(html)}`);
console.log(`  flyer link:     ${(html.match(/https:\/\/sgcapital\.io\/flyer\?ref=[^"]+/) || ['(none)'])[0]}`);

// 2. The same PDF the function attaches, via the public /flyer endpoint.
flyerFn.handler({ queryStringParameters: { ref: slug } }).then((res) => {
  console.log(`\n/flyer?ref=${slug} -> ${res.statusCode} ${res.headers['Content-Type']}`);
  if (res.statusCode !== 200) {
    console.log(res.body);
    process.exit(1);
  }
  const pdf = Buffer.from(res.body, 'base64');
  const pdfOut = path.join(__dirname, '..', 'preview-flyer.pdf');
  fs.writeFileSync(pdfOut, pdf);
  console.log(`wrote ${pdfOut} (${(pdf.length / 1024).toFixed(1)} KB)`);
  console.log(`  ${res.headers['Content-Disposition']}`);
});
