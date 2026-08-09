// Send ONE test copy of the affiliate welcome email, with the personalised
// flyer attached, so it can be checked in a real inbox before going live.
//
// Nothing is written to Airtable or Supabase — this only sends the email.
//
// Requires a Resend key, from either:
//   PowerShell:  $env:RESEND_API_KEY = "re_xxxxxxxxxxxx"
//   or a .env.local file in the site root containing  RESEND_API_KEY=re_xxx
//
// Usage:
//   node scripts/send-test-flyer-email.js                       (dry run — writes previews only)
//   node scripts/send-test-flyer-email.js --send                 (sends to the default address)
//   node scripts/send-test-flyer-email.js --send you@example.com "Affiliate Name"
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { buildWelcomeEmail } = require(path.join(ROOT, 'netlify', 'functions', 'affiliate-register.js'));
const { buildFlyer } = require(path.join(ROOT, 'netlify', 'functions', 'lib', 'flyer-pdf.js'));

// ---- Key lookup: env var first, then .env.local ----
function resendKey() {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY.trim();
  const envFile = path.join(ROOT, '.env.local');
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*RESEND_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

const args = process.argv.slice(2);
const send = args.includes('--send');
const positional = args.filter((a) => !a.startsWith('--'));
const to = positional[0] || 'evargas@bluemonarchcm.com';
const name = positional[1] || 'Edgar Vargas';

const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const affiliateLink = `https://sgcapital.io/?ref=${slug}`;

const html = buildWelcomeEmail(name, to, '', 'Capital Referral Partner', affiliateLink, true);
const pdf = buildFlyer({ name, url: affiliateLink });
const filename = `SGC-Investor-Funding-Flyer-${slug}.pdf`;

// Always drop the previews next to the site so they can be opened directly.
fs.writeFileSync(path.join(ROOT, 'preview-welcome.html'), html);
fs.writeFileSync(path.join(ROOT, 'preview-flyer.pdf'), pdf);

console.log(`To:         ${to}`);
console.log(`Name:       ${name}`);
console.log(`Link:       ${affiliateLink}`);
console.log(`Attachment: ${filename} (${(pdf.length / 1024).toFixed(1)} KB)`);
console.log(`Previews:   preview-welcome.html, preview-flyer.pdf`);

if (!send) {
  console.log('\nDry run — nothing sent. Re-run with --send to deliver it.');
  process.exit(0);
}

const KEY = resendKey();
if (!KEY) {
  console.error('\nERROR: no Resend key found.');
  console.error('  PowerShell:  $env:RESEND_API_KEY = "re_xxxxxxxxxxxx"');
  console.error('  or create .env.local with  RESEND_API_KEY=re_xxxxxxxxxxxx');
  process.exit(1);
}

(async function () {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Southern Ground Capital <affiliates@sgcapital.io>',
      to: [to],
      subject: '[TEST] Welcome to the Southern Ground Capital Affiliate Program!',
      html,
      attachments: [{ filename, content: pdf.toString('base64') }],
    }),
  });
  const body = await res.text();
  if (res.ok) {
    console.log(`\nSent. Resend response: ${body}`);
  } else {
    console.error(`\nFAILED (${res.status}): ${body}`);
    process.exit(1);
  }
})();
