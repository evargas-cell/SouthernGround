// Renders scripts/seo/og-image.html to /og-image.png at 1200x630 using the
// locally installed Chrome in headless mode. No npm dependencies.
//
//   node scripts/seo/render-og.mjs
//
// Re-run after editing og-image.html, then commit the regenerated PNG.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const chrome = CANDIDATES.find(existsSync);
if (!chrome) {
  console.error('No Chrome/Edge binary found. Checked:\n  ' + CANDIDATES.join('\n  '));
  process.exit(1);
}

const src = pathToFileURL(join(HERE, 'og-image.html')).href;
const outDir = mkdtempSync(join(tmpdir(), 'sgc-og-'));
const out = join(outDir, 'og-image.png');

execFileSync(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    '--window-size=1200,630',
    '--virtual-time-budget=6000',
    '--allow-file-access-from-files',
    `--screenshot=${out}`,
    src,
  ],
  { stdio: 'inherit' }
);

if (!existsSync(out)) {
  console.error('Chrome produced no screenshot.');
  process.exit(1);
}

copyFileSync(out, resolve(ROOT, 'og-image.png'));
rmSync(outDir, { recursive: true, force: true });
console.log('Wrote og-image.png (1200x630)');
