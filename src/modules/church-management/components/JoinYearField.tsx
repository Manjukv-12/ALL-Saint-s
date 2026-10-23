import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { fieldErrorClass } from '@/modules/church-management/lib/formFieldFocus';
import { birthYearOptions } from '@/modules/church-management/lib/birthYearRange';

type Props = {
  year: string;
  onChange: (year: string) => void;
  inputClass: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  fieldName?: string;
};

/** Single year when someone became a full member (stored as from + to = same year). */
export function JoinYearField({
  year,
  onChange,
  inputClass,
  disabled = false,
  error,
  className = '',
  fieldName = 'joinYearFrom',
}: Props) {
  const years = birthYearOptions();

  return (
    <div className={className} data-field={fieldName}>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Year of joining *
      </label>
      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        When this person became a full member of this church.
      </p>
      <select
        disabled={disabled}
        required
        value={year}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 max-w-xs ${fieldErrorClass(inputClass, !!error)}`}
      >
        <option value="">Select year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <FormFieldError message={error} />
    </div>
  );
}
