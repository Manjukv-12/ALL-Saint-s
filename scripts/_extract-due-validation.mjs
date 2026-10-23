import fs from 'fs';
import path from 'path';

const dir =
  'C:/Users/edwin/.cursor/projects/c-Users-edwin-CSI-ALL-Saint-s/agent-transcripts';
const target = 'dueAmountValidation.ts';
let bestWrite = null;
let bestPatch = null;

for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
  const jsonl = ent.isDirectory()
    ? path.join(dir, ent.name, `${ent.name}.jsonl`)
    : null;
  if (!jsonl || !fs.existsSync(jsonl)) continue;
  for (const line of fs.readFileSync(jsonl, 'utf8').split('\n')) {
    if (!line.includes(target)) continue;
    let j;
    try {
      j = JSON.parse(line);
    } catch {
      continue;
    }
    for (const c of j.message?.content ?? []) {
      const contents = c.input?.contents;
      const ns = c.input?.new_string;
      const p = c.input?.path?.replace(/\\/g, '/');
      if (!p?.endsWith(target)) continue;
      if (contents && (!bestWrite || contents.length > bestWrite.length)) {
        bestWrite = contents;
      }
      if (
        ns?.includes('membershipRoundPayUnit') &&
        ns.includes('checkAmountDueAgainstPaid') &&
        (!bestPatch || ns.length > bestPatch.length)
      ) {
        bestPatch = ns;
      }
    }
  }
}

const out =
  'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/lib/dueAmountValidation.ts';
const body = bestPatch || bestWrite;
if (body) {
  fs.writeFileSync(out, body, 'utf8');
  console.log('Wrote', out, body.length, 'chars', bestPatch ? '(patch)' : '(write)');
} else {
  console.error('No content found');
  process.exit(1);
}
