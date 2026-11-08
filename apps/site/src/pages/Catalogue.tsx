import { componentGroups, componentGroupId } from './PageModel';
import { pagesOf } from '../navigation/SiteRoutes';
import { Gallery, type GalleryGroup } from '../figures/Gallery';

/** Every component of the catalogue, a tile for each, by group; Field is in the Docs only. */
export function Catalogue() {
  const pages = pagesOf('catalogue').filter((page) => page.kind === 'component');
  const groups: GalleryGroup[] = componentGroups.map((group) => ({
    title: group,
    id: componentGroupId(group),
    pages: pages.filter((page) => page.group === group),
  }));
  return <Gallery groups={groups.filter((group) => group.pages.length)} />;
}
