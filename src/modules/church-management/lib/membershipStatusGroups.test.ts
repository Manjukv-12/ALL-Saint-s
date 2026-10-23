import { describe, it, expect } from 'vitest';
import type { FormerFamilyMember, Member } from '@/modules/church-management/api/types';
import {
  destinationFamilyId,
  destinationFamilyLabel,
  divorcedOnFamilyMembers,
  formerMemberDisplayStatus,
  groupFormerMembersByStatus,
  marriedAwayMembers,
  memberDisplayStatus,
  membershipDisplayBadgeClass,
} from '@/modules/church-management/lib/membershipStatusGroups';

function former(
  partial: Partial<FormerFamilyMember> & Pick<FormerFamilyMember, 'personId' | 'fullName' | 'leaveReason'>
): FormerFamilyMember {
  return {
    leaveLabel: partial.leaveLabel ?? partial.leaveReason,
    ...partial,
  };
}

describe('formerMemberDisplayStatus — membership status labels', () => {
  it('maps FAMILY_SPLIT to Moved To', () => {
    expect(
      formerMemberDisplayStatus(
        former({ personId: '1', fullName: 'A', leaveReason: 'FAMILY_SPLIT' })
      )
    ).toBe('Moved To');
  });

  it('maps MARRIAGE_OUT to Married To', () => {
    expect(
      formerMemberDisplayStatus(
        former({ personId: '1', fullName: 'A', leaveReason: 'MARRIAGE_OUT' })
      )
    ).toBe('Married To');
  });

  it('maps legacy DIVORCE_RETURN leave events away from Divorced (status path only)', () => {
    expect(
      formerMemberDisplayStatus(
        former({ personId: '1', fullName: 'A', leaveReason: 'DIVORCE_RETURN' })
      )
    ).toBe('Moved To');
  });

  it('maps DEATH to Deceased', () => {
    expect(
      formerMemberDisplayStatus(former({ personId: '1', fullName: 'A', leaveReason: 'DEATH' }))
    ).toBe('Deceased');
  });
});

describe('groupFormerMembersByStatus', () => {
  it('groups moved / married lists; Divorced is person status not leave events', () => {
    const groups = groupFormerMembersByStatus([
      former({
        personId: 'm1',
        fullName: 'Moved',
        leaveReason: 'FAMILY_SPLIT',
        toFamilyCode: 'FAM002',
      }),
      former({ personId: 'm2', fullName: 'Married', leaveReason: 'MARRIAGE_OUT' }),
      former({ personId: 'm3', fullName: 'Legacy divorce event', leaveReason: 'DIVORCE_RETURN' }),
      former({ personId: 'm4', fullName: 'Late', leaveReason: 'DEATH' }),
    ]);

    expect(groups.movedTo.map((m) => m.personId)).toEqual(['m1', 'm3']);
    expect(groups.marriedTo.map((m) => m.personId)).toEqual(['m2']);
    expect(groups.divorced.map((m) => m.personId)).toEqual([]);
    expect(groups.deceasedFormer.map((m) => m.personId)).toEqual(['m4']);
  });
});

describe('destinationFamilyLabel / destinationFamilyId', () => {
  it('prefers toFamilyCode / toFamilyId for Moved To destination', () => {
    const member = former({
      personId: '1',
      fullName: 'A',
      leaveReason: 'FAMILY_SPLIT',
      toFamilyId: 'new-id',
      toFamilyCode: 'FAM002',
      currentFamilyId: 'old-id',
      currentFamilyCode: 'FAM001',
    });
    expect(destinationFamilyLabel(member)).toBe('FAM002');
    expect(destinationFamilyId(member)).toBe('new-id');
  });

  it('falls back to current family when to-family is missing', () => {
    const member = former({
      personId: '1',
      fullName: 'A',
      leaveReason: 'FAMILY_SPLIT',
      currentFamilyId: 'cur-id',
      currentFamilyCode: 'FAM009',
    });
    expect(destinationFamilyLabel(member)).toBe('FAM009');
    expect(destinationFamilyId(member)).toBe('cur-id');
  });
});

describe('marriedAwayMembers', () => {
  it('includes Separated members who are married away', () => {
    const members = [
      {
        id: '1',
        fullName: 'Daughter',
        status: 'Separated',
        maritalStatus: 'Married',
        externalFamilyName: 'Other Family',
      } as Member,
      {
        id: '1b',
        fullName: 'Separated only',
        status: 'Separated',
      } as Member,
      {
        id: '2',
        fullName: 'Active',
        status: 'Active',
        maritalStatus: 'Single',
      } as Member,
    ];
    expect(marriedAwayMembers(members).map((m) => m.id)).toEqual(['1', '1b']);
  });
});

describe('divorcedOnFamilyMembers', () => {
  it('includes Divorced members still on the family', () => {
    const members = [
      {
        id: 'd1',
        fullName: 'Divorced person',
        status: 'Divorced',
        spouseName: 'Ex Spouse',
      } as Member,
      {
        id: 'a1',
        fullName: 'Active',
        status: 'Active',
      } as Member,
    ];
    expect(divorcedOnFamilyMembers(members).map((m) => m.id)).toEqual(['d1']);
  });
});

describe('membershipDisplayBadgeClass', () => {
  it('returns a distinct class for Moved To', () => {
    expect(membershipDisplayBadgeClass('Moved To')).toContain('blue');
  });
});

describe('memberDisplayStatus', () => {
  it('maps Separated person status to Married To (same as Members list)', () => {
    expect(
      memberDisplayStatus({
        id: '1',
        fullName: 'Mary',
        status: 'Separated',
        spouseName: 'amal',
      } as Member)
    ).toBe('Married To');
  });

  it('prefers API membershipStatus when present', () => {
    expect(
      memberDisplayStatus({
        id: '1',
        fullName: 'Moved',
        status: 'Active',
        membershipStatus: 'Moved To',
      } as Member)
    ).toBe('Moved To');
  });
});
