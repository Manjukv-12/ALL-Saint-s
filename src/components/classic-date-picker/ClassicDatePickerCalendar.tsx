import { useEffect, useMemo, useState } from 'react';
import { addMonths, addYears, format } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  buildDayGrid,
  buildMonthGrid,
  buildYearGrid,
  clampDate,
  formatMonthYear,
  formatYearRange,
  isDateDisabled,
  isSameDay,
  isSameMonth,
  isToday,
  MONTHS_SHORT,
  startOfMonth,
  type ClassicPickerView,
  WEEKDAYS,
  yearPageStart,
} from '@/components/classic-date-picker/classicDatePickerUtils';

type Props = {
  selected?: Date;
  minDate: Date;
  maxDate: Date;
  browseDate: Date;
  onBrowseDateChange: (date: Date) => void;
  onSelect: (date: Date) => void;
  /** Start in year view — helpful for date of birth. */
  preferYearView?: boolean;
};

const gridBtn =
  'flex h-10 items-center justify-center rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40 disabled:cursor-not-allowed disabled:opacity-35';

const modeChip =
  'rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition';

export function ClassicDatePickerCalendar({
  selected,
  minDate,
  maxDate,
  browseDate,
  onBrowseDateChange,
  onSelect,
  preferYearView = false,
}: Props) {
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const [view, setView] = useState<ClassicPickerView>(preferYearView ? 'years' : 'days');
  const [yearPage, setYearPage] = useState(() => yearPageStart(browseDate.getFullYear(), minYear));
  const [jumpYear, setJumpYear] = useState(String(browseDate.getFullYear()));

  useEffect(() => {
    setYearPage(yearPageStart(browseDate.getFullYear(), minYear));
    setJumpYear(String(browseDate.getFullYear()));
  }, [browseDate, minYear]);

  const viewMonth = useMemo(() => startOfMonth(browseDate), [browseDate]);
  const days = useMemo(() => buildDayGrid(viewMonth), [viewMonth]);
  const months = useMemo(
    () => buildMonthGrid(viewMonth.getFullYear(), minDate, maxDate),
    [viewMonth, minDate, maxDate]
  );
  const years = useMemo(
    () => buildYearGrid(yearPage, minYear, maxYear),
    [yearPage, minYear, maxYear]
  );
  const yearPageEnd = Math.min(yearPage + 11, maxYear);

  const decades = useMemo(() => {
    const list: number[] = [];
    const start = Math.floor(minYear / 10) * 10;
    for (let d = start; d <= maxYear; d += 10) list.push(d);
    return list;
  }, [minYear, maxYear]);

  const goPrev = () => {
    if (view === 'days') onBrowseDateChange(addMonths(viewMonth, -1));
    else if (view === 'months') onBrowseDateChange(addYears(viewMonth, -1));
    else setYearPage((p) => Math.max(minYear, p - 12));
  };

  const goNext = () => {
    if (view === 'days') onBrowseDateChange(addMonths(viewMonth, 1));
    else if (view === 'months') onBrowseDateChange(addYears(viewMonth, 1));
    else setYearPage((p) => Math.min(Math.max(minYear, maxYear - 11), p + 12));
  };

  const jumpDecade = (delta: number) => {
    setYearPage((p) => {
      const next = p + delta * 10;
      if (delta < 0) return Math.max(minYear, next);
      return Math.min(Math.max(minYear, maxYear - 11), next);
    });
  };

  const canGoPrev =
    view === 'years'
      ? yearPage > minYear
      : view === 'months'
        ? viewMonth.getFullYear() > minYear
        : viewMonth.getFullYear() > minYear ||
          (viewMonth.getFullYear() === minYear && viewMonth.getMonth() > minDate.getMonth());

  const canGoNext =
    view === 'years'
      ? yearPage + 12 <= maxYear + 1
      : view === 'months'
        ? viewMonth.getFullYear() < maxYear
        : viewMonth.getFullYear() < maxYear ||
          (viewMonth.getFullYear() === maxYear && viewMonth.getMonth() < maxDate.getMonth());

  const headerLabel =
    view === 'days'
      ? formatMonthYear(viewMonth)
      : view === 'months'
        ? String(viewMonth.getFullYear())
        : formatYearRange(yearPage, yearPageEnd);

  const applyJumpYear = () => {
    const y = Number(jumpYear);
    if (!Number.isFinite(y) || y < minYear || y > maxYear) return;
    onBrowseDateChange(clampDate(new Date(y, viewMonth.getMonth(), 1), minDate, maxDate));
    setYearPage(yearPageStart(y, minYear));
    setView('months');
  };

  return (
    <div className="classic-date-picker w-[20rem] select-none overflow-hidden bg-[#faf8f5] dark:bg-zinc-900">
      <div className="border-b border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))] px-3 py-3 text-white">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/75">
          {view === 'days' ? 'Pick a day' : view === 'months' ? 'Pick a month' : 'Pick a year'}
        </p>
        <p className="mt-0.5 font-serif text-xl font-semibold leading-tight tracking-tight">
          {headerLabel}
        </p>
        <p className="mt-1 text-xs text-white/70">
          {view === 'years'
            ? 'Tap a year, then month, then day'
            : view === 'months'
              ? 'Tap a month, then pick the day'
              : 'Or switch to Year to jump back quickly'}
        </p>
      </div>

      {/* Day / Month / Year mode switch — always visible */}
      <div className="flex items-center gap-1 border-b border-slate-200/80 px-2 py-2 dark:border-zinc-700">
        {(
          [
            { id: 'days' as const, label: 'Day' },
            { id: 'months' as const, label: 'Month' },
            { id: 'years' as const, label: 'Year' },
          ] as const
        ).map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => {
              if (mode.id === 'years') {
                setYearPage(yearPageStart(viewMonth.getFullYear(), minYear));
              }
              setView(mode.id);
            }}
            className={cn(
              modeChip,
              'flex-1',
              view === mode.id
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-b border-slate-200/80 px-1 py-1.5 dark:border-zinc-700">
        <div className="flex items-center">
          {view === 'years' && (
            <button
              type="button"
              aria-label="Previous decade"
              disabled={yearPage <= minYear}
              onClick={() => jumpDecade(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 transition hover:bg-white disabled:opacity-30 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            aria-label="Previous"
            disabled={!canGoPrev}
            onClick={goPrev}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 transition hover:bg-white disabled:opacity-30 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <span className="px-1 text-center text-xs font-semibold text-slate-600 dark:text-zinc-300">
          {view === 'days'
            ? format(viewMonth, 'MMM yyyy')
            : view === 'months'
              ? viewMonth.getFullYear()
              : `${yearPage}–${yearPageEnd}`}
        </span>
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Next"
            disabled={!canGoNext}
            onClick={goNext}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 transition hover:bg-white disabled:opacity-30 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {view === 'years' && (
            <button
              type="button"
              aria-label="Next decade"
              disabled={yearPage + 12 > maxYear}
              onClick={() => jumpDecade(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 transition hover:bg-white disabled:opacity-30 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3">
        {view === 'days' && (
          <>
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const outside = !isSameMonth(day, viewMonth);
                const disabled = isDateDisabled(day, minDate, maxDate);
                const selectedDay = selected ? isSameDay(day, selected) : false;
                const today = isToday(day);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(day)}
                    className={cn(
                      gridBtn,
                      'h-9 w-9 p-0',
                      outside && 'text-slate-400 dark:text-zinc-500',
                      !outside &&
                        !selectedDay &&
                        'text-slate-800 hover:bg-white dark:text-zinc-100 dark:hover:bg-zinc-800',
                      today && !selectedDay && 'ring-1 ring-[hsl(var(--primary))]/40',
                      selectedDay &&
                        'bg-[hsl(var(--primary))] text-white shadow-sm hover:bg-[hsl(var(--primary-hover))]'
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {view === 'months' && (
          <div className="grid grid-cols-3 gap-2">
            {months.map(({ month, disabled }) => {
              const active =
                selected &&
                selected.getFullYear() === viewMonth.getFullYear() &&
                selected.getMonth() === month;
              return (
                <button
                  key={month}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onBrowseDateChange(new Date(viewMonth.getFullYear(), month, 1));
                    setView('days');
                  }}
                  className={cn(
                    gridBtn,
                    active
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'border border-transparent bg-white text-slate-800 hover:border-[hsl(var(--primary))]/30 hover:shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                  )}
                >
                  {MONTHS_SHORT[month]}
                </button>
              );
            })}
          </div>
        )}

        {view === 'years' && (
          <div className="space-y-3">
            {decades.length > 2 && (
              <div className="flex flex-wrap gap-1">
                {decades.map((decade) => {
                  const inPage = yearPage <= decade + 9 && yearPage + 11 >= decade;
                  return (
                    <button
                      key={decade}
                      type="button"
                      onClick={() => setYearPage(yearPageStart(decade, minYear))}
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[11px] font-semibold',
                        inPage
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-300'
                      )}
                    >
                      {decade}s
                    </button>
                  );
                })}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {years.map((year) => {
                const active = selected?.getFullYear() === year;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      onBrowseDateChange(clampDate(new Date(year, 0, 1), minDate, maxDate));
                      setView('months');
                    }}
                    className={cn(
                      gridBtn,
                      'font-serif text-base',
                      active
                        ? 'bg-[hsl(var(--primary))] text-white'
                        : 'border border-transparent bg-white text-slate-800 hover:border-[hsl(var(--primary))]/30 hover:shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                    )}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                applyJumpYear();
              }}
            >
              <label className="sr-only" htmlFor="classic-jump-year">
                Jump to year
              </label>
              <input
                id="classic-jump-year"
                type="number"
                min={minYear}
                max={maxYear}
                value={jumpYear}
                onChange={(e) => setJumpYear(e.target.value)}
                className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder={`Year (${minYear}–${maxYear})`}
              />
              <button
                type="submit"
                className="h-9 shrink-0 rounded-md bg-[hsl(var(--primary))] px-3 text-sm font-semibold text-white"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200/80 px-3 py-2 text-[11px] leading-relaxed text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
        Use <strong>Year</strong> to jump to past decades, then Month → Day.
      </div>
    </div>
  );
}
