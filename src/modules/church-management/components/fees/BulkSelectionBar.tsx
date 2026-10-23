import { ui } from '@/modules/church-management/lib/churchManagementTheme';

type Props = {
  selectedCount: number;
  visibleCount: number;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  applying?: boolean;
  applyLabel: string;
  onToggleSelectAllVisible: () => void;
  onClear: () => void;
  onApply: () => void;
};

/** Sticky action strip when one or more persons are selected. */
export function BulkSelectionBar({
  selectedCount,
  visibleCount,
  allVisibleSelected,
  someVisibleSelected,
  applying,
  applyLabel,
  onToggleSelectAllVisible,
  onClear,
  onApply,
}: Props) {
  if (selectedCount < 1 && visibleCount < 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
      <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-200">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300"
          checked={allVisibleSelected && visibleCount > 0}
          ref={(el) => {
            if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected;
          }}
          onChange={() => onToggleSelectAllVisible()}
        />
        Select all on this page ({visibleCount})
      </label>
      <span className="text-sm text-slate-600 dark:text-zinc-300">
        <strong>{selectedCount}</strong> person{selectedCount === 1 ? '' : 's'} selected
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button type="button" className={ui.btnOutline} onClick={onClear} disabled={selectedCount < 1}>
          Clear
        </button>
        <button
          type="button"
          className={ui.btnPrimary}
          disabled={selectedCount < 1 || applying}
          onClick={onApply}
        >
          {applying ? 'Applying…' : applyLabel}
        </button>
      </div>
    </div>
  );
}
