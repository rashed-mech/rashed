import React from 'react';
import { Sparkles, Terminal, CheckCircle2, Code } from 'lucide-react';
import { SkillGroup } from '../types';

interface SkillsSectionProps {
  skillGroups: SkillGroup[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skillGroups }) => {
  return (
    <section className="py-16 md:py-24 bg-slate-50/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60" id="skills">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
            Technical & Research Proficiencies
          </h2>
          <p className="text-sm text-black dark:text-slate-400 text-justify">
            Frameworks, computational libraries, programming languages, and scientific methodologies.
          </p>
        </div>

        {/* Skill Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillGroups.map((group) => (
            <div
              key={group.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4"
              id={`skill-group-${group.id}`}
            >
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  {group.category}
                </h3>
                {group.description && (
                  <p className="text-xs text-black dark:text-slate-400 mt-0.5 text-justify">
                    {group.description}
                  </p>
                )}
              </div>

              {/* Skills Chips / Bars */}
              <div className="flex flex-wrap gap-2 pt-2">
                {group.skills.map((skill, sIdx) => (
                  <div
                    key={sIdx}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      skill.highlight
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-700/60 text-black dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {skill.highlight && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    )}
                    <span>{skill.name}</span>
                    {skill.level !== undefined && (
                      <span className="text-[10px] opacity-70 font-mono">
                        ({skill.level}%)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
