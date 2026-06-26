// Returns the logged-in affiliate's own dashboard stats.
// Auth: the portal sends the Supabase access token (Bearer). We verify it with
// Supabase, read the user's email, and match it to an affiliate record. All DB
// access here uses the secret key server-side — the browser never queries the
// tables directly, so an affiliate can only ever see their own numbers.
const { sbSelect } = require('./lib/supabase');

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  if (!SB_URL || !SB_KEY) return json(500, { error: 'Supabase env vars missing' });

  // --- Verify the caller's Supabase session token ---
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json(401, { error: 'Not signed in' });

  let user;
  try {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SB_KEY },
    });
    if (!res.ok) return json(401, { error: 'Invalid or expired session' });
    user = await res.json();
  } catch (err) {
    return json(401, { error: 'Could not verify session' });
  }

  const email = (user.email || '').toLowerCase();
  if (!email) return json(401, { error: 'No email on session' });

  // --- Match the email to an affiliate record (case-insensitive) ---
  const affRows = await sbSelect(
    'affiliates',
    `email=ilike.${encodeURIComponent(email)}&select=*&limit=1`
  );
  if (!affRows.length) {
    return json(200, {
      affiliate: null,
      message: 'No affiliate account is linked to this email. Contact us at edgar@sgcapital.io.',
    });
  }
  const aff = affRows[0];

  // Link the auth user to the affiliate record on first login (enables RLS later).
  if (!aff.auth_user_id && user.id) {
    try {
      await fetch(`${SB_URL}/rest/v1/affiliates?id=eq.${aff.id}`, {
        method: 'PATCH',
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ auth_user_id: user.id }),
      });
    } catch { /* non-fatal */ }
  }

  // --- Aggregate stats ---
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const [clicksTotal, clicks30] = await Promise.all([
    count('clicks', `affiliate_id=eq.${aff.id}`),
    count('clicks', `affiliate_id=eq.${aff.id}&created_at=gte.${since30}`),
  ]);

  const leads = await sbSelect(
    'leads',
    `affiliate_id=eq.${aff.id}&select=id,created_at,first_name,last_name,loan_program,loan_amount,status,commission&order=created_at.desc`
  );

  const byStatus = { new: 0, contacted: 0, closed: 0, dead: 0 };
  let earnings = 0;
  let pending = 0;
  let leads30 = 0;
  for (const l of leads) {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    if (l.created_at >= since30) leads30++;
    const c = Number(l.commission || 0);
    if (l.status === 'closed') earnings += c;
    else if (c) pending += c;
  }

  // Only expose first name + last initial of applicants in the affiliate view.
  const leadList = leads.map((l) => ({
    name: `${l.first_name || ''} ${(l.last_name || '').charAt(0)}${l.last_name ? '.' : ''}`.trim() || '—',
    loan_program: l.loan_program || '—',
    status: l.status,
    date: (l.created_at || '').slice(0, 10),
  }));

  return json(200, {
    affiliate: {
      name: aff.name,
      email: aff.email,
      ref_code: aff.ref_code,
      affiliate_link: aff.affiliate_link || `https://sgcapital.io/?ref=${aff.ref_code}`,
    },
    stats: {
      clicksTotal,
      clicks30,
      leadsTotal: leads.length,
      leads30,
      byStatus,
      earnings,
      pending,
    },
    leads: leadList,
  });
};

// Get an exact row count without pulling the rows (uses Content-Range header).
async function count(table, filter) {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/${table}?${filter}&select=id`, {
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        Prefer: 'count=exact',
        Range: '0-0',
      },
    });
    const cr = res.headers.get('content-range') || '';
    const total = cr.split('/')[1];
    return !total || total === '*' ? 0 : parseInt(total, 10) || 0;
  } catch {
    return 0;
  }
}

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json', ...CORS }, body: JSON.stringify(obj) };
}
