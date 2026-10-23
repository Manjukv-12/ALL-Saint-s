import { describe, expect, it } from 'vitest';
import { deathSuccessionNeedsManualHof } from '@/modules/church-management/lib/familyStatus';

describe('deathSuccessionNeedsManualHof', () => {
  it('returns false when succession did not apply', () => {
    expect(deathSuccessionNeedsManualHof({ applied: false })).toBe(false);
    expect(deathSuccessionNeedsManualHof(undefined)).toBe(false);
  });

  it('returns true when backend flags requiresManualHof', () => {
    expect(
      deathSuccessionNeedsManualHof({
        applied: true,
        requiresManualHof: true,
        familyStatus: 'INACTIVE',
        newHeadId: null,
      })
    ).toBe(true);
  });

  it('returns true for inactive family with no new head', () => {
    expect(
      deathSuccessionNeedsManualHof({
        applied: true,
        familyStatus: 'INACTIVE',
        newHeadId: null,
      })
    ).toBe(true);
  });

  it('returns false when a successor was assigned', () => {
    expect(
      deathSuccessionNeedsManualHof({
        applied: true,
        familyStatus: 'ACTIVE',
        newHeadId: 'member-1',
      })
    ).toBe(false);
  });
});
