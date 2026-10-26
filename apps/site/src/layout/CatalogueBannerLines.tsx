import { LineArt, lineArtDrawings } from '@envsemble/envui';
import { bannerDrawingIndex } from './CatalogueBannerOrder';

/**
 * The picture behind a catalogue banner's text: one of envUI's LineArt drawings at the banner's
 * end, cropped from its start where the banner is narrow (Banners.css). The drawings take turns
 * along the catalogue's order, so neighbouring pages show different ones and a page always shows
 * the same (CatalogueBannerOrder.ts).
 */
export function CatalogueBannerLines({ subject }: { subject?: string }) {
  const drawing = lineArtDrawings[bannerDrawingIndex(subject, lineArtDrawings.length)]!;
  return (
    <span className="site-banner-shapes" aria-hidden="true">
      <LineArt drawing={drawing} className="catalogue-banner-lines" />
    </span>
  );
}
