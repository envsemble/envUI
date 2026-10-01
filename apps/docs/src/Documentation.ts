import { foundations, references } from './Reference';

export const referenceViews = [
  { id: 'preview', title: 'Preview' },
  { id: 'guidelines', title: 'Guidelines' },
  { id: 'usage', title: 'Usage' },
] as const;
export type ReferenceView = (typeof referenceViews)[number]['id'];

export const referencePages = [
  ...foundations.map((reference) => ({
    reference,
    section: 'Foundations' as const,
    path: `foundations/${reference.id}`,
  })),
  ...references.map((reference) => ({
    reference,
    section: 'Components' as const,
    path: `components/${reference.id}`,
  })),
];
export type ReferencePage = (typeof referencePages)[number];

/** The reading order follows topics; reference tabs do not create extra destinations. */
export const documentationPages = [
  { path: 'overview', title: 'Overview' },
  { path: 'getting-started', title: 'Getting started' },
  ...referencePages
    .filter((page) => page.section === 'Foundations')
    .map((page) => ({ path: page.path, title: page.reference.title })),
  { path: 'components', title: 'Components' },
  ...referencePages
    .filter((page) => page.section === 'Components')
    .map((page) => ({ path: page.path, title: page.reference.title })),
];

export function findReferencePage(path: string) {
  return referencePages.find((page) => page.path === path.split('/').slice(0, 2).join('/'));
}

/** Keep downloaded references and old bookmarks working after topic consolidation. */
export function normalizeRoute(route: string): string {
  const [originalPath, ...query] = route.split('?');
  const path = originalPath
    .replace(/^components\/text(?=\/|$)/, 'foundations/typography')
    .replace(/^components\/notes(?=\/|$)/, 'components/disclosures');
  const page = findReferencePage(path);
  const requestedView = path.split('/')[2];
  const view = referenceViews.some((item) => item.id === requestedView) ? requestedView : 'preview';
  return `${page ? `${page.path}/${view}` : path}${query.length ? `?${query.join('?')}` : ''}`;
}
