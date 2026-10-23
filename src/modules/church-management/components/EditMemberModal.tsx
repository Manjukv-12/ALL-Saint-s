import { useState, useEffect } from 'react';
import type { Member } from '@/modules/church-management/api/types';
import {
  MEMBER_STATUS_OPTIONS,
  normalizeMemberStatus,
  shouldShowWeddingDateField,
  statusRequiresSpouse,
  type MemberStatus,
} from '@/modules/church-management/lib/memberStatus';
import {
  DEFAULT_MEMBERSHIP,
  membershipFromMember,
  validateMembership,
} from '@/modules/church-management/lib/membershipType';
import { MembershipTypeFields } from '@/modules/church-management/components/MembershipTypeFields';
import { FamilyRoleSelect } from '@/modules/church-management/components/FamilyRoleSelect';
import { BloodGroupSelect } from '@/modules/church-management/components/BloodGroupSelect';
import { PersonDuesClearanceNotice } from '@/modules/church-management/components/PersonDuesClearanceNotice';
import { normalizeRoleValue } from '@/modules/church-management/lib/familyRoles';
import {
  sanitizePhoneDigits,
  validateOptionalPhone,
} from '@/modules/church-management/lib/phoneInput';
import {
  checkPersonOutstandingDues,
  formatOutstandingSummary,
  requiresDuesClearanceForStatusChange,
} from '@/modules/church-management/lib/personOutstandingDues';
import { soleHeadDeceasedBlockReason } from '@/modules/church-management/lib/hofEligibility';
import type { EditMemberSubmitData } from '@/modules/church-management/lib/editMemberSubmitData';
import { DatePartsField } from '@/components/DatePartsField';
import { membersApi } from '@/modules/church-management/api';
import {
  emptyMemberPhotoSelection,
  MemberPhotoField,
  type MemberPhotoSelection,
} from '@/modules/church-management/components/MemberPhotoField';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  /** Current family members — used to block sole-head → Deceased. */
  familyMembers?: Member[];
  onSubmit: (data: EditMemberSubmitData) => Promise<boolean | void>;
  canSetHeadOfFamily?: boolean;
  /** Close modal and open Fees so unpaid dues can be completed first. */
  onGoCompleteDues?: () => void;
  /** Called after photo upload/clear so lists can refresh. */
  onRefresh?: () => void;
}

export function EditMemberModal({
  isOpen,
  onClose,
  member,
  familyMembers = [],
  onSubmit,
  canSetHeadOfFamily = true,
  onGoCompleteDues,
  onRefresh,
}: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '' as 'MALE' | 'FEMALE' | '',
    relationship: '',
    phone: '',
    occupation: '',
    qualification: '',
    bloodGroup: '',
    dateOfBirth: '',
    dateOfWedding: '',
    status: 'Active' as MemberStatus,
    statusNotes: '',
    spouseName: '',
    isHeadOfFamily: false,
    ...DEFAULT_MEMBERSHIP,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalStatus, setOriginalStatus] = useState<MemberStatus>('Active');
  const [hasOutstandingDues, setHasOutstandingDues] = useState(false);
  const [photo, setPhoto] = useState<MemberPhotoSelection>(emptyMemberPhotoSelection);

  const changingToSeparated = requiresDuesClearanceForStatusChange(
    originalStatus,
    formData.status
  );
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

  useEffect(() => {
    if (member && isOpen) {
      const status = normalizeMemberStatus(member.status);
      setOriginalStatus(status);
      setFormData({
        fullName: member.fullName || '',
        gender: (member.gender as 'MALE' | 'FEMALE') || '',
        relationship: normalizeRoleValue(member.relationship || member.relationshipToHOF),
        phone: sanitizePhoneDigits(member.contactNumber || ''),
        occupation: member.occupation || '',
        qualification: member.qualification || '',
        bloodGroup: member.bloodGroup || '',
        dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
        dateOfWedding: member.dateOfWedding ? member.dateOfWedding.split('T')[0] : '',
        status,
        statusNotes: member.statusNotes || '',
        spouseName: member.spouseName || '',
        isHeadOfFamily: !!member.isHeadOfFamily,
        ...membershipFromMember(member),
      });
      setError('');
      setHasOutstandingDues(false);
      setPhoto(emptyMemberPhotoSelection());
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const soleHeadDeceasedAlert =
    formData.status === 'Deceased' && originalStatus !== 'Deceased'
      ? soleHeadDeceasedBlockReason(
          member,
          familyMembers,
          !!member.isHeadOfFamily || formData.isHeadOfFamily
        )
      : null;

  const handleGoCompleteDues = () => {
    onClose();
    onGoCompleteDues?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Full Name is required');
      return;
    }

    if (!formData.gender) {
      setError('Gender is required');
      return;
    }

    if (!formData.relationship.trim()) {
      setError('Role in family is required (use Wife for the spouse)');
      return;
    }

    const membershipError = validateMembership(formData);
    if (membershipError) {
      setError(membershipError);
      return;
    }

    const phoneError = validateOptionalPhone(formData.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    const statusChanged = formData.status !== originalStatus;
    if (statusChanged && !formData.statusNotes.trim()) {
      setError('Please add a comment when changing member status');
      return;
    }

    if (statusRequiresSpouse(formData.status) && !formData.spouseName.trim()) {
      setError(
        formData.status === 'Divorced'
          ? 'Spouse name is required when status is Divorced'
          : 'Spouse name is required when status is Separated (married away)'
      );
      return;
    }

    if (formData.status === 'Separated' && !formData.dateOfWedding.trim()) {
      setError('Marriage date is required for Married Away');
      return;
    }

    if (formData.status === 'Deceased' && originalStatus !== 'Deceased' && soleHeadDeceasedAlert) {
      setError(soleHeadDeceasedAlert);
      return;
    }

    if (changingToSeparated) {
      const duesCheck = await checkPersonOutstandingDues(member.id);
      if (!duesCheck.ok) {
        setHasOutstandingDues(true);
        setError(duesCheck.error);
        return;
      }
      if (duesCheck.items.length > 0) {
        setHasOutstandingDues(true);
        setError(
          `Complete all dues first before Separated (married away). Still unpaid: ${formatOutstandingSummary(duesCheck.items)}`
        );
        return;
      }
    }

    try {
      setLoading(true);
      const shouldClose = await onSubmit({
        fullName: formData.fullName.trim(),
        gender: formData.gender as 'MALE' | 'FEMALE',
        relationship: formData.relationship.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        occupation: formData.occupation.trim() || undefined,
        qualification: formData.qualification.trim() || undefined,
        bloodGroup: formData.bloodGroup.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        ...(showWeddingDate
          ? { dateOfWedding: formData.dateOfWedding || undefined }
          : {}),
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
        membershipType: formData.membershipType,
        associateJoinDate: formData.associateJoinDate || undefined,
        associateLeftDate: formData.associateLeftDate || undefined,
        isHeadOfFamily: formData.isHeadOfFamily || undefined,
      });
      if (shouldClose === false) {
        return;
      }
      if (photo.file || photo.clearExisting) {
        const photoErr = await membersApi.syncPhoto(member.id, {
          file: photo.file,
          clear: photo.clearExisting && !photo.file,
        });
        if (photoErr) {
          setError(`Details saved, but photo update failed: ${photoErr}`);
          onRefresh?.();
          return;
        }
      }
      onRefresh?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/50 p-4">
      <div className="mx-auto my-4 w-full max-w-2xl max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto overscroll-contain rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Edit Member: {member.fullName}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Gender *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Role in family <span className="text-red-600">*</span>
                </label>
                <FamilyRoleSelect
                  value={formData.relationship}
                  onChange={(relationship) => setFormData({ ...formData, relationship })}
                  required
                  allowEmpty={false}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Required. Mark the spouse as Wife (succession uses this label only).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Phone
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: sanitizePhoneDigits(e.target.value) })
                  }
                  placeholder="10-digit mobile number"
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                  autoComplete="tel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Date of Birth
                </label>
                <DatePartsField
                  value={formData.dateOfBirth}
                  onChange={(dateOfBirth) => setFormData({ ...formData, dateOfBirth })}
                  className="mt-1"
                  aria-label="Date of birth"
                  maxYear={new Date().getFullYear()}
                />
              </div>

              {showWeddingDate && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {formData.status === 'Separated' ? (
                      <>
                        Marriage date <span className="text-red-600">*</span>
                      </>
                    ) : (
                      'Date of Wedding'
                    )}
                  </label>
                  <DatePartsField
                    value={formData.dateOfWedding}
                    onChange={(dateOfWedding) => setFormData({ ...formData, dateOfWedding })}
                    className="mt-1"
                    required={formData.status === 'Separated'}
                    aria-label={
                      formData.status === 'Separated' ? 'Marriage date' : 'Date of wedding'
                    }
                    maxYear={new Date().getFullYear()}
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    {formData.status === 'Separated'
                      ? 'Required — choose the wedding date.'
                      : formData.status === 'Divorced'
                        ? 'Optional — date of the marriage that ended.'
                        : 'Optional — for Husband / Wife in this family.'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Qualification
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Member status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => {
                    const next = e.target.value as MemberStatus;
                    setFormData((prev) => ({
                      ...prev,
                      status: next,
                      // Married Away: start marriage date empty so user must pick it.
                      dateOfWedding:
                        next === 'Separated' && prev.status !== 'Separated'
                          ? ''
                          : prev.dateOfWedding,
                    }));
                  }}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                >
                  {MEMBER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-zinc-500">
                  {MEMBER_STATUS_OPTIONS.find((o) => o.value === formData.status)?.hint}
                </p>
                {soleHeadDeceasedAlert && (
                    <div
                      role="alert"
                      className="mt-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
                    >
                      {soleHeadDeceasedAlert}
                    </div>
                  )}
              </div>

              {changingToSeparated && (
                <div className="md:col-span-2">
                  <PersonDuesClearanceNotice
                    personId={member.id}
                    personName={member.fullName}
                    action="status_separated"
                    onHasOutstandingChange={setHasOutstandingDues}
                    onGoCompleteDues={onGoCompleteDues ? handleGoCompleteDues : undefined}
                  />
                </div>
              )}

              {statusRequiresSpouse(formData.status) && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Spouse name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.spouseName}
                    onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                    placeholder="Name of spouse"
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    {formData.status === 'Divorced'
                      ? 'Required for divorce history (former spouse). She stays an Active family member.'
                      : 'Required for Married To / married away records.'}
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Comment / status notes
                  {formData.status !== originalStatus && (
                    <span className="text-red-600"> *</span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={formData.statusNotes}
                  onChange={(e) => setFormData({ ...formData, statusNotes: e.target.value })}
                  placeholder={
                    formData.status !== originalStatus
                      ? 'Required when changing status — e.g. reason for separation or death details'
                      : 'Optional note about this member (visible on their profile)'
                  }
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Notes are kept on the member profile; they are not shown in the members list.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Blood Group
                </label>
                <BloodGroupSelect
                  value={formData.bloodGroup}
                  onChange={(bloodGroup) => setFormData({ ...formData, bloodGroup })}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <MembershipTypeFields
                value={formData}
                onChange={(membership) => setFormData({ ...formData, ...membership })}
                inputClass="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />

              <div className="md:col-span-2">
                <MemberPhotoField
                  existingPhoto={member.photo}
                  value={photo}
                  onChange={setPhoto}
                  disabled={loading}
                />
              </div>

              {canSetHeadOfFamily && formData.status === 'Active' && (
                <div className="md:col-span-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                    <input
                      type="checkbox"
                      checked={formData.isHeadOfFamily}
                      onChange={(e) =>
                        setFormData({ ...formData, isHeadOfFamily: e.target.checked })
                      }
                      className="h-4 w-4 rounded accent-slate-800"
                    />
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      Head of family
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-zinc-500">
                    Only one head per family. You will be asked to confirm before the change is saved.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (changingToSeparated && hasOutstandingDues)}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? 'Updating...'
                : changingToSeparated && hasOutstandingDues
                  ? 'Pay dues first'
                  : 'Update Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

