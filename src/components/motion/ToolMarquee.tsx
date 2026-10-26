import { motion, useScroll, useTransform, useVelocity, useSpring } from 'motion/react';
import type { SkillGroup } from '../../types';

const FALLBACK = ['SolidWorks', 'CONVERGE CFD', 'COMSOL Multiphysics', 'HOMER Pro', 'MATLAB', 'AutoCAD', 'PVsyst', 'Python'];

/** Endless tool ribbon; scroll speed skews it slightly for a sense of momentum. */
export function ToolMarquee({ skillGroups }: { skillGroups?: SkillGroup[] }) {
  const names = (skillGroups ?? [])
    .flatMap(group => group.skills ?? [])
    .map(skill => skill.name?.trim())
    .filter((name): name is string => !!name && name.length <= 24);
  const tools = Array.from(new Set(names.length >= 4 ? names : FALLBACK));

  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 80, damping: 30 });
  const skew = useTransform(velocity, [-2500, 0, 2500], [6, 0, -6], { clamp: true });

  const row = tools.map(tool => (
    <span key={tool} className="tool-marquee-item">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l1.6 2.7 3.1-.6.6 3.1L20 9l-1.4 2.9L20 15l-2.7 1.6-.6 3.1-3.1-.6L12 22l-1.6-2.7-3.1.6-.6-3.1L4 15l1.4-3.1L4 9l2.7-1.6.6-3.1 3.1.6z" /><circle cx="12" cy="12" r="3.2" /></svg>
      {tool}
    </span>
  ));

  return (
    <div className="tool-marquee" aria-label={`Tools: ${tools.join(', ')}`} role="region">
      <motion.div className="tool-marquee-track" style={{ skewX: skew }} aria-hidden="true">
        <div className="tool-marquee-row">{row}</div>
        <div className="tool-marquee-row">{row}</div>
      </motion.div>
    </div>
  );
}
