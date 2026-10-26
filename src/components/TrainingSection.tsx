import { motion } from 'motion/react';
import { reveal, cardHover } from '../lib/motion';
import React, { useState, useEffect } from 'react';
import {
  Award,
  Radio,
  MapPin,
  ShieldCheck,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Training, Certification } from '../types';
import { formatImageUrl, preloadImages } from '../utils/formatUrl';
import { CertificatePreviewImage } from './CertificatePreviewImage';

interface TrainingSectionProps {
  config?: { title: string; subtitle: string };
  trainings?: Training[];
  certifications?: Certification[];
}



const TrainingCard: React.FC<{ tr: Training; onClickTitle: (tr: Training, slideIdx: number) => void }> = ({ tr, onClickTitle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = tr.galleryUrls || [];
  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(p => (p + 1) % totalSlides);
    }, 3500);
    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <div
      className="relative overflow-hidden p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 flex flex-col h-full min-h-[340px] group/card shadow-sm hover:shadow-xl dark:hover:shadow-blue-500/5 hover:border-blue-500/50 dark:hover:border-blue-400/50 cursor-pointer bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
      onClick={() => onClickTitle(tr, currentSlide)}
      onMouseEnter={() => preloadImages(slides)}
      onTouchStart={() => preloadImages(slides)}
    >
      {totalSlides > 0 && (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-95 dark:opacity-90 pointer-events-none">
          <div
            className="flex h-full transition-transform duration-500 ease-in-out group-hover/card:scale-105"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((url, idx) => (
              <div
                key={idx}
                className="w-full h-full flex-shrink-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${formatImageUrl(url, { size: 600 })})` }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full opacity-100 justify-between">

        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover/card:scale-105 transition-transform shadow-sm">
            <Award className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-blue-50/90 dark:bg-blue-950/60 backdrop-blur-sm border border-blue-200/80 dark:border-blue-800/60 text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
              {tr.year}
            </span>
            {totalSlides > 1 && (
              <div className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1.5 rounded-full backdrop-blur-sm" onClick={e => e.stopPropagation()}>
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                    className={`block h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-4 bg-blue-500' : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'}`}
                    title={`View image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex-1 flex flex-col items-center justify-start pointer-events-none">
          <div className="bg-slate-50/70 dark:bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 pointer-events-auto w-full flex flex-col items-center text-center">
            <button
              onClick={(e) => { e.stopPropagation(); onClickTitle(tr, currentSlide); }}
              className="focus:outline-none block mb-1 text-center"
            >
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors leading-snug cursor-pointer">
                {tr.title}
              </h4>
            </button>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
              {tr.issuer}
            </div>
          </div>
        </div>

        {tr.description && (
          <div className="mt-auto pt-6 -mx-2 w-[calc(100%+1rem)] pointer-events-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-stretch bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-lg overflow-hidden shadow-sm h-8 relative group/ticker">
              <div className="bg-blue-600 dark:bg-blue-500 text-white flex items-center px-2 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.1)] shrink-0 font-bold text-xs uppercase tracking-tight">
                <span>Overview</span>
              </div>
              <div className="flex-1 overflow-hidden relative flex items-center">
                <div
                  className="ticker whitespace-nowrap text-xs text-slate-700 dark:text-slate-300 font-medium tracking-wide"
                  style={{ animationDuration: `${(tr.tickerSpeed || 15) * (0.4 + (tr.description?.length || 0) * 0.006)}s` }}
                  title="Hover to pause"
                >
                  {tr.description}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const CertificationCard: React.FC<{ cert: Certification; onClickTitle: (cert: Certification, slideIdx: number) => void }> = ({ cert, onClickTitle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { title: cert.title, imageUrl: cert.imageUrl, credentialUrl: cert.credentialUrl },
    ...(cert.modules || [])
  ];
  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(p => (p + 1) % totalSlides);
    }, 3500);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const currentSlideObj = slides[currentSlide] || slides[0];

  return (
    <div
      className="relative overflow-hidden p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 flex flex-col h-full min-h-[300px] group/card shadow-sm hover:shadow-xl dark:hover:shadow-blue-500/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
      onMouseEnter={() => preloadImages(slides.map(s => s.imageUrl))}
      onTouchStart={() => preloadImages(slides.map(s => s.imageUrl))}
    >
      {/* Background Image Layer (Subtle watermark) */}
      <div
        className="absolute inset-0 z-0 overflow-hidden cursor-pointer opacity-95 dark:opacity-90 pointer-events-none"
        onClick={() => onClickTitle(cert, currentSlide)}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-in-out group-hover/card:scale-105"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slideObj, idx) => (
            <div
              key={idx}
              className="w-full h-full flex-shrink-0 bg-cover bg-center bg-no-repeat"
              style={slideObj.imageUrl ? { backgroundImage: `url(${formatImageUrl(slideObj.imageUrl, { size: 600 })})` } : {}}
            />
          ))}
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full opacity-100 justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 shrink-0">
            <span className="px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
              {cert.year}
            </span>
            {totalSlides > 1 && (
              <div className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-full backdrop-blur-sm">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`block h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-4 bg-blue-500' : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'}`}
                    title={`Slide ${idx + 1}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative overflow-hidden w-full">
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slideObj, idx) => (
                <div key={idx} className="w-full flex-shrink-0 flex flex-col min-h-[50px] items-start">
                  <div className="w-full bg-slate-50/70 dark:bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => onClickTitle(cert, idx)}
                      className="text-left focus:outline-none block"
                    >
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors leading-snug cursor-pointer">
                        {slideObj.title}
                      </h4>
                    </button>
                    <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1">
                      {cert.issuer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col space-y-3 shrink-0">
          {cert.modules && cert.modules.length > 0 && (
            <div className="pt-3 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800/80">
              {cert.modules.map((m, mIdx) => {
                const isActive = currentSlide === mIdx + 1;
                return (
                  <button
                    key={mIdx}
                    onClick={() => setCurrentSlide(mIdx + 1)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors duration-300 border focus:outline-none cursor-pointer ${isActive
                        ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700/60'
                      }`}
                  >
                    {m.title}
                  </button>
                );
              })}
            </div>
          )}

          {currentSlideObj?.credentialUrl && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
              <a
                href={currentSlideObj?.credentialUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                Cross-Reference Credential <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TrainingSection: React.FC<TrainingSectionProps> = ({ trainings = [], certifications = [], config }) => {
  const visibleTrainings = trainings.filter(tr => tr.isLive !== false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0);


  const modalSlides = selectedCert ? [
    { title: selectedCert.title, imageUrl: selectedCert.imageUrl, credentialUrl: selectedCert.credentialUrl },
    ...(selectedCert.modules || [])
  ] : [];
  const currentModalObj = modalSlides[selectedSlideIdx];

  // Eagerly preload all slides for selected certificate immediately when modal opens
  useEffect(() => {
    if (selectedCert) {
      const urls = [selectedCert.imageUrl, ...(selectedCert.modules || []).map(m => m.imageUrl)];
      preloadImages(urls);
    }
  }, [selectedCert]);

  // Eagerly preload all gallery images for selected training immediately when modal opens
  useEffect(() => {
    if (selectedTraining && selectedTraining.galleryUrls) {
      preloadImages(selectedTraining.galleryUrls);
    }
  }, [selectedTraining]);

  // Modal ergonomics: Escape key and body scroll lock
  useEffect(() => {
    if (selectedCert || selectedTraining) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedCert(null);
          setSelectedTraining(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [selectedCert, selectedTraining]);

  return (
    <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800/80 relative" id="training">
      <motion.div
        initial={false}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >

        {/* Section Header */}
        <div className="space-y-3 mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            {config?.title ?? "Professional Training, Field Visits & Certifications"}
          </h2>
          {(config?.subtitle ?? "Industrial workshops, power plant field visits, and internationally accredited certifications in energy, materials science, CAD, and quality engineering.") && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed w-full max-w-none">
              {config?.subtitle ?? "Industrial workshops, power plant field visits, and internationally accredited certifications in energy, materials science, CAD, and quality engineering."}
            </p>
          )}
        </div>

        {/* Subsection 1: Professional Training & Field Visits */}
        {visibleTrainings.length > 0 && (
          <div className="space-y-6 mb-14">
            <div className="flex items-center space-x-2 pb-3 border-b-2 border-slate-300 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-mono tracking-wider text-slate-900 dark:text-white uppercase font-bold">
                PROFESSIONAL TRAINING & FIELD VISITS
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTrainings.map((tr, idx) => (
                <motion.div
                  key={tr.id}
                  {...reveal(idx % 4, 'up')} whileHover={cardHover}
                  className="h-full"
                >
                  <TrainingCard
                    tr={tr}
                    onClickTitle={(trObj, sIdx) => {
                      if (trObj.galleryUrls && trObj.galleryUrls.length > 0) {
                        setSelectedTraining(trObj);
                        setSelectedSlideIdx(sIdx);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Subsection 2: Certifications */}
        {certifications.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-3 border-b-2 border-slate-300 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-mono tracking-wider text-slate-900 dark:text-white uppercase font-bold">
                CERTIFICATIONS
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert, idx) => (
                <motion.div
                  key={cert.id}
                  {...reveal(idx % 4, 'up')} whileHover={cardHover}
                  className="h-full"
                >
                  <CertificationCard
                    cert={cert}
                    onClickTitle={(certObj, sIdx) => {
                      setSelectedCert(certObj);
                      setSelectedSlideIdx(sIdx);
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Certificate Preview Modal */}
      {selectedCert && currentModalObj && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pr-10 shrink-0">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {currentModalObj.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                {selectedCert.issuer} • {selectedCert.year}
              </p>
            </div>

            <div className="mt-6 relative w-full h-[50vh] sm:h-[65vh] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-center group/modal overflow-hidden">
              {modalSlides.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlideIdx(prev => (prev - 1 + modalSlides.length) % modalSlides.length);
                    }}
                    className="absolute left-2 sm:left-4 p-2 sm:p-3 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-full shadow-md backdrop-blur-md transition-all opacity-0 group-hover/modal:opacity-100 z-20 focus:outline-none"
                    aria-label="Previous Certificate"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlideIdx(prev => (prev + 1) % modalSlides.length);
                    }}
                    className="absolute right-2 sm:right-4 p-2 sm:p-3 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-full shadow-md backdrop-blur-md transition-all opacity-0 group-hover/modal:opacity-100 z-20 focus:outline-none"
                    aria-label="Next Certificate"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              {currentModalObj.imageUrl ? (
                <CertificatePreviewImage
                  key={currentModalObj.imageUrl}
                  source={currentModalObj.imageUrl}
                  title={currentModalObj.title}
                />
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <Award className="w-16 h-16 opacity-30" />
                  <p className="text-sm font-medium">No certificate image available</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Close
                </button>
                {modalSlides.length > 1 && (
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    {selectedSlideIdx + 1} / {modalSlides.length}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {currentModalObj.imageUrl && (
                  <button
                    onClick={() => window.open(formatImageUrl(currentModalObj.imageUrl!, true), '_blank')}
                    className="inline-flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="Open full resolution certificate in new tab"
                  >
                    <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                    Full Resolution
                  </button>
                )}
                {currentModalObj.credentialUrl ? (
                  <a
                    href={currentModalObj.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto text-center inline-flex justify-center items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Verify Credential <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">No external verification link</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Preview Modal */}
      {selectedTraining && selectedTraining.galleryUrls && selectedTraining.galleryUrls.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedTraining(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTraining(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pr-10 shrink-0">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {selectedTraining.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                {selectedTraining.issuer} • {selectedTraining.year}
              </p>
            </div>

            <div className="mt-6 relative w-full h-[50vh] sm:h-[65vh] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-center group/modal overflow-hidden">
              {selectedTraining.galleryUrls.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlideIdx(prev => (prev - 1 + selectedTraining.galleryUrls!.length) % selectedTraining.galleryUrls!.length);
                    }}
                    className="absolute left-2 sm:left-4 p-2 sm:p-3 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-full shadow-md backdrop-blur-md transition-all opacity-0 group-hover/modal:opacity-100 z-20 focus:outline-none"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlideIdx(prev => (prev + 1) % selectedTraining.galleryUrls!.length);
                    }}
                    className="absolute right-2 sm:right-4 p-2 sm:p-3 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-full shadow-md backdrop-blur-md transition-all opacity-0 group-hover/modal:opacity-100 z-20 focus:outline-none"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              <CertificatePreviewImage
                key={selectedTraining.galleryUrls[selectedSlideIdx]}
                source={selectedTraining.galleryUrls[selectedSlideIdx]}
                title={selectedTraining.title}
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedTraining(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Close
                </button>
                {selectedTraining.galleryUrls.length > 1 && (
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    {selectedSlideIdx + 1} / {selectedTraining.galleryUrls.length}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => window.open(formatImageUrl(selectedTraining.galleryUrls![selectedSlideIdx], true), '_blank')}
                  className="inline-flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Open full resolution image in new tab"
                >
                  <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                  Full Resolution
                </button>
                {selectedTraining.credentialUrl && (
                  <a
                    href={selectedTraining.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto text-center inline-flex justify-center items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Verify Credential <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
