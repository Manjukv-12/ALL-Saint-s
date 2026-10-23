import { formatRupee } from '@/modules/church-management/lib/dueAmountValidation';
import type {
  CoverageMonth,
  MembershipCoveragePreview,
  MonthPayStatus,
} from '@/modules/church-management/lib/membershipCoverage';

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

type Props = {
  coverage: MembershipCoveragePreview | null;
};

function cellStyle(
  year: number,
  month: number,
  hit: CoverageMonth | undefined
): { className: string; sub: string; title: string } {
  const label = `${MONTH_SHORT[month - 1]} ${year}`;
  const status: MonthPayStatus = hit?.status ?? 'future';

  if (status === 'cover-full') {
    return {
      className:
        'border-emerald-400 bg-emerald-100 text-emerald-950 dark:border-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-50',
      sub: formatRupee(hit!.applied),
      title: `${label}: this payment covers full month (${formatRupee(hit!.applied)})`,
    };
  }
  if (status === 'cover-partial') {
    return {
      className:
        'border-amber-400 bg-amber-100 text-amber-950 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-50',
      sub: `${formatRupee(hit!.applied)}*`,
      title: `${label}: partial ${formatRupee(hit!.applied)} of ${formatRupee(hit!.due)} — pending`,
    };
  }
  if (status === 'pending') {
    return {
      className:
        'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100',
      sub: hit && hit.due > 0 ? formatRupee(hit.due) : 'Due',
      title: `${label}: pending / unpaid`,
    };
  }
  if (status === 'paid') {
    return {
      className:
        'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100',
      sub: 'Paid',
      title: `${label}: already paid`,
    };
  }
  return {
    className:
      'border-slate-200 bg-slate-50 text-slate-400 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-500',
    sub: '',
    title: `${label}: future`,
  };
}

/** Full-year grids: pending (unpaid) months + how the typed amount splits. */
export function MembershipCoverageTimeline({ coverage }: Props) {
  if (!coverage || coverage.groups.length === 0) return null;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            Month tracker
          </p>
          {coverage.pendingRangeLabel ? (
            <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
              Unpaid: {coverage.pendingRangeLabel}
              {coverage.pendingMonths > 0
                ? ` · ${coverage.pendingMonths} month${coverage.pendingMonths === 1 ? '' : 's'}`
                : ''}
            </p>
          ) : coverage.rangeLabel ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-300">
              {coverage.rangeLabel}
            </p>
          ) : null}
        </div>
        {coverage.paidUntilLabel ? (
          <p className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100">
            This pay until {coverage.paidUntilLabel}
          </p>
        ) : null}
      </div>

      <div className="space-y-5">
        {coverage.groups.map((g) => {
          const byMonth = new Map(g.months.map((m) => [m.month, m]));
          return (
            <div key={g.year}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center rounded-lg px-3 py-1.5 text-base font-bold shadow-sm"
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  {g.year}
                </span>
                <span className="text-sm text-slate-600 dark:text-zinc-300">
                  Year rate {formatRupee(g.annualRate)} · {formatRupee(g.monthlyRate)}/mo
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const hit = byMonth.get(month);
                  const cell = cellStyle(g.year, month, hit);
                  const active =
                    hit?.status === 'cover-full' ||
                    hit?.status === 'cover-partial' ||
                    hit?.status === 'pending';
                  return (
                    <div
                      key={`${g.year}-${month}`}
                      title={cell.title}
                      className={`flex flex-col items-center justify-center rounded-lg border px-1 py-2 text-center ${cell.className} ${
                        active ? 'shadow-sm' : ''
                      }`}
                    >
                      <span className="text-xs font-bold tracking-wide">
                        {MONTH_SHORT[month - 1]}
                      </span>
                      {cell.sub ? (
                        <span className="mt-0.5 text-[10px] font-medium tabular-nums leading-tight">
                          {cell.sub}
                        </span>
                      ) : (
                        <span className="mt-0.5 text-[10px] opacity-40">·</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-emerald-400 bg-emerald-100" /> Covered
          (this pay)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-amber-400 bg-amber-100" /> Partial /
          pending (*)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-rose-300 bg-rose-50" /> Pending (unpaid)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-sky-300 bg-sky-50" /> Already paid
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-slate-200 bg-slate-50" /> Future
        </span>
      </div>

      {coverage.summary ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100">
          {coverage.summary}
        </p>
      ) : null}
    </div>
  );
}
