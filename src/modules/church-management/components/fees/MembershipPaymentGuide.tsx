import { formatRupee } from '@/modules/church-management/lib/dueAmountValidation';
import { MembershipCoverageTimeline } from '@/modules/church-management/components/fees/MembershipCoverageTimeline';
import type { MembershipCoveragePreview } from '@/modules/church-management/lib/membershipCoverage';

export type MembershipPayChoice = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  primary?: boolean;
};

/** Plain-language outcome for the amount the user is about to pay. */
export function membershipPaymentPlainSummary(
  amountPaid: number,
  monthlyRate: number,
  opts?: {
    completeYearAmount?: number | null;
    completeYearLabel?: string | null;
    finishMonthAmount?: number | null;
    finishMonthLabel?: string | null;
    coverageUntil?: string | null;
  }
): string {
  const paid = Math.round(amountPaid);
  const rate = Math.round(monthlyRate);
  if (paid < 1 || rate < 1) return '';

  const finishMonth = opts?.finishMonthAmount != null ? Math.round(opts.finishMonthAmount) : null;
  const finishYear = opts?.completeYearAmount != null ? Math.round(opts.completeYearAmount) : null;

  if (finishMonth != null && finishMonth > 0 && paid === finishMonth && opts?.finishMonthLabel) {
    return `This finishes ${opts.finishMonthLabel}.`;
  }
  if (finishYear != null && finishYear > 0 && paid === finishYear && opts?.completeYearLabel) {
    return `This pays membership through the end of ${opts.completeYearLabel}.`;
  }
  if (opts?.coverageUntil) {
    return `This covers membership until ${opts.coverageUntil}.`;
  }

  const months = Math.max(1, Math.floor(paid / rate));
  if (paid < rate) {
    return `This is a part payment toward the current month.`;
  }
  if (months === 1 && paid <= rate * 1.5) {
    return `This covers about 1 month. Any small extra is kept for the next month.`;
  }
  return `This covers about ${months} months of membership.`;
}

type Props = {
  choices: MembershipPayChoice[];
  selectedAmount: number;
  summary: string;
  paidUntilLabel?: string | null;
  coverage?: MembershipCoveragePreview | null;
  showTimeline?: boolean;
  onPick: (amount: number) => void;
  onToggleTimeline?: () => void;
};

/** Simple “what do you want to do?” guide for membership payments. */
export function MembershipPaymentGuide({
  choices,
  selectedAmount,
  summary,
  paidUntilLabel,
  coverage,
  showTimeline = true,
  onPick,
  onToggleTimeline,
}: Props) {
  return (
    <div className="space-y-3">
      {paidUntilLabel ? (
        <p className="text-sm text-slate-600 dark:text-zinc-300">
          Already paid until <strong>{paidUntilLabel}</strong>. Pick an amount below or type any
          figure — payment always clears the oldest unpaid month first; leftover goes to later months
          (and next year if needed).
        </p>
      ) : (
        <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">
          Choose how much to collect, or type any amount. Payment clears the oldest unpaid month
          first.
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {choices.map((c) => {
          const active = Math.round(selectedAmount) === Math.round(c.amount);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.amount)}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                active
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-400 dark:border-emerald-600 dark:bg-emerald-950/40'
                  : c.primary
                    ? 'border-amber-400 bg-amber-50 hover:border-amber-500 dark:border-amber-700 dark:bg-amber-950/30'
                    : 'border-slate-300 bg-white hover:border-slate-400 dark:border-zinc-600 dark:bg-zinc-900'
              }`}
            >
              <span className="block text-sm font-semibold">{c.title}</span>
              <span className="mt-0.5 block text-xs text-slate-600 dark:text-zinc-400">
                {c.subtitle}
              </span>
              <span className="mt-2 block text-lg font-bold tabular-nums">
                {formatRupee(c.amount)}
              </span>
            </button>
          );
        })}
      </div>

      {onToggleTimeline ? (
        <button
          type="button"
          className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
          onClick={onToggleTimeline}
        >
          {showTimeline ? 'Hide month tracker' : 'Show month tracker'}
        </button>
      ) : null}

      {showTimeline ? <MembershipCoverageTimeline coverage={coverage ?? null} /> : null}

      {summary && !coverage?.summary ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
          {summary}
        </p>
      ) : null}
    </div>
  );
}
