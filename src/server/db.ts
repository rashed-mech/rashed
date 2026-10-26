import { readAdminCredentials, writeLocalAdminCredentials } from './adminEnvironment';
import fs from 'fs';
import path from 'path';
import { createMongoStore, type MongoPortfolioStore } from './mongoStore';
import { 
  PortfolioData, 
  Publication, 
  Project, 
  Experience, 
  Education, 
  SkillGroup, 
  Training, 
  Certification,
  Achievement,
  Affiliation,
  VolunteerEngagement,
  Reference,
  Message,
  ThemeUXConfig 
} from '../types';
import portfolioSeedData from '../../data/portfolio_db.json';
import { publicationStats } from '../utils/publicationStats';
import { getPublicationStatus } from '../utils/publicationStatus';

const DEFAULT_PORTFOLIO_DATA: PortfolioData = portfolioSeedData as unknown as PortfolioData;

export class PortfolioDatabase {
  private data: PortfolioData;
  private committedData: PortfolioData;
  private ready: Promise<void>;
  private mongoStore: MongoPortfolioStore | null;
  private localPath: string;

  constructor(localPath = path.resolve(process.cwd(), 'data', 'portfolio.local.json'), mongoStore: MongoPortfolioStore | null = createMongoStore()) {
    this.mongoStore = mongoStore;
    this.localPath = localPath;
    // Seed content is only a development fallback. MongoDB reads replace it before requests are accepted.
    this.data = this.mergeWithDefaults(structuredClone(DEFAULT_PORTFOLIO_DATA));
    this.committedData = structuredClone(this.data);
    this.ready = this.loadData();
    void this.ready.catch(() => {}); // Requests still await and report initialization failures.
  }

  // The chosen snapshot must finish loading before requests can mutate state.
  public async waitUntilReady(): Promise<void> {
    await this.ready;
  }

  public async refresh(): Promise<void> {
    // Let an in-progress initial read finish; a failed read can be retried here.
    await this.ready.catch(() => {});
    await this.flush();
    this.ready = this.loadData();
    await this.ready;
  }

  public getStorageInfo() {
    return this.mongoStore
      ? { type: 'mongodb', databaseId: this.mongoStore.settings.database, collection: 'portfolio', documentId: 'main' }
      : { type: process.env.NODE_ENV === 'production' ? 'unconfigured' : 'local-file' };
  }

  private mergeWithDefaults(parsed: PortfolioData): PortfolioData {
    return {
      ...DEFAULT_PORTFOLIO_DATA,
      ...parsed,
      profile: {
        ...DEFAULT_PORTFOLIO_DATA.profile,
        ...(parsed.profile || {}),
        stats: {
          ...DEFAULT_PORTFOLIO_DATA.profile.stats,
          ...(parsed.profile?.stats || {}),
          ...publicationStats(Array.isArray(parsed.publications) ? parsed.publications : DEFAULT_PORTFOLIO_DATA.publications)
        },
        social: {
          ...DEFAULT_PORTFOLIO_DATA.profile.social,
          ...(parsed.profile?.social || {})
        }
      },
      publications: Array.isArray(parsed.publications) ? parsed.publications : DEFAULT_PORTFOLIO_DATA.publications,
      pillars: Array.isArray(parsed.pillars) ? parsed.pillars : DEFAULT_PORTFOLIO_DATA.pillars,
      metrics: Array.isArray(parsed.metrics) ? parsed.metrics : DEFAULT_PORTFOLIO_DATA.metrics,
      projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_PORTFOLIO_DATA.projects,
      experience: Array.isArray(parsed.experience) ? parsed.experience : DEFAULT_PORTFOLIO_DATA.experience,
      education: Array.isArray(parsed.education) ? parsed.education : DEFAULT_PORTFOLIO_DATA.education,
      skillGroups: Array.isArray(parsed.skillGroups) ? parsed.skillGroups : DEFAULT_PORTFOLIO_DATA.skillGroups,
      trainings: Array.isArray(parsed.trainings) ? parsed.trainings : DEFAULT_PORTFOLIO_DATA.trainings,
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : DEFAULT_PORTFOLIO_DATA.certifications,
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : DEFAULT_PORTFOLIO_DATA.achievements,
      affiliations: Array.isArray(parsed.affiliations) ? parsed.affiliations : DEFAULT_PORTFOLIO_DATA.affiliations,
      volunteerWork: Array.isArray(parsed.volunteerWork) ? parsed.volunteerWork : DEFAULT_PORTFOLIO_DATA.volunteerWork,
      references: Array.isArray(parsed.references) ? parsed.references : DEFAULT_PORTFOLIO_DATA.references,
      messages: Array.isArray(parsed.messages) ? parsed.messages : (DEFAULT_PORTFOLIO_DATA.messages || []),
      sectionConfig: parsed.sectionConfig || DEFAULT_PORTFOLIO_DATA.sectionConfig,
      themeUX: parsed.themeUX || DEFAULT_PORTFOLIO_DATA.themeUX
    };
  }

  private async loadData(): Promise<void> {
    if (this.mongoStore) {
      const saved = await this.mongoStore.read();
      this.data = this.mergeWithDefaults(saved as PortfolioData);
      this.committedData = structuredClone(this.data);
      return;
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required for production. Configure MongoDB and run npm run db:migrate.');
    }
    if (fs.existsSync(this.localPath)) {
      const saved = JSON.parse(fs.readFileSync(this.localPath, 'utf8'));
      this.data = this.mergeWithDefaults(saved);
      this.committedData = structuredClone(this.data);
      Object.assign(this.committedData.profile.stats, saved.profile?.stats);
    }
  }

  private pendingWrite: Promise<void> = Promise.resolve();

  private sync() {
    Object.assign(this.data.profile.stats, publicationStats(this.data.publications));
    const snapshot = structuredClone(this.data);
    const previousWrite = this.pendingWrite;
    this.pendingWrite = previousWrite.then(async () => {
      if (this.mongoStore) {
        await this.mongoStore.writeChanges(snapshot, this.committedData);
      } else if (process.env.NODE_ENV !== 'production') {
        const temporaryPath = `${this.localPath}.tmp`;
        await fs.promises.writeFile(temporaryPath, JSON.stringify(snapshot), 'utf8');
        await fs.promises.rename(temporaryPath, this.localPath);
      } else {
        throw new Error('MONGODB_URI is required for production portfolio writes.');
      }
      this.committedData = snapshot;
    }).catch(error => {
      this.data = structuredClone(this.committedData);
      console.error('Portfolio save failed:', error);
      throw error;
    });
  }

  public async flush(): Promise<void> {
    const pending = this.pendingWrite;
    try {
      await pending;
    } finally {
      if (this.pendingWrite === pending) this.pendingWrite = Promise.resolve();
    }
  }
  public getFullData(): PortfolioData {
    const { profile, ...rest } = this.data;
    const safeProfile = { ...profile };
    if (safeProfile.logoUrl === 'chunked') {
      safeProfile.logoUrl = '';
    }
    if (safeProfile.logoUrl && safeProfile.logoUrl.startsWith('data:')) {
      safeProfile.logoUrl = '/api/portfolio/logo';
    }
    if (safeProfile.avatarUrl && safeProfile.avatarUrl.startsWith('data:')) {
      safeProfile.avatarUrl = '/api/portfolio/avatar';
    }
    return { ...rest, profile: safeProfile } as PortfolioData;
  }

  public getPublicData(): Omit<PortfolioData, 'messages' | 'adminConfig'> {
    const { messages, adminConfig, profile, ...rest } = this.data;
    const publicProfile = { ...profile };
    if (publicProfile.logoUrl === 'chunked') {
      publicProfile.logoUrl = '';
    }
    if (publicProfile.logoUrl && publicProfile.logoUrl.startsWith('data:')) {
      publicProfile.logoUrl = '/api/portfolio/logo';
    }
    if (publicProfile.avatarUrl && publicProfile.avatarUrl.startsWith('data:')) {
      publicProfile.avatarUrl = '/api/portfolio/avatar';
    }
    return { ...rest, profile: publicProfile };
  }

  public updateProfile(updatedProfile: Partial<PortfolioData['profile']>): PortfolioData['profile'] {
    if (updatedProfile.logoUrl === '/api/portfolio/logo') {
      delete updatedProfile.logoUrl;
    }
    if (updatedProfile.avatarUrl === '/api/portfolio/avatar') {
      delete updatedProfile.avatarUrl;
    }
    this.data.profile = {
      ...this.data.profile,
      ...updatedProfile,
      stats: {
        ...this.data.profile.stats,
        ...(updatedProfile.stats || {})
      },
      social: {
        ...this.data.profile.social,
        ...(updatedProfile.social || {})
      }
    };
    this.sync();
    return this.data.profile;
  }

  private getAdminCredentialsFromEnv(): { username: string; password: string } {
    return readAdminCredentials();
  }

  public getStorageDetails() {
    const credentials = readAdminCredentials();
    return {
      ...this.getStorageInfo(),
      location: this.mongoStore ? `${this.mongoStore.settings.database}.portfolio / document main` : process.env.NODE_ENV === 'production' ? 'MongoDB is not configured' : this.localPath,
      fallbackPath: path.resolve(process.cwd(), 'data', 'portfolio_db.json'),
      mongoConfigured: !!this.mongoStore,
      postgresConfigured: !!process.env.DATABASE_URL,
      postgresUsed: false,
      adminUsername: credentials.username,
      credentialSources: credentials.sources,
    };
  }

  public getAdminConfig() {
    const { username } = this.getAdminCredentialsFromEnv();
    return {
      username: username || 'admin',
      lastUpdated: new Date().toISOString()
    };
  }

  public verifyAdmin(username: string, passwordAttempt: string): boolean {
    const { username: expectedUsername, password: expectedPassword } = this.getAdminCredentialsFromEnv();

    if (!expectedUsername || !expectedPassword) {
      console.warn('[Auth] ADMIN_USERNAME or ADMIN_PASSWORD is not set in server variables or .env.local.');
      return false;
    }

    return expectedUsername.trim() === username.trim() && expectedPassword === passwordAttempt;
  }


  public updateSectionConfig(sectionConfig: any) {
    this.data.sectionConfig = sectionConfig;
    this.sync();
    return this.data.sectionConfig;
  }

  public updateThemeUX(themeUX: Partial<ThemeUXConfig>): ThemeUXConfig {
    this.data.themeUX = {
      ...(DEFAULT_PORTFOLIO_DATA.themeUX || {
        designPreset: 'modern-executive',
        cardRadius: 'rounded-2xl',
        fontContrast: 'pure-black',
        ambientGlow: true
      }),
      ...(this.data.themeUX || {}),
      ...themeUX
    };
    this.sync();
    return this.data.themeUX;
  }

  public updateAdminCredentials(username: string, passwordHashOrPlain?: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Change admin credentials in your hosting provider environment settings.');
    }

    writeLocalAdminCredentials(username, passwordHashOrPlain);
    process.env.ADMIN_USERNAME = username.trim();
    if (passwordHashOrPlain !== undefined) process.env.ADMIN_PASSWORD = passwordHashOrPlain;

    return true;
  }

  // --- Publications Operations ---
  public getPublications(): Publication[] {
    return this.data.publications;
  }

  public syncPublicationCitations(counts: Record<string, number>, scholarPapers: Array<Omit<Publication, 'id'>> = []): boolean {
    const normalize = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, '');
    let changed = false;
    for (const imported of scholarPapers) {
      const existing = this.data.publications.find(paper => normalize(paper.title) === normalize(imported.title));
      if (!existing) {
        this.data.publications.push({ ...imported, id: `pub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}` });
        changed = true;
      } else if (getPublicationStatus(existing) === 'Published') {
        // Scholar author/venue strings may be abbreviated. Fill gaps without
        // erasing fuller admin data, abstracts, review types, or saved order.
        for (const key of ['authors', 'venue', 'link', 'year'] as const) {
          if (!existing[key] && imported[key]) {
            Object.assign(existing, { [key]: imported[key] });
            changed = true;
          }
        }
      }
    }
    for (const paper of this.data.publications) {
      if (getPublicationStatus(paper) !== 'Published') continue;
      const count = counts[normalize(paper.title)];
      if (Number.isInteger(count) && count >= 0 && paper.citations !== count) {
        paper.citations = count;
        changed = true;
      }
    }
    // Also repair legacy snapshots whose profile total disagrees with the papers.
    const stats = publicationStats(this.data.publications);
    if (changed || this.committedData.profile.stats.citations !== stats.citations || this.committedData.profile.stats.hIndex !== stats.hIndex) {
      Object.assign(this.data.profile.stats, stats);
      this.sync();
      return true;
    }
    return false;
  }

  public addPublication(pub: Omit<Publication, 'id'>): Publication {
    const newPub: Publication = {
      ...pub,
      venue: pub.venue || '',
      publicationStatus: getPublicationStatus(pub),
      id: `pub-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.data.publications.unshift(newPub);
    this.sync();
    return newPub;
  }

  public reorderPublications(orderedIds: string[]): Publication[] {
    const papers = this.data.publications;
    if (orderedIds.length !== papers.length || new Set(orderedIds).size !== papers.length ||
        orderedIds.some(id => !papers.some(paper => paper.id === id))) {
      throw new Error('The publication list changed. Refresh before reordering.');
    }
    this.data.publications = orderedIds.map(id => papers.find(paper => paper.id === id)!);
    this.sync();
    return this.data.publications;
  }

  public updatePublication(id: string, updatedPub: Partial<Publication>): Publication | null {
    const idx = this.data.publications.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.publications[idx] = {
      ...this.data.publications[idx],
      ...updatedPub,
      id
    };
    this.sync();
    return this.data.publications[idx];
  }

  public deletePublication(id: string): boolean {
    const beforeLen = this.data.publications.length;
    this.data.publications = this.data.publications.filter(p => p.id !== id);
    const deleted = this.data.publications.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  public bulkImportPublications(
    newPubs: Array<Omit<Publication, 'id'> & { id?: string }>,
    options: { updateExisting?: boolean } = { updateExisting: true }
  ): { addedCount: number; updatedCount: number; publications: Publication[] } {
    let addedCount = 0;
    let updatedCount = 0;

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

    for (const item of newPubs) {
      if (!item.title || !item.title.trim()) continue;

      const normTitle = normalize(item.title);
      const cleanDoi = (item.doi || '').trim().toLowerCase();

      // Find existing match
      const existingIdx = this.data.publications.findIndex(p => {
        if (cleanDoi && p.doi && p.doi.trim().toLowerCase() === cleanDoi) {
          return true;
        }
        if (normalize(p.title) === normTitle) {
          return true;
        }
        return false;
      });

      if (existingIdx !== -1) {
        if (options.updateExisting) {
          const existing = this.data.publications[existingIdx];
          this.data.publications[existingIdx] = {
            ...existing,
            ...item,
            id: existing.id,
            // Keep existing tags / featured status if not specified
            featured: item.featured ?? existing.featured,
            tags: (item.tags && item.tags.length > 0) ? item.tags : existing.tags,
            citations: item.citations !== undefined ? item.citations : existing.citations,
            doi: item.doi || existing.doi,
            link: item.link || existing.link,
            pdfUrl: item.pdfUrl || existing.pdfUrl,
            abstract: item.abstract || existing.abstract,
            bibtex: item.bibtex || existing.bibtex
          };
          updatedCount++;
        }
      } else {
        // Insert new publication
        const newPub: Publication = {
          title: item.title,
          authors: item.authors || 'Unknown Authors',
          venue: item.venue || 'Academic Publication',
          year: item.year || new Date().getFullYear(),
          category: item.category || 'Journal',
          publicationStatus: item.publicationStatus || getPublicationStatus(item),
          doi: item.doi || '',
          link: item.link || '',
          pdfUrl: item.pdfUrl || '',
          abstract: item.abstract || '',
          citations: item.citations || 0,
          featured: !!item.featured,
          tags: item.tags || [],
          bibtex: item.bibtex || '',
          statusNote: item.statusNote || '',
          id: item.id || `pub-${Date.now()}-${Math.floor(Math.random() * 10000)}`
        };
        this.data.publications.unshift(newPub);
        addedCount++;
      }
    }

    this.sync();
    return {
      addedCount,
      updatedCount,
      publications: this.data.publications
    };
  }

  // --- Projects Operations ---
  public addProject(proj: Omit<Project, 'id'>): Project {
    const newProj: Project = {
      ...proj,
      id: `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.data.projects.unshift(newProj);
    this.sync();
    return newProj;
  }

  public updateProject(id: string, updatedProj: Partial<Project>): Project | null {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updatedProj,
      id
    };
    this.sync();
    return this.data.projects[idx];
  }

  public deleteProject(id: string): boolean {
    const beforeLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    const deleted = this.data.projects.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Experience Operations ---
  public addExperience(exp: Omit<Experience, 'id'>): Experience {
    const newExp: Experience = {
      ...exp,
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.data.experience.unshift(newExp);
    this.sync();
    return newExp;
  }

  public updateExperience(id: string, updatedExp: Partial<Experience>): Experience | null {
    const idx = this.data.experience.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.experience[idx] = {
      ...this.data.experience[idx],
      ...updatedExp,
      id
    };
    this.sync();
    return this.data.experience[idx];
  }

  public deleteExperience(id: string): boolean {
    const beforeLen = this.data.experience.length;
    this.data.experience = this.data.experience.filter(e => e.id !== id);
    const deleted = this.data.experience.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Education Operations ---
  public addEducation(edu: Omit<Education, 'id'>): Education {
    const newEdu: Education = {
      ...edu,
      id: `edu-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.data.education.unshift(newEdu);
    this.sync();
    return newEdu;
  }

  public updateEducation(id: string, updatedEdu: Partial<Education>): Education | null {
    const idx = this.data.education.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.education[idx] = {
      ...this.data.education[idx],
      ...updatedEdu,
      id
    };
    this.sync();
    return this.data.education[idx];
  }

  public deleteEducation(id: string): boolean {
    const beforeLen = this.data.education.length;
    this.data.education = this.data.education.filter(e => e.id !== id);
    const deleted = this.data.education.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Trainings Operations ---
  public getTrainings(): Training[] {
    return this.data.trainings || [];
  }

    public addCertification(cert: Omit<Certification, 'id'>): Certification {
    const newCert: Certification = {
      ...cert,
      id: `cert-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    if (!this.data.certifications) this.data.certifications = [];
    this.data.certifications.unshift(newCert);
    this.sync();
    return newCert;
  }

  
  public reorderTrainings(orderedIds: string[]): Training[] {
    if (!this.data.trainings) return [];
    
    const newOrder: Training[] = [];
    const currentMap = new Map(this.data.trainings.map(item => [item.id, item]));
    
    for (const id of orderedIds) {
      if (currentMap.has(id)) {
        newOrder.push(currentMap.get(id)!);
        currentMap.delete(id);
      }
    }
    
    // Add any remaining items not in orderedIds at the end
    for (const item of currentMap.values()) {
      newOrder.push(item);
    }
    
    this.data.trainings = newOrder;
    this.sync();
    return this.data.trainings;
  }

  
  public reorderExperiences(orderedIds: string[]): Experience[] {
    if (!this.data.experience) return [];
    
    const newOrder: Experience[] = [];
    const currentMap = new Map(this.data.experience.map(item => [item.id, item]));
    
    for (const id of orderedIds) {
      if (currentMap.has(id)) {
        newOrder.push(currentMap.get(id)!);
        currentMap.delete(id);
      }
    }
    
    // Add any remaining items not in orderedIds at the end
    for (const item of currentMap.values()) {
      newOrder.push(item);
    }
    
    this.data.experience = newOrder;
    this.sync();
    return this.data.experience;
  }

  
  public reorderEducations(orderedIds: string[]): Education[] {
    if (!this.data.education) return [];
    
    const newOrder: Education[] = [];
    const currentMap = new Map(this.data.education.map(item => [item.id, item]));
    
    for (const id of orderedIds) {
      if (currentMap.has(id)) {
        newOrder.push(currentMap.get(id)!);
        currentMap.delete(id);
      }
    }
    
    // Add any remaining items not in orderedIds at the end
    for (const item of currentMap.values()) {
      newOrder.push(item);
    }
    
    this.data.education = newOrder;
    this.sync();
    return this.data.education;
  }

  
  public reorderProjects(orderedIds: string[]): Project[] {
    if (!this.data.projects) return [];
    
    const newOrder: Project[] = [];
    const currentMap = new Map(this.data.projects.map(item => [item.id, item]));
    
    for (const id of orderedIds) {
      if (currentMap.has(id)) {
        newOrder.push(currentMap.get(id)!);
        currentMap.delete(id);
      }
    }
    
    // Add any remaining items not in orderedIds at the end
    for (const item of currentMap.values()) {
      newOrder.push(item);
    }
    
    this.data.projects = newOrder;
    this.sync();
    return this.data.projects;
  }

  public reorderCertifications(orderedIds: string[]): Certification[] {
    if (!this.data.certifications) return [];
    
    const newOrder: Certification[] = [];
    const currentMap = new Map(this.data.certifications.map(c => [c.id, c]));
    
    for (const id of orderedIds) {
      if (currentMap.has(id)) {
        newOrder.push(currentMap.get(id)!);
        currentMap.delete(id);
      }
    }
    
    for (const [_, cert] of currentMap) {
      newOrder.push(cert);
    }
    
    this.data.certifications = newOrder;
    this.sync();
    return this.data.certifications;
  }

  public updateCertification(id: string, certUpdates: Partial<Certification>): Certification | null {
    if (!this.data.certifications) return null;
    const idx = this.data.certifications.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.certifications[idx] = { ...this.data.certifications[idx], ...certUpdates };
    this.sync();
    return this.data.certifications[idx];
  }

  public deleteCertification(id: string): boolean {
    if (!this.data.certifications) return false;
    const beforeLen = this.data.certifications.length;
    this.data.certifications = this.data.certifications.filter(c => c.id !== id);
    const deleted = this.data.certifications.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  public addTraining(training: Omit<Training, 'id'>): Training {
    const newTr: Training = {
      ...training,
      id: `tr-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    if (!this.data.trainings) this.data.trainings = [];
    this.data.trainings.unshift(newTr);
    this.sync();
    return newTr;
  }

  public updateTraining(id: string, updatedTr: Partial<Training>): Training | null {
    if (!this.data.trainings) this.data.trainings = [];
    const idx = this.data.trainings.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.trainings[idx] = {
      ...this.data.trainings[idx],
      ...updatedTr,
      id
    };
    this.sync();
    return this.data.trainings[idx];
  }

  public deleteTraining(id: string): boolean {
    if (!this.data.trainings) return false;
    const beforeLen = this.data.trainings.length;
    this.data.trainings = this.data.trainings.filter(t => t.id !== id);
    const deleted = this.data.trainings.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Skills Operations ---

  public updatePillars(pillars: any[]) {
    this.data.pillars = pillars;
    this.sync();
    return this.data.pillars;
  }

  public updateMetrics(metrics: any[]) {
    this.data.metrics = metrics;
    this.sync();
    return this.data.metrics;
  }
  public updateSkillGroups(groups: SkillGroup[]): SkillGroup[] {
    this.data.skillGroups = groups.map((g, idx) => ({
      ...g,
      id: g.id || `sg-${idx + 1}-${Date.now()}`,
      skills: Array.isArray(g.skills) ? g.skills : []
    }));
    this.sync();
    return this.data.skillGroups;
  }

  // --- Messages Operations ---
  public getMessages(): Message[] {
    return this.data.messages;
  }

  public addMessage(msg: { name: string; email: string; subject: string; message: string }): Message {
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: msg.name.trim(),
      email: msg.email.trim(),
      subject: msg.subject.trim() || 'General Inquiry',
      message: msg.message.trim(),
      createdAt: new Date().toISOString(),
      read: false,
      replied: false
    };
    this.data.messages.unshift(newMsg);
    this.sync();
    return newMsg;
  }

  public toggleMessageRead(id: string): Message | null {
    const idx = this.data.messages.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.data.messages[idx].read = !this.data.messages[idx].read;
    this.sync();
    return this.data.messages[idx];
  }

  public deleteMessage(id: string): boolean {
    const beforeLen = this.data.messages.length;
    this.data.messages = this.data.messages.filter(m => m.id !== id);
    const deleted = this.data.messages.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Full DB Operations ---
  public resetToDefault(): PortfolioData {
    this.data = this.mergeWithDefaults(structuredClone(DEFAULT_PORTFOLIO_DATA));
    this.sync();
    return this.data;
  }

  // --- Honors & Activities Operations ---
  public updateReferences(references: Reference[]): Reference[] {
    this.data.references = references.map((r, idx) => ({ ...r, id: r.id || `ref-${Date.now()}-${idx}` }));
    this.sync();
    return this.data.references;
  }

  public updateVolunteerWork(volunteerWork: VolunteerEngagement[]): VolunteerEngagement[] {
    this.data.volunteerWork = volunteerWork.map((v, idx) => ({ ...v, id: v.id || `vol-${Date.now()}-${idx}` }));
    this.sync();
    return this.data.volunteerWork;
  }

  public updateAchievements(achievements: Achievement[]): Achievement[] {
    this.data.achievements = achievements.map((a, idx) => ({ ...a, id: a.id || `ach-${Date.now()}-${idx}` }));
    this.sync();
    return this.data.achievements;
  }

  public updateAffiliations(affiliations: Affiliation[]): Affiliation[] {
    this.data.affiliations = affiliations.map((a, idx) => ({ ...a, id: a.id || `aff-${Date.now()}-${idx}` }));
    this.sync();
    return this.data.affiliations;
  }

  public importDatabase(importedData: any): boolean {
    if (!importedData || typeof importedData !== 'object') {
      throw new Error('Invalid JSON structure');
    }
    if (!importedData.profile || !Array.isArray(importedData.publications)) {
      throw new Error('Missing essential profile or publications array');
    }
    this.data = this.mergeWithDefaults({
      ...importedData,
      adminConfig: this.data.adminConfig
    });
    this.sync();
    return true;
  }
}

export const db = new PortfolioDatabase();
