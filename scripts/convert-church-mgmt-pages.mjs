/**
 * One-time helper: convert Next.js admin pages from church_project to Vite + React Router.
 * Run: node scripts/convert-church-mgmt-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcRoot = path.join(root, '..', '..', 'Documents', 'church_project', 'frontend', 'app', 'admin');
const outDir = path.join(root, 'src', 'modules', 'church-management', 'pages');

const pageMap = [
  ['dashboard/page.tsx', 'DashboardPage.tsx'],
  ['families/page.tsx', 'FamiliesPage.tsx'],
  ['families/[id]/page.tsx', 'FamilyDetailPage.tsx'],
  ['members/page.tsx', 'MembersPage.tsx'],
  ['fees/page.tsx', 'FeesPage.tsx'],
  ['certificates/page.tsx', 'CertificatesPage.tsx'],
  ['certificates/generate/page.tsx', 'CertificateGeneratePage.tsx'],
];

const loginSrc = path.join(
  root,
  '..',
  '..',
  'Documents',
  'church_project',
  'frontend',
  'app',
  'login',
  'page.tsx',
);

function transform(content) {
  let s = content;
  s = s.replace(/^'use client';\s*\n*/m, '');
  s = s.replace(
    /import \{ useRouter(?:, useParams)? \} from 'next\/navigation';/g,
    "import { useNavigate, Link, useParams } from 'react-router-dom';",
  );
  s = s.replace(/import \{ useParams \} from 'next\/navigation';/g, '');
  s = s.replace(/import \{ useRouter \} from 'next\/navigation';/g, "import { useNavigate, Link } from 'react-router-dom';");
  s = s.replace(/@\/contexts\/AuthContext/g, '@/modules/church-management/contexts/ChurchMgmtAuthContext');
  s = s.replace(/@\/lib\/api/g, '@/modules/church-management/api');
  s = s.replace(/useAuth\(\)/g, 'useChurchMgmtAuth()');
  if (!s.includes('useChurchMgmtAuth')) {
    s = s.replace(
      /import \{ useEffect, useState \} from 'react';/,
      "import { useEffect, useState } from 'react';\nimport { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';",
    );
  }
  if (s.includes('useChurchMgmtAuth') && !s.includes('ChurchMgmtAuthContext')) {
    s =
      "import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';\n" +
      s;
  }
  s = s.replace(/const router = useRouter\(\);/g, 'const navigate = useNavigate();');
  s = s.replace(/router\.push\(/g, 'navigate(');
  s = s.replace(/router\.replace\(/g, 'navigate(');
  s = s.replace(/router\.back\(\)/g, 'navigate(-1)');

  const routes = [
    ['/login', '/admin/church-management/login'],
    ['/admin/dashboard', '/admin/church-management/dashboard'],
    ['/admin/families', '/admin/church-management/families'],
    ['/admin/members', '/admin/church-management/members'],
    ['/admin/fees', '/admin/church-management/fees'],
    ['/admin/certificates/generate', '/admin/church-management/certificates/generate'],
    ['/admin/certificates', '/admin/church-management/certificates'],
    ['/admin/import', '/admin/church-management/dashboard'],
    ['/admin/accounts', '/admin/church-management/dashboard'],
    ['/admin/website', '/admin/church-management/dashboard'],
    ['/admin/notifications', '/admin/church-management/dashboard'],
  ];
  for (const [from, to] of routes) {
    s = s.split(from).join(to);
  }

  s = s.replace(/href="(\/admin\/church-management\/[^"]+)"/g, 'to="$1"');
  s = s.replace(/<a(\s+[^>]*?)to="/g, '<Link$1to="');
  s = s.replace(/<\/a>/g, '</Link>');
  // Fix tel: links broken by global </a> replace
  s = s.replace(/<Link href={`tel:/g, '<a href={`tel:');
  s = s.replace(/<\/Link>\s*\{headOfFamily\.contactNumber\}/g, '</a>{headOfFamily.contactNumber}');

  if (!s.includes("from 'react-router-dom'") && (s.includes('navigate(') || s.includes('<Link'))) {
    s = `import { useNavigate, Link } from 'react-router-dom';\n` + s;
  }
  if (s.includes('useParams') && !s.includes("useParams } from 'react-router-dom'")) {
    if (!s.includes('useParams')) {
      /* noop */
    }
  }

  s = s.replace(/export default function (\w+)/g, 'export default function $1');
  return s;
}

fs.mkdirSync(outDir, { recursive: true });

for (const [rel, outName] of pageMap) {
  const inPath = path.join(srcRoot, rel);
  if (!fs.existsSync(inPath)) {
    console.warn('skip missing', inPath);
    continue;
  }
  const out = transform(fs.readFileSync(inPath, 'utf8'));
  fs.writeFileSync(path.join(outDir, outName), out, 'utf8');
  console.log('wrote', outName);
}

if (fs.existsSync(loginSrc)) {
  let login = transform(fs.readFileSync(loginSrc, 'utf8'));
  login = login.replace(/navigate\('\/admin\/church-management\/dashboard'\)/g, "navigate('/admin/church-management/dashboard', { replace: true })");
  fs.writeFileSync(path.join(outDir, 'LoginPage.tsx'), login, 'utf8');
  console.log('wrote LoginPage.tsx');
}

console.log('done');
