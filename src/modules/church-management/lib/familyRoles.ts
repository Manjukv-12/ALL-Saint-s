import type { Member } from '@/modules/church-management/api/types';

export const FAMILY_ROLE_OPTIONS = [
  { value: 'Husband', label: 'Husband' },
  { value: 'Wife', label: 'Wife' },
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Brother', label: 'Brother' },
  { value: 'Sister', label: 'Sister' },
  { value: 'Grandson', label: 'Grandson' },
  { value: 'Granddaughter', label: 'Granddaughter' },
  { value: 'Other', label: 'Other' },
] as const;

export type FamilyRole = (typeof FAMILY_ROLE_OPTIONS)[number]['value'];

const HEAD_ROLE_PATTERN = /^(head|head of family)$/i;
const CHILD_ROLE_PATTERN = /^(son|daughter)$/i;

function isHeadRoleLabel(value?: string | null): boolean {
  if (!value) return false;
  return HEAD_ROLE_PATTERN.test(value.trim());
}

export function isChildFamilyRole(value?: string | null): boolean {
  if (!value?.trim()) return false;
  return CHILD_ROLE_PATTERN.test(value.trim());
}

/** Head labeled Son/Daughter until a spouse is added — then auto-promotes to Husband/Wife. */
export function headRoleMismatchReason(
  member: Pick<Member, 'relationship' | 'relationshipToHOF' | 'isHeadOfFamily' | 'gender'>
): string | null {
  if (!member.isHeadOfFamily) return null;
  const role = getMemberRoleLabel(member);
  if (!isChildFamilyRole(role)) return null;
  const spouseRole = member.gender === 'FEMALE' ? 'Husband' : 'Wife';
  const becomes = member.gender === 'FEMALE' ? 'Wife' : 'Husband';
  return `Head is still "${role}" until a ${spouseRole} is added to this family — then the role will automatically become ${becomes}.`;
}

/** Family relationship role — not the same as head of family. */
export function getMemberRoleLabel(member: Pick<Member, 'relationship' | 'relationshipToHOF'>): string {
  const candidates = [member.relationship, member.relationshipToHOF];
  for (const raw of candidates) {
    if (!raw?.trim() || isHeadRoleLabel(raw)) continue;
    return raw.trim();
  }
  return '—';
}

export function defaultRoleForGender(gender?: 'MALE' | 'FEMALE' | '' | null): FamilyRole {
  if (gender === 'FEMALE') return 'Wife';
  if (gender === 'MALE') return 'Husband';
  return 'Son';
}

export function normalizeRoleValue(value?: string | null): string {
  if (!value?.trim() || isHeadRoleLabel(value)) return '';
  const match = FAMILY_ROLE_OPTIONS.find(
    (o) => o.value.toLowerCase() === value.trim().toLowerCase()
  );
  return match?.value ?? value.trim();
}
