import { useEffect, useMemo, useState } from 'react';
import { format, parse, isValid, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { ClassicDatePickerCalendar } from '@/components/classic-date-picker/ClassicDatePickerCalendar';
import {
  defaultBrowseDate,
  formatDisplayDate,
} from '@/components/classic-date-picker/classicDatePickerUtils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type DatePartsFieldProps = {
  value: string;
  onChange: (isoDate: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  /** Applied to the calendar trigger button (kept for existing call sites). */
  selectClassName?: string;
  /** Inclusive. Default 1920. */
  minYear?: number;
  /** Inclusive. Default current year + 1 (or current year when disableFuture). */
  maxYear?: number;
  /** When true, dates after today cannot be selected. */
  disableFuture?: boolean;
  /**
   * When empty, open the calendar around this many years from today
   * (e.g. -25 for date of birth).
   */
  defaultYearOffset?: number;
  /** Open on the year grid first — best for birth dates. */
  preferYearView?: boolean;
  'aria-label'?: string;
};

function parseIsoDate(value: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const parsed = parse(value.trim(), 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? startOfDay(parsed) : undefined;
}

function toIso(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Classic calendar date picker (popover). Value is ISO `yyyy-mm-dd`.
 * Year → month → day flow makes long ranges (e.g. date of birth) easy to pick.
 */
export function DatePartsField({
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  selectClassName = '',
  minYear = 1920,
  maxYear: maxYearProp,
  disableFuture = false,
  defaultYearOffset = 0,
  preferYearView = false,
  'aria-label': ariaLabel = 'Date',
}: DatePartsFieldProps) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxYear = maxYearProp ?? (disableFuture ? today.getFullYear() : today.getFullYear() + 1);
  const selected = useMemo(() => parseIsoDate(value), [value]);

  const fromDate = useMemo(() => new Date(minYear, 0, 1), [minYear]);
  const toDate = useMemo(() => {
    if (disableFuture) return today;
    return new Date(maxYear, 11, 31);
  }, [disableFuture, maxYear, today]);

  const initialBrowse = useMemo(
    () =>
      defaultBrowseDate({
        selected,
        minDate: fromDate,
        maxDate: toDate,
        defaultYearOffset,
      }),
    [selected, fromDate, toDate, defaultYearOffset]
  );

  const [browseDate, setBrowseDate] = useState(initialBrowse);

  useEffect(() => {
    if (open) {
      setBrowseDate(initialBrowse);
    }
  }, [open, initialBrowse]);

  const display = selected
    ? formatDisplayDate(selected)
    : required
      ? 'Select date *'
      : 'Select date';

  const todayInRange = today >= fromDate && today <= toDate;
  // Today is useful for payments / assigned dates; skip for birth-style year-first pickers.
  const showToday = todayInRange && !preferYearView;

  return (
    <div className={cn('w-full', className)}>
      <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-required={required || undefined}
            className={cn(
              'inline-flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-base text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800/80',
              !selected && 'text-slate-500 dark:text-zinc-400',
              selectClassName
            )}
          >
            <span className="truncate">{display}</span>
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto border-0 bg-transparent p-0 shadow-none" align="start" sideOffset={6}>
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-lg dark:border-zinc-700">
            <ClassicDatePickerCalendar
              key={open ? 'open' : 'closed'}
              selected={selected}
              minDate={fromDate}
              maxDate={toDate}
              browseDate={browseDate}
              onBrowseDateChange={setBrowseDate}
              preferYearView={preferYearView}
              onSelect={(date) => {
                onChange(toIso(date));
                setOpen(false);
              }}
            />
            {(showToday || !required) && (
              <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-[#faf8f5] px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                {!required && (
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-sm font-medium text-slate-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-800"
                    onClick={() => {
                      onChange('');
                      setOpen(false);
                    }}
                  >
                    Clear
                  </button>
                )}
                {showToday && (
                  <button
                    type="button"
                    className="ml-auto rounded-md bg-[hsl(var(--primary))] px-2.5 py-1 text-sm font-medium text-white"
                    onClick={() => {
                      if (today >= fromDate && today <= toDate) {
                        onChange(toIso(today));
                      }
                      setOpen(false);
                    }}
                  >
                    Today
                  </button>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
