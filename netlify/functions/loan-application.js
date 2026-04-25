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

  const {
    first_name, last_name, email, phone, role, loan_program, target_close_date,
    property_address, property_city, property_state, property_zip, property_type,
    as_is_value, after_repair_value, is_renovation, rehab_budget,
    transaction_type, purchase_price, desired_loan_amount, desired_leverage,
    exit_strategy, needs_gap_funding,
    credit_score, cash_reserves, experience_level, citizenship_status,
    bankruptcy_foreclosure, judgments_felonies, co_borrower,
    entity_name, entity_type, additional_notes,
  } = body;

  if (!first_name || !last_name || !email || !phone) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Required fields missing' }) };
  }

  const fullName = `${first_name} ${last_name}`;
  const dateSubmitted = new Date().toISOString().split('T')[0];

  // === STORE IN AIRTABLE ===
  const AIRTABLE_TOKEN   = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (AIRTABLE_TOKEN && AIRTABLE_BASE_ID) {
    try {
      const atRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Applications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'First Name':            first_name,
            'Last Name':             last_name,
            'Email':                 email,
            'Phone':                 phone,
            'Role':                  role              || '',
            'Loan Program':          loan_program      || '',
            'Target Close Date':     target_close_date || '',
            'Property Address':      property_address  || '',
            'City':                  property_city     || '',
            'State':                 property_state    || '',
            'Zip':                   property_zip      || '',
            'Property Type':         property_type     || '',
            'As-Is Value':           as_is_value       || '',
            'After Repair Value':    after_repair_value || '',
            'Renovation Project':    is_renovation     || '',
            'Rehab Budget':          rehab_budget      || '',
            'Transaction Type':      transaction_type  || '',
            'Purchase Price':        purchase_price    || '',
            'Desired Loan Amount':   desired_loan_amount || '',
            'Desired Leverage':      desired_leverage  || '',
            'Exit Strategy':         exit_strategy     || '',
            'Gap Funding Needed':    needs_gap_funding || '',
            'Credit Score':          credit_score      || '',
            'Cash Reserves':         cash_reserves     || '',
            'Experience Level':      experience_level  || '',
            'Citizenship Status':    citizenship_status || '',
            'Bankruptcy/Foreclosure': bankruptcy_foreclosure || '',
            'Judgments/Felonies':    judgments_felonies || '',
            'Co-Borrower':           co_borrower       || '',
            'Entity Name':           entity_name       || '',
            'Entity Type':           entity_type       || '',
            'Notes':                 additional_notes  || '',
            'Date Submitted':        dateSubmitted,
            'Status':                'New',
          },
        }),
      });

      if (!atRes.ok) {
        const atErr = await atRes.text();
        console.error('Airtable error:', atRes.status, atErr);
      } else {
        console.log('Airtable application record created');
      }
    } catch (err) {
      console.error('Airtable fetch error:', err);
    }
  } else {
    console.log('Airtable env vars missing — AIRTABLE_TOKEN:', !!AIRTABLE_TOKEN, 'AIRTABLE_BASE_ID:', !!AIRTABLE_BASE_ID);
  }

  // === SEND EMAILS VIA RESEND ===
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    try {
      // Notification to Edgar
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    'Southern Ground Capital <loans@sgcapital.io>',
          to:      ['edgar@sgcapital.io'],
          subject: `New Loan Application — ${fullName} | ${loan_program || 'Loan TBD'}`,
          html:    buildNotificationEmail(body, fullName, dateSubmitted),
        }),
      });

      // Confirmation to applicant
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    'Southern Ground Capital <loans@sgcapital.io>',
          to:      [email],
          subject: 'Application Received — Southern Ground Capital',
          html:    buildConfirmationEmail(first_name, loan_program),
        }),
      });
    } catch (err) {
      console.error('Resend error:', err);
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ success: true }),
  };
};

function buildNotificationEmail(d, fullName, dateSubmitted) {
  const row = (label, value) => value
    ? `<tr><td style="padding:6px 12px;color:#556B5C;font-size:13px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eee"><strong>${label}</strong></td><td style="padding:6px 12px;color:#1C2B20;font-size:13px;border-bottom:1px solid #eee">${value}</td></tr>`
    : '';

  const section = (title, rows) => `
    <h3 style="color:#9B6820;font-size:12px;text-transform:uppercase;letter-spacing:.5px;margin:24px 0 6px">${title}</h3>
    <table style="width:100%;border-collapse:collapse;border:1px solid #DAE3DC;border-radius:6px;overflow:hidden">${rows}</table>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:700px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">
    <div style="background:#16261C;padding:24px 32px">
      <h1 style="margin:0;color:#9B6820;font-size:20px;letter-spacing:1px">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px">New Loan Application — ${dateSubmitted}</p>
    </div>
    <div style="padding:32px">
      <h2 style="color:#16261C;margin:0 0 4px">${fullName}</h2>
      <p style="color:#556B5C;margin:0 0 20px;font-size:14px">${d.role || ''} · ${d.loan_program || ''}</p>

      ${section('Contact', row('Email', d.email) + row('Phone', d.phone) + row('Role', d.role))}
      ${section('Deal', row('Loan Program', d.loan_program) + row('Transaction Type', d.transaction_type) + row('Target Close Date', d.target_close_date) + row('Purchase Price', d.purchase_price) + row('Desired Loan Amount', d.desired_loan_amount) + row('Desired Leverage', d.desired_leverage) + row('Exit Strategy', d.exit_strategy) + row('Gap Funding', d.needs_gap_funding))}
      ${section('Property', row('Address', d.property_address) + row('City / State / Zip', [d.property_city, d.property_state, d.property_zip].filter(Boolean).join(', ')) + row('Property Type', d.property_type) + row('As-Is Value', d.as_is_value) + row('After Repair Value', d.after_repair_value) + row('Renovation?', d.is_renovation) + row('Rehab Budget', d.rehab_budget))}
      ${section('Borrower Profile', row('Credit Score', d.credit_score) + row('Cash Reserves', d.cash_reserves) + row('Experience', d.experience_level) + row('Citizenship', d.citizenship_status) + row('Bankruptcy/Foreclosure', d.bankruptcy_foreclosure) + row('Judgments/Felonies', d.judgments_felonies) + row('Co-Borrower', d.co_borrower))}
      ${section('Entity', row('Entity Name', d.entity_name) + row('Entity Type', d.entity_type))}
      ${d.additional_notes ? `<div style="background:#f9f6f0;border-left:4px solid #9B6820;padding:16px 20px;margin-top:20px;border-radius:0 6px 6px 0"><strong style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#9B6820">Notes</strong><p style="margin:8px 0 0;color:#1C2B20;font-size:14px">${d.additional_notes}</p></div>` : ''}
    </div>
    <div style="background:#f5f5f0;padding:16px 32px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">Southern Ground Capital — Loan Application Notification</p>
    </div>
  </div>
</body>
</html>`;
}

function buildConfirmationEmail(firstName, loanProgram) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">
    <div style="background:#16261C;padding:32px 40px">
      <h1 style="margin:0;color:#9B6820;font-size:22px;letter-spacing:1px">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Hard Money Lending · Private Capital</p>
    </div>
    <div style="padding:40px">
      <h2 style="color:#16261C;font-size:26px;margin:0 0 16px">Application Received, ${firstName}!</h2>
      <p style="color:#555;font-size:15px;line-height:1.7">
        Thank you for submitting your loan application to Southern Ground Capital. We've received your request
        for a <strong>${loanProgram || 'loan'}</strong> and a specialist will review your details and
        reach out within <strong>24 business hours</strong>.
      </p>
      <div style="background:#f9f6f0;border-left:4px solid #9B6820;padding:20px 24px;margin:28px 0;border-radius:0 6px 6px 0">
        <p style="margin:0 0 10px;font-weight:bold;color:#16261C;font-size:13px;text-transform:uppercase;letter-spacing:.5px">What Happens Next</p>
        <ul style="margin:0;padding-left:20px;color:#555;font-size:14px;line-height:2">
          <li>We review your deal details (typically within a few hours)</li>
          <li>A loan specialist calls or emails you to discuss your deal</li>
          <li>We issue a term sheet — no credit pull, no upfront fees</li>
          <li>You choose to proceed — zero obligation</li>
        </ul>
      </div>
      <p style="color:#555;font-size:14px;line-height:1.7">
        Have questions in the meantime? Call or text us at <strong>(678) 842-8084</strong> or reply to this email.
      </p>
      <p style="color:#555;font-size:15px;margin:24px 0 0">
        To your success,<br/>
        <strong style="color:#16261C">Edgar Vargas</strong><br/>
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
