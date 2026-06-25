// ONE-TIME (and idempotent) sync: copies affiliates from Airtable into the
// Supabase `affiliates` table so every existing ?ref= link attributes clicks
// and leads. Safe to run repeatedly — it only inserts ref_codes not already
// present in Supabase.
//
// Usage:  POST /.netlify/functions/affiliate-backfill?key=<ADMIN_SEND_KEY>
const { configured, sbSelect, sbInsert } = require('./lib/supabase');

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};

  const ADMIN = process.env.ADMIN_SEND_KEY;
  if (!ADMIN) return json(500, { error: 'ADMIN_SEND_KEY not set in Netlify env' });
  if (params.key !== ADMIN) return json(401, { error: 'Unauthorized' });
  if (!configured()) return json(500, { error: 'Supabase env vars missing' });

  const AIRTABLE_TOKEN   = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return json(500, { error: 'Airtable env vars missing' });
  }

  // --- Read every affiliate from Airtable (paged) ---
  const records = [];
  try {
    let offset;
    do {
      const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Affiliates`);
      url.searchParams.set('pageSize', '100');
      if (offset) url.searchParams.set('offset', offset);
      const r = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
      if (!r.ok) return json(502, { error: 'Airtable read failed', detail: await r.text() });
      const j = await r.json();
      records.push(...j.records);
      offset = j.offset;
    } while (offset);
  } catch (err) {
    return json(502, { error: 'Airtable fetch error', detail: String(err) });
  }

  // --- What's already in Supabase? (dedupe on both ref_code AND email) ---
  const existing = await sbSelect('affiliates', 'select=ref_code,email');
  const haveRef   = new Set(existing.map((a) => (a.ref_code || '').toLowerCase()));
  const haveEmail = new Set(existing.map((a) => (a.email || '').toLowerCase()));

  const toInsert = [];
  const skipped = [];
  for (const rec of records) {
    const f = rec.fields || {};
    const slug  = (f.Slug || deriveSlug(f.Name)).toLowerCase();
    const email = (f.Email || '').toLowerCase();
    if (!email || !slug) {
      skipped.push({ id: rec.id, reason: 'missing email or slug' });
      continue;
    }
    if (haveRef.has(slug))    { skipped.push({ slug,  reason: 'ref_code already present' }); continue; }
    if (haveEmail.has(email)) { skipped.push({ email, reason: 'email already present' });    continue; }
    haveRef.add(slug);
    haveEmail.add(email);
    toInsert.push({
      name:           f.Name || '',
      email:          f.Email,
      phone:          f.Phone || null,
      role:           f.Role || null,
      ref_code:       slug,
      affiliate_link: f['Affiliate Link'] || `https://sgcapital.io/?ref=${slug}`,
      airtable_id:    rec.id,
    });
  }

  // Insert one at a time so a single duplicate can't abort the whole run.
  let inserted = 0;
  const failed = [];
  for (const row of toInsert) {
    const res = await sbInsert('affiliates', row);
    if (res.ok) { inserted++; continue; }
    const detail = await res.text();
    // 409 / 23505 = already exists (race or in-Airtable dupe) — treat as skip.
    if (res.status === 409 || detail.includes('23505')) {
      skipped.push({ email: row.email, reason: 'duplicate (already exists)' });
    } else {
      failed.push({ email: row.email, status: res.status, detail });
    }
  }

  return json(200, {
    airtableRecords: records.length,
    inserted,
    skipped: skipped.length,
    failed: failed.length,
    failedDetail: failed,
    skippedDetail: skipped,
  });
};

function deriveSlug(name) {
  return (name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
