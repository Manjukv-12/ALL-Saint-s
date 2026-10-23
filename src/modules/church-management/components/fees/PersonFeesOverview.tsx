import { History } from 'lucide-react';
import type { MembershipFeeStatus } from '@/modules/church-management/api/fees';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';
import { PreviousDuesStatusChip } from '@/modules/church-management/components/fees/PreviousDuesStatusChip';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  memberName: string;
  year: number;
  yearOptions: number[];
  status: MembershipFeeStatus | null;
  membershipOutstanding: number;
  otherOutstanding: number;
  collected: number;
  annualRate?: number;
  monthlyRate?: number;
  onYearChange: (year: number) => void;
  onRefresh: () => void;
  onPay?: () => void;
  onPayAll?: () => void;
  payAllLabel?: string;
  onPayPreviousDues?: () => void;
  onHistory: () => void;
  onToggleAdd: () => void;
  showAdd: boolean;
};

/** Compact hero: owe vs year rate + primary actions. */
export function PersonFeesOverview({
  memberName,
  year,
  yearOptions,
  status,
  membershipOutstanding,
  otherOutstanding,
  collected,
  annualRate = 0,
  monthlyRate = 0,
  onYearChange,
  onRefresh,
  onPay,
  onPayAll,
  payAllLabel,
  onPayPreviousDues,
  onHistory,
  onToggleAdd,
  showAdd,
}: Props) {
  const totalDue = membershipOutstanding + otherOutstanding;
  const clear = totalDue < 0.001;
  const paidUntil = status?.paidUntilLabel ?? null;
  const nextLabel = status?.nextDueMonth?.label
    ? status.nextDueMonth.label
    : status?.nextDueMonth?.month
      ? `${new Date(2000, status.nextDueMonth.month - 1, 1).toLocaleString('en-IN', {
          month: 'short',
        })} ${status.nextDueMonth.year}`
      : null;
  const yearRate =
    annualRate > 0
      ? annualRate
      : Math.round(Number(status?.yearRates?.[year] ?? status?.annualRate ?? 0));
  const monthRate =
    monthlyRate > 0
      ? monthlyRate
      : yearRate > 0
        ? Math.max(1, Math.round(yearRate / 12))
        : 0;
  const progressPct =
    yearRate > 0 ? Math.min(100, Math.round((collected / yearRate) * 100)) : collected > 0 ? 100 : 0;
  const yearShortfall = yearRate > 0 ? Math.max(0, yearRate - collected) : 0;
  const previousDues = status?.previousDues;

  return (
    <section className={`${ui.card} overflow-hidden`}>
      <div
        className={`border-b px-5 py-5 sm:px-6 ${
          clear
            ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30'
            : 'border-slate-200 bg-slate-50/90 dark:border-zinc-800 dark:bg-zinc-900/60'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {memberName}
            </p>
            {clear ? (
              <>
                <p className="mt-1 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
                  Up to date
                </p>
                <p className="mt-1 text-sm text-emerald-800/85 dark:text-emerald-200/80">
                  {paidUntil
                    ? `Membership paid until ${paidUntil}`
                    : `Nothing due for ${year} in this view`}
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                  ₹{formatCurrency(totalDue)}
                  <span className="ml-2 text-base font-medium text-slate-500">due now</span>
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-zinc-300">
                  {[
                    membershipOutstanding > 0
                      ? `Membership ₹${formatCurrency(membershipOutstanding)}`
                      : null,
                    otherOutstanding > 0
                      ? `Other ₹${formatCurrency(otherOutstanding)}`
                      : null,
                    paidUntil ? `Paid until ${paidUntil}` : null,
                    nextLabel ? `Next ${nextLabel}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </>
            )}
            {previousDues ? (
              <div className="mt-3">
                <PreviousDuesStatusChip
                  hasPreviousDues={previousDues.hasOutstanding}
                  amount={previousDues.amount}
                  throughYear={previousDues.throughYear}
                />
                {previousDues.notes ? (
                  <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
                    Profile note: {previousDues.notes}
                  </p>
                ) : null}
                {previousDues.hasOutstanding && onPayPreviousDues ? (
                  <button
                    type="button"
                    className={`${ui.btnOutline} mt-2 px-3 py-1.5 text-sm`}
                    onClick={onPayPreviousDues}
                  >
                    Pay / clear previous dues
                    {previousDues.amount ? ` (₹${formatCurrency(previousDues.amount)})` : ''}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {onPayAll ? (
            <button
              type="button"
              className={`${ui.btnPrimary} shrink-0 px-5 py-3 text-base`}
              onClick={onPayAll}
            >
              {payAllLabel || 'Pay all due now'}
            </button>
          ) : onPay ? (
            <button
              type="button"
              className={`${ui.btnPrimary} shrink-0 px-5 py-3 text-base`}
              onClick={onPay}
            >
              Record payment
            </button>
          ) : null}
        </div>

        {/* Year membership story */}
        {yearRate > 0 ? (
          <div className="mt-5 rounded-lg border border-slate-200/80 bg-white/90 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950/50">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {year} membership rate
                </p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-slate-900 dark:text-white">
                  ₹{formatCurrency(yearRate)}
                  {monthRate > 0 ? (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      · ₹{formatCurrency(monthRate)}/mo
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Collected
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800 dark:text-zinc-100">
                  ₹{formatCurrency(collected)}
                  <span className="ml-1 text-xs font-normal text-slate-500">of ₹{formatCurrency(yearRate)}</span>
                </p>
              </div>
            </div>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${year} membership collected`}
            >
              <div
                className={`h-full rounded-full transition-all ${
                  progressPct >= 100 ? 'bg-emerald-500' : 'bg-[hsl(var(--primary))]'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {!clear && yearShortfall > 0 ? (
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400">
                Still ₹{formatCurrency(yearShortfall)} toward the {year} membership total
                {membershipOutstanding > 0 && membershipOutstanding < yearShortfall
                  ? ` (₹${formatCurrency(membershipOutstanding)} due through this month)`
                  : ''}
                .
              </p>
            ) : clear && collected + 0.001 >= yearRate ? (
              <p className="mt-2 text-xs text-emerald-800 dark:text-emerald-200/90">
                Full {year} membership amount collected.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 text-right sm:mt-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Collected {year}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-slate-800 dark:text-zinc-100">
              ₹{formatCurrency(collected)}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 py-4 sm:px-6">
        <div className="mr-1 flex flex-wrap items-center gap-1.5" role="group" aria-label="Year">
          {[...yearOptions]
            .filter((y) => Math.abs(y - year) <= 1 || y === year)
            .sort((a, b) => a - b)
            .map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => onYearChange(y)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums transition ${
                  y === year
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {y}
              </button>
            ))}
          <select
            id="person-fees-year"
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className={`${ui.select} py-1.5 text-sm`}
            aria-label="All years"
            title="More years"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={`${ui.btnOutline} inline-flex items-center gap-2`}
          onClick={onHistory}
        >
          <History className="h-4 w-4" aria-hidden />
          History
        </button>
        <button type="button" className={ui.btnOutline} onClick={onToggleAdd}>
          {showAdd ? 'Hide add due' : 'Add due'}
        </button>
        <button type="button" className={ui.btnGhost} onClick={onRefresh}>
          Refresh
        </button>
      </div>
    </section>
  );
}
