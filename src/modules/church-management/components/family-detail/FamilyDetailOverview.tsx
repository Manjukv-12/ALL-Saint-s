import type { Family } from '@/modules/church-management/api/types';
import { countActiveFamilyMembers } from '@/modules/church-management/lib/membershipType';
import { FamilyDetailPanel } from './FamilyDetailPanel';

interface FamilyDetailOverviewProps {
  family: Family;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const STAT_STYLES = [
  'border-l-4 border-indigo-500 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/50 dark:to-slate-900',
  'border-l-4 border-violet-500 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/50 dark:to-slate-900',
  'border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/50 dark:to-slate-900',
  'border-l-4 border-amber-500 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-slate-900',
];

export function FamilyDetailOverview({ family }: FamilyDetailOverviewProps) {
  const totalMembers = family._count?.members ?? countActiveFamilyMembers(family.members);
  const feeSummary = family.feeSummary;
  const year = new Date().getFullYear();

  const stats = [
    {
      label: 'Members',
      value: String(totalMembers),
      sub: 'Active in this household',
    },
    {
      label: 'Certificates',
      value: String(family._count?.certificates ?? 0),
      sub: 'Issued records',
    },
    {
      label: `Fees paid (${year})`,
      value: feeSummary
        ? `${feeSummary.membersPaid} / ${feeSummary.totalMembers || totalMembers}`
        : '—',
      sub: feeSummary?.totalPaid
        ? `₹${formatCurrency(feeSummary.totalPaid)} collected`
        : 'No payments yet',
    },
    {
      label: 'Status',
      value: family.status,
      sub: family.familyAccount
        ? `Login ${family.familyAccount.isActive ? 'active' : 'inactive'}`
        : 'No family login',
    },
  ];

  return (
    <FamilyDetailPanel title="Family summary" subtitle="Overview at a glance" accent="cyan">
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`rounded-xl p-4 shadow-sm ${STAT_STYLES[i % STAT_STYLES.length]}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{stat.sub}</p>
          </div>
        ))}
      </div>
      {family.address && (
        <div className="border-t border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/50 px-5 py-4 dark:border-indigo-900 dark:from-slate-900 dark:to-indigo-950/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
            Address
          </p>
          <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{family.address}</p>
        </div>
      )}
    </FamilyDetailPanel>
  );
}
