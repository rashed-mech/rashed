import React, { useState, useRef, useEffect } from 'react';
import { useSpring } from 'motion/react';

interface PullChainSwitchProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  className?: string;
}

export const PullChainSwitch: React.FC<PullChainSwitchProps> = ({
  darkMode = true,
  onToggleDarkMode,
  className = ''
}) => {
  const [isHovered, setIsHovered]               = useState(false);
  const [isDragging, setIsDragging]             = useState(false);
  const [isClickAnimating, setIsClickAnimating] = useState(false);

  const startYRef       = useRef(0);
  const currentDragYRef = useRef(0);

  const [targetStretch,  setTargetStretch]  = useState(0);
  const [displayStretch, setDisplayStretch] = useState(0);

  const spring = useSpring(0, { stiffness: 140, damping: 6, mass: 1.1 });

  useEffect(() => { spring.set(targetStretch); }, [targetStretch, spring]);
  useEffect(() => {
    const unsub = spring.on('change', (v: number) => setDisplayStretch(v));
    return () => unsub();
  }, [spring]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    currentDragYRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - startYRef.current;
    if (delta > 0) {
      const pull = Math.min(36, delta * 0.55);
      currentDragYRef.current = pull;
      setTargetStretch(pull);
    } else {
      currentDragYRef.current = 0;
      setTargetStretch(isHovered ? 4 : 0);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    const pulled = currentDragYRef.current;
    currentDragYRef.current = 0;
    if (pulled >= 14) {
      onToggleDarkMode?.();
    } else if (pulled < 3) {
      handleClickToggle();
      return;
    }
    setTargetStretch(isHovered ? 4 : 0);
  };

  const handleClickToggle = () => {
    if (isClickAnimating) return;
    setIsClickAnimating(true);
    setTargetStretch(32);
    setTimeout(() => { onToggleDarkMode?.(); }, 190);
    setTimeout(() => {
      setTargetStretch(isHovered ? 4 : 0);
      setTimeout(() => setIsClickAnimating(false), 1400);
    }, 310);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!isDragging && !isClickAnimating) setTargetStretch(4);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isDragging && !isClickAnimating) setTargetStretch(0);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClickToggle(); }
  };

  // Chain geometry — matching original screenshot with top hanger
  const CX = 16;
  const HANGER_BOTTOM = 7;
  const CHAIN_REST = 38;
  const chainLen   = CHAIN_REST + displayStretch;

  // Small beads (silver in dark mode, dark slate in light mode)
  const BEAD_R   = 2.0;   // small bead
  const BEAD_GAP = 4.8;   // tight spacing
  const NUM_BEADS = Math.max(2, Math.round(chainLen / BEAD_GAP));

  // Hanging weight dot — dark walnut brown
  const DOT_R = 5.5;

  const svgH = HANGER_BOTTOM + chainLen + DOT_R * 2 + 10;

  // Pendulum sway for the chain and dot below the hanger
  // We use the delta from target so it always settles perfectly straight (0 degrees).
  const stretchDelta = displayStretch - targetStretch;
  const swayAngle = isDragging
    ? (displayStretch / 32) * 1.5
    : Math.sin(stretchDelta * 1.25) * 4 * Math.max(0, 1 - Math.abs(stretchDelta) / 34);

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none pointer-events-auto ${className}`}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Theme Toggle"
    >
      <div
        className="cursor-grab active:cursor-grabbing focus:outline-none touch-none"
        tabIndex={0}
        role="button"
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <svg
          width={CX * 2}
          height={svgH}
          viewBox={`0 0 ${CX * 2} ${svgH}`}
          className="overflow-visible"
          style={{ display: 'block' }}
        >
          <defs>
            {/* Hanger mounting plate - dark mode (silver chrome) */}
            <linearGradient id="pco-hanger-dark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#ffffff"/>
              <stop offset="25%"  stopColor="#cbd5e1"/>
              <stop offset="65%"  stopColor="#64748b"/>
              <stop offset="100%" stopColor="#334155"/>
            </linearGradient>

            {/* Hanger mounting plate - light mode (sleek gunmetal) */}
            <linearGradient id="pco-hanger-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#64748b"/>
              <stop offset="40%"  stopColor="#475569"/>
              <stop offset="85%"  stopColor="#1e293b"/>
              <stop offset="100%" stopColor="#0f172a"/>
            </linearGradient>

            {/* Bead gradient: silver in dark mode */}
            <radialGradient id="pco-bead-dark" cx="30%" cy="28%" r="65%">
              <stop offset="0%"   stopColor="#ffffff"/>
              <stop offset="35%"  stopColor="#e2e8f0"/>
              <stop offset="70%"  stopColor="#94a3b8"/>
              <stop offset="100%" stopColor="#475569"/>
            </radialGradient>

            {/* Bead gradient: dark slate in light mode (matches original screenshot) */}
            <radialGradient id="pco-bead-light" cx="32%" cy="28%" r="65%">
              <stop offset="0%"   stopColor="#94a3b8"/>
              <stop offset="40%"  stopColor="#64748b"/>
              <stop offset="75%"  stopColor="#475569"/>
              <stop offset="100%" stopColor="#1e293b"/>
            </radialGradient>

            {/* Dark walnut-brown weight dot (matches original screenshot) */}
            <radialGradient id="pco-dot" cx="33%" cy="28%" r="65%">
              <stop offset="0%"   stopColor="#a16207"/>
              <stop offset="35%"  stopColor="#78350f"/>
              <stop offset="70%"  stopColor="#451a03"/>
              <stop offset="100%" stopColor="#1c0a00"/>
            </radialGradient>

            {/* Subtle glow for dot */}
            <filter id="pco-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* ── Fixed Hanger Bracket (anchored permanently to header top edge) ── */}
          <g id="ceiling-hanger">
            {/* Top mounting plate / flange flush with header edge */}
            <rect
              x={CX - 9}
              y="0"
              width="18"
              height="3.5"
              rx="1"
              fill={darkMode ? "url(#pco-hanger-dark)" : "url(#pco-hanger-light)"}
              stroke={darkMode ? "#94a3b8" : "#334155"}
              strokeWidth="0.5"
            />
            {/* Left mounting screw */}
            <circle cx={CX - 6} cy="1.75" r="0.8" fill={darkMode ? "#475569" : "#0f172a"} stroke={darkMode ? "#94a3b8" : "#475569"} strokeWidth="0.3" />
            {/* Right mounting screw */}
            <circle cx={CX + 6} cy="1.75" r="0.8" fill={darkMode ? "#475569" : "#0f172a"} stroke={darkMode ? "#94a3b8" : "#475569"} strokeWidth="0.3" />

            {/* Hanger neck bracket */}
            <path
              d={`M ${CX - 3.5} 3.5 L ${CX - 2} 5.5 L ${CX + 2} 5.5 L ${CX + 3.5} 3.5 Z`}
              fill={darkMode ? "#cbd5e1" : "#475569"}
              stroke={darkMode ? "#94a3b8" : "#334155"}
              strokeWidth="0.4"
            />

            {/* Hanger eyelet / loop where chain attaches */}
            <circle
              cx={CX}
              cy={HANGER_BOTTOM}
              r="2"
              fill="none"
              stroke={darkMode ? "#e2e8f0" : "#334155"}
              strokeWidth="1.2"
            />
          </g>

          {/* ── Swaying & Stretching Chain + Weight Dot (sways from hanger eyelet) ── */}
          <g
            style={{
              transform: `rotate(${swayAngle}deg)`,
              transformOrigin: `${CX}px ${HANGER_BOTTOM}px`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* Thin connector line running through beads */}
            <line
              x1={CX}
              y1={HANGER_BOTTOM}
              x2={CX}
              y2={HANGER_BOTTOM + chainLen}
              stroke={darkMode ? '#e2e8f0' : '#334155'}
              strokeWidth="0.9"
              opacity={darkMode ? 0.9 : 0.65}
            />

            {/* Beads (silver in dark mode, dark slate in light mode) */}
            {Array.from({ length: NUM_BEADS }).map((_, i) => {
              const cy = HANGER_BOTTOM + BEAD_GAP * i + BEAD_GAP / 2;
              return (
                <g key={i}>
                  {/* Bead shadow */}
                  <circle cx={CX + 0.5} cy={cy + 0.5} r={BEAD_R} fill="#0f172a" opacity={darkMode ? 0.5 : 0.3}/>
                  {/* Main bead */}
                  <circle cx={CX} cy={cy} r={BEAD_R} fill={darkMode ? "url(#pco-bead-dark)" : "url(#pco-bead-light)"} stroke={darkMode ? '#cbd5e1' : 'none'} strokeWidth={darkMode ? 0.3 : 0}/>
                  {/* Shine highlight */}
                  <circle cx={CX - 0.6} cy={cy - 0.7} r={BEAD_R * 0.35} fill="white" opacity={darkMode ? 0.9 : 0.6}/>
                </g>
              );
            })}

            {/* Hanging weight dot — dark walnut brown */}
            <g filter="url(#pco-glow)">
              {/* Drop shadow */}
              <circle
                cx={CX + 0.8}
                cy={HANGER_BOTTOM + chainLen + DOT_R + 0.8}
                r={DOT_R}
                fill="black"
                opacity="0.25"
              />
              {/* Main weight */}
              <circle
                cx={CX}
                cy={HANGER_BOTTOM + chainLen + DOT_R}
                r={DOT_R}
                fill="url(#pco-dot)"
                stroke="#1c0a00"
                strokeWidth="0.7"
              />
              {/* Shine highlight */}
              <circle
                cx={CX - 1.8}
                cy={HANGER_BOTTOM + chainLen + DOT_R - 2}
                r={1.7}
                fill="white"
                opacity="0.38"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
