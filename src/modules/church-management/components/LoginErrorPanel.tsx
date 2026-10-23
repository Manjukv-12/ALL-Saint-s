import { ui } from '@/modules/church-management/lib/churchManagementTheme';

type Props = {
  message: string;
};

export function LoginErrorPanel({ message }: Props) {
  const showCredentialHints =
    message.includes('Invalid') || message.includes('credentials');

  const showLocalDbHint =
    import.meta.env.DEV &&
    (message.includes('connect') ||
      message.includes('Database connection failed') ||
      message.includes('server'));

  return (
    <div className={`${ui.alertError} mb-5`} role="alert">
      <div className="font-semibold">Login failed</div>
      <div className="mt-1 text-sm">{message}</div>
      {showLocalDbHint && (
        <p className="mt-2 text-xs">
          Local MySQL/MariaDB is not reachable. Start WAMP MariaDB (port 3307), then retry.
        </p>
      )}
      {showCredentialHints && (
        <p className="mt-2 text-xs">
          Default seeded account: <strong>admin@csiallsaints.local</strong> /{' '}
          <strong>ChangeMe123!</strong>
        </p>
      )}
    </div>
  );
}
