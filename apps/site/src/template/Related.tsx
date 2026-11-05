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
  legible = false,
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
  /**
   * Whether it is drawn no smaller than a legible scale, cropped by its stage, as the patterns'
   * gallery draws each scene, so its words can be read.
   */
  legible?: boolean;
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
          <Playback playing={plays} rest="start" root={canvasElement} redraw>
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
  useFit(stage, canvas, shown, whole || tile, tile, plays, ownSize, legible);
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
        shown &&
        crop(
          ownSize || legible,
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
          </div>,
        )
      )}
      {/* After the canvas, which hides it once the picture is fitted (Related.css). Only as the
          tile nears the view, as its picture starts loading: a skeleton pulses on every frame,
          and a gallery's tiles far from the view would keep the page busy restyling them. */}
      {shown && <TileSkeleton />}
    </Theme>
  );
}

/**
 * A canvas drawn at its own size, in a box the stage's size that fades out what is cut off at its
 * bottom and its end (Gallery.css): a mask on the box rather than on the canvas, whose own box
 * doesn't hold what opens past it, and not on the stage, whose fill stays whole.
 */
const crop = (ownSize: boolean, canvas: ReactNode) =>
  ownSize ? <div className="catalogue-related-crop">{canvas}</div> : canvas;

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

/**
 * The box an element scrolls in, such as the scaffold's body the page scrolls inside, or none where
 * it scrolls with the document.
 */
function scrollerOf(element: Element) {
  for (let node = element.parentElement; node; node = node.parentElement)
    if (/auto|scroll|overlay/.test(getComputedStyle(node).overflowY)) return node;
  return null;
}

/**
 * Whether an element is near the viewport, once: the tiles render their examples from then on.
 * Further off, `approach` runs once, such as to start loading a tile's module, so it is there by
 * the time the tile renders. Near is measured in the box the page scrolls in: measured against the
 * window, that box would clip the tiles until they scroll into it, and a margin around the window
 * would never look ahead.
 */
export function useNear(
  element: RefObject<HTMLElement | null>,
  approach?: () => Promise<unknown> | void,
) {
  const [near, setNear] = useState(false);
  const approaching = useRef(approach);
  approaching.current = approach;
  useEffect(() => {
    const target = element.current;
    if (!target || near) return;
    const root = scrollerOf(target);
    // What is in view renders at once, as after a jump down the page; what is near it once the
    // page is idle, one tile after another, while it stays near: a tile scrolled past before its
    // turn comes waits until it nears the view again.
    const watch = (margin: string, enter: () => void, leave: () => void = () => {}) => {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries.at(-1);
          if (entry?.isIntersecting) enter();
          else leave();
        },
        { root, rootMargin: margin },
      );
      observer.observe(target);
      return observer;
    };
    let cancelNear = () => {};
    let cancelAhead = () => {};
    const inView = watch('0px', () => {
      cancelNear();
      setNear(true);
    });
    const close = watch(
      '600px 0px',
      () => {
        cancelNear();
        cancelNear = whenIdle(() => startTransition(() => setNear(true)));
      },
      () => cancelNear(),
    );
    let approached = false;
    const ahead = approaching.current
      ? watch(
          '1800px 0px',
          () => {
            cancelAhead();
            cancelAhead = whenIdle(() => {
              approached = true;
              ahead?.disconnect();
              return approaching.current?.();
            });
          },
          () => {
            if (!approached) cancelAhead();
          },
        )
      : null;
    return () => {
      inView.disconnect();
      close.disconnect();
      ahead?.disconnect();
      cancelNear();
      cancelAhead();
    };
  }, [element, near]);
  return near;
}

/**
 * The tasks waiting for the page to be idle, run one to each idle moment, so the tiles ahead of the
 * view come in one by one rather than all at once, each fitted before the next, and what is in
 * view, such as the tiles after a jump down the page, loads and renders first.
 */
const idleTasks = new Set<() => Promise<unknown> | void>();
let idleRunning = false;

function runIdle() {
  const [task] = idleTasks;
  if (!task) {
    idleRunning = false;
    return;
  }
  idleTasks.delete(task);
  // A task that loads, such as a tile's module, holds the next until it has loaded.
  void Promise.resolve(task())
    .catch(() => undefined)
    .then(() => later(runIdle));
}

const later = (step: () => void) =>
  typeof requestIdleCallback === 'function'
    ? requestIdleCallback(step, { timeout: 1000 })
    : window.setTimeout(step, 50);

/** Runs a task once the page is idle, after those before it; returns its cancel. */
function whenIdle(task: () => Promise<unknown> | void) {
  idleTasks.add(task);
  if (!idleRunning) {
    idleRunning = true;
    later(runIdle);
  }
  return () => void idleTasks.delete(task);
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
