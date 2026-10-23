import { useEffect, useMemo, useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';
import { cmScrollableAlertDialogClass } from '@/modules/church-management/components/cmScrollableDialog';
import {
  checkDueAmount,
  checkPaymentAmount,
  checkWholeMonthPayment,
  formatRupee,
  paymentHintClass,
  type PaymentAmountCheck,
} from '@/modules/church-management/lib/dueAmountValidation';
import { AmountNumberInput } from './AmountNumberInput';

type SummaryRow = { label: string; value: string };

type Props = {
  open: boolean;
  mode: 'add' | 'payment';
  title: string;
  amount: number;
  expectedAmount?: number | null;
  amountDue?: number;
  alreadyPaid?: number;
  /** Membership installments can exceed one month — use month-unit checks, not "remaining due". */
  membershipMonthlyRate?: number | null;
  rows: SummaryRow[];
  /** Extra awareness note (e.g. FIFO membership allocation). */
  notice?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDueAmountDialog({
  open,
  mode,
  title,
  amount,
  expectedAmount,
  amountDue = 0,
  alreadyPaid = 0,
  membershipMonthlyRate = null,
  rows,
  notice,
  confirmLabel = 'Confirm',
  onCancel,
  onConfirm,
}: Props) {
  const [reenter, setReenter] = useState('');

  const check = useMemo(() => {
    if (mode === 'payment' && membershipMonthlyRate != null && membershipMonthlyRate > 0) {
      return checkWholeMonthPayment(amount, membershipMonthlyRate);
    }
    if (mode === 'payment') {
      return checkPaymentAmount(amount, amountDue, alreadyPaid);
    }
    return checkDueAmount(amount, expectedAmount);
  }, [mode, amount, expectedAmount, amountDue, alreadyPaid, membershipMonthlyRate]);

  useEffect(() => {
    if (open) setReenter('');
  }, [open, amount]);

  const reentryOk = !check.needsReentry || reenter.trim() === String(amount);
  const paymentLevel =
    mode === 'payment' ? (check as PaymentAmountCheck).level : undefined;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent
        className={`${cmScrollableAlertDialogClass} max-w-lg border-[hsl(var(--primary))]/25 shadow-[0_24px_64px_-16px_rgba(30,58,95,0.35)] sm:rounded-md`}
      >
        {/* Classic navy masthead */}
        <AlertDialogHeader className="relative shrink-0 space-y-0 overflow-hidden border-0 bg-[hsl(var(--primary))] px-6 pb-5 pt-5 text-left sm:px-8 sm:pb-6 sm:pt-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
            {mode === 'payment' ? 'Payment review' : 'Due review'}
          </p>
          <AlertDialogTitle className="mt-1 font-serif text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 max-w-md text-[15px] leading-relaxed text-white/75">
            Review the details below before saving. Wrong amounts are hard to fix later.
          </AlertDialogDescription>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent sm:inset-x-8"
          />
        </AlertDialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[#faf8f5] px-6 py-6 dark:bg-zinc-900 sm:px-8">
          {/* Ledger-style summary */}
          <div className="overflow-hidden rounded-sm border border-[hsl(var(--primary))]/15 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-950/40">
            <div className="flex items-center gap-3 border-b border-[hsl(var(--primary))]/10 bg-[hsl(var(--primary))]/[0.04] px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800/50">
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-r from-transparent to-[hsl(var(--primary))]/25"
              />
              <span className="font-serif text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))] dark:text-zinc-300">
                Particulars
              </span>
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-l from-transparent to-[hsl(var(--primary))]/25"
              />
            </div>
            <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
                >
                  <dt className="text-[13px] font-medium uppercase tracking-[0.06em] text-slate-500 dark:text-zinc-400">
                    {row.label}
                  </dt>
                  <dd className="font-serif text-lg font-semibold tabular-nums text-[hsl(var(--primary))] dark:text-white">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {notice ? (
            <div className="rounded-sm border border-amber-400/60 bg-amber-50/90 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-50">
              {notice}
            </div>
          ) : null}

          {/* Formal amount plate */}
          <div className="relative rounded-sm border border-[hsl(var(--primary))]/30 bg-white px-5 py-6 text-center shadow-sm dark:border-zinc-600 dark:bg-zinc-950/50">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[5px] rounded-[1px] border border-[hsl(var(--primary))]/15 dark:border-zinc-700"
            />
            <p className="relative font-serif text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-400">
              {mode === 'payment' ? 'Amount to record' : 'Amount due'}
            </p>
            <p className="relative mt-2 font-serif text-4xl font-bold tabular-nums tracking-tight text-[hsl(var(--primary))] dark:text-white sm:text-[2.75rem]">
              {formatRupee(amount)}
            </p>
            <div
              aria-hidden
              className="relative mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[hsl(var(--primary))]/40 to-transparent"
            />
          </div>

          {check.warnings.length > 0 && (
            <div
              className={`rounded-sm border px-4 py-3 text-base ${
                paymentLevel
                  ? paymentHintClass(paymentLevel)
                  : 'border-amber-300 bg-amber-50 text-amber-950'
              }`}
            >
              <p className="font-serif text-base font-semibold">Please double-check</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
                {check.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {check.needsReentry && (
            <label className="block">
              <span className="font-serif text-base font-semibold text-[hsl(var(--primary))] dark:text-zinc-200">
                Re-enter amount to confirm *
              </span>
              <AmountNumberInput
                min={0}
                step={1}
                value={reenter}
                onChange={(e) => setReenter(e.target.value)}
                placeholder={`Type ${amount} again`}
                className={`${ui.select} mt-2 w-full rounded-sm border-[hsl(var(--primary))]/25 py-3 text-lg`}
                autoComplete="off"
              />
              {reenter && !reentryOk && (
                <p className="mt-1 text-sm text-red-600">
                  Amount does not match {formatRupee(amount)}
                </p>
              )}
            </label>
          )}
        </div>

        <AlertDialogFooter className="shrink-0 gap-3 border-t border-[hsl(var(--primary))]/10 bg-white px-6 py-4 sm:px-8 dark:border-zinc-800 dark:bg-zinc-900">
          <AlertDialogCancel
            onClick={onCancel}
            className="rounded-sm border-[hsl(var(--primary))]/25 px-5 py-2.5 text-base font-medium text-[hsl(var(--primary))]"
          >
            Go back
          </AlertDialogCancel>
          <button
            type="button"
            disabled={!reentryOk}
            onClick={onConfirm}
            className={`${ui.btnPrimary} rounded-sm px-7 py-2.5 text-base disabled:opacity-50`}
          >
            {confirmLabel}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
