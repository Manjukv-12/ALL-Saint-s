import fs from 'fs';
import path from 'path';

const needle = process.argv[2] || 'membershipCompleteYearAmount';
const dir =
  'C:/Users/edwin/.cursor/projects/c-Users-edwin-CSI-ALL-Saint-s/agent-transcripts';

for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  const jsonl = path.join(dir, ent.name, `${ent.name}.jsonl`);
  if (!fs.existsSync(jsonl)) continue;
  for (const line of fs.readFileSync(jsonl, 'utf8').split('\n')) {
    if (!line.includes(needle)) continue;
    let j;
    try {
      j = JSON.parse(line);
    } catch {
      continue;
    }
    for (const c of j.message?.content ?? []) {
      const ns = c.input?.new_string;
      const p = c.input?.path?.replace(/\\/g, '/');
      if (ns?.includes(needle) && p?.endsWith('dueAmountValidation.ts')) {
        console.log('===', ent.name, '===');
        console.log(ns);
      }
    }
  }
}
