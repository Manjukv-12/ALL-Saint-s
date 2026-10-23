import { describe, it, expect } from 'vitest';
import {
  validateFamilyCreateForm,
  type MemberDetailsInput,
} from '@/modules/church-management/lib/memberFormValidation';

const validHof: MemberDetailsInput = {
  fullName: 'John Doe',
  gender: 'MALE',
  relationship: 'Head',
  phone: '9876543210',
  dateOfBirth: '1980-01-01',
  birthYearFrom: '',
  birthYearTo: '',
  membershipType: 'FULL',
  joinYearFrom: '2010',
  joinYearTo: '2010',
  associateJoinYearFrom: '',
  associateJoinYearTo: '',
};

const validArea = 'CSI-Mission Quarters';

describe('validateFamilyCreateForm — auto family code', () => {
  it('does not require a family code (backend assigns FAM001 series)', () => {
    expect(validateFamilyCreateForm('Mission Quarters', validHof, validArea)).toBeNull();
  });

  it('still requires area, address and head-of-family details', () => {
    expect(validateFamilyCreateForm('Mission Quarters', validHof, '')).toBe(
      'Enter a church area'
    );
    expect(validateFamilyCreateForm('', validHof, validArea)).toBe('Address is required');
    expect(
      validateFamilyCreateForm('Mission Quarters', { ...validHof, fullName: '' }, validArea)
    ).toBe('Full name is required');
  });

  it('rejects phone numbers that are not exactly 10 digits', () => {
    expect(
      validateFamilyCreateForm('Mission Quarters', { ...validHof, phone: '12345' }, validArea)
    ).toBe('Phone number must be exactly 10 digits');
  });
});
