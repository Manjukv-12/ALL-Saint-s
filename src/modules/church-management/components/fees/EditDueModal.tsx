import { useEffect, useMemo, useState } from 'react';
import type { MemberDue } from '@/modules/church-management/api/fees';
import { feesApi } from '@/modules/church-management/api/fees';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';
import { CmDialogShell } from '@/modules/church-management/components/CmDialogShell';
import { ConfirmDueAmountDialog } from './ConfirmDueAmountDialog';
import {
  checkDueAmount,
  checkAmountDueAgainstPaid,
  formatRupee,
} from '@/modules/church-management/lib/dueAmountValidation';
import { dueExcessAmount } from '@/modules/church-management/lib/dueExcess';
import { dueTypeDisplayName } from '@/modules/church-management/lib/dueTypes';
import { AmountNumberInput } from './AmountNumberInput';

function monthLabel(month?: number | null): string {
  if (!month) return '—';
  return new Date(2000, month - 1, 1).toLocaleString('en-IN', { month: 'long' });
}

export function EditDueModal({
  due,
  onClose,
  onSaved,
}: {
  due: MemberDue | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [amountDue, setAmountDue] = useState('');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!due) return;
    setYear(String(due.year));
    setMonth(due.month ? String(due.month) : '');
    setAmountDue(String(due.amountDue));
    setComments(due.comments || '');
    setError('');
    setConfirmOpen(false);
  }, [due]);

  const expectedAmount = due?.dueType?.defaultAmount ?? due?.amountDue ?? 0;
  const dueAmt = Number(amountDue) || 0;
  const amountCheck = useMemo(
    () => checkDueAmount(dueAmt, expectedAmount),
    [dueAmt, expectedAmount]
  );
  const paidFloorCheck = useMemo(
    () => checkAmountDueAgainstPaid(dueAmt, due?.amountPaid ?? 0),
    [dueAmt, due?.amountPaid]
  );

  const saveEdit = async () => {
    if (!due) return;
    try {
      setSaving(true);
      setError('');
      const res = await feesApi.updateDue(due.id, {
        year: Number(year),
        month: due.dueType?.frequency === 'MONTHLY' && month ? Number(month) : null,
        amountDue: dueAmt,
        comments: comments.trim() || undefined,
      });
      if (res.error) {
        setError(res.error);
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      onSaved();
    } catch {
      setError('Could not update due');
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!due) return null;

  const personName = due.personName || due.person?.fullName || '—';
  const labelClass = 'text-base font-semibold text-slate-700 dark:text-zinc-300';
  const inputClass = `${ui.select} mt-2 w-full text-lg py-3`;
  const subtitle = `${personName}${due.familyCode ? ` · ${due.familyCode}` : ''} — ${dueTypeDisplayName(due.dueType)} (${due.year})`;
  const remaining = Math.max(0, dueAmt - due.amountPaid);
  const currentExcess = dueExcessAmount(due);
  const paidFloor = paidFloorCheck.minDue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || Number.isNaN(dueAmt) || dueAmt < 0) {
      setError('Enter a valid year and amount due');
      return;
    }
    if (!paidFloorCheck.ok) {
      setError(paidFloorCheck.error || 'Amount due cannot be below amount paid');
      return;
    }
    setError('');
    setConfirmOpen(true);
  };

  return (
    <>
      <CmDialogShell
        title="Edit due"
        subtitle={subtitle}
        maxWidthClass="max-w-2xl"
        onBackdropClick={onClose}
        formProps={{ onSubmit: handleSubmit }}
        footer={
          <>
            <button type="button" onClick={onClose} className={`${ui.btnOutline} px-5 py-3 text-base`}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={`${ui.btnPrimary} px-5 py-3 text-base`}>
              {saving ? 'Saving…' : 'Review & save'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-800/50">
              <p className="text-slate-600">
                <span className="font-semibold">Amount paid:</span> {formatRupee(due.amountPaid)}
                {due.paid ? ' · Fully paid' : due.amountPaid > 0 ? ' · Partially paid' : ' · Unpaid'}
              </p>
              {due.amountPaid > 0 && (
                <p className="mt-2 text-slate-600">
                  <span className="font-semibold">Paid on:</span>{' '}
                  {due.paidDate
                    ? new Date(due.paidDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Date not recorded'}
                </p>
              )}
              {!due.paid && remaining > 0 && (
                <p className="mt-2 text-slate-600">
                  <span className="font-semibold">Remaining:</span> {formatRupee(remaining)}
                  <span className="text-slate-500"> — use Pay to record a payment</span>
                </p>
              )}
            </div>

            {currentExcess > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-base text-amber-950">
                <p className="font-semibold">Excess paid: {formatRupee(currentExcess)}</p>
                <p className="mt-1 text-sm leading-relaxed">
                  More was collected than the current amount due. You may raise the due (to collect
                  more later), but you cannot set amount due below {formatRupee(due.amountPaid)}.
                </p>
              </div>
            )}
            {!paidFloorCheck.ok && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
                {paidFloorCheck.error}
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Calendar year *</span>
              <AmountNumberInput
                min={2000}
                max={2100}
                required
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={inputClass}
              />
            </label>

            {due.dueType?.frequency === 'MONTHLY' && (
              <label className="block">
                <span className={labelClass}>Month</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1, 1).toLocaleString('en-IN', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className={labelClass}>Amount due (₹) *</span>
              <AmountNumberInput
                min={paidFloor > 0 ? paidFloor : 0}
                step={1}
                required
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
                className={inputClass}
              />
              <p className="mt-2 text-sm text-slate-500">
                You can raise the due to collect more. You cannot set it below amount already paid
                {due.amountPaid > 0 ? ` (${formatRupee(due.amountPaid)})` : ''}.
              </p>
              {amountCheck.warnings.length > 0 && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {amountCheck.warnings[0]}
                </p>
              )}
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Comments</span>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className={`${ui.select} mt-2 w-full text-lg py-3`}
              placeholder="Optional notes"
            />
          </label>
        </div>
      </CmDialogShell>

      <ConfirmDueAmountDialog
        open={confirmOpen}
        mode="add"
        title="Confirm due changes"
        amount={dueAmt}
        expectedAmount={expectedAmount}
        confirmLabel={saving ? 'Saving…' : 'Yes, save changes'}
        rows={[
          { label: 'Member', value: personName },
          { label: 'Due type', value: dueTypeDisplayName(due.dueType) },
          { label: 'Year', value: year },
          ...(month ? [{ label: 'Month', value: monthLabel(Number(month)) }] : []),
          { label: 'Previous amount due', value: formatRupee(due.amountDue) },
          { label: 'New amount due', value: formatRupee(dueAmt) },
          { label: 'Amount paid', value: formatRupee(due.amountPaid) },
          ...(dueAmt > due.amountPaid + 0.001
            ? [{ label: 'Remaining after save', value: formatRupee(dueAmt - due.amountPaid) }]
            : []),
          ...(due.amountPaid > 0
            ? [
                {
                  label: 'Paid on',
                  value: due.paidDate
                    ? new Date(due.paidDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Date not recorded',
                },
              ]
            : []),
          ...(comments.trim() ? [{ label: 'Comments', value: comments.trim() }] : []),
        ]}
        onCancel={() => !saving && setConfirmOpen(false)}
        onConfirm={() => {
          if (!saving) void saveEdit();
        }}
      />
    </>
  );
}
