import { useEffect, useMemo, useState } from 'react';
import { membersApi } from '@/modules/church-management/api/families';
import type { Member } from '@/modules/church-management/api/types';
import { isEligibleForMembershipFee } from '@/modules/church-management/lib/membershipEligibility';
import { useIdSelection } from '@/modules/church-management/lib/useIdSelection';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { SubmitSearchField } from '@/components/SubmitSearchField';

export type ApplyScope = 'all' | 'selected';

type Props = {
  scope: ApplyScope;
  onScopeChange: (scope: ApplyScope) => void;
  onSelectedIdsChange: (ids: string[]) => void;
};

/** Filter + select persons (or all eligible) before bulk applying membership. */
export function ApplyMembershipPersonPicker({
  scope,
  onScopeChange,
  onSelectedIdsChange,
}: Props) {
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scope !== 'selected') {
      onSelectedIdsChange([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const res = await membersApi.getMembers(undefined, search.trim() || undefined, 'Active');
      if (cancelled) return;
      const list = Array.isArray(res.data) ? res.data : [];
      setMembers(list.filter((m) => isEligibleForMembershipFee(m.dateOfBirth)));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // intentionally not depending on onSelectedIdsChange
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, search]);

  const visibleIds = useMemo(() => members.map((m) => m.id), [members]);
  const selection = useIdSelection(visibleIds, `${scope}|${search}`);

  useEffect(() => {
    if (scope === 'selected') {
      onSelectedIdsChange(selection.selectedIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, selection.selectedIds]);

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Who to update</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`${ui.btnGhost} ${
            scope === 'all' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--muted))] font-semibold' : ''
          }`}
          onClick={() => onScopeChange('all')}
        >
          All eligible (18+)
        </button>
        <button
          type="button"
          className={`${ui.btnGhost} ${
            scope === 'selected'
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--muted))] font-semibold'
              : ''
          }`}
          onClick={() => onScopeChange('selected')}
        >
          Select persons
        </button>
      </div>

      {scope === 'selected' ? (
        <div className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-zinc-700">
          <SubmitSearchField
            value={search}
            onSearch={setSearch}
            placeholder="Search members… Enter"
            className="max-w-md"
            inputClassName={ui.input}
            buttonClassName={`${ui.btnOutline} shrink-0 px-3 py-2`}
            aria-label="Search members"
          />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2 font-medium text-slate-700 dark:text-zinc-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={selection.allVisibleSelected && visibleIds.length > 0}
                ref={(el) => {
                  if (el) {
                    el.indeterminate =
                      selection.someVisibleSelected && !selection.allVisibleSelected;
                  }
                }}
                onChange={() => {
                  if (selection.allVisibleSelected) selection.clearVisible();
                  else selection.selectAllVisible();
                }}
              />
              Select all in filter ({visibleIds.length})
            </label>
            <span className="text-slate-500">{selection.count} selected</span>
          </div>
          <div className="max-h-56 overflow-y-auto rounded border border-slate-100 dark:border-zinc-800">
            {loading ? (
              <p className="p-3 text-sm text-slate-500">Loading…</p>
            ) : members.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">No eligible members match this search.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                {members.map((m) => (
                  <li key={m.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-zinc-800/60">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={selection.isSelected(m.id)}
                        onChange={() => selection.toggle(m.id)}
                      />
                      <span className="font-medium text-slate-800 dark:text-zinc-100">
                        {m.fullName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {m.family?.familyCode || m.familyId || ''}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Applies to every active member aged 18+ with date of birth on file.
        </p>
      )}
    </div>
  );
}
