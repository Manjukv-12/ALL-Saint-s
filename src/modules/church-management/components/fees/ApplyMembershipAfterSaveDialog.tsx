import { useEffect, useMemo, useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { feesApi } from '@/modules/church-management/api/fees';
import { MembershipYearSelect } from '@/modules/church-management/components/fees/MembershipYearSelect';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import {
  clampMembershipYear,
  isValidMembershipYear,
  membershipYearError,
} from '@/modules/church-management/lib/membershipYear';
import { defaultFeesManagementYear } from '@/modules/church-management/lib/feesYearPolicy';
import { cmScrollableAlertDialogClass } from '@/modules/church-management/components/cmScrollableDialog';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  open: boolean;
  amount: number;
  initialYear?: number;
  onClose: () => void;
  onApplied: () => void;
};

/** Shown right after saving Membership Due amount — offer apply for a year. */
export function ApplyMembershipAfterSaveDialog({
  open,
  amount,
  initialYear,
  onClose,
  onApplied,
}: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(() =>
    clampMembershipYear(initialYear ?? defaultFeesManagementYear())
  );
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setYear(clampMembershipYear(initialYear ?? defaultFeesManagementYear()));
      setError('');
    }
  }, [open, initialYear, currentYear]);

  const yearValid = isValidMembershipYear(year, currentYear);
  const yearErr = useMemo(() => membershipYearError(year, currentYear), [year, currentYear]);

  const handleApply = async () => {
    if (!yearValid) {
      setError(yearErr ?? 'Choose a valid year.');
      return;
    }
    try {
      setApplying(true);
      setError('');
      const res = await feesApi.generateAllDues(year);
      if (res.error) {
        setError(res.error);
        return;
      }
      onApplied();
      onClose();
    } catch {
      setError('Could not apply membership rate');
    } finally {
      setApplying(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !applying) {
          setError('');
          onClose();
        }
      }}
    >
      <AlertDialogContent className={`${cmScrollableAlertDialogClass} max-w-lg`}>
        <AlertDialogHeader className="shrink-0 space-y-2 border-b border-slate-200 px-6 py-5 text-left">
          <AlertDialogTitle className="font-sans text-xl">
            Apply ₹{formatCurrency(amount)} for {year}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed">
            Amount saved for {year}. Apply it now to active members aged 18+? Unpaid rows update;
            paid rows stay unchanged. You can also apply later on the Membership tab.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5">
          <MembershipYearSelect
            value={year}
            onChange={setYear}
            showQuickYears
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <AlertDialogFooter className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 sm:justify-end">
          <AlertDialogCancel disabled={applying} className={ui.btnOutline}>
            Not now
          </AlertDialogCancel>
          <button
            type="button"
            disabled={applying || !yearValid}
            onClick={() => void handleApply()}
            className={ui.btnPrimary}
          >
            {applying
              ? 'Applying…'
              : !yearValid
                ? 'Choose a valid year'
                : `Apply ₹${formatCurrency(amount)} for ${year}`}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
