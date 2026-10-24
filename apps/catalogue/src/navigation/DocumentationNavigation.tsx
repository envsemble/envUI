import { useEffect, useRef, useState, type ComponentProps } from 'react';
import {
  Button,
  Drawer,
  IconButton,
  Link,
  Rail,
  Tooltip,
  type Destination,
  type DrawerDestination,
} from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { MenuBook } from '@envsemble/envui/icons/MenuBook';
import { Home } from '@envsemble/envui/icons/Home';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { Palette } from '@envsemble/envui/icons/Palette';
import { EnvUILogo } from '../brand/EnvUILogo';
import { SearchButton } from '../search/SearchButton';
import { DisplayMenu } from '../theme/DisplaySettings';
import {
  pagesOf,
  sectionHome,
  siteSections,
  type Area,
  type SitePage,
  type SiteSection,
} from './DocumentationRoutes';
import { docsRoute, homeRoute, routeHref } from './Address';

/** The icon of each of the Site's destinations in its rail. */
const sectionIcons: Record<SiteSection, typeof Home> = {
  Overview: Home,
  Foundations: Palette,
  Components: Widgets,
  Patterns: Pattern,
};

/** The Site's destinations, for its rail: each opens its first page. */
export function siteDestinations(current: string | undefined, onChoose?: () => void) {
  return siteSections.map((section): Destination => {
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

/** The pages of one of the Site's destinations, or of the Docs, for a drawer. */
export function pageDestinations(
  pages: readonly SitePage[],
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
 * Each area's drawer at the start of a wide window: the width it starts at and its bounds, in rem.
 * The Docs' drawer holds the wordmark and search on its first row, so it starts wider.
 */
const drawerWidths: Record<Area, { defaultWidth: number; minWidth: number; maxWidth: number }> = {
  site: { defaultWidth: 16, minWidth: 13, maxWidth: 24 },
  docs: { defaultWidth: 21, minWidth: 18, maxWidth: 30 },
};

/** Where the catalogue keeps the width the reader gives each area's drawer, in localStorage. */
const drawerWidthKey = (area: Area) => `envui-catalogue-drawer-width-${area}`;

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
  page?: SitePage;
  /** The route's path, such as components/button. */
  routePath: string;
  /** Whether the navigation is in the sheet of a narrower window. */
  inSheet?: boolean;
  /** Runs as a page is chosen, such as to close the sheet the navigation sits in. */
  onChoose?: () => void;
  /** Opens search. */
  onSearch: () => void;
}

/** The envUI wordmark, which leads to the area's home, with "Docs" beside it in the Docs. */
function Brand({ area }: { area: Area }) {
  return (
    <Link
      href={routeHref(area === 'docs' ? docsRoute : homeRoute)}
      underline={false}
      className="docs-brand"
      aria-label={area === 'docs' ? 'envUI Docs home' : 'envUI home'}
    >
      <EnvUILogo />
      {area === 'docs' && (
        <span className="docs-brand-area" aria-hidden="true">
          Docs
        </span>
      )}
    </Link>
  );
}

/**
 * The Site's navigation, one pane: a Rail of its destinations, Overview, Foundations, Components
 * and Patterns, under the envUI wordmark, beside a Drawer of the chosen
 * destination's pages under search, both on the navigation's background with no seam or line
 * between them. A rail item opens its destination's first page; in the sheet of a narrower window
 * it leaves the sheet open, so a page can be chosen.
 */
export function SiteNavigation({
  page,
  routePath,
  inSheet = false,
  onChoose,
  onSearch,
}: NavigationProps) {
  const element = useCurrentInView();
  const drawerWidth = useDrawerWidth('site', inSheet);
  const section = (page?.area === 'site' ? page.section : 'Overview') as SiteSection;
  const pages = pagesOf('site').filter((entry) => entry.section === section);
  return (
    <div ref={element} className="docs-navigation" data-in-sheet={inSheet || undefined}>
      <Rail
        aria-label="Site"
        className="docs-rail"
        header={<Brand area="site" />}
        destinations={siteDestinations(page?.area === 'site' ? section : undefined)}
      />
      <Drawer
        aria-label={section}
        className="docs-sidebar"
        header={<SearchButton onClick={onSearch} className="docs-drawer-search" />}
        destinations={pageDestinations(pages, routePath, onChoose)}
        {...drawerWidth}
      />
    </div>
  );
}

/**
 * The Docs' navigation: a Drawer of every page of the Docs, by its group, with the wordmark and
 * search side by side at its top.
 */
export function DocsNavigation({
  routePath,
  inSheet = false,
  onChoose,
  onSearch,
}: NavigationProps) {
  const element = useCurrentInView();
  const drawerWidth = useDrawerWidth('docs', inSheet);
  const pages = pagesOf('docs').map((page) => ({ ...page, group: page.section }));
  return (
    <div ref={element} className="docs-navigation" data-in-sheet={inSheet || undefined}>
      <Drawer
        aria-label="Docs"
        className="docs-sidebar"
        header={
          <div className="docs-drawer-top">
            <Brand area="docs" />
            <SearchButton onClick={onSearch} className="docs-drawer-search" />
          </div>
        }
        destinations={pageDestinations(pages, routePath, onChoose)}
        {...drawerWidth}
      />
    </div>
  );
}

/**
 * The page's own controls at its top end, quiet ghost buttons that stay in the corner as the page
 * scrolls, on a small pill of the page's color: the other
 * area, the Docs from the Site and the Site from the Docs, and the Display menu, where the theme,
 * contrast and scale are. Below an expanded window they are icon buttons with tooltips.
 */
export function PageActions({ area }: { area: Area }) {
  const [label, href, Icon] =
    area === 'docs'
      ? (['Site', routeHref(homeRoute), ArrowBack] as const)
      : (['Docs', routeHref(docsRoute), MenuBook] as const);
  return (
    <div className="docs-page-actions">
      <div className="docs-page-actions-bar">
        <span className="docs-wide-only">
          <Button variant="ghost" href={href} startIcon={<Icon />}>
            {label}
          </Button>
          <DisplayMenu />
        </span>
        <span className="docs-narrow-only">
          <Tooltip content={label}>
            <IconButton variant="ghost" href={href} icon={<Icon />} aria-label={label} />
          </Tooltip>
          <DisplayMenu iconOnly />
        </span>
      </div>
    </div>
  );
}
