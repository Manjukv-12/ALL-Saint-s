import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { personsApi, familiesApi } from '@/modules/church-management/api';
import type { PersonProfile, LifeEvent, Member } from '@/modules/church-management/api/types';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { membershipToPayload, isAssociateFamily, type MembershipFields } from '@/modules/church-management/lib/membershipType';
import { isFamilyInactive, deathSuccessionNeedsManualHof } from '@/modules/church-management/lib/familyStatus';
import {
  DEATH_INACTIVE_FAMILY_ALERT,
  ManualHofRequiredAlert,
} from '@/modules/church-management/components/family-detail/ManualHofRequiredAlert';
import { MarriageModal, type MarriageFormData } from '@/modules/church-management/components/MarriageModal';
import { SplitFamilyModal } from '@/modules/church-management/components/SplitFamilyModal';
import { DeathModal } from '@/modules/church-management/components/DeathModal';
import { ReturnHomeModal } from '@/modules/church-management/components/ReturnHomeModal';
import { getMemberRoleLabel } from '@/modules/church-management/lib/familyRoles';
import { ActionHint } from '@/modules/church-management/components/ActionHint';
import { MemberAvatar } from '@/modules/church-management/components/MemberAvatar';
import { MembershipStatusBadge } from '@/modules/church-management/components/MembershipStatusBadge';
import { PersonProfileEditSection } from '@/modules/church-management/pages/PersonProfileEditSection';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { ChevronRight } from 'lucide-react';

const EVENT_LABELS: Record<string, string> = {
  MARRIAGE_OUT: 'Married (away)',
  FAMILY_SPLIT: 'New family (son)',
  DEATH: 'Death',
  DIVORCE_RETURN: 'Divorced / returned home',
  STATUS_CHANGE: 'Status change',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function PersonProfilePage() {
  const { id: personId } = useParams<{ id: string }>();
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marriageOpen, setMarriageOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [deathOpen, setDeathOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [successionNotice, setSuccessionNotice] = useState('');
  const [manualHofNotice, setManualHofNotice] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadProfile = async (silent = false) => {
    if (!personId) return;
    try {
      if (!silent) setLoading(true);
      if (!silent) setError('');
      const res = await personsApi.getProfile(personId);
      if (res.error || !res.data) {
        setError(res.error || 'Person not found');
        if (!silent) setProfile(null);
      } else {
        setProfile(res.data);
        if (silent) setError('');
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && personId) {
      void loadProfile(false);
    }
  }, [isAuthenticated, personId]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && personId) {
        void loadProfile(true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on tab focus
  }, [isAuthenticated, personId]);

  const person = profile?.person;
  const family = profile?.currentFamily;

  const goCompleteDues = () => {
    if (!family || !person) return;
    navigate(churchMgmtPath('fees', 'people', person.id), {
      state: {
        payAllClearance: true,
        returnTo: churchMgmtPath('people', person.id),
        personName: person.fullName,
        familyId: family.id,
        familyCode: family.familyCode,
      },
    });
  };

  const handleMarriage = async (data: MarriageFormData) => {
    if (!person || !family) return;
    const res = await familiesApi.markDaughterMarried(family.id, person.id, data);
    if (res.error) throw new Error(res.error);
    await loadProfile(true);
  };

  const handleSplit = async (
    code: string | null,
    address: string | undefined,
    auto: boolean | undefined,
    notes: string,
    membership?: MembershipFields
  ) => {
    if (!person || !family) return;
    const res = await familiesApi.splitFamily(family.id, {
      newHeadOfFamilyId: person.id,
      newFamilyCode: code || undefined,
      newAddress: address,
      autoGenerateCode: auto || false,
      notes,
      ...(membership ? membershipToPayload(membership) : {}),
    });
    if (res.error) throw new Error(res.error);
    await loadProfile(true);
  };

  const handleDeath = async (notes: string, eventDate?: string, successorId?: string) => {
    if (!personId) return;
    const res = await personsApi.markDeceased(personId, { notes, eventDate, successorId });
    if (res.error) throw new Error(res.error);
    const succession = res.data?.deathSuccession;
    if (deathSuccessionNeedsManualHof(succession)) {
      setManualHofNotice(succession?.message ?? DEATH_INACTIVE_FAMILY_ALERT);
      setSuccessionNotice('');
    } else if (succession?.applied) {
      setSuccessionNotice(succession.message);
      setManualHofNotice('');
    }
    await loadProfile(true);
  };

  const handleReturn = async (notes: string, spouseName: string) => {
    if (!personId) return;
    const res = await personsApi.returnHome(personId, { notes, spouseName });
    if (res.error) throw new Error(res.error);
    if (res.data) setProfile(res.data);
  };

  if ((authLoading || loading) && !profile) {
    return (
      <div className={`${ui.container} py-16 text-center text-base text-slate-500`}>Loading profile…</div>
    );
  }

  if (!person || !profile) {
    return (
      <div className={ui.container}>
        <Link to={churchMgmtPath('people')} className={ui.breadcrumb}>
          ← People
        </Link>
        <p className={`${ui.alertError} mt-4`}>{error || 'Person not found'}</p>
      </div>
    );
  }

  const subtitle = [
    person.gender === 'MALE' ? 'Male' : person.gender === 'FEMALE' ? 'Female' : '',
    getMemberRoleLabel(person),
    person.isHeadOfFamily ? 'Head of family' : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={`${ui.container} space-y-6`}>
        <nav className="flex items-center gap-1">
          <Link to={churchMgmtPath('people')} className={ui.breadcrumb}>
            People
          </Link>
          <ChevronRight className={ui.breadcrumbSep} aria-hidden />
          <span className={ui.breadcrumbCurrent}>{person.fullName}</span>
        </nav>

        {manualHofNotice && (
          <ManualHofRequiredAlert message={manualHofNotice}>
            {family?.id && (
              <Link
                to={churchMgmtPath('families', family.id)}
                className="mt-3 inline-block text-sm font-medium text-amber-950 underline dark:text-amber-100"
              >
                Open family to assign head of family
              </Link>
            )}
          </ManualHofRequiredAlert>
        )}
        {successionNotice && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 text-base text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100">
            {successionNotice}
          </div>
        )}

        <div className={ui.pageHeader}>
          <div className="flex items-start gap-4">
            <MemberAvatar photo={person.photo} name={person.fullName} size="lg" />
            <div>
              <h1 className={ui.title}>{person.fullName}</h1>
              {subtitle && <p className={ui.subtitle}>{subtitle}</p>}
            </div>
          </div>
          <MembershipStatusBadge member={person} size="md" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PersonProfileEditSection
            person={person}
            familyId={family?.id}
            familyCode={family?.familyCode}
          />
          {profile.canMarkMarried && (
            <ActionHint hint="Record that she married and left this family (or remarried after divorce). All dues must be paid first. Saves spouse and family details in history.">
              <button
                type="button"
                onClick={() => setMarriageOpen(true)}
                className={ui.btnSecondary}
              >
                Married away
              </button>
            </ActionHint>
          )}
          {profile.canSplitFamily && (
            <ActionHint hint="Create a new family with this son as head (Moved To). He must be 18+ with date of birth, and dues must be cleared first. Paid membership stays with him on the new family.">
              <button type="button" onClick={() => setSplitOpen(true)} className={ui.btnSecondary}>
                New family (son)
              </button>
            </ActionHint>
          )}
          {profile.canReturnHome && (
            <ActionHint hint="After married away: record divorce and return her as an Active member of this family. Divorce details stay in Life events only.">
              <button type="button" onClick={() => setReturnOpen(true)} className={ui.btnOutline}>
                Return home
              </button>
            </ActionHint>
          )}
          {profile.canMarkDeceased && (
            <ActionHint hint="Mark this person as deceased. If they are head of family, you can choose the next head.">
              <button type="button" onClick={() => setDeathOpen(true)} className={ui.btnDanger}>
                Mark deceased
              </button>
            </ActionHint>
          )}
          {family && (
            <ActionHint hint={`Open family ${family.familyCode} to see all members, dues, and lineage.`}>
              <Link to={churchMgmtPath('families', family.id)} className={ui.btnOutline}>
                View family {family.familyCode}
              </Link>
            </ActionHint>
          )}
        </div>

        <section className={`${ui.card} ${ui.sectionBody}`}>
          <h2 className={ui.sectionTitle}>Details</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <Detail label="Family" value={family?.familyCode} />
            <Detail label="Contact" value={person.contactNumber} />
            <Detail label="Marital status" value={person.maritalStatus} />
            <Detail label="Spouse" value={person.spouseName} />
            {person.maritalStatus === 'Divorced' && !person.spouseName && (
              <Detail
                label="Note"
                value="Divorce details are in Life events below. She can remarry with Married away."
                className="sm:col-span-2"
              />
            )}
            {person.marriedToFamily ? (
              <div>
                <dt className="text-zinc-500">Married into (church family)</dt>
                <dd className="font-medium text-black dark:text-white">
                  <Link
                    to={churchMgmtPath('families', person.marriedToFamily.id)}
                    className="font-mono text-blue-600"
                  >
                    {person.marriedToFamily.familyCode}
                  </Link>
                </dd>
              </div>
            ) : null}
            {person.externalFamilyName && (
              <Detail label="Married into (family name)" value={person.externalFamilyName} />
            )}
            {person.externalFamilyAddress && (
              <Detail label="Husband family address" value={person.externalFamilyAddress} className="sm:col-span-2" />
            )}
            {person.statusNotes && (
              <Detail label="Status notes" value={person.statusNotes} className="sm:col-span-2" />
            )}
          </dl>
        </section>

        {family?.lineageInfo && (
          <section className={`${ui.card} ${ui.sectionBody}`}>
            <h2 className={ui.sectionTitle}>Family hierarchy</h2>
            {family.lineageInfo.parentFamily && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Parent:{' '}
                <Link
                  to={churchMgmtPath('families', family.lineageInfo.parentFamily.id)}
                  className="font-mono text-blue-600"
                >
                  {family.lineageInfo.parentFamily.familyCode}
                </Link>
              </p>
            )}
            {family.lineageInfo.lineagePath && family.lineageInfo.lineagePath.length > 0 && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Lineage:{' '}
                {family.lineageInfo.lineagePath.map((a, i) => (
                  <span key={a.id}>
                    {i > 0 && ' → '}
                    <Link to={churchMgmtPath('families', a.id)} className="font-mono text-blue-600">
                      {a.familyCode}
                    </Link>
                  </span>
                ))}
                {' → '}
                <span className="font-mono font-semibold">{family.familyCode}</span>
              </p>
            )}
            {profile.createdFamilies.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Families created by this person:</p>
                <ul className="mt-1 list-inside list-disc text-sm text-blue-600">
                  {profile.createdFamilies.map((f) => (
                    <li key={f.id}>
                      <Link to={churchMgmtPath('families', f.id)}>{f.familyCode}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {profile.relatedMembers.length > 0 && (
          <section className={`${ui.card} ${ui.sectionBody}`}>
            <h2 className={ui.sectionTitle}>Same family</h2>
            <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
              {profile.relatedMembers.map((m: Member) => (
                <li key={m.id} className="py-2">
                  <Link to={churchMgmtPath('people', m.id)} className="text-blue-600 hover:underline">
                    {m.fullName}
                  </Link>
                  <span className="ml-2 text-xs text-zinc-500">{m.relationship}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={`${ui.card} ${ui.sectionBody}`}>
          <h2 className={ui.sectionTitle}>Life events</h2>
          {profile.lifeEvents.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No recorded life events yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {profile.lifeEvents.map((ev: LifeEvent) => (
                <li
                  key={ev.id}
                  className="border-l-4 border-blue-500 pl-4 text-sm dark:border-blue-600"
                >
                  <div className="font-medium text-black dark:text-white">
                    {EVENT_LABELS[ev.eventType] ?? ev.eventType}
                    <span className="ml-2 font-normal text-zinc-500">{formatDate(ev.eventDate)}</span>
                  </div>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">{ev.notes}</p>
                  {ev.eventType === 'DIVORCE_RETURN' && ev.spouseName && (
                    <p className="text-zinc-500">Former spouse: {ev.spouseName}</p>
                  )}
                  {ev.eventType !== 'DIVORCE_RETURN' && ev.spouseName && (
                    <p className="text-zinc-500">Spouse: {ev.spouseName}</p>
                  )}
                  {ev.eventType === 'DIVORCE_RETURN' && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Active family member again — can remarry with the normal married-away flow.
                    </p>
                  )}
                  {ev.relatedFamilyCode && (
                    <p className="text-zinc-500">
                      Married into church family:{' '}
                      {ev.relatedFamilyId ? (
                        <Link
                          to={churchMgmtPath('families', ev.relatedFamilyId)}
                          className="font-mono text-blue-600"
                        >
                          {ev.relatedFamilyCode}
                        </Link>
                      ) : (
                        ev.relatedFamilyCode
                      )}
                    </p>
                  )}
                  {ev.externalFamilyAddress && (
                    <p className="text-zinc-500">Address: {ev.externalFamilyAddress}</p>
                  )}
                  {(ev.fromFamilyCode || ev.toFamilyCode) && (
                    <p className="text-zinc-500">
                      {ev.fromFamilyCode && `From ${ev.fromFamilyCode}`}
                      {ev.fromFamilyCode && ev.toFamilyCode && ' → '}
                      {ev.toFamilyCode && `To ${ev.toFamilyCode}`}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

      <MarriageModal
        isOpen={marriageOpen}
        onClose={() => setMarriageOpen(false)}
        member={person}
        currentFamilyId={family?.id}
        onSubmit={handleMarriage}
        onGoCompleteDues={goCompleteDues}
      />
      <SplitFamilyModal
        isOpen={splitOpen}
        onClose={() => setSplitOpen(false)}
        member={person}
        familyId={family?.id ?? ''}
        parentFamilyCode={family?.familyCode}
        parentIsAssociateFamily={isAssociateFamily(family)}
        onSubmit={handleSplit}
        onGoCompleteDues={goCompleteDues}
      />
      <DeathModal
        isOpen={deathOpen}
        onClose={() => setDeathOpen(false)}
        member={person}
        isHeadOfFamily={
          !!person.isHeadOfFamily || person.id === family?.headOfFamilyId
        }
        familyMembers={family?.members ?? profile?.relatedMembers ?? []}
        onSubmit={handleDeath}
      />
      <ReturnHomeModal
        isOpen={returnOpen}
        onClose={() => setReturnOpen(false)}
        member={person}
        onSubmit={handleReturn}
      />
    </div>
  );
}

function Detail({
  label,
  value,
  className = '',
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-black dark:text-white">{value || '—'}</dd>
    </div>
  );
}
