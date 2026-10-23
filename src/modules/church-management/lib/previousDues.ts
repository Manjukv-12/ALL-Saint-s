import { PREVIOUS_DUES_THROUGH_YEAR } from '@/modules/church-management/lib/feesYearPolicy';

export type PreviousDuesFormValues = {
  hasPreviousDues: boolean;
  previousDuesAmount: string;
  previousDuesNotes: string;
};

export const EMPTY_PREVIOUS_DUES: PreviousDuesFormValues = {
  hasPreviousDues: false,
  previousDuesAmount: '',
  previousDuesNotes: '',
};

export const PREVIOUS_DUES_NOTES_HINT =
  'e.g. membership 2020–2024, harvest 2023, cemetery levy, special collection…';

export function previousDuesFromMember(member: {
  hasPreviousDues?: boolean;
  previousDuesAmount?: number | null;
  previousDuesNotes?: string | null;
}): PreviousDuesFormValues {
  return {
    hasPreviousDues: !!member.hasPreviousDues,
    previousDuesAmount:
      member.previousDuesAmount != null && member.previousDuesAmount > 0
        ? String(member.previousDuesAmount)
        : '',
    previousDuesNotes: member.previousDuesNotes?.trim() ?? '',
  };
}

export function previousDuesToPayload(values: PreviousDuesFormValues): {
  hasPreviousDues: boolean;
  previousDuesAmount?: number;
  previousDuesNotes?: string;
} {
  if (!values.hasPreviousDues) {
    return { hasPreviousDues: false };
  }
  return {
    hasPreviousDues: true,
    previousDuesAmount: Number(values.previousDuesAmount),
    previousDuesNotes: values.previousDuesNotes.trim(),
  };
}

export function validatePreviousDues(values: PreviousDuesFormValues): string | null {
  if (!values.hasPreviousDues) return null;
  const amount = Number(values.previousDuesAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return `Enter the total previous dues amount (through ${PREVIOUS_DUES_THROUGH_YEAR})`;
  }
  if (!values.previousDuesNotes.trim()) {
    return 'Describe what the previous dues include';
  }
  return null;
}

export function previousDuesFieldLabel(): string {
  return `Previous dues (through ${PREVIOUS_DUES_THROUGH_YEAR})?`;
}

/** Short label when older balances are cleared on the member profile. */
export function previousDuesCoveredLabel(
  throughYear: number = PREVIOUS_DUES_THROUGH_YEAR
): string {
  return `All dues covered through ${throughYear}`;
}

/** Label when manual previous-dues balance is still recorded. */
export function previousDuesOutstandingLabel(
  amount: number,
  throughYear: number = PREVIOUS_DUES_THROUGH_YEAR
): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `Previous dues through ${throughYear}: ₹${formatted}`;
}

/** @deprecated Use feesYearSplitUserGuide from feesYearPolicy */
export function feesYearSplitNotice(): string {
  return `${PREVIOUS_DUES_THROUGH_YEAR} and before = member profile. ${PREVIOUS_DUES_THROUGH_YEAR + 1} and after = Fees & dues page.`;
}
