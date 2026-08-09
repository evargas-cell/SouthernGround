// Fallback sender: does the flyer blast from this machine instead of the
// Netlify function. Use when ADMIN_SEND_KEY isn't to hand but a Resend key is.
//
// The recipient list comes from the function's dry-run endpoint (which needs no
// auth), the flyers are rendered locally, and Resend is called directly. The
// skip list and de-duping are still applied server-side, so Duc Nguyen is
// excluded here exactly as in the hosted path.
//
// Key: RESEND_API_KEY from the environment or .env.local.
//
// Usage:
//   node scripts/send-affiliate-flyer-local.js --dry
//   node scripts/send-affiliate-flyer-local.js --send
//   node scripts/send-affiliate-flyer-local.js --send --offset 16   # resume
const fs = require('fs');
const path = require('path');
const { buildFlyer } = require(path.join(__dirname, '..', 'netlify', 'functions', 'lib', 'flyer-pdf.js'));
const { buildFlyerEmail } = require(path.join(__dirname, '..', 'netlify', 'functions', 'affiliate-flyer-blast.js'));

const LIST_URL = 'https://sgcapital.io/.netlify/functions/affiliate-flyer-blast?dryRun=1';

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };

function envValue(name) {
  if (process.env[name]) return process.env[name].trim();
  const envFile = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envFile)) return null;
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    if (/^\s*#/.test(line)) continue;
    const m = line.match(new RegExp(`^\\s*${name}\\s*=\\s*(.+?)\\s*$`));
    if (m) {
      const v = m[1].replace(/^["']|["']$/g, '');
      if (v && !/^PASTE_/.test(v)) return v;
    }
  }
  return null;
}

// Resend keys start with re_. Accept one parked under ADMIN_SEND_KEY by mistake.
function resendKey() {
  const direct = envValue('RESEND_API_KEY');
  if (direct) return direct;
  const admin = envValue('ADMIN_SEND_KEY');
  if (admin && admin.startsWith('re_')) {
    console.log('Note: using the re_... value found under ADMIN_SEND_KEY as the Resend key.\n');
    return admin;
  }
  return null;
}

async function main() {
  const res = await fetch(LIST_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const data = await res.json();
  const recipients = data.recipients || [];
  if (!recipients.length) {
    console.error('No recipients returned:', JSON.stringify(data));
    process.exit(1);
  }

  console.log(`${recipients.length} recipients; skipped ${(data.skipped || []).length}:`);
  (data.skipped || []).forEach((s) => console.log(`  - ${s.name} <${s.email}> (${s.reason})`));

  if (!has('--send')) {
    recipients.forEach((r, i) => console.log(`  ${i + 1}. ${r.name} <${r.email}>  ->  ?ref=${r.ref}`));
    console.log('\nDry run — nothing sent. Re-run with --send.');
    return;
  }

  const KEY = resendKey();
  if (!KEY) {
    console.error('No Resend key found. Put RESEND_API_KEY=re_xxx in .env.local.');
    process.exit(1);
  }

  const start = Number(val('--offset')) || 0;
  let sent = 0;
  const failures = [];

  for (let i = start; i < recipients.length; i++) {
    const a = recipients[i];
    const link = `https://sgcapital.io/?ref=${a.ref}`;
    let ok = false;
    let detail = '';
    try {
      const pdf = buildFlyer({ name: a.name, url: link });
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Edgar Vargas — Southern Ground Capital <affiliates@sgcapital.io>',
          to: [a.email],
          bcc: ['edgar@sgcapital.io'],
          subject: 'Your funding flyer — your link and QR code on it',
          html: buildFlyerEmail(a.name, a.ref, link),
          attachments: [{
            filename: `SGC-Investor-Funding-Flyer-${a.ref}.pdf`,
            content: pdf.toString('base64'),
          }],
        }),
      });
      ok = r.ok;
      if (!ok) detail = await r.text();
    } catch (err) {
      detail = String(err);
    }

    if (ok) { sent++; console.log(`  [${i + 1}/${recipients.length}] sent    ${a.email}`); }
    else {
      failures.push({ i, email: a.email, detail });
      console.log(`  [${i + 1}/${recipients.length}] FAILED  ${a.email}: ${detail}`);
      // A bad key fails every send — stop rather than hammering the API.
      if (/unauthorized|invalid.*api.?key|401/i.test(detail) && sent === 0) {
        console.error(`\nStopping: the Resend key was rejected. Resume later with --offset ${i}`);
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 600)); // Resend rate limit
  }

  console.log(`\nDone. Sent ${sent}, failed ${failures.length}.`);
  if (failures.length) {
    console.log('Failures:');
    failures.forEach((f) => console.log(`  ${f.email}: ${f.detail}`));
    console.log(`Resume from the first failure with: --send --offset ${failures[0].i}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
