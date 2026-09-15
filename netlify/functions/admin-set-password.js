/* =====================================================================
   Admin — set an affiliate's portal password directly.

   For affiliates who can't get through the emailed set-a-password link.
   Edgar picks (or generates) a password and hands it to them; they sign in
   with it on /portal like anyone else.

   Usage: POST /.netlify/functions/admin-set-password
          header  x-admin-key: <ADMIN_SEND_KEY>
          body    {"email": "...", "password": "..."}

   The password comes from the caller rather than being generated here, so
   it never appears in a response body or the function logs.

   Sets user_metadata.password_set too — that flag is what the portal's
   forced-password gate reads, and without it the affiliate would be sent
   straight back to the set-a-password form after signing in.
   ===================================================================== */

const { configured, sbSelect, SB_URL, SB_KEY } = require('./lib/supabase');
const { requireAdminKey } = require('./lib/admin-auth');

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const authHeaders = () => ({
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
});

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  const denied = requireAdminKey(event);
  if (denied) return denied;
  if (!configured()) return json(503, { error: 'Supabase is not configured.' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(400, { error: 'Invalid email' });
  if (password.length < 8) return json(400, { error: 'Password must be at least 8 characters' });

  // Only registered affiliates — this is not a way to mint arbitrary logins.
  const rows = await sbSelect('affiliates', `email=ilike.${encodeURIComponent(email)}&select=email&limit=1`);
  if (!rows[0]) return json(404, { error: `No affiliate row for ${email}` });

  const attrs = { password, email_confirm: true, user_metadata: { password_set: true } };
  let user = await findAuthUser(email);
  let res;
  if (user) {
    res = await fetch(`${SB_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(attrs),
    });
  } else {
    res = await fetch(`${SB_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email, ...attrs }),
    });
  }

  if (!res.ok) {
    const detail = await res.text();
    console.error('admin-set-password failed:', res.status, detail);
    return json(502, { error: 'Supabase rejected the update', status: res.status, detail });
  }
  return json(200, { updated: true, created: !user, email });
};

async function findAuthUser(email) {
  const url = `${SB_URL}/auth/v1/admin/users?page=1&per_page=200&filter=${encodeURIComponent(email)}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Auth user lookup failed: ${res.status}`);
  const data = await res.json();
  const users = Array.isArray(data) ? data : data.users || [];
  return users.find((u) => String(u.email || '').toLowerCase() === email) || null;
}
