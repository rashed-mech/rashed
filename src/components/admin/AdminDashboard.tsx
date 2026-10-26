import React, { useState } from 'react';
import { 
  Type,
  LayoutDashboard, 
  BookOpen, 
  Code, 
  User, 
  Briefcase, 
  Terminal, 
  Mail, 
  Settings, 
  LogOut, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  ShieldCheck,
  Moon,
  Sun,
  Award, Sparkles,
  Palette
} from 'lucide-react';
import { PortfolioData } from '../../types';
import { logoutAdmin } from '../../api';
import { OverviewTab } from './tabs/OverviewTab';
import { HighlightsTab } from './tabs/HighlightsTab';
import { PublicationsTab } from './tabs/PublicationsTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import { ProfileTab } from './tabs/ProfileTab';
import { UXDesignTab } from './tabs/UXDesignTab';
import { TimelineTab } from './tabs/TimelineTab';
import { SkillsTab } from './tabs/SkillsTab';
import { TrainingsTab } from './tabs/TrainingsTab';
import { CertificationsTab } from './tabs/CertificationsTab';
import { MessagesTab } from './tabs/MessagesTab';
import { SettingsTab } from './tabs/SettingsTab';
import { HonorsTab } from './tabs/HonorsTab';

interface AdminDashboardProps {
  data: PortfolioData;
  onRefresh: () => void;
  onLogout: () => void;
  onViewLive: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  data,
  onRefresh,
  onLogout,
  onViewLive,
  darkMode,
  onToggleDarkMode
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLogout = () => {
    logoutAdmin();
    onLogout();
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ux-design', label: 'Portfolio UX Design', icon: Palette },
    { id: 'publications', label: 'Publications', icon: BookOpen, count: data.publications.length },
    { id: 'projects', label: 'Projects', icon: Code, count: data.projects.length },
    { id: 'profile', label: 'Researcher Profile', icon: User },
    { id: 'highlights', label: 'Highlights & Metrics', icon: Sparkles },
        { id: 'timeline', label: 'Experience & Edu', icon: Briefcase },
    { id: 'skills', label: 'Skills & Tools', icon: Terminal },
    { id: 'trainings', label: 'Trainings', icon: Award, count: (data.trainings || []).length },
    { id: 'certifications', label: 'Certifications', icon: Award, count: (data.certifications || []).length },
    { id: 'honors', label: 'Honors & References', icon: Award, count: (data.references?.length || 0) + (data.volunteerWork?.length || 0) },
    { id: 'messages', label: 'Contact Messages', icon: Mail, count: (data.messages || []).filter(m => !m.read).length, isBadgeNew: true },
    { id: 'settings', label: 'Security & DB', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row" id="admin-dashboard-container">
      
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
              : 'bg-red-950 border-red-700 text-red-200'
          }`}
          id="admin-toast-notification"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-800/90 border-b border-slate-700 sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div>
            <span className="font-bold text-sm text-white">Portfolio CMS</span>
            <span className="block text-[10px] text-slate-400">/admin</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onViewLive}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white"
            title="View Live Site"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-800/95 md:bg-slate-800/80 border-r border-slate-700/80 flex flex-col justify-between p-4 backdrop-blur-md transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        id="admin-sidebar"
      >
        <div className="space-y-6">
          {/* Logo & User Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-tight">Admin Console</h1>
                <p className="text-[11px] text-slate-400 font-mono">/admin portal</p>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                  }`}
                  id={`admin-nav-${item.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.isBadgeNew
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-indigo-700 text-indigo-100'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 border-t border-slate-700/80 space-y-2">
          <button
            onClick={onViewLive}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
            id="admin-sidebar-view-site"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            <span>Public Portfolio</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/60 transition-colors cursor-pointer"
            id="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-y-auto" id="admin-main-viewport">
        {activeTab === 'overview' && (
          <OverviewTab
            data={data}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onViewLive={onViewLive}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'publications' && (
          <PublicationsTab
            data={data} publications={data.publications}
            profile={data.profile}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            data={data} projects={data.projects}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'ux-design' && (
          <UXDesignTab
            themeUX={data.themeUX}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={data.profile}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

                        {activeTab === 'highlights' && (
          <HighlightsTab
            data={data}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}
        {activeTab === 'timeline' && (
          <TimelineTab
            data={data} experience={data.experience}
            education={data.education}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab
            data={data} skillGroups={data.skillGroups}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'trainings' && (
          <TrainingsTab
            data={data} trainings={data.trainings}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'certifications' && (
          <CertificationsTab
            certifications={data.certifications}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesTab
            messages={data.messages || []}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'honors' && (
          <HonorsTab
            data={data} references={data.references || []}
            volunteerWork={data.volunteerWork || []}
            achievements={data.achievements || []}
            affiliations={data.affiliations || []}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            data={data}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}
      </main>

    </div>
  );
};
