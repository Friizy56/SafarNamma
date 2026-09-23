import type { ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Rise distance in px. */
  y?: number;
  /** Stagger direct <RevealItem> children by this many seconds. */
  stagger?: number;
  as?: 'div' | 'section' | 'ul' | 'li' | 'article' | 'header';
  /** Fraction of the element that must be visible before it animates. */
  amount?: number;
}

/* Fade and rise into view once. Reduced-motion users see it immediately. */
export const Reveal = ({ children, className, delay = 0, y = 28, stagger, as = 'div', amount = 0.2 }: RevealProps) => {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: EASE, delay, ...(stagger ? { staggerChildren: stagger, delayChildren: delay } : {}) },
    },
  };

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      variants={stagger ? { hidden: {}, show: variants.show } : variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </Tag>
  );
};

/** A child of a staggered <Reveal>. */
export const RevealItem = ({ children, className, y = 28 }: { children: ReactNode; className?: string; y?: number }) => {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}
    >
      {children}
    </motion.div>
  );
};
