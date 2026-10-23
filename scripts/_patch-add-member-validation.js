const fs = require('fs');

const formPath =
  'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/components/AddMemberForm.tsx';
const membershipPath =
  'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/components/MembershipTypeFields.tsx';
const rolePath =
  'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/components/FamilyRoleSelect.tsx';

fs.writeFileSync(
  'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/components/FormFieldError.tsx',
  `/** Inline validation message under a form control. */
export function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
      {message}
    </p>
  );
}
`
);

// FamilyRoleSelect: pass through data-field / aria-invalid
let role = fs.readFileSync(rolePath, 'utf8');
if (!role.includes('data-field')) {
  role = role.replace(
    `interface FamilyRoleSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
}`,
    `interface FamilyRoleSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  'data-field'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}`
  );
  role = role.replace(
    `  emptyLabel = 'Select role',
  disabled = false,
}: FamilyRoleSelectProps) {`,
    `  emptyLabel = 'Select role',
  disabled = false,
  'data-field': dataField,
  'aria-invalid': ariaInvalid,
}: FamilyRoleSelectProps) {`
  );
  role = role.replace(
    `    <select
      required={required}
      disabled={disabled}
      value={normalized}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >`,
    `    <select
      required={required}
      disabled={disabled}
      value={normalized}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      data-field={dataField}
      aria-invalid={ariaInvalid}
    >`
  );
  fs.writeFileSync(rolePath, role);
  console.log('FamilyRoleSelect updated');
}

// MembershipTypeFields: fieldErrors support
let mem = fs.readFileSync(membershipPath, 'utf8');
if (!mem.includes('fieldErrors')) {
  mem = mem.replace(
    `import { DatePartsField } from '@/components/DatePartsField';`,
    `import { DatePartsField } from '@/components/DatePartsField';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { fieldErrorClass } from '@/modules/church-management/lib/formFieldFocus';
import type { MemberDetailsFieldErrors } from '@/modules/church-management/lib/memberFormValidation';`
  );
  mem = mem.replace(
    `  inputClass: string;
  lockedClass?: string;
}`,
    `  inputClass: string;
  lockedClass?: string;
  fieldErrors?: MemberDetailsFieldErrors;
}`
  );
  mem = mem.replace(
    `  inputClass,
  lockedClass,
}: MembershipTypeFieldsProps) {
  const fieldClass = disabled && lockedClass ? lockedClass : inputClass;`,
    `  inputClass,
  lockedClass,
  fieldErrors = {},
}: MembershipTypeFieldsProps) {
  const fieldClass = disabled && lockedClass ? lockedClass : inputClass;`
  );
  mem = mem.replace(
    `          <select
            required
            disabled={disabled}
            value={value.membershipType}
            onChange={(e) =>
              onChange({
                ...value,
                membershipType: e.target.value as MembershipType,
                associateJoinDate:
                  e.target.value === 'ASSOCIATE' ? value.associateJoinDate : '',
                associateLeftDate:
                  e.target.value === 'ASSOCIATE' ? value.associateLeftDate : '',
              })
            }
            className={fieldClass}
          >`,
    `          <select
            required
            disabled={disabled}
            data-field="membershipType"
            aria-invalid={!!fieldErrors.membershipType}
            value={value.membershipType}
            onChange={(e) =>
              onChange({
                ...value,
                membershipType: e.target.value as MembershipType,
                associateJoinDate:
                  e.target.value === 'ASSOCIATE' ? value.associateJoinDate : '',
                associateLeftDate:
                  e.target.value === 'ASSOCIATE' ? value.associateLeftDate : '',
              })
            }
            className={fieldErrorClass(fieldClass, !!fieldErrors.membershipType)}
          >`
  );
  mem = mem.replace(
    `          {selected && (
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{selected.hint}</p>
          )}
        </div>`,
    `          {selected && !fieldErrors.membershipType && (
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{selected.hint}</p>
          )}
          <FormFieldError message={fieldErrors.membershipType} />
        </div>`
  );
  mem = mem.replace(
    `              <DatePartsField
                required
                disabled={disabled}
                value={value.associateJoinDate}
                onChange={(associateJoinDate) => onChange({ ...value, associateJoinDate })}
                selectClassName={fieldClass}
                aria-label="Associate join date"
                disableFuture
                preferYearView
                defaultYearOffset={-2}
              />
            </div>`,
    `              <div data-field="associateJoinDate">
                <DatePartsField
                  required
                  disabled={disabled}
                  value={value.associateJoinDate}
                  onChange={(associateJoinDate) => onChange({ ...value, associateJoinDate })}
                  selectClassName={fieldErrorClass(fieldClass, !!fieldErrors.associateJoinDate)}
                  aria-label="Associate join date"
                  disableFuture
                  preferYearView
                  defaultYearOffset={-2}
                />
                <FormFieldError message={fieldErrors.associateJoinDate} />
              </div>
            </div>`
  );
  mem = mem.replace(
    `              <DatePartsField
                disabled={disabled}
                value={value.associateLeftDate}
                onChange={(associateLeftDate) => onChange({ ...value, associateLeftDate })}
                selectClassName={fieldClass}
                aria-label="Associate left date"
                disableFuture
                preferYearView
                defaultYearOffset={0}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Leave blank if still an associate member
              </p>`,
    `              <div data-field="associateLeftDate">
                <DatePartsField
                  disabled={disabled}
                  value={value.associateLeftDate}
                  onChange={(associateLeftDate) => onChange({ ...value, associateLeftDate })}
                  selectClassName={fieldErrorClass(fieldClass, !!fieldErrors.associateLeftDate)}
                  aria-label="Associate left date"
                  disableFuture
                  preferYearView
                  defaultYearOffset={0}
                />
                <FormFieldError message={fieldErrors.associateLeftDate} />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Leave blank if still an associate member
              </p>`
  );
  fs.writeFileSync(membershipPath, mem);
  console.log('MembershipTypeFields updated');
}

let s = fs.readFileSync(formPath, 'utf8');

function mustReplace(label, from, to) {
  if (!s.includes(from)) {
    console.error('FAIL', label);
    process.exit(1);
  }
  s = s.replace(from, to);
  console.log('OK', label);
}

mustReplace(
  'react import',
  "import { useEffect, useMemo, useState } from 'react';",
  "import { useEffect, useMemo, useRef, useState } from 'react';"
);

mustReplace(
  'validation import',
  "import { validateMemberDetails } from '@/modules/church-management/lib/memberFormValidation';",
  `import {
  getMemberDetailsFieldErrors,
  MEMBER_DETAILS_FIELD_ORDER,
  type MemberDetailsFieldErrors,
} from '@/modules/church-management/lib/memberFormValidation';
import {
  fieldErrorClass,
  firstFieldErrorMessage,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';`
);

mustReplace(
  'state',
  'const [submitting, setSubmitting] = useState(false);',
  `const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<MemberDetailsFieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);`
);

mustReplace(
  'clear helper',
  'const handleSubmit = async (e: React.FormEvent) => {',
  `const clearFieldError = (key: keyof MemberDetailsFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {`
);

mustReplace(
  'submit validation',
  `    e.preventDefault();
    onError('');

    if (!shared.familyId) {
      onError('Family is required');
      return;
    }

    const formError = validateMemberDetails({
      ...memberData,
      phone: shared.phone,
    });
    if (formError) {
      onError(formError);
      return;
    }

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
      onError(spouseRoleError);
      return;
    }

    setSubmitting(true);`,
  `    e.preventDefault();
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

    setFieldErrors(errors);
    const firstMsg = firstFieldErrorMessage(errors, MEMBER_DETAILS_FIELD_ORDER);
    if (firstMsg) {
      onError(firstMsg);
      requestAnimationFrame(() => {
        focusFirstInvalidField([...MEMBER_DETAILS_FIELD_ORDER], formRef.current);
      });
      return;
    }

    setSubmitting(true);`
);

mustReplace(
  'clear errors after save',
  `      setPhoto(emptyMemberPhotoSelection());
      onMemberCreated();`,
  `      setPhoto(emptyMemberPhotoSelection());
      setFieldErrors({});
      onMemberCreated();`
);

mustReplace(
  'form tag',
  '<form onSubmit={handleSubmit} className="space-y-4">',
  '<form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>'
);

mustReplace(
  'fieldClass helper',
  `  const lockedClass = \`\${inputClass} cursor-not-allowed bg-zinc-100 opacity-80 dark:bg-zinc-700\`;`,
  `  const lockedClass = \`\${inputClass} cursor-not-allowed bg-zinc-100 opacity-80 dark:bg-zinc-700\`;
  const fieldClass = (key: keyof MemberDetailsFieldErrors, locked = false) =>
    fieldErrorClass(locked ? lockedClass : inputClass, !!fieldErrors[key]);`
);

mustReplace(
  'family field',
  `              <select
                required
                value={shared.familyId}
                disabled={addMultiple && sessionAdded.length > 0}
                onChange={(e) => setShared({ ...shared, familyId: e.target.value })}
                className={
                  addMultiple && sessionAdded.length > 0 ? lockedClass : inputClass
                }
              >
                <option value="">Select Family</option>`,
  `              <select
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
                <option value="">Select Family</option>`
);

mustReplace(
  'family error msg',
  `              </select>
            </div>
          )}

          {!fixedFamily && headOfFamily && (`,
  `              </select>
              <FormFieldError message={fieldErrors.familyId} />
            </div>
          )}

          {!fixedFamily && headOfFamily && (`
);

mustReplace(
  'fullName',
  `            <input
              type="text"
              required
              value={memberData.fullName}
              onChange={(e) => setMemberData({ ...memberData, fullName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Gender *`,
  `            <input
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
              Gender *`
);

mustReplace(
  'gender',
  `            <select
              required
              value={memberData.gender}
              onChange={(e) => {
                const gender = e.target.value as 'MALE' | 'FEMALE' | '';
                setMemberData({ ...memberData, gender });
              }}
              className={inputClass}
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Role in family *`,
  `            <select
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
              Role in family *`
);

mustReplace(
  'role',
  `            <FamilyRoleSelect
              value={memberData.relationship}
              onChange={(relationship) => setMemberData({ ...memberData, relationship })}
              className={inputClass}
              required
              allowEmpty
              emptyLabel="Select role"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Mark the spouse as Wife — succession uses the Wife label only.
            </p>`,
  `            <FamilyRoleSelect
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
            </p>`
);

mustReplace(
  'phone',
  `            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              required
              value={shared.phone}
              disabled={addMultiple && sessionAdded.length > 0}
              onChange={(e) =>
                setShared({ ...shared, phone: sanitizePhoneDigits(e.target.value) })
              }
              placeholder="10-digit mobile number"
              className={addMultiple && sessionAdded.length > 0 ? lockedClass : inputClass}
              autoComplete="tel"
            />
          </div>`,
  `            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              required
              data-field="phone"
              aria-invalid={!!fieldErrors.phone}
              value={shared.phone}
              disabled={addMultiple && sessionAdded.length > 0}
              onChange={(e) => {
                clearFieldError('phone');
                setShared({ ...shared, phone: sanitizePhoneDigits(e.target.value) });
              }}
              placeholder="10-digit mobile number"
              className={fieldClass('phone', addMultiple && sessionAdded.length > 0)}
              autoComplete="tel"
            />
            <FormFieldError message={fieldErrors.phone} />
          </div>`
);

mustReplace(
  'dob',
  `            <DatePartsField
              required
              value={memberData.dateOfBirth}
              onChange={(dateOfBirth) => setMemberData({ ...memberData, dateOfBirth })}
              selectClassName={inputClass}
              aria-label="Date of birth"
              minYear={1920}
              maxYear={new Date().getFullYear()}
              disableFuture
              preferYearView
              defaultYearOffset={-25}
            />`,
  `            <div data-field="dateOfBirth">
              <DatePartsField
                required
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
            </div>`
);

mustReplace(
  'membership',
  `          <MembershipTypeFields
            value={memberData}
            onChange={(membership) => setMemberData({ ...memberData, ...membership })}
            disabled={associateFamily}
            lockedMessage={
              associateFamily
                ? 'This family is registered as associate. All members added here are associate members with the same join date.'
                : undefined
            }
            inputClass={inputClass}
            lockedClass={lockedClass}
          />`,
  `          <MembershipTypeFields
            value={memberData}
            onChange={(membership) => {
              clearFieldError('membershipType');
              clearFieldError('associateJoinDate');
              clearFieldError('associateLeftDate');
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
          />`
);

fs.writeFileSync(formPath, s);
console.log('AddMemberForm complete');
