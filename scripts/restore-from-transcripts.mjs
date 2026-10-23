/**
 * Replay Write tool calls from Cursor agent transcripts onto the workspace.
 * Uses the last Write per normalized path (most recent wins).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const backendRoot = path.resolve(repoRoot, '..', 'backend-php');
const transcriptsDir = path.join(
  process.env.USERPROFILE || '',
  '.cursor',
  'projects',
  'c-Users-edwin-CSI-ALL-Saint-s',
  'agent-transcripts'
);

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

const files = collectJsonlFiles(transcriptsDir);
const writes = new Map(); // target -> { index, contents, source }

let lineIndex = 0;
for (const file of files.sort()) {
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
    const content = row.message?.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part.type !== 'tool_use' || part.name !== 'Write') continue;
      const input = part.input || {};
      const target = normalizeTarget(input.path);
      const contents = input.contents;
      if (!target || typeof contents !== 'string') continue;
      const prev = writes.get(target);
      if (!prev || lineIndex > prev.index) {
        writes.set(target, { index: lineIndex, contents, source: file });
      }
    }
  }
}

let applied = 0;
let skipped = 0;
for (const [target, { contents, source }] of writes) {
  if (!target.startsWith(repoRoot) && !target.startsWith(backendRoot)) {
    skipped++;
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const existing = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (existing === contents) {
    skipped++;
    continue;
  }
  fs.writeFileSync(target, contents, 'utf8');
  applied++;
  console.log('restored:', path.relative(repoRoot, target).replace(/\.\./g, '..'));
}

console.log(`\nDone. ${writes.size} paths in transcripts, ${applied} files written, ${skipped} unchanged/skipped.`);
