import {
  FEES_SYSTEM_START_YEAR,
  PREVIOUS_DUES_THROUGH_YEAR,
} from '@/modules/church-management/lib/feesYearPolicy';
import { feesYearSplitNotice } from '@/modules/church-management/lib/previousDues';

type Props = {
  className?: string;
  compact?: boolean;
};

/** Explains 2025-and-earlier (profile) vs 2026+ (fee rows). */
export function FeesYearPolicyNotice({ className = '', compact = false }: Props) {
  if (compact) {
    return (
      <p className={`text-xs text-slate-600 dark:text-zinc-400 ${className}`}>
        {feesYearSplitNotice()}
      </p>
    );
  }

  return (
    <div
      className={`rounded-lg border border-blue-200 bg-blue-50/90 px-4 py-3 text-sm text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/25 dark:text-blue-100 ${className}`}
    >
      <p className="font-semibold">How years are tracked</p>
      <p className="mt-1 leading-relaxed text-blue-900/90 dark:text-blue-100/90">
        {feesYearSplitNotice()} Use{' '}
        <strong>Previous dues till {PREVIOUS_DUES_THROUGH_YEAR}</strong> to see who still has an
        older balance on file. When a member has no previous dues marked, they are treated as{' '}
        <strong>covered through {PREVIOUS_DUES_THROUGH_YEAR}</strong>.
      </p>
      <p className="mt-2 text-xs text-blue-800/80 dark:text-blue-200/80">
        Current fee rows and filters start from {FEES_SYSTEM_START_YEAR}.
      </p>
    </div>
  );
}
