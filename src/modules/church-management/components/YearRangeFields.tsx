import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { fieldErrorClass } from '@/modules/church-management/lib/formFieldFocus';
import { birthYearOptions } from '@/modules/church-management/lib/birthYearRange';

type Props = {
  fromYear: string;
  toYear: string;
  onChange: (from: string, to: string) => void;
  inputClass: string;
  disabled?: boolean;
  fromError?: string;
  toError?: string;
  className?: string;
  title: string;
  hint?: string;
  fromLabel?: string;
  toLabel?: string;
  fromField?: string;
  toField?: string;
  requiredFrom?: boolean;
};

/** From year / to year selectors (same pattern as approximate birth year). */
export function YearRangeFields({
  fromYear,
  toYear,
  onChange,
  inputClass,
  disabled = false,
  fromError,
  toError,
  className = '',
  title,
  hint,
  fromLabel = 'From year',
  toLabel = 'To year',
  fromField = 'joinYearFrom',
  toField = 'joinYearTo',
  requiredFrom = false,
}: Props) {
  const years = birthYearOptions();
  const rangeError = fromError || toError;

  return (
    <div className={className}>
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {title}
        {requiredFrom ? ' *' : ''}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <div data-field={fromField}>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {fromLabel}
          </label>
          <select
            disabled={disabled}
            required={requiredFrom}
            value={fromYear}
            aria-invalid={!!fromError}
            onChange={(e) => onChange(e.target.value, toYear)}
            className={fieldErrorClass(inputClass, !!fromError)}
          >
            <option value="">Select year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div data-field={toField}>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {toLabel}
          </label>
          <select
            disabled={disabled}
            value={toYear}
            aria-invalid={!!toError}
            onChange={(e) => onChange(fromYear, e.target.value)}
            className={fieldErrorClass(inputClass, !!toError)}
          >
            <option value="">Select year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      <FormFieldError message={rangeError} />
    </div>
  );
}
