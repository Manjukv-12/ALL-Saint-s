import type { Family } from '@/modules/church-management/api/types';

type Props = {
  family: Family;
  onOpenFamily: (id: string) => void;
  onOpenPerson: (personId: string) => void;
};

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function FamilyLineageSplitHistory({ family, onOpenFamily, onOpenPerson }: Props) {
  const splitHistory = family.lineageInfo?.splitHistory ?? [];
  if (splitHistory.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Movement history</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
        When someone left this line to start or join another household.
      </p>
      <div className="mt-3 space-y-3">
        {splitHistory.map((event) => {
          const createdThisFamily = event.toFamilyId === family.id;
          return (
            <div
              key={`${event.personId}-${event.fromFamilyId}-${event.toFamilyId}-${event.splitDate}`}
              className={`rounded-lg border p-4 ${
                createdThisFamily
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                  : 'border-slate-200 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800/50'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {createdThisFamily ? 'This family started from a split' : 'A branch was formed from here'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-zinc-300">
                    <button
                      type="button"
                      onClick={() => onOpenPerson(event.personId)}
                      className="cm-member-profile-link font-semibold"
                    >
                      {event.personName}
                    </button>
                  </p>
                </div>
                <span className="text-sm text-slate-500 dark:text-zinc-400">{formatDate(event.splitDate)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => onOpenFamily(event.fromFamilyId)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono font-semibold text-blue-700 hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-blue-400"
                >
                  {event.fromFamilyCode}
                </button>
                <span className="font-medium text-slate-500">→</span>
                <button
                  type="button"
                  onClick={() => onOpenFamily(event.toFamilyId)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono font-semibold text-blue-700 hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-blue-400"
                >
                  {event.toFamilyCode}
                </button>
              </div>
              {event.notes ? (
                <p className="mt-3 border-l-2 border-blue-300 pl-3 text-sm leading-relaxed text-slate-600 dark:border-blue-700 dark:text-zinc-300">
                  {event.notes}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
