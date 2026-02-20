import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface HeroSliderProps {
  children: React.ReactNode[];
  autoplay?: boolean;
  /** Single delay (ms) for all slides, or ignored when autoplayDelays is set */
  autoplayDelay?: number;
  /** Per-slide delay in ms: [videoSlideMs, imageSlideMs, ...]. When set, arrows are hidden and autoplay uses these. */
  autoplayDelays?: number[];
  onSlideChange?: (index: number) => void;
  className?: string;
  showArrows?: boolean;
}

const HeroSlider = ({
  children,
  autoplay = true,
  autoplayDelay = 6000,
  autoplayDelays,
  onSlideChange,
  className = '',
  showArrows = false,
}: HeroSliderProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', duration: 25 }
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    onSlideChange?.(index);
  }, [emblaApi, onSlideChange]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  // Per-slide autoplay: after playing video, show image for 20–25s then next
  useEffect(() => {
    if (!autoplay || !emblaApi) return;
    const delays = autoplayDelays ?? (children.length ? Array(children.length).fill(autoplayDelay) : [autoplayDelay]);
    const delay = delays[selectedIndex] ?? autoplayDelay;
    autoplayTimerRef.current = setTimeout(() => {
      scrollNext();
    }, delay);
    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, [autoplay, emblaApi, selectedIndex, autoplayDelay, autoplayDelays, children.length, scrollNext]);

  return (
    <div className={`relative w-full h-full group ${className}`}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 h-full shrink-0"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {showArrows && (
        <>
          <button
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-primary hover:bg-white transition-colors"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-primary hover:bg-white transition-colors"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {children.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all border border-primary/30 ${
              index === selectedIndex ? 'bg-primary w-6' : 'bg-white/60 w-2 hover:bg-white/80'
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
