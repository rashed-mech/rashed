import React, { useState, useEffect } from 'react';
import { Type, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { updateSectionConfigAPI } from '../../api';

interface Props {
  sectionKey: string;
  data: any;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success'|'error') => void;
}

export const SectionHeadingEditor: React.FC<Props> = ({ sectionKey, data, onRefresh, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(data?.sectionConfig?.[sectionKey]?.title || '');
  const [subtitle, setSubtitle] = useState(data?.sectionConfig?.[sectionKey]?.subtitle || '');
  const [visible, setVisible] = useState<boolean>(data?.sectionConfig?.[sectionKey]?.visible !== false);

  useEffect(() => {
    setVisible(data?.sectionConfig?.[sectionKey]?.visible !== false);
    setTitle(data?.sectionConfig?.[sectionKey]?.title || '');
    setSubtitle(data?.sectionConfig?.[sectionKey]?.subtitle || '');
  }, [data, sectionKey]);

  const handleToggleVisibility = async () => {
    const nextVisible = !visible;
    setVisible(nextVisible);
    try {
      setLoading(true);
      const newConfig = {
        ...data?.sectionConfig,
        [sectionKey]: {
          ...(data?.sectionConfig?.[sectionKey] || {}),
          title,
          subtitle,
          visible: nextVisible
        }
      };
      await updateSectionConfigAPI(newConfig);
      showToast(
        nextVisible 
          ? `"${sectionKey.toUpperCase()}" is now LIVE on public portfolio`
          : `"${sectionKey.toUpperCase()}" is now HIDDEN from public portfolio`, 
        'success'
      );
      onRefresh();
    } catch (err: any) {
      setVisible(!nextVisible);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const newConfig = {
        ...data?.sectionConfig,
        [sectionKey]: {
          ...(data?.sectionConfig?.[sectionKey] || {}),
          title,
          subtitle,
          visible
        }
      };
      await updateSectionConfigAPI(newConfig);
      showToast('Section settings and visibility saved successfully', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mb-8 bg-slate-800/80 border rounded-2xl overflow-hidden shadow-lg transition-all ${
      visible ? 'border-slate-700/60' : 'border-amber-500/40 shadow-amber-950/20'
    }`}>
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-700/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Type className="w-5 h-5 text-indigo-400" />
              Section Headings & Visibility
            </h3>
            {visible ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live on Public Portfolio</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Hidden from Public Portfolio</span>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Customize the title, subtitle, and live display status for this section on the public site.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleVisibility}
            disabled={loading}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 ${
              visible
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-500/40 shadow-md shadow-emerald-900/30'
            }`}
            title={visible ? "Hide this section from the live site" : "Make this section visible on the live site"}
          >
            {visible ? (
              <>
                <EyeOff className="w-4 h-4 text-amber-400" />
                <span>Hide from Public Site</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Publish to Public Site</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50 text-xs font-semibold"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Hidden Warning Notice Banner */}
      {!visible && (
        <div className="px-5 py-3 bg-amber-950/40 border-b border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-200">
          <EyeOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Public Visibility Alert:</strong> This section is currently set to <strong>Hidden</strong>. Visitors cannot see this section, and it is removed from the top navigation bar and search palette.
          </span>
        </div>
      )}

      {/* Form Fields */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Main Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 shadow-inner"
            placeholder="e.g. Core Engineering & Simulation Proficiencies"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Subtitle / Description</label>
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={2}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 shadow-inner resize-none"
            placeholder="Write a brief description..."
          />
        </div>
      </div>
    </div>
  );
};
