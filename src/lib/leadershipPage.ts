import type { LeadershipSectionRow } from '@/lib/api';

/** Stable ordering when merging members with section metadata (matches backend `leadership_sources`). */
export const LEADERSHIP_SECTION_ORDER = [
  'our-bishop',
  'cochin-diocesan-office-bearers',
  'church-committee',
  'church-leadership',
  'pastorate-committee-members',
  'other-members',
] as const;

export type LeadershipLayoutVariant =
  | 'bishop'
  | 'diocesan'
  | 'committee'
  | 'leadership'
  | 'pastorate'
  | 'other'
  | 'grid';

/** These blocks use only section title, intro, and section photo — no per-member roster on site or in admin. */
export function leadershipSectionAllowsMembers(sectionKey: string): boolean {
  return sectionKey !== 'church-committee' && sectionKey !== 'our-bishop';
}

export function layoutVariantForSectionKey(sectionKey: string): LeadershipLayoutVariant {
  switch (sectionKey) {
    case 'our-bishop':
      return 'bishop';
    case 'cochin-diocesan-office-bearers':
      return 'diocesan';
    case 'church-committee':
      return 'committee';
    case 'church-leadership':
      return 'leadership';
    case 'pastorate-committee-members':
      return 'pastorate';
    case 'other-members':
      return 'other';
    default:
      return 'grid';
  }
}

/** Used only if `/api/leadership/sections` returns no rows (offline / error). Mirrors PHP seed. */
export function leadershipDefaultSections(): LeadershipSectionRow[] {
  const raw: Omit<LeadershipSectionRow, 'id' | 'created_at'>[] = [
    {
      section_key: 'our-bishop',
      title: 'Our Bishop',
      subtitle: 'Spiritual leadership of the diocese',
      description: null,
      image: null,
      sort_order: 10,
      is_active: 1,
    },
    {
      section_key: 'cochin-diocesan-office-bearers',
      title: 'Cochin Diocesan Office Bearers',
      subtitle: 'Leaders serving the wider Cochin Diocese',
      description: null,
      image: null,
      sort_order: 20,
      is_active: 1,
    },
    {
      section_key: 'church-committee',
      title: 'Church Committee',
      subtitle: 'Governance and ministry within the Church of South India',
      description: null,
      image: null,
      sort_order: 30,
      is_active: 1,
    },
    {
      section_key: 'church-leadership',
      title: 'Church Leadership',
      subtitle: 'Meet the dedicated individuals who guide our congregation',
      description: null,
      image: null,
      sort_order: 40,
      is_active: 1,
    },
    {
      section_key: 'pastorate-committee-members',
      title: 'Pastorate Committee Members',
      subtitle: 'Elected members serving under the leadership team',
      description: null,
      image: null,
      sort_order: 50,
      is_active: 1,
    },
    {
      section_key: 'other-members',
      title: 'Other Members',
      subtitle: 'Valued members of our church community',
      description: null,
      image: null,
      sort_order: 60,
      is_active: 1,
    },
  ];
  return raw.map((s, i) => ({ ...s, id: -(i + 1), created_at: '' }));
}
