// Admin-only: returns ALL leads across every affiliate, with the referring
// affiliate's name embedded. Gated to emails in ADMIN_EMAILS.
const { sbSelect, verifySession, isAdmin } = require('./lib/supabase');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  const token = (event.headers.authorization || event.headers.Authorization || '')
    .replace(/^Bearer\s+/i, '').trim();
  const user = await verifySession(token);
  if (!user) return json(401, { error: 'Not signed in' });
  if (!isAdmin(user.email)) return json(403, { error: 'Not authorized' });

  // Embed the affiliate name/ref via the leads.affiliate_id FK.
  const leads = await sbSelect(
    'leads',
    'select=id,created_at,first_name,last_name,email,phone,loan_program,loan_amount,property_address,status,origination_fee,commission_pct,commission,ref_code,affiliate_id,affiliates(name,ref_code)&order=created_at.desc'
  );

  // The partner list powers the "credit this deal to" picker in admin.js —
  // a repeat borrower arrives with no ref link, so the deal is tied back by
  // hand. See the repeat-business promise on /affiliates.
  const partners = await sbSelect('affiliates', 'select=id,name,ref_code&order=name.asc');

  const rows = leads.map((l) => ({
    id: l.id,
    date: (l.created_at || '').slice(0, 10),
    applicant: `${l.first_name || ''} ${l.last_name || ''}`.trim() || '—',
    email: l.email || '',
    phone: l.phone || '',
    loan_program: l.loan_program || '',
    loan_amount: l.loan_amount,
    property_address: l.property_address || '',
    affiliate: (l.affiliates && l.affiliates.name) || (l.ref_code ? l.ref_code : 'Direct (no affiliate)'),
    affiliate_id: l.affiliate_id || '',
    ref_code: l.ref_code || '',
    status: l.status || 'new',
    origination_fee: l.origination_fee,
    commission_pct: l.commission_pct == null ? 30 : l.commission_pct,
    commission: l.commission,
  }));

  return json(200, {
    count: rows.length,
    leads: rows,
    affiliates: (partners || []).map((a) => ({ id: a.id, name: a.name, ref_code: a.ref_code })),
  });
};

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json', ...CORS }, body: JSON.stringify(obj) };
}
