import { useMemo } from 'react';
import type { Member } from '@/modules/church-management/api/types';
import { isEligibleForMembershipFee } from '@/modules/church-management/lib/membershipEligibility';
import { useIdSelection } from '@/modules/church-management/lib/useIdSelection';
import { ui } from './familyDetailTheme';

type Props = {
  members: Member[];
  year: number;
  generating: boolean;
  onGenerate: (personIds: string[] | undefined) => void;
};

/** Select family members (or all eligible) then generate membership for the year. */
export function FamilyMemberBulkSelect({ members, year, generating, onGenerate }: Props) {
  const eligible = useMemo(
    () => members.filter((m) => isEligibleForMembershipFee(m.dateOfBirth)),
    [members]
  );
  const ids = useMemo(() => eligible.map((m) => m.id), [eligible]);
  const selection = useIdSelection(ids, `${year}|${ids.join(',')}`);

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
          Bulk generate membership ({year})
        </p>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-200">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={selection.allVisibleSelected && ids.length > 0}
            ref={(el) => {
              if (el) {
                el.indeterminate = selection.someVisibleSelected && !selection.allVisibleSelected;
              }
            }}
            onChange={() => {
              if (selection.allVisibleSelected) selection.clearVisible();
              else selection.selectAllVisible();
            }}
          />
          Select all eligible ({ids.length})
        </label>
      </div>
      <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
        {eligible.length === 0 ? (
          <li className="text-slate-500">No eligible members (18+ with DOB) in this family.</li>
        ) : (
          eligible.map((m) => (
            <li key={m.id}>
              <label className="flex cursor-pointer items-center gap-2 py-0.5">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={selection.isSelected(m.id)}
                  onChange={() => selection.toggle(m.id)}
                />
                {m.fullName}
              </label>
            </li>
          ))
        )}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={ui.btnPrimary}
          disabled={generating || selection.count < 1}
          onClick={() => onGenerate(selection.selectedIds)}
        >
          {generating ? 'Generating…' : `Generate for ${selection.count} selected`}
        </button>
        <button
          type="button"
          className={ui.btnOutline}
          disabled={generating || ids.length < 1}
          onClick={() => onGenerate(undefined)}
        >
          Generate for all eligible
        </button>
      </div>
    </div>
  );
}
