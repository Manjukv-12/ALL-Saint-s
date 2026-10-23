import { useEffect, useState } from 'react';
import {
  checkPersonOutstandingDues,
  totalClearanceOutstanding,
  type OutstandingDueItem,
} from '@/modules/church-management/lib/personOutstandingDues';
import { PREVIOUS_DUES_THROUGH_YEAR } from '@/modules/church-management/lib/feesYearPolicy';

function formatInr(amount: number): string {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export type DuesClearanceAction = 'split' | 'married_away' | 'status_separated';

interface PersonDuesClearanceNoticeProps {
  personId: string;
  personName: string;
  action: DuesClearanceAction;
  onHasOutstandingChange?: (hasOutstanding: boolean) => void;
  onGoCompleteDues?: () => void;
}

const COPY: Record<
  DuesClearanceAction,
  { titleBlocked: string; titleClear: string; body: string }
> = {
  split: {
    titleBlocked: 'Please complete all dues before splitting',
    titleClear: 'Dues clear — you can continue',
    body: `Includes previous dues through ${PREVIOUS_DUES_THROUGH_YEAR} on the profile plus fee rows through this month. Pay each open balance below.`,
  },
  married_away: {
    titleBlocked: 'Please complete all dues before married away',
    titleClear: 'Dues clear — you can continue',
    body: `Includes previous dues through ${PREVIOUS_DUES_THROUGH_YEAR} and fee rows through this month. Pay every open balance first, then you can mark her as Separated (married away).`,
  },
  status_separated: {
    titleBlocked: 'Please complete all dues before Separated',
    titleClear: 'Dues clear — you can continue',
    body: `Includes previous dues through ${PREVIOUS_DUES_THROUGH_YEAR} and fee rows through this month. Every open balance must be cleared first.`,
  },
};

export function PersonDuesClearanceNotice({
  personId,
  personName,
  action,
  onHasOutstandingChange,
  onGoCompleteDues,
}: PersonDuesClearanceNoticeProps) {
  const [loading, setLoading] = useState(true);
  const [outstanding, setOutstanding] = useState<OutstandingDueItem[]>([]);
  const [checkError, setCheckError] = useState('');
  const copy = COPY[action];

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setCheckError('');
      try {
        const result = await checkPersonOutstandingDues(personId);
        if (cancelled) return;
        if (!result.ok) {
          setOutstanding([]);
          setCheckError(result.error);
          // Fail closed: treat as blocked until dues can be verified.
          onHasOutstandingChange?.(true);
          return;
        }
        setOutstanding(result.items);
        onHasOutstandingChange?.(result.items.length > 0);
      } catch {
        if (!cancelled) {
          setOutstanding([]);
          setCheckError('Could not check dues. Try again before continuing.');
          onHasOutstandingChange?.(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid re-fetch loops from callback identity
  }, [personId]);

  const hasUnpaid = outstanding.length > 0 || !!checkError;

  return (
    <div
      className={
        hasUnpaid
          ? 'rounded-lg border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'
          : 'rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20'
      }
    >
      <p
        className={
          hasUnpaid
            ? 'text-sm font-semibold text-red-900 dark:text-red-200'
            : 'text-sm font-semibold text-amber-900 dark:text-amber-200'
        }
      >
        {hasUnpaid ? copy.titleBlocked : copy.titleClear}
      </p>
      <p
        className={
          hasUnpaid
            ? 'mt-1 text-xs leading-relaxed text-red-800 dark:text-red-300'
            : 'mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-200'
        }
      >
        {copy.body}
      </p>

      {loading ? (
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">Checking dues…</p>
      ) : checkError ? (
        <p className="mt-2 text-xs font-medium text-red-900 dark:text-red-200">{checkError}</p>
      ) : outstanding.length > 0 ? (
        <>
          <p className="mt-2 text-xs text-red-800 dark:text-red-300">
            Total due now: ₹{formatInr(totalClearanceOutstanding(outstanding))}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-red-900 dark:text-red-200">
            {outstanding.map((item) => (
              <li key={item.id}>
                • {item.label} — ₹{formatInr(item.remaining)} left
              </li>
            ))}
          </ul>
          {onGoCompleteDues && (
            <button
              type="button"
              onClick={onGoCompleteDues}
              className="mt-3 inline-flex items-center rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
            >
              Pay all due now (₹{formatInr(totalClearanceOutstanding(outstanding))}) for {personName}
            </button>
          )}
        </>
      ) : (
        <p className="mt-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          No unpaid dues found for {personName}. You can continue.
        </p>
      )}
    </div>
  );
}
