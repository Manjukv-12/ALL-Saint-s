import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, List, Settings2, Users } from 'lucide-react';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import {
  feesApi,
  type DueType,
  type DuesListResponse,
  type PersonDuesOverview,
} from '@/modules/church-management/api/fees';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { ChurchMgmtPageShell } from '@/modules/church-management/components/ChurchMgmtPageShell';
import { FeesSummaryCards } from '@/modules/church-management/components/fees/FeesSummaryCards';
import { ChurchDuesTable } from '@/modules/church-management/components/fees/ChurchDuesTable';
import { DueTypesPanel } from '@/modules/church-management/components/fees/DueTypesPanel';
import { AddPersonDueModal } from '@/modules/church-management/components/fees/AddPersonDueModal';
import { ApplyMembershipPanel } from '@/modules/church-management/components/fees/ApplyMembershipPanel';
import { PreviousDuesTable } from '@/modules/church-management/components/fees/PreviousDuesTable';
import { FeesYearSplitNotice } from '@/modules/church-management/components/fees/FeesYearSplitNotice';
import {
  defaultFeesManagementYear,
  PREVIOUS_DUES_THROUGH_YEAR,
} from '@/modules/church-management/lib/feesYearPolicy';
import type { PreviousDuesMemberRow } from '@/modules/church-management/api/fees';

type Tab = 'dues' | 'membership' | 'types';

export default function FeesPage() {
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('dues');
  const [year, setYear] = useState(defaultFeesManagementYear());
  const [showPreviousDues, setShowPreviousDues] = useState(false);
  const [previousPeople, setPreviousPeople] = useState<PreviousDuesMemberRow[]>([]);
  const [previousTotalAmount, setPreviousTotalAmount] = useState(0);
  const [previousSearch, setPreviousSearch] = useState('');
  const [previousPage, setPreviousPage] = useState(1);
  const [previousTotalPages, setPreviousTotalPages] = useState(1);
  const [previousLoading, setPreviousLoading] = useState(false);
  const [dueTypeId, setDueTypeId] = useState('');
  const [paidFilter, setPaidFilter] = useState<'' | 'paid' | 'unpaid'>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dueTypes, setDueTypes] = useState<DueType[]>([]);
  const [summary, setSummary] = useState<DuesListResponse | null>(null);
  const [people, setPeople] = useState<PersonDuesOverview[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [migrationError, setMigrationError] = useState('');
  const [addDueOpen, setAddDueOpen] = useState(false);

  const subscription = dueTypes.find((d) => d.code === 'SUBSCRIPTION');
  const subscriptionTypeId = subscription?.id ?? '';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadDueTypes = async () => {
    const res = await feesApi.getDueTypes({ all: true });
    if (res.data) setDueTypes(res.data);
  };

  const loadPreviousDues = async (silent = false) => {
    try {
      if (!silent) setPreviousLoading(true);
      setMigrationError('');
      const res = await feesApi.listPreviousDues({
        search: previousSearch || undefined,
        page: previousPage,
        limit: 50,
      });
      if (res.error) {
        if (res.error.includes('migration') || res.error.includes('503')) {
          setMigrationError(
            'Database migration required. Run backend-php/sql/church-management-previous-dues-migration.sql on your MySQL database, then refresh.'
          );
        } else {
          setMigrationError(res.error);
        }
        setPreviousPeople([]);
        setPreviousTotalAmount(0);
        return;
      }
      if (res.data) {
        setPreviousPeople(res.data.people ?? []);
        setPreviousTotalAmount(res.data.totalAmount ?? 0);
        setPreviousTotalPages(res.data.pagination.pages);
      }
    } catch {
      setMigrationError('Failed to load previous dues');
    } finally {
      if (!silent) setPreviousLoading(false);
    }
  };

  const loadDues = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setMigrationError('');
      const res = await feesApi.listAllDues({
        year,
        dueTypeId: dueTypeId || undefined,
        paid: paidFilter || undefined,
        search: search || undefined,
        page,
        limit: 50,
        view: 'person',
      });
      if (res.error) {
        if (res.error.includes('migration') || res.error.includes('503')) {
          setMigrationError(
            'Database migration required. Run backend-php/sql/church-management-dues-migration.sql on your MySQL database, then refresh this page.'
          );
        } else {
          setMigrationError(res.error);
        }
        setPeople([]);
        setSummary(null);
        return;
      }
      if (res.data) {
        setSummary(res.data);
        setPeople(res.data.people ?? []);
        setTotalPages(res.data.pagination.pages);
      }
    } catch {
      setMigrationError('Failed to load dues');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDueTypes();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !showPreviousDues) {
      void loadDues(false);
    }
  }, [isAuthenticated, year, dueTypeId, paidFilter, search, page, showPreviousDues]);

  useEffect(() => {
    if (isAuthenticated && showPreviousDues) {
      void loadPreviousDues(false);
    }
  }, [isAuthenticated, showPreviousDues, previousSearch, previousPage]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        void loadDues(true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, year, dueTypeId, paidFilter, search, page]);

  const afterRateApplied = () => {
    if (subscriptionTypeId) setDueTypeId(subscriptionTypeId);
    setPage(1);
    void loadDues(true);
  };

  if ((authLoading || loading) && people.length === 0 && !summary && activeTab === 'dues') {
    return (
      <div className={`${ui.container} py-16 text-center text-base text-slate-500`}>Loading…</div>
    );
  }

  if (!isAuthenticated) return null;

  const pageSubtitle =
    activeTab === 'types'
      ? 'Set default amounts for membership and other due types.'
      : activeTab === 'membership'
        ? 'Set the yearly rate, then apply it to every eligible member.'
        : `Fee rows from ${PREVIOUS_DUES_THROUGH_YEAR + 1} onward — older balances live on each member profile.`;

  return (
    <ChurchMgmtPageShell title="Fees & dues" subtitle={pageSubtitle} icon={IndianRupee}>
      <div className={ui.tabRow}>
        <button
          type="button"
          onClick={() => setActiveTab('dues')}
          className={activeTab === 'dues' ? ui.tabActive : ui.tabIdle}
        >
          <List className={`h-4 w-4 ${activeTab === 'dues' ? ui.tabIconActive : ui.tabIconIdle}`} aria-hidden />
          All dues
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('membership')}
          className={activeTab === 'membership' ? ui.tabActive : ui.tabIdle}
        >
          <Users
            className={`h-4 w-4 ${activeTab === 'membership' ? ui.tabIconActive : ui.tabIconIdle}`}
            aria-hidden
          />
          Membership
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('types')}
          className={activeTab === 'types' ? ui.tabActive : ui.tabIdle}
        >
          <Settings2 className={`h-4 w-4 ${activeTab === 'types' ? ui.tabIconActive : ui.tabIconIdle}`} aria-hidden />
          Due types
        </button>
      </div>

      {migrationError && <div className={ui.alertInfo}>{migrationError}</div>}

      {activeTab === 'dues' && showPreviousDues && (
        <PreviousDuesTable
          people={previousPeople}
          totalAmount={previousTotalAmount}
          search={previousSearch}
          page={previousPage}
          totalPages={previousTotalPages}
          loading={previousLoading}
          onSearchChange={(v) => {
            setPreviousPage(1);
            setPreviousSearch(v);
          }}
          onPageChange={setPreviousPage}
          onRefresh={() => void loadPreviousDues(true)}
          onBackToCurrentDues={() => {
            setShowPreviousDues(false);
            setMigrationError('');
          }}
        />
      )}

      {activeTab === 'dues' && !showPreviousDues && (
        <>
          <FeesYearSplitNotice className="mb-5" />
          <FeesSummaryCards summary={summary} />
          <ChurchDuesTable
            people={people}
            dueTypes={dueTypes}
            year={year}
            dueTypeId={dueTypeId}
            paidFilter={paidFilter}
            search={search}
            page={page}
            totalPages={totalPages}
            loading={loading}
            onYearChange={(y) => {
              setPage(1);
              setYear(y);
            }}
            onDueTypeChange={(id) => {
              setPage(1);
              setDueTypeId(id);
            }}
            onPaidFilterChange={(v) => {
              setPage(1);
              setPaidFilter(v);
            }}
            onSearchChange={(v) => {
              setPage(1);
              setSearch(v);
            }}
            onPageChange={setPage}
            onRefresh={() => void loadDues(true)}
            onAddDue={() => setAddDueOpen(true)}
            onShowPreviousDues={() => {
              setMigrationError('');
              setShowPreviousDues(true);
            }}
          />
          <AddPersonDueModal
            open={addDueOpen}
            dueTypes={dueTypes}
            defaultYear={year}
            churchWide
            onClose={() => setAddDueOpen(false)}
            onYearChange={(y) => {
              setPage(1);
              setYear(y);
            }}
            onSaved={() => void loadDues(true)}
          />
        </>
      )}

      {activeTab === 'membership' && (
        <>
          <FeesYearSplitNotice className="mb-5" />
          <ApplyMembershipPanel
            subscription={subscription}
            onApplied={afterRateApplied}
            onRateSaved={() => {
              void loadDueTypes();
              void loadDues(true);
            }}
          />
        </>
      )}

      {activeTab === 'types' && (
        <DueTypesPanel
          dueTypes={dueTypes}
          onChanged={loadDueTypes}
          onRateApplied={afterRateApplied}
          onGoApplyMembership={() => setActiveTab('membership')}
        />
      )}
    </ChurchMgmtPageShell>
  );
}
