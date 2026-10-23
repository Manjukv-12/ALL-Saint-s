import { useRef, useState } from 'react';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { CmDialogShell } from '@/modules/church-management/components/CmDialogShell';
import {
  fieldErrorClass,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';

import type { Member } from '@/modules/church-management/api/types';

import { MarriageFamilySelect } from '@/modules/church-management/components/MarriageFamilySelect';
import { PersonDuesClearanceNotice } from '@/modules/church-management/components/PersonDuesClearanceNotice';
import {
  checkPersonOutstandingDues,
  formatOutstandingSummary,
} from '@/modules/church-management/lib/personOutstandingDues';
import { DatePartsField } from '@/components/DatePartsField';

export interface MarriageFormData {
  spouseName: string;
  relatedFamilyId?: string;
  externalFamilyName?: string;
  externalFamilyAddress?: string;
  notes: string;
  marriageDate: string;
}

type MarriageTarget = 'church' | 'outside';

interface MarriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  currentFamilyId?: string;
  onSubmit: (data: MarriageFormData) => Promise<void>;
  /** Close modal and send user to Fees tab to pay outstanding dues. */
  onGoCompleteDues?: () => void;
}

export function MarriageModal({
  isOpen,
  onClose,
  member,
  currentFamilyId,
  onSubmit,
  onGoCompleteDues,
}: MarriageModalProps) {
  const [spouseName, setSpouseName] = useState('');
  const [marriageTarget, setMarriageTarget] = useState<MarriageTarget>('outside');
  const [relatedFamilyId, setRelatedFamilyId] = useState('');
  const [externalFamilyName, setExternalFamilyName] = useState('');
  const [externalFamilyAddress, setExternalFamilyAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasOutstandingDues, setHasOutstandingDues] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen || !member) return null;

  const resetForm = () => {
    setSpouseName('');
    setMarriageTarget('outside');
    setRelatedFamilyId('');
    setExternalFamilyName('');
    setExternalFamilyAddress('');
    setNotes('');
    setMarriageDate('');
    setError('');
    setFieldErrors({});
    setHasOutstandingDues(false);
  };

  const handleGoCompleteDues = () => {
    onClose();
    onGoCompleteDues?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors: Record<string, string> = {};
    if (!spouseName.trim()) errors.spouseName = 'Husband name is required';
    if (!notes.trim()) errors.notes = 'Notes are required';
    if (marriageTarget === 'church') {
      if (!relatedFamilyId) errors.relatedFamilyId = "Select the husband's church family";
    } else {
      if (!externalFamilyName.trim()) errors.externalFamilyName = 'Husband family name is required';
      if (!externalFamilyAddress.trim())
        errors.externalFamilyAddress = 'Husband family address is required';
    }
    if (!marriageDate.trim()) errors.marriageDate = 'Marriage date is required';

    setFieldErrors(errors);
    const order = [
      'spouseName',
      'relatedFamilyId',
      'externalFamilyName',
      'externalFamilyAddress',
      'marriageDate',
      'notes',
    ];
    const first = order.find((k) => errors[k]);
    if (first) {
      setError(errors[first]);
      requestAnimationFrame(() => focusFirstInvalidField(order, formRef.current));
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
        `Complete all dues first, then mark married away. Still unpaid: ${formatOutstandingSummary(duesCheck.items)}`
      );
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        spouseName: spouseName.trim(),
        relatedFamilyId: marriageTarget === 'church' ? relatedFamilyId : undefined,
        externalFamilyName:
          marriageTarget === 'outside' ? externalFamilyName.trim() : undefined,
        externalFamilyAddress:
          marriageTarget === 'outside' ? externalFamilyAddress.trim() : undefined,
        notes: notes.trim(),
        marriageDate: marriageDate.trim(),
      });
      resetForm();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to mark as married');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CmDialogShell
      title={`Mark ${member.fullName} as Married (away)`}
      subtitle="Record which family she married into. She stays in this family history as Separated."
      maxWidthClass="max-w-lg"
      onBackdropClick={loading ? undefined : onClose}
      formRef={formRef}
      formProps={{ onSubmit: handleSubmit, noValidate: true }}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-w-[7rem] flex-1 rounded-md border border-zinc-300 px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || hasOutstandingDues}
            className="min-w-[7rem] flex-1 rounded-md bg-purple-600 px-4 py-2.5 font-medium text-white hover:bg-purple-700 disabled:opacity-50 sm:flex-none"
          >
            {loading ? 'Saving...' : hasOutstandingDues ? 'Pay dues first' : 'Mark as Married'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <PersonDuesClearanceNotice
          personId={member.id}
          personName={member.fullName}
          action="married_away"
          onHasOutstandingChange={setHasOutstandingDues}
          onGoCompleteDues={onGoCompleteDues ? handleGoCompleteDues : undefined}
        />

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Husband name *
          </label>
          <input
            type="text"
            required
            data-field="spouseName"
            aria-invalid={!!fieldErrors.spouseName}
            value={spouseName}
            onChange={(e) => {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.spouseName;
                return next;
              });
              setSpouseName(e.target.value);
            }}
            className={fieldErrorClass(
              'mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white',
              !!fieldErrors.spouseName
            )}
            placeholder="Enter husband name"
            autoFocus
          />
          <FormFieldError message={fieldErrors.spouseName} />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Married into which family? *
          </label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setMarriageTarget('church')}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                marriageTarget === 'church'
                  ? 'border-purple-600 bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                  : 'border-zinc-300 text-zinc-600 dark:border-zinc-600 dark:text-zinc-400'
              }`}
            >
              Church family
            </button>
            <button
              type="button"
              onClick={() => setMarriageTarget('outside')}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                marriageTarget === 'outside'
                  ? 'border-purple-600 bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                  : 'border-zinc-300 text-zinc-600 dark:border-zinc-600 dark:text-zinc-400'
              }`}
            >
              Outside church
            </button>
          </div>
        </div>

        {marriageTarget === 'church' ? (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Husband&apos;s church family *
            </label>
            <div className="mt-1">
              <MarriageFamilySelect
                excludeFamilyId={currentFamilyId ?? member.familyId}
                value={relatedFamilyId}
                onChange={(id) => setRelatedFamilyId(id)}
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Husband family name *
              </label>
              <input
                type="text"
                required
                value={externalFamilyName}
                onChange={(e) => setExternalFamilyName(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                placeholder="e.g. Krishnan family / husband's father name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Husband family address *
              </label>
              <textarea
                required
                rows={2}
                value={externalFamilyAddress}
                onChange={(e) => setExternalFamilyAddress(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                placeholder="Full address of husband's family"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Marriage date <span className="text-red-600">*</span>
          </label>
          <DatePartsField
            value={marriageDate}
            onChange={setMarriageDate}
            className="mt-1"
            required
            aria-label="Marriage date"
            disableFuture
            preferYearView
            defaultYearOffset={-5}
            minYear={1950}
            maxYear={new Date().getFullYear()}
          />
          <p className="mt-1 text-xs text-zinc-500">Required — choose the wedding date (past or today).</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Notes *
          </label>
          <textarea
            required
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            placeholder="Marriage details, parish, ceremony, etc."
          />
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            No new family is created here. {member.fullName} is marked Separated and linked to
            the husband&apos;s family for future reference.
          </p>
        </div>
      </div>
    </CmDialogShell>
  );
}
