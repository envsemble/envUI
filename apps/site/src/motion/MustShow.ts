/*
 * What a playing tile keeps in view (fit/useFit.ts): the elements its animation acts on. A
 * pointer's script names them itself, every element it moves to, types into or presses keys on
 * (usePointer in PointerPlayback.ts), and what they open shows as it opens. A tile whose animation acts on
 * something its script doesn't name, such as a row a timeline changes, names it with
 * `useMustShow` (Playback.tsx):
 *
 *     useMustShow('.env-list-item:nth-child(4)', '.env-badge');
 *
 * As the tile starts playing, its view is drawn out once, no smaller than the gallery's least
 * scale, so that every one of them that is there, and what the last time it played showed, is in
 * the stage; it moves again only where something larger opens. What a script moves to counts in a
 * popup, as the view pans to the rest as the pointer heads there; what `useMustShow` names counts
 * anywhere, such as a panel that opens in place.
 */
import type { Aim } from '../fit/FitKind';

/** A stage's named selectors, and whether they count outside its popups too. */
interface Named {
  selectors: readonly string[];
  anywhere: boolean;
}

/** The selectors each stage's animations name, by the stage's root element. */
const named = new WeakMap<Element, Set<Named>>();

/**
 * Names selectors of a stage's elements its animation acts on, in its popups or, `anywhere`,
 * also outside them; returns the release.
 */
export function nameMustShow(root: Element, selectors: readonly string[], anywhere = false) {
  let set = named.get(root);
  if (!set) named.set(root, (set = new Set()));
  const own = set;
  const entry = { selectors, anywhere };
  own.add(entry);
  return () => void own.delete(entry);
}

/**
 * The selectors of the elements a stage's animations act on; with `anywhere`, only those that
 * count outside its popups too.
 */
export function mustShowOf(root: Element, anywhere = false): string[] {
  const entries = [...(named.get(root) ?? [])].filter((entry) => !anywhere || entry.anywhere);
  return [...new Set(entries.flatMap((entry) => entry.selectors))];
}

/*
 * A tile whose still shows what its animation acts on open, such as a select with its list open,
 * holds its view as it plays (useHeldView, Playback.tsx): it is framed once, at rest, on its still,
 * written to be its largest state, and what happens in it, the highlight moving, the list closing
 * and opening again, happens in place, with nothing drawn smaller or moved.
 */

/** How many of each stage's parts hold its view, by the stage's root element. */
const holding = new WeakMap<Element, number>();

/** How many of them lay it out from its window's top, by the stage's root element. */
const fromTop = new WeakMap<Element, number>();

/**
 * Holds a stage's view while it plays, and with `top`, lays it out from its window's top, so what
 * it adds as it plays, such as a list's next item, grows below what stays; returns the release.
 */
export function holdView(root: Element, top = false) {
  holding.set(root, (holding.get(root) ?? 0) + 1);
  if (top) fromTop.set(root, (fromTop.get(root) ?? 0) + 1);
  return () => {
    holding.set(root, (holding.get(root) ?? 1) - 1);
    if (top) fromTop.set(root, (fromTop.get(root) ?? 1) - 1);
  };
}

/** Whether a stage's view holds while it plays. */
export const holdsView = (root: Element) => (holding.get(root) ?? 0) > 0;

/** Whether a stage lays out from its window's top (holdView). */
export const holdsFromTop = (root: Element) => (fromTop.get(root) ?? 0) > 0;

/*
 * Where a playing tile's pointer is heading (usePointer, PointerPlayback.ts): the point of its current move,
 * or of the last it made, as an element's selector and fractions of its box. A tile's view pans to
 * keep it in the stage, so what the pointer goes to, and presses there, is in view before the press
 * (useFit.ts). Each change is announced to the stage's root as a `headingEvent`.
 */

/** Where each stage's pointer is heading, by the stage's root element. */
const headings = new WeakMap<Element, Aim>();

/** The event a stage's root hears as its pointer heads somewhere else. */
export const headingEvent = 'catalogue-heading';

/** Says where a stage's pointer is heading, or with null that it heads nowhere. */
export function headFor(root: Element, heading: Aim | null) {
  const was = headings.get(root) ?? null;
  if (was === heading) return;
  if (
    was &&
    heading &&
    was.selector === heading.selector &&
    was.x === heading.x &&
    was.y === heading.y
  )
    return;
  if (heading === null) headings.delete(root);
  else headings.set(root, heading);
  root.dispatchEvent(new Event(headingEvent));
}

/** Where a stage's pointer is heading, if anywhere. */
export const headingOf = (root: Element) => headings.get(root) ?? null;

/*
 * Every point a stage's pointer heads to over its script, in its order: a tile's still is framed
 * as its play is, with each of them in view that fits, so the pointer coming in moves nothing
 * (useFit.ts).
 */

/** The points each stage's pointer heads to, by the stage's root element. */
const courses = new WeakMap<Element, Set<readonly Aim[]>>();

/** Names the points a stage's pointer heads to, in order; returns the release. */
export function nameCourse(root: Element, points: readonly Aim[]) {
  let set = courses.get(root);
  if (!set) courses.set(root, (set = new Set()));
  const own = set;
  own.add(points);
  return () => void own.delete(points);
}

/** The points a stage's pointer heads to over its script, in order. */
export const courseOf = (root: Element): Aim[] => [...(courses.get(root) ?? [])].flat();
