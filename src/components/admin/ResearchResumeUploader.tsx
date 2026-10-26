import React, { useEffect, useState } from 'react';
import { Download, FileText, Upload, Trash2 } from 'lucide-react';
import { fetchResearchResumeMetadata, saveResearchResumePDF, deleteResearchResumePDF } from '../../api';
import type { ResearchResume } from '../../types';
import { MAX_RESEARCH_RESUME_BYTES } from '../../utils/resumeLimits';

export function ResearchResumeUploader({ onRefresh, showToast }: {onRefresh:()=>void; showToast:(message:string,type?:'success'|'error')=>void}) {
  const [saved, setSaved] = useState<ResearchResume | null>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [inputKey, setInputKey] = useState(0);
  useEffect(() => {
    let mounted = true;
    fetchResearchResumeMetadata().then(value => { if (mounted) setSaved(value); })
      .catch(error => { if (mounted) setError(error.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const upload = async () => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('The selected file could not be read.'));
        reader.onabort = () => reject(new Error('Reading the selected file was cancelled.'));
        reader.readAsDataURL(selected);
      });
      setSaved(await saveResearchResumePDF(selected.name, base64));
      setSelected(null);
      setInputKey(value => value + 1);
      showToast('Research resume saved. The homepage button now downloads this PDF.');
      onRefresh();
    } catch (error: any) { setError(error.message); showToast(error.message, 'error'); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    try { await deleteResearchResumePDF(); setSaved(null); showToast('Research resume removed.'); onRefresh(); }
    catch (error: any) { setError(error.message); showToast(error.message, 'error'); }
    finally { setBusy(false); }
  };

  return <section className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4" aria-labelledby="research-resume-upload-title">
    <h3 id="research-resume-upload-title" className="text-base font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400" />Research Resume PDF</h3>
    <p className="text-xs text-slate-400">Upload the PDF visitors download with the homepage Research Resume button. Download CV continues to generate your CV automatically.</p>
    {loading ? <p className="text-sm text-slate-400">Loading saved resume...</p> : saved ? <div className="space-y-2">
      <p className="text-sm text-slate-200 break-all">{saved.fileName} <span className="text-xs text-slate-400">({Math.ceil(saved.size / 1024)} KB)</span></p>
      <div className="flex flex-wrap gap-4">
        <a href="/api/research-resume" download className="text-xs text-indigo-300 hover:underline inline-flex items-center gap-1"><Download className="w-4 h-4" />Download saved PDF</a>
        <button type="button" onClick={remove} disabled={busy} className="text-xs text-red-400 hover:underline disabled:opacity-50 inline-flex items-center gap-1"><Trash2 className="w-4 h-4" />Remove PDF</button>
      </div>
    </div> : <p className="text-sm text-slate-400">No research resume uploaded yet.</p>}
    <label className="block text-xs font-semibold text-slate-300" htmlFor="research-resume-file">{saved ? 'Replace PDF' : 'Choose PDF'} (maximum 3 MB)</label>
    <input key={inputKey} id="research-resume-file" type="file" accept="application/pdf,.pdf" disabled={busy || loading} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-white" onChange={event => {
      const file = event.target.files?.[0];
      setSelected(null);
      setError('');
      if (!file) return;
      if (!/\.pdf$/i.test(file.name)) { setError('Please choose a PDF file.'); return; }
      if (file.size > MAX_RESEARCH_RESUME_BYTES) { setError('The PDF must be 3 MB or smaller.'); return; }
      setSelected(file);
    }} />
    {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    <button type="button" onClick={upload} disabled={!selected || busy || loading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"><Upload className="w-4 h-4" />{busy ? 'Saving...' : 'Save Research Resume'}</button>
  </section>;
}
