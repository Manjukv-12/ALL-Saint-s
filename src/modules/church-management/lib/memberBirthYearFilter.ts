import type { Member } from '@/modules/church-management/api/types';
import { currentYear } from '@/modules/church-management/lib/birthYearRange';

export function memberEffectiveBirthYearRange(member: Member): [number, number] | null {
  const from = member.birthYearFrom;
  const to = member.birthYearTo;
  if (from != null && from > 0) {
    const hi = to != null && to > 0 ? to : from;
    return [Math.min(from, hi), Math.max(from, hi)];
  }
  if (to != null && to > 0) {
    return [to, to];
  }
  if (member.dateOfBirth) {
    const y = new Date(member.dateOfBirth).getFullYear();
    if (Number.isInteger(y) && y >= 1900) {
      return [y, y];
    }
  }
  return null;
}

/** Normalize UI values for query params (both empty = no filter). */
export function normalizeBirthYearFilter(
  from: string,
  to: string
): { birthYearFrom?: number; birthYearTo?: number } | null {
  const fromTrim = from.trim();
  const toTrim = to.trim();
  if (!fromTrim && !toTrim) return null;

  let fromYear = fromTrim ? Number(fromTrim) : 0;
  let toYear = toTrim ? Number(toTrim) : 0;
  if (fromYear <= 0 && toYear <= 0) return null;
  if (fromYear <= 0) fromYear = toYear;
  if (toYear <= 0) toYear = fromYear;
  if (fromYear > toYear) return null;

  const max = currentYear();
  if (fromYear < 1900 || toYear > max) return null;

  return { birthYearFrom: fromYear, birthYearTo: toYear };
}

export function birthYearRangeOverlapsFilter(
  personRange: [number, number] | null,
  filter: { birthYearFrom: number; birthYearTo: number }
): boolean {
  if (!personRange) return false;
  return personRange[0] <= filter.birthYearTo && personRange[1] >= filter.birthYearFrom;
}

export function filterMembersByBirthYear(
  members: Member[],
  from: string,
  to: string
): Member[] {
  const filter = normalizeBirthYearFilter(from, to);
  if (!filter) return members;
  return members.filter((m) =>
    birthYearRangeOverlapsFilter(memberEffectiveBirthYearRange(m), filter)
  );
}
