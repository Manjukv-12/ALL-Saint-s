import { formatRupee } from '@/modules/church-management/lib/dueAmountValidation';

type Props = {
  paidUntilLabel?: string | null;
  nextDueLabel?: string | null;
  monthlyRate: number;
  toCurrentAmount?: number;
};

/** Plain-language status at top of the pay popup. */
export function MembershipPayStatusStrip({
  paidUntilLabel,
  nextDueLabel,
  monthlyRate,
  toCurrentAmount = 0,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid until</p>
          <p className="mt-1 text-base font-semibold text-emerald-800 dark:text-emerald-200">
            {paidUntilLabel || 'Not started'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Payment starts at
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
            {nextDueLabel || '—'}
          </p>
          {monthlyRate > 0 ? (
            <p className="text-xs text-slate-500">
              {formatRupee(monthlyRate)}/month · oldest unpaid first
            </p>
          ) : (
            <p className="text-xs text-slate-500">Oldest unpaid month first</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Catch up to this month
          </p>
          <p className="mt-1 text-base font-semibold text-amber-900 dark:text-amber-100">
            {toCurrentAmount > 0 ? formatRupee(toCurrentAmount) : 'Up to date'}
          </p>
        </div>
      </div>
    </div>
  );
}
