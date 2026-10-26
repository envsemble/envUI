/**
 * The pattern behind a Docs banner's text, a picture hidden from assistive technology: the envUI
 * mark's circle and pill in outline at its end, as on a plan, colored by Banners.css.
 */
export function BannerShapes() {
  return (
    <span className="docs-banner-shapes" aria-hidden="true">
      <span className="docs-banner-shape" data-shape="circle" data-corner="top-end" />
      <span className="docs-banner-shape" data-shape="pill" data-corner="bottom-end" />
    </span>
  );
}
