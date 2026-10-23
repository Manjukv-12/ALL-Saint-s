import { describe, it, expect } from 'vitest';
import { shouldShowWeddingDateField } from '@/modules/church-management/lib/memberStatus';

describe('shouldShowWeddingDateField', () => {
  it('hides for Active daughter / son (unmarried children)', () => {
    expect(
      shouldShowWeddingDateField({ status: 'Active', relationship: 'Daughter' })
    ).toBe(false);
    expect(shouldShowWeddingDateField({ status: 'Active', relationship: 'Son' })).toBe(false);
  });

  it('shows for Married Away (Separated)', () => {
    expect(
      shouldShowWeddingDateField({ status: 'Separated', relationship: 'Daughter' })
    ).toBe(true);
  });

  it('shows for Husband / Wife in the family', () => {
    expect(shouldShowWeddingDateField({ status: 'Active', relationship: 'Wife' })).toBe(true);
    expect(shouldShowWeddingDateField({ status: 'Active', relationship: 'Husband' })).toBe(true);
  });

  it('shows for Divorced and married marital status', () => {
    expect(shouldShowWeddingDateField({ status: 'Divorced', relationship: 'Daughter' })).toBe(
      true
    );
    expect(
      shouldShowWeddingDateField({
        status: 'Active',
        relationship: 'Daughter',
        maritalStatus: 'Married',
      })
    ).toBe(true);
  });
});
