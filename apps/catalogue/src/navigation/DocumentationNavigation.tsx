import { useEffect, useRef } from 'react';
import { Drawer, Rail, type Destination, type DrawerDestination } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { Palette } from '@envsemble/envui/icons/Palette';
import { Leaderboard } from '@envsemble/envui/icons/Leaderboard';
import { History } from '@envsemble/envui/icons/History';
import {
  pagesOf,
  sectionHome,
  siteSections,
  type SitePage,
  type SiteSection,
} from './DocumentationRoutes';
import { routeHref } from './Address';

/** The icon of each of the Site's destinations in its rail. */
const sectionIcons: Record<SiteSection, typeof Home> = {
  Overview: Home,
  Components: Widgets,
  Patterns: Pattern,
  Foundations: Palette,
  Benchmark: Leaderboard,
  Changelog: History,
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

interface NavigationProps {
  /** The page shown, whose destination and page the navigation marks as current. */
  page?: SitePage;
  /** The route's path, such as components/button. */
  routePath: string;
  /** Whether the navigation is in the sheet of a narrower window. */
  inSheet?: boolean;
  /** Runs as a page is chosen, such as to close the sheet the navigation sits in. */
  onChoose?: () => void;
}

/**
 * The Site's navigation: a Rail of its destinations, Overview, Components, Patterns, Foundations,
 * Benchmark and Changelog, beside a Drawer of the chosen destination's pages, both flush on the
 * navigation's background with no line between them. A rail item opens its destination's first
 * page; in the sheet of a narrower window it leaves the sheet open, so a page can be chosen.
 */
export function SiteNavigation({ page, routePath, inSheet = false, onChoose }: NavigationProps) {
  const element = useCurrentInView();
  const section = (page?.area === 'site' ? page.section : 'Overview') as SiteSection;
  const pages = pagesOf('site').filter((entry) => entry.section === section);
  return (
    <div ref={element} className="docs-navigation" data-in-sheet={inSheet || undefined}>
      <Rail
        aria-label="Site"
        className="docs-rail"
        destinations={siteDestinations(page?.area === 'site' ? section : undefined)}
      />
      <Drawer
        aria-label={section}
        className="docs-sidebar"
        destinations={pageDestinations(pages, routePath, onChoose)}
      />
    </div>
  );
}

/** The Docs' navigation: a Drawer of every page of the Docs, by its group. */
export function DocsNavigation({ routePath, inSheet = false, onChoose }: NavigationProps) {
  const element = useCurrentInView();
  const pages = pagesOf('docs').map((page) => ({ ...page, group: page.section }));
  return (
    <div ref={element} className="docs-navigation" data-in-sheet={inSheet || undefined}>
      <Drawer
        aria-label="Docs"
        className="docs-sidebar"
        destinations={pageDestinations(pages, routePath, onChoose)}
      />
    </div>
  );
}
