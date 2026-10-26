import React from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { PortfolioData, UXDesignId } from '../types';

interface QuickActionsDockProps {
  data?: PortfolioData;
  onOpenCommandPalette?: () => void;
  activeDesign?: UXDesignId;
}

function gearPath(cx: number, cy: number, outer: number, inner: number, teeth: number) {
  const step = (Math.PI * 2) / teeth;
  const points: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    [[inner, a - step * 0.32], [outer, a - step * 0.18], [outer, a + step * 0.18], [inner, a + step * 0.32]]
      .forEach(([r, ang]) => points.push(`${(cx + r * Math.cos(ang)).toFixed(2)},${(cy + r * Math.sin(ang)).toFixed(2)}`));
  }
  return `M${points.join('L')}Z`;
}

const GEAR = gearPath(32, 32, 22.5, 19, 14);
const RING_RADIUS = 29;

// Progress ring colours per design: [start, middle, end].
const RING_COLORS: Partial<Record<UXDesignId, [string, string, string]>> = {
  'design-2': ['#34d399', '#22d3ee', '#a3e635'],
  'design-3': ['#fbbf24', '#f97316', '#fde68a'],
  'design-4': ['#38bdf8', '#818cf8', '#22d3ee'],
  'design-5': ['#2dd4bf', '#fbbf24', '#f97316'],
  'design-6': ['#fde68a', '#d4af37', '#f59e0b'],
};
const DEFAULT_RING: [string, string, string] = ['#fbbf24', '#f97316', '#2dd4bf'];

/** Always-visible back-to-top button: a gear turns with scroll inside a glowing progress dial. */
export const QuickActionsDock: React.FC<QuickActionsDockProps> = ({
  activeDesign = 'current'
}) => {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  const gearRotation = useSpring(useTransform(scrollY, value => value * 0.3), { stiffness: 90, damping: 20 });
  const percent = useTransform(scrollYProgress, value => `${Math.round(value * 100)}%`);
  const [c1, c2, c3] = RING_COLORS[activeDesign] ?? DEFAULT_RING;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="fixed z-[999999] pointer-events-auto select-none touch-manipulation print:hidden"
      style={{
        bottom: 'max(1.25rem, calc(1rem + env(safe-area-inset-bottom, 0px)))',
        right: 'max(1rem, calc(1rem + env(safe-area-inset-right, 0px)))',
      }}
      id="quick-actions-dock"
    >
      <motion.button
        type="button"
        onClick={scrollToTop}
        className="dock-button group"
        style={{ '--dock-c1': c1, '--dock-c2': c2, '--dock-c3': c3 } as React.CSSProperties}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <svg className="dock-svg" viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="dockRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c1} />
              <stop offset="55%" stopColor={c2} />
              <stop offset="100%" stopColor={c3} />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r={RING_RADIUS} className="dock-track" />
          <motion.circle
            cx="32"
            cy="32"
            r={RING_RADIUS}
            className="dock-progress"
            stroke="url(#dockRingGradient)"
            style={{ pathLength: progress }}
          />
          <motion.path d={GEAR} className="dock-gear" stroke="url(#dockRingGradient)" style={{ rotate: gearRotation }} />
        </svg>
        <ArrowUp className="dock-arrow" strokeWidth={2.6} />
        <motion.span className="dock-percent" aria-hidden="true">{percent}</motion.span>
      </motion.button>
    </div>
  );
};
