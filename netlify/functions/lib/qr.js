// Minimal QR Code encoder — byte mode, error-correction level M, versions 1-10.
// Written from the spec rather than pulled from npm so it works in this
// dependency-free Netlify setup (same reasoning as lib/supabase.js).
// Capacity at version 10 is 213 bytes, far more than an affiliate URL needs.

// ---------- GF(256) arithmetic (primitive polynomial 0x11D) ----------
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(function buildTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

function gmul(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

// Generator polynomial for `n` error-correction codewords: (x-a^0)...(x-a^(n-1)).
// Returned highest-degree-first.
function rsGenPoly(n) {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      next[j] ^= g[j];
      next[j + 1] ^= gmul(g[j], EXP[i]);
    }
    g = next;
  }
  return g;
}

// Reed-Solomon remainder of `data` divided by the generator polynomial.
function rsEncode(data, ecLen) {
  const gen = rsGenPoly(ecLen);
  const res = new Array(ecLen).fill(0);
  for (let d = 0; d < data.length; d++) {
    const factor = data[d] ^ res[0];
    res.shift();
    res.push(0);
    if (factor !== 0) {
      for (let i = 0; i < ecLen; i++) res[i] ^= gmul(gen[i + 1], factor);
    }
  }
  return res;
}

// ---------- Version tables (error-correction level M only) ----------
// [ total codewords, ec codewords per block, group1 blocks, group1 data cw,
//   group2 blocks, group2 data cw ]
const VERSIONS_M = {
  1:  [26,  10, 1, 16, 0, 0],
  2:  [44,  16, 1, 28, 0, 0],
  3:  [70,  26, 1, 44, 0, 0],
  4:  [100, 18, 2, 32, 0, 0],
  5:  [134, 24, 2, 43, 0, 0],
  6:  [172, 16, 4, 27, 0, 0],
  7:  [196, 18, 4, 31, 0, 0],
  8:  [242, 22, 2, 38, 2, 39],
  9:  [292, 22, 3, 36, 2, 37],
  10: [346, 26, 4, 43, 1, 44],
};

// Row/column centres of the alignment patterns, by version.
const ALIGN_CENTERS = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
};

function dataCapacity(version) {
  const [total, ecPerBlock, g1, g1cw, g2, g2cw] = VERSIONS_M[version];
  const data = g1 * g1cw + g2 * g2cw;
  if (data + (g1 + g2) * ecPerBlock !== total) {
    throw new Error(`QR version table inconsistent at version ${version}`);
  }
  return data;
}

// Bytes of payload that fit, after the 4 mode bits and the character count.
function byteCapacity(version) {
  const countBits = version < 10 ? 8 : 16;
  return dataCapacity(version) - Math.ceil((4 + countBits) / 8);
}

function pickVersion(byteLen) {
  for (let v = 1; v <= 10; v++) {
    if (byteLen <= byteCapacity(v)) return v;
  }
  throw new Error('QR payload too long for version 10');
}

// ---------- Bit buffer ----------
function bitBuffer() {
  const bits = [];
  return {
    bits,
    put(value, length) {
      for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
    },
  };
}

// ---------- Encoding ----------
function encodeData(text, version) {
  const bytes = Buffer.from(text, 'utf8');
  const countBits = version < 10 ? 8 : 16;
  const buf = bitBuffer();
  buf.put(0b0100, 4);            // byte mode
  buf.put(bytes.length, countBits);
  for (const b of bytes) buf.put(b, 8);

  const capacityBits = dataCapacity(version) * 8;
  if (buf.bits.length > capacityBits) throw new Error('QR payload overflows chosen version');

  // Terminator, then pad to a byte boundary, then alternating pad codewords.
  buf.put(0, Math.min(4, capacityBits - buf.bits.length));
  while (buf.bits.length % 8 !== 0) buf.bits.push(0);

  const codewords = [];
  for (let i = 0; i < buf.bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | buf.bits[i + j];
    codewords.push(byte);
  }
  const pads = [0xec, 0x11];
  let p = 0;
  while (codewords.length < dataCapacity(version)) codewords.push(pads[p++ % 2]);
  return codewords;
}

// Split into blocks, add error correction, then interleave as the spec requires.
function buildCodewords(text, version) {
  const [, ecPerBlock, g1, g1cw, g2, g2cw] = VERSIONS_M[version];
  const data = encodeData(text, version);

  const dataBlocks = [];
  const ecBlocks = [];
  let offset = 0;
  for (let i = 0; i < g1 + g2; i++) {
    const size = i < g1 ? g1cw : g2cw;
    const block = data.slice(offset, offset + size);
    offset += size;
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
  }

  const out = [];
  const maxData = Math.max(g1cw, g2cw);
  for (let i = 0; i < maxData; i++) {
    for (const block of dataBlocks) if (i < block.length) out.push(block[i]);
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const block of ecBlocks) out.push(block[i]);
  }
  return out;
}

// ---------- Format / version information ----------
function bchFormat(data) {
  let d = data << 10;
  for (let i = 14; i >= 10; i--) {
    if ((d >>> i) & 1) d ^= 0x537 << (i - 10);
  }
  return ((data << 10) | d) ^ 0x5412;
}

function bchVersion(version) {
  let d = version << 12;
  for (let i = 17; i >= 12; i--) {
    if ((d >>> i) & 1) d ^= 0x1f25 << (i - 12);
  }
  return (version << 12) | d;
}

// ---------- Matrix construction ----------
function newMatrix(size) {
  const modules = [];
  const reserved = [];
  for (let r = 0; r < size; r++) {
    modules.push(new Array(size).fill(false));
    reserved.push(new Array(size).fill(false));
  }
  return { size, modules, reserved };
}

function placeFinder(m, row, col) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = row + r;
      const cc = col + c;
      if (rr < 0 || rr >= m.size || cc < 0 || cc >= m.size) continue;
      const inRing = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                     (c >= 0 && c <= 6 && (r === 0 || r === 6));
      const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      m.modules[rr][cc] = inRing || inCore;
      m.reserved[rr][cc] = true;
    }
  }
}

function placeAlignment(m, version) {
  const centers = ALIGN_CENTERS[version];
  const last = centers.length - 1;
  for (let i = 0; i < centers.length; i++) {
    for (let j = 0; j < centers.length; j++) {
      // Skip the three positions that collide with the finder patterns.
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) continue;
      const row = centers[i];
      const col = centers[j];
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const dark = Math.max(Math.abs(r), Math.abs(c)) !== 1;
          m.modules[row + r][col + c] = dark;
          m.reserved[row + r][col + c] = true;
        }
      }
    }
  }
}

function placeTiming(m) {
  for (let i = 8; i < m.size - 8; i++) {
    const dark = i % 2 === 0;
    if (!m.reserved[6][i]) { m.modules[6][i] = dark; m.reserved[6][i] = true; }
    if (!m.reserved[i][6]) { m.modules[i][6] = dark; m.reserved[i][6] = true; }
  }
}

function reserveFormatAreas(m, version) {
  for (let i = 0; i < 9; i++) {
    if (!m.reserved[8][i]) m.reserved[8][i] = true;
    if (!m.reserved[i][8]) m.reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    m.reserved[8][m.size - 1 - i] = true;
    m.reserved[m.size - 1 - i][8] = true;
  }
  // Dark module — always set, always reserved.
  m.modules[m.size - 8][8] = true;
  m.reserved[m.size - 8][8] = true;

  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        m.reserved[m.size - 11 + j][i] = true;
        m.reserved[i][m.size - 11 + j] = true;
      }
    }
  }
}

function placeVersionInfo(m, version) {
  if (version < 7) return;
  const bits = bchVersion(version);
  for (let i = 0; i < 18; i++) {
    const bit = ((bits >>> i) & 1) === 1;
    const row = Math.floor(i / 3);
    const col = i % 3;
    m.modules[m.size - 11 + col][row] = bit;
    m.modules[row][m.size - 11 + col] = bit;
  }
}

function placeFormatInfo(m, mask) {
  const bits = bchFormat((0b00 << 3) | mask); // 00 = error-correction level M
  for (let i = 0; i < 15; i++) {
    const bit = ((bits >>> i) & 1) === 1;
    // Copy 1 — down column 8, then left along row 8, around the top-left finder.
    if (i < 6)        m.modules[i][8] = bit;
    else if (i < 8)   m.modules[i + 1][8] = bit;
    else if (i === 8) m.modules[8][7] = bit;
    else              m.modules[8][14 - i] = bit;
    // Copy 2 — right along row 8 (top-right finder), then up column 8 (bottom-left).
    if (i < 8) m.modules[8][m.size - 1 - i] = bit;
    else       m.modules[m.size - 15 + i][8] = bit;
  }
  // The dark module sits inside copy 2's column and is always set.
  m.modules[m.size - 8][8] = true;
}

// Walk the zigzag from the bottom-right corner, skipping the vertical timing column.
function placeData(m, codewords) {
  let bitIndex = 0;
  let upward = true;
  for (let right = m.size - 1; right > 0; right -= 2) {
    if (right === 6) right = 5; // column 6 is the timing pattern
    for (let step = 0; step < m.size; step++) {
      const row = upward ? m.size - 1 - step : step;
      for (let c = 0; c < 2; c++) {
        const col = right - c;
        if (m.reserved[row][col]) continue;
        const byte = codewords[bitIndex >> 3];
        const bit = byte === undefined ? 0 : (byte >>> (7 - (bitIndex & 7))) & 1;
        m.modules[row][col] = bit === 1;
        bitIndex++;
      }
    }
    upward = !upward;
  }
}

const MASK_FNS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function applyMask(m, mask) {
  const fn = MASK_FNS[mask];
  for (let r = 0; r < m.size; r++) {
    for (let c = 0; c < m.size; c++) {
      if (!m.reserved[r][c] && fn(r, c)) m.modules[r][c] = !m.modules[r][c];
    }
  }
}

function penalty(m) {
  const n = m.size;
  const at = (r, c) => m.modules[r][c];
  let score = 0;

  // Rule 1 — runs of five or more same-coloured modules.
  for (let r = 0; r < n; r++) {
    let runRow = 1, runCol = 1;
    for (let c = 1; c < n; c++) {
      runRow = at(r, c) === at(r, c - 1) ? runRow + 1 : 1;
      if (runRow === 5) score += 3; else if (runRow > 5) score += 1;
      runCol = at(c, r) === at(c - 1, r) ? runCol + 1 : 1;
      if (runCol === 5) score += 3; else if (runCol > 5) score += 1;
    }
  }

  // Rule 2 — 2x2 blocks of one colour.
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      const v = at(r, c);
      if (v === at(r, c + 1) && v === at(r + 1, c) && v === at(r + 1, c + 1)) score += 3;
    }
  }

  // Rule 3 — finder-like 1:1:3:1:1 patterns with four light modules on one side.
  const p1 = [true, false, true, true, true, false, true, false, false, false, false];
  const p2 = [false, false, false, false, true, false, true, true, true, false, true];
  const matches = (get, i) => {
    let a = true, b = true;
    for (let k = 0; k < 11; k++) {
      if (get(i + k) !== p1[k]) a = false;
      if (get(i + k) !== p2[k]) b = false;
    }
    return a || b;
  };
  for (let r = 0; r < n; r++) {
    for (let c = 0; c + 11 <= n; c++) {
      if (matches((i) => at(r, i), c)) score += 40;
      if (matches((i) => at(i, r), c)) score += 40;
    }
  }

  // Rule 4 — deviation from a 50/50 dark ratio.
  let dark = 0;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (at(r, c)) dark++;
  const percent = (dark * 100) / (n * n);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;
  return score;
}

/**
 * Encode `text` as a QR matrix.
 * Returns { size, modules } where modules[row][col] is true for a dark module.
 */
function encode(text) {
  const version = pickVersion(Buffer.byteLength(text, 'utf8'));
  const codewords = buildCodewords(text, version);
  const size = version * 4 + 17;

  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    const m = newMatrix(size);
    placeFinder(m, 0, 0);
    placeFinder(m, 0, size - 7);
    placeFinder(m, size - 7, 0);
    placeAlignment(m, version);
    placeTiming(m);
    reserveFormatAreas(m, version);
    placeData(m, codewords);
    applyMask(m, mask);
    placeFormatInfo(m, mask);
    placeVersionInfo(m, version);
    const score = penalty(m);
    if (!best || score < best.score) best = { score, matrix: m, mask };
  }

  return { size, version, mask: best.mask, modules: best.matrix.modules };
}

module.exports = { encode, rsEncode, rsGenPoly, gmul, EXP, LOG, byteCapacity };
