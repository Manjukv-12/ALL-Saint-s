import { useLocation } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { CHURCH_MGMT_BASE } from '@/modules/church-management/paths';
import { churchMgmtNavBySegment } from '@/modules/church-management/lib/churchMgmtNav';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

function currentSegment(pathname: string): string {
  const rest = pathname.replace(CHURCH_MGMT_BASE, '').replace(/^\//, '');
  return rest.split('/')[0] || 'dashboard';
}

export function ChurchMgmtTopBar() {
  const { pathname } = useLocation();
  const { user } = useChurchMgmtAuth();
  const segment = currentSegment(pathname);
  const nav = churchMgmtNavBySegment(segment);
  const title = nav?.label ?? 'Church office';
  const crumb = nav?.breadcrumb ?? 'Portal';
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'A';

  return (
    <header className={ui.topBar}>
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-[var(--cm-primary)]">{title}</span>
        <span className="text-[var(--cm-outline)]">/</span>
        <span className="text-xs font-medium uppercase tracking-widest text-[var(--cm-on-surface-variant)]">
          {crumb}
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button type="button" className={ui.iconBtn} aria-label="Notifications">
            <Bell className={ui.iconMd} />
          </button>
          <button type="button" className={ui.iconBtn} aria-label="Settings">
            <Settings className={ui.iconMd} />
          </button>
        </div>
        <div className="h-8 w-px bg-white/30" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-[var(--cm-on-surface)]">
              {user?.email?.split('@')[0] ?? 'Admin'}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--cm-on-surface-variant)]">
              Church office
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white/60 text-sm font-bold text-[var(--cm-primary)] shadow-sm">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
