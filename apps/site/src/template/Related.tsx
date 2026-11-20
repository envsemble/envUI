import { useId, useRef, type ReactNode } from 'react';
import { Column, Link, Row, Text } from '@envsemble/envui';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import type { DocumentationMetadata } from '../documentation/DocumentationTypes';
import { PageMarkdown } from '../markdown/PageMarkdown';
import { useAutoplay } from '../motion/Autoplay';
import { usePlaying } from '../motion/usePlaying';
import { TileStage } from '../figures/TileStage';
import { useNear } from '../figures/useNear';
import { alternativesOf, type Alternative } from './RelatedPages';
import type { TilePicture } from '../tiles/TilePictures';
import { pendingAttribute, useSectionOutline } from '../markdown/SectionOutline';

function RelatedTile({
  picture,
  near,
  ownFrame,
  children,
}: {
  picture?: TilePicture;
  near: boolean;
  ownFrame: boolean;
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
          ownFrame={ownFrame}
        />
      </div>
      <div className="catalogue-gallery-meta catalogue-related-meta">{children}</div>
    </li>
  );
}

function Tiles({ alternatives, path }: { alternatives: Alternative[]; path: string }) {
  const list = useRef<HTMLUListElement>(null);
  const near = useNear(list);
  const id = useId();
  return (
    <ul ref={list} className="catalogue-related-tiles" data-count={alternatives.length}>
      {alternatives.map(({ key, name, href, picture, line, ownFrame }, index) => (
        <RelatedTile key={key} picture={picture} near={near} ownFrame={ownFrame}>
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
          <div className="catalogue-related-line catalogue-gallery-slide" id={`${id}-${index}`}>
            <PageMarkdown markdown={line} path={path} linkless />
          </div>
        </RelatedTile>
      ))}
    </ul>
  );
}

export const relatedId = 'related';
export const relatedTitle = 'Related';

export function Related({ metadata, path }: { metadata: DocumentationMetadata; path: string }) {
  const alternatives = alternativesOf(metadata);
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
      <Text render={<h2 />} variant="headline" id={relatedId}>
        {relatedTitle}
      </Text>
      {!outline && <Tiles alternatives={alternatives} path={path} />}
    </Column>
  );
}
