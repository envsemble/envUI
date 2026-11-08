/*
 * A tile's or a figure's picture fitted to its stage: the hook (useFit), what its fit keeps from
 * one fit to the next (Fitting), and one fit, step by step (fitPicture). What it shows is measured
 * (FitMeasure.ts); the fit is decided on that, by what the picture is fitted as (FitKind) and how
 * it is placed now (FitMode): on a modal's screen (FitScreen.ts), as a gallery's tile plays
 * (FitPlaying.ts) or at rest (FitResting.ts); and each decision is drawn on the canvas (FitDraw.ts),
 * its view easing to where it goes (ViewEasing.ts). A decision that lays the canvas out anew, such
 * as the scale a popup lays out at, is drawn before what is measured on it.
 *
 * Only this file writes what the fit keeps (`kept`), and only ViewEasing.ts the view (`view`): the
 * deciders return what they decide.
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
import { cropped, fitModeOf, type FitKind, type Moment, type StageScript } from './FitKind';
import { measure, measureHeld, shapeOf, type Measured, type Seen } from './FitMeasure';
import { decideDrawOut, decideHeading, decidePlayCut, startRun, type Run } from './FitPlaying';
import {
  decidePopups,
  decideRestingPlace,
  decideRestingScale,
  type Popups,
  type WholeFor,
} from './FitResting';
import { decideScreenPlace, decideScreenScale, modal, modalRoom } from './FitScreen';
import { holdsFrame, type Follow, type Framed } from './HeldView';
import { settling, shownBoxes, type Shown } from './PaintedBoxes';
import { remeasure } from '../shared/Remeasure';
import { glideTo, newView, settle, type View } from './ViewEasing';

/** What a picture's fits decided that the next one goes by. */
interface Kept {
  /**
   * Whether the canvas is a screen as large as the stage, for a modal over it (FitScreen.ts):
   * decided on its still, it stays one as the modal closes (FitMode).
   */
  screen: boolean;
  /** At rest, what the view was last framed on and where, and how often it followed since. */
  framed: Framed | null;
  follow: Follow;
  /** Whether a held popup is drawn whole a little smaller, and at what scale (decidePopups). */
  wholeFor: WholeFor | null;
  /**
   * Where a held view's fade at its foot starts at the latest, in the canvas's own px: below what
   * its script acts on, such as a picker's chosen row.
   */
  fadeAt: number | null;
  /** As a tile plays, what its still showed and what it has opened since (FitPlaying.ts). */
  run: Run | null;
}

/**
 * What a picture's fit keeps from one fit to the next, in three parts: what it fits, set once;
 * what its fits decided that the next goes by (`kept`); and its view (`view`, ViewEasing.ts).
 * What a fit measures is its own (FitMeasure.ts), never kept.
 */
export interface Fitting {
  stage: HTMLElement;
  canvas: HTMLElement;
  kind: FitKind;
  /** Whether it plays now, as it changes. */
  playing: { readonly current: boolean };
  /** What its script tells it now (StageScript). */
  readScript: (canvas: HTMLElement) => StageScript;
  /** Fits it again in the next frame. */
  update: () => void;
  /** Fits it again as an element resizes too, such as a box it paints. */
  observe: (element: Element) => void;
  kept: Kept;
  view: View;
}

/** How a picture is fitted to its stage (useFit). */
export interface FitOptions {
  /** Whether it is fitted at all: its picture is shown. */
  on: boolean;
  /** What it is fitted as (fitKindOf, FitKind.ts). */
  kind: FitKind;
  /** Whether it plays now, which draws it out for what it opens. */
  playing: boolean;
  /**
   * What its script tells it, read as each fit starts, and the event its canvas hears as where its
   * pointer heads changes, which fits it again.
   */
  script: { read: (canvas: HTMLElement) => StageScript; heading: string };
}

/**
 * Scales the picture down until what it shows fits its stage, and centres it there: CSS can't
 * size a box to what its content measures. It follows the stage's width, the picture as it loads
 * and resizes, and the overlays as they open, are placed and finish their transitions. A page's own tile is drawn at its window's scale. At rest it is centred on what it paints, and a
 * gallery's tile framed as it plays, with what its pointer heads to in view (onCourse). As it
 * plays, its view stays where it is, so what happens in it, such as notifications stacking, happens
 * in place; it moves only when something would leave the stage, easing just far enough to keep it
 * in. In a gallery, it is drawn out once for all its animation acts on and opens (FitPlaying.ts),
 * and eases back to centre the still at its scale once the tile rests.
 *
 * fitPicture fits it once; this hook fits it again as anything that changes it does, in the next
 * frame (remeasure).
 */
export function useFit(
  stage: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLElement | null>,
  { on, kind, playing, script }: FitOptions,
) {
  // The effect follows the kind's parts, not the object, which a render makes anew, and the
  // script's reader and event, which are the same on every render.
  const { scale, tile } = kind;
  const { read, heading } = script;
  const playingNow = useRef(playing);
  const refit = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    playingNow.current = playing;
    // Rested, it is centred again.
    refit.current?.();
  }, [playing]);
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const canvasElement = canvas.current;
    if (!on || !stageElement || !canvasElement) return;
    const fits = remeasure(() => fitPicture(fitting), {
      first: 'frame',
      resize: [stageElement, canvasElement],
      // The example renders once its module loads, and its overlays open into a canvas that keeps
      // its size; a popup is placed by its style a frame or two later, without changing size. The
      // canvas's own attributes are the fit's; what is added to it or removed from it, such as the
      // example as its module loads, is the picture's, and fits it again.
      // As a tile plays, only what settles moves its view: what is added or removed, a transition
      // or an animation that ends, a resize. Not each step of a motion, such as a notification
      // sliding in from the edge, nor a popup placed again as the view moves.
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
          if (tile && playingNow.current && !added) return false;
          return added || records.some((record) => record.target !== canvasElement);
        },
      },
      events: [
        // An overlay that opens with a transition measures its final box once it ends; as the
        // pointer heads somewhere else, the view keeps where it goes in the stage.
        { target: canvasElement, types: ['transitionend', 'animationend', heading] },
        // An overlay may size to the window, such as a sheet as tall as it.
        { target: window, types: ['resize'] },
      ],
      fonts: true,
    });
    refit.current = fits.update;
    const fitting: Fitting = {
      stage: stageElement,
      canvas: canvasElement,
      // Made again from the parts the effect follows, so it is one of the kinds there are.
      kind: { scale, tile } as FitKind,
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
    // A region that scrolls as the tile plays fades at its foot while its content runs on past it.
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
  }, [stage, canvas, on, scale, tile, read, heading]);
}

/**
 * Fits a picture to its stage: at rest, centred on what it paints, or held where it was framed;
 * a gallery's tile as it plays, drawn out for what it opens; a modal on its screen.
 */
function fitPicture(f: Fitting) {
  const { canvas, kind, kept } = f;
  const script = f.readScript(canvas);
  const moment: Moment = {
    playing: f.playing.current,
    shown: canvas.dataset.fitted !== undefined,
  };
  // Rested, it plays from its still again the next time.
  if (kept.run && !moment.playing) kept.run = null;
  // A tile that grows as it plays lays out from its window's top (`data-from-top`, Gallery.css).
  const growsDown = script.fromTop;
  if (canvas.hasAttribute('data-from-top') !== growsDown)
    canvas.toggleAttribute('data-from-top', growsDown);
  const boxes = shownBoxes(canvas);
  if (!boxes.length) return;
  // At rest, what scrolls shows its still as it was written, ending on a whole line.
  if (!moment.playing)
    for (const region of canvas.querySelectorAll<HTMLElement>('[data-catalogue-runs-on]'))
      delete region.dataset.catalogueRunsOn;
  // At rest, a tile in place waits for what is still coming or going, such as a popup rising into
  // place, and fits once it ends (transitionend): measured on the way, the view would ease toward
  // it and back.
  if (
    kind.tile &&
    !moment.playing &&
    moment.shown &&
    boxes.some(({ element }) => settling(element, canvas))
  ) {
    // What comes in meanwhile, such as a palette's results, is trimmed where it stands.
    trim(f);
    return;
  }
  // At rest, a picture framed on what it shows holds that view, and after it played, eases back to
  // it, rather than framing it again on where its popups were placed meanwhile (holdsFrame).
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
 * Keeps the view where it was framed: cut off where its still was, also where its play, in the
 * same view, showed less, such as a palette's one result; and what it shows anew there, its
 * results cleared, is trimmed.
 */
function holdFrame(f: Fitting, framed: Framed, seen: Seen) {
  const { view } = f;
  f.kept.fadeAt = framed.fadeAt;
  drawCut(f, { cut: framed.cut ?? '', played: false });
  if (view.toX !== framed.toX || view.toY !== framed.toY || view.toScale !== framed.scale)
    settleFramed(f, framed, seen);
}

/**
 * The fit past its waits and holds: what it shows is measured, the canvas laid out for it, and it
 * is drawn on its screen, as it plays, or at rest (FitMode).
 *
 * A popup shown open, such as a menu beside its button, lays out in its tile's own window
 * (`data-popup`, Gallery.css), as wide as it was written for, also in a pattern's scene. It is
 * drawn whole, its edges and corners in view, where that takes a scale no smaller than the least
 * every popup is drawn at, `--catalogue-own-popup-least` (Gallery.css), or a scene's legible one:
 * its words stay legible beside the other tiles'. A larger one, such as a picker, is a window onto
 * it from its top, fading out at its foot, drawn whole across where that scale allows, else at the
 * one scale and cut off at its end. A modal, such as a dialog, has the stage for its screen
 * (FitScreen.ts). As it plays, it is drawn smaller only where what opens needs it (FitPlaying.ts).
 */
function frame(f: Fitting, seen: Seen, script: StageScript) {
  const { stage, canvas, kind, kept } = f;
  const { boxes, moment } = seen;
  const measured = measure(f, boxes, script);
  // Laid out in its window, what follows is measured there.
  if (cropped(kind) && measured.popup && !moment.shown) canvas.dataset.popup = '';
  // A component's modal, such as a dialog, a sheet or a command palette, over its backdrop: the
  // stage is its screen, decided on its still, so it stays one as the modal closes. A tile first
  // fitted as it plays, its picture loaded while the pointer is on it, decides it then, so its
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
  // Decided as it plays too: what it keeps for its stage's size follows the stage as it resizes.
  const room = { across: stage.clientWidth, down: stage.clientHeight };
  const popups = decidePopups(room, kind, measured, script, {
    shown: moment.shown,
    wholeFor: kept.wholeFor,
  });
  kept.wholeFor = popups.wholeFor;
  if (mode === 'playing') return fitPlaying(f, boxes, script, measured);
  fitResting(f, seen, script, measured, popups);
}

/** A modal on its screen: its scale decided, its screen laid out at it, and its view placed there. */
function fitScreen(f: Fitting, seen: Seen, script: StageScript, measured: Measured) {
  const { stage, canvas, view, kept } = f;
  const { moment } = seen;
  const screen = decideScreenScale(
    { across: stage.clientWidth, down: stage.clientHeight },
    measured,
    modalRoom(canvas),
    // As it plays, the screen stays as it was at rest, as the modal closes and opens again.
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
 * A gallery's tile as it plays: its run started from its still, its view drawn out for what it
 * opened and brought on to where its pointer heads, each easing from where the one before left
 * it, and cut off where it reaches past the stage.
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
  const { cut, run } = decidePlayCut(
    { across: stage.clientWidth, down: stage.clientHeight },
    boxes,
    kept.run,
    view,
    script.holdsView,
  );
  kept.run = run;
  drawCut(f, { cut, played: true });
  for (const { element } of boxes) f.observe(element);
}

/**
 * A picture at rest: what a held view shows measured as it is laid out, its scale decided and laid
 * out, and its view placed and cut off there.
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
  const scale = decideRestingScale(
    { across: stage.clientWidth, down: stage.clientHeight },
    kind,
    measured,
    popups,
    held,
    script,
    {
      playing: seen.moment.playing,
      rest: view.rest,
      laidOut: canvas.dataset.popup !== undefined,
    },
  );
  drawLayoutScale(canvas, scale);
  const placement = decideRestingPlace(f, script, seen, measured, popups, held, scale, {
    view,
    fadeAt: kept.fadeAt,
    played: kept.run !== null,
  });
  draw(f, seen, placement);
}

/** Draws a decision: where it is cut off, then its view eased there, and keeps where it is framed. */
function draw(f: Fitting, seen: Seen, placement: Placement) {
  f.kept.fadeAt = placement.fadeAt;
  drawCut(f, placement);
  settleFramed(f, placement, seen);
}

/**
 * Settles the view where a decision places it (settle, ViewEasing.ts), and at rest, keeps where it
 * is framed and on what, held from then on (holdsFrame).
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
  // Framed anew, it may follow its popups again (holdsFrame).
  kept.follow = { count: kept.follow.following ? kept.follow.count : 0, following: false };
  kept.framed = { shape, scale, toX, toY, cut: canvas.dataset.cut, fadeAt: kept.fadeAt };
}
