import { Plus, Users } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { churchMgmtPath, editMemberPath } from '@/modules/church-management/paths';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { membersApi, familiesApi } from '@/modules/church-management/api';
import type { Member, Family } from '@/modules/church-management/api/types';
import { MembersTable } from '@/modules/church-management/components/MembersTable';
import { AddMemberForm } from '@/modules/church-management/components/AddMemberForm';
import { isMemberPhotoPickerOpen } from '@/modules/church-management/components/MemberPhotoField';
import { ChurchMgmtPageShell } from '@/modules/church-management/components/ChurchMgmtPageShell';
import { ChurchAreaSelect } from '@/modules/church-management/components/ChurchAreaSelect';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { type MembershipDisplayStatus } from '@/modules/church-management/lib/membershipStatusGroups';
import { SubmitSearchField } from '@/components/SubmitSearchField';
import { ActionHint } from '@/modules/church-management/components/ActionHint';
import { MembersBirthYearFilter } from '@/modules/church-management/components/MembersBirthYearFilter';
import { filterMembersByBirthYear } from '@/modules/church-management/lib/memberBirthYearFilter';

const MEMBERSHIP_STATUS_FILTERS: MembershipDisplayStatus[] = [
  'Active',
  'Moved To',
  'Married To',
  'Divorced',
  'Deceased',
];

export default function MembersPage() {
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | MembershipDisplayStatus>('');
  const [areaFilter, setAreaFilter] = useState('');
  const [birthYearFrom, setBirthYearFrom] = useState('');
  const [birthYearTo, setBirthYearTo] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  const displayedMembers = useMemo(
    () => filterMembersByBirthYear(members, birthYearFrom, birthYearTo),
    [members, birthYearFrom, birthYearTo]
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadFamilies();
      void loadMembers(false);
    }
  }, [isAuthenticated, selectedFamilyId, search, statusFilter, areaFilter]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !isAuthenticated) return;
      if (isMemberPhotoPickerOpen()) return;
      void loadMembers(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedFamilyId, search, statusFilter, areaFilter]);

  const loadFamilies = async () => {
    try {
      const all: Family[] = [];
      let page = 1;
      const limit = 100;
      for (;;) {
        const response = await familiesApi.getFamilies(undefined, page, limit);
        if (!response.data) break;
        if (Array.isArray(response.data)) {
          all.push(...response.data);
          break;
        }
        const batch = response.data.families ?? [];
        all.push(...batch);
        const pages = response.data.pagination?.pages ?? 1;
        if (page >= pages) break;
        page += 1;
      }
      setFamilies(all);
    } catch {
      setFamilies([]);
    }
  };

  const loadMembers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await membersApi.getMembers(
        selectedFamilyId || undefined,
        search || undefined,
        statusFilter || undefined,
        areaFilter || undefined
      );
      if (response.data) {
        setMembers(Array.isArray(response.data) ? response.data : []);
        setError('');
      } else {
        setMembers([]);
        setError(response.error || 'Failed to load members');
      }
    } catch {
      setMembers([]);
      setError('Failed to load members');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const response = await membersApi.deleteMember(id);
      if (response.error) {
        setError(response.error);
        return;
      }
      void loadMembers(true);
    } catch {
      setError('Failed to delete member');
    }
  };

  if ((authLoading || loading) && members.length === 0) {
    return (
      <div className={`${ui.container} py-16 text-center text-base text-slate-500`}>Loading…</div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filterSelect = `${ui.select} h-10 w-full sm:w-auto sm:min-w-[9.5rem]`;

  return (
    <ChurchMgmtPageShell
        title="Members"
        subtitle="Filter membership status: Active, Moved To, Married To, Divorced, or Deceased."
        icon={Users}
        actions={
          <ActionHint hint="Add a member to an existing family.">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className={`${ui.btnPrimary} ${ui.btnHeader} inline-flex items-center gap-2`}
            >
              {showAddForm ? (
                'Cancel'
              ) : (
                <>
                  <Plus className="h-4 w-4 shrink-0" aria-hidden />
                  Add Member
                </>
              )}
            </button>
          </ActionHint>
        }
      >
        {error && <div className={ui.alertError}>{error}</div>}

        <div className={ui.toolbar}>
          <SubmitSearchField
            value={search}
            onSearch={setSearch}
            placeholder="Search members…"
            className={`${ui.toolbarField} sm:max-w-md`}
            inputClassName={`${ui.input} h-10`}
            buttonClassName={`${ui.btnOutline} h-10`}
            aria-label="Search members"
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as '' | MembershipDisplayStatus)
            }
            className={filterSelect}
            aria-label="Filter by member status"
          >
            <option value="">All statuses</option>
            {MEMBERSHIP_STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={selectedFamilyId}
            onChange={(e) => setSelectedFamilyId(e.target.value)}
            className={filterSelect}
            aria-label="Filter by family"
          >
            <option value="">All Families</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.familyCode}
              </option>
            ))}
          </select>
          <ChurchAreaSelect
            value={areaFilter}
            onChange={setAreaFilter}
            allowEmpty
            emptyLabel="All areas"
            className={filterSelect}
            aria-label="Filter by church area"
          />
          <MembersBirthYearFilter
            fromYear={birthYearFrom}
            toYear={birthYearTo}
            onFromChange={setBirthYearFrom}
            onToChange={setBirthYearTo}
            selectClassName={filterSelect}
          />
        </div>

        {showAddForm && (
          <AddMemberForm
            families={families}
            onDone={() => setShowAddForm(false)}
            onMemberCreated={() => void loadMembers(true)}
            onError={setError}
          />
        )}

        <MembersTable
          members={displayedMembers}
          onEdit={(member) => {
            navigate(editMemberPath(member.id), {
              state: {
                returnTo: churchMgmtPath('members'),
                familyId: member.familyId || member.family?.id,
                familyCode: member.family?.familyCode,
              },
            });
          }}
          onDelete={handleDelete}
        />

        {displayedMembers.length === 0 && !loading && (
          <p className="text-center text-slate-500">
            {members.length === 0
              ? 'No members found. Use Add Member to get started.'
              : 'No members match the current filters.'}
          </p>
        )}
      </ChurchMgmtPageShell>
  );
}
