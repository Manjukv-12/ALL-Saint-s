import { Navigate, Outlet } from 'react-router-dom';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { churchMgmtPath } from '@/modules/church-management/paths';

export function ProtectedChurchMgmtRoute() {
  const { isAuthenticated, loading } = useChurchMgmtAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={churchMgmtPath('login')} replace />;
  }

  return <Outlet />;
}
