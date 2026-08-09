// Sends every existing affiliate their own personalised Investor Funding flyer.
// Reads the live Affiliates table from Airtable, renders a per-affiliate PDF
// (their name, their ref link, their QR code) and emails it via Resend.
// All secrets stay server-side.
//
// Usage (POST):
//   ?dryRun=1            -> returns the recipient list (and who was skipped), sends nothing
//   ?test=you@email.com  -> sends ONE email to that address only (sample data)
//   (no params)          -> sends to every affiliate in Airtable except the skip list
//   &skip=a@b.com,c@d.com -> additional addresses/names to exclude
//
// Protect real sends with a shared secret: header `x-admin-key: <ADMIN_SEND_KEY>`.
const { buildFlyer } = require('./lib/flyer-pdf');

// Affiliates who already have this flyer and should not be re-sent it.
const DEFAULT_SKIP = ['duc nguyen', 'duc-nguyen'];

const norm = (s) => String(s || '').trim().toLowerCase();

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const params = event.queryStringParameters || {};
  const dryRun = params.dryRun === '1' || params.dryRun === 'true';
  const testTo = params.test || '';

  const AIRTABLE_TOKEN   = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const RESEND_API_KEY   = process.env.RESEND_API_KEY;
  const ADMIN_SEND_KEY   = process.env.ADMIN_SEND_KEY;

  if (!dryRun && !testTo) {
    const provided = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];
    if (!ADMIN_SEND_KEY || provided !== ADMIN_SEND_KEY) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
  }

  const skip = new Set([
    ...DEFAULT_SKIP,
    ...String(params.skip || '').split(',').map(norm).filter(Boolean),
  ]);

  // --- TEST MODE ---
  if (testTo) {
    if (!RESEND_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'RESEND_API_KEY missing' }) };
    }
    const r = await sendFlyerEmail(RESEND_API_KEY, {
      name: 'Edgar Vargas',
      email: testTo,
      ref: 'test',
    });
    return {
      statusCode: r.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ test: testTo, sent: r.ok, detail: r.detail }),
    };
  }

  // --- Read the live affiliate list from Airtable ---
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Airtable env vars missing' }) };
  }

  let affiliates = [];
  try {
    let offset;
    do {
      const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Affiliates`);
      url.searchParams.set('pageSize', '100');
      if (offset) url.searchParams.set('offset', offset);
      const atRes = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
      if (!atRes.ok) {
        return {
          statusCode: 502,
          body: JSON.stringify({ error: 'Airtable read failed', detail: await atRes.text() }),
        };
      }
      const json = await atRes.json();
      for (const rec of json.records) {
        const f = rec.fields || {};
        if (!f.Email) continue;
        const link = f['Affiliate Link'] || '';
        const ref = norm(f.Slug || (link.split('ref=')[1] || '')).replace(/[^a-z0-9-]/g, '');
        if (!ref) continue; // no ref code means no personalised flyer to send
        affiliates.push({ name: f.Name || 'there', email: f.Email, ref });
      }
      offset = json.offset;
    } while (offset);
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Airtable fetch error', detail: String(err) }) };
  }

  // De-dupe by email, then apply the skip list (matched on email, name or ref).
  const seen = new Set();
  const skipped = [];
  affiliates = affiliates.filter((a) => {
    const key = norm(a.email);
    if (seen.has(key)) { skipped.push({ ...a, reason: 'duplicate' }); return false; }
    seen.add(key);
    if (skip.has(key) || skip.has(norm(a.name)) || skip.has(a.ref)) {
      skipped.push({ ...a, reason: 'skip list' });
      return false;
    }
    return true;
  });

  // --- DRY RUN ---
  if (dryRun) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ count: affiliates.length, recipients: affiliates, skipped }),
    };
  }

  // --- REAL SEND ---
  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'RESEND_API_KEY missing' }) };
  }

  const results = [];
  for (const a of affiliates) {
    const r = await sendFlyerEmail(RESEND_API_KEY, a);
    results.push({ name: a.name, email: a.email, sent: r.ok, detail: r.ok ? undefined : r.detail });
    await new Promise((res) => setTimeout(res, 600)); // stay under Resend rate limits
  }

  const sent = results.filter((r) => r.sent).length;
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ total: results.length, sent, failed: results.length - sent, skipped, results }),
  };
};

async function sendFlyerEmail(key, affiliate) {
  const { name, email, ref } = affiliate;
  const link = `https://sgcapital.io/?ref=${ref}`;
  let attachments;
  try {
    const pdf = buildFlyer({ name, url: link });
    attachments = [{
      filename: `SGC-Investor-Funding-Flyer-${ref}.pdf`,
      content: pdf.toString('base64'),
    }];
  } catch (err) {
    // No flyer means no reason to send this email — report it instead.
    return { ok: false, detail: `Flyer render failed: ${err.message}` };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Edgar Vargas — Southern Ground Capital <affiliates@sgcapital.io>',
        to: [email],
        bcc: ['edgar@sgcapital.io'],
        subject: 'Your funding flyer — your link and QR code on it',
        html: buildFlyerEmail(name, ref, link),
        attachments,
      }),
    });
    if (res.ok) return { ok: true };
    return { ok: false, detail: await res.text() };
  } catch (err) {
    return { ok: false, detail: String(err) };
  }
}

exports.buildFlyerEmail = buildFlyerEmail;

function titleCase(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildFlyerEmail(name, ref, affiliateLink) {
  const firstName = titleCase((name || 'there').split(' ')[0]);
  const year = new Date().getFullYear();
  const flyerUrl = `https://sgcapital.io/flyer?ref=${ref}`;
  const portalUrl = 'https://sgcapital.io/portal';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">

    <div style="background:#101e14;padding:32px 40px">
      <h1 style="margin:0;color:#c8923a;font-size:22px;letter-spacing:1px">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Hard Money Lending &middot; Private Capital</p>
    </div>

    <div style="padding:40px">
      <h2 style="color:#101e14;font-size:26px;margin:0 0 4px">${firstName}, here's your funding flyer.</h2>
      <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px">
        Attached is a one-page <strong>Real Estate Investor Funding</strong> flyer made for you.
        Your name is on it, your referral link is on it, and the <strong>QR code goes straight
        to your link</strong> &mdash; so anyone who scans it is tracked to you automatically.
      </p>

      <div style="background:#fbf8f1;border:1px solid #e3d7bd;border-radius:8px;padding:24px 28px;margin:28px 0">
        <p style="margin:0 0 6px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#9B6820">What's on it</p>
        <h3 style="color:#101e14;font-size:19px;margin:0 0 10px">Terms from one of our preferred capital partners</h3>
        <p style="margin:0 0 12px;color:#1C3D26;font-size:14.5px;line-height:1.7">
          The flyer lays out the current programs from <strong>one of our preferred capital
          partners</strong> &mdash; Fix &amp; Flip, DSCR, New Builds and Refinance, with the
          leverage and starting rates for each. It also spells out exactly what a deal needs in
          order to qualify, and the automatic disqualifiers that mean it isn't worth submitting.
        </p>
        <ul style="margin:0 0 12px;padding-left:20px;color:#1C3D26;font-size:14.5px;line-height:1.8">
          <li>First-position loans only, $75K minimum, 660+ credit, up to 10 units</li>
          <li>What we need to review a deal, in one short list</li>
          <li>The deals we can't do &mdash; so you stop wasting time on them</li>
        </ul>
        <p style="margin:0;color:#6b7d70;font-size:13px;line-height:1.6">
          Rates shown are "as low as" benchmarks and can change; the flyer carries the program
          guide date. All loans are subject to underwriting, valuation and final approval.
        </p>
      </div>

      <h3 style="color:#101e14;font-size:18px;margin:28px 0 12px">How to use it</h3>
      <ul style="color:#555;font-size:15px;line-height:1.9;padding-left:20px;margin:0 0 24px">
        <li>Text or email it to any investor who asks "what are your terms?"</li>
        <li>Print it for meetings, open houses and REIA events &mdash; people scan the QR on the spot</li>
        <li>Post the image to social; the QR still works from a screen</li>
        <li>Let it screen for you, so the deals that reach you are the ones that can actually fund</li>
      </ul>

      <div style="background:#f9f6f0;border-left:4px solid #c8923a;padding:20px 24px;margin:28px 0;border-radius:0 6px 6px 0">
        <p style="margin:0 0 8px;font-weight:bold;color:#101e14;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Your Affiliate Link</p>
        <p style="margin:0;font-family:monospace;font-size:16px;color:#c8923a;word-break:break-all">${affiliateLink}</p>
      </div>

      <div style="text-align:center;margin:32px 0">
        <a href="${flyerUrl}" style="background:#9B6820;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block">Download Your Flyer &rarr;</a>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.7">
        You can re-download the current version any time from the link above or from your
        <a href="${portalUrl}" style="color:#9B6820">affiliate portal</a>. Questions on a deal or a
        program? Reply to this email or call <strong>(678) 842-8084</strong>.
      </p>

      <p style="color:#555;font-size:15px;margin:24px 0 0">
        Talk soon,<br/>
        <strong style="color:#101e14">Edgar Vargas</strong><br/>
        Southern Ground Capital
      </p>
    </div>

    <div style="background:#f5f5f0;padding:16px 40px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">
        &copy; ${year} Southern Ground Capital, LLC &middot; Investment loans only, not consumer lending<br/>
        You're receiving this because you registered as a Southern Ground Capital affiliate.
      </p>
    </div>

  </div>
</body>
</html>`;
}
