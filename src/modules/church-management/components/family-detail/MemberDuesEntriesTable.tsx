import type { MemberDue } from '@/modules/church-management/api/fees';
import { ui } from './familyDetailTheme';
import { DueStatusBadge } from '@/modules/church-management/components/fees/DueStatusBadge';
import { RemovePersonDueButton } from '@/modules/church-management/components/fees/RemovePersonDueButton';
import { dueExcessAmount, formatDueRupee } from '@/modules/church-management/lib/dueExcess';
import { dueTypeDisplayName } from '@/modules/church-management/lib/dueTypes';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function monthLabel(month?: number | null): string {
  if (!month) return '—';
  return new Date(2000, month - 1, 1).toLocaleString('en-IN', { month: 'short' });
}

type Props = {
  dues: MemberDue[];
  showMember?: boolean;
  emptyLabel: string;
  onEdit: (due: MemberDue) => void;
  onRecordPayment: (due: MemberDue) => void;
  onRemoved?: () => void;
  onRemoveError?: (message: string) => void;
};

export function MemberDuesEntriesTable({
  dues,
  showMember = true,
  emptyLabel,
  onEdit,
  onRecordPayment,
  onRemoved,
  onRemoveError,
}: Props) {
  if (dues.length === 0) {
    return <p className="p-10 text-center text-base text-slate-500">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
    <table className="min-w-[40rem] w-full">
      <thead className={ui.tableHead}>
        <tr>
          {showMember && <th className={ui.th}>Member</th>}
          <th className={ui.th}>Type</th>
          <th className={ui.th}>Year</th>
          <th className={ui.th}>Mon</th>
          <th className={ui.th}>Due ₹</th>
          <th className={ui.th}>Paid ₹</th>
          <th className={ui.th}>Status</th>
          <th className={ui.th}>Paid on</th>
          <th className={ui.th}>Notes</th>
          <th className={`${ui.th} text-right`} />
        </tr>
      </thead>
      <tbody>
        {dues.map((due) => {
          const excess = dueExcessAmount(due);
          return (
            <tr key={due.id} className={ui.row}>
              {showMember && (
                <td className={ui.td}>{due.personName || due.person?.fullName || '—'}</td>
              )}
              <td className={ui.td}>{dueTypeDisplayName(due.dueType)}</td>
              <td className={ui.td}>{due.year}</td>
              <td className={ui.td}>{monthLabel(due.month)}</td>
              <td className={ui.td}>₹{formatCurrency(due.amountDue)}</td>
              <td className={ui.td}>
                <div className="flex flex-col gap-0.5">
                  <span>₹{formatCurrency(due.amountPaid)}</span>
                  {excess > 0 ? (
                    <span className="text-xs text-amber-800">+₹{formatDueRupee(excess)} excess</span>
                  ) : null}
                </div>
              </td>
              <td className={ui.td}>
                <DueStatusBadge due={due} />
              </td>
              <td className={ui.td}>
                {due.paidDate ? new Date(due.paidDate).toLocaleDateString('en-IN') : '—'}
              </td>
              <td className={`${ui.td} max-w-[200px] truncate`} title={due.comments || ''}>
                {due.comments || '—'}
              </td>
              <td className={`${ui.td} text-right`}>
                <div className="flex flex-wrap justify-end gap-1">
                  <button type="button" onClick={() => onEdit(due)} className={ui.btnGhost}>
                    Edit
                  </button>
                  {!due.paid && (
                    <button
                      type="button"
                      onClick={() => onRecordPayment(due)}
                      className={ui.btnGhost}
                    >
                      Pay
                    </button>
                  )}
                  {onRemoved ? (
                    <RemovePersonDueButton
                      due={due}
                      onRemoved={onRemoved}
                      onError={onRemoveError}
                    />
                  ) : null}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}
