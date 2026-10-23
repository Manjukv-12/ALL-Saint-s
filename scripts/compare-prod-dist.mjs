/**
 * Compare live/production JS bundle vs local Vite dist for church-mgmt API + UI strings.
 * Usage: node scripts/compare-prod-dist.mjs [path-to-live-index-*.js]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const defaultLive = path.join(repoRoot, '..', 'release', 'prod-live', 'index-CUD3C1J4.js');
const livePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultLive;

const distDir = path.join(repoRoot, 'dist', 'assets');
const localJs = fs.readdirSync(distDir).find((f) => f.startsWith('index-') && f.endsWith('.js'));
if (!localJs) {
  console.error('Run npm run build first — no dist/assets/index-*.js');
  process.exit(1);
}
const localPath = path.join(distDir, localJs);

function extractApi(s) {
  const re = /\/api\/[a-zA-Z0-9_\-/${}]+/g;
  return [...new Set((s.match(re) || []).map((x) => x.replace(/\$\{[^}]+\}/g, '{id}')))].sort();
}

function extractCmRoutes(s) {
  return [...new Set(s.match(/admin\/church-management\/[a-zA-Z0-9_\-/?=&]+/g) || [])].sort();
}

function churchStrings(s) {
  const re = /["']([^"']{6,100})["']/g;
  const out = new Set();
  let m;
  while ((m = re.exec(s))) {
    const t = m[1];
    if (/member|family|due|church|Married|Deceased|Moved|Membership|Baptism|Annivers/i.test(t)) {
      out.add(t);
    }
  }
  return [...out].sort();
}

const live = fs.readFileSync(livePath, 'utf8');
const local = fs.readFileSync(localPath, 'utf8');

const liveApi = extractApi(live).filter((p) => p.includes('church'));
const localApi = extractApi(local).filter((p) => p.includes('church'));

console.log('Live bundle:', livePath, live.length, 'bytes');
console.log('Local dist: ', localPath, local.length, 'bytes');
console.log('\n--- Church API paths: live only ---');
console.log(liveApi.filter((x) => !localApi.includes(x)).join('\n') || '(none)');
console.log('\n--- Church API paths: local only ---');
console.log(localApi.filter((x) => !liveApi.includes(x)).join('\n') || '(none)');

console.log('\n--- Route literals: live only ---');
const lr = extractCmRoutes(live);
const dr = extractCmRoutes(local);
console.log(lr.filter((x) => !dr.includes(x)).join('\n') || '(none)');
console.log('\n--- Route literals: local only ---');
console.log(dr.filter((x) => !lr.includes(x)).join('\n') || '(none)');

const ls = churchStrings(live);
const ds = churchStrings(local);
console.log('\n--- UI strings: live only (sample 25) ---');
console.log(ls.filter((x) => !ds.includes(x)).slice(0, 25).join('\n') || '(none)');
console.log('\n--- UI strings: local only (sample 25) ---');
console.log(ds.filter((x) => !ls.includes(x)).slice(0, 25).join('\n') || '(none)');

console.log('\nCounts: church API', liveApi.length, 'vs', localApi.length);
console.log('Counts: UI strings', ls.length, 'vs', ds.length);
