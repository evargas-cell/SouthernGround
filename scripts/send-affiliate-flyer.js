// Triggers the affiliate flyer send: every affiliate gets their own PDF with
// their link and QR code on it. Affiliate data and secrets live server-side in
// the Netlify function; this script just calls it. No Resend/Airtable keys locally.
//
// Duc Nguyen is skipped by default (already has the flyer).
//
// Usage:
//   node scripts/send-affiliate-flyer.js --dry                 # list recipients + skips, send nothing
//   node scripts/send-affiliate-flyer.js --test you@email.com  # one test email to yourself
//   node scripts/send-affiliate-flyer.js --send                # REAL send to all affiliates
//   node scripts/send-affiliate-flyer.js --send --skip "a@b.com,Jane Doe"
//
// The real send requires the admin key (PowerShell, not cmd):
//   $env:ADMIN_SEND_KEY = "xxxxx"; node scripts/send-affiliate-flyer.js --send

const fs = require('fs');
const path = require('path');

const BASE = 'https://sgcapital.io/.netlify/functions/affiliate-flyer-blast';

// Admin key from the environment, falling back to a gitignored .env.local.
function adminKey() {
  if (process.env.ADMIN_SEND_KEY) return process.env.ADMIN_SEND_KEY.trim();
  const envFile = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      if (/^\s*#/.test(line)) continue;
      const m = line.match(/^\s*ADMIN_SEND_KEY\s*=\s*(.+?)\s*$/);
      if (m) {
        const key = m[1].replace(/^["']|["']$/g, '');
        if (key && !/^PASTE_/.test(key)) return key;
      }
    }
  }
  return null;
}

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };

async function main() {
  const url = new URL(BASE);
  const headers = { 'Content-Type': 'application/json' };

  if (val('--skip')) url.searchParams.set('skip', val('--skip'));

  if (has('--dry')) {
    url.searchParams.set('dryRun', '1');
  } else if (has('--test')) {
    const to = val('--test');
    if (!to) { console.error('Provide an address: --test you@email.com'); process.exit(1); }
    url.searchParams.set('test', to);
  } else if (has('--send')) {
    const key = adminKey();
    if (!key) {
      console.error('Real send requires the admin key. Either:');
      console.error('  put ADMIN_SEND_KEY=xxxxx in .env.local (gitignored), or');
      console.error('  PowerShell:  $env:ADMIN_SEND_KEY = "xxxxx"');
      process.exit(1);
    }
    headers['x-admin-key'] = key;
  } else {
    console.log('Specify one of: --dry | --test <email> | --send   [--skip "a@b.com,Name"]');
    process.exit(0);
  }

  const res = await fetch(url, { method: 'POST', headers, body: '{}' });
  const data = await res.json().catch(() => ({}));
  console.log(`HTTP ${res.status}`);

  // Summarise rather than dumping every record.
  if (Array.isArray(data.recipients)) {
    console.log(`\nWould send to ${data.count}:`);
    data.recipients.forEach((r, i) => console.log(`  ${i + 1}. ${r.name} <${r.email}>  ->  ?ref=${r.ref}`));
  }
  if (Array.isArray(data.skipped) && data.skipped.length) {
    console.log(`\nSkipped ${data.skipped.length}:`);
    data.skipped.forEach((r) => console.log(`  - ${r.name} <${r.email}> (${r.reason})`));
  }
  if (data.results) {
    console.log(`\nSent ${data.sent}/${data.total}, failed ${data.failed}`);
    data.results.filter((r) => !r.sent).forEach((r) => console.log(`  FAILED ${r.email}: ${r.detail}`));
  }
  if (!data.recipients && !data.results) console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
