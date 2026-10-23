import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { feesApi, type MemberDue } from '@/modules/church-management/api/fees';
import {
  canRemovePersonDueAssignment,
  dueTypeDisplayName,
} from '@/modules/church-management/lib/dueTypes';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

type Props = {
  due: MemberDue;
  onRemoved: () => void;
  onError?: (message: string) => void;
  className?: string;
};

/** Soft-removes one person's non-membership due assignment. Keeps the due type. */
export function RemovePersonDueButton({ due, onRemoved, onError, className }: Props) {
  const [busy, setBusy] = useState(false);

  if (!canRemovePersonDueAssignment(due)) {
    return null;
  }

  const remove = async () => {
    const label = dueTypeDisplayName(due.dueType);
    const paid = Number(due.amountPaid) || 0;
    const ok = window.confirm(
      paid > 0.001
        ? `Remove “${label}” from this person?\n\nThis hides this assignment (including ₹${Math.round(paid)} paid). The due type stays available for others.`
        : `Remove “${label}” from this person?\n\nOnly this assignment is removed. The due type stays in the catalog.`
    );
    if (!ok) return;

    try {
      setBusy(true);
      const res = await feesApi.deleteDue(due.id);
      if (res.error) {
        onError?.(res.error);
        return;
      }
      onRemoved();
    } catch {
      onError?.('Could not remove this due assignment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void remove()}
      className={className ?? ui.btnGhost}
      title="Remove this assignment from this person"
    >
      <span className="inline-flex items-center gap-1">
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Remove
      </span>
    </button>
  );
}
