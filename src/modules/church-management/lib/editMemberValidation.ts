import type { Member } from '@/modules/church-management/api/types';
import { validateUniqueSpouseRole } from '@/modules/church-management/lib/familyRoleValidation';
import { soleHeadDeceasedBlockReason } from '@/modules/church-management/lib/hofEligibility';
import { validateMembership } from '@/modules/church-management/lib/membershipType';
import {
  statusRequiresSpouse,
  type MemberStatus,
} from '@/modules/church-management/lib/memberStatus';
import { validateOptionalPhone } from '@/modules/church-management/lib/phoneInput';
import {
  validatePreviousDues,
  type PreviousDuesFormValues,
} from '@/modules/church-management/lib/previousDues';
import { validateBirthYearRange } from '@/modules/church-management/lib/birthYearRange';

export type EditMemberFormValues = PreviousDuesFormValues & {
  fullName: string;
  gender: '' | 'MALE' | 'FEMALE';
  relationship: string;
  phone: string;
  occupation: string;
  qualification: string;
  bloodGroup: string;
  dateOfBirth: string;
  birthYearFrom: string;
  birthYearTo: string;
  dateOfWedding: string;
  dateOfBaptism: string;
  dateOfConfirmation: string;
  status: MemberStatus;
  statusNotes: string;
  spouseName: string;
  isHeadOfFamily: boolean;
  membershipType: 'FULL' | 'ASSOCIATE';
  joinYearFrom: string;
  joinYearTo: string;
  associateJoinYearFrom: string;
  associateJoinYearTo: string;
};

export type EditMemberFieldErrors = Partial<
  Record<
    | 'fullName'
    | 'gender'
    | 'relationship'
    | 'phone'
    | 'dateOfBirth'
    | 'birthYearFrom'
    | 'birthYearTo'
    | 'dateOfWedding'
    | 'dateOfBaptism'
    | 'dateOfConfirmation'
    | 'statusNotes'
    | 'spouseName'
    | 'membershipType'
    | 'joinYearFrom'
    | 'joinYearTo'
    | 'associateJoinYearFrom'
    | 'associateJoinYearTo'
    | 'previousDues'
    | '_form',
    string
  >
>;

function isFutureDate(isoDate: string): boolean {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d > today;
}

export function validateEditMemberForm(params: {
  formData: EditMemberFormValues;
  originalStatus: MemberStatus;
  member: Member;
  familyMembers: Member[];
}): EditMemberFieldErrors {
  const { formData, originalStatus, member, familyMembers } = params;
  const errors: EditMemberFieldErrors = {};

  if (!formData.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!formData.gender) {
    errors.gender = 'Gender is required';
  }

  if (!formData.relationship.trim()) {
    errors.relationship = 'Role in family is required (use Wife for the spouse)';
  } else {
    const spouseRoleError = validateUniqueSpouseRole(
      familyMembers,
      formData.relationship,
      member.id
    );
    if (spouseRoleError) {
      errors.relationship = spouseRoleError;
    }
  }

  const phoneError = validateOptionalPhone(formData.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  const birthRangeError = validateBirthYearRange(formData.birthYearFrom, formData.birthYearTo);
  if (birthRangeError) {
    errors.birthYearFrom = birthRangeError;
  } else if (formData.dateOfBirth && isFutureDate(formData.dateOfBirth)) {
    errors.dateOfBirth = 'Date of birth cannot be in the future';
  }

  if (formData.dateOfWedding && isFutureDate(formData.dateOfWedding)) {
    errors.dateOfWedding = 'Wedding date cannot be in the future';
  }

  if (formData.dateOfBaptism && isFutureDate(formData.dateOfBaptism)) {
    errors.dateOfBaptism = 'Baptism date cannot be in the future';
  }

  if (formData.dateOfConfirmation && isFutureDate(formData.dateOfConfirmation)) {
    errors.dateOfConfirmation = 'Confirmation date cannot be in the future';
  }

  const membershipError = validateMembership(formData);
  if (membershipError) {
    if (formData.membershipType === 'ASSOCIATE') {
      errors.associateJoinYearFrom = membershipError;
    } else if (formData.membershipType === 'FULL') {
      errors.joinYearFrom = membershipError;
    } else {
      errors.membershipType = membershipError;
    }
  }

  const statusChanged = formData.status !== originalStatus;
  if (statusChanged && !formData.statusNotes.trim()) {
    errors.statusNotes = 'Add a comment when changing member status';
  }

  if (statusRequiresSpouse(formData.status) && !formData.spouseName.trim()) {
    errors.spouseName =
      formData.status === 'Divorced'
        ? 'Spouse name is required when status is Divorced'
        : 'Spouse name is required when status is Separated (married away)';
  }

  if (formData.status === 'Separated' && !formData.dateOfWedding.trim()) {
    errors.dateOfWedding = 'Marriage date is required for Married Away';
  }

  if (formData.status === 'Deceased' && originalStatus !== 'Deceased') {
    const soleHeadBlock = soleHeadDeceasedBlockReason(
      member,
      familyMembers,
      !!member.isHeadOfFamily || formData.isHeadOfFamily
    );
    if (soleHeadBlock) {
      errors._form = soleHeadBlock;
    }
  }

  const previousDuesError = validatePreviousDues(formData);
  if (previousDuesError) {
    errors.previousDues = previousDuesError;
  }

  return errors;
}

export function firstEditMemberFieldError(errors: EditMemberFieldErrors): string | null {
  const order: (keyof EditMemberFieldErrors)[] = [
    '_form',
    'fullName',
    'gender',
    'relationship',
    'phone',
    'dateOfBirth',
    'dateOfWedding',
    'dateOfBaptism',
    'dateOfConfirmation',
    'spouseName',
    'statusNotes',
    'membershipType',
    'joinYearFrom',
    'joinYearTo',
    'associateJoinYearFrom',
    'associateJoinYearTo',
  ];
  for (const key of order) {
    if (errors[key]) return errors[key]!;
  }
  return null;
}
