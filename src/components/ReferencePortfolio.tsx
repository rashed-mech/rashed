import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowUp, ArrowLeft, ArrowRight, X, Menu, Linkedin, Mail, BookOpen, Download, Plus, Check } from 'lucide-react';
import type { PortfolioData, Project, Publication } from '../types';
import { formatImageUrl } from '../utils/formatUrl';
import { submitContactMessage } from '../api';
import '../reference-portfolio.css';

type WorkItem = { kind: 'project'; item: Project } | { kind: 'research'; item: Publication };
const externalUrl = (value?: string) => value && /^https?:\/\//i.test(value) ? value : undefined;
const publicationLink = (item: Publication) => externalUrl(item.link) || (item.doi ? `https://doi.org/${item.doi.replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')}` : undefined);

function Availability() { return <span className="ref-availability"><i />Open to collaboration</span>; }

function SectionHeading({ title, background, center = false }: { title: string; background: string; center?: boolean }) {
  return <div className={`ref-section-heading ${center ? 'centered' : ''}`} data-reveal><span aria-hidden="true">{background}</span><h2>/{title}</h2></div>;
}

function TechnicalCover({ label = 'MECHANICAL DESIGN', dark = false }: { label?: string; dark?: boolean }) {
  return <div className={`ref-technical-cover ${dark ? 'dark-cover' : ''}`}>
    <svg viewBox="0 0 440 280" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1">
      {[34, 52, 77, 92].map(radius => <ellipse key={radius} cx="220" cy="137" rx={radius * 1.3} ry={radius} transform="rotate(-25 220 137)" />)}
      {Array.from({ length: 18 }, (_, i) => { const a = i * Math.PI / 9; return <path key={i} d={`M${220 + Math.cos(a) * 54},${137 + Math.sin(a) * 42} L${220 + Math.cos(a + .2) * 112},${137 + Math.sin(a + .2) * 83}`} />; })}
      <path d="M35 230H405M55 225v10m325-10v10M55 47h77m-70-8v16M308 47h77m-7-8v16" opacity=".35" />
      <path d="M90 137h30m200 0h30M220 24v22m0 188v22" opacity=".35" />
    </g><text x="55" y="257" fill="currentColor" fontSize="8" letterSpacing="2">CONCEPT / DESIGN STUDY</text><text x="365" y="257" fill="currentColor" fontSize="8">01</text></svg>
    <span>{label}</span>
  </div>;
}

function WorkThumbnail({ work }: { work: WorkItem }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const image = work.kind === 'project' ? work.item.imageUrl || work.item.images?.[0] || work.item.galleryUrls?.[0] : undefined;
  return <div className="ref-thumbnail"><TechnicalCover dark={work.kind === 'research'} label={work.kind === 'research' ? 'RESEARCH / ENERGY SYSTEMS' : 'CAD / MECHANICAL DESIGN'} />
    {image && !failed && <img className={loaded ? 'loaded' : ''} src={formatImageUrl(image, { size: 900 })} alt={work.item.title} loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
  </div>;
}

function WorkDetails({ work, close }: { work: WorkItem; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [slide, setSlide] = useState(0);
  const images = work.kind === 'project' ? [...new Set([work.item.imageUrl, ...(work.item.images || []), ...(work.item.galleryUrls || [])].filter(Boolean))] : [];
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, []);
  return <dialog ref={dialog} className="ref-dialog" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }} aria-labelledby="work-detail-title">
    <div className="ref-detail-page"><div className="ref-detail-top"><button className="ref-pill" onClick={close}><ArrowLeft size={14} />Back</button><Availability /></div>
      <div className="ref-detail-label">{work.kind === 'project' ? work.item.category : `${work.item.category} · ${work.item.year}`}</div>
      <h2 id="work-detail-title">{work.item.title}</h2>
      <p className="ref-detail-description">{work.kind === 'project' ? work.item.description : work.item.authors}</p>
      <div className="ref-detail-links">
        {work.kind === 'project' ? <>{externalUrl(work.item.liveUrl) && <a className="ref-black-pill" href={work.item.liveUrl} target="_blank" rel="noreferrer">View project<ArrowUpRight size={14} /></a>}{externalUrl(work.item.githubUrl) && <a className="ref-pill" href={work.item.githubUrl} target="_blank" rel="noreferrer">Code / CAD<ArrowUpRight size={14} /></a>}</>
          : <>{publicationLink(work.item) && <a className="ref-black-pill" href={publicationLink(work.item)} target="_blank" rel="noreferrer">Read publication<ArrowUpRight size={14} /></a>}{externalUrl(work.item.pdfUrl) && <a className="ref-pill" href={work.item.pdfUrl} target="_blank" rel="noreferrer">PDF<Download size={14} /></a>}</>}
      </div>
      {images.length > 0 && <div className="ref-detail-gallery"><img src={formatImageUrl(images[slide], { size: 1400 })} alt={`${work.item.title}, image ${slide + 1}`} decoding="async" />{images.length > 1 && <div className="ref-gallery-controls"><button onClick={() => setSlide((slide - 1 + images.length) % images.length)} aria-label="Previous image"><ArrowLeft size={18} /></button><span>{slide + 1} / {images.length}</span><button onClick={() => setSlide((slide + 1) % images.length)} aria-label="Next image"><ArrowRight size={18} /></button></div>}</div>}
      <p className="ref-detail-body">{work.kind === 'project' ? work.item.fullDescription || work.item.description : work.item.abstract}</p>
      {work.kind === 'research' && <p className="ref-detail-venue">{work.item.venue} · {work.item.year}</p>}
      <div className="ref-tags">{(work.kind === 'project' ? work.item.technologies : work.item.tags).map((tag, index) => <span key={index}>{tag}</span>)}</div>
      <button className="ref-pill ref-detail-back" onClick={close}><ArrowLeft size={14} />Back to portfolio</button>
    </div>
  </dialog>;
}

export function ReferencePortfolio({ data, onSearch, onAdmin, isAdmin }: { data: PortfolioData; onSearch: () => void; onAdmin: () => void; isAdmin: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const lastWorkTrigger = useRef<HTMLButtonElement | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [filter, setFilter] = useState<'all' | 'project' | 'research'>('all');
  const [showAllWork, setShowAllWork] = useState(false);
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [service, setService] = useState<number | null>(null);
  const [expandedExperience, setExpandedExperience] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const [cvBusy, setCvBusy] = useState(false);
  const [cvError, setCvError] = useState('');
  const { profile, sectionConfig } = data;
  const visible = (id: keyof NonNullable<PortfolioData['sectionConfig']>) => sectionConfig?.[id]?.visible !== false;
  const names = profile.name.trim().split(/\s+/);
  const firstName = names.slice(0, -1).join(' ') || names[0];
  const lastName = names.length > 1 ? names[names.length - 1] : '';
  const publications = data.publications.filter(item => item.isVisible !== false);
  const featuredResearch = [...publications].sort((a, b) => Number(b.category === 'Journal') - Number(a.category === 'Journal'));
  const works: WorkItem[] = [
    ...(visible('projects') ? data.projects.map(item => ({ kind: 'project' as const, item })) : []),
    ...(visible('publications') ? featuredResearch.slice(0, showAllWork || filter === 'research' ? undefined : 2).map(item => ({ kind: 'research' as const, item })) : [])
  ];
  const filteredWorks = filter === 'all' ? works : works.filter(work => work.kind === filter);
  const services = data.pillars?.length ? data.pillars : [
    { title: 'Computational fluid dynamics', description: profile.researchInterestText || 'Simulation and analysis of flow, combustion, and heat transfer.', tag: 'CONVERGE · COMSOL · SolidWorks' }
  ];


  useEffect(() => {
    const node = root.current;
    if (!node || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.revealPlayed = 'true';
        const element = entry.target as HTMLElement;
        const heading = element.matches('.ref-section-heading');
        const stagger = Math.min(Array.from(element.parentElement?.children || []).indexOf(element), 5) * 45;
        element.animate([
          { opacity: .15, transform: heading ? 'translateY(32px)' : 'translateY(38px) scale(.98)' },
          { opacity: 1, transform: 'none' }
        ], { duration: heading ? 750 : 650, delay: Math.max(0, stagger), easing: 'cubic-bezier(.16,1,.3,1)' });
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px 110px 0px', threshold: .05 });
    node.querySelectorAll('[data-reveal], .ref-about-lead, .ref-story, .ref-metrics > div, .ref-service-row, .ref-toolbox, .ref-experience-row, .ref-education-row, .ref-credentials details, .ref-contact > h2, .ref-contact > p, .ref-contact > button, .ref-footer').forEach(element => {
      if (!(element as HTMLElement).dataset.revealPlayed) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [data, filter, showAllWork]);

  useEffect(() => {
    if (!mobileMenu) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileMenu(false); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [mobileMenu]);

  const openWork = (work: WorkItem, trigger?: HTMLButtonElement) => { if (trigger) lastWorkTrigger.current = trigger; setSelectedWork(work); };
  const closeWork = () => { setSelectedWork(null); requestAnimationFrame(() => lastWorkTrigger.current?.focus()); };
  const downloadCV = async () => {
    setCvBusy(true); setCvError('');
    try { await (await import('../utils/generateCV')).downloadCV(data); }
    catch { setCvError('The CV could not be generated. Please try again.'); }
    finally { setCvBusy(false); }
  };
  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSending(true); setFormError('');
    const form = new FormData(event.currentTarget);
    try { await submitContactMessage({ name: String(form.get('name')), email: String(form.get('email')), subject: String(form.get('subject')), message: String(form.get('message')) }); setSent(true); }
    catch (error) { setFormError(error instanceof Error ? error.message : 'Could not send your message. Please try again.'); }
    finally { setSending(false); }
  };
  const nav = [
    { label: 'Work', href: '#projects', count: data.projects.length, show: visible('projects') || visible('publications') },
    { label: 'Expertise', href: '#capabilities', count: services.length, show: visible('capabilities') },
    { label: 'Experience', href: '#experience', count: data.experience.length, show: visible('experience') },
    { label: 'Research', href: '#publications', count: publications.length, show: visible('publications') },
    { label: 'Contact', href: '#contact', show: visible('contact') }
  ].filter(item => item.show);

  return <div className="reference-portfolio" ref={root} id="public-portfolio-root">
    <a className="ref-skip-link" href="#ref-main">Skip to content</a>
    <div className="ref-shell">
      <header className="ref-header"><a href="#hero" className="ref-status-link" aria-label="Back to introduction"><Availability /></a><nav aria-label="Main navigation" className="ref-desktop-nav">{nav.map(item => <a key={item.href} href={item.href}>{item.label}{item.count !== undefined && <sup>[{item.count}]</sup>}</a>)}</nav>{visible('contact') && <a href="#contact" className="ref-black-pill">Let’s talk<ArrowUpRight size={15} /></a>}<button className="ref-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-expanded={mobileMenu} aria-controls="ref-mobile-nav" aria-label={mobileMenu ? 'Close navigation' : 'Open navigation'}>{mobileMenu ? <X size={21} /> : <Menu size={21} />}</button></header>
      {mobileMenu && <nav id="ref-mobile-nav" className="ref-mobile-nav" aria-label="Mobile navigation">{nav.map(item => <a key={item.href} href={item.href} onClick={() => setMobileMenu(false)}>{item.label}<ArrowUpRight size={16} /></a>)}</nav>}
      <main id="ref-main" tabIndex={-1}>
        {visible('hero') && <section id="hero" className="ref-hero">
          <h1 className="ref-name" aria-label={profile.name}><span>{firstName}</span><strong>{lastName}</strong></h1>
          <div className="ref-hero-body"><div className="ref-hero-intro"><h2>Mechanical Engineer</h2><p>Simulation-led engineering for cleaner energy systems, advanced materials, and practical mechanical design.</p><a className="ref-black-pill" href={visible('contact') ? '#contact' : '#projects'}>Let’s collaborate<ArrowUpRight size={15} /></a></div>
            <img className="ref-portrait" src="/reference/portrait-cutout.webp" alt={profile.name} width="850" height="900" fetchPriority="high" decoding="async" />
            <div className="ref-social-links">{externalUrl(profile.social.scholar) && <a className="ref-pill" href={profile.social.scholar} target="_blank" rel="noreferrer"><BookOpen size={14} />Google Scholar</a>}{externalUrl(profile.social.researchgate) && <a className="ref-pill" href={profile.social.researchgate} target="_blank" rel="noreferrer"><span className="ref-letter-icon">Rg</span>ResearchGate</a>}{externalUrl(profile.social.linkedin) && <a className="ref-pill" href={profile.social.linkedin} target="_blank" rel="noreferrer"><Linkedin size={14} />LinkedIn</a>}<button className="ref-pill" onClick={downloadCV} disabled={cvBusy}><Download size={14} />{cvBusy ? 'Preparing…' : 'Download CV'}</button>{cvError && <p className="ref-error" role="alert">{cvError}</p>}</div>
          </div>
        </section>}

        {(visible('projects') || visible('publications')) && <section id="projects" className="ref-work ref-section">
          <SectionHeading title="SELECTED WORK" background="PORTFOLIO" center />
          <div className="ref-work-toolbar"><div className="ref-tabs" role="group" aria-label="Filter selected work">{(['all', 'project', 'research'] as const).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'all' ? 'All' : value === 'project' ? 'Engineering' : 'Research'}</button>)}</div><button className="ref-pill" onClick={() => setShowAllWork(!showAllWork)}>{showAllWork ? 'Selected work' : 'View all work'}<ArrowUpRight size={14} /></button></div>
          <div className="ref-work-grid">{filteredWorks.map(work => <button key={`${work.kind}-${work.item.id}`} className="ref-work-card" onClick={event => openWork(work, event.currentTarget)} data-reveal>
            <div className="ref-work-image"><WorkThumbnail work={work} /><span className="ref-work-label">{work.kind === 'project' ? 'ENGINEERING PROJECT' : 'RESEARCH PAPER'}</span><span className="ref-work-arrow"><ArrowUpRight size={24} /></span></div>
            <h3>{work.item.title}</h3><div className="ref-tags"><span>{work.kind === 'project' ? work.item.category : work.item.category}</span><span>{work.kind === 'project' ? work.item.technologies[0] || 'Mechanical design' : work.item.year}</span></div>
          </button>)}</div>
          {!filteredWorks.length && <p className="ref-empty">No work in this category yet.</p>}
        </section>}

        {visible('overview') && <section id="overview" className="ref-about ref-section"><SectionHeading title="ABOUT" background="CURIOSITY" /><p className="ref-about-lead">{profile.researchInterestText || profile.aboutText[0]}</p><details className="ref-story"><summary>More about me<Plus size={17} /></summary>{profile.aboutText.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</details><div className="ref-metrics">{data.metrics?.map((metric, index) => <div key={index}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.sub}</small></div>)}</div></section>}

        {visible('capabilities') && <section id="capabilities" className="ref-services ref-section"><SectionHeading title="EXPERTISE" background="SERVICE" />
          <div className="ref-service-list">{services.map((item, index) => <div key={index} className={`ref-service-row ${service === index ? 'active' : ''}`}><button onClick={() => setService(service === index ? null : index)} aria-expanded={service === index} aria-controls={`service-description-${index}`}><span>{item.title.replace('Computation Fluid', 'Computational Fluid')}</span>{service === index ? <X size={26} /> : <ArrowUpRight size={26} />}</button><div className="ref-service-description" id={`service-description-${index}`} aria-hidden={service !== index}><div className="ref-service-inner"><p>{item.description}</p><small>{item.tag}</small><div className="ref-service-art" aria-hidden="true"><TechnicalCover label="ANALYZE / DESIGN / VALIDATE" dark /></div></div></div></div>)}</div>
          <details className="ref-toolbox"><summary>Tools & technical proficiencies<Plus size={18} /></summary><div>{data.skillGroups.map(group => <section key={group.id}><h3>{group.category}</h3><div className="ref-tags">{group.skills.map(skill => <span key={skill.id || skill.name}>{skill.name}</span>)}</div></section>)}</div></details>
        </section>}

        {visible('experience') && <section id="experience" className="ref-experience ref-section"><div className="ref-experience-header"><SectionHeading title="EXPERIENCE" background="EXPERIENCE" /><span>Engineering, research & learning</span></div>
          <div className="ref-experience-list">{data.experience.map(item => <div key={item.id} className="ref-experience-row"><button onClick={() => setExpandedExperience(expandedExperience === item.id ? null : item.id)} aria-expanded={expandedExperience === item.id}><div><h3>{item.organization}</h3><p>{item.role}</p></div><span>{item.period}<ArrowUpRight size={16} /></span></button>{expandedExperience === item.id && <div className="ref-experience-description"><p>{item.description}</p><ul>{item.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}</ul>{item.supervisors && <small>{item.supervisors}</small>}</div>}</div>)}
            {data.education.map(item => <div key={item.id} className="ref-education-row"><div><h3>{item.institution}</h3><p>{item.degree}</p></div><span>{item.year}</span></div>)}
          </div>
        </section>}

        {visible('publications') && <section id="publications" className="ref-research ref-section"><SectionHeading title="RESEARCH" background="DISCOVERY" /><p className="ref-section-description">Peer-reviewed work and ongoing investigations in energy, fluid dynamics, and materials.</p><div className="ref-research-list">{publications.map((item, index) => <button key={item.id} onClick={event => openWork({ kind: 'research', item }, event.currentTarget)} className="ref-research-row" data-reveal><span className="ref-row-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{item.title}</h3><p>{item.venue}</p></div><span className="ref-research-meta"><small>{item.category}</small>{item.year}<ArrowUpRight size={19} /></span></button>)}</div></section>}

        {(visible('trainings') || visible('honors')) && <section id="credentials" className="ref-credentials ref-section"><SectionHeading title="CREDENTIALS" background="GROWTH" />
          {visible('trainings') && <><details><summary>Certifications & training<span>{data.certifications.length + data.trainings.length}<Plus size={18} /></span></summary><div className="ref-credential-grid">{[...data.certifications, ...data.trainings].map(item => <div key={item.id}><h3>{item.title}</h3><p>{item.issuer} {item.year && `· ${item.year}`}</p>{'description' in item && item.description && <p>{item.description}</p>}{externalUrl(item.credentialUrl) && <a href={item.credentialUrl} target="_blank" rel="noreferrer">View credential<ArrowUpRight size={13} /></a>}</div>)}</div></details></>}
          {visible('honors') && <><details><summary>Honors & achievements<span>{data.achievements.length}<Plus size={18} /></span></summary><div className="ref-credential-grid">{data.achievements.map(item => <div key={item.id}><h3>{item.title}</h3><p>{item.description}</p></div>)}</div></details><details><summary>Community & affiliations<span>{data.affiliations.length + data.volunteerWork.length}<Plus size={18} /></span></summary><div className="ref-credential-grid">{[...data.affiliations, ...data.volunteerWork].map(item => <div key={item.id}><h3>{item.organization}</h3><p>{item.role}</p>{'description' in item && <p>{item.description}</p>}</div>)}</div></details><details><summary>Academic references<span>{data.references.length}<Plus size={18} /></span></summary><div className="ref-credential-grid">{data.references.map(item => <div key={item.id}><h3>{item.name}</h3><p>{item.designation || item.role}</p><p>{item.institution}</p>{item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}</div>)}</div></details></>}
        </section>}

        {visible('contact') && <section id="contact" className="ref-contact ref-section"><Availability /><h2>HAVE A PROJECT IN MIND?</h2><p>Let’s bring thoughtful engineering to your next challenge.<br />Connect to discuss research, simulation, or a meaningful collaboration.</p><button className="ref-black-pill" onClick={() => setContactOpen(!contactOpen)} aria-expanded={contactOpen} aria-controls="ref-contact-form">{contactOpen ? 'Close form' : 'Let’s talk'}{contactOpen ? <X size={15} /> : <ArrowUpRight size={15} />}</button>
          {contactOpen && <div id="ref-contact-form" className="ref-contact-form-wrap">{sent ? <div className="ref-contact-success" role="status"><Check size={25} /><h3>Thank you for reaching out.</h3><p>Your message has been saved. I’ll get back to you.</p><button className="ref-pill" onClick={() => setSent(false)}>Send another message</button></div> : <form onSubmit={sendMessage}><div className="ref-form-row"><label>Name<input name="name" required autoComplete="name" maxLength={100} /></label><label>Email<input type="email" name="email" required autoComplete="email" maxLength={254} /></label></div><label>Subject<input name="subject" required maxLength={160} /></label><label>Message<textarea name="message" required rows={4} maxLength={6000} /></label>{formError && <p className="ref-error" role="alert">{formError}</p>}<button className="ref-black-pill" disabled={sending}>{sending ? 'Sending…' : 'Send message'}<ArrowUpRight size={15} /></button></form>}</div>}
          <a className="ref-direct-email" href={`mailto:${profile.email}`}><Mail size={15} />{profile.email}</a>
        </section>}
      </main>
      <footer className="ref-footer"><a href="#hero">{profile.name.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())}<span>© {new Date().getFullYear()}</span></a><div><button onClick={onSearch}>Search · Ctrl K</button>{isAdmin && <button onClick={onAdmin}>Manage portfolio</button>}<a href="#hero" aria-label="Back to top"><ArrowUp size={16} /></a></div></footer>
    </div>
    {selectedWork && <WorkDetails key={`${selectedWork.kind}-${selectedWork.item.id}`} work={selectedWork} close={closeWork} />}
  </div>;
}
