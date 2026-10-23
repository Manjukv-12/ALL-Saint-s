/** Manual profile arrears cover calendar years through this year (inclusive). */
export const PREVIOUS_DUES_THROUGH_YEAR = 2025;

/** Fee rows and Filters & dues UI start from this calendar year. */
export const FEES_SYSTEM_START_YEAR = 2026;

const calendarYear = () => new Date().getFullYear();

/** Default year for Fees & dues filters and add-due forms. */
export function defaultFeesManagementYear(): number {
  return Math.max(FEES_SYSTEM_START_YEAR, calendarYear());
}

/** Year dropdown options for Fees & dues (2026 onward, plus a couple of future years). */
export function feesManagementYearOptions(): number[] {
  const start = FEES_SYSTEM_START_YEAR;
  const end = Math.max(start, calendarYear()) + 2;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** One-line guide shown on fees and member forms. */
export function feesYearSplitUserGuide(): string {
  return `${PREVIOUS_DUES_THROUGH_YEAR} and before = member profile. ${FEES_SYSTEM_START_YEAR} and after = Fees & dues page.`;
}
