import type { Member } from '@/modules/church-management/api/types';
import { Link } from 'react-router-dom';
import { canSplitMember } from '@/modules/church-management/lib/memberActions';
import { ActionHint } from '@/modules/church-management/components/ActionHint';
import { churchMgmtPath } from '@/modules/church-management/paths';

type Props = {
  member: Member;
  familyInactive?: boolean;
  familyId?: string;
  familyCode?: string;
  onEdit: (member: Member) => void;
  onSplit: (member: Member) => void;
  onMarkDeceased?: (member: Member) => void;
};

const linkBtn =
  'text-sm font-medium text-slate-700 hover:underline dark:text-zinc-300';
const dangerBtn =
  'text-sm font-medium text-red-700 hover:underline dark:text-red-300';

export function MemberRowActions({
  member,
  familyInactive = false,
  familyId,
  familyCode,
  onEdit,
  onSplit,
  onMarkDeceased,
}: Props) {
  const splittable = !familyInactive && canSplitMember(member);
  const canDeceased =
    !familyInactive &&
    !!onMarkDeceased &&
    member.status !== 'Deceased' &&
    (member.status === 'Active' || !member.status);

  const feeDetailsTo = churchMgmtPath('fees', 'people', member.id);
  const feeDetailsState = {
    personName: member.fullName,
    familyId: familyId || member.familyId,
    familyCode,
    returnTo: familyId ? churchMgmtPath('families', familyId) : undefined,
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
      <ActionHint hint={`Open membership and dues for ${member.fullName}.`}>
        <Link
          to={feeDetailsTo}
          state={feeDetailsState}
          className={linkBtn}
          aria-label={`Fee details for ${member.fullName}`}
        >
          Fee details
        </Link>
      </ActionHint>

      <ActionHint hint={`Edit details for ${member.fullName}.`}>
        <button
          type="button"
          onClick={() => onEdit(member)}
          className={linkBtn}
          aria-label={`Edit ${member.fullName}`}
        >
          Edit
        </button>
      </ActionHint>

      {splittable && (
        <ActionHint hint={`Move ${member.fullName} to a new family as head. Clear dues first.`}>
          <button
            type="button"
            onClick={() => onSplit(member)}
            className={linkBtn}
            aria-label={`Move ${member.fullName} to a new family`}
          >
            Move
          </button>
        </ActionHint>
      )}

      {canDeceased && (
        <ActionHint hint={`Mark ${member.fullName} as deceased.`}>
          <button
            type="button"
            onClick={() => onMarkDeceased!(member)}
            className={dangerBtn}
            aria-label={`Mark ${member.fullName} as deceased`}
          >
            Deceased
          </button>
        </ActionHint>
      )}
    </div>
  );
}
