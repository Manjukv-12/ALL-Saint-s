import { DatePartsField } from '@/components/DatePartsField';
import { AmountNumberInput } from './AmountNumberInput';

export type AssignPaymentMode = 'unpaid' | 'record';

type Props = {
  mode: AssignPaymentMode;
  onModeChange: (mode: AssignPaymentMode) => void;
  amountDue: string;
  amountPaid: string;
  onAmountPaidChange: (value: string) => void;
  paidDate: string;
  onPaidDateChange: (value: string) => void;
  labelClass: string;
  inputClass: string;
};

/**
 * Payment choice when assigning a personal due:
 * unpaid (assign only) vs record/clear payment now (paid amount + date required).
 */
export function AssignDuePaymentSection({
  mode,
  onModeChange,
  amountDue,
  amountPaid,
  onAmountPaidChange,
  paidDate,
  onPaidDateChange,
  labelClass,
  inputClass,
}: Props) {
  const recording = mode === 'record';
  const paidNum = Number(amountPaid);
  const dueNum = Number(amountDue);
  const hasPaidTyped = amountPaid.trim() !== '' && Number.isFinite(paidNum) && paidNum > 0;
  const highlight = recording || hasPaidTyped;

  const setMode = (next: AssignPaymentMode) => {
    onModeChange(next);
    if (next === 'unpaid') {
      onAmountPaidChange('');
      onPaidDateChange('');
      return;
    }
    if ((!amountPaid || Number(amountPaid) === 0) && dueNum > 0) {
      onAmountPaidChange(String(Math.round(dueNum)));
    }
    if (!paidDate) {
      onPaidDateChange(new Date().toISOString().slice(0, 10));
    }
  };

  const onPaidInput = (value: string) => {
    onAmountPaidChange(value);
    const n = Number(value);
    if (value.trim() !== '' && Number.isFinite(n) && n > 0 && mode !== 'record') {
      onModeChange('record');
      if (!paidDate) {
        onPaidDateChange(new Date().toISOString().slice(0, 10));
      }
    }
  };

  return (
    <section
      className={`w-full space-y-4 rounded-xl border px-4 py-4 transition-colors sm:px-5 sm:py-5 ${
        highlight
          ? 'border-emerald-300 bg-emerald-50/90 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/25'
          : 'border-slate-200 bg-slate-50/80 dark:border-zinc-700 dark:bg-zinc-800/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-900 dark:text-white">Payment</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            {recording
              ? 'Enter paid amount and payment date to clear this due now.'
              : 'Leave unpaid, or choose to record / clear payment now.'}
          </p>
        </div>
        {highlight ? (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Clearing
          </span>
        ) : null}
      </div>

      <label className="block max-w-xl">
        <span className={labelClass}>Payment status *</span>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as AssignPaymentMode)}
          className={inputClass}
          aria-label="Payment status"
        >
          <option value="unpaid">Unpaid — assign only</option>
          <option value="record">Record / clear payment now</option>
        </select>
      </label>

      {recording ? (
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-5">
          <div className="min-w-0">
            <label className="block">
              <span className={labelClass}>Paid amount (₹) *</span>
              <AmountNumberInput
                min={0}
                step={1}
                required
                value={amountPaid}
                onChange={(e) => onPaidInput(e.target.value)}
                className={`${inputClass} border-emerald-400 ring-2 ring-emerald-200 focus:border-emerald-500 focus:ring-emerald-300 dark:border-emerald-600 dark:ring-emerald-900`}
                placeholder="Amount received"
              />
            </label>
            <div className="mt-2 min-h-[2.75rem]">
              {dueNum > 0 ? (
                <button
                  type="button"
                  className="text-sm font-semibold text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-300"
                  onClick={() => {
                    onAmountPaidChange(String(Math.round(dueNum)));
                    if (!paidDate) {
                      onPaidDateChange(new Date().toISOString().slice(0, 10));
                    }
                  }}
                >
                  Use full amount due (₹
                  {new Intl.NumberFormat('en-IN').format(Math.round(dueNum))})
                </button>
              ) : (
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Enter amount due above first, then clear payment.
                </p>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <label className="block">
              <span className={labelClass}>Payment date *</span>
              <DatePartsField
                value={paidDate}
                onChange={onPaidDateChange}
                required
                className="mt-2"
                selectClassName={`${inputClass} !mt-0 border-emerald-400 ring-2 ring-emerald-200 dark:border-emerald-600 dark:ring-emerald-900`}
                aria-label="Payment date"
                disableFuture
              />
            </label>
            <div className="mt-2 min-h-[2.75rem]">
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Required when clearing payment. Cannot be in the future.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          Due will be saved as unpaid. You can record payment later from All dues.
        </p>
      )}
    </section>
  );
}
