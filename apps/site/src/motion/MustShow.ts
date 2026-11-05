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
