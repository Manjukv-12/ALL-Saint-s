import type { MemberDue } from '@/modules/church-management/api/fees';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';
import { DueStatusBadge } from '@/modules/church-management/components/fees/DueStatusBadge';
import { dueExcessAmount, formatDueRupee } from '@/modules/church-management/lib/dueExcess';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Props = {
  year: number;
  rows: MemberDue[];
  yearlyDue?: MemberDue | null;
  monthlyRateHint?: number;
  annualRateHint?: number;
  converting?: boolean;
  convertMessage?: string;
  onOpenMonths?: () => void;
  onPayMonth?: (due: MemberDue) => void;
  onEditMonth?: (due: MemberDue) => void;
  onPayYearly?: (due: MemberDue) => void;
};

function monthState(due: MemberDue | undefined): {
  label: string;
  className: string;
  remaining: number;
} {
  if (!due) {
    return {
      label: '—',
      className:
        'border-slate-200 bg-slate-50 text-slate-400 dark:border-zinc-700 dark:bg-zinc-800/50',
      remaining: 0,
    };
  }
  const dueAmt = Math.round(Number(due.amountDue) || 0);
  const paidAmt = Math.round(Number(due.amountPaid) || 0);
  const rem = Math.max(0, dueAmt - paidAmt);
  const excess = dueExcessAmount(due);

  if (due.paid || rem < 1) {
    return {
      label: excess > 0 ? `+${formatDueRupee(excess)}` : 'Paid',
      className:
        'border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-50',
      remaining: 0,
    };
  }
  if (paidAmt > 0) {
    return {
      label: `₹${formatCurrency(rem)}`,
      className:
        'border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-50',
      remaining: rem,
    };
  }
  return {
    label: dueAmt > 0 ? `₹${formatCurrency(dueAmt)}` : 'Due',
    className:
      'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100',
    remaining: rem,
  };
}

export function PersonMembershipMonthGrid({
  year,
  rows,
  yearlyDue = null,
  monthlyRateHint = 0,
  annualRateHint = 0,
  converting = false,
  convertMessage = '',
  onOpenMonths,
  onPayMonth,
  onEditMonth,
  onPayYearly,
}: Props) {
  const byMonth = new Map<number, MemberDue>();
  for (const row of rows) {
    const m = Number(row.month) || 0;
    if (m >= 1 && m <= 12) byMonth.set(m, row);
  }

  const unpaid = rows
    .filter((r) => {
      const rem = Math.max(0, Math.round((Number(r.amountDue) || 0) - (Number(r.amountPaid) || 0)));
      return !r.paid && rem > 0;
    })
    .sort((a, b) => (Number(a.month) || 0) - (Number(b.month) || 0));
  const firstUnpaidMonth = unpaid[0] ? Number(unpaid[0].month) || 0 : 0;
  const firstUnpaidLabel =
    firstUnpaidMonth >= 1 && firstUnpaidMonth <= 12
      ? `${MONTHS[firstUnpaidMonth - 1]} ${year}`
      : null;
  const rate =
    monthlyRateHint ||
    Math.round(Number(rows.find((r) => (Number(r.amountDue) || 0) > 0)?.amountDue) || 0);
  const annual =
    annualRateHint ||
    (rate > 0 ? rate * 12 : 0);

  const yearlyRem = yearlyDue
    ? Math.max(
        0,
        Math.round((Number(yearlyDue.amountDue) || 0) - (Number(yearlyDue.amountPaid) || 0))
      )
    : 0;

  if (rows.length === 0 && yearlyDue && yearlyRem > 0) {
    return (
      <section className={ui.card}>
        <div className="border-b border-slate-200 px-5 py-4 dark:border-zinc-700 sm:px-6">
          <h2 className={ui.sectionTitle}>Membership · {year}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Year membership is on file (not split into months yet).
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Membership due</p>
            <p className="text-sm text-slate-500">
              Due ₹{formatCurrency(yearlyDue.amountDue)} · Paid ₹
              {formatCurrency(yearlyDue.amountPaid)} · Still ₹{formatCurrency(yearlyRem)}
            </p>
            <div className="mt-2">
              <DueStatusBadge due={yearlyDue} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {onOpenMonths ? (
              <button
                type="button"
                className={ui.btnOutline}
                disabled={converting}
                onClick={onOpenMonths}
              >
                {converting ? 'Opening months…' : 'Open month tracker'}
              </button>
            ) : null}
            {onPayYearly ? (
              <button type="button" className={ui.btnPrimary} onClick={() => onPayYearly(yearlyDue)}>
                Pay
              </button>
            ) : null}
          </div>
        </div>
        {convertMessage ? (
          <p
            className={`border-t px-5 py-3 text-sm sm:px-6 ${
              convertMessage.includes('opened') || convertMessage.includes('Opened')
                ? 'border-emerald-200 text-emerald-800'
                : 'border-amber-200 text-amber-900'
            }`}
          >
            {convertMessage}
          </p>
        ) : null}
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <section className={ui.card}>
        <div className="px-5 py-8 text-center sm:px-6">
          <p className="font-medium text-slate-800 dark:text-zinc-100">No membership months yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Apply membership for {year} from All dues, or open the month tracker below.
          </p>
          {onOpenMonths ? (
            <button
              type="button"
              className={`${ui.btnOutline} mt-4`}
              disabled={converting}
              onClick={onOpenMonths}
            >
              {converting ? 'Applying…' : `Apply membership for ${year}`}
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className={ui.card}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-zinc-700 sm:px-6">
        <div>
          <h2 className={ui.sectionTitle}>Membership · {year}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {annual > 0
              ? `Year ₹${formatCurrency(annual)}${rate > 0 ? ` · ₹${formatCurrency(rate)}/month` : ''}`
              : rate > 0
                ? `₹${formatCurrency(rate)}/month`
                : 'Monthly membership'}
            {unpaid.length > 0
              ? ` · ${unpaid.length} month${unpaid.length === 1 ? '' : 's'} still open`
              : ' · All months clear'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Paid
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-300" /> Unpaid
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-300" /> Partial
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
        {MONTHS.map((name, idx) => {
          const month = idx + 1;
          const due = byMonth.get(month);
          const state = monthState(due);
          const isFirstUnpaid = month === firstUnpaidMonth && state.remaining > 0;
          return (
            <button
              key={month}
              type="button"
              disabled={!due}
              title={
                due
                  ? isFirstUnpaid
                    ? `${name} ${year} — payment starts here (oldest unpaid)`
                    : `${name} ${year}`
                  : `${name}: not opened`
              }
              onClick={() => {
                if (!due) return;
                if (state.remaining > 0 && onPayMonth) onPayMonth(due);
                else if (onEditMonth) onEditMonth(due);
              }}
              className={`relative flex min-h-[4.25rem] flex-col items-center justify-center rounded-lg border px-1 py-2 text-center transition ${state.className} ${
                due ? 'cursor-pointer hover:ring-2 hover:ring-slate-300' : 'cursor-default opacity-70'
              } ${isFirstUnpaid ? 'ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-zinc-900' : ''}`}
            >
              {isFirstUnpaid ? (
                <span className="absolute -top-1.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-amber-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  Starts here
                </span>
              ) : null}
              <span className="text-xs font-semibold">{name}</span>
              <span className="mt-0.5 text-[11px] font-medium tabular-nums">{state.label}</span>
            </button>
          );
        })}
      </div>

      {unpaid.length > 0 && onPayMonth ? (
        <div className="border-t border-slate-200 px-5 py-3 dark:border-zinc-700 sm:px-6">
          <p className="text-sm text-slate-600 dark:text-zinc-300">
            Payments always clear the <strong>oldest unpaid month first</strong>
            {firstUnpaidLabel ? (
              <>
                {' '}
                (this year: <strong>{firstUnpaidLabel}</strong>)
              </>
            ) : null}
            . Tap any unpaid month to collect — money still starts there, then rolls forward. Use{' '}
            <strong>Record payment</strong> to pay several months at once.
          </p>
          {convertMessage ? (
            <p className="mt-2 text-sm text-emerald-800">{convertMessage}</p>
          ) : null}
        </div>
      ) : convertMessage ? (
        <div className="border-t border-slate-200 px-5 py-3 dark:border-zinc-700 sm:px-6">
          <p className="text-sm text-emerald-800">{convertMessage}</p>
        </div>
      ) : null}
    </section>
  );
}
