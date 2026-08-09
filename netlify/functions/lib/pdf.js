// Minimal PDF writer — enough to lay out a one-page marketing flyer.
// No npm dependency (see lib/supabase.js for the same reasoning); it uses the
// PDF standard-14 fonts, so nothing has to be embedded except artwork.
const zlib = require('zlib');

// Advance widths (1/1000 em) for the standard-14 fonts, codes 32-126.
const WIDTHS = {
  Helvetica: [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
  ],
  'Helvetica-Bold': [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
    975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
    333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
    611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
  ],
};

// The two ZapfDingbats glyphs used for the qualify / disqualify lists.
const DINGBAT_CHECK = '4'; // heavy check mark
const DINGBAT_CROSS = '6'; // heavy ballot X
const DINGBAT_WIDTH = 788;

// Characters that live at different code points in WinAnsi than in Unicode.
const WINANSI_REMAP = {
  '‘': '\x91', '’': '\x92', '“': '\x93', '”': '\x94',
  '–': '\x96', '—': '\x97', '…': '\x85', '•': '\x95',
  '‹': '\x8B', '›': '\x9B', '‚': '\x82', '„': '\x84',
  '™': '\x99', '€': '\x80', 'Š': '\x8A', 'š': '\x9A',
  'Ž': '\x8E', 'ž': '\x9E', 'Œ': '\x8C', 'œ': '\x9C',
  'Ÿ': '\x9F', 'ƒ': '\x83', 'ˆ': '\x88', '˜': '\x98',
  ' ': ' ',
};

/**
 * Fold a JS string into the single-byte WinAnsi range the standard-14 fonts
 * use. Anything that has no WinAnsi equivalent (CJK, emoji) is dropped rather
 * than written as a wrong glyph.
 */
function toWinAnsi(text) {
  let out = '';
  for (const ch of String(text)) {
    if (WINANSI_REMAP[ch]) { out += WINANSI_REMAP[ch]; continue; }
    const code = ch.codePointAt(0);
    if (code === 9) { out += ' '; continue; }
    if (code >= 32 && code <= 255) out += ch;
  }
  return out;
}

function widthOf(font, text, size) {
  const str = toWinAnsi(text);
  if (font === 'ZapfDingbats') return (DINGBAT_WIDTH / 1000) * size * str.length;
  const table = WIDTHS[font] || WIDTHS.Helvetica;
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 32 && code <= 126) total += table[code - 32];
    // Accented Latin letters are close enough to their unaccented base for
    // the centring and auto-fit maths that use these widths.
    else if (code >= 0xc0 && code <= 0xdf) total += table[33]; // 'A'
    else if (code >= 0xe0) total += table[79];                 // 'o'
    else total += table[0];
  }
  return (total / 1000) * size;
}

function esc(text) {
  return toWinAnsi(text).replace(/[\\()]/g, (c) => '\\' + c);
}

function hex(color) {
  const c = color.replace('#', '');
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ];
}

function num(n) {
  return Math.round(n * 100) / 100;
}

class Page {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.ops = [];
    this.images = new Map(); // name -> { width, height, data }
  }

  // All layout below works in top-left coordinates; PDF wants bottom-left.
  y(top) {
    return this.height - top;
  }

  fill(color) {
    const [r, g, b] = hex(color);
    this.ops.push(`${num(r)} ${num(g)} ${num(b)} rg`);
    return this;
  }

  stroke(color) {
    const [r, g, b] = hex(color);
    this.ops.push(`${num(r)} ${num(g)} ${num(b)} RG`);
    return this;
  }

  rect(x, top, w, h, color) {
    if (color) this.fill(color);
    this.ops.push(`${num(x)} ${num(this.y(top + h))} ${num(w)} ${num(h)} re f`);
    return this;
  }

  roundRect(x, top, w, h, radius, opts = {}) {
    const r = Math.min(radius, w / 2, h / 2);
    const k = 0.5523 * r;
    const y0 = this.y(top + h); // bottom
    const y1 = this.y(top);     // top
    const x0 = x;
    const x1 = x + w;
    const p = [];
    p.push(`${num(x0 + r)} ${num(y0)} m`);
    p.push(`${num(x1 - r)} ${num(y0)} l`);
    p.push(`${num(x1 - r + k)} ${num(y0)} ${num(x1)} ${num(y0 + r - k)} ${num(x1)} ${num(y0 + r)} c`);
    p.push(`${num(x1)} ${num(y1 - r)} l`);
    p.push(`${num(x1)} ${num(y1 - r + k)} ${num(x1 - r + k)} ${num(y1)} ${num(x1 - r)} ${num(y1)} c`);
    p.push(`${num(x0 + r)} ${num(y1)} l`);
    p.push(`${num(x0 + r - k)} ${num(y1)} ${num(x0)} ${num(y1 - r + k)} ${num(x0)} ${num(y1 - r)} c`);
    p.push(`${num(x0)} ${num(y0 + r)} l`);
    p.push(`${num(x0)} ${num(y0 + r - k)} ${num(x0 + r - k)} ${num(y0)} ${num(x0 + r)} ${num(y0)} c`);
    p.push('h');
    if (opts.fill) this.fill(opts.fill);
    if (opts.stroke) {
      this.stroke(opts.stroke);
      this.ops.push(`${num(opts.lineWidth || 1)} w`);
    }
    this.ops.push(p.join(' '));
    this.ops.push(opts.fill && opts.stroke ? 'B' : opts.stroke ? 'S' : 'f');
    return this;
  }

  /**
   * Draw a line of text. `top` is the distance from the page top to the text
   * baseline. Options: font, size, color, align ('left'|'center'|'right'),
   * width (for align), tracking (letter spacing in points).
   */
  text(str, x, top, opts = {}) {
    const font = opts.font || 'Helvetica';
    const size = opts.size || 10;
    const tracking = opts.tracking || 0;
    const content = String(str);
    let drawX = x;
    if (opts.align && opts.width) {
      const w = widthOf(font, content, size) + tracking * Math.max(0, content.length - 1);
      if (opts.align === 'center') drawX = x + (opts.width - w) / 2;
      else if (opts.align === 'right') drawX = x + opts.width - w;
    }
    this.fill(opts.color || '#000000');
    this.ops.push('BT');
    this.ops.push(`/${font.replace(/-/g, '')} ${num(size)} Tf`);
    if (tracking) this.ops.push(`${num(tracking)} Tc`);
    this.ops.push(`${num(drawX)} ${num(this.y(top))} Td`);
    this.ops.push(`(${esc(content)}) Tj`);
    if (tracking) this.ops.push('0 Tc');
    this.ops.push('ET');
    return this;
  }

  check(x, top, size, color) {
    return this.text(DINGBAT_CHECK, x, top, { font: 'ZapfDingbats', size, color });
  }

  cross(x, top, size, color) {
    return this.text(DINGBAT_CROSS, x, top, { font: 'ZapfDingbats', size, color });
  }

  /**
   * Word-wrap `str` into `maxWidth` and draw it. Returns the baseline `top`
   * that the next line after the paragraph would use.
   */
  paragraph(str, x, top, maxWidth, opts = {}) {
    const font = opts.font || 'Helvetica';
    const size = opts.size || 10;
    const leading = opts.leading || size * 1.35;
    const words = String(str).split(/\s+/).filter(Boolean);
    let line = '';
    let y = top;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (widthOf(font, candidate, size) > maxWidth && line) {
        this.text(line, x, y, opts);
        line = word;
        y += leading;
      } else {
        line = candidate;
      }
    }
    if (line) {
      this.text(line, x, y, opts);
      y += leading;
    }
    return y;
  }

  /** Fill many rectangles in one path — used for QR modules. */
  rects(list, color) {
    if (!list.length) return this;
    this.fill(color);
    const path = list
      .map(([x, top, w, h]) => `${num(x)} ${num(this.y(top + h))} ${num(w)} ${num(h)} re`)
      .join(' ');
    this.ops.push(`${path} f`);
    return this;
  }

  line(x1, top1, x2, top2, color, width) {
    this.stroke(color);
    this.ops.push(`${num(width || 1)} w`);
    this.ops.push(`${num(x1)} ${num(this.y(top1))} m ${num(x2)} ${num(this.y(top2))} l S`);
    return this;
  }

  /** Place an RGB image (see addImage) with its top-left corner at (x, top). */
  image(name, x, top, w, h) {
    this.ops.push('q');
    this.ops.push(`${num(w)} 0 0 ${num(h)} ${num(x)} ${num(this.y(top + h))} cm`);
    this.ops.push(`/${name} Do`);
    this.ops.push('Q');
    return this;
  }
}

class Document {
  constructor(width = 612, height = 792) {
    this.page = new Page(width, height);
    this.imageDefs = new Map();
  }

  /**
   * Register an 8-bit RGB image. `data` is a zlib-deflated raw RGB buffer
   * (3 bytes per pixel, no alpha, no row filters).
   */
  addImage(name, width, height, deflatedRgb) {
    this.imageDefs.set(name, { width, height, data: deflatedRgb });
    return this;
  }

  build() {
    const objects = [];
    const add = (body) => {
      objects.push(body);
      return objects.length; // 1-based object number
    };

    const content = zlib.deflateSync(Buffer.from(this.page.ops.join('\n'), 'latin1'));

    const fontObjs = {};
    for (const [alias, base] of [
      ['Helvetica', 'Helvetica'],
      ['HelveticaBold', 'Helvetica-Bold'],
      ['ZapfDingbats', 'ZapfDingbats'],
    ]) {
      const encoding = base === 'ZapfDingbats' ? '' : ' /Encoding /WinAnsiEncoding';
      fontObjs[alias] = add(
        `<< /Type /Font /Subtype /Type1 /BaseFont /${base}${encoding} >>`
      );
    }

    const imageObjs = {};
    for (const [name, img] of this.imageDefs) {
      imageObjs[name] = add({
        dict:
          `<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} ` +
          `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${img.data.length} >>`,
        stream: img.data,
      });
    }

    const contentObj = add({
      dict: `<< /Filter /FlateDecode /Length ${content.length} >>`,
      stream: content,
    });

    const fontRes = Object.entries(fontObjs)
      .map(([alias, id]) => `/${alias} ${id} 0 R`)
      .join(' ');
    const xobjRes = Object.entries(imageObjs)
      .map(([name, id]) => `/${name} ${id} 0 R`)
      .join(' ');
    const resources =
      `<< /Font << ${fontRes} >>` +
      (xobjRes ? ` /XObject << ${xobjRes} >>` : '') +
      ' >>';

    const pagesId = objects.length + 2; // page object is next, then pages
    const pageObj = add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${this.page.width} ${this.page.height}] ` +
      `/Resources ${resources} /Contents ${contentObj} 0 R >>`
    );
    add(`<< /Type /Pages /Kids [${pageObj} 0 R] /Count 1 >>`);
    const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

    const chunks = [];
    let offset = 0;
    const push = (buf) => {
      const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'latin1');
      chunks.push(b);
      offset += b.length;
    };

    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const offsets = [];
    objects.forEach((body, i) => {
      offsets.push(offset);
      const id = i + 1;
      if (typeof body === 'string') {
        push(`${id} 0 obj\n${body}\nendobj\n`);
      } else {
        push(`${id} 0 obj\n${body.dict}\nstream\n`);
        push(body.stream);
        push('\nendstream\nendobj\n');
      }
    });

    const xrefOffset = offset;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const o of offsets) xref += `${String(o).padStart(10, '0')} 00000 n \n`;
    push(xref);
    push(
      `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n` +
      `startxref\n${xrefOffset}\n%%EOF\n`
    );

    return Buffer.concat(chunks);
  }
}

module.exports = { Document, Page, widthOf, hex };
