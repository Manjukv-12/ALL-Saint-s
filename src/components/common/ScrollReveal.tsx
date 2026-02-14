import { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  once?: boolean;
}

const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6,
  once = true,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 40 };
      case 'down':
        return { opacity: 0, y: -40 };
      case 'left':
        return { opacity: 0, x: 40 };
      case 'right':
        return { opacity: 0, x: -40 };
      case 'none':
        return { opacity: 0 };
      default:
        return { opacity: 0, y: 40 };
    }
  };

  const variants: Variants = {
    hidden: getInitialPosition(),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
