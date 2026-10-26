import { useRef, type CSSProperties } from 'react';
import { Column, Link, Text } from '@envsemble/envui';
import { routeHref } from '../navigation/Address';
import type { RoutePage } from '../navigation/SiteRoutes';
import { galleryPreviews } from '../previews/GalleryPreviews';
import { hasExample } from './LiveExample';
import { previewOf, TilePreview, useNear, type Preview } from './Related';

/** One group of a gallery, such as a kind of component or what people are doing. */
export interface GalleryGroup {
  /** Its heading; a gallery of one untitled group shows its tiles alone. */
  title?: string;
  /** The id of its heading, which the footer and other pages link to. */
  id: string;
  pages: RoutePage[];
}

/**
 * What a gallery tile shows of a page: the composition or example chosen for the gallery where
 * there is one (GalleryPreviews.tsx), else what a Related tile shows, the page's lead example or
 * its anatomy.
 */
export function galleryPreviewOf(page: RoutePage): Preview | undefined {
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
function windowOf(page: RoutePage) {
  const size = page.document && galleryPreviews[page.document.id]?.window;
  return (
    size &&
    ({
      '--catalogue-gallery-window-width': `${size.width}rem`,
      '--catalogue-gallery-window-height': `${size.height}rem`,
    } as CSSProperties)
  );
}

/**
 * One page's tile: its preview on the recessed canvas, rendered once near the viewport, and its name
 * in small, quiet text, so the group headings lead. The name is a heading one level under the
 * gallery's group, or under the page's title where the gallery has no groups.
 */
function GalleryTile({ page, level }: { page: RoutePage; level: 2 | 3 }) {
  const tile = useRef<HTMLLIElement>(null);
  const near = useNear(tile);
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <li ref={tile} className="catalogue-gallery-tile" style={windowOf(page)}>
      <TilePreview
        preview={galleryPreviewOf(page)}
        near={near}
        className="catalogue-related-stage catalogue-gallery-stage"
        whole
      />
      {/* The name is the link; it stretches over the picture, so the whole tile leads to the page. */}
      <Text
        render={<Heading />}
        variant="body-sm"
        emphasis="muted"
        className="catalogue-gallery-name"
      >
        <Link href={routeHref(page.path)} underline={false} className="catalogue-gallery-link">
          {page.label ?? page.title}
        </Link>
      </Text>
    </li>
  );
}

/**
 * A gallery of pages, such as every component or every pattern: by group, a tile for each page
 * with a small live picture of it, inert, on the recessed canvas every example sits on. The groups'
 * headings lead, their tiles' names are quiet, and the groups stand well apart (Gallery.css).
 */
export function Gallery({ groups }: { groups: GalleryGroup[] }) {
  return (
    <Column gap={0} className="catalogue-gallery">
      {groups.map((group) =>
        group.title ? (
          <Column render={<section aria-labelledby={group.id} />} gap={5} key={group.id}>
            <Text
              render={<h2 />}
              variant="headline"
              id={group.id}
              className="catalogue-gallery-group"
            >
              {group.title}
            </Text>
            <ul className="catalogue-gallery-grid">
              {group.pages.map((page) => (
                <GalleryTile key={page.path} page={page} level={3} />
              ))}
            </ul>
          </Column>
        ) : (
          <ul className="catalogue-gallery-grid" key={group.id}>
            {group.pages.map((page) => (
              <GalleryTile key={page.path} page={page} level={2} />
            ))}
          </ul>
        ),
      )}
    </Column>
  );
}
