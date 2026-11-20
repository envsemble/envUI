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
  'dev-mode-overview': 'docs/dev-mode',
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

const movedPages: Record<string, string> = {
  'docs/setup': docsRoute,
  'docs/codemods': docsRoute,
  'docs/migration': docsRoute,
  'docs/local-development': docsRoute,
  benchmark: homeRoute,
  changelog: 'docs/changelog',
  'dev-mode': 'docs/dev-mode',
  'foundations/tokens': 'docs/tokens',
  'docs/foundations/scale': 'docs/foundations/spacing',
  'docs/customizing-colors': 'docs/customizing',
  'templates/app-frame': docsRoute,
};

const foldedPages: Record<string, { page: string; section?: string }> = {
  'components/bar': { page: 'components/navigation-drawer' },
  'components/rail': { page: 'components/navigation-drawer' },
  'components/page-header': { page: 'components/page' },
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
};

const apiSection = (section: string | null) => section?.startsWith('props-') ?? false;

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
  'components/markdown-editor': 'components/markdown',
  'components/input': 'components/text-field',
  'components/textarea': 'components/text-field',
  'components/fields': 'components/text-field',
  'components/date-time-field': 'components/date-picker',
  'components/file-dropzone': 'components/drop-zone',
  'components/disclosures': 'components/disclosure',
  'components/notices': 'components/alert',
  'components/rows': 'components/list',
  'components/split-view': 'components/panes',
  'components/split-pane': 'components/panes',
  'components/list-detail': 'components/panes',
  'components/tabs': 'components/segmented-control',
  'components/panel-dock': 'components/sheet',
  'components/splitter': 'components/resize-handle',
  'components/app-shell': 'components/scaffold',
  'components/sidebar': 'components/navigation-drawer',
  'components/drawer': 'components/navigation-drawer',
  'components/navigation': 'components/navigation-drawer',
  'components/nav-list': 'components/navigation-drawer',
  'components/direction-links': 'components/pager',
  'foundations/motion': 'foundations/accessibility',
  'foundations/scale': 'foundations/spacing',
};

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
  if (path === 'docs/agent-skills' || path === 'docs/agent-tooling') return codingAgents;
  if (Object.hasOwn(movedPages, path)) return `${movedPages[path]}${address.rest()}`;
  const moved = foldedPage(address) ?? mergedPage(address);
  if (moved !== undefined) return moved;
  if (findPage(path)) return `${path}${address.rest()}`;
  const [area, id, ...view] = path.split('/');
  const renamed = renamedPages[`${area}/${id}`];
  return pageView(renamed ? [renamed, ...view].join('/') : path, address);
}

export const oldPaths = [
  ...Object.keys(movedPages),
  'docs/agent-skills',
  'docs/agent-tooling',
  ...Object.keys(foldedPages).flatMap((path) => [path, `docs/${path}`]),
  ...componentPatterns.map((slug) => `components/${slug}`),
  'patterns',
  'docs/patterns',
  ...patternIds.flatMap((id) => [`patterns/${id}`, `docs/patterns/${id}`]),
  ...Object.keys(renamedPages),
  'foundations/composition',
  'docs/foundations/composition',
  'foundations/content',
  'docs/foundations/content',
];
