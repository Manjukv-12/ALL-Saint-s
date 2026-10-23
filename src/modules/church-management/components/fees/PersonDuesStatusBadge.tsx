import type { PersonDuesStatus } from '@/modules/church-management/api/fees';

const LABELS: Record<PersonDuesStatus, string> = {
  UP_TO_DATE: 'Up to date',
  MEMBERSHIP_DUE: 'Membership due',
  OTHER_DUE: 'Other due',
  BOTH_DUE: 'Both due',
};

const STYLES: Record<PersonDuesStatus, string> = {
  UP_TO_DATE:
    'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800',
  MEMBERSHIP_DUE:
    'bg-amber-100 text-amber-950 border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800',
  OTHER_DUE:
    'bg-sky-100 text-sky-950 border-sky-200 dark:bg-sky-950/40 dark:text-sky-100 dark:border-sky-800',
  BOTH_DUE:
    'bg-rose-100 text-rose-950 border-rose-200 dark:bg-rose-950/40 dark:text-rose-100 dark:border-rose-800',
};

export function PersonDuesStatusBadge({ status }: { status: PersonDuesStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STYLES[status] ?? STYLES.UP_TO_DATE}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
