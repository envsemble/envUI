import { remPixels } from '../shared/Lengths';
import { rowSelector } from './FitDraw';
import { frameOnCourse, type Box } from './FitGeometry';
import type { Aim, StageScript } from './FitKind';
import { inkOf, partOf } from './PaintedBoxes';

const aimReachRem = 3;

function aimBox(canvas: HTMLElement, script: StageScript, aim: Aim): Box | null {
  const element = script.aimed(aim.selector);
  if (!element?.checkVisibility()) return null;
  const row = element.closest(rowSelector);
  const box = partOf(row && canvas.contains(row) ? row : element, canvas);
  const reach = aimReachRem * remPixels();
  const rowSized = box.bottom - box.top <= 2 * reach && box.right - box.left <= 6 * reach;
  if (rowSized) return box;
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

export function heading(canvas: HTMLElement, script: StageScript): Box | null {
  return script.heading ? aimBox(canvas, script, script.heading) : null;
}

export function restingAims(canvas: HTMLElement, script: StageScript) {
  return script.course.flatMap((aim) => {
    const element = script.aimed(aim.selector);
    const box = aimBox(canvas, script, aim);
    if (!element || !box || box.right <= box.left || box.bottom <= box.top) return [];
    const own = partOf(element, canvas);
    return [{ box, y: own.top + (own.bottom - own.top) * aim.y }];
  });
}

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
