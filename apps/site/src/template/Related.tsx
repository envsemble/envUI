import { useId, useRef, type ReactNode } from 'react';
import { Column, Link, Row, Text } from '@envsemble/envui';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import type { DocumentationMetadata } from '../../../../scripts/docs/model/DocumentationTypes';
import { Documentation } from '../pages/Documentation';
import { useAutoplay } from '../motion/Autoplay';
import { usePlaying } from '../motion/Motion';
import { TileStage } from '../figures/TileStage';
import { useNear } from '../figures/useNear';
import { alternativesOf, type Alternative, type TilePicture } from './RelatedPages';
import { pendingAttribute, useSectionOutline } from './SectionOutline';

/**
 * One alternative's tile, whose picture plays while the pointer or the keyboard is on it, and where
 * the reader can't hover, while it is the tile in the middle of the viewport, as a gallery's does.
 * It is a gallery's cell (Gallery.tsx, Gallery.css): on a stage of one shape, a component at its
 * own size and a pattern's scene at a legible scale, and under it its name and when to pick it,
 * which slide into view with the picture as the pointer comes on.
 */
function RelatedTile({
  picture,
  near,
  frame,
  children,
}: {
  picture?: TilePicture;
  near: boolean;
  frame?: Alternative['frame'];
  children: ReactNode;
}) {
  const tile = useRef<HTMLLIElement>(null);
  const [playing, playOn] = usePlaying();
  const autoplay = useAutoplay(tile, playing);
  return (
    <li ref={tile} className="catalogue-related-tile catalogue-gallery-tile" {...playOn}>
      <div className="catalogue-gallery-picture">
        <TileStage
          picture={picture}
          near={near}
          playing={playing || autoplay}
          className="catalogue-tile-stage catalogue-gallery-stage"
          whole
          ownSize={frame === 'own'}
          legible={frame === 'legible'}
        />
      </div>
      <div className="catalogue-gallery-meta catalogue-related-meta">{children}</div>
    </li>
  );
}

/** The alternatives as tiles of one size: a picture on its stage, the name and its situations. */
function Tiles({ alternatives, path }: { alternatives: Alternative[]; path: string }) {
  const list = useRef<HTMLUListElement>(null);
  const near = useNear(list);
  const id = useId();
  return (
    <ul
      ref={list}
      className="catalogue-related-tiles"
      data-count={alternatives.length}
      // A scene's tile takes a larger stage, as in its gallery: so does every tile beside it.
      data-scenes={alternatives.some(({ frame }) => frame === 'legible') ? '' : undefined}
    >
      {alternatives.map(({ key, name, href, picture, line, frame }, index) => (
        <RelatedTile key={key} picture={picture} near={near} frame={frame}>
          {/* The name is the tile's one link, described by when to pick it; it stretches over the
              whole tile, picture, name and why, so the tile is one target and one box
              (Gallery.css). Its words slide, not the link, which would otherwise hold the stretch
              to the row it slides in. */}
          <Row align="center" justify="between" gap={2}>
            <Text render={<span />} className="catalogue-related-name">
              {href ? (
                <Link
                  href={href}
                  underline={false}
                  className="catalogue-related-link"
                  aria-describedby={`${id}-${index}`}
                >
                  <span className="catalogue-gallery-label catalogue-gallery-slide">{name}</span>
                </Link>
              ) : (
                <span className="catalogue-gallery-label catalogue-gallery-slide">{name}</span>
              )}
            </Text>
            <IconArrowForward
              className="catalogue-gallery-arrow catalogue-gallery-slide"
              aria-hidden="true"
            />
          </Row>
          {/* Words alone, its links as text: the tile holds one link, its name's. */}
          <div className="catalogue-related-line catalogue-gallery-slide" id={`${id}-${index}`}>
            <Documentation markdown={line} path={path} linkless />
          </div>
        </RelatedTile>
      ))}
    </ul>
  );
}

/**
 * Related, the last section of a component or pattern page: a tile for each component or page its
 * frontmatter names, with when to pick it instead. It ends the page (TemplateContent.tsx).
 */
export function Related({ metadata, path }: { metadata: DocumentationMetadata; path: string }) {
  const alternatives = alternativesOf(metadata);
  // Waiting its turn to show, it renders its heading alone (SectionOutline).
  const outline = useSectionOutline();
  if (!alternatives.length) return null;
  return (
    <Column
      render={<section />}
      gap={4}
      className="catalogue-related"
      data-section="related"
      {...pendingAttribute(outline)}
    >
      <Text render={<h2 />} variant="headline" id="related">
        Related
      </Text>
      {!outline && <Tiles alternatives={alternatives} path={path} />}
    </Column>
  );
}
