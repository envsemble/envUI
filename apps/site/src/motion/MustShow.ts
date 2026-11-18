import type { Aim } from '../fit/FitKind';

interface Named {
  selectors: readonly string[];
  anywhere: boolean;
}

const named = new WeakMap<Element, Set<Named>>();

export function nameMustShow(root: Element, selectors: readonly string[], anywhere = false) {
  let set = named.get(root);
  if (!set) named.set(root, (set = new Set()));
  const own = set;
  const entry = { selectors, anywhere };
  own.add(entry);
  return () => void own.delete(entry);
}

export function mustShowOf(root: Element, anywhere = false): string[] {
  const entries = [...(named.get(root) ?? [])].filter((entry) => !anywhere || entry.anywhere);
  return [...new Set(entries.flatMap((entry) => entry.selectors))];
}

const holding = new WeakMap<Element, number>();

const fromTop = new WeakMap<Element, number>();

export function holdView(root: Element, top = false) {
  holding.set(root, (holding.get(root) ?? 0) + 1);
  if (top) fromTop.set(root, (fromTop.get(root) ?? 0) + 1);
  return () => {
    holding.set(root, (holding.get(root) ?? 1) - 1);
    if (top) fromTop.set(root, (fromTop.get(root) ?? 1) - 1);
  };
}

export const holdsView = (root: Element) => (holding.get(root) ?? 0) > 0;

export const holdsFromTop = (root: Element) => (fromTop.get(root) ?? 0) > 0;

const headings = new WeakMap<Element, Aim>();

export const headingEvent = 'catalogue-heading';

const sameAim = (a: Aim, b: Aim) => a.selector === b.selector && a.x === b.x && a.y === b.y;

export function headFor(root: Element, heading: Aim | null) {
  const was = headings.get(root) ?? null;
  if (was === heading) return;
  if (was && heading && sameAim(was, heading)) return;
  if (heading === null) headings.delete(root);
  else headings.set(root, heading);
  root.dispatchEvent(new Event(headingEvent));
}

export const headingOf = (root: Element) => headings.get(root) ?? null;

const courses = new WeakMap<Element, Set<readonly Aim[]>>();

export function nameCourse(root: Element, points: readonly Aim[]) {
  let set = courses.get(root);
  if (!set) courses.set(root, (set = new Set()));
  const own = set;
  own.add(points);
  return () => void own.delete(points);
}

export const courseOf = (root: Element): Aim[] => [...(courses.get(root) ?? [])].flat();
