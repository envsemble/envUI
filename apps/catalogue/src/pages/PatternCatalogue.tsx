import { pagesOf } from '../navigation/DocumentationRoutes';
import { Gallery, type GalleryGroup } from '../template/Gallery';

/** The id of a pattern group's heading in the patterns gallery, such as patterns-frame-the-application. */
export const patternGroupId = (group: string) =>
  `patterns-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`;

/**
 * Every pattern, a tile with its preview for each, by what people are doing: the groups in the
 * order the index lists the patterns, so a new pattern takes its place from its page alone.
 */
export function PatternCatalogue() {
  const groups = new Map<string, GalleryGroup>();
  for (const page of pagesOf('site').filter((entry) => entry.kind === 'pattern')) {
    const title = page.group ?? 'Patterns';
    const group = groups.get(title) ?? { title, id: patternGroupId(title), pages: [] };
    group.pages.push(page);
    groups.set(title, group);
  }
  return <Gallery groups={[...groups.values()]} />;
}
