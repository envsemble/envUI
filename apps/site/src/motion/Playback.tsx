import { createContext, Fragment, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { PortalContainer } from '@envsemble/envui';
import { holdView, nameMustShow } from './MustShow';
import { useSitePopupOpen } from './SitePopup';

/*
 * The site's stages, where a live component plays: a tile's stage plays while the pointer or the
 * keyboard is on the tile, and an animated figure's stage on a page plays while it is in view,
 * unless it is paused. Each stage shows the live component, used as a person would use it: a
 * virtual pointer hovers over it, presses it and drags it (usePointer, PointerPlayback.ts), and
 * where something else changes, such as a notification arriving, a timeline of steps changes its
 * props (useTimeline, Timeline.ts). Its still is the animation at its start, never a picture.
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

/** How a stage's animations play, for the hooks that play inside it. */
export const PlaybackContext = createContext<
  PlaybackValue & {
    /**
     * Takes over returning the stage to its still, instead of the stage being drawn again. Returns
     * the release.
     */
    claimRest?: () => () => void;
    /** Counts a timeline that sets the stage's props while it is mounted. Returns the release. */
    countTimeline?: () => () => void;
    /**
     * Counts any animation of the stage, a pointer's script included, while it is mounted
     * (Playback).
     */
    countAnimation?: () => () => void;
  }
>({ playing: false, rest: 'start', root: null });

/**
 * Plays or stops the animations of a stage. When a stage that rests at its start stops, it is drawn
 * again, so it shows its still whatever its animation changed. That doesn't happen when the
 * animation returns to its still itself (usePointer's `onRest`), as one does whose still would
 * otherwise appear with motion again.
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
  /**
   * Counts the timelines in it. A figure with a timeline is a recording the reader can't take over.
   */
  countTimeline?: () => () => void;
  /** Counts its animations, timelines and pointers' scripts, such as a tile's. A still has none. */
  countAnimation?: () => () => void;
  /**
   * Whether it is drawn again when it stops, whatever its animations do, as a tile is, whose still
   * draws without motion (TileStage.css). That removes what an animation left behind and can't reset,
   * such as a menu's highlighted item.
   */
  redraw?: boolean;
  children: ReactNode;
}) {
  // While a site popup is open, such as the Display menu, the stages hold where they are
  // (SitePopup.ts).
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
 * own clock and runs only while the stage plays, such as a width frame's sweep (WidthSweep.tsx).
 */
export function usePlayback() {
  const { playing, rest } = use(PlaybackContext);
  return { playing, rest };
}

/** Counts an animation in its stage while it is mounted. */
export function useCountedAnimation() {
  const { countAnimation } = use(PlaybackContext);
  useEffect(() => countAnimation?.(), [countAnimation]);
}

/**
 * The layer a stage's overlays render into, inside its canvas. For a tile that renders an overlay
 * live rather than as a picture, such as notifications that arrive and leave with their own motion.
 */
export function useStageLayer() {
  const { root } = use(PlaybackContext);
  return root?.querySelector<HTMLElement>(':scope > .catalogue-overlay-layer') ?? null;
}

/**
 * Keeps a stage's overlays inside the stage, live. Its menus, popovers, dialogs, sheets and
 * tooltips render through envUI's PortalContainer, in contained mode, into a layer beside the
 * component. So they don't lock the page's scroll, don't take focus, don't close when the reader
 * presses elsewhere, and the virtual pointer finds them in the stage. The nearest box around the
 * layer that is a containing block, a tile's canvas or a figure's stage, positions them: a dialog's
 * backdrop covers it, not the page. Render it as a direct child of the stage's root (Playback),
 * where useStageLayer finds it.
 *
 * Its tooltips take turns only among themselves: a tooltip that opens closes the one open before it
 * only in the same stage. So a figure's virtual pointer never closes a tooltip the reader opened on
 * a live example, or one in another figure. There is no delay before the next tooltip after one
 * closes, as with envUI's tooltips outside a group.
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
 * Names elements, by selectors inside the stage, that a tile's animation changes but its pointer's
 * script doesn't reach, such as a row that a timeline changes. They stay in the tile's view while
 * it plays (MustShow.ts).
 */
export function useMustShow(...selectors: string[]) {
  const { root } = use(PlaybackContext);
  const key = selectors.join('\n');
  useEffect(() => (root ? nameMustShow(root, key.split('\n'), true) : undefined), [root, key]);
}

/**
 * Holds a tile's view while it plays, for a tile whose still is its largest state, such as a select
 * resting with its list open. The view is framed on that still, so nothing in it is drawn smaller
 * or moved while the animation runs inside it (MustShow.ts). With `top`, for a tile that grows
 * while it plays, such as a note gaining a line, it lays out from its window's top, so what it adds
 * grows downward and what stays holds still.
 */
export function useHeldView(top = false) {
  const { root } = use(PlaybackContext);
  useEffect(() => (root ? holdView(root, top) : undefined), [root, top]);
}
