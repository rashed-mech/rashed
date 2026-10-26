import { useActiveSection } from '../hooks/useActiveSection';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Cpu, 
  Layers, 
  Briefcase, 
  BookOpen, 
  Award, 
  Trophy, 
  Mail,
  Flame,
  ChevronRight
} from 'lucide-react';
import { SectionConfig, UXDesignId } from '../types';

interface SectionItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  direction: string;
}

interface ScrollSectionRadarProps {
  sectionConfig?: SectionConfig;
  activeDesign?: UXDesignId;
  darkMode?: boolean;
}

export const ScrollSectionRadar: React.FC<ScrollSectionRadarProps> = ({
  sectionConfig,
  activeDesign = 'current',
  darkMode = true
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const sections: SectionItem[] = [
    { id: 'overview', label: 'Overview & Impact', shortLabel: '01', icon: Flame, direction: 'Float Up' },
    { id: 'capabilities', label: 'Capabilities & Skills', shortLabel: '02', icon: Layers, direction: 'Slide Left' },
    { id: 'projects', label: 'Innovation Deck', shortLabel: '03', icon: Layers, direction: 'Slide Right' },
    { id: 'experience', label: 'Career & Education', shortLabel: '04', icon: Briefcase, direction: 'Rise Vertical' },
    { id: 'publications', label: 'Scholarly Papers', shortLabel: '05', icon: BookOpen, direction: 'Diagonal Left' },
    { id: 'training', label: 'Certifications', shortLabel: '06', icon: Award, direction: 'Diagonal Right' },
    { id: 'honors-activities', label: 'Distinctions & Honors', shortLabel: '07', icon: Trophy, direction: 'Scale Crest' },
    { id: '3d-simulation-lab', label: 'Micro-Turbine Lab', shortLabel: '08', icon: Cpu, direction: 'Cinematic Zoom' },
    { id: 'contact', label: 'Contact & Collaboration', shortLabel: '09', icon: Mail, direction: 'Magnetic Glow' }
  ];

  // Filter out hidden sections based on sectionConfig
  const visibleSections = sections.filter(sec => {
    if (sec.id === 'overview' && sectionConfig?.overview?.visible === false) return false;
    if (sec.id === 'capabilities' && sectionConfig?.capabilities?.visible === false) return false;
    if (sec.id === 'projects' && sectionConfig?.projects?.visible === false) return false;
    if (sec.id === 'experience' && sectionConfig?.experience?.visible === false) return false;
    if (sec.id === 'publications' && sectionConfig?.publications?.visible === false) return false;
    if (sec.id === 'training' && sectionConfig?.trainings?.visible === false) return false;
    if (sec.id === 'honors-activities' && sectionConfig?.honors?.visible === false) return false;
    if (sec.id === 'contact' && sectionConfig?.contact?.visible === false) return false;
    return true;
  });

  const activeSection = useActiveSection(visibleSections.map(section => section.id));

  useEffect(() => {
    const handleScroll = () => {
      // Show radar only after user scrolls past hero section (> 300px)
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 280);


    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionConfig]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed right-3.5 sm:right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end gap-2.5 pointer-events-none select-none"
      aria-label="Section Navigation Radar"
    >
      <div className="bg-slate-900/80 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-700/60 dark:border-slate-800/80 p-2 rounded-2xl shadow-2xl pointer-events-auto flex flex-col items-center gap-2 transition-all">
        {visibleSections.map((sec, index) => {
          const isActive = activeSection === sec.id;
          const isHovered = hoveredSection === sec.id;
          const Icon = sec.icon;

          return (
            <div 
              key={sec.id}
              className="relative flex items-center justify-center group"
              onMouseEnter={() => setHoveredSection(sec.id)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              {/* Tooltip on Hover (slides out to the left) */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.92 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-slate-100 border border-slate-700/80 dark:border-blue-500/30 shadow-xl backdrop-blur-xl pointer-events-none whitespace-nowrap z-50 flex items-center gap-2"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-semibold">{sec.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 font-bold border border-blue-400/30">
                      {sec.direction}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Dot Button */}
              <button
                type="button"
                onClick={() => scrollTo(sec.id)}
                className={`relative w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/60 shadow-lg shadow-blue-500/25 scale-110'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
                title={sec.label}
              >
                {isActive ? (
                  <motion.div 
                    layoutId="activeRadarIndicator"
                    className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-slate-300 group-hover:scale-125 transition-all" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
