// Triggers the affiliate announcement: BRRRR Analyzer + new Affiliate Portal.
// All affiliate data and secrets live server-side in the Netlify function;
// this script just calls it. Resend/Airtable keys are NOT needed locally.
//
// Usage:
//   node scripts/send-affiliate-announce.js --dry                 # list recipients, send nothing
//   node scripts/send-affiliate-announce.js --test you@email.com  # send one test email to yourself
//   node scripts/send-affiliate-announce.js --send                # REAL send to all affiliates
//
// The real send requires the admin key (PowerShell):
//   $env:ADMIN_SEND_KEY = "xxxxx"; node scripts/send-affiliate-announce.js --send

const BASE = 'https://sgcapital.io/.netlify/functions/affiliate-announce';

const args = process.argv.slice(2);
const has  = (f) => args.includes(f);
const val  = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };

async function main() {
  let url = BASE;
  const headers = { 'Content-Type': 'application/json' };

  if (has('--dry')) {
    url += '?dryRun=1';
  } else if (has('--test')) {
    const to = val('--test');
    if (!to) { console.error('Provide an address: --test you@email.com'); process.exit(1); }
    url += `?test=${encodeURIComponent(to)}`;
  } else if (has('--send')) {
    if (!process.env.ADMIN_SEND_KEY) {
      console.error('Real send requires ADMIN_SEND_KEY env var.');
      process.exit(1);
    }
    headers['x-admin-key'] = process.env.ADMIN_SEND_KEY;
  } else {
    console.log('Specify one of: --dry | --test <email> | --send');
    process.exit(0);
  }

  const res = await fetch(url, { method: 'POST', headers, body: '{}' });
  const data = await res.json().catch(() => ({}));
  console.log(`HTTP ${res.status}`);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
