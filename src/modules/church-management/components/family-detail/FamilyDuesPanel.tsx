import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Family, Member } from '@/modules/church-management/api/types';
import {
  feesApi,
  type DueType,
  type FamilyDuesResponse,
  type MemberDue,
} from '@/modules/church-management/api/fees';
import { ui } from './familyDetailTheme';
import { AddPersonDueForm } from '@/modules/church-management/components/fees/AddPersonDueForm';
import { EditDueModal } from '@/modules/church-management/components/fees/EditDueModal';
import { isActiveMemberStatus } from '@/modules/church-management/lib/membershipType';
import { MemberDuesEntriesTable } from './MemberDuesEntriesTable';
import { MemberDuesSummaryCards } from './MemberDuesSummaryCards';
import { collectPaymentPath } from '@/modules/church-management/lib/collectPaymentPath';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { dueTypeDisplayName } from '@/modules/church-management/lib/dueTypes';
import {
  defaultFeesManagementYear,
  feesManagementYearOptions,
} from '@/modules/church-management/lib/feesYearPolicy';

const yearOptions = feesManagementYearOptions();

export function FamilyDuesPanel({
  family,
  initialPersonId = '',
}: {
  family: Family;
  /** Pre-select this member when opening Fees after a dues-block redirect. */
  initialPersonId?: string;
}) {
  const navigate = useNavigate();
  const [year, setYear] = useState(defaultFeesManagementYear());
  const [dueTypeFilter, setDueTypeFilter] = useState('');
  const [dueTypes, setDueTypes] = useState<DueType[]>([]);
  const [data, setData] = useState<FamilyDuesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDue, setEditDue] = useState<MemberDue | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState(initialPersonId);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const openPay = (due: MemberDue) => {
    navigate(collectPaymentPath(due), {
      state: {
        due,
        returnTo: churchMgmtPath('families', family.id),
        personName: due.personName || due.person?.fullName,
      },
    });
  };

  // Married Away / Deceased stay on the family record — include them so paid dues remain selectable.
  const duesMembers = (family.members ?? []).filter(
    (m) => isActiveMemberStatus(m) || m.status === 'Separated' || m.status === 'Deceased'
  );

  const resolveMember = (id: string, member?: Member | null) =>
    member ?? duesMembers.find((x) => x.id === id) ?? null;

  useEffect(() => {
    if (!initialPersonId) return;
    setSelectedPersonId(initialPersonId);
    setSelectedMember(resolveMember(initialPersonId));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when focus person / members change
  }, [initialPersonId, family.members]);

  const loadDues = async () => {
    try {
      setLoading(true);
      setError('');
      const [typesRes, duesRes] = await Promise.all([
        feesApi.getDueTypes(),
        feesApi.getFamilyDues(family.id, year, dueTypeFilter || undefined),
      ]);
      if (typesRes.data) setDueTypes(typesRes.data);
      if (duesRes.data) setData(duesRes.data);
      else setError(duesRes.error || 'Failed to load dues');
    } catch {
      setError('Failed to load dues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family.id, year, dueTypeFilter, family.members]);

  useEffect(() => {
    if (!selectedPersonId) return;
    const timer = window.setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [selectedPersonId]);

  const dues = data?.dues ?? [];

  const memberDues = useMemo(() => {
    if (!selectedPersonId) return [];
    return dues.filter((d) => d.personId === selectedPersonId);
  }, [dues, selectedPersonId]);

  const feeDetailsPath = selectedPersonId
    ? churchMgmtPath('fees', 'people', selectedPersonId)
    : '';
  const feeDetailsState = selectedMember
    ? {
        personName: selectedMember.fullName,
        familyId: family.id,
        familyCode: family.familyCode,
        returnTo: churchMgmtPath('families', family.id),
      }
    : undefined;

  return (
    <div className="space-y-8">
      <AddPersonDueForm
        dueTypes={dueTypes}
        defaultYear={year}
        defaultPersonId={selectedPersonId || initialPersonId || undefined}
        members={duesMembers}
        existingDues={dues}
        memberFirst
        feeDetailsHref={feeDetailsPath || undefined}
        feeDetailsState={feeDetailsState}
        onPersonChange={(id, member) => {
          if (!id) {
            setSelectedPersonId('');
            setSelectedMember(null);
            return;
          }
          setSelectedPersonId(id);
          setSelectedMember(resolveMember(id, member));
        }}
        onYearChange={setYear}
        onSaved={loadDues}
      />

      {selectedMember && selectedPersonId && (
        <div ref={summaryRef} className="scroll-mt-24 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600 dark:text-zinc-300">
              Showing fee summary for <strong>{selectedMember.fullName}</strong>. Open the full page
              for month tracker and payments.
            </p>
            <Link to={feeDetailsPath} state={feeDetailsState} className={ui.btnPrimary}>
              Fee details
            </Link>
          </div>

          <MemberDuesSummaryCards
            memberName={selectedMember.fullName}
            personId={selectedPersonId}
            year={year}
            dues={dues}
            dueTypes={dueTypes}
            onYearChange={setYear}
            refreshKey={`${year}-${dues.length}-${dues.reduce((s, d) => s + (d.amountPaid || 0), 0)}`}
          />

          <div className={ui.card}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-zinc-700">
              <div className="min-w-0">
                <h2 className={ui.sectionTitle}>
                  Entries for {selectedMember.fullName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  All due and payment entries for this member in the selected year.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={ui.select}
                  aria-label="Calendar year"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={dueTypeFilter}
                  onChange={(e) => setDueTypeFilter(e.target.value)}
                  className={ui.select}
                  aria-label="Due type"
                >
                  <option value="">All due types</option>
                  {dueTypes.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dueTypeDisplayName(dt)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-700">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              {loading ? (
                <p className="p-8 text-center text-base text-slate-500">Loading dues…</p>
              ) : (
                <MemberDuesEntriesTable
                  dues={memberDues}
                  showMember={false}
                  emptyLabel={`No entries for this member in ${year}. Use the form above to add one.`}
                  onEdit={setEditDue}
                  onRecordPayment={openPay}
                  onRemoved={() => void loadDues()}
                  onRemoveError={setError}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedPersonId && (
        <div className={`${ui.card} px-6 py-8`}>
          <h2 className={ui.sectionTitle}>Membership dues</h2>
          <p className="mt-2 text-sm text-slate-500">
            Select a member above to see their summary and entry details, or open{' '}
            <strong>Fee details</strong> from the Members tab.
          </p>
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      <EditDueModal
        due={editDue}
        onClose={() => setEditDue(null)}
        onSaved={() => {
          setEditDue(null);
          void loadDues();
        }}
      />
    </div>
  );
}
