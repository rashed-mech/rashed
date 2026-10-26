import React, { useState, useEffect } from 'react';
import {
  Palette,
  Compass,
  Wind,
  BookOpen,
  Layers,
  Cpu,
  Crown,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Laptop,
  Flame,
  Zap,
  Eye,
  Check
} from 'lucide-react';
import { ThemeUXConfig, UXDesignId } from '../../../types';
import { updateThemeUXAPI } from '../../../api';

interface UXDesignTabProps {
  themeUX?: ThemeUXConfig;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const UXDesignTab: React.FC<UXDesignTabProps> = ({
  themeUX,
  onRefresh,
  showToast
}) => {
  const [themeUXState, setThemeUXState] = useState<ThemeUXConfig>(() => {
    let savedDesign: UXDesignId = 'current';
    try {
      const stored = localStorage.getItem('portfolio_active_design') as UXDesignId;
      if (stored) savedDesign = stored;
    } catch {}

    return {
      activeDesign: themeUX?.activeDesign || savedDesign,
      designPreset: themeUX?.designPreset || 'modern-executive',
      cardRadius: themeUX?.cardRadius || 'rounded-2xl',
      fontContrast: themeUX?.fontContrast || 'pure-black',
      ambientGlow: themeUX?.ambientGlow ?? true
    };
  });
  const [savingThemeUX, setSavingThemeUX] = useState(false);

  useEffect(() => {
    if (themeUX) {
      setThemeUXState(prev => ({
        ...prev,
        ...themeUX
      }));
    }
  }, [themeUX]);

  const handleSaveThemeUX = async (override?: Partial<ThemeUXConfig>) => {
    const toSave = { ...themeUXState, ...(override || {}) };
    setSavingThemeUX(true);
    try {
      await updateThemeUXAPI(toSave);
      setThemeUXState(toSave);
      try {
        if (toSave.activeDesign) localStorage.setItem('portfolio_active_design', toSave.activeDesign);
        const cached = localStorage.getItem('portfolio_data_cache_v2');
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.themeUX = toSave;
          localStorage.setItem('portfolio_data_cache_v2', JSON.stringify(parsed));
        }
      } catch {}
      showToast(`Portfolio design saved: ${toSave.activeDesign === 'design-7' ? 'Video Reference / Monochrome' : 'Original portfolio'}.`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'The design could not be saved. Please try again.', 'error');
    } finally {
      setSavingThemeUX(false);
    }
  };

  const designs = [
    {
      id: 'current',
      title: 'Design 1: Executive Precision (Current Style)',
      subtitle: 'Clinical Obsidian & Telemetry',
      icon: Compass,
      accentColor: '#6366f1',
      badge: 'Executive Reference',
      badgeColor: 'text-indigo-400 bg-indigo-950/70 border-indigo-700/80',
      swatch: 'from-slate-900 via-indigo-900 to-indigo-500',
      desc: 'High-authority clinical engineering leadership. Pure contrast in day mode, authoritative obsidian night mode, sleek minimal borders, and indigo/sky telemetry indicators.',
      typography: 'Plus Jakarta Sans',
      atmosphere: 'Calm Indigo/Sky Floating Orbs & Precision Grid',
      motionStyle: 'Executive Smooth Floating',
      miniBadge: 'STATUS: ACTIVE',
      miniBadgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      miniButton: 'Explore Dossier',
      miniButtonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20',
      animationClass: 'animate-exec-float'
    },
    {
      id: 'design-2',
      title: 'Design 2: Clean Energy & CFD Flow',
      subtitle: 'Hydrogen Emerald & Fluid Aerodynamics',
      icon: Wind,
      accentColor: '#10b981',
      badge: 'Clean Energy & CFD',
      badgeColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-700/80',
      swatch: 'from-emerald-500 via-teal-500 to-cyan-500',
      desc: 'Inspired by hydrogen fuel cells, wind-tunnel aerodynamics, and renewable microgrids. Features organic fluid curves, glowing emerald/cyan energy pulses, and active CFD streamline vectors.',
      typography: 'Aerodynamic Fluid Sans',
      atmosphere: 'Animated CFD Wind-Tunnel Streamlines & Energy Particles',
      motionStyle: 'Wave Pulse & Stream Drift',
      miniBadge: 'CFD CONVERGED',
      miniBadgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      miniButton: 'Simulate Flow',
      miniButtonClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-emerald-500/25',
      animationClass: 'animate-cfd-pulse'
    },
    {
      id: 'design-3',
      title: 'Design 3: Scholar & Editorial',
      subtitle: 'Imperial Indigo & Gold Leaf Monograph',
      icon: BookOpen,
      accentColor: '#4f46e5',
      badge: 'Scholar & Publications',
      badgeColor: 'text-amber-300 bg-amber-950/70 border-amber-700/80',
      swatch: 'from-indigo-600 via-purple-600 to-amber-500',
      desc: 'Prestigious academic publication and Nature-editorial style. Regal Cormorant Garamond serif titles, double-rule scholarly dividers, citation DOI badges, and gold leaf foil accents.',
      typography: 'Cormorant Garamond Serif',
      atmosphere: 'Scholarly Constellation Network & Warm Amber Vignette',
      motionStyle: 'Gold Foil Shimmer & Constellation Float',
      miniBadge: 'DOI: 10.1016/RESEARCH',
      miniBadgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-serif',
      miniButton: 'Read Publications',
      miniButtonClass: 'bg-indigo-700 hover:bg-indigo-600 text-amber-200 border border-amber-500/40 font-serif',
      animationClass: 'animate-exec-float'
    },
    {
      id: 'design-4',
      title: 'Design 4: Nordic Slate Glassmorphism',
      subtitle: 'Arctic Mist & Translucent Crystal Sheen',
      icon: Layers,
      accentColor: '#0284c7',
      badge: 'Nordic Slate',
      badgeColor: 'text-sky-300 bg-sky-950/70 border-sky-700/80',
      swatch: 'from-slate-600 via-sky-600 to-cyan-400',
      desc: 'Ultra-refined Scandinavian architectural minimalism. Deep frosted glassmorphism layers, cool glacial slate reflections, ice-cyan specular borders, and high-precision crystalline transparency.',
      typography: 'Nordic Crystal Sans',
      atmosphere: 'Glacial Aurora Borealis & Floating Crystal Disks',
      motionStyle: 'Aurora Wave & Frost Sheen',
      miniBadge: 'FROST BLUR 20PX',
      miniBadgeClass: 'bg-sky-500/10 text-sky-300 border-sky-400/30',
      miniButton: 'Inspect Glass',
      miniButtonClass: 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 backdrop-blur-xl',
      animationClass: 'animate-nordic-aurora'
    },
    {
      id: 'design-5',
      title: 'Design 5: Personal Studio',
      subtitle: 'Midnight Teal & Warm Coral',
      icon: Cpu,
      accentColor: '#0f766e',
      badge: 'Personal Studio',
      badgeColor: 'text-teal-200 bg-teal-950/70 border-teal-700/80',
      swatch: 'from-teal-700 via-teal-500 to-orange-400',
      desc: 'A confident and approachable personal palette. Deep teal creates focus, while restrained coral directs attention to the work and the next conversation.',
      typography: 'Modern Humanist Sans',
      atmosphere: 'Soft Teal Depth & Warm Coral Glow',
      motionStyle: 'Gentle Ambient Drift',
      miniBadge: 'PERSONAL STUDIO',
      miniBadgeClass: 'bg-teal-500/15 text-teal-200 border-teal-400/40',
      miniButton: 'Explore Work',
      miniButtonClass: 'bg-teal-600 hover:bg-teal-500 text-white tracking-wide shadow-teal-500/30',
      animationClass: 'animate-cyber-pulse'
    },
    {
      id: 'design-6',
      title: 'Design 6: Executive Modern Luxury',
      subtitle: 'Obsidian Velvet & Champagne Gold Foil',
      icon: Crown,
      accentColor: '#d4af37',
      badge: 'Modern Luxury',
      badgeColor: 'text-yellow-300 bg-yellow-950/70 border-yellow-700/80',
      swatch: 'from-amber-400 via-yellow-500 to-stone-400',
      desc: 'Private equity & bespoke luxury timepiece aesthetic. Obsidian velvet depth, warm champagne gold metallic hairline borders, subtle gold dust luminescence, and refined modern tracking.',
      typography: 'Haute Horlogerie Luxury',
      atmosphere: 'Diagonal Champagne Light Beams & Gold Stardust Aura',
      motionStyle: 'Champagne Gold Foil Sweeper & Ambient Aura',
      miniBadge: 'BESPOKE EDITION',
      miniBadgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40 tracking-wider',
      miniButton: 'Private Portfolio',
      miniButtonClass: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-bold shadow-amber-500/25',
      animationClass: 'animate-luxury-aura'
    },
    {
      id: 'design-7',
      title: 'Design 7: Video Reference / Monochrome',
      subtitle: 'Cloud Gray, White & Charcoal',
      icon: Palette,
      accentColor: '#a3a3a3',
      badge: 'Video Reference',
      badgeColor: 'text-neutral-200 bg-neutral-800 border-neutral-600',
      swatch: 'from-white via-neutral-300 to-neutral-900',
      desc: 'The video-inspired portfolio: outlined name, centered portrait, gray clouds, work galleries, expandable expertise, and a charcoal experience section. Animated section reveals and smooth interactions.',
      typography: 'Inter Variable',
      atmosphere: 'Soft Cloud Backdrop & Monochrome Contrast',
      motionStyle: 'Staggered Reveals & Fluid Interactions',
      miniBadge: 'OPEN TO COLLABORATION',
      miniBadgeClass: 'bg-white text-neutral-800 border-neutral-300',
      miniButton: 'Let’s talk ↗',
      miniButtonClass: 'bg-neutral-800 text-white border border-neutral-500',
      animationClass: 'animate-exec-float'
    }
  ];

  const activeDesignObj = designs.find(
    (d) => d.id === (themeUXState.activeDesign || 'current')
  ) || designs[0];

  return (
    <div className="space-y-8" id="public-portfolio-ux-section">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PUBLIC PORTFOLIO UX ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Public Portfolio UX Design
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Choose the primary theme & interaction paradigm for your live public portfolio. Selecting any card instantly activates and publishes that complete design experience live.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Currently Live On Site
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-white">
                  {activeDesignObj.title}
                </span>
              </div>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/25 hover:scale-[1.02]"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* 6 Design Archetype Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {designs.map((design) => {
          const isSelected = (themeUXState.activeDesign || 'current') === design.id;
          const IconComponent = design.icon;

          return (
            <div
              key={design.id}
              role="button"
              tabIndex={savingThemeUX ? -1 : 0}
              aria-pressed={isSelected}
              aria-disabled={savingThemeUX}
              onKeyDown={event => {
                if (!savingThemeUX && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  handleSaveThemeUX({ activeDesign: design.id as UXDesignId });
                }
              }}
              onClick={() => {
                if (savingThemeUX) return;
                const updated: ThemeUXConfig = {
                  ...themeUXState,
                  activeDesign: design.id as any
                };
                handleSaveThemeUX(updated);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden shadow-lg ${
                isSelected
                  ? 'bg-slate-800/95 border-indigo-500 ring-2 ring-indigo-500/50 shadow-2xl'
                  : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/70'
              }`}
            >
              {/* Active glow accent */}
              {isSelected && (
                <div 
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40"
                  style={{ backgroundColor: design.accentColor }}
                />
              )}

              {/* Header */}
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner"
                      style={{ backgroundColor: `${design.accentColor}25`, color: design.accentColor }}
                    >
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {design.title}
                    </span>
                  </div>
                  
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Live
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200">
                      Click to Apply
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-400 font-mono pl-10.5">
                  {design.subtitle}
                </div>
              </div>

              {/* Gradient Swatch Bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className={`h-full w-full bg-gradient-to-r ${design.swatch}`} />
              </div>

              {/* Mini Live UI & UX Sandbox Preview */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                    Live UI Preview
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${design.miniBadgeClass}`}>
                    {design.miniBadge}
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className={`text-xs truncate ${design.id === 'design-3' ? 'font-serif italic text-amber-200' : design.id === 'design-5' ? 'font-mono text-cyan-300' : 'text-slate-200'}`}>
                    {design.typography}
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 rounded font-semibold shadow transition-transform ${design.miniButtonClass}`}>
                    {design.miniButton}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {design.desc}
              </p>

              {/* UX Specs Footer */}
              <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Atmosphere:</span>
                  <span className="text-slate-300 font-mono text-[9px] text-right truncate max-w-[200px]">
                    {design.atmosphere}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Motion:</span>
                  <span className="text-indigo-400 font-mono text-[9px]">
                    {design.motionStyle}
                  </span>
                </div>
              </div>

              {/* Bottom Selection Status */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded border font-semibold ${design.badgeColor}`}>
                  {design.badge}
                </span>
                <span className={`text-xs font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`}>
                  {isSelected ? '✓ Live on Public Site' : 'Select Design'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
