import { componentGroupId } from '../Reference';
import { homeRoute } from './Address';
import { sectionHome, type RoutePage, type TrailStep, type CatalogueSection } from './SiteRoutes';

/**
 * The trail from the catalogue's home down to one of its pages, for its breadcrumbs, as the Docs'
 * pages have theirs (docsTrail): envUI, the page's section and, for a component, its kind, then the
 * page itself, such as envUI / Components / Forms & selection / Slider. A section leads where its
 * destination in the rail does: Components and Patterns to all of them, Foundations to the first;
 * a kind of component leads to its heading among all the components. The page of all components or
 * all patterns is its section's own step, and the Overview's pages follow envUI alone.
 */
export function catalogueTrail(page: RoutePage): TrailStep[] {
  const steps: TrailStep[] = [{ label: 'envUI', route: homeRoute }];
  if (page.kind === 'home') return steps;
  const section = sectionHome(page.section as CatalogueSection);
  const sectionIndex = page.kind === 'components' || page.kind === 'patterns';
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
