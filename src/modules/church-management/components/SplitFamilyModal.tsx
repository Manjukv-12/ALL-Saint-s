import { useEffect, useRef, useState } from 'react';
import type { Member } from '@/modules/church-management/api/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  defaultSplitMembership,
  validateMembership,
  type MembershipFields,
} from '@/modules/church-management/lib/membershipType';
import { MembershipTypeFields } from '@/modules/church-management/components/MembershipTypeFields';
import { SplitFamilyDuesNotice } from '@/modules/church-management/components/SplitFamilyDuesNotice';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import {
  fieldErrorClass,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';
import { isEligibleForMembershipFee } from '@/modules/church-management/lib/membershipEligibility';
import {
  checkPersonOutstandingDues,
  formatOutstandingSummary,
} from '@/modules/church-management/lib/personOutstandingDues';

interface SplitFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  familyId: string;
  parentFamilyCode?: string;
  /** When true, show membership choice (default Associate) for the new family. */
  parentIsAssociateFamily?: boolean;
  onSubmit: (
    newFamilyCode: string | null,
    newAddress: string | undefined,
    autoGenerate: boolean | undefined,
    notes: string,
    membership?: MembershipFields
  ) => Promise<void>;
  onGoCompleteDues?: () => void;
}

export function SplitFamilyModal({
  isOpen,
  onClose,
  member,
  familyId,
  parentIsAssociateFamily = false,
  onSubmit,
  onGoCompleteDues,
}: SplitFamilyModalProps) {
  const [newAddress, setNewAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [membership, setMembership] = useState<MembershipFields>(defaultSplitMembership());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasOutstandingDues, setHasOutstandingDues] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setFieldErrors({});
      setNewAddress('');
      setNotes('');
      setMembership(defaultSplitMembership());
      setLoading(false);
      setHasOutstandingDues(false);
    }
  }, [isOpen]);

  if (!member) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors: Record<string, string> = {};
    if (!notes.trim()) {
      errors.notes = 'Notes are required (e.g. son marriage and new family details)';
    }
    if (parentIsAssociateFamily) {
      const membershipError = validateMembership(membership);
      if (membershipError) {
        errors.membershipType = membershipError;
      }
    }
    setFieldErrors(errors);
    if (errors.notes || errors.membershipType) {
      const order = ['notes', 'membershipType'];
      const first = order.find((k) => errors[k]);
      if (first) setError(errors[first]);
      requestAnimationFrame(() => focusFirstInvalidField(order, formRef.current));
      return;
    }

    if (member.gender !== 'MALE') {
      setError(
        "Family split is only allowed for male members (sons). Please ensure the member's gender is set to MALE."
      );
      return;
    }

    if (member.status === 'Deceased') {
      setError('Cannot split family for deceased person');
      return;
    }

    if (!isEligibleForMembershipFee(member.dateOfBirth)) {
      setError(
        'Only members aged 18+ with date of birth on file can move to a new family (Moved To).'
      );
      return;
    }

    const duesCheck = await checkPersonOutstandingDues(member.id);
    if (!duesCheck.ok) {
      setHasOutstandingDues(true);
      setError(duesCheck.error);
      return;
    }
    if (duesCheck.items.length > 0) {
      setHasOutstandingDues(true);
      setError(
        `Complete all dues first before Moved To. Still unpaid: ${formatOutstandingSummary(duesCheck.items)}`
      );
      return;
    }

    try {
      setLoading(true);
      await onSubmit(
        null,
        newAddress.trim() || undefined,
        true,
        notes.trim(),
        parentIsAssociateFamily ? membership : undefined
      );
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to split family');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="fixed left-1/2 top-[max(1rem,4dvh)] z-50 flex max-h-[min(92dvh,calc(100vh-2rem))] w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden border bg-background p-0 shadow-lg sm:top-[50%] sm:max-h-[min(90dvh,calc(100vh-2rem))] sm:-translate-y-1/2"
        onPointerDownOutside={(e) => loading && e.preventDefault()}
        onEscapeKeyDown={(e) => loading && e.preventDefault()}
      >
        <DialogHeader className="shrink-0 space-y-2 border-b border-zinc-200 px-5 py-4 text-left dark:border-zinc-700 sm:px-6">
          <DialogTitle className="pr-8 text-xl">Split Family for {member.fullName}</DialogTitle>
          <DialogDescription>
            Create a new family with {member.fullName} as the head.
            {parentIsAssociateFamily
              ? ' Choose whether the new branch stays associate or becomes full membership.'
              : ' The new family will continue as full membership.'}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                  <strong>Moved To:</strong> this person must be <strong>18 or older</strong> with
                  date of birth on file.
                </p>
              </div>

              <SplitFamilyDuesNotice
                familyId={familyId}
                personId={member.id}
                personName={member.fullName}
                onHasOutstandingChange={setHasOutstandingDues}
                onGoCompleteDues={
                  onGoCompleteDues
                    ? () => {
                        onClose();
                        onGoCompleteDues();
                      }
                    : undefined
                }
              />

              {parentIsAssociateFamily && (
                <>
                  <MembershipTypeFields
                    value={membership}
                    onChange={setMembership}
                    inputClass={inputClass}
                  />
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                    <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                      Splitting from an <strong>associate family</strong>. Choose membership for the
                      new branch — associate is selected by default.
                    </p>
                  </div>
                </>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  The new family code will be generated automatically in the FAM001 series.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  data-field="notes"
                  aria-invalid={!!fieldErrors.notes}
                  value={notes}
                  onChange={(e) => {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.notes;
                      return next;
                    });
                    setNotes(e.target.value);
                  }}
                  className={fieldErrorClass(inputClass, !!fieldErrors.notes)}
                  placeholder="e.g. Son married … new household at …"
                />
                <FormFieldError message={fieldErrors.notes} />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  New Address (Optional)
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className={inputClass}
                  placeholder="Enter new address"
                />
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-400">
                  <strong>Note:</strong> This creates a new family branch linked in the lineage tree.
                  {parentIsAssociateFamily
                    ? ' All members moved will use the membership type selected above.'
                    : ' Members keep full membership.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-md border border-zinc-300 px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || hasOutstandingDues}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Splitting...' : hasOutstandingDues ? 'Pay dues first' : 'Split Family'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
