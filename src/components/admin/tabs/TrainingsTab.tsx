import { SectionHeadingEditor } from '../SectionHeadingEditor';
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Award, Plus, Edit3, Trash2, X, ExternalLink } from 'lucide-react';
import { Training } from '../../../types';
import { createTrainingAPI, updateTrainingAPI, deleteTrainingAPI, reorderTrainingsAPI } from '../../../api';

interface TrainingsTabProps {
  data?: any;
  trainings?: Training[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TrainingsTab: React.FC<TrainingsTabProps> = ({ data, trainings = [],
  onRefresh,
  showToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Training, 'id'>>({
    title: '',
    issuer: '',
    year: '',
    credentialUrl: '',
    skillsAcquired: [],
    description: '',
    isLive: true
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(false);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;
    const newItems = Array.from(trainings);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);
    try {
      setLoading(true);
      await reorderTrainingsAPI(newItems.map(item => item.id));
      showToast('Reordered successfully');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      issuer: '',
      year: new Date().getFullYear().toString(),
      credentialUrl: '',
      skillsAcquired: [],
      description: '',
      isLive: true
    });
    setSkillsInput('');
    setIsModalOpen(true);
  };

  const openEdit = (tr: Training) => {
    setEditingId(tr.id);
    setFormData({
      title: tr.title,
      issuer: tr.issuer,
      year: tr.year,
      credentialUrl: tr.credentialUrl || '',
      skillsAcquired: tr.skillsAcquired || [],
      description: tr.description || '',
      galleryUrls: tr.galleryUrls || [],
      tickerSpeed: tr.tickerSpeed,
      isLive: tr.isLive ?? true
    });
    setSkillsInput((tr.skillsAcquired || []).join(', '));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      setLoading(true);
      await deleteTrainingAPI(id);
      showToast('Training certification deleted successfully');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete training', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.issuer || !formData.year) {
      showToast('Title, issuer, and year are required.', 'error');
      return;
    }
    const payload: Omit<Training, 'id'> = {
      ...formData,
      skillsAcquired: skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    };
    try {
      setLoading(true);
      if (editingId) {
        await updateTrainingAPI(editingId, payload);
        showToast('Training certification updated successfully');
      } else {
        await createTrainingAPI(payload);
        showToast('Training certification added successfully');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save training', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-trainings-tab">
      <SectionHeadingEditor sectionKey="trainings" data={data} onRefresh={onRefresh} showToast={showToast} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span>Professional Training & Seminars</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your completed courses, workshops, and field visits.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Training</span>
        </button>
      </div>
<DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="trainings-list">
          {(provided) => (
            <div className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
              {trainings.map((tr, index) => (
                // @ts-ignore
                <Draggable key={tr.id} draggableId={tr.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm flex flex-col justify-between"
                    >
                      <div className="flex items-start space-x-3">
                        <div {...provided.dragHandleProps} className="pt-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="space-y-2.5 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white">
                                  {tr.title}
                                </h3>
                                {tr.isLive === false && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-slate-700 text-slate-300">Offline</span>
                                )}
                              </div>
                              <p className="text-xs font-mono text-indigo-400">
                                {tr.issuer}
                              </p>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <button
                                onClick={() => openEdit(tr)}
                                className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(tr.id, tr.title)}
                                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {tr.description && (
                            <p className="text-xs text-slate-300 line-clamp-3">
                              {tr.description}
                            </p>
                          )}
                          {tr.skillsAcquired && tr.skillsAcquired.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {tr.skillsAcquired.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {tr.credentialUrl && (
                            <div className="mt-3 pt-2 border-t border-slate-700">
                              <a
                                href={tr.credentialUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 text-[11px] font-mono text-indigo-400 hover:underline"
                              >
                                <span>Verification Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Training Certification' : 'Add Training Certification'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">


              <div>
                <label className="text-xs font-semibold text-slate-300">Course / Certification Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Advanced Microgrid Sizing with HOMER Pro"
                  className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Issuer / Organization *</label>
                  <input
                    type="text"
                    required
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="e.g. HOMER Energy by UL"
                    className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Year / Period *</label>
                  <input
                    type="text"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="e.g. 2023"
                    className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Credential / Verification URL</label>
                <input
                  type="url"
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Key Skills Acquired (comma-separated)</label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="HOMER Pro, LCOE Optimization, Battery Life Modeling"
                  className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Gallery Image URLs (One URL per line - for Modal Carousel)</label>
                <textarea
                  rows={2}
                  value={(formData.galleryUrls || []).join('\n')}
                  onChange={(e) => setFormData({ ...formData, galleryUrls: e.target.value.split('\n').map(u => u.trim()).filter(Boolean) })}
                  placeholder="https://example.com/image1.jpg\nhttps://example.com/image2.jpg"
                  className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of skills and topics covered..."
                  className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Crawler Speed (seconds)</label>
                <input
                  type="number"
                  value={formData.tickerSpeed || ''}
                  onChange={(e) => setFormData({ ...formData, tickerSpeed: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  placeholder="15"
                  className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl"
                />
                <p className="text-[10px] text-slate-500 mt-1">Leave blank for default (15 seconds). Higher number = slower.</p>
              </div>
              
              

              <div className="flex items-center gap-2 pt-2"><input id="training-live" type="checkbox" checked={formData.isLive !== false} onChange={event => setFormData({ ...formData, isLive: event.target.checked })} className="w-4 h-4 rounded border-slate-600 text-indigo-600" /><label htmlFor="training-live" className="text-xs font-semibold text-slate-200">Show on public portfolio</label></div>
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Certificate' : 'Save Certificate'}
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
            <h3 className="text-base font-bold text-white">Delete Record?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
