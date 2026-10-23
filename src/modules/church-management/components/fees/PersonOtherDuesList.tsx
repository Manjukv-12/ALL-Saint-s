import type { MemberDue } from '@/modules/church-management/api/fees';
import { DueStatusBadge } from '@/modules/church-management/components/fees/DueStatusBadge';
import { RemovePersonDueButton } from '@/modules/church-management/components/fees/RemovePersonDueButton';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';
import { dueTypeDisplayName } from '@/modules/church-management/lib/dueTypes';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  year: number;
  rows: MemberDue[];
  onPay: (due: MemberDue) => void;
  onEdit: (due: MemberDue) => void;
  onRemoved: () => void;
  onRemoveError?: (message: string) => void;
};

/** Harvest / cemetery / other dues — short cards, not a dense spreadsheet. */
export function PersonOtherDuesList({
  year,
  rows,
  onPay,
  onEdit,
  onRemoved,
  onRemoveError,
}: Props) {
  if (rows.length === 0) {
    return (
      <section className={ui.card}>
        <div className="px-5 py-5 sm:px-6">
          <h2 className={ui.sectionTitle}>Other dues · {year}</h2>
          <p className="mt-2 text-sm text-slate-500">
            No harvest, cemetery, or other fees for this year. Use Add due if needed.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={ui.card}>
      <div className="border-b border-slate-200 px-5 py-4 dark:border-zinc-700 sm:px-6">
        <h2 className={ui.sectionTitle}>Other dues · {year}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Harvest, cemetery, and one-off fees — Remove clears this person only; the due type stays.
        </p>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
        {rows.map((d) => {
          const rem = Math.max(
            0,
            Math.round((Number(d.amountDue) || 0) - (Number(d.amountPaid) || 0))
          );
          return (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {dueTypeDisplayName(d.dueType)}
                </p>
                <p className="text-sm text-slate-500">
                  Due ₹{formatCurrency(d.amountDue)} · Paid ₹{formatCurrency(d.amountPaid)}
                  {rem > 0 ? ` · Still ₹${formatCurrency(rem)}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DueStatusBadge due={d} />
                <button type="button" className={ui.btnGhost} onClick={() => onEdit(d)}>
                  Edit
                </button>
                {rem > 0 ? (
                  <button type="button" className={ui.btnPrimary} onClick={() => onPay(d)}>
                    Pay
                  </button>
                ) : null}
                <RemovePersonDueButton
                  due={d}
                  onRemoved={onRemoved}
                  onError={onRemoveError}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
