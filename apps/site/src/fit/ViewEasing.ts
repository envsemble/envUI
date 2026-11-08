/*
 * A picture's view, and how it moves to where the fit places it (useFit.ts). Until the picture
 * has shown, the view jumps to its place; after that it eases there over the slow motion token's
 * duration with the standard easing. Only this file writes `view`; the fit asks it to move through
 * glideTo and settle.
 */
import { prefersReducedMotion } from '@envui-internal/internal/reducedMotion';
import { rootEasingFunction, rootMotionDuration } from '../shared/RootMotionTokens';
import { place } from './FitDraw';
import type { Seen } from './FitMeasure';
import type { Fitting } from './useFit';
import { pixelTolerance } from '../shared/Remeasure';

type Point = [x: number, y: number, scale: number];

/** One glide of the view: its start and end points, its start time and its length, in ms. */
interface Course {
  from: Point;
  to: Point;
  start: number;
  length: number;
}

/**
 * The view: where the canvas is drawn now (`x`, `y`, `scale`) and where it is easing to (the
 * Target fields). The target can change during a glide; the glide then bends toward it (steer).
 * `rest` is the scale the picture is fitted at when resting; `zoomed` is whether a playing tile is
 * drawn smaller than that, or on its way back; `frame` is the next animation frame's request id.
 */
export interface View extends Target {
  x: number;
  y: number;
  scale: number;
  rest: number;
  frame: number;
  /** The current glide, if any, and the easing function. */
  course: Course | null;
  ease: (time: number) => number;
  /**
   * Before the picture shows: how many fits in a row placed the view at the same spot (`calm`),
   * and when the first fit ran (`start`). A popup is placed by its style a frame or two after it
   * opens, so a picture shown earlier would glide to it while fading in (settle).
   */
  first: { calm: number; start: number };
}

/**
 * Where the view goes: the point at the stage's middle (`toX`, `toY`, in drawn px), the scale,
 * and whether that scale is smaller than the resting one because a playing tile was drawn out.
 */
export interface Target {
  toX: number;
  toY: number;
  toScale: number;
  zoomed: boolean;
}

/** A picture's view before its first fit. */
export const newView = (): View => ({
  x: 0,
  y: 0,
  scale: 1,
  toX: 0,
  toY: 0,
  toScale: 1,
  rest: 1,
  zoomed: false,
  frame: 0,
  course: null,
  ease: rootEasingFunction('ease'),
  first: { calm: 0, start: 0 },
});

/**
 * The glide to use at time `now`, from the view's current point `at` to `to`.
 *
 * With no glide, it starts one. With the same target, the glide goes on. When the target moved
 * (for example as a tile's popups open and are placed): past 85% of the glide, a new glide starts
 * from `at`; earlier, the glide keeps its timing and its start point moves so the curve passes
 * through `at` now and ends at `to`. That way the view does not stop and start again each time
 * the target moves.
 * @internal
 */
export function steer(
  course: Course | null,
  at: Point,
  to: Point,
  now: number,
  length: number,
  ease: (time: number) => number,
): Course {
  if (!course) return { from: at, to, start: now, length };
  if (to.every((value, index) => value === course.to[index])) return course;
  const share = ease((now - course.start) / course.length);
  // Solve from + (to - from) * share = at for `from`, so the bent curve passes through `at` now.
  if (share > 0.85) return { from: at, to, start: now, length };
  const back = (index: 0 | 1 | 2) => (at[index] - to[index] * share) / (1 - share);
  return { ...course, to, from: [back(0), back(1), back(2)] };
}

/**
 * The view's point on a glide at time `now`, and whether the glide has ended.
 * @internal
 */
export function glideAt(
  course: Course,
  now: number,
  ease: (time: number) => number,
): { at: Point; settled: boolean } {
  const share = ease((now - course.start) / course.length);
  const { from, to } = course;
  const along = (index: 0 | 1 | 2) => from[index] + (to[index] - from[index]) * share;
  return {
    at: [along(0), along(1), along(2)],
    settled: now - course.start >= course.length,
  };
}

/** Runs one frame of the view's glide and requests the next, until the glide ends. */
function glide(f: Fitting, now: number) {
  const { view } = f;
  const to: Point = [view.toX, view.toY, view.toScale];
  view.course = steer(
    view.course,
    [view.x, view.y, view.scale],
    to,
    now,
    rootMotionDuration('slow'),
    view.ease,
  );
  const { at, settled } = glideAt(view.course, now, view.ease);
  [view.x, view.y, view.scale] = at;
  if (settled) {
    view.x = view.toX;
    view.y = view.toY;
    view.scale = view.toScale;
    view.course = null;
  }
  place(f);
  view.frame = settled ? 0 : requestAnimationFrame((time) => glide(f, time));
  // When a resting picture stops moving, fit once more, since its popups may have been placed
  // again during the glide (holdsFrame).
  if (settled && !f.playing.current) f.update();
}

/** Starts a glide, unless one is already running. */
function startGlide(f: Fitting) {
  if (f.view.frame) return;
  f.view.course = null;
  f.view.frame = requestAnimationFrame((time) => glide(f, time));
}

/** Moves the view to its target at once, cancelling any glide. */
function jump(f: Fitting) {
  const { view } = f;
  cancelAnimationFrame(view.frame);
  view.frame = 0;
  view.x = view.toX;
  view.y = view.toY;
  view.scale = view.toScale;
  place(f);
}

/** Sets a playing tile's new target and eases there, or jumps there when motion is reduced. */
export function glideTo(f: Fitting, { toX, toY, toScale, zoomed }: Target) {
  Object.assign(f.view, { toX, toY, toScale, zoomed });
  if (prefersReducedMotion()) jump(f);
  else startGlide(f);
}

/**
 * Places the view at `scale`, `toX`, `toY`, and observes the painted `boxes` so their resizes fit
 * again. Before the picture has shown, the view jumps there; afterwards a tile eases there, and
 * any other picture jumps.
 */
export function settle(
  f: Fitting,
  { scale, toX, toY }: { scale: number; toX: number; toY: number },
  { boxes }: Pick<Seen, 'boxes'>,
) {
  const { canvas, view } = f;
  const { first } = view;
  // Only a tile that has shown eases (and not when motion is reduced).
  const eases = f.kind.tile && canvas.dataset.fitted !== undefined && !prefersReducedMotion();
  // Before it has shown, the view jumps to each fit's place. The picture is marked shown
  // (`data-fitted`, which fades it in) once three fits in a row placed it at the same spot, or
  // after 250 ms even if something still moves, such as a popup placed again against the stage's
  // edges. The time limit matters on a busy page, such as a gallery while its tiles load: frames
  // come slowly there, and waiting for a count of frames alone could keep it hidden for seconds.
  if (canvas.dataset.fitted === undefined) {
    const held =
      first.calm > 0 &&
      view.scale === scale &&
      Math.abs(view.x - toX) < pixelTolerance &&
      Math.abs(view.y - toY) < pixelTolerance;
    first.calm = held ? first.calm + 1 : 1;
    first.start ||= performance.now();
    view.x = view.toX = toX;
    view.y = view.toY = toY;
    view.scale = view.toScale = view.rest = scale;
    place(f);
    for (const { element } of boxes) f.observe(element);
    if (first.calm >= 3 || performance.now() - first.start >= 250) canvas.dataset.fitted = '';
    else f.update();
    return;
  }
  // While playing, a move of less than 1 px is ignored. A popup is placed again a fraction of a
  // pixel away as the view moves, and following that would make the view tremble.
  if (
    eases &&
    f.playing.current &&
    view.toScale === scale &&
    Math.hypot(toX - view.toX, toY - view.toY) < 1
  )
    return;
  view.rest = scale;
  // A tile drawn smaller while playing eases back to its resting scale. Any other change of
  // scale, such as from the stage resizing, jumps.
  const zooms = scale !== view.toScale && view.zoomed;
  view.zoomed = false;
  view.toX = toX;
  view.toY = toY;
  if (eases && (view.toScale === scale || zooms)) {
    view.toScale = scale;
    startGlide(f);
  } else {
    view.toScale = scale;
    jump(f);
  }
  canvas.dataset.fitted = '';
  for (const { element } of boxes) f.observe(element);
}
