import { roundToHundredth } from '../../internal/lengths.js';
/**
 * The shape beside the contents that marks the reader's place: one stroke down the list, swelling
 * into a broad bulge at the reader's place and running thin a few entries away, like a brush's.
 * As the place moves, the bulge stretches along the way it travels, leaning back like a drop, and
 * settles with a short wobble when it arrives: three springs, stepped every frame it moves.
 */

/** How many entries away from the reader's place the shape still swells: two and a half. */
const waveSpread = 2.5;
/** How round the bulge is: above 2, fuller at its middle and quicker at its foot than a bell. */
const waveRound = 3;
/** How quickly the swell falls away: to half 0.9 entries from the reader's place. */
const waveFall = 0.9 / Math.LN2 ** (1 / waveRound);
/** How thin the shape runs away from the reader's place, as a share of its fullest. */
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
  /** Where the shape starts: the top of the first entry's text. */
  top: number;
  /** Where it ends: the bottom of the last entry's text. */
  bottom: number;
  /** Its width at its fullest, which is also its box's: it runs down the box's start. */
  full: number;
}

/**
 * How the bulge is deformed as it moves, each from 0 at rest. `lean`, from -1 to 1, draws out its
 * upper side and draws in its lower one as it moves down, the other way as it moves up. `stretch`
 * makes it taller and thinner above 0, shorter and fuller below: squashed as it lands.
 */
export interface WaveMotion {
  lean: number;
  stretch: number;
}

const still: WaveMotion = { lean: 0, stretch: 0 };

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

/** How much a lean draws out the trailing side, and a stretch the bulge's height and width. */
const leanReach = 0.2;
const stretchReach = 0.18;
const stretchThin = 0.18;

/**
 * How tall the bulge is on each side of the reader's place, as a share of its height at rest, and
 * how wide at its fullest, for its motion.
 */
function deform({ lean, stretch }: WaveMotion) {
  const tall = Math.max(0.6, 1 + stretch * stretchReach);
  return {
    above: tall * Math.max(0.5, 1 + lean * leanReach),
    below: tall * Math.max(0.5, 1 - lean * leanReach),
    // Squashed, it grows a little past its fullest, into the gap before the labels.
    across: Math.min(1.05, Math.max(0.6, 1 - stretch * stretchThin)),
  };
}

/**
 * How tall the bulge is in a list of so many entries, as a share of its height in a long one: in a
 * short list, shorter, so the thin stroke still runs beside some of it.
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

/**
 * How far the shape swells at a fractional entry index, from 0 to 1, or a little more where it
 * lands: 1 at the reader's place, half 0.9 entries away and nothing two and a half away, drawn out
 * and in by its motion, and shorter by `reach` in a short list; with a smaller swell at each entry
 * under the pointer, by how far its own has grown (`hovers`, from 0 to 1 per entry), which merges
 * with the bulge where they meet. Without a place, only those.
 */
export function swellAt(
  index: number,
  place: number | null,
  hovers: readonly number[],
  motion: WaveMotion = still,
  reach = 1,
): number {
  let swell = 0;
  if (place !== null) {
    const { above, below, across } = deform(motion);
    const distance = index - place;
    swell = across * swellAround(distance / ((distance < 0 ? above : below) * reach));
  }
  for (let entry = 0; entry < hovers.length; entry += 1) {
    const amount = hovers[entry]!;
    if (amount <= 0) continue;
    // Blended, not the larger of the two: where a hovered entry's swell meets the bulge they merge
    // into one shape, with no dip between them, as two drops run together.
    const hover = amount * hoverSwell * bell((index - entry) / hoverSpread);
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

/** A value on a spring and how fast it moves, per second. */
export interface Spring {
  value: number;
  velocity: number;
}

/**
 * Moves a spring toward its target over `elapsed` seconds, in small steps so a long frame stays
 * steady: `frequency` in radians per second, `damping` 1 for no overshoot, less for a wobble, and
 * `push` a steady force on it over the time, per second squared, such as its carrier's inertia.
 */
export function springStep(
  spring: Spring,
  target: number,
  frequency: number,
  damping: number,
  elapsed: number,
  { push = 0 }: { push?: number } = {},
): void {
  const steps = Math.max(1, Math.ceil(elapsed / 0.004));
  const dt = elapsed / steps;
  for (let index = 0; index < steps; index += 1) {
    const pull =
      frequency * frequency * (target - spring.value) -
      2 * damping * frequency * spring.velocity +
      push;
    spring.velocity += pull * dt;
    spring.value += spring.velocity * dt;
  }
}

/** Whether a spring has come to rest on its target, within `near`. */
export function springAtRest(spring: Spring, target: number, near: number): boolean {
  return Math.abs(target - spring.value) < near && Math.abs(spring.velocity) < near * 10;
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
  motion: WaveMotion = still,
): string {
  const { anchors, top, bottom, full } = layout;
  if (anchors.length === 0 || !(bottom > top) || !(full > 0)) return '';
  const reach = waveReach(anchors.length);
  const width = (y: number) => {
    const swell = swellAt(entryAt(anchors, y), place, hovers, motion, reach);
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
