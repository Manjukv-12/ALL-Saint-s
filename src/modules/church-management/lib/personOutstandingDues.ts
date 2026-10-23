import { feesApi, type MemberDue } from '@/modules/church-management/api/fees';
import {
  mapClearanceApiItems,
  outstandingFromDuesForClearance,
  type ClearanceDueApiItem,
  type OutstandingDueItem,
} from '@/modules/church-management/lib/duesClearance';

export type { OutstandingDueItem } from '@/modules/church-management/lib/duesClearance';
export {
  dueRemaining,
  totalClearanceOutstanding,
  outstandingFromDuesForClearance,
} from '@/modules/church-management/lib/duesClearance';

export type OutstandingDuesResult =
  | { ok: true; items: OutstandingDueItem[] }
  | { ok: false; error: string };

/** True when any due still has a balance (blocks Married away / Separated / Moved To). */
export function hasOutstandingDues(dues: MemberDue[]): boolean {
  return outstandingFromDuesForClearance(dues).length > 0;
}

/** @deprecated Use outstandingFromDuesForClearance — counts every row including future months. */
export function outstandingFromDues(dues: MemberDue[]): OutstandingDueItem[] {
  return outstandingFromDuesForClearance(dues);
}

/**
 * Load unpaid dues for a person (membership through this month, other dues for current/past years).
 * On API failure returns ok:false so callers block the life-status change (fail closed).
 */
export async function checkPersonOutstandingDues(
  personId: string
): Promise<OutstandingDuesResult> {
  const res = await feesApi.getPersonFeeHistory(personId);
  if (res.error || !res.data) {
    return {
      ok: false,
      error: res.error || 'Could not check dues. Complete dues check before continuing.',
    };
  }
  const payload = res.data as
    | MemberDue[]
    | { dues?: MemberDue[]; payments?: unknown; clearance?: ClearanceDueApiItem[] };
  const clearance = Array.isArray(payload) ? undefined : payload.clearance;
  if (clearance !== undefined) {
    return { ok: true, items: mapClearanceApiItems(clearance) };
  }
  const dues = Array.isArray(payload) ? payload : (payload.dues ?? []);
  const items = outstandingFromDuesForClearance(dues);
  const statusRes = await feesApi.getPersonFeeStatus(personId);
  const prev = statusRes.data?.previousDues;
  if (prev?.hasOutstanding && prev.amount && prev.amount >= 0.001) {
    items.unshift({
      id: 'clearance-previous-dues',
      label: prev.label || `Previous dues through ${prev.throughYear}`,
      year: prev.throughYear,
      remaining: Math.round(prev.amount * 100) / 100,
      aggregated: true,
    });
  }
  return { ok: true, items };
}

/** @deprecated Prefer checkPersonOutstandingDues — throws / empty on error was fail-open. */
export async function loadPersonOutstandingDues(
  personId: string
): Promise<OutstandingDueItem[]> {
  const result = await checkPersonOutstandingDues(personId);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.items;
}

export function formatOutstandingSummary(items: OutstandingDueItem[]): string {
  return items
    .map(
      (i) =>
        `${i.label} (₹${i.remaining.toLocaleString('en-IN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })} left)`
    )
    .join('; ');
}

/** Whether a status change to Separated requires a prior dues clearance check. */
export function requiresDuesClearanceForStatusChange(
  fromStatus: string | null | undefined,
  toStatus: string | null | undefined
): boolean {
  return toStatus === 'Separated' && fromStatus !== 'Separated';
}
