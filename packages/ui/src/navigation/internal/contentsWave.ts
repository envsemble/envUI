import { roundToHundredth } from '../../internal/lengths.js';
/**
 * The mark beside the contents that shows the reader's place: a thin track down the list and, on
 * it, a pill as tall as the current entry's text, both centred in their column. As the place moves,
 * the pill glides to its new entry on a spring and draws out behind it while it travels, then rests
 * beside the entry, the same shape above and below.
 */

/** How wide the track is, as a share of the pill's width. */
export const trackShare = 1 / 3;

/** Where the entries' text sits beside the mark, in px from the top of its box. */
export interface WaveLayout {
  /** The top and bottom of each entry's text, in reading order. */
  entries: readonly { top: number; bottom: number }[];
  /** The pill's width, which is also its box's. */
  full: number;
}

/** A value on a spring and how fast it moves, per second. */
export interface Spring {
  value: number;
  velocity: number;
}

/**
 * Moves a spring toward its target over `elapsed` seconds, in small steps so a long frame stays
 * steady: `frequency` in radians per second, and `damping` 1 for no overshoot, less for some.
 */
export function springStep(
  spring: Spring,
  target: number,
  frequency: number,
  damping: number,
  elapsed: number,
): void {
  const steps = Math.max(1, Math.ceil(elapsed / 0.004));
  const dt = elapsed / steps;
  for (let index = 0; index < steps; index += 1) {
    const pull =
      frequency * frequency * (target - spring.value) - 2 * damping * frequency * spring.velocity;
    spring.velocity += pull * dt;
    spring.value += spring.velocity * dt;
  }
}

/** Whether a spring has come to rest on its target, within `near`. */
export function springAtRest(spring: Spring, target: number, near: number): boolean {
  return Math.abs(target - spring.value) < near && Math.abs(spring.velocity) < near * 10;
}

/**
 * Where the pill runs, top and bottom, for a place given as a fractional entry index: beside that
 * entry's text, or in proportion between two entries' on the way from one to the other, drawn out
 * by `trail` entries behind it as it travels, down for a positive trail, up for a negative one,
 * never past the list.
 */
export function markExtent(
  layout: WaveLayout,
  place: number,
  trail = 0,
): { top: number; bottom: number } {
  const { entries } = layout;
  const last = entries.length - 1;
  const at = Math.min(last, Math.max(0, place));
  const index = Math.floor(at);
  const share = at - index;
  const from = entries[index]!;
  const to = entries[Math.min(last, index + 1)]!;
  let top = from.top + (to.top - from.top) * share;
  let bottom = from.bottom + (to.bottom - from.bottom) * share;
  // An entry's spacing, from the first entry's text to the last one's.
  const spacing =
    last > 0 ? (entries[last]!.bottom - entries[0]!.top) / (last + 1) : from.bottom - from.top;
  if (trail > 0) top -= trail * spacing;
  else bottom -= trail * spacing;
  return {
    top: Math.max(entries[0]!.top, top),
    bottom: Math.min(entries[last]!.bottom, bottom),
  };
}

/** A rounded rectangle as SVG path data, its corners as round as its narrower side allows. */
function capsule(x: number, y: number, width: number, height: number): string {
  const r = roundToHundredth(Math.min(width, height) / 2);
  const point = (px: number, py: number) => `${roundToHundredth(px)} ${roundToHundredth(py)}`;
  return (
    `M${point(x + r, y)}H${roundToHundredth(x + width - r)}` +
    `A${r} ${r} 0 0 1 ${point(x + width, y + r)}V${roundToHundredth(y + height - r)}` +
    `A${r} ${r} 0 0 1 ${point(x + width - r, y + height)}H${roundToHundredth(x + r)}` +
    `A${r} ${r} 0 0 1 ${point(x, y + height - r)}V${roundToHundredth(y + r)}` +
    `A${r} ${r} 0 0 1 ${point(x + r, y)}Z`
  );
}

/** The track's outline as SVG path data: from the first entry's text to the last one's. */
export function trackPath(layout: WaveLayout): string {
  const { entries, full } = layout;
  if (entries.length === 0 || !(full > 0)) return '';
  const width = full * trackShare;
  const top = entries[0]!.top;
  const bottom = entries[entries.length - 1]!.bottom;
  if (!(bottom > top)) return '';
  return capsule((full - width) / 2, top, width, bottom - top);
}

/** The pill's outline as SVG path data, or none without a place. */
export function markPath(layout: WaveLayout, place: number | null, trail = 0): string {
  const { entries, full } = layout;
  if (place === null || entries.length === 0 || !(full > 0)) return '';
  const { top, bottom } = markExtent(layout, place, trail);
  if (!(bottom > top)) return '';
  return capsule(0, top, full, bottom - top);
}
