import { Home, Users } from 'lucide-react';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { getGenerationShortLabel } from '@/modules/church-management/lib/familyGeneration';

interface FamiliesQuickStatsProps {
  total: number;
  byGeneration: Record<number, number>;
  activeGeneration?: number | '';
  onSelectGeneration: (gen: number) => void;
}

export function FamiliesQuickStats({
  total,
  byGeneration,
  activeGeneration,
  onSelectGeneration,
}: FamiliesQuickStatsProps) {
  const entries = Object.entries(byGeneration)
    .map(([gen, count]) => ({ gen: Number(gen), count }))
    .sort((a, b) => a.gen - b.gen);

  if (entries.length === 0 && total === 0) return null;

  return (
    <div className={`${ui.card} overflow-hidden`}>
      <div className="grid grid-cols-2 gap-px border-b border-white/20 bg-white/20 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <div className={`${ui.statCell} col-span-2 sm:col-span-1`}>
          <div className={`${ui.statIcon} cm-stat-icon-dark bg-[var(--cm-primary)] text-white`}>
            <Home className="h-5 w-5" aria-hidden />
          </div>
          <p className={ui.statLabel}>Total families</p>
          <p className={ui.statValue}>{total}</p>
          <p className={ui.statHint}>In parish register</p>
        </div>

        {entries.map(({ gen, count }) => {
          const active = activeGeneration === gen;
          return (
            <button
              key={gen}
              type="button"
              onClick={() => onSelectGeneration(gen)}
              className={`${ui.statCell} text-left transition hover:bg-white/50 ${active ? 'ring-2 ring-inset ring-[var(--cm-primary)]' : ''}`}
            >
              <div className={`${ui.statIcon} cm-stat-icon-dark cm-btn-gradient text-white`}>
                <Users className="h-5 w-5" aria-hidden />
              </div>
              <p className={ui.statLabel}>{getGenerationShortLabel(gen)}</p>
              <p className={ui.statValue}>{count}</p>
              <p className={ui.statHint}>{active ? 'Filter active' : 'Tap to filter'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
