import {
  componentGroups,
  documents,
  foundations,
  componentDocuments,
  type DocumentSummary,
  type GroupedDocument,
} from '../pages/PageModel';
import { docsRoute, homeRoute, routeHref } from './Address';

/**
 * The two parts of the site: the catalogue, at the root, shows envUI to people, what each part
 * looks like and when to use it, and the Docs, under /docs, are the developer reference.
 */
export type Area = 'catalogue' | 'docs';

/**
 * The catalogue's destinations in its rail, in order; the drawer beside it lists their pages. Dev
 * mode and the changelog are in the Docs.
 */
export const catalogueSections = ['Overview', 'Foundations', 'Components', 'Patterns'] as const;
export type CatalogueSection = (typeof catalogueSections)[number];

/** What a page shows from docs/, which decides how it renders: each has its document. */
type DocumentKind =
  'component' | 'pattern' | 'foundation' | 'guide' | 'foundation-guide' | 'reference';

/** What a page of the site's own shows, with no document: a home, a gallery, the tokens, the changelog. */
type OwnKind = 'home' | 'foundations' | 'components' | 'patterns' | 'docs-changelog' | 'tokens';

/** What a page shows, which decides how it renders. */
export type PageKind = DocumentKind | OwnKind;

/** One page of the catalogue or the Docs of a kind, at the route `path`. */
export type PageOfKind<Kind extends PageKind> = {
  path: string;
  title: string;
  /** The page's name in the navigation, where it differs from its title. */
  label?: string;
  area: Area;
  /**
   * The catalogue's rail destination the page belongs to, or the top-level group of the Docs'
   * navigation, such as Guides or Components.
   */
  section: string;
  /**
   * The group the page is listed in within its section: in the catalogue's drawer a heading, such
   * as a kind of component, and in the Docs' navigation a section that opens and closes.
   */
  group?: string;
  kind: Kind;
  summary?: string;
} & (Kind extends DocumentKind
  ? {
      /** The page of docs/ the page shows. */
      document: DocumentSummary;
    }
  : { document?: undefined });

/** One page of the catalogue or the Docs; its kind says whether it shows a page of docs/. */
export type RoutePage = { [Kind in PageKind]: PageOfKind<Kind> }[PageKind];

/** A page that shows a page of docs/. */
export type DocumentPage = PageOfKind<DocumentKind>;

/**
 * A component or foundation page of docs/ with the page that shows it: the catalogue's, or for
 * Field, which has no page in the catalogue, its page in the Docs.
 */
interface GroupedPage {
  document: GroupedDocument;
  section: 'Foundations' | 'Components';
  path: string;
}

/** Field is documented in the Docs only, as "Build your own field". */
const docsOnlyComponents = new Set(['field']);

/** Pages of docs/ that neither the catalogue nor the Docs show: the agents' index of the pages. */
const unlistedDocuments = new Set(['index']);

/** The component and foundation pages, each at the address of the page that shows it. */
export const groupedPages: GroupedPage[] = [
  ...foundations.map((document) => ({
    document,
    section: 'Foundations' as const,
    path: `foundations/${document.id}`,
  })),
  ...componentDocuments.map((document) => ({
    document,
    section: 'Components' as const,
    path: docsOnlyComponents.has(document.id)
      ? `docs/components/${document.id}`
      : `components/${document.id}`,
  })),
];

/** The address of a component or foundation page. */
export const pageHref = (page: GroupedPage) => routeHref(page.path);

/**
 * The route of a component's page in the Docs: its guide to using it in code, then its props, part
 * names and changelog.
 */
export const componentDocsRoute = (id: string) => `docs/components/${id}`;

/** The route of a pattern's page in the Docs: its guide to building it in code. */
export const patternDocsRoute = (id: string) => `docs/patterns/${id}`;

/** The route of a foundation's guide in the Docs: its written guidance and reference. */
export const foundationDocsRoute = (id: string) => `docs/foundations/${id}`;

const patternDocuments = documents.filter((document) => document.group === 'Patterns');
const guideDocuments = documents.filter(
  (document) => document.group === 'Setup and workflows' && !unlistedDocuments.has(document.id),
);

const cataloguePages: RoutePage[] = [
  {
    path: homeRoute,
    title: 'envUI',
    label: 'Introduction',
    area: 'catalogue',
    section: 'Overview',
    kind: 'home',
  },
  {
    path: 'foundations',
    title: 'Foundations',
    label: 'All foundations',
    area: 'catalogue',
    section: 'Foundations',
    kind: 'foundations',
    summary: 'What every screen built with envUI shares, beneath its components.',
  },
  ...groupedPages
    .filter(({ section }) => section === 'Foundations')
    .map(({ document, path }): RoutePage => ({
      path,
      title: document.title,
      area: 'catalogue',
      section: 'Foundations',
      kind: 'foundation',
      summary: document.summary,
      document: document as DocumentSummary,
    })),
  {
    path: 'components',
    title: 'Components',
    label: 'All components',
    area: 'catalogue',
    section: 'Components',
    kind: 'components',
    summary: 'Every component of envUI, by what it is for.',
  },
  ...componentGroups.flatMap((group) =>
    groupedPages
      .filter(({ document, path }) => document.group === group && !path.startsWith('docs/'))
      .map(({ document, path }): RoutePage => ({
        path,
        title: document.title,
        area: 'catalogue',
        section: 'Components',
        group,
        kind: 'component',
        summary: document.summary,
        document: document as DocumentSummary,
      })),
  ),
  {
    path: 'patterns',
    title: 'Patterns',
    label: 'All patterns',
    area: 'catalogue',
    section: 'Patterns',
    kind: 'patterns',
    summary: 'Components put together for what people do, by what they are doing.',
  },
  ...patternDocuments.map((document): RoutePage => ({
    path: `patterns/${document.id}`,
    title: document.title,
    area: 'catalogue',
    section: 'Patterns',
    group: document.metadata?.intent,
    kind: 'pattern',
    summary: document.summary,
    document,
  })),
];

/**
 * The guides that get an application going, in the Docs' Get started group; every other guide of
 * the index's Setup and workflows, such as customizing colors or dev mode, is in Guides.
 */
const startGuides = new Set(['setup', 'migration']);

/** The guide the Docs open on, at their home: installing and setting envUI up. */
const homeGuide = 'setup';

const guidePage = (document: DocumentSummary): RoutePage => ({
  path: document.id === homeGuide ? docsRoute : `docs/${document.id}`,
  title: document.title,
  area: 'docs',
  section: startGuides.has(document.id) ? 'Get started' : 'Guides',
  kind: 'guide',
  summary: document.summary,
  document,
});

/** The Docs' pages for getting started, in reading order: the first, setup, is their home. */
const startPages: RoutePage[] = guideDocuments
  .filter((document) => startGuides.has(document.id))
  .map(guidePage);

/** The Docs' other guides, in the index's order. */
const guidePages: RoutePage[] = guideDocuments
  .filter((document) => !startGuides.has(document.id))
  .map(guidePage);

const field = componentDocuments.find((document) => docsOnlyComponents.has(document.id));

const docsPages: RoutePage[] = [
  ...startPages,
  ...guidePages,
  ...(field
    ? [
        {
          path: componentDocsRoute(field.id),
          title: 'Build your own field',
          area: 'docs',
          section: 'Guides',
          kind: 'reference',
          summary: field.summary,
          document: field as DocumentSummary,
        } satisfies RoutePage,
      ]
    : []),
  ...foundations.map((document): RoutePage => ({
    path: foundationDocsRoute(document.id),
    title: document.title,
    area: 'docs',
    section: 'Foundations',
    kind: 'foundation-guide',
    summary: document.summary,
    document: document as DocumentSummary,
  })),
  {
    path: 'docs/tokens',
    title: 'Design tokens',
    area: 'docs',
    section: 'Foundations',
    kind: 'tokens',
    summary: 'Every token as a CSS custom property, with its value in each theme and scale.',
  },
  ...componentGroups.flatMap((group) =>
    componentDocuments
      .filter((document) => document.group === group && !docsOnlyComponents.has(document.id))
      .map((document): RoutePage => ({
        path: componentDocsRoute(document.id),
        title: document.title,
        area: 'docs',
        section: 'Components',
        group,
        kind: 'reference',
        summary: document.summary,
        document: document as DocumentSummary,
      })),
  ),
  // Each pattern's guide, in the catalogue's order and by its intent: how to build it in code.
  ...cataloguePages
    .filter((page) => page.kind === 'pattern')
    .map(({ document, title, summary, group }): RoutePage => ({
      path: patternDocsRoute(document.id),
      title,
      area: 'docs',
      section: 'Patterns',
      group,
      kind: 'reference',
      summary,
      document,
    })),
  {
    path: 'docs/changelog',
    title: 'Changelog',
    area: 'docs',
    section: 'Changelog',
    kind: 'docs-changelog',
    summary:
      'What changed in each release of @envsemble/envui: its highlights, then every change with how to migrate.',
  },
];

/** Every page of the catalogue, then of the Docs, each in reading order, which the pager follows. */
export const allPages: RoutePage[] = [...cataloguePages, ...docsPages];

/** The page at a route's path, if there is one. */
export function findPage(path: string) {
  return allPages.find((page) => page.path === path);
}

/** The pages of an area, in reading order. */
export const pagesOf = (area: Area) => allPages.filter((page) => page.area === area);

/** The first page of a catalogue destination, which its rail item opens. */
export function sectionHome(section: CatalogueSection) {
  return cataloguePages.find((page) => page.section === section)!;
}

/** The component or foundation page of a document id, such as button. */
export const groupedPageOf = (id: string) => groupedPages.find((page) => page.document.id === id);

/**
 * The route of a page by its document id, such as `button`, or by a site page's, such as `tokens`,
 * scrolled to the element `section`. `view` picks the page's part in the Docs where the catalogue shows
 * the rest: `props` a component's or a pattern's page there, `usage` a foundation's guide.
 */
export function routeOfDocument(
  id: string,
  { view, section }: { view?: string; section?: string } = {},
): string | undefined {
  const query = section ? `?${new URLSearchParams({ section })}` : '';
  const grouped = groupedPageOf(id);
  if (grouped) {
    if (grouped.section === 'Foundations' && view === 'usage')
      return `${foundationDocsRoute(id)}${query}`;
    if (grouped.section === 'Components' && view === 'props')
      return `${componentDocsRoute(id)}${query}`;
    return `${grouped.path}${query}`;
  }
  if (view === 'props' && patternDocuments.some((document) => document.id === id))
    return `${patternDocsRoute(id)}${query}`;
  if (id === 'index' || id === docsRoute) return `${docsRoute}${query}`;
  if (id === 'overview') return homeRoute;
  const own: Record<string, string> = {
    'get-started': docsRoute,
    foundations: 'foundations',
    components: 'components',
    patterns: 'patterns',
    // Dev mode's page in the catalogue, folded into its guide in the Docs.
    'dev-mode-overview': 'docs/dev-mode',
    changelog: 'docs/changelog',
    tokens: 'docs/tokens',
    // The codemods are gone: their page opens the migration guide.
    codemods: 'docs/migration',
    'full-changelog': 'docs/changelog',
    // The agent skills are gone, and so is the guide for agents: setup leads to the skill.
    'agent-skills': `${docsRoute}?section=coding-agents`,
    'agent-tooling': `${docsRoute}?section=coding-agents`,
    // Pages merged into others.
    'customizing-colors': 'docs/customizing',
    composition: 'docs/customizing',
    scale: 'foundations/spacing',
  };
  if (Object.hasOwn(own, id)) return `${own[id]}${query}`;
  const page = allPages.find(
    (entry) => entry.document?.id === id && (entry.kind === 'pattern' || entry.kind === 'guide'),
  );
  return page && `${page.path}${query}`;
}
