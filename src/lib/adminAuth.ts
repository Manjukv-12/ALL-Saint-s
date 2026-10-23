/** Session key shared across all admin pages (same browser tab). */
export const ADMIN_KEY_STORAGE = 'csi_admin_api_key';

export function getAdminKeyFromEnv(): string {
  return (import.meta.env.VITE_ADMIN_API_KEY as string | undefined)?.trim() ?? '';
}

export function getStoredAdminKey(): string {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE)?.trim() ?? '';
  } catch {
    return '';
  }
}

export function setStoredAdminKey(key: string): void {
  try {
    const k = key.trim();
    if (k) sessionStorage.setItem(ADMIN_KEY_STORAGE, k);
    else sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    /* private browsing */
  }
}

export function clearStoredAdminKey(): void {
  setStoredAdminKey('');
}

/** Build-time env key, else key saved from Admin hub / any admin page. */
export function getEffectiveAdminKey(): string {
  return getAdminKeyFromEnv() || getStoredAdminKey();
}
