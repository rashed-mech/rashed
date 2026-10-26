import React, { useEffect, useState, useRef } from 'react';

interface PageIntroProps {
  onComplete: () => void;
  name?: string;
}

export const PageIntro: React.FC<PageIntroProps> = ({ onComplete, name = 'Rashedul Islam' }) => {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [progress, setProgress] = useState(0);
  const [particleCount] = useState(24);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Tiny canvas turbine particle ring — pure CSS/canvas, no three.js
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = 200;
    const H = canvas.height = 200;
    const cx = W / 2, cy = H / 2;

    let t = 0;
    const particles = Array.from({ length: particleCount }, (_, i) => ({
      angle: (i / particleCount) * Math.PI * 2,
      radius: 55 + Math.random() * 28,
      speed: 0.018 + Math.random() * 0.012,
      size: 1.8 + Math.random() * 2,
      opacity: 0.5 + Math.random() * 0.5,
      hue: 190 + Math.random() * 30, // sky-blue range
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      // Outer glow ring
      const grad = ctx.createRadialGradient(cx, cy, 32, cx, cy, 80);
      grad.addColorStop(0, 'rgba(56,189,248,0.12)');
      grad.addColorStop(1, 'rgba(2,132,199,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Spinning particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius;
        const pulse = 0.7 + 0.3 * Math.sin(t * 2 + p.angle);

        ctx.beginPath();
        ctx.arc(x, y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 72%, ${p.opacity * pulse})`;
        ctx.fill();
      });

      // Center hub
      const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
      hubGrad.addColorStop(0, 'rgba(203,213,225,0.95)');
      hubGrad.addColorStop(0.6, 'rgba(148,163,184,0.7)');
      hubGrad.addColorStop(1, 'rgba(71,85,105,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = hubGrad;
      ctx.fill();

      // Rotating blade spokes (4 blades)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 1.8);
      for (let b = 0; b < 4; b++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(0, -32, 5, 18, 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(148,163,184,0.55)';
        ctx.fill();
      }
      ctx.restore();

      // Inner core dot
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56,189,248,0.9)';
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [particleCount]);

  // Progress bar fill
  useEffect(() => {
    const start = performance.now();
    const duration = 1800;

    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress(Math.min(100, (elapsed / duration) * 100));
      if (elapsed < duration) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Phase timing - single run on mount, never cancelled by parent re-renders
  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase('hold'), 300);
    const outTimer = setTimeout(() => setPhase('out'), 1800);
    const doneTimer = setTimeout(() => {
      onCompleteRef.current?.();
    }, 2200);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div
      onClick={() => onCompleteRef.current?.()}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060c14] transition-all cursor-pointer ${
        phase === 'out'
          ? 'opacity-0 scale-[1.04] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        transition: phase === 'out'
          ? 'opacity 0.62s cubic-bezier(0.4,0,0.2,1), transform 0.62s cubic-bezier(0.4,0,0.2,1)'
          : 'none',
      }}
      aria-hidden="true"
    >
      {/* Radial ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(2,132,199,0.13) 0%, transparent 70%)',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* Main content */}
      <div
        className={`relative flex flex-col items-center gap-6 transition-all duration-500 ${
          phase === 'in' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
        style={{ transitionDelay: phase === 'in' ? '0ms' : '80ms' }}
      >
        {/* Turbine canvas */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: '0 0 48px 12px rgba(56,189,248,0.18)',
              borderRadius: '50%',
            }}
          />
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="relative z-10"
            style={{ filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.35))' }}
          />
        </div>

        {/* Name & title */}
        <div className="text-center space-y-2 px-4">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            {name}
          </h1>
          <p
            className="text-xs sm:text-sm font-mono tracking-[0.25em] uppercase text-amber-400/90"
          >
            Mechanical Engineer · Energy Systems
          </p>
        </div>

        {/* Animated separator */}
        <div className="w-48 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        {/* Loading bar */}
        <div className="w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
            style={{
              width: `${progress}%`,
              transition: 'width 0.08s linear',
              boxShadow: '0 0 8px rgba(56,189,248,0.6)',
            }}
          />
        </div>

        {/* Tagline */}
        <p
          className="text-[10px] font-mono text-slate-500 tracking-[0.2em] uppercase"
        >
          Initialising Portfolio...
        </p>
      </div>
    </div>
  );
};
