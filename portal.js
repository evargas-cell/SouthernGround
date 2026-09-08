/* =====================================================================
   Affiliate Portal — front-end logic
   Auth: Supabase email + password. First-time setup and resets go through a
   6-digit code from /.netlify/functions/portal-login.
   Data: /.netlify/functions/affiliate-stats
   ===================================================================== */

/* ---- CONFIG -------------------------------------------------------- */
/* The publishable key is SAFE to expose in the browser (that's its job).
   Do NOT paste the secret (sb_secret_…) key here. */
const SUPABASE_URL = 'https://husitwpydwrtfmstcxrl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_k6oM2k-L227MgWFP9DL52Q_VLSKOPra';
/* -------------------------------------------------------------------- */

const REDIRECT_TO = window.location.origin + '/portal';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const show = (id) => $(id).classList.remove('hidden');
const hide = (id) => $(id).classList.add('hidden');

document.addEventListener('DOMContentLoaded', () => {
  $('yr').textContent = new Date().getFullYear();
  bindLogin();
  bindLogout();
  bindCopy();
  bindAccount();
  route();
});

// Set when an affiliate dismisses the "create your password" prompt, so we
// don't nag them again for the rest of the visit.
let skippedPassword = false;

// "Set password" for someone who has none, "Change password" once they do.
let pwBtnLabel = 'Change password';

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

    // Signed in but no password yet — either a first-time setup that came in
    // on a code, or an affiliate who clicked a link. Offer the password now,
    // while they're already here, so the next visit needs no email at all.
    if (!hasPassword(session.user) && !skippedPassword) {
      hide('view-loading'); hide('view-dash');
      show('view-login'); show('logout-btn');
      showPanel('panel-newpass');
      return;
    }

    hide('view-loading'); hide('view-login');
    show('view-dash'); show('logout-btn');
    reflectPasswordState(session.user);
    loadDashboard(session.access_token);
  } else {
    hide('view-loading'); hide('view-dash'); hide('logout-btn');
    show('view-login');
    showPanel('panel-signin');
  }
}

// Supabase doesn't expose "does this user have a password", so we record it
// ourselves the moment they set one.
function hasPassword(user) {
  return !!(user && user.user_metadata && user.user_metadata.password_set);
}

// Someone who skipped the prompt should still be able to see, at a glance,
// that setting a password is the thing that ends the emailed codes.
function reflectPasswordState(user) {
  const set = hasPassword(user);
  pwBtnLabel = set ? 'Change password' : 'Set password';
  $('pw-sub').textContent = set
    ? 'Change the password you use to sign in.'
    : "You haven't set a password yet. Set one and you can sign in without waiting for an emailed code.";
  if ($('dash-pass-form').classList.contains('hidden')) $('show-pw-btn').textContent = pwBtnLabel;
}

function showPanel(id) {
  ['panel-signin', 'panel-code', 'panel-newpass'].forEach((p) => (p === id ? show(p) : hide(p)));
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
      note.textContent = decodeURIComponent(err).replace(/\+/g, ' ') + ' — please request a new code.';
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
   Three steps, and most affiliates only ever see the first: sign in with
   email + password. The code panel exists for the two moments they have no
   password — first visit and a reset — and it hands straight over to the
   panel where they choose one.
   -------------------------------------------------------------------- */
let codeEmail = ''; // address the current code was sent to

function bindLogin() {
  $('signin-form').addEventListener('submit', onSignIn);
  $('code-form').addEventListener('submit', onVerifyCode);
  $('newpass-form').addEventListener('submit', onCreatePassword);

  $('need-code-btn').addEventListener('click', () => sendCode($('email').value.trim()));
  $('resend-btn').addEventListener('click', () => sendCode(codeEmail));
  $('back-signin-btn').addEventListener('click', () => showPanel('panel-signin'));
  $('skip-pass-btn').addEventListener('click', () => { skippedPassword = true; route(); });
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
        ? "That email and password don't match. If you haven't set a password yet, use the link below to get a code by email."
        : error.message || 'Something went wrong. Please try again.',
      'err'
    );
  }
  // On success onAuthStateChange fires and route() takes over.
}

async function sendCode(email) {
  if (!email) {
    showPanel('panel-signin');
    setNote('Enter your email address first, then tap that link again.', 'err');
    $('email').focus();
    return;
  }

  setNote('Sending your code…', 'ok');
  const result = await requestCode(email);

  if (result.error) {
    setNote(result.error, 'err');
    return;
  }

  codeEmail = email;
  if (result.code) {
    $('code-email').textContent = email;
    showPanel('panel-code');
    $('code').value = '';
    $('code').focus();
  } else {
    // Fallback path — Supabase sent its own email, which has no typed code
    // in it, so point them at the link instead of asking for digits.
    showPanel('panel-signin');
    setNote('We emailed a sign-in link to ' + email + '. Open that email and click the link to continue.', 'ok');
  }
}

// Returns { code } on success or { error } with a message for the affiliate.
async function requestCode(email) {
  try {
    const res = await fetch('/.netlify/functions/portal-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { code: !!data.code };
    // Function isn't configured (missing env) — don't leave the affiliate
    // stranded, let Supabase send its own email as a last resort.
    if (data.fallback) return await otpFallback(email);
    return { error: data.error || 'Something went wrong. Please try again.' };
  } catch {
    return await otpFallback(email);
  }
}

async function otpFallback(email) {
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: REDIRECT_TO },
  });
  if (error) return { error: error.message || 'Something went wrong. Please try again.' };
  return { code: false };
}

async function onVerifyCode(e) {
  e.preventDefault();
  const token = $('code').value.replace(/\D/g, '');
  if (token.length !== 6) {
    setNote('Please enter all 6 digits of the code from your email.', 'err');
    return;
  }

  const btn = $('code-btn');
  btn.disabled = true; btn.textContent = 'Checking…';
  setNote('', '');

  // 'email' is the generic type GoTrue accepts for a magic-link OTP; older
  // projects want the explicit 'magiclink', so try that before giving up.
  let { error } = await sb.auth.verifyOtp({ email: codeEmail, token, type: 'email' });
  if (error) {
    ({ error } = await sb.auth.verifyOtp({ email: codeEmail, token, type: 'magiclink' }));
  }

  btn.disabled = false; btn.textContent = 'Continue';
  if (error) {
    setNote('That code didn\'t work. Codes expire after an hour and can only be used once — tap "Send me another code" for a fresh one.', 'err');
  }
  // On success onAuthStateChange fires and route() shows the password panel.
}

async function onCreatePassword(e) {
  e.preventDefault();
  const password = $('newpass').value;
  const confirm = $('newpass2').value;
  const problem = passwordProblem(password, confirm);
  if (problem) { setNote(problem, 'err'); return; }

  const btn = $('newpass-btn');
  btn.disabled = true; btn.textContent = 'Saving…';

  const { error } = await savePassword(password);

  btn.disabled = false; btn.textContent = 'Save my password';
  if (error) {
    setNote(error.message || 'We could not save that password. Please try again.', 'err');
    return;
  }

  skippedPassword = false;
  route();
}

// Shared by the first-time panel and the dashboard's change-password form.
function savePassword(password) {
  return sb.auth.updateUser({ password, data: { password_set: true } });
}

function passwordProblem(password, confirm) {
  if (!password || password.length < 8) return 'Please choose a password with at least 8 characters.';
  if (password !== confirm) return 'The two passwords don\'t match. Please type them again.';
  return null;
}

/* ---- CHANGE PASSWORD (dashboard) ----------------------------------- */
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

    const { error } = await savePassword(password);

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
