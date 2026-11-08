/*
 * What a fit measures before it decides anything (FitPicture.ts): what the picture paints, the
 * room its stage has, the scales its style sets, what a held view shows of what its script acts
 * on, and the shape a resting picture is framed on. Nothing here writes to the page.
 */
import { holdsView, mustShowOf } from '../motion/MustShow';
import { remPixels } from '../shared/Lengths';
import type { Moment } from './FitKind';
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
import type { Fitting } from './FitState';
import {
  heldRows,
  heldWays,
  type HeldRoom,
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

/**
 * What every fit starts from: what the picture paints, when it runs, whether it grows as it plays
 * (`data-from-top`), and at rest, the shape it is framed on (shapeOf).
 */
export interface Seen {
  boxes: Shown[];
  moment: Moment;
  growsDown: boolean;
  shape: Shape | null;
}

/**
 * The scales its style sets a picture's tiles at (Gallery.css): the least box it is drawn whole in
 * across (`--catalogue-own-least`, in px) and down (`--catalogue-own-least-block`), a phone's
 * floor, a popup's least, and an overlay's scale where it is one.
 */
export interface Scales extends HeldScales, OwnScales {
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
export interface Measured {
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
export function measure(f: Fitting, boxes: Shown[]): Measured {
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
 * What a tile that holds its view shows of what its script acts on (HeldView.ts): what it is, its
 * lowest part, the rows after it, the ways it may show them, and its stage's room for them.
 */
export interface Held {
  rows: ReturnType<typeof heldRows>;
  lowest: Box | null;
  ways: HeldWay[];
  room: HeldRoom;
}

/**
 * What a tile that holds its view shows of what its script acts on, as Held says, measured as it
 * is laid out to be drawn (`data-popup`).
 */
export function measureHeld(
  f: Fitting,
  { heldParts, laidOut, below, further, extent }: Measured,
): Held {
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
export const lowestOf = (boxes: readonly Box[]) =>
  boxes.reduce<Box | null>((low, box) => (!low || box.bottom > low.bottom ? box : low), null);

/**
 * What a held view's still shows whole of the popup it rests open on: a menu's items, and what is
 * chosen in it, such as a date picker's day or the row in the middle of a time picker's wheels.
 */
const heldItems = [
  ...['menuitem', 'menuitemradio', 'menuitemcheckbox'].map((role) => `[role='${role}']`),
  "[aria-selected='true']",
  '.env-time-list-row[data-centered]',
]
  .map((part) => `${overlayLayer} ${part}`)
  .join(', ');

/**
 * A tile that holds its view is framed on its largest state: what its script acts on, also where
 * it is laid out, such as a pile's avatars in the row they spread into as it plays, so its view is
 * the same whenever and wherever the pointer comes in, and what it rests open on (heldItems). Any
 * other tile holds nothing.
 */
function heldElements(canvas: HTMLElement) {
  if (!holdsView(canvas)) return [];
  return [...mustShowOf(canvas), heldItems]
    .flatMap((selector) => elementsOf(canvas, selector))
    .filter((element) => element.checkVisibility());
}

/**
 * What a fit at rest is decided on (holdsFrame, HeldView.ts), where the canvas is in its stage, if
 * that shows whole.
 */
export function shapeOf(stage: HTMLElement, canvas: HTMLElement, boxes: Shown[]): Shape {
  const canvasBox = canvas.getBoundingClientRect();
  const stageBox = stage.getBoundingClientRect();
  return {
    room: [stage.clientWidth, stage.clientHeight, canvas.offsetWidth, canvas.offsetHeight],
    whole: wholeInView(stage),
    view: [canvasBox.left - stageBox.left, canvasBox.top - stageBox.top],
    boxes: boxes.map((shown) => ({ ...shown, popup: layerRoot(shown.element) })),
    popups: new Set(boxes.flatMap(({ element }) => layerRoot(element) ?? [])).size,
  };
}

/**
 * Whether an element shows whole: inside the window and every box around it that clips it, such as
 * the page's body that scrolls, so a popup in it is placed against nothing but the stage's edges.
 */
function wholeInView(element: Element) {
  const box = element.getBoundingClientRect();
  const inside = (around: { left: number; top: number; right: number; bottom: number }) =>
    box.left >= around.left - 0.5 &&
    box.top >= around.top - 0.5 &&
    box.right <= around.right + 0.5 &&
    box.bottom <= around.bottom + 0.5;
  if (!inside({ left: 0, top: 0, right: innerWidth, bottom: innerHeight })) return false;
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
    if (!inside(node.getBoundingClientRect())) return false;
  }
  return true;
}

/**
 * The popup an element is part of, open in a picture's overlay layer: the outermost box its theme
 * holds, such as a menu's positioner, or none for what is not in a popup.
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
