import type { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ActionHintProps = {
  hint: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
};

/** Hover hint for action buttons (also sets native title as fallback). */
export function ActionHint({ hint, children, side = 'bottom' }: ActionHintProps) {
  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" title={hint}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-xs border-slate-200 bg-slate-900 px-3 py-2 text-left text-xs leading-snug text-white dark:border-zinc-600"
        >
          {hint}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
