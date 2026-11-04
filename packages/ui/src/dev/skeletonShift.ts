// The skeleton shift check: a surface as a skeleton and loaded should take the same room, so the
// page doesn't move when its content arrives. It toggles the skeleton's attribute, which the
// styles follow, measures every element in both states, and reports the ones that move or resize.

import { describeElement, isDevElement, resolveRoot } from './measure.js';
import type { LayoutProblem } from './model.js';
import { partClassOf } from './parts.js';
import { rootFontPx, toRem } from './units.js';
import { alignPulses } from '../foundations/SkeletonScope.js';

/** The attribute that marks a skeleton's root, which its styles follow. */
const skeletonAttribute = 'data-env-skeleton';

export interface SkeletonShiftOptions {
  /** How far, in px, an element may move or resize before it counts. @default 1 */
  tolerance?: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const rectOf = (element: Element): Rect => {
  const box = element.getBoundingClientRect();
  return { x: box.x, y: box.y, w: box.width, h: box.height };
};

/** An element as the check names it: its part class, its name or layout kind, else its tag. */
function labelOf(element: Element): string {
  const part = partClassOf(element);
  if (part) return part;
  const name = element.getAttribute('data-env-name');
  const kind = element.getAttribute('data-env-layout');
  if (kind) return name ? `${kind} "${name}"` : kind;
  return describeElement(element);
}

/** The labelled elements from the surface down to this one, such as `env-card > env-card-title`. */
function pathOf(element: Element, surface: Element): string {
  const labels: string[] = [];
  for (let at: Element | null = element; at; at = at.parentElement) {
    if (at === element || at === surface || partClassOf(at) || at.hasAttribute('data-env-layout'))
      labels.unshift(labelOf(at));
    if (at === surface) break;
  }
  return labels.join(' > ');
}

/**
 * The surfaces to toggle: the root when it is a skeleton or holds none, else the skeletons inside
 * it, the outermost of each.
 */
function surfacesOf(root: HTMLElement): HTMLElement[] {
  if (root.hasAttribute(skeletonAttribute)) return [root];
  const inside = Array.from(root.querySelectorAll<HTMLElement>(`[${skeletonAttribute}]`)).filter(
    (element) =>
      !isDevElement(element) && !element.parentElement?.closest(`[${skeletonAttribute}]`),
  );
  return inside.length > 0 ? inside : [root];
}

/**
 * Whether media has a definite width and height of its own, such as an avatar's picture, which
 * hold its place whatever loads: an aspect ratio tried on it changes nothing.
 */
function sizedByItsBox(element: HTMLElement): boolean {
  const before = element.getBoundingClientRect();
  if (before.width === 0 || before.height === 0) return false;
  const { style } = element;
  const kept = [style.getPropertyValue('aspect-ratio'), style.getPropertyPriority('aspect-ratio')];
  style.setProperty('aspect-ratio', '1 / 9', 'important');
  const after = element.getBoundingClientRect();
  if (kept[0]) style.setProperty('aspect-ratio', kept[0], kept[1]);
  else style.removeProperty('aspect-ratio');
  if (!element.getAttribute('style')) element.removeAttribute('style');
  return after.width === before.width && after.height === before.height;
}

/** The class of a skeleton's inert content wrapper, which has no box of its own. */
const wrapperClass = 'env-skeleton-content';

/** Elements whose children must be their own, which a skeleton makes inert as a whole. */
const unwrappable = new Set(['UL', 'OL', 'DL', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'SELECT']);

/**
 * The surface's content as a skeleton's component renders it: in its inert wrapper, or out of it.
 * The wrapper the surface had is put back where it was; one made for a loaded surface wraps all of
 * its content, as Surface's does.
 */
class Wrapper {
  private element: HTMLElement | null;
  private content: ChildNode[] = [];
  private readonly made: boolean;

  constructor(private readonly surface: HTMLElement) {
    this.element = surface.querySelector<HTMLElement>(`:scope > .${wrapperClass}`);
    this.made = this.element === null;
  }

  unwrap() {
    const element = this.element;
    if (!element?.isConnected) return;
    this.content = Array.from(element.childNodes);
    for (const node of this.content) this.surface.insertBefore(node, element);
    element.remove();
  }

  wrap() {
    if (this.element?.isConnected) return;
    if (!this.element) {
      if (unwrappable.has(this.surface.tagName)) return;
      this.element = document.createElement('div');
      this.element.className = wrapperClass;
      this.element.inert = true;
      this.content = Array.from(this.surface.childNodes);
    }
    const first = this.content.find((node) => node.parentNode === this.surface) ?? null;
    this.surface.insertBefore(this.element, first);
    this.element.append(...this.content);
  }

  /** Puts the surface back as it was: wrapped when it had a wrapper, else as it is. */
  restore(wasSkeleton: boolean) {
    if (wasSkeleton && !this.made) this.wrap();
    else this.unwrap();
  }
}

/** Measures every element of a surface, loaded and as a skeleton, and returns the differences. */
function shiftsOf(surface: HTMLElement, tolerance: number, rootPx: number): LayoutProblem[] {
  const elements = [surface, ...Array.from(surface.querySelectorAll('*'))].filter(
    (element) =>
      !isDevElement(element) &&
      !(element.parentElement === surface && element.matches(`.${wrapperClass}`)),
  );
  const wasSkeleton = surface.hasAttribute(skeletonAttribute);
  // As the components do: the attribute, which the styles follow, and the wrapper around the content.
  const wrapper = new Wrapper(surface);
  const measure = (skeleton: boolean) => {
    surface.toggleAttribute(skeletonAttribute, skeleton);
    if (skeleton) wrapper.wrap();
    else wrapper.unwrap();
    return elements.map(rectOf);
  };
  let loaded: Rect[];
  let skeleton: Rect[];
  try {
    loaded = measure(false);
    skeleton = measure(true);
  } finally {
    surface.toggleAttribute(skeletonAttribute, wasSkeleton);
    wrapper.restore(wasSkeleton);
    // Toggling started the root's pulse anew: put it back in step with the others.
    alignPulses();
  }
  const index = new Map(elements.map((element, at) => [element, at]));
  const rem = (px: number) => `${toRem(px, rootPx)}rem`;
  const found: [Element, LayoutProblem][] = [];
  elements.forEach((element, at) => {
    const before = skeleton[at];
    const after = loaded[at];
    const dw = after.w - before.w;
    const dh = after.h - before.h;
    // A move counts against the parent, so only the element that causes it is reported, not
    // everything after it.
    const parent = element === surface ? undefined : index.get(element.parentElement!);
    const dx =
      after.x - before.x - (parent === undefined ? 0 : loaded[parent].x - skeleton[parent].x);
    const dy =
      after.y - before.y - (parent === undefined ? 0 : loaded[parent].y - skeleton[parent].y);
    const resized = Math.abs(dw) > tolerance || Math.abs(dh) > tolerance;
    const moved = Math.abs(dx) > tolerance || Math.abs(dy) > tolerance;
    if (!resized && !moved) return;
    const changes: string[] = [];
    if (moved)
      changes.push(
        `moves ${[Math.abs(dx) > tolerance && `${rem(dx)} across`, Math.abs(dy) > tolerance && `${rem(dy)} down`].filter(Boolean).join(' and ')}`,
      );
    if (resized)
      changes.push(
        `changes from ${rem(before.w)}×${rem(before.h)} to ${rem(after.w)}×${rem(after.h)}`,
      );
    found.push([
      element,
      {
        rule: 'skeleton-shift',
        node: labelOf(element),
        path: pathOf(element, surface),
        message: `It ${changes.join(' and ')} when the skeleton loads, so the page shifts. Give the skeleton the size of what it stands for, such as a media element's aspect ratio or a part's skeleton length.`,
      },
    ]);
  });
  // An element that grows because something inside it grows isn't reported: only the deepest.
  const deepest = found.filter(
    ([element]) => !found.some(([other]) => other !== element && element.contains(other)),
  );
  const reported = new Set(deepest.map(([element]) => element));
  // Media without an aspect ratio has no size until it loads, so it moves everything after it.
  const media = elements
    .filter(
      (element) =>
        !reported.has(element) &&
        element.matches('img, video, iframe') &&
        getComputedStyle(element).aspectRatio === 'auto' &&
        !sizedByItsBox(element as HTMLElement),
    )
    .map(
      (element): LayoutProblem => ({
        rule: 'skeleton-shift',
        node: labelOf(element),
        path: pathOf(element, surface),
        message:
          'Media without an aspect ratio has no size until it loads. Declare one, with width and height attributes or aspect-ratio, so its skeleton holds its place.',
      }),
    );
  return [...deepest.map(([, problem]) => problem), ...media];
}

/**
 * The elements of a skeleton that move or resize when it loads, measured by toggling its
 * `data-env-skeleton` attribute and its content's inert wrapper, as the component does: the root when it is a skeleton surface or a surface to try as one,
 * else every skeleton inside it.
 */
export function skeletonShift(
  root?: Element | string,
  { tolerance = 1 }: SkeletonShiftOptions = {},
): LayoutProblem[] {
  const element = resolveRoot(root);
  const rootPx = rootFontPx();
  return surfacesOf(element).flatMap((surface) => shiftsOf(surface, tolerance, rootPx));
}
