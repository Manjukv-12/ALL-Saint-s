import type { Member } from '@/modules/church-management/api/types';

export function marriedToFamilyLabel(member: Member): string | null {
  if (member.status !== 'Separated' && member.maritalStatus !== 'Married') {
    return null;
  }
  if (member.marriedToFamily?.familyCode) {
    return member.marriedToFamily.familyCode;
  }
  if (member.externalFamilyName) {
    return member.externalFamilyName;
  }
  if (member.spouseName) {
    return `${member.spouseName}'s family`;
  }
  return null;
}
