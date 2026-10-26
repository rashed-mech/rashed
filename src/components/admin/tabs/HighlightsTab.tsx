import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Sparkles, Save, GripVertical, Trash2, Plus, Edit } from 'lucide-react';
import { PortfolioData, CorePillar, CoreMetric } from '../../../types';
import { updatePillarsAPI, updateMetricsAPI, updateSectionConfigAPI } from '../../../api';
import { SectionHeadingEditor } from '../SectionHeadingEditor';

interface HighlightsTabProps {
  data: PortfolioData;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const DraggableComponent = Draggable as any;

export const HighlightsTab: React.FC<HighlightsTabProps> = ({ data, onRefresh, showToast }) => {
  const [pillars, setPillars] = useState<CorePillar[]>(data.pillars || []);
  const [metrics, setMetrics] = useState<CoreMetric[]>(data.metrics || []);
  const [showPillars, setShowPillars] = useState(data.sectionConfig?.overview?.showPillars !== false);
  const [loading, setLoading] = useState(false);

  const handleDragEndPillars = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(pillars);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPillars(items);
  };

  const handleDragEndMetrics = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(metrics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setMetrics(items);
  };

  const savePillars = async () => {
    try {
      setLoading(true);
      await updatePillarsAPI(pillars);
      await updateSectionConfigAPI({
        ...data.sectionConfig,
        overview: {
          ...(data.sectionConfig?.overview || {}),
          showPillars
        }
      });
      showToast('Core Pillars saved successfully', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveMetrics = async () => {
    try {
      setLoading(true);
      await updateMetricsAPI(metrics);
      showToast('Metrics saved successfully', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePillar = (id: string, field: keyof CorePillar, value: string) => {
    if (field === 'galleryUrls') {
      const urls = value.split('\n').map(u => u.trim()).filter(Boolean);
      setPillars(pillars.map(p => p.id === id ? { ...p, galleryUrls: urls } : p));
    } else {
      setPillars(pillars.map(p => p.id === id ? { ...p, [field]: value } : p));
    }
  };

  const updateMetric = (id: string, field: keyof CoreMetric, value: string) => {
    setMetrics(metrics.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <SectionHeadingEditor sectionKey="overview" data={data} onRefresh={onRefresh} showToast={showToast} />
      {/* 4 Core Pillars Section */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Core Pillars
            </h2>
            
            <p className="text-sm text-slate-400 mt-1">Manage the 4 main expertise pillars shown in the Overview section. Drag to reorder.</p>
            <div className="mt-3 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showPillars}
                  onChange={(e) => setShowPillars(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-900 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-300">Show "Core Pillars" section publicly</span>
              </label>
            </div>
          </div>
          <button
            onClick={savePillars}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Pillars</span>
          </button>
        </div>

        <div className="p-6">
          <DragDropContext onDragEnd={handleDragEndPillars}>
            <Droppable droppableId="pillars-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {pillars.map((pillar, index) => (
                    <DraggableComponent key={pillar.id} draggableId={pillar.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 rounded-xl border ${snapshot.isDragging ? 'bg-slate-700 border-indigo-500' : 'bg-slate-800/80 border-slate-700'} flex gap-4`}
                        >
                          <div {...provided.dragHandleProps} className="mt-2 text-slate-500 hover:text-indigo-400 cursor-grab">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                              <input
                                type="text"
                                value={pillar.title}
                                onChange={(e) => updatePillar(pillar.id, 'title', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Tag / Tools</label>
                              <input
                                type="text"
                                value={pillar.tag}
                                onChange={(e) => updatePillar(pillar.id, 'tag', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                              <textarea
                                value={pillar.description}
                                onChange={(e) => updatePillar(pillar.id, 'description', e.target.value)}
                                rows={2}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-slate-400 mb-1">Icon Name (Lucide React)</label>
                              <input
                                type="text"
                                value={pillar.icon}
                                onChange={(e) => updatePillar(pillar.id, 'icon', e.target.value)}
                                className="w-full md:w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-slate-400 mb-1">Gallery Image URLs (One URL per line - for Modal Carousel)</label>
                              <textarea
                                value={(pillar.galleryUrls || []).join('\n')}
                                onChange={(e) => updatePillar(pillar.id, 'galleryUrls', e.target.value as any)}
                                rows={2}
                                placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div></div>
                        </div>
                      )}
                    </DraggableComponent>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Overview Metrics Section */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Overview Metrics
            </h2>
            
            <p className="text-sm text-slate-400 mt-1">Manage the metrics displayed above the pillars. Drag to reorder.</p>
          </div>
          <button
            onClick={saveMetrics}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Metrics</span>
          </button>
        </div>

        <div className="p-6">
          <DragDropContext onDragEnd={handleDragEndMetrics}>
            <Droppable droppableId="metrics-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {metrics.map((metric, index) => (
                    <DraggableComponent key={metric.id} draggableId={metric.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 rounded-xl border ${snapshot.isDragging ? 'bg-slate-700 border-indigo-500' : 'bg-slate-800/80 border-slate-700'} flex gap-4 items-center`}
                        >
                          <div {...provided.dragHandleProps} className="text-slate-500 hover:text-indigo-400 cursor-grab">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Value (e.g. 6 Papers)</label>
                              <input
                                type="text"
                                value={metric.value}
                                onChange={(e) => updateMetric(metric.id, 'value', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
                              <input
                                type="text"
                                value={metric.label}
                                onChange={(e) => updateMetric(metric.id, 'label', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Subtext</label>
                              <input
                                type="text"
                                value={metric.sub}
                                onChange={(e) => updateMetric(metric.id, 'sub', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div></div>
                        </div>
                      )}
                    </DraggableComponent>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};
