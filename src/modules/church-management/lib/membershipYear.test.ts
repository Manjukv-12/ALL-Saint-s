import { describe, expect, it } from 'vitest';
import {
  FEES_SYSTEM_START_YEAR,
  PREVIOUS_DUES_THROUGH_YEAR,
} from '@/modules/church-management/lib/feesYearPolicy';
import {
  isValidMembershipYear,
  membershipYearBounds,
  membershipYearError,
  membershipYearOptions,
} from '@/modules/church-management/lib/membershipYear';

describe('membershipYear policy', () => {
  const anchor = 2026;

  it('never offers years before the fees system start year', () => {
    const { min } = membershipYearBounds(anchor);
    expect(min).toBe(FEES_SYSTEM_START_YEAR);
    expect(membershipYearOptions(anchor)).not.toContain(PREVIOUS_DUES_THROUGH_YEAR);
    expect(isValidMembershipYear(PREVIOUS_DUES_THROUGH_YEAR, anchor)).toBe(false);
  });

  it('explains profile vs fee rows for 2025', () => {
    expect(membershipYearError(PREVIOUS_DUES_THROUGH_YEAR, anchor)).toContain(
      String(PREVIOUS_DUES_THROUGH_YEAR)
    );
    expect(membershipYearError(PREVIOUS_DUES_THROUGH_YEAR, anchor)).toContain(
      String(FEES_SYSTEM_START_YEAR)
    );
  });

  it('allows 2026 onward within bounds', () => {
    expect(isValidMembershipYear(FEES_SYSTEM_START_YEAR, anchor)).toBe(true);
    expect(membershipYearError(FEES_SYSTEM_START_YEAR, anchor)).toBeNull();
  });
});
