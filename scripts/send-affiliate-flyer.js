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
// Every mode requires the admin key (a dry run returns the whole affiliate
// roster, a test sends from our domain). Put ADMIN_SEND_KEY in .env.local, or:
//   $env:ADMIN_SEND_KEY = "xxxxx"   # PowerShell, not cmd

const { requireAdminKey } = require('./lib/admin-key');

const BASE = 'https://sgcapital.io/.netlify/functions/affiliate-flyer-blast';

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };

async function main() {
  const url = new URL(BASE);
  const headers = { 'Content-Type': 'application/json' };

  if (val('--skip')) url.searchParams.set('skip', val('--skip'));

  if (!has('--dry') && !has('--test') && !has('--send')) {
    console.log('Specify one of: --dry | --test <email> | --send   [--skip "a@b.com,Name"]');
    process.exit(0);
  }

  // The endpoint now requires the key for every mode, dry runs and tests too.
  headers['x-admin-key'] = requireAdminKey();

  if (has('--dry')) {
    url.searchParams.set('dryRun', '1');
  } else if (has('--test')) {
    const to = val('--test');
    if (!to) { console.error('Provide an address: --test you@email.com'); process.exit(1); }
    url.searchParams.set('test', to);
  }

  // --- Dry run / test: one call ---
  if (!has('--send')) {
    const res = await fetch(url, { method: 'POST', headers, body: '{}' });
    const data = await res.json().catch(() => ({}));
    console.log(`HTTP ${res.status}`);
    if (Array.isArray(data.recipients)) {
      console.log(`\nWould send to ${data.count}:`);
      data.recipients.forEach((r, i) => console.log(`  ${i + 1}. ${r.name} <${r.email}>  ->  ?ref=${r.ref}`));
    }
    if (Array.isArray(data.skipped) && data.skipped.length) {
      console.log(`\nSkipped ${data.skipped.length}:`);
      data.skipped.forEach((r) => console.log(`  - ${r.name} <${r.email}> (${r.reason})`));
    }
    if (!data.recipients) console.log(JSON.stringify(data, null, 2));
    return;
  }

  // --- Real send: walk batches so no single call hits the function timeout ---
  const BATCH = Number(val('--batch')) || 8;
  let offset = Number(val('--offset')) || 0;
  const all = [];
  let total = null;

  for (;;) {
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('limit', String(BATCH));
    const res = await fetch(url, { method: 'POST', headers, body: '{}' });
    const data = await res.json().catch(() => ({}));

    if (res.status !== 200) {
      console.error(`\nHTTP ${res.status} at offset ${offset}: ${JSON.stringify(data)}`);
      console.error(`Nothing further sent. Resume with: --send --offset ${offset}`);
      break;
    }

    total = data.total;
    (data.results || []).forEach((r) => all.push(r));
    const done = offset + (data.processed || 0);
    console.log(`batch ${offset}-${done - 1}: sent ${data.sent}, failed ${data.failed} (${done}/${total})`);
    (data.results || []).filter((r) => !r.sent)
      .forEach((r) => console.log(`    FAILED ${r.email}: ${r.detail}`));

    if (!data.processed || !data.remaining) break;
    offset = done;
  }

  const sent = all.filter((r) => r.sent).length;
  console.log(`\nDone. Sent ${sent}/${all.length}${total !== null ? ` of ${total} recipients` : ''}, failed ${all.length - sent}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
