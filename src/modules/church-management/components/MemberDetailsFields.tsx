import {
  MEMBER_STATUS_OPTIONS,
  type MemberStatus,
} from '@/modules/church-management/lib/memberStatus';
import {
  DEFAULT_MEMBERSHIP,
  type MembershipFields,
} from '@/modules/church-management/lib/membershipType';
import { MembershipTypeFields } from '@/modules/church-management/components/MembershipTypeFields';
import { FamilyRoleSelect } from '@/modules/church-management/components/FamilyRoleSelect';
import { BloodGroupSelect } from '@/modules/church-management/components/BloodGroupSelect';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { fieldErrorClass } from '@/modules/church-management/lib/formFieldFocus';
import type { MemberDetailsFieldErrors } from '@/modules/church-management/lib/memberFormValidation';
import { sanitizePhoneDigits } from '@/modules/church-management/lib/phoneInput';
import { PreviousDuesFields } from '@/modules/church-management/components/PreviousDuesFields';
import {
  EMPTY_PREVIOUS_DUES,
  type PreviousDuesFormValues,
} from '@/modules/church-management/lib/previousDues';
import { DatePartsField } from '@/components/DatePartsField';
import { BirthYearRangeFields } from '@/modules/church-management/components/BirthYearRangeFields';

export type MemberDetailsFormValues = MembershipFields &
  PreviousDuesFormValues & {
    fullName: string;
    gender: 'MALE' | 'FEMALE' | '';
    relationship: string;
    phone: string;
    occupation: string;
    qualification: string;
    bloodGroup: string;
    dateOfBirth: string;
    birthYearFrom: string;
    birthYearTo: string;
    dateOfBaptism: string;
    dateOfConfirmation: string;
    status: MemberStatus;
  };

export const EMPTY_MEMBER_DETAILS: MemberDetailsFormValues = {
  fullName: '',
  gender: '',
  relationship: '',
  phone: '',
  occupation: '',
  qualification: '',
  bloodGroup: '',
  dateOfBirth: '',
  birthYearFrom: '',
  birthYearTo: '',
  dateOfBaptism: '',
  dateOfConfirmation: '',
  status: 'Active',
  ...DEFAULT_MEMBERSHIP,
  ...EMPTY_PREVIOUS_DUES,
};

interface MemberDetailsFieldsProps {
  values: MemberDetailsFormValues;
  onChange: (values: MemberDetailsFormValues) => void;
  inputClass: string;
  lockedClass?: string;
  disabled?: boolean;
  /** Hide name/gender when shown elsewhere (e.g. HOF name in parent form). */
  hideIdentity?: boolean;
  associateFamily?: boolean;
  associateLockedMessage?: string;
  nameLabel?: string;
  fieldErrors?: MemberDetailsFieldErrors;
  onClearFieldError?: (key: keyof MemberDetailsFieldErrors) => void;
  previousDuesError?: string;
}

export function MemberDetailsFields({
  values,
  onChange,
  inputClass,
  lockedClass,
  disabled = false,
  hideIdentity = false,
  associateFamily = false,
  associateLockedMessage,
  nameLabel = 'Full name',
  fieldErrors = {},
  onClearFieldError,
  previousDuesError,
}: MemberDetailsFieldsProps) {
  const baseClass = disabled && lockedClass ? lockedClass : inputClass;
  const fieldClass = (key: keyof MemberDetailsFieldErrors) =>
    fieldErrorClass(baseClass, !!fieldErrors[key]);

  const clear = (key: keyof MemberDetailsFieldErrors) => onClearFieldError?.(key);

  const patch = (partial: Partial<MemberDetailsFormValues>) =>
    onChange({ ...values, ...partial });

  return (
    <>
      {!hideIdentity && (
        <>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {nameLabel} *
            </label>
            <input
              type="text"
              required
              disabled={disabled}
              data-field="fullName"
              aria-invalid={!!fieldErrors.fullName}
              value={values.fullName}
              onChange={(e) => {
                clear('fullName');
                patch({ fullName: e.target.value });
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
              disabled={disabled}
              data-field="gender"
              aria-invalid={!!fieldErrors.gender}
              value={values.gender}
              onChange={(e) => {
                clear('gender');
                patch({ gender: e.target.value as 'MALE' | 'FEMALE' });
              }}
              className={fieldClass('gender')}
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <FormFieldError message={fieldErrors.gender} />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Role in family *
        </label>
        <FamilyRoleSelect
          data-field="relationship"
          aria-invalid={!!fieldErrors.relationship}
          value={values.relationship}
          onChange={(relationship) => {
            clear('relationship');
            patch({ relationship });
          }}
          className={fieldClass('relationship')}
          disabled={disabled}
          required
          allowEmpty
          emptyLabel="Select role"
        />
        <FormFieldError message={fieldErrors.relationship} />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone *</label>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{10}"
          maxLength={10}
          required
          disabled={disabled}
          data-field="phone"
          aria-invalid={!!fieldErrors.phone}
          value={values.phone}
          onChange={(e) => {
            clear('phone');
            patch({ phone: sanitizePhoneDigits(e.target.value) });
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
          disabled={disabled}
          value={values.occupation}
          onChange={(e) => patch({ occupation: e.target.value })}
          className={baseClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Qualification
        </label>
        <input
          type="text"
          disabled={disabled}
          value={values.qualification}
          onChange={(e) => patch({ qualification: e.target.value })}
          className={baseClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Blood group
        </label>
        <BloodGroupSelect
          value={values.bloodGroup}
          onChange={(bloodGroup) => patch({ bloodGroup })}
          className={baseClass}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Date of birth *
        </label>
        <div data-field="dateOfBirth">
          <DatePartsField
            disabled={disabled}
            value={values.dateOfBirth}
            onChange={(dateOfBirth) => {
              clear('dateOfBirth');
              patch({ dateOfBirth });
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
          <p className="mt-1 text-xs text-zinc-500">
            Required unless approximate birth years are entered below.
          </p>
        </div>
      </div>

      <BirthYearRangeFields
        birthYearFrom={values.birthYearFrom}
        birthYearTo={values.birthYearTo}
        onChange={(birthYearFrom, birthYearTo) => {
          clear('birthYearFrom');
          clear('birthYearTo');
          clear('dateOfBirth');
          patch({ birthYearFrom, birthYearTo });
        }}
        inputClass={baseClass}
        disabled={disabled}
        fromError={fieldErrors.birthYearFrom}
        toError={fieldErrors.birthYearTo}
      />
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Date of baptism
        </label>
        <DatePartsField
          disabled={disabled}
          value={values.dateOfBaptism}
          onChange={(dateOfBaptism) => patch({ dateOfBaptism })}
          selectClassName={baseClass}
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
          disabled={disabled}
          value={values.dateOfConfirmation}
          onChange={(dateOfConfirmation) => patch({ dateOfConfirmation })}
          selectClassName={baseClass}
          aria-label="Date of confirmation"
          minYear={1920}
          maxYear={new Date().getFullYear()}
          disableFuture
          preferYearView
          defaultYearOffset={-10}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Member status
        </label>
        <select
          disabled={disabled}
          value={values.status}
          onChange={(e) => patch({ status: e.target.value as MemberStatus })}
          className={baseClass}
        >
          {MEMBER_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500">
          {MEMBER_STATUS_OPTIONS.find((o) => o.value === values.status)?.hint}
        </p>
      </div>

      <MembershipTypeFields
        value={values}
        onChange={(membership) => {
          clear('membershipType');
          clear('joinYearFrom');
          clear('joinYearTo');
          clear('associateJoinYearFrom');
          clear('associateJoinYearTo');
          patch({ ...values, ...membership });
        }}
        disabled={disabled || associateFamily}
        lockedMessage={associateLockedMessage}
        inputClass={inputClass}
        lockedClass={lockedClass ?? inputClass}
        fieldErrors={fieldErrors}
      />

      <PreviousDuesFields
        values={values}
        onChange={(previous) => patch(previous)}
        inputClass={inputClass}
        disabled={disabled}
        error={previousDuesError}
        className="col-span-full"
      />
    </>
  );
}
