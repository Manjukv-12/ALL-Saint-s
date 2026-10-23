import { Link } from 'react-router-dom';
import type { Member } from '@/modules/church-management/api/types';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { getMemberRoleLabel } from '@/modules/church-management/lib/familyRoles';
import { MemberAvatar } from '@/modules/church-management/components/MemberAvatar';
import { MembershipStatusBadge } from '@/modules/church-management/components/MembershipStatusBadge';

function titleCaseWords(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

type Props = {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
};

export function MembersTable({ members, onEdit, onDelete }: Props) {
  const th =
    'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300';
  const td = 'px-4 py-2.5 align-middle text-sm text-slate-800 dark:text-zinc-200';

  return (
    <div className={`${ui.card} overflow-x-auto`}>
      <table className="min-w-full border-collapse text-left">
        <thead className="bg-slate-100 dark:bg-zinc-800">
          <tr className="border-b border-slate-200 dark:border-zinc-700">
            <th className={th}>Name</th>
            <th className={th}>Family</th>
            <th className={th}>Status</th>
            <th className={th}>Relationship</th>
            <th className={th}>Contact</th>
            <th className={`${th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan={6} className={`${td} py-8 text-center text-slate-500`}>
                No members found
              </td>
            </tr>
          ) : (
            members.map((member) => {
              const role = getMemberRoleLabel(member);
              return (
                <tr
                  key={member.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
                >
                  <td className={td}>
                    <div className="flex min-w-0 items-center gap-2">
                      <MemberAvatar photo={member.photo} name={member.fullName || ''} size="sm" />
                      <Link
                        to={churchMgmtPath('people', member.id)}
                        className="cm-admin-link truncate font-medium hover:underline"
                      >
                        {titleCaseWords(member.fullName || '')}
                      </Link>
                      {member.isHeadOfFamily && (
                        <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
                          HOF
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`${td} font-mono text-xs`}>
                    {member.family ? (
                      <div className="min-w-0">
                        <Link
                          to={churchMgmtPath('families', member.family.id)}
                          className="font-medium text-blue-700 hover:underline dark:text-blue-400"
                        >
                          {member.family.familyCode}
                        </Link>
                        {member.family.area ? (
                          <p className="mt-0.5 truncate text-[11px] font-sans text-slate-500 dark:text-zinc-400" title={member.family.area}>
                            {member.family.area}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className={td}>
                    <MembershipStatusBadge member={member} className="max-w-[14rem]" />
                  </td>
                  <td className={`${td} capitalize`}>
                    {role === '—' ? '—' : titleCaseWords(role)}
                  </td>
                  <td className={`${td} tabular-nums text-slate-600 dark:text-zinc-300`}>
                    {member.contactNumber || '—'}
                  </td>
                  <td className={`${td} text-right`}>
                    <div className="inline-flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(member)}
                        className="cm-admin-link text-sm hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(member.id)}
                        className="text-sm font-medium text-red-700 hover:underline dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
