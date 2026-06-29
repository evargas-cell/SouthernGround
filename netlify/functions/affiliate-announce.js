// Announces the new BRRRR Deal Analyzer + Affiliate Portal to existing affiliates.
// Reads the live Affiliates table from Airtable, sends each a personalized
// email via Resend. All secrets stay server-side.
//
// Usage (POST):
//   ?dryRun=1            -> returns the recipient list, sends nothing
//   ?test=you@email.com  -> sends ONE email to that address only (uses sample data)
//   (no params)          -> sends to every affiliate in Airtable
//
// Protect real sends with a shared secret: send header `x-admin-key: <ADMIN_SEND_KEY>`.

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
  const ADMIN_SEND_KEY   = process.env.ADMIN_SEND_KEY;

  // Require a shared secret for any real send (dryRun and test are exempt so you
  // can preview/verify without the key).
  if (!dryRun && !testTo) {
    const provided = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];
    if (!ADMIN_SEND_KEY || provided !== ADMIN_SEND_KEY) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
  }

  // --- TEST MODE: send a single email to the provided address with sample data ---
  if (testTo) {
    if (!RESEND_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'RESEND_API_KEY missing' }) };
    }
    const html = buildAnnounceEmail('Edgar', testTo, 'https://sgcapital.io/?ref=test');
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
    const html = buildAnnounceEmail(a.name, a.email, a.link);
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
        from: 'Edgar Vargas — Southern Ground Capital <affiliates@sgcapital.io>',
        to: [to],
        bcc: ['edgar@sgcapital.io'],
        subject: 'New for affiliates: the BRRRR Analyzer + your client-tracking portal',
        html,
      }),
    });
    if (res.ok) return { ok: true };
    return { ok: false, detail: await res.text() };
  } catch (err) {
    return { ok: false, detail: String(err) };
  }
}

exports.buildAnnounceEmail = buildAnnounceEmail;

function buildAnnounceEmail(name, email, affiliateLink) {
  const firstName  = (name || 'there').split(' ')[0];
  const year       = new Date().getFullYear();
  const portalUrl  = 'https://sgcapital.io/portal';
  const brrrrUrl   = 'https://sgcapital.io/brrrr-analyzer.html';
  const loginEmail = email || 'the email you registered with';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">

    <!-- Header -->
    <div style="background:#101e14;padding:32px 40px">
      <h1 style="margin:0;color:#c8923a;font-size:22px;letter-spacing:1px">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Hard Money Lending &middot; Private Capital</p>
    </div>

    <!-- Body -->
    <div style="padding:40px">
      <h2 style="color:#101e14;font-size:26px;margin:0 0 4px">Two new tools for you, ${firstName}.</h2>
      <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px">
        We've been building things to make your referrals easier to win &mdash; and easier to
        track. Two are ready today: a <strong>free BRRRR Deal Analyzer</strong> you can put in
        front of any investor, and your own <strong>Affiliate Portal</strong> where you can
        watch every client loan submission as it moves through our pipeline.
      </p>

      <!-- BRRRR Analyzer -->
      <div style="background:#f9f6f0;border-left:4px solid #c8923a;padding:24px 28px;margin:28px 0;border-radius:0 6px 6px 0">
        <p style="margin:0 0 6px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#c8923a">New Tool &middot; Free</p>
        <h3 style="color:#101e14;font-size:19px;margin:0 0 10px">The BRRRR Deal Analyzer</h3>
        <p style="margin:0 0 14px;color:#555;font-size:14.5px;line-height:1.7">
          Buy, Rehab, Rent, Refinance, Repeat &mdash; run the whole deal in real time. It
          calculates acquisition and rehab costs, monthly cash flow, cash-on-cash return,
          equity created, and exactly how much an investor can pull out at refinance. It's a
          perfect ice-breaker: send it to an investor, help them run their numbers, and the
          financing conversation starts itself.
        </p>
        <a href="${brrrrUrl}" style="background:#c8923a;color:#fff;text-decoration:none;padding:11px 26px;border-radius:6px;font-size:14px;font-weight:bold;display:inline-block">Open the BRRRR Analyzer &rarr;</a>
      </div>

      <!-- Affiliate Portal -->
      <div style="background:#f0f6f2;border:1px solid #c3d9c8;border-radius:8px;padding:24px 28px;margin:28px 0">
        <p style="margin:0 0 6px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#2a6645">New &middot; Your Affiliate Portal</p>
        <h3 style="color:#101e14;font-size:19px;margin:0 0 10px">Track every client loan submission</h3>
        <p style="margin:0 0 12px;color:#1C3D26;font-size:14.5px;line-height:1.7">
          You no longer have to wonder what happened to a referral. Log in to your portal and
          you'll see, in one place:
        </p>
        <ul style="margin:0 0 14px;padding-left:20px;color:#1C3D26;font-size:14.5px;line-height:1.8">
          <li>Clicks on your referral link</li>
          <li>Leads &mdash; the clients who submitted a loan application through you</li>
          <li>Your earnings as deals close</li>
        </ul>
        <p style="margin:0 0 14px;color:#1C3D26;font-size:14.5px;line-height:1.7">
          <strong>How to log in:</strong> go to the portal, enter
          <strong>${loginEmail}</strong>, and we'll email you a secure one-time login link
          &mdash; no password to remember.
        </p>
        <a href="${portalUrl}" style="background:#101e14;color:#fff;text-decoration:none;padding:11px 26px;border-radius:6px;font-size:14px;font-weight:bold;display:inline-block">Open Your Portal &rarr;</a>
      </div>

      <!-- Affiliate link reminder -->
      <div style="background:#f9f6f0;border-left:4px solid #c8923a;padding:20px 24px;margin:28px 0;border-radius:0 6px 6px 0">
        <p style="margin:0 0 8px;font-weight:bold;color:#101e14;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Your Affiliate Link</p>
        <p style="margin:0;font-family:monospace;font-size:16px;color:#c8923a;word-break:break-all">${affiliateLink}</p>
      </div>

      <p style="color:#555;font-size:15px;line-height:1.7">
        Put your link in front of investors, hand them the BRRRR Analyzer, and check your
        portal to see the leads roll in. Every deal that closes through your link earns you a
        referral fee &mdash; with no cap on how much you can earn.
      </p>

      <p style="color:#555;font-size:14px;line-height:1.7">
        Questions about a deal, a program, or the portal? Just reply to this email or call us
        at <strong>(678) 842-8084</strong>. We're glad to help you get one across the finish line.
      </p>

      <p style="color:#555;font-size:15px;margin:24px 0 0">
        Talk soon,<br/>
        <strong style="color:#101e14">Edgar Vargas</strong><br/>
        Southern Ground Capital
      </p>
    </div>

    <!-- Footer -->
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
