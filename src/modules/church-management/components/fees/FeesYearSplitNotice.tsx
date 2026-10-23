import { feesYearSplitUserGuide } from '@/modules/church-management/lib/feesYearPolicy';

type Props = {
  className?: string;
  /** Emphasise profile side vs fees page side. */
  focus?: 'fees' | 'profile' | 'previous';
};

export function FeesYearSplitNotice({ className = '', focus = 'fees' }: Props) {
  const guide = feesYearSplitUserGuide();

  return (
    <div
      role="note"
      className={`rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200 ${className}`}
    >
      {focus === 'profile' ? (
        <p className="m-0">
          <strong className="font-semibold text-slate-900 dark:text-zinc-100">Member profile:</strong>{' '}
          {guide}
        </p>
      ) : focus === 'previous' ? (
        <p className="m-0">
          <strong className="font-semibold text-slate-900 dark:text-zinc-100">Previous dues list</strong>{' '}
          — {guide}
        </p>
      ) : (
        <p className="m-0">
          <strong className="font-semibold text-slate-900 dark:text-zinc-100">Fees &amp; dues:</strong>{' '}
          {guide}
        </p>
      )}
    </div>
  );
}
