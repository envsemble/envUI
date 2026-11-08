import { createContext, Fragment, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { PortalContainer } from '@envsemble/envui';
import { holdView, nameMustShow } from './MustShow';
import { useSitePopupOpen } from './SitePopup';

/*
 * The site's stages, where a live component plays: a tile's, while the pointer or the keyboard is
 * on it, and an animated figure's on a page, while it is in view unless it is paused. Each shows
 * the live component, used as a person would use it: a pointer no one sees hovers, presses and
 * drags it (usePointer, PointerPlayback.ts), and where something else changes, such as a
 * notification arriving, a timeline of steps changes its props (useTimeline, Timeline.ts). Its
 * still is the animation at its start, never a picture.
 */

/** How the animations inside a stage play. */
interface PlaybackValue {
  /** Whether they play now. */
  playing: boolean;
  /**
   * Where they rest once they stop: back at the start, the still, as a tile does when the pointer
   * leaves it, or where they are, as a paused figure does.
   */
  rest: 'start' | 'hold';
  /** The stage's element, which holds the component and its popups. */
  root: HTMLElement | null;
}

/** How a stage's animations play, for the hooks that play in it. */
export const PlaybackContext = createContext<
  PlaybackValue & {
    /** Takes over going back to the still, from drawing the stage anew; returns the release. */
    claimRest?: () => () => void;
    /** Counts a timeline that sets the stage's props while it is there; returns the release. */
    countTimeline?: () => () => void;
    /** Counts any animation of the stage, a pointer's script too, while it is there (Playback). */
    countAnimation?: () => () => void;
  }
>({ playing: false, rest: 'start', root: null });

/**
 * Plays or stops the animations of a stage. A stage that rests at its start is drawn anew as it
 * stops, so it is its still again, whatever its animation changed, unless it goes back to its
 * still by itself (usePointer's `onRest`), as one whose still would come in with motion again.
 */
export function Playback({
  playing,
  rest,
  root,
  countTimeline,
  countAnimation,
  redraw = false,
  children,
}: PlaybackValue & {
  /** Counts the timelines in it, whose figure is a recording the reader can't take over. */
  countTimeline?: () => () => void;
  /** Counts its animations, timelines and pointers' scripts, such as a tile's, which a still lacks. */
  countAnimation?: () => () => void;
  /**
   * Whether it is drawn anew as it stops whatever its animations do, as a tile is, whose still
   * draws without motion (Related.css): what an animation left behind that it can't set back, such
   * as a menu's highlighted item, goes with it.
   */
  redraw?: boolean;
  children: ReactNode;
}) {
  // A site popup open, such as the Display menu, holds the stages where they are (SitePopup.ts).
  const held = useSitePopupOpen();
  return (
    <PlaybackOf
      playing={playing && !held}
      rest={rest}
      root={root}
      countTimeline={countTimeline}
      countAnimation={countAnimation}
      redraw={redraw}
    >
      {children}
    </PlaybackOf>
  );
}

function PlaybackOf({
  playing,
  rest,
  root,
  countTimeline,
  countAnimation,
  redraw,
  children,
}: PlaybackValue & {
  countTimeline?: () => () => void;
  countAnimation?: () => () => void;
  redraw: boolean;
  children: ReactNode;
}) {
  const [round, setRound] = useState(0);
  const [wasPlaying, setWasPlaying] = useState(playing);
  const claims = useRef(0);
  const [claimRest] = useState(() => () => {
    claims.current++;
    return () => {
      claims.current--;
    };
  });
  if (wasPlaying !== playing) {
    setWasPlaying(playing);
    // The claims are taken in effects, so they are counted before a stop.
    if (!playing && rest === 'start' && (redraw || !claims.current)) setRound(round + 1);
  }
  return (
    <PlaybackContext value={{ playing, rest, root, claimRest, countTimeline, countAnimation }}>
      <Fragment key={round}>{children}</Fragment>
    </PlaybackContext>
  );
}

/**
 * Whether the stage plays now, and where it rests once it stops, for an animation that keeps its
 * own clock, such as a width frame's sweep (WidthSweep.tsx), which runs only while it plays.
 */
export function usePlayback() {
  const { playing, rest } = use(PlaybackContext);
  return { playing, rest };
}

/** Counts an animation in its stage's while it is there. */
export function useCountedAnimation() {
  const { countAnimation } = use(PlaybackContext);
  useEffect(() => countAnimation?.(), [countAnimation]);
}

/**
 * The layer a stage's overlays render into, inside its canvas, for a tile that renders an
 * overlay live rather than as a picture, such as notifications that arrive and leave with their
 * own motion.
 */
export function useStageLayer() {
  const { root } = use(PlaybackContext);
  return root?.querySelector<HTMLElement>(':scope > .catalogue-overlay-layer') ?? null;
}

/**
 * Holds a stage's overlays inside it, live: its menus, popovers, dialogs, sheets and tooltips
 * render through envUI's PortalContainer, contained, into a layer beside the component, so they
 * neither lock the page's scroll, take focus nor close as the reader presses elsewhere, and the
 * pointer no one sees finds them in the stage. The box around it that is a containing block,
 * a tile's canvas or a figure's stage, places them: a dialog's backdrop covers it, not the page.
 * Render it as a direct child of the stage's root (Playback), where useStageLayer finds it.
 *
 * Its tooltips take turns among themselves alone: a tooltip opening closes the one open before it
 * only in the same stage, so a figure's playing pointer never closes the tooltip the reader opened
 * on a live example, nor another figure's. With no wait for the next one past a tooltip closing,
 * as envUI's tooltips have outside any group.
 */
export function StageOverlays({ children }: { children: ReactNode }) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  return (
    <BaseTooltip.Provider timeout={0}>
      <PortalContainer container={layer} contained>
        {children}
      </PortalContainer>
      <div ref={setLayer} className="catalogue-overlay-layer" />
    </BaseTooltip.Provider>
  );
}

/**
 * Names elements a tile's animation acts on that its pointer's script doesn't, such as a row a
 * timeline changes, by selectors inside its stage, so they stay in its view as it plays
 * (MustShow.ts).
 */
export function useMustShow(...selectors: string[]) {
  const { root } = use(PlaybackContext);
  const key = selectors.join('\n');
  useEffect(() => (root ? nameMustShow(root, key.split('\n'), true) : undefined), [root, key]);
}

/**
 * Holds a tile's view as it plays, for a tile whose still is its largest state, such as a select
 * resting with its list open: framed on that still, nothing in it is drawn smaller or moved while
 * its animation acts within it (MustShow.ts). With `top`, for a tile that grows as it plays, such
 * as a note gaining a line, it lays out from its window's top, so what it adds grows downward and
 * what stays holds still.
 */
export function useHeldView(top = false) {
  const { root } = use(PlaybackContext);
  useEffect(() => (root ? holdView(root, top) : undefined), [root, top]);
}
