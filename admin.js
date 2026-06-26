/* =====================================================================
   Admin console — manage all leads, set status + commission.
   Auth: Supabase magic link (admin emails only, enforced server-side).
   ===================================================================== */
const SUPABASE_URL = 'https://husitwpydwrtfmstcxrl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_k6oM2k-L227MgWFP9DL52Q_VLSKOPra';
const REDIRECT_TO = window.location.origin + '/admin';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = (id) => document.getElementById(id);
const show = (id) => $(id).classList.remove('hidden');
const hide = (id) => $(id).classList.add('hidden');

const STATUS_COLORS = {
  new: '#2848A8', contacted: '#8A5A12', closed: '#0A5C30', dead: '#777',
};

document.addEventListener('DOMContentLoaded', () => {
  bindLogin();
  $('logout-btn').addEventListener('click', async () => { await sb.auth.signOut(); location.href = '/admin'; });
  route();
});
sb.auth.onAuthStateChange(() => route());

async function route() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    hide('view-loading'); hide('view-login');
    loadAdmin(session.access_token);
  } else {
    hide('view-loading'); hide('view-admin'); hide('view-denied'); hide('logout-btn');
    show('view-login');
  }
}

function bindLogin() {
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('email').value.trim();
    if (!email) return;
    const btn = $('login-btn'); const note = $('login-note');
    btn.disabled = true; btn.textContent = 'Sending…';
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: REDIRECT_TO } });
    if (error) {
      note.className = 'note err'; note.textContent = error.message || 'Something went wrong.';
      btn.disabled = false; btn.textContent = 'Send my sign-in link';
    } else {
      note.className = 'note ok';
      note.textContent = 'Check your inbox — sign-in link sent to ' + email + '.';
      btn.textContent = 'Link sent';
    }
  });
}

let TOKEN = null;

async function loadAdmin(token) {
  TOKEN = token;
  let data;
  try {
    const res = await fetch('/.netlify/functions/admin-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    });
    if (res.status === 403) { hide('view-admin'); show('view-denied'); show('logout-btn'); return; }
    data = await res.json();
  } catch (err) {
    $('view-loading').textContent = 'Could not load. Refresh to retry.';
    show('view-loading'); return;
  }

  show('view-admin'); show('logout-btn');
  renderSummary(data.leads || []);
  renderRows(data.leads || []);
}

function renderSummary(leads) {
  const total = leads.length;
  const closed = leads.filter((l) => l.status === 'closed').length;
  const inProgress = leads.filter((l) => l.status === 'contacted').length;
  const paid = leads.reduce((s, l) => s + (l.status === 'closed' ? Number(l.commission || 0) : 0), 0);
  $('summary').innerHTML = [
    scard(total, 'Total Leads'),
    scard(inProgress, 'In Progress'),
    scard(closed, 'Closed'),
    scard(money(paid), 'Commissions (closed)'),
  ].join('');
}
function scard(num, cap) { return '<div class="scard"><div class="num">' + num + '</div><div class="cap">' + cap + '</div></div>'; }

function renderRows(leads) {
  if (!leads.length) { $('rows').innerHTML = '<tr><td colspan="9" style="text-align:center;color:#556B5C;padding:28px">No leads yet.</td></tr>'; return; }
  $('rows').innerHTML = leads.map(rowHtml).join('');
  leads.forEach((l) => wireRow(l.id));
}

function rowHtml(l) {
  const opts = ['new', 'contacted', 'closed', 'dead']
    .map((s) => '<option value="' + s + '"' + (s === l.status ? ' selected' : '') + '>' + s + '</option>').join('');
  const fee = l.origination_fee == null ? '' : l.origination_fee;
  const pct = l.commission_pct == null ? 30 : l.commission_pct;
  return '<tr data-id="' + l.id + '">' +
    '<td class="meta">' + esc(l.date) + '</td>' +
    '<td><div class="applicant">' + esc(l.applicant) + '</div><div class="meta">' + esc(l.email) + (l.phone ? ' · ' + esc(l.phone) : '') + '</div></td>' +
    '<td>' + esc(l.affiliate) + '</td>' +
    '<td>' + esc(l.loan_program || '—') + '</td>' +
    '<td><select class="status-in">' + opts + '</select></td>' +
    '<td>$<input class="fee-in" type="number" min="0" step="50" value="' + fee + '" placeholder="0"></td>' +
    '<td><input class="pct-in" type="number" min="0" max="30" step="1" value="' + pct + '">%</td>' +
    '<td class="commission" id="comm-' + l.id + '">' + (l.commission != null ? money(l.commission) : '—') + '</td>' +
    '<td><button class="saveb">Save</button></td>' +
    '</tr>';
}

function wireRow(id) {
  const tr = document.querySelector('tr[data-id="' + cssEsc(id) + '"]');
  if (!tr) return;
  const feeIn = tr.querySelector('.fee-in');
  const pctIn = tr.querySelector('.pct-in');
  const comm = tr.querySelector('.commission');
  const statusSel = tr.querySelector('.status-in');
  const saveb = tr.querySelector('.saveb');

  // Live preview of computed commission as you type.
  const preview = () => {
    const f = Number(feeIn.value || 0);
    let p = Number(pctIn.value || 0); if (p > 30) { p = 30; pctIn.value = 30; }
    comm.textContent = f && p ? money(Math.round(f * (p / 100) * 100) / 100) : '—';
  };
  feeIn.addEventListener('input', preview);
  pctIn.addEventListener('input', preview);
  statusSel.addEventListener('change', () => {
    statusSel.style.color = STATUS_COLORS[statusSel.value] || '';
    statusSel.style.fontWeight = '600';
  });
  statusSel.dispatchEvent(new Event('change'));

  saveb.addEventListener('click', async () => {
    saveb.disabled = true; saveb.textContent = 'Saving…';
    const payload = {
      id,
      status: statusSel.value,
      origination_fee: feeIn.value === '' ? null : Number(feeIn.value),
      commission_pct: Number(pctIn.value || 0),
    };
    try {
      const res = await fetch('/.netlify/functions/admin-update-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
        body: JSON.stringify(payload),
      });
      const out = await res.json();
      if (res.ok && out.updated) {
        comm.textContent = out.updated.commission != null ? money(out.updated.commission) : '—';
        saveb.textContent = 'Saved ✓'; saveb.classList.add('saved');
        setTimeout(() => { saveb.textContent = 'Save'; saveb.classList.remove('saved'); saveb.disabled = false; }, 1500);
      } else {
        saveb.textContent = 'Error'; saveb.disabled = false;
        alert(out.error || 'Update failed');
      }
    } catch (err) {
      saveb.textContent = 'Error'; saveb.disabled = false;
    }
  });
}

function money(n) { return '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }); }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function cssEsc(s) { return String(s).replace(/"/g, '\\"'); }
