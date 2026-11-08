import type { Destination, NavigationDrawerDestination } from '@envsemble/envui';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconWidgets } from '@envsemble/envui/icons/Widgets';
import { IconPattern } from '@envsemble/envui/icons/Pattern';
import { IconPalette } from '@envsemble/envui/icons/Palette';
import {
  pagesOf,
  sectionHome,
  catalogueSections,
  type RoutePage,
  type CatalogueSection,
} from './SiteRoutes';
import { routeHref } from './Address';

/** The icon of each of the catalogue's destinations in its rail. */
const sectionIcons: Record<CatalogueSection, typeof IconHome> = {
  Overview: IconHome,
  Foundations: IconPalette,
  Components: IconWidgets,
  Patterns: IconPattern,
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
      onClick: onChoose,
    };
  });
}

/** The catalogue's destination a page is in, Overview for one outside the catalogue. */
export function catalogueSectionOf(page: RoutePage | undefined): CatalogueSection {
  return (page?.area === 'catalogue' ? page.section : 'Overview') as CatalogueSection;
}

/** The pages of one of the catalogue's destinations, in its drawer. */
export const sectionPages = (section: CatalogueSection) =>
  pagesOf('catalogue').filter((entry) => entry.section === section);

/**
 * Whether the catalogue shows a page beside its rail alone, without the drawer: a wide window's
 * on a destination of one page, such as Overview, where the drawer would list that page alone.
 */
export const drawerless = (page: RoutePage | undefined) =>
  sectionPages(catalogueSectionOf(page)).length === 1;

/**
 * The pages of one of the catalogue's destinations, for its drawer: its pages of no group, such as
 * All components, then each group, such as a kind of component or a pattern's intent, as a section
 * of its pages that opens and closes, open while it holds the current page, as in the Docs.
 */
export function pageDestinations(
  pages: readonly RoutePage[],
  currentPath: string,
  onChoose?: () => void,
): NavigationDrawerDestination[] {
  // A page's link alone: the components and sections it holds are on the page and in its contents.
  const link = (page: RoutePage): NavigationDrawerDestination[] => [
    {
      label: page.label ?? page.title,
      href: routeHref(page.path),
      current: page.path === currentPath,
      onClick: onChoose,
    },
  ];
  const groups = new Map<string, RoutePage[]>();
  for (const page of pages)
    if (page.group) groups.set(page.group, [...(groups.get(page.group) ?? []), page]);
  return [
    ...pages.filter((page) => !page.group).flatMap(link),
    ...[...groups].map(([label, members]): NavigationDrawerDestination => ({
      label,
      children: members.flatMap(link),
    })),
  ];
}
