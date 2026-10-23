import { useEffect, useMemo, useRef, useState } from 'react';
import { membersApi } from '@/modules/church-management/api';
import type { Family, Member } from '@/modules/church-management/api/types';
import {
  MEMBER_STATUS_OPTIONS,
  type MemberStatus,
} from '@/modules/church-management/lib/memberStatus';
import {
  DEFAULT_MEMBERSHIP,
  inheritedMembershipForFamily,
  isAssociateFamily,
  membershipToPayload,
} from '@/modules/church-management/lib/membershipType';
import {
  getMemberDetailsFieldErrors,
  MEMBER_DETAILS_FIELD_ORDER,
  type MemberDetailsFieldErrors,
} from '@/modules/church-management/lib/memberFormValidation';
import {
  fieldErrorClass,
  firstFieldErrorMessage,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { validateUniqueSpouseRole } from '@/modules/church-management/lib/familyRoleValidation';
import { MembershipTypeFields } from '@/modules/church-management/components/MembershipTypeFields';
import { FamilyRoleSelect } from '@/modules/church-management/components/FamilyRoleSelect';
import { BloodGroupSelect } from '@/modules/church-management/components/BloodGroupSelect';
import {
  emptyMemberPhotoSelection,
  MemberPhotoField,
  type MemberPhotoSelection,
} from '@/modules/church-management/components/MemberPhotoField';
import { sanitizePhoneDigits } from '@/modules/church-management/lib/phoneInput';
import { PreviousDuesFields } from '@/modules/church-management/components/PreviousDuesFields';
import {
  EMPTY_PREVIOUS_DUES,
  previousDuesToPayload,
  validatePreviousDues,
  type PreviousDuesFormValues,
} from '@/modules/church-management/lib/previousDues';
import { DatePartsField } from '@/components/DatePartsField';
import { BirthYearRangeFields } from '@/modules/church-management/components/BirthYearRangeFields';
import { memberProfileExtraToPayload } from '@/modules/church-management/lib/birthYearRange';
import { SessionAddedList, type SessionEntry } from './AddFamilyWithMembersForm';
import { toast } from 'sonner';

const EMPTY_MEMBER = {
  fullName: '',
  gender: '' as 'MALE' | 'FEMALE' | '',
  relationship: '',
  dateOfBirth: '',
  birthYearFrom: '',
  birthYearTo: '',
  dateOfBaptism: '',
  dateOfConfirmation: '',
  ...DEFAULT_MEMBERSHIP,
};

interface SharedDefaults {
  familyId: string;
  phone: string;
  occupation: string;
  qualification: string;
  bloodGroup: string;
  status: MemberStatus;
}

const EMPTY_SHARED: SharedDefaults = {
  familyId: '',
  phone: '',
  occupation: '',
  qualification: '',
  bloodGroup: '',
  status: 'Active',
};

/** Per-member fields reset between adds; family selection stays. */
function resetPerMemberShared(prev: SharedDefaults): SharedDefaults {
  return {
    ...prev,
    phone: '',
    occupation: '',
    qualification: '',
    bloodGroup: '',
    status: 'Active',
  };
}

interface AddMemberFormProps {
  families?: Family[];
  /** When set, family is fixed (e.g. family details page) — no family dropdown. */
  fixedFamily?: Family | null;
  embedded?: boolean;
  onDone: () => void;
  onMemberCreated: () => void;
  onError: (message: string) => void;
}

export function AddMemberForm({
  families = [],
  fixedFamily = null,
  embedded = false,
  onDone,
  onMemberCreated,
  onError,
}: AddMemberFormProps) {
  const [addMultiple, setAddMultiple] = useState(false);
  const [shared, setShared] = useState<SharedDefaults>(() => ({
    ...EMPTY_SHARED,
    familyId: fixedFamily?.id ?? '',
  }));
  const [memberData, setMemberData] = useState(EMPTY_MEMBER);
  const [photo, setPhoto] = useState<MemberPhotoSelection>(() => emptyMemberPhotoSelection());
  const [sessionAdded, setSessionAdded] = useState<SessionEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<MemberDetailsFieldErrors>({});
  const [previousDues, setPreviousDues] = useState<PreviousDuesFormValues>(EMPTY_PREVIOUS_DUES);
  const [previousDuesError, setPreviousDuesError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fixedFamily?.id) {
      setShared((prev) => ({ ...prev, familyId: fixedFamily.id }));
    }
  }, [fixedFamily?.id]);

  const familyList = useMemo(
    () => (fixedFamily ? [fixedFamily, ...families.filter((f) => f.id !== fixedFamily.id)] : families),
    [families, fixedFamily]
  );

  const selectedFamily = useMemo(
    () => familyList.find((f) => f.id === shared.familyId) ?? fixedFamily ?? null,
    [familyList, shared.familyId, fixedFamily]
  );

  const headOfFamily = useMemo(
    () => selectedFamily?.members?.find((m) => m.isHeadOfFamily),
    [selectedFamily]
  );

  const associateFamily = useMemo(
    () => isAssociateFamily(selectedFamily),
    [selectedFamily]
  );

  const inheritedMembership = useMemo(
    () => inheritedMembershipForFamily(selectedFamily),
    [selectedFamily]
  );

  useEffect(() => {
    if (!selectedFamily) return;
    if (isAssociateFamily(selectedFamily)) {
      setMemberData((prev) => ({
        ...prev,
        ...inheritedMembershipForFamily(selectedFamily),
      }));
    } else {
      setMemberData((prev) => ({
        ...prev,
        membershipType: 'FULL',
        joinYearFrom: '',
        joinYearTo: '',
        associateJoinYearFrom: '',
        associateJoinYearTo: '',
      }));
    }
  }, [selectedFamily?.id, selectedFamily]);

  const resetAll = () => {
    setAddMultiple(false);
    setShared({
      ...EMPTY_SHARED,
      familyId: fixedFamily?.id ?? '',
    });
    setMemberData(EMPTY_MEMBER);
    setPhoto(emptyMemberPhotoSelection());
    setPreviousDues(EMPTY_PREVIOUS_DUES);
    setPreviousDuesError('');
    setSessionAdded([]);
    onDone();
  };

  const clearFieldError = (key: keyof MemberDetailsFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');

    const errors = getMemberDetailsFieldErrors(
      {
        ...memberData,
        phone: shared.phone,
        familyId: shared.familyId,
      },
      { requireFamily: !fixedFamily }
    );

    const existingMembers = [
      ...(selectedFamily?.members ?? []),
      ...sessionAdded.map((entry) => ({
        id: entry.id,
        fullName: entry.fullName,
        relationship: entry.relationship,
      })),
    ];
    const spouseRoleError = validateUniqueSpouseRole(
      existingMembers,
      memberData.relationship
    );
    if (spouseRoleError) {
      errors.relationship = spouseRoleError;
    }

    const previousDuesMsg = validatePreviousDues(previousDues);
    setPreviousDuesError(previousDuesMsg ?? '');

    setFieldErrors(errors);
    const firstMsg =
      previousDuesMsg || firstFieldErrorMessage(errors, MEMBER_DETAILS_FIELD_ORDER);
    if (firstMsg) {
      onError(firstMsg);
      requestAnimationFrame(() => {
        focusFirstInvalidField([...MEMBER_DETAILS_FIELD_ORDER], formRef.current);
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await membersApi.createMember({
        familyId: shared.familyId,
        fullName: memberData.fullName,
        gender: memberData.gender,
        relationship: memberData.relationship || undefined,
        dob: memberData.dateOfBirth || undefined,
        dateOfBaptism: memberData.dateOfBaptism || undefined,
        dateOfConfirmation: memberData.dateOfConfirmation || undefined,
        phone: shared.phone || undefined,
        occupation: shared.occupation || undefined,
        qualification: shared.qualification || undefined,
        bloodGroup: shared.bloodGroup || undefined,
        status: shared.status,
        ...membershipToPayload(memberData),
        ...previousDuesToPayload(previousDues),
        ...memberProfileExtraToPayload(memberData),
      });
      if (response.error || !response.data) {
        onError(response.error || 'Failed to create member');
        return;
      }
      const m: Member = response.data;
      let photoWarning = '';
      if (photo.file) {
        const photoErr = await membersApi.syncPhoto(m.id, { file: photo.file });
        if (photoErr) {
          photoWarning = photoErr;
          onError(`Member saved, but photo upload failed: ${photoErr}`);
        }
      }
      setSessionAdded((prev) => [
        ...prev,
        {
          id: m.id,
          fullName: m.fullName,
          gender: m.gender || memberData.gender,
          relationship: m.relationship || memberData.relationship,
          isHeadOfFamily: !!m.isHeadOfFamily,
        },
      ]);
      setMemberData({
        ...EMPTY_MEMBER,
        ...(associateFamily ? inheritedMembership : DEFAULT_MEMBERSHIP),
      });
      if (addMultiple) {
        setShared(resetPerMemberShared);
      }
      setPhoto(emptyMemberPhotoSelection());
      setPreviousDues(EMPTY_PREVIOUS_DUES);
      setPreviousDuesError('');
      setFieldErrors({});
      onMemberCreated();

      const roleLabel = m.relationship || memberData.relationship;
      if (photoWarning) {
        toast.warning(`${m.fullName} was added`, {
          description: `Photo could not be uploaded. You can add it later from Edit member.`,
          duration: 5000,
        });
      } else if (addMultiple) {
        toast.success(`${m.fullName} added`, {
          description: roleLabel
            ? `${roleLabel} — you can add another member to this family.`
            : 'You can add another member to this family.',
          duration: 3500,
        });
      } else {
        toast.success(`${m.fullName} added successfully`, {
          description: roleLabel ? `Saved as ${roleLabel}.` : 'Member is now in the family list.',
          duration: 3500,
        });
      }

      if (!addMultiple) {
        resetAll();
      }
    } catch {
      onError('Failed to create member');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white';
  const lockedClass = `${inputClass} cursor-not-allowed bg-zinc-100 opacity-80 dark:bg-zinc-700`;
  const fieldClass = (key: keyof MemberDetailsFieldErrors, locked = false) =>
    fieldErrorClass(locked ? lockedClass : inputClass, !!fieldErrors[key]);

  const shellClass = embedded
    ? ''
    : 'mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900';

  return (
    <div className={shellClass}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          {fixedFamily ? `Add Person to ${fixedFamily.familyCode}` : 'Add New Member'}
        </h2>
        {addMultiple && sessionAdded.length > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
          >
            Done
          </button>
        )}
      </div>

      <label className="mb-4 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={addMultiple}
          onChange={(e) => setAddMultiple(e.target.checked)}
          className="rounded border-zinc-300"
        />
        Add multiple members (same family — each person starts with a fresh form)
      </label>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          {fixedFamily ? (
            <div className="md:col-span-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm dark:border-blue-800 dark:bg-blue-900/20">
              <span className="text-blue-900 dark:text-blue-200">
                Family: <strong>{fixedFamily.familyCode}</strong>
                {headOfFamily ? (
                  <>
                    {' '}
                    · Head of family: <strong>{headOfFamily.fullName}</strong>
                  </>
                ) : null}
                {associateFamily ? (
                  <>
                    {' '}
                    · <strong>Associate family</strong> — new members are associate automatically
                  </>
                ) : null}
              </span>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Family *
              </label>
              <select
                required
                data-field="familyId"
                aria-invalid={!!fieldErrors.familyId}
                value={shared.familyId}
                disabled={addMultiple && sessionAdded.length > 0}
                onChange={(e) => {
                  clearFieldError('familyId');
                  setShared({ ...shared, familyId: e.target.value });
                }}
                className={fieldClass('familyId', addMultiple && sessionAdded.length > 0)}
              >
                <option value="">Select Family</option>
                {familyList.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.familyCode}
                  </option>
                ))}
              </select>
              <FormFieldError message={fieldErrors.familyId} />
            </div>
          )}

          {!fixedFamily && headOfFamily && (
            <div className="flex items-end">
              <div className="w-full rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm dark:border-blue-800 dark:bg-blue-900/20">
                <span className="text-blue-900 dark:text-blue-200">
                  Head of family: <strong>{headOfFamily.fullName}</strong>
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Full Name *
            </label>
            <input
              type="text"
              required
              data-field="fullName"
              aria-invalid={!!fieldErrors.fullName}
              value={memberData.fullName}
              onChange={(e) => {
                clearFieldError('fullName');
                setMemberData({ ...memberData, fullName: e.target.value });
              }}
              className={fieldClass('fullName')}
            />
            <FormFieldError message={fieldErrors.fullName} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Gender *
            </label>
            <select
              required
              data-field="gender"
              aria-invalid={!!fieldErrors.gender}
              value={memberData.gender}
              onChange={(e) => {
                const gender = e.target.value as 'MALE' | 'FEMALE' | '';
                clearFieldError('gender');
                setMemberData({ ...memberData, gender });
              }}
              className={fieldClass('gender')}
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <FormFieldError message={fieldErrors.gender} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Role in family *
            </label>
            <FamilyRoleSelect
              data-field="relationship"
              aria-invalid={!!fieldErrors.relationship}
              value={memberData.relationship}
              onChange={(relationship) => {
                clearFieldError('relationship');
                setMemberData({ ...memberData, relationship });
              }}
              className={fieldClass('relationship')}
              required
              allowEmpty
              emptyLabel="Select role"
            />
            <FormFieldError message={fieldErrors.relationship} />
            <p className="mt-1 text-xs text-zinc-500">
              Mark the spouse as Wife — succession uses the Wife label only.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Phone *
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              required
              data-field="phone"
              aria-invalid={!!fieldErrors.phone}
              value={shared.phone}
              onChange={(e) => {
                clearFieldError('phone');
                setShared({ ...shared, phone: sanitizePhoneDigits(e.target.value) });
              }}
              placeholder="10-digit mobile number"
              className={fieldClass('phone')}
              autoComplete="tel"
            />
            <FormFieldError message={fieldErrors.phone} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Occupation
            </label>
            <input
              type="text"
              value={shared.occupation}
              onChange={(e) => setShared({ ...shared, occupation: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Blood Group
            </label>
            <BloodGroupSelect
              value={shared.bloodGroup}
              onChange={(bloodGroup) => setShared({ ...shared, bloodGroup })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Member status
            </label>
            <select
              value={shared.status}
              onChange={(e) =>
                setShared({ ...shared, status: e.target.value as MemberStatus })
              }
              className={inputClass}
            >
              {MEMBER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              {MEMBER_STATUS_OPTIONS.find((o) => o.value === shared.status)?.hint}
            </p>
          </div>

          {!fixedFamily && associateFamily && selectedFamily && (
            <div className="md:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800 dark:bg-amber-900/20">
              <span className="text-amber-900 dark:text-amber-200">
                <strong>{selectedFamily.familyCode}</strong> is an associate family — all new members
                will be associate members.
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Date of birth *
            </label>
            <div data-field="dateOfBirth">
              <DatePartsField
                value={memberData.dateOfBirth}
                onChange={(dateOfBirth) => {
                  clearFieldError('dateOfBirth');
                  setMemberData({ ...memberData, dateOfBirth });
                }}
                selectClassName={fieldClass('dateOfBirth')}
                aria-label="Date of birth"
                minYear={1920}
                maxYear={new Date().getFullYear()}
                disableFuture
                preferYearView
                defaultYearOffset={-25}
              />
              <FormFieldError message={fieldErrors.dateOfBirth} />
            </div>
          </div>

          <BirthYearRangeFields
            birthYearFrom={memberData.birthYearFrom}
            birthYearTo={memberData.birthYearTo}
            onChange={(birthYearFrom, birthYearTo) => {
              clearFieldError('birthYearFrom');
              clearFieldError('birthYearTo');
              clearFieldError('dateOfBirth');
              setMemberData({ ...memberData, birthYearFrom, birthYearTo });
            }}
            inputClass={inputClass}
            fromError={fieldErrors.birthYearFrom}
            toError={fieldErrors.birthYearTo}
            className="md:col-span-2"
          />

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Date of baptism
            </label>
            <DatePartsField
              value={memberData.dateOfBaptism}
              onChange={(dateOfBaptism) => setMemberData({ ...memberData, dateOfBaptism })}
              selectClassName={inputClass}
              aria-label="Date of baptism"
              minYear={1920}
              maxYear={new Date().getFullYear()}
              disableFuture
              preferYearView
              defaultYearOffset={-20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Date of confirmation
            </label>
            <DatePartsField
              value={memberData.dateOfConfirmation}
              onChange={(dateOfConfirmation) => setMemberData({ ...memberData, dateOfConfirmation })}
              selectClassName={inputClass}
              aria-label="Date of confirmation"
              minYear={1920}
              maxYear={new Date().getFullYear()}
              disableFuture
              preferYearView
              defaultYearOffset={-10}
            />
          </div>

          <MembershipTypeFields
            value={memberData}
            onChange={(membership) => {
              clearFieldError('membershipType');
              clearFieldError('joinYearFrom');
              clearFieldError('joinYearTo');
              clearFieldError('associateJoinYearFrom');
              clearFieldError('associateJoinYearTo');
              setMemberData({ ...memberData, ...membership });
            }}
            disabled={associateFamily}
            lockedMessage={
              associateFamily
                ? 'This family is registered as associate. All members added here are associate members with the same join date.'
                : undefined
            }
            inputClass={inputClass}
            lockedClass={lockedClass}
            fieldErrors={fieldErrors}
          />

          <PreviousDuesFields
            values={previousDues}
            onChange={(next) => {
              setPreviousDues(next);
              setPreviousDuesError('');
            }}
            inputClass={inputClass}
            disabled={submitting}
            error={previousDuesError}
          />

          <div className="md:col-span-2">
            <MemberPhotoField value={photo} onChange={setPhoto} disabled={submitting} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : addMultiple ? 'Add Member' : 'Create Member'}
          </button>
          {addMultiple && sessionAdded.length > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
            >
              Done adding members
            </button>
          )}
        </div>
      </form>

      {sessionAdded.length > 0 && <SessionAddedList entries={sessionAdded} />}
    </div>
  );
}
