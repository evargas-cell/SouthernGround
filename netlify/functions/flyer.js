// GET /flyer?ref=<affiliate-ref-code>
// Renders that affiliate's personalised funding flyer as a PDF. Same sheet the
// welcome email attaches, so an affiliate can re-download it any time (the
// portal links here) and existing affiliates can get one without a resend.
const { configured, sbSelect } = require('./lib/supabase');
const { buildFlyer } = require('./lib/flyer-pdf');

// Turn a ref code into a readable fallback name if we can't look one up.
function nameFromRef(ref) {
  return ref
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

exports.handler = async function (event) {
  const ref = String((event.queryStringParameters && event.queryStringParameters.ref) || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 64);

  if (!ref) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Missing ?ref= affiliate code.',
    };
  }

  let name = null;
  if (configured()) {
    const rows = await sbSelect(
      'affiliates',
      `ref_code=eq.${encodeURIComponent(ref)}&select=name&limit=1`
    );
    if (rows[0] && rows[0].name) name = rows[0].name;
  }
  // No Supabase match: still render, using the ref code as the name. Keeps the
  // link working for Airtable-only affiliates from before the migration.
  if (!name) name = nameFromRef(ref);

  try {
    const pdf = buildFlyer({ name, url: `https://sgcapital.io/?ref=${ref}` });
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="SGC-Investor-Funding-Flyer-${ref}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
      body: pdf.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('Flyer render error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not build the flyer. Please contact affiliates@sgcapital.io.',
    };
  }
};
