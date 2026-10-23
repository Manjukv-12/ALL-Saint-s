import { useCallback, useEffect, useRef, useState } from 'react';
import { clearStoredAdminKey, getEffectiveAdminKey, setStoredAdminKey } from '@/lib/adminAuth';

/**
 * One admin API key for all staff tools. Verified key is stored in sessionStorage
 * so navigating between /admin/* pages does not require re-entry.
 */
export function useAdminAuth(verifyFn: (key: string) => Promise<void>) {
  const [verifiedKey, setVerifiedKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const autoUnlockStarted = useRef(false);

  const verifyWithKey = useCallback(
    async (rawKey: string) => {
      const k = rawKey.trim();
      if (!k) {
        setError('Enter the admin API key (same as config.php ADMIN_API_KEY).');
        return;
      }
      setPending(true);
      setError('');
      try {
        await verifyFn(k);
        setStoredAdminKey(k);
        setVerifiedKey(k);
      } catch (e) {
        setVerifiedKey(null);
        setError(e instanceof Error ? e.message : 'Could not verify key. Check the key and try again.');
      } finally {
        setPending(false);
      }
    },
    [verifyFn],
  );

  const lock = useCallback(() => {
    clearStoredAdminKey();
    setVerifiedKey(null);
    setKeyInput('');
    setError('');
  }, []);

  useEffect(() => {
    if (autoUnlockStarted.current) return;
    autoUnlockStarted.current = true;
    const pre = getEffectiveAdminKey();
    if (pre) void verifyWithKey(pre);
  }, [verifyWithKey]);

  return {
    verifiedKey,
    keyInput,
    setKeyInput,
    pending,
    error,
    verifyWithKey,
    lock,
    isSignedIn: !!verifiedKey,
  };
}
