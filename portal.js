/* =====================================================================
   Affiliate Portal — front-end logic
   Auth: Supabase email + password. First-time setup and resets go through
   /.netlify/functions/portal-login, which emails a one-click link and the
   same code in typed form.
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
  captureSetupLink(); // before route(), which strips the URL
  bindLogin();
  bindLogout();
  bindCopy();
  bindAccount();
  route();
});

// The sign-in email's button carries the one-time code in the URL *fragment*,
// which browsers never send to a server. A mailbox scanner that pre-fetches
// the link therefore asks sgcapital.io for a plain /portal and never sees the
// token, so it can't spend it before the affiliate clicks. Read it once, then
// strip it from the address bar so a refresh or a pasted URL can't replay it.
let setupFromLink = null;

function captureSetupLink() {
  const hash = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const code = (hash.get('setup') || '').replace(/\D/g, '');
  const email = (hash.get('email') || '').trim().toLowerCase();
  if (code.length === 6 && email) {
    setupFromLink = { code, email };
    cleanUrl();
  }
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
    if (setupFromLink) presentLinkCode();
    else showPanel('panel-signin');
  }
}

// Supabase doesn't expose "does this user have a password", so we record it
// ourselves the moment they set one.
function hasPassword(user) {
  return !!(user && user.user_metadata && user.user_metadata.password_set);
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
}

// Arrived on the email's one-click button: the code is already in hand, so
// there is nothing to type. It still takes a tap. A scanner that renders the
// page rather than merely fetching it would run an automatic verify and spend
// the code, and a spent code is exactly the failure this link shape exists to
// prevent — so the last step stays a deliberate human one.
function presentLinkCode() {
  codeEmail = setupFromLink.email;
  $('code').value = setupFromLink.code;
  $('code-title').textContent = 'Welcome back';
  $('code-intro').innerHTML =
    'Signing you in as <strong id="code-email"></strong>. Tap continue to choose your password.';
  $('code-email').textContent = setupFromLink.email;
  hide('code-manual');
  $('code-btn').textContent = 'Continue';
  showPanel('panel-code');
}

// Arrived by asking for a code, or falling back after a link didn't verify.
function presentManualCode(email) {
  setupFromLink = null;
  $('code-title').textContent = 'Check your email';
  $('code-intro').innerHTML =
    'We sent a 6-digit code to <strong id="code-email"></strong>. Enter it below to continue — it expires in 1 hour.';
  $('code-email').textContent = email;
  show('code-manual');
  $('code-btn').textContent = 'Continue';
  $('code').value = '';
  showPanel('panel-code');
  $('code').focus();
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

  // GoTrue issues the token against the lower-cased address, so verify with
  // the same form rather than whatever casing the affiliate typed.
  codeEmail = email.toLowerCase();
  if (result.code) {
    presentManualCode(email);
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

  // portal-login generates the token as type 'magiclink', so try that first:
  // every wrong-type attempt is still a failed verify against the same token.
  // 'email' is the generic alias newer GoTrue accepts, kept as a fallback.
  let { error } = await sb.auth.verifyOtp({ email: codeEmail, token, type: 'magiclink' });
  if (error) {
    ({ error } = await sb.auth.verifyOtp({ email: codeEmail, token, type: 'email' }));
  }

  btn.disabled = false; btn.textContent = 'Continue';
  if (error) {
    // GoTrue says "Token has expired or is invalid" for both a mistyped
    // code and one that was already spent, so log the real error: that
    // detail is the only way to tell the two apart when an affiliate
    // reports this.
    console.warn('verifyOtp failed:', error.status, error.message);
    // If they came in on the link the digits were hidden, so show them now:
    // otherwise the panel is a button with nothing to correct behind it.
    show('code-manual');
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
