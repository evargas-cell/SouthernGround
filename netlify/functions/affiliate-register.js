exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, phone, role } = body;
  if (!name || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Name and email required' }) };
  }

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const affiliateLink = `https://sgcapital.io/?ref=${slug}`;
  const dateRegistered = new Date().toISOString().split('T')[0];

  // Store in Airtable
  const AIRTABLE_TOKEN   = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (AIRTABLE_TOKEN && AIRTABLE_BASE_ID) {
    try {
      const atRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Affiliates`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Name:              name,
            Email:             email,
            Phone:             phone || '',
            Role:              role  || '',
            'Affiliate Link':  affiliateLink,
            Slug:              slug,
            'Date Registered': dateRegistered,
          },
        }),
      });
      if (!atRes.ok) {
        const atErr = await atRes.text();
        console.error('Airtable error:', atRes.status, atErr);
      } else {
        console.log('Airtable record created successfully');
      }
    } catch (err) {
      console.error('Airtable fetch error:', err);
    }
  } else {
    console.log('Airtable env vars missing — AIRTABLE_TOKEN:', !!AIRTABLE_TOKEN, 'AIRTABLE_BASE_ID:', !!AIRTABLE_BASE_ID);
  }

  // Send welcome email via Resend
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Southern Ground Capital <affiliates@sgcapital.io>',
          to:  [email],
          bcc: ['edgar@sgcapital.io'],
          subject: 'Welcome to the Southern Ground Capital Affiliate Program!',
          html: buildWelcomeEmail(name, phone, role, affiliateLink),
        }),
      });
    } catch (err) {
      console.error('Resend error:', err);
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ affiliateLink, slug }),
  };
};

function buildWelcomeEmail(name, phone, role, affiliateLink) {
  const firstName = name.split(' ')[0];
  const year = new Date().getFullYear();
  const roleLine = role ? `<p style="margin:4px 0 0;color:#888;font-size:13px">${role}</p>` : '';
  const phoneLine = phone
    ? `<p style="margin:0 0 4px;color:#555;font-size:14px"><strong>Phone:</strong> ${phone}</p>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">

    <div style="background:#101e14;padding:32px 40px">
      <h1 style="margin:0;color:#c8923a;font-size:22px;letter-spacing:1px">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Hard Money Lending · Private Capital</p>
    </div>

    <div style="padding:40px">
      <h2 style="color:#101e14;font-size:26px;margin:0 0 4px">Welcome to the Community, ${firstName}!</h2>
      ${roleLine}
      <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px">
        You're officially part of the Southern Ground Capital affiliate network.
        We're excited to have you as a partner — together we can help more real estate
        investors access the capital they need to close deals fast.
      </p>

      <div style="background:#f9f6f0;border-left:4px solid #c8923a;padding:20px 24px;margin:28px 0;border-radius:0 6px 6px 0">
        <p style="margin:0 0 8px;font-weight:bold;color:#101e14;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Your Unique Affiliate Link</p>
        <p style="margin:0;font-family:monospace;font-size:16px;color:#c8923a;word-break:break-all">${affiliateLink}</p>
      </div>

      <h3 style="color:#101e14;font-size:18px;margin:28px 0 12px">Tips to Get Your First Deal</h3>
      <ul style="color:#555;font-size:15px;line-height:1.9;padding-left:20px;margin:0 0 24px">
        <li>Add your link to your email signature so every email you send is an opportunity</li>
        <li>Post on LinkedIn, Facebook, or Instagram — let investors know you can connect them with fast private capital</li>
        <li>Tell your real estate agent and wholesaler contacts you have a reliable hard money lender source</li>
        <li>When a client needs a fix &amp; flip loan, bridge loan, or DSCR rental financing, send them to your link and we'll handle the rest</li>
      </ul>

      <p style="color:#555;font-size:15px;line-height:1.7">
        Every deal that closes through your link earns you a referral fee. There's no cap
        on how much you can earn — the more deals you refer, the more you make.
      </p>

      <div style="text-align:center;margin:32px 0">
        <a href="${affiliateLink}" style="background:#c8923a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block">Share Your Link Now &rarr;</a>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.7">
        Have questions? Reply to this email or call us at <strong>(678) 842-8084</strong>.
        Your dedicated affiliate specialist will be in touch shortly.
      </p>

      <p style="color:#555;font-size:15px;margin:24px 0 0">
        To your success,<br/>
        <strong style="color:#101e14">Edgar Vargas</strong><br/>
        Southern Ground Capital
      </p>
    </div>

    <!-- Contact info block visible to Edgar via BCC only in spirit — included in email body -->
    <div style="background:#f9f6f0;padding:20px 40px;border-top:1px solid #e5e0d8">
      <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Affiliate Registration Details</p>
      <p style="margin:0 0 4px;color:#555;font-size:14px"><strong>Name:</strong> ${name}</p>
      ${phoneLine}
      ${role ? `<p style="margin:0 0 4px;color:#555;font-size:14px"><strong>Role:</strong> ${role}</p>` : ''}
      <p style="margin:0;color:#555;font-size:14px"><strong>Link:</strong> ${affiliateLink}</p>
    </div>

    <div style="background:#f5f5f0;padding:16px 40px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">&copy; ${year} Southern Ground Capital, LLC &middot; Investment loans only</p>
    </div>

  </div>
</body>
</html>`;
}
