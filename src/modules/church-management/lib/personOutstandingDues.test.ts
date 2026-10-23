import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MemberDue } from '@/modules/church-management/api/fees';
import {
  dueRemaining,
  outstandingFromDues,
  hasOutstandingDues,
  formatOutstandingSummary,
  requiresDuesClearanceForStatusChange,
  checkPersonOutstandingDues,
  loadPersonOutstandingDues,
} from '@/modules/church-management/lib/personOutstandingDues';

vi.mock('@/modules/church-management/api/fees', () => ({
  feesApi: {
    getPersonFeeHistory: vi.fn(),
  },
}));

import { feesApi } from '@/modules/church-management/api/fees';

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

describe('dueRemaining', () => {
  it('returns unpaid balance', () => {
    expect(dueRemaining(due({ id: '1', year: 2026, amountDue: 1000, amountPaid: 400 }))).toBe(600);
  });

  it('never goes negative for excess payment', () => {
    expect(dueRemaining(due({ id: '1', year: 2026, amountDue: 1000, amountPaid: 1200 }))).toBe(0);
  });

  it('treats missing amounts as zero', () => {
    expect(dueRemaining(due({ id: '1', year: 2026 }))).toBe(0);
  });
});

describe('outstandingFromDues / hasOutstandingDues — married away & Moved To gate', () => {
  it('blocks when membership is unpaid', () => {
    const dues = [
      due({
        id: 'm1',
        year: 2026,
        amountDue: 1000,
        amountPaid: 0,
        dueType: { id: 's', code: 'SUBSCRIPTION', name: 'Membership Due', defaultAmount: 1000, frequency: 'YEARLY', isActive: true, sortOrder: 1 },
      }),
    ];
    expect(hasOutstandingDues(dues)).toBe(true);
    expect(outstandingFromDues(dues)).toEqual([
      { id: 'm1', label: 'Membership Due', year: 2026, remaining: 1000 },
    ]);
  });

  it('blocks when harvest or other manual dues are unpaid', () => {
    const dues = [
      due({
        id: 'h1',
        year: 2026,
        amountDue: 500,
        amountPaid: 100,
        dueType: { id: 'h', code: 'HARVEST', name: 'Harvest Due', defaultAmount: 0, frequency: 'YEARLY', isActive: true, sortOrder: 2 },
      }),
    ];
    const open = outstandingFromDues(dues);
    expect(open).toHaveLength(1);
    expect(open[0].remaining).toBe(400);
    expect(hasOutstandingDues(dues)).toBe(true);
  });

  it('allows Married away / Moved To when all dues are fully paid', () => {
    const dues = [
      due({
        id: 'm1',
        year: 2026,
        amountDue: 1000,
        amountPaid: 1000,
        paid: true,
        dueType: { id: 's', code: 'SUBSCRIPTION', name: 'Membership Due', defaultAmount: 1000, frequency: 'YEARLY', isActive: true, sortOrder: 1 },
      }),
      due({
        id: 'h1',
        year: 2025,
        amountDue: 200,
        amountPaid: 200,
        paid: true,
        dueType: { id: 'h', code: 'HARVEST', name: 'Harvest Due', defaultAmount: 0, frequency: 'YEARLY', isActive: true, sortOrder: 2 },
      }),
    ];
    expect(hasOutstandingDues(dues)).toBe(false);
    expect(outstandingFromDues(dues)).toEqual([]);
  });

  it('allows when only excess (overpayment) remains on a row', () => {
    const dues = [
      due({
        id: 'm1',
        year: 2026,
        amountDue: 1000,
        amountPaid: 1500,
        paid: true,
        dueType: { id: 's', code: 'SUBSCRIPTION', name: 'Membership Due', defaultAmount: 1000, frequency: 'YEARLY', isActive: true, sortOrder: 1 },
      }),
    ];
    expect(hasOutstandingDues(dues)).toBe(false);
  });

  it('lists every open year/type (partial membership + cemetery)', () => {
    const dues = [
      due({
        id: 'm1',
        year: 2026,
        amountDue: 1000,
        amountPaid: 600,
        dueType: { id: 's', code: 'SUBSCRIPTION', name: 'Membership Due', defaultAmount: 1000, frequency: 'YEARLY', isActive: true, sortOrder: 1 },
      }),
      due({
        id: 'c1',
        year: 2026,
        amountDue: 300,
        amountPaid: 0,
        dueType: { id: 'c', code: 'CEMETERY', name: 'Cemetery Due', defaultAmount: 0, frequency: 'YEARLY', isActive: true, sortOrder: 3 },
      }),
      due({
        id: 'm0',
        year: 2025,
        amountDue: 1000,
        amountPaid: 1000,
        paid: true,
        dueType: { id: 's', code: 'SUBSCRIPTION', name: 'Membership Due', defaultAmount: 1000, frequency: 'YEARLY', isActive: true, sortOrder: 1 },
      }),
    ];
    const open = outstandingFromDues(dues);
    expect(open).toHaveLength(2);
    expect(open.map((x) => x.id).sort()).toEqual(['c1', 'm1']);
  });

  it('treats empty history as clear (new member / no fees yet)', () => {
    expect(hasOutstandingDues([])).toBe(false);
  });
});

describe('requiresDuesClearanceForStatusChange', () => {
  it('requires clearance when changing Active → Separated', () => {
    expect(requiresDuesClearanceForStatusChange('Active', 'Separated')).toBe(true);
  });

  it('does not re-check when already Separated', () => {
    expect(requiresDuesClearanceForStatusChange('Separated', 'Separated')).toBe(false);
  });

  it('does not require clearance for Divorced or Deceased', () => {
    expect(requiresDuesClearanceForStatusChange('Active', 'Divorced')).toBe(false);
    expect(requiresDuesClearanceForStatusChange('Separated', 'Active')).toBe(false);
    expect(requiresDuesClearanceForStatusChange('Active', 'Deceased')).toBe(false);
  });
});

describe('formatOutstandingSummary', () => {
  it('joins open items for error messages', () => {
    const text = formatOutstandingSummary([
      { id: '1', label: 'Membership Due', year: 2026, remaining: 400 },
      { id: '2', label: 'Harvest Due', year: 2026, remaining: 50.5 },
    ]);
    expect(text).toContain('Membership Due 2026');
    expect(text).toContain('Harvest Due 2026');
    expect(text).toContain('left');
  });
});

describe('checkPersonOutstandingDues — fail closed', () => {
  beforeEach(() => {
    vi.mocked(feesApi.getPersonFeeHistory).mockReset();
  });

  it('returns open items when API succeeds with unpaid dues', async () => {
    vi.mocked(feesApi.getPersonFeeHistory).mockResolvedValue({
      data: {
        dues: [
          due({
            id: 'm1',
            year: 2026,
            amountDue: 1000,
            amountPaid: 0,
            dueType: {
              id: 's',
              code: 'SUBSCRIPTION',
              name: 'Membership Due',
              defaultAmount: 1000,
              frequency: 'YEARLY',
              isActive: true,
              sortOrder: 1,
            },
          }),
        ],
        payments: [],
      },
    });
    const result = await checkPersonOutstandingDues('p1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items).toHaveLength(1);
      expect(result.items[0].remaining).toBe(1000);
    }
  });

  it('returns empty items when all paid (Moved To / Married away allowed)', async () => {
    vi.mocked(feesApi.getPersonFeeHistory).mockResolvedValue({
      data: {
        dues: [
          due({
            id: 'm1',
            year: 2026,
            amountDue: 1000,
            amountPaid: 1000,
            paid: true,
          }),
        ],
        payments: [],
      },
    });
    const result = await checkPersonOutstandingDues('p1');
    expect(result).toEqual({ ok: true, items: [] });
  });

  it('fails closed when API errors (must not allow Separated / Married away)', async () => {
    vi.mocked(feesApi.getPersonFeeHistory).mockResolvedValue({
      error: 'Network error',
    });
    const result = await checkPersonOutstandingDues('p1');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Network error');
    }
  });

  it('loadPersonOutstandingDues throws on API error so submit is blocked', async () => {
    vi.mocked(feesApi.getPersonFeeHistory).mockResolvedValue({
      error: 'Server down',
    });
    await expect(loadPersonOutstandingDues('p1')).rejects.toThrow(/Server down/);
  });
});
