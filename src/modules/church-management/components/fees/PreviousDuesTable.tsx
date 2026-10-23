import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import type { PreviousDuesMemberRow } from '@/modules/church-management/api/fees';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';
import { SubmitSearchField } from '@/components/SubmitSearchField';
import { PREVIOUS_DUES_THROUGH_YEAR } from '@/modules/church-management/lib/feesYearPolicy';
import { FeesYearSplitNotice } from '@/modules/church-management/components/fees/FeesYearSplitNotice';
import { previousDuesPaymentPath } from '@/modules/church-management/lib/previousDuesPayment';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  people: PreviousDuesMemberRow[];
  totalAmount: number;
  search: string;
  page: number;
  totalPages: number;
  loading: boolean;
  onSearchChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onRefresh: () => void;
  onBackToCurrentDues: () => void;
};

export function PreviousDuesTable({
  people,
  totalAmount,
  search,
  page,
  totalPages,
  loading,
  onSearchChange,
  onPageChange,
  onRefresh,
  onBackToCurrentDues,
}: Props) {
  const navigate = useNavigate();

  const goPay = (row: PreviousDuesMemberRow) => {
    navigate(previousDuesPaymentPath(row.personId), {
      state: {
        returnTo: churchMgmtPath('fees'),
        personName: row.personName,
        familyId: row.familyId,
        familyCode: row.familyCode,
      },
    });
  };

  return (
    <div className={`${ui.card} overflow-hidden`}>
      <div className="space-y-4 border-b border-slate-200 px-5 py-5 dark:border-zinc-700 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className={ui.sectionTitle}>
              Previous dues through {PREVIOUS_DUES_THROUGH_YEAR}
            </h2>
            <FeesYearSplitNotice focus="previous" className="mt-3" />
            <p className="mt-3 text-sm text-slate-600 dark:text-zinc-300">
              Members listed below still have a balance on their profile. Everyone else is treated
              as covered through {PREVIOUS_DUES_THROUGH_YEAR}.
            </p>
            <p className="mt-2 text-sm font-medium text-slate-800 dark:text-zinc-200">
              Total listed: ₹{formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button type="button" onClick={onBackToCurrentDues} className={ui.btnOutline}>
              Back to {PREVIOUS_DUES_THROUGH_YEAR + 1}+ dues
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className={ui.btnOutline}
              aria-label="Refresh"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <SubmitSearchField
          value={search}
          onSearch={onSearchChange}
          placeholder="Search name, family, or notes…"
          className="w-full max-w-lg"
          inputClassName={`${ui.input} h-10`}
          buttonClassName={`${ui.btnOutline} h-10 shrink-0 px-3`}
          aria-label="Search previous dues"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Family</th>
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Amount (₹)</th>
              <th className="px-4 py-3 font-semibold">Details</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {loading && people.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : people.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No outstanding previous dues on file — members are treated as covered through{' '}
                  {PREVIOUS_DUES_THROUGH_YEAR} unless marked on their profile.
                </td>
              </tr>
            ) : (
              people.map((row) => (
                <tr key={row.personId} className="align-top hover:bg-slate-50/80 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-zinc-100">
                    {row.familyCode}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-zinc-100">{row.personName}</div>
                    {row.personStatus && row.personStatus !== 'Active' ? (
                      <div className="text-xs text-slate-500">{row.personStatus}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-semibold text-slate-900 dark:text-zinc-100">
                    {formatCurrency(row.previousDuesAmount)}
                  </td>
                  <td className="max-w-md px-4 py-3 text-slate-700 dark:text-zinc-300">
                    <p className="whitespace-pre-wrap">{row.previousDuesNotes || '—'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Through calendar year {row.previousDuesThroughYear ?? PREVIOUS_DUES_THROUGH_YEAR}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        className={`${ui.btnPrimary} w-fit px-3 py-1.5 text-xs`}
                        onClick={() => goPay(row)}
                      >
                        Pay / clear
                      </button>
                      <Link
                        to={churchMgmtPath('people', row.personId, 'edit')}
                        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Edit member
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-zinc-700">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={ui.btnOutline}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600 dark:text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={ui.btnOutline}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
