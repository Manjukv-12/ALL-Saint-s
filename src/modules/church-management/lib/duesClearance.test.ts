import { describe, it, expect } from 'vitest';
import type { MemberDue } from '@/modules/church-management/api/fees';
import {
  mapClearanceApiItems,
  outstandingFromDuesForClearance,
  totalClearanceOutstanding,
} from '@/modules/church-management/lib/duesClearance';

function due(partial: Partial<MemberDue> & Pick<MemberDue, 'id' | 'year'>): MemberDue {
  return {
    familyId: 'fam-1',
    personId: 'p1',
    dueTypeId: 'dt-1',
    amountDue: 0,
    amountPaid: 0,
    amount: 0,
    paid: false,
    state: 'UNPAID',
    ...partial,
  };
}

describe('outstandingFromDuesForClearance', () => {
  it('aggregates membership through current month and skips future months/years', () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const subType = {
      id: 's',
      code: 'SUBSCRIPTION',
      name: 'Membership Due',
      defaultAmount: 1500,
      frequency: 'YEARLY' as const,
      isActive: true,
      sortOrder: 1,
    };

    const dues = [
      due({
        id: 'past',
        year: y,
        month: Math.max(1, m - 1),
        amountDue: 125,
        amountPaid: 0,
        dueType: subType,
      }),
      due({
        id: 'future-month',
        year: y,
        month: Math.min(12, m + 2),
        amountDue: 125,
        amountPaid: 0,
        dueType: subType,
      }),
      due({
        id: 'future-year',
        year: y + 2,
        month: 1,
        amountDue: 125,
        amountPaid: 0,
        dueType: subType,
      }),
    ];

    const open = outstandingFromDuesForClearance(dues);
    expect(open).toHaveLength(1);
    expect(open[0].aggregated).toBe(true);
    expect(open[0].remaining).toBe(125);
    expect(open[0].label).toContain('through');
  });

  it('includes other dues for current/past years only', () => {
    const y = new Date().getFullYear();
    const dues = [
      due({
        id: 'h1',
        year: y,
        amountDue: 500,
        amountPaid: 100,
        dueType: {
          id: 'h',
          code: 'HARVEST',
          name: 'Harvest Due',
          defaultAmount: 0,
          frequency: 'YEARLY',
          isActive: true,
          sortOrder: 2,
        },
      }),
      due({
        id: 'h-future',
        year: y + 1,
        amountDue: 300,
        amountPaid: 0,
        dueType: {
          id: 'h2',
          code: 'HARVEST',
          name: 'Harvest Due',
          defaultAmount: 0,
          frequency: 'YEARLY',
          isActive: true,
          sortOrder: 2,
        },
      }),
    ];
    const open = outstandingFromDuesForClearance(dues);
    expect(open).toHaveLength(1);
    expect(open[0].id).toBe('h1');
    expect(open[0].remaining).toBe(400);
  });
});

describe('mapClearanceApiItems / totalClearanceOutstanding', () => {
  it('maps backend clearance rows', () => {
    const items = mapClearanceApiItems([
      {
        dueId: 'clearance-membership',
        dueType: 'Membership Due',
        year: 2026,
        remaining: 375,
        label: 'Membership Due (through Aug 2026)',
        aggregated: true,
      },
    ]);
    expect(items[0].label).toBe('Membership Due (through Aug 2026)');
    expect(totalClearanceOutstanding(items)).toBe(375);
  });
});
