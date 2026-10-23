import type { DuesListResponse } from '@/modules/church-management/api/fees';
import { StatCard } from '@/modules/church-management/components/dashboard/StatCard';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FeesSummaryCards({ summary }: { summary: DuesListResponse | null }) {
  if (!summary) return null;

  const items = [
    {
      label: 'Collected',
      value: `₹${formatCurrency(summary.totalPaid)}`,
      hint: `${summary.paidCount} paid rows`,
    },
    {
      label: 'Outstanding',
      value: `₹${formatCurrency(summary.totalUnpaid)}`,
      hint: `${summary.unpaidCount} unpaid rows`,
    },
    {
      label: 'Families with unpaid',
      value: String(summary.familiesWithUnpaid),
      hint: `Calendar year ${summary.year}`,
    },
    {
      label: 'Total records',
      value: String(summary.totalRows),
      hint: 'All due types',
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className={ui.sectionTitle}>Church dues ({summary.year})</h2>
      <div className={ui.statGrid}>
        {items.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} hint={item.hint} />
        ))}
      </div>
    </section>
  );
}
