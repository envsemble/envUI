/*
 * The scale and place of a held view (useFit.ts), and whether a resting picture keeps the view it
 * was framed at (holdsFrame).
 *
 * A tile that holds its view (StageScript.holdsView, FitKind.ts), such as a picker resting open,
 * is framed once, on its still, which is written as its largest state. The view is placed so that
 * what the script acts on shows whole from the top of the picture, above the fade at the crop's
 * bottom, with the cursor on it. Nothing here reads the page, so tests/site/Fit.test.mjs tests it
 * directly.
 */
import { cursorRoom, inset, join, scaleTolerance, type Box } from './FitGeometry';
import { pixelTolerance } from '../shared/Remeasure';

/** How far, in px, a row may reach past the crop's bottom and still count as whole (trimRows). */
export const rowSlack = 2;

/**
 * The least length of fade, in px, a held view keeps below what its script acts on when the next
 * row does not show whole. With it, the crop reads as fading out rather than cut off.
 */
const heldFadeLeast = 8;

/**
 * The least space, in px, a held view keeps above its top, such as a picker's field, when it is
 * moved up from the inset to fit what its script acts on above the bottom.
 */
export const heldTopLeast = 4;

/**
 * The least scale a held view is drawn at, used when what its script acts on only fits above the
 * fade at a scale below the popups' scale. About a modal's least scale (Tiles.ts).
 */
const heldLeast = 0.6;

/**
 * The least scale at which a held view also shows the row after its chosen row, whole inside the
 * fade. About the overlays' scale on a phone, so the words stay legible.
 */
export const heldNextLeast = 0.7;

/**
 * The least scale at which a held view shows the two rows after its chosen row of a picker's grid
 * or wheel, the second one inside the fade, such as a date picker's next two weeks. Below it, only
 * the next row shows, so the tile stays about the size of the tiles beside it.
 */
const heldRowsLeast = 0.65;

/**
 * One way a held view can show what its script acts on:
 * - `whole`: the box that must show whole above a fade at least `fade` px long;
 * - `reach`: the box that must show, whole, down to the bottom of the stage (inside the fade);
 * - `least`: the least scale this way may be drawn at;
 * - `slack`: how far, in px, a row at the bottom may reach past it (rowSlack).
 */
export interface HeldWay {
  whole: Box;
  reach: Box;
  fade: number;
  least: number;
  slack: number;
}

/** The vertical measurements a held view is placed by. */
export interface HeldHeights {
  /** The stage's height, in px. */
  stage: number;
  /** The top of what the picture shows, in the canvas's own px. */
  top: number;
  /** The lowest point the pointer presses at rest (where the cursor's tip is), if any. */
  pointerFoot: number | null;
  /** The cursor's length, in px. */
  cursor: number;
}

/** What a held view's script acts on, and the rows after it that it shows when there is space. */
export interface HeldRows {
  /** What the script acts on, joined into one box. */
  chosen: Box;
  /** `chosen` joined with the next row of a picker, and with the row after that. */
  keep: Box;
  keepFurther: Box;
  /** Whether there is a next row, and a second one. */
  below: boolean;
  further: boolean;
}

/**
 * The ways a held view may show what its script acts on, best first, each with the least scale it
 * may be drawn at. In order:
 * 1. the chosen row and the next row above the fade, and the row after them inside the fade;
 * 2. the chosen row and the next row above the fade;
 * 3. the same two rows above the bottom, without a fade;
 * 4. the chosen row above the bottom and the next row inside the fade, or for a view without rows,
 *    such as a menu, what the script acts on above the bottom;
 * 5. the chosen row alone above the fade;
 * 6. the chosen row alone above the bottom.
 * Ways 1 to 3 exist only when there are rows after the chosen one.
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

/**
 * The rows a held view keeps (HeldRows) from the boxes its script acts on (`acted`) and the next
 * and second rows of a picker (`below`, `further`). Null when the script acts on nothing.
 */
export function heldRows(acted: readonly Box[], below: readonly Box[], further: readonly Box[]) {
  const chosen = join(...acted);
  if (!chosen) return null;
  // `chosen` is never null here, so the joins are never null.
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
 * Where a held view's top goes in its stage at `scale` to show what `way` asks for, or null when
 * that scale cannot.
 *
 * The top is placed at the inset from the stage's top, or higher (down to heldTopLeast from it)
 * when that is needed to keep: `way.whole` above the fade, `way.reach` inside the stage, and the
 * cursor on the lowest pressed point inside the stage. A row at the bottom may reach `way.slack`
 * px past the bottom, since it still shows whole there (trimRows). Returns the top's distance
 * from the stage's top, `at`, and where the fade starts, `fadeAt`, in the canvas's own px.
 * @internal
 */
export function heldTop(scale: number, way: HeldWay, heights: HeldHeights) {
  const { stage, top, pointerFoot, cursor } = heights;
  const cursorFoot = pointerFoot === null ? -Infinity : (pointerFoot - top + cursor) * scale;
  const at = Math.min(
    inset,
    stage - way.fade - (way.whole.bottom - top) * scale + (way.fade ? 0 : way.slack),
    stage + way.slack - (way.reach.bottom - top) * scale,
    stage - cursorRoom - cursorFoot,
  );
  return at >= heldTopLeast - pixelTolerance ? { at, fadeAt: way.whole.bottom } : null;
}

/** The place (heldTop) of the first of `ways` that a held view can show at `scale`, or null. */
export function heldPlace(scale: number, ways: readonly HeldWay[], heights: HeldHeights) {
  for (const way of ways) {
    const placed = heldTop(scale, way, heights);
    if (placed) return placed;
  }
  return null;
}

/**
 * The largest scale from `low` to `high` at which a held view can show `way` (heldTop), rounded
 * down to thousandths, or null when even `low` cannot. Found by bisection.
 * @internal
 */
export function heldAtMost(low: number, high: number, way: HeldWay, heights: HeldHeights) {
  if (high < low) return null;
  if (heldTop(high, way, heights)) return high;
  if (!heldTop(low, way, heights)) return null;
  for (let count = 0; count < 16; count++) {
    const middle = (low + high) / 2;
    if (heldTop(middle, way, heights)) low = middle;
    else high = middle;
  }
  return Math.floor(low * 1000) / 1000;
}

/** The scales a held view chooses among: a phone's, the popups' least, and the overlays'. */
export interface HeldScales {
  /** Whether it is on a phone, the phone's scales (phoneSteps), and the popups' least scale. */
  phone: boolean;
  steps: readonly number[];
  popupLeast: number;
  /** The overlays' scale, `--catalogue-overlay-scale` (Gallery.css), as read: NaN when unset. */
  overlayScale: number;
}

/**
 * The scale of a held view that is taller than its stage at `scale`. `tall` is the picture's
 * height in its own px, and `height` the stage's space for it.
 *
 * If the picture fits (within the inset), or there are no ways, `scale` stays. Otherwise, in
 * order:
 * 1. the largest scale, down to each way's least, at which one of the ways with rows after the
 *    chosen one shows (heldWays);
 * 2. `scale`, if the chosen row shows whole above the fade at it;
 * 3. the largest of the smaller scales tiles are drawn at (a phone's steps or the popups' least,
 *    down to the overlays' scale) at which the chosen row shows above the fade. This is how a
 *    picker resting open on a phone keeps its field and chosen row whole together;
 * 4. the largest scale down to heldLeast that shows the chosen row with its fade, then without
 *    it; else heldLeast, where the view shows from the stage's top and the lowest row the script
 *    acts on fades out through the bottom.
 */
export function heldScale(
  scale: number,
  ways: readonly HeldWay[],
  heights: HeldHeights,
  { tall, height }: { tall: number; height: number },
  { phone, steps, popupLeast, overlayScale }: HeldScales,
) {
  if (!ways.length || tall * scale <= height + inset) return scale;
  // heldWays always ends with the chosen row's two ways, with and without a fade.
  const [alone, bare] = ways.slice(-2) as [HeldWay, HeldWay];
  for (const way of ways.slice(0, -2)) {
    const found = heldAtMost(way.least, scale, way, heights);
    if (found !== null) return found;
  }
  if (heldTop(scale, alone, heights)) return scale;
  const least = overlayScale || scale;
  const lower = [...(phone ? steps : [popupLeast]), least]
    .filter((each) => each < scale - scaleTolerance && each >= least - scaleTolerance)
    .sort((a, b) => b - a);
  const found = lower.find((each) => heldTop(each, alone, heights) !== null);
  if (found !== undefined) return found;
  const high = lower.at(-1) ?? scale;
  return (
    heldAtMost(heldLeast, high, alone, heights) ??
    heldAtMost(heldLeast, high, bare, heights) ??
    heldLeast
  );
}

/**
 * The scale of a held component view whose script names what it shows anywhere (StageScript),
 * such as a docked panel, which must show whole in the stage less a margin. `wants` is the scale
 * at which it does.
 *
 * If `scale` is at most `wants`, it stays. Otherwise: the largest of the smaller scales tiles are
 * drawn at (as in heldScale) that is at most `wants`; else `wants` itself, rounded down to
 * thousandths, but no smaller than heldLeast.
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

/** How far, in px, a resting picture's popup may move before the view follows it. */
const followSlack = 4;

/**
 * How many times a resting picture's view follows its popups after it was framed anew. Enough for
 * a menu to settle, and few enough that popups that keep moving the view stop soon.
 */
const followsAtMost = 30;

/**
 * What a resting picture was framed on, compared on the next fit (holdsFrame).
 * `sizes` holds the stage's and the canvas's sizes: stage width, stage height, canvas width,
 * canvas height.
 */
export interface Shape {
  sizes: number[];
  /** Whether the stage shows whole in the window (wholeInView), and where the canvas is in it. */
  whole: boolean;
  view: number[];
  /** The boxes it paints, each with the popup it was part of when measured (layerRoot), if any. */
  boxes: { box: Box; popup: Element | null }[];
  /** How many popups are open. */
  popups: number;
}

/** Where a resting picture's view was framed: on what, at which scale and point, and its cut. */
export interface Framed {
  shape: Shape;
  scale: number;
  toX: number;
  toY: number;
  cut: string | undefined;
  fadeAt: number | null;
}

/**
 * How many times a resting picture's view has followed its moved popups since it was framed
 * anew, and whether the current fit is one of those follows (holdsFrame).
 */
export interface Follow {
  count: number;
  following: boolean;
}

/**
 * Whether a resting picture keeps the view it was framed at (`was`), given what it shows now
 * (`now`). Returns `holds` and the updated follow count.
 *
 * Why: a popup is placed against the stage's and the window's edges. As the view eases into place
 * or the page scrolls, the popup is placed again, a fraction of a pixel or a flip away. A view that
 * followed it every time would move it again, and never come to rest.
 *
 * The rules, in order:
 * 1. If the sizes changed, the number of open popups changed, or what it shows outside popups
 *    moved by more than 1 px, it is framed again (does not hold).
 * 2. If the stage is only partly in the window, such as scrolled to its edge, it holds, so
 *    scrolling moves nothing.
 * 3. If the canvas has not moved in its stage, it holds only while its popups stay within 1 px.
 *    This lets a popup placed a frame after its tile shows, or reopened after the tile played,
 *    be framed again.
 * 4. If the canvas has moved, it holds once it has followed `followsAtMost` times, or while its
 *    popups stay within `followSlack` px. Otherwise it follows, and the count goes up. This lets
 *    a menu pressed against the stage's edge settle under its button.
 */
export function holdsFrame(was: Shape, now: Shape, follow: Follow) {
  const holds = (held: boolean) => ({ holds: held, follow });
  // `near` compares lists of the same length (sizes, view, edges), so `b[index]` exists.
  const near = (a: readonly number[], b: readonly number[], slack: number) =>
    a.every((value, index) => Math.abs(value - b[index]!) <= slack);
  const edges = ({ box }: Shape['boxes'][number]) => [box.left, box.top, box.right, box.bottom];
  // The lengths are checked first, so `after[index]` exists.
  const same = (before: Shape['boxes'], after: Shape['boxes'], slack: number) =>
    before.length === after.length &&
    before.every((shown, index) => near(edges(shown), edges(after[index]!), slack));
  const parts = (boxes: Shape['boxes'], inPopup: boolean) =>
    boxes.filter(({ popup }) => (popup !== null) === inPopup);
  if (
    !near(was.sizes, now.sizes, pixelTolerance) ||
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
