import { useRef } from 'react';
import { Column, Link, Row, Text } from '@envsemble/envui';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { routeHref } from '../routes/Address';
import type { RoutePage } from '../routes/SiteRoutes';
import { useAutoplay } from '../motion/Autoplay';
import { usePlaying } from '../motion/usePlaying';
import { TileStage } from './TileStage';
import { useNear } from './useNear';
import { ownsFrame, tilePictureOf, type TilePicture } from '../tiles/TilePictures';
import { preloadTile } from '../tiles/Tiles';

export interface GalleryGroup {
  title?: string;
  id: string;
  pages: RoutePage[];
}

function galleryPictureOf(page: RoutePage): TilePicture | undefined {
  return page.document && tilePictureOf(page.document);
}

function GalleryTile({ page, level }: { page: RoutePage; level: 2 | 3 }) {
  const tile = useRef<HTMLLIElement>(null);
  const near = useNear(tile, () => page.document && preloadTile(page.document.id));
  const [playing, playOn] = usePlaying();
  const autoplay = useAutoplay(tile, playing);
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <li ref={tile} className="catalogue-gallery-tile" {...playOn}>
      <div className="catalogue-gallery-picture">
        <TileStage
          picture={galleryPictureOf(page)}
          near={near}
          playing={playing || autoplay}
          className="catalogue-tile-stage catalogue-gallery-stage"
          ownFrame={ownsFrame(page.document?.id)}
        />
      </div>
      <Row align="center" justify="between" gap={2} className="catalogue-gallery-meta">
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
