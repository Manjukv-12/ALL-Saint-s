import type { Family } from '@/modules/church-management/api/types';

export type FamilyStatus = Family['status'];

export function familyStatusLabel(status?: FamilyStatus): string {
  switch (status) {
    case 'INACTIVE':
      return 'Inactive';
    case 'SEPARATED':
      return 'Separated';
    case 'DECEASED':
      return 'Deceased';
    case 'ACTIVE':
    default:
      return 'Active';
  }
}

export function isFamilyInactive(family?: { status?: FamilyStatus } | null): boolean {
  return family?.status === 'INACTIVE';
}

export function familyStatusBadgeClass(status?: FamilyStatus): string {
  switch (status) {
    case 'INACTIVE':
      return 'border border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100';
    case 'SEPARATED':
      return 'border border-purple-300 bg-purple-50 text-purple-950 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-100';
    case 'DECEASED':
      return 'border border-slate-300 bg-slate-100 text-slate-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200';
    case 'ACTIVE':
    default:
      return 'border border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100';
  }
}

export const SUCCESSION_ORDER_HINT =
  'When the head of family dies: wife (must be labeled Wife) → eldest son → next son → eldest daughter. If none remain, the family becomes inactive.';

export const INACTIVE_FAMILY_MANUAL_HOF_TITLE = 'Admin action required — set head of family';

export const INACTIVE_FAMILY_MANUAL_HOF_ALERT =
  'This family has no head of family. Choose a living member in the list below and use the Head column to assign a new head. The family will be reactivated when you confirm. Update the member\'s role if needed (e.g. Husband or Wife).';

export const DEATH_INACTIVE_FAMILY_ALERT =
  'The head of family was marked deceased and no automatic successor was found (wife, son, or daughter). The family is now inactive. Assign a new head of family manually from the members list below.';

export type DeathSuccessionInfo = {
  applied?: boolean;
  requiresManualHof?: boolean;
  familyStatus?: string;
  newHeadId?: string | null;
};

/** True when head died and admin must pick a new head (family inactive / no successor). */
export function deathSuccessionNeedsManualHof(
  succession?: DeathSuccessionInfo | null
): boolean {
  if (!succession?.applied) return false;
  if (succession.requiresManualHof) return true;
  return succession.familyStatus === 'INACTIVE' && !succession.newHeadId;
}
