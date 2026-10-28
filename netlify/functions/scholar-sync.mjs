// Scheduled by Netlify (see `config` below). Refreshes citation counts from the Google Scholar
// profile in the background, so no visitor ever waits for or triggers a Scholar request.
// It calls the site's own /api/scholar/sync endpoint, which saves any changes to MongoDB.
export default async () => {
  const base = (process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || '').replace(/\/$/, '');
  if (!base) {
    console.error('[scholar-sync] No site URL available. Set SITE_URL (e.g. https://rashed-mech.netlify.app) in Netlify environment variables.');
    return;
  }
  try {
    const response = await fetch(`${base}/api/scholar/sync`, { method: 'POST', signal: AbortSignal.timeout(25_000) });
    const result = await response.json().catch(() => ({}));
    console.log(`[scholar-sync] HTTP ${response.status} synced=${result.synced} changed=${result.changed} message=${result.message ?? ''}`);
  } catch (err) {
    console.error('[scholar-sync] Failed:', err?.name, err?.message);
  }
};

export const config = { schedule: '@hourly' };
