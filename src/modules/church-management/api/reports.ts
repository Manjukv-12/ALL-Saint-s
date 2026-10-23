import { apiClient } from './client';
import { downloadChurchMgmtXlsx } from '@/modules/church-management/lib/downloadXlsx';

export type ReportKind = 'birthdays' | 'anniversaries';

export interface BirthdayReportItem {
  id: string;
  fullName: string;
  gender?: string | null;
  relationship?: string | null;
  contactNumber?: string | null;
  dateOfBirth?: string | null;
  day?: number | null;
  ageTurning?: number | null;
  familyId?: string | null;
  familyCode?: string | null;
  houseName?: string | null;
  houseAddress?: string | null;
}

export interface AnniversaryReportItem {
  id: string;
  memberIds?: string[];
  fullName: string;
  husbandName?: string | null;
  wifeName?: string | null;
  gender?: string | null;
  relationship?: string | null;
  spouseName?: string | null;
  contactNumber?: string | null;
  dateOfWedding?: string | null;
  day?: number | null;
  yearsMarried?: number | null;
  familyId?: string | null;
  familyCode?: string | null;
  houseName?: string | null;
  houseAddress?: string | null;
}

export interface MonthlyReportResponse<T> {
  type: ReportKind;
  month: number;
  monthName: string;
  year: number;
  count: number;
  items: T[];
}

function reportQuery(month: number, year?: number, format?: 'xlsx'): string {
  const params = new URLSearchParams();
  params.set('month', String(month));
  if (year != null) params.set('year', String(year));
  if (format) params.set('format', format);
  return params.toString();
}

async function downloadXlsx(kind: ReportKind, month: number, year: number): Promise<void> {
  const qs = reportQuery(month, year, 'xlsx');
  await downloadChurchMgmtXlsx(
    `/api/church-management/reports/${kind}?${qs}`,
    `church-${kind}-${month}-${year}.xlsx`
  );
}

export const reportsApi = {
  async getBirthdays(month: number, year?: number) {
    const qs = reportQuery(month, year);
    return apiClient.get<MonthlyReportResponse<BirthdayReportItem>>(
      `/api/church-management/reports/birthdays?${qs}`
    );
  },

  async getAnniversaries(month: number, year?: number) {
    const qs = reportQuery(month, year);
    return apiClient.get<MonthlyReportResponse<AnniversaryReportItem>>(
      `/api/church-management/reports/anniversaries?${qs}`
    );
  },

  async downloadBirthdaysExcel(month: number, year: number) {
    return downloadXlsx('birthdays', month, year);
  },

  async downloadAnniversariesExcel(month: number, year: number) {
    return downloadXlsx('anniversaries', month, year);
  },
};
