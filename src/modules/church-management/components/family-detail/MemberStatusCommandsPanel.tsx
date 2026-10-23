import {
  MEMBER_STATUS_COMMANDS,
  MEMBER_STATUS_OPTIONS,
  memberStatusBadgeClass,
} from '@/modules/church-management/lib/memberStatus';
import { ui } from './familyDetailTheme';

export function MemberStatusCommandsPanel({ hidden = false }: { hidden?: boolean }) {
  if (hidden) return null;

  return (
    <div className="border-b border-slate-200 px-6 py-4 dark:border-zinc-700">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
        Member status &amp; commands
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
        Status shows in each row. Use the commands below from the Actions column (or Head column).
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
            Statuses
          </p>
          <ul className="space-y-2">
            {MEMBER_STATUS_OPTIONS.map((status) => (
              <li key={status.value} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${memberStatusBadgeClass(status.value)}`}
                >
                  {status.label}
                </span>
                <span className="text-slate-600 dark:text-zinc-400">{status.hint}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
            Commands
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-700">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className={ui.tableHead}>
                  <th className={ui.thCompact}>Command</th>
                  <th className={ui.thCompact}>Who</th>
                  <th className={ui.thCompact}>Changes to</th>
                </tr>
              </thead>
              <tbody>
                {MEMBER_STATUS_COMMANDS.map((row) => (
                  <tr key={row.command} className={ui.row}>
                    <td className={`${ui.tdCompact} font-medium`}>{row.command}</td>
                    <td className={`${ui.tdCompact} text-slate-600 dark:text-zinc-400`}>{row.who}</td>
                    <td className={ui.tdCompact}>
                      {row.to === '—' ? (
                        <span className="text-slate-400">—</span>
                      ) : row.to === 'New family' ? (
                        <span className="text-slate-700 dark:text-zinc-300">Active in new family</span>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${memberStatusBadgeClass(row.to)}`}
                        >
                          {row.to}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 space-y-1.5">
            {MEMBER_STATUS_COMMANDS.filter((c) => c.from !== '—').map((row) => (
              <li key={`hint-${row.command}`} className="text-xs text-slate-500 dark:text-zinc-400">
                <strong className="font-medium text-slate-700 dark:text-zinc-300">{row.command}:</strong>{' '}
                {row.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
