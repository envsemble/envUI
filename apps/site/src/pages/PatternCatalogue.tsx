import { pagesOf } from '../navigation/SiteRoutes';
import { Gallery, type GalleryGroup } from '../figures/Gallery';

/** The id of a group's heading on the patterns' overview, such as patterns-keep-people-informed. */
const patternGroupId = (group: string) =>
  `patterns-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`;

/**
 * Every pattern, a tile for each, under the headings of what people are doing,
 * the groups the drawer lists, in the order the index lists the patterns.
 */
export function PatternCatalogue() {
  const pages = pagesOf('catalogue').filter((entry) => entry.kind === 'pattern');
  const groups: GalleryGroup[] = [];
  for (const page of pages) {
    const title = page.group ?? 'Patterns';
    let group = groups.find((each) => each.title === title);
    if (!group) groups.push((group = { title, id: patternGroupId(title), pages: [] }));
    group.pages.push(page);
  }
  return <Gallery groups={groups} />;
}
