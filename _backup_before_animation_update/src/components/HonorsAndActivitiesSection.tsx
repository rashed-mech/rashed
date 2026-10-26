import { motion } from 'motion/react';
import React from 'react';
import {
  Trophy,
  Users,
  HeartHandshake,
  UserCheck,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Achievement, Affiliation, VolunteerExperience, Reference } from '../types';

interface HonorsAndActivitiesSectionProps {
  config?: { title: string; subtitle: string };
  achievements?: Achievement[];
  affiliations?: Affiliation[];
  volunteerWork?: VolunteerExperience[];
  references?: Reference[];
}

export const HonorsAndActivitiesSection: React.FC<HonorsAndActivitiesSectionProps> = ({
  achievements = [],
  affiliations = [],
  volunteerWork = [],
  references = [],
  config
}) => {
  const visibleAchievements = achievements.filter(ach => ach.isLive !== false);
  const visibleAffiliations = affiliations.filter(aff => aff.isLive !== false);
  const visibleVolunteer = volunteerWork.filter(v => v.isLive !== false);
  const visibleReferences = references.filter(ref => ref.isLive !== false);

  if (
    visibleAchievements.length === 0 &&
    visibleAffiliations.length === 0 &&
    visibleVolunteer.length === 0 &&
    visibleReferences.length === 0
  ) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800/80 relative" id="honors-activities">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >

        {/* Section Header */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            {config?.title ?? "Honors, Co-Curricular Leadership & Academic References"}
          </h2>
          {(config?.subtitle ?? "Competitive olympiad awards, university organization leadership, disaster relief volunteering, and academic thesis references.") && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed w-full max-w-none text-justify sm:text-left">
              {config?.subtitle ?? "Competitive olympiad awards, university organization leadership, disaster relief volunteering, and academic thesis references."}
            </p>
          )}
        </div>

        <div className="space-y-10">

          {/* Top Row: Achievements (Left) and Affiliations (Right) */}
          {(visibleAchievements.length > 0 || visibleAffiliations.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Column: Achievements */}
              {visibleAchievements.length > 0 && (
                <div className={`space-y-6 ${visibleAffiliations.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
                  <div className="flex items-center space-x-2 pb-3 border-b-2 border-slate-300 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-mono tracking-wider text-slate-900 dark:text-white uppercase font-bold">
                      ACHIEVEMENTS & AWARDS
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {visibleAchievements.map((ach, idx) => (
                      <motion.div
                        key={ach.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.05 }}
                        transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -2, transition: { duration: 0.12 } }}
                        className="p-5 rounded-2xl bg-white/95 dark:bg-[#102422] border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-400/50 hover:shadow-lg dark:hover:shadow-teal-500/5 transition-[border-color,background-color,box-shadow] duration-150 flex flex-col justify-between space-y-3 group shadow-sm cursor-default"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                              {ach.year}
                            </span>
                            {ach.category && (
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                {ach.category}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                            {ach.title}
                          </h4>
                          {ach.organization && (
                            <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                              {ach.organization}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Right Column: Affiliations */}
              {visibleAffiliations.length > 0 && (
                <div className={`space-y-6 ${visibleAchievements.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
                  <div className="flex items-center space-x-2 pb-3 border-b-2 border-slate-300 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-mono tracking-wider text-slate-900 dark:text-white uppercase font-bold">
                      PROFESSIONAL AFFILIATIONS & ACTIVITIES
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {visibleAffiliations.map((aff, idx) => (
                      <motion.div
                        key={aff.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.05 }}
                        transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -2, transition: { duration: 0.12 } }}
                        className="p-4 rounded-xl bg-white/95 dark:bg-[#102422] border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-400/50 hover:shadow-lg dark:hover:shadow-teal-500/5 transition-[border-color,background-color,box-shadow] duration-150 flex items-center justify-between group shadow-sm h-full cursor-default"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {aff.organization}
                          </h4>
                          <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                            Role: <span className="text-blue-600 dark:text-blue-400 font-semibold">{aff.role}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 shrink-0 ml-2">
                          {aff.period}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Width Row: Volunteer Experiences */}
          {visibleVolunteer.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-2 pb-3 border-b-2 border-slate-300 dark:border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-mono tracking-wider text-slate-900 dark:text-white uppercase font-bold">
                  VOLUNTEER EXPERIENCES
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleVolunteer.map((vol, idx) => (
                  <motion.div
                    key={vol.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.05 }}
                    transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2, transition: { duration: 0.12 } }}
                    className="p-5 rounded-2xl bg-white/95 dark:bg-[#102422] border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-400/50 hover:shadow-lg dark:hover:shadow-teal-500/5 transition-[border-color,background-color,box-shadow] duration-150 space-y-2 group shadow-sm cursor-default"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {vol.title || vol.role}
                      </h4>
                      {vol.period && (
                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 ml-2 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {vol.period}
                        </span>
                      )}
                    </div>
                    {(vol.organization || (!vol.title && vol.role)) && (
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        {vol.organization}
                      </div>
                    )}
                    {vol.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal pt-1 text-justify leading-relaxed">
                        {vol.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Full Width Row: References */}
          {visibleReferences.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-2 pb-3 border-b-2 border-slate-300 dark:border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-mono tracking-wider text-slate-900 dark:text-white uppercase font-bold">
                  ACADEMIC & PROFESSIONAL REFERENCES
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {visibleReferences.map((ref, idx) => (
                  <motion.div
                    key={ref.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.05 }}
                    transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2, transition: { duration: 0.12 } }}
                    className="p-6 rounded-2xl bg-white/95 dark:bg-[#102422] border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-400/50 transition-[border-color,background-color,box-shadow] duration-150 shadow-sm hover:shadow-lg dark:hover:shadow-teal-500/5 flex flex-col space-y-3 group cursor-default"
                  >
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {ref.website ? (
                        <a href={ref.website} target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {ref.name}
                        </a>
                      ) : (
                        ref.name
                      )}
                    </h4>

                    <div className="space-y-1">
                      <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                        {ref.designation || ref.role}
                      </div>
                      {ref.department && (
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                          {ref.department}
                        </div>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">{ref.institution || ref.organization}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </section>
  );
};
