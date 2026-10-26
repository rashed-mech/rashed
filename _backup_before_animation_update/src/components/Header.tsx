import React, { useState, useEffect } from 'react';
import { Menu, X, FileText, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Profile, SectionConfig, UXDesignId } from '../types';
import { formatImageUrl } from '../utils/formatUrl';
import { PullChainSwitch } from './PullChainSwitch';

interface HeaderProps {
  profile: Profile;
  onOpenAdmin?: () => void;
  isAdminLoggedIn?: boolean;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenCommandPalette?: () => void;
  sectionConfig?: SectionConfig;
  activeDesign?: UXDesignId;
}

interface FlipNavTextProps {
  children: string;
  center?: boolean;
  className?: string;
  accentColorClass?: string;
}

const FlipNavText: React.FC<FlipNavTextProps> = ({
  children: text,
  center = true,
  className = '',
  accentColorClass = '!text-[#ff4d00]',
}) => {
  return (
    <motion.span
      className={`relative block overflow-hidden select-none cursor-pointer ${className}`}
      style={{ lineHeight: 1.22 }}
    >
      {/* Resting text layer (slides up out of view on hover) */}
      <span className="flex items-center">
        {text.split('').map((char, index) => {
          const delay = center
            ? 0.03 * Math.abs(index - (text.length - 1) / 2)
            : 0.03 * index;
          return (
            <motion.span
              key={index}
              variants={{
                initial: { y: 0 },
                hovered: { y: '-100%' },
              }}
              transition={{ ease: 'easeInOut', delay, duration: 0.25 }}
              className="inline-block whitespace-pre"
            >
              {char}
            </motion.span>
          );
        })}
      </span>

      {/* Hover text layer (slides up into view in accent color) */}
      <span className={`absolute inset-0 flex items-center ${accentColorClass}`}>
        {text.split('').map((char, index) => {
          const delay = center
            ? 0.03 * Math.abs(index - (text.length - 1) / 2)
            : 0.03 * index;
          return (
            <motion.span
              key={index}
              variants={{
                initial: { y: '100%' },
                hovered: { y: 0 },
              }}
              transition={{ ease: 'easeInOut', delay, duration: 0.25 }}
              className="inline-block whitespace-pre"
            >
              {char}
            </motion.span>
          );
        })}
      </span>
    </motion.span>
  );
};

const SunMoonToggle: React.FC<{ darkMode?: boolean; onToggleDarkMode: () => void; className?: string }> = ({
  darkMode,
  onToggleDarkMode,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onToggleDarkMode}
      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
        darkMode 
          ? 'bg-slate-800/90 border-slate-700/80 text-amber-400 hover:bg-slate-700 hover:border-slate-600' 
          : 'bg-white border-slate-200 text-blue-600 hover:bg-slate-100 hover:border-slate-300'
      } ${className}`}
      aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {darkMode ? (
          <motion.div
            key="sun-icon"
            initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Sun className="w-5 h-5 text-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon-icon"
            initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Moon className="w-5 h-5 text-blue-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({
  profile,
  darkMode,
  onToggleDarkMode,
  onOpenCommandPalette,
  sectionConfig,
  activeDesign = 'current'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [logoError, setLogoError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [profile.logoUrl]);

  useEffect(() => {
    setAvatarError(false);
  }, [profile.avatarUrl]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
      setScrollProgress(progress);

    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'OVERVIEW', href: '#hero', id: 'hero', show: sectionConfig?.hero?.visible !== false },
    { name: 'SKILLS', href: '#capabilities', id: 'capabilities', show: sectionConfig?.capabilities?.visible !== false },
    { name: 'PROJECTS', href: '#projects', id: 'projects', show: sectionConfig?.projects?.visible !== false },
    { name: 'EXPERIENCE', href: '#experience', id: 'experience', show: sectionConfig?.experience?.visible !== false },
    { name: 'PUBLICATIONS', href: '#publications', id: 'publications', show: sectionConfig?.publications?.visible !== false },
    { name: 'TRAINING', href: '#training', id: 'training', show: sectionConfig?.trainings?.visible !== false },
    { name: 'HONORS', href: '#honors-activities', id: 'honors-activities', show: sectionConfig?.honors?.visible !== false },
    { name: '3D LAB', href: '#3d-simulation-lab', id: '3d-simulation-lab', show: true },
    { name: 'CONTACT', href: '#contact', id: 'contact', show: sectionConfig?.contact?.visible !== false }
  ].filter(link => link.show);

  // Scroll spy with IntersectionObserver
  useEffect(() => {
    const sectionIds = navLinks.map(l => l.id);
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0.1
    });

    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sectionConfig]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const hasValidLogo = profile.logoUrl && profile.logoUrl !== 'chunked' && profile.logoUrl.trim().length > 0 && !logoError;
  const hasValidAvatar = (profile.avatarUrl && profile.avatarUrl.trim().length > 0 || true) && !avatarError;

  const accentClass = 
    activeDesign === 'design-2' ? '!text-emerald-400' :
    activeDesign === 'design-3' ? '!text-amber-500 dark:!text-amber-400' :
    activeDesign === 'design-4' ? '!text-sky-400' :
    activeDesign === 'design-5' ? '!text-teal-700 dark:!text-teal-300' :
    activeDesign === 'design-6' ? '!text-amber-400' :
    '!text-[#ff4d00] dark:!text-[#ff6a00]';

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled 
          ? activeDesign === 'design-2'
            ? 'dark:bg-[#031715]/95 bg-[#E2ECE7]/95 backdrop-blur-xl shadow-lg border-b border-emerald-500/30'
            : activeDesign === 'design-3'
            ? 'dark:bg-[#0b0e17]/95 bg-[#F7F5EF]/95 backdrop-blur-md shadow-md border-b-2 border-double dark:border-amber-600/30 border-amber-800/20'
            : activeDesign === 'design-4'
            ? 'dark:bg-slate-950/45 bg-white/50 backdrop-blur-2xl shadow-xl border-b border-sky-400/20'
            : activeDesign === 'design-5'
            ? 'dark:bg-[#081817]/95 bg-white/95 backdrop-blur-xl shadow-md border-b border-teal-500/20'
            : activeDesign === 'design-6'
            ? 'dark:bg-[#09090b]/95 bg-[#F5F3EF]/95 backdrop-blur-md shadow-md border-b border-amber-400/30'
            : 'dark:bg-[#080d14]/95 bg-white/95 backdrop-blur-xl shadow-md dark:shadow-black/50 shadow-slate-300/30 border-b dark:border-slate-800/80 border-slate-300/80' 
          : 'bg-transparent border-b border-transparent shadow-none'
      }`} 
      id="main-header"
    >
      {/* Top Reading Progress Bar with Design-Specific Gradients */}
      <div 
        className={`absolute top-0 left-0 h-[2px] z-50 transition-all duration-150 ease-out ${
          activeDesign === 'design-2' 
            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400' 
            : activeDesign === 'design-3'
            ? 'bg-gradient-to-r from-indigo-600 via-purple-500 to-amber-400'
            : activeDesign === 'design-4'
            ? 'bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500'
            : activeDesign === 'design-5'
            ? 'bg-gradient-to-r from-teal-700 via-teal-500 to-orange-400'
            : activeDesign === 'design-6'
            ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500'
            : 'bg-gradient-to-r from-amber-500 via-teal-500 to-amber-400'
        }`}
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo / Brand Name */}
          <div className="flex items-center gap-3">
            <a 
              href="#" 
              className="flex items-center space-x-3 group"
              id="brand-logo-link"
            >
              <div className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 border bg-white dark:bg-slate-900 shadow-sm transition-all ${
                activeDesign === 'design-2'
                  ? 'border-emerald-500/60 ring-2 ring-emerald-500/20'
                  : activeDesign === 'design-3'
                  ? 'border-amber-500/60 ring-2 ring-amber-500/20'
                  : activeDesign === 'design-4'
                  ? 'border-sky-400/60 ring-2 ring-sky-400/20 backdrop-blur-xl'
                  : activeDesign === 'design-5'
                  ? 'border-teal-500/80 ring-2 ring-teal-500/20'
                  : activeDesign === 'design-6'
                  ? 'border-amber-400/80 ring-2 ring-amber-400/30'
                  : 'border-slate-300 dark:border-slate-700'
              }`}>
                <AnimatePresence mode="wait">
                  {scrolled && hasValidAvatar ? (
                    <motion.img 
                      key="avatar"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      src={formatImageUrl(profile.avatarUrl) || '/avatar.png'} 
                      alt={profile.name} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.src.endsWith('/avatar.png')) {
                          img.src = '/avatar.png';
                        } else {
                          setAvatarError(true);
                        }
                      }}
                      className="absolute inset-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 dark:border-blue-400/80 border-blue-600 shadow-md bg-slate-800"
                    />
                  ) : (
                    <motion.img 
                      key="logo"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      src={formatImageUrl(profile.logoUrl) || '/logo-circle.png'} 
                      alt="Brand Logo" 
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.src.endsWith('/logo-circle.png')) {
                          img.src = '/logo-circle.png';
                        } else {
                          setLogoError(true);
                        }
                      }}
                      className="absolute inset-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover bg-white dark:bg-slate-900"
                    />
                  )}
                </AnimatePresence>
              </div>
              
              <span className="font-sans font-bold uppercase text-xs sm:text-sm tracking-[0.15em] dark:text-white text-black transition-colors">
                {profile.name}
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links & Controls */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 self-stretch">
            <nav className="flex items-center space-x-3.5 lg:space-x-5" id="desktop-nav">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial="initial"
                    whileHover="hovered"
                    className={`group relative py-1 text-[11px] sm:text-[11.5px] font-semibold tracking-wider transition-colors duration-200 uppercase ${
                      activeDesign === 'design-3' ? 'font-serif' : 'font-sans'
                    } ${
                      isActive 
                        ? activeDesign === 'design-2'
                          ? 'text-emerald-400 font-bold'
                          : activeDesign === 'design-3'
                          ? 'dark:text-amber-300 text-amber-800 font-bold'
                          : activeDesign === 'design-4'
                          ? 'text-sky-400 font-bold'
                          : activeDesign === 'design-5'
                          ? 'dark:text-teal-300 text-teal-700 font-bold'
                          : activeDesign === 'design-6'
                          ? 'text-amber-400 font-bold'
                          : 'dark:text-amber-400 text-amber-600 font-bold' 
                        : 'dark:text-slate-200 text-slate-900'
                    }`}
                  >
                    <FlipNavText 
                      center={true} 
                      accentColorClass={accentClass}
                    >
                      {link.name}
                    </FlipNavText>

                    {/* Animated hover & active underline transition */}
                    <span 
                      className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full transition-all duration-300 transform origin-left ${
                        isActive 
                          ? `scale-x-100 opacity-100 ${
                              activeDesign === 'design-2' ? 'bg-emerald-400' :
                              activeDesign === 'design-3' ? 'bg-amber-400' :
                              activeDesign === 'design-4' ? 'bg-sky-400' :
                              activeDesign === 'design-5' ? 'bg-teal-600 dark:bg-teal-400' :
                              activeDesign === 'design-6' ? 'bg-amber-400' :
                              'bg-amber-500 dark:bg-amber-400'
                            }` 
                          : `scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 ${
                              activeDesign === 'design-2' ? 'bg-emerald-400' :
                              activeDesign === 'design-3' ? 'bg-amber-400' :
                              activeDesign === 'design-4' ? 'bg-sky-400' :
                              activeDesign === 'design-5' ? 'bg-teal-600 dark:bg-teal-400' :
                              activeDesign === 'design-6' ? 'bg-amber-400' :
                              'bg-amber-500 dark:bg-amber-400'
                            }`
                      }`} 
                    />
                  </motion.a>
                );
              })}
            </nav>

            <div className="flex items-center space-x-2.5 self-stretch">
              {/* Desktop view (>= 1024px): Hanging Pull Chain */}
              {onToggleDarkMode && (
                <div className="hidden lg:flex relative self-stretch w-8 justify-center overflow-visible">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 overflow-visible z-20">
                    <PullChainSwitch 
                      darkMode={darkMode} 
                      onToggleDarkMode={onToggleDarkMode} 
                    />
                  </div>
                </div>
              )}

              {/* Tablet view (768px - 1023px): Standard Sun / Moon icon button */}
              {onToggleDarkMode && (
                <div className="hidden md:flex lg:hidden items-center">
                  <SunMoonToggle 
                    darkMode={darkMode} 
                    onToggleDarkMode={onToggleDarkMode} 
                  />
                </div>
              )}

            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center space-x-2 self-stretch">

            {/* Mobile Sun / Moon toggle button */}
            {onToggleDarkMode && (
              <SunMoonToggle 
                darkMode={darkMode} 
                onToggleDarkMode={onToggleDarkMode} 
              />
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl dark:text-white text-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-colors"
              id="mobile-menu-toggle-btn"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 dark:text-blue-400 text-blue-600" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b dark:border-slate-800 border-slate-300/80 dark:bg-[#0b1017]/95 bg-slate-200/95 backdrop-blur-xl px-5 pt-3 pb-6 space-y-2 overflow-hidden shadow-xl" 
            id="mobile-nav-drawer"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-sans font-semibold tracking-wider transition-colors uppercase ${
                    isActive 
                      ? 'dark:bg-blue-600/15 bg-blue-50 dark:text-blue-400 text-blue-600 font-bold' 
                      : 'dark:text-slate-200 text-slate-900 font-semibold dark:hover:bg-slate-800/60 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}

            {/* Theme switcher row for mobile drawer */}
            {onToggleDarkMode && (
              <div className="pt-2 border-t dark:border-slate-800 border-slate-200 flex items-center justify-between px-3 py-2">
                <span className="text-xs font-mono font-bold dark:text-slate-300 text-slate-700 uppercase tracking-wider">
                  Theme Mode
                </span>
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border dark:bg-slate-800 dark:border-slate-700 dark:text-amber-300 bg-white border-slate-200 text-blue-600 cursor-pointer shadow-xs active:scale-95"
                >
                  {darkMode ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-blue-600" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {profile.cvUrl && profile.cvUrl !== '#' && (
              <div className="pt-2 border-t dark:border-slate-800 border-slate-200">
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-mono dark:text-blue-400 text-blue-600 border dark:border-blue-500/40 border-blue-200 dark:bg-blue-950/40 bg-blue-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>DOWNLOAD CV</span>
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
