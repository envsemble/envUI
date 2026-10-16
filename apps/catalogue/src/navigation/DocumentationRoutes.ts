import { foundations, references, type Reference } from '../Reference';
import type { TemplateSectionId } from '../DocumentationTypes';

/** The views of a page not yet on the template: live specimens and the Markdown guidance. */
export const referenceViews = [
  { id: 'preview', title: 'Preview' },
  { id: 'usage', title: 'Usage' },
] as const;
/** The views of a page on the template, each showing some of its sections. */
export const templateViews = [
  { id: 'overview', title: 'Overview' },
  { id: 'guidelines', title: 'Guidelines' },
  { id: 'accessibility', title: 'Accessibility' },
  { id: 'props', title: 'Props' },
] as const;
export type ReferenceView =
  | (typeof referenceViews)[number]['id']
  | (typeof templateViews)[number]['id'];
export type ViewOption = { id: ReferenceView; title: string };

/** Which template view shows each authored section; Props and Related are generated. */
export const sectionViews: Record<TemplateSectionId, ReferenceView> = {
  overview: 'overview',
  examples: 'overview',
  changelog: 'overview',
  anatomy: 'guidelines',
  variants: 'guidelines',
  states: 'guidelines',
  content: 'guidelines',
  'do-and-dont': 'guidelines',
  accessibility: 'accessibility',
};

/** The views a page has: the template's, where it has sections for them, or Preview and Usage. */
export function viewsOf(reference: Reference): readonly ViewOption[] {
  const sections = reference.sections;
  if (!sections) return referenceViews;
  return templateViews.filter(
    (view) =>
      view.id === 'overview' ||
      view.id === 'props' ||
      sections.some((section) => sectionViews[section.id] === view.id),
  );
}

/** The closest view of another kind of page, so a reader moving on stays on the same kind. */
const equivalentViews: Partial<Record<ReferenceView, ReferenceView>> = {
  preview: 'overview',
  usage: 'guidelines',
  overview: 'preview',
  guidelines: 'usage',
  accessibility: 'usage',
  props: 'usage',
};
export function viewFor(reference: Reference, requested?: string): ReferenceView {
  const views = viewsOf(reference);
  if (views.some((view) => view.id === requested)) return requested as ReferenceView;
  const equivalent = equivalentViews[requested as ReferenceView];
  if (views.some((view) => view.id === equivalent)) return equivalent!;
  return views[0].id;
}

export const overviewViews = [
  { id: 'components', title: 'Components' },
  { id: 'get-started', title: 'Get started' },
] as const;
export type OverviewView = (typeof overviewViews)[number]['id'];

export const referencePages = [
  ...foundations.map((reference) => ({
    reference,
    section: 'Foundations' as const,
    path: `foundations/${reference.id}`,
    views: viewsOf(reference),
  })),
  ...references.map((reference) => ({
    reference,
    section: 'Components' as const,
    path: `components/${reference.id}`,
    views: viewsOf(reference),
  })),
];
export type ReferencePage = (typeof referencePages)[number];

/** The reading order follows topics; reference tabs do not create extra destinations. */
export const documentationPages: { path: string; title: string; views: readonly ViewOption[] }[] = [
  { path: 'overview', title: 'Overview', views: [] },
  ...referencePages
    .filter((page) => page.section === 'Foundations')
    .map((page) => ({ path: page.path, title: page.reference.title, views: page.views })),
  ...referencePages
    .filter((page) => page.section === 'Components')
    .map((page) => ({ path: page.path, title: page.reference.title, views: page.views })),
];

/** The address of a page in the view a reader starts with, or the one closest to view. */
export function pageHref(page: ReferencePage, view?: string) {
  return `#/${page.path}/${viewFor(page.reference, view)}`;
}

export function findReferencePage(path: string) {
  return referencePages.find((page) => page.path === path.split('/').slice(0, 2).join('/'));
}

/** Keep downloaded references and old bookmarks working after topic consolidation. */
export function normalizeRoute(route: string): string {
  const [originalPath, ...query] = route.split('?');
  const search = new URLSearchParams(query.join('?'));
  if (originalPath === 'components') {
    search.set('section', 'overview-components');
    return `overview/components?${search}`;
  }
  if (/^getting-started(?:\/|$)/.test(originalPath)) {
    return `overview/get-started${search.size ? `?${search}` : ''}`;
  }
  if (/^overview(?:\/|$)/.test(originalPath)) {
    const requestedView = originalPath.split('/')[1];
    const view =
      requestedView === 'get-started' || requestedView === 'usage' ? 'get-started' : 'components';
    return `overview/${view}${search.size ? `?${search}` : ''}`;
  }
  const path = originalPath
    .replace(/^components\/text(?=\/|$)/, 'foundations/typography')
    .replace(/^components\/notes(?=\/|$)/, 'components/disclosure')
    .replace(/^components\/(icon-buttons|buttons)(?=\/|$)/, 'components/button')
    .replace(/^components\/badges(?=\/|$)/, 'components/badge')
    .replace(/^components\/tables(?=\/|$)/, 'components/table')
    .replace(/^components\/stats(?=\/|$)/, 'components/stat')
    .replace(/^components\/toasts(?=\/|$)/, 'components/toast')
    .replace(/^components\/dialogs(?=\/|$)/, 'components/dialog')
    .replace(/^components\/meters(?=\/|$)/, 'components/meter')
    .replace(/^components\/messages(?=\/|$)/, 'components/message')
    .replace(/^components\/cards(?=\/|$)/, 'components/card')
    .replace(/^components\/keyboard(?=\/|$)/, 'components/kbd')
    .replace(/^components\/layout(?=\/|$)/, 'components/stack')
    .replace(/^components\/loading(?=\/|$)/, 'components/skeleton')
    .replace(/^components\/markdown-editor(?=\/|$)/, 'components/markdown')
    .replace(/^components\/(input|textarea)(?=\/|$)/, 'components/text-field')
    .replace(/^components\/fields(?=\/|$)/, 'components/text-field')
    .replace(/^components\/date-time-field(?=\/|$)/, 'components/date-picker')
    .replace(/^components\/file-dropzone(?=\/|$)/, 'components/drop-zone')
    .replace(/^components\/disclosures(?=\/|$)/, 'components/disclosure')
    .replace(/^components\/notices(?=\/|$)/, 'components/alert')
    .replace(/^components\/heatmap(?=\/|$)/, 'components/calendar-heatmap')
    .replace(/^components\/rows(?=\/|$)/, 'components/list')
    .replace(/^components\/navigation(?=\/|$)/, 'components/nav-list')
    .replace(/^components\/direction-links(?=\/|$)/, 'components/pager')
    .replace(/^foundations\/responsive(?=\/|$)/, 'foundations/spacing')
    .replace(/^foundations\/motion(?=\/|$)/, 'foundations/accessibility');
  const page = findReferencePage(path);
  const requested = path.split('/')[2];
  // Before the template, Guidelines was the name of what is now a page's Preview.
  const view = requested === 'guidelines' && !page?.reference.sections ? 'preview' : requested;
  const destination = page ? `${page.path}/${viewFor(page.reference, view)}` : path;
  return `${destination}${search.size ? `?${search}` : ''}`;
}
