import { FormFieldError } from '@/modules/church-management/components/FormFieldError';

/** Read-only label for family tomb booking status. */
export function formatTombBookedLabel(value: boolean | null | undefined): string {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'Not set';
}

type Props = {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  disabled?: boolean;
  className?: string;
};

/** Family-level cemetery tomb booking (Yes / No). */
export function FamilyTombBookedFields({
  value,
  onChange,
  disabled = false,
  className = '',
}: Props) {
  return (
    <div
      className={`rounded-md border border-slate-200 bg-slate-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/40 ${className}`}
    >
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Family tomb booked</p>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        Church cemetery tomb reservation for this family.
      </p>
      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="radio"
            name="tombBooked"
            checked={value === true}
            disabled={disabled}
            onChange={() => onChange(true)}
            className="border-zinc-300"
          />
          Yes
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="radio"
            name="tombBooked"
            checked={value === false}
            disabled={disabled}
            onChange={() => onChange(false)}
            className="border-zinc-300"
          />
          No
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <input
            type="radio"
            name="tombBooked"
            checked={value === null}
            disabled={disabled}
            onChange={() => onChange(null)}
            className="border-zinc-300"
          />
          Not set
        </label>
      </div>
      <FormFieldError message={null} />
    </div>
  );
}
