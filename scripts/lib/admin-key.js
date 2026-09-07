// Resolves ADMIN_SEND_KEY for the blast trigger scripts.
//
// Every mode of the blast endpoints now requires the key — dry runs and test
// sends included — because a dry run returns the full affiliate roster and a
// test send emails from our own domain.
const fs = require('fs');
const path = require('path');

// Environment first, then the gitignored .env.local at the repo root.
function adminKey() {
  if (process.env.ADMIN_SEND_KEY) return process.env.ADMIN_SEND_KEY.trim();
  const envFile = path.join(__dirname, '..', '..', '.env.local');
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      if (/^\s*#/.test(line)) continue;
      const m = line.match(/^\s*ADMIN_SEND_KEY\s*=\s*(.+?)\s*$/);
      if (m) {
        const key = m[1].replace(/^["']|["']$/g, '');
        if (key && !/^PASTE_/.test(key)) return key;
      }
    }
  }
  return null;
}

// Same as adminKey(), but exits with usage help rather than returning null.
function requireAdminKey() {
  const key = adminKey();
  if (!key) {
    console.error('This command requires the admin key. Either:');
    console.error('  put ADMIN_SEND_KEY=xxxxx in .env.local (gitignored), or');
    console.error('  PowerShell:  $env:ADMIN_SEND_KEY = "xxxxx"');
    process.exit(1);
  }
  return key;
}

module.exports = { adminKey, requireAdminKey };
