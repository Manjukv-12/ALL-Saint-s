import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { feesApi, type YearFeeCompletion } from '@/modules/church-management/api/fees';
import { ui } from './familyDetailTheme';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  personId: string;
  memberName: string;
  year: number;
  onYearChange: (year: number) => void;
  /** Change after save/reload so completion badges refresh. */
  refreshKey?: string | number;
};

/** Last-two-years dropdown: show if membership + other fees are finished for that year. */
export function PersonYearFeeCompletion({
  personId,
  memberName,
  year,
  onYearChange,
  refreshKey = 0,
}: Props) {
  const recentYears = useMemo(() => {
    const y = new Date().getFullYear();
    return [y, y - 1];
  }, []);

  const [completions, setCompletions] = useState<YearFeeCompletion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const res = await feesApi.getPersonFeeStatus(personId, recentYears[0]);
      if (cancelled) return;
      const list = res.data?.yearCompletions ?? [];
      setCompletions(Array.isArray(list) ? list : []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [personId, recentYears, refreshKey]);

  const selected =
    completions.find((c) => c.year === year) ??
    completions.find((c) => c.year === recentYears[0]) ??
    null;

  const displayYear = selected?.year ?? year;

  return (
    <div className="border-t border-slate-200 px-5 py-4 dark:border-zinc-700 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
            Year completion — {memberName}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Check if this person finished membership and other fees for a year (this year and last
            year).
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-zinc-300">
          Year
          <select
            className={`${ui.select} min-w-[7rem]`}
            value={recentYears.includes(year) ? year : recentYears[0]}
            onChange={(e) => onYearChange(Number(e.target.value))}
            aria-label="Fee completion year"
          >
            {recentYears.map((y) => {
              const row = completions.find((c) => c.year === y);
              const mark = row?.allComplete ? '✓' : '…';
              return (
                <option key={y} value={y}>
                  {y} {row ? mark : ''}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      {loading && !selected ? (
        <p className="mt-3 text-sm text-slate-500">Checking fees…</p>
      ) : selected ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatusTile
            title="Membership"
            ok={selected.membershipComplete}
            na={!selected.membershipApplicable}
            detail={
              !selected.membershipApplicable
                ? 'Not applicable'
                : selected.membershipComplete
                  ? selected.membershipPaidThrough?.label
                    ? `Paid through ${selected.membershipPaidThrough.label}`
                    : 'Year complete'
                  : selected.membershipOutstanding > 0
                    ? `₹${formatCurrency(selected.membershipOutstanding)} still due`
                    : 'Year not finished'
            }
          />
          <StatusTile
            title="Other fees"
            ok={selected.otherFeesComplete}
            detail={
              selected.otherFeesCount === 0
                ? 'No other fees this year'
                : selected.otherFeesComplete
                  ? 'All paid'
                  : `₹${formatCurrency(selected.otherFeesOutstanding)} still due`
            }
          />
          <StatusTile
            title={`${displayYear} overall`}
            ok={selected.allComplete}
            detail={selected.label}
            emphasize
          />
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Could not load year status.</p>
      )}
    </div>
  );
}

function StatusTile({
  title,
  ok,
  detail,
  na,
  emphasize,
}: {
  title: string;
  ok: boolean;
  detail: string;
  na?: boolean;
  emphasize?: boolean;
}) {
  const done = na ? true : ok;
  return (
    <div
      className={`rounded-lg border px-3 py-3 ${
        done
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
          : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
      } ${emphasize ? 'sm:col-span-1' : ''}`}
    >
      <div className="flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <CircleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      </div>
      <p
        className={`mt-1 text-sm font-medium ${
          done ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-100'
        }`}
      >
        {na ? '—' : done ? 'Completed' : 'Pending'}
      </p>
      <p className="mt-0.5 text-xs text-slate-600 dark:text-zinc-400">{detail}</p>
    </div>
  );
}
