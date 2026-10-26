import { LineArt, lineArtDrawings } from '@envsemble/envui';
import { pagesOf } from '../navigation/SiteRoutes';

/** Each Docs page's place in the Docs' order, by its title, as its banner names it. */
const places = new Map(pagesOf('docs').map((page, index) => [page.title, index]));

/**
 * The picture behind a Docs banner's text: one of envUI's LineArt drawings, still, at the end of
 * the outlined banner, cropped from its start where the banner is narrow (Banners.css). The
 * drawings take turns along the Docs' order, as the catalogue's do along its own, so neighbouring
 * pages show different ones and a page always shows the same.
 */
export function DocsBannerLines({ title }: { title: string }) {
  const drawing = lineArtDrawings[(places.get(title) ?? 0) % lineArtDrawings.length]!;
  return (
    <span className="site-banner-shapes" aria-hidden="true">
      <LineArt drawing={drawing} className="docs-banner-lines" />
    </span>
  );
}
