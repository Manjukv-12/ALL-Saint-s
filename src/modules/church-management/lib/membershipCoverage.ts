import {
  formatRupee,
  membershipMonthlyRate,
} from '@/modules/church-management/lib/dueAmountValidation';

/** How a month appears on the payment grid. */
export type MonthPayStatus =
  | 'paid'
  | 'pending'
  | 'cover-full'
  | 'cover-partial'
  | 'future';

export type CoverageMonth = {
  year: number;
  month: number;
  label: string;
  fullLabel: string;
  applied: number;
  due: number;
  status: MonthPayStatus;
  /** @deprecated use status === 'cover-full' */
  fullyPaid: boolean;
  /** @deprecated use status === 'cover-partial' */
  partial: boolean;
};

export type CoverageYearGroup = {
  year: number;
  annualRate: number;
  monthlyRate: number;
  months: CoverageMonth[];
  fromMonth: number;
  toMonth: number;
};

export type MembershipCoveragePreview = {
  groups: CoverageYearGroup[];
  paidUntilLabel: string | null;
  totalApplied: number;
  leftover: number;
  summary: string;
  rangeLabel: string | null;
  /** Unpaid span from first due month through today. */
  pendingRangeLabel: string | null;
  pendingMonths: number;
};

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function ymAdd(year: number, month: number, delta: number): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

function ymIndex(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function monthLabel(year: number, month: number): string {
  return `${MONTH_SHORT[month - 1]} ${year}`;
}

/** Resolve annual rate for a calendar year. */
export function annualRateForYear(
  year: number,
  fallbackAnnual: number,
  yearRates?: Record<number, number> | null
): number {
  const override = yearRates?.[year];
  if (override != null && Number.isFinite(override) && override > 0) {
    return override;
  }
  return fallbackAnnual > 0 ? fallbackAnnual : 0;
}

/** Rupees needed to fully clear the next N months from the unpaid start. */
export function membershipAmountForMonths(
  monthlyRate: number,
  months: number,
  startMonthRemaining?: number
): number {
  const rate = Math.round(monthlyRate);
  const n = Math.max(1, Math.round(months));
  if (rate < 1) return 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    if (
      i === 0 &&
      startMonthRemaining != null &&
      startMonthRemaining > 0 &&
      startMonthRemaining < rate
    ) {
      total += Math.round(startMonthRemaining);
    } else {
      total += rate;
    }
  }
  return Math.round(total);
}

/**
 * Build month cards from first unpaid month → current month (pending),
 * then paint green/orange for how the typed amount divides across months.
 * Previous years are included when the unpaid start is earlier.
 */
export function previewMembershipCoverage(opts: {
  amountPaid: number;
  startYear: number;
  startMonth: number;
  startMonthRemaining?: number;
  fallbackAnnual: number;
  yearRates?: Record<number, number> | null;
  /** Defaults to today. */
  throughYear?: number;
  throughMonth?: number;
}): MembershipCoveragePreview {
  const now = new Date();
  const throughYear = opts.throughYear ?? now.getFullYear();
  const throughMonth = opts.throughMonth ?? now.getMonth() + 1;
  const startIdx = ymIndex(opts.startYear, opts.startMonth);
  const throughIdx = ymIndex(throughYear, throughMonth);

  const empty: MembershipCoveragePreview = {
    groups: [],
    paidUntilLabel: null,
    totalApplied: 0,
    leftover: Math.round(opts.amountPaid),
    summary: '',
    rangeLabel: null,
    pendingRangeLabel: null,
    pendingMonths: 0,
  };

  if (opts.startMonth < 1 || opts.startMonth > 12) {
    return empty;
  }

  let remaining = Math.max(0, Math.round(opts.amountPaid));
  let totalApplied = 0;
  let cursor = { year: opts.startYear, month: opts.startMonth };
  let guard = 0;
  const appliedByIdx = new Map<number, { applied: number; due: number }>();

  while (remaining >= 1 && guard < 120) {
    guard++;
    const annual = annualRateForYear(cursor.year, opts.fallbackAnnual, opts.yearRates);
    const monthly = membershipMonthlyRate(annual);
    if (monthly < 1) break;

    const isStart =
      cursor.year === opts.startYear &&
      cursor.month === opts.startMonth &&
      opts.startMonthRemaining != null &&
      opts.startMonthRemaining > 0;
    const due = isStart
      ? Math.min(monthly, Math.round(opts.startMonthRemaining!))
      : monthly;
    const applied = Math.min(remaining, due);
    if (applied < 1) break;

    appliedByIdx.set(ymIndex(cursor.year, cursor.month), { applied, due });
    remaining -= applied;
    totalApplied += applied;

    if (applied >= due - 0.001) {
      cursor = ymAdd(cursor.year, cursor.month, 1);
    } else {
      break;
    }
  }

  const lastCoveredIdx =
    appliedByIdx.size > 0 ? Math.max(...appliedByIdx.keys()) : startIdx - 1;
  const endIdx = Math.max(throughIdx, lastCoveredIdx);
  const endYear = Math.floor(endIdx / 12);
  const startYear = opts.startYear;

  let pendingMonths = 0;
  const byYear = new Map<number, CoverageYearGroup>();

  for (let y = startYear; y <= endYear; y++) {
    const annual = annualRateForYear(y, opts.fallbackAnnual, opts.yearRates);
    const monthly = membershipMonthlyRate(annual);
    const group: CoverageYearGroup = {
      year: y,
      annualRate: annual,
      monthlyRate: monthly,
      months: [],
      fromMonth: 1,
      toMonth: 12,
    };

    for (let m = 1; m <= 12; m++) {
      const idx = ymIndex(y, m);
      const hit = appliedByIdx.get(idx);
      let status: MonthPayStatus;
      let applied = 0;
      let due = monthly;

      if (idx < startIdx) {
        status = 'paid';
        due = monthly;
      } else if (hit) {
        applied = hit.applied;
        due = hit.due;
        status = hit.applied >= hit.due - 0.001 ? 'cover-full' : 'cover-partial';
      } else if (idx <= throughIdx) {
        status = 'pending';
        pendingMonths++;
        if (
          y === opts.startYear &&
          m === opts.startMonth &&
          opts.startMonthRemaining != null &&
          opts.startMonthRemaining > 0
        ) {
          due = Math.min(monthly, Math.round(opts.startMonthRemaining));
        }
      } else {
        status = 'future';
      }

      group.months.push({
        year: y,
        month: m,
        label: MONTH_SHORT[m - 1],
        fullLabel: monthLabel(y, m),
        applied,
        due,
        status,
        fullyPaid: status === 'cover-full',
        partial: status === 'cover-partial',
      });
    }

    // Narrow displayed span labels to meaningful months for the header.
    const meaningful = group.months.filter((mm) => mm.status !== 'future' || mm.applied > 0);
    const firstM = meaningful[0]?.month ?? 1;
    const lastM = meaningful[meaningful.length - 1]?.month ?? 12;
    group.fromMonth = firstM;
    group.toMonth = lastM;
    byYear.set(y, group);
  }

  const groups = [...byYear.values()].sort((a, b) => a.year - b.year);

  const pendingStart = monthLabel(opts.startYear, opts.startMonth);
  const pendingEnd = monthLabel(throughYear, throughMonth);
  const pendingRangeLabel =
    startIdx <= throughIdx
      ? pendingStart === pendingEnd
        ? pendingStart
        : `${pendingStart} → ${pendingEnd}`
      : null;

  let lastFullLabel: string | null = null;
  let lastPartial: CoverageMonth | null = null;
  for (const g of groups) {
    for (const mm of g.months) {
      if (mm.status === 'cover-full') lastFullLabel = mm.fullLabel;
      if (mm.status === 'cover-partial') lastPartial = mm;
    }
  }

  const paidUntilLabel = lastPartial
    ? `${lastPartial.fullLabel} (part)`
    : lastFullLabel;

  const coverMonths = [...appliedByIdx.keys()].sort((a, b) => a - b);
  const firstCover = coverMonths[0];
  const lastCover = coverMonths[coverMonths.length - 1];
  const rangeLabel =
    firstCover != null && lastCover != null
      ? (() => {
          const a = { year: Math.floor(firstCover / 12), month: (firstCover % 12) + 1 };
          const b = { year: Math.floor(lastCover / 12), month: (lastCover % 12) + 1 };
          const al = monthLabel(a.year, a.month);
          const bl = monthLabel(b.year, b.month);
          return al === bl ? al : `${al} → ${bl}`;
        })()
      : null;

  let summary = '';
  if (pendingRangeLabel) {
    summary = `Unpaid to track: ${pendingRangeLabel} (${pendingMonths} month${
      pendingMonths === 1 ? '' : 's'
    }).`;
  }
  if (totalApplied >= 1 && rangeLabel) {
    if (lastPartial) {
      const need = Math.round(lastPartial.due - lastPartial.applied);
      summary += ` This payment covers ${rangeLabel}. Still need ${formatRupee(need)} to finish ${lastPartial.fullLabel}.`;
    } else {
      summary += ` This payment covers ${rangeLabel} (green).`;
    }
  } else if (totalApplied < 1 && pendingRangeLabel) {
    summary += ' Enter an amount to see which months turn green.';
  }

  return {
    groups,
    paidUntilLabel,
    totalApplied: Math.round(totalApplied),
    leftover: Math.round(remaining),
    summary: summary.trim(),
    rangeLabel,
    pendingRangeLabel,
    pendingMonths,
  };
}
