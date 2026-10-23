import type { FormerFamilyMember, Member } from '@/modules/church-management/api/types';

export type MembershipDisplayStatus =
  | 'Active'
  | 'Moved To'
  | 'Married To'
  | 'Divorced'
  | 'Deceased';

export function membershipDisplayBadgeClass(status: MembershipDisplayStatus): string {
  switch (status) {
    case 'Active':
      return 'border border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100';
    case 'Moved To':
      return 'border border-blue-300 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100';
    case 'Married To':
      return 'border border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100';
    case 'Divorced':
      return 'border border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-100';
    case 'Deceased':
      return 'border border-slate-300 bg-slate-100 text-slate-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200';
  }
}

/**
 * Membership UI label for a person.
 * DB stores Separated for married-away; Members / People show "Married To".
 */
export function memberDisplayStatus(member: Member): MembershipDisplayStatus {
  if (member.membershipStatus) return member.membershipStatus;
  if (member.status === 'Deceased') return 'Deceased';
  if (member.status === 'Separated') return 'Married To';
  if (member.status === 'Divorced') return 'Divorced';
  return 'Active';
}

export function formerMemberDisplayStatus(
  member: FormerFamilyMember
): MembershipDisplayStatus {
  switch (member.leaveReason) {
    case 'FAMILY_SPLIT':
      return 'Moved To';
    case 'MARRIAGE_OUT':
      return 'Married To';
    case 'DIVORCE_RETURN':
      // Legacy leave events only — Divorced membership is person status Divorced.
      return 'Moved To';
    case 'DEATH':
      return 'Deceased';
    default:
      return member.personStatus === 'Deceased' ? 'Deceased' : 'Moved To';
  }
}

export function destinationFamilyLabel(member: FormerFamilyMember): string | null {
  if (member.toFamilyCode) return member.toFamilyCode;
  if (member.currentFamilyCode) return member.currentFamilyCode;
  return null;
}

export function destinationFamilyId(member: FormerFamilyMember): string | null {
  if (member.toFamilyId) return member.toFamilyId;
  if (member.currentFamilyId) return member.currentFamilyId;
  return null;
}

export interface MembershipStatusGroups {
  movedTo: FormerFamilyMember[];
  marriedTo: FormerFamilyMember[];
  divorced: FormerFamilyMember[];
  deceasedFormer: FormerFamilyMember[];
}

/** Group former/left members into Membership Status lists. */
export function groupFormerMembersByStatus(
  formerMembers: FormerFamilyMember[] | undefined
): MembershipStatusGroups {
  const groups: MembershipStatusGroups = {
    movedTo: [],
    marriedTo: [],
    divorced: [],
    deceasedFormer: [],
  };

  for (const member of formerMembers ?? []) {
    switch (formerMemberDisplayStatus(member)) {
      case 'Moved To':
        groups.movedTo.push(member);
        break;
      case 'Married To':
        groups.marriedTo.push(member);
        break;
      case 'Divorced':
        groups.divorced.push(member);
        break;
      case 'Deceased':
        groups.deceasedFormer.push(member);
        break;
      default:
        groups.movedTo.push(member);
    }
  }

  return groups;
}

/** Separated members still on this family record (married away, not moved by split). */
export function marriedAwayMembers(members: Member[] | undefined): Member[] {
  return (members ?? []).filter((m) => m.status === 'Separated');
}

/** Divorced members still on this family record. */
export function divorcedOnFamilyMembers(members: Member[] | undefined): Member[] {
  return (members ?? []).filter((m) => m.status === 'Divorced');
}
