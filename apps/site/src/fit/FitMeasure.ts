/*
 * What a fit measures before it decides anything (useFit.ts): the stage's size, what the picture
 * paints, the scale settings its style sets, what a held view must show of what its script acts
 * on, and the shape a resting picture is framed on. Nothing here writes to the page.
 */
import { remPixels } from '@envui-internal/internal/dom/lengths';
import type { FitKind, Moment, StageScript } from './FitKind';
import {
  cursorLength,
  inset,
  legibleScale,
  ownScale,
  phoneSteps,
  union,
  windowScale,
  type Box,
  type Extent,
  type OwnScales,
} from './FitGeometry';
import {
  heldRows,
  heldWays,
  type HeldHeights,
  type HeldScales,
  type HeldWay,
  type Shape,
} from './HeldView';
import {
  elementsOf,
  inPopup,
  laidOutOf,
  overlayLayer,
  partOf,
  rowsAfter,
  type Shown,
} from './PaintedBoxes';
import { restingAims } from './PointerCourse';
import { pixelTolerance } from '../shared/Remeasure';

/** A stage's size in px: its inner width (`across`) and height (`down`). */
export interface StageSize {
  across: number;
  down: number;
}

/** The size of a stage's box inside its borders (clientWidth and clientHeight). */
export const stageSize = (stage: HTMLElement): StageSize => ({
  across: stage.clientWidth,
  down: stage.clientHeight,
});

/**
 * What every fit starts from: the boxes the picture paints, the moment it runs in, whether the
 * picture grows downwards as it plays (`data-from-top`), and, at rest, the shape it is framed on
 * (shapeOf; null while playing).
 */
export interface Seen {
  boxes: Shown[];
  moment: Moment;
  growsDown: boolean;
  shape: Shape | null;
}

/**
 * The scale settings a picture's style sets (Gallery.css), read from its canvas: those of
 * OwnScales and HeldScales, and the overlays' scale when the picture is an overlay.
 */
export interface Scales extends HeldScales, OwnScales {
  /** The overlays' scale when the picture is an overlay (`data-overlay`), else 0. */
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
    // An overlay, such as a notification or a dialog, is drawn at the overlays' scale, or smaller
    // when only that shows it whole (Tiles.ts, Gallery.css).
    overlay: canvas.hasAttribute('data-overlay') ? read('--catalogue-overlay-scale') || 0 : 0,
  };
}

/**
 * The measurements a fit decides on, taken before it changes anything. Measured only when the fit
 * gets past its early returns (waiting for a popup to settle, keeping a held frame).
 */
export interface Measured {
  extent: Extent;
  /** The boxes it paints, each with whether it is in a popup. */
  painted: { box: Box; popup: boolean }[];
  /**
   * For a tile that holds its view: the elements it is framed on (heldElements), the boxes where
   * transformed ones are laid out (laidOutOf), and the next and second rows after them in a
   * picker (`below`, `further`, rowsAfter).
   */
  heldParts: Element[];
  laidOut: Box[];
  below: Box[];
  further: Box[];
  /** The scale the picture's window fits the stage at (windowScale). */
  window: number;
  scales: Scales;
  /** The scale a component is drawn at (ownScale). */
  own: number;
  /** Whether a popup is open in its overlay layer, and whether a dialog's backdrop is open. */
  popup: boolean;
  dialog: boolean;
}

/** Takes the measurements a fit decides on (Measured). */
export function measure(
  { stage, canvas, kind }: { stage: HTMLElement; canvas: HTMLElement; kind: FitKind },
  boxes: Shown[],
  script: StageScript,
): Measured {
  // A tile that holds its view is framed on its largest state (heldElements); others hold none.
  const heldParts = heldElements(canvas, script);
  // In a picker's grid or wheel, the rows after the chosen one show too, so the picker reads as a
  // month, a day's hours or a year rather than a strip of one row: the next row above the fade,
  // and when there is space the row after it inside the fade (rowsAfter).
  const after = heldParts.map((element) => rowsAfter(element, canvas));
  const below = after.flatMap((rows) => rows.slice(0, 1)).filter(filled);
  const further = after.flatMap((rows) => rows.slice(1, 2)).filter(filled);
  const laidOut = heldParts.flatMap((element) => laidOutOf(element, canvas) ?? []).filter(filled);
  const { across, down } = stageSize(stage);
  const extent: Extent = {
    ...union([...boxes.map(({ box }) => box), ...laidOut]),
    width: across - 2 * inset,
    height: down - 2 * inset,
  };
  const scales = scalesOf(canvas);
  const painted = boxes.map(({ element, box }) => ({ box, popup: inPopup(element) }));
  return {
    extent,
    painted,
    heldParts,
    laidOut,
    below,
    further,
    window: windowScale(kind, extent, canvas),
    scales,
    own: ownScale(extent, scales),
    popup: painted.some(({ popup }) => popup),
    dialog: canvas.querySelector(`${overlayLayer} .env-dialog-backdrop`) !== null,
  };
}

/**
 * What a held view must show (HeldView.ts): the rows of what its script acts on, the lowest of
 * those boxes, the ways it may show them (heldWays), and the heights it is placed by.
 */
export interface Held {
  rows: ReturnType<typeof heldRows>;
  lowest: Box | null;
  ways: HeldWay[];
  heights: HeldHeights;
}

/**
 * Measures what a held view must show (Held). Called after the canvas has been laid out for
 * drawing (`data-popup`), so the boxes are those it will be drawn with.
 */
export function measureHeld(
  { stage, canvas }: { stage: HTMLElement; canvas: HTMLElement },
  { heldParts, laidOut, below, further, extent }: Measured,
  script: StageScript,
): Held {
  // A held view is framed once, on its still. What must show whole from its top, above the fade
  // and with the cursor on it: what its script acts on, such as a time picker's chosen hour under
  // its field, a menu's items or a contents list's entries, and every point of the pointer's
  // course that is visible at rest.
  const aims = script.holdsView ? restingAims(canvas, script) : [];
  const acted = [
    ...heldParts.map((element) => partOf(element, canvas)).filter(filled),
    ...laidOut,
    ...aims.map(({ box }) => box),
  ];
  const rows = heldRows(acted, below, further);
  return {
    rows,
    // The lowest of those boxes, such as a date picker's chosen week.
    lowest: lowestOf(acted),
    ways: rows ? heldWays(rows) : [],
    heights: {
      stage: stage.clientHeight,
      top: extent.top,
      // The lowest point the pointer presses at rest (where the cursor's tip is).
      pointerFoot: aims.length ? Math.max(...aims.map(({ y }) => y)) : null,
      cursor: cursorLength * remPixels(),
    },
  };
}

/** Whether a box has a positive width and height. */
const filled = (box: Box) => box.right > box.left && box.bottom > box.top;

/** The box whose bottom is lowest, or null for none. */
export const lowestOf = (boxes: readonly Box[]) =>
  boxes.reduce<Box | null>((low, box) => (!low || box.bottom > low.bottom ? box : low), null);

/**
 * The parts of the popup a held view rests open on that its still shows whole: a menu's items,
 * and what is selected in it, such as a date picker's day or the centred row of a time picker's
 * wheel.
 */
const heldItems = [
  ...['menuitem', 'menuitemradio', 'menuitemcheckbox'].map((role) => `[role='${role}']`),
  "[aria-selected='true']",
  '.env-time-list-row[data-centered]',
]
  .map((part) => `${overlayLayer} ${part}`)
  .join(', ');

/**
 * The visible elements a tile that holds its view is framed on: everything its script names, and
 * the parts of the popup it rests open on (heldItems). measure adds where transformed ones are
 * laid out, such as a pile's avatars in the row they spread into, so the view is the same wherever
 * the pointer happens to be. A tile that does not hold its view returns none.
 */
function heldElements(canvas: HTMLElement, script: StageScript) {
  if (!script.holdsView) return [];
  return [...script.named, heldItems]
    .flatMap((selector) => elementsOf(canvas, selector))
    .filter((element) => element.checkVisibility());
}

/**
 * The shape a resting picture is framed on (Shape, compared by holdsFrame in HeldView.ts): the
 * stage's and the canvas's sizes, whether the stage is whole in the window, where the canvas is
 * in the stage, and the painted boxes with the popups they belong to.
 */
export function shapeOf(stage: HTMLElement, canvas: HTMLElement, boxes: Shown[]): Shape {
  const canvasBox = canvas.getBoundingClientRect();
  const stageBox = stage.getBoundingClientRect();
  return {
    sizes: [stage.clientWidth, stage.clientHeight, canvas.offsetWidth, canvas.offsetHeight],
    whole: wholeInView(stage),
    view: [canvasBox.left - stageBox.left, canvasBox.top - stageBox.top],
    boxes: boxes.map((shown) => ({ ...shown, popup: layerRoot(shown.element) })),
    popups: new Set(boxes.flatMap(({ element }) => layerRoot(element) ?? [])).size,
  };
}

/**
 * Whether an element is whole in view: inside the window and inside every ancestor that clips it,
 * such as the page's scrolling body. Only then is a popup in it placed against the stage's edges
 * and nothing else.
 */
function wholeInView(element: Element) {
  const box = element.getBoundingClientRect();
  const inside = (around: { left: number; top: number; right: number; bottom: number }) =>
    box.left >= around.left - pixelTolerance &&
    box.top >= around.top - pixelTolerance &&
    box.right <= around.right + pixelTolerance &&
    box.bottom <= around.bottom + pixelTolerance;
  if (!inside({ left: 0, top: 0, right: innerWidth, bottom: innerHeight })) return false;
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
    if (!inside(node.getBoundingClientRect())) return false;
  }
  return true;
}

/**
 * The popup an element is part of, as its outermost box inside the layer's theme, such as a menu's
 * positioner; null for an element outside the overlay layer.
 */
function layerRoot(element: Element) {
  let root: Element | null = null;
  let top: Element | null = null;
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (node.matches(overlayLayer)) return root ?? top;
    if (node.parentElement?.classList.contains('env-theme')) root = node;
    top = node;
  }
  return null;
}
