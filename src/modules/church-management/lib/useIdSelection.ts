import { useCallback, useEffect, useMemo, useState } from 'react';

/** Multi-select by string id with select-all for a visible id list. */
export function useIdSelection(visibleIds: string[], resetKey?: string | number) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set());
  }, [resetKey]);

  const visibleKey = visibleIds.join('|');
  const allVisibleSelected = useMemo(() => {
    if (visibleIds.length === 0) return false;
    return visibleIds.every((id) => selected.has(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey, selected]);

  const someVisibleSelected = useMemo(() => {
    return visibleIds.some((id) => selected.has(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey, selected]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setMany = useCallback((ids: string[], on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setMany(visibleIds, true);
  }, [setMany, visibleIds]);

  const clearVisible = useCallback(() => {
    setMany(visibleIds, false);
  }, [setMany, visibleIds]);

  const clearAll = useCallback(() => setSelected(new Set()), []);

  const selectedIds = useMemo(() => [...selected], [selected]);

  return {
    selected,
    selectedIds,
    count: selected.size,
    toggle,
    setMany,
    selectAllVisible,
    clearVisible,
    clearAll,
    allVisibleSelected,
    someVisibleSelected,
    isSelected: (id: string) => selected.has(id),
  };
}
