import { headingSlug } from '../documentation/SearchAnchors';
import { pagesOf, type RoutePage } from './SiteRoutes';

/**
 * A group of the Docs' navigation, such as Guides, or Actions within Components: its pages, then
 * its own groups, with the id of its heading on the Docs' home.
 */
export interface DocsGroup {
  label: string;
  id: string;
  pages: RoutePage[];
  groups: DocsGroup[];
}

/**
 * The Docs' pages as a tree, in reading order: each section of the navigation, such as Get started
 * or Components, with its pages and its groups, such as the kinds of component and the patterns'
 * intents.
 */
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
