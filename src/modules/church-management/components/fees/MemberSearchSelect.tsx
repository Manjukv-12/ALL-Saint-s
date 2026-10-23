import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Member } from '@/modules/church-management/api/types';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';

function memberMeta(member: Member): string {
  const parts: string[] = [];
  if (member.family?.familyCode) parts.push(member.family.familyCode);
  if (member.relationshipToHOF) parts.push(member.relationshipToHOF);
  if (member.contactNumber) parts.push(member.contactNumber);
  return parts.join(' · ');
}

function memberOptionLabel(member: Member): string {
  const meta = memberMeta(member);
  return meta ? `${member.fullName} (${meta})` : member.fullName;
}

type Props = {
  value: string;
  onChange: (id: string, member?: Member) => void;
  members: Member[];
  selectedMember?: Member | null;
  loading?: boolean;
  /** When set, search is sent to parent (church-wide API). Otherwise use a simple dropdown. */
  onSearchChange?: (query: string) => void;
  compact?: boolean;
};

/** Simple dropdown for a known member list (family Fees page). */
function MemberDropdownSelect({
  value,
  onChange,
  members,
  compact = false,
}: {
  value: string;
  onChange: (id: string, member?: Member) => void;
  members: Member[];
  compact?: boolean;
}) {
  const fieldClass = compact
    ? `${ui.select} w-full appearance-none pr-10 text-base py-3`
    : `${ui.select} w-full appearance-none pr-12 text-lg leading-normal py-4 min-h-[3.25rem]`;

  return (
    <div className="space-y-3">
      <label htmlFor="member-due-select" className="block text-base font-semibold text-slate-700 dark:text-zinc-300">
        Member *
      </label>
      <div className="relative">
        <select
          id="member-due-select"
          value={value}
          onChange={(e) => {
            const id = e.target.value;
            const member = members.find((m) => m.id === id);
            onChange(id, member);
          }}
          className={fieldClass}
          required
        >
          <option value="">— Select a family member —</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {memberOptionLabel(m)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
      </div>
      {members.length === 0 && (
        <p className="text-sm text-amber-700">No active members in this family.</p>
      )}
    </div>
  );
}

/** Type-to-search for church-wide member pick. Search runs on Enter / Search only. */
function MemberTypeaheadSelect({
  value,
  onChange,
  members,
  selectedMember: selectedOverride,
  loading = false,
  onSearchChange,
  compact = false,
}: Props & { onSearchChange: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = selectedOverride ?? members.find((m) => m.id === value);
  const hasSearch = appliedQuery.trim().length > 0;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const runSearch = () => {
    const next = query.trim();
    setAppliedQuery(next);
    onSearchChange(next);
    setOpen(true);
  };

  const pick = (member: Member) => {
    onChange(member.id, member);
    setQuery('');
    setAppliedQuery('');
    onSearchChange('');
    setOpen(false);
  };

  const clearSelection = () => {
    onChange('');
    setQuery('');
    setAppliedQuery('');
    onSearchChange('');
    setOpen(false);
  };

  const fieldClass = compact
    ? `${ui.select} w-full text-base py-3`
    : `${ui.select} w-full text-lg leading-normal py-4 min-h-[3.25rem]`;

  return (
    <div ref={rootRef} className="space-y-3">
      <span className="text-base font-semibold text-slate-700 dark:text-zinc-300">Member *</span>

      {selected && !open ? (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50 ${
            compact ? '' : 'sm:px-5 sm:py-4'
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{selected.fullName}</p>
            {memberMeta(selected) && (
              <p className="mt-1 text-base text-slate-500 dark:text-zinc-400">{memberMeta(selected)}</p>
            )}
          </div>
          <button type="button" onClick={clearSelection} className={`${ui.btnOutline} px-5 py-3 text-base`}>
            Change
          </button>
        </div>
      ) : (
        <div className="relative space-y-2">
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runSearch();
                }
              }}
              onFocus={() => {
                if (hasSearch) setOpen(true);
              }}
              placeholder="Type name, family code, or phone… then press Enter"
              className={fieldClass}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={runSearch}
              className={`${ui.btnOutline} shrink-0 px-4 ${compact ? 'py-3 text-base' : 'py-4 text-lg'}`}
            >
              Search
            </button>
          </div>
          {open && hasSearch && (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {loading ? (
                <p className="px-5 py-4 text-base text-slate-500">Searching members…</p>
              ) : members.length === 0 ? (
                <p className="px-5 py-4 text-base text-slate-500">No members match your search</p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {members.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => pick(m)}
                        className="w-full px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-zinc-800"
                      >
                        <span className="block text-lg font-medium text-slate-900 dark:text-white">
                          {m.fullName}
                        </span>
                        {memberMeta(m) && (
                          <span className="mt-1 block text-base text-slate-500 dark:text-zinc-400">
                            {memberMeta(m)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MemberSearchSelect(props: Props) {
  // Family Fees: fixed member list → clear dropdown.
  if (!props.onSearchChange) {
    return (
      <MemberDropdownSelect
        value={props.value}
        onChange={props.onChange}
        members={props.members}
        compact={props.compact}
      />
    );
  }

  return <MemberTypeaheadSelect {...props} onSearchChange={props.onSearchChange} />;
}
