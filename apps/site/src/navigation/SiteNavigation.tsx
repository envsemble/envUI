import { useEffect, useRef, useState, type ComponentProps } from 'react';
import {
  Badge,
  Button,
  Drawer,
  IconButton,
  Link,
  Rail,
  Tooltip,
  type Destination,
  type DrawerDestination,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { Palette } from '@envsemble/envui/icons/Palette';
import { version } from '../../../../packages/ui/package.json';
import { EnvUIDocsLogo } from '../brand/EnvUIDocsLogo';
import { EnvUILogo } from '../brand/EnvUILogo';
import { SearchButton } from '../search/SearchButton';
import { DisplayMenu, MotionButton } from '../theme/DisplaySettings';
import { drawerWidthKey } from '../theme/DisplayStorage';
import { pageBadge } from './PageBadges';
import {
  docsTree,
  otherPartRoute,
  pagesOf,
  sectionHome,
  catalogueSections,
  type Area,
  type DocsGroup,
  type RoutePage,
  type CatalogueSection,
} from './SiteRoutes';
import { docsRoute, homeRoute, routeHref } from './Address';
import { otherPart } from './OtherPart';

/** The icon of each of the catalogue's destinations in its rail. */
const sectionIcons: Record<CatalogueSection, typeof Home> = {
  Overview: Home,
  Foundations: Palette,
  Components: Widgets,
  Patterns: Pattern,
};

/** The catalogue's destinations, for its rail: each opens its first page. */
export function catalogueDestinations(current: string | undefined, onChoose?: () => void) {
  return catalogueSections.map((section): Destination => {
    const Icon = sectionIcons[section];
    return {
      label: section,
      href: routeHref(sectionHome(section).path),
      icon: <Icon />,
      current: section === current,
      onSelect: onChoose,
    };
  });
}

/** The pages of one of the catalogue's destinations, for its drawer. */
export function pageDestinations(
  pages: readonly RoutePage[],
  currentPath: string,
  onChoose?: () => void,
): DrawerDestination[] {
  return pages.map((page) => ({
    group: page.group,
    label: page.label ?? page.title,
    href: routeHref(page.path),
    current: page.path === currentPath,
    onSelect: onChoose,
  }));
}

/** Scrolls the current page's link into view as the navigation mounts, as on a page deep in it. */
function useCurrentInView() {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    element.current
      ?.querySelector('.env-drawer [aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, []);
  return element;
}

/**
 * The badge after a page's name in the Docs' navigation, such as Experimental or New, from its
 * frontmatter and the package's version (PageBadges.ts); nothing for most pages.
 */
function PageBadgeOf({ page }: { page: RoutePage }) {
  const metadata = page.document?.metadata;
  const badge = metadata && pageBadge(metadata, version);
  return badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : null;
}

/**
 * The Docs' navigation: each section, such as Get started or Components, as a group under its
 * heading, its pages, then its groups, such as the kinds of component and the patterns' intents,
 * each a section of their pages that opens and closes, open while it holds the current page. A
 * section that is one page of its name, such as Changelog, is that page alone, under no heading.
 */
export function docsDestinations(currentPath: string, onChoose?: () => void): DrawerDestination[] {
  const link = (page: RoutePage, group?: string): DrawerDestination => ({
    group,
    label: page.label ?? page.title,
    badge: <PageBadgeOf page={page} />,
    href: routeHref(page.path),
    current: page.path === currentPath,
    onSelect: onChoose,
  });
  const lone = (section: DocsGroup) =>
    !section.groups.length &&
    section.pages.length === 1 &&
    section.pages[0]!.title === section.label;
  return docsTree.flatMap((section) => [
    ...section.pages.map((page) => link(page, lone(section) ? undefined : section.label)),
    ...section.groups.map(
      (group): DrawerDestination => ({
        group: section.label,
        label: group.label,
        children: group.pages.map((page) => link(page)),
      }),
    ),
  ]);
}

/**
 * Each part's drawer at the start of a wide window: the width it starts at and its bounds, in rem.
 * The Docs' drawer holds the wordmark and search on its first row, so it starts wider.
 */
const drawerWidths: Record<Area, { defaultWidth: number; minWidth: number; maxWidth: number }> = {
  catalogue: { defaultWidth: 16, minWidth: 13, maxWidth: 24 },
  docs: { defaultWidth: 21, minWidth: 18, maxWidth: 30 },
};

/** The width the reader gave the area's drawer on an earlier visit, within its bounds. */
function storedDrawerWidth(area: Area) {
  const { defaultWidth, minWidth, maxWidth } = drawerWidths[area];
  let stored: number | undefined;
  try {
    stored = Number.parseFloat(localStorage.getItem(drawerWidthKey(area)) ?? '');
  } catch {
    // Storage the browser refuses, as in some private windows, keeps the default.
  }
  return stored !== undefined && Number.isFinite(stored)
    ? Math.min(maxWidth, Math.max(minWidth, stored))
    : defaultWidth;
}

/**
 * The resizable drawer of a wide window, whose width the reader drags and the catalogue keeps for
 * the next visit; read before the first render, so nothing moves as the page loads. The drawer in
 * the sheet of a narrower window takes the sheet's width and isn't resizable.
 */
function useDrawerWidth(area: Area, inSheet: boolean): Partial<ComponentProps<typeof Drawer>> {
  const [width, setWidth] = useState(() => storedDrawerWidth(area));
  if (inSheet) return {};
  return {
    resizable: true,
    ...drawerWidths[area],
    width,
    onWidthChange: (next, { committed }) => {
      setWidth(next);
      if (!committed) return;
      try {
        localStorage.setItem(drawerWidthKey(area), String(next));
      } catch {
        // The width holds for this visit only.
      }
    },
  };
}

interface NavigationProps {
  /** The page shown, whose destination and page the navigation marks as current. */
  page?: RoutePage;
  /** The route's path, such as components/button. */
  routePath: string;
  /** Whether the navigation is in the sheet of a narrower window. */
  inSheet?: boolean;
  /** Runs as a page is chosen, such as to close the sheet the navigation sits in. */
  onChoose?: () => void;
  /** Opens search. */
  onSearch: () => void;
}

/** The envUI wordmark, which leads to the area's home, and the envUI Docs lockup in the Docs. */
function Brand({ area }: { area: Area }) {
  return (
    <Link
      href={routeHref(area === 'docs' ? docsRoute : homeRoute)}
      underline={false}
      className="site-brand"
      aria-label={area === 'docs' ? 'envUI Docs home' : 'envUI home'}
    >
      {area === 'docs' ? <EnvUIDocsLogo className="docs-brand-docs" /> : <EnvUILogo />}
    </Link>
  );
}

/**
 * The catalogue's navigation, one pane: a Rail of its destinations, Overview, Foundations,
 * Components and Patterns, under the envUI wordmark, beside a Drawer of the chosen
 * destination's pages under search, both on the navigation's background with no seam or line
 * between them. A rail item opens its destination's first page; in the sheet of a narrower window
 * it leaves the sheet open, so a page can be chosen.
 */
export function CatalogueNavigation({
  page,
  routePath,
  inSheet = false,
  onChoose,
  onSearch,
}: NavigationProps) {
  const element = useCurrentInView();
  const drawerWidth = useDrawerWidth('catalogue', inSheet);
  const section = (page?.area === 'catalogue' ? page.section : 'Overview') as CatalogueSection;
  const pages = pagesOf('catalogue').filter((entry) => entry.section === section);
  return (
    <div ref={element} className="site-navigation" data-in-sheet={inSheet || undefined}>
      <Rail
        aria-label="Catalogue"
        className="catalogue-rail"
        header={<Brand area="catalogue" />}
        footer={<MotionButton />}
        destinations={catalogueDestinations(page?.area === 'catalogue' ? section : undefined)}
      />
      <Drawer
        aria-label={section}
        className="site-sidebar"
        header={<SearchButton onClick={onSearch} className="site-drawer-search" />}
        destinations={pageDestinations(pages, routePath, onChoose)}
        {...drawerWidth}
      />
    </div>
  );
}

/**
 * The Docs' navigation: a Drawer of every page of the Docs, as a tree of their sections and groups
 * (docsDestinations), with the wordmark and search side by side at its top.
 */
export function DocsNavigation({
  routePath,
  inSheet = false,
  onChoose,
  onSearch,
}: NavigationProps) {
  const element = useCurrentInView();
  const drawerWidth = useDrawerWidth('docs', inSheet);
  return (
    <div ref={element} className="site-navigation" data-in-sheet={inSheet || undefined}>
      <Drawer
        aria-label="Docs"
        className="site-sidebar"
        header={
          <div className="docs-drawer-top">
            <Brand area="docs" />
            <SearchButton onClick={onSearch} className="site-drawer-search" />
          </div>
        }
        destinations={docsDestinations(routePath, onChoose)}
        {...drawerWidth}
      />
    </div>
  );
}

/**
 * The page's own controls at its top end, quiet ghost buttons that stay in the corner as the page
 * scrolls, on a small pill of the page's color: the other part, the Docs from the catalogue and
 * the catalogue from the Docs, at the page of the same subject there (otherPartRoute), and the
 * Display menu, where the theme, contrast and scale are. Below an expanded window they are icon
 * buttons with tooltips.
 */
export function PageActions({ page, area }: { page?: RoutePage; area: Area }) {
  const { label, Icon } = otherPart(area);
  const href = routeHref(otherPartRoute(page, area));
  return (
    <div className="site-page-actions">
      <div className="site-page-actions-bar">
        <span className="site-wide-only">
          <Button variant="ghost" href={href} startIcon={<Icon />}>
            {label}
          </Button>
          <DisplayMenu />
        </span>
        <span className="site-narrow-only">
          <Tooltip content={label}>
            <IconButton variant="ghost" href={href} icon={<Icon />} aria-label={label} />
          </Tooltip>
          <DisplayMenu iconOnly />
        </span>
      </div>
    </div>
  );
}
