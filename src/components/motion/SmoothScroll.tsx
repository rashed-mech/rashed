import { useEffect } from 'react';
import Lenis from 'lenis';

const isScrollContainer = (node: HTMLElement) => {
  if (!(node instanceof HTMLElement)) return false;
  if (node.dataset.lenisPrevent !== undefined || node.getAttribute('role') === 'dialog') return true;
  const { overflowY } = getComputedStyle(node);
  return (overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight;
};

/** Inertia smooth scrolling for the public portfolio (skipped for reduced motion and touch). */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const lenis = new Lenis({
      lerp: 0.075,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      anchors: { offset: -72 },
      autoRaf: true,
      prevent: isScrollContainer,
    });

    // Pause while a modal locks the page so its own content scrolls normally.
    const syncLock = () => {
      const locked = document.body.style.overflow === 'hidden' || document.documentElement.style.overflow === 'hidden';
      if (locked) lenis.stop(); else lenis.start();
    };
    const lockObserver = new MutationObserver(syncLock);
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    lockObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    return () => {
      lockObserver.disconnect();
      lenis.destroy();
    };
  }, []);

  return null;
}
