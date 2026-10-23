/** Format API event_date (YYYY-MM-DD) for display. */
export function formatEventDateLabel(eventDate: string | null | undefined): string {
  if (!eventDate?.trim()) return '';
  const parts = eventDate.trim().slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return '';
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Value for <input type="date" /> from API row. */
export function eventDateInputValue(eventDate: string | null | undefined): string {
  if (!eventDate?.trim()) return '';
  const v = eventDate.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
}
