import { useRef, useState } from 'react';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import {
  fieldErrorClass,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';
import { feesApi } from '@/modules/church-management/api/fees';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

type Props = {
  onCancel: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
};

/** New due types are always manual — amount is entered per member when assigning. */
export function DueTypeAddForm({ onCancel, onSaved, onError }: Props) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!code.trim()) errors.code = 'Code is required';
    if (!name.trim()) errors.name = 'Name is required';
    setFieldErrors(errors);
    if (errors.code || errors.name) {
      onError(errors.code || errors.name);
      requestAnimationFrame(() =>
        focusFirstInvalidField(['code', 'name'], formRef.current)
      );
      return;
    }
    try {
      setSaving(true);
      onError('');
      const res = await feesApi.createDueType({
        code: code.toUpperCase().replace(/\s+/g, '_'),
        name,
        defaultAmount: 0,
        // No yearly/monthly schedule — year + amount are set on "Add due for a person".
        frequency: 'NONE',
        autoGenerate: false,
      });
      if (res.error) {
        onError(res.error);
        return;
      }
      onSaved();
    } catch {
      onError('Could not add due type');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleAdd}
      noValidate
      className="space-y-4 border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-6 dark:border-zinc-700 dark:bg-zinc-800/40"
    >
      <p className="text-sm text-slate-600 dark:text-zinc-300">
        Add a <strong>name</strong> only. There is no yearly or monthly billing here — enter the
        amount (and year) when you assign the due to a member.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Code</span>
          <input
            required
            data-field="code"
            aria-invalid={!!fieldErrors.code}
            value={code}
            onChange={(e) => {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.code;
                return next;
              });
              setCode(e.target.value);
            }}
            placeholder="e.g. BUILDING_FUND"
            className={fieldErrorClass(`${ui.select} mt-1.5 w-full`, !!fieldErrors.code)}
          />
          <FormFieldError message={fieldErrors.code} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Name</span>
          <input
            required
            data-field="name"
            aria-invalid={!!fieldErrors.name}
            value={name}
            onChange={(e) => {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.name;
                return next;
              });
              setName(e.target.value);
            }}
            placeholder="Display name"
            className={fieldErrorClass(`${ui.select} mt-1.5 w-full`, !!fieldErrors.name)}
          />
          <FormFieldError message={fieldErrors.name} />
        </label>
      </div>
      <p className="text-sm text-slate-500 dark:text-zinc-400">
        Billing: <strong className="font-medium text-slate-700 dark:text-zinc-200">When assigned</strong>
        {' '}(not yearly / monthly)
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={ui.btnPrimary}>
          {saving ? 'Saving…' : 'Save due type'}
        </button>
        <button type="button" onClick={onCancel} className={ui.btnOutline}>
          Cancel
        </button>
      </div>
    </form>
  );
}
