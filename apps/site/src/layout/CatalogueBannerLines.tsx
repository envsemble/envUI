import { LineArt, lineArtDrawings } from '@envsemble/envui';
import { useBannerAppear } from './BannerAppear';
import { bannerDrawingIndex } from './CatalogueBannerOrder';

/**
 * The picture behind a catalogue banner's text: one of envUI's LineArt drawings at the banner's
 * end, drawing itself in the first time the page opens in a while (BannerAppear.ts), cropped
 * from its start where the banner is narrow (Banners.css). The drawings take turns along the
 * catalogue's order, so neighbouring pages show different ones and a page always shows
 * the same (CatalogueBannerOrder.ts).
 */
export function CatalogueBannerLines({ subject }: { subject?: string }) {
  const drawing = lineArtDrawings[bannerDrawingIndex(subject, lineArtDrawings.length)]!;
  const motion = useBannerAppear(subject ?? '');
  return (
    <span className="site-banner-shapes" aria-hidden="true">
      <LineArt key={drawing} drawing={drawing} motion={motion} className="catalogue-banner-lines" />
    </span>
  );
}
