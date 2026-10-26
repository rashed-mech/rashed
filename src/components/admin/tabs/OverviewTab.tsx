import React, { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  Mail, 
  Award, 
  TrendingUp, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  UserCheck,
  User,
  Briefcase,
  Terminal,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { PortfolioData } from '../../../types';
import { publicationStats } from '../../../utils/publicationStats';
import { updateSectionConfigAPI } from '../../../api';

interface OverviewTabProps {
  data: PortfolioData;
  onNavigateTab: (tab: string) => void;
  onViewLive: () => void;
  onRefresh?: () => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

interface SectionMeta {
  key: string;
  name: string;
  desc: string;
  tab: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PORTFOLIO_SECTIONS: SectionMeta[] = [
  { 
    key: 'hero', 
    name: 'Hero & Academic Profile', 
    desc: 'Cover narrative, avatar, research keywords & scholar stats', 
    tab: 'profile', 
    icon: User 
  },
  { 
    key: 'overview', 
    name: 'Research Pillars & Metrics', 
    desc: 'Core pillars, simulation methodologies & numerical metrics', 
    tab: 'highlights', 
    icon: Sparkles 
  },
  { 
    key: 'capabilities', 
    name: 'Technical Capabilities', 
    desc: 'Engineering software proficiencies (Ansys, SolidWorks, MATLAB)', 
    tab: 'skills', 
    icon: Terminal 
  },
  { 
    key: 'projects', 
    name: 'Research & CAD Projects', 
    desc: 'Interactive 3D CAD mechanism showcases and design models', 
    tab: 'projects', 
    icon: Code 
  },
  { 
    key: 'experience', 
    name: 'Experience & Education', 
    desc: 'Academic appointments, RA positions, and university degrees', 
    tab: 'timeline', 
    icon: Briefcase 
  },
  { 
    key: 'publications', 
    name: 'Scholarly Publications', 
    desc: 'Peer-reviewed journal papers, citations, DOIs & preprints', 
    tab: 'publications', 
    icon: BookOpen 
  },
  { 
    key: 'trainings', 
    name: 'Trainings & Field Visits', 
    desc: 'Industrial plant visits, energy workshops & practical credentials', 
    tab: 'trainings', 
    icon: Award 
  },
  { 
    key: 'honors', 
    name: 'Honors, Activities & References', 
    desc: 'Awards, Olympiad medals, affiliations & verified referees', 
    tab: 'honors', 
    icon: Award 
  },
  { 
    key: 'contact', 
    name: 'Interactive Contact Section', 
    desc: 'Visitor inquiry form, direct message inbox & production line', 
    tab: 'messages', 
    icon: Mail 
  }
];

export const OverviewTab: React.FC<OverviewTabProps> = ({ 
  data, 
  onNavigateTab, 
  onViewLive,
  onRefresh,
  showToast 
}) => {
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const unreadMessages = (data.messages || []).filter(m => !m.read).length;

  const { citations: liveCitations, hIndex: liveHIndex } = publicationStats(data.publications);

  const sectionConfig = data.sectionConfig || {};

  const isSectionVisible = (key: string): boolean => {
    return (sectionConfig as any)?.[key]?.visible !== false;
  };

  const totalSections = PORTFOLIO_SECTIONS.length;
  const visibleCount = PORTFOLIO_SECTIONS.filter(s => isSectionVisible(s.key)).length;
  const hiddenCount = totalSections - visibleCount;

  const handleToggleSection = async (sectionKey: string) => {
    const currentVisible = isSectionVisible(sectionKey);
    const nextVisible = !currentVisible;

    try {
      setTogglingKey(sectionKey);
      const newConfig = {
        ...sectionConfig,
        [sectionKey]: {
          ...((sectionConfig as any)?.[sectionKey] || {}),
          visible: nextVisible
        }
      };

      await updateSectionConfigAPI(newConfig);

      if (showToast) {
        showToast(
          nextVisible 
            ? `Section "${sectionKey.toUpperCase()}" is now LIVE on public portfolio`
            : `Section "${sectionKey.toUpperCase()}" is now HIDDEN from public portfolio`,
          'success'
        );
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setTogglingKey(null);
    }
  };

  const handleShowAll = async () => {
    try {
      setTogglingKey('ALL');
      const newConfig = { ...sectionConfig };
      PORTFOLIO_SECTIONS.forEach(s => {
        newConfig[s.key] = {
          ...((newConfig as any)?.[s.key] || {}),
          visible: true
        };
      });
      await updateSectionConfigAPI(newConfig);
      if (showToast) showToast('All public portfolio sections set to LIVE', 'success');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setTogglingKey(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-overview-tab">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-slate-800 to-slate-800/80 border border-indigo-500/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {data.profile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            You can create, update, and manage all publications, research projects, credentials, and section visibility on your public portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onViewLive}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
            id="overview-live-preview-btn"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Publications */}
        <div 
          onClick={() => onNavigateTab('publications')}
          className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 transition-all cursor-pointer group"
          id="metric-card-publications"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Publications</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{data.publications.length}</span>
            <span className="text-xs text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Projects */}
        <div 
          onClick={() => onNavigateTab('projects')}
          className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 transition-all cursor-pointer group"
          id="metric-card-projects"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Research & Dev Projects</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{data.projects.length}</span>
            <span className="text-xs text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Messages */}
        <div 
          onClick={() => onNavigateTab('messages')}
          className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 transition-all cursor-pointer group"
          id="metric-card-messages"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Visitor Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center relative">
              <Mail className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white">{(data.messages || []).length}</span>
              {unreadMessages > 0 && (
                <span className="text-xs font-bold text-amber-400">({unreadMessages} new)</span>
              )}
            </div>
            <span className="text-xs text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              View Inbox <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Citations & Impact */}
        <div 
          onClick={() => onNavigateTab('profile')}
          className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 transition-all cursor-pointer group"
          id="metric-card-impact"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Scholar Citations</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{liveCitations}+</span>
            <span className="text-xs text-slate-400 font-semibold">
              h-index: {liveHIndex}
            </span>
          </div>
        </div>

      </div>

      {/* Public Portfolio Section Visibility Manager */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Public Portfolio Section Visibility
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-900 text-indigo-300 border border-slate-700">
                {visibleCount} Live / {totalSections} Total
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Control which sections appear on your public website. Turning a section off immediately hides it from the live portfolio, navigation links, and command search.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={handleShowAll}
                disabled={togglingKey === 'ALL'}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all flex items-center gap-1.5"
              >
                {togglingKey === 'ALL' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                <span>Make All Live</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PORTFOLIO_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isVisible = isSectionVisible(sec.key);
            const isToggling = togglingKey === sec.key;

            return (
              <div
                key={sec.key}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isVisible
                    ? 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600'
                    : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isVisible 
                        ? 'bg-indigo-500/10 text-indigo-400' 
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{sec.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">#{sec.key}</span>
                    </div>
                  </div>

                  {/* Live Status Badge */}
                  {isVisible ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0 animate-pulse">
                      <EyeOff className="w-3 h-3 text-amber-400" />
                      Hidden
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {sec.desc}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {/* Quick Edit shortcut */}
                  <button
                    type="button"
                    onClick={() => onNavigateTab(sec.tab)}
                    className="text-[11px] font-medium text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
                  >
                    <span>Edit Content</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleSection(sec.key)}
                    disabled={isToggling}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isVisible
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-500/40 shadow-sm'
                    } disabled:opacity-50`}
                  >
                    {isToggling ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isVisible ? (
                      <>
                        <EyeOff className="w-3 h-3 text-amber-400" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span>Make Live</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Jump Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Publications list */}
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Recent Publications</span>
            </h3>
            <button
              onClick={() => onNavigateTab('publications')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View All ({data.publications.length})
            </button>
          </div>

          <div className="space-y-3">
            {data.publications.slice(0, 3).map(pub => (
              <div key={pub.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold">{pub.category}</span>
                  <span className="text-slate-400">{pub.year}</span>
                </div>
                <p className="text-xs font-semibold text-white line-clamp-1">{pub.title}</p>
                <p className="text-[11px] text-slate-400 italic line-clamp-1">{pub.venue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages list */}
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Recent Contact Inquiries</span>
            </h3>
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Inbox ({(data.messages || []).length})
            </button>
          </div>

          <div className="space-y-3">
            {(data.messages || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No messages in inbox yet.</p>
            ) : (
              (data.messages || []).slice(0, 3).map(msg => (
                <div key={msg.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white">{msg.name}</span>
                    <span className="text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 line-clamp-1">{msg.subject}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
