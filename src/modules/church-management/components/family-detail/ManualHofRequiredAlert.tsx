import {
  DEATH_INACTIVE_FAMILY_ALERT,
  INACTIVE_FAMILY_MANUAL_HOF_ALERT,
  INACTIVE_FAMILY_MANUAL_HOF_TITLE,
} from '@/modules/church-management/lib/familyStatus';
import type { ReactNode } from 'react';

interface ManualHofRequiredAlertProps {
  /** Override default inactive-family copy (e.g. right after marking head deceased). */
  message?: string;
  className?: string;
  children?: ReactNode;
}

export function ManualHofRequiredAlert({
  message,
  className = '',
  children,
}: ManualHofRequiredAlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-lg border border-amber-300 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-950/30 ${className}`}
    >
      <p className="text-base font-semibold text-amber-950 dark:text-amber-100">
        {INACTIVE_FAMILY_MANUAL_HOF_TITLE}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
        {message ?? INACTIVE_FAMILY_MANUAL_HOF_ALERT}
      </p>
      {children}
    </div>
  );
}

export { DEATH_INACTIVE_FAMILY_ALERT, INACTIVE_FAMILY_MANUAL_HOF_ALERT };
