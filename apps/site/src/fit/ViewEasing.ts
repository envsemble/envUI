/*
 * How a picture's view moves to where its fit places it (FitPicture.ts): at once until it shows,
 * then easing there, in the slow motion token on the standard easing. The view and its glide are
 * the fit's animation state (`view`, FitState.ts).
 */
import { prefersReducedMotion } from '../../../../packages/ui/src/internal/reducedMotion';
import { rootMotionDuration } from '../motion/RootMotionTokens';
import { place } from './FitDraw';
import type { Seen } from './FitMeasure';
import type { Fitting } from './FitState';

type Point = [x: number, y: number, scale: number];

/** A glide: from where the view was to where it goes, when it started and how long it takes. */
export interface Course {
  from: Point;
  to: Point;
  start: number;
  length: number;
}

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

/** Eases the view to where it goes, or with motion reduced, places it there at once. */
export function glideTo(f: Fitting) {
  if (prefersReducedMotion()) jump(f);
  else startGlide(f);
}

/**
 * Places the view at a scale and a point, `toX` and `toY`: until the picture shows, at once, and
 * from then on, in place, easing there. At rest, it keeps where it is framed, on the shape it was
 * measured as (hold).
 */
export function settle(
  f: Fitting,
  { scale, toX, toY }: { scale: number; toX: number; toY: number },
  { boxes, shape }: Pick<Seen, 'boxes' | 'shape'>,
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
    hold(f, { scale, toX, toY }, shape);
    for (const { element } of boxes) f.resize.observe(element);
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
  hold(f, { scale, toX, toY }, shape);
  canvas.dataset.fitted = '';
  for (const { element } of boxes) f.resize.observe(element);
}

/** At rest, keeps where the view is framed and on what, held from then on (holdsFrame). */
function hold(
  { playing, canvas, kept }: Fitting,
  at: { scale: number; toX: number; toY: number },
  shape: Seen['shape'],
) {
  if (playing.current || !shape) return;
  // Framed anew, it may follow its popups again (holdsFrame).
  if (!kept.follow.following) kept.follow.count = 0;
  kept.follow.following = false;
  kept.framed = { shape, ...at, cut: canvas.dataset.cut, fadeAt: kept.fadeAt };
}
