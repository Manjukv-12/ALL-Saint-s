/** Display helpers for family generation counts (generation comes from parent lineage). */

export function getGenerationShortLabel(gen: number): string {  if (gen === 1) return 'Gen 1 · Root';
  if (gen >= 6) return 'Gen 6+';
  return `Gen ${gen}`;
}

export function sumGenerationCounts(byGeneration: Record<number, number>): number {
  return Object.values(byGeneration).reduce((sum, count) => sum + count, 0);
}

export function formatGenerationShare(count: number, total: number): string {
  if (total <= 0) return '0%';
  const pct = Math.round((count / total) * 100);
  return `${pct}%`;
}
