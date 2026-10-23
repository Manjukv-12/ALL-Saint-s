import { describe, it, expect } from 'vitest';
import type { DueType, MemberDue } from '@/modules/church-management/api/fees';
import {
  dueYearTarget,
  personYearPaidTotal,
  personYearRemaining,
} from '@/modules/church-management/lib/dueBalance';

const membership: DueType = {
  id: 'sub-1',
  code: 'SUBSCRIPTION',
  name: 'Membership Due',
  defaultAmount: 1000,
  frequency: 'YEARLY',
  isActive: true,
  sortOrder: 1,
  autoGenerate: true,
};

const cemetery: DueType = {
  id: 'cem-1',
  code: 'CEMETERY',
  name: 'Cemetery Due',
  defaultAmount: 0,
  frequency: 'YEARLY',
  isActive: true,
  sortOrder: 3,
};

function due(partial: Partial<MemberDue> & Pick<MemberDue, 'personId' | 'dueTypeId' | 'year'>): MemberDue {
  return {
    id: partial.id ?? 'fee-1',
    familyId: 'fam-1',
    amountDue: partial.amountDue ?? 0,
    amountPaid: partial.amountPaid ?? 0,
    amount: partial.amount ?? partial.amountDue ?? 0,
    paid: partial.paid ?? false,
    state: partial.state ?? ('UNPAID' as MemberDue['state']),
    ...partial,
  };
}

describe('personYearRemaining — membership installment carry-forward', () => {
  it('defaults remaining to full yearly rate when nothing paid', () => {
    expect(personYearRemaining([], 'p1', membership, 2026)).toBe(1000);
  });

  it('after ₹600 paid on ₹1000 target, next amount due is ₹400', () => {
    const dues = [
      due({
        id: 'e1',
        personId: 'p1',
        dueTypeId: membership.id,
        year: 2026,
        amountDue: 1000,
        amountPaid: 600,
        paid: false,
      }),
    ];
    expect(personYearPaidTotal(dues, 'p1', membership.id, 2026)).toBe(600);
    expect(personYearRemaining(dues, 'p1', membership, 2026)).toBe(400);
  });

  it('sums multiple payment entries in the same calendar year', () => {
    const dues = [
      due({
        id: 'e1',
        personId: 'p1',
        dueTypeId: membership.id,
        year: 2026,
        amountDue: 600,
        amountPaid: 600,
        paid: true,
      }),
      due({
        id: 'e2',
        personId: 'p1',
        dueTypeId: membership.id,
        year: 2026,
        amountDue: 400,
        amountPaid: 200,
        paid: false,
      }),
    ];
    expect(personYearPaidTotal(dues, 'p1', membership.id, 2026)).toBe(800);
    expect(personYearRemaining(dues, 'p1', membership, 2026)).toBe(200);
  });

  it('returns 0 when yearly membership is fully paid', () => {
    const dues = [
      due({
        personId: 'p1',
        dueTypeId: membership.id,
        year: 2026,
        amountDue: 1000,
        amountPaid: 1000,
        paid: true,
      }),
    ];
    expect(personYearRemaining(dues, 'p1', membership, 2026)).toBe(0);
  });

  it('ignores other people, years, and due types', () => {
    const dues = [
      due({ personId: 'p2', dueTypeId: membership.id, year: 2026, amountPaid: 1000 }),
      due({ personId: 'p1', dueTypeId: membership.id, year: 2025, amountPaid: 1000 }),
      due({ personId: 'p1', dueTypeId: cemetery.id, year: 2026, amountPaid: 500 }),
    ];
    expect(personYearRemaining(dues, 'p1', membership, 2026)).toBe(1000);
  });
});

describe('dueYearTarget', () => {
  it('uses the due type default amount', () => {
    expect(dueYearTarget(membership)).toBe(1000);
  });

  it('returns 0 for cemetery-style types with no default', () => {
    expect(dueYearTarget(cemetery)).toBe(0);
    expect(personYearRemaining([], 'p1', cemetery, 2026)).toBe(0);
  });
});
