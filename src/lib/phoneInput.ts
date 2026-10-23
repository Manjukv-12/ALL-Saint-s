/** Indian mobile-style contact: exactly 10 numeric digits. */
export const PHONE_DIGIT_LENGTH = 10;

/** Keep digits only, capped at 10 — use on every phone input change. */
export function sanitizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, PHONE_DIGIT_LENGTH);
}

export function isValidPhoneDigits(value?: string | null): boolean {
  return !!value && /^\d{10}$/.test(value.trim());
}

/** Empty is OK for optional phone; otherwise must be exactly 10 digits. */
export function validateOptionalPhone(value?: string | null): string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  if (!isValidPhoneDigits(trimmed)) {
    return 'Phone number must be exactly 10 digits';
  }
  return null;
}

export function validateRequiredPhone(value?: string | null): string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return 'Phone number is required';
  if (!isValidPhoneDigits(trimmed)) {
    return 'Phone number must be exactly 10 digits';
  }
  return null;
}
