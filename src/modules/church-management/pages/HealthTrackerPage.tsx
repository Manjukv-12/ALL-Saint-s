import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import {
  healthTrackerApi,
  type FamilyHealthRow,
  type HealthSegment,
  type HealthTrackerReport,
} from '@/modules/church-management/api/healthTracker';
import {
  healthScoreClass,
  segmentBadgeClass,
  SEGMENT_ACTIONS,
} from '@/modules/church-management/lib/healthSegmentStyles';

const SEGMENTS: (HealthSegment | 'All')[] = [
  'All',
  'Ghosting',
  'At Risk',
  'Fading',
  'Frustrated',
  'Stable',
  'Champion',
];

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export default function HealthTrackerPage() {
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<HealthTrackerReport | null>(null);
  const [filter, setFilter] = useState<HealthSegment | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) void load();
  }, [isAuthenticated, filter]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await healthTrackerApi.getReport(filter === 'All' ? undefined : filter);
      if (res.data) setReport(res.data);
      else setError(res.error || 'Failed to load health tracker');
    } catch {
      setError('Failed to load health tracker');
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => report?.families ?? [], [report]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading family health tracker…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/church-management/dashboard" className="text-sm text-blue-600">
              ← Dashboard
            </Link>
            <h1 className="text-lg font-semibold text-black dark:text-white">Family Health Tracker</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide((v) => !v)}
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
          >
            {showGuide ? 'Hide' : 'Show'} action guide
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Adapted from Practice Health Tracker: each <strong>family</strong> is scored 0–100 from fees,
          members, certificates, and monthly activity (fee/certificate updates). Use this for weekly
          pastoral follow-up.
        </p>

        {report && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Families" value={String(report.totalFamilies)} />
            <SummaryCard label="Avg health" value={String(report.averageHealthScore)} />
            <SummaryCard label="At risk" value={String(report.atRiskCount)} highlight="warn" />
            <SummaryCard label="Champions" value={String(report.segmentCounts.Champion ?? 0)} />
            <SummaryCard label="Ghosting" value={String(report.segmentCounts.Ghosting ?? 0)} highlight="danger" />
          </div>
        )}

        {showGuide && (
          <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 font-semibold text-black dark:text-white">Segment actions (CS / pastoral)</h2>
            <div className="grid gap-2 md:grid-cols-2">
              {SEGMENT_ACTIONS.map((s) => (
                <div key={s.segment} className="rounded border border-zinc-100 p-3 dark:border-zinc-800">
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${segmentBadgeClass(s.segment)}`}>
                    {s.segment}
                  </span>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{s.meaning}</p>
                  <p className="mt-1 text-sm">{s.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {SEGMENTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700'
              }`}
            >
              {s}
              {report && s !== 'All' && (
                <span className="ml-1 opacity-80">
                  ({report.segmentCounts[s as HealthSegment] ?? 0})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <Th>Family</Th>
                <Th>Score</Th>
                <Th>Segment</Th>
                <Th>Members</Th>
                <Th>Fee %</Th>
                <Th>Pay %</Th>
                <Th>Activity (3 mo)</Th>
                <Th>Decline</Th>
                <Th>Consistency</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((row) => (
                <HealthRow key={row.familyId} row={row} />
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="p-8 text-center text-zinc-500">No families match this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'warn' | 'danger';
}) {
  const ring =
    highlight === 'danger'
      ? 'ring-red-200 dark:ring-red-900'
      : highlight === 'warn'
        ? 'ring-amber-200 dark:ring-amber-900'
        : 'ring-zinc-200 dark:ring-zinc-800';
  return (
    <div className={`rounded-lg bg-white p-4 ring-1 ${ring} dark:bg-zinc-900`}>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-bold text-black dark:text-white">{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
      {children}
    </th>
  );
}

function HealthRow({ row }: { row: FamilyHealthRow }) {
  const activity = `${row.activityM1} → ${row.activityM2} → ${row.activityM3}`;
  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
      <td className="whitespace-nowrap px-3 py-2 font-medium">{row.familyCode}</td>
      <td className={`px-3 py-2 ${healthScoreClass(row.healthScore)}`}>{row.healthScore}</td>
      <td className="px-3 py-2">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${segmentBadgeClass(row.segment)}`}>
          {row.segment}
        </span>
      </td>
      <td className="px-3 py-2">
        {row.membersActive}/{row.memberCount}
      </td>
      <td className="px-3 py-2">{pct(row.feeCompletionRate)}</td>
      <td className="px-3 py-2">{pct(row.paymentCollectionRate)}</td>
      <td className="px-3 py-2 text-xs">{activity}</td>
      <td className="px-3 py-2">{pct(row.activityDeclineRate)}</td>
      <td className="px-3 py-2 text-xs">{row.loginConsistency}</td>
      <td className="px-3 py-2">
        <Link
          to={`/admin/church-management/families/${row.familyId}`}
          className="text-blue-600 hover:underline"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
