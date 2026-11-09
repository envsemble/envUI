import { componentGroupId } from './PageModel';
import { docsRoute, homeRoute } from './Address';
import { docsTree } from './DocsTree';
import { sectionHome, type RoutePage, type CatalogueSection } from './SiteRoutes';

/** One level of a page's trail: its name, and the route it leads to, where it leads to one. */
export interface TrailStep {
  label: string;
  route?: string;
}

/**
 * The trail from the catalogue's home down to one of its pages, for its breadcrumbs, as the Docs'
 * pages have theirs (docsTrail): envUI, the page's section and, for a component, its kind, then the
 * page itself, such as envUI / Components / Forms & selection / Slider. A section leads where its
 * destination in the rail does, to all of its pages; a kind of component leads to its heading among
 * all the components. The page of all foundations, components or patterns is its section's own
 * step, and the Overview's pages follow envUI alone.
 */
export function catalogueTrail(page: RoutePage): TrailStep[] {
  const steps: TrailStep[] = [{ label: 'envUI', route: homeRoute }];
  if (page.kind === 'home') return steps;
  // A catalogue page's section is one of its destinations.
  const section = sectionHome(page.section as CatalogueSection);
  const sectionIndex =
    page.kind === 'foundations' || page.kind === 'components' || page.kind === 'patterns';
  if (!sectionIndex && section.kind !== 'home')
    steps.push({ label: page.section, route: section.path });
  if (page.kind === 'component' && page.group)
    steps.push({
      label: page.group,
      route: `${section.path}?${new URLSearchParams({ section: componentGroupId(page.group) })}`,
    });
  steps.push({ label: page.title, route: page.path });
  return steps;
}

/**
 * The trail from the Docs' home down to a page of the Docs, for its breadcrumbs: Docs, leading to
 * their home, its section and its group, which say where the page is and lead nowhere, as the
 * navigation beside the page lists their pages, then the page itself, such as Docs / Components /
 * Actions / Button. A section named as its one page, such as Changelog, is left out, and on the
 * home Docs leads nowhere either, as the page is their home.
 */
export function docsTrail(page: RoutePage): TrailStep[] {
  const steps: TrailStep[] = [
    { label: 'Docs', route: page.path === docsRoute ? undefined : docsRoute },
  ];
  const section = docsTree.find((entry) => entry.label === page.section);
  if (section && section.label !== page.title) steps.push({ label: section.label });
  const group = section?.groups.find((entry) => entry.label === page.group);
  if (group) steps.push({ label: group.label });
  steps.push({ label: page.title, route: page.path });
  return steps;
}
