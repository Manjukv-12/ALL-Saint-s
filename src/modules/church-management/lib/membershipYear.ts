import {
  FEES_SYSTEM_START_YEAR,
  PREVIOUS_DUES_THROUGH_YEAR,
} from '@/modules/church-management/lib/feesYearPolicy';

/** Allowed membership calendar years (church office — not open-ended). */
export const MEMBERSHIP_YEAR_LOOKBACK = 15;
export const MEMBERSHIP_YEAR_LOOKAHEAD = 10;

export function membershipYearBounds(anchor = new Date().getFullYear()) {
  return {
    min: Math.max(FEES_SYSTEM_START_YEAR, anchor - MEMBERSHIP_YEAR_LOOKBACK),
    max: anchor + MEMBERSHIP_YEAR_LOOKAHEAD,
  };
}

export function membershipYearOptions(anchor = new Date().getFullYear()): number[] {
  const { min, max } = membershipYearBounds(anchor);
  const years: number[] = [];
  for (let y = max; y >= min; y--) years.push(y);
  return years;
}

export function isValidMembershipYear(year: number, anchor = new Date().getFullYear()): boolean {
  if (!Number.isFinite(year) || !Number.isInteger(year)) return false;
  const { min, max } = membershipYearBounds(anchor);
  return year >= min && year <= max;
}

/** Turn 2-digit input into full year (e.g. 26 → 2026). */
export function parseTwoDigitMembershipYear(
  raw: string,
  anchor = new Date().getFullYear()
): number | null {
  const digits = raw.replace(/\D/g, '').slice(-2);
  if (digits.length < 1 || digits.length > 2) return null;
  const two = Number(digits);
  if (!Number.isFinite(two) || two < 0 || two > 99) return null;

  const century = Math.floor(anchor / 100) * 100;
  let full = century + two;
  if (full > anchor + MEMBERSHIP_YEAR_LOOKAHEAD) full -= 100;
  if (full < anchor - MEMBERSHIP_YEAR_LOOKBACK) full += 100;

  return isValidMembershipYear(full, anchor) ? full : null;
}

export function membershipYearError(
  year: number,
  anchor = new Date().getFullYear()
): string | null {
  if (!Number.isFinite(year)) return 'Choose a valid year.';
  if (year < FEES_SYSTEM_START_YEAR) {
    return `${PREVIOUS_DUES_THROUGH_YEAR} and earlier are recorded on each member profile — fee rows start from ${FEES_SYSTEM_START_YEAR}.`;
  }
  const { min, max } = membershipYearBounds(anchor);
  if (year < min || year > max) {
    return `Year must be between ${min} and ${max}.`;
  }
  return null;
}

export function clampMembershipYear(year: number, anchor = new Date().getFullYear()): number {
  const { min, max } = membershipYearBounds(anchor);
  if (!Number.isFinite(year)) return anchor;
  return Math.min(max, Math.max(min, Math.round(year)));
}
