/*
 * A held view's scale and place (useFit.ts): a tile that holds its view (StageScript, FitKind.ts),
 * such as a picker resting open, is framed once on its still, the largest it shows, so what its
 * script acts on shows whole in it from its top, above the fade at its foot, with the cursor on
 * it. Nothing here reads the page (tests/site/Fit.test.mjs).
 */
import { cursorRoom, inset, join, scaleTolerance, type Box } from './FitGeometry';
import { pixelTolerance } from '../shared/Remeasure';

/** How far, in px, a row may reach past the crop's foot and still count as whole (trimRows). */
export const rowSlack = 2;

/**
 * The least of the fade, in px, a held view keeps below what its script acts on where the row after
 * it doesn't show whole, so its crop reads as fading out rather than cut off.
 */
const heldFadeLeast = 8;

/**
 * The least room, in px, a held view keeps above what it shows from, such as a picker's field,
 * where it is moved up from the inset so what its script acts on shows above its foot.
 */
export const heldTopLeast = 4;

/**
 * The least a held view is drawn at, where what its script acts on shows above its fade only
 * smaller than the popups' scale: about a modal's least (Tiles.ts).
 */
const heldLeast = 0.6;

/**
 * The least a held view is drawn at to show the row after its chosen one whole in the fade at its
 * foot: about the overlays' scale on a phone, so its words stay legible.
 */
export const heldNextLeast = 0.7;

/**
 * The least a held view is drawn at to show the two rows after its chosen one, of a picker's grid
 * or wheel, the second whole in the fade at its foot, such as a date picker's next two weeks: below
 * it, it shows the next one alone, so it keeps about the size of the tiles beside it.
 */
const heldRowsLeast = 0.65;

/**
 * A way a held view shows what its script acts on: what shows whole above a fade at least `fade`
 * long, what shows whole in that fade as far as `reach`, the least scale it takes, and how far, in
 * px, a row at the foot may reach past it (rowSlack).
 */
export interface HeldWay {
  whole: Box;
  reach: Box;
  fade: number;
  least: number;
  slack: number;
}

/** What a held view shows, its stage's height, and where its pointer presses at rest. */
export interface HeldRoom {
  /** The stage's height. */
  size: number;
  /** The top of what the picture shows, in the canvas's own px. */
  top: number;
  /** The lowest point the pointer presses at rest, where its cursor's tip is, if any. */
  pointerFoot: number | null;
  /** The cursor's length, in px. */
  cursor: number;
}

/** What a held view's script acts on, and the rows after it that it shows where it can. */
export interface HeldRows {
  /** What its script acts on, together. */
  chosen: Box;
  /** With the row after a picker's chosen one, and with the one after that. */
  keep: Box;
  keepFurther: Box;
  /** Whether there is a row after it, and a second. */
  below: boolean;
  further: boolean;
}

/**
 * The ways a held view may show what its script acts on, most first, each with the least scale it
 * is drawn at for it. A picker's chosen row and the next above the fade with the row after them in
 * it; those two above the fade, or where only the floor allows that, above the foot; else the
 * chosen row above the fade with the next in it, or for a view without rows, such as a menu's, what
 * its script acts on above the foot; else the chosen row alone, above the fade or at least above
 * the foot.
 */
export function heldWays({ chosen, keep, keepFurther, below, further }: HeldRows): HeldWay[] {
  return [
    ...(further
      ? [
          {
            whole: keep,
            reach: keepFurther,
            fade: heldFadeLeast,
            least: heldRowsLeast,
            slack: rowSlack,
          },
        ]
      : []),
    ...(below
      ? [
          { whole: keep, reach: keep, fade: heldFadeLeast, least: heldLeast, slack: rowSlack },
          { whole: keep, reach: keep, fade: 0, least: heldLeast, slack: rowSlack },
        ]
      : []),
    { whole: chosen, reach: keep, fade: 0, least: heldNextLeast, slack: 0 },
    { whole: chosen, reach: chosen, fade: heldFadeLeast, least: heldLeast, slack: 0 },
    { whole: chosen, reach: chosen, fade: 0, least: heldLeast, slack: 0 },
  ];
}

/** The rows a held view keeps: what its script acts on, with the rows after it, if anything. */
export function heldRows(acted: readonly Box[], below: readonly Box[], further: readonly Box[]) {
  const chosen = join(...acted);
  if (!chosen) return null;
  // Joined with what is chosen, the rows are a box.
  const keep = join(chosen, ...below)!;
  return {
    chosen,
    keep,
    keepFurther: join(keep, ...further)!,
    below: below.length > 0,
    further: further.length > 0,
  };
}

/**
 * Where a held view's top goes in its stage, drawn at a scale, to show as a way says: the inset
 * from the stage's top, or higher, up to `heldTopLeast` from it, as far as keeps what shows whole
 * above the fade, what reaches into it inside the stage, and the cursor on its lowest point inside
 * the stage; or none where the scale doesn't allow that. The fade starts below what shows whole
 * above it. A picker's row at the foot may reach its slack past it, as it still shows whole there
 * (trimRows).
 * @internal
 */
export function heldTop(scale: number, way: HeldWay, room: HeldRoom) {
  const { size, top, pointerFoot, cursor } = room;
  const cursorFoot = pointerFoot === null ? -Infinity : (pointerFoot - top + cursor) * scale;
  const at = Math.min(
    inset,
    size - way.fade - (way.whole.bottom - top) * scale + (way.fade ? 0 : way.slack),
    size + way.slack - (way.reach.bottom - top) * scale,
    size - cursorRoom - cursorFoot,
  );
  return at >= heldTopLeast - pixelTolerance ? { at, fadeAt: way.whole.bottom } : null;
}

/** The first way a held view shows as at a scale, and where it is placed for it (heldTop). */
export function heldPlace(scale: number, ways: readonly HeldWay[], room: HeldRoom) {
  for (const way of ways) {
    const placed = heldTop(scale, way, room);
    if (placed) return placed;
  }
  return null;
}

/** The largest scale from `low` to `high` at which a held view shows as a way says.
 * @internal
 */
export function heldAtMost(low: number, high: number, way: HeldWay, room: HeldRoom) {
  if (high < low) return null;
  if (heldTop(high, way, room)) return high;
  if (!heldTop(low, way, room)) return null;
  for (let count = 0; count < 16; count++) {
    const middle = (low + high) / 2;
    if (heldTop(middle, way, room)) low = middle;
    else high = middle;
  }
  return Math.floor(low * 1000) / 1000;
}

/** The scales a held view chooses among: a tile's, a phone's, and the overlays'. */
export interface HeldScales {
  /** Whether it is on a phone, its scales (phoneSteps), and the least a popup is drawn at. */
  phone: boolean;
  steps: readonly number[];
  popupLeast: number;
  /** The overlays' one scale, `--catalogue-overlay-scale` (Gallery.css), as read: NaN unset. */
  overlayScale: number;
}

/**
 * A held view taller than its stage at a scale is drawn at the largest of the scales tiles are
 * drawn at, down to the overlays' one, at which what its script acts on shows above its fade
 * (heldTop): so is a picker resting open on a phone, its field and its chosen row whole together.
 * `tall` is how tall the picture is, and `height` the stage's room for it.
 */
export function heldScale(
  scale: number,
  ways: readonly HeldWay[],
  room: HeldRoom,
  { tall, height }: { tall: number; height: number },
  { phone, steps, popupLeast, overlayScale }: HeldScales,
) {
  if (!ways.length || tall * scale <= height + inset) return scale;
  // With the rows after a picker's chosen one, as large as allows the most of them, each way down
  // to its least (heldWays).
  const [alone, bare] = ways.slice(-2) as [HeldWay, HeldWay];
  for (const way of ways.slice(0, -2)) {
    const found = heldAtMost(way.least, scale, way, room);
    if (found !== null) return found;
  }
  // Else as large as shows the chosen row whole above the foot.
  if (heldTop(scale, alone, room)) return scale;
  const least = overlayScale || scale;
  const lower = [...(phone ? steps : [popupLeast]), least]
    .filter((each) => each < scale - scaleTolerance && each >= least - scaleTolerance)
    .sort((a, b) => b - a);
  const found = lower.find((each) => heldTop(each, alone, room) !== null);
  if (found !== undefined) return found;
  // Where even that scale doesn't, it is drawn just as much smaller as it needs, with its fade,
  // else without it, no smaller than `heldLeast`, where it shows from the stage's top and the
  // lowest row its script acts on fades out through the foot.
  const high = lower.at(-1) ?? scale;
  return (
    heldAtMost(heldLeast, high, alone, room) ?? heldAtMost(heldLeast, high, bare, room) ?? heldLeast
  );
}

/**
 * A held component view that names what it shows anywhere (StageScript), such as a docked panel, shows
 * whole in the stage's room, a margin from its edges, at the scale `wants`: where the one scale
 * doesn't allow that, it is drawn at the largest of the scales tiles are drawn at that does, as a
 * held picker is (heldScale), else as much smaller as it needs, down to a held view's least.
 */
export function subjectScale(
  scale: number,
  wants: number,
  { phone, steps, popupLeast, overlayScale }: HeldScales,
) {
  if (wants >= scale - scaleTolerance) return scale;
  const overlayLeast = overlayScale || scale;
  const found = [...(phone ? steps : [popupLeast]), overlayLeast]
    .filter((each) => each < scale - scaleTolerance)
    .sort((a, b) => b - a)
    .find((each) => each <= wants + scaleTolerance);
  return found ?? Math.max(heldLeast, Math.floor(wants * 1000) / 1000);
}

/** How far, in px, a resting picture's popup is placed again before its view follows it. */
const followSlack = 4;

/**
 * How many times a resting picture's view follows its popups placed again once framed anew: as
 * far as a menu needs, and soon still where they would follow it on.
 */
const followsAtMost = 30;

/**
 * What a fit at rest is decided on (holdsFrame): the stage's and the canvas's sizes, what the
 * picture paints, how many popups are open in it, whether its stage showed whole, and where its
 * canvas was in it.
 */
export interface Shape {
  room: number[];
  /** Whether the stage shows whole (wholeInView), and where the canvas is in it. */
  whole: boolean;
  view: number[];
  /** What it paints, each with the popup it is part of as it was measured, if any (layerRoot). */
  boxes: { box: Box; popup: Element | null }[];
  popups: number;
}

/** Where a resting picture's view is framed, on what, and the sides it is cut off at there. */
export interface Framed {
  shape: Shape;
  scale: number;
  toX: number;
  toY: number;
  cut: string | undefined;
  fadeAt: number | null;
}

/**
 * How many times a resting picture's view has followed its popups placed again as it moves since
 * it was framed anew, and whether the fit at hand does (holdsFrame).
 */
export interface Follow {
  count: number;
  following: boolean;
}

/**
 * Whether a resting picture holds the view it was framed on. What it shows outside its popups is
 * where it was and as large, and as many popups are open, or it is framed again. A popup is placed
 * against the stage's and the window's edges, so as the view eases to its place, or the page
 * scrolls, it is placed again, a fraction or a flip away, and a view that followed it each time
 * could move it again, never still. While the stage shows only in part, scrolled to the window's
 * edge, the view holds, so scrolling moves nothing. Where nothing has moved, such as a popup placed
 * a frame after its tile shows, or opened again where it was after its tile played, it is framed
 * again on any change. Where the view has moved in its stage since, it follows a popup placed a few
 * px away, a number of times, such as a menu pressed against the stage's edge until it is under its
 * button, and then holds. With whether it holds comes how often it has followed since, counted on.
 */
export function holdsFrame(was: Shape, now: Shape, follow: Follow) {
  const holds = (held: boolean) => ({ holds: held, follow });
  const near = (a: readonly number[], b: readonly number[], slack: number) =>
    a.every((value, index) => Math.abs(value - b[index]!) <= slack);
  const edges = ({ box }: Shape['boxes'][number]) => [box.left, box.top, box.right, box.bottom];
  const same = (before: Shape['boxes'], after: Shape['boxes'], slack: number) =>
    before.length === after.length &&
    before.every((shown, index) => near(edges(shown), edges(after[index]!), slack));
  const parts = (boxes: Shape['boxes'], inPopup: boolean) =>
    boxes.filter(({ popup }) => (popup !== null) === inPopup);
  if (
    !near(was.room, now.room, pixelTolerance) ||
    was.popups !== now.popups ||
    !same(parts(was.boxes, false), parts(now.boxes, false), 1)
  )
    return holds(false);
  if (!now.whole) return holds(true);
  const popups = [parts(was.boxes, true), parts(now.boxes, true)] as const;
  if (near(was.view, now.view, 0.01)) return holds(same(...popups, 1));
  if (follow.count >= followsAtMost || same(...popups, followSlack)) return holds(true);
  return { holds: false, follow: { count: follow.count + 1, following: true } };
}
