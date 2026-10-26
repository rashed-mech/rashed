import '../../load-env.ts';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import * as cheerio from 'cheerio';
import { db as defaultDb, PortfolioDatabase } from './db.ts';
import type { Publication } from '../types';
import { PUBLICATION_STATUSES, getPublicationStatus } from '../utils/publicationStatus';
import { MongoStorageError } from './mongoStore';
import { validateResearchResume, resumeMetadata } from './researchResume';
import { 
  parseBibTeX, 
  scrapeGoogleScholar, 
  fetchSemanticScholarPapers, 
  fetchByDOI 
} from './academicImporter.ts';

// Stateless JWT auth. Unlike an in-memory session Map, this survives
// across different serverless function instances (Netlify/Vercel spin up
// many short-lived instances that do NOT share memory), so admin logins
// stay valid instead of randomly failing with "session expired" when a
// request lands on a different instance than the one that issued it.
const configuredJwtSecret = process.env.JWT_SECRET?.trim();
if (process.env.NODE_ENV === 'production' && (!configuredJwtSecret || configuredJwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
}
// A fresh secret keeps local development usable without a predictable signing key.
const JWT_SECRET = configuredJwtSecret && configuredJwtSecret.length >= 32
  ? configuredJwtSecret
  : randomBytes(32).toString('hex');

function generateToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
}

function authenticate(db: PortfolioDatabase, req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    if (decoded.username !== db.getAdminConfig().username) throw new Error('Admin identity changed');
    (req as any).user = { username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please log in again.' });
  }
}

// Builds and returns a fully configured Express app with every API route
// attached. Used by BOTH server.ts (local dev, calls app.listen) and the
// Netlify/Vercel function handlers (serverless, no app.listen) so the
// route logic only lives in one place.
export async function createApp(db: PortfolioDatabase = defaultDb, scholarLoader = loadScholarPage) {
  const app = express();
  const verifyAuth = (req: Request, res: Response, next: NextFunction) => authenticate(db, req, res, next);

  // Finish the chosen initial snapshot before accepting writes.
  // The database constructor already started the first MongoDB read; reuse it instead of reading twice on a cold start.
  await db.refreshIfStale(15_000);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Keep snapshot refreshes and writes in order within each server instance.
  // Every API response starts from saved storage, including warm serverless reads.
  let mutationQueue = Promise.resolve();
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api/')) return next();
    res.setHeader('Cache-Control', 'no-store');
    // Public reads do not need to wait behind writes, citation scrapes or each other,
    // and can reuse a recent MongoDB read (see refreshIfStale).
    const isPublicRead = req.method === 'GET' && !req.path.startsWith('/api/admin') && !req.path.startsWith('/api/auth');
    if (isPublicRead) {
      db.refreshIfStale(15_000).then(() => next()).catch(() => {
        res.status(503).json({ success: false, message: 'Saved portfolio data is unavailable. Please try again.' });
      });
      return;
    }
    const previous = mutationQueue;
    let release!: () => void;
    mutationQueue = new Promise<void>(resolve => { release = resolve; });
    previous.then(async () => {
      res.once('finish', release);
      res.once('close', release);
      await db.refresh();
      next();
    }).catch(() => {
      release();
      res.status(503).json({ success: false, message: 'Saved portfolio data is unavailable. Please try again.' });
    });
  });

  // A mutation only succeeds after its Firestore batch or local file is saved.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = ((body: any) => {
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return originalJson(body);
      db.flush()
        .then(() => originalJson(body))
        .catch((error) => {
          if (!res.headersSent) {
            const conflict = error instanceof MongoStorageError && error.code === 'conflict';
            res.status(conflict ? 409 : 503);
            originalJson({ success: false, message: conflict ? error.message : 'Changes could not be saved. Please try again.' });
          }
        });
      return res;
    }) as any;
    next();
  });

  // --- Public APIs ---
  app.get('/api/research-resume', (_req: Request, res: Response) => {
    const resume = db.getResearchResume();
    if (!resume?.dataBase64) return res.status(404).json({success:false, message:'The research resume is not available yet.'});
    const filename = resume.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const encodedFilename = encodeURIComponent(resume.fileName).replace(/['()*]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(Buffer.from(resume.dataBase64, 'base64'));
  });

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', storage: db.getStorageInfo(), timestamp: new Date().toISOString() });
  });

  // Get public portfolio content
  // Get public portfolio avatar (proxies Google Drive / external images or serves base64)
  app.get('/api/portfolio/avatar', async (req: Request, res: Response) => {
    try {
      const avatarUrl = (db as any).data?.profile?.avatarUrl;
      if (!avatarUrl) {
        return res.status(404).send('Avatar not found');
      }

      // If base64 data URL
      if (avatarUrl.startsWith('data:image/')) {
        const matches = avatarUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(404).send('Invalid image data');
        }
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);
      }

      // If Google Drive link, extract fileId and fetch image directly
      const driveMatch = avatarUrl.match(/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
      if (driveMatch && driveMatch[1]) {
        const fileId = driveMatch[1];
        const urlsToTry = [
          `https://lh3.googleusercontent.com/d/${fileId}=w1000`,
          `https://lh3.googleusercontent.com/d/${fileId}`,
          `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
          `https://drive.google.com/uc?export=view&id=${fileId}`
        ];
        for (const u of urlsToTry) {
          try {
            const resp = await fetch(u);
            if (resp.ok) {
              const contentType = resp.headers.get('content-type') || 'image/png';
              if (contentType.startsWith('image/')) {
                const buf = Buffer.from(await resp.arrayBuffer());
                res.setHeader('Content-Type', contentType);
                res.setHeader('Cache-Control', 'public, max-age=86400');
                return res.send(buf);
              }
            }
          } catch {}
        }
      }

      // If other external http/https image URL
      if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        try {
          const resp = await fetch(avatarUrl);
          if (resp.ok) {
            const contentType = resp.headers.get('content-type') || 'image/jpeg';
            if (contentType.startsWith('image/')) {
              const buf = Buffer.from(await resp.arrayBuffer());
              res.setHeader('Content-Type', contentType);
              res.setHeader('Cache-Control', 'public, max-age=86400');
              return res.send(buf);
            }
          }
        } catch {}
        return res.redirect(302, avatarUrl);
      }

      return res.status(404).send('Invalid image data');
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  app.get('/api/portfolio/logo', (req: Request, res: Response) => {
    try {
      const localLogoPath = path.join(process.cwd(), 'public', 'logo-circle.png');
      const fallbackLogoPath = path.join(process.cwd(), 'public', 'favicon.png');
      
      const fileToServe = fs.existsSync(localLogoPath) ? localLogoPath : (fs.existsSync(fallbackLogoPath) ? fallbackLogoPath : null);
      if (fileToServe) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(fileToServe);
      }

      const logoUrl = (db as any).data?.profile?.logoUrl;
      if (!logoUrl || logoUrl === 'chunked' || logoUrl === '/api/portfolio/logo') {
        return res.redirect(302, '/favicon.png');
      }

      if (logoUrl.startsWith('data:image/')) {
        const matches = logoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.send(buffer);
        }
      }

      return res.redirect(302, '/favicon.png');
    } catch (err: any) {
      res.redirect(302, '/favicon.png');
    }
  });

  app.get('/api/portfolio', async (req: Request, res: Response) => {
    try {
      await db.waitUntilReady();
      const data = db.getPublicData();
      // Browsers always revalidate, but the host CDN may serve the public copy for a
      // short time so visitors do not wake a serverless function and MongoDB each visit.
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Netlify-CDN-Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
      res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get publications list directly
  app.get('/api/publications', async (req: Request, res: Response) => {
    try {
      await db.waitUntilReady();
      const publications = db.getPublications();
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({ success: true, data: publications });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Public contact message submission
  app.post('/api/contact', (req: Request, res: Response) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
      }

      // Basic email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }

      const created = db.addMessage({ name, email, subject: subject || '', message });
      res.status(201).json({
        success: true,
        message: 'Your message has been delivered successfully. Thank you for reaching out!',
        data: created
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
      }

      const isValid = db.verifyAdmin(username, password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid username or password credentials.' });
      }

      const token = generateToken(username);
      res.json({
        success: true,
        token,
        user: { username, role: 'admin' },
        message: 'Authentication successful.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Auth: Verify token
  app.get('/api/auth/me', verifyAuth, (req: Request, res: Response) => {
    const session = (req as any).user;
    res.json({ success: true, user: { username: session.username, role: 'admin' } });
  });

  // Auth: Update credentials
  app.post('/api/auth/update-credentials', verifyAuth, (req: Request, res: Response) => {
    try {
      const { newUsername, newPassword } = req.body;
      if (!newUsername || newUsername.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long.' });
      }
      if (newPassword && newPassword.trim().length < 4) {
        return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long.' });
      }

      db.updateAdminCredentials(newUsername, newPassword);
      res.json({ success: true, message: 'Admin credentials updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // --- Scholar Sync API ---
  // Google Scholar blocks frequent automated requests, so every visitor shares one
  // cached copy of the profile page, and failures back off before retrying.

  app.get('/api/scholar/stats', (req: Request, res: Response) => {
    const { citations, hIndex } = db.getPublicData().profile.stats;
    res.json({ success: true, data: { citations, hIndex } });
  });

  // Compatibility for older clients: GET only returns saved counts, never writes.
  app.get('/api/scholar/sync', (req: Request, res: Response) => {
    const citationsMap: Record<string, number> = {};
    for (const paper of db.getPublications()) {
      citationsMap[paper.title.toLowerCase()] = paper.citations || 0;
      citationsMap[paper.title.toLowerCase().replace(/[^a-z0-9]/g, '')] = paper.citations || 0;
    }
    res.json({ success: true, data: citationsMap });
  });

  app.post('/api/scholar/sync', async (req: Request, res: Response) => {
    try {
      // Visitors can only refresh the owner's configured profile.
      const url = scholarProfileUrl(db.getPublicData().profile.social?.scholar);
      const result = url ? await scholarLoader(url) : { ok: false, html: '', message: 'No Scholar profile is configured.' };
      const counts: Record<string, number> = {};
      const scholarPapers: Array<Omit<Publication, 'id'>> = [];
      // A cached page must not roll back a newer manual edit in saved storage.
      if (result.ok && result.fresh !== false) {
        const $ = cheerio.load(result.html);
        $('.gsc_a_tr').each((_, el) => {
          const title = $(el).find('.gsc_a_at').text().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          const text = $(el).find('.gsc_a_ac').text().trim().replace(/,/g, '');
          // Scholar uses an empty citation cell for zero; malformed text is skipped.
          if (title && /^(\d+)?$/.test(text)) counts[title] = text ? Number(text) : 0;
          const name = $(el).find('.gsc_a_at').text().trim();
          const authors = $(el).find('.gs_gray').eq(0).text().trim();
          const venue = $(el).find('.gs_gray').eq(1).text().trim();
          const year = Number($(el).find('.gsc_a_y').text().trim());
          const href = $(el).find('a.gsc_a_at').attr('href');
          if (name && authors && venue && Number.isInteger(year) && year > 0) {
            scholarPapers.push({
              title: name, authors, venue, year, abstract: '', tags: [],
              category: /conference|proceedings|symposium/i.test(venue) ? 'Conference' : 'Journal',
              publicationStatus: 'Published', citations: counts[title] ?? 0,
              link: href ? new URL(href, 'https://scholar.google.com').href : '',
            });
          }
        });
      }
      // Repair the summary even when Scholar is blocked. Never clear unmatched papers.
      const changed = db.syncPublicationCitations(counts, scholarPapers);
      await db.flush();
      res.json({ success: true, synced: result.ok, changed, message: result.message, data: db.getPublicData() });
    } catch {
      res.status(503).json({ success: false, message: 'Citation updates could not be saved. Showing previously saved counts.' });
    }
  });

  // --- Protected Admin CRUD Endpoints ---
  app.get('/api/admin/research-resume', verifyAuth, (_req: Request, res: Response) => {
    res.json({success:true, data:resumeMetadata(db.getResearchResume())});
  });
  app.put('/api/admin/research-resume', verifyAuth, (req: Request, res: Response) => {
    try {
      const resume = validateResearchResume(req.body);
      res.json({success:true, data:db.saveResearchResume(resume)});
    } catch (error: any) {
      res.status(400).json({success:false, message:error.message});
    }
  });
  app.delete('/api/admin/research-resume', verifyAuth, (_req: Request, res: Response) => {
    db.saveResearchResume(null);
    res.json({success:true, data:null});
  });

  app.get('/api/admin/storage', verifyAuth, (_req: Request, res: Response) => {
    res.json({ success: true, data: db.getStorageDetails() });
  });

  app.get('/api/admin/data', verifyAuth, (req: Request, res: Response) => {
    try {
      const fullData = db.getFullData();
      res.json({ success: true, data: fullData });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Profile update
  app.put('/api/admin/profile', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateProfile(req.body);
      res.json({ success: true, data: updated, message: 'Profile information updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Publications CRUD
  app.put('/api/admin/publications/reorder', verifyAuth, async (req: Request, res: Response) => {
    if (!Array.isArray(req.body.orderedIds) || req.body.orderedIds.some((id: unknown) => typeof id !== 'string')) {
      return res.status(400).json({ success: false, message: 'An ordered list of publication IDs is required.' });
    }
    try {
      const papers = db.reorderPublications(req.body.orderedIds);
      await db.flush();
      res.json({ success: true, data: papers });
    } catch (error: any) {
      res.status(409).json({ success: false, message: error.message });
    }
  });

  app.post('/api/admin/publications', verifyAuth, (req: Request, res: Response) => {
    try {
      const { title, authors, venue, year, category } = req.body;
      if (!title || !authors || !year || !category || (getPublicationStatus(req.body) === 'Published' && !venue)) {
        return res.status(400).json({ success: false, message: 'Title, authors, year and paper type are required. Published papers also need a venue.' });
      }
      if (req.body.publicationStatus && !PUBLICATION_STATUSES.includes(req.body.publicationStatus)) return res.status(400).json({ success: false, message: 'Invalid publication status.' });
      const created = db.addPublication(req.body);
      res.status(201).json({ success: true, data: created, message: 'Publication created successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/publications/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      if (req.body.publicationStatus && !PUBLICATION_STATUSES.includes(req.body.publicationStatus)) return res.status(400).json({ success: false, message: 'Invalid publication status.' });
      const updated = db.updatePublication(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Publication not found.' });
      }
      res.json({ success: true, data: updated, message: 'Publication updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/publications/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deletePublication(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Publication not found.' });
      }
      res.json({ success: true, message: 'Publication deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Automated Publication Importer: Parse BibTeX
  app.post('/api/admin/publications/parse-bibtex', verifyAuth, (req: Request, res: Response) => {
    try {
      const { bibtex } = req.body;
      if (!bibtex || typeof bibtex !== 'string') {
        return res.status(400).json({ success: false, message: 'BibTeX string is required.' });
      }

      const parsed = parseBibTeX(bibtex);
      const existingPubs = db.getPublications();
      const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

      const enriched = parsed.map(item => {
        const normTitle = normalize(item.title);
        const cleanDoi = (item.doi || '').trim().toLowerCase();
        const existing = existingPubs.find(p => {
          if (cleanDoi && p.doi && p.doi.trim().toLowerCase() === cleanDoi) return true;
          return normalize(p.title) === normTitle;
        });

        return {
          ...item,
          tempId: `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          existsInDb: !!existing,
          existingId: existing ? existing.id : undefined
        };
      });

      res.json({
        success: true,
        count: enriched.length,
        data: enriched,
        message: `Parsed ${enriched.length} publications from BibTeX.`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Automated Publication Importer: Fetch from Academic Providers (Scholar / Semantic Scholar / DOI)
  app.post('/api/admin/publications/fetch-academic', verifyAuth, async (req: Request, res: Response) => {
    try {
      const { source, query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, message: 'Search query or URL is required.' });
      }

      let papers: any[] = [];
      let sourceName = source;
      let notes = '';

      if (source === 'scholar') {
        try {
          papers = await scrapeGoogleScholar(query);
          sourceName = 'Google Scholar Profile';
        } catch (scholarErr: any) {
          console.warn('Google Scholar direct scrape failed, attempting Semantic Scholar fallback:', scholarErr.message);
          // Try to extract author name from query if possible
          const fallbackResult = await fetchSemanticScholarPapers(query);
          papers = fallbackResult.papers;
          sourceName = 'Semantic Scholar (Scholar Scrape Fallback)';
          notes = 'Google Scholar rate-limited automated requests; automatically retrieved via Semantic Scholar Open API.';
        }
      } else if (source === 'semanticscholar') {
        const result = await fetchSemanticScholarPapers(query);
        papers = result.papers;
        sourceName = 'Semantic Scholar Graph API';
      } else if (source === 'doi') {
        // query could be comma or newline separated DOIs
        const dois = query.split(/[\n,;]+/).map(d => d.trim()).filter(Boolean);
        for (const singleDoi of dois) {
          try {
            const paper = await fetchByDOI(singleDoi);
            papers.push(paper);
          } catch (doiErr: any) {
            console.warn(`DOI fetch failed for ${singleDoi}:`, doiErr.message);
          }
        }
        sourceName = 'CrossRef / OpenAlex DOI Lookup';
      } else {
        return res.status(400).json({ success: false, message: 'Invalid source. Supported: scholar, semanticscholar, doi' });
      }

      const existingPubs = db.getPublications();
      const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

      const enriched = papers.map(item => {
        const normTitle = normalize(item.title);
        const cleanDoi = (item.doi || '').trim().toLowerCase();
        const existing = existingPubs.find(p => {
          if (cleanDoi && p.doi && p.doi.trim().toLowerCase() === cleanDoi) return true;
          return normalize(p.title) === normTitle;
        });

        return {
          ...item,
          tempId: `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          existsInDb: !!existing,
          existingId: existing ? existing.id : undefined
        };
      });

      res.json({
        success: true,
        source: sourceName,
        count: enriched.length,
        notes: notes || undefined,
        data: enriched,
        message: `Retrieved ${enriched.length} publications from ${sourceName}.`
      });
    } catch (err: any) {
      console.error('Fetch academic error:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch publications from academic source.' });
    }
  });

  // Automated Publication Importer: Bulk Import into Database
  app.post('/api/admin/publications/bulk-import', verifyAuth, (req: Request, res: Response) => {
    try {
      const { publications: itemsToImport, updateExisting = true } = req.body;
      if (!Array.isArray(itemsToImport) || itemsToImport.length === 0) {
        return res.status(400).json({ success: false, message: 'An array of publications is required.' });
      }

      const result = db.bulkImportPublications(itemsToImport, { updateExisting });
      res.json({
        success: true,
        data: result,
        message: `Successfully imported: ${result.addedCount} new papers added, ${result.updatedCount} existing papers updated.`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Projects CRUD
  app.post('/api/admin/projects', verifyAuth, (req: Request, res: Response) => {
    try {
      const { title, category, description } = req.body;
      if (!title || !category || !description) {
        return res.status(400).json({ success: false, message: 'Title, category, and description are required.' });
      }
      const created = db.addProject(req.body);
      res.status(201).json({ success: true, data: created, message: 'Project created successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/projects/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateProject(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
      res.json({ success: true, data: updated, message: 'Project updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/projects/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
      res.json({ success: true, message: 'Project deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Experience CRUD
  app.post('/api/admin/experience', verifyAuth, (req: Request, res: Response) => {
    try {
      const { role, organization, period, description } = req.body;
      if (!role || !organization || !period) {
        return res.status(400).json({ success: false, message: 'Role, organization, and period are required.' });
      }
      const created = db.addExperience(req.body);
      res.status(201).json({ success: true, data: created, message: 'Experience record added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/experience/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateExperience(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Experience not found.' });
      }
      res.json({ success: true, data: updated, message: 'Experience record updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/experience/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteExperience(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Experience not found.' });
      }
      res.json({ success: true, message: 'Experience record deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Education CRUD
  app.post('/api/admin/education', verifyAuth, (req: Request, res: Response) => {
    try {
      const { degree, institution, year } = req.body;
      if (!degree || !institution || !year) {
        return res.status(400).json({ success: false, message: 'Degree, institution, and year are required.' });
      }
      const created = db.addEducation(req.body);
      res.status(201).json({ success: true, data: created, message: 'Education record added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/education/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateEducation(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Education not found.' });
      }
      res.json({ success: true, data: updated, message: 'Education record updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/education/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteEducation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Education not found.' });
      }
      res.json({ success: true, message: 'Education record deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Training CRUD

  // Certifications API
  app.post('/api/admin/certifications', verifyAuth, (req, res) => {
    try {
      const { title, issuer, year } = req.body;
      if (!title || !issuer || !year) {
        return res.status(400).json({ success: false, message: 'Title, issuer, and year are required.' });
      }
      const created = db.addCertification(req.body);
      res.status(201).json({ success: true, data: created, message: 'Certification record added.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/certifications/reorder', verifyAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: 'orderedIds must be an array.' });
      }
      const reordered = db.reorderCertifications(orderedIds);
      res.json({ success: true, data: reordered, message: 'Certifications reordered successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/projects/reorder', verifyAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
      }
      const updated = db.reorderProjects(orderedIds);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.put('/api/admin/education/reorder', verifyAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
      }
      const updated = db.reorderEducations(orderedIds);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.put('/api/admin/experience/reorder', verifyAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
      }
      const updated = db.reorderExperiences(orderedIds);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.put('/api/admin/trainings/reorder', verifyAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
      }
      const updated = db.reorderTrainings(orderedIds);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.put('/api/admin/certifications/:id', verifyAuth, (req, res) => {
    try {
      const updated = db.updateCertification(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Certification record not found.' });
      }
      res.json({ success: true, data: updated, message: 'Certification record updated.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/certifications/:id', verifyAuth, (req, res) => {
    try {
      const deleted = db.deleteCertification(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Certification record not found.' });
      }
      res.json({ success: true, message: 'Certification record deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });


  app.post('/api/admin/section-config', verifyAuth, (req: Request, res: Response) => {
    try {
      const { sectionConfig } = req.body;
      db.updateSectionConfig(sectionConfig);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating section config:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  app.put('/api/admin/theme-ux', verifyAuth, (req: Request, res: Response) => {
    try {
      const { themeUX } = req.body;
      const updated = db.updateThemeUX(themeUX || {});
      res.json({ success: true, data: updated, message: 'Theme & UX configuration updated successfully.' });
    } catch (err: any) {
      console.error('Error updating Theme UX:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/admin/trainings', verifyAuth, (req: Request, res: Response) => {
    try {
      const { title, issuer, year } = req.body;
      if (!title || !issuer || !year) {
        return res.status(400).json({ success: false, message: 'Title, issuer, and year are required.' });
      }
      const created = db.addTraining(req.body);
      res.status(201).json({ success: true, data: created, message: 'Training record added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/trainings/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateTraining(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Training record not found.' });
      }
      res.json({ success: true, data: updated, message: 'Training record updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/trainings/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteTraining(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Training record not found.' });
      }
      res.json({ success: true, message: 'Training record deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });


  // Overview Updates
  app.put('/api/admin/pillars', verifyAuth, (req: Request, res: Response) => {
    try {
      const { pillars } = req.body;
      const updated = db.updatePillars(pillars || []);
      res.json({ success: true, data: updated, message: 'Pillars updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/metrics', verifyAuth, (req: Request, res: Response) => {
    try {
      const { metrics } = req.body;
      const updated = db.updateMetrics(metrics || []);
      res.json({ success: true, data: updated, message: 'Metrics updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  // Skills Group Update
  app.put('/api/admin/skills', verifyAuth, (req: Request, res: Response) => {
    try {
      const { skillGroups } = req.body;
      if (!Array.isArray(skillGroups)) {
        return res.status(400).json({ success: false, message: 'skillGroups array is required.' });
      }
      const updated = db.updateSkillGroups(skillGroups);
      res.json({ success: true, data: updated, message: 'Skills updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Honors & Activities Updates
  app.put('/api/admin/references', verifyAuth, (req: Request, res: Response) => {
    try {
      const { references } = req.body;
      const updated = db.updateReferences(references || []);
      res.json({ success: true, data: updated });
    } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
  });
  app.put('/api/admin/volunteerWork', verifyAuth, (req: Request, res: Response) => {
    try {
      const { volunteerWork } = req.body;
      const updated = db.updateVolunteerWork(volunteerWork || []);
      res.json({ success: true, data: updated });
    } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
  });
  app.put('/api/admin/achievements', verifyAuth, (req: Request, res: Response) => {
    try {
      const { achievements } = req.body;
      const updated = db.updateAchievements(achievements || []);
      res.json({ success: true, data: updated });
    } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
  });
  app.put('/api/admin/affiliations', verifyAuth, (req: Request, res: Response) => {
    try {
      const { affiliations } = req.body;
      const updated = db.updateAffiliations(affiliations || []);
      res.json({ success: true, data: updated });
    } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
  });

  // Messages Management
  app.get('/api/admin/messages', verifyAuth, (req: Request, res: Response) => {
    try {
      const messages = db.getMessages();
      res.json({ success: true, data: messages });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.patch('/api/admin/messages/:id/read', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.toggleMessageRead(req.params.id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Message not found.' });
      }
      res.json({ success: true, data: updated, message: 'Message status updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/messages/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteMessage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Message not found.' });
      }
      res.json({ success: true, message: 'Message deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Database Backup, Import, and Reset
  app.post('/api/admin/db/reset', verifyAuth, (req: Request, res: Response) => {
    try {
      const resetData = db.resetToDefault();
      res.json({ success: true, data: resetData, message: 'Database reset to default template state.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/admin/db/import', verifyAuth, (req: Request, res: Response) => {
    try {
      const imported = req.body;
      db.importDatabase(imported);
      res.json({ success: true, message: 'Database imported and restored successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: `Import error: ${err.message}` });
    }
  });

  // (Theme UX and Section Config routes are registered above — lines 809-829)

  return app;
}

// --- Google Scholar page cache ---
const SCHOLAR_CACHE_MS = 5 * 60 * 1000;
const SCHOLAR_RETRY_MS = 30 * 60 * 1000;
const SCHOLAR_TIMEOUT_MS = 8000;
const scholarCache = new Map<string, { html: string; fetchedAt: number }>();
const scholarFailures = new Map<string, { message: string; failedAt: number }>();
const scholarInFlight = new Map<string, Promise<string>>();

type ScholarPage = { ok: boolean; html: string; fresh?: boolean; message?: string };

/** Only public Google Scholar profile pages may be fetched through the server. */
function scholarProfileUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const url = new URL(raw);
    const isScholar = url.protocol === 'https:' && /^scholar\.google\.[a-z.]+$/.test(url.hostname) && url.pathname === '/citations';
    const user = url.searchParams.get('user');
    return isScholar && user ? `https://scholar.google.com/citations?user=${encodeURIComponent(user)}&hl=en&pagesize=100` : null;
  } catch {
    return null;
  }
}

async function loadScholarPage(raw: unknown): Promise<ScholarPage> {
  const url = scholarProfileUrl(raw);
  if (!url) return { ok: false, html: '', message: 'A Google Scholar profile URL is required.' };

  const cached = scholarCache.get(url);
  if (cached && Date.now() - cached.fetchedAt < SCHOLAR_CACHE_MS) return { ok: true, html: cached.html, fresh: false };

  const failure = scholarFailures.get(url);
  if (failure && Date.now() - failure.failedAt < SCHOLAR_RETRY_MS) {
    return cached ? { ok: true, html: cached.html, fresh: false } : { ok: false, html: '', message: failure.message };
  }

  try {
    let request = scholarInFlight.get(url);
    if (!request) {
      request = fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(SCHOLAR_TIMEOUT_MS),
      }).then(async response => {
        if (!response.ok) throw new Error(`Scholar responded with status ${response.status}`);
        return response.text();
      }).finally(() => scholarInFlight.delete(url));
      scholarInFlight.set(url, request);
    }
    const html = await request;
    scholarCache.set(url, { html, fetchedAt: Date.now() });
    scholarFailures.delete(url);
    return { ok: true, html, fresh: true };
  } catch (err: any) {
    const reason = err?.cause?.code || err?.name || err?.message || 'unknown error';
    const message = 'Google Scholar is unreachable right now; showing saved citation counts.';
    if (!scholarFailures.has(url)) {
      console.warn(`Scholar sync skipped (${reason}). Using saved citation counts; retrying in 30 minutes.`);
    }
    scholarFailures.set(url, { message, failedAt: Date.now() });
    return cached ? { ok: true, html: cached.html, fresh: false } : { ok: false, html: '', message };
  }
}
