import { foundations, references } from './Reference';

export const referenceViews = [
  { id: 'preview', title: 'Preview' },
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
  const search = new URLSearchParams(query.join('?'));
  if (originalPath === 'components') {
    search.set('section', 'overview-components');
    return `overview/preview?${search}`;
  }
  const path = originalPath
    .replace(/^components\/text(?=\/|$)/, 'foundations/typography')
    .replace(/^components\/notes(?=\/|$)/, 'components/disclosures')
    .replace(/^components\/icon-buttons(?=\/|$)/, 'components/buttons')
    .replace(/^components\/(input|textarea)(?=\/|$)/, 'components/fields')
    .replace(/^foundations\/responsive(?=\/|$)/, 'foundations/spacing')
    .replace(/^foundations\/motion(?=\/|$)/, 'foundations/accessibility');
  const page = findReferencePage(path);
  const root = path.split('/')[0];
  const isLandingPage = root === 'overview' || root === 'getting-started';
  const requestedView = path.split('/')[page ? 2 : 1];
  const defaultView = root === 'getting-started' && search.has('section') ? 'usage' : 'preview';
  const view =
    requestedView === 'guidelines'
      ? 'preview'
      : referenceViews.some((item) => item.id === requestedView)
        ? requestedView
        : defaultView;
  const destination = page ? `${page.path}/${view}` : isLandingPage ? `${root}/${view}` : path;
  return `${destination}${search.size ? `?${search}` : ''}`;
}
