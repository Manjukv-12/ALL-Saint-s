import type { FormHTMLAttributes, ReactNode, Ref } from 'react';

type CmDialogShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Sticky action row (Cancel / Save / Close) — stays visible while body scrolls. */
  footer?: ReactNode;
  /** When set, wraps scroll body + footer in a form so submit buttons in footer work. */
  formProps?: FormHTMLAttributes<HTMLFormElement>;
  formRef?: Ref<HTMLFormElement>;
  maxWidthClass?: string;
  onBackdropClick?: () => void;
};

/**
 * Shared church-mgmt dialog frame with reliable padding and viewport scrolling.
 * Header and footer stay fixed; only the body scrolls so action buttons never clip away.
 */
export function CmDialogShell({
  title,
  subtitle,
  children,
  footer,
  formProps,
  formRef,
  maxWidthClass = 'max-w-lg',
  onBackdropClick,
}: CmDialogShellProps) {
  const body = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8 sm:py-6">
        {children}
      </div>
      {footer ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-900 sm:px-8">
          {footer}
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/40"
      onClick={onBackdropClick}
      role="presentation"
    >
      <div className="flex min-h-full items-start justify-center p-3 sm:items-center sm:p-6">
        <div
          className={`my-2 flex w-full ${maxWidthClass} max-h-[min(96dvh,calc(100vh-1rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900`}
          role="dialog"
          aria-label={title}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 border-b border-slate-200 px-6 py-5 dark:border-zinc-700 sm:px-8">
            <p
              className="font-sans font-semibold text-slate-900 dark:text-white"
              style={{ fontSize: '1.25rem', lineHeight: 1.4, margin: 0 }}
            >
              {title}
            </p>
            {subtitle ? (
              <p
                className="font-sans text-slate-500 dark:text-zinc-400"
                style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  marginTop: '0.75rem',
                  marginBottom: 0,
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          {formProps ? (
            <form ref={formRef} className="flex min-h-0 flex-1 flex-col" {...formProps}>
              {body}
            </form>
          ) : (
            body
          )}
        </div>
      </div>
    </div>
  );
}
