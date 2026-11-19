import React, { useEffect, useState } from 'react';
import { Download, FileText, Upload, Trash2 } from 'lucide-react';
import { fetchCvPdfSettings, saveCvPdf, deleteCvPdf, setCvPdfEnabled, fetchSavedCvPdf } from '../../api';
import type { CvPdfSettings } from '../../api';
import { MAX_RESEARCH_RESUME_BYTES } from '../../utils/resumeLimits';

/**
 * Admin control for the homepage Download CV button: upload a CV PDF and switch
 * between serving that file and generating the CV from portfolio content.
 */
export function CvPdfUploader({ onRefresh, showToast }: {onRefresh:()=>void; showToast:(message:string,type?:'success'|'error')=>void}) {
  const [settings, setSettings] = useState<CvPdfSettings>({file:null, enabled:false});
  const [selected, setSelected] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [inputKey, setInputKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetchCvPdfSettings().then(value => { if (mounted) setSettings(value); })
      .catch(error => { if (mounted) setError(error.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const run = async (action: () => Promise<CvPdfSettings>, success: (next: CvPdfSettings) => string) => {
    setBusy(true);
    setError('');
    try {
      const next = await action();
      setSettings(next);
      showToast(success(next));
      onRefresh();
    } catch (error: any) { setError(error.message); showToast(error.message, 'error'); }
    finally { setBusy(false); }
  };

  const upload = () => run(async () => {
    if (!selected) throw new Error('Choose a PDF file first.');
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('The selected file could not be read.'));
      reader.onabort = () => reject(new Error('Reading the selected file was cancelled.'));
      reader.readAsDataURL(selected);
    });
    const saved = await saveCvPdf(selected.name, base64);
    setSelected(null);
    setInputKey(value => value + 1);
    return saved;
  }, next => next.enabled ? 'CV PDF saved. Download CV now gives visitors this file.' : 'CV PDF saved. Turn on "Use uploaded PDF" to give visitors this file.');

  const toggle = () => run(() => setCvPdfEnabled(!settings.enabled),
    next => next.enabled ? 'Download CV now gives visitors your uploaded PDF.' : 'Download CV now generates the CV from your portfolio content.');

  const remove = () => run(deleteCvPdf, () => 'CV PDF removed. Download CV now generates the CV from your portfolio content.');

  // Admin preview needs the auth header, so fetch it rather than linking directly.
  const preview = async () => {
    setError('');
    try {
      const url = URL.createObjectURL(await fetchSavedCvPdf());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = settings.file?.fileName || 'CV.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error: any) { setError(error.message); }
  };

  const usingUpload = settings.enabled && Boolean(settings.file);

  return <section className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4" aria-labelledby="cv-pdf-upload-title">
    <h3 id="cv-pdf-upload-title" className="text-base font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400" />CV PDF (Download CV button)</h3>
    <p className="text-xs text-slate-400">Choose what visitors get from Download CV: a PDF you upload, or a CV generated automatically from your portfolio content, which follows every edit you make.</p>

    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-900/60 border border-slate-700/60 px-4 py-3">
      <div>
        <p id="cv-pdf-toggle-label" className="text-sm font-semibold text-white">Use uploaded PDF</p>
        <p className="text-xs text-slate-400" aria-live="polite">
          {loading ? 'Loading...' : usingUpload
            ? 'On: visitors download your uploaded PDF.'
            : settings.enabled
              ? 'On, but no PDF is uploaded yet: visitors get the generated CV.'
              : 'Off: visitors get a CV generated from your portfolio content.'}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={settings.enabled}
        aria-labelledby="cv-pdf-toggle-label"
        onClick={toggle}
        disabled={busy || loading}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${settings.enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>

    {loading ? <p className="text-sm text-slate-400">Loading saved CV...</p> : settings.file ? <div className="space-y-2">
      <p className="text-sm text-slate-200 break-all">{settings.file.fileName} <span className="text-xs text-slate-400">({Math.ceil(settings.file.size / 1024)} KB)</span></p>
      <div className="flex flex-wrap gap-4">
        <button type="button" onClick={preview} disabled={busy} className="text-xs text-indigo-300 hover:underline disabled:opacity-50 inline-flex items-center gap-1"><Download className="w-4 h-4" />Download saved PDF</button>
        <button type="button" onClick={remove} disabled={busy} className="text-xs text-red-400 hover:underline disabled:opacity-50 inline-flex items-center gap-1"><Trash2 className="w-4 h-4" />Remove PDF</button>
      </div>
    </div> : <p className="text-sm text-slate-400">No CV PDF uploaded yet.</p>}

    <label className="block text-xs font-semibold text-slate-300" htmlFor="cv-pdf-file">{settings.file ? 'Replace PDF' : 'Choose PDF'} (maximum 3 MB)</label>
    <input key={inputKey} id="cv-pdf-file" type="file" accept="application/pdf,.pdf" disabled={busy || loading} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-white" onChange={event => {
      const file = event.target.files?.[0];
      setSelected(null);
      setError('');
      if (!file) return;
      if (!/\.pdf$/i.test(file.name)) { setError('Please choose a PDF file.'); return; }
      if (file.size > MAX_RESEARCH_RESUME_BYTES) { setError('The PDF must be 3 MB or smaller.'); return; }
      setSelected(file);
    }} />
    {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    <button type="button" onClick={upload} disabled={!selected || busy || loading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"><Upload className="w-4 h-4" />{busy ? 'Saving...' : 'Save CV PDF'}</button>
  </section>;
}
