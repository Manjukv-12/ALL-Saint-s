import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { churchMgmtQuickLinks } from '@/modules/church-management/lib/churchMgmtNav';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

export function DashboardQuickLinks() {
  return (
    <div className="grid grid-cols-2 gap-1.5 lg:flex lg:flex-col">
      {churchMgmtQuickLinks.map((item) => (
        <Link
          key={item.segment}
          to={churchMgmtPath(item.segment)}
          className={`${ui.quickLinkSidebar} cm-admin-action-card`}
        >
          <span className={`${ui.quickLinkTitle} action-title`}>{item.label}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" aria-hidden />
        </Link>
      ))}
    </div>
  );
}
