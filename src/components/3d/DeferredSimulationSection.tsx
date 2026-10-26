import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const MechanicalSimulationSection = lazy(() => import('./MechanicalSimulationSection').then(module => ({ default: module.MechanicalSimulationSection })));

export function DeferredSimulationSection() {
  const placeholder = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);

  useEffect(() => {
    const node = placeholder.current;
    if (!node || nearby) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearby(true); observer.disconnect(); }
    }, { rootMargin: '500px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [nearby]);

  return <div id="3d-simulation-lab" ref={placeholder} className="scroll-mt-20">
    {nearby ? <Suspense fallback={<div className="h-[420px] flex items-center justify-center text-sm text-slate-500" role="status">Loading engineering lab…</div>}><MechanicalSimulationSection /></Suspense>
      : <div className="h-[420px] flex items-center justify-center text-sm text-slate-500" aria-label="Engineering lab loading area" />}
  </div>;
}
