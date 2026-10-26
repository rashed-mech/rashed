export interface FormatImageOptions {
  fullRes?: boolean;
  size?: number;
}

/**
 * Robustly extract Google Drive file ID from any Google Drive, Docs, or CDN URL variant.
 */
export function extractDriveFileId(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:drive\.google\.com\/(?:file\/d\/|(?:open|uc|thumbnail)\?(?:[^&]+&)*id=)|docs\.google\.com\/(?:file\/d\/|(?:open|uc)\?(?:[^&]+&)*id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/i
  );
  return match ? match[1] : null;
}

/**
 * Format image URLs for ultra-fast CDN delivery.
 * Uses Google's worldwide Edge CDN (lh3.googleusercontent.com) instead of drive.google.com,
 * avoiding slow 302 redirects, DNS delays, and Drive rate-limits.
 */
export function formatImageUrl(
  url: string | undefined, 
  options?: FormatImageOptions | boolean
): string | undefined {
  if (!url) return url;
  
  const trimmed = url.trim();
  if (trimmed === '/avatar.png' || trimmed === '/api/portfolio/avatar') {
    return trimmed;
  }
  if (trimmed === '/logo-circle.png' || trimmed === '/api/portfolio/logo') {
    return '/logo-circle.png';
  }

  const isFullRes = typeof options === 'boolean' ? options : !!options?.fullRes;
  const targetSize = typeof options === 'object' && options?.size ? options.size : 1200;

  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    // Known avatar drive link ID serves instantaneous local public avatar
    if (fileId === '1uHdhS_9toIz1McR5Qn78qE2opogHWl5c') {
      return '/avatar.png';
    }
    // Known logo drive link ID serves instantaneous local circular logo
    if (fileId === '1RsbjbZ3fzL7LmoMNWoQ8aimuNalcNT1H') {
      return '/logo-circle.png';
    }
    
    // High-speed Google Edge CDN (no 302 redirect latency!)
    if (isFullRes) {
      return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
    }
    return `https://lh3.googleusercontent.com/d/${fileId}=w${targetSize}`;
  }
  
  return trimmed;
}

/**
 * Fallback URL using Google thumbnail endpoint in case direct CDN is blocked by an intranet firewall.
 */
export function getDriveFallbackUrl(url: string | undefined): string | undefined {
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/**
 * Preloads a list of image URLs into browser cache in the background.
 */
export function preloadImages(urls: (string | undefined)[]): void {
  if (typeof window === 'undefined') return;
  urls.forEach(url => {
    if (!url) return;
    const formatted = formatImageUrl(url);
    if (!formatted) return;
    const img = new Image();
    img.src = formatted;
  });
}
