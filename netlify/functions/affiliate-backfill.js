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

  // --- What's already in Supabase? ---
  const existing = await sbSelect('affiliates', 'select=ref_code');
  const have = new Set(existing.map((a) => (a.ref_code || '').toLowerCase()));

  const toInsert = [];
  const skipped = [];
  for (const rec of records) {
    const f = rec.fields || {};
    const slug = (f.Slug || deriveSlug(f.Name)).toLowerCase();
    if (!f.Email || !slug) {
      skipped.push({ id: rec.id, reason: 'missing email or slug' });
      continue;
    }
    if (have.has(slug)) {
      skipped.push({ slug, reason: 'already in supabase' });
      continue;
    }
    have.add(slug);
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

  let inserted = 0;
  if (toInsert.length) {
    const res = await sbInsert('affiliates', toInsert);
    if (!res.ok) return json(502, { error: 'Supabase insert failed', detail: await res.text() });
    inserted = toInsert.length;
  }

  return json(200, {
    airtableRecords: records.length,
    inserted,
    skipped: skipped.length,
    skippedDetail: skipped,
  });
};

function deriveSlug(name) {
  return (name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
