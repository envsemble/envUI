import { remPixels } from '../shared/Lengths';
import type { FitKind, Moment, StageScript } from './FitKind';
import {
  cursorLengthRem,
  insetPx,
  inside,
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

export interface StageSize {
  across: number;
  down: number;
}

export const stageSize = (stage: HTMLElement): StageSize => ({
  across: stage.clientWidth,
  down: stage.clientHeight,
});

export interface Seen {
  boxes: Shown[];
  moment: Moment;
  growsDown: boolean;
  shape: Shape | null;
}

export interface Scales extends HeldScales, OwnScales {
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
    overlay: canvas.hasAttribute('data-overlay') ? read('--catalogue-overlay-scale') || 0 : 0,
  };
}

export interface Measured {
  extent: Extent;
  painted: { box: Box; popup: boolean }[];
  heldParts: Element[];
  laidOut: Box[];
  below: Box[];
  further: Box[];
  window: number;
  scales: Scales;
  own: number;
  popup: boolean;
  dialog: boolean;
}

export function measure(
  { stage, canvas, kind }: { stage: HTMLElement; canvas: HTMLElement; kind: FitKind },
  boxes: Shown[],
  script: StageScript,
): Measured {
  const heldParts = heldElements(canvas, script);
  const after = heldParts.map((element) => rowsAfter(element, canvas));
  const below = after.flatMap((rows) => rows.slice(0, 1)).filter(filled);
  const further = after.flatMap((rows) => rows.slice(1, 2)).filter(filled);
  const laidOut = heldParts.flatMap((element) => laidOutOf(element, canvas) ?? []).filter(filled);
  const { across, down } = stageSize(stage);
  const extent: Extent = {
    ...union([...boxes.map(({ box }) => box), ...laidOut]),
    width: across - 2 * insetPx,
    height: down - 2 * insetPx,
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

export interface Held {
  rows: ReturnType<typeof heldRows>;
  lowest: Box | null;
  ways: HeldWay[];
  heights: HeldHeights;
}

export function measureHeld(
  { stage, canvas }: { stage: HTMLElement; canvas: HTMLElement },
  { heldParts, laidOut, below, further, extent }: Measured,
  script: StageScript,
): Held {
  const aims = script.holdsView ? restingAims(canvas, script) : [];
  const acted = [
    ...heldParts.map((element) => partOf(element, canvas)).filter(filled),
    ...laidOut,
    ...aims.map(({ box }) => box),
  ];
  const rows = heldRows(acted, below, further);
  return {
    rows,
    lowest: lowestOf(acted),
    ways: rows ? heldWays(rows) : [],
    heights: {
      stage: stage.clientHeight,
      top: extent.top,
      pointerFoot: aims.length ? Math.max(...aims.map(({ y }) => y)) : null,
      cursor: cursorLengthRem * remPixels(),
    },
  };
}

const filled = (box: Box) => box.right > box.left && box.bottom > box.top;

export const lowestOf = (boxes: readonly Box[]) =>
  boxes.reduce<Box | null>((low, box) => (!low || box.bottom > low.bottom ? box : low), null);

const heldItems = [
  ...['menuitem', 'menuitemradio', 'menuitemcheckbox'].map((role) => `[role='${role}']`),
  "[aria-selected='true']",
  '.env-time-list-row[data-centered]',
]
  .map((part) => `${overlayLayer} ${part}`)
  .join(', ');

function heldElements(canvas: HTMLElement, script: StageScript) {
  if (!script.holdsView) return [];
  return [...script.named, heldItems]
    .flatMap((selector) => elementsOf(canvas, selector))
    .filter((element) => element.checkVisibility());
}

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

function wholeInView(element: Element) {
  const box = element.getBoundingClientRect();
  if (!inside({ left: 0, top: 0, right: innerWidth, bottom: innerHeight }, box)) return false;
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
    if (!inside(node.getBoundingClientRect(), box)) return false;
  }
  return true;
}

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
