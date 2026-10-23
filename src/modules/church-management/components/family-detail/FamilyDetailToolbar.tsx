import type { Member } from '@/modules/church-management/api/types';
import { canSplitMember } from '@/modules/church-management/lib/memberActions';
import { fd } from './familyDetailTheme';

interface FamilyDetailToolbarProps {
  familyCode: string;
  headName?: string;
  splittableMembers: Member[];
  splitMemberId: string;
  onSplitMemberIdChange: (id: string) => void;
  onSplit: () => void;
  onAddMember: () => void;
  addMemberOpen: boolean;
  onBack: () => void;
}

export function FamilyDetailToolbar({
  familyCode,
  headName,
  splittableMembers,
  splitMemberId,
  onSplitMemberIdChange,
  onSplit,
  onAddMember,
  addMemberOpen,
  onBack,
}: FamilyDetailToolbarProps) {
  return (
    <div className={fd.hero}>
      <div className={fd.heroGlow} />
      <div className={fd.heroGlow2} />
      <div className={fd.goldBar} />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-indigo-200 transition hover:text-white"
            >
              ← Back to families
            </button>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/90">
              Family record
            </p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-white md:text-4xl">
              {familyCode}
            </h1>
            {headName && (
              <p className="mt-2 flex items-center gap-2 text-sm text-indigo-100">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Head of family: <span className="font-medium text-white">{headName}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAddMember}
              className={addMemberOpen ? fd.btnAddClose : fd.btnAdd}
            >
              {addMemberOpen ? 'Close form' : '+ Add member'}
            </button>

            {splittableMembers.length > 0 && (
              <div className={fd.splitBox}>
                <select
                  value={splitMemberId}
                  onChange={(e) => onSplitMemberIdChange(e.target.value)}
                  className={fd.select}
                  aria-label="Select son for family split"
                >
                  <option value="">Split family for…</option>
                  {splittableMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                      {m.relationship ? ` (${m.relationship})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!splitMemberId}
                  onClick={onSplit}
                  className={fd.btnSplit}
                >
                  Split family
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function getSplittableMembers(members: Member[] | undefined): Member[] {
  return members?.filter(canSplitMember) ?? [];
}
