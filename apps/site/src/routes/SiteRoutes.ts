import {
  componentGroups,
  documents,
  foundations,
  componentDocuments,
  type DocumentSummary,
  type GroupedDocument,
} from './PageModel';
import { docsRoute, homeRoute, routeHref } from './Address';
import { docsOnlyComponents, unlistedDocuments } from '../documentation/DocumentPlaces';

export type Area = 'catalogue' | 'docs';

export const catalogueSections = ['Overview', 'Foundations', 'Components'] as const;
export type CatalogueSection = (typeof catalogueSections)[number];

type DocumentKind = 'component' | 'foundation' | 'guide' | 'foundation-guide' | 'reference';

type OwnKind = 'home' | 'foundations' | 'components' | 'docs-changelog' | 'tokens' | 'legal';

export type PageKind = DocumentKind | OwnKind;

export type PageOfKind<Kind extends PageKind> = {
  path: string;
  title: string;
  label?: string;
  area: Area;
  section: string;
  group?: string;
  kind: Kind;
  summary?: string;
} & (Kind extends DocumentKind
  ? {
      document: DocumentSummary;
    }
  : { document?: undefined });

export type RoutePage = { [Kind in PageKind]: PageOfKind<Kind> }[PageKind];

export type DocumentPage = PageOfKind<DocumentKind>;

interface GroupedPage {
  document: GroupedDocument;
  section: 'Foundations' | 'Components';
  path: string;
}

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

export const pageHref = (page: GroupedPage) => routeHref(page.path);

export const componentDocsRoute = (id: string) => `docs/components/${id}`;

export const foundationDocsRoute = (id: string) => `docs/foundations/${id}`;

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
    summary: 'The color, type, spacing, icon and accessibility rules every component follows.',
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
      document,
    })),
  {
    path: 'components',
    title: 'Components',
    label: 'All components',
    area: 'catalogue',
    section: 'Components',
    kind: 'components',
    summary: 'All envUI components, grouped by use.',
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
        document,
      })),
  ),
];

const startGuides = new Set(['setup']);

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

const startPages: RoutePage[] = guideDocuments
  .filter((document) => startGuides.has(document.id))
  .map(guidePage);

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
          document: field,
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
    document,
  })),
  {
    path: 'docs/tokens',
    title: 'Design tokens',
    area: 'docs',
    section: 'Foundations',
    kind: 'tokens',
    summary: 'Every design token as a CSS variable, with its value in each theme and density.',
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
        document,
      })),
  ),
  {
    path: 'docs/changelog',
    title: 'Changelog',
    area: 'docs',
    section: 'Changelog',
    kind: 'docs-changelog',
    summary: 'What changed in each release of @envsemble/envui, with migration steps.',
  },
];

const legalPages: RoutePage[] = [
  {
    path: 'privacy',
    title: 'Privacy',
    area: 'docs',
    section: 'About',
    kind: 'legal',
    summary: 'What the envUI package and this site do with your data.',
  },
  {
    path: 'terms',
    title: 'Terms',
    area: 'docs',
    section: 'About',
    kind: 'legal',
    summary: 'The terms of using envUI and this site.',
  },
];

const listedPages: RoutePage[] = [...cataloguePages, ...docsPages];

export const allPages: RoutePage[] = [...listedPages, ...legalPages];

export function findPage(path: string) {
  return allPages.find((page) => page.path === path);
}

export const pagesOf = (area: Area) => listedPages.filter((page) => page.area === area);

export function sectionHome(section: CatalogueSection) {
  return cataloguePages.find((page) => page.section === section)!;
}

export const groupedPageOf = (id: string) => groupedPages.find((page) => page.document.id === id);

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
  if (id === 'index' || id === docsRoute) return `${docsRoute}${query}`;
  if (id === 'overview') return homeRoute;
  if (allPages.some((page) => page.path === id && !page.document)) return `${id}${query}`;
  const page = allPages.find((entry) => entry.document?.id === id && entry.kind === 'guide');
  return page && `${page.path}${query}`;
}
