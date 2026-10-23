/** Focus and scroll the first invalid form control marked with data-field (or id edit-*). */
export function focusFirstInvalidField(
  fieldNames: string[],
  root: ParentNode | null = typeof document !== 'undefined' ? document : null
): void {
  if (!root) return;
  for (const name of fieldNames) {
    const el =
      root.querySelector<HTMLElement>(`[data-field="${name}"]`) ||
      root.querySelector<HTMLElement>(`#edit-${name}`);
    if (!el) continue;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      const focusable = el.matches('input, select, textarea, button')
        ? el
        : el.querySelector<HTMLElement>('input, select, textarea, button');
      focusable?.focus({ preventScroll: true });
    }, 180);
    return;
  }
}

export function firstFieldErrorMessage(
  errors: Record<string, string | undefined>,
  order: readonly string[]
): string | null {
  for (const key of order) {
    if (errors[key]) return errors[key]!;
  }
  return null;
}

export function fieldErrorClass(base: string, hasError?: boolean): string {
  if (!hasError) return base;
  return `${base} border-red-500 ring-2 ring-red-500/25 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500`;
}
