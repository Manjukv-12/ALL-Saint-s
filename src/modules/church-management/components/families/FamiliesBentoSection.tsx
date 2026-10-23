import { BarChart3 } from 'lucide-react';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import {
  formatGenerationShare,
  getGenerationShortLabel,
  sumGenerationCounts,
} from '@/modules/church-management/lib/familyGeneration';

const RAINBOW = ['cm-rainbow-1', 'cm-rainbow-2', 'cm-rainbow-3', 'cm-rainbow-1', 'cm-rainbow-2'];

interface FamiliesBentoSectionProps {
  byGeneration: Record<number, number>;
  totalFamilies: number;
  onSelectGeneration: (gen: number) => void;
}

export function FamiliesBentoSection({
  byGeneration,
  totalFamilies,
  onSelectGeneration,
}: FamiliesBentoSectionProps) {
  const entries = Object.entries(byGeneration)
    .map(([gen, count]) => ({ gen: Number(gen), count }))
    .sort((a, b) => a.gen - b.gen);

  if (entries.length === 0) return null;

  const total = sumGenerationCounts(byGeneration) || totalFamilies;

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className={`${ui.card} relative col-span-1 overflow-hidden p-6 lg:col-span-8`}>
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[var(--cm-primary)]/5 blur-3xl" />
        <div className="relative z-10 mb-6 flex items-center justify-between">
          <h3 className={ui.sectionTitle}>Families by generation</h3>
          <BarChart3 className="h-5 w-5 text-[var(--cm-primary)]" aria-hidden />
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {entries.slice(0, 4).map(({ gen, count }, i) => {
            const pct = formatGenerationShare(count, total);
            return (
              <button
                key={gen}
                type="button"
                onClick={() => onSelectGeneration(gen)}
                className={`${ui.bentoInner} text-left transition hover:bg-white/55`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--cm-primary)]">
                    {getGenerationShortLabel(gen)}
                  </span>
                  <span className="text-xs font-bold text-[var(--cm-primary)]">{pct}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-black/5">
                  <div
                    className={`relative h-full rounded-full ${RAINBOW[i % RAINBOW.length]}`}
                    style={{ width: pct }}
                  >
                    <div className="cm-shimmer absolute inset-0" />
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium text-[var(--cm-on-surface-variant)]">
                  {count} {count === 1 ? 'family' : 'families'} registered
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="cm-btn-gradient col-span-1 flex flex-col justify-between rounded-2xl p-6 shadow-xl lg:col-span-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">Parish summary</h3>
        <div className="my-4 space-y-4">
          <div className="flex justify-between border-b border-white/20 pb-2">
            <span className="text-sm text-white/80">Total families</span>
            <span className="font-serif text-2xl font-bold text-white">{String(total).padStart(2, '0')}</span>
          </div>
          <div className="flex justify-between border-b border-white/20 pb-2">
            <span className="text-sm text-white/80">Generations tracked</span>
            <span className="font-serif text-2xl font-bold text-white">{entries.length}</span>
          </div>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-tight text-white/70">
          Click a generation card to filter the directory
        </p>
      </div>
    </section>
  );
}
