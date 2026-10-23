import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { fieldErrorClass } from '@/modules/church-management/lib/formFieldFocus';
import { birthYearOptions } from '@/modules/church-management/lib/birthYearRange';

type Props = {
  birthYearFrom: string;
  birthYearTo: string;
  onChange: (from: string, to: string) => void;
  inputClass: string;
  disabled?: boolean;
  fromError?: string;
  toError?: string;
  className?: string;
};

/** Approximate birth year when exact date of birth is unknown. */
export function BirthYearRangeFields({
  birthYearFrom,
  birthYearTo,
  onChange,
  inputClass,
  disabled = false,
  fromError,
  toError,
  className = '',
}: Props) {
  const years = birthYearOptions();
  const rangeError = fromError || toError;

  return (
    <div className={`md:col-span-2 ${className}`}>
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Age (approximate birth year)
      </p>
      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        Use when exact date of birth is not known — enter from year and to year.
      </p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <div data-field="birthYearFrom">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            From year
          </label>
          <select
            disabled={disabled}
            value={birthYearFrom}
            aria-invalid={!!fromError}
            onChange={(e) => onChange(e.target.value, birthYearTo)}
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
        <div data-field="birthYearTo">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            To year
          </label>
          <select
            disabled={disabled}
            value={birthYearTo}
            aria-invalid={!!toError}
            onChange={(e) => onChange(birthYearFrom, e.target.value)}
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
