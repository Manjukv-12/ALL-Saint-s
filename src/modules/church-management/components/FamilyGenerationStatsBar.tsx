import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import {
  formatGenerationShare,
  getGenerationShortLabel,
  sumGenerationCounts,
} from '@/modules/church-management/lib/familyGeneration';

interface FamilyGenerationStatsBarProps {
  byGeneration: Record<number, number>;
  onSelectGeneration: (gen: number) => void;
}

export function FamilyGenerationStatsBar({
  byGeneration,
  onSelectGeneration,
}: FamilyGenerationStatsBarProps) {
  const entries = Object.entries(byGeneration)
    .map(([gen, count]) => ({ gen: Number(gen), count }))
    .sort((a, b) => a.gen - b.gen);

  if (entries.length === 0) return null;

  const totalFamilies = sumGenerationCounts(byGeneration);

  return (
    <div className={`${ui.card} p-4`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-300">
            Families by generation
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Number of families at each lineage level (from family code). Click to filter.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
          {totalFamilies} {totalFamilies === 1 ? 'family' : 'families'} total
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {entries.map(({ gen, count }) => (
          <button
            key={gen}
            type="button"
            onClick={() => onSelectGeneration(gen)}
            className={`${ui.btnGhost} inline-flex items-center gap-2 normal-case`}
            title={`${count} ${count === 1 ? 'family' : 'families'} · ${formatGenerationShare(count, totalFamilies)} of all families`}
          >
            <span className="font-semibold">{getGenerationShortLabel(gen)}</span>
            <span className="text-slate-500 dark:text-zinc-400">·</span>
            <span>
              {count} {count === 1 ? 'family' : 'families'}
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              {formatGenerationShare(count, totalFamilies)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
