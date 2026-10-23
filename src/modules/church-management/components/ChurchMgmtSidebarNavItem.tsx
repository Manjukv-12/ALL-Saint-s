import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { churchMgmtPath } from '@/modules/church-management/paths';
import type { ChurchMgmtNavItem } from '@/modules/church-management/lib/churchMgmtNav';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

function childHref(to: string): string {
  const [path, query] = to.split('?');
  const base = churchMgmtPath(...path.split('/').filter(Boolean));
  return query ? `${base}?${query}` : base;
}

type Props = {
  item: ChurchMgmtNavItem;
  onNavigate?: () => void;
};

export function ChurchMgmtSidebarNavItem({ item, onNavigate }: Props) {
  const location = useLocation();
  const Icon = item.icon;
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const parentPath = churchMgmtPath(item.segment);
  const parentActive = location.pathname.includes(`/${item.segment}`);
  const [open, setOpen] = useState(parentActive);

  useEffect(() => {
    if (parentActive) setOpen(true);
  }, [parentActive]);

  if (!hasChildren) {
    return (
      <NavLink
        to={parentPath}
        onClick={onNavigate}
        className={({ isActive }) => (isActive ? ui.sidebarNavActive : ui.sidebarNavIdle)}
      >
        {({ isActive }) => (
          <>
            <span
              className={`${ui.sidebarIconTile} ${
                isActive ? ui.sidebarIconActive : ui.sidebarIconIdle
              }`}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="sidebar-nav-label block truncate">{item.label}</span>
              <span className="sidebar-nav-desc block truncate text-[11px] font-normal leading-snug">
                {item.description}
              </span>
            </span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
          parentActive
            ? 'bg-white/15 text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        <span
          className={`${ui.sidebarIconTile} ${
            parentActive ? ui.sidebarIconActive : ui.sidebarIconIdle
          }`}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="sidebar-nav-label block truncate">{item.label}</span>
          <span className="sidebar-nav-desc block truncate text-[11px] font-normal leading-snug">
            {item.description}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/70 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="ml-4 space-y-0.5 border-l border-white/15 pl-2"
          role="group"
          aria-label={`${item.label} submenu`}
        >
          {children.map((child) => {
            const ChildIcon = child.icon;
            const href = childHref(child.to);
            const active = child.match
              ? child.match(location.pathname, location.search)
              : `${location.pathname}${location.search}` === href;

            return (
              <NavLink
                key={child.to}
                to={href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-white/20 font-medium text-white'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                {ChildIcon ? (
                  <ChildIcon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                ) : null}
                <span className="truncate">{child.label}</span>
              </NavLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
