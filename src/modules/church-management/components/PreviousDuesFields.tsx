import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import {
  PREVIOUS_DUES_NOTES_HINT,
  previousDuesFieldLabel,
  type PreviousDuesFormValues,
} from '@/modules/church-management/lib/previousDues';
import { PREVIOUS_DUES_THROUGH_YEAR } from '@/modules/church-management/lib/feesYearPolicy';
import { previousDuesCoveredLabel } from '@/modules/church-management/lib/previousDues';
import { FeesYearSplitNotice } from '@/modules/church-management/components/fees/FeesYearSplitNotice';
import { AmountNumberInput } from '@/modules/church-management/components/fees/AmountNumberInput';

type Props = {
  values: PreviousDuesFormValues;
  onChange: (values: PreviousDuesFormValues) => void;
  inputClass: string;
  disabled?: boolean;
  error?: string;
  className?: string;
};

export function PreviousDuesFields({
  values,
  onChange,
  inputClass,
  disabled = false,
  error,
  className = '',
}: Props) {
  const patch = (partial: Partial<PreviousDuesFormValues>) =>
    onChange({ ...values, ...partial });

  return (
    <div
      className={`md:col-span-2 rounded-md border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 ${className}`}
    >
      <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
        {previousDuesFieldLabel()}
      </p>
      <FeesYearSplitNotice focus="profile" className="mt-2 border-amber-200/80 bg-white/60 dark:border-amber-900/40 dark:bg-amber-950/10" />

      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="radio"
            name="hasPreviousDues"
            checked={!values.hasPreviousDues}
            disabled={disabled}
            onChange={() =>
              patch({
                hasPreviousDues: false,
                previousDuesAmount: '',
                previousDuesNotes: '',
              })
            }
            className="border-zinc-300"
          />
          No
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="radio"
            name="hasPreviousDues"
            checked={values.hasPreviousDues}
            disabled={disabled}
            onChange={() => patch({ hasPreviousDues: true })}
            className="border-zinc-300"
          />
          Yes — has outstanding previous dues
        </label>
      </div>

      {!values.hasPreviousDues && (
        <p className="mt-3 text-xs font-medium text-emerald-800 dark:text-emerald-200">
          {previousDuesCoveredLabel()} — use this when older balances are settled or not applicable.
        </p>
      )}

      {values.hasPreviousDues && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Total due amount (₹) *
            </label>
            <AmountNumberInput
              min={1}
              required
              disabled={disabled}
              inputMode="decimal"
              value={values.previousDuesAmount}
              onChange={(e) => patch({ previousDuesAmount: e.target.value })}
              className={inputClass}
              placeholder={`Total through ${PREVIOUS_DUES_THROUGH_YEAR}`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              What dues are included? *
            </label>
            <textarea
              rows={3}
              required
              disabled={disabled}
              value={values.previousDuesNotes}
              onChange={(e) => patch({ previousDuesNotes: e.target.value })}
              placeholder={PREVIOUS_DUES_NOTES_HINT}
              className={`${inputClass} min-h-[5rem] resize-y`}
            />
            <p className="mt-1 text-xs text-zinc-500">{PREVIOUS_DUES_NOTES_HINT}</p>
          </div>
        </div>
      )}

      <FormFieldError message={error} />
    </div>
  );
}
