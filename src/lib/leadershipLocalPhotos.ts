/**
 * Static leadership portraits under `src/assets/`.
 * - Known paths: bishop, diocesan, church leadership, committee banner, Sonal (sexton), Smitha (WF).
 * - `leadership/other members/*`: every file in that folder is matched to roster names by filename tokens.
 */
import clergyJohnJoseph from '@/assets/cochin Diocesean office bearers/Clergy secretary Rev.John joseph.jpeg';
import layThambiPaul from '@/assets/cochin Diocesean office bearers/Laysecretary C.L.Thambi paul.jpeg';
import treasurerMammen from '@/assets/cochin Diocesean office bearers/Treasurer Rev.P.K.Mammen.jpeg';
import smithMary from '@/assets/cochin Diocesean office bearers/Smith Mary.jpeg';

import vicarImg from '@/assets/leadership/vicar.png';
import assistantVicarImg from '@/assets/leadership/assistant vicar.jpeg';
import lissyImg from '@/assets/leadership/lissy-snehalatha-woman-presbyter.png';
import thambiPaulSecretary from '@/assets/leadership/thambi-paul.png';
import churchTreasurerImg from '@/assets/leadership/treasurer.jpeg';
import sonalSexton from '@/assets/leadership/sonal-peter-sexton.png';

import { mediaImageUrl } from '@/lib/api';

const otherMemberPhotoModules = import.meta.glob<string>('../assets/leadership/other members/*.{jpeg,jpg,png,JPEG}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function normKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function memberKey(sectionKey: string, displayName: string): string {
  return `${sectionKey}|${normKey(displayName)}`;
}

/** Filename (no ext) → normalized tokens for matching roster names. */
function fileStemTokens(fileBase: string): string[] {
  const stripped = fileBase
    .replace(/\.(jpe?g|png)$/i, '')
    .replace(/^mr\.?\s*/i, '')
    .replace(/\s*\.\s*$/g, '')
    .trim();
  return normKey(stripped)
    .split(' ')
    .filter((t) => t.length >= 2);
}

type Matcher = { url: string; test: (n: string) => boolean };

function buildOtherMemberMatchers(): Matcher[] {
  const out: Matcher[] = [];
  for (const [path, url] of Object.entries(otherMemberPhotoModules)) {
    const file = path.split('/').pop() ?? '';
    const lowerFile = file.toLowerCase();

    if (lowerFile.includes('jojy') || lowerFile.includes('joji')) {
      out.push({
        url,
        test: (n) => (n.includes('jojy') || n.includes('joji')) && n.includes('koshy'),
      });
      continue;
    }

    const tokens = fileStemTokens(file);
    if (tokens.length === 0) continue;

    out.push({
      url,
      test: (n) => tokens.every((t) => n.includes(t)),
    });
  }
  return out;
}

const OTHER_MEMBER_MATCHERS = buildOtherMemberMatchers();

function matchOtherMemberFolderPhoto(displayName: string): string | null {
  const n = normKey(displayName);
  for (const { url, test } of OTHER_MEMBER_MATCHERS) {
    if (test(n)) return url;
  }
  return null;
}

/** section_key|normalized name → bundled asset URL (non–other-members / explicit other). */
const LOCAL_MEMBER_SRC = new Map<string, string>([
  [memberKey('cochin-diocesan-office-bearers', 'Rev. John Joseph'), clergyJohnJoseph],
  [memberKey('cochin-diocesan-office-bearers', 'Rev. P. K. Mammen'), treasurerMammen],
  [memberKey('cochin-diocesan-office-bearers', 'C. L. Thambi Paul'), layThambiPaul],
  [memberKey('church-leadership', 'Rev. Johnson E. George'), vicarImg],
  [memberKey('church-leadership', 'Rev. K.P. Johnson'), assistantVicarImg],
  [memberKey('church-leadership', 'Rev. Sr. Lissy Snehalatha'), lissyImg],
  [memberKey('church-leadership', 'Mr. Thambi Paul'), thambiPaulSecretary],
  [memberKey('church-leadership', 'Dr. David Saj Mathew'), churchTreasurerImg],
  [memberKey('other-members', 'Sonal Peter'), sonalSexton],
  [memberKey('other-members', 'Smitha Mary Mathew'), smithMary],
  [memberKey('other-members', 'Smith Mary Mathew'), smithMary],
]);

/**
 * Public or admin: prefer bundled portrait when section + name matches assets; else API upload URL.
 * `our-bishop` member rows are not used on the public page — portrait comes from section upload via `resolveLeadershipSectionImage`.
 */
export function resolveLeadershipMemberImage(
  sectionKey: string,
  memberName: string,
  apiImage: string | null | undefined,
  apiKey?: string,
): string | null {
  if (sectionKey === 'our-bishop') {
    return mediaImageUrl(apiImage, apiKey);
  }
  const k = memberKey(sectionKey, memberName);
  const local = LOCAL_MEMBER_SRC.get(k);
  if (local) return local;
  if (sectionKey === 'other-members') {
    const fromFolder = matchOtherMemberFolderPhoto(memberName);
    if (fromFolder) return fromFolder;
  }
  return mediaImageUrl(apiImage, apiKey);
}

/** Optional section-wide image from assets (e.g. committee group photo). */
export function resolveLeadershipSectionImage(
  sectionKey: string,
  apiImage: string | null | undefined,
  apiKey?: string,
): string | null {
  const remote = mediaImageUrl(apiImage, apiKey);
  if (remote) return remote;
  // Church Committee should not auto-show bundled fallback when no uploaded image exists.
  if (sectionKey === 'church-committee') return null;
  return null;
}
