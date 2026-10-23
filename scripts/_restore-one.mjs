import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const suffix = process.argv[2];
if (!suffix) {
  console.error('Usage: node _restore-one.mjs <path-suffix>');
  process.exit(1);
}

const transcriptsDir = path.join(
  process.env.USERPROFILE || '',
  '.cursor',
  'projects',
  'c-Users-edwin-CSI-ALL-Saint-s',
  'agent-transcripts'
);

function collectJsonlFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) collectJsonlFiles(full, out);
    else if (name.endsWith('.jsonl')) out.push(full);
  }
  return out;
}

let best = null;
let lineIndex = 0;
for (const file of collectJsonlFiles(transcriptsDir).sort()) {
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    lineIndex++;
    if (!line.trim()) continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    for (const part of row.message?.content ?? []) {
      if (part.type !== 'tool_use' || part.name !== 'Write') continue;
      const p = (part.input?.path || '').replace(/\\/g, '/');
      if (!p.toLowerCase().includes(suffix.toLowerCase())) continue;
      const contents = part.input?.contents;
      if (typeof contents !== 'string') continue;
      if (!best || lineIndex > best.index) {
        best = { index: lineIndex, contents, source: file, path: p };
      }
    }
  }
}

if (!best) {
  console.error('No Write found for', suffix);
  process.exit(1);
}

const target = path.join(repoRoot, suffix.replace(/^.*all-saint-s[/\\]/i, ''));
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, best.contents, 'utf8');
console.log('Wrote', target, best.contents.length, 'from', path.basename(best.source));
