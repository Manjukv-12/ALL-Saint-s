import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { ActionHint } from '@/modules/church-management/components/ActionHint';

const variants = {
  print: ui.rowActionPrint,
  download: ui.rowActionDownload,
  delete: ui.rowActionDelete,
  edit: ui.rowActionEdit,
  view: ui.rowActionView,
} as const;

const hintByVariant: Record<keyof typeof variants, string> = {
  print: 'Open print preview for this certificate.',
  download: 'Download this certificate file.',
  delete: 'Permanently remove this certificate record.',
  edit: 'Edit this item.',
  view: 'Open details for this item.',
};

export type RowActionVariant = keyof typeof variants;

interface RowActionButtonProps {
  variant: RowActionVariant;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  hint?: string;
}

export function RowActionButton({
  variant,
  icon: Icon,
  label,
  onClick,
  hint,
}: RowActionButtonProps) {
  return (
    <ActionHint hint={hint || hintByVariant[variant]}>
      <button
        type="button"
        onClick={onClick}
        className={`${ui.rowAction} ${variants[variant]}`}
        aria-label={label}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="max-[380px]:hidden">{label}</span>
      </button>
    </ActionHint>
  );
}

export function RowActionGroup({ children }: { children: ReactNode }) {
  return <div className={ui.rowActions}>{children}</div>;
}
