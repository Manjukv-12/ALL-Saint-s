import { LogOut, Church } from 'lucide-react';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { churchMgmtNavItems } from '@/modules/church-management/lib/churchMgmtNav';
import { ChurchMgmtSidebarNavItem } from '@/modules/church-management/components/ChurchMgmtSidebarNavItem';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

interface ChurchMgmtSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useChurchMgmtAuth();

  return (
    <>
      <div className={ui.sidebarBrand}>
        <span className="flex items-center gap-2.5">
          <Church className="h-6 w-6 text-[hsl(var(--link))]" aria-hidden />
          <span className="sidebar-nav-label">All Saints CSI</span>
        </span>
        <span className={`${ui.sidebarBrandSub} sidebar-nav-desc`}>Church office</span>
      </div>

      <nav className={ui.sidebarNav} aria-label="Church management">
        {churchMgmtNavItems.map((item) => (
          <ChurchMgmtSidebarNavItem key={item.segment} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className={ui.sidebarFooter}>
        {user?.email ? (
          <p className={`${ui.sidebarUserEmail} sidebar-user-email`}>{user.email}</p>
        ) : null}
        <button type="button" onClick={() => logout()} className={ui.sidebarLogout}>
          <span className="inline-flex items-center justify-center gap-2">
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Sign out
          </span>
        </button>
      </div>
    </>
  );
}

export function ChurchMgmtSidebar({ mobileOpen = false, onMobileClose }: ChurchMgmtSidebarProps) {
  return (
    <>
      <aside className={`${ui.sidebar} church-mgmt-sidebar hidden h-full overflow-y-auto lg:flex`}>
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      ) : null}

      <aside
        className={`${ui.sidebar} church-mgmt-sidebar fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onNavigate={onMobileClose} />
      </aside>
    </>
  );
}
