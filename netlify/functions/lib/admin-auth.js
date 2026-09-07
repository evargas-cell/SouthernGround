// Shared authorisation gate for the affiliate blast functions.
//
// Every mode of these endpoints is privileged, so every mode needs the key:
//   - a real send emails the entire affiliate list
//   - `test` sends a branded email from affiliates@sgcapital.io
//   - `dryRun` returns the whole affiliate roster (names + email addresses)
// `dryRun` and `test` used to be exempt, which left the roster readable and the
// sender usable by anyone who knew the URL.
const crypto = require('crypto');

// Constant-time compare so the key can't be recovered a byte at a time.
function secretsMatch(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length === 0 || ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Returns a 401 response for the caller to return early, or null when authorised.
function requireAdminKey(event) {
  const headers = event.headers || {};
  const provided = headers['x-admin-key'] || headers['X-Admin-Key'] || '';
  if (!secretsMatch(provided, process.env.ADMIN_SEND_KEY || '')) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }
  return null;
}

// Defence in depth on top of the key: a test email may only go to an address we
// control, so a leaked key still can't send mail from our domain to a stranger.
// ADMIN_EMAILS is the same comma-separated list the admin console is gated on.
function testRecipientAllowed(email) {
  const allowed = (process.env.ADMIN_EMAILS || 'edgar@sgcapital.io')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(String(email || '').trim().toLowerCase());
}

module.exports = { requireAdminKey, testRecipientAllowed };
