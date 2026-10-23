import { Link } from 'react-router-dom';
import type { Member } from '@/modules/church-management/api/types';
import { isEligibleForMembershipFee } from '@/modules/church-management/lib/membershipEligibility';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { PreviousDuesStatusChip } from '@/modules/church-management/components/fees/PreviousDuesStatusChip';
import { previousDuesCoveredLabel } from '@/modules/church-management/lib/previousDues';
import { PREVIOUS_DUES_THROUGH_YEAR } from '@/modules/church-management/lib/feesYearPolicy';

function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function breakdownTitle(
  membership: number,
  other: number,
  paidUntil: string | null
): string {
  const parts: string[] = [];
  if (membership > 0.001) {
    parts.push(`Membership ${formatInr(membership)} (through this month)`);
  } else if (paidUntil) {
    parts.push(`Membership paid until ${paidUntil}`);
  }
  if (other > 0.001) {
    parts.push(`Other dues ${formatInr(other)}`);
  }
  if (parts.length === 0) {
    return 'No outstanding dues to church';
  }
  return parts.join(' · ');
}

function previousDuesTitle(member: Member): string | null {
  if (member.hasPreviousDues && member.previousDuesAmount != null && member.previousDuesAmount > 0) {
    return `Profile: previous dues through ${member.previousDuesThroughYear ?? PREVIOUS_DUES_THROUGH_YEAR} (₹${Math.round(member.previousDuesAmount)})`;
  }
  if (member.hasPreviousDues === false) {
    return previousDuesCoveredLabel(member.previousDuesThroughYear ?? PREVIOUS_DUES_THROUGH_YEAR);
  }
  return null;
}

type Props = {
  member: Member;
  year: number;
  familyId?: string;
  familyCode?: string;
};

/**
 * Shows total outstanding dues to church (membership + any other assigned dues).
 * "Until …" only when membership is current and nothing else is owed.
 * Click opens the person fee details page.
 */
export function MemberDuesCell({ member, year, familyId, familyCode }: Props) {
  const subStatus = member.subscriptionStatus;
  const dues = member.duesOutstanding;
  const eligible =
    subStatus?.eligible !== undefined
      ? subStatus.eligible
      : isEligibleForMembershipFee(member.dateOfBirth);

  const subscriptionFee = member.membershipFees?.find(
    (f) => f.year === year && f.dueType?.code === 'SUBSCRIPTION'
  );

  const hasDueSetup =
    !!subscriptionFee ||
    subStatus?.state === 'UNPAID' ||
    subStatus?.state === 'PAID' ||
    (dues != null &&
      (dues.totalOutstanding > 0.001 ||
        dues.otherOutstanding > 0.001 ||
        dues.membershipOutstanding > 0.001));

  const feeState = {
    personName: member.fullName,
    familyId: familyId || member.familyId,
    familyCode,
    returnTo: familyId ? churchMgmtPath('families', familyId) : undefined,
  };
  const feeTo = churchMgmtPath('fees', 'people', member.id);

  if (!hasDueSetup) {
    return (
      <Link
        to={feeTo}
        state={feeState}
        className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
        title={
          eligible
            ? 'Open fee details — no dues set up yet'
            : 'Open fee details — membership from age 18 (DOB required)'
        }
      >
        Fee details
      </Link>
    );
  }

  const paidUntil =
    subStatus?.paidUntilLabel ||
    subStatus?.paidUntil?.label ||
    null;
  const fallbackMembership = Number(
    subStatus?.arrearsAmount ?? subStatus?.amountDue ?? 0
  );
  const membershipOutstanding = Number(
    dues?.membershipOutstanding ?? fallbackMembership
  );
  const otherOutstanding = Number(dues?.otherOutstanding ?? 0);
  const totalOutstanding = Number(
    dues?.totalOutstanding ?? membershipOutstanding + otherOutstanding
  );
  const title = breakdownTitle(membershipOutstanding, otherOutstanding, paidUntil);
  const prevTitle = previousDuesTitle(member);
  const fullTitle = [title, prevTitle].filter(Boolean).join(' · ');

  let summaryClass = 'text-zinc-700 dark:text-zinc-300';
  let summaryText = 'Paid';
  if (totalOutstanding > 0.001) {
    summaryClass = 'text-amber-800 dark:text-amber-200';
    if (paidUntil && membershipOutstanding < 0.001) {
      summaryText = `Until ${paidUntil} · Due ${formatInr(otherOutstanding)}`;
    } else if (paidUntil && membershipOutstanding > 0.001) {
      summaryText = `Until ${paidUntil} · Due ${formatInr(totalOutstanding)}`;
    } else {
      summaryText = `${formatInr(totalOutstanding)} · Unpaid`;
    }
  } else if (paidUntil) {
    summaryText = `Until ${paidUntil}`;
  }

  return (
    <div className="space-y-1">
      <Link
        to={feeTo}
        state={feeState}
        className={`text-sm hover:underline ${summaryClass}`}
        title={`${fullTitle} — open fee details`}
      >
        {summaryText}
      </Link>
      {member.hasPreviousDues !== undefined ? (
        <PreviousDuesStatusChip
          hasPreviousDues={member.hasPreviousDues}
          amount={member.previousDuesAmount}
          throughYear={member.previousDuesThroughYear}
        />
      ) : null}
    </div>
  );
}
