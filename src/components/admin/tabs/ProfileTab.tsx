import React, { useState, useEffect } from 'react';
import { User, Save, Image, Link2, Sparkles, Building, Mail, Phone, MapPin, Award, ExternalLink, Layout, SunMedium, Sliders, CheckCircle2, Zap } from 'lucide-react';
import { Profile } from '../../../types';
import { updateProfileAPI } from '../../../api';
import { formatImageUrl } from '../../../utils/formatUrl';

interface ProfileTabProps {
  profile: Profile;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onRefresh, showToast }) => {
  const [formData, setFormData] = useState<Profile>({
    ...profile,
    aboutText: profile.aboutText || [],
    stats: { ...profile.stats },
    social: { ...profile.social }
  });
  const [aboutParagraphsText, setAboutParagraphsText] = useState(
    (profile.aboutText || []).join('\n\n')
  );
  const [researchInterestText, setResearchInterestText] = useState(profile.researchInterestText || "");
  const [researchInterestsText, setResearchInterestsText] = useState(
    (profile.researchInterests || ['Material Science', 'Additive Manufacturing Materials', 'Renewable Energy', 'Hydrogen Fuel', 'CFD in biofuels']).join(', ')
  );
  const [loading, setLoading] = useState(false);

  // Background synchronization saves first, then refreshes these shared values.
  const { citations: displayCitations, hIndex: displayHIndex } = profile.stats;
  useEffect(() => {
    setFormData(previous => ({ ...previous, stats: { ...previous.stats, citations: profile.stats.citations, hIndex: profile.stats.hIndex } }));
  }, [profile.stats.citations, profile.stats.hIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const parsedInterests = researchInterestsText.split(',').map(i => i.trim()).filter(Boolean);
    const parsedAbout = aboutParagraphsText
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean);

    const payload: Profile = {
      ...formData,
      aboutText: parsedAbout,
      researchInterests: parsedInterests,
      researchInterestText: researchInterestText,
      stats: {
        ...formData.stats,
        citations: displayCitations,
        hIndex: displayHIndex,
        publicationsCount: Number(formData.stats.publicationsCount) || 0,
        researchProjects: Number(formData.stats.researchProjects) || 0
      }
    };

    try {
      await updateProfileAPI(payload);
      showToast('Profile information saved successfully!');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-profile-tab">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>Edit Profile & Researcher Information</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify personal details, biographical narrative, affiliations, social handles, and impact metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          id="save-profile-btn"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">


        
        {/* Core Identity Card */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
            Core Identity & Headlines
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Academic Title / Position <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Overview Section Sub-Heading (e.g., Mechanical Engineering...)
            </label>
            <input
              type="text"
              value={formData.headline || ''}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Mechanical Engineering, Renewable Energy Systems & Field Analysis"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Status Tag (Pill on Hero)
            </label>
            <input
              type="text"
              value={formData.statusTag || ''}
              onChange={(e) => setFormData({ ...formData, statusTag: e.target.value })}
              placeholder="e.g. Available for Collaborative Research & Academic Inquiries"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Profile Photo / Avatar
              </label>
              <div className="flex items-start gap-3">
                {formData.avatarUrl ? (
                  <img 
                    src={formatImageUrl(formData.avatarUrl) || '/avatar.png'} 
                    alt="Avatar Preview" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.src.endsWith('/avatar.png')) {
                        img.src = '/avatar.png';
                      }
                    }}
                    className="w-12 h-12 rounded-full object-cover border border-slate-600 bg-slate-800 shrink-0 mt-1" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800 shrink-0 mt-1 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.avatarUrl || ''}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="Paste Image URL..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, avatarUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Brand Logo (Header + Browser Tab Icon)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Shown in the site header, and also used as the small icon in the browser tab, next to the title below. If left empty, the site automatically uses the default renewable energy crest icon.
              </p>
              <div className="flex items-start gap-3">
                {formData.logoUrl && formData.logoUrl !== 'chunked' ? (
                  <div className="relative group/preview">
                    <img 
                      src={formatImageUrl(formData.logoUrl)} 
                      alt="Logo Preview" 
                      className="w-12 h-12 rounded object-contain border border-slate-600 bg-slate-800 shrink-0 mt-1"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded border border-slate-600 bg-slate-800 shrink-0 mt-1 flex flex-col items-center justify-center text-[10px] text-slate-400 p-1 text-center">
                    <span>Default Icon</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={formData.logoUrl && formData.logoUrl !== 'chunked' ? formData.logoUrl : ''}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="Paste Logo URL or Google Drive link..."
                      className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: '' })}
                        className="px-3 py-2 text-xs bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded-xl transition-colors shrink-0"
                        title="Revert to default brand icon"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, logoUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Browser Tab Title
              </label>
              <p className="text-xs text-slate-500 mb-2">
                The text shown in the browser tab, next to the icon above. Leave empty to default to "{formData.name} — {formData.title}".
              </p>
              <input
                type="text"
                value={formData.siteTitle || ''}
                onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                placeholder={`${formData.name} — ${formData.title}`}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Curriculum Vitae (CV) PDF URL or Link
              </label>
              <input
                type="text"
                value={formData.cvUrl || ''}
                onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        {/* Narrative & About Card */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
            Biographical Statement & About Narrative
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Bio Summary
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              About Section Paragraphs (Separate each paragraph with an empty line)
            </label>
            <textarea
              rows={6}
              value={aboutParagraphsText}
              onChange={(e) => setAboutParagraphsText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y leading-relaxed font-sans"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
            Current Research Interests
          </h3>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Comma-Separated Interests</label>
            <input
              type="text"
              value={researchInterestsText}
              onChange={(e) => setResearchInterestsText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              placeholder="Material Science, Renewable Energy, Hydrogen Fuel"
            />
            <p className="text-xs text-slate-500 mt-1">These will appear as pills under your introduction.</p>
          </div>
          <div className="space-y-1.5 mt-4">
            <label className="text-xs font-semibold text-slate-300">Research Interest Paragraph</label>
            <textarea
              value={researchInterestText}
              onChange={(e) => setResearchInterestText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y leading-relaxed font-sans"
              rows={4}
              placeholder="Hi! I'm Rashedul Islam..."
            />
          </div>
        </div>

        {/* Affiliation & Contact */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
            Affiliation & Contact Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Institution / Affiliation
              </label>
              <input
                type="text"
                value={formData.affiliation}
                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department / Lab
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Campus Location / City
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        {/* Social & Academic Handles */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
            Academic Profiles & Social Handles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Google Scholar URL</label>
                {formData.social.scholar && (
                  <a
                    href={formData.social.scholar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                placeholder="https://scholar.google.com/citations?user=..."
                value={formData.social.scholar || ''}
                onChange={(e) => setFormData({ ...formData, social: { ...formData.social, scholar: e.target.value } })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ResearchGate URL</label>
              <input
                type="text"
                value={formData.social.researchgate || ''}
                onChange={(e) => setFormData({ ...formData, social: { ...formData.social, researchgate: e.target.value } })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub URL</label>
              <input
                type="text"
                value={formData.social.github || ''}
                onChange={(e) => setFormData({ ...formData, social: { ...formData.social, github: e.target.value } })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={formData.social.linkedin || ''}
                onChange={(e) => setFormData({ ...formData, social: { ...formData.social, linkedin: e.target.value } })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ORCID URL / ID</label>
              <input
                type="text"
                value={formData.social.orcid || ''}
                onChange={(e) => setFormData({ ...formData, social: { ...formData.social, orcid: e.target.value } })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Website / Domain</label>
              <input
                type="text"
                value={formData.social.website || ''}
                onChange={(e) => setFormData({ ...formData, social: { ...formData.social, website: e.target.value } })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
            Impact Metrics Display
          </h3>
          
          <p className="text-xs text-slate-400 -mt-2">
            Calculated from saved paper citations. Google Scholar updates are saved automatically after page load.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Citations (auto-synced, read-only)</label>
              <input
                type="number"
                value={displayCitations}
                readOnly
                disabled
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">h-Index (auto-synced, read-only)</label>
              <input
                type="number"
                value={displayHIndex}
                readOnly
                disabled
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

    </div>
  );
};
