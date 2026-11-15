import { componentGroupId } from './PageModel';
import { docsRoute, homeRoute } from './Address';
import { docsTree } from './DocsTree';
import { sectionHome, type RoutePage, type CatalogueSection } from './SiteRoutes';

export interface TrailStep {
  label: string;
  route?: string;
}

export function catalogueTrail(page: RoutePage): TrailStep[] {
  const steps: TrailStep[] = [{ label: 'envUI', route: homeRoute }];
  if (page.kind === 'home') return steps;
  const section = sectionHome(page.section as CatalogueSection);
  const sectionIndex = page.kind === 'foundations' || page.kind === 'components';
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
