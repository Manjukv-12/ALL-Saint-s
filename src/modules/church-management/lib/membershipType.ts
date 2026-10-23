import type { Family, Member } from '@/modules/church-management/api/types';
import { currentYear } from '@/modules/church-management/lib/birthYearRange';
import {
  isoDateToYear,
  joinYearToIsoEnd,
  joinYearToIsoStart,
  validateJoinYearRange,
} from '@/modules/church-management/lib/joinYearRange';

export type MembershipType = 'FULL' | 'ASSOCIATE';

export interface MembershipFields {
  membershipType: MembershipType;
  /** Full member: year joined the church (from). */
  joinYearFrom: string;
  /** Full member: year joined the church (to). Same as from if single year. */
  joinYearTo: string;
  /** Associate: start year (from). */
  associateJoinYearFrom: string;
  /** Associate: end year (to). Blank if still an associate. */
  associateJoinYearTo: string;
}

export const DEFAULT_MEMBERSHIP: MembershipFields = {
  membershipType: 'FULL',
  joinYearFrom: '',
  joinYearTo: '',
  associateJoinYearFrom: '',
  associateJoinYearTo: '',
};

export function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function currentJoinYear(): string {
  return String(currentYear());
}

/** Default for new family from split — associate is most common for new branch. */
export function defaultSplitMembership(): MembershipFields {
  return {
    membershipType: 'ASSOCIATE',
    joinYearFrom: '',
    joinYearTo: '',
    associateJoinYearFrom: currentJoinYear(),
    associateJoinYearTo: '',
  };
}

export function getHeadOfFamily(family?: Family | null): Member | undefined {
  return family?.members?.find((m) => m.isHeadOfFamily);
}

/** Family is treated as associate when the head of family is an associate member. */
export function isAssociateFamily(family?: Family | null): boolean {
  const hof = getHeadOfFamily(family);
  return normalizeMembershipType(hof?.membershipType) === 'ASSOCIATE';
}

/** Membership inherited by new members added to an associate family. */
export function inheritedMembershipForFamily(family?: Family | null): MembershipFields {
  if (!isAssociateFamily(family)) {
    return { ...DEFAULT_MEMBERSHIP };
  }
  const hofMembership = membershipFromMember(getHeadOfFamily(family));
  return {
    membershipType: 'ASSOCIATE',
    joinYearFrom: '',
    joinYearTo: '',
    associateJoinYearFrom: hofMembership.associateJoinYearFrom || currentJoinYear(),
    associateJoinYearTo: '',
  };
}

export function inheritedMembershipFromHof(hofMembership: MembershipFields): MembershipFields {
  if (hofMembership.membershipType !== 'ASSOCIATE') {
    return { ...DEFAULT_MEMBERSHIP };
  }
  return {
    membershipType: 'ASSOCIATE',
    joinYearFrom: '',
    joinYearTo: '',
    associateJoinYearFrom: hofMembership.associateJoinYearFrom || currentJoinYear(),
    associateJoinYearTo: '',
  };
}

export const MEMBERSHIP_TYPE_OPTIONS: {
  value: MembershipType;
  label: string;
  hint: string;
}[] = [
  {
    value: 'FULL',
    label: 'Full member',
    hint: 'Permanent member of this church',
  },
  {
    value: 'ASSOCIATE',
    label: 'Associate member',
    hint: 'Temporary — may leave when moving away from the area',
  },
];

export function membershipLabel(type?: MembershipType): string {
  if (type === 'ASSOCIATE') return 'Associate';
  return 'Full';
}

export function normalizeMembershipType(type?: MembershipType): MembershipType {
  return type === 'ASSOCIATE' ? 'ASSOCIATE' : 'FULL';
}

export function isActiveMemberStatus(member: Member): boolean {
  return (
    member.status === undefined || member.status === null || member.status === 'Active'
  );
}

export function countActiveFamilyMembers(members: Member[] | undefined): number {
  return (members ?? []).filter(isActiveMemberStatus).length;
}

export function countAllFamilyMembers(members: Member[] | undefined): number {
  return (members ?? []).length;
}

export interface FamilyMemberCounts {
  total: number;
  active: number;
  deceased: number;
  separated: number;
  pastAssociate: number;
}

export function summarizeFamilyMemberCounts(members: Member[] | undefined): FamilyMemberCounts {
  const groups = partitionFamilyMembers(members);
  return {
    total: countAllFamilyMembers(members),
    active: countActiveFamilyMembers(members),
    deceased: groups.deceasedMembers.length,
    separated: groups.separatedMembers.length,
    pastAssociate: groups.pastAssociates.length,
  };
}

/** e.g. "1 active · 1 deceased · 1 separated" */
export function formatFamilyMemberStatusSummary(counts: FamilyMemberCounts): string {
  const parts: string[] = [];
  if (counts.active > 0) parts.push(`${counts.active} active`);
  if (counts.deceased > 0) parts.push(`${counts.deceased} deceased`);
  if (counts.separated > 0) parts.push(`${counts.separated} separated`);
  if (counts.pastAssociate > 0) parts.push(`${counts.pastAssociate} past associate`);
  return parts.join(' · ');
}

export function isFullMember(member: Member): boolean {
  return normalizeMembershipType(member.membershipType) === 'FULL' && isActiveMemberStatus(member);
}

export function isActiveAssociateMember(member: Member): boolean {
  return (
    normalizeMembershipType(member.membershipType) === 'ASSOCIATE' &&
    isActiveMemberStatus(member) &&
    !member.associateLeftDate
  );
}

export function isPastAssociateMember(member: Member): boolean {
  return (
    normalizeMembershipType(member.membershipType) === 'ASSOCIATE' &&
    (!!member.associateLeftDate || member.status === 'Separated')
  );
}

export interface FamilyMembershipGroups {
  headOfFamily?: Member;
  fullMembers: Member[];
  associateMembers: Member[];
  pastAssociates: Member[];
  separatedMembers: Member[];
  deceasedMembers: Member[];
  fullCount: number;
  associateCount: number;
}

export function partitionFamilyMembers(members: Member[] | undefined): FamilyMembershipGroups {
  const list = members ?? [];
  const headOfFamily = list.find((m) => m.isHeadOfFamily);
  const withoutHof = list.filter((m) => !m.isHeadOfFamily);

  const fullMembers = withoutHof.filter(
    (m) => normalizeMembershipType(m.membershipType) === 'FULL' && isActiveMemberStatus(m)
  );
  const associateMembers = withoutHof.filter(isActiveAssociateMember);
  const pastAssociatesWithoutHof = withoutHof.filter(isPastAssociateMember);
  const separatedMembers = withoutHof.filter(
    (m) =>
      m.status === 'Separated' && normalizeMembershipType(m.membershipType) !== 'ASSOCIATE'
  );
  const deceasedMembers = list.filter((m) => m.status === 'Deceased');

  const pastAssociates = [
    ...pastAssociatesWithoutHof,
    ...(headOfFamily && isPastAssociateMember(headOfFamily) ? [headOfFamily] : []),
  ];

  const fullCount =
    fullMembers.length +
    (headOfFamily && isFullMember(headOfFamily) ? 1 : 0);
  const associateCount =
    associateMembers.length +
    (headOfFamily && isActiveAssociateMember(headOfFamily) ? 1 : 0);

  return {
    headOfFamily,
    fullMembers,
    associateMembers,
    pastAssociates,
    separatedMembers,
    deceasedMembers,
    fullCount,
    associateCount,
  };
}

export function validateMembership(fields: MembershipFields): string | null {
  if (fields.membershipType === 'FULL') {
    return validateJoinYearRange(fields.joinYearFrom, fields.joinYearTo, {
      requiredFrom: true,
      label: 'Year of joining',
    });
  }

  const joinError = validateJoinYearRange(
    fields.associateJoinYearFrom,
    fields.associateJoinYearTo,
    { requiredFrom: true, label: 'Associate membership' }
  );
  if (joinError) return joinError;

  return null;
}

export function membershipToPayload(fields: MembershipFields) {
  if (fields.membershipType === 'ASSOCIATE') {
    const from = fields.associateJoinYearFrom.trim();
    const to = fields.associateJoinYearTo.trim() || from;
    return {
      membershipType: fields.membershipType,
      associateJoinDate: joinYearToIsoStart(from),
      associateLeftDate: fields.associateJoinYearTo.trim()
        ? joinYearToIsoEnd(to)
        : undefined,
    };
  }

  const from = fields.joinYearFrom.trim();
  const to = fields.joinYearTo.trim() || from;
  return {
    membershipType: 'FULL' as const,
    yearOfJoining: Number(from),
    joinYearTo: Number(to),
  };
}

export function membershipFromMember(member?: {
  membershipType?: MembershipType;
  yearOfJoining?: number | null;
  joinYearTo?: number | null;
  associateJoinDate?: string;
  associateLeftDate?: string;
}): MembershipFields {
  if (!member) return { ...DEFAULT_MEMBERSHIP };

  const joinFrom =
    member.yearOfJoining != null && member.yearOfJoining > 0
      ? String(member.yearOfJoining)
      : '';
  const joinTo =
    member.joinYearTo != null && member.joinYearTo > 0
      ? String(member.joinYearTo)
      : joinFrom;

  return {
    membershipType: member.membershipType ?? 'FULL',
    joinYearFrom: joinFrom,
    joinYearTo: joinTo,
    associateJoinYearFrom: isoDateToYear(member.associateJoinDate),
    associateJoinYearTo: isoDateToYear(member.associateLeftDate),
  };
}
