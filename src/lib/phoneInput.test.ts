import { describe, it, expect } from 'vitest';
import {
  sanitizePhoneDigits,
  validateOptionalPhone,
  validateRequiredPhone,
} from '@/lib/phoneInput';
import { BLOOD_GROUP_OPTIONS, bloodGroupSelectOptions } from '@/modules/church-management/lib/bloodGroup';

describe('sanitizePhoneDigits', () => {
  it('keeps only digits and caps at 10', () => {
    expect(sanitizePhoneDigits('98a76-543-21099')).toBe('9876543210');
  });

  it('strips letters and symbols while typing', () => {
    expect(sanitizePhoneDigits('abc')).toBe('');
    expect(sanitizePhoneDigits('12')).toBe('12');
  });
});

describe('phone validation', () => {
  it('requires exactly 10 digits when phone is required', () => {
    expect(validateRequiredPhone('')).toBe('Phone number is required');
    expect(validateRequiredPhone('12345')).toBe('Phone number must be exactly 10 digits');
    expect(validateRequiredPhone('9876543210')).toBeNull();
  });

  it('allows empty optional phone but rejects short values', () => {
    expect(validateOptionalPhone('')).toBeNull();
    expect(validateOptionalPhone('123')).toBe('Phone number must be exactly 10 digits');
  });
});

describe('blood group options', () => {
  it('lists standard ABO groups', () => {
    expect(BLOOD_GROUP_OPTIONS).toEqual(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
  });

  it('preserves a legacy stored value in the select list', () => {
    expect(bloodGroupSelectOptions('O positive')[0]).toBe('O positive');
  });
});
