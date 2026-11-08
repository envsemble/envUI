/*
 * The fit's pure calculations (useFit.ts): boxes in a canvas's own px, the scales a picture is
 * drawn at, and where its view goes. Nothing here reads the page (tests/Fit.test.mjs).
 */
import type { FitKind } from './Fitting';

/** A box, by its edges: in a canvas's own px here, in whatever px its user measures elsewhere. */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Scales closer than this are one scale: measured again, a box may come out a hair larger or
 * smaller, a ten-millionth of the scale.
 */
export const scaleTolerance = 0.0005;

/**
 * Lengths closer than this, in px, are one length: what is placed at whole pixels, or measured
 * again, comes out a fraction off.
 */
export const pixelTolerance = 0.5;

/** The steps a scale is kept to where it is written down or held, thousandths. */
export const scalePrecision = 1000;

/** The least room, in px, between a picture and its stage's edges. */
export const inset = 16;

/**
 * The most a page's own tile is enlarged: written for its small window, it is drawn large.
 * @internal
 */
export const most = 2;

/** The least a pattern's scene is drawn at in a gallery, so its words stay legible. */
export const legibleScale = 0.8;

/** How far ahead of a stage's edge a tile's view keeps what it shows, once it has to move. */
export const margin = 6;

/** How far, in px, from a stage's edges a playing tile's view keeps what it opens and its trigger. */
const playMargin = 10;

/** The share of its scale a playing tile's content may need before it is drawn smaller. */
const zoomSlack = 0.97;

/**
 * How far, in px, a popup and what it opens from may reach into the inset, both edges together,
 * and still show whole, centred, rather than cut off: a notification a word too wide for it.
 */
export const insetSlack = 4;

/**
 * The room, in px, a popup keeps from its stage's edges where its tile frames it (anchoredScale):
 * no more than a menu keeps from the edges it is placed against, so where it is pressed against
 * one, the view can still give it that.
 */
export const popupRoom = 5;

/**
 * The room, in px, a held popup drawn whole a little smaller than the popups' least keeps from its
 * stage's edges, with what it opens from: more than the room a popup keeps where it is drawn at its
 * own size, so its foot doesn't sit on the stage's.
 */
export const wholeRoom = 8;

/** How long the cursor is, in rem, from its tip (Stage.css), at the scale its picture is drawn at. */
export const cursorLength = 1.25;

/** The least room, in px, the cursor keeps from its stage's foot. */
export const cursorRoom = 0;

/** The least box around one box or more. */
export const union = (boxes: readonly Box[]): Box => ({
  left: Math.min(...boxes.map((box) => box.left)),
  top: Math.min(...boxes.map((box) => box.top)),
  right: Math.max(...boxes.map((box) => box.right)),
  bottom: Math.max(...boxes.map((box) => box.bottom)),
});

/** The least box around the boxes there are, or nothing for none. */
export function join(...boxes: (Box | null)[]): Box | null {
  const some = boxes.filter((box): box is Box => box !== null);
  return some.length ? union(some) : null;
}

/** Whether a box holds another, to a couple of px, as a popup ends its entrance. */
export const covers = (outer: Box, inner: Box) =>
  inner.left >= outer.left - 2 &&
  inner.top >= outer.top - 2 &&
  inner.right <= outer.right + 2 &&
  inner.bottom <= outer.bottom + 2;

/**
 * Where a tile's view goes along one axis while it plays: where it is, while what it shows, from
 * `low` to `high` around the view's `at`, is inside the stage's `half` either side of its middle;
 * else just far enough, and a margin, to bring it in; and centred where it can't fit.
 */
export function contain(at: number, low: number, high: number, half: number) {
  if (high - low > 2 * (half - margin)) return (low + high) / 2;
  if (low - at >= -half - 1 && high - at <= half + 1) return at;
  return Math.min(Math.max(at, high - half + margin), low + half - margin);
}

/**
 * The sides what a picture shows reaches past its stage's edges at, `across` by `down`, drawn at a
 * view: the sides it is cut off at (`data-cut`, Gallery.css).
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

/** A box a picture paints and the room, in px, it keeps from its stage's edges (anchoredScale). */
export interface Padded {
  box: Box;
  pad: number;
}

/** How far boxes reach along an axis, drawn at a scale, with the room each keeps around it. */
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
 * The largest scale, up to `most`, at which boxes fit a stage `across` by `down`, each with the
 * room it keeps from the stage's edges, such as a popup's field the inset and the popup a margin.
 */
export function anchoredScale(parts: readonly Padded[], across: number, down: number) {
  const fits = (scale: number) => {
    const x = paddedExtent(parts, scale, 'x');
    const y = paddedExtent(parts, scale, 'y');
    return x.high - x.low <= across + 0.5 && y.high - y.low <= down + 0.5;
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
 * A phone's scales, largest first: a component's own size, the phone's floor where it is larger
 * (`--catalogue-own-floor`), and for an open popup the least a popup is drawn at
 * (`--catalogue-own-popup-least`, Gallery.css), so neighbouring tiles are drawn at one of two.
 */
export const phoneSteps = (floor: number, popupLeast: number) =>
  [...new Set([1, floor, popupLeast])].filter((step) => step > 0).sort((a, b) => b - a);

/** On a phone, the largest of its scales (phoneSteps) a picture fits at, no smaller than `low`. */
export const stepDown = (steps: readonly number[], scale: number, low: number) =>
  steps.find((each) => each >= low - scaleTolerance && each <= scale + scaleTolerance) ?? low;

/** What a picture shows, in its canvas's own px, and the room its stage has for it, less the inset. */
export interface Extent extends Box {
  width: number;
  height: number;
}

/**
 * The scale a picture's window, `canvas` at its own size, fits the stage at. A window that counts
 * whole, a gallery's or a tile's, sets the scale, so every tile of its kind is drawn at one scale;
 * a gallery's draws what overflows it smaller. A page's own tile is written for its window, so its
 * scale is the window's alone, up to `most`: one that followed its popups would move them, as they
 * are placed again at each scale, and never settle. Either way, what the picture paints is
 * centred, not its window.
 */
export const windowScale = (
  kind: FitKind,
  { width, height }: Extent,
  canvas: { offsetWidth: number; offsetHeight: number },
) => Math.min(kind.tile ? most : 1, width / canvas.offsetWidth, height / canvas.offsetHeight);

/**
 * The scales its style sets a component's tile at (Gallery.css): the least box it is drawn whole in
 * across (`--catalogue-own-least`, in px) and down (`--catalogue-own-least-block`), and on a phone,
 * its floor and the scales it is drawn at (phoneSteps).
 */
export interface OwnScales {
  least: number;
  leastBlock: number;
  floor: number;
  phone: boolean;
  steps: readonly number[];
}

/**
 * The scale a component is drawn at, at its own size, unless the stage's room is smaller than the
 * least box it is drawn whole in, `--catalogue-own-least` across, as five to a row, and
 * `--catalogue-own-least-block` down, as a menu open under its button: then drawn smaller, by one
 * scale for every tile, as every stage is as large, so nothing reaches the stage's edge. On a
 * phone, each is drawn at one of a few scales (phoneSteps): its own size where it fits its stage's
 * width and that height, else `--catalogue-own-floor`, and what is larger still is cut off.
 */
export function ownScale({ left, right, width, height }: Extent, scales: OwnScales) {
  const downScale = scales.leastBlock > 0 ? height / scales.leastBlock : 1;
  return scales.phone
    ? stepDown(scales.steps, Math.min(1, width / (right - left), downScale), scales.floor)
    : Math.min(1, width / scales.least, downScale);
}

/** What the scale a resting picture is drawn at is decided on (restingScale). */
export interface Resting {
  extent: Extent;
  /** The scale its window fits the stage at (windowScale). */
  window: number;
  /** The scale a component is drawn at, at its own size (ownScale). */
  own: number;
  /** Whether it shows a popup open. */
  popup: boolean;
  /** Whether it is on a phone, the popups' least scale, and the overlays' where it is one, or 0. */
  scales: { phone: boolean; popupLeast: number; overlay: number };
  /** The scale a popup shown open is drawn at, at most `atMost` (popupFit, Fit.ts). */
  popupScale: (atMost: number) => number;
  /** The largest scale an overlay shows whole across at, or Infinity for any other picture. */
  overlayWhole: number;
}

/** The scale a resting picture is drawn at, by what it is fitted as (FitKind). */
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
 * A component at its own size; a popup shown open as popupFit draws it, at most its own size, or
 * on a phone, where its own size is one of the phone's scales, at most 1; and an overlay, such as a
 * notification, at the overlays' scale, or as much smaller as shows it whole across, down to the
 * popups' least.
 */
function componentScale({ own, popup, scales, popupScale, overlayWhole }: Resting) {
  if (!popup) return own;
  const drawn = popupScale(scales.phone ? 1 : own);
  return scales.overlay
    ? Math.min(scales.overlay, drawn, Math.max(scales.popupLeast, overlayWhole))
    : drawn;
}

/** A pattern's scene: its window's scale, no larger than its own size nor smaller than legible. */
function sceneScale({ window, popup, popupScale }: Resting) {
  const scene = Math.max(legibleScale, Math.min(1, window));
  return popup ? popupScale(scene) : scene;
}

/** An example or a specimen: as large as what it paints fits the stage, no larger than its window. */
function contentScale({ extent, window }: Resting) {
  const { left, top, right, bottom, width, height } = extent;
  return Math.min(window, width / (right - left), height / (bottom - top));
}

/** Where a playing tile's view stands as it opens something, and what it needs to show. */
export interface DrawOut {
  /** What opened and what the tile names, which the view takes in. */
  must: Box;
  /** The trigger that opened it, with its field's label, where there is one. */
  anchor: Box | null;
  /** Where the view is, and the scale it is drawn at. */
  at: { x: number; y: number; scale: number };
  /** The stage's size. */
  across: number;
  down: number;
  /** The scale the play is drawn at so far, which only falls until it rests. */
  scale: number;
  /** The least it is drawn at, and the scales it may be drawn at between. */
  least: number;
  stepped: (scale: number) => number;
}

/**
 * Where a playing tile's view goes to take in what it opened (playFit): where all of it fits the
 * stage at the scale it is drawn at, it keeps that scale, the view moving just far enough; else
 * about the trigger, as much smaller as keeps it where it is; without one in view, as small as all
 * of it needs; either way, no smaller than `least`. The trigger is never panned out of view: where
 * it shows whole, it stays where it is; where it reaches past an edge, the view takes it in with
 * what it opened.
 */
export function drawOut({ must, anchor, at, across, down, scale: drawn, least, stepped }: DrawOut) {
  // Where a point of the canvas is in the stage, along an axis `size` long.
  const screen = (point: number, to: number, size: number) => size / 2 - to + point * at.scale;
  const inView =
    anchor &&
    screen(anchor.left, at.x, across) >= 0 &&
    screen(anchor.right, at.x, across) <= across &&
    screen(anchor.top, at.y, down) >= 0 &&
    screen(anchor.bottom, at.y, down) <= down;
  const needed = join(must, anchor)!;
  const middle =
    anchor && inView
      ? { x: (anchor.left + anchor.right) / 2, y: (anchor.top + anchor.bottom) / 2 }
      : null;
  // Along an axis `size` long, the largest scale that holds what is needed, from `low` to `high`,
  // with the anchor's `point` where it is.
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
  // What reaches a little into the margin, such as a time a word longer, keeps the scale.
  const scale =
    wanted >= drawn * zoomSlack ? drawn : stepped(Math.min(drawn, Math.max(least, wanted)));
  // Along an axis: the anchor where it was, else what is needed centred, then just far enough to
  // keep that in; where it doesn't fit, shown from its start, but never so far that the trigger,
  // from `keepLow` to `keepHigh`, leaves the view.
  const along = (
    size: number,
    to: number,
    point: number | undefined,
    low: number,
    high: number,
    keepLow?: number,
    keepHigh?: number,
  ) => {
    if ((high - low) * scale > size - 2 * playMargin + 0.5) {
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
