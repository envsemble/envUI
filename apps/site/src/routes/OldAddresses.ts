import { docsRoute, homeRoute } from './Address';
import { findPage, groupedPageOf, routeOfDocument } from './SiteRoutes';

/** An old address being read: its path, and its query, which a step may change as it reads it. */
interface OldAddress {
  path: string;
  search: URLSearchParams;
  /** The element id it scrolls to, as the address arrived. */
  section: string | null;
  /** Its query as it now stands, with its `?`, or nothing. */
  rest: () => string;
}

/** The setup guide's section on coding agents, which the agents' pages that are gone open. */
const codingAgents = `${docsRoute}?section=coding-agents`;

/**
 * The ids of documents that are gone, which old addresses name (`?document=` and
 * `get-started/<id>`): the route each one opens now.
 */
const oldDocuments: Record<string, string> = {
  // The catalogue's Get started page is the setup guide, the Docs' home.
  'get-started': docsRoute,
  // Dev mode's page in the catalogue folded into its guide in the Docs.
  'dev-mode-overview': 'docs/dev-mode',
  changelog: 'docs/changelog',
  // The codemods are gone: their page opens the migration guide.
  codemods: 'docs/migration',
  // The agent skills are gone, and so is the guide for agents: setup leads to the skill.
  'agent-skills': codingAgents,
  'agent-tooling': codingAgents,
  // Pages merged into others.
  'customizing-colors': 'docs/customizing',
  composition: 'docs/customizing',
  scale: 'foundations/spacing',
};

/** The route of a document an old address names, by its id then or now, at `section`. */
function routeOfOldDocument(id: string, section?: string) {
  const route = Object.hasOwn(oldDocuments, id) ? oldDocuments[id] : undefined;
  if (route === undefined) return routeOfDocument(id, { section });
  // A route that names its own section keeps it.
  return section && !route.includes('?') ? `${route}?${new URLSearchParams({ section })}` : route;
}

/**
 * The overview's views: the components and Get started, which held the setup guide, the agents'
 * skills and the guides by their document's id. The catalogue's Get started page that followed is
 * the setup guide too.
 */
function overviewView({ path, search, section, rest }: OldAddress) {
  if (/^overview\/components(?:\/|$)/.test(path))
    return section && section !== 'overview-components'
      ? `components${rest()}`
      : section
        ? 'components'
        : homeRoute;
  if (
    /^(?:overview\/get-started|overview\/usage|getting-started)(?:\/|$)|^get-started$/.test(path)
  ) {
    const shown = search.get('document');
    search.delete('document');
    if (shown) {
      search.delete('section');
      return routeOfOldDocument(shown) ?? docsRoute;
    }
    if (search.has('skill') || section === 'local-development') return codingAgents;
    if (section === 'documentation') return docsRoute;
    if (section === 'setup') search.delete('section');
    return `${docsRoute}${rest()}`;
  }
  if (/^overview\//.test(path)) return `${homeRoute}${rest()}`;
  // The guides of Get started moved to the Docs, and the contributing pages are gone.
  const guide = /^get-started\/(.+)$/.exec(path)?.[1];
  if (guide) return routeOfOldDocument(guide, section ?? undefined) ?? docsRoute;
  if (/^contributing(?:\/|$)/.test(path)) return homeRoute;
  return undefined;
}

/** Pages that moved, by their old path: the path each one opens, its query kept. */
const movedPages: Record<string, string> = {
  // The setup guide is the Docs' home, which its Introduction was before.
  'docs/setup': docsRoute,
  // The codemods are gone: their page opens the migration guide.
  'docs/codemods': 'docs/migration',
  // Developing envUI locally is a contributor's guide now, in the repository.
  'docs/local-development': docsRoute,
  // The agent benchmark is gone: its page opens the overview.
  benchmark: homeRoute,
  // The catalogue's changelog moved to the Docs, with its release notes.
  changelog: 'docs/changelog',
  // Dev mode's page in the catalogue folded into its guide in the Docs, which shows its pictures.
  'dev-mode': 'docs/dev-mode',
  // What every pattern needs was one page in the Docs; each pattern's guide says it now, and the
  // Docs' home lists the guides under Patterns.
  'docs/patterns': docsRoute,
  'foundations/tokens': 'docs/tokens',
  // Scale & density joined Spacing & density.
  'docs/foundations/scale': 'docs/foundations/spacing',
  // Customize colors joined Customize and extend.
  'docs/customizing-colors': 'docs/customizing',
  // The templates are gone: the app frame is a pattern now.
  'templates/app-frame': 'patterns/app-frame',
  // Patterns merged into others open the pattern they joined, in the catalogue and the Docs.
  'patterns/window-frame': 'patterns/app-frame',
  'docs/patterns/window-frame': 'docs/patterns/app-frame',
  'patterns/account-menu': 'patterns/account-and-organizations',
  'docs/patterns/account-menu': 'docs/patterns/account-and-organizations',
  'patterns/organization-switcher': 'patterns/account-and-organizations',
  'docs/patterns/organization-switcher': 'docs/patterns/account-and-organizations',
};

/**
 * Pages folded into another page, by their path in the catalogue: the page that holds them now, and the
 * section of it that does, if one. Their pages in the Docs open the other's.
 */
const foldedPages: Record<string, { page: string; section?: string }> = {
  'components/bar': { page: 'components/navigation-drawer' },
  'components/rail': { page: 'components/navigation-drawer' },
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
 * Pages folded into another open it: in the catalogue at the section that holds them, unless the
 * address names one, and in the Docs the other's page there.
 */
function foldedPage({ path, search, section, rest }: OldAddress) {
  const [, area, id, view] =
    /^(?:docs\/)?(components|patterns)\/([^/]+)(?:\/(.+))?$/.exec(path) ?? [];
  const folded = area && foldedPages[`${area}/${id}`];
  if (!folded) return undefined;
  if (path.startsWith('docs/') || view === 'props' || apiSection(section))
    return `docs/${folded.page}${rest()}`;
  if (!section && folded.section) search.set('section', folded.section);
  return `${folded.page}${rest()}`;
}

/** Component pages that became patterns, by their slug: the pattern each one opens. */
const componentPatterns: Record<string, string> = {
  'window-frame': 'app-frame',
  'account-menu': 'account-and-organizations',
  stat: 'key-figures',
  stats: 'key-figures',
  'empty-state': 'empty-states',
};

/** Pages merged into others, and pages that became others, each opening the page it is part of now. */
function mergedPage({ path, rest }: OldAddress) {
  // Nine foundations became six: Composition & extension became the Docs' guide Customize and
  // extend.
  if (/^(?:docs\/)?foundations\/composition(?:\/|$)/.test(path)) return `docs/customizing${rest()}`;
  // The other templates' screens open the overview.
  if (/^templates(?:\/|$)/.test(path)) return `${homeRoute}${rest()}`;
  // The content guidelines are the Writing guide in the Docs.
  if (/^(?:docs\/)?foundations\/content(?:\/|$)/.test(path)) return `docs/writing${rest()}`;
  // Components that became patterns open their pattern.
  const slug = path.split('/')[1] ?? '';
  if (path.startsWith('components/') && Object.hasOwn(componentPatterns, slug))
    return `patterns/${componentPatterns[slug]}${rest()}`;
  return undefined;
}

/** The old names of pages, by the first two parts of their path: the page each one is now. */
const renamedPages: Partial<Record<string, string>> = {
  'components/text': 'foundations/typography',
  'components/notes': 'components/disclosure',
  'components/icon-buttons': 'components/button',
  'components/buttons': 'components/button',
  'components/close-button': 'components/button',
  'components/badges': 'components/badge',
  'components/chips': 'components/badge',
  'components/tables': 'components/table',
  'components/toasts': 'components/toast',
  'components/dialogs': 'components/dialog',
  'components/meters': 'components/meter',
  'components/messages': 'components/message',
  'components/cards': 'components/card',
  'components/keyboard': 'components/kbd',
  'components/layout': 'components/column',
  'components/stack': 'components/column',
  'components/loading': 'patterns/loading',
  'components/skeleton': 'patterns/loading',
  'components/markdown-editor': 'components/markdown',
  'components/input': 'components/text-field',
  'components/textarea': 'components/text-field',
  'components/fields': 'components/text-field',
  'components/date-time-field': 'components/date-picker',
  'components/file-dropzone': 'components/drop-zone',
  'components/disclosures': 'components/disclosure',
  'components/notices': 'components/alert',
  'components/heatmap': 'components/calendar-heatmap',
  'components/rows': 'components/list',
  'components/split-view': 'components/panes',
  'components/split-pane': 'components/panes',
  'components/list-detail': 'components/panes',
  'components/app-shell': 'components/scaffold',
  'components/sidebar': 'components/navigation-drawer',
  'components/drawer': 'components/navigation-drawer',
  'components/navigation': 'components/navigation-drawer',
  'components/nav-list': 'components/navigation-drawer',
  'components/direction-links': 'components/pager',
  'foundations/motion': 'foundations/accessibility',
  'foundations/scale': 'foundations/spacing',
};

/**
 * A page's views are gone: its props are on its page in the Docs, a foundation's guidance in its
 * guide there, and every other view is the catalogue's page.
 */
function pageView(path: string, { section, rest }: OldAddress) {
  if (path.startsWith('patterns/')) return `${path}${rest()}`;
  const [area, id, view] = path.split('/');
  const grouped = (area === 'components' || area === 'foundations') && groupedPageOf(id ?? '');
  if (!grouped) return `${path}${rest()}`;
  const toDocs =
    grouped.section === 'Components'
      ? view === 'props' || apiSection(section)
      : view === 'usage' &&
        !(section && grouped.document.outline?.some((part) => part.anchors.includes(section)));
  return (
    routeOfDocument(id ?? '', {
      view: toDocs ? (grouped.section === 'Components' ? 'props' : 'usage') : undefined,
    }) + rest()
  );
}

/**
 * Keeps old addresses working: the views pages had before the catalogue and the Docs split, the
 * old names of pages and the pages that moved, each opens the page it became.
 */
export function normalizeRoute(route: string): string {
  const [path = '', ...query] = route.split('?');
  const search = new URLSearchParams(query.join('?'));
  const address: OldAddress = {
    path,
    search,
    section: search.get('section'),
    rest: () => (search.size ? `?${search}` : ''),
  };
  if (!path) return `${homeRoute}${address.rest()}`;
  const opened = overviewView(address);
  if (opened !== undefined) return opened;
  // The agent skills' page is gone with the skills, and so is the guide for agents: setup's
  // section on coding agents leads to the skill.
  if (path === 'docs/agent-skills' || path === 'docs/agent-tooling') return codingAgents;
  if (Object.hasOwn(movedPages, path)) return `${movedPages[path]}${address.rest()}`;
  const moved = foldedPage(address) ?? mergedPage(address);
  if (moved !== undefined) return moved;
  if (findPage(path)) return `${path}${address.rest()}`;
  const [area, id, ...view] = path.split('/');
  // A key holds a slash, so no property every object has reads as one.
  const renamed = renamedPages[`${area}/${id}`];
  return pageView(renamed ? [renamed, ...view].join('/') : path, address);
}

/**
 * Old addresses whose path alone says where they lead: the pages that moved, were folded into
 * another, became a pattern or were renamed. The host answers each with a redirect
 * (scripts/site/PrerenderSite.ts writes them to _redirects), so a crawler, a link preview or a
 * reader without the site's script finds the page; normalizeRoute redirects the rest in the
 * browser, such as an old view of a page or an address whose query names a document.
 */
export const oldPaths = [
  ...Object.keys(movedPages),
  'docs/agent-skills',
  'docs/agent-tooling',
  ...Object.keys(foldedPages).flatMap((path) => [path, `docs/${path}`]),
  ...Object.keys(componentPatterns).map((slug) => `components/${slug}`),
  ...Object.keys(renamedPages),
  'foundations/composition',
  'docs/foundations/composition',
  'foundations/content',
  'docs/foundations/content',
];
