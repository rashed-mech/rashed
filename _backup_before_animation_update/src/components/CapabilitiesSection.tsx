import { motion } from 'motion/react';
import React, { useState } from 'react';
import { 
  Cpu, 
  Settings, 
  Activity, 
  Flame, 
  Database,
  Zap,
  ChevronDown
} from 'lucide-react';
import { SkillGroup } from '../types';

interface CapabilitiesSectionProps {
  config?: { title: string; subtitle: string };
  skillGroups: SkillGroup[];
}

export const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({ skillGroups, config }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const filteredGroups = activeCategory === 'all' 
    ? skillGroups 
    : skillGroups.filter(sg => sg.id === activeCategory);

  // When 'all' is selected and not expanded, show first 2 categories; otherwise show all matching
  const displayedGroups = (activeCategory === 'all' && !isExpanded)
    ? filteredGroups.slice(0, 2)
    : filteredGroups;

  const getCategoryIcon = (index: number) => {
    switch (index % 5) {
      case 0: return Flame;
      case 1: return Cpu;
      case 2: return Activity;
      case 3: return Settings;
      default: return Database;
    }
  };

  const getDisciplineTag = (index: number) => {
    switch (index % 5) {
      case 0: return 'AERODYNAMICS & CFD';
      case 1: return 'TECHNO-ECONOMIC OPTIMIZATION';
      case 2: return 'MOLECULAR DYNAMICS';
      case 3: return 'SYSTEMS & CAPACITY';
      default: return 'DATA & COMPUTATION';
    }
  };

  return (
    <section className="py-12 sm:py-16 border-t dark:border-slate-800/80 border-slate-300/80 dark:bg-[#060a10]/80 bg-[#f8fafc] relative overflow-hidden" id="capabilities">
      
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Clean container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Spanning FULL WIDTH from Left to Right (Request 2 & 3) */}
        <div className="w-full max-w-none space-y-2.5 mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 font-sans">
            {config?.title ?? "Core Engineering & Simulation Proficiencies"}
          </h2>
          
          {/* Expanded Full Width Description across container (Request 2) with High Contrast (Request 3) */}
          <p className="text-sm sm:text-base dark:text-slate-300 text-slate-600 font-normal leading-relaxed text-justify sm:text-left w-full max-w-none">
            {config?.subtitle ?? "Multi-disciplinary expertise uniting renewable techno-economic modeling, computational fluid dynamics (CFD), atomistic molecular dynamics, and thermo-hydraulic simulation."}
          </p>

          {/* Category Filter Pills: Placed directly below heading, high-contrast in light mode (Request 3) */}
          <div className="pt-2 flex flex-wrap items-center gap-2 select-none">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-150 cursor-pointer border select-none whitespace-nowrap shadow-xs ${
                activeCategory === 'all'
                  ? 'dark:bg-blue-600 dark:text-white dark:border-blue-600 bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                  : 'dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              All Capabilities
            </button>
            
            {skillGroups.map((group) => {
              const isActive = activeCategory === group.id;
              const shortLabel = group.category.split('&')[0].trim();
              return (
                <button
                  type="button"
                  key={group.id}
                  onClick={() => setActiveCategory(group.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-150 cursor-pointer border select-none whitespace-nowrap shadow-xs ${
                    isActive
                      ? 'dark:bg-blue-600 dark:text-white dark:border-blue-600 bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Highly Congested Connected Vertical Timeline Spine (Request 1) */}
        <div className="relative pt-2 pb-0">
          
          {/* Central Vertical Spine Line - Ends cleanly at the horizontal ash line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-1/2 -translate-x-1/2 w-0.5 bg-slate-200 dark:bg-slate-800 opacity-90 pointer-events-none" />

          {/* Alternating Connected Cards with Tight Congested Spacing (Request 1) */}
          <div className="space-y-3 sm:space-y-3.5 pb-2">
            {displayedGroups.map((group, idx) => {
              const Icon = getCategoryIcon(idx);
              const isEven = idx % 2 === 0;
              const disciplineTag = getDisciplineTag(idx);

              return (
                <motion.div 
                  key={group.id} 
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.5, delay: 0.04 + idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex flex-col md:flex-row items-center"
                >
                  
                  {/* Spine Node: High contrast hollow circle */}
                  <div className="absolute left-5 md:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <div className="w-5.5 h-5.5 rounded-full dark:bg-slate-950 bg-white border-2 dark:border-blue-500 border-blue-600 flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full dark:bg-blue-400 bg-blue-600" />
                    </div>
                    <span className="absolute -top-4 text-[9px] font-mono font-bold dark:text-blue-400 text-blue-600 hidden md:block">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Card Container: Compact, Congested Padding */}
                  <div className={`w-full md:w-[48%] pl-12 md:pl-0 ${
                    isEven ? 'md:mr-auto md:pr-5' : 'md:ml-auto md:pl-5'
                  }`}>
                    <div
                      className="p-3.5 sm:p-4 rounded-xl dark:bg-[#0c131d]/95 bg-white backdrop-blur-xl border dark:border-slate-800/80 border-slate-300/90 hover:border-blue-500/50 dark:hover:border-blue-400/50 shadow-sm hover:shadow-md transition-all duration-200 relative group hover:-translate-y-0.5"
                    >
                      {/* Horizontal Leader Connector Line to Central Node */}
                      <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-0.5 w-5 bg-slate-300 dark:bg-slate-800 ${
                        isEven ? '-right-5' : '-left-5'
                      }`} />

                      {/* Card Header */}
                      <div className="flex items-center space-x-2.5 mb-2">
                        <div className="w-8 h-8 rounded-lg dark:bg-blue-400/10 bg-blue-50 dark:border-blue-400/30 border-blue-200 flex items-center justify-center dark:text-blue-400 text-blue-600 shrink-0 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-mono font-bold tracking-widest dark:text-blue-400 text-blue-600 uppercase">
                            {disciplineTag}
                          </div>
                          <h3 className="text-sm sm:text-[15px] font-bold dark:text-white text-slate-900 leading-tight truncate">
                            {group.category}
                          </h3>
                        </div>
                      </div>

                      {group.description && (
                        <p className="text-[11.5px] dark:text-slate-300 text-slate-600 leading-relaxed text-justify mb-2.5">
                          {group.description}
                        </p>
                      )}

                      {/* Skills Designed as Badge Chips - NO PERCENTAGES (Request 1) */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t dark:border-slate-800/80 border-slate-200/80">
                        {group.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-200 text-slate-800 border shadow-2xs hover:border-blue-400/50 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full dark:bg-blue-400 bg-blue-600 shrink-0" />
                            <span>{skill.name}</span>
                          </span>
                        ))}
                      </div>

                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Horizontal Ash Line & Show More Button (Middle line ends right at this horizontal line!) */}
        {activeCategory === 'all' && skillGroups.length > 2 && (
          <div className="mt-4 pt-4 flex justify-center relative z-20 border-t border-slate-300/80 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-sm dark:bg-slate-900 bg-blue-600 text-white dark:border-blue-500/40 border-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95"
            >
              <span>
                {isExpanded 
                  ? 'Show Less Capabilities' 
                  : `Show More (${skillGroups.length - 2} More Engineering Disciplines)`}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
