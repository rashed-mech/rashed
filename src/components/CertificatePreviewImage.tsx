import React, { useEffect, useState } from 'react';
import { formatImageUrl, getDriveFallbackUrl } from '../utils/formatUrl';

/** Mount with a source key so each slide owns its loading and fallback state. */
export function CertificatePreviewImage({ source, title }: { source: string; title: string }) {
  const primary = formatImageUrl(source, { size: 1400 });
  const fallback = getDriveFallbackUrl(source);
  const candidates = [...new Set([primary, fallback].filter(Boolean))] as string[];
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const src = candidates[attempt];

  const advance = () => {
    if (attempt + 1 < candidates.length) {
      setAttempt(attempt + 1);
      setStatus('loading');
    } else {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (status !== 'loading') return;
    const timeout = window.setTimeout(() => {
      if (attempt + 1 < candidates.length) setAttempt(attempt + 1);
      else setStatus('error');
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, [attempt, status, candidates.length]);

  return <>
    {status === 'loading' && (
      <div role="status" className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 z-10">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Loading image...</span>
      </div>
    )}
    {status === 'error' ? (
      <div role="alert" className="p-8 text-center text-slate-600 dark:text-slate-300">
        <p>The preview could not be loaded. You can still use the credential link below.</p>
        <button className="mt-3 text-blue-600 dark:text-blue-400 underline" onClick={() => { setAttempt(0); setStatus('loading'); }}>Try again</button>
      </div>
    ) : (
      <img
        key={src}
        src={src}
        alt={title}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setStatus('loaded')}
        onError={advance}
        className={`max-w-full max-h-full object-contain p-2 cursor-pointer transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        title="Click to view full original resolution in new tab"
        onClick={() => window.open(formatImageUrl(source, true), '_blank', 'noopener,noreferrer')}
      />
    )}
  </>;
}
