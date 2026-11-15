import { Badge, type NavigationDrawerDestination } from '@envsemble/envui';
import { version } from '@envsemble/envui/package.json';
import { pageBadge } from '../routes/PageBadges';
import type { RoutePage } from '../routes/SiteRoutes';
import { docsTree, type DocsGroup } from '../routes/DocsTree';
import { routeHref } from '../routes/Address';

function PageBadgeOf({ page }: { page: RoutePage }) {
  const document = page.document;
  const metadata = document?.metadata ?? (document?.status && { status: document.status });
  const badge = metadata && pageBadge(metadata, version);
  return badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : null;
}

export function docsDestinations(
  currentPath: string,
  onChoose?: () => void,
): NavigationDrawerDestination[] {
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
