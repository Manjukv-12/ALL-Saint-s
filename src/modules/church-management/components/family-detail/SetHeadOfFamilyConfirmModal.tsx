import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Member } from '@/modules/church-management/api/types';
import { getMemberRoleLabel } from '@/modules/church-management/lib/familyRoles';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';
import { cmScrollableAlertDialogClass } from '@/modules/church-management/components/cmScrollableDialog';

interface SetHeadOfFamilyConfirmModalProps {
  open: boolean;
  member: Member | null;
  currentHead?: Member | null;
  familyCode?: string;
  /** When true, family is inactive and confirming will reactivate it. */
  reactivatingInactiveFamily?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SetHeadOfFamilyConfirmModal({
  open,
  member,
  currentHead,
  familyCode,
  reactivatingInactiveFamily = false,
  loading = false,
  onConfirm,
  onCancel,
}: SetHeadOfFamilyConfirmModalProps) {
  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !loading && onCancel()}>
      <AlertDialogContent className={`${cmScrollableAlertDialogClass} max-w-md`}>
        <AlertDialogHeader className="shrink-0 border-b border-slate-200 px-6 py-5 text-left dark:border-zinc-700">
          <AlertDialogTitle className="text-xl">
            {reactivatingInactiveFamily ? 'Assign head of family?' : 'Change head of family?'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed">
            {reactivatingInactiveFamily ? (
              <>
                This inactive family has no head. Confirming will reactivate the family and set{' '}
                {member.fullName} as head. Update their role afterward if needed (e.g. Husband or
                Wife).
              </>
            ) : (
              <>
                This updates who is recorded as head for
                {familyCode ? ` family ${familyCode}` : ' this family'}. Only one person can be head
                at a time.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5">
          {currentHead && currentHead.id !== member.id && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
              <p className="text-slate-500">Current head</p>
              <p className="font-semibold text-slate-900 dark:text-white">{currentHead.fullName}</p>
            </div>
          )}
          <div className="rounded-lg border-2 border-slate-900 bg-white px-4 py-3 text-sm dark:border-zinc-500 dark:bg-zinc-900">
            <p className="text-slate-500">New head of family</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{member.fullName}</p>
            {getMemberRoleLabel(member) !== '—' && (
              <p className="mt-0.5 text-slate-500">Role: {getMemberRoleLabel(member)}</p>
            )}
          </div>
        </div>

        <AlertDialogFooter className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-900">
          <AlertDialogCancel disabled={loading} onClick={onCancel} className="px-5 py-2.5">
            Cancel
          </AlertDialogCancel>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`${ui.btnPrimary} px-5 py-2.5 disabled:opacity-50`}
          >
            {loading ? 'Saving…' : 'Confirm change'}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
