import { Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { familiesApi } from '@/modules/church-management/api';
import type { Family } from '@/modules/church-management/api/types';
import { AddFamilyWithMembersForm } from '@/modules/church-management/components/AddFamilyWithMembersForm';
import { ChurchMgmtPageShell } from '@/modules/church-management/components/ChurchMgmtPageShell';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { FamilyGenerationStatsBar } from '@/modules/church-management/components/FamilyGenerationStatsBar';
import { ChurchAreaSelect } from '@/modules/church-management/components/ChurchAreaSelect';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { SubmitSearchField } from '@/components/SubmitSearchField';
import { ActionHint } from '@/modules/church-management/components/ActionHint';
import { isMemberPhotoPickerOpen } from '@/modules/church-management/components/MemberPhotoField';

export default function FamiliesPage() {
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();
  const navigate = useNavigate();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [generationFilter, setGenerationFilter] = useState<number | ''>('');
  const [areaFilter, setAreaFilter] = useState('');
  const [generationStats, setGenerationStats] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadFamilies(false);
    }
  }, [isAuthenticated, search, page, generationFilter, areaFilter]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !isAuthenticated) return;
      // OS file picker can flip visibility; refreshing then blanks the add form.
      if (isMemberPhotoPickerOpen()) return;
      void loadFamilies(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, search, page, generationFilter, areaFilter]);

  const loadFamilies = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const response = await familiesApi.getFamilies(
        search,
        page,
        limit,
        generationFilter ? Number(generationFilter) : undefined,
        areaFilter || undefined
      );
      if (response.data) {
        // API returns { families: [...], pagination: {...}, generationStats: {...} }
        const familiesData = response.data.families || [];
        const paginationData = response.data.pagination || { page: 1, limit: 20, total: 0, pages: 1 };
        setFamilies(familiesData);
        setTotalPages(paginationData.pages);
        setTotal(paginationData.total);
        if (response.data.generationStats) {
          setGenerationStats(response.data.generationStats.byGeneration || {});
        }
        setError('');
      } else {
        setFamilies([]);
        const errorMsg = response.error || 'Failed to load families';
        setError(errorMsg);
        // Show more detailed error for 500 errors
        if (errorMsg.includes('500') || errorMsg.includes('Internal Server Error')) {
          setError('Backend server error. Please check: 1) Database is running, 2) Prisma client is generated (npm run prisma:generate), 3) Migrations are run (npm run prisma:migrate)');
        }
      }
    } catch (err: any) {
      setFamilies([]);
      const errorMsg = err.message || 'Failed to load families';
      setError(errorMsg);
      console.error('Error loading families:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this family?')) return;

    try {
      const response = await familiesApi.deleteFamily(id);
      if (response.error) {
        setError(response.error);
        return;
      }
      void loadFamilies(true);
    } catch (err) {
      setError('Failed to delete family');
    }
  };

  if ((authLoading || loading) && families.length === 0) {
    return (
      <div className={`${ui.container} py-16 text-center text-base text-slate-500`}>Loading…</div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ChurchMgmtPageShell
      title="Families"
      subtitle="Browse and manage registered families."
      icon={Home}
      actions={
        <ActionHint hint="Register a new family with head of family and members.">
          <button type="button" onClick={() => setShowAddForm(!showAddForm)} className={`${ui.btnPrimary} ${ui.btnHeader}`}>
            {showAddForm ? 'Cancel' : 'Add family'}
          </button>
        </ActionHint>
      }
    >
        {error && <div className={ui.alertError}>{error}</div>}

        <div className="space-y-4">
          <div className={ui.toolbar}>
            <SubmitSearchField
              value={search}
              onSearch={(q) => {
                setSearch(q);
                setPage(1);
              }}
              placeholder="Search families… then press Enter"
              className={`${ui.toolbarField} sm:max-w-md`}
              inputClassName={ui.input}
              buttonClassName={ui.btnOutline}
              aria-label="Search families"
            />
              <select
                value={generationFilter}
                onChange={(e) => {
                  setGenerationFilter(e.target.value ? Number(e.target.value) : '');
                  setPage(1);
                }}
                className={ui.select}
                aria-label="Filter by generation"
              >
                <option value="">All Generations</option>
                <option value="1">Generation 1 (Root)</option>
                <option value="2">Generation 2</option>
                <option value="3">Generation 3</option>
                <option value="4">Generation 4</option>
                <option value="5">Generation 5</option>
                <option value="6">Generation 6+</option>
              </select>
              <ChurchAreaSelect
                value={areaFilter}
                onChange={(area) => {
                  setAreaFilter(area);
                  setPage(1);
                }}
                allowEmpty
                emptyLabel="All areas"
                className={ui.select}
                aria-label="Filter by church area"
              />
          </div>
          {Object.keys(generationStats).length > 0 && !generationFilter && (
            <FamilyGenerationStatsBar
              byGeneration={generationStats}
              onSelectGeneration={(gen) => {
                setGenerationFilter(gen);
                setPage(1);
              }}
            />
          )}
        </div>

        {showAddForm && (
          <AddFamilyWithMembersForm
            onDone={() => setShowAddForm(false)}
            onFamilyCreated={() => void loadFamilies(true)}
            onError={setError}
          />
        )}

        <div className={`${ui.card} ${ui.tableScroll}`}>
          <table className="min-w-[36rem] w-full">
            <thead className={ui.tableHead}>
              <tr>
                <th className={ui.th}>Family code</th>
                <th className={ui.th}>Head of family</th>
                <th className={ui.th}>House name</th>
                <th className={ui.th}>Area</th>
                <th className={ui.th}>House address</th>
                <th className={ui.th}>Members</th>
                <th className={ui.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {families && families.length > 0 ? families.map((family) => {
                const headOfFamily = family.members?.find(m => m.isHeadOfFamily);
                return (
                  <tr key={family.id} className={ui.row}>
                    <td className={`${ui.td} font-semibold text-slate-900 dark:text-white`}>
                      {family.familyCode}
                    </td>
                    <td className={ui.td}>{headOfFamily?.fullName || 'N/A'}</td>
                    <td className={`${ui.td} max-w-[10rem] truncate sm:max-w-[14rem]`} title={family.houseName || undefined}>
                      {family.houseName || '—'}
                    </td>
                    <td className={`${ui.td} max-w-[10rem] truncate sm:max-w-[14rem]`} title={family.area || undefined}>
                      {family.area || '—'}
                    </td>
                    <td className={`${ui.td} max-w-[12rem] truncate sm:max-w-xs`} title={family.address || undefined}>
                      {family.address || '—'}
                    </td>
                    <td className={ui.td}>{family._count?.members || family.members?.length || 0}</td>
                    <td className={ui.td}>
                      <div className={ui.rowActions}>
                        <Link to={churchMgmtPath('families', family.id)} className={ui.link}>
                          View
                        </Link>
                        <button type="button" onClick={() => handleDelete(family.id)} className="text-sm font-medium text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className={`${ui.td} text-center`}>
                    No families found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} families
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className={ui.btnOutline}>
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button type="button" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={ui.btnOutline}>
                Next
              </button>
            </div>
          </div>
        )}

        {families.length === 0 && !loading && (
          <p className="text-center text-slate-500">No families found. Use Add family to get started.</p>
        )}
    </ChurchMgmtPageShell>
  );
}

