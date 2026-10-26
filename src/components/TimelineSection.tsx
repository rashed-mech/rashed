import React from 'react';
import { Briefcase, GraduationCap, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { Experience, Education } from '../types';

interface TimelineSectionProps {
  experience: Experience[];
  education: Education[];
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ experience, education }) => {
  return (
    <section className="py-16 md:py-24" id="experience">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
            Academic Appointments & Education
          </h2>
          <p className="text-sm text-black dark:text-slate-400 text-justify">
            Chronology of academic research appointments, university lecturing, and formal degrees.
          </p>
        </div>

        {/* 2-Column Layout: Experience & Education */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Column 1: Academic & Professional Appointments */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b-2 border-slate-300 dark:border-slate-700">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-black dark:text-white">
                Academic & Professional Roles
              </h3>
            </div>

            <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-950">
              {experience.map((exp) => (
                <div key={exp.id} className="relative space-y-2 group" id={`exp-item-${exp.id}`}>
                  {/* Timeline Dot */}
                  <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-900 group-hover:scale-125 transition-transform" />

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                        <Calendar className="w-3 h-3" />
                        <span>{exp.period}</span>
                      </span>
                      {exp.current && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Current Appointment
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-black dark:text-white">
                      {exp.role}
                    </h4>

                    <p className="text-xs font-semibold text-black dark:text-slate-300 text-justify">
                      {exp.organization}
                    </p>

                    <div className="flex items-center space-x-1 text-xs text-black dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-black" />
                      <span>{exp.location}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-black dark:text-slate-300 leading-relaxed pt-1 text-justify">
                      {exp.description}
                    </p>

                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                        {exp.highlights.map((item, idx) => (
                          <li key={idx}  className="flex items-start space-x-2 text-xs text-black dark:text-slate-300 text-justify">
                            <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Formal Education */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b-2 border-slate-300 dark:border-slate-700">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-black dark:text-white">
                Higher Education & Degrees
              </h3>
            </div>

            <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-950">
              {education.map((edu) => (
                <div key={edu.id} className="relative space-y-2 group" id={`edu-item-${edu.id}`}>
                  {/* Timeline Dot */}
                  <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-900 group-hover:scale-125 transition-transform" />

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md">
                        <Calendar className="w-3 h-3" />
                        <span>{edu.year}</span>
                      </span>
                      {edu.result && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-black dark:text-slate-200">
                          {edu.result}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-black dark:text-white">
                      {edu.degree}
                    </h4>

                    <p className="text-xs font-semibold text-black dark:text-slate-300 text-justify">
                      {edu.institution}
                    </p>

                    {edu.thesis && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-black text-justify">
                          Dissertation / Thesis
                        </p>
                        <p className="text-xs text-black dark:text-slate-300 italic text-justify">
                          "{edu.thesis}"
                        </p>
                        {edu.advisor && (
                          <p className="text-[11px] text-black dark:text-slate-400 pt-0.5 text-justify">
                            <span className="font-semibold">Advisor:</span> {edu.advisor}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
