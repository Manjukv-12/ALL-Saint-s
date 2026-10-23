import type { MemberDue } from '@/modules/church-management/api/fees';
import { RecordDuePaymentForm } from '@/modules/church-management/components/fees/RecordDuePaymentForm';
import { dueTypeDisplayName } from '@/modules/church-management/lib/dueTypes';

/** @deprecated Prefer navigating to RecordDuePaymentPage via collectPaymentPath. */
export function RecordDuePaymentModal({
  due,
  onClose,
  onSaved,
}: {
  due: MemberDue | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  if (!due) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-zinc-950">
      <div className="mx-auto min-h-full w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 border-b border-slate-200 pb-4 dark:border-zinc-700">
          <p className="text-xl font-semibold text-slate-900 dark:text-white">Collect payment</p>
          <p className="mt-1 text-sm text-slate-500">
            {due.personName || due.person?.fullName || '—'} — {dueTypeDisplayName(due.dueType)}
          </p>
        </div>
        <RecordDuePaymentForm due={due} onCancel={onClose} onSaved={onSaved} />
      </div>
    </div>
  );
}
