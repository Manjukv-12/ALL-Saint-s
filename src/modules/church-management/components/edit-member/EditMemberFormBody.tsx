import type { Member } from '@/modules/church-management/api/types';
import { DatePartsField } from '@/components/DatePartsField';
import { BloodGroupSelect } from '@/modules/church-management/components/BloodGroupSelect';
import { FamilyRoleSelect } from '@/modules/church-management/components/FamilyRoleSelect';
import { MembershipTypeFields } from '@/modules/church-management/components/MembershipTypeFields';
import {
  emptyMemberPhotoSelection,
  MemberPhotoField,
  type MemberPhotoSelection,
} from '@/modules/church-management/components/MemberPhotoField';
import { PersonDuesClearanceNotice } from '@/modules/church-management/components/PersonDuesClearanceNotice';
import {
  EditMemberFormField,
  editMemberInputClass,
} from '@/modules/church-management/components/edit-member/EditMemberFormField';
import {
  MEMBER_STATUS_OPTIONS,
  shouldShowWeddingDateField,
  statusRequiresSpouse,
  type MemberStatus,
} from '@/modules/church-management/lib/memberStatus';
import { requiresDuesClearanceForStatusChange } from '@/modules/church-management/lib/personOutstandingDues';
import { PREVIOUS_DUES_THROUGH_YEAR } from '@/modules/church-management/lib/feesYearPolicy';
import { soleHeadDeceasedBlockReason } from '@/modules/church-management/lib/hofEligibility';
import type {
  EditMemberFieldErrors,
  EditMemberFormValues,
} from '@/modules/church-management/lib/editMemberValidation';
import { sanitizePhoneDigits } from '@/modules/church-management/lib/phoneInput';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { PreviousDuesFields } from '@/modules/church-management/components/PreviousDuesFields';
import { BirthYearRangeFields } from '@/modules/church-management/components/BirthYearRangeFields';
import { User, Users, Briefcase, HeartPulse, BadgeCheck, History } from 'lucide-react';

type Props = {
  member: Member;
  formData: EditMemberFormValues;
  originalStatus: MemberStatus;
  familyMembers: Member[];
  fieldErrors: EditMemberFieldErrors;
  photo: MemberPhotoSelection;
  loading: boolean;
  canSetHeadOfFamily: boolean;
  onChange: (patch: Partial<EditMemberFormValues>) => void;
  onPhotoChange: (photo: MemberPhotoSelection) => void;
  onPhoneBlur: () => void;
  onHasOutstandingChange: (has: boolean) => void;
  onGoCompleteDues?: () => void;
};

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <section className={`${ui.card} overflow-hidden`}>
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-800/40">
        <div className="flex items-start gap-3">
          <div className={ui.pageHeaderIcon}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))] dark:text-zinc-100">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))] dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function EditMemberFormBody({
  member,
  formData,
  originalStatus,
  familyMembers,
  fieldErrors,
  photo,
  loading,
  canSetHeadOfFamily,
  onChange,
  onPhotoChange,
  onPhoneBlur,
  onHasOutstandingChange,
  onGoCompleteDues,
}: Props) {
  const changingToSeparated = requiresDuesClearanceForStatusChange(
    originalStatus,
    formData.status
  );
  const showWeddingDate = shouldShowWeddingDateField({
    status: formData.status,
    relationship: formData.relationship,
    maritalStatus:
      formData.status === 'Separated'
        ? 'Married'
        : formData.status === 'Divorced'
          ? 'Divorced'
          : member?.maritalStatus,
  });
  const soleHeadDeceasedAlert =
    formData.status === 'Deceased' && originalStatus !== 'Deceased'
      ? soleHeadDeceasedBlockReason(
          member,
          familyMembers,
          !!member.isHeadOfFamily || formData.isHeadOfFamily
        )
      : null;
  const statusChanged = formData.status !== originalStatus;

  return (
    <div className="space-y-6 pb-6">
      {fieldErrors._form && (
        <div className={ui.alertError} role="alert">
          {fieldErrors._form}
        </div>
      )}

      <SectionCard
        title="Personal details"
        description="Name, gender, and profile photo"
        icon={User}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <EditMemberFormField
            label="Full name"
            required
            error={fieldErrors.fullName}
          >
            <input
              id="edit-fullName"
              data-field="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              className={editMemberInputClass(!!fieldErrors.fullName)}
              autoComplete="name"
            />
          </EditMemberFormField>

          <EditMemberFormField label="Gender" required error={fieldErrors.gender}>
            <select
              id="edit-gender"
              data-field="gender"
              value={formData.gender}
              onChange={(e) =>
                onChange({ gender: e.target.value as 'MALE' | 'FEMALE' | '' })
              }
              className={editMemberInputClass(!!fieldErrors.gender)}
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </EditMemberFormField>
        </div>

        <MemberPhotoField
          existingPhoto={member.photo}
          value={photo}
          onChange={onPhotoChange}
          disabled={loading}
        />
      </SectionCard>

      <SectionCard
        title="Family & contact"
        description="Role in this family and contact information"
        icon={Users}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <EditMemberFormField
            label="Role in family"
            required
            error={fieldErrors.relationship}
            hint="Mark the spouse as Wife or Husband — succession uses this label only."
          >
            <FamilyRoleSelect
              data-field="relationship"
              aria-invalid={!!fieldErrors.relationship}
              value={formData.relationship}
              onChange={(relationship) => onChange({ relationship })}
              required
              allowEmpty={false}
              className={editMemberInputClass(!!fieldErrors.relationship)}
            />
          </EditMemberFormField>

          <EditMemberFormField
            label="Phone"
            error={fieldErrors.phone}
            hint="Optional — 10-digit mobile number (digits only)."
          >
            <input
              id="edit-phone"
              data-field="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formData.phone}
              onChange={(e) => onChange({ phone: sanitizePhoneDigits(e.target.value) })}
              onBlur={onPhoneBlur}
              placeholder="e.g. 9876543210"
              className={editMemberInputClass(!!fieldErrors.phone)}
              autoComplete="tel"
            />
          </EditMemberFormField>

          <EditMemberFormField
            label="Date of birth"
            error={fieldErrors.dateOfBirth}
            hint="Optional if approximate birth years are entered below."
          >
            <DatePartsField
              value={formData.dateOfBirth}
              onChange={(dateOfBirth) => onChange({ dateOfBirth })}
              className="w-full"
              aria-label="Date of birth"
              minYear={1920}
              maxYear={new Date().getFullYear()}
              disableFuture
              preferYearView
              defaultYearOffset={-25}
            />
          </EditMemberFormField>

          <BirthYearRangeFields
            birthYearFrom={formData.birthYearFrom}
            birthYearTo={formData.birthYearTo}
            onChange={(birthYearFrom, birthYearTo) =>
              onChange({ birthYearFrom, birthYearTo })
            }
            inputClass={editMemberInputClass(!!fieldErrors.birthYearFrom)}
            fromError={fieldErrors.birthYearFrom}
            toError={fieldErrors.birthYearTo}
            className="sm:col-span-2"
          />

          <EditMemberFormField
            label="Date of baptism"
            error={fieldErrors.dateOfBaptism}
            hint="Optional — when this member was baptised."
          >
            <DatePartsField
              value={formData.dateOfBaptism}
              onChange={(dateOfBaptism) => onChange({ dateOfBaptism })}
              className="w-full"
              aria-label="Date of baptism"
              minYear={1920}
              maxYear={new Date().getFullYear()}
              disableFuture
              preferYearView
              defaultYearOffset={-20}
            />
          </EditMemberFormField>

          <EditMemberFormField
            label="Date of confirmation"
            error={fieldErrors.dateOfConfirmation}
            hint="Optional — when this member was confirmed."
          >
            <DatePartsField
              value={formData.dateOfConfirmation}
              onChange={(dateOfConfirmation) => onChange({ dateOfConfirmation })}
              className="w-full"
              aria-label="Date of confirmation"
              minYear={1920}
              maxYear={new Date().getFullYear()}
              disableFuture
              preferYearView
              defaultYearOffset={-10}
            />
          </EditMemberFormField>

          {showWeddingDate && (
            <EditMemberFormField
              label={
                formData.status === 'Separated' ? 'Marriage date' : 'Date of wedding'
              }
              required={formData.status === 'Separated'}
              error={fieldErrors.dateOfWedding}
              hint={
                formData.status === 'Separated'
                  ? 'Required — choose the wedding date.'
                  : formData.status === 'Divorced'
                    ? 'Optional — date of the marriage that ended.'
                    : 'Optional — saving this also updates the Husband/Wife in this family.'
              }
            >
              <DatePartsField
                value={formData.dateOfWedding}
                onChange={(dateOfWedding) => onChange({ dateOfWedding })}
                className="w-full"
                required={formData.status === 'Separated'}
                aria-label={
                  formData.status === 'Separated' ? 'Marriage date' : 'Date of wedding'
                }
                minYear={1950}
                maxYear={new Date().getFullYear()}
                disableFuture
                preferYearView
                defaultYearOffset={-15}
              />
            </EditMemberFormField>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Work & health"
        description="Occupation, education, and blood group"
        icon={Briefcase}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <EditMemberFormField label="Occupation">
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => onChange({ occupation: e.target.value })}
              className={editMemberInputClass()}
            />
          </EditMemberFormField>

          <EditMemberFormField label="Qualification">
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => onChange({ qualification: e.target.value })}
              className={editMemberInputClass()}
            />
          </EditMemberFormField>

          <EditMemberFormField label="Blood group">
            <BloodGroupSelect
              value={formData.bloodGroup}
              onChange={(bloodGroup) => onChange({ bloodGroup })}
              className={editMemberInputClass()}
            />
          </EditMemberFormField>
        </div>
      </SectionCard>

      <SectionCard
        title="Member status"
        description="Living status, notes, and separation details"
        icon={HeartPulse}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <EditMemberFormField
            label="Member status"
            hint={MEMBER_STATUS_OPTIONS.find((o) => o.value === formData.status)?.hint}
          >
            <select
              value={formData.status}
              onChange={(e) => {
                const next = e.target.value as MemberStatus;
                onChange({
                  status: next,
                  dateOfWedding:
                    next === 'Separated' && formData.status !== 'Separated'
                      ? ''
                      : formData.dateOfWedding,
                });
              }}
              className={editMemberInputClass()}
            >
              {MEMBER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </EditMemberFormField>

          {statusRequiresSpouse(formData.status) && (
            <EditMemberFormField
              label="Spouse name"
              required
              error={fieldErrors.spouseName}
              hint={
                formData.status === 'Divorced'
                  ? 'Required for divorce history (former spouse).'
                  : 'Required for Married To / married away records.'
              }
            >
              <input
                type="text"
                value={formData.spouseName}
                onChange={(e) => onChange({ spouseName: e.target.value })}
                placeholder="Name of spouse"
                className={editMemberInputClass(!!fieldErrors.spouseName)}
              />
            </EditMemberFormField>
          )}
        </div>

        {soleHeadDeceasedAlert && (
          <div className={ui.alertError} role="alert">
            {soleHeadDeceasedAlert}
          </div>
        )}

        {changingToSeparated && (
          <PersonDuesClearanceNotice
            personId={member.id}
            personName={member.fullName}
            action="status_separated"
            onHasOutstandingChange={onHasOutstandingChange}
            onGoCompleteDues={onGoCompleteDues}
          />
        )}

        <EditMemberFormField
          label="Comment / status notes"
          required={statusChanged}
          error={fieldErrors.statusNotes}
          hint="Notes are kept on the member profile; they are not shown in the members list."
        >
          <textarea
            rows={4}
            value={formData.statusNotes}
            onChange={(e) => onChange({ statusNotes: e.target.value })}
            placeholder={
              statusChanged
                ? 'Required when changing status — e.g. reason for separation or death details'
                : 'Optional note about this member (visible on their profile)'
            }
            className={`${editMemberInputClass(!!fieldErrors.statusNotes)} min-h-[7rem] resize-y`}
          />
        </EditMemberFormField>
      </SectionCard>

      <SectionCard
        title="Membership"
        description="Full or associate membership with year of joining"
        icon={BadgeCheck}
      >
        {fieldErrors.membershipType && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {fieldErrors.membershipType}
          </p>
        )}
        <MembershipTypeFields
          value={formData}
          onChange={(membership) => onChange(membership)}
          inputClass={editMemberInputClass(!!fieldErrors.membershipType)}
          fieldErrors={fieldErrors}
        />

        {canSetHeadOfFamily && formData.status === 'Active' && (
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/25 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={formData.isHeadOfFamily}
                onChange={(e) => onChange({ isHeadOfFamily: e.target.checked })}
                className="mt-1 h-4 w-4 rounded accent-[hsl(var(--primary))]"
              />
              <span>
                <span className="block text-sm font-medium text-[hsl(var(--foreground))] dark:text-zinc-200">
                  Head of family
                </span>
                <span className="mt-0.5 block text-xs text-[hsl(var(--muted-foreground))] dark:text-zinc-500">
                  Only one head per family. You will be asked to confirm before the change is
                  saved.
                </span>
              </span>
            </label>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Previous dues"
        description={`Manual record for balances through ${PREVIOUS_DUES_THROUGH_YEAR} — not linked to current fee rows`}
        icon={History}
      >
        <PreviousDuesFields
          values={formData}
          onChange={(previous) => onChange(previous)}
          inputClass={editMemberInputClass(!!fieldErrors.previousDues)}
          disabled={loading}
          error={fieldErrors.previousDues}
          className="border-0 bg-transparent p-0 dark:bg-transparent"
        />
      </SectionCard>
    </div>
  );
}

export { emptyMemberPhotoSelection };
