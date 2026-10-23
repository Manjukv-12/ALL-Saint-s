import type { BirthdayReportItem } from '@/modules/church-management/api/reports';
import { DirectoryStyleReportTable } from '@/modules/church-management/components/reports/DirectoryStyleReportTable';

type Props = {
  items: BirthdayReportItem[];
  loading: boolean;
  monthName: string;
};

export function BirthdayReportTable({ items, loading, monthName }: Props) {
  return (
    <DirectoryStyleReportTable
      items={items}
      loading={loading}
      loadingLabel="Loading birthdays…"
      emptyLabel="No birthdays found for this month."
      title={`Birthdays in ${monthName}`}
    />
  );
}
