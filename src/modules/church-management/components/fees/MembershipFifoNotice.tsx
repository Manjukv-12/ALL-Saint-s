type Props = {
  /** Month the user opened / tapped (e.g. Dec 2025). */
  openedLabel: string;
  /** Oldest unpaid month where payment actually starts. */
  appliesFromLabel: string;
  /** When false, opened month is already the next due — show the short rule only. */
  mismatch?: boolean;
  className?: string;
};

import { FEES_SYSTEM_START_YEAR, PREVIOUS_DUES_THROUGH_YEAR } from '@/modules/church-management/lib/feesYearPolicy';

/**
 * Explains that membership payments clear the oldest unpaid month from
 * FEES_SYSTEM_START_YEAR onward (FIFO), even if the user opened a later month.
 */
export function MembershipFifoNotice({
  openedLabel,
  appliesFromLabel,
  mismatch = true,
  className = '',
}: Props) {
  if (mismatch) {
    return (
      <div
        role="status"
        className={`rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-50 ${className}`}
      >
        <p className="font-semibold">Payment starts at the oldest unpaid month</p>
        <p className="mt-1.5 leading-relaxed">
          You opened <strong>{openedLabel}</strong>, but this amount will clear{' '}
          <strong>{appliesFromLabel}</strong> first ({FEES_SYSTEM_START_YEAR}+ fee rows only).
          Any leftover continues to later months in order — it does not jump straight to{' '}
          {openedLabel}. Balances through {PREVIOUS_DUES_THROUGH_YEAR} stay on the member profile.
        </p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={`rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200 ${className}`}
    >
      <p className="leading-relaxed">
        Membership payments clear {FEES_SYSTEM_START_YEAR}+ months in order, starting at{' '}
        <strong>{appliesFromLabel}</strong>. Extra amount rolls forward to later months.
        Older balances (through {PREVIOUS_DUES_THROUGH_YEAR}) are on the member profile.
      </p>
    </div>
  );
}
