/*
 * Turns the points a tile's pointer heads to (StageScript, FitKind.ts) into boxes of its canvas
 * that the fit keeps in view (useFit.ts). At rest, the still is framed on them the way the play
 * frames them; while playing, the view follows the current one.
 */
import { remPixels } from '../shared/Lengths';
import { rowSelector } from './FitDraw';
import { frameOnCourse, type Box } from './FitGeometry';
import type { Aim, StageScript } from './FitKind';
import { inkOf, partOf } from './PaintedBoxes';

/**
 * The box of the canvas, in its own px, that a point the pointer heads to stands for, or null
 * when its element is not visible.
 *
 * It is the row that holds the aimed element when there is one, such as a list's row around its
 * link, so the crop shows the row whole instead of hiding it past its bottom (trimRows); else the
 * element itself. When that box is larger than a row (over 6 rem tall or 18 rem wide), such as a
 * panel's content, only a stretch around the aimed point counts.
 */
function aimBox(canvas: HTMLElement, script: StageScript, aim: Aim): Box | null {
  const element = script.aimed(aim.selector);
  if (!element?.checkVisibility()) return null;
  const row = element.closest(rowSelector);
  const box = partOf(row && canvas.contains(row) ? row : element, canvas);
  const reach = 3 * remPixels();
  if (box.bottom - box.top <= 2 * reach && box.right - box.left <= 6 * reach) return box;
  const own = partOf(element, canvas);
  const x = own.left + (own.right - own.left) * aim.x;
  const y = own.top + (own.bottom - own.top) * aim.y;
  return {
    left: Math.max(box.left, x - reach),
    right: Math.min(box.right, x + reach),
    top: Math.max(box.top, y - reach / 2),
    bottom: Math.min(box.bottom, y + reach / 2),
  };
}

/** The box (aimBox) of where a playing tile's pointer is heading now, or null. */
export function heading(canvas: HTMLElement, script: StageScript): Box | null {
  return script.heading ? aimBox(canvas, script, script.heading) : null;
}

/**
 * The points of the pointer's course that are visible at rest. For each: its box (aimBox), and
 * `y`, the height of the point the cursor's tip is at, in the canvas's own px.
 */
export function restingAims(canvas: HTMLElement, script: StageScript) {
  return script.course.flatMap((aim) => {
    const element = script.aimed(aim.selector);
    const box = aimBox(canvas, script, aim);
    if (!element || !box || box.right <= box.left || box.bottom <= box.top) return [];
    const own = partOf(element, canvas);
    return [{ box, y: own.top + (own.bottom - own.top) * aim.y }];
  });
}

/**
 * Frames a still the way its play frames it (frameOnCourse, FitGeometry.ts). The boxes, in order:
 * first what the script names to show anywhere, such as a panel it opens in place, by its text's
 * extent (inkOf); then each point of the pointer's course that is visible at rest.
 */
export function onCourse(
  stage: HTMLElement,
  canvas: HTMLElement,
  script: StageScript,
  toX: number,
  toY: number,
  scale: number,
) {
  const named = script.anywhere.flatMap((selector) => {
    const element = script.aimed(selector);
    return element?.checkVisibility() ? [inkOf(element, canvas)] : [];
  });
  const aims = script.course.map((aim) => aimBox(canvas, script, aim));
  return frameOnCourse([...named, ...aims], stage.clientWidth, stage.clientHeight, toX, toY, scale);
}
