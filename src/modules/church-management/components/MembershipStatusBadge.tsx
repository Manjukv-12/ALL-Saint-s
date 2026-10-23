import { Link } from 'react-router-dom';
import type { Member } from '@/modules/church-management/api/types';
import { churchMgmtPath } from '@/modules/church-management/paths';
import {
  memberDisplayStatus,
  membershipDisplayBadgeClass,
} from '@/modules/church-management/lib/membershipStatusGroups';
import { marriedToFamilyLabel } from '@/modules/church-management/lib/marriageDisplay';

type Props = {
  member: Member;
  /** Larger pill for profile headers. */
  size?: 'sm' | 'md';
  className?: string;
};

/** Shared status badge used by Members list, People search, and person profile. */
export function MembershipStatusBadge({ member, size = 'sm', className = '' }: Props) {
  const status = memberDisplayStatus(member);
  const marriedTo = status === 'Married To' ? marriedToFamilyLabel(member) : null;

  let detail: string | null = null;
  let detailHref: string | undefined;

  if (status === 'Moved To' && member.movedToFamily) {
    detail = member.movedFromFamily
      ? `${member.movedToFamily.familyCode} · from ${member.movedFromFamily.familyCode}`
      : member.movedToFamily.familyCode;
    detailHref = churchMgmtPath('families', member.movedToFamily.id);
  } else if (status === 'Married To' && marriedTo) {
    detail = marriedTo;
    if (member.marriedToFamily?.id) {
      detailHref = churchMgmtPath('families', member.marriedToFamily.id);
    }
  }

  const pill =
    size === 'md'
      ? 'rounded-full px-3 py-1 text-sm font-medium'
      : 'inline-flex shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold leading-none';

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`.trim()}>
      <span className={`${pill} ${membershipDisplayBadgeClass(status)}`}>{status}</span>
      {detail &&
        (detailHref ? (
          <Link
            to={detailHref}
            title={detail}
            onClick={(e) => e.stopPropagation()}
            className="truncate text-xs font-medium text-slate-600 hover:underline dark:text-zinc-400"
          >
            {detail}
          </Link>
        ) : (
          <span title={detail} className="truncate text-xs text-slate-500 dark:text-zinc-400">
            {detail}
          </span>
        ))}
    </div>
  );
}
