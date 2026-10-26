import { MotionConfig } from 'motion/react';
import type { PortfolioData, UXDesignId } from '../types';
import { Header } from './Header';
import { Hero } from './Hero';
import { OverviewSection } from './OverviewSection';
import { CapabilitiesSection } from './CapabilitiesSection';
import { ProjectsSection } from './ProjectsSection';
import { ExperienceSection } from './ExperienceSection';
import { PublicationsSection } from './PublicationsSection';
import { TrainingSection } from './TrainingSection';
import { HonorsAndActivitiesSection } from './HonorsAndActivitiesSection';
import { ContactSection } from './ContactSection';
import { Footer } from './Footer';
import { ThemeAtmosphere } from './ThemeAtmosphere';
import { AnimatedSection } from './common/AnimatedSection';
import { DeferredSimulationSection } from './3d/DeferredSimulationSection';
import { QuickActionsDock } from './QuickActionsDock';
import { SmoothScroll } from './motion/SmoothScroll';
import { PointerEffects } from './motion/PointerEffects';
import '../portfolio-motion.css';

export function OriginalPortfolio({ data, darkMode, activeDesign, onToggleTheme, onSearch, onAdmin, isAdmin }: { data: PortfolioData; darkMode: boolean; activeDesign: UXDesignId; onToggleTheme: () => void; onSearch: () => void; onAdmin: () => void; isAdmin: boolean }) {
  const visible = (id: keyof NonNullable<PortfolioData['sectionConfig']>) => data.sectionConfig?.[id]?.visible !== false;
  return <MotionConfig reducedMotion="user"><div id="public-portfolio-root" data-theme-design={activeDesign} data-experience="original-enhanced" className={`min-h-screen relative antialiased ${darkMode ? 'dark bg-[#081817] text-slate-100' : 'bg-[#f4f7f6] text-slate-900'}`}>
    <SmoothScroll />
    <PointerEffects />
    <ThemeAtmosphere activeDesign={activeDesign} darkMode={darkMode} />
    <Header profile={data.profile} onOpenAdmin={onAdmin} isAdminLoggedIn={isAdmin} darkMode={darkMode} onToggleDarkMode={onToggleTheme} onOpenCommandPalette={onSearch} sectionConfig={data.sectionConfig} activeDesign={activeDesign} />
    <main id="main-content" tabIndex={-1}>
      {visible('hero') && <Hero profile={data.profile} data={data} activeDesign={activeDesign} />}
      {visible('overview') && <AnimatedSection variant="float-up"><OverviewSection profile={data.profile} data={data} /></AnimatedSection>}
      {visible('capabilities') && <AnimatedSection variant="slide-left"><CapabilitiesSection skillGroups={data.skillGroups} config={data.sectionConfig?.capabilities as any} /></AnimatedSection>}
      {visible('projects') && <AnimatedSection variant="slide-right"><ProjectsSection projects={data.projects} config={data.sectionConfig?.projects as any} /></AnimatedSection>}
      {visible('experience') && <AnimatedSection variant="rise-vertical"><ExperienceSection experience={data.experience} education={data.education} config={data.sectionConfig?.experience as any} /></AnimatedSection>}
      {visible('publications') && <AnimatedSection variant="diagonal-left"><PublicationsSection publications={data.publications} scholarUrl={data.profile.social.scholar} config={data.sectionConfig?.publications as any} /></AnimatedSection>}
      {visible('trainings') && <AnimatedSection variant="diagonal-right"><TrainingSection trainings={data.trainings} certifications={data.certifications} config={data.sectionConfig?.trainings as any} /></AnimatedSection>}
      {visible('honors') && <AnimatedSection variant="scale-crest"><HonorsAndActivitiesSection achievements={data.achievements} affiliations={data.affiliations} volunteerWork={data.volunteerWork} references={data.references} /></AnimatedSection>}
      <DeferredSimulationSection />
      {visible('contact') && <AnimatedSection variant="magnetic-glow"><ContactSection profile={data.profile} /></AnimatedSection>}
    </main>
    <Footer profile={data.profile} onOpenAdmin={onAdmin} isAdminLoggedIn={isAdmin} />
    <QuickActionsDock data={data} onOpenCommandPalette={onSearch} activeDesign={activeDesign} />
  </div></MotionConfig>;
}
