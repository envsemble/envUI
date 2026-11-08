/*
 * One fit of a picture to its stage (useFit.ts), step by step: what it shows is measured
 * (FitMeasure.ts); the fit is decided on that, by what the picture is fitted as (FitKind) and how
 * it is placed now (FitMode): on a modal's screen (FitScreen.ts), as a gallery's tile plays
 * (FitPlaying.ts) or at rest (FitResting.ts); and each decision is drawn on the canvas (FitDraw.ts),
 * its view easing to where it goes (ViewEasing.ts). A decision that lays the canvas out anew, such
 * as the scale a popup lays out at, is drawn before what is measured on it.
 */
import { holdsFromTop } from '../motion/MustShow';
import { drawCut, drawLayoutScale, drawScreenSize, trim, type Placement } from './FitDraw';
import { cropped, fitModeOf, type Moment } from './FitKind';
import { measure, measureHeld, shapeOf, type Measured, type Seen } from './FitMeasure';
import { fitPlaying } from './FitPlaying';
import { decidePopups, decideRestingPlace, decideRestingScale, type Popups } from './FitResting';
import { decideScreenPlace, decideScreenScale, modal } from './FitScreen';
import type { Fitting } from './FitState';
import { holdsFrame } from './HeldView';
import { settling, shownBoxes } from './PaintedBoxes';
import { settle } from './ViewEasing';

/**
 * Fits a picture to its stage: at rest, centred on what it paints, or held where it was framed;
 * a gallery's tile as it plays, drawn out for what it opens; a modal on its screen.
 */
export function fitPicture(f: Fitting) {
  const { canvas, kind, kept } = f;
  const moment: Moment = {
    playing: f.playing.current,
    shown: canvas.dataset.fitted !== undefined,
  };
  // Rested, it plays from its still again the next time.
  if (kept.run && !moment.playing) kept.run = null;
  // A tile that grows as it plays lays out from its window's top (`data-from-top`, Gallery.css).
  const growsDown = holdsFromTop(canvas);
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
  if (
    seen.shape &&
    moment.shown &&
    kept.framed &&
    holdsFrame(kept.framed.shape, seen.shape, kept.follow)
  )
    return holdFrame(f, kept.framed, seen);
  frame(f, seen);
}

/**
 * Keeps the view where it was framed: cut off where its still was, also where its play, in the
 * same view, showed less, such as a palette's one result; and what it shows anew there, its
 * results cleared, is trimmed.
 */
function holdFrame(f: Fitting, framed: NonNullable<Fitting['kept']['framed']>, seen: Seen) {
  const { view } = f;
  drawCut(f, { ...framed, cut: framed.cut ?? '', played: false });
  if (view.toX !== framed.toX || view.toY !== framed.toY || view.toScale !== framed.scale)
    settle(f, framed, seen);
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
function frame(f: Fitting, seen: Seen) {
  const { canvas, kind, kept } = f;
  const { boxes, moment } = seen;
  const measured = measure(f, boxes);
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
  if (mode === 'screen') return fitScreen(f, seen, measured);
  // Decided as it plays too: what it keeps for its stage's size follows the stage as it resizes.
  const popups = decidePopups(f, boxes, measured, moment);
  kept.wholeFor = popups.wholeFor;
  if (mode === 'playing') return fitPlaying(f, boxes, measured.scales);
  fitResting(f, seen, measured, popups);
}

/** A modal on its screen: its scale decided, its screen laid out at it, and its view placed there. */
function fitScreen(f: Fitting, seen: Seen, measured: Measured) {
  const screen = decideScreenScale(f, measured);
  if (!screen.plays) drawScreenSize(f, screen.scale, screen.tall);
  draw(f, seen, decideScreenPlace(f, seen.boxes, screen));
}

/**
 * A picture at rest: what a held view shows measured as it is laid out, its scale decided and laid
 * out, and its view placed and cut off there.
 */
function fitResting(f: Fitting, seen: Seen, measured: Measured, popups: Popups) {
  const held = measureHeld(f, measured);
  const scale = decideRestingScale(f, measured, popups, held, seen.moment);
  drawLayoutScale(f.canvas, scale);
  draw(f, seen, decideRestingPlace(f, seen, measured, popups, held, scale));
}

/** Draws a decision: where it is cut off, then its view eased there. */
function draw(f: Fitting, seen: Seen, placement: Placement) {
  drawCut(f, placement);
  settle(f, placement, seen);
}
