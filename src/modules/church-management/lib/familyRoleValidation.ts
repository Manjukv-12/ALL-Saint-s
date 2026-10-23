import { normalizeRoleValue } from '@/modules/church-management/lib/familyRoles';

export type SpouseFamilyRole = 'Husband' | 'Wife';

type RoleMember = {
  id?: string;
  fullName?: string;
  relationship?: string | null;
  relationshipToHOF?: string | null;
};

export function getSpouseRoleLabel(member: RoleMember): SpouseFamilyRole | null {
  const role = normalizeRoleValue(member.relationship || member.relationshipToHOF);
  if (role === 'Husband' || role === 'Wife') return role;
  return null;
}

export function validateUniqueSpouseRole(
  members: RoleMember[],
  relationship: string,
  excludeMemberId?: string
): string | null {
  const next = normalizeRoleValue(relationship);
  if (next !== 'Husband' && next !== 'Wife') return null;

  for (const member of members) {
    if (excludeMemberId && member.id === excludeMemberId) continue;
    const existing = getSpouseRoleLabel(member);
    if (existing === next) {
      const who = member.fullName?.trim() || 'another member';
      return `This family already has a ${next} (${who}). Only one ${next} is allowed — edit the existing role first.`;
    }
  }
  return null;
}

export interface DuplicateSpouseRole {
  role: SpouseFamilyRole;
  names: string[];
}

/** Detect families that already have more than one Husband or Wife (legacy data). */
export function findDuplicateSpouseRoles(members: RoleMember[]): DuplicateSpouseRole[] {
  const byRole: Record<SpouseFamilyRole, string[]> = { Husband: [], Wife: [] };

  for (const member of members) {
    const role = getSpouseRoleLabel(member);
    if (!role) continue;
    byRole[role].push(member.fullName?.trim() || 'Unnamed member');
  }

  const duplicates: DuplicateSpouseRole[] = [];
  for (const role of ['Husband', 'Wife'] as const) {
    if (byRole[role].length > 1) {
      duplicates.push({ role, names: byRole[role] });
    }
  }
  return duplicates;
}
