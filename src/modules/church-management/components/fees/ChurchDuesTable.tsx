import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Download, History, RefreshCw } from 'lucide-react';
import type {
  DueType,
  MemberDue,
  PersonDuesOverview,
} from '@/modules/church-management/api/fees';
import { feesApi } from '@/modules/church-management/api/fees';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';
import { PersonDuesStatusBadge } from '@/modules/church-management/components/fees/PersonDuesStatusBadge';
import { MembershipPaymentHistoryModal } from '@/modules/church-management/components/fees/MembershipPaymentHistoryModal';
import { collectPaymentPath } from '@/modules/church-management/lib/collectPaymentPath';
import { SubmitSearchField } from '@/components/SubmitSearchField';
import { ActionHint } from '@/modules/church-management/components/ActionHint';
import { DueStatusBadge } from '@/modules/church-management/components/fees/DueStatusBadge';
import { buildPersonExpandLines, type ExpandDueLine } from '@/modules/church-management/lib/personExpandDues';
import { dueTypeDisplayName } from '@/modules/church-management/lib/dueTypes';
import {
  feesManagementYearOptions,
  FEES_SYSTEM_START_YEAR,
  PREVIOUS_DUES_THROUGH_YEAR,
} from '@/modules/church-management/lib/feesYearPolicy';
import { PreviousDuesStatusChip } from '@/modules/church-management/components/fees/PreviousDuesStatusChip';
import { previousDuesPaymentPath } from '@/modules/church-management/lib/previousDuesPayment';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function membershipSubtext(row: PersonDuesOverview, year: number): string {
  if (row.hasFeeRowsForYear === false) {
    return `No ${year} fee rows yet — apply membership or add a due`;
  }
  if (row.paidUntilLabel) return `Paid until ${row.paidUntilLabel}`;
  if (row.membershipOutstanding > 0) return 'Membership unpaid';
  return 'No membership paid yet';
}

const yearOptions = feesManagementYearOptions();

type Props = {
  people: PersonDuesOverview[];
  dueTypes: DueType[];
  year: number;
  dueTypeId: string;
  paidFilter: '' | 'paid' | 'unpaid';
  search: string;
  page: number;
  totalPages: number;
  loading: boolean;
  onYearChange: (y: number) => void;
  onDueTypeChange: (id: string) => void;
  onPaidFilterChange: (v: '' | 'paid' | 'unpaid') => void;
  onSearchChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onRefresh: () => void;
  onAddDue: () => void;
  onShowPreviousDues: () => void;
};

export function ChurchDuesTable({
  people,
  dueTypes,
  year,
  dueTypeId,
  paidFilter,
  search,
  page,
  totalPages,
  loading,
  onYearChange,
  onDueTypeChange,
  onPaidFilterChange,
  onSearchChange,
  onPageChange,
  onRefresh,
  onAddDue,
  onShowPreviousDues,
}: Props) {
  const navigate = useNavigate();
  const [historyPerson, setHistoryPerson] = useState<{ id: string; name: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailLines, setDetailLines] = useState<ExpandDueLine[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const openPay = (due: MemberDue) => {
    navigate(collectPaymentPath(due), {
      state: { due, returnTo: churchMgmtPath('fees'), personName: due.personName },
    });
  };

  const openPayPreviousDues = (row: PersonDuesOverview) => {
    navigate(previousDuesPaymentPath(row.personId), {
      state: {
        returnTo: churchMgmtPath('fees'),
        personName: row.personName,
        familyId: row.familyId,
        familyCode: row.familyCode,
      },
    });
  };

  const filterKey = `${year}|${dueTypeId}|${paidFilter}|${search}|${page}`;

  useEffect(() => {
    setExpandedId(null);
    setDetailLines([]);
  }, [filterKey]);

  const fetchPersonDetail = async (personId: string) => {
    setDetailLoading(true);
    const res = await feesApi.getPersonFeeHistory(personId);
    const dues = res.data?.dues ?? [];
    setDetailLines(buildPersonExpandLines(dues, year));
    setDetailLoading(false);
  };

  const togglePersonDetail = async (personId: string) => {
    if (expandedId === personId) {
      setExpandedId(null);
      setDetailLines([]);
      return;
    }
    setExpandedId(personId);
    await fetchPersonDetail(personId);
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      setDownloadError('');
      await feesApi.downloadDuesExcel({
        year,
        dueTypeId: dueTypeId || undefined,
        paid: paidFilter || undefined,
        search: search || undefined,
      });
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Failed to download Excel');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className={`${ui.card} overflow-hidden`}>
        <div className="space-y-4 border-b border-slate-200 px-5 py-5 dark:border-zinc-700 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className={ui.sectionTitle}>Who still owes</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-zinc-300">
                One line per person for {FEES_SYSTEM_START_YEAR}+ fee rows. Tap the arrow for details.
                Use <strong>Previous dues till {PREVIOUS_DUES_THROUGH_YEAR}</strong> for older balances
                on member profiles.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <ActionHint hint="Download the filtered list as Excel.">
                <button
                  type="button"
                  onClick={() => void handleDownloadExcel()}
                  disabled={downloading}
                  className={ui.btnOutline}
                >
                  <Download className="h-4 w-4" aria-hidden />
                  {downloading ? 'Downloading…' : 'Excel'}
                </button>
              </ActionHint>
              <ActionHint hint="Reload the list.">
                <button
                  type="button"
                  onClick={onRefresh}
                  className={ui.btnOutline}
                  aria-label="Refresh"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </ActionHint>
              <ActionHint hint={`Members with manually recorded balances through ${PREVIOUS_DUES_THROUGH_YEAR}.`}>
                <button type="button" onClick={onShowPreviousDues} className={ui.btnOutline}>
                  Previous dues till {PREVIOUS_DUES_THROUGH_YEAR}
                </button>
              </ActionHint>
              <ActionHint hint="Add harvest, cemetery, or other personal dues (from 2026 onward).">
                <button type="button" onClick={onAddDue} className={ui.btnPrimary}>
                  Add due
                </button>
              </ActionHint>
            </div>
          </div>

          {downloadError ? (
            <p className="text-sm text-red-700 dark:text-red-300">{downloadError}</p>
          ) : null}

          <div className="flex flex-col gap-3">
            <SubmitSearchField
              value={search}
              onSearch={onSearchChange}
              placeholder="Search name, FAM code, or house…"
              className="w-full max-w-lg"
              inputClassName={`${ui.input} h-10`}
              buttonClassName={`${ui.btnOutline} h-10 shrink-0 px-3`}
              aria-label="Search dues"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={year}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className={ui.select}
                aria-label="Filter by calendar year"
                title="Show dues assigned for this calendar year"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
              <select
                value={dueTypeId}
                onChange={(e) => onDueTypeChange(e.target.value)}
                className={ui.select}
                aria-label="Due type"
              >
                <option value="">All types</option>
                {dueTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dueTypeDisplayName(dt)}
                  </option>
                ))}
              </select>
              <select
                value={paidFilter}
                onChange={(e) => onPaidFilterChange(e.target.value as '' | 'paid' | 'unpaid')}
                className={ui.select}
                aria-label="Payment status"
              >
                <option value="">Everyone</option>
                <option value="unpaid">Still due</option>
                <option value="paid">Cleared</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-base text-slate-500">Loading…</p>
          ) : people.length === 0 ? (
            <div className="space-y-2 p-10 text-center text-base text-slate-500">
              {search.trim() ? (
                <>
                  <p>No member or family matching &ldquo;{search.trim()}&rdquo;.</p>
                  <p className="text-sm">
                    Search matches name, family code (FAM001), or house name. For profile-only
                    previous dues, use <strong>Previous dues till {PREVIOUS_DUES_THROUGH_YEAR}</strong>.
                  </p>
                </>
              ) : (
                <>
                  <p>No one with {year} fee rows yet.</p>
                  <p className="text-sm">
                    Open the <strong>Membership</strong> tab → <strong>Apply membership · {year}</strong>,
                    or use <strong>Add due</strong> for harvest / cemetery fees.
                  </p>
                </>
              )}
            </div>
          ) : (
            <table className="min-w-full">
              <thead className={ui.tableHead}>
                <tr>
                  <th className={ui.th} />
                  <th className={ui.th}>Member</th>
                  <th className={ui.th}>Amount due now</th>
                  <th className={ui.th}>Status</th>
                  <th className={`${ui.th} text-right`}> </th>
                </tr>
              </thead>
              <tbody>
                {people.map((row) => {
                  const open = expandedId === row.personId;
                  const dueParts: string[] = [];
                  if (row.membershipOutstanding > 0) {
                    dueParts.push(`Membership ₹${formatCurrency(row.membershipOutstanding)}`);
                  }
                  if (row.otherOutstanding > 0) {
                    dueParts.push(`Other ₹${formatCurrency(row.otherOutstanding)}`);
                  }
                  if (row.hasPreviousDues && (row.previousDuesAmount ?? 0) > 0) {
                    dueParts.push(
                      `Previous ₹${formatCurrency(row.previousDuesAmount ?? 0)}`
                    );
                  }
                  return (
                    <Fragment key={row.personId}>
                      <tr className={ui.row}>
                        <td className={`${ui.td} w-10`}>
                          <button
                            type="button"
                            className="rounded p-1 text-slate-500 hover:bg-slate-100"
                            onClick={() => void togglePersonDetail(row.personId)}
                            aria-label={open ? 'Hide details' : 'Show details'}
                          >
                            {open ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className={ui.td}>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">
                            {row.personName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {row.familyCode}
                            {` · ${membershipSubtext(row, year)}`}
                            {row.nextDueLabel && row.membershipOutstanding > 0
                              ? ` · Next ${row.nextDueLabel}`
                              : ''}
                          </p>
                          {row.hasPreviousDues !== undefined ? (
                            <div className="mt-1.5">
                              <PreviousDuesStatusChip
                                hasPreviousDues={row.hasPreviousDues}
                                amount={row.previousDuesAmount}
                                throughYear={row.previousDuesThroughYear}
                              />
                            </div>
                          ) : null}
                        </td>
                        <td className={ui.td}>
                          {row.totalOutstanding > 0 ? (
                            <div>
                              <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                                ₹{formatCurrency(row.totalOutstanding)}
                              </p>
                              {dueParts.length > 0 ? (
                                <p className="text-xs text-slate-500">{dueParts.join(' · ')}</p>
                              ) : null}
                            </div>
                          ) : row.hasFeeRowsForYear === false ? (
                            <p className="text-sm font-medium text-slate-600">Not applied yet</p>
                          ) : (
                            <p className="text-sm font-medium text-emerald-700">Nothing due</p>
                          )}
                        </td>
                        <td className={ui.td}>
                          {row.hasFeeRowsForYear === false ? (
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                              No fees yet
                            </span>
                          ) : (
                            <PersonDuesStatusBadge status={row.status} />
                          )}
                        </td>
                        <td className={`${ui.td} text-right`}>
                          <div className="flex flex-wrap justify-end gap-2">
                            {row.hasPreviousDues && (row.previousDuesAmount ?? 0) > 0 ? (
                              <button
                                type="button"
                                className={ui.btnPrimary}
                                onClick={() => openPayPreviousDues(row)}
                              >
                                Pay previous
                              </button>
                            ) : null}
                            {row.payDue && row.totalOutstanding > 0 ? (
                              <button
                                type="button"
                                className={row.hasPreviousDues && (row.previousDuesAmount ?? 0) > 0 ? ui.btnOutline : ui.btnPrimary}
                                onClick={() => openPay(row.payDue!)}
                              >
                                Pay {row.hasPreviousDues && (row.previousDuesAmount ?? 0) > 0 ? 'fees' : ''}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className={ui.btnOutline}
                              onClick={() =>
                                setHistoryPerson({ id: row.personId, name: row.personName })
                              }
                            >
                              <History className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                              History
                            </button>
                            <Link
                              to={churchMgmtPath('fees', 'people', row.personId)}
                              state={{
                                personName: row.personName,
                                familyId: row.familyId,
                                familyCode: row.familyCode,
                              }}
                              className={ui.btnOutline}
                            >
                              Open
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {open ? (
                        <tr className="bg-slate-50 dark:bg-zinc-900/40">
                          <td colSpan={5} className="px-6 py-4">
                            {detailLoading ? (
                              <p className="text-sm text-slate-500">Loading details…</p>
                            ) : detailLines.length === 0 ? (
                              <p className="text-sm text-slate-500">No fee entries for {year}.</p>
                            ) : (
                              <ul className="space-y-2">
                                {detailLines.map((line) => (
                                  <li
                                    key={line.key}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
                                  >
                                    <div>
                                      <p className="font-medium text-slate-900 dark:text-white">
                                        {line.title}
                                      </p>
                                      <p className="text-xs text-slate-500">{line.subtitle}</p>
                                      {line.kind === 'membership' ? (
                                        <p className="mt-1 text-xs text-slate-400">
                                          Use <strong>Pay</strong> on the row, or <strong>Open</strong>{' '}
                                          for month-by-month
                                        </p>
                                      ) : null}
                                    </div>
                                    <DueStatusBadge due={line.sampleDue} />
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-3 py-4 sm:px-6 dark:border-zinc-700">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className={ui.btnOutline}
            >
              Previous
            </button>
            <span className="order-first w-full text-center text-sm text-slate-600 sm:order-none sm:w-auto">
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

      {historyPerson ? (
        <MembershipPaymentHistoryModal
          open
          personId={historyPerson.id}
          memberName={historyPerson.name}
          onClose={() => setHistoryPerson(null)}
        />
      ) : null}
    </>
  );
}
