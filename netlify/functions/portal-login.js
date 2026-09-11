/* =====================================================================
   Affiliate portal — one-time sign-in code.

   Affiliates sign in with an email and a password they choose. This
   function covers the two moments they don't have one yet: first-time
   setup and a forgotten password. It emails a 6-digit code; the portal
   verifies the code, then walks them through creating a password.

   Why we generate and send this ourselves instead of calling
   supabase.auth.signInWithOtp() from the browser: Supabase picks the
   email template off the user's state — a returning user gets "Magic
   Link", but a brand-new one gets "Confirm signup". Affiliates only ever
   exist in the `affiliates` table, never as pre-created auth users, so
   EVERY affiliate's first login went out on the signup template. If that
   template is blank or unbranded in the dashboard, the affiliate gets a
   blank email (or one the spam filter eats) and never signs in.

   Sending it ourselves means the email is one we control: same Resend
   sender as the rest of the affiliate mail, same branding, HTML *and*
   plain text, and visible in the Resend logs when someone says "I never
   got it".
   ===================================================================== */

const { configured, sbSelect, SB_URL, SB_KEY } = require('./lib/supabase');

const SITE_URL    = process.env.SITE_URL || 'https://sgcapital.io';
const REDIRECT_TO = `${SITE_URL}/portal`;
const FROM        = 'Southern Ground Capital <affiliates@sgcapital.io>';
const SUPPORT     = 'edgar@sgcapital.io';
const LINK_TTL    = '1 hour';

// The one-click sign-in link. The code rides in the URL *fragment*, which a
// browser never sends to any server: a mailbox scanner that pre-fetches this
// URL asks sgcapital.io for a bare /portal and never sees the token, so it
// can't spend it in transit. That is the whole reason we don't email
// Supabase's action_link, which is an ordinary GET and gets consumed on
// delivery by Defender Safe Links, Barracuda, Mimecast and friends.
const setupUrl = (email, code) =>
  `${SITE_URL}/portal#setup=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`;

// Soft throttle: one link per address per minute. Netlify containers are
// per-instance and short-lived, so this only catches impatient double
// clicks — the real abuse gate is that the address must belong to a
// registered affiliate.
const RESEND_WINDOW_MS = 60 * 1000;
const lastSent = new Map();

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...CORS },
  body: JSON.stringify(body),
});

const authHeaders = () => ({
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
});

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(400, { error: 'Please enter a valid email address.' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  // Not configured — tell the browser to fall back to Supabase's own email
  // rather than leaving the affiliate with a dead login form.
  if (!configured() || !RESEND_API_KEY) {
    console.error('portal-login not configured — supabase:', configured(), 'resend:', !!RESEND_API_KEY);
    return json(503, { error: 'Sign-in email is not configured.', fallback: true });
  }

  // Only registered affiliates get a link. Said plainly rather than with a
  // generic "check your inbox", because the common failure by far is an
  // affiliate typing a different address than the one they registered with,
  // and a silent success leaves them waiting on an email that never comes.
  let affiliate = null;
  try {
    const rows = await sbSelect(
      'affiliates',
      `email=ilike.${encodeURIComponent(email)}&select=name,email&limit=1`
    );
    affiliate = rows[0] || null;
  } catch (err) {
    console.error('Affiliate lookup failed:', err);
  }

  if (!affiliate) {
    console.log('portal-login: no affiliate row for', email);
    return json(404, {
      error: `We couldn't find an affiliate account for ${email}. Try the address you registered with, or email ${SUPPORT}.`,
    });
  }

  const now = Date.now();
  const previous = lastSent.get(email);
  if (previous && now - previous < RESEND_WINDOW_MS) {
    return json(429, {
      error: 'A sign-in link was just sent. Please check your inbox (and spam folder) before requesting another.',
    });
  }

  try {
    await ensureConfirmedUser(email);
    const { link, code } = await generateSignIn(email);
    if (!link && !code) return json(502, { error: 'We could not generate a sign-in code. Please try again.' });

    const firstName = String(affiliate.name || '').trim().split(/\s+/)[0] || '';
    // The code and Supabase's action_link are the SAME one-time token --
    // action_link is just /auth/v1/verify?token=<hash of the code>, so
    // consuming either burns both, and a scanner that pre-fetches it burns it
    // before the affiliate ever types the digits. So action_link never leaves
    // this function when we have a code: the button we send instead is our own
    // /portal#setup=... , which hides the token from every server in the path.
    await sendLinkEmail({
      email,
      firstName,
      link: code ? null : link,
      code,
      setupLink: code ? setupUrl(email, code) : null,
      resendKey: RESEND_API_KEY,
    });

    lastSent.set(email, now);
    // `code` tells the portal whether to ask for a typed code or to fall
    // back to "click the link in your email".
    return json(200, { sent: true, code: !!code });
  } catch (err) {
    console.error('portal-login failed for', email, err);
    return json(500, { error: 'Something went wrong sending your link. Please try again.' });
  }
};

/* ---- SUPABASE AUTH ADMIN ------------------------------------------- */

// Magic links are only generated for users that already exist, and an
// unconfirmed user is the exact state that drags the signup template back
// in. So: find them and confirm them, or create them already confirmed.
async function ensureConfirmedUser(email) {
  const user = await findAuthUser(email);

  if (!user) {
    const res = await fetch(`${SB_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email, email_confirm: true }),
    });
    // 422 = already registered; the lookup just didn't see them. Harmless.
    if (!res.ok && res.status !== 422) {
      console.error('Create auth user failed:', res.status, await res.text());
    }
    return;
  }

  if (!user.email_confirmed_at) {
    const res = await fetch(`${SB_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ email_confirm: true }),
    });
    if (!res.ok) console.error('Confirm auth user failed:', res.status, await res.text());
  }
}

async function findAuthUser(email) {
  try {
    // `filter` narrows server-side where GoTrue supports it; per_page is set
    // high enough that the whole user list fits on page one either way, so
    // the match below is reliable even if the filter is ignored.
    const url = `${SB_URL}/auth/v1/admin/users?page=1&per_page=200&filter=${encodeURIComponent(email)}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
      console.error('Auth user lookup failed:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const users = Array.isArray(data) ? data : data.users || [];
    // `filter` is a substring search, so match the address exactly.
    return users.find((u) => String(u.email || '').toLowerCase() === email) || null;
  } catch (err) {
    console.error('Auth user lookup error:', err);
    return null;
  }
}

// One generate_link call yields both representations of a single token: the
// 6-digit `email_otp` an affiliate can type in, and the action_link that
// verifies that same token by URL. They are not two independent credentials —
// whichever is used first invalidates the other — so the caller sends exactly
// one of them. Supabase owns expiry and one-time use, so there's no code
// storage of our own to get wrong.
async function generateSignIn(email) {
  const res = await fetch(`${SB_URL}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ type: 'magiclink', email, redirect_to: REDIRECT_TO }),
  });
  if (!res.ok) {
    console.error('generate_link failed:', res.status, await res.text());
    return { link: null, code: null };
  }
  const data = await res.json();
  const props = data.properties || {};
  return {
    link: data.action_link || props.action_link || null,
    code: data.email_otp || props.email_otp || null,
  };
}

/* ---- EMAIL ---------------------------------------------------------- */

async function sendLinkEmail({ email, firstName, link, code, setupLink, resendKey }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      reply_to: SUPPORT,
      subject: code
        ? `${code} is your Southern Ground Capital sign-in code`
        : 'Your Southern Ground Capital portal sign-in link',
      html: buildHtml(firstName, link, code, setupLink),
      text: buildText(firstName, link, code, setupLink),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// The button leads: an affiliate who taps it lands on the portal with the
// code already filled in and one tap from choosing a password, which is far
// fewer places to get lost than copying six digits between two apps. The
// digits stay underneath for anyone whose client strips the button, and the
// URL prints as visible text for the same reason.
function buildHtml(firstName, link, code, setupLink) {
  const hello = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hi,';
  const codeBlock = code ? `
      <div style="text-align:center;margin:28px 0">
        <div style="color:#8a8a8a;font-size:12px;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Or enter this code on the sign-in page</div>
        <div style="display:inline-block;background:#f5f5f0;border:1px solid #e2e2d8;border-radius:8px;padding:16px 28px;font-family:monospace;font-size:34px;font-weight:bold;letter-spacing:8px;color:#101e14">${escapeHtml(code)}</div>
      </div>` : '';
  const setupBlock = setupLink ? `
      <div style="text-align:center;margin:24px 0 8px">
        <a href="${setupLink}" style="background:#101e14;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block">Sign In to My Portal &rarr;</a>
      </div>
      <p style="color:#8a8a8a;font-size:12px;line-height:1.6;margin:0 0 20px;text-align:center">
        Button not working? Copy this address into your browser:<br>
        <span style="font-family:monospace;font-size:11px;color:#9B6820;word-break:break-all">${setupLink}</span>
      </p>` : '';

  const linkBlock = link ? `
      <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 8px">
        Click the button below to sign in:
      </p>
      <div style="text-align:center;margin:16px 0 28px">
        <a href="${link}" style="background:#101e14;color:#fff;text-decoration:none;padding:13px 30px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block">Sign In to My Portal &rarr;</a>
      </div>
      <p style="color:#555;font-size:13px;line-height:1.6;margin:0 0 6px">
        If the button doesn't work, copy and paste this address into your browser:
      </p>
      <p style="margin:0 0 24px;font-family:monospace;font-size:12px;color:#9B6820;word-break:break-all">${link}</p>` : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">

    <div style="background:#101e14;padding:32px 40px">
      <h1 style="margin:0;color:#c8923a;font-size:22px;letter-spacing:1px">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Affiliate Portal &middot; Sign In</p>
    </div>

    <div style="padding:40px">
      <h2 style="color:#101e14;font-size:26px;margin:0 0 16px">${code ? 'Sign in to your portal' : 'Your sign-in link'}</h2>
      <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 8px">
        ${hello} ${code
          ? `tap the button below and you're in &mdash; nothing to type. Then choose a password, and from that point on you sign in with just your email and password.`
          : `use the button below to sign in to your affiliate portal.`}
        It expires in ${LINK_TTL} and can only be used once.
      </p>
${setupBlock}${codeBlock}${linkBlock}
      <p style="color:#8a8a8a;font-size:12px;line-height:1.6;margin:0">
        Didn't request this? You can safely ignore this email &mdash; nobody can
        access your portal without this email.
      </p>

      <p style="color:#555;font-size:15px;margin:24px 0 0">&mdash; Southern Ground Capital</p>
    </div>

    <div style="background:#f5f5f0;padding:16px 40px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">Southern Ground Capital, LLC &middot; (678) 842-8084</p>
    </div>

  </div>
</body>
</html>`;
}

function buildText(firstName, link, code, setupLink) {
  const hello = firstName ? `Hi ${firstName},` : 'Hi,';
  const body = code
    ? `Open this link and you're signed in — nothing to type:

${setupLink}

Then choose a password, and from that point on you sign in with just your
email and password.

If you'd rather type it, your sign-in code is:

    ${code}

Enter it on the portal sign-in page at ${SITE_URL}/portal.`
    : `Here is your sign-in link:

${link || ''}`;

  return `SOUTHERN GROUND CAPITAL — Affiliate Portal Sign In

${hello}

${body}

It expires in ${LINK_TTL} and can only be used once.

Didn't request this? You can safely ignore this email — nobody can access
your portal without this email.

— Southern Ground Capital
Southern Ground Capital, LLC · (678) 842-8084 · ${SUPPORT}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
