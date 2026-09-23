import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

interface HorizontalScrollerProps {
  /** Rendered in the sticky frame above the track (title, counter…). */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  trackClassName?: string;
}

/* A pinned section: while it is on screen, vertical scrolling slides the track sideways.
   Falls back to a native swipeable row on small screens and for reduced motion. */
export const HorizontalScroller = ({ header, children, className = '', trackClassName = '' }: HorizontalScrollerProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const wide = window.matchMedia('(min-width: 1024px)').matches;
      const track = trackRef.current;
      if (!track) return;
      const overflow = track.scrollWidth - window.innerWidth;
      setPinned(wide && !reduced && overflow > 40);
      setDistance(Math.max(0, overflow));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) {
      ro.observe(trackRef.current);
      // Children can change width after mount (e.g. photos sizing to their natural shape)
      Array.from(trackRef.current.children).forEach((c) => ro.observe(c));
    }
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [reduced, children, pinned]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);
  const progress = useTransform(smooth, [0, 1], ['0%', '100%']);

  if (!pinned) {
    return (
      <section ref={sectionRef} className={className}>
        {header}
        <div ref={trackRef} className={`flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 ${trackClassName}`}>
          {children}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={`relative ${className}`} style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden pt-36 pb-6">
        {header}
        <motion.div ref={trackRef} style={{ x }} className={`flex gap-6 will-change-transform ${trackClassName}`}>
          {children}
        </motion.div>
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 mt-8">
          <div className="h-px bg-line relative overflow-hidden">
            <motion.div className="absolute inset-y-0 left-0 bg-ink" style={{ width: progress }} />
          </div>
        </div>
      </div>
    </section>
  );
};
