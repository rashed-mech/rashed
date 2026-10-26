import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

function gearPath(r: number, teeth: number, depth: number) {
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    [[r - depth, a - step * 0.3], [r, a - step * 0.17], [r, a + step * 0.17], [r - depth, a + step * 0.3]]
      .forEach(([rad, ang]) => pts.push(`${(rad * Math.cos(ang)).toFixed(2)},${(rad * Math.sin(ang)).toFixed(2)}`));
  }
  return `M${pts.join('L')}Z`;
}

const BIG_GEAR = gearPath(150, 24, 14);
const SMALL_GEAR = gearPath(84, 14, 12);

/** Blueprint grid with two meshing gears that turn as the page scrolls. */
export function HeroBlueprint() {
  const { scrollY } = useScroll();
  const spin = useTransform(scrollY, value => value * 0.08);
  // Gear ratio 24:14, counter-rotating so the teeth stay meshed.
  const counterSpin = useTransform(scrollY, value => value * -0.08 * (24 / 14) + 360 / 28);
  const drift = useTransform(scrollY, [0, 800], [0, 120]);

  return (
    <div className="hero-blueprint" aria-hidden="true">
      <div className="hero-blueprint-grid" />
      <motion.svg className="hero-blueprint-gears" viewBox="-200 -200 560 430" style={{ y: drift }}>
        <motion.g style={{ rotate: spin }} className="hero-gear-spin">
          <path d={BIG_GEAR} />
          <circle r="104" />
          <circle r="22" />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1="0" y1="0" x2={(104 * Math.cos((i * Math.PI) / 3)).toFixed(1)} y2={(104 * Math.sin((i * Math.PI) / 3)).toFixed(1)} />
          ))}
        </motion.g>
        <motion.g style={{ x: 222, y: 0, rotate: counterSpin }}>
          <path d={SMALL_GEAR} />
          <circle r="16" />
          <circle r="50" strokeDasharray="4 6" />
        </motion.g>
        <g className="hero-blueprint-dim">
          <line x1="-150" y1="178" x2="150" y2="178" />
          <line x1="-150" y1="170" x2="-150" y2="186" />
          <line x1="150" y1="170" x2="150" y2="186" />
          <text x="0" y="198" textAnchor="middle">Ø300 · Z24</text>
        </g>
      </motion.svg>
    </div>
  );
}

/** Hairline halo around the portrait with a single soft arc that glides around it. */
export function GearRing() {
  return (
    <svg className="hero-halo" viewBox="-100 -100 200 200" aria-hidden="true">
      <defs>
        <linearGradient id="heroHaloArc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <circle r="97" className="hero-halo-line" />
      <circle r="93" className="hero-halo-line inner" />
      <g className="hero-halo-orbit">
        <circle r="97" className="hero-halo-arc" pathLength="100" stroke="url(#heroHaloArc)" />
        <circle cx="97" cy="0" r="1.8" className="hero-halo-dot" />
      </g>
    </svg>
  );
}

/** Mounts children only once they are near the viewport and the browser is idle. */
export function WhenNear({ children, fallback, margin = '300px' }: { children: ReactNode; fallback: ReactNode; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || ready) return;
    let idle: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = () => setReady(true);
      idle = typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(start, { timeout: 1200 })
        : globalThis.setTimeout(start, 200) as unknown as number;
    }, { rootMargin: margin });
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (idle !== undefined) {
        if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
        else globalThis.clearTimeout(idle);
      }
    };
  }, [ready, margin]);

  return <div ref={ref}>{ready ? children : fallback}</div>;
}
