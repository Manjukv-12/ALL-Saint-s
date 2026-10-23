import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { ChurchMgmtLoginScreen } from '@/modules/church-management/components/ChurchMgmtLoginScreen';
import { LoginErrorPanel } from '@/modules/church-management/components/LoginErrorPanel';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

const DEV_EMAIL = 'admin@csiallsaints.local';
const DEV_PASSWORD = 'ChangeMe123!';

function formatLoginError(err: unknown): string {
  let errorMessage = err instanceof Error ? err.message : 'Login failed';
  if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('Page Does Not Exist')) {
    return 'Church management API not found. Start the local PHP API with npm run api:php.';
  }
  if (errorMessage.length > 320) {
    return `${errorMessage.slice(0, 320)}…`;
  }
  return errorMessage;
}

export default function LoginPage() {
  const [email, setEmail] = useState(import.meta.env.DEV ? DEV_EMAIL : '');
  const [password, setPassword] = useState(import.meta.env.DEV ? DEV_PASSWORD : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useChurchMgmtAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/church-management/dashboard', { replace: true });
    } catch (err) {
      setError(formatLoginError(err));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChurchMgmtLoginScreen
      devNote={
        import.meta.env.DEV ? (
          <p className={`${ui.loginDevNote} mb-6`}>
            <strong className="text-[hsl(var(--foreground))]">Local dev:</strong> run{' '}
            <code className="font-mono">npm run api:php</code> and seed with{' '}
            <code className="font-mono">php backend-php/bin/seed-church-mgmt-admin.php</code>
          </p>
        ) : undefined
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error && <LoginErrorPanel message={error} />}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]"
            >
              <Mail className="h-4 w-4 text-[hsl(var(--link))]" aria-hidden />
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={ui.input}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]"
            >
              <Lock className="h-4 w-4 text-[hsl(var(--link))]" aria-hidden />
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={ui.input}
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${ui.btnPrimary} w-full py-3 text-base disabled:opacity-50`}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </ChurchMgmtLoginScreen>
  );
}
