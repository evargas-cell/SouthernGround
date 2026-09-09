// TuFlipEnGeorgia.com lead intake — Spanish-first ITIN fix & flip funnel.
//
// Separate from loan-application.js on purpose. That endpoint requires
// first_name/last_name/email and writes full applications; TuFlip is a
// WhatsApp-first funnel that collects only name + phone + city, and never
// asks Georgia leads for an email. Posting TuFlip's payload at
// loan-application.js would 400 on every real lead.
//
// Two submission types come through here:
//   type: 'lead'     → property is in Georgia. The one we act on.
//   type: 'waitlist' → property is outside Georgia. Email is optional and is
//                      the only way we can reach them later.
//
// Reuses the same env vars as the other functions: AIRTABLE_TOKEN,
// AIRTABLE_BASE_ID, RESEND_API_KEY. Airtable table name is overridable via
// TUFLIP_AIRTABLE_TABLE (default "TuFlip Leads") so it never mixes into the
// Applications pipeline.

const ALLOWED_ORIGINS = [
  'https://tuflipengeorgia.com',
  'https://www.tuflipengeorgia.com',
  'http://localhost:8123',
  'http://127.0.0.1:8123',
];

const NOTIFY_TO = ['edgar@sgcapital.io'];
const AIRTABLE_TABLE = process.env.TUFLIP_AIRTABLE_TABLE || 'TuFlip Leads';

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

exports.handler = async function (event) {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const cors = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return json(400, cors, { error: 'Invalid JSON' });
  }

  const {
    type, name, phone, phone_e164, property_location,
    city, city_other, has_property, email, lang,
    source, page, referrer,
    utm_source, utm_medium, utm_campaign, utm_content,
    fbclid, gclid, fbc, fbp, event_id,
    submitted_at,
  } = body;

  // Mirror the form's own client-side validation. Email is deliberately NOT
  // required — Georgia leads are contacted on WhatsApp.
  const cleanName = String(name || '').trim();
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  if (!cleanName || digits.length !== 10) {
    return json(400, cors, { error: 'Name and a 10-digit phone are required' });
  }

  const isWaitlist = type === 'waitlist' || property_location === 'outside';
  const cityLabel = (city === 'Otra' && city_other) ? city_other : (city || '');
  const language = lang === 'en' ? 'en' : 'es';
  const waLink = 'https://wa.me/1' + digits;
  const submitted = submitted_at || new Date().toISOString();
  const dateSubmitted = submitted.split('T')[0];

  // === STORE IN AIRTABLE (best effort — never blocks the response) ===
  const AIRTABLE_TOKEN   = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (AIRTABLE_TOKEN && AIRTABLE_BASE_ID) {
    try {
      const atRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              'Name':            cleanName,
              'Phone':           phone_e164 || ('+1' + digits),
              'Email':           email || '',
              'Type':            isWaitlist ? 'Waitlist (out of state)' : 'Georgia lead',
              'City':            cityLabel,
              'Has Property':    has_property || '',
              'Language':        language === 'es' ? 'Español' : 'English',
              'Source':          source || 'TuFlipEnGeorgia.com',
              'Landing Page':    page || '',
              'Referrer':        referrer || '',
              'UTM Source':      utm_source   || '',
              'UTM Medium':      utm_medium   || '',
              'UTM Campaign':    utm_campaign || '',
              'UTM Content':     utm_content  || '',
              // Click ids — this is what ties a closed loan back to one ad.
              'FB Click ID':     fbclid || '',
              'Google Click ID': gclid  || '',
              'Date Submitted':  dateSubmitted,
              'Status':          'New',
            },
          }),
        }
      );
      if (!atRes.ok) {
        console.error('Airtable error:', atRes.status, await atRes.text());
      } else {
        console.log('Airtable TuFlip lead created');
      }
    } catch (err) {
      console.error('Airtable fetch error:', err);
    }
  } else {
    console.log('Airtable env vars missing — TOKEN:', !!AIRTABLE_TOKEN, 'BASE_ID:', !!AIRTABLE_BASE_ID);
  }

  // === EMAIL VIA RESEND (best effort) ===
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:     'TuFlipEnGeorgia <leads@sgcapital.io>',
          to:       NOTIFY_TO,
          reply_to: email || undefined,
          subject:  isWaitlist
            ? `Lista de espera (fuera de GA) — ${cleanName}`
            : `Nuevo lead GEORGIA — ${cleanName}${cityLabel ? ' · ' + cityLabel : ''}`,
          html: buildNotificationEmail({
            cleanName, digits, waLink, email, isWaitlist, cityLabel,
            has_property, language, source, page, referrer,
            utm_source, utm_medium, utm_campaign, utm_content, submitted,
          }),
        }),
      });

      // Confirmation to the person — only possible when they gave an email,
      // which on this funnel means the out-of-state waitlist path.
      if (email) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from:     'TuFlipEnGeorgia <hola@sgcapital.io>',
            to:       [email],
            reply_to: 'edgar@sgcapital.io',
            subject:  language === 'es'
              ? 'Te anotamos en la lista — TuFlipEnGeorgia'
              : 'You’re on the list — TuFlipEnGeorgia',
            html: buildWaitlistEmail(cleanName, language),
          }),
        });
      }
    } catch (err) {
      console.error('Resend error:', err);
    }
  } else {
    console.error('RESEND_API_KEY missing — no alert sent for TuFlip lead:', cleanName);
  }

  // === META CONVERSIONS API (best effort) ===
  // The browser Pixel loses roughly a third of events to iOS ATT, ad blockers
  // and Safari ITP. This server-side copy is not blockable. Both carry the same
  // event_id, so Meta dedupes them into one conversion.
  await sendMetaConversion({
    eventId: event_id,
    eventTime: Math.floor(new Date(submitted).getTime() / 1000),
    sourceUrl: page,
    name: cleanName,
    email,
    phoneDigits: digits,
    city: cityLabel,
    fbc, fbp,
    isWaitlist,
    clientIp: header(event, 'x-nf-client-connection-ip') || header(event, 'x-forwarded-for'),
    userAgent: header(event, 'user-agent'),
  });

  return json(200, cors, { ok: true });
};

function header(event, name) {
  const h = event.headers || {};
  const v = h[name] || h[name.toLowerCase()] || '';
  // x-forwarded-for can be a comma-separated chain; the client is first.
  return String(v).split(',')[0].trim();
}

// SHA-256 hex, per Meta's Advanced Matching spec. Values must be normalised
// (trimmed + lowercased) BEFORE hashing or the match rate collapses.
function sha256(v) {
  if (!v) return null;
  return require('crypto').createHash('sha256')
    .update(String(v).trim().toLowerCase()).digest('hex');
}

async function sendMetaConversion(d) {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const TOKEN    = process.env.META_CAPI_TOKEN;
  if (!PIXEL_ID || !TOKEN) {
    console.log('Meta CAPI skipped — META_PIXEL_ID / META_CAPI_TOKEN not set');
    return;
  }
  if (!d.eventId) {
    // Without a shared id this would double-count against the Pixel event.
    console.warn('Meta CAPI skipped — payload carried no event_id');
    return;
  }

  // Meta wants phone as digits including country code, no punctuation.
  const parts = String(d.name || '').split(/\s+/).filter(Boolean);
  const first = parts[0] || '';
  const last  = parts.length > 1 ? parts[parts.length - 1] : '';

  const user_data = {
    ph: [sha256('1' + d.phoneDigits)].filter(Boolean),
    fn: [sha256(first)].filter(Boolean),
    ln: [sha256(last)].filter(Boolean),
    ct: [sha256(String(d.city || '').replace(/\s+/g, ''))].filter(Boolean),
    st: [sha256('ga')],
    country: [sha256('us')],
  };
  if (d.email)     user_data.em = [sha256(d.email)];
  if (d.fbc)       user_data.fbc = d.fbc;
  if (d.fbp)       user_data.fbp = d.fbp;
  if (d.clientIp)  user_data.client_ip_address = d.clientIp;
  if (d.userAgent) user_data.client_user_agent = d.userAgent;

  // Drop empty arrays so we don't send nulls Meta will reject.
  Object.keys(user_data).forEach((k) => {
    if (Array.isArray(user_data[k]) && user_data[k].filter(Boolean).length === 0) delete user_data[k];
  });

  const payload = {
    data: [{
      event_name: 'Lead',
      event_time: d.eventTime || Math.floor(Date.now() / 1000),
      event_id: d.eventId,
      event_source_url: d.sourceUrl || 'https://tuflipengeorgia.com/',
      action_source: 'website',
      user_data,
      custom_data: {
        content_name: d.isWaitlist ? 'waitlist' : 'lead',
        content_category: d.isWaitlist ? 'waitlist' : 'georgia_lead',
      },
    }],
  };
  // Set META_TEST_EVENT_CODE while validating in Events Manager → Test Events,
  // then remove it. Leaving it set keeps events out of live optimization.
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      console.error('Meta CAPI error:', res.status, await res.text());
    } else {
      console.log('Meta CAPI Lead sent, event_id:', d.eventId);
    }
  } catch (err) {
    console.error('Meta CAPI fetch error:', err);
  }
}

// Exported for previewing the emails off-box (see scripts/preview-tuflip-lead.js).
exports.buildNotificationEmail = buildNotificationEmail;
exports.buildWaitlistEmail = buildWaitlistEmail;

function json(statusCode, cors, payload) {
  return {
    statusCode,
    headers: Object.assign({ 'Content-Type': 'application/json' }, cors),
    body: JSON.stringify(payload),
  };
}

function fmtPhone(digits) {
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Internal alert. Built to be acted on from a phone: the WhatsApp button is the
// primary action, because that is what the landing page promises the lead.
function buildNotificationEmail(d) {
  const row = (label, value) => value
    ? `<tr><td style="padding:6px 12px;color:#556B5C;font-size:13px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eee"><strong>${label}</strong></td><td style="padding:6px 12px;color:#1C2B20;font-size:13px;border-bottom:1px solid #eee">${escapeHtml(value)}</td></tr>`
    : '';

  const utmRows =
    row('UTM Source', d.utm_source) +
    row('UTM Medium', d.utm_medium) +
    row('UTM Campaign', d.utm_campaign) +
    row('UTM Content', d.utm_content);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:640px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">

    <div style="background:#16261C;padding:24px 32px">
      <h1 style="margin:0;color:#9B6820;font-size:19px;letter-spacing:1px">TUFLIPENGEORGIA.COM</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px">
        ${d.isWaitlist ? 'Lista de espera — propiedad FUERA de Georgia' : 'Nuevo lead — propiedad en GEORGIA'}
      </p>
    </div>

    <div style="padding:32px">
      <h2 style="color:#16261C;margin:0 0 4px;font-size:24px">${escapeHtml(d.cleanName)}</h2>
      <p style="color:#556B5C;margin:0 0 20px;font-size:15px">
        ${fmtPhone(d.digits)}${d.cityLabel ? ' &middot; ' + escapeHtml(d.cityLabel) : ''}
        &middot; habla ${d.language === 'es' ? 'español' : 'inglés'}
      </p>

      ${d.isWaitlist ? '' : `
      <div style="text-align:center;margin:0 0 28px">
        <a href="${d.waLink}" style="background:#25D366;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block">Escribirle por WhatsApp &rarr;</a>
        <p style="margin:10px 0 0;color:#999;font-size:12px">
          O llamar: <a href="tel:+1${d.digits}" style="color:#556B5C">${fmtPhone(d.digits)}</a>
        </p>
      </div>`}

      <table style="width:100%;border-collapse:collapse;border:1px solid #DAE3DC;border-radius:6px;overflow:hidden">
        ${row('Teléfono', fmtPhone(d.digits))}
        ${row('Email', d.email)}
        ${row('Ciudad', d.cityLabel)}
        ${row('¿Ya tiene propiedad?', d.has_property)}
        ${row('Idioma', d.language === 'es' ? 'Español' : 'English')}
        ${row('Enviado', d.submitted)}
      </table>

      <h3 style="color:#9B6820;font-size:12px;text-transform:uppercase;letter-spacing:.5px;margin:24px 0 6px">Origen</h3>
      <table style="width:100%;border-collapse:collapse;border:1px solid #DAE3DC;border-radius:6px;overflow:hidden">
        ${row('Source', d.source)}
        ${row('Página', d.page)}
        ${row('Referrer', d.referrer)}
        ${utmRows || row('UTM', '—')}
      </table>

      ${d.isWaitlist ? `
      <div style="background:#f9f6f0;border-left:4px solid #9B6820;padding:16px 20px;margin-top:24px;border-radius:0 6px 6px 0">
        <p style="margin:0;color:#555;font-size:14px;line-height:1.6">
          Propiedad fuera de Georgia — no hay nada que fondear hoy.
          ${d.email ? 'Ya recibió el correo de confirmación.' : 'No dejó email, así que WhatsApp es el único contacto.'}
        </p>
      </div>` : ''}
    </div>

    <div style="background:#f5f5f0;padding:16px 32px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">TuFlipEnGeorgia.com &middot; Southern Ground Capital</p>
    </div>

  </div>
</body>
</html>`;
}

// Waitlist confirmation, in the language the person used on the site.
function buildWaitlistEmail(name, lang) {
  const firstName = (name || '').split(' ')[0];
  const year = new Date().getFullYear();
  const es = lang === 'es';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">

    <div style="background:#16261C;padding:32px 40px">
      <h1 style="margin:0;color:#9B6820;font-size:21px;letter-spacing:1px">TUFLIPENGEORGIA.COM</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px">
        ${es ? 'Préstamos fix &amp; flip con ITIN' : 'Fix &amp; flip loans with an ITIN'}
      </p>
    </div>

    <div style="padding:40px">
      <h2 style="color:#16261C;font-size:25px;margin:0 0 16px">
        ${es ? `Listo, ${escapeHtml(firstName)} — te anotamos.` : `You’re on the list, ${escapeHtml(firstName)}.`}
      </h2>
      <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 16px">
        ${es
          ? 'Ahorita solo prestamos sobre propiedades que están en el estado de Georgia, así que todavía no podemos fondear tu proyecto. Guardamos tus datos y te escribimos en cuanto abramos en tu estado.'
          : 'Right now we only lend on properties located in the state of Georgia, so we can’t fund your project yet. We’ve saved your details and we’ll reach out the moment we open in your state.'}
      </p>

      <div style="background:#f9f6f0;border-left:4px solid #9B6820;padding:20px 24px;margin:28px 0;border-radius:0 6px 6px 0">
        <p style="margin:0;color:#555;font-size:15px;line-height:1.6">
          ${es
            ? '¿Y si consigues una propiedad <strong>en Georgia</strong>? Escríbenos y la vemos de una vez — ahí sí podemos ayudarte.'
            : 'Find a property <strong>in Georgia</strong>? Message us and we’ll look at it right away — that one we can fund.'}
        </p>
      </div>

      <div style="text-align:center;margin:28px 0 8px">
        <a href="https://wa.me/16787720977" style="background:#25D366;color:#fff;text-decoration:none;padding:14px 30px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block">
          ${es ? 'Escríbenos por WhatsApp &rarr;' : 'Message us on WhatsApp &rarr;'}
        </a>
      </div>

      <p style="color:#555;font-size:15px;margin:28px 0 0">
        ${es ? 'Un saludo,' : 'Best,'}<br/>
        <strong style="color:#16261C">Edgar Vargas</strong><br/>
        Southern Ground Capital
      </p>
    </div>

    <div style="background:#f5f5f0;padding:16px 40px;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">
        &copy; ${year} Southern Ground Capital, LLC &middot;
        ${es ? 'Préstamos de inversión únicamente' : 'Investment loans only'}
      </p>
    </div>

  </div>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
