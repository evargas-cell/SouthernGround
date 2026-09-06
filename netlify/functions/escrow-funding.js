const { configured, sbInsert, getAffiliateByRef } = require('./lib/supabase');

// Where escrow funding requests are routed. EMD and double-close deals are
// time-critical, so these go to the funding desk rather than the loan inbox.
const FUNDING_INBOX = 'edgar@sgcapital.io';
const FROM_ADDRESS  = 'Southern Ground Capital <loans@sgcapital.io>';

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
    deal_type, emd_soft, amount_needed, dc_days, two_title_companies,
    submitter_name, submitter_email, submitter_phone,
    submitter_role, connector_fee,
    property_address, borrower_name, borrower_email, borrower_address,
    borrower_experience, exit_strategy,
    dd_end_date, coe_date, funding_date, mutual_release_state,
    title_company_info, deal_link,
    profit_source, deal_summary,
    quoted_fee, quoted_deposit, needs_review,
    referred_by, attachments,
  } = body;

  if (!deal_type || !submitter_name || !submitter_email || !submitter_phone || !amount_needed) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Required fields missing' }) };
  }

  const dateSubmitted = new Date().toISOString().split('T')[0];
  const isEmd         = String(deal_type).startsWith('EMD');
  const amountNum     = parseMoney(amount_needed);

  // Recompute the fee server-side rather than trusting the number the browser
  // sent, so a tampered payload can't book a deal at the wrong price. The
  // client's figure is kept alongside it purely to flag a mismatch.
  const serverFee = computeFee(deal_type, amountNum, dc_days);
  const clientFee = quoted_fee != null ? Number(quoted_fee) : null;
  const feeMismatch =
    serverFee.total != null && clientFee != null && Math.round(serverFee.total) !== Math.round(clientFee);
  if (feeMismatch) {
    console.warn('Escrow fee mismatch — client:', clientFee, 'server:', serverFee.total, 'deal:', deal_type, amountNum);
  }

  const feeForRecord     = serverFee.total;
  const depositForRecord = serverFee.deposit != null ? Math.round(serverFee.deposit) : null;

  // A connector marks the deal up; a borrower pays our fee alone. Only trust a
  // connector fee when they actually submitted as one.
  const isConnector    = submitter_role === 'Connector';
  const connectorFee   = isConnector ? parseMoney(connector_fee) : null;
  const totalToBorrower = feeForRecord != null ? feeForRecord + (connectorFee || 0) : null;

  // === STORE IN AIRTABLE ===
  const AIRTABLE_TOKEN   = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (AIRTABLE_TOKEN && AIRTABLE_BASE_ID) {
    try {
      const atRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Escrow%20Funding`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Deal Type':             deal_type,
            'Amount Needed':         amountNum,
            'Our Fee':               feeForRecord,
            'Deposit Due':           depositForRecord,
            'Submitter Role':        submitter_role      || '',
            'Connector Fee':         connectorFee,
            'Total to Borrower':     totalToBorrower,
            'Needs Review':          !!needs_review || serverFee.needsReview,
            'Days Needed':           isEmd ? null : (parseInt(dc_days, 10) || 1),
            'EMD Soft / In DD':      emd_soft            || '',
            'Two Title Companies':   two_title_companies || '',
            'Submitter Name':        submitter_name,
            'Submitter Email':       submitter_email,
            'Submitter Phone':       submitter_phone,
            'Property Address':      property_address    || '',
            'Borrower Name':         borrower_name       || '',
            'Borrower Email':        borrower_email      || '',
            'Borrower Address':      borrower_address    || '',
            'Borrower Experience':   borrower_experience || '',
            'Exit Strategy':         exit_strategy       || '',
            'DD End Date':           dd_end_date         || null,
            'COE Date':              coe_date            || null,
            'Funding Date':          funding_date        || null,
            'Mutual Release State':  mutual_release_state || '',
            'Title Company Info':    title_company_info  || '',
            'Deal Link':             deal_link           || '',
            'Profit Source':         profit_source       || '',
            'Deal Summary':          deal_summary        || '',
            'Documents Attached':    (attachments || []).map((a) => a.label || a.filename).join(', '),
            'Referred By':           referred_by         || '',
            'Date Submitted':        dateSubmitted,
            'Status':                'New',
          },
        }),
      });

      if (!atRes.ok) {
        console.error('Airtable error:', atRes.status, await atRes.text());
      } else {
        console.log('Airtable escrow funding record created');
      }
    } catch (err) {
      console.error('Airtable fetch error:', err);
    }
  } else {
    console.log('Airtable env vars missing — AIRTABLE_TOKEN:', !!AIRTABLE_TOKEN, 'AIRTABLE_BASE_ID:', !!AIRTABLE_BASE_ID);
  }

  // === STORE LEAD IN SUPABASE (affiliate attribution) ===
  // Best-effort, exactly like the loan application — never blocks the form.
  let affiliate = null;
  if (configured()) {
    try {
      affiliate = await getAffiliateByRef(referred_by);
      const [firstName, ...restName] = String(submitter_name).trim().split(/\s+/);
      const res = await sbInsert('leads', {
        affiliate_id:     affiliate ? affiliate.id : null,
        ref_code:         referred_by ? String(referred_by).toLowerCase() : null,
        first_name:       firstName || submitter_name,
        last_name:        restName.join(' ') || '',
        email:            submitter_email,
        phone:            submitter_phone,
        loan_program:     `Escrow Funding — ${deal_type}`,
        property_address: property_address || null,
        loan_amount:      amountNum,
        status:           'new',
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
    // Contracts ride along as attachments so the desk can underwrite straight
    // from the inbox. Anything oversized was rejected client-side already.
    const resendAttachments = (attachments || [])
      .filter((a) => a && a.content && a.filename)
      .map((a) => ({ filename: a.filename, content: a.content }));

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    FROM_ADDRESS,
          to:      [FUNDING_INBOX],
          reply_to: submitter_email,
          subject: `${needs_review || serverFee.needsReview ? '[NEEDS REVIEW] ' : ''}Escrow Funding — ${deal_type} — ${fmtMoney(amountNum)} — ${property_address || 'Address TBD'}`,
          html:    buildDeskEmail(body, {
            dateSubmitted, isEmd, amountNum, feeForRecord, depositForRecord,
            isConnector, connectorFee, totalToBorrower, serverFee, feeMismatch, clientFee,
          }),
          attachments: resendAttachments,
        }),
      });

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    FROM_ADDRESS,
          to:      [submitter_email],
          subject: `Funding Request Received — ${deal_type}`,
          html:    buildConfirmationEmail({
            submitter_name, deal_type, amountNum, feeForRecord,
            depositForRecord, isEmd, property_address,
            isConnector, connectorFee, totalToBorrower,
            needsReview: !!needs_review || serverFee.needsReview,
          }),
        }),
      });
    } catch (err) {
      console.error('Resend error:', err);
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ success: true, fee: feeForRecord, deposit: depositForRecord }),
  };
};

// ============================================================
//  FEE SCHEDULE — mirrors escrow.js. Keep both in sync when repricing.
// ============================================================

const EMD_TIERS = [
  { max:   5000, fee:  1500 },
  { max:  15000, fee:  2500 },
  { max:  25000, fee:  5000 },
  { max:  50000, fee: 12000 },
  { max:  75000, fee: 19000 },
  { max: 100000, fee: 30000 },
];
const EMD_AUTO_QUOTE_MAX = 100000;

const DC_TIERS = [
  { max:  500000, pct: 0.0125 },
  { max: 1000000, pct: 0.0150 },
  { max: 1500000, pct: 0.0175 },
];
const DC_AUTO_QUOTE_MAX = 1500000;
const DC_MIN_FEE        = 1000;
const DC_EXTRA_DAY_PCT  = 0.005;

const DEPOSIT_PCT = 0.05;
const DEPOSIT_MIN = 250;

// Returns { total, deposit, needsReview, breakdown }. total is null when the
// deal falls outside the auto-quote range and has to be priced by hand.
function computeFee(dealType, amount, days) {
  const empty = { total: null, deposit: null, needsReview: true, breakdown: [] };
  if (!dealType || !amount) return empty;

  if (String(dealType).startsWith('EMD')) {
    if (amount > EMD_AUTO_QUOTE_MAX) return empty;
    const tier = EMD_TIERS.find((t) => amount <= t.max);
    if (!tier) return empty;
    return {
      total: tier.fee,
      deposit: Math.max(amount * DEPOSIT_PCT, DEPOSIT_MIN),
      needsReview: String(dealType).includes('60'), // 60-day terms price above base
      breakdown: [[`EMD fee (30-day schedule)`, fmtMoney(tier.fee)]],
    };
  }

  if (dealType === 'Double Close') {
    if (amount > DC_AUTO_QUOTE_MAX) return empty;
    const tier = DC_TIERS.find((t) => amount <= t.max);
    if (!tier) return empty;

    const nDays     = Math.max(1, parseInt(days, 10) || 1);
    const extraDays = nDays - 1;
    const baseFee   = amount * tier.pct;
    const extraFee  = amount * DC_EXTRA_DAY_PCT * extraDays;
    const total     = Math.max(baseFee + extraFee, DC_MIN_FEE);

    const breakdown = [[`Transactional fee (${(tier.pct * 100).toFixed(2).replace(/\.?0+$/, '')}%, 24 hours)`, fmtMoney(baseFee)]];
    if (extraDays > 0) breakdown.push([`${extraDays} additional day${extraDays === 1 ? '' : 's'} (0.5%/day)`, fmtMoney(extraFee)]);
    if (baseFee + extraFee < DC_MIN_FEE) breakdown.push(['Minimum fee applied', fmtMoney(DC_MIN_FEE)]);

    return { total, deposit: null, needsReview: false, breakdown };
  }

  return empty;
}

function parseMoney(v) {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ''));
  return !n || isNaN(n) ? null : n;
}

function fmtMoney(n) {
  if (n == null || isNaN(n)) return '';
  return '$' + Math.round(n).toLocaleString('en-US');
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
//  EMAILS
// ============================================================

function buildDeskEmail(d, ctx) {
  const row = (label, value) => value || value === 0
    ? `<tr><td style="padding:6px 12px;color:#556B5C;font-size:13px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eee"><strong>${esc(label)}</strong></td><td style="padding:6px 12px;color:#1C2B20;font-size:13px;border-bottom:1px solid #eee">${esc(value)}</td></tr>`
    : '';

  const section = (title, rows) => rows
    ? `<h3 style="color:#9B6820;font-size:12px;text-transform:uppercase;letter-spacing:.5px;margin:24px 0 6px">${esc(title)}</h3>
       <table style="width:100%;border-collapse:collapse;border:1px solid #DAE3DC;border-radius:6px;overflow:hidden">${rows}</table>`
    : '';

  const reviewBanner = (ctx.serverFee.needsReview || d.needs_review)
    ? `<div style="background:#FDEDED;border-left:4px solid #8B1A1A;padding:14px 18px;margin:0 0 20px;border-radius:0 6px 6px 0">
         <strong style="color:#8B1A1A;font-size:13px">NEEDS MANUAL PRICING</strong>
         <p style="margin:6px 0 0;color:#8B1A1A;font-size:13px">
           This deal is outside the auto-quote range (EMD over $100k, double close over $1.5M, or a 60-day EMD).
           No fee was quoted to the submitter as final.
         </p>
       </div>`
    : '';

  const mismatchBanner = ctx.feeMismatch
    ? `<div style="background:#FDEDED;border-left:4px solid #8B1A1A;padding:14px 18px;margin:0 0 20px;border-radius:0 6px 6px 0">
         <strong style="color:#8B1A1A;font-size:13px">FEE MISMATCH</strong>
         <p style="margin:6px 0 0;color:#8B1A1A;font-size:13px">
           The browser reported ${esc(fmtMoney(ctx.clientFee))} but the server calculates ${esc(fmtMoney(ctx.serverFee.total))}. Verify before quoting.
         </p>
       </div>`
    : '';

  const breakdownRows = ctx.serverFee.breakdown.map(([l, v]) => row(l, v)).join('');

  const moneySection = section('Pricing',
    row('Funding amount', fmtMoney(ctx.amountNum)) +
    breakdownRows +
    row('OUR FEE', ctx.feeForRecord != null ? fmtMoney(ctx.feeForRecord) : 'Price manually') +
    row('Deposit due upfront (5%, $250 min)', ctx.depositForRecord != null ? fmtMoney(ctx.depositForRecord) : '') +
    (ctx.isConnector
      ? row('Connector fee (their spread)', ctx.connectorFee != null ? fmtMoney(ctx.connectorFee) : '') +
        row('Total to borrower', ctx.totalToBorrower != null ? fmtMoney(ctx.totalToBorrower) : '')
      : '')
  );

  // Only render the fields that belong to the submitted transaction type.
  const typeSection = ctx.isEmd
    ? section('EMD Details',
        row('EMD soft / within DD', d.emd_soft) +
        row('Due diligence ends', d.dd_end_date) +
        row('Mutual release state', d.mutual_release_state))
    : section('Double Close Details',
        row('Days funds are needed', d.dc_days) +
        row('Two title companies', d.two_title_companies));

  const attachmentList = (d.attachments || []).length
    ? `<h3 style="color:#9B6820;font-size:12px;text-transform:uppercase;letter-spacing:.5px;margin:24px 0 6px">Attached Documents</h3>
       <ul style="margin:0;padding-left:20px;color:#1C2B20;font-size:13px;line-height:1.9">
         ${d.attachments.map((a) => `<li>${esc(a.label || a.filename)} — <span style="color:#556B5C">${esc(a.filename)}</span></li>`).join('')}
       </ul>`
    : `<p style="color:#8B1A1A;font-size:13px;margin:20px 0 0"><strong>No documents were attached.</strong></p>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:700px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">
    <div style="background:#16261C;padding:24px 32px">
      <h1 style="margin:0;color:#9B6820;font-size:20px;letter-spacing:1px">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Escrow Funding Request — ${esc(ctx.dateSubmitted)}</p>
    </div>
    <div style="padding:32px">
      ${reviewBanner}
      ${mismatchBanner}

      <h2 style="color:#16261C;margin:0 0 4px">${esc(d.deal_type)} — ${esc(fmtMoney(ctx.amountNum))}</h2>
      <p style="color:#556B5C;margin:0 0 20px;font-size:14px">${esc(d.property_address || 'Address not provided')}</p>

      ${moneySection}
      ${typeSection}
      ${section('Submitter',
        row('Name', d.submitter_name) +
        row('Email', d.submitter_email) +
        row('Phone', d.submitter_phone) +
        row('Submitting as', d.submitter_role) +
        row('Referred by', d.referred_by || 'Direct (no affiliate)'))}
      ${section('Borrower',
        row('Name', d.borrower_name) +
        row('Email', d.borrower_email) +
        row('Mailing address', d.borrower_address) +
        row('Experience', d.borrower_experience))}
      ${section('Transaction',
        row('Property address', d.property_address) +
        row('Exit strategy', d.exit_strategy) +
        row('Close of escrow', d.coe_date) +
        row('Must be funded by', d.funding_date) +
        row('Title company / attorney', d.title_company_info) +
        row('Deal link', d.deal_link))}

      <div style="background:#f9f6f0;border-left:4px solid #9B6820;padding:16px 20px;margin-top:24px;border-radius:0 6px 6px 0">
        <strong style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#9B6820">Where the profits come from</strong>
        <p style="margin:8px 0 0;color:#1C2B20;font-size:14px;white-space:pre-wrap">${esc(d.profit_source)}</p>
      </div>

      <div style="background:#f9f6f0;border-left:4px solid #9B6820;padding:16px 20px;margin-top:14px;border-radius:0 6px 6px 0">
        <strong style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#9B6820">Deal summary</strong>
        <p style="margin:8px 0 0;color:#1C2B20;font-size:14px;white-space:pre-wrap">${esc(d.deal_summary)}</p>
      </div>

      ${attachmentList}
    </div>
    <div style="background:#f5f5f0;padding:16px 32px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">Southern Ground Capital — Escrow Funding Notification</p>
    </div>
  </div>
</body>
</html>`;
}

function buildConfirmationEmail(d) {
  const firstName = String(d.submitter_name || 'there').trim().split(/\s+/)[0];
  const year = new Date().getFullYear();

  const feeBlock = d.needsReview || d.feeForRecord == null
    ? `<div style="background:#f9f6f0;border-left:4px solid #9B6820;padding:20px 24px;margin:28px 0;border-radius:0 6px 6px 0">
         <p style="margin:0;color:#555;font-size:14px;line-height:1.7">
           This request falls outside our standard schedule, so our team is pricing it by hand.
           We'll come back to you with a firm number shortly.
         </p>
       </div>`
    : `<table style="width:100%;border-collapse:collapse;border-top:1px solid #eee5d6;border-bottom:1px solid #eee5d6;margin:24px 0">
         <tr>
           <td style="padding:10px 0;color:#556B5C;font-size:14px">Funding amount</td>
           <td style="padding:10px 0;color:#101e14;font-size:14px;font-weight:bold;text-align:right">${esc(fmtMoney(d.amountNum))}</td>
         </tr>
         <tr>
           <td style="padding:10px 0;color:#556B5C;font-size:14px">Our fee</td>
           <td style="padding:10px 0;color:#101e14;font-size:14px;font-weight:bold;text-align:right">${esc(fmtMoney(d.feeForRecord))}</td>
         </tr>
         ${d.depositForRecord != null ? `
         <tr>
           <td style="padding:10px 0;color:#556B5C;font-size:14px">Deposit due upfront <em style="color:#8a8a8a">(5%, $250 min)</em></td>
           <td style="padding:10px 0;color:#101e14;font-size:14px;font-weight:bold;text-align:right">${esc(fmtMoney(d.depositForRecord))}</td>
         </tr>` : ''}
         ${d.isConnector && d.connectorFee ? `
         <tr>
           <td style="padding:10px 0;color:#556B5C;font-size:14px">Your fee</td>
           <td style="padding:10px 0;color:#101e14;font-size:14px;font-weight:bold;text-align:right">${esc(fmtMoney(d.connectorFee))}</td>
         </tr>
         <tr>
           <td style="padding:10px 0;color:#556B5C;font-size:14px"><strong>Total to your borrower</strong></td>
           <td style="padding:10px 0;color:#101e14;font-size:14px;font-weight:bold;text-align:right">${esc(fmtMoney(d.totalToBorrower))}</td>
         </tr>` : ''}
       </table>`;

  const depositNote = d.isEmd && d.depositForRecord != null
    ? `<div style="background:#f0f6f2;border:1px solid #c3d9c8;border-radius:8px;padding:20px 24px;margin:24px 0">
         <p style="margin:0 0 6px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#2a6645">Next Step — Lock It In</p>
         <p style="margin:0;color:#555;font-size:14px;line-height:1.7">
           Your <strong>${esc(fmtMoney(d.depositForRecord))}</strong> deposit locks in funding. It's
           <strong>non-refundable</strong> and is <strong>credited toward your total fee</strong> if the deal
           goes through. We'll send Zelle and wire instructions with your approval — Zelle is fastest.
         </p>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">
    <div style="background:#16261C;padding:32px 40px">
      <h1 style="margin:0;color:#9B6820;font-size:22px;letter-spacing:1px">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Escrow Funding &middot; EMD &amp; Double Close</p>
    </div>
    <div style="padding:40px">
      <h2 style="color:#16261C;font-size:26px;margin:0 0 16px">We've got it, ${esc(firstName)}.</h2>
      <p style="color:#555;font-size:15px;line-height:1.7">
        Your <strong>${esc(d.deal_type)}</strong> funding request${d.property_address ? ` on <strong>${esc(d.property_address)}</strong>` : ''}
        is in front of our funding desk. These move fast — expect to hear back within
        <strong>a few business hours</strong>.
      </p>

      ${feeBlock}
      ${depositNote}

      <div style="background:#f9f6f0;border-left:4px solid #9B6820;padding:20px 24px;margin:28px 0;border-radius:0 6px 6px 0">
        <p style="margin:0 0 10px;font-weight:bold;color:#16261C;font-size:13px;text-transform:uppercase;letter-spacing:.5px">What Happens Next</p>
        <ul style="margin:0;padding-left:20px;color:#555;font-size:14px;line-height:2">
          <li>We review your contracts and confirm the closing timeline</li>
          <li>We send your terms and funding instructions</li>
          <li>You lock it in, and we coordinate the wire directly with title</li>
        </ul>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.7">
        Need to send additional documents or move something up? Reply to this email or call
        <strong>(678) 842-8084</strong>.
      </p>

      <p style="color:#555;font-size:15px;margin:24px 0 0">
        Let's get it closed,<br/>
        <strong style="color:#16261C">The Funding Desk</strong><br/>
        Southern Ground Capital
      </p>
    </div>
    <div style="background:#f5f5f0;padding:16px 40px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">&copy; ${year} Southern Ground Capital, LLC &middot; Submission does not guarantee funding</p>
    </div>
  </div>
</body>
</html>`;
}

// Exported for off-box testing of the pricing logic.
exports.computeFee = computeFee;
