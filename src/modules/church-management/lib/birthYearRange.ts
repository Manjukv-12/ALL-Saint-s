const MIN_BIRTH_YEAR = 1900;

export function currentYear(): number {
  return new Date().getFullYear();
}

export function birthYearOptions(): number[] {
  const end = currentYear();
  return Array.from({ length: end - MIN_BIRTH_YEAR + 1 }, (_, i) => end - i);
}

export function hasBirthYearRange(from: string, to: string): boolean {
  return from.trim() !== '' && to.trim() !== '';
}

export function validateBirthYearRange(from: string, to: string): string | null {
  const fromTrim = from.trim();
  const toTrim = to.trim();
  if (!fromTrim && !toTrim) return null;
  if (!fromTrim || !toTrim) {
    return 'Enter both birth year from and to, or leave both blank';
  }
  const fromYear = Number(fromTrim);
  const toYear = Number(toTrim);
  if (!Number.isInteger(fromYear) || fromYear < MIN_BIRTH_YEAR || fromYear > currentYear()) {
    return `Birth year (from) must be between ${MIN_BIRTH_YEAR} and ${currentYear()}`;
  }
  if (!Number.isInteger(toYear) || toYear < MIN_BIRTH_YEAR || toYear > currentYear()) {
    return `Birth year (to) must be between ${MIN_BIRTH_YEAR} and ${currentYear()}`;
  }
  if (fromYear > toYear) {
    return 'Birth year (from) cannot be after birth year (to)';
  }
  return null;
}

export function memberProfileExtraToPayload(values: {
  birthYearFrom?: string;
  birthYearTo?: string;
}): {
  birthYearFrom?: number;
  birthYearTo?: number;
} {
  const out: {
    birthYearFrom?: number;
    birthYearTo?: number;
  } = {};
  const from = values.birthYearFrom?.trim();
  const to = values.birthYearTo?.trim();
  if (from && to) {
    out.birthYearFrom = Number(from);
    out.birthYearTo = Number(to);
  }
  return out;
}

export function memberProfileExtraFromMember(member?: {
  birthYearFrom?: number | null;
  birthYearTo?: number | null;
}): {
  birthYearFrom: string;
  birthYearTo: string;
} {
  return {
    birthYearFrom:
      member?.birthYearFrom != null && member.birthYearFrom > 0
        ? String(member.birthYearFrom)
        : '',
    birthYearTo:
      member?.birthYearTo != null && member.birthYearTo > 0
        ? String(member.birthYearTo)
        : '',
  };
}
