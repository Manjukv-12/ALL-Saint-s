import { useMemo, useState } from 'react';
import { CheckCircle2, Users } from 'lucide-react';
import type { DueType } from '@/modules/church-management/api/fees';
import { feesApi } from '@/modules/church-management/api/fees';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  subscription: DueType | undefined;
  onApplied?: () => void;
};

export function ApplyMembershipRateCard({ subscription, onApplied }: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState<{
    created: number;
    updated: number;
    year: number;
    amount: number;
  } | null>(null);

  const amount = subscription?.defaultAmount ?? 0;
  const quickYears = useMemo(() => {
    const current = new Date().getFullYear();
    return [...new Set([current, current - 1])].sort((a, b) => b - a);
  }, []);

  if (!subscription) return null;

  const handleApply = async () => {
    try {
      setGenerating(true);
      setError('');
      const res = await feesApi.generateAllDues(year);
      if (res.error) {
        setError(res.error);
        setLastResult(null);
        return;
      }
      setLastResult({
        created: res.data?.created ?? 0,
        updated: res.data?.updated ?? 0,
        year,
        amount: res.data?.amount ?? amount,
      });
      onApplied?.();
    } catch {
      setError('Could not apply membership rate');
      setLastResult(null);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={ui.card}>
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6 dark:border-zinc-700">
        <p
          className="font-sans text-base font-semibold text-slate-900 dark:text-white"
          style={{ margin: 0 }}
        >
          2. Apply membership rate
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
          Creates monthly <strong>Membership Due</strong> rows for active members aged 18+ from
          <strong> January</strong> through December. Applying the current year also opens last
          year&apos;s months if they were never set up, so unpaid months are collected from the
          first month first. Annual ₹
          {formatCurrency(amount)}
          {amount > 0
            ? ` → due ₹${Math.max(1, Math.round(amount / 12))}/month; suggested round pay ₹${Math.max(50, Math.ceil(Math.max(1, Math.round(amount / 12)) / 50) * 50)} (excess to next months)`
            : ''}
          .
        </p>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-300">Year</p>
          <div className="flex flex-wrap items-center gap-2">
            {quickYears.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setYear(y);
                  setLastResult(null);
                }}
                className={`${ui.btnGhost} min-w-[4.5rem] justify-center ${
                  year === y
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--muted))] font-semibold'
                    : ''
                }`}
              >
                {y}
              </button>
            ))}
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <span className="sr-only">Other year</span>
              <input
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setLastResult(null);
                }}
                className={`${ui.input} w-28`}
                aria-label="Calendar year"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={generating}
            className={`${ui.btnPrimary} inline-flex items-center gap-2`}
          >
            <Users className="h-4 w-4" aria-hidden />
            {generating
              ? 'Applying…'
              : `Apply ₹${formatCurrency(amount)} for ${year}`}
          </button>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Current membership amount: ₹{formatCurrency(amount)}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {lastResult && lastResult.year === year && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="flex items-start gap-2 text-sm text-emerald-900 dark:text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {lastResult.created + lastResult.updated === 0 ? (
                <>
                  Everyone eligible already has ₹{formatCurrency(lastResult.amount)} unpaid dues for{' '}
                  {lastResult.year}. Paid rows are unchanged.
                </>
              ) : (
                <>
                  {lastResult.created > 0 && (
                    <>
                      Added due for <strong>{lastResult.created}</strong> member
                      {lastResult.created === 1 ? '' : 's'}
                    </>
                  )}
                  {lastResult.created > 0 && lastResult.updated > 0 && '; '}
                  {lastResult.updated > 0 && (
                    <>
                      updated <strong>{lastResult.updated}</strong> unpaid row
                      {lastResult.updated === 1 ? '' : 's'} to ₹
                      {formatCurrency(lastResult.amount)}
                    </>
                  )}{' '}
                  for {lastResult.year}.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
