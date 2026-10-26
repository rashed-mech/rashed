import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  Cpu, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Mail, 
  FileText, 
  Moon, 
  Sun, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { PortfolioData, SectionConfig } from '../types';
import { useToast } from '../context/ToastContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAdmin?: () => void;
  sectionConfig?: SectionConfig;
  isReferenceLayout?: boolean;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Publications' | 'Projects' | 'Actions';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  data,
  darkMode,
  onToggleDarkMode,
  onOpenAdmin,
  sectionConfig,
  isReferenceLayout = false
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Jump to hash and scroll smoothly
  const jumpTo = (hash: string) => {
    onClose();
    const targetHash = isReferenceLayout && ['#trainings', '#honors-activities'].includes(hash) ? '#credentials' : hash;
    const elem = document.querySelector(targetHash);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(data.profile.email);
    showToast(`Copied ${data.profile.email} to clipboard!`, 'success');
    onClose();
  };

  const handleDownloadCV = async () => {
    showToast('Generating official academic CV (PDF)...', 'info');
    try {
      const { downloadCV } = await import('../utils/generateCV');
      await downloadCV(data);
      showToast('CV downloaded successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to generate CV: ' + (err.message || ''), 'error');
    }
    onClose();
  };

  // Compile all searchable items
  const allItems: CommandItem[] = useMemo(() => {
    const config = sectionConfig || data.sectionConfig;
    const items: CommandItem[] = [];

    // Navigation Sections
    if (config?.hero?.visible !== false) {
      items.push({
        id: 'nav-hero',
        category: 'Navigation',
        title: 'Hero & Overview',
        subtitle: 'Profile narrative, research pillars & microgrid architecture',
        icon: <Sparkles className="w-4 h-4 text-amber-500" />,
        action: () => jumpTo('#hero')
      });
    }

    if (config?.capabilities?.visible !== false) {
      items.push({
        id: 'nav-skills',
        category: 'Navigation',
        title: 'Technical Capabilities & Skills',
        subtitle: 'Ansys Fluent, SolidWorks, MATLAB, Python, OpenFOAM',
        icon: <Cpu className="w-4 h-4 text-amber-500" />,
        action: () => jumpTo('#capabilities')
      });
    }

    if (config?.projects?.visible !== false) {
      items.push({
        id: 'nav-projects',
        category: 'Navigation',
        title: 'Engineering Projects & CAD Modeling',
        subtitle: 'Mechanical mechanisms, simulations, and robotics',
        icon: <Briefcase className="w-4 h-4 text-amber-500" />,
        action: () => jumpTo('#projects')
      });
    }

    if (config?.experience?.visible !== false) {
      items.push({
        id: 'nav-exp',
        category: 'Navigation',
        title: 'Experience & Education',
        subtitle: 'Academic background, appointments & degree records',
        icon: <GraduationCap className="w-4 h-4 text-amber-500" />,
        action: () => jumpTo('#experience')
      });
    }

    if (config?.publications?.visible !== false) {
      items.push({
        id: 'nav-pubs',
        category: 'Navigation',
        title: 'Scholarly Publications',
        subtitle: 'Peer-reviewed journal papers, conferences & preprints',
        icon: <BookOpen className="w-4 h-4 text-amber-500" />,
        action: () => jumpTo('#publications')
      });
    }

    if (config?.trainings?.visible !== false) {
      items.push({
        id: 'nav-train',
        category: 'Navigation',
        title: 'Training, Field Visits & Certifications',
        subtitle: 'Industrial power plants, energy workshops & credentials',
        icon: <Award className="w-4 h-4 text-amber-500" />,
        action: () => jumpTo('#training')
      });
    }

    if (config?.contact?.visible !== false) {
      items.push({
        id: 'nav-contact',
        category: 'Navigation',
        title: 'Contact & Interactive Production Line',
        subtitle: 'Send direct messages or email inquiry',
        icon: <Mail className="w-4 h-4 text-amber-500" />,
        action: () => jumpTo('#contact')
      });
    }

    // Quick Actions
    items.push(
      {
        id: 'act-cv',
        category: 'Actions',
        title: 'Download Academic CV (PDF)',
        subtitle: 'Instant PDF export generated with complete credentials',
        icon: <FileText className="w-4 h-4 text-amber-500" />,
        action: handleDownloadCV
      },
      {
        id: 'act-copy-email',
        category: 'Actions',
        title: 'Copy Email to Clipboard',
        subtitle: data.profile.email,
        icon: <Mail className="w-4 h-4 text-amber-500" />,
        action: copyEmail
      },
      {
        id: 'act-theme',
        category: 'Actions',
        title: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        subtitle: 'Toggle high-contrast theme display',
        icon: darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-500" />,
        action: () => {
          onToggleDarkMode();
          onClose();
        }
      }
    );

    if (data.profile.social.scholar) {
      items.push({
        id: 'act-scholar',
        category: 'Actions',
        title: 'Open Google Scholar Profile',
        subtitle: 'View citation metrics, h-index & full publication list',
        icon: <ExternalLink className="w-4 h-4 text-amber-500" />,
        action: () => {
          window.open(data.profile.social.scholar, '_blank');
          onClose();
        }
      });
    }

    // Projects (only if projects section is active)
    if (config?.projects?.visible !== false) {
      data.projects?.forEach(proj => {
        items.push({
          id: `proj-${proj.id}`,
          category: 'Projects',
          title: proj.title,
          subtitle: proj.technologies.slice(0, 3).join(', '),
          icon: <Cpu className="w-4 h-4 text-amber-500" />,
          action: () => jumpTo(`#project-card-${proj.id}`)
        });
      });
    }

    // Publications (only if publications section is active, up to 20 recent)
    if (config?.publications?.visible !== false) {
      data.publications?.slice(0, 20).forEach(pub => {
        items.push({
          id: `pub-${pub.id}`,
          category: 'Publications',
          title: pub.title,
          subtitle: `${pub.venue || 'Article'} • ${pub.year}`,
          icon: <BookOpen className="w-4 h-4 text-amber-500" />,
          action: () => jumpTo(`#pub-card-${pub.id}`)
        });
      });
    }

    return isReferenceLayout ? items.filter(item => item.id !== 'act-theme') : items;
  }, [data, darkMode, onToggleDarkMode, sectionConfig, isReferenceLayout]);

  // Filter based on user query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search publications, or jump to section..."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[55vh]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs">Try searching for keywords like &ldquo;CFD&rdquo;, &ldquo;Solar&rdquo;, &ldquo;CV&rdquo;, or &ldquo;Skills&rdquo;</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-amber-500/10 dark:bg-amber-400/10 text-slate-900 dark:text-white border-l-4 border-amber-500' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">↵</kbd> Select
            </span>
          </div>
          <span>Academic Spotlight</span>
        </div>
      </div>
    </div>
  );
};
