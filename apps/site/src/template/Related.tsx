import {
  Component,
  startTransition,
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { Column, Link, Row, Text, Theme, useTheme } from '@envsemble/envui';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
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
import { AppScreen } from './AppTile';
import { useAppFit } from './useAppFit';
import { appTileFrame } from '../tiles/Tiles';
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
  // As it stops, a picture that played shows its still at once, drawn anew (Playback's `redraw`):
  // a crossfade from it as it played would show both, such as a spinner over the label it hid.
  const plays = playing && !motionPaused;
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  // The canvas, for the pointer no one sees, which finds the preview's elements in it.
  const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
  const shown = Boolean(preview && near);
  // How many animations its picture has, a pointer's script or a timeline: one without any, such
  // as a list of shortcuts, has no play to promise, and draws no ring under the pointer.
  const [animations, setAnimations] = useState(0);
  const [countAnimation] = useState(() => () => {
    setAnimations((count) => count + 1);
    return () => setAnimations((count) => count - 1);
  });
  const subject =
    preview &&
    (Composition ? (
      <TileBoundary>
        <Suspense fallback={null}>
          <Playback
            playing={plays}
            rest="start"
            root={canvasElement}
            countAnimation={countAnimation}
            redraw
          >
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
  // A piece of an application's frame fills its card instead (AppTile.tsx).
  const app = preview?.window?.app;
  const ownSize = atOwnSize && !drawing && !app;
  const scene = legible && !app;
  useFit(stage, canvas, shown && !app, whole || tile, tile, plays, ownSize, scene);
  useAppFit(stage, canvas, shown && Boolean(app), app?.least);
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
      data-scene={scene ? '' : undefined}
      data-still={Composition && animations > 0 ? undefined : ''}
    >
      {!preview ? (
        <IconArticle className="catalogue-related-placeholder" aria-hidden />
      ) : (
        shown &&
        crop(
          ownSize || scene,
          <div
            ref={(element) => {
              canvas.current = element;
              setCanvasElement(element);
            }}
            className="catalogue-related-canvas"
            data-tile={preview.tile ? '' : undefined}
            data-own-size={ownSize ? '' : undefined}
            data-overlay={ownSize && preview.window?.overlay ? '' : undefined}
            data-app={app ? appTileFrame : undefined}
            style={
              preview.window &&
              ({
                '--catalogue-tile-width': `${preview.window.width}rem`,
                '--catalogue-tile-height': `${preview.window.height}rem`,
                '--catalogue-own-popup-least': preview.window.popupLeast,
              } as CSSProperties)
            }
            inert
            aria-hidden
          >
            {preview.open ? (
              <PreviewOverlays>{wrapApp(Boolean(app), subject)}</PreviewOverlays>
            ) : (
              wrapApp(Boolean(app), subject)
            )}
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

/** A piece of an application's frame, on the screen its card shows it on (AppTile.tsx). */
const wrapApp = (app: boolean, subject: ReactNode) =>
  app ? <AppScreen>{subject}</AppScreen> : subject;

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
    // What is in view renders at once, as after a jump down the page, every tile that comes into
    // view together in one pass (inViewTogether); what is near it once the page is idle, one tile
    // after another, while it stays near: a tile scrolled past before its turn comes waits until it
    // nears the view again.
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
    let shown = false;
    const inView = watch('0px', () => {
      cancelNear();
      if (shown) return;
      shown = true;
      inViewTogether(approaching.current, () => setNear(true));
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

/** The tiles that came into view in this frame: what each loads, and how each renders. */
interface CameIntoView {
  loads: Promise<unknown>[];
  renders: (() => void)[];
}
let cameIntoView: CameIntoView | null = null;

/**
 * Renders the tiles that come into view in one frame, such as after a jump down the page, in one
 * pass, once what each loads, such as its module, is there: they appear together rather than one
 * by one as each arrives.
 */
function inViewTogether(load: (() => Promise<unknown> | void) | undefined, render: () => void) {
  if (!cameIntoView) {
    const batch: CameIntoView = { loads: [], renders: [] };
    cameIntoView = batch;
    requestAnimationFrame(() => {
      cameIntoView = null;
      void Promise.all(batch.loads).then(() => {
        for (const each of batch.renders) each();
      });
    });
  }
  cameIntoView!.loads.push(Promise.resolve(load?.()).catch(() => undefined));
  cameIntoView!.renders.push(render);
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
 * It is a gallery's cell (Gallery.tsx, Gallery.css): on a stage of one shape, a component at its
 * own size and a pattern's scene at a legible scale, and under it its name and when to pick it,
 * which slide into view with the picture as the pointer comes on.
 */
function RelatedTile({
  preview,
  near,
  frame,
  children,
}: {
  preview?: Preview;
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
        <TilePreview
          preview={preview}
          near={near}
          playing={playing || autoplay}
          className="catalogue-related-stage catalogue-gallery-stage"
          whole
          ownSize={frame === 'own'}
          legible={frame === 'legible'}
        />
      </div>
      <div className="catalogue-gallery-meta catalogue-related-meta">{children}</div>
    </li>
  );
}

/** The alternatives as tiles of one size: a preview on its stage, the name and its situations. */
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
      {alternatives.map(({ key, name, href, preview, line, frame }, index) => (
        <RelatedTile key={key} preview={preview} near={near} frame={frame}>
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
