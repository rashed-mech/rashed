import { getPublicationStatus, getPublicationType } from './publicationStatus.ts';
import type { PortfolioData, Reference } from '../types';

// Builds the CV as a pdfmake document that mirrors the hand-made Word CV:
// Times New Roman, centred header, 12pt section titles with a full-width rule, bold
// item headings with right-aligned italic dates and hollow sub-bullets.
// Content comes from the portfolio data so the CV follows portfolio edits.

// Reference DOCX section dimensions, converted from twips (20 twips = 1pt).
const PAGE_WIDTH = 595.5;
const MARGINS: [number, number, number, number] = [28.1, 28.8, 35.3, 28.8];
const CONTENT_WIDTH = PAGE_WIDTH - MARGINS[0] - MARGINS[2];
const LINK = { color: '#0000EE', decoration: 'underline' } as const;

const DEFAULT_OVERVIEW =
  'A highly driven Mechanical Engineering researcher and prospective PhD student specializing in Computational Fluid Dynamics (CFD) of biofuels, hydrogen combustion, and renewable energy structure. Backed by peer-reviewed international journal publications and credentials as a Certified SolidWorks Expert (CSWE), I leverage high-fidelity multiphysics modeling and advanced CAD to solve complex thermal-fluid, energy storage, molecular dynamics and clean energy engineering challenges.';

// The CV always carries references, even after they are hidden on the website.
const DEFAULT_REFERENCES: Reference[] = [
  { id: 'ref-1', name: 'Md. Rasel Ahmed', role: 'Lecturer', department: 'Department of Mechanical Engineering', organization: 'Rajshahi University of Engineering & Technology (RUET)', email: 'rasel@me.ruet.ac.bd', phone: '+880 1776 976 345' },
  { id: 'ref-2', name: 'KH. Nazmul Ahshan', role: 'Chairman and Assistant Professor', department: 'Department of Mechanical Engineering', organization: 'Hajee Mohammad Danesh Science & Technology University (HSTU)', email: 'nazmul.me@hstu.ac.bd', phone: '+880 1884 598 886' },
];

/** Reference formatting remains fixed as portfolio content grows. */
export interface CVFit {
  scale: number;
  gap: number;
  inlineModules: boolean;
  concise: boolean;
}

export const CV_FITS: CVFit[] = [
  { scale: 1, gap: 1, inlineModules: false, concise: false },
];

// cp1252 extras that the PDF's built-in Times font can draw besides Latin-1.
const WIN_ANSI_EXTRAS = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
const LOOKALIKES: Record<string, string> = { '‐': '-', '‑': '-', '‒': '-', '−': '-', '≤': '<=', '≥': '>=', '→': '->', '≈': '~', '′': "'", '″': '"' };

/** Keeps text within the characters the built-in Times font supports. */
const toWinAnsi = (text: string) =>
  Array.from(text).map(ch => {
    const code = ch.codePointAt(0)!;
    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_EXTRAS.includes(ch) || ch === '\n') return ch;
    return LOOKALIKES[ch] ?? '';
  }).join('');

const sanitize = (node: any): any => {
  if (typeof node === 'string') return toWinAnsi(node);
  if (Array.isArray(node)) return node.map(sanitize);
  if (node && typeof node === 'object') {
    const copy: any = {};
    for (const [key, value] of Object.entries(node)) copy[key] = key === 'text' || key === 'stack' || key === 'ul' || key === 'columns' ? sanitize(value) : value;
    return copy;
  }
  return node;
};

const live = <T extends { isLive?: boolean }>(items?: T[]) => (items || []).filter(item => item && item.isLive !== false);
const clean = (text?: string) => (text || '').replace(/\s+/g, ' ').trim();
const stripMarkdownLinks = (text?: string) => clean((text || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'));
const displayUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
const link = (text: string, url?: string, extra: object = {}) =>
  url ? { text, link: url, ...LINK, ...extra } : { text, ...extra };

/** "Hajee ... University (HSTU)" -> "HSTU"; names without an acronym stay whole. */
const shortName = (organization: string) => {
  const match = organization.match(/\(([A-Z][A-Z&.\s]{1,11})\)\s*$/);
  return match ? match[1].trim() : clean(organization);
};

const firstSentences = (text: string, count: number) => {
  const sentences = clean(text).match(/[^.!?]+[.!?]+(\s|$)/g);
  return sentences && sentences.length > count ? sentences.slice(0, count).join('').trim() : clean(text);
};

/** "Label: text" renders with a bold label, like the CV's sub-bullets. */
const labelled = (text: string) => {
  const match = text.match(/^([^:]{2,60}):\s*(.*)$/);
  return match ? [{ text: match[1], bold: true }, `: ${match[2]}`] : [text];
};

export function buildCVDocument(data: PortfolioData, siteUrl: string, fit: CVFit) {
  const { profile } = data;
  const s = fit.scale;
  const size = { title: 17 * s, heading: 12 * s, body: 10 * s, small: 9 * s };
  const gap = (n: number) => n * fit.gap;

  const section = (title: string) => [
    { text: title, bold: true, fontSize: size.heading, margin: [5.45, 0, 0, 0] },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_WIDTH - 5.45, y2: 0, lineWidth: 0.5 }], margin: [5.45, 1, 0, gap(2)] },
  ];

  const titleRow = (left: any, right: string, extra: object = {}, italicRight = true) => ({
    columns: [
      { text: left, width: '*' },
      { text: right || '', width: 'auto', alignment: 'right', italics: italicRight },
    ],
    columnGap: 8,
    ...extra,
  });

  // Paragraph/list spacing already belongs to each item; a second trailing
  // margin on every list cumulatively pushed the reference row to a new page.
  const bullets = (items: any[], extra: object = {}) => ({ ul: items, margin: [6, 0, 0, 0], ...extra });
  const subBullets = (items: any[]) => ({ ul: items, type: 'circle', fontSize: size.small, margin: [24, gap(1), 0, gap(2)] });
  const item = (content: any, margin = gap(2)) => ({ text: content, margin: [0, 0, 0, margin] });

  const content: any[] = [];

  // Header
  const portfolio = displayUrl(siteUrl);
  const linkedin = profile.social?.linkedin;
  content.push(
    { text: clean(profile.name).toUpperCase(), bold: true, fontSize: size.title, alignment: 'center', margin: [0, 6, 0, 3] },
    { text: [{ text: 'Address: ', bold: true }, clean(profile.location)], alignment: 'center', fontSize: size.small },
    {
      text: [
        { text: 'Personal portfolio: ', bold: true }, link(portfolio, siteUrl),
        profile.email ? { text: '  Email: ', bold: true } : '', profile.email ? link(profile.email, `mailto:${profile.email}`) : '',
        linkedin ? { text: '  LinkedIn: ', bold: true } : '', linkedin ? link(displayUrl(linkedin), linkedin) : '',
      ],
      alignment: 'center',
      fontSize: size.small,
      margin: [0, 1, 0, 1],
    },
    profile.phone ? { text: [{ text: 'Mobile: ', bold: true }, profile.phone], alignment: 'center', fontSize: size.small } : null,
  );

  // Overview
  content.push(...section('Overview'), {
    text: clean(profile.bio) || DEFAULT_OVERVIEW,
    alignment: 'justify',
    fontSize: size.small,
    margin: [5, 0, 0, 0],
  });

  // Education
  if (data.education?.length) {
    content.push(...section('Education'));
    data.education.forEach(edu => {
      const [resultLabel, resultValue] = (edu.result || '').includes(':')
        ? [edu.result!.split(':')[0] + ': ', edu.result!.split(':').slice(1).join(':').trim()]
        : ['', edu.result || ''];
      const details: any[] = [];
      if (edu.thesis) {
        const output = clean(edu.thesis).match(/^(.*?)\s*\(([^()]+)\)\.?$/);
        details.push({
          text: output
            ? [{ text: 'Dissertation', bold: true }, `: ${output[1]} `, { text: '(Output', italics: true }, `: ${output[2]})`]
            : labelled(`Dissertation: ${clean(edu.thesis)}`),
          alignment: 'justify',
        });
      }
      if (edu.advisor) details.push({ text: [{ text: 'Supervisor', bold: true }, `: ${stripMarkdownLinks(edu.advisor)}`] });
      const synopsis = clean(edu.synopsis || edu.description);
      if (synopsis) {
        details.push({ text: [{ text: 'Synopsis', bold: true }, `: ${fit.concise ? firstSentences(synopsis, 3) : synopsis}`], alignment: 'justify' });
      }
      content.push(
        bullets([
          [
            titleRow({ text: clean(edu.institution), bold: true }, edu.location || '', {}, false),
          ],
        ], { margin: [6, 0, 0, 0] }),
        titleRow(
          [clean(edu.degree), resultValue ? `; ${resultLabel}` : '', resultValue ? { text: resultValue, bold: true } : ''],
          edu.year,
          { italics: true, margin: [16, 1, 0, 0] },
        ),
        details.length ? subBullets(details) : null,
      );
    });
  }

  // Experience
  const experience = data.experience || [];
  if (experience.length) {
    content.push(...section('Experience'));
    experience.forEach((exp, index) => {
      const organizations = exp.organization.split('\n').map(clean).filter(Boolean);
      const supervisor = stripMarkdownLinks(exp.supervisors);
      const highlights = (exp.highlights || []).map(clean).filter(Boolean);
      content.push(
        bullets([{ text: organizations.map(shortName).join(' and '), bold: true }], { margin: [6, index ? gap(4) : 0, 0, 0] }),
        titleRow(`${clean(exp.role)}${supervisor ? ` (PI: ${supervisor})` : ''}`, exp.period, { italics: true, margin: [16, 1, 0, 0] }),
        highlights.length
          ? subBullets(highlights.map(h => ({ text: labelled(h) })))
          : exp.description
            ? { text: firstSentences(exp.description, fit.concise ? 1 : 2), fontSize: size.small, alignment: 'justify', margin: [24, gap(1), 0, gap(2)] }
            : null,
      );
    });
  }

  // Research interests
  const interests = clean(profile.researchInterestText) || (profile.researchInterests || []).join(', ');
  if (interests) {
    content.push(...section('Research Interests'), { text: interests, alignment: 'justify', fontSize: size.small, margin: [5, 0, 0, 0] });
  }

  // Skills summary: bold label column, values aligned like the CV's tab stop.
  // CV-specific presentation; leave the saved portfolio skill groups intact.
  const skillGroups = (data.skillGroups || []).flatMap(group => {
    if (/^Electrical\s*(?:&|and)\s*Maintenance$/i.test(clean(group.category))) return [];
    if (/^Programming\s*(?:&|and)\s*Soft Skills$/i.test(clean(group.category))) {
      const isProgramming = (skill: { name: string }) => /^(Python|MATLAB)\b/i.test(clean(skill.name));
      return [
        { ...group, category: 'Programming', skills: group.skills.filter(isProgramming) },
        { ...group, category: 'Soft Skills', skills: group.skills.filter(skill => !isProgramming(skill)) },
      ];
    }
    return [group];
  }).filter(group => group.skills?.length);
  if (skillGroups.length) {
    content.push(
      ...section('Skills Summary'),
      bullets(skillGroups.map(group => ({
        columns: [
          { text: `${clean(group.category)}:`, bold: true, width: 170 * s },
          { text: group.skills.map(skill => clean(skill.name)).join(', '), width: '*' },
        ],
        columnGap: 6,
        margin: [0, 0, 0, gap(1.5)],
      })), { fontSize: size.small }),
    );
  }

  // Publications follow the order saved in admin, including pending work.
  const publications = (data.publications || []).filter(pub => pub.isVisible !== false);
  if (publications.length) {
    const ordered = publications;
    content.push(
      ...section('Journal Publications/Under Peer-Review'),
      bullets(ordered.map(pub => {
        if (getPublicationStatus(pub) !== 'Published') {
          return item(['[', { text: `${getPublicationStatus(pub)} · ${getPublicationType(pub) === 'Review' ? 'Review Paper' : getPublicationType(pub)}`, italics: true }, ']- ', link(clean(pub.title), pub.link || undefined)]);
        }
        const venue = clean(pub.venue);
        const year = pub.year && !venue.includes(String(pub.year)) ? `, ${pub.year}` : '';
        const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : pub.link;
        return item([
          `${clean(pub.authors)}, "${clean(pub.title)}," `,
          { text: venue, italics: true },
          `${year}`,
          doiUrl ? ', doi: ' : '.',
          doiUrl ? link(pub.doi ? doiUrl : displayUrl(doiUrl), doiUrl) : '',
        ]);
      }), { fontSize: size.small, alignment: 'justify' }),
    );
  }

  // Undergraduate projects
  const projects = data.projects || [];
  if (projects.length) {
    content.push(
      ...section('Undergraduate Projects'),
      bullets(projects.map(project => item([
        { text: `${clean(project.title)}: `, bold: true },
        clean(project.description),
        !fit.concise && project.fullDescription ? ` ${clean(project.fullDescription)}` : '',
        project.date ? ` (${project.date})` : '',
      ])), { fontSize: size.small, alignment: 'justify' }),
    );
  }

  // Trainings
  const trainings = live(data.trainings);
  if (trainings.length) {
    content.push(
      ...section('Professional and Skill Trainings'),
      bullets(trainings.map(training => {
        const description = clean(training.description) || clean(training.issuer);
        return item([
          training.credentialUrl
            ? { text: clean(training.title), bold: true, color: '#0000EE', link: training.credentialUrl }
            : { text: clean(training.title), bold: true },
          description ? `: ${fit.concise ? firstSentences(description, 1) : description}` : '',
          training.year ? ` (${training.year})` : '',
        ]);
      }), { fontSize: size.small, alignment: 'justify' }),
    );
  }

  // Achievements
  const achievements = live(data.achievements);
  if (achievements.length) {
    content.push(
      ...section('Achievements and Awards'),
      bullets(achievements.map(award => item(
        [clean(award.title), award.organization ? `, ${clean(award.organization)}` : '', award.date || award.year ? ` - ${award.date || award.year}` : ''].join(''),
      )), { fontSize: size.small }),
    );
  }

  // Certifications read down the left column, then down the right column.
  const certifications = live(data.certifications as any[]);
  if (certifications.length) {
    const entries = certifications.map(cert => {
        const modules = (cert.modules || []).filter((module: any) => clean(module.title));
        const line = [
          cert.year ? `(${cert.year}) ` : '',
          link(clean(cert.title), cert.credentialUrl || undefined),
          cert.issuer ? ` (${clean(cert.issuer)})` : '',
        ];
        if (!modules.length) return item(line, gap(1.5));
        if (fit.inlineModules) {
          const inline: any[] = [' - '];
          modules.forEach((module: any, i: number) => inline.push(i ? ', ' : '', link(clean(module.title), module.credentialUrl || undefined)));
          return item([...line, ...inline], gap(1.5));
        }
        return {
          stack: [
            item(line, gap(0.5)),
            ...modules.map((module: any) => ({ text: ['- ', link(clean(module.title), module.credentialUrl || undefined)], margin: [8, 0, 0, gap(0.5)] })),
          ],
          margin: [0, 0, 0, gap(1)],
        };
      });
    // Balance by estimated wrapped lines so certificates with several modules
    // do not leave one column much longer than the other. Keep each entry whole.
    const lines = (text: string) => Math.max(1, Math.ceil(text.length / 58));
    const weights = certifications.map(cert =>
      lines([cert.year, clean(cert.title), clean(cert.issuer)].filter(Boolean).join(' ')) +
      (cert.modules || []).filter((module: any) => clean(module.title))
        .reduce((sum: number, module: any) => sum + lines(clean(module.title)), 0) + 0.5,
    );
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let split = 1;
    let left = 0;
    let difference = Infinity;
    weights.slice(0, -1).forEach((weight, index) => {
      left += weight;
      if (Math.abs(total - 2 * left) < difference) {
        difference = Math.abs(total - 2 * left);
        split = index + 1;
      }
    });
    content.push(...section('Certifications'), {
      columns: [
        { ...bullets(entries.slice(0, split)), width: '*' },
        entries.length > 1
          ? { ...bullets(entries.slice(split)), width: '*' }
          : { text: '', width: '*' },
      ],
      columnGap: 18,
      fontSize: size.small,
    });
  }

  // Affiliations
  const affiliations = live(data.affiliations);
  if (affiliations.length) {
    content.push(
      ...section('Relevant Affiliations'),
      bullets(affiliations.map(aff => item([
        { text: clean(aff.organization), bold: true },
        `: ${clean(aff.role)}`,
        aff.membershipId ? ` - Membership Id: ${aff.membershipId}` : '',
        aff.period ? ` (${aff.period})` : '',
      ])), { fontSize: size.small }),
    );
  }

  // Volunteer experience
  const volunteering = live(data.volunteerWork);
  if (volunteering.length) {
    content.push(
      ...section('Volunteer Experience'),
      bullets(volunteering.map(vol => ({
        stack: [
          titleRow({ text: clean(vol.title || [vol.role, vol.organization].filter(Boolean).join(', ')), bold: true }, vol.period || ''),
          vol.description ? { text: clean(vol.description), italics: true, margin: [0, 1, 0, 0] } : null,
        ].filter(Boolean),
        margin: [0, 0, 0, gap(2)],
      })), { fontSize: size.small }),
    );
  }

  // References: always printed, two per row.
  const references = (data.references || []).filter(ref => ref && ref.name);
  const refs = references.length ? references : DEFAULT_REFERENCES;
  const refBlock = (ref: Reference) => ({
    stack: [
      { text: clean(ref.name), bold: true },
      ref.designation || ref.role ? clean(ref.designation || ref.role) : null,
      ref.department || ref.organization || ref.institution
        ? [clean(ref.department), shortName(ref.organization || ref.institution || '')].filter(Boolean).join(', ')
        : null,
      ref.email ? { text: ['Email: ', link(ref.email, `mailto:${ref.email}`)] } : null,
      ref.phone ? `Mobile: ${ref.phone}` : null,
    ].filter(Boolean),
    width: '*',
  });
  content.push(...section('References'));
  for (let i = 0; i < refs.length; i += 2) {
    content.push({
      columns: [refBlock(refs[i]), refs[i + 1] ? refBlock(refs[i + 1]) : { text: '', width: '*' }],
      columnGap: 20,
      fontSize: size.small,
      margin: [8, i ? gap(4) : gap(2), 0, 0],
      unbreakable: true,
    });
  }

  return {
    pageSize: { width: PAGE_WIDTH, height: 842 },
    pageMargins: MARGINS,
    info: { title: `${clean(profile.name)} - CV`, author: clean(profile.name), subject: 'Curriculum Vitae' },
    // Word's single-spaced 9pt Times New Roman advances about 10.32pt.
    // pdfmake's font metrics require this factor; 1.15 produced 11.46pt.
    defaultStyle: { font: 'Times', fontSize: size.body, lineHeight: 1.035 },
    content: sanitize(content.filter(Boolean)),
  };
}

/**
 * Renders with the reference font sizes. Additional content flows onto new
 * pages instead of shrinking text or removing details to meet a page limit.
 * `render` turns a document definition into an output plus its page count.
 */
export async function fitCVDocument<T>(
  data: PortfolioData,
  siteUrl: string,
  render: (definition: any) => Promise<{ pages: number; output: T }>,
): Promise<{ pages: number; output: T }> {
  return render(buildCVDocument(data, siteUrl, CV_FITS[0]));
}
