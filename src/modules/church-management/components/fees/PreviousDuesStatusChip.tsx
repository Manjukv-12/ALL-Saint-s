import {
  previousDuesCoveredLabel,
  previousDuesOutstandingLabel,
} from '@/modules/church-management/lib/previousDues';
import { PREVIOUS_DUES_THROUGH_YEAR } from '@/modules/church-management/lib/feesYearPolicy';

type Props = {
  hasPreviousDues?: boolean;
  amount?: number | null;
  throughYear?: number;
  className?: string;
};

/** One-line previous-dues coverage for member / fee views. */
export function PreviousDuesStatusChip({
  hasPreviousDues,
  amount,
  throughYear = PREVIOUS_DUES_THROUGH_YEAR,
  className = '',
}: Props) {
  if (hasPreviousDues && amount != null && amount > 0) {
    return (
      <span
        className={`inline-flex rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 ${className}`}
        title="Recorded on member profile — edit member to clear when settled"
      >
        {previousDuesOutstandingLabel(amount, throughYear)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100 ${className}`}
      title="No previous-dues balance recorded on profile"
    >
      {previousDuesCoveredLabel(throughYear)}
    </span>
  );
}
