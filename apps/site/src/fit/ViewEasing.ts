import { prefersReducedMotion } from '../shared/ReducedMotion';
import { rootEasingFunction, rootMotionDuration } from '../shared/RootMotionTokens';
import { place } from './FitDraw';
import type { Seen } from './FitMeasure';
import type { Fitting } from './useFit';
import { pixelTolerance } from '../shared/Remeasure';

type Point = [x: number, y: number, scale: number];

const restartGlidePastShare = 0.85;
const calmFitsBeforeShown = 3;
const showAfterMs = 250;
const ignoredPlayingMovePx = 1;

interface Course {
  from: Point;
  to: Point;
  start: number;
  length: number;
}

export interface View extends Target {
  x: number;
  y: number;
  scale: number;
  rest: number;
  frame: number;
  course: Course | null;
  ease: (time: number) => number;
  first: { calm: number; start: number };
}

export interface Target {
  toX: number;
  toY: number;
  toScale: number;
  zoomed: boolean;
}

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

/** @internal */
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
  if (share > restartGlidePastShare) return { from: at, to, start: now, length };
  const back = (index: 0 | 1 | 2) => (at[index] - to[index] * share) / (1 - share);
  return { ...course, to, from: [back(0), back(1), back(2)] };
}

/** @internal */
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
  if (settled && !f.playing.current) f.update();
}

function startGlide(f: Fitting) {
  if (f.view.frame) return;
  f.view.course = null;
  f.view.frame = requestAnimationFrame((time) => glide(f, time));
}

function jump(f: Fitting) {
  const { view } = f;
  cancelAnimationFrame(view.frame);
  view.frame = 0;
  view.x = view.toX;
  view.y = view.toY;
  view.scale = view.toScale;
  place(f);
}

export function glideTo(f: Fitting, { toX, toY, toScale, zoomed }: Target) {
  Object.assign(f.view, { toX, toY, toScale, zoomed });
  if (prefersReducedMotion()) jump(f);
  else startGlide(f);
}

export function settle(
  f: Fitting,
  { scale, toX, toY }: { scale: number; toX: number; toY: number },
  { boxes }: Pick<Seen, 'boxes'>,
) {
  const { canvas, view } = f;
  const { first } = view;
  const eases = f.kind.tile && canvas.dataset.fitted !== undefined && !prefersReducedMotion();
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
    if (first.calm >= calmFitsBeforeShown || performance.now() - first.start >= showAfterMs)
      canvas.dataset.fitted = '';
    else f.update();
    return;
  }
  if (
    eases &&
    f.playing.current &&
    view.toScale === scale &&
    Math.hypot(toX - view.toX, toY - view.toY) < ignoredPlayingMovePx
  )
    return;
  view.rest = scale;
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
