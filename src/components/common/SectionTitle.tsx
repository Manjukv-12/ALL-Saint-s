import type { ReactNode } from 'react';
import { Cross } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  subtitle?: string | ReactNode;
  centered?: boolean;
  className?: string;
  light?: boolean;
}

const SectionTitle = ({
  title,
  subtitle,
  centered = true,
  className = '',
  light = false,
}: SectionTitleProps) => (
  <div className={`min-w-0 max-w-full ${centered ? 'text-center' : ''} ${className}`}>
    <div className={`flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 px-1 ${centered ? 'justify-center' : ''}`}>
      <div className={`h-px w-8 sm:w-12 shrink ${light ? 'bg-primary-foreground/30' : 'bg-border'}`} />
      <Cross className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${light ? 'text-secondary' : 'text-primary'}`} />
      <div className={`h-px w-8 sm:w-12 shrink ${light ? 'bg-primary-foreground/30' : 'bg-border'}`} />
    </div>
    <h2
      className={`text-h2 mb-3 sm:mb-4 px-2 sm:px-0 text-balance ${light ? 'text-primary-foreground' : 'text-foreground'}`}
    >
      {title}
    </h2>
    {subtitle != null && subtitle !== '' && (
      <p
        className={`text-body max-w-2xl px-3 sm:px-0 text-pretty ${centered ? 'mx-auto' : ''} ${light ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
      >
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionTitle;
