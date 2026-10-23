import { describe, it, expect } from 'vitest';
import { checkAmountDueAgainstPaid } from '@/modules/church-management/lib/dueAmountValidation';

describe('checkAmountDueAgainstPaid', () => {
  it('allows raising amount due above paid', () => {
    expect(checkAmountDueAgainstPaid(1500, 1000).ok).toBe(true);
  });

  it('allows amount due equal to paid', () => {
    expect(checkAmountDueAgainstPaid(1000, 1000).ok).toBe(true);
  });

  it('blocks amount due below paid', () => {
    const res = checkAmountDueAgainstPaid(800, 1000);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/cannot be less/i);
    expect(res.minDue).toBe(1000);
  });

  it('allows any due when nothing paid yet', () => {
    expect(checkAmountDueAgainstPaid(100, 0).ok).toBe(true);
    expect(checkAmountDueAgainstPaid(0, 0).ok).toBe(true);
  });
});
