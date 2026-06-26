// Shared Supabase helpers for Netlify functions.
// Talks to Supabase's PostgREST API directly with fetch — no npm dependency,
// so it works in the existing dependency-free setup. Uses the SECRET
// (service-role) key, which bypasses RLS, so server-side writes always work.
const crypto = require('crypto');

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function configured() {
  return !!(SB_URL && SB_KEY);
}

function headers(extra) {
  return {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

// Insert one row or an array of rows. Returns the raw fetch Response so the
// caller can inspect status (e.g. swallow a 409 duplicate).
async function sbInsert(table, rows, opts = {}) {
  const prefer = opts.returning || 'return=minimal';
  return fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers({ Prefer: prefer }),
    body: JSON.stringify(rows),
  });
}

// Run a PostgREST select; returns an array (empty on error).
async function sbSelect(table, query) {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, { headers: headers() });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Look up an affiliate's id by their ref_code (case-insensitive). null if none.
async function findAffiliateByRef(ref) {
  if (!ref) return null;
  const rows = await sbSelect(
    'affiliates',
    `ref_code=eq.${encodeURIComponent(String(ref).toLowerCase())}&select=id&limit=1`
  );
  return (rows[0] && rows[0].id) || null;
}

// One-way hash of an IP so we can dedupe/count without storing PII.
function hashIp(ip) {
  if (!ip) return null;
  return crypto
    .createHash('sha256')
    .update(ip + (process.env.IP_HASH_SALT || ''))
    .digest('hex');
}

// Verify a Supabase access token; returns the user object (with email/id) or null.
async function verifySession(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SB_KEY },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Is this email an admin? Allowlist via ADMIN_EMAILS env (comma-separated).
function isAdmin(email) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || 'edgar@sgcapital.io')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

module.exports = {
  configured, headers, sbInsert, sbSelect, findAffiliateByRef, hashIp,
  verifySession, isAdmin, SB_URL, SB_KEY,
};
