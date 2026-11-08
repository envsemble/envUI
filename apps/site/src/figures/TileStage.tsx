import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Theme, useTheme } from '@envsemble/envui';
import { IconArticle } from '@envsemble/envui/icons/Article';
import { Playback, StageOverlays } from '../motion/Playback';
import { useDisplaySettings } from '../display/DisplaySettings';
import { ExampleRender } from './LiveExample';
import { FoundationTile } from '../tiles/foundations/FoundationTiles';
import type { TilePicture } from '../template/RelatedPages';
import { TileSkeleton } from '../loading/Skeletons';
import { cropped, fitKindOf, type StageScript } from '../fit/FitKind';
import { useFit } from '../fit/useFit';
import { AppScreen } from './AppTile';
import { useAppFit } from '../fit/standalone/useAppFit';
import { appTileFrame, narrowGallery } from '../tiles/Tiles';
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
 * A tiny live picture of an alternative on the recessed canvas: its example, inert and scaled down
 * to fit, rendered once the tiles near the viewport; for a page without one, a foundation's tile, in the
 * same way, and from then until it shows, a skeleton of the stage. Without either, a page icon. A page's own
 * tile, or a gallery's composition, takes the example's place. A gallery's tile passes its own
 * stage class. While `playing`, unless the sidebar paused every animation, its animation plays
 * (motion/Playback.tsx), and it rests at its still once that ends.
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
  const Composition = picture?.composition;
  const theme = useTheme();
  const { motionPaused } = useDisplaySettings();
  // As it stops, a picture that played shows its still at once, drawn anew (Playback's `redraw`):
  // a crossfade from it as it played would show both, such as a spinner over the label it hid.
  const plays = playing && !motionPaused;
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  // The canvas, for the pointer no one sees, which finds the picture's elements in it.
  const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
  const shown = Boolean(picture && near);
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
  // A piece of an application's frame fills its card instead (AppTile.tsx).
  const app = picture?.window?.app;
  const kind = fitKindOf(picture, app ? undefined : frame);
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
      data-example={picture?.foundation || Composition ? undefined : picture?.name}
      data-catalogue-specimen={picture?.foundation}
      data-stage={picture?.stage}
      data-empty={flag(!picture)}
      data-playing={flag(plays)}
      data-scene={flag(scene)}
      data-still={flag(!(Composition && animations > 0))}
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
            data-overlay={flag(ownSize && picture.window?.overlay)}
            data-app={app ? appTileFrame : undefined}
            style={
              picture.window &&
              ({
                '--catalogue-tile-width': `${picture.window.width}rem`,
                '--catalogue-tile-height': `${picture.window.height}rem`,
                '--catalogue-own-popup-least': picture.window.popupLeast,
              } as CSSProperties)
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
      {shown && <TileSkeleton />}
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
