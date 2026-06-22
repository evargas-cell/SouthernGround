// Lead magnet delivery — emails the Fix & Flip Underwriting Checklist to the
// person who submitted the form, BCCs Edgar, and logs the lead in Airtable.
// Mirrors the affiliate-register.js pattern (Resend + Airtable).

const CHECKLIST_URL = 'https://sgcapital.io/fix-flip-checklist.html';

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

  const { name, email } = body;
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email required' }) };
  }

  const safeName = (name || '').trim();
  const dateRequested = new Date().toISOString().split('T')[0];

  // Store the lead in Airtable
  const AIRTABLE_TOKEN   = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (AIRTABLE_TOKEN && AIRTABLE_BASE_ID) {
    try {
      const atRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Name:            safeName,
            Email:           email,
            Resource:        'Fix & Flip Underwriting Checklist',
            'Date Requested': dateRequested,
          },
        }),
      });
      if (!atRes.ok) {
        const atErr = await atRes.text();
        console.error('Airtable error:', atRes.status, atErr);
      } else {
        console.log('Airtable lead record created successfully');
      }
    } catch (err) {
      console.error('Airtable fetch error:', err);
    }
  } else {
    console.log('Airtable env vars missing — AIRTABLE_TOKEN:', !!AIRTABLE_TOKEN, 'AIRTABLE_BASE_ID:', !!AIRTABLE_BASE_ID);
  }

  // Send the checklist via Resend
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY missing — cannot send checklist email');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Email service not configured' }),
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Southern Ground Capital <resources@sgcapital.io>',
        to:  [email],
        bcc: ['edgar@sgcapital.io'],
        reply_to: 'edgar@sgcapital.io',
        subject: 'Your Fix & Flip Underwriting Checklist (from Southern Ground Capital)',
        html: buildChecklistEmail(safeName),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error:', res.status, errText);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Could not send email' }),
      };
    }
  } catch (err) {
    console.error('Resend fetch error:', err);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Could not send email' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ok: true }),
  };
};

function buildChecklistEmail(name) {
  const firstName = name ? name.split(' ')[0] : 'there';
  const year = new Date().getFullYear();

  const sectionHeading = (t) =>
    `<h3 style="color:#101e14;font-size:17px;margin:32px 0 10px;padding-bottom:8px;border-bottom:2px solid #c8923a">${t}</h3>`;

  const item = (t) =>
    `<tr><td style="vertical-align:top;padding:6px 10px 6px 0;color:#c8923a;font-weight:bold;font-size:15px">&#10003;</td>
         <td style="padding:6px 0;color:#444;font-size:15px;line-height:1.55">${t}</td></tr>`;

  const list = (items) =>
    `<table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 4px">${items.map(item).join('')}</table>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,'Times New Roman',serif">
  <div style="max-width:640px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">

    <div style="background:#101e14;padding:32px 40px">
      <h1 style="margin:0;color:#c8923a;font-size:21px;letter-spacing:1px">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Hard Money Lending &middot; Private Capital</p>
    </div>

    <div style="padding:40px">
      <p style="text-transform:uppercase;letter-spacing:1px;color:#c8923a;font-size:12px;font-weight:bold;margin:0 0 6px">Free Investor Resource</p>
      <h2 style="color:#101e14;font-size:26px;margin:0 0 14px;line-height:1.25">The Fix &amp; Flip Underwriting Checklist</h2>
      <p style="color:#555;font-size:15px;line-height:1.7;margin:0">
        Hi ${firstName} &mdash; thanks for requesting the checklist. Below is the exact framework
        Southern Ground Capital uses to evaluate fix and flip deals, the same criteria applied
        across <strong>$500M+</strong> in funded loans. Work through it on your next deal before
        you make an offer.
      </p>

      <div style="text-align:center;margin:28px 0 8px">
        <a href="${CHECKLIST_URL}" style="background:#c8923a;color:#fff;text-decoration:none;padding:14px 30px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block">View &amp; Print the Full Checklist &rarr;</a>
      </div>
      <p style="text-align:center;color:#999;font-size:12px;margin:0 0 8px">Bookmark it or print to PDF for your deal files.</p>

      ${sectionHeading('1. ARV Calculation Worksheet')}
      ${list([
        'Pull 3&ndash;5 sold comps within 0.5 miles, sold in the last 90 days',
        'Match comps on bed/bath count, square footage (&plusmn;20%), and condition after rehab',
        'Adjust for differences: lot size, garage, pool, finished basement, updates',
        'Use price-per-square-foot of comps &times; subject square footage as a cross-check',
        'Confirm the ARV against active and pending listings (your future competition)',
        'Be conservative &mdash; underwrite to the median comp, not the highest',
      ])}

      ${sectionHeading('2. Rehab Cost Estimator')}
      ${list([
        'Roof, foundation, and structural &mdash; inspect first, these kill deals',
        'Mechanicals: HVAC, electrical panel/rewire, plumbing repipe',
        'Kitchen (cabinets, counters, appliances) and bathrooms',
        'Flooring, interior/exterior paint, drywall, trim, doors',
        'Windows, siding, landscaping, and curb appeal',
        'Permits, dumpsters, utilities during rehab, and holding costs',
        'Add a 10&ndash;15% contingency for surprises behind the walls',
      ])}

      ${sectionHeading("3. Deal Scoring Criteria (SGC's Internal Rubric)")}
      ${list([
        '<strong>70% Rule:</strong> Max offer &le; (ARV &times; 0.70) &minus; rehab cost',
        '<strong>Profit margin:</strong> Target net profit of 15&ndash;20% of ARV after all costs',
        '<strong>Days on market:</strong> Comps selling in under 60 days signal a liquid exit',
        '<strong>Exit spread:</strong> ARV comfortably above your all-in (purchase + rehab + holding + selling)',
        '<strong>Neighborhood:</strong> Stable or appreciating, low crime, desirable school zone',
        '<strong>Scope match:</strong> Rehab level fits your crew&rsquo;s experience and timeline',
      ])}

      ${sectionHeading('4. Common Underwriting Mistakes to Avoid')}
      ${list([
        'Using list prices or Zestimates instead of verified sold comps for ARV',
        'Underestimating rehab by skipping a contractor walkthrough',
        'Forgetting holding costs &mdash; loan interest, taxes, insurance, utilities',
        'Ignoring selling costs: agent commissions, closing, concessions',
        'No contingency line for hidden damage and overruns',
        'Falling in love with a deal and stretching the ARV to justify the price',
      ])}

      <div style="background:#f9f6f0;border-left:4px solid #c8923a;padding:20px 24px;margin:32px 0 8px;border-radius:0 6px 6px 0">
        <p style="margin:0 0 6px;font-weight:bold;color:#101e14;font-size:15px">Got a deal that pencils out?</p>
        <p style="margin:0;color:#555;font-size:15px;line-height:1.6">
          We fund fix &amp; flip loans in as few as 5 days. Reply to this email or call
          <strong>(678) 842-8084</strong> and we&rsquo;ll get you a term sheet.
        </p>
      </div>

      <p style="color:#555;font-size:15px;margin:24px 0 0">
        To your next profitable flip,<br/>
        <strong style="color:#101e14">Edgar Vargas</strong><br/>
        Southern Ground Capital
      </p>
    </div>

    <div style="background:#f5f5f0;padding:16px 40px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">&copy; ${year} Southern Ground Capital, LLC &middot; Investment loans only &middot; You requested this resource at sgcapital.io</p>
    </div>

  </div>
</body>
</html>`;
}
