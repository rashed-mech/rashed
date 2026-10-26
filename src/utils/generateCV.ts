import * as pdfMakeModule from 'pdfmake/build/pdfmake';
import { PortfolioData } from '../types';
import { fitCVDocument } from './cvDocument';

// Production URL known at build time (VITE_SITE_URL, Netlify's URL or Vercel's production URL).
declare const __SITE_URL__: string | undefined;

const FALLBACK_SITE_URL = 'https://rashed-mecha.netlify.app';

const pdfMake: any = pdfMakeModule && (pdfMakeModule as any).default ? (pdfMakeModule as any).default : pdfMakeModule;
// Times New Roman, from the font files in src/fonts (copied from C:\Windows\Fonts).
const fontFiles = import.meta.glob('../fonts/*.{ttf,TTF}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const fontUrl = (name: string) => {
  const match = Object.keys(fontFiles).find(path => path.toLowerCase().endsWith(`/${name}`));
  return match ? new URL(fontFiles[match], window.location.origin).href : '';
};
const timesNewRoman = {
  normal: fontUrl('times.ttf'),
  bold: fontUrl('timesbd.ttf'),
  italics: fontUrl('timesi.ttf'),
  bolditalics: fontUrl('timesbi.ttf'),
};

if (!Object.values(timesNewRoman).every(Boolean)) {
  throw new Error('The CV requires all four Times New Roman font files.');
}
pdfMake.fonts = { Times: timesNewRoman };

const isPublicHost = (hostname: string) =>
  !/^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname) &&
  hostname !== '[::1]' &&
  !hostname.endsWith('.local') &&
  // Netlify deploy previews / branch deploys and Vercel preview URLs.
  !hostname.includes('--') &&
  !/-git-.*\.vercel\.app$/.test(hostname);

/** The live website address printed in the CV header. */
export const resolveSiteUrl = () => {
  const configured = (import.meta as any).env?.VITE_SITE_URL as string | undefined;
  if (configured) return configured.replace(/\/$/, '');
  if (isPublicHost(window.location.hostname)) return window.location.origin;
  const built = typeof __SITE_URL__ === 'string' ? __SITE_URL__ : '';
  return (built || FALLBACK_SITE_URL).replace(/\/$/, '');
};

const renderPdf = async (definition: any) => {
  let pages = 0;
  const output = pdfMake.createPdf({
    ...definition,
    footer: (_page: number, pageCount: number) => {
      pages = pageCount;
      return null;
    },
  });
  await output.getBuffer();
  return { pages, output };
};

export const downloadCV = async (data: PortfolioData) => {
  const { output } = await fitCVDocument(data, resolveSiteUrl(), renderPdf);
  const name = (data.profile.name || 'CV').trim().replace(/\s+/g, '_');
  return output.download(`${name}_CV.pdf`);
};
