import { useEffect, useState } from 'react';
import { findActiveSection } from '../utils/activeSection';

export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || 'hero');
  const idsKey = sectionIds.join('|');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const sections = idsKey.split('|').map(id => document.getElementById(id))
        .filter((element): element is HTMLElement => !!element && element.getClientRects().length > 0)
        .map(element => ({ id: element.id, top: element.getBoundingClientRect().top }));
      const header = document.querySelector('[data-site-header]');
      const line = Math.max(0, header?.getBoundingClientRect().bottom ?? 72) + 24;
      const atBottom = window.scrollY > 0 && document.documentElement.scrollHeight - window.innerHeight - window.scrollY <= 2;
      const next = findActiveSection(sections, line, atBottom);
      if (next) setActiveSection(next);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
      resizeObserver.disconnect();
    };
  }, [idsKey]);
  return activeSection;
}
