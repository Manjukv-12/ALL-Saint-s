import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

export function ChurchMgmtPageShell({
  title,
  subtitle,
  icon: _icon,
  actions,
  compact = false,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  /** Tighter header and section spacing — use on dashboard */
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${ui.container} ${compact ? 'space-y-4' : 'space-y-6'}`}>
      <header className={ui.pageHeader}>
        <div className="min-w-0">
          {/* Use <p> — global h1 serif/size rules fight admin UI titles */}
          <p
            className={`font-sans ${compact ? ui.titleCompact : ui.title}`}
            style={{ margin: 0, fontFamily: 'inherit' }}
          >
            {title}
          </p>
          {subtitle && <p className={compact ? ui.subtitleCompact : ui.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={ui.pageHeaderActions}>{actions}</div>}
      </header>
      {children}
    </div>
  );
}
