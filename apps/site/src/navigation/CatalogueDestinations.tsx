import type { Destination, NavigationDrawerDestination } from '@envsemble/envui';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconWidgets } from '@envsemble/envui/icons/Widgets';
import { IconPalette } from '@envsemble/envui/icons/Palette';
import {
  pagesOf,
  sectionHome,
  catalogueSections,
  type RoutePage,
  type CatalogueSection,
} from '../routes/SiteRoutes';
import { routeHref } from '../routes/Address';

const sectionIcons: Record<CatalogueSection, typeof IconHome> = {
  Overview: IconHome,
  Foundations: IconPalette,
  Components: IconWidgets,
};

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

export function catalogueSectionOf(page: RoutePage | undefined): CatalogueSection {
  return (page?.area === 'catalogue' ? page.section : 'Overview') as CatalogueSection;
}

export const sectionPages = (section: CatalogueSection) =>
  pagesOf('catalogue').filter((entry) => entry.section === section);

export function pageDestinations(
  pages: readonly RoutePage[],
  currentPath: string,
  onChoose?: () => void,
): NavigationDrawerDestination[] {
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
