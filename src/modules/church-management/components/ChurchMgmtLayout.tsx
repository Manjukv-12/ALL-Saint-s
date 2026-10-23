import { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ChurchMgmtSidebar } from '@/modules/church-management/components/ChurchMgmtSidebar';
import { ScrollToTopButton } from '@/modules/church-management/components/ScrollToTopButton';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

export default function ChurchMgmtLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainScrollRef = useRef<HTMLElement>(null);

  return (
    <div className={`church-mgmt-admin ${ui.shellFlex}`}>
      <ChurchMgmtSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className={ui.mainContent}>
        <header className={ui.mobileBar}>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={ui.mobileMenuBtn}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className={ui.mobileBarTitle}>All Saints — Church office</span>
          <div className="w-9 shrink-0" aria-hidden />
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <main ref={mainScrollRef} className={ui.mainScroll}>
            <Outlet />
          </main>
          <ScrollToTopButton scrollRef={mainScrollRef} />
        </div>
      </div>
    </div>
  );
}
