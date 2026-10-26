import { motion } from 'motion/react';
import { reveal, cardHover } from '../lib/motion';
import React, { useState } from 'react';
import { 
  Cpu, 
  Flame, 
  Wrench, 
  Compass, 
  MapPin, 
  ShieldCheck,
  Award,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Profile, PortfolioData } from '../types';
import { publicationStats } from '../utils/publicationStats';

interface OverviewSectionProps {
  profile: Profile;
  data?: PortfolioData;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ profile, data }) => {
  const { citations: displayCitations, hIndex: displayHIndex } = data
    ? publicationStats(data.publications) : profile.stats;

  const fallbackPillars = [
    {
      icon: Flame,
      title: 'Computation Fluid Dynamics',
      tag: 'CONVERGE 3.0 · COMSOL Multiphysics · SolidWorks',
      description: 'Combustion modeling of green hydrogen vs conventional fuels in PFI SI engines, thermo-hydraulic heat exchanger modeling, and atomistic molecular dynamics.',
      galleryUrls: [] as string[]
    },
    {
      icon: Cpu,
      title: 'Hybrid Energy Modelling',
      tag: 'HOMER Pro · PVsyst · RETscreen',
      description: 'Hybrid system optimization, LCOE/NPC/LCOH techno-economic analysis, load assessment, life cycle analysis (LCA), and off-grid system validation with uncertainty analysis (Montecarlo) and multi-objective optimization (MOPSO/NSGA-II)',
      galleryUrls: [] as string[]
    },
    {
      icon: Wrench,
      title: 'Electrical & Maintenance',
      tag: 'Preventive & Corrective Diagnostics',
      description: 'Electrical installation assessment, PV integration, diesel/biogas generator performance monitoring, and safety compliance in resource-constrained environments.',
      galleryUrls: [] as string[]
    },
    {
      icon: Compass,
      title: 'Fieldwork & Humanitarian Support',
      tag: 'Remote Infrastructure · Capacity Building',
      description: 'Hands-on fieldwork across coastal Bangladesh, technician coaching, technical documentation, and applying energy expertise for coastal community.',
      galleryUrls: [] as string[]
    }
  ];
  
  const fallbackMetrics = [
    { value: '6 Papers', label: 'Journal Publications & Research', sub: '3 Published · 2 Under Review · 1 Submitted' },
    { value: '3.363 / 4.00', label: 'B.Sc. Mechanical Engineering', sub: 'HSTU Dinajpur (2019–2022)' },
    { value: 'CSWE', label: 'SolidWorks Certified', sub: 'CAD Professional & Sheet Metal' },
    { value: '2 Medals', label: 'Physics & Math Olympiad', sub: 'Divisional & Regional Awards' }
  ];

  const iconMap: Record<string, any> = { Cpu, Flame, Wrench, Compass, MapPin, ShieldCheck, Award, BookOpen };
  
  const pillars = data?.pillars?.length ? data.pillars.map(p => ({...p, icon: iconMap[p.icon as string] || Cpu})) : fallbackPillars;
  const metrics = data?.metrics?.length ? data.metrics : fallbackMetrics;

  const [selectedPillarIdx, setSelectedPillarIdx] = useState<number | null>(null);
  const [selectedSlideIdx, setSelectedSlideIdx] = useState(0);
  
  const selectedPillar = selectedPillarIdx !== null ? pillars[selectedPillarIdx] : null;
  const modalSlides = selectedPillar?.galleryUrls || [];

  const handlePillarClick = (idx: number) => {
    if (pillars[idx].galleryUrls && pillars[idx].galleryUrls.length > 0) {
      setSelectedPillarIdx(idx);
      setSelectedSlideIdx(0);
    }
  };

  return (
    <section className="pt-6 sm:pt-10 pb-12 sm:pb-16" id="overview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Typography Header (Inspired by https://alejandroha.com/) */}
        <div className="mb-8 sm:mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white text-slate-900 font-sans">
            Core Engineering Pillars & Academic Milestones
          </h2>
          <p className="text-sm sm:text-base dark:text-slate-300 text-slate-600 w-full max-w-none leading-relaxed">
            Multi-physics numerical simulation, thermo-fluid diagnostics, clean hydrogen microgrids, and peer-reviewed mechanical engineering research.
          </p>
        </div>

        {/* Narrative & Impact Highlights with Bidirectional Staggered Entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {metrics.map((m, idx) => (
            <motion.div 
              key={idx} 
              {...reveal(idx, 'up')} whileHover={cardHover}
              className="p-5 rounded-2xl dark:bg-[#0c131d]/85 bg-white/85 backdrop-blur-xl border dark:border-slate-800/80 border-slate-200/80 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-xl dark:hover:shadow-blue-500/5 transition-[border-color,background-color,box-shadow] duration-200 group flex flex-col justify-between cursor-default"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold dark:text-blue-400 text-blue-600 group-hover:scale-105 transition-transform origin-left">
                    {m.value}
                  </div>
                  {idx === 0 && (displayCitations > 0 || displayHIndex > 0) && (
                    <div className="flex flex-col items-end text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full dark:bg-blue-400/15 dark:border-blue-400/40 border border-blue-200 dark:text-blue-300 bg-blue-50 text-blue-800 shadow-xs">
                        <span className="text-xs font-bold font-sans">{displayCitations}</span>
                        <span className="text-[8px] uppercase tracking-widest font-semibold">Cites</span>
                      </div>
                      <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 mt-1">
                        h-index: <span className="font-bold dark:text-blue-400 text-blue-600">{displayHIndex}</span>
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs font-semibold dark:text-white text-slate-900 mt-2">
                  {m.label}
                </div>
              </div>
              <div className="text-[11px] font-mono dark:text-slate-400 text-slate-500 mt-3 pt-2 border-t dark:border-slate-800/60 border-slate-100">
                {m.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4 Core Pillars Grid with Bidirectional Staggered Entrance */}
        {data?.sectionConfig?.overview?.showPillars !== false && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div 
                  key={idx} 
                  onClick={() => handlePillarClick(idx)}
                  {...reveal(idx, 'up')} whileHover={cardHover}
                  className={`p-5 rounded-2xl dark:bg-[#0c131d]/85 bg-white/85 backdrop-blur-xl border transition-[border-color,background-color,box-shadow] duration-200 flex flex-col group shadow-sm hover:shadow-xl ${
                    pillar.galleryUrls && pillar.galleryUrls.length > 0 
                      ? 'cursor-pointer dark:border-slate-800 border-slate-200 hover:border-blue-500 dark:hover:border-blue-400' 
                      : 'dark:border-slate-800/80 border-slate-200/80 hover:border-blue-500/60 dark:hover:border-blue-400/60'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 shrink-0 rounded-xl dark:bg-blue-400/10 dark:border-blue-400/30 bg-blue-50 border border-blue-200/80 flex items-center justify-center dark:text-blue-400 text-blue-600 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold dark:text-white text-slate-900 leading-tight">
                      {pillar.title}
                    </h3>
                  </div>
                  <div className="text-[11px] font-mono font-semibold dark:text-blue-400 text-blue-600 mb-2">
                    {pillar.tag}
                  </div>
                  <p className="text-xs sm:text-[13px] dark:text-slate-300 text-slate-600 leading-relaxed text-justify">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
