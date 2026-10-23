import { Key, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminKeyFromEnv } from '@/lib/adminAuth';

type AdminSignInPanelProps = {
  title?: string;
  description?: string;
  unlockLabel?: string;
  keyInput: string;
  onKeyInputChange: (value: string) => void;
  pending: boolean;
  error: string;
  onUnlock: () => void;
};

/** Gate shown when admin key is not verified yet. */
export function AdminSignInPanel({
  title = 'Sign in with admin key',
  description = 'Enter the admin API key once. It is remembered for this browser session so you can open Events, Gallery, Leadership, and other tools without typing it again.',
  unlockLabel = 'Unlock',
  keyInput,
  onKeyInputChange,
  pending,
  error,
  onUnlock,
}: AdminSignInPanelProps) {
  const envKey = getAdminKeyFromEnv();
  const envAutoUnlockInFlight = !!envKey && pending;

  return (
    <div className="space-y-4 border border-border rounded-xl p-4 bg-card">
      <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
        <Key size={18} /> {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {envAutoUnlockInFlight && (
        <AdminCheckingSpinner />
      )}
      {(!envKey || error) && !envAutoUnlockInFlight && (
        <div className="space-y-2">
          {envKey && error && (
            <p className="text-xs text-muted-foreground">
              The key from <code className="px-1 rounded bg-muted">.env</code> was rejected. Use ADMIN_API_KEY from{' '}
              <code className="px-1 rounded bg-muted">config.php</code>.
            </p>
          )}
          {!envKey && <label className="text-sm font-medium text-muted-foreground">Admin API key</label>}
          <input
            type="password"
            value={keyInput}
            onChange={(e) => onKeyInputChange(e.target.value)}
            placeholder="Same as config.php ADMIN_API_KEY"
            className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
            disabled={pending}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onUnlock();
              }
            }}
          />
          <Button type="button" onClick={onUnlock} disabled={pending}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : unlockLabel}
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function AdminCheckingSpinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      Checking saved admin key…
    </div>
  );
}

/** Compact bar above admin content when signed in. */
export function AdminSessionBar({ onLock }: { onLock: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-between border border-border rounded-xl px-4 py-3 bg-muted/30">
      <p className="text-sm text-muted-foreground">
        Signed in — key remembered for all admin pages in this browser.
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onLock}>
        <LogOut className="w-4 h-4 mr-1" /> Sign out
      </Button>
    </div>
  );
}
