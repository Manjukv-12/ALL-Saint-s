import { Check } from 'lucide-react';
import type { MemberDue } from '@/modules/church-management/api/fees';
import { dueExcessAmount, formatDueRupee } from '@/modules/church-management/lib/dueExcess';

type Props = {
  due: MemberDue;
};

/** Paid / Partial / Unpaid with a simple green tick when fully paid. */
export function DueStatusBadge({ due }: Props) {
  const excess = dueExcessAmount(due);
  const dueAmt = Number(due.amountDue) || 0;
  const paidAmt = Number(due.amountPaid) || 0;

  if (due.paid || (dueAmt > 0 && paidAmt + 0.001 >= dueAmt)) {
    return (
      <span className="inline-flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
          <span
            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600"
            aria-hidden
          >
            <Check className="h-3 w-3" style={{ color: '#ffffff' }} strokeWidth={3} />
          </span>
          Paid
        </span>
        {excess > 0 ? (
          <span className="text-xs font-medium text-amber-800">
            Excess ₹{formatDueRupee(excess)}
          </span>
        ) : null}
      </span>
    );
  }

  if (dueAmt < 0.001) {
    return <span className="text-sm font-medium text-slate-400">No amount</span>;
  }

  if (paidAmt > 0) {
    return <span className="text-sm font-semibold text-amber-700">Partial</span>;
  }

  return <span className="text-sm font-semibold text-amber-700">Unpaid</span>;
}
