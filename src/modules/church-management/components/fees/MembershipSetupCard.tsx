import { useMemo } from 'react';
import { CheckCircle2, Users } from 'lucide-react';
import type { DueType } from '@/modules/church-management/api/fees';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export type MembershipSetupResult = {
  created: number;
  updated: number;
  year: number;
  amount: number;
};

type Props = {
  dueTypes: DueType[];
  year: number;
  generating: boolean;
  lastResult: MembershipSetupResult | null;
  onYearChange: (year: number) => void;
  onSetup: () => void;
  onEditAmount: () => void;
  onShowUnpaid: () => void;
};

export function MembershipSetupCard({
  dueTypes,
  year,
  generating,
  lastResult,
  onYearChange,
  onSetup,
  onEditAmount,
  onShowUnpaid,
}: Props) {
  const subscription = useMemo(
    () => dueTypes.find((d) => d.code === 'SUBSCRIPTION'),
    [dueTypes]
  );
  const amount = subscription?.defaultAmount ?? 1000;
  const quickYears = useMemo(() => {
    const current = new Date().getFullYear();
    return [...new Set([current, current - 1, 2025, 2026])].sort((a, b) => b - a);
  }, []);

  return (
    <div className={`${ui.card} ${ui.sectionBody}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className={ui.sectionTitle}>Add yearly membership due</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
            One click adds <strong>₹{formatCurrency(amount)}</strong> for each{' '}
            <strong>active member aged 18+</strong> (with date of birth). Deceased and separated
            members are skipped. Then mark each row as paid when they settle.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickYears.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => onYearChange(y)}
              className={`${ui.btnGhost} ${year === y ? 'border-[hsl(var(--primary))] bg-[hsl(var(--muted))]' : ''}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
        <li>
          <strong>1.</strong> Choose the calendar year (e.g. 2025 or 2026).
        </li>
        <li>
          <strong>2.</strong> Click the button below — every eligible member gets one due row for
          that year.
        </li>
        <li>
          <strong>3.</strong> In the list below, use <strong>Record payment</strong> when someone
          pays.
        </li>
      </ol>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Year</span>
          <input
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className={`${ui.input} mt-1 w-28`}
          />
        </label>
        <button
          type="button"
          onClick={onSetup}
          disabled={generating}
          className={`${ui.btnPrimary} inline-flex items-center gap-2`}
        >
          <Users className="h-4 w-4" aria-hidden />
          {generating
            ? 'Adding dues…'
            : `Add ₹${formatCurrency(amount)} due for all 18+ members — ${year}`}
        </button>
        <button type="button" onClick={onEditAmount} className={ui.btnOutline}>
          Change amount (Due types)
        </button>
      </div>

      {lastResult && lastResult.year === year && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="flex items-start gap-2 text-sm text-emerald-900 dark:text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {lastResult.created + lastResult.updated === 0 ? (
              <>
                All eligible members already have ₹{formatCurrency(lastResult.amount)} dues for{' '}
                {lastResult.year}.
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
                    {lastResult.updated === 1 ? '' : 's'}
                  </>
                )}{' '}
                at ₹{formatCurrency(lastResult.amount)} for {lastResult.year}.
              </>
            )}
          </p>
          <button type="button" onClick={onShowUnpaid} className={ui.btnOutline}>
            Show unpaid only
          </button>
        </div>
      )}
    </div>
  );
}
