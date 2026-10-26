import { SectionHeadingEditor } from '../SectionHeadingEditor';
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Briefcase, GraduationCap, Plus, Edit3, Trash2, X, GripVertical } from 'lucide-react';
import { Experience, Education } from '../../../types';
import { 
  createExperienceAPI, updateExperienceAPI, deleteExperienceAPI, reorderExperiencesAPI,
  createEducationAPI, updateEducationAPI, deleteEducationAPI, reorderEducationsAPI
} from '../../../api';

interface TimelineTabProps {
  data?: any;
  experience?: Experience[];
  education?: Education[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ data, experience = [],
  education = [],
  onRefresh,
  showToast
}) => {
  const [subTab, setSubTab] = useState<'experience' | 'education'>('experience');

  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [loadingExp, setLoadingExp] = useState(false);
  const [loadingEdu, setLoadingEdu] = useState(false);

  const [expFormData, setExpFormData] = useState<Omit<Experience, 'id'>>({
    role: '', organization: '', location: '', period: '', description: '', highlights: [], current: false, employmentType: '', supervisors: '', paperLink: '', department: ''
  });
  const [highlightsInput, setHighlightsInput] = useState('');

  const [eduFormData, setEduFormData] = useState<Omit<Education, 'id'>>({
    degree: '', institution: '', year: '', result: '', thesis: '', advisor: '', department: '', location: '', coursework: '', synopsis: ''
  });

  const onDragEndExp = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newItems = Array.from(experience);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);
    try {
      setLoadingExp(true);
      await reorderExperiencesAPI(newItems.map(item => item.id));
      showToast('Reordered successfully');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder', 'error');
    } finally {
      setLoadingExp(false);
    }
  };

  const onDragEndEdu = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newItems = Array.from(education);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);
    try {
      setLoadingEdu(true);
      await reorderEducationsAPI(newItems.map(item => item.id));
      showToast('Reordered successfully');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder', 'error');
    } finally {
      setLoadingEdu(false);
    }
  };

  const openExpCreate = () => {
    setEditingExpId(null);
    setExpFormData({ role: '', organization: '', location: '', period: '', description: '', highlights: [], current: false, employmentType: '', supervisors: '', paperLink: '', department: '' });
    setHighlightsInput('');
    setIsExpModalOpen(true);
  };
  const openExpEdit = (exp: Experience) => {
    setEditingExpId(exp.id);
    setExpFormData({
      role: exp.role, organization: exp.organization, location: exp.location, period: exp.period,
      description: exp.description || '', highlights: exp.highlights || [], current: exp.current || false,
      employmentType: exp.employmentType || '', supervisors: exp.supervisors || '', paperLink: exp.paperLink || '', department: exp.department || ''
    });
    setHighlightsInput((exp.highlights || []).join('\n'));
    setIsExpModalOpen(true);
  };
  const handleExpDelete = async (id: string) => {
    try {
      await deleteExperienceAPI(id);
      showToast('Experience deleted');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };
  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedHighlights = highlightsInput.split('\n').map(h => h.trim()).filter(Boolean);
    const payload = { ...expFormData, highlights: parsedHighlights };
    try {
      setLoadingExp(true);
      if (editingExpId) {
        await updateExperienceAPI(editingExpId, payload);
        showToast('Experience updated');
      } else {
        await createExperienceAPI(payload);
        showToast('Experience created');
      }
      setIsExpModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setLoadingExp(false);
    }
  };

  const openEduCreate = () => {
    setEditingEduId(null);
    setEduFormData({ degree: '', institution: '', year: '', result: '', thesis: '', advisor: '', department: '', location: '', coursework: '', synopsis: '' });
    setIsEduModalOpen(true);
  };
  const openEduEdit = (edu: Education) => {
    setEditingEduId(edu.id);
    setEduFormData({
      degree: edu.degree, institution: edu.institution, year: edu.year,
      result: edu.result || '', thesis: edu.thesis || '', advisor: edu.advisor || '', department: edu.department || '', location: edu.location || '', coursework: edu.coursework || '', synopsis: edu.synopsis || ''
    });
    setIsEduModalOpen(true);
  };
  const handleEduDelete = async (id: string) => {
    try {
      await deleteEducationAPI(id);
      showToast('Education deleted');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };
  const handleEduSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingEdu(true);
      if (editingEduId) {
        await updateEducationAPI(editingEduId, eduFormData);
        showToast('Education updated');
      } else {
        await createEducationAPI(eduFormData);
        showToast('Education added');
      }
      setIsEduModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setLoadingEdu(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-timeline-tab">
      <SectionHeadingEditor sectionKey="experience" data={data} onRefresh={onRefresh} showToast={showToast} />
      <div className="flex space-x-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setSubTab('experience')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all \${subTab === 'experience' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Professional Experience
        </button>
        <button
          onClick={() => setSubTab('education')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all \${subTab === 'education' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Education Background
        </button>
      </div>

      {subTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>Experience</span>
            </h2>
            <button
              onClick={openExpCreate}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
            >
              <Plus className="w-3 h-3" />
              <span>Add Role</span>
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEndExp}>
            <Droppable droppableId="exp-list">
              {(provided) => (
                <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                  {experience.map((exp, index) => (
                    // @ts-ignore
                    <Draggable key={exp.id} draggableId={exp.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex flex-col justify-between group"
                        >
                          <div className="flex items-start space-x-3">
                            <div {...provided.dragHandleProps} className="pt-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    {exp.role}
                                    {exp.current && <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 uppercase">Current</span>}
                                  </h3>
                                  <p className="text-xs text-indigo-400">{exp.organization}</p>
                                  <p className="text-xs text-slate-400">{exp.period} | {exp.location}</p>
                                </div>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openExpEdit(exp)} className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"><Edit3 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleExpDelete(exp.id)} className="p-1.5 rounded bg-red-900 hover:bg-red-800 text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
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
        </div>
      )}

      {subTab === 'education' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <span>Education</span>
            </h2>
            <button
              onClick={openEduCreate}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
            >
              <Plus className="w-3 h-3" />
              <span>Add Degree</span>
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEndEdu}>
            <Droppable droppableId="edu-list">
              {(provided) => (
                <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                  {education.map((edu, index) => (
                    // @ts-ignore
                    <Draggable key={edu.id} draggableId={edu.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex flex-col justify-between group"
                        >
                          <div className="flex items-start space-x-3">
                            <div {...provided.dragHandleProps} className="pt-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h3 className="text-sm font-bold text-white">{edu.degree}</h3>
                                  <p className="text-xs text-indigo-400">{edu.institution}</p>
                                  <p className="text-xs text-slate-400">{edu.year}</p>
                                </div>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openEduEdit(edu)} className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"><Edit3 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleEduDelete(edu.id)} className="p-1.5 rounded bg-red-900 hover:bg-red-800 text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
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
        </div>
      )}

      {/* Simplified modals to save space (since this is an admin view) */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 p-6 rounded-2xl max-w-lg w-full relative">
            <button onClick={() => setIsExpModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            <h3 className="text-lg font-bold text-white mb-4">Edit Experience</h3>
            <form onSubmit={handleExpSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto px-1 pb-4">


              <input placeholder="Role / Position" required value={expFormData.role} onChange={(e) => setExpFormData({...expFormData, role: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              <div className="space-y-2 border border-slate-700 p-3 rounded-lg bg-slate-800/50">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Organizations & Locations</div>
                {Array.from({ length: Math.max((expFormData.organization || '').split('\n').length, (expFormData.location || '').split('\n').length, 1) }).map((_, idx) => {
                  const orgs = (expFormData.organization || '').split('\n');
                  const locs = (expFormData.location || '').split('\n');
                  const isLast = idx === Math.max(orgs.length, locs.length, 1) - 1;
                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <input placeholder="Organization / Company" required={idx === 0} value={orgs[idx] || ''} onChange={(e) => {
                          const newOrgs = [...orgs];
                          newOrgs[idx] = e.target.value;
                          setExpFormData({...expFormData, organization: newOrgs.join('\n')});
                        }} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
                        <input placeholder="Location" value={locs[idx] || ''} onChange={(e) => {
                          const newLocs = [...locs];
                          newLocs[idx] = e.target.value;
                          setExpFormData({...expFormData, location: newLocs.join('\n')});
                        }} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
                      </div>
                      <div className="flex flex-col gap-1 pt-1">
                        {isLast && (
                          <button type="button" onClick={() => {
                            const newOrgs = [...orgs, ''];
                            const newLocs = [...locs, ''];
                            setExpFormData({...expFormData, organization: newOrgs.join('\n'), location: newLocs.join('\n')});
                          }} className="p-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 rounded">
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                        {Math.max(orgs.length, locs.length, 1) > 1 && (
                          <button type="button" onClick={() => {
                            const newOrgs = orgs.filter((_, i) => i !== idx);
                            const newLocs = locs.filter((_, i) => i !== idx);
                            setExpFormData({...expFormData, organization: newOrgs.join('\n'), location: newLocs.join('\n')});
                          }} className="p-1.5 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <input placeholder="Department (Optional)" value={expFormData.department || ''} onChange={(e) => setExpFormData({...expFormData, department: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              <input placeholder="Employment Type (e.g., Full-time)" value={expFormData.employmentType || ''} onChange={(e) => setExpFormData({...expFormData, employmentType: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              <input placeholder="Period (e.g., Sep 2022 - Jun 2023 · 10 mos)" required value={expFormData.period} onChange={(e) => setExpFormData({...expFormData, period: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              <textarea placeholder="Supervisors (Optional, e.g., Supervised by: [Md. Rasel Ahmed](https://example.com))" rows={2} value={expFormData.supervisors || ''} onChange={(e) => setExpFormData({...expFormData, supervisors: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              <textarea placeholder="Description" rows={4} value={expFormData.description} onChange={(e) => setExpFormData({...expFormData, description: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              <textarea placeholder="Highlights (one per line)" rows={3} value={highlightsInput} onChange={(e) => setHighlightsInput(e.target.value)} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              <input placeholder="Published Paper Link (Optional)" value={expFormData.paperLink || ''} onChange={(e) => setExpFormData({...expFormData, paperLink: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              <button type="submit" className="w-full p-2 bg-indigo-600 text-white rounded-lg font-semibold mt-2">Save</button>
            </form>
          </div>
        </div>
      )}

      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 p-6 rounded-2xl max-w-lg w-full relative">
            <button onClick={() => setIsEduModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            <h3 className="text-lg font-bold text-white mb-4">Edit Education</h3>
            <form onSubmit={handleEduSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pb-4">


              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Degree <span className="text-red-400">*</span></label>
                <input placeholder="e.g. Ph.D. in Engineering" required value={eduFormData.degree} onChange={(e) => setEduFormData({...eduFormData, degree: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Institution <span className="text-red-400">*</span></label>
                <input placeholder="University Name" required value={eduFormData.institution} onChange={(e) => setEduFormData({...eduFormData, institution: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year <span className="text-red-400">*</span></label>
                  <input placeholder="2020 - 2024" required value={eduFormData.year} onChange={(e) => setEduFormData({...eduFormData, year: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Result</label>
                  <input placeholder="3.9/4.0" value={eduFormData.result || ''} onChange={(e) => setEduFormData({...eduFormData, result: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-700">
                <label className="block text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wider">Dissertation / Thesis</label>
                <textarea placeholder="Title and brief description of your thesis..." value={eduFormData.thesis || ''} onChange={(e) => setEduFormData({...eduFormData, thesis: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700 resize-y" rows={3}/>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Advisor</label>
                <input placeholder="Prof. Name (e.g. [Name](URL))" value={eduFormData.advisor || ''} onChange={(e) => setEduFormData({...eduFormData, advisor: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Synopsis</label>
                <textarea placeholder="Write a synopsis..." value={eduFormData.synopsis || ''} onChange={(e) => setEduFormData({...eduFormData, synopsis: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700 resize-y" rows={3}/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Relevant Coursework</label>
                <textarea placeholder="List relevant courses..." value={eduFormData.coursework || ''} onChange={(e) => setEduFormData({...eduFormData, coursework: e.target.value})} className="w-full p-2 bg-slate-900 text-white rounded-lg text-sm border border-slate-700 resize-none" rows={2}/>
              </div>
              <button type="submit" className="w-full p-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Save Education</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
