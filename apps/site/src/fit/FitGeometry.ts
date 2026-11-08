/*
 * The fit's pure calculations (useFit.ts): boxes in a canvas's own px, the scales a picture is
 * drawn at, and where its view goes. Nothing here reads the page, so tests/site/Fit.test.mjs
 * tests it directly.
 *
 * A view is given as `toX` and `toY`: the point of the canvas, in drawn px (canvas px times the
 * scale), that sits at the middle of the stage.
 */
import type { FitKind } from './FitKind';
import { pixelTolerance } from '../shared/Remeasure';

/** A box by its edges, in a canvas's own px here; callers elsewhere use it in their own px. */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Scales closer than this count as the same scale. A box measured a second time can come out a
 * tiny fraction larger or smaller, which would otherwise change the scale.
 */
export const scaleTolerance = 0.0005;

/** Scales are rounded to thousandths where they are written to the page or kept. */
export const scalePrecision = 1000;

/** The least space, in px, between a picture and its stage's edges. */
export const inset = 16;

/**
 * The most a page's own tile is enlarged. It is written for a small window, so it is drawn larger
 * than its own size.
 * @internal
 */
export const most = 2;

/** The least scale a pattern's scene is drawn at in a gallery, so its words stay legible. */
export const legibleScale = 0.8;

/** The space, in px, a moving tile view keeps between what it shows and the stage's edge. */
export const margin = 6;

/** The space, in px, a playing tile's view keeps between the stage's edges and what it opened. */
const playMargin = 10;

/**
 * A playing tile is drawn smaller only when what it opened needs less than this share of the
 * current scale. Content that reaches only slightly into the margin keeps the scale.
 */
const zoomSlack = 0.97;

/**
 * How far, in px, a popup and its trigger may reach into the inset (both edges together) and still
 * count as fitting, so they are shown whole and centred rather than cut off. Example: a
 * notification one word too wide.
 */
export const insetSlack = 4;

/**
 * The space, in px, a popup keeps from its stage's edges when its tile is framed around it
 * (anchoredScale). It is no more than a menu keeps from the edges it is placed against, so the
 * view can always give a menu that is pressed against an edge the space it wants.
 */
export const popupRoom = 5;

/**
 * The space, in px, kept from the stage's edges by a held popup that is drawn whole at a scale
 * slightly below the popups' least scale. It is larger than popupRoom so the popup's bottom edge
 * does not sit on the stage's bottom edge.
 */
export const wholeRoom = 8;

/**
 * The cursor's length from its tip, in rem (MotionStage.css), at the scale its picture is drawn
 * at.
 */
export const cursorLength = 1.25;

/** The least space, in px, between the cursor and the stage's bottom edge. */
export const cursorRoom = 0;

/** The smallest box that contains all the given boxes. Needs at least one box. */
export const union = (boxes: readonly Box[]): Box => ({
  left: Math.min(...boxes.map((box) => box.left)),
  top: Math.min(...boxes.map((box) => box.top)),
  right: Math.max(...boxes.map((box) => box.right)),
  bottom: Math.max(...boxes.map((box) => box.bottom)),
});

/** The smallest box that contains the given boxes, skipping nulls; null when there are none. */
export function join(...boxes: (Box | null)[]): Box | null {
  const some = boxes.filter((box): box is Box => box !== null);
  return some.length ? union(some) : null;
}

/**
 * Where a canvas coordinate `point` appears in the stage, along one axis of length `size`, when
 * the view is at `to` and the canvas is drawn at `scale`.
 */
export const stagePoint = (point: number, to: number, size: number, scale: number) =>
  size / 2 - to + point * scale;

/**
 * Whether `outer` contains `inner`, allowing 2 px on each edge. Used to tell when a popup has
 * finished its entrance and stopped moving.
 */
export const covers = (outer: Box, inner: Box) =>
  inner.left >= outer.left - 2 &&
  inner.top >= outer.top - 2 &&
  inner.right <= outer.right + 2 &&
  inner.bottom <= outer.bottom + 2;

/**
 * The new view position along one axis for a playing tile. `at` is the current position, `low`
 * and `high` the drawn extent of what must stay visible, and `half` half the stage's length.
 * - If the content is too large for the stage (less margins), it is centred.
 * - If it is already inside the stage (with 1 px slack), the view stays at `at`.
 * - Otherwise the view moves just far enough to bring it in, plus `margin`.
 */
export function contain(at: number, low: number, high: number, half: number) {
  if (high - low > 2 * (half - margin)) return (low + high) / 2;
  if (low - at >= -half - 1 && high - at <= half + 1) return at;
  return Math.min(Math.max(at, high - half + margin), low + half - margin);
}

/**
 * The sides at which `shows` reaches more than 1 px past a stage `across` by `down`, with the view
 * at `toX`, `toY` and `scale`. Returns them space-separated, in the order top, bottom, start, end,
 * for `data-cut` (Gallery.css), which fades the picture out at those sides.
 */
export function cutSides(
  shows: Box,
  across: number,
  down: number,
  toX: number,
  toY: number,
  scale: number,
) {
  const past = (at: number, size: number, low: number, high: number) => [
    size / 2 - at + low * scale < -1,
    size / 2 - at + high * scale > size + 1,
  ];
  const [top, bottom] = past(toY, down, shows.top, shows.bottom);
  const [start, end] = past(toX, across, shows.left, shows.right);
  return [top && 'top', bottom && 'bottom', start && 'start', end && 'end']
    .filter(Boolean)
    .join(' ');
}

/**
 * Frames a tile's still the way its play will frame it, so the pointer arriving or leaving does
 * not move the view (onCourse, PointerCourse.ts).
 *
 * `parts` are the boxes the pointer heads to over its course, in order (nulls and empty boxes are
 * skipped). Starting from the first, as many as fit together in a stage `across` by `down` are
 * joined, and the view is moved to contain them, as `contain` does while the tile plays. A first
 * part larger than the stage is shown from its start, a margin from the stage's edge, as the play
 * shows it (decideDrawOut). With no parts, the view stays at `toX`, `toY`.
 */
export function frameOnCourse(
  parts: readonly (Box | null)[],
  across: number,
  down: number,
  toX: number,
  toY: number,
  scale: number,
) {
  const halfAcross = across / 2 - 4;
  const halfDown = down / 2 - 4;
  let held: Box | null = null;
  // Whether the first part is larger than the stage along each axis, so it shows from its start.
  let fromStart = { x: false, y: false };
  for (const found of parts) {
    if (!found || found.right <= found.left || found.bottom <= found.top) continue;
    // A first part larger than the stage, such as a divider as tall as its panes, is cut to the
    // stage's size from its start.
    let box = found;
    if (!held) {
      const right = found.left + (2 * (halfAcross - margin) - pixelTolerance) / scale;
      const bottom = found.top + (2 * (halfDown - margin) - pixelTolerance) / scale;
      fromStart = { x: found.right > right, y: found.bottom > bottom };
      box = {
        ...found,
        right: Math.min(found.right, right),
        bottom: Math.min(found.bottom, bottom),
      };
    }
    // `box` is never null, so the join is never null.
    const next: Box = join(held, box)!;
    if (
      (next.right - next.left) * scale > 2 * (halfAcross - margin) ||
      (next.bottom - next.top) * scale > 2 * (halfDown - margin)
    )
      continue;
    held = next;
  }
  if (!held) return { toX, toY };
  return {
    toX: fromStart.x
      ? held.left * scale + halfAcross - margin
      : contain(toX, held.left * scale, held.right * scale, halfAcross),
    toY: fromStart.y
      ? held.top * scale + halfDown - margin
      : contain(toY, held.top * scale, held.bottom * scale, halfDown),
  };
}

/** A box a picture paints, and the space in px it keeps from the stage's edges (anchoredScale). */
export interface Padded {
  box: Box;
  pad: number;
}

/** The drawn extent of padded boxes along one axis at a scale, each box grown by its pad. */
function paddedExtent(parts: readonly Padded[], scale: number, axis: 'x' | 'y') {
  let low = Infinity;
  let high = -Infinity;
  for (const { box, pad } of parts) {
    low = Math.min(low, (axis === 'x' ? box.left : box.top) * scale - pad);
    high = Math.max(high, (axis === 'x' ? box.right : box.bottom) * scale + pad);
  }
  return { low, high };
}

/**
 * The largest scale, up to `most`, at which the padded boxes fit a stage `across` by `down`. Each
 * box keeps its own pad from the edges: for example a popup's field keeps the inset and the popup
 * keeps popupRoom. Found by bisection.
 */
export function anchoredScale(parts: readonly Padded[], across: number, down: number) {
  const fits = (scale: number) => {
    const x = paddedExtent(parts, scale, 'x');
    const y = paddedExtent(parts, scale, 'y');
    return x.high - x.low <= across + pixelTolerance && y.high - y.low <= down + pixelTolerance;
  };
  if (fits(most)) return most;
  let low = 0;
  let high = most;
  for (let count = 0; count < 24; count++) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  return low;
}

/**
 * The scales a tile may be drawn at on a phone, largest first: 1 (its own size), the phone's floor
 * (`--catalogue-own-floor`), and the popups' least scale (`--catalogue-own-popup-least`,
 * Gallery.css). Limiting tiles to these few scales keeps neighbouring tiles at matching sizes.
 */
export const phoneSteps = (floor: number, popupLeast: number) =>
  [...new Set([1, floor, popupLeast])].filter((step) => step > 0).sort((a, b) => b - a);

/** On a phone: the largest of `steps` (phoneSteps) from `low` to `scale`, else `low`. */
export const stepDown = (steps: readonly number[], scale: number, low: number) =>
  steps.find((each) => each >= low - scaleTolerance && each <= scale + scaleTolerance) ?? low;

/**
 * What a picture paints, as a box in its canvas's own px, together with the space its stage has
 * for it: the stage's size less the inset on each side, as `width` and `height` in px.
 */
export interface Extent extends Box {
  width: number;
  height: number;
}

/**
 * The scale at which the picture's window (the canvas at its own size) fits the stage's space.
 *
 * Fitting the window, not what the picture paints, gives every tile of a kind the same scale. A
 * page's own tile (`kind.tile`) may be enlarged up to `most`; anything else is never enlarged. The
 * scale depends only on the window, because popups are placed again at each scale, and a scale
 * that followed them would never settle. Either way, the view is centred on what the picture
 * paints, not on its window.
 */
export const windowScale = (
  kind: FitKind,
  { width, height }: Extent,
  canvas: { offsetWidth: number; offsetHeight: number },
) => Math.min(kind.tile ? most : 1, width / canvas.offsetWidth, height / canvas.offsetHeight);

/**
 * The scale settings a component's tile reads from its style (Gallery.css): the least box it must
 * be drawn whole in, across (`least`, from `--catalogue-own-least`, in px) and down (`leastBlock`,
 * from `--catalogue-own-least-block`); and on a phone, its floor and allowed scales (phoneSteps).
 */
export interface OwnScales {
  least: number;
  leastBlock: number;
  floor: number;
  phone: boolean;
  steps: readonly number[];
}

/**
 * The scale a component is drawn at in a gallery.
 *
 * It is drawn at its own size (1) unless the stage's space is smaller than the least box: `least`
 * across (five tiles to a row) and `leastBlock` down (a menu open under its button). Then it is
 * drawn smaller by the same factor in every tile, since every stage has the same size, so nothing
 * reaches the stage's edge.
 *
 * On a phone, the scale is one of phoneSteps: its own size where it fits the stage's width and
 * that height, else the floor. Anything larger than that is cut off.
 */
export function ownScale({ left, right, width, height }: Extent, scales: OwnScales) {
  const downScale = scales.leastBlock > 0 ? height / scales.leastBlock : 1;
  return scales.phone
    ? stepDown(scales.steps, Math.min(1, width / (right - left), downScale), scales.floor)
    : Math.min(1, width / scales.least, downScale);
}

/** The inputs restingScale chooses a resting picture's scale from. */
export interface Resting {
  extent: Extent;
  /** The scale the picture's window fits the stage at (windowScale). */
  window: number;
  /** The scale a component is drawn at (ownScale). */
  own: number;
  /** Whether the picture shows a popup open. */
  popup: boolean;
  /**
   * Whether it is on a phone, the popups' least scale, and the overlays' scale when the picture
   * is an overlay (0 otherwise).
   */
  scales: { phone: boolean; popupLeast: number; overlay: number };
  /** The scale an open popup is drawn at, at most `atMost` (decidePopups, FitResting.ts). */
  popupScale: (atMost: number) => number;
  /** The largest scale at which an overlay shows whole across; Infinity for other pictures. */
  overlayWhole: number;
}

/** The scale a resting picture is drawn at, by its kind (FitKind). */
export function restingScale(kind: FitKind, resting: Resting) {
  switch (kind.scale) {
    case 'own':
      return componentScale(resting);
    case 'legible':
      return sceneScale(resting);
    case 'window':
      return resting.window;
    case 'content':
      return contentScale(resting);
  }
}

/**
 * A component's scale. Without a popup, its own scale (ownScale). With an open popup, the popup's
 * scale (decidePopups), at most its own scale, or at most 1 on a phone, where its own scale is one
 * of the phone's steps. An overlay, such as a notification, is drawn at the overlays' scale, or
 * smaller if that is what shows it whole across, but no smaller than the popups' least scale.
 */
function componentScale({ own, popup, scales, popupScale, overlayWhole }: Resting) {
  if (!popup) return own;
  const drawn = popupScale(scales.phone ? 1 : own);
  return scales.overlay
    ? Math.min(scales.overlay, drawn, Math.max(scales.popupLeast, overlayWhole))
    : drawn;
}

/** A pattern's scene: its window's scale, capped at 1 and at least the legible scale. */
function sceneScale({ window, popup, popupScale }: Resting) {
  const scene = Math.max(legibleScale, Math.min(1, window));
  return popup ? popupScale(scene) : scene;
}

/** An example or a specimen: as large as fits what it paints, at most its window's scale. */
function contentScale({ extent, window }: Resting) {
  const { left, top, right, bottom, width, height } = extent;
  return Math.min(window, width / (right - left), height / (bottom - top));
}

/** The inputs drawOut uses when a playing tile opens something. */
export interface DrawOut {
  /** The box that must be shown: what opened, and what the tile names. */
  must: Box;
  /** The trigger that opened it, with its field's label if it has one. */
  anchor: Box | null;
  /** The current view and the scale it is drawn at. */
  at: { x: number; y: number; scale: number };
  /** The stage's size. */
  across: number;
  down: number;
  /** The scale the play is drawn at so far. It only falls until the tile rests. */
  scale: number;
  /** The least scale allowed, and a function that rounds a scale to the allowed steps. */
  least: number;
  stepped: (scale: number) => number;
}

/**
 * Where a playing tile's view goes to show what it opened (decideDrawOut, FitPlaying.ts).
 *
 * The scale:
 * - If everything needed fits the stage at the current scale, the scale stays.
 * - Else, if the trigger is in view, the scale is the largest that keeps the trigger where it is
 *   on the stage and fits the rest around it.
 * - Else, the scale is the largest that fits everything.
 * In every case it is no smaller than `least`, and is rounded by `stepped`.
 *
 * The position: the trigger stays where it is, else what is needed is centred; then the view moves
 * just far enough to keep it in. What does not fit is shown from its start, but the view never
 * moves so far that the trigger leaves it.
 */
export function drawOut({ must, anchor, at, across, down, scale: drawn, least, stepped }: DrawOut) {
  const screen = (point: number, to: number, size: number) => stagePoint(point, to, size, at.scale);
  const inView =
    anchor &&
    screen(anchor.left, at.x, across) >= 0 &&
    screen(anchor.right, at.x, across) <= across &&
    screen(anchor.top, at.y, down) >= 0 &&
    screen(anchor.bottom, at.y, down) <= down;
  // `must` is never null, so the join is never null.
  const needed = join(must, anchor)!;
  const middle =
    anchor && inView
      ? { x: (anchor.left + anchor.right) / 2, y: (anchor.top + anchor.bottom) / 2 }
      : null;
  // Along an axis of length `size`: the largest scale at which `low` to `high` fits, with the
  // anchor's `point` kept where it is on the stage.
  const holding = (size: number, to: number, point: number, low: number, high: number) => {
    const place = screen(point, to, size);
    return Math.min(
      low < point ? (place - playMargin) / (point - low) : Infinity,
      high > point ? (size - playMargin - place) / (high - point) : Infinity,
    );
  };
  const fitsAsIs =
    (needed.right - needed.left) * drawn <= across - 2 * playMargin &&
    (needed.bottom - needed.top) * drawn <= down - 2 * playMargin;
  const wanted = fitsAsIs
    ? drawn
    : middle
      ? Math.min(
          holding(across, at.x, middle.x, needed.left, needed.right),
          holding(down, at.y, middle.y, needed.top, needed.bottom),
        )
      : Math.min(
          (across - 2 * playMargin) / (needed.right - needed.left),
          (down - 2 * playMargin) / (needed.bottom - needed.top),
        );
  // Content that reaches only slightly into the margin, such as a time one word longer, keeps
  // the scale.
  const scale =
    wanted >= drawn * zoomSlack ? drawn : stepped(Math.min(drawn, Math.max(least, wanted)));
  // The view's position along one axis. The anchor's `point` stays where it is, or without one
  // what is needed is centred; then the view moves just far enough to keep `low` to `high` in.
  // When that does not fit, it is shown from its start, without moving the trigger (`keepLow` to
  // `keepHigh`) out of view.
  const along = (
    size: number,
    to: number,
    point: number | undefined,
    low: number,
    high: number,
    keepLow?: number,
    keepHigh?: number,
  ) => {
    if ((high - low) * scale > size - 2 * playMargin + pixelTolerance) {
      const start = size / 2 + low * scale - playMargin;
      if (keepLow === undefined || keepHigh === undefined) return start;
      return Math.min(
        Math.max(start, size / 2 + keepHigh * scale - size + playMargin),
        size / 2 + keepLow * scale - playMargin,
      );
    }
    const held =
      point === undefined
        ? ((low + high) / 2) * scale
        : size / 2 + point * scale - screen(point, to, size);
    return Math.min(
      Math.max(held, size / 2 + high * scale - size + playMargin),
      size / 2 + low * scale - playMargin,
    );
  };
  return {
    scale,
    toX: along(across, at.x, middle?.x, needed.left, needed.right, anchor?.left, anchor?.right),
    toY: along(down, at.y, middle?.y, needed.top, needed.bottom, anchor?.top, anchor?.bottom),
  };
}
