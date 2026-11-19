import type { PortfolioData } from '../types';
import { downloadPdf } from './downloadResearchResume';

/**
 * Download CV: the uploaded PDF while the admin switch is on, otherwise a CV
 * generated from the current portfolio content. If the uploaded file cannot be
 * fetched, the generated CV is used so the button always works.
 */
export async function downloadPortfolioCV(data: PortfolioData): Promise<'uploaded' | 'generated'> {
  if (data.cvPdfEnabled && data.cvPdf) {
    try {
      await downloadPdf('/api/cv-pdf', data.cvPdf.fileName || 'CV.pdf');
      return 'uploaded';
    } catch {
      // Fall through to the generated CV.
    }
  }
  const { downloadCV } = await import('./generateCV');
  await downloadCV(data);
  return 'generated';
}
