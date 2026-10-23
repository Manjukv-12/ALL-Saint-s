import { useEffect, useState, type RefObject } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const SHOW_AFTER_PX = 280;

interface ScrollToTopButtonProps {
  scrollRef: RefObject<HTMLElement | null>;
}

/** Floating control: jump back to the top of a long listing scroll pane. */
export function ScrollToTopButton({ scrollRef }: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      setVisible(el.scrollTop > SHOW_AFTER_PX);
    };

    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef]);

  return (
    <button
      type="button"
      onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top of list"
      title="Back to top"
      className={cn(
        'absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-20',
        'flex h-11 w-11 items-center justify-center rounded-full',
        'bg-[hsl(var(--primary))] text-white shadow-lg transition',
        'hover:bg-[hsl(var(--primary-hover))] focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2',
        'dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:ring-offset-zinc-950',
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <ChevronUp className="h-5 w-5" strokeWidth={2.5} aria-hidden />
    </button>
  );
}
