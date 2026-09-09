// Triggers the affiliate thank-you + loan-products reminder email.
// All affiliate data and secrets live server-side in the Netlify function;
// this script just calls it. Resend/Airtable keys are NOT needed locally.
//
// Usage:
//   node scripts/send-affiliate-thankyou.js --dry                 # list recipients, send nothing
//   node scripts/send-affiliate-thankyou.js --test you@email.com  # send one test email
//   node scripts/send-affiliate-thankyou.js --send                # REAL send to all affiliates
//
// Every mode requires the admin key (a dry run returns the whole affiliate
// roster, a test sends from our domain). Put ADMIN_SEND_KEY in .env.local, or:
//   $env:ADMIN_SEND_KEY = "xxxxx"   # PowerShell, not cmd

const { requireAdminKey } = require('./lib/admin-key');

const BASE = 'https://sgcapital.io/.netlify/functions/affiliate-thankyou';

const args = process.argv.slice(2);
const has  = (f) => args.includes(f);
const val  = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };

async function main() {
  let url = BASE;
  const headers = { 'Content-Type': 'application/json' };

  if (!has('--dry') && !has('--test') && !has('--send')) {
    console.log('Specify one of: --dry | --test <email> | --send');
    process.exit(0);
  }

  // The endpoint now requires the key for every mode, dry runs and tests too.
  headers['x-admin-key'] = requireAdminKey();

  if (has('--dry')) {
    url += '?dryRun=1';
  } else if (has('--test')) {
    const to = val('--test');
    if (!to) { console.error('Provide an address: --test you@email.com'); process.exit(1); }
    url += `?test=${encodeURIComponent(to)}`;
  }

  const res = await fetch(url, { method: 'POST', headers, body: '{}' });
  const data = await res.json().catch(() => ({}));
  console.log(`HTTP ${res.status}`);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
