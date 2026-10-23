import { Link } from 'react-router-dom';
import type { FormerFamilyMember, Member } from '@/modules/church-management/api/types';
import { churchMgmtPath } from '@/modules/church-management/paths';
import {
  isActiveAssociateMember,
  membershipLabel,
  normalizeMembershipType,
  type FamilyMembershipGroups,
} from '@/modules/church-management/lib/membershipType';
import { isEligibleHeadOfFamily } from '@/modules/church-management/lib/hofEligibility';
import { getMemberRoleLabel } from '@/modules/church-management/lib/familyRoles';
import { marriedToFamilyLabel } from '@/modules/church-management/lib/marriageDisplay';
import {
  destinationFamilyId,
  destinationFamilyLabel,
  divorcedOnFamilyMembers,
  groupFormerMembersByStatus,
  marriedAwayMembers,
} from '@/modules/church-management/lib/membershipStatusGroups';
import { MemberDuesCell } from './MemberDuesCell';
import { MemberRowActions } from './MemberRowActions';
import { ActionHint } from '@/modules/church-management/components/ActionHint';
import {
  needsAgeForSplit,
  needsGenderForSplit,
} from '@/modules/church-management/lib/memberActions';
import { MemberAvatar } from '@/modules/church-management/components/MemberAvatar';

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function statusLabel(member: Member): string {
  if (member.status === 'Deceased') return 'Deceased';
  if (member.status === 'Separated') return 'Married Away';
  if (member.status === 'Divorced') return 'Divorced';
  return 'Active';
}

/** Compact section bar: TITLE ——— N TOTAL (dark, readable). */
function SectionLabel({ title, count, colSpan }: { title: string; count: number; colSpan: number }) {
  if (count === 0) return null;
  return (
    <tr className="cm-members-section">
      <td colSpan={colSpan} className="px-3 pb-1 pt-3">
        <div className="flex items-center gap-2.5">
          <span className="cm-members-section-title shrink-0 text-[11px] font-bold uppercase tracking-[0.08em]">
            {title}
          </span>
          <span className="cm-members-section-line h-px min-w-[1.5rem] flex-1" aria-hidden />
          <span className="cm-members-section-total shrink-0 text-[11px] font-bold uppercase tracking-[0.06em]">
            {count} total
          </span>
        </div>
      </td>
    </tr>
  );
}

interface FamilyMembersTableProps {
  groups: FamilyMembershipGroups;
  headOfFamilyId?: string;
  familyId?: string;
  familyCode?: string;
  familyInactive?: boolean;
  formerMembers?: FormerFamilyMember[];
  currentMembers?: Member[];
  onSetHeadOfFamily?: (member: Member) => void | Promise<void>;
  onEdit: (member: Member) => void;
  onSplit: (member: Member) => void;
  onMarkDeceased?: (member: Member) => void;
}

export function FamilyMembersTable({
  groups,
  headOfFamilyId,
  familyId,
  familyCode,
  familyInactive = false,
  formerMembers = [],
  currentMembers,
  onSetHeadOfFamily,
  onEdit,
  onSplit,
  onMarkDeceased,
}: FamilyMembersTableProps) {
  const currentYear = new Date().getFullYear();
  const { headOfFamily, fullMembers, associateMembers, pastAssociates, deceasedMembers } =
    groups;

  const hofInFull =
    headOfFamily && normalizeMembershipType(headOfFamily.membershipType) === 'FULL';
  const hofInAssociate = headOfFamily && isActiveAssociateMember(headOfFamily);

  const fullRows = [...(hofInFull && headOfFamily ? [headOfFamily] : []), ...fullMembers];
  const associateRows = [
    ...(hofInAssociate && headOfFamily ? [headOfFamily] : []),
    ...associateMembers,
  ];

  const history = groupFormerMembersByStatus(formerMembers);
  const marriedAway = marriedAwayMembers(currentMembers).filter(
    (m) => !formerMembers.some((f) => f.personId === m.id)
  );
  const divorcedOnFamily = divorcedOnFamilyMembers(currentMembers).filter(
    (m) => !formerMembers.some((f) => f.personId === m.id)
  );

  const activeTotal = fullRows.length + associateRows.length;
  const historyTotal =
    history.movedTo.length +
    history.marriedTo.length +
    marriedAway.length +
    divorcedOnFamily.length +
    deceasedMembers.length +
    pastAssociates.length;
  const totalCount = activeTotal + historyTotal;
  const showHead = !!onSetHeadOfFamily;
  const colCount = showHead ? 8 : 7;

  const th = 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider';
  const td = 'whitespace-nowrap px-3 py-2 text-sm';

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Family members
          <span className="ml-1.5 font-normal text-zinc-500">({totalCount})</span>
        </h2>
      </div>

      {totalCount === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          No members yet. Use <strong>Add member</strong> above.
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="cm-table-dark-head">
              <tr>
                <th className={th}>Name</th>
                {showHead && <th className={`${th} w-12 text-center`}>Head</th>}
                <th className={th}>Status</th>
                <th className={th}>Role</th>
                <th className={th}>Type</th>
                <th className={th}>Contact</th>
                <th
                  className={th}
                  title="Total unpaid to church: membership through this month + any other assigned dues"
                >
                  All dues
                </th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <SectionLabel title="Full members" count={fullRows.length} colSpan={colCount} />
              {fullRows.map((m) => (
                <LivingRow
                  key={m.id}
                  member={m}
                  headOfFamilyId={headOfFamilyId}
                  familyId={familyId}
                  familyCode={familyCode}
                  currentYear={currentYear}
                  showHead={showHead}
                  familyInactive={familyInactive}
                  td={td}
                  onEdit={onEdit}
                  onSplit={onSplit}
                  onMarkDeceased={onMarkDeceased}
                  onSetHeadOfFamily={onSetHeadOfFamily}
                />
              ))}

              <SectionLabel
                title="Associate members"
                count={associateRows.length}
                colSpan={colCount}
              />
              {associateRows.map((m) => (
                <LivingRow
                  key={m.id}
                  member={m}
                  headOfFamilyId={headOfFamilyId}
                  familyId={familyId}
                  familyCode={familyCode}
                  currentYear={currentYear}
                  showHead={showHead}
                  familyInactive={familyInactive}
                  td={td}
                  onEdit={onEdit}
                  onSplit={onSplit}
                  onMarkDeceased={onMarkDeceased}
                  onSetHeadOfFamily={onSetHeadOfFamily}
                />
              ))}

              <SectionLabel title="Deceased" count={deceasedMembers.length} colSpan={colCount} />
              {deceasedMembers.map((m) => (
                <LivingRow
                  key={m.id}
                  member={m}
                  headOfFamilyId={headOfFamilyId}
                  familyId={familyId}
                  familyCode={familyCode}
                  currentYear={currentYear}
                  showHead={false}
                  padHead={showHead}
                  familyInactive={familyInactive}
                  muted
                  td={td}
                  onEdit={onEdit}
                  onSplit={onSplit}
                  onMarkDeceased={onMarkDeceased}
                />
              ))}

              <SectionLabel
                title="Past associates"
                count={pastAssociates.length}
                colSpan={colCount}
              />
              {pastAssociates.map((m) => (
                <LivingRow
                  key={m.id}
                  member={m}
                  headOfFamilyId={headOfFamilyId}
                  familyId={familyId}
                  familyCode={familyCode}
                  currentYear={currentYear}
                  showHead={false}
                  padHead={showHead}
                  familyInactive={familyInactive}
                  muted
                  td={td}
                  onEdit={onEdit}
                  onSplit={onSplit}
                  onMarkDeceased={onMarkDeceased}
                />
              ))}

              <SectionLabel title="Moved To" count={history.movedTo.length} colSpan={colCount} />
              {history.movedTo.map((m) => (
                <HistoryRow
                  key={`moved-${m.personId}-${m.leaveReason}`}
                  personId={m.personId}
                  name={m.fullName}
                  role={m.relationship}
                  status="Moved To"
                  detail={destinationFamilyLabel(m)}
                  detailHref={
                    destinationFamilyId(m)
                      ? churchMgmtPath('families', destinationFamilyId(m)!)
                      : undefined
                  }
                  when={m.eventDate}
                  note={m.notes}
                  showHeadPad={showHead}
                  td={td}
                />
              ))}

              <SectionLabel
                title="Married Away"
                count={history.marriedTo.length + marriedAway.length}
                colSpan={colCount}
              />
              {history.marriedTo.map((m) => (
                <HistoryRow
                  key={`married-${m.personId}-${m.leaveReason}`}
                  personId={m.personId}
                  name={m.fullName}
                  role={m.relationship}
                  status="Married Away"
                  detail={destinationFamilyLabel(m) || m.spouseName}
                  detailHref={
                    destinationFamilyId(m)
                      ? churchMgmtPath('families', destinationFamilyId(m)!)
                      : undefined
                  }
                  when={m.eventDate}
                  note={m.notes}
                  showHeadPad={showHead}
                  td={td}
                />
              ))}
              {marriedAway.map((m) => (
                <HistoryRow
                  key={`away-${m.id}`}
                  personId={m.id}
                  name={m.fullName}
                  role={getMemberRoleLabel(m)}
                  status="Married Away"
                  detail={marriedToFamilyLabel(m) || m.spouseName}
                  detailHref={
                    m.marriedToFamily?.id
                      ? churchMgmtPath('families', m.marriedToFamily.id)
                      : undefined
                  }
                  when={m.marriageDate}
                  note={m.statusNotes}
                  showHeadPad={showHead}
                  td={td}
                  onEdit={() => onEdit(m)}
                />
              ))}

              <SectionLabel title="Divorced" count={divorcedOnFamily.length} colSpan={colCount} />
              {divorcedOnFamily.map((m) => (
                <HistoryRow
                  key={`div-${m.id}`}
                  personId={m.id}
                  name={m.fullName}
                  role={getMemberRoleLabel(m)}
                  status="Divorced"
                  detail={m.spouseName}
                  when={undefined}
                  note={m.statusNotes}
                  showHeadPad={showHead}
                  td={td}
                  onEdit={() => onEdit(m)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LivingRow({
  member,
  headOfFamilyId,
  familyId,
  familyCode,
  currentYear,
  showHead,
  padHead = false,
  familyInactive,
  muted = false,
  td,
  onEdit,
  onSplit,
  onMarkDeceased,
  onSetHeadOfFamily,
}: {
  member: Member;
  headOfFamilyId?: string;
  familyId?: string;
  familyCode?: string;
  currentYear: number;
  showHead: boolean;
  padHead?: boolean;
  familyInactive: boolean;
  muted?: boolean;
  td: string;
  onEdit: (m: Member) => void;
  onSplit: (m: Member) => void;
  onMarkDeceased?: (m: Member) => void;
  onSetHeadOfFamily?: (m: Member) => void | Promise<void>;
}) {
  const status = statusLabel(member);
  const isHead = member.isHeadOfFamily || member.id === headOfFamilyId;
  const canPickHead = showHead && !!onSetHeadOfFamily && isEligibleHeadOfFamily(member);
  const hints = [
    needsGenderForSplit(member) ? 'Set gender' : null,
    needsAgeForSplit(member) ? 'Age 18+ / DOB needed' : null,
  ].filter(Boolean);

  return (
    <tr
      className={
        muted
          ? 'border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/20'
          : 'border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40'
      }
    >
      <td className={`${td} whitespace-normal`}>
        <div className="flex min-w-0 items-center gap-2">
          <MemberAvatar photo={member.photo} name={member.fullName} size="sm" />
          <div className="min-w-0">
            <Link
              to={churchMgmtPath('people', member.id)}
              className="font-medium text-zinc-900 hover:underline dark:text-white"
            >
              {member.fullName}
            </Link>
            {member.isHeadOfFamily && (
              <span className="ml-1.5 text-xs text-zinc-500">· Head</span>
            )}
            {hints.length > 0 && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400">{hints.join(' · ')}</p>
            )}
          </div>
        </div>
      </td>
      {(showHead || padHead) && (
        <td className={`${td} text-center`}>
          {canPickHead ? (
            <ActionHint hint={`Set ${member.fullName} as head of family`}>
              <input
                type="radio"
                name="head-of-family"
                checked={isHead}
                onClick={(e) => {
                  if (isHead) return;
                  e.preventDefault();
                  onSetHeadOfFamily?.(member);
                }}
                onChange={() => {}}
                aria-label={`Set ${member.fullName} as head of family`}
                className="h-3.5 w-3.5 cursor-pointer accent-zinc-800"
              />
            </ActionHint>
          ) : (
            <span className="text-zinc-300">—</span>
          )}
        </td>
      )}
      <td className={td}>{status}</td>
      <td className={`${td} capitalize`}>{getMemberRoleLabel(member)}</td>
      <td className={td}>{membershipLabel(normalizeMembershipType(member.membershipType))}</td>
      <td className={td}>{member.contactNumber || '—'}</td>
      <td className={td}>
        <MemberDuesCell
          member={member}
          year={currentYear}
          familyId={familyId}
          familyCode={familyCode}
        />
      </td>
      <td className={`${td} text-right`}>
        <MemberRowActions
          member={member}
          familyInactive={familyInactive}
          familyId={familyId}
          familyCode={familyCode}
          onEdit={onEdit}
          onSplit={onSplit}
          onMarkDeceased={onMarkDeceased}
        />
      </td>
    </tr>
  );
}

function HistoryRow({
  personId,
  name,
  role,
  status,
  detail,
  detailHref,
  when,
  note,
  showHeadPad,
  td,
  onEdit,
}: {
  personId: string;
  name: string;
  role?: string | null;
  status: string;
  detail?: string | null;
  detailHref?: string;
  when?: string;
  note?: string | null;
  showHeadPad: boolean;
  td: string;
  onEdit?: () => void;
}) {
  return (
    <tr className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
      <td className={`${td} whitespace-normal`}>
        <Link
          to={churchMgmtPath('people', personId)}
          className="font-medium text-zinc-900 hover:underline dark:text-white"
        >
          {name}
        </Link>
      </td>
      {showHeadPad && <td className={`${td} text-center text-zinc-300`}>—</td>}
      <td className={td}>{status}</td>
      <td className={`${td} capitalize`}>{role || '—'}</td>
      <td className={`${td} text-zinc-400`}>—</td>
      <td className={`${td} whitespace-normal`}>
        {detailHref && detail ? (
          <Link
            to={detailHref}
            className="font-medium text-blue-700 hover:underline dark:text-blue-400"
          >
            {detail}
          </Link>
        ) : (
          <span>{detail || '—'}</span>
        )}
      </td>
      <td className={`${td} whitespace-normal`}>
        <span>{formatDate(when)}</span>
        {note && (
          <span className="ml-1 text-xs text-zinc-500" title={note}>
            {note}
          </span>
        )}
      </td>
      <td className={`${td} text-right`}>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-medium text-slate-700 hover:underline dark:text-zinc-300"
          >
            Edit
          </button>
        ) : (
          <Link
            to={churchMgmtPath('people', personId)}
            className="text-sm font-medium text-slate-700 hover:underline dark:text-zinc-300"
          >
            View
          </Link>
        )}
      </td>
    </tr>
  );
}
