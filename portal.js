/* =====================================================================
   Affiliate Portal — front-end logic
   Auth: Supabase email + password. First-time setup and resets go through
   /.netlify/functions/portal-login, which emails a link that lands straight
   on the password form. No typed codes anywhere.
   Data: /.netlify/functions/affiliate-stats
   ===================================================================== */

/* ---- CONFIG -------------------------------------------------------- */
/* The publishable key is SAFE to expose in the browser (that's its job).
   Do NOT paste the secret (sb_secret_…) key here. */
const SUPABASE_URL = 'https://husitwpydwrtfmstcxrl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_k6oM2k-L227MgWFP9DL52Q_VLSKOPra';
/* -------------------------------------------------------------------- */

const REDIRECT_TO = window.location.origin + '/portal';
const SUPPORT_EMAIL = 'edgar@sgcapital.io';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const show = (id) => $(id).classList.remove('hidden');
const hide = (id) => $(id).classList.add('hidden');

document.addEventListener('DOMContentLoaded', () => {
  $('yr').textContent = new Date().getFullYear();
  captureResetToken(); // before route(), which strips the URL
  bindLogin();
  bindLogout();
  bindCopy();
  bindAccount();
  route();
});

// The emailed link carries Supabase's token *hash* — the same credential its
// action_link would put in a query string — in the URL *fragment*, which a
// browser never sends to a server. A mailbox scanner that pre-fetches the
// link therefore asks sgcapital.io for a bare /portal and cannot spend it.
// Read it once, strip it from the address bar so a refresh or a shared URL
// can't replay it, and redeem it only when the affiliate submits a password.
let pendingReset = null;

function captureResetToken() {
  const hash = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const tokenHash = (hash.get('t') || '').trim();
  if (!tokenHash) return;
  pendingReset = {
    tokenHash,
    type: hash.get('type') || 'magiclink',
    email: (hash.get('e') || '').trim().toLowerCase(),
  };
  cleanUrl();
}

// Re-route whenever auth state changes (e.g. after the magic-link redirect).
sb.auth.onAuthStateChange(() => route());

async function route() {
  // Surface an expired/invalid magic-link error (Supabase puts it in the hash).
  surfaceUrlError();

  let session = null;
  try {
    const res = await Promise.race([
      sb.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
    ]);
    session = (res && res.data && res.data.session) || null;
  } catch (e) {
    session = null; // never hang on "Loading…" — fall back to the login form
  }

  if (session) {
    cleanUrl(); // strip ?code=/#tokens so a refresh can't re-trigger an exchange

    // Signed in but no password yet. There's no way past this panel on
    // purpose: an affiliate who reaches the dashboard without setting one is
    // an affiliate who needs an emailed code every single visit, which is the
    // whole problem this flow exists to end. Sign out is still available.
    if (!hasPassword(session.user)) {
      hide('view-loading'); hide('view-dash');
      show('view-login'); show('logout-btn');
      showPanel('panel-newpass');
      return;
    }

    hide('view-loading'); hide('view-login');
    show('view-dash'); show('logout-btn');
    loadDashboard(session.access_token);
  } else {
    hide('view-loading'); hide('view-dash'); hide('logout-btn');
    show('view-login');
    if (pendingReset) presentReset();
    else showPanel('panel-signin');
  }
}

// Supabase doesn't expose "does this user have a password", so we record it
// ourselves the moment they set one.
function hasPassword(user) {
  return !!(user && user.user_metadata && user.user_metadata.password_set);
}

function showPanel(id) {
  ['panel-signin', 'panel-sent', 'panel-newpass'].forEach((p) => (p === id ? show(p) : hide(p)));
  setNote('', '');
}

function setNote(message, kind) {
  const note = $('login-note');
  note.className = 'note' + (kind ? ' ' + kind : '');
  note.textContent = message;
}

// If the sign-in link was expired/already used, tell the user instead of failing silently.
function surfaceUrlError() {
  const hash = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const qs = new URLSearchParams(window.location.search);
  const err = hash.get('error_description') || qs.get('error_description') || hash.get('error') || qs.get('error');
  if (err) {
    const note = $('login-note');
    if (note) {
      note.className = 'note err';
      note.textContent = decodeURIComponent(err).replace(/\+/g, ' ') + ' — please request a new link.';
    }
    cleanUrl();
  }
}

function cleanUrl() {
  if (window.location.search || window.location.hash) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

/* ---- LOGIN --------------------------------------------------------- *
   Two ways in. Every day: email + password. The two moments an affiliate has
   no password — first visit and a reset — go through a link we email, which
   lands them directly on the password form.

   There is no typed code anywhere in this flow, deliberately. GoTrue's
   email_otp is not a fixed six digits (this project issues eight), so the
   form's maxlength quietly truncated every code an affiliate pasted and the
   verify could never match. Beyond that bug, a code copied between two apps
   was the step affiliates got lost in. The link carries the credential, so
   there is nothing to read, retype, or truncate.
   -------------------------------------------------------------------- */
let resetEmail = ''; // address the current link was sent to

function bindLogin() {
  $('signin-form').addEventListener('submit', onSignIn);
  $('newpass-form').addEventListener('submit', onCreatePassword);

  $('need-link-btn').addEventListener('click', () => sendResetLink($('email').value.trim()));
  $('resend-btn').addEventListener('click', () => sendResetLink(resetEmail));
  $('back-signin-btn').addEventListener('click', () => showPanel('panel-signin'));
}

// Arrived on the emailed link: straight to the password form, no interstitial.
function presentReset() {
  $('newpass-title').textContent = 'Choose your password';
  $('newpass-intro').textContent = pendingReset.email
    ? `Pick a password for ${pendingReset.email}. From now on you sign in with just your email and this password.`
    : "Pick a password you'll remember. From now on you sign in with just your email and this password.";
  showPanel('panel-newpass');
}

async function onSignIn(e) {
  e.preventDefault();
  const email = $('email').value.trim();
  const password = $('password').value;
  if (!email || !password) return;

  const btn = $('signin-btn');
  btn.disabled = true; btn.textContent = 'Signing in…';
  setNote('', '');

  const { error } = await sb.auth.signInWithPassword({ email, password });

  btn.disabled = false; btn.textContent = 'Sign in';
  if (error) {
    // The stock message is "Invalid login credentials", which tells someone
    // who has never set a password nothing about what to do next.
    const wrong = /invalid login credentials/i.test(error.message || '');
    setNote(
      wrong
        ? "That email and password don't match. If you haven't set a password yet, use the link below and we'll email you one."
        : error.message || 'Something went wrong. Please try again.',
      'err'
    );
  }
  // On success onAuthStateChange fires and route() takes over.
}

async function sendResetLink(email) {
  if (!email) {
    showPanel('panel-signin');
    setNote('Enter your email address first, then tap that link again.', 'err');
    $('email').focus();
    return;
  }

  setNote('Sending your link…', 'ok');
  const result = await requestResetLink(email);

  if (result.error) {
    setNote(result.error, 'err');
    return;
  }

  resetEmail = email;
  $('sent-email').textContent = email;
  showPanel('panel-sent');
}

// Returns {} on success or { error } with a message for the affiliate.
async function requestResetLink(email) {
  try {
    const res = await fetch('/.netlify/functions/portal-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return {};
    // Function isn't configured (missing env) — don't leave the affiliate
    // stranded, let Supabase send its own email as a last resort.
    if (data.fallback) return await otpFallback(email);
    return { error: data.error || 'Something went wrong. Please try again.' };
  } catch {
    return await otpFallback(email);
  }
}

// Supabase's own email links back to /portal with tokens in the hash, which
// supabase-js picks up on load — so it lands in the same place, just without
// the branding and the Resend logs.
async function otpFallback(email) {
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: REDIRECT_TO },
  });
  if (error) return { error: error.message || 'Something went wrong. Please try again.' };
  return {};
}

async function onCreatePassword(e) {
  e.preventDefault();
  const password = $('newpass').value;
  const problem = passwordProblem(password, $('newpass2').value);
  if (problem) { setNote(problem, 'err'); return; }

  const btn = $('newpass-btn');
  btn.disabled = true; btn.textContent = 'Saving…';

  // Arrived on an emailed link: redeem it now, which signs them in, and only
  // then set the password on the session that produces.
  if (pendingReset) {
    const { error } = await redeemResetToken();
    // A spent link is not a dead end if this browser is already signed in
    // from it — that's the second tab, or the same link opened twice — and
    // the password can still be set on the session they already have.
    if (error && !(await haveSession())) {
      btn.disabled = false; btn.textContent = 'Save my password';
      const address = pendingReset.email;
      pendingReset = null;
      if (address) $('email').value = address;
      showPanel('panel-signin');
      setNote(
        'This link has already been used. If you have already set your password, sign in above. ' +
        'If not, tap "First time here, or forgot your password?" for a fresh link.',
        'err'
      );
      $('password').focus();
      return;
    }
    pendingReset = null;
  }

  const { error } = await savePassword(await sessionEmail(), password);

  btn.disabled = false; btn.textContent = 'Save my password';
  if (error) {
    setNote(error.message || 'We could not save that password. Please try again.', 'err');
    return;
  }

  route();
}

async function sessionEmail() {
  try {
    const { data } = await sb.auth.getSession();
    return (data && data.session && data.session.user.email) || '';
  } catch {
    return '';
  }
}

async function haveSession() {
  try {
    const { data } = await sb.auth.getSession();
    return !!(data && data.session);
  } catch {
    return false;
  }
}

// GoTrue names this token type differently across versions: portal-login
// generates it as 'magiclink', and 'email' is the newer generic alias.
async function redeemResetToken() {
  let { error } = await sb.auth.verifyOtp({
    token_hash: pendingReset.tokenHash,
    type: pendingReset.type,
  });
  if (error) {
    ({ error } = await sb.auth.verifyOtp({ token_hash: pendingReset.tokenHash, type: 'email' }));
  }
  // "Token has expired or is invalid" covers both a spent link and a stale
  // one, so log the real error — it's the only way to tell them apart when an
  // affiliate reports this.
  if (error) console.warn('verifyOtp (token_hash) failed:', error.status, error.message);
  return { error };
}

// Shared by the emailed-link panel and the dashboard's change-password form.
//
// updateUser can report success on a password that then fails to sign in, and
// the affiliate only discovers it on their next visit, staring at "invalid
// login credentials" for a password they watched us save. So prove it here,
// while we can still say something useful: set the password, sign in with it,
// and only mark password_set once that sign-in actually worked. The two
// updateUser calls are kept apart deliberately — sending `password` and `data`
// together means one server-side rejection can leave the flag set on an
// account with no usable password, which is that same dead end with extra
// steps.
async function savePassword(email, password) {
  const { error: saveError } = await sb.auth.updateUser({ password });
  if (saveError) return { error: saveError };

  const { error: proveError } = await sb.auth.signInWithPassword({ email, password });
  if (proveError) {
    console.warn('password saved but would not sign in:', proveError.status, proveError.message);
    return {
      error: {
        message:
          'We saved that password but it did not work when we tested it. Please try a ' +
          'different password, or email ' + SUPPORT_EMAIL + ' and we will sort it out.',
      },
    };
  }

  return await sb.auth.updateUser({ data: { password_set: true } });
}

function passwordProblem(password, confirm) {
  if (!password || password.length < 8) return 'Please choose a password with at least 8 characters.';
  if (password !== confirm) return 'The two passwords don\'t match. Please type them again.';
  return null;
}

/* ---- CHANGE PASSWORD (dashboard) ----------------------------------- */
// Everyone who reaches the dashboard has a password now, so the button only
// ever toggles between changing one and cancelling.
const pwBtnLabel = 'Change password';

function bindAccount() {
  $('show-pw-btn').addEventListener('click', () => {
    const form = $('dash-pass-form');
    const opening = form.classList.contains('hidden');
    form.classList.toggle('hidden', !opening);
    $('show-pw-btn').textContent = opening ? 'Cancel' : pwBtnLabel;
    if (opening) $('dashpass').focus();
  });

  $('dash-pass-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = $('dash-pass-note');
    const password = $('dashpass').value;
    const problem = passwordProblem(password, $('dashpass2').value);
    if (problem) { note.className = 'note err'; note.textContent = problem; return; }

    const btn = $('dashpass-btn');
    btn.disabled = true; btn.textContent = 'Saving…';

    const { error } = await savePassword(await sessionEmail(), password);

    btn.disabled = false; btn.textContent = 'Save password';
    if (error) {
      note.className = 'note err';
      note.textContent = error.message || 'We could not save that password. Please try again.';
      return;
    }

    $('dashpass').value = ''; $('dashpass2').value = '';
    note.className = 'note ok';
    note.textContent = 'Password saved. Use it next time you sign in.';
    pwBtnLabel = 'Change password';
    $('pw-sub').textContent = 'Change the password you use to sign in.';
  });
}

function bindLogout() {
  $('logout-btn').addEventListener('click', async () => {
    await sb.auth.signOut();
    window.location.href = '/portal';
  });
}

/* ---- DASHBOARD ----------------------------------------------------- */
async function loadDashboard(token) {
  let data;
  try {
    const res = await fetch('/.netlify/functions/affiliate-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    });
    data = await res.json();
  } catch (err) {
    $('leads-area').innerHTML = '<div class="empty">Could not load your stats. Please refresh.</div>';
    return;
  }

  if (!data.affiliate) {
    $('greeting').textContent = 'Account not found';
    $('greeting-sub').textContent = data.message || 'No affiliate account is linked to this email.';
    hide('stat-cards'); hide('leads-area');
    return;
  }

  const a = data.affiliate;
  const s = data.stats;
  const first = (a.name || 'there').split(' ')[0];

  $('greeting').textContent = 'Welcome back, ' + first + '.';
  $('greeting-sub').textContent = 'Here’s how your referrals are performing.';
  $('aff-link').textContent = a.affiliate_link;

  // Personalised flyer download — /flyer renders it on the fly from the ref code.
  const refCode = (a.ref_code || (a.affiliate_link || '').split('ref=')[1] || '').trim();
  if (refCode) {
    $('flyer-btn').href = '/flyer?ref=' + encodeURIComponent(refCode);
  } else {
    $('flyer-btn').parentElement.style.display = 'none';
  }

  $('stat-cards').innerHTML = [
    card(s.clicksTotal, 'Total Clicks', s.clicks30 + ' in last 30 days'),
    card(s.leadsTotal, 'Applications', s.leads30 + ' in last 30 days'),
    card(s.byStatus.closed || 0, 'Closed Deals', (s.byStatus.contacted || 0) + ' in progress'),
    card(money(s.earnings), 'Earned', s.pending ? money(s.pending) + ' pending' : 'Paid on closed deals'),
  ].join('');

  const leads = data.leads || [];
  if (!leads.length) {
    $('leads-area').innerHTML =
      '<div class="empty">No referrals yet. Share your link above to start tracking clicks and applications.</div>';
  } else {
    $('leads-area').innerHTML =
      '<table><thead><tr><th>Applicant</th><th>Loan Program</th><th>Status</th><th>Date</th></tr></thead><tbody>' +
      leads.map((l) =>
        '<tr><td>' + esc(l.name) + '</td><td>' + esc(l.loan_program) +
        '</td><td><span class="pill ' + esc(l.status) + '">' + esc(l.status) +
        '</span></td><td>' + esc(l.date) + '</td></tr>'
      ).join('') +
      '</tbody></table>';
  }
}

function card(num, cap, small) {
  return '<div class="card"><div class="num">' + num + '</div><div class="cap">' + cap +
         '</div><div class="small">' + small + '</div></div>';
}

function money(n) {
  n = Number(n || 0);
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---- COPY LINK ----------------------------------------------------- */
function bindCopy() {
  $('copy-btn').addEventListener('click', () => {
    const link = $('aff-link').textContent;
    navigator.clipboard.writeText(link).then(() => {
      const btn = $('copy-btn');
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1600);
    });
  });
}
