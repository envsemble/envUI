import { roundToHundredth } from '../../../internal/dom/lengths.js';

const swellReachInEntries = 2.5;
const bulgeRoundnessAboveBell = 3;
const halfSwellDistanceInEntries = 0.9;
const swellFalloff = halfSwellDistanceInEntries / Math.LN2 ** (1 / bulgeRoundnessAboveBell);
/**
 * How thin the shape runs away from the reader's place, as a share of its fullest.
 * @internal
 */
export const waveThin = 0.1;
const hoverSwellShareOfPlace = 0.4;
const hoverReachInEntries = 0.8;
const edgeStepPx = 2;

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

function smoothBell(distance: number): number {
  const d = Math.min(1, Math.abs(distance));
  return Math.cos((d * Math.PI) / 2) ** 2;
}

const swellAtReach = Math.exp(-((swellReachInEntries / swellFalloff) ** bulgeRoundnessAboveBell));
function swellAroundPlace(distance: number): number {
  const fall = Math.exp(-(Math.abs(distance / swellFalloff) ** bulgeRoundnessAboveBell));
  return Math.max(0, (fall - swellAtReach) / (1 - swellAtReach));
}

/**
 * How tall the bulge is in a list of so many entries, as a share of its height in a long one: in a
 * short list, shorter, so the thin stroke still runs beside some of it.
 * @internal
 */
export function waveReach(count: number): number {
  return Math.min(1, Math.max(0.85, (count - 1) / 6));
}

function fractionalEntryAt(anchors: readonly number[], y: number): number {
  const count = anchors.length;
  if (count === 0) return 0;
  if (count === 1) return 0;
  let index = 0;
  while (index < count - 2 && y > anchors[index + 1]) index += 1;
  const from = anchors[index];
  const to = anchors[index + 1];
  return to > from ? index + (y - from) / (to - from) : index;
}

const footShareOfFullest = 0.03;
const swellFootInEntries =
  swellFalloff * Math.log(1 / footShareOfFullest) ** (1 / bulgeRoundnessAboveBell);
const roundEndRoomInEntries = 0.12;
const bulgeDriftShareOfMissingRoom = 0.3;
const smallestBulgeShare = 0.3;

function scaleToTaperWholeBetweenEnds(before: number, after: number, foot: number): number {
  const room = Math.min(before, after) - roundEndRoomInEntries;
  return Math.min(1, Math.max(smallestBulgeShare, room / foot));
}

/**
 * How far the shape swells at a fractional entry index, from 0 to 1: 1 at the reader's place, half
 * 0.9 entries away and nothing two and a half away, and shorter by `reach` in a short list; with a
 * smaller swell at each entry under the pointer, by how far its own has grown (`hovers`, from 0 to
 * 1 per entry). Near either of the shape's `ends`, the bulge is drawn smaller and a little toward
 * the middle, so it tapers whole before the end.
 * @internal
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
    const foot = swellFootInEntries * reach;
    const missingRoom = (room: number, foot: number) =>
      Math.max(0, foot + roundEndRoomInEntries - room);
    const at =
      place +
      bulgeDriftShareOfMissingRoom *
        (missingRoom(place - start, foot) - missingRoom(end - place, foot));
    const fit = Math.min(
      scaleToTaperWholeBetweenEnds(at - start, Infinity, foot),
      scaleToTaperWholeBetweenEnds(Infinity, end - at, foot),
    );
    swell = fit * swellAroundPlace((index - at) / (reach * fit));
  }
  for (let entry = 0; entry < hovers.length; entry += 1) {
    const amount = hovers[entry];
    if (amount <= 0) continue;
    const spread =
      hoverReachInEntries *
      scaleToTaperWholeBetweenEnds(entry - start, end - entry, hoverReachInEntries);
    const hover = amount * hoverSwellShareOfPlace * smoothBell((index - entry) / spread);
    swell = mergeLikeTwoDropsRunningTogether(swell, hover);
  }
  return swell;
}

const mergeLikeTwoDropsRunningTogether = (swell: number, hover: number) =>
  swell + hover - Math.min(1, swell) * hover;

const sectionShareBeforeMovingOn = 0.5;

/**
 * Where the shape swells for a reading position, a fractional section index: on the current
 * section's entry for the first part of the section, then gliding on smoothly to the next entry, to
 * arrive just as that section becomes current, so the swell and the current entry stay together.
 */
export function wavePlace(position: number): number {
  const index = Math.floor(position);
  const progress = Math.min(
    1,
    Math.max(0, (position - index - sectionShareBeforeMovingOn) / (1 - sectionShareBeforeMovingOn)),
  );
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

function roundEndRadiusWhereShapeIsAsWide(
  width: (y: number) => number,
  end: number,
  inward: 1 | -1,
  room: number,
) {
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
  const singleEntryIsAllBulge = anchors.length <= 1;
  const endsInEntries = singleEntryIsAllBulge
    ? ([-Infinity, Infinity] as const)
    : ([fractionalEntryAt(anchors, top), fractionalEntryAt(anchors, bottom)] as const);
  const width = (y: number) => {
    const swell = swellAt(fractionalEntryAt(anchors, y), place, hovers, reach, endsInEntries);
    return full * (waveThin + (1 - waveThin) * swell);
  };
  const room = (bottom - top) / 2;
  const startRadius = roundEndRadiusWhereShapeIsAsWide(width, top, 1, room);
  const endRadius = roundEndRadiusWhereShapeIsAsWide(width, bottom, -1, room);
  const from = top + startRadius;
  const to = bottom - endRadius;
  const edge: [number, number][] = [];
  for (let y = from; y < to + edgeStepPx; y += edgeStepPx) {
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
