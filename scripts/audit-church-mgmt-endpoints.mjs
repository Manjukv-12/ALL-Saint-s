/**
 * Probe church-management API paths (expects 401 without token, not 404 HTML).
 * Usage:
 *   node scripts/audit-church-mgmt-endpoints.mjs
 *   node scripts/audit-church-mgmt-endpoints.mjs https://csiallsaintstcr.com/backend-php
 */
const base = (process.argv[2] || 'https://csiallsaintstcr.com/backend-php').replace(/\/$/, '');

const paths = [
  '/api/church-management/auth/me',
  '/api/church-management/stats',
  '/api/church-management/members',
  '/api/church-management/families',
  '/api/church-management/families/roots',
  '/api/church-management/areas',
  '/api/church-management/fees/due-types',
  '/api/church-management/fees/membership-year-rates',
  '/api/church-management/persons/search?q=a',
  '/api/church-management/reports/birthdays',
  '/api/church-management/health-tracker/summary',
  '/api/church-management/certificates',
  '/api/church-management/templates',
];

console.log('Base:', base);
let ok = 0;
let bad = 0;
for (const p of paths) {
  const url = base + p;
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    const isHtml = text.includes('<!DOCTYPE') || text.includes('This Page Does Not Exist');
    const tag = isHtml ? 'HTML (wrong URL / missing backend)' : res.status === 401 ? '401 auth (OK)' : `${res.status}`;
    if (isHtml || res.status === 404) bad++;
    else ok++;
    console.log(`${tag.padEnd(28)} ${p}`);
  } catch (e) {
    bad++;
    console.log(`ERR ${String(e.message).slice(0, 40).padEnd(28)} ${p}`);
  }
}
console.log(`\n${ok} reachable (non-404), ${bad} failed`);
process.exit(bad > 0 ? 1 : 0);
