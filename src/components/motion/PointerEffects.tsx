import { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, summary, [data-cursor="hover"]';
const LABELLED = '[data-cursor-label]';
const MAGNETIC = '[data-magnetic]';

/**
 * Inverse-blend dot cursor that sits exactly on the pointer, grows over interactive
 * elements and swells into a labelled disc over `data-cursor-label` elements. Also adds
 * a magnetic pull on elements marked `data-magnetic` (skipped for reduced motion).
 * Only mounts for a fine pointer; the native cursor is hidden only while this runs.
 */
export function PointerEffects() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add('dot-cursor-on');

    let magnet: HTMLElement | null = null;
    const releaseMagnet = () => {
      if (!magnet) return;
      magnet.style.translate = '';
      magnet = null;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      const target = event.target as Element | null;
      const labelled = target?.closest?.(LABELLED);
      setLabel(labelled?.getAttribute('data-cursor-label') || null);
      setHovering(!labelled && !!target?.closest?.(INTERACTIVE));

      if (reduced) return;
      const next = target?.closest?.(MAGNETIC) as HTMLElement | null;
      if (next !== magnet) releaseMagnet();
      if (next) {
        magnet = next;
        const box = next.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const strength = Number(next.dataset.magnetic) || 0.25;
        next.style.translate = `${(dx * strength).toFixed(1)}px ${(dy * strength).toFixed(1)}px`;
      }
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => { setVisible(false); releaseMagnet(); };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.classList.remove('dot-cursor-on');
      releaseMagnet();
    };
  }, [x, y]);

  if (!enabled) return null;

  const className = [
    'dot-cursor',
    visible && 'on',
    label ? 'labelled' : pressed ? 'down' : hovering && 'hot',
  ].filter(Boolean).join(' ');

  return (
    <motion.div aria-hidden="true" className={className} style={{ x, y }}>
      <span className="dot-cursor-label">{label}</span>
    </motion.div>
  );
}
