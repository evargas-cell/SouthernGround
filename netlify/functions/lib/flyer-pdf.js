// Builds the personalised "Real Estate Investor Funding" flyer PDF that goes
// out with the affiliate welcome email. Same sheet for every affiliate except
// the name, referral URL and QR code in the call-to-action band.
//
// The program terms below mirror the capital partner's published program guide.
// When the partner reprices, update TERMS and PROGRAM_GUIDE_DATE only.
const { Document, widthOf } = require('./pdf');
const qr = require('./qr');
const logo = require('./flyer-logo');

// ---------- Brand ----------
const FOREST = '#16261C';
const FOREST_MID = '#1E3226';
const AMBER = '#9B6820';
const AMBER_LIGHT = '#F5EDD6';
const CREAM = '#F7F0E2';
const WHITE = '#FFFFFF';
const INK = '#1C2B20';
const MUTED = '#556B5C';
const RED = '#8B1A1A';
const RED_BG = '#FDEDED';
const BORDER = '#DAE3DC';

// ---------- Program terms (from the capital partner's program guide) ----------
const PROGRAM_GUIDE_DATE = '03/04/2026';

const PILLS = [
  { label: 'FIRST-POSITION LOANS ONLY', style: 'amber' },
  { label: 'LOANS $75K+', style: 'forest' },
  { label: '660+ CREDIT', style: 'outline' },
  { label: 'UP TO 10 UNITS', style: 'outline' },
];

const PRODUCTS = [
  { name: 'FIX & FLIP',  lead: 'Up to 90% LTC', lines: ['Max 70% of ARV', 'Rates as low as 7.73%'] },
  { name: 'DSCR',        lead: 'Up to 80% LTV', lines: ['30-year term', 'Rates as low as 5.75%'] },
  { name: 'NEW BUILDS',  lead: 'Up to 85% LTC', lines: ['Max 70% LTV', 'Rates as low as 8.99%'] },
  { name: 'REFINANCE',   lead: 'Up to 75% LTV', lines: ['Bridge / cash-out', 'Fast closing options'] },
];

const MUST_HAVES = [
  'Business or investment purpose',
  'First-position lien',
  '$75,000 minimum loan request',
  'Minimum credit score: 660',
  'Residential investment property, up to 10 units',
  'Supportable purchase price, rehab budget and ARV',
];

const READINESS = [
  'Cash for down payment and closing costs',
  'Required payment reserves',
  'Complete property photos and documents',
  'Clear exit strategy',
  'Verifiable comparable sales',
  'Rehab / construction team when required',
];

const DISQUALIFIERS = [
  'Owner-occupied or primary residence',
  'Second-position or gap-funding request',
  'Loan request below $75,000',
  'Credit score below 660',
  'Full fire burnout',
  'Unsupported ARV or inflated values',
  'No cash, reserves or realistic exit plan',
];

const RESERVE_RULES = [
  'First-time rehab borrowers: 9 months of payment reserves.',
  'Projects with total cost of $125K or less: generally 20% down.',
];

const SEND_LINES = [
  'Property address  |  Purchase price / current value  |  Loan amount',
  'Rehab budget  |  ARV  |  Approx. credit  |  Cash / reserves',
  'Closing date  |  Experience  |  Exit strategy',
];

const DISCLAIMER =
  'Program benchmarks are for general information only and may change. Rates shown are "as low as" benchmarks and are not ' +
  'guaranteed. All loans are subject to underwriting, appraisal or valuation, title review, property eligibility, capital ' +
  'availability and final approval. {PARTNER} is a referral partner, not the lender, and may receive compensation if a referred ' +
  'loan closes. Southern Ground Capital may use private or institutional capital depending on the transaction.';

// ---------- Helpers ----------

// Draw a panel: rounded white body with a coloured header bar across the top.
function panel(page, x, top, w, bodyHeight, headerHeight, headerColor, title) {
  const radius = 10;
  page.roundRect(x, top, w, headerHeight + bodyHeight, radius, { fill: WHITE });
  page.roundRect(x, top, w, headerHeight, radius, { fill: headerColor });
  page.rect(x, top + headerHeight - radius, w, radius, headerColor);
  // Shrink the title if it would run past the header bar.
  let size = 13.5;
  while (size > 8 && widthOf('Helvetica-Bold', title, size) > w - 32) size -= 0.25;
  page.text(title, x + 16, top + headerHeight - 14, {
    font: 'Helvetica-Bold', size, color: WHITE, tracking: 0.2,
  });
  return top + headerHeight;
}

// A checklist / disqualifier list. Returns the baseline after the last line.
function markerList(page, items, x, top, textWidth, opts) {
  const size = opts.size || 8;
  const leading = size * 1.28;
  const gap = opts.gap === undefined ? 4.5 : opts.gap;
  let y = top;
  for (const item of items) {
    if (opts.marker === 'cross') page.cross(x, y, size + 0.5, RED);
    else page.check(x, y, size + 0.5, opts.markerColor || AMBER);
    y = page.paragraph(item, x + 13, y, textWidth, {
      size, color: INK, leading, font: 'Helvetica',
    }) + gap;
  }
  return y;
}

/**
 * Render the flyer.
 * @param {object} opts
 * @param {string} opts.name  Affiliate's display name.
 * @param {string} opts.url   Their referral URL (also encoded in the QR).
 * @param {string} [opts.title] Line shown next to their name.
 * @returns {Buffer} PDF bytes
 */
function buildFlyer({ name, url, title = 'Capital Referral Partner' }) {
  if (!name || !url) throw new Error('buildFlyer needs a name and url');

  const doc = new Document(612, 792);
  const page = doc.page;
  doc.addImage('Logo', logo.width, logo.height, logo.data);

  const M = 40;                    // page margin
  const W = 612 - M * 2;           // content width (532)

  page.rect(0, 0, 612, 792, CREAM);

  // ---------- Header ----------
  page.rect(0, 0, 612, 152, FOREST);
  page.rect(0, 152, 612, 4, AMBER);

  page.text('REAL ESTATE INVESTOR FUNDING', M + 4, 44, {
    font: 'Helvetica-Bold', size: 10, color: AMBER, tracking: 1.4,
  });
  page.text('NEED CAPITAL FOR', M + 4, 82, { font: 'Helvetica-Bold', size: 28, color: WHITE });
  page.text('YOUR NEXT DEAL?', M + 4, 112, { font: 'Helvetica-Bold', size: 28, color: WHITE });
  page.text('FAST DEAL REVIEW. CLEAR ANSWERS. DIRECT INTRODUCTION.', M + 4, 136, {
    font: 'Helvetica-Bold', size: 10, color: AMBER, tracking: 0.4,
  });

  page.roundRect(480, 24, 92, 92, 12, { fill: WHITE });
  page.image('Logo', 488, 32, 76, 76);

  // ---------- Qualifier pills ----------
  {
    const top = 172;
    const height = 25;
    const tracking = 0.6;
    const sizes = PILLS.map(
      (p) => widthOf('Helvetica-Bold', p.label, 8.5) + tracking * (p.label.length - 1) + 34
    );
    const total = sizes.reduce((a, b) => a + b, 0);
    // Pills hug their text; the leftover width becomes the gaps between them,
    // so the row still spans the full content width.
    const gap = (W - total) / (PILLS.length - 1);
    let x = M;
    PILLS.forEach((pill, i) => {
      const w = sizes[i];
      const fill = pill.style === 'amber' ? AMBER : pill.style === 'forest' ? FOREST : CREAM;
      const stroke = pill.style === 'outline' ? AMBER : null;
      const color = pill.style === 'outline' ? INK : WHITE;
      page.roundRect(x, top, w, height, height / 2, { fill, stroke, lineWidth: 1.2 });
      page.text(pill.label, x, top + 16.5, {
        font: 'Helvetica-Bold', size: 8.5, color, align: 'center', width: w, tracking,
      });
      x += w + gap;
    });
  }

  // ---------- Product cards ----------
  {
    const top = 212;
    const height = 106;
    const gap = 12;
    const cardW = (W - gap * 3) / 4;
    PRODUCTS.forEach((product, i) => {
      const x = M + i * (cardW + gap);
      page.roundRect(x, top, cardW, height, 7, { fill: WHITE, stroke: BORDER, lineWidth: 0.8 });
      page.rect(x + 1, top + 1, cardW - 2, 4, AMBER);
      page.text(product.name, x, top + 32, {
        font: 'Helvetica-Bold', size: 12.5, color: INK, align: 'center', width: cardW,
      });
      page.text(product.lead, x, top + 58, {
        font: 'Helvetica-Bold', size: 10, color: INK, align: 'center', width: cardW,
      });
      product.lines.forEach((line, j) => {
        page.text(line, x, top + 78 + j * 16, {
          size: 8.5, color: MUTED, align: 'center', width: cardW,
        });
      });
    });
  }

  // ---------- Qualify / disqualify panels ----------
  const panelTop = 336;
  const panelHeaderH = 38;
  const panelBodyH = 214;

  // Left: does your deal qualify?
  {
    const x = M;
    const w = 336;
    const bodyTop = panel(page, x, panelTop, w, panelBodyH, panelHeaderH, FOREST_MID, 'DOES YOUR DEAL QUALIFY?');
    const colW = 150;
    const col1 = x + 14;
    const col2 = x + 14 + colW + 8;
    page.text('MUST-HAVES', col1, bodyTop + 20, {
      font: 'Helvetica-Bold', size: 9, color: AMBER, tracking: 0.6,
    });
    page.text('BORROWER READINESS', col2, bodyTop + 20, {
      font: 'Helvetica-Bold', size: 9, color: AMBER, tracking: 0.6,
    });
    markerList(page, MUST_HAVES, col1, bodyTop + 38, colW - 15, {});
    markerList(page, READINESS, col2, bodyTop + 38, colW - 15, {});

    // Cash & reserve rules callout, pinned to the bottom of the panel.
    const boxH = 46;
    const boxTop = panelTop + panelHeaderH + panelBodyH - boxH - 12;
    page.roundRect(x + 14, boxTop, w - 28, boxH, 5, { fill: AMBER_LIGHT });
    page.text('IMPORTANT CASH & RESERVE RULES', x + 24, boxTop + 15, {
      font: 'Helvetica-Bold', size: 8, color: AMBER, tracking: 0.5,
    });
    RESERVE_RULES.forEach((rule, i) => {
      page.text(rule, x + 24, boxTop + 28 + i * 11, { size: 7.8, color: INK });
    });
  }

  // Right: not a fit?
  {
    const x = M + 336 + 12;
    const w = W - 336 - 12;
    const bodyTop = panel(page, x, panelTop, w, panelBodyH, panelHeaderH, RED, 'NOT A FIT? DO NOT APPLY');
    page.text('AUTOMATIC DISQUALIFIERS', x + 14, bodyTop + 20, {
      font: 'Helvetica-Bold', size: 9, color: RED, tracking: 0.6,
    });
    markerList(page, DISQUALIFIERS, x + 14, bodyTop + 38, w - 43, { marker: 'cross', gap: 3.5 });

    const boxH = 46;
    const boxTop = panelTop + panelHeaderH + panelBodyH - boxH - 12;
    page.roundRect(x + 14, boxTop, w - 28, boxH, 5, { fill: RED_BG });
    page.text('OTHER RESTRICTIONS MAY APPLY', x + 22, boxTop + 15, {
      font: 'Helvetica-Bold', size: 8, color: RED, tracking: 0.5,
    });
    page.paragraph(
      'Certain property conditions and markets are ineligible. All deals are subject to lender and capital-source review.',
      x + 22, boxTop + 27, w - 44, { size: 7, color: INK, leading: 9 }
    );
  }

  // ---------- Call to action ----------
  {
    const top = 598;
    const height = 136;
    page.roundRect(M, top, W, height, 12, { fill: FOREST });

    // QR card — the white border doubles as the required quiet zone.
    const cardSize = 96;
    const cardX = M + W - cardSize - 16;
    const cardTop = top + 8;
    const textWidth = cardX - (M + 24) - 16; // keep copy clear of the QR card

    page.text('READY FOR A FAST DEAL REVIEW?', M + 24, top + 26, {
      font: 'Helvetica-Bold', size: 9, color: AMBER, tracking: 1,
    });
    page.text('SEND THE DEAL. GET A STRAIGHT ANSWER.', M + 24, top + 50, {
      font: 'Helvetica-Bold', size: 17, color: WHITE,
    });
    SEND_LINES.forEach((line, i) => {
      page.text(line, M + 24, top + 70 + i * 13, { size: 8.2, color: '#C8D6CC' });
    });

    // Affiliate identity + their unique link, each auto-fitted to the space left
    // of the QR card so a long name or slug can never collide with it.
    const identity = `${name}  |  ${title}`;
    let nameSize = 10.5;
    while (nameSize > 7 && widthOf('Helvetica-Bold', identity, nameSize) > textWidth) nameSize -= 0.25;
    page.text(identity, M + 24, top + 112, { font: 'Helvetica-Bold', size: nameSize, color: AMBER });

    let urlSize = 9.5;
    while (urlSize > 6.5 && widthOf('Helvetica', url, urlSize) > textWidth) urlSize -= 0.25;
    page.text(url, M + 24, top + 126, { size: urlSize, color: '#EAF1EC' });
    page.roundRect(cardX, cardTop, cardSize, cardSize, 8, { fill: WHITE });

    const matrix = qr.encode(url);
    const qrSize = 72;
    const module = qrSize / matrix.size;
    const qrX = cardX + (cardSize - qrSize) / 2;
    const qrTop = cardTop + (cardSize - qrSize) / 2;
    const cells = [];
    for (let r = 0; r < matrix.size; r++) {
      for (let c = 0; c < matrix.size; c++) {
        if (matrix.modules[r][c]) {
          cells.push([qrX + c * module, qrTop + r * module, module + 0.06, module + 0.06]);
        }
      }
    }
    page.rects(cells, FOREST);
    page.text('SCAN TO SUBMIT YOUR DEAL', cardX - 12, top + 122, {
      font: 'Helvetica-Bold', size: 7.5, color: AMBER, align: 'center', width: cardSize + 24,
    });
  }

  // ---------- Footer ----------
  {
    const text = DISCLAIMER.replace('{PARTNER}', name);
    page.paragraph(text, M, 752, W, { size: 6.2, color: '#7C8C81', leading: 8.6 });
    page.text(`Program guide dated ${PROGRAM_GUIDE_DATE}`, M, 782, {
      size: 6.2, color: AMBER, align: 'right', width: W,
    });
  }

  return doc.build();
}

module.exports = { buildFlyer, PROGRAM_GUIDE_DATE };
