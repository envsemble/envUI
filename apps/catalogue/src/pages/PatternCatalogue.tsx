import { pagesOf } from '../navigation/DocumentationRoutes';
import { Gallery } from '../template/Gallery';

/**
 * Every pattern, a tile with its preview for each, in one gallery without group headings, in the
 * order the index lists the patterns.
 */
export function PatternCatalogue() {
  const pages = pagesOf('site').filter((entry) => entry.kind === 'pattern');
  return <Gallery groups={[{ id: 'patterns', pages }]} />;
}
