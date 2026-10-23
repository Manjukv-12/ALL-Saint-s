import {
  MEMBERSHIP_TYPE_OPTIONS,
  type MembershipFields,
  type MembershipType,
} from '@/modules/church-management/lib/membershipType';
import { YearRangeFields } from '@/modules/church-management/components/YearRangeFields';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { fieldErrorClass } from '@/modules/church-management/lib/formFieldFocus';
import type { MemberDetailsFieldErrors } from '@/modules/church-management/lib/memberFormValidation';

interface MembershipTypeFieldsProps {
  value: MembershipFields;
  onChange: (value: MembershipFields) => void;
  disabled?: boolean;
  lockedMessage?: string;
  inputClass: string;
  lockedClass?: string;
  fieldErrors?: MemberDetailsFieldErrors;
}

export function MembershipTypeFields({
  value,
  onChange,
  disabled = false,
  lockedMessage,
  inputClass,
  lockedClass,
  fieldErrors = {},
}: MembershipTypeFieldsProps) {
  const fieldClass = disabled && lockedClass ? lockedClass : inputClass;
  const isAssociate = value.membershipType === 'ASSOCIATE';
  const isFull = value.membershipType === 'FULL';
  const selected = MEMBERSHIP_TYPE_OPTIONS.find((o) => o.value === value.membershipType);
  const isLocked = disabled && !!lockedMessage;

  return (
    <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
      <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Church membership *</p>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
        Full members are permanent. Associate members may leave when they move away.
      </p>

      {isLocked && (
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          {lockedMessage}
        </p>
      )}

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Membership type *
          </label>
          <select
            required
            disabled={disabled}
            data-field="membershipType"
            aria-invalid={!!fieldErrors.membershipType}
            value={value.membershipType}
            onChange={(e) =>
              onChange({
                ...value,
                membershipType: e.target.value as MembershipType,
                joinYearFrom: e.target.value === 'FULL' ? value.joinYearFrom : '',
                joinYearTo: e.target.value === 'FULL' ? value.joinYearTo : '',
                associateJoinYearFrom:
                  e.target.value === 'ASSOCIATE' ? value.associateJoinYearFrom : '',
                associateJoinYearTo:
                  e.target.value === 'ASSOCIATE' ? value.associateJoinYearTo : '',
              })
            }
            className={fieldErrorClass(fieldClass, !!fieldErrors.membershipType)}
          >
            {MEMBERSHIP_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — {opt.hint}
              </option>
            ))}
          </select>
          {selected && !fieldErrors.membershipType && (
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{selected.hint}</p>
          )}
          <FormFieldError message={fieldErrors.membershipType} />
        </div>

        {isFull && (
          <YearRangeFields
            className="md:col-span-2"
            title="Year of joining"
            hint="When this person became a full member — enter from year and to year (same year if known exactly)."
            fromYear={value.joinYearFrom}
            toYear={value.joinYearTo}
            onChange={(joinYearFrom, joinYearTo) =>
              onChange({ ...value, joinYearFrom, joinYearTo })
            }
            inputClass={fieldClass}
            disabled={disabled}
            fromError={fieldErrors.joinYearFrom}
            toError={fieldErrors.joinYearTo}
            fromField="joinYearFrom"
            toField="joinYearTo"
            requiredFrom
          />
        )}

        {isAssociate && (
          <YearRangeFields
            className="md:col-span-2"
            title="Associate membership period"
            hint="Start year is required. Leave to year blank if still an associate member."
            fromYear={value.associateJoinYearFrom}
            toYear={value.associateJoinYearTo}
            onChange={(associateJoinYearFrom, associateJoinYearTo) =>
              onChange({ ...value, associateJoinYearFrom, associateJoinYearTo })
            }
            inputClass={fieldClass}
            disabled={disabled}
            fromError={fieldErrors.associateJoinYearFrom}
            toError={fieldErrors.associateJoinYearTo}
            fromLabel="Start year"
            toLabel="End year"
            fromField="associateJoinYearFrom"
            toField="associateJoinYearTo"
            requiredFrom
          />
        )}
      </div>
    </div>
  );
}
