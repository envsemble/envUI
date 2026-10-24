import type { ReactNode } from 'react';

/**
 * The envUI mark's four shapes, a pill beside a circle over a circle beside a pill, drawn large
 * behind a banner's text: a picture, hidden from assistive technology. Banners.css places and
 * colors them for each kind of banner; `children`, such as a page's icon, sit in the circle at the
 * top end.
 */
export function BannerShapes({ children }: { children?: ReactNode }) {
  return (
    <span className="docs-banner-shapes" aria-hidden="true">
      <span className="docs-banner-shape" data-shape="pill" data-corner="top-start" />
      <span className="docs-banner-shape" data-shape="circle" data-corner="top-end">
        {children}
      </span>
      <span className="docs-banner-shape" data-shape="circle" data-corner="bottom-start" />
      <span className="docs-banner-shape" data-shape="pill" data-corner="bottom-end" />
    </span>
  );
}
