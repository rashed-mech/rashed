import { motion } from 'motion/react';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  FileText,
  Quote,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Check,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Award
} from 'lucide-react';
import { Publication } from '../types';
import { useToast } from '../context/ToastContext';

interface PublicationsSectionProps {
  config?: { title: string; subtitle: string };
  publications: Publication[];
  scholarUrl?: string;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({ publications, scholarUrl, config }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'citations' | 'journal_first' | 'oldest'>('latest');
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [activeCitationDropdown, setActiveCitationDropdown] = useState<string | null>(null);

  const [citationCounts, setCitationCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeCitationDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.cite-dropdown-container')) {
          setActiveCitationDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeCitationDropdown]);

  const { showToast } = useToast();

  const copyBibTeX = (publication: Publication) => {
    const content = publication.bibtex || `@article{${publication.authors.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}${publication.year},\n  title={${publication.title}},\n  author={${publication.authors}},\n  journal={${publication.venue}},\n  year={${publication.year}},\n  doi={${publication.doi || ''}}\n}`;
    navigator.clipboard.writeText(content);
    showToast('BibTeX citation copied to clipboard!', 'success');
    setActiveCitationDropdown(null);
  };

  const copyAPA = (publication: Publication) => {
    const content = `${publication.authors} (${publication.year}). ${publication.title}. ${publication.venue}.${publication.doi ? ` https://doi.org/${publication.doi.replace('https://doi.org/', '')}` : ''}`;
    navigator.clipboard.writeText(content);
    showToast('APA citation copied to clipboard!', 'success');
    setActiveCitationDropdown(null);
  };

  const handleDownload = (format: string, publication: Publication) => {
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    switch (format) {
      case 'BibTeX':
        content = publication.bibtex || `@article{${publication.authors.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}${publication.year},\n  title={${publication.title}},\n  author={${publication.authors}},\n  journal={${publication.venue}},\n  year={${publication.year}},\n  doi={${publication.doi || ''}}\n}`;
        filename = 'citation.bib';
        break;
      case 'EndNote':
        content = `%0 Journal Article\n%A ${publication.authors}\n%T ${publication.title}\n%J ${publication.venue}\n%D ${publication.year}\n${publication.doi ? `%R ${publication.doi}\n` : ''}`;
        filename = 'citation.enw';
        mimeType = 'application/x-endnote-refer';
        break;
      case 'RefMan':
        content = `TY  - JOUR\nAU  - ${publication.authors}\nTI  - ${publication.title}\nJO  - ${publication.venue}\nPY  - ${publication.year}\n${publication.doi ? `DO  - ${publication.doi}\n` : ''}ER  - `;
        filename = 'citation.ris';
        mimeType = 'application/x-research-info-systems';
        break;
      case 'RefWorks':
        content = `RT Journal Article\nA1 ${publication.authors}\nT1 ${publication.title}\nJF ${publication.venue}\nYR ${publication.year}\n`;
        filename = 'citation.txt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported citation as ${filename}!`, 'success');
    setActiveCitationDropdown(null);
  };


  // Initialize citation counts from props
  useEffect(() => {
    const initial: Record<string, number> = {};
    publications.forEach(pub => {
      if (pub.citations !== undefined) {
        initial[pub.id] = pub.citations;
      }
    });
    setCitationCounts(initial);
  }, [publications]);

  // Live auto-sync individual paper citations from Google Scholar on every load
  useEffect(() => {
    if (!scholarUrl) return;

    let isMounted = true;
    const fetchLiveScholarCitations = async () => {
      try {
        const res = await fetch(`/api/scholar/sync?url=${encodeURIComponent(scholarUrl)}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data && isMounted) {
          const scholarMap = json.data as Record<string, number>;

          setCitationCounts(prev => {
            const next = { ...prev };
            publications.forEach(pub => {
              const norm = (pub.title || '').toLowerCase().trim();
              const stripped = norm.replace(/[^a-z0-9]/g, '');
              let matchedCount: number | undefined = scholarMap[norm] ?? scholarMap[stripped];

              if (matchedCount === undefined) {
                for (const [key, count] of Object.entries(scholarMap)) {
                  if (key.length > 20 && stripped.length > 20 && (key.includes(stripped) || stripped.includes(key))) {
                    matchedCount = count;
                    break;
                  }
                }
              }

              if (matchedCount !== undefined) {
                next[pub.id] = matchedCount;
              }
            });
            return next;
          });
        }
      } catch (err) {
        console.warn('Could not auto-fetch live Scholar citations on load:', err);
      }
    };

    fetchLiveScholarCitations();
    return () => { isMounted = false; };
  }, [scholarUrl, publications]);

  const visiblePublications = useMemo(() => {
    return publications.filter(p => p.isVisible !== false);
  }, [publications]);

  // Dynamically extract categories from all loaded publications
  const categories = useMemo(() => {
    const set = new Set<string>();
    visiblePublications.forEach(pub => {
      if (pub.category) set.add(pub.category);
      if (pub.statusNote) set.add(pub.statusNote);
    });

    // Sort categories: Journal first, Conference second, others alphabetically
    const sorted = Array.from(set).sort((a, b) => {
      if (a.toLowerCase() === 'journal') return -1;
      if (b.toLowerCase() === 'journal') return 1;
      if (a.toLowerCase() === 'conference') return -1;
      if (b.toLowerCase() === 'conference') return 1;
      return a.localeCompare(b);
    });

    return ['all', ...sorted];
  }, [visiblePublications]);

  // Find the highest publication year across all papers to badge newest items
  const maxYear = useMemo(() => {
    if (visiblePublications.length === 0) return new Date().getFullYear();
    return Math.max(...visiblePublications.map(p => p.year || 0));
  }, [visiblePublications]);

  const filteredAndSortedPubs = useMemo(() => {
    // 1. Filter
    const matched = visiblePublications.filter(pub => {
      const matchesCategory =
        selectedCategory === 'all' ||
        pub.category === selectedCategory ||
        pub.statusNote === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pub.title.toLowerCase().includes(q) ||
        pub.authors.toLowerCase().includes(q) ||
        pub.venue.toLowerCase().includes(q) ||
        (pub.tags && pub.tags.some(t => t.toLowerCase().includes(q))) ||
        (pub.abstract && pub.abstract.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });

    // 2. Sort
    return matched.sort((a, b) => {
      const citationsA = citationCounts[a.id] ?? a.citations ?? 0;
      const citationsB = citationCounts[b.id] ?? b.citations ?? 0;
      const yearA = a.year || 0;
      const yearB = b.year || 0;

      if (sortBy === 'citations') {
        if (citationsB !== citationsA) return citationsB - citationsA;
        return yearB - yearA;
      }

      if (sortBy === 'journal_first') {
        const isJournalA = a.category?.toLowerCase() === 'journal' ? 1 : 0;
        const isJournalB = b.category?.toLowerCase() === 'journal' ? 1 : 0;
        if (isJournalB !== isJournalA) return isJournalB - isJournalA;
        if (yearB !== yearA) return yearB - yearA;
        return citationsB - citationsA;
      }

      if (sortBy === 'oldest') {
        if (yearA !== yearB) return yearA - yearB;
        return (a.title || '').localeCompare(b.title || '');
      }

      // Default: 'latest' (Newest Year First -> Most Cited / Journal priority within same year)
      if (yearB !== yearA) {
        return yearB - yearA;
      }

      // If same year: Journal papers or higher citations go first
      const isJournalA = a.category?.toLowerCase() === 'journal' ? 1 : 0;
      const isJournalB = b.category?.toLowerCase() === 'journal' ? 1 : 0;
      if (isJournalB !== isJournalA) return isJournalB - isJournalA;

      if (citationsB !== citationsA) return citationsB - citationsA;
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [publications, selectedCategory, searchQuery, sortBy, citationCounts]);

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const defaultTitle = "Publications & Research Papers";
  const displayTitle = (!config?.title || config.title.includes("Conference Proceedings") || config.title === "Publications")
    ? defaultTitle
    : config.title;

  return (
    <section className="py-14 sm:py-20 border-t dark:border-slate-800/80 border-slate-200/80" id="publications">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.02 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >

        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3 mb-10 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 font-sans">
            {displayTitle}
          </h2>
          {(config?.subtitle ?? "Scholarly articles published in international journals and conferences covering hybrid microgrid optimization, machine learning diagnostics, solar PV soiling, and battery degradation.") && (
            <p className="text-sm sm:text-base dark:text-slate-300 text-slate-600 font-normal leading-relaxed w-full max-w-none text-justify sm:text-left">
              {config?.subtitle ?? "Scholarly articles published in international journals and conferences covering hybrid microgrid optimization, machine learning diagnostics, solar PV soiling, and battery degradation."}
            </p>
          )}
        </motion.div>

        {/* Filter, Sort & Search Control Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
          className="space-y-4 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${selectedCategory === cat
                      ? 'dark:bg-blue-600 dark:text-white bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                      : 'dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {cat === 'all' ? 'ALL PAPERS' : cat}
                </button>
              ))}

              {scholarUrl && (
                <>
                  <div className="h-4 w-px dark:bg-slate-800 bg-slate-200 mx-1 hidden sm:block"></div>
                  <a
                    href={scholarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30 dark:hover:bg-blue-500/20 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                    title="View Google Scholar Profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Scholar Profile</span>
                  </a>
                </>
              )}
            </div>

            {/* Right controls: Sorting + Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">

              {/* Sort selector */}
              <div className="flex items-center space-x-2 dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 rounded-xl px-3 py-2 shadow-xs text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 dark:text-blue-400 text-blue-600 shrink-0" />
                <span className="font-mono text-[11px] dark:text-slate-400 text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-medium dark:text-slate-200 text-slate-800 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="latest" className="dark:bg-slate-900 bg-white">Latest Work First</option>
                  <option value="citations" className="dark:bg-slate-900 bg-white">Most Cited First</option>
                  <option value="journal_first" className="dark:bg-slate-900 bg-white">Journals First</option>
                  <option value="oldest" className="dark:bg-slate-900 bg-white">Oldest First</option>
                </select>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 dark:text-slate-400 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, author, venue..."
                  className="w-full pl-9 pr-4 py-2 dark:bg-slate-900/90 bg-white/90 backdrop-blur-md border dark:border-slate-800 border-slate-200 rounded-xl text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none dark:focus:border-blue-400 focus:border-blue-500 transition-colors shadow-xs"
                />
              </div>
            </div>

          </div>
        </motion.div>

        {/* Publications List */}
        {filteredAndSortedPubs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl dark:bg-slate-900/40 bg-white/60 backdrop-blur-md border dark:border-slate-800 border-slate-200 space-y-3">
            <BookOpen className="w-8 h-8 dark:text-slate-400 text-slate-400 mx-auto" />
            <p className="text-sm dark:text-slate-300 text-slate-600 font-mono">No publications matched your filter criteria.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="text-xs font-mono dark:text-blue-400 text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedPubs.map((pub, idx) => {
              const isExpanded = !!expandedAbstracts[pub.id];
              const displayCitations = citationCounts[pub.id] !== undefined ? citationCounts[pub.id] : pub.citations;
              const isLatestYear = pub.year === maxYear;
              const isTopFeatured = idx === 0 && (pub.featured || isLatestYear);

              return (
                <motion.div
                  key={pub.id}
                  id={`pub-card-${pub.id}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.22, 1, 0.36, 1],
                    delay: Math.min((idx % 3) * 0.05, 0.15)
                  }}
                  whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2, ease: "easeOut" } }}
                  className={`p-5 sm:p-6 rounded-2xl backdrop-blur-xl border transition-[border-color,background-color,box-shadow] duration-200 space-y-3.5 group shadow-sm hover:shadow-xl cursor-default ${isTopFeatured
                      ? 'dark:bg-gradient-to-r dark:from-[#0f172a] dark:via-blue-950/20 dark:to-[#0f172a] bg-gradient-to-r from-white via-blue-50/25 to-white dark:border-blue-400/40 border-blue-300 ring-1 dark:ring-blue-400/20 ring-blue-500/20'
                      : 'dark:bg-[#0c131d]/90 bg-white/90 dark:border-slate-800/80 border-slate-200/80 dark:hover:border-blue-400/40 hover:border-blue-300'
                    }`}
                >
                  {/* Top Bar: Venue & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">

                      {/* Latest Work / Featured Highlight Badge */}
                      {isTopFeatured && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider dark:bg-blue-600 dark:text-white bg-blue-600 text-white shadow-sm">
                          <Sparkles className="w-3 h-3 text-white animate-pulse" />
                          <span>Latest Highlight</span>
                        </span>
                      )}

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${pub.category === 'Journal'
                          ? 'dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/30 bg-blue-50 text-blue-700 border-blue-200'
                          : pub.category === 'Under Review' || pub.statusNote === 'Under Review'
                            ? 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 bg-slate-100 text-slate-700 border-slate-200'
                            : pub.category === 'Conference'
                              ? 'dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 bg-slate-100 text-slate-700 border-slate-200'
                              : 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                        {pub.statusNote || pub.category}
                      </span>

                      <span className="text-xs font-mono font-bold dark:text-slate-300 text-slate-700 dark:bg-slate-800/80 bg-slate-100 px-2 py-0.5 rounded-lg border dark:border-slate-700 border-slate-200">
                        {pub.year}
                      </span>
                    </div>

                    {displayCitations !== undefined && displayCitations > 0 && (
                      <span className="text-[11px] font-mono dark:text-blue-300 text-blue-700 dark:bg-blue-400/10 bg-blue-50 px-2.5 py-0.5 rounded-full border dark:border-blue-400/30 border-blue-200 font-semibold shadow-xs">
                        {displayCitations} Citations
                      </span>
                    )}
                  </div>

                  {/* Paper Title */}
                  <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900 dark:group-hover:text-blue-300 group-hover:text-blue-600 transition-colors leading-snug">
                    {pub.link ? (
                      <a href={pub.link} target="_blank" rel="noreferrer" className="hover:underline">
                        {pub.title}
                      </a>
                    ) : (
                      pub.title
                    )}
                  </h3>

                  {/* Authors & Venue */}
                  <div className="space-y-1 text-xs">
                    <p className="dark:text-slate-300 text-slate-600 font-normal">
                      <span className="dark:text-slate-400 text-slate-500 font-mono">Authors: </span>
                      {pub.authors}
                    </p>
                    <p className="font-mono dark:text-blue-400 text-blue-600 font-medium">
                      {pub.venue}
                    </p>
                  </div>

                  {/* Tags */}
                  {pub.tags && pub.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pub.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expandable Abstract */}
                  {isExpanded && pub.abstract && (
                    <div className="mt-3 p-4 rounded-xl dark:bg-slate-900/90 bg-slate-50/90 backdrop-blur-md border dark:border-slate-800 border-slate-200 text-xs dark:text-slate-300 text-slate-700 font-normal leading-relaxed space-y-1 shadow-inner">
                      <span className="text-[11px] font-mono dark:text-blue-400 text-blue-600 uppercase font-semibold block">
                        Abstract
                      </span>
                      <p>{pub.abstract}</p>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="pt-3 border-t dark:border-slate-800/80 border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    {pub.abstract ? (
                      <button
                        onClick={() => toggleAbstract(pub.id)}
                        className="inline-flex items-center space-x-1 dark:text-slate-400 text-slate-600 dark:hover:text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Hide Abstract</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>View Abstract</span>
                          </>
                        )}
                      </button>
                    ) : <div />}

                    <div className="flex items-center space-x-3 relative cite-dropdown-container">
                      <button
                        onClick={() => setActiveCitationDropdown(activeCitationDropdown === pub.id ? null : pub.id)}
                        className="inline-flex items-center space-x-1 dark:text-blue-400 text-blue-600 hover:underline cursor-pointer font-medium"
                      >
                        <Quote className="w-3.5 h-3.5" />
                        <span>Cite</span>
                      </button>

                      {activeCitationDropdown === pub.id && (
                        <div className="absolute bottom-full right-0 mb-2 w-64 dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-200 shadow-2xl rounded-2xl py-2 z-50 overflow-hidden text-xs divide-y divide-slate-100 dark:divide-slate-800">
                          <div className="py-1">
                            <button
                              onClick={() => copyBibTeX(pub)}
                              className="w-full text-left px-4 py-2 dark:hover:bg-slate-800 hover:bg-slate-50 dark:text-slate-200 text-slate-700 flex items-center justify-between cursor-pointer"
                            >
                              <span className="font-semibold">Copy BibTeX Citation</span>
                              <Copy className="w-3.5 h-3.5 text-blue-500" />
                            </button>
                            <button
                              onClick={() => copyAPA(pub)}
                              className="w-full text-left px-4 py-2 dark:hover:bg-slate-800 hover:bg-slate-50 dark:text-slate-200 text-slate-700 flex items-center justify-between cursor-pointer"
                            >
                              <span className="font-semibold">Copy APA Citation</span>
                              <Copy className="w-3.5 h-3.5 text-blue-500" />
                            </button>
                          </div>
                          <div className="py-1">
                            <button
                              onClick={() => handleDownload('BibTeX', pub)}
                              className="w-full text-left px-4 py-1.5 dark:hover:bg-slate-800 hover:bg-slate-50 dark:text-slate-400 text-slate-600 flex items-center space-x-2 text-[11px] cursor-pointer"
                            >
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                              <span>Download .bib File</span>
                            </button>
                            <button
                              onClick={() => handleDownload('RefMan', pub)}
                              className="w-full text-left px-4 py-1.5 dark:hover:bg-slate-800 hover:bg-slate-50 dark:text-slate-400 text-slate-600 flex items-center space-x-2 text-[11px] cursor-pointer"
                            >
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                              <span>Download RIS (EndNote)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {pub.doi && (
                        <a
                          href={`https://doi.org/${pub.doi.replace('https://doi.org/', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 dark:text-slate-300 text-slate-700 dark:hover:text-blue-400 hover:text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5 dark:text-blue-400 text-blue-600" />
                          <span>DOI</span>
                        </a>
                      )}

                      {pub.pdfUrl && (
                        <a
                          href={pub.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 dark:text-slate-300 text-slate-700 dark:hover:text-blue-400 hover:text-blue-600 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5 dark:text-blue-400 text-blue-600" />
                          <span>PDF</span>
                        </a>
                      )}
                    </div>
                  </div>

                </motion.div>
              );
            })}

            {/* Ongoing research note */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="p-4 rounded-xl dark:bg-blue-950/40 dark:border-blue-800/40 bg-blue-50/80 border border-blue-200/80 flex items-center space-x-3 text-xs font-mono dark:text-blue-300 text-blue-900 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full dark:bg-blue-400 bg-blue-600 animate-pulse" />
              <span>Additionally, multiple research investigations are ongoing and preparing for publication submission.</span>
            </motion.div>
          </div>
        )}

      </motion.div>
    </section>
  );
};

