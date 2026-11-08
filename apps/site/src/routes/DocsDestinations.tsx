import { Badge, type NavigationDrawerDestination } from '@envsemble/envui';
import { version } from '@envsemble/envui/package.json';
import { pageBadge } from './PageBadges';
import type { RoutePage } from './SiteRoutes';
import { docsTree, type DocsGroup } from './DocsTree';
import { routeHref } from './Address';

/**
 * The badge after a page's name in the Docs' navigation, such as Alpha or New, from its
 * frontmatter, a guide's status included, and the package's version (PageBadges.ts); nothing for
 * most pages.
 */
function PageBadgeOf({ page }: { page: RoutePage }) {
  const document = page.document;
  const metadata = document?.metadata ?? (document?.status && { status: document.status });
  const badge = metadata && pageBadge(metadata, version);
  return badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : null;
}

/**
 * The Docs' navigation: each section, such as Get started or Components, as a group under its
 * heading, its pages, then its groups, such as the kinds of component and the patterns' intents,
 * each a section of their pages that opens and closes, open while it holds the current page. A
 * section that is one page of its name, such as Changelog, is that page alone, under no heading.
 */
export function docsDestinations(
  currentPath: string,
  onChoose?: () => void,
): NavigationDrawerDestination[] {
  // A page's link alone: the components and sections it holds are on the page and in its contents.
  const link = (page: RoutePage, group?: string): NavigationDrawerDestination[] => [
    {
      group,
      label: page.label ?? page.title,
      badge: <PageBadgeOf page={page} />,
      href: routeHref(page.path),
      current: page.path === currentPath,
      onClick: onChoose,
    },
  ];
  const lone = (section: DocsGroup) =>
    !section.groups.length &&
    section.pages.length === 1 &&
    section.pages[0].title === section.label;
  return docsTree.flatMap((section) => [
    ...section.pages.flatMap((page) => link(page, lone(section) ? undefined : section.label)),
    ...section.groups.map((group): NavigationDrawerDestination => ({
      group: section.label,
      label: group.label,
      children: group.pages.flatMap((page) => link(page)),
    })),
  ]);
}
