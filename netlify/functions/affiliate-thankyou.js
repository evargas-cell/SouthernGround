// Sends a thank-you + loan-products reminder to existing affiliates.
// Reads the live Affiliates table from Airtable, sends each a personalized
// email via Resend. All secrets stay server-side.
//
// Usage (POST):
//   ?dryRun=1            -> returns the recipient list, sends nothing
//   ?test=you@email.com  -> sends ONE email to that address only (uses sample data)
//   (no params)          -> sends to every affiliate in Airtable
//
// EVERY request needs the shared secret, dry runs and tests included:
// header `x-admin-key: <ADMIN_SEND_KEY>`.

const { requireAdminKey, testRecipientAllowed } = require('./lib/admin-auth');

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

  const params  = event.queryStringParameters || {};
  const dryRun  = params.dryRun === '1' || params.dryRun === 'true';
  const testTo  = params.test || '';

  const AIRTABLE_TOKEN   = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const RESEND_API_KEY   = process.env.RESEND_API_KEY;

  // Every mode here is privileged: a real send mails every affiliate, `test`
  // sends from our own domain, and `dryRun` returns the full affiliate roster
  // (names + emails). All three require the key.
  const unauthorized = requireAdminKey(event);
  if (unauthorized) return unauthorized;

  // Even holding the key, a test email may only go to an address we control.
  if (testTo && !testRecipientAllowed(testTo)) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Test sends are limited to ADMIN_EMAILS addresses.' }),
    };
  }

  // --- TEST MODE: send a single email to the provided address with sample data ---
  if (testTo) {
    if (!RESEND_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'RESEND_API_KEY missing' }) };
    }
    const html = buildThankYouEmail('Edgar', 'https://sgcapital.io/?ref=test');
    const r = await sendEmail(RESEND_API_KEY, testTo, html);
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
      const atRes = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      });
      if (!atRes.ok) {
        const txt = await atRes.text();
        return { statusCode: 502, body: JSON.stringify({ error: 'Airtable read failed', detail: txt }) };
      }
      const json = await atRes.json();
      for (const rec of json.records) {
        const f = rec.fields || {};
        if (!f.Email) continue;
        affiliates.push({
          name:  f.Name || 'there',
          email: f.Email,
          link:  f['Affiliate Link'] || 'https://sgcapital.io',
        });
      }
      offset = json.offset;
    } while (offset);
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Airtable fetch error', detail: String(err) }) };
  }

  // De-dupe by email (case-insensitive)
  const seen = new Set();
  affiliates = affiliates.filter(a => {
    const k = a.email.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // --- DRY RUN: return the recipient list, send nothing ---
  if (dryRun) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ count: affiliates.length, recipients: affiliates }),
    };
  }

  // --- REAL SEND ---
  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'RESEND_API_KEY missing' }) };
  }

  const results = [];
  for (const a of affiliates) {
    const html = buildThankYouEmail(a.name, a.link);
    const r = await sendEmail(RESEND_API_KEY, a.email, html);
    results.push({ name: a.name, email: a.email, sent: r.ok, detail: r.ok ? undefined : r.detail });
    // Gentle pacing to stay under Resend rate limits
    await new Promise(res => setTimeout(res, 600));
  }

  const sent   = results.filter(r => r.sent).length;
  const failed = results.length - sent;
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ total: results.length, sent, failed, results }),
  };
};

async function sendEmail(key, to, html) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Southern Ground Capital <affiliates@sgcapital.io>',
        to: [to],
        bcc: ['edgar@sgcapital.io'],
        subject: 'Thank you for partnering with us — here’s what you can refer',
        html,
      }),
    });
    if (res.ok) return { ok: true };
    return { ok: false, detail: await res.text() };
  } catch (err) {
    return { ok: false, detail: String(err) };
  }
}

exports.buildThankYouEmail = buildThankYouEmail;

function buildThankYouEmail(name, affiliateLink) {
  const firstName = (name || 'there').split(' ')[0];
  const year = new Date().getFullYear();

  const programs = [
    { name: 'Fix &amp; Flip',        detail: 'Up to 100% LTC + 100% rehab · $50K–$3.5M · from 8.25%* · FICOs from 500 · closes 2–3 wks' },
    { name: 'DSCR Rental',           detail: 'Qualify on rental income — no W-2s or tax returns · up to 80% LTV · 30-yr fixed · from 5.39%' },
    { name: 'Bridge',                detail: 'Move fast on acquisitions · up to 75% LTV · from 8.25% · closes 2–3 wks' },
    { name: 'New Construction',      detail: 'Ground-up with structured draws · up to 75% LTC · closes 2–3 wks' },
    { name: 'Multi-Family',          detail: '2–20 unit properties · up to 75% LTV' },
    { name: 'Cash-Out Refinance',    detail: 'Unlock equity from existing holdings · up to 70% LTV' },
  ];

  const programRows = programs.map(p => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee5d6;vertical-align:top;width:42%">
            <strong style="color:#101e14;font-size:15px">${p.name}</strong>
          </td>
          <td style="padding:12px 0 12px 16px;border-bottom:1px solid #eee5d6;color:#555;font-size:13.5px;line-height:1.6">
            ${p.detail}
          </td>
        </tr>`).join('');

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
      <h2 style="color:#101e14;font-size:26px;margin:0 0 4px">Thank you, ${firstName}.</h2>
      <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px">
        We wanted to take a moment to genuinely thank you for being part of the
        Southern Ground Capital affiliate network. Partners like you are how more
        real estate investors find fast, reliable private capital &mdash; and we don't
        take that for granted.
      </p>

      <p style="color:#555;font-size:15px;line-height:1.7">
        As a quick refresher, here are the loan programs you can refer. Anytime
        someone in your network needs financing for an investment property, send
        them your link and we'll handle the rest.
      </p>

      <h3 style="color:#101e14;font-size:18px;margin:28px 0 8px">Loan Programs You Can Refer</h3>
      <table style="width:100%;border-collapse:collapse;margin:0 0 8px">
        ${programRows}
      </table>
      <p style="color:#8a8a8a;font-size:12px;line-height:1.6;margin:4px 0 0">
        Investment properties only · No upfront fees · No credit pull to quote · Approvals in 24–48 hrs
        · Lending in 43 states. *Rates vary by LTV, credit, and deal profile.
      </p>

      <div style="background:#f9f6f0;border-left:4px solid #c8923a;padding:20px 24px;margin:28px 0;border-radius:0 6px 6px 0">
        <p style="margin:0 0 8px;font-weight:bold;color:#101e14;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Your Affiliate Link</p>
        <p style="margin:0;font-family:monospace;font-size:16px;color:#c8923a;word-break:break-all">${affiliateLink}</p>
      </div>

      <p style="color:#555;font-size:15px;line-height:1.7">
        Every deal that closes through your link earns you a referral fee &mdash; with
        no cap on how much you can earn. The easiest place to start: add your link
        to your email signature and mention it to any agent, wholesaler, or investor
        you know.
      </p>

      <div style="text-align:center;margin:32px 0">
        <a href="${affiliateLink}" style="background:#c8923a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block">Share Your Link &rarr;</a>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.7">
        Have a deal in mind or questions about a program? Reply to this email or
        call us at <strong>(678) 842-8084</strong> &mdash; we're always happy to help you
        get one across the finish line.
      </p>

      <p style="color:#555;font-size:15px;margin:24px 0 0">
        With appreciation,<br/>
        <strong style="color:#101e14">Edgar Vargas</strong><br/>
        Southern Ground Capital
      </p>
    </div>

    <div style="background:#f5f5f0;padding:16px 40px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">&copy; ${year} Southern Ground Capital, LLC &middot; Investment loans only</p>
    </div>

  </div>
</body>
</html>`;
}
