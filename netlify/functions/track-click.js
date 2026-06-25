// Records one click when a visitor arrives via an affiliate ?ref= link.
// Called from the front end (script.js) once per browser session per ref.
// Dedupe is enforced two ways: client sends one request per session, and a
// partial unique index (affiliate_id, session_id) in the DB is the backstop —
// a duplicate insert returns 409, which we treat as success.
const { configured, sbInsert, findAffiliateByRef, hashIp } = require('./lib/supabase');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Skip obvious bots / link-preview crawlers so they don't inflate click counts.
const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|bingpreview|preview|headless|monitor|pingdom|lighthouse/i;

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };

  if (!configured()) {
    return json(200, { tracked: false, reason: 'supabase not configured' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const ref = (body.ref || '').trim().toLowerCase();
  if (!ref) return json(200, { tracked: false, reason: 'no ref' });

  const ua = event.headers['user-agent'] || '';
  if (BOT_RE.test(ua)) return json(200, { tracked: false, reason: 'bot' });

  const affiliate_id = await findAffiliateByRef(ref);

  const ipRaw =
    (event.headers['x-nf-client-connection-ip'] ||
      event.headers['x-forwarded-for'] ||
      '').split(',')[0].trim();

  const row = {
    affiliate_id,
    ref_code: ref,
    session_id: body.sid || null,
    ip_hash: hashIp(ipRaw),
    user_agent: ua.slice(0, 300),
    landing_page: (body.page || '').slice(0, 300) || null,
    referrer: (body.referrer || '').slice(0, 500) || null,
    utm_source: body.utm_source || null,
    utm_medium: body.utm_medium || null,
    utm_campaign: body.utm_campaign || null,
  };

  try {
    const res = await sbInsert('clicks', row);
    // 409 = duplicate session for this affiliate (already counted) — that's fine.
    if (!res.ok && res.status !== 409) {
      console.error('Supabase click insert failed:', res.status, await res.text());
      return json(200, { tracked: false, reason: 'db error' });
    }
  } catch (err) {
    console.error('track-click error:', err);
    return json(200, { tracked: false, reason: 'exception' });
  }

  return json(200, { tracked: true, attributed: !!affiliate_id });
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS },
    body: JSON.stringify(obj),
  };
}
