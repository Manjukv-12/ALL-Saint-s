import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  hint?: React.ReactNode;
  cancelLabel?: string;
  onCancel?: () => void;
  cancelTo?: string;
  submitLabel: string;
  submittingLabel?: string;
  submitting?: boolean;
  disabled?: boolean;
  submitIcon?: React.ReactNode;
  className?: string;
};

export function FormActionBar({
  hint,
  cancelLabel = 'Cancel',
  onCancel,
  cancelTo,
  submitLabel,
  submittingLabel = 'Saving…',
  submitting = false,
  disabled = false,
  submitIcon,
  className,
}: Props) {
  const cancelClassName =
    'inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/30 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800';

  return (
    <div
      className={cn(
        'form-action-bar fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/90 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-[0_-8px_32px_rgba(0,0,0,0.35)] lg:left-64',
        className
      )}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        {hint ? (
          <p className="text-sm text-slate-600 dark:text-zinc-400">{hint}</p>
        ) : (
          <span className="hidden sm:block" aria-hidden />
        )}

        <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          {cancelTo ? (
            <Link to={cancelTo} className={`${cancelClassName} w-full sm:w-auto`}>
              {cancelLabel}
            </Link>
          ) : (
            <button type="button" onClick={onCancel} className={`${cancelClassName} w-full sm:w-auto`}>
              {cancelLabel}
            </button>
          )}

          <button
            type="submit"
            disabled={disabled || submitting}
            className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[hsl(var(--primary-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto sm:min-w-[10.5rem]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {submittingLabel}
              </>
            ) : (
              <>
                {submitIcon}
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
