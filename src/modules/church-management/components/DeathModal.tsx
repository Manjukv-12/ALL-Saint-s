import { useEffect, useMemo, useRef, useState } from 'react';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { CmDialogShell } from '@/modules/church-management/components/CmDialogShell';
import {
  fieldErrorClass,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';
import type { Member } from '@/modules/church-management/api/types';
import { SUCCESSION_ORDER_HINT } from '@/modules/church-management/lib/familyStatus';
import {
  isEligibleHeadOfFamily,
  soleHeadDeceasedBlockReason,
  sortHeadOfFamilyCandidates,
  suggestHeadSuccessor,
} from '@/modules/church-management/lib/hofEligibility';
import { DatePartsField } from '@/components/DatePartsField';

interface DeathModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  isHeadOfFamily?: boolean;
  familyMembers?: Member[];
  onSubmit: (notes: string, eventDate?: string, successorId?: string) => Promise<void>;
}

export function DeathModal({
  isOpen,
  onClose,
  member,
  isHeadOfFamily = false,
  familyMembers = [],
  onSubmit,
}: DeathModalProps) {
  const [notes, setNotes] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [successorMode, setSuccessorMode] = useState<'auto' | 'manual'>('auto');
  const [successorId, setSuccessorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const successorOptions = useMemo(() => {
    if (!member) return [];
    return sortHeadOfFamilyCandidates(
      familyMembers.filter((m) => m.id !== member.id && isEligibleHeadOfFamily(m))
    );
  }, [familyMembers, member]);

  const soleHeadBlock = useMemo(() => {
    if (!member || !isHeadOfFamily) return null;
    return soleHeadDeceasedBlockReason(member, familyMembers, true);
  }, [member, isHeadOfFamily, familyMembers]);

  const suggestedSuccessorId = useMemo(() => {
    if (!member || !isHeadOfFamily) return '';
    return suggestHeadSuccessor(member, familyMembers) ?? '';
  }, [member, isHeadOfFamily, familyMembers]);

  useEffect(() => {
    if (isOpen && member) {
      setNotes('');
      setEventDate('');
      setSuccessorMode('auto');
      setSuccessorId(suggestedSuccessorId);
      setError('');
      setFieldErrors({});
    }
  }, [isOpen, member, suggestedSuccessorId]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (soleHeadBlock) {
      setError(soleHeadBlock);
      return;
    }
    const errors: Record<string, string> = {};
    if (!notes.trim()) {
      errors.notes = 'Notes are required (date and circumstances of death)';
    }
    if (isHeadOfFamily && successorMode === 'manual' && !successorId) {
      errors.successorId = 'Choose the new head of family';
    }
    setFieldErrors(errors);
    const order = ['notes', 'successorId'];
    const first = order.find((k) => errors[k]);
    if (first) {
      setError(errors[first]);
      requestAnimationFrame(() => focusFirstInvalidField(order, formRef.current));
      return;
    }
    try {
      setLoading(true);
      await onSubmit(
        notes.trim(),
        eventDate || undefined,
        isHeadOfFamily && successorMode === 'manual' ? successorId : undefined
      );
      setNotes('');
      setEventDate('');
      setSuccessorId('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to mark as deceased');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CmDialogShell
      title={`Mark ${member.fullName} as Deceased`}
      subtitle="This records a permanent life event with mandatory notes."
      maxWidthClass="max-w-md"
      onBackdropClick={loading ? undefined : onClose}
      formRef={formRef}
      formProps={{
        onSubmit: handleSubmit,
        noValidate: true,
      }}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-w-[7rem] flex-1 rounded-md border border-zinc-300 px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !!soleHeadBlock}
            className="min-w-[7rem] flex-1 rounded-md bg-zinc-800 px-4 py-2.5 font-medium text-white hover:bg-zinc-900 disabled:opacity-50 sm:flex-none"
          >
            {loading ? 'Saving...' : 'Mark Deceased'}
          </button>
        </>
      }
    >
      {isHeadOfFamily && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          {SUCCESSION_ORDER_HINT}
        </p>
      )}
      {(error || soleHeadBlock) && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {error || soleHeadBlock}
        </div>
      )}
      <div className="space-y-4">
        {isHeadOfFamily && !soleHeadBlock && successorOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              New head of family
            </label>
            <div className="mt-2 space-y-2">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="successor-mode"
                  checked={successorMode === 'auto'}
                  onChange={() => setSuccessorMode('auto')}
                  className="mt-1"
                />
                <span>
                  Automatic — wife (must be labeled Wife) → eldest son → next son → eldest daughter
                  {suggestedSuccessorId && (
                    <span className="block text-zinc-500">
                      Suggested:{' '}
                      {successorOptions.find((m) => m.id === suggestedSuccessorId)?.fullName ??
                        'next eligible member'}
                    </span>
                  )}
                  {!suggestedSuccessorId && (
                    <span className="block font-medium text-amber-800 dark:text-amber-200">
                      No wife, son, or daughter available — the family will become inactive. An
                      admin must manually assign a new head of family afterward.
                    </span>
                  )}
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="successor-mode"
                  checked={successorMode === 'manual'}
                  onChange={() => setSuccessorMode('manual')}
                  className="mt-1"
                />
                <span>Choose manually</span>
              </label>
            </div>
            {successorMode === 'manual' && (
              <>
                <select
                  data-field="successorId"
                  aria-invalid={!!fieldErrors.successorId}
                  value={successorId}
                  onChange={(e) => {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.successorId;
                      return next;
                    });
                    setSuccessorId(e.target.value);
                  }}
                  className={fieldErrorClass(
                    'mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white',
                    !!fieldErrors.successorId
                  )}
                >
                  <option value="">Select new head of family</option>
                  {successorOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                      {m.relationship ? ` (${m.relationship})` : ''}
                    </option>
                  ))}
                </select>
                <FormFieldError message={fieldErrors.successorId} />
              </>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Date of death (optional)
          </label>
          <DatePartsField
            value={eventDate}
            onChange={setEventDate}
            className="mt-1"
            aria-label="Date of death"
            disableFuture
            maxYear={new Date().getFullYear()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Notes *
          </label>
          <textarea
            required
            rows={4}
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
            className={fieldErrorClass(
              'mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white',
              !!fieldErrors.notes
            )}
            placeholder="e.g. Passed away on … at …"
          />
          <FormFieldError message={fieldErrors.notes} />
        </div>
      </div>
    </CmDialogShell>
  );
}
