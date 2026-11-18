import { headingSlug } from '../documentation/SearchAnchors';
import { pagesOf, type RoutePage } from './SiteRoutes';

export interface DocsGroup {
  label: string;
  id: string;
  pages: RoutePage[];
  groups: DocsGroup[];
}

export const docsTree: DocsGroup[] = (() => {
  const sections: DocsGroup[] = [];
  for (const page of pagesOf('docs')) {
    let section = sections.find((entry) => entry.label === page.section);
    if (!section) {
      section = { label: page.section, id: headingSlug(page.section), pages: [], groups: [] };
      sections.push(section);
    }
    if (!page.group) {
      section.pages.push(page);
      continue;
    }
    let group = section.groups.find((entry) => entry.label === page.group);
    if (!group) {
      const id = `${section.id}-${headingSlug(page.group)}`;
      group = { label: page.group, id, pages: [], groups: [] };
      section.groups.push(group);
    }
    group.pages.push(page);
  }
  return sections;
})();
