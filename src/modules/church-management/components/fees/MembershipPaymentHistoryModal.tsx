import { useEffect, useState } from 'react';
import {
  feesApi,
  type MembershipPaymentHistoryItem,
} from '@/modules/church-management/api/fees';
import { formatRupee } from '@/modules/church-management/lib/dueAmountValidation';
import { CmDialogShell } from '@/modules/church-management/components/CmDialogShell';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

type Props = {
  open: boolean;
  personId: string;
  memberName: string;
  onClose: () => void;
};

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function allocationSummary(p: MembershipPaymentHistoryItem): string {
  const lines = p.allocation?.lines;
  if (!lines || lines.length === 0) {
    return p.paidUntil?.label ? `Until ${p.paidUntil.label}` : '—';
  }
  const first = lines[0]?.label;
  const last = lines[lines.length - 1]?.label;
  if (first && last && first !== last) return `${first} → ${last}`;
  return first || p.paidUntil?.label || '—';
}

/** Full payment history for one member (cash receipts + paid fee lines). */
export function MembershipPaymentHistoryModal({
  open,
  personId,
  memberName,
  onClose,
}: Props) {
  const [items, setItems] = useState<MembershipPaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !personId) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError('');
      const res = await feesApi.getPersonFeeHistory(personId);
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
        setItems([]);
      } else {
        const payments = res.data?.payments ?? [];
        setItems(Array.isArray(payments) ? payments : []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, personId]);

  if (!open) return null;

  const hasLegacyOnly = items.length > 0 && items.every((p) => p.legacy);

  return (
    <CmDialogShell
      title="Payment history"
      subtitle={`${memberName} — cash receipts and paid dues`}
      maxWidthClass="max-w-2xl"
      onBackdropClick={onClose}
      footer={
        <button type="button" className={ui.btnPrimary} onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="space-y-4">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="text-sm text-slate-500">Loading history…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">
            No payments recorded yet. After you save a payment, it will appear here.
          </p>
        ) : (
          <>
            {hasLegacyOnly ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Showing amounts already on fee lines. New saves also create a cash receipt entry.
              </p>
            ) : null}
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-zinc-700 dark:border-zinc-700">
              {items.map((p) => (
                <li key={p.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatRupee(p.amount)}
                    </p>
                    <p className="text-sm text-slate-500">{formatDate(p.paidDate)}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-700 dark:text-zinc-300">
                    Covered: {allocationSummary(p)}
                  </p>
                  {p.paidUntil?.label ? (
                    <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-300">
                      Paid until {p.paidUntil.label}
                    </p>
                  ) : null}
                  {p.comments ? (
                    <p className="mt-1 text-xs text-slate-500">{p.comments}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </CmDialogShell>
  );
}
