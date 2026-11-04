import {
  Component,
  startTransition,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { Column, Link, Text, Theme, useTheme } from '@envsemble/envui';
import { IconArticle } from '@envsemble/envui/icons/Article';
import type { DocumentationMetadata } from '../shared/DocumentationTypes';
import { Documentation } from '../pages/Documentation';
import { useAutoplay } from '../motion/Autoplay';
import { Playback, PreviewOverlays, usePlaying } from '../motion/Motion';
import { useDisplaySettings } from '../theme/DisplaySettings';
import { ExampleRender } from '../figures/LiveExample';
import { PageSpecimen } from '../figures/PageSpecimens';
import { alternativesOf, type Alternative, type Preview } from './RelatedPages';
import { TileSkeleton } from './Loading';
import { useFit } from './useFit';
import { pendingAttribute, useSectionOutline } from './SectionOutline';

/**
 * Keeps a tile that fails to render to itself: it shows nothing, and the gallery around it its
 * other tiles, rather than the page failing.
 */
class TileBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * A tiny live picture of an alternative on the recessed canvas: its example, inert and scaled down
 * to fit, rendered once the tiles near the viewport; for a page without one, its specimen, in the
 * same way, and from then until it shows, a skeleton of the stage. Without either, a page icon. A page's own
 * tile, or a gallery's composition, takes the example's place. A gallery's tile passes its own
 * stage class. While `playing`, unless the sidebar paused every animation, its animation plays
 * (motion/Motion.tsx), and it rests at its still once that ends.
 */
export function TilePreview({
  preview,
  near,
  playing = false,
  className = 'catalogue-related-stage',
  whole = false,
  ownSize: atOwnSize = false,
}: {
  preview?: Preview;
  near: boolean;
  /** Whether the pointer or the keyboard is on the tile, which plays its animation. */
  playing?: boolean;
  className?: string;
  /** Whether the window it lays out in counts whole as it is fitted, as a gallery's does. */
  whole?: boolean;
  /**
   * Whether it is drawn at its own size, cropped by its stage, as the components' gallery draws
   * every component at one scale; a drawing, whose window is smaller than the tiles' (Tiles.ts),
   * is drawn larger still.
   */
  ownSize?: boolean;
}) {
  const Composition = preview?.composition;
  const theme = useTheme();
  const { motionPaused } = useDisplaySettings();
  const plays = playing && !motionPaused;
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  // The canvas, for the pointer no one sees, which finds the preview's elements in it.
  const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
  const shown = Boolean(preview && near);
  const subject =
    preview &&
    (Composition ? (
      <TileBoundary>
        <Suspense fallback={null}>
          <Playback playing={plays} rest="start" root={canvasElement}>
            <Composition />
          </Playback>
        </Suspense>
      </TileBoundary>
    ) : preview.specimen ? (
      <PageSpecimen id={preview.specimen} />
    ) : (
      <ExampleRender page={preview.page} name={preview.name} fallback={null} />
    ));
  const tile = Boolean(preview?.tile);
  const drawing = Boolean(preview?.window && preview.window.width < 14);
  const ownSize = atOwnSize && !drawing;
  useFit(stage, canvas, shown, whole || tile, tile, plays, ownSize);
  useStillAtRest(canvasElement, tile && !plays);
  return (
    <Theme
      {...theme}
      ref={stage}
      className={className}
      data-example={preview?.specimen || Composition ? undefined : preview?.name}
      data-catalogue-specimen={preview?.specimen}
      data-stage={preview?.stage}
      data-empty={preview ? undefined : ''}
      data-playing={plays ? '' : undefined}
    >
      {!preview ? (
        <IconArticle className="catalogue-related-placeholder" aria-hidden />
      ) : (
        shown && (
          <div
            ref={(element) => {
              canvas.current = element;
              setCanvasElement(element);
            }}
            className="catalogue-related-canvas"
            data-tile={preview.tile ? '' : undefined}
            data-own-size={ownSize ? '' : undefined}
            style={
              preview.window &&
              ({
                '--catalogue-tile-width': `${preview.window.width}rem`,
                '--catalogue-tile-height': `${preview.window.height}rem`,
              } as CSSProperties)
            }
            inert
            aria-hidden
          >
            {preview.open ? <PreviewOverlays>{subject}</PreviewOverlays> : subject}
          </div>
        )
      )}
      {/* After the canvas, which hides it once the picture is fitted (Related.css). Only as the
          tile nears the view, as its picture starts loading: a skeleton pulses on every frame,
          and a gallery's tiles far from the view would keep the page busy restyling them. */}
      {shown && <TileSkeleton />}
    </Theme>
  );
}

/** Whether an animation loops for ever, as a skeleton's pulse or a spinner's turn does. */
const loops = (animation: Animation) =>
  animation.effect?.getComputedTiming().iterations === Infinity;

/**
 * Holds a resting tile still: the animations in it that loop for ever, such as a skeleton's
 * pulse, pause until it plays, also those that start while it rests. An entrance, which ends,
 * runs on, so nothing is left halfway in.
 */
function useStillAtRest(canvas: HTMLElement | null, resting: boolean) {
  useEffect(() => {
    if (!canvas) return;
    const looping = () => canvas.getAnimations({ subtree: true }).filter(loops);
    if (!resting) {
      for (const animation of looping()) animation.play();
      return;
    }
    const pause = () => {
      for (const animation of looping()) animation.pause();
    };
    pause();
    // A loop that starts later, such as a skeleton drawn anew, pauses as it starts.
    canvas.addEventListener('animationstart', pause);
    const changes = new MutationObserver(pause);
    changes.observe(canvas, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => {
      canvas.removeEventListener('animationstart', pause);
      changes.disconnect();
    };
  }, [canvas, resting]);
}

/** Whether an element is near the viewport, once: the tiles render their examples from then on. */
export function useNear(element: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const target = element.current;
    if (!target || near) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        // The examples load and render without holding up what the reader is doing.
        startTransition(() => setNear(true));
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [element, near]);
  return near;
}

/**
 * One alternative's tile, whose preview plays while the pointer or the keyboard is on it, and where
 * the reader can't hover, while it is the tile in the middle of the viewport, as a gallery's does.
 */
function RelatedTile({
  preview,
  near,
  children,
}: {
  preview?: Preview;
  near: boolean;
  children: ReactNode;
}) {
  const tile = useRef<HTMLLIElement>(null);
  const [playing, playOn] = usePlaying();
  const autoplay = useAutoplay(tile, playing);
  return (
    <li ref={tile} className="catalogue-related-tile" {...playOn}>
      <TilePreview preview={preview} near={near} playing={playing || autoplay} />
      {children}
    </li>
  );
}

/** The alternatives as tiles of one size: a preview on its stage, the name and its situations. */
function Tiles({ alternatives, path }: { alternatives: Alternative[]; path: string }) {
  const list = useRef<HTMLUListElement>(null);
  const near = useNear(list);
  return (
    <ul ref={list} className="catalogue-related-tiles" data-count={alternatives.length}>
      {alternatives.map(({ key, name, href, preview, line }) => (
        <RelatedTile key={key} preview={preview} near={near}>
          {/* The name is the link; it stretches over the picture, so a pointer can follow it from
              there too without a link around the preview, whose example may hold links itself. */}
          <Text render={<span />} className="catalogue-related-name">
            {href ? (
              <Link href={href} className="catalogue-related-link">
                {name}
              </Link>
            ) : (
              name
            )}
          </Text>
          <div className="catalogue-related-line">
            <Documentation markdown={line} path={path} />
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
