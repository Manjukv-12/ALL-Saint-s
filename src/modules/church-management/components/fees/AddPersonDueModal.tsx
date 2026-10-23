import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddPersonDueForm } from './AddPersonDueForm';
import type { Member } from '@/modules/church-management/api/types';
import type { DueType } from '@/modules/church-management/api/fees';

export function AddPersonDueModal({
  open,
  dueTypes,
  defaultYear,
  members,
  churchWide = false,
  onClose,
  onSaved,
  onYearChange,
}: {
  open: boolean;
  dueTypes: DueType[];
  defaultYear: number;
  members?: Member[];
  churchWide?: boolean;
  onClose: () => void;
  onSaved: () => void;
  onYearChange?: (year: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="fixed left-1/2 top-[max(1rem,4dvh)] z-50 flex max-h-[min(92dvh,calc(100vh-2rem))] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden border bg-background p-0 shadow-lg sm:top-[50%] sm:max-h-[min(90dvh,calc(100vh-2rem))] sm:-translate-y-1/2"
      >
        <DialogHeader className="shrink-0 space-y-2 border-b border-slate-200 px-6 py-5 text-left dark:border-zinc-700 sm:px-10 sm:py-6">
          <DialogTitle className="pr-8 font-sans text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Add due for a person
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-slate-600">
            Assign harvest, cemetery, or other dues to one member for a calendar year (from 2026).
            After saving, you can assign another type for the same person and year. Membership is
            applied separately with <strong>Apply membership</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-10 sm:py-8">
          <AddPersonDueForm
            dueTypes={dueTypes}
            defaultYear={defaultYear}
            members={members}
            churchWide={churchWide}
            inModal
            onYearChange={onYearChange}
            onSaved={onSaved}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
