import { useRef, type CSSProperties } from 'react';
import { Column, Link, Text } from '@envsemble/envui';
import { routeHref } from '../navigation/Address';
import type { SitePage } from '../navigation/DocumentationRoutes';
import { galleryPreviews } from '../previews/GalleryPreviews';
import { hasExample } from './LiveExample';
import { previewOf, TilePreview, useNear, type Preview } from './Related';

/** One group of a gallery, such as a kind of component or what people are doing. */
export interface GalleryGroup {
  title: string;
  /** The id of its heading, which the footer and other pages link to. */
  id: string;
  pages: SitePage[];
}

/**
 * What a gallery tile shows of a page: the composition or example chosen for the gallery where
 * there is one (GalleryPreviews.tsx), else what a Related tile shows, the page's lead example or
 * its anatomy.
 */
export function galleryPreviewOf(page: SitePage): Preview | undefined {
  const document = page.document;
  if (!document) return undefined;
  const chosen = galleryPreviews[document.id];
  // An example that a page's rework removed leaves the tile its lead example.
  if (!chosen || (chosen.example && !hasExample(document.id, chosen.example)))
    return previewOf(document);
  return {
    page: document.id,
    name: chosen.example ?? document.id,
    open: Boolean(chosen.open),
    stage: chosen.stage,
    composition: chosen.render,
  };
}

/** The window a tile's picture lays out in, where it needs a larger one than the gallery's. */
function windowOf(page: SitePage) {
  const size = page.document && galleryPreviews[page.document.id]?.window;
  return (
    size &&
    ({
      '--docs-gallery-window-width': `${size.width}rem`,
      '--docs-gallery-window-height': `${size.height}rem`,
    } as CSSProperties)
  );
}

/** One page's tile: its preview on the recessed canvas, rendered once near the viewport, and its name. */
function GalleryTile({ page }: { page: SitePage }) {
  const tile = useRef<HTMLLIElement>(null);
  const near = useNear(tile);
  return (
    <li ref={tile} className="docs-gallery-tile" style={windowOf(page)}>
      <TilePreview
        preview={galleryPreviewOf(page)}
        near={near}
        className="docs-related-stage docs-gallery-stage"
        whole
      />
      {/* The name is the link; it stretches over the picture, so the whole tile leads to the page. */}
      <Text render={<h3 />} variant="body" className="docs-gallery-name">
        <Link href={routeHref(page.path)} underline={false} className="docs-gallery-link">
          {page.label ?? page.title}
        </Link>
      </Text>
    </li>
  );
}

/**
 * A gallery of pages, such as every component or every pattern: by group, a tile for each page
 * with a small live picture of it, inert, on the recessed canvas every example sits on.
 */
export function Gallery({ groups }: { groups: GalleryGroup[] }) {
  return (
    <Column gap={8} className="docs-gallery">
      {groups.map((group) => (
        <Column render={<section aria-labelledby={group.id} />} gap={5} key={group.id}>
          <Text render={<h2 />} variant="title" id={group.id}>
            {group.title}
          </Text>
          <ul className="docs-gallery-grid">
            {group.pages.map((page) => (
              <GalleryTile key={page.path} page={page} />
            ))}
          </ul>
        </Column>
      ))}
    </Column>
  );
}
