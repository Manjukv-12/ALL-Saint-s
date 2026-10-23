import { describe, expect, it } from 'vitest';
import {
  findDuplicateSpouseRoles,
  validateUniqueSpouseRole,
} from '@/modules/church-management/lib/familyRoleValidation';

describe('validateUniqueSpouseRole', () => {
  it('allows the first Husband in a family', () => {
    expect(validateUniqueSpouseRole([], 'Husband')).toBeNull();
  });

  it('blocks a second Husband', () => {
    const members = [{ id: '1', fullName: 'Dr. Mark Raj', relationship: 'Husband' }];
    expect(validateUniqueSpouseRole(members, 'Husband')).toMatch(/already has a Husband/);
  });

  it('allows editing the same member without conflict', () => {
    const members = [{ id: '1', fullName: 'Mary', relationship: 'Wife' }];
    expect(validateUniqueSpouseRole(members, 'Wife', '1')).toBeNull();
  });

  it('ignores non-spouse roles', () => {
    const members = [{ id: '1', fullName: 'Mark', relationship: 'Husband' }];
    expect(validateUniqueSpouseRole(members, 'Son')).toBeNull();
  });
});

describe('findDuplicateSpouseRoles', () => {
  it('detects two husbands', () => {
    const members = [
      { fullName: 'Dr. Mark Raj', relationship: 'Husband' },
      { fullName: 'Amal', relationship: 'Husband' },
      { fullName: 'Mary', relationship: 'Wife' },
    ];
    expect(findDuplicateSpouseRoles(members)).toEqual([
      { role: 'Husband', names: ['Dr. Mark Raj', 'Amal'] },
    ]);
  });
});
