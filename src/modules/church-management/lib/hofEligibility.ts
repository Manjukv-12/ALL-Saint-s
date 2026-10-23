import type { Member } from '@/modules/church-management/api/types';
import { isActiveMemberStatus } from '@/modules/church-management/lib/membershipType';

export function isEligibleHeadOfFamily(member: Member): boolean {
  return (
    isActiveMemberStatus(member) &&
    member.status !== 'Deceased' &&
    member.status !== 'Separated' &&
    member.status !== 'Divorced'
  );
}

/** Other living members who could become head after this person. */
export function eligibleHeadSuccessors(member: Member, familyMembers: Member[]): Member[] {
  return familyMembers.filter((m) => m.id !== member.id && isEligibleHeadOfFamily(m));
}

/**
 * When the head is the only living eligible member, do not allow Deceased
 * (a family needs a successor head). Returns an alert message, or null if OK.
 */
export function soleHeadDeceasedBlockReason(
  member: Member,
  familyMembers: Member[],
  isHeadOfFamily = !!member.isHeadOfFamily
): string | null {
  if (!isHeadOfFamily) return null;
  if (eligibleHeadSuccessors(member, familyMembers).length > 0) return null;
  return (
    'Cannot mark as deceased: this person is the only living head of family. ' +
    'Add another eligible family member who can become the new head first.'
  );
}

export function sortHeadOfFamilyCandidates(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    if (a.isHeadOfFamily && !b.isHeadOfFamily) return -1;
    if (!a.isHeadOfFamily && b.isHeadOfFamily) return 1;
    return a.fullName.localeCompare(b.fullName);
  });
}

function relationshipText(member: Member): string {
  return `${member.relationship ?? ''} ${member.relationshipToHOF ?? ''}`.toLowerCase();
}

function relationshipTokens(member: Member): string[] {
  return relationshipText(member)
    .split(/[^a-z0-9-]+/i)
    .map((t) => t.toLowerCase())
    .filter(Boolean);
}

function relationshipMatches(member: Member, needles: string[]): boolean {
  const tokens = relationshipTokens(member);
  if (tokens.length === 0) return false;
  return needles.some((n) => tokens.includes(n.toLowerCase()));
}

/** Eldest first by date of birth; missing DOB sorts after known DOBs. */
export function sortMembersByAge(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    const da = a.dateOfBirth?.split('T')[0] ?? '';
    const db = b.dateOfBirth?.split('T')[0] ?? '';
    if (da && db && da !== db) return da.localeCompare(db);
    if (da && !db) return -1;
    if (!da && db) return 1;
    return a.fullName.localeCompare(b.fullName);
  });
}

function findWifeSuccessor(deceased: Member, eligible: Member[]): Member | undefined {
  if (deceased.gender !== 'MALE') return undefined;

  // Wife label is mandatory — do not guess from marital status alone.
  const byRole = eligible.filter(
    (m) => m.gender === 'FEMALE' && relationshipMatches(m, ['wife', 'spouse'])
  );
  if (byRole.length === 0) return undefined;
  return sortMembersByAge(byRole)[0];
}

function findChildSuccessor(
  eligible: Member[],
  gender: 'MALE' | 'FEMALE',
  roleNeedles: string[]
): Member | undefined {
  const children = eligible.filter(
    (m) => m.gender === gender && relationshipMatches(m, roleNeedles)
  );
  if (children.length === 0) return undefined;
  return sortMembersByAge(children)[0];
}

/**
 * Succession when head of family dies:
 * wife → eldest son → next son (next eldest living son) → eldest daughter.
 * Returns undefined when none remain (family should become inactive).
 */
export function suggestHeadSuccessor(
  deceased: Member,
  members: Member[]
): string | undefined {
  const eligible = members.filter((m) => m.id !== deceased.id && isEligibleHeadOfFamily(m));
  if (eligible.length === 0) return undefined;

  const wife = findWifeSuccessor(deceased, eligible);
  if (wife) return wife.id;

  const son = findChildSuccessor(eligible, 'MALE', ['son']);
  if (son) return son.id;

  const daughter = findChildSuccessor(eligible, 'FEMALE', ['daughter']);
  if (daughter) return daughter.id;

  return undefined;
}

export function successionRoleLabel(
  deceased: Member,
  successor: Member,
  members: Member[]
): string {
  const eligible = members.filter((m) => m.id !== deceased.id && isEligibleHeadOfFamily(m));
  const wife = findWifeSuccessor(deceased, eligible);
  if (wife && wife.id === successor.id) return 'wife';

  const sons = sortMembersByAge(
    eligible.filter((m) => m.gender === 'MALE' && relationshipMatches(m, ['son']))
  );
  const sonIndex = sons.findIndex((s) => s.id === successor.id);
  if (sonIndex === 0) return 'eldest son';
  if (sonIndex > 0) return 'next son';

  const daughter = findChildSuccessor(eligible, 'FEMALE', ['daughter']);
  if (daughter && daughter.id === successor.id) return 'eldest daughter';

  return 'next eligible member';
}
