import {
  componentGroups,
  documents,
  foundations,
  references,
  type Documentation,
  type Reference,
} from '../Reference';
import { docsRoute, homeRoute, routeHref } from './Address';

/**
 * The two areas of the site: the Site, at the root, introduces envUI to people, and the Docs, under
 * /docs, are the developer reference.
 */
export type Area = 'site' | 'docs';

/**
 * The Site's destinations in its rail, in order; the drawer beside it lists their pages. The
 * changelog is in the Docs.
 */
export const siteSections = [
  'Overview',
  'Foundations',
  'Components',
  'Patterns',
  'Benchmark',
] as const;
export type SiteSection = (typeof siteSections)[number];

/** What a page shows, which decides how it renders. */
export type PageKind =
  | 'home'
  | 'components'
  | 'component'
  | 'pattern'
  | 'foundation'
  | 'benchmark'
  | 'docs-home'
  | 'guide'
  | 'codemods'
  | 'docs-changelog'
  | 'skills'
  | 'tokens'
  | 'foundation-guide'
  | 'api';

/** One page of the Site or the Docs, at the route `path`. */
export interface SitePage {
  path: string;
  title: string;
  /** The page's name in the navigation, where it differs from its title. */
  label?: string;
  area: Area;
  /** The Site's rail destination the page belongs to, or the group of the Docs' navigation. */
  section: string;
  /** The group of the Site's drawer the page is listed in, such as a kind of component. */
  group?: string;
  kind: PageKind;
  summary?: string;
  /** The page of docs/ the page shows. */
  document?: Documentation;
}

/**
 * A component or foundation page of docs/ with the page that shows it: the Site's, or for Field,
 * which has no page on the Site, its page in the Docs.
 */
export interface ReferencePage {
  reference: Reference;
  section: 'Foundations' | 'Components';
  path: string;
}

/** Field is documented in the Docs only, as "Build your own field". */
const docsOnlyComponents = new Set(['field']);

/**
 * Pages of docs/ that neither the Site nor the Docs show: the contributor pages, for people who
 * change envUI itself, which stay in the repository and which the package leaves out
 * (contributorPages in scripts/GenerateDocumentation.mjs), and the agents' index of the pages, which
 * the package ships.
 */
export const unlistedDocuments = new Set([
  'index',
  'library-development',
  'component-pages',
  'pattern-pages',
]);

/** The component and foundation pages, each at the address of the page that shows it. */
export const referencePages: ReferencePage[] = [
  ...foundations.map((reference) => ({
    reference,
    section: 'Foundations' as const,
    path: `foundations/${reference.id}`,
  })),
  ...references.map((reference) => ({
    reference,
    section: 'Components' as const,
    path: docsOnlyComponents.has(reference.id)
      ? `docs/components/${reference.id}`
      : `components/${reference.id}`,
  })),
];

/** The address of a component or foundation page. */
export const pageHref = (page: ReferencePage) => routeHref(page.path);

/**
 * The route of a component's page in the Docs: its guide to using it in code, then its props, part
 * names and changelog.
 */
export const apiRoute = (id: string) => `docs/components/${id}`;

/** The route of a pattern's page in the Docs: its guide to building it in code. */
export const patternGuideRoute = (id: string) => `docs/patterns/${id}`;

/** The route of a foundation's guide in the Docs: its written guidance and reference. */
export const foundationGuideRoute = (id: string) => `docs/foundations/${id}`;

const patternDocuments = documents.filter((document) => document.group === 'Patterns');
const guideDocuments = documents.filter(
  (document) => document.group === 'Setup and workflows' && !unlistedDocuments.has(document.id),
);

const sitePages: SitePage[] = [
  {
    path: homeRoute,
    title: 'envUI',
    label: 'Introduction',
    area: 'site',
    section: 'Overview',
    kind: 'home',
  },
  ...referencePages
    .filter(({ section }) => section === 'Foundations')
    .map(
      ({ reference, path }): SitePage => ({
        path,
        title: reference.title,
        area: 'site',
        section: 'Foundations',
        kind: 'foundation',
        summary: reference.summary,
        document: reference as Documentation,
      }),
    ),
  {
    path: 'components',
    title: 'Components',
    label: 'All components',
    area: 'site',
    section: 'Components',
    kind: 'components',
    summary: 'Every component of envUI, by what it is for.',
  },
  ...componentGroups.flatMap((group) =>
    referencePages
      .filter(({ reference, path }) => reference.group === group && !path.startsWith('docs/'))
      .map(
        ({ reference, path }): SitePage => ({
          path,
          title: reference.title,
          area: 'site',
          section: 'Components',
          group,
          kind: 'component',
          summary: reference.summary,
          document: reference as Documentation,
        }),
      ),
  ),
  ...patternDocuments.map(
    (document): SitePage => ({
      path: `patterns/${document.id}`,
      title: document.title,
      area: 'site',
      section: 'Patterns',
      group: document.metadata?.intent,
      kind: 'pattern',
      summary: document.summary,
      document,
    }),
  ),
  {
    path: 'benchmark',
    title: 'Benchmark',
    area: 'site',
    section: 'Benchmark',
    kind: 'benchmark',
    summary: 'How coding agents do when they build interfaces with envUI.',
  },
];

/** The shorter names of guides in the Docs' navigation. */
const guideLabels: Record<string, string> = {
  setup: 'Install and set up',
  migration: 'Migrate to envUI',
};

const guidePage = (document: Documentation): SitePage => ({
  path: `docs/${document.id}`,
  title: document.title,
  label: guideLabels[document.id],
  area: 'docs',
  section: 'Get started',
  kind: 'guide',
  summary: document.summary,
  document,
});

/** The Docs' pages for getting started, in reading order, with codemods after migration. */
const startPages: SitePage[] = guideDocuments.flatMap((document) => {
  const page = guidePage(document);
  if (document.id === 'migration')
    return [
      page,
      {
        path: 'docs/codemods',
        title: 'Codemods',
        area: 'docs',
        section: 'Get started',
        kind: 'codemods',
        summary:
          'Upgrade an application from envUI 0.x to 1.0 with @envsemble/envui-codemods, which renames what it can and reports the rest.',
      },
      {
        path: 'docs/changelog',
        title: 'Changelog',
        area: 'docs',
        section: 'Get started',
        kind: 'docs-changelog',
        summary:
          'What changed in each release of @envsemble/envui: its highlights, then every change with how to migrate.',
      },
    ];
  if (document.id === 'agent-tooling')
    return [
      page,
      {
        path: 'docs/agent-skills',
        title: 'Agent skills',
        area: 'docs',
        section: 'Get started',
        kind: 'skills',
        summary:
          'The skills that teach coding agents to use envUI and to migrate an interface to it.',
      },
    ];
  return [page];
});

const field = references.find((reference) => docsOnlyComponents.has(reference.id));

const docsPages: SitePage[] = [
  {
    path: docsRoute,
    title: 'envUI Docs',
    label: 'Introduction',
    area: 'docs',
    section: 'Get started',
    kind: 'docs-home',
    summary:
      'The developer reference: setup, migration, tokens, and how to use every component and pattern in code, with their props and part names.',
  },
  ...startPages,
  ...(field
    ? [
        {
          path: apiRoute(field.id),
          title: 'Build your own field',
          area: 'docs',
          section: 'Guides',
          kind: 'api',
          summary: field.summary,
          document: field as Documentation,
        } satisfies SitePage,
      ]
    : []),
  ...foundations.map(
    (reference): SitePage => ({
      path: foundationGuideRoute(reference.id),
      title: reference.title,
      area: 'docs',
      section: 'Foundations',
      kind: 'foundation-guide',
      summary: reference.summary,
      document: reference as Documentation,
    }),
  ),
  {
    path: 'docs/tokens',
    title: 'Design tokens',
    area: 'docs',
    section: 'Foundations',
    kind: 'tokens',
    summary:
      'Every token as a CSS custom property, with its value in each theme and scale, generated from the token source.',
  },
  ...componentGroups.flatMap((group) =>
    references
      .filter((reference) => reference.group === group && !docsOnlyComponents.has(reference.id))
      .map(
        (reference): SitePage => ({
          path: apiRoute(reference.id),
          title: reference.title,
          area: 'docs',
          section: group,
          kind: 'api',
          summary: reference.summary,
          document: reference as Documentation,
        }),
      ),
  ),
  // Each pattern's guide, in the Site's order: how to build it in code.
  ...sitePages
    .filter((page) => page.kind === 'pattern' && page.document)
    .map(
      ({ document, title, summary }): SitePage => ({
        path: patternGuideRoute(document!.id),
        title,
        area: 'docs',
        section: 'Patterns',
        kind: 'api',
        summary,
        document,
      }),
    ),
];

/** Every page of the Site, then of the Docs, each in reading order, which the pager follows. */
export const allPages: SitePage[] = [...sitePages, ...docsPages];

/** The page at a route's path, if there is one. */
export function findPage(path: string) {
  return allPages.find((page) => page.path === path);
}

/** The pages of an area, in reading order. */
export const pagesOf = (area: Area) => allPages.filter((page) => page.area === area);

/** The first page of a Site destination, which its rail item opens. */
export function sectionHome(section: SiteSection) {
  return sitePages.find((page) => page.section === section)!;
}

/** The component or foundation page of a document id, such as button. */
const referencePageOf = (id: string) => referencePages.find((page) => page.reference.id === id);

/**
 * The route of a page by its document id, such as `button`, or by a site page's, such as `tokens`,
 * scrolled to the element `section`. `view` picks the page's part in the Docs where the Site shows
 * the rest: `props` a component's or a pattern's page there, `usage` a foundation's guide.
 */
export function routeOfDocument(
  id: string,
  { view, section }: { view?: string; section?: string } = {},
): string | undefined {
  const query = section ? `?${new URLSearchParams({ section })}` : '';
  const reference = referencePageOf(id);
  if (reference) {
    if (reference.section === 'Foundations' && view === 'usage')
      return `${foundationGuideRoute(id)}${query}`;
    if (reference.section === 'Components' && view === 'props') return `${apiRoute(id)}${query}`;
    return `${reference.path}${query}`;
  }
  if (view === 'props' && patternDocuments.some((document) => document.id === id))
    return `${patternGuideRoute(id)}${query}`;
  if (id === 'index' || id === docsRoute) return `${docsRoute}${query}`;
  if (id === 'overview') return homeRoute;
  const own: Record<string, string> = {
    'get-started': 'docs/setup',
    components: 'components',
    benchmark: 'benchmark',
    changelog: 'docs/changelog',
    tokens: 'docs/tokens',
    codemods: 'docs/codemods',
    'full-changelog': 'docs/changelog',
    'agent-skills': 'docs/agent-skills',
  };
  if (Object.hasOwn(own, id)) return `${own[id]}${query}`;
  const page = allPages.find(
    (entry) => entry.document?.id === id && (entry.kind === 'pattern' || entry.kind === 'guide'),
  );
  return page && `${page.path}${query}`;
}

/** Component pages that became patterns, by their slug: the pattern each one opens. */
const componentPatterns: Record<string, string> = {
  'window-frame': 'window-frame',
  'account-menu': 'account-menu',
  stat: 'key-figures',
  stats: 'key-figures',
  'empty-state': 'empty-states',
};

/**
 * Pages folded into another page, by their path on the Site: the page that holds them now, and the
 * section of it that does, if one. Their pages in the Docs open the other's.
 */
const foldedPages: Record<string, { page: string; section?: string }> = {
  'components/bar': { page: 'components/drawer' },
  'components/rail': { page: 'components/drawer' },
  'components/page-header': { page: 'components/page' },
  'patterns/feature-cards': { page: 'components/card', section: 'feature-card' },
  'patterns/search-trigger': {
    page: 'components/command-palette',
    section: 'opening-it-the-button-and-the-shortcut',
  },
  // SearchTrigger was a component before it was a pattern.
  'components/search-trigger': {
    page: 'components/command-palette',
    section: 'opening-it-the-button-and-the-shortcut',
  },
};

/** Whether an element id is a place on a component's page in the Docs: an export's or a prop's. */
const apiSection = (section: string | null) => section?.startsWith('props-') ?? false;

/**
 * Keeps old addresses working: the views pages had before the Site and the Docs split, the 0.x
 * names of pages and the pages that moved, each opens the page it became.
 */
export function normalizeRoute(route: string): string {
  const [originalPath, ...query] = route.split('?');
  const search = new URLSearchParams(query.join('?'));
  const rest = () => (search.size ? `?${search}` : '');
  const section = search.get('section');
  if (!originalPath) return `${homeRoute}${rest()}`;
  // The overview's views: the components and Get started, which held the setup guide, the agents'
  // skills and the guides by their document's id. The Site's Get started page that followed is the
  // setup guide too.
  if (/^overview\/components(?:\/|$)/.test(originalPath))
    return section && section !== 'overview-components'
      ? `components${rest()}`
      : section
        ? 'components'
        : homeRoute;
  if (
    /^(?:overview\/get-started|overview\/usage|getting-started)(?:\/|$)|^get-started$/.test(
      originalPath,
    )
  ) {
    const shown = search.get('document');
    search.delete('document');
    if (shown) {
      search.delete('section');
      return routeOfDocument(shown) ?? docsRoute;
    }
    if (search.has('skill') || section === 'local-development') return 'docs/agent-skills';
    if (section === 'documentation') return docsRoute;
    if (section === 'setup') search.delete('section');
    return `docs/setup${rest()}`;
  }
  if (/^overview\//.test(originalPath)) return `${homeRoute}${rest()}`;
  // The guides of Get started moved to the Docs, and the contributing pages are gone.
  const guide = /^get-started\/(.+)$/.exec(originalPath)?.[1];
  if (guide) return routeOfDocument(guide, { section: section ?? undefined }) ?? docsRoute;
  if (/^contributing(?:\/|$)/.test(originalPath)) return homeRoute;
  // The Site's changelog moved to the Docs, with its release notes.
  if (originalPath === 'changelog') return `docs/changelog${rest()}`;
  // A destination's own address opens its first page.
  if (originalPath === 'foundations') return `${sectionHome('Foundations').path}${rest()}`;
  if (originalPath === 'patterns') return `${sectionHome('Patterns').path}${rest()}`;
  // What every pattern needs was one page in the Docs; each pattern's guide says it now, and the
  // Docs' home lists the guides under Patterns.
  if (originalPath === 'docs/patterns') return `${docsRoute}${rest()}`;
  if (originalPath === 'foundations/tokens') return `docs/tokens${rest()}`;
  // Pages folded into another open it: on the Site at the section that holds them, unless the
  // address names one, and in the Docs the other's page there.
  const [, foldedArea, foldedId, foldedView] =
    /^(?:docs\/)?(components|patterns)\/([^/]+)(?:\/(.+))?$/.exec(originalPath) ?? [];
  const folded = foldedArea && foldedPages[`${foldedArea}/${foldedId}`];
  if (folded) {
    if (originalPath.startsWith('docs/') || foldedView === 'props' || apiSection(section))
      return `docs/${folded.page}${rest()}`;
    if (!section && folded.section) search.set('section', folded.section);
    return `${folded.page}${rest()}`;
  }
  // The templates are gone: the app frame is a pattern now, and the other screens open the overview.
  if (originalPath === 'templates/app-frame') return `patterns/app-frame${rest()}`;
  if (/^templates(?:\/|$)/.test(originalPath)) return `${homeRoute}${rest()}`;
  // Components that became patterns open their pattern.
  const slug = originalPath.split('/')[1] ?? '';
  if (originalPath.startsWith('components/') && Object.hasOwn(componentPatterns, slug))
    return `patterns/${componentPatterns[slug]}${rest()}`;
  if (findPage(originalPath)) return `${originalPath}${rest()}`;
  const path = originalPath
    .replace(/^components\/text(?=\/|$)/, 'foundations/typography')
    .replace(/^components\/notes(?=\/|$)/, 'components/disclosure')
    .replace(/^components\/(icon-buttons|buttons|close-button)(?=\/|$)/, 'components/button')
    .replace(/^components\/badges(?=\/|$)/, 'components/badge')
    .replace(/^components\/chips(?=\/|$)/, 'components/badge')
    .replace(/^components\/tables(?=\/|$)/, 'components/table')
    .replace(/^components\/toasts(?=\/|$)/, 'components/toast')
    .replace(/^components\/dialogs(?=\/|$)/, 'components/dialog')
    .replace(/^components\/meters(?=\/|$)/, 'components/meter')
    .replace(/^components\/messages(?=\/|$)/, 'components/message')
    .replace(/^components\/cards(?=\/|$)/, 'components/card')
    .replace(/^components\/keyboard(?=\/|$)/, 'components/kbd')
    .replace(/^components\/(layout|stack)(?=\/|$)/, 'components/column')
    .replace(/^components\/(loading|skeleton)(?=\/|$)/, 'patterns/loading')
    .replace(/^components\/markdown-editor(?=\/|$)/, 'components/markdown')
    .replace(/^components\/(input|textarea)(?=\/|$)/, 'components/text-field')
    .replace(/^components\/fields(?=\/|$)/, 'components/text-field')
    .replace(/^components\/date-time-field(?=\/|$)/, 'components/date-picker')
    .replace(/^components\/file-dropzone(?=\/|$)/, 'components/drop-zone')
    .replace(/^components\/disclosures(?=\/|$)/, 'components/disclosure')
    .replace(/^components\/notices(?=\/|$)/, 'components/alert')
    .replace(/^components\/heatmap(?=\/|$)/, 'components/calendar-heatmap')
    .replace(/^components\/rows(?=\/|$)/, 'components/list')
    .replace(/^components\/(split-view|split-pane|list-detail)(?=\/|$)/, 'components/panes')
    .replace(/^components\/app-shell(?=\/|$)/, 'components/scaffold')
    .replace(/^components\/sidebar(?=\/|$)/, 'components/drawer')
    .replace(/^components\/(navigation|nav-list)(?=\/|$)/, 'components/drawer')
    .replace(/^components\/direction-links(?=\/|$)/, 'components/pager')
    .replace(/^foundations\/motion(?=\/|$)/, 'foundations/accessibility');
  if (path.startsWith('patterns/')) return `${path}${rest()}`;
  // A page's views are gone: its props are on its page in the Docs, a foundation's guidance in its
  // guide there, and every other view is the Site's page.
  const [area, id, view] = path.split('/');
  const reference = (area === 'components' || area === 'foundations') && referencePageOf(id ?? '');
  if (!reference) return `${path}${rest()}`;
  const toDocs =
    reference.section === 'Components'
      ? view === 'props' || apiSection(section)
      : view === 'usage' &&
        !(section && reference.reference.sections?.some((part) => part.anchors?.includes(section)));
  return (
    routeOfDocument(id!, {
      view: toDocs ? (reference.section === 'Components' ? 'props' : 'usage') : undefined,
    }) + rest()
  );
}
