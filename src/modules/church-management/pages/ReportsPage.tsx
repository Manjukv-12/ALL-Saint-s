import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Cake, CalendarHeart, FileSpreadsheet } from 'lucide-react';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import {
  reportsApi,
  type AnniversaryReportItem,
  type BirthdayReportItem,
  type ReportKind,
} from '@/modules/church-management/api/reports';
import { ChurchMgmtPageShell } from '@/modules/church-management/components/ChurchMgmtPageShell';
import { ReportMonthFilterBar } from '@/modules/church-management/components/reports/ReportMonthFilterBar';
import { BirthdayReportTable } from '@/modules/church-management/components/reports/BirthdayReportTable';
import { AnniversaryReportTable } from '@/modules/church-management/components/reports/AnniversaryReportTable';
import { reportMonthName } from '@/modules/church-management/lib/reportMonths';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

function tabFromSearch(value: string | null): ReportKind {
  return value === 'anniversaries' ? 'anniversaries' : 'birthdays';
}

export default function ReportsPage() {
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = tabFromSearch(searchParams.get('tab'));
  const setTab = (next: ReportKind) => {
    setSearchParams({ tab: next }, { replace: true });
  };

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [birthdays, setBirthdays] = useState<BirthdayReportItem[]>([]);
  const [anniversaries, setAnniversaries] = useState<AnniversaryReportItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'birthdays' }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        if (tab === 'birthdays') {
          const res = await reportsApi.getBirthdays(month, year);
          if (cancelled) return;
          if (res.error) {
            setError(res.error);
            setBirthdays([]);
            setCount(0);
            return;
          }
          setBirthdays(res.data?.items ?? []);
          setCount(res.data?.count ?? 0);
        } else {
          const res = await reportsApi.getAnniversaries(month, year);
          if (cancelled) return;
          if (res.error) {
            setError(res.error);
            setAnniversaries([]);
            setCount(0);
            return;
          }
          setAnniversaries(res.data?.items ?? []);
          setCount(res.data?.count ?? 0);
        }
      } catch {
        if (!cancelled) setError('Failed to load report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, tab, month, year]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError('');
      if (tab === 'birthdays') {
        await reportsApi.downloadBirthdaysExcel(month, year);
      } else {
        await reportsApi.downloadAnniversariesExcel(month, year);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download Excel');
    } finally {
      setDownloading(false);
    }
  };

  if (authLoading) {
    return (
      <div className={`${ui.container} py-16 text-center text-base text-slate-500`}>Loading…</div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <ChurchMgmtPageShell
      title="Reports"
      subtitle={
        tab === 'birthdays'
          ? 'Monthly birthdays — view and download as Excel.'
          : 'Monthly wedding anniversaries — view and download as Excel.'
      }
      icon={FileSpreadsheet}
    >
      <div className={ui.tabRow}>
        <button
          type="button"
          onClick={() => setTab('birthdays')}
          className={tab === 'birthdays' ? ui.tabActive : ui.tabIdle}
        >
          <Cake
            className={`h-4 w-4 ${tab === 'birthdays' ? ui.tabIconActive : ui.tabIconIdle}`}
            aria-hidden
          />
          Birthdays
        </button>
        <button
          type="button"
          onClick={() => setTab('anniversaries')}
          className={tab === 'anniversaries' ? ui.tabActive : ui.tabIdle}
        >
          <CalendarHeart
            className={`h-4 w-4 ${tab === 'anniversaries' ? ui.tabIconActive : ui.tabIconIdle}`}
            aria-hidden
          />
          Wedding anniversaries
        </button>
      </div>

      {error ? <div className={ui.alertError}>{error}</div> : null}

      <ReportMonthFilterBar
        month={month}
        year={year}
        count={count}
        downloading={downloading}
        onMonthChange={setMonth}
        onYearChange={setYear}
        onDownload={() => void handleDownload()}
      />

      {tab === 'birthdays' ? (
        <BirthdayReportTable
          items={birthdays}
          loading={loading}
          monthName={reportMonthName(month)}
        />
      ) : (
        <AnniversaryReportTable
          items={anniversaries}
          loading={loading}
          monthName={reportMonthName(month)}
        />
      )}
    </ChurchMgmtPageShell>
  );
}
