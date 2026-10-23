export type AmountCheck = {
  needsReentry: boolean;
  warnings: string[];
};

export type PaymentHintLevel = 'ok' | 'exact' | 'under' | 'over' | 'high';

export type PaymentAmountCheck = AmountCheck & {
  remaining: number;
  excess: number;
  level: PaymentHintLevel;
};

export function formatRupee(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRupeeExact(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Annual → true monthly due (whole rupees). ₹1000 → ₹83.
 */
export function membershipMonthlyRate(annualRate: number): number {
  if (!Number.isFinite(annualRate) || annualRate <= 0) return 0;
  return Math.max(1, Math.round(annualRate / 12));
}

/**
 * Convenient round pay amount (nearest ₹50 up). ₹83 → ₹100.
 */
export function membershipRoundPayUnit(monthlyRate: number): number {
  const m = Math.max(1, Math.round(monthlyRate));
  return Math.max(50, Math.ceil(m / 50) * 50);
}

/** Amount to finish calendar year from next unpaid / partial month. */
export function membershipCompleteYearAmount(
  monthlyRate: number,
  nextYear: number,
  nextMonth: number,
  forYear: number,
  nextMonthRemaining?: number
): { months: number; amount: number } | null {
  if (monthlyRate < 1) return null;
  const nextIdx = nextYear * 12 + (nextMonth - 1);
  const yearEndIdx = forYear * 12 + 11;
  const yearStartIdx = forYear * 12;
  if (nextIdx > yearEndIdx) return null;
  const startIdx = Math.max(nextIdx, yearStartIdx);
  let amount = 0;
  for (let idx = startIdx; idx <= yearEndIdx; idx++) {
    if (idx === nextIdx && nextMonthRemaining != null && nextMonthRemaining >= 0) {
      amount += nextMonthRemaining;
    } else {
      amount += monthlyRate;
    }
  }
  amount = Math.round(amount);
  if (amount < 1) return null;
  const months = Math.max(1, Math.ceil(amount / monthlyRate));
  return { months, amount };
}

/**
 * Membership: any whole-rupee payment. Keep messages short for church staff.
 */
export function checkWholeMonthPayment(
  amountPaid: number,
  monthlyRate: number
): PaymentAmountCheck & { months: number; expectedAmount: number } {
  const empty = {
    needsReentry: false,
    warnings: [] as string[],
    remaining: 0,
    excess: 0,
    level: 'ok' as PaymentHintLevel,
    months: 0,
    expectedAmount: 0,
  };
  if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
    return empty;
  }
  const rate = Math.round(monthlyRate);
  const paid = Math.round(amountPaid);

  if (rate < 1) {
    return {
      ...empty,
      needsReentry: true,
      level: 'high',
      warnings: ['Membership amount is not set. Ask an admin to set the yearly rate.'],
    };
  }

  if (paid < 1) {
    return {
      needsReentry: true,
      warnings: ['Enter an amount of at least ₹1.'],
      remaining: membershipRoundPayUnit(rate),
      excess: 0,
      level: 'under',
      months: 0,
      expectedAmount: membershipRoundPayUnit(rate),
    };
  }

  const monthsApprox = Math.max(1, Math.floor(paid / rate));

  if (paid >= 50_000) {
    return {
      needsReentry: true,
      warnings: [`${formatRupee(paid)} looks very high — please check for an extra zero.`],
      remaining: 0,
      excess: 0,
      level: 'high',
      months: monthsApprox,
      expectedAmount: paid,
    };
  }

  // No long math explanations here — the payment guide shows a plain summary.
  return {
    needsReentry: false,
    warnings: [],
    remaining: 0,
    excess: 0,
    level: 'exact',
    months: monthsApprox,
    expectedAmount: paid,
  };
}

/** Flag amounts that look like typos (extra zero, far from usual). */
export function checkDueAmount(
  amount: number,
  expectedAmount?: number | null
): AmountCheck {
  const warnings: string[] = [];
  let needsReentry = false;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { needsReentry: false, warnings: [] };
  }

  if (amount >= 50_000) {
    warnings.push(`${formatRupee(amount)} is unusually high. Please verify carefully.`);
    needsReentry = true;
  }

  const expected = expectedAmount ?? 0;
  if (expected > 0) {
    const ratio = amount / expected;
    if (ratio >= 5) {
      warnings.push(
        `This is about ${Math.round(ratio)}× the usual ${formatRupee(expected)}. Check for an extra zero.`
      );
      needsReentry = true;
    } else if (ratio >= 2) {
      warnings.push(`Higher than the usual ${formatRupee(expected)} for this due type.`);
      needsReentry = true;
    } else if (ratio <= 0.25 && amount > 0) {
      warnings.push(`Much lower than the usual ${formatRupee(expected)}.`);
      needsReentry = true;
    }
  }

  return { needsReentry, warnings };
}

/**
 * Amount due must not go below amount already collected.
 * Raising due is allowed (remaining balance increases).
 */
export function checkAmountDueAgainstPaid(
  amountDue: number,
  amountPaid: number
): { ok: boolean; error?: string; minDue: number } {
  const due = Math.round((Number(amountDue) || 0) * 100) / 100;
  const paid = Math.round((Number(amountPaid) || 0) * 100) / 100;
  const minDue = Math.max(0, paid);
  if (!Number.isFinite(due) || due < 0) {
    return { ok: false, error: 'Enter a valid amount due', minDue };
  }
  if (paid > 0.001 && due + 0.001 < paid) {
    return {
      ok: false,
      error: `Amount due cannot be less than amount already paid (${formatRupee(paid)}). Raise the due or keep it at least ${formatRupee(paid)}.`,
      minDue,
    };
  }
  return { ok: true, minDue };
}

export function checkPaymentAmount(
  amountPaid: number,
  amountDue: number,
  alreadyPaid = 0
): PaymentAmountCheck {
  const warnings: string[] = [];
  let needsReentry = false;
  const remaining = Math.max(0, Math.round((amountDue - alreadyPaid) * 100) / 100);
  let excess = 0;
  let level: PaymentHintLevel = 'ok';

  if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
    return { needsReentry: false, warnings: [], remaining, excess: 0, level: 'ok' };
  }

  if (amountPaid >= 50_000) {
    warnings.push(`${formatRupee(amountPaid)} is unusually high for a single payment.`);
    needsReentry = true;
    level = 'high';
  }

  if (remaining > 0 && amountPaid > remaining + 0.001) {
    excess = Math.round((amountPaid - remaining) * 100) / 100;
    warnings.push(
      `Excess ${formatRupee(excess)} — paying more than remaining due (${formatRupee(remaining)}).`
    );
    needsReentry = true;
    level = amountPaid >= remaining * 2 ? 'high' : 'over';
  } else if (remaining > 0 && Math.abs(amountPaid - remaining) < 0.001) {
    level = 'exact';
  } else if (remaining > 0 && amountPaid < remaining) {
    level = 'under';
    warnings.push(
      `Partial payment — remaining after this will be ${formatRupee(remaining - amountPaid)}.`
    );
  }

  return { needsReentry, warnings, remaining, excess, level };
}

export function paymentHintClass(level: PaymentHintLevel): string {
  switch (level) {
    case 'exact':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900';
    case 'under':
      return 'border-sky-200 bg-sky-50 text-sky-900';
    case 'over':
      return 'border-amber-300 bg-amber-50 text-amber-950';
    case 'high':
      return 'border-red-300 bg-red-50 text-red-900';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}
