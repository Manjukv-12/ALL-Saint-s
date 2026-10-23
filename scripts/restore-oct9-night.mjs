/**
 * Best-effort "Oct 9 2026 night" snapshot:
 * 1) Cursor Local History (last good save <= end of Oct 9 IST)
 * 2) Overlay agent Write calls from chats that contain "Oct 9, 2026" (same day work)
 * 3) Write manifest of per-file snapshot times
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const backendRoot = path.resolve(repoRoot, '..', 'backend-php');
const historyRoot = path.join(process.env.APPDATA, 'Cursor', 'User', 'History');
const transcriptsDir = path.join(
  process.env.USERPROFILE || '',
  '.cursor',
  'projects',
  'c-Users-edwin-CSI-ALL-Saint-s',
  'agent-transcripts'
);

const UNTIL = '2026-10-09T23:59:59+05:30';
const CHAT_MARKER = 'Oct 9, 2026';
const cutoff = new Date(UNTIL).getTime();

// --- Step 1: history (inline, same logic as restore-cursor-history-as-of.mjs) ---
function decodeResource(resource) {
  if (!resource?.startsWith('file:///')) return null;
  let p = decodeURIComponent(resource.replace('file:///', ''));
  if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(p)) p = p.slice(1);
  return path.normalize(p);
}

function mapTarget(absPath) {
  const lower = absPath.toLowerCase();
  if (lower.includes('all-saint-s')) {
    const rel = absPath.slice(lower.indexOf('all-saint-s') + 'all-saint-s'.length).replace(/^[/\\]+/, '');
    return path.join(repoRoot, rel);
  }
  if (lower.includes('backend-php')) {
    const rel = absPath.slice(lower.indexOf('backend-php') + 'backend-php'.length).replace(/^[/\\]+/, '');
    return path.join(backendRoot, rel);
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

const manifest = new Map();

for (const histDir of collectHistoryDirs(historyRoot)) {
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(path.join(histDir, 'entries.json'), 'utf8'));
  } catch {
    continue;
  }
  const resource = decodeResource(meta.resource);
  if (!resource) continue;
  const target = mapTarget(resource);
  if (!target) continue;
  if (target.toLowerCase().includes('.env')) continue;

  const entries = (meta.entries || []).filter((e) => e.timestamp <= cutoff);
  entries.sort((a, b) => a.timestamp - b.timestamp);
  let pick = null;
  let content = null;
  for (let i = entries.length - 1; i >= 0; i--) {
    const sp = path.join(histDir, entries[i].id);
    if (!fs.existsSync(sp)) continue;
    const buf = fs.readFileSync(sp);
    if (buf.length < 20) continue;
    const text = buf.toString('utf8');
    if (/^eimport\b/.test(text)) continue;
    pick = entries[i];
    content = buf;
    break;
  }
  if (!pick || !content) continue;

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  manifest.set(target.toLowerCase(), {
    source: 'cursor-history',
    at: new Date(pick.timestamp).toISOString(),
  });
}

console.log(`Step 1: Cursor history through ${UNTIL} → ${manifest.size} files`);

// --- Step 2: Oct 9 chat Writes only ---
function normalizeTarget(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return null;
  let p = rawPath.replace(/\//g, path.sep);
  const lower = p.toLowerCase();
  if (lower.includes('all-saint-s')) {
    const idx = lower.indexOf('all-saint-s');
    p = p.slice(idx + 'all-saint-s'.length).replace(/^[/\\]+/, '');
    return path.join(repoRoot, p);
  }
  if (lower.includes('backend-php')) {
    const idx = lower.indexOf('backend-php');
    p = p.slice(idx + 'backend-php'.length).replace(/^[/\\]+/, '');
    return path.join(backendRoot, p);
  }
  return null;
}

function collectJsonlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) collectJsonlFiles(full, out);
    else if (name.endsWith('.jsonl')) out.push(full);
  }
  return out;
}

const oct9Jsonl = collectJsonlFiles(transcriptsDir).filter((f) => {
  const head = fs.readFileSync(f, 'utf8').slice(0, 500_000);
  return head.includes(CHAT_MARKER);
});

const writes = new Map();
let lineIndex = 0;
for (const file of oct9Jsonl.sort()) {
  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split('\n')) {
    lineIndex++;
    if (!line.trim()) continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    const parts = row.message?.content;
    if (!Array.isArray(parts)) continue;
    for (const part of parts) {
      if (part.type !== 'tool_use' || part.name !== 'Write') continue;
      const input = part.input || {};
      const target = normalizeTarget(input.path);
      const contents = input.contents;
      if (!target || typeof contents !== 'string' || contents.length < 20) continue;
      const prev = writes.get(target);
      if (!prev || lineIndex > prev.index) {
        writes.set(target, { index: lineIndex, contents, source: path.basename(file) });
      }
    }
  }
}

let overlay = 0;
for (const [target, { contents, source }] of writes) {
  if (!target.startsWith(repoRoot) && !target.startsWith(backendRoot)) continue;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents, 'utf8');
  manifest.set(target.toLowerCase(), {
    source: `transcript:${source}`,
    at: CHAT_MARKER,
  });
  overlay++;
}

console.log(`Step 2: Oct 9 chat transcripts (${oct9Jsonl.length} files) → ${overlay} overlays`);

const manifestPath = path.join(repoRoot, 'scripts', 'oct9-restore-manifest.json');
const manifestObj = Object.fromEntries(
  [...manifest.entries()].map(([k, v]) => [
    k.replace(repoRoot.toLowerCase(), 'ALL-Saint-s').replace(backendRoot.toLowerCase(), 'backend-php'),
    v,
  ])
);
fs.writeFileSync(manifestPath, JSON.stringify(manifestObj, null, 2), 'utf8');
console.log(`Manifest: ${manifestPath}`);

console.log('\nRun: node scripts/restore-empty-from-history.mjs');
console.log('Then fix routes if edit page needed; npm run dev');
