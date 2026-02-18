import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
    children: React.ReactNode[];
    options?: any;
    autoplay?: boolean;
    autoplayDelay?: number;
    showArrows?: boolean;
    showDots?: boolean;
    className?: string;
    slideClassName?: string;
    mode?: 'default' | 'perspective' | 'loop';
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
    mode = 'default'
}: CarouselProps) => {
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
    }, [emblaApi, onSelect]);

    return (
        <div className={`relative group ${className}`}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {children.map((child, index) => (
                        <div
                            key={index}
                            className={`flex-[0_0_100%] min-w-0 px-3 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] transition-all duration-500 ${mode === 'perspective' && selectedIndex !== index ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
                                } ${slideClassName}`}
                        >
                            {child}
                        </div>
                    ))}
                </div>
            </div>

            {showArrows && (
                <>
                    <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
                        onClick={scrollPrev}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
                        onClick={scrollNext}
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {showDots && (
                <div className="flex justify-center gap-2 mt-8">
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all border border-primary/20 ${index === selectedIndex ? 'bg-primary w-6' : 'bg-primary/20 hover:bg-primary/40'
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
