import type { AnniversaryReportItem } from '@/modules/church-management/api/reports';
import { DirectoryStyleReportTable } from '@/modules/church-management/components/reports/DirectoryStyleReportTable';

type Props = {
  items: AnniversaryReportItem[];
  loading: boolean;
  monthName: string;
};

function anniversaryDisplayName(row: AnniversaryReportItem): string {
  const fromApi = row.fullName?.trim();
  if (fromApi?.includes('&')) return fromApi;

  const husband = row.husbandName?.trim();
  const wife = row.wifeName?.trim() || row.spouseName?.trim();
  if (husband && wife) return `${husband} & ${wife}`;
  if (wife && fromApi) return `${fromApi} & ${wife}`;
  return fromApi || husband || wife || '';
}

export function AnniversaryReportTable({ items, loading, monthName }: Props) {
  const rows = items.map((row) => ({
    ...row,
    fullName: anniversaryDisplayName(row),
  }));

  return (
    <DirectoryStyleReportTable
      items={rows}
      loading={loading}
      loadingLabel="Loading anniversaries…"
      emptyLabel="No wedding anniversaries found for this month."
      title={`Wedding anniversaries in ${monthName}`}
      nameColumnLabel="Husband & Wife"
    />
  );
}
