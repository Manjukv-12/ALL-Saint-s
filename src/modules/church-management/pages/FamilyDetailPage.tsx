import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { familiesApi } from '@/modules/church-management/api';
import { personsApi } from '@/modules/church-management/api/persons';
import type { Family, Member } from '@/modules/church-management/api/types';
import { SplitFamilyModal } from '@/modules/church-management/components/SplitFamilyModal';
import { MarriageModal, type MarriageFormData } from '@/modules/church-management/components/MarriageModal';
import { DeathModal } from '@/modules/church-management/components/DeathModal';
import { AddMemberForm } from '@/modules/church-management/components/AddMemberForm';
import { isMemberPhotoPickerOpen } from '@/modules/church-management/components/MemberPhotoField';
import { FamilyLineageSection } from '@/modules/church-management/components/FamilyLineageSection';
import { FamilyDetailHeader } from '@/modules/church-management/components/family-detail/FamilyDetailHeader';
import {
  EditFamilyDetailsForm,
  type FamilyDetailsDraft,
} from '@/modules/church-management/components/family-detail/EditFamilyDetailsForm';
import {
  FamilyDetailTabs,
  type FamilyDetailTab,
} from '@/modules/church-management/components/family-detail/FamilyDetailTabs';
import { FamilyMembersTable } from '@/modules/church-management/components/family-detail/FamilyMembersTable';
import { FamilyDuesPanel } from '@/modules/church-management/components/family-detail/FamilyDuesPanel';
import { SetHeadOfFamilyConfirmModal } from '@/modules/church-management/components/family-detail/SetHeadOfFamilyConfirmModal';
import {
  partitionFamilyMembers,
  isAssociateFamily,
  membershipToPayload,
  countActiveFamilyMembers,
  countAllFamilyMembers,
  type MembershipFields,
} from '@/modules/church-management/lib/membershipType';
import { isFamilyInactive, deathSuccessionNeedsManualHof } from '@/modules/church-management/lib/familyStatus';
import {
  DEATH_INACTIVE_FAMILY_ALERT,
  ManualHofRequiredAlert,
} from '@/modules/church-management/components/family-detail/ManualHofRequiredAlert';
import { findDuplicateSpouseRoles } from '@/modules/church-management/lib/familyRoleValidation';
import { headRoleMismatchReason } from '@/modules/church-management/lib/familyRoles';
import { churchMgmtPath, editMemberPath } from '@/modules/church-management/paths';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';

export default function FamilyDetailsPage() {
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const familyId = params?.id as string;

  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<FamilyDetailTab>('members');
  const [feesFocusPersonId, setFeesFocusPersonId] = useState('');
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [marriageModalOpen, setMarriageModalOpen] = useState(false);
  const [deathModalOpen, setDeathModalOpen] = useState(false);
  const [successionNotice, setSuccessionNotice] = useState('');
  const [manualHofNotice, setManualHofNotice] = useState('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showEditFamilyDetails, setShowEditFamilyDetails] = useState(false);
  const [familyDetailsSaving, setFamilyDetailsSaving] = useState(false);
  const [addMemberError, setAddMemberError] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [hofConfirmOpen, setHofConfirmOpen] = useState(false);
  const [pendingHofMember, setPendingHofMember] = useState<Member | null>(null);
  const [hofConfirmLoading, setHofConfirmLoading] = useState(false);
  const [areaSaving, setAreaSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated && familyId) {
      setFamily(null);
      void loadFamily(false);
    }
  }, [isAuthenticated, familyId]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !isAuthenticated || !familyId) return;
      if (isMemberPhotoPickerOpen()) return;
      void loadFamily(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // loadFamily reads latest familyId from closure each render registration
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on tab focus only
  }, [isAuthenticated, familyId]);

  useEffect(() => {
    const state = location.state as { openFeesTab?: boolean; focusPersonId?: string } | null;
    if (!state?.openFeesTab) return;
    if (state.focusPersonId) setFeesFocusPersonId(state.focusPersonId);
    setActiveTab('fees');
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const state = location.state as { openLineageTab?: boolean } | null;
    if (state?.openLineageTab) {
      setActiveTab('lineage');
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (activeTab === 'lineage' && isAuthenticated && familyId) {
      void loadFamily(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh tree when opening Lineage tab
  }, [activeTab, isAuthenticated, familyId]);

  /** silent=true keeps the page mounted so Moved To / edit / death updates show immediately. */
  const loadFamily = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      if (!silent) setError('');
      const response = await familiesApi.getFamily(familyId);
      if (response.data) {
        setFamily(response.data);
        if (silent) setError('');
        if (!isFamilyInactive(response.data)) {
          setManualHofNotice('');
        }
      } else {
        setError(response.error || 'Failed to load family details');
      }
    } catch {
      setError('Failed to load family details');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAreaChange = async (area: string) => {
    if (!family) return;
    const current = (family.area || '').trim();
    if (area === current) return;

    // First assignment is one-click; changing an existing area needs confirmation.
    if (current) {
      const message = area
        ? `This family is already in "${current}".\n\nChange area to "${area}"?`
        : `Remove area "${current}" from this family?`;
      if (!window.confirm(message)) return;
    }

    setAreaSaving(true);
    setError('');
    try {
      const response = await familiesApi.updateFamily(family.id, { area });
      if (response.error || !response.data) {
        setError(response.error || 'Failed to update area');
        return;
      }
      setFamily(response.data);
    } catch {
      setError('Failed to update area');
    } finally {
      setAreaSaving(false);
    }
  };

  const handleSaveFamilyDetails = async (draft: FamilyDetailsDraft) => {
    if (!family) return;
    setFamilyDetailsSaving(true);
    setError('');
    try {
      const response = await familiesApi.updateFamily(family.id, {
        houseName: draft.houseName,
        address: draft.address,
        area: draft.area,
        tombBooked: draft.tombBooked,
      });
      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to update family details');
      }
      setFamily(response.data);
      setShowEditFamilyDetails(false);
    } finally {
      setFamilyDetailsSaving(false);
    }
  };

  const goCompleteDuesForSelected = () => {
    if (!selectedMember) return;
    navigate(churchMgmtPath('fees', 'people', selectedMember.id), {
      state: {
        payAllClearance: true,
        returnTo: churchMgmtPath('families', familyId),
        personName: selectedMember.fullName,
        familyId,
        familyCode: family?.familyCode,
      },
    });
  };

  const handleSplitFamily = (member: Member) => {
    setSelectedMember(member);
    setSplitModalOpen(true);
  };

  const handleSplitSubmit = async (
    newFamilyCode: string | null,
    newAddress?: string,
    autoGenerate?: boolean,
    notes?: string,
    membership?: MembershipFields
  ) => {
    if (!selectedMember || !notes?.trim()) {
      throw new Error('Notes are required');
    }

    const response = await familiesApi.splitFamily(familyId, {
      newFamilyCode: newFamilyCode || undefined,
      newHeadOfFamilyId: selectedMember.id,
      newAddress,
      autoGenerateCode: autoGenerate || false,
      notes: notes.trim(),
      ...(membership ? membershipToPayload(membership) : {}),
    });

    if (response.error) {
      throw new Error(response.error);
    }

    const movedName = selectedMember.fullName;
    const newCode = response.data?.newFamily?.familyCode;
    await loadFamily(true);
    setActiveTab('members');
    setSuccessionNotice(
      newCode
        ? `${movedName} moved to new family ${newCode}. This list is updated.`
        : `${movedName} moved to a new family. This list is updated.`
    );
  };

  const handleMarkMarried = (member: Member) => {
    setSelectedMember(member);
    setMarriageModalOpen(true);
  };

  const handleMarriageSubmit = async (data: MarriageFormData) => {
    if (!selectedMember) return;

    const response = await familiesApi.markDaughterMarried(familyId, selectedMember.id, data);

    if (response.error) {
      throw new Error(response.error);
    }

    await loadFamily(true);
  };

  const handleMarkDeceased = (member: Member) => {
    setSelectedMember(member);
    setDeathModalOpen(true);
  };

  const handleSetHeadOfFamily = (member: Member) => {
    if (member.isHeadOfFamily) return;
    setPendingHofMember(member);
    setHofConfirmOpen(true);
  };

  const handleCancelHofChange = () => {
    if (hofConfirmLoading) return;
    setHofConfirmOpen(false);
    setPendingHofMember(null);
  };

  const handleConfirmHofChange = async () => {
    if (!pendingHofMember) return;

    try {
      setHofConfirmLoading(true);
      setError('');

      const response = await familiesApi.setHeadOfFamily(familyId, pendingHofMember.id);
      if (response.error) {
        throw new Error(response.error);
      }
      if (response.data?.message) {
        setSuccessionNotice(response.data.message);
      }
      setManualHofNotice('');
      await loadFamily(true);
      handleCancelHofChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change head of family');
    } finally {
      setHofConfirmLoading(false);
    }
  };

  const handleDeathSubmit = async (notes: string, eventDate?: string, successorId?: string) => {
    if (!selectedMember) return;

    const response = await personsApi.markDeceased(selectedMember.id, {
      notes,
      eventDate,
      successorId,
    });
    if (response.error) {
      throw new Error(response.error);
    }

    const succession = response.data?.deathSuccession;
    if (deathSuccessionNeedsManualHof(succession)) {
      setManualHofNotice(succession?.message ?? DEATH_INACTIVE_FAMILY_ALERT);
      setSuccessionNotice('');
    } else if (succession?.applied) {
      setSuccessionNotice(succession.message);
      setManualHofNotice('');
    }

    await loadFamily(true);
  };

  const handleEditMember = (member: Member) => {
    navigate(editMemberPath(member.id), {
      state: {
        returnTo: churchMgmtPath('families', familyId),
        familyId,
        familyCode: family?.familyCode,
      },
    });
  };

  if ((authLoading || loading) && !family) {
    return (
      <div className={`${ui.container} py-16 text-center text-base text-slate-500`}>
        Loading family…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!family) {
    return (
      <div className={ui.container}>
        <div className={ui.alertError}>{error || 'Family not found'}</div>
        <button type="button" onClick={() => navigate('/admin/church-management/families')} className={`${ui.btnPrimary} mt-4`}>
          Back to families
        </button>
      </div>
    );
  }

  const membershipGroups = partitionFamilyMembers(family.members);
  const { headOfFamily, fullCount, associateCount } = membershipGroups;
  const totalMemberCount =
    family._count?.members ?? countAllFamilyMembers(family.members);
  const activeMemberCount =
    family._count?.activeMembers ?? countActiveFamilyMembers(family.members);
  const familyInactive = isFamilyInactive(family);
  const duplicateSpouseRoles = findDuplicateSpouseRoles(family.members ?? []);
  const headRoleMismatch = headOfFamily ? headRoleMismatchReason(headOfFamily) : null;

  return (
    <div className="w-full min-w-0">
      <FamilyDetailHeader
        family={family}
        headOfFamily={headOfFamily}
        fullMemberCount={fullCount}
        associateMemberCount={associateCount}
        totalMemberCount={totalMemberCount}
        activeMemberCount={activeMemberCount}
        addMemberOpen={showAddMemberForm}
        onAddMember={() => {
          setShowAddMemberForm((o) => !o);
          setShowEditFamilyDetails(false);
          setAddMemberError('');
          setActiveTab('members');
        }}
        editDetailsOpen={showEditFamilyDetails}
        onEditDetails={() => {
          setShowEditFamilyDetails((o) => !o);
          setShowAddMemberForm(false);
          setAddMemberError('');
        }}
        onBack={() => navigate('/admin/church-management/families')}
        onAreaChange={handleAreaChange}
        areaSaving={areaSaving}
      />

      <FamilyDetailTabs
        active={activeTab}
        onChange={setActiveTab}
        totalMemberCount={totalMemberCount}
        activeMemberCount={activeMemberCount}
      />

      <div className={`${ui.containerWide} space-y-6`}>
        {showEditFamilyDetails && (
          <EditFamilyDetailsForm
            family={family}
            open={showEditFamilyDetails}
            saving={familyDetailsSaving}
            onCancel={() => setShowEditFamilyDetails(false)}
            onSave={handleSaveFamilyDetails}
          />
        )}
        {error && (
          <div className={ui.alertError} role="alert">
            {error}
          </div>
        )}
        {manualHofNotice && <ManualHofRequiredAlert message={manualHofNotice} />}
        {successionNotice && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 text-base text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100">
            {successionNotice}
          </div>
        )}
        {headRoleMismatch && (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-base text-amber-950 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100"
            role="alert"
          >
            <p className="font-medium">Waiting for spouse</p>
            <p className="mt-1">{headRoleMismatch}</p>
          </div>
        )}
        {duplicateSpouseRoles.length > 0 && (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-base text-amber-950 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100"
            role="alert"
          >
            <p className="font-medium">Duplicate spouse roles in this family</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {duplicateSpouseRoles.map(({ role, names }) => (
                <li key={role}>
                  More than one {role}: {names.join(', ')}. Edit a member&apos;s role so only one{' '}
                  {role} remains.
                </li>
              ))}
            </ul>
          </div>
        )}

        {showAddMemberForm && !familyInactive && (
          <div className={ui.card}>
            <div className={ui.sectionHead}>
              <h2 className={ui.sectionTitle}>Add a new member</h2>
            </div>
            <div className={ui.sectionBody}>
              {addMemberError && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-700">
                  {addMemberError}
                </div>
              )}
              <AddMemberForm
                fixedFamily={family}
                embedded
                onDone={() => {
                  setShowAddMemberForm(false);
                  setAddMemberError('');
                }}
                onMemberCreated={() => {
                  setAddMemberError('');
                  void loadFamily(true);
                }}
                onError={setAddMemberError}
              />
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <FamilyMembersTable
            groups={membershipGroups}
            headOfFamilyId={family.headOfFamilyId ?? headOfFamily?.id}
            familyId={family.id}
            familyCode={family.familyCode}
            familyInactive={familyInactive}
            formerMembers={family.formerMembers ?? []}
            currentMembers={family.members}
            onSetHeadOfFamily={handleSetHeadOfFamily}
            onEdit={handleEditMember}
            onSplit={handleSplitFamily}
            onMarkDeceased={handleMarkDeceased}
          />
        )}

        {activeTab === 'fees' && (
          <FamilyDuesPanel family={family} initialPersonId={feesFocusPersonId} />
        )}

        {activeTab === 'lineage' && <FamilyLineageSection family={family} />}
      </div>

      <SplitFamilyModal
        isOpen={splitModalOpen}
        onClose={() => {
          setSplitModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        familyId={familyId}
        parentFamilyCode={family.familyCode}
        parentIsAssociateFamily={isAssociateFamily(family)}
        onSubmit={handleSplitSubmit}
        onGoCompleteDues={goCompleteDuesForSelected}
      />

      <MarriageModal
        isOpen={marriageModalOpen}
        onClose={() => {
          setMarriageModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        currentFamilyId={familyId}
        onSubmit={handleMarriageSubmit}
        onGoCompleteDues={goCompleteDuesForSelected}
      />

      <DeathModal
        isOpen={deathModalOpen}
        onClose={() => {
          setDeathModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        isHeadOfFamily={
          !!selectedMember?.isHeadOfFamily ||
          selectedMember?.id === (family.headOfFamilyId ?? headOfFamily?.id)
        }
        familyMembers={family.members ?? []}
        onSubmit={handleDeathSubmit}
      />

      <SetHeadOfFamilyConfirmModal
        open={hofConfirmOpen}
        member={pendingHofMember}
        currentHead={headOfFamily}
        familyCode={family.familyCode}
        reactivatingInactiveFamily={familyInactive}
        loading={hofConfirmLoading}
        onConfirm={handleConfirmHofChange}
        onCancel={handleCancelHofChange}
      />
    </div>
  );
}
