/**
 * List files whose Cursor history had a save between two dates (inclusive end).
 * Usage: node scripts/list-history-changes-between.mjs --from 2026-10-10T00:00:00+05:30 --until 2026-10-17T23:59:59+05:30
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const historyRoot = path.join(process.env.APPDATA, 'Cursor', 'User', 'History');

function parseArgs() {
  let from = '';
  let until = '';
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--from' && process.argv[i + 1]) from = process.argv[++i];
    if (process.argv[i] === '--until' && process.argv[i + 1]) until = process.argv[++i];
  }
  if (!from || !until) {
    console.error('Need --from and --until ISO datetimes');
    process.exit(1);
  }
  return { fromMs: new Date(from).getTime(), untilMs: new Date(until).getTime(), from, until };
}

function decodeResource(resource) {
  if (!resource?.startsWith('file:///')) return null;
  let p = decodeURIComponent(resource.replace('file:///', ''));
  if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(p)) p = p.slice(1);
  return path.normalize(p);
}

function relDisplay(abs) {
  const lower = abs.toLowerCase();
  if (lower.includes('all-saint-s')) {
    return abs.slice(lower.indexOf('all-saint-s') + 'all-saint-s'.length).replace(/^[/\\]+/, '');
  }
  if (lower.includes('backend-php')) {
    return '../backend-php/' + abs.slice(lower.indexOf('backend-php') + 'backend-php'.length).replace(/^[/\\]+/, '');
  }
  return abs;
}

function collectHistoryDirs(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    try {
      if (fs.statSync(full).isDirectory()) {
        if (fs.existsSync(path.join(full, 'entries.json'))) out.push(full);
        else collectHistoryDirs(full, out);
      }
    } catch {
      /* skip */
    }
  }
  return out;
}

const { fromMs, untilMs, from, until } = parseArgs();
const changes = [];

for (const histDir of collectHistoryDirs(historyRoot)) {
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(path.join(histDir, 'entries.json'), 'utf8'));
  } catch {
    continue;
  }
  const abs = decodeResource(meta.resource);
  if (!abs) continue;
  const rel = relDisplay(abs);
  if (!rel.includes('church-management') && !rel.includes('backend-php') && !rel.startsWith('src\\')) continue;

  const inRange = (meta.entries || []).filter(
    (e) => e.timestamp >= fromMs && e.timestamp <= untilMs
  );
  if (inRange.length === 0) continue;

  inRange.sort((a, b) => b.timestamp - a.timestamp);
  const latest = inRange[0];
  changes.push({
    rel,
    saves: inRange.length,
    last: new Date(latest.timestamp).toISOString(),
  });
}

changes.sort((a, b) => a.rel.localeCompare(b.rel));
console.log(`Saves between ${from} and ${until}: ${changes.length} files\n`);
for (const c of changes) {
  console.log(`${c.last.slice(0, 10)}  (${c.saves} save(s))  ${c.rel}`);
}
