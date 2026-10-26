/**
 * The shape beside the contents that marks the reader's place: one stroke down the list, at its
 * fullest at the reader's place and running thin a few entries away, like a brush's.
 */

/** How many entries away from the reader's place the shape still swells: three. */
export const waveSpread = 3;
/** How quickly the swell falls away: to half one entry from the reader's place, a sixteenth two. */
const waveFall = 1 / Math.sqrt(Math.LN2);
/** How thin the shape runs away from the reader's place, as a share of its fullest. */
export const waveThin = 0.2;
/** How far the entry under the pointer swells the shape, as a share of the reader's place. */
export const hoverSwell = 0.45;
/** How many entries away from the one under the pointer its swell reaches. */
const hoverSpread = 1;
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

/** A smooth bell: 1 at 0, easing to 0 at 1 and beyond, either way. */
export function bell(distance: number): number {
  const d = Math.min(1, Math.abs(distance));
  return Math.cos((d * Math.PI) / 2) ** 2;
}

/** The swell around the reader's place: a Gaussian bell that ends at the spread. */
const edge = Math.exp(-((waveSpread / waveFall) ** 2));
function swellAround(distance: number): number {
  const fall = Math.exp(-((distance / waveFall) ** 2));
  return Math.max(0, (fall - edge) / (1 - edge));
}

/**
 * The entry at a height, as a fractional index: between two entries' middles in proportion, and
 * beyond the first and last at the spacing next to them.
 */
export function entryAt(anchors: readonly number[], y: number): number {
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
 * How far the shape swells at a fractional entry index, from 0 to 1: 1 at the reader's place, half
 * one entry away and nothing three away; with a smaller swell at each entry under the pointer, by
 * how far its own has grown (`hovers`, from 0 to 1 per entry). Without a place, only those.
 */
export function swellAt(index: number, place: number | null, hovers: readonly number[]): number {
  let swell = place === null ? 0 : swellAround(index - place);
  for (let entry = 0; entry < hovers.length; entry += 1) {
    const amount = hovers[entry]!;
    if (amount <= 0) continue;
    swell = Math.max(swell, amount * hoverSwell * bell((index - entry) / hoverSpread));
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

const round = (value: number) => Math.round(value * 100) / 100;

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
  const width = (y: number) => {
    const swell = swellAt(entryAt(anchors, y), place, hovers);
    return full * (waveThin + (1 - waveThin) * swell);
  };
  // The ends are round, as wide as the shape there, and never overlap.
  const room = (bottom - top) / 2;
  const startRadius = Math.min(width(top) / 2, room);
  const endRadius = Math.min(width(bottom) / 2, room);
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
  const point = (x: number, y: number) => `${round(x)} ${round(y)}`;
  const end = edge.map(([y, across]) => `L${point(across, y)}`).join('');
  return (
    `M${point(0, from)}` +
    `A${round(startRadius)} ${round(startRadius)} 0 0 1 ${point(startRadius * 2, from)}` +
    end +
    `A${round(endRadius)} ${round(endRadius)} 0 0 1 ${point(0, to)}` +
    'Z'
  );
}

/**
 * The height of a fractional entry index, between two entries' middles in proportion: where the
 * shape changes from the passed sections' color to the coming ones', at its swell's apex.
 */
export function heightAt(anchors: readonly number[], index: number): number {
  if (anchors.length === 0) return 0;
  const below = Math.max(0, Math.min(anchors.length - 1, Math.floor(index)));
  const above = Math.min(anchors.length - 1, below + 1);
  const share = Math.max(0, Math.min(1, index - below));
  return anchors[below]! + (anchors[above]! - anchors[below]!) * share;
}
