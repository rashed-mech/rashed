import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import type { UXDesignId } from '../types';

export const TypewriterName = React.memo(({ name, activeDesign }: { name: string; activeDesign?: UXDesignId }) => {
  const fullName = (name.trim() || 'RASHEDUL ISLAM').toUpperCase();
  const reducedMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(reducedMotion ? fullName.length : 0);
  const [replay, setReplay] = useState(0);
  const audio = useRef<AudioContext | null>(null);
  const keyNoise = useRef<AudioBuffer | null>(null);

  const enableSound = () => {
    try {
      if (!audio.current) {
        const Audio = window.AudioContext || (window as any).webkitAudioContext;
        if (!Audio) return;
        const context: AudioContext = new Audio();
        audio.current = context;
        const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.025), context.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        keyNoise.current = buffer;
      }
      if (audio.current.state === 'suspended') void audio.current.resume().catch(() => {});
    } catch { /* The visual animation also works when audio is unavailable. */ }
  };

  const playKey = () => {
    const context = audio.current;
    if (!context || context.state !== 'running' || !keyNoise.current || document.hidden) return;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = keyNoise.current;
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    gain.gain.setValueAtTime(0.07, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.025);
    source.connect(filter).connect(gain).connect(context.destination);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start();
  };

  useEffect(() => {
    // Sound can start immediately on an already-interacted-with page. On a
    // fresh visit, unlock it only from a real click, tap, or key press.
    if (navigator.userActivation?.hasBeenActive) enableSound();
    window.addEventListener('pointerdown', enableSound, { once: true });
    window.addEventListener('keydown', enableSound, { once: true });
    return () => {
      window.removeEventListener('pointerdown', enableSound);
      window.removeEventListener('keydown', enableSound);
      const context = audio.current;
      audio.current = null;
      keyNoise.current = null;
      if (context && context.state !== 'closed') void context.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) { setVisibleCount(fullName.length); return; }
    let count = 0;
    setVisibleCount(0);
    let timer: number;
    const typeNext = () => {
      if (document.hidden) { timer = window.setTimeout(typeNext, 150); return; }
      count++;
      setVisibleCount(count);
      if (fullName[count - 1] !== ' ') playKey();
      if (count < fullName.length) timer = window.setTimeout(typeNext, fullName[count - 1] === ' ' ? 160 : 100);
    };
    timer = window.setTimeout(typeNext, 250);
    return () => window.clearTimeout(timer);
  }, [fullName, reducedMotion, replay]);

  const cursor = <span aria-hidden="true" className={`absolute left-0 top-[0.1em] h-[0.8em] w-[3px] rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse motion-reduce:animate-none ${activeDesign === 'design-5' ? '!bg-teal-500' : ''}`} />;
  let offset = 0;
  const words = fullName.split(' ');

  return <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-3 max-w-full">
    <h1 aria-label={fullName} className={`hero-name text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-none inline-flex flex-wrap items-center ${
      activeDesign === 'design-2' ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-sans' :
      activeDesign === 'design-3' ? 'font-serif italic dark:text-amber-100 text-slate-900 tracking-wide' :
      activeDesign === 'design-4' ? 'font-sans dark:text-white text-slate-900 drop-shadow-[0_0_15px_rgba(56,189,248,0.25)]' :
      activeDesign === 'design-5' ? 'font-sans dark:text-white text-slate-900 tracking-tight' :
      activeDesign === 'design-6' ? 'font-serif text-[#1e1b18] dark:bg-gradient-to-r dark:from-[#d4af37] dark:via-[#fbf5b7] dark:to-[#aa7c11] dark:bg-clip-text dark:text-transparent tracking-wide' :
      'font-sans dark:text-white text-black'
    }`}>
      {words.map((word, wordIndex) => {
        const start = offset;
        offset += word.length + 1;
        return <span key={wordIndex} aria-hidden="true" className="hero-name-word relative">
          {Array.from(word).map((character, index) => <span key={index} className="relative">
            <span style={{ visibility: start + index < visibleCount ? 'visible' : 'hidden' }}>{character}</span>
            {!reducedMotion && start + index === visibleCount && cursor}
          </span>)}
          {wordIndex < words.length - 1 && <span className="hero-name-space relative">
            {!reducedMotion && visibleCount === start + word.length && cursor}
          </span>}
          {!reducedMotion && wordIndex === words.length - 1 && visibleCount === fullName.length && <span className="relative ml-1">{cursor}</span>}
        </span>;
      })}
    </h1>
    <button
      type="button"
      aria-label="Replay name with typing sound"
      title="Replay name with typing sound"
      onClick={() => { enableSound(); setReplay(value => value + 1); }}
      className="shrink-0 rounded-full p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
    ><Volume2 className="w-4 h-4" /></button>
  </div>;
});
