import React from 'react';
import { 
  Eye, 
  Brain, 
  Activity, 
  Dna, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  Layers 
} from 'lucide-react';
import { Profile } from '../types';

interface AboutSectionProps {
  profile: Profile;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  const researchPillars = [
    {
      title: 'Biomedical Image Analysis',
      icon: Eye,
      description: 'Endoscopic disease classification, brain MRI segmentation, and fundus photography grading via tailored convolutional and vision transformer models.',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50'
    },
    {
      title: 'Explainable AI & Trustworthy Models',
      icon: Brain,
      description: 'Developing transparent decision mechanisms (SHAP, Grad-CAM, attention visualizers) to ensure safety and clinical interpretability in diagnosis.',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50'
    },
    {
      title: 'Healthcare Informatics & Sensors',
      icon: Activity,
      description: 'Continuous physiological monitoring, arrhythmia prediction, and spatio-temporal telemetry parsing from wearable IoT sensors.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50'
    },
    {
      title: 'Genomic Sequence Modeling',
      icon: Dna,
      description: 'Transformer-based tokenization and representation learning for nucleotide sequences, gene annotation, and antimicrobial resistance identification.',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50/70 dark:bg-slate-900/50 border-y border-slate-200/60 dark:border-slate-800/60" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
            Bridging Theoretical AI with Real-World Clinical Impact
          </h2>
        </div>

        {/* Narrative & Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Narrative Column (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-black dark:text-white">
                Academic Background & Mission
              </h3>
              
              {profile.aboutText && profile.aboutText.length > 0 ? (
                profile.aboutText.map((paragraph, idx) => (
                  <p key={idx} className="text-sm sm:text-base text-black dark:text-slate-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-sm sm:text-base text-black dark:text-slate-300 leading-relaxed text-justify">
                  {profile.bio}
                </p>
              )}

              {/* Research laboratory / Affiliation highlights */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 space-y-2">
                <div className="flex items-start space-x-2 text-xs font-medium text-black dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Primary Research: {profile.department}</span>
                </div>
                <div className="flex items-start space-x-2 text-xs font-medium text-black dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Affiliation: {profile.affiliation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Research Pillars Cards (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {researchPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-shadow space-y-3"
                >
                  <div className={`w-10 h-10 rounded-xl ${pillar.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${pillar.color}`} />
                  </div>
                  <h4 className="text-sm font-bold text-black dark:text-white">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-black dark:text-slate-300 leading-relaxed text-justify">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
