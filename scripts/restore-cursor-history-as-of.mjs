/**
 * Restore source files from Cursor Local History as they were on or before a cutoff date.
 *
 * Usage:
 *   node scripts/restore-cursor-history-as-of.mjs --until 2026-09-09T23:59:59+05:30
 *   node scripts/restore-cursor-history-as-of.mjs --until 2026-10-09T23:59:59+05:30 --dry-run
 *   node scripts/restore-cursor-history-as-of.mjs --until 2026-09-09T23:59:59+05:30 --out ../ALL-Saint-s-snapshot
 *
 * Default --out: overwrite files in ALL-Saint-s and ../backend-php (after copying to --backup).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const backendRoot = path.resolve(repoRoot, '..', 'backend-php');
const historyRoot = path.join(
  process.env.APPDATA || '',
  'Cursor',
  'User',
  'History'
);

function parseArgs() {
  const args = process.argv.slice(2);
  let until = '';
  let dryRun = false;
  let outRoot = null;
  let backup = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--until' && args[i + 1]) until = args[++i];
    else if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--out' && args[i + 1]) outRoot = path.resolve(args[++i]);
    else if (args[i] === '--backup' && args[i + 1]) backup = path.resolve(args[++i]);
  }
  if (!until) {
    console.error('Required: --until ISO datetime, e.g. 2026-09-09T23:59:59+05:30');
    process.exit(1);
  }
  const cutoff = new Date(until).getTime();
  if (Number.isNaN(cutoff)) {
    console.error('Invalid --until date:', until);
    process.exit(1);
  }
  return { cutoff, dryRun, outRoot, backup };
}

function decodeResource(resource) {
  if (!resource.startsWith('file:///')) return null;
  let p = decodeURIComponent(resource.replace('file:///', ''));
  if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(p)) p = p.slice(1);
  return path.normalize(p);
}

function mapTarget(absPath, outRoot) {
  const lower = absPath.toLowerCase();
  if (lower.includes('all-saint-s')) {
    const rel = absPath.slice(lower.indexOf('all-saint-s') + 'all-saint-s'.length).replace(/^[/\\]+/, '');
    return path.join(outRoot ?? repoRoot, rel);
  }
  if (lower.includes('backend-php')) {
    const rel = absPath.slice(lower.indexOf('backend-php') + 'backend-php'.length).replace(/^[/\\]+/, '');
    return path.join(outRoot ?? backendRoot, rel);
  }
  return null;
}

function collectHistoryDirs(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    try {
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        const entriesFile = path.join(full, 'entries.json');
        if (fs.existsSync(entriesFile)) out.push(full);
        else collectHistoryDirs(full, out);
      }
    } catch {
      /* skip */
    }
  }
  return out;
}

const { cutoff, dryRun, outRoot, backup } = parseArgs();

if (backup && !dryRun) {
  const stamp = new Date(cutoff).toISOString().replace(/[:.]/g, '-');
  const dest = backup.includes('{stamp}') ? backup.replace('{stamp}', stamp) : backup;
  console.log('Backup current tree to', dest, '(manual step — run robocopy if needed)');
}

const dirs = collectHistoryDirs(historyRoot);
let restored = 0;
let skipped = 0;
const seen = new Set();

for (const histDir of dirs) {
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(path.join(histDir, 'entries.json'), 'utf8'));
  } catch {
    continue;
  }
  const resource = decodeResource(meta.resource);
  if (!resource) continue;
  const target = mapTarget(resource, outRoot);
  if (!target) continue;
  if (!target.startsWith(repoRoot) && !target.startsWith(backendRoot) && !outRoot) continue;
  if (target.toLowerCase().includes(`${path.sep}.env`) || target.toLowerCase().endsWith('.env')) {
    skipped++;
    continue;
  }

  const key = target.toLowerCase();
  if (seen.has(key)) continue;

  const entries = (meta.entries || []).filter((e) => e.timestamp <= cutoff);
  if (entries.length === 0) {
    skipped++;
    continue;
  }
  entries.sort((a, b) => a.timestamp - b.timestamp);
  /** Latest save before cutoff that is not empty/corrupt (0-byte saves also get stored in history). */
  let pick = null;
  let snapPath = null;
  let content = null;
  for (let i = entries.length - 1; i >= 0; i--) {
    const candidate = entries[i];
    const sp = path.join(histDir, candidate.id);
    if (!fs.existsSync(sp)) continue;
    const buf = fs.readFileSync(sp);
    if (buf.length < 20) continue;
    const text = buf.toString('utf8');
    if (/^eimport\b/.test(text) || /^\s*$/.test(text)) continue;
    pick = candidate;
    snapPath = sp;
    content = buf;
    break;
  }
  if (!pick || !content) {
    skipped++;
    continue;
  }

  seen.add(key);
  if (dryRun) {
    console.log('[dry-run]', path.relative(repoRoot, target).replace(/\.\./g, '..'), '←', pick.id, new Date(pick.timestamp).toISOString());
  } else {
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
      console.log('restored:', path.relative(repoRoot, target).replace(/\.\./g, '..'), new Date(pick.timestamp).toISOString());
    } catch (err) {
      console.error('FAILED:', path.relative(repoRoot, target).replace(/\.\./g, '..'), err.message);
      skipped++;
      seen.delete(key);
      continue;
    }
  }
  restored++;
}

console.log(`\nDone. ${restored} files from Cursor history (cutoff ${new Date(cutoff).toISOString()}), ${skipped} skipped (no snapshot before cutoff).`);
