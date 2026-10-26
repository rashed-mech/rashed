import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  ExternalLink, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { Project } from '../types';
import { formatImageUrl, preloadImages, getDriveFallbackUrl } from '../utils/formatUrl';

interface ProjectsSectionProps {
  config?: { title: string; subtitle: string };
  projects: Project[];
}

interface ProjectCardProps {
  project: Project;
  idx: number;
  total: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
  currentSlide: number;
  onPrevSlide: (projectId: string, total: number, e: React.MouseEvent) => void;
  onNextSlide: (projectId: string, total: number, e: React.MouseEvent) => void;
  onOpenModal: (idx: number, slideIdx: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  idx,
  total,
  progress,
  range,
  targetScale,
  currentSlide,
  onPrevSlide,
  onNextSlide,
  onOpenModal
}) => {
  const cardImages = [
    ...(project.imageUrl ? [project.imageUrl] : []),
    ...(project.images || [])
  ];

  // Progressive scale down as following cards enter viewport (Franck Poingt style)
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div 
      className="min-h-[500px] sm:min-h-[460px] lg:min-h-[420px] flex items-start justify-center sticky mb-10 sm:mb-14 last:mb-0"
      style={{
        top: `calc(84px + ${idx * 24}px)`,
        zIndex: idx + 10,
      }}
    >
      <motion.div 
        style={{
          scale,
        }}
        className="w-full p-6 sm:p-8 rounded-3xl dark:bg-[#0c131d]/95 bg-white/95 backdrop-blur-2xl border dark:border-slate-800 border-slate-300/90 shadow-2xl hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-colors duration-300 group origin-top will-change-transform"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Project Narrative & Technical Details (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5 flex flex-col justify-between">
            
            {/* Top Header: Badge & Date */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider dark:bg-blue-950/60 bg-blue-50 dark:text-blue-300 text-blue-800 border dark:border-blue-800/60 border-blue-200">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="leading-none relative -top-[1px]">PROJECT {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
              </div>
              
              {project.date && (
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shrink-0 leading-none">
                  {project.date}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 
              onClick={() => onOpenModal(idx, currentSlide)}
              className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug cursor-pointer font-sans"
            >
              {project.title}
            </h3>

            {/* Main Description */}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-normal leading-relaxed text-justify">
              {project.description}
            </p>

            {/* Technical Detail / Sub-narrative */}
            {project.fullDescription && (
              <p className="text-xs text-slate-600 dark:text-slate-400 italic border-l-2 border-blue-500/70 pl-3 text-justify">
                {project.fullDescription}
              </p>
            )}

            {/* Tech Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.technologies.map((tech, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-blue-300 border border-slate-300 dark:border-slate-700 shadow-2xs"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Action Links */}
            {(project.githubUrl || project.liveUrl) && (
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-300 dark:border-slate-700 hover:border-blue-400 transition-colors shadow-xs"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span>Code / CAD</span>
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </a>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Photo Carousel (5 cols) */}
          <div className="lg:col-span-5">
            {cardImages.length > 0 ? (
              <div 
                className="w-full h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden relative bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-inner group/carousel cursor-pointer"
                onClick={() => onOpenModal(idx, currentSlide)}
                onMouseEnter={() => preloadImages(cardImages)}
                onTouchStart={() => preloadImages(cardImages)}
              >
                {/* Image Slides */}
                <div 
                  className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {cardImages.map((img, i) => (
                    <div 
                      key={i}
                      className="w-full h-full flex-shrink-0 bg-contain bg-center bg-no-repeat bg-[#020617]"
                      style={{ backgroundImage: `url(${formatImageUrl(img, { size: 800 })})` }}
                    />
                  ))}
                </div>

                {/* Navigation Chevrons */}
                {cardImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => onPrevSlide(project.id, cardImages.length, e)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 shadow-lg cursor-pointer"
                      title="Previous Photo"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={(e) => onNextSlide(project.id, cardImages.length, e)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 shadow-lg cursor-pointer"
                      title="Next Photo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Slide Count Indicator & Dots */}
                <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-700/80">
                    {cardImages.map((_, dotIdx) => (
                      <span 
                        key={dotIdx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          dotIdx === currentSlide 
                            ? 'w-3.5 bg-blue-500' 
                            : 'bg-slate-500'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-mono text-white/90 border border-slate-700/80">
                    {currentSlide + 1} / {cardImages.length}
                  </span>
                </div>

              </div>
            ) : (
              <div className="w-full h-56 sm:h-64 lg:h-72 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-2">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="text-xs font-mono">SolidWorks CAD Model Viewport</span>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const [selectedProjectIdx, setSelectedProjectIdx] = useState<number | null>(null);
  const [selectedSlideIdx, setSelectedSlideIdx] = useState(0);
  const [activeSlideMap, setActiveSlideMap] = useState<Record<string, number>>({});

  // Auto-advance carousels gently
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideMap(prev => {
        const nextMap = { ...prev };
        projects.forEach(p => {
          const imgs = [
            ...(p.imageUrl ? [p.imageUrl] : []),
            ...(p.images || [])
          ];
          if (imgs.length > 1) {
            const current = prev[p.id] || 0;
            nextMap[p.id] = (current + 1) % imgs.length;
          }
        });
        return nextMap;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [projects]);

  // Modal ergonomics: Escape key and body scroll lock
  useEffect(() => {
    if (selectedProjectIdx !== null) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedProjectIdx(null);
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
  }, [selectedProjectIdx]);

  if (!projects || projects.length === 0) return null;

  const selectedProject = selectedProjectIdx !== null ? projects[selectedProjectIdx] : null;
  const modalImages = selectedProject 
    ? [
        ...(selectedProject.imageUrl ? [selectedProject.imageUrl] : []),
        ...(selectedProject.images || [])
      ]
    : [];

  const handlePrevSlide = (projectId: string, total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlideMap(prev => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) - 1 + total) % total
    }));
  };

  const handleNextSlide = (projectId: string, total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlideMap(prev => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) + 1) % total
    }));
  };

  const [modalImgLoading, setModalImgLoading] = useState(true);

  // Eagerly preload all images for current project modal
  useEffect(() => {
    if (selectedProject && modalImages.length > 0) {
      preloadImages(modalImages);
    }
  }, [selectedProject]);

  useEffect(() => {
    setModalImgLoading(true);
  }, [selectedProjectIdx, selectedSlideIdx]);


  const handleOpenModal = (idx: number, slideIdx: number) => {
    setSelectedProjectIdx(idx);
    setSelectedSlideIdx(slideIdx);
  };


  return (
    <section 
      ref={containerRef}
      className="pt-4 sm:pt-6 pb-20 -mt-6 sm:-mt-8 border-t border-slate-300/80 dark:border-slate-800/80 relative bg-[#f8fafc] dark:bg-[#060a10]/80 overflow-visible" 
      id="projects"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[450px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Spanning FULL WIDTH from Left to Right (Badge removed) */}
        <div className="w-full max-w-none space-y-2 mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            {config?.title ?? "Undergraduate Engineering & Mechanical Design Projects"}
          </h2>
          
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-normal leading-relaxed text-justify sm:text-left w-full max-w-none">
            {config?.subtitle ?? "Mechanical system design, SolidWorks CAD modeling, high gear ratio transmission kinematics, and assistive electro-mechanical solutions."}
          </p>
        </div>

        {/* STACKED & COLLAPSIBLE PROJECT DECK (Franck Poingt Style) */}
        <div className="relative pb-16">
          {projects.map((project, idx) => {
            const targetScale = 1 - (projects.length - 1 - idx) * 0.04;
            const step = 1 / projects.length;
            const rangeStart = idx * step;
            const rangeEnd = Math.min(1, (idx + 1) * step);

            return (
              <ProjectCard
                key={project.id}
                project={project}
                idx={idx}
                total={projects.length}
                progress={scrollYProgress}
                range={[rangeStart, rangeEnd]}
                targetScale={targetScale}
                currentSlide={activeSlideMap[project.id] || 0}
                onPrevSlide={handlePrevSlide}
                onNextSlide={handleNextSlide}
                onOpenModal={handleOpenModal}
              />
            );
          })}
        </div>

      </div>

      {/* Full Resolution Photo Modal */}
      {selectedProject !== null && (
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedProjectIdx(null)}
        >
          <div 
            className="relative max-w-5xl w-full bg-slate-900 rounded-3xl border border-slate-700 p-4 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">
                  PROJECT {selectedProjectIdx !== null ? (selectedProjectIdx + 1 < 10 ? `0${selectedProjectIdx + 1}` : selectedProjectIdx + 1) : '01'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {selectedProject.title}
                </h3>
              </div>
              
              <button
                type="button"
                onClick={() => setSelectedProjectIdx(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            {modalImages.length > 0 && (
              <div className="relative w-full h-[360px] sm:h-[480px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                {modalImgLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs z-10 animate-in fade-in duration-150">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3 shadow-sm" />
                    <span className="text-xs font-mono text-slate-400">Loading image...</span>
                  </div>
                )}

                <img 
                  key={modalImages[selectedSlideIdx % modalImages.length]}
                  src={formatImageUrl(modalImages[selectedSlideIdx % modalImages.length], { size: 1400 })}
                  alt={selectedProject.title}
                  loading="eager"
                  decoding="async"
                  onLoad={() => setModalImgLoading(false)}
                  onError={(e) => {
                    setModalImgLoading(false);
                    const fallback = getDriveFallbackUrl(modalImages[selectedSlideIdx % modalImages.length]);
                    if (fallback && e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className={`max-h-full max-w-full object-contain cursor-pointer transition-opacity duration-300 ${modalImgLoading ? 'opacity-0' : 'opacity-100'}`}
                  title="Click to view full original resolution in new tab"
                  onClick={() => window.open(formatImageUrl(modalImages[selectedSlideIdx % modalImages.length], true), '_blank')}
                />

                {modalImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedSlideIdx(prev => (prev - 1 + modalImages.length) % modalImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white transition-all cursor-pointer shadow-xl z-20"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedSlideIdx(prev => (prev + 1) % modalImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white transition-all cursor-pointer shadow-xl z-20"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Modal Thumbnails Strip */}
            {modalImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                {modalImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSlideIdx(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      i === (selectedSlideIdx % modalImages.length)
                        ? 'border-blue-400 scale-105 shadow-md shadow-blue-500/20'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={formatImageUrl(img, { size: 200 })}
                      alt="thumbnail"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
