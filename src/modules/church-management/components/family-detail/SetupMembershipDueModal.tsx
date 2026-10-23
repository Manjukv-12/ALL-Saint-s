import { useEffect, useState } from 'react';
import type { Member } from '@/modules/church-management/api/types';
import { feesApi } from '@/modules/church-management/api/fees';
import { membersApi } from '@/modules/church-management/api';
import { isEligibleForMembershipFee } from '@/modules/church-management/lib/membershipEligibility';
import { ui } from './familyDetailTheme';

export function SetupMembershipDueModal({
  open,
  members,
  defaultYear,
  onClose,
  onSaved,
}: {
  open: boolean;
  members: Member[];
  defaultYear: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const eligible = members.filter(
    (m) => m.status !== 'Deceased' && isEligibleForMembershipFee(m.dateOfBirth)
  );

  const [personId, setPersonId] = useState('');
  const [year, setYear] = useState(defaultYear);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selected = eligible.find((m) => m.id === personId);

  useEffect(() => {
    if (!open) return;
    const first = eligible[0];
    setPersonId(first?.id || '');
    setYear(defaultYear);
    setError('');
    feesApi.getDueTypes({ auto: true }).then((res) => {
      const sub = res.data?.find((d) => d.code === 'SUBSCRIPTION');
      const personAmount = first?.membershipFeeAmount;
      setAmount(
        personAmount != null
          ? String(personAmount)
          : sub
            ? String(sub.defaultAmount)
            : '1000'
      );
    });
  }, [open, eligible, defaultYear]);

  useEffect(() => {
    if (selected) {
      if (selected.membershipFeeAmount != null) {
        setAmount(String(selected.membershipFeeAmount));
      }
    }
  }, [personId]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId) {
      setError('Select a member');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const feeAmount = Number(amount);
      const memberRes = await membersApi.updateMember(personId, {
        membershipFeeAmount: feeAmount,
      });
      if (memberRes.error) {
        setError(memberRes.error);
        return;
      }
      const typesRes = await feesApi.getDueTypes({ auto: true });
      const sub = typesRes.data?.find((d) => d.code === 'SUBSCRIPTION');
      if (!sub) {
        setError('Membership due type not found');
        return;
      }
      const dueRes = await feesApi.createOrUpdateDue({
        personId,
        dueTypeId: sub.id,
        year,
        amountDue: feeAmount,
      });
      if (dueRes.error) {
        setError(dueRes.error);
        return;
      }
      onSaved();
    } catch {
      setError('Could not set up membership');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`${ui.card} w-full max-w-md`}>
        <div className={ui.sectionHead}>
          <h2 className={ui.sectionTitle}>Set up membership due</h2>
          <p className="mt-1 text-sm text-slate-500">
            For members aged 18+. Enter this person&apos;s subscription amount for the year.
          </p>
        </div>
        <form onSubmit={handleSubmit} className={ui.sectionBody}>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {eligible.length === 0 ? (
            <p className="text-base text-slate-600">
              No members aged 18+ with date of birth in this family. Add date of birth on the member
              profile first.
            </p>
          ) : (
            <>
              <label className="mb-4 block">
                <span className="text-sm font-semibold text-slate-600">Member (18+)</span>
                <select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className={`${ui.select} mt-1 w-full`}
                  required
                >
                  {eligible.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mb-4 block">
                <span className="text-sm font-semibold text-slate-600">Calendar year</span>
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={`${ui.select} mt-1 w-full`}
                />
              </label>
              <label className="mb-6 block">
                <span className="text-sm font-semibold text-slate-600">Membership amount (₹/year)</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${ui.select} mt-1 w-full`}
                />
              </label>
            </>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className={ui.btnOutline}>
              Cancel
            </button>
            {eligible.length > 0 && (
              <button type="submit" disabled={saving} className={ui.btnPrimary}>
                {saving ? 'Saving…' : 'Save membership due'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
