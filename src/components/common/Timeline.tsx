import { motion } from 'framer-motion';

export interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItemProps[];
  className?: string;
  /** 'compact' = 2-column S-flow grid, less height; 'default' = vertical line layout */
  variant?: 'default' | 'compact';
}

const Timeline = ({ items, className = '', variant = 'default' }: TimelineProps) => {
  if (variant === 'compact') {
    return (
      <div className={`${className}`}>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4">
          {items.map((item, index) => {
            const row = Math.floor(index / 2);
            const isOddRow = row % 2 === 1;
            const col = isOddRow ? 1 - (index % 2) : index % 2;
            const isLastAndOdd = items.length % 2 === 1 && index === items.length - 1;
            const content = (
              <div className="bg-card rounded-lg p-3 sm:p-4 shadow-card border border-border/50 h-full flex flex-col">
                <p className="font-semibold text-primary text-xs sm:text-sm mb-0.5">{item.date}</p>
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">{item.title}</h3>
                <p className="font-sans text-xs sm:text-sm text-muted-foreground leading-snug">
                  {item.description}
                </p>
              </div>
            );
            return (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className={isLastAndOdd ? 'col-span-2 max-w-md mx-auto w-full' : ''}
                style={
                  isLastAndOdd
                    ? { gridColumn: '1 / -1', gridRow: row + 1 }
                    : { gridColumn: col + 1, gridRow: row + 1 }
                }
              >
                {content}
              </motion.li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className={`relative max-w-4xl mx-auto ${className}`}>
      {/* Vertical line - desktop only */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-primary hidden sm:block"
        aria-hidden
      />

      <ul className="space-y-0">
        {items.map((item, index) => {
          const isLeft = index % 2 === 0;
          const content = (
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <p className="font-semibold text-primary text-sm mb-1">{item.date}</p>
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          );

          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="relative flex flex-col sm:flex-row sm:items-start gap-0 py-8"
            >
              {/* Desktop: left column */}
              <div
                className={`hidden sm:block sm:w-[calc(50%-1.5rem)] sm:pr-8 flex-1 min-w-0 ${
                  isLeft ? 'sm:text-right' : ''
                }`}
              >
                {isLeft && content}
              </div>

              {/* Center: dot */}
              <div className="hidden sm:flex flex-shrink-0 w-8 justify-center">
                <div
                  className="relative z-10 w-4 h-4 rounded-full bg-primary ring-4 ring-background"
                  aria-hidden
                />
              </div>

              {/* Desktop: right column */}
              <div className="hidden sm:block sm:w-[calc(50%-1.5rem)] sm:pl-8 flex-1 min-w-0">
                {!isLeft && content}
              </div>

              {/* Mobile: dot + content */}
              <div className="flex sm:hidden gap-4 items-start">
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary mt-2" />
                <div className="flex-1 min-w-0">{content}</div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
};

export default Timeline;
