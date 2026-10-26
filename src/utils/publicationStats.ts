import type { Publication } from '../types';

/** The saved paper counts are the source of truth for the portfolio summary. */
export function publicationStats(publications: Pick<Publication, 'citations'>[]) {
  const counts = publications.map(paper => {
    const count = Number(paper.citations);
    return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  }).sort((a, b) => b - a);
  return {
    citations: counts.reduce((total, count) => total + count, 0),
    hIndex: counts.filter((count, index) => count >= index + 1).length
  };
}
