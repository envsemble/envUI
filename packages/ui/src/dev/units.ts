// Lengths for the readout: rem as the reader's unit, and the window classes' starts in it.

import {
  windowClasses as windowClassStarts,
  type WindowClass,
} from '../foundations/windowClasses.js';
import { roundToHundredth } from '../internal/dom/lengths.js';

/** The window classes by the width in rem where each begins, from foundations/windowClasses.ts. */
export const windowClasses: readonly { name: WindowClass; from: number }[] = (
  Object.entries(windowClassStarts) as [WindowClass, string][]
).map(([name, from]) => ({ name, from: Number.parseFloat(from) }));

/** A length in px as rem, rounded: 24 px at a 16 px root is 1.5. */
export const toRem = (px: number, rootPx: number) => roundToHundredth(px / rootPx);

/**
 * A width the readout takes, in px: a number is px, a string is a CSS length in rem, em (as rem)
 * or px, such as '40rem'.
 */
export function toPx(value: number | string, rootPx: number): number {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`Not a width: ${value}.`);
    return value;
  }
  const match = /^\s*(\d*\.?\d+)\s*(rem|em|px)\s*$/.exec(value);
  if (!match)
    throw new RangeError(`Widths are px numbers or lengths such as "40rem"; got "${value}".`);
  return match[2] === 'px' ? Number(match[1]) : Number(match[1]) * rootPx;
}
