import { SectionHeadingEditor } from '../SectionHeadingEditor';
import React, { useState } from 'react';
import { Terminal, Plus, Trash2, Save, X, GripVertical } from 'lucide-react';
import { SkillGroup, SkillItem } from '../../../types';
import { updateSkillsAPI } from '../../../api';
import { Reorder, useDragControls } from 'motion/react';

interface SkillsTabProps {
  data?: any;
  skillGroups: SkillGroup[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const SkillRow = ({ skill, gIdx, sIdx, handleUpdateSkill, handleRemoveSkill }: any) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={skill}
      dragListener={false}
      dragControls={dragControls}
      className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 relative shadow-sm"
    >
      
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-white touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={skill.name}
        onChange={(e) => handleUpdateSkill(gIdx, sIdx, { name: e.target.value })}
        className="flex-1 min-w-[160px] px-3 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
        placeholder="Skill Name"
      />
      <div className="flex items-center space-x-1 text-xs text-slate-400">
        <span>Level %:</span>
        <input
          type="number"
          min={1}
          max={100}
          value={skill.level || 90}
          onChange={(e) => handleUpdateSkill(gIdx, sIdx, { level: Number(e.target.value) })}
          className="w-16 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none"
        />
      </div>
      <label className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={skill.highlight || false}
          onChange={(e) => handleUpdateSkill(gIdx, sIdx, { highlight: e.target.checked })}
          className="w-3.5 h-3.5 text-indigo-600 rounded focus:outline-none"
        />
        <span className="text-[11px] font-semibold">Highlight</span>
      </label>
      <button
        type="button"
        onClick={() => handleRemoveSkill(gIdx, sIdx)}
        className="p-1 text-slate-500 hover:text-red-400"
      >
        <X className="w-4 h-4" />
      </button>
    </Reorder.Item>
  );
};

const GroupRow = ({ group, gIdx, handleUpdateGroupTitle, handleAddSkillToGroup, handleRemoveGroup, handleUpdateSkill, handleRemoveSkill, handleReorderSkills }: any) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={group}
      dragListener={false}
      dragControls={dragControls}
      className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4 shadow-sm"
    >
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
        <div className="flex items-center gap-2 flex-1">
          <div 
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-white touch-none"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={group.category}
              onChange={(e) => handleUpdateGroupTitle(gIdx, e.target.value, group.description || '')}
              className="px-3 py-1.5 text-xs sm:text-sm font-bold bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
              placeholder="Category Name"
            />
            <input
              type="text"
              value={group.description || ''}
              onChange={(e) => handleUpdateGroupTitle(gIdx, group.category, e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-300 focus:outline-none"
              placeholder="Category Description..."
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleAddSkillToGroup(gIdx)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:bg-indigo-950/60 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
          <button
            type="button"
            onClick={() => handleRemoveGroup(gIdx)}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/60 transition-colors"
            title="Remove Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Skills List inside Category */}
      <Reorder.Group 
        axis="y" 
        values={group.skills} 
        onReorder={(newSkills) => handleReorderSkills(gIdx, newSkills)}
        className="space-y-2 relative"
      >
        {group.skills.map((skill: any, sIdx: number) => (
          <SkillRow
            key={skill.id}
            skill={skill}
            gIdx={gIdx}
            sIdx={sIdx}
            handleUpdateSkill={handleUpdateSkill}
            handleRemoveSkill={handleRemoveSkill}
          />
        ))}
      </Reorder.Group>
    </Reorder.Item>
  );
};

export const SkillsTab: React.FC<SkillsTabProps> = ({ data, skillGroups, onRefresh, showToast }) => {
  const [groups, setGroups] = useState<SkillGroup[]>(() => {
    const parsed = JSON.parse(JSON.stringify(skillGroups));
    return parsed.map((g: any) => ({
      ...g,
      id: g.id || `sg-${Math.random().toString(36).substr(2, 9)}`,
      skills: (g.skills || []).map((s: any) => ({
        ...s,
        id: s.id || `sk-${Math.random().toString(36).substr(2, 9)}`
      }))
    }));
  });
  const [loading, setLoading] = useState(false);

  const handleAddGroup = () => {
    const newGroup: SkillGroup = {
      id: `sg-${Date.now()}`,
      category: 'New Competency Group',
      description: 'Description of domain tools and methods.',
      skills: [
        { id: `sk-${Date.now()}`, name: 'Skill 1', level: 90, highlight: true }
      ]
    };
    setGroups([...groups, newGroup]);
  };

  const handleRemoveGroup = (idx: number) => {
    const updated = groups.filter((_, i) => i !== idx);
    setGroups(updated);
  };

  const handleUpdateGroupTitle = (idx: number, category: string, description: string) => {
    const updated = [...groups];
    updated[idx].category = category;
    updated[idx].description = description;
    setGroups(updated);
  };

  const handleAddSkillToGroup = (groupIdx: number) => {
    const updated = [...groups];
    const newGroup = { ...updated[groupIdx] };
    newGroup.skills = [...newGroup.skills, {
      id: `sk-${Date.now()}`,
      name: 'New Skill',
      level: 85,
      highlight: false
    }];
    updated[groupIdx] = newGroup;
    setGroups(updated);
  };

  const handleRemoveSkill = (groupIdx: number, skillIdx: number) => {
    const updated = [...groups];
    const newGroup = { ...updated[groupIdx] };
    newGroup.skills = newGroup.skills.filter((_, i) => i !== skillIdx);
    updated[groupIdx] = newGroup;
    setGroups(updated);
  };

  const handleUpdateSkill = (groupIdx: number, skillIdx: number, partial: Partial<SkillItem>) => {
    const updated = [...groups];
    const newGroup = { ...updated[groupIdx] };
    const newSkills = [...newGroup.skills];
    newSkills[skillIdx] = {
      ...newSkills[skillIdx],
      ...partial
    };
    newGroup.skills = newSkills;
    updated[groupIdx] = newGroup;
    setGroups(updated);
  };

  const handleReorderSkills = (groupIdx: number, newSkills: any[]) => {
    const updated = [...groups];
    const newGroup = { ...updated[groupIdx] };
    newGroup.skills = newSkills;
    updated[groupIdx] = newGroup;
    setGroups(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSkillsAPI(groups);
      showToast('Technical skills updated successfully!');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update skills', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-skills-tab">
      <SectionHeadingEditor sectionKey="capabilities" data={data} onRefresh={onRefresh} showToast={showToast} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>Technical Skills & Competencies</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize domain categories, proficiency percentages, and featured tags.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddGroup}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Skills'}</span>
          </button>
        </div>
      </div>

      <Reorder.Group 
        axis="y" 
        values={groups} 
        onReorder={setGroups}
        className="space-y-6 relative"
      >
        {groups.map((group, gIdx) => (
          <GroupRow
            key={group.id}
            group={group}
            gIdx={gIdx}
            handleUpdateGroupTitle={handleUpdateGroupTitle}
            handleAddSkillToGroup={handleAddSkillToGroup}
            handleRemoveGroup={handleRemoveGroup}
            handleUpdateSkill={handleUpdateSkill}
            handleRemoveSkill={handleRemoveSkill}
            handleReorderSkills={handleReorderSkills}
          />
        ))}
      </Reorder.Group>
    </div>
  );
};
