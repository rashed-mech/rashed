import { SectionHeadingEditor } from '../SectionHeadingEditor';
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  ExternalLink, 
  Award,
  AlertCircle,
  FileText,
  Quote,
  Sparkles,
  Download
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { getPublicationStatus, getPublicationType, PUBLICATION_STATUSES } from '../../../utils/publicationStatus';
import { Publication, Profile } from '../../../types';
import { createPublicationAPI, updatePublicationAPI, deletePublicationAPI, reorderPublicationsAPI } from '../../../api';
import { AutoImportPublicationsModal } from './AutoImportPublicationsModal';

interface PublicationsTabProps {
  data?: any;
  publications: Publication[];
  profile?: Profile;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const EMPTY_PUB: Omit<Publication, 'id'> = {
  title: '',
  authors: '',
  venue: '',
  year: new Date().getFullYear(),
  category: 'Journal',
  publicationStatus: 'Submitted',
  doi: '',
  link: '',
  pdfUrl: '',
  abstract: '',
  citations: 0,
  featured: false,
  isVisible: true,
  tags: [],
  bibtex: ''
};

export const PublicationsTab: React.FC<PublicationsTabProps> = ({ data, publications, profile, onRefresh, showToast }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [localPublications, setLocalPublications] = useState(publications);
  const [savingOrder, setSavingOrder] = useState(false);
  useEffect(() => setLocalPublications(publications), [publications]);
  const canReorder = !search.trim() && categoryFilter === 'All' && statusFilter === 'All' && !savingOrder;
  const handleDragEnd = async (result: DropResult) => {
    if (!canReorder || !result.destination || result.source.index === result.destination.index) return;
    const next = [...localPublications];
    const [paper] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, paper);
    setLocalPublications(next);
    setSavingOrder(true);
    try {
      await reorderPublicationsAPI(next.map(paper => paper.id));
      showToast('Publication order saved.');
      onRefresh();
    } catch (error: any) {
      setLocalPublications(publications);
      showToast(error.message || 'Failed to save order', 'error');
    } finally { setSavingOrder(false); }
  };
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoImportOpen, setIsAutoImportOpen] = useState(false);
  const [editingPubId, setEditingPubId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Publication, 'id'>>(EMPTY_PUB);
  const [tagsInput, setTagsInput] = useState('');
  const [geminiJson, setGeminiJson] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJsonPaste = (val: string) => {
    setGeminiJson(val);
    try {
      const parsed = JSON.parse(val);
      if (parsed.purpose || parsed.key_findings || parsed.methods_used || parsed.title) {
        setFormData(prev => ({
           ...prev,
           title: parsed.title || prev.title,
           purpose: parsed.purpose || prev.purpose,
           key_findings: parsed.key_findings || prev.key_findings,
           methods_used: parsed.methods_used || prev.methods_used,
        }));
        showToast('JSON successfully parsed into fields!', 'success');
      }
    } catch(err) {
      // Not valid JSON yet, ignore silently
    }
  };
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());


  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredIds = filtered.map(p => p.id);
      setSelectedIds(new Set(allFilteredIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const executeBulkDelete = async () => {
    setShowBulkDeleteConfirm(false);
    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    for (const id of Array.from<string>(selectedIds)) {
      try {
        await deletePublicationAPI(id);
        successCount++;
      } catch (e) {
        failCount++;
      }
    }
    
    if (successCount > 0) {
      showToast(`Successfully deleted ${successCount} publication(s)`, 'success');
      onRefresh();
      setSelectedIds(new Set());
    }
    if (failCount > 0) {
      showToast(`Failed to delete ${failCount} publication(s)`, 'error');
    }
    
    setLoading(false);
  };

  const filtered = localPublications
    .filter(pub => {
      const matchCat = categoryFilter === 'All' || getPublicationType(pub) === categoryFilter;
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        pub.title.toLowerCase().includes(q) ||
        pub.authors.toLowerCase().includes(q) ||
        pub.venue.toLowerCase().includes(q);
      return matchCat && matchSearch && (statusFilter === 'All' || getPublicationStatus(pub) === statusFilter);
    });

  const openCreateModal = () => {
    setEditingPubId(null);
    setFormData(EMPTY_PUB);
    setTagsInput('');
    setGeminiJson('');
    setIsModalOpen(true);
  };

  const openEditModal = (pub: Publication) => {
    setEditingPubId(pub.id);
    setFormData({
      title: pub.title,
      authors: pub.authors,
      venue: pub.venue,
      year: pub.year,
      category: getPublicationType(pub),
      publicationStatus: getPublicationStatus(pub),
      doi: pub.doi || '',
      link: pub.link || '',
      pdfUrl: pub.pdfUrl || '',
      abstract: pub.abstract || '',
      citations: pub.citations || 0,
      featured: !!pub.featured,
      isVisible: pub.isVisible !== false,
      tags: pub.tags || [],
      bibtex: pub.bibtex || '',
      purpose: pub.purpose || '',
      key_findings: pub.key_findings || [],
      methods_used: pub.methods_used || []
    });
    setTagsInput((pub.tags || []).join(', '));
    setGeminiJson(JSON.stringify({
      purpose: pub.purpose,
      key_findings: pub.key_findings,
      methods_used: pub.methods_used
    }, null, 2));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.authors || (formData.publicationStatus === 'Published' && !formData.venue) || !formData.year) {
      showToast('Please fill in title, authors and year. Published papers also need a venue.', 'error');
      return;
    }

    setLoading(true);
    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      ...formData,
      statusNote: formData.publicationStatus === 'Published' ? '' : formData.publicationStatus,
      tags: parsedTags,
      year: Number(formData.year),
      citations: Number(formData.citations) || 0
    };

    try {
      if (editingPubId) {
        await updatePublicationAPI(editingPubId, payload);
        showToast('Publication updated successfully!');
      } else {
        await createPublicationAPI(payload);
        showToast('New publication added successfully!');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePublicationAPI(id);
      showToast('Publication deleted.');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-publications-tab">
      <SectionHeadingEditor sectionKey="publications" data={data} onRefresh={onRefresh} showToast={showToast} />
      
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Manage Publications & Articles</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {publications.length} records in database. Create, auto-import from Google Scholar / BibTeX, or edit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAutoImportOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-indigo-100 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 shadow-lg shadow-indigo-950/50 transition-all cursor-pointer group"
            id="auto-import-pub-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Auto-Import & Scholar Sync</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            id="add-pub-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Add</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 pl-1 pr-2">
          <input 
            type="checkbox"
            checked={filtered.length > 0 && selectedIds.size === filtered.length}
            onChange={handleToggleSelectAll}
            className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
            title="Select All"
          />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search publications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="py-2 px-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Journal">Journal Paper</option>
          <option value="Conference">Conference Paper</option>
          <option value="Review">Review Paper</option>
          <option value="Preprint">Preprint</option>
          <option value="Book Chapter">Book Chapter</option>
          <option value="Workshop">Workshop</option>
        </select>
        
        <select aria-label="Filter publication status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="py-2 px-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white">
          <option value="All">All Status</option>
          {PUBLICATION_STATUSES.map(status => <option key={status}>{status}</option>)}
        </select>
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl whitespace-nowrap transition-colors"
          >
            Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400">Drag the grip to set website and CV order. Clear filters to reorder. {savingOrder ? 'Saving order...' : ''}</p>
      <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="publications">
      {provided => <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-800/50 border border-slate-700 text-slate-400 text-xs">
            No publications found matching your criteria.
          </div>
        ) : (
          filtered.map((pub, index) => (
            <Draggable key={pub.id} draggableId={pub.id} index={index} isDragDisabled={!canReorder}>
            {provided => <div
              ref={provided.innerRef} {...provided.draggableProps}
              className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              id={`admin-pub-row-${pub.id}`}
            >
              <button type="button" {...provided.dragHandleProps} aria-label={`Reorder ${pub.title}`} title={canReorder ? 'Drag to reorder' : 'Clear filters to reorder'} className="text-slate-400 cursor-grab disabled:opacity-40" disabled={!canReorder}><GripVertical className="w-5 h-5" /></button>
              <div className="flex items-start md:items-center pt-1 md:pt-0 pl-1">
                <input
                  type="checkbox"
                  checked={selectedIds.has(pub.id)}
                  onChange={(e) => handleToggleSelect(pub.id, e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold text-[11px]">
                    {getPublicationType(pub)}
                  </span>
                  <span className="text-slate-400 font-semibold">{pub.year}</span>
                  <span className="text-xs text-cyan-300">{getPublicationStatus(pub)}</span>
                  {pub.featured && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-semibold text-[11px] flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" /> Featured
                    </span>
                  )}
                  {pub.isVisible === false && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold text-[11px] flex items-center gap-1 border border-slate-700">
                      Hidden
                    </span>
                  )}
                  {pub.citations !== undefined && pub.citations > 0 && (
                    <span className="text-emerald-400 text-[11px] font-semibold">
                      • {pub.citations} Citations
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {pub.title}
                </h3>

                <p className="text-xs text-slate-400">
                  <span className="text-slate-300">Authors:</span> {pub.authors}
                </p>
                <p className="text-xs text-indigo-400 italic">
                  {pub.venue}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700">
                <button
                  onClick={() => openEditModal(pub)}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Edit Publication"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(pub.id)}
                  className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/60 transition-colors"
                  title="Delete Publication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>}
            </Draggable>
          ))
        )}
        {provided.placeholder}
      </div>}
      </Droppable>
      </DragDropContext>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">
                {editingPubId ? 'Edit Publication Details' : 'Add New Academic Publication'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">


              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Publication Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Deep Transfer Learning for..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Authors <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    placeholder="e.g. Md. Rashedul Islam, A. Rahman"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Paper Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="Journal">Journal Paper</option>
                    <option value="Conference">Conference Paper</option>
          <option value="Review">Review Paper</option>
                    <option value="Preprint">Preprint</option>
                    <option value="Book Chapter">Book Chapter</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="publication-status" className="block text-xs font-semibold text-slate-300 mb-1">Publication Status</label>
                <select id="publication-status" value={formData.publicationStatus} onChange={e => setFormData({...formData, publicationStatus: e.target.value as Publication['publicationStatus']})} className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white">
                  {PUBLICATION_STATUSES.map(status => <option key={status}>{status}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-2">Add submitted and under-review papers manually. Published papers sync from your configured Google Scholar profile; manual details and ordering are preserved.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Venue (Journal / Conference Name) {formData.publicationStatus === 'Published' ? <span className="text-red-400">*</span> : '(optional until published)'}
                  </label>
                  <input
                    type="text"
                    required={formData.publicationStatus === 'Published'}
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. IEEE Transactions on Medical Robotics"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Year <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    DOI (Digital Object Identifier)
                  </label>
                  <input
                    type="text"
                    value={formData.doi || ''}
                    onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                    placeholder="10.1109/..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Publisher / Paper URL
                  </label>
                  <input
                    type="text"
                    value={formData.link || ''}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Citations Count
                  </label>
                  <input
                    type="number"
                    value={formData.citations || 0}
                    onChange={(e) => setFormData({ ...formData, citations: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Abstract Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="Summary of research methodology and findings..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30 resize-y"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-indigo-400">
                    Gemini Extraction JSON (Optional for Telemetry)
                  </label>
                  <span className="text-[10px] text-slate-500">Paste JSON to auto-fill purpose and key findings</span>
                </div>
                <textarea
                  rows={4}
                  value={geminiJson}
                  onChange={(e) => handleJsonPaste(e.target.value)}
                  placeholder={`{
  "purpose": "...",
  "key_findings": [...]
}`}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-950 border border-indigo-900/50 rounded-xl text-indigo-200 focus:ring-2 focus:ring-indigo-500/30 resize-y"
                />
                
                
                
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keywords / Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Deep Learning, Medical Imaging, Transformers"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom BibTeX Entry (optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.bibtex || ''}
                  onChange={(e) => setFormData({ ...formData, bibtex: e.target.value })}
                  placeholder="@article{...}"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-indigo-300 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured-pub-checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="featured-pub-checkbox" className="text-xs font-semibold text-slate-300">
                    Feature this publication on homepage
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="visible-pub-checkbox" checked={formData.isVisible !== false} onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700" />
                  <label htmlFor="visible-pub-checkbox" className="text-xs font-semibold text-slate-300">Show on public portfolio</label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md transition-all cursor-pointer"
                >
                  {loading ? 'Saving...' : editingPubId ? 'Update Publication' : 'Add Publication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Delete Publication?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this publication record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Delete Multiple Publications?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete {selectedIds.size} publications? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={executeBulkDelete}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Import & Scholar Sync Modal */}
      <AutoImportPublicationsModal
        isOpen={isAutoImportOpen}
        onClose={() => setIsAutoImportOpen(false)}
        profile={profile}
        onSuccess={() => {
          onRefresh();
        }}
        showToast={showToast}
      />

    </div>
  );
};
