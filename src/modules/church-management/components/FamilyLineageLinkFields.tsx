import { useEffect, useState } from 'react';
import { familiesApi, type RootFamilyLineageOption } from '@/modules/church-management/api/families';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

export type LineageLinkMode = '' | 'ancestor' | 'branch';

export type FamilyLineageLinkValue = {
  mode: LineageLinkMode;
  rootFamilyId: string;
};

type Props = {
  value: FamilyLineageLinkValue;
  onChange: (value: FamilyLineageLinkValue) => void;
  disabled?: boolean;
};

export function FamilyLineageLinkFields({ value, onChange, disabled }: Props) {
  const [roots, setRoots] = useState<RootFamilyLineageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setLoadError('');
      const res = await familiesApi.getRootFamiliesForLineage();
      if (cancelled) return;
      if (res.error) {
        setLoadError(res.error);
        setRoots([]);
      } else {
        setRoots(res.data?.roots ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enabled = value.mode !== '';

  return (
    <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-zinc-700">
      <legend className="px-1 text-sm font-semibold text-slate-800 dark:text-zinc-100">
        Link to existing lineage (optional)
      </legend>
      <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
        Only <strong>root</strong> families (no parent household) are listed. Use this when adding an
        ancestral household or an extra branch without using Move.
      </p>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={enabled}
          disabled={disabled || loading}
          onChange={(e) => {
            if (!e.target.checked) {
              onChange({ mode: '', rootFamilyId: '' });
              return;
            }
            onChange({ mode: 'ancestor', rootFamilyId: value.rootFamilyId });
          }}
        />
        <span>Connect this new family to an existing root</span>
      </label>

      {enabled ? (
        <div className="space-y-3 pl-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
              Root family
            </label>
            <select
              className={`${ui.select} min-w-[14rem] flex-1`}
              disabled={disabled || loading || roots.length === 0}
              value={value.rootFamilyId}
              onChange={(e) => onChange({ ...value, rootFamilyId: e.target.value })}
              aria-label="Root family for lineage link"
            >
              <option value="">Select FAM…</option>
              {roots.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 text-sm">
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="lineageLinkMode"
                checked={value.mode === 'ancestor'}
                disabled={disabled}
                onChange={() => onChange({ ...value, mode: 'ancestor' })}
              />
              <span>
                <strong>Above</strong> this root — this new family is the parent household (e.g.
                grandparents). The selected root becomes a child branch in Lineage.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="lineageLinkMode"
                checked={value.mode === 'branch'}
                disabled={disabled}
                onChange={() => onChange({ ...value, mode: 'branch' })}
              />
              <span>
                <strong>Under</strong> this root — this new family is linked as a branch below the
                root (same tree; does not move members from the root).
              </span>
            </label>
          </div>
        </div>
      ) : null}

      {loading ? <p className="text-xs text-slate-500">Loading root families…</p> : null}
      {loadError ? <p className="text-xs text-red-600">{loadError}</p> : null}
      {!loading && !loadError && roots.length === 0 && enabled ? (
        <p className="text-xs text-amber-700">No root families yet — create without linking, or link later.</p>
      ) : null}
    </fieldset>
  );
}
