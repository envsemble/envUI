import { roundToHundredth } from '../../internal/dom/lengths.js';
/**
 * The shape beside the contents that marks the reader's place: one stroke down the list, swelling
 * into a broad bulge at the reader's place and running thin a few entries away, like a brush's.
 * It keeps its shape as the place moves, gliding there (`glideTo` and `glideStep`). At the list's
 * first and last entries it stays whole: smaller, so it tapers before the shape ends.
 */

/** How many entries away from the reader's place the shape still swells: two and a half. */
const waveSpread = 2.5;
/** How round the bulge is: above 2, fuller at its middle and quicker at its foot than a bell. */
const waveRound = 3;
/** How quickly the swell falls away: to half 0.9 entries from the reader's place. */
const waveFall = 0.9 / Math.LN2 ** (1 / waveRound);
/**
 * How thin the shape runs away from the reader's place, as a share of its fullest.
 * @internal Exported for tests/library/source/TableOfContents.test.ts.
 */
export const waveThin = 0.1;
/** How far the entry under the pointer swells the shape, as a share of the reader's place. */
const hoverSwell = 0.4;
/** How many entries away from the one under the pointer its swell reaches. */
const hoverSpread = 0.8;
/** How finely the shape's edges are drawn, in px. */
const step = 2;

/** Where the entries sit beside the shape, in px from the top of its box. */
export interface WaveLayout {
  /** The middle of each entry, in reading order. */
  anchors: readonly number[];
  /** Where the shape starts: above the first entry, by the room its box leaves there. */
  top: number;
  /** Where it ends: below the last entry, by the room there. */
  bottom: number;
  /** Its width at its fullest, which is also its box's: it runs down the box's start. */
  full: number;
}

/** A smooth bell: 1 at 0, easing to 0 at 1 and beyond, either way. */
function bell(distance: number): number {
  const d = Math.min(1, Math.abs(distance));
  return Math.cos((d * Math.PI) / 2) ** 2;
}

/** The swell around the reader's place: a rounded bell that ends at the spread. */
const edge = Math.exp(-((waveSpread / waveFall) ** waveRound));
function swellAround(distance: number): number {
  const fall = Math.exp(-(Math.abs(distance / waveFall) ** waveRound));
  return Math.max(0, (fall - edge) / (1 - edge));
}

/**
 * How tall the bulge is in a list of so many entries, as a share of its height in a long one: in a
 * short list, shorter, so the thin stroke still runs beside some of it.
 * @internal Exported for tests/library/source/TableOfContents.test.ts.
 */
export function waveReach(count: number): number {
  return Math.min(1, Math.max(0.85, (count - 1) / 6));
}

/**
 * The entry at a height, as a fractional index: between two entries' middles in proportion, and
 * beyond the first and last at the spacing next to them.
 */
function entryAt(anchors: readonly number[], y: number): number {
  const count = anchors.length;
  if (count === 0) return 0;
  if (count === 1) return 0;
  let index = 0;
  while (index < count - 2 && y > anchors[index + 1]!) index += 1;
  const from = anchors[index]!;
  const to = anchors[index + 1]!;
  return to > from ? index + (y - from) / (to - from) : index;
}

/** How far a swell reaches either way, in entries: past it, under 3% of its fullest. */
const waveFoot = waveFall * Math.log(1 / 0.03) ** (1 / waveRound);
/** How much room a swell leaves before the shape's end for the thin stroke's round end, in entries. */
const endTip = 0.12;
/** How far toward the list's middle the bulge moves to fit, as a share of the room it lacks. */
const endDrift = 0.3;
/** The smallest the bulge is drawn to fit, as a share of its size. */
const endLeast = 0.3;

/**
 * How large a swell is drawn to fit between the shape's ends, `before` and `after` entries away on
 * either side, when it would reach `foot` entries: 1 with room to spare, smaller as an end comes
 * closer, so it tapers whole before the end rather than being cut off by it.
 */
function fitBetween(before: number, after: number, foot: number): number {
  const room = Math.min(before, after) - endTip;
  return Math.min(1, Math.max(endLeast, room / foot));
}

/**
 * How far the shape swells at a fractional entry index, from 0 to 1: 1 at the reader's place, half
 * 0.9 entries away and nothing two and a half away, and shorter by `reach` in a short list; with a
 * smaller swell at each entry under the pointer, by how far its own has grown (`hovers`, from 0 to
 * 1 per entry), which merges with the bulge where they meet. Without a place, only those. Near
 * either of the shape's `ends`, fractional indexes, the bulge is drawn smaller, the same shape, and
 * a little toward the middle, so it tapers whole before the end; a swell under the pointer, shorter.
 * @internal Exported for tests/library/source/TableOfContents.test.ts.
 */
export function swellAt(
  index: number,
  place: number | null,
  hovers: readonly number[],
  reach = 1,
  ends: readonly [number, number] = [-Infinity, Infinity],
): number {
  const [start, end] = ends;
  let swell = 0;
  if (place !== null) {
    const foot = waveFoot * reach;
    // Where the bulge would reach past an end, it moves a little away from it, then fits the rest.
    const short = (room: number, foot: number) => Math.max(0, foot + endTip - room);
    const at = place + endDrift * (short(place - start, foot) - short(end - place, foot));
    const fit = Math.min(
      fitBetween(at - start, Infinity, foot),
      fitBetween(Infinity, end - at, foot),
    );
    swell = fit * swellAround((index - at) / (reach * fit));
  }
  for (let entry = 0; entry < hovers.length; entry += 1) {
    const amount = hovers[entry]!;
    if (amount <= 0) continue;
    const spread = hoverSpread * fitBetween(entry - start, end - entry, hoverSpread);
    // Blended, not the larger of the two: where a hovered entry's swell meets the bulge they merge
    // into one shape, with no dip between them, as two drops run together.
    const hover = amount * hoverSwell * bell((index - entry) / spread);
    swell = swell + hover - Math.min(1, swell) * hover;
  }
  return swell;
}

/** How far the reader is into a section before the shape starts on to the next, as a share. */
const dwell = 0.5;

/**
 * Where the shape swells for a reading position, a fractional section index: on the current
 * section's entry for the first part of the section, then gliding on smoothly to the next entry, to
 * arrive just as that section becomes current, so the swell and the current entry stay together.
 */
export function wavePlace(position: number): number {
  const index = Math.floor(position);
  const progress = Math.min(1, Math.max(0, (position - index - dwell) / (1 - dwell)));
  return index + progress * progress * (3 - 2 * progress);
}

/**
 * A value that glides to its target: from where it was when the target was set, at `start`, in ms,
 * eased over a duration, so it never passes the target and comes to rest on it.
 */
export interface Glide {
  value: number;
  from: number;
  to: number;
  start: number;
}

/** A glide resting at `value`. */
export function glideAt(value: number): Glide {
  return { value, from: value, to: value, start: 0 };
}

/**
 * Sets a glide's target at `now`. A step no larger than `follow` carries the glide's end along with
 * it, so a target that moves a little every frame, as the scroll does, is followed without a pause;
 * at rest the value takes it at once. A larger step glides there from where the value is drawn.
 */
export function glideTo(glide: Glide, target: number, now: number, follow = 0): void {
  if (target === glide.to) return;
  const resting = glide.value === glide.to;
  if (Math.abs(target - glide.to) <= follow) {
    glide.to = target;
    if (resting) glide.value = glide.from = target;
    return;
  }
  glide.from = glide.value;
  glide.to = target;
  glide.start = now;
}

/**
 * Draws a glide at `now`, over `duration` ms with `ease`, a function of progress: at its target at
 * once when the duration is 0. Whether it is still moving.
 */
export function glideStep(
  glide: Glide,
  now: number,
  duration: number,
  ease: (progress: number) => number,
): boolean {
  const progress = duration > 0 ? (now - glide.start) / duration : 1;
  if (progress >= 1 || glide.value === glide.to) {
    glide.value = glide.from = glide.to;
    return false;
  }
  glide.value = glide.from + (glide.to - glide.from) * ease(Math.max(0, progress));
  return true;
}

/**
 * The radius of the round end at `end`, from which the shape runs `inward` (1 down, -1 up): the one
 * at which the shape, that far in, is as wide as the end, found by halving; at most `room`.
 */
function roundEnd(width: (y: number) => number, end: number, inward: 1 | -1, room: number) {
  if (width(end + inward * room) >= 2 * room) return room;
  let low = 0;
  let high = room;
  for (let step = 0; step < 24; step += 1) {
    const radius = (low + high) / 2;
    if (width(end + inward * radius) > 2 * radius) low = radius;
    else high = radius;
  }
  return low;
}

/**
 * The shape's outline as SVG path data: straight down its start edge, at the box's start, and
 * swelling only toward its end, so at the reader's place it is as wide as the box; a point every
 * two pixels where its width changes, with round ends.
 */
export function wavePath(
  layout: WaveLayout,
  place: number | null,
  hovers: readonly number[],
): string {
  const { anchors, top, bottom, full } = layout;
  if (anchors.length === 0 || !(bottom > top) || !(full > 0)) return '';
  const reach = waveReach(anchors.length);
  // Where the shape ends, in entries, which the bulge fits between; a single entry's is all bulge.
  const ends =
    anchors.length > 1
      ? ([entryAt(anchors, top), entryAt(anchors, bottom)] as const)
      : ([-Infinity, Infinity] as const);
  const width = (y: number) => {
    const swell = swellAt(entryAt(anchors, y), place, hovers, reach, ends);
    return full * (waveThin + (1 - waveThin) * swell);
  };
  // The ends are round and never overlap. Each starts where the shape is as wide as the round end,
  // so the edge runs on into it: sized by the width at the very end, a bulge just short of it would
  // step in to the end's width and stand out as a second peak.
  const room = (bottom - top) / 2;
  const startRadius = roundEnd(width, top, 1, room);
  const endRadius = roundEnd(width, bottom, -1, room);
  const from = top + startRadius;
  const to = bottom - endRadius;
  // The end edge's heights and widths, leaving out points inside a run of one width.
  const edge: [number, number][] = [];
  for (let y = from; y < to + step; y += step) {
    const at = Math.min(y, to);
    const across = at === from ? startRadius * 2 : at === to ? endRadius * 2 : width(at);
    const last = edge.at(-1);
    const before = edge.at(-2);
    if (last && before && last[1] === across && before[1] === across) last[0] = at;
    else edge.push([at, across]);
    if (at === to) break;
  }
  const point = (x: number, y: number) => `${roundToHundredth(x)} ${roundToHundredth(y)}`;
  const end = edge.map(([y, across]) => `L${point(across, y)}`).join('');
  return (
    `M${point(0, from)}` +
    `A${roundToHundredth(startRadius)} ${roundToHundredth(startRadius)} 0 0 1 ${point(startRadius * 2, from)}` +
    end +
    `A${roundToHundredth(endRadius)} ${roundToHundredth(endRadius)} 0 0 1 ${point(0, to)}` +
    'Z'
  );
}
