import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { familiesApi, membersApi } from '@/modules/church-management/api';
import {
  inheritedMembershipFromHof,
  membershipToPayload,
} from '@/modules/church-management/lib/membershipType';
import {
  getFamilyCreateFieldErrors,
  getMemberDetailsFieldErrors,
  MEMBER_DETAILS_FIELD_ORDER,
  type MemberDetailsFieldErrors,
} from '@/modules/church-management/lib/memberFormValidation';
import {
  previousDuesToPayload,
  validatePreviousDues,
} from '@/modules/church-management/lib/previousDues';
import {
  fieldErrorClass,
  firstFieldErrorMessage,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { validateUniqueSpouseRole } from '@/modules/church-management/lib/familyRoleValidation';
import { defaultRoleForGender } from '@/modules/church-management/lib/familyRoles';
import {
  EMPTY_MEMBER_DETAILS,
  MemberDetailsFields,
  type MemberDetailsFormValues,
} from '@/modules/church-management/components/MemberDetailsFields';
import {
  emptyMemberPhotoSelection,
  MemberPhotoField,
  type MemberPhotoSelection,
} from '@/modules/church-management/components/MemberPhotoField';
import { ChurchAreaSelect } from '@/modules/church-management/components/ChurchAreaSelect';
import { FamilyTombBookedFields } from '@/modules/church-management/components/FamilyTombBookedFields';
import { memberProfileExtraToPayload } from '@/modules/church-management/lib/birthYearRange';
import {
  FamilyLineageLinkFields,
  type FamilyLineageLinkValue,
} from '@/modules/church-management/components/FamilyLineageLinkFields';

const EMPTY_FAMILY = {
  familyCode: '',
  houseName: '',
  address: '',
  area: '',
  tombBooked: null as boolean | null,
  hof: { ...EMPTY_MEMBER_DETAILS },
};

const EMPTY_ADDITIONAL_MEMBER: MemberDetailsFormValues = { ...EMPTY_MEMBER_DETAILS };

export interface SessionEntry {
  id: string;
  fullName: string;
  gender: string;
  relationship?: string;
  isHeadOfFamily: boolean;
  membershipType?: string;
}

interface AddFamilyWithMembersFormProps {
  /** After create, open family detail on Lineage tab (shows linked tree). */
  navigateToLineageOnCreate?: boolean;
  onDone: () => void;
  onFamilyCreated: () => void;
  onError: (message: string) => void;
}

export function AddFamilyWithMembersForm({
  navigateToLineageOnCreate = true,
  onDone,
  onFamilyCreated,
  onError,
}: AddFamilyWithMembersFormProps) {
  const navigate = useNavigate();
  const [addMultiple, setAddMultiple] = useState(false);
  const [familyData, setFamilyData] = useState(EMPTY_FAMILY);
  const [memberData, setMemberData] = useState(EMPTY_ADDITIONAL_MEMBER);
  const [hofPhoto, setHofPhoto] = useState<MemberPhotoSelection>(() => emptyMemberPhotoSelection());
  const [memberPhoto, setMemberPhoto] = useState<MemberPhotoSelection>(() => emptyMemberPhotoSelection());
  const [createdFamilyId, setCreatedFamilyId] = useState<string | null>(null);
  const [sessionAdded, setSessionAdded] = useState<SessionEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<MemberDetailsFieldErrors>({});
  const [previousDuesError, setPreviousDuesError] = useState('');
  const [lineageLink, setLineageLink] = useState<FamilyLineageLinkValue>({
    mode: '',
    rootFamilyId: '',
  });
  const formRef = useRef<HTMLFormElement>(null);

  const familyLocked = createdFamilyId !== null;
  const hof = familyData.hof;
  const associateFamilySession = hof.membershipType === 'ASSOCIATE';
  const inheritedMemberMembership = inheritedMembershipFromHof(hof);

  const resetAll = () => {
    setAddMultiple(false);
    setFamilyData(EMPTY_FAMILY);
    setMemberData(EMPTY_ADDITIONAL_MEMBER);
    setHofPhoto(emptyMemberPhotoSelection());
    setMemberPhoto(emptyMemberPhotoSelection());
    setCreatedFamilyId(null);
    setSessionAdded([]);
    setFieldErrors({});
    setLineageLink({ mode: '', rootFamilyId: '' });
    onDone();
  };

  const handleHofGenderChange = (gender: 'MALE' | 'FEMALE') => {
    const nextRole =
      !hof.relationship || hof.relationship === defaultRoleForGender(hof.gender)
        ? defaultRoleForGender(gender)
        : hof.relationship;
    setFamilyData({
      ...familyData,
      hof: { ...hof, gender, relationship: nextRole },
    });
  };

  const clearFieldError = (key: keyof MemberDetailsFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');

    const errors = getFamilyCreateFieldErrors(familyData.address, hof, familyData.area);
    const previousDuesMsg = validatePreviousDues(hof);
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

    if (lineageLink.mode && !lineageLink.rootFamilyId) {
      onError('Select a root family for lineage linking, or turn off the link option.');
      return;
    }

    setSubmitting(true);
    try {
      const hofMembership = membershipToPayload(hof);
      const response = await familiesApi.createFamily({
        address: familyData.address || undefined,
        houseName: familyData.houseName || undefined,
        area: familyData.area,
        hofName: hof.fullName,
        hofGender: hof.gender,
        hofDob: hof.dateOfBirth || undefined,
        hofDateOfBaptism: hof.dateOfBaptism || undefined,
        hofDateOfConfirmation: hof.dateOfConfirmation || undefined,
        hofRelationship: hof.relationship || defaultRoleForGender(hof.gender),
        hofStatus: hof.status,
        contact: hof.phone || undefined,
        occupation: hof.occupation || undefined,
        qualification: hof.qualification || undefined,
        bloodGroup: hof.bloodGroup || undefined,
        hofMembershipType: hofMembership.membershipType,
        hofAssociateJoinDate: hofMembership.associateJoinDate,
        hofAssociateLeftDate: hofMembership.associateLeftDate,
        hofYearOfJoining: hofMembership.yearOfJoining,
        hofJoinYearTo: hofMembership.joinYearTo,
        tombBooked: familyData.tombBooked,
        ...previousDuesToPayload(hof),
        ...memberProfileExtraToPayload(hof),
        ...(lineageLink.mode === 'ancestor' && lineageLink.rootFamilyId
          ? { linkAsParentOfRootFamilyId: lineageLink.rootFamilyId }
          : {}),
        ...(lineageLink.mode === 'branch' && lineageLink.rootFamilyId
          ? { linkUnderRootFamilyId: lineageLink.rootFamilyId }
          : {}),
      });
      if (response.error || !response.data) {
        onError(response.error || 'Failed to create family');
        return;
      }
      const family = response.data;
      setFamilyData((current) => ({ ...current, familyCode: family.familyCode }));
      const createdHof = family.members?.find((m) => m.isHeadOfFamily);
      if (createdHof) {
        if (hofPhoto.file) {
          const photoErr = await membersApi.syncPhoto(createdHof.id, { file: hofPhoto.file });
          if (photoErr) {
            onError(`Family saved, but head photo upload failed: ${photoErr}`);
          }
        }
        setSessionAdded([
          {
            id: createdHof.id,
            fullName: createdHof.fullName,
            gender: createdHof.gender || hof.gender,
            relationship: createdHof.relationship || hof.relationship || defaultRoleForGender(hof.gender),
            isHeadOfFamily: true,
            membershipType: createdHof.membershipType ?? hof.membershipType,
          },
        ]);
      }
      onFamilyCreated();
      if (navigateToLineageOnCreate && lineageLink.mode && family.id) {
        onDone();
        navigate(churchMgmtPath('families', family.id), { state: { openLineageTab: true } });
        return;
      }
      if (addMultiple) {
        setCreatedFamilyId(family.id);
        setHofPhoto(emptyMemberPhotoSelection());
        setMemberData({
          ...EMPTY_ADDITIONAL_MEMBER,
          ...(associateFamilySession ? inheritedMemberMembership : {}),
        });
      } else {
        resetAll();
      }
    } catch {
      onError('Failed to create family');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdFamilyId) return;
    onError('');

    const errors = getMemberDetailsFieldErrors(memberData);
    const previousDuesMsg = validatePreviousDues(memberData);
    const spouseRoleError = validateUniqueSpouseRole(sessionAdded, memberData.relationship);
    if (spouseRoleError) {
      errors.relationship = spouseRoleError;
    }
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
        familyId: createdFamilyId,
        fullName: memberData.fullName,
        gender: memberData.gender,
        relationship: memberData.relationship || undefined,
        dob: memberData.dateOfBirth || undefined,
        dateOfBaptism: memberData.dateOfBaptism || undefined,
        dateOfConfirmation: memberData.dateOfConfirmation || undefined,
        phone: memberData.phone || undefined,
        occupation: memberData.occupation || undefined,
        qualification: memberData.qualification || undefined,
        bloodGroup: memberData.bloodGroup || undefined,
        status: memberData.status,
        ...membershipToPayload(memberData),
        ...previousDuesToPayload(memberData),
        ...memberProfileExtraToPayload(memberData),
      });
      if (response.error || !response.data) {
        onError(response.error || 'Failed to add member');
        return;
      }
      const m = response.data;
      if (memberPhoto.file) {
        const photoErr = await membersApi.syncPhoto(m.id, { file: memberPhoto.file });
        if (photoErr) {
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
          isHeadOfFamily: false,
          membershipType: m.membershipType ?? memberData.membershipType,
        },
      ]);
      setMemberData({
        ...EMPTY_ADDITIONAL_MEMBER,
        ...(associateFamilySession ? inheritedMemberMembership : {}),
      });
      setMemberPhoto(emptyMemberPhotoSelection());
      onFamilyCreated();
    } catch {
      onError('Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white';
  const lockedClass = `${inputClass} cursor-not-allowed bg-zinc-100 opacity-80 dark:bg-zinc-700`;

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          {familyLocked ? 'Add Family Members' : 'Add New Family'}
        </h2>
        {familyLocked && (
          <button
            type="button"
            onClick={resetAll}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Done
          </button>
        )}
      </div>

      {!familyLocked && (
        <label className="mb-4 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={addMultiple}
            onChange={(e) => setAddMultiple(e.target.checked)}
            className="rounded border-zinc-300"
          />
          Add multiple members (same family — each person starts with a fresh form)
        </label>
      )}

      {familyLocked && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-900/20">
          <p className="font-medium text-blue-900 dark:text-blue-200">
            Family {familyData.familyCode} — Head: {hof.fullName}
          </p>
          <p className="mt-1 text-blue-800 dark:text-blue-300">
            Family and head-of-family details are locked. Add each member below.
            {associateFamilySession
              ? ' This is an associate family — all members added now are associate members.'
              : ''}
          </p>
        </div>
      )}

      <form ref={formRef} onSubmit={familyLocked ? handleAddMember : handleCreateFamily} className="space-y-4" noValidate>
        <fieldset disabled={familyLocked} className="grid gap-4 md:grid-cols-2">
          <legend className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Family details
          </legend>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Family code
            </label>
            <div className={`${lockedClass} text-zinc-600 dark:text-zinc-300`}>
              {familyLocked ? familyData.familyCode : 'Generated automatically (for example, FAM001)'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Area *
            </label>
            <ChurchAreaSelect
              required
              data-field="area"
              aria-invalid={!!fieldErrors.area}
              value={familyData.area}
              disabled={familyLocked}
              onChange={(area) => {
                clearFieldError('area');
                setFamilyData({ ...familyData, area });
              }}
              className={fieldErrorClass(
                `${familyLocked ? lockedClass : inputClass} text-zinc-900 dark:text-white`,
                !!fieldErrors.area
              )}
              emptyLabel="Select church area"
            />
            <FormFieldError message={fieldErrors.area} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              House name
            </label>
            <input
              type="text"
              data-field="houseName"
              value={familyData.houseName}
              onChange={(e) => setFamilyData({ ...familyData, houseName: e.target.value })}
              placeholder="e.g. Kallumkal"
              disabled={familyLocked}
              className={familyLocked ? lockedClass : inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              House address *
            </label>
            <input
              type="text"
              required
              data-field="address"
              aria-invalid={!!fieldErrors.address}
              value={familyData.address}
              onChange={(e) => {
                clearFieldError('address');
                setFamilyData({ ...familyData, address: e.target.value });
              }}
              className={fieldErrorClass(familyLocked ? lockedClass : inputClass, !!fieldErrors.address)}
            />
            <FormFieldError message={fieldErrors.address} />
          </div>
          <FamilyTombBookedFields
            className="md:col-span-2"
            value={familyData.tombBooked}
            disabled={familyLocked}
            onChange={(tombBooked) => setFamilyData({ ...familyData, tombBooked })}
          />
          {!familyLocked ? (
            <div className="md:col-span-2">
              <FamilyLineageLinkFields
                value={lineageLink}
                onChange={setLineageLink}
                disabled={submitting}
              />
            </div>
          ) : null}
        </fieldset>

        {!familyLocked && (
          <fieldset className="grid gap-4 border-t border-zinc-200 pt-4 md:grid-cols-2 dark:border-zinc-700">
            <legend className="mb-2 md:col-span-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Head of family (saved as the first member)
            </legend>
            <p className="md:col-span-2 text-xs text-zinc-500 dark:text-zinc-400">
              Fill the same member details you would for any family person. Role defaults to
              Husband or Wife from gender.
            </p>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full name *
              </label>
              <input
                type="text"
                required
                data-field="fullName"
                aria-invalid={!!fieldErrors.fullName}
                value={hof.fullName}
                onChange={(e) => {
                  clearFieldError('fullName');
                  setFamilyData({ ...familyData, hof: { ...hof, fullName: e.target.value } });
                }}
                className={fieldErrorClass(inputClass, !!fieldErrors.fullName)}
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
                value={hof.gender}
                onChange={(e) => {
                  clearFieldError('gender');
                  handleHofGenderChange(e.target.value as 'MALE' | 'FEMALE');
                }}
                className={fieldErrorClass(inputClass, !!fieldErrors.gender)}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              <FormFieldError message={fieldErrors.gender} />
            </div>
            <MemberDetailsFields
              values={hof}
              onChange={(nextHof) => {
                setPreviousDuesError('');
                setFamilyData({ ...familyData, hof: nextHof });
              }}
              inputClass={inputClass}
              hideIdentity
              nameLabel="Full name"
              fieldErrors={fieldErrors}
              onClearFieldError={clearFieldError}
              previousDuesError={previousDuesError}
            />
            <div className="md:col-span-2">
              <MemberPhotoField value={hofPhoto} onChange={setHofPhoto} disabled={submitting} />
            </div>
          </fieldset>
        )}

        {familyLocked && (
          <fieldset className="grid gap-4 border-t border-zinc-200 pt-4 md:grid-cols-2 dark:border-zinc-700">
            <legend className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Additional member
            </legend>
            <MemberDetailsFields
              values={memberData}
              onChange={(next) => {
                setPreviousDuesError('');
                setMemberData(next);
              }}
              inputClass={inputClass}
              lockedClass={lockedClass}
              fieldErrors={fieldErrors}
              onClearFieldError={clearFieldError}
              previousDuesError={previousDuesError}
              associateFamily={associateFamilySession}
              associateLockedMessage={
                associateFamilySession
                  ? 'Head of family is associate — all family members are associate members.'
                  : undefined
              }
            />
            <div className="md:col-span-2">
              <MemberPhotoField
                value={memberPhoto}
                onChange={setMemberPhoto}
                disabled={submitting}
              />
            </div>
          </fieldset>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting
              ? 'Saving…'
              : familyLocked
                ? 'Add member'
                : addMultiple
                  ? 'Create family & continue'
                  : 'Create family'}
          </button>
          {familyLocked && (
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

export function SessionAddedList({ entries }: { entries: SessionEntry[] }) {
  return (
    <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
      <h3 className="text-sm font-semibold text-green-900 dark:text-green-200">
        Added this session ({entries.length}) — stays until you close the form
      </h3>
      <ul className="mt-3 divide-y divide-green-200 dark:divide-green-800">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm text-green-900 dark:text-green-100"
          >
            <span className="font-medium">{entry.fullName}</span>
            <span className="text-green-800 dark:text-green-300">
              {entry.gender}
              {entry.relationship ? ` · ${entry.relationship}` : ''}
              {entry.isHeadOfFamily ? ' · HOF' : ''}
              {entry.membershipType
                ? ` · ${entry.membershipType === 'ASSOCIATE' ? 'Associate' : 'Full'}`
                : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
