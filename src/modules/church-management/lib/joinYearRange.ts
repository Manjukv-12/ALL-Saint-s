import { currentYear } from '@/modules/church-management/lib/birthYearRange';

const MIN_JOIN_YEAR = 1900;

export function isoDateToYear(iso?: string | null): string {
  if (!iso) return '';
  const datePart = iso.split('T')[0];
  const year = datePart.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : '';
}

export function joinYearToIsoStart(year: string): string {
  return `${year}-01-01`;
}

export function joinYearToIsoEnd(year: string): string {
  return `${year}-12-31`;
}

export function validateJoinYearRange(
  from: string,
  to: string,
  options: { requiredFrom?: boolean; label: string }
): string | null {
  const fromTrim = from.trim();
  const toTrim = to.trim();
  const { requiredFrom = false, label } = options;

  if (!fromTrim && !toTrim) {
    return requiredFrom ? `${label} (from year) is required` : null;
  }

  if (!fromTrim) {
    return `${label} from year is required when to year is set`;
  }

  const fromYear = Number(fromTrim);
  const toYear = toTrim ? Number(toTrim) : fromYear;

  if (!Number.isInteger(fromYear) || fromYear < MIN_JOIN_YEAR || fromYear > currentYear()) {
    return `${label} from year must be between ${MIN_JOIN_YEAR} and ${currentYear()}`;
  }

  if (!Number.isInteger(toYear) || toYear < MIN_JOIN_YEAR || toYear > currentYear()) {
    return `${label} to year must be between ${MIN_JOIN_YEAR} and ${currentYear()}`;
  }

  if (fromYear > toYear) {
    return `${label} from year cannot be after to year`;
  }

  return null;
}
