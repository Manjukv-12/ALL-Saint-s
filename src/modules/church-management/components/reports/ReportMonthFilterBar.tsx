import { Download } from 'lucide-react';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { REPORT_MONTH_OPTIONS } from '@/modules/church-management/lib/reportMonths';

type Props = {
  month: number;
  year: number;
  count: number;
  downloading: boolean;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onDownload: () => void;
};

export function ReportMonthFilterBar({
  month,
  year,
  count,
  downloading,
  onMonthChange,
  onYearChange,
  onDownload,
}: Props) {
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block w-full text-sm sm:w-auto">
          <span className="mb-1 block text-[hsl(var(--muted-foreground))]">Month</span>
          <select
            className={`${ui.select} w-full`}
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
          >
            {REPORT_MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block w-full text-sm sm:w-auto">
          <span className="mb-1 block text-[hsl(var(--muted-foreground))]">Year</span>
          <select
            className={`${ui.select} w-full`}
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <p className="pb-0 text-sm text-[hsl(var(--muted-foreground))] sm:pb-2.5">
          {count} {count === 1 ? 'record' : 'records'}
        </p>
      </div>
      <button
        type="button"
        className={`${ui.btnPrimary} w-full justify-center sm:w-auto`}
        disabled={downloading}
        onClick={onDownload}
      >
        <Download className="h-4 w-4" aria-hidden />
        {downloading ? 'Downloading…' : 'Download Excel'}
      </button>
    </div>
  );
}
