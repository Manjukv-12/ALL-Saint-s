import type { MembershipType } from '@/modules/church-management/api/types';
import { membershipLabel, normalizeMembershipType } from '@/modules/church-management/lib/membershipType';

function formatShortDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function MembershipBadge({
  type,
  associateJoinDate,
  associateLeftDate,
  showDates = false,
}: {
  type?: MembershipType;
  associateJoinDate?: string;
  associateLeftDate?: string;
  showDates?: boolean;
}) {
  const normalized = normalizeMembershipType(type);
  const isAssociate = normalized === 'ASSOCIATE';

  return (
    <div>
      <span
        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
          isAssociate
            ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200'
            : 'bg-slate-200 text-slate-800 dark:bg-zinc-700 dark:text-zinc-100'
        }`}
      >
        {membershipLabel(normalized)}
      </span>
      {showDates && isAssociate && (
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          {associateJoinDate ? `Joined ${formatShortDate(associateJoinDate)}` : 'Join date not set'}
          {associateLeftDate ? ` · Left ${formatShortDate(associateLeftDate)}` : ''}
        </p>
      )}
    </div>
  );
}
