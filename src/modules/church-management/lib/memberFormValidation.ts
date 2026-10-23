import {
  type MembershipFields,
  validateMembership,
} from '@/modules/church-management/lib/membershipType';
import { validateRequiredPhone } from '@/modules/church-management/lib/phoneInput';
import { firstFieldErrorMessage } from '@/modules/church-management/lib/formFieldFocus';
import { validateBirthYearRange } from '@/modules/church-management/lib/birthYearRange';

export type MemberDetailsInput = {
  fullName: string;
  gender: 'MALE' | 'FEMALE' | '';
  relationship: string;
  phone: string;
  dateOfBirth: string;
  birthYearFrom?: string;
  birthYearTo?: string;
} & MembershipFields;

export type MemberDetailsFieldErrors = Partial<
  Record<
    | 'address'
    | 'area'
    | 'familyId'
    | 'fullName'
    | 'gender'
    | 'relationship'
    | 'phone'
    | 'dateOfBirth'
    | 'birthYearFrom'
    | 'birthYearTo'
    | 'joinYearFrom'
    | 'joinYearTo'
    | 'associateJoinYearFrom'
    | 'associateJoinYearTo'
    | 'membershipType',
    string
  >
>;

export const MEMBER_DETAILS_FIELD_ORDER: (keyof MemberDetailsFieldErrors)[] = [
  'area',
  'address',
  'familyId',
  'fullName',
  'gender',
  'relationship',
  'phone',
  'dateOfBirth',
  'birthYearFrom',
  'birthYearTo',
  'membershipType',
  'joinYearFrom',
  'joinYearTo',
  'associateJoinYearFrom',
  'associateJoinYearTo',
];

/** Field-level errors for add-member / family HOF forms. */
export function getMemberDetailsFieldErrors(
  values: MemberDetailsInput & { familyId?: string; address?: string; area?: string },
  options?: { requireFamily?: boolean; requireAddress?: boolean; requireArea?: boolean }
): MemberDetailsFieldErrors {
  const errors: MemberDetailsFieldErrors = {};

  if (options?.requireArea && !values.area?.trim()) {
    errors.area = 'Enter a church area';
  }
  if (options?.requireAddress && !values.address?.trim()) {
    errors.address = 'Address is required';
  }
  if (options?.requireFamily && !values.familyId?.trim()) {
    errors.familyId = 'Select a family';
  }
  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }
  if (!values.gender) {
    errors.gender = 'Select gender';
  }
  if (!values.relationship.trim()) {
    errors.relationship = 'Select role in family';
  }
  const phoneError = validateRequiredPhone(values.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }
  const birthRangeError = validateBirthYearRange(
    values.birthYearFrom ?? '',
    values.birthYearTo ?? ''
  );
  if (birthRangeError) {
    errors.birthYearFrom = birthRangeError;
  } else if (!values.dateOfBirth.trim()) {
    const hasRange =
      (values.birthYearFrom ?? '').trim() !== '' && (values.birthYearTo ?? '').trim() !== '';
    if (!hasRange) {
      errors.dateOfBirth = 'Date of birth is required (or enter approximate birth years)';
    }
  }

  const membershipError = validateMembership(values);
  if (membershipError) {
    if (values.membershipType === 'ASSOCIATE') {
      errors.associateJoinYearFrom = membershipError;
    } else if (values.membershipType === 'FULL') {
      errors.joinYearFrom = membershipError;
    } else {
      errors.membershipType = membershipError;
    }
  }

  return errors;
}

/** Required member fields when adding a person (including head of family). */
export function validateMemberDetails(values: MemberDetailsInput): string | null {
  return firstFieldErrorMessage(
    getMemberDetailsFieldErrors(values),
    MEMBER_DETAILS_FIELD_ORDER
  );
}

export function getFamilyCreateFieldErrors(
  address: string,
  hof: MemberDetailsInput,
  area = ''
): MemberDetailsFieldErrors {
  return getMemberDetailsFieldErrors(
    { ...hof, address, area },
    { requireAddress: true, requireArea: true }
  );
}

export function validateFamilyCreateForm(
  address: string,
  hof: MemberDetailsInput,
  area = ''
): string | null {
  return firstFieldErrorMessage(
    getFamilyCreateFieldErrors(address, hof, area),
    MEMBER_DETAILS_FIELD_ORDER
  );
}
