import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export type ClassicPickerView = 'days' | 'months' | 'years';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export function clampDate(date: Date, min: Date, max: Date): Date {
  const d = startOfDay(date);
  if (isBefore(d, min)) return min;
  if (isAfter(d, max)) return max;
  return d;
}

export function defaultBrowseDate(params: {
  selected?: Date;
  minDate: Date;
  maxDate: Date;
  defaultYearOffset?: number;
}): Date {
  const { selected, minDate, maxDate, defaultYearOffset = 0 } = params;
  if (selected) return startOfMonth(selected);

  const anchor = addYears(startOfDay(new Date()), defaultYearOffset);
  const clamped = clampDate(anchor, minDate, maxDate);
  return startOfMonth(clamped);
}

export function yearsPerPage(minYear: number, maxYear: number): number {
  return Math.min(12, Math.max(1, maxYear - minYear + 1));
}

export function yearPageStart(viewYear: number, minYear: number, pageSize = 12): number {
  const maxStart = Math.max(minYear, viewYear - pageSize + 1);
  let start = Math.floor(viewYear / pageSize) * pageSize;
  if (start < minYear) start = minYear;
  if (start > maxStart) start = maxStart;
  return start;
}

export function buildYearGrid(startYear: number, minYear: number, maxYear: number, pageSize = 12): number[] {
  const years: number[] = [];
  for (let y = startYear; y < startYear + pageSize && y <= maxYear; y += 1) {
    if (y >= minYear) years.push(y);
  }
  return years;
}

export function buildMonthGrid(year: number, minDate: Date, maxDate: Date): { month: number; disabled: boolean }[] {
  return MONTHS_SHORT.map((_, index) => {
    const monthStart = new Date(year, index, 1);
    const monthEnd = endOfMonth(monthStart);
    const disabled = isAfter(monthStart, maxDate) || isBefore(monthEnd, minDate);
    return { month: index, disabled };
  });
}

export function buildDayGrid(viewMonth: Date): Date[] {
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function isDateDisabled(date: Date, minDate: Date, maxDate: Date): boolean {
  const d = startOfDay(date);
  return isBefore(d, minDate) || isAfter(d, maxDate);
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

export function formatYearRange(start: number, end: number): string {
  return `${start} – ${end}`;
}

export { WEEKDAYS, MONTHS_SHORT, isSameDay, isSameMonth, isToday, startOfMonth };
