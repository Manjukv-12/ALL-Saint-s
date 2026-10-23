import { useEffect, useState } from 'react';

import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft, IndianRupee } from 'lucide-react';

import { ChurchMgmtPageShell } from '@/modules/church-management/components/ChurchMgmtPageShell';

import { RecordDuePaymentForm } from '@/modules/church-management/components/fees/RecordDuePaymentForm';

import { RecordPreviousDuesPaymentForm } from '@/modules/church-management/components/fees/RecordPreviousDuesPaymentForm';

import { feesApi, type MemberDue } from '@/modules/church-management/api/fees';

import { membersApi } from '@/modules/church-management/api/families';

import { churchMgmtPath } from '@/modules/church-management/paths';

import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';

import { dueTypeDisplayName } from '@/modules/church-management/lib/dueTypes';

import { isPreviousDuesPaymentId } from '@/modules/church-management/lib/previousDuesPayment';

import { PREVIOUS_DUES_THROUGH_YEAR } from '@/modules/church-management/lib/feesYearPolicy';



type PayNavState = {

  due?: MemberDue;

  returnTo?: string;

  personName?: string;

  prefillAmount?: number;

  prefillChoice?: string;

};



export default function RecordDuePaymentPage() {

  const { personId = '', feeId = '' } = useParams<{ personId: string; feeId: string }>();

  const navigate = useNavigate();

  const location = useLocation();

  const navState = (location.state as PayNavState | null) ?? null;

  const stateDue = navState?.due;

  const isPreviousDues = isPreviousDuesPaymentId(feeId);



  const [due, setDue] = useState<MemberDue | null>(

    !isPreviousDues && stateDue && stateDue.id === feeId ? stateDue : null

  );

  const [memberName, setMemberName] = useState(

    navState?.personName || stateDue?.personName || stateDue?.person?.fullName || ''

  );

  const [previousBalance, setPreviousBalance] = useState(0);

  const [previousNotes, setPreviousNotes] = useState<string | null>(null);

  const [previousThroughYear, setPreviousThroughYear] = useState(PREVIOUS_DUES_THROUGH_YEAR);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');



  const backTo = navState?.returnTo || churchMgmtPath('fees', 'people', personId);



  useEffect(() => {

    let cancelled = false;

    void (async () => {

      try {

        setLoading(true);

        setError('');



        const memberRes = await membersApi.getMember(personId);

        if (cancelled) return;



        const name =

          memberRes.data?.fullName ||

          navState?.personName ||

          '';

        if (name) setMemberName(name);



        if (isPreviousDues) {

          const statusRes = await feesApi.getPersonFeeStatus(personId);

          if (cancelled) return;

          const prev = statusRes.data?.previousDues;

          if (!prev?.hasOutstanding || !prev.amount || prev.amount < 0.001) {

            setError('This member has no previous dues balance on file.');

            return;

          }

          setPreviousBalance(prev.amount);

          setPreviousNotes(prev.notes ?? null);

          setPreviousThroughYear(prev.throughYear ?? PREVIOUS_DUES_THROUGH_YEAR);

          return;

        }



        const histRes = await feesApi.getPersonFeeHistory(personId);

        if (cancelled) return;



        const fromState = stateDue && stateDue.id === feeId ? stateDue : null;

        const found =

          fromState || (histRes.data?.dues ?? []).find((d) => d.id === feeId) || null;

        if (!found) {

          setError(histRes.error || 'This due was not found.');

          setDue(null);

        } else {

          setDue({

            ...found,

            personName: found.personName || found.person?.fullName || name,

            person: found.person ?? (name ? { id: personId, fullName: name } : undefined),

          });

        }

      } catch {

        if (!cancelled) setError('Failed to load payment screen.');

      } finally {

        if (!cancelled) setLoading(false);

      }

    })();

    return () => {

      cancelled = true;

    };

    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per person/fee

  }, [personId, feeId, isPreviousDues]);



  const displayName = memberName || due?.personName || due?.person?.fullName || 'Member';



  const subtitle = isPreviousDues

    ? `${displayName} — Previous dues through ${previousThroughYear}`

    : due

      ? (() => {

          const m = Number(due.month) || 0;

          const monthName =

            m >= 1 && m <= 12

              ? new Date(2000, m - 1, 1).toLocaleString('en-IN', { month: 'short' })

              : '';

          const period = monthName ? `${monthName} ${due.year}` : String(due.year);

          return `${displayName} — ${dueTypeDisplayName(due.dueType)} · opened ${period}`;

        })()

      : 'Record a membership or other due payment';



  return (

    <ChurchMgmtPageShell

      title={isPreviousDues ? 'Collect previous dues' : 'Collect payment'}

      subtitle={subtitle}

      icon={IndianRupee}

      actions={

        <Link to={backTo} className={`${ui.btnOutline} inline-flex items-center gap-1`}>

          <ArrowLeft className="h-4 w-4" aria-hidden />

          Back

        </Link>

      }

    >

      {loading ? (

        <p className="p-10 text-center text-slate-500">Loading…</p>

      ) : error ? (

        <div className="space-y-4 p-6">

          <p className="text-sm text-red-700">{error}</p>

          <Link to={backTo} className={ui.btnOutline}>

            Back

          </Link>

        </div>

      ) : isPreviousDues ? (

        <div className={`${ui.card} p-6 sm:p-8`}>

          <RecordPreviousDuesPaymentForm

            personId={personId}

            personName={displayName}

            balance={previousBalance}

            throughYear={previousThroughYear}

            notes={previousNotes}

            onCancel={() => navigate(backTo)}

            onSaved={() => navigate(backTo, { replace: true })}

          />

        </div>

      ) : due ? (

        <div className={`${ui.card} p-6 sm:p-8`}>

          <RecordDuePaymentForm

            due={{

              ...due,

              personName: displayName,

              person: due.person ?? { id: personId, fullName: displayName },

            }}

            prefillAmount={navState?.prefillAmount}

            prefillChoice={navState?.prefillChoice}

            onCancel={() => navigate(backTo)}

            onSaved={() => navigate(backTo, { replace: true })}

          />

        </div>

      ) : null}

    </ChurchMgmtPageShell>

  );

}

