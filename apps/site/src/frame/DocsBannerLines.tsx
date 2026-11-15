import { LineArt, lineArtDrawings } from '@envsemble/envui';
import { pagesOf } from '../routes/SiteRoutes';
import { bannerDrawingIndex, bannerSubject } from './CatalogueBannerOrder';

const docsPlaces = new Map(pagesOf('docs').map((page, index) => [page.title, index]));

const catalogueSubjects = new Map(
  pagesOf('catalogue').map((page) => [page.title, bannerSubject(page)]),
);

export function DocsBannerLines({ title }: { title: string }) {
  const subject = catalogueSubjects.get(title);
  const index =
    subject === undefined
      ? (docsPlaces.get(title) ?? 0) % lineArtDrawings.length
      : bannerDrawingIndex(subject, lineArtDrawings.length);
  return (
    <span className="site-banner-shapes" aria-hidden="true">
      <LineArt drawing={lineArtDrawings[index]} className="docs-banner-lines" />
    </span>
  );
}
