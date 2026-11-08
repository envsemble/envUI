/*
 * What a tile's pointer heads to over its script (MustShow.ts), as parts of its canvas the fit keeps
 * in view (useFit.ts): at rest, so its still is framed as its play is, and as it plays.
 */
import { courseOf, headingOf, mustShowOf, type Heading } from '../motion/MustShow';
import { aimedElement } from '../motion/PointerPlan';
import { remPixels } from '@envui-internal/internal/lengths';
import { rowSelector } from './Crop';
import { contain, join, margin, type Box } from './FitMath';
import { inkOf, partOf } from './PaintedBoxes';

/**
 * The part of the canvas a point the pointer heads to takes in: the element it aims at, or the row
 * it is in, such as a list's row around its link, so the crop shows it whole rather than hiding it
 * past its foot (trimRows); of an element taller than a row, such as a panel's content, only the
 * stretch around the point it aims at.
 */
function aimBox(canvas: HTMLElement, aim: Heading): Box | null {
  const element = aimedElement(canvas, aim.selector);
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

/** The part of the canvas a playing tile's pointer is heading to, in its own px (aimBox). */
export function heading(canvas: HTMLElement): Box | null {
  const aim = headingOf(canvas);
  return aim ? aimBox(canvas, aim) : null;
}

/**
 * Each point a tile's pointer heads to over its script that is there at rest: the part of the
 * canvas it takes in (aimBox), and the point its cursor's tip is at, in the canvas's own px.
 */
export function restingAims(canvas: HTMLElement) {
  return courseOf(canvas).flatMap((aim) => {
    const element = aimedElement(canvas, aim.selector);
    const box = aimBox(canvas, aim);
    if (!element || !box || box.right <= box.left || box.bottom <= box.top) return [];
    const own = partOf(element, canvas);
    return [{ box, y: own.top + (own.bottom - own.top) * aim.y }];
  });
}

/**
 * A still framed as its play is: each point its pointer heads to over its script that is there at
 * rest, in order, as many as fit together, kept in the stage as the play keeps them (heading), so
 * the pointer coming in and going moves nothing.
 */
export function onCourse(
  stage: HTMLElement,
  canvas: HTMLElement,
  toX: number,
  toY: number,
  scale: number,
) {
  const across = stage.clientWidth / 2 - 4;
  const down = stage.clientHeight / 2 - 4;
  let held: Box | null = null;
  // Whether the first is larger than the stage along an axis, so shown from its start.
  let fromStart = { x: false, y: false };
  // What the tile names anywhere (useMustShow), such as a panel it opens in place, as far as it
  // paints (inkOf), first.
  const named = mustShowOf(canvas, true).flatMap((selector) => {
    const element = aimedElement(canvas, selector);
    return element?.checkVisibility() ? [inkOf(element, canvas)] : [];
  });
  const aims = courseOf(canvas).map((aim) => aimBox(canvas, aim));
  for (const found of [...named, ...aims]) {
    if (!found || found.right <= found.left || found.bottom <= found.top) continue;
    // The first, larger than the stage, such as a divider as tall as its panes, shows from its
    // start, a margin from the stage's edge, as the play shows it (playFit), so the pointer coming
    // in moves nothing.
    let box = found;
    if (!held) {
      const right = found.left + (2 * (across - margin) - 0.5) / scale;
      const bottom = found.top + (2 * (down - margin) - 0.5) / scale;
      fromStart = { x: found.right > right, y: found.bottom > bottom };
      box = {
        ...found,
        right: Math.min(found.right, right),
        bottom: Math.min(found.bottom, bottom),
      };
    }
    const next: Box = join(held, box)!;
    if (
      (next.right - next.left) * scale > 2 * (across - margin) ||
      (next.bottom - next.top) * scale > 2 * (down - margin)
    )
      continue;
    held = next;
  }
  if (!held) return { toX, toY };
  return {
    toX: fromStart.x
      ? held.left * scale + across - margin
      : contain(toX, held.left * scale, held.right * scale, across),
    toY: fromStart.y
      ? held.top * scale + down - margin
      : contain(toY, held.top * scale, held.bottom * scale, down),
  };
}
