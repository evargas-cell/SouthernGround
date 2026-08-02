const { configured, sbInsert, getAffiliateByRef } = require('./lib/supabase');

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
    transaction_type, loan_purpose, purchase_price, purchase_date,
    work_completed, reno_spent_to_date, property_liens,
    exit_strategy, rental_strategy, is_rural,
    credit_score, cash_reserves, experience_level, citizenship_status,
    professional_licenses, hiring_gc,
    bankruptcy_foreclosure, judgments_felonies, co_borrower,
    entity_name, entity_type, additional_notes, referred_by,
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
            'Loan Purpose':          loan_purpose      || '',
            'Purchase Price':        purchase_price    || '',
            'Purchase Date':         purchase_date     || '',
            'Work Completed':        work_completed    || '',
            'Reno Spent to Date':    reno_spent_to_date || '',
            'Property Liens':        property_liens    || '',
            'Exit Strategy':         exit_strategy     || '',
            'Rental Strategy':       rental_strategy   || '',
            'Rural Area':            is_rural          || '',
            'Credit Score (FICO)':   credit_score ? Number(String(credit_score).replace(/[^0-9]/g, '')) : null,
            'Cash Reserves':         parseMoney(cash_reserves),
            'Experience Level':      experience_level  || '',
            'Citizenship Status':    citizenship_status || '',
            'Professional Licenses': professional_licenses || '',
            'Hiring General Contractor': hiring_gc     || '',
            'Bankruptcy/Foreclosure': bankruptcy_foreclosure || '',
            'Judgments/Felonies':    judgments_felonies || '',
            'Co-Borrower':           co_borrower       || '',
            'Entity Name':           entity_name       || '',
            'Entity Type':           entity_type       || '',
            'Notes':                 additional_notes  || '',
            'Referred By':           referred_by       || '',
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

  // === STORE LEAD IN SUPABASE (affiliate attribution) ===
  // Connects this application to the affiliate whose link referred it, so the
  // portal can show click -> lead -> closed. Best-effort; never blocks the form.
  // Estimate the loan amount for both the stored lead and the affiliate's
  // estimated-commission email. Basis depends on program (see estimateLoanAmount).
  const estimatedLoanAmount = estimateLoanAmount(loan_program, {
    purchase_price, rehab_budget, after_repair_value, as_is_value,
    experience_level, credit_score,
  });

  let affiliate = null;
  if (configured()) {
    try {
      affiliate = await getAffiliateByRef(referred_by);
      const res = await sbInsert('leads', {
        affiliate_id:    affiliate ? affiliate.id : null,
        ref_code:        referred_by ? String(referred_by).toLowerCase() : null,
        first_name,
        last_name,
        email,
        phone,
        loan_program:    loan_program     || null,
        property_address: property_address || null,
        loan_amount:     estimatedLoanAmount ?? (parseMoney(purchase_price) ?? parseMoney(after_repair_value)),
        status:          'new',
      });
      if (!res.ok) {
        console.error('Supabase lead insert failed:', res.status, await res.text());
      }
    } catch (err) {
      console.error('Supabase lead error:', err);
    }
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

      // Thank-you + "a loan was submitted through your link" to the referring
      // affiliate, with an ESTIMATED commission (1 point = 1% of loan amount).
      // Only fires when the lead is attributed to an affiliate we can email.
      if (affiliate && affiliate.email) {
        // SGC charges 1 point (1% of the loan). The affiliate earns 30% of that
        // origination fee, so their estimated commission is 30% × 1% = 0.3% of
        // the loan amount.
        const originationFee = estimatedLoanAmount ? Math.round(estimatedLoanAmount * ORIGINATION_POINT) : null;
        const estCommission  = originationFee != null ? Math.round(originationFee * AFFILIATE_SHARE) : null;
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from:    'Southern Ground Capital <affiliates@sgcapital.io>',
            to:      [affiliate.email],
            subject: `You have a new loan submission${estCommission ? ` — est. ${fmtMoney(estCommission)} commission` : ''}`,
            html:    buildAffiliateNotificationEmail({
              affiliateName:  affiliate.name,
              borrowerName:   `${first_name} ${(last_name || '').charAt(0)}${last_name ? '.' : ''}`.trim(),
              loanProgram:    loan_program,
              estimatedLoan:  estimatedLoanAmount,
              originationFee,
              estCommission,
              affiliateLink:  affiliate.affiliate_link || `https://sgcapital.io/?ref=${affiliate.ref_code || ''}`,
            }),
          }),
        });
      }
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

// Commission model: SGC charges 1 point (1% of the loan) as its origination fee,
// and the affiliate earns 30% of that fee. Change these to reprice.
const ORIGINATION_POINT = 0.01; // 1 point = 1% of loan amount
const AFFILIATE_SHARE   = 0.30; // affiliate keeps 30% of the origination fee

// Exported for previewing/testing the estimate + affiliate email off-box.
exports.estimateLoanAmount = estimateLoanAmount;
exports.buildAffiliateNotificationEmail = buildAffiliateNotificationEmail;

// Pull a numeric dollar amount out of a free-text money field ("$250,000" -> 250000).
function parseMoney(v) {
  if (!v) return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ''));
  return !n || isNaN(n) ? null : n;
}

// Format a number as USD with no cents ("12500" -> "$12,500").
function fmtMoney(n) {
  if (n == null || isNaN(n)) return '';
  return '$' + Math.round(n).toLocaleString('en-US');
}

// Estimate the loan amount that the commission estimate is based on. Mirrors the
// broker Loan Products flyer + Deal Qualification Guide:
//   Loan-to-cost programs — LTC% × (purchase + rehab), capped at 70% of ARV:
//     - Fix & Flip:  90/85/80% LTC, tiered by experience + credit (fixFlipLtcPct)
//     - New Builds:  85% LTC (flat)
//   Loan-to-value programs — LTV% × property value (as-is preferred, then ARV):
//     - DSCR:                80% LTV
//     - Refinance/Cash-Out:  75% LTV
//     - Bridge:              75% LTV
//     - Multi-Family:        75% LTV (not on flyer; conservative default)
// Returns a number, or null if we don't have enough to estimate.
function estimateLoanAmount(loanProgram, fields) {
  const program = String(loanProgram || '').toLowerCase();
  const purchase = parseMoney(fields.purchase_price);
  const rehab    = parseMoney(fields.rehab_budget);
  const arv      = parseMoney(fields.after_repair_value);
  const asIs     = parseMoney(fields.as_is_value);

  // --- Loan-to-cost: Fix & Flip and New Builds / Ground-Up Construction ---
  const isFixFlip  = program.includes('flip') || program.includes('fix');
  const isNewBuild = program.includes('construction') || program.includes('build');
  if (isFixFlip || isNewBuild) {
    const base = purchase ?? asIs;
    if (!base) return null;
    const totalCost = base + (rehab || 0);
    const ltcPct = isFixFlip
      ? fixFlipLtcPct(fields.experience_level, fields.credit_score) // 90/85/80
      : 0.85;                                                       // New Builds: up to 85% LTC
    let loan = totalCost * ltcPct;
    if (arv) loan = Math.min(loan, arv * 0.70); // loan cannot exceed 70% of ARV
    return loan;
  }

  // --- Loan-to-value: DSCR, Refinance/Cash-Out, Bridge, Multi-Family ---
  let ltvPct = null;
  if (program.includes('dscr')) ltvPct = 0.80;
  else if (program.includes('refinance')) ltvPct = 0.75;
  else if (program.includes('bridge')) ltvPct = 0.75;
  else if (program.includes('multi')) ltvPct = 0.75;
  if (ltvPct) {
    const value = asIs ?? arv ?? purchase;
    return value ? value * ltvPct : null;
  }

  // --- Fallback (unknown program): purchase + rehab ---
  const base = purchase ?? asIs;
  if (!base) return null;
  return base + (rehab || 0);
}

// Fix & flip loan-to-cost tier, per the broker Deal Qualification Guide:
//   - 90% : seasoned (3+ deals) AND FICO >= 700
//   - 85% : has any prior experience OR FICO >= 700
//   - 80% : first deal AND FICO < 700 (weakest profile)
function fixFlipLtcPct(experienceLevel, creditScore) {
  const exp  = String(experienceLevel || '').toLowerCase();
  const fico = parseInt(String(creditScore || '').replace(/[^0-9]/g, ''), 10);
  const goodCredit = !isNaN(fico) && fico >= 700;
  const firstDeal  = exp.includes('first') || /^0\b/.test(exp) || exp === '';
  const seasoned   = /3-5|6-10|11-20|20\s*\+/.test(exp); // 3+ deals
  const someExperience = !firstDeal;                     // 1-2 deals or more

  if (seasoned && goodCredit) return 0.90;
  if (someExperience || goodCredit) return 0.85;
  return 0.80;
}

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

      ${section('Contact', row('Email', d.email) + row('Phone', d.phone) + row('Role', d.role) + row('Referred By', d.referred_by || 'Direct (no affiliate)'))}
      ${section('Deal', row('Loan Program', d.loan_program) + row('Transaction Type', d.transaction_type) + row('Loan Purpose', d.loan_purpose) + row('Target Close Date', d.target_close_date) + row('Purchase Price', d.purchase_price) + row('Purchase Date', d.purchase_date) + row('Work Completed?', d.work_completed) + row('Reno Spent to Date', d.reno_spent_to_date) + row('Liens', d.property_liens) + row('Exit Strategy', d.exit_strategy) + row('Rental Strategy', d.rental_strategy) + row('Rural Area?', d.is_rural))}
      ${section('Property', row('Address', d.property_address) + row('City / State / Zip', [d.property_city, d.property_state, d.property_zip].filter(Boolean).join(', ')) + row('Property Type', d.property_type) + row('As-Is Value', d.as_is_value) + row('After Repair Value', d.after_repair_value) + row('Renovation?', d.is_renovation) + row('Rehab Budget', d.rehab_budget))}
      ${section('Borrower Profile', row('Credit Score (FICO)', d.credit_score) + row('Cash Reserves', d.cash_reserves) + row('Experience', d.experience_level) + row('Citizenship', d.citizenship_status) + row('Professional Licenses', d.professional_licenses) + row('Hiring GC?', d.hiring_gc) + row('Bankruptcy/Foreclosure', d.bankruptcy_foreclosure) + row('Judgments/Felonies', d.judgments_felonies) + row('Co-Borrower', d.co_borrower))}
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

// Thank-you + new-submission notification for the referring affiliate, including
// an ESTIMATED commission (1 point = 1% of the estimated loan amount). The
// estimate is clearly labeled — the actual commission is set at closing.
function buildAffiliateNotificationEmail(d) {
  const firstName = (d.affiliateName || 'there').split(' ')[0];
  const year = new Date().getFullYear();
  const portalUrl = 'https://sgcapital.io/portal';

  const estRow = (label, value) => value
    ? `<tr><td style="padding:8px 0;color:#556B5C;font-size:14px">${label}</td><td style="padding:8px 0;color:#101e14;font-size:14px;font-weight:bold;text-align:right">${value}</td></tr>`
    : '';

  const hasEstimate = d.estCommission != null;

  // DSCR estimates key off the property's appraised value — call that out so the
  // affiliate understands the basis (and that a formal appraisal confirms it).
  const isDscr = String(d.loanProgram || '').toLowerCase().includes('dscr');
  const dscrNote = isDscr
    ? `<p style="color:#8a8a8a;font-size:12px;line-height:1.6;margin:8px 0 0">
        <strong>DSCR note:</strong> this estimate is based on the property's
        <strong>appraised value</strong> at up to 80% LTV. The final loan amount is
        set by the formal appraisal and the property's rental income (DSCR).
      </p>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">

    <div style="background:#101e14;padding:32px 40px">
      <h1 style="margin:0;color:#c8923a;font-size:22px;letter-spacing:1px">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Affiliate Notification &middot; New Loan Submission</p>
    </div>

    <div style="padding:40px">
      <h2 style="color:#101e14;font-size:26px;margin:0 0 4px">Nice work, ${firstName}! 🎉</h2>
      <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px">
        Good news — <strong>a loan was just submitted through your affiliate link.</strong>
        Thank you for the referral. Our team is reviewing the application now and will
        move it through the pipeline. Here are the details:
      </p>

      <h3 style="color:#101e14;font-size:16px;margin:28px 0 8px">Submission Details</h3>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee5d6;border-bottom:1px solid #eee5d6">
        ${estRow('Applicant', d.borrowerName || '—')}
        ${estRow('Loan Program', d.loanProgram || '—')}
        ${estRow('Estimated Loan Amount', d.estimatedLoan ? fmtMoney(d.estimatedLoan) : 'To be confirmed')}
        ${estRow('Origination Fee (1 point)', d.originationFee != null ? fmtMoney(d.originationFee) : '')}
        ${estRow('Your Share (30%)', hasEstimate ? fmtMoney(d.estCommission) : '')}
      </table>

      ${hasEstimate ? `
      <div style="background:#f0f6f2;border:1px solid #c3d9c8;border-radius:8px;padding:24px 28px;margin:28px 0;text-align:center">
        <p style="margin:0 0 6px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#2a6645">Estimated Commission</p>
        <p style="margin:0;color:#101e14;font-size:34px;font-weight:bold;line-height:1.1">${fmtMoney(d.estCommission)}</p>
        <p style="margin:8px 0 0;color:#2a6645;font-size:13px">30% of the 1-point (1%) origination fee</p>
      </div>
      <p style="color:#8a8a8a;font-size:12px;line-height:1.6;margin:0 0 4px">
        <strong>This is only an estimate.</strong> We charge 1 point (1% of the loan amount)
        as our origination fee, and you earn 30% of that fee. This figure is based on the
        loan amount entered on the application and may change as the deal is underwritten.
        Your actual commission is finalized when the loan closes and depends on the final
        loan amount and program terms. No commission is earned until the loan closes.
      </p>
      ${dscrNote}
      ` : `
      <div style="background:#f9f6f0;border-left:4px solid #c8923a;padding:20px 24px;margin:28px 0;border-radius:0 6px 6px 0">
        <p style="margin:0;color:#555;font-size:14px;line-height:1.7">
          We'll estimate your commission once the loan amount is confirmed. Your actual
          commission is finalized when the loan closes.
        </p>
      </div>
      `}

      <div style="text-align:center;margin:32px 0 8px">
        <a href="${portalUrl}" style="background:#101e14;color:#fff;text-decoration:none;padding:13px 30px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block">Track It in Your Portal &rarr;</a>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.7;margin-top:24px">
        Keep the referrals coming — every deal that closes through your link earns you a
        commission. Questions? Reply to this email or call us at <strong>(678) 842-8084</strong>.
      </p>

      <p style="color:#555;font-size:15px;margin:24px 0 0">
        With appreciation,<br/>
        <strong style="color:#101e14">Edgar Vargas</strong><br/>
        Southern Ground Capital
      </p>
    </div>

    <div style="background:#f5f5f0;padding:16px 40px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">&copy; ${year} Southern Ground Capital, LLC &middot; Commission estimates are not a guarantee of payment</p>
    </div>

  </div>
</body>
</html>`;
}
