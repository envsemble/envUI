/*
 * Fits a tile's or a figure's picture to its stage. This file holds the hook (useFit), the state
 * a fit keeps between runs (Fitting), and one run, step by step (fitPicture).
 *
 * One run: measure what the picture shows (FitMeasure.ts); pick the decider by the picture's kind
 * (FitKind) and mode (FitMode): a modal's screen (FitScreen.ts), a playing gallery tile
 * (FitPlaying.ts) or rest (FitResting.ts); draw each decision on the canvas (FitDraw.ts); and
 * ease the view to its place (ViewEasing.ts). A decision that changes the canvas's layout, such as
 * the scale a popup lays out at, is drawn before anything is measured on that layout.
 *
 * Only this file writes the kept state (`kept`), and only ViewEasing.ts writes the view (`view`).
 * The deciders only return their decisions.
 */
import { useLayoutEffect, useRef, type RefObject } from 'react';
import {
  drawCut,
  drawLayoutScale,
  drawScreenSize,
  markRunsOn,
  trim,
  type Placement,
} from './FitDraw';
import {
  cropped,
  fitModeOf,
  type FitKind,
  type Moment,
  type ScriptReader,
  type StageScript,
} from './FitKind';
import { measure, measureHeld, shapeOf, stageSize, type Measured, type Seen } from './FitMeasure';
import { decideDrawOut, decideHeading, decidePlayCut, startRun, type Run } from './FitPlaying';
import {
  decidePopups,
  decideRestingPlace,
  decideRestingScale,
  type Popups,
  type WholeFor,
} from './FitResting';
import { decideScreenPlace, decideScreenScale, modal, modalNeeds } from './FitScreen';
import { holdsFrame, type Follow, type Framed } from './HeldView';
import { settling, shownBoxes, type Shown } from './PaintedBoxes';
import { remeasure } from '../shared/Remeasure';
import { glideTo, newView, settle, type View } from './ViewEasing';

/** The decisions of earlier fits that the next fit reads. */
interface Kept {
  /**
   * Whether the canvas is a modal's screen as large as the stage (FitScreen.ts). Decided on the
   * still, and kept while the modal closes during play (FitMode).
   */
  screen: boolean;
  /** At rest: where and on what the view was last framed, and how often it has followed since. */
  framed: Framed | null;
  follow: Follow;
  /** The held popup decision for the current stage size (WholeFor, decidePopups). */
  wholeFor: WholeFor | null;
  /**
   * The highest point, in the canvas's own px, where a held view's bottom fade may start: just
   * below what its script acts on, such as a picker's chosen row. Null for the default fade.
   */
  fadeAt: number | null;
  /** While a tile plays: the state of the current play (Run, FitPlaying.ts). */
  run: Run | null;
}

/**
 * The state a picture's fit keeps between runs, in three parts: the elements and settings, set
 * once; the decisions later runs read (`kept`); and the view (`view`, ViewEasing.ts).
 * Measurements (FitMeasure.ts) belong to one run and are never kept.
 */
export interface Fitting {
  stage: HTMLElement;
  canvas: HTMLElement;
  kind: FitKind;
  /** Whether the picture plays now; a ref, so the fit always reads the current value. */
  playing: { readonly current: boolean };
  /** Reads what the script tells the fit now (StageScript). */
  readScript: ScriptReader['read'];
  /** Asks for another run in the next frame. */
  update: () => void;
  /** Adds an element whose resizes trigger a run, such as a box it paints. */
  observe: (element: Element) => void;
  kept: Kept;
  view: View;
}

/** The options of useFit. */
export interface FitOptions {
  /** Whether to fit at all: true while the picture is shown. */
  on: boolean;
  /**
   * The picture's kind, from fitKindOf (FitKind.ts). fitKindOf returns one object per kind, so the
   * fit restarts only when the kind changes.
   */
  kind: FitKind;
  /** Whether the picture plays now. A playing gallery tile draws out for what it opens. */
  playing: boolean;
  /**
   * Reads the script at the start of every run, and names the event the canvas receives when the
   * pointer's heading changes, which triggers a run (ScriptReader).
   */
  script: ScriptReader;
}

/**
 * Scales a picture down until what it shows fits its stage, and centres it there. This is done in
 * script because CSS cannot size a box from what its content measures.
 *
 * Behaviour:
 * - A page's own tile is drawn at its window's scale.
 * - At rest, the picture is centred on what it paints. A gallery tile is framed the way it plays,
 *   with the pointer's course in view (onCourse).
 * - While playing, the view stays where it is, so what happens in it (such as notifications
 *   stacking) happens in place. It moves only when something would leave the stage, and then
 *   just far enough to keep it in.
 * - In a gallery, a playing tile draws out once for everything its animation acts on and opens
 *   (FitPlaying.ts), and eases back to its resting view when it rests.
 *
 * fitPicture runs one fit. The hook runs it again in the next frame whenever something that can
 * change the result changes (remeasure): the stage's or canvas's size, the picture loading or
 * changing, overlays opening, being placed and finishing their transitions, the pointer's heading,
 * the window's size and the fonts.
 */
export function useFit(
  stage: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLElement | null>,
  { on, kind, playing, script }: FitOptions,
) {
  // The effect follows the reader and the event name, not the object that holds them.
  const { read, heading } = script;
  const playingNow = useRef(playing);
  const refit = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    playingNow.current = playing;
    // When the tile starts or stops playing, fit again (at rest it is centred again).
    refit.current?.();
  }, [playing]);
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const canvasElement = canvas.current;
    if (!on || !stageElement || !canvasElement) return;
    const fits = remeasure(() => fitPicture(fitting), {
      first: 'frame',
      resize: [stageElement, canvasElement],
      // Mutations catch what resizes cannot: the example renders once its module loads, overlays
      // open in a canvas that keeps its size, and a popup's style places it a frame or two later
      // without a size change. Changes to the canvas's own attributes are the fit's own writes,
      // so they are ignored; changes inside it are the picture's.
      // While a tile plays, only settled changes count: nodes added or removed (here), and ended
      // transitions and animations and resizes (below). Each step of a motion, such as a
      // notification sliding in, or a popup placed again as the view moves, does not.
      mutation: {
        target: canvasElement,
        options: {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class', 'hidden'],
        },
        counts: (records) => {
          const added = records.some((record) => record.type === 'childList');
          if (kind.tile && playingNow.current && !added) return false;
          return added || records.some((record) => record.target !== canvasElement);
        },
      },
      events: [
        // An overlay with an entrance transition is measured again once it has ended. A new
        // heading brings where the pointer goes into view.
        { target: canvasElement, types: ['transitionend', 'animationend', heading] },
        // An overlay may size to the window, such as a sheet as tall as the window.
        { target: window, types: ['resize'] },
      ],
      fonts: true,
    });
    refit.current = fits.update;
    const fitting: Fitting = {
      stage: stageElement,
      canvas: canvasElement,
      kind,
      playing: playingNow,
      readScript: read,
      update: fits.update,
      observe: fits.observe,
      kept: {
        screen: false,
        framed: null,
        follow: { count: 0, following: false },
        wholeFor: null,
        fadeAt: null,
        run: null,
      },
      view: newView(),
    };
    const { view } = fitting;
    // A region that scrolls while the tile plays fades at its bottom while content continues
    // past it (markRunsOn).
    const scrolled = ({ target }: Event) => {
      if (target instanceof Element) markRunsOn([target]);
    };
    canvasElement.addEventListener('scroll', scrolled, true);
    return () => {
      fits.stop();
      canvasElement.removeEventListener('scroll', scrolled, true);
      for (const property of [
        'inline-size',
        'block-size',
        'min-block-size',
        '--catalogue-canvas-scale',
      ])
        canvasElement.style.removeProperty(property);
      canvasElement.parentElement?.style.removeProperty('--catalogue-crop-top');
      cancelAnimationFrame(view.frame);
      refit.current = null;
    };
  }, [stage, canvas, on, kind, read, heading]);
}

/**
 * Runs one fit. It returns early when the picture paints nothing, while a resting tile waits for
 * something still moving, and when a resting picture keeps its framed view (holdsFrame). Otherwise
 * it continues in frame.
 */
function fitPicture(f: Fitting) {
  const { canvas, kind, kept } = f;
  const script = f.readScript(canvas);
  const moment: Moment = {
    playing: f.playing.current,
    shown: canvas.dataset.fitted !== undefined,
  };
  // A tile that stopped playing starts its next play from its still.
  if (kept.run && !moment.playing) kept.run = null;
  // A tile that grows downwards as it plays lays out from its window's top (`data-from-top`,
  // Gallery.css).
  const growsDown = script.fromTop;
  if (canvas.hasAttribute('data-from-top') !== growsDown)
    canvas.toggleAttribute('data-from-top', growsDown);
  const boxes = shownBoxes(canvas);
  if (!boxes.length) return;
  // At rest, scrolling regions show the still as written, ending on a whole line, so they lose
  // their runs-on fade.
  if (!moment.playing)
    for (const region of canvas.querySelectorAll<HTMLElement>('[data-catalogue-runs-on]'))
      delete region.dataset.catalogueRunsOn;
  // At rest, a shown tile waits for anything still moving, such as a popup rising into place,
  // and fits once it has ended (transitionend). Measured on the way, the view would ease toward it
  // and back.
  if (
    kind.tile &&
    !moment.playing &&
    moment.shown &&
    boxes.some(({ element }) => settling(element, canvas))
  ) {
    // Trim what appears meanwhile, such as a palette's results, without moving the view.
    trim(f);
    return;
  }
  // At rest, a picture that was framed keeps that view while it shows the same thing, and eases
  // back to it after playing, rather than framing again on where its popups were placed in the
  // meantime (holdsFrame).
  const seen: Seen = {
    boxes,
    moment,
    growsDown,
    shape: moment.playing ? null : shapeOf(f.stage, canvas, boxes),
  };
  if (seen.shape && moment.shown && kept.framed) {
    const held = holdsFrame(kept.framed.shape, seen.shape, kept.follow);
    kept.follow = held.follow;
    if (held.holds) return holdFrame(f, kept.framed, seen);
  }
  frame(f, seen, script);
}

/**
 * Keeps the view where it was framed, with the cut sides and fade it had then. These stay even
 * when the play showed less in the same view, such as a palette with one result. What shows anew,
 * such as the palette's cleared results, is trimmed. The view eases back if it moved.
 */
function holdFrame(f: Fitting, framed: Framed, seen: Seen) {
  const { view } = f;
  f.kept.fadeAt = framed.fadeAt;
  drawCut(f, { cut: framed.cut ?? '', played: false });
  if (view.toX !== framed.toX || view.toY !== framed.toY || view.toScale !== framed.scale)
    settleFramed(f, framed, seen);
}

/**
 * The rest of a fit, after fitPicture's early returns: measure, lay the canvas out, then decide
 * and draw by mode (FitMode): on a modal's screen, while playing, or at rest.
 *
 * Popups: an open popup, such as a menu beside its button, lays out in its tile's own window
 * (`data-popup`, Gallery.css), as wide as it was written for, also in a pattern's scene. It is
 * drawn whole, edges and corners in view, when that needs a scale no smaller than the popups'
 * least scale (`--catalogue-own-popup-least`, Gallery.css) or a scene's legible scale, so its words
 * stay as legible as the other tiles'. A larger popup, such as a picker, shows from its top and
 * fades out at the bottom; it is drawn whole across when that scale allows, else cut off at its
 * end. A modal, such as a dialog, uses the stage as its screen (FitScreen.ts). While playing, the
 * picture is drawn smaller only when what it opens needs it (FitPlaying.ts).
 */
function frame(f: Fitting, seen: Seen, script: StageScript) {
  const { stage, canvas, kind, kept } = f;
  const { boxes, moment } = seen;
  const measured = measure(f, boxes, script);
  // Lay an open popup out in the tile's window first, so what follows is measured there.
  if (cropped(kind) && measured.popup && !moment.shown) canvas.dataset.popup = '';
  // A component's modal over its backdrop (a dialog, a sheet or a command palette) uses the stage
  // as its screen. This is decided on the still, and kept as the modal closes during play. A tile
  // first fitted while playing (its picture loaded under the pointer) decides it then, so the
  // modal's screen and backdrop fill the stage as at rest.
  if (
    kind.scale === 'own' &&
    kind.tile &&
    (!moment.playing || !moment.shown) &&
    canvas.querySelector(modal)
  )
    kept.screen = true;
  if (!moment.playing) kept.fadeAt = null;
  const mode = fitModeOf(kind, kept.screen, moment);
  if (mode === 'screen') return fitScreen(f, seen, script, measured);
  // Decided while playing too, so the kept decision follows the stage when it resizes.
  const popups = decidePopups(stageSize(stage), kind, measured, script, {
    shown: moment.shown,
    wholeFor: kept.wholeFor,
  });
  kept.wholeFor = popups.wholeFor;
  if (mode === 'playing') return fitPlaying(f, boxes, script, measured);
  fitResting(f, seen, script, measured, popups);
}

/** Fits a modal's screen: decides its scale, sizes the screen at it, then places the view. */
function fitScreen(f: Fitting, seen: Seen, script: StageScript, measured: Measured) {
  const { stage, canvas, view, kept } = f;
  const { moment } = seen;
  const screen = decideScreenScale(
    stageSize(stage),
    measured,
    modalNeeds(canvas),
    // While playing, the screen keeps its resting size as the modal closes and opens again.
    { played: moment.playing && moment.shown ? canvas.offsetHeight : null, rest: view.rest },
  );
  if (!screen.plays) drawScreenSize(f, screen.scale, screen.tall);
  const placement = decideScreenPlace(f, script, seen.boxes, screen, {
    toY: view.toY,
    fadeAt: kept.fadeAt,
    playing: moment.playing,
  });
  draw(f, seen, placement);
}

/**
 * Fits a gallery tile while it plays. Starts a run from the still if none is running, draws the
 * view out for what the tile opened (decideDrawOut), then moves it to show where the pointer is
 * heading (decideHeading); each step eases from where the previous one left the view. Then it
 * sets the cut sides (decidePlayCut).
 */
function fitPlaying(f: Fitting, boxes: Shown[], script: StageScript, { scales }: Measured) {
  const { stage, canvas, kind, kept, view } = f;
  const drawn = decideDrawOut(
    f,
    kind,
    script,
    boxes,
    scales,
    kept.run ?? startRun(boxes, view, canvas.dataset.cut),
    view,
  );
  kept.run = drawn.run;
  if (drawn.run.pending) f.update();
  if (drawn.target) glideTo(f, drawn.target);
  if (!script.holdsView) {
    const headed = decideHeading(f, script, view);
    if (headed) glideTo(f, headed);
  }
  const { cut, run } = decidePlayCut(stageSize(stage), boxes, kept.run, view, script.holdsView);
  kept.run = run;
  drawCut(f, { cut, played: true });
  for (const { element } of boxes) f.observe(element);
}

/**
 * Fits a resting picture: measures what a held view must show, decides and draws the scale
 * (which may change the layout), then decides and draws the view's place and cut sides.
 */
function fitResting(
  f: Fitting,
  seen: Seen,
  script: StageScript,
  measured: Measured,
  popups: Popups,
) {
  const { stage, canvas, kind, view, kept } = f;
  const held = measureHeld(f, measured, script);
  const scale = decideRestingScale(stageSize(stage), kind, measured, popups, held, script, {
    playing: seen.moment.playing,
    rest: view.rest,
    laidOut: canvas.dataset.popup !== undefined,
  });
  drawLayoutScale(canvas, scale);
  const placement = decideRestingPlace(f, script, seen, measured, popups, held, scale, {
    view,
    fadeAt: kept.fadeAt,
    played: kept.run !== null,
  });
  draw(f, seen, placement);
}

/** Draws a placement: keeps its fade start, writes its cut sides, then moves the view there. */
function draw(f: Fitting, seen: Seen, placement: Placement) {
  f.kept.fadeAt = placement.fadeAt;
  drawCut(f, placement);
  settleFramed(f, placement, seen);
}

/**
 * Moves the view to a placement (settle, ViewEasing.ts). At rest, also keeps the placement and the
 * shape it was framed on (`kept.framed`), which later fits compare against (holdsFrame).
 */
function settleFramed(
  f: Fitting,
  at: { scale: number; toX: number; toY: number },
  { boxes, shape }: Seen,
) {
  const { playing, canvas, kept } = f;
  const { scale, toX, toY } = at;
  settle(f, at, { boxes });
  if (playing.current || !shape) return;
  // A new frame resets the follow count, unless this fit was one of the follows (holdsFrame).
  kept.follow = { count: kept.follow.following ? kept.follow.count : 0, following: false };
  kept.framed = { shape, scale, toX, toY, cut: canvas.dataset.cut, fadeAt: kept.fadeAt };
}
