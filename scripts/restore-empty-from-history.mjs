import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve('scripts/..');
const historyRoot = path.join(process.env.APPDATA, 'Cursor', 'User', 'History');

function decodeResource(resource) {
  if (!resource.startsWith('file:///')) return null;
  let p = decodeURIComponent(resource.replace('file:///', ''));
  if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(p)) p = p.slice(1);
  return path.normalize(p);
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

function walkEmptyFiles(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, ent.name);
    if (ent.isDirectory()) walkEmptyFiles(f, out);
    else if (/\.(tsx?|jsx?|php)$/i.test(ent.name) && fs.statSync(f).size === 0) out.push(f);
  }
  return out;
}

const empty = [];
for (const root of [path.join(repoRoot, 'src'), path.join(repoRoot, '..', 'backend-php')]) {
  if (fs.existsSync(root)) walkEmptyFiles(root, empty);
}

const byResource = new Map();
for (const histDir of collectHistoryDirs(historyRoot)) {
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(path.join(histDir, 'entries.json'), 'utf8'));
  } catch {
    continue;
  }
  const abs = decodeResource(meta.resource);
  if (!abs) continue;
  byResource.set(abs.toLowerCase(), histDir);
}

let fixed = 0;
for (const target of empty) {
  const histDir = byResource.get(target.toLowerCase());
  if (!histDir) {
    console.log('no history:', target);
    continue;
  }
  const meta = JSON.parse(fs.readFileSync(path.join(histDir, 'entries.json'), 'utf8'));
  let best = null;
  for (const ent of meta.entries || []) {
    const snap = path.join(histDir, ent.id);
    if (!fs.existsSync(snap)) continue;
    const len = fs.statSync(snap).size;
    if (len < 20) continue;
    if (!best || len > best.len) best = { id: ent.id, len, ts: ent.timestamp };
  }
  if (!best) {
    console.log('no non-empty snapshot:', target);
    continue;
  }
  fs.copyFileSync(path.join(histDir, best.id), target);
  console.log('fixed:', path.relative(repoRoot, target), best.len, 'bytes');
  fixed++;
}
console.log(`\nFixed ${fixed} / ${empty.length} empty files.`);
