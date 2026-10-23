import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { ChurchMgmtPageShell } from '@/modules/church-management/components/ChurchMgmtPageShell';
import { FormActionBar } from '@/modules/church-management/components/edit-member/FormActionBar';
import {
  EditMemberFormBody,
  emptyMemberPhotoSelection,
} from '@/modules/church-management/components/edit-member/EditMemberFormBody';
import { SetHeadOfFamilyConfirmModal } from '@/modules/church-management/components/family-detail/SetHeadOfFamilyConfirmModal';
import { familiesApi, membersApi } from '@/modules/church-management/api';
import type { Family, Member } from '@/modules/church-management/api/types';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import {
  DEFAULT_MEMBERSHIP,
  membershipFromMember,
  membershipToPayload,
} from '@/modules/church-management/lib/membershipType';
import { normalizeRoleValue } from '@/modules/church-management/lib/familyRoles';
import {
  normalizeMemberStatus,
  shouldShowWeddingDateField,
  statusRequiresSpouse,
  type MemberStatus,
} from '@/modules/church-management/lib/memberStatus';
import { sanitizePhoneDigits } from '@/modules/church-management/lib/phoneInput';
import {
  checkPersonOutstandingDues,
  formatOutstandingSummary,
  requiresDuesClearanceForStatusChange,
} from '@/modules/church-management/lib/personOutstandingDues';
import type { EditMemberSubmitData } from '@/modules/church-management/lib/editMemberSubmitData';
import {
  firstEditMemberFieldError,
  validateEditMemberForm,
  type EditMemberFieldErrors,
  type EditMemberFormValues,
} from '@/modules/church-management/lib/editMemberValidation';
import { focusFirstInvalidField } from '@/modules/church-management/lib/formFieldFocus';
import {
  EMPTY_PREVIOUS_DUES,
  previousDuesFromMember,
  previousDuesToPayload,
} from '@/modules/church-management/lib/previousDues';
import {
  memberProfileExtraFromMember,
  memberProfileExtraToPayload,
} from '@/modules/church-management/lib/birthYearRange';
import { isFamilyInactive } from '@/modules/church-management/lib/familyStatus';
import type { MemberPhotoSelection } from '@/modules/church-management/components/MemberPhotoField';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';

type NavState = {
  returnTo?: string;
  familyId?: string;
  familyCode?: string;
};

function memberToFormValues(member: Member): EditMemberFormValues {
  const status = normalizeMemberStatus(member.status);
  return {
    fullName: member.fullName || '',
    gender: (member.gender as 'MALE' | 'FEMALE') || '',
    relationship: normalizeRoleValue(member.relationship || member.relationshipToHOF),
    phone: sanitizePhoneDigits(member.contactNumber || ''),
    occupation: member.occupation || '',
    qualification: member.qualification || '',
    bloodGroup: member.bloodGroup || '',
    dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
    dateOfWedding: member.dateOfWedding ? member.dateOfWedding.split('T')[0] : '',
    dateOfBaptism: member.dateOfBaptism ? member.dateOfBaptism.split('T')[0] : '',
    dateOfConfirmation: member.dateOfConfirmation ? member.dateOfConfirmation.split('T')[0] : '',
    status,
    statusNotes: member.statusNotes || '',
    spouseName: member.spouseName || '',
    isHeadOfFamily: !!member.isHeadOfFamily,
    ...membershipFromMember(member),
    ...previousDuesFromMember(member),
    ...memberProfileExtraFromMember(member),
  };
}

export default function EditMemberPage() {
  const { id: memberId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as NavState | null) ?? {};
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();

  const [member, setMember] = useState<Member | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState<EditMemberFormValues>({
    fullName: '',
    gender: '',
    relationship: '',
    phone: '',
    occupation: '',
    qualification: '',
    bloodGroup: '',
    dateOfBirth: '',
    birthYearFrom: '',
    birthYearTo: '',
    dateOfWedding: '',
    dateOfBaptism: '',
    dateOfConfirmation: '',
    status: 'Active',
    statusNotes: '',
    spouseName: '',
    isHeadOfFamily: false,
    ...DEFAULT_MEMBERSHIP,
    ...EMPTY_PREVIOUS_DUES,
  });
  const [originalStatus, setOriginalStatus] = useState<MemberStatus>('Active');
  const [fieldErrors, setFieldErrors] = useState<EditMemberFieldErrors>({});
  const [photo, setPhoto] = useState<MemberPhotoSelection>(() => emptyMemberPhotoSelection());
  const [hasOutstandingDues, setHasOutstandingDues] = useState(false);
  const [hofConfirmOpen, setHofConfirmOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<EditMemberSubmitData | null>(null);
  const [hofConfirmLoading, setHofConfirmLoading] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  const returnTo =
    navState.returnTo ||
    (member?.familyId || navState.familyId
      ? churchMgmtPath('families', member?.familyId || navState.familyId || '')
      : churchMgmtPath('people', memberId));

  const familyMembers = useMemo(() => family?.members ?? [], [family?.members]);
  const headOfFamily = useMemo(
    () => familyMembers.find((m) => m.isHeadOfFamily || m.id === family?.headOfFamilyId),
    [familyMembers, family?.headOfFamilyId]
  );
  const changingToSeparated = requiresDuesClearanceForStatusChange(
    originalStatus,
    formData.status
  );

  const loadData = useCallback(async () => {
    if (!memberId) return;
    try {
      setLoading(true);
      setSubmitError('');
      const memberRes = await membersApi.getMember(memberId);
      if (memberRes.error || !memberRes.data) {
        setSubmitError(memberRes.error || 'Member not found');
        setMember(null);
        return;
      }
      const loaded = memberRes.data;
      setMember(loaded);
      const status = normalizeMemberStatus(loaded.status);
      setOriginalStatus(status);
      setFormData(memberToFormValues(loaded));
      setFieldErrors({});
      setPhoto(emptyMemberPhotoSelection());

      const familyId = loaded.familyId || loaded.family?.id || navState.familyId;
      if (familyId) {
        const familyRes = await familiesApi.getFamily(familyId);
        if (familyRes.data) {
          setFamily(familyRes.data);
        }
      }
    } catch {
      setSubmitError('Failed to load member');
    } finally {
      setLoading(false);
    }
  }, [memberId, navState.familyId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && memberId) {
      void loadData();
    }
  }, [isAuthenticated, memberId, loadData]);

  const handleChange = (patch: Partial<EditMemberFormValues>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    const clearedKeys = Object.keys(patch) as (keyof EditMemberFieldErrors)[];
    if (clearedKeys.length) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        for (const key of clearedKeys) {
          if (key in next) delete next[key];
        }
        return next;
      });
    }
  };

  const handlePhoneBlur = () => {
    if (!member) return;
    const errors = validateEditMemberForm({
      formData,
      originalStatus,
      member,
      familyMembers,
    });
    if (errors.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: errors.phone }));
    }
  };

  const buildSubmitData = (): EditMemberSubmitData => {
    const showWeddingDate = shouldShowWeddingDateField({
      status: formData.status,
      relationship: formData.relationship,
      maritalStatus:
        formData.status === 'Separated'
          ? 'Married'
          : formData.status === 'Divorced'
            ? 'Divorced'
            : member?.maritalStatus,
    });

    return {
      fullName: formData.fullName.trim(),
      gender: formData.gender as 'MALE' | 'FEMALE',
      relationship: formData.relationship.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      occupation: formData.occupation.trim() || undefined,
      qualification: formData.qualification.trim() || undefined,
      bloodGroup: formData.bloodGroup.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      dateOfBaptism: formData.dateOfBaptism || undefined,
      dateOfConfirmation: formData.dateOfConfirmation || undefined,
      ...(showWeddingDate ? { dateOfWedding: formData.dateOfWedding || undefined } : {}),
      status: formData.status,
      statusNotes: formData.statusNotes.trim() || undefined,
      maritalStatus:
        formData.status === 'Separated'
          ? 'Married'
          : formData.status === 'Divorced'
            ? 'Divorced'
            : undefined,
      spouseName: statusRequiresSpouse(formData.status)
        ? formData.spouseName.trim()
        : formData.spouseName.trim() || undefined,
      isHeadOfFamily: formData.isHeadOfFamily || undefined,
      ...membershipToPayload(formData),
      ...previousDuesToPayload(formData),
      ...memberProfileExtraToPayload(formData),
    };
  };

  const performSave = async (data: EditMemberSubmitData) => {
    if (!member) return;

    const response = await membersApi.updateMember(member.id, {
      fullName: data.fullName,
      gender: data.gender,
      relationship: data.relationship,
      phone: data.phone,
      occupation: data.occupation,
      qualification: data.qualification,
      bloodGroup: data.bloodGroup,
      dob: data.dateOfBirth,
      dow: data.dateOfWedding,
      dateOfBaptism: data.dateOfBaptism,
      dateOfConfirmation: data.dateOfConfirmation,
      status: data.status,
      membershipType: data.membershipType,
      associateJoinDate: data.associateJoinDate,
      associateLeftDate: data.associateLeftDate,
      isHeadOfFamily: data.isHeadOfFamily,
      statusNotes: data.statusNotes,
      maritalStatus: data.maritalStatus,
      spouseName: data.spouseName,
      hasPreviousDues: data.hasPreviousDues,
      previousDuesAmount: data.previousDuesAmount,
      previousDuesNotes: data.previousDuesNotes,
      yearOfJoining: data.yearOfJoining,
      joinYearTo: data.joinYearTo,
      birthYearFrom: data.birthYearFrom,
      birthYearTo: data.birthYearTo,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    if (photo.file || photo.clearExisting) {
      const photoErr = await membersApi.syncPhoto(member.id, {
        file: photo.file,
        clear: photo.clearExisting && !photo.file,
      });
      if (photoErr) {
        throw new Error(`Details saved, but photo update failed: ${photoErr}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setSubmitError('');
    const errors = validateEditMemberForm({
      formData,
      originalStatus,
      member,
      familyMembers,
    });
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const order = [
        'fullName',
        'gender',
        'relationship',
        'phone',
        'dateOfBirth',
        'dateOfWedding',
        'spouseName',
        'statusNotes',
        'membershipType',
        'joinYearFrom',
        'joinYearTo',
        'associateJoinYearFrom',
        'associateJoinYearTo',
      ];
      requestAnimationFrame(() => {
        focusFirstInvalidField(
          order.filter((k) => errors[k as keyof typeof errors]),
          formTopRef.current?.closest('form') ?? document
        );
      });
      return;
    }

    if (changingToSeparated) {
      const duesCheck = await checkPersonOutstandingDues(member.id);
      if (!duesCheck.ok) {
        setHasOutstandingDues(true);
        setSubmitError(duesCheck.error);
        return;
      }
      if (duesCheck.items.length > 0) {
        setHasOutstandingDues(true);
        setSubmitError(
          `Complete all dues first before Separated (married away). Still unpaid: ${formatOutstandingSummary(duesCheck.items)}`
        );
        return;
      }
    }

    const data = buildSubmitData();

    if (data.isHeadOfFamily && !member.isHeadOfFamily) {
      setPendingSubmit(data);
      setHofConfirmOpen(true);
      return;
    }

    try {
      setSaving(true);
      await performSave(data);
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update member';
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmHof = async () => {
    if (!member || !pendingSubmit) return;
    try {
      setHofConfirmLoading(true);
      setSubmitError('');
      await performSave(pendingSubmit);
      setHofConfirmOpen(false);
      setPendingSubmit(null);
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update member';
      setSubmitError(message);
      setHofConfirmOpen(false);
    } finally {
      setHofConfirmLoading(false);
    }
  };

  const goCompleteDues = () => {
    if (!member) return;
    navigate(churchMgmtPath('fees', 'people', member.id), {
      state: {
        payAllClearance: true,
        returnTo: churchMgmtPath('people', member.id, 'edit'),
        personName: member.fullName,
        familyId: member.familyId || family?.id,
        familyCode: family?.familyCode || navState.familyCode,
      },
    });
  };

  if ((authLoading || loading) && !member) {
    return (
      <div className={`${ui.container} py-16 text-center text-base text-slate-500`}>
        Loading member…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!member) {
    return (
      <div className={ui.container}>
        <div className={ui.alertError}>{submitError || 'Member not found'}</div>
        <Link to={churchMgmtPath('members')} className={`${ui.btnPrimary} mt-4 inline-flex`}>
          Back to members
        </Link>
      </div>
    );
  }

  const canSetHeadOfFamily = formData.status === 'Active';
  const saveDisabled = saving || (changingToSeparated && hasOutstandingDues);

  return (
    <>
      <div ref={formTopRef} className="flex min-h-full flex-col pb-6">
        <ChurchMgmtPageShell
          title={`Edit member`}
          subtitle={member.fullName}
          actions={
            <Link to={returnTo} className={ui.btnOutline}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </Link>
          }
        >
          {family?.familyCode && (
            <p className="text-sm text-[hsl(var(--muted-foreground))] dark:text-zinc-400">
              Family {family.familyCode}
              {navState.familyCode && !family?.familyCode ? ` · ${navState.familyCode}` : ''}
            </p>
          )}

          {(submitError || firstEditMemberFieldError(fieldErrors)) && (
            <div className={ui.alertError} role="alert">
              {submitError || firstEditMemberFieldError(fieldErrors)}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col">
            <div className="flex-1 pb-24">
              <EditMemberFormBody
                member={member}
                formData={formData}
                originalStatus={originalStatus}
                familyMembers={familyMembers}
                fieldErrors={fieldErrors}
                photo={photo}
                loading={saving}
                canSetHeadOfFamily={canSetHeadOfFamily}
                onChange={handleChange}
                onPhotoChange={setPhoto}
                onPhoneBlur={handlePhoneBlur}
                onHasOutstandingChange={setHasOutstandingDues}
                onGoCompleteDues={goCompleteDues}
              />
            </div>

            <FormActionBar
              hint={
                <>
                  Editing <span className="font-medium text-slate-800 dark:text-zinc-200">{member.fullName}</span>
                  {family?.familyCode ? (
                    <>
                      {' '}
                      · Family{' '}
                      <span className="font-medium text-slate-800 dark:text-zinc-200">{family.familyCode}</span>
                    </>
                  ) : null}
                </>
              }
              cancelTo={returnTo}
              submitLabel={
                changingToSeparated && hasOutstandingDues ? 'Pay dues first' : 'Save changes'
              }
              submitting={saving}
              disabled={saveDisabled}
              submitIcon={!saving ? <Save className="h-4 w-4" aria-hidden /> : undefined}
            />
          </form>
        </ChurchMgmtPageShell>
      </div>

      <SetHeadOfFamilyConfirmModal
        open={hofConfirmOpen}
        member={member}
        currentHead={headOfFamily}
        familyCode={family?.familyCode || navState.familyCode}
        reactivatingInactiveFamily={family ? isFamilyInactive(family) : false}
        loading={hofConfirmLoading}
        onConfirm={handleConfirmHof}
        onCancel={() => {
          if (hofConfirmLoading) return;
          setHofConfirmOpen(false);
          setPendingSubmit(null);
        }}
      />
    </>
  );
}
