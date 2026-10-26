import type { Publication } from '../types';

export const PUBLICATION_STATUSES = ['Published', 'Under Review', 'Submitted'] as const;

/** Older backups stored the workflow state in category, statusNote or venue. */
export function getPublicationStatus(paper: Partial<Publication>): NonNullable<Publication['publicationStatus']> {
  if (paper.publicationStatus && PUBLICATION_STATUSES.includes(paper.publicationStatus)) return paper.publicationStatus;
  for (const value of [paper.statusNote, paper.category, paper.venue]) {
    if (/^under review(?:ed)?$/i.test(value?.trim() || '')) return 'Under Review';
    if (/^submitted$/i.test(value?.trim() || '')) return 'Submitted';
  }
  return 'Published';
}

export function getPublicationType(paper: Partial<Publication>): Publication['category'] {
  return paper.category === 'Submitted' || paper.category === 'Under Review' ? 'Journal' : paper.category || 'Journal';
}
