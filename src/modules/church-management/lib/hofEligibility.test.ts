import { describe, expect, it } from 'vitest';
import type { Member } from '@/modules/church-management/api/types';
import {
  sortMembersByAge,
  suggestHeadSuccessor,
  successionRoleLabel,
  soleHeadDeceasedBlockReason,
} from '@/modules/church-management/lib/hofEligibility';

function member(partial: Partial<Member> & Pick<Member, 'id' | 'fullName'>): Member {
  return {
    isHeadOfFamily: false,
    status: 'Active',
    gender: 'MALE',
    ...partial,
  } as Member;
}

describe('suggestHeadSuccessor', () => {
  const hof = member({
    id: 'hof',
    fullName: 'Father',
    gender: 'MALE',
    isHeadOfFamily: true,
  });

  it('prefers wife over sons and daughters', () => {
    const id = suggestHeadSuccessor(hof, [
      hof,
      member({
        id: 'son',
        fullName: 'Son',
        gender: 'MALE',
        relationship: 'Son',
        dateOfBirth: '1990-01-01',
      }),
      member({
        id: 'wife',
        fullName: 'Wife',
        gender: 'FEMALE',
        relationship: 'Wife',
        dateOfBirth: '1965-01-01',
      }),
      member({
        id: 'dau',
        fullName: 'Daughter',
        gender: 'FEMALE',
        relationship: 'Daughter',
        dateOfBirth: '1992-01-01',
      }),
    ]);
    expect(id).toBe('wife');
  });

  it('picks eldest son, then next son when eldest is unavailable', () => {
    const family = [
      hof,
      member({
        id: 'son-young',
        fullName: 'Younger',
        gender: 'MALE',
        relationship: 'Son',
        dateOfBirth: '1995-01-01',
      }),
      member({
        id: 'son-old',
        fullName: 'Older',
        gender: 'MALE',
        relationship: 'Son',
        dateOfBirth: '1990-01-01',
      }),
    ];
    expect(suggestHeadSuccessor(hof, family)).toBe('son-old');

    const withoutEldest = family.map((m) =>
      m.id === 'son-old' ? { ...m, status: 'Deceased' as const } : m
    );
    expect(suggestHeadSuccessor(hof, withoutEldest)).toBe('son-young');
  });

  it('picks eldest daughter when no wife or son remains', () => {
    const id = suggestHeadSuccessor(hof, [
      hof,
      member({
        id: 'dau-young',
        fullName: 'Younger D',
        gender: 'FEMALE',
        relationship: 'Daughter',
        dateOfBirth: '2000-01-01',
      }),
      member({
        id: 'dau-old',
        fullName: 'Older D',
        gender: 'FEMALE',
        relationship: 'Daughter',
        dateOfBirth: '1998-01-01',
      }),
    ]);
    expect(id).toBe('dau-old');
  });

  it('returns undefined when none remain (family becomes inactive)', () => {
    expect(suggestHeadSuccessor(hof, [hof])).toBeUndefined();
    expect(
      suggestHeadSuccessor(hof, [
        hof,
        member({
          id: 'sep',
          fullName: 'Away',
          gender: 'FEMALE',
          relationship: 'Daughter',
          status: 'Separated',
        }),
      ])
    ).toBeUndefined();
  });

  it('does not pick a married female without Wife label', () => {
    expect(
      suggestHeadSuccessor(hof, [
        hof,
        member({
          id: 'unlabeled',
          fullName: 'Unlabeled',
          gender: 'FEMALE',
          maritalStatus: 'Married',
          dateOfBirth: '1965-01-01',
        }),
        member({
          id: 'son',
          fullName: 'Son',
          gender: 'MALE',
          relationship: 'Son',
          dateOfBirth: '1990-01-01',
        }),
      ])
    ).toBe('son');
  });

  it('skips Divorced members and does not treat son-in-law as son', () => {
    expect(
      suggestHeadSuccessor(hof, [
        hof,
        member({
          id: 'divorced-son',
          fullName: 'Divorced Son',
          gender: 'MALE',
          relationship: 'Son',
          status: 'Divorced',
          dateOfBirth: '1988-01-01',
        }),
        member({
          id: 'sil',
          fullName: 'Son In Law',
          gender: 'MALE',
          relationship: 'Son-in-law',
          dateOfBirth: '1985-01-01',
        }),
        member({
          id: 'dau',
          fullName: 'Daughter',
          gender: 'FEMALE',
          relationship: 'Daughter',
          dateOfBirth: '1992-01-01',
        }),
      ])
    ).toBe('dau');
  });

  it('when female head dies, skips wife rule and picks eldest son', () => {
    const motherHof = member({
      id: 'mother-hof',
      fullName: 'Mother',
      gender: 'FEMALE',
      isHeadOfFamily: true,
      relationship: 'Wife',
    });
    expect(
      suggestHeadSuccessor(motherHof, [
        motherHof,
        member({
          id: 'other-female',
          fullName: 'Sister',
          gender: 'FEMALE',
          relationship: 'Sister',
          maritalStatus: 'Widowed',
        }),
        member({
          id: 'son',
          fullName: 'Son',
          gender: 'MALE',
          relationship: 'Son',
          dateOfBirth: '1991-01-01',
        }),
      ])
    ).toBe('son');
  });

  it('labels succession roles', () => {
    const wife = member({
      id: 'wife',
      fullName: 'Wife',
      gender: 'FEMALE',
      relationship: 'Wife',
    });
    const sonOld = member({
      id: 'son-old',
      fullName: 'Older',
      gender: 'MALE',
      relationship: 'Son',
      dateOfBirth: '1990-01-01',
    });
    const sonYoung = member({
      id: 'son-young',
      fullName: 'Younger',
      gender: 'MALE',
      relationship: 'Son',
      dateOfBirth: '1995-01-01',
    });
    const family = [hof, wife, sonOld, sonYoung];
    expect(successionRoleLabel(hof, wife, family)).toBe('wife');
    expect(successionRoleLabel(hof, sonOld, family)).toBe('eldest son');
    expect(successionRoleLabel(hof, sonYoung, [hof, sonOld, sonYoung])).toBe('next son');
  });
});

describe('soleHeadDeceasedBlockReason', () => {
  it('blocks when head is the only living eligible member', () => {
    const hof = member({
      id: 'hof',
      fullName: 'Only',
      isHeadOfFamily: true,
    });
    expect(soleHeadDeceasedBlockReason(hof, [hof], true)).toMatch(/only living head/i);
  });

  it('allows when another eligible member exists', () => {
    const hof = member({
      id: 'hof',
      fullName: 'Father',
      isHeadOfFamily: true,
    });
    const wife = member({
      id: 'wife',
      fullName: 'Wife',
      gender: 'FEMALE',
      relationship: 'Wife',
    });
    expect(soleHeadDeceasedBlockReason(hof, [hof, wife], true)).toBeNull();
  });

  it('ignores non-head members', () => {
    const son = member({ id: 'son', fullName: 'Son', isHeadOfFamily: false });
    expect(soleHeadDeceasedBlockReason(son, [son], false)).toBeNull();
  });
});

describe('sortMembersByAge', () => {
  it('orders earliest date of birth first', () => {
    const sorted = sortMembersByAge([
      member({ id: 'b', fullName: 'B', dateOfBirth: '2000-05-01' }),
      member({ id: 'a', fullName: 'A', dateOfBirth: '1990-01-01' }),
    ]);
    expect(sorted.map((m) => m.id)).toEqual(['a', 'b']);
  });
});
