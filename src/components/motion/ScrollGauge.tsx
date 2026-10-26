import { motion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react';

const TEETH = 10;

function gearPath(cx: number, cy: number, outer: number, inner: number, teeth: number) {
  const step = (Math.PI * 2) / teeth;
  const points: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts = [
      [inner, a - step * 0.32],
      [outer, a - step * 0.18],
      [outer, a + step * 0.18],
      [inner, a + step * 0.32],
    ];
    pts.forEach(([r, ang]) => points.push(`${(cx + r * Math.cos(ang)).toFixed(2)},${(cy + r * Math.sin(ang)).toFixed(2)}`));
  }
  return `M${points.join('L')}Z`;
}

const GEAR = gearPath(24, 24, 15, 11.5, TEETH);

/** Fixed dial that fills with page progress while a gear spins with scroll speed. */
export function ScrollGauge() {
  const { scrollYProgress, scrollY } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });
  const velocity = useVelocity(scrollY);
  const rotation = useTransform(scrollY, value => value * 0.25);
  const smoothRotation = useSpring(rotation, { stiffness: 120, damping: 20 });
  const glow = useTransform(velocity, [-3000, 0, 3000], [1, 0.35, 1]);
  const percent = useTransform(scrollYProgress, value => `${Math.round(value * 100)}`.padStart(2, '0'));

  return (
    <div className="scroll-gauge" aria-hidden="true">
      <svg viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="21" className="scroll-gauge-track" />
        <motion.circle cx="24" cy="24" r="21" className="scroll-gauge-fill" style={{ pathLength: progress }} />
        <motion.path d={GEAR} className="scroll-gauge-gear" style={{ rotate: smoothRotation, opacity: glow }} />
        <circle cx="24" cy="24" r="4" className="scroll-gauge-hub" />
      </svg>
      <motion.span className="scroll-gauge-label">{percent}</motion.span>
    </div>
  );
}
