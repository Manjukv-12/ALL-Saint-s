import { Cross } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  light?: boolean;
}

const SectionTitle = ({ 
  title, 
  subtitle, 
  centered = true, 
  className = '',
  light = false 
}: SectionTitleProps) => {
  return (
    <div className={`${centered ? 'text-center' : ''} ${className}`}>
      <div className={`flex items-center gap-4 mb-4 ${centered ? 'justify-center' : ''}`}>
        <div className={`h-px w-12 ${light ? 'bg-primary-foreground/30' : 'bg-border'}`} />
        <Cross className={`w-5 h-5 ${light ? 'text-secondary' : 'text-primary'}`} />
        <div className={`h-px w-12 ${light ? 'bg-primary-foreground/30' : 'bg-border'}`} />
      </div>
      <h2 className={`font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 ${
        light ? 'text-primary-foreground' : 'text-foreground'
      }`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`font-sans text-base md:text-lg max-w-2xl ${centered ? 'mx-auto' : ''} ${
          light ? 'text-primary-foreground/80' : 'text-muted-foreground'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
