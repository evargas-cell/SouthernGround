/* =====================================================================
   Affiliate Portal — front-end logic
   Auth: Supabase magic link. Data: /.netlify/functions/affiliate-stats
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
  route();
});

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
    hide('view-loading'); hide('view-login');
    show('view-dash'); show('logout-btn');
    loadDashboard(session.access_token);
  } else {
    hide('view-loading'); hide('view-dash'); hide('logout-btn');
    show('view-login');
  }
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

/* ---- LOGIN --------------------------------------------------------- */
function bindLogin() {
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('email').value.trim();
    if (!email) return;
    const btn = $('login-btn');
    const note = $('login-note');
    btn.disabled = true; btn.textContent = 'Sending…';
    note.className = 'note';

    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: REDIRECT_TO },
    });

    if (error) {
      note.className = 'note err';
      note.textContent = error.message || 'Something went wrong. Please try again.';
      btn.disabled = false; btn.textContent = 'Send my sign-in link';
    } else {
      note.className = 'note ok';
      note.textContent = 'Check your inbox! We sent a sign-in link to ' + email + '. It expires in 1 hour.';
      btn.textContent = 'Link sent';
    }
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
