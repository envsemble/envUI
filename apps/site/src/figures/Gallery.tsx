import { useRef } from 'react';
import { Column, Link, Row, Text } from '@envsemble/envui';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { routeHref } from '../navigation/Address';
import type { RoutePage } from '../navigation/SiteRoutes';
import { useAutoplay } from '../motion/Autoplay';
import { usePlaying } from '../motion/Motion';
import { TilePreview, useNear } from '../template/Related';
import { frameOf, previewOf, type Preview } from '../template/RelatedPages';
import { preloadTile } from '../tiles/Tiles';

/** One group of a gallery, such as a kind of component or what people are doing. */
export interface GalleryGroup {
  /** Its heading; a gallery of one untitled group shows its tiles alone. */
  title?: string;
  /** The id of its heading, which the footer and other pages link to. */
  id: string;
  pages: RoutePage[];
}

/** What a gallery tile shows of a page: its own tile, as a Related tile does (Related.tsx). */
export function galleryPreviewOf(page: RoutePage): Preview | undefined {
  return page.document && previewOf(page.document);
}

/**
 * One page's tile, a cell of the gallery's grid: its preview, rendered once near the viewport, in
 * the reader's theme, and its name under it. The name shows as the pointer or the keyboard comes onto the tile, and
 * always where the reader can't hover; it is a heading one level under the gallery's group, or
 * under the page's title where the gallery has no groups. The preview plays while the pointer or
 * the keyboard is on the tile, and where the reader can't hover, while it is the tile in the middle
 * of the viewport (Autoplay.ts).
 */
function GalleryTile({ page, level }: { page: RoutePage; level: 2 | 3 }) {
  const tile = useRef<HTMLLIElement>(null);
  const near = useNear(tile, () => page.document && preloadTile(page.document.id));
  const [playing, playOn] = usePlaying();
  const autoplay = useAutoplay(tile, playing);
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <li ref={tile} className="catalogue-gallery-tile" {...playOn}>
      <div className="catalogue-gallery-picture">
        <TilePreview
          preview={galleryPreviewOf(page)}
          near={near}
          playing={playing || autoplay}
          className="catalogue-related-stage catalogue-gallery-stage"
          whole
          // Components show at their own size, one scale for all; a pattern's scene at a legible
          // scale, cropped to its middle.
          ownSize={frameOf(page.document?.id) === 'own'}
          legible={frameOf(page.document?.id) === 'legible'}
        />
      </div>
      <Row align="center" justify="between" gap={2} className="catalogue-gallery-meta">
        {/* The name is the cell's one link; it stretches over the whole cell, picture and name, so
            the cell is one target and one box (Gallery.css). Its words slide, not the link, which
            would otherwise hold the stretch to the row it slides in. */}
        <Text render={<Heading />} className="catalogue-gallery-name">
          <Link href={routeHref(page.path)} underline={false} className="catalogue-gallery-link">
            <span className="catalogue-gallery-label catalogue-gallery-slide">
              {page.label ?? page.title}
            </span>
          </Link>
        </Text>
        <IconArrowForward
          className="catalogue-gallery-arrow catalogue-gallery-slide"
          aria-hidden="true"
        />
      </Row>
    </li>
  );
}

/** Marks a group of patterns, whose scenes take larger, taller cards than a component's, fewer to a
 * row, so their words read (Gallery.css). */
const scenes = (group: GalleryGroup) =>
  group.pages.every((page) => page.kind === 'pattern') ? '' : undefined;

/**
 * A gallery of pages, such as every component or every pattern: by group, a tile for each page
 * with a small live picture of it, inert, on the recessed canvas every example sits on. The groups'
 * headings lead, their tiles' names read under each picture, and the groups stand well apart (Gallery.css).
 */
export function Gallery({ groups }: { groups: GalleryGroup[] }) {
  return (
    <Column gap={0} className="catalogue-gallery">
      {groups.map((group) =>
        group.title ? (
          <Column render={<section aria-labelledby={group.id} />} gap={4} key={group.id}>
            <Row align="center" justify="between" gap={3} className="catalogue-gallery-heading">
              <Text
                render={<h2 />}
                variant="title"
                id={group.id}
                className="catalogue-gallery-group"
              >
                {group.title}
              </Text>
              <Text variant="body-sm" emphasis="muted" render={<span />}>
                {group.pages.length}
              </Text>
            </Row>
            <ul className="catalogue-gallery-grid" data-scenes={scenes(group)}>
              {group.pages.map((page) => (
                <GalleryTile key={page.path} page={page} level={3} />
              ))}
            </ul>
          </Column>
        ) : (
          <ul className="catalogue-gallery-grid" key={group.id} data-scenes={scenes(group)}>
            {group.pages.map((page) => (
              <GalleryTile key={page.path} page={page} level={2} />
            ))}
          </ul>
        ),
      )}
    </Column>
  );
}
