import { motion } from 'motion/react';
import { reveal, cardHover } from '../lib/motion';
import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Calendar,
  MapPin,
  CheckCircle,
  Award,
  ChevronRight,
  Link as LinkIcon
} from 'lucide-react';
import { Experience, Education } from '../types';

interface ExperienceSectionProps {
  config?: { title: string; subtitle: string };
  experience: Experience[];
  education: Education[];
}

const renderWithLinks = (text: string) => {
  if (!text) return null;
  const parts = text.split(/\[([^\]]+)\]\(([^)]+)\)/);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (i % 3 === 0) return <React.Fragment key={i}>{part}</React.Fragment>;
    if (i % 3 === 1) return (
      <a key={i} href={parts[i + 1]} target="_blank" rel="noreferrer" className="text-amber-600 dark:text-amber-400 font-medium hover:underline hover:decoration-amber-500 hover:decoration-2 underline-offset-4 transition-all cursor-pointer">
        {part}
      </a>
    );
    return null;
  });
};

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experience,
  education,
  config
}) => {
  return (
    <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800/80 relative" id="experience">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="space-y-3 mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            {config?.title ?? "Relevant Experiences & Education"}
          </h2>
          {(config?.subtitle ?? "Hands-on technical appointments, mechanical systems optimization, field coaching, and mechanical engineering degree.") && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed w-full max-w-none text-justify sm:text-left">
              {config?.subtitle ?? "Hands-on technical appointments, mechanical systems optimization, field coaching, and mechanical engineering degree."}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Relevant Experiences */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center space-x-2 pb-3 border-b-2 border-slate-300 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-mono tracking-wider text-slate-900 dark:text-white uppercase font-bold">
                RELEVANT EXPERIENCES
              </h3>
            </div>

            <div className="space-y-5">
              {experience.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  {...reveal(idx, 'left')} whileHover={cardHover}
                  className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-xl dark:hover:shadow-blue-500/5 transition-[border-color,background-color,box-shadow] duration-200 space-y-4 group shadow-sm cursor-default"
                >
                  {/* Header Row: Role & Period */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {exp.role}
                      {exp.employmentType && <span className="font-normal text-slate-500 dark:text-slate-400 text-xs sm:text-sm ml-2">· {exp.employmentType}</span>}
                    </h4>
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-[11px] font-mono font-medium text-blue-700 dark:text-blue-300 whitespace-nowrap shrink-0">
                      {exp.period}
                    </span>
                  </div>

                  {/* Department & Organizations Row */}
                  <div className="space-y-1.5 pt-0.5">
                    {exp.department && (
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {exp.department}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      {exp.organization.split('\n').filter(Boolean).map((org, idx) => {
                        const locs = exp.location ? exp.location.split('\n').filter(Boolean) : [];
                        const loc = locs[idx] || (idx === 0 && locs.length === 1 ? locs[0] : null);

                        return (
                          <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-4">
                            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                              {org}
                            </div>
                            {loc && (
                              <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>{loc}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Supervisors Section */}
                  {exp.supervisors && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-1">
                      <span className="font-mono text-blue-600 dark:text-blue-400 block text-[11px] uppercase tracking-wider font-semibold">
                        Supervised by:
                      </span>
                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                        {renderWithLinks(exp.supervisors.replace(/^Supervised by:\s*/i, ''))}
                      </div>
                    </div>
                  )}

                  {/* Description Section */}
                  {exp.description && (
                    <div className="text-xs space-y-1">
                      <span className="font-mono text-blue-600 dark:text-blue-400 block text-[11px] uppercase tracking-wider font-semibold">
                        Description:
                      </span>
                      <div className="text-slate-600 dark:text-slate-300 text-justify leading-relaxed font-normal space-y-2">
                        {exp.description.split('\n').filter(Boolean).map((paragraph, pIdx) => (
                          <p key={pIdx}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      {exp.highlights.map((item, hIdx) => (
                        <li key={hIdx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Published Paper Links */}
                  {exp.paperLink && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-2">
                      <span className="font-mono text-amber-600 dark:text-amber-400 block text-[11px] uppercase tracking-wider font-semibold">
                        Published Research Paper Links:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {exp.paperLink.split(',').map((link, lIdx) => {
                          const cleanLink = link.trim();
                          if (!cleanLink) return null;
                          return (
                            <a
                              key={lIdx}
                              href={cleanLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex w-fit items-center space-x-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-sm"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                              <span>View Paper {exp.paperLink!.split(',').length > 1 ? lIdx + 1 : ''}</span>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Education */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center space-x-2 pb-3 border-b-2 border-slate-300 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-mono tracking-wider text-slate-900 dark:text-white uppercase font-bold">
                EDUCATION
              </h3>
            </div>

            <div className="space-y-5">
              {education.map((edu, idx) => (
                <motion.div
                  key={edu.id}
                  {...reveal(idx, 'right')} whileHover={cardHover}
                  className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-xl dark:hover:shadow-blue-500/5 transition-[border-color,background-color,box-shadow] duration-200 space-y-3.5 shadow-sm cursor-default"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {edu.degree}
                    </h4>
                    <span className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-[11px] font-mono font-medium text-blue-700 dark:text-blue-300 shrink-0">
                      {edu.year}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
                    {edu.institution}
                  </div>

                  {edu.location && (
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{edu.location}</span>
                    </div>
                  )}

                  {edu.result && (
                    <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800/60">
                      <Award className="w-3.5 h-3.5" />
                      <span>{edu.result}</span>
                    </div>
                  )}

                  {edu.thesis && (
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-1">
                      <span className="font-mono text-blue-600 dark:text-blue-400 block text-[11px] uppercase tracking-wider font-semibold">
                        Dissertation / Thesis:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-justify leading-relaxed font-normal">
                        {edu.thesis}
                      </p>
                    </div>
                  )}
                  {edu.advisor && (
                    <div className="text-xs space-y-1">
                      <span className="font-mono text-blue-600 dark:text-blue-400 block text-[11px] uppercase tracking-wider font-semibold">
                        Advisor:
                      </span>
                      <div className="text-slate-600 dark:text-slate-300 text-justify leading-relaxed font-normal whitespace-pre-line">
                        {renderWithLinks(edu.advisor)}
                      </div>
                    </div>
                  )}
                  {edu.synopsis && (
                    <div className="text-xs space-y-1">
                      <span className="font-mono text-blue-600 dark:text-blue-400 block text-[11px] uppercase tracking-wider font-semibold">
                        Synopsis:
                      </span>
                      <div className="text-slate-600 dark:text-slate-300 text-justify leading-relaxed font-normal whitespace-pre-line">
                        {renderWithLinks(edu.synopsis)}
                      </div>
                    </div>
                  )}

                  {edu.coursework && (
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-1">
                      <span className="font-mono text-blue-600 dark:text-blue-400 block text-[11px] uppercase tracking-wider font-semibold">
                        Relevant Coursework:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-justify leading-relaxed font-normal">
                        {edu.coursework}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
