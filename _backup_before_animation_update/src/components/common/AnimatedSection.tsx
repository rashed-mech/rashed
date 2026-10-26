import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type AnimationVariant =
  | 'float-up'
  | 'cinematic-zoom'
  | 'slide-left'
  | 'slide-right'
  | 'rise-vertical'
  | 'diagonal-left'
  | 'diagonal-right'
  | 'scale-crest'
  | 'magnetic-glow';

export interface AnimatedSectionProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  className?: string;
  delay?: number;
  duration?: number;
  id?: string;
  showAccentBeam?: boolean;
  accentColor?: 'amber' | 'cyan' | 'teal' | 'indigo' | 'emerald' | 'gold';
  once?: boolean;
  threshold?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  variant = 'float-up',
  className = '',
  delay = 0,
  duration = 0.42,
  id,
  showAccentBeam = true,
  once = true,
  threshold = 0.05
}) => {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReduced) return;
    // Reveal each heading at its own position, including headings deep in long sections.
    const headings = container.querySelectorAll<HTMLElement>('h2, section > div > div > p, form');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.headingRevealed = 'true';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px 40px 0px' });
    headings.forEach(heading => observer.observe(heading));

    // Separate CSS rotate/translate properties compose with existing Motion transforms.
    const cards = container.querySelectorAll<HTMLElement>('.grid > .rounded-2xl.border, .grid > .rounded-3xl.border, .sticky > .rounded-3xl.border');
    cards.forEach(card => { card.dataset.motionCard = 'true'; });
    let hoveredCard: HTMLElement | null = null;
    let frame = 0;
    const clear = () => {
      cancelAnimationFrame(frame);
      if (hoveredCard) {
        delete hoveredCard.dataset.motionHover;
        hoveredCard.style.removeProperty('--card-tilt');
      }
      hoveredCard = null;
    };
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const card = (event.target as Element).closest<HTMLElement>('[data-motion-card]');
      if (!card || !container.contains(card)) { clear(); return; }
      if (card !== hoveredCard) { clear(); hoveredCard = card; }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty('--card-light-x', `${x * 100}%`);
        card.style.setProperty('--card-light-y', `${y * 100}%`);
        card.style.setProperty('--card-tilt', `${(x - y) * 2.4}deg`);
        card.dataset.motionHover = 'true';
      });
    };
    container.addEventListener('pointermove', pointerMove, { passive: true });
    container.addEventListener('pointerleave', clear);
    container.addEventListener('pointercancel', clear);
    return () => {
      observer.disconnect();
      clear();
      container.removeEventListener('pointermove', pointerMove);
      container.removeEventListener('pointerleave', clear);
      container.removeEventListener('pointercancel', clear);
    };
  }, [children, prefersReduced]);

  return (
    <div
      ref={containerRef}
      id={id}
      style={{ '--section-delay': `${delay}s`, '--section-duration': `${duration}s` } as React.CSSProperties}
      className={`relative w-full enhanced-section ${className}`}
      data-section-animation={variant}
    >
      {showAccentBeam && !prefersReduced && <motion.div
        aria-hidden="true"
        className="section-arrival-beam"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: [0, 0.8, 0.45], scaleX: 1 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.55, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      />}
      {children}
    </div>
  );
};
