import { LineArt, lineArtDrawings } from '@envsemble/envui';
import { useBannerAppear } from './BannerAppear';
import { bannerDrawingIndex } from './CatalogueBannerOrder';

export function CatalogueBannerLines({ subject }: { subject?: string }) {
  const drawing = lineArtDrawings[bannerDrawingIndex(subject, lineArtDrawings.length)];
  const motion = useBannerAppear(subject ?? '');
  return (
    <span className="site-banner-shapes" aria-hidden="true">
      <LineArt key={drawing} drawing={drawing} motion={motion} className="catalogue-banner-lines" />
    </span>
  );
}
