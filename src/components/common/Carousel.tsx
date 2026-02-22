import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
    children: React.ReactNode | React.ReactNode[];
    options?: any;
    autoplay?: boolean;
    autoplayDelay?: number;
    showArrows?: boolean;
    showDots?: boolean;
    className?: string;
    slideClassName?: string;
    mode?: 'default' | 'perspective' | 'loop';
    /** Slides visible on large screens: 1, 2, or 3. Use 2 when you have 3–4 items so the slider can scroll. */
    slidesPerViewLg?: 1 | 2 | 3;
}

const Carousel = ({
    children,
    options = { loop: true, align: 'start' },
    autoplay = false,
    autoplayDelay = 4000,
    showArrows = true,
    showDots = true,
    className = '',
    slideClassName = '',
    mode = 'default',
    slidesPerViewLg = 3
}: CarouselProps) => {
    const slides = useMemo(() => React.Children.toArray(children), [children]);
    const plugins = autoplay ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })] : [];
    const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    const dotCount = scrollSnaps.length > 0 ? scrollSnaps.length : slides.length;
    const lgFlexClass = slidesPerViewLg === 1 ? 'lg:flex-[0_0_100%]' : slidesPerViewLg === 2 ? 'lg:flex-[0_0_50%]' : 'lg:flex-[0_0_33.33%]';

    return (
        <div className={`relative group ${className}`}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {slides.map((child, index) => (
                        <div
                            key={index}
                            className={`flex-[0_0_100%] min-w-0 px-3 sm:flex-[0_0_50%] ${lgFlexClass} transition-transform duration-300 ${mode === 'perspective' && selectedIndex !== index ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
                                } ${slideClassName}`}
                        >
                            {child}
                        </div>
                    ))}
                </div>
            </div>

            {showArrows && slides.length > 1 && (
                <>
                    <button
                        type="button"
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-4 w-10 h-10 rounded-full bg-white shadow-md border border-border flex items-center justify-center text-primary z-20 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => { scrollPrev(); }}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        type="button"
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-4 w-10 h-10 rounded-full bg-white shadow-md border border-border flex items-center justify-center text-primary z-20 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => { scrollNext(); }}
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {showDots && dotCount > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: dotCount }).map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`h-2 rounded-full transition-all border border-primary/20 ${index === selectedIndex ? 'bg-primary w-6' : 'bg-primary/20 w-2 hover:bg-primary/40'
                                }`}
                            onClick={() => scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Carousel;
