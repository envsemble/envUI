import { docsRoute, homeRoute } from './Address';
import { findPage, groupedPageOf, routeOfDocument } from './SiteRoutes';

interface OldAddress {
  path: string;
  search: URLSearchParams;
  section: string | null;
  rest: () => string;
}

const codingAgents = `${docsRoute}?section=coding-agents`;

const oldDocuments: Record<string, string> = {
  'get-started': docsRoute,
  'dev-mode-overview': docsRoute,
  changelog: 'docs/changelog',
  codemods: docsRoute,
  migration: docsRoute,
  'agent-skills': codingAgents,
  'agent-tooling': codingAgents,
  'customizing-colors': 'docs/customizing',
  composition: 'docs/customizing',
  scale: 'foundations/spacing',
};

function routeOfOldDocument(id: string, section?: string) {
  const route = Object.hasOwn(oldDocuments, id) ? oldDocuments[id] : undefined;
  if (route === undefined) return routeOfDocument(id, { section });
  return section && !route.includes('?') ? `${route}?${new URLSearchParams({ section })}` : route;
}

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
  const guide = /^get-started\/(.+)$/.exec(path)?.[1];
  if (guide) return routeOfOldDocument(guide, section ?? undefined) ?? docsRoute;
  if (/^contributing(?:\/|$)/.test(path)) return homeRoute;
  return undefined;
}

const codingAgentsAddresses = ['docs/agent-skills', 'docs/agent-tooling'];

const movedAddresses: Record<string, string> = {
  'docs/setup': docsRoute,
  'docs/codemods': docsRoute,
  'docs/migration': docsRoute,
  'docs/local-development': docsRoute,
  benchmark: homeRoute,
  changelog: 'docs/changelog',
  'dev-mode': docsRoute,
  'docs/dev-mode': docsRoute,
  'foundations/tokens': 'docs/tokens',
  'docs/customizing-colors': 'docs/customizing',
  'templates/app-frame': docsRoute,
};

/** @internal */
export const formerPages: Record<string, { page: string; section?: string }> = {
  'components/bar': { page: 'components/navigation-drawer' },
  'components/rail': { page: 'components/navigation-drawer' },
  'components/page-header': { page: 'components/page' },
  'components/rich-text': { page: 'components/markdown' },
  'components/animated-number': {
    page: 'foundations/typography',
    section: 'a-number-that-changes',
  },
  'components/calendar-heatmap': {
    page: 'components/tooltip',
    section: 'details-of-each-day-in-a-grid',
  },
  'components/heatmap': { page: 'components/tooltip', section: 'details-of-each-day-in-a-grid' },
  'components/rating': { page: 'components/meter', section: 'a-score-in-stars' },
  'patterns/feature-cards': { page: 'components/card', section: 'feature-card' },
  'patterns/search-trigger': {
    page: 'components/command-palette',
    section: 'opening-it-the-button-and-the-shortcut',
  },
  'components/search-trigger': {
    page: 'components/command-palette',
    section: 'opening-it-the-button-and-the-shortcut',
  },
  'components/text': { page: 'foundations/typography' },
  'components/notes': { page: 'components/disclosure' },
  'components/icon-buttons': { page: 'components/button' },
  'components/buttons': { page: 'components/button' },
  'components/close-button': { page: 'components/button' },
  'components/badges': { page: 'components/badge' },
  'components/chips': { page: 'components/badge' },
  'components/tables': { page: 'components/table' },
  'components/toasts': { page: 'components/toast' },
  'components/dialogs': { page: 'components/dialog' },
  'components/meters': { page: 'components/meter' },
  'components/messages': { page: 'components/message' },
  'components/cards': { page: 'components/card' },
  'components/keyboard': { page: 'components/kbd' },
  'components/layout': { page: 'components/column' },
  'components/stack': { page: 'components/column' },
  'components/markdown-editor': { page: 'components/markdown' },
  'components/input': { page: 'components/text-field' },
  'components/textarea': { page: 'components/text-field' },
  'components/fields': { page: 'components/text-field' },
  'components/date-time-field': { page: 'components/date-picker' },
  'components/file-dropzone': { page: 'components/drop-zone' },
  'components/disclosures': { page: 'components/disclosure' },
  'components/notices': { page: 'components/alert' },
  'components/rows': { page: 'components/list' },
  'components/split-view': { page: 'components/panes' },
  'components/split-pane': { page: 'components/panes' },
  'components/list-detail': { page: 'components/panes' },
  'components/tabs': { page: 'components/segmented-control' },
  'components/panel-dock': { page: 'components/sheet' },
  'components/splitter': { page: 'components/resize-handle' },
  'components/app-shell': { page: 'components/scaffold' },
  'components/sidebar': { page: 'components/navigation-drawer' },
  'components/drawer': { page: 'components/navigation-drawer' },
  'components/navigation': { page: 'components/navigation-drawer' },
  'components/nav-list': { page: 'components/navigation-drawer' },
  'components/direction-links': { page: 'components/pager' },
  'foundations/motion': { page: 'foundations/accessibility' },
  'foundations/scale': { page: 'foundations/spacing' },
};

const apiSection = (section: string | null) => section?.startsWith('props-') ?? false;

function formerPage(address: OldAddress) {
  const { path, search, section, rest } = address;
  const [, docs, former, view] =
    /^(docs\/)?((?:components|patterns|foundations)\/[^/]+)(?:\/(.+))?$/.exec(path) ?? [];
  if (!former || !Object.hasOwn(formerPages, former)) return undefined;
  const { page, section: placed } = formerPages[former]!;
  if (docs || view === 'props' || apiSection(section)) return `docs/${page}${rest()}`;
  if (!section && placed) search.set('section', placed);
  return pageView(view ? `${page}/${view}` : page, address);
}

const patternIds = [
  'account-and-organizations',
  'account-menu',
  'app-frame',
  'conversation',
  'data-tables',
  'destructive-actions',
  'empty-states',
  'feedback',
  'file-upload',
  'filtering',
  'forms',
  'key-figures',
  'loading',
  'navigation',
  'organization-switcher',
  'progressive-disclosure',
  'settings',
  'window-frame',
];

const componentPatterns = ['window-frame', 'account-menu', 'stat', 'stats', 'loading', 'skeleton'];

function mergedPage({ path, rest }: OldAddress) {
  if (/^(?:docs\/)?foundations\/composition(?:\/|$)/.test(path)) return `docs/customizing${rest()}`;
  if (/^templates(?:\/|$)/.test(path)) return `${homeRoute}${rest()}`;
  if (/^(?:docs\/)?foundations\/content(?:\/|$)/.test(path)) return `docs/writing${rest()}`;
  if (/^(?:docs\/)?patterns(?:\/|$)/.test(path)) return docsRoute;
  const slug = path.split('/')[1] ?? '';
  if (path.startsWith('components/') && componentPatterns.includes(slug) && !groupedPageOf(slug))
    return docsRoute;
  return undefined;
}

function pageView(path: string, { section, rest }: OldAddress) {
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
  if (codingAgentsAddresses.includes(path)) return codingAgents;
  if (Object.hasOwn(movedAddresses, path)) return `${movedAddresses[path]}${address.rest()}`;
  const moved = formerPage(address) ?? mergedPage(address);
  if (moved !== undefined) return moved;
  if (findPage(path)) return `${path}${address.rest()}`;
  return pageView(path, address);
}

export const oldPaths = [
  ...Object.keys(movedAddresses),
  ...codingAgentsAddresses,
  ...Object.keys(formerPages).flatMap((path) => [path, `docs/${path}`]),
  ...componentPatterns.map((slug) => `components/${slug}`),
  'patterns',
  'docs/patterns',
  ...patternIds.flatMap((id) => [`patterns/${id}`, `docs/patterns/${id}`]),
  'foundations/composition',
  'docs/foundations/composition',
  'foundations/content',
  'docs/foundations/content',
];
