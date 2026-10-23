export type MemberStatus = 'Active' | 'Separated' | 'Deceased' | 'Divorced';

/** Simple labels for the status dropdown (values stay the same in the database). */
export const MEMBER_STATUS_OPTIONS: { value: MemberStatus; label: string; hint: string }[] = [
  { value: 'Active', label: 'Active', hint: 'Living in this family' },
  { value: 'Separated', label: 'Married Away', hint: 'Left after marriage — pay all dues first' },
  { value: 'Divorced', label: 'Divorced', hint: 'Stays in this family; enters life history' },
  { value: 'Deceased', label: 'Deceased', hint: 'Passed away' },
];

/** Statuses that require a spouse name on create/edit. */
export function statusRequiresSpouse(status?: string | null): boolean {
  return status === 'Separated' || status === 'Divorced';
}

export function memberStatusBadgeClass(status?: string | null): string {
  switch (status) {
    case 'Active':
      return 'border border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100';
    case 'Separated':
      return 'border border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100';
    case 'Divorced':
      return 'border border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-100';
    case 'Deceased':
      return 'border border-slate-300 bg-slate-100 text-slate-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200';
    default:
      return 'border border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100';
  }
}

export function normalizeMemberStatus(status?: string | null): MemberStatus {
  if (status === 'Separated' || status === 'Deceased' || status === 'Divorced') {
    return status;
  }
  return 'Active';
}

/** Display name for a stored status value (e.g. Separated → Married Away). */
export function memberStatusLabel(status?: string | null): string {
  const normalized = normalizeMemberStatus(status);
  return MEMBER_STATUS_OPTIONS.find((o) => o.value === normalized)?.label ?? normalized;
}

/**
 * Wedding / marriage date belongs only to married (or formerly married) people —
 * not Active unmarried sons/daughters.
 */
export function shouldShowWeddingDateField(opts: {
  status?: string | null;
  relationship?: string | null;
  maritalStatus?: string | null;
}): boolean {
  const status = opts.status ?? 'Active';
  if (status === 'Separated' || status === 'Divorced') return true;

  const marital = (opts.maritalStatus ?? '').trim();
  if (marital === 'Married' || marital === 'Widowed' || marital === 'Divorced') return true;

  const role = (opts.relationship ?? '').trim().toLowerCase();
  return role === 'wife' || role === 'husband';
}
