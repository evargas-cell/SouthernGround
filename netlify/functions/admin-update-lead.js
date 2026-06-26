// Admin-only: update a lead's status and/or commission.
// Commission is computed server-side as origination_fee * commission_pct/100
// (affiliate share capped at 30%). Gated to emails in ADMIN_EMAILS.
const { verifySession, isAdmin, SB_URL, SB_KEY } = require('./lib/supabase');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const STATUSES = ['new', 'contacted', 'closed', 'dead'];

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  const token = (event.headers.authorization || event.headers.Authorization || '')
    .replace(/^Bearer\s+/i, '').trim();
  const user = await verifySession(token);
  if (!user) return json(401, { error: 'Not signed in' });
  if (!isAdmin(user.email)) return json(403, { error: 'Not authorized' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const { id, status } = body;
  if (!id) return json(400, { error: 'Missing lead id' });

  const patch = {};

  if (status != null) {
    if (!STATUSES.includes(status)) return json(400, { error: 'Invalid status' });
    patch.status = status;
  }

  // Commission inputs (admin-only). Cap the affiliate share at 30%.
  let fee = body.origination_fee == null ? undefined : Number(body.origination_fee);
  let pct = body.commission_pct == null ? undefined : Number(body.commission_pct);

  if (fee !== undefined) {
    if (isNaN(fee) || fee < 0) return json(400, { error: 'Invalid origination fee' });
    patch.origination_fee = fee;
  }
  if (pct !== undefined) {
    if (isNaN(pct) || pct < 0) return json(400, { error: 'Invalid commission %' });
    pct = Math.min(pct, 30); // enforce the "up to 30%" cap
    patch.commission_pct = pct;
  }

  // If we have both fee and pct (from this request or fall back), recompute commission.
  if (fee !== undefined || pct !== undefined) {
    const effFee = fee !== undefined ? fee : null;
    const effPct = pct !== undefined ? pct : null;
    if (effFee != null && effPct != null) {
      patch.commission = Math.round(effFee * (effPct / 100) * 100) / 100;
    }
  }

  // Allow an explicit manual commission override if provided.
  if (body.commission != null) {
    const c = Number(body.commission);
    if (isNaN(c) || c < 0) return json(400, { error: 'Invalid commission' });
    patch.commission = c;
  }

  if (!Object.keys(patch).length) return json(400, { error: 'Nothing to update' });

  try {
    const res = await fetch(`${SB_URL}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      return json(502, { error: 'Update failed', detail: await res.text() });
    }
    const updated = await res.json();
    return json(200, { updated: updated[0] || null });
  } catch (err) {
    return json(502, { error: 'Update error', detail: String(err) });
  }
};

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json', ...CORS }, body: JSON.stringify(obj) };
}
