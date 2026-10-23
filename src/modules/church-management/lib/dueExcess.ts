import type { MemberDue } from '@/modules/church-management/api/fees';

/** Paid above the required due amount (overpayment kept on record). */
export function dueExcessAmount(due: Pick<MemberDue, 'amountDue' | 'amountPaid'>): number {
  const dueAmt = Number(due.amountDue) || 0;
  const paid = Number(due.amountPaid) || 0;
  return Math.max(0, Math.round((paid - dueAmt) * 100) / 100);
}

export function formatDueRupee(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
