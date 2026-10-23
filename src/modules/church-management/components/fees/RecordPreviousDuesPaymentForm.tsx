import { useState } from 'react';
import { feesApi } from '@/modules/church-management/api/fees';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';
import { AmountNumberInput } from '@/modules/church-management/components/fees/AmountNumberInput';
import { DatePartsField } from '@/components/DatePartsField';
import { PREVIOUS_DUES_THROUGH_YEAR } from '@/modules/church-management/lib/feesYearPolicy';
import { previousDuesCoveredLabel } from '@/modules/church-management/lib/previousDues';

type Props = {
  personId: string;
  personName: string;
  balance: number;
  throughYear?: number;
  notes?: string | null;
  onCancel: () => void;
  onSaved: () => void;
};

function formatRupee(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RecordPreviousDuesPaymentForm({
  personId,
  personName,
  balance,
  throughYear = PREVIOUS_DUES_THROUGH_YEAR,
  notes,
  onCancel,
  onSaved,
}: Props) {
  const [amountPaying, setAmountPaying] = useState(String(Math.round(balance)));
  const [paidDate, setPaidDate] = useState('');
  const [comments, setComments] = useState('');
  const [clearComments, setClearComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const submitPayment = async () => {
    const amount = Number(amountPaying);
    if (!Number.isFinite(amount) || amount < 1) {
      setError('Enter a payment amount of at least ₹1');
      return;
    }
    if (amount > balance + 0.001) {
      setError(`Payment cannot exceed ₹${formatRupee(balance)}`);
      return;
    }
    try {
      setSaving(true);
      setError('');
      const res = await feesApi.recordPreviousDuesPayment(personId, {
        amountPaid: amount,
        paidDate: paidDate || undefined,
        comments: comments.trim() || undefined,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      onSaved();
    } catch {
      setError('Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  const submitClear = async () => {
    try {
      setSaving(true);
      setError('');
      const res = await feesApi.clearPreviousDues(personId, {
        comments: clearComments.trim() || undefined,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      onSaved();
    } catch {
      setError('Failed to clear previous dues');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/25">
        <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
          Previous dues through {throughYear}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
          ₹{formatRupee(balance)} <span className="text-base font-medium text-slate-500">due</span>
        </p>
        {notes ? (
          <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">{notes}</p>
        ) : null}
        <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400">
          {personName} — record payment here or mark as covered once settled.
        </p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Amount paying (₹) *
          </label>
          <AmountNumberInput
            min={1}
            max={Math.round(balance)}
            required
            value={amountPaying}
            onChange={(e) => setAmountPaying(e.target.value)}
            className={ui.input}
          />
          <button
            type="button"
            className="mt-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
            onClick={() => setAmountPaying(String(Math.round(balance)))}
          >
            Pay full ₹{formatRupee(balance)}
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Payment date
          </label>
          <DatePartsField value={paidDate} onChange={setPaidDate} inputClassName={ui.input} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Comments (optional)
          </label>
          <textarea
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className={`${ui.input} min-h-[4rem] resize-y`}
            placeholder="Receipt no., mode of payment…"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className={ui.btnPrimary} disabled={saving} onClick={() => void submitPayment()}>
          {saving ? 'Saving…' : 'Record payment'}
        </button>
        <button type="button" className={ui.btnOutline} disabled={saving} onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">
          Mark as covered (no payment)
        </p>
        <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
          Use when older balances are settled outside this system or not applicable. Sets profile to{' '}
          {previousDuesCoveredLabel(throughYear)}.
        </p>
        {!confirmClear ? (
          <button
            type="button"
            className={`${ui.btnOutline} mt-3`}
            disabled={saving}
            onClick={() => setConfirmClear(true)}
          >
            Mark covered without payment
          </button>
        ) : (
          <div className="mt-3 space-y-3">
            <textarea
              rows={2}
              value={clearComments}
              onChange={(e) => setClearComments(e.target.value)}
              className={`${ui.input} min-h-[4rem] resize-y`}
              placeholder="Reason (optional) — e.g. settled before go-live, waived by committee…"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
                disabled={saving}
                onClick={() => void submitClear()}
              >
                Confirm — mark covered
              </button>
              <button
                type="button"
                className={ui.btnOutline}
                disabled={saving}
                onClick={() => setConfirmClear(false)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
