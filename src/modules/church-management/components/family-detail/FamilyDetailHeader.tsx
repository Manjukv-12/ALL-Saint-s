import { MapPin, Phone, Calendar, ChevronRight, Landmark } from 'lucide-react';
import { formatTombBookedLabel } from '@/modules/church-management/components/FamilyTombBookedFields';
import type { Family, Member } from '@/modules/church-management/api/types';
import {
  familyStatusBadgeClass,
  familyStatusLabel,
  isFamilyInactive,
  SUCCESSION_ORDER_HINT,
} from '@/modules/church-management/lib/familyStatus';
import { ManualHofRequiredAlert } from '@/modules/church-management/components/family-detail/ManualHofRequiredAlert';
import { ChurchAreaSelect } from '@/modules/church-management/components/ChurchAreaSelect';
import { ui } from './familyDetailTheme';
import { ActionHint } from '@/modules/church-management/components/ActionHint';
import { MemberAvatar } from '@/modules/church-management/components/MemberAvatar';

interface FamilyDetailHeaderProps {
  family: Family;
  headOfFamily?: Member;
  fullMemberCount?: number;
  associateMemberCount?: number;
  totalMemberCount?: number;
  activeMemberCount?: number;
  onAddMember: () => void;
  addMemberOpen: boolean;
  onEditDetails?: () => void;
  editDetailsOpen?: boolean;
  onBack: () => void;
  onAreaChange?: (area: string) => void;
  areaSaving?: boolean;
}

function formatJoined(dateString?: string) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function familyInitials(code: string, headName?: string) {
  if (headName) {
    const parts = headName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return headName.slice(0, 2).toUpperCase();
  }
  return code.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'FM';
}

export function FamilyDetailHeader({
  family,
  headOfFamily,
  fullMemberCount = 0,
  associateMemberCount = 0,
  totalMemberCount = 0,
  activeMemberCount = 0,
  onAddMember,
  addMemberOpen,
  onEditDetails,
  editDetailsOpen = false,
  onBack,
  onAreaChange,
  areaSaving = false,
}: FamilyDetailHeaderProps) {
  const inactive = isFamilyInactive(family);
  const displayName = headOfFamily?.fullName
    ? `${headOfFamily.fullName} family`
    : inactive
      ? `${family.familyCode} (inactive)`
      : family.familyCode;

  return (
    <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`${ui.containerWide} !py-5`}>
        <nav className="mb-5 flex items-center gap-1">
          <button type="button" onClick={onBack} className={ui.breadcrumb}>
            Families
          </button>
          <ChevronRight className="h-4 w-4 text-slate-300 dark:text-zinc-600" aria-hidden />
          <span className={ui.breadcrumbCurrent}>{family.familyCode}</span>
        </nav>

        {inactive && <ManualHofRequiredAlert className="mb-4" />}

        <div className={`${ui.card} p-6 sm:p-8`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-5 sm:gap-6">
              {headOfFamily?.photo ? (
                <MemberAvatar
                  photo={headOfFamily.photo}
                  name={headOfFamily.fullName}
                  size="md"
                  className="!h-12 !w-12"
                />
              ) : (
                <div className={ui.avatar}>{familyInitials(family.familyCode, headOfFamily?.fullName)}</div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className={ui.title}>{displayName}</h1>
                  <span className={`${ui.badgePill} ${familyStatusBadgeClass(family.status)}`}>
                    {familyStatusLabel(family.status)}
                  </span>
                  {headOfFamily && (
                    <span className={`${ui.badgePill} ${ui.badgePillInfo}`}>
                      Head: {headOfFamily.fullName}
                    </span>
                  )}
                  {totalMemberCount > 0 && (
                    <span className={`${ui.badgePill} ${ui.badgePillNeutral}`}>
                      {totalMemberCount} member{totalMemberCount === 1 ? '' : 's'}
                      {activeMemberCount > 0 && activeMemberCount < totalMemberCount && (
                        <> · {activeMemberCount} active</>
                      )}
                    </span>
                  )}
                  {fullMemberCount > 0 && (
                    <span className={`${ui.badgePill} ${ui.badgePillNeutral}`}>
                      {fullMemberCount} full
                    </span>
                  )}
                  {associateMemberCount > 0 && (
                    <span className={`${ui.badgePill} ${ui.badgePillWarning}`}>
                      {associateMemberCount} associate
                    </span>
                  )}
                  {family.tombBooked === true && (
                    <span className={`${ui.badgePill} ${ui.badgePillInfo}`}>Tomb booked</span>
                  )}
                </div>
                <p className={ui.subtitle}>
                  Family code:{' '}
                  <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">
                    {family.familyCode}
                  </span>
                </p>
                {!inactive && (
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                    {SUCCESSION_ORDER_HINT}
                  </p>
                )}
                <div className={`mt-4 ${ui.meta}`}>
                  {onAreaChange ? (
                    <label className="inline-flex max-w-full flex-wrap items-center gap-2">
                      <MapPin className={ui.metaIcon} />
                      <span className="text-sm text-slate-500 dark:text-zinc-400">Area</span>
                      <ChurchAreaSelect
                        value={family.area || ''}
                        onChange={onAreaChange}
                        disabled={areaSaving || inactive}
                        allowEmpty
                        emptyLabel="Set area…"
                        className="max-w-[18rem] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        aria-label="Church area"
                      />
                      {areaSaving ? (
                        <span className="text-xs text-slate-500">Saving…</span>
                      ) : null}
                    </label>
                  ) : (
                    <span className="inline-flex max-w-full items-center gap-2">
                      <MapPin className={ui.metaIcon} />
                      <span className="text-sm text-slate-500 dark:text-zinc-400">Area</span>
                      <span className="min-w-0 break-words text-sm font-medium text-slate-800 dark:text-zinc-200">
                        {family.area?.trim() || '—'}
                      </span>
                    </span>
                  )}
                  <span className="inline-flex max-w-full items-center gap-2">
                    <MapPin className={ui.metaIcon} />
                    <span className="text-sm text-slate-500 dark:text-zinc-400">House</span>
                    <span className="min-w-0 break-words text-sm text-slate-800 dark:text-zinc-200">
                      {family.houseName?.trim() || '—'}
                    </span>
                  </span>
                  <span className="inline-flex max-w-full items-center gap-2">
                    <MapPin className={ui.metaIcon} />
                    <span className="text-sm text-slate-500 dark:text-zinc-400">Address</span>
                    <span className="min-w-0 break-words text-sm text-slate-800 dark:text-zinc-200">
                      {family.address?.trim() || '—'}
                    </span>
                  </span>
                  <span className="inline-flex max-w-full items-center gap-2">
                    <Landmark className={ui.metaIcon} />
                    <span className="text-sm text-slate-500 dark:text-zinc-400">Tomb booked</span>
                    <span className="min-w-0 break-words text-sm font-medium text-slate-800 dark:text-zinc-200">
                      {formatTombBookedLabel(family.tombBooked)}
                    </span>
                  </span>
                  {headOfFamily?.contactNumber && (
                    <span className="inline-flex items-center gap-2">
                      <Phone className={ui.metaIcon} />
                      {headOfFamily.contactNumber}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2">
                    <Calendar className={ui.metaIcon} />
                    Joined {formatJoined(family.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
              {onEditDetails && (
                <ActionHint hint="Edit house name, address, area, and tomb booking status.">
                  <button
                    type="button"
                    onClick={onEditDetails}
                    className={editDetailsOpen ? ui.btnPrimary : ui.btnOutline}
                  >
                    {editDetailsOpen ? 'Close edit' : 'Edit family details'}
                  </button>
                </ActionHint>
              )}
              {!inactive && (
                <ActionHint hint="Add a new person to this family (name, gender, date of birth, role).">
                  <button type="button" onClick={onAddMember} className={ui.btnPrimary}>
                    {addMemberOpen ? 'Close' : 'Add member'}
                  </button>
                </ActionHint>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
