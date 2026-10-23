import { churchMgmtPath } from '@/modules/church-management/paths';

/** Synthetic fee id used in clearance lists and payment routes. */
export const PREVIOUS_DUES_PAYMENT_ID = 'clearance-previous-dues';

export function previousDuesPaymentPath(personId: string): string {
  return churchMgmtPath('fees', 'people', personId, 'pay', PREVIOUS_DUES_PAYMENT_ID);
}

export function isPreviousDuesPaymentId(feeId: string): boolean {
  return feeId === PREVIOUS_DUES_PAYMENT_ID;
}
