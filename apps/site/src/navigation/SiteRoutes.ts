import {
  componentGroups,
  documents,
  foundations,
  componentDocuments,
  type Documentation,
  type GroupedDocument,
} from '../pages/PageModel';
import { docsRoute, homeRoute, routeHref } from './Address';
import { headingSlug } from '../shared/SearchAnchors';

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

/** What a page shows, which decides how it renders. */
export type PageKind =
  | 'home'
  | 'foundations'
  | 'components'
  | 'component'
  | 'patterns'
  | 'pattern'
  | 'foundation'
  | 'docs-home'
  | 'guide'
  | 'docs-changelog'
  | 'tokens'
  | 'foundation-guide'
  | 'reference';

/** One page of the catalogue or the Docs, at the route `path`. */
export interface RoutePage {
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
  kind: PageKind;
  summary?: string;
  /** The page of docs/ the page shows. */
  document?: Documentation;
}

/**
 * A component or foundation page of docs/ with the page that shows it: the catalogue's, or for
 * Field, which has no page in the catalogue, its page in the Docs.
 */
export interface GroupedPage {
  document: GroupedDocument;
  section: 'Foundations' | 'Components';
  path: string;
}

/** Field is documented in the Docs only, as "Build your own field". */
const docsOnlyComponents = new Set(['field']);

/**
 * Pages of docs/ that neither the catalogue nor the Docs show: the contributor pages, for people who
 * change envUI itself, which stay in the repository and which the package leaves out
 * (contributorPages in scripts/docs/GenerateDocumentation.ts), and the agents' index of the pages, which
 * the package ships.
 */
export const unlistedDocuments = new Set([
  'index',
  'library-development',
  'component-pages',
  'pattern-pages',
]);

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
    .map(
      ({ document, path }): RoutePage => ({
        path,
        title: document.title,
        area: 'catalogue',
        section: 'Foundations',
        kind: 'foundation',
        summary: document.summary,
        document: document as Documentation,
      }),
    ),
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
      .map(
        ({ document, path }): RoutePage => ({
          path,
          title: document.title,
          area: 'catalogue',
          section: 'Components',
          group,
          kind: 'component',
          summary: document.summary,
          document: document as Documentation,
        }),
      ),
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
  ...patternDocuments.map(
    (document): RoutePage => ({
      path: `patterns/${document.id}`,
      title: document.title,
      area: 'catalogue',
      section: 'Patterns',
      group: document.metadata?.intent,
      kind: 'pattern',
      summary: document.summary,
      document,
    }),
  ),
];

/** The shorter names of guides in the Docs' navigation. */
const guideLabels: Record<string, string> = {
  setup: 'Install and set up',
};

/**
 * The guides that get an application going, in the Docs' Get started group; every other guide of
 * the index's Setup and workflows, such as customizing colors or dev mode, is in Guides.
 */
const startGuides = new Set(['setup', 'migration']);

const guidePage = (document: Documentation): RoutePage => ({
  path: `docs/${document.id}`,
  title: document.title,
  label: guideLabels[document.id],
  area: 'docs',
  section: startGuides.has(document.id) ? 'Get started' : 'Guides',
  kind: 'guide',
  summary: document.summary,
  document,
});

/** The Docs' pages for getting started, in reading order. */
const startPages: RoutePage[] = guideDocuments
  .filter((document) => startGuides.has(document.id))
  .map(guidePage);

/** The Docs' other guides, in the index's order. */
const guidePages: RoutePage[] = guideDocuments
  .filter((document) => !startGuides.has(document.id))
  .map(guidePage);

const field = componentDocuments.find((document) => docsOnlyComponents.has(document.id));

const docsPages: RoutePage[] = [
  {
    path: docsRoute,
    title: 'envUI Docs',
    label: 'Introduction',
    area: 'docs',
    section: 'Get started',
    kind: 'docs-home',
    summary:
      'How to build with envUI in code: setup, guides, tokens, and every component and pattern with its props. The catalogue shows what each looks like and when to use it.',
  },
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
          document: field as Documentation,
        } satisfies RoutePage,
      ]
    : []),
  ...foundations.map(
    (document): RoutePage => ({
      path: foundationDocsRoute(document.id),
      title: document.title,
      area: 'docs',
      section: 'Foundations',
      kind: 'foundation-guide',
      summary: document.summary,
      document: document as Documentation,
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
    componentDocuments
      .filter((document) => document.group === group && !docsOnlyComponents.has(document.id))
      .map(
        (document): RoutePage => ({
          path: componentDocsRoute(document.id),
          title: document.title,
          area: 'docs',
          section: 'Components',
          group,
          kind: 'reference',
          summary: document.summary,
          document: document as Documentation,
        }),
      ),
  ),
  // Each pattern's guide, in the catalogue's order and by its intent: how to build it in code.
  ...cataloguePages
    .filter((page) => page.kind === 'pattern' && page.document)
    .map(
      ({ document, title, summary, group }): RoutePage => ({
        path: patternDocsRoute(document!.id),
        title,
        area: 'docs',
        section: 'Patterns',
        group,
        kind: 'reference',
        summary,
        document,
      }),
    ),
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

/** The route of the Docs' page of a subject the catalogue shows, by the kind of its page there. */
const docsRouteOf: Partial<Record<PageKind, (id: string) => string>> = {
  component: componentDocsRoute,
  pattern: patternDocsRoute,
  foundation: foundationDocsRoute,
};

/**
 * The pages of one subject in the two parts, each the other's counterpart, by their paths: a
 * component's, pattern's or foundation's page in the catalogue and its page in the Docs.
 */
const pairs = [
  ...cataloguePages.flatMap(({ path, kind, document }): [string, string][] => {
    const docs = document && docsRouteOf[kind];
    return docs ? [[path, docs(document.id)]] : [];
  }),
].filter(([catalogue, docs]) => findPage(catalogue) && findPage(docs));
const counterparts = new Map(
  pairs.flatMap(([catalogue, docs]) => [
    [catalogue, docs],
    [docs, catalogue],
  ]),
);

/** The path of the page of the same subject in the other part, if the page has one. */
export const counterpartOf = (page: RoutePage) => counterparts.get(page.path);

/**
 * Where a way to the other part leads from a page, such as the switch at its top end: the page of
 * the same subject there, or, from a page without one, the other part's start: the Docs' home from
 * the catalogue, such as from its Overview or a gallery, and the catalogue's Overview from the
 * Docs, such as from a guide or the changelog.
 */
export function otherPartRoute(page: RoutePage | undefined, area: Area) {
  return (page && counterpartOf(page)) ?? (area === 'docs' ? homeRoute : docsRoute);
}

/**
 * A group of the Docs' navigation, such as Guides, or Actions within Components: its pages, then
 * its own groups, with the id of its heading on the Docs' home.
 */
export interface DocsGroup {
  label: string;
  id: string;
  pages: RoutePage[];
  groups: DocsGroup[];
}

/**
 * The Docs' pages as a tree, in reading order: each section of the navigation, such as Get started
 * or Components, with its pages and its groups, such as the kinds of component and the patterns'
 * intents.
 */
export const docsTree: DocsGroup[] = (() => {
  const sections: DocsGroup[] = [];
  for (const page of docsPages) {
    let section = sections.find((entry) => entry.label === page.section);
    if (!section) {
      section = { label: page.section, id: headingSlug(page.section), pages: [], groups: [] };
      sections.push(section);
    }
    if (!page.group) {
      section.pages.push(page);
      continue;
    }
    let group = section.groups.find((entry) => entry.label === page.group);
    if (!group) {
      const id = `${section.id}-${headingSlug(page.group)}`;
      group = { label: page.group, id, pages: [], groups: [] };
      section.groups.push(group);
    }
    group.pages.push(page);
  }
  return sections;
})();

/** One level of a page's trail: its name, and the route it leads to. */
export interface TrailStep {
  label: string;
  route: string;
}

/**
 * The trail from the Docs' home down to a page of the Docs, for its breadcrumbs: Docs, its section
 * and its group, each leading to its heading on the Docs' home, then the page itself, such as
 * Docs / Components / Actions / Button. A section named as its one page, such as Changelog, is left
 * out.
 */
export function docsTrail(page: RoutePage): TrailStep[] {
  const steps: TrailStep[] = [{ label: 'Docs', route: docsRoute }];
  if (page.kind === 'docs-home') return steps;
  const section = docsTree.find((entry) => entry.label === page.section);
  const atHeading = (id: string) => `${docsRoute}?${new URLSearchParams({ section: id })}`;
  if (section && section.label !== page.title)
    steps.push({ label: section.label, route: atHeading(section.id) });
  const group = section?.groups.find((entry) => entry.label === page.group);
  if (group) steps.push({ label: group.label, route: atHeading(group.id) });
  steps.push({ label: page.title, route: page.path });
  return steps;
}

/** The component or foundation page of a document id, such as button. */
const groupedPageOf = (id: string) => groupedPages.find((page) => page.document.id === id);

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
    'get-started': 'docs/setup',
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
    'agent-skills': 'docs/setup?section=coding-agents',
    'agent-tooling': 'docs/setup?section=coding-agents',
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

/** Component pages that became patterns, by their slug: the pattern each one opens. */
const componentPatterns: Record<string, string> = {
  'window-frame': 'app-frame',
  'account-menu': 'account-and-organizations',
  stat: 'key-figures',
  stats: 'key-figures',
  'empty-state': 'empty-states',
};

/**
 * Pages folded into another page, by their path in the catalogue: the page that holds them now, and the
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

/** Patterns that merged into another, by their slug: the pattern each one is part of now. */
const mergedPatterns: Record<string, string> = {
  'window-frame': 'app-frame',
  'account-menu': 'account-and-organizations',
  'organization-switcher': 'account-and-organizations',
};

/** Whether an element id is a place on a component's page in the Docs: an export's or a prop's. */
const apiSection = (section: string | null) => section?.startsWith('props-') ?? false;

/**
 * Keeps old addresses working: the views pages had before the catalogue and the Docs split, the
 * old names of pages and the pages that moved, each opens the page it became.
 */
export function normalizeRoute(route: string): string {
  const [originalPath, ...query] = route.split('?');
  const search = new URLSearchParams(query.join('?'));
  const rest = () => (search.size ? `?${search}` : '');
  const section = search.get('section');
  if (!originalPath) return `${homeRoute}${rest()}`;
  // The overview's views: the components and Get started, which held the setup guide, the agents'
  // skills and the guides by their document's id. The catalogue's Get started page that followed
  // is the setup guide too.
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
    if (search.has('skill') || section === 'local-development')
      return 'docs/setup?section=coding-agents';
    if (section === 'documentation') return docsRoute;
    if (section === 'setup') search.delete('section');
    return `docs/setup${rest()}`;
  }
  if (/^overview\//.test(originalPath)) return `${homeRoute}${rest()}`;
  // The guides of Get started moved to the Docs, and the contributing pages are gone.
  const guide = /^get-started\/(.+)$/.exec(originalPath)?.[1];
  if (guide) return routeOfDocument(guide, { section: section ?? undefined }) ?? docsRoute;
  if (/^contributing(?:\/|$)/.test(originalPath)) return homeRoute;
  // The agent skills' page is gone with the skills, and so is the guide for agents: setup's
  // section on coding agents leads to the skill.
  if (originalPath === 'docs/agent-skills' || originalPath === 'docs/agent-tooling')
    return 'docs/setup?section=coding-agents';
  // The codemods are gone: their page opens the migration guide.
  if (originalPath === 'docs/codemods') return `docs/migration${rest()}`;
  // The agent benchmark is gone: its page opens the overview.
  if (originalPath === 'benchmark') return `${homeRoute}${rest()}`;
  // The catalogue's changelog moved to the Docs, with its release notes.
  if (originalPath === 'changelog') return `docs/changelog${rest()}`;
  // Dev mode's page in the catalogue folded into its guide in the Docs, which shows its pictures.
  if (originalPath === 'dev-mode') return `docs/dev-mode${rest()}`;
  // What every pattern needs was one page in the Docs; each pattern's guide says it now, and the
  // Docs' home lists the guides under Patterns.
  if (originalPath === 'docs/patterns') return `${docsRoute}${rest()}`;
  if (originalPath === 'foundations/tokens') return `docs/tokens${rest()}`;
  // Pages folded into another open it: in the catalogue at the section that holds them, unless the
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
  // Nine foundations became six: Scale & density joined Spacing & density, and Composition &
  // extension, with Customize colors, became the Docs' guide Customize and extend.
  if (/^(?:docs\/)?foundations\/composition(?:\/|$)|^docs\/customizing-colors$/.test(originalPath))
    return `docs/customizing${rest()}`;
  if (originalPath === 'docs/foundations/scale') return `docs/foundations/spacing${rest()}`;
  // The templates are gone: the app frame is a pattern now, and the other screens open the overview.
  if (originalPath === 'templates/app-frame') return `patterns/app-frame${rest()}`;
  if (/^templates(?:\/|$)/.test(originalPath)) return `${homeRoute}${rest()}`;
  // Patterns merged into others open the pattern they joined, in the catalogue and the Docs, and the
  // content guidelines are the Writing guide in the Docs.
  const merged = /^(docs\/)?patterns\/([a-z-]+)$/.exec(originalPath);
  if (merged && Object.hasOwn(mergedPatterns, merged[2]!))
    return `${merged[1] ?? ''}patterns/${mergedPatterns[merged[2]!]}${rest()}`;
  if (/^(?:docs\/)?foundations\/content(?:\/|$)/.test(originalPath)) return `docs/writing${rest()}`;
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
    .replace(/^foundations\/motion(?=\/|$)/, 'foundations/accessibility')
    .replace(/^foundations\/scale(?=\/|$)/, 'foundations/spacing');
  if (path.startsWith('patterns/')) return `${path}${rest()}`;
  // A page's views are gone: its props are on its page in the Docs, a foundation's guidance in its
  // guide there, and every other view is the catalogue's page.
  const [area, id, view] = path.split('/');
  const grouped = (area === 'components' || area === 'foundations') && groupedPageOf(id ?? '');
  if (!grouped) return `${path}${rest()}`;
  const toDocs =
    grouped.section === 'Components'
      ? view === 'props' || apiSection(section)
      : view === 'usage' &&
        !(section && grouped.document.sections?.some((part) => part.anchors?.includes(section)));
  return (
    routeOfDocument(id!, {
      view: toDocs ? (grouped.section === 'Components' ? 'props' : 'usage') : undefined,
    }) + rest()
  );
}
