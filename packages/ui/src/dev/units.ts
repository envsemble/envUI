// Lengths for the readout: rem as the reader's unit, window classes by width.

/** One of Material's window classes: a range of widths at which arrangement may change. */
export type WindowClass = 'compact' | 'medium' | 'expanded' | 'large';

/**
 * The window classes by the width in rem where each begins: compact below 37.5, medium below 52.5,
 * expanded below 75 and large from 75 (600, 840 and 1200 px at a 16 px root font).
 */
export const windowClasses: readonly { name: WindowClass; from: number }[] = [
  { name: 'compact', from: 0 },
  { name: 'medium', from: 37.5 },
  { name: 'expanded', from: 52.5 },
  { name: 'large', from: 75 },
];

/** The window class of a width in rem. */
export function windowClassOf(widthRem: number): WindowClass {
  let current: WindowClass = 'compact';
  for (const windowClass of windowClasses)
    if (widthRem >= windowClass.from) current = windowClass.name;
  return current;
}

/** A number rounded to two decimals, without a trailing zero. */
export const round = (value: number) => Math.round(value * 100) / 100;

/** A length in px as rem, rounded: 24 px at a 16 px root is 1.5. */
export const toRem = (px: number, rootPx: number) => round(px / rootPx);

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

/** The root font size in px: what 1 rem is. */
export function rootFontPx(): number {
  if (typeof document === 'undefined') return 16;
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}
