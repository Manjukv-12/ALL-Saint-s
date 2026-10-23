import { birthYearOptions } from '@/modules/church-management/lib/birthYearRange';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

type Props = {
  fromYear: string;
  toYear: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  selectClassName?: string;
};

/** Birth year range on Members page (uses DOB or approximate birth years on file). */
export function MembersBirthYearFilter({
  fromYear,
  toYear,
  onFromChange,
  onToChange,
  selectClassName,
}: Props) {
  const years = birthYearOptions();
  const selectClass = selectClassName ?? `${ui.select} h-10 w-full sm:min-w-[7.5rem]`;

  return (
    <div
      className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
      role="group"
      aria-label="Filter by birth year"
    >
      <select
        value={fromYear}
        onChange={(e) => onFromChange(e.target.value)}
        className={selectClass}
        aria-label="Birth year from"
      >
        <option value="">Birth year from</option>
        {years.map((y) => (
          <option key={`from-${y}`} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
      <span className="hidden text-sm text-slate-500 sm:inline" aria-hidden>
        to
      </span>
      <select
        value={toYear}
        onChange={(e) => onToChange(e.target.value)}
        className={selectClass}
        aria-label="Birth year to"
      >
        <option value="">Birth year to</option>
        {years.map((y) => (
          <option key={`to-${y}`} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
