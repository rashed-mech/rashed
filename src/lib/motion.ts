// Shared motion presets so every section reveals with the same timing.
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
// Softer settle used for scroll reveals; avoids the abrupt start of the expo curve.
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

// Start revealing just before an element crosses into view, so content is
// already settling while it scrolls in instead of popping in late.
export const revealViewport = { once: true, amount: 0, margin: '0px 0px 80px 0px' } as const;

type RevealFrom = 'up' | 'left' | 'right' | 'scale';

const offsets: Record<RevealFrom, { x?: number; y?: number; scale?: number }> = {
  up: { y: 28 },
  left: { x: -32, y: 8 },
  right: { x: 32, y: 8 },
  scale: { y: 18, scale: 0.97 },
};

/** Blur-in reveal with a capped stagger, spread onto a motion element. */
export function reveal(index = 0, from: RevealFrom = 'up') {
  const offset = offsets[from];
  return {
    initial: { opacity: 0, filter: 'blur(6px)', x: 0, y: 0, scale: 1, ...offset },
    whileInView: { opacity: 1, filter: 'blur(0px)', x: 0, y: 0, scale: 1, transitionEnd: { filter: 'none' } },
    viewport: revealViewport,
    transition: { duration: 1.05, ease: EASE_SMOOTH, delay: Math.min(index, 6) * 0.06 },
  };
}

/** Lift-and-tilt hover used by content cards. */
export const cardHover = { y: -6, transition: { type: 'spring', stiffness: 220, damping: 24, mass: 0.8 } } as const;
