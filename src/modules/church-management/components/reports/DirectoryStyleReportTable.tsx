import { Link } from 'react-router-dom';
import { churchMgmtPath } from '@/modules/church-management/paths';

export type DirectoryReportRow = {
  id: string;
  day?: number | null;
  fullName: string;
  familyId?: string | null;
  familyCode?: string | null;
  contactNumber?: string | null;
  houseName?: string | null;
  houseAddress?: string | null;
};

type Props = {
  items: DirectoryReportRow[];
  loading: boolean;
  loadingLabel: string;
  emptyLabel: string;
  title: string;
  /** Anniversary reports use "Husband & Wife" as the name heading. */
  nameColumnLabel?: string;
};

/** Classic print-directory report with house name & address. */
export function DirectoryStyleReportTable({
  items,
  loading,
  loadingLabel,
  emptyLabel,
  title,
  nameColumnLabel = 'Name',
}: Props) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-slate-500">{loadingLabel}</p>;
  }

  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-hidden rounded-sm border border-[hsl(var(--primary))]/20 bg-[#faf8f5] shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="border-b border-[hsl(var(--primary))]/25 bg-[hsl(var(--primary))] px-4 py-4 text-center sm:px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/65">
          All Saints C.S.I. Church
        </p>
        <h2 className="mt-1 font-serif text-lg font-semibold tracking-wide text-white sm:text-xl">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--primary))]/20 bg-white/70 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary))] dark:bg-zinc-800/80 dark:text-zinc-200">
              <th className="w-16 px-3 py-3 text-center sm:px-4">Date</th>
              <th className="min-w-[10rem] px-3 py-3 sm:px-4">{nameColumnLabel}</th>
              <th className="min-w-[8rem] px-3 py-3 sm:px-4">House name</th>
              <th className="min-w-[10rem] px-3 py-3 sm:px-4">House address</th>
              <th className="w-24 px-3 py-3 sm:px-4">Family</th>
              <th className="min-w-[7rem] px-3 py-3 sm:px-4">Phone</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-950/40">
            {items.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-3 py-3 text-center font-serif text-base font-semibold tabular-nums text-[hsl(var(--primary))] sm:px-4 dark:text-white">
                  {row.day ?? ''}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <Link
                    to={churchMgmtPath(`people/${row.id}`)}
                    className="font-serif text-[15px] font-semibold text-[hsl(var(--primary))] hover:underline dark:text-white"
                  >
                    {row.fullName}
                  </Link>
                </td>
                <td className="px-3 py-3 text-[13px] text-slate-700 sm:px-4 dark:text-zinc-300">
                  {row.houseName || '—'}
                </td>
                <td className="max-w-[14rem] px-3 py-3 text-[13px] leading-snug text-slate-600 sm:px-4 dark:text-zinc-400">
                  {row.houseAddress || '—'}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  {row.familyId ? (
                    <Link
                      to={churchMgmtPath(`families/${row.familyId}`)}
                      className="text-[13px] font-medium text-[hsl(var(--primary))] hover:underline"
                    >
                      {row.familyCode || 'Family'}
                    </Link>
                  ) : (
                    <span className="text-[13px]">{row.familyCode || '—'}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-[13px] tabular-nums text-slate-700 sm:px-4 dark:text-zinc-300">
                  {row.contactNumber || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[hsl(var(--primary))]/15 bg-white/60 px-4 py-2.5 text-right font-serif text-sm italic text-[hsl(var(--primary))]/80 dark:bg-zinc-900 dark:text-zinc-400">
        All Saints C.S.I. Church
      </div>
    </div>
  );
}
