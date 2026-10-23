import type { Member } from '@/modules/church-management/api/types';
import { isEligibleForMembershipFee } from '@/modules/church-management/lib/membershipEligibility';

export function isActiveMember(member: Member): boolean {
  return member.status === undefined || member.status === null || member.status === 'Active';
}

/** Male son who can leave to start a new family (Moved To) — must be 18+. */
export function canSplitMember(member: Member): boolean {
  return (
    member.gender === 'MALE' &&
    !member.isHeadOfFamily &&
    isActiveMember(member) &&
    member.maritalStatus !== 'Married' &&
    isEligibleForMembershipFee(member.dateOfBirth)
  );
}

export function needsGenderForSplit(member: Member): boolean {
  return (
    !member.gender &&
    !member.isHeadOfFamily &&
    isActiveMember(member) &&
    member.maritalStatus !== 'Married'
  );
}

/** Male active son who is otherwise eligible except age / missing DOB. */
export function needsAgeForSplit(member: Member): boolean {
  return (
    member.gender === 'MALE' &&
    !member.isHeadOfFamily &&
    isActiveMember(member) &&
    member.maritalStatus !== 'Married' &&
    !isEligibleForMembershipFee(member.dateOfBirth)
  );
}
