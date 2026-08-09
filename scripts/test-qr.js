// Self-check for lib/qr.js. Run: node scripts/test-qr.js
// Verifies the Reed-Solomon maths, the BCH format bits, and that a matrix
// round-trips back to the original text through an independently written reader.
const path = require('path');
const qr = require(path.join(__dirname, '..', 'netlify', 'functions', 'lib', 'qr.js'));

let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
}

// --- 1. GF(256) tables round-trip ---
{
  let ok = true;
  for (let i = 1; i < 256; i++) if (qr.EXP[qr.LOG[i]] !== i) ok = false;
  check('GF(256) log/antilog tables round-trip', ok);
}

// --- 2. Reed-Solomon: the full codeword must be divisible by the generator,
//        i.e. it evaluates to zero at every root a^0..a^(n-1). ---
{
  const evalAt = (poly, x) => {
    let acc = 0;
    for (const coeff of poly) acc = qr.gmul(acc, x) ^ coeff;
    return acc;
  };
  let ok = true;
  for (const ecLen of [10, 16, 18, 22, 24, 26]) {
    const data = [];
    for (let i = 0; i < 40; i++) data.push((i * 37 + 11) & 0xff);
    const ecc = qr.rsEncode(data, ecLen);
    const codeword = data.concat(ecc);
    for (let i = 0; i < ecLen; i++) {
      if (evalAt(codeword, qr.EXP[i]) !== 0) ok = false;
    }
  }
  check('Reed-Solomon codewords vanish at every generator root', ok);
}

// --- 3. Known spec vector: data "01234567" at version 1-M produces the
//        published error-correction codewords. ---
{
  const data = [0x10, 0x20, 0x0c, 0x56, 0x61, 0x80, 0xec, 0x11,
                0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11];
  const expected = [0xa5, 0x24, 0xd4, 0xc1, 0xed, 0x36, 0xc7, 0x87, 0x2c, 0x55];
  const got = qr.rsEncode(data, 10);
  check('Spec vector "01234567" v1-M error-correction codewords',
    got.join(',') === expected.join(','), `got ${got.map((b) => b.toString(16)).join(' ')}`);
}

// --- 4. Structural checks + full read-back of the encoded text ---
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

// Level-M block layout, mirrored from the encoder so the reader can de-interleave.
const VERSIONS_M = {
  1: [10, 1, 16, 0, 0], 2: [16, 1, 28, 0, 0], 3: [26, 1, 44, 0, 0],
  4: [18, 2, 32, 0, 0], 5: [24, 2, 43, 0, 0], 6: [16, 4, 27, 0, 0],
  7: [18, 4, 31, 0, 0], 8: [22, 2, 38, 2, 39], 9: [22, 3, 36, 2, 37],
  10: [26, 4, 43, 1, 44],
};
const ALIGN_CENTERS = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
};

// Rebuild the "which modules are function patterns" map without reusing encoder code.
function functionMap(size, version) {
  const res = [];
  for (let r = 0; r < size; r++) res.push(new Array(size).fill(false));
  const mark = (r0, c0, r1, c1) => {
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (r >= 0 && r < size && c >= 0 && c < size) res[r][c] = true;
      }
    }
  };
  mark(0, 0, 8, 8);                      // top-left finder + separator + format
  mark(0, size - 8, 8, size - 1);        // top-right finder + format
  mark(size - 8, 0, size - 1, 8);        // bottom-left finder + format
  for (let i = 0; i < size; i++) { res[6][i] = true; res[i][6] = true; } // timing
  const centers = ALIGN_CENTERS[version];
  const last = centers.length - 1;
  for (let i = 0; i < centers.length; i++) {
    for (let j = 0; j < centers.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) continue;
      mark(centers[i] - 2, centers[j] - 2, centers[i] + 2, centers[j] + 2);
    }
  }
  if (version >= 7) {
    mark(size - 11, 0, size - 9, 5);
    mark(0, size - 11, 5, size - 9);
  }
  return res;
}

function readBack(result) {
  const { size, version, mask, modules } = result;
  const fn = functionMap(size, version);
  const maskFn = MASK_FNS[mask];
  const bits = [];
  let upward = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right = 5;
    for (let step = 0; step < size; step++) {
      const row = upward ? size - 1 - step : step;
      for (let c = 0; c < 2; c++) {
        const col = right - c;
        if (fn[row][col]) continue;
        let v = modules[row][col];
        if (maskFn(row, col)) v = !v;
        bits.push(v ? 1 : 0);
      }
    }
    upward = !upward;
  }
  const stream = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    stream.push(byte);
  }

  // De-interleave the data codewords back into their blocks.
  const [, g1, g1cw, g2, g2cw] = VERSIONS_M[version];
  const blocks = [];
  for (let i = 0; i < g1; i++) blocks.push([]);
  for (let i = 0; i < g2; i++) blocks.push([]);
  const maxData = Math.max(g1cw, g2cw);
  let idx = 0;
  for (let i = 0; i < maxData; i++) {
    for (let b = 0; b < blocks.length; b++) {
      const size_b = b < g1 ? g1cw : g2cw;
      if (i < size_b) blocks[b].push(stream[idx++]);
    }
  }
  const data = [].concat(...blocks);

  // Parse: 4 mode bits + character count + payload.
  const dataBits = [];
  for (const byte of data) for (let j = 7; j >= 0; j--) dataBits.push((byte >>> j) & 1);
  const take = (n, off) => {
    let v = 0;
    for (let i = 0; i < n; i++) v = (v << 1) | dataBits[off + i];
    return v;
  };
  const mode = take(4, 0);
  const countBits = version < 10 ? 8 : 16;
  const len = take(countBits, 4);
  const bytes = [];
  for (let i = 0; i < len; i++) bytes.push(take(8, 4 + countBits + i * 8));
  return { mode, text: Buffer.from(bytes).toString('utf8') };
}

{
  const samples = [
    'https://sgcapital.io/?ref=duc-nguyen',
    'https://sgcapital.io/?ref=a',
    'https://sgcapital.io/?ref=christopher-vandermeer-iii',
    'https://sgcapital.io/?ref=' + 'x'.repeat(120),
  ];
  let ok = true;
  const info = [];
  for (const s of samples) {
    const res = qr.encode(s);
    const back = readBack(res);
    if (back.mode !== 4 || back.text !== s) {
      ok = false;
      console.log('   mismatch:', JSON.stringify(back.text), 'expected', JSON.stringify(s));
    }
    info.push(`v${res.version}/mask${res.mask}`);
    // Finder patterns must be intact in all three corners.
    const dark = (r, c) => res.modules[r][c];
    for (const [r0, c0] of [[0, 0], [0, res.size - 7], [res.size - 7, 0]]) {
      if (!dark(r0, c0) || !dark(r0 + 3, c0 + 3) || dark(r0 + 1, c0 + 1)) ok = false;
    }
    // Timing patterns must alternate.
    for (let i = 8; i < res.size - 8; i++) {
      if (res.modules[6][i] !== (i % 2 === 0)) ok = false;
      if (res.modules[i][6] !== (i % 2 === 0)) ok = false;
    }
    // Dark module.
    if (!res.modules[res.size - 8][8]) ok = false;
  }
  check('Matrix reads back to the original text (4 samples)', ok, info.join(' '));
}

// --- 5. Format information: both copies must agree and match the published
//        level-M strings from the standard's table. ---
{
  const TABLE_M = {
    0: '101010000010010', 1: '101000100100101', 2: '101111001111100', 3: '101101101001011',
    4: '100010111111001', 5: '100000011001110', 6: '100111110010111', 7: '100101010100000',
  };
  let ok = true;
  const seen = [];
  for (const s of ['https://sgcapital.io/?ref=duc-nguyen', 'https://sgcapital.io/?ref=a',
                   'https://sgcapital.io/?ref=jane-q-public', 'https://sgcapital.io/?ref=' + 'x'.repeat(90)]) {
    const res = qr.encode(s);
    const m = res.modules;
    const n = res.size;
    const copy1 = [];
    const copy2 = [];
    for (let i = 0; i < 15; i++) {
      copy1.push(i < 6 ? m[i][8] : i < 8 ? m[i + 1][8] : i === 8 ? m[8][7] : m[8][14 - i]);
      copy2.push(i < 8 ? m[8][n - 1 - i] : m[n - 15 + i][8]);
    }
    // Bit 0 is the least significant, so print most-significant-first.
    const str1 = copy1.map((b) => (b ? '1' : '0')).reverse().join('');
    const str2 = copy2.map((b) => (b ? '1' : '0')).reverse().join('');
    if (str1 !== TABLE_M[res.mask] || str2 !== TABLE_M[res.mask]) {
      ok = false;
      console.log(`   mask ${res.mask}: copy1=${str1} copy2=${str2} expected=${TABLE_M[res.mask]}`);
    }
    seen.push(`mask${res.mask}`);
  }
  check('Format-info bits match the standard level-M table in both copies', ok, seen.join(' '));
}

// --- 6. Print one matrix so the structure can be eyeballed ---
{
  const res = qr.encode('https://sgcapital.io/?ref=duc-nguyen');
  console.log(`\nversion ${res.version}, size ${res.size}, mask ${res.mask}`);
  const pad = '  ';
  console.log(pad + '██'.repeat(res.size + 4));
  console.log(pad + '██' + '  '.repeat(res.size + 2) + '██');
  for (let r = 0; r < res.size; r++) {
    let line = pad + '██  ';
    for (let c = 0; c < res.size; c++) line += res.modules[r][c] ? '  ' : '██';
    console.log(line + '  ██');
  }
  console.log(pad + '██' + '  '.repeat(res.size + 2) + '██');
  console.log(pad + '██'.repeat(res.size + 4));
}

console.log(failures === 0 ? '\nAll QR checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
