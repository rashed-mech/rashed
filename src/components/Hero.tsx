import { downloadResearchResume } from '../utils/downloadResearchResume';
import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import { reveal, cardHover } from '../lib/motion';
import {
  Sun,
  Wind,
  Flame,
  BatteryCharging,
  Home,
  Download,
  Mail,
  BookOpen,
  ArrowRight,
  Zap,
  Activity,
  Droplet,
  Cloud,
  Cpu,
  Leaf,
  FileText,
  Compass,
  CheckCircle2,
  ExternalLink,
  Layers,
  Crown,
  Github,
  Linkedin,
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import { Profile, PortfolioData, UXDesignId } from '../types';
import { formatImageUrl } from '../utils/formatUrl';
import { HeroBlueprint, GearRing, WhenNear } from './motion/Mechanical';

const Hero3DCanvas = lazy(() => import('./3d/Hero3DCanvas').then(module => ({ default: module.Hero3DCanvas })));

// Custom brand SVG icons for Academic Profiles
const OrcidIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.948-.947c0-.516.422-.947.948-.947zm-.729 3.32h1.458v10.957H6.64V7.698zm4.492 0h3.608c3.275 0 4.887 2.062 4.887 5.488 0 3.385-1.782 5.469-4.887 5.469h-3.608V7.698zm1.458 1.458v8.041h2.15c2.428 0 3.429-1.472 3.429-4.02 0-2.584-1.001-4.021-3.429-4.021h-2.15z" />
  </svg>
);

const ResearchGateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 0 0-.112.437 8.365 8.365 0 0 0-.078.53 9 9 0 0 0-.05.727c-.01.282-.013.621-.013 1.016a31.121 31.123 0 0 0 .014 1.017 9 9 0 0 0 .05.727 7.946 7.946 0 0 0 .077.53h-.005a3.334 3.334 0 0 0 .113.438c.245.743.65 1.303 1.214 1.68.565.376 1.256.564 2.075.564.8 0 1.536-.213 2.105-.603.57-.39.94-.916 1.175-1.65.076-.235.135-.558.177-.93a10.9 10.9 0 0 0 .043-1.207v-.82c0-.095-.047-.142-.14-.142h-3.064c-.094 0-.14.047-.14.141v.956c0 .094.046.14.14.14h1.666c.056 0 .084.03.084.086 0 .36 0 .62-.036.865-.038.244-.1.447-.147.606-.108.385-.348.664-.638.876-.29.212-.738.35-1.227.35-.545 0-.901-.15-1.21-.353-.306-.203-.517-.454-.67-.915a3.136 3.136 0 0 1-.147-.762 17.366 17.367 0 0 1-.034-.656c-.01-.26-.014-.572-.014-.939a26.401 26.403 0 0 1 .014-.938 15.821 15.822 0 0 1 .035-.656 3.19 3.19 0 0 1 .148-.76 1.89 1.89 0 0 1 .742-1.01c.344-.244.593-.352 1.137-.352.508 0 .815.096 1.144.303.33.207.528.492.764.925.047.094.111.118.198.07l1.044-.43c.075-.048.09-.115.042-.199a3.549 3.549 0 0 0-.466-.742 3 3 0 0 0-.679-.607 3.313 3.313 0 0 0-.903-.41A4.068 4.068 0 0 0 19.586 0zM8.217 5.836c-1.69 0-3.036.086-4.297.086-1.146 0-2.291 0-3.007-.029v.831l1.088.2c.744.144 1.174.488 1.174 2.264v11.288c0 1.777-.43 2.12-1.174 2.263l-1.088.2v.832c.773-.029 2.12-.086 3.465-.086 1.29 0 2.951.057 3.667.086v-.831l-1.49-.2c-.773-.115-1.174-.487-1.174-2.264v-4.784c.688.057 1.29.057 2.206.057 1.748 3.123 3.41 5.472 4.355 6.56.86 1.032 2.177 1.691 3.839 1.691.487 0 1.003-.086 1.318-.23v-.744c-1.031 0-2.063-.716-2.808-1.518-1.26-1.376-2.95-3.582-4.355-6.074 2.32-.545 4.04-2.722 4.04-4.9 0-3.208-2.492-4.698-5.758-4.698zm-.515 1.29c2.406 0 3.839 1.26 3.839 3.552 0 2.263-1.547 3.782-4.097 3.782-.974 0-1.404-.03-2.063-.086v-7.19c.66-.059 1.547-.059 2.32-.059z" />
  </svg>
);

interface HeroProps {
  profile: Profile;
  data: PortfolioData;
  activeDesign?: UXDesignId;
}

interface TypewriterExecutiveNameProps {
  name: string;
  activeDesign?: UXDesignId;
}

// Gradient-clipped designs cannot animate per letter (transformed children lose the clip),
// so they reveal the whole name with a mask instead.
const GRADIENT_NAME_DESIGNS: UXDesignId[] = ['design-2', 'design-6'];

const TypewriterExecutiveName: React.FC<TypewriterExecutiveNameProps> = React.memo(({ name, activeDesign }) => {
  const fullName = name || "RASHEDUL ISLAM";
  const reducedMotion = useReducedMotion();
  const perLetter = !reducedMotion && !GRADIENT_NAME_DESIGNS.includes(activeDesign as UXDesignId);
  const words = fullName.split(' ');
  let letterIndex = 0;
  return (
    <h1 aria-label={fullName}
      className={`hero-name text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-none inline-flex flex-wrap items-center ${
        activeDesign === 'design-2' ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-sans' :
        activeDesign === 'design-3' ? 'font-serif italic dark:text-amber-100 text-slate-900 tracking-wide' :
        activeDesign === 'design-4' ? 'font-sans dark:text-white text-slate-900 drop-shadow-[0_0_15px_rgba(56,189,248,0.25)]' :
        activeDesign === 'design-5' ? 'font-sans dark:text-white text-slate-900 tracking-tight' :
        activeDesign === 'design-6' ? 'font-serif text-[#1e1b18] dark:bg-gradient-to-r dark:from-[#d4af37] dark:via-[#fbf5b7] dark:to-[#aa7c11] dark:bg-clip-text dark:text-transparent tracking-wide' :
        'font-sans dark:text-white text-black'
      }`}>
      {perLetter ? words.map((word, wordIdx) => (
        <span key={wordIdx} aria-hidden="true" className="hero-name-word">
          {Array.from(word).map(char => {
            const i = letterIndex++;
            return (
              <span key={i} className="hero-name-mask">
                <motion.span
                  className="hero-name-letter"
                  initial={{ y: '110%', rotate: 8, opacity: 0, filter: 'blur(6px)' }}
                  animate={{ y: '0%', rotate: 0, opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.035 }}
                >{char}</motion.span>
              </span>
            );
          })}
          {wordIdx < words.length - 1 && <span className="hero-name-space">{'\u00A0'}</span>}
        </span>
      )) : (
        <motion.span
          aria-hidden="true"
          initial={reducedMotion ? false : { clipPath: 'inset(0 100% 0 0)', opacity: 0.4 }}
          animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >{fullName}</motion.span>
      )}
      <motion.span
        aria-hidden="true"
        className={`inline-block w-[3.5px] sm:w-[4.5px] h-[0.78em] ml-1.5 rounded-full ${activeDesign === 'design-5' ? 'bg-teal-600 dark:bg-teal-400' : 'bg-amber-500 dark:bg-amber-400'} animate-pulse`}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.2 + fullName.length * 0.035, duration: 0.4 }}
      />
    </h1>
  );
});

const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, transitionEnd: { filter: 'none' } },
};

export const Hero: React.FC<HeroProps> = ({ profile, data, activeDesign = 'current' }) => {
  const [resumeBusy, setResumeBusy] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const handleResearchResumeDownload = async () => {
    setResumeBusy(true);
    setResumeError('');
    try { await downloadResearchResume(); }
    catch (error: any) { setResumeError(error.message || 'The research resume could not be downloaded.'); }
    finally { setResumeBusy(false); }
  };
  const [cvBusy, setCvBusy] = useState(false);
  const [cvError, setCvError] = useState('');
  const handleCVDownload = async () => {
    setCvBusy(true);
    setCvError('');
    try {
      const { downloadCV } = await import('../utils/generateCV');
      await downloadCV(data);
    } catch {
      setCvError('The CV could not be downloaded. Please try again.');
    } finally {
      setCvBusy(false);
    }
  };
  const [activeNode, setActiveNode] = useState<'wind' | 'biogas' | 'diesel' | 'battery' | 'electrolyzer' | 'loads' | null>('wind');
  const [isAhresExpanded, setIsAhresExpanded] = useState<boolean>(false);
  const ahresPublication = data.publications.find((publication) =>
    publication.id === 'pub-1' || publication.doi === '10.1016/j.ecmx.2026.102179'
  );

  const nodeTelemetry: Record<string, { name: string; status: string; output: string; efficiency: string; detail: string; color: string }> = {
    wind: {
      name: 'Wind Turbines (9.9 MW)',
      status: 'Primary Clean Generation',
      output: '20,830 MWh/yr',
      efficiency: '80.2% Total Yield',
      detail: 'Installed across coastal Kutubdia & Cox\'s Bazar capturing marine winds.',
      color: 'sky'
    },
    biogas: {
      name: 'Biogas Generator (500 kW)',
      status: 'Dispatchable Bioenergy',
      output: '1,841 MWh/yr',
      efficiency: '7.1% Total Yield',
      detail: 'Fueled by locally sourced organic livestock waste, replacing diesel imports.',
      color: 'emerald'
    },
    diesel: {
      name: 'Diesel Generator (4.3 MW)',
      status: 'Emergency Reserve',
      output: '3,304 MWh/yr',
      efficiency: '12.7% Total Yield',
      detail: 'Peaking backup with fuel consumption reduced by over 80% via wind integration.',
      color: 'slate'
    },
    battery: {
      name: 'Lead-Acid / Li-Ion Buffer',
      status: 'Dynamic Energy Storage',
      output: '587 Modules',
      efficiency: '10.175 MWh Capacity',
      detail: 'Provides instantaneous frequency stabilization and nighttime demand support.',
      color: 'indigo'
    },
    electrolyzer: {
      name: 'Electrolyzer (750 kW)',
      status: 'Green Hydrogen Sink',
      output: '23,540 kg H2/yr',
      efficiency: '21.7% Capacity Factor',
      detail: 'Converts surplus wind energy into clean hydrogen for emission-free coastal boats.',
      color: 'amber'
    },
    loads: {
      name: 'Off-Grid Coastal Loads',
      status: 'Community Microgrid',
      output: '18,256 MWh/yr',
      efficiency: '100% Demand Served',
      detail: 'Supplies 2,500 rural households, health clinics, cold storage, and 1,500 EV autorickshaws.',
      color: 'orange'
    }
  };

  const currentGlow = profile.avatarGlowStyle || 'ocean-cyan';
  const glowGradients: Record<string, { light: string; dark: string; borderRing: string }> = {
    'ocean-cyan': {
      light: 'from-cyan-500 via-blue-600 to-indigo-600',
      dark: 'dark:from-blue-600 dark:via-blue-500 dark:to-sky-400',
      borderRing: 'ring-4 ring-blue-200/50 dark:ring-blue-900/40'
    },
    'golden-energy': {
      light: 'from-amber-400 via-orange-400 to-emerald-500',
      dark: 'dark:from-amber-400 dark:via-teal-400 dark:to-emerald-400',
      borderRing: 'ring-4 ring-amber-200/50 dark:ring-transparent'
    },
    'royal-indigo': {
      light: 'from-indigo-600 via-purple-500 to-sky-400',
      dark: 'dark:from-indigo-400 dark:via-purple-400 dark:to-teal-400',
      borderRing: 'ring-4 ring-indigo-200/50 dark:ring-transparent'
    },
    'emerald-clean': {
      light: 'from-emerald-400 via-teal-400 to-cyan-500',
      dark: 'dark:from-emerald-400 dark:via-teal-400 dark:to-sky-400',
      borderRing: 'ring-4 ring-emerald-200/50 dark:ring-transparent'
    },
    'sunset-coral': {
      light: 'from-rose-500 via-amber-400 to-orange-400',
      dark: 'dark:from-rose-400 dark:via-amber-400 dark:to-orange-400',
      borderRing: 'ring-4 ring-rose-200/50 dark:ring-transparent'
    }
  };
  const activeGlow = glowGradients[currentGlow] || glowGradients['ocean-cyan'];

  return (
    <section className="relative pt-8 sm:pt-14 pb-12 lg:pb-16 overflow-hidden" id="hero">
      <HeroBlueprint />
      {/* Ambient energy radial accents */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.09) 0%, transparent 70%)' }} />
      <div className="absolute top-40 right-10 w-[28rem] h-[28rem] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(249,115,91,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Profile Card & Narrative */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-center lg:items-start mb-12">

          {/* Left: Profile Portrait & CTAs */}
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="show"
            className="shrink-0 flex flex-col items-center justify-start w-full max-w-[310px] sm:max-w-[325px] lg:max-w-[340px] mx-auto lg:mx-0"
          >
            {/* Portrait with Glowing Accent Ring */}
            <motion.div
              className="relative mt-3 mb-8 group hero-portrait"
              initial={{ clipPath: 'circle(0% at 50% 50%)', scale: 0.85, rotate: -12 }}
              animate={{ clipPath: 'circle(75% at 50% 50%)', scale: 1, rotate: 0, transitionEnd: { clipPath: 'none' } }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'visible' }}
            >
              <GearRing />
              <div className={`absolute -inset-2 bg-gradient-to-tr ${activeGlow.light} ${activeGlow.dark} rounded-full blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />
              {profile.avatarUrl ? (
                <img
                  src={formatImageUrl(profile.avatarUrl) || '/avatar.webp'}
                  alt={profile.name}
                  width={285}
                  height={285}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.src.endsWith('/avatar.webp')) {
                      img.src = '/avatar.webp';
                    }
                  }}
                  className={`relative w-60 h-60 sm:w-68 sm:h-68 lg:w-[285px] lg:h-[285px] rounded-full object-cover border-4 dark:border-[#0f172a] border-white shadow-2xl dark:bg-slate-900 bg-slate-100 transition-opacity duration-300 ${activeGlow.borderRing}`}
                />
              ) : (
                <img
                  src="/avatar.webp"
                  alt={profile.name}
                  width={285}
                  height={285}
                  loading="eager"
                  className={`relative w-60 h-60 sm:w-68 sm:h-68 lg:w-[285px] lg:h-[285px] rounded-full object-cover border-4 dark:border-[#0f172a] border-white shadow-2xl dark:bg-slate-900 bg-slate-100 transition-opacity duration-300 ${activeGlow.borderRing}`}
                />
              )}
            </motion.div>

            {/* Left Role Details Directly Below Avatar (NO enclosing box) */}
            <motion.div variants={heroItem} className="text-center mt-2 mb-4 space-y-0.5">
              <p className="font-serif text-[16px] sm:text-[16.5px] dark:text-white text-black font-semibold tracking-wide">
                • Mechanical Engineer
              </p>
              <p className="font-serif text-[16px] sm:text-[16.5px] dark:text-white text-black font-semibold tracking-wide">
                • Researcher • Philomath
              </p>
            </motion.div>

            {/* Action Buttons Directly Below (Stacked, Solid & Crisp) */}
            <motion.div variants={heroItem} className="flex flex-col w-full gap-2.5">
              <a
                href="#publications"
                data-magnetic="0.12"
                className={`btn-shine w-full inline-flex items-center justify-center px-4 py-2.5 text-xs tracking-wider uppercase transition-all text-center cursor-pointer ${
                  activeDesign === 'design-2'
                    ? 'rounded-full font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:scale-[1.02]'
                    : activeDesign === 'design-3'
                    ? 'rounded-md font-serif font-bold tracking-widest bg-slate-900 dark:bg-slate-950 border border-amber-500/50 text-amber-200 hover:bg-slate-800 shadow-md hover:scale-[1.01]'
                    : activeDesign === 'design-4'
                    ? 'rounded-xl font-bold backdrop-blur-2xl bg-white/10 dark:bg-slate-900/60 border border-sky-400/40 text-sky-200 hover:bg-sky-500/20 shadow-lg hover:scale-[1.01]'
                    : activeDesign === 'design-5'
                    ? 'rounded-xl font-sans font-bold tracking-wide bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-600/25 hover:scale-[1.01]'
                    : activeDesign === 'design-6'
                    ? 'rounded-lg font-serif font-bold tracking-widest bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 hover:scale-[1.01]'
                    : 'rounded-lg font-sans font-bold bg-[#0c1626] hover:bg-[#15243b] text-white shadow-sm hover:scale-[1.01]'
                }`}
              >
                View Publications
              </a>
              
              <button
                type="button"
                onClick={handleCVDownload}
                disabled={cvBusy}
                data-magnetic="0.12"
                className={`btn-shine w-full inline-flex items-center justify-center px-4 py-2.5 text-xs tracking-wider uppercase transition-all text-center cursor-pointer ${
                  activeDesign === 'design-2'
                    ? 'rounded-full font-bold bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60 shadow-sm hover:scale-[1.02]'
                    : activeDesign === 'design-3'
                    ? 'rounded-md font-serif font-bold tracking-widest bg-slate-900 dark:bg-slate-950 border border-amber-500/30 text-amber-200 hover:bg-slate-800 shadow-sm hover:scale-[1.01]'
                    : activeDesign === 'design-4'
                    ? 'rounded-xl font-bold backdrop-blur-xl bg-sky-500/10 border border-sky-400/30 text-sky-300 hover:bg-sky-500/20 shadow-sm hover:scale-[1.01]'
                    : activeDesign === 'design-5'
                    ? 'rounded-xl font-sans font-bold tracking-wide bg-white dark:bg-[#102a28] text-slate-800 dark:text-teal-100 border border-slate-200 dark:border-teal-800/60 hover:bg-slate-50 dark:hover:bg-[#163a37] shadow-sm hover:scale-[1.01]'
                    : activeDesign === 'design-6'
                    ? 'rounded-lg font-serif font-bold tracking-widest dark:bg-slate-900 bg-white dark:text-amber-300 text-amber-950 border border-amber-600/40 dark:border-amber-400/40 hover:bg-amber-50 dark:hover:bg-slate-800 shadow-sm hover:scale-[1.01]'
                    : 'rounded-lg font-sans font-bold bg-[#0c1626] hover:bg-[#15243b] text-white shadow-sm hover:scale-[1.01]'
                }`}
              >
                {cvBusy ? 'Preparing CV…' : 'Download CV'}
              </button>
              {cvError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{cvError}</p>}

              <button
                type="button"
                onClick={handleResearchResumeDownload}
                disabled={resumeBusy || !data.researchResume}
                title={data.researchResume ? "Download research resume PDF" : "Research resume not yet available"}
                data-magnetic="0.12"
                className={`btn-shine disabled:opacity-50 disabled:cursor-not-allowed w-full inline-flex items-center justify-center px-4 py-2.5 text-xs tracking-wider uppercase transition-all text-center cursor-pointer ${
                  activeDesign === 'design-2'
                    ? 'rounded-full font-bold bg-[#143e2c] border border-emerald-500/30 hover:bg-[#1b5239] text-emerald-100 shadow-sm hover:scale-[1.02]'
                    : activeDesign === 'design-3'
                    ? 'rounded-md font-serif font-bold tracking-widest bg-indigo-950 border border-indigo-700/50 hover:bg-indigo-900 text-amber-200 shadow-sm hover:scale-[1.01]'
                    : activeDesign === 'design-4'
                    ? 'rounded-xl font-bold backdrop-blur-xl bg-slate-800/80 border border-sky-400/20 hover:bg-slate-700/80 text-sky-100 shadow-sm hover:scale-[1.01]'
                    : activeDesign === 'design-5'
                    ? 'rounded-xl font-sans font-bold tracking-wide bg-orange-50 dark:bg-[#3a211d] text-orange-700 dark:text-orange-200 border border-orange-200 dark:border-orange-800/60 hover:bg-orange-100 dark:hover:bg-[#512923] shadow-sm hover:scale-[1.01]'
                    : activeDesign === 'design-6'
                    ? 'rounded-lg font-serif font-bold tracking-widest dark:bg-amber-950/80 bg-amber-900 hover:bg-amber-800 border border-amber-500/40 text-amber-100 shadow-sm hover:scale-[1.01]'
                    : 'rounded-lg font-sans font-bold bg-[#143e2c] hover:bg-[#1b5239] text-white shadow-sm hover:scale-[1.01]'
                }`}
              >
                {resumeBusy ? 'Downloading...' : 'Research Resume'}
              </button>
              {resumeError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{resumeError}</p>}

              {/* Expandable Social Strip — pure CSS, zero JS hover state, single-row flex-nowrap */}
              <div
                className="flex flex-nowrap items-center justify-center gap-1.5 sm:gap-2 mt-5 sm:mt-6 pt-1 w-full overflow-visible"
                id="hero-social-action-strip"
              >
                {[
                  {
                    label: 'LinkedIn',
                    icon: Linkedin,
                    href: profile.social?.linkedin || "https://linkedin.com/in/rashedown",
                    hoverBg: 'hover:bg-[#0a66c2]',
                    hoverShadow: 'hover:shadow-md hover:shadow-blue-600/30',
                    title: 'LinkedIn Profile',
                    target: '_blank',
                    maxWidth: 'group-hover:max-w-[80px]',
                  },
                  {
                    label: 'Google Scholar',
                    icon: GraduationCap,
                    href: profile.social?.scholar || "https://scholar.google.com",
                    hoverBg: 'hover:bg-[#4285F4]',
                    hoverShadow: 'hover:shadow-md hover:shadow-blue-500/30',
                    title: 'Google Scholar Profile',
                    target: '_blank',
                    maxWidth: 'group-hover:max-w-[125px]',
                  },
                  {
                    label: 'ResearchGate',
                    icon: ResearchGateIcon,
                    href: profile.social?.researchgate || "https://www.researchgate.net",
                    hoverBg: 'hover:bg-[#00bda6]',
                    hoverShadow: 'hover:shadow-md hover:shadow-teal-500/30',
                    title: 'ResearchGate Profile',
                    target: '_blank',
                    maxWidth: 'group-hover:max-w-[115px]',
                  },
                  {
                    label: 'ORCID',
                    icon: OrcidIcon,
                    href: profile.social?.orcid?.startsWith('http')
                      ? profile.social.orcid
                      : profile.social?.orcid
                        ? `https://orcid.org/${profile.social.orcid}`
                        : "https://orcid.org",
                    hoverBg: 'hover:bg-[#82b424]',
                    hoverShadow: 'hover:shadow-md hover:shadow-lime-600/30',
                    title: 'ORCID Profile',
                    target: '_blank',
                    maxWidth: 'group-hover:max-w-[70px]',
                  },
                  {
                    label: 'Email',
                    icon: Mail,
                    href: profile.email ? `mailto:${profile.email}` : "mailto:rashedul.islam@example.com",
                    hoverBg: 'hover:bg-[#ea4335]',
                    hoverShadow: 'hover:shadow-md hover:shadow-red-500/30',
                    title: profile.email ? `Email: ${profile.email}` : 'Send Email',
                    target: undefined,
                    maxWidth: 'group-hover:max-w-[65px]',
                  },
                ].map(({ label, icon: Icon, href, hoverBg, hoverShadow, title, target, maxWidth }) => (
                  <a
                    key={label}
                    href={href}
                    target={target}
                    rel={target ? "noopener noreferrer" : undefined}
                    aria-label={title}
                    title={title}
                    data-magnetic="0.3"
                    className={[
                      // Layout — fixed height, single line, no shrink, no wrapping
                      'group inline-flex items-center h-10 sm:h-10.5 shrink-0',
                      // Spacing — enough px to hold icon + label comfortably when expanded
                      'px-3',
                      // Shape
                      'rounded-2xl border',
                      // Colours (default)
                      'bg-white dark:bg-slate-900',
                      'border-slate-200/90 dark:border-slate-800',
                      'text-slate-700 dark:text-slate-300',
                      // Hover colours
                      hoverBg, hoverShadow,
                      'hover:border-transparent hover:text-white',
                      // Smooth CSS-only colour transition matching 500ms timing
                      'transition-[background-color,border-color,box-shadow,color] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]',
                      'cursor-pointer select-none',
                    ].join(' ')}
                  >
                    {/* Icon — absolutely stable, never moves */}
                    <Icon className="w-[18px] h-[18px] shrink-0 flex-none" />

                    {/* Label — expands via max-width with silky 500ms transition */}
                    <span
                      className={[
                        'overflow-hidden whitespace-nowrap pl-0',
                        'max-w-0 opacity-0',
                        // On group-hover smoothly open to the label width
                        maxWidth,
                        'group-hover:opacity-100',
                        'group-hover:pl-2',
                        // Timing — 500ms duration with smooth cubic bezier for a slow, silky transition
                        'transition-[max-width,opacity,padding] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]',
                        'text-[12.5px] font-semibold leading-none',
                      ].join(' ')}
                    >
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Bio & Narrative */}
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="show"
            className="flex-1 space-y-4 text-center lg:text-left"
          >
            
            <div className="h-[48px] sm:h-[56px] lg:h-[66px] flex items-center justify-center lg:justify-start overflow-visible">
              <TypewriterExecutiveName name={profile.name || "RASHEDUL ISLAM"} activeDesign={activeDesign} />
            </div>
            {/* Welcome Subtitle with Design Accent Bar */}
            <motion.div 
              variants={heroItem}
              className="flex items-center justify-center lg:justify-start gap-2.5"
            >
              <span className={`w-7 h-[2px] rounded-full inline-block shrink-0 ${
                activeDesign === 'design-2' ? 'bg-emerald-400' :
                activeDesign === 'design-3' ? 'bg-amber-500' :
                activeDesign === 'design-4' ? 'bg-sky-400' :
                activeDesign === 'design-5' ? 'bg-teal-600 dark:bg-teal-400' :
                activeDesign === 'design-6' ? 'bg-amber-400' :
                'bg-amber-500 dark:bg-amber-400'
              }`} />
              <span className={`text-[15px] sm:text-[15.5px] font-semibold tracking-tight ${
                activeDesign === 'design-3' ? 'font-serif dark:text-amber-100 text-slate-800' :
                'font-sans dark:text-white text-slate-900'
              }`}>
                Welcome to my personal webpage.
              </span>
            </motion.div>
            
            {/* Bio Paragraphs - Professional pure black high-contrast styling */}
            <motion.div 
              variants={heroStagger}
              className={`space-y-3.5 text-[15px] sm:text-[15.5px] dark:text-slate-100 text-slate-900 leading-[1.70] font-normal text-justify ${
                activeDesign === 'design-3' ? 'font-serif text-[16px]' : 'font-sans'
              }`}
            >
              {profile.aboutText && profile.aboutText.length > 0 ? (
                profile.aboutText.map((paragraph, pIdx) => (
                  <motion.p key={pIdx} variants={heroItem}>
                    {paragraph}
                  </motion.p>
                ))
              ) : (
                <motion.p variants={heroItem}>{profile.bio}</motion.p>
              )}
            </motion.div>

          </motion.div>
        </div>

        {/* Full-width My Current Research Interest Section */}
        <div 
          className="w-full mb-8 -mt-2 space-y-2.5 text-left"
        >
          <div className="flex items-center gap-2.5">
            <span className={`w-7 h-[2px] rounded-full inline-block shrink-0 ${
              activeDesign === 'design-2' ? 'bg-emerald-400' :
              activeDesign === 'design-3' ? 'bg-amber-500' :
              activeDesign === 'design-4' ? 'bg-sky-400' :
              activeDesign === 'design-5' ? 'bg-teal-600 dark:bg-teal-400' :
              activeDesign === 'design-6' ? 'bg-amber-400' :
              'bg-amber-500 dark:bg-amber-400'
            }`} />
            <span className={`text-[15px] sm:text-[15.5px] font-semibold tracking-tight ${
              activeDesign === 'design-3' ? 'font-serif text-lg dark:text-amber-100 text-slate-800' :
              'font-sans dark:text-white text-slate-900'
            }`}>
              My Current Research Interest
            </span>
          </div>
          <p className={`text-[15.5px] sm:text-[16px] dark:text-slate-100 text-slate-900 leading-[1.72] font-normal text-justify ${
            activeDesign === 'design-3' ? 'font-serif text-[17px]' : 'font-sans'
          }`}>
            {profile.researchInterestText || "My work centers on computational fluid dynamics and hydrogen combustion, extending into materials science, heat transfer, and additive manufacturing. Renewable energy systems- particularly hybrid, off-grid optimized solutions- round out this focus, with simulation-driven modeling as the common thread across all of it."}
          </p>
          
          {/* Research Interest Tags / Buttons with Design-Specific Shapes & Styles */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {(profile.researchInterests || ['Materials Science', 'Additive Manufacturing Materials', 'Renewable Energy', 'Hydrogen Fuel', 'CFD in biofuels']).map((interest, idx) => (
              <span 
                key={idx} 
                className={`px-4 py-2 text-xs sm:text-[13px] font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                  activeDesign === 'design-2'
                    ? 'rounded-full dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:border-emerald-500'
                    : activeDesign === 'design-3'
                    ? 'rounded font-serif dark:bg-amber-950/50 dark:border-amber-500/40 dark:text-amber-200 bg-amber-50 border border-amber-300 text-amber-900 hover:border-amber-500'
                    : activeDesign === 'design-4'
                    ? 'rounded-2xl backdrop-blur-xl dark:bg-slate-900/60 dark:border-sky-400/30 dark:text-sky-200 bg-sky-50 border border-sky-300 text-sky-900 hover:border-sky-400'
                    : activeDesign === 'design-5'
                    ? 'rounded-xl font-sans dark:bg-teal-950/40 dark:border-teal-800/60 dark:text-teal-100 bg-teal-50/80 border border-teal-200 text-teal-900 hover:border-teal-400'
                    : activeDesign === 'design-6'
                    ? 'rounded-md font-serif dark:bg-amber-950/40 dark:border-amber-400/40 dark:text-amber-200 bg-amber-50/90 border border-amber-400/60 text-amber-950 hover:border-amber-600 font-semibold'
                    : 'rounded-lg dark:bg-slate-900/90 dark:border-slate-800 dark:text-amber-300 dark:hover:border-amber-400/60 bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 hover:border-amber-300'
                }`}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive 3D CFD Velocity & Hydrogen Swirl Simulation Viewport */}
        <div
          className="w-full mb-8 -mt-2"
        >
          <WhenNear fallback={<div className="h-[330px] rounded-3xl bg-slate-900/80 animate-pulse" role="status" aria-label="Loading 3D turbine" />}>
            <Suspense fallback={<div className="h-[330px] rounded-3xl bg-slate-900/80 animate-pulse" role="status" aria-label="Loading 3D turbine" />}><Hero3DCanvas 
              onOpenLab={() => {
                const el = document.getElementById('3d-simulation-lab');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            /></Suspense>
          </WhenNear>
        </div>

        {/* Bottom Section: Interactive Hybrid Energy Simulation Topology */}
        <motion.div
          {...reveal(0, 'scale')}
          className="w-full"
        >
          <div className={`relative p-5 sm:p-7 shadow-2xl backdrop-blur-xl transition-all ${
            activeDesign === 'design-2'
              ? 'rounded-3xl dark:bg-[#031d1a]/90 bg-white/95 border border-emerald-500/30 shadow-emerald-500/10'
              : activeDesign === 'design-3'
              ? 'rounded-xl dark:bg-[#0e121e]/95 bg-[#F9F7F2]/95 border-2 border-double dark:border-amber-600/30 border-amber-800/20 shadow-md font-serif'
              : activeDesign === 'design-4'
              ? 'rounded-2xl dark:bg-slate-950/45 bg-white/60 backdrop-blur-2xl border border-sky-400/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : activeDesign === 'design-5'
              ? 'rounded-2xl dark:bg-[#102422]/90 bg-white/95 border border-slate-200 dark:border-teal-900/40 shadow-xl shadow-teal-950/10'
              : activeDesign === 'design-6'
              ? 'rounded-lg dark:bg-[#09090b]/95 bg-[#F9F7F2]/95 border border-amber-400/30 shadow-amber-500/10'
              : 'rounded-3xl dark:bg-[#0c131d]/90 bg-white/90 border dark:border-slate-800 border-slate-200'
          }`}>

            {/* Header of Diagram */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-slate-800/80 border-slate-200/80 pb-4 mb-5 gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg dark:bg-teal-300/10 bg-[#e8f1ed] border dark:border-teal-300/25 border-teal-200 flex items-center justify-center">
                  <Activity className="w-4 h-4 dark:text-teal-300 text-teal-700 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-mono tracking-wider dark:text-white text-slate-900 uppercase font-bold">
                    Latest Research Snapshot · AHRES Coastal Microgrid
                  </h3>
                  <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500">
                    Techno-Economic Optimization Topology · Bangladesh Coastal Microgrid
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full dark:bg-teal-950/35 dark:text-teal-200 dark:border-teal-800/60 bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                  HOMER Pro Validated
                </span>
                {ahresPublication && (
                  <a
                    href={`#pub-card-${ahresPublication.id}`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full dark:bg-teal-950/35 dark:text-teal-200 dark:border-teal-800/60 bg-teal-50 text-teal-800 border border-teal-200 font-semibold transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/45"
                  >
                    <BookOpen className="h-3 w-3" />
                    Cross-reference
                  </a>
                )}
                {ahresPublication && (ahresPublication.link || ahresPublication.doi) && (
                  <a
                    href={ahresPublication.link || `https://doi.org/${ahresPublication.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full dark:bg-teal-950/35 dark:text-teal-200 dark:border-teal-800/60 bg-teal-50 text-teal-800 border border-teal-200 font-semibold transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/45"
                  >
                    <ExternalLink className="h-3 w-3" />
                    DOI
                  </a>
                )}
              </div>
            </div>

            {/* Collapsible AHRES Container: Smooth, luxurious slow expansion animation */}
            <motion.div
              initial={false}
              animate={{ height: isAhresExpanded ? 'auto' : 125 }}
              transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
              className="relative overflow-hidden"
            >
              {/* Topology Interactive Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-7 items-center gap-4 lg:gap-3">

                {/* AC Generation Side: Wind, Biogas, Diesel (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold dark:text-slate-400 text-slate-600 uppercase tracking-wider mb-1 px-1">
                    <span>Generation Sources</span>
                    <span className="text-[10px] font-normal dark:text-slate-500 text-slate-400">AC Bus</span>
                  </div>

                  {/* Wind Node */}
                  <button
                    type="button"
                    onClick={() => setActiveNode('wind')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${activeNode === 'wind'
                        ? 'dark:bg-teal-950/35 dark:border-teal-400/70 bg-[#e8f1ed] border-teal-400 shadow-md shadow-teal-900/10'
                        : 'dark:bg-slate-900/60 bg-white/70 dark:border-slate-800 border-slate-200 hover:border-teal-400/60'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-xl dark:bg-teal-300/10 bg-[#e8f1ed] border dark:border-teal-300/25 border-teal-200 flex items-center justify-center dark:text-teal-300 text-teal-700 shrink-0">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-bold dark:text-white text-slate-900 leading-tight">WIND TURBINES</div>
                      <div className="text-[11px] font-mono dark:text-teal-300 text-teal-700 font-semibold">9.9 MW · 20.8 GWh/yr</div>
                    </div>
                  </button>

                  {/* Biogas Node */}
                  <button
                    type="button"
                    onClick={() => setActiveNode('biogas')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${activeNode === 'biogas'
                        ? 'dark:bg-teal-950/35 dark:border-teal-400/70 bg-[#e8f1ed] border-teal-400 shadow-md shadow-teal-900/10'
                        : 'dark:bg-slate-900/60 bg-white/70 dark:border-slate-800 border-slate-200 hover:border-teal-400/60'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-xl dark:bg-teal-300/10 bg-[#e8f1ed] border dark:border-teal-300/25 border-teal-200 flex items-center justify-center dark:text-teal-300 text-teal-700 shrink-0">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-bold dark:text-white text-slate-900 leading-tight">BIOGAS GENERATOR</div>
                      <div className="text-[11px] font-mono dark:text-teal-300 text-teal-700 font-semibold">500 kW · Bio-waste Fuel</div>
                    </div>
                  </button>

                  {/* Diesel Node */}
                  <button
                    type="button"
                    onClick={() => setActiveNode('diesel')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${activeNode === 'diesel'
                        ? 'dark:bg-slate-800/80 dark:border-slate-600 bg-slate-100 border-slate-400 shadow-md'
                        : 'dark:bg-slate-900/60 bg-white/70 dark:border-slate-800 border-slate-200 hover:border-slate-400'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/30 flex items-center justify-center dark:text-slate-400 text-slate-600 shrink-0">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-bold dark:text-white text-slate-900 leading-tight">PEAK DIESEL GEN</div>
                      <div className="text-[11px] font-mono dark:text-slate-400 text-slate-600 font-semibold">4.3 MW · Reserve Only</div>
                    </div>
                  </button>
                </div>

                {/* Central Bi-directional Converter (1 col) */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0">
                  <div className="text-[9px] font-mono dark:text-teal-300 text-teal-700 uppercase tracking-widest font-semibold mb-2">CONVERTER</div>
                  <div className="w-14 h-14 rounded-2xl border-2 dark:border-teal-300/70 border-teal-500 dark:bg-teal-950/35 bg-[#e8f1ed] flex flex-col items-center justify-center shadow-xl dark:shadow-teal-900/20 shadow-teal-900/10 relative overflow-hidden group">
                    <Zap className="w-6 h-6 dark:text-teal-300 text-teal-700 relative z-10" />
                    <div className="absolute inset-0 bg-teal-300/20 dark:bg-teal-300/15 animate-ping rounded-2xl" style={{ animationDuration: '3s' }}></div>
                  </div>
                  <span className="text-[10px] font-mono font-bold dark:text-slate-300 text-slate-700 mt-2">1.47 MW</span>
                  <span className="text-[8px] font-mono dark:text-slate-500 text-slate-400">Bidirectional</span>
                </div>

                {/* DC Storage & Community Demand Side (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold dark:text-slate-400 text-slate-600 uppercase tracking-wider mb-1 px-1">
                    <span>Storage & Demand</span>
                    <span className="text-[10px] font-normal dark:text-slate-500 text-slate-400">DC Bus</span>
                  </div>

                  {/* Loads Node */}
                  <button
                    type="button"
                    onClick={() => setActiveNode('loads')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${activeNode === 'loads'
                        ? 'dark:bg-teal-950/35 dark:border-teal-400/70 bg-[#e8f1ed] border-teal-400 shadow-md shadow-teal-900/10'
                        : 'dark:bg-slate-900/60 bg-white/70 dark:border-slate-800 border-slate-200 hover:border-teal-400/60'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-xl dark:bg-teal-300/10 bg-[#e8f1ed] border dark:border-teal-300/25 border-teal-200 flex items-center justify-center dark:text-teal-300 text-teal-700 shrink-0">
                      <Home className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-bold dark:text-white text-slate-900 leading-tight">COMMUNITY LOADS</div>
                      <div className="text-[11px] font-mono dark:text-teal-300 text-teal-700 font-semibold">18.2 GWh/yr · 2,500 Homes</div>
                    </div>
                  </button>

                  {/* Battery Node */}
                  <button
                    type="button"
                    onClick={() => setActiveNode('battery')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${activeNode === 'battery'
                        ? 'dark:bg-teal-950/35 dark:border-teal-400/70 bg-[#e8f1ed] border-teal-400 shadow-md shadow-teal-900/10'
                        : 'dark:bg-slate-900/60 bg-white/70 dark:border-slate-800 border-slate-200 hover:border-teal-400/60'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-xl dark:bg-teal-300/10 bg-[#e8f1ed] border dark:border-teal-300/25 border-teal-200 flex items-center justify-center dark:text-teal-300 text-teal-700 shrink-0">
                      <BatteryCharging className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-bold dark:text-white text-slate-900 leading-tight">BATTERY STORAGE</div>
                      <div className="text-[11px] font-mono dark:text-teal-300 text-teal-700 font-semibold">10.17 MWh · 587 Units</div>
                    </div>
                  </button>

                  {/* Electrolyzer Node */}
                  <button
                    type="button"
                    onClick={() => setActiveNode('electrolyzer')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${activeNode === 'electrolyzer'
                        ? 'dark:bg-teal-950/35 dark:border-teal-400/70 bg-[#e8f1ed] border-teal-400 shadow-md shadow-teal-900/10'
                        : 'dark:bg-slate-900/60 bg-white/70 dark:border-slate-800 border-slate-200 hover:border-teal-400/60'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-xl dark:bg-teal-300/10 bg-[#e8f1ed] border dark:border-teal-300/25 border-teal-200 flex items-center justify-center dark:text-teal-300 text-teal-700 shrink-0">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-bold dark:text-white text-slate-900 leading-tight">ELECTROLYZER → H2</div>
                      <div className="text-[11px] font-mono dark:text-teal-300 text-teal-700 font-semibold">750 kW · 23.5 t H2/yr</div>
                    </div>
                  </button>
                </div>

              </div>

              {/* Dynamic Node Inspector Telemetry Details Drawer */}
              {activeNode && nodeTelemetry[activeNode] && (
                <motion.div
                  key={activeNode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-5 p-4 rounded-2xl dark:bg-slate-900/90 bg-slate-100/90 border dark:border-slate-800 border-slate-200 shadow-inner"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold dark:text-teal-200 text-teal-800">
                          {nodeTelemetry[activeNode].name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-300 bg-slate-200 text-slate-800 font-semibold">
                          {nodeTelemetry[activeNode].status}
                        </span>
                      </div>
                      <p className="text-xs dark:text-slate-300 text-slate-700 font-sans">
                        {nodeTelemetry[activeNode].detail}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono shrink-0">
                      <span className="px-2.5 py-1 rounded-lg dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 shadow-xs">
                        ⚡ {nodeTelemetry[activeNode].output}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 dark:text-teal-300 text-teal-700 font-bold shadow-xs">
                        📊 {nodeTelemetry[activeNode].efficiency}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Gradient Fade-Out Overlay when Collapsed */}
              <AnimatePresence>
                {!isAhresExpanded && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#102422] dark:via-[#102422]/95 to-transparent pointer-events-none z-10" 
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Show More / Show Less Toggle Button */}
            <div className="mt-4 pt-2 flex justify-center relative z-20 border-t border-slate-200/60 dark:border-slate-800/60">
              <button
                type="button"
                onClick={() => setIsAhresExpanded(!isAhresExpanded)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all duration-300 cursor-pointer shadow-md bg-[#e8f1ed] hover:bg-teal-100 dark:bg-teal-950/35 dark:hover:bg-teal-900/45 border border-teal-200 dark:border-teal-800/60 text-teal-800 dark:text-teal-200 hover:scale-102 active:scale-98"
              >
                <span>{isAhresExpanded ? 'Show Less AHRES Topology' : 'Show More (View Full AHRES Microgrid Topology)'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-500 ease-out text-teal-700 dark:text-teal-300 ${isAhresExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
