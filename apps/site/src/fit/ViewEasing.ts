/*
 * A picture's view and how it moves to where its fit places it (useFit.ts): at once until it
 * shows, then easing there, in the slow motion token on the standard easing. The view is this
 * file's: only it writes `view`, where the fit asks it to go (glideTo, settle).
 */
import { prefersReducedMotion } from '@envui-internal/internal/reducedMotion';
import { rootEasingFunction, rootMotionDuration } from '../motion/RootMotionTokens';
import { place } from './FitDraw';
import type { Seen } from './FitMeasure';
import type { Fitting } from './useFit';

type Point = [x: number, y: number, scale: number];

/** A glide: from where the view was to where it goes, when it started and how long it takes. */
interface Course {
  from: Point;
  to: Point;
  start: number;
  length: number;
}

/**
 * The view: where the canvas is and the scale it is drawn at, and where it eases to (glide), a
 * target that moves as the picture changes followed on the way. `rest` is the scale it is fitted
 * at resting, `zoomed` whether it is drawn smaller than that as it plays, or on its way back, and
 * `frame` the glide's next frame.
 */
export interface View extends Target {
  x: number;
  y: number;
  scale: number;
  rest: number;
  frame: number;
  /** The glide the view is on, and its easing. */
  course: Course | null;
  ease: (time: number) => number;
  /**
   * Before it shows, the frames its fit has held where it is, and when it was first fitted: a
   * popup is placed by its style a frame or two after it opens, and a picture shown before then
   * would glide to it as it fades in.
   */
  first: { calm: number; start: number };
}

/** Where the view goes: the point it centres and the scale, and whether that is drawn out smaller. */
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
 * The glide from where the view is, `at`, to `to`, at the time `now`. A target that moves on the
 * way, as a tile's popups open and are placed, is taken up from where the view is then, the
 * glide's time left kept, so the view doesn't stop and start again: only near its end does it
 * start a glide of its own to the new place.
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
  // Late in a glide, a new one; before then, the same, bent to the new place: from a start that
  // puts the view where it is now at this point of the curve.
  if (share > 0.85) return { from: at, to, start: now, length };
  return {
    ...course,
    to,
    from: at.map((value, index) => (value - to[index]! * share) / (1 - share)) as Point,
  };
}

/** Where a glide has the view at the time `now`, and whether it has settled there.
 * @internal
 */
export function glideAt(course: Course, now: number, ease: (time: number) => number) {
  const share = ease((now - course.start) / course.length);
  const { from, to } = course;
  return {
    at: [
      from[0] + (to[0] - from[0]) * share,
      from[1] + (to[1] - from[1]) * share,
      from[2] + (to[2] - from[2]) * share,
    ] as Point,
    settled: now - course.start >= course.length,
  };
}

/** One frame of the view's glide to where it goes, which asks for the next until it settles. */
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
  // Still again at rest, it looks once more at where its popups are placed now (holdsFrame).
  if (settled && !f.playing.current) f.update();
}

/** Starts the view's glide where it isn't on one already. */
function startGlide(f: Fitting) {
  if (f.view.frame) return;
  f.view.course = null;
  f.view.frame = requestAnimationFrame((time) => glide(f, time));
}

/** Places the view where it goes at once, ending any glide. */
function jump(f: Fitting) {
  const { view } = f;
  cancelAnimationFrame(view.frame);
  view.frame = 0;
  view.x = view.toX;
  view.y = view.toY;
  view.scale = view.toScale;
  place(f);
}

/**
 * Eases the view to a playing tile's new target, or with motion reduced, places it there at once.
 */
export function glideTo(f: Fitting, { toX, toY, toScale, zoomed }: Target) {
  Object.assign(f.view, { toX, toY, toScale, zoomed });
  if (prefersReducedMotion()) jump(f);
  else startGlide(f);
}

/**
 * Places the view at a scale and a point, `toX` and `toY`: until the picture shows, at once, and
 * from then on, in place, easing there.
 */
export function settle(
  f: Fitting,
  { scale, toX, toY }: { scale: number; toX: number; toY: number },
  { boxes }: Pick<Seen, 'boxes'>,
) {
  const { canvas, view } = f;
  const { first } = view;
  // A tile in place eases to where it is fitted next; anything else is placed at once.
  const eases = f.kind.tile && canvas.dataset.fitted !== undefined && !prefersReducedMotion();
  // Until it shows, it is placed at once, and shows only once its place has held for a few
  // frames, or after a quarter of a second, whatever is still moving, such as a popup placed again
  // against the stage's edges as the view moves: it appears in place, as every picture does, by
  // fading in. A quarter of a second, not a count of frames: on a busy page, as a gallery is while
  // its tiles load, frames come slowly, and a count would keep it hidden for seconds.
  if (canvas.dataset.fitted === undefined) {
    const held =
      first.calm > 0 &&
      view.scale === scale &&
      Math.abs(view.x - toX) < 0.5 &&
      Math.abs(view.y - toY) < 0.5;
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
  // It follows only a change of a pixel or more: a popup is placed again as the view moves, a
  // fraction away, which would move the view again, in a tremble.
  if (
    eases &&
    f.playing.current &&
    view.toScale === scale &&
    Math.hypot(toX - view.toX, toY - view.toY) < 1
  )
    return;
  view.rest = scale;
  // Drawn smaller as it played, it eases back to its still's scale, unless motion is reduced; any
  // other change of scale, such as the stage's, is placed at once.
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
