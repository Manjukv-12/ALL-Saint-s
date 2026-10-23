/**
 * For each tracked file, show which Cursor history snapshot would be used at cutoff.
 * Flags files whose newest save before cutoff is BEFORE the start of that calendar day (IST).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const historyRoot = path.join(process.env.APPDATA, 'Cursor', 'User', 'History');

const until = process.argv[2] || '2026-10-09T23:59:59+05:30';
const dayStart = process.argv[3] || '2026-10-09T00:00:00+05:30';
const cutoff = new Date(until).getTime();
const dayStartMs = new Date(dayStart).getTime();

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
  return null;
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

function pickSnapshot(histDir, cutoffMs) {
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(path.join(histDir, 'entries.json'), 'utf8'));
  } catch {
    return null;
  }
  const entries = (meta.entries || []).filter((e) => e.timestamp <= cutoffMs);
  entries.sort((a, b) => a.timestamp - b.timestamp);
  for (let i = entries.length - 1; i >= 0; i--) {
    const sp = path.join(histDir, entries[i].id);
    if (!fs.existsSync(sp)) continue;
    const buf = fs.readFileSync(sp);
    if (buf.length < 20) continue;
    const text = buf.toString('utf8');
    if (/^eimport\b/.test(text)) continue;
    return { ts: entries[i].timestamp, id: entries[i].id, size: buf.length };
  }
  return null;
}

const byTarget = new Map();
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
  if (!rel || (!rel.includes('church-management') && !rel.startsWith('src\\modules'))) continue;
  const pick = pickSnapshot(histDir, cutoff);
  if (!pick) continue;
  const key = abs.toLowerCase();
  const prev = byTarget.get(key);
  if (!prev || pick.ts > prev.ts) byTarget.set(key, { rel, ...pick });
}

const onDay = [];
const older = [];
const noHist = [];
for (const { rel, ts, size } of byTarget.values()) {
  if (ts >= dayStartMs) onDay.push({ rel, ts, size });
  else older.push({ rel, ts, size });
}
onDay.sort((a, b) => a.rel.localeCompare(b.rel));
older.sort((a, b) => a.rel.localeCompare(b.rel));

console.log(`Cutoff: ${until}  |  Oct 9 IST day start: ${dayStart}\n`);
console.log(`On Oct 9 (saved that day): ${onDay.length} files`);
console.log(`Older snapshot used (no Oct 9 save): ${older.length} files\n`);
console.log('--- Older than Oct 9 (may look “missing” your Oct 9 edits) ---');
for (const f of older.slice(0, 60)) {
  console.log(`${new Date(f.ts).toISOString().slice(0, 16)}  ${f.rel}`);
}
if (older.length > 60) console.log(`... and ${older.length - 60} more`);
