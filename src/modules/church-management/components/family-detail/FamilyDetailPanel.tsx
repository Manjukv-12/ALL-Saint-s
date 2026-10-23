import type { ReactNode } from 'react';
import { fd, PANEL_HEADER, type PanelAccent } from './familyDetailTheme';

interface FamilyDetailPanelProps {
  title: string;
  subtitle?: string;
  accent?: PanelAccent;
  children: ReactNode;
  className?: string;
}

export function FamilyDetailPanel({
  title,
  subtitle,
  accent = 'indigo',
  children,
  className = '',
}: FamilyDetailPanelProps) {
  return (
    <section className={`${fd.card} ${className}`}>
      <header className={`relative px-6 py-4 ${PANEL_HEADER[accent]}`}>
        <div className={fd.goldBar} />
        <h2 className="mt-2 font-serif text-lg font-semibold tracking-wide text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-white/75">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}
