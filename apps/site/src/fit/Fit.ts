/*
 * One fit of a picture to its stage (useFit.ts), in three steps: what it shows is measured, the fit
 * is decided on that, by what the picture is fitted as (FitKind) and how it is placed now
 * (FitMode), and the decision is drawn on the canvas.
 */
import { holdsFromTop, holdsView, mustShowOf } from '../motion/MustShow';
import { remPixels } from '../shared/Lengths';
import { narrowGallery } from '../tiles/Tiles';
import { cropFade, rowSelector } from './Crop';
import {
  anchoredScale,
  contain,
  cursorLength,
  cutSides,
  inset,
  insetSlack,
  join,
  legibleScale,
  margin,
  ownScale,
  phoneSteps,
  pixelTolerance,
  popupRoom,
  restingScale,
  scalePrecision,
  scaleTolerance,
  stepDown,
  union,
  wholeRoom,
  windowScale,
  type Box,
  type Extent,
  type OwnScales,
  type Padded,
} from './FitMath';
import { cropped, fitModeOf, trim, type Fitting, type Moment } from './Fitting';
import { heldElements, shapeOf } from './HeldPopups';
import {
  heldNextLeast,
  heldPlace,
  heldRows,
  heldScale,
  heldTopLeast,
  heldWays,
  holdsFrame,
  rowSlack,
  subjectScale,
  type HeldRoom,
  type HeldScales,
  type HeldWay,
} from './HeldView';
import { laidOutOf, partOf, rowsAfter, settling, shownBoxes, type Shown } from './PaintedBoxes';
import { playFit } from './PlayFit';
import { onCourse, restingAims } from './PointerCourse';
import { modal, screenFit } from './ScreenFit';
import { settle } from './ViewEasing';

/** The overlay layer a picture's popups open in (StageOverlays, Motion.tsx). */
const overlayLayer = '.catalogue-overlay-layer';

/** Whether an element is in a picture's overlay layer, a popup. */
const inPopup = (element: Element) => element.closest(overlayLayer) !== null;

/**
 * Fits a picture to its stage: at rest, centred on what it paints, or held where it was framed;
 * a gallery's tile as it plays, drawn out for what it opens (playFit); a modal on its screen
 * (screenFit).
 */
export function fit(f: Fitting) {
  const { canvas, kind } = f;
  const moment: Moment = {
    playing: f.playing.current,
    shown: canvas.dataset.fitted !== undefined,
  };
  // Rested, it plays from its still again the next time.
  if (f.run && !moment.playing) f.run = null;
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
  f.measured = moment.playing ? null : shapeOf(f.stage, canvas, boxes);
  if (f.measured && moment.shown && f.framed && holdsFrame(f.framed.shape, f.measured, f.follow)) {
    holdFrame(f, boxes);
    return;
  }
  frame(f, boxes, moment, growsDown);
}

/**
 * Keeps the view where it was framed: cut off where its still was, also where its play, in the
 * same view, showed less, such as a palette's one result; and what it shows anew there, its
 * results cleared, is trimmed.
 */
function holdFrame(f: Fitting, boxes: Shown[]) {
  const { canvas, view } = f;
  const { scale, toX, toY, cut, fadeAt } = f.framed!;
  if (cut) canvas.dataset.cut = cut;
  else delete canvas.dataset.cut;
  f.fadeAt = fadeAt;
  if (view.toX !== toX || view.toY !== toY || view.toScale !== scale)
    settle(f, scale, toX, toY, boxes);
  trim(f);
}

/**
 * What a tile that holds its view shows of what its script acts on (HeldView.ts): what it is, its
 * lowest part, the rows after it, the ways it may show them, and its stage's room for them.
 */
interface Held {
  rows: ReturnType<typeof heldRows>;
  lowest: Box | null;
  ways: HeldWay[];
  room: HeldRoom;
}

/**
 * The scales its style sets a picture's tiles at (Gallery.css): the least box it is drawn whole in
 * across (`--catalogue-own-least`, in px) and down (`--catalogue-own-least-block`), a phone's
 * floor, a popup's least, and an overlay's scale where it is one.
 */
interface Scales extends HeldScales, OwnScales {
  /** The overlays' scale where the picture is an overlay, else 0. */
  overlay: number;
}

function scalesOf(canvas: HTMLElement): Scales {
  const style = getComputedStyle(canvas);
  const read = (property: string) => parseFloat(style.getPropertyValue(property));
  const rem = remPixels();
  const floor = read('--catalogue-own-floor');
  const popupLeast = read('--catalogue-own-popup-least') || legibleScale;
  return {
    least: read('--catalogue-own-least') * rem,
    leastBlock: read('--catalogue-own-least-block') * rem || 0,
    floor,
    phone: floor > 0,
    steps: phoneSteps(floor, popupLeast),
    popupLeast,
    overlayScale: read('--catalogue-overlay-scale'),
    // An overlay, such as a notification or a dialog, is drawn at the overlays' one scale, or
    // smaller where it shows whole only so (Tiles.ts, Gallery.css).
    overlay: canvas.hasAttribute('data-overlay') ? read('--catalogue-overlay-scale') || 0 : 0,
  };
}

/** What a fit past its waits and holds is decided on, measured before it moves anything. */
interface Measured {
  extent: Extent;
  /**
   * The parts a tile that holds its view is framed on (heldElements), what of them is laid out
   * elsewhere as it plays (laidOutOf), and the rows after them (rowsAfter).
   */
  heldParts: Element[];
  laidOut: Box[];
  below: Box[];
  further: Box[];
  /** The scale its window fits the stage at (windowScale). */
  window: number;
  scales: Scales;
  /** The scale a component is drawn at, at its own size (ownScale). */
  own: number;
  /** Whether it shows a popup open, in its overlay layer. */
  popup: boolean;
}

/** Measures what a fit past its waits and holds is decided on (Measured). */
function measure(f: Fitting, boxes: Shown[]): Measured {
  const { stage, canvas } = f;
  // A tile that holds its view is framed on its largest state (heldElements).
  const heldParts = heldElements(canvas);
  // Below what is chosen in a picker's grid or wheel, the rows after it show whole too, so the
  // picker reads as a month, a day's hours or a year rather than a strip of one row: the next above
  // the fade at the foot, and where there is room the one after it in the fade (rowsAfter).
  const after = heldParts.map((element) => rowsAfter(element, canvas));
  const below = after.flatMap((rows) => rows.slice(0, 1)).filter(filled);
  const further = after.flatMap((rows) => rows.slice(1, 2)).filter(filled);
  const laidOut = heldParts.flatMap((element) => laidOutOf(element, canvas) ?? []).filter(filled);
  const extent: Extent = {
    ...union([...boxes.map(({ box }) => box), ...laidOut]),
    width: stage.clientWidth - 2 * inset,
    height: stage.clientHeight - 2 * inset,
  };
  const scales = scalesOf(canvas);
  return {
    extent,
    heldParts,
    laidOut,
    below,
    further,
    window: windowScale(f.kind, extent, f.canvas),
    scales,
    own: ownScale(extent, scales),
    popup: boxes.some(({ element }) => inPopup(element)),
  };
}

/**
 * The fit past its waits and holds: what it shows is measured, and it is drawn on its screen, as
 * it plays, or at rest (FitMode).
 *
 * A popup shown open, such as a menu beside its button, lays out in its tile's own window
 * (`data-popup`, Gallery.css), as wide as it was written for, also in a pattern's scene. It is
 * drawn whole, its edges and corners in view, where that takes a scale no smaller than the least
 * every popup is drawn at, `--catalogue-own-popup-least` (Gallery.css), or a scene's legible one:
 * its words stay legible beside the other tiles'. A larger one, such as a picker, is a window onto
 * it from its top, fading out at its foot, drawn whole across where that scale allows, else at the
 * one scale and cut off at its end. A modal, such as a dialog, has the stage for its screen
 * (screenFit). As it plays, it is drawn smaller only where what opens needs it (playFit).
 */
function frame(f: Fitting, boxes: Shown[], moment: Moment, growsDown: boolean) {
  const { canvas, kind } = f;
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
    f.screen = true;
  if (!moment.playing) f.fadeAt = null;
  const mode = fitModeOf(f, moment);
  if (mode === 'screen') return fitScreen(f, boxes, measured);
  const popups = popupFit(f, boxes, measured, moment);
  if (mode === 'playing') return fitPlaying(f, boxes, measured.scales);
  fitResting(f, boxes, measured, popups, moment, growsDown);
}

/**
 * A modal on its screen (screenFit): an overlay, such as a dialog, is drawn at the overlays' one
 * scale, or smaller as far as it needs to show whole, down to its window's least (Tiles.ts), shown
 * from its top where it is taller than the stage still; any other modal at its own size, as far
 * smaller as it needs, down to the popups' least, or on a phone at one of a phone's scales.
 */
function fitScreen(f: Fitting, boxes: Shown[], { scales, own }: Measured) {
  const { overlay, phone, steps, popupLeast } = scales;
  if (overlay)
    screenFit(f, boxes, overlay, (scale) => Math.max(Math.min(overlay, popupLeast), scale), true);
  else
    screenFit(f, boxes, phone ? 1 : own, (scale) =>
      phone ? stepDown(steps, scale, popupLeast) : Math.max(Math.min(own, popupLeast), scale),
    );
}

/**
 * As a gallery's tile plays, its view is drawn out for all it shows (playFit), never below the
 * least it is drawn at (its popup's or a scene's), so its words stay legible. A component's is
 * drawn at its still's scale or at that least, never between.
 */
function fitPlaying(f: Fitting, boxes: Shown[], { popupLeast }: Scales) {
  const { kind, view } = f;
  const component = kind.scale === 'own';
  const low = Math.min(view.rest, component ? popupLeast : legibleScale);
  playFit(f, boxes, low, (scale) =>
    component ? (scale >= view.rest - scaleTolerance ? view.rest : low) : scale,
  );
}

/** A picture at rest: its scale decided, and its view placed and cut off there (placeAtRest). */
function fitResting(
  f: Fitting,
  boxes: Shown[],
  measured: Measured,
  popups: Popups,
  moment: Moment,
  growsDown: boolean,
) {
  const held = heldOf(f, measured);
  // An overlay, such as a notification, is measured by its own surface, which keeps a popup's room
  // from the stage's edges, not by the inset a trigger keeps: the largest scale it shows whole
  // across at (anchoredScale). Where it doesn't at its scale, it is drawn as much smaller as that
  // takes, down to the popups' least.
  const overlayWhole =
    measured.scales.overlay && popups.anchored
      ? anchoredScale(popups.anchored, f.stage.clientWidth, Infinity)
      : Infinity;
  const drawn = restingScale(f.kind, {
    ...measured,
    popupScale: popups.scale,
    overlayWhole,
  });
  const drawnAt = heldViewScale(f, drawn, measured, popups, held, moment);
  drawHeldScale(f.canvas, drawnAt);
  placeAtRest(f, boxes, drawnAt.scale, {
    extent: measured.extent,
    growsDown,
    held,
    popups,
    drawnWhole: drawnAt.drawnWhole,
    overlay: measured.scales.overlay,
    overlayWhole,
    moment,
  });
}

/** What a tile that holds its view shows of what its script acts on, as Held says. */
function heldOf(f: Fitting, { heldParts, laidOut, below, further, extent }: Measured): Held {
  const { canvas } = f;
  // A tile that holds its view is framed once on its still, the largest it shows: what its script
  // acts on there, such as a time picker's chosen hour under its field, a menu's items or a
  // contents list's entries, every point its pointer heads to that is there at rest, shows whole
  // in it from its top, above the fade at its foot, with the cursor on it.
  const aims = holdsView(canvas) ? restingAims(canvas) : [];
  const acted = [
    ...heldParts.map((element) => partOf(element, canvas)).filter(filled),
    ...laidOut,
    ...aims.map(({ box }) => box),
  ];
  const rows = heldRows(acted, below, further);
  return {
    rows,
    // The top of the lowest of them, such as a date picker's chosen week.
    lowest: lowestOf(acted),
    ways: rows ? heldWays(rows) : [],
    room: {
      size: f.stage.clientHeight,
      top: extent.top,
      // The lowest point the pointer presses at rest, where its cursor's tip is.
      pointerFoot: aims.length ? Math.max(...aims.map(({ y }) => y)) : null,
      cursor: cursorLength * remPixels(),
    },
  };
}

/** Whether a box holds anything. */
const filled = (box: Box) => box.right > box.left && box.bottom > box.top;

/** The box that reaches lowest, or none. */
const lowestOf = (boxes: readonly Box[]) =>
  boxes.reduce<Box | null>((low, box) => (!low || box.bottom > low.bottom ? box : low), null);

/** How a popup shown open is drawn in its stage (popupFit). */
interface Popups {
  /** Whether it is a dialog over its backdrop, in a scene too. */
  dialog: boolean;
  /** The stage's room, a margin from its edges. */
  room: { width: number; height: number };
  /** What a component's popup paints, each with the room it keeps from the stage's edges. */
  anchored: Padded[] | null;
  /** The scale a held popup is drawn whole at a little smaller, and whether it is. */
  narrower: number | null;
  whole: number;
  /** The scale a popup is drawn at, at most `atMost`. */
  scale: (atMost: number) => number;
}

/**
 * How a popup shown open is drawn. A popup a little larger than the inset leaves room for, such as
 * a menu bar with its menu open, is drawn whole in the stage, where that scale allows, rather than
 * as a window cut off through its last row: what it opens from, such as its field or its bar, the
 * inset from the stage's edges, and the popup a margin from them (anchoredScale). A larger one,
 * such as a picker, stays a window onto it from its top.
 */
function popupFit(
  f: Fitting,
  boxes: Shown[],
  { extent, popup, scales }: Measured,
  moment: Moment,
): Popups {
  const { stage, canvas, kind } = f;
  const { left, top, right, bottom, width, height } = extent;
  const component = kind.scale === 'own';
  const wholeScale = Math.min(width / (right - left), height / (bottom - top));
  const dialog = canvas.querySelector(`${overlayLayer} .env-dialog-backdrop`) !== null;
  const room = {
    width: stage.clientWidth - 2 * margin,
    height: stage.clientHeight - 2 * margin,
  };
  const anchored =
    component && popup && !dialog
      ? boxes.map(({ element, box }) => ({ box, pad: inPopup(element) ? popupRoom : inset }))
      : null;
  // A component's own popup, or a dialog in a scene too.
  const roomy = dialog || (component && popup);
  const marginScale = roomy
    ? Math.min(room.width / (right - left), room.height / (bottom - top))
    : 0;
  const roomScale = anchored
    ? anchoredScale(anchored, stage.clientWidth, stage.clientHeight)
    : marginScale;
  // One of two scales, so the popups read as one row beside the other tiles: its own, where it
  // shows whole so, what it opens from the inset from the edges and the popup a little room
  // (anchoredScale), else the popups' one scale, whole there or a window onto it from its top,
  // fading out at its foot. On a phone, in a gallery or in Related, a held popup that runs past
  // the stage's end or foot at the popups' least but shows whole a little smaller, such as a menu
  // bar's menu opened from its last menu or a select's list on a lower stage, is drawn whole at
  // that scale, a little room from the stage's foot, down to `heldNextLeast`, rather than cut off
  // at the stage's edge; it lays out as wide as at the popups' least, so its width doesn't follow
  // its scale (placeAtRest). On a wider page a popup is drawn at one of two scales, never between.
  const stageRoom = `${stage.clientWidth} ${stage.clientHeight}`;
  if (!moment.shown || f.wholeFor?.room !== stageRoom) {
    const whole =
      anchored && holdsView(canvas) && (scales.phone || matchMedia(narrowGallery).matches)
        ? anchoredScale(
            anchored.map(({ box }) => ({ box, pad: wholeRoom })),
            stage.clientWidth,
            stage.clientHeight,
          )
        : 0;
    f.wholeFor = {
      room: stageRoom,
      whole,
      narrower:
        roomScale < scales.popupLeast - scaleTolerance &&
        whole < scales.popupLeast - scaleTolerance &&
        whole >= heldNextLeast - scaleTolerance
          ? Math.floor(whole * scalePrecision) / scalePrecision
          : null,
    };
  }
  const { narrower, whole } = f.wholeFor;
  return {
    dialog,
    room,
    anchored,
    narrower,
    whole,
    scale: (atMost) => {
      if (Math.max(wholeScale, roomScale) >= atMost - scaleTolerance) return atMost;
      return narrower ?? Math.min(atMost, scales.popupLeast);
    },
  };
}

/**
 * The scale a resting picture is drawn at once a held view or a held subject is drawn smaller,
 * where it must, than the scale it is `drawn` at (heldScale, subjectScale); whether its subject is
 * drawn smaller so (`data-held-scale`); and on a phone, the scale a popup shown open lays out at
 * (`--catalogue-canvas-scale`), or null where its canvas keeps the one it has.
 */
interface HeldViewScale {
  scale: number;
  drawnWhole: boolean;
  heldSmaller: boolean;
  layoutScale: string | null;
}

function heldViewScale(
  f: Fitting,
  drawn: number,
  { extent, popup, scales }: Measured,
  popups: Popups,
  held: Held,
  moment: Moment,
): HeldViewScale {
  const { stage, canvas, kind, view } = f;
  const { left, top, right, bottom, height } = extent;
  const component = kind.scale === 'own';
  // A held component view that names what it shows (useMustShow), such as a docked panel or a
  // strip of tabs written as wide as its largest state, shows whole in the stage's room, a margin
  // from its edges, as a component a little larger than the inset leaves room for is (inRoom):
  // where the one scale doesn't allow that, it is drawn at the largest of the scales tiles are
  // drawn at that does, as a held picker is (heldScale), else as much smaller as it needs, down to
  // a held view's least, through its whole loop (`data-held-scale`).
  const subject = component && !popup && holdsView(canvas) && mustShowOf(canvas, true).length > 0;
  // Drawn whole a little smaller (narrower), or at the overlays' scale where that shows it whole
  // so too, it is framed whole, centred, as it is.
  const drawnWhole = popups.narrower !== null && drawn <= popups.whole + scaleTolerance;
  const framedAt =
    cropped(kind) && !drawnWhole
      ? heldScale(drawn, held.ways, held.room, { tall: bottom - top, height }, scales)
      : drawn;
  const fitted = subject
    ? Math.min(
        framedAt,
        subjectScale(
          drawn,
          Math.min(
            (stage.clientWidth - 2 * margin) / (right - left),
            (stage.clientHeight - 2 * margin) / (bottom - top),
          ),
          scales,
        ),
      )
    : framedAt;
  // Measured again, a box may come out a hair larger or smaller, a ten-millionth of the scale:
  // that is the same scale, so the view holds still and a tile shows as soon as it is fitted.
  const scale = Math.abs(fitted - view.rest) < scaleTolerance ? view.rest : fitted;
  // On a phone, a popup shown open lays out as wide as the stage's room shows at the scale it is
  // drawn at (`--catalogue-canvas-scale`, Gallery.css), so what is as wide as its window, such as
  // a field, keeps the inset from both edges.
  const laysOut =
    scales.phone &&
    component &&
    !scales.overlay &&
    !moment.playing &&
    canvas.dataset.popup !== undefined;
  const layoutAt =
    popups.narrower !== null && scale === popups.narrower ? scales.popupLeast : scale;
  return {
    scale,
    drawnWhole,
    heldSmaller: subject && fitted < drawn - scaleTolerance,
    layoutScale: laysOut ? String(Math.round(layoutAt * scalePrecision) / scalePrecision) : null,
  };
}

/** Draws a held view's scale on its canvas (heldViewScale), before its view is placed there. */
function drawHeldScale(canvas: HTMLElement, { heldSmaller, layoutScale }: HeldViewScale) {
  if (canvas.hasAttribute('data-held-scale') !== heldSmaller)
    canvas.toggleAttribute('data-held-scale', heldSmaller);
  if (
    layoutScale !== null &&
    canvas.style.getPropertyValue('--catalogue-canvas-scale') !== layoutScale
  )
    canvas.style.setProperty('--catalogue-canvas-scale', layoutScale);
}

/** What placing a picture at rest goes by (placeAtRest). */
interface Placing {
  extent: Extent;
  growsDown: boolean;
  held: Held;
  popups: Popups;
  drawnWhole: boolean;
  overlay: number;
  overlayWhole: number;
  moment: Moment;
}

/** Places a picture's view at a scale, centred on what it paints, as it shows best there. */
function placeAtRest(f: Fitting, boxes: Shown[], scale: number, placing: Placing) {
  const { stage, canvas, kind, view } = f;
  const { extent, popups, drawnWhole, overlay, overlayWhole, moment } = placing;
  const { left, top, right, bottom, width, height } = extent;
  const { rows, lowest, ways, room: heldRoom } = placing.held;
  const keep = rows?.keep;
  let toX = ((left + right) / 2) * scale;
  let toY = ((top + bottom) / 2) * scale;
  // Drawn at its own size, what is larger than the stage shows from its start, as a window onto
  // it, and what reaches past the stage's own edge, beyond the inset, is cut off there and fades
  // out (`data-cut`, Gallery.css).
  const across = (right - left) * scale;
  const down = (bottom - top) * scale;
  // What fits the stage's room, a margin from its edges, such as a component a little taller than
  // the inset leaves room for, is centred on it, cut off nowhere; a popup, with what it opens
  // from, only where it keeps the inset from every edge, else shown from its start, the inset from
  // the stage's top and start, and cut off past the inset's room. An overlay that shows whole
  // across as it is drawn (overlayWhole), its surface a popup's room from the edges, and fits
  // down, isn't faded at an edge.
  const inRoom =
    drawnWhole ||
    (popups.anchored
      ? (overlay > 0 && scale <= overlayWhole + scaleTolerance && down <= height + insetSlack) ||
        (down <= height + insetSlack && across <= width + insetSlack)
      : down <= popups.room.height + pixelTolerance &&
        across <= popups.room.width + pixelTolerance);
  // So is a component a little wider than the inset leaves room for, such as a strip of tabs,
  // across: it is cut off at its foot alone, as every other one is, not at its side.
  const acrossRoom =
    across <= (popups.anchored ? width + insetSlack : popups.room.width + pixelTolerance);
  // It starts at the component's own start, rather than its popups': a popup shifts to stay in
  // the window, and a view that followed it would shift it again. A dialog, over its backdrop, is
  // placed by the window alone and covers what opens it: it starts at its own.
  if (kind.scale === 'own' && across > width && !inRoom && !acrossRoom) {
    const ownBoxes = boxes.filter(({ element }) => popups.dialog || !inPopup(element));
    const start = ownBoxes.length ? Math.min(...ownBoxes.map(({ box }) => box.left)) : left;
    toX = start * scale + width / 2;
  }
  // A scene drawn at a legible scale shows from its top too, where it starts, such as a search
  // above the results it filters, and stays centred across. A tile that holds its view shows from
  // its top down to what its script acts on, whole above the fade at its foot.
  const fromTop = cropped(kind) && down > height && !inRoom;
  if (fromTop && keep) {
    // What it shows from, such as a picker's field, the inset from the stage's top, or as much
    // nearer it as keeps what its script acts on, with the row below a picker's chosen one where
    // there is room, whole above its foot, which fades out below it (heldTop). Where even the least
    // scale doesn't, it shows from as near the top as it is moved, and the fade starts no higher
    // than the middle of the lowest row its script acts on, whose words show above it, and which
    // fades out through the stage's foot rather than being cut there.
    const placed = heldPlace(scale, ways, heldRoom) ?? {
      at: heldTopLeast,
      fadeAt: Math.max(lowest!.top + rowSlack + 1, (lowest!.top + lowest!.bottom) / 2),
    };
    toY = top * scale + stage.clientHeight / 2 - placed.at;
    f.fadeAt = placed.fadeAt;
  } else if (fromTop) toY = top * scale + height / 2;
  // A tile that grows as it plays is shown from its top, so what it adds below has the room the
  // still leaves under it: its still, written as its largest state, centred where it fits the
  // stage, as other tiles are, else the inset from the stage's top (useHeldView).
  if (placing.growsDown && cropped(kind))
    toY =
      top * scale +
      stage.clientHeight / 2 -
      Math.max(inset, (stage.clientHeight - (bottom - top) * scale) / 2);
  // At rest, a tile is framed as it plays, on what its pointer heads to (onCourse); moved for it,
  // it is cut off where it reaches past the stage's edges. A held view taller than its stage is
  // placed down it on what its script acts on (heldTop), and across on its course. A tile first
  // fitted as it plays, its picture loaded while the pointer is on it, is framed so too, as at
  // rest.
  const course =
    cropped(kind) && kind.tile && (!moment.playing || !moment.shown)
      ? { ...onCourse(stage, canvas, toX, toY, scale), ...(fromTop && keep ? { toY } : {}) }
      : null;
  const shifted =
    course !== null &&
    (Math.abs(course.toX - toX) >= pixelTolerance || Math.abs(course.toY - toY) >= pixelTolerance);
  if (course) ({ toX, toY } = course);
  if (cropped(kind)) {
    cutAtRest(f, boxes, scale, toX, toY, {
      extent,
      inRoom,
      acrossRoom,
      anchored: popups.anchored !== null,
      shifted,
      course: course !== null,
    });
    trim(f, f.run !== null);
  }
  // As a page's own tile plays, the view stays where it is while what it shows stays in the stage,
  // else moves just far enough to keep it in.
  if (kind.tile && moment.playing && view.scale === scale) {
    toX = contain(view.toX, left * scale, right * scale, stage.clientWidth / 2 - inset);
    toY = contain(view.toY, top * scale, bottom * scale, stage.clientHeight / 2 - inset);
  }
  settle(f, scale, toX, toY, boxes);
}

/**
 * The sides a picture drawn at its own size or a legible scale is cut off at, at rest, and where
 * its fade at its foot starts.
 */
function cutAtRest(
  f: Fitting,
  boxes: Shown[],
  scale: number,
  toX: number,
  toY: number,
  how: {
    extent: Extent;
    inRoom: boolean;
    acrossRoom: boolean;
    anchored: boolean;
    shifted: boolean;
    course: boolean;
  },
) {
  const { stage, canvas, kind } = f;
  const scene = kind.scale === 'legible';
  const { left, top, right, bottom, width, height } = how.extent;
  const across = (right - left) * scale;
  const down = (bottom - top) * scale;
  // Drawn at a legible scale, a scene wider than the stage is cut off on both sides, fading out
  // there too. A held view's top reaching a row's slack past the stage's, its leading clear, isn't
  // cut.
  const held =
    f.fadeAt !== null && top * scale - toY + stage.clientHeight / 2 >= -rowSlack - pixelTolerance;
  // What may reach past the room before it is cut off: a popup a little, anything else the inset.
  const slack = how.anchored ? insetSlack : inset;
  const cut =
    how.shifted || f.fadeAt !== null
      ? cutSides(
          join(...boxes.map(({ box }) => box))!,
          stage.clientWidth,
          stage.clientHeight,
          toX,
          toY,
          scale,
        )
          .split(' ')
          .filter((side) => !(held && side === 'top'))
      : [
          down > height + slack && !how.inRoom ? 'bottom' : '',
          !scene && across > width + slack && !how.inRoom && !how.acrossRoom ? 'end' : '',
          scene && across > stage.clientWidth ? 'start end' : '',
        ];
  const sides = cut.filter(Boolean).join(' ');
  if (sides) canvas.dataset.cut = sides;
  else delete canvas.dataset.cut;
  // At rest, where what its pointer heads to over its script reaches into the fade at its foot,
  // such as a list's second row, the fade starts no higher than its foot, and the rows below it
  // that the foot cuts through are hidden whole (trimRows): what it presses reads as whole and
  // live, as it plays, and the view needn't move to bring it out of the fade.
  if (how.course && f.fadeAt === null && sides.split(' ').includes('bottom')) {
    const feet = feetInFade(f, boxes, scale, toY);
    if (feet.length) f.fadeAt = Math.max(...feet);
  }
}

/**
 * The feet, in the canvas's own px, of what a resting tile's pointer heads to that reach into the
 * fade at its stage's foot, and of a list's last row whole in the stage where all that reaches past
 * its foot is rows below it, hidden whole: it ends on that row, rather than on one faded half out,
 * which reads as disabled.
 */
function feetInFade(f: Fitting, boxes: Shown[], scale: number, toY: number) {
  const { stage, canvas } = f;
  const size = stage.clientHeight;
  const fade = cropFade(canvas.parentElement!) || 0;
  const at = (point: number) => size / 2 - toY + point * scale;
  const inFade = (foot: number) => at(foot) > size - fade && at(foot) <= size + rowSlack;
  const feet = restingAims(canvas)
    .map(({ box }) => box.bottom)
    .filter(inFade);
  const rows = [...canvas.querySelectorAll(rowSelector)]
    .filter((row) => !row.querySelector(rowSelector) && row.checkVisibility())
    .map((row) => partOf(row, canvas));
  const last = lowestOf(rows.filter((box) => box.bottom > box.top && inFade(box.bottom)));
  const onlyRows =
    last !== null &&
    boxes.every(({ element, box }) => {
      if (at(box.bottom) <= size + rowSlack) return true;
      const row = element.closest(rowSelector);
      return row !== null && partOf(row, canvas).top >= last.bottom - rowSlack;
    });
  if (onlyRows) feet.push(last.bottom);
  return feet;
}
