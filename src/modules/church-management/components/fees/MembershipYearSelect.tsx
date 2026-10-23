import { useMemo } from 'react';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import {
  isValidMembershipYear,
  membershipYearBounds,
  membershipYearOptions,
} from '@/modules/church-management/lib/membershipYear';
import { FEES_SYSTEM_START_YEAR } from '@/modules/church-management/lib/feesYearPolicy';

type Props = {
  value: number;
  onChange: (year: number) => void;
  /** Show Last / This / Next year chips */
  showQuickYears?: boolean;
};

export function MembershipYearSelect({
  value,
  onChange,
  showQuickYears = true,
}: Props) {
  const anchor = new Date().getFullYear();
  const options = useMemo(() => membershipYearOptions(anchor), [anchor]);
  const { min, max } = membershipYearBounds(anchor);

  const quickYears = useMemo(
    () =>
      [anchor - 1, anchor, anchor + 1].filter(
        (y) => y >= FEES_SYSTEM_START_YEAR && isValidMembershipYear(y, anchor)
      ),
    [anchor]
  );

  const valueInQuick = quickYears.includes(value);

  return (
    <div className="space-y-3">
      {showQuickYears ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick year">
          {quickYears.map((y) => {
            const active = value === y;
            const label =
              y === anchor ? 'This year' : y === anchor - 1 ? 'Last year' : 'Next year';
            return (
              <button
                key={y}
                type="button"
                onClick={() => onChange(y)}
                className={`min-w-[6.5rem] rounded-lg border px-4 py-3 text-left transition ${
                  active
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
                }`}
              >
                <span className="block text-lg font-semibold tabular-nums">{y}</span>
                <span className={`block text-xs ${active ? 'text-white/80' : 'text-slate-500'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Other years only — avoids duplicating the quick chips above */}
      <label className="block max-w-xs">
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300">
          {valueInQuick ? 'Or another year' : 'Year'}
        </span>
        <select
          value={isValidMembershipYear(value, anchor) ? value : anchor}
          onChange={(e) => onChange(Number(e.target.value))}
          className={ui.select}
          aria-label="Membership year"
        >
          {options.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Valid range: {min}–{max} · fee rows from {FEES_SYSTEM_START_YEAR} onward only
        </p>
      </label>
    </div>
  );
}

/** Step number badge — white on primary (global CSS overrides plain text-white). */
export function MembershipStepBadge({ step }: { step: number }) {
  return (
    <span
      className="cm-step-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold"
      style={{ color: '#ffffff' }}
      aria-hidden
    >
      {step}
    </span>
  );
}
