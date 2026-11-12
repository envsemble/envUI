import { LineArt, lineArtDrawings } from '@envsemble/envui';
import { pagesOf } from '../routes/SiteRoutes';
import { bannerDrawingIndex, bannerSubject } from './CatalogueBannerOrder';

/** Each Docs page's place in the Docs' order, by its title, as its banner names it. */
const places = new Map(pagesOf('docs').map((page, index) => [page.title, index]));

/** What each catalogue page's banner is drawn for, by its title, which its Docs page shares. */
const catalogueSubjects = new Map(
  pagesOf('catalogue').map((page) => [page.title, bannerSubject(page)]),
);

/**
 * The picture behind a Docs banner's text: one of envUI's LineArt drawings, still, at the
 * banner's end, cropped from its start where the banner is narrow (Banners.css). A page the
 * catalogue shows too, such as a component's, takes the drawing of its catalogue banner, so the two
 * parts' banners of one page match; the Docs' own pages, such as the guides, take turns along the
 * Docs' order, so neighbouring pages show different ones and a page always shows the same.
 */
export function DocsBannerLines({ title }: { title: string }) {
  const subject = catalogueSubjects.get(title);
  const index =
    subject === undefined
      ? (places.get(title) ?? 0) % lineArtDrawings.length
      : bannerDrawingIndex(subject, lineArtDrawings.length);
  return (
    <span className="site-banner-shapes" aria-hidden="true">
      <LineArt drawing={lineArtDrawings[index]} className="docs-banner-lines" />
    </span>
  );
}
