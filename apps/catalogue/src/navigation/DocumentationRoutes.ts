import {
  documents,
  foundations,
  references,
  type Documentation,
  type Reference,
} from '../Reference';
import type { TemplateSectionId } from '../DocumentationTypes';
import { homeRoute, routeHref } from './Address';

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

/** The sections of the catalogue's navigation, in order. */
export const siteSections = [
  'Get started',
  'Foundations',
  'Components',
  'Patterns',
  'Templates',
  'Contributing',
  'Changelog',
] as const;
export type SiteSection = (typeof siteSections)[number];

/** Pages of docs/ for people who change envUI itself, rather than use it. */
const contributingDocuments = new Set(['library-development', 'component-pages']);

/**
 * A page with one view: a guide or pattern of docs/, such as the migration guide, or a page of the
 * catalogue's own, such as the token reference. `document` is the page of docs/ it shows.
 */
export interface StandalonePage {
  path: string;
  title: string;
  section: SiteSection;
  summary?: string;
  document?: Documentation;
}

/**
 * The guides and patterns of docs/, each at a path of its section. The setup guide and the index
 * stay on the overview's Get started view.
 */
export const guidePages: StandalonePage[] = documents.flatMap((document): StandalonePage[] => {
  if (document.group === 'Patterns')
    return [
      {
        path: `patterns/${document.id}`,
        title: document.title,
        section: 'Patterns',
        summary: document.summary,
        document,
      },
    ];
  if (document.group !== 'Setup and workflows' || ['index', 'setup'].includes(document.id))
    return [];
  const section = contributingDocuments.has(document.id) ? 'Contributing' : 'Get started';
  const path = `${section === 'Contributing' ? 'contributing' : 'get-started'}/${document.id}`;
  return [{ path, title: document.title, section, summary: document.summary, document }];
});

/** The catalogue's own pages: the token reference, templates and the changelog. */
export const tokensPage: StandalonePage = {
  path: 'foundations/tokens',
  title: 'Design tokens',
  section: 'Foundations',
  summary:
    'Every token as a CSS custom property, with its value in each theme and scale, generated from the token source.',
};
export const templatesPage: StandalonePage = {
  path: 'templates',
  title: 'Templates',
  section: 'Templates',
  summary: 'Whole pages composed from envUI, to start an application from.',
};
export const changelogPage: StandalonePage = {
  path: 'changelog',
  title: 'Changelog',
  section: 'Changelog',
  summary: 'What changed in each release of @envsemble/envui.',
};
export const standalonePages: StandalonePage[] = [
  ...guidePages,
  tokensPage,
  templatesPage,
  changelogPage,
];

export function findStandalonePage(path: string) {
  return standalonePages.find((page) => page.path === path);
}

/** The single-view pages of a section, in the order of the navigation. */
export const pagesOf = (section: SiteSection) =>
  standalonePages
    .filter((page) => page.section === section)
    .map(({ path, title }) => ({ path, title, views: [] as readonly ViewOption[] }));

/**
 * The reading order, which the pager at the end of each page follows. Reference tabs do not create
 * extra destinations, and pages with one view have none.
 */
export const documentationPages: { path: string; title: string; views: readonly ViewOption[] }[] = [
  { path: 'overview', title: 'Overview', views: [] },
  ...pagesOf('Get started'),
  ...referencePages
    .filter((page) => page.section === 'Foundations')
    .map((page) => ({ path: page.path, title: page.reference.title, views: page.views })),
  ...pagesOf('Foundations'),
  ...referencePages
    .filter((page) => page.section === 'Components')
    .map((page) => ({ path: page.path, title: page.reference.title, views: page.views })),
  ...pagesOf('Patterns'),
  ...pagesOf('Templates'),
  ...pagesOf('Contributing'),
  ...pagesOf('Changelog'),
];

/** The view of a page on the template that shows the heading of id `anchor`, if it has one. */
export function viewOfHeading(reference: Reference, anchor: string): ReferenceView | undefined {
  const section = reference.sections?.find(({ anchors }) => anchors?.includes(anchor));
  return section && sectionViews[section.id];
}

/** The address of a page in the view a reader starts with, or the one closest to view. */
export function pageHref(page: ReferencePage, view?: string) {
  return routeHref(`${page.path}/${viewFor(page.reference, view)}`);
}

/**
 * The route of a page by its document id, such as `button`, or by a catalogue page's, such as
 * `tokens`, in `view` where the page has it, scrolled to the element `section`.
 */
export function routeOfDocument(
  id: string,
  { view, section }: { view?: string; section?: string } = {},
): string | undefined {
  const query = section ? `?${new URLSearchParams({ section })}` : '';
  const reference = referencePages.find((page) => page.reference.id === id);
  if (reference) {
    const start = reference.reference.sections ? 'overview' : 'preview';
    // A heading of a page on the template opens in the view that shows it.
    const shown = (section && viewOfHeading(reference.reference, section)) ?? view ?? start;
    return `${reference.path}/${viewFor(reference.reference, shown)}${query}`;
  }
  // The setup guide and the index are on the overview's Get started view, each in a section of its
  // own, where its headings are.
  if (id === 'setup' || id === 'index')
    return `overview/get-started?${new URLSearchParams({ section: section ?? (id === 'setup' ? 'setup' : 'documentation') })}`;
  if (id === 'overview') return homeRoute;
  if (id === 'tokens') return `${tokensPage.path}${query}`;
  if (id === 'templates') return templatesPage.path;
  if (id === 'changelog') return changelogPage.path;
  const guide = guidePages.find((page) => page.document?.id === id);
  return guide && `${guide.path}${query}`;
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
  // Guides and patterns were shown on the Get started view, by their document's id.
  const shown = search.get('document');
  if (originalPath === 'overview/get-started' && shown) {
    const guide = guidePages.find((page) => page.document?.id === shown);
    search.delete('document');
    if (guide) {
      search.delete('section');
      return `${guide.path}${search.size ? `?${search}` : ''}`;
    }
  }
  // A section's own address opens its first page.
  const rest = search.size ? `?${search}` : '';
  if (originalPath === 'get-started') return `overview/get-started${rest}`;
  const first = {
    foundations: referencePages[0].path,
    patterns: pagesOf('Patterns')[0]?.path,
    contributing: pagesOf('Contributing')[0]?.path,
  }[originalPath];
  if (first) return normalizeRoute(`${first}${rest}`);
  if (findStandalonePage(originalPath)) return `${originalPath}${rest}`;
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
  // A heading of a page on the template opens in the view that shows it, also from an old link
  // such as components/button#keyboard.
  const section = search.get('section');
  const shown = (page && section && viewOfHeading(page.reference, section)) || view;
  const destination = page ? `${page.path}/${viewFor(page.reference, shown)}` : path;
  return `${destination}${search.size ? `?${search}` : ''}`;
}
