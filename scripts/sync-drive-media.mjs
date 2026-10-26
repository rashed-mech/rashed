#!/usr/bin/env node
/**
 * Downloads every Google Drive image referenced by the portfolio into
 * public/media/ as WebP (a ~800px thumbnail and a ~1800px full version) and
 * writes src/media-manifest.json, which formatImageUrl() uses to serve the
 * local copy instead of hitting Google Drive at page load.
 *
 *   npm run media:sync                         # scans data/*.json
 *   npm run media:sync -- --from https://your-site/api/portfolio   # also scans live data
 *
 * Re-run after adding new Drive images in the admin panel, then redeploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mediaDir = path.join(root, 'public', 'media');
const manifestPath = path.join(root, 'src', 'media-manifest.json');
const DRIVE_ID = /(?:drive\.google\.com\/(?:file\/d\/|(?:open|uc|thumbnail)\?(?:[^&"]+&)*id=)|docs\.google\.com\/(?:file\/d\/|(?:open|uc)\?(?:[^&"]+&)*id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]{20,})/g;
// Served from the repo already (see formatUrl.ts).
const SKIP = new Set(['1uHdhS_9toIz1McR5Qn78qE2opogHWl5c', '1RsbjbZ3fzL7LmoMNWoQ8aimuNalcNT1H']);
const SIZES = { thumb: 800, full: 1800 };

const sources = [];
for (const file of ['data/portfolio_db.json', 'data/portfolio.local.json']) {
  const full = path.join(root, file);
  if (fs.existsSync(full)) sources.push(fs.readFileSync(full, 'utf8'));
}
const fromIdx = process.argv.indexOf('--from');
if (fromIdx > -1 && process.argv[fromIdx + 1]) {
  const url = process.argv[fromIdx + 1];
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    sources.push(await res.text());
    console.log(`Scanned live data from ${url}`);
  } catch (error) {
    console.warn(`Could not read ${url}: ${error.message}`);
  }
}

const ids = new Set();
for (const text of sources) for (const match of text.matchAll(DRIVE_ID)) if (!SKIP.has(match[1])) ids.add(match[1]);

fs.mkdirSync(mediaDir, { recursive: true });
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};

async function download(id, size, target) {
  if (fs.existsSync(target) && fs.statSync(target).size > 0) return 'cached';
  const urls = [
    `https://lh3.googleusercontent.com/d/${id}=w${size}-rw`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.startsWith('image/')) continue;
      fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
      return 'downloaded';
    } catch { /* try the next endpoint */ }
  }
  return 'failed';
}

let failed = 0;
const queue = [...ids];
async function worker() {
  while (queue.length) {
    const id = queue.shift();
    const entry = {};
    let ok = true;
    for (const [kind, size] of Object.entries(SIZES)) {
      const name = `${id}-${kind}.webp`;
      const result = await download(id, size, path.join(mediaDir, name));
      if (result === 'failed') ok = false;
      entry[kind] = `/media/${name}`;
    }
    if (ok) {
      manifest[id] = entry;
      console.log(`✓ ${id}`);
    } else {
      failed++;
      console.warn(`✗ ${id} (is the file shared as "Anyone with the link"?)`);
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${Object.keys(manifest).length} images available locally, ${failed} failed. Manifest: src/media-manifest.json`);
