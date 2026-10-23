import { ui } from '@/modules/church-management/lib/churchManagementTheme';

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className={ui.statCell}>
      <p className={ui.statLabel}>{label}</p>
      <p className={ui.statValue}>{value}</p>
      {hint && <p className={ui.statHint}>{hint}</p>}
    </div>
  );
}
