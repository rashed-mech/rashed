import React, { useState } from 'react';
import { Pencil, Trash2, Plus, X, Image as ImageIcon, Link as LinkIcon, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Certification, CertificateModule } from '../../../types';
import { createCertificationAPI, updateCertificationAPI, deleteCertificationAPI, reorderCertificationsAPI } from '../../../api';
import { formatImageUrl } from '../../../utils/formatUrl';

interface CertificationsTabProps {
  certifications?: Certification[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CertificationsTab: React.FC<CertificationsTabProps> = ({ 
  certifications = [], 
  onRefresh, 
  showToast 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Local state for optimistic drag and drop updates
  const [localCerts, setLocalCerts] = useState<Certification[]>(certifications);

  // Sync local state when props change
  React.useEffect(() => {
    setLocalCerts(certifications);
  }, [certifications]);

  const [formData, setFormData] = useState<{
    title: string;
    issuer: string;
    year: string;
    description: string;
    credentialUrl: string;
    imageUrl: string;
    modules: CertificateModule[];
  }>({
    title: '',
    issuer: '',
    year: '',
    description: '',
    credentialUrl: '',
    imageUrl: '',
    modules: []
  });

  const resetForm = () => {
    setFormData({
      title: '',
      issuer: '',
      year: '',
      description: '',
      credentialUrl: '',
      imageUrl: '',
      modules: []
    });
    setEditingId(null);
  };

  const handleEdit = (cert: Certification) => {
    setFormData({
      title: cert.title,
      issuer: cert.issuer,
      year: cert.year,
      description: cert.description || '',
      credentialUrl: cert.credentialUrl || '',
      imageUrl: cert.imageUrl || '',
      modules: cert.modules ? [...cert.modules] : []
    });
    setEditingId(cert.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };
  
  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      setLoading(true);
      await deleteCertificationAPI(id);
      showToast('Certification record deleted');
      onRefresh();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.issuer || !formData.year) {
      showToast('Title, issuer, and year are required.', 'error');
      return;
    }

    const payload: Omit<Certification, 'id'> = {
      ...formData
    };

    try {
      setLoading(true);
      if (editingId) {
        await updateCertificationAPI(editingId, payload);
        showToast('Certification updated successfully');
      } else {
        await createCertificationAPI(payload);
        showToast('New certification added');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, { title: '', imageUrl: '', credentialUrl: '' }]
    }));
  };

  const updateModule = (index: number, field: keyof CertificateModule, value: string) => {
    const newModules = [...formData.modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  const removeModule = (index: number) => {
    const newModules = [...formData.modules];
    newModules.splice(index, 1);
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const newItems = [...localCerts];
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);
    
    // Optimistic update
    setLocalCerts(newItems);
    
    const orderedIds = newItems.map(c => c.id);
    
    try {
      await reorderCertificationsAPI(orderedIds);
      onRefresh(); // Fetch latest from server just in case
    } catch (err: any) {
      // Revert on error
      setLocalCerts(certifications);
      showToast(err.message || 'Failed to reorder', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-400">Manage professional certification credentials, software certifications, and specialized programs. Drag to reorder.</h3>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Certification
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="certifications-list">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="grid grid-cols-1 gap-4"
            >
              {localCerts.map((cert, index) => {
                return (
                  // @ts-ignore
                  <Draggable key={cert.id} draggableId={cert.id} index={index}>
                    {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-5 rounded-2xl bg-slate-800 border ${snapshot.isDragging ? 'border-indigo-500 shadow-xl shadow-indigo-900/20 z-10' : 'border-slate-700'} flex flex-col justify-between group transition-colors`}
                    >
                      <div className="flex items-start">
                        <div 
                          {...provided.dragHandleProps}
                          className="mr-3 mt-0.5 p-1.5 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-700/50 transition-colors"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-900/30 text-white ">
                              {cert.year}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleEdit(cert)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 rounded-lg transition-colors">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(cert.id)} disabled={loading} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-white">{cert.title}</h4>
                          <div className="text-xs font-mono text-slate-400">{cert.issuer}</div>
                          {cert.modules && cert.modules.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-700">
                              {cert.modules.map((m, mIdx) => (
                                <span key={mIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                                  {m.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
                );
              })}
              {provided.placeholder}
              {localCerts.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 text-sm border-2 border-dashed border-slate-700 rounded-2xl">
                  No certification records found.
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Certification' : 'Add Certification'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              
              <div>
                <label className="text-xs font-semibold text-slate-300">Course / Certification Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Advanced Microgrid Sizing"
                  className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Certificate Image URL (Google Drive / Direct link)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://... (Image or Google Drive link)"
                  className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                {formData.imageUrl && (
                  <div className="mt-2 p-1.5 bg-slate-900/90 border border-slate-700 rounded-xl flex items-center gap-3">
                    <img 
                      src={formatImageUrl(formData.imageUrl, { size: 200 })} 
                      alt="Certificate Preview" 
                      className="w-16 h-12 object-contain rounded-lg bg-black/40 border border-slate-800"
                    />
                    <span className="text-[11px] text-slate-400 font-mono">Live CDN Preview</span>
                  </div>
                )}
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
                    className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                    className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                  className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              
              {/* Modules / Sub-Certificates Section */}
              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-slate-300">Sub-Certificates / Modules</label>
                  <button 
                    onClick={addModule}
                    className="flex items-center text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Sub-Certificate
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.modules.map((mod, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 relative group">
                      
                      <button 
                        onClick={() => removeModule(idx)}
                        className="absolute -top-2 -right-2 p-1 bg-red-950/80 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => updateModule(idx, 'title', e.target.value)}
                          placeholder={`Sub-certificate ${idx + 1} Title`}
                          className="w-full px-3 py-2 text-xs font-bold text-white bg-slate-800 border border-slate-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <ImageIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="url"
                              value={mod.imageUrl || ''}
                              onChange={(e) => updateModule(idx, 'imageUrl', e.target.value)}
                              placeholder="Image URL"
                              className="w-full pl-8 pr-3 py-1.5 text-xs text-white bg-slate-800 border border-slate-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                          <div className="relative">
                            <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="url"
                              value={mod.credentialUrl || ''}
                              onChange={(e) => updateModule(idx, 'credentialUrl', e.target.value)}
                              placeholder="Verification URL"
                              className="w-full pl-8 pr-3 py-1.5 text-xs text-white bg-slate-800 border border-slate-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.modules.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-slate-700 rounded-xl">
                      No sub-certificates added.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary..."
                  className="w-full mt-1 px-3 py-2 text-xs text-white bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

            </div>
            
            <div className="flex items-center justify-end space-x-2 pt-4 mt-2 border-t border-slate-700 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white :text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : editingId ? 'Update Certificate' : 'Save Certificate'}
              </button>
            </div>
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
