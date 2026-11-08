import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Theme, useTheme } from '@envsemble/envui';
import { IconArticle } from '@envsemble/envui/icons/Article';
import { Playback, StageOverlays } from '../motion/Playback';
import { useDisplaySettings } from '../display/DisplaySettings';
import { ExampleRender } from './LiveExample';
import { FoundationTile } from '../tiles/foundations/FoundationTiles';
import type { TilePicture } from '../template/RelatedPages';
import { TileSkeleton } from '../loading/Skeletons';
import { useLoaded } from '../loading/LoadOnce';
import { cropped, fitKindOf, type StageScript } from '../fit/FitKind';
import { useFit } from '../fit/useFit';
import { DeviceFrame } from './DeviceFrame';
import { useAppFit } from '../fit/standalone/useAppFit';
import { narrowGallery } from '../tiles/Tiles';
import {
  courseOf,
  headingEvent,
  headingOf,
  holdsFromTop,
  holdsView,
  mustShowOf,
} from '../motion/MustShow';
import { aimedElement } from '../motion/pointer/PointerPlan';
import { flag } from '@envui-internal/internal/flag';
import { useBrowserStandIns } from '../motion/BrowserStandIns';

/** What a tile's script tells its fit, as each fit starts (StageScript), and when it changes. */
const tileScript = {
  read: (canvas: HTMLElement): StageScript => ({
    holdsView: holdsView(canvas),
    fromTop: holdsFromTop(canvas),
    named: mustShowOf(canvas),
    anywhere: mustShowOf(canvas, true),
    heading: headingOf(canvas),
    course: courseOf(canvas),
    aimed: (selector) => aimedElement(canvas, selector),
    narrow: matchMedia(narrowGallery).matches,
  }),
  heading: headingEvent,
};

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
 * A small live picture of a page on the recessed canvas: its example, inert and scaled down to
 * fit, rendered once the tile nears the viewport. A page without an example shows a foundation's
 * tile in the same way, and a page with neither shows a page icon. A tile of its own (tiles/) takes
 * the example's place; it renders once its file has loaded, since the file declares the window it
 * lays out in. From when the tile nears the view until the picture shows, a skeleton covers the
 * stage. A gallery's tile passes its own stage class. While `playing`, unless the Display menu
 * paused every animation, its animation plays (motion/Playback.tsx), and it rests at its still
 * once that ends.
 */
export function TileStage({
  picture,
  near,
  playing = false,
  className = 'catalogue-tile-stage',
  frame,
}: {
  picture?: TilePicture;
  near: boolean;
  /** Whether the pointer or the keyboard is on the tile, which plays its animation. */
  playing?: boolean;
  className?: string;
  /**
   * How its page's tile is framed (frameOf, RelatedPages.ts): a component at its own size, cropped
   * by its stage, as the components' gallery draws every component at one scale, a drawing, whose
   * window is smaller than the tiles' (Tiles.ts), larger still; a pattern's scene no smaller than a
   * legible scale, cropped by its stage, so its words can be read (fitKindOf).
   */
  frame?: 'own' | 'legible';
}) {
  useBrowserStandIns();
  const theme = useTheme();
  const { motionPaused } = useDisplaySettings();
  // As it stops, a picture that played shows its still at once, drawn anew (Playback's `redraw`):
  // a crossfade from it as it played would show both, such as a spinner over the label it hid.
  const plays = playing && !motionPaused;
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  // The canvas, for the pointer no one sees, which finds the picture's elements in it.
  const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
  // A tile of its own lays out in the window its file declares, so it shows once its file has
  // loaded (tiles/Tiles.ts).
  const tile = useLoaded(near ? picture?.tile?.() : undefined);
  const Composition = tile?.default;
  const tileWindow = tile?.tileWindow;
  const width = tileWindow?.width;
  const nearing = Boolean(picture && near);
  const shown = nearing && (!picture?.tile || Boolean(tile));
  // How many animations its picture has, a pointer's script or a timeline: one without any, such
  // as a list of shortcuts, has no play to promise, and draws no ring under the pointer.
  const [animations, setAnimations] = useState(0);
  const [countAnimation] = useState(() => () => {
    setAnimations((count) => count + 1);
    return () => setAnimations((count) => count - 1);
  });
  const subject =
    picture &&
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
    ) : picture.foundation ? (
      <FoundationTile id={picture.foundation} />
    ) : (
      <ExampleRender page={picture.page} name={picture.name} fallback={null} />
    ));
  // A piece of an application's frame fills its card instead (wrapApp).
  const app = tileWindow?.app;
  const kind = fitKindOf(
    { tile: Boolean(picture?.tile), window: width === undefined ? undefined : { width } },
    app ? undefined : frame,
  );
  const ownSize = kind.scale === 'own';
  const scene = kind.scale === 'legible';
  useFit(stage, canvas, { on: shown && !app, kind, playing: plays, script: tileScript });
  useAppFit(stage, canvas, shown && Boolean(app), app?.least);
  useStillAtRest(canvasElement, kind.tile && !plays);
  return (
    <Theme
      {...theme}
      ref={stage}
      className={className}
      data-example={picture?.foundation || picture?.tile ? undefined : picture?.name}
      data-catalogue-specimen={picture?.foundation}
      data-stage={picture?.stage}
      data-empty={flag(!picture)}
      data-playing={flag(plays)}
      data-scene={flag(scene)}
      data-still={flag(!(picture?.tile && animations > 0))}
    >
      {!picture ? (
        <IconArticle className="catalogue-tile-placeholder" aria-hidden />
      ) : (
        shown &&
        crop(
          cropped(kind),
          <div
            ref={(element) => {
              canvas.current = element;
              setCanvasElement(element);
            }}
            className="catalogue-tile-canvas"
            data-tile={flag(picture.tile)}
            data-own-size={flag(ownSize)}
            data-overlay={flag(ownSize && tileWindow?.overlay)}
            data-app={flag(app)}
            style={
              tileWindow && {
                '--catalogue-tile-width': width === undefined ? undefined : `${width}rem`,
                '--catalogue-tile-height':
                  tileWindow.height === undefined ? undefined : `${tileWindow.height}rem`,
                '--catalogue-own-popup-least': tileWindow.popupLeast,
              }
            }
            inert
            aria-hidden
          >
            {picture.open ? (
              <StageOverlays>{wrapApp(Boolean(app), subject)}</StageOverlays>
            ) : (
              wrapApp(Boolean(app), subject)
            )}
          </div>,
        )
      )}
      {/* After the canvas, which hides it once the picture is fitted (Tile.css). Only as the
          tile nears the view, as its picture starts loading: a skeleton pulses on every frame,
          and a gallery's tiles far from the view would keep the page busy restyling them. */}
      {nearing && <TileSkeleton />}
    </Theme>
  );
}

/**
 * A canvas drawn at its own size, in a box the stage's size that fades out what is cut off at its
 * bottom and its end (Tile.css): a mask on the box rather than on the canvas, whose own box
 * doesn't hold what opens past it, and not on the stage, whose fill stays whole.
 */
const crop = (ownSize: boolean, canvas: ReactNode) =>
  ownSize ? <div className="catalogue-tile-crop">{canvas}</div> : canvas;

/**
 * A piece of an application's frame, such as a Scaffold, a top bar or panes (`app` in
 * tiles/Tiles.ts), in a browser's window, the one a page's figure is drawn in (DeviceFrame.tsx),
 * an even margin around it: it fills its card's picture as the application fills its window,
 * rather than floating small in the middle of it. The window's screen is the tile's window
 * (`env-window`), so the tile lays out for its width as it would in an application. It is drawn
 * at its own size, and on a card too narrow for that, such as a phone's, a little smaller
 * (AppTile.css).
 */
const wrapApp = (app: boolean, subject: ReactNode) =>
  app ? (
    <DeviceFrame kind="window" fill>
      {subject}
    </DeviceFrame>
  ) : (
    subject
  );

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
