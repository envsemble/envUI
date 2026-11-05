/*
 * What a playing tile keeps in view (template/useFit.ts): the elements its animation acts on. A
 * pointer's script names them itself, every element it moves to, types into or presses keys on
 * (usePointer in Motion.tsx), and what they open shows as it opens. A tile whose animation acts on
 * something its script doesn't name, such as a row a timeline changes, names it with
 * `useMustShow` (Motion.tsx):
 *
 *     useMustShow('.env-list-item:nth-child(4)', '.env-badge');
 *
 * As the tile starts playing, its view is drawn out once, no smaller than the gallery's least
 * scale, so that every one of them that is there, and what the last time it played showed, is in
 * the stage; it moves again only where something larger opens.
 */

/** The selectors each preview's animations name, by the preview's root element. */
const named = new WeakMap<Element, Set<readonly string[]>>();

/** Names selectors of a preview's elements its animation acts on; returns the release. */
export function nameMustShow(root: Element, selectors: readonly string[]) {
  let set = named.get(root);
  if (!set) named.set(root, (set = new Set()));
  const own = set;
  own.add(selectors);
  return () => void own.delete(selectors);
}

/** The selectors of the elements a preview's animations act on. */
export function mustShowOf(root: Element): string[] {
  return [...new Set([...(named.get(root) ?? [])].flat())];
}

/*
 * A tile whose still shows what its animation acts on open, such as a select with its list open,
 * holds its view as it plays (useHeldView, Motion.tsx): it is framed once, at rest, on its still,
 * written to be its largest state, and what happens in it, the highlight moving, the list closing
 * and opening again, happens in place, with nothing drawn smaller or moved.
 */

/** How many of each preview's parts hold its view, by the preview's root element. */
const holding = new WeakMap<Element, number>();

/** Holds a preview's view while it plays; returns the release. */
export function holdView(root: Element) {
  holding.set(root, (holding.get(root) ?? 0) + 1);
  return () => void holding.set(root, (holding.get(root) ?? 1) - 1);
}

/** Whether a preview's view holds while it plays. */
export const holdsView = (root: Element) => (holding.get(root) ?? 0) > 0;

/*
 * Where a playing tile's pointer is heading (usePointer, Motion.tsx): the point of its current move,
 * or of the last it made, as an element's selector and fractions of its box. A tile's view pans to
 * keep it in the stage, so what the pointer goes to, and presses there, is in view before the press
 * (useFit.ts). Each change is announced to the preview's root as a `headingEvent`.
 */

/** A point the pointer heads to: an element, by its selector, and fractions of its box. */
export interface Heading {
  selector: string;
  x: number;
  y: number;
}

/** Where each preview's pointer is heading, by the preview's root element. */
const headings = new WeakMap<Element, Heading>();

/** The event a preview's root hears as its pointer heads somewhere else. */
export const headingEvent = 'catalogue-heading';

/** Says where a preview's pointer is heading, or with null that it heads nowhere. */
export function headFor(root: Element, heading: Heading | null) {
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

/** Where a preview's pointer is heading, if anywhere. */
export const headingOf = (root: Element) => headings.get(root) ?? null;
