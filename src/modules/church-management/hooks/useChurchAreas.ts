import { useEffect, useState } from 'react';
import { areasApi } from '@/modules/church-management/api/areas';
import { CHURCH_AREAS } from '@/modules/church-management/lib/churchAreas';

function mergeAreas(builtin: readonly string[], extra: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const area of [...builtin, ...extra]) {
    const trimmed = area.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

/** Built-in areas plus any saved in the database (new areas appear after first save). */
export function useChurchAreas() {
  const [areas, setAreas] = useState<string[]>(() => [...CHURCH_AREAS]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await areasApi.getAreas();
      if (cancelled) return;
      if (res.data?.areas?.length) {
        setAreas(mergeAreas(CHURCH_AREAS, res.data.areas));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { areas, loading };
}
