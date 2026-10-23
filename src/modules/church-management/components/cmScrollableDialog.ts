/** Shared max-height + top placement so church-mgmt alert dialogs can scroll. */
export const cmScrollableAlertDialogClass =
  'fixed left-1/2 top-[max(0.75rem,3dvh)] z-50 flex max-h-[min(94dvh,calc(100vh-1.5rem))] w-[calc(100%-1.5rem)] -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden border bg-background p-0 shadow-lg sm:rounded-lg';

/** Sticky dialog footer — keep Cancel / Save / Close visible while body scrolls. */
export const cmDialogFooterClass =
  'flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-900';
