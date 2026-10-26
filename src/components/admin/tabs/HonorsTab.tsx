import { SectionHeadingEditor } from '../SectionHeadingEditor';
import React, { useState } from 'react';
import { Award, Plus, Edit3, Trash2, X, Link, Mail, Phone, MapPin, Building, Eye, EyeOff, Globe } from 'lucide-react';
import { Reference, VolunteerEngagement, Achievement, Affiliation } from '../../../types';
import {
  updateReferencesAPI,
  updateVolunteerWorkAPI,
  updateAchievementsAPI,
  updateAffiliationsAPI
} from '../../../api';

interface HonorsTabProps {
  data?: any;
  references: Reference[];
  volunteerWork: VolunteerEngagement[];
  achievements: Achievement[];
  affiliations: Affiliation[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const HonorsTab: React.FC<HonorsTabProps> = ({ data, references,
  volunteerWork,
  achievements,
  affiliations,
  onRefresh,
  showToast
}) => {
  const [subTab, setSubTab] = useState<'references' | 'volunteer' | 'achievements' | 'affiliations'>('references');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const handleSubTabChange = (tab: any) => {
    setSubTab(tab);
    setFormData({});
    setEditingId(null);
  };

  const openAddModal = () => {
    setEditingId(null);
    if (subTab === 'references') {
      setFormData({ name: '', role: '', department: '', institution: '', email: '', phone: '', website: '', isLive: true });
    } else if (subTab === 'volunteer') {
      setFormData({ title: '', role: '', organization: '', description: '', period: '', isLive: true });
    } else if (subTab === 'achievements') {
      setFormData({ title: '', category: '', year: '', description: '', isLive: true });
    } else if (subTab === 'affiliations') {
      setFormData({ role: '', organization: '', period: '', isLive: true });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item, isLive: item.isLive !== false });
    setIsModalOpen(true);
  };

  const handleToggleLive = async (item: any) => {
    const nextLive = item.isLive === false ? true : false;
    try {
      if (subTab === 'references') {
        const newData = references.map(r => r.id === item.id ? { ...r, isLive: nextLive } : r);
        await updateReferencesAPI(newData);
      } else if (subTab === 'volunteer') {
        const newData = volunteerWork.map(v => v.id === item.id ? { ...v, isLive: nextLive } : v);
        await updateVolunteerWorkAPI(newData);
      } else if (subTab === 'achievements') {
        const newData = achievements.map(a => a.id === item.id ? { ...a, isLive: nextLive } : a);
        await updateAchievementsAPI(newData);
      } else if (subTab === 'affiliations') {
        const newData = affiliations.map(a => a.id === item.id ? { ...a, isLive: nextLive } : a);
        await updateAffiliationsAPI(newData);
      }
      showToast(`${item.title || item.name || item.role || item.organization || 'Item'} is now ${nextLive ? 'Live on public portfolio' : 'Hidden from public portfolio'}!`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error updating visibility', 'error');
    }
  };

  const handleBulkToggleLive = async (makeLive: boolean) => {
    try {
      const activeCount = subTabCounts[subTab].total;
      if (activeCount === 0) {
        showToast(`No items in ${subTab} to update`, 'error');
        return;
      }
      if (subTab === 'references') {
        const newData = references.map(r => ({ ...r, isLive: makeLive }));
        await updateReferencesAPI(newData);
      } else if (subTab === 'volunteer') {
        const newData = volunteerWork.map(v => ({ ...v, isLive: makeLive }));
        await updateVolunteerWorkAPI(newData);
      } else if (subTab === 'achievements') {
        const newData = achievements.map(a => ({ ...a, isLive: makeLive }));
        await updateAchievementsAPI(newData);
      } else if (subTab === 'affiliations') {
        const newData = affiliations.map(a => ({ ...a, isLive: makeLive }));
        await updateAffiliationsAPI(newData);
      }
      const labelMap: Record<string, string> = {
        references: 'References',
        volunteer: 'Volunteer Engagements',
        achievements: 'Achievements',
        affiliations: 'Affiliations'
      };
      showToast(
        makeLive
          ? `All ${activeCount} ${labelMap[subTab]} are now LIVE on the public portfolio!`
          : `All ${activeCount} ${labelMap[subTab]} are now HIDDEN from the public portfolio!`,
        'success'
      );
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error updating group visibility', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (subTab === 'references') {
        await updateReferencesAPI(references.filter(r => r.id !== id));
      } else if (subTab === 'volunteer') {
        await updateVolunteerWorkAPI(volunteerWork.filter(v => v.id !== id));
      } else if (subTab === 'achievements') {
        await updateAchievementsAPI(achievements.filter(a => a.id !== id));
      } else if (subTab === 'affiliations') {
        await updateAffiliationsAPI(affiliations.filter(a => a.id !== id));
      }
      showToast('Item deleted successfully', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error deleting item', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (subTab === 'references') {
        const newData = editingId ? references.map(r => r.id === editingId ? { ...formData, id: editingId } : r) : [...references, { ...formData, id: `new-${Date.now()}` }];
        await updateReferencesAPI(newData);
      } else if (subTab === 'volunteer') {
        const newData = editingId ? volunteerWork.map(v => v.id === editingId ? { ...formData, id: editingId } : v) : [...volunteerWork, { ...formData, id: `new-${Date.now()}` }];
        await updateVolunteerWorkAPI(newData);
      } else if (subTab === 'achievements') {
        const newData = editingId ? achievements.map(a => a.id === editingId ? { ...formData, id: editingId } : a) : [...achievements, { ...formData, id: `new-${Date.now()}` }];
        await updateAchievementsAPI(newData);
      } else if (subTab === 'affiliations') {
        const newData = editingId ? affiliations.map(a => a.id === editingId ? { ...formData, id: editingId } : a) : [...affiliations, { ...formData, id: `new-${Date.now()}` }];
        await updateAffiliationsAPI(newData);
      }
      showToast('Item saved successfully', 'success');
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error saving item', 'error');
    }
  };

  const subTabCounts: Record<string, { total: number; live: number }> = {
    references: {
      total: references.length,
      live: references.filter(r => r.isLive !== false).length
    },
    volunteer: {
      total: volunteerWork.length,
      live: volunteerWork.filter(v => v.isLive !== false).length
    },
    achievements: {
      total: achievements.length,
      live: achievements.filter(a => a.isLive !== false).length
    },
    affiliations: {
      total: affiliations.length,
      live: affiliations.filter(a => a.isLive !== false).length
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeadingEditor sectionKey="honors" data={data} onRefresh={onRefresh} showToast={showToast} />
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex space-x-2 bg-slate-900/50 p-1.5 rounded-xl overflow-x-auto w-full sm:w-auto border border-slate-700/50">
            {[
              { id: 'references', label: 'References' },
              { id: 'volunteer', label: 'Volunteer' },
              { id: 'achievements', label: 'Achievements' },
              { id: 'affiliations', label: 'Affiliations' },
            ].map((tab) => {
              const count = subTabCounts[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSubTabChange(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    subTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    subTab === tab.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count.live}/{count.total} Live
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>

        {/* Master Group Visibility & Live Status Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 mb-5 rounded-xl bg-slate-900/80 border border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
              subTabCounts[subTab].live > 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {subTab === 'references' && 'Academic References'}
                  {subTab === 'volunteer' && 'Volunteer & Community Engagements'}
                  {subTab === 'achievements' && 'Honors & Awards'}
                  {subTab === 'affiliations' && 'Institutional Affiliations'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide border ${
                  subTabCounts[subTab].live === subTabCounts[subTab].total && subTabCounts[subTab].total > 0
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
                    : subTabCounts[subTab].live > 0
                    ? 'bg-sky-950/80 text-sky-300 border-sky-600/60'
                    : 'bg-rose-950/80 text-rose-300 border-rose-600/60'
                }`}>
                  {subTabCounts[subTab].live === subTabCounts[subTab].total && subTabCounts[subTab].total > 0
                    ? 'WHOLE GROUP LIVE'
                    : subTabCounts[subTab].live > 0
                    ? `${subTabCounts[subTab].live}/${subTabCounts[subTab].total} LIVE`
                    : 'WHOLE GROUP HIDDEN'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {subTabCounts[subTab].live > 0
                  ? `Currently visible on your public portfolio (${subTabCounts[subTab].live} active).`
                  : `Currently completely hidden from your public portfolio.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => handleBulkToggleLive(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 hover:border-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={`Make all ${subTab} live on public website`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Make Whole Group Live</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggleLive(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={`Hide all ${subTab} from public website`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Whole Group</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {subTab === 'references' && references.map(ref => (
            <div key={ref.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-200">{ref.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                    ref.isLive !== false
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {ref.isLive !== false ? 'Live on Site' : 'Hidden'}
                  </span>
                </div>
                <div className="text-sm text-slate-400 mt-1">{ref.role || ref.designation} {ref.department ? `· ${ref.department}` : ''}</div>
                <div className="text-xs text-slate-500 mt-0.5">{ref.institution || ref.organization}</div>
              </div>
              <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleLive(ref)}
                  title={ref.isLive !== false ? "Click to hide from public portfolio" : "Click to show in public portfolio"}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    ref.isLive !== false
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/90'
                      : 'bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${ref.isLive !== false ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span>{ref.isLive !== false ? 'Public: ON' : 'Public: OFF'}</span>
                </button>
                <button onClick={() => openEditModal(ref)} className="p-2 bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(ref.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {subTab === 'volunteer' && volunteerWork.map(vol => (
            <div key={vol.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-200">{vol.title || vol.role}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                    vol.isLive !== false
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {vol.isLive !== false ? 'Live on Site' : 'Hidden'}
                  </span>
                </div>
                <div className="text-sm text-slate-400 mt-1">{vol.organization} {vol.period ? `· ${vol.period}` : ''}</div>
              </div>
              <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleLive(vol)}
                  title={vol.isLive !== false ? "Click to hide from public portfolio" : "Click to show in public portfolio"}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    vol.isLive !== false
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/90'
                      : 'bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${vol.isLive !== false ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span>{vol.isLive !== false ? 'Public: ON' : 'Public: OFF'}</span>
                </button>
                <button onClick={() => openEditModal(vol)} className="p-2 bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(vol.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {subTab === 'achievements' && achievements.map(ach => (
            <div key={ach.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-200">{ach.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                    ach.isLive !== false
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {ach.isLive !== false ? 'Live on Site' : 'Hidden'}
                  </span>
                </div>
                <div className="text-sm text-slate-400 mt-1">{ach.year} · {ach.category || 'Award'}</div>
              </div>
              <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleLive(ach)}
                  title={ach.isLive !== false ? "Click to hide from public portfolio" : "Click to show in public portfolio"}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    ach.isLive !== false
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/90'
                      : 'bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${ach.isLive !== false ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span>{ach.isLive !== false ? 'Public: ON' : 'Public: OFF'}</span>
                </button>
                <button onClick={() => openEditModal(ach)} className="p-2 bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(ach.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {subTab === 'affiliations' && affiliations.map(aff => (
            <div key={aff.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-200">{aff.role}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                    aff.isLive !== false
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {aff.isLive !== false ? 'Live on Site' : 'Hidden'}
                  </span>
                </div>
                <div className="text-sm text-slate-400 mt-1">{aff.organization} {aff.period ? `· ${aff.period}` : ''}</div>
              </div>
              <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleLive(aff)}
                  title={aff.isLive !== false ? "Click to hide from public portfolio" : "Click to show in public portfolio"}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    aff.isLive !== false
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/90'
                      : 'bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${aff.isLive !== false ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span>{aff.isLive !== false ? 'Public: ON' : 'Public: OFF'}</span>
                </button>
                <button onClick={() => openEditModal(aff)} className="p-2 bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(aff.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h3 className="text-lg font-bold text-slate-100">
                {editingId ? 'Edit Item' : 'Add Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">


              {subTab === 'references' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                      <input required type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role/Designation</label>
                      <input type="text" value={formData.role || formData.designation || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Organization/Institution</label>
                    <input type="text" value={formData.institution || formData.organization || ''} onChange={(e) => setFormData({...formData, institution: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                    <input type="text" value={formData.department || ''} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                      <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                      <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Website URL</label>
                    <input type="url" value={formData.website || ''} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </>
              )}
              {subTab === 'volunteer' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title / Role</label>
                    <input required type="text" value={formData.title || formData.role || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Organization</label>
                    <input type="text" value={formData.organization || ''} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Period</label>
                    <input type="text" value={formData.period || ''} onChange={(e) => setFormData({...formData, period: e.target.value})} placeholder="e.g. 2022 - 2023" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </>
              )}
              {subTab === 'achievements' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                    <input required type="text" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                      <input type="text" value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year</label>
                      <input type="text" value={formData.year || ''} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </>
              )}
              {subTab === 'affiliations' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role / Title</label>
                    <input required type="text" value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Organization</label>
                    <input type="text" value={formData.organization || ''} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Period</label>
                    <input type="text" value={formData.period || ''} onChange={(e) => setFormData({...formData, period: e.target.value})} placeholder="e.g. 2022 - 2023" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </>
              )}

              {/* Universal Live/Public Toggle for All Sub-Tabs */}
              <div className="flex items-center space-x-3 py-3 border-t border-slate-700/80 bg-slate-900/40 -mx-6 px-6 rounded-b-xl">
                <input type="checkbox" id="isLiveShared" checked={formData.isLive !== false} onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })} className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-slate-800 cursor-pointer" />
                <label htmlFor="isLiveShared" className="text-xs font-semibold text-slate-200 cursor-pointer">Show in public portfolio (Live on website)</label>
              </div>

              <div className="pt-4 border-t border-slate-700 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
